import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  resources: [
    { href: "/about", label: "Tentang Kami" },
    { href: "/activities", label: "Kegiatan Konservasi" },
    { href: "/community", label: "Komunitas Mitra" },
  ],
  platform: [
    { href: "/register", label: "Daftar Relawan" },
    { href: "/community/register", label: "Daftarkan Komunitas" },
    { href: "/login", label: "Masuk" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/images/SinergiLautLogo-transparent.png" alt="SinergiLaut Logo" width={32} height={32} className="h-8 w-auto" />
              <span className="text-xl font-bold">SinergiLaut</span>
            </Link>
            <p className="text-sm text-background/70 leading-relaxed">
              Menghubungkan komunitas konservasi laut, relawan, donatur, dan sponsor untuk menjaga lautan Indonesia.
            </p>
          </div>



          <div>
            <h3 className="font-semibold mb-4">Jelajahi</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} SinergiLaut. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://instagram.com/sinergilaut" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors text-sm">
              Instagram
            </a>
            <a href="https://twitter.com/sinergilaut" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors text-sm">
              Twitter
            </a>
            <a href="https://linkedin.com/company/sinergilaut" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors text-sm">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
