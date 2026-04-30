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
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/community/dashboard"); // Atau ganti sesuai role
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Mencoba mendaftar untuk:", email);

  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/community/dashboard"); // Atau ke halaman verifikasi email
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/");
}
