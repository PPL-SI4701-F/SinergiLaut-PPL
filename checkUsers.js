import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.test.local" });
config({ path: ".env.local" });
config({ path: ".env" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsers() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  console.log("Error?", error);
  console.log("Users:", users?.users?.map(u => u.email));
}

checkUsers();
