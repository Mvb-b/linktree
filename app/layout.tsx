import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '700', '900']
})

export const metadata: Metadata = {
  title: 'StreamerHub | Streamer Fracasado',
  description: 'Links oficiales de StreamerHub - Twitch, TikTok, Instagram y más',
  keywords: ['StreamerHub', 'streamer', 'twitch', 'gamer', 'Misrain Sebastián Valencia Bustos'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${orbitron.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  )
}
