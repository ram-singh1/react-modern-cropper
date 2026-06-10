# API Reference

Everything `react-modern-image-cropper` exports, grouped by category.

```ts
import {
  // components, hooks, store, utils, types …
} from 'react-modern-image-cropper'
import 'react-modern-image-cropper/styles.css'
```

---

## Components

### `<Cropper />`

The all-in-one editor. See the [README](../README.md#️-cropper--props) for the
full prop table. Minimal usage:

```tsx
<Cropper src={url} aspectRatio={1} shape="round" onCrop={(r) => save(r.blob)} />
```

#### UI Customization

Control visible features via simple boolean flags:
- `showCropTab`: Crop & Rotate panel (default: `true`)
- `showAdjustTab`: Light sliders (default: `true`)
- `showColorTab`: Advanced tone sliders (default: `true`)
- `showFiltersTab`: Presets strip (default: `true`)
- `showUndoRedo`: Undo and Redo actions in header (default: `true`)
- `showReset`: Reset button in header (default: `true`)
- `showThemeToggle`: Theme toggle in header (default: `true`)
- `onlyIcons`: Hide text labels in the tab bar and only show icons (default: `false`)

#### Custom Styles

Pass CSS class overrides using the `customStyles` prop:
```tsx
<Cropper
  customStyles={{
    headerButton: 'bg-indigo-900 border-indigo-700 hover:bg-indigo-800',
    tabButton: 'rounded-none hover:bg-white/5',
    actionButton: 'py-2 font-bold uppercase tracking-wider',
    exportButton: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30'
  }}
/>
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
| `BulkCompressor`          | Batch editor & compressor (Free vs. Premium tier limits).   |
| `LoadingOverlay`          | Spinner overlay (driven by store loading state).           |
| `ThemeToggle`             | Light/dark switch button.                                  |
| `Slider`                  | The reusable styled range control.                         |

All composable components read and write the shared store, so they work
together with no prop wiring — just mount them.

### `<BulkCompressor />`

The batch editor for processing multiple images at once:
- **Visual Batch Studio:** Renders an interactive editor stage that lets the user visually adjust the crop frame, aspect ratio, shape, filters, and adjustments on the active image.
- **ZIP Download:** Automatically compresses all uploaded files and packages them into a single `.zip` archive download.
- **Master Synchronization:** Uses the active preview's crop coordinates, rotation, aspect ratio, shape, adjustments, and preset filters to batch process all images proportionally.
- **Horizontal Thumbnail Slider:** Shows a list of uploaded image thumbnails. Users can click any thumbnail to make it the active preview, adjusting settings for the entire batch.
- **Target Size (KB & MB):** Supports setting size thresholds in both KB and MB (e.g. `200 KB` or `1.5 MB`), handling original images of all sizes (e.g. 8 MB, 1.3 MB, etc.) and compressing them down to your size target.
- **Quota Limiting:**
  - *Free Tier:* Limit of 10 files per batch, maximum of 4 runs per day.
  - *Premium Tier:* Limit of 100 files per batch, unlimited daily runs.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `showImageSlider` | `boolean` | `true` | Show or hide the horizontal thumbnail slider at the bottom. |


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
