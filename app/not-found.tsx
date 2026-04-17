import Link from "next/link"
import { Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="max-w-lg mx-auto text-center">
          {/* Ocean wave animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                <Waves className="h-16 w-16 text-primary opacity-60" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-8xl font-bold text-primary/20 leading-none">404</p>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">Halaman Tidak Ditemukan</h1>
          <p className="text-muted-foreground text-lg mb-2">
            Seperti mencari terumbu karang di kedalaman — halaman ini tidak ada di sini.
          </p>
          <p className="text-muted-foreground mb-8">
            Mungkin URL salah atau halaman telah dipindahkan.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/activities">Lihat Kegiatan</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
