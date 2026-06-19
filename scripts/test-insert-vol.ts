import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.test.local' })

const prisma = new PrismaClient()

async function main() {
  console.log('Testing insert into volunteer_registrations...')
  try {
    // Let's query profiles first to find a valid user
    const user = await prisma.profiles.findFirst()
    console.log('Found user:', user?.id, user?.email)
    if (!user) {
      console.log('No profiles found!')
      return
    }

    // Let's query activities first to find a valid activity
    const activity = await prisma.activities.findFirst()
    console.log('Found activity:', activity?.id, activity?.title)
    if (!activity) {
      console.log('No activities found!')
      return
    }

    const res = await prisma.volunteer_registrations.create({
      data: {
        activity_id: activity.id,
        user_id: user.id,
        full_name: 'Test Volunteer',
        email: 'test@volunteer.com',
        phone: '08123456789',
        status: 'pending',
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
