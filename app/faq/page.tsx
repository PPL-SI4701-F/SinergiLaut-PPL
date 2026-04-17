"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search, HelpCircle } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    category: "Umum",
    items: [
      { q: "Apa itu SinergiLaut?", a: "SinergiLaut adalah platform digital yang menghubungkan komunitas konservasi laut, relawan, donatur, dan admin dalam satu sistem terintegrasi. Kami memfasilitasi kegiatan konservasi, penggalangan dana, dan pelaporan yang transparan." },
      { q: "Apakah SinergiLaut gratis digunakan?", a: "Ya, mendaftar dan menggunakan SinergiLaut sepenuhnya gratis untuk volunteer dan donatur. Komunitas juga dapat mendaftar secara gratis dan mengajukan kegiatan tanpa biaya." },
      { q: "Siapa yang bisa bergabung?", a: "Siapa pun yang peduli dengan konservasi laut! Individu bisa bergabung sebagai volunteer atau donatur. Organisasi dan komunitas konservasi dapat mendaftar sebagai pengelola kegiatan." },
    ],
  },
  {
    category: "Pendaftaran & Akun",
    items: [
      { q: "Bagaimana cara mendaftar?", a: "Klik tombol 'Daftar' di navbar, pilih peran Anda (Volunteer/Donatur atau Komunitas), lalu isi formulir pendaftaran. Konfirmasi email akan dikirim untuk mengaktifkan akun Anda." },
      { q: "Bisakah saya menjadi volunteer sekaligus donatur?", a: "Tentu bisa! Satu akun dapat mendaftar sebagai volunteer sekaligus berdonasi pada kegiatan yang sama. Anda tidak perlu membuat akun terpisah." },
      { q: "Apa yang terjadi jika saya lupa password?", a: "Klik 'Lupa Password' di halaman login, masukkan email Anda, dan kami akan mengirimkan tautan untuk mereset password Anda." },
    ],
  },
  {
    category: "Kegiatan & Volunteer",
    items: [
      { q: "Bagaimana cara mendaftar sebagai volunteer?", a: "Buka halaman kegiatan yang Anda minati, klik 'Daftar sebagai Volunteer', isi formulir pendaftaran singkat, dan tunggu konfirmasi dari pengelola kegiatan." },
      { q: "Apakah ada syarat khusus untuk menjadi volunteer?", a: "Syarat umum minimal berusia 17 tahun dan menyetujui syarat & ketentuan. Beberapa kegiatan mungkin memiliki persyaratan khusus seperti kemampuan menyelam atau sertifikasi tertentu." },
      { q: "Bagaimana jika saya tidak bisa hadir setelah mendaftar?", a: "Segera hubungi pengelola kegiatan melalui informasi kontak yang tersedia. Pembatalan dengan pemberitahuan awal sangat dihargai agar peserta cadangan dapat mengisi slot." },
    ],
  },
  {
    category: "Donasi",
    items: [
      { q: "Apakah donasi saya aman?", a: "Ya. Semua transaksi donasi dicatat dengan aman dan transparan. Setelah kegiatan selesai, komunitas wajib mengunggah laporan penggunaan dana yang dapat diakses publik." },
      { q: "Metode pembayaran apa yang tersedia?", a: "Saat ini kami menerima transfer bank, virtual account, QRIS, GoPay, OVO, dan DANA. Kami terus menambahkan metode pembayaran baru." },
      { q: "Apakah saya bisa berdonasi barang?", a: "Ya! Pada setiap kegiatan yang mendukung donasi barang, Anda dapat mengisi jenis barang, jumlah, dan nomor resi pengiriman untuk tracking." },
      { q: "Bisakah donasi dikembalikan (refund)?", a: "Refund dapat diproses jika kegiatan dibatalkan atau terbukti ada ketidaksesuaian penggunaan dana yang divalidasi admin. Proses refund membutuhkan 3-7 hari kerja." },
    ],
  },
  {
    category: "Komunitas",
    items: [
      { q: "Bagaimana cara mendaftarkan komunitas saya?", a: "Daftar akun dengan tipe 'Komunitas', lengkapi profil, dan ajukan verifikasi. Admin akan meninjau dokumen dan data komunitas Anda dalam 1-3 hari kerja." },
      { q: "Dokumen apa yang dibutuhkan untuk verifikasi?", a: "Anda perlu menyiapkan akta pendirian organisasi/komunitas, data anggota aktif, rencana kegiatan konservasi, dan kontak penanggung jawab." },
      { q: "Apa yang terjadi setelah komunitas diverifikasi?", a: "Komunitas terverifikasi mendapat badge 'Verified', dapat mempublikasikan kegiatan, menerima volunteer dan donasi, serta mengakses dashboard pengelolaan lengkap." },
    ],
  },
]

export default function FAQPage() {
  const [search, setSearch] = useState("")
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    const next = new Set(openItems)
    next.has(key) ? next.delete(key) : next.add(key)
    setOpenItems(next)
  }

  const filtered = faqs.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16">
        <section className="bg-primary py-16 lg:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <HelpCircle className="h-12 w-12 text-primary-foreground/80" />
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground">Pertanyaan yang Sering Ditanyakan</h1>
            <p className="mt-4 text-primary-foreground/80 text-lg">Temukan jawaban atas pertanyaan umum tentang SinergiLaut</p>
            <div className="mt-8 relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cari pertanyaan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 bg-background text-foreground"
              />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Tidak ada pertanyaan yang sesuai. Coba kata kunci lain.</p>
              </div>
            ) : (
              filtered.map((category) => (
                <div key={category.category}>
                  <h2 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">{category.category}</h2>
                  <div className="space-y-3">
                    {category.items.map((item, i) => {
                      const key = `${category.category}-${i}`
                      const isOpen = openItems.has(key)
                      return (
                        <Card key={key} className="overflow-hidden">
                          <button
                            onClick={() => toggle(key)}
                            className="w-full p-5 text-left flex items-center justify-between gap-4"
                          >
                            <span className="font-medium text-foreground">{item.q}</span>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isOpen && (
                            <CardContent className="px-5 pb-5 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-border">
                              {item.a}
                            </CardContent>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))
            )}

            <div className="text-center p-8 bg-secondary rounded-2xl">
              <p className="text-foreground font-medium mb-2">Masih ada pertanyaan?</p>
              <p className="text-muted-foreground text-sm mb-4">Tim kami siap membantu Anda</p>
              <Link href="/contact" className="text-primary hover:underline font-medium">Hubungi Kami →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
