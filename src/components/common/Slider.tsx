import { cn } from '@/lib/utils'

interface SliderProps {
  label?: string
  value: number
  min: number
  max: number
  step?: number
  /** value considered "neutral"; shown when user double-clicks to reset */
  defaultValue?: number
  unit?: string
  icon?: React.ReactNode
  onChange: (value: number) => void
  onCommit?: () => void
  className?: string
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  defaultValue,
  unit = '',
  icon,
  onChange,
  onCommit,
  className,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  const changed = defaultValue !== undefined && value !== defaultValue

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-white/70">
            {icon}
            {label}
          </span>
          <span
            className={cn(
              'tabular-nums',
              changed ? 'text-brand-300' : 'text-white/40',
            )}
          >
            {Math.round(value)}
            {unit}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onCommit}
        onDoubleClick={() =>
          defaultValue !== undefined && (onChange(defaultValue), onCommit?.())
        }
        className="editor-range"
        style={{
          background: `linear-gradient(to right, rgb(59 130 246) ${pct}%, var(--rac-slider-track) ${pct}%)`,
        }}
      />
    </div>
  )
}
