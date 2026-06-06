import { useCropStore } from '@/store/cropStore'
import type { ExportPreset } from '@/types'
import { cn } from '@/lib/utils'

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'png-hq',
    label: 'PNG · High Quality',
    description: 'Lossless, transparency preserved',
    settings: { format: 'image/png', quality: 1 },
  },
  {
    id: 'jpg-high',
    label: 'JPEG · 92%',
    description: 'Great quality, smaller file',
    settings: { format: 'image/jpeg', quality: 0.92 },
  },
  {
    id: 'jpg-web',
    label: 'JPEG · Web',
    description: 'Balanced for fast loading',
    settings: { format: 'image/jpeg', quality: 0.8 },
  },
  {
    id: 'webp',
    label: 'WebP · 90%',
    description: 'Modern format, best compression',
    settings: { format: 'image/webp', quality: 0.9 },
  },
]

interface ExportPresetsProps {
  selectedId: string
  onSelect: (preset: ExportPreset) => void
}

export function ExportPresets({ selectedId, onSelect }: ExportPresetsProps) {
  const imageSrc = useCropStore((s) => s.imageSrc)
  if (!imageSrc) return null

  return (
    <div className="grid grid-cols-2 gap-2">
      {EXPORT_PRESETS.map((preset) => {
        const active = preset.id === selectedId
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset)}
            className={cn(
              'rounded-xl border p-3 text-left transition',
              active
                ? 'border-brand-400/60 bg-brand-500/15'
                : 'border-white/10 bg-white/5 hover:bg-white/10',
            )}
          >
            <div
              className={cn(
                'text-xs font-semibold',
                active ? 'text-brand-200' : 'text-white/85',
              )}
            >
              {preset.label}
            </div>
            <div className="mt-0.5 text-[10px] leading-tight text-white/45">
              {preset.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
