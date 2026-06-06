import { Aperture, CircleDot, Cloud, Snowflake, Sparkles, Thermometer } from 'lucide-react'
import { useCropStore } from '@/store/cropStore'
import { Slider } from '@/components/common/Slider'

export function AdvancedAdjustments() {
  const adj = useCropStore((s) => s.baseAdjustments)
  const set = useCropStore((s) => s.setBaseAdjustment)
  const commit = useCropStore((s) => s.commit)

  return (
    <div className="space-y-4">
      <Slider
        label="Exposure"
        icon={<Aperture className="h-3.5 w-3.5" />}
        value={adj.exposure}
        min={-100}
        max={100}
        defaultValue={0}
        onChange={(v) => set('exposure', v)}
        onCommit={commit}
      />
      <Slider
        label="Highlights"
        icon={<Sparkles className="h-3.5 w-3.5" />}
        value={adj.highlights}
        min={-100}
        max={100}
        defaultValue={0}
        onChange={(v) => set('highlights', v)}
        onCommit={commit}
      />
      <Slider
        label="Shadows"
        icon={<Cloud className="h-3.5 w-3.5" />}
        value={adj.shadows}
        min={-100}
        max={100}
        defaultValue={0}
        onChange={(v) => set('shadows', v)}
        onCommit={commit}
      />
      <Slider
        label="Temperature"
        icon={<Thermometer className="h-3.5 w-3.5" />}
        value={adj.temperature}
        min={-100}
        max={100}
        defaultValue={0}
        onChange={(v) => set('temperature', v)}
        onCommit={commit}
      />
      <Slider
        label="Hue"
        icon={<CircleDot className="h-3.5 w-3.5" />}
        value={adj.hue}
        min={-180}
        max={180}
        defaultValue={0}
        unit="°"
        onChange={(v) => set('hue', v)}
        onCommit={commit}
      />
      <Slider
        label="Sharpness"
        icon={<Sparkles className="h-3.5 w-3.5" />}
        value={adj.sharpness}
        min={0}
        max={100}
        defaultValue={0}
        onChange={(v) => set('sharpness', v)}
        onCommit={commit}
      />
      <Slider
        label="Blur"
        icon={<Snowflake className="h-3.5 w-3.5" />}
        value={adj.blur}
        min={0}
        max={20}
        defaultValue={0}
        onChange={(v) => set('blur', v)}
        onCommit={commit}
      />
    </div>
  )
}
