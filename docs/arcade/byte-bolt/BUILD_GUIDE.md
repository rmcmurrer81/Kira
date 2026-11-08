# Build Byte & Bolt

## Architecture

Keep index.html, style.css, core.js, scene.js, app.js, dialogue.js, audio-player.js, audio-map.js, audio-bundled-map.js and audio/ together. The game has no remote player dependencies or build step. A static server is preferred for predictable storage; local-file behavior varies by browser.

core.js is pure logic usable in Node and the browser. jobs contains 22 distinct ordered projects. Each declares its learning topic, mentor, location, category, required part and reward. Personal lab upgrades have zero payment. challenge(id, round) supplies instructions, worked examples and explicit test cases; round zero is the campaign. New project lesson.text and lesson.note feed the learning tablet and safety guidance.

## Test the learner’s reasoning

The bounded expression parser accepts bounded return expressions, not arbitrary JavaScript. It uses listed variables and arithmetic/comparison/logical operators. It does not use eval or Function. Unsupported syntax must fail clearly. Use ASCII minus in code examples, not typographic minus characters. Displayed Unicode minus is normalized to ASCII subtraction; broader syntax remains unsupported.

A passing answer must pass the supplied boundary, fault or numeric cases, not just reproduce one example. Numeric output must be finite and have the right type. The LED exercise also asks for the minimum resistance, selected resistor and resulting current. Read the explanatory lesson, inspect a failed case, then revise and retest.

## Mixed contracts and unpaid revisits

nextContract(state) returns {id, round, type}, or null. mixedContracts(state, limit) previews the queue. completeContract(state, answer) submits the current mixed contract. Unseen campaign projects take priority. Once all are complete, repeat selection favors less-practised topics and spaces out recent IDs and topic families. recentJobs and contractQueue preserve continuity in saved state.

The UI routes repeat offers through this queue, including the next button after a completed project. It does not offer a direct same-project paid-repeat button. A completed campaign bench can still be revisited with round zero for unpaid experimentation. Such revisits do not award additional mastery or payment. Positive-round mastery is capped at three stars per project; service payments are limited to the first three repeat rounds of paid jobs. Personal upgrades never pay.

Contracts have finite authored parameter variations, not generated missions or a measured number of play hours. Do not advertise guaranteed hours of content.

## Conversation and access

Every arrival opens friendly conversation first. Mentors explain a current project or say they have no new work, while keeping the board accessible. The clerk always offers Browse parts & prices. Nora, Arthur and Sam rotate informal dialogue. Captions are complete; bundled audio playback is optional and uses no live speech synthesis. The original recordings remain, with stock Sarah narration for newer lines. No private recording uploads are needed.

The scene dispatches town-arrive using yard, lab, store, gardener, walker or neighbor. app.js also exposes townTalk(id). Quest markers derive only from actual available/active work, not idle chats or optional repeats. Normal destination buttons keep jobs accessible without precise walking.

## Save safety and UI

Keep the original storage key. Validate imports before confirmation and preserve earlier credits, inventory, mastery and completed projects during migration. Never recalculate old balances to match revised rewards. Unreadable stored data must not be overwritten automatically. Import and reset both require an explicit in-game confirmation.

Escape closes panels, focus stays in the modal, input drafts survive visiting lessons, and sound stops on panel changes or document hiding. Escape dynamic HTML values. Test runs alone do not change progress; a successful submission does. Hardware notes must explain that these are simplified models, not real-world safety guarantees.

## Release checks

Run the complete Node logic suites, migration and economy tests, queue spacing tests, parser regression tests and scene checks. Then, in a permitted browser environment, verify all 22 projects, the final learning-tablet page, idle and active conversation, shop access, captions and bundled audio interruption, desktop/mobile layouts, reload/import and the no-WebGL path.

Rebuild source ZIPs only after integration and compare their contents with source. Verify actual disconnected local-file play separately. Neither static code inspection nor a passing Node suite proves browser appearance, offline behavior, measured playtime or deployment. Publication remains a separate approved step.
