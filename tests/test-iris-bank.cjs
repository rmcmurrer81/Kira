'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const kb=JSON.parse(fs.readFileSync(path.join(root,'services/iris-free/knowledge.json'),'utf8'));
assert.equal(kb.coverage.complete,true);assert.equal(kb.coverage.books,29);assert.ok(kb.coverage.topics>=30);
const ids=new Set();for(const r of kb.entries){assert.ok(!ids.has(r.id));ids.add(r.id);assert.ok(r.text.length&&r.text.length<=2200);assert.ok(r.url.startsWith('https://'));assert.ok(!/ClearTrail|CutBrief|Kira Sequence Desk|Production Director|\bCarry On\b/i.test(r.text));}
assert.equal(kb.entries.filter(r=>r.id.startsWith('book:book:')).length,29);
const credits=kb.entries.find(r=>r.id==='topic:entertainment');assert.ok(credits.text.includes('uncredited'));assert.ok(credits.text.includes('not a complete filmography'));
for(const title of ['Blood Tulip','Parks and Recreation','Glee'])assert.ok(kb.entries.some(r=>r.text.includes(title)));
assert.ok(kb.entries.some(r=>r.id==='enhanced:privacy'&&r.text.includes('optional')));
assert.ok(kb.entries.some(r=>r.id==='enhanced:contact'&&r.text.includes('(317) 586-8199')));
assert.ok(kb.entries.some(r=>r.id.startsWith('page-about.html')));
console.log(JSON.stringify({fullBank:'PASS',entries:kb.entries.length,coverage:kb.coverage,sourceVersion:kb.version}));
