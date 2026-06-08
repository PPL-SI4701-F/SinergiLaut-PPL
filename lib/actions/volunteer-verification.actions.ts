"use server"

/**
 * SinergiLaut — Volunteer Verification Actions
 * Operasi verifikasi data diri volunteer oleh admin
 */

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import type { VerificationStatus } from "@/lib/types"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { authorized: false as const, userId: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") return { authorized: false as const, userId: null }
  return { authorized: true as const, userId: user.id }
}

/** Submit/update data diri volunteer untuk diverifikasi admin */
export async function submitVolunteerVerification(payload: {
  userId?: string
  fullName: string
  dateOfBirth: string
  nik: string
  gender: string
  address: string
  phone: string
  ktpUrl?: string
}) {
  // Use admin client to bypass RLS – user cannot update volunteer_status themselves
  const sessionSupabase = await createClient()
  const { data: { user }, error: authError } = await sessionSupabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
  }

  const { data: profile } = await sessionSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "user") {
    return { success: false, error: "Hanya pengguna yang dapat mengajukan verifikasi relawan." }
  }

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
    .eq("id", user.id)
    .select()
    .single()

  if (error) {
    console.error("[submitVolunteerVerification] error:", error)
    return { success: false, error: "Gagal mengirim data verifikasi: " + error.message }
  }

  // Notifikasi ke semua admin bahwa ada data diri baru yang perlu diverifikasi
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "Verifikasi Data Diri Baru 🪪",
        `${payload.fullName} mengajukan verifikasi data diri dan menunggu persetujuan admin.`,
        "info",
        "/admin/users"
      )
    }
  }

  return { success: true, data }
}

/** Ambil daftar volunteer yang menunggu verifikasi (untuk admin) */
export async function getVolunteersPendingVerification(statusFilter?: VerificationStatus) {
  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, data: [], error: "Akses ditolak." }

  const adminSupabase = await createAdminClient()

  let query = adminSupabase
    .from("profiles")
    .select("*")
    .eq("role", "user")

  if (statusFilter) {
    query = query.eq("volunteer_status", statusFilter)
  } else {
    // Show all users who have gone through verification (status set)
    query = query.not("volunteer_status", "is", null)
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
  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Forbidden: Admin access required" }

  const adminId = auth.userId

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
    "Verifikasi Data Diri Disetujui",
    "Selamat! Data diri Anda (termasuk KTP) telah diverifikasi oleh admin. Anda kini dapat mendaftar sebagai relawan untuk kegiatan.",
    "success",
    "/user/dashboard"
  )

  return { success: true, data }
}

/** Admin: reject verifikasi volunteer */
export async function rejectVolunteerVerification(userId: string, reason: string) {
  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Forbidden: Admin access required" }

  const adminId = auth.userId

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
    "Verifikasi Data Diri Ditolak",
    `Maaf, verifikasi data diri Anda ditolak. Alasan: ${reason}. Silakan perbaiki dan ajukan ulang.`,
    "error",
    "/user/profile"
  )

  return { success: true, data }
}
