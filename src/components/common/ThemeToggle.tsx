import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCropStore } from '@/store/cropStore'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useCropStore((s) => s.theme)
  const toggleTheme = useCropStore((s) => s.toggleTheme)

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 backdrop-blur transition hover:bg-white/20',
        className,
      )}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </motion.span>
    </button>
  )
}
