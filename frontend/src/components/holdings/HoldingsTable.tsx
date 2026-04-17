import { useQuery } from '@tanstack/react-query'
import { fetchHoldings } from '../../api'

interface HoldingsTableProps {
  ticker: string
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000_000) return `${(amount / 1_000_000_000_000).toFixed(1)}조`
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(0)}억`
  if (amount >= 10_000) return `${(amount / 10_000).toFixed(0)}만`
  return amount.toLocaleString()
}

export function HoldingsTable({ ticker }: HoldingsTableProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['holdings', ticker],
    queryFn: () => fetchHoldings(ticker),
    staleTime: 3_600_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-slate-700/40 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return <p className="text-slate-500 text-sm">구성 종목 데이터를 불러올 수 없습니다.</p>
  }

  if (!data.top_holdings.length) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-500 text-sm">구성 종목 정보 없음</p>
        {data.note && <p className="text-slate-600 text-xs mt-1">{data.note}</p>}
      </div>
    )
  }

  const maxWeight = data.top_holdings[0]?.weight_pct ?? 1

  return (
    <div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500 border-b border-slate-700">
            <th className="text-left pb-2 w-6">#</th>
            <th className="text-left pb-2">종목</th>
            <th className="text-right pb-2 w-16">비중</th>
            <th className="text-right pb-2 w-20 hidden sm:table-cell">금액</th>
          </tr>
        </thead>
        <tbody>
          {data.top_holdings.map((h) => (
            <tr key={h.rank} className="border-b border-slate-800 hover:bg-slate-700/20">
              <td className="py-1.5 text-slate-500">{h.rank}</td>
              <td className="py-1.5">
                <div className="flex flex-col">
                  <span className="text-slate-200 truncate max-w-[160px]">{h.name}</span>
                  <div className="mt-0.5 h-1 bg-slate-700 rounded-full w-full max-w-[160px]">
                    <div
                      className="h-1 bg-blue-500 rounded-full"
                      style={{ width: `${(h.weight_pct / maxWeight) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-1.5 text-right text-slate-300 font-mono">
                {h.weight_pct.toFixed(2)}%
              </td>
              <td className="py-1.5 text-right text-slate-400 hidden sm:table-cell">
                {formatAmount(h.amount_krw)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.note && (
        <p className="text-slate-600 text-xs mt-2">{data.note}</p>
      )}
    </div>
  )
}
