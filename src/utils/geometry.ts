import type { CropRect, PixelCrop } from '@/types'
import { clamp } from '@/lib/utils'

/**
 * Constrain a normalized crop rect so it stays inside [0,1]x[0,1] and,
 * optionally, matches a fixed aspect ratio.
 *
 * The stage is assumed square in normalized space, so the real pixel aspect
 * ratio must be converted with the stage's pixel dimensions before locking.
 */
export function constrainCrop(
  crop: CropRect,
  aspect: number | null,
  stageW: number,
  stageH: number,
): CropRect {
  let { x, y, width, height } = crop

  width = clamp(width, 0.04, 1)
  height = clamp(height, 0.04, 1)

  if (aspect && stageW > 0 && stageH > 0) {
    // aspect is width/height in *pixels*. Convert to normalized stage units.
    const normAspect = (aspect * stageH) / stageW
    // Keep width, derive height from aspect.
    height = width / normAspect
    if (height > 1) {
      height = 1
      width = height * normAspect
    }
  }

  x = clamp(x, 0, 1 - width)
  y = clamp(y, 0, 1 - height)

  return { x, y, width, height }
}

/** Centered crop of a given aspect ratio that fits inside the stage. */
export function centeredCrop(
  aspect: number | null,
  stageW: number,
  stageH: number,
  fill = 0.9,
): CropRect {
  if (!aspect || stageW <= 0 || stageH <= 0) {
    const s = fill
    return { x: (1 - s) / 2, y: (1 - s) / 2, width: s, height: s }
  }
  const normAspect = (aspect * stageH) / stageW
  let width = fill
  let height = width / normAspect
  if (height > fill) {
    height = fill
    width = height * normAspect
  }
  return {
    x: (1 - width) / 2,
    y: (1 - height) / 2,
    width,
    height,
  }
}

/** Convert a normalized crop into pixel coordinates on the natural image. */
export function toPixelCrop(
  crop: CropRect,
  naturalW: number,
  naturalH: number,
): PixelCrop {
  return {
    x: Math.round(crop.x * naturalW),
    y: Math.round(crop.y * naturalH),
    width: Math.round(crop.width * naturalW),
    height: Math.round(crop.height * naturalH),
  }
}

export type ResizeHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'

/**
 * Apply a drag delta (normalized) to a crop while resizing from a handle.
 * Aspect is enforced when provided.
 */
export function resizeCrop(
  crop: CropRect,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  aspect: number | null,
  stageW: number,
  stageH: number,
): CropRect {
  let { x, y, width, height } = crop
  const right = x + width
  const bottom = y + height

  if (handle.includes('w')) {
    x = clamp(x + dx, 0, right - 0.04)
    width = right - x
  }
  if (handle.includes('e')) {
    width = clamp(width + dx, 0.04, 1 - x)
  }
  if (handle.includes('n')) {
    y = clamp(y + dy, 0, bottom - 0.04)
    height = bottom - y
  }
  if (handle.includes('s')) {
    height = clamp(height + dy, 0.04, 1 - y)
  }

  let next: CropRect = { x, y, width, height }

  if (aspect && stageW > 0 && stageH > 0) {
    const normAspect = (aspect * stageH) / stageW
    // Drive height from width, anchoring on the handle's fixed corner.
    const anchorRight = handle.includes('w')
    const anchorBottom = handle.includes('n')
    const newHeight = next.width / normAspect
    if (anchorBottom) {
      next.y = next.y + next.height - newHeight
    }
    next.height = newHeight
    if (anchorRight) {
      // already anchored via x adjustments above
    }
    next = constrainCrop(next, aspect, stageW, stageH)
  }

  next.x = clamp(next.x, 0, 1 - next.width)
  next.y = clamp(next.y, 0, 1 - next.height)
  return next
}
