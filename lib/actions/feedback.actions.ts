"use server"

/**
 * SinergiLaut — Feedback Actions
 * Hanya volunteer dengan status 'attended' yang bisa submit rating & feedback.
 */

import { createClient } from "@/lib/supabase/server"
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

export interface SubmitFeedbackPayload {
  activityId: string
  // userId DIHAPUS dari payload — diambil dari server session untuk cegah IDOR
  rating: number
  comment?: string
}

/**
 * Submit atau update feedback untuk kegiatan.
 * Guard: user harus punya volunteer_registration dengan status 'attended'.
 * userId diambil dari server session — tidak bisa dimanipulasi client (cegah IDOR).
 */
export async function submitFeedback(payload: SubmitFeedbackPayload) {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return { success: true, data: { id: "fb-new", rating: payload.rating, comment: payload.comment } }
  }

  const supabase = await createClient()

  // Ambil userId dari server session — tidak bisa dimanipulasi oleh client
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "Anda harus login untuk memberikan ulasan." }
  }
  const userId = user.id

  // Guard: hanya volunteer dengan status attended yang bisa submit
  const { data: reg } = await supabase
    .from("volunteer_registrations")
    .select("id, status")
    .eq("activity_id", payload.activityId)
    .eq("user_id", userId)
    .single()

  if (!reg) {
    return { success: false, error: "Anda tidak terdaftar sebagai relawan kegiatan ini." }
  }

  if (reg.status !== "attended") {
    return {
      success: false,
      error: "Hanya relawan yang telah menghadiri kegiatan (status: Hadir) yang dapat memberikan ulasan.",
    }
  }

  if (payload.rating < 1 || payload.rating > 5) {
    return { success: false, error: "Rating harus antara 1 sampai 5." }
  }

  // Upsert: insert or update jika sudah pernah review
  const { data, error } = await supabase
    .from("feedbacks")
    .upsert(
      {
        activity_id: payload.activityId,
        user_id: userId, // server-verified
        rating: payload.rating,
        comment: payload.comment ?? null,
        is_public: true,
      },
      { onConflict: "activity_id,user_id" }
    )
    .select()
    .single()

  if (error) {
    console.error("[submitFeedback] error:", error)
    return { success: false, error: "Gagal menyimpan ulasan. Silakan coba lagi." }
  }

  return { success: true, data }
}

/**
 * Ambil feedback milik user yang sedang login untuk kegiatan tertentu.
 * userId diambil dari session server — tidak dari parameter client.
 */
export async function getMyFeedback(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return { id: "fb-1", rating: 5, comment: "Kegiatan yang sangat bermanfaat!" }
  }

  const supabase = await createClient()

  // Ambil userId dari server session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("feedbacks")
    .select("id, rating, comment")
    .eq("activity_id", activityId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    console.error("[getMyFeedback] error:", error)
    return null
  }

  return data
}
