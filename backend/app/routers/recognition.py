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
    "Sign A":    "All four fingers curled into the palm, with the thumb resting along the side of the index finger.",
    "Sign B":    "All four fingers extended straight up and close together, with the thumb folded across the palm.",
    "Sign D":    "Index finger pointing straight up, while middle, ring, and pinky fingers curl down to touch the thumb.",
    "Sign F (OK)": "The index finger and thumb touch tips to form a circle, while middle, ring, and pinky fingers are extended straight up.",
    "Sign I":    "Pinky finger extended straight up, with index, middle, ring fingers, and thumb curled into the palm.",
    "Sign L":    "Index finger points straight up, and the thumb extends out horizontally at a 90-degree angle to form an 'L'.",
    "Sign U":    "Index and middle fingers extended straight up and held closely together, while ring, pinky, and thumb are curled.",
    "Sign Y":    "Thumb and pinky fingers fully extended outwards, while index, middle, and ring fingers are curled into the palm.",
    "Welcome":   "All fingers extended straight out with palm facing upward, held in the lower half of the camera view.",
    "Quiet (Shh)": "Index finger pointing straight up, while other fingers are curled, held near the center of the frame.",
    "Peace":     "Index and middle fingers extended straight up and spread apart in a 'V' shape (Victory shape).",
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
