import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.com'),
  title: {
    default: 'Animal Hub - Your Complete Animal Care Resource',
    template: '%s | Animal Hub',
  },
  description: 'Expert insights on animal health, livestock production, veterinary care, and pet wellness. Your trusted resource for all things animal-related.',
  keywords: ['animal health', 'veterinary', 'livestock', 'animal production', 'pet care', 'animal welfare', 'animal blog', 'animal husbandry', 'cattle', 'poultry', 'veterinary medicine'],
  authors: [{ name: 'Animal Hub', url: 'https://yourdomain.com' }],
  creator: 'Animal Hub',
  publisher: 'Animal Hub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    siteName: 'Animal Hub',
    title: 'Animal Hub - Your Complete Animal Care Resource',
    description: 'Expert insights on animal health, livestock production, veterinary care, and pet wellness.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Animal Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animal Hub - Your Complete Animal Care Resource',
    description: 'Expert insights on animal health, livestock production, veterinary care, and pet wellness.',
    images: ['/og-image.jpg'],
    creator: '@animalhub',
    site: '@animalhub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
