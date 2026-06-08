"use server"

/**
 * SinergiLaut — Volunteer Actions
 * Semua operasi CRUD untuk volunteer_registrations ke Supabase
 */

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import type { VolunteerRegistration, VolunteerStatus } from "@/lib/types"
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

async function requireCommunityOrAdminActivityAccess(activityId: string) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { authorized: false as const, error: "Sesi tidak valid. Silakan login kembali." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role === "admin") return { authorized: true as const }
  if (profile?.role !== "community") {
    return { authorized: false as const, error: "Akses hanya untuk komunitas." }
  }

  const { data: activity } = await adminSupabase
    .from("activities")
    .select("community_id")
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

  return { authorized: true as const }
}

async function requireCommunityOrAdminRegistrationAccess(registrationId: string) {
  const adminSupabase = await createAdminClient()
  const { data: registration } = await adminSupabase
    .from("volunteer_registrations")
    .select("activity_id")
    .eq("id", registrationId)
    .maybeSingle()

  if (!registration?.activity_id) {
    return { authorized: false as const, error: "Pendaftaran relawan tidak ditemukan." }
  }

  return requireCommunityOrAdminActivityAccess(registration.activity_id)
}

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
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true, data: { id: "mock-reg-id" } as any }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  const currentUser = authData?.user

  if (authError || !currentUser) {
    return { success: false, error: "Anda harus login terlebih dahulu." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, phone, volunteer_status")
    .eq("id", currentUser.id)
    .maybeSingle()

  if (profileError || !profile) {
    return { success: false, error: "Data profile tidak ditemukan. Silakan login ulang." }
  }

  if (profile.role !== "user") {
    return { success: false, error: "Hanya pengguna yang dapat mendaftar sebagai relawan." }
  }

  if (profile.volunteer_status !== "approved") {
    return { success: false, error: "Data relawan Anda belum disetujui admin." }
  }

  const adminSupabase = await createAdminClient()
  const userId = currentUser.id
  const fullName = profile.full_name || payload.fullName || currentUser.email || "Pengguna"
  const email = profile.email || payload.email || currentUser.email || ""
  const phone = profile.phone || payload.phone || ""

  // Cek apakah user sudah terdaftar sebelumnya
  const { data: existing } = await adminSupabase
    .from("volunteer_registrations")
    .select("id, status")
    .eq("activity_id", payload.activityId)
    .eq("user_id", userId)
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
      user_id: userId,
      full_name: fullName,
      email,
      phone,
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
        `${fullName} mendaftar sebagai relawan untuk kegiatan "${activityTitle}".`,
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
      `${fullName} mendaftar sebagai relawan untuk kegiatan "${activityTitle}". Segera tinjau pendaftaran.`,
      "info",
      "/community/dashboard"
    )
  }

  // Notifikasi konfirmasi ke user yang mendaftar
  await createNotification(
    userId,
    "Pendaftaran Volunteer Dikirim 📋",
    `Pendaftaran Anda sebagai relawan untuk kegiatan "${activityTitle}" sedang diproses. Tunggu konfirmasi dari komunitas.`,
    "info",
    "/user/dashboard"
  )

  return { success: true, data }
}

/** Ambil semua pendaftar relawan untuk activity tertentu (untuk pengelola komunitas) */
export async function getActivityVolunteers(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      success: true,
      data: [
        {
          id: "reg-1",
          activity_id: activityId,
          user_id: "e2e-user-id",
          full_name: "Mock Volunteer",
          email: "mock-volunteer@example.com",
          phone: "081234567890",
          status: "pending",
          created_at: new Date().toISOString(),
          user: {
            id: "e2e-user-id",
            full_name: "Mock Volunteer",
            avatar_url: null,
            email: "mock-volunteer@example.com",
            phone: "081234567890"
          }
        }
      ] as any
    }
  }

  const auth = await requireCommunityOrAdminActivityAccess(activityId)
  if (!auth.authorized) return { success: false, data: [], error: auth.error }

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

