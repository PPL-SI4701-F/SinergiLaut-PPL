"use server"
 
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

async function getCurrentVerifiedCommunity() {
  const isE2E = await getE2EMock()
  if (isE2E === 'community') {
    return { authorized: true as const, communityId: 'community-id-123' }
  }

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
    .eq("owner_id", user.id)
    .eq("is_verified", true)
    .limit(1)
    .maybeSingle()

  if (!community) {
    return { authorized: false as const, error: "Komunitas Anda belum terverifikasi." }
  }

  return { authorized: true as const, communityId: community.id }
}

async function requireOwnedActivity(activityId: string) {
  const communityAuth = await getCurrentVerifiedCommunity()
  if (!communityAuth.authorized) return communityAuth

  const adminSupabase = await createAdminClient()
  const { data: activity } = await adminSupabase
    .from("activities")
    .select("id")
    .eq("id", activityId)
    .eq("community_id", communityAuth.communityId)
    .maybeSingle()

  if (!activity) {
    return { authorized: false as const, error: "Kegiatan tidak ditemukan atau bukan milik komunitas Anda." }
  }

  return { authorized: true as const, communityId: communityAuth.communityId }
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

    // Simpan/perbarui rekening pencairan dana komunitas (dipakai admin saat proses pencairan)
    const bankName = (formData.get("bankName") as string)?.trim()
    const bankAccountNumber = (formData.get("bankAccountNumber") as string)?.trim()
    const bankAccountName = (formData.get("bankAccountName") as string)?.trim()

    if (bankName && bankAccountNumber && bankAccountName) {
      await adminSupabase
        .from("communities")
        .update({
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          bank_account_name: bankAccountName,
        })
        .eq("id", community.id)
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

export async function cancelActivityAction(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true }

  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData.user) {
    return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
  }
  const user = userData.user

  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_verified", true)
    .limit(1)
    .maybeSingle()

  if (!community) {
    return { success: false, error: "Akun ini tidak memiliki komunitas terverifikasi." }
  }

  const { data: activity, error: fetchError } = await adminSupabase
    .from("activities")
    .select("id, title, status, community_id")
    .eq("id", activityId)
    .eq("community_id", community.id)
    .maybeSingle()

  if (fetchError || !activity) {
    return { success: false, error: "Kegiatan tidak ditemukan atau bukan milik komunitas Anda." }
  }

  if (activity.status !== "pending_review") {
    return { success: false, error: "Hanya kegiatan yang sedang menunggu review yang dapat dibatalkan." }
  }

  const { error: updateError } = await adminSupabase
    .from("activities")
    .update({ status: "cancelled" })
    .eq("id", activityId)

  if (updateError) {
    return { success: false, error: updateError.message || "Gagal membatalkan kegiatan." }
  }

  return { success: true }
}

/** Komunitas menghapus kegiatan yang sudah dibatalkan secara permanen. */
export async function deleteActivityAction(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true }

  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData.user) {
    return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
  }
  const user = userData.user

  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_verified", true)
    .limit(1)
    .maybeSingle()

  if (!community) {
    return { success: false, error: "Akun ini tidak memiliki komunitas terverifikasi." }
  }

  const { data: activity, error: fetchError } = await adminSupabase
    .from("activities")
    .select("id, title, status, community_id")
    .eq("id", activityId)
    .eq("community_id", community.id)
    .maybeSingle()

  if (fetchError || !activity) {
    return { success: false, error: "Kegiatan tidak ditemukan atau bukan milik komunitas Anda." }
  }

  if (activity.status !== "cancelled") {
    return { success: false, error: "Hanya kegiatan yang sudah dibatalkan yang dapat dihapus." }
  }

  const { error: deleteError } = await adminSupabase
    .from("activities")
    .delete()
    .eq("id", activityId)

  if (deleteError) {
    return { success: false, error: deleteError.message || "Gagal menghapus kegiatan." }
  }

  return { success: true }
}

/** Jendela waktu sejak execution_date di mana kegiatan dianggap "sedang berlangsung" */
const EXECUTION_WINDOW_MS = 24 * 60 * 60 * 1000

