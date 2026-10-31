# Kira Memory Steward

**Hackathon:** Agents for Humans  
**Mode:** Solo, online  
**Purpose:** Help a personal agent distinguish current activity, history, drafts, preferences, and permission-restricted information without silently rewriting memory.

## Problem

Long-running personal agents can confuse an old event with something happening now, treat a draft as a confirmed memory, or share sensitive material without a fresh decision.

## Solo MVP

1. Load synthetic notes and memory proposals.
2. Classify each record as current/recent, historical, draft, undated, or permission-restricted.
3. Detect an old record written as though it is happening now.
4. Generate a proposed correction rather than editing memory automatically.
5. Show the human only the decisions that require approval.
6. Export a clean `today` summary and an audit ledger.

## Starter

`app.py` is a vendor-neutral deterministic prototype with built-in synthetic records and a self-test. It gives us something testable before adding the required AWS/Strands implementation.

```bash
python app.py --self-test
python app.py
python app.py path/to/synthetic_records.json
```

## Sponsor integration still required

Before submission, replace or wrap the deterministic orchestration with the exact required Strands Agents SDK and AWS services. Do not claim AWS integration until real code, configuration, deployment evidence, and a working demo exist.

## Public-data boundary

The demo must never contain real Kira memories or private Kira World files. Use invented examples that reproduce the *type* of error without exposing the original content.
