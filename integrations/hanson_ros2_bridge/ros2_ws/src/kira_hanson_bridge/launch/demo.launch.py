from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import TimerAction
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    package_share = Path(get_package_share_directory("kira_hanson_bridge"))
    policy_file = str(package_share / "config" / "safety_policy.yaml")

    authority = Node(
        package="kira_hanson_bridge",
        executable="simulator_authority",
        name="kira_simulator_authority",
        output="screen",
        parameters=[
            {
                "policy_file": policy_file,
                "evidence_file": "/tmp/kira_hanson_bridge_evidence.jsonl",
            }
        ],
    )

    monitor = Node(
        package="kira_hanson_bridge",
        executable="status_monitor",
        name="kira_execution_status_monitor",
        output="screen",
    )

    demo = TimerAction(
        period=1.5,
        actions=[
            Node(
                package="kira_hanson_bridge",
                executable="demo_intent_source",
                name="kira_demo_intent_source",
                output="screen",
            )
        ],
    )

    return LaunchDescription([authority, monitor, demo])
