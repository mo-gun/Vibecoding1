import { useEffect, useRef } from 'react'
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
} from 'lightweight-charts'
import type { OHLCVBar } from '../../types'

interface PriceChartProps {
  data: OHLCVBar[]
  chartType: 'candle' | 'line'
  height?: number
}

export function PriceChart({ data, chartType, height = 380 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

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
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: '#1e293b' },
    })

    let series: ISeriesApi<SeriesType>
    if (chartType === 'line') {
      series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2 })
    } else {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      })
    }

    chartRef.current = chart
    seriesRef.current = series

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
  }, [chartType, height])

  useEffect(() => {
    if (!seriesRef.current || !data.length) return
    if (chartType === 'line') {
      const lineData = data.map((d) => ({ time: d.time as string, value: d.close }))
      ;(seriesRef.current as ISeriesApi<'Line'>).setData(lineData)
    } else {
      const candleData = data.map((d) => ({
        time: d.time as string,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
      ;(seriesRef.current as ISeriesApi<'Candlestick'>).setData(candleData)
    }
    chartRef.current?.timeScale().fitContent()
  }, [data, chartType])

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" style={{ height }} />
}
