"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import { cookies } from "next/headers"

async function getE2EMock() {
  if (process.env.NODE_ENV !== 'development') return null
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
  if (user.user_metadata?.role !== "admin") return { authorized: false }
  return { authorized: true, userId: user.id }
}

// --- ADMIN DASHBOARD ---

export async function getAdminDashboardStats() {
  const isE2E = await getE2EMock()
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
  const isE2E = await getE2EMock()
  if (isE2E) {
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
  const isE2E = await getE2EMock()
  if (isE2E) {
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
  const isE2E = await getE2EMock()
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
  const isE2E = await getE2EMock()
  if (isE2E) {
    return [
      {
        id: "report-1",
        activity_id: "activity-3",
        status: "submitted",
        created_at: new Date().toISOString(),
        community: { name: "Eco Ocean" },
        activity: { title: "Ongoing Activity 1" }
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
  const isE2E = await getE2EMock()
  if (isE2E) {
    return [
      { id: 'community-1', name: 'Komunitas Laut Lestari', location: 'Jakarta', logo_url: null, verification_status: 'approved' },
      { id: 'community-2', name: 'Komunitas Mangrove Asri', location: 'Surabaya', logo_url: null, verification_status: 'suspended' },
      { id: 'community-3', name: 'Komunitas Pesisir Hijau', location: 'Bali', logo_url: null, verification_status: 'pending' },
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
  const isE2E = await getE2EMock()
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
      "Komunitas Disetujui ✅",
      `Komunitas "${community.name}" Anda telah diverifikasi dan disetujui oleh admin. Sekarang Anda dapat mulai membuat kegiatan.`,
      "success",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function rejectCommunityAction(id: string) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Akses ditolak." }

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
      "Komunitas Ditolak ❌",
      `Maaf, komunitas "${community.name}" Anda belum dapat disetujui. Silakan hubungi admin untuk info lebih lanjut.`,
      "error",
      "/community"
    )
  }
  return { success: true }
}

export async function approveActivityAction(id: string) {
  const isE2E = await getE2EMock()
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
      "Kegiatan Disetujui ✅",
      `Kegiatan "${activity.title}" telah disetujui oleh admin dan kini tampil ke publik.`,
      "success",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function rejectActivityAction(id: string, adminNote?: string) {
  const isE2E = await getE2EMock()
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
      "Kegiatan Ditolak ❌",
      `Kegiatan "${activity.title}" ditolak oleh admin. Silakan periksa catatan admin dan perbaiki sebelum submit ulang.`,
      "error",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function approveReportAction(id: string) {
  const isE2E = await getE2EMock()
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
    .select("title, community_id, community:communities(owner_id)")
    .single()
  if (error) return { success: false, error: error.message }
  const ownerId = (report?.community as any)?.owner_id
  if (ownerId) {
    await createNotification(
      ownerId,
      "Laporan Kegiatan Divalidasi ✅",
      `Laporan "${report.title}" telah divalidasi oleh admin. Proses pencairan dana dapat dilanjutkan.`,
      "success",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function suspendCommunityAction(id: string) {
  const isE2E = await getE2EMock()
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
  const isE2E = await getE2EMock()
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
      "Komunitas Diaktifkan Kembali ✅",
      `Komunitas "${community.name}" Anda telah diaktifkan kembali oleh admin.`,
      "success",
      "/community/dashboard"
    )
  }
  return { success: true }
}

export async function getPlatformMonitoringStats() {
  const isE2E = await getE2EMock()
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
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      reports: [
        { id: 'report-1', title: 'Laporan Bersih Pantai Mutiara', status: 'validated', reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString(), community: { name: 'Komunitas Laut Lestari' } },
        { id: 'report-2', title: 'Laporan Konservasi Terumbu Karang', status: 'rejected', reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString(), community: { name: 'Komunitas Pesisir Hijau' } },
      ],
      communities: [
        { id: 'community-1', name: 'Komunitas Laut Lestari', verification_status: 'approved', updated_at: new Date().toISOString() },
        { id: 'community-2', name: 'Komunitas Mangrove Asri', verification_status: 'suspended', updated_at: new Date().toISOString() },
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
      .select("id, name, verification_status, updated_at")
      .in("verification_status", ["approved", "rejected", "suspended"])
      .order("updated_at", { ascending: false })
      .limit(30),
    adminSupabase
      .from("activities")
      .select("id, title, status, updated_at, community:communities(name)")
      .in("status", ["published", "draft"])
      .not("published_at", "is", null)
      .order("updated_at", { ascending: false })
      .limit(30),
    adminSupabase
      .from("profiles")
      .select("id, full_name, volunteer_status, updated_at")
      .in("volunteer_status", ["approved", "rejected"])
      .order("updated_at", { ascending: false })
      .limit(30),
  ])

  return {
    reports: reportsRes.data ?? [],
    communities: communitiesRes.data ?? [],
    activities: activitiesRes.data ?? [],
    volunteers: volunteersRes.data ?? [],
  }
}

export async function rejectReportAction(id: string, adminNote?: string) {
  const isE2E = await getE2EMock()
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
      "Laporan Kegiatan Ditolak ❌",
      `Laporan "${report.title}" ditolak oleh admin. Silakan perbaiki laporan dan submit ulang.`,
      "error",
      "/community/dashboard"
    )
  }
  return { success: true }
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
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      totalActivities: 2,
      totalVolunteers: 15,
      totalDonations: 5000000,
      verifiedReports: "1/2"
    }
  }

  const adminSupabase = await createAdminClient()

  // First fetch the community owned by the user
  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("owner_id", userId)
    .eq("is_verified", true)
    .limit(1)
    .maybeSingle()

  if (!community) {
    return { totalActivities: 0, totalVolunteers: 0, totalDonations: 0, verifiedReports: "0/0" }
  }

  const communityId = community.id

  // Stats
  const { count: totalActivities } = await adminSupabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId)

  const { data: acts } = await adminSupabase
    .from("activities")
    .select("volunteer_count, funding_raised")
    .eq("community_id", communityId)

  let totalVolunteers = 0
  let totalDonations = 0
  acts?.forEach(a => {
    totalVolunteers += a.volunteer_count || 0
    totalDonations += Number(a.funding_raised || 0)
  })

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

  return {
    totalActivities: totalActivities || 0,
    totalVolunteers,
    totalDonations,
    verifiedReports: `${verifiedReports || 0}/${totalReports || 0}`
  }
}

export async function getCommunityActivities(userId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return [
      {
        id: "mock-activity-123",
        title: "Bersih Pantai Mutiara",
        status: "published",
        start_date: new Date().toISOString(),
        volunteer_quota: 50,
        volunteer_count: 10,
        funding_goal: 10000000,
        funding_raised: 2000000,
        category: "cleanup",
        reports: []
      }
    ] as any
  }

  const adminSupabase = await createAdminClient()

  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("owner_id", userId)
    .eq("is_verified", true)
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
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      totalActivities: 1,
      activeActivities: 1,
      totalDonations: 0,
      avgRating: null,
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
    .eq("is_verified", true)
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

