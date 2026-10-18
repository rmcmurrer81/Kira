# Proposed data contracts

These are planning schemas, not implementation files.

## `creation_brief`

```json
{
  "candidate_type": "expert | historical | fictional | original",
  "subject": "string",
  "version_or_era": "string or null",
  "role_title": "string",
  "body_mode": "none | simple_original_avatar | future_avatar",
  "voice_mode": "text_only | original_synthetic | labeled_approximation"
}
```

## `source_card`

```json
{
  "source_id": "string",
  "source_label": "string",
  "source_url": "https://... or null",
  "claim": "string",
  "claim_type": "fact | interpretation | unknown",
  "reviewed": true
}
```

## `candidate_package`

```json
{
  "candidate_id": "timestamped-id",
  "display_name": "Maya Chen",
  "role_title": "Accessibility event planning expert",
  "identity_status": "draft | reviewed | approved",
  "source_manifest_sha256": "hex",
  "unresolved_questions": [],
  "voice_plan": {},
  "avatar_request": {},
  "activation_allowed": false
}
```

## `chat_turn`

```json
{
  "candidate_id": "string",
  "question": "string",
  "answer": "string",
  "supporting_source_ids": [],
  "unknown": false,
  "memory_save_proposed": false
}
```
