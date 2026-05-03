/**
 * Seed script: Buat akun komunitas yang sudah terverifikasi
 * Jalankan: node scripts/seed-community.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vgjqnmoydwhyryihttys.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnanFubW95ZHdoeXJ5aWh0dHlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIzMDUwNiwiZXhwIjoyMDkxODA2NTA2fQ._pSoXOCETvw1silDFAmol_DWxlPdagFyuCib7oN5tGY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "komunitas.test@sinergilaut.com";
const PASSWORD = "Test1234!";
const FULL_NAME = "Komunitas Laut Bersih";

async function main() {
  console.log("🌊 Membuat seed akun komunitas terverifikasi...\n");

  // 1. Buat user auth
  console.log("1️⃣  Membuat auth user...");
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true, // langsung verified
      user_metadata: {
        full_name: FULL_NAME,
        role: "community",
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
      authData.user = existing;
    } else {
      console.error("   ❌ Auth error:", authError.message);
      process.exit(1);
    }
  }

  const userId = authData.user.id;
  console.log(`   ✅ User ID: ${userId}`);

  // 2. Update/upsert profile dengan role community
  console.log("2️⃣  Update profile...");
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: EMAIL,
        full_name: FULL_NAME,
        role: "community",
        is_active: true,
        volunteer_status: "approved",
      },
      { onConflict: "id" }
    );

  if (profileError) {
    console.error("   ❌ Profile error:", profileError.message);
  } else {
    console.log("   ✅ Profile updated");
  }

  // 3. Buat komunitas yang sudah terverifikasi
  console.log("3️⃣  Membuat data komunitas...");

  // Cek apakah sudah ada
  const { data: existingComm } = await supabase
    .from("communities")
    .select("id")
    .eq("owner_id", userId)
    .single();

  let communityId;
  if (existingComm) {
    console.log("   ⚠️  Komunitas sudah ada, update saja...");
    const { data, error } = await supabase
      .from("communities")
      .update({
        name: FULL_NAME,
        description:
          "Komunitas konservasi laut yang berfokus pada pembersihan pantai dan edukasi masyarakat pesisir tentang pentingnya menjaga ekosistem laut.",
        is_verified: true,
        verification_status: "approved",
        is_suspended: false,
        focus_areas: ["cleanup", "education", "restoration"],
        location: "Jakarta, Indonesia",
        member_count: 25,
      })
      .eq("id", existingComm.id)
      .select("id")
      .single();

    if (error) console.error("   ❌ Update error:", error.message);
    communityId = existingComm.id;
  } else {
    const { data, error } = await supabase
      .from("communities")
      .insert({
        owner_id: userId,
        name: FULL_NAME,
        slug: "komunitas-laut-bersih",
        description:
          "Komunitas konservasi laut yang berfokus pada pembersihan pantai dan edukasi masyarakat pesisir tentang pentingnya menjaga ekosistem laut.",
        logo_url: null,
        website: "https://lautbersih.org",
        location: "Jakarta, Indonesia",
        focus_areas: ["cleanup", "education", "restoration"],
        member_count: 25,
        is_verified: true,
        verification_status: "approved",
        is_suspended: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("   ❌ Community insert error:", error.message);
      process.exit(1);
    }
    communityId = data.id;
  }
  console.log(`   ✅ Community ID: ${communityId}`);

  // 4. Buat 2 kegiatan sample
  console.log("4️⃣  Membuat kegiatan sample...");

  const activities = [
    {
      community_id: communityId,
      title: "Bersih Pantai Ancol - Mei 2026",
      slug: "bersih-pantai-ancol-mei-2026",
      description:
        "Kegiatan pembersihan sampah plastik di sepanjang Pantai Ancol. Mari bersama-sama menjaga kebersihan pantai untuk generasi mendatang.",
      category: "cleanup",
      status: "published",
      start_date: "2026-05-15T08:00:00+07:00",
      end_date: "2026-05-15T16:00:00+07:00",
      location: "Pantai Ancol, Jakarta Utara",
      latitude: -6.1234,
      longitude: 106.8456,
      volunteer_quota: 50,
      volunteer_count: 12,
      funding_goal: 5000000,
      funding_raised: 2500000,
      allow_item_donation: true,
      published_at: new Date().toISOString(),
    },
    {
      community_id: communityId,
      title: "Edukasi Terumbu Karang - Kepulauan Seribu",
      slug: "edukasi-terumbu-karang-kep-seribu",
      description:
        "Program edukasi tentang pentingnya ekosistem terumbu karang bagi masyarakat pesisir dan nelayan di Kepulauan Seribu.",
      category: "education",
      status: "completed",
      start_date: "2026-04-20T09:00:00+07:00",
      end_date: "2026-04-20T17:00:00+07:00",
      location: "Pulau Pramuka, Kepulauan Seribu",
      latitude: -5.7372,
      longitude: 106.6118,
      volunteer_quota: 30,
      volunteer_count: 28,
      funding_goal: 3000000,
      funding_raised: 3000000,
      allow_item_donation: false,
      published_at: "2026-04-10T10:00:00+07:00",
    },
  ];

  for (const act of activities) {
    // cek duplikat
    const { data: existing } = await supabase
      .from("activities")
      .select("id")
      .eq("slug", act.slug)
      .single();

    if (existing) {
      console.log(`   ⚠️  "${act.title}" sudah ada, skip.`);
    } else {
      const { error } = await supabase.from("activities").insert(act);
      if (error) {
        console.error(`   ❌ Error membuat "${act.title}":`, error.message);
      } else {
        console.log(`   ✅ "${act.title}" berhasil dibuat`);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Seed selesai! Login dengan:");
  console.log(`   📧 Email:    ${EMAIL}`);
  console.log(`   🔑 Password: ${PASSWORD}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
