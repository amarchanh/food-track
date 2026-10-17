import { useState } from 'react'
import { useAppStore } from '../store'
import { macroTargetsFromGoals } from '../utils/nutrition'

export function GoalsView() {
  const goals = useAppStore((s) => s.goals)
  const setGoals = useAppStore((s) => s.setGoals)

  const [dailyKcal, setDailyKcal] = useState(goals.dailyKcal)
  const [proteinPct, setProteinPct] = useState(goals.split.proteinPct)
  const [carbsPct, setCarbsPct] = useState(goals.split.carbsPct)
  const [fatPct, setFatPct] = useState(goals.split.fatPct)

  const total = proteinPct + carbsPct + fatPct
  const valid = total === 100 && dailyKcal > 0

  const preview = macroTargetsFromGoals({
    dailyKcal,
    split: { proteinPct, carbsPct, fatPct },
  })

  function save() {
    if (!valid) return
    setGoals({ dailyKcal, split: { proteinPct, carbsPct, fatPct } })
  }

  function applyPreset(p: number, c: number, f: number) {
    setProteinPct(p)
    setCarbsPct(c)
    setFatPct(f)
  }

  return (
    <div className="card">
      <h2>Objetivos diarios</h2>
      <div className="field">
        <label>Calorías al día (kcal)</label>
        <input type="number" value={dailyKcal} onChange={(e) => setDailyKcal(Number(e.target.value) || 0)} />
      </div>

      <div className="section-title">Reparto de macros (% de las calorías)</div>
      <div className="field">
        <label>Proteína</label>
        <input type="number" value={proteinPct} onChange={(e) => setProteinPct(Number(e.target.value) || 0)} />
      </div>
      <div className="field">
        <label>Carbohidratos</label>
        <input type="number" value={carbsPct} onChange={(e) => setCarbsPct(Number(e.target.value) || 0)} />
      </div>
      <div className="field">
        <label>Grasas</label>
        <input type="number" value={fatPct} onChange={(e) => setFatPct(Number(e.target.value) || 0)} />
      </div>

      {total !== 100 && (
        <p className="entry-meta" style={{ color: 'var(--status-critical)' }}>
          El reparto suma {total}%, debe sumar 100%.
        </p>
      )}

      <div className="slot-select">
        <button onClick={() => applyPreset(30, 40, 30)}>Equilibrado</button>
        <button onClick={() => applyPreset(40, 30, 30)}>Alta proteína</button>
        <button onClick={() => applyPreset(25, 50, 25)}>Alta en carbos</button>
        <button onClick={() => applyPreset(30, 20, 50)}>Low carb</button>
      </div>

      <p className="entry-meta">
        Objetivo resultante: P {Math.round(preview.proteinG)}g · C {Math.round(preview.carbsG)}g · G{' '}
        {Math.round(preview.fatG)}g
      </p>

      <button className="btn-primary" disabled={!valid} onClick={save}>
        Guardar objetivos
      </button>
    </div>
  )
}
