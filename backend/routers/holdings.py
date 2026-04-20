from fastapi import APIRouter, HTTPException
from config import get_etf_by_ticker
from services.pykrx_service import fetch_etf_holdings
from cache.simple_cache import cache

router = APIRouter()

# Domestic equity categories where holdings are meaningful
DOMESTIC_CATEGORIES = {"domestic_equity", "sector_theme"}


@router.get("/{ticker}")
async def get_holdings(ticker: str):
    etf = get_etf_by_ticker(ticker)
    if not etf:
        raise HTTPException(404, f"ETF {ticker} not found")

    cache_key = f"holdings:{ticker}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    holdings = await fetch_etf_holdings(ticker)

    result = {
        "ticker": ticker,
        "name": etf.name,
        "manager": etf.manager,
        "top_holdings": holdings,
        "note": (
            "해외 ETF의 경우 KRX 공시 기준으로 수익증권/파생상품이 표시될 수 있습니다."
            if not holdings else None
        ),
    }
    cache.set(cache_key, result, ttl_seconds=3600)
    return result
