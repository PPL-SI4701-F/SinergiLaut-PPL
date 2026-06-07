import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, key)

async function check() {
  console.log('Checking Activities and Reports with Supabase Client (ANON)...')
  
  // Fetch completed activities
  const { data: activities, error: actErr } = await supabase
    .from('activities')
    .select('id, title, status')
    .eq('status', 'completed')

  if (actErr) {
    console.error('Activities Error:', actErr)
    return
  }

  console.log(`Found ${activities?.length || 0} completed activities.`)

  if (activities && activities.length > 0) {
    for (const act of activities) {
      console.log(`\nChecking Reports for: ${act.title} (${act.id})`)
      const { data: reports, error: repErr } = await supabase
        .from('reports')
        .select('*, report_files(*)')
        .eq('activity_id', act.id)
        .eq('status', 'validated')

      if (repErr) {
        console.error('Reports Error:', repErr)
      } else {
        console.log(`Found ${reports?.length || 0} validated reports.`)
        reports.forEach(r => {
          console.log(`- Report: ${r.title}`)
          console.log(`  Files:`, r.report_files.map((f: any) => f.file_url))
        })
      }
    }
  }
}

check()
