'use client'

import Link from 'next/link'
import { Gamepad2, Ghost, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md text-center">
        {/* Error Icon */}
        <div className="mb-8 relative">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#9146FF] blur-[60px] opacity-30"></div>
            <div className="relative glass-card rounded-full p-8 border-[#9146FF]/30">
              <Ghost className="w-16 h-16 text-[#FF6B35]" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-7xl md:text-8xl font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>
          <span className="bg-gradient-to-r from-[#FF6B35] to-[#9146FF] bg-clip-text text-transparent">
            404
          </span>
        </h1>

        {/* Error Message */}
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>
          PÁGINA NO ENCONTRADA
        </h2>

        {/* Description */}
        <p className="text-gray-400 mb-8 text-sm md:text-base">
          Parece que te perdiste en el mapa, streamer. Esta página no existe o fue eliminada.
        </p>

        {/* Glitch Effect Text */}
        <div className="mb-8 text-[#FF6B35]/60 text-xs tracking-widest uppercase">
          [ ERROR: PAGE_NOT_FOUND ]
        </div>

        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 border-[#9146FF]/30 hover:border-[#FF6B35]/50 hover:shadow-[0_0_30px_rgba(255,107,53,0.3)]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al inicio</span>
        </Link>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-4 opacity-30">
          <Gamepad2 className="w-6 h-6 text-[#9146FF]" />
          <span className="text-gray-500">×</span>
          <Ghost className="w-6 h-6 text-[#FF6B35]" />
          <span className="text-gray-500">×</span>
          <Gamepad2 className="w-6 h-6 text-[#9146FF]" />
        </div>
      </div>
    </div>
  )
}
