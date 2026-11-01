import { useRef } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Copy,
  FlipHorizontal2,
  Italic,
  Lock,
  RotateCcw,
  Trash2,
  Underline,
  Unlock,
  Upload,
} from 'lucide-react'
import { useEditor } from '@/editor/EditorContext'
import type { AlignPosition, LayerDirection } from '@/editor/EditorContext'
import { FONTS, GRADIENTS, PALETTES, SOLID_COLORS } from '@/lib/constants'
import type { Design, DesignElement, ImageElement, ShapeElement, TextElement } from '@/lib/types'
import { cn, normalizeHex, round } from '@/lib/utils'

const HORIZONTAL: { id: AlignPosition; label: string }[] = [
  { id: 'left', label: 'L' },
  { id: 'center', label: 'C' },
  { id: 'right', label: 'R' },
]
const VERTICAL: { id: AlignPosition; label: string }[] = [
  { id: 'top', label: 'T' },
  { id: 'middle', label: 'M' },
  { id: 'bottom', label: 'B' },
]
const LAYERS: { id: LayerDirection; icon: typeof ChevronsUp; title: string }[] = [
  { id: 'front', icon: ChevronsUp, title: 'Bring to front' },
  { id: 'forward', icon: ChevronUp, title: 'Bring forward' },
  { id: 'backward', icon: ChevronDown, title: 'Send backward' },
  { id: 'back', icon: ChevronsDown, title: 'Send to back' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink/8 px-4 py-4">
      <p className="label mb-2.5">{title}</p>
      {children}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  return (
    <label className="flex items-center gap-1.5 rounded-lg border border-ink/12 bg-white px-2 py-1.5 focus-within:border-coral">
      <span className="text-[10px] font-semibold uppercase text-ink-mute">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? round(value, 1) : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full min-w-0 bg-transparent text-right text-[11px] font-medium outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix ? <span className="text-[10px] text-ink-mute">{suffix}</span> : null}
    </label>
  )
}

function ColorControl({
  label,
  value,
  onChange,
  allowGradient = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  allowGradient?: boolean
}) {
  const hex = normalizeHex(value, '#14141b')
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-medium text-ink-mute">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="relative h-7 w-7 overflow-hidden rounded-md ring-1 ring-inset ring-ink/15">
          <input
            type="color"
            value={hex}
            onChange={(event) => onChange(event.target.value)}
            className="absolute -left-2 -top-2 h-11 w-11 cursor-pointer border-0 bg-transparent p-0"
            aria-label={label}
          />
        </span>
        <input
          value={allowGradient ? value : hex}
          onChange={(event) => onChange(event.target.value)}
          className="field h-7 w-[92px] px-2 font-mono text-[10px] uppercase"
          aria-label={`${label} value`}
        />
      </div>
    </div>
  )
}

function Swatches({ onPick }: { onPick: (color: string) => void }) {
  return (
    <div className="mt-2 grid grid-cols-10 gap-1">
      {SOLID_COLORS.slice(0, 20).map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onPick(color)}
          className="aspect-square rounded-[4px] ring-1 ring-inset ring-ink/10 transition-transform hover:scale-110"
          style={{ background: color }}
          title={color}
        />
      ))}
    </div>
  )
}

export function Inspector() {
  const { selected } = useEditor()

  return (
    <aside className="hidden w-[266px] shrink-0 flex-col border-l border-ink/10 bg-white lg:flex">
      {selected ? <ElementInspector element={selected} /> : <PageInspector />}
    </aside>
  )
}

