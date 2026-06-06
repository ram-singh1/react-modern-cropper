# API Reference

Everything `react-advanced-cropper` exports, grouped by category.

```ts
import {
  // components, hooks, store, utils, types …
} from 'react-advanced-cropper'
import 'react-advanced-cropper/styles.css'
```

---

## Components

### `<Cropper />`

The all-in-one editor. See the [README](../README.md#️-cropper--props) for the
full prop table. Minimal usage:

```tsx
<Cropper src={url} aspectRatio={1} shape="round" onCrop={(r) => save(r.blob)} />
```

| Component                 | Purpose                                                     |
| ------------------------- | ---------------------------------------------------------- |
| `Cropper`                 | Complete editor (header, stage, toolbar, export dialog).   |
| `CropArea`                | Just the interactive cropping stage (image + handles).     |
| `ToolbarBottom`           | The tabbed control panel (Crop / Light / Color / Filters). |
| `RotateSlider`            | Straighten slider + rotate/flip buttons.                   |
| `AdjustmentSliders`       | Brightness / contrast / saturation.                        |
| `AdvancedAdjustments`     | Exposure, highlights, shadows, temperature, hue, etc.      |
| `FilterPresets`           | The filter thumbnail strip.                                |
| `AspectRatioPresets`      | Aspect ratio preset grid.                                  |
| `CustomAspectRatioInput`  | Custom `W:H` numeric input.                                |
| `AspectRatioLockToggle`   | Lock/unlock the current aspect ratio.                      |
| `CropShapeToggle`         | Rectangle ↔ circle switch.                                 |
| `ExportPresets`           | Format/quality preset buttons (`EXPORT_PRESETS`).          |
| `ExportPreviewModal`      | The export dialog with live preview + compression.         |
| `ImageDropZone`           | Drag-and-drop / click-to-upload surface.                   |
| `LoadingOverlay`          | Spinner overlay (driven by store loading state).           |
| `ThemeToggle`             | Light/dark switch button.                                  |
| `Slider`                  | The reusable styled range control.                         |

All composable components read and write the shared store, so they work
together with no prop wiring — just mount them.

---

## Hooks

### `useCropState()`

Facade over the store plus an `exportCrop` helper.

```ts
const {
  imageElement, crop, rotation, /* …all store fields… */
  setCrop, rotate90, setFilter, undo, redo,
  exportCrop,           // (settings: ExportSettings) => Promise<CropResult>
} = useCropState()
```

### `useImageLoader(onLoad?)`

```ts
const { loadFromSrc, loadFromFile } = useImageLoader()
await loadFromFile(file)          // File | Blob
await loadFromSrc('https://…')    // URL or data URL
```

### `useImageCompression()`

Headless compression — see [README](../README.md#-smart-compression).

```ts
const { compress, compressing, result } = useImageCompression()
const { blob, dataUrl, stats } = await compress(fileOrUrl, {
  maxSizeKB: 300,
  maxDimension: 1920,
  format: 'image/webp',
})
```

### `useAutoCrop()`

```ts
const { autoCrop, detecting } = useAutoCrop()
await autoCrop()   // face-aware framing, falls back to centre crop offline
```

### `usePasteImage(enabled?, onLoad?)`

Loads an image when the user pastes (⌘/Ctrl+V). Returns nothing — it just wires
a `paste` listener.

### `useMultiTouchGestures(ref, enabled?)`

Attaches pinch-zoom + two-finger-rotate to an element ref.

### `useKeyboardShortcuts(enabled?)`

Registers the global shortcut map (see README).

---

## Store — `useCropStore`

A Zustand store. Read with a selector, call actions directly.

```ts
const rotation = useCropStore((s) => s.rotation)
useCropStore.getState().rotate90()
```

**State:** `imageSrc`, `imageElement`, `naturalWidth/Height`, `stageWidth/Height`,
`crop`, `rotation`, `flipH`, `flipV`, `zoom`, `baseAdjustments`, `filterId`,
`aspectRatio`, `aspectLocked`, `cropShape`, `theme`, `isLoading`,
`loadingMessage`, `past`, `future`.

**Actions:**

| Action | Signature |
| --- | --- |
| `setImage` | `(src, HTMLImageElement) => void` |
| `clearImage` | `() => void` |
| `setCrop` | `(CropRect, record?) => void` |
| `setRotation` | `(deg) => void` |
| `rotate90` | `() => void` |
| `flipHorizontal` / `flipVertical` | `() => void` |
| `setZoom` | `(zoom) => void` |
| `setBaseAdjustment` | `(key, value) => void` |
| `resetAdjustments` | `() => void` |
| `setFilter` | `(FilterPresetId) => void` |
| `setAspectRatio` | `(number \| null) => void` |
| `toggleAspectLock` | `() => void` |
| `setCropShape` | `('rect' \| 'round') => void` |
| `setTheme` / `toggleTheme` | `(theme?) => void` |
| `effectiveAdjustments` | `() => Adjustments` (base merged with active filter) |
| `undo` / `redo` / `reset` / `commit` | `() => void` |

---

## Utilities

### Rendering & export

```ts
renderCrop(options: RenderOptions): Promise<CropResult>
downloadBlob(blob: Blob, filename: string): void
filenameFor(format: string): string         // → "cropped-image.jpg"
```

`renderCrop` is the headless core of the editor — give it an image, a crop rect,
transforms, adjustments and `ExportSettings` and it returns a `CropResult`.

### Compression

```ts
compressImage(source, options): Promise<CompressResult>
estimateSize(source, format, quality): Promise<number>   // bytes, single pass
```

`source` may be an `HTMLImageElement`, `HTMLCanvasElement`, or `ImageBitmap`.

### Filters & geometry

```ts
buildFilterString(adjustments): string       // CSS/canvas filter string
mergeAdjustments(base, partial): Adjustments
isAdjusted(adjustments): boolean
FILTER_PRESETS: FilterPreset[]
DEFAULT_ADJUSTMENTS: Adjustments

constrainCrop(crop, aspect, stageW, stageH): CropRect
centeredCrop(aspect, stageW, stageH, fill?): CropRect
resizeCrop(crop, handle, dx, dy, aspect, stageW, stageH): CropRect
toPixelCrop(crop, naturalW, naturalH): PixelCrop
```

### Misc

```ts
cn(...classes)             // clsx + tailwind-merge
clamp(value, min, max)
formatBytes(bytes)         // → "1.2 MB"
simplifyRatio(w, h)        // → [16, 9]
```

---

## Types

All public types are exported. Key ones:

```ts
CropperProps, CropResult, CropRect, PixelCrop, CropShape,
Adjustments, FilterPreset, FilterPresetId, AspectRatioOption,
ExportFormat, ExportSettings, ExportPreset,
CompressionOptions, CompressionStats, Theme,
CompressResult, CompressInput, RenderOptions,
CropState, HistorySnapshot
```

```ts
interface CompressionOptions {
  enabled?: boolean
  maxSizeKB?: number       // target output size
  maxDimension?: number    // cap longest edge (px)
  minQuality?: number      // lower bound for the quality search (default 0.3)
}

interface ExportSettings {
  format: 'image/png' | 'image/jpeg' | 'image/webp'
  quality: number          // 0..1 (ignored for png)
  width?: number
  height?: number
  shape?: 'rect' | 'round'
  compression?: CompressionOptions
}
```
