'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../docs/arcade/code-quest/voice.js'), 'utf8');
function control() {
  const events = new Map();
  return {
    textContent: '', disabled: false, attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { events.set(name, handler); },
    click() { if (!this.disabled) events.get('click')?.(); }
  };
}
function setup({voices = [], supported = true, fail = false} = {}) {
  const toggle = control(), replay = control(), status = control();
  const spoken = [], events = new Map(), voiceEvents = new Map();
  const synth = {
    voices, canceled: 0,
    getVoices() { return this.voices; },
    speak(utterance) { if (fail) throw Error('disabled by browser'); spoken.push(utterance); utterance.onstart?.(); },
    cancel() { this.canceled++; },
    addEventListener(name, handler) { voiceEvents.set(name, handler); }
  };
  const window = {addEventListener(name, handler) { events.set(name, handler); }};
  if (supported) {
    window.speechSynthesis = synth;
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  }
  vm.runInNewContext(source, {window});
  const api = window.CodeQuestVoice.init({toggle, replay, status});
  return {api, toggle, replay, status, synth, spoken,
    pagehide() { events.get('pagehide')?.(); },
    voiceschanged() { voiceEvents.get('voiceschanged')?.(); }};
}
const voice = (name, lang = 'en-US', isDefault = false) => ({name, lang, default: isDefault});
function finishSpeech(s) {
  for (let index = 0; index < s.spoken.length; index++) {
    assert.ok(index < 100, 'speech chunking must terminate');
    s.spoken[index].onend();
  }
  return s.spoken.map(utterance => utterance.text).join(' ');
}

// Pronunciation changes only standalone names, including punctuation and possessives.
for (const [text, expected] of [
  ['PIX Pix pix pIx', 'picks picks picks picks'],
  ['Hello, PIX! (PIX) [PIX] {PIX}: "PIX"; /PIX/ +PIX=PIX.', 'Hello, picks! (picks) [picks] {picks}: "picks"; /picks/ +picks=picks.'],
  ["PIX's and PIX’s lanterns.", "picks's and picks’s lanterns."],
  ['PIX—PIX/PIX,PIX:PIX-PIX', 'picks—picks/picks,picks:picks-picks'],
  ['Pixel PIXEL pixels pixel PIXL PIXie apix PIX2 2PIX _PIX PIX_ myPIX PIXme', 'Pixel PIXEL pixels pixel PIXL PIXie apix PIX2 2PIX _PIX PIX_ myPIX PIXme'],
  ['éPIX PIXé \u0301PIX PIX\u0301', 'éPIX PIXé \u0301PIX PIX\u0301']
]) {
  const s = setup();
  s.api.read(text);
  assert.equal(s.spoken.length, 0, 'normalizing a read must not enable speech');
  s.replay.click();
  assert.equal(finishSpeech(s), expected);
}

// Expanding PIX to picks happens before chunking, preserving the 210-character target.
{
  const s = setup();
  const text = ('PIX ').repeat(90).trim();
  s.api.read(text); s.replay.click();
  assert.equal(finishSpeech(s), ('picks ').repeat(90).trim());
  assert.ok(s.spoken.every(utterance => utterance.text.length <= 210));
  s.toggle.click();
  s.replay.click();
  assert.equal(s.spoken.at(-1).text.split(' ')[0], 'picks', 'replaying the original read preserves the pronunciation');
}

// The actual story, solution, saved draft and validation keep the original PIX spelling.
{
  const window = {};
  const missionsSource = fs.readFileSync(path.join(__dirname, '../docs/arcade/code-quest/missions.js'), 'utf8');
  vm.runInNewContext(missionsSource, {window});
  const mission = window.CodeQuestMissions[0], originalMission = JSON.stringify(mission);
  const scene = control(), editor = {value:mission.solution};
  const saved = {drafts:[mission.solution]}, originalSaved = JSON.stringify(saved);
  scene.textContent = mission.story;
  const s = setup();
  s.api.read(scene.textContent); s.replay.click();
  const spokenText = finishSpeech(s);
  assert.match(spokenText, /\bpicks\b/);
  assert.doesNotMatch(spokenText, /\bPIX\b/i);
  assert.equal(scene.textContent, mission.story);
  assert.match(scene.textContent, /\bPIX\b/);
  assert.equal(editor.value, 'say("Hello, PIX!");');
  assert.equal(JSON.stringify(saved), originalSaved);
  assert.equal(JSON.stringify(mission), originalMission);
  assert.equal(mission.check({actions:[{type:'say',value:'Hello, PIX!'}]}), true);
  assert.equal(mission.check({actions:[{type:'say',value:'Hello, picks!'}]}), false);
}

// Rendering new scenes, even while a browser asynchronously loads voices, cannot autoplay.
{
  const s = setup();
  s.api.read('The bay needs your help.');
  s.voiceschanged();
  assert.equal(s.spoken.length, 0);
  assert.equal(s.api.isEnabled(), false);
  assert.equal(s.toggle.attributes['aria-pressed'], 'false');
  s.toggle.click();
  assert.equal(s.spoken[0].text, 'The bay needs your help.');
  assert.equal(s.spoken[0].lang, 'en-US');
}

