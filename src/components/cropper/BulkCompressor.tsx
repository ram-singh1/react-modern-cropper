import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Download,
  FileImage,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'
import JSZip from 'jszip'
import { useCropStore } from '@/store/cropStore'
import { renderCrop } from '@/utils/export'
import { cn, formatBytes } from '@/lib/utils'
import type { ExportPreset, BulkCompressorProps } from '@/types'
import { EXPORT_PRESETS } from './ExportPresets'
import { CropArea } from './CropArea'
import { ToolbarBottom } from './ToolbarBottom'

interface UsageStats {
  date: string
  count: number
}

export function BulkCompressor({ showImageSlider = true }: BulkCompressorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [images, setImages] = useState<File[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [premium, setPremium] = useState(false)
  const [usage, setUsage] = useState<UsageStats>({ date: '', count: 0 })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [sliderVisible, setSliderVisible] = useState(showImageSlider)

  // Export settings
  const [preset, setPreset] = useState<ExportPreset>(EXPORT_PRESETS[0])
  const [targetSizeVal, setTargetSizeVal] = useState<number>(200)
  const [sizeUnit, setSizeUnit] = useState<'KB' | 'MB'>('KB')
  const maxDimension = 2048

  // Generate object URLs for real thumbnail previews
  const [objectUrls, setObjectUrls] = useState<string[]>([])
  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file))
    setObjectUrls(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

  // Sync premium state and stats
  useEffect(() => {
    setPremium(localStorage.getItem('rac_premium') === 'true')
    
    const today = new Date().toDateString()
    const stored = localStorage.getItem('rac_bulk_usage')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UsageStats
        if (parsed.date === today) {
          setUsage(parsed)
          return
        }
      } catch (e) {
        // ignore
      }
    }
    setUsage({ date: today, count: 0 })
  }, [])

  const handleUpgrade = () => {
    localStorage.setItem('rac_premium', 'true')
    setPremium(true)
    setShowUpgradeModal(false)
  }

  const handleResetPremium = () => {
    localStorage.removeItem('rac_premium')
    localStorage.removeItem('rac_bulk_usage')
    setPremium(false)
    setUsage({ date: new Date().toDateString(), count: 0 })
  }

  // Load an image URL into an HTMLImageElement
  const loadImageElement = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = url
    })
  }

  // File to Data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  const handleSelectImage = async (index: number, overrideFile?: File) => {
    const file = overrideFile || images[index]
    if (!file) return
    setActiveIndex(index)
    
    try {
      const dataUrl = await fileToDataUrl(file)
      const imgEl = await loadImageElement(dataUrl)
      
      // Preserve active adjustments/filters/crop state in the store
      const currentCrop = useCropStore.getState().crop
      const currentZoom = useCropStore.getState().zoom
      const currentRotation = useCropStore.getState().rotation
      const currentFlipH = useCropStore.getState().flipH
      const currentFlipV = useCropStore.getState().flipV
      const currentAspect = useCropStore.getState().aspectRatio
      const currentAspectLocked = useCropStore.getState().aspectLocked
      const currentCropShape = useCropStore.getState().cropShape
      
      useCropStore.setState({
        imageSrc: dataUrl,
        imageElement: imgEl,
        naturalWidth: imgEl.naturalWidth,
        naturalHeight: imgEl.naturalHeight,
        crop: currentCrop,
        zoom: currentZoom,
        rotation: currentRotation,
        flipH: currentFlipH,
        flipV: currentFlipV,
        aspectRatio: currentAspect,
        aspectLocked: currentAspectLocked,
        cropShape: currentCropShape,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      const newImages = [...images, ...fileList]
      setImages(newImages)
      
      if (images.length === 0 && fileList.length > 0) {
        await handleSelectImage(0, fileList[0])
      }
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length === 0) {
        setActiveIndex(0)
        useCropStore.getState().clearImage()
      } else if (index === activeIndex) {
        const nextIndex = Math.min(index, next.length - 1)
        setTimeout(() => handleSelectImage(nextIndex, next[nextIndex]), 0)
      } else if (index < activeIndex) {
        setActiveIndex((prevActive) => prevActive - 1)
      }
      return next
    })
  }

  const clearQueue = () => {
    setImages([])
    setActiveIndex(0)
    setError('')
    useCropStore.getState().clearImage()
  }

  const actualTargetSizeKB = sizeUnit === 'MB' ? Math.round(targetSizeVal * 1024) : targetSizeVal

  const processBatch = async () => {
    if (images.length === 0) return
    setError('')

    // Validate limit constraints
    const maxFreeImages = 10
    const maxPaidImages = 100
    const maxFreeBatchesPerDay = 4

    if (!premium) {
      if (images.length > maxFreeImages) {
        setError(`Free tier is limited to ${maxFreeImages} images at once. Please upgrade to process up to ${maxPaidImages} images!`)
        setShowUpgradeModal(true)
        return
      }
      if (usage.count >= maxFreeBatchesPerDay) {
        setError(`You have reached the free limit of ${maxFreeBatchesPerDay} bulk compression batches per day. Please upgrade to unlock unlimited bulk operations!`)
        setShowUpgradeModal(true)
        return
      }
    } else {
      if (images.length > maxPaidImages) {
        setError(`Batch limit exceeded. Max ${maxPaidImages} images per run.`)
        return
      }
    }

    setProcessing(true)
    setProgress(0)

    const zip = new JSZip()
    const total = images.length
    
    // Save current editing states
    const storeState = useCropStore.getState()
    const adjustments = storeState.effectiveAdjustments()
    const activeCrop = storeState.crop

    try {
      for (let i = 0; i < total; i++) {
        const file = images[i]
        const dataUrl = await fileToDataUrl(file)
        const imageElement = await loadImageElement(dataUrl)

        // Render the image with crop, rotation, adjustments, and compression
        const cropResult = await renderCrop({
          image: imageElement,
          crop: activeCrop,
          rotation: storeState.rotation,
          flipH: storeState.flipH,
          flipV: storeState.flipV,
          zoom: storeState.zoom,
          adjustments,
          settings: {
            ...preset.settings,
            shape: storeState.cropShape,
            compression: {
              enabled: true,
              maxSizeKB: actualTargetSizeKB,
              maxDimension,
            },
          },
        })

        // Add to ZIP
        const ext = cropResult.format.split('/')[1].replace('jpeg', 'jpg')
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
        const finalName = `${baseName}_cropped.${ext}`
        zip.file(finalName, cropResult.blob)

        setProgress(Math.round(((i + 1) / total) * 100))
      }

      // Generate ZIP and trigger download
      const content = await zip.generateAsync({ type: 'blob' })
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(content)
      downloadLink.download = `compressed_batch_${Date.now()}.zip`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      // Increment usage if free
      if (!premium) {
        const nextCount = usage.count + 1
        const stats = { date: usage.date, count: nextCount }
        localStorage.setItem('rac_bulk_usage', JSON.stringify(stats))
        setUsage(stats)
      }
    } catch (e: any) {
      console.error(e)
      setError(`Processing failed: ${e.message || 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className={cn(
      "glass rounded-3xl p-6 border transition-all duration-500",
      premium 
        ? "border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-b from-amber-500/[0.03] to-transparent shadow-[0_0_50px_-12px_rgba(245,158,11,0.12)] dark:shadow-[0_0_50px_-12px_rgba(245,158,11,0.06)] text-neutral-800 dark:text-neutral-100"
        : "border-black/10 dark:border-white/5 bg-white/40 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-100"
    )}>
      {/* Header info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
            <Sparkles className="h-5 w-5 text-brand-500" />
            Bulk Compressor & Editor Studio
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
            Batch crop, apply filter adjustments, and compress multiple images to any target size simultaneously.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {premium ? (
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-glow border border-amber-400/30">
              <Crown className="h-3.5 w-3.5" />
              VIP Premium Access
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-500/10 px-3.5 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-200 border border-neutral-500/15">
              Free Account ({4 - usage.count} runs left today)
            </span>
          )}
          
          {premium ? (
            <button
              onClick={handleResetPremium}
              className="text-[10px] text-neutral-400 hover:text-neutral-600 underline font-medium"
            >
              Downgrade
            </button>
          ) : (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1 text-xs font-bold text-white shadow-md transition"
            >
              <Crown className="h-3.5 w-3.5" />
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone & Editor */}
      {images.length === 0 ? (
        <div className="mt-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all duration-300",
              premium
                ? "border-amber-500/30 dark:border-amber-500/20 bg-amber-500/[0.01] hover:border-amber-500/60 dark:hover:border-amber-500/45 hover:bg-amber-500/[0.03]"
                : "border-black/15 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-brand-500/50 hover:bg-brand-500/[0.02]"
            )}
          >
            {/* Hover glow background effect */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-brand-500/5 to-accent-500/5 dark:from-brand-500/10 dark:to-accent-500/10 blur-xl" />
            
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 shadow-sm",
              premium 
                ? "bg-amber-500/10 text-amber-500 group-hover:scale-110 group-hover:bg-amber-500/20 border border-amber-500/20"
                : "bg-brand-500/10 text-brand-500 group-hover:scale-110 group-hover:bg-brand-500/20 border border-brand-500/10"
            )}>
              <UploadCloud className="h-7 w-7" />
            </div>
            
            <div className="space-y-1 z-10">
              <p className="text-base font-bold text-neutral-800 dark:text-white transition-colors duration-200">
                Drop multiple images here or click to browse
              </p>
              <p className="text-xs text-neutral-500 dark:text-white/45">
                Supports PNG, JPEG, WebP, GIF, and HEIC up to 50MB each
              </p>
              <p className={cn(
                "text-xs font-semibold mt-2.5 inline-block rounded-full px-3 py-0.5 border shadow-sm",
                premium
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20"
                  : "bg-brand-500/10 text-brand-600 dark:text-brand-300 border-brand-500/20"
              )}>
                Queue limit: {premium ? '100' : '10'} images at once
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Crop Stage / Preview Panel */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="glass-strong relative flex h-[340px] w-full flex-col overflow-hidden rounded-3xl text-neutral-800 dark:text-white bg-neutral-950">
                <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_50%_25%,rgba(99,102,241,0.12),transparent_65%)]">
                  <CropArea />
                </div>
              </div>
              
              {/* Bottom toolbar for adjustments on the active frame */}
              <div className="mt-2.5">
                <ToolbarBottom onlyIcons={true} />
              </div>
            </div>

            {/* Batch Compression Config Panel */}
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-4 space-y-4 h-fit">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-white/40">
                Batch Settings
              </h3>
              
              {/* Format selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-neutral-500 dark:text-white/50">Format preset</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {EXPORT_PRESETS.map((p) => {
                    const active = preset.id === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPreset(p)}
                        className={cn(
                          'rounded-lg border px-2 py-1.5 text-center text-[10px] font-semibold transition',
                          active
                            ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                            : 'border-black/10 dark:border-white/10 text-neutral-600 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5',
                        )}
                      >
                        {p.label.split(' · ')[0]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Target size value & Unit input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-white/70">
                  <span>Target Max Size</span>
                  <span className="text-brand-600 dark:text-brand-300 font-bold">
                    {targetSizeVal} {sizeUnit} {sizeUnit === 'MB' ? `(${Math.round(targetSizeVal * 1024)} KB)` : ''}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step={sizeUnit === 'MB' ? 0.1 : 10}
                    min={sizeUnit === 'MB' ? 0.05 : 10}
                    max={sizeUnit === 'MB' ? 50 : 10000}
                    value={targetSizeVal}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      setTargetSizeVal(val)
                    }}
                    className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-white/5 dark:bg-black/20 px-3 py-1.5 text-xs text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <div className="flex rounded-xl bg-white/5 dark:bg-black/20 border border-black/10 dark:border-white/10 p-0.5">
                    {(['KB', 'MB'] as const).map((unit) => {
                      const active = sizeUnit === unit
                      return (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => {
                            if (unit === 'MB' && sizeUnit === 'KB') {
                              setTargetSizeVal(parseFloat((targetSizeVal / 1024).toFixed(2)))
                            } else if (unit === 'KB' && sizeUnit === 'MB') {
                              setTargetSizeVal(Math.round(targetSizeVal * 1024))
                            }
                            setSizeUnit(unit)
                          }}
                          className={cn(
                            'rounded-lg px-2.5 py-1 text-[10px] font-bold transition',
                            active
                              ? 'bg-brand-500 text-white shadow-sm'
                              : 'text-neutral-500 dark:text-white/55 hover:bg-white/5',
                          )}
                        >
                          {unit}
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                {/* Size range slider */}
                <input
                  type="range"
                  min={sizeUnit === 'MB' ? 0.1 : 20}
                  max={sizeUnit === 'MB' ? 10 : 5000}
                  step={sizeUnit === 'MB' ? 0.1 : 50}
                  value={targetSizeVal}
                  onChange={(e) => setTargetSizeVal(Number(e.target.value))}
                  className="editor-range w-full mt-1.5"
                  style={{
                    background: `linear-gradient(to right, rgb(59 130 246) ${
                      sizeUnit === 'MB'
                        ? ((targetSizeVal - 0.1) / 9.9) * 100
                        : ((targetSizeVal - 20) / 4980) * 100
                    }%, var(--rac-slider-track) ${
                      sizeUnit === 'MB'
                        ? ((targetSizeVal - 0.1) / 9.9) * 100
                        : ((targetSizeVal - 20) / 4980) * 100
                    }%)`,
                  }}
                />
              </div>

              {/* Slider toggles & Clear buttons */}
              <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sliderVisible}
                    onChange={(e) => setSliderVisible(e.target.checked)}
                    className="rounded border-black/10 dark:border-white/10 text-brand-500 focus:ring-brand-500 bg-white/5"
                  />
                  <span className="text-[11px] font-semibold text-neutral-600 dark:text-white/60">
                    Show Image Slider
                  </span>
                </label>
                
                <button
                  onClick={clearQueue}
                  className="text-xs text-red-500 hover:text-red-400 font-medium"
                >
                  Clear Queue
                </button>
              </div>

              {/* Action execute button */}
              <button
                onClick={processBatch}
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-2.5 text-xs font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing ({progress}%)
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Process & Download ZIP
                  </>
                )}
              </button>
              
              {error && <p className="text-[10px] text-red-500 mt-1 leading-normal">{error}</p>}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Bottom horizontal slider of thumbnails */}
          {sliderVisible && (
            <div className="border-t border-black/10 dark:border-white/10 pt-4">
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500 dark:text-white/60 uppercase tracking-wider">
                    Uploaded Queue ({images.length} files)
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "flex items-center gap-1 py-0.5 px-2 rounded-md border text-[10px] font-bold transition shadow-sm",
                      premium
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                        : "bg-brand-500/10 text-brand-600 dark:text-brand-300 border-brand-500/20 hover:bg-brand-500/20"
                    )}
                  >
                    <UploadCloud className="h-3 w-3" />
                    Add Images
                  </button>
                </div>
                <span className="text-[10px] text-neutral-400 dark:text-white/40">
                  Select a thumbnail below to set the crop frame & adjust colors for all images
                </span>
              </div>
              
              <div className="flex overflow-x-auto gap-3 py-2 scrollbar-thin scroll-smooth min-h-[92px] items-center">
                {images.map((img, idx) => {
                  const isActive = idx === activeIndex
                  const isUrlAvailable = objectUrls[idx]
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectImage(idx)}
                      className={cn(
                        'group relative flex-none w-20 h-20 rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 bg-neutral-950 flex flex-col justify-between p-1',
                        isActive
                          ? 'border-brand-500 ring-2 ring-brand-500/40 shadow-glow scale-[1.03]'
                          : 'border-black/10 dark:border-white/10 hover:border-brand-500/50'
                      )}
                    >
                      {isUrlAvailable ? (
                        <img
                          src={objectUrls[idx]}
                          alt={img.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <FileImage className="h-7 w-7 text-neutral-400" />
                        </div>
                      )}
                      
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(idx)
                        }}
                        className="absolute top-1 right-1 z-10 rounded-full bg-red-500/80 p-0.5 text-white hover:bg-red-600 transition shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      
                      {/* Size label */}
                      <div className="z-10 mt-auto bg-black/60 backdrop-blur-[2px] rounded px-1 py-0.5 text-[8px] text-white truncate text-center w-full font-mono">
                        {formatBytes(img.size)}
                      </div>
                    </div>
                  )
                })}

                {/* Dashed "Add More" Card */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex-none w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 bg-black/5 dark:bg-white/[0.01]",
                    premium
                      ? "border-amber-500/20 text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/5"
                      : "border-brand-500/20 text-brand-500 hover:border-brand-500/5 hover:bg-brand-500/5"
                  )}
                >
                  <UploadCloud className="h-5 w-5" />
                  <span className="text-[9px] font-bold">Add More</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade modal overlay */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong w-full max-w-sm rounded-3xl p-6 border border-black/10 dark:border-white/10 text-center text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-950"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 mx-auto mb-4">
                <Crown className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">Upgrade to Bulk Premium</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                Unlock full bulk capabilities! Compresses up to 100 images per batch (instead of 10), and gives you unlimited daily usage.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-white/70 hover:bg-neutral-100 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition"
                >
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
