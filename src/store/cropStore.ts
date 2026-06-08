import { create } from 'zustand'
import type {
  Adjustments,
  CropRect,
  CropShape,
  FilterPresetId,
  Theme,
} from '@/types'
import { DEFAULT_ADJUSTMENTS, FILTER_PRESETS, mergeAdjustments } from '@/utils/filters'
import { centeredCrop, constrainCrop } from '@/utils/geometry'
import { clamp } from '@/lib/utils'

export interface HistorySnapshot {
  crop: CropRect
  rotation: number
  flipH: boolean
  flipV: boolean
  zoom: number
  baseAdjustments: Adjustments
  filterId: FilterPresetId
  aspectRatio: number | null
  aspectLocked: boolean
}

export interface CropState {
  // Image
  imageSrc: string | null
  imageElement: HTMLImageElement | null
  naturalWidth: number
  naturalHeight: number

  // Stage (displayed image box) pixel size — used for aspect math.
  stageWidth: number
  stageHeight: number

  // Transform
  crop: CropRect
  rotation: number
  flipH: boolean
  flipV: boolean
  zoom: number

  // Color
  baseAdjustments: Adjustments
  filterId: FilterPresetId

  // Crop config
  aspectRatio: number | null
  aspectLocked: boolean
  cropShape: CropShape

  // UI
  theme: Theme
  isLoading: boolean
  loadingMessage: string

  // History
  past: HistorySnapshot[]
  future: HistorySnapshot[]
  pendingHistory: HistorySnapshot | null

  // Derived
  effectiveAdjustments: () => Adjustments

  // Actions
  setImage: (src: string, el: HTMLImageElement) => void
  clearImage: () => void
  setStageSize: (w: number, h: number) => void
  setCrop: (crop: CropRect, record?: boolean) => void
  setRotation: (deg: number, record?: boolean) => void
  rotate90: (direction?: 1 | -1) => void
  flipHorizontal: () => void
  flipVertical: () => void
  setZoom: (zoom: number, record?: boolean) => void
  setBaseAdjustment: (key: keyof Adjustments, value: number, record?: boolean) => void
  resetAdjustments: () => void
  setFilter: (id: FilterPresetId) => void
  setAspectRatio: (ratio: number | null) => void
  toggleAspectLock: () => void
  setCropShape: (shape: CropShape) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLoading: (loading: boolean, message?: string) => void
  reset: () => void
  undo: () => void
  redo: () => void
  commit: () => void
}

function snapshot(s: CropState): HistorySnapshot {
  return {
    crop: { ...s.crop },
    rotation: s.rotation,
    flipH: s.flipH,
    flipV: s.flipV,
    zoom: s.zoom,
    baseAdjustments: { ...s.baseAdjustments },
    filterId: s.filterId,
    aspectRatio: s.aspectRatio,
    aspectLocked: s.aspectLocked,
  }
}

const MAX_HISTORY = 50

function pushHistory(
  past: HistorySnapshot[],
  next: HistorySnapshot,
): HistorySnapshot[] {
  return [...past, next].slice(-MAX_HISTORY)
}

function cropEquals(a: CropRect, b: CropRect): boolean {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height
  )
}

function adjustmentsEqual(a: Adjustments, b: Adjustments): boolean {
  return (Object.keys(a) as (keyof Adjustments)[]).every((key) => a[key] === b[key])
}

function matchesCurrent(s: CropState, h: HistorySnapshot): boolean {
  return (
    cropEquals(s.crop, h.crop) &&
    s.rotation === h.rotation &&
    s.flipH === h.flipH &&
    s.flipV === h.flipV &&
    s.zoom === h.zoom &&
    adjustmentsEqual(s.baseAdjustments, h.baseAdjustments) &&
    s.filterId === h.filterId &&
    s.aspectRatio === h.aspectRatio &&
    s.aspectLocked === h.aspectLocked
  )
}

function settlePending(s: CropState): HistorySnapshot[] {
  if (!s.pendingHistory || matchesCurrent(s, s.pendingHistory)) return s.past
  return pushHistory(s.past, s.pendingHistory)
}

function recordCurrent(s: CropState): HistorySnapshot[] {
  return pushHistory(settlePending(s), snapshot(s))
}

function normalizeRotation(deg: number): number {
  return ((((deg + 180) % 360) + 360) % 360) - 180
}

