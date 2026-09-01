import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { resetPassword, isSupabaseConfigured } from '../lib/supabase'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { BackendNotConfigured } from '../components/States'

export default function ForgotPassword() {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupabaseConfigured) {
    return <BackendNotConfigured feature="Password reset" />
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 size={32} className="text-win" />
        <p className="text-sm text-ink-muted">{t('auth.resetSent')}</p>
        <Link to="/login" className="mt-2 text-sm font-semibold text-edge-blue hover:underline">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">{t('auth.forgotPassword')}</h1>
      <p className="mt-2 text-sm text-ink-muted">Enter your account email and we'll send a reset link.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t('common.submit')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link to="/login" className="font-semibold text-edge-blue hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
