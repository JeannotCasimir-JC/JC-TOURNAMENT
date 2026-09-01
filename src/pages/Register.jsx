import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { registerUser, isSupabaseConfigured } from '../lib/supabase'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { isValidEmail, isStrongEnoughPassword } from '../utils/validators'
import { BackendNotConfigured } from '../components/States'

export default function Register() {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', username: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValidEmail(form.email)) return showToast('Enter a valid email address.', 'error')
    if (!isStrongEnoughPassword(form.password)) return showToast('Password must be at least 6 characters.', 'error')
    if (!form.username.trim()) return showToast('Choose a username.', 'error')

    setLoading(true)
    try {
      await registerUser(form)
      showToast('Account created — welcome to JC TOURNAMENT.', 'success')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupabaseConfigured) {
    return <BackendNotConfigured feature="Registration" />
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">{t('auth.register')}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input required placeholder={t('auth.fullName')} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className="input-field" />
        <input required placeholder={t('auth.username')} value={form.username} onChange={(e) => update('username', e.target.value)} className="input-field" />
        <input type="email" required placeholder={t('auth.email')} value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" />
        <input placeholder={t('auth.phone')} value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" />
        <input type="password" required placeholder={t('auth.password')} value={form.password} onChange={(e) => update('password', e.target.value)} className="input-field" />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t('auth.register')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-edge-blue hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  )
}
