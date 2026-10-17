export type Tab = 'today' | 'fridge' | 'goals' | 'history'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'today', label: 'Hoy', icon: '🍽️' },
  { key: 'fridge', label: 'Nevera', icon: '🧊' },
  { key: 'goals', label: 'Objetivos', icon: '🎯' },
  { key: 'history', label: 'Historial', icon: '📅' },
]

interface Props {
  active: Tab
  onChange: (t: Tab) => void
}

export function NavTabs({ active, onChange }: Props) {
  return (
    <nav className="nav-tabs">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={active === t.key ? 'active' : ''}
          onClick={() => onChange(t.key)}
        >
          <span className="icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
