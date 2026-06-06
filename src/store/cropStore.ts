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

  // Derived
  effectiveAdjustments: () => Adjustments

  // Actions
  setImage: (src: string, el: HTMLImageElement) => void
  clearImage: () => void
  setStageSize: (w: number, h: number) => void
  setCrop: (crop: CropRect, record?: boolean) => void
  setRotation: (deg: number) => void
  rotate90: () => void
  flipHorizontal: () => void
  flipVertical: () => void
  setZoom: (zoom: number) => void
  setBaseAdjustment: (key: keyof Adjustments, value: number) => void
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
  }
}

const MAX_HISTORY = 50

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
    })),

  clearImage: () =>
    set(() => ({
      imageSrc: null,
      imageElement: null,
      naturalWidth: 0,
      naturalHeight: 0,
      past: [],
      future: [],
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
    if (record) {
      set({
        crop: constrained,
        past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
        future: [],
      })
    } else {
      set({ crop: constrained })
    }
  },

  setRotation: (deg) => set({ rotation: clamp(deg, -180, 180) }),

  rotate90: () => {
    const s = get()
    set({
      past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
      future: [],
      rotation: ((s.rotation + 90 + 180) % 360) - 180,
    })
  },

  flipHorizontal: () => {
    const s = get()
    set({
      past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
      future: [],
      flipH: !s.flipH,
    })
  },

  flipVertical: () => {
    const s = get()
    set({
      past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
      future: [],
      flipV: !s.flipV,
    })
  },

  setZoom: (zoom) => set({ zoom: clamp(zoom, 1, 4) }),

  setBaseAdjustment: (key, value) =>
    set((s) => ({ baseAdjustments: { ...s.baseAdjustments, [key]: value } })),

  resetAdjustments: () =>
    set((s) => ({
      past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
      future: [],
      baseAdjustments: { ...DEFAULT_ADJUSTMENTS },
      filterId: 'none',
    })),

  setFilter: (id) =>
    set((s) => ({
      past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
      future: [],
      filterId: id,
    })),

  setAspectRatio: (ratio) => {
    const s = get()
    const nextCrop =
      ratio !== null
        ? centeredCrop(ratio, s.stageWidth, s.stageHeight)
        : s.crop
    set({
      past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
      future: [],
      aspectRatio: ratio,
      aspectLocked: ratio !== null ? true : s.aspectLocked,
      crop: ratio !== null ? nextCrop : s.crop,
    })
  },

  toggleAspectLock: () =>
    set((s) => ({ aspectLocked: s.aspectRatio !== null ? !s.aspectLocked : false })),

  setCropShape: (shape) => set({ cropShape: shape }),

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

  setLoading: (loading, message = '') =>
    set({ isLoading: loading, loadingMessage: message }),

  reset: () =>
    set((s) => ({
      past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
      future: [],
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
      past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
      future: [],
    })),

  undo: () => {
    const s = get()
    if (s.past.length === 0) return
    const previous = s.past[s.past.length - 1]
    set({
      past: s.past.slice(0, -1),
      future: [snapshot(s), ...s.future].slice(0, MAX_HISTORY),
      ...previous,
    })
  },

  redo: () => {
    const s = get()
    if (s.future.length === 0) return
    const next = s.future[0]
    set({
      past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
      future: s.future.slice(1),
      ...next,
    })
  },
}))
