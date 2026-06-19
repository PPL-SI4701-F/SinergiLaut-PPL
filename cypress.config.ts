import { defineConfig } from "cypress";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.test.local" });
config({ path: ".env.local" });
config({ path: ".env" });

type FindProfileByEmailArgs = {
  email: string;
  retries?: number;
  delayMs?: number;
};

type CountProfilesByEmailArgs = {
  email: string;
};

type CreateVolunteerUserArgs = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

const loginSeedUser = {
  email: "login.user@test.local",
  password: "ValidPass123!",
  fullName: "Budi Santoso",
  phone: "081234567890",
};

const fr05SeedUser = {
  email: "owner1@example.com",
  password: "Password@2026",
  fullName: "Budi Bahari",
  phone: "081234567891",
};

const fr05OtherCommunityOwner = {
  id: "00000000-0000-4000-8000-000000000605",
  email: "fr05.other.owner@test.local",
  fullName: "Pemilik Komunitas Lain",
  phone: "081234567892",
};

const fr06AdminUser = {
  email: "admin1@sinergilaut.id",
  password: "Password@2026",
  fullName: "Admin Utama",
  phone: "081234567800",
};

const fr06CommunityOwner = {
  email: "fr06.owner@test.local",
  password: "Password@2026",
  fullName: "Pemilik Komunitas FR06",
  phone: "081234567893",
};

const fr08VolunteerUser = {
  email: "fr08.volunteer@test.local",
  password: "Password@2026",
  fullName: "Dian Relawan FR08",
  phone: "081234567894",
};

const fr08CommunityOwner = {
  email: "fr08.owner@test.local",
  password: "Password@2026",
  fullName: "Pemilik Komunitas FR08",
  phone: "081234567895",
};

const fr09CommunityOwner = {
  email: "fr09.owner@test.local",
  password: "Password@2026",
  fullName: "Pemilik Komunitas FR09",
  phone: "081234567899",
};

const fr09DonorUser = {
  email: "fr09.donor@test.local",
  password: "Password@2026",
  fullName: "Raka Donatur FR09",
  phone: "081234567898",
};

const fr10DonorUser = {
  email: "fr10.donor@test.local",
  password: "Password@2026",
  fullName: "Alya Donatur FR10",
  phone: "081234567810",
};

const fr10CommunityOwner = {
  email: "fr10.owner@test.local",
  password: "Password@2026",
  fullName: "Pemilik Komunitas FR10",
  phone: "081234567811",
};

const fr33VolunteerUser = {
  email: "fr33.volunteer@test.local",
  password: "Password@2026",
  fullName: "Nadia Relawan FR33",
  phone: "081234567896",
};

const fr33CommunityOwner = {
  email: "fr33.owner@test.local",
  password: "Password@2026",
  fullName: "Pemilik Komunitas FR33",
  phone: "081234567897",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let prismaForCypress: PrismaClient | null = null;

function createPrismaClient() {
  if (!prismaForCypress) {
    prismaForCypress = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
      },
    });
  }

  return prismaForCypress;
}

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const fr05SeedActivities = [
  {
    title: "Rencana Bersih Pantai Sanur",
    slug: "rencana-bersih-pantai-sanur",
    description: "Program pembersihan sampah plastik di sepanjang Pantai Sanur bersama komunitas nelayan lokal.",
    category: "cleanup",
    status: "draft",
    location: "Pantai Sanur, Bali",
    daysFromNow: 60,
    fundingGoal: 10000000,
    fundingRaised: 0,
    volunteerQuota: 30,
    volunteerCount: 0,
    coverImageUrl: "/images/activities/activity-template-1.png",
  },
  {
    title: "Edukasi Lingkungan Laut untuk Pelajar SD",
    slug: "edukasi-lingkungan-laut-pelajar-sd",
    description: "Program edukasi interaktif tentang ekosistem laut dan bahaya sampah plastik untuk pelajar SD di pesisir Bali.",
    category: "education",
    status: "pending_review",
    location: "Kuta, Bali",
    daysFromNow: 45,
    fundingGoal: 5000000,
    fundingRaised: 0,
    volunteerQuota: 20,
    volunteerCount: 0,
    coverImageUrl: "/images/beach-cleanup.jpg",
  },
  {
    title: "Pemantauan Terumbu Karang Amed",
    slug: "pemantauan-terumbu-karang-amed",
    description: "Ekspedisi monitoring kondisi terumbu karang dan populasi ikan di kawasan Amed.",
    category: "research",
    status: "pending_review",
    location: "Amed, Karangasem, Bali",
    daysFromNow: 50,
    fundingGoal: 12000000,
    fundingRaised: 0,
    volunteerQuota: 15,
    volunteerCount: 0,
    coverImageUrl: "/images/coral-restoration.jpg",
  },
  {
    title: "Bersih Pantai Kuta — Aksi Nyata Lawan Plastik",
    slug: "bersih-pantai-kuta-aksi-nyata-lawan-plastik",
    description: "Program pembersihan intensif Pantai Kuta dari sampah plastik bersama relawan.",
    category: "cleanup",
    status: "published",
    location: "Pantai Kuta, Badung, Bali",
    daysFromNow: 14,
    fundingGoal: 10000000,
    fundingRaised: 6000000,
    volunteerQuota: 30,
    volunteerCount: 4,
    coverImageUrl: "/images/activities/activity-template-1.png",
  },
  {
    title: "Festival Laut Nusantara 2026",
    slug: "festival-laut-nusantara-2026",
    description: "Festival tahunan yang menampilkan pameran seni berbahan daur ulang sampah laut dan pertunjukan budaya pesisir.",
    category: "event",
    status: "cancelled",
    location: "GWK Cultural Park, Badung, Bali",
    daysFromNow: -10,
    fundingGoal: 20000000,
    fundingRaised: 0,
    volunteerQuota: 50,
    volunteerCount: 0,
    coverImageUrl: "/images/activities/activity-template-2.png",
  },
  {
    title: "Ekspedisi Terumbu Karang Raja Ampat",
    slug: "ekspedisi-terumbu-karang-raja-ampat",
    description: "Ekspedisi pemantauan dan pemulihan terumbu karang di Raja Ampat.",
    category: "restoration",
    status: "completed",
    location: "Raja Ampat, Papua Barat Daya",
    daysFromNow: -45,
    fundingGoal: 15000000,
    fundingRaised: 18000000,
    volunteerQuota: 15,
    volunteerCount: 15,
    coverImageUrl: "/images/coral-restoration.jpg",
  },
];

