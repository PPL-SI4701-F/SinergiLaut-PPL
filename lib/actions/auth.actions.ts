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

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/");
}
