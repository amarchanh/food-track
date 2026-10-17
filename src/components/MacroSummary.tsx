import type { Macros } from '../types'
import { macroTargetsFromGoals } from '../utils/nutrition'
import { useAppStore } from '../store'
import { ProgressBar } from './ProgressBar'

interface Props {
  consumed: Macros
}

function statusFor(consumedKcal: number, goalKcal: number): 'good' | 'warning' | 'critical' {
  if (goalKcal <= 0) return 'good'
  const pct = consumedKcal / goalKcal
  if (pct > 1.1) return 'critical'
  if (pct > 1) return 'warning'
  return 'good'
}

export function MacroSummary({ consumed }: Props) {
  const goals = useAppStore((s) => s.goals)
  const targets = macroTargetsFromGoals(goals)
  const remainingKcal = Math.round(goals.dailyKcal - consumed.kcal)
  const status = statusFor(consumed.kcal, goals.dailyKcal)
  const statusLabel =
    status === 'critical' ? 'Superado' : status === 'warning' ? 'Al límite' : 'En objetivo'

  return (
    <div className="card">
      <h2>Hoy</h2>
      <div className="kcal-ring-wrap">
        <div>
          <div className="kcal-figure">{Math.round(consumed.kcal)}</div>
          <div className="kcal-sub">
            de {goals.dailyKcal} kcal · {remainingKcal >= 0 ? `${remainingKcal} restantes` : `${-remainingKcal} de más`}
          </div>
        </div>
        <span className={`pill ${status}`}>{statusLabel}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <ProgressBar value={consumed.kcal} max={goals.dailyKcal} color="var(--brand)" />
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="macro-row">
          <div className="stat-tile">
            <span className="label">Proteína</span>
            <span className="value">
              {Math.round(consumed.protein)} / {Math.round(targets.proteinG)} g
            </span>
          </div>
          <ProgressBar value={consumed.protein} max={targets.proteinG} color="var(--series-protein)" />
        </div>
        <div className="macro-row">
          <div className="stat-tile">
            <span className="label">Carbohidratos</span>
            <span className="value">
              {Math.round(consumed.carbs)} / {Math.round(targets.carbsG)} g
            </span>
          </div>
          <ProgressBar value={consumed.carbs} max={targets.carbsG} color="var(--series-carbs)" />
        </div>
        <div className="macro-row">
          <div className="stat-tile">
            <span className="label">Grasas</span>
            <span className="value">
              {Math.round(consumed.fat)} / {Math.round(targets.fatG)} g
            </span>
          </div>
          <ProgressBar value={consumed.fat} max={targets.fatG} color="var(--series-fat)" />
        </div>
      </div>
    </div>
  )
}
