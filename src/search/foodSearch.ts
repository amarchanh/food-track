import type { FoodItem } from '../types'
import { FOOD_DATABASE } from '../data/foods'

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Ranks a name match: exact match, then "starts with", then "a word starts
 * with it" (so "pollo" ranks "Pechuga de pollo" above "Repollo", even though
 * the latter contains "pollo" earlier as a substring), then any substring.
 */
function matchScore(name: string, query: string): number | null {
  if (name === query) return 0
  if (name.startsWith(query)) return 1
  if (name.split(/[^a-z0-9]+/).some((word) => word.startsWith(query))) return 2
  if (name.includes(query)) return 3
  return null
}

/** Searches the bundled local food database. Instant, no network involved. */
export function searchFoods(query: string): FoodItem[] {
  const q = normalize(query)
  if (q.length < 2) return []

  return FOOD_DATABASE.map((food) => {
    const score = matchScore(normalize(food.name), q)
    return score === null ? null : { food, score }
  })
    .filter((x): x is { food: FoodItem; score: number } => x !== null)
    .sort((a, b) => a.score - b.score || a.food.name.localeCompare(b.food.name))
    .slice(0, 25)
    .map((x) => x.food)
}
