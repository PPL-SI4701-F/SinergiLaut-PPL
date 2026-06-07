import { getHomePageStats } from './lib/actions/dashboard.actions'
import * as dotenv from 'dotenv'

dotenv.config()

async function check() {
  console.log('Fetching Home Page Stats...')
  try {
    const stats = await getHomePageStats()
    console.log('Stats:', stats)
  } catch (error) {
    console.error('Error:', error)
  }
}

check()
