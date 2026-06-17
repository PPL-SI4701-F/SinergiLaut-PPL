const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log("Restoring Supabase default grants for anon and authenticated roles...");
  
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;`);
  console.log("Granted USAGE on SCHEMA public");
  
  await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;`);
  console.log("Granted ALL PRIVILEGES on ALL TABLES");
  
  await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;`);
  console.log("Granted ALL PRIVILEGES on ALL SEQUENCES");
  
  await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;`);
  console.log("Granted ALL PRIVILEGES on ALL ROUTINES");
  
  await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema';`);
  console.log("Reloaded PostgREST schema cache");
  
  console.log("All grants restored successfully! Supabase client should now work.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
