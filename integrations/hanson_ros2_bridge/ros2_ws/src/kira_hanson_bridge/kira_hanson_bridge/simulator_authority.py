from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import rclpy
from ament_index_python.packages import get_package_share_directory
from rclpy.node import Node
from rclpy.time import Time

from kira_intent_interfaces.msg import (
    ExecutionStatus,
    ExpressionIntent,
    GazeIntent,
    GestureIntent,
    SpeechIntent,
)

from .policy import SafetyPolicy


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class SimulatorAuthority(Node):
    """Policy authority for the proof of concept.

    Accepted intentions are logged as safe semantic requests. This node does
    not issue joint, motor, navigation, or hardware commands.
    """

    def __init__(self) -> None:
        super().__init__("kira_simulator_authority")

        package_share = Path(get_package_share_directory("kira_hanson_bridge"))
        default_policy = package_share / "config" / "safety_policy.yaml"

        policy_file = self.declare_parameter("policy_file", str(default_policy)).value
        evidence_file = self.declare_parameter(
            "evidence_file", "/tmp/kira_hanson_bridge_evidence.jsonl"
        ).value

        self.policy = SafetyPolicy.from_yaml(policy_file)
        self.evidence_file = Path(str(evidence_file))
        self.evidence_file.parent.mkdir(parents=True, exist_ok=True)

        self.status_publisher = self.create_publisher(
            ExecutionStatus, "/kira/execution_status", 10
        )
        self.create_subscription(
            SpeechIntent, "/kira/intents/speech", self._on_speech, 10
        )
        self.create_subscription(
            GazeIntent, "/kira/intents/gaze", self._on_gaze, 10
        )
        self.create_subscription(
            ExpressionIntent, "/kira/intents/expression", self._on_expression, 10
        )
        self.create_subscription(
            GestureIntent, "/kira/intents/gesture", self._on_gesture, 10
        )

        self.get_logger().info(
            f"Bounded simulator authority ready. Policy={policy_file}; evidence={self.evidence_file}"
        )

    def _age_ms(self, stamp_msg: Any) -> int:
        stamp = Time.from_msg(stamp_msg)
        if stamp.nanoseconds <= 0:
            return 0
        delta_ns = self.get_clock().now().nanoseconds - stamp.nanoseconds
        return max(0, int(delta_ns / 1_000_000))

    def _common(self, msg: Any) -> dict[str, Any]:
        return {
            "intent_id": msg.intent_id,
            "source_identity": msg.source_identity,
            "confidence": float(msg.confidence),
            "ttl_ms": int(msg.ttl_ms),
            "age_ms": self._age_ms(msg.header.stamp),
            "evidence_ref": msg.evidence_ref,
        }

    def _on_speech(self, msg: SpeechIntent) -> None:
        payload = {
            **self._common(msg),
            "text": msg.text,
            "voice": msg.voice,
            "max_duration_ms": int(msg.max_duration_ms),
        }
        self._decide("speech", msg.intent_id, payload)

    def _on_gaze(self, msg: GazeIntent) -> None:
        payload = {
            **self._common(msg),
            "target_frame": msg.target_frame,
            "target": {
                "x": float(msg.target.x),
                "y": float(msg.target.y),
                "z": float(msg.target.z),
            },
            "duration_ms": int(msg.duration_ms),
        }
        self._decide("gaze", msg.intent_id, payload)

    def _on_expression(self, msg: ExpressionIntent) -> None:
        payload = {
            **self._common(msg),
            "expression": msg.expression,
            "intensity": float(msg.intensity),
            "duration_ms": int(msg.duration_ms),
        }
        self._decide("expression", msg.intent_id, payload)

    def _on_gesture(self, msg: GestureIntent) -> None:
        payload = {
            **self._common(msg),
            "gesture": msg.gesture,
            "intensity": float(msg.intensity),
            "speed": float(msg.speed),
            "duration_ms": int(msg.duration_ms),
        }
        self._decide("gesture", msg.intent_id, payload)

    def _decide(self, category: str, intent_id: str, payload: dict[str, Any]) -> None:
        result = self.policy.validate(category, payload)

        status = ExecutionStatus()
        status.header.stamp = self.get_clock().now().to_msg()
        status.intent_id = intent_id
        status.category = category
        status.accepted = result.accepted
        status.reason_code = result.reason_code
        status.executor = "kira_simulator_authority"

        if result.accepted:
            status.detail = (
                "Accepted by bounded simulator authority. "
                "No low-level motor command was emitted by this proof of concept."
            )
            self.get_logger().info(f"ACCEPT {category} {intent_id}")
        else:
            status.detail = result.detail
            self.get_logger().warning(
                f"REJECT {category} {intent_id}: {result.reason_code} — {result.detail}"
            )

        self.status_publisher.publish(status)
        self._append_evidence(
            {
                "recorded_at": utc_now(),
                "intent_id": intent_id,
                "category": category,
                "payload": payload,
                "accepted": result.accepted,
                "reason_code": result.reason_code,
                "detail": status.detail,
                "executor": status.executor,
            }
        )

    def _append_evidence(self, record: dict[str, Any]) -> None:
        try:
            with self.evidence_file.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")
        except OSError as exc:
            self.get_logger().error(f"Could not write evidence log: {exc}")


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = SimulatorAuthority()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
