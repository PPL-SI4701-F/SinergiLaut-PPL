"use server"

import { createClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import { getEndowmentStats } from "@/lib/actions/endowment.actions"

// --- ADMIN DASHBOARD ---

export async function getAdminDashboardStats() {
  const supabase = await createClient()

  // Total communities
  const { count: totalCommunities } = await supabase
    .from("communities")
    .select("*", { count: "exact", head: true })

  // Active users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Active activities
  const { count: totalActivities } = await supabase
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
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching pending communities:", error)
  return data || []
}

export async function getPendingActivities() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*, community:communities(name)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching pending activities:", error)
  return data || []
}

export async function getOngoingActivities() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*, community:communities(name)")
    .in("status", ["published", "completed"])
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching ongoing activities:", error)
  return data || []
}

export async function getPendingReports() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("reports")
    .select("*, community:communities(name), activity:activities(title)")
    .eq("status", "submitted")
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching pending reports:", error)
  return data || []
}

export async function getAllCommunities() {
  const supabase = await createClient()
  const { data, error } = await supabase
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
  const supabase = await createClient()
  const { data: community, error } = await supabase
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
  const supabase = await createClient()
  const { data: community, error } = await supabase
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
  const supabase = await createClient()
  const { data: activity, error } = await supabase
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
  const supabase = await createClient()
  const { data: activity, error } = await supabase
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
  const supabase = await createClient()
  const { data: report, error } = await supabase
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
  const supabase = await createClient()
  const { data: report, error } = await supabase
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

export async function getHomePageStats() {
  const supabase = await createClient()

  // 1. Relawan Aktif: Count of profiles with volunteer_status = 'approved'
  const { count: totalVolunteers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("volunteer_status", "approved")

  // 2. Kegiatan Berlangsung: Count of activities with status = 'published'
  const { count: ongoingActivities } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")

  // 3. Area Pesisir Terlindungi: Count of unique locations from published/completed activities
  const { data: locations } = await supabase
    .from("activities")
    .select("location")
    .in("status", ["published", "completed"])
  
  const uniqueLocations = new Set(locations?.map(l => l.location)).size

  // 4. Dana Terkumpul: Sum of amount from donations with status = 'completed'
  const { data: donations } = await supabase
    .from("donations")
    .select("amount")
    .eq("status", "completed")
    .eq("type", "money")

  const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

  return {
    totalVolunteers: totalVolunteers || 0,
    ongoingActivities: ongoingActivities || 0,
    protectedAreas: uniqueLocations || 0,
    totalDonations: totalDonations || 0
  }
}

// --- COMMUNITY DASHBOARD ---

export async function getCommunityDashboardStats(userId: string) {
  const supabase = await createClient()

  // First fetch the community owned by the user
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("owner_id", userId)
    .single()

  if (!community) {
    return { totalActivities: 0, totalVolunteers: 0, totalDonations: 0, verifiedReports: "0/0" }
  }

  const communityId = community.id

  // Stats
  const { count: totalActivities } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId)

  const { data: acts } = await supabase
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
  const { count: totalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId)

  const { count: verifiedReports } = await supabase
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
  const supabase = await createClient()
  
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("owner_id", userId)
    .single()

  if (!community) return []

  // Left join to find if activity has a report
  const { data, error } = await supabase
    .from("activities")
    .select("*, reports(status)")
    .eq("community_id", community.id)
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching community activities:", error)
  return data || []
}

export async function getRegisteredCommunities() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("is_verified", true)
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching registered communities:", error)
  return data || []
}

// --- USER DASHBOARD ---

export async function getUserDashboardStats(userId: string) {
  const supabase = await createClient()

  // Jumlah kegiatan yang didaftarkan sebagai relawan
  const { count: totalActivities } = await supabase
    .from("volunteer_registrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Jumlah kegiatan aktif (approved / attended)
  const { count: activeActivities } = await supabase
    .from("volunteer_registrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["approved", "attended"])

  // Total donasi uang yang berhasil
  const { data: donations } = await supabase
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
