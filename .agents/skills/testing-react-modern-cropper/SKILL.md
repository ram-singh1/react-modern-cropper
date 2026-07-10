---
name: testing-react-modern-cropper
description: Test the react-modern-cropper demo/package end-to-end (crop/export, docs links, security headers, and responsive/mobile behavior). Use when verifying UI or config changes to the Cropper component or the demo app.
---

# Testing react-modern-cropper

Client-side-only React (Vite + TS) image cropper. No backend/DB/auth, no secrets required.

## Devin Secrets Needed
None. Everything runs locally; GitHub/Vercel access is via the built-in git integration.

## Local setup / commands
- Install: `npm install` (already in the blueprint).
- Dev server (demo app): `npm run dev` → http://localhost:5173 (auto-increments to 5174+ if busy).
- Lint (type-check): `npm run lint` (`tsc --noEmit`).
- Build demo: `npm run build:demo`. Build library: `npm run build`.
- The demo app (`src/App.tsx`) is itself a consumer of the packaged `<Cropper />` — good enough to exercise the component.

## Reaching the feature in the UI
- Left nav "Interactive Playground" is the default view. Click **"Load Sample Image"** to load a test image into the cropper (needed before the header action buttons, crop frame, action bar, and bottom toolbar appear).
- Bottom toolbar tabs: Crop / Light / Color / Filters. Export via the **Export** button → modal.

## Before/after comparison methodology (very useful for UI diffs)
Run BOTH versions side by side to make a change obvious in a recording:
1. `git worktree add -f /tmp/rmc-main main` and symlink node_modules: `ln -s <repo>/node_modules /tmp/rmc-main/node_modules`.
2. Start the BEFORE server on a pinned port: `cd /tmp/rmc-main && npm run dev -- --port 5188 --strictPort`.
3. AFTER = your PR branch checked out in the main repo dir (its own `npm run dev`).
4. Clean up after: `git worktree remove /tmp/rmc-main --force`.

## Mobile / responsive testing
- Resize the Chrome window to a mobile width with wmctrl instead of devtools device mode:
  `wmctrl -r :ACTIVE: -b remove,maximized_vert,maximized_horz; wmctrl -r :ACTIVE: -e 0,40,10,400,900` (≈400px wide).
- Restore: `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.
- The header's extra action buttons (undo/redo/reset/new) only appear after an image is loaded — narrow-width crowding is only visible then.

## Handy observable signals (avoid ambiguous screenshots)
- **Zoom state proxy:** the **Undo** button in the header is `disabled` when zoom/history is untouched and becomes enabled after a zoom/edit. Use it to prove whether a wheel/gesture actually changed state, rather than eyeballing image size.
- The stripped DOM returned with each screenshot exposes `disabled`, `title`, and `offscreen` attributes — read them for precise assertions.

## Gotchas
- The crop stage has a `wheel` handler. As of the responsive PR, plain wheel scroll passes through to the page and **zoom requires Ctrl/Cmd (or trackpad pinch, which sets `ctrlKey`)**. On older builds plain wheel over the canvas zooms and blocks page scroll.
- Security headers from `vercel.json` can only be verified on a real Vercel deployment (not `vite dev`). Production can serve a stale cached bundle for a while after merge — re-check with a cache-busting query (`?cb=$RANDOM`) and look for `x-vercel-cache: MISS` + a new asset hash before concluding.
- Docs/README relative links (`./docs/*.md`) work on GitHub but 404 on the npm package page — use absolute GitHub URLs.
- npm package name is `react-modern-image-cropper`; GitHub repo is `react-modern-cropper` (StackBlitz/link URLs must use the repo name).
