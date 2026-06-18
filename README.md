<div align="center">

# react-modern-image-cropper

**Modern, feature-rich React image cropper** with AI auto-crop, smart compression, a premium glassmorphic UI, mobile gestures, and professional editing tools.

[![npm version](https://img.shields.io/badge/npm-v0.1.0-6366f1)](https://www.npmjs.com/package/react-modern-image-cropper)
[![license](https://img.shields.io/badge/license-MIT-22c55e)](./LICENSE)
[![types](https://img.shields.io/badge/types-included-3178c6)](./dist/index.d.ts)
![react](https://img.shields.io/badge/React-18%20%7C%2019-61dafb)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-modern-image-cropper?color=ff69b4)](https://bundlephobia.com/package/react-modern-image-cropper)

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

> 📚 **Detailed docs:** [API Reference](./docs/API.md) · [Styling Guide](./docs/STYLING.md) · [Examples](./docs/EXAMPLES.md) · [⚡ Live Playground (StackBlitz)](https://stackblitz.com/github/ram-singh1/react-modern-image-cropper/tree/main)

---

## 📦 Installation

```bash
npm install react-modern-image-cropper
# or
yarn add react-modern-image-cropper
# or
pnpm add react-modern-image-cropper
```

`react` and `react-dom` (v18 **or** v19) are peer dependencies — you almost
certainly already have them.

### Import the styles **once**

The component ships a single prebuilt stylesheet. Import it in your app entry
(e.g. `main.tsx`, `App.tsx`, or `_app.tsx`):

```ts
import 'react-modern-image-cropper/styles.css'
```

> The stylesheet is self-contained (compiled Tailwind) — you do **not** need
> Tailwind installed in your own project to use the component.

---

## 🚀 Quick start

```tsx
import { Cropper } from 'react-modern-image-cropper'
import 'react-modern-image-cropper/styles.css'

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
| `showCropTab`        | `boolean`                           | `true`    | Show the Crop tab in the toolbar.                                 |
| `showAdjustTab`      | `boolean`                           | `true`    | Show the Light adjustments tab.                                   |
| `showColorTab`       | `boolean`                           | `true`    | Show the Color adjustments tab.                                   |
| `showFiltersTab`     | `boolean`                           | `true`    | Show the Filters tab.                                             |
| `showUndoRedo`       | `boolean`                           | `true`    | Show the Undo/Redo buttons in the header.                          |
| `showReset`          | `boolean`                           | `true`    | Show the Reset button in the header.                              |
| `showThemeToggle`    | `boolean`                           | `true`    | Show the Theme Toggle button in the header.                        |
| `onlyIcons`          | `boolean`                           | `false`   | Hide tab labels in the bottom bar and only show icons to save space.|
| `customStyles`       | `object`                            | —         | Custom CSS classes: `{ headerButton?, tabButton?, actionButton?, exportButton? }`.|

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
import { useImageCompression } from 'react-modern-image-cropper'

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

## 📦 Bulk Compressor Component

`react-modern-image-cropper` features a powerful `<BulkCompressor />` component for batch cropping, adjustment filtering, and size-targeted smart compression (supporting files of any size, from KB to multiple MBs, and compressing them to a precise target).

### Key Features
* **Visual Batch Studio:** Renders an interactive editor stage that lets the user visually adjust the crop frame, aspect ratio, shape, filters, and adjustments on the active image.
* **Master Synchronization:** Adjusting the crop box framing or color settings on the active image automatically applies the same relative layout and tone adjustments to all images in the queue when processing.
* **Horizontal Thumbnail Slider:** Displays a scrollable list of uploaded image thumbnails. Users can click any image to load it as the active preview and delete individual items.
* **Any Target Size (KB & MB):** Accepts arbitrary size targets in both **KB** and **MB** (e.g. `200 KB`, `1.5 MB`), handling original images of all sizes (e.g., 1.3 MB, 8 MB, 476 KB).
* **Slider Toggle:** The thumbnail slider can be hidden/shown via a UI checkbox or the `showImageSlider` prop.

```tsx
import { BulkCompressor } from 'react-modern-image-cropper'
import 'react-modern-image-cropper/styles.css'

function MyComponent() {
  return <BulkCompressor showImageSlider={true} />
}
```

### `<BulkCompressor />` Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `showImageSlider` | `boolean` | `true` | Show/hide the horizontal thumbnail slider at the bottom. |

### Free vs. Premium Batch Limits

The component has built-in tier tracking (stored in `localStorage`):

| Limits | Free Tier | Premium Tier |
| :--- | :--- | :--- |
| **Max images per batch** | 10 images | 100 images |
| **Daily batch runs** | 4 batches | Unlimited |
| **Upgrade Option** | Opens upgrade modal (fully theme-adaptive) | Built-in badge |

*Note: All compression parameters (preset settings, target size, output shape, filters, adjustments, etc.) are exactly the **same** for both Free and Premium tiers. The only differences are the **batch queue size** and **daily batch limits**.*


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
} from 'react-modern-image-cropper'

function MyEditor() {
  const { exportCrop } = useCropState()
  const rotation = useCropStore((s) => s.rotation)
  // compose your own layout around <CropArea />, the slider panels, etc.
}
```

See the [API Reference](./docs/API.md) for the full export list (components,
hooks, store actions, and utilities).

---

## 📦 Bundle Size & Optimization

Although `react-modern-image-cropper` is packed with professional features, it is built to keep your initial page loads fast:
* **Lazy-loaded AI Auto-Crop:** The heavy MediaPipe model and tasks-vision libraries are dynamically imported only when the user clicks the "AI Auto-Crop" button. If not used, they add **zero** weight to your bundle.
* **Tree-shaken dependencies:** Standard packages like Lucide Icons and Framer Motion are fully tree-shaken, ensuring you only bundle the modules actually rendered.
* **Zero Tailwind Overhead:** The component pre-compiles styles into a standalone sheet. You do not need to install or run Tailwind in your host application.

---

## 🎨 Styling & theming

The component is themed with CSS and a small set of accent variables — you can
restyle it without forking. Full details in the [Styling Guide](./docs/STYLING.md):

- Toggle light/dark via the `defaultTheme` prop or `useCropStore().setTheme()`.
- Override the accent gradient with CSS custom properties.
- Pass `className` to size/position the wrapper.
- Tailwind users can `@source` the package to extend it.

---

## 🌐 Next.js & SSR Integration Guide

Because `react-modern-image-cropper` relies on HTML5 Canvas APIs, standard mouse/touch window events, and browser-side MediaPipe decoders, it **must run on the client side only**.

If you import the component directly into an SSR page in Next.js, you will encounter a `window is not defined` or `HTMLCanvasElement is not defined` error. Here is how to load it safely using Next.js App Router and Pages Router:

### 1. App Router (Next.js 13+)

Create a client wrapper for the cropper (e.g., `components/CropperWrapper.tsx`):
```tsx
'use client'

import { Cropper } from 'react-modern-image-cropper'
import 'react-modern-image-cropper/styles.css'

export default function CropperWrapper(props: React.ComponentProps<typeof Cropper>) {
  return <Cropper {...props} />
}
```

Then load it dynamically in your page with SSR disabled:
```tsx
import dynamic from 'next/dynamic'

const DynamicCropper = dynamic(() => import('@/components/CropperWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-neutral-900 text-white/50 rounded-3xl">
      Loading editor...
    </div>
  ),
})

export default function EditProfilePage() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Profile Picture</h1>
      <div className="h-[600px] rounded-3xl overflow-hidden border border-neutral-800">
        <DynamicCropper
          aspectRatio={1}
          onCrop={(res) => console.log('Cropped blob:', res.blob)}
        />
      </div>
    </main>
  )
}
```

### 2. Pages Router

Use `next/dynamic` to load the editor directly:
```tsx
import dynamic from 'next/dynamic'

const Cropper = dynamic(
  () => import('react-modern-image-cropper').then((mod) => mod.Cropper),
  { ssr: false }
)

export default function MyPage() {
  return (
    <div style={{ height: 600 }}>
      <Cropper onCrop={(r) => console.log(r)} />
    </div>
  )
}
```

---

## 🖼️ Framework notes

- **Vite / Create React App:** No special configuration required. Simply import `<Cropper />` and `styles.css` directly.

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
