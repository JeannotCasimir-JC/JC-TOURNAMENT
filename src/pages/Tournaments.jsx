import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { listenTournaments, isSupabaseConfigured } from '../lib/supabase'
import TournamentCard from '../components/TournamentCard'
import { CardSkeleton, EmptyState, BackendNotConfigured } from '../components/States'

const TABS = ['registration_open', 'upcoming', 'ongoing', 'completed']

export default function Tournaments() {
  const { t } = useLanguage()
  const [tab, setTab] = useState('registration_open')
  const [tournaments, setTournaments] = useState(null)

  useEffect(() => {
    setTournaments(null)
    const unsub = listenTournaments(tab, setTournaments)
    return unsub
  }, [tab])

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink">{t('nav.tournaments')}</h1>

      <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02] p-1">
        {TABS.map((status) => (
          <button
            key={status}
            onClick={() => setTab(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-display font-semibold transition-colors ${
              tab === status ? 'bg-gradient-to-r from-edge-blue to-edge text-white shadow-glow' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {t(`tournament.status.${status}`)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {!isSupabaseConfigured ? (
          <BackendNotConfigured feature="Tournaments" />
        ) : tournaments === null ? (
          <CardSkeleton count={6} />
        ) : tournaments.length === 0 ? (
          <EmptyState icon={Trophy} title="Nothing here yet" description="No tournaments in this category right now." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tour) => (
              <TournamentCard key={tour.id} tournament={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
