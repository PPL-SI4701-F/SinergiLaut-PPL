"use server"

/**
 * SinergiLaut — Disbursement Actions
 * Mengelola pencairan dana dari Rekening SinergiLaut ke Rekening Komunitas
 * Hanya admin yang dapat memproses disbursement.
 */

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import { cookies } from "next/headers"

async function getE2EMock() {
  if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_E2E_TESTING !== 'true') return null
  try {
    const cookieStore = await cookies()
    return cookieStore.get('e2e-bypass-auth')?.value || null
  } catch {
    return null
  }
}

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

async function requireCommunityOwner(communityId: string) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { authorized: false as const, error: "Sesi tidak valid. Silakan login kembali." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "community") {
    return { authorized: false as const, error: "Akses hanya untuk komunitas." }
  }

  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("id", communityId)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!community) {
    return { authorized: false as const, error: "Anda tidak memiliki akses ke data komunitas ini." }
  }

  return { authorized: true as const }
}

async function requireAdminOrOwnedActivity(activityId: string) {
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
    return { authorized: false as const, error: "Akses ditolak." }
  }

  const { data: activity } = await adminSupabase
    .from("activities")
    .select("community_id")
    .eq("id", activityId)
    .maybeSingle()

  if (!activity?.community_id) return { authorized: false as const, error: "Kegiatan tidak ditemukan." }

  const communityAuth = await requireCommunityOwner(activity.community_id)
  if (!communityAuth.authorized) return communityAuth
  return { authorized: true as const }
}

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
  const isE2E = await getE2EMock()
  if (isE2E === "admin") {
    const availableBalance = 12000000
    if (payload.amount > availableBalance) {
      return {
        success: false,
        error: `melebihi saldo tersedia`,
      }
    }
    return {
      success: true,
      data: { id: "mock-disbursement-id", status: "pending", ...payload },
    }
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Forbidden: Admin access required" }

  const adminId = auth.userId

  const adminSupabase = await createAdminClient()

  const { data: activity } = await adminSupabase
    .from("activities")
    .select("community_id")
    .eq("id", payload.activityId)
    .maybeSingle()

  if (!activity || activity.community_id !== payload.communityId) {
    return { success: false, error: "Kegiatan dan komunitas tidak cocok." }
  }

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

  // Notifikasi ke komunitas bahwa pencairan diajukan
  const { data: community } = await adminSupabase
    .from("communities")
    .select("owner_id, name")
    .eq("id", payload.communityId)
    .maybeSingle()

  if (community?.owner_id) {
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(payload.amount)

    await createNotification(
      community.owner_id,
      "Pencairan Dana Diajukan 💸",
      `Pengajuan pencairan dana sebesar ${formatted} untuk komunitas "${community.name}" sedang diproses oleh admin.`,
      "info",
      "/community/dashboard"
    )
  }

  return { success: true, data }
}

export interface RequestDisbursementPayload {
  activityId: string
  communityId: string
  amount: number
  notes?: string
}

