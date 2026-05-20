import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function cleanData() {
  console.log('🧹 Starting full Supabase cleanup...')

  try {
    // 1. Clean Prisma Tables (Public Schema)
    console.log('--- Cleaning Database Tables ---')
    // We can use deleteMany or just run a raw query to truncate everything
    // Let's use deleteMany for safety with Prisma
    await prisma.audit_logs.deleteMany({})
    await prisma.notifications.deleteMany({})
    await prisma.feedbacks.deleteMany({})
    await prisma.sanctions.deleteMany({})
    await prisma.report_files.deleteMany({})
    await prisma.reports.deleteMany({})
    await prisma.disbursements.deleteMany({})
    await prisma.donation_items.deleteMany({})
    await prisma.donations.deleteMany({})
    await prisma.volunteer_registrations.deleteMany({})
    await prisma.community_verifications.deleteMany({})
    await prisma.activities.deleteMany({})
    await prisma.communities.deleteMany({})
    await prisma.journey_milestones.deleteMany({})
    await prisma.profiles.deleteMany({})
    console.log('✅ Database tables cleaned.')

    // 2. Clean Auth Users
    console.log('--- Cleaning Auth Users ---')
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError

    if (users && users.length > 0) {
      console.log(`Deleting ${users.length} users...`)
      for (const user of users) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        if (deleteError) {
          console.error(`Failed to delete user ${user.id}: ${deleteError.message}`)
        }
      }
      console.log('✅ Auth users cleaned.')
    } else {
      console.log('No auth users to delete.')
    }

    // 3. Clean Storage
    console.log('--- Cleaning Storage Buckets ---')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
        if (bucketError.message.includes('not found')) {
            console.log('No buckets found.')
        } else {
            throw bucketError
        }
    } else {
        for (const bucket of buckets) {
            console.log(`Emptying bucket: ${bucket.name}...`)
            const { data: files, error: listFilesError } = await supabase.storage.from(bucket.name).list()
            if (listFilesError) {
                console.error(`Failed to list files in ${bucket.name}: ${listFilesError.message}`)
                continue
            }
            if (files && files.length > 0) {
                const filePaths = files.map(f => f.name)
                const { error: deleteFilesError } = await supabase.storage.from(bucket.name).remove(filePaths)
                if (deleteFilesError) {
                    console.error(`Failed to delete files in ${bucket.name}: ${deleteFilesError.message}`)
                }
            }
        }
        console.log('✅ Storage cleaned.')
    }

    console.log('\n✨ Cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanData()
