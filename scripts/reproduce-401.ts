import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.test.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, key)

async function run() {
  console.log('Testing join query with anon client...')
  const { data, error } = await supabase
    .from('activities')
    .select('*, community:communities(name)')
    .in('status', ['published', 'completed'])

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Success, data length:', data?.length)
    if (data && data.length > 0) {
      console.log('Sample data:', JSON.stringify(data[0], null, 2))
    }
  }
}

run()
