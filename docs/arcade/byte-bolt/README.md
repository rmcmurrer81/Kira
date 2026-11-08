# Byte & Bolt: learning-town campaign

A dependency-free browser game with 22 distinct beginner programming and electronics projects, 14 paid town jobs, 8 unpaid personal lab upgrades, an explorable 3D town and local saves. This is an expanding campaign, not an unlimited world. The repeat parameter combinations are finite. No measured-hours or guaranteed-playtime claim is made.

## Play

Open index.html in a modern browser, preferably through a local static server. Keep the source files and audio folder together. Use WASD/arrows and E, touch controls, destination buttons, or the project board. All projects can be opened without precision walking.

Talk to Iris, Evelyn and the shop clerk even when they have no new job. Nora, Arthur and Sam also have friendly conversation. Repeated chats rotate lines, and mentors mention relevant progress. Conversations offer direct project, board and shop buttons. Idle conversation never creates a new-job marker.

The mixed contract board prioritizes unseen campaign projects. After the campaign it selects spaced repeat topics, avoiding recent projects and the previous topic family where alternatives exist. The first three repeat rounds per project earn mastery stars (66 total); paid service projects also pay 8 credits on those rounds. Personal upgrades never pay credits. Further repeats are unpaid. Direct completed-bench revisits are clearly unpaid and do not advance mastery. Purchases use game credits only.

## The 22 projects

1. Robot safety: Comparisons · missing readings (paid town work).
2. LED circuit: Ohm’s law · current limiting (personal upgrade).
3. Echo calibration: Units · arithmetic · round-trip time (paid town work).
4. Greenhouse pump: Boolean logic · dry-run protection (paid town work).
5. Voltage divider: Resistor ratios · input limits (personal upgrade).
6. Lab cooling: State · hysteresis · boundaries (personal upgrade).
7. Battery runtime: Watts · watt-hours · ideal models (paid town work).
8. Town gate: Integration · interlocks · fault tests (paid town work).
9. Tare calibration: Tare calibration (paid town work).
10. PWM duty cycle: PWM duty cycle (personal upgrade).
11. Inventory shortfall: Inventory shortfall (paid town work).
12. Encoder kinematics: Encoder kinematics (paid town work).
13. Parallel resistance: Parallel resistance (personal upgrade).
14. Packet integrity: Packet integrity (paid town work).
15. Kinetic stopping model: Kinetic stopping model (paid town work).
16. Weighted filtering: Weighted filtering (personal upgrade).
17. Cost accounting: Cost accounting (paid town work).
18. Modular elapsed time: Modular elapsed time (paid town work).
19. ADC quantization: ADC quantization (personal upgrade).
20. Time intervals: Time intervals (paid town work).
21. Resistive power loss: Resistive power loss (paid town work).
22. Majority voting: Majority voting (personal upgrade).

## Saves and audio

The original storage key kira-town-prototype-v1 is retained. Valid earlier two-job and eight-project saves migrate without clawing back earned credits, completed work or mastery. Export/import JSON backups in Save & sound. Unreadable data is protected from automatic overwrite until explicit import or reset. Saves are local to the browser/origin, not synchronized between devices.

The original audio recordings remain; they are designed prototype voices, not recovered Robert, Iris or Evelyn identities. New dialogue has complete captions and prerecorded Kokoro Sarah narration. This stock synthetic voice is not a clone or reconstruction of the original game characters. Audio files are built ahead of time, so playback needs no GPU, speech model, installed system voice or cloud voice request. Read-aloud is opt-in, its setting survives reload, and Save & sound includes a Test voice button. Audio stops when the panel changes or the document is hidden. Scene rendering also pauses behind a dialogue or map to reduce laptop work.

## Boundaries

The editor supports one bounded expression beginning with return: listed variables, numeric/boolean values, undefined, arithmetic, comparisons, logical operators and parentheses. It does not support loops, assignments, arrays, objects, function calls or full JavaScript. The parser also normalizes displayed Unicode minus to ASCII subtraction. Code examples use ASCII operator characters.

Town effects illustrate progress, not physical electronics. All hardware lessons are simplified low-voltage educational models, not safety-certified controllers. There is no motor-physics simulation, Jetson project, account, real purchase, multiplayer or cloud save.

## Files and checks

core.js holds lessons, challenge cases, progression, economy, mixed contracts and save validation. app.js handles dialogue, boards, benches, the learning tablet and save controls. scene.js handles movement, rendering and resident interactions. BUILD_GUIDE.md and learn.html explain the source.

Run the Node logic and scene suites from this folder using node --test tests/test-original.cjs tests/test-campaign.cjs tests/test-scene.cjs tests/test-audio.cjs. Browser test scripts require a permitted browser environment; do not treat their presence as a passing test. See RELEASE_QA.md for release limits. Actual disconnected local-file play and long-duration playtime are not verified for this revision.
