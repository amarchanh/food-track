import { useState, type FormEvent, type ReactNode } from 'react'
import { checkCredentials } from './credentials'

const AUTH_KEY = 'foottrack-authed-v1'

function readStoredAuth(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

export function useLogout() {
  return () => {
    try {
      localStorage.removeItem(AUTH_KEY)
    } catch {
      /* ignore */
    }
    location.reload()
  }
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(readStoredAuth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setChecking(true)
    setError(null)
    const ok = await checkCredentials(username, password)
    setChecking(false)
    if (!ok) {
      setError('Usuario o contraseña incorrectos')
      return
    }
    try {
      localStorage.setItem(AUTH_KEY, '1')
    } catch {
      /* ignore */
    }
    setAuthed(true)
  }

  if (authed) return <>{children}</>

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>FoodTrack</h1>
        <p className="entry-meta">Acceso privado</p>
        <div className="field">
          <label>Usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <p className="entry-meta" style={{ color: 'var(--status-critical)' }}>
            {error}
          </p>
        )}
        <button className="btn-primary" disabled={checking}>
          {checking ? 'Comprobando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
