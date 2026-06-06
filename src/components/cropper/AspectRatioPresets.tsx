import { useCropStore } from '@/store/cropStore'
import type { AspectRatioOption } from '@/types'
import { cn } from '@/lib/utils'
import { CustomAspectRatioInput } from './CustomAspectRatioInput'
import { AspectRatioLockToggle } from './AspectRatioLockToggle'

const PRESETS: AspectRatioOption[] = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
]

export function AspectRatioPresets() {
  const aspectRatio = useCropStore((s) => s.aspectRatio)
  const setAspectRatio = useCropStore((s) => s.setAspectRatio)

  const matches = (v: number | null) => {
    if (v === null) return aspectRatio === null
    return aspectRatio !== null && Math.abs(aspectRatio - v) < 0.001
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setAspectRatio(p.value)}
            className={cn(
              'rounded-lg border px-2 py-2 text-xs font-medium transition',
              matches(p.value)
                ? 'border-brand-400/60 bg-brand-500/20 text-brand-200'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <CustomAspectRatioInput />
        <AspectRatioLockToggle />
      </div>
    </div>
  )
}
