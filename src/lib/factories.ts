import type {
  Design,
  DesignElement,
  ImageElement,
  Page,
  ShapeElement,
  ShapeKind,
  TextElement,
} from './types'
import { uid } from './utils'

export function newText(overrides: Partial<TextElement> = {}): TextElement {
  return {
    id: uid('txt'),
    type: 'text',
    name: 'Text',
    x: 100,
    y: 100,
    w: 520,
    h: 120,
    rotation: 0,
    opacity: 1,
    text: 'Your text here',
    fontFamily: 'Bricolage Grotesque',
    fontSize: 64,
    fontWeight: 600,
    color: '#14141b',
    align: 'left',
    lineHeight: 1.15,
    letterSpacing: 0,
    italic: false,
    underline: false,
    uppercase: false,
    ...overrides,
  }
}

export function newShape(overrides: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: uid('shp'),
    type: 'shape',
    name: 'Shape',
    x: 120,
    y: 120,
    w: 240,
    h: 240,
    rotation: 0,
    opacity: 1,
    shape: 'rect',
    fill: '#ff5b3c',
    stroke: '#14141b',
    strokeWidth: 0,
    radius: 0,
    ...overrides,
  }
}

export function newImage(overrides: Partial<ImageElement> = {}): ImageElement {
  return {
    id: uid('img'),
    type: 'image',
    name: 'Image',
    x: 120,
    y: 120,
    w: 420,
    h: 300,
    rotation: 0,
    opacity: 1,
    src: '',
    radius: 0,
    brightness: 100,
    contrast: 100,
    saturate: 100,
    blur: 0,
    grayscale: 0,
    flipX: false,
    ...overrides,
  }
}

export const SHAPE_DEFAULT_SIZE: Record<ShapeKind, { w: number; h: number }> = {
  rect: { w: 260, h: 260 },
  ellipse: { w: 260, h: 260 },
  triangle: { w: 260, h: 240 },
  diamond: { w: 240, h: 240 },
  star: { w: 240, h: 240 },
  ring: { w: 240, h: 240 },
  line: { w: 320, h: 24 },
  arrow: { w: 300, h: 160 },
  blob: { w: 280, h: 260 },
  heart: { w: 240, h: 220 },
}

export function newPage(background = '#ffffff'): Page {
  return { id: uid('page'), background, elements: [] }
}

export function newDesign(props: {
  title?: string
  width: number
  height: number
  pages?: Page[]
  templateId?: string
}): Design {
  const now = Date.now()
  return {
    id: uid('dsn'),
    title: props.title ?? 'Untitled design',
    width: props.width,
    height: props.height,
    pages: props.pages ?? [newPage('#ffffff')],
    createdAt: now,
    updatedAt: now,
    templateId: props.templateId,
  }
}

/** Deep clone with fresh element/page ids so templates never share identity. */
export function clonePages(pages: Page[]): Page[] {
  return pages.map((page) => ({
    ...page,
    id: uid('page'),
    elements: page.elements.map((el) => ({ ...el, id: uid(el.type) }) as DesignElement),
  }))
}
