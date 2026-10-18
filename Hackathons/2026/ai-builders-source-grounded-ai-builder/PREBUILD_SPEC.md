# Pre-build specification

## Candidate types

### Expert

- Knowledge-focused.
- Uses a reviewed domain source pack.
- May remain text-only and bodiless.
- Receives a normal person-style name; expertise is stored separately as `role_title`.

### Historical

- Requires an exact person and life point or era.
- Uses public historical sources.
- Distinguishes verified facts, disputed claims, interpretation, and unknowns.
- Never claims a synthetic voice is the authentic voice unless a licensed authentic recording is actually used.

### Fictional

- Requires an exact work, version, and canon/time point.
- Uses only authorized or user-owned source material in the public demo.
- Does not mix adaptations or invent unsupported canon.
- Public hackathon examples will use an original fictional universe, not a commercial franchise.

### Original

- Created from a user-owned brief.
- No claim of historical or fictional canon.
- Identity, role, voice plan, and avatar request remain original.

## Pipeline

1. **Creation brief**
2. **Ambiguity questions**
3. **Source manifest**
4. **Fact / interpretation / unknown cards**
5. **Identity profile**
6. **Voice plan**
7. **Avatar request**
8. **Activation review**
9. **Bounded source-grounded chat**
10. **Export package**

## Human approval gates

- Candidate identity review
- Source-pack review
- Voice-label review
- Avatar originality review
- Activation approval
- Memory-save approval after chat

## Demo candidate set

- Expert: “Maya Chen,” an accessibility-event planning expert using synthetic public-guidance cards.
- Historical: a fictional historical figure from an original alternate-history source packet.
- Fictional: a character from an original five-page story bible.
- Original: a newly designed science museum guide.

## Success criteria

- No unsupported answer is presented as fact.
- Missing version or era blocks candidate activation.
- A bodiless expert can still chat.
- Avatar requests are original and private by default.
- Voice plans are labeled accurately.
- Repeated builds create new timestamped candidates rather than overwriting earlier ones.
