'use strict';
// All public Kira Labs pages should load the versioned shared Iris launcher.
// Third-party Chakra preview snapshots, the Iris destination itself, redirects,
// and verification files are deliberately outside this assertion.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const docs = path.join(__dirname,'..','docs');
const skip = new Set(['iris.html','kira-world-temporary-creator.html','google7fcdc88e1aeae0b3.html']);
const publicPages = fs.readdirSync(docs).filter(file => file.endsWith('.html') && !skip.has(file)).map(file=>file);
publicPages.push(...fs.readdirSync(path.join(docs,'reports')).filter(f=>f.endsWith('.html')).map(f=>'reports/'+f));
for(const directory of ['business','investors']) publicPages.push(directory+'/index.html');
const version='20261101-iris-float2';
const all = new Set();
for(const page of publicPages){
  assert(!all.has(page),'Duplicate public page: '+page); all.add(page);
  const content = fs.readFileSync(path.join(docs,page),'utf8');
  const srcs=[...content.matchAll(/<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1[^>]*><\/script>/gi)].map(m=>m[2]);
  const shared=srcs.filter(src=>/(?:^|\/)labs\.js(?:\?.*)?$/.test(src));
  assert.equal(shared.length,1,page+': expected exactly one shared website script');
  assert.ok(shared[0].endsWith('labs.js?v='+version),page+': old cached shared JS');
  const expected=page.includes('/')?'../labs.js':'labs.js';
  if(shared[0].startsWith('/'))assert.ok(shared[0]==='/labs.js?v='+version,page+': invalid absolute root asset');
  else assert.equal(shared[0],expected+'?v='+version,page+': incorrect relative asset path');
}
const sharedJs=fs.readFileSync(path.join(docs,'labs.js'),'utf8');
assert.ok(sharedJs.includes('kira-iris-widget'),'Iris launcher not initialized in shared script');
assert.ok(sharedJs.includes('iris.html?embed=1'),'Iris iframe missing');
assert.ok(sharedJs.includes('if (!/\\/iris\\.html$/i.test(location.pathname)'),'Recursive Iris launcher guard missing');
const iris=fs.readFileSync(path.join(docs,'iris.html'),'utf8');
assert.ok(iris.includes('iris-embedded.css?v=20261101.1'),'Iris embed CSS missing');
assert.ok(iris.includes("get('embed')!=='1'"),'Standalone Iris must remain distinct');
assert.ok(fs.existsSync(path.join(docs,'iris-float.css')),'Launcher CSS missing');
assert.ok(fs.existsSync(path.join(docs,'iris-embedded.css')),'Embedded mode CSS missing');
console.log('Sitewide Iris launcher references passed on '+publicPages.length+' public pages.');
