export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Macros {
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface FoodItem {
  id: string
  name: string
  brand?: string
  /** Nutrition per 100 g (or per 100 ml for liquids). */
  per100: Macros
  source: 'off' | 'custom'
}

export interface LogEntry {
  id: string
  foodId: string
  food: FoodItem
  grams: number
  slot: MealSlot
  loggedAt: string // ISO timestamp
}

export interface FridgeItem {
  id: string
  food: FoodItem
  /** Grams the user estimates they currently have available. */
  gramsAvailable: number
}

export type MacroSplit = {
  proteinPct: number
  carbsPct: number
  fatPct: number
}

export interface Goals {
  dailyKcal: number
  split: MacroSplit
}

export interface DayLog {
  date: string // YYYY-MM-DD
  entries: LogEntry[]
}
