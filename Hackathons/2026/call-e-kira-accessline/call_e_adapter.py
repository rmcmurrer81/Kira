"""CALL-E integration boundary.

The real SDK/API call is intentionally absent until Robert creates a CALL-E
account and provides credentials through environment variables or a secret store.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from app import CallPlan


@dataclass(frozen=True)
class CallResult:
    provider_call_id: str
    transcript: list[str]
    completed: bool


class CallProvider(Protocol):
    def place_approved_call(self, plan: CallPlan) -> CallResult: ...


class DisabledCallEProvider:
    def place_approved_call(self, plan: CallPlan) -> CallResult:
        raise RuntimeError(
            "CALL-E integration is not configured. The deterministic planning core "
            "may be tested, but no phone call will be placed."
        )
