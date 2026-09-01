import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo size="lg" />
      <div>
        <p className="font-display text-6xl font-bold text-edge-blue glow-text">404</p>
        <p className="mt-2 text-ink-muted">This match doesn't exist.</p>
      </div>
      <Link to="/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  )
}
