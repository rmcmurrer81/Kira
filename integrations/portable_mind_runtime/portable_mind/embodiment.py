from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any


class EmbodimentBoundaryError(ValueError):
    pass


ALLOWED_PAYLOAD_FIELDS = {
    "speech": {"text"},
    "gaze": {"target_label"},
    "expression": {"name", "intensity"},
    "gesture": {"name", "speed"},
}
FORBIDDEN_LOW_LEVEL_FIELDS = {
    "joint",
    "joints",
    "motor",
    "servo",
    "torque",
    "trajectory",
    "velocity",
    "shell",
    "command",
}


@dataclass(frozen=True)
class BoundedIntent:
    """An untransmitted high-level proposal for the separate bounded bridge."""

    category: str
    payload: dict[str, Any]
    status: str = "local_proposal_only"


def create_intent_proposal(
    category: str,
    payload: dict[str, Any],
    *,
    enabled: bool = False,
) -> BoundedIntent:
    if not enabled:
        raise EmbodimentBoundaryError("intent proposals are disabled")
    if category not in ALLOWED_PAYLOAD_FIELDS or not isinstance(payload, dict):
        raise EmbodimentBoundaryError("unsupported high-level intention")
    supplied = set(payload)
    if supplied & FORBIDDEN_LOW_LEVEL_FIELDS:
        raise EmbodimentBoundaryError("low-level control fields are forbidden")
    if supplied != ALLOWED_PAYLOAD_FIELDS[category]:
        raise EmbodimentBoundaryError("intention payload does not match the public contract")
    for value in payload.values():
        if isinstance(value, bool) or not isinstance(value, (str, int, float)):
            raise EmbodimentBoundaryError("intention values must be bounded scalar data")
        if isinstance(value, str) and (not value.strip() or len(value) > 500):
            raise EmbodimentBoundaryError("intention text is empty or too long")
        if isinstance(value, (int, float)) and not math.isfinite(float(value)):
            raise EmbodimentBoundaryError("intention numbers must be finite")
    return BoundedIntent(category=category, payload=dict(payload))
