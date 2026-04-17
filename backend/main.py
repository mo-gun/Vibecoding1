from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import etf, price, holdings, news

app = FastAPI(title="Korean ETF Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(etf.router,      prefix="/api/etfs",     tags=["ETF"])
app.include_router(price.router,    prefix="/api/price",    tags=["Price"])
app.include_router(holdings.router, prefix="/api/holdings", tags=["Holdings"])
app.include_router(news.router,     prefix="/api/news",     tags=["News"])


@app.get("/")
def root():
    return {"status": "ok", "message": "Korean ETF Dashboard API"}
