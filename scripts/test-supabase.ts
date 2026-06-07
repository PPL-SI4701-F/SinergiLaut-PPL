import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, key)

async function check() {
  console.log('Checking with Supabase Client (ANON)...')
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('status', 'published')

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`Found ${data?.length || 0} published activities.`)
    if (data && data.length > 0) {
      console.log('Titles:', data.map(d => d.title))
    }
  }

  const { data: all, error: allErr } = await supabase
    .from('activities')
    .select('*')

  if (allErr) {
    console.error('Error fetching all:', allErr)
  } else {
    console.log(`Found ${all?.length || 0} total activities via Supabase Client.`)
  }
}

check()
