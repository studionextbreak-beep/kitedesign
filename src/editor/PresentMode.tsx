import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEditor } from '@/editor/EditorContext'
import { PageView } from '@/editor/render'
import { clamp } from '@/lib/utils'

/** Full-screen presenter. Arrow keys, space, click zones and Esc all work. */
export function PresentMode({ onClose }: { onClose: () => void }) {
  const { design, pageIndex } = useEditor()
  const total = design.pages.length
  const [index, setIndex] = useState(() => clamp(pageIndex, 0, total - 1))
  const [size, setSize] = useState({ w: 0, h: 0 })
  const stageRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  const go = useCallback(
    (delta: number) => setIndex((current) => clamp(current + delta, 0, total - 1)),
    [total],
  )

  // Fit the page to the viewport.
  useEffect(() => {
    const node = stageRef.current
    if (!node) return
    const measure = () => {
      const rect = node.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Keys beat the editor shortcuts because the editor ignores them while presenting.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault()
        go(1)
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault()
        go(-1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        setIndex(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        setIndex(total - 1)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [go, total])

  // Go fullscreen if the browser allows it; leaving fullscreen ends the show.
  useEffect(() => {
    const node = shellRef.current
    if (node?.requestFullscreen) node.requestFullscreen().catch(() => {})
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) closeRef.current()
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
  }, [])

  const page = design.pages[index]
  const scale = size.w > 0 ? Math.min((size.w - 72) / design.width, (size.h - 72) / design.height) : 0
  const atStart = index === 0
  const atEnd = index === total - 1

  return (
    <div ref={shellRef} className="fixed inset-0 z-[100] flex flex-col bg-[#0b0b10]">
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3 text-cream/80">
        <span className="truncate text-xs font-medium">
          {design.title} <span className="text-cream/40">· page {index + 1} of {total}</span>
        </span>
        <button
          type="button"
          onClick={() => closeRef.current()}
          className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 px-3 py-1.5 text-[11px] font-medium text-cream/80 transition-colors hover:border-cream/50 hover:text-cream"
        >
          <X size={13} /> Exit
        </button>
      </div>

      <div ref={stageRef} className="relative flex min-h-0 flex-1 items-center justify-center px-6 pb-6">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => go(-1)}
          disabled={atStart}
          className="absolute left-0 top-0 z-10 h-full w-[18%] cursor-w-resize disabled:cursor-default"
        />
        <button
          type="button"
          aria-label="Next page"
          onClick={() => go(1)}
          disabled={atEnd}
          className="absolute right-0 top-0 z-10 h-full w-[18%] cursor-e-resize disabled:cursor-default"
        />

        {scale > 0 ? (
          <div
            className="relative shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
            style={{ width: Math.round(design.width * scale), height: Math.round(design.height * scale) }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: design.width, height: design.height, transform: `scale(${scale})` }}
            >
              <PageView page={page} width={design.width} height={design.height} />
            </div>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={atStart}
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-cream/50 hover:text-cream disabled:opacity-25"
            aria-label="Previous page"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="flex items-center gap-1.5">
            {design.pages.map((dot, dotIndex) => (
              <button
                key={dot.id}
                type="button"
                onClick={() => setIndex(dotIndex)}
                className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                  dotIndex === index ? 'w-6 bg-coral' : 'w-1.5 bg-cream/30 hover:bg-cream/60'
                }`}
                aria-label={`Go to page ${dotIndex + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={atEnd}
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-cream/50 hover:text-cream disabled:opacity-25"
            aria-label="Next page"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        <p className="pointer-events-none absolute bottom-4 left-5 hidden text-[10px] text-cream/35 sm:block">
          ← → to move · Esc to exit
        </p>
      </div>
    </div>
  )
}
