from fastapi import APIRouter, Query
from config import get_etf_by_ticker
from services.news_service import fetch_etf_news, fetch_market_news
from cache.simple_cache import cache

router = APIRouter()


@router.get("")
async def get_market_news(
    query: str = Query("ETF 시장", description="Search query for market news"),
    limit: int = Query(20, ge=1, le=50),
):
    cache_key = f"news:market:{query}:{limit}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    articles = await fetch_market_news(query=query, limit=limit)
    result = {"query": query, "articles": articles}
    cache.set(cache_key, result, ttl_seconds=300)
    return result


@router.get("/etf/{ticker}")
async def get_etf_news(
    ticker: str,
    limit: int = Query(10, ge=1, le=30),
):
    etf = get_etf_by_ticker(ticker)
    name = etf.name if etf else ticker

    cache_key = f"news:etf:{ticker}:{limit}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    articles = await fetch_etf_news(ticker=ticker, limit=limit)
    result = {"ticker": ticker, "name": name, "articles": articles}
    cache.set(cache_key, result, ttl_seconds=300)
    return result
