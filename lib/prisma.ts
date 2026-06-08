import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Singleton Prisma client instance.
 * Menghindari terlalu banyak koneksi database saat hot-reload di development.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // CATATAN: Jangan aktifkan 'query' log di development — sangat boros RAM
    // karena setiap SQL query di-buffer di memori Node.js.
    // Gunakan Prisma Studio (pnpm db:studio) untuk debug query.
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
