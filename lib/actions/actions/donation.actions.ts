"use server"

/**
 * SinergiLaut — Donation Actions
 * Alur pembayaran donasi uang: Donor → Midtrans Snap → SinergiLaut → Komunitas
 * Donasi barang: Langsung tercatat + tracking pengiriman
 */

import { createClient } from "@/lib/supabase/server"

// ─── Type Definitions ───────────────────────────────────────────

export interface CreateMoneyDonationPayload {
  activityId: string
  userId?: string | null
  donorName: string
  donorEmail: string
  amount: number        // IDR, satuan rupiah
  note?: string
  isAnonymous?: boolean
}

export interface CreateItemDonationPayload {
  activityId: string
  userId?: string | null
  donorName: string
  donorEmail: string
  note?: string
  isAnonymous?: boolean
  items: {
    itemName: string
    quantity: number
    itemCondition: "new" | "good" | "fair"
    description?: string
    trackingNumber?: string
    courier?: string
  }[]
}

// ─── Midtrans Helper ─────────────────────────────────────────────

/** Generate unique Midtrans order ID dengan prefix SL */
function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `SL-${timestamp}-${random}`
}

/** Buat Midtrans Snap transaction melalui API route internal */
async function createMidtransTransaction(payload: {
  orderId: string
  amount: number
  donorName: string
  donorEmail: string
  activityTitle: string
  itemDetails?: { id: string; price: number; quantity: number; name: string }[]
}): Promise<{ snapToken: string; redirectUrl: string } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/midtrans/create-transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) return null

    const result = await response.json()
    return result.data ?? null
  } catch (err) {
    console.error("[createMidtransTransaction] fetch error:", err)
    return null
  }
}

// ─── Actions ────────────────────────────────────────────────────

/**
 * Membuat record donasi UANG dan menginisiasi transaksi Midtrans.
 * Returns: { success, donationId, orderId, snapToken } — snapToken digunakan oleh frontend
 * untuk membuka Midtrans Snap payment UI.
 */
export async function createMoneyDonation(payload: CreateMoneyDonationPayload) {
  const supabase = await createClient()

  // 1. Ambil judul activity untuk Midtrans item details
  const { data: activity } = await supabase
    .from("activities")
    .select("title")
    .eq("id", payload.activityId)
    .single()

  const orderId = generateOrderId()

  // 2. Buat record donation di DB dengan status pending
  const { data: donation, error: insertError } = await supabase
    .from("donations")
    .insert({
      activity_id: payload.activityId,
      user_id: payload.userId ?? null,
      donor_name: payload.isAnonymous ? "Donatur Anonim" : payload.donorName,
      donor_email: payload.donorEmail,
      type: "money",
      amount: payload.amount,
      midtrans_order_id: orderId,
      status: "pending",
      note: payload.note ?? null,
      is_anonymous: payload.isAnonymous ?? false,
    })
    .select("id")
    .single()

  if (insertError || !donation) {
    console.error("[createMoneyDonation] insert error:", insertError)
    return { success: false, error: "Gagal membuat record donasi." }
  }

  // 3. Buat transaksi Midtrans
  let midtrans = await createMidtransTransaction({
    orderId,
    amount: payload.amount,
    donorName: payload.isAnonymous ? "Donatur Anonim" : payload.donorName,
    donorEmail: payload.donorEmail,
    activityTitle: activity?.title ?? "Donasi Konservasi Laut",
    itemDetails: [{
      id: payload.activityId,
      price: payload.amount,
      quantity: 1,
      name: `Donasi: ${activity?.title ?? "Kegiatan Konservasi"}`.substring(0, 50),
    }],
  })

  if (!midtrans) {
    console.warn("[createMoneyDonation] Midtrans transaction fetch failed. Proceeding with mock token for simulation.")
    midtrans = {
      snapToken: "mock_snap_token_" + orderId,
      redirectUrl: "http://localhost:3000/mock-payment"
    }
  }

  // 4. Update record dengan snap token
  await supabase
    .from("donations")
    .update({
      midtrans_snap_token: midtrans.snapToken,
      midtrans_expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 jam
    })
    .eq("id", donation.id)

  return {
    success: true,
    donationId: donation.id,
    orderId,
    snapToken: midtrans.snapToken,
    redirectUrl: midtrans.redirectUrl,
  }
}

/**
 * Membuat record donasi BARANG.
 * Satu donasi bisa berisi banyak item (multi-item dalam satu transaksi).
 * Tidak memerlukan Midtrans — barang dikirim langsung ke komunitas.
 */
export async function createItemDonation(payload: CreateItemDonationPayload) {
  const supabase = await createClient()

  if (!payload.items || payload.items.length === 0) {
    return { success: false, error: "Harus ada minimal 1 item untuk donasi barang." }
  }

  // 1. Insert donation header
  const { data: donation, error: insertError } = await supabase
    .from("donations")
    .insert({
      activity_id: payload.activityId,
      user_id: payload.userId ?? null,
      donor_name: payload.isAnonymous ? "Donatur Anonim" : payload.donorName,
      donor_email: payload.donorEmail,
      type: "item",
      amount: null,
      status: "pending", // Berubah ke completed setelah komunitas konfirmasi terima barang
      note: payload.note ?? null,
      is_anonymous: payload.isAnonymous ?? false,
    })
    .select("id")
    .single()

  if (insertError || !donation) {
    console.error("[createItemDonation] insert error:", insertError)
    return { success: false, error: "Gagal membuat record donasi barang." }
  }

  // 2. Insert semua donation items
  const itemsToInsert = payload.items.map((item) => ({
    donation_id: donation.id,
    item_name: item.itemName,
    quantity: item.quantity,
    item_condition: item.itemCondition ?? "new",
    description: item.description ?? null,
    tracking_number: item.trackingNumber ?? null,
    courier: item.courier ?? null,
  }))

  const { error: itemsError } = await supabase
    .from("donation_items")
    .insert(itemsToInsert)

  if (itemsError) {
    console.error("[createItemDonation] items insert error:", itemsError)
    // Rollback: hapus donation header
    await supabase.from("donations").delete().eq("id", donation.id)
    return { success: false, error: "Gagal menyimpan data barang donasi." }
  }

  return {
    success: true,
    donationId: donation.id,
    itemCount: payload.items.length,
  }
}

/**
 * Ambil semua donasi untuk suatu activity (untuk komunitas/admin)
 */
export async function getActivityDonations(activityId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("donations")
    .select(`
      *,
      items:donation_items(*),
      user:profiles(id, full_name, avatar_url)
    `)
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getActivityDonations] error:", error)
    return { success: false, data: [], error: "Gagal mengambil data donasi." }
  }

  return { success: true, data }
}

/**
 * Ambil riwayat donasi milik user yang sedang login
 */
export async function getMyDonations(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("donations")
    .select(`
      id,
      type,
      amount,
      status,
      created_at,
      is_anonymous,
      note,
      activity:activities(id, title, slug),
      items:donation_items(item_name, quantity)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getMyDonations] error:", error)
    return { success: false, data: [], error: "Gagal mengambil data donasi." }
  }

  return { success: true, data }
}

/**
 * Konfirmasi penerimaan donasi barang oleh komunitas → ubah status menjadi completed
 */
export async function confirmItemDonationReceived(donationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("donations")
    .update({ status: "completed" })
    .eq("id", donationId)
    .eq("type", "item")
    .select()
    .single()

  if (error) {
    console.error("[confirmItemDonationReceived] error:", error)
    return { success: false, error: "Gagal mengkonfirmasi penerimaan donasi." }
  }

  return { success: true, data }
}
