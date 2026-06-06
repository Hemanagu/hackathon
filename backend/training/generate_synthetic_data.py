"""
Generate synthetic hand landmark data for training the sign language LSTM model.

Creates realistic hand pose sequences for 10 sign language gestures with
motion patterns, noise augmentation, scale variation, and random rotation.

Outputs:
    training/data/X_train.npy - shape (5000, 30, 63)
    training/data/y_train.npy - shape (5000,)
"""

import math
import os
import sys

import numpy as np

# Sign labels (must match the order in feature_engineering.py)
SIGN_LABELS = [
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

NUM_FRAMES = 30
NUM_LANDMARKS = 21
SAMPLES_PER_SIGN = 500


def make_base_poses() -> dict:
    """
    Define base hand poses for each sign.

    Hand landmark indices (MediaPipe convention):
        0: WRIST
        1: THUMB_CMC, 2: THUMB_MCP, 3: THUMB_IP, 4: THUMB_TIP
        5: INDEX_MCP, 6: INDEX_PIP, 7: INDEX_DIP, 8: INDEX_TIP
        9: MIDDLE_MCP, 10: MIDDLE_PIP, 11: MIDDLE_DIP, 12: MIDDLE_TIP
        13: RING_MCP, 14: RING_PIP, 15: RING_DIP, 16: RING_TIP
        17: PINKY_MCP, 18: PINKY_PIP, 19: PINKY_DIP, 20: PINKY_TIP

    Coordinate system: x goes right, y goes down (0=top), z goes into screen.
    Wrist is at roughly (0.5, 0.5, 0.0). Fingers extend upward (lower y).
    """

    # ---- OPEN PALM: all fingers extended ----
    open_palm = [
        (0.500, 0.500, 0.000),  # 0  WRIST
        (0.440, 0.460, 0.000),  # 1  THUMB_CMC
        (0.400, 0.420, 0.000),  # 2  THUMB_MCP
        (0.370, 0.380, 0.000),  # 3  THUMB_IP
        (0.340, 0.350, 0.000),  # 4  THUMB_TIP
        (0.460, 0.380, 0.000),  # 5  INDEX_MCP
        (0.460, 0.320, 0.000),  # 6  INDEX_PIP
        (0.460, 0.270, 0.000),  # 7  INDEX_DIP
        (0.460, 0.230, 0.000),  # 8  INDEX_TIP
        (0.500, 0.370, 0.000),  # 9  MIDDLE_MCP
        (0.500, 0.300, 0.000),  # 10 MIDDLE_PIP
        (0.500, 0.250, 0.000),  # 11 MIDDLE_DIP
        (0.500, 0.210, 0.000),  # 12 MIDDLE_TIP
        (0.540, 0.380, 0.000),  # 13 RING_MCP
        (0.540, 0.320, 0.000),  # 14 RING_PIP
        (0.540, 0.270, 0.000),  # 15 RING_DIP
        (0.540, 0.230, 0.000),  # 16 RING_TIP
        (0.580, 0.400, 0.000),  # 17 PINKY_MCP
        (0.580, 0.350, 0.000),  # 18 PINKY_PIP
        (0.580, 0.310, 0.000),  # 19 PINKY_DIP
        (0.580, 0.280, 0.000),  # 20 PINKY_TIP
    ]

    # ---- FIST: all fingers curled toward palm ----
    fist = [
        (0.500, 0.500, 0.000),  # 0  WRIST
        (0.440, 0.460, 0.000),  # 1  THUMB_CMC
        (0.420, 0.430, 0.000),  # 2  THUMB_MCP
        (0.430, 0.410, 0.000),  # 3  THUMB_IP
        (0.450, 0.400, 0.000),  # 4  THUMB_TIP (curled over fingers)
        (0.460, 0.400, 0.000),  # 5  INDEX_MCP
        (0.460, 0.380, 0.000),  # 6  INDEX_PIP
        (0.460, 0.400, 0.010),  # 7  INDEX_DIP (curled)
        (0.460, 0.420, 0.015),  # 8  INDEX_TIP (near palm)
        (0.500, 0.390, 0.000),  # 9  MIDDLE_MCP
        (0.500, 0.370, 0.000),  # 10 MIDDLE_PIP
        (0.500, 0.390, 0.010),  # 11 MIDDLE_DIP
        (0.500, 0.410, 0.015),  # 12 MIDDLE_TIP
        (0.540, 0.400, 0.000),  # 13 RING_MCP
        (0.540, 0.380, 0.000),  # 14 RING_PIP
        (0.540, 0.400, 0.010),  # 15 RING_DIP
        (0.540, 0.420, 0.015),  # 16 RING_TIP
        (0.570, 0.420, 0.000),  # 17 PINKY_MCP
        (0.570, 0.400, 0.000),  # 18 PINKY_PIP
        (0.570, 0.420, 0.010),  # 19 PINKY_DIP
        (0.570, 0.440, 0.015),  # 20 PINKY_TIP
    ]

    # ---- THUMBS UP: thumb extended upward, others curled ----
    thumbs_up = [
        (0.500, 0.500, 0.000),  # 0  WRIST
        (0.440, 0.460, 0.000),  # 1  THUMB_CMC
        (0.420, 0.410, 0.000),  # 2  THUMB_MCP
        (0.410, 0.360, 0.000),  # 3  THUMB_IP
        (0.400, 0.310, 0.000),  # 4  THUMB_TIP (extended up, low y)
        (0.460, 0.400, 0.000),  # 5  INDEX_MCP
        (0.460, 0.380, 0.000),  # 6  INDEX_PIP
        (0.460, 0.400, 0.010),  # 7  INDEX_DIP
        (0.460, 0.420, 0.015),  # 8  INDEX_TIP
        (0.500, 0.390, 0.000),  # 9  MIDDLE_MCP
        (0.500, 0.370, 0.000),  # 10 MIDDLE_PIP
        (0.500, 0.390, 0.010),  # 11 MIDDLE_DIP
        (0.500, 0.410, 0.015),  # 12 MIDDLE_TIP
        (0.540, 0.400, 0.000),  # 13 RING_MCP
        (0.540, 0.380, 0.000),  # 14 RING_PIP
        (0.540, 0.400, 0.010),  # 15 RING_DIP
        (0.540, 0.420, 0.015),  # 16 RING_TIP
        (0.570, 0.420, 0.000),  # 17 PINKY_MCP
        (0.570, 0.400, 0.000),  # 18 PINKY_PIP
        (0.570, 0.420, 0.010),  # 19 PINKY_DIP
        (0.570, 0.440, 0.015),  # 20 PINKY_TIP
    ]

    # ---- THUMBS DOWN: thumb extended downward, others curled ----
    thumbs_down = [
        (0.500, 0.500, 0.000),  # 0  WRIST
        (0.440, 0.540, 0.000),  # 1  THUMB_CMC
        (0.420, 0.580, 0.000),  # 2  THUMB_MCP
        (0.410, 0.620, 0.000),  # 3  THUMB_IP
        (0.400, 0.670, 0.000),  # 4  THUMB_TIP (extended down, high y)
        (0.460, 0.400, 0.000),  # 5  INDEX_MCP
        (0.460, 0.380, 0.000),  # 6  INDEX_PIP
        (0.460, 0.400, 0.010),  # 7  INDEX_DIP
        (0.460, 0.420, 0.015),  # 8  INDEX_TIP
        (0.500, 0.390, 0.000),  # 9  MIDDLE_MCP
        (0.500, 0.370, 0.000),  # 10 MIDDLE_PIP
        (0.500, 0.390, 0.010),  # 11 MIDDLE_DIP
        (0.500, 0.410, 0.015),  # 12 MIDDLE_TIP
        (0.540, 0.400, 0.000),  # 13 RING_MCP
        (0.540, 0.380, 0.000),  # 14 RING_PIP
        (0.540, 0.400, 0.010),  # 15 RING_DIP
        (0.540, 0.420, 0.015),  # 16 RING_TIP
        (0.570, 0.420, 0.000),  # 17 PINKY_MCP
        (0.570, 0.400, 0.000),  # 18 PINKY_PIP
        (0.570, 0.420, 0.010),  # 19 PINKY_DIP
        (0.570, 0.440, 0.015),  # 20 PINKY_TIP
    ]

    # ---- TWO FINGERS: index + middle extended, others curled ----
    two_fingers = [
        (0.500, 0.500, 0.000),  # 0  WRIST
        (0.440, 0.460, 0.000),  # 1  THUMB_CMC
        (0.420, 0.430, 0.000),  # 2  THUMB_MCP
        (0.430, 0.410, 0.000),  # 3  THUMB_IP
        (0.450, 0.400, 0.000),  # 4  THUMB_TIP (curled)
        (0.460, 0.380, 0.000),  # 5  INDEX_MCP
        (0.460, 0.320, 0.000),  # 6  INDEX_PIP
        (0.460, 0.270, 0.000),  # 7  INDEX_DIP
        (0.460, 0.230, 0.000),  # 8  INDEX_TIP (extended)
        (0.500, 0.370, 0.000),  # 9  MIDDLE_MCP
        (0.500, 0.300, 0.000),  # 10 MIDDLE_PIP
        (0.500, 0.250, 0.000),  # 11 MIDDLE_DIP
        (0.500, 0.210, 0.000),  # 12 MIDDLE_TIP (extended)
        (0.540, 0.400, 0.000),  # 13 RING_MCP
        (0.540, 0.380, 0.000),  # 14 RING_PIP
        (0.540, 0.400, 0.010),  # 15 RING_DIP (curled)
        (0.540, 0.420, 0.015),  # 16 RING_TIP
        (0.570, 0.420, 0.000),  # 17 PINKY_MCP
        (0.570, 0.400, 0.000),  # 18 PINKY_PIP
        (0.570, 0.420, 0.010),  # 19 PINKY_DIP (curled)
        (0.570, 0.440, 0.015),  # 20 PINKY_TIP
    ]

    # ---- W SHAPE: index + middle + ring extended, others curled ----
    w_shape = [
        (0.500, 0.500, 0.000),  # 0  WRIST
        (0.440, 0.460, 0.000),  # 1  THUMB_CMC
        (0.420, 0.430, 0.000),  # 2  THUMB_MCP
        (0.430, 0.410, 0.000),  # 3  THUMB_IP
        (0.450, 0.400, 0.000),  # 4  THUMB_TIP (curled)
        (0.460, 0.380, 0.000),  # 5  INDEX_MCP
        (0.460, 0.320, 0.000),  # 6  INDEX_PIP
        (0.460, 0.270, 0.000),  # 7  INDEX_DIP
        (0.460, 0.230, 0.000),  # 8  INDEX_TIP (extended)
        (0.500, 0.370, 0.000),  # 9  MIDDLE_MCP
        (0.500, 0.300, 0.000),  # 10 MIDDLE_PIP
        (0.500, 0.250, 0.000),  # 11 MIDDLE_DIP
        (0.500, 0.210, 0.000),  # 12 MIDDLE_TIP (extended)
        (0.540, 0.380, 0.000),  # 13 RING_MCP
        (0.540, 0.320, 0.000),  # 14 RING_PIP
        (0.540, 0.270, 0.000),  # 15 RING_DIP
        (0.540, 0.230, 0.000),  # 16 RING_TIP (extended)
        (0.570, 0.420, 0.000),  # 17 PINKY_MCP
        (0.570, 0.400, 0.000),  # 18 PINKY_PIP
        (0.570, 0.420, 0.010),  # 19 PINKY_DIP (curled)
        (0.570, 0.440, 0.015),  # 20 PINKY_TIP
    ]

    # ---- PINCH: all fingertips converging to a point near thumb ----
    pinch = [
        (0.500, 0.500, 0.000),  # 0  WRIST
        (0.440, 0.460, 0.000),  # 1  THUMB_CMC
        (0.420, 0.430, 0.000),  # 2  THUMB_MCP
        (0.430, 0.400, 0.000),  # 3  THUMB_IP
        (0.460, 0.380, 0.005),  # 4  THUMB_TIP (pinch point)
        (0.470, 0.400, 0.000),  # 5  INDEX_MCP
        (0.475, 0.390, 0.000),  # 6  INDEX_PIP
        (0.470, 0.385, 0.003),  # 7  INDEX_DIP
        (0.462, 0.382, 0.005),  # 8  INDEX_TIP (near pinch)
        (0.500, 0.395, 0.000),  # 9  MIDDLE_MCP
        (0.495, 0.390, 0.000),  # 10 MIDDLE_PIP
        (0.480, 0.385, 0.003),  # 11 MIDDLE_DIP
        (0.465, 0.382, 0.005),  # 12 MIDDLE_TIP (near pinch)
        (0.530, 0.400, 0.000),  # 13 RING_MCP
        (0.515, 0.395, 0.000),  # 14 RING_PIP
        (0.490, 0.388, 0.003),  # 15 RING_DIP
        (0.468, 0.383, 0.005),  # 16 RING_TIP (near pinch)
        (0.555, 0.420, 0.000),  # 17 PINKY_MCP
        (0.535, 0.410, 0.000),  # 18 PINKY_PIP
        (0.500, 0.395, 0.003),  # 19 PINKY_DIP
        (0.472, 0.385, 0.005),  # 20 PINKY_TIP (near pinch)
    ]

    return {
        "Hello": open_palm,
        "Thank You": open_palm,
        "Yes": fist,
        "No": two_fingers,
        "Help": thumbs_up,
        "Good": thumbs_up,
        "Bad": thumbs_down,
        "Water": w_shape,
        "Food": pinch,
        "Stop": open_palm,
    }


def make_motion_patterns() -> dict:
    """
    Define motion patterns for each sign across 30 frames.

    Returns a dict mapping sign name -> function(base_pose, frame_idx) -> pose.
    Each function takes the base pose (21x3 array) and frame index (0-29)
    and returns the modified pose for that frame.
    """

    def hello_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """Open palm waving: wrist oscillates on x-axis."""
        pose = base.copy()
        # Sinusoidal wave on x-axis (2 full waves across 30 frames)
        dx = 0.06 * math.sin(2 * math.pi * 2 * frame / NUM_FRAMES)
        pose[:, 0] += dx
        return pose

    def thank_you_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """Flat hand moves from chin forward: y increases from 0.3 to 0.6."""
        pose = base.copy()
        t = frame / (NUM_FRAMES - 1)
        dy = 0.3 * t  # moves downward (y increases)
        dz = -0.1 * t  # moves forward (toward camera)
        pose[:, 1] += dy
        pose[:, 2] += dz
        return pose

    def yes_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """Fist nodding: wrist oscillates on y-axis."""
        pose = base.copy()
        dy = 0.05 * math.sin(2 * math.pi * 3 * frame / NUM_FRAMES)
        pose[:, 1] += dy
        return pose

    def no_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """Two fingers, wrist oscillates on x-axis (like shaking head 'no')."""
        pose = base.copy()
        dx = 0.04 * math.sin(2 * math.pi * 2.5 * frame / NUM_FRAMES)
        pose[:, 0] += dx
        # Also add a slight finger-closing motion
        t = frame / (NUM_FRAMES - 1)
        close_amount = 0.02 * math.sin(2 * math.pi * 3 * frame / NUM_FRAMES)
        # Move index and middle tips slightly
        for idx in [8, 12]:
            pose[idx, 1] += close_amount
        return pose

    def help_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """Thumbs-up fist moves upward."""
        pose = base.copy()
        t = frame / (NUM_FRAMES - 1)
        dy = -0.15 * t  # moves upward (y decreases)
        pose[:, 1] += dy
        return pose

    def good_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """Thumbs up with slight upward motion."""
        pose = base.copy()
        t = frame / (NUM_FRAMES - 1)
        dy = -0.08 * t  # slight upward
        dz = -0.03 * t  # slight forward
        pose[:, 1] += dy
        pose[:, 2] += dz
        return pose

    def bad_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """Thumbs down with slight downward motion."""
        pose = base.copy()
        t = frame / (NUM_FRAMES - 1)
        dy = 0.08 * t  # slight downward
        dz = -0.03 * t  # slight forward
        pose[:, 1] += dy
        pose[:, 2] += dz
        return pose

    def water_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """W-shape hand oscillates on y-axis (tapping chin)."""
        pose = base.copy()
        dy = 0.04 * math.sin(2 * math.pi * 4 * frame / NUM_FRAMES)
        pose[:, 1] += dy
        return pose

    def food_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """Pinch moves toward face (y decreases, z changes)."""
        pose = base.copy()
        t = frame / (NUM_FRAMES - 1)
        dy = -0.12 * t  # moves upward toward face
        dz = 0.05 * t   # moves slightly toward camera
        pose[:, 1] += dy
        pose[:, 2] += dz
        return pose

    def stop_motion(base: np.ndarray, frame: int) -> np.ndarray:
        """Flat palm pushes forward (z changes significantly)."""
        pose = base.copy()
        t = frame / (NUM_FRAMES - 1)
        dz = -0.2 * t  # pushes forward (z decreases)
        pose[:, 2] += dz
        return pose

    return {
        "Hello": hello_motion,
        "Thank You": thank_you_motion,
        "Yes": yes_motion,
        "No": no_motion,
        "Help": help_motion,
        "Good": good_motion,
        "Bad": bad_motion,
        "Water": water_motion,
        "Food": food_motion,
        "Stop": stop_motion,
    }


def apply_augmentation(
    sequence: np.ndarray,
    rng: np.random.Generator,
    noise_std: float = 0.02,
) -> np.ndarray:
    """
    Apply data augmentation to a landmark sequence.

    Args:
        sequence: Array of shape (30, 21, 3).
        rng: Numpy random generator.
        noise_std: Standard deviation of Gaussian noise.

    Returns:
        Augmented sequence of shape (30, 21, 3).
    """
    augmented = sequence.copy()

    # 1. Add Gaussian noise
    noise = rng.normal(0, noise_std, size=augmented.shape)
    augmented += noise

    # 2. Random scale variation (0.8 to 1.2)
    scale = rng.uniform(0.8, 1.2)
    # Scale relative to wrist position (landmark 0 of each frame)
    for f in range(augmented.shape[0]):
        wrist = augmented[f, 0].copy()
        augmented[f] = wrist + (augmented[f] - wrist) * scale

    # 3. Random rotation around z-axis (-15 to +15 degrees)
    angle_deg = rng.uniform(-15, 15)
    angle_rad = math.radians(angle_deg)
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)

    for f in range(augmented.shape[0]):
        wrist = augmented[f, 0].copy()
        centered = augmented[f] - wrist
        rotated_x = centered[:, 0] * cos_a - centered[:, 1] * sin_a
        rotated_y = centered[:, 0] * sin_a + centered[:, 1] * cos_a
        augmented[f, :, 0] = rotated_x + wrist[0]
        augmented[f, :, 1] = rotated_y + wrist[1]
        # z stays the same

    return augmented


