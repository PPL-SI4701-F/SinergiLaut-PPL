"use server"
 
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/actions/notification.actions"
import { cookies } from "next/headers"

async function getE2EMock() {
  if (process.env.NODE_ENV === 'production') return null
  try {
    const cookieStore = await cookies()
    return cookieStore.get('e2e-bypass-auth')?.value || null
  } catch {
    return null
  }
}
 
export async function createActivity(formData: FormData) {
  try {
    const isE2E = await getE2EMock()
    if (isE2E) {
      return { success: true }
    }

    const supabase = await createClient()
    const adminSupabase = await createAdminClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !userData.user) {
      return { success: false, error: "Gagal mengambil sesi pengguna. Pastikan Anda sudah login." }
    }
    const user = userData.user

    // Check community using admin client to bypass RLS issues, but securely filtering by user.id
    const { data: community, error: commError } = await adminSupabase
      .from("communities")
      .select("id")
      .eq("owner_id", user.id)
      .eq("is_verified", true)
      .limit(1)
      .maybeSingle()

    if (commError || !community) {
      console.error("[createActivity] error getting community:", commError, "user.id:", user.id)
      return { success: false, error: "Akun ini tidak memiliki komunitas terverifikasi. Pastikan komunitas Anda sudah disetujui oleh admin." }
    }

    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.replace(" ", "") || "sinergilaut-assets"

    // 1. Upload Cover Image
    let cover_image_url = null
    const coverImage = formData.get("coverImage") as File | null
    if (coverImage && coverImage.size > 0) {
      const fileExt = coverImage.name.split('.').pop()
      const fileName = `activity_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const { error: uploadError } = await adminSupabase.storage
        .from(bucketName)
        .upload(`activities/${fileName}`, coverImage)
      
      if (uploadError) {
        console.error("Cover upload err:", uploadError)
        return { success: false, error: "Gagal mengupload gambar sampul. (Pastikan bucket storage tersedia)" }
      }
      const { data: publicUrlData } = adminSupabase.storage.from(bucketName).getPublicUrl(`activities/${fileName}`)
      cover_image_url = publicUrlData.publicUrl
    }

    // 2. Upload Nota Images
    const nota_urls: string[] = []
    const allowItemDonation = formData.get("allowItemDonation") === "true"
    
    if (allowItemDonation) {
      const notaFiles = formData.getAll("notaFiles") as File[]
      for (const nota of notaFiles) {
        if (nota.size > 0) {
          const ext = nota.name.split('.').pop()
          const notaName = `nota_${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`
          const { error: notaUploadErr } = await adminSupabase.storage
            .from(bucketName)
            .upload(`activity-receipts/${notaName}`, nota)
          
          if (!notaUploadErr) {
            const { data: notaUrlData } = adminSupabase.storage.from(bucketName).getPublicUrl(`activity-receipts/${notaName}`)
            nota_urls.push(notaUrlData.publicUrl)
          } else {
            console.error("Nota upload error:", notaUploadErr)
          }
        }
      }
    }

    // 3. Extract basic fields
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const executionDate = formData.get("executionDate") as string
    const location = formData.get("location") as string
    
    const rawLat = formData.get("latitude") as string
    const rawLng = formData.get("longitude") as string
    const latitude = rawLat ? parseFloat(rawLat) : null
    const longitude = rawLng ? parseFloat(rawLng) : null
    
    const volunteerQuota = parseInt(formData.get("volunteerQuota") as string) || 0
    const fundingGoal = parseInt(formData.get("fundingGoal") as string) || 0
    
    const isDraft = formData.get("isDraft") === "true"

    // 4. Extract needed items (JSON stringified array from client)
    let items_needed = null
    const rawItemsNeeded = formData.get("itemsNeeded") as string
    if (allowItemDonation && rawItemsNeeded) {
      try {
        const parsed = JSON.parse(rawItemsNeeded)
        if (Array.isArray(parsed) && parsed.length > 0) {
          items_needed = parsed
        }
      } catch (e) {
        console.error("Error parsing itemsNeeded:", e)
      }
    }

    // 5. Insert to DB
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

    const payload = {
      community_id: community.id,
      title,
      slug,
      description,
      category,
      status: isDraft ? 'draft' : 'pending_review',
      start_date: new Date(startDate).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      execution_date: new Date(executionDate).toISOString(),
      location,
      latitude,
      longitude,
      volunteer_quota: volunteerQuota,
      funding_goal: fundingGoal,
      allow_item_donation: allowItemDonation,
      items_needed: items_needed,
      receipt_urls: nota_urls.length > 0 ? nota_urls : null,
      cover_image_url,
    }

    const { error: insertError } = await adminSupabase
      .from("activities")
      .insert(payload)

    if (insertError) {
      console.error("DB Insert err:", insertError)
      return { success: false, error: insertError.message || "Gagal menyimpan kegiatan ke database." }
    }

    // Notifikasi konfirmasi ke komunitas
    if (!isDraft) {
      await createNotification(
        user.id,
        "Kegiatan Diajukan untuk Review 📋",
        `Kegiatan "${title}" berhasil diajukan dan sedang menunggu persetujuan admin. Kami akan memberitahumu setelah direview.`,
        "info",
        "/community/dashboard"
      )

      // Notifikasi ke semua admin bahwa ada kegiatan baru pending review
      const { data: admins } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await createNotification(
            admin.id,
            "Kegiatan Baru Menunggu Review 📋",
            `Kegiatan "${title}" telah diajukan oleh komunitas dan menunggu persetujuan admin.`,
            "info",
            "/admin/activities"
          )
        }
      }
    } else {
      await createNotification(
        user.id,
        "Kegiatan Disimpan sebagai Draft 📝",
        `Kegiatan "${title}" berhasil disimpan sebagai draft. Kamu bisa melanjutkan dan mengajukannya kapan saja.`,
        "info",
        "/community/dashboard"
      )
    }

    return { success: true }
  } catch (error: any) {
    console.error("[createActivity] error:", error)
    return { success: false, error: error.message || "Terjadi kesalahan internal server." }
  }
}