const fr06SeedActivities = [
  {
    title: "FR06 Edukasi Lingkungan Laut untuk Pelajar SD",
    slug: "fr06-edukasi-lingkungan-laut-pelajar-sd",
    description: "Kegiatan edukasi ekosistem laut untuk pelajar SD yang menunggu review admin.",
    category: "education",
    status: "pending_review",
    location: "Kuta, Bali",
    daysFromNow: 30,
    fundingGoal: 5000000,
    fundingRaised: 0,
    volunteerQuota: 20,
    volunteerCount: 0,
    coverImageUrl: "/images/beach-cleanup.jpg",
  },
  {
    title: "FR06 Pemantauan Terumbu Karang Amed",
    slug: "fr06-pemantauan-terumbu-karang-amed",
    description: "Kegiatan pemantauan terumbu karang yang digunakan untuk skenario penolakan admin.",
    category: "research",
    status: "pending_review",
    location: "Amed, Karangasem, Bali",
    daysFromNow: 45,
    fundingGoal: 12000000,
    fundingRaised: 0,
    volunteerQuota: 15,
    volunteerCount: 0,
    coverImageUrl: "/images/coral-restoration.jpg",
  },
  {
    title: "FR06 Bersih Pantai Kuta",
    slug: "fr06-bersih-pantai-kuta",
    description: "Kegiatan bersih pantai yang sudah dipublikasikan dan dapat dipantau admin.",
    category: "cleanup",
    status: "published",
    location: "Pantai Kuta, Badung, Bali",
    daysFromNow: 14,
    fundingGoal: 10000000,
    fundingRaised: 6000000,
    volunteerQuota: 30,
    volunteerCount: 4,
    coverImageUrl: "/images/activities/activity-template-1.png",
  },
  {
    title: "FR06 Restorasi Terumbu Karang Selesai",
    slug: "fr06-restorasi-terumbu-karang-selesai",
    description: "Kegiatan restorasi yang sudah selesai dan muncul pada monitoring kegiatan.",
    category: "restoration",
    status: "completed",
    location: "Raja Ampat, Papua Barat Daya",
    daysFromNow: -30,
    fundingGoal: 15000000,
    fundingRaised: 15000000,
    volunteerQuota: 12,
    volunteerCount: 12,
    coverImageUrl: "/images/coral-restoration.jpg",
  },
];

const fr08Activity = {
  title: "FR08 Bersih Pantai Volunteer",
  slug: "fr08-bersih-pantai-volunteer",
  description: "Kegiatan bersih pantai khusus automated testing FR-08 pendaftaran relawan.",
  category: "cleanup",
  status: "published",
  location: "Pantai Sanur, Bali",
  daysFromNow: 21,
  fundingGoal: 7000000,
  fundingRaised: 1500000,
  volunteerQuota: 30,
  volunteerCount: 0,
  coverImageUrl: "/images/activities/activity-template-1.png",
};

const fr09Activity = {
  title: "FR09 Konservasi Pesisir Nusantara",
  slug: "fr09-konservasi-pesisir-nusantara",
  description: "Kegiatan khusus automated testing FR-09 donasi uang dan barang oleh pengguna.",
  category: "cleanup",
  status: "published",
  location: "Semarang, Jawa Tengah",
  daysFromNow: 30,
  volunteerQuota: 25,
  volunteerCount: 4,
  coverImageUrl: "/images/activities/activity-template-1.png",
};

const fr10Activities = {
  active: {
    title: "FR10 Donasi Aktif Konservasi Mangrove",
    slug: "fr10-donasi-aktif-konservasi-mangrove",
    startDaysFromNow: -2,
    endDaysFromNow: 14,
  },
  expired: {
    title: "FR10 Donasi Berakhir Bersih Pantai",
    slug: "fr10-donasi-berakhir-bersih-pantai",
    startDaysFromNow: -20,
    endDaysFromNow: -1,
  },
};

