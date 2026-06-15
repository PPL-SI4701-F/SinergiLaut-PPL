import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "is_banned" BOOLEAN NOT NULL DEFAULT false;`)
  console.log('Done')
}
main()
