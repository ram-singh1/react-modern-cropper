# Styling Guide

`react-advanced-cropper` ships one self-contained stylesheet (compiled
Tailwind). You **don't** need Tailwind in your own project. Import it once:

```ts
import 'react-advanced-cropper/styles.css'
```

There are four supported ways to customise the look — from least to most
involved.

---

## 1. Light / dark theme

Set the starting theme with the prop, or flip it at runtime via the store:

```tsx
<Cropper defaultTheme="light" />
```

```ts
import { useCropStore } from 'react-advanced-cropper'

useCropStore.getState().setTheme('light')   // or toggleTheme()
```

The built-in `<ThemeToggle />` button does this for you. The editor adds/removes
a `dark` class on its own wrapper, so theming is fully scoped to the component.

---

## 2. Re-color the accent (CSS variables)

The indigo→violet→fuchsia accent is driven by three CSS custom properties.
Override them on **any ancestor** (or `:root`) and every gradient button,
slider thumb, active tab, and glow updates:

```css
/* your global stylesheet */
:root {
  --rac-accent-from: #06b6d4;   /* cyan  */
  --rac-accent-via:  #3b82f6;   /* blue  */
  --rac-accent-to:   #8b5cf6;   /* violet */
}
```

Scope it to a wrapper if you only want to re-theme one instance:

```tsx
<div style={{
  // @ts-expect-error – CSS custom properties
  '--rac-accent-from': '#f43f5e',
  '--rac-accent-to': '#f59e0b',
}}>
  <Cropper src={url} />
</div>
```

| Variable             | Default   | Used by                                    |
| -------------------- | --------- | ------------------------------------------ |
| `--rac-accent-from`  | `#6366f1` | Gradient start (buttons, logo, handles)    |
| `--rac-accent-via`   | `#8b5cf6` | Gradient middle                            |
| `--rac-accent-to`    | `#d946ef` | Gradient end                               |

---

## 3. Size & position the editor (`className` / wrapper)

The component fills its parent (`min-height: 560px`). Control its footprint
with a sized container or the `className` prop:

```tsx
<div className="h-[80vh] max-w-4xl mx-auto">
  <Cropper src={url} />
</div>
```

```tsx
<Cropper src={url} className="shadow-2xl rounded-3xl" />
```

The wrapper class is merged with the component's own classes via
`tailwind-merge`, so your utilities win on conflicts.

---

## 4. Deep overrides (CSS escape hatch)

For anything else, target the rendered DOM with your own CSS. The component uses
stable, semantic Tailwind classes, but the most robust approach is to wrap it
and scope overrides:

```css
.my-cropper :is(button) {
  font-family: 'Inter', system-ui, sans-serif;
}
```

```tsx
<div className="my-cropper">
  <Cropper src={url} />
</div>
```

If you want to rebuild the UI entirely, skip `<Cropper />` and compose the
exported primitives (`<CropArea />`, `<FilterPresets />`, the slider panels, …)
against the shared store — see [EXAMPLES.md](./EXAMPLES.md#fully-custom-ui).

---

## Tailwind users

If your app uses Tailwind v3/v4 and you want to extend the component with your
own utilities, make sure your build can see the package classes. The shipped
`styles.css` already contains everything needed at runtime, so this is only
necessary if you're composing the headless primitives with extra utilities.

```js
// tailwind.config.js (v3)
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/react-advanced-cropper/dist/**/*.js',
  ],
}
```

---

## Fonts

The stylesheet imports **Inter** from Google Fonts. To self-host or use a
different font, override the family on the wrapper:

```tsx
<Cropper className="[font-family:'YourFont',sans-serif]" />
```
