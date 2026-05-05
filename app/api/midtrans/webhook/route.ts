/**
 * POST /api/midtrans/webhook
 * Endpoint notifikasi dari Midtrans setelah status pembayaran berubah.
 *
 * Alur:
 * 1. Donor bayar → Midtrans → POST ke endpoint ini
 * 2. Endpoint verifikasi signature Midtrans
 * 3. Update status donation di Supabase
 * 4. Buat notifikasi untuk komunitas
 *
 * Daftarkan URL ini di Midtrans Dashboard:
 *   Sandbox: https://sandbox.dashboard.midtrans.com → Settings → Payment → Notification URL
 *   Production: https://dashboard.midtrans.com → Settings → Payment → Notification URL
 *
 * Format URL: https://yourdomain.com/api/midtrans/webhook
 */

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

interface MidtransNotification {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
  transaction_status: string
  fraud_status?: string
  payment_type?: string
  transaction_id?: string
  va_numbers?: { bank: string; va_number: string }[]
}

/** Verifikasi signature Midtrans untuk keamanan webhook */
function verifySignature(notification: MidtransNotification, serverKey: string): boolean {
  const { order_id, status_code, gross_amount, signature_key } = notification
  const rawString = `${order_id}${status_code}${gross_amount}${serverKey}`
  const computedHash = crypto.createHash("sha512").update(rawString).digest("hex")
  return computedHash === signature_key
}

/** Determine donation status dari transaction_status Midtrans */
function resolveDonationStatus(
  transactionStatus: string,
  fraudStatus?: string
): "pending" | "completed" | "refunded" | null {
  if (transactionStatus === "capture") {
    return fraudStatus === "accept" ? "completed" : "pending"
  }
  if (transactionStatus === "settlement") return "completed"
  if (["cancel", "deny", "expire"].includes(transactionStatus)) return "refunded"
  if (transactionStatus === "pending") return "pending"
  return null
}

export async function POST(req: NextRequest) {
  try {
    const notification: MidtransNotification = await req.json()
    const serverKey = process.env.MIDTRANS_SERVER_KEY

    if (!serverKey) {
      console.error("[Midtrans Webhook] MIDTRANS_SERVER_KEY tidak ada")
      return NextResponse.json({ success: false }, { status: 500 })
    }

    // 1. Verifikasi signature Midtrans
    if (!verifySignature(notification, serverKey)) {
      console.warn("[Midtrans Webhook] Signature tidak valid. Kemungkinan request palsu.")
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 })
    }

    const { order_id, transaction_status, fraud_status, payment_type, transaction_id, va_numbers } = notification
    const supabase = await createClient()

    // 2. Resolve status
    const newStatus = resolveDonationStatus(transaction_status, fraud_status)
    if (!newStatus) {
      // Status tidak dikenal, abaikan tapi kembalikan 200 agar Midtrans tidak retry terus
      return NextResponse.json({ success: true, message: "Status tidak memerlukan update." })
    }

    // 3. Update record donation di Supabase
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      midtrans_transaction_id: transaction_id ?? null,
      midtrans_payment_type: payment_type ?? null,
    }

    // Simpan nomor VA jika ada (bank_transfer)
    if (va_numbers && va_numbers.length > 0) {
      updatePayload.midtrans_va_number = `${va_numbers[0].bank.toUpperCase()} - ${va_numbers[0].va_number}`
    }

    const { data: donation, error: updateError } = await supabase
      .from("donations")
      .update(updatePayload)
      .eq("midtrans_order_id", order_id)
      .select("id, activity_id, donor_name, amount, status")
      .single()

    if (updateError || !donation) {
      console.error("[Midtrans Webhook] Gagal update donation:", updateError)
      // Tetap return 200 agar Midtrans tidak mengirim ulang
      return NextResponse.json({ success: true, message: "Donation not found, skipped." })
    }

    // 4. Kirim notifikasi ke komunitas jika pembayaran berhasil
    if (newStatus === "completed") {
      // Ambil community_id dari activity
      const { data: activity } = await supabase
        .from("activities")
        .select("community_id, title, communities(owner_id)")
        .eq("id", donation.activity_id)
        .single()

      if (activity && activity.communities) {
        const ownerId = Array.isArray(activity.communities) 
          ? activity.communities[0]?.owner_id 
          : (activity.communities as any)?.owner_id

        if (ownerId) {
          const formattedAmount = new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR", minimumFractionDigits: 0,
          }).format(donation.amount ?? 0)

          await supabase.from("notifications").insert({
            user_id: ownerId,
            title: "Donasi Berhasil Diterima! 🎉",
            message: `${donation.donor_name} berhasil mendonasikan ${formattedAmount} untuk kegiatan "${activity.title}".`,
            type: "success",
            link: `/community/dashboard`,
          })
        }
      }
    }

    console.log(`[Midtrans Webhook] order_id=${order_id} → status=${newStatus}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Midtrans Webhook] Error:", err)
    // Return 200 agar Midtrans tidak flood retry
    return NextResponse.json({ success: true, message: "Internal error, logged." })
  }
}
