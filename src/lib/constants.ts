import type { ShapeKind } from './types'

export interface FormatDef {
  id: string
  label: string
  w: number
  h: number
  group: 'Social' | 'Work' | 'Marketing' | 'Brand'
  hint?: string
}

export const FORMATS: FormatDef[] = [
  { id: 'instagram-post', label: 'Instagram Post', w: 1080, h: 1080, group: 'Social', hint: 'Square' },
  { id: 'instagram-story', label: 'Instagram Story', w: 1080, h: 1920, group: 'Social', hint: '9:16' },
  { id: 'pinterest-pin', label: 'Pinterest Pin', w: 1000, h: 1500, group: 'Social', hint: '2:3' },
  { id: 'youtube-thumb', label: 'YouTube Thumbnail', w: 1280, h: 720, group: 'Social', hint: '16:9' },
  { id: 'facebook-cover', label: 'Facebook Cover', w: 1200, h: 630, group: 'Social', hint: '1.9:1' },
  { id: 'presentation', label: 'Presentation', w: 1280, h: 720, group: 'Work', hint: '16:9' },
  { id: 'a4-doc', label: 'A4 Document', w: 1000, h: 1414, group: 'Work', hint: 'A4' },
  { id: 'resume', label: 'Resume', w: 1000, h: 1414, group: 'Work', hint: 'A4' },
  { id: 'whiteboard', label: 'Whiteboard', w: 1600, h: 1200, group: 'Work', hint: '4:3' },
  { id: 'poster', label: 'Poster', w: 1080, h: 1440, group: 'Marketing', hint: '3:4' },
  { id: 'flyer', label: 'Flyer', w: 1080, h: 1528, group: 'Marketing', hint: 'US Letter' },
  { id: 'business-card', label: 'Business Card', w: 1050, h: 600, group: 'Marketing', hint: '3.5 × 2' },
  { id: 'email-header', label: 'Email Header', w: 1200, h: 400, group: 'Marketing', hint: '3:1' },
  { id: 'logo', label: 'Logo', w: 1000, h: 1000, group: 'Brand', hint: 'Square' },
]

export const FORMAT_BY_ID = Object.fromEntries(FORMATS.map((f) => [f.id, f]))

export const FONTS = [
  { name: 'Bricolage Grotesque', stack: '"Bricolage Grotesque", system-ui, sans-serif', kind: 'Display' },
  { name: 'Inter', stack: 'Inter, system-ui, sans-serif', kind: 'Sans' },
  { name: 'Playfair Display', stack: '"Playfair Display", Georgia, serif', kind: 'Serif' },
  { name: 'DM Serif Display', stack: '"DM Serif Display", Georgia, serif', kind: 'Serif' },
  { name: 'Space Grotesk', stack: '"Space Grotesk", system-ui, sans-serif', kind: 'Sans' },
  { name: 'Poppins', stack: 'Poppins, system-ui, sans-serif', kind: 'Sans' },
  { name: 'Archivo Black', stack: '"Archivo Black", Impact, sans-serif', kind: 'Display' },
  { name: 'Montserrat', stack: 'Montserrat, system-ui, sans-serif', kind: 'Sans' },
  { name: 'Oswald', stack: 'Oswald, Impact, sans-serif', kind: 'Display' },
  { name: 'Lora', stack: 'Lora, Georgia, serif', kind: 'Serif' },
  { name: 'Caveat', stack: 'Caveat, cursive', kind: 'Script' },
] as const

export function fontStack(name: string): string {
  return FONTS.find((f) => f.name === name)?.stack ?? `${name}, system-ui, sans-serif`
}

export const PALETTES = [
  { name: 'Coral heat', colors: ['#ff5b3c', '#ffd3c7', '#14141b', '#fdf8f1', '#e8431f'] },
  { name: 'Studio mint', colors: ['#1fbe8d', '#cdf3e6', '#0d3b2e', '#f7fffb', '#7be0bd'] },
  { name: 'Lilac dusk', colors: ['#b9a6ff', '#2a1e4d', '#f4f1ff', '#ffcf4d', '#14141b'] },
  { name: 'Sun archive', colors: ['#ffcf4d', '#f97316', '#3a2a10', '#fff8e7', '#8a5a00'] },
  { name: 'Ink & sand', colors: ['#14141b', '#f3e8d8', '#a8917a', '#e7d7c1', '#6d6d7c'] },
  { name: 'Ocean press', colors: ['#0a5c8a', '#a9d8ff', '#052e45', '#f0f8ff', '#39a0d0'] },
]

