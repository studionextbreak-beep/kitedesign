export interface PhotoDef {
  id: string
  seed: string
  label: string
  category: string
}

export const PHOTO_CATEGORIES = ['All', 'Textures', 'Nature', 'City', 'People', 'Work'] as const

export const PHOTOS: PhotoDef[] = [
  { id: 'p1', seed: 'linen', label: 'Linen fold', category: 'Textures' },
  { id: 'p2', seed: 'terrazzo', label: 'Terrazzo', category: 'Textures' },
  { id: 'p3', seed: 'concrete', label: 'Concrete', category: 'Textures' },
  { id: 'p4', seed: 'papergrain', label: 'Paper grain', category: 'Textures' },
  { id: 'p5', seed: 'coastline', label: 'Coastline', category: 'Nature' },
  { id: 'p6', seed: 'pineforest', label: 'Pine forest', category: 'Nature' },
  { id: 'p7', seed: 'desertdune', label: 'Desert dune', category: 'Nature' },
  { id: 'p8', seed: 'wildflowers', label: 'Wildflowers', category: 'Nature' },
  { id: 'p9', seed: 'ridge', label: 'Mountain ridge', category: 'Nature' },
  { id: 'p10', seed: 'tidepool', label: 'Tidepool', category: 'Nature' },
  { id: 'p11', seed: 'nightstreet', label: 'Night street', category: 'City' },
  { id: 'p12', seed: 'skyline', label: 'Skyline', category: 'City' },
  { id: 'p13', seed: 'brickwall', label: 'Brick wall', category: 'City' },
  { id: 'p14', seed: 'metro', label: 'Metro', category: 'City' },
  { id: 'p15', seed: 'portrait1', label: 'Portrait no. 1', category: 'People' },
  { id: 'p16', seed: 'portrait2', label: 'Portrait no. 2', category: 'People' },
  { id: 'p17', seed: 'crowd', label: 'Crowd', category: 'People' },
  { id: 'p18', seed: 'hands', label: 'Hands', category: 'People' },
  { id: 'p19', seed: 'desk', label: 'Desk', category: 'Work' },
  { id: 'p20', seed: 'studio', label: 'Studio', category: 'Work' },
  { id: 'p21', seed: 'workshop', label: 'Workshop', category: 'Work' },
  { id: 'p22', seed: 'archives', label: 'Archives', category: 'Work' },
]

export function photoUrl(seed: string, w = 900, h = 900): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${Math.round(w)}/${Math.round(h)}`
}
