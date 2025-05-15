import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import NavbarConditional from '@/components/NavbarConditional'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AssetBit - Commodity Trading Platform',
  description: 'Trade physical commodities using blockchain technology',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <Providers>
          <NavbarConditional />
          {children}
          <Footer />
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
} 