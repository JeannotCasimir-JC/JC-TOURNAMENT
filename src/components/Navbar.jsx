import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Wallet as WalletIcon } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { logoutUser, listenNotifications } from '../lib/supabase'
import { formatMGA } from '../utils/formatCurrency'
import { useEffect, useState } from 'react'

const LINKS = [
  { to: '/dashboard', key: 'nav.dashboard' },
  { to: '/tournaments', key: 'nav.tournaments' },
  { to: '/my-matches', key: 'nav.myMatches' },
  { to: '/results', key: 'nav.results' },
  { to: '/wallet', key: 'nav.wallet' },
  { to: '/notifications', key: 'nav.notifications' },
  { to: '/profile', key: 'nav.profile' },
]

export default function Navbar() {
  const { profile, user } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    const unsub = listenNotifications(user.uid, (list) => {
      setUnread(list.filter((n) => !n.read).length)
    })
    return unsub
  }, [user])

  async function handleLogout() {
    try {
      await logoutUser()
      navigate('/login')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <header className="sticky top-0 z-40 hidden md:block border-b border-white/5 bg-void-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <NavLink to="/dashboard">
          <Logo />
        </NavLink>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-edge-blue' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              {t(link.key)}
              {link.key === 'nav.notifications' && unread > 0 && (
                <span className="absolute -top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-loss px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs font-mono text-ink-muted outline-none"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="mg">MG</option>
          </select>

          <NavLink to="/wallet" className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <WalletIcon size={14} className="text-edge-cyan" />
            <span className="stat-mono text-sm text-ink">{formatMGA(profile?.walletBalance)}</span>
          </NavLink>

          <button onClick={handleLogout} className="rounded-lg p-2 text-ink-faint hover:text-loss transition-colors" title={t('auth.logout')}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