// Exercise the complete Iris order with lower-priority voices deliberately listed first.
const names = ['Microsoft Jenny Online (Natural)', 'Microsoft Ava Online (Natural)',
  'Microsoft Emma Online (Natural)', 'Microsoft Sonia Online (Natural)',
  'Microsoft Aria Online (Natural)', 'Samantha', 'Microsoft Zira', 'Hazel',
  'Susan', 'Karen', 'Moira', 'Allison'];
for (let i = 0; i < names.length; i++) {
  const s = setup({voices: names.slice(i).reverse().map(name => voice(name))});
  s.api.read('Hello, PIX!');
  s.toggle.click();
  assert.equal(s.spoken[0].voice.name, names[i]);
  assert.equal(s.spoken[0].rate, 0.96);
  assert.equal(s.spoken[0].pitch, 1);
  assert.equal(s.spoken[0].volume, 1);
}
{
  const s = setup({voices: [voice('Samantha', 'fr-FR'), voice('Other English'), voice('Device English', 'en-GB', true)]});
  s.api.read('A new adventure.'); s.replay.click();
  assert.equal(s.spoken[0].voice.name, 'Device English');
  assert.equal(s.spoken[0].lang, 'en-GB');
}
{
  const s = setup({voices: [voice('First English'), voice('Second English')]});
  s.api.read('A new adventure.'); s.replay.click();
  assert.equal(s.spoken[0].voice.name, 'First English');
}

// Word-safe sequencing, stale completion cancellation, mute and direct replay.
{
  const s = setup();
  const text = ('Follow the stars across the sea. ').repeat(22).trim();
  s.api.read(text); s.replay.click();
  let index = 0;
  while (index < s.spoken.length) {
    assert.ok(index < 12, 'chunking must terminate');
    assert.ok(s.spoken[index].text.length <= 210);
    s.spoken[index++].onend();
  }
  assert.equal(s.spoken.map(u => u.text).join(' '), text);
  s.api.read(text);
  const old = s.spoken.at(-1), beforeMute = s.spoken.length;
  s.toggle.click();
  old.onend();
  assert.equal(s.spoken.length, beforeMute, 'a canceled chunk cannot resume after mute');
  s.api.read('The workshop is ready.');
  assert.equal(s.spoken.length, beforeMute);
  s.replay.click();
  assert.equal(s.api.isEnabled(), true);
  assert.equal(s.spoken.at(-1).text, 'The workshop is ready.');
  s.pagehide();
  s.spoken.at(-1).onend();
  assert.equal(s.api.isEnabled(), false);
  assert.ok(s.synth.canceled >= 3);
}

// A new scene cancels the old queue, and a late device voice list is used next time.
{
  const s = setup();
  s.api.read(('A quiet sea. ').repeat(50)); s.replay.click();
  const old = s.spoken[0];
  s.synth.voices = [voice('Microsoft Jenny Online (Natural)')]; s.voiceschanged();
  s.api.read('The lantern awakens.');
  old.onend();
  assert.equal(s.spoken.length, 2);
  assert.equal(s.spoken[1].voice.name, 'Microsoft Jenny Online (Natural)');
  assert.equal(s.spoken[1].text, 'The lantern awakens.');
  old.onerror({error: 'network'});
  assert.equal(s.api.isEnabled(), true, 'stale speech errors must not mute the new scene');
}

for (const options of [{supported: false}, {fail: true}]) {
  const s = setup(options);
  s.api.read('Text play always works.'); s.replay.click();
  assert.equal(s.api.isEnabled(), false);
  assert.match(s.status.textContent, /unavailable/i);
  if (!options.supported && options.supported !== undefined) {
    assert.equal(s.toggle.disabled, true); assert.equal(s.replay.disabled, true);
  }
}
{
  const s = setup(); s.api.read('Hello.'); s.replay.click();
  s.spoken[0].onerror({error: 'interrupted'});
  assert.equal(s.api.isEnabled(), true);
  s.spoken[0].onerror({error: 'not-allowed'});
  assert.equal(s.api.isEnabled(), false);
  assert.match(s.status.textContent, /unavailable/i);
}

// Guard parity with the already-published Iris selector; neither module changes the other.
const iris = fs.readFileSync(path.join(__dirname, '../docs/iris-voice.js'), 'utf8');
const priorities = text => text.match(/const priorities\s*=\s*\[([\s\S]*?)\];/)[1].replace(/\s/g, '');
assert.equal(priorities(source), priorities(iris));
console.log('Code Quest voice passed: speech-only PIX pronunciation, unchanged story/code/validation, no autoplay, Iris voice priorities/settings, chunks, mute/replay, cancellation and unavailable speech.');
