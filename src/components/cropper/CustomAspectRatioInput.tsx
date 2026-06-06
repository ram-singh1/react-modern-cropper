import { useState } from 'react'
import { useCropStore } from '@/store/cropStore'

export function CustomAspectRatioInput() {
  const setAspectRatio = useCropStore((s) => s.setAspectRatio)
  const [w, setW] = useState('')
  const [h, setH] = useState('')

  const apply = () => {
    const wn = parseFloat(w)
    const hn = parseFloat(h)
    if (wn > 0 && hn > 0) setAspectRatio(wn / hn)
  }

  return (
    <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
      <input
        type="number"
        inputMode="decimal"
        min={1}
        placeholder="W"
        value={w}
        onChange={(e) => setW(e.target.value)}
        onBlur={apply}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        className="w-full min-w-0 bg-transparent text-center text-xs text-white/90 outline-none placeholder:text-white/30"
      />
      <span className="text-white/40">:</span>
      <input
        type="number"
        inputMode="decimal"
        min={1}
        placeholder="H"
        value={h}
        onChange={(e) => setH(e.target.value)}
        onBlur={apply}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        className="w-full min-w-0 bg-transparent text-center text-xs text-white/90 outline-none placeholder:text-white/30"
      />
    </div>
  )
}
