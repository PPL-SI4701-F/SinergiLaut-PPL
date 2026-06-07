import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const sql = postgres(process.env.DATABASE_URL!)

async function check() {
  const schemaUsage = await sql`SELECT grantee, privilege_type FROM information_schema.usage_privileges WHERE object_schema = 'public'`
  console.log('Schema Usage:', schemaUsage)

  const tableGrants = await sql`SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated', 'service_role')`
  console.log('Table Grants:', tableGrants)

  const rlsStatus = await sql`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
  console.log('RLS Status:', rlsStatus)

  await sql.end()
}

check()