export const useCropStore = create<CropState>((set, get) => ({
  imageSrc: null,
  imageElement: null,
  naturalWidth: 0,
  naturalHeight: 0,
  stageWidth: 0,
  stageHeight: 0,

  crop: { x: 0.05, y: 0.05, width: 0.9, height: 0.9 },
  rotation: 0,
  flipH: false,
  flipV: false,
  zoom: 1,

  baseAdjustments: { ...DEFAULT_ADJUSTMENTS },
  filterId: 'none',

  aspectRatio: null,
  aspectLocked: false,
  cropShape: 'rect',

  theme: 'dark',
  isLoading: false,
  loadingMessage: '',

  past: [],
  future: [],
  pendingHistory: null,

  effectiveAdjustments: () => {
    const { baseAdjustments, filterId } = get()
    const preset = FILTER_PRESETS.find((p) => p.id === filterId)
    if (!preset || filterId === 'none') return baseAdjustments
    return mergeAdjustments(baseAdjustments, preset.adjustments)
  },

  setImage: (src, el) =>
    set(() => ({
      imageSrc: src,
      imageElement: el,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      crop: { x: 0.05, y: 0.05, width: 0.9, height: 0.9 },
      rotation: 0,
      flipH: false,
      flipV: false,
      zoom: 1,
      past: [],
      future: [],
      pendingHistory: null,
    })),

  clearImage: () =>
    set(() => ({
      imageSrc: null,
      imageElement: null,
      naturalWidth: 0,
      naturalHeight: 0,
      past: [],
      future: [],
      pendingHistory: null,
    })),

  setStageSize: (w, h) => set(() => ({ stageWidth: w, stageHeight: h })),

  setCrop: (crop, record = false) => {
    const s = get()
    const constrained = constrainCrop(
      crop,
      s.aspectLocked ? s.aspectRatio : null,
      s.stageWidth,
      s.stageHeight,
    )
    if (cropEquals(s.crop, constrained)) return
    if (record) {
      set({
        crop: constrained,
        past: recordCurrent(s),
        future: [],
        pendingHistory: null,
      })
    } else {
      set({
        crop: constrained,
        pendingHistory: s.pendingHistory ?? snapshot(s),
        future: [],
      })
    }
  },

  setRotation: (deg, record = false) => {
    const s = get()
    const rotation = clamp(deg, -180, 180)
    if (s.rotation === rotation) return
    set({
      rotation,
      past: record ? recordCurrent(s) : s.past,
      future: [],
      pendingHistory: record ? null : s.pendingHistory ?? snapshot(s),
    })
  },

  rotate90: (direction = 1) => {
    const s = get()
    set({
      past: recordCurrent(s),
      future: [],
      pendingHistory: null,
      rotation: normalizeRotation(s.rotation + 90 * direction),
    })
  },

  flipHorizontal: () => {
    const s = get()
    set({
      past: recordCurrent(s),
      future: [],
      pendingHistory: null,
      flipH: !s.flipH,
    })
  },

  flipVertical: () => {
    const s = get()
    set({
      past: recordCurrent(s),
      future: [],
      pendingHistory: null,
      flipV: !s.flipV,
    })
  },

  setZoom: (zoom, record = false) => {
    const s = get()
    const next = clamp(zoom, 1, 4)
    if (s.zoom === next) return
    set({
      zoom: next,
      past: record ? recordCurrent(s) : s.past,
      future: [],
      pendingHistory: record ? null : s.pendingHistory ?? snapshot(s),
    })
  },

  setBaseAdjustment: (key, value, record = false) => {
    const s = get()
    if (s.baseAdjustments[key] === value) return
    set({
      baseAdjustments: { ...s.baseAdjustments, [key]: value },
      past: record ? recordCurrent(s) : s.past,
      future: [],
      pendingHistory: record ? null : s.pendingHistory ?? snapshot(s),
    })
  },

  resetAdjustments: () => {
    const s = get()
    if (s.filterId === 'none' && adjustmentsEqual(s.baseAdjustments, DEFAULT_ADJUSTMENTS)) {
      return
    }
    set({
      past: recordCurrent(s),
      future: [],
      pendingHistory: null,
      baseAdjustments: { ...DEFAULT_ADJUSTMENTS },
      filterId: 'none',
    })
  },

  setFilter: (id) => {
    const s = get()
    if (s.filterId === id) return
    set({
      past: recordCurrent(s),
      future: [],
      pendingHistory: null,
      filterId: id,
    })
  },

  setAspectRatio: (ratio) => {
    const s = get()
    const nextCrop =
      ratio !== null
        ? centeredCrop(ratio, s.stageWidth, s.stageHeight)
        : s.crop
    if (
      s.aspectRatio === ratio &&
      (ratio === null || cropEquals(s.crop, nextCrop))
    ) {
      return
    }
    set({
      past: recordCurrent(s),
      future: [],
      pendingHistory: null,
      aspectRatio: ratio,
      aspectLocked: ratio !== null,
      crop: ratio !== null ? nextCrop : s.crop,
    })
  },

  toggleAspectLock: () => {
    const s = get()
    if (s.aspectRatio === null) return
    set({
      past: recordCurrent(s),
      future: [],
      pendingHistory: null,
      aspectLocked: !s.aspectLocked,
    })
  },

  setCropShape: (shape) => set({ cropShape: shape }),

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

  setLoading: (loading, message = '') =>
    set({ isLoading: loading, loadingMessage: message }),

  reset: () =>
    set((s) => ({
      past: recordCurrent(s),
      future: [],
      pendingHistory: null,
      crop: { x: 0.05, y: 0.05, width: 0.9, height: 0.9 },
      rotation: 0,
      flipH: false,
      flipV: false,
      zoom: 1,
      baseAdjustments: { ...DEFAULT_ADJUSTMENTS },
      filterId: 'none',
      aspectRatio: null,
      aspectLocked: false,
    })),

  commit: () =>
    set((s) => ({
      past: settlePending(s),
      future: [],
      pendingHistory: null,
    })),

  undo: () => {
    const s = get()
    if (s.pendingHistory) {
      set({
        ...s.pendingHistory,
        future: [snapshot(s), ...s.future].slice(0, MAX_HISTORY),
        pendingHistory: null,
      })
      return
    }
    if (s.past.length === 0) return
    const previous = s.past[s.past.length - 1]
    set({
      past: s.past.slice(0, -1),
      future: [snapshot(s), ...s.future].slice(0, MAX_HISTORY),
      pendingHistory: null,
      ...previous,
    })
  },

  redo: () => {
    const s = get()
    if (s.future.length === 0) return
    const next = s.future[0]
    set({
      past: pushHistory(s.past, snapshot(s)),
      future: s.future.slice(1),
      pendingHistory: null,
      ...next,
    })
  },
}))
