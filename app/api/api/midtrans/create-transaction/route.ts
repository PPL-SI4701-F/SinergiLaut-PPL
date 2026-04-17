/**
 * POST /api/midtrans/create-transaction
 * Membuat Midtrans Snap transaction dan mengembalikan snapToken + redirectUrl
 *
 * Alur: Frontend → API route ini → Midtrans API → snapToken dikirim kembali ke Frontend
 * Frontend kemudian membuka Midtrans Snap popup menggunakan snapToken.
 */

import { NextRequest, NextResponse } from "next/server"

interface CreateTransactionBody {
  orderId: string
  amount: number
  donorName: string
  donorEmail: string
  activityTitle: string
  itemDetails?: {
    id: string
    price: number
    quantity: number
    name: string
  }[]
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateTransactionBody = await req.json()
    const { orderId, amount, donorName, donorEmail, activityTitle, itemDetails } = body

    // Validasi input
    if (!orderId || !amount || amount < 1000) {
      return NextResponse.json(
        { success: false, error: "Data transaksi tidak valid. Minimal donasi Rp 1.000." },
        { status: 400 }
      )
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      console.error("[Midtrans] MIDTRANS_SERVER_KEY tidak tersedia")
      return NextResponse.json(
        { success: false, error: "Konfigurasi payment gateway tidak ditemukan." },
        { status: 500 }
      )
    }

    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true"
    const midtransBaseUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions"

    // Encode server key ke Base64 (format: serverKey + ":")
    const encodedKey = Buffer.from(`${serverKey}:`).toString("base64")

    const transactionPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: donorName,
        email: donorEmail,
      },
      item_details: itemDetails ?? [
        {
          id: "donation",
          price: amount,
          quantity: 1,
          name: activityTitle.substring(0, 50) || "Donasi Konservasi Laut",
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/donate/success?order_id=${orderId}`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/donate/error?order_id=${orderId}`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/donate/pending?order_id=${orderId}`,
      },
      credit_card: {
        secure: true,
      },
    }

    const midtransResponse = await fetch(midtransBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedKey}`,
      },
      body: JSON.stringify(transactionPayload),
    })

    if (!midtransResponse.ok) {
      const errBody = await midtransResponse.text()
      console.error("[Midtrans] API error:", midtransResponse.status, errBody)
      return NextResponse.json(
        { success: false, error: "Gagal membuat transaksi di payment gateway." },
        { status: 502 }
      )
    }

    const midtransData = await midtransResponse.json()

    return NextResponse.json({
      success: true,
      data: {
        snapToken: midtransData.token,
        redirectUrl: midtransData.redirect_url,
      },
    })
  } catch (err) {
    console.error("[/api/midtrans/create-transaction] error:", err)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    )
  }
}
