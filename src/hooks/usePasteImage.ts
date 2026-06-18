import { useEffect } from 'react'
import { useImageLoader } from './useImageLoader'

/**
 * Load an image when the user pastes one from the clipboard (Cmd/Ctrl+V).
 * Ignores pastes that contain no image data.
 */
export function usePasteImage(
  enabled = true,
  onLoad?: (media: HTMLImageElement | HTMLVideoElement) => void,
) {
  const { loadFromFile } = useImageLoader(onLoad)

  useEffect(() => {
    if (!enabled) return

    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            loadFromFile(file).catch((err) => console.error('[paste]', err))
          }
          break
        }
      }
    }

    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [enabled, loadFromFile])
}
