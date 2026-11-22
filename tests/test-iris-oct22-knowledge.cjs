'use strict';
/* Regression for Iris' public Oct 22 note extension. Run: node tests/test-iris-oct22-knowledge.cjs */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const docs=path.join(__dirname,'../docs');
const filename='knowledge/iris-projects-2026-11-22-1.json';
const priorNov111=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-11-1.json'),'utf8'));
const raw=fs.readFileSync(path.join(docs,filename),'utf8');
const data=JSON.parse(raw);
const loader=fs.readFileSync(path.join(docs,'iris.js'),'utf8');
const moduleCode=fs.readFileSync(path.join(docs,'iris-projects.js'),'utf8');
const irisPage=fs.readFileSync(path.join(docs,'iris.html'),'utf8');
assert.ok(loader.includes("PROJECT_NOTES='"+filename+"'"));
const expected=loader.match(/const PROJECT_SHA256='([a-f0-9]{64})'/)?.[1];
assert.ok(expected,'Iris integrity hash must be pinned');
assert.equal(createHash('sha256').update(raw).digest('hex'),expected,'Iris public pack SHA-256 mismatch');
assert.ok(irisPage.includes('iris.js?v=2026-11-22.1'));
assert.ok(irisPage.includes('iris-projects.js?v=2026-11-22.1'));
const iris=require('../docs/iris-projects.js');
// Nov22 matched selector result and retained immutable Nov21.5.
const prev215=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-21-5.json'),'utf8'));
assert.equal(iris.validate(prev215),prev215);
assert.equal(prev215.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-typed-rank-review-2026-11-21');
const latest22=data.projects.find(p=>p.id==='newbrain');assert.equal(latest22.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const value of ['4/112','12/112','19/112','2/112','15/112','16/112','128/160','109/160','3,456','256','32','2/12'])assert.ok(latest22.status.includes(value),'Nov22 metric '+value);
for(const [file,id] of [['newbrain.html','newbrain-matched-selector-review-2026-11-22'],['updates.html','newbrain-matched-selector-review-2026-11-22'],['reports/newbrain-matched-selector-review-2026-11-22.html','reviewed-scope'],['reports/newbrain-matched-selector-review-2026-11-22.html','matched-results'],['reports/newbrain-matched-selector-review-2026-11-22.html','abstention'],['reports/newbrain-matched-selector-review-2026-11-22.html','qualification']])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+id+'"'),'Missing Nov22 anchor '+file+'#'+id);
for(const file of ['labs-data.js','progress-data.json'])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('"id": "newbrain-matched-selector-review-2026-11-22"'));
assert.ok(iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain selector result?','',[],null)?.answer.includes('109/160'));
// New isolated-selector calibration, typed engineering scope and immutable older pack.
const priorNov213=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-21-3.json'),'utf8'));
assert.equal(iris.validate(priorNov213),priorNov213);
assert.equal(priorNov213.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-ranked-copy-review-2026-11-21');
const previousNov214=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-21-4.json'),'utf8'));
assert.equal(iris.validate(previousNov214),previousNov214);
assert.equal(previousNov214.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-factorized-qualification-2026-11-21');
const latestTyped=data.projects.find(p=>p.id==='newbrain');
assert.equal(latestTyped.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const n of ['3/224','1/224','155/160','158/160','11/624','4/624','90/96','92/96','0/288','2/12'])assert.ok(latestTyped.status.includes(n),'New synthetic selector metric missing '+n);
for(const [file,id] of [['newbrain.html','newbrain-typed-rank-review-2026-11-21'],['updates.html','newbrain-typed-rank-review-2026-11-21'],['reports/newbrain-typed-rank-review-2026-11-21.html','reviewed-scope'],['reports/newbrain-typed-rank-review-2026-11-21.html','fresh-successor'],['reports/newbrain-typed-rank-review-2026-11-21.html','rank-rejection'],['reports/newbrain-typed-rank-review-2026-11-21.html','source-only'],['reports/newbrain-typed-rank-review-2026-11-21.html','qualification']])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+id+'"'),'Missing new report anchor '+file+'#'+id);
for(const file of ['labs-data.js','progress-data.json'])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('"id": "newbrain-typed-rank-review-2026-11-21"'));
const newAnswer=iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain selector result?','',[],null);
assert.ok(newAnswer?.answer.includes('3/224')&&newAnswer.answer.includes('11/624')&&newAnswer.answer.includes('2/12'),'New Iris answer does not report latest results');
const factorized=data.projects.find(p=>p.id==='newbrain');
assert.equal(factorized.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const n of ['2/224','39/224','158/160','98/160','10/224','89/224','0/64','2/64','4/64','256','2,048','2/12'])assert.ok(factorized.status.includes(n),'Missing selector metric '+n);
assert.ok(factorized.technical.includes('16/16')&&factorized.technical.includes('10/10')&&factorized.technical.includes('UNTRAINED'));
for(const [file,id] of [['newbrain.html','newbrain-factorized-qualification-2026-11-21'],['updates.html','newbrain-factorized-qualification-2026-11-21'],['reports/newbrain-factorized-selector-review-2026-11-21.html','reviewed-scope'],['reports/newbrain-factorized-selector-review-2026-11-21.html','calibration'],['reports/newbrain-factorized-selector-review-2026-11-21.html','source-ranking'],['reports/newbrain-factorized-selector-review-2026-11-21.html','typed-loss'],['reports/newbrain-factorized-selector-review-2026-11-21.html','qualification']])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+id+'"'),'Missing new source anchor '+file+'#'+id);
for(const file of ['labs-data.js','progress-data.json'])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('"id": "newbrain-factorized-qualification-2026-11-21"'));
const selectorAnswer=iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain selector result?','',[],null);
assert.ok(selectorAnswer?.answer.includes('39/224')&&selectorAnswer.answer.includes('98/160')&&selectorAnswer.answer.includes('2/12'));

