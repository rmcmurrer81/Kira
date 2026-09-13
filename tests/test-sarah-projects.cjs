'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const docs=path.resolve(__dirname,'../docs');
const baseText=fs.readFileSync(path.join(docs,'sarah-knowledge.json'),'utf8');
const index=JSON.parse(fs.readFileSync(path.join(docs,'knowledge-index.json'),'utf8'));
let checks=0;
function check(fn){fn();checks++;}
function fakeElement(){return {children:[],listeners:{},disabled:false,value:'',hidden:false,dataset:{},_text:'',set textContent(value){this._text=String(value);this.children=[];},get textContent(){return this._text+this.children.map(x=>x.textContent||'').join('');},replaceChildren(...nodes){this.children=nodes;this._text='';},append(...nodes){this.children.push(...nodes);},addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(){},showModal(){},close(){},remove(){},select(){}};}
async function makeUI({corrupt='',withPacks=true}={}){
 const elements=new Map();const get=id=>{if(!elements.has(id))elements.set(id,fakeElement());return elements.get(id);};
 const fetched=[];
 const fetcher=async name=>{fetched.push(name);const p=path.join(docs,name);return {ok:fs.existsSync(p),text:async()=>fs.readFileSync(p,'utf8')+(name===corrupt?' CORRUPTION':'')};};
 const window={};const context=vm.createContext({window,document:{getElementById:get,createElement:fakeElement,querySelector:get,addEventListener(){},body:fakeElement()},fetch:fetcher,crypto:webcrypto,TextEncoder,URL,AbortController,setTimeout,clearTimeout,addEventListener(){},navigator:{}});
 if(withPacks)vm.runInContext(fs.readFileSync(path.join(docs,'sarah-packs.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(docs,'sarah-guide.js'),'utf8'),context);
 const deadline=Date.now()+3000;
 while(get('send-question').disabled){if(Date.now()>deadline)throw Error(get('guide-status').textContent);await new Promise(resolve=>setTimeout(resolve,5));}
 function ask(text){get('question').value=text;get('sarah-form').listeners.submit({preventDefault(){}});return {title:get('answer-title').textContent,answer:get('answer-body').textContent,label:get('answer-label').textContent,sources:get('answer-sources').children.map(e=>e.href)};}
 return {ask,context,window,fetcher,fetched,get};
}
async function main(){
 const ui=await makeUI();
 check(()=>assert.equal(index.packs.length,4));
 check(()=>assert.equal(ui.fetched.length,6));
 check(()=>assert.match(ui.get('guide-status').textContent,/reviewed public sources/));
 let r=ui.ask('What is ShiftBrief?');check(()=>assert.match(r.answer,/free Windows business workspace/));
 r=ui.ask('How do I install it?');check(()=>{assert.match(r.answer,/no separate Python setup/);assert.match(r.answer,/desktop shortcut is optional/);assert.ok(r.sources.some(s=>s.endsWith('ShiftBrief-Setup-0.1.0.exe')));});
 r=ui.ask('What happens when I uninstall it?');check(()=>assert.match(r.answer,/retains saved business data/));
 r=ui.ask('Is ShiftBrief free?');check(()=>{assert.match(r.answer,/free to download and use/);assert.match(r.answer,/may cost money/);});
 r=ui.ask('Does ShiftBrief need a model?');check(()=>{assert.match(r.answer,/without an installed AI model/);assert.match(r.answer,/separately installed and configured local model/);assert.match(r.answer,/No model weights are bundled/i);});
 r=ui.ask('How do I save and move my business?');check(()=>{assert.match(r.answer,/Save business copy/);assert.match(r.answer,/Load saved business/);assert.match(r.answer,/without removing businesses already there/);assert.match(r.answer,/excludes documents and conversations/i);});
 r=ui.ask('Restore backup from previous computer');check(()=>{assert.match(r.answer,/replaces that computer’s workspace after saving a backup/);assert.match(r.answer,/Linked external documents stay disabled/);});
 r=ui.ask('Does ShiftBrief start with a demo?');check(()=>{assert.match(r.answer,/blank business/);assert.match(r.answer,/eight invented employees/);assert.match(r.answer,/not loaded automatically/);});
 r=ui.ask('What happens when an employee quits?');check(()=>{assert.match(r.answer,/chat message alone does not change/);assert.match(r.answer,/first unavailable date/);assert.match(r.answer,/Preview remaining shifts/);assert.match(r.answer,/net planned hours/);assert.match(r.answer,/independent alternatives/);});
 r=ui.ask('Does it choose who to fire?');check(()=>assert.match(r.answer,/does not decide whom to fire/));
 r=ui.ask('What are the benefits of ShiftBrief?');check(()=>assert.match(r.answer,/without reconstructing the facts from scattered notes/));
 r=ui.ask('How does ShiftBrief work?');check(()=>{assert.match(r.answer,/supported questions and saved-record tools/);assert.match(r.answer,/require review and acceptance/);});
 r=ui.ask('Can website Sarah change my ShiftBrief records?');check(()=>assert.match(r.answer,/cannot open or change your desktop businesses/));
 r=ui.ask('Does ShiftBrief contact employees?');check(()=>assert.match(r.answer,/does not contact employees/));
 r=ui.ask('Is ShiftBrief payroll software?');check(()=>assert.match(r.answer,/not payroll software or a labor-law assessment/));
 r=ui.ask('What model does Kira World use?');check(()=>{assert.doesNotMatch(r.answer,/ShiftBrief|Bedrock/);assert.match(r.answer,/qwen|model/i);});
 r=ui.ask('Tell me about ClearTrail');check(()=>{assert.match(r.answer,/private owner review/);assert.doesNotMatch(r.answer,/ShiftBrief 0.1.0/);});
 r=ui.ask('Can I download it?');check(()=>assert.doesNotMatch(r.answer,/ShiftBrief-Setup|free Windows/));
 r=ui.ask('What is CutBrief?');check(()=>{assert.match(r.answer,/retired/i);assert.match(r.answer,/historical/);});
 r=ui.ask('What works today?');check(()=>{assert.match(r.answer,/ShiftBrief now has a free Windows/);assert.doesNotMatch(r.answer,/ShiftBrief, ClearTrail, Carry On and Kira Sequence Desk remain/);});
 r=ui.ask('Write a mini bio of Robert');check(()=>{assert.match(r.answer,/Robert McMurrer/);assert.doesNotMatch(r.answer,/ShiftBrief-Setup/);});
 const baseOnly=await makeUI({withPacks:false});
 r=baseOnly.ask('How do I download ShiftBrief?');check(()=>assert.match(r.answer,/no separate Python setup/));
 r=baseOnly.ask('What happens when Morgan is fired?');check(()=>assert.match(r.answer,/does not decide whom to fire/));
 const broken=await makeUI({corrupt:index.packs[3].path});
 check(()=>assert.match(broken.get('guide-status').textContent,/core published notes/));
 r=broken.ask('Is ShiftBrief free?');check(()=>assert.match(r.answer,/free to download and use/));
 const loaded=await ui.window.SarahPacks.load(baseText,ui.fetcher);
 check(()=>assert.equal(loaded.mode,'packs'));
 check(()=>assert.equal(loaded.knowledge.public_packs.facts.filter(f=>f.subject_ids.includes('shiftbrief')).length,12));
 const badFetcher=async name=>({ok:true,text:async()=>fs.readFileSync(path.join(docs,name),'utf8')+(name===index.packs[3].path?'!':'')});
 const retained=await ui.window.SarahPacks.load(baseText,badFetcher,loaded.knowledge);
 check(()=>assert.equal(retained.mode,'retained'));
 check(()=>assert.equal(retained.knowledge,loaded.knowledge));
 const fetched=[];const badIndex={...index,packs:index.packs.map((p,i)=>i===3?{...p,path:'https://outside.invalid/evil.json'}:p)};
 const badPath=await ui.window.SarahPacks.load(baseText,async name=>{fetched.push(name);return {ok:true,text:async()=>name==='knowledge-index.json'?JSON.stringify(badIndex):fs.readFileSync(path.join(docs,name),'utf8')};});
 check(()=>{assert.equal(badPath.mode,'base');assert.ok(!fetched.some(p=>p.startsWith('https:')));});
 const original=JSON.parse(fs.readFileSync(path.join(docs,'knowledge/robert-2026-09-08-1.json'),'utf8'));
 const current=JSON.parse(fs.readFileSync(path.join(docs,index.packs[0].path),'utf8'));
 check(()=>{assert.deepEqual(current.facts,original.facts);assert.deepEqual(current.topics,original.topics);assert.deepEqual(current.routes,original.routes);});
 console.log(JSON.stringify({status:'PASS',checks,content_version:index.content_version,pack_count:index.packs.length,model_calls:0,external_network_calls:0,browser_scope:'Actual loader and guide scripts in DOM fixture; root owns visual browser review.'},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
