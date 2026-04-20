import { PERIODS, PERIOD_LABELS, type Period } from '../../types'
import { useDashboardStore } from '../../store/dashboardStore'

export function PeriodSelector() {
  const { selectedPeriod, setPeriod } = useDashboardStore()

  return (
    <div className="flex gap-1 flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`
            px-3 py-1 text-xs rounded font-medium transition-colors
            ${selectedPeriod === p
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }
          `}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  )
}
