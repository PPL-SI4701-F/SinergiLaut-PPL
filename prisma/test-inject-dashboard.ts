/**
 * TEST INJECT: Admin Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Script ADDITIVE — tidak menghapus data existing.
 * Semua data test diberi tag [TEST-<timestamp>] agar mudah diidentifikasi.
 *
 * Yang dibuat:
 *   1. 3 komunitas terverifikasi (is_verified: true, status: approved)
 *   2. 4 pengguna aktif terverifikasi (volunteer_status: approved + volunteer registration)
 *   3. 1 kegiatan aktif: "Bersih Pantai Raja Ampat" (published, ada donasi, tanpa relawan)
 *   4. 1 kegiatan khusus donasi: "Rehabilitasi Terumbu Karang Bunaken" (untuk test total donasi)
 *
 * Ekspektasi perubahan di Admin Dashboard:
 *   ✦ Total Komunitas        → +3
 *   ✦ Pengguna Aktif         → +4  (via volunteer_registrations status approved)
 *   ✦ Kegiatan Aktif         → +2  (status published)
 *   ✦ Total Donasi Terkumpul → +Rp 12.250.000
 *                               (Rp 2.250.000 dari kegiatan 1 + Rp 10.000.000 dari kegiatan 2)
 *
 * Run: npx tsx prisma/test-inject-dashboard.ts
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

// Load env vars dari .env.local jika tersedia
try { require('dotenv').config({ path: '.env.local' }) } catch {}

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TS = Date.now()
const TAG = `TEST-${TS}`

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const COMMUNITIES = [
  {
    name: 'Yayasan Laut Bersih Nusantara',
    location: 'Jakarta Utara, DKI Jakarta',
    focusAreas: ['cleanup', 'education'],
  },
  {
    name: 'Komunitas Karang Hidup Sulawesi',
    location: 'Makassar, Sulawesi Selatan',
    focusAreas: ['restoration', 'monitoring'],
  },
  {
    name: 'Gerakan Pesisir Hijau Bali',
    location: 'Denpasar, Bali',
    focusAreas: ['cleanup', 'restoration', 'education'],
  },
]

const TEST_USERS = [
  {
    name: 'Arif Hidayat',
    email: `arif-${TS}@testuser.dev`,
    phone: '081234001001',
    nik: '3201010101010011',
    address: 'Jl. Sudirman No. 1, Jakarta Pusat',
    gender: 'male' as const,
  },
  {
    name: 'Dewi Kusuma',
    email: `dewi-${TS}@testuser.dev`,
    phone: '081234001002',
    nik: '3201010101010022',
    address: 'Jl. Gatot Subroto No. 2, Jakarta Selatan',
    gender: 'female' as const,
  },
  {
    name: 'Faisal Rahman',
    email: `faisal-${TS}@testuser.dev`,
    phone: '081234001003',
    nik: '3201010101010033',
    address: 'Jl. Thamrin No. 3, Jakarta Pusat',
    gender: 'male' as const,
  },
  {
    name: 'Gita Maharani',
    email: `gita-${TS}@testuser.dev`,
    phone: '081234001004',
    nik: '3201010101010044',
    address: 'Jl. Kuningan No. 4, Jakarta Selatan',
    gender: 'female' as const,
  },
]

// Donasi kegiatan 1 — 3 donasi kecil, total Rp 2.250.000
const DONATIONS_ACT1 = [500_000, 750_000, 1_000_000]

// Donasi kegiatan 2 — 5 donasi besar, total Rp 10.000.000 (mudah diverifikasi)
const DONATIONS_ACT2 = [2_000_000, 2_000_000, 1_500_000, 2_500_000, 2_000_000]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') +
    '-' +
    TS
  )
}

function rupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID')
}

async function createAuthUser(
  email: string,
  fullName: string,
  role: 'user' | 'community'
) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'Password@2026',
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })
  if (error) throw new Error(`Gagal buat auth user ${email}: ${error.message}`)

  return prisma.profiles.upsert({
    where: { id: data.user.id },
    update: { email, full_name: fullName, role, is_active: true },
    create: { id: data.user.id, email, full_name: fullName, role, is_active: true },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(62))
  console.log('  🧪  TEST INJECT — ADMIN DASHBOARD')
  console.log('  TAG: ' + TAG)
  console.log('═'.repeat(62) + '\n')

  // ── STEP 1: Owner komunitas ────────────────────────────────────────────────
  console.log('STEP 1/6 · Membuat owner komunitas...')
  const owners = []
  for (let i = 0; i < COMMUNITIES.length; i++) {
    const owner = await createAuthUser(
      `owner-${TAG.toLowerCase()}-${i + 1}@test.dev`,
      `Owner Komunitas ${i + 1} [${TAG}]`,
      'community'
    )
    owners.push(owner)
  }
  console.log(`         ✅ ${owners.length} owner dibuat.\n`)

  // ── STEP 2: Komunitas terverifikasi ───────────────────────────────────────
  console.log('STEP 2/6 · Membuat 3 komunitas terverifikasi...')
  const communities = []
  for (let i = 0; i < COMMUNITIES.length; i++) {
    const c = COMMUNITIES[i]
    const comm = await prisma.communities.create({
      data: {
        owner_id: owners[i].id,
        name: `[${TAG}] ${c.name}`,
        slug: slugify(c.name),
        description: `Komunitas konservasi laut aktif di ${c.location}. Fokus pada program berkelanjutan yang melibatkan masyarakat lokal dan relawan.`,
        location: c.location,
        is_verified: true,
        verification_status: 'approved',
        bank_name: ['BCA', 'BRI', 'Mandiri'][i],
        bank_account_number: `000${TS}${i + 1}`.slice(-10),
        bank_account_name: `[${TAG}] ${c.name}`,
      },
    })
    await prisma.community_verifications.create({
      data: {
        community_id: comm.id,
        status: 'approved',
        legal_name: `Yayasan ${c.name}`,
        establishment_year: 2021 + i,
        representative_name: owners[i].full_name ?? '',
      },
    })
    communities.push(comm)
    console.log(`         ✅ ${comm.name} · ${c.location}`)
  }
  console.log()

  // ── STEP 3: Pengguna aktif terverifikasi ──────────────────────────────────
  console.log('STEP 3/6 · Membuat 4 pengguna aktif terverifikasi...')
  const users = []
  for (const u of TEST_USERS) {
    const profile = await createAuthUser(u.email, u.name, 'user')
    await prisma.profiles.update({
      where: { id: profile.id },
      data: {
        volunteer_status: 'approved',
        phone: u.phone,
        nik: u.nik,
        address: u.address,
        gender: u.gender,
        date_of_birth: new Date('1998-06-15'),
      },
    })
    users.push(profile)
    console.log(`         ✅ ${u.name} · ${u.email}`)
  }
  console.log()

  // ── STEP 4: Kegiatan aktif — tanpa relawan ────────────────────────────────
  console.log('STEP 4/6 · Membuat kegiatan aktif (tanpa relawan)...')
  const activity1 = await prisma.activities.create({
    data: {
      community_id: communities[0].id,
      title: `[${TAG}] Bersih Pantai & Edukasi Raja Ampat`,
      slug: `bersih-pantai-raja-ampat-${TS}`,
      description:
        'Program pembersihan pantai dan edukasi lingkungan laut di kawasan Raja Ampat. ' +
        'Kami menargetkan pengangkatan minimal 2 ton sampah plastik dari garis pantai ' +
        'serta memberikan edukasi kepada 200 pelajar setempat.',
      category: 'cleanup',
      status: 'published',
      location: 'Raja Ampat, Papua Barat',
      start_date: new Date(Date.now() + 14 * 86_400_000),
      volunteer_quota: 50,
      volunteer_count: 0,
      funding_goal: 15_000_000,
      funding_raised: 0,
      allow_item_donation: false,
      published_at: new Date(),
    },
  })
  // Donasi untuk kegiatan 1
  let orderSeq = 1
  for (const amount of DONATIONS_ACT1) {
    await prisma.donations.create({
      data: {
        activity_id: activity1.id,
        donor_name: `Donatur Umum [${TAG}]`,
        donor_email: `donatur-${TS}@test.dev`,
        type: 'money',
        amount,
        status: 'completed',
        midtrans_order_id: `ORD-${TAG}-A1-${orderSeq++}`,
      },
    })
  }
  const totalAct1 = DONATIONS_ACT1.reduce((s, n) => s + n, 0)
  await prisma.activities.update({
    where: { id: activity1.id },
    data: { funding_raised: totalAct1 },
  })
  console.log(`         ✅ ${activity1.title}`)
  console.log(`            Lokasi  : Raja Ampat, Papua Barat`)
  console.log(`            Target  : ${rupiah(15_000_000)}`)
  console.log(`            Donasi  : ${rupiah(totalAct1)} (${DONATIONS_ACT1.length} donasi selesai)`)
  console.log(`            Relawan : 0 (tidak ada)\n`)

  // ── STEP 5: Kegiatan khusus testing total donasi ──────────────────────────
  console.log('STEP 5/6 · Membuat kegiatan khusus testing total donasi...')
  const activity2 = await prisma.activities.create({
    data: {
      community_id: communities[1].id,
      title: `[${TAG}] Rehabilitasi Terumbu Karang Bunaken`,
      slug: `rehabilitasi-terumbu-karang-bunaken-${TS}`,
      description:
        'Program rehabilitasi terumbu karang di kawasan Taman Nasional Bunaken. ' +
        'Menargetkan penanaman 1.000 fragmen karang hidup dari 5 spesies berbeda ' +
        'dengan metode coral gardening bersama komunitas nelayan lokal.',
      category: 'restoration',
      status: 'published',
      location: 'Bunaken, Sulawesi Utara',
      start_date: new Date(Date.now() + 7 * 86_400_000),
      volunteer_quota: 30,
      volunteer_count: 0,
      funding_goal: 20_000_000,
      funding_raised: 0,
      allow_item_donation: false,
      published_at: new Date(),
    },
  })
  // Donasi besar untuk kegiatan 2
  for (const amount of DONATIONS_ACT2) {
    await prisma.donations.create({
      data: {
        activity_id: activity2.id,
        donor_name: `Donatur Besar [${TAG}]`,
        donor_email: `donatur-besar-${TS}@test.dev`,
        type: 'money',
        amount,
        status: 'completed',
        midtrans_order_id: `ORD-${TAG}-A2-${orderSeq++}`,
      },
    })
  }
  const totalAct2 = DONATIONS_ACT2.reduce((s, n) => s + n, 0)
  await prisma.activities.update({
    where: { id: activity2.id },
    data: { funding_raised: totalAct2 },
  })
  console.log(`         ✅ ${activity2.title}`)
  console.log(`            Lokasi  : Bunaken, Sulawesi Utara`)
  console.log(`            Target  : ${rupiah(20_000_000)}`)
  console.log(`            Donasi  : ${rupiah(totalAct2)} (${DONATIONS_ACT2.length} donasi selesai)`)
  console.log()

  // ── STEP 6: Volunteer registrations untuk 4 pengguna aktif ───────────────
  console.log('STEP 6/6 · Mendaftarkan 4 pengguna ke kegiatan 2...')
  for (let i = 0; i < users.length; i++) {
    await prisma.volunteer_registrations.create({
      data: {
        activity_id: activity2.id,
        user_id: users[i].id,
        full_name: users[i].full_name!,
        email: users[i].email,
        phone: TEST_USERS[i].phone,
        status: 'approved',
        agreed_to_terms: true,
      },
    })
  }
  console.log(`         ✅ 4 volunteer registration (status: approved) dibuat.\n`)

  // ── Ringkasan ──────────────────────────────────────────────────────────────
  const totalAllDonations = totalAct1 + totalAct2

  console.log('═'.repeat(62))
  console.log('  📊  EKSPEKTASI PERUBAHAN DI ADMIN DASHBOARD')
  console.log('═'.repeat(62))
  console.log(`  Total Komunitas        +3   (semua terverifikasi)`)
  console.log(`  Pengguna Aktif         +4   (Arif, Dewi, Faisal, Gita)`)
  console.log(`  Kegiatan Aktif         +2   (Raja Ampat + Bunaken)`)
  console.log(`  Total Donasi Terkumpul +${rupiah(totalAllDonations)}`)
  console.log(`                              (${rupiah(totalAct1)} + ${rupiah(totalAct2)})`)
  console.log('═'.repeat(62))
  console.log(`\n  TAG: ${TAG}`)
  console.log(`  Password semua user test: Password@2026`)
  console.log(`  Cari "[${TAG}]" untuk mengidentifikasi data ini.\n`)
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e instanceof Error ? e.message : e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
