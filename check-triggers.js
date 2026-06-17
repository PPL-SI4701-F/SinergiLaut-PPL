const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const acts = await prisma.$queryRaw`SELECT trigger_name FROM information_schema.triggers`;
  console.log('Triggers:', acts);
}
main().catch(console.error).finally(() => prisma.$disconnect());
