import type { FoodItem, Macros } from '../types'

interface OffProduct {
  code: string
  product_name?: string
  product_name_es?: string
  brands?: string
  nutriments?: Record<string, number>
}

interface OffSearchResponse {
  products: OffProduct[]
}

function toMacros(n: Record<string, number> | undefined): Macros {
  return {
    kcal: n?.['energy-kcal_100g'] ?? n?.['energy-kcal'] ?? 0,
    protein: n?.['proteins_100g'] ?? 0,
    carbs: n?.['carbohydrates_100g'] ?? 0,
    fat: n?.['fat_100g'] ?? 0,
    fiber: n?.['fiber_100g'] ?? 0,
  }
}

/**
 * Searches Open Food Facts (free, no API key) for foods by name. Filters out
 * products with no usable calorie data, since those are useless for tracking.
 */
export async function searchFoods(query: string, signal?: AbortSignal): Promise<FoodItem[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl')
  url.searchParams.set('search_terms', trimmed)
  url.searchParams.set('search_simple', '1')
  url.searchParams.set('action', 'process')
  url.searchParams.set('json', '1')
  url.searchParams.set('page_size', '20')
  url.searchParams.set(
    'fields',
    'code,product_name,product_name_es,brands,nutriments',
  )

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) throw new Error(`Open Food Facts respondió ${res.status}`)
  const data: OffSearchResponse = await res.json()

  const seen = new Set<string>()
  const items: FoodItem[] = []
  for (const p of data.products ?? []) {
    const name = p.product_name_es || p.product_name
    const macros = toMacros(p.nutriments)
    if (!name || macros.kcal <= 0) continue
    const key = name.toLowerCase() + (p.brands ?? '')
    if (seen.has(key)) continue
    seen.add(key)
    items.push({
      id: `off-${p.code}`,
      name,
      brand: p.brands?.split(',')[0]?.trim(),
      per100: macros,
      source: 'off',
    })
  }
  return items
}
