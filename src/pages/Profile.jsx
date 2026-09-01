import { useEffect, useState } from 'react'
import { Trophy, Skull, Swords, Coins, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateUserProfile } from '../lib/supabase'
import { formatMGA, formatDateTime } from '../utils/formatCurrency'

export default function Profile() {
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ fullName: '', username: '', phone: '', freeFireUid: '', freeFireNickname: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setForm({
      fullName: profile.fullName || '',
      username: profile.username || '',
      phone: profile.phone || '',
      freeFireUid: profile.freeFireUid || '',
      freeFireNickname: profile.freeFireNickname || '',
    })
  }, [profile])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUserProfile(user.uid, form)
      showToast('Profile updated.', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const stats = profile?.stats || { tournamentsPlayed: 0, wins: 0, kills: 0, totalWinnings: 0 }

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">My Profile</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Swords} label="Tournaments" value={stats.tournamentsPlayed} />
        <StatCard icon={Trophy} label="Wins" value={stats.wins} accent />
        <StatCard icon={Skull} label="Kills" value={stats.kills} />
        <StatCard icon={Coins} label="Total winnings" value={formatMGA(stats.totalWinnings)} accent />
      </div>

      <form onSubmit={handleSave} className="hud-card space-y-4 p-6">
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-ink-faint">Account details</p>
        <Field label="Full name" value={form.fullName} onChange={(v) => update('fullName', v)} />
        <Field label="Username" value={form.username} onChange={(v) => update('username', v)} />
        <Field label="Email" value={profile?.email || ''} disabled />
        <Field label="Phone number" value={form.phone} onChange={(v) => update('phone', v)} />

        <p className="pt-2 font-display text-sm font-semibold uppercase tracking-wider text-ink-faint">Free Fire details</p>
        <Field label="Free Fire UID" value={form.freeFireUid} onChange={(v) => update('freeFireUid', v)} />
        <Field label="Free Fire nickname" value={form.freeFireNickname} onChange={(v) => update('freeFireNickname', v)} />

        <p className="text-xs text-ink-faint">
          Member since {formatDateTime(profile?.createdAt)}
        </p>

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving && <Loader2 size={16} className="animate-spin" />}
          Save changes
        </button>
      </form>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="hud-card p-4">
      <div className="flex items-center gap-1.5 text-ink-faint">
        <Icon size={14} className="text-edge-cyan" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className={`mt-1.5 stat-mono text-xl font-bold ${accent ? 'text-edge' : 'text-ink'}`}>{value}</p>
    </div>
  )
}

function Field({ label, value, onChange, disabled }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-ink-faint">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="input-field disabled:opacity-50"
      />
    </label>
  )
}
