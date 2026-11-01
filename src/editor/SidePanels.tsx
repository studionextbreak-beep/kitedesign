import { useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Files,
  GripVertical,
  Image as ImageIcon,
  Layers2,
  LayoutTemplate,
  Lock,
  PaintBucket,
  Plus,
  Search,
  Shapes,
  Square,
  Trash2,
  Type,
  Unlock,
  Upload,
  X,
} from 'lucide-react'
import { useEditor } from '@/editor/EditorContext'
import type { PanelTab } from '@/editor/EditorContext'
import { ElementGraphic, ResponsivePageThumb } from '@/editor/render'
import { newImage, newShape, newText, SHAPE_DEFAULT_SIZE } from '@/lib/factories'
import {
  FONTS,
  GRADIENTS,
  PALETTES,
  PATTERNS,
  SHAPES,
  SOLID_COLORS,
  TEMPLATE_CATEGORIES,
  TEXT_PRESETS,
} from '@/lib/constants'
import { PHOTOS, PHOTO_CATEGORIES, photoUrl } from '@/lib/photos'
import { TEMPLATES } from '@/lib/templates'
import type { ShapeKind } from '@/lib/types'
import { cn } from '@/lib/utils'

const TABS: { id: PanelTab; label: string; icon: typeof LayoutTemplate }[] = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'elements', label: 'Elements', icon: Shapes },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'uploads', label: 'Uploads', icon: Upload },
  { id: 'photos', label: 'Photos', icon: ImageIcon },
  { id: 'background', label: 'Background', icon: PaintBucket },
  { id: 'layers', label: 'Layers', icon: Layers2 },
  { id: 'pages', label: 'Pages', icon: Files },
]

const STICKERS = ['✳', '★', '☀', '❋', '✿', '→', '♥', '✓', '✷', '◆', '❍', '✺', '⌁', '✷']

export function SidePanels() {
  const { tab, setTab } = useEditor()

  return (
    <>
      <nav className="flex w-[70px] shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-r border-ink/10 bg-white py-2">
        {TABS.map((item) => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'flex w-[58px] flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors',
                active ? 'bg-coral/10 text-coral' : 'text-ink-mute hover:bg-cream hover:text-ink',
              )}
            >
              <item.icon size={19} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <aside className="hidden w-[292px] shrink-0 flex-col border-r border-ink/10 bg-white md:flex">
        <PanelBody />
      </aside>
    </>
  )
}

function PanelBody() {
  const { tab } = useEditor()
  const titles: Record<PanelTab, { title: string; hint: string }> = {
    templates: { title: 'Templates', hint: 'Apply to the current page' },
    elements: { title: 'Elements', hint: 'Shapes, lines and stickers' },
    text: { title: 'Text', hint: 'Add a heading or body copy' },
    uploads: { title: 'Uploads', hint: 'Images from your device' },
    photos: { title: 'Photos', hint: 'Free stock photography' },
    background: { title: 'Background', hint: 'Colour, gradients and texture' },
    layers: { title: 'Layers', hint: 'Everything on this page, front to back' },
    pages: { title: 'Pages', hint: 'Manage the pages in this design' },
  }
  const meta = titles[tab]

  return (
    <>
      <div className="border-b border-ink/8 px-4 py-3">
        <h2 className="text-sm font-semibold">{meta.title}</h2>
        <p className="text-[11px] text-ink-mute">{meta.hint}</p>
      </div>
      <div className="editor-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === 'templates' ? <TemplatesPanel /> : null}
        {tab === 'elements' ? <ElementsPanel /> : null}
        {tab === 'text' ? <TextPanel /> : null}
        {tab === 'uploads' ? <UploadsPanel /> : null}
        {tab === 'photos' ? <PhotosPanel /> : null}
        {tab === 'background' ? <BackgroundPanel /> : null}
        {tab === 'layers' ? <LayersPanel /> : null}
        {tab === 'pages' ? <PagesPanel /> : null}
      </div>
    </>
  )
}

