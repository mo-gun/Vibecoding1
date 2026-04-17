import type { ETFEntry } from '../../types'
import { ETFBadge } from './ETFBadge'
import { useDashboardStore } from '../../store/dashboardStore'

interface ETFCardProps {
  etf: ETFEntry
}

export function ETFCard({ etf }: ETFCardProps) {
  const { selectedETF, compareETFs, isCompareMode, selectETF } = useDashboardStore()

  const isSelected = !isCompareMode && selectedETF?.ticker === etf.ticker
  const isInCompare = compareETFs.some((e) => e.ticker === etf.ticker)
  const highlight = isCompareMode ? isInCompare : isSelected

  return (
    <button
      onClick={() => selectETF(etf)}
      className={`
        w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer
        ${highlight
          ? 'bg-blue-600/20 border border-blue-500/50'
          : 'hover:bg-slate-700/50 border border-transparent'
        }
      `}
    >
      <ETFBadge manager={etf.manager} />
      <span className="text-sm text-slate-200 truncate flex-1">{etf.name}</span>
      <span className="text-xs text-slate-500 shrink-0">{etf.ticker}</span>
    </button>
  )
}