def generate_data() -> None:
    """Generate synthetic training data for all 10 signs."""
    print("=" * 60)
    print("Generating Synthetic Sign Language Training Data")
    print("=" * 60)

    base_poses = make_base_poses()
    motion_patterns = make_motion_patterns()

    rng = np.random.default_rng(seed=42)

    total_samples = len(SIGN_LABELS) * SAMPLES_PER_SIGN
    X = np.zeros((total_samples, NUM_FRAMES, NUM_LANDMARKS * 3), dtype=np.float32)
    y = np.zeros(total_samples, dtype=np.int64)

    sample_idx = 0

    for label_idx, sign_name in enumerate(SIGN_LABELS):
        print(f"\nGenerating {SAMPLES_PER_SIGN} samples for '{sign_name}' "
              f"(class {label_idx})...")

        base_pose = np.array(base_poses[sign_name], dtype=np.float64)  # (21, 3)
        motion_fn = motion_patterns[sign_name]

        for s in range(SAMPLES_PER_SIGN):
            # Generate the clean sequence
            sequence = np.zeros((NUM_FRAMES, NUM_LANDMARKS, 3), dtype=np.float64)
            for f in range(NUM_FRAMES):
                sequence[f] = motion_fn(base_pose, f)

            # Apply augmentation
            sequence = apply_augmentation(sequence, rng)

            # Flatten landmarks: (30, 21, 3) -> (30, 63)
            flat_sequence = sequence.reshape(NUM_FRAMES, NUM_LANDMARKS * 3)

            X[sample_idx] = flat_sequence.astype(np.float32)
            y[sample_idx] = label_idx
            sample_idx += 1

            if (s + 1) % 100 == 0:
                print(f"  Generated {s + 1}/{SAMPLES_PER_SIGN} samples")

    # Create output directory
    output_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(output_dir, exist_ok=True)

    # Save arrays
    x_path = os.path.join(output_dir, "X_train.npy")
    y_path = os.path.join(output_dir, "y_train.npy")

    np.save(x_path, X)
    np.save(y_path, y)

    print(f"\n{'=' * 60}")
    print(f"Data generation complete!")
    print(f"X shape: {X.shape}")
    print(f"y shape: {y.shape}")
    print(f"Saved to: {output_dir}")
    print(f"\nClass distribution:")
    for i, name in enumerate(SIGN_LABELS):
        count = np.sum(y == i)
        print(f"  {i}: {name:12s} -> {count} samples")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    generate_data()
