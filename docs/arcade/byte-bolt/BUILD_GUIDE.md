# How the Byte & Bolt campaign is built

This guide explains the actual included eight-project source. It is not a promise that the full eventual game, Jetson projects, or hardware simulations are implemented.

## 1. Keep the first version small and runnable

The game uses ordinary HTML, CSS and JavaScript. There are no remote scripts, build step, engine installation or package dependencies for players. Keep `index.html`, `style.css`, `core.js`, `scene.js`, `app.js`, `audio-map.js` and `audio/` together. Serve the folder as static files for predictable browser storage. File-mode behavior depends on the browser.

`index.html` loads the rules first, then the scene, sound map and user interface. It contains the world canvas, navigation buttons, job objective, dialog container and save controls.

## 2. Separate rules from presentation

`core.js` is pure game logic. It can run in the browser or Node tests. `fresh()` creates the save. `buy()` checks a shelf, ownership and credit balance. `complete()` checks the required job and part, evaluates the learner’s answer, then records completion. Paid town jobs receive a one-time service payment; personal lab upgrades never pay credits.

The main job data lives in `jobs`. Each entry declares an ID, title, learning topic, character, place, required part, category, service payment and exercise kind. The category is service or personal. The LED, solar-monitor divider and lab fan are personal upgrades with zero cash reward; the robot, rangefinder, community greenhouse, delivery-route and gate projects are paid town services. Seven jobs use code expressions. The LED job uses three numeric/circuit inputs instead of a choice-only quiz.

`questStatus()` derives the next available/active job and each mentor/store marker from saved progression. `accept()` records the active campaign job. The marker disappears when a mentor’s current project ends and reappears if that mentor offers a different project later. For example, Iris offers robot repair, Evelyn helps with your LED upgrade, then Iris returns with echo calibration. Optional practice does not advertise a new quest. A mentor without current work gives a brief explanation and points to the next project rather than silently opening a generic board. The interface exposes `window.townQuestState` plus a non-enumerable `townState.npcJobs` getter for the scene.

Unlocks follow the ordered completed-project list. Town-service income is sufficient for every required part without practice grinding. Shopping always costs credits; improving your own lab is an expense, not paid work.

The fresh-game balance after each action is: start 20 → buy sensor 5 → robot payment 50 → buy LED 40 → LED upgrade 40 → echo payment 70 → buy pump 45 → greenhouse payment 85 → buy divider 65 → divider upgrade 65 → buy fan 40 → fan upgrade 40 → buy battery monitor 20 → battery-service payment 65 → buy gate kit 30 → gate payment 95. Every step is covered by an exact cash-flow test.

## 3. Evaluate a safe expression, not arbitrary JavaScript

The editor accepts a function body such as:

```javascript
return distanceCm === undefined || distanceCm < 20;
```

`compile()` first requires `return`, then tokenizes a bounded input. Its recursive-descent parser implements parentheses, unary operators, multiplication/division, addition/subtraction, comparisons, equality, AND and OR in their normal precedence order. Only the job’s listed variable names are allowed.

The parser builds small trusted functions over supplied inputs; it does not execute learner text through `eval` or `Function`. Source length, token count and nesting are limited. A result must match the expected type: numeric 1 is not boolean true. Non-finite numeric outputs cannot pass numeric lessons.

This is an expression-learning subset. Do not label it a complete JavaScript interpreter. To add another construct, design its parser, evaluator, bounds and adversarial tests first.

## 4. Teach through tests and changing contracts

`challenge(jobId, round)` builds an explicit contract. Round zero is the campaign job. Positive rounds are practice. The user sees the thresholds and assumptions before entering an answer.

For conditions, include missing inputs, both boolean states, values just below and above a threshold, and the threshold itself. The gate exercises the combinations of four inputs. The fan also runs a temperature sequence, feeding the learner’s previous output into the next step so remembered-state bugs become visible.

For numerical exercises, vary the inputs instead of accepting one memorized number. The LED lesson requires the minimum resistance, the smallest offered resistor meeting the target, and the calculated resulting current. Its tolerance supports rounded answers to two decimal places.

