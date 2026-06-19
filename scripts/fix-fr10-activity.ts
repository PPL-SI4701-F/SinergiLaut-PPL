/**
 * Script untuk memastikan activity "Ekspedisi Terumbu Karang Raja Ampat"
 * ada di database dengan:
 * - status: "published" (bukan completed, agar blok donasi muncul)
 * - end_date: tanggal yang sudah lewat (agar daysLeft = 0 → tombol "Batas Waktu Habis" tampil)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const TITLE = 'Ekspedisi Terumbu Karang Raja Ampat'

  // Cari activity yang sudah ada
  const existing = await prisma.activities.findFirst({
    where: { title: TITLE },
  })

  // end_date yang sudah lewat: 1 Januari 2025
  const pastEndDate = new Date('2025-01-01T00:00:00Z')

  if (existing) {
    console.log(`✅ Activity ditemukan (id: ${existing.id}), mengupdate end_date dan status...`)
    await prisma.activities.update({
      where: { id: existing.id },
      data: {
        end_date: pastEndDate,
        status: 'published',  // Harus published agar blok donasi muncul
        published_at: existing.published_at ?? new Date('2024-01-01T00:00:00Z'),
      },
    })
    console.log(`✅ Activity diupdate: end_date=${pastEndDate.toISOString()}, status=published`)
  } else {
    console.log(`⚠️  Activity tidak ditemukan. Membuat baru...`)
    // Cari community yang approved untuk jadi owner
    const community = await prisma.communities.findFirst({
      where: { verification_status: 'approved' },
    })
    if (!community) {
      throw new Error('Tidak ada community approved di database. Jalankan seed terlebih dahulu.')
    }

    const act = await prisma.activities.create({
      data: {
        community_id: community.id,
        title: TITLE,
        slug: 'ekspedisi-terumbu-karang-raja-ampat',
        description: 'Ekspedisi pemantauan kondisi terumbu karang di perairan Raja Ampat, Papua Barat.',
        category: 'restoration',
        status: 'published',
        start_date: new Date('2025-03-01T00:00:00Z'),
        end_date: pastEndDate,
        location: 'Raja Ampat, Papua Barat',
        volunteer_quota: 15,
        volunteer_count: 0,
        funding_goal: 20000000,
        funding_raised: 5000000,
        cover_image_url: '/images/activities/activity-template-1.png',
        published_at: new Date('2024-06-01T00:00:00Z'),
        allow_item_donation: false,
      },
    })
    console.log(`✅ Activity baru dibuat (id: ${act.id})`)
  }

  console.log('\n🎉 Selesai! Test TC-02 seharusnya sekarang bisa pass.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
