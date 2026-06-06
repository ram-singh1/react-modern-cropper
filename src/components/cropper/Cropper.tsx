import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  ImagePlus,
  Redo2,
  RotateCcw,
  Sparkles,
  Undo2,
} from 'lucide-react'
import { useCropStore } from '@/store/cropStore'
import { useImageLoader } from '@/hooks/useImageLoader'
import { useAutoCrop } from '@/hooks/useAutoCrop'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { usePasteImage } from '@/hooks/usePasteImage'
import type { CropperProps } from '@/types'
import { cn } from '@/lib/utils'
import { CropArea } from './CropArea'
import { ToolbarBottom } from './ToolbarBottom'
import { ImageDropZone } from './ImageDropZone'
import { ExportPreviewModal } from './ExportPreviewModal'
import { LoadingOverlay } from '@/components/common/LoadingOverlay'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function Cropper({
  src,
  aspectRatio = null,
  shape = 'rect',
  onCrop,
  onImageLoad,
  defaultTheme = 'dark',
  disableAutoCrop = false,
  enablePaste = true,
  defaultCompression,
  className,
}: CropperProps) {
  const imageSrc = useCropStore((s) => s.imageSrc)
  const theme = useCropStore((s) => s.theme)
  const isLoading = useCropStore((s) => s.isLoading)
  const loadingMessage = useCropStore((s) => s.loadingMessage)
  const setTheme = useCropStore((s) => s.setTheme)
  const setAspectRatio = useCropStore((s) => s.setAspectRatio)
  const setCropShape = useCropStore((s) => s.setCropShape)
  const reset = useCropStore((s) => s.reset)
  const undo = useCropStore((s) => s.undo)
  const redo = useCropStore((s) => s.redo)
  const canUndo = useCropStore((s) => s.past.length > 0)
  const canRedo = useCropStore((s) => s.future.length > 0)
  const clearImage = useCropStore((s) => s.clearImage)

  const { loadFromSrc } = useImageLoader(onImageLoad)
  const { autoCrop, detecting } = useAutoCrop()
  useKeyboardShortcuts(true)
  usePasteImage(enablePaste, onImageLoad)

  const [exportOpen, setExportOpen] = useState(false)

  // Apply initial props once.
  useEffect(() => {
    setTheme(defaultTheme)
    setCropShape(shape)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (src) loadFromSrc(src).catch((e) => console.error(e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useEffect(() => {
    if (aspectRatio !== undefined && aspectRatio !== null) {
      setAspectRatio(aspectRatio)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectRatio])

  return (
    <div className={cn(theme === 'dark' ? 'dark' : '', className)}>
      <div className="glass-strong relative flex h-full min-h-[560px] w-full flex-col overflow-hidden rounded-3xl text-white">
        {/* top sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {/* Header */}
        <header className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Advanced Cropper
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {imageSrc && (
              <>
                <HeaderButton title="Undo (⌘Z)" onClick={undo} disabled={!canUndo}>
                  <Undo2 className="h-4 w-4" />
                </HeaderButton>
                <HeaderButton
                  title="Redo (⌘⇧Z)"
                  onClick={redo}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </HeaderButton>
                <HeaderButton title="Reset" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                </HeaderButton>
                <HeaderButton title="New image" onClick={clearImage}>
                  <ImagePlus className="h-4 w-4" />
                </HeaderButton>
              </>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Stage */}
        <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_50%_25%,rgba(99,102,241,0.12),transparent_65%)]">
          {imageSrc ? <CropArea /> : <ImageDropZone onLoad={onImageLoad} />}
          <LoadingOverlay show={isLoading} message={loadingMessage} />
        </div>

        {/* Action bar + toolbar */}
        {imageSrc && (
          <>
            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 sm:px-6">
              {!disableAutoCrop && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={autoCrop}
                  disabled={detecting}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-brand-400/30 bg-brand-500/10 px-3.5 py-2 text-xs font-semibold text-brand-200 transition hover:bg-brand-500/20 disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Sparkles className={cn('h-4 w-4', detecting && 'animate-pulse')} />
                  {detecting ? 'Analyzing…' : 'AI Auto-Crop'}
                </motion.button>
              )}
              <div className="flex-1" />
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -1 }}
                onClick={() => setExportOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
              >
                <Download className="h-4 w-4" />
                Export
              </motion.button>
            </div>

            <ToolbarBottom />
          </>
        )}

        <ExportPreviewModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          onExported={onCrop}
          defaultCompression={defaultCompression}
        />
      </div>
    </div>
  )
}

function HeaderButton({
  children,
  title,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  )
}
