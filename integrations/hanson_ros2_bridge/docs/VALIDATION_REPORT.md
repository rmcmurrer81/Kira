# Validation report — 2026-08-18

Scope: simulator-first, vendor-neutral review package. This report does not claim Hanson compatibility, robot execution, safety certification, production readiness, a live Kira mind or body, or GO authority.

## Passed locally

- 64/64 standalone unit and hostile-input tests.
- Four policy-admitted examples and one intentional policy rejection.
- Four complete mock physical lifecycles and one intentional rejection.
- Both SHA-256-linked JSONL evidence chains verified.
- All 18 mock lifecycle evidence records validated against `execution-event.schema.json`, including strict RFC 3339 timestamps and terminal-state consistency.
- Python AST/compile checks across 19 Python files.
- Four JSON Schemas parsed and passed draft 2020-12 schema checks.
- Two ROS package manifests and the architecture SVG parsed as XML.
- YAML safety policy parsed and passed startup validation in the test suite.
- `git diff --check`, Markdown-link, workflow-path, package, bounded-message, and privacy scans passed.

The hostile cases cover missing, stale, and future timestamps; nonfinite and pathological numbers; malformed fields and configuration; oversized and whitespace-padded values; replay and conflicting ID reuse; unsupported capabilities; invalid lifecycle transitions; heartbeat loss and disconnect; payload size, depth, container, and cycle bounds; schema category/payload mismatch; low-level joint/trajectory injection; control characters; invalid date-times; evidence tampering; and privacy-reduced evidence behavior.

## Reproduce

From `integrations/hanson_ros2_bridge`:

```bash
python -m pip install -r standalone/requirements.txt
python -m unittest discover -s standalone/tests -v
python standalone/demo.py
python standalone/session_demo.py
python standalone/verify_evidence.py standalone/evidence.jsonl
python standalone/verify_evidence.py standalone/session_evidence.jsonl --record-schema protocol_v0_2/execution-event.schema.json
```

The generated evidence files are ignored runtime artifacts and must not be committed.

## Not run here

`ros2`, `rosdep`, `colcon`, and `ROS_DISTRO` are unavailable in the current Windows environment. No ROS 2 package build, Hanson simulator run, or hardware run was performed. The next technical gate is a `colcon` build on the ROS 2 distribution selected with Hanson, followed by official-interface mapping and Hanson simulator validation.

## Review boundary

The tree contains no direct motor, joint, trajectory, navigation, torque, velocity, shell, subprocess, or socket-control path. Robot-side authority is limited to physical execution and safety. It does not govern Kira's speech, memory, beliefs, disagreement, correction, withholding, withdrawal, or voluntary forgetting.

The public diff contains no private email conversation, private contact or shipping data, credentials, production logs, or unpublished Hanson interfaces. Intentional public maintainer and copyright metadata remains.
