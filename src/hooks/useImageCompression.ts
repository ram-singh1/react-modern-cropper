import { useCallback, useState } from 'react'
import { compressImage, type CompressResult } from '@/utils/compress'
import type { CompressionOptions, ExportFormat } from '@/types'

export interface CompressInput extends CompressionOptions {
  format?: ExportFormat
  quality?: number
}

/**
 * Headless image compression. Accepts a File / Blob / image URL / data URL and
 * returns a compressed result honouring a target size and/or max dimension.
 *
 * ```ts
 * const { compress, compressing } = useImageCompression()
 * const result = await compress(file, { maxSizeKB: 200, maxDimension: 1600 })
 * ```
 */
export function useImageCompression() {
  const [compressing, setCompressing] = useState(false)
  const [result, setResult] = useState<CompressResult | null>(null)

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = src
    })

  const toSrc = (input: File | Blob | string) =>
    typeof input === 'string'
      ? Promise.resolve(input)
      : new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(input)
        })

  const compress = useCallback(
    async (
      input: File | Blob | string | HTMLImageElement,
      options: CompressInput = {},
    ): Promise<CompressResult> => {
      setCompressing(true)
      try {
        const image =
          input instanceof HTMLImageElement
            ? input
            : await loadImage(await toSrc(input))
        const r = await compressImage(image, {
          format: 'image/jpeg',
          quality: 0.9,
          enabled: true,
          ...options,
        })
        setResult(r)
        return r
      } finally {
        setCompressing(false)
      }
    },
    [],
  )

  return { compress, compressing, result }
}
