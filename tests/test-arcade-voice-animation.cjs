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
  for(const id of ['voiceToggle','voiceReplay','choicePanel','choiceButtons','easyContinue','easyHint','codeInput','guidedButton','findTokenButton']){
    assert(questHtml.includes('id="'+id+'"'),'Missing control: '+id);
  }
  for(const term of ['workshop','courtyard','river','archive','rail','meadow','beacon'])
    assert(text('arcade/code-quest/game.css').includes('[data-theme="'+term+'"]'),'Missing animated world for '+term);

  // Execute trusted application sources with dynamic code generation disabled.
  // Learner programs below go through the real teaching-language interpreter;
  // no test uses eval/Function to execute a player's JavaScript text.
  const curriculumWindow={};
  vm.runInNewContext(text('arcade/code-quest/missions.js'),{window:curriculumWindow},{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
  vm.runInNewContext(text('arcade/code-quest/choices.js'),{window:curriculumWindow},{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
  const missions=curriculumWindow.CodeQuestMissions,choices=curriculumWindow.CodeQuestChoices;
  const {runTeachingProgram}=require('../docs/arcade/code-quest/sandbox.js');
  assert.equal(missions.length,14,'The complete adventure has fourteen gradual missions');
  assert.equal(choices.length,missions.length,'Every mission needs a no-typing route');
  function simulate(mission,result){
    if(!result.ok)return {...result,error:result.error};
    const directions=['east','south','west','north'];
    let {x,y,dir}=mission.start;
    for(const action of result.actions){
      if(action.type==='turn')dir=directions[(directions.indexOf(dir)+(action.value==='right'?1:3))%4];
      if(action.type==='move')for(let step=0;step<action.value;step++){
        if(dir==='east')x++;else if(dir==='south')y++;else if(dir==='west')x--;else y--;
        if(x<0||x>6||y<0||y>3)return {...result,x,y,dir,error:'map edge'};
      }
    }
    return {...result,x,y,dir};
  }
  function passes(mission,program){
    const result=simulate(mission,runTeachingProgram(program));
    return !result.error&&Boolean(mission.check(result));
  }
  for(const [level,mission] of missions.entries()){
    const label='Mission '+(level+1)+': '+mission.title;
    assert.equal(passes(mission,mission.solution),true,label+' canonical solution fails');
    assert.equal(passes(mission,mission.starter),false,label+' starter must leave a meaningful change');
    assert.equal(mission.hints.length,2,label+' needs staged conceptual/exact hints');
    assert(mission.explanation.length>35,label+' needs an explanation of what the code did');
    assert.equal(choices[level].length,3,label+' needs three large choices');
    for(const [index,option] of choices[level].entries()){
      assert.equal(typeof option.label,'string',label+' choice label missing');
      assert(option.why.length>30,label+' choice needs specific teaching feedback');
      assert.equal(runTeachingProgram(option.code).ok,true,label+' choice must be valid teaching code');
      assert.equal(passes(mission,option.code),index===0,label+' choice '+(index+1)+' has the wrong result');
    }
  }
  assert.equal(runTeachingProgram('delete self.fetch; say(String(fetch).includes("[native code]") ? "native fetch exposed" : "not native");').ok,false,'The inherited-fetch bypass must be rejected');

  const raw=dom(questHtml),storage={},narrated=[],cues=[],decorated=new WeakSet();
  // Small DOM extensions are local to Code Quest so the old Firefly harness stays intact.
  function decorate(node){
    if(decorated.has(node))return node;decorated.add(node);
    node.append=function(...children){this.children.push(...children);};
    const listen=node.addEventListener.bind(node);
    node.addEventListener=(type,listener)=>{const prior=node.listeners[type];listen(type,prior?event=>{prior(event);listener(event);}:listener);};
    return node;
  }
  const get=id=>decorate(raw.get(id));
  const document={...raw.document,getElementById:get,createElement:tag=>{const node=decorate(element('generated'));node.tagName=tag;return node;}};
  get('energy').children=[element('socket1'),element('socket2'),element('socket3')];
  get('energy').querySelectorAll=()=>get('energy').children;
  const voice={
    enabled:false,latest:'',
    read(value){this.latest=value;if(this.enabled)narrated.push(value);},
    stop(){},isEnabled(){return this.enabled;}
  };
  const effects={enabled:false,enable(){this.enabled=true;return true;},disable(){this.enabled=false;},stop(){},cue(value){if(this.enabled)cues.push(value);}};
  const window={
    CodeQuestMissions:missions,CodeQuestChoices:choices,
    CodeQuestVoice:{init({toggle,replay}){
      toggle.addEventListener('click',()=>{voice.enabled=!voice.enabled;if(voice.enabled&&voice.latest)narrated.push(voice.latest);});
      replay.addEventListener('click',()=>{voice.enabled=true;if(voice.latest)narrated.push(voice.latest);});
      return voice;
    }},
    KiraArcadeVoice:{create:()=>effects},
    addEventListener(){},confirm:()=>true,matchMedia:()=>({matches:true})
  };
  class Worker{
    constructor(){this.onmessage=null;this.onerror=null}
    terminate(){}
    postMessage(data){
      const workerContext={self:{postMessage:message=>this.onmessage?.({data:message})}};
      vm.runInNewContext(sandboxJs,workerContext,{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
      workerContext.self.onmessage({data});
    }
  }
  const context={
    document,window,matchMedia:window.matchMedia,addEventListener(){},
    localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>{storage[k]=v}},
    Worker,setTimeout:()=>4,clearTimeout(){},setInterval:()=>5,clearInterval(){},
  };
  vm.runInNewContext(questJs,context,{timeout:3000,contextCodeGeneration:{strings:false,wasm:false}});
  assert.equal(get('choiceButtons').children.length,3,'First mission must offer big beginner buttons');
  assert.equal(narrated.length,0,'Fresh rendering must not autoplay narration');
  // A wrong no-typing choice does not trap the learner or implicitly enable speech.
  get('choiceButtons').children[1].click();
  assert.equal(get('outputPanel').dataset.state,'error');
  assert.equal(get('nextButton').disabled,true,'Wrong first choice cannot advance');
  assert.equal(narrated.length,0,'Selecting a choice must respect voice off');
  get('voiceToggle').click();
  assert.equal(voice.enabled,true,'Narration begins only after its explicit control');
  get('choiceButtons').children[0].click();
  assert.equal(get('outputPanel').dataset.state,'success');
  assert.equal(get('easyContinue').hidden,false);
  assert(get('stage').classList.contains('is-success'),'Correct choice must visibly celebrate');
  assert(get('outputText').textContent.includes(choices[0][0].why),'Choice feedback explains the result');
  for(let level=1;level<missions.length;level++){
    get('easyContinue').click();
    assert.equal(get('chapterCount').textContent,'Mission '+(level+1)+' of 14','Continue advances exactly one mission');
    assert.equal(get('choiceButtons').children.length,3,'Mission '+(level+1)+' missing choices');
    get('choiceButtons').children[2].click();
    assert.equal(get('outputPanel').dataset.state,'error','Wrong choice must be retryable in mission '+(level+1));
    get('choiceButtons').children[0].click();
    assert.equal(get('outputPanel').dataset.state,'success','Mission '+(level+1)+' not completable');
    assert.equal(get('easyContinue').hidden,false);
    assert(get('stage').classList.contains('is-success'),'Mission '+(level+1)+' needs its success reaction');
  }
  const progress=JSON.parse(storage['kira-code-quest-last-light-v2']);
  assert.equal(progress.cleared.filter(Boolean).length,14);
  assert.equal(get('ending').hidden,false);
  assert(narrated.length>=14,'Enabled voice should narrate each successful chapter');
  assert(cues.includes('win'),'Game needs sound on chapter success');
  // The editor and no-typing buttons share the same bounded interpreter worker.
  assert(questJs.includes('new Worker("sandbox.js?v="+VERSION)'),'Teaching interpreter worker was removed');
  assert(!/new\s+Function\s*\(/.test(sandboxJs),'Player programs must never become host functions');
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
console.log('Animated arcade and Iris voice passed: 14 interpreted Code Quest missions, all 42 choices, no-typing retries/continue, opt-in narration/celebration, and 16 unchanged Firefly paths.');
