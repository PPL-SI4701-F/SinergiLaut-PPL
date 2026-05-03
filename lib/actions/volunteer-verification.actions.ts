"use server"

/**
 * SinergiLaut — Volunteer Verification Actions
 * Operasi verifikasi data diri volunteer oleh admin
 */

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import type { VerificationStatus } from "@/lib/types"

/** Submit/update data diri volunteer untuk diverifikasi admin */
export async function submitVolunteerVerification(payload: {
  userId: string
  fullName: string
  dateOfBirth: string
  nik: string
  gender: string
  address: string
  phone: string
  ktpUrl?: string
}) {
  // Use admin client to bypass RLS – user cannot update volunteer_status themselves
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: payload.fullName,
      date_of_birth: payload.dateOfBirth,
      nik: payload.nik,
      gender: payload.gender,
      address: payload.address,
      phone: payload.phone,
      ktp_url: payload.ktpUrl ?? null,
      volunteer_status: "pending",
      volunteer_reject_note: null,
    })
    .eq("id", payload.userId)
    .select()
    .single()

  if (error) {
    console.error("[submitVolunteerVerification] error:", error)
    return { success: false, error: "Gagal mengirim data verifikasi: " + error.message }
  }

  return { success: true, data }
}

/** Ambil daftar volunteer yang menunggu verifikasi (untuk admin) */
export async function getVolunteersPendingVerification(statusFilter?: VerificationStatus) {
  const adminSupabase = await createAdminClient()

  let query = adminSupabase
    .from("profiles")
    .select("*")
    .eq("role", "user")

  if (statusFilter) {
    query = query.eq("volunteer_status", statusFilter)
  } else {
    // Show all users who have submitted (have nik filled)
    query = query.not("nik", "is", null)
  }

  const { data, error } = await query.order("updated_at", { ascending: false })

  if (error) {
    console.error("[getVolunteersPendingVerification] error:", error)
    return { success: false, data: [], error: "Gagal mengambil data volunteer." }
  }

  return { success: true, data: data ?? [] }
}

/** Admin: approve verifikasi volunteer */
export async function approveVolunteerVerification(userId: string) {
  const supabase = await createClient()

  // Verify caller is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { success: false, error: "Forbidden: Admin access required" }

  const adminId = user.id

  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
    .from("profiles")
    .update({
      volunteer_status: "approved",
      volunteer_verified_by: adminId,
      volunteer_verified_at: new Date().toISOString(),
      volunteer_reject_note: null,
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("[approveVolunteerVerification] error:", error)
    return { success: false, error: "Gagal menyetujui verifikasi." }
  }

  // Kirim notifikasi ke user
  await createNotification(
    userId,
    "Verifikasi Data Diri Disetujui ✅",
    "Selamat! Data diri Anda (termasuk KTP) telah diverifikasi oleh admin. Anda kini dapat mendaftar sebagai relawan untuk kegiatan.",
    "success",
    "/user/dashboard"
  )

  return { success: true, data }
}

/** Admin: reject verifikasi volunteer */
export async function rejectVolunteerVerification(userId: string, reason: string) {
  const supabase = await createClient()

  // Verify caller is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { success: false, error: "Forbidden: Admin access required" }

  const adminId = user.id

  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
    .from("profiles")
    .update({
      volunteer_status: "rejected",
      volunteer_verified_by: adminId,
      volunteer_verified_at: new Date().toISOString(),
      volunteer_reject_note: reason,
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("[rejectVolunteerVerification] error:", error)
    return { success: false, error: "Gagal menolak verifikasi." }
  }

  // Kirim notifikasi ke user
  await createNotification(
    userId,
    "Verifikasi Data Diri Ditolak ❌",
    `Maaf, verifikasi data diri Anda ditolak. Alasan: ${reason}. Silakan perbaiki dan ajukan ulang.`,
    "error",
    "/user/profile"
  )

  return { success: true, data }
}
