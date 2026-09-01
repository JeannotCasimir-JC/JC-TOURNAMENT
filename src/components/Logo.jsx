export default function Logo({ size = 'md' }) {
  const dims = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-edge-blue to-edge shadow-glow">
        <span className="font-display text-sm font-bold text-white">JC</span>
      </div>
      <div className="leading-none">
        <p className={`font-display font-bold tracking-wide text-ink ${dims}`}>
          JC <span className="glow-text text-edge-blue">TOURNAMENT</span>
        </p>
        <p className="text-[10px] font-mono tracking-[0.25em] text-ink-faint">PLAY · COMPETE · WIN</p>
      </div>
    </div>
  )
}
