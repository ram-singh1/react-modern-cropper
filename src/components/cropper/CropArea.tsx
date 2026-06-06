import { useCallback, useEffect, useRef, useState } from 'react'
import { useCropStore } from '@/store/cropStore'
import { useMultiTouchGestures } from '@/hooks/useMultiTouchGestures'
import { buildFilterString } from '@/utils/filters'
import { resizeCrop, type ResizeHandle } from '@/utils/geometry'
import { cn } from '@/lib/utils'

const HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

type DragMode =
  | { type: 'move'; startX: number; startY: number; cropX: number; cropY: number }
  | { type: 'resize'; handle: ResizeHandle; startX: number; startY: number }
  | null

export function CropArea() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const imageSrc = useCropStore((s) => s.imageSrc)
  const crop = useCropStore((s) => s.crop)
  const rotation = useCropStore((s) => s.rotation)
  const flipH = useCropStore((s) => s.flipH)
  const flipV = useCropStore((s) => s.flipV)
  const zoom = useCropStore((s) => s.zoom)
  const aspectRatio = useCropStore((s) => s.aspectRatio)
  const aspectLocked = useCropStore((s) => s.aspectLocked)
  const cropShape = useCropStore((s) => s.cropShape)
  const setCrop = useCropStore((s) => s.setCrop)
  const setStageSize = useCropStore((s) => s.setStageSize)
  const commit = useCropStore((s) => s.commit)
  const effective = useCropStore((s) => s.effectiveAdjustments)
  const adjustments = effective()

  const [drag, setDrag] = useState<DragMode>(null)

  useMultiTouchGestures(stageRef, true)

  // Track the displayed image box so aspect math has real pixel dimensions.
  const measure = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    if (rect.width && rect.height) setStageSize(rect.width, rect.height)
  }, [setStageSize])

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (imgRef.current) ro.observe(imgRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure, imageSrc])

  const getStageRect = () => imgRef.current?.getBoundingClientRect()

  const onPointerDownMove = (e: React.PointerEvent) => {
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    setDrag({
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
    })
  }

  const onPointerDownResize = (e: React.PointerEvent, handle: ResizeHandle) => {
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    setDrag({ type: 'resize', handle, startX: e.clientX, startY: e.clientY })
  }

  useEffect(() => {
    if (!drag) return

    const onMove = (e: PointerEvent) => {
      const rect = getStageRect()
      if (!rect) return
      const dx = (e.clientX - drag.startX) / rect.width
      const dy = (e.clientY - drag.startY) / rect.height

      if (drag.type === 'move') {
        setCrop({ ...crop, x: drag.cropX + dx, y: drag.cropY + dy })
      } else {
        const next = resizeCrop(
          crop,
          drag.handle,
          (e.clientX - drag.startX) / rect.width,
          (e.clientY - drag.startY) / rect.height,
          aspectLocked ? aspectRatio : null,
          rect.width,
          rect.height,
        )
        setCrop(next)
        setDrag({ ...drag, startX: e.clientX, startY: e.clientY })
      }
    }

    const onUp = () => {
      commit()
      setDrag(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag, crop, aspectLocked, aspectRatio, setCrop, commit])

  if (!imageSrc) return null

  const filter = buildFilterString(adjustments)
  const transform = `rotate(${rotation}deg) scale(${flipH ? -zoom : zoom}, ${flipV ? -zoom : zoom})`

  // Crop box in percentages relative to the stage.
  const box = {
    left: `${crop.x * 100}%`,
    top: `${crop.y * 100}%`,
    width: `${crop.width * 100}%`,
    height: `${crop.height * 100}%`,
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden p-4 sm:p-8"
    >
      <div ref={stageRef} className="relative inline-block max-h-full max-w-full touch-none">
        {/* The image being edited */}
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Editing"
          draggable={false}
          onLoad={measure}
          className="block max-h-[68vh] max-w-full select-none rounded-lg"
          style={{ filter, transform, transformOrigin: 'center' }}
        />

        {/* Dark overlay outside the crop, using box-shadow trick */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className={cn(
              'absolute shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ring-1 ring-white/70',
              cropShape === 'round' ? 'rounded-full' : 'rounded-sm',
            )}
            style={box}
          />
        </div>

        {/* Interactive crop frame */}
        <div
          className="absolute cursor-move"
          style={box}
          onPointerDown={onPointerDownMove}
        >
          {/* rule-of-thirds grid (hidden for circular crops) */}
          {cropShape !== 'round' && (
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/40" />
              ))}
            </div>
          )}

          {/* corner + edge handles */}
          {HANDLES.map((h) => (
            <Handle key={h} handle={h} onPointerDown={(e) => onPointerDownResize(e, h)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Handle({
  handle,
  onPointerDown,
}: {
  handle: ResizeHandle
  onPointerDown: (e: React.PointerEvent) => void
}) {
  const pos: Record<ResizeHandle, string> = {
    nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
    n: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
    ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
    e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
    se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
    s: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
    sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
    w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  }
  const isCorner = handle.length === 2
  return (
    <div
      onPointerDown={onPointerDown}
      className={cn(
        'absolute z-10 touch-none rounded-full border-2 border-white bg-gradient-to-br from-brand-400 to-accent-500 shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-transform hover:scale-150',
        isCorner ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5',
        pos[handle],
      )}
    />
  )
}
