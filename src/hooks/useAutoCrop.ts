import { useCallback, useRef, useState } from 'react'
import { useCropStore } from '@/store/cropStore'
import { centeredCrop, constrainCrop } from '@/utils/geometry'
import type { CropRect } from '@/types'
import { clamp } from '@/lib/utils'

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'

/**
 * AI auto-crop. Attempts to detect faces with MediaPipe and frames a crop
 * around them (respecting the active aspect ratio). If the model can't be
 * loaded (offline, blocked), it falls back to a saliency-style centre crop so
 * the feature still does something useful.
 */
export function useAutoCrop() {
  const [detecting, setDetecting] = useState(false)
  const detectorRef = useRef<unknown>(null)

  const store = useCropStore

  const ensureDetector = useCallback(async () => {
    if (detectorRef.current) return detectorRef.current
    const vision = await import('@mediapipe/tasks-vision')
    const { FilesetResolver, FaceDetector } = vision
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE)
    const detector = await FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: FACE_MODEL },
      runningMode: 'IMAGE',
    })
    detectorRef.current = detector
    return detector
  }, [])

  const autoCrop = useCallback(async () => {
    const s = store.getState()
    const { imageElement, naturalWidth, naturalHeight, aspectRatio, stageWidth, stageHeight } = s
    if (!imageElement || !naturalWidth) return

    setDetecting(true)
    s.setLoading(true, 'Analyzing image…')

    let target: CropRect | null = null

    try {
      const detector = (await ensureDetector()) as {
        detect: (img: HTMLImageElement) => {
          detections: { boundingBox?: { originX: number; originY: number; width: number; height: number } }[]
        }
      }
      const result = detector.detect(imageElement)

      if (result?.detections?.length) {
        // Union of all detected face boxes, in natural pixels.
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        for (const d of result.detections) {
          const b = d.boundingBox
          if (!b) continue
          minX = Math.min(minX, b.originX)
          minY = Math.min(minY, b.originY)
          maxX = Math.max(maxX, b.originX + b.width)
          maxY = Math.max(maxY, b.originY + b.height)
        }

        if (Number.isFinite(minX)) {
          // Pad around the faces for headroom.
          const padX = (maxX - minX) * 0.6
          const padY = (maxY - minY) * 0.8
          minX = clamp(minX - padX, 0, naturalWidth)
          minY = clamp(minY - padY * 1.1, 0, naturalHeight)
          maxX = clamp(maxX + padX, 0, naturalWidth)
          maxY = clamp(maxY + padY, 0, naturalHeight)

          target = {
            x: minX / naturalWidth,
            y: minY / naturalHeight,
            width: (maxX - minX) / naturalWidth,
            height: (maxY - minY) / naturalHeight,
          }
        }
      }
    } catch (err) {
      // Model unavailable — fall through to the centre-crop fallback.
      console.warn('[useAutoCrop] face detection unavailable, using fallback', err)
    }

    if (!target) {
      target = centeredCrop(aspectRatio, stageWidth, stageHeight, 0.82)
    }

    const constrained = constrainCrop(
      target,
      aspectRatio,
      stageWidth,
      stageHeight,
    )
    s.setCrop(constrained, true)

    s.setLoading(false)
    setDetecting(false)
  }, [ensureDetector, store])

  return { autoCrop, detecting }
}
