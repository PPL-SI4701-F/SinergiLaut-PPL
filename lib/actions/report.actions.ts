"use server"

import { revalidatePath } from "next/cache"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"

export interface FundUsageItem {
  category: string
  amount: number
  description: string
}

export interface ReportPayload {
  activityId: string
  communityId: string
  title: string
  summary: string
  fundUsage: FundUsageItem[]
  completionStatus: "partial" | "completed"
}

async function requireCommunityActivity(activityId: string) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { authorized: false as const, error: "Sesi tidak valid. Silakan login kembali." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "community") {
    return { authorized: false as const, error: "Akses hanya untuk komunitas." }
  }

  const { data: activity } = await adminSupabase
    .from("activities")
    .select("id, title, status, community_id")
    .eq("id", activityId)
    .maybeSingle()

  if (!activity?.community_id) {
    return { authorized: false as const, error: "Kegiatan tidak ditemukan." }
  }

  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("id", activity.community_id)
    .eq("owner_id", user.id)
    .eq("is_verified", true)
    .maybeSingle()

  if (!community) {
    return { authorized: false as const, error: "Anda tidak memiliki akses ke kegiatan ini." }
  }

  return { authorized: true as const, userId: user.id, activity, communityId: community.id }
}

async function requireCommunityReport(reportId: string) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { authorized: false as const, error: "Sesi tidak valid. Silakan login kembali." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "community") {
    return { authorized: false as const, error: "Akses hanya untuk komunitas." }
  }

  const { data: report } = await adminSupabase
    .from("reports")
    .select("id, title, activity_id, community_id, status")
    .eq("id", reportId)
    .maybeSingle()

  if (!report?.community_id) {
    return { authorized: false as const, error: "Laporan tidak ditemukan." }
  }

  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("id", report.community_id)
    .eq("owner_id", user.id)
    .eq("is_verified", true)
    .maybeSingle()

  if (!community) {
    return { authorized: false as const, error: "Anda tidak memiliki akses ke laporan ini." }
  }

  return { authorized: true as const, userId: user.id, report, communityId: community.id }
}

/** Ambil laporan yang sudah ada untuk suatu kegiatan */
export async function getActivityReport(activityId: string) {
  const auth = await requireCommunityActivity(activityId)
  if (!auth.authorized) return { success: false, error: auth.error, data: null }

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("reports")
    .select("*, report_files(*)")
    .eq("activity_id", activityId)
    .eq("community_id", auth.communityId)
    .maybeSingle()

  if (error) return { success: false, error: error.message, data: null }
  return { success: true, data }
}

/** Buat laporan baru dengan status draft */
export async function createReport(payload: ReportPayload) {
  const auth = await requireCommunityActivity(payload.activityId)
  if (!auth.authorized) return { success: false, error: auth.error, data: null }

  if (auth.activity.status !== "completed") {
    return { success: false, error: "Laporan hanya dapat dibuat setelah kegiatan selesai.", data: null }
  }

  const adminSupabase = await createAdminClient()

  // Pastikan tidak ada laporan yang sudah ada untuk kegiatan ini
  const { data: existing } = await adminSupabase
    .from("reports")
    .select("id, status")
    .eq("activity_id", payload.activityId)
    .eq("community_id", auth.communityId)
    .maybeSingle()

  if (existing) {
    return { success: false, error: "Laporan untuk kegiatan ini sudah ada.", data: null }
  }

  const { data, error } = await adminSupabase
    .from("reports")
    .insert({
      activity_id: payload.activityId,
      community_id: auth.communityId,
      submitted_by: auth.userId,
      title: payload.title,
      summary: payload.summary,
      fund_usage: payload.fundUsage,
      completion_status: payload.completionStatus,
      status: "draft",
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message, data: null }
  revalidatePath("/community/dashboard")
  return { success: true, data }
}

/** Update laporan yang masih berstatus draft */
export async function updateReport(reportId: string, payload: Omit<ReportPayload, "activityId" | "communityId">) {
  const auth = await requireCommunityReport(reportId)
  if (!auth.authorized) return { success: false, error: auth.error, data: null }

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("reports")
    .update({
      title: payload.title,
      summary: payload.summary,
      fund_usage: payload.fundUsage,
      completion_status: payload.completionStatus,
    })
    .eq("id", reportId)
    .eq("community_id", auth.communityId)
    .in("status", ["draft", "rejected"])
    .select()
    .single()

  if (error) return { success: false, error: error.message, data: null }
  revalidatePath("/community/dashboard")
  return { success: true, data }
}

/** Ajukan laporan ke admin (ubah status dari draft/rejected → submitted) */
export async function submitReport(reportId: string) {
  const auth = await requireCommunityReport(reportId)
  if (!auth.authorized) return { success: false, error: auth.error }

  const adminSupabase = await createAdminClient()

  const { data: report, error } = await adminSupabase
    .from("reports")
    .update({ status: "submitted" })
    .eq("id", reportId)
    .eq("community_id", auth.communityId)
    .in("status", ["draft", "rejected"])
    .select("title, community_id")
    .single()

  if (error) return { success: false, error: error.message }

  // Kirim notifikasi ke semua admin
  const { data: admins } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "Laporan Kegiatan Baru Diajukan 📋",
        `Laporan "${report.title}" telah diajukan oleh komunitas dan menunggu validasi.`,
        "info",
        "/admin/reports"
      )
    }
  }

  revalidatePath("/community/dashboard")
  return { success: true }
}

/** Upload file dokumentasi ke report_files */
export async function uploadReportFile(reportId: string, file: File) {
  const auth = await requireCommunityReport(reportId)
  if (!auth.authorized) return { success: false, error: auth.error }
  if (!["draft", "rejected"].includes(auth.report.status)) {
    return { success: false, error: "File hanya dapat diunggah saat laporan masih draft atau perlu revisi." }
  }
  if (!file || file.size <= 0) return { success: false, error: "File wajib diunggah." }
  if (file.size > 10 * 1024 * 1024) return { success: false, error: "Ukuran file maksimal 10MB." }

  const adminSupabase = await createAdminClient()

  const fileExt = file.name.split(".").pop()
  const filePath = `reports/${reportId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await adminSupabase.storage
    .from("sinergilaut-assets")
    .upload(filePath, file, { upsert: false })

  if (uploadError) return { success: false, error: uploadError.message }

  const { data: urlData } = adminSupabase.storage
    .from("sinergilaut-assets")
    .getPublicUrl(filePath)

  const { error: insertError } = await adminSupabase
    .from("report_files")
    .insert({
      report_id: reportId,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type || fileExt || "unknown",
      file_size: file.size,
    })

  if (insertError) return { success: false, error: insertError.message }
  return { success: true, fileUrl: urlData.publicUrl }
}

/** Hapus file dokumentasi */
export async function deleteReportFile(fileId: string) {
  const adminSupabase = await createAdminClient()
  const { data: file } = await adminSupabase
    .from("report_files")
    .select("id, report_id")
    .eq("id", fileId)
    .maybeSingle()

  if (!file?.report_id) return { success: false, error: "File laporan tidak ditemukan." }

  const auth = await requireCommunityReport(file.report_id)
  if (!auth.authorized) return { success: false, error: auth.error }
  if (!["draft", "rejected"].includes(auth.report.status)) {
    return { success: false, error: "File tidak dapat dihapus setelah laporan diajukan." }
  }

  const { error } = await adminSupabase
    .from("report_files")
    .delete()
    .eq("id", fileId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
