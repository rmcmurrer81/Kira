from __future__ import annotations

import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .records import AppendOnlyJSONL, stable_event_id, utc_now


@dataclass(frozen=True)
class LifeLoop:
    loop_id: str
    profile_id: str
    branch_id: str
    started_at: str
    closed_at: str | None = None
    close_reason: str | None = None


class LifeLoopStore:
    """Records process lifetimes without claiming biological continuity."""

    def __init__(self, branch_root: Path):
        self.channel = AppendOnlyJSONL(branch_root / "life_loops.jsonl")

    def _events(self) -> list[dict[str, Any]]:
        return self.channel.records()

    def open_loop(self) -> LifeLoop | None:
        active: dict[str, Any] | None = None
        for event in self._events():
            if event.get("event_type") == "loop_started":
                active = event
            elif event.get("event_type") == "loop_closed" and active:
                if event.get("loop_id") == active.get("loop_id"):
                    active = None
        if not active:
            return None
        return LifeLoop(
            loop_id=active["loop_id"],
            profile_id=active["profile_id"],
            branch_id=active["branch_id"],
            started_at=active["created_at"],
        )

    def start(self, profile_id: str, branch_id: str) -> LifeLoop:
        stale = self.open_loop()
        if stale is not None:
            self.close(stale, reason="previous_process_interrupted")
        loop_id = uuid.uuid4().hex
        created_at = utc_now()
        event = {
            "event_id": stable_event_id("loop_started", loop_id),
            "event_type": "loop_started",
            "loop_id": loop_id,
            "profile_id": profile_id,
            "branch_id": branch_id,
            "created_at": created_at,
        }
        self.channel.append_once(event)
        return LifeLoop(loop_id, profile_id, branch_id, created_at)

    def close(self, loop: LifeLoop, *, reason: str = "normal_exit") -> LifeLoop:
        if not reason or len(reason) > 80:
            raise ValueError("close reason must be bounded text")
        created_at = utc_now()
        event = {
            "event_id": stable_event_id("loop_closed", loop.loop_id),
            "event_type": "loop_closed",
            "loop_id": loop.loop_id,
            "profile_id": loop.profile_id,
            "branch_id": loop.branch_id,
            "created_at": created_at,
            "reason": reason,
        }
        self.channel.append_once(event)
        return LifeLoop(
            loop.loop_id,
            loop.profile_id,
            loop.branch_id,
            loop.started_at,
            created_at,
            reason,
        )
