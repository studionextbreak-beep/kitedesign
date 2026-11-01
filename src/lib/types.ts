export type ElementType = 'text' | 'shape' | 'image'

export interface BaseElement {
  id: string
  type: ElementType
  name: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
  opacity: number
  locked?: boolean
  hidden?: boolean
}

export type TextAlign = 'left' | 'center' | 'right'

export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  align: TextAlign
  lineHeight: number
  letterSpacing: number
  italic: boolean
  underline: boolean
  uppercase: boolean
}

export type ShapeKind =
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'line'
  | 'arrow'
  | 'ring'
  | 'blob'
  | 'heart'

export interface ShapeElement extends BaseElement {
  type: 'shape'
  shape: ShapeKind
  fill: string
  stroke: string
  strokeWidth: number
  radius: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  radius: number
  brightness: number
  contrast: number
  saturate: number
  blur: number
  grayscale: number
  flipX: boolean
}

export type DesignElement = TextElement | ShapeElement | ImageElement

export interface Page {
  id: string
  background: string
  elements: DesignElement[]
}

export interface Design {
  id: string
  title: string
  width: number
  height: number
  pages: Page[]
  createdAt: number
  updatedAt: number
  templateId?: string
  thumbnail?: string
}

export interface Profile {
  name: string
  email: string
  plan: 'free' | 'pro'
  initials: string
}

export interface BrandKit {
  colors: string[]
  fonts: string[]
}
