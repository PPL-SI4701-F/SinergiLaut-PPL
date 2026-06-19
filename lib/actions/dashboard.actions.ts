"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import { cookies } from "next/headers"

async function getE2EMock() {
  if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_E2E_TESTING !== 'true') return null
  try {
    const cookieStore = await cookies()
    return cookieStore.get('e2e-bypass-auth')?.value || null
  } catch {
    return null
  }
}

// Memverifikasi bahwa request berasal dari user dengan role admin.
// Dipanggil di awal setiap server action yang bersifat admin-only.
async function requireAdmin(): Promise<{ authorized: true; userId: string } | { authorized: false }> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { authorized: false }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") return { authorized: false }
  return { authorized: true, userId: user.id }
}

async function requireCommunityUser(userId: string): Promise<{ authorized: true } | { authorized: false }> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user || user.id !== userId) return { authorized: false }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "community") return { authorized: false }
  return { authorized: true }
}

// --- ADMIN DASHBOARD ---

export async function getAdminDashboardStats() {
  const isE2E = null
  if (isE2E) {
    return {
      totalCommunities: 5,
      verifiedCommunities: 3,
      totalUsers: 10,
      activeVolunteers: 5,
      activeActivities: 3,
      completedActivities: 2,
      totalActivities: 5,
      totalDonations: 1500000,
    }
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return null

  const adminSupabase = await createAdminClient()

  const [
    { count: totalCommunities },
    { count: verifiedCommunities },
    { count: totalUsers },
    { count: activeActivities },
    { count: completedActivities },
    { data: donationRows },
    { data: volunteerRows },
  ] = await Promise.all([
    adminSupabase.from("communities").select("*", { count: "exact", head: true }),
    adminSupabase.from("communities").select("*", { count: "exact", head: true }).eq("is_verified", true),
    adminSupabase.from("profiles").select("*", { count: "exact", head: true }),
    adminSupabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "published"),
    adminSupabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "completed"),
    adminSupabase.from("donations").select("amount").eq("type", "money").eq("status", "completed"),
    adminSupabase.from("volunteer_registrations").select("user_id").in("status", ["approved", "attended"]),
  ])

  const totalDonations = donationRows?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0
  const activeVolunteers = new Set(volunteerRows?.map(r => r.user_id)).size

  return {
    totalCommunities: totalCommunities || 0,
    verifiedCommunities: verifiedCommunities || 0,
    totalUsers: totalUsers || 0,
    activeVolunteers: activeVolunteers || 0,
    activeActivities: activeActivities || 0,
    completedActivities: completedActivities || 0,
    totalActivities: (activeActivities || 0) + (completedActivities || 0),
    totalDonations,
  }
}

