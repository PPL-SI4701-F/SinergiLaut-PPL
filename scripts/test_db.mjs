import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  console.log("Error:", error);
  console.log("Total users:", users?.length);
  const tc03Users = users?.filter(u => u.email?.includes("tc03"));
  console.log("tc03 users:", tc03Users?.map(u => ({ id: u.id, email: u.email })));

  if (tc03Users?.length > 0) {
    const id = tc03Users[0].id;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', id);
    console.log("Profile for", id, ":", profile);
  }
}

check();
