'use client'

import { useState } from 'react'
import { Flame, User } from 'lucide-react'
import Image from 'next/image'

interface ProfileProps {
  name: string
  bio: string
  subtitle?: string
  avatarUrl?: string
}

export function Profile({ name, bio, subtitle, avatarUrl }: ProfileProps) {
  const [imageError, setImageError] = useState(false)
  const hasAvatar = avatarUrl && !imageError

  return (
    <div className="flex flex-col items-center text-center px-4 py-6">
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-28 h-28 md:w-32 md:h-32 glass-card rounded-full flex items-center justify-center overflow-hidden relative">
          {hasAvatar ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <Flame className="w-12 h-12 md:w-14 md:h-14 text-fire-orange" />
          )}
        </div>
        
        {/* Status indicator - only show if no avatar */}
        {!hasAvatar && (
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-dark-bg animate-pulse" />
        )}
      </div>

      {/* Name */}
      <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1 fire-glow">
        {name}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="font-display text-sm md:text-base text-fire-orange/80 mb-2 tracking-wider">
          {subtitle}
        </p>
      )}

      {/* Bio */}
      <p className="font-body text-gray-400 text-sm md:text-base max-w-sm">
        {bio}
      </p>

      {/* Decorative element */}
      <div className="mt-4 flex items-center gap-2">
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-fire-orange" />
        <Flame className="w-4 h-4 text-fire-orange" />
        <div className="w-12 h-px bg-gradient-to-l from-transparent to-fire-orange" />
      </div>
    </div>
  )
}
