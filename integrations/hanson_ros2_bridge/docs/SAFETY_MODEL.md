# Safety model

## Trust boundary

Kira World is treated as an **untrusted high-level requester** from the perspective of physical execution. A persuasive conversation, confident model output, or remembered preference never grants motor authority.

## Authority model

- Kira World may request a bounded social intention.
- The bridge validates syntax, freshness, ranges, and allowlists.
- The simulator or robot adapter may apply additional context and safety checks.
- The official simulator or robot remains authoritative over execution.
- A rejected or interrupted action is returned to Kira World as evidence.

## Fail-closed conditions

The prototype rejects unknown categories, missing IDs or source identity, confidence outside 0–1, nonpositive or excessive TTL, stale requests, empty or oversized speech, unsupported voice identifiers, excessive duration, unsupported gaze frames, nonfinite or out-of-range gaze coordinates, unsupported expressions or gestures, and intensity or speed outside policy limits.

## Non-goals

This proof of concept does not implement autonomous navigation, joint trajectories, motor torque or velocity commands, unrestricted object manipulation, camera or microphone streaming, biometric identification, hidden background execution, internet access, automatic retries, or medical and emergency behavior.

## Evidence

Every policy decision is written as JSON Lines with timestamp, intention category and ID, sanitized payload, accepted/rejected state, machine-readable reason code, human-readable detail, and executor identity.

A production implementation should add tamper-evident storage, privacy controls, retention policies, and correlation with simulator or robot completion events.
