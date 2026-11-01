import { createContext, useContext } from 'react'
import type { Design, DesignElement, Page } from '@/lib/types'

export type PanelTab =
  | 'templates'
  | 'elements'
  | 'text'
  | 'uploads'
  | 'photos'
  | 'background'
  | 'layers'
  | 'pages'

export type AlignPosition = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'

export type LayerDirection = 'front' | 'forward' | 'backward' | 'back'

export interface EditorApi {
  design: Design
  page: Page
  pageIndex: number
  selected: DesignElement | null
  selectedId: string | null
  zoom: number
  tab: PanelTab
  savedAt: number | null
  canUndo: boolean
  canRedo: boolean
  fitTick: number
  exporting: boolean

  setTab: (tab: PanelTab) => void
  setZoom: (zoom: number) => void
  requestFit: () => void
  select: (id: string | null) => void
  setPageIndex: (index: number) => void

  updateElement: (id: string, patch: Partial<DesignElement>, history?: boolean) => void
  patchElement: (id: string, patch: Partial<DesignElement>) => void
  pushHistory: (snapshot: Design) => void
  addElement: (element: DesignElement, options?: { select?: boolean; history?: boolean }) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => void
  reorderElement: (id: string, direction: LayerDirection) => void
  moveElement: (id: string, toIndex: number) => void
  alignElement: (id: string, position: AlignPosition) => void

  setPageBackground: (value: string, history?: boolean) => void
  updatePage: (patch: Partial<Page>) => void
  addPage: () => void
  duplicatePage: (index: number) => void
  deletePage: (index: number) => void
  replacePageElements: (elements: DesignElement[], background?: string) => void
  applyTemplate: (templateId: string) => void

  undo: () => void
  redo: () => void
  setTitle: (title: string) => void
  notify: (message: string) => void
  exportPng: (scale: number) => Promise<void>
  exportPdf: () => Promise<void>
  startPresent: () => void
}

export const EditorContext = createContext<EditorApi | null>(null)

export function useEditor(): EditorApi {
  const context = useContext(EditorContext)
  if (!context) throw new Error('useEditor must be used inside an EditorContext provider')
  return context
}
