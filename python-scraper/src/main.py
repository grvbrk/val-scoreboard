from fastapi import FastAPI
from src.routers import matches, health, stats


app = FastAPI()
app.include_router(matches.router)
app.include_router(health.router)
app.include_router(stats.router)
