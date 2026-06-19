const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://aejrxcncliwieenidygr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlanJ4Y25jbGl3aWVlbmlkeWdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ4NjczMSwiZXhwIjoyMDk3MDYyNzMxfQ.6xwSaWV27ZJlkzxOY5UQDTNJOA4kZRNuj7LfHjuDH1Q');

async function check() {
  const { data: regs, error: fetchErr } = await supabase
    .from("volunteer_registrations")
    .select("id, status")
    .limit(1);

  console.log("Fetch:", regs, fetchErr);
  if (!regs || regs.length === 0) return;

  const regId = regs[0].id;
  const { data, error } = await supabase
    .from("volunteer_registrations")
    .update({ status: "attended", attendance_proof_url: "https://example.com/dummy-attendance-proof.png" })
    .eq("id", regId)
    .select("user_id, full_name, activity_id, activity:activities(title)")
    .single();

  console.log("Update error:", error);
}

check();
