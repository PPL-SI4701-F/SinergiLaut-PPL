import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.test.local" });
config({ path: ".env.local" });
config({ path: ".env" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('activities').select('*').eq('id', '02a6aef5-ed8c-45fc-bf2f-70e65ce6c4cc');
  console.log(JSON.stringify(data, null, 2));
}
check();
