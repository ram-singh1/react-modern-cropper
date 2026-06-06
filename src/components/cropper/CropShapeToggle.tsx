import { Circle, Square } from 'lucide-react'
import { useCropStore } from '@/store/cropStore'
import type { CropShape } from '@/types'
import { cn } from '@/lib/utils'

const SHAPES: { id: CropShape; label: string; icon: React.ReactNode }[] = [
  { id: 'rect', label: 'Rectangle', icon: <Square className="h-4 w-4" /> },
  { id: 'round', label: 'Circle', icon: <Circle className="h-4 w-4" /> },
]

export function CropShapeToggle() {
  const shape = useCropStore((s) => s.cropShape)
  const setShape = useCropStore((s) => s.setCropShape)
  const setAspectRatio = useCropStore((s) => s.setAspectRatio)

  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {SHAPES.map((s) => {
        const active = shape === s.id
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setShape(s.id)
              // A circle only makes sense at 1:1.
              if (s.id === 'round') setAspectRatio(1)
            }}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
              active
                ? 'bg-brand-gradient text-white shadow-glow'
                : 'text-white/60 hover:text-white/90',
            )}
          >
            {s.icon}
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
