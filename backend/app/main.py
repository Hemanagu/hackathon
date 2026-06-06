"""FastAPI application entry point — Sign Language Recognition API (GestureRecognizer edition)."""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers.recognition import SIGN_LABELS, router as recognition_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup / shutdown lifecycle."""
    logger.info("Sign Language Recognition API starting up.")
    logger.info(
        "Recognition is performed client-side via MediaPipe GestureRecognizer. "
        "Backend provides logging and sign metadata only."
    )
    yield
    logger.info("Shutting down Sign Language Recognition API.")


app = FastAPI(
    title="Sign Language Recognition API",
    description=(
        "REST API for the SignSpeak app. "
        "Hand gesture recognition runs client-side via MediaPipe GestureRecognizer (WASM). "
        "This server provides gesture logging, supported-sign metadata, and health checks."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recognition_router)


@app.get("/api/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "recognition_mode": "client-side (MediaPipe GestureRecognizer)",
        "supported_signs": len(SIGN_LABELS),
        "model_loaded": True,   # always true — model runs in browser
    }
