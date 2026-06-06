import { useCallback } from 'react'
import { useCropStore } from '@/store/cropStore'

/** Load an image from a File, Blob, or URL string into the editor store. */
export function useImageLoader(onLoad?: (img: HTMLImageElement) => void) {
  const setImage = useCropStore((s) => s.setImage)
  const setLoading = useCropStore((s) => s.setLoading)

  const loadFromSrc = useCallback(
    (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        setLoading(true, 'Loading image…')
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          setImage(src, img)
          setLoading(false)
          onLoad?.(img)
          resolve(img)
        }
        img.onerror = () => {
          setLoading(false)
          reject(new Error('Failed to load image'))
        }
        img.src = src
      }),
    [setImage, setLoading, onLoad],
  )

  const loadFromFile = useCallback(
    (file: File) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject(new Error('Not an image file'))
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          loadFromSrc(reader.result as string).then(resolve).catch(reject)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      }),
    [loadFromSrc],
  )

  return { loadFromSrc, loadFromFile }
}