/** Komunitas menandai kegiatan sebagai sedang dilaksanakan (published -> ongoing), hanya saat waktu pelaksanaan berlangsung. */
export async function startActivityAction(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true }

  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData.user) {
    return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
  }
  const user = userData.user

  const { data: community } = await adminSupabase
    .from("communities")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_verified", true)
    .limit(1)
    .maybeSingle()

  if (!community) {
    return { success: false, error: "Akun ini tidak memiliki komunitas terverifikasi." }
  }

  const { data: activity, error: fetchError } = await adminSupabase
    .from("activities")
    .select("id, title, status, community_id, execution_date")
    .eq("id", activityId)
    .eq("community_id", community.id)
    .maybeSingle()

  if (fetchError || !activity) {
    return { success: false, error: "Kegiatan tidak ditemukan atau bukan milik komunitas Anda." }
  }

  if (activity.status !== "published") {
    return { success: false, error: "Hanya kegiatan yang aktif yang dapat dilaksanakan." }
  }

  if (!activity.execution_date) {
    return { success: false, error: "Kegiatan ini belum memiliki waktu pelaksanaan." }
  }

  const executionStart = new Date(activity.execution_date).getTime()
  const now = Date.now()
  if (now < executionStart || now >= executionStart + EXECUTION_WINDOW_MS) {
    return { success: false, error: "Kegiatan hanya dapat dilaksanakan saat waktu pelaksanaan yang dijadwalkan sedang berlangsung." }
  }

  const { error: updateError } = await adminSupabase
    .from("activities")
    .update({ status: "ongoing" })
    .eq("id", activityId)

  if (updateError) {
    return { success: false, error: updateError.message || "Gagal melaksanakan kegiatan." }
  }

  return { success: true }
}

/** Komunitas mengajukan permintaan edit untuk kegiatan aktif (published), disertai alasan. Perlu disetujui admin. */
export async function submitActivityEditRequest(activityId: string, reason: string) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true, data: { id: "mock-edit-request-id" } as any }

  const trimmedReason = reason.trim()
  if (!trimmedReason) {
    return { success: false, error: "Alasan pengajuan edit wajib diisi." }
  }

  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData.user) {
    return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
  }
  const user = userData.user

  const { data: community } = await adminSupabase
    .from("communities")
    .select("id, owner_id")
    .eq("owner_id", user.id)
    .eq("is_verified", true)
    .limit(1)
    .maybeSingle()

  if (!community) {
    return { success: false, error: "Akun ini tidak memiliki komunitas terverifikasi." }
  }

  const { data: activity, error: fetchError } = await adminSupabase
    .from("activities")
    .select("id, title, status, community_id")
    .eq("id", activityId)
    .eq("community_id", community.id)
    .maybeSingle()

  if (fetchError || !activity) {
    return { success: false, error: "Kegiatan tidak ditemukan atau bukan milik komunitas Anda." }
  }

  if (activity.status !== "published") {
    return { success: false, error: "Pengajuan edit hanya berlaku untuk kegiatan yang sedang aktif." }
  }

  const { data: existingRequest } = await adminSupabase
    .from("activity_edit_requests")
    .select("id, status")
    .eq("activity_id", activityId)
    .in("status", ["pending", "approved"])
    .maybeSingle()

  if (existingRequest) {
    return {
      success: false,
      error: existingRequest.status === "pending"
        ? "Sudah ada pengajuan edit yang sedang menunggu persetujuan admin untuk kegiatan ini."
        : "Pengajuan edit untuk kegiatan ini sudah disetujui. Silakan lakukan editing terlebih dahulu.",
    }
  }

  const { data, error } = await adminSupabase
    .from("activity_edit_requests")
    .insert({
      activity_id: activityId,
      community_id: community.id,
      submitted_by: user.id,
      reason: trimmedReason,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("[submitActivityEditRequest] error:", error)
    return { success: false, error: "Gagal mengajukan permintaan edit. Silakan coba lagi." }
  }

  // Notifikasi ke semua admin
  const { data: admins } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "Pengajuan Edit Kegiatan 📝",
        `Komunitas mengajukan permintaan edit untuk kegiatan "${activity.title}". Alasan: ${trimmedReason}`,
        "info",
        "/admin/activities"
      )
    }
  }

  return { success: true, data }
}

