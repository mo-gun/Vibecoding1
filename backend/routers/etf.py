from fastapi import APIRouter
from config import ETF_REGISTRY

router = APIRouter()


@router.get("")
def get_etf_list():
    groups = []
    for cat in ETF_REGISTRY:
        sub_groups = []
        for sg in cat.sub_groups:
            etfs = []
            for etf in sg.etfs:
                etfs.append({
                    "ticker": etf.ticker,
                    "yf_ticker": etf.yf_ticker,
                    "name": etf.name,
                    "manager": etf.manager,
                    "manager_full": etf.manager_full,
                })
            sub_groups.append({
                "sub_id": sg.sub_id,
                "sub_name": sg.sub_name,
                "etfs": etfs,
            })
        groups.append({
            "category_id": cat.category_id,
            "category_name": cat.category_name,
            "sub_groups": sub_groups,
        })
    return {"groups": groups}
