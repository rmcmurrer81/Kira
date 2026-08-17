from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PACKAGE_ROOT = PROJECT_ROOT / "ros2_ws" / "src" / "kira_hanson_bridge"
sys.path.insert(0, str(PACKAGE_ROOT))

from kira_hanson_bridge.policy import SafetyPolicy  # noqa: E402


def main() -> int:
    policy_path = (
        PROJECT_ROOT
        / "ros2_ws"
        / "src"
        / "kira_hanson_bridge"
        / "config"
        / "safety_policy.yaml"
    )
    sequence_path = Path(__file__).with_name("sample_sequence.json")
    evidence_path = Path(__file__).with_name("evidence.jsonl")

    policy = SafetyPolicy.from_yaml(policy_path)
    sequence = json.loads(sequence_path.read_text(encoding="utf-8"))

    if evidence_path.exists():
        evidence_path.unlink()

    accepted = 0
    rejected = 0

    for item in sequence:
        payload = dict(item)
        category = payload.pop("category")
        result = policy.validate(category, payload)
        record = {
            "recorded_at": datetime.now(timezone.utc).isoformat(),
            "intent_id": payload["intent_id"],
            "category": category,
            "accepted": result.accepted,
            "reason_code": result.reason_code,
            "detail": result.detail,
            "payload": payload,
            "executor": "standalone_simulator_authority",
        }
        with evidence_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, sort_keys=True) + "\n")

        label = "ACCEPT" if result.accepted else "REJECT"
        print(
            f"{label:6} {category:10} {payload['intent_id']}: "
            f"{result.reason_code} — {result.detail}"
        )
        accepted += int(result.accepted)
        rejected += int(not result.accepted)

    print(f"\nSummary: accepted={accepted}, rejected={rejected}")
    print(f"Evidence: {evidence_path}")
    return 0 if accepted == 4 and rejected == 1 else 1


if __name__ == "__main__":
    raise SystemExit(main())
