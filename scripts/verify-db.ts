import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  const profiles = await prisma.profiles.count()
  const communities = await prisma.communities.count()
  const activities = await prisma.activities.count()
  const reports = await prisma.reports.count()

  console.log('Database Statistics:')
  console.log(`Profiles: ${profiles}`)
  console.log(`Communities: ${communities}`)
  console.log(`Activities: ${activities}`)
  console.log(`Reports: ${reports}`)

  if (activities > 0) {
    const samples = await prisma.activities.findMany({ take: 3 })
    console.log('\nSample Activities:')
    console.dir(samples, { depth: null })
  }
}

check()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
