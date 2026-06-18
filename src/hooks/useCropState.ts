import { useCropStore } from '@/store/cropStore'
import { renderCrop, renderVideoCrop } from '@/utils/export'
import type { CropResult, ExportSettings } from '@/types'

/**
 * Convenience facade over the crop store. Exposes the full editor state plus a
 * helper to render the current edit to a `CropResult`.
 */
export function useCropState() {
  const store = useCropStore()

  const exportCrop = async (settings: ExportSettings): Promise<CropResult> => {
    if (!store.imageElement) {
      throw new Error('No media loaded')
    }
    store.setLoading(
      true,
      store.mediaType === 'video' && !settings.previewOnly ? 'Recording video…' : 'Rendering…'
    )
    try {
      if (store.mediaType === 'video' && !settings.previewOnly) {
        return await renderVideoCrop({
          video: store.imageElement as HTMLVideoElement,
          crop: store.crop,
          rotation: store.rotation,
          flipH: store.flipH,
          flipV: store.flipV,
          zoom: store.zoom,
          adjustments: store.effectiveAdjustments(),
          settings,
          onProgress: (progress) => {
            store.setLoading(
              true,
              `Recording video (${Math.round(progress * 100)}%)…`
            )
          },
        })
      } else {
        return await renderCrop({
          image: store.imageElement,
          crop: store.crop,
          rotation: store.rotation,
          flipH: store.flipH,
          flipV: store.flipV,
          zoom: store.zoom,
          adjustments: store.effectiveAdjustments(),
          settings,
        })
      }
    } finally {
      store.setLoading(false)
    }
  }

  return { ...store, exportCrop }
}
