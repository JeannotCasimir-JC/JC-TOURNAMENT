import { Inbox, AlertTriangle, WifiOff } from 'lucide-react'

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="hud-card p-5 animate-pulse-slow">
          <div className="h-4 w-2/3 rounded bg-white/10 mb-4" />
          <div className="h-3 w-1/2 rounded bg-white/5 mb-6" />
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="h-8 rounded bg-white/5" />
            <div className="h-8 rounded bg-white/5" />
          </div>
          <div className="h-10 w-full rounded-xl bg-white/5" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="hud-card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-ink-faint">
        <Icon size={22} />
      </div>
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="hud-card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <AlertTriangle size={22} className="text-loss" />
      <p className="text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Try again
        </button>
      )}
    </div>
  )
}

export function BackendNotConfigured({ feature = 'This feature' }) {
  return (
    <div className="hud-card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <WifiOff size={22} className="text-pending" />
      <p className="font-display text-base font-semibold text-ink">Backend not configured</p>
      <p className="max-w-sm text-sm text-ink-muted">
        {feature} needs a connected Supabase project. Add your credentials to <code className="stat-mono text-edge-cyan">.env.local</code> and restart the dev server.
      </p>
    </div>
  )
}
