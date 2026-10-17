import { useState } from 'react'
import { NavTabs, type Tab } from './components/NavTabs'
import { TodayView } from './views/TodayView'
import { FridgeView } from './views/FridgeView'
import { GoalsView } from './views/GoalsView'
import { HistoryView } from './views/HistoryView'

const TITLES: Record<Tab, string> = {
  today: 'FoodTrack',
  fridge: 'Nevera',
  goals: 'Objetivos',
  history: 'Historial',
}

function App() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <>
      <header className="app-header">
        <h1>{TITLES[tab]}</h1>
      </header>
      <main className="app-main">
        {tab === 'today' && <TodayView />}
        {tab === 'fridge' && <FridgeView />}
        {tab === 'goals' && <GoalsView />}
        {tab === 'history' && <HistoryView />}
      </main>
      <NavTabs active={tab} onChange={setTab} />
    </>
  )
}

export default App