assert.equal(iris.validate(data),data,'Iris schema validation should succeed');
assert.equal(data.reviewed_on,'2026-11-22');
assert.equal(data.content_version,'2026-11-22.1');
// New November 21 ranked trial, lexical diagnostic and source-copy preflight.
const priorNov212=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-21-2.json'),'utf8'));
assert.equal(iris.validate(priorNov212),priorNov212,'Preserve previous immutable Nov21.2 pack');
const ranked=data.projects.find(p=>p.id==='newbrain');
assert.equal(ranked.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const q of ['0/128','21/32','32/32','28/32','65/80','49/80','52/80','4/384','1/384','0/192','3/3','627/627','12/12','2/12'])assert.ok(ranked.status.includes(q),'Missing ranked/lexical metric '+q);
for(const [p,a] of [['newbrain.html','newbrain-ranked-copy-review-2026-11-21'],['updates.html','newbrain-ranked-copy-review-2026-11-21'],['reports/newbrain-ranked-copy-review-2026-11-21.html','reviewed-scope'],['reports/newbrain-ranked-copy-review-2026-11-21.html','ranked-results'],['reports/newbrain-ranked-copy-review-2026-11-21.html','lexical-transfer'],['reports/newbrain-ranked-copy-review-2026-11-21.html','copy-prototype'],['reports/newbrain-ranked-copy-review-2026-11-21.html','qualification']])assert.ok(fs.readFileSync(path.join(docs,p),'utf8').includes('id="'+a+'"'),'Missing anchor '+p+'#'+a);
for(const p of ['labs-data.js','progress-data.json'])assert.ok(fs.readFileSync(path.join(docs,p),'utf8').includes('"id": "newbrain-ranked-copy-review-2026-11-21"'));
const latestRanking=iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain training result?','',[],null);
assert.ok(latestRanking?.answer.includes('0/128')&&latestRanking.answer.includes('4/384')&&latestRanking.answer.includes('2/12'),'Latest ranked failure not answered');
// November 21 inference-only diagnostic is new; the earlier November 21 pack stays immutable.
const priorNov211=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-21-1.json'),'utf8'));
assert.equal(iris.validate(priorNov211),priorNov211);
assert.equal(priorNov211.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-inverse-render-review-2026-11-21');
const binding=data.projects.find(p=>p.id==='newbrain');
assert.equal(binding.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const s of ['23/48','20/48','5/48','4/48','2/32','1/64','2/128','4/128','65/80','62/80','2/12'])assert.ok(binding.status.includes(s),'Binding diagnostic missing '+s);
for(const [f,id] of [['newbrain.html','newbrain-binding-diagnostics-2026-11-21'],['updates.html','newbrain-binding-diagnostics-2026-11-21'],['reports/newbrain-binding-diagnostics-review-2026-11-21.html','reviewed-scope'],['reports/newbrain-binding-diagnostics-review-2026-11-21.html','measured-results'],['reports/newbrain-binding-diagnostics-review-2026-11-21.html','qualification']])assert.ok(fs.readFileSync(path.join(docs,f),'utf8').includes('id="'+id+'"'),'Binding source anchor '+f+'#'+id);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='newbrain-binding-diagnostics-2026-11-21'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-binding-diagnostics-2026-11-21"'));
// New completed negative inverse review; earlier public pack is immutable.
const priorNov191=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-19-1.json'),'utf8'));
assert.equal(iris.validate(priorNov191),priorNov191);
assert.equal(priorNov191.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-position-diversity-review-2026-11-19');
const inverse=data.projects.find(p=>p.id==='newbrain');
assert.equal(inverse.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const v of ['22,800','24,848','2,048','4,096','63/64','64/64','36/64','9/64','24/64','14/64','16/48','28/48','65/80','2,304','384','Original12','2/12'])assert.ok(inverse.status.includes(v),'Latest result missing '+v);
assert.ok(inverse.limits.includes('all ten strict gates'));
for(const [page,fragment] of [['newbrain.html','newbrain-inverse-render-review-2026-11-21'],['updates.html','newbrain-inverse-render-review-2026-11-21'],['reports/newbrain-inverse-render-review-2026-11-21.html','reviewed-scope'],['reports/newbrain-inverse-render-review-2026-11-21.html','paired-results'],['reports/newbrain-inverse-render-review-2026-11-21.html','qualification'],['reports/newbrain-inverse-render-review-2026-11-21.html','boundaries']])assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+fragment+'"'),'Source anchor '+page+'#'+fragment);
for(const page of ['labs-data.js','progress-data.json'])assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('newbrain-inverse-render-review-2026-11-21'));
const inverseAnswer=iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain training result?','',[],null);
assert.ok(inverseAnswer?.answer.includes('14/64')&&inverseAnswer.answer.includes('24/64')&&inverseAnswer.answer.includes('2/12'),'Iris latest failed experiment answer');
// Nov 19 negative position trial and separate unrun inverse-render preparation.
const previousPack186=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-18-6.json'),'utf8'));
assert.equal(iris.validate(previousPack186),previousPack186);
assert.equal(previousPack186.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-query-context-review-2026-11-18');
const latestPosition=priorNov191.projects.find(p=>p.id==='newbrain');
assert.equal(latestPosition.source,'newbrain.html#newbrain-position-diversity-review-2026-11-19');
for(const val of ['20,752','22,800','2,048','26/48','29/48','69/128','78/128','49/64','54/64','368','12,288','384','UNRUN','Original12','2/12'])assert.ok(latestPosition.status.includes(val),'Nov19 evidence missing '+val);
assert.match(latestPosition.limits,/failed its ≥4-pair gain/);
for(const [f,id] of [['newbrain.html','newbrain-position-diversity-review-2026-11-19'],['updates.html','newbrain-position-diversity-review-2026-11-19'],['reports/newbrain-position-diversity-review-2026-11-19.html','reviewed-scope'],['reports/newbrain-position-diversity-review-2026-11-19.html','paired-results'],['reports/newbrain-position-diversity-review-2026-11-19.html','qualification'],['reports/newbrain-position-diversity-review-2026-11-19.html','next-study']])assert.ok(fs.readFileSync(path.join(docs,f),'utf8').includes('id="'+id+'"'),'Nov19 anchor missing '+f+'#'+id);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='newbrain-position-diversity-review-2026-11-19'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-position-diversity-review-2026-11-19"'));
const positionReply=iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain training result?','',[],null);
assert.ok(positionReply?.answer.includes('26/48')&&positionReply.answer.includes('29/48')&&positionReply.answer.includes('2/12'),'Iris must answer newest trial');
// Nov18.6 previous controlled query-curriculum evidence, historic packs immutable.
const priorNov185=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-18-5.json'),'utf8'));
assert.equal(iris.validate(priorNov185),priorNov185);
assert.equal(priorNov185.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-focal-objective-review-2026-11-18');
const latestQuery=data.projects.find(p=>p.id==='newbrain');
assert.equal(latestQuery.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const z of ['18,704','20,752','2,048','19/32','13/32','14/16','8/16','8/32','29/32','5/16','seven of eight','112','35','147','Original12','2/12'])assert.ok(latestQuery.status.includes(z),'Missing latest query result '+z);
assert.match(latestQuery.limits,/seven of eight strict families failed/i);
for(const [f,a] of [['newbrain.html','newbrain-query-context-review-2026-11-18'],['updates.html','newbrain-query-context-review-2026-11-18'],['reports/newbrain-query-context-review-2026-11-18.html','reviewed-scope'],['reports/newbrain-query-context-review-2026-11-18.html','paired-results'],['reports/newbrain-query-context-review-2026-11-18.html','qualification'],['reports/newbrain-query-context-review-2026-11-18.html','source-access']])assert.ok(fs.readFileSync(path.join(docs,f),'utf8').includes('id="'+a+'"'),'Missing Nov18.6 anchor '+f+'#'+a);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='newbrain-query-context-review-2026-11-18'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-query-context-review-2026-11-18"'));
const newestResponse=iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain training result?','',[],null);
assert.ok(newestResponse?.answer.includes('19/32')&&newestResponse.answer.includes('seven of eight'),'Iris latest query evidence unavailable');
// November 18.5 completed matched small-model focal trial, with failed qualification.
const priorNov184=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-18-4.json'),'utf8'));
assert.equal(iris.validate(priorNov184),priorNov184,'Keep Nov 18.4 JSON immutable and valid');
assert.equal(priorNov184.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-fact-order-diagnostic-2026-11-18');
const latestFocal=data.projects.find(p=>p.id==='newbrain');
assert.equal(latestFocal.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const x of ['2,048','4,096','16,656','18,704','78/128','73/128','54/128','20/32','22/32','9/24','11/24','two of seven','320','619,283','Original12','2/12'])assert.ok(latestFocal.status.includes(x),'Missing latest paired result '+x);
assert.match(latestFocal.limits,/two of seven/i);
for(const [file,anchor] of [['newbrain.html','newbrain-focal-objective-review-2026-11-18'],['updates.html','newbrain-focal-objective-review-2026-11-18'],['reports/newbrain-paired-focal-study-2026-11-18.html','reviewed-scope'],['reports/newbrain-paired-focal-study-2026-11-18.html','paired-results'],['reports/newbrain-paired-focal-study-2026-11-18.html','qualification']])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+anchor+'"'),'Missing focal anchor '+file+'#'+anchor);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='newbrain-focal-objective-review-2026-11-18'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-focal-objective-review-2026-11-18"'));
const focalReply=iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain training result?','',[],null);
assert.ok(focalReply&&focalReply.answer.includes('19/32')&&focalReply.answer.includes('seven of eight'),'Iris failed to surface newest focal evidence');
// Older reviewed experiments and all preceding immutable packs remain in the loaded knowledge.
// November 18.4 fact-order result, zero-update diagnostic and metadata QA.
const priorNov183=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-18-3.json'),'utf8'));
assert.equal(iris.validate(priorNov183),priorNov183);
assert.equal(priorNov183.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-mixed-rehearsal-review-2026-11-18');
for(const z of ['2,048','14,608','16,656','32/48','22/48','15/48','21/48','39/128','30/32','147','112','35','2,415','96','Original12','2/12'])assert.ok(priorNov212.projects.find(p=>p.id==='newbrain').status.includes(z),'Prior Nov18 fact-order evidence preserved '+z);
for(const [p,a] of [['newbrain.html','newbrain-fact-order-diagnostic-2026-11-18'],['updates.html','newbrain-fact-order-diagnostic-2026-11-18'],['reports/newbrain-fact-order-provenance-review-2026-11-18.html','reviewed-scope'],['reports/newbrain-fact-order-provenance-review-2026-11-18.html','read-only'],['reports/newbrain-fact-order-provenance-review-2026-11-18.html','provenance']])assert.ok(fs.readFileSync(path.join(docs,p),'utf8').includes('id="'+a+'"'),'Missing Nov18.4 anchor '+p+'#'+a);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(x=>x.id==='newbrain-fact-order-diagnostic-2026-11-18'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-fact-order-diagnostic-2026-11-18"'));
// November 18.3 executed rehearsal review; November 18.2 remains immutable.
const priorNov182=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-18-2.json'),'utf8'));
assert.equal(iris.validate(priorNov182),priorNov182);
assert.equal(priorNov182.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-native-copy-continuation-2026-11-18');
const rehearsal=data.projects.find(p=>p.id==='newbrain');
assert.equal(rehearsal.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const term of ['2,048','1/16','16/16','26/48','30/48','10/48','11/48','1/32','3/32','5/32','1/24','41/64','45/64','Four of five','Original12','2/12'])assert.ok(rehearsal.status.includes(term),'Latest rehearsal evidence absent: '+term);
assert.match(rehearsal.limits,/no matched no-replay causal control/);
for(const [file,anchor] of [['newbrain.html','newbrain-mixed-rehearsal-review-2026-11-18'],['updates.html','newbrain-mixed-rehearsal-review-2026-11-18'],['reports/newbrain-mixed-rehearsal-review-2026-11-18.html','reviewed-scope'],['reports/newbrain-mixed-rehearsal-review-2026-11-18.html','measured-results'],['reports/newbrain-mixed-rehearsal-review-2026-11-18.html','limitations']])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+anchor+'"'),'Missing November 18.3 anchor '+file+'#'+anchor);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(x=>x.id==='newbrain-mixed-rehearsal-review-2026-11-18'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-mixed-rehearsal-review-2026-11-18"'));
assert.ok(iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain training result?','',[],null).answer.includes('2,048'));
// November 18.2 closed study; November 18.1 remains immutable.
const priorNov181=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-18-1.json'),'utf8'));
assert.equal(iris.validate(priorNov181),priorNov181);
assert.equal(priorNov181.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-native-copy-study-2026-11-18');
const newestCopy=data.projects.find(p=>p.id==='newbrain');
for(const q of ['3,072','3/96','2/96','0/64','3/192','2/192','4/16','6/16','Original12','2/12'])assert.ok(newestCopy.status.includes(q),'November 18.2 missing '+q);
assert.match(newestCopy.limits,/not virgin independent testing/);
for(const [f,id] of [['newbrain.html','newbrain-native-copy-continuation-2026-11-18'],['updates.html','newbrain-native-copy-continuation-2026-11-18'],['reports/newbrain-native-copy-continuation-2026-11-18.html','reviewed-scope'],['reports/newbrain-native-copy-continuation-2026-11-18.html','outcomes'],['reports/newbrain-native-copy-continuation-2026-11-18.html','limitations']])assert.ok(fs.readFileSync(path.join(docs,f),'utf8').includes('id="'+id+'"'),'Missing new report anchor '+f+'#'+id);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='newbrain-native-copy-continuation-2026-11-18'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-native-copy-continuation-2026-11-18"'));
assert.ok(iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain training result?','',[],null).answer.includes('3,072'));
// Nov 18: failed Native copying studies; preserve all prior immutable packs and baseline checks.
const priorNov172=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-17-2.json'),'utf8'));
assert.equal(iris.validate(priorNov172),priorNov172);
for(const x of ['640','960','0/96','0/64','0/32','9/16','4/16','10/96','2/12'])assert.ok(priorNov212.projects.find(p=>p.id==='newbrain').status.includes(x),'Prior Nov18 copy evidence preserved '+x);
for(const [f,a] of [['newbrain.html','newbrain-native-copy-study-2026-11-18'],['updates.html','newbrain-native-copy-study-2026-11-18'],['reports/newbrain-context-copy-study-2026-11-18.html','reviewed-scope'],['reports/newbrain-context-copy-study-2026-11-18.html','paired-curriculum-study']])assert.ok(fs.readFileSync(path.join(docs,f),'utf8').includes('id="'+a+'"'),'Nov18 missing anchor '+f+'#'+a);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='newbrain-native-copy-study-2026-11-18'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-native-copy-study-2026-11-18"'));
assert.ok(priorNov212.projects.find(p=>p.id==='newbrain').status.includes('0/96'),'Historical November 18 failed study must remain in immutable reviewed pack');
// Nov 17 ET / Nov 18 UTC: closed CUDA learning failure, frozen-S3 diagnostic and later untrained bridge gates.
const priorNov171=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-17-1.json'),'utf8'));
assert.equal(iris.validate(priorNov171),priorNov171,'Keep the previous November 17.1 pack immutable and valid');
assert.match(priorNov171.projects.find(p=>p.id==='newbrain').limits,/bridge remains unimplemented/);
assert.equal(iris.validate(priorNov111),priorNov111,'November 11 immutable knowledge remains valid');
const currentNative=data.projects.find(p=>p.id==='newbrain');
assert.equal(currentNative.source,'newbrain.html#newbrain-matched-selector-review-2026-11-22');
for(const q of ['2,000','18/80','0/16','36/48','Original12','2/12','20 numerical','24 fixed finite-difference','untrained'])assert.ok(currentNative.status.includes(q),'Native status missing '+q);
assert.ok(fs.readFileSync(path.join(docs,'reports/newbrain-native-context-review-2026-11-17.html'),'utf8').includes('id="bridge-qualification-2026-11-17"'));
assert.match(currentNative.limits,/no optimizer training/);
assert.match(priorNov212.projects.find(p=>p.id==='newbrain').evidence,/34\/34 rerun/);
assert.match(priorNov212.projects.find(p=>p.id==='newbrain').technical,/fresh-process cold restor/i);
for(const [file,anchor] of [['newbrain.html','newbrain-native-context-continuation-2026-11-17'],['updates.html','newbrain-native-context-review-2026-11-17'],['reports/newbrain-native-context-review-2026-11-17.html','reviewed-scope']])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+anchor+'"'),'Missing new public anchor '+file+'#'+anchor);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='newbrain-native-context-review-2026-11-17'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-native-context-review-2026-11-17"'));
const nativeReply=iris.answer({iris_projects:data,topics:[],sources:{}},'What is the latest NewBrain training result?','',[],null);
assert.ok(nativeReply&&nativeReply.answer.includes('18/80'),'Iris did not surface closed Native failure');
const priorNov91=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-09-1.json'),'utf8'));
assert.equal(iris.validate(priorNov91),priorNov91,'Immutable November 9.1 pack must remain valid');
assert.equal(priorNov91.projects.find(p=>p.id==='world').source,'updates.html#kira-world-louvre-home-avatar-review-2026-11-09');
for(const [file,anchor] of [['updates.html','louvre-v66-walkthrough-2026-11-11'],['kira-world-notebook.html','louvre-walk-v66']])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+anchor+'"'),'Missing public V66 anchor '+file+'#'+anchor);
assert.match(data.projects.find(p=>p.id==='world').overview,/NOV11 PUBLIC RECORDED PREVIEW/);
assert.match(data.projects.find(p=>p.id==='world').limits,/not a public playable world/);
const priorNov82=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-08-2.json'),'utf8'));
assert.equal(iris.validate(priorNov82),priorNov82,'Immutable November 8.2 pack must remain valid');
for(const [id,ref] of [['world','updates.html#louvre-v66-walkthrough-2026-11-11'],['avatar-body','kira-world-avatar-builder.html#avatar-original-v2-review-2026-11-09'],['temporary-creator','updates.html#kira-world-louvre-home-avatar-review-2026-11-09']])assert.equal(data.projects.find(p=>p.id===id).source,ref,'November 9 current source '+id);
for(const [f,a] of [['updates.html','kira-world-louvre-home-avatar-review-2026-11-09'],['kira-world-home.html','home-world-development-review-2026-11-09'],['kira-world-notebook.html','louvre-development-review-2026-11-09'],['kira-world-avatar-builder.html','avatar-original-v2-review-2026-11-09'],['reports/kira-world-home-louvre-avatar-2026-11-09.html','reviewed-public-scope']])assert.ok(fs.readFileSync(path.join(docs,f),'utf8').includes('id="'+a+'"'),'Missing Nov9 public anchor '+f);
for(const id of ['kira-world-home-louvre-prototype-review-2026-11-09','avatar-original-v2-review-2026-11-09']){assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id===id),'Missing Nov9 progress '+id);assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "'+id+'"'),'Missing Nov9 visual timeline '+id)}
assert.match(data.projects.find(p=>p.id==='world').status,/9 review cameras/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/no approved person/);
assert.match(data.projects.find(p=>p.id==='temporary-creator').status,/draft age\/body/);
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/Original12 accepted 2\/12/);
const priorNov81=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-08-1.json'),'utf8'));
assert.equal(iris.validate(priorNov81),priorNov81,'November 8.1 public pack must remain intact');
assert.equal(priorNov81.projects.find(p=>p.id==='world').source,'updates.html#kira-world-hardware-and-worldbuilding-2026-11-08');
assert.equal(priorNov81.projects.find(p=>p.id==='arcade').source,'reports/byte-bolt-learning-town-2026-11-06.html#verified-scope');
assert.match(data.projects.find(p=>p.id==='arcade').status,/69 Node checks passed/);
assert.match(data.projects.find(p=>p.id==='world').overview,/First-party Home World neighborhood/);
for(const [file,anchor] of [['updates.html','kira-world-prototype-screenshots-2026-11-08'],['updates.html','byte-bolt-audio-compatibility-2026-11-08'],['reports/byte-bolt-audio-compatibility-2026-11-08.html','verified-audio-scope'],['kira-world.html','development-screenshots-2026-11-08']])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+anchor+'"'),'Missing November 8.2 public source '+file+'#'+anchor);
for(const id of ['kira-world-prototype-screenshots-2026-11-08','byte-bolt-audio-compatibility-2026-11-08']){
 assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "'+id+'"'),'Picture timeline missing '+id);
 assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id===id),'Milestone data missing '+id);
}

