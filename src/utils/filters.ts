import type { Adjustments, FilterPreset } from '@/types'

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  temperature: 0,
  sharpness: 0,
  blur: 0,
  hue: 0,
  grayscale: 0,
  sepia: 0,
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', label: 'Original', adjustments: {} },
  { id: 'vivid', label: 'Vivid', adjustments: { saturation: 145, contrast: 112, brightness: 104 } },
  { id: 'warm', label: 'Warm', adjustments: { temperature: 35, saturation: 115, brightness: 104 } },
  { id: 'cool', label: 'Cool', adjustments: { temperature: -35, saturation: 108, contrast: 105 } },
  { id: 'mono', label: 'Mono', adjustments: { grayscale: 100, contrast: 108 } },
  { id: 'noir', label: 'Noir', adjustments: { grayscale: 100, contrast: 145, brightness: 92 } },
  { id: 'vintage', label: 'Vintage', adjustments: { sepia: 45, saturation: 80, contrast: 92, brightness: 105 } },
  { id: 'fade', label: 'Fade', adjustments: { contrast: 82, saturation: 80, brightness: 110, exposure: 8 } },
  { id: 'chrome', label: 'Chrome', adjustments: { contrast: 118, saturation: 125, highlights: 20 } },
  { id: 'dramatic', label: 'Dramatic', adjustments: { contrast: 150, saturation: 90, shadows: -35, highlights: 25 } },
]

/** Merge the user's base adjustments with a preset's overrides. */
export function mergeAdjustments(
  base: Adjustments,
  preset: Partial<Adjustments>,
): Adjustments {
  return { ...base, ...preset }
}

/**
 * Build a CSS `filter` string from a set of adjustments. This is used both for
 * the live preview (applied to the <img>) and the canvas export (ctx.filter).
 */
export function buildFilterString(adj: Adjustments): string {
  const parts: string[] = []

  // Exposure & shadows/highlights folded into brightness/contrast.
  const exposureMul = 1 + adj.exposure / 200
  const shadowMul = 1 + adj.shadows / 400
  const brightness = (adj.brightness / 100) * exposureMul * shadowMul

  const highlightContrast = 1 + adj.highlights / 400
  const sharpnessContrast = 1 + adj.sharpness / 200
  const contrast = (adj.contrast / 100) * highlightContrast * sharpnessContrast

  parts.push(`brightness(${brightness.toFixed(3)})`)
  parts.push(`contrast(${contrast.toFixed(3)})`)
  parts.push(`saturate(${(adj.saturation / 100).toFixed(3)})`)

  if (adj.hue) parts.push(`hue-rotate(${adj.hue}deg)`)
  if (adj.grayscale) parts.push(`grayscale(${(adj.grayscale / 100).toFixed(3)})`)
  if (adj.sepia) parts.push(`sepia(${(adj.sepia / 100).toFixed(3)})`)
  if (adj.blur) parts.push(`blur(${adj.blur.toFixed(1)}px)`)

  // Temperature is approximated with a sepia/hue blend.
  if (adj.temperature > 0) {
    parts.push(`sepia(${(adj.temperature / 250).toFixed(3)})`)
    parts.push(`saturate(${(1 + adj.temperature / 300).toFixed(3)})`)
  } else if (adj.temperature < 0) {
    parts.push(`hue-rotate(${(adj.temperature / 6).toFixed(1)}deg)`)
  }

  return parts.join(' ')
}

/** True when adjustments differ from neutral. */
export function isAdjusted(adj: Adjustments): boolean {
  return (Object.keys(DEFAULT_ADJUSTMENTS) as (keyof Adjustments)[]).some(
    (k) => adj[k] !== DEFAULT_ADJUSTMENTS[k],
  )
}
