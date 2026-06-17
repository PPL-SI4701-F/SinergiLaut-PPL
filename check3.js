import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.test.local" });
config({ path: ".env.local" });
config({ path: ".env" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: activities } = await supabase.from('activities').select('id, title, volunteer_count, funding_goal, funding_raised');
  
  console.log("\n== ACTIVITIES ==");
  console.log(activities?.filter(a => a.title.includes('Edukasi')));
}

check();
