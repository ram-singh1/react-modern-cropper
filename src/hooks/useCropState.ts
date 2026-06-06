import { useCropStore } from '@/store/cropStore'
import { renderCrop } from '@/utils/export'
import type { CropResult, ExportSettings } from '@/types'

/**
 * Convenience facade over the crop store. Exposes the full editor state plus a
 * helper to render the current edit to a `CropResult`.
 */
export function useCropState() {
  const store = useCropStore()

  const exportCrop = async (settings: ExportSettings): Promise<CropResult> => {
    if (!store.imageElement) {
      throw new Error('No image loaded')
    }
    store.setLoading(true, 'Rendering…')
    try {
      const result = await renderCrop({
        image: store.imageElement,
        crop: store.crop,
        rotation: store.rotation,
        flipH: store.flipH,
        flipV: store.flipV,
        zoom: store.zoom,
        adjustments: store.effectiveAdjustments(),
        settings,
      })
      return result
    } finally {
      store.setLoading(false)
    }
  }

  return { ...store, exportCrop }
}
