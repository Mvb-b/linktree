import { Profile } from '../components/Profile'
import { LinkButton } from '../components/LinkButton'
import { Footer } from '../components/Footer'

const socialLinks = [
  { platform: 'twitch' as const, title: 'Twitch', url: 'https://www.twitch.tv/streamerhub', username: '@streamerhub' },
  { platform: 'tiktok' as const, title: 'TikTok', url: 'https://www.tiktok.com/@streamerhub', username: '@streamerhub' },
  { platform: 'instagram' as const, title: 'Instagram', url: 'https://www.instagram.com/streamerhub', username: '@streamerhub' },
  { platform: 'twitter' as const, title: 'Twitter / X', url: 'https://twitter.com/streamerhub', username: '@streamerhub' },
  { platform: 'youtube' as const, title: 'YouTube', url: 'https://www.youtube.com/@StreamerHub', username: '@StreamerHub' },
  { platform: 'facebook' as const, title: 'Facebook', url: 'https://www.facebook.com/StreamerHub', username: 'StreamerHub' },
]

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        {/* Profile Section */}
        <Profile 
          name="StreamerHub" 
          subtitle="Streamer Fracasado" 
          bio="Misrain Sebastián Valencia Bustos | Contenido de streams y gaming"
          avatarUrl="/avatar.jpg"
        />

        {/* Links Section */}
        <div className="space-y-3 px-2 mt-2">
          {socialLinks.map((link) => (
            <LinkButton 
              key={link.platform} 
              platform={link.platform} 
              title={link.title} 
              url={link.url} 
              username={link.username} 
            />
          ))}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  )
}
