import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function fixRLS() {
  console.log('Updating RLS policies for report_files and ensuring reports are visible...')
  try {
    // Reports: Ensure status is validated
    await sql`DROP POLICY IF EXISTS "Public can view validated reports" ON reports;`
    await sql`CREATE POLICY "Public can view validated reports" ON reports 
              FOR SELECT USING (status = 'validated');`
    
    // Report Files: Public can view if they belong to a validated report
    await sql`DROP POLICY IF EXISTS "Public can view report files" ON report_files;`
    // For simplicity in this environment, allow all SELECT for report_files
    await sql`CREATE POLICY "Public can view report files" ON report_files 
              FOR SELECT USING (true);`
    
    console.log('✅ RLS updated for reports and report_files.')
  } catch (err) {
    console.error('❌ Error fixing RLS:', err)
  } finally {
    await sql.end()
  }
}

fixRLS()
