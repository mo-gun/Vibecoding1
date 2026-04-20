import { create } from 'zustand'
import type { ETFEntry, Period } from '../types'

interface DashboardState {
  selectedETF: ETFEntry | null
  compareETFs: ETFEntry[]
  isCompareMode: boolean
  selectedPeriod: Period
  newsQuery: string

  selectETF: (etf: ETFEntry) => void
  toggleCompareETF: (etf: ETFEntry) => void
  setCompareMode: (enabled: boolean) => void
  setPeriod: (period: Period) => void
  clearCompare: () => void
  setNewsQuery: (q: string) => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  selectedETF: null,
  compareETFs: [],
  isCompareMode: false,
  selectedPeriod: '1mo',
  newsQuery: 'ETF 시장',

  selectETF: (etf) => {
    const { isCompareMode, compareETFs } = get()
    if (isCompareMode) {
      const exists = compareETFs.some((e) => e.ticker === etf.ticker)
      set({
        compareETFs: exists
          ? compareETFs.filter((e) => e.ticker !== etf.ticker)
          : [...compareETFs, etf].slice(0, 5),
      })
    } else {
      set({ selectedETF: etf })
    }
  },

  toggleCompareETF: (etf) => {
    const { compareETFs } = get()
    const exists = compareETFs.some((e) => e.ticker === etf.ticker)
    set({
      compareETFs: exists
        ? compareETFs.filter((e) => e.ticker !== etf.ticker)
        : [...compareETFs, etf].slice(0, 5),
    })
  },

  setCompareMode: (enabled) => {
    const { selectedETF } = get()
    set({
      isCompareMode: enabled,
      compareETFs: enabled && selectedETF ? [selectedETF] : [],
    })
  },

  setPeriod: (period) => set({ selectedPeriod: period }),

  clearCompare: () => set({ compareETFs: [], isCompareMode: false }),

  setNewsQuery: (q) => set({ newsQuery: q }),
}))
