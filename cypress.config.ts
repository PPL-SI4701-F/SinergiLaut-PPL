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
        async approveVolunteer({ email, activityTitle }: { email: string, activityTitle: string }) {
          const supabase = createSupabaseAdminClient();
          
          const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single();
          if (!user) throw new Error('User not found');
          
          const { data: activity } = await supabase.from('activities').select('id').eq('title', activityTitle).single();
          if (!activity) throw new Error('Activity not found');

          const { data: updated, error } = await supabase
            .from('volunteer_registrations')
            .update({ status: 'approved' })
            .eq('user_id', user.id)
            .eq('activity_id', activity.id)
            .select();

          if (error) throw new Error(error.message);
          if (!updated || updated.length === 0) {
              throw new Error(`Row not found for update! User: ${user.id}, Activity: ${activity.id}`);
          }
          
          // MANUAL UPDATE: Karena Prisma db:reset menghapus trigger dari schema.sql di local, 
          // kita harus menaikkan volunteer_count secara manual saat E2E testing
          await supabase.rpc('increment_volunteer_count', { activity_id_param: activity.id }).catch(async () => {
             // Fallback jika RPC tidak ada
             const { data: act } = await supabase.from('activities').select('volunteer_count').eq('id', activity.id).single();
             if (act) {
               await supabase.from('activities').update({ volunteer_count: (act.volunteer_count || 0) + 1 }).eq('id', activity.id);
             }
          });
          
          return true;
        },
        async deleteVolunteer({ email, activityTitle }: { email: string, activityTitle: string }) {
          const supabase = createSupabaseAdminClient();
          
          const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single();
          if (!user) return true;
          
          const { data: activity } = await supabase.from('activities').select('id').eq('title', activityTitle).single();
          if (!activity) return true;

          const { data: existing } = await supabase
            .from('volunteer_registrations')
            .select('status')
            .eq('user_id', user.id)
            .eq('activity_id', activity.id)
            .single();

          const { error } = await supabase
            .from('volunteer_registrations')
            .delete()
            .eq('user_id', user.id)
            .eq('activity_id', activity.id);

          if (error) throw new Error(error.message);

          // MANUAL DECREMENT jika status yang dihapus ternyata approved (karena trigger schema.sql mati di local)
          if (existing && (existing.status === 'approved' || existing.status === 'attended')) {
            const { data: act } = await supabase.from('activities').select('volunteer_count').eq('id', activity.id).single();
            if (act && act.volunteer_count > 0) {
              await supabase.from('activities').update({ volunteer_count: act.volunteer_count - 1 }).eq('id', activity.id);
            }
          }

          return true;
        },
        async bumpFunding({ activityTitle, amount }: { activityTitle: string, amount: number }) {
          const supabase = createSupabaseAdminClient();
          const { data } = await supabase.from('activities').select('id, funding_raised').eq('title', activityTitle).single();
          if (!data) return false;
          await supabase.from('activities').update({ funding_raised: data.funding_raised + amount }).eq('id', data.id);
          return true;
        },
        async resetVolunteerStatus({ activityTitle, status }: { activityTitle: string, status: string }) {
          const supabase = createSupabaseAdminClient();
          const { data: activity } = await supabase.from('activities').select('id').eq('title', activityTitle).single();
          if (!activity) return false;
          
          await supabase
            .from('volunteer_registrations')
            .update({ status: status })
            .eq('activity_id', activity.id);
            
          return true;
        }
      });

      return config;
    },
    supportFile: "cypress/support/e2e.ts",
  },
});
