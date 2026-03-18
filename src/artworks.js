/**
 * src/artworks.js
 *
 * AUTO-DISCOVERY — drop images into frontend/public/img/ and they
 * are picked up automatically by Vite's import.meta.glob.
 *
 * Naming convention:  <artistkey><number>.<ext>
 *   walid1.jpeg  →  prefix "walid",  index 0
 *   walid2.jpeg  →  prefix "walid",  index 1
 *   nabil3.jpeg  →  prefix "nabil",  index 2
 *   etc.
 */

// ── Scan all images in public/img/ and public/ root ──────────────────────────

const imgFolder = import.meta.glob(
  '/public/img/**/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG}',
  { eager: true, as: 'url' }
)
const imgRoot = import.meta.glob(
  '/public/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG}',
  { eager: true, as: 'url' }
)

function parseImages(modules) {
  return Object.entries(modules).map(([path, url]) => {
    const filename  = path.split('/').pop()
    const base      = filename.replace(/\.[^.]+$/, '').toLowerCase()
    const match     = base.match(/^([a-z]+)(\d+)$/)
    return {
      url,
      prefix: match ? match[1] : base,
      num:    match ? parseInt(match[2], 10) : 0,
    }
  })
}

const allImages = [...parseImages(imgFolder), ...parseImages(imgRoot)]
allImages.sort((a, b) => a.prefix.localeCompare(b.prefix) || a.num - b.num)

// Index: { "walid": [url0, url1, url2], "nabil": [url0, url1, url2], ... }
const byPrefix = {}
for (const img of allImages) {
  if (!byPrefix[img.prefix]) byPrefix[img.prefix] = []
  byPrefix[img.prefix].push(img.url)
}

// ── 12 Artwork definitions ────────────────────────────────────────────────────
//
// imageKey   = filename prefix (lowercase letters only)
// imageIndex = which image in that group (0-based)

const ARTWORK_META = [
  // ── Abdallah Bourhine (3 works) ──────────────────────────────────────────
  {
    id:          'bilmawn',
    title:       'Bilmawn',
    student:     'Abdallah Bourhine',
    initials:    'AB',
    medium:      'Digitale',
    year:        2024,
    category:    'Illustration',
    description: "Une illustration vibrante d'un personnage à la peau bleue portant une coiffe à cornes, encadré par des instruments traditionnels.",
    imageKey:    'art',
    imageIndex:  0,
  },
  {
    id:          'free-palestine',
    title:       'Free Palestine',
    student:     'Abdallah Bourhine',
    initials:    'AB',
    medium:      'Digitale',
    year:        2023,
    category:    'Illustration',
    description: "Un personnage solennel vêtu de vert et coiffé d'un keffieh, tenant délicatement une fleur orange sur fond noir.",
    imageKey:    'bourhine',
    imageIndex:  0,
  },
  {
    id:          'bourhine-3',
    title:       'Œuvre III',
    student:     'Abdallah Bourhine',
    initials:    'AB',
    medium:      'Digitale',
    year:        2024,
    category:    'Illustration',
    description: "Troisième création digitale d'Abdallah Bourhine, explorant forme et couleur.",
    imageKey:    'bourhine',
    imageIndex:  1,
  },

  // ── Zeyati Walid (3 works) ───────────────────────────────────────────────
  {
    id:          'le-zouphri',
    title:       'Le Zouphri',
    student:     'Zyati Walid',
    initials:    'ZW',
    medium:      'Digitale',
    year:        2024,
    category:    'Portrait',
    description: "Un jeune homme aux cheveux bruns bouclés, vêtu d'un gilet marron, avec une expression candide.",
    imageKey:    'walid',
    imageIndex:  0,
  },
  {
    id:          'iben-batota',
    title:       'Iben Batota',
    student:     'Zyati Walid',
    initials:    'ZW',
    medium:      'Digitale',
    year:        2024,
    category:    'Portrait',
    description: "Un voyageur barbu coiffé d'un turban vert, portant un parchemin dans le dos et tenant un livre rouge.",
    imageKey:    'walid',
    imageIndex:  1,
  },
  {
    id:          'lgazar',
    title:       'LGAZAR',
    student:     'Zyati Walid',
    initials:    'ZW',
    medium:      'Digitale',
    year:        2024,
    category:    'Character Design',
    description: "Planche de conception d'un personnage cartoonesque bedonnant au gros nez rose et à la casquette rouge.",
    imageKey:    'walid',
    imageIndex:  2,
  },

  // ── Nabil Mimouni (3 works) ──────────────────────────────────────────────
  {
    id:          'ellie-tlou',
    title:       'Ellie (TLOU)',
    student:     'Nabil Mimouni',
    initials:    'NM',
    medium:      'Papier',
    year:        2024,
    category:    'Dessin Traditionnel',
    description: "Portrait réaliste au crayon d'Ellie, personnage principal du jeu The Last of Us.",
    imageKey:    'nabil',
    imageIndex:  0,
  },
  {
    id:          'nabil-2',
    title:       'Dessin II',
    student:     'Nabil Mimouni',
    initials:    'NM',
    medium:      'Papier',
    year:        2024,
    category:    'Dessin Traditionnel',
    description: "Deuxième œuvre sur papier de Nabil Mimouni, maîtrise du trait et des ombres.",
    imageKey:    'nabil',
    imageIndex:  1,
  },
  {
    id:          'tuk-ilu',
    title:       'Tuk & Ilu (Avatar)',
    student:     'Nabil Mimouni',
    initials:    'NM',
    medium:      'Papier',
    year:        2025,
    category:    'Dessin Traditionnel',
    description: "Un dessin à l'encre représentant un personnage aux cheveux tentaculaires parmi des poissons volants.",
    imageKey:    'nabil',
    imageIndex:  2,
  },

  // ── Yebda Nada (3 works) ─────────────────────────────────────────────────
  {
    id:          'metamorphose',
    title:       'Métamorphose du Regard',
    student:     'Yebda Nada',
    initials:    'YN',
    medium:      'Papier',
    year:        2024,
    category:    'Illustration',
    description: "Illustration expressive où le regard se transforme, mêlant réalisme et abstraction.",
    imageKey:    'nada',
    imageIndex:  0,
  },
  {
    id:          'nada-2',
    title:       'Illustration II',
    student:     'Yebda Nada',
    initials:    'YN',
    medium:      'Papier',
    year:        2024,
    category:    'Illustration',
    description: "Deuxième illustration de Nada, jouant sur les contrastes et la composition.",
    imageKey:    'nada',
    imageIndex:  1,
  },
  {
    id:          'nada-3',
    title:       'Illustration III',
    student:     'Yebda Nada',
    initials:    'YN',
    medium:      'Papier',
    year:        2024,
    category:    'Illustration',
    description: "Troisième œuvre de Nada, exploration des formes organiques et de la ligne.",
    imageKey:    'nada',
    imageIndex:  2,
  },
]

// ── Resolve image URLs ────────────────────────────────────────────────────────

export const ARTWORKS = ARTWORK_META.map(art => ({
  ...art,
  imageUrl: (byPrefix[art.imageKey] ?? [])[art.imageIndex] ?? null,
}))

// ── Debug: call this in App.jsx if images don't show up ──────────────────────
export function logDiscoveredImages() {
  console.groupCollapsed('[VOX] Auto-discovered images')
  console.table(allImages.map(i => ({ prefix: i.prefix, num: i.num, url: i.url })))
  console.log('[VOX] byPrefix keys:', Object.keys(byPrefix))
  console.groupEnd()
}
