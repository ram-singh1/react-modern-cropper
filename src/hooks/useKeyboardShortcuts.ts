import { useEffect } from 'react'
import { useCropStore } from '@/store/cropStore'

const NUDGE = 0.005
const NUDGE_LARGE = 0.02

/**
 * Global keyboard shortcuts for the editor:
 *  - Arrows: nudge crop (Shift = larger step)
 *  - [ / ] : rotate -/+ 1°
 *  - R     : rotate 90°
 *  - H / V : flip horizontal / vertical
 *  - + / - : zoom in / out
 *  - Cmd/Ctrl+Z : undo,  Cmd/Ctrl+Shift+Z : redo
 *  - 0     : reset
 */
export function useKeyboardShortcuts(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      const s = useCropStore.getState()
      if (!s.imageElement) return

      const step = e.shiftKey ? NUDGE_LARGE : NUDGE
      const mod = e.metaKey || e.ctrlKey

      if (mod && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        if (e.shiftKey) s.redo()
        else s.undo()
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          s.setCrop({ ...s.crop, x: s.crop.x - step })
          break
        case 'ArrowRight':
          e.preventDefault()
          s.setCrop({ ...s.crop, x: s.crop.x + step })
          break
        case 'ArrowUp':
          e.preventDefault()
          s.setCrop({ ...s.crop, y: s.crop.y - step })
          break
        case 'ArrowDown':
          e.preventDefault()
          s.setCrop({ ...s.crop, y: s.crop.y + step })
          break
        case '[':
          s.setRotation(s.rotation - 1)
          break
        case ']':
          s.setRotation(s.rotation + 1)
          break
        case 'r':
        case 'R':
          s.rotate90()
          break
        case 'h':
        case 'H':
          s.flipHorizontal()
          break
        case 'v':
        case 'V':
          s.flipVertical()
          break
        case '+':
        case '=':
          s.setZoom(s.zoom + 0.1)
          break
        case '-':
        case '_':
          s.setZoom(s.zoom - 0.1)
          break
        case '0':
          s.reset()
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
