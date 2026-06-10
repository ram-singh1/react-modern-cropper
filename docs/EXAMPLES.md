# Examples & Recipes

Copy-paste recipes for common setups. All assume:

```ts
import 'react-modern-image-cropper/styles.css'
```

---

## Basic — crop & get a Blob

```tsx
import { Cropper, type CropResult } from 'react-modern-image-cropper'

export function Editor() {
  const handleCrop = (r: CropResult) => {
    // r.blob is ready to upload; r.dataUrl for an <img> preview
    console.log(r.width, r.height, r.format)
  }
  return (
    <div style={{ height: 640 }}>
      <Cropper src="/photo.jpg" onCrop={handleCrop} />
    </div>
  )
}
```

---

## Upload the cropped result to a server

```tsx
import { Cropper, filenameFor, type CropResult } from 'react-modern-image-cropper'

function UploadEditor() {
  const upload = async (r: CropResult) => {
    const form = new FormData()
    form.append('file', r.blob, filenameFor(r.format))
    await fetch('/api/upload', { method: 'POST', body: form })
  }
  return <Cropper src="/photo.jpg" onCrop={upload} />
}
```

---

## Avatar cropper (circle + square + small file)

```tsx
<Cropper
  src={user.photo}
  shape="round"
  aspectRatio={1}
  defaultCompression={{ enabled: true, maxSizeKB: 80, maxDimension: 512 }}
  onCrop={(r) => saveAvatar(r.blob)}   // ≤ 80 KB circular PNG/WebP
/>
```

---

## Compress on upload — no cropping UI

```tsx
import { useImageCompression } from 'react-modern-image-cropper'

function FileInput() {
  const { compress, compressing } = useImageCompression()

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { blob, stats } = await compress(file, {
      maxSizeKB: 250,
      maxDimension: 1600,
      format: 'image/webp',
    })
    console.log(`${(stats.savings * 100).toFixed(0)}% smaller`)
    await fetch('/api/upload', { method: 'POST', body: blob })
  }

  return (
    <label>
      {compressing ? 'Compressing…' : 'Choose image'}
      <input type="file" accept="image/*" hidden onChange={onChange} />
    </label>
  )
}
```

---

## Controlled image source + reset

```tsx
import { useState } from 'react'
import { Cropper, useCropStore } from 'react-modern-image-cropper'

function Controlled() {
  const [src, setSrc] = useState<string>()
  const clearImage = useCropStore((s) => s.clearImage)

  return (
    <>
      <input value={src ?? ''} onChange={(e) => setSrc(e.target.value)} placeholder="Image URL" />
      <button onClick={clearImage}>Remove image</button>
      <Cropper src={src} />
    </>
  )
}
```

---

## Export programmatically (no dialog)

Drive an export from your own button using `useCropState`:

```tsx
import { Cropper, useCropState, downloadBlob, filenameFor } from 'react-modern-image-cropper'

function CustomExportButton() {
  const { exportCrop, imageElement } = useCropState()

  const save = async () => {
    if (!imageElement) return
    const result = await exportCrop({
      format: 'image/webp',
      quality: 0.9,
      compression: { enabled: true, maxSizeKB: 300 },
    })
    downloadBlob(result.blob, filenameFor(result.format))
  }

  return <button onClick={save}>Download WebP ≤ 300 KB</button>
}
```

> Mount this **inside** the same React tree as `<Cropper />` so they share the
> store.

---

## Next.js (App Router)

The editor uses `canvas`/`window`, so render it client-side only.

```tsx
// app/edit/CropperClient.tsx
'use client'
import { Cropper } from 'react-modern-image-cropper'
import 'react-modern-image-cropper/styles.css'

export default function CropperClient(props: { src: string }) {
  return <Cropper src={props.src} aspectRatio={4 / 3} />
}
```

```tsx
// app/edit/page.tsx
import CropperClient from './CropperClient'
export default function Page() {
  return <CropperClient src="/photo.jpg" />
}
```

If you hit hydration issues, lazy-load it with no SSR:

```tsx
import dynamic from 'next/dynamic'
const Cropper = dynamic(
  () => import('react-modern-image-cropper').then((m) => m.Cropper),
  { ssr: false },
)
```

---

## Vite / Create React App

No special config — import and go:

```tsx
import { Cropper } from 'react-modern-image-cropper'
import 'react-modern-image-cropper/styles.css'

export default function App() {
  return <div style={{ height: '100vh' }}><Cropper /></div>
}
```

---

## Disable AI (smallest bundle, offline)

The AI model is **lazy-loaded** only when the user clicks *Auto-Crop*, so it
never affects your initial bundle. To hide the feature entirely:

```tsx
<Cropper src="/photo.jpg" disableAutoCrop />
```

---

## Fully custom UI

Skip `<Cropper />` and assemble the primitives against the shared store:

```tsx
import {
  CropArea,
  AspectRatioPresets,
  FilterPresets,
  AdjustmentSliders,
  CropShapeToggle,
  useCropState,
  useImageLoader,
} from 'react-modern-image-cropper'
import 'react-modern-image-cropper/styles.css'

function MyEditor() {
  const { loadFromFile } = useImageLoader()
  const { exportCrop, imageElement } = useCropState()

  return (
    <div className="grid grid-cols-[1fr_320px] gap-4">
      <CropArea />
      <aside className="space-y-6">
        <input type="file" onChange={(e) => e.target.files && loadFromFile(e.target.files[0])} />
        <CropShapeToggle />
        <AspectRatioPresets />
        <AdjustmentSliders />
        <FilterPresets />
        <button
          disabled={!imageElement}
          onClick={async () => {
            const r = await exportCrop({ format: 'image/png', quality: 1 })
            window.open(r.dataUrl)
          }}
        >
          Export
        </button>
      </aside>
    </div>
  )
}
```
