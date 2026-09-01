export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
      <div className="hud-card w-full max-w-sm p-6 animate-slide-up">
        <p className="font-display text-lg font-semibold text-ink">{title}</p>
        {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 text-sm" disabled={loading}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-display font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 ${
              danger ? 'bg-loss shadow-[0_0_20px_rgba(255,93,108,0.35)]' : 'bg-gradient-to-r from-edge-blue to-edge shadow-glow'
            }`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