The first three successful practice completions for each project award a mastery star. Personal-upgrade practice awards no money. For the five paid town jobs, the first three repeat service contracts also pay eight credits each; later service practice is unpaid. The UI names these differently so an unpaid exercise is not advertised as paid work. `complete()` checks the exact next round, so double clicks or submitting a stale contract cannot pay twice. Variants repeat eventually; they are not AI-generated missions. The bounded history stores up to 100,000 practice completions per job. `nextPracticeRound()` returns null at that limit, disabling new-contract buttons while leaving the bench available.

## 5. Make progress visible in the town

`scene.js` draws faceted buildings, pitched roofs, rounded vegetation and articulated characters as real 3D triangles. A larger 40×40 town uses a following camera and adjustable zoom. A WebGL depth buffer handles overlapping geometry. A fallback projects the same scene onto a 2D canvas. The town uses accessible destination buttons as an alternative to walking. The expanded save bounds allow positions up to ±20 on both ground axes.

The scene reads the completed-job IDs:

- Robot repair starts the delivery robot moving.
- The LED lights the lab windows and bench.
- Echo calibration adds a probe terminal and rangefinder markers.
- Greenhouse logic restores crops and the drip line.
- Voltage division powers the solar-roof appearance and monitor.
- Hysteresis adds a moving cooling-fan illustration.
- Battery planning adds charge markers beside the delivery lane.
- The final gate opens and a town-engineer marker appears.

These effects communicate accomplishment. They are not mechanical or electrical simulations.

## 6. Keep the UI reversible

`app.js` owns modal panels, captions, input drafts, test results and navigation. Test runs do not award progress; submission does. A passed submission disables itself and provides a next-step button. Closing a panel clears movement and stops sound. Escape dismisses the panel; Tab is trapped inside it. The project board works on desktop or mobile without precision walking.

The earned input probe lets the learner provide a number, boolean or undefined to investigate an expression. Probe outputs do not replace the full test suite.

Use text escaping for dynamic values placed into markup. Do not insert learner expressions or imported text as HTML.

## 7. Preserve old saves

Keep the original storage key `kira-town-prototype-v1` even though the schema is now version 2. `validate()` checks old and new inputs. A valid old save becomes an ordered completed-job list with empty practice counters while retaining credits, parts, position and accepted status. Do not recalculate balances or claw back money earned under an older reward model. An old two-job save with 65 credits keeps all 65; its remaining revised path ends at 120. A fresh path ends at 95. Version-2 balances and already-earned mastery history are preserved too.

Validation rejects unknown item IDs, duplicate inventory, impossible completion ordering, missing required parts, malformed counters, unsafe credit balances and invalid positions. The returned data is cloned. A failed load protects the original stored text from automatic overwriting. Export, import confirmation, reset confirmation and reload should all be tested.

## 8. Be honest about voices and hardware

The sound map contains the original prototype recordings. Use only the matching original captions with them; do not attach an old recording to new dialogue. Expanded dialogue uses full text captions with an optional installed local system voice. The earlier two-job ending is no longer triggered. Stop speech on panel changes, close, hidden document and page exit.

All hardware lessons are low-voltage educational models. Explain supply/input compatibility, external drivers, tolerances, invalid readings and reserve margins. Never present a small exercise as a certified robot, pump, gate, battery or cooling controller.

## 9. Test before publishing

Run the Node suites for all jobs, wrong solutions, altered practice parameters, duplicate submissions, parser attacks, legacy migration, malformed saves and overflow atomicity. The campaign suite checks 48 practice rounds per project, exact fresh/migrated cash flow at every step, mastery-only personal practice, preserved old balances, and an NPC marker disappearing and returning with a distinct later job.

The browser suite in `tests/test-browser.cjs` covers the eight-job UI journey, desktop/mobile layouts, no-WebGL fallback, interrupted drafts, earned probes, repeated submission, migration/import confirmation, reset cancellation and unreadable-save protection. It takes screenshots when a supported local Chromium test environment is available. A browser startup restriction is a blocker, not a passed UI test.

Before publishing, also check source-download contents, links, sound interruption, the deployed asset versions and a fresh browser origin. Do not claim a live deployment from a successful local test alone.
