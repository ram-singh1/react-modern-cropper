import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Cropper } from '@/components/cropper/Cropper'
import { useCropStore } from '@/store/cropStore'
import type { CropResult } from '@/types'

const SAMPLE =
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80'

export default function App() {
  const [lastCrop, setLastCrop] = useState<CropResult | null>(null)
  const [src, setSrc] = useState<string | undefined>(undefined)
  const clearImage = useCropStore((s) => s.clearImage)

  const clearEditor = () => {
    setSrc(undefined)
    setLastCrop(null)
    clearImage()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 px-4 py-10 text-white">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] animate-aurora rounded-full bg-brand-600/30 blur-[120px]" />
        <div className="absolute -right-32 top-20 h-[30rem] w-[30rem] animate-aurora-slow rounded-full bg-accent-500/25 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] animate-aurora rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(10,10,12,0.6))]" />
      </div>

      <div className="relative mx-auto max-w-3xl space-y-7">
        {/* Hero */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            AI-powered · open source · TypeScript
          </div>
          <h1 className="text-gradient text-4xl font-bold tracking-tight sm:text-5xl">
            react-advanced-cropper
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
            A modern image cropper with AI auto-crop, rotation, filters,
            adjustments and buttery mobile gestures.
          </p>
          <div className="mt-5 flex justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setSrc(SAMPLE)}
              className="rounded-xl bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              Load sample photo
            </button>
            <button
              type="button"
              onClick={clearEditor}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition hover:bg-white/10"
            >
              Clear
            </button>
          </div>
        </div>

        <Cropper src={src} defaultTheme="dark" onCrop={(r) => setLastCrop(r)} />

        {lastCrop && (
          <div className="glass rounded-2xl p-4">
            <p className="mb-2 text-xs font-medium text-white/60">
              Last export · {lastCrop.width}×{lastCrop.height}px ·{' '}
              {(lastCrop.blob.size / 1024).toFixed(0)} KB
            </p>
            <img
              src={lastCrop.dataUrl}
              alt="Result"
              className="max-h-48 rounded-xl ring-1 ring-white/10"
            />
          </div>
        )}

        <p className="pb-4 text-center text-[11px] text-white/30">
          Built with React · Zustand · Framer Motion · MediaPipe
        </p>
      </div>
    </div>
  )
}
