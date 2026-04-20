from fastapi import APIRouter, HTTPException, Query
from config import get_etf_by_ticker
from services.yfinance_service import fetch_ohlcv, fetch_compare, LINE_PERIODS
from cache.simple_cache import cache

router = APIRouter()

PERIOD_TTL = {
    "1d": 60, "5d": 60,
    "1mo": 300, "6mo": 300, "ytd": 300,
    "1y": 900, "5y": 900, "max": 900,
}

VALID_PERIODS = set(PERIOD_TTL.keys())


@router.get("/{ticker}")
async def get_price(
    ticker: str,
    period: str = Query("1mo", description="1d|5d|1mo|6mo|ytd|1y|5y|max"),
):
    if period not in VALID_PERIODS:
        raise HTTPException(400, f"period must be one of {sorted(VALID_PERIODS)}")

    etf = get_etf_by_ticker(ticker)
    if not etf:
        raise HTTPException(404, f"ETF {ticker} not found")

    cache_key = f"price:{ticker}:{period}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    data = await fetch_ohlcv(etf.ticker, period)
    result = {
        "ticker": ticker,
        "yf_ticker": etf.yf_ticker,
        "name": etf.name,
        "manager": etf.manager,
        "period": period,
        "chart_type": "line" if period in LINE_PERIODS else "candle",
        "data": data,
    }
    cache.set(cache_key, result, ttl_seconds=PERIOD_TTL[period])
    return result


@router.get("/compare/multi")
async def get_compare(
    tickers: str = Query(..., description="Comma-separated tickers, e.g. 360750,379800"),
    period: str = Query("1y"),
):
    if period not in VALID_PERIODS:
        raise HTTPException(400, f"period must be one of {sorted(VALID_PERIODS)}")

    ticker_list = [t.strip() for t in tickers.split(",") if t.strip()]
    if len(ticker_list) < 2:
        raise HTTPException(400, "Provide at least 2 tickers for comparison")
    if len(ticker_list) > 5:
        raise HTTPException(400, "Maximum 5 tickers for comparison")

    etf_entries = []
    krx_tickers = []
    for t in ticker_list:
        etf = get_etf_by_ticker(t)
        if not etf:
            raise HTTPException(404, f"ETF {t} not found")
        etf_entries.append(etf)
        krx_tickers.append(etf.ticker)

    cache_key = f"compare:{','.join(ticker_list)}:{period}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    raw_series = await fetch_compare(krx_tickers, period)

    series = []
    for etf, raw in zip(etf_entries, raw_series):
        series.append({
            "ticker": etf.ticker,
            "yf_ticker": etf.yf_ticker,
            "name": etf.name,
            "manager": etf.manager,
            "data": raw["data"],
        })

    result = {"period": period, "series": series}
    cache.set(cache_key, result, ttl_seconds=PERIOD_TTL[period])
    return result
