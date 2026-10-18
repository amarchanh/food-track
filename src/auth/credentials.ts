// This is a casual-visitor deterrent, not real security: the site is a
// static SPA on public GitHub Pages, so anyone with devtools can read this
// file or force the app's logged-in state regardless of what's checked here.
// The password is kept out of plain sight (salted SHA-256) only so it isn't
// trivially greppable in this public repo — never store it as plain text.
const USERNAME = 'amarchante'
const SALT = 'ft_a1abb38d'
const PASSWORD_HASH = 'bffa9b1df1d6fe3950e9b8c6af910908d43b2ef14f070d351e482c67d5c01617'

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function checkCredentials(username: string, password: string): Promise<boolean> {
  if (username.trim().toLowerCase() !== USERNAME) return false
  const hash = await sha256Hex(SALT + password)
  return hash === PASSWORD_HASH
}
