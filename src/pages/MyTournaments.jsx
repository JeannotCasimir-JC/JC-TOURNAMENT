import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swords } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listenUserParticipations, listenTournament, isSupabaseConfigured } from '../lib/supabase'
import { formatDate } from '../utils/formatCurrency'
import StatusBadge from '../components/StatusBadge'
import { EmptyState, BackendNotConfigured } from '../components/States'

export default function MyTournaments() {
  const { user } = useAuth()
  const [participations, setParticipations] = useState(null)
  const [tournamentMap, setTournamentMap] = useState({})

  useEffect(() => {
    if (!user) return
    const unsub = listenUserParticipations(user.uid, setParticipations)
    return unsub
  }, [user])

  useEffect(() => {
    if (!participations) return
    const unsubs = participations.map((p) =>
      listenTournament(p.tournamentId, (tour) => {
        setTournamentMap((prev) => ({ ...prev, [p.tournamentId]: tour }))
      })
    )
    return () => unsubs.forEach((u) => u())
  }, [participations])

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink">My Matches</h1>
      <p className="mt-1 text-sm text-ink-muted">Every tournament you've registered for.</p>

      <div className="mt-6">
        {!isSupabaseConfigured ? (
          <BackendNotConfigured feature="My Matches" />
        ) : participations === null ? (
          <div className="hud-card h-40 animate-pulse-slow" />
        ) : participations.length === 0 ? (
          <EmptyState
            icon={Swords}
            title="No matches yet"
            description="Join a tournament to see it here."
            action={
              <Link to="/tournaments" className="btn-primary mt-2 text-sm">
                Browse tournaments
              </Link>
            }
          />
        ) : (
          <div className="hud-card divide-y divide-white/5">
            {participations.map((p) => {
              const tour = tournamentMap[p.tournamentId]
              return (
                <Link
                  key={p.id}
                  to={`/match-center/${p.tournamentId}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div>
                    <p className="font-display font-semibold text-ink">{tour?.name || 'Loading…'}</p>
                    <p className="text-xs text-ink-faint">
                      {tour ? formatDate(tour.date) : ''} {tour?.startTime ? `· ${tour.startTime}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={tour?.status || 'upcoming'} />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