export const SOLID_COLORS = [
  '#14141b', '#3a3a48', '#6d6d7c', '#b6b6c1', '#f3f3f5', '#ffffff',
  '#ff5b3c', '#ff8a70', '#ffd3c7', '#ffcf4d', '#ffe9a8', '#f97316',
  '#1fbe8d', '#7be0bd', '#cdf3e6', '#0a5c8a', '#a9d8ff', '#39a0d0',
  '#b9a6ff', '#e2d9ff', '#7a2ff2', '#d61f69', '#ffc2d6', '#fdf8f1',
  '#f3e8d8', '#e7d7c1', '#a8917a', '#3a2a10', '#0d3b2e', '#052e45',
]

export const GRADIENTS = [
  'linear-gradient(135deg, #ff5b3c 0%, #ffcf4d 100%)',
  'linear-gradient(135deg, #14141b 0%, #3a3a48 100%)',
  'linear-gradient(135deg, #b9a6ff 0%, #ff5b3c 100%)',
  'linear-gradient(160deg, #0a5c8a 0%, #1fbe8d 100%)',
  'linear-gradient(135deg, #fdf8f1 0%, #f3e8d8 100%)',
  'linear-gradient(135deg, #1fbe8d 0%, #a9d8ff 100%)',
  'linear-gradient(200deg, #ffcf4d 0%, #f97316 100%)',
  'linear-gradient(135deg, #2a1e4d 0%, #b9a6ff 100%)',
  'linear-gradient(135deg, #d61f69 0%, #ff8a70 100%)',
  'linear-gradient(135deg, #052e45 0%, #39a0d0 100%)',
]

export const PATTERNS = [
  {
    id: 'dots',
    name: 'Dots',
    css: 'radial-gradient(circle, rgba(20,20,27,0.22) 1.5px, transparent 1.7px) 0 0 / 20px 20px repeat',
  },
  {
    id: 'grid',
    name: 'Grid',
    css: 'linear-gradient(rgba(20,20,27,0.13) 1px, transparent 1px) 0 0 / 32px 32px repeat, linear-gradient(90deg, rgba(20,20,27,0.13) 1px, transparent 1px) 0 0 / 32px 32px repeat',
  },
  {
    id: 'stripes',
    name: 'Stripes',
    css: 'repeating-linear-gradient(45deg, rgba(20,20,27,0.14) 0 2px, transparent 2px 16px)',
  },
  {
    id: 'waves',
    name: 'Waves',
    css: 'repeating-radial-gradient(circle at 50% 120%, transparent 0 22px, rgba(20,20,27,0.12) 22px 25px)',
  },
  {
    id: 'checker',
    name: 'Checker',
    css: 'conic-gradient(rgba(20,20,27,0.1) 25%, transparent 0 50%, rgba(20,20,27,0.1) 0 75%, transparent 0) 0 0 / 40px 40px repeat',
  },
]

export interface ShapeDef {
  kind: ShapeKind
  name: string
}

export const SHAPES: ShapeDef[] = [
  { kind: 'rect', name: 'Square' },
  { kind: 'ellipse', name: 'Circle' },
  { kind: 'triangle', name: 'Triangle' },
  { kind: 'diamond', name: 'Diamond' },
  { kind: 'star', name: 'Star' },
  { kind: 'ring', name: 'Ring' },
  { kind: 'line', name: 'Line' },
  { kind: 'arrow', name: 'Arrow' },
  { kind: 'blob', name: 'Blob' },
  { kind: 'heart', name: 'Heart' },
]

export const TEXT_PRESETS = [
  { id: 'heading', label: 'Add a heading', sample: 'Heading', fontSize: 96, fontWeight: 700, fontFamily: 'Bricolage Grotesque', h: 120, lineHeight: 1 },
  { id: 'subheading', label: 'Add a subheading', sample: 'Subheading', fontSize: 58, fontWeight: 600, fontFamily: 'Bricolage Grotesque', h: 80, lineHeight: 1.1 },
  { id: 'body', label: 'Add a little bit of body text', sample: 'Body text', fontSize: 34, fontWeight: 400, fontFamily: 'Inter', h: 64, lineHeight: 1.35 },
] as const

export const TEMPLATE_CATEGORIES = [
  'All',
  'Social',
  'Presentations',
  'Posters',
  'Marketing',
  'Documents',
  'Resumes',
  'Cards',
  'Logos',
] as const

export const NAV_LINKS = [
  { label: 'Design', to: '/' },
  { label: 'Templates', to: '/templates' },
  { label: 'Your work', to: '/dashboard' },
  { label: 'Plans', to: '/pricing' },
]
