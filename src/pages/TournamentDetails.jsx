import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Crosshair, Map, Users, Trophy, Skull, Calendar, Clock, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { listenTournament, joinTournament, isUserRegistered } from '../lib/supabase'
import { formatMGA, formatDate } from '../utils/formatCurrency'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { ErrorState } from '../components/States'

export default function TournamentDetails() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()

  const [tournament, setTournament] = useState(undefined)
  const [registered, setRegistered] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [freeFireUid, setFreeFireUid] = useState(profile?.freeFireUid || '')
  const [freeFireNickname, setFreeFireNickname] = useState(profile?.freeFireNickname || '')
  const [teamName, setTeamName] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const unsub = listenTournament(id, setTournament)
    return unsub
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    isUserRegistered(id, user.uid).then(setRegistered).catch(() => {})
  }, [user, id])

  async function handleConfirmJoin() {
    if (!freeFireUid.trim() || !freeFireNickname.trim()) {
      return showToast('Free Fire UID and nickname are required.', 'error')
    }
    setJoining(true)
    try {
      await joinTournament({
        tournamentId: id,
        userId: user.uid,
        freeFireUid: freeFireUid.trim(),
        freeFireNickname: freeFireNickname.trim(),
        teamName: tournament.mode?.toLowerCase() !== 'solo' ? teamName.trim() : null,
      })
      setRegistered(true)
      setShowJoinDialog(false)
      showToast('You are registered! Check Match Center before start time.', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setJoining(false)
    }
  }

  if (tournament === undefined) {
    return <div className="hud-card h-64 animate-pulse-slow" />
  }
  if (tournament === null) {
    return <ErrorState message="Tournament not found." />
  }

  const slotsLeft = Math.max(0, (tournament.maxPlayers || 0) - (tournament.currentPlayers || 0))
  const isFull = slotsLeft === 0
  const canJoin = tournament.status === 'registration_open' && !isFull && !registered

  return (
    <div className="animate-fade-in space-y-6">
      <div className="hud-card overflow-hidden">
        <div className="h-32 bg-hud bg-gradient-to-br from-edge-blue/30 via-void-700 to-edge/30 relative flex items-end p-5">
          <div>
            <StatusBadge status={tournament.status} />
            <h1 className="mt-2 font-display text-2xl font-bold text-ink glow-text">{tournament.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <Stat icon={Calendar} label="Date" value={formatDate(tournament.date)} />
          <Stat icon={Clock} label="Start time" value={tournament.startTime || '—'} />
          <Stat icon={Crosshair} label={t('tournament.mode')} value={tournament.mode} />
          <Stat icon={Map} label={t('tournament.map')} value={tournament.map} />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/5 p-5 sm:grid-cols-4">
          <Stat icon={Users} label={t('tournament.maxPlayers')} value={`${tournament.currentPlayers || 0}/${tournament.maxPlayers}`} mono />
          <Stat icon={Trophy} label={t('tournament.prizePool')} value={formatMGA(tournament.prizePool)} mono accent />
          <Stat icon={Skull} label={t('tournament.perKill')} value={formatMGA(tournament.perKillReward)} mono />
          <Stat icon={Trophy} label={t('tournament.booyah')} value={formatMGA(tournament.booyahReward)} mono />
        </div>

        {tournament.rules && (
          <div className="border-t border-white/5 p-5">
            <p className="mb-2 text-xs font-display font-semibold uppercase tracking-wider text-ink-faint">Rules</p>
            <p className="whitespace-pre-line text-sm text-ink-muted">{tournament.rules}</p>
          </div>
        )}

        <div className="border-t border-white/5 p-5">
          <p className="mb-3 text-sm text-ink-muted">
            Entry fee: <span className="stat-mono font-semibold text-ink">{formatMGA(tournament.entryFee)}</span>
          </p>
          {registered ? (
            <div className="flex items-center gap-2 rounded-xl border border-win/30 bg-win/10 px-4 py-3 text-win">
              <ShieldCheck size={18} />
              <span className="font-display font-semibold">{t('tournament.registered')}</span>
              <Link to="/my-matches" className="ml-auto text-xs font-semibold text-edge-blue hover:underline">
                Go to Match Center →
              </Link>
            </div>
          ) : (
            <button
              disabled={!canJoin}
              onClick={() => setShowJoinDialog(true)}
              className="btn-primary w-full sm:w-auto"
            >
              {isFull ? t('tournament.full') : tournament.status !== 'registration_open' ? t('tournament.closed') : t('tournament.join')}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showJoinDialog}
        title="Confirm registration"
        loading={joining}
        onCancel={() => setShowJoinDialog(false)}
        onConfirm={handleConfirmJoin}
        confirmLabel={joining ? 'Joining…' : 'Confirm & Pay Entry'}
        description={
          <JoinForm
            freeFireUid={freeFireUid}
            setFreeFireUid={setFreeFireUid}
            freeFireNickname={freeFireNickname}
            setFreeFireNickname={setFreeFireNickname}
            teamName={teamName}
            setTeamName={setTeamName}
            isSquad={tournament.mode?.toLowerCase() !== 'solo'}
            entryFee={tournament.entryFee}
          />
        }
      />
    </div>
  )
}

function Stat({ icon: Icon, label, value, mono, accent }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-ink-faint">
        <Icon size={13} className="text-edge-cyan" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className={`mt-1 text-sm font-semibold ${mono ? 'stat-mono' : ''} ${accent ? 'text-edge' : 'text-ink'}`}>{value}</p>
    </div>
  )
}

function JoinForm({ freeFireUid, setFreeFireUid, freeFireNickname, setFreeFireNickname, teamName, setTeamName, isSquad, entryFee }) {
  return (
    <div className="mt-2 space-y-3 text-left">
      <p className="text-sm text-ink-muted">
        Entry fee <span className="stat-mono text-ink">{formatMGA(entryFee)}</span> will be deducted from your wallet.
      </p>
      <input
        placeholder="Free Fire UID"
        value={freeFireUid}
        onChange={(e) => setFreeFireUid(e.target.value)}
        className="input-field text-sm"
      />
      <input
        placeholder="Free Fire nickname"
        value={freeFireNickname}
        onChange={(e) => setFreeFireNickname(e.target.value)}
        className="input-field text-sm"
      />
      {isSquad && (
        <input
          placeholder="Team name (optional)"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="input-field text-sm"
        />
      )}
    </div>
  )
}
