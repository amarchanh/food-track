interface ProgressBarProps {
  value: number
  max: number
  color: string
}

export function ProgressBar({ value, max, color }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const over = max > 0 && value > max
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${pct}%`, background: over ? 'var(--status-warning)' : color }}
      />
    </div>
  )
}
