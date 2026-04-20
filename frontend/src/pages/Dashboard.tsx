import { useQuery } from '@tanstack/react-query'
import { useDashboardStore } from '../store/dashboardStore'
import { fetchPrice, fetchCompare } from '../api'
import { ETFGroupList } from '../components/etf/ETFGroupList'
import { ETFBadge } from '../components/etf/ETFBadge'
import { PriceChart } from '../components/chart/PriceChart'
import { CompareChart } from '../components/chart/CompareChart'
import { PeriodSelector } from '../components/chart/PeriodSelector'
import { HoldingsTable } from '../components/holdings/HoldingsTable'
import { NewsPanel } from '../components/news/NewsPanel'

export function Dashboard() {
  const {
    selectedETF,
    compareETFs,
    isCompareMode,
    selectedPeriod,
    setCompareMode,
    clearCompare,
  } = useDashboardStore()

  const priceQuery = useQuery({
    queryKey: ['price', selectedETF?.ticker, selectedPeriod],
    queryFn: () => fetchPrice(selectedETF!.ticker, selectedPeriod),
    enabled: !!selectedETF && !isCompareMode,
    staleTime: selectedPeriod === '1d' || selectedPeriod === '5d' ? 60_000 : 300_000,
  })

  const compareQuery = useQuery({
    queryKey: ['compare', compareETFs.map((e) => e.ticker).join(','), selectedPeriod],
    queryFn: () => fetchCompare(compareETFs.map((e) => e.ticker), selectedPeriod),
    enabled: isCompareMode && compareETFs.length >= 2,
    staleTime: 300_000,
  })

  const chartData = priceQuery.data
  const compareData = compareQuery.data

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-700/50 overflow-y-auto bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-700/50">
          <h1 className="text-base font-bold text-white">🇰🇷 ETF 대시보드</h1>
          <p className="text-xs text-slate-500 mt-0.5">TIGER · KODEX · ACE · RISE · SOL</p>
        </div>
        <div className="p-3 flex-1">
          <ETFGroupList />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Chart Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {isCompareMode ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">비교 모드</span>
                  <span className="text-xs text-slate-400">
                    {compareETFs.length > 0
                      ? compareETFs.map((e) => e.name).join(', ')
                      : 'ETF를 선택하세요 (최대 5개)'}
                  </span>
                </div>
              ) : selectedETF ? (
                <div className="flex items-center gap-2">
                  <ETFBadge manager={selectedETF.manager} />
                  <span className="text-sm font-semibold text-slate-200">{selectedETF.name}</span>
                  <span className="text-xs text-slate-500">{selectedETF.ticker}</span>
                </div>
              ) : (
                <span className="text-slate-500 text-sm">왼쪽에서 ETF를 선택하세요</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareMode(!isCompareMode)}
                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                  isCompareMode
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isCompareMode ? '비교 모드 ON' : '비교 모드'}
              </button>
              {isCompareMode && (
                <button
                  onClick={clearCompare}
                  className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-400 hover:bg-slate-600"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* Period Selector */}
          <PeriodSelector />

          {/* Chart */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            {isCompareMode ? (
              <>
                {compareETFs.length < 2 ? (
                  <div className="h-96 flex items-center justify-center text-slate-500 text-sm">
                    비교할 ETF를 2개 이상 선택하세요
                  </div>
                ) : compareQuery.isLoading ? (
                  <div className="h-96 flex items-center justify-center text-slate-400 text-sm animate-pulse">
                    차트 로딩 중...
                  </div>
                ) : compareQuery.isError ? (
                  <div className="h-96 flex items-center justify-center text-red-400 text-sm">
                    데이터 로드 실패
                  </div>
                ) : compareData ? (
                  <CompareChart series={compareData.series} height={380} />
                ) : null}
              </>
            ) : !selectedETF ? (
              <div className="h-96 flex items-center justify-center text-slate-500 text-sm">
                ETF를 선택하면 차트가 표시됩니다
              </div>
            ) : priceQuery.isLoading ? (
              <div className="h-96 flex items-center justify-center text-slate-400 text-sm animate-pulse">
                차트 로딩 중...
              </div>
            ) : priceQuery.isError ? (
              <div className="h-96 flex items-center justify-center text-red-400 text-sm">
                데이터 로드 실패 — Yahoo Finance에서 데이터를 가져올 수 없습니다
              </div>
            ) : chartData ? (
              <PriceChart data={chartData.data} chartType={chartData.chart_type} height={380} />
            ) : null}
          </div>

          {/* Holdings */}
          {selectedETF && !isCompareMode && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                구성 종목 Top 10
                <span className="ml-2 text-xs text-slate-500 font-normal">
                  KRX 공시 기준
                </span>
              </h3>
              <HoldingsTable ticker={selectedETF.ticker} />
            </div>
          )}

          {isCompareMode && compareETFs.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">비교 대상 ETF</h3>
              <div className="flex flex-wrap gap-2">
                {compareETFs.map((etf) => (
                  <div
                    key={etf.ticker}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg border border-slate-600/50"
                  >
                    <ETFBadge manager={etf.manager} />
                    <span className="text-xs text-slate-200">{etf.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* News Panel */}
      <aside className="w-72 shrink-0 border-l border-slate-700/50 overflow-y-auto bg-slate-900/50 p-4">
        <NewsPanel />
      </aside>
    </div>
  )
}
