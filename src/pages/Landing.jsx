import { Link, Navigate } from 'react-router-dom'
import { Trophy, Shield, Zap } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user, loading } = useAuth()

  if (!loading && user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary text-sm">Log in</Link>
          <Link to="/register" className="btn-primary text-sm">Sign up</Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center animate-slide-up">
        <span className="font-mono text-xs tracking-[0.3em] text-edge-cyan">FREE FIRE ESPORTS PLATFORM</span>
        <h1 className="mt-4 font-display text-4xl font-bold text-ink sm:text-6xl">
          PLAY <span className="text-edge-blue">·</span> COMPETE <span className="text-edge">·</span> WIN
        </h1>
        <p className="mt-4 max-w-xl text-ink-muted">
          Join JC TOURNAMENT to compete in Free Fire tournaments, climb the leaderboard, and get paid out for real wins.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/register" className="btn-primary">Create account</Link>
          <Link to="/tournaments" className="btn-secondary">Browse tournaments</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
        <Feature icon={Trophy} title="Real prize pools" desc="Entry fees fund transparent prize pools with per-kill and Booyah rewards." />
        <Feature icon={Shield} title="Secure wallet" desc="Manual, admin-verified Airtel Money deposits and withdrawals — no surprises." />
        <Feature icon={Zap} title="Live match center" desc="Room ID and password unlock right before match start, every time." />
      </section>
    </div>
  )
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="hud-card p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-edge-blue to-edge shadow-glow">
        <Icon size={18} className="text-white" />
      </div>
      <p className="font-display font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{desc}</p>
    </div>
  )
}
