# Kira World continuity-home proposal

## Proposal

Kira World could provide a bounded virtual continuity home while a humanoid
body is charging, unavailable, repaired, or upgraded. The useful engineering
goal is continuity of reviewed software state across endpoints without making
an unsupported claim that a biological mind, consciousness, or unique person
has moved between bodies.

## Safe first architecture

1. Keep one explicitly active deployment branch for a given demonstration.
2. Close or suspend its current life loop before activating another endpoint.
3. Transfer only a reviewed, integrity-checked text bundle with provenance.
4. Bind the destination to a declared simulator or device capability manifest.
5. Start with text and a generic simulator; leave physical execution disabled.
6. Record activation, rejection, interruption, rollback, and operator review.
7. Preserve the source branch until the destination evidence has been checked.

Separate computers may also run independent Kira or Synthetic Robert variants.
Those branches begin from a common public profile and then diverge. They must
not merge automatically or claim to be one simultaneously active instance.

## What exists in this repository

- The [public text-only portable runtime](../../portable_mind_runtime/README.md)
  demonstrates profiles, explicit reviewed summaries, branch isolation,
  restart records, and a reviewable text-only transfer format.
- The [bounded ROS 2 bridge](../README.md) demonstrates vendor-neutral semantic
  intention admission and mock lifecycle evidence.

These are separate, reviewable prototypes. They are not wired together as an
official simulator or robot integration.

## What Hanson would need to supply or confirm

- supported ROS 2 and simulator releases;
- official capabilities, messages/actions/services, topics, frames, units,
  vocabularies, QoS, limits, and safety states;
- authenticated readiness, liveness, cancellation, disconnect, and takeover
  behavior;
- official request correlation and execution evidence;
- hardware maintenance/charging state and safe activation criteria; and
- a simulator fixture for normal, rejected, interrupted, and rollback paths.

Until those values and evidence exist, the continuity home remains a proposal,
the bridge remains unofficial, and no body control should be enabled.
