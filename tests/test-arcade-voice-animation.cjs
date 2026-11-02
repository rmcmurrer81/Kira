'use strict';
/* Story-game regression suite, no browser dependencies.
 * Run: node tests/test-arcade-voice-animation.cjs
 * This checks executable flows with a DOM and Web Worker stub, not pixels/audio hardware.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const docs=path.join(__dirname,'..','docs');
const text=p=>fs.readFileSync(path.join(docs,p),'utf8');
const questHtml=text('arcade/code-quest/index.html');
const questJs=text('arcade/code-quest/game.js');
const sandboxJs=text('arcade/code-quest/sandbox.js');
const sharedVoice=text('arcade/arcade-voice.js');
const fireflyHtml=text('arcade/code-quest/your-first-game.html');
const fireflyScripts=Array.from(fireflyHtml.matchAll(/<script>([\s\S]*?)<\/script>/g),m=>m[1]);

function element(id){
  const classes=new Set();
  const e={
    id,textContent:'',innerHTML:'',value:'',hidden:false,disabled:false,children:[],
    dataset:{},style:{},listeners:{},attributes:{},className:'',selectionStart:0,selectionEnd:0,offsetWidth:10,
    classList:{
      add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),
      toggle(c,force){const on=force===undefined?!classes.has(c):force;if(on)classes.add(c);else classes.delete(c);return on}
    },
    setAttribute(k,v){this.attributes[k]=String(v)},
    addEventListener(k,fn){this.listeners[k]=fn},
    appendChild(v){this.children.push(v)},
    replaceChildren(...v){this.children=v},
    querySelectorAll(selector){return this.children.filter(e=>e.className===selector.replace('.',''))},
    click(){if(!this.disabled)this.listeners.click?.({preventDefault(){},stopImmediatePropagation(){}})},
    scrollIntoView(){},focus(){},
    setRangeText(value,start,end){this.value=this.value.slice(0,start)+value+this.value.slice(end)}
  };
  return e;
}
function dom(html){
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  const elements=new Map();
  function get(id){
    // Document-created nodes may not have an original ID; this guard catches typos.
    assert(ids.has(id),'Code references missing HTML element: '+id);
    if(!elements.has(id))elements.set(id,element(id));
    return elements.get(id);
  }
  return {get,document:{
    getElementById:get,querySelector(selector){if(selector==='.cq-stage')return element('stage');if(selector==='.cq-progress')return element('progress');return element('content')},
    createElement:()=>element('generated'),createDocumentFragment:()=>element('fragment')
  }};
}

function testQuest(){
  for(const id of ['startSound','soundToggle','hearAgain','choiceButtons','easyContinue','easyHint','codeDetails']){
    assert(questHtml.includes('id="'+id+'"'),'Missing control: '+id);
  }
  for(const term of ['workshop','village','river','archive','station','meadow','beacon'])
    assert(text('arcade/code-quest/game.css').includes('[data-world="'+term+'"]'),'Missing animation for '+term);
  const {get,document}=dom(questHtml),storage={},narrated=[],cues=[];
  const voice={
    enabled:false,enable(){this.enabled=true;return true},disable(){this.enabled=false},
    stop(){},speak:t=>narrated.push(t),cue:t=>cues.push(t)
  };
  const window={
    KiraArcadeVoice:{create:()=>voice},
    addEventListener(){},confirm:()=>true,matchMedia:()=>({matches:true})
  };
  class Worker{
    constructor(){this.onmessage=null;this.onerror=null}
    terminate(){}
    postMessage(data){
      const workerContext={self:{postMessage:message=>this.onmessage?.({data:message})}};
      vm.runInNewContext(sandboxJs,workerContext,{timeout:1000});
      workerContext.self.onmessage({data});
    }
  }
  const context={
    document,window,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>{storage[k]=v}},
    Worker,setTimeout:()=>4,clearTimeout(){},setInterval:()=>5,clearInterval(){},
  };
  vm.runInNewContext(questJs,context,{timeout:3000});
  assert.equal(get('choiceButtons').children.length,3,'First mission must offer big beginner buttons');
  // Wrong choice must not trap a new learner. Then recover with one click.
  get('choiceButtons').children[1].click();
  assert.equal(get('outputPanel').dataset.state,'error');
  get('choiceButtons').children[0].click();
  assert.equal(get('outputPanel').dataset.state,'success');
  assert.equal(get('easyContinue').hidden,false);
  for(let level=1;level<8;level++){
    get('easyContinue').click();
    assert.equal(get('choiceButtons').children.length,3,'Mission '+(level+1)+' missing choices');
    get('choiceButtons').children[0].click();
    assert.equal(get('outputPanel').dataset.state,'success','Mission '+(level+1)+' not completable');
    assert.equal(get('easyContinue').hidden,false);
  }
  const progress=JSON.parse(storage['kira-code-quest-starlight-v1']);
  assert.equal(progress.cleared.filter(Boolean).length,8);
  assert.equal(get('ending').hidden,false);
  assert(narrated.length>=8,'Game should narrate each successful chapter');
  assert(cues.includes('win'),'Game needs sound on chapter success');
  // Existing code editor must remain usable instead of becoming fake educational code.
  assert(questJs.includes('new Worker("sandbox.js?v=1")'),'Real JavaScript worker was removed');
}

function testSharedVoice(){
  assert(sharedVoice.includes('Jenny'),'Iris voice preference missing');
  assert(sharedVoice.includes('Ava'),'Iris voice fallback missing');
  assert(sharedVoice.includes('utter.rate=0.96'),'Iris rate missing');
  assert(sharedVoice.includes('utter.pitch=1'),'Iris pitch missing');
  assert(!sharedVoice.includes('localStorage'),'Voice preference must not create a selector profile');
  const voices=[
    {name:'Microsoft David Desktop',lang:'en-US'},
    {name:'Microsoft Jenny Online (Natural)',lang:'en-US'},
    {name:'Microsoft Ava Multilingual Online (Natural)',lang:'en-US'}
  ];
  const spoken=[];
  const synth={getVoices:()=>voices,speak:utter=>{spoken.push(utter);utter.onstart?.()},cancel(){}};
  const window={
    speechSynthesis:synth,SpeechSynthesisUtterance:class{constructor(text){this.text=text}},
    addEventListener(){}
  };
  vm.runInNewContext(sharedVoice,{window},{timeout:1000});
  const voice=window.KiraArcadeVoice.create();
  assert.equal(spoken.length,0,'Game must not surprise visitors with autoplay');
  voice.enable();voice.speak('Welcome to the animated adventure.');
  assert.equal(spoken.length,1);
  assert.equal(spoken[0].voice.name,'Microsoft Jenny Online (Natural)');
  assert.equal(spoken[0].rate,0.96);
  voice.disable();
}

function testFirefly(){
  assert.equal(fireflyScripts.length,2,'Standalone game must contain its own voice and story scripts');
  assert(fireflyHtml.includes('.world[data-scene="forest"]')&&fireflyHtml.includes('.world[data-scene="river"]'),'Changing scenery missing');
  for(let pathNumber=0;pathNumber<16;pathNumber++){
    const {get,document}=dom(fireflyHtml),spoken=[];
    const voices=[{name:'Microsoft Jenny Online (Natural)',lang:'en-US'}];
    const synth={getVoices:()=>voices,speak:utter=>{spoken.push(utter);utter.onstart?.()},cancel(){}};
    const window={
      speechSynthesis:synth,SpeechSynthesisUtterance:class{constructor(text){this.text=text}},
      addEventListener(){},AudioContext:undefined,webkitAudioContext:undefined
    };
    const ctx={document,window,getComputedStyle:()=>({top:'25px',left:'50px'})};
    vm.runInNewContext(fireflyScripts[0],ctx,{timeout:1000});
    vm.runInNewContext(fireflyScripts[1],ctx,{timeout:1000});
    const fireflies=get('fireflySwarm').children;
    assert.equal(fireflies.length,3);
    fireflies[0].click();
    assert(fireflies[0].classList.contains('is-caught'));
    for(let stage=0;stage<4;stage++){
      const choice=get('choices').children[(pathNumber>>stage)&1];
      assert(choice,'Missing Firefly Trail scene button');
      choice.click();
    }
    assert.equal(get('world').dataset.scene,'ending','Wrong world at story finale');
    assert.equal(get('restart').hidden,false,'Missing replay button');
    assert.equal(get('final').hidden,false,'Missing ending');
    assert(spoken.length>0,'Voice did not play from user gesture');
    assert.equal(spoken[0].voice.name,'Microsoft Jenny Online (Natural)');
    get('restart').click();
    assert.equal(get('world').dataset.scene,'start');
    assert.equal(get('bag').textContent,'Backpack: empty');
  }
}
testQuest();
testSharedVoice();
testFirefly();
console.log('Animated arcade and Iris voice passed: 8 Code Quest missions, 16 Firefly paths, recovery after wrong choice, narration, animated worlds, and replay.');
