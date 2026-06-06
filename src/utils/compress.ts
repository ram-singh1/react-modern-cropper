import type {
  CompressionOptions,
  CompressionStats,
  ExportFormat,
} from '@/types'
import { clamp } from '@/lib/utils'

export interface CompressResult {
  blob: Blob
  dataUrl: string
  width: number
  height: number
  format: ExportFormat
  stats: CompressionStats
}

type CanvasSource = HTMLCanvasElement | HTMLImageElement | ImageBitmap

function sourceSize(src: CanvasSource): { w: number; h: number } {
  if (src instanceof HTMLImageElement) {
    return { w: src.naturalWidth, h: src.naturalHeight }
  }
  return { w: src.width, h: src.height }
}

/** Draw a source onto a (possibly downscaled) canvas. */
function drawToCanvas(
  src: CanvasSource,
  maxDimension?: number,
  background?: string,
): HTMLCanvasElement {
  const { w, h } = sourceSize(src)
  let outW = w
  let outH = h

  if (maxDimension && Math.max(w, h) > maxDimension) {
    const scale = maxDimension / Math.max(w, h)
    outW = Math.round(w * scale)
    outH = Math.round(h * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not acquire 2D context')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, outW, outH)
  }
  ctx.drawImage(src as CanvasImageSource, 0, 0, outW, outH)
  return canvas
}

function encode(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Encode failed'))),
      format,
      quality,
    )
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Read failed'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Compress an image to meet a target file size.
 *
 * Strategy:
 *  1. Optionally downscale so the longest edge ≤ `maxDimension`.
 *  2. If a `maxSizeKB` target is set and the format is lossy, run a binary
 *     search over the quality range to find the highest quality whose encoded
 *     size is ≤ target (max ~7 passes).
 *  3. PNG is lossless, so for PNG we only downscale and, if still over budget,
 *     transparently fall back to WebP to actually reduce size.
 */
export async function compressImage(
  source: CanvasSource,
  options: CompressionOptions & { format?: ExportFormat; quality?: number } = {},
): Promise<CompressResult> {
  const {
    enabled = true,
    maxSizeKB,
    maxDimension,
    minQuality = 0.3,
    quality = 0.9,
  } = options
  let format = options.format ?? 'image/jpeg'

  // PNG can't be quality-compressed; if a hard target is set, switch to WebP.
  if (format === 'image/png' && enabled && maxSizeKB) {
    format = 'image/webp'
  }

  const background = format === 'image/jpeg' ? '#ffffff' : undefined
  const canvas = drawToCanvas(source, maxDimension, background)

  const targetBytes = maxSizeKB ? maxSizeKB * 1024 : undefined

  // Simple path: no target — single encode at the requested quality.
  if (!enabled || !targetBytes || format === 'image/png') {
    const blob = await encode(canvas, format, quality)
    const dataUrl = await blobToDataUrl(blob)
    return {
      blob,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      format,
      stats: {
        originalBytes: blob.size,
        compressedBytes: blob.size,
        savings: 0,
        quality,
        passes: 1,
      },
    }
  }

  // Binary search on quality to hit the target size.
  let lo = clamp(minQuality, 0.05, 1)
  let hi = 1
  let passes = 0
  let best: Blob | null = null
  let bestQuality = lo

  // Track the very first (max-quality) encode as the "original" reference.
  const reference = await encode(canvas, format, hi)
  passes++
  if (reference.size <= targetBytes) {
    best = reference
    bestQuality = hi
  } else {
    for (let i = 0; i < 7; i++) {
      const mid = (lo + hi) / 2
      const blob = await encode(canvas, format, mid)
      passes++
      if (blob.size <= targetBytes) {
        best = blob
        bestQuality = mid
        lo = mid // try for higher quality
      } else {
        hi = mid // need smaller
      }
    }
    // If we never met the target, accept the smallest (lowest-quality) encode.
    if (!best) {
      best = await encode(canvas, format, clamp(minQuality, 0.05, 1))
      passes++
      bestQuality = minQuality
    }
  }

  const dataUrl = await blobToDataUrl(best)
  return {
    blob: best,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    format,
    stats: {
      originalBytes: reference.size,
      compressedBytes: best.size,
      savings: reference.size > 0 ? 1 - best.size / reference.size : 0,
      quality: bestQuality,
      passes,
    },
  }
}

/** Estimate the encoded size of a canvas at a given quality (one pass). */
export async function estimateSize(
  source: CanvasSource,
  format: ExportFormat,
  quality: number,
): Promise<number> {
  const canvas = drawToCanvas(
    source,
    undefined,
    format === 'image/jpeg' ? '#ffffff' : undefined,
  )
  const blob = await encode(canvas, format, quality)
  return blob.size
}
