"use server";
import { createClient } from "@/lib/supabase/server";

export async function checkPermissions() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('activities').select('*');
  console.log("Check permissions result:", { data: data ? data.length : null, error });
  return { data, error };
}
