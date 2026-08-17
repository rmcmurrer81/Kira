# Bounded intention interface contract

## Purpose

The contract carries **high-level social intentions**, not actuator commands. It is designed to be small enough to audit and replace when Hanson Robotics' official interfaces are available.

## Common fields

Every intention includes:

| Field | Meaning |
|---|---|
| `header.stamp` | Time the intention was created. |
| `header.frame_id` | Optional reference frame; category-specific rules still apply. |
| `intent_id` | Unique identifier used for acknowledgement and evidence. |
| `source_identity` | Synthetic identity requesting the action, such as `kira`. |
| `confidence` | Upstream confidence from 0.0 to 1.0; it does not override safety. |
| `ttl_ms` | Maximum age before the request is rejected as stale. |
| `evidence_ref` | Optional reference to the reviewed conversation, plan, or event that produced the intention. |

## Speech

Speech is a bounded request to vocalize text. Additional fields are `text`, `voice`, and `max_duration_ms`. The bridge does not select arbitrary shell commands, audio files, or network resources.

## Gaze

Gaze is a target point expressed in an allowed frame. Additional fields are `target_frame`, `target` (`geometry_msgs/Point`), and `duration_ms`. The proof of concept constrains coordinate magnitude and frame vocabulary. A production mapping must use Hanson-provided frame conventions.

## Expression

Expression is a named, allowlisted facial state. Additional fields are `expression`, `intensity`, and `duration_ms`. The proof of concept never sends individual facial motor values.

## Gesture

Gesture is a named, allowlisted whole-body or upper-body social gesture. Additional fields are `gesture`, `intensity`, `speed`, and `duration_ms`. The proof of concept never sends joint angles or trajectories.

## Execution status

Every policy decision publishes `intent_id`, `category`, `accepted`, `reason_code`, `detail`, and `executor`.

The initial simulator authority reports policy acceptance or rejection. A production adapter should extend the lifecycle to distinguish policy accepted, queued, started, completed, failed, cancelled, and safety interrupted.

## Versioning

This prototype uses package version `0.1.0`. Breaking changes should increment the major version once the contract is used by more than one implementation.
