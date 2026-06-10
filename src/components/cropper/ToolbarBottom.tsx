import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Crop, SlidersHorizontal, Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RotateSlider } from './RotateSlider'
import { AspectRatioPresets } from './AspectRatioPresets'
import { AdjustmentSliders } from './AdjustmentSliders'
import { AdvancedAdjustments } from './AdvancedAdjustments'
import { FilterPresets } from './FilterPresets'
import { CropShapeToggle } from './CropShapeToggle'

type TabId = 'crop' | 'adjust' | 'color' | 'filters'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'crop', label: 'Crop', icon: <Crop className="h-4 w-4" /> },
  { id: 'adjust', label: 'Light', icon: <SlidersHorizontal className="h-4 w-4" /> },
  { id: 'color', label: 'Color', icon: <Wand2 className="h-4 w-4" /> },
  { id: 'filters', label: 'Filters', icon: <Sparkles className="h-4 w-4" /> },
]

interface ToolbarBottomProps {
  showCropTab?: boolean
  showAdjustTab?: boolean
  showColorTab?: boolean
  showFiltersTab?: boolean
  onlyIcons?: boolean
  customStyles?: {
    tabButton?: string
  }
}

export function ToolbarBottom({
  showCropTab = true,
  showAdjustTab = true,
  showColorTab = true,
  showFiltersTab = true,
  onlyIcons = false,
  customStyles,
}: ToolbarBottomProps) {
  const visibleTabs = TABS.filter((t) => {
    if (t.id === 'crop') return showCropTab
    if (t.id === 'adjust') return showAdjustTab
    if (t.id === 'color') return showColorTab
    if (t.id === 'filters') return showFiltersTab
    return true
  })

  const [tab, setTab] = useState<TabId>(() => {
    return visibleTabs[0]?.id ?? 'crop'
  })

  return (
    <div className="border-t border-white/10 bg-neutral-900/40 backdrop-blur-2xl">
      {/* Tab content */}
      <div className="px-4 pb-2 pt-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-auto max-w-2xl"
          >
            {tab === 'crop' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-white/50">Shape</span>
                  <CropShapeToggle />
                </div>
                <AspectRatioPresets />
                <RotateSlider />
              </div>
            )}
            {tab === 'adjust' && <AdjustmentSliders />}
            {tab === 'color' && <AdvancedAdjustments />}
            {tab === 'filters' && <FilterPresets />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab bar */}
      <div className="flex items-stretch justify-center gap-1 border-t border-white/5 px-2 py-1.5">
        {visibleTabs.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'relative flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-[11px] font-medium transition sm:flex-none sm:px-6',
                !onlyIcons && 'flex-col gap-1',
                active ? 'text-brand-300' : 'text-white/50 hover:text-white/80',
                customStyles?.tabButton,
              )}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 -z-10 rounded-xl border border-brand-400/30 bg-brand-500/15 shadow-[0_0_20px_-6px_rgba(99,102,241,0.6)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              {t.icon}
              {!onlyIcons && t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
