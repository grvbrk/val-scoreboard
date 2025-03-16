from fastapi import FastAPI
from src.routers import matches, health

app = FastAPI(swagger_ui_parameters={"defaultModelsExpandDepth": -1})

app.include_router(matches.router)
app.include_router(health.router)
