const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const dir=path.resolve(__dirname,'../docs'),raw=fs.readFileSync(path.join(dir,'knowledge/iris-projects-2026-10-17-1.json'),'utf8'),data=JSON.parse(raw);
const api=require('../docs/iris-projects.js');assert.doesNotThrow(()=>api.validate(data));assert.equal(data.projects.length,10);
const base=JSON.parse(fs.readFileSync(path.join(dir,'sarah-knowledge.json'),'utf8')),k=api.prepare(base,data);
for(const [q,id] of [['What is Avatar Builder?','avatar-body'],['Tell me about Lisa','world'],['What is Aster?','aster'],['What is Patient Horizon?','patient-horizon']])assert.equal(api.answer(k,q,'',[],null)?.id,id,q);
assert.ok(fs.readFileSync(path.join(dir,'iris.js'),'utf8').includes(createHash('sha256').update(raw).digest('hex')));
console.log('Iris 2026-10-17 knowledge validation passed');
