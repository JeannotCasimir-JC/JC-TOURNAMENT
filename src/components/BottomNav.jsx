import { NavLink } from 'react-router-dom'
import { Home, Trophy, Swords, Wallet as WalletIcon, User } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const LINKS = [
  { to: '/dashboard', icon: Home, key: 'nav.home' },
  { to: '/tournaments', icon: Trophy, key: 'nav.tournaments' },
  { to: '/my-matches', icon: Swords, key: 'nav.myMatches' },
  { to: '/wallet', icon: WalletIcon, key: 'nav.wallet' },
  { to: '/profile', icon: User, key: 'nav.profile' },
]

export default function BottomNav() {
  const { t } = useLanguage()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-void-900/95 backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-2">
        {LINKS.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-edge-blue' : 'text-ink-faint'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]' : ''} />
                {t(key)}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
