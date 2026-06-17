const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkEnums() {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let { data, error } = await adminSupabase.rpc('get_enum_values', { enum_name: 'report_status' });
  if (error) {
    // try direct SQL if we can via REST (not possible), so let's just use postgres connection!
    console.error("RPC failed:", error);
  } else {
    console.log(data);
  }
}

checkEnums();
