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
  require('./test-code-quest-contracts.cjs').runCodeQuestContracts();
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

async function testFirefly(){
  assert.equal(fireflyScripts.length,2,'Standalone game must contain its own voice and story scripts');
  assert(fireflyHtml.includes('.world[data-scene="forest"]')&&fireflyHtml.includes('.world[data-scene="river"]'),'Changing scenery missing');
  assert(fireflyHtml.includes('route-preview'),'Route playback must also be visible beside the mobile controls');
  const endings=new Set();
  for(const gift of ['lantern','compass','spark','moth']){
    // This richer DOM stub is local to Firefly. Do not weaken Code Quest checks.
    const ids=new Set([...fireflyHtml.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
    const roots=new Map(),spoken=[],events={};
    class StoryElement{
      constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.style={};this.attributes={};this.listeners={};this.className='';this.hidden=false;this.disabled=false;this.textContent='';this.id='';this.offsetWidth=10;
        this.classList={add:c=>{if(!this.classList.contains(c))this.className+=' '+c;},remove:c=>{this.className=this.className.split(' ').filter(x=>x!==c).join(' ');},contains:c=>this.className.split(' ').includes(c),toggle:(c,on)=>{if(on)this.classList.add(c);else this.classList.remove(c);}};
      }
      append(...children){for(const child of children){this.children.push(child);child.parent=this;}}
      appendChild(child){this.append(child);return child;}
      replaceChildren(...children){this.children=[];this.append(...children);}
      addEventListener(name,fn){this.listeners[name]=fn;}
      setAttribute(name,value){this.attributes[name]=String(value);}
      click(){if(!this.disabled)this.listeners.click?.({preventDefault(){}});}
      focus(){}scrollIntoView(){}getBoundingClientRect(){return {top:5};}
      remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
      all(){return this.children.flatMap(child=>[child,...child.all()]);}
      querySelector(selector){return this.all().find(child=>{
        const attr=selector.match(/^\[data-([\w-]+)(?:="([^"]+)")?\]$/);
        if(attr){const value=child.dataset[attr[1]];return attr[2]?value===attr[2]:value!==undefined;}
        if(selector.startsWith('.'))return child.classList.contains(selector.slice(1));
        if(selector==='button:not(:disabled)')return child.tagName==='button'&&!child.disabled;
        if(selector==='button.primary')return child.tagName==='button'&&child.classList.contains('primary');
        return selector==='button'&&child.tagName==='button';
      })||null;}
    }
    const get=id=>{
      if(ids.has(id)){if(!roots.has(id)){const el=new StoryElement();el.id=id;roots.set(id,el);}return roots.get(id);}
      return [...roots.values()].flatMap(el=>el.all()).find(el=>el.id===id)||null;
    };
    const content=new StoryElement();
    const document={hidden:false,getElementById:get,createElement:tag=>new StoryElement(tag),querySelector:()=>content,addEventListener:(name,fn)=>{events[name]=fn;}};
    const voices=[{name:'Microsoft Jenny Online (Natural)',lang:'en-US'}];
    const synth={getVoices:()=>voices,speak:utter=>{spoken.push(utter);utter.onstart?.();},cancel(){}};
    const window={speechSynthesis:synth,SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},AudioContext:undefined,webkitAudioContext:undefined};
    const ctx=vm.createContext({document,window,matchMedia:()=>({matches:true}),addEventListener:(name,fn)=>{events[name]=fn;},setTimeout:(fn,ms)=>setTimeout(fn,ms<1000?0:ms),clearTimeout});
    for(const script of fireflyScripts)vm.runInContext(script,ctx,{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
    const read=code=>vm.runInContext(code,ctx,{timeout:1000});
    assert.equal(get('choices').children.length,0,'Fresh game waits for explicit voice/quiet start');
    assert.equal(spoken.length,0,'Fresh game cannot autoplay speech');
    assert.equal(get('fireflySwarm').children.length,3,'Keep the three animated fireflies');
    get('fireflySwarm').children[0].click();assert.equal(read('rescued.length'),0,'Cannot rescue before the mission starts');
    get('playSound').click();
    assert(spoken.length>0,'Explicit Start should request narration');
    assert.equal(spoken[0].voice.name,'Microsoft Jenny Online (Natural)');assert.equal(spoken[0].rate,.96);assert.equal(spoken[0].pitch,1);
    get('choices').children[['lantern','compass'].includes(gift)?0:1].click();
    get('choices').children[['lantern','spark'].includes(gift)?0:1].click();
    assert.equal(read('currentScene'),'trail');assert.equal(get('choices').children.length,0,'Cannot click through the rescue');
    get('fireflySwarm').children[0].click();
    assert(get('fireflySwarm').children[0].classList.contains('is-caught'),'Rescued firefly leaves the scene');
    get('fireflySwarm').children[0].click();assert.equal(read('rescued.length'),1,'Double click cannot duplicate a rescue');
    get('fireflySwarm').children[1].click();assert.equal(read('rescued.length'),gift==='moth'?3:2,'Moth helps find the last firefly');
    if(gift!=='moth')get('fireflySwarm').children[2].click();
    assert.equal(read('rescued.length'),3);get('choices').children[0].click();
    assert.equal(read('currentScene'),'river');assert.equal(read('plan.length'),gift==='compass'?1:0,'Compass supplies one safe step');
    // The old 16 four-click auto-wins were the reported bug. Enumerate every
    // three-command plan instead: exactly one of 64 is a successful crossing.
    for(const a of ['leaf','moon','star','sun'])for(const b of ['leaf','moon','star','sun'])for(const c of ['leaf','moon','star','sun']){
      read('route=["moon","star","leaf"];plan='+JSON.stringify([a,b,c])+';crossed=false;busy=false;');
      await read('testRoute()');assert.equal(read('crossed'),a==='moon'&&b==='star'&&c==='leaf','Only the matching route may cross');
    }
    read('plan=["moon","sun","sun"];crossed=false;busy=false;');await read('testRoute()');
    assert.equal(JSON.stringify(read('plan')),'["moon"]','Wrong step keeps the correct prefix and gives a retry');
    assert.equal(read('rescued.length'),3,'A mistaken route never loses a rescued friend');
    read('plan=route.slice();attempts=0;');await Promise.all([read('testRoute()'),read('testRoute()')]);assert.equal(read('attempts'),1,'Repeated Play cannot start overlapping crossings');
    assert.equal(get('routePreview')?.attributes['aria-label'],'Wisp has crossed 3 of 3 safe steps','Completed mobile route stays visible');
    assert.equal(get('routeFox')?.style.left,'92%','Final Wisp position is retained at the third stone');
    get('choices').children[0].click();assert.equal(read('currentScene'),'hill');assert.equal(read('lightLoaded'),gift==='spark','Spark powers the beacon immediately');
    for(let mask=0;mask<8;mask++){
      read('endingText="";lightLoaded='+Boolean(mask&1)+';shutterOpen='+Boolean(mask&2)+';beamTarget='+JSON.stringify(mask&4?'village':'forest')+';testBeacon();');
      assert.equal(read('Boolean(endingText)'),mask===7,'Beacon needs power AND an open shutter AND correct direction');
    }
    assert.equal(get('world').dataset.scene,'ending');assert.equal(get('final').hidden,false);assert.equal(get('restart').hidden,false);
    endings.add(read('endingText'));get('restart').click();
    assert.equal(read('currentScene'),'start');assert.equal(get('bag').textContent,'Backpack: empty');
    assert.equal(JSON.stringify(read('[rescued,route,plan,endingText,crossed,lightLoaded,shutterOpen,attempts]')),'[[],[],[],"",false,false,false,0]','Replay resets all challenge state');
    get('voiceToggle').click();const count=spoken.length;get('choices').children[0].click();assert.equal(spoken.length,count,'Scene changes respect explicit mute');
  }
  assert.equal(endings.size,4,'The four tools produce distinct earned endings');
}

testQuest();
testSharedVoice();
testFirefly().then(()=>console.log('Animated arcade and Iris voice passed: 14 interpreted Code Quest missions, all 42 choices, no-typing retries/continue, opt-in narration/celebration, and four earned Firefly endings with 256 route checks and 32 beacon configurations.')).catch(error=>{console.error(error);process.exitCode=1;});