function TemplatesPanel() {
  const { applyTemplate } = useEditor()
  const [category, setCategory] = useState<string>('All')
  const [query, setQuery] = useState('')

  const results = TEMPLATES.filter((template) => {
    if (category !== 'All' && template.category !== category) return false
    if (!query.trim()) return true
    return `${template.name} ${template.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())
  })

  return (
    <div>
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates"
          className="field h-8 pl-8 text-xs"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {TEMPLATE_CATEGORIES.filter((item) => item !== 'All').map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(category === item ? 'All' : item)}
            className={cn(
              'rounded-full border px-2 py-1 text-[10px] font-medium transition-colors',
              category === item ? 'border-ink bg-ink text-cream' : 'border-ink/12 text-ink-mute hover:border-ink/40',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {results.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => applyTemplate(template.id)}
            className="group overflow-hidden rounded-lg border border-ink/8 bg-cream/40 p-1 text-left transition-all hover:-translate-y-0.5 hover:border-coral hover:shadow-md"
          >
            <ResponsivePageThumb design={template.design} page={template.design.pages[0]} radius={5} />
            <p className="truncate px-0.5 pt-1.5 text-[10px] font-medium text-ink/80">{template.name}</p>
          </button>
        ))}
      </div>
      {results.length === 0 ? <p className="mt-6 text-center text-xs text-ink-mute">No templates match that.</p> : null}
    </div>
  )
}

function ElementsPanel() {
  const { design, addElement, notify } = useEditor()
  const previews = useMemo(
    () => SHAPES.map((shape) => ({ shape, element: newShape({ shape: shape.kind, w: 40, h: 40, strokeWidth: 0 }) })),
    [],
  )

  function addShape(kind: ShapeKind) {
    const size = SHAPE_DEFAULT_SIZE[kind]
    const scale = Math.min(1, (design.width * 0.42) / size.w)
    addElement(
      newShape({
        shape: kind,
        w: Math.round(size.w * scale),
        h: Math.round(size.h * scale),
        x: Math.round((design.width - size.w * scale) / 2),
        y: Math.round((design.height - size.h * scale) / 2),
        fill: kind === 'line' || kind === 'ring' ? '#14141b' : '#ff5b3c',
        strokeWidth: kind === 'ring' ? 8 : 0,
        radius: kind === 'rect' ? 8 : 0,
        name: SHAPES.find((item) => item.kind === kind)?.name ?? 'Shape',
      }),
    )
    notify('Shape added')
  }

  function addSticker(symbol: string) {
    addElement(
      newText({
        text: symbol,
        x: Math.round(design.width / 2 - design.width * 0.06),
        y: Math.round(design.height / 2 - design.width * 0.06),
        w: Math.round(design.width * 0.12),
        h: Math.round(design.width * 0.12),
        fontSize: Math.round(design.width * 0.1),
        fontFamily: 'Inter',
        color: '#14141b',
        align: 'center',
        name: 'Sticker',
      }),
    )
  }

  return (
    <div>
      <p className="label">Shapes</p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {previews.map(({ shape, element }) => (
          <button
            key={shape.kind}
            type="button"
            onClick={() => addShape(shape.kind)}
            className="grid aspect-square place-items-center rounded-lg border border-ink/8 bg-cream/50 p-2 text-ink transition-all hover:-translate-y-0.5 hover:border-coral hover:bg-coral/5"
            title={shape.name}
          >
            <span className="block h-6 w-6">
              <ElementGraphic el={element} />
            </span>
          </button>
        ))}
      </div>

      <p className="label mt-5">Lines</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[3, 6, 12].map((thickness) => (
          <button
            key={thickness}
            type="button"
            onClick={() => {
              addElement(
                newShape({
                  shape: 'line',
                  w: Math.round(design.width * 0.4),
                  h: thickness,
                  x: Math.round(design.width * 0.3),
                  y: Math.round(design.height / 2),
                  fill: '#14141b',
                  strokeWidth: thickness,
                  name: 'Line',
                }),
              )
            }}
            className="flex h-9 items-center justify-center rounded-lg border border-ink/8 bg-cream/50 hover:border-coral"
          >
            <span className="block w-7 rounded-full bg-ink" style={{ height: thickness }} />
          </button>
        ))}
      </div>

      <p className="label mt-5">Stickers</p>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {STICKERS.map((symbol, index) => (
          <button
            key={`${symbol}-${index}`}
            type="button"
            onClick={() => addSticker(symbol)}
            className="grid aspect-square place-items-center rounded-lg text-lg text-ink transition-colors hover:bg-coral/10 hover:text-coral"
          >
            {symbol}
          </button>
        ))}
      </div>

      <p className="label mt-5">Brand colours</p>
      <div className="mt-2 flex gap-1.5">
        {PALETTES[0].colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() =>
              addElement(
                newShape({
                  shape: 'rect',
                  w: Math.round(design.width * 0.18),
                  h: Math.round(design.width * 0.18),
                  x: Math.round(design.width / 2 - design.width * 0.09),
                  y: Math.round(design.height / 2 - design.width * 0.09),
                  fill: color,
                  name: 'Colour block',
                }),
              )
            }
            className="h-7 flex-1 rounded-md ring-1 ring-inset ring-ink/10 transition-transform hover:-translate-y-0.5"
            style={{ background: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}

function TextPanel() {
  const { design, addElement } = useEditor()
  const factor = design.width / 1080

  function addPreset(preset: (typeof TEXT_PRESETS)[number]) {
    const fontSize = Math.round(preset.fontSize * factor)
    addElement(
      newText({
        text: preset.sample,
        x: Math.round(design.width * 0.08),
        y: Math.round(design.height * 0.42),
        w: Math.round(design.width * 0.84),
        h: Math.round(preset.h * factor),
        fontSize,
        fontWeight: preset.fontWeight,
        fontFamily: preset.fontFamily,
        lineHeight: preset.lineHeight,
        name: preset.label.replace('Add a ', ''),
      }),
    )
  }

  return (
    <div>
      <div className="space-y-1.5">
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => addPreset(preset)}
            className="w-full rounded-lg border border-ink/10 bg-cream/40 px-3 py-2.5 text-left transition-all hover:border-coral hover:bg-white"
          >
            <span
              className="block truncate font-display leading-tight"
              style={{ fontSize: preset.id === 'heading' ? 20 : preset.id === 'subheading' ? 16 : 12, fontWeight: preset.fontWeight }}
            >
              {preset.label}
            </span>
          </button>
        ))}
      </div>

      <p className="label mt-5">Font pairings</p>
      <div className="mt-2 space-y-1">
        {FONTS.map((font) => (
          <button
            key={font.name}
            type="button"
            onClick={() =>
              addElement(
                newText({
                  text: 'Your words here',
                  x: Math.round(design.width * 0.08),
                  y: Math.round(design.height * 0.45),
                  w: Math.round(design.width * 0.84),
                  h: Math.round(110 * factor),
                  fontFamily: font.name,
                  fontSize: Math.round(64 * factor),
                  fontWeight: 600,
                  name: font.name,
                }),
              )
            }
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-cream"
          >
            <span className="truncate text-base leading-tight" style={{ fontFamily: font.stack }}>
              {font.name}
            </span>
            <span className="shrink-0 text-[9px] uppercase tracking-wider text-ink-mute">{font.kind}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function UploadsPanel() {
  const { design, addElement, notify } = useEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<{ src: string; name: string }[]>([])
  const [dragging, setDragging] = useState(false)

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    Array.from(files)
      .slice(0, 6)
      .forEach((file) => {
        if (!file.type.startsWith('image/')) {
          notify('Only image files can be uploaded')
          return
        }
        if (file.size > 3_000_000) {
          notify('That image is over 3MB — try a smaller one')
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          const src = String(reader.result)
          const image = new window.Image()
          image.onload = () => {
            const maxW = design.width * 0.55
            const maxH = design.height * 0.55
            const ratio = Math.min(maxW / image.width, maxH / image.height, 1)
            const w = Math.round(image.width * ratio)
            const h = Math.round(image.height * ratio)
            addElement(
              newImage({
                src,
                w,
                h,
                x: Math.round((design.width - w) / 2),
                y: Math.round((design.height - h) / 2),
                name: file.name.replace(/\.[^.]+$/, ''),
              }),
            )
            setUploads((current) => [{ src, name: file.name }, ...current].slice(0, 8))
            notify('Image added')
          }
          image.src = src
        }
        reader.readAsDataURL(file)
      })
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          addFiles(event.dataTransfer.files)
        }}
        className={cn(
          'rounded-xl border-2 border-dashed p-5 text-center transition-colors',
          dragging ? 'border-coral bg-coral/5' : 'border-ink/15',
        )}
      >
        <Upload size={20} className="mx-auto text-ink-mute" />
        <p className="mt-2 text-xs font-medium">Drop an image here</p>
        <p className="mt-0.5 text-[10px] text-ink-mute">JPG, PNG or WebP · up to 3MB</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-ink mt-3 h-8 px-3 text-[11px]">
          Choose a file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      {uploads.length > 0 ? (
        <>
          <p className="label mt-5">This session</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {uploads.map((upload) => (
              <button
                key={upload.src.slice(-24) + upload.name}
                type="button"
                onClick={() =>
                  addElement(
                    newImage({
                      src: upload.src,
                      w: Math.round(design.width * 0.4),
                      h: Math.round(design.width * 0.4),
                      x: Math.round(design.width * 0.3),
                      y: Math.round(design.height * 0.3),
                      name: upload.name,
                    }),
                  )
                }
                className="aspect-square overflow-hidden rounded-lg border border-ink/8 hover:border-coral"
              >
                <img src={upload.src} alt={upload.name} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </>
      ) : null}

      <p className="mt-5 rounded-lg bg-cream/70 p-2.5 text-[10px] leading-relaxed text-ink-mute">
        Uploads are embedded in this design, so they will still be there when you reopen it on this device.
      </p>
    </div>
  )
}

function PhotosPanel() {
  const { design, addElement } = useEditor()
  const [category, setCategory] = useState<string>('All')
  const photos = PHOTOS.filter((photo) => category === 'All' || photo.category === category)

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {PHOTO_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn(
              'rounded-full border px-2 py-1 text-[10px] font-medium transition-colors',
              category === item ? 'border-ink bg-ink text-cream' : 'border-ink/12 text-ink-mute hover:border-ink/40',
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() =>
              addElement(
                newImage({
                  src: photoUrl(photo.seed, 900, 900),
                  w: Math.round(design.width * 0.46),
                  h: Math.round(design.width * 0.46),
                  x: Math.round(design.width * 0.27),
                  y: Math.round(design.height * 0.27),
                  name: photo.label,
                }),
              )
            }
            className="group relative aspect-square overflow-hidden rounded-lg bg-sand"
          >
            <img
              src={photoUrl(photo.seed, 320, 320)}
              alt={photo.label}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ink/70 to-transparent px-1.5 pb-1 pt-4 text-left text-[9px] font-medium text-white">
              {photo.label}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-ink-mute">Stock photos are fetched from a free image service and need a connection.</p>
    </div>
  )
}

function BackgroundPanel() {
  const { page, setPageBackground, notify } = useEditor()
  const [custom, setCustom] = useState('#fdf8f1')

  return (
    <div>
      <p className="label">Colours</p>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {SOLID_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setPageBackground(color)}
            className={cn(
              'aspect-square rounded-md ring-1 ring-inset ring-ink/10 transition-transform hover:scale-110',
              page.background === color && 'ring-2 ring-coral',
            )}
            style={{ background: color }}
            title={color}
          />
        ))}
      </div>

      <p className="label mt-5">Gradients</p>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {GRADIENTS.map((gradient) => (
          <button
            key={gradient}
            type="button"
            onClick={() => setPageBackground(gradient)}
            className={cn(
              'aspect-square rounded-md ring-1 ring-inset ring-ink/10 transition-transform hover:scale-105',
              page.background === gradient && 'ring-2 ring-coral',
            )}
            style={{ background: gradient }}
          />
        ))}
      </div>

      <p className="label mt-5">Patterns</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {PATTERNS.map((pattern) => (
          <button
            key={pattern.id}
            type="button"
            onClick={() => setPageBackground(`${pattern.css}, #fdf8f1`)}
            className="overflow-hidden rounded-lg border border-ink/10 hover:border-coral"
            title={pattern.name}
          >
            <span className="block h-12 w-full" style={{ background: `${pattern.css}, #fdf8f1` }} />
            <span className="block bg-white px-1 py-0.5 text-[9px] font-medium">{pattern.name}</span>
          </button>
        ))}
      </div>

      <p className="label mt-5">Custom</p>
      <div className="mt-2 flex items-center gap-1.5">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(page.background) ? page.background : custom}
          onChange={(event) => {
            setCustom(event.target.value)
            setPageBackground(event.target.value, false)
          }}
          onBlur={() => notify('Background updated')}
          className="h-8 w-9 cursor-pointer rounded border border-ink/15 bg-white p-0.5"
          aria-label="Custom background colour"
        />
        <input
          value={page.background}
          onChange={(event) => setPageBackground(event.target.value, false)}
          className="field h-8 flex-1 font-mono text-[11px]"
          aria-label="Background CSS value"
        />
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-ink-mute">
        Solid colours, gradients and CSS backgrounds all work here.
      </p>
    </div>
  )
}

