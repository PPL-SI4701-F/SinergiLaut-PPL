const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testQuery() {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("Testing communities with 'suspended'...");
  let { data: r, error: re } = await adminSupabase
      .from("communities")
      .select("id, name, verification_status, updated_at")
      .in("verification_status", ["approved", "rejected", "suspended"])
      .order("updated_at", { ascending: false })
      .limit(30);
  if (re) console.error("Communities error:", re);
  else console.log("Communities OK");
}
testQuery();
