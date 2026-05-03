"use server"

/**
 * SinergiLaut — Disbursement Actions
 * Mengelola pencairan dana dari Rekening SinergiLaut ke Rekening Komunitas
 * Hanya admin yang dapat memproses disbursement.
 */

import { createClient, createAdminClient } from "@/lib/supabase/server"

export interface CreateDisbursementPayload {
  activityId: string
  communityId: string
  amount: number
  platformFee?: number
  bankName: string
  accountNumber: string
  accountName: string
  notes?: string
  disbursedBy: string  // admin's user ID
}

export async function createDisbursement(payload: Omit<CreateDisbursementPayload, "disbursedBy">) {
  const supabase = await createClient()

  // Verify caller is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { success: false, error: "Forbidden: Admin access required" }

  const adminId = user.id

  const adminSupabase = await createAdminClient()

  // Hitung total donasi completed untuk activity ini (validasi)
  const { data: donationSum } = await adminSupabase
    .from("donations")
    .select("amount")
    .eq("activity_id", payload.activityId)
    .eq("status", "completed")
    .eq("type", "money")

  const totalCollected = (donationSum ?? []).reduce(
    (sum: number, d) => sum + (d.amount ?? 0), 0
  )

  // Ambil total disbursement sebelumnya untuk activity ini
  const { data: prevDisbursements } = await adminSupabase
    .from("disbursements")
    .select("amount")
    .eq("activity_id", payload.activityId)
    .in("status", ["processing", "completed"])

  const totalDisbursed = (prevDisbursements ?? []).reduce(
    (sum: number, d) => sum + (d.amount ?? 0), 0
  )

  const availableBalance = totalCollected - totalDisbursed

  if (payload.amount > availableBalance) {
    return {
      success: false,
      error: `Jumlah pencairan (Rp ${payload.amount.toLocaleString("id-ID")}) melebihi saldo tersedia (Rp ${availableBalance.toLocaleString("id-ID")}).`,
    }
  }

  const { data, error } = await adminSupabase
    .from("disbursements")
    .insert({
      activity_id: payload.activityId,
      community_id: payload.communityId,
      amount: payload.amount,
      platform_fee: payload.platformFee ?? 0,
      status: "pending",
      bank_name: payload.bankName,
      account_number: payload.accountNumber,
      account_name: payload.accountName,
      notes: payload.notes ?? null,
      disbursed_by: adminId,
    })
    .select()
    .single()

  if (error) {
    console.error("[createDisbursement] error:", error)
    return { success: false, error: "Gagal membuat record pencairan." }
  }

  return { success: true, data }
}

/** [Admin] Update status disbursement ke processing atau completed */
export async function updateDisbursementStatus(
  disbursementId: string,
  status: "processing" | "completed" | "failed",
  referenceNumber?: string
) {
  const supabase = await createClient()

  // Verify caller is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { success: false, error: "Forbidden: Admin access required" }

  const updateData: Record<string, unknown> = { status }
  if (referenceNumber) updateData.reference_number = referenceNumber
  if (status === "completed") updateData.disbursed_at = new Date().toISOString()

  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
    .from("disbursements")
    .update(updateData)
    .eq("id", disbursementId)
    .select()
    .single()

  if (error) {
    console.error("[updateDisbursementStatus] error:", error)
    return { success: false, error: "Gagal mengupdate status pencairan." }
  }

  return { success: true, data }
}

/** [Admin] Ambil semua disbursement */
export async function getAllDisbursements() {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("disbursements")
    .select(`
      *,
      activity:activities(id, title),
      community:communities(id, name, logo_url),
      admin:profiles!disbursements_disbursed_by_fkey(id, full_name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getAllDisbursements] error:", error)
    return { success: false, data: [], error: "Gagal mengambil data pencairan." }
  }

  return { success: true, data }
}

/** [Community] Ambil disbursement untuk komunitas tertentu */
export async function getCommunityDisbursements(communityId: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("disbursements")
    .select(`
      *,
      activity:activities(id, title, start_date)
    `)
    .eq("community_id", communityId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getCommunityDisbursements] error:", error)
    return { success: false, data: [], error: "Gagal mengambil data pencairan komunitas." }
  }

  return { success: true, data }
}

/** Hitung ringkasan keuangan untuk satu activity */
export async function getActivityFinanceSummary(activityId: string) {
  const supabase = await createAdminClient()

  const [donationsRes, disbursementsRes] = await Promise.all([
    supabase
      .from("donations")
      .select("amount, status, type")
      .eq("activity_id", activityId)
      .eq("type", "money"),
    supabase
      .from("disbursements")
      .select("amount, platform_fee, status")
      .eq("activity_id", activityId),
  ])

  const donations = donationsRes.data ?? []
  const disbursements = disbursementsRes.data ?? []

  const totalCollected = donations
    .filter((d) => d.status === "completed")
    .reduce((sum: number, d) => sum + (d.amount ?? 0), 0)

  const pendingPayments = donations
    .filter((d) => d.status === "pending")
    .reduce((sum: number, d) => sum + (d.amount ?? 0), 0)

  const totalDisbursed = disbursements
    .filter((d) => d.status === "completed")
    .reduce((sum: number, d) => sum + (d.amount ?? 0), 0)

  const totalPlatformFee = disbursements
    .filter((d) => d.status === "completed")
    .reduce((sum: number, d) => sum + (d.platform_fee ?? 0), 0)

  const availableBalance = totalCollected - totalDisbursed - totalPlatformFee

  return {
    totalCollected,
    pendingPayments,
    totalDisbursed,
    totalPlatformFee,
    availableBalance,
  }
}
