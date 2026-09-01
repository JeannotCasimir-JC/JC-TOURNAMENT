import { Link } from 'react-router-dom'
import { Crosshair, Map, Users, Trophy, Skull } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatMGA, formatDate } from '../utils/formatCurrency'

export default function TournamentCard({ tournament }) {
  const {
    id,
    name,
    date,
    mode,
    map,
    entryFee,
    prizePool,
    perKillReward,
    booyahReward,
    maxPlayers,
    currentPlayers,
    status,
  } = tournament

  const slotsLeft = Math.max(0, (maxPlayers || 0) - (currentPlayers || 0))
  const isFull = slotsLeft === 0

  return (
    <Link to={`/tournaments/${id}`} className="hud-card group block p-5 transition-shadow hover:shadow-glow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold text-ink group-hover:text-edge-blue transition-colors">{name}</p>
          <p className="text-xs text-ink-faint">{formatDate(date)}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-ink-muted">
          <Crosshair size={14} className="text-edge-cyan" />
          <span>{mode}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <Map size={14} className="text-edge-cyan" />
          <span>{map}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <Users size={14} className="text-edge-cyan" />
          <span className="stat-mono">{currentPlayers || 0}/{maxPlayers}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <Skull size={14} className="text-edge-cyan" />
          <span className="stat-mono">{formatMGA(perKillReward)}/kill</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-faint">Entry</p>
          <p className="stat-mono text-sm font-semibold text-ink">{formatMGA(entryFee)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-ink-faint flex items-center justify-end gap-1">
            <Trophy size={11} className="text-edge" /> Prize Pool
          </p>
          <p className="stat-mono text-sm font-semibold text-edge">{formatMGA(prizePool)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-ink-faint">
          {isFull ? 'No slots left' : `${slotsLeft} slots left`}
        </span>
        <span className="text-xs font-display font-semibold text-edge-blue group-hover:underline">
          View details →
        </span>
      </div>
    </Link>
  )
}
