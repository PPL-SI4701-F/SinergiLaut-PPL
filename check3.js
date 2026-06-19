const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://test.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log(typeof supabase.auth.getClaims);
