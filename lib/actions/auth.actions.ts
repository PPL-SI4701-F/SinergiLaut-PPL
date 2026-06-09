"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/actions/notification.actions";
import { cookies } from "next/headers";

async function getE2EMock() {
  if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_E2E_TESTING !== 'true') return null
  try {
    const cookieStore = await cookies()
    return cookieStore.get('e2e-bypass-auth')?.value || null
  } catch {
    return null
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  const isE2E = await getE2EMock()
  console.log("LOGIN ACTION: email=", email, "isE2E=", isE2E)
  if (isE2E) {
    if (email === 'wrong@example.com') {
      return { error: "Invalid login credentials" };
    }
    return { success: true, redirectTo: "/user/dashboard" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  
  if (data?.user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[login] Gagal mengambil profile role:", profileError);
      return { error: "Login berhasil, tetapi data role akun gagal dibaca. Silakan coba lagi." };
    }

    if (!profile?.role) {
      return { error: "Login berhasil, tetapi data profile akun belum tersedia. Hubungi admin." };
    }

    const role = profile.role;
    let redirectTo = "/user/dashboard";
    if (role === "admin") {
      redirectTo = "/admin/dashboard";
    } else if (role === "community") {
      redirectTo = "/community/dashboard";
    }
    return { success: true, redirectTo };
  } else {
    return { error: "Login failed" };
  }
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  const role = "user";

  const isE2E = await getE2EMock()
  if (isE2E) {
    if (email === 'existing@example.com') {
      return { error: "User already registered" };
    }
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        phone: phone,
      }
    }
  });
  
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/");
}

export async function registerCommunity(formData: FormData) {
  const communityName = formData.get("communityName") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const adminName = formData.get("adminName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const website = formData.get("website") as string;
  const instagram = formData.get("instagram") as string;
  const facebook = formData.get("facebook") as string;
  const twitter = formData.get("twitter") as string;
  const region = formData.get("region") as string;
  const operationalArea = formData.get("operationalArea") as string;
  const selectedActivitiesStr = formData.get("selectedActivities") as string;
  
  const logo = formData.get("logo") as File | null;
  const legalDocuments = formData.getAll("legalDocuments") as File[];

  const selectedActivities = selectedActivitiesStr ? JSON.parse(selectedActivitiesStr) : [];

  if (!email || !password || !communityName || !adminName) {
    return { error: "Semua field yang wajib harus diisi." };
  }

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Upload Logo if exists
  let logoUrl = null;
  if (logo && logo.size > 0) {
    const fileExt = logo.name.split(".").pop();
    const filePath = `communities/logo-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await adminSupabase.storage
      .from("sinergilaut-assets")
      .upload(filePath, logo, { upsert: true });

    if (!uploadError) {
      const { data } = adminSupabase.storage.from("sinergilaut-assets").getPublicUrl(filePath);
      logoUrl = data.publicUrl;
    }
  }

  // Gunakan admin client untuk bypass email rate limit & konfirmasi email
  // Sudah diinisialisasi di atas jika menggunakan file logic, tapi pastikan variabel sudah ada.

  // Buat user langsung via admin API (tidak kirim email konfirmasi)
  const { data: authData, error: signUpError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,  // langsung aktif tanpa perlu klik link email
    user_metadata: {
      full_name: adminName,
      role: "community",
      phone: phone,
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (authData.user) {
    // Create community record
    const slug = communityName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Date.now()  // tambah timestamp supaya unik

    const { data: communityData, error: commError } = await adminSupabase.from("communities").insert({
      owner_id: authData.user.id,
      name: communityName,
      slug,
      description: shortDescription,
      logo_url: logoUrl,
      website: website || null,
      email: email || null,
      phone: phone || null,
      instagram: instagram || null,
      facebook: facebook || null,
      twitter: twitter || null,
      location: region + (operationalArea ? ` - ${operationalArea}` : ""),
      focus_areas: selectedActivities,
      verification_status: "pending",
      is_verified: false,
    }).select("id").single();

    if (commError) {
      console.error("[registerCommunity] Gagal insert community:", commError)
      return { error: "Akun berhasil dibuat, tapi gagal menyimpan data komunitas: " + commError.message }
    }

    // Notifikasi konfirmasi ke komunitas yang baru mendaftar
    if (authData?.user?.id) {
      await createNotification(
        authData.user.id,
        "Registrasi Komunitas Diterima 🎉",
        `Registrasi komunitas "${communityName}" berhasil dikirim dan sedang menunggu verifikasi dari admin. Kami akan memberitahumu setelah diproses.`,
        "info",
        "/community/dashboard"
      )
    }

    // Notifikasi ke semua admin bahwa ada komunitas baru yang perlu diverifikasi
    const { data: admins } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await createNotification(
          admin.id,
          "Komunitas Baru Menunggu Verifikasi 🏢",
          `Komunitas "${communityName}" baru saja mendaftar dan menunggu verifikasi dari admin.`,
          "info",
          "/admin/communities"
        )
      }
    }

    if (communityData && legalDocuments.length > 0) {
      // Upload legal documents and create verifications
      const docUrls: string[] = []
      for (const doc of legalDocuments) {
        if (doc.size === 0) continue;
        const docExt = doc.name.split(".").pop();
        const docPath = `verifications/${communityData.id}/doc-${Date.now()}.${docExt}`;
        const { error: docUploadError } = await adminSupabase.storage
          .from("sinergilaut-assets")
          .upload(docPath, doc, { upsert: true });
          
        if (!docUploadError) {
          const { data: docObj } = adminSupabase.storage.from("sinergilaut-assets").getPublicUrl(docPath);
          docUrls.push(docObj.publicUrl);
        }
      }

      await adminSupabase.from("community_verifications").insert({
        community_id: communityData.id,
        documents: docUrls,
        representative_name: adminName,
        representative_email: email,
        representative_phone: phone,
      });
    }
  }

  return { success: true };
}
