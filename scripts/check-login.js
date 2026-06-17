const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkLogin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin1@sinergilaut.id',
    password: 'Password@2026'
  });
  if (error) {
    console.error("Login Error:", error);
  } else {
    console.log("Login OK! User ID:", data.user.id);
  }
}
checkLogin();
