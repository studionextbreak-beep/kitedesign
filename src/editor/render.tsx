import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Design, DesignElement, ImageElement, Page, ShapeElement, TextElement } from '@/lib/types'
import { fontStack } from '@/lib/constants'

export function textStyle(el: TextElement): CSSProperties {
  return {
    fontFamily: fontStack(el.fontFamily),
    fontSize: el.fontSize,
    fontWeight: el.fontWeight,
    color: el.color,
    textAlign: el.align,
    lineHeight: el.lineHeight,
    letterSpacing: `${el.letterSpacing}em`,
    fontStyle: el.italic ? 'italic' : 'normal',
    textDecoration: el.underline ? 'underline' : 'none',
    textTransform: el.uppercase ? 'uppercase' : 'none',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    width: '100%',
    height: '100%',
  }
}

function ShapeGraphic({ el }: { el: ShapeElement }) {
  const radius = el.radius >= 999 ? '9999px' : `${el.radius}px`
  const strokeStyle: CSSProperties = {
    border: el.strokeWidth > 0 ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
  }

  if (el.shape === 'rect') {
    return <div style={{ width: '100%', height: '100%', background: el.fill, borderRadius: radius, ...strokeStyle }} />
  }
  if (el.shape === 'ellipse') {
    return <div style={{ width: '100%', height: '100%', background: el.fill, borderRadius: '9999px', ...strokeStyle }} />
  }
  if (el.shape === 'ring') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '9999px',
          border: `${Math.max(el.strokeWidth, 2)}px solid ${el.fill === 'transparent' ? el.stroke : el.fill}`,
        }}
      />
    )
  }
  if (el.shape === 'line') {
    return <div style={{ width: '100%', height: Math.max(el.strokeWidth || 4, 2), background: el.fill, marginTop: '50%' }} />
  }

  const common = {
    width: '100%',
    height: '100%',
    overflow: 'visible' as const,
    display: 'block' as const,
  }
  const stroke = el.strokeWidth > 0 ? el.stroke : 'none'
  const sw = el.strokeWidth

  switch (el.shape) {
    case 'triangle':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={common}>
          <polygon points="50,3 97,97 3,97" fill={el.fill} stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'diamond':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={common}>
          <polygon points="50,1 99,50 50,99 1,50" fill={el.fill} stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={common}>
          <polygon
            points="50,2 61,37 98,37 68,59 79,95 50,73 21,95 32,59 2,37 39,37"
            fill={el.fill}
            stroke={stroke}
            strokeWidth={sw}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={common}>
          <path
            d="M50 92C22 74 4 58 4 38 4 22 16 10 31 10c9 0 15 4 19 11 4-7 10-11 19-11 15 0 27 12 27 28 0 20-18 36-46 54z"
            fill={el.fill}
            stroke={stroke}
            strokeWidth={sw}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )
    case 'blob':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={common}>
          <path
            d="M52 3c19 0 31 12 37 27 6 15 4 32-7 44-11 12-27 22-43 19C23 90 9 75 5 58 1 40 9 21 24 11 32 5 42 3 52 3z"
            fill={el.fill}
            stroke={stroke}
            strokeWidth={sw}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )
    case 'arrow':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={common}>
          <path
            d="M2 50h84M62 22l28 28-28 28"
            fill="none"
            stroke={el.fill}
            strokeWidth={Math.max(sw, 6)}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )
    default:
      return <div style={{ width: '100%', height: '100%', background: el.fill }} />
  }
}

function ImageGraphic({ el, eager = false }: { el: ImageElement; eager?: boolean }) {
  const filter = `brightness(${el.brightness}%) contrast(${el.contrast}%) saturate(${el.saturate}%) blur(${el.blur}px) grayscale(${el.grayscale}%)`
  if (!el.src) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: el.radius,
          background: 'linear-gradient(135deg,#efe9e0,#ddd3c6)',
          display: 'grid',
          placeItems: 'center',
          color: '#8b8378',
          fontSize: Math.max(el.w * 0.05, 12),
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Image
      </div>
    )
  }
  return (
    <img
      src={el.src}
      alt={el.name}
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: el.radius,
        filter,
        transform: el.flipX ? 'scaleX(-1)' : undefined,
        display: 'block',
      }}
    />
  )
}

export function ElementGraphic({ el, editing = false, eager = false }: { el: DesignElement; editing?: boolean; eager?: boolean }) {
  if (el.type === 'text') {
    return <div style={textStyle(el)}>{el.text}</div>
  }
  if (el.type === 'image') return <ImageGraphic el={el} eager={eager} />
  if (editing) return null
  return <ShapeGraphic el={el} />
}

export function elementBoxStyle(el: DesignElement): CSSProperties {
  return {
    position: 'absolute',
    left: el.x,
    top: el.y,
    width: el.w,
    height: el.h,
    transform: `rotate(${el.rotation}deg)`,
    opacity: el.opacity,
    display: el.hidden ? 'none' : undefined,
  }
}

/** Non-interactive page render used for thumbnails, previews and export. */
export function PageView({
  page,
  width,
  height,
  scale = 1,
  className,
  eager = false,
}: {
  page: Page
  width: number
  height: number
  scale?: number
  className?: string
  eager?: boolean
}) {
  return (
    <div
      className={`canvas-page ${className ?? ''}`}
      style={{
        width,
        height,
        background: page.background,
        transform: scale === 1 ? undefined : `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {page.elements.map((el) => (
        <div key={el.id} style={elementBoxStyle(el)}>
          <ElementGraphic el={el} eager={eager} />
        </div>
      ))}
    </div>
  )
}

/** Fits a whole page into a box of `boxWidth` px. */
export function PageThumb({
  design,
  page,
  boxWidth,
  className,
  radius = 12,
}: {
  design: Pick<Design, 'width' | 'height'>
  page: Page
  boxWidth: number
  className?: string
  radius?: number
}) {
  const scale = boxWidth / design.width
  return (
    <div
      className={`relative overflow-hidden bg-white ${className ?? ''}`}
      style={{ width: boxWidth, height: design.height * scale, borderRadius: radius }}
    >
      <PageView page={page} width={design.width} height={design.height} scale={scale} />
    </div>
  )
}

export function ResponsivePageThumb({
  design,
  page,
  radius = 14,
  className,
}: {
  design: Pick<Design, 'width' | 'height'>
  page: Page
  radius?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0
      if (next > 0) setWidth(next)
    })
    observer.observe(node)
    setWidth(node.clientWidth)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: '100%', aspectRatio: `${design.width} / ${design.height}`, overflow: 'hidden', borderRadius: radius }}
    >
      {width > 0 ? <PageThumb design={design} page={page} boxWidth={width} radius={radius} /> : null}
    </div>
  )
}

export function DesignCover({
  design,
  boxWidth,
  radius = 14,
  className,
}: {
  design: Design
  boxWidth: number
  radius?: number
  className?: string
}) {
  return <PageThumb design={design} page={design.pages[0]} boxWidth={boxWidth} radius={radius} className={className} />
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink/15 bg-white/60 px-8 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-sand text-ink">{icon}</div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-mute">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
