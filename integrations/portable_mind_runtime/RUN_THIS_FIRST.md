# Run this first

This path exercises only the sanitized public, text-only runtime. It does not
load a private seed, voice, avatar, body, unpublished interface, or external
account.

From the repository root on Windows:

```powershell
cd integrations\portable_mind_runtime
$env:PYTHONDONTWRITEBYTECODE = '1'
$env:PYTHONWARNINGS = 'error'
$kiraPublicRunData = Join-Path ([IO.Path]::GetTempPath()) ('kira-portable-mind-run-first-' + [guid]::NewGuid().ToString('N'))
py -B -m unittest discover -s tests -v
py -B tools\validate_public_release.py
py -B -m portable_mind --data-dir $kiraPublicRunData --profile kira --once "What are you in this repository?"
py -B -m portable_mind --data-dir $kiraPublicRunData --profile synthetic_robert --branch run_first_variant --once "How would separate installations diverge?"
py -B tools\validate_public_release.py
```

On Linux or macOS:

```bash
cd integrations/portable_mind_runtime
export PYTHONDONTWRITEBYTECODE=1
export PYTHONWARNINGS=error
kira_public_run_data="$(mktemp -d "${TMPDIR:-/tmp}/kira-portable-mind-run-first.XXXXXX")"
python3 -B -m unittest discover -s tests -v
python3 -B tools/validate_public_release.py
python3 -B -m portable_mind --data-dir "$kira_public_run_data" --profile kira --once "What are you in this repository?"
python3 -B -m portable_mind --data-dir "$kira_public_run_data" --profile synthetic_robert --branch run_first_variant --once "How would separate installations diverge?"
python3 -B tools/validate_public_release.py
```

The second validator run proves the documented test-and-smoke order left no
Python cache or runtime state in the release tree. The unique smoke directory
may be removed after review. The runtime has no third-party Python dependency.
The two one-turn examples use the deterministic offline stub, so they do not
make a network request.

For an interactive offline review, run either text-only launcher or:

```bash
PYTHONDONTWRITEBYTECODE=1 PYTHONWARNINGS=error python3 -B -m portable_mind --data-dir "${XDG_STATE_HOME:-$HOME/.local/state}/kira-portable-mind/public-runtime" --profile kira
```

The only persistent continuity is a summary explicitly entered with
`/remember TEXT`. Transcripts are off by default. The documented commands and
launchers keep local state outside the release tree, and the runtime refuses an
in-tree data directory.

## Optional local model

If Ollama is already running on the same computer, select a locally installed
model explicitly:

```bash
PYTHONDONTWRITEBYTECODE=1 PYTHONWARNINGS=error python3 -B -m portable_mind --data-dir "${XDG_STATE_HOME:-$HOME/.local/state}/kira-portable-mind/public-runtime" --backend ollama --model YOUR_LOCAL_MODEL --profile kira
```

The client accepts only a loopback endpoint. The repository does not download
a model, call a hosted service, or include a model response as release proof.

## Passing result means

- the public unit tests pass;
- the exact release allowlist, hashes, JSON, Python syntax, and deny rules pass;
- the stub demonstrates the documented profile and status boundaries.

It does **not** mean the private Kira or Robert material was tested, that a
model is intelligent or conscious, or that Hanson simulation or hardware is
connected or approved.
