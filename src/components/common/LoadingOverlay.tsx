import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  show: boolean
  message?: string
}

export function LoadingOverlay({ show, message }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/50 backdrop-blur-sm"
        >
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          {message && (
            <p className="text-sm font-medium text-white/90">{message}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
