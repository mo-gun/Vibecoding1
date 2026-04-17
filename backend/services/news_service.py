"""
News service using Google News RSS feed.
Provides Korean financial news without requiring JavaScript rendering.
"""
import httpx
from bs4 import BeautifulSoup
from urllib.parse import quote

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}

NAVER_HEADERS = {
    **HEADERS,
    "Referer": "https://finance.naver.com/",
}


async def fetch_market_news(query: str = "ETF 시장", limit: int = 20) -> list[dict]:
    """Fetch Korean financial news via Google News RSS."""
    encoded = quote(query)
    url = f"https://news.google.com/rss/search?q={encoded}&hl=ko&gl=KR&ceid=KR:ko"
    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
    except Exception:
        return []

    soup = BeautifulSoup(resp.content, "xml")
    articles = []

    for item in soup.find_all("item")[:limit]:
        title_tag = item.find("title")
        link_tag = item.find("link")
        source_tag = item.find("source")
        pub_tag = item.find("pubDate")
        desc_tag = item.find("description")

        title = title_tag.get_text(strip=True) if title_tag else ""
        # Google News titles sometimes have "source - title" format
        # Clean up the source suffix
        source = source_tag.get_text(strip=True) if source_tag else ""
        if source and title.endswith(f" - {source}"):
            title = title[: -(len(source) + 3)]

        # Parse description for snippet
        summary = ""
        if desc_tag:
            desc_html = desc_tag.get_text()
            desc_soup = BeautifulSoup(desc_html, "html.parser")
            summary = desc_soup.get_text(strip=True)[:200]

        articles.append({
            "title": title,
            "url": link_tag.get_text(strip=True) if link_tag else "",
            "source": source,
            "summary": summary,
            "published_at": pub_tag.get_text(strip=True) if pub_tag else "",
        })

    return articles


async def fetch_etf_news(ticker: str, limit: int = 10) -> list[dict]:
    """Fetch news specific to an ETF ticker via Google News RSS."""
    # Try Naver Finance item news page first (server-side rendered)
    naver_articles = await _fetch_naver_item_news(ticker, limit)
    if naver_articles:
        return naver_articles

    # Fallback to Google News with ETF ticker as search term
    return await fetch_market_news(f"ETF {ticker}", limit)


async def _fetch_naver_item_news(ticker: str, limit: int) -> list[dict]:
    """Scrape per-ticker news from Naver Finance item page."""
    url = (
        f"https://finance.naver.com/item/news_news.naver"
        f"?code={ticker}&page=1&sm=title_entity_id.basic"
    )
    try:
        async with httpx.AsyncClient(headers=NAVER_HEADERS, timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
    except Exception:
        return []

    text = resp.content.decode("euc-kr", errors="replace")
    soup = BeautifulSoup(text, "html.parser")
    articles = []

    rows = soup.select("table.type5 tbody tr")
    for row in rows:
        title_el = row.select_one("td.title a")
        info_el = row.select_one("td.info")
        date_el = row.select_one("td.date")
        if not title_el:
            continue
        href = title_el.get("href", "")
        if not href.startswith("http"):
            href = "https://finance.naver.com" + href
        title_text = title_el.get_text(strip=True)
        # Skip "no results" messages
        if "결과" in title_text or len(title_text) < 5:
            continue
        articles.append({
            "title": title_text,
            "url": href,
            "source": info_el.get_text(strip=True) if info_el else "",
            "published_at": date_el.get_text(strip=True) if date_el else "",
            "summary": "",
        })
        if len(articles) >= limit:
            break

    return articles
