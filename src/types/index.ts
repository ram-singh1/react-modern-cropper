/**
 * Public types for react-modern-image-cropper.
 */

/** A crop rectangle, normalized 0..1 relative to the displayed image stage. */
export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

/** Pixel-space crop rectangle relative to the natural image dimensions. */
export interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

/** Image color / tone adjustments. Base sliders default to neutral. */
export interface Adjustments {
  /** 0..200, 100 = neutral */
  brightness: number
  /** 0..200, 100 = neutral */
  contrast: number
  /** 0..200, 100 = neutral */
  saturation: number
  /** -100..100, 0 = neutral (extra brightness multiplier) */
  exposure: number
  /** -100..100, 0 = neutral */
  highlights: number
  /** -100..100, 0 = neutral */
  shadows: number
  /** -100..100, negative = cooler, positive = warmer */
  temperature: number
  /** 0..100, 0 = none (drives contrast micro-boost) */
  sharpness: number
  /** 0..20 px gaussian blur */
  blur: number
  /** -180..180 hue rotation in degrees */
  hue: number
  /** 0..100 grayscale amount */
  grayscale: number
  /** 0..100 sepia amount */
  sepia: number
}

export type FilterPresetId =
  | 'none'
  | 'vivid'
  | 'mono'
  | 'noir'
  | 'vintage'
  | 'warm'
  | 'cool'
  | 'fade'
  | 'dramatic'
  | 'chrome'

export interface FilterPreset {
  id: FilterPresetId
  label: string
  /** Partial adjustments applied on top of the user's base adjustments. */
  adjustments: Partial<Adjustments>
}

export interface AspectRatioOption {
  label: string
  /** width / height, or null for free-form */
  value: number | null
  icon?: string
}

export type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'video/webm' | 'video/mp4'

/** Shape of the exported crop. */
export type CropShape = 'rect' | 'round'

export interface CompressionOptions {
  /** Enable size-targeted compression (binary-search on quality). */
  enabled?: boolean
  /** Target maximum output size in kilobytes. */
  maxSizeKB?: number
  /** Cap the longest output edge (px); the image is downscaled to fit. */
  maxDimension?: number
  /** Lower bound for the quality search (0..1). Default 0.3. */
  minQuality?: number
}

export interface ExportSettings {
  format: ExportFormat
  /** 0..1 (ignored for png) */
  quality: number
  /** optional fixed output size; if omitted, native crop resolution is used */
  width?: number
  height?: number
  /** rounded / circular output mask */
  shape?: CropShape
  /** advanced compression controls */
  compression?: CompressionOptions
  /** grabs a single frame preview for videos if true */
  previewOnly?: boolean
}

export interface ExportPreset {
  id: string
  label: string
  description: string
  settings: ExportSettings
}

/** Stats describing a compression pass. */
export interface CompressionStats {
  /** size before compression, bytes */
  originalBytes: number
  /** size after compression, bytes */
  compressedBytes: number
  /** 0..1 — fraction of size removed */
  savings: number
  /** the final quality the search settled on (0..1) */
  quality: number
  /** number of encode passes performed */
  passes: number
}

export interface CropResult {
  /** rendered image as a data URL */
  dataUrl: string
  /** rendered image as a Blob */
  blob: Blob
  width: number
  height: number
  /** pixel crop used, relative to the natural image */
  pixelCrop: PixelCrop
  /** mime type of the produced image */
  format: ExportFormat
  /** present when compression ran */
  compression?: CompressionStats
}

export type Theme = 'light' | 'dark'

/** Props for the top-level <Cropper /> component. */
export interface CropperProps {
  /** Initial image source (URL or data URL). */
  src?: string
  /** Initial aspect ratio (width / height), or null for free. */
  aspectRatio?: number | null
  /** Initial crop shape. Default 'rect'. */
  shape?: CropShape
  /** Fired whenever the user produces a final crop via export. */
  onCrop?: (result: CropResult) => void
  /** Fired when a new image or video is loaded into the editor. */
  onImageLoad?: (media: HTMLImageElement | HTMLVideoElement) => void
  /** Start in light or dark theme. */
  defaultTheme?: Theme
  /** Disable the AI auto-crop feature (skips MediaPipe download). */
  disableAutoCrop?: boolean
  /** Allow loading images by pasting from the clipboard. Default true. */
  enablePaste?: boolean
  /** Default compression settings applied in the export dialog. */
  defaultCompression?: CompressionOptions
  className?: string

  // UI Configuration Options
  /** Show the Crop tab. Default true. */
  showCropTab?: boolean
  /** Show the Light adjustments tab. Default true. */
  showAdjustTab?: boolean
  /** Show the Color adjustments tab. Default true. */
  showColorTab?: boolean
  /** Show the Filters tab. Default true. */
  showFiltersTab?: boolean
  /** Show the Undo and Redo header buttons. Default true. */
  showUndoRedo?: boolean
  /** Show the Reset header button. Default true. */
  showReset?: boolean
  /** Show the Theme Toggle button. Default true. */
  showThemeToggle?: boolean
  /** Hide tab labels and only show icons to save space. Default false. */
  onlyIcons?: boolean
  /** Custom CSS class names for custom button styling */
  customStyles?: {
    headerButton?: string
    tabButton?: string
    actionButton?: string
    exportButton?: string
  }
}

/** Props for the BulkCompressor component. */
export interface BulkCompressorProps {
  /** Default visibility of the image slider. Default true. */
  showImageSlider?: boolean
}

