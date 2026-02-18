import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../components/ThemeContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { VisitorCounterBadge } from '../components/VisitorCounterBadge'
import { KonamiEasterEgg } from '../components/KonamiEasterEgg'
import { LiveStatus } from '../components/LiveStatus'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ 
  subsets: ['latin'], 
  variable: '--font-orbitron',
  weight: ['400', '700', '900']
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D0D0D',
}

export const metadata: Metadata = {
  title: 'StreamerHub | Streamer Fracasado',
  description: '🎮 Links oficiales de StreamerHub - Seguime en Twitch, TikTok, Instagram y más. Contenido de streams y gaming.',
  keywords: ['StreamerHub', 'streamer', 'twitch', 'gamer', 'Misrain', 'Sebastian Valencia Bustos', 'gaming', 'esports'],
  authors: [{ name: 'StreamerHub' }],
  creator: 'StreamerHub',
  publisher: 'StreamerHub',
  robots: 'index, follow',
  openGraph: {
    title: 'StreamerHub | Streamer Fracasado',
    description: '🎮 Links oficiales - Seguime en Twitch, TikTok, Instagram y más',
    url: 'https://dev-linktree.streamerhub.com',
    siteName: 'StreamerHub Links',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreamerHub | Streamer Fracasado',
    description: '🎮 Links oficiales - Seguime en Twitch, TikTok, Instagram y más',
    creator: '@streamerhub',
  },
  alternates: {
    canonical: 'https://dev-linktree.streamerhub.com',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${orbitron.variable} ${inter.className}`}>
        <ThemeProvider>
          <LiveStatus />
          <ThemeToggle />
          {children}
          <VisitorCounterBadge />
          <KonamiEasterEgg />
        </ThemeProvider>
      </body>
    </html>
  )
}
