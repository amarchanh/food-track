import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FoodItem, FridgeItem, Goals, LogEntry, MealSlot } from './types'
import { todayKey } from './utils/date'

interface AppState {
  goals: Goals
  logsByDate: Record<string, LogEntry[]>
  fridge: FridgeItem[]
  customFoods: FoodItem[]

  setGoals: (goals: Goals) => void
  addLogEntry: (date: string, food: FoodItem, grams: number, slot: MealSlot) => void
  updateLogEntryGrams: (date: string, entryId: string, grams: number) => void
  removeLogEntry: (date: string, entryId: string) => void

  addFridgeItem: (food: FoodItem, grams: number) => void
  updateFridgeGrams: (id: string, grams: number) => void
  removeFridgeItem: (id: string) => void

  addCustomFood: (food: FoodItem) => void
  consumeFridgeForSuggestion: (consumed: { foodId: string; grams: number }[]) => void
}

const DEFAULT_GOALS: Goals = {
  dailyKcal: 2000,
  split: { proteinPct: 30, carbsPct: 40, fatPct: 30 },
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      goals: DEFAULT_GOALS,
      logsByDate: {},
      fridge: [],
      customFoods: [],

      setGoals: (goals) => set({ goals }),

      addLogEntry: (date, food, grams, slot) =>
        set((state) => {
          const entry: LogEntry = {
            id: crypto.randomUUID(),
            foodId: food.id,
            food,
            grams,
            slot,
            loggedAt: new Date().toISOString(),
          }
          const existing = state.logsByDate[date] ?? []
          return { logsByDate: { ...state.logsByDate, [date]: [...existing, entry] } }
        }),

      updateLogEntryGrams: (date, entryId, grams) =>
        set((state) => {
          const existing = state.logsByDate[date] ?? []
          return {
            logsByDate: {
              ...state.logsByDate,
              [date]: existing.map((e) => (e.id === entryId ? { ...e, grams } : e)),
            },
          }
        }),

      removeLogEntry: (date, entryId) =>
        set((state) => {
          const existing = state.logsByDate[date] ?? []
          return {
            logsByDate: {
              ...state.logsByDate,
              [date]: existing.filter((e) => e.id !== entryId),
            },
          }
        }),

      addFridgeItem: (food, grams) =>
        set((state) => {
          const existing = state.fridge.find((f) => f.food.id === food.id)
          if (existing) {
            return {
              fridge: state.fridge.map((f) =>
                f.food.id === food.id ? { ...f, gramsAvailable: f.gramsAvailable + grams } : f,
              ),
            }
          }
          const item: FridgeItem = { id: crypto.randomUUID(), food, gramsAvailable: grams }
          return { fridge: [...state.fridge, item] }
        }),

      updateFridgeGrams: (id, grams) =>
        set((state) => ({
          fridge: state.fridge.map((f) => (f.id === id ? { ...f, gramsAvailable: grams } : f)),
        })),

      removeFridgeItem: (id) =>
        set((state) => ({ fridge: state.fridge.filter((f) => f.id !== id) })),

      addCustomFood: (food) =>
        set((state) => ({ customFoods: [food, ...state.customFoods].slice(0, 100) })),

      consumeFridgeForSuggestion: (consumed) =>
        set((state) => ({
          fridge: state.fridge
            .map((f) => {
              const used = consumed.find((c) => c.foodId === f.food.id)
              if (!used) return f
              return { ...f, gramsAvailable: Math.max(0, f.gramsAvailable - used.grams) }
            })
            .filter((f) => f.gramsAvailable > 0),
        })),
    }),
    { name: 'foottrack-storage' },
  ),
)

const EMPTY_ENTRIES: LogEntry[] = []

export function useTodayEntries() {
  const date = todayKey()
  return useAppStore((s) => s.logsByDate[date] ?? EMPTY_ENTRIES)
}
