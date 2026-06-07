import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  const completed = await prisma.activities.count({
    where: { status: 'completed' }
  })
  console.log('Completed Activities count:', completed)
  
  const samples = await prisma.activities.findMany({
    where: { status: 'completed' },
    take: 5
  })
  console.log('Samples:', samples.map(s => s.title))
}

check()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
