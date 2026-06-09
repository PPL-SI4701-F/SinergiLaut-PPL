import {
  PrismaClient,
  user_role,
  verification_status,
  activity_status,
  volunteer_status,
  donation_status,
  disbursement_status,
  report_status,
} from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

// Supabase Admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Helpers ────────────────────────────────────────────────────────────────

/** Counter-based unique order ID — tidak bergantung pada Date.now() semata */
let orderCounter = 1
function nextOrderId(prefix: string): string {
  return `${prefix}-${Date.now()}-${String(orderCounter++).padStart(4, '0')}`
}

async function createAuthUser(email: string, fullName: string, role: user_role) {
  const password = 'Password@2026'
  let userId: string

  const { data: list, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) throw listError

  const existing = list.users.find((u) => u.email === email)

  if (existing) {
    userId = existing.id
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: fullName, role },
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
    create: { id: userId, email, full_name: fullName, role, is_active: true },
  })
}

// ── Main ───────────────────────────────────────────────────────────────────

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

  // ============================================
  // 2. CREATE PROFILES
  // ============================================
  console.log('👤 Membuat profil pengguna...')

  const admin1 = await createAuthUser('admin1@sinergilaut.id', 'Admin Utama', 'admin')
  const admin2 = await createAuthUser('admin2@sinergilaut.id', 'Admin Reviewer', 'admin')

  const owner1 = await createAuthUser('owner1@example.com', 'Budi Bahari', 'community')
  const owner2 = await createAuthUser('owner2@example.com', 'Siti Pesisir', 'community')

  // Pending volunteers — belum lengkap KTP-nya
  const userPending1 = await createAuthUser('pending1@user.com', 'Andi Pratama', 'user')
  const userPending2 = await createAuthUser('pending2@user.com', 'Rina Kusuma', 'user')
  await prisma.profiles.updateMany({
    where: { id: { in: [userPending1.id, userPending2.id] } },
    data: {
      volunteer_status: 'pending',
      phone: '081234000001',
      nik: '3201010101010001',
      date_of_birth: new Date('1999-03-12'),
      gender: 'male',
      address: 'Jl. Pemuda No. 5, Surabaya',
    },
  })

  // Approved volunteers — data lengkap, siap daftar kegiatan
  const userApproved1 = await createAuthUser('approved1@user.com', 'Dian Rahmawati', 'user')
  const userApproved2 = await createAuthUser('approved2@user.com', 'Fajar Nugroho', 'user')
  await prisma.profiles.updateMany({
    where: { id: { in: [userApproved1.id, userApproved2.id] } },
    data: {
      volunteer_status: 'approved',
      phone: '082134000002',
      nik: '3271010303950001',
      date_of_birth: new Date('1995-08-17'),
      gender: 'female',
      address: 'Jl. Merdeka No. 10, Bandung',
    },
  })

  // Rejected volunteers
  const userRejected1 = await createAuthUser('rejected1@user.com', 'Hendra Santoso', 'user')
  const userRejected2 = await createAuthUser('rejected2@user.com', 'Lina Wijaya', 'user')
  await prisma.profiles.updateMany({
    where: { id: { in: [userRejected1.id, userRejected2.id] } },
    data: {
      volunteer_status: 'rejected',
      volunteer_reject_note: 'Data NIK tidak sesuai dengan foto KTP yang diunggah.',
      phone: '083134000003',
      nik: '3578010101010003',
      date_of_birth: new Date('1997-11-05'),
      gender: 'male',
      address: 'Jl. Diponegoro No. 22, Semarang',
    },
  })

  // Extra approved users untuk mengisi slot volunteer_registrations (admin tidak boleh jadi relawan)
  const userApproved3 = await createAuthUser('approved3@user.com', 'Maya Sari', 'user')
  const userApproved4 = await createAuthUser('approved4@user.com', 'Rizky Aditya', 'user')
  await prisma.profiles.updateMany({
    where: { id: { in: [userApproved3.id, userApproved4.id] } },
    data: {
      volunteer_status: 'approved',
      phone: '085234000004',
      nik: '3374010101010004',
      date_of_birth: new Date('2000-01-20'),
      gender: 'female',
      address: 'Jl. Ahmad Yani No. 7, Yogyakarta',
    },
  })

  console.log('   ✅ Profil pengguna dibuat.')

  // ============================================
  // 3. CREATE COMMUNITIES
  // ============================================
  console.log('🌊 Membuat komunitas...')

  const communityData = [
    {
      name: 'Yayasan Laut Bersih Nusantara',
      slug: 'yayasan-laut-bersih-nusantara',
      location: 'Denpasar, Bali',
      focus_areas: ['cleanup', 'education'],
      bank: 'BCA',
    },
    {
      name: 'Komunitas Karang Hidup Sulawesi',
      slug: 'komunitas-karang-hidup-sulawesi',
      location: 'Makassar, Sulawesi Selatan',
      focus_areas: ['restoration', 'research'],
      bank: 'BRI',
    },
    {
      name: 'Gerakan Pesisir Hijau Lombok',
      slug: 'gerakan-pesisir-hijau-lombok',
      location: 'Mataram, Nusa Tenggara Barat',
      focus_areas: ['cleanup', 'restoration', 'education'],
      bank: 'Mandiri',
    },
    {
      name: 'Relawan Mangrove Kalimantan',
      slug: 'relawan-mangrove-kalimantan',
      location: 'Balikpapan, Kalimantan Timur',
      focus_areas: ['restoration'],
      bank: 'BNI',
    },
    {
      name: 'Forum Konservasi Laut Maluku',
      slug: 'forum-konservasi-laut-maluku',
      location: 'Ambon, Maluku',
      focus_areas: ['research', 'monitoring'],
      bank: 'BCA',
    },
    {
      name: 'Komunitas Baru Belum Terverifikasi',
      slug: 'komunitas-baru-belum-terverifikasi',
      location: 'Surabaya, Jawa Timur',
      focus_areas: ['cleanup'],
      bank: 'Mandiri',
    },
  ]

  const vStatuses: verification_status[] = ['approved', 'approved', 'approved', 'approved', 'pending', 'rejected']
  const owners = [owner1, owner2, owner1, owner2, owner1, owner2]
  const logoUrls = [
    '/images/partner-1.jpg',
    '/images/partner-2.jpg',
    '/images/partner-3.jpg',
    '/images/partner-4.jpg',
    null,
    null,
  ]

  const comms: Awaited<ReturnType<typeof prisma.communities.create>>[] = []

  for (let i = 0; i < communityData.length; i++) {
    const cd = communityData[i]
    const status = vStatuses[i]
    const comm = await prisma.communities.create({
      data: {
        owner_id: owners[i].id,
        name: cd.name,
        slug: cd.slug,
        description: `${cd.name} adalah komunitas konservasi laut aktif yang berfokus pada program-program berkelanjutan di wilayah ${cd.location}.`,
        location: cd.location,
        focus_areas: cd.focus_areas,
        verification_status: status,
        is_verified: status === 'approved',
        logo_url: logoUrls[i],
        bank_name: cd.bank,
        bank_account_number: `10000000${String(i + 1).padStart(2, '0')}`,
        bank_account_name: cd.name,
      },
    })
    comms.push(comm)

    await prisma.community_verifications.create({
      data: {
        community_id: comm.id,
        status: status,
        legal_name: cd.name,
        establishment_year: 2019 + i,
        representative_name: owners[i].full_name ?? '',
        representative_email: owners[i].email,
      },
    })
  }

  const approvedComm = comms[0] // Yayasan Laut Bersih Nusantara
  console.log('   ✅ Komunitas dibuat.')

  // ============================================
  // 4. CREATE ACTIVITIES
  // ============================================
  console.log('📋 Membuat kegiatan...')

  const itemsNeededCleanup = [
    { item_name: 'Sarung Tangan Karet', target: 100, donated: 0, unit_price: 12000 },
    { item_name: 'Kantong Sampah Besar (50L)', target: 200, donated: 0, unit_price: 4500 },
    { item_name: 'Pelampung Keselamatan', target: 20, donated: 0, unit_price: 85000 },
    { item_name: 'Topi Rimba', target: 50, donated: 0, unit_price: 35000 },
  ]

  const itemsNeededRestoration = [
    { item_name: 'Fragmen Karang (bibit)', target: 500, donated: 0, unit_price: 8000 },
    { item_name: 'Tali Nilon 10m', target: 50, donated: 0, unit_price: 25000 },
    { item_name: 'Pemberat Beton Mini', target: 100, donated: 0, unit_price: 15000 },
  ]

  const activityDefs: {
    title: string
    slug: string
    description: string
    category: 'cleanup' | 'restoration' | 'education' | 'research' | 'event'
    status: activity_status
    location: string
    daysFromNow: number
    cover: string
    items: typeof itemsNeededCleanup | null
  }[] = [
    // Draft
    {
      title: 'Rencana Bersih Pantai Sanur',
      slug: 'rencana-bersih-pantai-sanur',
      description: 'Program pembersihan sampah plastik di sepanjang Pantai Sanur bersama komunitas nelayan lokal.',
      category: 'cleanup',
      status: 'draft',
      location: 'Pantai Sanur, Bali',
      daysFromNow: 60,
      cover: '/images/activities/activity-template-1.png',
      items: itemsNeededCleanup,
    },
    {
      title: 'Riset Biota Laut Nusa Penida',
      slug: 'riset-biota-laut-nusa-penida',
      description: 'Survei dan pendataan biota laut endemik di kawasan konservasi Nusa Penida.',
      category: 'research',
      status: 'draft',
      location: 'Nusa Penida, Bali',
      daysFromNow: 90,
      cover: '/images/activities/activity-template-2.png',
      items: null,
    },
    // Pending Review
    {
      title: 'Edukasi Lingkungan Laut untuk Pelajar SD',
      slug: 'edukasi-lingkungan-laut-pelajar-sd',
      description: 'Program edukasi interaktif tentang ekosistem laut dan bahaya sampah plastik untuk 500 pelajar SD di pesisir Bali.',
      category: 'education',
      status: 'pending_review',
      location: 'Kuta, Bali',
      daysFromNow: 45,
      cover: '/images/beach-cleanup.jpg',
      items: null,
    },
    {
      title: 'Pemantauan Terumbu Karang Amed',
      slug: 'pemantauan-terumbu-karang-amed',
      description: 'Ekspedisi monitoring kondisi terumbu karang dan populasi ikan di kawasan Amed menggunakan metode transek sabuk.',
      category: 'research',
      status: 'pending_review',
      location: 'Amed, Karangasem, Bali',
      daysFromNow: 50,
      cover: '/images/coral-restoration.jpg',
      items: null,
    },
    // Published
    {
      title: 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik',
      slug: 'bersih-pantai-kuta-aksi-nyata-lawan-plastik',
      description:
        'Program pembersihan intensif Pantai Kuta dari sampah plastik. Target pengangkatan 3 ton sampah dengan melibatkan 200 relawan. ' +
        'Dipasang pula jaring penangkap sampah di muara kali untuk mencegah sampah baru masuk ke laut.',
      category: 'cleanup',
      status: 'published',
      location: 'Pantai Kuta, Badung, Bali',
      daysFromNow: 14,
      cover: '/images/activities/activity-template-1.png',
      items: itemsNeededCleanup,
    },
    {
      title: 'Rehabilitasi Terumbu Karang Menjangan',
      slug: 'rehabilitasi-terumbu-karang-menjangan',
      description:
        'Program rehabilitasi terumbu karang di kawasan Taman Nasional Bali Barat — Pulau Menjangan. ' +
        'Menargetkan penanaman 1.000 fragmen karang dengan metode coral gardening bersama nelayan lokal.',
      category: 'restoration',
      status: 'published',
      location: 'Pulau Menjangan, Buleleng, Bali',
      daysFromNow: 21,
      cover: '/images/coral-restoration.jpg',
      items: itemsNeededRestoration,
    },
    // Cancelled
    {
      title: 'Festival Laut Nusantara 2026',
      slug: 'festival-laut-nusantara-2026',
      description: 'Festival tahunan yang menampilkan pameran seni berbahan daur ulang sampah laut dan pertunjukan budaya pesisir.',
      category: 'event',
      status: 'cancelled',
      location: 'GWK Cultural Park, Badung, Bali',
      daysFromNow: -10,
      cover: '/images/activities/activity-template-2.png',
      items: null,
    },
    {
      title: 'Penanaman Mangrove Pantai Serangan',
      slug: 'penanaman-mangrove-pantai-serangan',
      description: 'Program penanaman 2.000 bibit mangrove di kawasan Pantai Serangan sebagai upaya pemulihan ekosistem pesisir.',
      category: 'restoration',
      status: 'cancelled',
      location: 'Pantai Serangan, Denpasar Selatan, Bali',
      daysFromNow: -5,
      cover: '/images/mangrove-planting.jpg',
      items: null,
    },
    // Completed
    {
      title: 'Ekspedisi Terumbu Karang Raja Ampat',
      slug: 'ekspedisi-terumbu-karang-raja-ampat',
      description: 'Ekspedisi pemantauan dan pemulihan terumbu karang di Raja Ampat. 15 penyelam bersertifikat berhasil mendokumentasikan kondisi reef dan menanam 800 fragmen karang.',
      category: 'restoration',
      status: 'completed',
      location: 'Raja Ampat, Papua Barat Daya',
      daysFromNow: -45,
      cover: '/images/coral-restoration.jpg',
      items: null,
    },
    {
      title: 'Bersih Pantai Besar Bunaken',
      slug: 'bersih-pantai-besar-bunaken',
      description: 'Aksi bersih pantai massal di kawasan Taman Nasional Bunaken. 80 relawan berhasil mengangkat 4,5 ton sampah plastik dari garis pantai.',
      category: 'cleanup',
      status: 'completed',
      location: 'Bunaken, Manado, Sulawesi Utara',
      daysFromNow: -30,
      cover: '/images/activities/activity-template-1.png',
      items: null,
    },
  ]

  const activities: Awaited<ReturnType<typeof prisma.activities.create>>[] = []

  for (const def of activityDefs) {
    const isCompleted = def.status === 'completed'
    const fundingGoal = isCompleted ? 15_000_000 : 10_000_000
    const volunteerQuota = isCompleted ? 15 : 30

    const itemsSeeded = def.items
      ? def.items.map((item) => ({
          ...item,
          donated: isCompleted ? item.target : 0,
        }))
      : null

    const act = await prisma.activities.create({
      data: {
        community_id: approvedComm.id,
        title: def.title,
        slug: def.slug,
        description: def.description,
        category: def.category,
        status: def.status,
        start_date: new Date(Date.now() + def.daysFromNow * 86_400_000),
        location: def.location,
        volunteer_quota: volunteerQuota,
        volunteer_count: isCompleted ? volunteerQuota : 0,
        funding_goal: fundingGoal,
        funding_raised: isCompleted ? fundingGoal : 0,
        allow_item_donation: def.items !== null,
        items_needed: itemsSeeded ?? undefined,
        cover_image_url: def.cover,
        images: isCompleted
          ? [
              '/images/reports/completed-1.png',
              '/images/reports/completed-2.png',
              '/images/reports/completed-3.png',
            ]
          : [],
        published_at:
          def.status === 'published' || def.status === 'completed'
            ? new Date(Date.now() - 7 * 86_400_000)
            : null,
      },
    })
    activities.push(act)
  }

  const publishedActivities = activities.filter((a) => a.status === 'published')
  const activeAct = publishedActivities[0] // Bersih Pantai Kuta
  console.log('   ✅ Kegiatan dibuat.')

  // ============================================
  // 5. VOLUNTEER REGISTRATIONS
  // ============================================
  console.log('🙋 Membuat pendaftaran relawan...')

  // Hanya approved users yang mendaftar (bukan admin)
  const volunteerPool = [userApproved1, userApproved2, userApproved3, userApproved4, userPending1, userPending2, userRejected1, userRejected2]
  const regStatuses: volunteer_status[] = ['pending', 'approved', 'rejected', 'attended']

  let poolIdx = 0
  for (const rStatus of regStatuses) {
    for (let i = 0; i < 2; i++) {
      const currentUser = volunteerPool[poolIdx % volunteerPool.length]
      await prisma.volunteer_registrations.create({
        data: {
          activity_id: activeAct.id,
          user_id: currentUser.id,
          full_name: currentUser.full_name!,
          email: currentUser.email,
          phone: '08123456789',
          reason: 'Ingin berkontribusi untuk kebersihan laut Indonesia.',
          status: rStatus,
          agreed_to_terms: true,
        },
      })
      poolIdx++
    }
  }

  // Juga tambah beberapa registrasi di kegiatan ke-2 (Rehabilitasi Terumbu Karang)
  const activeAct2 = publishedActivities[1]
  if (activeAct2) {
    for (const u of [userApproved1, userApproved2]) {
      await prisma.volunteer_registrations.create({
        data: {
          activity_id: activeAct2.id,
          user_id: u.id,
          full_name: u.full_name!,
          email: u.email,
          phone: '08123456789',
          reason: 'Tertarik dengan program rehabilitasi karang.',
          status: 'pending',
          agreed_to_terms: true,
        },
      })
    }
  }

  console.log('   ✅ Pendaftaran relawan dibuat.')

  // ============================================
  // 6. DONATIONS
  // ============================================
  console.log('💰 Membuat donasi...')

  const donorNames = ['Budi Santoso', 'Citra Dewi', 'Donatur Anonim', 'Wahyu Hidayat']
  const donorEmails = [
    'budi.santoso@gmail.com',
    'citra.dewi@yahoo.com',
    'anonymous@sinergilaut.id',
    'wahyu.h@gmail.com',
  ]

  const donationAmountByStatus: Record<donation_status, number> = {
    pending: 500_000,
    completed: 3_000_000,
    refunded: 250_000,
  }
  const dStatuses: donation_status[] = ['pending', 'completed', 'refunded']

  let donorIdx = 0
  for (const dStatus of dStatuses) {
    for (let i = 0; i < 2; i++) {
      await prisma.donations.create({
        data: {
          activity_id: activeAct.id,
          user_id: dStatus === 'completed' ? userApproved1.id : null,
          donor_name: donorNames[donorIdx % donorNames.length],
          donor_email: donorEmails[donorIdx % donorEmails.length],
          type: 'money',
          amount: donationAmountByStatus[dStatus],
          status: dStatus,
          is_anonymous: dStatus === 'pending' && i === 1,
          note: dStatus === 'completed' ? 'Semangat terus untuk menjaga laut kita!' : undefined,
          midtrans_order_id: nextOrderId(`SL-${dStatus.toUpperCase()}`),
        },
      })
      donorIdx++
    }
  }

  // Sinkronkan funding_raised kegiatan aktif (2 × completed = 6.000.000)
  await prisma.activities.update({
    where: { id: activeAct.id },
    data: { funding_raised: donationAmountByStatus.completed * 2 },
  })

  // Tambah donasi item (fulfillment) untuk variasi data
  const fulfillmentDonation = await prisma.donations.create({
    data: {
      activity_id: activeAct.id,
      user_id: userApproved2.id,
      donor_name: userApproved2.full_name!,
      donor_email: userApproved2.email,
      type: 'item',
      amount: 120_000, // nilai barang (2 sarung tangan × Rp 12.000 × markup 110%)
      status: 'completed',
      midtrans_order_id: nextOrderId('SL-ITEM'),
    },
  })
  await prisma.donation_items.createMany({
    data: [
      { donation_id: fulfillmentDonation.id, item_name: 'Sarung Tangan Karet', quantity: 10, item_condition: 'new' },
      { donation_id: fulfillmentDonation.id, item_name: 'Kantong Sampah Besar (50L)', quantity: 20, item_condition: 'new' },
    ],
  })

  console.log('   ✅ Donasi dibuat.')

  // ============================================
  // 7. DISBURSEMENTS
  // ============================================
  // Pemasukan completed: 2 × 3.000.000 = 6.000.000
  // Pengeluaran completed (net): 2 × (2.000.000 − 200.000) = 3.600.000 → Saldo +2.400.000
  console.log('💸 Membuat pencairan dana...')

  const disbStatuses: disbursement_status[] = ['pending', 'processing', 'completed', 'failed']
  for (const status of disbStatuses) {
    for (let i = 0; i < 2; i++) {
      await prisma.disbursements.create({
        data: {
          activity_id: activeAct.id,
          community_id: approvedComm.id,
          amount: 2_000_000,
          platform_fee: 200_000,
          status: status,
          bank_name: 'BCA',
          account_number: '1000000001',
          account_name: approvedComm.name,
          notes:
            status === 'completed'
              ? 'Pencairan dana tahap 1 untuk operasional kegiatan.'
              : status === 'failed'
              ? 'Gagal — nomor rekening tidak aktif, harap perbarui data bank.'
              : undefined,
          disbursed_by: admin1.id,
          // disbursed_at diisi hanya jika status completed
          disbursed_at: status === 'completed' ? new Date(Date.now() - 3 * 86_400_000) : null,
        },
      })
    }
  }

  console.log('   ✅ Pencairan dana dibuat.')

  // ============================================
  // 8. REPORTS
  // ============================================
  console.log('📄 Membuat laporan...')

  const completedActivities = activities.filter((a) => a.status === 'completed')

  const fundUsageTemplates = [
    [
      { item: 'Sewa Kapal dan Transportasi Laut', amount: 4_500_000 },
      { item: 'Konsumsi dan Logistik Relawan', amount: 2_000_000 },
      { item: 'Peralatan Selam dan Safety', amount: 3_500_000 },
      { item: 'Dokumentasi dan Publikasi', amount: 1_500_000 },
      { item: 'Bibit Karang dan Media Tanam', amount: 3_500_000 },
    ],
    [
      { item: 'Peralatan Kebersihan (kantong, sarung tangan)', amount: 1_500_000 },
      { item: 'Transportasi Relawan', amount: 2_500_000 },
      { item: 'Konsumsi dan Air Minum', amount: 1_500_000 },
      { item: 'Sewa Truk Pengangkut Sampah', amount: 3_000_000 },
      { item: 'Banner, Spanduk, dan Materi Edukasi', amount: 1_000_000 },
      { item: 'Dokumentasi Kegiatan', amount: 500_000 },
    ],
  ]

  for (const [idx, act] of completedActivities.entries()) {
    const report = await prisma.reports.create({
      data: {
        activity_id: act.id,
        community_id: approvedComm.id,
        submitted_by: owner1.id,
        reviewed_by: admin1.id,
        reviewed_at: new Date(Date.now() - 7 * 86_400_000),
        title: `Laporan Pertanggungjawaban: ${act.title}`,
        summary:
          `Kegiatan "${act.title}" telah berhasil dilaksanakan sesuai rencana. ` +
          `Seluruh target kegiatan tercapai dengan partisipasi aktif dari relawan dan dukungan donatur. ` +
          `Dana yang terkumpul telah digunakan secara transparan untuk operasional kegiatan sebagaimana dirinci di bawah ini.`,
        status: 'validated',
        completion_status: 'completed',
        fund_usage: fundUsageTemplates[idx % fundUsageTemplates.length],
      },
    })

    await prisma.report_files.createMany({
      data: [
        { report_id: report.id, file_url: '/images/reports/completed-1.png', file_name: 'Dokumentasi Kegiatan Utama.png', file_type: 'image' },
        { report_id: report.id, file_url: '/images/reports/completed-2.png', file_name: 'Foto Relawan di Lapangan.png', file_type: 'image' },
        { report_id: report.id, file_url: '/images/reports/completed-3.png', file_name: 'Bukti Kwitansi Pengeluaran.png', file_type: 'image' },
      ],
    })
  }

  // Laporan dengan berbagai status untuk kegiatan aktif (testing admin review)
  const rStatuses: report_status[] = ['draft', 'submitted', 'validated', 'rejected']
  for (const status of rStatuses) {
    await prisma.reports.create({
      data: {
        activity_id: activeAct.id,
        community_id: approvedComm.id,
        submitted_by: owner1.id,
        reviewed_by: status === 'validated' || status === 'rejected' ? admin1.id : null,
        reviewed_at: status === 'validated' || status === 'rejected' ? new Date() : null,
        title: `Laporan Sementara (${status}) — ${activeAct.title}`,
        summary: `Laporan progres kegiatan dengan status ${status}. Data ini digunakan untuk keperluan pengujian alur review laporan oleh admin.`,
        status: status,
        completion_status: 'partial',
        admin_note: status === 'rejected' ? 'Dokumen pendukung belum dilampirkan secara lengkap. Harap unggah kwitansi pengeluaran.' : null,
        fund_usage: status !== 'draft' ? [{ item: 'Operasional Sementara', amount: 500_000 }] : [],
      },
    })
  }

  console.log('   ✅ Laporan dibuat.')

  // ============================================
  // 9. FEEDBACKS
  // ============================================
  console.log('⭐ Membuat ulasan kegiatan...')

  const feedbackData = [
    { user: userApproved1, rating: 5, comment: 'Kegiatan sangat terorganisir, panitia ramah dan profesional. Pengalaman yang luar biasa!' },
    { user: userApproved2, rating: 4, comment: 'Sangat bermanfaat, tapi koordinasi lokasi bisa lebih diperjelas lagi.' },
    { user: userApproved3, rating: 5, comment: 'Bangga bisa ikut berkontribusi. Semoga makin banyak kegiatan serupa.' },
    { user: userApproved4, rating: 3, comment: 'Cukup baik, namun perlu perbaikan di manajemen waktu dan logistik.' },
  ]

  for (const fb of feedbackData) {
    const completedAct = completedActivities[0]
    if (!completedAct) continue
    await prisma.feedbacks.create({
      data: {
        activity_id: completedAct.id,
        user_id: fb.user.id,
        rating: fb.rating,
        comment: fb.comment,
        is_public: true,
      },
    })
  }

  console.log('   ✅ Ulasan dibuat.')

  // ============================================
  // 10. JOURNEY MILESTONES
  // ============================================
  console.log('🏆 Membuat journey milestones...')

  await prisma.journey_milestones.createMany({
    data: [
      {
        year: 2020,
        title: 'SinergiLaut Didirikan',
        description:
          'SinergiLaut lahir dari keresahan akan sulitnya koordinasi antar komunitas konservasi laut di Indonesia. Platform ini hadir sebagai jembatan digital pertama untuk gerakan konservasi kolaboratif.',
        impact_stat: 'Misi dimulai',
        icon: 'Waves',
        order_index: 1,
        is_published: true,
      },
      {
        year: 2021,
        title: 'Komunitas Pertama Bergabung',
        description:
          'Sebanyak 10 komunitas konservasi dari Jawa, Bali, dan Sulawesi bergabung menjadi mitra perdana. Total 500 relawan aktif telah mendaftar dalam tahun pertama.',
        impact_stat: '10 komunitas, 500+ relawan',
        icon: 'Users',
        order_index: 2,
        is_published: true,
      },
      {
        year: 2022,
        title: 'Sistem Donasi & Transparansi',
        description:
          'Meluncurkan sistem donasi terintegrasi dengan verifikasi penggunaan dana secara transparan. Setiap rupiah donasi dapat dilacak penggunaannya oleh publik.',
        impact_stat: 'Rp 1M+ dana terhimpun',
        icon: 'Banknote',
        order_index: 3,
        is_published: true,
      },
      {
        year: 2023,
        title: 'Ekspansi ke 50+ Komunitas',
        description:
          'Jaringan komunitas mitra SinergiLaut berkembang menjadi 50+ komunitas yang tersebar di 15 provinsi, dari Sabang hingga Papua.',
        impact_stat: '50+ komunitas, 15 provinsi',
        icon: 'Globe',
        order_index: 4,
        is_published: true,
      },
      {
        year: 2024,
        title: 'Milestone 10.000 Relawan',
        description:
          'Mencapai tonggak bersejarah: 10.000+ relawan terdaftar dan lebih dari Rp 5 miliar dana konservasi berhasil terhimpun.',
        impact_stat: '10.000+ relawan, Rp 5M+ dana',
        icon: 'Award',
        order_index: 5,
        is_published: true,
      },
      {
        year: 2026,
        title: 'Platform Generasi Baru',
        description:
          'Peluncuran platform generasi baru dengan fitur realtime, dashboard lengkap, integrasi pembayaran, laporan terverifikasi, dan pencairan dana transparan.',
        impact_stat: 'Fitur lengkap & real-time',
        icon: 'Zap',
        order_index: 6,
        is_published: true,
      },
    ],
  })

  console.log('   ✅ Journey milestones dibuat.')

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60))
  console.log('  ✅  SEED SELESAI')
  console.log('═'.repeat(60))
  console.log('  Akun test (password: Password@2026):')
  console.log('  • admin1@sinergilaut.id         → Admin Utama')
  console.log('  • admin2@sinergilaut.id         → Admin Reviewer')
  console.log('  • owner1@example.com            → Community Owner 1')
  console.log('  • owner2@example.com            → Community Owner 2')
  console.log('  • approved1@user.com            → Relawan Aktif (approved)')
  console.log('  • approved2@user.com            → Relawan Aktif (approved)')
  console.log('  • approved3@user.com            → Relawan Aktif (approved)')
  console.log('  • approved4@user.com            → Relawan Aktif (approved)')
  console.log('  • pending1@user.com             → Relawan Pending')
  console.log('  • pending2@user.com             → Relawan Pending')
  console.log('  • rejected1@user.com            → Relawan Ditolak')
  console.log('  • rejected2@user.com            → Relawan Ditolak')
  console.log('═'.repeat(60) + '\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
