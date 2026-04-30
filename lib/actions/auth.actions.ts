"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Mencoba login untuk:", email);

  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  
  if (data?.user) {
    const role = data.user.user_metadata?.role || "user";
    if (role === "admin") {
      redirect("/admin/dashboard");
    } else if (role === "community") {
      redirect("/community/dashboard");
    } else {
      redirect("/user/dashboard");
    }
  } else {
    redirect("/");
  }
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string;

  console.log("Mencoba mendaftar untuk:", email);

  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        phone: phone,
      }
    }
  });
  
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login"); // Redirect ke login setelah sukses register
}

export async function registerCommunity(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const communityName = formData.get("communityName") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const adminName = formData.get("adminName") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const location = formData.get("location") as string;
  const selectedActivities = JSON.parse(formData.get("selectedActivities") as string);
  
  const logoFile = formData.get("logo") as File | null;
  const legalDocs = formData.getAll("legalDocuments") as File[];

  if (!email || !password || !communityName || !adminName) {
    return { error: "Semua field wajib harus diisi." };
  }

  const supabase = await createClient();

  // 1. Upload Logo if exists
  let logoUrl = null;
  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split(".").pop();
    const filePath = `communities/logo-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("sinergilaut-assets")
      .upload(filePath, logoFile, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from("sinergilaut-assets").getPublicUrl(filePath);
      logoUrl = data.publicUrl;
    }
  }

  // 2. Sign up the admin
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: adminName,
        role: "community",
        phone: phone,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (authData.user) {
    // 3. Create community record
    const slug = communityName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data: communityData, error: commError } = await supabase.from("communities").insert({
      owner_id: authData.user.id,
      name: communityName,
      slug,
      description: shortDescription,
      logo_url: logoUrl,
      website: website,
      location: location,
      focus_areas: selectedActivities,
      verification_status: "pending",
    }).select("id").single();

    if (!commError && communityData && legalDocs.length > 0) {
      // 4. Upload legal documents and create verifications
      const docUrls: string[] = [];
      for (const doc of legalDocs) {
        if (doc.size > 0) {
          const docExt = doc.name.split(".").pop();
          const docPath = `verifications/${communityData.id}/doc-${Date.now()}.${docExt}`;
          const { error: docUploadError } = await supabase.storage
            .from("sinergilaut-assets")
            .upload(docPath, doc, { upsert: true });
            
          if (!docUploadError) {
            const { data: docObj } = supabase.storage.from("sinergilaut-assets").getPublicUrl(docPath);
            docUrls.push(docObj.publicUrl);
          }
        }
      }

      await supabase.from("community_verifications").insert({
        community_id: communityData.id,
        documents: docUrls,
        representative_name: adminName,
        representative_email: email,
        representative_phone: phone,
      });
    }
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
