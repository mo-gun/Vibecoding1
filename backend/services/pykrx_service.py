import asyncio
from datetime import datetime, timedelta

# pykrx import is deferred to handle import errors gracefully
_pykrx_available = True
try:
    from pykrx import stock as krx_stock
except ImportError:
    _pykrx_available = False


def _prev_business_days(n: int = 5) -> list[str]:
    """Return last n business day strings in YYYYMMDD format."""
    dates = []
    d = datetime.now()
    while len(dates) < n:
        d -= timedelta(days=1)
        if d.weekday() < 5:  # Mon-Fri
            dates.append(d.strftime("%Y%m%d"))
    return dates


def _fetch_holdings_sync(ticker: str) -> list[dict]:
    if not _pykrx_available:
        return []

    # Try today and fall back up to 5 previous business days
    today = datetime.now().strftime("%Y%m%d")
    dates_to_try = [today] + _prev_business_days(5)

    df = None
    for date_str in dates_to_try:
        try:
            result = krx_stock.get_etf_portfolio_deposit_file(ticker, date_str)
            if result is not None and not result.empty:
                df = result
                break
        except Exception:
            continue

    if df is None or df.empty:
        return []

    df = df.reset_index()
    # pykrx columns vary by version; normalize
    cols = list(df.columns)
    # Expected: [ticker_col, 계약수, 금액, 비중] or similar
    if len(cols) < 2:
        return []

    ticker_col = cols[0]
    weight_col = cols[-1]  # 비중 is usually last

    df = df.sort_values(weight_col, ascending=False)

    holdings = []
    for rank, (_, row) in enumerate(df.head(10).iterrows(), 1):
        constituent = str(row[ticker_col])
        weight = float(row[weight_col]) if weight_col in row else 0.0
        amount = int(row[cols[2]]) if len(cols) > 2 else 0
        shares = int(row[cols[1]]) if len(cols) > 1 else 0

        name = constituent
        try:
            resolved = krx_stock.get_market_ticker_name(constituent)
            if resolved:
                name = resolved
        except Exception:
            pass

        holdings.append({
            "rank": rank,
            "ticker": constituent,
            "name": name,
            "weight_pct": round(weight, 4),
            "shares": shares,
            "amount_krw": amount,
        })

    return holdings


async def fetch_etf_holdings(ticker: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch_holdings_sync, ticker)
