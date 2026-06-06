import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Download, Gauge, Loader2, Maximize2, X, Zap } from 'lucide-react'
import { useCropState } from '@/hooks/useCropState'
import { useCropStore } from '@/store/cropStore'
import { downloadBlob, filenameFor } from '@/utils/export'
import { cn, formatBytes, simplifyRatio } from '@/lib/utils'
import type { CompressionOptions, CropResult, ExportPreset } from '@/types'
import { Slider } from '@/components/common/Slider'
import { ExportPresets, EXPORT_PRESETS } from './ExportPresets'

interface ExportPreviewModalProps {
  open: boolean
  onClose: () => void
  onExported?: (result: CropResult) => void
  defaultCompression?: CompressionOptions
}

export function ExportPreviewModal({
  open,
  onClose,
  onExported,
  defaultCompression,
}: ExportPreviewModalProps) {
  const { exportCrop } = useCropState()
  const cropShape = useCropStore((s) => s.cropShape)

  const [preset, setPreset] = useState<ExportPreset>(EXPORT_PRESETS[0])
  const [result, setResult] = useState<CropResult | null>(null)
  const [rendering, setRendering] = useState(false)

  // Compression controls
  const [compress, setCompress] = useState(defaultCompression?.enabled ?? false)
  const [maxSizeKB, setMaxSizeKB] = useState(defaultCompression?.maxSizeKB ?? 500)
  const [maxDimension, setMaxDimension] = useState(
    defaultCompression?.maxDimension ?? 2048,
  )

  // Re-render preview whenever inputs change.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setRendering(true)
    const t = setTimeout(() => {
      exportCrop({
        ...preset.settings,
        shape: cropShape,
        compression: compress
          ? { enabled: true, maxSizeKB, maxDimension }
          : undefined,
      })
        .then((r) => !cancelled && setResult(r))
        .catch((e) => console.error('[export] failed', e))
        .finally(() => !cancelled && setRendering(false))
    }, 120)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preset, cropShape, compress, maxSizeKB, maxDimension])

  const handleDownload = () => {
    if (!result) return
    downloadBlob(result.blob, filenameFor(result.format))
    onExported?.(result)
    onClose()
  }

  const ratio = result ? simplifyRatio(result.width, result.height) : null
  const savings = result?.compression?.savings ?? 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-neutral-900/80 px-5 py-3.5 backdrop-blur">
              <h2 className="text-sm font-semibold text-white">Export image</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-4 p-5">
              {/* Preview */}
              <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[conic-gradient(at_50%_50%,#2a2a2a_25%,#1f1f1f_0_50%,#2a2a2a_0_75%,#1f1f1f_0)] bg-[length:24px_24px]">
                {rendering && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                  </div>
                )}
                {result && (
                  <img
                    src={result.dataUrl}
                    alt="Export preview"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>

              {/* Meta */}
              {result && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/55">
                  <span>
                    {result.width} × {result.height}px
                  </span>
                  {ratio && (
                    <span>
                      {ratio[0]}:{ratio[1]}
                    </span>
                  )}
                  <span className="font-medium text-white/75">
                    {formatBytes(result.blob.size)}
                  </span>
                  <span className="uppercase">
                    {result.format.split('/')[1]}
                  </span>
                  {savings > 0.01 && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300">
                      −{Math.round(savings * 100)}% saved
                    </span>
                  )}
                </div>
              )}

              <ExportPresets selectedId={preset.id} onSelect={setPreset} />

              {/* Compression panel */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <button
                  type="button"
                  onClick={() => setCompress((v) => !v)}
                  className="flex w-full items-center justify-between"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-white/85">
                    <Zap className="h-4 w-4 text-brand-300" />
                    Smart compression
                  </span>
                  <span
                    className={cn(
                      'relative h-5 w-9 rounded-full transition',
                      compress ? 'bg-brand-500' : 'bg-white/15',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all',
                        compress ? 'left-[18px]' : 'left-0.5',
                      )}
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {compress && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-4">
                        <Slider
                          label="Target size"
                          icon={<Gauge className="h-3.5 w-3.5" />}
                          value={maxSizeKB}
                          min={20}
                          max={3000}
                          step={10}
                          unit=" KB"
                          onChange={setMaxSizeKB}
                        />
                        <Slider
                          label="Max dimension"
                          icon={<Maximize2 className="h-3.5 w-3.5" />}
                          value={maxDimension}
                          min={256}
                          max={4096}
                          step={64}
                          unit=" px"
                          onChange={setMaxDimension}
                        />
                        <p className="text-[10px] leading-relaxed text-white/40">
                          The encoder searches for the highest quality that fits
                          your target size. PNG is auto-converted to WebP when a
                          hard size target is set.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <footer className="sticky bottom-0 flex gap-2 border-t border-white/10 bg-neutral-900/80 p-4 backdrop-blur">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!result || rendering}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
              >
                {rendering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
                {result && <Check className="h-3.5 w-3.5 opacity-70" />}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
