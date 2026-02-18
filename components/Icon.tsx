'use client'

import { 
  Video,
  Music2,
  Camera,
  Twitter,
  Youtube,
  Facebook,
  Flame
} from 'lucide-react'

export type SocialPlatform = 'twitch' | 'tiktok' | 'instagram' | 'twitter' | 'youtube' | 'facebook'

interface IconProps {
  platform: SocialPlatform
  className?: string
  size?: number
}

const iconComponents: Record<SocialPlatform, typeof Video> = {
  twitch: Video,
  tiktok: Music2,
  instagram: Camera,
  twitter: Twitter,
  youtube: Youtube,
  facebook: Facebook,
}

export function PlatformIcon({ platform, className = '', size = 24 }: IconProps) {
  const IconComponent = iconComponents[platform]
  
  if (!IconComponent) {
    return null
  }
  
  return <IconComponent className={className} size={size} />
}

export const platformColors: Record<SocialPlatform, string> = {
  twitch: 'text-[#9146FF]',
  tiktok: 'text-white',
  instagram: 'text-pink-500',
  twitter: 'text-white',
  youtube: 'text-red-600',
  facebook: 'text-blue-500',
}

export const platformGradients: Record<SocialPlatform, string> = {
  twitch: 'from-purple-600 to-purple-800',
  tiktok: 'from-gray-900 to-black',
  instagram: 'from-pink-600 to-purple-600',
  twitter: 'from-gray-800 to-black',
  youtube: 'from-red-600 to-red-800',
  facebook: 'from-blue-600 to-blue-800',
}

export { Flame }
