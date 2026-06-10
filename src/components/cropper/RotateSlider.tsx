import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw } from 'lucide-react'
import { useCropStore } from '@/store/cropStore'
import { Slider } from '@/components/common/Slider'
import { cn } from '@/lib/utils'

export function RotateSlider() {
  const rotation = useCropStore((s) => s.rotation)
  const setRotation = useCropStore((s) => s.setRotation)
  const rotate90 = useCropStore((s) => s.rotate90)
  const flipH = useCropStore((s) => s.flipHorizontal)
  const flipV = useCropStore((s) => s.flipVertical)
  const flipHActive = useCropStore((s) => s.flipH)
  const flipVActive = useCropStore((s) => s.flipV)
  const commit = useCropStore((s) => s.commit)

  return (
    <div className="space-y-4">
      <Slider
        label="Straighten"
        value={rotation}
        min={-180}
        max={180}
        step={1}
        defaultValue={0}
        unit="°"
        icon={<RotateCw className="h-3.5 w-3.5" />}
        onChange={setRotation}
        onCommit={commit}
      />

      <div className="grid grid-cols-4 gap-2">
        <IconButton label="-90°" onClick={() => rotate90(-1)}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
        <IconButton label="+90°" onClick={() => rotate90(1)}>
          <RotateCw className="h-4 w-4" />
        </IconButton>
        <IconButton label="Flip H" active={flipHActive} onClick={flipH}>
          <FlipHorizontal2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Flip V" active={flipVActive} onClick={flipV}>
          <FlipVertical2 className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  )
}

function IconButton({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[10px] font-medium transition',
        active
          ? 'border-brand-400/60 bg-brand-500/20 text-brand-200'
          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10',
      )}
    >
      {children}
      {label}
    </button>
  )
}
