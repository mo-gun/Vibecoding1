import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMarketNews, fetchETFNews } from '../../api'
import { NewsCard } from './NewsCard'
import { useDashboardStore } from '../../store/dashboardStore'

const QUERIES = ['ETF 시장', '코스피', '미국 증시', '반도체', '금리', '환율']

export function NewsPanel() {
  const { selectedETF } = useDashboardStore()
  const [activeTab, setActiveTab] = useState<'market' | 'etf'>('market')
  const [query, setQuery] = useState('ETF 시장')

  const marketNews = useQuery({
    queryKey: ['news', 'market', query],
    queryFn: () => fetchMarketNews(query),
    staleTime: 300_000,
    enabled: activeTab === 'market',
  })

  const etfNews = useQuery({
    queryKey: ['news', 'etf', selectedETF?.ticker],
    queryFn: () => fetchETFNews(selectedETF!.ticker),
    staleTime: 300_000,
    enabled: activeTab === 'etf' && !!selectedETF,
  })

  const activeData = activeTab === 'market' ? marketNews : etfNews
  const articles = activeData.data?.articles ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-200 mb-2">뉴스</h2>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('market')}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              activeTab === 'market' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            시장 뉴스
          </button>
          <button
            onClick={() => setActiveTab('etf')}
            disabled={!selectedETF}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              activeTab === 'etf'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            종목 뉴스
          </button>
        </div>

        {activeTab === 'market' && (
          <div className="flex flex-wrap gap-1 mt-2">
            {QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                  query === q
                    ? 'bg-slate-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'etf' && selectedETF && (
          <p className="text-xs text-slate-400 mt-2">{selectedETF.name} 관련 뉴스</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
        {activeData.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-700/40 rounded animate-pulse" />
            ))}
          </div>
        )}
        {activeData.isError && (
          <p className="text-red-400 text-sm">뉴스를 불러올 수 없습니다.</p>
        )}
        {!activeData.isLoading && !activeData.isError && !articles.length && (
          <p className="text-slate-500 text-sm text-center py-4">
            {activeTab === 'etf' && !selectedETF ? '종목을 선택하세요.' : '뉴스가 없습니다.'}
          </p>
        )}
        {articles.map((article, i) => (
          <NewsCard key={i} article={article} />
        ))}
      </div>
    </div>
  )
}
