import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.test.local" });
config({ path: ".env.local" });
config({ path: ".env" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: profiles } = await supabase.from('profiles').select('id, email').eq('email', 'owner2@example.com');
  const userId = profiles[0].id;

  const { data: communities } = await supabase.from('communities').select('*').eq('owner_id', userId).order("created_at", { ascending: true });
  console.log("Communities:", JSON.stringify(communities.map(c => ({id: c.id, name: c.name})), null, 2));

  for (const comm of communities) {
    const { count } = await supabase.from('activities').select('*', { count: 'exact', head: true }).eq('community_id', comm.id);
    console.log(`Activities for ${comm.name}: ${count}`);
  }
}
check();
