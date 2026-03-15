import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import init_db
from app.routes import auth, partners

WEBAPP_DIR = Path(__file__).resolve().parent.parent.parent / "webapp"
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Cycle Buddy API",
    description="API для мужского приложения-трекера женских циклов",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(partners.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "Cycle Buddy"}


# Serve web app
@app.get("/")
async def serve_webapp():
    return FileResponse(WEBAPP_DIR / "index.html")


if WEBAPP_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(WEBAPP_DIR)), name="static")
