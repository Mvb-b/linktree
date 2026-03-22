import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../components/ThemeContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { VisitorCounterBadge } from '../components/VisitorCounterBadge'
import { KonamiEasterEgg } from '../components/KonamiEasterEgg'
import { LiveStatus } from '../components/LiveStatus'
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', weight: ['400', '700', '900'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D0D0D',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://dev-linktree.misrravb.com'),
  
  // SEO básico
  title: {
    default: 'MisrraVB | Streamer Fracasado',
    template: '%s | MisrraVB',
  },
  description: '🎮 Misrain Sebastián Valencia Bustos (MisrraVB) - Streamer de Valorant y gaming. Links oficiales para seguirme en Twitch, YouTube, TikTok, Instagram y más. Ven a ver los streams en vivo lunes a viernes.',
  
  // Keywords ampliadas para SEO
  keywords: [
    'MisrraVB', 'Misrra VB', 'Misrravb',
    'Misrain', 'Sebastian Valencia Bustos',
    'streamer', 'streamer chileno', 'streamer español',
    'gaming', 'gamer', 'gamer chileno',
    'twitch', 'youtube gaming', 'tiktok gaming',
    'valorant', 'fps', 'esports',
    'twitch chile', 'creador de contenido',
  ],
  
  // Autores y copyright
  authors: [{ name: 'MisrraVB', url: 'https://dev-linktree.misrravb.com' }],
  creator: 'MisrraVB',
  publisher: 'MisrraVB',
  
  // Categorización
  category: 'Gaming',
  classification: 'Gaming & Entertainment',
  
  // Robots y crawling
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // OpenGraph completo
  openGraph: {
    title: 'MisrraVB | Streamer Fracasado',
    description: '🎮 Misrain Sebastián Valencia Bustos - Links oficiales para seguirme en Twitch, YouTube, TikTok, Instagram y todas mis redes. ¡Únete a la comunidad!',
    url: 'https://dev-linktree.misrravb.com',
    siteName: 'MisrraVB Links',
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'MisrraVB - Streamer Fracasado | Links oficiales',
        type: 'image/png',
      },
    ],
  },
  
  // Twitter Card completo
  twitter: {
    card: 'summary_large_image',
    title: 'MisrraVB | Streamer Fracasado',
    description: '🎮 Misrain Sebastián Valencia Bustos - Links oficiales para seguirme en Twitch, YouTube, TikTok, Instagram y más',
    creator: '@misrravb',
    site: '@misrravb',
    images: ['/twitter-image.png'],
  },
  
  // Canonical y alternativas
  alternates: {
    canonical: 'https://dev-linktree.misrravb.com',
    languages: {
      'es-CL': 'https://dev-linktree.misrravb.com',
      'es': 'https://dev-linktree.misrravb.com',
    },
  },
  
  // Iconos y manifest
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: ['/favicon.ico'],
  },
  
  // Metadatos adicionales
  other: {
    'profile:first_name': 'Sebastian',
    'profile:last_name': 'Valencia Bustos',
    'profile:username': 'misrravb',
    'profile:gender': 'male',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${orbitron.variable} ${inter.className}`}>
        <ThemeProvider>
          <LiveStatus />
          <ThemeToggle />
          {children}
          <VisitorCounterBadge />
          <AnalyticsDashboard />
          <KonamiEasterEgg />
        </ThemeProvider>
      </body>
    </html>
  )
}
