/**
 * Seed script: Buat akun admin
 * Jalankan: node scripts/seed-admin.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vgjqnmoydwhyryihttys.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnanFubW95ZHdoeXJ5aWh0dHlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIzMDUwNiwiZXhwIjoyMDkxODA2NTA2fQ._pSoXOCETvw1silDFAmol_DWxlPdagFyuCib7oN5tGY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "admin@sinergilaut.com";
const PASSWORD = "Admin1234!";
const FULL_NAME = "Admin SinergiLaut";

async function main() {
  console.log("🔑 Membuat seed akun admin...\n");

  // 1. Buat user auth
  console.log("1️⃣  Membuat auth user...");
  let userId;

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: FULL_NAME,
        role: "admin",
      },
    });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("   ⚠️  User sudah ada, mengambil data existing...");
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find((u) => u.email === EMAIL);
      if (!existing) {
        console.error("   ❌ Tidak bisa menemukan user existing");
        process.exit(1);
      }
      userId = existing.id;
    } else {
      console.error("   ❌ Auth error:", authError.message);
      process.exit(1);
    }
  } else {
    userId = authData.user.id;
  }

  console.log(`   ✅ User ID: ${userId}`);

  // 2. Update profile
  console.log("2️⃣  Update profile...");
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: EMAIL,
      full_name: FULL_NAME,
      role: "admin",
      is_active: true,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("   ❌ Profile error:", profileError.message);
  } else {
    console.log("   ✅ Profile updated (role: admin)");
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Seed admin selesai! Login dengan:");
  console.log(`   📧 Email:    ${EMAIL}`);
  console.log(`   🔑 Password: ${PASSWORD}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