function PagesPanel() {
  const { design, pageIndex, setPageIndex, addPage, duplicatePage, deletePage } = useEditor()
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="label">All pages ({design.pages.length})</span>
        <ChevronDown size={14} className={cn('text-ink-mute transition-transform', !expanded && '-rotate-90')} />
      </button>

      {expanded ? (
        <div className="mt-2 space-y-2">
          {design.pages.map((page, index) => (
            <div
              key={page.id}
              className={cn(
                'group relative rounded-lg border p-1.5 transition-colors',
                index === pageIndex ? 'border-coral bg-coral/5' : 'border-ink/10 hover:border-ink/30',
              )}
            >
              <button type="button" onClick={() => setPageIndex(index)} className="block w-full">
                <ResponsivePageThumb design={design} page={page} radius={4} />
                <span className="mt-1 flex items-center justify-between px-0.5 text-[10px] font-medium text-ink-mute">
                  Page {index + 1}
                  <span>{page.elements.length} el.</span>
                </span>
              </button>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => duplicatePage(index)}
                  className="grid h-6 w-6 place-items-center rounded bg-white/90 text-ink shadow ring-1 ring-ink/10 hover:text-coral"
                  title="Duplicate page"
                >
                  <Copy size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => deletePage(index)}
                  className="grid h-6 w-6 place-items-center rounded bg-white/90 text-ink shadow ring-1 ring-ink/10 hover:text-coral"
                  title="Delete page"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <button type="button" onClick={addPage} className="btn btn-ghost mt-3 h-8 w-full text-[11px]">
        <Plus size={13} /> Add page
      </button>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-cream/70 p-2.5 text-[10px] text-ink-mute">
        <span>{design.width} × {design.height} px</span>
        <button type="button" onClick={() => setExpanded(true)} className="inline-flex items-center gap-0.5 hover:text-ink">
          <X size={10} /> {design.pages.length} pages
        </button>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-ink-mute">
        Tip: pages are separate canvases, not extra space. Use them for decks and carousels.
      </p>
    </div>
  )
}

function LayersPanel() {
  const { page, selectedId, select, updateElement, reorderElement, moveElement } = useEditor()
  const layers = [...page.elements].reverse()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropId, setDropId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  function iconFor(element: (typeof page.elements)[number]) {
    if (element.type === 'text') return <Type size={12} />
    if (element.type === 'image') return <ImageIcon size={12} />
    return <Square size={12} />
  }

  function commitRename(element: (typeof page.elements)[number]) {
    const name = draft.trim()
    if (name && name !== element.name) updateElement(element.id, { name })
    setRenamingId(null)
    setDraft('')
  }

  function finishDrag() {
    setDraggingId(null)
    setDropId(null)
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      finishDrag()
      return
    }
    const rest = page.elements.filter((element) => element.id !== draggingId)
    const targetIndex = rest.findIndex((element) => element.id === targetId)
    if (targetIndex >= 0) moveElement(draggingId, targetIndex)
    finishDrag()
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="label">Front to back</span>
        <span className="text-[10px] text-ink-mute">
          {page.elements.length} {page.elements.length === 1 ? 'element' : 'elements'}
        </span>
      </div>

      {layers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink/15 px-3 py-6 text-center text-[11px] text-ink-mute">
          This page is empty. Add text, a shape or a photo to get started.
        </p>
      ) : (
        <div className="space-y-1">
          {layers.map((element) => {
            const index = page.elements.findIndex((item) => item.id === element.id)
            const isFront = index === page.elements.length - 1
            const isBack = index === 0
            const active = selectedId === element.id
            const isRenaming = renamingId === element.id
            return (
              <div
                key={element.id}
                draggable={!isRenaming}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move'
                  event.dataTransfer.setData('text/plain', element.id)
                  setDraggingId(element.id)
                }}
                onDragEnd={finishDrag}
                onDragOver={(event) => {
                  if (!draggingId || draggingId === element.id) return
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  setDropId(element.id)
                }}
                onDragLeave={() => setDropId((current) => (current === element.id ? null : current))}
                onDrop={(event) => {
                  event.preventDefault()
                  handleDrop(element.id)
                }}
                className={cn(
                  'group flex items-center gap-1 rounded-lg border px-1 py-1.5 transition-colors',
                  active ? 'border-coral bg-coral/5' : 'border-transparent hover:bg-cream',
                  draggingId === element.id && 'opacity-40',
                  dropId === element.id && draggingId !== element.id && 'border-coral bg-coral/10',
                )}
              >
                <span className="shrink-0 cursor-grab text-ink/25 transition-colors group-hover:text-ink/50" title="Drag to restack">
                  <GripVertical size={13} />
                </span>

                {isRenaming ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onFocus={(event) => event.currentTarget.select()}
                    onBlur={() => commitRename(element)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        commitRename(element)
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        setRenamingId(null)
                        setDraft('')
                      }
                    }}
                    className="h-6 min-w-0 flex-1 rounded border border-coral bg-white px-1.5 text-[11px] font-medium outline-none"
                    aria-label="Layer name"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => select(element.id)}
                    onDoubleClick={() => {
                      setRenamingId(element.id)
                      setDraft(element.name)
                    }}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                    title={`${element.name} — double-click to rename`}
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-cream text-ink-mute">
                      {iconFor(element)}
                    </span>
                    <span
                      className={cn(
                        'truncate text-[11px] font-medium',
                        element.hidden && 'text-ink-mute line-through',
                        active ? 'text-ink' : 'text-ink/80',
                      )}
                    >
                      {element.name}
                    </span>
                  </button>
                )}

                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => reorderElement(element.id, 'forward')}
                    disabled={isFront}
                    className="grid h-6 w-5 place-items-center rounded text-ink-mute hover:text-ink disabled:opacity-25"
                    title="Move forward"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderElement(element.id, 'backward')}
                    disabled={isBack}
                    className="grid h-6 w-5 place-items-center rounded text-ink-mute hover:text-ink disabled:opacity-25"
                    title="Move backward"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => updateElement(element.id, { hidden: !element.hidden })}
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded',
                    element.hidden ? 'text-coral' : 'text-ink-mute hover:text-ink',
                  )}
                  title={element.hidden ? 'Show on canvas' : 'Hide from canvas'}
                >
                  {element.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => updateElement(element.id, { locked: !element.locked })}
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded',
                    element.locked ? 'text-coral' : 'text-ink-mute hover:text-ink',
                  )}
                  title={element.locked ? 'Unlock' : 'Lock'}
                >
                  {element.locked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-3 rounded-lg bg-cream/70 p-2.5 text-[10px] leading-relaxed text-ink-mute">
        Drag a row to restack it, double-click a name to rename. The top of the list is the front of the canvas, and
        hidden elements are skipped in exports until you show them again.
      </p>
    </div>
  )
}