const archivedNov71=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-07-1.json'),'utf8'));
assert.equal(iris.validate(archivedNov71),archivedNov71,'November 7 pack must stay valid and immutable');
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/27M proxy scored 8\/25/);
assert.match(data.projects.find(p=>p.id==='world').status,/5 rooms, 6 authored routes and 7 review cameras/);
assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="kira-world-hardware-and-worldbuilding-2026-11-08"'),'November 8 source anchor missing');
const priorV89=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-06-6.json'),'utf8'));
assert.equal(iris.validate(priorV89),priorV89,'Previous V89 public knowledge must remain readable');
assert.equal(priorV89.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-v89-development-2026-11-06');
assert.equal(priorV89.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-v89-staged-2026-11-06');
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').overview,/V14 got 5\/5 abstention/);
assert.match(data.projects.find(p=>p.id==='avatar-body').overview,/V95 REFERENCE RESEARCH/);
for(const [file,id] of [['newbrain.html','newbrain-fresh-v14-2026-11-07'],['kira-world-avatar-builder.html','avatar-reference-v95-2026-11-07'],['updates.html','newbrain-fresh-protocols-2026-11-07'],['updates.html','avatar-reference-fit-2026-11-07']]){
 assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+id+'"'),'Nov 7 update missing: '+id);
}
for(const id of ['newbrain-fresh-protocols-2026-11-07','avatar-reference-fit-2026-11-07']){
 assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id===id));
 assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "'+id+'"'));
}

