"""
Chart data service using pykrx (KRX official data).
pykrx only provides daily OHLCV data — no intraday.
Period buttons map to date ranges of daily candles.
"""
import asyncio
from datetime import datetime, timedelta

from pykrx import stock as krx_stock

# period → (calendar_days_back, use_monthly_aggregation)
PERIOD_CONFIG: dict[str, tuple[int, bool]] = {
    "1d":  (7,    False),   # last ~5 trading days
    "5d":  (14,   False),   # last ~10 trading days
    "1mo": (35,   False),   # 1 month of daily candles
    "6mo": (185,  False),   # 6 months
    "ytd": (-1,   False),   # from Jan 1 to today (-1 = special)
    "1y":  (370,  False),   # 1 year
    "5y":  (1830, True),    # 5 years — monthly aggregation
    "max": (3660, True),    # ~10 years — monthly aggregation
}

# Always line chart for long-range monthly data
LINE_PERIODS = {"5y", "max"}


def _get_date_range(period: str) -> tuple[str, str]:
    today = datetime.now()
    end = today.strftime("%Y%m%d")

    if period == "ytd":
        start = datetime(today.year, 1, 1).strftime("%Y%m%d")
    else:
        days_back, _ = PERIOD_CONFIG[period]
        start = (today - timedelta(days=days_back)).strftime("%Y%m%d")

    return start, end


def _fetch_ohlcv_sync(ticker: str, period: str) -> list[dict]:
    start, end = _get_date_range(period)
    _, use_monthly = PERIOD_CONFIG[period]

    try:
        df = krx_stock.get_market_ohlcv(start, end, ticker)
    except Exception:
        return []

    if df is None or df.empty:
        return []

    # Monthly resampling for long periods
    if use_monthly:
        df = df.resample("ME").agg({
            df.columns[0]: "first",   # 시가
            df.columns[1]: "max",     # 고가
            df.columns[2]: "min",     # 저가
            df.columns[3]: "last",    # 종가
            df.columns[4]: "sum",     # 거래량
        })
        df = df.dropna()

    records = []
    for date_idx, row in df.iterrows():
        cols = list(df.columns)
        records.append({
            "time": str(date_idx)[:10],
            "open": int(row[cols[0]]),
            "high": int(row[cols[1]]),
            "low": int(row[cols[2]]),
            "close": int(row[cols[3]]),
            "volume": int(row[cols[4]]),
        })
    return records


def _fetch_compare_sync(tickers: list[str], period: str) -> list[dict]:
    results = []
    for ticker in tickers:
        data = _fetch_ohlcv_sync(ticker, period)
        if not data:
            results.append({"ticker": ticker, "data": []})
            continue
        base = data[0]["close"]
        normalized = [
            {"time": d["time"], "value": round(d["close"] / base * 100, 4)}
            for d in data
            if base > 0
        ]
        results.append({"ticker": ticker, "data": normalized})
    return results


async def fetch_ohlcv(ticker: str, period: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch_ohlcv_sync, ticker, period)


async def fetch_compare(tickers: list[str], period: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch_compare_sync, tickers, period)
