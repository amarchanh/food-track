import { useMemo } from 'react'
import { useAppStore } from '../store'
import { scaleMacros, sumMacros } from '../utils/nutrition'
import { formatDateLabel, todayKey } from '../utils/date'
import { ProgressBar } from '../components/ProgressBar'

export function HistoryView() {
  const logsByDate = useAppStore((s) => s.logsByDate)
  const goals = useAppStore((s) => s.goals)
  const today = todayKey()

  const days = useMemo(
    () =>
      Object.entries(logsByDate)
        .filter(([date, entries]) => date !== today && entries.length > 0)
        .sort(([a], [b]) => (a < b ? 1 : -1))
        .slice(0, 30),
    [logsByDate, today],
  )

  if (days.length === 0) {
    return (
      <div className="card">
        <h2>Historial</h2>
        <p className="empty-state">Todavía no hay días anteriores registrados.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Historial</h2>
      {days.map(([date, entries]) => {
        const totals = sumMacros(entries.map((e) => scaleMacros(e.food.per100, e.grams)))
        return (
          <div className="macro-row" key={date}>
            <div className="stat-tile">
              <span className="label" style={{ textTransform: 'capitalize' }}>
                {formatDateLabel(date)}
              </span>
              <span className="value">
                {Math.round(totals.kcal)} / {goals.dailyKcal} kcal
              </span>
            </div>
            <ProgressBar value={totals.kcal} max={goals.dailyKcal} color="var(--brand)" />
          </div>
        )
      })}
    </div>
  )
}
