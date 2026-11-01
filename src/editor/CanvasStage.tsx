import { useCallback, useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'
import { useEditor } from '@/editor/EditorContext'
import { ElementGraphic, elementBoxStyle, textStyle } from '@/editor/render'
import type { DesignElement } from '@/lib/types'
import { clamp } from '@/lib/utils'

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

interface Guides {
  v: number[]
  h: number[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function CanvasStage() {
  const {
    design,
    page,
    pageIndex,
    selected,
    selectedId,
    select,
    updateElement,
    patchElement,
    pushHistory,
    zoom,
    setZoom,
    fitTick,
  } = useEditor()

  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [guides, setGuides] = useState<Guides>({ v: [], h: [] })
  const [editingId, setEditingId] = useState<string | null>(null)

  // Reset transient editing state when the page changes.
  useEffect(() => {
    setEditingId(null)
    setGuides({ v: [], h: [] })
  }, [pageIndex])

  const fit = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const bounds = container.getBoundingClientRect()
    const next = Math.min((bounds.width - 120) / design.width, (bounds.height - 120) / design.height)
    setZoom(clamp(Number(next.toFixed(2)), 0.08, 1.4))
  }, [design.height, design.width, setZoom])

  useEffect(() => {
    fit()
  }, [fit, fitTick])

  const toDesign = useCallback((clientX: number, clientY: number) => {
    const rect = pageRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (clientX - rect.left) / zoom, y: (clientY - rect.top) / zoom }
  }, [zoom])

  /** Snap an element's edges/centres to the page and to sibling elements. */
  const snapPosition = useCallback(
    (element: DesignElement, x: number, y: number): { x: number; y: number; guides: Guides } => {
      const threshold = 7 / zoom
      const targetsX = [0, design.width / 2, design.width]
      const targetsY = [0, design.height / 2, design.height]
      page.elements.forEach((other) => {
        if (other.id === element.id) return
        targetsX.push(other.x, other.x + other.w / 2, other.x + other.w)
        targetsY.push(other.y, other.y + other.h / 2, other.y + other.h)
      })

      const anchorsX = [
        { offset: 0, value: x },
        { offset: element.w / 2, value: x + element.w / 2 },
        { offset: element.w, value: x + element.w },
      ]
      const anchorsY = [
        { offset: 0, value: y },
        { offset: element.h / 2, value: y + element.h / 2 },
        { offset: element.h, value: y + element.h },
      ]

      let bestX: { delta: number; guide: number } | null = null
      let bestY: { delta: number; guide: number } | null = null

      for (const anchor of anchorsX) {
        for (const target of targetsX) {
          const delta = target - anchor.value
          if (Math.abs(delta) <= threshold && (bestX === null || Math.abs(delta) < Math.abs(bestX.delta))) {
            bestX = { delta, guide: target }
          }
        }
      }
      for (const anchor of anchorsY) {
        for (const target of targetsY) {
          const delta = target - anchor.value
          if (Math.abs(delta) <= threshold && (bestY === null || Math.abs(delta) < Math.abs(bestY.delta))) {
            bestY = { delta, guide: target }
          }
        }
      }

      const snapX: { delta: number; guide: number } | null = bestX
      const snapY: { delta: number; guide: number } | null = bestY

      return {
        x: x + (snapX ? snapX.delta : 0),
        y: y + (snapY ? snapY.delta : 0),
        guides: {
          v: snapX ? [snapX.guide] : [],
          h: snapY ? [snapY.guide] : [],
        },
      }
    },
    [design.height, design.width, page.elements, zoom],
  )

  function startMove(event: React.PointerEvent, element: DesignElement) {
    event.stopPropagation()
    if (element.locked) {
      select(element.id)
      return
    }
    if (editingId && editingId !== element.id) setEditingId(null)
    select(element.id)
    const snapshot = design
    const startX = event.clientX
    const startY = event.clientY
    const originX = element.x
    const originY = element.y
    let moved = false

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom
      const dy = (moveEvent.clientY - startY) / zoom
      if (Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5) moved = true
      const result = snapPosition(element, originX + dx, originY + dy)
      setGuides(result.guides)
      patchElement(element.id, { x: Math.round(result.x), y: Math.round(result.y) })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setGuides({ v: [], h: [] })
      if (moved) pushHistory(snapshot)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function startResize(event: React.PointerEvent, element: DesignElement, handle: Handle) {
    event.stopPropagation()
    event.preventDefault()
    select(element.id)
    const snapshot = design
    const start = toDesign(event.clientX, event.clientY)
    const origin = { x: element.x, y: element.y, w: element.w, h: element.h }
    let resized = false
    const minSize = 16

    const onMove = (moveEvent: PointerEvent) => {
      const point = toDesign(moveEvent.clientX, moveEvent.clientY)
      const dx = point.x - start.x
      const dy = point.y - start.y
      let { x, y, w, h } = origin

      if (handle.includes('e')) w = origin.w + dx
      if (handle.includes('s')) h = origin.h + dy
      if (handle.includes('w')) {
        w = origin.w - dx
        x = origin.x + dx
      }
      if (handle.includes('n')) {
        h = origin.h - dy
        y = origin.y + dy
      }

      if (w < minSize) {
        if (handle.includes('w')) x = origin.x + origin.w - minSize
        w = minSize
      }
      if (h < minSize) {
        if (handle.includes('n')) y = origin.y + origin.h - minSize
        h = minSize
      }

      resized = true
      patchElement(element.id, {
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(w),
        h: Math.round(h),
      })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (resized) pushHistory(snapshot)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function startRotate(event: React.PointerEvent, element: DesignElement) {
    event.stopPropagation()
    event.preventDefault()
    select(element.id)
    const snapshot = design
    const center = { x: element.x + element.w / 2, y: element.y + element.h / 2 }
    let rotated = false

    const onMove = (moveEvent: PointerEvent) => {
      const point = toDesign(moveEvent.clientX, moveEvent.clientY)
      const angle = (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI + 90
      rotated = true
      patchElement(element.id, { rotation: Math.round(angle) })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (rotated) pushHistory(snapshot)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const handleSize = 9 / zoom
  const handleOffset = handleSize / 2
  const outlineWidth = 1.5 / zoom

  const handlePosition = (handle: Handle): React.CSSProperties => {
    const style: React.CSSProperties = { width: handleSize, height: handleSize }
    if (handle.includes('n')) style.top = -handleOffset
    if (handle.includes('s')) style.bottom = -handleOffset
    if (handle.includes('w')) style.left = -handleOffset
    if (handle.includes('e')) style.right = -handleOffset
    if (handle === 'n' || handle === 's') {
      style.left = '50%'
      style.marginLeft = -handleOffset
    }
    if (handle === 'e' || handle === 'w') {
      style.top = '50%'
      style.marginTop = -handleOffset
    }
    return style
  }

  const cursorFor = (handle: Handle): string => {
    if (handle === 'n' || handle === 's') return 'ns-resize'
    if (handle === 'e' || handle === 'w') return 'ew-resize'
    if (handle === 'nw' || handle === 'se') return 'nwse-resize'
    return 'nesw-resize'
  }

  return (
    <div
      ref={containerRef}
      className="relative flex min-w-0 flex-1 overflow-auto bg-[#ece7df]"
      style={{
        backgroundImage: 'radial-gradient(rgba(20,20,27,0.11) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
      onPointerDown={() => {
        if (editingId) setEditingId(null)
        select(null)
      }}
    >
      <div className="m-auto shrink-0 p-14">
        <div
          className="relative"
          style={{ width: Math.round(design.width * zoom), height: Math.round(design.height * zoom) }}
        >
          {/* Exportable page */}
          <div
            ref={pageRef}
            data-canvas-page
            className="canvas-page absolute left-0 top-0 origin-top-left shadow-[0_30px_80px_-30px_rgba(20,20,27,0.45)]"
            style={{
              width: design.width,
              height: design.height,
              background: page.background,
              transform: `scale(${zoom})`,
            }}
          >
            {page.elements.map((element) => {
              const isEditing = editingId === element.id && element.type === 'text'
              return (
                <div
                  key={element.id}
                  style={{
                    ...elementBoxStyle(element),
                    cursor: element.locked ? 'default' : 'move',
                  }}
                  onPointerDown={(event) => startMove(event, element)}
                  onDoubleClick={(event) => {
                    event.stopPropagation()
                    if (element.type === 'text' && !element.locked) {
                      setEditingId(element.id)
                      select(element.id)
                    }
                  }}
                >
                  {isEditing && element.type === 'text' ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      ref={(node) => {
                        if (!node || node.dataset.focused === '1') return
                        node.dataset.focused = '1'
                        node.focus()
                        const range = document.createRange()
                        range.selectNodeContents(node)
                        const selection = window.getSelection()
                        selection?.removeAllRanges()
                        selection?.addRange(range)
                      }}
                      style={{ ...textStyle(element), cursor: 'text' }}
                      className="text-editing"
                      dangerouslySetInnerHTML={{ __html: escapeHtml(element.text) }}
                      onPointerDown={(event) => event.stopPropagation()}
                      onBlur={(event) => {
                        const text = event.currentTarget.innerText.replace(/\n$/, '')
                        updateElement(element.id, { text })
                        setEditingId(null)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          event.preventDefault()
                          event.currentTarget.blur()
                        }
                        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                          event.preventDefault()
                          event.currentTarget.blur()
                        }
                      }}
                    />
                  ) : (
                    <ElementGraphic el={element} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Guides + selection overlay (never exported) */}
          <div
            className="pointer-events-none absolute left-0 top-0 origin-top-left"
            style={{ width: design.width, height: design.height, transform: `scale(${zoom})` }}
          >
            {guides.v.map((guide, index) => (
              <div
                key={`v-${index}`}
                className="absolute top-0"
                style={{ left: guide, width: 1 / zoom, height: design.height, background: '#ff2d87' }}
              />
            ))}
            {guides.h.map((guide, index) => (
              <div
                key={`h-${index}`}
                className="absolute left-0"
                style={{ top: guide, height: 1 / zoom, width: design.width, background: '#ff2d87' }}
              />
            ))}

            {selected && editingId !== selected.id ? (
              <div
                className="absolute"
                style={{
                  left: selected.x,
                  top: selected.y,
                  width: selected.w,
                  height: selected.h,
                  transform: `rotate(${selected.rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                <div
                  className="selection-outline"
                  style={{ inset: 0, borderWidth: outlineWidth, pointerEvents: 'none' }}
                />
                {selected.locked ? (
                  <div className="absolute -top-7 left-0 flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium text-cream" style={{ pointerEvents: 'none' }}>
                    <Lock size={9} /> Locked
                  </div>
                ) : (
                  <>
                    <div
                      className="absolute rounded-full bg-white"
                      style={{
                        width: handleSize + 2,
                        height: handleSize + 2,
                        left: selected.w / 2 - (handleSize + 2) / 2,
                        top: -34 / zoom,
                        border: `${outlineWidth}px solid #ff5b3c`,
                        cursor: 'grab',
                        pointerEvents: 'auto',
                      }}
                      onPointerDown={(event) => startRotate(event, selected)}
                      title="Rotate"
                    />
                    <div
                      className="absolute bg-coral"
                      style={{
                        width: outlineWidth,
                        height: 26 / zoom,
                        left: selected.w / 2,
                        top: -26 / zoom,
                        pointerEvents: 'none',
                      }}
                    />
                    {HANDLES.map((handle) => (
                      <div
                        key={handle}
                        className="handle"
                        style={{
                          ...handlePosition(handle),
                          borderWidth: outlineWidth,
                          cursor: cursorFor(handle),
                          pointerEvents: 'auto',
                        }}
                        onPointerDown={(event) => startResize(event, selected, handle)}
                      />
                    ))}
                  </>
                )}

                {selectedId ? (
                  <div
                    className="absolute whitespace-nowrap rounded-full bg-coral px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{
                      left: 0,
                      top: selected.h + 8 / zoom,
                      fontSize: 11 / zoom,
                      padding: `${3 / zoom}px ${6 / zoom}px`,
                      pointerEvents: 'none',
                    }}
                  >
                    {Math.round(selected.w)} × {Math.round(selected.h)}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-ink/10 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => setZoom(zoom - 0.1)}
            className="grid h-7 w-7 place-items-center rounded-full text-sm font-semibold text-ink-mute hover:bg-cream hover:text-ink"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="min-w-[46px] text-center text-[11px] font-semibold tabular-nums text-ink">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(zoom + 0.1)}
            className="grid h-7 w-7 place-items-center rounded-full text-sm font-semibold text-ink-mute hover:bg-cream hover:text-ink"
            aria-label="Zoom in"
          >
            +
          </button>
          <span className="mx-1 h-4 w-px bg-ink/10" />
          <span className="px-1 text-[11px] font-medium text-ink-mute">
            {design.width} × {design.height}
          </span>
        </div>
      </div>
    </div>
  )
}
