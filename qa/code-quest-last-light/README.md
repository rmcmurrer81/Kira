# Code Quest: The Last Light — verification

This revision contains fourteen connected beginner missions at `/arcade/code-quest/`, version `20261102-adventure1`. It teaches strings, variables, movement, order, arithmetic, conditions, else, loops, arrays, iteration, functions and parameters. The first three missions support a guided single edit. Help reveals a conceptual nudge, an exact change, and then a working example. Applying an example does not complete a mission; the player still runs it and sees its effect.

## Passed locally

- `node tests/test-code-quest-interpreter.cjs`: 95 programs, including 29 host-escape probes. The original inherited-fetch deletion issue is first reproduced with a harmless spy, then rejected by the actual new worker source. Tests disable dynamic code generation in the worker VM and cover input, syntax depth, steps, loops, calls, strings, numbers, arrays and action limits.
- `node tests/test-code-quest-voice.cjs`: fixed voice preference parity with the published Iris module, rate 0.96, pitch 1, volume 1, word-safe chunks, no autoplay, mute/replay, cancellation, late voices and unavailable speech. These are mocked speech API tests.
- `node tests/test-code-quest-browser.cjs`: actual Windows Edge, 136 assertions, all fourteen mission solutions through real workers and animated UI, opening wrong answer/guided token selection/typing, hints/example, reset/retry/previous/continue/reload, final ending/restart, malformed and unavailable storage, 390/320 touch layouts, reduced motion, final-action animation skip and stale animation cancellation. Twelve hostile or over-limit programs were rejected by actual workers. All external requests were intercepted; none were attempted. No page errors occurred.
- Native Edge speech probe: zero autoplay calls; the real opt-in toggle started speech, mute produced an expected interruption, and a short replay produced native start/end. The Iris preference selected local Microsoft Zira at 0.96/1/1. See `native-speech-probe-result.json`. Speaker audibility was not established.
- `node tests/test-arcade.cjs`: existing independent arcade/tutorial integrity.
- `python scripts/check_rejected_public_media.py`: approved public imagery check.
- `node tests/test-public-google-voice-contact-20261027.cjs`: existing site contact-number check.
- JavaScript syntax checks and `git diff --check`.

`desktop.png`, `mobile.png`, `river.png`, and `ending.png` are browser captures from the local revision. Desktop/mobile, the river composition, and the ending were visually inspected. Browser testing used the already-installed Playwright core and Edge; no local dependencies were installed.

## Security boundary

Learner text is tokenized, parsed and interpreted as a small teaching subset; it is never passed to eval, Function, imports, or the browser JavaScript engine. Names resolve only in interpreter-owned maps. There is no property-access grammar or host-global lookup. Supported actions are say, charge, move, turn, openGate and collect. A disposable worker and page watchdog add responsiveness guards. This is not a general-purpose JavaScript sandbox.

The current hard limits are 6,000 input characters, 2,000 tokens, 1,400 AST nodes, nesting/call depth 40, 10,000 execution steps, 1,000 loop iterations, and 64 world actions. Additional string, numeric and list bounds are checked. Optional browser narration may use the browser vendor's network speech service; no offline narration claim is made.

## Remaining verification

Headless browser screenshots and speech API tests do not establish audible speaker playback or physical iOS/Android behavior. CI, publication to main, and the deployed live version must be verified separately after the concurrent Code Quest branch is reconciled. The other active branch's shared arcade voice module and Firefly Trail tutorial edits remain intact on that branch; this isolated implementation does not modify them.
