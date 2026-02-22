import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ScrollToTop } from '@/components/scroll-to-top'
import { WalletContextProvider } from '@/components/wallet-provider'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist',
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Magic Roulette - High Stakes Solana Gaming',
  description: 'Experience Wild West GameFi on Solana. Play Russian Roulette with SOL and compete on the leaderboard.',
  keywords: ['Solana', 'GameFi', 'Roulette', 'Crypto Gaming', 'Web3', 'DeFi', 'Blockchain Gaming'],
  authors: [{ name: 'Magic Roulette Team' }],
  creator: 'Magic Roulette',
  publisher: 'Magic Roulette',
  generator: 'v0.app',
  metadataBase: new URL('https://magic-roulette.sol'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://magic-roulette.sol',
    title: 'Magic Roulette - High Stakes Solana Gaming',
    description: 'Experience Wild West GameFi on Solana. Play Russian Roulette with SOL and compete on the leaderboard.',
    siteName: 'Magic Roulette',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Magic Roulette - High Stakes Solana Gaming',
    description: 'Experience Wild West GameFi on Solana. Play Russian Roulette with SOL and compete on the leaderboard.',
    creator: '@magic_roulette',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <WalletContextProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <ScrollToTop />
          <Analytics />
        </WalletContextProvider>
      </body>
    </html>
  )
}