function ElementInspector({ element }: { element: DesignElement }) {
  const { updateElement, pushHistory, deleteElement, duplicateElement, reorderElement, alignElement, design } = useEditor()
  const snapshot = useRef<Design | null>(null)

  const patch = (value: Partial<DesignElement>, history = true) => updateElement(element.id, value, history)

  function begin() {
    if (!snapshot.current) snapshot.current = design
  }
  function end() {
    if (snapshot.current) {
      pushHistory(snapshot.current)
      snapshot.current = null
    }
  }

  const text = element.type === 'text' ? element : null
  const shape = element.type === 'shape' ? element : null
  const image = element.type === 'image' ? element : null

  return (
    <div className="editor-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex items-center justify-between gap-2 border-b border-ink/8 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{element.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-ink-mute">{element.type}</p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => patch({ locked: !element.locked })}
            className={cn(
              'grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-cream',
              element.locked ? 'text-coral' : 'text-ink-mute',
            )}
            title={element.locked ? 'Unlock' : 'Lock'}
          >
            {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <button
            type="button"
            onClick={() => duplicateElement(element.id)}
            className="grid h-7 w-7 place-items-center rounded-md text-ink-mute hover:bg-cream hover:text-ink"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={() => deleteElement(element.id)}
            className="grid h-7 w-7 place-items-center rounded-md text-ink-mute hover:bg-coral/10 hover:text-coral"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {text ? (
        <Section title="Text">
          <textarea
            value={text.text}
            onChange={(event) => patch({ text: event.target.value }, false)}
            onFocus={begin}
            onBlur={end}
            rows={3}
            className="field resize-none text-xs leading-relaxed"
          />
          <div className="mt-2.5 space-y-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-medium text-ink-mute">Font</span>
              <select
                value={text.fontFamily}
                onChange={(event) => patch({ fontFamily: event.target.value } as Partial<DesignElement>)}
                className="field h-8 py-0 text-xs"
              >
                {FONTS.map((font) => (
                  <option key={font.name} value={font.name}>
                    {font.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-1.5">
              <NumberField label="Size" value={text.fontSize} min={6} max={500} onChange={(value) => patch({ fontSize: value } as Partial<DesignElement>)} />
              <label className="flex items-center gap-1.5 rounded-lg border border-ink/12 bg-white px-2 py-1.5">
                <span className="text-[10px] font-semibold uppercase text-ink-mute">Wt</span>
                <select
                  value={text.fontWeight}
                  onChange={(event) => patch({ fontWeight: Number(event.target.value) } as Partial<DesignElement>)}
                  className="w-full bg-transparent text-right text-[11px] font-medium outline-none"
                >
                  {[300, 400, 500, 600, 700, 800].map((weight) => (
                    <option key={weight} value={weight}>
                      {weight}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <NumberField label="LH" value={text.lineHeight} step={0.05} min={0.6} max={3} onChange={(value) => patch({ lineHeight: value } as Partial<DesignElement>)} />
              <NumberField label="LS" value={text.letterSpacing} step={0.01} min={-0.2} max={1} onChange={(value) => patch({ letterSpacing: value } as Partial<DesignElement>)} />
            </div>

            <div className="flex items-center gap-1">
              <div className="flex rounded-lg border border-ink/12 p-0.5">
                {[
                  { id: 'left', icon: AlignLeft },
                  { id: 'center', icon: AlignCenter },
                  { id: 'right', icon: AlignRight },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => patch({ align: option.id } as Partial<DesignElement>)}
                    className={cn(
                      'grid h-7 w-8 place-items-center rounded-md transition-colors',
                      text.align === option.id ? 'bg-ink text-cream' : 'text-ink-mute hover:bg-cream',
                    )}
                  >
                    <option.icon size={14} />
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-1">
                {[
                  { key: 'bold', icon: Bold, active: text.fontWeight >= 700, toggle: () => patch({ fontWeight: text.fontWeight >= 700 ? 400 : 700 } as Partial<DesignElement>) },
                  { key: 'italic', icon: Italic, active: text.italic, toggle: () => patch({ italic: !text.italic } as Partial<DesignElement>) },
                  { key: 'underline', icon: Underline, active: text.underline, toggle: () => patch({ underline: !text.underline } as Partial<DesignElement>) },
                ].map((control) => (
                  <button
                    key={control.key}
                    type="button"
                    onClick={control.toggle}
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-md border border-ink/12 transition-colors',
                      control.active ? 'bg-ink text-cream' : 'text-ink-mute hover:bg-cream',
                    )}
                  >
                    <control.icon size={13} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => patch({ uppercase: !text.uppercase } as Partial<DesignElement>)}
                  className={cn(
                    'grid h-7 w-7 place-items-center rounded-md border border-ink/12 text-[10px] font-bold transition-colors',
                    text.uppercase ? 'bg-ink text-cream' : 'text-ink-mute hover:bg-cream',
                  )}
                  title="Uppercase"
                >
                  AA
                </button>
              </div>
            </div>

            <ColorControl label="Colour" value={text.color} onChange={(value) => patch({ color: value } as Partial<DesignElement>)} />
            <Swatches onPick={(color) => patch({ color } as Partial<DesignElement>)} />
          </div>
        </Section>
      ) : null}

      {shape ? (
        <Section title="Shape">
          <div className="space-y-2.5">
            <ColorControl label="Fill" value={shape.fill} onChange={(value) => patch({ fill: value } as Partial<DesignElement>)} />
            <Swatches onPick={(color) => patch({ fill: color } as Partial<DesignElement>)} />
            {shape.shape === 'rect' ? (
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-ink-mute">
                  <span>Corner radius</span>
                  <span className="font-medium text-ink">{shape.radius >= 999 ? 'Pill' : shape.radius}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={999}
                  value={shape.radius}
                  onChange={(event) => patch({ radius: Number(event.target.value) } as Partial<DesignElement>, false)}
                  onPointerDown={begin}
                  onPointerUp={end}
                  className="w-full"
                />
              </div>
            ) : null}
            <NumberField label="Stroke" value={shape.strokeWidth} min={0} max={80} onChange={(value) => patch({ strokeWidth: value } as Partial<DesignElement>)} />
            {shape.strokeWidth > 0 ? (
              <ColorControl label="Stroke colour" value={shape.stroke} onChange={(value) => patch({ stroke: value } as Partial<DesignElement>)} />
            ) : null}
          </div>
        </Section>
      ) : null}

      {image ? (
        <Section title="Image">
          <div className="space-y-2.5">
            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink/20 py-2 text-[11px] font-medium text-ink-mute transition-colors hover:border-coral hover:text-ink">
              <Upload size={13} /> Replace image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  if (file.size > 3_000_000) return
                  const reader = new FileReader()
                  reader.onload = () => patch({ src: String(reader.result) } as Partial<DesignElement>)
                  reader.readAsDataURL(file)
                }}
              />
            </label>

            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-ink-mute">
                <span>Corner radius</span>
                <span className="font-medium text-ink">{image.radius}</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={image.radius}
                onChange={(event) => patch({ radius: Number(event.target.value) } as Partial<DesignElement>, false)}
                onPointerDown={begin}
                onPointerUp={end}
                className="w-full"
              />
            </div>

            {[
              { key: 'brightness', label: 'Brightness', min: 20, max: 180, value: image.brightness },
              { key: 'contrast', label: 'Contrast', min: 20, max: 180, value: image.contrast },
              { key: 'saturate', label: 'Saturation', min: 0, max: 200, value: image.saturate },
              { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, value: image.grayscale },
              { key: 'blur', label: 'Blur', min: 0, max: 20, value: image.blur },
            ].map((filter) => (
              <div key={filter.key}>
                <div className="mb-1 flex items-center justify-between text-[11px] text-ink-mute">
                  <span>{filter.label}</span>
                  <span className="font-medium text-ink">{Math.round(filter.value)}</span>
                </div>
                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  value={filter.value}
                  onChange={(event) => patch({ [filter.key]: Number(event.target.value) } as Partial<DesignElement>, false)}
                  onPointerDown={begin}
                  onPointerUp={end}
                  className="w-full"
                />
              </div>
            ))}

            <div className="flex gap-1.5">
              <button type="button" onClick={() => patch({ flipX: !image.flipX } as Partial<DesignElement>)} className="btn btn-ghost h-8 flex-1 text-[11px]">
                <FlipHorizontal2 size={13} /> Flip
              </button>
              <button
                type="button"
                onClick={() =>
                  patch({
                    brightness: 100,
                    contrast: 100,
                    saturate: 100,
                    blur: 0,
                    grayscale: 0,
                  } as Partial<DesignElement>)
                }
                className="btn btn-ghost h-8 flex-1 text-[11px]"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>
        </Section>
      ) : null}

      <Section title="Position">
        <div className="grid grid-cols-2 gap-1.5">
          <NumberField label="X" value={element.x} onChange={(value) => patch({ x: value })} />
          <NumberField label="Y" value={element.y} onChange={(value) => patch({ y: value })} />
          <NumberField label="W" value={element.w} min={8} onChange={(value) => patch({ w: Math.max(8, value) })} />
          <NumberField label="H" value={element.h} min={8} onChange={(value) => patch({ h: Math.max(8, value) })} />
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-ink-mute">
            <span>Rotation</span>
            <span className="font-medium text-ink">{Math.round(element.rotation)}°</span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            value={element.rotation}
            onChange={(event) => patch({ rotation: Number(event.target.value) }, false)}
            onPointerDown={begin}
            onPointerUp={end}
            className="w-full"
          />
        </div>

        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-[11px] text-ink-mute">
            <span>Opacity</span>
            <span className="font-medium text-ink">{Math.round(element.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(element.opacity * 100)}
            onChange={(event) => patch({ opacity: Number(event.target.value) / 100 }, false)}
            onPointerDown={begin}
            onPointerUp={end}
            className="w-full"
          />
        </div>

        <p className="label mb-1.5 mt-4">Align to page</p>
        <div className="flex gap-1">
          {HORIZONTAL.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => alignElement(element.id, item.id)}
              className="h-7 flex-1 rounded-md border border-ink/12 text-[10px] font-semibold text-ink-mute hover:border-coral hover:text-coral"
            >
              {item.label}
            </button>
          ))}
          <span className="w-1" />
          {VERTICAL.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => alignElement(element.id, item.id)}
              className="h-7 flex-1 rounded-md border border-ink/12 text-[10px] font-semibold text-ink-mute hover:border-coral hover:text-coral"
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="label mb-1.5 mt-4">Layer order</p>
        <div className="flex gap-1">
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => reorderElement(element.id, layer.id)}
              title={layer.title}
              className="grid h-7 flex-1 place-items-center rounded-md border border-ink/12 text-ink-mute hover:border-coral hover:text-coral"
            >
              <layer.icon size={14} />
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}

function PageInspector() {
  const { design, page, pageIndex, setPageBackground, duplicatePage, addPage, select, notify } = useEditor()

  return (
    <div className="editor-scroll flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="border-b border-ink/8 px-4 py-3">
        <p className="text-sm font-semibold">Page {pageIndex + 1}</p>
        <p className="text-[10px] uppercase tracking-wider text-ink-mute">
          {design.width} × {design.height} px · {page.elements.length} elements
        </p>
      </div>

      <Section title="Background">
        <ColorControl label="Colour" value={page.background} onChange={(value) => setPageBackground(value, false)} allowGradient />
        <Swatches onPick={(color) => setPageBackground(color)} />
        <p className="label mb-1.5 mt-3">Gradients</p>
        <div className="grid grid-cols-5 gap-1">
          {GRADIENTS.map((gradient) => (
            <button
              key={gradient}
              type="button"
              onClick={() => setPageBackground(gradient)}
              className={cn(
                'aspect-square rounded-[4px] ring-1 ring-inset ring-ink/10 transition-transform hover:scale-105',
                page.background === gradient && 'ring-2 ring-coral',
              )}
              style={{ background: gradient }}
            />
          ))}
        </div>
      </Section>

      <Section title="Brand palette">
        {PALETTES.slice(0, 3).map((palette) => (
          <div key={palette.name} className="mb-2 last:mb-0">
            <p className="mb-1 text-[10px] font-medium text-ink-mute">{palette.name}</p>
            <div className="flex gap-1">
              {palette.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPageBackground(color)}
                  className="h-6 flex-1 rounded ring-1 ring-inset ring-ink/10 transition-transform hover:scale-105"
                  style={{ background: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Page actions">
        <div className="space-y-1.5">
          <button type="button" onClick={() => duplicatePage(pageIndex)} className="btn btn-ghost h-8 w-full text-[11px]">
            <Copy size={13} /> Duplicate this page
          </button>
          <button type="button" onClick={addPage} className="btn btn-ghost h-8 w-full text-[11px]">
            Add a blank page
          </button>
          <button
            type="button"
            onClick={() => {
              select(null)
              notify('Nothing selected — click an element to edit it')
            }}
            className="w-full py-1 text-[10px] text-ink-mute hover:text-ink"
          >
            Clear selection
          </button>
        </div>
      </Section>

      <div className="px-4 py-4 text-[10px] leading-relaxed text-ink-mute">
        <p className="font-medium text-ink">Shortcuts</p>
        <p className="mt-1.5">⌘Z undo · ⇧⌘Z redo · ⌘D duplicate · ⌫ delete</p>
        <p>Arrows nudge · ⇧ + arrows move 10px · esc deselect</p>
        <p className="mt-2">Double-click any text to edit it in place.</p>
      </div>
    </div>
  )
}

export type { ImageElement, ShapeElement, TextElement }
