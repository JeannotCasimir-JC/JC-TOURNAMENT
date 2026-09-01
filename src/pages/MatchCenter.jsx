import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Lock, Copy, Check } from 'lucide-react'
import { listenMatchRoom } from '../lib/supabase'
import { formatDate } from '../utils/formatCurrency'
import StatusBadge from '../components/StatusBadge'
import { ErrorState } from '../components/States'
import { useToast } from '../context/ToastContext'

export default function MatchCenter() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [tournament, setTournament] = useState(undefined)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const unsub = listenMatchRoom(id, setTournament)
    return unsub
  }, [id])

  function copy(value, label) {
    navigator.clipboard.writeText(value)
    setCopied(label)
    showToast('Copied', 'success', 1500)
    setTimeout(() => setCopied(''), 1500)
  }

  if (tournament === undefined) return <div className="hud-card h-64 animate-pulse-slow" />
  if (tournament === null) return <ErrorState message="Match not found." />

  const released = Boolean(tournament.roomReleased)

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <StatusBadge status={tournament.status} />
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">{tournament.name}</h1>
        <p className="text-sm text-ink-muted">
          {formatDate(tournament.date)} {tournament.startTime ? `· ${tournament.startTime}` : ''}
        </p>
      </div>

      <div className="hud-card p-6">
        <p className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-ink-faint">
          <Lock size={14} /> Match Room
        </p>

        {!released ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <p className="font-display text-lg font-bold tracking-widest text-ink-faint">ROOM ID: LOCKED</p>
            <p className="mt-1 font-display text-lg font-bold tracking-widest text-ink-faint">PASSWORD: LOCKED</p>
            <p className="mt-4 text-xs text-ink-muted">
              Room details will be available before match start. Come back closer to {tournament.startTime || 'the scheduled time'}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <RoomField label="Room ID" value={tournament.roomId} onCopy={() => copy(tournament.roomId, 'id')} copied={copied === 'id'} />
            <RoomField label="Password" value={tournament.roomPassword} onCopy={() => copy(tournament.roomPassword, 'pw')} copied={copied === 'pw'} />
          </div>
        )}
      </div>
    </div>
  )
}

function RoomField({ label, value, onCopy, copied }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-edge-blue/30 bg-edge-blue/5 px-4 py-3">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</p>
        <p className="stat-mono text-lg font-bold text-edge-cyan">{value}</p>
      </div>
      <button onClick={onCopy} className="btn-secondary px-3 py-2 text-xs">
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  )
}
