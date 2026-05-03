"use server"

/**
 * SinergiLaut — Volunteer Actions
 * Semua operasi CRUD untuk volunteer_registrations ke Supabase
 */

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import type { VolunteerRegistration, VolunteerStatus } from "@/lib/types"

export interface RegisterVolunteerPayload {
  activityId: string
  userId: string
  fullName: string
  email: string
  phone: string
  reason?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  skills?: string[]
  tShirtSize?: string
  agreedToTerms: boolean
}

/** Mendaftarkan user sebagai relawan untuk suatu kegiatan */
export async function registerVolunteer(payload: RegisterVolunteerPayload) {
  const supabase = await createClient()

  const adminSupabase = await createAdminClient()

  // Cek apakah user sudah terdaftar sebelumnya
  const { data: existing } = await adminSupabase
    .from("volunteer_registrations")
    .select("id, status")
    .eq("activity_id", payload.activityId)
    .eq("user_id", payload.userId)
    .single()

  if (existing) {
    return {
      success: false,
      error: `Anda sudah terdaftar sebagai relawan untuk kegiatan ini. Status: ${existing.status}`,
    }
  }

  const { data, error } = await adminSupabase
    .from("volunteer_registrations")
    .insert({
      activity_id: payload.activityId,
      user_id: payload.userId,
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      reason: payload.reason ?? null,
      emergency_contact_name: payload.emergencyContactName ?? null,
      emergency_contact_phone: payload.emergencyContactPhone ?? null,
      skills: payload.skills ?? [],
      t_shirt_size: payload.tShirtSize ?? null,
      agreed_to_terms: payload.agreedToTerms,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("[registerVolunteer] error:", error)
    return { success: false, error: "Gagal mendaftar relawan. Silakan coba lagi." }
  }

  // Kirim notifikasi ke admin (pesan bahwa ada pendaftar baru)
  // Pertama, ambil detail activity + komunitas
  const { data: activityInfo } = await adminSupabase
    .from("activities")
    .select("title, community:communities(owner_id)")
    .eq("id", payload.activityId)
    .single()

  // Notifikasi ke semua admin
  const { data: admins } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")

  const activityTitle = activityInfo?.title ?? "kegiatan"
  const communityOwnerId = (activityInfo?.community as any)?.owner_id

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "Pendaftar Volunteer Baru 👤",
        `${payload.fullName} mendaftar sebagai relawan untuk kegiatan "${activityTitle}".`,
        "info",
        "/admin/users"
      )
    }
  }

  // Notifikasi ke pemilik komunitas
  if (communityOwnerId) {
    await createNotification(
      communityOwnerId,
      "Pendaftar Volunteer Baru 👤",
      `${payload.fullName} mendaftar sebagai relawan untuk kegiatan "${activityTitle}". Segera tinjau pendaftaran.`,
      "info",
      "/community/dashboard"
    )
  }

  return { success: true, data }
}

/** Ambil semua pendaftar relawan untuk activity tertentu (untuk pengelola komunitas) */
export async function getActivityVolunteers(activityId: string) {
  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
    .from("volunteer_registrations")
    .select(`
      *,
      user:profiles(id, full_name, avatar_url, email, phone)
    `)
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getActivityVolunteers] error:", error)
    return { success: false, data: [], error: "Gagal mengambil data relawan." }
  }

  return { success: true, data: data as (VolunteerRegistration & { user: unknown })[] }
}

/** Update status relawan: approved, rejected, atau attended */
export async function updateVolunteerStatus(
  registrationId: string,
  status: Extract<VolunteerStatus, "approved" | "rejected" | "attended">
) {
  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
    .from("volunteer_registrations")
    .update({ status })
    .eq("id", registrationId)
    .select("user_id, full_name, activity_id, activity:activities(title, volunteer_count)")
    .single()

  if (error) {
    console.error("[updateVolunteerStatus] error:", error)
    return { success: false, error: "Gagal mengubah status relawan." }
  }

  // Jika disetujui, tambahkan volunteer_count di tabel activities
  if (status === "approved" && data?.activity_id) {
    const currentCount = (data?.activity as any)?.volunteer_count || 0
    await adminSupabase
      .from("activities")
      .update({ volunteer_count: currentCount + 1 })
      .eq("id", data.activity_id)
  }

  // Kirim notifikasi ke user berdasarkan status baru
  const userId = data?.user_id
  const activityTitle = (data?.activity as any)?.title ?? "kegiatan"
  if (userId) {
    if (status === "approved") {
      await createNotification(
        userId,
        "Pendaftaran Volunteer Disetujui ✅",
        `Selamat! Pendaftaran Anda sebagai relawan untuk kegiatan "${activityTitle}" telah disetujui.`,
        "success",
        "/user/dashboard"
      )
    } else if (status === "rejected") {
      await createNotification(
        userId,
        "Pendaftaran Volunteer Ditolak ❌",
        `Maaf, pendaftaran Anda sebagai relawan untuk kegiatan "${activityTitle}" tidak dapat diterima saat ini.`,
        "error",
        "/user/dashboard"
      )
    } else if (status === "attended") {
      await createNotification(
        userId,
        "Kehadiran Volunteer Dikonfirmasi 🌟",
        `Kehadiran Anda di kegiatan "${activityTitle}" telah dikonfirmasi. Terima kasih telah berkontribusi!`,
        "success",
        "/user/dashboard"
      )
    }
  }

  return { success: true, data }
}

/** Ambil riwayat pendaftaran relawan untuk user yang sedang login */
export async function getMyVolunteerRegistrations(userId: string) {
  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
    .from("volunteer_registrations")
    .select(`
      *,
      activity:activities(id, title, slug, start_date, location, cover_image_url, status,
        community:communities(name, logo_url)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getMyVolunteerRegistrations] error:", error)
    return { success: false, data: [], error: "Gagal mengambil data relawan." }
  }

  return { success: true, data }
}