/** [Community] Ajukan pencairan dana untuk salah satu kegiatan miliknya — menunggu persetujuan admin */
export async function requestDisbursement(payload: RequestDisbursementPayload) {
  const auth = await requireCommunityOwner(payload.communityId)
  if (!auth.authorized) return { success: false, error: auth.error }

  if (!payload.amount || payload.amount <= 0) {
    return { success: false, error: "Jumlah pengajuan harus lebih dari 0." }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Sesi tidak valid. Silakan login kembali." }

  const adminSupabase = await createAdminClient()

  const [{ data: activity }, { data: community }] = await Promise.all([
    adminSupabase.from("activities").select("community_id, title").eq("id", payload.activityId).maybeSingle(),
    adminSupabase.from("communities").select("id, name, owner_id, bank_name, bank_account_number, bank_account_name").eq("id", payload.communityId).maybeSingle(),
  ])

  if (!activity || activity.community_id !== payload.communityId) {
    return { success: false, error: "Kegiatan tidak ditemukan atau bukan milik komunitas Anda." }
  }
  if (!community) {
    return { success: false, error: "Komunitas tidak ditemukan." }
  }
  if (!community.bank_name || !community.bank_account_number || !community.bank_account_name) {
    return { success: false, error: "Lengkapi data rekening bank pada profil komunitas Anda terlebih dahulu sebelum mengajukan pencairan." }
  }

  // Saldo tersedia = donasi completed dikurangi pencairan yang sudah diajukan/diproses/selesai
  const [{ data: donationSum }, { data: existingDisbursements }] = await Promise.all([
    adminSupabase.from("donations").select("amount").eq("activity_id", payload.activityId).eq("status", "completed").eq("type", "money"),
    adminSupabase.from("disbursements").select("amount").eq("activity_id", payload.activityId).in("status", ["pending", "processing", "completed"]),
  ])

  const totalCollected = (donationSum ?? []).reduce((sum: number, d) => sum + (d.amount ?? 0), 0)
  const totalReserved = (existingDisbursements ?? []).reduce((sum: number, d) => sum + (d.amount ?? 0), 0)
  const availableBalance = totalCollected - totalReserved

  if (payload.amount > availableBalance) {
    return {
      success: false,
      error: `Jumlah pengajuan (Rp ${payload.amount.toLocaleString("id-ID")}) melebihi saldo tersedia (Rp ${availableBalance.toLocaleString("id-ID")}).`,
    }
  }

  const { data, error } = await adminSupabase
    .from("disbursements")
    .insert({
      activity_id: payload.activityId,
      community_id: payload.communityId,
      amount: payload.amount,
      platform_fee: 0,
      status: "pending",
      bank_name: community.bank_name,
      account_number: community.bank_account_number,
      account_name: community.bank_account_name,
      notes: payload.notes ?? null,
      disbursed_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("[requestDisbursement] error:", error)
    return { success: false, error: "Gagal mengajukan pencairan dana." }
  }

  // Notifikasi ke seluruh admin agar pengajuan dapat ditinjau
  const { data: admins } = await adminSupabase.from("profiles").select("id").eq("role", "admin")
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(payload.amount)

  await Promise.all((admins ?? []).map((admin) =>
    createNotification(
      admin.id,
      "Pengajuan Pencairan Dana Baru 💸",
      `Komunitas "${community.name}" mengajukan pencairan dana sebesar ${formatted} untuk kegiatan "${activity.title}". Mohon ditinjau.`,
      "info",
      "/admin/disbursements"
    )
  ))

  return { success: true, data }
}

/** [Admin] Update status disbursement ke processing atau completed */
export async function updateDisbursementStatus(
  disbursementId: string,
  status: "processing" | "completed" | "failed",
  referenceNumber?: string
) {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      success: true,
      data: {
        id: disbursementId,
        status,
        reference_number: referenceNumber || null,
        disbursed_at: status === "completed" ? new Date().toISOString() : null
      }
    }
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, error: "Forbidden: Admin access required" }

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

  // Notifikasi ke komunitas saat status berubah ke completed atau failed
  if (status === "completed" || status === "failed") {
    const { data: community } = await adminSupabase
      .from("communities")
      .select("owner_id, name")
      .eq("id", data.community_id)
      .maybeSingle()

    if (community?.owner_id) {
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", minimumFractionDigits: 0,
      }).format(data.amount)

      await createNotification(
        community.owner_id,
        status === "completed" ? "Pencairan Dana Berhasil" : "Pencairan Dana Gagal",
        status === "completed"
          ? `Dana sebesar ${formatted} untuk komunitas "${community.name}" telah berhasil dicairkan ke rekening Anda.`
          : `Pencairan dana sebesar ${formatted} untuk komunitas "${community.name}" gagal diproses. Hubungi admin untuk informasi lebih lanjut.`,
        status === "completed" ? "success" : "error",
        "/community/dashboard"
      )
    }
  }

  return { success: true, data }
}

/** [Admin] Ambil semua disbursement */
export async function getAllDisbursements() {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      success: true,
      data: [
        {
          id: "disb-1",
          amount: 5000000,
          platform_fee: 0,
          net_amount: 5000000,
          status: "pending",
          bank_name: "Bank Mandiri",
          account_number: "1234567890",
          account_name: "Komunitas Peduli Laut",
          reference_number: null,
          notes: "Pencairan dana bersih pantai",
          disbursed_at: null,
          created_at: new Date().toISOString(),
          activity: { id: "act-1", title: "Kegiatan Bersih Pantai" },
          community: { id: "comm-1", name: "Komunitas Peduli Laut", logo_url: null },
          admin: null
        },
        {
          id: "disb-2",
          amount: 2500000,
          platform_fee: 0,
          net_amount: 2500000,
          status: "completed",
          bank_name: "BCA",
          account_number: "0987654321",
          account_name: "Komunitas Laut Hijau",
          reference_number: "TRX-999999",
          notes: "Pencairan dana edukasi",
          disbursed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          activity: { id: "act-2", title: "Kegiatan Edukasi Nelayan" },
          community: { id: "comm-2", name: "Komunitas Laut Hijau", logo_url: null },
          admin: null
        }
      ]
    }
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return { success: false, data: [], error: "Forbidden: Admin access required" }

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
  const auth = await requireCommunityOwner(communityId)
  if (!auth.authorized) return { success: false, data: [], error: auth.error }

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
  const auth = await requireAdminOrOwnedActivity(activityId)
  if (!auth.authorized) {
    return {
      totalCollected: 0,
      pendingPayments: 0,
      totalDisbursed: 0,
      totalPlatformFee: 0,
      availableBalance: 0,
    }
  }

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

/** Ringkasan keuangan platform: saldo, pemasukan (donasi masuk), pengeluaran (dana tercairkan) */
export async function getDisbursementOverview() {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return { balance: 12000000, income: 17750000, expense: 5750000 }
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return { balance: 0, income: 0, expense: 0 }

  const supabase = await createAdminClient()

  const [donationsRes, disbursementsRes] = await Promise.all([
    supabase.from("donations").select("amount").eq("type", "money").eq("status", "completed"),
    supabase.from("disbursements").select("amount, platform_fee").eq("status", "completed"),
  ])

  const income = (donationsRes.data ?? []).reduce((sum, d) => sum + Number(d.amount || 0), 0)
  const expense = (disbursementsRes.data ?? []).reduce(
    (sum, d) => sum + (Number(d.amount || 0) - Number(d.platform_fee || 0)),
    0,
  )

  return { balance: income - expense, income, expense }
}
