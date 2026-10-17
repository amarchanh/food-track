import type { FoodItem, Goals, Macros } from '../types'

export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const

export function emptyMacros(): Macros {
  return { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
}

export function scaleMacros(per100: Macros, grams: number): Macros {
  const factor = grams / 100
  return {
    kcal: per100.kcal * factor,
    protein: per100.protein * factor,
    carbs: per100.carbs * factor,
    fat: per100.fat * factor,
    fiber: per100.fiber * factor,
  }
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      fiber: acc.fiber + m.fiber,
    }),
    emptyMacros(),
  )
}

/** Grams of each macro implied by a daily calorie goal and a %-of-calories split. */
export function macroTargetsFromGoals(goals: Goals) {
  const { dailyKcal, split } = goals
  return {
    proteinG: (dailyKcal * (split.proteinPct / 100)) / KCAL_PER_G.protein,
    carbsG: (dailyKcal * (split.carbsPct / 100)) / KCAL_PER_G.carbs,
    fatG: (dailyKcal * (split.fatPct / 100)) / KCAL_PER_G.fat,
  }
}

/**
 * Satiety score per kcal: protein and fiber keep you full for longer per
 * calorie spent, so we rank foods by how much of each they pack relative to
 * their energy density. Weights follow the rough ordering from satiety-index
 * research (protein > fiber > carbs/fat for fullness per calorie).
 */
export function satietyScore(per100: Macros): number {
  if (per100.kcal <= 0) return 0
  return (per100.protein * 3 + per100.fiber * 2.5) / per100.kcal
}

export interface RemainingBudget {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface SuggestedItem {
  food: FoodItem
  grams: number
  macros: Macros
}

export interface Suggestion {
  items: SuggestedItem[]
  totals: Macros
  score: number
}

/**
 * Greedy knapsack-style picker: ranks fridge foods by satiety-per-kcal, then
 * fills the remaining calorie budget portion by portion (in 10 g steps),
 * skipping a food once adding more of it would blow the macro budget by more
 * than 15%. This favors combos that are both filling and macro-compliant
 * over a perfect but less satiating optimum.
 */
export function suggestMeal(
  fridge: { food: FoodItem; gramsAvailable: number }[],
  remaining: RemainingBudget,
  maxItems = 4,
): Suggestion | null {
  if (fridge.length === 0 || remaining.kcal <= 0) return null

  const ranked = [...fridge]
    .filter((f) => f.gramsAvailable > 0 && f.food.per100.kcal > 0)
    .sort((a, b) => satietyScore(b.food.per100) - satietyScore(a.food.per100))
    .slice(0, Math.max(maxItems * 2, maxItems))

  const picked = new Map<string, number>()
  let totals = emptyMacros()
  const STEP_G = 10
  const overshootTolerance = 1.15

  let guard = 0
  while (totals.kcal < remaining.kcal * 0.92 && guard < 2000) {
    guard++
    let bestId: string | null = null
    let bestFood: FoodItem | null = null
    let bestGramsLeft = 0

    for (const entry of ranked) {
      const used = picked.get(entry.food.id) ?? 0
      const left = entry.gramsAvailable - used
      if (left < STEP_G) continue
      if (picked.size >= maxItems && !picked.has(entry.food.id)) continue

      const trialMacros = scaleMacros(entry.food.per100, STEP_G)
      const projected = {
        kcal: totals.kcal + trialMacros.kcal,
        protein: totals.protein + trialMacros.protein,
        carbs: totals.carbs + trialMacros.carbs,
        fat: totals.fat + trialMacros.fat,
      }
      const withinKcal = projected.kcal <= remaining.kcal * overshootTolerance
      const withinProtein = projected.protein <= remaining.protein * overshootTolerance + 5
      const withinCarbs = projected.carbs <= remaining.carbs * overshootTolerance + 5
      const withinFat = projected.fat <= remaining.fat * overshootTolerance + 5
      if (withinKcal && withinProtein && withinCarbs && withinFat) {
        bestId = entry.food.id
        bestFood = entry.food
        bestGramsLeft = left
        break // ranked is already in priority order
      }
    }

    if (!bestId || !bestFood) break
    picked.set(bestId, (picked.get(bestId) ?? 0) + Math.min(STEP_G, bestGramsLeft))
    totals = sumMacros(
      [...picked.entries()].map(([id, grams]) => {
        const f = ranked.find((r) => r.food.id === id)!.food
        return scaleMacros(f.per100, grams)
      }),
    )
  }

  if (picked.size === 0) return null

  const items: SuggestedItem[] = [...picked.entries()].map(([id, grams]) => {
    const food = ranked.find((r) => r.food.id === id)!.food
    return { food, grams, macros: scaleMacros(food.per100, grams) }
  })

  const score = items.reduce((acc, it) => acc + satietyScore(it.food.per100) * it.macros.kcal, 0)

  return { items, totals, score }
}
