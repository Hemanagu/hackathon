"""API router for sign language recognition endpoints (GestureRecognizer edition)."""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Request
from pydantic import BaseModel

from ..models.schemas import SignInfo

router = APIRouter(prefix="/api", tags=["recognition"])

# ── Supported signs & descriptions ──────────────────────────────────────────
SIGN_DESCRIPTIONS = {
    "Hello":     "Open palm waving side to side — a universal greeting gesture.",
    "Thank You": "Flat hand near face with fingertips high, expressing gratitude.",
    "Yes":       "Closed fist — ASL affirmation gesture.",
    "No":        "Victory / two-finger V shape — indicating negation.",
    "Help":      "ILY (I Love You) hand shape — closest available gesture for Help.",
    "Good":      "Thumbs-up — expressing approval.",
    "Bad":       "Thumbs-down — expressing disapproval.",
    "Water":     "Three middle fingers extended (index + middle + ring), W-shape.",
    "Food":      "All five fingertips pinched tightly together.",
    "Stop":      "Index finger pointing straight up — flat open palm signal.",
}

SIGN_LABELS = list(SIGN_DESCRIPTIONS.keys())


# ── Request / response models ────────────────────────────────────────────────
class GestureLogRequest(BaseModel):
    sign: str
    confidence: float


class GestureLogResponse(BaseModel):
    received: bool
    sign: str
    confidence: float
    timestamp: str


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/recognize/gesture", response_model=GestureLogResponse)
async def log_gesture(body: GestureLogRequest) -> GestureLogResponse:
    """
    Lightweight logging endpoint.

    The browser already performs gesture recognition via MediaPipe's
    GestureRecognizer (client-side WASM).  This endpoint simply receives
    the result for server-side logging / analytics — it performs no
    additional inference.
    """
    return GestureLogResponse(
        received=True,
        sign=body.sign,
        confidence=body.confidence,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/signs", response_model=List[SignInfo])
async def get_supported_signs() -> List[SignInfo]:
    """Return all supported signs with ASL descriptions."""
    return [
        SignInfo(name=name, description=SIGN_DESCRIPTIONS[name])
        for name in SIGN_LABELS
    ]
