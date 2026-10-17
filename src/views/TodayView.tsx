import { useMemo, useState } from 'react'
import { useAppStore, useTodayEntries } from '../store'
import { scaleMacros, sumMacros } from '../utils/nutrition'
import { MacroSummary } from '../components/MacroSummary'
import { FoodSearchSheet } from '../components/FoodSearchSheet'
import type { MealSlot } from '../types'
import { todayKey } from '../utils/date'

const SLOTS: { key: MealSlot; label: string }[] = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'lunch', label: 'Comida' },
  { key: 'dinner', label: 'Cena' },
  { key: 'snack', label: 'Snack' },
]

export function TodayView() {
  const entries = useTodayEntries()
  const addLogEntry = useAppStore((s) => s.addLogEntry)
  const removeLogEntry = useAppStore((s) => s.removeLogEntry)
  const [searchOpenFor, setSearchOpenFor] = useState<MealSlot | null>(null)

  const consumed = useMemo(
    () => sumMacros(entries.map((e) => scaleMacros(e.food.per100, e.grams))),
    [entries],
  )

  return (
    <>
      <MacroSummary consumed={consumed} />

      {SLOTS.map((slot) => {
        const slotEntries = entries.filter((e) => e.slot === slot.key)
        return (
          <div className="card" key={slot.key}>
            <h2>{slot.label}</h2>
            {slotEntries.length === 0 && <p className="empty-state">Nada registrado</p>}
            {slotEntries.map((entry) => (
              <div className="entry-row" key={entry.id}>
                <div>
                  <div className="entry-name">{entry.food.name}</div>
                  <div className="entry-meta">
                    {entry.grams} g · {Math.round((entry.food.per100.kcal * entry.grams) / 100)} kcal
                  </div>
                </div>
                <button
                  className="icon-btn"
                  aria-label="Eliminar"
                  onClick={() => removeLogEntry(todayKey(), entry.id)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="btn-secondary"
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => setSearchOpenFor(slot.key)}
            >
              + Añadir alimento
            </button>
          </div>
        )
      })}

      {searchOpenFor && (
        <FoodSearchSheet
          title={`Añadir a ${SLOTS.find((s) => s.key === searchOpenFor)!.label.toLowerCase()}`}
          confirmLabel="Registrar"
          onClose={() => setSearchOpenFor(null)}
          onConfirm={(food, grams) => addLogEntry(todayKey(), food, grams, searchOpenFor)}
        />
      )}
    </>
  )
}
