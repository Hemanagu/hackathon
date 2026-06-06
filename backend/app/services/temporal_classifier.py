"""Temporal classifier service that wraps the LSTM model for inference."""

import logging
import os
from typing import Any, Dict, List, Optional

import torch
import torch.nn.functional as F

from ..models.lstm_model import SignLanguageLSTM
from ..models.schemas import LandmarkPoint
from .feature_engineering import SIGN_LABELS, prepare_sequence

logger = logging.getLogger(__name__)


class TemporalClassifier:
    """
    Wraps the SignLanguageLSTM model for inference on landmark sequences.

    Loads the trained model from disk and provides a classify() method
    that processes raw landmark frames into predictions.
    """

    def __init__(self, model_path: str) -> None:
        """
        Initialize the classifier by loading the LSTM model.

        Args:
            model_path: Path to the saved model state dict (.pth file).
        """
        self._model: Optional[SignLanguageLSTM] = None
        self._model_path = model_path

        if os.path.exists(model_path):
            try:
                self._model = SignLanguageLSTM(
                    input_size=126,
                    hidden_size=128,
                    num_layers=2,
                    num_classes=len(SIGN_LABELS),
                    dropout=0.3,
                )
                state_dict = torch.load(
                    model_path, map_location=torch.device("cpu"), weights_only=True
                )
                self._model.load_state_dict(state_dict)
                self._model.eval()
                logger.info(f"Model loaded successfully from {model_path}")
            except Exception as e:
                logger.error(f"Failed to load model from {model_path}: {e}")
                self._model = None
        else:
            logger.warning(
                f"Model file not found at '{model_path}'. "
                "Classifier will return dummy predictions."
            )

    @property
    def is_loaded(self) -> bool:
        """Check if the model is loaded and ready for inference."""
        return self._model is not None

    def classify(
        self,
        frames: List[List[LandmarkPoint]],
        handedness: str = "Right",
    ) -> Dict[str, Any]:
        """
        Classify a sequence of landmark frames into a sign.

        Args:
            frames: List of frames, each containing 21 LandmarkPoint objects.
            handedness: Which hand is being tracked ('Left' or 'Right').

        Returns:
            Dictionary with keys: sign, confidence, all_scores.
        """
        if not self.is_loaded:
            # Return a dummy prediction if model is not loaded
            all_scores = {label: 1.0 / len(SIGN_LABELS) for label in SIGN_LABELS}
            return {
                "sign": SIGN_LABELS[0],
                "confidence": 1.0 / len(SIGN_LABELS),
                "all_scores": all_scores,
            }

        # If left hand, mirror the x-coordinates for consistency
        if handedness.lower() == "left":
            mirrored_frames: List[List[LandmarkPoint]] = []
            for frame in frames:
                mirrored_frame = [
                    LandmarkPoint(x=-lm.x, y=lm.y, z=lm.z) for lm in frame
                ]
                mirrored_frames.append(mirrored_frame)
            frames = mirrored_frames

        # Prepare input tensor
        input_tensor = prepare_sequence(frames)  # (1, 30, 126)

        # Run inference
        with torch.no_grad():
            logits = self._model(input_tensor)  # (1, num_classes)
            probabilities = F.softmax(logits, dim=1)  # (1, num_classes)

        # Extract predictions
        probs = probabilities.squeeze(0).tolist()  # list of floats
        predicted_idx = int(torch.argmax(probabilities, dim=1).item())

        # Build all_scores dict
        all_scores: Dict[str, float] = {}
        for i, label in enumerate(SIGN_LABELS):
            all_scores[label] = round(probs[i], 4)

        return {
            "sign": SIGN_LABELS[predicted_idx],
            "confidence": round(probs[predicted_idx], 4),
            "all_scores": all_scores,
        }
