const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('GRANT USAGE ON SCHEMA public TO anon, authenticated');
  await prisma.$executeRawUnsafe('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated');
  await prisma.$executeRawUnsafe('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated');
  console.log('Grants added!');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
