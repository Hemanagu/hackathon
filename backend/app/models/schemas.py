"""Pydantic models for API request/response schemas."""

from pydantic import BaseModel, Field
from typing import Dict, List


class LandmarkPoint(BaseModel):
    """A single 3D landmark point."""

    x: float
    y: float
    z: float


class LandmarkFrame(BaseModel):
    """A single frame containing 21 hand landmarks."""

    landmarks: List[LandmarkPoint] = Field(
        ..., description="List of 21 hand landmark points"
    )


class SequenceRequest(BaseModel):
    """Request body for sign language recognition."""

    frames: List[LandmarkFrame] = Field(
        ..., description="Sequence of landmark frames"
    )
    handedness: str = Field(
        default="Right", description="Hand type: 'Left' or 'Right'"
    )


class SignInfo(BaseModel):
    """Information about a supported sign."""

    name: str
    description: str


class RecognitionResponse(BaseModel):
    """Response from the recognition endpoint."""

    sign: str = Field(..., description="Predicted sign name")
    confidence: float = Field(..., description="Confidence score (0-1)")
    all_scores: Dict[str, float] = Field(
        ..., description="Confidence scores for all signs"
    )
    timestamp: str = Field(..., description="ISO timestamp of prediction")
    frames_received: int = Field(
        ..., description="Number of frames in the input sequence"
    )


class HealthResponse(BaseModel):
    """Response from the health check endpoint."""

    status: str
    model_loaded: bool
    supported_signs: int
