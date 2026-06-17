const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRawUnsafe(`SELECT unnest(enum_range(NULL::report_status))::text AS status`);
    console.log("report_status:", result);
  } catch(e) {
    console.log("error:", e);
  }
}
main();
