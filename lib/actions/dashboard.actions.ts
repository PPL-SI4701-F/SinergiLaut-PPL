"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import { getEndowmentStats } from "@/lib/actions/endowment.actions"

// --- ADMIN DASHBOARD ---

export async function getAdminDashboardStats() {
  const adminSupabase = await createAdminClient()

  // Total communities
  const { count: totalCommunities } = await adminSupabase
    .from("communities")
    .select("*", { count: "exact", head: true })

  // Active users
  const { count: totalUsers } = await adminSupabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Active activities
  const { count: totalActivities } = await adminSupabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .in("status", ["published", "completed"])

  // Endowment stats
  const { totalRaised } = await getEndowmentStats()
  const totalEndowment = totalRaised

  return {
    totalCommunities: totalCommunities || 0,
    totalUsers: totalUsers || 0,
    totalActivities: totalActivities || 0,
    totalEndowment
  }
}

export async function getPendingCommunities() {
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

export async function rejectActivityAction(id: string) {
  const adminSupabase = await createAdminClient()
  const { data: activity, error } = await adminSupabase
    .from("activities")
    .update({ status: "draft", admin_note: "Ditolak oleh admin" })
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
  const adminSupabase = await createAdminClient()
  const { data: report, error } = await adminSupabase
    .from("reports")
    .update({ status: "validated" })
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

export async function rejectReportAction(id: string) {
  const adminSupabase = await createAdminClient()
  const { data: report, error } = await adminSupabase
    .from("reports")
    .update({ status: "rejected" })
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

// --- COMMUNITY DASHBOARD ---

export async function getCommunityDashboardStats(userId: string) {
  const adminSupabase = await createAdminClient()

  // First fetch the community owned by the user
  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("owner_id", userId)
    .single()

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
  const adminSupabase = await createAdminClient()
  
  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("owner_id", userId)
    .single()

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
    .single()

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
    .single()

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

