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

export const VIDEO_EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'webm-hq',
    label: 'WebM · High Quality',
    description: 'VP9/VP8, transparency supported',
    settings: { format: 'video/webm', quality: 0.95 },
  },
  {
    id: 'webm-web',
    label: 'WebM · Web Optimized',
    description: 'Balanced quality and file size',
    settings: { format: 'video/webm', quality: 0.8 },
  },
  {
    id: 'mp4-hq',
    label: 'MP4 · High Quality',
    description: 'Highly compatible format',
    settings: { format: 'video/mp4', quality: 0.95 },
  },
  {
    id: 'mp4-web',
    label: 'MP4 · Web Optimized',
    description: 'Balanced streaming settings',
    settings: { format: 'video/mp4', quality: 0.8 },
  },
]

interface ExportPresetsProps {
  selectedId: string
  onSelect: (preset: ExportPreset) => void
}

export function ExportPresets({ selectedId, onSelect }: ExportPresetsProps) {
  const imageSrc = useCropStore((s) => s.imageSrc)
  const mediaType = useCropStore((s) => s.mediaType)
  
  if (!imageSrc) return null

  const presets = mediaType === 'video' ? VIDEO_EXPORT_PRESETS : EXPORT_PRESETS

  return (
    <div className="grid grid-cols-2 gap-2">
      {presets.map((preset) => {
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
