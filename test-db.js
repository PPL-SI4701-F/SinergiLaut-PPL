const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  try {
    console.log("Connecting...");
    await prisma.$connect();
    console.log("Connected.");
    console.log("Counting profiles...");
    const count = await prisma.profiles.count();
    console.log("Profiles count:", count);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected.");
  }
}
test();
