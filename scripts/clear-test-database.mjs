import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const envFile = process.argv[2] ?? ".env.test.local";
const expectedProjectRef = "aejrxcncliwieenidygr";

function parseEnv(contents) {
  const env = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const envPath = path.resolve(process.cwd(), envFile);
if (!fs.existsSync(envPath)) {
  throw new Error(`Missing env file: ${envFile}`);
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

if (!supabaseUrl.includes(expectedProjectRef)) {
  throw new Error(`Refusing to clear database because ${envFile} is not the expected testing project.`);
}

function resolveSupabaseModule() {
  const pnpmPath = path.resolve(process.cwd(), "node_modules", ".pnpm");
  const packageDir = fs
    .readdirSync(pnpmPath)
    .find((name) => name.startsWith("@supabase+supabase-js@"));

  if (!packageDir) {
    throw new Error("Cannot find @supabase/supabase-js in node_modules/.pnpm.");
  }

  return pathToFileURL(
    path.join(pnpmPath, packageDir, "node_modules", "@supabase", "supabase-js", "dist", "index.mjs"),
  ).href;
}

const { createClient } = await import(resolveSupabaseModule());
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const tables = [
  "audit_logs",
  "notifications",
  "feedbacks",
  "sanctions",
  "journey_milestones",
  "activity_edit_requests",
  "report_files",
  "reports",
  "disbursements",
  "donation_items",
  "donations",
  "volunteer_registrations",
  "activities",
  "community_verifications",
  "communities",
  "profiles",
];

for (const table of tables) {
  const { error } = await supabase.from(table).delete().not("id", "is", null);

  if (error) {
    throw new Error(`Failed clearing ${table}: ${error.message}`);
  }

  console.log(`Cleared ${table}`);
}

let page = 1;
let deletedUsers = 0;

while (true) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });

  if (error) {
    throw new Error(`Failed listing auth users: ${error.message}`);
  }

  const users = data.users ?? [];
  if (users.length === 0) break;

  for (const user of users) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw new Error(`Failed deleting auth user ${user.email ?? user.id}: ${deleteError.message}`);
    }

    deletedUsers += 1;
  }

  if (users.length < 100) break;
}

console.log(`Deleted ${deletedUsers} auth users`);
console.log("Testing database is now empty.");
