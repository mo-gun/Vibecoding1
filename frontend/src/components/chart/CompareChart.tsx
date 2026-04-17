import { useEffect, useRef } from 'react'
import {
  createChart,
  type IChartApi,
  ColorType,
  CrosshairMode,
  LineSeries,
} from 'lightweight-charts'
import type { CompareSeries } from '../../types'
import { COMPARE_COLORS } from '../../types'

interface CompareChartProps {
  series: CompareSeries[]
  height?: number
}

export function CompareChart({ series, height = 380 }: CompareChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || !series.length) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      width: containerRef.current.clientWidth,
      height,
      timeScale: { timeVisible: false, secondsVisible: false },
      rightPriceScale: { borderColor: '#1e293b' },
    })

    series.forEach((s, idx) => {
      const lineSeries = chart.addSeries(LineSeries, {
        color: COMPARE_COLORS[idx % COMPARE_COLORS.length],
        lineWidth: 2,
        title: s.name,
      })
      if (s.data.length) {
        lineSeries.setData(s.data.map((d) => ({ time: d.time as string, value: d.value })))
      }
    })

    chart.timeScale().fitContent()
    chartRef.current = chart

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [series, height])

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-2">
        {series.map((s, idx) => (
          <div key={s.ticker} className="flex items-center gap-1.5 text-xs text-slate-300">
            <span
              className="w-3 h-0.5 rounded-full inline-block"
              style={{ backgroundColor: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}
            />
            <span className="font-medium" style={{ color: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}>
              {s.manager}
            </span>
            <span className="text-slate-400">{s.name}</span>
          </div>
        ))}
      </div>
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden" style={{ height }} />
      <p className="text-xs text-slate-500 mt-1">※ 최초 데이터 기준 100으로 정규화</p>
    </div>
  )
}
