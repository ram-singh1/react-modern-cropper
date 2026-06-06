import type {
  Adjustments,
  CropRect,
  CropResult,
  CropShape,
  ExportFormat,
  ExportSettings,
  PixelCrop,
} from '@/types'
import { buildFilterString } from './filters'
import { compressImage } from './compress'

export interface RenderOptions {
  image: HTMLImageElement
  crop: CropRect
  rotation: number
  flipH: boolean
  flipV: boolean
  zoom: number
  adjustments: Adjustments
  settings: ExportSettings
}

/**
 * Render the current edit state to a canvas and return the cropped result.
 *
 * The "stage" is the contain-fit box of the image at natural resolution. We
 * draw the rotated/flipped/zoomed image into that stage with the colour
 * filter applied, then extract the normalized crop region from it. Finally we
 * optionally apply a round mask and/or size-targeted compression.
 */
export async function renderCrop(opts: RenderOptions): Promise<CropResult> {
  const { image, crop, rotation, flipH, flipV, zoom, adjustments, settings } = opts
  const shape: CropShape = settings.shape ?? 'rect'

  const naturalW = image.naturalWidth
  const naturalH = image.naturalHeight
  const stageW = naturalW
  const stageH = naturalH

  // --- Pass 1: render the full transformed + filtered stage ---
  const stage = document.createElement('canvas')
  stage.width = stageW
  stage.height = stageH
  const sctx = stage.getContext('2d')
  if (!sctx) throw new Error('Could not acquire 2D context')

  sctx.imageSmoothingEnabled = true
  sctx.imageSmoothingQuality = 'high'
  sctx.filter = buildFilterString(adjustments)

  sctx.save()
  sctx.translate(stageW / 2, stageH / 2)
  sctx.rotate((rotation * Math.PI) / 180)
  sctx.scale(flipH ? -zoom : zoom, flipV ? -zoom : zoom)
  sctx.drawImage(image, -naturalW / 2, -naturalH / 2, naturalW, naturalH)
  sctx.restore()

  // --- Pass 2: extract the crop region (alpha preserved) ---
  const pixelCrop: PixelCrop = {
    x: Math.round(crop.x * stageW),
    y: Math.round(crop.y * stageH),
    width: Math.max(1, Math.round(crop.width * stageW)),
    height: Math.max(1, Math.round(crop.height * stageH)),
  }

  const outW = settings.width ?? pixelCrop.width
  const outH = settings.height ?? pixelCrop.height

  const out = document.createElement('canvas')
  out.width = outW
  out.height = outH
  const octx = out.getContext('2d')
  if (!octx) throw new Error('Could not acquire 2D context')

  octx.imageSmoothingEnabled = true
  octx.imageSmoothingQuality = 'high'
  octx.drawImage(
    stage,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH,
  )

  // Round / circular mask.
  if (shape === 'round') {
    octx.globalCompositeOperation = 'destination-in'
    octx.beginPath()
    octx.ellipse(outW / 2, outH / 2, outW / 2, outH / 2, 0, 0, Math.PI * 2)
    octx.fill()
    octx.globalCompositeOperation = 'source-over'
  }

  // JPEG has no alpha — flatten onto white so corners aren't black.
  const encodeCanvas =
    settings.format === 'image/jpeg' ? flattenOnWhite(out) : out

  // --- Pass 3: encode (with optional size-targeted compression) ---
  const compression = settings.compression
  if (compression?.enabled) {
    const c = await compressImage(encodeCanvas, {
      ...compression,
      format: settings.format,
      quality: settings.quality,
    })
    return {
      dataUrl: c.dataUrl,
      blob: c.blob,
      width: c.width,
      height: c.height,
      pixelCrop,
      format: c.format,
      compression: c.stats,
    }
  }

  const blob = await canvasToBlob(encodeCanvas, settings.format, settings.quality)
  const dataUrl = encodeCanvas.toDataURL(settings.format, settings.quality)
  return {
    dataUrl,
    blob,
    width: encodeCanvas.width,
    height: encodeCanvas.height,
    pixelCrop,
    format: settings.format,
  }
}

function flattenOnWhite(src: HTMLCanvasElement): HTMLCanvasElement {
  const flat = document.createElement('canvas')
  flat.width = src.width
  flat.height = src.height
  const ctx = flat.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, flat.width, flat.height)
  ctx.drawImage(src, 0, 0)
  return flat
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: ExportFormat,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas export failed'))
      },
      type,
      quality,
    )
  })
}

/** Trigger a browser download of a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke on the next tick so the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Suggest a filename + extension for a given mime format. */
export function filenameFor(format: string): string {
  const ext = format.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png'
  return `cropped-image.${ext}`
}
