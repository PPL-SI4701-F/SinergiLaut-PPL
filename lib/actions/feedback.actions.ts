"use server"

/**
 * SinergiLaut — Feedback Actions
 * Hanya volunteer dengan status 'attended' yang bisa submit rating & feedback.
 */

import { createClient } from "@/lib/supabase/server"

export interface SubmitFeedbackPayload {
  activityId: string
  userId: string
  rating: number
  comment?: string
}

/**
 * Submit atau update feedback untuk kegiatan.
 * Guard: user harus punya volunteer_registration dengan status 'attended'.
 */
export async function submitFeedback(payload: SubmitFeedbackPayload) {
  const supabase = await createClient()

  // Guard: hanya volunteer dengan status attended yang bisa submit
  const { data: reg } = await supabase
    .from("volunteer_registrations")
    .select("id, status")
    .eq("activity_id", payload.activityId)
    .eq("user_id", payload.userId)
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
        user_id: payload.userId,
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
 * Ambil feedback milik user untuk kegiatan tertentu.
 * Digunakan untuk pre-fill form saat edit.
 */
export async function getMyFeedback(activityId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("feedbacks")
    .select("id, rating, comment")
    .eq("activity_id", activityId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[getMyFeedback] error:", error)
    return null
  }

  return data
}
