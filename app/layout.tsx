import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: {
    default: 'SinergiLaut - Platform Konservasi Laut Indonesia',
    template: '%s | SinergiLaut',
  },
  description: 'Platform konservasi laut yang mempertemukan komunitas, relawan, donatur, dan admin dalam satu sistem terintegrasi untuk melindungi ekosistem laut Indonesia.',
  keywords: ['konservasi laut', 'volunteer', 'donasi', 'lingkungan', 'indonesia', 'ocean conservation'],
  authors: [{ name: 'SinergiLaut Team' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://sinergilaut.id',
    siteName: 'SinergiLaut',
    title: 'SinergiLaut - Platform Konservasi Laut Indonesia',
    description: 'Platform konservasi laut yang mempertemukan komunitas, relawan, donatur, dan admin.',
  },
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Google Analytics placeholder */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${geist.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
