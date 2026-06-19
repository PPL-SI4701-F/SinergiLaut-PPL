"use server"

/**
 * SinergiLaut — Donation Actions
 *
 * Alur donasi uang:
 *   1. createMoneyDonation()  → simpan record status "pending"
 *   2. [frontend] tampilkan payment simulation dialog
 *   3. completeMoneyDonation() → ubah status "completed"
 *      DB trigger on_donation_status_change otomatis update activities.funding_raised
 *
 * Alur donasi barang (fulfillment):
 *   1. createItemDonation()          → simpan record + items, status "pending"
 *   2. [frontend] tampilkan payment simulation dialog
 *   3. completeFulfillmentDonation() → ubah status "completed" + update items_needed
 */

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import { cookies } from "next/headers"

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

async function requireCommunityOrAdminDonationAccess(donationId: string) {
  const adminSupabase = await createAdminClient()
  const { data: donation } = await adminSupabase
    .from("donations")
    .select("activity_id")
    .eq("id", donationId)
    .maybeSingle()

  if (!donation?.activity_id) {
    return { authorized: false as const, error: "Donasi tidak ditemukan." }
  }

  return requireCommunityOrAdminActivityAccess(donation.activity_id)
}

/** Markup biaya operasional yang dikenakan ke donatur untuk donasi barang (lihat MARKUP_PERCENT di app/activities/[id]/page.tsx) */
const MARKUP_PERCENT = 10

async function validateDonationWindow(activityId: string) {
  const adminSupabase = await createAdminClient()
  const { data: activity, error } = await adminSupabase
    .from("activities")
    .select("id, end_date, published_at, created_at")
    .eq("id", activityId)
    .maybeSingle()

  if (error || !activity) {
    return { valid: false as const, error: "Kegiatan tidak ditemukan." }
  }

  const publishedAt = activity.published_at ?? activity.created_at
  const deadline = activity.end_date
    ? new Date(activity.end_date)
    : new Date(new Date(publishedAt).setMonth(new Date(publishedAt).getMonth() + 6))

  if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) {
    return { valid: false as const, error: "Batas waktu pengumpulan donasi telah berakhir." }
  }

  return { valid: true as const }
}

async function getE2EMock() {
  if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_E2E_TESTING !== 'true') return null
  try {
    const cookieStore = await cookies()
    return cookieStore.get('e2e-bypass-auth')?.value || null
  } catch {
    return null
  }
}

// ─── Type Definitions ───────────────────────────────────────────

