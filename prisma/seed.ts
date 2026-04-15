import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

// Supabase Admin client (untuk membuat user Auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  console.log('🌱 Memulai seed database SinergiLaut...\n')

  // ============================================
  // 1. Buat Admin User
  // ============================================
  console.log('👤 Membuat admin user...')

  const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
    email: 'admin@sinergilaut.id',
    password: 'Admin@SinergiLaut2026',
    email_confirm: true,
    user_metadata: {
      full_name: 'Admin SinergiLaut',
      role: 'admin',
    },
  })

  if (adminAuthError && !adminAuthError.message.includes('already registered')) {
    throw new Error(`Gagal membuat admin: ${adminAuthError.message}`)
  }

  if (adminAuth?.user) {
    // Update role ke admin di tabel profiles
    await prisma.profiles.upsert({
      where: { id: adminAuth.user.id },
      update: { role: 'admin' },
      create: {
        id: adminAuth.user.id,
        email: 'admin@sinergilaut.id',
        full_name: 'Admin SinergiLaut',
        role: 'admin',
        is_active: true,
      },
    })
    console.log('   ✅ Admin user dibuat: admin@sinergilaut.id')
  } else {
    console.log('   ℹ️  Admin user sudah ada, skip.')
  }

  // ============================================
  // 2. Buat Demo Community User
  // ============================================
  console.log('👥 Membuat demo community user...')

  const { data: commAuth, error: commAuthError } = await supabase.auth.admin.createUser({
    email: 'komunitas@example.com',
    password: 'Komunitas@2026',
    email_confirm: true,
    user_metadata: {
      full_name: 'Demo Komunitas',
      role: 'community',
    },
  })

  if (commAuthError && !commAuthError.message.includes('already registered')) {
    console.warn(`   ⚠️  Gagal membuat community user: ${commAuthError.message}`)
  }

  if (commAuth?.user) {
    await prisma.profiles.upsert({
      where: { id: commAuth.user.id },
      update: { role: 'community' },
      create: {
        id: commAuth.user.id,
        email: 'komunitas@example.com',
        full_name: 'Demo Komunitas',
        role: 'community',
        is_active: true,
      },
    })

    // ============================================
    // 3. Buat Demo Community
    // ============================================
    console.log('🌊 Membuat demo komunitas...')

    const community = await prisma.communities.upsert({
      where: { slug: 'bahari-nusantara' },
      update: {},
      create: {
        owner_id: commAuth.user.id,
        name: 'Bahari Nusantara',
        slug: 'bahari-nusantara',
        description:
          'Komunitas konservasi laut yang berfokus pada pembersihan pantai dan edukasi masyarakat pesisir di Jawa Barat.',
        location: 'Bandung, Jawa Barat',
        focus_areas: ['cleanup', 'education'],
        member_count: 47,
        is_verified: true,
        verification_status: 'approved',
        bank_name: 'BCA',
        bank_account_number: '1234567890',
        bank_account_name: 'Yayasan Bahari Nusantara',
      },
    })

    console.log(`   ✅ Komunitas dibuat: ${community.name}`)

    // ============================================
    // 4. Buat Demo Activity
    // ============================================
    console.log('📋 Membuat demo kegiatan...')

    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

    await prisma.activities.upsert({
      where: { community_id_slug: { community_id: community.id, slug: 'bersih-pantai-2026' } },
      update: {},
      create: {
        community_id: community.id,
        title: 'Bersih Pantai Pangandaran 2026',
        slug: 'bersih-pantai-2026',
        description:
          'Kegiatan pembersihan sampah plastik di Pantai Pangandaran bersama masyarakat lokal dan relawan. Target pengumpulan 500 kg sampah plastik.',
        category: 'cleanup',
        status: 'published',
        start_date: sixMonthsFromNow,
        location: 'Pantai Pangandaran, Ciamis, Jawa Barat',
        latitude: -7.6978,
        longitude: 108.6527,
        volunteer_quota: 50,
        funding_goal: 15000000,
        allow_item_donation: true,
        items_needed: [
          { item_name: 'Kantong Sampah Besar', target: 200, unit_price: 5000, donated: 0 },
          { item_name: 'Sarung Tangan Karet', target: 100, unit_price: 15000, donated: 0 },
          { item_name: 'Sapu Lidi', target: 30, unit_price: 25000, donated: 0 },
        ],
        published_at: new Date(),
      },
    })

    console.log('   ✅ Demo kegiatan dibuat')
  }

  // ============================================
  // 5. Seed Journey Milestones (jika belum ada)
  // ============================================
  console.log('🏆 Mengecek journey milestones...')

  const milestoneCount = await prisma.journey_milestones.count()
  if (milestoneCount === 0) {
    await prisma.journey_milestones.createMany({
      data: [
        { year: 2020, title: 'SinergiLaut Didirikan', description: 'Platform ini hadir sebagai jembatan digital pertama untuk gerakan konservasi kolaboratif.', impact_stat: 'Misi dimulai', icon: 'Waves', order_index: 1 },
        { year: 2021, title: 'Komunitas Pertama Bergabung', description: '10 komunitas konservasi dari Jawa, Bali, dan Sulawesi bergabung sebagai mitra perdana.', impact_stat: '10 komunitas, 500+ relawan', icon: 'Users', order_index: 2 },
        { year: 2022, title: 'Sistem Donasi & Transparansi', description: 'Meluncurkan sistem donasi terintegrasi dengan verifikasi penggunaan dana secara transparan.', impact_stat: 'Rp 1M+ dana terhimpun', icon: 'Banknote', order_index: 3 },
        { year: 2023, title: 'Ekspansi ke 50+ Komunitas', description: 'Jaringan komunitas mitra berkembang menjadi 50+ komunitas di 15 provinsi.', impact_stat: '50+ komunitas, 15 provinsi', icon: 'Globe', order_index: 4 },
        { year: 2024, title: 'Milestone 10.000 Relawan', description: '10.000+ relawan terdaftar dan Rp 5 miliar dana konservasi berhasil terhimpun.', impact_stat: '10.000+ relawan, Rp 5M+', icon: 'Award', order_index: 5 },
        { year: 2026, title: 'Platform Generasi Baru', description: 'Peluncuran platform baru dengan fitur realtime, integrasi Midtrans, dan pencairan dana transparan.', impact_stat: 'Fitur lengkap & real-time', icon: 'Zap', order_index: 6 },
      ],
    })
    console.log('   ✅ Journey milestones di-seed')
  } else {
    console.log(`   ℹ️  Journey milestones sudah ada (${milestoneCount} data), skip.`)
  }

  console.log('\n✅ Seed selesai!\n')
  console.log('📋 Akun yang dibuat:')
  console.log('   Admin     : admin@sinergilaut.id       | Admin@SinergiLaut2026')
  console.log('   Komunitas : komunitas@example.com      | Komunitas@2026')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
