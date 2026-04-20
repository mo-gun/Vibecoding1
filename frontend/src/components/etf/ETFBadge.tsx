import type { Manager } from '../../types'
import { MANAGER_COLORS } from '../../types'

export function ETFBadge({ manager }: { manager: Manager }) {
  const colors = MANAGER_COLORS[manager]
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${colors.bg} ${colors.text}`}>
      {manager}
    </span>
  )
}
