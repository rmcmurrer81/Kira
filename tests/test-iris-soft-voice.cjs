'use strict';
/* Verify Iris has exactly one automatic female TTS preference, no chooser or
 * preview controls, and gives answers room to breathe in the floating panel.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const docs=path.join(__dirname,'..','docs');
const html=fs.readFileSync(path.join(docs,'iris.html'),'utf8');
const voiceSource=fs.readFileSync(path.join(docs,'iris-voice.js'),'utf8');
const embedCSS=fs.readFileSync(path.join(docs,'iris-embedded.css'),'utf8');
const core=fs.readFileSync(path.join(docs,'iris.js'),'utf8');
assert(html.includes('iris-voice.js?v=20261101.2'),'Fixed voice script version missing');
assert(html.includes('iris-embedded.css?v=20261101.2'),'Compact panel stylesheet version missing');
assert(!html.includes('iris-voice.css'),'Voice chooser stylesheet must not load');
assert(!voiceSource.includes('iris-voice-choice'),'No voice picker allowed');
assert(!voiceSource.includes('iris-voice-preview'),'No preview button allowed');
assert(!voiceSource.includes('localStorage'),'No legacy preference should override the chosen voice');
assert(!voiceSource.includes('createElement'),'Voice layer should not insert layout controls');
assert(!voiceSource.includes('fetch('),'Voice layer must not initiate external requests');
assert(core.includes("'sarah-guide.js':'b68d35c9a2707af483ee437ef250bf79d22d3cb3'"),
  'Pinned published answer engine must be preserved');
assert(embedCSS.includes('.guide-shortcuts{display:none!important}'),'Compact panel needs more reply space');
assert(embedCSS.includes('.guide-meta:has(#knowledge-date){display:none!important}'),
  'The nonessential notes row must be hidden in the compact panel');

class Node{
  constructor(){this.textContent='';this.hidden=false;this.disabled=false;this.attrs={};this.listeners={}}
  setAttribute(name,value){this.attrs[name]=String(value)}
  addEventListener(type,fn){(this.listeners[type]||=[]).push(fn)}
  click(){
    let stopped=false;
    const event={preventDefault(){},stopImmediatePropagation(){stopped=true}};
    for(const fn of this.listeners.click||[]){fn(event);if(stopped)break;}
    return stopped;
  }
}
function fixture(available=true){
  const nodes=new Map(['voice-toggle','voice-status','answer-title','answer-body','asked-question','answer-page','clear-chat'].map(id=>[id,new Node()]));
  const spoken=[],warnings=[],voices=[
    {name:'Microsoft David Desktop',lang:'en-US',localService:true},
    {name:'Microsoft Aria Online (Natural)',lang:'en-US',localService:false},
    {name:'Microsoft Jenny Online (Natural)',lang:'en-US',localService:false},
    {name:'Microsoft Ava Multilingual Online (Natural)',lang:'en-US',localService:false},
    {name:'Français',lang:'fr-FR'}
  ];
  class Utterance{constructor(text){this.text=text}}
  const synth={getVoices:()=>voices,speak:u=>{spoken.push(u);u.onstart?.()},cancel:()=>{}};
  const observer=[];
  const context={
    document:{getElementById:id=>nodes.get(id)||null},
    window:{speechSynthesis:available?synth:undefined,SpeechSynthesisUtterance:available?Utterance:undefined},
    MutationObserver:class{constructor(fn){observer.push(fn)}observe(){}},
    addEventListener:()=>{},setTimeout,clearTimeout
  };
  vm.runInNewContext(voiceSource,context,{filename:'iris-voice.js',timeout:1000});
  return {nodes,voices,spoken,observer,warnings};
}
async function run(){
  const f=fixture();
  const toggle=f.nodes.get('voice-toggle');
  assert.equal(f.spoken.length,0,'Voice must remain silent until visitor opts in');
  assert.equal(toggle.attrs['aria-pressed'],'false');
  assert(toggle.click(),'New fixed voice layer must intercept legacy toggle');
  assert.equal(toggle.attrs['aria-pressed'],'true');
  assert.equal(f.spoken.length,0,'Empty answer must not be narrated');
  f.nodes.get('asked-question').textContent='Tell me about NewBrain';
  f.nodes.get('answer-title').textContent='NewBrain';
  f.nodes.get('answer-body').textContent='NewBrain studies learning and memory.';
  f.nodes.get('answer-page').textContent='Reply 1 of 1';
  for(const cb of f.observer)cb();
  await new Promise(resolve=>setTimeout(resolve,140));
  assert.equal(f.spoken.length,1,'New reply should be spoken once');
  assert.match(f.spoken[0].text,/NewBrain studies learning and memory/);
  assert.equal(f.spoken[0].voice.name,'Microsoft Jenny Online (Natural)');
  assert.equal(f.spoken[0].rate,0.96);
  assert.equal(f.spoken[0].pitch,1,'Natural voice should not be artificially pitched up');

  // Without Jenny, use another natural female voice rather than a male default.
  f.voices.splice(f.voices.findIndex(v=>/Jenny/.test(v.name)),1);
  f.nodes.get('answer-body').textContent='Another verified research update.';
  for(const cb of f.observer)cb();
  await new Promise(resolve=>setTimeout(resolve,140));
  assert.equal(f.spoken.at(-1).voice.name,'Microsoft Ava Multilingual Online (Natural)');

  assert(toggle.click());
  assert.equal(toggle.attrs['aria-pressed'],'false');
  const before=f.spoken.length;
  f.nodes.get('answer-body').textContent='This should stay silent.';
  for(const cb of f.observer)cb();
  await new Promise(resolve=>setTimeout(resolve,140));
  assert.equal(f.spoken.length,before,'Voice off must prevent speech');

  const noSpeech=fixture(false);
  assert.equal(noSpeech.nodes.get('voice-toggle').disabled,true);
  assert.match(noSpeech.nodes.get('voice-status').textContent,/unavailable/i);
  console.log('Iris single soft female voice and compact reply tests passed.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
