import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { listenTournaments, listenResults, isSupabaseConfigured } from '../lib/supabase'
import { formatMGA } from '../utils/formatCurrency'
import { EmptyState, BackendNotConfigured } from '../components/States'

export default function Results() {
  const [completedTournaments, setCompletedTournaments] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [results, setResults] = useState(null)

  useEffect(() => {
    const unsub = listenTournaments('completed', (list) => {
      setCompletedTournaments(list)
      if (list.length && !selectedId) setSelectedId(list[0].id)
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const unsub = listenResults(selectedId, setResults)
    return unsub
  }, [selectedId])

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink">Results</h1>

      {!isSupabaseConfigured ? (
        <BackendNotConfigured feature="Results" />
      ) : completedTournaments === null ? (
        <div className="mt-6 hud-card h-48 animate-pulse-slow" />
      ) : completedTournaments.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Trophy} title="No completed tournaments yet" description="Results are posted after admins finalize a tournament." />
        </div>
      ) : (
        <>
          <select
            value={selectedId || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="input-field mt-4 max-w-sm"
          >
            {completedTournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <div className="mt-4">
            {results === null ? (
              <div className="hud-card h-40 animate-pulse-slow" />
            ) : results.length === 0 ? (
              <EmptyState title="Results not posted yet" description="Winning amounts come from administrator-entered results." />
            ) : (
              <div className="hud-card overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-ink-faint">
                      <th className="px-5 py-3">Rank</th>
                      <th className="px-5 py-3">Player</th>
                      <th className="px-5 py-3">Kills</th>
                      <th className="px-5 py-3">Kill Reward</th>
                      <th className="px-5 py-3">Placement</th>
                      <th className="px-5 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((r) => (
                      <tr key={r.id} className={r.rank === 1 ? 'bg-edge/5' : ''}>
                        <td className="stat-mono px-5 py-3 font-bold text-edge">#{r.rank}</td>
                        <td className="px-5 py-3 text-ink">{r.playerName}</td>
                        <td className="stat-mono px-5 py-3 text-ink-muted">{r.kills}</td>
                        <td className="stat-mono px-5 py-3 text-ink-muted">{formatMGA(r.killReward)}</td>
                        <td className="stat-mono px-5 py-3 text-ink-muted">{formatMGA(r.placementReward)}</td>
                        <td className="stat-mono px-5 py-3 font-semibold text-win">{formatMGA(r.totalReward)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
