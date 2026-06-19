import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.test.local' })

const prisma = new PrismaClient()

async function main() {
  console.log('Testing insert into volunteer_registrations with status approved...')
  try {
    const user = await prisma.profiles.findFirst()
    const activity = await prisma.activities.findFirst()
    if (!user || !activity) {
      console.log('User or activity not found!')
      return
    }

    const res = await prisma.volunteer_registrations.create({
      data: {
        activity_id: activity.id,
        user_id: user.id,
        full_name: 'Test Volunteer Approved',
        email: 'test_approved@volunteer.com',
        phone: '08123456789',
        status: 'approved',
        agreed_to_terms: true,
      }
    })
    console.log('Insert succeeded! Result:', res)
  } catch (e) {
    console.error('Insert failed with error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
