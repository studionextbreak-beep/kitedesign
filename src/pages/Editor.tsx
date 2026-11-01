import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { EditorContext } from '@/editor/EditorContext'
import type { AlignPosition, EditorApi, LayerDirection, PanelTab } from '@/editor/EditorContext'
import { TopBar } from '@/editor/TopBar'
import { SidePanels } from '@/editor/SidePanels'
import { CanvasStage } from '@/editor/CanvasStage'
import { Inspector } from '@/editor/Inspector'
import { PresentMode } from '@/editor/PresentMode'
import { PageView } from '@/editor/render'
import { clonePages, newDesign, newPage } from '@/lib/factories'
import { designFromTemplate, templateById } from '@/lib/templates'
import { createBlankDesign, loadDesign, upsertDesign } from '@/lib/storage'
import type { Design, DesignElement, Page } from '@/lib/types'
import { clamp, downloadDataUrl, slugify } from '@/lib/utils'

function withPage(design: Design, pageIndex: number, updater: (page: Page) => Page): Design {
  return {
    ...design,
    pages: design.pages.map((page, index) => (index === pageIndex ? updater(page) : page)),
  }
}

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [design, setDesign] = useState<Design | null>(null)
  const designRef = useRef<Design | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageIndex, setPageIndexRaw] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(0.5)
  const [tab, setTab] = useState<PanelTab>('templates')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [fitTick, setFitTick] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [presenting, setPresenting] = useState(false)
  const [exportPages, setExportPages] = useState<Page[] | null>(null)
  const [, bumpHistory] = useState(0)

  const past = useRef<Design[]>([])
  const future = useRef<Design[]>([])
  const createdNew = useRef(false)

  useEffect(() => {
    if (!id) return
    if (id === 'new') {
      // Guard against StrictMode's double effect creating two blank designs.
      if (createdNew.current) return
      createdNew.current = true
      const created = createBlankDesign({ width: 1080, height: 1080, title: 'Untitled design' })
      designRef.current = created
      setDesign(created)
      setLoading(false)
      navigate(`/editor/${created.id}`, { replace: true })
      return
    }
    const found = loadDesign(id)
    if (found) {
      past.current = []
      future.current = []
      designRef.current = found
      setDesign(found)
      setPageIndexRaw(0)
      setSelectedId(null)
      setSavedAt(null)
      setFitTick((value) => value + 1)
      bumpHistory((value) => value + 1)
    }
    setLoading(false)
  }, [id, navigate])

  // Keep a ref mirror so pointer handlers and autosave always see the latest design.
  useEffect(() => {
    designRef.current = design
  }, [design])

  useEffect(() => {
    if (!design) return
    const timer = window.setTimeout(() => {
      upsertDesign(design)
      setSavedAt(Date.now())
    }, 700)
    return () => window.clearTimeout(timer)
  }, [design])

  useEffect(() => {
    const save = () => {
      if (designRef.current) upsertDesign(designRef.current)
    }
    window.addEventListener('beforeunload', save)
    return () => window.removeEventListener('beforeunload', save)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const notify = useCallback((message: string) => setToast(message), [])

  const handleSetZoom = useCallback((value: number) => {
    setZoom(clamp(Number(value.toFixed(2)), 0.08, 3))
  }, [])

  const requestFit = useCallback(() => setFitTick((value) => value + 1), [])

  const startPresent = useCallback(() => setPresenting(true), [])
  const closePresent = useCallback(() => setPresenting(false), [])

  const commit = useCallback((updater: (current: Design) => Design, history = true) => {
    const current = designRef.current
    if (!current) return
    const next = updater(current)
    if (next === current) return
    if (history) {
      past.current = [...past.current.slice(-79), current]
      future.current = []
    }
    const stamped = { ...next, updatedAt: Date.now() }
    designRef.current = stamped
    setDesign(stamped)
    if (history) bumpHistory((value) => value + 1)
  }, [])

  const pushHistory = useCallback((snapshot: Design) => {
    past.current = [...past.current.slice(-79), snapshot]
    future.current = []
    bumpHistory((value) => value + 1)
  }, [])

  const setPageIndex = useCallback((index: number) => {
    const current = designRef.current
    if (!current) return
    const next = clamp(index, 0, current.pages.length - 1)
    setPageIndexRaw(next)
    setSelectedId(null)
    setFitTick((value) => value + 1)
  }, [])

  const undo = useCallback(() => {
    const previous = past.current.pop()
    const current = designRef.current
    if (!previous || !current) return
    future.current = [current, ...future.current]
    designRef.current = previous
    setDesign(previous)
    setPageIndexRaw((index) => Math.min(index, previous.pages.length - 1))
    bumpHistory((value) => value + 1)
  }, [])

  const redo = useCallback(() => {
    const next = future.current.shift()
    const current = designRef.current
    if (!next || !current) return
    past.current = [...past.current, current]
    designRef.current = next
    setDesign(next)
    setPageIndexRaw((index) => Math.min(index, next.pages.length - 1))
    bumpHistory((value) => value + 1)
  }, [])

  const page = design?.pages[Math.min(pageIndex, (design?.pages.length ?? 1) - 1)] ?? null
  const selected = page?.elements.find((element) => element.id === selectedId) ?? null

  const updateElement = useCallback(
    (elementId: string, patch: Partial<DesignElement>, history = true) => {
      commit(
        (current) =>
          withPage(current, pageIndex, (target) => ({
            ...target,
            elements: target.elements.map((element) =>
              element.id === elementId ? ({ ...element, ...patch } as DesignElement) : element,
            ),
          })),
        history,
      )
    },
    [commit, pageIndex],
  )

  const patchElement = useCallback(
    (elementId: string, patch: Partial<DesignElement>) => updateElement(elementId, patch, false),
    [updateElement],
  )

  const addElement = useCallback(
    (element: DesignElement, options: { select?: boolean; history?: boolean } = {}) => {
      commit(
        (current) =>
          withPage(current, pageIndex, (target) => ({ ...target, elements: [...target.elements, element] })),
        options.history ?? true,
      )
      if (options.select !== false) setSelectedId(element.id)
    },
    [commit, pageIndex],
  )

  const deleteElement = useCallback(
    (elementId: string) => {
      commit((current) =>
        withPage(current, pageIndex, (target) => ({
          ...target,
          elements: target.elements.filter((element) => element.id !== elementId),
        })),
      )
      setSelectedId((current) => (current === elementId ? null : current))
    },
    [commit, pageIndex],
  )

  const duplicateElement = useCallback(
    (elementId: string) => {
      const current = designRef.current
      if (!current) return
      const target = current.pages[pageIndex]?.elements.find((element) => element.id === elementId)
      if (!target) return
      const copy: DesignElement = {
        ...target,
        id: `${target.type}_${Math.random().toString(36).slice(2, 9)}`,
        x: target.x + 24,
        y: target.y + 24,
        name: `${target.name} copy`,
      }
      addElement(copy)
      notify('Duplicated')
    },
    [addElement, notify, pageIndex],
  )

  const reorderElement = useCallback(
    (elementId: string, direction: LayerDirection) => {
      commit((current) =>
        withPage(current, pageIndex, (target) => {
          const index = target.elements.findIndex((element) => element.id === elementId)
          if (index < 0) return target
          const elements = [...target.elements]
          const [element] = elements.splice(index, 1)
          const nextIndex =
            direction === 'front'
              ? elements.length
              : direction === 'back'
                ? 0
                : direction === 'forward'
                  ? Math.min(index + 1, elements.length)
                  : Math.max(index - 1, 0)
          elements.splice(nextIndex, 0, element)
          return { ...target, elements }
        }),
      )
    },
    [commit, pageIndex],
  )

  const moveElement = useCallback(
    (elementId: string, toIndex: number) => {
      commit((current) =>
        withPage(current, pageIndex, (target) => {
          const from = target.elements.findIndex((element) => element.id === elementId)
          if (from < 0) return target
          const elements = [...target.elements]
          const [element] = elements.splice(from, 1)
          const to = clamp(toIndex, 0, elements.length)
          elements.splice(to, 0, element)
          return { ...target, elements }
        }),
      )
    },
    [commit, pageIndex],
  )

  const alignElement = useCallback(
    (elementId: string, position: AlignPosition) => {
      const current = designRef.current
      const target = current?.pages[pageIndex]?.elements.find((element) => element.id === elementId)
      if (!current || !target) return
      const { width, height } = current
      const patch: Partial<DesignElement> = {}
      if (position === 'left') patch.x = 0
      if (position === 'center') patch.x = Math.round((width - target.w) / 2)
      if (position === 'right') patch.x = Math.round(width - target.w)
      if (position === 'top') patch.y = 0
      if (position === 'middle') patch.y = Math.round((height - target.h) / 2)
      if (position === 'bottom') patch.y = Math.round(height - target.h)
      updateElement(elementId, patch)
    },
    [pageIndex, updateElement],
  )

  const setPageBackground = useCallback(
    (value: string, history = true) => {
      commit((current) => withPage(current, pageIndex, (target) => ({ ...target, background: value })), history)
    },
    [commit, pageIndex],
  )

  const updatePage = useCallback(
    (patch: Partial<Page>) => {
      commit((current) => withPage(current, pageIndex, (target) => ({ ...target, ...patch })))
    },
    [commit, pageIndex],
  )

  const addPage = useCallback(() => {
    const current = designRef.current
    if (!current) return
    const nextPage = newPage(current.pages[pageIndex]?.background ?? '#ffffff')
    commit((design) => ({
      ...design,
      pages: [...design.pages.slice(0, pageIndex + 1), nextPage, ...design.pages.slice(pageIndex + 1)],
    }))
    setPageIndexRaw(pageIndex + 1)
    setSelectedId(null)
  }, [commit, pageIndex])

  const duplicatePage = useCallback(
    (index: number) => {
      const current = designRef.current
      const source = current?.pages[index]
      if (!current || !source) return
      const [copy] = clonePages([source])
      commit((design) => ({
        ...design,
        pages: [...design.pages.slice(0, index + 1), copy, ...design.pages.slice(index + 1)],
      }))
      setPageIndexRaw(index + 1)
      notify('Page duplicated')
    },
    [commit, notify],
  )

  const deletePage = useCallback(
    (index: number) => {
      const current = designRef.current
      if (!current) return
      if (current.pages.length <= 1) {
        notify('A design needs at least one page')
        return
      }
      commit((design) => ({ ...design, pages: design.pages.filter((_, i) => i !== index) }))
      setPageIndexRaw((value) => clamp(value, 0, current.pages.length - 2))
      notify('Page deleted')
    },
    [commit, notify],
  )

  const replacePageElements = useCallback(
    (elements: DesignElement[], background?: string) => {
      commit((current) =>
        withPage(current, pageIndex, (target) => ({
          ...target,
          background: background ?? target.background,
          elements,
        })),
      )
      setSelectedId(null)
      notify('Template applied')
    },
    [commit, notify, pageIndex],
  )

  const applyTemplate = useCallback(
    (templateId: string) => {
      const template = templateById(templateId)
      const current = designRef.current
      if (!template || !current) return
      const generated = designFromTemplate(template)
      const [firstPage] = clonePages(generated.pages)
      commit((design) => {
        const resized = { ...design, pages: design.pages }
        return withPage(
          { ...resized, width: template.width, height: template.height },
          pageIndex,
          (target) => ({ ...target, background: firstPage.background, elements: firstPage.elements }),
        )
      })
      setSelectedId(null)
      setFitTick((value) => value + 1)
      notify('Template applied')
    },
    [commit, notify, pageIndex],
  )

  const setTitle = useCallback(
    (title: string) => {
      commit((current) => ({ ...current, title }), false)
    },
    [commit],
  )

  const exportPng = useCallback(
    async (scale: number) => {
      const current = designRef.current
      const node = document.querySelector<HTMLElement>('[data-canvas-page]')
      if (!current || !node) return
      setExporting(true)
      try {
        const { toPng } = await import('html-to-image')
        const dataUrl = await toPng(node, {
          width: current.width,
          height: current.height,
          pixelRatio: scale,
          cacheBust: true,
          style: { transform: 'none', transformOrigin: 'top left', margin: '0' },
        })
        downloadDataUrl(dataUrl, `${slugify(current.title) || 'kite-design'}.png`)
        notify(`Exported at ${scale}×`)
      } catch (error) {
        console.error(error)
        notify('Export failed — a remote photo may be blocking it')
      } finally {
        setExporting(false)
      }
    },
    [notify],
  )

  const exportPdf = useCallback(async () => {
    const current = designRef.current
    if (!current) return
    setExporting(true)
    setExportPages(current.pages)
    try {
      // Wait for the offscreen pages (and their images) to be laid out before capturing.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      )
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-pdf-page]'))
      await Promise.all(
        Array.from(document.querySelectorAll<HTMLImageElement>('[data-pdf-page] img')).map((image) =>
          image.decode?.().catch(() => undefined),
        ),
      )
      if (nodes.length === 0) {
        notify('Nothing to export yet')
        return
      }

      const { toPng } = await import('html-to-image')
      const { jsPDF } = await import('jspdf')
      const landscape = current.width >= current.height
      const pdf = new jsPDF({
        orientation: landscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: [current.width, current.height],
        hotfixes: ['px_scaling'],
      })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      for (let index = 0; index < nodes.length; index += 1) {
        const dataUrl = await toPng(nodes[index], {
          width: current.width,
          height: current.height,
          pixelRatio: 2,
          cacheBust: true,
        })
        if (index > 0) pdf.addPage()
        pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight)
      }

      pdf.save(`${slugify(current.title) || 'kite-design'}.pdf`)
      notify(`Exported ${nodes.length}-page PDF`)
    } catch (error) {
      console.error(error)
      notify('PDF export failed — a remote photo may be blocking it')
    } finally {
      setExportPages(null)
      setExporting(false)
    }
  }, [notify])

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (presenting) return
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        if (typing) return
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
        if (typing) return
        event.preventDefault()
        redo()
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (designRef.current) {
          upsertDesign(designRef.current)
          setSavedAt(Date.now())
          notify('Saved')
        }
        return
      }
      if (typing) return

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        if (selectedId) duplicateElement(selectedId)
        return
      }
      if (event.key === 'Escape') {
        setSelectedId(null)
        return
      }
      if (!selectedId) return
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        deleteElement(selectedId)
        return
      }
      const step = event.shiftKey ? 10 : 1
      const nudges: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }
      const nudge = nudges[event.key]
      if (nudge) {
        event.preventDefault()
        const element = designRef.current?.pages[pageIndex]?.elements.find((item) => item.id === selectedId)
        if (!element) return
        updateElement(selectedId, { x: element.x + nudge[0], y: element.y + nudge[1] })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [deleteElement, duplicateElement, notify, pageIndex, presenting, redo, selectedId, undo, updateElement])

  const api = useMemo<EditorApi | null>(() => {
    if (!design || !page) return null
    return {
      design,
      page,
      pageIndex,
      selected,
      selectedId,
      zoom,
      tab,
      savedAt,
      canUndo: past.current.length > 0,
      canRedo: future.current.length > 0,
      fitTick,
      exporting,
      setTab,
      setZoom: handleSetZoom,
      requestFit,
      select: setSelectedId,
      setPageIndex,
      updateElement,
      patchElement,
      pushHistory,
      addElement,
      deleteElement,
      duplicateElement,
      reorderElement,
      moveElement,
      alignElement,
      setPageBackground,
      updatePage,
      addPage,
      duplicatePage,
      deletePage,
      replacePageElements,
      applyTemplate,
      undo,
      redo,
      setTitle,
      notify,
      exportPng,
      exportPdf,
      startPresent,
    }
  }, [
    addElement,
    addPage,
    alignElement,
    applyTemplate,
    deleteElement,
    deletePage,
    design,
    duplicateElement,
    duplicatePage,
    exportPng,
    exportPdf,
    exporting,
    fitTick,
    notify,
    handleSetZoom,
    moveElement,
    page,
    pageIndex,
    patchElement,
    pushHistory,
    redo,
    requestFit,
    replacePageElements,
    reorderElement,
    savedAt,
    selected,
    selectedId,
    setPageBackground,
    setPageIndex,
    setTitle,
    startPresent,
    tab,
    undo,
    updateElement,
    updatePage,
    zoom,
  ])

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-cream">
        <div className="flex items-center gap-2 text-sm text-ink-mute">
          <Loader2 size={16} className="animate-spin" /> Opening your canvas…
        </div>
      </div>
    )
  }

  if (!design || !api) {
    return (
      <div className="grid h-screen place-items-center bg-cream px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">This design is not here</h1>
          <p className="mt-2 text-sm text-ink-mute">
            It may have been deleted from another tab. Your other work is safe in the dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button type="button" className="btn btn-coral" onClick={() => navigate('/dashboard')}>
              Go to your work
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const next = newDesign({ width: 1080, height: 1080, title: 'Untitled design' })
                upsertDesign(next)
                navigate(`/editor/${next.id}`, { replace: true })
                window.location.reload()
              }}
            >
              New design
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <EditorContext.Provider value={api}>
      <div className="flex h-screen flex-col overflow-hidden bg-[#ece7df]">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <SidePanels />
          <CanvasStage />
          <Inspector />
        </div>
        {presenting ? <PresentMode onClose={closePresent} /> : null}

        {exportPages ? (
          <div className="pointer-events-none fixed left-[-120000px] top-0" aria-hidden="true">
            {exportPages.map((exportPage, index) => (
              <div key={exportPage.id} data-pdf-page={index} style={{ width: design.width, height: design.height }}>
                <PageView page={exportPage} width={design.width} height={design.height} eager />
              </div>
            ))}
          </div>
        ) : null}

        {toast ? (
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
            <div className="animate-rise rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream shadow-xl">{toast}</div>
          </div>
        ) : null}
      </div>
    </EditorContext.Provider>
  )
}
