<div align="center">

# react-advanced-cropper

**Modern, feature-rich React image cropper** with AI auto-crop, smart compression, a premium glassmorphic UI, mobile gestures, and professional editing tools.

[![npm version](https://img.shields.io/badge/npm-v0.1.0-6366f1)](https://www.npmjs.com/package/react-advanced-cropper)
[![license](https://img.shields.io/badge/license-MIT-22c55e)](./LICENSE)
[![types](https://img.shields.io/badge/types-included-3178c6)](./dist/index.d.ts)
![react](https://img.shields.io/badge/React-18%20%7C%2019-61dafb)

</div>

---

## ✨ Features

| | |
|---|---|
| 🎯 **Interactive cropping** | Drag to move, 8 resize handles, rule-of-thirds grid |
| ⭕ **Rectangle & circle** | Round / circular crop with a true circular export mask |
| 🤖 **AI Auto-Crop** | Face-aware framing via MediaPipe (graceful offline fallback) |
| ⚡ **Smart compression** | Target a file size in KB — quality is auto-tuned via binary search |
| 🔄 **Rotation & flip** | Straighten slider, 90° rotate, horizontal/vertical flip |
| 🎨 **10 filter presets** | Vivid, Noir, Vintage, Chrome, Dramatic, Fade… |
| 🎚️ **Pro adjustments** | Brightness, contrast, saturation + exposure, highlights, shadows, temperature, hue, sharpness, blur |
| 📐 **Aspect ratios** | Presets, custom `W:H` input, and a lock toggle |
| 📱 **Mobile gestures** | Pinch-to-zoom and two-finger rotate |
| 📋 **Clipboard paste** | Paste an image straight from the clipboard (⌘/Ctrl+V) |
| ⌨️ **Keyboard shortcuts** | Nudge, rotate, flip, zoom, undo/redo |
| ↩️ **Undo / redo** | Full edit history |
| 💾 **Export** | PNG / JPEG / WebP with a live preview modal & savings readout |
| 🌗 **Themes** | Light / dark, fully **TypeScript** typed, headless-friendly |

> 📚 **Detailed docs:** [API Reference](./docs/API.md) · [Styling Guide](./docs/STYLING.md) · [Examples](./docs/EXAMPLES.md)

---

## 📦 Installation

```bash
npm install react-advanced-cropper
# or
yarn add react-advanced-cropper
# or
pnpm add react-advanced-cropper
```

`react` and `react-dom` (v18 **or** v19) are peer dependencies — you almost
certainly already have them.

### Import the styles **once**

The component ships a single prebuilt stylesheet. Import it in your app entry
(e.g. `main.tsx`, `App.tsx`, or `_app.tsx`):

```ts
import 'react-advanced-cropper/styles.css'
```

> The stylesheet is self-contained (compiled Tailwind) — you do **not** need
> Tailwind installed in your own project to use the component.

---

## 🚀 Quick start

```tsx
import { Cropper } from 'react-advanced-cropper'
import 'react-advanced-cropper/styles.css'

export default function App() {
  return (
    <div style={{ height: 640 }}>
      <Cropper
        src="https://example.com/photo.jpg"
        aspectRatio={16 / 9}
        defaultTheme="dark"
        onCrop={(result) => {
          console.log(result.dataUrl)   // base64 string
          console.log(result.blob)      // Blob, ready to upload
          console.log(result.width, result.height)
        }}
      />
    </div>
  )
}
```

That's it — drop the component in a sized container and you get the full
editor: upload/drag/paste an image, crop, adjust, filter, and export.

---

## ⚙️ `<Cropper />` props

| Prop                 | Type                                | Default   | Description                                                        |
| -------------------- | ----------------------------------- | --------- | ----------------------------------------------------------------- |
| `src`                | `string`                            | —         | Initial image URL or data URL. Omit to show the upload drop-zone. |
| `aspectRatio`        | `number \| null`                    | `null`    | `width / height` (e.g. `16/9`). `null` = free-form.               |
| `shape`              | `'rect' \| 'round'`                 | `'rect'`  | Initial crop shape. `'round'` produces a circular export.         |
| `defaultTheme`       | `'light' \| 'dark'`                 | `'dark'`  | Starting theme.                                                   |
| `disableAutoCrop`    | `boolean`                           | `false`   | Hide the AI button and skip the MediaPipe model download.         |
| `enablePaste`        | `boolean`                           | `true`    | Allow loading an image by pasting (⌘/Ctrl+V).                     |
| `defaultCompression` | `CompressionOptions`                | —         | Pre-fill the export dialog's compression controls.                |
| `onCrop`             | `(result: CropResult) => void`      | —         | Fired when the user exports/downloads.                            |
| `onImageLoad`        | `(image: HTMLImageElement) => void` | —         | Fired whenever a new image is loaded.                             |
| `className`          | `string`                            | —         | Extra class on the outer wrapper.                                 |

### The `CropResult` you receive

```ts
interface CropResult {
  dataUrl: string            // "data:image/...;base64,..."
  blob: Blob                 // ready to POST as multipart/form-data
  width: number
  height: number
  format: 'image/png' | 'image/jpeg' | 'image/webp'
  pixelCrop: { x, y, width, height }   // crop rect on the source image
  compression?: {            // present when smart compression ran
    originalBytes: number
    compressedBytes: number
    savings: number          // 0..1
    quality: number          // final quality the search settled on
    passes: number
  }
}
```

---

## ⚡ Smart compression

Two ways to use it.

**1. In the export dialog** — toggle *Smart compression*, set a target size,
and the component finds the highest quality that fits. Or pre-configure it:

```tsx
<Cropper
  src={url}
  defaultCompression={{ enabled: true, maxSizeKB: 200, maxDimension: 1600 }}
  onCrop={(r) => console.log(`Saved ${Math.round(r.compression!.savings * 100)}%`)}
/>
```

**2. Headless** — compress any `File` / `Blob` / URL without the UI:

```tsx
import { useImageCompression } from 'react-advanced-cropper'

function Uploader() {
  const { compress, compressing } = useImageCompression()

  const onFile = async (file: File) => {
    const { blob, stats } = await compress(file, {
      maxSizeKB: 300,        // target ≤ 300 KB
      maxDimension: 1920,    // downscale longest edge to ≤ 1920px
      format: 'image/webp',
    })
    await uploadToServer(blob)
    console.log(`${(stats.savings * 100).toFixed(0)}% smaller in ${stats.passes} passes`)
  }
  // ...
}
```

Or call the pure utility directly — `compressImage(source, options)`.

> **How it works:** the image is optionally downscaled, then the encoder runs a
> bounded binary search (~7 passes) over the JPEG/WebP quality range to find the
> best quality under your byte budget. PNG can't be quality-compressed, so when
> you set a hard size target on a PNG it's transparently re-encoded as WebP.

---

## ⌨️ Keyboard shortcuts

| Key            | Action                       |
| -------------- | ---------------------------- |
| Arrow keys     | Nudge crop (Shift = larger)  |
| `[` / `]`      | Rotate −/+ 1°                |
| `R`            | Rotate 90°                   |
| `H` / `V`      | Flip horizontal / vertical   |
| `+` / `-`      | Zoom in / out                |
| `0`            | Reset all edits              |
| ⌘/Ctrl + `Z`   | Undo                         |
| ⌘/Ctrl + ⇧ `Z` | Redo                         |
| ⌘/Ctrl + `V`   | Paste image from clipboard   |

---

## 🧩 Headless / composable usage

Every building block is exported, and all editor state lives in a single
[Zustand](https://github.com/pmndrs/zustand) store — so you can build a fully
custom UI on top of the same engine.

```tsx
import {
  CropArea,
  FilterPresets,
  AdjustmentSliders,
  useCropStore,
  useCropState,
  renderCrop,
} from 'react-advanced-cropper'

function MyEditor() {
  const { exportCrop } = useCropState()
  const rotation = useCropStore((s) => s.rotation)
  // compose your own layout around <CropArea />, the slider panels, etc.
}
```

See the [API Reference](./docs/API.md) for the full export list (components,
hooks, store actions, and utilities).

---

## 🎨 Styling & theming

The component is themed with CSS and a small set of accent variables — you can
restyle it without forking. Full details in the [Styling Guide](./docs/STYLING.md):

- Toggle light/dark via the `defaultTheme` prop or `useCropStore().setTheme()`.
- Override the accent gradient with CSS custom properties.
- Pass `className` to size/position the wrapper.
- Tailwind users can `@source` the package to extend it.

---

## 🖼️ Framework notes

- **Next.js / SSR:** the editor is client-only (it uses `canvas` and `window`).
  Render it in a Client Component (`'use client'`) or with
  `next/dynamic(..., { ssr: false })`. See [Examples](./docs/EXAMPLES.md).
- **Vite / CRA:** no extra config — just import the component and the stylesheet.

---

## 🛠️ Local development

```bash
npm install
npm run dev          # playground app at http://localhost:5173
npm run build        # build the library → dist/
npm run build:demo   # build the playground app → dist-demo/
npm run preview      # preview a production build
```

---

## 📄 License

[MIT](./LICENSE) © Ram — free for personal and commercial use.
