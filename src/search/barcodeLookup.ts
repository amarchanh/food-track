import type { FoodItem, Macros } from '../types'

interface OffProduct {
  product_name?: string
  product_name_es?: string
  brands?: string
  nutriments?: Record<string, number>
}

interface OffProductResponse {
  status: number
  product?: OffProduct
}

function toMacros(n: Record<string, number> | undefined): Macros {
  return {
    kcal: n?.['energy-kcal_100g'] ?? 0,
    protein: n?.['proteins_100g'] ?? 0,
    carbs: n?.['carbohydrates_100g'] ?? 0,
    fat: n?.['fat_100g'] ?? 0,
    fiber: n?.['fiber_100g'] ?? 0,
  }
}

export type BarcodeLookupResult =
  | { ok: true; food: FoodItem }
  | { ok: false; reason: 'not-found' | 'no-nutrition-data' | 'network-error' }

/**
 * Looks up a single product by barcode. Unlike Open Food Facts' search
 * endpoints (dead/CORS-less, see foodSearch.ts), this per-product endpoint
 * still works with proper CORS, so it's safe to call from the browser.
 */
export async function lookupBarcode(barcode: string): Promise<BarcodeLookupResult> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,product_name_es,brands,nutriments`

  let data: OffProductResponse
  try {
    const res = await fetch(url)
    if (!res.ok) return { ok: false, reason: 'network-error' }
    data = await res.json()
  } catch {
    return { ok: false, reason: 'network-error' }
  }

  if (data.status !== 1 || !data.product) return { ok: false, reason: 'not-found' }

  const macros = toMacros(data.product.nutriments)
  if (macros.kcal <= 0) return { ok: false, reason: 'no-nutrition-data' }

  const brand = data.product.brands?.split(',')[0]?.trim()
  // Some products have full nutrition data but no product_name filled in.
  const name = data.product.product_name_es || data.product.product_name || brand || `Producto ${barcode}`

  return {
    ok: true,
    food: {
      id: `off-${barcode}`,
      name,
      brand,
      per100: macros,
      source: 'off',
    },
  }
}
