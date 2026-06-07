import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function fixRLS() {
  console.log('Updating RLS policies to include completed activities...')
  try {
    // Activities: Include 'completed' in public view
    await sql`DROP POLICY IF EXISTS "Public can view published activities" ON activities;`
    await sql`CREATE POLICY "Public can view published activities" ON activities 
              FOR SELECT USING (status IN ('published', 'completed'));`
    
    console.log('✅ RLS updated: Public can now see both published and completed activities.')
  } catch (err) {
    console.error('❌ Error fixing RLS:', err)
  } finally {
    await sql.end()
  }
}

fixRLS()
