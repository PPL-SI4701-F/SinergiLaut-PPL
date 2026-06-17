import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.test.local" });
config({ path: ".env.local" });
config({ path: ".env" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: activities } = await supabase.from('activities').select('id, title, status').eq('community_id', 'e1d28770-6d36-4a83-9913-de57ceb0f196');
  console.log("Activities for First Community:", JSON.stringify(activities, null, 2));
}
check();