const archivedNov65=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-06-5.json'),'utf8'));
assert.equal(iris.validate(archivedNov65),archivedNov65,'Preserve previous immutable pack');
assert.equal(archivedNov65.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-v68-component-verification-2026-11-06');
assert.equal(archivedNov65.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-v77-animation-export-2026-11-06');
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/8\/8 after teaching/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/139,059 triangles/);
for(const [file,id] of [['newbrain.html','newbrain-v89-development-2026-11-06'],['kira-world-avatar-builder.html','avatar-v89-staged-2026-11-06'],['updates.html','newbrain-v89-bounded-evaluation-2026-11-06'],['updates.html','avatar-v89-staged-review-2026-11-06'],['reports/newbrain-avatar-v89-reviewed-2026-11-06.html','newbrain-v89'],['reports/newbrain-avatar-v89-reviewed-2026-11-06.html','avatar-v89']])assert.ok(fs.readFileSync(path.join(docs,file),'utf8').includes('id="'+id+'"'),'Missing V89 public anchor '+id);
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='newbrain-v89-bounded-evaluation-2026-11-06'));
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='avatar-v89-staged-review-2026-11-06'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "newbrain-v89-bounded-evaluation-2026-11-06"'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "avatar-v89-staged-review-2026-11-06"'));
const archivedNov64=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-06-4.json'),'utf8'));
assert.equal(iris.validate(archivedNov64),archivedNov64,'Previous immutable knowledge preserved');
assert.equal(archivedNov64.projects.find(p=>p.id==='arcade').source,'reports/arcade-lobby-release-2026-11-06.html#what-changed');
assert.equal(data.projects.find(p=>p.id==='arcade').source,'reports/byte-bolt-audio-compatibility-2026-11-08.html#verified-audio-scope');
assert.match(data.projects.find(p=>p.id==='arcade').status,/59 passing Node regression groups/);
assert.match(data.projects.find(p=>p.id==='arcade').status,/22 authored projects/);
assert.ok(fs.readFileSync(path.join(docs,'reports/byte-bolt-learning-town-2026-11-06.html'),'utf8').includes('id="verified-scope"'));
assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="byte-bolt-learning-town-2026-11-06"'));
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='byte-bolt-learning-town-2026-11-06'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "byte-bolt-learning-town-2026-11-06"'));
const archivedNov63=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-06-3.json'),'utf8'));
assert.equal(iris.validate(archivedNov63),archivedNov63,'Preserve previous November 6.3 research pack');
assert.equal(archivedNov63.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-v68-recovery-2026-11-06');
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/five genuinely changing authored animation clips/);
assert.match(data.projects.find(p=>p.id==='avatar-body').limits,/does not qualify full anatomy/);
assert.ok(fs.readFileSync(path.join(docs,'kira-world-avatar-builder.html'),'utf8').includes('id="avatar-v77-animation-export-2026-11-06"'));
assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="avatar-v77-animation-export-2026-11-06"'));
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='avatar-v77-animation-export-2026-11-06'));
assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "avatar-v77-animation-export-2026-11-06"'));
const archivedNov62=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-06-2.json'),'utf8'));
assert.equal(iris.validate(archivedNov62),archivedNov62,'Previous Nov 6.2 Iris pack must remain available');
assert.equal(archivedNov62.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-supporting-systems-2026-11-06');
assert.equal(archivedNov62.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-v12-body-v9-2026-11-05');
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/84 authored checks/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/memory-write protections restored/);
assert.ok(fs.readFileSync(path.join(docs,'newbrain.html'),'utf8').includes('id="newbrain-v68-component-verification-2026-11-06"'));
assert.ok(fs.readFileSync(path.join(docs,'kira-world-avatar-builder.html'),'utf8').includes('id="avatar-v68-recovery-2026-11-06"'));
for(const [id,article] of [['newbrain-v68-engineering-2026-11-06','newbrain-v68-engineering-2026-11-06'],['avatar-v68-engineering-2026-11-06','avatar-v68-engineering-2026-11-06']]){
 assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="'+article+'"'),'New Nov 6 update missing: '+article);
 assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id===id),'Nov 6 progress missing: '+id);
 assert.ok(fs.readFileSync(path.join(docs,'labs-data.js'),'utf8').includes('"id": "'+id+'"'),'Nov 6 picture milestone missing: '+id);
}
assert.ok(raw.length<120000,'Iris current pack must fit loader cap');
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/SEPARATE SMALL-DECODER EVIDENCE/);
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/69\/69 authored/);
assert.equal(priorNov111.projects.find(p=>p.id==='newbrain').source,'updates.html#kira-world-hardware-and-worldbuilding-2026-11-08');
assert.ok(fs.readFileSync(path.join(docs,'newbrain.html'),'utf8').includes('id="newbrain-supporting-systems-2026-11-06"'));
assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="newbrain-voice-hearing-restart-2026-11-06"'));
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/FIT-STAGE ONLY/);
assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="newbrain-decoder-rehearsal-2026-11-05"'));
assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="avatar-head-v7-clearance-2026-11-05"'));
const priorNov53=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-05-3.json'),'utf8'));
assert.equal(iris.validate(priorNov53),priorNov53,'Preserve earlier immutable Nov 5.3 pack');
assert.equal(priorNov53.projects.find(p=>p.id==='arcade').source,'arcade/index.html#ar-games-title');
assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="arcade-lobby-release-2026-11-06"'));
assert.ok(fs.readFileSync(path.join(docs,'reports/arcade-lobby-release-2026-11-06.html'),'utf8').includes('id="what-changed"'));
assert.ok(JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8')).milestones.some(m=>m.id==='arcade-lobby-release-2026-11-06'));
const priorNov51=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-05-1.json'),'utf8'));
assert.equal(iris.validate(priorNov51),priorNov51,'November 5.1 historical pack remains valid');
assert.equal(priorNov51.projects.find(p=>p.id==='world').source,'kira-world.html#temporary-ai-creator');
assert.equal(data.projects.find(p=>p.id==='world').source,'updates.html#louvre-v66-walkthrough-2026-11-11');
assert.ok(fs.readFileSync(path.join(docs,'kira-world.html'),'utf8').includes('id="kw-hub-title"'),'Current Kira World source anchor missing');
const priorNov45=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-04-5.json'),'utf8'));
assert.equal(iris.validate(priorNov45),priorNov45,'Preserved immutable November 4.5 pack must validate');
assert.equal(priorNov45.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-v9-closed-2026-11-04');
assert.equal(priorNov45.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-v11-body-v7-2026-11-04');
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/NOV05 V3 CLOSED\/FAILED/);
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/1\/15/);
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/0\/10/);
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/Original12 accepted 2\/12/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/17 VIEWS AND REJECTED/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/BODY V9 ACTUAL RUN FAILED/);
for(const [f,anchor] of [['newbrain.html','newbrain-v3-closed-2026-11-05'],['kira-world-avatar-builder.html','avatar-builder-v12-body-v9-2026-11-05'],['updates.html','newbrain-v3-closed-2026-11-05'],['updates.html','avatar-v12-body-v9-2026-11-05'],['reports/newbrain-avatar-continuation-2026-11-05.html','v3-learning-result'],['reports/newbrain-avatar-continuation-2026-11-05.html','avatar-v12-v9']]){
 assert.ok(fs.readFileSync(path.join(docs,f),'utf8').includes('id="'+anchor+'"'),'Missing Nov5 source '+f+'#'+anchor);
}
const datedProgress=JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8'));
assert.equal(datedProgress.reviewed_on,'2026-11-22');
for(const id of ['newbrain-pathway-v3-closed-2026-11-05','avatar-v12-v9-rejected-2026-11-05'])assert.ok(datedProgress.milestones.some(m=>m.id===id),'Missing Nov5 timeline '+id);
const priorNov44=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-04-4.json'),'utf8'));
assert.equal(iris.validate(priorNov44),priorNov44,'Preserve previous Nov4.4 reviewed knowledge and original source anchors');
assert.equal(priorNov44.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-v9-pathway-study-2026-11-04');
assert.equal(priorNov44.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-v8-v9-body-v5-2026-11-04');
for(const [id,src] of [['newbrain','newbrain.html#newbrain-matched-selector-review-2026-11-22'],['avatar-body','kira-world-avatar-builder.html#avatar-original-v2-review-2026-11-09']]){
  assert.equal(data.projects.find(p=>p.id===id).source,src,'latest reviewed source for '+id);
  const [page,anchor]=src.split('#');
  assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+anchor+'"'),'Latest public research anchor missing '+id);
}
for(const id of ['newbrain-v9-closed-2026-11-04','avatar-v11-body-v7-2026-11-04'])assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="'+id+'"'),'Latest milestone missing '+id);
for(const id of ['v9-learning-result','avatar-v11-v7'])assert.ok(fs.readFileSync(path.join(docs,'reports/newbrain-avatar-continuation-2026-11-04.html'),'utf8').includes('id="'+id+'"'),'New public report anchor missing '+id);
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/V9 NATIVE LEARNING QUALIFICATION COMPLETED AND FAILED/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/HEAD V11 ACTUALLY SOLVED/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/Body V7 ACTUAL RUN FAILED/);
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/Original12 accepted 2\/12/);
assert.equal(data.projects.length,13);

const priorNov43=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-04-3.json'),'utf8'));
assert.equal(iris.validate(priorNov43),priorNov43,'Preserve archived Nov4.3 resource and head results');
assert.equal(priorNov43.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-v8v2-admission-2026-11-04');
assert.equal(priorNov43.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-v6-v7-source-review-2026-11-04');
for(const [id,src] of [['newbrain','newbrain.html#newbrain-matched-selector-review-2026-11-22'],['avatar-body','kira-world-avatar-builder.html#avatar-original-v2-review-2026-11-09']]){
  assert.equal(data.projects.find(p=>p.id===id).source,src);
  const [page,fragment]=src.split('#');
  assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+fragment+'"'),'Latest public source anchor missing '+id);
}
assert.match(priorNov44.projects.find(p=>p.id==='newbrain').status,/V9 NATIVE STUDY ACTIVE/);
assert.match(priorNov44.projects.find(p=>p.id==='avatar-body').status,/V8 REJECTED/);
assert.match(priorNov44.projects.find(p=>p.id==='avatar-body').status,/Body V5 allocation FAILED/);
for(const id of ['newbrain-v9-pathway-2026-11-04','avatar-v8-v9-body-v5-2026-11-04'])assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="'+id+'"'));
const priorNov42=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-04-2.json'),'utf8'));
assert.equal(iris.validate(priorNov42),priorNov42,'Prior Nov4.2 research pack preserved');
assert.equal(priorNov42.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-checkpoint-memory-repair-2026-11-04');
assert.equal(priorNov42.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-original-v5-review-2026-11-04');
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/V8v2/);
assert.match(priorNov44.projects.find(p=>p.id==='avatar-body').status,/V6\/V7/);
assert.match(priorNov44.projects.find(p=>p.id==='avatar-body').status,/NOT EXECUTED/);
for(const id of ['newbrain-v8v2-source-review-2026-11-04','avatar-builder-v6-v7-2026-11-04'])assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="'+id+'"'));
const priorNov41=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-04-1.json'),'utf8'));
assert.equal(iris.validate(priorNov41),priorNov41,'Prior Nov4.1 knowledge still validates');
for(const [id,pathAndAnchor] of [['newbrain','newbrain.html#newbrain-v8v2-admission-2026-11-04'],['avatar-body','kira-world-avatar-builder.html#avatar-builder-v6-v7-source-review-2026-11-04']]){
  assert.equal(priorNov43.projects.find(p=>p.id===id).source,pathAndAnchor,'Archived Nov4.3 source must stay stable');
  const [page,anchor]=pathAndAnchor.split('#');
  assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+anchor+'"'),'New November 4 section missing '+id);
}
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/LATEST NOV04 CHECKPOINT SOURCE/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/13 static review views/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/REJECTED/);
for(const id of ['newbrain-checkpoint-memory-2026-11-04','avatar-v5-head-review-2026-11-04'])assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="'+id+'"'));
const priorNov32=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-03-2.json'),'utf8'));
assert.equal(iris.validate(priorNov32),priorNov32,'Preserve Circuitbound November 3.2 knowledge');
for(const [id,link] of [['newbrain','newbrain.html#newbrain-owned-record-prefix-2026-11-04'],['avatar-body','kira-world-avatar-builder.html#avatar-builder-regional-scheduler-2026-11-04']]){
  // Earlier links belong to the immutable Nov4.1 pack; the active Nov4.2 links are asserted above.
  assert.equal(priorNov41.projects.find(p=>p.id===id).source,link);
  assert.ok(fs.readFileSync(path.join(docs,link.split('#')[0]),'utf8').includes('id="'+link.split('#')[1]+'"'));
}
assert.ok(priorNov41.projects.find(p=>p.id==='newbrain').status.includes('nine invented metadata'),'Preserve exact prior Nov4.1 reader source test count');
assert.ok(priorNov111.projects.find(p=>p.id==='newbrain').evidence.includes('nine portable metadata/source groups'),'Current Nov4.2 reader evidence must remain available');
for(const term of ['0/6','Original12 accepted 2/12'])assert.ok(priorNov111.projects.find(p=>p.id==='newbrain').status.includes(term),'Missing latest NewBrain measured limits '+term);
assert.ok(data.projects.find(p=>p.id==='avatar-body').status.includes('V2 ten invented tests'));
for(const id of ['newbrain-record-reader-2026-11-04','avatar-regional-scheduler-2026-11-04'])assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="'+id+'"'));
const priorNov31=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-03-1.json'),'utf8'));
assert.equal(iris.validate(priorNov31),priorNov31,'Preserve prior 12-project research pack');
assert.equal(priorNov31.projects.length,12);
assert.equal(data.projects.length,13);
assert.equal(data.projects.find(p=>p.id==='arcade').source,'reports/byte-bolt-audio-compatibility-2026-11-08.html#verified-audio-scope');
for(const term of ['Circuitbound','33 animated scenes','10 beginner coding/electronics puzzles','four distinct endings'])assert.ok(data.projects.find(p=>p.id==='arcade').overview.includes(term));
assert.ok(fs.readFileSync(path.join(docs,'arcade/index.html'),'utf8').includes('id="ar-games-title"'));
assert.ok(fs.readFileSync(path.join(docs,'arcade/index.html'),'utf8').includes('href="circuitbound/"'));
assert.ok(fs.existsSync(path.join(docs,'arcade/circuitbound/index.html')));
const priorNov22=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-02-2.json'),'utf8'));
assert.equal(iris.validate(priorNov22),priorNov22,'Older Nov2.2 Iris pack is preserved');
assert.equal(data.projects.find(p=>p.id==='aster').source,'projects.html#aster-retention-review-2026-11-03');
assert.match(data.projects.find(p=>p.id==='aster').status,/59\/72/);
assert.match(data.projects.find(p=>p.id==='aster').status,/0\/24/);
assert.ok(fs.readFileSync(path.join(docs,'projects.html'),'utf8').includes('id="aster-retention-review-2026-11-03"'));
const priorNov21=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-02-1.json'),'utf8'));
assert.equal(iris.validate(priorNov21),priorNov21,'Prior Nov2.1 pack preserved');
for(const value of ['216 genuine teaching updates','72 full-generation calls','24/24','0/6','Original12 accepted 2/12','FAILED'])assert.ok(priorNov111.projects.find(p=>p.id==='newbrain').status.includes(value),'New fixed learning failure missing: '+value);
for(const [page,ref] of [['newbrain.html','newbrain-content-readout-qualification-2026-11-02'],['updates.html','newbrain-readout-completed-2026-11-02'],['reports/newbrain-content-readout-qualification-2026-11-02.html','readout-qualification-2026-11-02']])assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+ref+'"'),'New public anchor missing '+page);

