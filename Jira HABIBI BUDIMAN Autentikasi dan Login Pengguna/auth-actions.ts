"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Ini adalah mock Supabase client karena ini hanya folder Jira.
// Dalam implementasi nyata, Anda akan menggunakan @supabase/ssr seperti:
// import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Mencoba login untuk:", email);

  // Simulasi delay jaringan
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulasi validasi
  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  // TODO: Implementasi Supabase signInWithPassword di sini
  // const supabase = await createClient();
  // const { error } = await supabase.auth.signInWithPassword({ email, password });
  // if (error) return { error: error.message };

  // Revalidate dan redirect setelah berhasil
  revalidatePath("/", "layout");
  redirect("/community/dashboard");
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Mencoba mendaftar untuk:", email);

  // Simulasi delay jaringan
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulasi validasi
  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  // TODO: Implementasi Supabase signUp di sini
  // const supabase = await createClient();
  // const { error } = await supabase.auth.signUp({ email, password });
  // if (error) return { error: error.message };

  // Revalidate dan redirect setelah berhasil
  revalidatePath("/", "layout");
  redirect("/community/dashboard");
}

export async function logout() {
  // TODO: Implementasi Supabase signOut di sini
  // const supabase = await createClient();
  // await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/");
}
