import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function fix() {
  console.log('Granting schema usage to public roles...')
  try {
    // Schema usage
    await sql`GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;`
    await sql`GRANT ALL ON SCHEMA public TO postgres, service_role;`

    // Resetting defaults to ensure future tables are also accessible
    await sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;`
    await sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;`

    // Re-applying grants to current tables
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    for (const row of tables) {
      const table = row.tablename
      console.log(`Fixing table: ${table}`)
      await sql`GRANT SELECT ON public.${sql(table)} TO anon, authenticated;`
      await sql`GRANT ALL ON public.${sql(table)} TO service_role;`
    }

    console.log('✅ Permissions fixed.')
  } catch (err) {
    console.error('❌ Error fixing permissions:', err)
  } finally {
    await sql.end()
  }
}

fix()
