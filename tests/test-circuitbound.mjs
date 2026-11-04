import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../docs/arcade/circuitbound');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(folder, 'story.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(folder, 'engine.js'), 'utf8'), context);
const E = context.Circuitbound;
const scenes = E.scenes;
const ids = new Set(scenes.map(scene => scene.id));
let checks = 0;
function check(value, description) { assert.ok(value, description); checks++; }
function action(state, type, extra = {}) {
  return E.act(state, { sceneId: state.sceneId, revision: state.revision, type, ...extra });
}
function solve(state) {
  const scene = E.getScene(state);
  return action(state, 'submit', { value: scene.code ? scene.code.solution : scene.solution });
}
function go(state, index = 0) { return action(state, 'choice', {index}).state; }
function complete(state) {
  const result = solve(state);
  check(result.ok && result.state.solved, 'correct solution should solve ' + state.sceneId);
  return action(result.state, 'continue').state;
}
check(ids.size === scenes.length, 'unique scene identifiers');
check(scenes.length >= 30, 'at least thirty story scenes');
for (const scene of scenes) {
  check(['choice','code','psu','sensor'].includes(scene.kind), scene.id + ': supported kind');
  check(Boolean(scene.title && scene.location && scene.objective && scene.text && scene.visual), scene.id + ': complete UI fields');
  check(scene.text.split(/\s+/).length <= 100, scene.id + ': compact narrative');
  if (scene.kind === 'choice') {
    check(scene.choices.length <= 4, scene.id + ': at most four path controls');
    for (const choice of scene.choices) {
      check(ids.has(choice.to), scene.id + ': valid target');
      for (const route of choice.routes || []) check(ids.has(route.to), scene.id + ': valid conditional target');
    }
    check(Boolean(scene.choices.length || scene.ending), scene.id + ': choices or ending');
  } else {
    check(ids.has(scene.next), scene.id + ': puzzle next scene exists');
    if (scene.kind === 'code') {
      check(E.validateCode(scene.id, scene.code.solution), scene.id + ': canonical answer accepted');
      check(!E.validateCode(scene.id, scene.code.starter), scene.id + ': unfinished starter rejected');
      check(E.validateCode(scene.id, '// a learner comment\n' + scene.code.solution.replace(/"/g, "'") + '\n/* complete */'), scene.id + ': quotes and comments accepted');
      check(!E.validateCode(scene.id, scene.code.solution + '\nalert("escaped");'), scene.id + ': extra execution rejected');
      check(!E.validateCode(scene.id, ''), scene.id + ': blank rejected');
    } else check(scene.options.some(option => option.id === scene.solution), scene.id + ': option matches solution');
  }
}

let initial = E.createState();
const initialJSON = E.serialize(initial);
let gate = go(initial);
check(initialJSON === E.serialize(initial), 'act does not mutate its input');
check(gate.sceneId === 'gateCode', 'clear first mission leads straight to gate puzzle');
check(!action(gate, 'continue').ok, 'Continue before solving rejected');
check(!action(gate, 'choice', {index: 0}).ok, 'story action cannot bypass puzzle');
let wrong = action(gate, 'submit', {value: 'const rune = "night"; openDoor(rune);'});
check(!wrong.ok && !wrong.state.solved && wrong.state.sceneId === gate.sceneId, 'wrong code stays at puzzle');
check(wrong.state.light === 2 && wrong.state.attempts.gateCode === 1, 'first error records one light cost');
wrong = action(wrong.state, 'submit', {value: ''});
check(wrong.state.light === 2 && wrong.state.attempts.gateCode === 2, 'retries do not keep reducing light');
const hint = action(wrong.state, 'hint');
check(hint.feedback.kind === 'hint' && hint.state.light === 2, 'hint is free');
let solved = solve(hint.state);
check(solved.ok && solved.state.sceneId === 'gateCode' && solved.state.solved, 'correct answer waits for Continue');
check(solved.feedback.kind === 'success' && solved.feedback.text.length > 30, 'solution explains the concept');
check(!solve(solved.state).ok, 'duplicate submit rejected after success');
let breach = action(solved.state, 'continue').state;
check(breach.sceneId === 'breach', 'Continue advances solved puzzle');
check(!E.act(breach, {sceneId:'gateCode',revision:gate.revision,type:'continue'}).ok, 'stale scene click rejected');
check(!E.act(breach, {sceneId:'breach',revision:0,type:'choice',index:0}).ok, 'stale revision rejected');
check(!action(breach,'choice',{index:-1}).ok && !action(breach,'choice',{index:99}).ok, 'invalid choices rejected');
check(!action(breach,'choice',{index:'0'}).ok, 'string indexes rejected');
check(E.restore(E.serialize(solved.state)).state.solved, 'reload preserves solved feedback and Continue');
check(E.restore(E.serialize(wrong.state)).state.attempts.gateCode === 2, 'reload preserves wrong-answer attempts');
check(!E.restore('{broken').ok, 'broken JSON safely restarts');
check(!E.restore('{"version":0}').ok, 'old state schema safely restarts');
for (const [field, value] of [['sceneId','missing'],['sceneId','constructor'],['sceneId','__proto__'],['light',999],['solved',1],['revision',-1],['flags',{unknown:true}],['completed',['arrival']],['visited',[]],['feedback',{kind:'weird',text:'x'}]]) {
  const modified = JSON.parse(initialJSON); modified[field] = value;
  check(!E.validateState(modified), 'corrupt ' + field + ' rejected');
}

for (const scene of scenes.filter(scene => scene.kind !== 'choice')) {
  const state = E.createState(); state.sceneId = scene.id; state.visited.push(scene.id);
  check(E.validateState(state), scene.id + ': fixture valid');
  let result = action(state, 'submit', {value: scene.kind === 'code' ? 'invalid!' : 'not-an-option'});
  check(!result.ok && result.state.sceneId === scene.id, scene.id + ': wrong answer never advances');
  for (let i=0; i<5; i++) result = action(result.state, 'submit', {value:''});
  check(result.state.light === 2, scene.id + ': repeated mistakes cost only one light');
  result = solve(result.state);
  check(result.ok && result.state.solved, scene.id + ': retry can recover');
  check(action(result.state, 'continue').state.sceneId === scene.next, scene.id + ': Continue reaches next scene');
}

const wrongPrograms = [
  ['rune','const rune = "dawn"; openDoor("rune");'],
  ['rune','const rune = "Dawn"; openDoor(rune);'],
  ['rune','const Rune = "dawn"; openDoor(Rune);'],
  ['rune','const rune = "dawn"; // openDoor(rune);'],
  ['rune','const rune = "dawn//"; openDoor(rune);'],
  ['rune','const rune = "dawn"; openDoor(rune); /* unfinished'],
  ['water','const waterHigh = false; if (waterHigh) { openSluice(); }'],
  ['array','const order = [3, 2, 1]; sendSignal(order);'],
  ['loop','for (let i = 0; i <= 3; i++) { placeSegment(); }'],
  ['loop','for (let i = 1; i < 3; i++) { placeSegment(); }'],
  ['servo','const angle = "90"; setServo(angle);'],
  ['servo','const angle = 190; setServo(angle);'],
  ['and','const authorized = true; const powerReady = true; if (authorized || powerReady) { raiseWard(); }'],
  ['and','const authorized = true; const powerReady = false; if (authorized && powerReady) { raiseWard(); }']
];
for (const [id,code] of wrongPrograms) check(!E.validateCode(id,code), id + ': common wrong program rejected');
check(!E.validateCode('missing',''), 'unknown validator rejected');
check(!E.validateCode('constructor',''), 'inherited object properties are not validators');
check(!E.validateCode('rune',{}), 'non-text code rejected');
check(!E.validateCode('rune','x'.repeat(4001)), 'oversized code rejected');
check(!E.act(undefined,{}).ok && E.act(undefined,{}).state.sceneId==='arrival', 'undefined state safely restarts');
check(!E.act(null,{}).ok && E.act(null,{}).state.sceneId==='arrival', 'null state safely restarts');

// Exhaustively follow every branch. The story graph is deliberately acyclic.
const visited = new Set();
const edges = new Set();
const endings = new Map();
let journeys = 0;
function explore(state, trail = []) {
  const scene = E.getScene(state);
  check(!trail.includes(scene.id), 'no narrative cycle or trap: ' + scene.id);
  check(E.validateState(state), 'valid state throughout ' + scene.id);
  visited.add(scene.id);
  if (scene.ending) {
    journeys++;
    endings.set(scene.id, (endings.get(scene.id) || 0) + 1);
    check(!action(state,'choice',{index:0}).ok, 'ending does not accept hidden choice');
    check(!action(state,'continue').ok, 'ending does not continue silently');
    return;
  }
  if (scene.kind !== 'choice') {
    const next = complete(state);
    edges.add(scene.id + '>' + next.sceneId);
    explore(next, [...trail,scene.id]);
  } else for (let i=0;i<scene.choices.length;i++) {
    const next = go(state,i);
    edges.add(scene.id + ':' + i + '>' + next.sceneId);
    explore(next,[...trail,scene.id]);
  }
}
explore(E.createState());
check(visited.size === scenes.length, 'every scene reachable through actual engine actions');
check(endings.size === 4, 'all four endings reachable');
check(scenes.filter(s=>s.ending==='good').length === 2, 'two good endings');
check(scenes.filter(s=>s.ending==='dark').length === 2, 'two dark endings');
for (const scene of scenes.filter(scene=>scene.kind==='choice' && !scene.ending)) {
  scene.choices.forEach((_,i)=>check([...edges].some(edge=>edge.startsWith(scene.id+':'+i+'>')), scene.id + ': every choice exercised'));
}

function councilState(flags) {
  const state=E.createState();state.sceneId='council';state.visited.push('council');state.flags=flags;return state;
}
check(go(councilState({rescued:true,truth:true}),0).sceneId==='endingDawn','rescue + truth + intact heart yields full restoration');
check(go(councilState({truth:true}),0).sceneId==='endingEmbers','missing rescue changes restoration ending');
check(go(councilState({rescued:true}),0).sceneId==='endingEmbers','missing truth changes restoration ending');
check(go(councilState({rescued:true,truth:true,cracked:true}),0).sceneId==='endingEmbers','broken heart cannot be instantly repaired');
check(go(councilState({rescued:true,truth:true}),1).sceneId==='endingEmbers','evacuation remains a valid choice');
const emptyLight=councilState({rescued:true,truth:true}); emptyLight.light=0;
check(go(emptyLight,0).sceneId==='endingDawn','beginner mistakes cannot force a dark ending');
check(E.serialize(E.createState())===initialJSON,'restart makes clean independent initial state');

const report = { engineChecks:checks, scenes:scenes.length, puzzles:scenes.filter(s=>s.kind!=='choice').length, completeJourneys:journeys, endings:Object.fromEntries(endings), uniqueEdges:edges.size, passed:true, scope:'Node pure-engine and exhaustive story-path checks only; no browser, layout or audio verification.' };
console.log(JSON.stringify(report,null,2));
if (process.argv.includes('--report')) fs.writeFileSync(path.join(folder,'logic-test-report.json'), JSON.stringify(report,null,2)+'\n');
