import type { Design } from './types'

export interface CloudUser {
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
}

export type CloudStatus = 'unknown' | 'signed-out' | 'signed-in' | 'unavailable'

export interface CloudSnapshot {
  status: CloudStatus
  user: CloudUser | null
}

let snapshot: CloudSnapshot = { status: 'unknown', user: null }
const listeners = new Set<() => void>()

function setSnapshot(next: CloudSnapshot): void {
  snapshot = next
  listeners.forEach((listener) => listener())
}

export function subscribeCloud(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getCloudSnapshot(): CloudSnapshot {
  return snapshot
}

/** Reads the server session. Only ever used for display — the Worker authorizes every request. */
export async function fetchSession(): Promise<CloudUser | null> {
  try {
    const response = await fetch('/auth/freebuff/session', {
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
    })
    if (!response.ok) {
      setSnapshot({ status: 'unavailable', user: null })
      return null
    }
    const payload = (await response.json()) as { user?: CloudUser | null }
    const user = payload?.user ?? null
    setSnapshot({ status: user ? 'signed-in' : 'signed-out', user })
    return user
  } catch {
    setSnapshot({ status: 'unavailable', user: null })
    return null
  }
}

export async function fetchCloudDesigns(): Promise<Design[]> {
  if (snapshot.status !== 'signed-in') return []
  try {
    const response = await fetch('/api/designs', {
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
    })
    if (!response.ok) return []
    const payload = (await response.json()) as { designs?: Design[] }
    return Array.isArray(payload.designs) ? payload.designs : []
  } catch {
    return []
  }
}

const pending = new Map<string, number>()

/** Debounced per design, so editing a canvas doesn't hammer the API. */
export function pushDesign(design: Design): void {
  if (snapshot.status !== 'signed-in') return
  const existing = pending.get(design.id)
  if (existing) window.clearTimeout(existing)
  const timer = window.setTimeout(() => {
    pending.delete(design.id)
    void send(design)
  }, 900)
  pending.set(design.id, timer)
}

async function send(design: Design): Promise<void> {
  try {
    const response = await fetch(`/api/designs/${encodeURIComponent(design.id)}`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(design),
    })
    if (response.status === 413) {
      console.warn('Kite: this design is too large to sync (uploads are embedded).')
    }
  } catch {
    /* offline — the local copy stays authoritative until the next save */
  }
}

export function deleteRemoteDesign(id: string): void {
  if (snapshot.status !== 'signed-in') return
  const timer = pending.get(id)
  if (timer) {
    window.clearTimeout(timer)
    pending.delete(id)
  }
  void fetch(`/api/designs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  }).catch(() => undefined)
}

export function signInHref(returnTo: string): string {
  return `/auth/freebuff/signin?returnTo=${encodeURIComponent(returnTo)}`
}
