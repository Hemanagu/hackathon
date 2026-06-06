"""Geometry utility functions for 3D landmark calculations."""

import math
from typing import Union

from ..models.schemas import LandmarkPoint


# Type alias for points that can be either LandmarkPoint or dict
PointLike = Union[LandmarkPoint, dict]


def _get_coords(point: PointLike) -> tuple[float, float, float]:
    """Extract x, y, z coordinates from a LandmarkPoint or dict."""
    if isinstance(point, dict):
        return point["x"], point["y"], point["z"]
    return point.x, point.y, point.z


def calculate_distance(p1: PointLike, p2: PointLike) -> float:
    """
    Calculate the 3D Euclidean distance between two points.

    Args:
        p1: First point (LandmarkPoint or dict with x, y, z).
        p2: Second point (LandmarkPoint or dict with x, y, z).

    Returns:
        The Euclidean distance between p1 and p2.
    """
    x1, y1, z1 = _get_coords(p1)
    x2, y2, z2 = _get_coords(p2)
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)


def calculate_angle(a: PointLike, b: PointLike, c: PointLike) -> float:
    """
    Calculate the angle at point b formed by the line segments ba and bc.

    Args:
        a: First endpoint.
        b: Vertex of the angle.
        c: Second endpoint.

    Returns:
        The angle at b in degrees.
    """
    ax, ay, az = _get_coords(a)
    bx, by, bz = _get_coords(b)
    cx, cy, cz = _get_coords(c)

    # Vectors ba and bc
    ba = (ax - bx, ay - by, az - bz)
    bc = (cx - bx, cy - by, cz - bz)

    # Dot product
    dot_product = ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2]

    # Magnitudes
    mag_ba = math.sqrt(ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2)
    mag_bc = math.sqrt(bc[0] ** 2 + bc[1] ** 2 + bc[2] ** 2)

    # Avoid division by zero
    if mag_ba * mag_bc == 0:
        return 0.0

    # Clamp to [-1, 1] to handle floating point errors
    cos_angle = max(-1.0, min(1.0, dot_product / (mag_ba * mag_bc)))

    return math.degrees(math.acos(cos_angle))
