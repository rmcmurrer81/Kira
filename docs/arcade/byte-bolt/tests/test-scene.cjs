/* Logic/geometry smoke checks, not a substitute for real browser visual QA. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const C=require('../core.js');
const source=fs.readFileSync(path.join(__dirname,'../scene.js'),'utf8');

function harness(geometry=false){
 const elements={},listeners={},bodyChildren=[];let nextFrame,clock=100,draws=0;
 class Element{
  constructor(tag='div'){this.tagName=tag;this.style={};this.dataset={};this.hidden=false;this.children=[];this.width=0;this.height=0;}
  set innerHTML(s){this.html=s;if(s.includes('<b '))this.parts={b:new Element('b'),span:new Element('span')};if(s.includes('Zoom out'))this.parts={buttons:[new Element('button'),new Element('button')],output:new Element('output')};}
  get innerHTML(){return this.html||'';}
  setAttribute(k,v){this[k]=v;}
  getAttribute(k){return this[k];}
  appendChild(e){this.children.push(e);bodyChildren.push(e);}
  querySelector(s){return this.parts?.[s]||null;}
  querySelectorAll(s){return s==='button'?this.parts?.buttons||[]:[];}
  addEventListener(name,fn){(this.listeners||(this.listeners={}))[name]=fn;}
  setPointerCapture(){}
  getContext(k){return k==='webgl'?null:{setTransform(){},fillRect(){},beginPath(){},moveTo(x,y){assert(Number.isFinite(x)&&Number.isFinite(y));},lineTo(x,y){assert(Number.isFinite(x)&&Number.isFinite(y));},closePath(){},fill(){draws++;}};}
 }
 for(const id of ['world','fallback','interact'])elements[id]=new Element(id==='world'?'canvas':'div');
 const labels=Object.fromEntries(['yard','lab','store'].map(k=>['.label-'+k,new Element()]));
 const touch=Object.fromEntries(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].map(key=>{const e=new Element('button');e.dataset.key=key;return [key,e];}));
 const document={hidden:false,head:new Element(),body:new Element(),createElement:t=>new Element(t),getElementById:id=>elements[id],querySelector:q=>labels[q],querySelectorAll:q=>q==='[data-key]'?Object.values(touch):[],addEventListener(name,fn){(this.listeners||(this.listeners={}))[name]=fn;}};
 const state=C.fresh();Object.defineProperty(state,'npcJobs',{get:()=>C.questStatus(state).npcJobs});
 const window={console,document,innerWidth:1280,innerHeight:800,devicePixelRatio:1,Float32Array,Math,Map,Set,Number,Object,Array,String,TownCore:C,townState:state,townPaused:false,matchMedia:()=>({matches:false}),requestAnimationFrame:f=>nextFrame=f,addEventListener:(e,f)=>listeners[e]=f,dispatchEvent:e=>{window.event=e;},CustomEvent:class{constructor(type,props){this.type=type;this.detail=props.detail;}}};window.window=window;
 // Capture polygons before visibility culling to verify the complete body in every heading.
 let code=source;
 if(geometry){window.recorded=[];code=code.replace(' const a=points[0],b=points[1]', ' if(window.recording)window.recorded.push({points,layer,colour});\n const a=points[0],b=points[1]');code=code.replace('\n})();', "\n window.testHuman=(heading,isPlayer=true)=>{geo=newGeo();window.recorded=[];window.recording=true;human(2,3,'#d3ad60',.8,0,isPlayer,heading);window.recording=false;return window.recorded;};\n})();");}
 vm.runInNewContext(code,window);
 const tick=()=>nextFrame(clock+=40);tick();
 const markers=Object.fromEntries(bodyChildren.filter(e=>e.className==='town-job-marker').map(e=>[e.dataset.npc,e]));
 return {window,state,scene:window.TownScene,markers,listeners,touch,tick,get draws(){return draws;}};
}
function complete(h,id){
 const j=C.jobs.find(j=>j.id===id);C.accept(h.state,id);if(!h.state.inventory.includes(j.part))C.buy(h.state,j.part);
 const c=C.challenge(id),answer=c.kind==='resistor'?{minimum:c.circuit.min,resistance:c.circuit.resistance,current:(c.circuit.supplyV-c.circuit.ledV)/c.circuit.resistance*1000}:c.example;
 assert(C.complete(h.state,id,answer).passed);h.tick();
}

test('scene builds detailed shared 3D polygons and projects finite coordinates without WebGL',()=>{
 const h=harness(),info=h.scene.getMapInfo();assert.equal(info.renderer,'canvas3d');assert(info.staticFaces>2000);assert(h.draws>1000);
 assert.equal(info.buildings.length,10);assert.equal(info.districts.length,4);
 for(const stop of Object.values(h.scene.stops)){const p=h.scene.project(stop.x,2,stop.z);assert(Number.isFinite(p.x)&&Number.isFinite(p.y));}
});
test('map recovers imported positions inside buildings, pond, old bounds, and invalid coordinates',()=>{
 const h=harness(),s=h.scene;
 for(const [x,z] of [[20,20],[-20,-20],[9.5,0],[-5,0],[15,-12],[-14,-1.2],[Infinity,NaN],[300,300]]){
  s.player.x=x;s.player.z=z;h.tick();assert(s.isWalkable(s.player.x,s.player.z),`Could not recover ${x}, ${z}`);
 }
 h.window.townPaused=true;s.player.x=-5;s.player.z=0;h.tick();assert(s.isWalkable(s.player.x,s.player.z),'Import also recovers while its dialog is open');
 assert(s.isWalkable(20,20));assert(!s.isWalkable(20.01,20));
});
test('camera controls and keyboard movement preserve all three arrival destinations',()=>{
 const h=harness(),s=h.scene;h.listeners.keydown({key:'D',preventDefault(){}});const before=s.player.x;h.tick();h.listeners.keyup({key:'D'});assert(s.player.x>before,'Uppercase WASD is supported');
 for(const id of ['yard','store','lab']){assert(s.go(id));assert(s.isWalkable(s.player.x,s.player.z));assert.equal(h.window.event.detail,id);}
 assert.equal(s.go('unknown'),false);s.setZoom(10);assert.equal(s.zoom,1.6);s.setZoom(.01);assert.equal(s.zoom,.7);s.setZoom(1);assert.equal(s.zoom,1);
});
test('NPC markers disappear and return for later jobs, but never for completed practice',()=>{
 const h=harness(),s=h.scene;s.go('yard');h.tick();assert.equal(h.markers.yard.querySelector('span').textContent,'NEW JOB');assert(!h.markers.yard.hidden);
 C.accept(h.state,'robot');h.tick();assert.equal(h.markers.yard.querySelector('span').textContent,'JOB ACTIVE');
 h.window.townPaused=true;h.tick();assert(Object.values(h.markers).every(e=>e.hidden));h.window.townPaused=false;
 complete(h,'robot');assert(h.markers.yard.hidden);s.go('lab');h.tick();assert(!h.markers.lab.hidden);
 complete(h,'light');assert(h.markers.lab.hidden);s.go('yard');h.tick();assert(!h.markers.yard.hidden);assert.equal(h.markers.yard.querySelector('span').textContent,'NEW JOB');
 for(const j of C.jobs.slice(2))complete(h,j.id);assert(Object.values(h.markers).every(e=>e.hidden));
 const practice=C.challenge('robot',1);assert(C.complete(h.state,'robot',practice.example,1).passed);h.tick();assert(Object.values(h.markers).every(e=>e.hidden));
});

const close=(a,b,message)=>assert(Math.abs(a-b)<1e-8,`${message||'Mismatch'}: ${a} vs ${b}`);
function press(h,keys){for(const key of keys)h.listeners.keydown({key,preventDefault(){}});}
function release(h,keys){for(const key of keys)h.listeners.keyup({key});}
function facingMovement(h,x,z){const p=h.scene.player,dx=p.x-x,dz=p.z-z,n=Math.hypot(dx,dz);assert(n>0);close(Math.sin(h.scene.facing),dx/n,'Facing X');close(Math.cos(h.scene.facing),dz/n,'Facing Z');}
test('all eight keyboard directions face actual displacement and retain heading at rest',()=>{
 const h=harness(),s=h.scene;
 for(const keys of [['ArrowUp'],['ArrowDown'],['ArrowLeft'],['ArrowRight'],['w','a'],['w','d'],['s','a'],['s','d']]){
  s.player.x=0;s.player.z=5;press(h,keys);h.tick();facingMovement(h,0,5);release(h,keys);const heading=s.facing;h.tick();close(s.facing,heading,'Idle heading');
 }
 assert.deepEqual(Object.keys(s.player).sort(),['x','z'],'Saved player shape stays compatible');
});
test('touch directions and diagonals share heading logic; cancelling touch stops motion',()=>{
 const h=harness(),s=h.scene;
 for(const keys of [['ArrowUp'],['ArrowDown'],['ArrowLeft'],['ArrowRight'],['ArrowUp','ArrowRight']]){
  s.player.x=0;s.player.z=5;for(const key of keys)h.touch[key].listeners.pointerdown({pointerId:1});h.tick();facingMovement(h,0,5);
  for(const key of keys)h.touch[key].listeners.pointercancel();const {x,z}=s.player,heading=s.facing;h.tick();close(s.player.x,x);close(s.player.z,z);close(s.facing,heading);
 }
});
test('collision sliding faces the surviving axis and fully blocked or paused movement retains heading',()=>{
 const h=harness(),s=h.scene;
 for(const [x,z,key] of [[20,4,'ArrowRight'],[0,20,'ArrowDown'],[-3.27,0,'ArrowLeft']]){
  assert(s.isWalkable(x,z));s.player.x=x;s.player.z=z;press(h,[key]);h.tick();facingMovement(h,x,z);release(h,[key]);
 }
 s.player.x=20;s.player.z=20;const heading=s.facing;press(h,['ArrowDown']);h.tick();close(s.player.x,20);close(s.player.z,20);close(s.facing,heading);release(h,['ArrowDown']);
 h.window.townPaused=true;press(h,['w']);h.tick();close(s.facing,heading);
});
test('visiting each destination turns toward its NPC and keeps that heading while stopped',()=>{
 const h=harness(),s=h.scene;
 for(const id of ['yard','store','lab']){s.go(id);const stop=s.stops[id],p=s.player,a=Math.atan2(stop.x-p.x,stop.z-p.z);close(s.facing,a);h.tick();close(s.facing,a);}
});
test('every player body polygon rotates around the feet while shadows and NPC geometry stay unchanged',()=>{
 const h=harness(true),body=h.window.testHuman(0),npc=JSON.stringify(h.window.testHuman(0,false));assert(body.length>100);
 for(const a of [Math.PI/4,Math.PI/2,Math.PI,-Math.PI/2]){
  const rotated=h.window.testHuman(a);assert.equal(rotated.length,body.length);
  body.forEach((f,i)=>f.points.forEach((p,j)=>{const q=rotated[i].points[j],dx=p[0]-2,dz=p[2]-3;
   close(q[0],f.layer<0?p[0]:2+dx*Math.cos(a)+dz*Math.sin(a),'Rotated body X');close(q[1],p[1],'Height');close(q[2],f.layer<0?p[2]:3-dx*Math.sin(a)+dz*Math.cos(a),'Rotated body Z');
  }));
  assert.equal(JSON.stringify(h.window.testHuman(a,false)),npc,'NPC remains in its original orientation after rendering player');
 }
});
