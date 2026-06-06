"""PyTorch Dataset for sign language landmark sequences."""

import math
import os
from typing import Tuple

import numpy as np
import torch
from torch.utils.data import Dataset


class SignDataset(Dataset):
    """
    Dataset that loads pre-generated landmark sequences and applies
    feature engineering (normalization + deltas) to produce 126-feature
    vectors per frame.

    Expected input shapes:
        X.npy: (N, 30, 63) - raw landmark coordinates (21 landmarks * 3 coords)
        y.npy: (N,) - integer class labels

    Output per sample:
        features: tensor of shape (30, 126) - normalized landmarks + deltas
        label: integer class label
    """

    def __init__(self, x_path: str, y_path: str) -> None:
        """
        Initialize the dataset by loading numpy arrays.

        Args:
            x_path: Path to X.npy file with landmark sequences.
            y_path: Path to y.npy file with labels.
        """
        self.X = np.load(x_path).astype(np.float32)  # (N, 30, 63)
        self.y = np.load(y_path).astype(np.int64)     # (N,)

        assert len(self.X) == len(self.y), (
            f"X and y must have same length, got {len(self.X)} and {len(self.y)}"
        )

    def __len__(self) -> int:
        return len(self.y)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        """
        Get a single sample with feature engineering applied.

        Args:
            idx: Sample index.

        Returns:
            Tuple of (features tensor of shape (30, 126), label int).
        """
        raw_sequence = self.X[idx]  # (30, 63)
        label = int(self.y[idx])

        # Apply feature engineering: normalize + compute deltas
        features = self._prepare_features(raw_sequence)

        return torch.tensor(features, dtype=torch.float32), label

    def _prepare_features(self, raw_sequence: np.ndarray) -> np.ndarray:
        """
        Apply normalization and delta computation to a raw sequence.

        Steps:
            1. Reshape each frame from (63,) to (21, 3)
            2. Normalize: center on wrist, scale by palm size
            3. Compute deltas between consecutive frames
            4. Concatenate normalized + deltas -> (30, 126)

        Args:
            raw_sequence: Array of shape (30, 63).

        Returns:
            Array of shape (30, 126).
        """
        num_frames = raw_sequence.shape[0]

        # Reshape to (30, 21, 3)
        landmarks_3d = raw_sequence.reshape(num_frames, 21, 3)

        # Normalize each frame
        normalized = np.zeros_like(landmarks_3d)
        for f in range(num_frames):
            normalized[f] = self._normalize_frame(landmarks_3d[f])

        # Compute deltas
        deltas = np.zeros_like(normalized)
        for f in range(1, num_frames):
            deltas[f] = normalized[f] - normalized[f - 1]
        # deltas[0] remains zeros

        # Flatten landmarks back: (30, 21, 3) -> (30, 63)
        norm_flat = normalized.reshape(num_frames, 63)
        delta_flat = deltas.reshape(num_frames, 63)

        # Concatenate: (30, 126)
        features = np.concatenate([norm_flat, delta_flat], axis=1)

        return features

    @staticmethod
    def _normalize_frame(frame: np.ndarray) -> np.ndarray:
        """
        Normalize a single frame of 21 landmarks.

        Centers on wrist (landmark 0) and scales by palm size
        (distance from wrist to middle finger MCP, landmark 9).

        Args:
            frame: Array of shape (21, 3).

        Returns:
            Normalized array of shape (21, 3).
        """
        wrist = frame[0].copy()

        # Center on wrist
        centered = frame - wrist

        # Palm size: distance from wrist to middle finger MCP (index 9)
        middle_mcp = centered[9]
        palm_size = float(np.sqrt(np.sum(middle_mcp ** 2)))

        if palm_size < 1e-6:
            palm_size = 1.0

        # Scale
        normalized = centered / palm_size

        return normalized