export async function getPendingCommunities() {
  const isE2E = null
  if (isE2E) {
    if (isE2E === 'admin-empty') return []
    return [
      {
        id: "community-1",
        name: "Eco Ocean",
        description: "Melindungi ekosistem laut",
        verification_status: "pending",
        created_at: new Date().toISOString()
      }
    ] as any
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return []

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("communities")
    .select("*")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching pending communities:", error)
  return data || []
}

export async function getPendingActivities() {
  const isE2E = null
  if (isE2E) {
    if (isE2E === 'admin-empty') return []
    return [
      {
        id: "activity-1",
        title: "Pending Activity 1",
        category: "Penanaman Mangrove",
        funding_goal: 5000000,
        status: "pending_review",
        start_date: new Date().toISOString(),
        allow_item_donation: true,
        community: { name: "Eco Ocean" }
      },
      {
        id: "activity-2",
        title: "Pending Activity 2",
        category: "Pembersihan Pantai",
        funding_goal: 10000000,
        status: "pending_review",
        start_date: new Date().toISOString(),
        allow_item_donation: false,
        community: { name: "Eco Ocean" }
      }
    ] as any
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return []

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("activities")
    .select("*, community:communities(name)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching pending activities:", error)
  return data || []
}

export async function getOngoingActivities() {
  const isE2E = null
  if (isE2E) {
    return [
      {
        id: "activity-3",
        title: "Ongoing Activity 1",
        category: "Pembersihan Pantai",
        funding_goal: 10000000,
        funding_raised: 2000000,
        volunteer_quota: 50,
        volunteer_count: 5,
        status: "published",
        start_date: new Date().toISOString(),
        community: { name: "Eco Ocean" }
      }
    ] as any
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return []

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("activities")
    .select("*, community:communities(name)")
    .in("status", ["published", "completed"])
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching ongoing activities:", error)
  return data || []
}

export async function getPendingReports() {
  const isE2E = null
  if (isE2E) {
    if (isE2E === 'admin-empty') return []
    return [
      {
        id: "report-1",
        title: "Laporan Pembersihan Pantai",
        status: "submitted",
        created_at: new Date().toISOString(),
        activity: { title: "Pembersihan Pantai", community: { name: "Sea Guardians" } }
      }
    ] as any
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return []

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("reports")
    .select("*, community:communities(name), activity:activities(title)")
    .eq("status", "submitted")
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching pending reports:", error)
  return data || []
}

export async function getAllCommunities() {
  const isE2E = null
  if (isE2E) {
    return [
      { id: 'community-1', name: 'Komunitas Laut Lestari', location: 'Jakarta', logo_url: null, is_verified: true, is_suspended: false },
      { id: 'community-2', name: 'Komunitas Mangrove Asri', location: 'Surabaya', logo_url: null, is_verified: false, is_suspended: true },
      { id: 'community-3', name: 'Komunitas Pesisir Hijau', location: 'Bali', logo_url: null, is_verified: false, is_suspended: false },
    ]
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return []

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("communities")
    .select("*, verifications:community_verifications(*), owner:profiles(email)")
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching all communities:", error)

  // enrich with activity counts using a raw mapping if needed, or fallback.
  // For admin dashboard UI purposes, we'll map fields safely
  return data || []
}

// --- ADMIN MODERATION ACTIONS ---

export async function approveCommunityAction(id: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: community, error } = await adminSupabase
    .from("communities")
    .update({ is_verified: true, verification_status: "approved" })
    .eq("id", id)
    .select("name, owner_id")
    .single()
  if (error) return { success: false, error: error.message }
  // Kirim notifikasi ke pemilik komunitas
  if (community?.owner_id) {
    await createNotification(
      community.owner_id,
      "Komunitas Disetujui",
      `Komunitas "${community.name}" Anda telah diverifikasi dan disetujui oleh admin. Sekarang Anda dapat mulai membuat kegiatan.`,
      "success",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function rejectCommunityAction(id: string, adminNote?: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }
  const note = adminNote?.trim()
  if (!note) return { success: false, error: "Alasan penolakan wajib diisi." }

  const adminSupabase = await createAdminClient()
  const { data: community, error } = await adminSupabase
    .from("communities")
    .update({ is_verified: false, verification_status: "rejected" })
    .eq("id", id)
    .select("name, owner_id")
    .single()
  if (error) return { success: false, error: error.message }
  // Kirim notifikasi ke pemilik komunitas
  if (community?.owner_id) {
    await createNotification(
      community.owner_id,
      "Komunitas Ditolak",
      `Maaf, komunitas "${community.name}" Anda belum dapat disetujui. Alasan: ${note}`,
      "error",
      "/community/dashboard/profile"
    )
  }
  return { success: true }
}

export async function sanctionCommunityAction(id: string, type: "warning" | "suspend" | "ban", reason: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }
  const sanctionReason = reason?.trim()
  if (!sanctionReason) return { success: false, error: "Alasan sanksi wajib diisi." }

  const adminSupabase = await createAdminClient()
  const { data: community, error: fetchErr } = await adminSupabase
    .from("communities")
    .select("name, owner_id")
    .eq("id", id)
    .single()
  if (fetchErr || !community) return { success: false, error: "Komunitas tidak ditemukan." }

  const { error: sanctionErr } = await adminSupabase
    .from("sanctions")
    .insert({
      community_id: id,
      issued_by: auth.userId,
      type: type,
      reason: sanctionReason,
      is_active: true
    })
  if (sanctionErr) return { success: false, error: sanctionErr.message }

  if (type === "suspend" || type === "ban") {
    await adminSupabase
      .from("communities")
      .update({ is_suspended: true, is_banned: type === "ban" })
      .eq("id", id)
      
    if (type === "ban") {
      await adminSupabase
        .from("activities")
        .update({ status: "completed" })
        .eq("community_id", id)
    }
  }

  if (community.owner_id) {
    const title = type === "warning" ? "Peringatan Komunitas" : type === "suspend" ? "Komunitas Disuspend" : "Komunitas Dibanned"
    const message = `Komunitas "${community.name}" Anda mendapat sanksi (${type}). Alasan: ${sanctionReason}`
    await createNotification(
      community.owner_id,
      title,
      message,
      "error",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function revokeSuspendAction(id: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: community, error: fetchErr } = await adminSupabase
    .from("communities")
    .select("name, owner_id, is_banned")
    .eq("id", id)
    .single()
  if (fetchErr || !community) return { success: false, error: "Komunitas tidak ditemukan." }
  
  if (community.is_banned) return { success: false, error: "Tidak dapat mencabut suspend karena komunitas ini telah di-ban permanen." }

  const { error } = await adminSupabase
    .from("communities")
    .update({ is_suspended: false })
    .eq("id", id)
  if (error) return { success: false, error: error.message }

  await adminSupabase
    .from("sanctions")
    .update({ is_active: false })
    .eq("community_id", id)
    .in("type", ["suspend", "ban"])
    .eq("is_active", true)

  if (community.owner_id) {
    await createNotification(
      community.owner_id,
      "Suspend Dicabut",
      `Suspend untuk komunitas "${community.name}" Anda telah dicabut. Anda dapat menggunakan fitur komunitas kembali.`,
      "success",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function approveActivityAction(id: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: activity, error } = await adminSupabase
    .from("activities")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .select("title, community_id, community:communities(owner_id)")
    .single()
  if (error) return { success: false, error: error.message }
  // Kirim notifikasi ke pemilik komunitas
  const ownerId = (activity?.community as any)?.owner_id
  if (ownerId) {
    await createNotification(
      ownerId,
      "Kegiatan Disetujui",
      `Kegiatan "${activity.title}" telah disetujui oleh admin dan kini tampil ke publik.`,
      "success",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function rejectActivityAction(id: string, adminNote?: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: activity, error } = await adminSupabase
    .from("activities")
    .update({ status: "draft", admin_note: adminNote?.trim() || "Ditolak oleh admin" })
    .eq("id", id)
    .select("title, community_id, community:communities(owner_id)")
    .single()
  if (error) return { success: false, error: error.message }
  // Kirim notifikasi ke pemilik komunitas
  const ownerId = (activity?.community as any)?.owner_id
  if (ownerId) {
    await createNotification(
      ownerId,
      "Kegiatan Ditolak",
      `Kegiatan "${activity.title}" ditolak oleh admin. Silakan periksa catatan admin dan perbaiki sebelum submit ulang.`,
      "error",
      "/community/dashboard"
    )
  }
  return { success: true }
}

// --- ACTIVITY EDIT REQUESTS ---

export async function getPendingEditRequests() {
  const isE2E = null
  if (isE2E) {
    return [
      {
        id: "edit-request-1",
        reason: "Lokasi kegiatan berubah karena cuaca buruk.",
        status: "pending",
        created_at: new Date().toISOString(),
        community: { name: "Eco Ocean" },
        activity: { id: "activity-3", title: "Ongoing Activity 1" }
      }
    ] as any
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return []

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("activity_edit_requests")
    .select("*, community:communities(name), activity:activities(id, title)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching pending edit requests:", error)
  return data || []
}

export async function approveEditRequestAction(id: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: request, error } = await adminSupabase
    .from("activity_edit_requests")
    .update({ status: "approved", reviewed_by: auth.userId, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("activity_id, reason, activity:activities(title, community:communities(owner_id))")
    .single()

  if (error) return { success: false, error: error.message }

  const ownerId = ((request?.activity as any)?.community as any)?.owner_id
  const activityTitle = (request?.activity as any)?.title ?? "kegiatan"
  if (ownerId) {
    await createNotification(
      ownerId,
      "Pengajuan Edit Disetujui",
      `Pengajuan edit untuk kegiatan "${activityTitle}" telah disetujui. Anda kini dapat mengedit kegiatan tersebut.`,
      "success",
      `/community/dashboard/activities/${request.activity_id}/edit`
    )
  }
  return { success: true }
}

export async function rejectEditRequestAction(id: string, adminNote?: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: request, error } = await adminSupabase
    .from("activity_edit_requests")
    .update({
      status: "rejected",
      admin_note: adminNote?.trim() || "Ditolak oleh admin",
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("activity_id, activity:activities(title, community:communities(owner_id))")
    .single()

  if (error) return { success: false, error: error.message }

  const ownerId = ((request?.activity as any)?.community as any)?.owner_id
  const activityTitle = (request?.activity as any)?.title ?? "kegiatan"
  if (ownerId) {
    await createNotification(
      ownerId,
      "Pengajuan Edit Ditolak",
      `Pengajuan edit untuk kegiatan "${activityTitle}" ditolak oleh admin. Silakan periksa catatan admin.`,
      "error",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function approveReportAction(id: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: report, error } = await adminSupabase
    .from("reports")
    .update({
      status: "validated",
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("title, activity_id, community_id, activity:activities(status), community:communities(owner_id)")
    .single()
  if (error) return { success: false, error: error.message }

  // Kegiatan yang sudah selesai otomatis ditampilkan di bagian "Konservasi yang Berhasil" begitu laporannya divalidasi
  if (report?.activity_id && (report.activity as any)?.status === "completed") {
    await adminSupabase
      .from("activities")
      .update({ is_featured: true })
      .eq("id", report.activity_id)
  }

  const ownerId = (report?.community as any)?.owner_id
  if (ownerId) {
    await createNotification(
      ownerId,
      "Laporan Kegiatan Divalidasi",
      `Laporan "${report.title}" telah divalidasi oleh admin. Proses pencairan dana dapat dilanjutkan.`,
      "success",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function suspendCommunityAction(id: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: community, error } = await adminSupabase
    .from("communities")
    .update({ is_verified: false, is_suspended: true })
    .eq("id", id)
    .select("name, owner_id")
    .single()
  if (error) return { success: false, error: error.message }
  if (community?.owner_id) {
    await createNotification(
      community.owner_id,
      "Komunitas Disuspend ⚠️",
      `Komunitas "${community.name}" Anda telah disuspend oleh admin. Hubungi admin untuk informasi lebih lanjut.`,
      "error",
      "/community"
    )
  }
  return { success: true }
}

export async function unsuspendCommunityAction(id: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: community, error } = await adminSupabase
    .from("communities")
    .update({ is_verified: true, is_suspended: false, verification_status: "approved" })
    .eq("id", id)
    .select("name, owner_id")
    .single()
  if (error) return { success: false, error: error.message }
  if (community?.owner_id) {
    await createNotification(
      community.owner_id,
      "Komunitas Diaktifkan Kembali",
      `Komunitas "${community.name}" Anda telah diaktifkan kembali oleh admin.`,
      "success",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function getPlatformMonitoringStats() {
  const isE2E = null
  if (isE2E) {
    return {
      totalDonations: 5000000,
      pendingDonations: 1000000,
      communityStats: { total: 5, approved: 3, pending: 1, rejected: 0, suspended: 1 },
      activityStats: { total: 8, published: 4, completed: 2, pendingReview: 2 },
      totalUsers: 50,
      totalVolunteers: 20,
    }
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return null

  const adminSupabase = await createAdminClient()

  const [
    { data: donations },
    { data: commStatuses },
    { data: actStatuses },
    { count: totalUsers },
    { count: totalVolunteers },
  ] = await Promise.all([
    adminSupabase.from("donations").select("amount, status, type").eq("type", "money"),
    adminSupabase.from("communities").select("verification_status"),
    adminSupabase.from("activities").select("status"),
    adminSupabase.from("profiles").select("*", { count: "exact", head: true }),
    adminSupabase.from("profiles").select("*", { count: "exact", head: true }).eq("volunteer_status", "approved"),
  ])

  const totalDonations = (donations ?? []).filter(d => d.status === "completed").reduce((sum, d) => sum + Number(d.amount || 0), 0)
  const pendingDonations = (donations ?? []).filter(d => d.status === "pending").reduce((sum, d) => sum + Number(d.amount || 0), 0)

  return {
    totalDonations,
    pendingDonations,
    communityStats: {
      total: commStatuses?.length ?? 0,
      approved: commStatuses?.filter(c => c.verification_status === "approved").length ?? 0,
      pending: commStatuses?.filter(c => c.verification_status === "pending").length ?? 0,
      rejected: commStatuses?.filter(c => c.verification_status === "rejected").length ?? 0,
      suspended: commStatuses?.filter(c => c.verification_status === "suspended").length ?? 0,
    },
    activityStats: {
      total: actStatuses?.length ?? 0,
      published: actStatuses?.filter(a => a.status === "published").length ?? 0,
      completed: actStatuses?.filter(a => a.status === "completed").length ?? 0,
      pendingReview: actStatuses?.filter(a => a.status === "pending_review").length ?? 0,
    },
    totalUsers: totalUsers ?? 0,
    totalVolunteers: totalVolunteers ?? 0,
  }
}

export async function getAdminAuditLog() {
  try {
    const isE2E = null
    if (isE2E) {
      return {
        reports: [
          { id: 'report-1', title: 'Laporan Bersih Pantai Mutiara', status: 'validated', reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString(), community: { name: 'Komunitas Laut Lestari' } },
          { id: 'report-2', title: 'Laporan Konservasi Terumbu Karang', status: 'rejected', reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString(), community: { name: 'Komunitas Pesisir Hijau' } },
        ],
        communities: [
          { id: 'community-1', name: 'Komunitas Laut Lestari', verification_status: 'approved', updated_at: new Date().toISOString() },
          { id: 'community-2', name: 'Komunitas Mangrove Asri', verification_status: 'rejected', updated_at: new Date().toISOString() },
        ],
        activities: [
          { id: 'activity-1', title: 'Bersih Pantai Mutiara', status: 'published', updated_at: new Date().toISOString(), community: { name: 'Komunitas Laut Lestari' } },
          { id: 'activity-2', title: 'Edukasi Konservasi Mangrove', status: 'draft', updated_at: new Date().toISOString(), community: { name: 'Komunitas Mangrove Asri' } },
        ],
        volunteers: [
          { id: 'volunteer-1', full_name: 'Budi Santoso', volunteer_status: 'approved', updated_at: new Date().toISOString() },
          { id: 'volunteer-2', full_name: 'Ani Wijaya', volunteer_status: 'rejected', updated_at: new Date().toISOString() },
        ],
      }
    }

    const auth = await requireAdmin()
    if (!auth.authorized) return { reports: [], communities: [], activities: [], volunteers: [] }

    const adminSupabase = await createAdminClient()

    const [reportsRes, communitiesRes, activitiesRes, volunteersRes] = await Promise.all([
      adminSupabase
        .from("reports")
        .select("id, title, status, reviewed_at, updated_at, community:communities(name)")
        .in("status", ["validated", "rejected"])
        .order("updated_at", { ascending: false })
        .limit(30),
      adminSupabase
        .from("communities")
        .select("id, name, verification_status, is_suspended, updated_at")
        .or("verification_status.in.(approved,rejected),is_suspended.eq.true")
        .order("updated_at", { ascending: false })
        .limit(30),
      adminSupabase
        .from("activities")
        .select("id, title, status, updated_at, community:communities(name)")
        .in("status", ["published", "draft", "cancelled", "completed", "pending_review"])
        .order("updated_at", { ascending: false })
        .limit(30),
      adminSupabase
        .from("profiles")
        .select("id, full_name, volunteer_status, updated_at")
        .in("volunteer_status", ["approved", "rejected"])
        .order("updated_at", { ascending: false })
        .limit(30),
    ])

    if (reportsRes.error) console.error("Reports error:", reportsRes.error)
    if (communitiesRes.error) console.error("Communities error:", communitiesRes.error)
    if (activitiesRes.error) console.error("Activities error:", activitiesRes.error)
    if (volunteersRes.error) console.error("Volunteers error:", volunteersRes.error)

    return {
      reports: reportsRes.data ?? [],
      communities: communitiesRes.data ?? [],
      activities: activitiesRes.data ?? [],
      volunteers: volunteersRes.data ?? [],
    }
  } catch (err: any) {
    console.error("Unhandled error in getAdminAuditLog:", err.message, err.stack)
    return { error: err.message, stack: err.stack, reports: [], communities: [], activities: [], volunteers: [] }
  }
}

export async function rejectReportAction(id: string, adminNote?: string) {
  const isE2E = null
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data: report, error } = await adminSupabase
    .from("reports")
    .update({
      status: "rejected",
      admin_note: adminNote?.trim() || null,
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("title, community_id, community:communities(owner_id)")
    .single()
  if (error) return { success: false, error: error.message }
  const ownerId = (report?.community as any)?.owner_id
  if (ownerId) {
    await createNotification(
      ownerId,
      "Laporan Kegiatan Ditolak",
      `Laporan "${report.title}" ditolak oleh admin. Silakan perbaiki laporan dan submit ulang.`,
      "error",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function getAdminReportsList() {
  const isE2E = null
  if (isE2E) {
    return {
      success: true,
      data: [
        {
          id: "report-1",
          title: "Laporan Bersih Pantai Mutiara",
          summary: "Kegiatan berjalan lancar.",
          status: "submitted",
          created_at: new Date().toISOString(),
          activity_id: "activity-1",
          community: { name: "Eco Ocean" },
          profiles: { full_name: "Budi Santoso" }
        }
      ] as any[]
    }
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, data: [], error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("reports")
    .select(`
      id, title, summary, status, created_at, activity_id,
      community:communities(name),
      profiles!reports_submitted_by_fkey(full_name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getAdminReportsList] error:", error)
    return { success: false, data: [], error: "Gagal memuat laporan." }
  }

  return { success: true, data: data ?? [] }
}

export async function getAdminReportDetail(reportId: string) {
  const isE2E = null
  if (isE2E) return { success: true, data: null as any }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, data: null, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("reports")
    .select(`
      id, title, summary, status, completion_status, fund_usage,
      admin_note, created_at, reviewed_at, activity_id,
      activity:activities(title),
      community:communities(name),
      profiles!reports_submitted_by_fkey(full_name),
      report_files(id, file_name, file_url, file_type, file_size)
    `)
    .eq("id", reportId)
    .maybeSingle()

  if (error || !data) {
    console.error("[getAdminReportDetail] error:", error)
    return { success: false, data: null, error: "Laporan tidak ditemukan." }
  }

  return { success: true, data }
}

export async function getAdminActivityReviewDetail(activityId: string) {
  const isE2E = null
  if (isE2E) {
    if (activityId === 'activity-1') {
      return {
        success: true,
        data: {
          id: "activity-1",
          title: "Pending Activity 1",
          description: "Deskripsi kegiatan pending",
          location: "Pantai Indah",
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          status: "pending_review",
          cover_image_url: null,
          category: "Penanaman Mangrove",
          volunteer_quota: 10,
          volunteer_count: 0,
          funding_goal: 5000000,
          funding_raised: 0,
          published_at: null,
          community_id: "community-1",
          community: {
            id: "community-1",
            name: "Eco Ocean",
            logo_url: null,
            is_verified: true,
            location: "Jakarta",
            owner: {
              full_name: "Owner Name",
              email: "owner@eco.org"
            }
          },
          reports: [],
          feedbacks: [],
          items_needed: [],
          volunteer_registrations: []
        }
      }
    }
    return { success: true, data: null as any }
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, data: null, error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("activities")
    .select(`
      *,
      community:communities(id, name, logo_url, is_verified, location, owner:profiles(full_name, email))
    `)
    .eq("id", activityId)
    .maybeSingle()

  if (error || !data) {
    console.error("[getAdminActivityReviewDetail] error:", error)
    return { success: false, data: null, error: "Kegiatan tidak ditemukan." }
  }

  return { success: true, data }
}

export async function getHomePageStats() {
  const adminSupabase = await createAdminClient()

  // 1. Anggota Aktif: Count distinct users yang terdaftar sebagai relawan di kegiatan (approved/attended)
  const { data: volunteerRows } = await adminSupabase
    .from("volunteer_registrations")
    .select("user_id")
    .in("status", ["approved", "attended"])

  const totalVolunteers = new Set(volunteerRows?.map(r => r.user_id)).size

  // 2. Kegiatan Berlangsung: Count of activities with status = 'published'
  const { count: ongoingActivities } = await adminSupabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")

  // 3. Area Pesisir Terlindungi: Count of unique locations from published/completed activities
  const { data: locations } = await adminSupabase
    .from("activities")
    .select("location")
    .in("status", ["published", "completed"])
  
  const uniqueLocations = new Set(locations?.map(l => l.location)).size

  // 4. Dana Terkumpul: Sum of amount from donations with status = 'completed'
  const { data: donations } = await adminSupabase
    .from("donations")
    .select("amount")
    .eq("status", "completed")
    .eq("type", "money")

  const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

  // 5. Jumlah Komunitas: Count of verified communities
  const { count: totalCommunities } = await adminSupabase
    .from("communities")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true)

  return {
    totalVolunteers: totalVolunteers || 0,
    ongoingActivities: ongoingActivities || 0,
    protectedAreas: uniqueLocations || 0,
    totalDonations: totalDonations || 0,
    totalCommunities: totalCommunities || 0
  }
}

/** Statistik publik untuk halaman /community (tidak memerlukan akses admin) */
export async function getCommunityPageStats() {
  const adminSupabase = await createAdminClient()

  const [
    { count: verifiedCommunities },
    { count: completedActivities },
    { data: volunteerRows },
  ] = await Promise.all([
    adminSupabase.from("communities").select("*", { count: "exact", head: true }).eq("is_verified", true),
    adminSupabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "completed"),
    adminSupabase.from("volunteer_registrations").select("user_id").in("status", ["approved", "attended"]),
  ])

  const activeVolunteers = new Set(volunteerRows?.map(r => r.user_id)).size

  return {
    activeVolunteers: activeVolunteers || 0,
    verifiedCommunities: verifiedCommunities || 0,
    completedActivities: completedActivities || 0,
  }
}

// --- COMMUNITY DASHBOARD ---

export async function getCommunityDashboardStats(userId: string) {
  const isE2E = null
  if (isE2E) {
    return {
      totalActivities: 2,
      activeActivities: 1,
      completedActivities: 1,
      pendingReviewActivities: 0,
      totalVolunteers: 15,
      activeVolunteers: 8,
      totalDonations: 5000000,
      activeDonations: 3000000,
      totalItemDonations: 20,
      activeItemDonations: 15,
      verifiedReports: "1/2",
      totalBalance: 4500000,
    }
  }

  const auth = await requireCommunityUser(userId)
  if (!auth.authorized) {
    return {
      totalActivities: 0,
      activeActivities: 0,
      completedActivities: 0,
      pendingReviewActivities: 0,
      totalVolunteers: 0,
      activeVolunteers: 0,
      totalDonations: 0,
      activeDonations: 0,
      totalItemDonations: 0,
      activeItemDonations: 0,
      verifiedReports: "0/0",
      totalBalance: 0,
    }
  }

  const adminSupabase = await createAdminClient()

  // First fetch the community owned by the user
  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("owner_id", userId)
    .eq("is_verified", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!community) {
    return {
      totalActivities: 0,
      activeActivities: 0,
      completedActivities: 0,
      pendingReviewActivities: 0,
      totalVolunteers: 0,
      activeVolunteers: 0,
      totalDonations: 0,
      activeDonations: 0,
      totalItemDonations: 0,
      activeItemDonations: 0,
      verifiedReports: "0/0",
      totalBalance: 0,
    }
  }

  const communityId = community.id

  // Stats
  const { data: acts } = await adminSupabase
    .from("activities")
    .select("id, status")
    .eq("community_id", communityId)

  const activityIds = acts?.map(a => a.id).filter(Boolean) || []
  const activeActivityIds = acts
    ?.filter(a => ["published", "ongoing"].includes(a.status))
    .map(a => a.id)
    .filter(Boolean) || []

  let activeActivities = 0
  let completedActivities = 0
  let pendingReviewActivities = 0

  acts?.forEach(a => {
    if (a.status === "published" || a.status === "ongoing") {
      activeActivities++
    } else if (a.status === "completed") {
      completedActivities++
    } else if (a.status === "pending_review") {
      pendingReviewActivities++
    }
  })

  let totalVolunteers = 0
  let activeVolunteers = 0
  let totalDonations = 0
  let activeDonations = 0
  let totalItemDonations = 0
  let activeItemDonations = 0

  if (activityIds.length > 0) {
    const [{ data: volunteerRows }, { data: donationRows }] = await Promise.all([
      adminSupabase
        .from("volunteer_registrations")
        .select("activity_id")
        .in("activity_id", activityIds)
        .in("status", ["approved", "attended"]),
      adminSupabase
        .from("donations")
        .select("activity_id, type, amount, donation_items(quantity)")
        .in("activity_id", activityIds)
        .eq("status", "completed"),
    ])

    totalVolunteers = volunteerRows?.length || 0
    activeVolunteers = volunteerRows?.filter(v => activeActivityIds.includes(v.activity_id)).length || 0

    donationRows?.forEach(donation => {
      if (donation.type === "money") {
        const amt = Number(donation.amount || 0)
        totalDonations += amt
        if (activeActivityIds.includes(donation.activity_id)) {
          activeDonations += amt
        }
      } else if (donation.type === "item") {
        const qty = donation.donation_items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0
        totalItemDonations += qty
        if (activeActivityIds.includes(donation.activity_id)) {
          activeItemDonations += qty
        }
      }
    })
  }

  // Reports
  const { count: totalReports } = await adminSupabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId)

  const { count: verifiedReports } = await adminSupabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId)
    .eq("status", "validated")

  // Saldo komunitas: total dana yang sudah dicairkan admin (status completed) dikurangi platform fee
  const { data: completedDisbursements } = await adminSupabase
    .from("disbursements")
    .select("amount, platform_fee")
    .eq("community_id", communityId)
    .eq("status", "completed")

  const totalBalance = (completedDisbursements ?? []).reduce(
    (sum, d) => sum + (Number(d.amount || 0) - Number(d.platform_fee || 0)), 0
  )

  return {
    totalActivities: acts?.length || 0,
    activeActivities,
    completedActivities,
    pendingReviewActivities,
    totalVolunteers,
    activeVolunteers,
    totalDonations,
    activeDonations,
    totalItemDonations,
    activeItemDonations,
    verifiedReports: `${verifiedReports || 0}/${totalReports || 0}`,
    totalBalance,
  }
}

export async function getCommunityActivities(userId: string) {
  const isE2E = null
  if (isE2E) {
    return [
      {
        id: "mock-activity-123",
        title: "Bersih Pantai Mutiara",
        status: "published",
        start_date: new Date().toISOString(),
        execution_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        volunteer_quota: 50,
        volunteer_count: 10,
        funding_goal: 10000000,
        funding_raised: 2000000,
        category: "cleanup",
        reports: [],
        community_id: "community-id-123"
      },
      {
        id: "mock-activity-draft",
        title: "Konservasi Mangrove Cilincing",
        status: "draft",
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        execution_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        volunteer_quota: 30,
        volunteer_count: 0,
        funding_goal: 5000000,
        funding_raised: 0,
        category: "mangrove",
        reports: [],
        community_id: "community-id-123"
      },
      {
        id: "mock-activity-pending",
        title: "Pemantauan Koral Kepulauan Seribu",
        status: "pending_review",
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        execution_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        volunteer_quota: 20,
        volunteer_count: 0,
        funding_goal: 3000000,
        funding_raised: 0,
        category: "coral",
        reports: [],
        community_id: "community-id-123"
      },
      {
        id: "mock-activity-completed",
        title: "Restorasi Ekosistem Pantai Kramat",
        status: "completed",
        start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        execution_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        volunteer_quota: 40,
        volunteer_count: 35,
        funding_goal: 8000000,
        funding_raised: 7500000,
        category: "restoration",
        reports: [],
        community_id: "community-id-123"
      },
      {
        id: "mock-activity-cancelled",
        title: "Tanam Mangrove Pulau Tidung",
        status: "cancelled",
        start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        execution_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        volunteer_quota: 25,
        volunteer_count: 0,
        funding_goal: 4000000,
        funding_raised: 0,
        category: "mangrove",
        reports: [],
        community_id: "community-id-123"
      },
    ] as any
  }

  const auth = await requireCommunityUser(userId)
  if (!auth.authorized) return []

  const adminSupabase = await createAdminClient()

  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("owner_id", userId)
    .eq("is_verified", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!community) return []

  // Left join to find if activity has a report
  const { data, error } = await adminSupabase
    .from("activities")
    .select("*, reports(status)")
    .eq("community_id", community.id)
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching community activities:", error)
  return data || []
}

export async function getRegisteredCommunities() {
  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("communities")
    .select("*")
    .eq("is_verified", true)
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching registered communities:", error)
  return data || []
}

// --- USER DASHBOARD ---

export async function getUserDashboardStats(userId: string) {
  const isE2E = null
  if (isE2E) {
    return {
      totalActivities: 1,
      activeActivities: 1,
      totalDonations: 0,
      avgRating: null,
    }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || user.id !== userId) {
    console.warn("[getUserDashboardStats] Invalid user session or userId mismatch")
    return {
      totalActivities: 0,
      activeActivities: 0,
      totalDonations: 0,
      avgRating: null as number | null,
    }
  }

  const adminSupabase = await createAdminClient()

  // Jumlah kegiatan yang didaftarkan sebagai relawan
  const { count: totalActivities } = await adminSupabase
    .from("volunteer_registrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Jumlah kegiatan aktif (approved / attended)
  const { count: activeActivities } = await adminSupabase
    .from("volunteer_registrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["approved", "attended"])

  // Total donasi uang yang berhasil
  const { data: donations } = await adminSupabase
    .from("donations")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "money")
    .eq("status", "completed")

  const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

  return {
    totalActivities: totalActivities || 0,
    activeActivities: activeActivities || 0,
    totalDonations,
    avgRating: null as number | null, // placeholder — bisa dikembangkan jika ada tabel ratings
  }
}

// --- COMMUNITY PROFILE ---

export async function getCommunityProfile() {
  const isE2E = null
  if (isE2E === 'community') {
    return {
      success: true,
      data: {
        id: "community-id-123",
        name: "E2E Community",
        is_verified: true,
        verification_status: "approved",
        is_suspended: false,
        owner_id: "community-user-id"
      },
      error: null
    }
  }

  const adminSupabase = await createAdminClient()

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "Sesi tidak valid. Silakan login kembali.", data: null }
  }

  const { data, error } = await adminSupabase
    .from("communities")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    console.error("[getCommunityProfile] error:", error)
    return { success: false, error: "Data komunitas tidak ditemukan.", data: null }
  }

  return { success: true, data, error: null }
}

export async function updateCommunityProfile(communityId: string, payload: {
  name: string
  description: string
  location: string
  website: string | null
  phone: string | null
  email: string | null
  admin_name: string | null
  instagram: string | null
  facebook: string | null
  twitter: string | null
  focus_areas: string[]
}) {
  const adminSupabase = await createAdminClient()

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
  }

  // Verifikasi bahwa komunitas ini milik user yang sedang login
  const { data: existing, error: checkErr } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("id", communityId)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (checkErr || !existing) {
    return { success: false, error: "Akses ditolak. Komunitas ini bukan milik akun Anda." }
  }

  const { error: updateError } = await adminSupabase
    .from("communities")
    .update({
      name: payload.name.trim(),
      description: payload.description.trim(),
      location: payload.location.trim(),
      website: payload.website?.trim() || null,
      phone: payload.phone?.trim() || null,
      email: payload.email?.trim() || null,
      admin_name: payload.admin_name?.trim() || null,
      instagram: payload.instagram?.trim() || null,
      facebook: payload.facebook?.trim() || null,
      twitter: payload.twitter?.trim() || null,
      focus_areas: payload.focus_areas,
    })
    .eq("id", communityId)

  if (updateError) {
    console.error("[updateCommunityProfile] error:", updateError)
    return { success: false, error: updateError.message || "Gagal menyimpan perubahan." }
  }

  return { success: true, error: null }
}

export async function uploadCommunityImage(
  communityId: string,
  file: File,
  type: "logo" | "cover"
) {
  const adminSupabase = await createAdminClient()

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "Sesi tidak valid.", url: null }
  }

  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.replace(" ", "") || "sinergilaut-assets"
  const ext = file.name.split(".").pop()
  const folder = type === "logo" ? "community-logos" : "community-covers"
  const path = `${folder}/${communityId}/${type}-${Date.now()}.${ext}`

  const { error: uploadErr } = await adminSupabase.storage.from(bucketName).upload(path, file, { upsert: true })
  if (uploadErr) {
    return { success: false, error: uploadErr.message, url: null }
  }

  const { data: urlData } = adminSupabase.storage.from(bucketName).getPublicUrl(path)
  const column = type === "logo" ? "logo_url" : "cover_url"

  const { error: updateErr } = await adminSupabase
    .from("communities")
    .update({ [column]: urlData.publicUrl })
    .eq("id", communityId)
    .eq("owner_id", user.id)

  if (updateErr) {
    return { success: false, error: updateErr.message, url: null }
  }

  return { success: true, url: urlData.publicUrl, error: null }
}

