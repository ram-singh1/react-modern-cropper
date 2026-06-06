import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, UploadCloud } from 'lucide-react'
import { useImageLoader } from '@/hooks/useImageLoader'
import { cn } from '@/lib/utils'

interface ImageDropZoneProps {
  onLoad?: (img: HTMLImageElement) => void
}

export function ImageDropZone({ onLoad }: ImageDropZoneProps) {
  const { loadFromFile } = useImageLoader(onLoad)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (!file) return
      setError('')
      loadFromFile(file).catch((e) => setError(e.message))
    },
    [loadFromFile],
  )

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex w-full max-w-md cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-8 py-16 text-center transition duration-300',
          dragging
            ? 'scale-[1.02] border-brand-400 bg-brand-500/10 shadow-glow-lg'
            : 'border-white/15 bg-white/[0.03] hover:border-brand-400/40 hover:bg-white/[0.06]',
        )}
      >
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl transition duration-300',
            dragging
              ? 'scale-110 bg-brand-gradient text-white shadow-glow'
              : 'bg-gradient-to-br from-white/15 to-white/5 text-white/70',
          )}
        >
          {dragging ? (
            <UploadCloud className="h-7 w-7" />
          ) : (
            <ImagePlus className="h-7 w-7" />
          )}
        </div>
        <div>
          <p className="text-base font-semibold text-white">
            {dragging ? 'Drop to upload' : 'Drag & drop an image'}
          </p>
          <p className="mt-1 text-sm text-white/50">
            or click to browse · PNG, JPG, WebP
          </p>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </motion.div>
    </div>
  )
}
