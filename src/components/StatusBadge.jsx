const STATUS_STYLES = {
  upcoming: 'bg-edge-blue/10 text-edge-blue border-edge-blue/30',
  registration_open: 'bg-win/10 text-win border-win/30',
  ongoing: 'bg-pending/10 text-pending border-pending/30 animate-pulse-slow',
  completed: 'bg-white/5 text-ink-muted border-white/10',
  pending: 'bg-pending/10 text-pending border-pending/30',
  approved: 'bg-win/10 text-win border-win/30',
  paid: 'bg-win/10 text-win border-win/30',
  processing: 'bg-edge-blue/10 text-edge-blue border-edge-blue/30',
  rejected: 'bg-loss/10 text-loss border-loss/30',
  registered: 'bg-edge/10 text-edge border-edge/30',
}

const LABELS = {
  upcoming: 'Upcoming',
  registration_open: 'Registration Open',
  ongoing: 'Ongoing',
  completed: 'Completed',
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  processing: 'Processing',
  rejected: 'Rejected',
  registered: 'Registered',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-white/5 text-ink-muted border-white/10'
  const label = LABELS[status] || status
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-display font-semibold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  )
}
