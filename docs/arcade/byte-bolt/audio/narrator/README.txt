Bundled Sarah narration, November 2026

These static speech clips use Kokoro v1.0's stock af_sarah voice, rendered locally at build time with kokoro-onnx 0.6.1. This is a general synthetic narrator, not a clone or recreation of Iris, Evelyn, Robert, or another person's private voice. The existing twelve designed character WAV recordings are preserved separately and used only when their full transcript matches.

Only MP3 files are played on the user's device. No model, GPU inference, installed browser voice, cloud speech service, account, or private reference recording is used. Complete exact captions and spoken-text normalization are recorded in manifest.json. The 318 files are reusable sentence clips, not 318 separate performances. The browser downloads only the dialogue being played.

Format: mono MP3, 24 kHz, 64 kbps, normalized to -19 LUFS with a -2 dB true-peak ceiling. Technical identifiers are expanded where practical; captions remain the source of exact spelling. Long-term human pronunciation review is not claimed.

Engine/package source and license (MIT): https://github.com/thewh1teagle/kokoro-onnx
Model source/model card (Apache 2.0): https://huggingface.co/hexgrad/Kokoro-82M
Public ONNX conversion and voice pack: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0

The website repository includes scripts/build_byte_bolt_audio.py. Build dependencies and model binaries are not shipped to players. Runtime telemetry is disabled before ONNX Runtime imports during generation. The model/voice-file hashes and exact generation settings are included in manifest.json. Included MIT and Apache notices are for provenance and attribution, not a claim of endorsement or exclusive ownership of stock voices.
