const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'admin1@sinergilaut.id', password: 'Password@2026' });
  if (error) throw error;
  
  const projectId = supabaseUrl.split('//')[1].split('.')[0];
  const cookieVal = JSON.stringify([data.session.access_token, data.session.refresh_token, null, null, null]);
  const cookie = `sb-${projectId}-auth-token=${encodeURIComponent(cookieVal)}`;
  
  const res = await fetch('http://localhost:3000/admin/monitoring', {
    headers: { cookie }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  if (res.status !== 200) {
    console.log(text.substring(0, 1000));
  } else {
    console.log("Success (200)");
  }
}

run().catch(console.error);
