import { Contrast, Droplets, Sun } from 'lucide-react'
import { useCropStore } from '@/store/cropStore'
import { Slider } from '@/components/common/Slider'

export function AdjustmentSliders() {
  const adj = useCropStore((s) => s.baseAdjustments)
  const set = useCropStore((s) => s.setBaseAdjustment)
  const commit = useCropStore((s) => s.commit)

  return (
    <div className="space-y-4">
      <Slider
        label="Brightness"
        icon={<Sun className="h-3.5 w-3.5" />}
        value={adj.brightness}
        min={0}
        max={200}
        defaultValue={100}
        onChange={(v) => set('brightness', v)}
        onCommit={commit}
      />
      <Slider
        label="Contrast"
        icon={<Contrast className="h-3.5 w-3.5" />}
        value={adj.contrast}
        min={0}
        max={200}
        defaultValue={100}
        onChange={(v) => set('contrast', v)}
        onCommit={commit}
      />
      <Slider
        label="Saturation"
        icon={<Droplets className="h-3.5 w-3.5" />}
        value={adj.saturation}
        min={0}
        max={200}
        defaultValue={100}
        onChange={(v) => set('saturation', v)}
        onCommit={commit}
      />
    </div>
  )
}
