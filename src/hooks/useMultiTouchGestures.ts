import { useEffect, useRef } from 'react'
import { useCropStore } from '@/store/cropStore'
import { clamp } from '@/lib/utils'

interface PointerInfo {
  x: number
  y: number
}

/**
 * Pinch-to-zoom and two-finger rotation gestures for touch devices, attached to
 * the given stage element. Single-finger drags are left to the crop handles.
 */
export function useMultiTouchGestures(
  ref: React.RefObject<HTMLElement | null>,
  enabled = true,
) {
  const setZoom = useCropStore((s) => s.setZoom)
  const setRotation = useCropStore((s) => s.setRotation)
  const pointers = useRef<Map<number, PointerInfo>>(new Map())
  const startDist = useRef(0)
  const startAngle = useRef(0)
  const startZoom = useRef(1)
  const startRotation = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    const dist = (a: PointerInfo, b: PointerInfo) =>
      Math.hypot(a.x - b.x, a.y - b.y)
    const angle = (a: PointerInfo, b: PointerInfo) =>
      (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI

    const onDown = (e: PointerEvent) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()]
        startDist.current = dist(a, b)
        startAngle.current = angle(a, b)
        startZoom.current = useCropStore.getState().zoom
        startRotation.current = useCropStore.getState().rotation
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.current.size === 2) {
        e.preventDefault()
        const [a, b] = [...pointers.current.values()]
        const d = dist(a, b)
        const ang = angle(a, b)
        if (startDist.current > 0) {
          setZoom(clamp(startZoom.current * (d / startDist.current), 1, 4))
        }
        const dAngle = ang - startAngle.current
        setRotation(
          clamp(startRotation.current + dAngle, -180, 180),
        )
      }
    }

    const onUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId)
      if (pointers.current.size < 2) {
        startDist.current = 0
        useCropStore.getState().commit()
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove, { passive: false })
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('pointerleave', onUp)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('pointerleave', onUp)
    }
  }, [ref, enabled, setZoom, setRotation])
}