/** Ambil status pengajuan edit terbaru (pending/approved) untuk sebuah kegiatan, untuk ditampilkan di dashboard komunitas. */
export async function getActivityEditRequestStatus(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true, data: null }

  const auth = await requireOwnedActivity(activityId)
  if (!auth.authorized) return { success: false, data: null, error: auth.error }

  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
    .from("activity_edit_requests")
    .select("id, status, reason, admin_note, created_at, reviewed_at")
    .eq("activity_id", activityId)
    .eq("community_id", auth.communityId)
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("[getActivityEditRequestStatus] error:", error)
    return { success: false, data: null, error: "Gagal mengambil status pengajuan edit." }
  }

  return { success: true, data }
}

/** Ambil semua pengajuan edit yang masih aktif (pending/approved) milik komunitas, dikelompokkan per activity_id. */
export async function getCommunityActiveEditRequests(communityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true, data: {} as Record<string, { id: string; status: string; reason: string; admin_note: string | null }> }

  const communityAuth = await getCurrentVerifiedCommunity()
  if (!communityAuth.authorized) return { success: false, data: {}, error: communityAuth.error }
  if (communityAuth.communityId !== communityId) {
    return { success: false, data: {}, error: "Anda tidak memiliki akses ke data komunitas ini." }
  }

  const adminSupabase = await createAdminClient()

  const { data, error } = await adminSupabase
    .from("activity_edit_requests")
    .select("id, activity_id, status, reason, admin_note")
    .eq("community_id", communityId)
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getCommunityActiveEditRequests] error:", error)
    return { success: false, data: {}, error: "Gagal mengambil data pengajuan edit." }
  }

  const byActivityId: Record<string, { id: string; status: string; reason: string; admin_note: string | null }> = {}
  for (const row of data || []) {
    if (!byActivityId[row.activity_id]) {
      byActivityId[row.activity_id] = { id: row.id, status: row.status, reason: row.reason, admin_note: row.admin_note }
    }
  }

  return { success: true, data: byActivityId }
}

/** Tandai pengajuan edit yang sudah disetujui sebagai selesai setelah komunitas menyimpan perubahan kegiatan. */
export async function completeApprovedEditRequest(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true }

  const auth = await requireOwnedActivity(activityId)
  if (!auth.authorized) return { success: false, error: auth.error }

  const adminSupabase = await createAdminClient()

  const { error } = await adminSupabase
    .from("activity_edit_requests")
    .update({ status: "completed" })
    .eq("activity_id", activityId)
    .eq("community_id", auth.communityId)
    .eq("status", "approved")

  if (error) {
    console.error("[completeApprovedEditRequest] error:", error)
    return { success: false, error: "Gagal memperbarui status pengajuan edit." }
  }

  return { success: true }
}

export async function getCommunityActivityForEdit(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      success: true,
      data: {
        id: activityId,
        title: "Mock Activity",
        description: "",
        location: "",
        latitude: null,
        longitude: null,
        cover_image_url: null,
        status: "draft",
      } as any,
    }
  }

  const auth = await requireOwnedActivity(activityId)
  if (!auth.authorized) return { success: false, data: null, error: auth.error }

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("activities")
    .select("id, title, description, location, latitude, longitude, cover_image_url, status")
    .eq("id", activityId)
    .eq("community_id", auth.communityId)
    .maybeSingle()

  if (error || !data) {
    return { success: false, data: null, error: "Kegiatan tidak ditemukan." }
  }

  return { success: true, data }
}

