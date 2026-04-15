import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'SinergiLaut - Platform Konservasi Laut Indonesia',
    template: '%s | SinergiLaut',
  },
  description:
    'Platform digital untuk koordinasi komunitas konservasi laut, penggalangan dana transparan, dan manajemen relawan di Indonesia.',
  keywords: ['konservasi laut', 'relawan', 'donasi', 'indonesia', 'komunitas'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
