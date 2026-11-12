#!/usr/bin/env sh
set -eu
export PYTHONDONTWRITEBYTECODE=1
export PYTHONWARNINGS=error
KIRA_PUBLIC_DATA="${XDG_STATE_HOME:-${HOME:?HOME must be set}/.local/state}/kira-portable-mind/public-runtime"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR/.."
exec python3 -B -m portable_mind --config config.example.json --data-dir "$KIRA_PUBLIC_DATA" --profile kira
