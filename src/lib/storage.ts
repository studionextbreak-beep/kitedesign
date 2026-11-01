import type { Design, Profile } from './types'
import { newDesign, newPage } from './factories'
import { designFromTemplate, templateById } from './templates'
import { deleteRemoteDesign, pushDesign } from './cloud'

const DESIGNS_KEY = 'kite.designs.v1'
const PROFILE_KEY = 'kite.profile.v1'

const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

export function subscribeDesigns(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function readRaw(): Design[] {
  try {
    const raw = localStorage.getItem(DESIGNS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Design[]) : []
  } catch {
    return []
  }
}

export function loadDesigns(): Design[] {
  return readRaw().sort((a, b) => b.updatedAt - a.updatedAt)
}

function write(designs: Design[]): void {
  try {
    localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs))
  } catch {
    /* storage full or unavailable */
  }
  notify()
}

export function loadDesign(id: string): Design | undefined {
  return readRaw().find((design) => design.id === id)
}

export function upsertDesign(design: Design): void {
  const designs = readRaw()
  const index = designs.findIndex((item) => item.id === design.id)
  const next = { ...design, updatedAt: Date.now() }
  if (index >= 0) designs[index] = next
  else designs.unshift(next)
  write(designs)
  pushDesign(next)
}

export function deleteDesign(id: string): void {
  write(readRaw().filter((design) => design.id !== id))
  deleteRemoteDesign(id)
}

export function duplicateDesign(id: string): Design | undefined {
  const source = loadDesign(id)
  if (!source) return undefined
  const copy: Design = {
    ...source,
    id: `dsn_${Math.random().toString(36).slice(2, 9)}`,
    title: `${source.title} copy`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pages: source.pages.map((page) => ({ ...page, elements: page.elements.map((el) => ({ ...el })) })),
  }
  upsertDesign(copy)
  return copy
}

export function createBlankDesign(opts: {
  width: number
  height: number
  title?: string
  background?: string
}): Design {
  const design = newDesign({
    width: opts.width,
    height: opts.height,
    title: opts.title ?? 'Untitled design',
    pages: [newPage(opts.background ?? '#ffffff')],
  })
  upsertDesign(design)
  return design
}

export function createDesignFromTemplateId(templateId: string): Design | undefined {
  const template = templateById(templateId)
  if (!template) return undefined
  const design = designFromTemplate(template)
  upsertDesign(design)
  return design
}

/** Merges designs pulled from the account, keeping whichever copy is newer. */
export function mergeRemoteDesigns(remote: Design[]): void {
  if (remote.length === 0) return
  const designs = readRaw()
  const byId = new Map(designs.map((design) => [design.id, design]))
  let changed = false

  remote.forEach((incoming) => {
    if (!incoming || typeof incoming.id !== 'string') return
    const local = byId.get(incoming.id)
    if (!local || (incoming.updatedAt ?? 0) > (local.updatedAt ?? 0)) {
      byId.set(incoming.id, incoming)
      changed = true
    }
  })

  if (changed) write(Array.from(byId.values()))
}

export function seedStarterDesigns(): void {
  if (localStorage.getItem(DESIGNS_KEY)) return
  const starters = ['sunset-sessions', 'quarterly-review', 'studio-card']
  const designs: Design[] = []
  starters.forEach((id, index) => {
    const template = templateById(id)
    if (!template) return
    const design = designFromTemplate(template)
    design.createdAt = Date.now() - index * 86_400_000
    design.updatedAt = design.createdAt
    designs.push(design)
  })
  write(designs)
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return JSON.parse(raw) as Profile
  } catch {
    /* ignore */
  }
  return { name: 'Mara Voss', email: 'mara@kite.studio', plan: 'free', initials: 'MV' }
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* ignore */
  }
  notify()
}

export function storageUsage(): { designs: number; bytes: number } {
  const designs = readRaw()
  const bytes = new Blob([JSON.stringify(designs)]).size
  return { designs: designs.length, bytes }
}
