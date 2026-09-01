import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, Trophy, Swords, History, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { listenTournaments, listenUserParticipations, listenWalletTransactions } from '../lib/supabase'
import { formatMGA, formatDateTime } from '../utils/formatCurrency'
import TournamentCard from '../components/TournamentCard'
import StatusBadge from '../components/StatusBadge'
import { CardSkeleton, EmptyState } from '../components/States'

export default function Dashboard() {
  const { profile, user } = useAuth()
  const { t } = useLanguage()
  const [openTournaments, setOpenTournaments] = useState(null)
  const [participations, setParticipations] = useState([])
  const [transactions, setTransactions] = useState(null)

  useEffect(() => {
    const unsub = listenTournaments('registration_open', setOpenTournaments)
    return unsub
  }, [])

  useEffect(() => {
    if (!user) return
    const unsub = listenUserParticipations(user.uid, setParticipations)
    return unsub
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsub = listenWalletTransactions(user.uid, setTransactions, 5)
    return unsub
  }, [user])

  const featured = openTournaments?.[0]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {t('dashboard.welcomeBack', { username: profile?.username || profile?.fullName || 'Player' })}
        </h1>
        <p className="text-sm text-ink-muted">Here's what's happening in your arena.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="hud-card p-5">
          <div className="flex items-center gap-2 text-ink-faint">
            <Wallet size={16} className="text-edge-cyan" />
            <span className="text-xs uppercase tracking-wider">{t('dashboard.wallet')}</span>
          </div>
          <p className="mt-2 stat-mono text-2xl font-bold text-ink">{formatMGA(profile?.walletBalance)}</p>
          <Link to="/wallet" className="mt-3 inline-block text-xs font-semibold text-edge-blue hover:underline">
            Manage wallet →
          </Link>
        </div>

        <div className="hud-card p-5">
          <div className="flex items-center gap-2 text-ink-faint">
            <Swords size={16} className="text-edge-cyan" />
            <span className="text-xs uppercase tracking-wider">{t('dashboard.joinedTournaments')}</span>
          </div>
          <p className="mt-2 stat-mono text-2xl font-bold text-ink">{participations.length}</p>
          <Link to="/my-matches" className="mt-3 inline-block text-xs font-semibold text-edge-blue hover:underline">
            View my matches →
          </Link>
        </div>

        <div className="hud-card p-5">
          <div className="flex items-center gap-2 text-ink-faint">
            <Trophy size={16} className="text-edge-cyan" />
            <span className="text-xs uppercase tracking-wider">Total winnings</span>
          </div>
          <p className="mt-2 stat-mono text-2xl font-bold text-edge">{formatMGA(profile?.stats?.totalWinnings)}</p>
          <Link to="/results" className="mt-3 inline-block text-xs font-semibold text-edge-blue hover:underline">
            {t('dashboard.recentResults')} →
          </Link>
        </div>
      </div>

      {featured && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">{t('dashboard.upcomingTournament')}</h2>
          <div className="max-w-md">
            <TournamentCard tournament={featured} />
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Registration open</h2>
          <Link to="/tournaments" className="flex items-center text-xs font-semibold text-edge-blue hover:underline">
            See all <ChevronRight size={14} />
          </Link>
        </div>
        {openTournaments === null ? (
          <CardSkeleton count={3} />
        ) : openTournaments.length === 0 ? (
          <EmptyState icon={Trophy} title="No open tournaments right now" description="Check back soon — new tournaments open regularly." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openTournaments.slice(0, 3).map((tour) => (
              <TournamentCard key={tour.id} tournament={tour} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <History size={18} className="text-edge-cyan" /> {t('dashboard.recentTransactions')}
        </h2>
        {transactions === null ? (
          <div className="hud-card h-32 animate-pulse-slow" />
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions yet" description="Your deposits, entries, and winnings will show up here." />
        ) : (
          <div className="hud-card divide-y divide-white/5">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-ink">{txn.description}</p>
                  <p className="text-xs text-ink-faint">{formatDateTime(txn.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`stat-mono text-sm font-semibold ${txn.amount < 0 ? 'text-loss' : 'text-win'}`}>
                    {txn.amount < 0 ? '' : '+'}
                    {formatMGA(txn.amount)}
                  </p>
                  <StatusBadge status={txn.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