export async function getCommunityActivitySummary(activityId: string) {
  const isE2E = await getE2EMock()
  if (isE2E) {
    return {
      success: true,
      data: {
        title: "Mock Activity",
        description: null,
        cover_image_url: null,
        funding_raised: 0,
        funding_goal: 0,
        volunteer_count: 0,
        volunteer_quota: 0,
        status: "completed",
        location: "Mock Location",
        start_date: new Date().toISOString(),
        end_date: null,
        execution_date: null,
        community_id: "mock-community-id",
      } as any,
    }
  }

  const auth = await requireOwnedActivity(activityId)
  if (!auth.authorized) return { success: false, data: null, error: auth.error }

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from("activities")
    .select("title, description, cover_image_url, funding_raised, funding_goal, volunteer_count, volunteer_quota, status, location, start_date, end_date, execution_date, community_id")
    .eq("id", activityId)
    .eq("community_id", auth.communityId)
    .maybeSingle()

  if (error || !data) {
    return { success: false, data: null, error: "Kegiatan tidak ditemukan." }
  }

  return { success: true, data }
}

export async function updateCommunityActivityAction(formData: FormData) {
  const isE2E = await getE2EMock()
  if (isE2E) return { success: true }

  const activityId = String(formData.get("activityId") || "")
  if (!activityId) return { success: false, error: "ID kegiatan tidak valid." }

  const auth = await requireOwnedActivity(activityId)
  if (!auth.authorized) return { success: false, error: auth.error }

  const adminSupabase = await createAdminClient()
  const { data: activity, error: activityError } = await adminSupabase
    .from("activities")
    .select("id, status, cover_image_url")
    .eq("id", activityId)
    .eq("community_id", auth.communityId)
    .maybeSingle()

  if (activityError || !activity) {
    return { success: false, error: "Kegiatan tidak ditemukan." }
  }

  if (activity.status !== "draft") {
    if (activity.status !== "published") {
      return { success: false, error: "Kegiatan dengan status ini tidak dapat diedit." }
    }

    const { data: editRequest } = await adminSupabase
      .from("activity_edit_requests")
      .select("id")
      .eq("activity_id", activityId)
      .eq("community_id", auth.communityId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!editRequest) {
      return { success: false, error: "Kegiatan aktif hanya dapat diedit setelah pengajuan edit disetujui admin." }
    }
  }

  const description = String(formData.get("description") || "").trim()
  const location = String(formData.get("location") || "").trim()
  const latitudeValue = formData.get("latitude")
  const longitudeValue = formData.get("longitude")
  const latitude = latitudeValue ? Number(latitudeValue) : null
  const longitude = longitudeValue ? Number(longitudeValue) : null

  let coverImageUrl = activity.cover_image_url
  const coverImage = formData.get("coverImage") as File | null
  if (coverImage && coverImage.size > 0) {
    if (coverImage.size > 5 * 1024 * 1024) {
      return { success: false, error: "Ukuran gambar maksimal 5MB." }
    }

    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.replace(" ", "") || "sinergilaut-assets"
    const fileExt = coverImage.name.split(".").pop()
    const fileName = `activity_${activityId}_${Date.now()}.${fileExt}`
    const path = `activities/${fileName}`
    const { error: uploadError } = await adminSupabase.storage
      .from(bucketName)
      .upload(path, coverImage, { upsert: true })

    if (uploadError) {
      console.error("[updateCommunityActivityAction] upload error:", uploadError)
      return { success: false, error: "Gagal mengupload gambar sampul." }
    }

    const { data: publicUrlData } = adminSupabase.storage.from(bucketName).getPublicUrl(path)
    coverImageUrl = publicUrlData.publicUrl
  }

  const { error: updateError } = await adminSupabase
    .from("activities")
    .update({
      description,
      location,
      latitude,
      longitude,
      cover_image_url: coverImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", activityId)
    .eq("community_id", auth.communityId)

  if (updateError) {
    console.error("[updateCommunityActivityAction] update error:", updateError)
    return { success: false, error: updateError.message || "Gagal memperbarui kegiatan." }
  }

  if (activity.status === "published") {
    await adminSupabase
      .from("activity_edit_requests")
      .update({ status: "completed" })
      .eq("activity_id", activityId)
      .eq("community_id", auth.communityId)
      .eq("status", "approved")
  }

  return { success: true }
}
