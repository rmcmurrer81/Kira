# Kira Project Truthkeeper

**Hackathon:** All Things Agentic  
**Mode:** Solo, online  
**Purpose:** Keep a long-running AI project understandable when old handoffs, failed tests, and newer owner decisions appear to contradict each other.

## Problem

Large AI projects accumulate old checkpoints that remain valuable evidence but are no longer current authority. A fluent agent can accidentally follow the wrong document and resurrect a rejected model, feature, or body attempt.

## Solo MVP

1. Load a synthetic set of status claims.
2. Group claims by subject.
3. Detect conflicting values.
4. Apply a transparent authority order.
5. Produce a compact current-truth registry.
6. Preserve every rejected or superseded claim as history.
7. Ask for human approval before writing any proposed documentation change.

## Starter

`app.py` is a deterministic prototype with synthetic claims and a self-test.

```bash
python app.py --self-test
python app.py
```

## Google implementation still required

The final event version must use the exact required Gemini and Google Cloud agent framework/services. This starter is only the explicit truth-selection core and must not be described as a completed Google Cloud integration.
