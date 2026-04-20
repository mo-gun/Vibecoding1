import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchETFList } from '../../api'
import { ETFCard } from './ETFCard'

export function ETFGroupList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['etf-list'],
    queryFn: fetchETFList,
    staleTime: 3_600_000,
  })

  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['us_equity']))
  const [openSubGroups, setOpenSubGroups] = useState<Set<string>>(new Set(['sp500']))

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSubGroup = (id: string) => {
    setOpenSubGroups((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (isLoading) return <div className="p-4 text-slate-400 text-sm">로딩 중...</div>
  if (isError || !data) return <div className="p-4 text-red-400 text-sm">데이터 로드 실패</div>

  return (
    <div className="space-y-1">
      {data.groups.map((cat) => (
        <div key={cat.category_id}>
          <button
            onClick={() => toggleCategory(cat.category_id)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700/40 rounded-lg transition-colors"
          >
            <span>{cat.category_name}</span>
            <span className="text-slate-500 text-xs">
              {openCategories.has(cat.category_id) ? '▲' : '▼'}
            </span>
          </button>

          {openCategories.has(cat.category_id) && (
            <div className="ml-2 space-y-0.5">
              {cat.sub_groups.map((sg) => (
                <div key={sg.sub_id}>
                  <button
                    onClick={() => toggleSubGroup(sg.sub_id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700/30 rounded transition-colors"
                  >
                    <span>{sg.sub_name}</span>
                    <span className="text-slate-600">
                      {openSubGroups.has(sg.sub_id) ? '▲' : '▼'}
                    </span>
                  </button>

                  {openSubGroups.has(sg.sub_id) && (
                    <div className="ml-2 space-y-0.5 pb-1">
                      {sg.etfs.map((etf) => (
                        <ETFCard key={etf.ticker} etf={etf} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
