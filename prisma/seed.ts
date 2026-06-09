import {
  PrismaClient,
  user_role,
  verification_status,
  activity_status,
  volunteer_status,
  donation_status,
  disbursement_status,
  report_status,
  sanction_type,
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

/** Counter-based unique order ID */
let orderCounter = 1
function nextOrderId(prefix: string): string {
  return `${prefix}-${Date.now()}-${String(orderCounter++).padStart(4, '0')}`
}

/** Shorthand date offset from now */
function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 86_400_000)
}

/** Past date */
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000)
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

  // Admins
  const admin1 = await createAuthUser('admin1@sinergilaut.id', 'Admin Utama', 'admin')
  const admin2 = await createAuthUser('admin2@sinergilaut.id', 'Admin Reviewer', 'admin')

  // Community Owners (3 owners for diversity)
  const owner1 = await createAuthUser('owner1@example.com', 'Budi Bahari', 'community')
  const owner2 = await createAuthUser('owner2@example.com', 'Siti Pesisir', 'community')
  const owner3 = await createAuthUser('owner3@example.com', 'Agus Samudra', 'community')

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
  const userApproved3 = await createAuthUser('approved3@user.com', 'Maya Sari', 'user')
  const userApproved4 = await createAuthUser('approved4@user.com', 'Rizky Aditya', 'user')
  await prisma.profiles.updateMany({
    where: { id: { in: [userApproved1.id, userApproved2.id, userApproved3.id, userApproved4.id] } },
    data: {
      volunteer_status: 'approved',
      phone: '082134000002',
      nik: '3271010303950001',
      date_of_birth: new Date('1995-08-17'),
      gender: 'female',
      address: 'Jl. Merdeka No. 10, Bandung',
      ktp_url: '/uploads/ktp/ktp-approved.jpg',
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
      ktp_url: '/uploads/ktp/ktp-rejected.jpg',
    },
  })

  console.log('   ✅ 13 profil pengguna dibuat (2 admin, 3 community, 4 approved, 2 pending, 2 rejected).')

  // ============================================
  // 3. CREATE COMMUNITIES (7 komunitas)
  // ============================================
  console.log('🌊 Membuat komunitas...')

  const communityData = [
    // [0] Approved — Komunitas utama, banyak kegiatan
    {
      name: 'Yayasan Laut Bersih Nusantara',
      slug: 'yayasan-laut-bersih-nusantara',
      location: 'Denpasar, Bali',
      focus_areas: ['cleanup', 'education'],
      bank: 'BCA',
      owner: owner1,
      status: 'approved' as verification_status,
      is_suspended: false,
      logo: '/images/partner-1.jpg',
    },
    // [1] Approved — Punya completed activity TANPA report
    {
      name: 'Komunitas Karang Hidup Sulawesi',
      slug: 'komunitas-karang-hidup-sulawesi',
      location: 'Makassar, Sulawesi Selatan',
      focus_areas: ['restoration', 'research'],
      bank: 'BRI',
      owner: owner2,
      status: 'approved' as verification_status,
      is_suspended: false,
      logo: '/images/partner-2.jpg',
    },
    // [2] Approved — Punya completed activity, report REJECTED
    {
      name: 'Gerakan Pesisir Hijau Lombok',
      slug: 'gerakan-pesisir-hijau-lombok',
      location: 'Mataram, Nusa Tenggara Barat',
      focus_areas: ['cleanup', 'restoration', 'education'],
      bank: 'Mandiri',
      owner: owner2,
      status: 'approved' as verification_status,
      is_suspended: false,
      logo: '/images/partner-3.jpg',
    },
    // [3] Approved tapi SUSPENDED — punya sanksi aktif
    {
      name: 'Relawan Mangrove Kalimantan',
      slug: 'relawan-mangrove-kalimantan',
      location: 'Balikpapan, Kalimantan Timur',
      focus_areas: ['restoration'],
      bank: 'BNI',
      owner: owner3,
      status: 'approved' as verification_status,
      is_suspended: true,
      logo: '/images/partner-4.jpg',
    },
    // [4] PENDING — Komunitas baru belum diverifikasi
    {
      name: 'Forum Konservasi Laut Maluku',
      slug: 'forum-konservasi-laut-maluku',
      location: 'Ambon, Maluku',
      focus_areas: ['research', 'monitoring'],
      bank: 'BCA',
      owner: owner3,
      status: 'pending' as verification_status,
      is_suspended: false,
      logo: null,
    },
    // [5] REJECTED — Ditolak oleh admin dengan alasan
    {
      name: 'Komunitas Asal Daftar Saja',
      slug: 'komunitas-asal-daftar-saja',
      location: 'Surabaya, Jawa Timur',
      focus_areas: ['cleanup'],
      bank: 'Mandiri',
      owner: owner3,
      status: 'rejected' as verification_status,
      is_suspended: false,
      logo: null,
    },
    // [6] Approved — Verified tapi BELUM pernah buat kegiatan
    {
      name: 'Komunitas Pesisir Papua',
      slug: 'komunitas-pesisir-papua',
      location: 'Jayapura, Papua',
      focus_areas: ['education', 'research'],
      bank: 'BCA',
      owner: owner1,
      status: 'approved' as verification_status,
      is_suspended: false,
      logo: null,
    },
  ]

  const comms: Awaited<ReturnType<typeof prisma.communities.create>>[] = []

  for (let i = 0; i < communityData.length; i++) {
    const cd = communityData[i]
    const comm = await prisma.communities.create({
      data: {
        owner_id: cd.owner.id,
        name: cd.name,
        slug: cd.slug,
        description: `${cd.name} adalah komunitas konservasi laut aktif yang berfokus pada program-program berkelanjutan di wilayah ${cd.location}.`,
        location: cd.location,
        focus_areas: cd.focus_areas,
        verification_status: cd.status,
        is_verified: cd.status === 'approved' && !cd.is_suspended,
        is_suspended: cd.is_suspended,
        logo_url: cd.logo,
        bank_name: cd.bank,
        bank_account_number: `10000000${String(i + 1).padStart(2, '0')}`,
        bank_account_name: cd.name,
      },
    })
    comms.push(comm)

    // Community verification record — enriched
    const isReviewed = cd.status !== 'pending'
    await prisma.community_verifications.create({
      data: {
        community_id: comm.id,
        status: cd.status,
        legal_name: cd.name,
        establishment_year: 2019 + i,
        representative_name: cd.owner.full_name ?? '',
        representative_email: cd.owner.email,
        representative_phone: cd.status === 'pending' ? null : '08123456789',
        reviewed_by: isReviewed ? admin1.id : null,
        reviewed_at: isReviewed ? daysAgo(30 + i * 5) : null,
        admin_note: cd.status === 'rejected'
          ? 'Dokumen legalitas tidak lengkap. Surat Keputusan pendirian yayasan dan NPWP tidak dilampirkan. Silakan lengkapi dokumen dan ajukan kembali.'
          : cd.status === 'approved'
            ? 'Dokumen lengkap dan valid. Komunitas disetujui.'
            : null,
        documents: cd.status === 'pending'
          ? []
          : ['/uploads/documents/sk-pendirian.pdf', '/uploads/documents/npwp.pdf'],
      },
    })
  }

  const [comm1, comm2, comm3, comm4, , , comm7] = comms

  console.log('   ✅ 7 komunitas dibuat (4 approved, 1 pending, 1 rejected, 1 suspended).')

  // ============================================
  // 4. CREATE ACTIVITIES (14 kegiatan, spread across communities)
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

  interface ActivityDef {
    title: string
    slug: string
    description: string
    category: 'cleanup' | 'restoration' | 'education' | 'research' | 'event'
    status: activity_status
    communityIdx: number
    location: string
    daysFromNow: number
    cover: string
    items: typeof itemsNeededCleanup | null
    fundingGoal: number
    fundingRaised: number
    volunteerQuota: number
    volunteerCount: number
    reviewedBy?: string
    adminNote?: string
  }

  const activityDefs: ActivityDef[] = [
    // ── COMM 1 (Yayasan Laut Bersih Nusantara) ─── 10 activities ──
    // [0] Draft
    {
      title: 'Rencana Bersih Pantai Sanur',
      slug: 'rencana-bersih-pantai-sanur',
      description: 'Program pembersihan sampah plastik di sepanjang Pantai Sanur bersama komunitas nelayan lokal.',
      category: 'cleanup',
      status: 'draft',
      communityIdx: 0,
      location: 'Pantai Sanur, Bali',
      daysFromNow: 60,
      cover: '/images/activities/activity-template-1.png',
      items: itemsNeededCleanup,
      fundingGoal: 10_000_000,
      fundingRaised: 0,
      volunteerQuota: 30,
      volunteerCount: 0,
    },
    // [1] Draft (research)
    {
      title: 'Riset Biota Laut Nusa Penida',
      slug: 'riset-biota-laut-nusa-penida',
      description: 'Survei dan pendataan biota laut endemik di kawasan konservasi Nusa Penida.',
      category: 'research',
      status: 'draft',
      communityIdx: 0,
      location: 'Nusa Penida, Bali',
      daysFromNow: 90,
      cover: '/images/activities/activity-template-2.png',
      items: null,
      fundingGoal: 8_000_000,
      fundingRaised: 0,
      volunteerQuota: 10,
      volunteerCount: 0,
    },
    // [2] Pending Review
    {
      title: 'Edukasi Lingkungan Laut untuk Pelajar SD',
      slug: 'edukasi-lingkungan-laut-pelajar-sd',
      description: 'Program edukasi interaktif tentang ekosistem laut dan bahaya sampah plastik untuk 500 pelajar SD di pesisir Bali.',
      category: 'education',
      status: 'pending_review',
      communityIdx: 0,
      location: 'Kuta, Bali',
      daysFromNow: 45,
      cover: '/images/beach-cleanup.jpg',
      items: null,
      fundingGoal: 5_000_000,
      fundingRaised: 0,
      volunteerQuota: 20,
      volunteerCount: 0,
    },
    // [3] Pending Review
    {
      title: 'Pemantauan Terumbu Karang Amed',
      slug: 'pemantauan-terumbu-karang-amed',
      description: 'Ekspedisi monitoring kondisi terumbu karang dan populasi ikan di kawasan Amed menggunakan metode transek sabuk.',
      category: 'research',
      status: 'pending_review',
      communityIdx: 0,
      location: 'Amed, Karangasem, Bali',
      daysFromNow: 50,
      cover: '/images/coral-restoration.jpg',
      items: null,
      fundingGoal: 12_000_000,
      fundingRaised: 0,
      volunteerQuota: 15,
      volunteerCount: 0,
    },
    // [4] Published — utama, banyak donasi + relawan
    {
      title: 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik',
      slug: 'bersih-pantai-kuta-aksi-nyata-lawan-plastik',
      description:
        'Program pembersihan intensif Pantai Kuta dari sampah plastik. Target pengangkatan 3 ton sampah dengan melibatkan 200 relawan. ' +
        'Dipasang pula jaring penangkap sampah di muara kali untuk mencegah sampah baru masuk ke laut.',
      category: 'cleanup',
      status: 'published',
      communityIdx: 0,
      location: 'Pantai Kuta, Badung, Bali',
      daysFromNow: 14,
      cover: '/images/activities/activity-template-1.png',
      items: itemsNeededCleanup,
      fundingGoal: 10_000_000,
      fundingRaised: 6_000_000,
      volunteerQuota: 30,
      volunteerCount: 4,
      reviewedBy: 'admin1',
    },
    // [5] Published — rehabilitasi
    {
      title: 'Rehabilitasi Terumbu Karang Menjangan',
      slug: 'rehabilitasi-terumbu-karang-menjangan',
      description:
        'Program rehabilitasi terumbu karang di kawasan Taman Nasional Bali Barat — Pulau Menjangan. ' +
        'Menargetkan penanaman 1.000 fragmen karang dengan metode coral gardening bersama nelayan lokal.',
      category: 'restoration',
      status: 'published',
      communityIdx: 0,
      location: 'Pulau Menjangan, Buleleng, Bali',
      daysFromNow: 21,
      cover: '/images/coral-restoration.jpg',
      items: itemsNeededRestoration,
      fundingGoal: 15_000_000,
      fundingRaised: 3_000_000,
      volunteerQuota: 25,
      volunteerCount: 2,
      reviewedBy: 'admin1',
    },
    // [6] Cancelled
    {
      title: 'Festival Laut Nusantara 2026',
      slug: 'festival-laut-nusantara-2026',
      description: 'Festival tahunan yang menampilkan pameran seni berbahan daur ulang sampah laut dan pertunjukan budaya pesisir.',
      category: 'event',
      status: 'cancelled',
      communityIdx: 0,
      location: 'GWK Cultural Park, Badung, Bali',
      daysFromNow: -10,
      cover: '/images/activities/activity-template-2.png',
      items: null,
      fundingGoal: 20_000_000,
      fundingRaised: 0,
      volunteerQuota: 50,
      volunteerCount: 0,
      adminNote: 'Kegiatan dibatalkan atas permintaan komunitas karena kendala cuaca.',
    },
    // [7] Cancelled
    {
      title: 'Penanaman Mangrove Pantai Serangan',
      slug: 'penanaman-mangrove-pantai-serangan',
      description: 'Program penanaman 2.000 bibit mangrove di kawasan Pantai Serangan sebagai upaya pemulihan ekosistem pesisir.',
      category: 'restoration',
      status: 'cancelled',
      communityIdx: 0,
      location: 'Pantai Serangan, Denpasar Selatan, Bali',
      daysFromNow: -5,
      cover: '/images/mangrove-planting.jpg',
      items: null,
      fundingGoal: 8_000_000,
      fundingRaised: 0,
      volunteerQuota: 40,
      volunteerCount: 0,
      adminNote: 'Dibatalkan — izin lokasi dari pemerintah daerah belum keluar.',
    },
    // [8] Completed — report VALIDATED, funding > goal (endowment surplus)
    {
      title: 'Ekspedisi Terumbu Karang Raja Ampat',
      slug: 'ekspedisi-terumbu-karang-raja-ampat',
      description: 'Ekspedisi pemantauan dan pemulihan terumbu karang di Raja Ampat. 15 penyelam bersertifikat berhasil mendokumentasikan kondisi reef dan menanam 800 fragmen karang.',
      category: 'restoration',
      status: 'completed',
      communityIdx: 0,
      location: 'Raja Ampat, Papua Barat Daya',
      daysFromNow: -45,
      cover: '/images/coral-restoration.jpg',
      items: null,
      fundingGoal: 15_000_000,
      fundingRaised: 18_000_000, // > goal → surplus masuk endowment
      volunteerQuota: 15,
      volunteerCount: 15,
      reviewedBy: 'admin1',
    },
    // [9] Completed — report SUBMITTED (menunggu review admin)
    {
      title: 'Bersih Pantai Besar Bunaken',
      slug: 'bersih-pantai-besar-bunaken',
      description: 'Aksi bersih pantai massal di kawasan Taman Nasional Bunaken. 80 relawan berhasil mengangkat 4,5 ton sampah plastik dari garis pantai.',
      category: 'cleanup',
      status: 'completed',
      communityIdx: 0,
      location: 'Bunaken, Manado, Sulawesi Utara',
      daysFromNow: -30,
      cover: '/images/activities/activity-template-1.png',
      items: null,
      fundingGoal: 10_000_000,
      fundingRaised: 10_000_000,
      volunteerQuota: 80,
      volunteerCount: 80,
      reviewedBy: 'admin2',
    },

    // ── COMM 2 (Karang Hidup Sulawesi) ─── 2 activities ──
    // [10] ⭐ Completed — TANPA REPORT (key scenario!)
    {
      title: 'Survei Populasi Ikan Karang Wakatobi',
      slug: 'survei-populasi-ikan-karang-wakatobi',
      description: 'Survei komprehensif populasi ikan karang di perairan Wakatobi. Kegiatan selesai namun komunitas belum menyerahkan laporan akhir pertanggungjawaban.',
      category: 'research',
      status: 'completed',
      communityIdx: 1,
      location: 'Wakatobi, Sulawesi Tenggara',
      daysFromNow: -60,
      cover: '/images/activities/activity-template-2.png',
      items: null,
      fundingGoal: 12_000_000,
      fundingRaised: 7_000_000, // < 70% goal → seluruh dana masuk endowment
      volunteerQuota: 10,
      volunteerCount: 10,
      reviewedBy: 'admin1',
    },
    // [11] Published — kegiatan aktif comm 2
    {
      title: 'Transplantasi Karang Takabonerate',
      slug: 'transplantasi-karang-takabonerate',
      description: 'Program transplantasi karang di Taman Nasional Laut Takabonerate, atol terbesar ketiga di dunia.',
      category: 'restoration',
      status: 'published',
      communityIdx: 1,
      location: 'Takabonerate, Sulawesi Selatan',
      daysFromNow: 30,
      cover: '/images/coral-restoration.jpg',
      items: itemsNeededRestoration,
      fundingGoal: 20_000_000,
      fundingRaised: 5_000_000,
      volunteerQuota: 20,
      volunteerCount: 3,
      reviewedBy: 'admin2',
    },

    // ── COMM 3 (Gerakan Pesisir Hijau Lombok) ─── 2 activities ──
    // [12] ⭐ Completed — report REJECTED (perlu revisi!)
    {
      title: 'Aksi Bersih Pantai Senggigi',
      slug: 'aksi-bersih-pantai-senggigi',
      description: 'Aksi bersih pantai massal di Pantai Senggigi dengan partisipasi masyarakat setempat. Laporan ditolak admin karena bukti penggunaan dana tidak lengkap.',
      category: 'cleanup',
      status: 'completed',
      communityIdx: 2,
      location: 'Senggigi, Lombok Barat, NTB',
      daysFromNow: -20,
      cover: '/images/beach-cleanup.jpg',
      items: null,
      fundingGoal: 8_000_000,
      fundingRaised: 8_000_000,
      volunteerQuota: 50,
      volunteerCount: 45,
      reviewedBy: 'admin1',
    },
    // [13] Published — kegiatan aktif comm 3
    {
      title: 'Edukasi Pesisir untuk Anak Lombok',
      slug: 'edukasi-pesisir-untuk-anak-lombok',
      description: 'Program edukasi konservasi laut untuk 300 anak usia sekolah di kawasan pesisir Lombok.',
      category: 'education',
      status: 'published',
      communityIdx: 2,
      location: 'Lombok Timur, NTB',
      daysFromNow: 35,
      cover: '/images/activities/activity-template-1.png',
      items: null,
      fundingGoal: 6_000_000,
      fundingRaised: 1_500_000,
      volunteerQuota: 15,
      volunteerCount: 0,
      reviewedBy: 'admin2',
    },
  ]

  const activities: Awaited<ReturnType<typeof prisma.activities.create>>[] = []

  for (const def of activityDefs) {
    const isCompleted = def.status === 'completed'
    const community = comms[def.communityIdx]
    const reviewerId = def.reviewedBy === 'admin2' ? admin2.id : def.reviewedBy === 'admin1' ? admin1.id : null

    const itemsSeeded = def.items
      ? def.items.map((item) => ({
          ...item,
          donated: isCompleted ? item.target : 0,
        }))
      : null

    const act = await prisma.activities.create({
      data: {
        community_id: community.id,
        title: def.title,
        slug: def.slug,
        description: def.description,
        category: def.category,
        status: def.status,
        start_date: daysFromNow(def.daysFromNow),
        location: def.location,
        volunteer_quota: def.volunteerQuota,
        volunteer_count: def.volunteerCount,
        funding_goal: def.fundingGoal,
        funding_raised: def.fundingRaised,
        allow_item_donation: def.items !== null,
        items_needed: itemsSeeded ?? undefined,
        cover_image_url: def.cover,
        admin_note: def.adminNote ?? null,
        reviewed_by: reviewerId,
        images: isCompleted
          ? ['/images/reports/completed-1.png', '/images/reports/completed-2.png', '/images/reports/completed-3.png']
          : [],
        published_at:
          def.status === 'published' || def.status === 'completed'
            ? daysAgo(7)
            : null,
      },
    })
    activities.push(act)
  }

  // Alias for readability
  const actPublished1 = activities[4]   // Bersih Pantai Kuta (comm1)
  const actPublished2 = activities[5]   // Rehabilitasi Karang Menjangan (comm1)
  const actCompleted1 = activities[8]   // Ekspedisi Raja Ampat (comm1) — report validated
  const actCompleted2 = activities[9]   // Bersih Bunaken (comm1) — report submitted
  const actCompletedNoReport = activities[10]  // ⭐ Survei Wakatobi (comm2) — NO report
  const actPublished3 = activities[11]  // Transplantasi Takabonerate (comm2)
  const actCompletedRejected = activities[12]  // ⭐ Bersih Senggigi (comm3) — report rejected
  const actPublished4 = activities[13]  // Edukasi Lombok (comm3)

  console.log('   ✅ 14 kegiatan dibuat (2 draft, 2 pending_review, 4 published, 2 cancelled, 4 completed).')

  // ============================================
  // 5. VOLUNTEER REGISTRATIONS (25+ registrations)
  // ============================================
  console.log('🙋 Membuat pendaftaran relawan...')

  const approvedVolunteers = [userApproved1, userApproved2, userApproved3, userApproved4]
  const pendingVolunteers = [userPending1, userPending2]
  const rejectedVolunteers = [userRejected1, userRejected2]
  const allVolunteers = [...approvedVolunteers, ...pendingVolunteers, ...rejectedVolunteers]

  // -- Published Activity 1 (Bersih Pantai Kuta): all volunteer statuses
  const volStatuses: volunteer_status[] = ['pending', 'approved', 'rejected', 'attended']
  for (let i = 0; i < allVolunteers.length && i < 8; i++) {
    const u = allVolunteers[i]
    const status = volStatuses[i % volStatuses.length]
    await prisma.volunteer_registrations.create({
      data: {
        activity_id: actPublished1.id,
        user_id: u.id,
        full_name: u.full_name!,
        email: u.email,
        phone: '08123456789',
        reason: 'Ingin berkontribusi untuk kebersihan laut Indonesia.',
        status,
        agreed_to_terms: true,
        skills: i < 4 ? ['diving', 'photography'] : ['swimming'],
        emergency_contact_name: 'Keluarga ' + u.full_name,
        emergency_contact_phone: '08111222333',
        t_shirt_size: ['S', 'M', 'L', 'XL'][i % 4],
      },
    })
  }

  // -- Published Activity 2 (Rehabilitasi Karang): pending registrations
  for (const u of [userApproved1, userApproved2]) {
    await prisma.volunteer_registrations.create({
      data: {
        activity_id: actPublished2.id,
        user_id: u.id,
        full_name: u.full_name!,
        email: u.email,
        phone: '08123456789',
        reason: 'Tertarik dengan program rehabilitasi karang.',
        status: 'pending',
        agreed_to_terms: true,
        skills: ['diving', 'marine_biology'],
        emergency_contact_name: 'Keluarga',
        emergency_contact_phone: '08111222444',
      },
    })
  }

  // -- Published Activity 3 (Transplantasi Takabonerate, comm2): approved + pending
  for (const [i, u] of [userApproved3, userApproved4, userPending1].entries()) {
    await prisma.volunteer_registrations.create({
      data: {
        activity_id: actPublished3.id,
        user_id: u.id,
        full_name: u.full_name!,
        email: u.email,
        phone: '08123456789',
        reason: 'Ingin melihat atol Takabonerate dan bantu transplantasi karang.',
        status: i < 2 ? 'approved' : 'pending',
        agreed_to_terms: true,
        skills: ['diving'],
      },
    })
  }

  // -- Completed Activities: all attended
  for (const completedAct of [actCompleted1, actCompleted2, actCompletedNoReport, actCompletedRejected]) {
    for (const u of [userApproved1, userApproved2]) {
      await prisma.volunteer_registrations.create({
        data: {
          activity_id: completedAct.id,
          user_id: u.id,
          full_name: u.full_name!,
          email: u.email,
          phone: '08123456789',
          reason: 'Senang bisa ikut berkontribusi.',
          status: 'attended',
          agreed_to_terms: true,
          skills: ['diving', 'photography', 'first_aid'],
          emergency_contact_name: 'Keluarga ' + u.full_name,
          emergency_contact_phone: '08111222555',
          t_shirt_size: 'L',
        },
      })
    }
  }

  console.log('   ✅ 21 pendaftaran relawan dibuat (all statuses, enriched fields).')

  // ============================================
  // 6. DONATIONS (15+ donations)
  // ============================================
  console.log('💰 Membuat donasi...')

  const donorNames = ['Budi Santoso', 'Citra Dewi', 'Donatur Anonim', 'Wahyu Hidayat', 'Sari Indah', 'Rudi Hermawan']
  const donorEmails = [
    'budi.santoso@gmail.com', 'citra.dewi@yahoo.com', 'anonymous@sinergilaut.id',
    'wahyu.h@gmail.com', 'sari.indah@gmail.com', 'rudi.h@gmail.com',
  ]

  // -- Published Activity 1 (Bersih Pantai Kuta): all money donation statuses
  const moneyDonations: { status: donation_status; amount: number; isAnon: boolean; userId: string | null; note?: string }[] = [
    { status: 'pending', amount: 500_000, isAnon: false, userId: null },
    { status: 'pending', amount: 250_000, isAnon: true, userId: null },
    { status: 'completed', amount: 3_000_000, isAnon: false, userId: userApproved1.id, note: 'Semangat terus menjaga laut kita!' },
    { status: 'completed', amount: 3_000_000, isAnon: false, userId: userApproved3.id, note: 'Dukung terus aksi nyata!' },
    { status: 'refunded', amount: 250_000, isAnon: false, userId: null },
  ]

  for (const [i, d] of moneyDonations.entries()) {
    await prisma.donations.create({
      data: {
        activity_id: actPublished1.id,
        user_id: d.userId,
        donor_name: d.isAnon ? 'Anonim' : donorNames[i % donorNames.length],
        donor_email: donorEmails[i % donorEmails.length],
        type: 'money',
        amount: d.amount,
        status: d.status,
        is_anonymous: d.isAnon,
        note: d.note,
        midtrans_order_id: nextOrderId(`SL-${d.status.toUpperCase()}`),
        midtrans_payment_type: d.status === 'completed' ? 'bank_transfer' : null,
        midtrans_va_number: d.status === 'completed' ? `888801000${i + 1}` : null,
      },
    })
  }

  // -- Item donation for Published Activity 1
  const itemDonation = await prisma.donations.create({
    data: {
      activity_id: actPublished1.id,
      user_id: userApproved2.id,
      donor_name: userApproved2.full_name!,
      donor_email: userApproved2.email,
      type: 'item',
      amount: 132_000, // 10 × 12.000 × 1.1
      status: 'completed',
      midtrans_order_id: nextOrderId('SL-ITEM'),
    },
  })
  await prisma.donation_items.createMany({
    data: [
      {
        donation_id: itemDonation.id,
        item_name: 'Sarung Tangan Karet',
        quantity: 10,
        item_condition: 'new',
        description: 'Sarung tangan karet heavy duty untuk pembersihan pantai.',
        tracking_number: 'JNE1234567890',
        courier: 'JNE',
      },
      {
        donation_id: itemDonation.id,
        item_name: 'Kantong Sampah Besar (50L)',
        quantity: 20,
        item_condition: 'new',
        description: 'Kantong sampah 50L warna hitam.',
        tracking_number: 'JNE1234567891',
        courier: 'JNE',
      },
    ],
  })

  // -- Donations for Published Activity 3 (Transplantasi Takabonerate, comm2)
  for (const [i, amount] of [2_000_000, 3_000_000].entries()) {
    await prisma.donations.create({
      data: {
        activity_id: actPublished3.id,
        user_id: i === 0 ? userApproved4.id : null,
        donor_name: donorNames[i + 3],
        donor_email: donorEmails[i + 3],
        type: 'money',
        amount,
        status: 'completed',
        note: 'Untuk pelestarian karang Takabonerate.',
        midtrans_order_id: nextOrderId('SL-COMM2'),
        midtrans_payment_type: 'bank_transfer',
        midtrans_va_number: `888802000${i + 1}`,
      },
    })
  }

  // -- Donations for Completed Activities (historical)
  // Completed 1 (Raja Ampat) — 18jt raised (> 15jt goal → endowment surplus!)
  for (const [i, amount] of [8_000_000, 5_000_000, 5_000_000].entries()) {
    await prisma.donations.create({
      data: {
        activity_id: actCompleted1.id,
        user_id: i === 0 ? userApproved1.id : null,
        donor_name: donorNames[i],
        donor_email: donorEmails[i],
        type: 'money',
        amount,
        status: 'completed',
        midtrans_order_id: nextOrderId('SL-HIST1'),
        midtrans_payment_type: 'bank_transfer',
      },
    })
  }

  // Completed No Report (Wakatobi) — 7jt raised (< 70% of 12jt → endowment scenario)
  for (const [i, amount] of [4_000_000, 3_000_000].entries()) {
    await prisma.donations.create({
      data: {
        activity_id: actCompletedNoReport.id,
        user_id: null,
        donor_name: donorNames[i + 2],
        donor_email: donorEmails[i + 2],
        type: 'money',
        amount,
        status: 'completed',
        midtrans_order_id: nextOrderId('SL-HIST2'),
        midtrans_payment_type: 'qris',
      },
    })
  }

  // Completed Rejected Report (Senggigi) — 8jt raised = goal
  for (const [i, amount] of [5_000_000, 3_000_000].entries()) {
    await prisma.donations.create({
      data: {
        activity_id: actCompletedRejected.id,
        user_id: i === 0 ? userApproved2.id : null,
        donor_name: donorNames[i + 4],
        donor_email: donorEmails[i + 4],
        type: 'money',
        amount,
        status: 'completed',
        midtrans_order_id: nextOrderId('SL-HIST3'),
        midtrans_payment_type: 'bank_transfer',
      },
    })
  }

  console.log('   ✅ 16 donasi dibuat (money/item, all statuses, endowment scenarios).')

  // ============================================
  // 7. DISBURSEMENTS (12+ pencairan)
  // ============================================
  console.log('💸 Membuat pencairan dana...')

  interface DisbDef {
    activityId: string
    communityId: string
    community: typeof comm1
    amount: number
    fee: number
    status: disbursement_status
    notes?: string
    refNum?: string
    disbursedAt?: Date
  }

  const disbDefs: DisbDef[] = [
    // -- Comm 1 Published Activity 1 (Bersih Pantai Kuta)
    { activityId: actPublished1.id, communityId: comm1.id, community: comm1, amount: 2_000_000, fee: 200_000, status: 'pending', notes: 'Pencairan tahap 1 untuk persiapan logistik.' },
    { activityId: actPublished1.id, communityId: comm1.id, community: comm1, amount: 2_000_000, fee: 200_000, status: 'processing', notes: 'Pencairan tahap 2 sedang diproses.' },
    { activityId: actPublished1.id, communityId: comm1.id, community: comm1, amount: 2_000_000, fee: 200_000, status: 'completed', notes: 'Pencairan operasional kegiatan.', refNum: 'TRX-BCA-001', disbursedAt: daysAgo(3) },
    { activityId: actPublished1.id, communityId: comm1.id, community: comm1, amount: 1_500_000, fee: 150_000, status: 'failed', notes: 'Gagal — nomor rekening tidak aktif, harap perbarui data bank.' },

    // -- Comm 1 Completed Activity 1 (Raja Ampat)
    { activityId: actCompleted1.id, communityId: comm1.id, community: comm1, amount: 7_000_000, fee: 700_000, status: 'completed', notes: 'Pencairan dana kegiatan Raja Ampat.', refNum: 'TRX-BCA-002', disbursedAt: daysAgo(40) },
    { activityId: actCompleted1.id, communityId: comm1.id, community: comm1, amount: 5_000_000, fee: 500_000, status: 'completed', notes: 'Pencairan tahap 2 Raja Ampat.', refNum: 'TRX-BCA-003', disbursedAt: daysAgo(35) },

    // -- Comm 2 Published Activity (Transplantasi Takabonerate)
    { activityId: actPublished3.id, communityId: comm2.id, community: comm2, amount: 3_000_000, fee: 300_000, status: 'completed', notes: 'Dana transplantasi karang tahap 1.', refNum: 'TRX-BRI-001', disbursedAt: daysAgo(10) },
    { activityId: actPublished3.id, communityId: comm2.id, community: comm2, amount: 2_000_000, fee: 200_000, status: 'pending', notes: 'Pencairan tahap 2 menunggu persetujuan.' },

    // -- Comm 2 Completed No Report (Wakatobi) — sudah cair tapi BELUM laporan!
    { activityId: actCompletedNoReport.id, communityId: comm2.id, community: comm2, amount: 5_000_000, fee: 500_000, status: 'completed', notes: 'Pencairan dana survei Wakatobi.', refNum: 'TRX-BRI-002', disbursedAt: daysAgo(55) },

    // -- Comm 3 Completed Rejected (Senggigi)
    { activityId: actCompletedRejected.id, communityId: comm3.id, community: comm3, amount: 4_000_000, fee: 400_000, status: 'completed', notes: 'Pencairan dana bersih pantai Senggigi.', refNum: 'TRX-MDR-001', disbursedAt: daysAgo(18) },
    { activityId: actCompletedRejected.id, communityId: comm3.id, community: comm3, amount: 3_000_000, fee: 300_000, status: 'processing', notes: 'Pencairan sisa dana menunggu validasi laporan.' },

    // -- Comm 3 Published (Edukasi Lombok)
    { activityId: actPublished4.id, communityId: comm3.id, community: comm3, amount: 1_000_000, fee: 100_000, status: 'pending', notes: 'Pencairan awal untuk persiapan materi edukasi.' },
  ]

  for (const d of disbDefs) {
    await prisma.disbursements.create({
      data: {
        activity_id: d.activityId,
        community_id: d.communityId,
        amount: d.amount,
        platform_fee: d.fee,
        status: d.status,
        bank_name: communityData.find((cd) => cd.name === d.community.name)?.bank ?? 'BCA',
        account_number: d.community.bank_account_number!,
        account_name: d.community.name,
        notes: d.notes,
        reference_number: d.refNum ?? null,
        disbursed_by: admin1.id,
        disbursed_at: d.disbursedAt ?? null,
      },
    })
  }

  console.log('   ✅ 12 pencairan dana dibuat (all statuses, spread across communities).')

  // ============================================
  // 8. REPORTS (8 laporan)
  // ============================================
  console.log('📄 Membuat laporan...')

  const fundUsageRajaAmpat = [
    { item: 'Sewa Kapal dan Transportasi Laut', amount: 4_500_000 },
    { item: 'Konsumsi dan Logistik Relawan', amount: 2_000_000 },
    { item: 'Peralatan Selam dan Safety', amount: 3_500_000 },
    { item: 'Dokumentasi dan Publikasi', amount: 1_500_000 },
    { item: 'Bibit Karang dan Media Tanam', amount: 3_500_000 },
  ]

  const fundUsageBunaken = [
    { item: 'Peralatan Kebersihan (kantong, sarung tangan)', amount: 1_500_000 },
    { item: 'Transportasi Relawan', amount: 2_500_000 },
    { item: 'Konsumsi dan Air Minum', amount: 1_500_000 },
    { item: 'Sewa Truk Pengangkut Sampah', amount: 3_000_000 },
    { item: 'Banner, Spanduk, dan Materi Edukasi', amount: 1_000_000 },
    { item: 'Dokumentasi Kegiatan', amount: 500_000 },
  ]

  const fundUsageSenggigi = [
    { item: 'Peralatan Pembersihan', amount: 2_000_000 },
    { item: 'Konsumsi Relawan', amount: 1_500_000 },
    { item: 'Transportasi', amount: 1_500_000 },
  ]

  // Report 1: Completed Raja Ampat — VALIDATED
  const report1 = await prisma.reports.create({
    data: {
      activity_id: actCompleted1.id,
      community_id: comm1.id,
      submitted_by: owner1.id,
      reviewed_by: admin1.id,
      reviewed_at: daysAgo(7),
      title: `Laporan Pertanggungjawaban: ${actCompleted1.title}`,
      summary:
        `Kegiatan "${actCompleted1.title}" telah berhasil dilaksanakan sesuai rencana. ` +
        `Seluruh target kegiatan tercapai dengan partisipasi aktif dari relawan dan dukungan donatur. ` +
        `Dana yang terkumpul telah digunakan secara transparan untuk operasional kegiatan.`,
      status: 'validated',
      completion_status: 'completed',
      fund_usage: fundUsageRajaAmpat,
    },
  })

  await prisma.report_files.createMany({
    data: [
      { report_id: report1.id, file_url: '/images/reports/completed-1.png', file_name: 'Dokumentasi Kegiatan Utama.png', file_type: 'image', file_size: 2_500_000 },
      { report_id: report1.id, file_url: '/images/reports/completed-2.png', file_name: 'Foto Relawan di Lapangan.png', file_type: 'image', file_size: 1_800_000 },
      { report_id: report1.id, file_url: '/images/reports/completed-3.png', file_name: 'Bukti Kwitansi Pengeluaran.png', file_type: 'image', file_size: 950_000 },
    ],
  })

  // Report 2: Completed Bunaken — SUBMITTED (menunggu review admin)
  const report2 = await prisma.reports.create({
    data: {
      activity_id: actCompleted2.id,
      community_id: comm1.id,
      submitted_by: owner1.id,
      title: `Laporan Pertanggungjawaban: ${actCompleted2.title}`,
      summary:
        `Kegiatan "${actCompleted2.title}" telah dilaksanakan dengan baik. ` +
        `80 relawan berpartisipasi aktif dan berhasil mengangkat 4,5 ton sampah. Laporan ini menunggu validasi admin.`,
      status: 'submitted',
      completion_status: 'completed',
      fund_usage: fundUsageBunaken,
    },
  })

  await prisma.report_files.createMany({
    data: [
      { report_id: report2.id, file_url: '/images/reports/completed-1.png', file_name: 'Foto Kegiatan Bunaken.png', file_type: 'image', file_size: 2_100_000 },
      { report_id: report2.id, file_url: '/uploads/reports/laporan-bunaken.pdf', file_name: 'Laporan Lengkap Bunaken.pdf', file_type: 'document', file_size: 5_400_000 },
    ],
  })

  // Report 3: ⭐ Completed Wakatobi (comm2) — NO REPORT AT ALL
  // Intentionally NOT creating any report for actCompletedNoReport
  console.log('   ⭐ Skenario: Kegiatan Survei Wakatobi (comm2) SELESAI tapi TANPA laporan akhir.')

  // Report 4: ⭐ Completed Senggigi (comm3) — REJECTED (perlu revisi!)
  await prisma.reports.create({
    data: {
      activity_id: actCompletedRejected.id,
      community_id: comm3.id,
      submitted_by: owner2.id,
      reviewed_by: admin1.id,
      reviewed_at: daysAgo(5),
      title: `Laporan Pertanggungjawaban: ${actCompletedRejected.title}`,
      summary:
        `Kegiatan "${actCompletedRejected.title}" sudah selesai dilaksanakan. ` +
        `45 relawan berpartisipasi dalam aksi bersih pantai. Namun laporan ini masih perlu dilengkapi.`,
      status: 'rejected',
      completion_status: 'partial',
      admin_note: 'Dokumen pendukung tidak lengkap. Kwitansi pengeluaran untuk item "Transportasi" dan "Sewa Alat" tidak dilampirkan. Harap lengkapi dan kirim ulang.',
      fund_usage: fundUsageSenggigi,
    },
  })

  // Report 5-8: Various statuses for published activities (testing admin review flow)
  const reportStatusDefs: { status: report_status; actId: string; commId: string; submitter: string; title: string }[] = [
    { status: 'draft', actId: actPublished1.id, commId: comm1.id, submitter: owner1.id, title: actPublished1.title },
    { status: 'submitted', actId: actPublished1.id, commId: comm1.id, submitter: owner1.id, title: actPublished1.title },
    { status: 'validated', actId: actPublished1.id, commId: comm1.id, submitter: owner1.id, title: actPublished1.title },
    { status: 'draft', actId: actPublished4.id, commId: comm3.id, submitter: owner2.id, title: actPublished4.title },
  ]

  for (const rd of reportStatusDefs) {
    const isReviewed = rd.status === 'validated' || rd.status === 'rejected'
    await prisma.reports.create({
      data: {
        activity_id: rd.actId,
        community_id: rd.commId,
        submitted_by: rd.submitter,
        reviewed_by: isReviewed ? admin1.id : null,
        reviewed_at: isReviewed ? new Date() : null,
        title: `Laporan Progres (${rd.status}) — ${rd.title}`,
        summary: `Laporan progres kegiatan dengan status ${rd.status}. Data ini digunakan untuk keperluan pengujian alur review laporan oleh admin.`,
        status: rd.status,
        completion_status: 'partial',
        admin_note: rd.status === 'rejected' ? 'Dokumen pendukung belum dilampirkan secara lengkap.' : null,
        fund_usage: rd.status !== 'draft' ? [{ item: 'Operasional Sementara', amount: 500_000 }] : [],
      },
    })
  }

  console.log('   ✅ 8 laporan dibuat (draft/submitted/validated/rejected + skenario tanpa laporan).')

  // ============================================
  // 9. SANCTIONS (4 sanksi)
  // ============================================
  console.log('⚖️ Membuat sanksi...')

  await prisma.sanctions.createMany({
    data: [
      // Comm 4 (suspended) — warning lama, sudah expired
      {
        community_id: comm4.id,
        issued_by: admin1.id,
        type: 'warning' as sanction_type,
        reason: 'Laporan pertanggungjawaban kegiatan "Penanaman Mangrove" terlambat lebih dari 30 hari.',
        notes: 'Peringatan pertama. Harap segera submit laporan.',
        is_active: false,
        expires_at: daysAgo(10),
      },
      // Comm 4 (suspended) — suspend AKTIF (alasan di-suspend)
      {
        community_id: comm4.id,
        issued_by: admin1.id,
        type: 'suspend' as sanction_type,
        reason: 'Tidak ada respons terhadap peringatan sebelumnya. Laporan masih belum diserahkan setelah 60 hari dari batas waktu.',
        notes: 'Akun komunitas di-suspend hingga laporan pertanggungjawaban diserahkan dan divalidasi.',
        is_active: true,
        expires_at: null,
      },
      // Comm 2 — warning aktif tapi belum sampai suspend
      {
        community_id: comm2.id,
        issued_by: admin2.id,
        type: 'warning' as sanction_type,
        reason: 'Kegiatan "Survei Populasi Ikan Karang Wakatobi" telah selesai lebih dari 30 hari tetapi laporan akhir belum disubmit.',
        notes: 'Harap segera serahkan laporan pertanggungjawaban kegiatan.',
        is_active: true,
        expires_at: daysFromNow(30),
      },
      // Comm 3 — warning sudah expired
      {
        community_id: comm3.id,
        issued_by: admin1.id,
        type: 'warning' as sanction_type,
        reason: 'Keterlambatan penyerahan laporan kegiatan sebelumnya.',
        notes: 'Warning telah expired setelah laporan diserahkan.',
        is_active: false,
        expires_at: daysAgo(15),
      },
    ],
  })

  console.log('   ✅ 4 sanksi dibuat (warning active/expired, suspend active).')

  // ============================================
  // 10. FEEDBACKS (8 ulasan)
  // ============================================
  console.log('⭐ Membuat ulasan kegiatan...')

  const feedbackDefs = [
    // Completed 1 (Raja Ampat) — 4 feedbacks
    { actId: actCompleted1.id, userId: userApproved1.id, rating: 5, comment: 'Kegiatan luar biasa! Sangat terorganisir dan profesional. Pengalaman menyelam yang tidak terlupakan.', isPublic: true },
    { actId: actCompleted1.id, userId: userApproved2.id, rating: 4, comment: 'Sangat bermanfaat. Koordinasi lokasi dan akomodasi bisa lebih diperjelas lagi untuk peserta dari luar daerah.', isPublic: true },
    // Completed 2 (Bunaken) — 2 feedbacks
    { actId: actCompleted2.id, userId: userApproved1.id, rating: 5, comment: 'Bangga bisa ikut berkontribusi membersihkan pantai Bunaken. Semoga makin banyak kegiatan serupa!', isPublic: true },
    { actId: actCompleted2.id, userId: userApproved2.id, rating: 3, comment: 'Cukup baik, namun perlu perbaikan di manajemen waktu. Kegiatan dimulai 1 jam terlambat.', isPublic: true },
    // Completed No Report (Wakatobi) — 1 feedback
    { actId: actCompletedNoReport.id, userId: userApproved1.id, rating: 4, comment: 'Survei berjalan lancar. Sayang datanya belum dipublikasikan ke laporan akhir.', isPublic: true },
    // Completed Rejected (Senggigi) — 2 feedbacks
    { actId: actCompletedRejected.id, userId: userApproved1.id, rating: 2, comment: 'Kegiatan cukup oke, tapi koordinasi panitia kurang. Logistik terlambat datang.', isPublic: true },
    { actId: actCompletedRejected.id, userId: userApproved2.id, rating: 1, comment: 'Kurang memuaskan. Peralatan tidak memadai dan briefing terlalu singkat.', isPublic: false },
    // Extra private feedback
    { actId: actCompleted1.id, userId: userApproved3.id, rating: 4, comment: 'Bagus, tapi agak capek karena jadwal terlalu padat.', isPublic: false },
  ]

  for (const fb of feedbackDefs) {
    await prisma.feedbacks.create({
      data: {
        activity_id: fb.actId,
        user_id: fb.userId,
        rating: fb.rating,
        comment: fb.comment,
        is_public: fb.isPublic,
      },
    })
  }

  console.log('   ✅ 8 ulasan dibuat (rating 1-5, public/private).')

  // ============================================
  // 11. NOTIFICATIONS (18 notifikasi)
  // ============================================
  console.log('🔔 Membuat notifikasi...')

  const notifDefs = [
    // Community verification notifications
    { userId: owner1.id, title: 'Komunitas Diverifikasi', message: 'Selamat! Komunitas "Yayasan Laut Bersih Nusantara" telah diverifikasi dan disetujui oleh admin.', type: 'success', link: '/community/dashboard', isRead: true },
    { userId: owner2.id, title: 'Komunitas Diverifikasi', message: 'Selamat! Komunitas "Komunitas Karang Hidup Sulawesi" telah diverifikasi dan disetujui oleh admin.', type: 'success', link: '/community/dashboard', isRead: true },
    { userId: owner3.id, title: 'Komunitas Ditolak', message: 'Maaf, pengajuan komunitas "Komunitas Asal Daftar Saja" ditolak. Alasan: Dokumen legalitas tidak lengkap.', type: 'error', link: '/community/dashboard', isRead: true },
    { userId: owner3.id, title: 'Komunitas Di-Suspend', message: 'Komunitas "Relawan Mangrove Kalimantan" telah di-suspend karena pelanggaran ketentuan pelaporan.', type: 'error', link: '/community/dashboard', isRead: true },

    // Activity notifications
    { userId: owner1.id, title: 'Kegiatan Disetujui', message: `Kegiatan "${actPublished1.title}" telah disetujui dan dipublikasikan.`, type: 'success', link: `/community/dashboard/activities/${actPublished1.id}`, isRead: true },
    { userId: owner1.id, title: 'Kegiatan Dibatalkan', message: `Kegiatan "Festival Laut Nusantara 2026" telah dibatalkan.`, type: 'warning', link: '/community/dashboard/activities', isRead: true },

    // Disbursement notifications
    { userId: owner1.id, title: 'Dana Dicairkan', message: 'Pencairan dana sebesar Rp 2.000.000 untuk kegiatan "Bersih Pantai Kuta" telah berhasil.', type: 'success', link: '/community/dashboard/disbursements', isRead: true },
    { userId: owner1.id, title: 'Pencairan Dana Gagal', message: 'Pencairan dana sebesar Rp 1.500.000 gagal diproses. Silakan perbarui data rekening bank Anda.', type: 'error', link: '/community/dashboard/disbursements', isRead: false },

    // Report notifications
    { userId: owner1.id, title: 'Laporan Divalidasi', message: `Laporan pertanggungjawaban kegiatan "${actCompleted1.title}" telah divalidasi oleh admin.`, type: 'success', link: '/community/dashboard', isRead: true },
    { userId: owner2.id, title: 'Laporan Ditolak', message: `Laporan kegiatan "${actCompletedRejected.title}" ditolak. Harap lengkapi dokumen dan kirim ulang.`, type: 'error', link: '/community/dashboard', isRead: false },

    // Volunteer notifications
    { userId: userApproved1.id, title: 'Pendaftaran Diterima', message: `Pendaftaran Anda sebagai relawan kegiatan "${actPublished1.title}" telah diterima.`, type: 'success', link: '/user/dashboard', isRead: true },
    { userId: userApproved2.id, title: 'Pendaftaran Diterima', message: `Pendaftaran Anda sebagai relawan kegiatan "${actPublished1.title}" telah diterima.`, type: 'success', link: '/user/dashboard', isRead: false },
    { userId: userPending1.id, title: 'Pendaftaran Menunggu', message: `Pendaftaran relawan Anda untuk kegiatan "${actPublished1.title}" sedang diproses.`, type: 'info', link: '/user/dashboard', isRead: false },

    // Admin notifications
    { userId: admin1.id, title: 'Laporan Baru Masuk', message: `Laporan baru untuk kegiatan "${actCompleted2.title}" telah disubmit dan menunggu review.`, type: 'info', link: '/admin/reports', isRead: false },
    { userId: admin1.id, title: 'Kegiatan Baru Perlu Review', message: 'Ada 2 kegiatan baru yang menunggu persetujuan admin.', type: 'info', link: '/admin/activities', isRead: false },
    { userId: admin1.id, title: 'Peringatan Laporan Terlambat', message: 'Komunitas "Komunitas Karang Hidup Sulawesi" belum menyerahkan laporan kegiatan yang sudah selesai 60 hari lalu.', type: 'warning', link: '/admin/reports', isRead: false },

    // Sanction notification
    { userId: owner2.id, title: 'Peringatan Diberikan', message: 'Komunitas Anda mendapat peringatan: Kegiatan "Survei Wakatobi" belum memiliki laporan akhir.', type: 'warning', link: '/community/dashboard', isRead: false },

    // General
    { userId: owner1.id, title: 'Selamat Datang di SinergiLaut', message: 'Terima kasih telah bergabung! Mulai buat kegiatan konservasi pertama Anda.', type: 'info', link: '/community/dashboard', isRead: true },
  ]

  for (const n of notifDefs) {
    await prisma.notifications.create({
      data: {
        user_id: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
        is_read: n.isRead,
      },
    })
  }

  console.log('   ✅ 18 notifikasi dibuat (info/success/warning/error, read/unread).')

  // ============================================
  // 12. AUDIT LOGS (12 log)
  // ============================================
  console.log('📝 Membuat audit logs...')

  const auditDefs = [
    { userId: admin1.id, action: 'community.verify', resourceType: 'communities', resourceId: comm1.id, metadata: { community_name: comm1.name, status: 'approved' }, daysAgo: 30 },
    { userId: admin1.id, action: 'community.verify', resourceType: 'communities', resourceId: comm2.id, metadata: { community_name: comm2.name, status: 'approved' }, daysAgo: 28 },
    { userId: admin1.id, action: 'community.reject', resourceType: 'communities', resourceId: comms[5].id, metadata: { community_name: comms[5].name, reason: 'Dokumen legalitas tidak lengkap' }, daysAgo: 25 },
    { userId: admin1.id, action: 'community.suspend', resourceType: 'communities', resourceId: comm4.id, metadata: { community_name: comm4.name, sanction_type: 'suspend' }, daysAgo: 5 },
    { userId: admin1.id, action: 'activity.approve', resourceType: 'activities', resourceId: actPublished1.id, metadata: { activity_title: actPublished1.title }, daysAgo: 14 },
    { userId: admin2.id, action: 'activity.approve', resourceType: 'activities', resourceId: actPublished3.id, metadata: { activity_title: actPublished3.title }, daysAgo: 10 },
    { userId: admin1.id, action: 'activity.cancel', resourceType: 'activities', resourceId: activities[6].id, metadata: { activity_title: activities[6].title, reason: 'Kendala cuaca' }, daysAgo: 10 },
    { userId: admin1.id, action: 'disbursement.complete', resourceType: 'disbursements', resourceId: null, metadata: { community: comm1.name, amount: 2_000_000 }, daysAgo: 3 },
    { userId: admin1.id, action: 'report.validate', resourceType: 'reports', resourceId: report1.id, metadata: { activity_title: actCompleted1.title }, daysAgo: 7 },
    { userId: admin1.id, action: 'report.reject', resourceType: 'reports', resourceId: null, metadata: { activity_title: actCompletedRejected.title, reason: 'Dokumen tidak lengkap' }, daysAgo: 5 },
    { userId: admin1.id, action: 'sanction.issue', resourceType: 'sanctions', resourceId: null, metadata: { community: comm4.name, type: 'suspend' }, daysAgo: 5 },
    { userId: admin2.id, action: 'volunteer.verify', resourceType: 'profiles', resourceId: userApproved1.id, metadata: { user_name: userApproved1.full_name }, daysAgo: 20 },
  ]

  for (const a of auditDefs) {
    await prisma.audit_logs.create({
      data: {
        user_id: a.userId,
        action: a.action,
        resource_type: a.resourceType,
        resource_id: a.resourceId,
        metadata: a.metadata,
        ip_address: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
        created_at: daysAgo(a.daysAgo),
      },
    })
  }

  console.log('   ✅ 12 audit logs dibuat (verify/reject/suspend/approve/cancel/disburse/validate/sanction).')

  // ============================================
  // 13. JOURNEY MILESTONES (7 milestones)
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
      // Unpublished milestone — for testing filter
      {
        year: 2027,
        title: 'Rencana Ekspansi Internasional',
        description:
          'Rencana perluasan jaringan ke negara-negara ASEAN maritim: Filipina, Malaysia, dan Thailand. Milestone ini belum dipublikasikan.',
        impact_stat: 'Coming soon',
        icon: 'Rocket',
        order_index: 7,
        is_published: false,
      },
    ],
  })

  console.log('   ✅ 7 journey milestones dibuat (6 published, 1 unpublished).')

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60))
  console.log('  ✅  SEED SELESAI — COMPREHENSIVE COVERAGE')
  console.log('═'.repeat(60))
  console.log('')
  console.log('  📊 Data Summary:')
  console.log('  ├─ 13 Profiles (2 admin, 3 community, 4 approved, 2 pending, 2 rejected)')
  console.log('  ├─ 7  Communities (4 approved, 1 pending, 1 rejected, 1 suspended)')
  console.log('  ├─ 7  Community Verifications (enriched with reviewer & docs)')
  console.log('  ├─ 14 Activities (2 draft, 2 pending_review, 4 published, 2 cancelled, 4 completed)')
  console.log('  ├─ 21 Volunteer Registrations (all statuses + enriched fields)')
  console.log('  ├─ 16 Donations (money/item, all statuses, anonymous, endowment)')
  console.log('  ├─ 12 Disbursements (all statuses, spread across communities)')
  console.log('  ├─ 8  Reports (draft/submitted/validated/rejected + no-report scenario)')
  console.log('  ├─ 5  Report Files')
  console.log('  ├─ 4  Sanctions (warning/suspend, active/expired)')
  console.log('  ├─ 8  Feedbacks (rating 1-5, public/private)')
  console.log('  ├─ 18 Notifications (info/success/warning/error, read/unread)')
  console.log('  ├─ 12 Audit Logs (verify/reject/approve/cancel/disburse/validate/sanction)')
  console.log('  └─ 7  Journey Milestones (6 published, 1 unpublished)')
  console.log('')
  console.log('  ⭐ Key Scenarios:')
  console.log('  ├─ Completed activity TANPA laporan (Survei Wakatobi)')
  console.log('  ├─ Completed activity + laporan DITOLAK (Bersih Senggigi)')
  console.log('  ├─ Komunitas SUSPENDED + sanksi aktif (Relawan Mangrove Kalimantan)')
  console.log('  ├─ Komunitas verified TANPA kegiatan (Komunitas Pesisir Papua)')
  console.log('  ├─ Funding > goal → endowment surplus (Raja Ampat: 18jt/15jt)')
  console.log('  └─ Funding < 70% goal → endowment (Wakatobi: 7jt/12jt)')
  console.log('')
  console.log('  Akun test (password: Password@2026):')
  console.log('  ├─ admin1@sinergilaut.id         → Admin Utama')
  console.log('  ├─ admin2@sinergilaut.id         → Admin Reviewer')
  console.log('  ├─ owner1@example.com            → Community Owner 1 (Comm 1, 7)')
  console.log('  ├─ owner2@example.com            → Community Owner 2 (Comm 2, 3)')
  console.log('  ├─ owner3@example.com            → Community Owner 3 (Comm 4, 5, 6)')
  console.log('  ├─ approved[1-4]@user.com        → Relawan Aktif (approved)')
  console.log('  ├─ pending[1-2]@user.com         → Relawan Pending')
  console.log('  └─ rejected[1-2]@user.com        → Relawan Ditolak')
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