const priorNov12=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-01-2.json'),'utf8'));
assert.equal(iris.validate(priorNov12),priorNov12,'Preserve immutable Nov1.2 public pack');
assert.equal(priorNov12.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-native-adam-candidate-2026-11-01');
assert.equal(priorNov12.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-profile-fields-2026-11-01');
for(const q of ['LATEST NOV02 SOURCE + NEGATIVE LEARNING','11 groups','37 negatives','79 unit passes','34 optional skips','0/6 direct','0/6 paraphrase','0/6 unfamiliar use','2/6 unsupported','Original12 accepted 2/12'])assert.ok(priorNov111.projects.find(p=>p.id==='newbrain').status.includes(q),'Missing Nov2 bounded NewBrain result '+q);
for(const q of ['LATEST NOV02 WORKSPACE','12 offline tests','Windows HTTP','GUI UNTESTED'])assert.ok(data.projects.find(p=>p.id==='avatar-body').status.includes(q),'Missing Nov2 Avatar workspace boundary '+q);
for(const [page,anchor] of [['newbrain.html','newbrain-readout-source-2026-11-02'],['kira-world-avatar-builder.html','avatar-builder-workspace-identity-2026-11-02'],['updates.html','research-review-2026-11-02'],['reports/newbrain-avatar-research-2026-11-02.html','newbrain-nov02-readout']])assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+anchor+'"'),'Missing Nov2 public anchor '+page);

