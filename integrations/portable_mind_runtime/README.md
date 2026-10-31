# Public text-only portable mind preview

This directory is the deliberately small, sanitized review copy of the
portable conversation runtime. It lets a reviewer inspect and run branch-aware
text behavior without receiving any private identity seed, autobiography,
voice data, media, people directory, body asset, unpublished interface, or
private evaluation evidence.

Start with [RUN_THIS_FIRST.md](RUN_THIS_FIRST.md).

## Included

- Two rewritten public profiles: Kira demonstration profile and a fictional
  Synthetic Robert test fixture.
- A deterministic offline backend plus an optional loopback-only Ollama client.
- Process life-loop records, transparent non-clinical appraisal variables,
  and branch-isolated local storage.
- Explicit `/remember` summaries. Nothing becomes persistent continuity merely
  because it appeared in chat.
- A reviewable text-only branch export/import helper.
- A disabled-by-default constructor for bounded, high-level intention
  proposals. It has no network transport or hardware execution code.
- Strict JSON parsing, append-only records, unit tests, a release allowlist,
  and SHA-256 file manifest.

## Excluded by design

- private Kira continuity and personal memory;
- any real-person autobiography or identity reconstruction;
- audio, voice cloning, voice profiles, recordings, or speech synthesis;
- avatars, bodies, models, photos, videos, and direct hardware control;
- private prompts, evaluator cases, conversations, email, credentials, and
  unpublished partner information;
- any claim of official Hanson compatibility or simulator validation.

The private Kira World repository may contain a broader authorized working
set. This public directory is an independently reviewed derivative, not a
mirror and not a substitute for private material.

## Branch and continuity semantics

`profile_id` selects a public conversation profile. `branch_id` identifies one
local line of reviewed state. Two installations with the same starting files
will diverge as soon as their reviewed summaries or local appraisals differ.
They do not automatically remain one instance and are never merged silently.

The transfer helper exports only approved summary records and transparent
appraisal values. Import must target a different branch. A human should review
provenance and conflicts before promoting any imported summary.

## Privacy defaults

Transcripts are not written unless `persist_transcript` is deliberately set to
`true` in a local configuration. Appraisal records contain numbers and loop
metadata, not prompt text. `/remember` is explicit and visible. Local runtime
state defaults to an operating-system user-data or temporary directory outside
this release tree, and the runtime refuses an in-tree data root. The operator
remains responsible for protecting their computer and any summaries they
choose to save.

## Embodiment boundary

`portable_mind.embodiment` can construct one of four semantic proposals—speech,
gaze, expression, or gesture—only when explicitly enabled. It cannot publish,
send, execute, approximate, or translate that proposal into motors, joints,
trajectories, torque, velocity, navigation, or shell commands. The separate
[bounded ROS 2 bridge](../hanson_ros2_bridge/README.md) remains a proposal until
official interfaces and simulator evidence are supplied.

## Verify the public boundary

```bash
PYTHONDONTWRITEBYTECODE=1 PYTHONWARNINGS=error python3 -B -m unittest discover -s tests -v
PYTHONDONTWRITEBYTECODE=1 PYTHONWARNINGS=error python3 -B tools/validate_public_release.py
```

The validator fails on any file outside the exact release allowlist, missing or
changed manifest entries, symlink, binary/media extension, unsafe JSON, invalid
Python syntax, local absolute path, likely credential, or prohibited private
package surface.

## License

The original source and fictional fixtures in this directory are available
under the [MIT License](LICENSE). No permission or license for excluded private
data, voices, third-party identities, or third-party systems is implied.
