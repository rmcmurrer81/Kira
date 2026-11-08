#!/usr/bin/env python3
"""Rebuild and verify the playable Byte & Bolt source ZIP from tracked game files."""
from pathlib import Path
import zipfile
ROOT=Path(__file__).resolve().parents[1];GAME=ROOT/'docs/arcade/byte-bolt';OUT=GAME/'Byte-and-Bolt-Prototype.zip'
files=[p for p in GAME.rglob('*') if p.is_file() and p.suffix.lower() not in ['.zip','.png'] and '.git' not in p.parts]
with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
    for p in sorted(files):archive.write(p,p.relative_to(GAME))
with zipfile.ZipFile(OUT) as archive:
    assert archive.testzip() is None
    for p in files:assert archive.read(str(p.relative_to(GAME)))==p.read_bytes(),p
print(f'Verified {len(files)} packaged files; {OUT.stat().st_size:,} bytes.')
