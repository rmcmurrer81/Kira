'use strict';
// Run from any directory: node tests/test-kiralabs-redesign.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const docs=path.resolve(__dirname,'../docs');
const read=n=>fs.readFileSync(path.join(docs,n),'utf8');
const sandbox={window:{}};
vm.runInNewContext(read('labs-data.js'),sandbox,{timeout:1000});
const data=sandbox.window.KIRA_LABS_TIMELINE;
assert.equal(data.milestones.length,29);
assert.equal(new Set(data.milestones.map(m=>m.id)).size,29);
assert.equal(data.projects.length,7);
for(const m of data.milestones){
 assert(data.projects.includes(m.project),m.id+' project');
 assert(data.statuses[m.status],m.id+' status');
 assert(m.sources.length&&m.boundary&&m.date_basis,m.id+' evidence');
 if(m.status==='future')assert.equal(m.date,null,m.id+' future date');
 for(const s of m.sources)assert(/^https:\/\//.test(s.url),m.id+' public source');
}
for(const id of ['home-now','continuity-prototype','continuity-now','body-now','notebook-next','vr-next','servers-next','robotics-next'])assert(data.milestones.some(m=>m.id===id));
const pages=['index.html','kira-world.html','shiftbrief.html','projects.html','about.html','progress.html','support.html','contact.html','knowledge.html','privacy.html'];
for(const name of pages){
 const text=read(name),ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,name+' duplicate IDs');
 assert.equal((text.match(/<h1(?:>|\s)/g)||[]).length,1,name+' H1');
 assert(text.includes('href="#main"')&&text.includes('<main id="main">'),name+' skip link');
 for(const m of text.matchAll(/(?:src|href)="([^"#?]+)(?:[^\"]*)"/g)){
  const target=m[1];
  if(/^[a-z]+:|^\/\//i.test(target))continue;
  assert(fs.existsSync(path.join(docs,target)),name+' missing '+target);
 }
}
const contact=read('contact.html');
assert(/id="prepare-email" disabled/.test(contact));
assert(contact.indexOf('id="direct-contact"')<contact.indexOf('id="iris-heading"'));
assert(contact.includes('email-draft helper'));
assert(read('labs.js').includes('Nothing has been sent'));
assert(read('iris.js').includes('not Sarah inside ShiftBrief'));
assert(!/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB)\s*[.(]/.test(read('iris.js')));
assert.equal((read('progress.html').match(/<article id=/g)||[]).length,29);
console.log('PASS: ten pages, 29 sourced milestones, preserved anchors/assets, direct-contact order and static Iris boundaries.');