const priorNov1=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-11-01-1.json'),'utf8'));
assert.equal(iris.validate(priorNov1),priorNov1,'Immutable Nov1.1 pack must remain valid');
assert.equal(data.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-original-v2-review-2026-11-09');
assert.match(priorNov111.projects.find(p=>p.id==='newbrain').status,/OPT-IN ADAM/);
assert.match(data.projects.find(p=>p.id==='avatar-body').status,/round eyeballs.*EYELIDS/);
for(const [page,id] of [['newbrain.html','newbrain-native-adam-candidate-2026-11-01'],['kira-world-avatar-builder.html','avatar-builder-profile-fields-2026-11-01']])assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+id+'"'),'New status section missing '+id);
const priorOct315=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-31-5.json'),'utf8'));
assert.equal(iris.validate(priorOct315),priorOct315,'Prior immutable Oct31.5 reviewed pack remains valid');
for(const x of ['LATEST NOV01 RETRIEVAL ONLY','800 calls','34/37','23/37','0/37','23/26','11/11','Original12 accepted 2/12'])assert.ok(priorNov111.projects.find(p=>p.id==='newbrain').status.includes(x),'Missing Nov1 result '+x);
assert.equal(priorNov111.projects.find(p=>p.id==='newbrain').source,'updates.html#kira-world-hardware-and-worldbuilding-2026-11-08');
for(const [page,anchor] of [['newbrain.html','newbrain-opt-in-context-selection-2026-11-01'],['updates.html','newbrain-historical-context-selection-2026-11-01'],['reports/newbrain-opt-in-historical-context-2026-11-01.html','historical-context-qualification']])assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+anchor+'"'),'Missing Nov1 anchor '+page);
// The picture timeline uses a new Nov 6.3 cache key for the two new V68 research milestones.
assert.ok(fs.readFileSync(path.join(docs,'progress.html'),'utf8').includes('labs-data.js?v=2026-11-22.1'));
const priorOct314=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-31-4.json'),'utf8'));
assert.equal(iris.validate(priorOct314),priorOct314,'Preserve prior Oct31.4 immutable public pack');
for(const q of ['LATEST OCT31 EXECUTED MEMORY RETRIEVAL','25/30','0/30','24/30','Original12 accepted 2/12'])assert.ok(priorNov111.projects.find(p=>p.id==='newbrain').status.includes(q),'Missing latest retrieval result '+q);
for(const q of ['LATEST OCT31 EXECUTED ORIGINAL CONNECTED BODY','45,528','68 rest bones','REJECTED','UNRUN'])assert.ok(data.projects.find(p=>p.id==='avatar-body').status.includes(q),'Missing newest body review '+q);
for(const [page,anchor] of [['newbrain.html','newbrain-memory-retrieval-baseline-2026-10-31'],['kira-world-avatar-builder.html','avatar-builder-connected-neutral-body-review-2026-10-31'],['updates.html','newbrain-memory-and-avatar-body-2026-10-31'],['reports/newbrain-memory-retrieval-baseline-2026-10-31.html','retrieval-baseline'],['reports/avatar-connected-neutral-body-review-2026-10-31.html','body-rejection']])assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+anchor+'"'),'Missing latest page anchor '+page);
const priorOct313=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-31-3.json'),'utf8'));
assert.equal(iris.validate(priorOct313),priorOct313,'Preserve prior Oct31.3 A116 and Source112 immutable pack');
for(const q of ['LATEST OCT31 NATIVE API AGREEMENT','TWO-RESTORE','ZERO updates','UNSCORED','Original12 remains 2/12'])assert.ok(priorNov111.projects.find(p=>p.id==='newbrain').status.includes(q),'Missing Oct31 API result '+q);
for(const q of ['LATEST OCT31 MOTION SOFTWARE','22/22 PURE SOFTWARE','NO actual body','No measured animation'])assert.ok(data.projects.find(p=>p.id==='avatar-body').status.includes(q),'Missing Oct31 software motion result '+q);
for(const [page,anchor] of [['newbrain.html','newbrain-native-api-agreement-2026-10-31'],['kira-world-avatar-builder.html','avatar-builder-motion-library-2026-10-31'],['updates.html','avatar-motion-and-newbrain-native-agreement-2026-10-31'],['reports/avatar-motion-software-boundary-2026-10-31.html','software-tests'],['reports/newbrain-native-api-path-agreement-2026-10-31.html','two-restores']])assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+anchor+'"'),'Missing newly reviewed public anchor '+page);
const priorOct312=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-31-2.json'),'utf8'));assert.equal(iris.validate(priorOct312),priorOct312,'Preserve prior reviewed A108/Source109 release');
const priorOct311=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-31-1.json'),'utf8'));assert.equal(iris.validate(priorOct311),priorOct311,'Preserve prior Oct31.1 pack with original A108/Source109 findings');
const priorOct306=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-30-6.json'),'utf8'));assert.equal(iris.validate(priorOct306),priorOct306,'Preserve Oct30.6 A98 archive');
for(const q of ['LATEST OCT31 A108','rank 77','Original12 2/12'])assert.ok(priorOct312.projects.find(p=>p.id==='newbrain').status.includes(q),'Preserved A108 reviewed fact '+q);
for(const q of ['LATEST OCT31 A116','17','Zero nominations','Original12 accepted 2/12'])assert.ok(priorNov111.projects.find(p=>p.id==='newbrain').status.includes(q),'New A116 preexecution research missing '+q);
for(const q of ['LATEST OCT31 SOURCE109','UNRUN','128-point'])assert.ok(priorOct312.projects.find(p=>p.id==='avatar-body').status.includes(q),'Preserved Source109 fact '+q);
for(const q of ['LATEST OCT31 AVATAR SOURCE112','SIX','UNRUN','140,000'])assert.ok((data.projects.find(p=>p.id==='avatar-body').status+' '+data.projects.find(p=>p.id==='avatar-body').technical).includes(q),'New Source112 unrun camera note missing '+q);
for(const [page,anchor] of [['newbrain.html','newbrain-single-reply-a108-2026-10-31'],['kira-world-avatar-builder.html','avatar-builder-connected-head-torso-source109-2026-10-31'],['updates.html','newbrain-a108-first-token-2026-10-31'],['updates.html','avatar-source109-2026-10-31'],['reports/newbrain-native-reply-diagnostic-a108-2026-10-31.html','measured-diagnostic'],['reports/avatar-connected-head-torso-source109-2026-10-31.html','design']])assert.ok(fs.readFileSync(path.join(docs,page),'utf8').includes('id="'+anchor+'"'),'Missing published anchor '+page+'#'+anchor);
const priorOct305=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-30-5.json'),'utf8'));
assert.equal(iris.validate(priorOct305),priorOct305,'Preserve historical A94 evidence');
const priorOct304=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-30-4.json'),'utf8'));assert.equal(iris.validate(priorOct304),priorOct304,'Preserve A87/A92 report and 20/20 restart result');
const priorOct303=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-30-3.json'),'utf8'));
assert.equal(iris.validate(priorOct303),priorOct303,'Preserve immutable A75 review');
for(const [pagePath,anchor] of [['newbrain.html','newbrain-word-study-a87-a92-2026-10-30'],['updates.html','newbrain-word-study-a87-a92-2026-10-30'],['reports/newbrain-word-study-a87-a92-2026-10-30.html','results']])assert.ok(fs.readFileSync(path.join(docs,pagePath),'utf8').includes('id="'+anchor+'"'),'Missing A87 evidence anchor '+pagePath);
const priorOct302=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-30-2.json'),'utf8'));assert.equal(iris.validate(priorOct302),priorOct302,'Preserve measured Source72 software qualification');
const priorOct301=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-30-1.json'),'utf8'));
assert.equal(iris.validate(priorOct301),priorOct301,'Preserve prior October 30 original-core greeting review');
assert.equal(priorOct301.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-conversation-interface-2026-10-30');
const priorOct293=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-29-3.json'),'utf8'));assert.equal(iris.validate(priorOct293),priorOct293,'Preserved Oct29.3 measured A62/A60 review');
const priorOct292=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-29-2.json'),'utf8'));assert.equal(iris.validate(priorOct292),priorOct292,'Previous Oct29.2 archive/camera notes retained');
const priorOct291=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-29-1.json'),'utf8'));assert.equal(iris.validate(priorOct291),priorOct291,'Previous October 29.1 review remains valid');
const priorOct285=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-28-5.json'),'utf8'));assert.equal(iris.validate(priorOct285),priorOct285,'Previous October 28.5 review remains valid');
for(const fact of ['65 checks','6,324 vertices','nine measured','Seven female torso calls UNRUN'])assert.ok(priorOct285.projects.find(p=>p.id==='avatar-body').status.includes(fact),'Preserved October 28 body finding: '+fact);
for(const s of ['11/12','4/12','2 previously correct abstention controls lost','candidate NOT adopted'])assert.ok(priorOct285.projects.find(p=>p.id==='newbrain').status.includes(s),'Preserved verified Oct 27–28 outcome '+s);
for(const score of ['23/24','7/24','43/48','17 additional','288/288'])assert.ok(priorOct285.projects.find(p=>p.id==='newbrain').status.includes(score),'Preserved verified NB14 result '+score);
for(const id of ['world','avatar-body','evelyn'])assert.ok(data.projects.find(p=>p.id===id).evidence.includes('fundraising-film.html'),'Fundraising film must be covered by Iris: '+id);
const previousIris=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-27-1.json'),'utf8'));assert.equal(iris.validate(previousIris),previousIris,'Prior Oct27 knowledge must remain valid');
const priorOct284=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-28-4.json'),'utf8'));assert.equal(iris.validate(priorOct284),priorOct284,'Prior October 28.4 founder education and project notes retained');
const priorOct283=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-28-3.json'),'utf8'));assert.equal(iris.validate(priorOct283),priorOct283,'Prior October 28.3 knowledge retained');
const priorOct282=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-28-2.json'),'utf8'));assert.equal(iris.validate(priorOct282),priorOct282,'Prior October 28.2 knowledge retained');
const previousOct28=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-28-1.json'),'utf8'));assert.equal(iris.validate(previousOct28),previousOct28,'Prior Oct28.1 notes retained');
const knowledge={topics:[],sources:{},public_packs:null};
iris.prepare(knowledge,data);
const arcadeAnswer=iris.answer(knowledge,'Where can I play Circuitbound The Lantern Siege?','',[],null);
assert.equal(arcadeAnswer.id,'arcade');
assert.match(arcadeAnswer.answer,/https:\/\/kiralabs\.org\/arcade\/circuitbound\//);
const arcadeLimits=iris.answer(knowledge,'Does Circuitbound run NewBrain?','',[],null);
assert.equal(arcadeLimits.id,'arcade');
assert.match(arcadeLimits.answer,/not an autonomous NewBrain/i);
const ask=(q)=>{const response=iris.answer(knowledge,q,'',[],null);assert.ok(response&&response.answer,'No reviewed answer: '+q);return response;};

const v66Direct=ask('Where can I watch the Louvre V66 walkthrough, and is it a real museum reconstruction?');
assert.equal(v66Direct.id,'world');
assert.equal(v66Direct.facet,'public-video');
assert.match(v66Direct.answer,/kira-world-notebook\.html#louvre-walk-v66/);
assert.match(v66Direct.answer,/not footage from the real Louvre/);
assert.deepEqual(v66Direct.sources,['iris-current-world']);
const v66Overview=ask('What is the Louvre V66 walkthrough?');
assert.equal(v66Overview.facet,'public-video');
assert.match(v66Overview.answer,/not a publicly playable world/);


// Historical behavior is checked against its immutable November 11 context; the new pack answers latest results.
const historicalKnowledge={topics:[],sources:{},public_packs:null};
iris.prepare(historicalKnowledge,priorNov111);
const historicalAsk=q=>{const r=iris.answer(historicalKnowledge,q,'',[],null);assert.ok(r?.answer,'No archived answer: '+q);return r;};
const currentReadout=historicalAsk('What did the November 2 NewBrain content-state readout prove, and did Original12 improve?');
assert.equal(currentReadout.id,'newbrain');
assert.ok(['status','compound'].includes(currentReadout.facet));
assert.match(currentReadout.answer,/LATEST NOV02 SOURCE/);
assert.match(currentReadout.answer,/Original12 accepted 2\/12/);
const currentBody=ask('Was a full Evelyn body accepted on November 2, or just the Avatar Builder workspace launcher checked?');
assert.match(currentBody.answer,/LATEST NOV02 WORKSPACE/);
assert.match(currentBody.answer,/No new original body/);

const directA108=historicalAsk('What did NewBrain A108 establish, and did Original12 improve?');
assert.equal(directA108.id,'newbrain');assert.equal(directA108.facet,'status');assert.match(directA108.answer,/rank 77/);assert.match(directA108.answer,/Original12(?: accepted)? 2\/12/);
const directSource109=ask('Is the Source109 head torso connected body finished?');
assert.equal(directSource109.id,'avatar-body');assert.equal(directSource109.facet,'status');assert.match(directSource109.answer,/UNRUN/);
const edu=ask('What degree does Robert McMurrer have?');
assert.equal(edu.id,'robert');assert.equal(edu.facet,'education');
for(const fact of ['Bachelor of Science in Business','Marketing Certificate','University of Phoenix','March 2020'])assert.ok(edu.answer.includes(fact),'Founder education detail missing: '+fact);
assert.deepEqual(edu.sources,['iris-founder-education']);
const school=ask('Where did the Kira Labs founder attend university?');assert.equal(school.id,'robert');assert.ok(school.answer.includes('University of Phoenix'));
const followEdu=iris.answer(knowledge,'And his education?','robert',[],null);assert.equal(followEdu?.facet,'education');
const mistaken=iris.answer(knowledge,'What degree does Evelyn have?','',[],null);assert.notEqual(mistaken?.facet,'education','Must not attribute founder degree to Evelyn');
assert.equal(data.founder_education.source,'about.html#education');
assert.ok(fs.readFileSync(path.join(docs,'about.html'),'utf8').includes('id="education"'));
const founderKnowledge={topics:[{id:'robert',answer:'Robert founded Kira Labs.',sources:['about']}],sources:{about:{label:'About Robert',url:'about.html'}},bio:{short:'Robert founded Kira Labs.',expanded:'Robert founded Kira Labs.'},public_packs:null};
iris.prepare(founderKnowledge,data);
assert.ok(founderKnowledge.bio.short.includes('Bachelor of Science in Business'));
assert.ok(founderKnowledge.topics[0].answer.includes('undergraduate Marketing Certificate'));
const books=ask("What books are in Evelyn Hart's starter library?");
assert.equal(books.id,'evelyn');assert.equal(books.facet,'evidence');
for(const title of ['Dive into Deep Learning','Think Python','Think Bayes','The Time Machine','Frankenstein','Etiquette','Pride and Prejudice','Dracula','Notes on Nursing','Ada Lovelace'])assert.ok(books.answer.includes(title),title+' missing');
assert.ok(books.answer.includes('not read or released'));
const nb=ask('What are the latest NewBrain test results?');
assert.equal(nb.id,'newbrain');assert.equal(nb.facet,'status');
for(const q of ['OCTOBER 29','Actual47','Actual49','Actual51','Actual52','0/10 factual','1/12','2/12','UNRUN','checkpoint NOT adopted'])assert.ok(priorOct293.projects.find(p=>p.id==='newbrain').status.includes(q),'Preserved Oct29 previous NewBrain review '+q);
assert.ok(nb.sources.includes('iris-current-newbrain'));
assert.equal(priorNov111.projects.find(p=>p.id==='newbrain').source,'updates.html#kira-world-hardware-and-worldbuilding-2026-11-08');assert.equal(data.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-original-v2-review-2026-11-09');
assert.equal(priorOct313.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-a116-practice-eligibility-2026-10-31');assert.equal(priorOct313.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-camera-source112-2026-10-31');
assert.equal(priorOct312.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-single-reply-a108-2026-10-31');assert.equal(priorOct312.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-connected-head-torso-source109-2026-10-31');
assert.equal(priorOct305.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-continuation-a94-2026-10-30');
assert.equal(priorOct304.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-word-study-a87-a92-2026-10-30');
for(const q of ['LATEST OCT30 A94','501 tokens','256-token','No limit relaxation','UNRUN','2/12'])assert.ok(priorOct305.projects.find(p=>p.id==='newbrain').status.includes(q),'Archived A94 status missing '+q);
for(const q of ['LATEST OCT30 A98','22/22','29,977','265','A101','A103','UNRUN','0/6','20/20','2/12'])assert.ok(priorOct312.projects.find(p=>p.id==='newbrain').status.includes(q),'Preserved A98 outcome/limits '+q);
assert.equal(priorOct303.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-word-lesson-a75-2026-10-30');
assert.equal(priorOct302.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-open-language-source72-2026-10-30');
for(const q of ['LATEST OCT30 A87/A92','128 fixed','0/5 to 2/5','0/6','0/1','2/2 to 0/2','3/20','20/20','Source93','UNRUN','2/12'])assert.ok(priorOct304.projects.find(p=>p.id==='newbrain').status.includes(q),'Archived A87/A92 review missing '+q);
for(const q of ['LATEST OCT30 A75','300-vocabulary-entry','32,812','16 fixed FULL','0/3','0/1 to 1/1','9 fixed','19 total','2/12'])assert.ok(priorOct303.projects.find(p=>p.id==='newbrain').status.includes(q),'Preserved A75 archive missing '+q);
for(const q of ['SOURCE72 SOFTWARE QUALIFICATION','six software assertion groups','Original12 remains 2/12','no real conversation'])assert.ok(priorOct302.projects.find(p=>p.id==='newbrain').status.toLowerCase().includes(q.toLowerCase()),'Preserved Source72 status '+q);
for(const [pagePath,anchor] of [['newbrain.html','newbrain-open-language-source72-2026-10-30'],['updates.html','newbrain-source72-software-2026-10-30'],['reports/newbrain-language-source72-2026-10-30.html','software-qualification']])assert.ok(fs.readFileSync(path.join(docs,pagePath),'utf8').includes('id="'+anchor+'"'),'Source72 evidence anchor missing '+pagePath);
assert.equal(priorOct293.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-typed-input-host-2026-10-29');
for(const q of ['ACTUAL71','one generate','42-token','five whitespace-separated','73 software','46 expected','2/12','not a cognitive understanding score'])assert.ok(priorOct302.projects.find(p=>p.id==='newbrain').status.includes(q),'Preserved Oct30 original input rejection '+q);
assert.equal(priorOct292.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-diagnostic-custody-2026-10-29');
for(const q of ['LATEST A62','58 rejection','384 updates','108','216','122,485,745','host identity','scorer NEVER ran','Source63','UNRUN','2/12'])assert.ok(priorOct293.projects.find(p=>p.id==='newbrain').status.includes(q),'Preserved A62 unscored finding '+q);
assert.equal(priorOct291.projects.find(p=>p.id==='newbrain').source,'newbrain.html#newbrain-mathematics-and-learning-2026-10-29');
for(const q of ['Actual53','Actual57','136 MiB','Source58','UNRUN','NO qualified answer set'])assert.ok(priorOct293.projects.find(p=>p.id==='newbrain').status.includes(q),'Preserved prior incomplete attempts '+q);
const historicalNB=priorOct285.projects.find(p=>p.id==='newbrain').status;
for(const q of ['6/12','10/24','23/24','43/48','11/12','candidate NOT adopted','17 additional','540','324','2/3','3/3','105/105','30/105','20 generations','UNSCORED','freshness guard','84,826','105-case','312,524','192/192','33/48','30/48'])assert.ok(historicalNB.includes(q),'Preserved earlier learning detail '+q);
const creators=ask('How does the Temporary AI Creator work?');
assert.equal(creators.id,'temporary-creator');assert.match(creators.answer,/Avatar Builder/);assert.match(creators.answer,/current generator/);
const renamed=ask('Why was Temporary Creator renamed Person Creator on October 24?');
assert.equal(renamed.id,'temporary-creator');
assert.equal(renamed.title.startsWith('Person Creator'),true);
assert.match(renamed.answer,/October 24, 2026/);
assert.match(renamed.answer,/not every person/i);
const newTitle=ask('What is Person Creator?');assert.equal(newTitle.id,'temporary-creator');assert.match(newTitle.answer,/not a working one-click/);
const prior24=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-24-1.json'),'utf8'));
assert.equal(iris.validate(prior24),prior24,'Previous October 24 project pack must remain valid');
const movies=ask('What movies and TV shows might Evelyn Hart discuss?');
assert.equal(movies.id,'evelyn');assert.equal(movies.facet,'how');assert.match(movies.answer,/Star Trek/);assert.match(movies.answer,/not watched/);
const body=ask('What is the latest Avatar Builder status?');
assert.equal(body.id,'avatar-body');assert.equal(body.facet,'status');
for(const q of ['OCTOBER 29','A45','A44','16,385 vertices','14 matched inspection images','174 localized','176 locked','REJECTED','UNRUN'])assert.ok(priorOct312.projects.find(p=>p.id==='avatar-body').status.includes(q),'Preserved A44/A45 review '+q);
assert.equal(priorOct306.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-reference-bounds-2026-10-29');
assert.equal(priorOct292.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-camera-transport-source-2026-10-29');
for(const q of ['LATEST A60','16,385','3,086','eight camera','12 mm','24 mm','Source61','Source63','UNRUN'])assert.ok(priorOct312.projects.find(p=>p.id==='avatar-body').status.includes(q),'Preserved A60 constraints '+q);
assert.equal(priorOct291.projects.find(p=>p.id==='avatar-body').source,'kira-world-avatar-builder.html#avatar-builder-a44-a45-2026-10-29');
for(const q of ['LATER OCTOBER 29','Camera-transport','UNRUN','No new anatomical geometry'])assert.ok(priorOct312.projects.find(p=>p.id==='avatar-body').status.includes(q),'Preserved older camera source '+q);
const historicalBody=priorOct285.projects.find(p=>p.id==='avatar-body').status;
for(const q of ['V9','V10','34 ordinary software methods','217','473','REJECTED','failed strict side camera','163-bone','13/28','38 facial observations','23/23','18 actual Blender static','unqualified','A15','12 actual inspected','16,385','6,324'])assert.ok(historicalBody.includes(q),'Preserved earlier body evidence '+q);
const approvedVoice=ask("Has Evelyn Hart's original voice been approved?");assert.equal(approvedVoice.id,'evelyn');assert.match(approvedVoice.answer,/approved/i);assert.match(approvedVoice.answer,/3.04/);
const prior265=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-26-5.json'),'utf8'));assert.equal(iris.validate(prior265),prior265,'Preserve previous pinned October 26.5 knowledge pack');
const prior264=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-26-4.json'),'utf8'));assert.equal(iris.validate(prior264),prior264,'Prior October 26.4 Iris pack still validates');
const prior262=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-26-2.json'),'utf8'));assert.equal(iris.validate(prior262),prior262,'Original October 26.2 pack valid');
const prior26=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-26-1.json'),'utf8'));assert.equal(iris.validate(prior26),prior26,'Earlier October 26 Iris pack should remain valid');
const priorVoicePack=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-24-2.json'),'utf8'));assert.equal(iris.validate(priorVoicePack),priorVoicePack);
const evelyn=ask('What is the current status of Evelyn Hart?');assert.equal(evelyn.id,'evelyn');assert.ok(evelyn.answer.includes('public'));assert.match(evelyn.answer,/58\.125/);assert.ok(evelyn.answer.includes('30-title library'));
const old=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-21-3.json'),'utf8'));assert.equal(iris.validate(old),old,'Preserved historical pack must remain valid');
const last4=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-23-4.json'),'utf8'));assert.equal(iris.validate(last4),last4,'October 23 historical pack must remain valid');
const last3=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-23-3.json'),'utf8'));assert.equal(iris.validate(last3),last3,'Preserved previous numerical-planning pack must remain valid');
const last23=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-23-2.json'),'utf8'));assert.equal(iris.validate(last23),last23,'Preserved previous October 23 pack must remain valid');
const previous22=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-22-3.json'),'utf8'));assert.equal(iris.validate(previous22),previous22,'Preserved 30-book October 22 pack must remain valid');
const previous=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-22-1.json'),'utf8'));assert.equal(iris.validate(previous),previous,'Preserved 22-book pack must remain valid');
assert.ok(fs.readFileSync(path.join(docs,'kira-world-avatar-builder.html'),'utf8').includes('id="avatar-builder-original-eye-2026-10-26"'));
for(const project of data.projects){const source=project.source.split('#')[0];assert.ok(fs.existsSync(path.join(docs,source)),'Missing public linked source '+source);}
assert.ok(moduleCode.includes('LEGACY_SOURCE'),'Historic project pack support missing');
const chatScript=fs.readFileSync(path.join(docs,'iris-chat-ui.js'),'utf8');
assert.ok(irisPage.includes('id="iris-chat-transcript"')&&irisPage.includes('iris-chat-ui.js')&&irisPage.includes('iris-chat-ui.css'));
assert.ok(chatScript.includes('MutationObserver')&&chatScript.includes("addMessage('iris'"));

for(const q of ['NB15','NB16','9/24','7/24','8/24','2/12'])assert.ok(priorOct284.projects.find(p=>p.id==='newbrain').status.includes(q),'Preserved historical Oct 27 NB check '+q);
for(const q of ['routing projection exactly zero','routing-only training','1/12','2/12','global','full adaptation'])assert.ok((priorOct285.projects.find(p=>p.id==='newbrain').status+' '+priorOct285.projects.find(p=>p.id==='newbrain').technical).includes(q),'Preserved Oct28 routing result '+q);
for(const q of ['14 saved fixed inspection views','3,086 vertices','8 targeted checks','REJECTED'])assert.ok(priorOct285.projects.find(p=>p.id==='avatar-body').status.includes(q),'Preserved Oct28 A41 result '+q);
for(const [f,anchor] of [
 ['newbrain.html','newbrain-mathematics-and-learning-2026-10-29'],
 ['kira-world-avatar-builder.html','avatar-builder-a44-a45-2026-10-29'],
 ['updates.html','newbrain-avatar-results-2026-10-29']]){
 assert.ok(fs.readFileSync(path.join(docs,f),'utf8').includes('id="'+anchor+'"'),'Missing October29 measured web section '+f);
}
for(const [pagePath,id] of [['newbrain.html','newbrain-diagnostic-custody-2026-10-29'],['kira-world-avatar-builder.html','avatar-builder-camera-transport-source-2026-10-29'],['updates.html','newbrain-evidence-archive-2026-10-29']])assert.ok(fs.readFileSync(path.join(docs,pagePath),'utf8').includes('id="'+id+'"'),'Missing later Oct29 engineering note '+pagePath);
for(const [pagePath,id] of [['newbrain.html','newbrain-typed-input-host-2026-10-29'],['kira-world-avatar-builder.html','avatar-builder-reference-bounds-2026-10-29'],['updates.html','newbrain-avatar-late-2026-10-29']])assert.ok(fs.readFileSync(path.join(docs,pagePath),'utf8').includes('id="'+id+'"'),'Missing latest verified October29 note '+pagePath);
for(const [pagePath,anchor] of [['newbrain.html','newbrain-word-lesson-a75-2026-10-30'],['updates.html','newbrain-word-lesson-a75-2026-10-30'],['reports/newbrain-word-lesson-a75-2026-10-30.html','answers']])assert.ok(fs.readFileSync(path.join(docs,pagePath),'utf8').includes('id="'+anchor+'"'),'Missing reviewed A75 report section '+pagePath);
for(const [pagePath,anchor] of [['newbrain.html','newbrain-continuation-a94-2026-10-30'],['updates.html','newbrain-continuation-a94-2026-10-30']])assert.ok(fs.readFileSync(path.join(docs,pagePath),'utf8').includes('id="'+anchor+'"'),'A94 input extent report missing '+pagePath);
for(const [pagePath,anchor] of [['newbrain.html','newbrain-continuing-lesson-a98-2026-10-30'],['updates.html','newbrain-continuing-lessons-a98-2026-10-30'],['reports/newbrain-continuing-lesson-a98-2026-10-30.html','software-results'],['reports/newbrain-continuing-lesson-a98-2026-10-30.html','later-entry']])assert.ok(fs.readFileSync(path.join(docs,pagePath),'utf8').includes('id="'+anchor+'"'),'Missing A98 public anchor '+pagePath+'#'+anchor);
for(const [pagePath,fragment] of [['newbrain.html','newbrain-a116-practice-eligibility-2026-10-31'],['kira-world-avatar-builder.html','avatar-builder-camera-source112-2026-10-31'],['updates.html','newbrain-avatar-a116-source112-2026-10-31']])assert.ok(fs.readFileSync(path.join(docs,pagePath),'utf8').includes('id="'+fragment+'"'),'Missing dated A116/Source112 engineering update '+pagePath);
const timelineText=fs.readFileSync(path.join(docs,'labs-data.js'),'utf8');
for(const id of ['newbrain-six-group-rehearsal-2026-11-05','avatar-head-v7-clearance-2026-11-05']){
 assert.ok(timelineText.includes('"id": "'+id+'"'),'Current picture timeline missing '+id);
 assert.ok(datedProgress.milestones.some(m=>m.id===id),'Current progress timeline missing '+id);
}
assert.ok(timelineText.includes('"prepared_on": "2026-11-22"'),'Current picture timeline review date missing');
for(const id of ['newbrain-content-readout-boundary-2026-11-02','avatar-workspace-identity-2026-11-02'])assert.ok(timelineText.includes('"id": "'+id+'"'),'Nov2 picture timeline milestone missing: '+id);
const timelineData=JSON.parse(timelineText.replace(/^[\s\S]*?window\.KIRA_LABS_TIMELINE\s*=\s*/,'').replace(/;\s*$/,''));
assert.equal(timelineData.prepared_on,'2026-11-22');
for(const id of ['newbrain-v3-closed-negative-2026-11-05','avatar-v12-head-v9-body-failed-2026-11-05'])assert.equal(timelineData.milestones.find(m=>m.id===id)?.date,'2026-11-05','Missing Nov5 picture milestone '+id);
for(const id of ['newbrain-v9-fixed-study-failed-2026-11-04','avatar-v11-rejected-body-v7-2026-11-04'])assert.equal(timelineData.milestones.find(m=>m.id===id)?.date,'2026-11-04','Missing Nov4 picture milestone '+id);
for(const id of ['newbrain-content-mean-qualification-failed-2026-11-02','newbrain-content-readout-boundary-2026-11-02','avatar-workspace-identity-2026-11-02']){
 assert.equal(timelineData.milestones.find(m=>m.id===id)?.date,'2026-11-02','Missing dated milestone '+id);
}
assert.match(timelineData.milestones.find(m=>m.id==='newbrain-content-readout-boundary-2026-11-02').boundary,/does not prove semantic understanding/);
assert.match(timelineData.milestones.find(m=>m.id==='avatar-workspace-identity-2026-11-02').boundary,/not proof/);
assert.match(timelineData.milestones.find(m=>m.id==='newbrain-content-mean-qualification-failed-2026-11-02').body,/216 genuine teaching updates/);

const progress=JSON.parse(fs.readFileSync(path.join(docs,'progress-data.json'),'utf8'));
assert.equal(progress.reviewed_on,'2026-11-22');
for(const milestone of ['avatar-motion-software-2026-10-31','newbrain-native-api-agreement-2026-10-31','newbrain-a108-native-reply-diagnostic-2026-10-31','avatar-source109-connection-2026-10-31'])assert.ok(progress.milestones.some(m=>m.id===milestone),'Missing Oct31 milestone '+milestone);
assert.ok(progress.milestones.some(m=>m.id==='newbrain-continuing-lesson-a98-persistence-2026-10-30'),'A98 timeline entry missing');
assert.ok(progress.milestones.some(m=>m.id==='newbrain-word-study-a87-a92-2026-10-30'),'A87/A92 dated milestone missing');
assert.ok(progress.milestones.some(m=>m.id==='newbrain-word-lesson-a75-restart-2026-10-30'),'A75 measured result missing on timeline');
for(const milestone of ['newbrain-routing-math-and-answer-tests-2026-10-29','avatar-builder-original-a44-a45-2026-10-29'])assert.ok(progress.milestones.some(m=>m.id===milestone),'Missing October29 Lab Timeline milestone '+milestone);
for(const milestone of ['newbrain-actual62-216-outputs-unscored-2026-10-29','avatar-reference-a60-constraint-rejection-2026-10-29'])assert.ok(progress.milestones.some(m=>m.id===milestone),'Missing evening actual evidence on timeline '+milestone);
assert.ok(progress.milestones.some(m=>m.id==='newbrain-ordinary-conversation-gate-2026-10-30'),'Missing October 30 ordinary input diagnostic on timeline');
for(const [pagePath,anchor] of [['newbrain.html','newbrain-conversation-interface-2026-10-30'],['updates.html','newbrain-ordinary-greeting-2026-10-30']])assert.ok(fs.readFileSync(path.join(docs,pagePath),'utf8').includes('id="'+anchor+'"'),'October30 evidence page missing '+pagePath);
for(const f of ['docs/newbrain.html','docs/kira-world-avatar-builder.html','docs/updates.html']){
 const content=fs.readFileSync(path.join(__dirname,'..',f),'utf8');
 assert.ok(content.includes('newbrain-routing-retention-2026-10-28')||content.includes('avatar-builder-a41-2026-10-28')||content.includes('newbrain-avatar-a41-review-2026-10-28'),f+' missing latest documented results');
}

for(const q of ['A16','31 head','three ear','26.48','128-point','UNBOUND'])assert.ok(previousOct28.projects.find(p=>p.id==='avatar-body').status.includes(q),'Preserved Oct 27 A16 history check '+q);
for(const q of ['full-sequence','NOT runtime-ready','NOT run'])assert.ok(priorOct285.projects.find(p=>p.id==='newbrain').status.includes(q),'Preserved source-only NewBrain qualifier: '+q);
for(const q of ['chin projection','submental floor','NOT run'])assert.ok(priorOct285.projects.find(p=>p.id==='avatar-body').status.includes(q),'Preserved unrun Avatar Builder source: '+q);
assert.ok(fs.readFileSync(path.join(docs,'updates.html'),'utf8').includes('id="next-original-core-and-head-candidates-2026-10-28"'));
const old266=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/iris-projects-2026-10-26-6.json'),'utf8'));
assert.equal(iris.validate(old266),old266,'Oct 26.6 historical Iris pack remains valid');
for(const f of ['newbrain-transfer-replay-2026-10-27.html','avatar-head-ear-a16-2026-10-27.html'])assert.ok(fs.existsSync(path.join(docs,'reports',f)));
assert.ok(fs.readFileSync(path.join(docs,'newbrain.html'),'utf8').includes('id="newbrain-nb15-nb16-2026-10-27"'));
assert.ok(fs.readFileSync(path.join(docs,'kira-world-avatar-builder.html'),'utf8').includes('id="avatar-builder-a16-2026-10-27"'));

/* Current floating/full-page Iris contact instructions must not refer to a nearby form.
   Only the Contact page has that form. */
const contactPolicyNov1=require('../docs/iris-policy.js');
const contactKnowledgeNov1={topics:[],sources:{'iris-contact':{label:'Send Robert a message',url:'contact.html#direct-contact'}},iris_projects:{projects:[]}};
const contactReplyNov1=contactPolicyNov1.wrap({enrich:()=>({title:'Fallback',answer:'Fallback',sources:[]})},null)
  .enrich(contactKnowledgeNov1,'Send Robert a message','',[],null);
assert.equal(contactReplyNov1.title,'Send Robert a message');
assert.match(contactReplyNov1.answer,/Contact page/);
assert.match(contactReplyNov1.answer,/select “Send Robert a message”/);
assert.match(contactReplyNov1.answer,/not sent to Robert/);
assert.doesNotMatch(contactReplyNov1.answer,/beside this guide|next to (?:Iris|this guide)/i);
assert.deepEqual(contactReplyNov1.sources,['iris-contact']);
assert.ok(irisPage.includes('iris-policy.js?v=2026-11-01.2'));
assert.ok(irisPage.includes('href="contact.html#direct-contact"'));
assert.ok(fs.readFileSync(path.join(docs,'contact.html'),'utf8').includes('id="direct-contact"'));

/* NewBrain page visual-regression safety, November 6: real page, not mockup. */
const newBrainVisualHtml=fs.readFileSync(path.join(docs,'newbrain.html'),'utf8');
const newBrainVisualCss=fs.readFileSync(path.join(docs,'newbrain-redesign.css'),'utf8');
assert.ok(newBrainVisualHtml.includes('newbrain-redesign.css?v=2026-11-06.1'),'Visual stylesheet missing');
for(const anchor of ['nb-viz-features-heading','nb-viz-architecture-heading','nb-viz-timeline-heading','nb-viz-evidence-heading','newbrain-research-records','newbrain-v3-closed-2026-11-05','newbrain-v9-closed-2026-11-04','roadmap']){
  assert.ok(newBrainVisualHtml.includes('id="'+anchor+'"'),'Missing NewBrain visual/historical section: '+anchor);
}
for(const asset of ['newbrain-wave-ribbons.svg','newbrain-learning-layers.svg','newbrain-multimodal-concept.svg','animations/newbrain-card.gif','animations/newbrain-concept.gif']){
  assert.ok(fs.existsSync(path.join(docs,'assets',asset)),'Missing NewBrain visual asset '+asset);
}
assert.ok((newBrainVisualHtml.match(/<section/g)||[]).length>60,'Older detailed NewBrain research sections were lost');
assert.ok(newBrainVisualHtml.includes('Original12'),'Original12 limitation missing');
assert.ok(newBrainVisualHtml.includes('including wrong answers')||newBrainVisualHtml.includes('including incorrect replies'),'Restart failure boundary missing');
assert.ok(newBrainVisualHtml.includes('not a fully operational integrated system'),'Diagram must not overclaim runtime');
assert.ok(newBrainVisualHtml.includes('labs.js?v=20261101-iris-float4'),'Ask Iris launcher removed');
assert.ok(newBrainVisualCss.includes('prefers-reduced-motion:reduce'),'Reduced-motion fallback missing');
assert.ok(newBrainVisualCss.includes('max-width:540px'),'Narrow-screen fallback missing');

console.log('Iris October 26 Person Creator checks passed: integrity, 12 project sources, 30-book and historical library titles, bubble chat markup, research boundaries, Creator, movie plans, and legacy notes');
