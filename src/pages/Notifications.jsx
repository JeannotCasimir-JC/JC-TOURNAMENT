import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listenNotifications, markNotificationRead, isSupabaseConfigured } from '../lib/supabase'
import { formatDateTime } from '../utils/formatCurrency'
import { EmptyState, BackendNotConfigured } from '../components/States'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(null)

  useEffect(() => {
    if (!user) return
    const unsub = listenNotifications(user.uid, setNotifications)
    return unsub
  }, [user])

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink">Notifications</h1>

      <div className="mt-6">
        {!isSupabaseConfigured ? (
          <BackendNotConfigured feature="Notifications" />
        ) : notifications === null ? (
          <div className="hud-card h-40 animate-pulse-slow" />
        ) : notifications.length === 0 ? (
          <EmptyState icon={BellOff} title="You're all caught up" description="Tournament updates, results, and wallet alerts will appear here." />
        ) : (
          <div className="hud-card divide-y divide-white/5">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] ${!n.read ? 'bg-edge-blue/[0.03]' : ''}`}
              >
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.read ? 'bg-edge-blue/15 text-edge-blue' : 'bg-white/5 text-ink-faint'}`}>
                  <Bell size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="text-sm text-ink-muted">{n.body}</p>
                  <p className="mt-1 text-xs text-ink-faint">{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-edge-blue" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
