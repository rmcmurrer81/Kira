from __future__ import annotations

import json

import rclpy
from rclpy.node import Node

from kira_intent_interfaces.msg import ExecutionStatus


class StatusMonitor(Node):
    def __init__(self) -> None:
        super().__init__("kira_execution_status_monitor")
        self.create_subscription(
            ExecutionStatus, "/kira/execution_status", self._on_status, 10
        )
        self.get_logger().info("Listening for execution status.")

    def _on_status(self, msg: ExecutionStatus) -> None:
        record = {
            "intent_id": msg.intent_id,
            "category": msg.category,
            "accepted": bool(msg.accepted),
            "reason_code": msg.reason_code,
            "detail": msg.detail,
            "executor": msg.executor,
        }
        self.get_logger().info(json.dumps(record, sort_keys=True))


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = StatusMonitor()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
