import { useCropStore } from '@/store/cropStore'
import { FILTER_PRESETS, buildFilterString, mergeAdjustments } from '@/utils/filters'
import { cn } from '@/lib/utils'

export function FilterPresets() {
  const imageSrc = useCropStore((s) => s.imageSrc)
  const filterId = useCropStore((s) => s.filterId)
  const setFilter = useCropStore((s) => s.setFilter)
  const baseAdjustments = useCropStore((s) => s.baseAdjustments)

  if (!imageSrc) return null

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2">
      {FILTER_PRESETS.map((preset) => {
        const active = filterId === preset.id
        const preview = buildFilterString(
          mergeAdjustments(baseAdjustments, preset.adjustments),
        )
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => setFilter(preset.id)}
            className="group flex shrink-0 flex-col items-center gap-1.5"
          >
            <div
              className={cn(
                'h-16 w-16 overflow-hidden rounded-xl border-2 transition',
                active
                  ? 'border-brand-400 ring-2 ring-brand-400/40'
                  : 'border-white/10 group-hover:border-white/30',
              )}
            >
              <img
                src={imageSrc}
                alt={preset.label}
                draggable={false}
                className="h-full w-full object-cover"
                style={{ filter: preview }}
              />
            </div>
            <span
              className={cn(
                'text-[11px] font-medium',
                active ? 'text-brand-300' : 'text-white/60',
              )}
            >
              {preset.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
