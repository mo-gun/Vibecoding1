import client from './client'
import type { ETFListResponse, PriceResponse, CompareResponse, HoldingsResponse, NewsResponse, Period } from '../types'

export const fetchETFList = async (): Promise<ETFListResponse> => {
  const { data } = await client.get<ETFListResponse>('/etfs')
  return data
}

export const fetchPrice = async (ticker: string, period: Period): Promise<PriceResponse> => {
  const { data } = await client.get<PriceResponse>(`/price/${ticker}`, { params: { period } })
  return data
}

export const fetchCompare = async (tickers: string[], period: Period): Promise<CompareResponse> => {
  const { data } = await client.get<CompareResponse>('/price/compare/multi', {
    params: { tickers: tickers.join(','), period },
  })
  return data
}

export const fetchHoldings = async (ticker: string): Promise<HoldingsResponse> => {
  const { data } = await client.get<HoldingsResponse>(`/holdings/${ticker}`)
  return data
}

export const fetchMarketNews = async (query = 'ETF 시장'): Promise<NewsResponse> => {
  const { data } = await client.get<NewsResponse>('/news', { params: { query, limit: 20 } })
  return data
}

export const fetchETFNews = async (ticker: string): Promise<NewsResponse> => {
  const { data } = await client.get<NewsResponse>(`/news/etf/${ticker}`)
  return data
}
