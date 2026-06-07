import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function fixPermissions() {
  console.log('Attempting to fix schema permissions...')
  try {
    await sql`GRANT USAGE ON SCHEMA public TO anon, authenticated;`
    console.log('✅ Granted USAGE on schema public to anon and authenticated roles.')
    
    await sql`GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;`
    console.log('✅ Granted SELECT on all tables in schema public to anon and authenticated roles.')
    
    await sql`GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;`
    console.log('✅ Granted SELECT on all sequences in schema public to anon and authenticated roles.')

    // Also ensure the rls-policies are applied if they weren't
    // but first let's just fix the schema access.
    
    console.log('\nPermissions fixed successfully!')
  } catch (error) {
    console.error('❌ Failed to fix permissions:', error)
  } finally {
    await sql.end()
  }
}

fixPermissions()
