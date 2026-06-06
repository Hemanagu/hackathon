"""Feature engineering for hand landmark sequences."""

import math
from typing import List

import torch

from ..models.schemas import LandmarkPoint


# Labels for the 10 supported signs
SIGN_LABELS: List[str] = [
    "Hello",
    "Thank You",
    "Yes",
    "No",
    "Help",
    "Good",
    "Bad",
    "Water",
    "Food",
    "Stop",
]


def normalize_landmarks(landmarks: List[LandmarkPoint]) -> List[LandmarkPoint]:
    """
    Normalize landmarks by centering on the wrist (landmark 0) and scaling
    by the palm size (distance from wrist to middle finger MCP, landmark 9).

    Args:
        landmarks: List of 21 LandmarkPoint objects.

    Returns:
        Normalized list of 21 LandmarkPoint objects.
    """
    if len(landmarks) < 21:
        # Pad with zeros if fewer than 21 landmarks
        while len(landmarks) < 21:
            landmarks.append(LandmarkPoint(x=0.0, y=0.0, z=0.0))

    wrist = landmarks[0]

    # Center on wrist
    centered = []
    for lm in landmarks:
        centered.append(
            LandmarkPoint(
                x=lm.x - wrist.x,
                y=lm.y - wrist.y,
                z=lm.z - wrist.z,
            )
        )

    # Calculate palm size (distance from wrist to middle finger MCP)
    middle_mcp = centered[9]
    palm_size = math.sqrt(
        middle_mcp.x ** 2 + middle_mcp.y ** 2 + middle_mcp.z ** 2
    )

    # Avoid division by zero
    if palm_size < 1e-6:
        palm_size = 1.0

    # Scale by palm size
    normalized = []
    for lm in centered:
        normalized.append(
            LandmarkPoint(
                x=lm.x / palm_size,
                y=lm.y / palm_size,
                z=lm.z / palm_size,
            )
        )

    return normalized


def compute_frame_deltas(
    frames: List[List[LandmarkPoint]],
) -> List[List[LandmarkPoint]]:
    """
    Compute displacement deltas between consecutive frames.

    For each frame, compute the displacement of each landmark from the
    previous frame. The first frame's deltas are all zeros.

    Args:
        frames: List of frames, each containing 21 LandmarkPoint objects.

    Returns:
        List of delta frames, same shape as input.
    """
    deltas: List[List[LandmarkPoint]] = []

    for i, frame in enumerate(frames):
        if i == 0:
            # First frame: deltas are zeros
            deltas.append(
                [LandmarkPoint(x=0.0, y=0.0, z=0.0) for _ in range(len(frame))]
            )
        else:
            prev_frame = frames[i - 1]
            frame_delta = []
            for j, lm in enumerate(frame):
                prev_lm = prev_frame[j] if j < len(prev_frame) else LandmarkPoint(x=0.0, y=0.0, z=0.0)
                frame_delta.append(
                    LandmarkPoint(
                        x=lm.x - prev_lm.x,
                        y=lm.y - prev_lm.y,
                        z=lm.z - prev_lm.z,
                    )
                )
            deltas.append(frame_delta)

    return deltas


def prepare_sequence(
    frames: List[List[LandmarkPoint]],
    target_length: int = 30,
) -> torch.Tensor:
    """
    Prepare a sequence of landmark frames for model input.

    Steps:
        1. Normalize each frame's landmarks.
        2. Compute frame-to-frame deltas.
        3. Concatenate raw normalized + deltas -> 126 features per frame.
        4. Pad or truncate to target_length frames.

    Args:
        frames: List of frames, each containing 21 LandmarkPoint objects.
        target_length: Target number of frames (default 30).

    Returns:
        Tensor of shape (1, target_length, 126).
    """
    # Normalize each frame
    normalized_frames = [normalize_landmarks(frame) for frame in frames]

    # Compute deltas on normalized frames
    deltas = compute_frame_deltas(normalized_frames)

    # Build feature vectors: concatenate raw landmarks + deltas
    # Each landmark has 3 coords, 21 landmarks = 63 raw + 63 delta = 126
    feature_sequence: List[List[float]] = []

    for frame_idx in range(len(normalized_frames)):
        frame_features: List[float] = []

        # Raw normalized landmarks (63 features)
        for lm in normalized_frames[frame_idx]:
            frame_features.extend([lm.x, lm.y, lm.z])

        # Delta features (63 features)
        for lm in deltas[frame_idx]:
            frame_features.extend([lm.x, lm.y, lm.z])

        feature_sequence.append(frame_features)

    # Pad or truncate to target_length
    if len(feature_sequence) < target_length:
        # Pad with zero vectors
        padding = [0.0] * 126
        while len(feature_sequence) < target_length:
            feature_sequence.append(padding[:])
    elif len(feature_sequence) > target_length:
        # Truncate
        feature_sequence = feature_sequence[:target_length]

    # Convert to tensor: (1, seq_len, 126)
    tensor = torch.tensor(feature_sequence, dtype=torch.float32)
    return tensor.unsqueeze(0)
