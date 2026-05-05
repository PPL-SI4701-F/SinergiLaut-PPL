"use server"

/**
 * SinergiLaut — Journey Milestones Actions
 * Mengelola data "Perjalanan Kami" dari tabel journey_milestones
 */

import { createAdminClient } from "@/lib/supabase/server"

export interface JourneyMilestone {
  id: string
  year: number
  title: string
  description: string
  impact_stat: string | null
  icon: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface UpsertMilestonePayload {
  id?: string
  year: number
  title: string
  description: string
  impact_stat?: string
  icon?: string
  order_index?: number
  is_published?: boolean
}

/** Ambil semua milestone yang dipublish, diurutkan berdasarkan order_index */
export async function getPublishedMilestones(): Promise<JourneyMilestone[]> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("journey_milestones")
    .select("*")
    .eq("is_published", true)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[getPublishedMilestones] error:", error)
    return []
  }

  return data as JourneyMilestone[]
}

/** [Admin] Ambil semua milestone termasuk yang belum dipublish */
export async function getAllMilestones() {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("journey_milestones")
    .select("*")
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[getAllMilestones] error:", error)
    return { success: false, data: [], error: "Gagal mengambil data milestone." }
  }

  return { success: true, data: data as JourneyMilestone[] }
}

/** [Admin] Buat milestone baru */
export async function createMilestone(payload: UpsertMilestonePayload) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("journey_milestones")
    .insert({
      year: payload.year,
      title: payload.title,
      description: payload.description,
      impact_stat: payload.impact_stat ?? null,
      icon: payload.icon ?? "Award",
      order_index: payload.order_index ?? 99,
      is_published: payload.is_published ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error("[createMilestone] error:", error)
    return { success: false, error: "Gagal membuat milestone baru." }
  }

  return { success: true, data }
}

/** [Admin] Update milestone yang sudah ada */
export async function updateMilestone(id: string, payload: Partial<UpsertMilestonePayload>) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("journey_milestones")
    .update({
      year: payload.year,
      title: payload.title,
      description: payload.description,
      impact_stat: payload.impact_stat,
      icon: payload.icon,
      order_index: payload.order_index,
      is_published: payload.is_published,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[updateMilestone] error:", error)
    return { success: false, error: "Gagal mengupdate milestone." }
  }

  return { success: true, data }
}

/** [Admin] Hapus milestone */
export async function deleteMilestone(id: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("journey_milestones")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[deleteMilestone] error:", error)
    return { success: false, error: "Gagal menghapus milestone." }
  }

  return { success: true }
}