const fr33Activities = [
  {
    title: "FR33 Aksi Bersih Pantai Losari",
    slug: "fr33-aksi-bersih-pantai-losari",
    description: "Aksi relawan membersihkan sampah plastik di kawasan Pantai Losari.",
    category: "cleanup",
    status: "published",
    location: "Pantai Losari, Makassar",
    daysFromNow: 25,
    volunteerQuota: 40,
    volunteerCount: 5,
    coverImageUrl: "/images/activities/activity-template-1.png",
  },
  {
    title: "FR33 Restorasi Habitat Penyu",
    slug: "fr33-restorasi-habitat-penyu",
    description: "Program restorasi habitat dan perlindungan sarang penyu bersama relawan.",
    category: "restoration",
    status: "published",
    location: "Pantai Sukamade, Banyuwangi",
    daysFromNow: 35,
    volunteerQuota: 20,
    volunteerCount: 2,
    coverImageUrl: "/images/coral-restoration.jpg",
  },
  {
    title: "FR33 Edukasi Laut Telah Selesai",
    slug: "fr33-edukasi-laut-telah-selesai",
    description: "Kegiatan edukasi konservasi laut yang telah selesai dilaksanakan.",
    category: "education",
    status: "completed",
    location: "Surabaya, Jawa Timur",
    daysFromNow: -30,
    volunteerQuota: 25,
    volunteerCount: 25,
    coverImageUrl: "/images/beach-cleanup.jpg",
  },
  {
    title: "FR33 Riset Laut Masih Draft",
    slug: "fr33-riset-laut-masih-draft",
    description: "Kegiatan riset yang belum dipublikasikan dan tidak boleh tampil kepada relawan.",
    category: "research",
    status: "draft",
    location: "Manado, Sulawesi Utara",
    daysFromNow: 60,
    volunteerQuota: 10,
    volunteerCount: 0,
    coverImageUrl: "/images/activities/activity-template-2.png",
  },
];

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Cypress Supabase tasks.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    specPattern: process.env.CYPRESS_SEED_ONLY === "true"
      ? "cypress/seeds/**/*.cy.ts"
      : "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: process.env.CYPRESS_SEED_ONLY === "true"
      ? undefined
      : process.env.CYPRESS_BASE_URL ?? "http://localhost:3000",
    // Pages take 25-35s to compile with Turbopack on first load
    defaultCommandTimeout: 30000,   // 30s for element assertions (cy.contains, cy.get, etc.)
    pageLoadTimeout: 120000,        // 120s for page navigation (cy.visit)
    requestTimeout: 30000,          // 30s for network requests
    responseTimeout: 60000,         // 60s for server responses
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    numTestsKeptInMemory: 0,
    experimentalMemoryManagement: true,
    chromeWebSecurity: false,       // Allow cross-origin requests in tests
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.family === "chromium") {
          launchOptions.args.push(
            "--disable-background-networking",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-renderer-backgrounding",
            "--disable-software-rasterizer",
            "--disable-features=CalculateNativeWinOcclusion,RendererCodeIntegrity",
          );
        }

        return launchOptions;
      });

      on("task", {
        async findProfileByEmail({ email, retries = 10, delayMs = 500 }: FindProfileByEmailArgs) {
          const supabase = createSupabaseAdminClient();

          for (let attempt = 0; attempt < retries; attempt += 1) {
            const { data, error } = await supabase
              .from("profiles")
              .select("id,email,full_name,phone,role")
              .eq("email", email)
              .maybeSingle();

            if (error) {
              throw new Error(error.message);
            }

            if (data) {
              return data;
            }

            await sleep(delayMs);
          }

          return null;
        },
        async countProfilesByEmail({ email }: CountProfilesByEmailArgs) {
          const supabase = createSupabaseAdminClient();

          const { count, error } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("email", email);

          if (error) {
            throw new Error(error.message);
          }

          return count ?? 0;
        },
        async createVolunteerUser({ email, password, fullName, phone }: CreateVolunteerUserArgs) {
          const supabase = createSupabaseAdminClient();

          let existingProfile = null;
          let profileLookupError = null;

          // Retry up to 10 times with 1 second delay to handle PostgREST schema cache reloads
          for (let attempt = 0; attempt < 10; attempt += 1) {
            const { data, error } = await supabase
              .from("profiles")
              .select("id,email,full_name,phone,role")
              .eq("email", email)
              .maybeSingle();

            if (!error) {
              existingProfile = data;
              profileLookupError = null;
              break;
            }

            profileLookupError = error;
            if (!error.message.includes("permission denied")) {
              break; // If it's a different error, stop retrying
            }
            
            await sleep(1000);
          }

          if (profileLookupError) {
            throw new Error(profileLookupError.message);
          }

          if (existingProfile) {
            return existingProfile;
          }

          const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              role: "user",
              phone,
            },
          });

          if (createUserError) {
            throw new Error(createUserError.message);
          }

          const userId = createdUser.user?.id;
          if (!userId) {
            throw new Error("Supabase did not return a user id.");
          }

          await sleep(500);

          const { data: profileFromTrigger, error: triggerLookupError } = await supabase
            .from("profiles")
            .select("id,email,full_name,phone,role")
            .eq("id", userId)
            .maybeSingle();

          if (triggerLookupError) {
            throw new Error(triggerLookupError.message);
          }

          if (profileFromTrigger) {
            return profileFromTrigger;
          }

          const { data: insertedProfile, error: insertProfileError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              email,
              full_name: fullName,
              phone,
              role: "user",
            })
            .select("id,email,full_name,phone,role")
            .single();

          if (insertProfileError) {
            throw new Error(insertProfileError.message);
          }

          return insertedProfile;
        },
        async seedLoginUser() {
          const supabase = createSupabaseAdminClient();

          const { data: existingProfile, error: profileLookupError } = await supabase
            .from("profiles")
            .select("id,email,full_name,phone,role")
            .eq("email", loginSeedUser.email)
            .maybeSingle();

          if (profileLookupError) {
            throw new Error(profileLookupError.message);
          }

          if (existingProfile) {
            return loginSeedUser;
          }

          const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
            email: loginSeedUser.email,
            password: loginSeedUser.password,
            email_confirm: true,
            user_metadata: {
              full_name: loginSeedUser.fullName,
              role: "user",
              phone: loginSeedUser.phone,
            },
          });

          if (createUserError) {
            throw new Error(createUserError.message);
          }

          const userId = createdUser.user?.id;
          if (!userId) {
            throw new Error("Supabase did not return a user id.");
          }

          await sleep(500);

          const { data: profileFromTrigger, error: triggerLookupError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

          if (triggerLookupError) {
            throw new Error(triggerLookupError.message);
          }

          if (!profileFromTrigger) {
            const { error: insertProfileError } = await supabase.from("profiles").insert({
              id: userId,
              email: loginSeedUser.email,
              full_name: loginSeedUser.fullName,
              phone: loginSeedUser.phone,
              role: "user",
            });

            if (insertProfileError) {
              throw new Error(insertProfileError.message);
            }
          }

          return loginSeedUser;
        },
        async seedPendingVolunteer(data: { name: string, email: string }) {
          const supabase = createSupabaseAdminClient();
          let userId = null;
          const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", data.email).maybeSingle();
          
          if (existingUser) {
             userId = existingUser.id;
          } else {
             const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
               email: data.email,
               password: "Password@2026",
               email_confirm: true,
               user_metadata: { full_name: data.name, role: "user", phone: "08123456789" },
             });
             if (createUserError) throw new Error(createUserError.message);
             userId = createdUser.user?.id;
          }
          
          if (!userId) throw new Error("Supabase did not return a user id.");
          await sleep(500);

          const { error: upsertError } = await supabase.from("profiles").upsert({
            id: userId,
            email: data.email,
            full_name: data.name,
            role: "user",
            nik: "3201234567890001",
            date_of_birth: "1990-01-01",
            gender: "male",
            address: "Jl. Relawan No. 1",
            phone: "08123456789",
            volunteer_status: "pending"
          });

          if (upsertError) throw new Error(upsertError.message);
          return { id: userId, email: data.email };
        },
        async seedPendingReport(data: { title: string, communityName: string }) {
          const supabase = createSupabaseAdminClient();
          const uniqueId = Date.now().toString().slice(-6);
          const email = `reportuser_${uniqueId}@test.com`;

          // 1. Create Profile
          const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
            email,
            password: "Password@2026",
            email_confirm: true,
            user_metadata: { full_name: "Report User", role: "user" },
          });
          if (createUserError) throw new Error(createUserError.message);
          const userId = createdUser.user?.id;

          await supabase.from("profiles").upsert({
            id: userId,
            email,
            full_name: "Report User",
            role: "user",
          });

          // 2. Create Community
          const { data: community, error: commError } = await supabase.from("communities").insert({
            name: data.communityName,
            slug: data.communityName.toLowerCase().replace(/ /g, "-") + uniqueId,
            description: "Desc",
            is_verified: true,
            owner_id: userId
          }).select().single();
          if (commError) throw new Error(commError.message);

          // 3. Create Activity
          const { data: activity, error: actError } = await supabase.from("activities").insert({
            community_id: community.id,
            title: "Activity for Report " + uniqueId,
            slug: "activity-for-report-" + uniqueId,
            description: "Desc",
            location: "Location",
            start_date: "2026-10-10",
            status: "completed"
          }).select().single();
          if (actError) throw new Error(actError.message);

          // 4. Create Report
          const { error: repError } = await supabase.from("reports").insert({
            activity_id: activity.id,
            community_id: community.id,
            submitted_by: userId,
            title: data.title,
            summary: "Report Summary",
            status: "submitted",
          });
          if (repError) throw new Error(repError.message);

          return { success: true };
        },
        async seedPendingCommunity(data: { name: string, email: string }) {
          const supabase = createSupabaseAdminClient();

          // 1. Create User or find existing
          let userId = null;
          const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", data.email).maybeSingle();
          if (existingUser) {
             userId = existingUser.id;
          } else {
             const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
               email: data.email,
               password: "Password@2026",
               email_confirm: true,
               user_metadata: { full_name: "Admin " + data.name, role: "community", phone: "08123456789" },
             });
             if (createUserError) throw new Error(createUserError.message);
             userId = createdUser.user?.id;
          }
          
          if (!userId) throw new Error("Supabase did not return a user id.");
          await sleep(500);

          // 2. Ensure profile exists
          const { data: profileFromTrigger } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
          if (!profileFromTrigger) {
            await supabase.from("profiles").insert({
              id: userId, email: data.email, full_name: "Admin " + data.name, phone: "08123456789", role: "community",
            });
          } else {
             await supabase.from("profiles").update({ role: "community" }).eq("id", userId);
          }

          // 3. Create Community
          const { data: existingComm } = await supabase.from("communities").select("*").eq("owner_id", userId).maybeSingle();
          if (existingComm) {
             // Reset status
             await supabase.from("communities").update({ verification_status: "pending", is_verified: false, is_suspended: false, is_banned: false }).eq("id", existingComm.id);
             return existingComm;
          }

          const slug = data.name.toLowerCase().replace(/[\s_-]+/g, "-") + "-" + Date.now();
          const { data: comm, error: commError } = await supabase.from("communities").insert({
            owner_id: userId,
            name: data.name,
            slug,
            description: "Deskripsi " + data.name,
            verification_status: "pending",
            is_verified: false,
            location: "Jakarta",
          }).select().single();

          if (commError) throw new Error(commError.message);
          return comm;
        },
        async getActivityIdByTitle(title: string) {
          const supabase = createSupabaseAdminClient();
          const { data, error } = await supabase
            .from("activities")
            .select("id")
            .eq("title", title)
            .maybeSingle();

          if (error) {
            throw new Error(error.message);
          }
          return data?.id || null;
        },
        async getActivityByTitle(title: string) {
          const prisma = createPrismaClient();

          return prisma.activities.findFirst({
            where: {
              title: {
                contains: title,
                mode: "insensitive",
              },
            },
            select: {
              id: true,
              title: true,
              status: true,
            },
          });
        },
        async getFR05ActivityBySlug(slug: string) {
          const prisma = createPrismaClient();

          return prisma.activities.findFirst({
            where: {
              slug,
              community: {
                owner: {
                  email: fr05SeedUser.email,
                },
              },
            },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          });
        },
        async getFR06ActivityByTitle(title: string) {
          const prisma = createPrismaClient();

          const activity = await prisma.activities.findFirst({
            where: {
              title,
            },
            select: {
              id: true,
              title: true,
              status: true,
              admin_note: true,
              published_at: true,
              community: {
                select: {
                  name: true,
                  owner: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          });

          if (!activity) return null;

          return {
            id: activity.id,
            title: activity.title,
            status: activity.status,
            adminNote: activity.admin_note,
            publishedAt: activity.published_at?.toISOString() ?? null,
            communityName: activity.community.name,
            ownerEmail: activity.community.owner?.email ?? null,
          };
        },
        async resetFR06Data() {
          const prisma = createPrismaClient();
          const supabase = createSupabaseAdminClient();

          const ensureAuthUser = async (seed: typeof fr06AdminUser, role: "admin" | "community") => {
            const { data: authUsers, error: listUsersError } = await supabase.auth.admin.listUsers({
              page: 1,
              perPage: 1000,
            });

            if (listUsersError) {
              throw new Error(listUsersError.message);
            }

            let authUser = authUsers.users.find((user) => user.email === seed.email);

            if (authUser) {
              const { data: updatedUser, error: updateUserError } = await supabase.auth.admin.updateUserById(authUser.id, {
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (updateUserError) {
                throw new Error(updateUserError.message);
              }

              authUser = updatedUser.user;
            } else {
              const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
                email: seed.email,
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (createUserError) {
                throw new Error(createUserError.message);
              }

              authUser = createdUser.user;
            }

            if (!authUser?.id) {
              throw new Error(`FR-06 auth user could not be prepared for ${seed.email}.`);
            }

            await prisma.profiles.upsert({
              where: {
                id: authUser.id,
              },
              update: {
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
              },
              create: {
                id: authUser.id,
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
              },
            });

            return authUser;
          };

          await ensureAuthUser(fr06AdminUser, "admin");
          const communityOwner = await ensureAuthUser(fr06CommunityOwner, "community");

          const communitySeed = {
            owner_id: communityOwner.id,
            name: "Komunitas Review Status FR06",
            slug: "komunitas-review-status-fr06",
            description: "Komunitas khusus automated testing FR-06 manajemen status kegiatan.",
            location: "Denpasar, Bali",
            focus_areas: ["education", "research"],
            verification_status: "approved" as any,
            is_verified: true,
            is_suspended: false,
            logo_url: "/images/partner-1.jpg",
            bank_name: "BCA",
            bank_account_number: "1000000006",
            bank_account_name: "Komunitas Review Status FR06",
          };

          const community = await prisma.communities.upsert({
            where: {
              slug: communitySeed.slug,
            },
            update: communitySeed,
            create: communitySeed,
            select: {
              id: true,
            },
          });

          for (const activity of fr06SeedActivities) {
            const payload = {
              community_id: community.id,
              title: activity.title,
              slug: activity.slug,
              description: activity.description,
              category: activity.category as any,
              status: activity.status as any,
              start_date: addDays(activity.daysFromNow),
              execution_date: addDays(activity.daysFromNow),
              location: activity.location,
              volunteer_quota: activity.volunteerQuota,
              volunteer_count: activity.volunteerCount,
              funding_goal: BigInt(activity.fundingGoal),
              funding_raised: BigInt(activity.fundingRaised),
              allow_item_donation: false,
              cover_image_url: activity.coverImageUrl,
              admin_note: null,
              reviewed_by: null,
              published_at: activity.status === "published" || activity.status === "completed" ? addDays(-2) : null,
            };

            await prisma.activities.upsert({
              where: {
                community_id_slug: {
                  community_id: community.id,
                  slug: activity.slug,
                },
              },
              update: payload,
              create: payload,
            });
          }

          return true;
        },
        async resetFR08Data() {
          const prisma = createPrismaClient();
          const supabase = createSupabaseAdminClient();

          const ensureAuthUser = async (
            seed: typeof fr08VolunteerUser,
            role: "user" | "community",
            extraProfile: Record<string, unknown> = {},
          ) => {
            const { data: authUsers, error: listUsersError } = await supabase.auth.admin.listUsers({
              page: 1,
              perPage: 1000,
            });

            if (listUsersError) {
              throw new Error(listUsersError.message);
            }

            let authUser = authUsers.users.find((user) => user.email === seed.email);

            if (authUser) {
              const { data: updatedUser, error: updateUserError } = await supabase.auth.admin.updateUserById(authUser.id, {
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (updateUserError) {
                throw new Error(updateUserError.message);
              }

              authUser = updatedUser.user;
            } else {
              const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
                email: seed.email,
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (createUserError) {
                throw new Error(createUserError.message);
              }

              authUser = createdUser.user;
            }

            if (!authUser?.id) {
              throw new Error(`FR-08 auth user could not be prepared for ${seed.email}.`);
            }

            await prisma.profiles.upsert({
              where: {
                id: authUser.id,
              },
              update: {
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
                ...extraProfile,
              },
              create: {
                id: authUser.id,
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
                ...extraProfile,
              },
            });

            return authUser;
          };

          const volunteer = await ensureAuthUser(fr08VolunteerUser, "user", {
            volunteer_status: "approved",
            date_of_birth: new Date("2000-01-01"),
            nik: "3201010101000008",
            gender: "Laki-laki",
            address: "Denpasar, Bali",
            ktp_url: "/uploads/ktp/fr08-approved.jpg",
            volunteer_reject_note: null,
          });
          const communityOwner = await ensureAuthUser(fr08CommunityOwner, "community");

          const communitySeed = {
            owner_id: communityOwner.id,
            name: "Komunitas Pendaftaran Relawan FR08",
            slug: "komunitas-pendaftaran-relawan-fr08",
            description: "Komunitas khusus automated testing FR-08 pendaftaran relawan.",
            location: "Denpasar, Bali",
            focus_areas: ["cleanup"],
            verification_status: "approved" as any,
            is_verified: true,
            is_suspended: false,
            logo_url: "/images/partner-1.jpg",
            bank_name: "BCA",
            bank_account_number: "1000000008",
            bank_account_name: "Komunitas Pendaftaran Relawan FR08",
          };

          const community = await prisma.communities.upsert({
            where: {
              slug: communitySeed.slug,
            },
            update: communitySeed,
            create: communitySeed,
            select: {
              id: true,
            },
          });

          const activityPayload = {
            community_id: community.id,
            title: fr08Activity.title,
            slug: fr08Activity.slug,
            description: fr08Activity.description,
            category: fr08Activity.category as any,
            status: fr08Activity.status as any,
            start_date: addDays(fr08Activity.daysFromNow),
            execution_date: addDays(fr08Activity.daysFromNow),
            location: fr08Activity.location,
            volunteer_quota: fr08Activity.volunteerQuota,
            volunteer_count: fr08Activity.volunteerCount,
            funding_goal: BigInt(fr08Activity.fundingGoal),
            funding_raised: BigInt(fr08Activity.fundingRaised),
            allow_item_donation: false,
            cover_image_url: fr08Activity.coverImageUrl,
            published_at: addDays(-1),
            admin_note: null,
          };

          const activity = await prisma.activities.upsert({
            where: {
              community_id_slug: {
                community_id: community.id,
                slug: fr08Activity.slug,
              },
            },
            update: activityPayload,
            create: activityPayload,
            select: {
              id: true,
            },
          });

          await prisma.volunteer_registrations.deleteMany({
            where: {
              activity_id: activity.id,
            },
          });

          return true;
        },
        async getFR08Activity() {
          const prisma = createPrismaClient();

          return prisma.activities.findFirst({
            where: {
              slug: fr08Activity.slug,
            },
            select: {
              id: true,
              title: true,
              status: true,
              volunteer_quota: true,
              volunteer_count: true,
            },
          });
        },
        async seedFR08ExistingRegistration() {
          const prisma = createPrismaClient();

          const [activity, user] = await Promise.all([
            prisma.activities.findFirst({
              where: {
                slug: fr08Activity.slug,
              },
              select: {
                id: true,
                title: true,
              },
            }),
            prisma.profiles.findFirst({
              where: {
                email: fr08VolunteerUser.email,
              },
              select: {
                id: true,
                email: true,
                full_name: true,
                phone: true,
              },
            }),
          ]);

          if (!activity) {
            throw new Error("FR-08 activity seed was not found. Run resetFR08Data first.");
          }

          if (!user) {
            throw new Error("FR-08 volunteer user seed was not found. Run resetFR08Data first.");
          }

          const payload = {
            activity_id: activity.id,
            user_id: user.id,
            full_name: user.full_name || fr08VolunteerUser.fullName,
            email: user.email,
            phone: user.phone || fr08VolunteerUser.phone,
            reason: "Umur: 25 tahun",
            agreed_to_terms: true,
            status: "pending" as any,
          };

          const existingRegistration = await prisma.volunteer_registrations.findFirst({
            where: {
              activity_id: activity.id,
              user_id: user.id,
            },
            select: {
              id: true,
            },
          });

          if (existingRegistration) {
            await prisma.volunteer_registrations.update({
              where: {
                id: existingRegistration.id,
              },
              data: payload,
            });
          } else {
            await prisma.volunteer_registrations.create({
              data: payload,
            });
          }

          return true;
        },
        async getFR08Registration() {
          const prisma = createPrismaClient();

          const registration = await prisma.volunteer_registrations.findFirst({
            where: {
              activity: {
                slug: fr08Activity.slug,
              },
              user: {
                email: fr08VolunteerUser.email,
              },
            },
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              reason: true,
              agreed_to_terms: true,
              status: true,
              activity: {
                select: {
                  title: true,
                },
              },
              user: {
                select: {
                  email: true,
                },
              },
            },
          });

          if (!registration) return null;

          return {
            id: registration.id,
            fullName: registration.full_name,
            email: registration.email,
            phone: registration.phone,
            reason: registration.reason,
            agreedToTerms: registration.agreed_to_terms,
            status: registration.status,
            activityTitle: registration.activity.title,
            userEmail: registration.user.email,
          };
        },
        async resetFR09Data() {
          const prisma = createPrismaClient();
          const supabase = createSupabaseAdminClient();

          const ensureAuthUser = async (
            seed: typeof fr09DonorUser,
            role: "user" | "community" | "admin",
          ) => {
            const { data: authUsers, error: listUsersError } = await supabase.auth.admin.listUsers({
              page: 1,
              perPage: 1000,
            });

            if (listUsersError) {
              throw new Error(listUsersError.message);
            }

            let authUser = authUsers.users.find((user) => user.email === seed.email);

            if (authUser) {
              const { data: updatedUser, error: updateUserError } = await supabase.auth.admin.updateUserById(authUser.id, {
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (updateUserError) {
                throw new Error(updateUserError.message);
              }

              authUser = updatedUser.user;
            } else {
              const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
                email: seed.email,
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (createUserError) {
                throw new Error(createUserError.message);
              }

              authUser = createdUser.user;
            }

            if (!authUser?.id) {
              throw new Error(`FR-09 auth user could not be prepared for ${seed.email}.`);
            }

            await prisma.profiles.upsert({
              where: {
                id: authUser.id,
              },
              update: {
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
              },
              create: {
                id: authUser.id,
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
              },
            });

            return authUser;
          };

          const owner = await ensureAuthUser(fr09CommunityOwner, "community");
          await ensureAuthUser(fr09DonorUser, "user");
          await ensureAuthUser(fr06AdminUser, "admin");

          const communitySeed = {
            owner_id: owner.id,
            name: "Komunitas Donasi FR09",
            slug: "komunitas-donasi-fr09",
            description: "Komunitas khusus automated testing FR-09.",
            location: "Semarang, Jawa Tengah",
            focus_areas: ["cleanup"],
            verification_status: "approved" as any,
            is_verified: true,
            is_suspended: false,
            logo_url: "/images/partner-1.jpg",
            bank_name: "BCA",
            bank_account_number: "1000000009",
            bank_account_name: "Komunitas Donasi FR09",
          };

          const community = await prisma.communities.upsert({
            where: {
              slug: communitySeed.slug,
            },
            update: communitySeed,
            create: communitySeed,
            select: {
              id: true,
            },
          });

          const activity = await prisma.activities.upsert({
            where: {
              community_id_slug: {
                community_id: community.id,
                slug: fr09Activity.slug,
              },
            },
            update: {
              community_id: community.id,
              title: fr09Activity.title,
              description: fr09Activity.description,
              category: fr09Activity.category as any,
              status: fr09Activity.status as any,
              start_date: addDays(fr09Activity.daysFromNow),
              execution_date: addDays(fr09Activity.daysFromNow),
              location: fr09Activity.location,
              volunteer_quota: fr09Activity.volunteerQuota,
              volunteer_count: fr09Activity.volunteerCount,
              funding_goal: BigInt(10000000),
              funding_raised: BigInt(0),
              allow_item_donation: true,
              items_needed: [
                { item_name: "Sarung Tangan Karet", target: 50, donated: 0, unit_price: 12000 },
                { item_name: "Kantong Sampah Besar", target: 100, donated: 0, unit_price: 5000 },
              ],
              cover_image_url: fr09Activity.coverImageUrl,
              published_at: addDays(-2),
              admin_note: null,
            },
            create: {
              community_id: community.id,
              title: fr09Activity.title,
              slug: fr09Activity.slug,
              description: fr09Activity.description,
              category: fr09Activity.category as any,
              status: fr09Activity.status as any,
              start_date: addDays(fr09Activity.daysFromNow),
              execution_date: addDays(fr09Activity.daysFromNow),
              location: fr09Activity.location,
              volunteer_quota: fr09Activity.volunteerQuota,
              volunteer_count: fr09Activity.volunteerCount,
              funding_goal: BigInt(10000000),
              funding_raised: BigInt(0),
              allow_item_donation: true,
              items_needed: [
                { item_name: "Sarung Tangan Karet", target: 50, donated: 0, unit_price: 12000 },
                { item_name: "Kantong Sampah Besar", target: 100, donated: 0, unit_price: 5000 },
              ],
              cover_image_url: fr09Activity.coverImageUrl,
              published_at: addDays(-2),
            },
            select: {
              id: true,
            },
          });

          await prisma.donations.deleteMany({
            where: {
              activity_id: activity.id,
            },
          });

          return true;
        },
        async getFR09Activity() {
          const prisma = createPrismaClient();

          return prisma.activities.findFirst({
            where: {
              slug: fr09Activity.slug,
            },
            select: {
              id: true,
              title: true,
            },
          });
        },
        async resetFR10Data() {
          const prisma = createPrismaClient();
          const supabase = createSupabaseAdminClient();

          const ensureAuthUser = async (
            seed: typeof fr10DonorUser,
            role: "user" | "community",
          ) => {
            const { data: authUsers, error: listUsersError } = await supabase.auth.admin.listUsers({
              page: 1,
              perPage: 1000,
            });

            if (listUsersError) {
              throw new Error(listUsersError.message);
            }

            let authUser = authUsers.users.find((user) => user.email === seed.email);

            if (authUser) {
              const { data: updatedUser, error: updateUserError } = await supabase.auth.admin.updateUserById(authUser.id, {
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (updateUserError) {
                throw new Error(updateUserError.message);
              }

              authUser = updatedUser.user;
            } else {
              const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
                email: seed.email,
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (createUserError) {
                if (!createUserError.message.toLowerCase().includes("already been registered")) {
                  throw new Error(createUserError.message);
                }

                const { data: refreshedUsers, error: refreshedUsersError } = await supabase.auth.admin.listUsers({
                  page: 1,
                  perPage: 1000,
                });

                if (refreshedUsersError) {
                  throw new Error(refreshedUsersError.message);
                }

                const existingUser = refreshedUsers.users.find((user) => user.email === seed.email);
                if (!existingUser) {
                  throw new Error(`FR-06 auth user exists but could not be loaded for ${seed.email}.`);
                }

                const { data: updatedUser, error: updateUserError } = await supabase.auth.admin.updateUserById(existingUser.id, {
                  password: seed.password,
                  email_confirm: true,
                  user_metadata: {
                    full_name: seed.fullName,
                    role,
                    phone: seed.phone,
                  },
                });

                if (updateUserError) {
                  throw new Error(updateUserError.message);
                }

                authUser = updatedUser.user;
              } else {
                authUser = createdUser.user;
              }
            }

            if (!authUser?.id) {
              throw new Error(`FR-10 auth user could not be prepared for ${seed.email}.`);
            }

            await prisma.profiles.upsert({
              where: { id: authUser.id },
              update: {
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
              },
              create: {
                id: authUser.id,
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
              },
            });

            return authUser;
          };

          const owner = await ensureAuthUser(fr10CommunityOwner, "community");
          await ensureAuthUser(fr10DonorUser, "user");

          const community = await prisma.communities.upsert({
            where: { slug: "komunitas-batas-waktu-donasi-fr10" },
            update: {
              owner_id: owner.id,
              name: "Komunitas Batas Waktu Donasi FR10",
              description: "Komunitas khusus automated testing FR-10.",
              location: "Surabaya, Jawa Timur",
              focus_areas: ["cleanup", "restoration"],
              verification_status: "approved" as any,
              is_verified: true,
              is_suspended: false,
              logo_url: "/images/partner-1.jpg",
            },
            create: {
              owner_id: owner.id,
              name: "Komunitas Batas Waktu Donasi FR10",
              slug: "komunitas-batas-waktu-donasi-fr10",
              description: "Komunitas khusus automated testing FR-10.",
              location: "Surabaya, Jawa Timur",
              focus_areas: ["cleanup", "restoration"],
              verification_status: "approved" as any,
              is_verified: true,
              is_suspended: false,
              logo_url: "/images/partner-1.jpg",
            },
            select: { id: true },
          });

          const activityIds: string[] = [];

          for (const [key, activity] of Object.entries(fr10Activities)) {
            const payload = {
              community_id: community.id,
              title: activity.title,
              description: `Kegiatan ${key} khusus automated testing batas waktu donasi FR-10.`,
              category: (key === "active" ? "restoration" : "cleanup") as any,
              status: "published" as any,
              start_date: addDays(activity.startDaysFromNow),
              end_date: addDays(activity.endDaysFromNow),
              execution_date: addDays(Math.max(activity.endDaysFromNow + 10, 30)),
              location: "Surabaya, Jawa Timur",
              volunteer_quota: 20,
              volunteer_count: 0,
              funding_goal: BigInt(10000000),
              funding_raised: BigInt(0),
              allow_item_donation: false,
              cover_image_url: "/images/activities/activity-template-1.png",
              published_at: addDays(-5),
              admin_note: null,
            };

            const seededActivity = await prisma.activities.upsert({
              where: {
                community_id_slug: {
                  community_id: community.id,
                  slug: activity.slug,
                },
              },
              update: payload,
              create: {
                ...payload,
                slug: activity.slug,
              },
              select: { id: true },
            });

            activityIds.push(seededActivity.id);
          }

          await prisma.donations.deleteMany({
            where: {
              activity_id: {
                in: activityIds,
              },
            },
          });

          return true;
        },
        async getFR10Activities() {
          const prisma = createPrismaClient();
          const activities = await prisma.activities.findMany({
            where: {
              slug: {
                in: Object.values(fr10Activities).map((activity) => activity.slug),
              },
            },
            select: {
              id: true,
              title: true,
              slug: true,
              start_date: true,
              end_date: true,
            },
          });

          return Object.fromEntries(
            Object.entries(fr10Activities).map(([key, seed]) => {
              const activity = activities.find((candidate) => candidate.slug === seed.slug);
              return [
                key,
                activity
                  ? {
                      id: activity.id,
                      title: activity.title,
                      startDate: activity.start_date.toISOString(),
                      endDate: activity.end_date?.toISOString() ?? null,
                    }
                  : null,
              ];
            }),
          );
        },
        async getFR10LatestDonation() {
          const prisma = createPrismaClient();
          const donation = await prisma.donations.findFirst({
            where: {
              activity: {
                slug: fr10Activities.active.slug,
              },
              user: {
                email: fr10DonorUser.email,
              },
            },
            orderBy: {
              created_at: "desc",
            },
            select: {
              donor_name: true,
              donor_email: true,
              type: true,
              amount: true,
              status: true,
              activity: {
                select: {
                  funding_raised: true,
                },
              },
            },
          });

          if (!donation) return null;

          return {
            donorName: donation.donor_name,
            donorEmail: donation.donor_email,
            type: donation.type,
            amount: donation.amount?.toString() ?? null,
            status: donation.status,
            fundingRaised: donation.activity.funding_raised.toString(),
          };
        },
        async countFR10ExpiredDonations() {
          const prisma = createPrismaClient();
          return prisma.donations.count({
            where: {
              activity: {
                slug: fr10Activities.expired.slug,
              },
            },
          });
        },
        async seedFR09ManagementData() {
          const prisma = createPrismaClient();

          const activity = await prisma.activities.findFirst({
            where: {
              slug: fr09Activity.slug,
            },
            select: {
              id: true,
            },
          });

          if (!activity) {
            throw new Error("FR-09 activity seed was not found. Run resetFR09Data first.");
          }

          await prisma.donations.deleteMany({
            where: {
              activity_id: activity.id,
            },
          });

          await prisma.donations.create({
            data: {
              activity_id: activity.id,
              donor_name: "Maya Pendukung FR09",
              donor_email: "maya.fr09@test.local",
              type: "money",
              amount: BigInt(200000),
              status: "completed",
              note: "Semoga kegiatan berjalan lancar.",
              is_anonymous: false,
            },
          });

          await prisma.donations.create({
            data: {
              activity_id: activity.id,
              donor_name: "Nama Donatur Rahasia",
              donor_email: "anonim.fr09@test.local",
              type: "money",
              amount: BigInt(150000),
              status: "completed",
              is_anonymous: true,
            },
          });

          const itemDonation = await prisma.donations.create({
            data: {
              activity_id: activity.id,
              donor_name: "Logistik FR09",
              donor_email: "logistik.fr09@test.local",
              type: "item",
              status: "pending",
              note: "Barang sedang dikirim.",
              is_anonymous: false,
            },
            select: {
              id: true,
            },
          });

          await prisma.donation_items.create({
            data: {
              donation_id: itemDonation.id,
              item_name: "Sarung Tangan Karet",
              quantity: 10,
              item_condition: "new",
              tracking_number: "FR09-MONITOR-001",
              courier: "JNE",
            },
          });

          await prisma.activities.update({
            where: {
              id: activity.id,
            },
            data: {
              funding_raised: BigInt(350000),
            },
          });

          return true;
        },
        async getFR09ManagedDonation(donorName: string) {
          const prisma = createPrismaClient();

          const donation = await prisma.donations.findFirst({
            where: {
              activity: {
                slug: fr09Activity.slug,
              },
              donor_name: donorName,
            },
            select: {
              type: true,
              status: true,
              is_anonymous: true,
            },
          });

          return donation ?? null;
        },
        async getFR09LatestDonation(type: "money" | "item") {
          const prisma = createPrismaClient();

          const donation = await prisma.donations.findFirst({
            where: {
              activity: {
                slug: fr09Activity.slug,
              },
              user: {
                email: fr09DonorUser.email,
              },
              type,
            },
            orderBy: {
              created_at: "desc",
            },
            select: {
              donor_name: true,
              donor_email: true,
              type: true,
              amount: true,
              status: true,
              is_anonymous: true,
              items: {
                select: {
                  item_name: true,
                  quantity: true,
                },
              },
              activity: {
                select: {
                  funding_raised: true,
                  items_needed: true,
                },
              },
            },
          });

          if (!donation) return null;

          return {
            donorName: donation.donor_name,
            donorEmail: donation.donor_email,
            type: donation.type,
            amount: donation.amount?.toString() ?? null,
            status: donation.status,
            isAnonymous: donation.is_anonymous,
            items: donation.items,
            fundingRaised: donation.activity.funding_raised.toString(),
            itemsNeeded: donation.activity.items_needed,
          };
        },
        async resetFR33Data() {
          const prisma = createPrismaClient();
          const supabase = createSupabaseAdminClient();

          const ensureAuthUser = async (
            seed: typeof fr33VolunteerUser,
            role: "user" | "community",
            extraProfile: Record<string, unknown> = {},
          ) => {
            const { data: authUsers, error: listUsersError } = await supabase.auth.admin.listUsers({
              page: 1,
              perPage: 1000,
            });

            if (listUsersError) {
              throw new Error(listUsersError.message);
            }

            let authUser = authUsers.users.find((user) => user.email === seed.email);

            if (authUser) {
              const { data: updatedUser, error: updateUserError } = await supabase.auth.admin.updateUserById(authUser.id, {
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (updateUserError) {
                throw new Error(updateUserError.message);
              }

              authUser = updatedUser.user;
            } else {
              const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
                email: seed.email,
                password: seed.password,
                email_confirm: true,
                user_metadata: {
                  full_name: seed.fullName,
                  role,
                  phone: seed.phone,
                },
              });

              if (createUserError) {
                throw new Error(createUserError.message);
              }

              authUser = createdUser.user;
            }

            if (!authUser?.id) {
              throw new Error(`FR-33 auth user could not be prepared for ${seed.email}.`);
            }

            await prisma.profiles.upsert({
              where: {
                id: authUser.id,
              },
              update: {
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
                ...extraProfile,
              },
              create: {
                id: authUser.id,
                email: seed.email,
                full_name: seed.fullName,
                phone: seed.phone,
                role,
                is_active: true,
                ...extraProfile,
              },
            });

            return authUser;
          };

          const volunteer = await ensureAuthUser(fr33VolunteerUser, "user", {
            volunteer_status: "approved",
            date_of_birth: new Date("2000-01-01"),
            nik: "3201010101000033",
            gender: "Perempuan",
            address: "Makassar, Sulawesi Selatan",
            ktp_url: "/uploads/ktp/fr33-approved.jpg",
            volunteer_reject_note: null,
          });
          const communityOwner = await ensureAuthUser(fr33CommunityOwner, "community");

          const communitySeed = {
            owner_id: communityOwner.id,
            name: "Komunitas Aktivitas Relawan FR33",
            slug: "komunitas-aktivitas-relawan-fr33",
            description: "Komunitas khusus automated testing FR-33 pencarian aktivitas relawan.",
            location: "Makassar, Sulawesi Selatan",
            focus_areas: ["cleanup", "restoration", "education"],
            verification_status: "approved" as any,
            is_verified: true,
            is_suspended: false,
            logo_url: "/images/partner-1.jpg",
            bank_name: "BCA",
            bank_account_number: "1000000033",
            bank_account_name: "Komunitas Aktivitas Relawan FR33",
          };

          const community = await prisma.communities.upsert({
            where: {
              slug: communitySeed.slug,
            },
            update: communitySeed,
            create: communitySeed,
            select: {
              id: true,
            },
          });

          const activityIds: string[] = [];

          for (const activity of fr33Activities) {
            const payload = {
              community_id: community.id,
              title: activity.title,
              slug: activity.slug,
              description: activity.description,
              category: activity.category as any,
              status: activity.status as any,
              start_date: addDays(activity.daysFromNow),
              execution_date: addDays(activity.daysFromNow),
              location: activity.location,
              volunteer_quota: activity.volunteerQuota,
              volunteer_count: activity.volunteerCount,
              funding_goal: BigInt(5000000),
              funding_raised: BigInt(1000000),
              allow_item_donation: false,
              cover_image_url: activity.coverImageUrl,
              published_at: activity.status === "published" || activity.status === "completed" ? addDays(-2) : null,
              admin_note: null,
            };

            const seededActivity = await prisma.activities.upsert({
              where: {
                community_id_slug: {
                  community_id: community.id,
                  slug: activity.slug,
                },
              },
              update: payload,
              create: payload,
              select: {
                id: true,
              },
            });

            activityIds.push(seededActivity.id);
          }

          await prisma.volunteer_registrations.deleteMany({
            where: {
              activity_id: {
                in: activityIds,
              },
              user_id: volunteer.id,
            },
          });

          return true;
        },
        async getFR05ActivityOwnership() {
          const prisma = createPrismaClient();
          const titles = [
            "Bersih Pantai Kuta",
            "Rencana Bersih Pantai Sanur",
            "Edukasi Lingkungan Laut untuk Pelajar SD",
            "Ekspedisi Terumbu Karang Raja Ampat",
            "Kegiatan Komunitas Lain FR05",
          ];

          const activities = await prisma.activities.findMany({
            where: {
              OR: titles.map((title) => ({
                title: {
                  contains: title,
                  mode: "insensitive",
                },
              })),
            },
            select: {
              title: true,
              status: true,
              community: {
                select: {
                  name: true,
                  slug: true,
                  owner: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              title: "asc",
            },
          });

          return activities.map((activity) => ({
            title: activity.title,
            status: activity.status,
            communityName: activity.community.name,
            communitySlug: activity.community.slug,
            ownerEmail: activity.community.owner?.email ?? null,
          }));
        },
        async resetFR05Data() {
          const prisma = createPrismaClient();
          const supabase = createSupabaseAdminClient();

          const { data: authUsers, error: listUsersError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });

          if (listUsersError) {
            throw new Error(listUsersError.message);
          }

          let authUser = authUsers.users.find((user) => user.email === fr05SeedUser.email);

          if (authUser) {
            const { data: updatedUser, error: updateUserError } = await supabase.auth.admin.updateUserById(authUser.id, {
              password: fr05SeedUser.password,
              user_metadata: {
                full_name: fr05SeedUser.fullName,
                role: "community",
                phone: fr05SeedUser.phone,
              },
            });

            if (updateUserError) {
              throw new Error(updateUserError.message);
            }

            authUser = updatedUser.user;
          } else {
            const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
              email: fr05SeedUser.email,
              password: fr05SeedUser.password,
              email_confirm: true,
              user_metadata: {
                full_name: fr05SeedUser.fullName,
                role: "community",
                phone: fr05SeedUser.phone,
              },
            });

            if (createUserError) {
              throw new Error(createUserError.message);
            }

            authUser = createdUser.user;
          }

          if (!authUser?.id) {
            throw new Error("FR-05 auth user could not be prepared.");
          }

          await prisma.profiles.upsert({
            where: {
              id: authUser.id,
            },
            update: {
              email: fr05SeedUser.email,
              full_name: fr05SeedUser.fullName,
              phone: fr05SeedUser.phone,
              role: "community",
              is_active: true,
            },
            create: {
              id: authUser.id,
              email: fr05SeedUser.email,
              full_name: fr05SeedUser.fullName,
              phone: fr05SeedUser.phone,
              role: "community",
              is_active: true,
            },
          });

          const communitySeed = {
            owner_id: authUser.id,
            name: "Yayasan Laut Bersih Nusantara",
            slug: "yayasan-laut-bersih-nusantara",
            description: "Komunitas konservasi laut aktif untuk automated testing FR-05.",
            location: "Denpasar, Bali",
            focus_areas: ["cleanup", "education"],
            verification_status: "approved" as any,
            is_verified: true,
            is_suspended: false,
            logo_url: "/images/partner-1.jpg",
            bank_name: "BCA",
            bank_account_number: "1000000001",
            bank_account_name: "Yayasan Laut Bersih Nusantara",
          };

          await prisma.communities.updateMany({
            where: {
              owner_id: authUser.id,
              slug: {
                not: communitySeed.slug,
              },
            },
            data: {
              is_verified: false,
              verification_status: "pending",
            },
          });

          let community = await prisma.communities.findUnique({
            where: {
              slug: "yayasan-laut-bersih-nusantara",
            },
            select: {
              id: true,
            },
          });

          if (community) {
            community = await prisma.communities.update({
              where: {
                id: community.id,
              },
              data: communitySeed,
              select: {
                id: true,
              },
            });
          } else {
            community = await prisma.communities.create({
              data: communitySeed,
              select: {
                id: true,
              },
            });
          }

          await prisma.profiles.upsert({
            where: {
              id: fr05OtherCommunityOwner.id,
            },
            update: {
              email: fr05OtherCommunityOwner.email,
              full_name: fr05OtherCommunityOwner.fullName,
              phone: fr05OtherCommunityOwner.phone,
              role: "community",
              is_active: true,
            },
            create: {
              id: fr05OtherCommunityOwner.id,
              email: fr05OtherCommunityOwner.email,
              full_name: fr05OtherCommunityOwner.fullName,
              phone: fr05OtherCommunityOwner.phone,
              role: "community",
              is_active: true,
            },
          });

          const otherCommunity = await prisma.communities.upsert({
            where: {
              slug: "komunitas-pembanding-fr05",
            },
            update: {
              owner_id: fr05OtherCommunityOwner.id,
              name: "Komunitas Pembanding FR05",
              description: "Komunitas pembanding untuk automated testing ownership FR-05.",
              location: "Makassar, Sulawesi Selatan",
              focus_areas: ["research"],
              verification_status: "approved" as any,
              is_verified: true,
              is_suspended: false,
            },
            create: {
              owner_id: fr05OtherCommunityOwner.id,
              name: "Komunitas Pembanding FR05",
              slug: "komunitas-pembanding-fr05",
              description: "Komunitas pembanding untuk automated testing ownership FR-05.",
              location: "Makassar, Sulawesi Selatan",
              focus_areas: ["research"],
              verification_status: "approved" as any,
              is_verified: true,
              is_suspended: false,
            },
            select: {
              id: true,
            },
          });

          await prisma.activities.upsert({
            where: {
              community_id_slug: {
                community_id: otherCommunity.id,
                slug: "kegiatan-komunitas-lain-fr05",
              },
            },
            update: {
              title: "Kegiatan Komunitas Lain FR05",
              description: "Kegiatan pembanding yang tidak boleh tampil pada dashboard komunitas FR-05.",
              category: "research",
              status: "published",
              start_date: addDays(30),
              execution_date: addDays(30),
              location: "Makassar, Sulawesi Selatan",
              volunteer_quota: 10,
              volunteer_count: 0,
              funding_goal: BigInt(3000000),
              funding_raised: BigInt(0),
              allow_item_donation: false,
              cover_image_url: "/images/activities/activity-template-2.png",
            },
            create: {
              community_id: otherCommunity.id,
              title: "Kegiatan Komunitas Lain FR05",
              slug: "kegiatan-komunitas-lain-fr05",
              description: "Kegiatan pembanding yang tidak boleh tampil pada dashboard komunitas FR-05.",
              category: "research",
              status: "published",
              start_date: addDays(30),
              execution_date: addDays(30),
              location: "Makassar, Sulawesi Selatan",
              volunteer_quota: 10,
              volunteer_count: 0,
              funding_goal: BigInt(3000000),
              funding_raised: BigInt(0),
              allow_item_donation: false,
              cover_image_url: "/images/activities/activity-template-2.png",
            },
          });

          for (const activity of fr05SeedActivities) {
            const payload = {
              community_id: community.id,
              title: activity.title,
              slug: activity.slug,
              description: activity.description,
              category: activity.category as any,
              status: activity.status as any,
              start_date: addDays(activity.daysFromNow),
              execution_date: addDays(activity.daysFromNow),
              location: activity.location,
              volunteer_quota: activity.volunteerQuota,
              volunteer_count: activity.volunteerCount,
              funding_goal: BigInt(activity.fundingGoal),
              funding_raised: BigInt(activity.fundingRaised),
              allow_item_donation: false,
              cover_image_url: activity.coverImageUrl,
              admin_note: activity.status === "cancelled" ? "Data reset untuk automated testing FR-05." : null,
            };

            const existingActivity = await prisma.activities.findFirst({
              where: {
                community_id: community.id,
                slug: activity.slug,
              },
              select: {
                id: true,
              },
            });

            if (existingActivity) {
              await prisma.activities.update({
                where: {
                  id: existingActivity.id,
                },
                data: payload,
              });
            } else {
              await prisma.activities.create({
                data: payload,
              });
            }
          }

          return true;
        },
      });

      return config;
    },
    supportFile: "cypress/support/e2e.ts",
  },
});
