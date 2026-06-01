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

/** Ambil laporan yang sudah ada untuk suatu kegiatan */
export async function getActivityReport(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized", data: null }

  const { data, error } = await supabase
    .from("reports")
    .select("*, report_files(*)")
    .eq("activity_id", activityId)
    .maybeSingle()

  if (error) return { success: false, error: error.message, data: null }
  return { success: true, data }
}

/** Buat laporan baru dengan status draft */
export async function createReport(payload: ReportPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized", data: null }

  // Pastikan tidak ada laporan yang sudah ada untuk kegiatan ini
  const { data: existing } = await supabase
    .from("reports")
    .select("id, status")
    .eq("activity_id", payload.activityId)
    .maybeSingle()

  if (existing) {
    return { success: false, error: "Laporan untuk kegiatan ini sudah ada.", data: null }
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      activity_id: payload.activityId,
      community_id: payload.communityId,
      submitted_by: user.id,
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized", data: null }

  const { data, error } = await supabase
    .from("reports")
    .update({
      title: payload.title,
      summary: payload.summary,
      fund_usage: payload.fundUsage,
      completion_status: payload.completionStatus,
    })
    .eq("id", reportId)
    .eq("submitted_by", user.id)
    .in("status", ["draft", "rejected"])
    .select()
    .single()

  if (error) return { success: false, error: error.message, data: null }
  revalidatePath("/community/dashboard")
  return { success: true, data }
}

/** Ajukan laporan ke admin (ubah status dari draft/rejected → submitted) */
export async function submitReport(reportId: string) {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: report, error } = await supabase
    .from("reports")
    .update({ status: "submitted" })
    .eq("id", reportId)
    .eq("submitted_by", user.id)
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
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { error } = await supabase
    .from("report_files")
    .delete()
    .eq("id", fileId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
