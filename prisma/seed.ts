import { PrismaClient, user_role, verification_status, activity_status, volunteer_status, donation_status, disbursement_status, report_status } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

// Supabase Admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  console.log('🌱 Memulai pembersihan dan seed database SinergiLaut...\n')

  // ============================================
  // 1. CLEANUP DATABASE
  // ============================================
  console.log('🧹 Membersihkan database...')
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
  console.log('   ✅ Tabel database dibersihkan.')

  // Hapus semua auth users
  console.log('🔐 Membersihkan auth users...')
  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (authList?.users?.length) {
    for (const u of authList.users) {
      await supabase.auth.admin.deleteUser(u.id)
    }
    console.log(`   ✅ ${authList.users.length} auth user dihapus.`)
  } else {
    console.log('   ℹ️  Tidak ada auth user.')
  }

  async function createAuthUser(email: string, fullName: string, role: user_role) {
    const password = 'Password@2026'
    let userId: string

    const { data: list, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError
    
    const existing = list.users.find(u => u.email === email)
    
    if (existing) {
      userId = existing.id
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: fullName, role }
      })
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role },
      })
      if (error) throw new Error(`Gagal membuat user auth ${email}: ${error.message}`)
      userId = data.user.id
    }

    return await prisma.profiles.upsert({
      where: { id: userId },
      update: { email, full_name: fullName, role, is_active: true },
      create: { id: userId, email, full_name: fullName, role, is_active: true }
    })
  }

  // ============================================
  // 2. CREATE PROFILES
  // ============================================
  console.log('👤 Membuat profil pengguna...')
  const admin1 = await createAuthUser('admin1@sinergilaut.id', 'Admin Utama', 'admin')
  const admin2 = await createAuthUser('admin2@sinergilaut.id', 'Admin Reviewer', 'admin')

  const owner1 = await createAuthUser('owner1@example.com', 'Budi Bahari', 'community')
  const owner2 = await createAuthUser('owner2@example.com', 'Siti Pesisir', 'community')

  const userPending1 = await createAuthUser('pending1@user.com', 'Relawan Baru 1', 'user')
  const userPending2 = await createAuthUser('pending2@user.com', 'Relawan Baru 2', 'user')
  await prisma.profiles.updateMany({ where: { id: { in: [userPending1.id, userPending2.id] } }, data: { volunteer_status: 'pending' } })

  const userApproved1 = await createAuthUser('approved1@user.com', 'Relawan Aktif 1', 'user')
  const userApproved2 = await createAuthUser('approved2@user.com', 'Relawan Aktif 2', 'user')
  await prisma.profiles.updateMany({ where: { id: { in: [userApproved1.id, userApproved2.id] } }, data: { volunteer_status: 'approved' } })

  const userRejected1 = await createAuthUser('rejected1@user.com', 'Relawan Gagal 1', 'user')
  const userRejected2 = await createAuthUser('rejected2@user.com', 'Relawan Gagal 2', 'user')
  await prisma.profiles.updateMany({ where: { id: { in: [userRejected1.id, userRejected2.id] } }, data: { volunteer_status: 'rejected' } })
  console.log('   ✅ Profil pengguna dibuat.')

  // ============================================
  // 3. CREATE COMMUNITIES
  // ============================================
  console.log('🌊 Membuat komunitas...')
  const comms = []
  const vStatuses: verification_status[] = ['approved', 'pending', 'rejected']
  for (const status of vStatuses) {
    for (let i = 1; i <= 2; i++) {
      const comm = await prisma.communities.create({
        data: {
          owner_id: i === 1 ? owner1.id : owner2.id,
          name: `Komunitas ${status} ${i}`,
          slug: `komunitas-${status}-${i}`,
          description: `Deskripsi komunitas status ${status}`,
          location: i === 1 ? 'Bali' : 'Lombok',
          verification_status: status,
          is_verified: status === 'approved',
          bank_name: 'BCA',
          bank_account_number: `123456789${i}`,
          bank_account_name: `Rekening Komunitas ${i}`,
        }
      })
      comms.push(comm)
      await prisma.community_verifications.create({
        data: {
          community_id: comm.id,
          status: status,
          legal_name: `PT ${comm.name}`,
          establishment_year: 2020,
          representative_name: i === 1 ? owner1.full_name : owner2.full_name,
        }
      })
    }
  }
  console.log('   ✅ Komunitas dibuat.')

  // ============================================
  // 4. CREATE ACTIVITIES
  // ============================================
  console.log('📋 Membuat kegiatan...')
  const approvedComm = comms.find(c => c.verification_status === 'approved')!
  const activityStatuses: activity_status[] = ['draft', 'pending_review', 'published', 'cancelled', 'completed']
  const activities = []
  
  const activityImages = [
    '/images/activities/activity-template-1.png',
    '/images/activities/activity-template-2.png',
    '/images/beach-cleanup.jpg',
    '/images/coral-restoration.jpg',
    '/images/mangrove-planting.jpg',
  ]

  for (const status of activityStatuses) {
    for (let i = 1; i <= 2; i++) {
      const imgIdx = (activities.length) % activityImages.length
      const isCompleted = status === 'completed'
      const goal = 10000000
      const quota = 20
      
      const act = await prisma.activities.create({
        data: {
          community_id: approvedComm.id,
          title: `Kegiatan ${status} ${i}`,
          slug: `kegiatan-${status}-${i}`,
          description: `Detail kegiatan status ${status}.`,
          category: i === 1 ? 'cleanup' : 'restoration',
          status: status,
          start_date: new Date(Date.now() + (i * 86400000 * 30)),
          location: i === 1 ? 'Pantai Kuta' : 'Pantai Sanur',
          volunteer_quota: quota,
          volunteer_count: isCompleted ? quota : 0,
          funding_goal: goal,
          funding_raised: isCompleted ? goal : 0,
          allow_item_donation: true,
          items_needed: [{ item_name: 'Gloves', target: 50, donated: isCompleted ? 50 : 0 }],
          cover_image_url: activityImages[imgIdx],
          published_at: (status === 'published' || status === 'completed') ? new Date() : null,
        }
      })
      activities.push(act)
    }
  }
  console.log('   ✅ Kegiatan dibuat.')

  // ============================================
  // 5. VOLUNTEER REGISTRATIONS
  // ============================================
  console.log('🙋 Membuat pendaftaran relawan...')
  const activeAct = activities.find(a => a.status === 'published')!
  const regStatuses: volunteer_status[] = ['pending', 'approved', 'rejected', 'attended']
  const testUsers = [userApproved1, userApproved2, userPending1, userPending2, userRejected1, userRejected2, admin1, admin2]
  
  let userIdx = 0
  for (const rStatus of regStatuses) {
    for (let i = 1; i <= 2; i++) {
      const currentUser = testUsers[userIdx % testUsers.length]
      await prisma.volunteer_registrations.create({
        data: {
          activity_id: activeAct.id,
          user_id: currentUser.id,
          full_name: currentUser.full_name!,
          email: currentUser.email,
          phone: '08123456789',
          status: rStatus,
          agreed_to_terms: true,
        }
      })
      userIdx++
    }
  }
  console.log('   ✅ Pendaftaran relawan dibuat.')

  // ============================================
  // 6. DONATIONS
  // ============================================
  console.log('💰 Membuat donasi...')
  const dStatuses: donation_status[] = ['pending', 'completed', 'refunded']
  for (const dStatus of dStatuses) {
    for (let i = 1; i <= 2; i++) {
      await prisma.donations.create({
        data: {
          activity_id: activeAct.id,
          user_id: userApproved1.id,
          donor_name: userApproved1.full_name!,
          donor_email: userApproved1.email,
          type: 'money',
          amount: 500000,
          status: dStatus,
          midtrans_order_id: `ORDER-${dStatus}-${i}-${Date.now()}`,
        }
      })
    }
  }
  console.log('   ✅ Donasi dibuat.')

  // ============================================
  // 7. DISBURSEMENTS
  // ============================================
  console.log('💸 Membuat pencairan dana...')
  const disbStatuses: disbursement_status[] = ['pending', 'processing', 'completed', 'failed']
  for (const status of disbStatuses) {
    for (let i = 1; i <= 2; i++) {
      await prisma.disbursements.create({
        data: {
          activity_id: activeAct.id,
          community_id: approvedComm.id,
          amount: 2000000,
          status: status,
          bank_name: 'BCA',
          account_number: '123456789',
          account_name: 'Yayasan Bahari',
          disbursed_by: admin1.id,
        }
      })
    }
  }
  console.log('   ✅ Pencairan dana dibuat.')

  // ============================================
  // 8. REPORTS
  // ============================================
  console.log('📄 Membuat laporan...')
  const completedActivitiesSeed = activities.filter(a => a.status === 'completed')
  
  // Add one EXTRA completed activity as requested
  const extraCompleted = await prisma.activities.create({
    data: {
      community_id: approvedComm.id,
      title: "Ekspedisi Terumbu Karang Selesai",
      slug: "ekspedisi-terumbu-karang-selesai",
      description: "Kegiatan ekspedisi pemantauan terumbu karang yang telah berhasil dilaksanakan sepenuhnya.",
      category: "restoration",
      status: "completed",
      start_date: new Date(Date.now() - (30 * 86400000)),
      location: "Pulau Menjangan",
      volunteer_quota: 15,
      funding_goal: 15000000,
      funding_raised: 15000000,
      volunteer_count: 15,
      cover_image_url: '/images/activities/activity-template-1.png',
      published_at: new Date(Date.now() - (60 * 86400000)),
    }
  })
  completedActivitiesSeed.push(extraCompleted)

  const rStatuses: report_status[] = ['draft', 'submitted', 'validated', 'rejected']
  
  for (const [idx, act] of completedActivitiesSeed.entries()) {
    // Each completed activity gets at least one validated report
    const report = await prisma.reports.create({
      data: {
        activity_id: act.id,
        community_id: approvedComm.id,
        submitted_by: owner1.id,
        title: `Laporan Akhir ${act.title}`,
        summary: `Ini adalah laporan pertanggungjawaban untuk kegiatan ${act.title}. Semua target telah tercapai dengan baik. Berikut adalah bukti dokumentasi dan penggunaan dana.`,
        status: 'validated',
        fund_usage: [
          { item: 'Sewa Alat Selam', amount: 2500000 },
          { item: 'Transportasi Kapal', amount: 3000000 },
          { item: 'Konsumsi Relawan', amount: 1500000 }
        ],
      }
    })

    // Add report files (documentation)
    await prisma.report_files.createMany({
      data: [
        { report_id: report.id, file_url: '/images/reports/completed-1.png', file_name: 'Dokumentasi Utama.png', file_type: 'image' },
        { report_id: report.id, file_url: '/images/reports/completed-2.png', file_name: 'Foto Kegiatan Lapangan.png', file_type: 'image' },
        { report_id: report.id, file_url: '/images/reports/completed-3.png', file_name: 'Bukti Pengeluaran.png', file_type: 'image' },
      ]
    })
  }

  // Also create some other status reports for the first active activity for testing
  for (const status of rStatuses) {
    await prisma.reports.create({
      data: {
        activity_id: activeAct.id,
        community_id: approvedComm.id,
        submitted_by: owner1.id,
        title: `Laporan Testing ${status}`,
        summary: `Summary testing status ${status}`,
        status: status,
        fund_usage: [],
      }
    })
  }
  console.log('   ✅ Laporan dibuat.')

  // ============================================
  // 9. MILESTONES
  // ============================================
  console.log('🏆 Mengecek journey milestones...')
  await prisma.journey_milestones.createMany({
    data: [
      { year: 2020, title: 'SinergiLaut Didirikan', description: 'Platform lahir.', order_index: 1 },
      { year: 2026, title: 'Next Gen', description: 'Platform modern.', order_index: 2 },
    ],
  })
  console.log('   ✅ Journey milestones di-seed.')

  console.log('\n✅ SEED SELESAI!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