/** Update status relawan: approved atau rejected. Untuk "attended" gunakan markVolunteerAttended (wajib unggah bukti foto). */
export async function updateVolunteerStatus(
  registrationId: string,
  status: Extract<VolunteerStatus, "approved" | "rejected">
) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true, data: { id: registrationId } as any }

  const auth = await requireCommunityOrAdminRegistrationAccess(registrationId)
  if (!auth.authorized) return { success: false, error: auth.error }

  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
    .from("volunteer_registrations")
    .update({ status })
    .eq("id", registrationId)
    .select("user_id, full_name, activity_id, activity:activities(title)")
    .single()

  if (error) {
    console.error("[updateVolunteerStatus] error:", error)
    return { success: false, error: "Gagal mengubah status relawan." }
  }

  // volunteer_count diperbarui otomatis oleh DB trigger update_volunteer_count

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
    }
  }

  return { success: true, data }
}

/** Tandai relawan hadir — wajib menyertakan bukti foto/gambar kehadiran */
export async function markVolunteerAttended(registrationId: string, proofFile: File) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true, data: { id: registrationId } as any }

  if (!proofFile || proofFile.size <= 0) {
    return { success: false, error: "Bukti kehadiran wajib diunggah." }
  }
  if (proofFile.size > 5 * 1024 * 1024) {
    return { success: false, error: "Ukuran bukti kehadiran maksimal 5MB." }
  }
  if (proofFile.type && !proofFile.type.startsWith("image/")) {
    return { success: false, error: "Bukti kehadiran harus berupa file gambar." }
  }

  const auth = await requireCommunityOrAdminRegistrationAccess(registrationId)
  if (!auth.authorized) return { success: false, error: auth.error }

  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Sesi tidak valid. Silakan login kembali." }

  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.replace(" ", "") || "sinergilaut-assets"
  const ext = proofFile.name.split(".").pop()
  const path = `volunteer-attendance/${registrationId}/${Date.now()}.${ext}`

  const { error: uploadError } = await adminSupabase.storage.from(bucketName).upload(path, proofFile, { upsert: false })
  if (uploadError) {
    console.error("[markVolunteerAttended] upload error:", uploadError)
    return { success: false, error: "Gagal mengunggah bukti foto kehadiran." }
  }

  const { data: urlData } = adminSupabase.storage.from(bucketName).getPublicUrl(path)

  const { data, error } = await adminSupabase
    .from("volunteer_registrations")
    .update({ status: "attended", attendance_proof_url: urlData.publicUrl })
    .eq("id", registrationId)
    .select("user_id, full_name, activity_id, activity:activities(title)")
    .single()

  if (error) {
    console.error("[markVolunteerAttended] error:", error)
    return { success: false, error: "Gagal mengubah status kehadiran relawan." }
  }

  // volunteer_count diperbarui otomatis oleh DB trigger update_volunteer_count

  const userId = data?.user_id
  const activityTitle = (data?.activity as any)?.title ?? "kegiatan"
  if (userId) {
    await createNotification(
      userId,
      "Kehadiran Volunteer Dikonfirmasi 🌟",
      `Kehadiran Anda di kegiatan "${activityTitle}" telah dikonfirmasi. Terima kasih telah berkontribusi!`,
      "success",
      "/user/dashboard"
    )
  }

  return { success: true, data: { ...data, attendance_proof_url: urlData.publicUrl } }
}

/** Ambil riwayat pendaftaran relawan untuk user yang sedang login */
export async function getMyVolunteerRegistrations(userId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      success: true,
      data: [
        {
          id: "reg-1",
          activity_id: "activity-3",
          user_id: userId,
          status: "approved",
          created_at: new Date().toISOString(),
          activity: {
            id: "activity-3",
            title: "Ongoing Activity 1",
            slug: "ongoing-activity-1",
            start_date: new Date().toISOString(),
            location: "Pantai Indah",
            cover_image_url: null,
            status: "published",
            community: { name: "Eco Ocean", logo_url: null }
          }
        }
      ] as any
    }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || user.id !== userId) {
    return { success: false, data: [], error: "Sesi tidak valid. Silakan login kembali." }
  }

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
