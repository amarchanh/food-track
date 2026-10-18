import { lazy, Suspense, useMemo, useState } from 'react'
import type { FoodItem } from '../types'
import { searchFoods } from '../search/foodSearch'
import { lookupBarcode } from '../search/barcodeLookup'
import { useAppStore } from '../store'

// The scanner pulls in @zxing/browser (~450 KB), so it's only downloaded
// when someone actually opens it instead of bloating the main bundle.
const BarcodeScanner = lazy(() => import('./BarcodeScanner').then((m) => ({ default: m.BarcodeScanner })))

interface Props {
  title: string
  confirmLabel: string
  onConfirm: (food: FoodItem, grams: number) => void
  onClose: () => void
}

function makeCustomFood(name: string, kcal: number, protein: number, carbs: number, fat: number, fiber: number): FoodItem {
  return {
    id: `custom-${crypto.randomUUID()}`,
    name,
    source: 'custom',
    per100: { kcal, protein, carbs, fat, fiber },
  }
}

export function FoodSearchSheet({ title, confirmLabel, onConfirm, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState(100)
  const [showManual, setShowManual] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const customFoods = useAppStore((s) => s.customFoods)
  const addCustomFood = useAppStore((s) => s.addCustomFood)

  const results = useMemo(() => searchFoods(query), [query])

  const myMatches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return customFoods.filter((f) => f.name.toLowerCase().includes(q))
  }, [customFoods, query])

  async function handleBarcodeDetected(barcode: string) {
    setShowScanner(false)
    setLookingUp(true)
    const result = await lookupBarcode(barcode)
    setLookingUp(false)
    if (!result.ok) {
      setScanError(
        result.reason === 'not-found' || result.reason === 'no-nutrition-data'
          ? 'Ese producto no está en Open Food Facts. Pruébalo con el buscador o añádelo manualmente.'
          : 'No se pudo consultar Open Food Facts ahora mismo.',
      )
      return
    }
    addCustomFood(result.food)
    setScanError(null)
    setSelected(result.food)
  }

  if (selected) {
    const macros = {
      kcal: (selected.per100.kcal * grams) / 100,
      protein: (selected.per100.protein * grams) / 100,
      carbs: (selected.per100.carbs * grams) / 100,
      fat: (selected.per100.fat * grams) / 100,
    }
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{selected.name}</h3>
            <button className="icon-btn" onClick={() => setSelected(null)}>
              ✕
            </button>
          </div>
          <div className="field">
            <label>Cantidad (gramos)</label>
            <input
              type="number"
              min={1}
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value) || 0)}
            />
          </div>
          <p className="entry-meta">
            {Math.round(macros.kcal)} kcal · P {Math.round(macros.protein)}g · C{' '}
            {Math.round(macros.carbs)}g · G {Math.round(macros.fat)}g
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              onConfirm(selected, grams)
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    )
  }

  if (showScanner) {
    return (
      <Suspense fallback={<div className="modal-backdrop" />}>
        <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} />
      </Suspense>
    )
  }

  if (showManual) {
    return <ManualFoodForm onClose={() => setShowManual(false)} onSelect={(f) => { addCustomFood(f); setSelected(f) }} />
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="field">
          <input
            autoFocus
            placeholder="Buscar alimento (ej. pechuga de pollo)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          className="btn-secondary"
          style={{ width: '100%', marginBottom: 12 }}
          onClick={() => {
            setScanError(null)
            setShowScanner(true)
          }}
        >
          📷 Escanear código de barras
        </button>

        {lookingUp && <p className="entry-meta">Consultando Open Food Facts…</p>}
        {scanError && <p className="empty-state">{scanError}</p>}

        {myMatches.length > 0 && (
          <>
            <div className="section-title">Tus alimentos</div>
            {myMatches.map((f) => (
              <div key={f.id} className="search-result" onClick={() => setSelected(f)}>
                <div>
                  <div className="name">{f.name}</div>
                  <div className="meta">
                    {f.source === 'off' ? f.brand || 'Escaneado' : 'Personalizado'}
                  </div>
                </div>
                <div className="kcal">{Math.round(f.per100.kcal)} kcal/100g</div>
              </div>
            ))}
          </>
        )}

        {results.length > 0 && (
          <>
            <div className="section-title">Alimentos comunes</div>
            {results.map((f) => (
              <div key={f.id} className="search-result" onClick={() => setSelected(f)}>
                <div>
                  <div className="name">{f.name}</div>
                </div>
                <div className="kcal">{Math.round(f.per100.kcal)} kcal/100g</div>
              </div>
            ))}
          </>
        )}

        {query.trim().length >= 2 && results.length === 0 && myMatches.length === 0 && (
          <p className="empty-state">
            Sin resultados para "{query}". Pruébalo con otro nombre o añádelo manualmente.
          </p>
        )}

        <button className="btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowManual(true)}>
          + Añadir alimento manualmente
        </button>
      </div>
    </div>
  )
}

function ManualFoodForm({ onClose, onSelect }: { onClose: () => void; onSelect: (f: FoodItem) => void }) {
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const [fiber, setFiber] = useState(0)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Alimento manual</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="entry-meta" style={{ marginTop: -4, marginBottom: 12 }}>
          Valores por cada 100 g / 100 ml
        </p>
        <div className="field">
          <label>Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Calorías (kcal)</label>
          <input type="number" value={kcal} onChange={(e) => setKcal(Number(e.target.value) || 0)} />
        </div>
        <div className="field">
          <label>Proteína (g)</label>
          <input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value) || 0)} />
        </div>
        <div className="field">
          <label>Carbohidratos (g)</label>
          <input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value) || 0)} />
        </div>
        <div className="field">
          <label>Grasas (g)</label>
          <input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value) || 0)} />
        </div>
        <div className="field">
          <label>Fibra (g)</label>
          <input type="number" value={fiber} onChange={(e) => setFiber(Number(e.target.value) || 0)} />
        </div>
        <button
          className="btn-primary"
          disabled={!name.trim() || kcal <= 0}
          onClick={() => onSelect(makeCustomFood(name.trim(), kcal, protein, carbs, fat, fiber))}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
