import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  Loader2,
  Maximize,
  Play,
  Redo2,
  Share2,
  Undo2,
} from 'lucide-react'
import { useEditor } from '@/editor/EditorContext'
import { KiteMark } from '@/components/Logo'
import { cn } from '@/lib/utils'

const EXPORT_OPTIONS = [
  { scale: 1, label: 'PNG · 1×', hint: 'Screen' },
  { scale: 2, label: 'PNG · 2×', hint: 'Recommended' },
  { scale: 3, label: 'PNG · 3×', hint: 'Print' },
]

export function TopBar() {
  const { design, setTitle, undo, redo, canUndo, canRedo, zoom, setZoom, requestFit, exportPng, exportPdf, startPresent, savedAt, exporting, notify } =
    useEditor()
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (!savedAt) return
    setJustSaved(true)
    const timer = window.setTimeout(() => setJustSaved(false), 1800)
    return () => window.clearTimeout(timer)
  }, [savedAt])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('Link copied to clipboard')
    } catch {
      notify('Copy the URL from your address bar')
    }
  }

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-ink/10 bg-white px-2 sm:px-3">
      <Link
        to="/dashboard"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-mute transition-colors hover:bg-cream hover:text-ink"
        title="Back to your work"
      >
        <ArrowLeft size={17} />
      </Link>
      <Link to="/" className="hidden sm:block" title="Kite home">
        <KiteMark size={24} />
      </Link>

      <div className="mx-1 hidden h-6 w-px bg-ink/10 sm:block" />

      <div className="flex min-w-0 items-center gap-2">
        <input
          value={design.title}
          onChange={(event) => setTitle(event.target.value)}
          className="min-w-0 max-w-[220px] truncate rounded-md px-2 py-1 text-sm font-semibold outline-none transition-colors hover:bg-cream focus:bg-cream"
          aria-label="Design title"
        />
        <span className="hidden items-center gap-1 text-[11px] text-ink-mute lg:flex">
          {justSaved ? (
            <>
              <Check size={12} className="text-mint" /> Saved
            </>
          ) : savedAt ? (
            'All changes saved'
          ) : (
            'Autosaving'
          )}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="hidden items-center rounded-lg border border-ink/10 bg-cream/60 p-0.5 sm:flex">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="grid h-7 w-7 place-items-center rounded-md text-ink-mute transition-colors hover:bg-white hover:text-ink disabled:opacity-30"
            title="Undo (⌘Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="grid h-7 w-7 place-items-center rounded-md text-ink-mute transition-colors hover:bg-white hover:text-ink disabled:opacity-30"
            title="Redo (⇧⌘Z)"
          >
            <Redo2 size={15} />
          </button>
        </div>

        <div className="hidden items-center gap-1 rounded-lg border border-ink/10 bg-cream/60 px-1 py-0.5 md:flex">
          <button
            type="button"
            onClick={() => setZoom(zoom - 0.1)}
            className="grid h-7 w-6 place-items-center rounded text-ink-mute hover:bg-white hover:text-ink"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="min-w-[42px] text-center text-[11px] font-semibold tabular-nums">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom(zoom + 0.1)}
            className="grid h-7 w-6 place-items-center rounded text-ink-mute hover:bg-white hover:text-ink"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={requestFit}
            className="grid h-7 w-7 place-items-center rounded text-ink-mute hover:bg-white hover:text-ink"
            title="Fit to screen"
          >
            <Maximize size={13} />
          </button>
        </div>

        <button type="button" onClick={copyLink} className="btn btn-white h-8 px-3 text-xs">
          <Share2 size={14} />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button
          type="button"
          onClick={startPresent}
          className="btn btn-white hidden h-8 px-3 text-xs sm:inline-flex"
          title="Present fullscreen"
        >
          <Play size={13} />
          <span className="hidden lg:inline">Present</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDownloadOpen((value) => !value)}
            disabled={exporting}
            className="btn btn-coral h-8 gap-1.5 px-3 text-xs"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span className="hidden sm:inline">{exporting ? 'Exporting' : 'Download'}</span>
            <ChevronDown size={13} />
          </button>
          {downloadOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setDownloadOpen(false)}
                aria-label="Close download menu"
              />
              <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-xl border border-ink/10 bg-white py-1 shadow-xl">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-mute">Download</p>
                {EXPORT_OPTIONS.map((option) => (
                  <button
                    key={option.scale}
                    type="button"
                    onClick={() => {
                      setDownloadOpen(false)
                      void exportPng(option.scale)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium hover:bg-cream',
                    )}
                  >
                    <span>{option.label}</span>
                    <span className="text-[10px] text-ink-mute">{option.hint}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setDownloadOpen(false)
                    void exportPdf()
                  }}
                  className="flex w-full items-center justify-between border-t border-ink/8 px-3 py-2 text-left text-xs font-medium hover:bg-cream"
                >
                  <span>PDF · all pages</span>
                  <span className="text-[10px] text-ink-mute">
                    {design.pages.length} {design.pages.length === 1 ? 'page' : 'pages'}
                  </span>
                </button>
                <p className="border-t border-ink/8 px-3 py-2 text-[10px] leading-relaxed text-ink-mute">
                  No watermark. Free plan exports up to 2×.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
