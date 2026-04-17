"use server"

/**
 * SinergiLaut — Notification Actions
 * Semua operasi untuk tabel `notifications`
 *
 * Alur per role:
 * - User    → menerima notif saat admin approve/reject pendaftaran volunteer atau verifikasi KTP
 * - Komunitas → menerima notif saat admin approve/reject kegiatan, komunitas, atau laporan;
 *               juga saat ada user baru mendaftar volunteer di kegiatan mereka
 * - Admin   → menerima notif saat ada pendaftaran volunteer baru yang perlu di-review
 */

import { createClient, createAdminClient } from "@/lib/supabase/server"

export type NotificationType = "info" | "success" | "warning" | "error"

/**
 * Buat notifikasi baru untuk user tertentu.
 * Gunakan adminClient agar bisa insert tanpa terbatas RLS (server-side only).
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "info",
  link?: string
) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    link: link ?? null,
    is_read: false,
  })
  if (error) {
    console.error("[createNotification] error:", error)
  }
}

/**
 * Ambil notifikasi milik user yang sedang login (max 30 terbaru).
 */
export async function getMyNotifications() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [] }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30)

  if (error) {
    console.error("[getMyNotifications] error:", error)
    return { success: false, data: [] }
  }
  return { success: true, data: data ?? [] }
}

/**
 * Ambil jumlah notifikasi yang belum dibaca milik user.
 */
export async function getUnreadCount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  return count ?? 0
}

/**
 * Tandai satu notifikasi sebagai sudah dibaca.
 */
export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    console.error("[markNotificationRead] error:", error)
    return { success: false }
  }
  return { success: true }
}

/**
 * Tandai semua notifikasi user sebagai sudah dibaca.
 */
export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    console.error("[markAllNotificationsRead] error:", error)
    return { success: false }
  }
  return { success: true }
}
