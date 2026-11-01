# Extension exercise: two or more characters taking turns

**Separate text-first code exercise with three optional finished dialogue recordings. This exercise does not modify the original live story game.** Download the [practice ZIP](https://kiralabs.org/tutorials/story-game/conversation-practice/practice.zip), extract it, then open `index.html` locally. Original Mira and Sol dialogue: both fictional roles use Robert’s explicitly approved synthetic voice. The supplied WAVs are finished dialogue, not private voice references or a new voice identity. The exercise also shows how replacement recordings can be organized into separate folders. Distinct folder names do not create distinct voices; use different permitted voices if you want distinct speakers.

## Open and try text first
Keep `index.html` and `conversation.js` together, then open `index.html` in a modern browser. No installation or API key is needed. Next line changes the speaker and subtitle without sound. Restart text returns to the first line. Replay current line tries one recording. Play remaining lines requests an ordered sequence. Stop audio cancels playback without changing the subtitle. On first load, nothing plays.

Three finished WAVs are supplied in the paths below. Download and extract the complete ZIP to preserve these folders. Replay or sequence will report missing audio if a file is absent, keep the current text and stop; use Next to keep reading. Keep the original folder structure, or replace the clips with your own permitted recordings of the exact lines:

```text
audio/
  mira/
    01-ready.wav
    03-carefully.wav
  sol/
    02-neighbors.wav
```

The filename must refer to an actual playable WAV. Record yourself or use a voice you have permission to distribute. Never share private reference packs. Listen to every recording; check pronunciation and that it matches its subtitle. This example does not generate voices or prove that any particular local voice tool works.

## Step 1: separate character information from lines

```js
const CHARACTERS = {
  mira: {name:'Mira', voiceFolder:'audio/mira/'},
  sol: {name:'Sol', voiceFolder:'audio/sol/'}
};
```

The short key is an internal ID. `name` is the visible name, and `voiceFolder` is where that character's permitted finished recordings live. Changing a folder does not synthesize a new voice.

## Step 2: order the conversation

```js
const DIALOGUE = [
  {speaker:'mira', text:'The lantern is ready. What should we do next?', file:'01-ready.wav'},
  {speaker:'sol', text:'Let us bring it to the neighbors.', file:'02-neighbors.wav'},
  {speaker:'mira', text:'Good idea. I will carry it carefully.', file:'03-carefully.wav'}
];
```

Arrays preserve order. `lineIndex` starts at zero: the first item. Each line names its speaker, subtitle and recording filename. `describeLine` combines the character folder and filename. For Sol it becomes `audio/sol/02-neighbors.wav`. `showLine` uses `textContent` to display the name and subtitle, not interpret them as HTML.

## Step 3: make Next independent of audio
`nextLine()` calls `stopPlayback()`, advances the index if another line exists, then displays text. It never starts sound. This makes the exercise useful even without recordings and gives viewers manual control. Native buttons support click/tap, Tab and Enter; this is not a complete accessibility qualification.

## Step 4: wait for the correct event

```js
// This promise means playback STARTED, not finished:
await clip.play();

// This event means the recording ended naturally:
clip.addEventListener('ended', ended);
```

The excerpt contrasts two signals; it is not the complete sequential player. In the runnable code, `playOne(token)` creates a promise resolved by `ended`, `error` or cancellation. `playRemaining()` awaits that promise, checks its result, and advances only after a successful natural end. If a file is missing or the browser rejects playback, the subtitle remains and the sequence stops. It does not silently skip lines or pretend they were heard.

## Step 5: cancel old work
`generation` is a counter, not a timer. Next, Stop, Replay, Restart and a new sequence invalidate the older request. `stopPlayback()` also settles the old waiting promise as cancelled and pauses/resets its clip. This avoids a player waiting forever after Stop. Event listeners are removed after settling. A stale `ended` event or late play result cannot advance the new conversation or overwrite its status.

## Step 6: add a third character
Add one map entry and one line; the player does not need a new character-specific function:

```js
// Add inside CHARACTERS, with the required separating comma:
lee: {name:'Lee', voiceFolder:'audio/lee/'}

// Add an item inside DIALOGUE:
{speaker:'lee', text:'I can help carry the supplies.', file:'04-supplies.wav'}
```

Record the exact line into `audio/lee/04-supplies.wav` using a permitted voice. Choose where the line belongs in the array. The new speaker ID must match exactly. Three characters need not mean three different voices: choose voices intentionally and honestly, with permission.

## Test before presenting it as working
- Next: Mira → Sol → Mira, text only.
- Replay: one line, then stop.
- Sequence: do not advance just because play() resolved; wait for ended.
- Press Next/Stop while playing: old audio stops and stale callbacks do nothing.
- Remove a recording or block playback: explain the fallback and keep text usable.
- Add Lee: name and relative file path resolve correctly.
- Check real playback, device volume, mobile layout and assistive tools yourself.

Run `node test.cjs` if Node is already installed. Fifteen tests passed using mock DOM/audio objects, covering ordering, mapping, a third character, cancellation and failure cases. The mock tests do not establish actual browser playback. Finished audio verification and browser checks must be recorded separately. Volume starts at 0.8; this is not a guarantee about device loudness.

Playback semantics reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
