import crypto from 'node:crypto'

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface StoredRefresh {
  tokenHash: string
  expiresAt: number
}

const store = new Map<string, StoredRefresh>()

function hash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function createRefreshToken(userId: string): { token: string; expiresAt: number } {
  const token = crypto.randomBytes(48).toString('hex')
  const expiresAt = Date.now() + REFRESH_TTL_MS
  store.set(hash(token), { tokenHash: hash(token), expiresAt })
  store.set(`user:${userId}`, { tokenHash: token, expiresAt })
  return { token, expiresAt }
}

export function isValidRefreshToken(token: string): boolean {
  const entry = store.get(hash(token))
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    store.delete(hash(token))
    return false
  }
  return true
}

export function revokeRefreshToken(token: string): void {
  store.delete(hash(token))
}

export function revokeAllForUser(userId: string): void {
  const entry = store.get(`user:${userId}`)
  if (entry) {
    store.delete(hash(entry.tokenHash))
    store.delete(`user:${userId}`)
  }
}

export function cleanup(): void {
  const now = Date.now()
  for (const [k, v] of store) {
    if (v.expiresAt < now) store.delete(k)
  }
}

setInterval(cleanup, 60 * 60 * 1000).unref()