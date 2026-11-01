'use strict';
/* Source/behavior checks for Iris' opt-in browser speech overlay.
 * The original pinned answer engine stays unchanged. No network calls.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const docs = path.join(__dirname,'..','docs');
const html = fs.readFileSync(path.join(docs,'iris.html'),'utf8');
const voiceSource = fs.readFileSync(path.join(docs,'iris-voice.js'),'utf8');
const guideSource = fs.readFileSync(path.join(docs,'sarah-guide.js'),'utf8');
const baseLoader = fs.readFileSync(path.join(docs,'iris.js'),'utf8');

assert(html.includes('iris-voice.css?v=20261101.1'));
assert(html.includes('iris-voice.js?v=20261101.1'));
assert(html.indexOf('iris-chat-ui.js?v=20261022-messenger1') < html.indexOf('iris-voice.js?v=20261101.1'));
assert(html.indexOf('iris-voice.js?v=20261101.1') < html.indexOf('iris.js?v=2026-11-01.1'));
assert(baseLoader.includes("'sarah-guide.js':'b68d35c9a2707af483ee437ef250bf79d22d3cb3'"));
assert(!guideSource.includes('iris-voice-picker'),'Do not edit the historical answer engine');
assert(!voiceSource.includes('fetch('),'Voice layer should not make its own network requests');
assert(!voiceSource.includes('new Audio('),'Voice layer should use the browser voice list');

class Node {
  constructor(tag) {
    this.tagName=tag;this.children=[];this.handlers={};this.attributes={};
    this.textContent='';this.value='';this.hidden=false;this.disabled=false;
  }
  append(...parts){this.children.push(...parts)}
  appendChild(node){this.children.push(node);return node}
  replaceChildren(...parts){this.children=[...parts]}
  insertAdjacentElement(_pos,node){this.inserted=node}
  setAttribute(name,value){this.attributes[name]=String(value)}
  addEventListener(type,fn){(this.handlers[type] ||= []).push(fn)}
  emit(type){
    const event={type,stopped:false,defaultPrevented:false,
      preventDefault(){this.defaultPrevented=true},
      stopImmediatePropagation(){this.stopped=true}};
    for(const fn of this.handlers[type]||[]){fn(event);if(event.stopped)break}
    return event;
  }
}
const createFixture = (withSpeech=true) => {
  const nodes=new Map(['voice-toggle','voice-status','answer-title','answer-body','asked-question','answer-page','clear-chat'].map(id=>[id,new Node('div')]));
  const head=new Node('header'),spoken=[],memory=new Map(),speechEvents={};
  let observer;
  const sampleVoices=[
    {name:'Microsoft David Desktop',lang:'en-US',voiceURI:'david',localService:true},
    {name:'Microsoft Jenny Online (Natural)',lang:'en-US',voiceURI:'jenny',localService:false},
    {name:'French voice',lang:'fr-FR',voiceURI:'fr',localService:true}
  ];
  const synth={
    getVoices:()=>sampleVoices,
    speak:u=>{spoken.push(u);u.onstart?.()},
    cancel:()=>{},
    addEventListener:(name,fn)=>{speechEvents[name]=fn}
  };
  class Utterance {
    constructor(text){this.text=text}
  }
  const context={
    document:{
      getElementById:id=>nodes.get(id)||null,
      querySelector:sel=>sel==='.kb-contact-iris-card .guide-head'?head:null,
      createElement:tag=>new Node(tag)
    },
    window:{
      speechSynthesis:withSpeech?synth:undefined,
      SpeechSynthesisUtterance:withSpeech?Utterance:undefined,
      localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}
    },
    MutationObserver:class{constructor(cb){observer={trigger:cb,observed:[]};this.observed=observer.observed}observe(el){observer.observed.push(el)}},
    addEventListener:()=>{},
    setTimeout,clearTimeout
  };
  vm.runInNewContext(voiceSource,context,{filename:'iris-voice.js',timeout:1000});
  const row=head.inserted;
  assert(row,'Voice controls must be installed beside Iris chat');
  const select=row.children[1],preview=row.children[2],note=row.children[3];
  return {nodes,select,preview,note,spoken,memory,sampleVoices,speechEvents,observer};
};
async function run(){
  const f=createFixture();
  const toggle=f.nodes.get('voice-toggle');
  const status=f.nodes.get('voice-status');
  assert.equal(f.spoken.length,0,'No automatic voice without user opt-in');
  assert.equal(f.select.children[0].textContent,'Soft female (automatic)');
  assert(f.note.textContent.includes('online voices'),'Disclose provider-managed voices');

  // A preview is an explicit user gesture; it must prefer a natural female voice.
  f.preview.emit('click');
  assert.equal(f.spoken.length,1);
  assert.equal(f.spoken[0].voice.name,'Microsoft Jenny Online (Natural)');
  assert.equal(f.spoken[0].rate,0.89);
  assert.equal(f.spoken[0].pitch,1.06);
  assert.equal(f.nodes.get('voice-toggle').attributes['aria-pressed'], 'false');

  // Select another browser voice and retain only that setting, not voice consent.
  const david=f.sampleVoices[0];
  f.select.value=JSON.stringify([david.name,david.lang,david.voiceURI]);
  f.select.emit('change');
  assert.equal(f.memory.get('kira-iris-preferred-voice-v1'),f.select.value);
  f.preview.emit('click');
  assert.equal(f.spoken.at(-1).voice.name,'Microsoft David Desktop');

  const before=f.spoken.length;
  const click=toggle.emit('click');
  assert(click.stopped,'New voice layer should intercept old toggle handler');
  assert.equal(toggle.attributes['aria-pressed'],'true');
  assert.equal(f.spoken.length,before,'Enabling voice should not read a placeholder');

  f.nodes.get('asked-question').textContent='Tell me about NewBrain';
  f.nodes.get('asked-question').hidden=false;
  f.nodes.get('answer-title').textContent='NewBrain';
  f.nodes.get('answer-body').textContent='NewBrain is an experimental model.';
  f.nodes.get('answer-page').textContent='Reply 1 of 1';
  f.observer.trigger();
  await new Promise(resolve=>setTimeout(resolve,150));
  assert(f.spoken.at(-1).text.includes('NewBrain is an experimental model.'),
    'The last Iris reply should be read by the chosen voice');
  assert.equal(f.spoken.at(-1).voice.name,'Microsoft David Desktop');
  const spokenWhenOn=f.spoken.length;
  toggle.emit('click');
  assert.equal(toggle.attributes['aria-pressed'],'false');
  f.nodes.get('answer-body').textContent='This is another answer.';
  f.observer.trigger();
  await new Promise(resolve=>setTimeout(resolve,150));
  assert.equal(f.spoken.length,spokenWhenOn,'Voice off must never speak later replies');

  const noAudio=createFixture(false);
  assert.equal(noAudio.nodes.get('voice-toggle').disabled,true);
  assert.equal(noAudio.preview.disabled,true);
  assert.match(status.textContent,/Voice off/i);
  console.log('Iris soft female voice checks passed: opt-in, preview, preferred voice, rate/pitch, reply reading, voice off, no-speech fallback, source integrity.');
}
run().catch(error=>{console.error(error);process.exitCode=1});
