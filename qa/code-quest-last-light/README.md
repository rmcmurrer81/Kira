# Code Quest: The Last Light — integrated verification

Integrated from main `5f2818f93e39cb210c9db8f0bb7bb2f9b869345c` and the fourteen-mission adventure. Version: `20261102-integrated1`.

## Reconciliation

The highlighted first edit, explained examples, staged hints, fourteen-mission story and bounded interpreter are retained. The landed no-typing route is available as explained large-button choices for all fourteen missions, with a prominent Continue button and retry after mistakes. One scoped controller narrates using Iris's fixed browser voice priorities; the unchanged shared arcade utility supplies opt-in sound cues only.

The shared voice utility, Firefly Trail game and lesson, existing arcade workflow, and shared-voice/Firefly test functions match landed main. The arcade homepage changes only three Code Quest mission counts. The old test's Code Quest block is adapted to the interpreted fourteen-mission game rather than deleted. Older eight-mission saves remain untouched; credit for the four matching opening concepts can transfer before the new lessons.

## Passed locally

- `node tests/test-code-quest-browser.cjs`: actual Windows Edge, 294 assertions. All fourteen typed solutions and fourteen no-typing UI solutions complete; all twenty-eight distractors execute but fail their objectives in real workers. Opening token selection/typing, the Begin here shortcut, staged hints, explanations, retry/reset/previous/continue/reload/finale/restart, legacy/current/malformed/unavailable storage, animation skip/cancellation, voice opt-in/mute persistence, 390/320 touch layouts and reduced motion pass. Twelve hostile or over-limit worker programs are rejected. No page errors or external request attempts. Menu/Contact computed contrast: 12.46:1.
- `node tests/test-code-quest-interpreter.cjs`: 95 programs, including 29 host escapes. The old inherited-fetch deletion issue is reproduced with a harmless spy, then rejected by the new actual worker source. Input, tokens, nesting, steps, loops, calls, strings, numbers, lists and actions are bounded; VM dynamic code generation is disabled in the actual-worker tests.
- `node tests/test-code-quest-voice.cjs`: exact Iris voice-priority parity and 0.96/1/1 speech settings, no autoplay, replay/mute, chunks, late voices, cancellation and unavailable speech.
- `node tests/test-arcade-voice-animation.cjs`: all fourteen missions, forty-two choices, actual runtime retries/Continue/opt-in narration/celebration and all sixteen preserved Firefly paths.
- Existing `test-arcade.cjs`, `test-iris-oct22-knowledge.cjs`, `test-sitewide-iris.cjs`, `test-iris-soft-voice.cjs`, `test-public-google-voice-contact-20261027.cjs` and `python scripts/check_rejected_public_media.py` pass. The hash-pinned Iris JSON initially failed because Windows checked it out with CRLF; the test passed against the exact unchanged Git blob's LF bytes. No Iris source/knowledge changes are included.
- JavaScript syntax checks and `git diff --check`.
- Native Edge speech probe: zero autoplay; actual Voice on produced native start, mute produced expected interruption, and short replay produced start/end with local Microsoft Zira at rate 0.96, pitch 1 and volume 1. See `native-speech-probe-result.json`. This does not establish audible speaker output.

Desktop/mobile, river and ending screenshots were visually inspected. Browser QA used the already-installed Playwright core and Edge, with no local dependency installation.

## Teaching interpreter boundary

Learner text is tokenized, parsed and interpreted as a small JavaScript subset. It is never passed to eval, Function, imports or the browser JavaScript engine. Names resolve only in interpreter-owned maps, with no member-access grammar or host-global lookup. Supported world actions are say, charge, move, turn, openGate and collect. A disposable worker and a page watchdog add responsiveness guards.

Limits include 6,000 input characters, 2,000 tokens, 1,400 AST nodes, depth 40, 10,000 execution steps, 1,000 loop iterations and 64 world actions, with additional string/list/numeric bounds. This is not a general-purpose JavaScript sandbox. Optional narration may use the browser vendor's speech network service.

## Limits

Physical iOS/Android devices and audible speaker listening were not tested. CI and exact deployed-source verification are performed separately after the tested commit is published; local screenshots alone are not deployment evidence.