export interface CreateMoneyDonationPayload {
  activityId: string
  userId?: string | null
  donorName: string
  donorEmail: string
  amount: number
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

interface ActivityWithCommunity {
  title: string
  funding_raised?: number
  communities: { owner_id: string } | null
}

// ─── Actions ────────────────────────────────────────────────────

/**
 * Simpan record donasi UANG dengan status "pending".
 * Panggil completeMoneyDonation() setelah user konfirmasi pembayaran.
 */
export async function createMoneyDonation(payload: CreateMoneyDonationPayload) {
  const donationWindow = await validateDonationWindow(payload.activityId)
  if (!donationWindow.valid) {
    return { success: false as const, error: donationWindow.error }
  }

  const adminSupabase = await createAdminClient()

  const { data: donation, error } = await adminSupabase
    .from("donations")
    .insert({
      activity_id: payload.activityId,
      user_id: payload.userId ?? null,
      donor_name: payload.isAnonymous ? "Donatur Anonim" : payload.donorName,
      donor_email: payload.donorEmail,
      type: "money",
      amount: payload.amount,
      status: "pending",
      note: payload.note ?? null,
      is_anonymous: payload.isAnonymous ?? false,
    })
    .select("id")
    .single()

  if (error || !donation) {
    console.error("[createMoneyDonation] insert error:", error)
    return { success: false as const, error: "Gagal membuat record donasi." }
  }

  return { success: true as const, donationId: donation.id }
}

/**
 * Selesaikan donasi UANG setelah pembayaran dikonfirmasi.
 * Status berubah → "completed"; DB trigger otomatis menambah activities.funding_raised.
 * Kirim notifikasi ke donor dan komunitas.
 */
export async function completeMoneyDonation(donationId: string) {
  const adminSupabase = await createAdminClient()

  const { data: donation, error: fetchError } = await adminSupabase
    .from("donations")
    .select("id, amount, activity_id, user_id, donor_name, is_anonymous")
    .eq("id", donationId)
    .eq("status", "pending")
    .single()

  if (fetchError || !donation) {
    console.error("[completeMoneyDonation] fetch error:", fetchError)
    return { success: false as const, error: "Donasi tidak ditemukan atau sudah diproses." }
  }

  const { data: activityBeforeUpdate } = await adminSupabase
    .from("activities")
    .select("funding_raised")
    .eq("id", donation.activity_id)
    .single()

  const previousFundingRaised = Number(activityBeforeUpdate?.funding_raised ?? 0)
  const donationAmount = Number(donation.amount ?? 0)

  // Update status → completed (DB trigger on_donation_status_change akan update funding_raised)
  const { error: updateError } = await adminSupabase
    .from("donations")
    .update({ status: "completed" })
    .eq("id", donationId)

  if (updateError) {
    console.error("[completeMoneyDonation] update error:", updateError)
    return { success: false as const, error: "Gagal menyelesaikan donasi." }
  }

  // Ambil funding_raised terbaru (sudah diupdate oleh trigger) + data notifikasi
  let { data: activity } = await adminSupabase
    .from("activities")
    .select("title, funding_raised, communities(owner_id)")
    .eq("id", donation.activity_id)
    .single() as { data: ActivityWithCommunity | null }

  const expectedFundingRaised = previousFundingRaised + donationAmount
  if (activity && Number(activity.funding_raised ?? 0) < expectedFundingRaised) {
    const { data: fallbackActivity, error: fallbackError } = await adminSupabase
      .from("activities")
      .update({ funding_raised: expectedFundingRaised })
      .eq("id", donation.activity_id)
      .select("title, funding_raised, communities(owner_id)")
      .single() as { data: ActivityWithCommunity | null, error: { message?: string } | null }

    if (fallbackError) {
      console.error("[completeMoneyDonation] fallback funding update error:", fallbackError)
    } else if (fallbackActivity) {
      activity = fallbackActivity
    }
  }

  const activityTitle = activity?.title ?? "kegiatan"
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(donation.amount ?? 0)

  if (donation.user_id) {
    await createNotification(
      donation.user_id,
      "Donasi Berhasil! 🎉",
      `Donasi ${formattedAmount} untuk kegiatan "${activityTitle}" berhasil dicatat. Terima kasih atas kontribusimu!`,
      "success",
      "/user/dashboard"
    )
  }

  const ownerId = activity?.communities?.owner_id
  if (ownerId) {
    const donorLabel = donation.is_anonymous ? "Donatur Anonim" : donation.donor_name
    await createNotification(
      ownerId,
      "Donasi Baru Masuk! 💰",
      `${donorLabel} berhasil mendonasikan ${formattedAmount} untuk kegiatan "${activityTitle}".`,
      "success",
      "/community/dashboard"
    )
  }

  return {
    success: true as const,
    funding_raised: activity?.funding_raised ?? 0,
  }
}

/**
 * Simpan record donasi BARANG (fulfillment) dengan status "pending".
 * Panggil completeFulfillmentDonation() setelah pembayaran dikonfirmasi.
 */
export async function createItemDonation(payload: CreateItemDonationPayload) {
  if (!payload.items || payload.items.length === 0) {
    return { success: false as const, error: "Harus ada minimal 1 item untuk donasi barang." }
  }

  const donationWindow = await validateDonationWindow(payload.activityId)
  if (!donationWindow.valid) {
    return { success: false as const, error: donationWindow.error }
  }

  const adminSupabase = await createAdminClient()

  const { data: donation, error: insertError } = await adminSupabase
    .from("donations")
    .insert({
      activity_id: payload.activityId,
      user_id: payload.userId ?? null,
      donor_name: payload.isAnonymous ? "Donatur Anonim" : payload.donorName,
      donor_email: payload.donorEmail,
      type: "item",
      amount: null,
      status: "pending",
      note: payload.note ?? null,
      is_anonymous: payload.isAnonymous ?? false,
    })
    .select("id")
    .single()

  if (insertError || !donation) {
    console.error("[createItemDonation] insert error:", insertError)
    return { success: false as const, error: "Gagal membuat record donasi barang." }
  }

  const itemsToInsert = payload.items.map((item) => ({
    donation_id: donation.id,
    item_name: item.itemName,
    quantity: item.quantity,
    item_condition: item.itemCondition ?? "new",
    description: item.description ?? null,
    tracking_number: item.trackingNumber ?? null,
    courier: item.courier ?? null,
  }))

  const { error: itemsError } = await adminSupabase
    .from("donation_items")
    .insert(itemsToInsert)

  if (itemsError) {
    console.error("[createItemDonation] items insert error:", itemsError)
    await adminSupabase.from("donations").delete().eq("id", donation.id)
    return { success: false as const, error: "Gagal menyimpan data barang donasi." }
  }

  const { data: activity } = await adminSupabase
    .from("activities")
    .select("title, communities(owner_id)")
    .eq("id", payload.activityId)
    .single() as { data: ActivityWithCommunity | null }

  const activityTitle = activity?.title ?? "kegiatan"
  const communityOwnerId = activity?.communities?.owner_id

  if (payload.userId) {
    await createNotification(
      payload.userId,
      "Donasi Barang Didaftarkan 📦",
      `${payload.items.length} jenis barang untuk kegiatan "${activityTitle}" berhasil dicatat. Lanjutkan pembayaran untuk menyelesaikan.`,
      "info",
      "/user/dashboard"
    )
  }

  if (communityOwnerId) {
    const donorLabel = payload.isAnonymous ? "Donatur Anonim" : payload.donorName
    await createNotification(
      communityOwnerId,
      "Donasi Barang Masuk 📦",
      `${donorLabel} mendaftarkan ${payload.items.length} jenis barang untuk kegiatan "${activityTitle}". Menunggu konfirmasi pembayaran.`,
      "info",
      "/community/dashboard"
    )
  }

  return { success: true as const, donationId: donation.id, itemCount: payload.items.length }
}

/**
 * Selesaikan donasi BARANG setelah pembayaran dikonfirmasi.
 * Update status → "completed" + perbarui items_needed di activities.
 * Increment donated count diambil dari DB (donation_items), bukan dari client.
 */
export async function completeFulfillmentDonation(
  donationId: string,
  activityId: string,
) {
  const adminSupabase = await createAdminClient()

  // Verifikasi donasi masih pending
  const { data: donation, error: donationFetchError } = await adminSupabase
    .from("donations")
    .select("id")
    .eq("id", donationId)
    .eq("status", "pending")
    .single()

  if (donationFetchError || !donation) {
    return { success: false as const, error: "Donasi tidak ditemukan atau sudah diproses." }
  }

  // Ambil item yang didonasikan dari DB (server-side, bukan dari client)
  const { data: donationItems, error: itemsError } = await adminSupabase
    .from("donation_items")
    .select("item_name, quantity")
    .eq("donation_id", donationId)

  if (itemsError || !donationItems) {
    console.error("[completeFulfillmentDonation] fetch items error:", itemsError)
    return { success: false as const, error: "Gagal mengambil data barang donasi." }
  }

  // Ambil items_needed saat ini dari DB
  const { data: activity, error: activityFetchError } = await adminSupabase
    .from("activities")
    .select("items_needed, funding_raised")
    .eq("id", activityId)
    .single()

  if (activityFetchError || !activity) {
    console.error("[completeFulfillmentDonation] fetch activity error:", activityFetchError)
    return { success: false as const, error: "Gagal mengambil data kegiatan." }
  }

  const currentItems = activity.items_needed
  if (!Array.isArray(currentItems)) {
    return { success: false as const, error: "Data barang kegiatan tidak valid." }
  }

  const previousFundingRaised = Number(activity.funding_raised ?? 0)

  // Hitung nilai donasi (harga + markup operasional) berdasarkan unit_price dari DB
  const fulfillmentValue = currentItems.reduce((sum: number, item: { item_name: string; unit_price?: number }) => {
    const fulfilled = donationItems.find((di) => di.item_name === item.item_name)
    if (!fulfilled) return sum
    const markedUpPrice = Math.round((item.unit_price || 0) * (100 + MARKUP_PERCENT) / 100)
    return sum + markedUpPrice * (fulfilled.quantity || 0)
  }, 0)

  // Update status donation → completed + catat nilainya (trigger akan menambah funding_raised)
  const { error: donationError } = await adminSupabase
    .from("donations")
    .update({ status: "completed", amount: fulfillmentValue })
    .eq("id", donationId)

  if (donationError) {
    console.error("[completeFulfillmentDonation] update donation error:", donationError)
    return { success: false as const, error: "Gagal menyelesaikan donasi barang." }
  }

  // Hitung increment berdasarkan data donation_items dari DB
  const updatedItems = currentItems.map((item: { item_name: string; target: number; donated: number; unit_price?: number }) => {
    if (!item.item_name || typeof item.target !== "number" || typeof item.donated !== "number") return item
    const fulfilled = donationItems.find((di) => di.item_name === item.item_name)
    if (!fulfilled) return item
    return {
      ...item,
      donated: Math.min(item.target, (item.donated || 0) + (fulfilled.quantity || 0)),
    }
  })

  const { error: activityError } = await adminSupabase
    .from("activities")
    .update({ items_needed: updatedItems })
    .eq("id", activityId)

  if (activityError) {
    console.error("[completeFulfillmentDonation] update activity error:", activityError)
    return { success: false as const, error: "Gagal memperbarui data barang kegiatan." }
  }

  let finalFundingRaised = previousFundingRaised
  const { data: activityAfterCompletion } = await adminSupabase
    .from("activities")
    .select("funding_raised")
    .eq("id", activityId)
    .single()

  finalFundingRaised = Number(activityAfterCompletion?.funding_raised ?? previousFundingRaised)
  const expectedFundingRaised = previousFundingRaised + fulfillmentValue

  if (finalFundingRaised < expectedFundingRaised) {
    const { data: fallbackActivity, error: fallbackError } = await adminSupabase
      .from("activities")
      .update({ funding_raised: expectedFundingRaised })
      .eq("id", activityId)
      .select("funding_raised")
      .single()

    if (fallbackError) {
      console.error("[completeFulfillmentDonation] fallback funding update error:", fallbackError)
    } else {
      finalFundingRaised = Number(fallbackActivity?.funding_raised ?? expectedFundingRaised)
    }
  }

  return { success: true as const, updatedItems, funding_raised: finalFundingRaised }
}

/**
 * Ambil semua donasi untuk suatu activity (untuk komunitas/admin).
 */
export async function getActivityDonations(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      success: true,
      data: [
        {
          id: 'don-1',
          donor_name: 'Budi',
          donor_email: 'budi@example.com',
          type: 'money',
          amount: 50000,
          status: 'completed',
          created_at: new Date().toISOString(),
          items: [],
          user: null,
          is_anonymous: false
        },
        {
          id: 'don-2',
          donor_name: 'Ani',
          donor_email: 'ani@example.com',
          type: 'money',
          amount: 100000,
          status: 'pending',
          created_at: new Date().toISOString(),
          items: [],
          user: null,
          is_anonymous: false
        }
      ] as any
    }
  }

  const auth = await requireCommunityOrAdminActivityAccess(activityId)
  if (!auth.authorized) return { success: false, data: [], error: auth.error }

  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
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
 * Ambil riwayat donasi milik user tertentu.
 */
export async function getMyDonations(userId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true, data: [] }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || user.id !== userId) {
    return { success: false, data: [], error: "Sesi tidak valid. Silakan login kembali." }
  }

  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
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
 * Konfirmasi penerimaan donasi barang oleh komunitas → status menjadi "completed".
 */
export async function confirmItemDonationReceived(donationId: string) {
  const auth = await requireCommunityOrAdminDonationAccess(donationId)
  if (!auth.authorized) return { success: false, error: auth.error }

  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
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
