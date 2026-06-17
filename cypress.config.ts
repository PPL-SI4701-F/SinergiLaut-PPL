import { defineConfig } from "cypress";
import { createClient } from "@supabase/supabase-js";
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:3000",
    // Pages take 25-35s to compile with Turbopack on first load
    defaultCommandTimeout: 30000,   // 30s for element assertions (cy.contains, cy.get, etc.)
    pageLoadTimeout: 120000,        // 120s for page navigation (cy.visit)
    requestTimeout: 30000,          // 30s for network requests
    responseTimeout: 60000,         // 60s for server responses
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,       // Allow cross-origin requests in tests
    setupNodeEvents(on, config) {
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
      });

      return config;
    },
    supportFile: "cypress/support/e2e.ts",
  },
});
