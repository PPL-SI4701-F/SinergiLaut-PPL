import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aejrxcncliwieenidygr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlanJ4Y25jbGl3aWVlbmlkeWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0ODY3MzEsImV4cCI6MjA5NzA2MjczMX0.vE_YLukzZ6Wc2e5CGje7vqsK0g87VNPFFnNgb1XfuDM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin1@sinergilaut.id',
    password: 'Password@2026'
  })
  
  if (error) {
    console.log("Login Error:", error)
    return
  }
  
  console.log("Login Success. User ID:", data.user.id)
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
    
  console.log("Profile Data:", profile)
  console.log("Profile Error:", profileError)
}

test()
