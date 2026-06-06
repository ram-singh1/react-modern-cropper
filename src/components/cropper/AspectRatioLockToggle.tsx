import { Lock, Unlock } from 'lucide-react'
import { useCropStore } from '@/store/cropStore'
import { cn } from '@/lib/utils'

export function AspectRatioLockToggle() {
  const aspectRatio = useCropStore((s) => s.aspectRatio)
  const locked = useCropStore((s) => s.aspectLocked)
  const toggle = useCropStore((s) => s.toggleAspectLock)

  const disabled = aspectRatio === null

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={locked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition',
        disabled && 'cursor-not-allowed opacity-40',
        locked
          ? 'border-brand-400/60 bg-brand-500/20 text-brand-200'
          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10',
      )}
    >
      {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
    </button>
  )
}
