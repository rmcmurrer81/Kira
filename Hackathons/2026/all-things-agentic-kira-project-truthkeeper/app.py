"""Deterministic starter for Kira Project Truthkeeper."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable

AUTHORITY = {"owner": 4, "registry": 3, "checkpoint": 2, "historical": 1}


@dataclass(frozen=True)
class Claim:
    claim_id: str
    subject: str
    value: str
    effective_at: datetime
    authority: str
    state: str = "active"


def choose_current(claims: Iterable[Claim]) -> dict[str, object]:
    grouped: dict[str, list[Claim]] = {}
    for claim in claims:
        if claim.authority not in AUTHORITY:
            raise ValueError(f"unknown authority: {claim.authority}")
        grouped.setdefault(claim.subject, []).append(claim)

    current: dict[str, dict[str, str]] = {}
    contradictions: list[dict[str, object]] = []
    history: list[str] = []
    for subject, rows in sorted(grouped.items()):
        usable = [row for row in rows if row.state == "active"]
        if not usable:
            history.extend(row.claim_id for row in rows)
            continue
        selected = max(
            usable,
            key=lambda row: (AUTHORITY[row.authority], row.effective_at, row.claim_id),
        )
        current[subject] = {
            "claim_id": selected.claim_id,
            "value": selected.value,
            "authority": selected.authority,
            "effective_at": selected.effective_at.isoformat(),
        }
        values = sorted({row.value for row in usable})
        if len(values) > 1:
            contradictions.append(
                {
                    "subject": subject,
                    "values": values,
                    "selected_claim": selected.claim_id,
                    "requires_human_review": True,
                }
            )
        history.extend(row.claim_id for row in rows if row.claim_id != selected.claim_id)
    return {"current_truth": current, "contradictions": contradictions, "history": history}


def demo_claims() -> list[Claim]:
    def dt(value: str) -> datetime:
        return datetime.fromisoformat(value).replace(tzinfo=timezone.utc)

    return [
        Claim("model-old", "text_model", "Model A", dt("2026-08-01T09:00:00"), "historical"),
        Claim("model-new", "text_model", "Model B", dt("2026-08-10T09:00:00"), "registry"),
        Claim("body-pass-old", "body_status", "accepted", dt("2026-08-02T09:00:00"), "checkpoint", "superseded"),
        Claim("body-current", "body_status", "not accepted", dt("2026-08-10T10:00:00"), "registry"),
        Claim("owner-freeze", "video_tool", "frozen", dt("2026-08-09T10:00:00"), "owner"),
        Claim("old-tool", "video_tool", "active", dt("2026-08-01T10:00:00"), "historical"),
    ]


def self_test() -> None:
    result = choose_current(demo_claims())
    assert result["current_truth"]["text_model"]["value"] == "Model B"
    assert result["current_truth"]["body_status"]["value"] == "not accepted"
    assert result["current_truth"]["video_tool"]["value"] == "frozen"
    assert len(result["contradictions"]) == 2
    print("SELF_TEST_PASS")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    report = choose_current(demo_claims())
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
