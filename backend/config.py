from dataclasses import dataclass, field
from typing import List

MANAGER_BRANDS = ["TIGER", "KODEX", "ACE", "RISE", "SOL"]

@dataclass
class ETFEntry:
    ticker: str
    name: str
    manager: str
    manager_full: str

    @property
    def yf_ticker(self) -> str:
        return f"{self.ticker}.KS"

@dataclass
class SubGroup:
    sub_id: str
    sub_name: str
    etfs: List[ETFEntry] = field(default_factory=list)

@dataclass
class ETFCategory:
    category_id: str
    category_name: str
    sub_groups: List[SubGroup] = field(default_factory=list)


ETF_REGISTRY: List[ETFCategory] = [
    ETFCategory(
        category_id="domestic_equity",
        category_name="국내 주식",
        sub_groups=[
            SubGroup(
                sub_id="kospi200",
                sub_name="KOSPI200",
                etfs=[
                    ETFEntry("069500", "KODEX 200", "KODEX", "삼성자산운용"),
                    ETFEntry("102110", "TIGER 200", "TIGER", "미래에셋자산운용"),
                    ETFEntry("148020", "RISE 200", "RISE", "KB자산운용"),
                    ETFEntry("105190", "ACE 200", "ACE", "한국투자신탁운용"),
                ],
            ),
            SubGroup(
                sub_id="kosdaq150",
                sub_name="KOSDAQ150",
                etfs=[
                    ETFEntry("229200", "KODEX KOSDAQ150", "KODEX", "삼성자산운용"),
                    ETFEntry("270810", "RISE KOSDAQ150", "RISE", "KB자산운용"),
                    ETFEntry("354500", "ACE KOSDAQ150", "ACE", "한국투자신탁운용"),
                    ETFEntry("232080", "TIGER KOSDAQ150", "TIGER", "미래에셋자산운용"),
                ],
            ),
        ],
    ),
    ETFCategory(
        category_id="us_equity",
        category_name="미국 주식",
        sub_groups=[
            SubGroup(
                sub_id="sp500",
                sub_name="S&P500",
                etfs=[
                    ETFEntry("360750", "TIGER 미국S&P500", "TIGER", "미래에셋자산운용"),
                    ETFEntry("379800", "KODEX 미국S&P500TR", "KODEX", "삼성자산운용"),
                    ETFEntry("360200", "ACE 미국S&P500", "ACE", "한국투자신탁운용"),
                    ETFEntry("379780", "RISE 미국S&P500", "RISE", "KB자산운용"),
                    ETFEntry("433330", "SOL 미국S&P500", "SOL", "신한자산운용"),
                ],
            ),
            SubGroup(
                sub_id="nasdaq100",
                sub_name="NASDAQ100",
                etfs=[
                    ETFEntry("133690", "TIGER 미국나스닥100", "TIGER", "미래에셋자산운용"),
                    ETFEntry("379810", "KODEX 미국나스닥100TR", "KODEX", "삼성자산운용"),
                    ETFEntry("367380", "ACE 미국나스닥100", "ACE", "한국투자신탁운용"),
                    ETFEntry("368590", "RISE 미국나스닥100", "RISE", "KB자산운용"),
                    ETFEntry("476030", "SOL 미국나스닥100", "SOL", "신한자산운용"),
                ],
            ),
        ],
    ),
    ETFCategory(
        category_id="global_equity",
        category_name="글로벌/해외",
        sub_groups=[
            SubGroup(
                sub_id="india",
                sub_name="인도",
                etfs=[
                    ETFEntry("453870", "TIGER 인도니프티50", "TIGER", "미래에셋자산운용"),
                    ETFEntry("494600", "KODEX 인도Nifty50", "KODEX", "삼성자산운용"),
                    ETFEntry("473450", "ACE 인도니프티50", "ACE", "한국투자신탁운용"),
                ],
            ),
            SubGroup(
                sub_id="japan",
                sub_name="일본",
                etfs=[
                    ETFEntry("241180", "KODEX 일본TOPIX100", "KODEX", "삼성자산운용"),
                    ETFEntry("396520", "TIGER 일본니케이225", "TIGER", "미래에셋자산운용"),
                ],
            ),
            SubGroup(
                sub_id="china",
                sub_name="중국",
                etfs=[
                    ETFEntry("314250", "KODEX 차이나H", "KODEX", "삼성자산운용"),
                    ETFEntry("168580", "TIGER 차이나A300", "TIGER", "미래에셋자산운용"),
                ],
            ),
            SubGroup(
                sub_id="europe",
                sub_name="유럽",
                etfs=[
                    ETFEntry("195930", "TIGER 유로스탁스50(합성H)", "TIGER", "미래에셋자산운용"),
                ],
            ),
        ],
    ),
    ETFCategory(
        category_id="sector_theme",
        category_name="섹터/테마",
        sub_groups=[
            SubGroup(
                sub_id="semiconductor",
                sub_name="반도체",
                etfs=[
                    ETFEntry("091160", "KODEX 반도체", "KODEX", "삼성자산운용"),
                    ETFEntry("396500", "TIGER 반도체TOP10", "TIGER", "미래에셋자산운용"),
                    ETFEntry("494340", "ACE 글로벌AI반도체", "ACE", "한국투자신탁운용"),
                    ETFEntry("381180", "TIGER 미국필라델피아반도체나스닥", "TIGER", "미래에셋자산운용"),
                ],
            ),
            SubGroup(
                sub_id="battery",
                sub_name="2차전지",
                etfs=[
                    ETFEntry("305720", "KODEX 2차전지산업", "KODEX", "삼성자산운용"),
                    ETFEntry("371460", "TIGER 2차전지TOP10", "TIGER", "미래에셋자산운용"),
                    ETFEntry("459580", "ACE 2차전지&소부장액티브", "ACE", "한국투자신탁운용"),
                ],
            ),
            SubGroup(
                sub_id="bio_health",
                sub_name="바이오/헬스케어",
                etfs=[
                    ETFEntry("261250", "KODEX 바이오", "KODEX", "삼성자산운용"),
                    ETFEntry("203780", "TIGER 200 헬스케어", "TIGER", "미래에셋자산운용"),
                    ETFEntry("143460", "RISE 헬스케어", "RISE", "KB자산운용"),
                ],
            ),
        ],
    ),
    ETFCategory(
        category_id="bond",
        category_name="채권",
        sub_groups=[
            SubGroup(
                sub_id="domestic_bond",
                sub_name="국내 채권",
                etfs=[
                    ETFEntry("273130", "KODEX 종합채권(AA-이상)액티브", "KODEX", "삼성자산운용"),
                    ETFEntry("157450", "TIGER 국채3년", "TIGER", "미래에셋자산운용"),
                    ETFEntry("114260", "KODEX 국고채3년", "KODEX", "삼성자산운용"),
                ],
            ),
            SubGroup(
                sub_id="us_bond",
                sub_name="미국 채권",
                etfs=[
                    ETFEntry("305080", "TIGER 미국채10년선물", "TIGER", "미래에셋자산운용"),
                    ETFEntry("308620", "KODEX 미국채10년선물", "KODEX", "삼성자산운용"),
                    ETFEntry("332620", "ACE 미국채30년액티브(H)", "ACE", "한국투자신탁운용"),
                    ETFEntry("453820", "SOL 미국30년국채액티브(H)", "SOL", "신한자산운용"),
                ],
            ),
        ],
    ),
    ETFCategory(
        category_id="commodity",
        category_name="원자재/실물",
        sub_groups=[
            SubGroup(
                sub_id="gold",
                sub_name="금",
                etfs=[
                    ETFEntry("411060", "ACE KRX금현물", "ACE", "한국투자신탁운용"),
                    ETFEntry("319640", "TIGER 골드선물(H)", "TIGER", "미래에셋자산운용"),
                    ETFEntry("132030", "KODEX 골드선물(H)", "KODEX", "삼성자산운용"),
                ],
            ),
            SubGroup(
                sub_id="oil",
                sub_name="원유",
                etfs=[
                    ETFEntry("130680", "TIGER 원유선물Enhanced(H)", "TIGER", "미래에셋자산운용"),
                    ETFEntry("261220", "KODEX WTI원유선물(H)", "KODEX", "삼성자산운용"),
                ],
            ),
        ],
    ),
]

# Flat lookup by ticker
_TICKER_MAP: dict[str, ETFEntry] = {}
for _cat in ETF_REGISTRY:
    for _sg in _cat.sub_groups:
        for _etf in _sg.etfs:
            _TICKER_MAP[_etf.ticker] = _etf

def get_etf_by_ticker(ticker: str) -> ETFEntry | None:
    return _TICKER_MAP.get(ticker)

def get_all_tickers() -> list[str]:
    return list(_TICKER_MAP.keys())
