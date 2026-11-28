# Kira AccessLine

**Hackathon:** CALL-E — Your Code Is Calling  
**Mode:** Solo, online  
**Purpose:** Ask venues short, consent-aware accessibility questions that are often missing from websites.

## User flow

1. The user enters a venue, public phone number, event date, and selected questions.
2. The application shows the exact disclosure and call plan.
3. The user explicitly approves one call.
4. The automated agent identifies itself and asks whether the recipient is willing to answer.
5. It stops immediately if the recipient declines.
6. It returns a structured report with `yes`, `no`, or `unknown` rather than inventing an answer.

## Starter

`app.py` validates and previews a call plan and parses a simulated transcript. It intentionally cannot dial a phone.

```bash
python app.py --self-test
python app.py
```

## CALL-E integration still required

The final version must use CALL-E's supported SDK, API, MCP, CLI, or skill path and must make at least one real, truthful demonstration call. Do not claim that a call occurred until the integration and evidence exist.

## Guardrails

- Always identify the caller as automated.
- Never impersonate Robert.
- Never book, purchase, or change a reservation.
- Never keep talking after a refusal.
- Do not retain audio unless the applicable consent and legal requirements are satisfied.
