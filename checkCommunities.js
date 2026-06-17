import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.test.local" });
config({ path: ".env.local" });
config({ path: ".env" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: profiles } = await supabase.from('profiles').select('id, email').eq('email', 'owner2@example.com');
  console.log("Profiles:", profiles);
  if (profiles.length) {
    const { data: communities } = await supabase.from('communities').select('*').eq('owner_id', profiles[0].id);
    console.log("Communities:", communities.length);
  }
}
check();
