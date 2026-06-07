import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function fixRLS() {
  console.log('Enabling RLS and re-applying policies...')
  try {
    // Enable RLS for all tables
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    for (const row of tables) {
      const table = row.tablename
      console.log(`Enabling RLS for table: ${table}`)
      await sql`ALTER TABLE public.${sql(table)} ENABLE ROW LEVEL SECURITY;`
    }

    // Profiles
    await sql`DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;`
    await sql`CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);`

    // Activities
    await sql`DROP POLICY IF EXISTS "Public can view published activities" ON activities;`
    await sql`CREATE POLICY "Public can view published activities" ON activities FOR SELECT USING (status = 'published');`
    
    // Communities
    await sql`DROP POLICY IF EXISTS "Public can read verified communities" ON communities;`
    await sql`CREATE POLICY "Public can read verified communities" ON communities FOR SELECT USING (is_verified = true);`

    // Reports
    await sql`DROP POLICY IF EXISTS "Public can view validated reports" ON reports;`
    await sql`CREATE POLICY "Public can view validated reports" ON reports FOR SELECT USING (status = 'validated');`

    // Journey Milestones
    await sql`DROP POLICY IF EXISTS "Public can read published milestones" ON journey_milestones;`
    await sql`CREATE POLICY "Public can read published milestones" ON journey_milestones FOR SELECT USING (is_published = true);`

    // Service role bypass (important for Admin functions)
    for (const row of tables) {
        const table = row.tablename
        await sql`DROP POLICY IF EXISTS "Admin full access" ON ${sql(table)};`
        // We use a dummy true policy for service_role if needed, but service_role usually bypasses RLS if configured.
        // To be safe in Supabase, we can add:
        await sql`CREATE POLICY "Admin full access" ON ${sql(table)} FOR ALL TO service_role USING (true) WITH CHECK (true);`
    }

    console.log('✅ RLS and Policies updated.')
  } catch (err) {
    console.error('❌ Error fixing RLS:', err)
  } finally {
    await sql.end()
  }
}

fixRLS()
