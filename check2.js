const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const p = await prisma.profiles.findFirst({ where: { email: 'owner2@example.com' } });
    console.log(p);
}

main().catch(console.error).finally(() => prisma.$disconnect());
