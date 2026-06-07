import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function fixRLS() {
  console.log('Applying comprehensive RLS fixes for all public-facing tables...')
  try {
    const tables = [
      'activities',
      'communities',
      'profiles',
      'reports',
      'report_files',
      'journey_milestones',
      'feedbacks',
      'donations',
      'donation_items'
    ]

    for (const table of tables) {
      console.log(`Fixing RLS for table: ${table}`)
      await sql`ALTER TABLE public.${sql(table)} ENABLE ROW LEVEL SECURITY;`
      
      // Select for all
      await sql`DROP POLICY IF EXISTS "Public select" ON public.${sql(table)};`
      await sql`CREATE POLICY "Public select" ON public.${sql(table)} FOR SELECT USING (true);`
      
      // Service role full access
      await sql`DROP POLICY IF EXISTS "Service role all" ON public.${sql(table)};`
      await sql`CREATE POLICY "Service role all" ON public.${sql(table)} FOR ALL TO service_role USING (true) WITH CHECK (true);`
    }

    // Specific restrictive policies if needed (e.g. for donations, but usually public can see some info)
    // For now, let's keep it simple to ensure data visibility as requested.
    
    console.log('✅ All RLS policies updated to be more permissive for data visibility.')
  } catch (err) {
    console.error('❌ Error fixing RLS:', err)
  } finally {
    await sql.end()
  }
}

fixRLS()
