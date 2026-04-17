export type Manager = 'TIGER' | 'KODEX' | 'ACE' | 'RISE' | 'SOL'

export interface ETFEntry {
  ticker: string
  yf_ticker: string
  name: string
  manager: Manager
  manager_full: string
}

export interface SubGroup {
  sub_id: string
  sub_name: string
  etfs: ETFEntry[]
}

export interface ETFCategory {
  category_id: string
  category_name: string
  sub_groups: SubGroup[]
}

export interface ETFListResponse {
  groups: ETFCategory[]
}

export type Period = '1d' | '5d' | '1mo' | '6mo' | 'ytd' | '1y' | '5y' | 'max'

export const PERIODS: Period[] = ['1d', '5d', '1mo', '6mo', 'ytd', '1y', '5y', 'max']

export const PERIOD_LABELS: Record<Period, string> = {
  '1d': '1일',
  '5d': '5일',
  '1mo': '1개월',
  '6mo': '6개월',
  'ytd': '연중',
  '1y': '1년',
  '5y': '5년',
  'max': '최대',
}

export interface OHLCVBar {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface PriceResponse {
  ticker: string
  yf_ticker: string
  name: string
  manager: Manager
  period: Period
  chart_type: 'candle' | 'line'
  data: OHLCVBar[]
}

export interface ComparePoint {
  time: string
  value: number
}

export interface CompareSeries {
  ticker: string
  yf_ticker: string
  name: string
  manager: Manager
  data: ComparePoint[]
}

export interface CompareResponse {
  period: Period
  series: CompareSeries[]
}

export interface Holding {
  rank: number
  ticker: string
  name: string
  weight_pct: number
  shares: number
  amount_krw: number
}

export interface HoldingsResponse {
  ticker: string
  name: string
  manager: Manager
  top_holdings: Holding[]
  note?: string | null
}

export interface NewsArticle {
  title: string
  url: string
  source: string
  summary: string
  published_at: string
}

export interface NewsResponse {
  query?: string
  ticker?: string
  name?: string
  articles: NewsArticle[]
}

export const MANAGER_COLORS: Record<Manager, { bg: string; text: string; dot: string }> = {
  TIGER: { bg: 'bg-orange-500', text: 'text-white', dot: '#f97316' },
  KODEX: { bg: 'bg-blue-600', text: 'text-white', dot: '#2563eb' },
  ACE:   { bg: 'bg-emerald-600', text: 'text-white', dot: '#059669' },
  RISE:  { bg: 'bg-purple-600', text: 'text-white', dot: '#9333ea' },
  SOL:   { bg: 'bg-sky-500', text: 'text-white', dot: '#0ea5e9' },
}

export const COMPARE_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#a855f7']
