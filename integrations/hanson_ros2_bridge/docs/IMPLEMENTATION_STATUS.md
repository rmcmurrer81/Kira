# Implementation status

## Prepared in this branch

- Typed ROS 2 intention messages for speech, gaze, expression, and gesture.
- A machine-readable execution-status message.
- A simulator-authority node that validates every request against a YAML safety policy.
- Fail-closed limits for stale requests, duration, confidence, speech size, gaze range, expression vocabulary, and gesture vocabulary.
- JSONL evidence logging for accepted and rejected requests.
- A demo publisher that sends four valid intentions and one intentionally unsupported gesture.
- A status monitor and launch file for the complete demonstration.
- A standalone pure-Python policy demonstration and unit-test suite that can be reviewed without ROS 2.
- Interface, safety, and future Hanson-mapping documentation.

## Deliberately not implemented

- Direct joint, motor, actuator, walking, navigation, or unrestricted motion commands.
- Assumed Hanson Robotics topic names, coordinate frames, expression names, gesture names, or action interfaces.
- Automatic weakening or bypass of robot-side safety controls.
- Claims of compatibility with a production Hanson robot before official mapping and validation.

## Validation still required

This branch has not yet been run against Hanson Robotics' current simulator, production hardware, or finalized official ROS 2 messages. The transport and package should be built in the target ROS 2 distribution, then the generic intention types should be mapped to official Hanson interfaces with Hanson-provided limits and lifecycle semantics.

## Proposed first review sequence

1. Review the four high-level intention contracts.
2. Confirm the preferred ROS 2 distribution.
3. Confirm whether each category should use topics, services, or actions.
4. Confirm supported gaze frames, expression vocabulary, and gesture vocabulary.
5. Map the accepted semantic request into the official simulator interface.
6. Add separate accepted, queued, started, completed, failed, cancelled, and safety-interrupted statuses where supported.
7. Run the five-step demonstration and review the evidence log.
