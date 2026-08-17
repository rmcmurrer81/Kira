from __future__ import annotations

import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PACKAGE_ROOT = PROJECT_ROOT / "ros2_ws" / "src" / "kira_hanson_bridge"
sys.path.insert(0, str(PACKAGE_ROOT))

from kira_hanson_bridge.policy import SafetyPolicy  # noqa: E402


POLICY_PATH = (
    PROJECT_ROOT
    / "ros2_ws"
    / "src"
    / "kira_hanson_bridge"
    / "config"
    / "safety_policy.yaml"
)


def base_payload() -> dict:
    return {
        "intent_id": "test-intent",
        "source_identity": "kira",
        "confidence": 0.9,
        "ttl_ms": 5000,
        "age_ms": 10,
        "evidence_ref": "test",
    }


class PolicyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.policy = SafetyPolicy.from_yaml(POLICY_PATH)

    def test_allows_wave(self) -> None:
        payload = {
            **base_payload(),
            "gesture": "wave",
            "intensity": 0.5,
            "speed": 0.4,
            "duration_ms": 2000,
        }
        self.assertTrue(self.policy.validate("gesture", payload).accepted)

    def test_rejects_unknown_gesture(self) -> None:
        payload = {
            **base_payload(),
            "gesture": "unbounded_spin",
            "intensity": 0.5,
            "speed": 0.4,
            "duration_ms": 2000,
        }
        result = self.policy.validate("gesture", payload)
        self.assertFalse(result.accepted)
        self.assertEqual(result.reason_code, "GESTURE_NOT_ALLOWED")

    def test_rejects_stale_intent(self) -> None:
        payload = {
            **base_payload(),
            "age_ms": 6000,
            "text": "hello",
            "voice": "default",
            "max_duration_ms": 2000,
        }
        result = self.policy.validate("speech", payload)
        self.assertFalse(result.accepted)
        self.assertEqual(result.reason_code, "STALE_INTENT")

    def test_rejects_out_of_range_gaze(self) -> None:
        payload = {
            **base_payload(),
            "target_frame": "world",
            "target": {"x": 100.0, "y": 0.0, "z": 1.0},
            "duration_ms": 2000,
        }
        result = self.policy.validate("gaze", payload)
        self.assertFalse(result.accepted)
        self.assertEqual(result.reason_code, "GAZE_TARGET_OUT_OF_RANGE")

    def test_rejects_oversized_speech(self) -> None:
        payload = {
            **base_payload(),
            "text": "x" * 501,
            "voice": "default",
            "max_duration_ms": 2000,
        }
        result = self.policy.validate("speech", payload)
        self.assertFalse(result.accepted)
        self.assertEqual(result.reason_code, "SPEECH_TOO_LONG")


if __name__ == "__main__":
    unittest.main()
