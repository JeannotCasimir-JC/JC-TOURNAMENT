import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { loginUser, loginWithGoogle, isSupabaseConfigured } from '../lib/supabase'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { BackendNotConfigured } from '../components/States'

export default function Login() {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await loginUser(email, password)
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupabaseConfigured) {
    return <BackendNotConfigured feature="Login" />
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">{t('auth.login')}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          required
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-edge-blue hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t('auth.login')}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-ink-faint">{t('auth.orContinueWith')}</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button onClick={handleGoogle} disabled={loading} className="btn-secondary w-full">
        {t('auth.google')}
      </button>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-edge-blue hover:underline">
          {t('auth.register')}
        </Link>
      </p>
    </div>
  )
}
