const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProfile() {
  const profile = await prisma.profiles.findFirst({
    where: { id: 'f345d913-d29d-4aac-9db5-9345584c482b' }
  });
  console.log("Profile from Prisma:", profile);
}

checkProfile().finally(() => prisma.$disconnect());
