import { useMemo, useState } from 'react'
import { useAppStore, useTodayEntries } from '../store'
import { FoodSearchSheet } from '../components/FoodSearchSheet'
import { macroTargetsFromGoals, scaleMacros, suggestMeal, sumMacros } from '../utils/nutrition'
import type { MealSlot } from '../types'
import { todayKey } from '../utils/date'

const SLOTS: { key: MealSlot; label: string }[] = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'lunch', label: 'Comida' },
  { key: 'dinner', label: 'Cena' },
  { key: 'snack', label: 'Snack' },
]

export function FridgeView() {
  const fridge = useAppStore((s) => s.fridge)
  const addFridgeItem = useAppStore((s) => s.addFridgeItem)
  const updateFridgeGrams = useAppStore((s) => s.updateFridgeGrams)
  const removeFridgeItem = useAppStore((s) => s.removeFridgeItem)
  const goals = useAppStore((s) => s.goals)
  const addLogEntry = useAppStore((s) => s.addLogEntry)
  const consumeFridgeForSuggestion = useAppStore((s) => s.consumeFridgeForSuggestion)
  const todayEntries = useTodayEntries()

  const [searchOpen, setSearchOpen] = useState(false)
  const [slotForSuggestion, setSlotForSuggestion] = useState<MealSlot>('lunch')

  const remaining = useMemo(() => {
    const consumed = sumMacros(todayEntries.map((e) => scaleMacros(e.food.per100, e.grams)))
    const targets = macroTargetsFromGoals(goals)
    return {
      kcal: Math.max(0, goals.dailyKcal - consumed.kcal),
      protein: Math.max(0, targets.proteinG - consumed.protein),
      carbs: Math.max(0, targets.carbsG - consumed.carbs),
      fat: Math.max(0, targets.fatG - consumed.fat),
    }
  }, [todayEntries, goals])

  const suggestion = useMemo(
    () => suggestMeal(fridge.map((f) => ({ food: f.food, gramsAvailable: f.gramsAvailable })), remaining),
    [fridge, remaining],
  )

  function logSuggestion() {
    if (!suggestion) return
    for (const item of suggestion.items) {
      addLogEntry(todayKey(), item.food, item.grams, slotForSuggestion)
    }
    consumeFridgeForSuggestion(suggestion.items.map((i) => ({ foodId: i.food.id, grams: i.grams })))
  }

  return (
    <>
      <div className="card">
        <h2>Sugerencia saciante</h2>
        <p className="entry-meta" style={{ marginTop: -6, marginBottom: 12 }}>
          Con lo que tienes en la nevera, ajustado a lo que te queda hoy: {Math.round(remaining.kcal)} kcal
          · P {Math.round(remaining.protein)}g · C {Math.round(remaining.carbs)}g · G{' '}
          {Math.round(remaining.fat)}g
        </p>

        {!suggestion && <p className="empty-state">Añade alimentos a la nevera para recibir una propuesta.</p>}

        {suggestion && (
          <>
            {suggestion.items.map((item) => (
              <div className="entry-row" key={item.food.id}>
                <div>
                  <div className="entry-name">{item.food.name}</div>
                  <div className="entry-meta">
                    {item.grams} g · {Math.round(item.macros.kcal)} kcal
                  </div>
                </div>
              </div>
            ))}
            <p className="suggestion-score">
              Total: {Math.round(suggestion.totals.kcal)} kcal · P {Math.round(suggestion.totals.protein)}g · C{' '}
              {Math.round(suggestion.totals.carbs)}g · G {Math.round(suggestion.totals.fat)}g
            </p>
            <div className="slot-select" style={{ marginTop: 12 }}>
              {SLOTS.map((s) => (
                <button
                  key={s.key}
                  className={slotForSuggestion === s.key ? 'active' : ''}
                  onClick={() => setSlotForSuggestion(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={logSuggestion}>
              Registrar esta combinación
            </button>
          </>
        )}
      </div>

      <div className="card">
        <h2>Lo que hay en la nevera</h2>
        {fridge.length === 0 && <p className="empty-state">Tu nevera está vacía</p>}
        {fridge.map((item) => (
          <div className="fridge-item" key={item.id}>
            <div>
              <div className="entry-name">{item.food.name}</div>
              <div className="entry-meta">{Math.round(item.food.per100.kcal)} kcal/100g</div>
            </div>
            <input
              className="gram-input"
              type="number"
              value={item.gramsAvailable}
              onChange={(e) => updateFridgeGrams(item.id, Number(e.target.value) || 0)}
            />
            <button className="icon-btn" aria-label="Quitar" onClick={() => removeFridgeItem(item.id)}>
              ✕
            </button>
          </div>
        ))}
        <button className="btn-secondary" style={{ width: '100%', marginTop: 10 }} onClick={() => setSearchOpen(true)}>
          + Añadir a la nevera
        </button>
      </div>

      {searchOpen && (
        <FoodSearchSheet
          title="Añadir a la nevera"
          confirmLabel="Añadir"
          onClose={() => setSearchOpen(false)}
          onConfirm={(food, grams) => addFridgeItem(food, grams)}
        />
      )}
    </>
  )
}
