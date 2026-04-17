import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  resources: [
    { href: "#", label: "About Us" },
    { href: "#", label: "Impact Report" },
    { href: "#", label: "Partners" },
    { href: "#", label: "Press Kit" },
  ],
  legal: [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Cookie Policy" },
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
              Connecting marine conservation communities, volunteers, donors, and corporate sponsors to protect our oceans.
            </p>
          </div>



          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
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
            <a href="#" className="text-background/60 hover:text-background transition-colors text-sm">
              Instagram
            </a>
            <a href="#" className="text-background/60 hover:text-background transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-background/60 hover:text-background transition-colors text-sm">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
