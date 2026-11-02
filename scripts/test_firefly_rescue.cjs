const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const localHtml=fs.existsSync(path.join(__dirname,'your-first-game.html'))?path.join(__dirname,'your-first-game.html'):path.resolve(__dirname,'../docs/arcade/code-quest/your-first-game.html');
const url=process.env.TEST_URL||pathToFileURL(localHtml).href;
(async()=>{
 const browser=await chromium.launch({...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:process.platform==='win32'?{channel:'msedge'}:{executablePath:'/usr/bin/chromium'}),headless:true,args:['--no-sandbox']});
 const errors=[];const results=[];
 async function pageSetup(opts={}){
  const p=await browser.newPage({viewport:opts.mobile?{width:375,height:812}:{width:1100,height:1000},reducedMotion:opts.motion?'no-preference':'reduce'});
  p.on('pageerror',e=>errors.push(e.message));
  if(opts.mock!==false)await p.addInitScript(({unsupported,silent})=>{
   window.__audioCalls=[];window.__voiceEvents=[];
   if(unsupported){Object.defineProperty(window,'speechSynthesis',{value:undefined});return;}
   class Utterance{constructor(text){this.text=text;}}
   let pending=[];
   const synth={getVoices(){return [{name:'Microsoft Jenny Online (Natural) - English (United States)',lang:'en-US'},{name:'Other',lang:'en-US',default:true}]},cancel(){for(const t of pending)clearTimeout(t);pending=[];window.__voiceEvents.push('cancel');},speak(u){window.__audioCalls.push({text:u.text,name:u.voice?.name,rate:u.rate,pitch:u.pitch,volume:u.volume});if(!silent){pending.push(setTimeout(()=>{u.onstart?.();window.__voiceEvents.push('start');},5));pending.push(setTimeout(()=>{u.onend?.();window.__voiceEvents.push('end');},40));}}};
   Object.defineProperty(window,'SpeechSynthesisUtterance',{value:Utterance});Object.defineProperty(window,'speechSynthesis',{value:synth});
  },opts);
  await p.goto(url);return p;
 }
 async function chooseGift(p,gift){
  await p.getByRole('button',{name:'Start quietly',exact:true}).click();
  await p.getByRole('button',{name:gift==='lantern'||gift==='compass'?/Visit the lantern-maker/:/Follow the forest trail/}).click();
  const choices={lantern:/Take the warm lantern/,compass:/Take the brass compass/,spark:/Carry the storm-spark/,moth:/Give the moon moth a ride/};
  await p.getByRole('button',{name:choices[gift]}).click();
 }
 async function rescueAll(p){
  for(const name of ['Pip','Fern','Luma']){const b=p.locator('#challenge').getByRole('button',{name:'Guide '+name+' to safety',exact:true});if(await b.count())await b.click();}
  await p.getByRole('button',{name:/Bring the fireflies to the river/}).click();
 }
 async function solveRiver(p){
  const route=await p.evaluate(()=>route.slice());let current=await p.evaluate(()=>plan.length);
  for(let i=current;i<3;i++)await p.locator('[data-command="'+route[i]+'"]').click();
  await p.getByRole('button',{name:'▶ Try this route',exact:true}).click();
  await p.getByRole('button',{name:/Climb with everyone/}).waitFor();
  await p.getByRole('button',{name:/Climb with everyone/}).click();
 }
 for(const gift of ['lantern','compass','spark','moth']){
  const p=await pageSetup();await chooseGift(p,gift);
  assert.equal(await p.getByRole('button',{name:/Bring the fireflies to the river/}).count(),0,'cannot skip rescue');
  assert.equal(await p.locator('#final').isVisible(),false);
  if(gift==='lantern')assert.equal(await p.locator('.firefly').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await rescueAll(p);assert.equal(await p.evaluate(()=>rescued.length),3);
  assert.equal(await p.evaluate(()=>plan.length),gift==='compass'?1:0);
  if(gift==='lantern'){
   // A random repeated command cannot pass. Feedback preserves only correct prefix.
   const route=await p.evaluate(()=>route.slice());const wrong=await p.evaluate(()=>symbols.find(s=>s.id!==route[0]).id);
   for(let i=0;i<3;i++)await p.locator('[data-command="'+wrong+'"]').click();
   await p.getByRole('button',{name:'▶ Try this route',exact:true}).click();
   await p.waitForFunction(()=>!busy);
   assert.equal(await p.evaluate(()=>crossed),false);assert.equal(await p.evaluate(()=>plan.length),0);
   assert.match(await p.locator('#feedback').innerText(),/stopped safely at step 1/);
   // Correct prefix remains after a later error; no loss of collected fireflies.
   await p.locator('[data-command="'+route[0]+'"]').click();await p.locator('[data-command="'+route[0]+'"]').click();await p.locator('[data-command="'+route[0]+'"]').click();
   await p.getByRole('button',{name:'▶ Try this route',exact:true}).click();await p.waitForFunction(()=>!busy);
   assert.equal(await p.evaluate(()=>plan.length),1);assert.equal(await p.evaluate(()=>rescued.length),3);
   await p.getByRole('button',{name:'↶ Undo step',exact:true}).click();assert.equal(await p.evaluate(()=>plan.length),0);
  }
  await solveRiver(p);assert.equal(await p.evaluate(()=>lightLoaded),gift==='spark');
  await p.getByRole('button',{name:'✦ Test the beacon',exact:true}).click();assert.equal(await p.locator('#final').isVisible(),false);
  assert.match(await p.locator('#feedback').innerText(),gift==='spark'?/closed shutter/:/no power/);
  if(gift!=='spark')await p.getByRole('button',{name:'Add the light source',exact:true}).click();
  await p.getByRole('button',{name:'Open the shutter',exact:true}).click();
  await p.getByRole('button',{name:'✦ Test the beacon',exact:true}).click();assert.match(await p.locator('#feedback').innerText(),/forest, not home/);
  await p.getByRole('button',{name:'Aim toward the village',exact:true}).click();assert.equal(await p.locator('#world').getAttribute('data-beam'),'home');
  await p.getByRole('button',{name:'✦ Test the beacon',exact:true}).click();assert.equal(await p.locator('#final').isVisible(),true);
  assert.match(await p.locator('#story').innerText(),/Pip, Fern and Luma flutter safely home/);
  await p.screenshot({path:path.join(__dirname,'ending-'+gift+'.png'),fullPage:true});
  await p.getByRole('button',{name:/Play from the beginning/}).click();
  assert.equal(await p.evaluate(()=>currentScene),'start');assert.deepEqual(await p.evaluate(()=>[backpack,rescued,route,plan,endingText,crossed,lightLoaded,shutterOpen,attempts]),[[],[],[],[],'',false,false,false,0]);
  results.push(gift+': rescue gate, tool advantage, river solution, beacon failure/recovery, unique ending, full restart PASS');await p.close();
 }
 const a=await pageSetup();await a.getByRole('button',{name:/Start adventure with Iris voice/}).click();
 await a.waitForTimeout(120);assert.ok((await a.evaluate(()=>window.__audioCalls)).length>0);
 assert.ok((await a.evaluate(()=>window.__audioCalls)).every(c=>/Jenny/.test(c.name)&&c.rate===.96&&c.pitch===1&&c.volume===1));
 await a.getByRole('button',{name:/Mute sound/}).click();const count=await a.evaluate(()=>window.__audioCalls.length);
 await a.getByRole('button',{name:/Visit the lantern-maker/}).click();await a.waitForTimeout(100);assert.equal(await a.evaluate(()=>window.__audioCalls.length),count);
 await a.getByRole('button',{name:/Hear scene again/}).click();await a.waitForTimeout(60);assert.ok(await a.evaluate(()=>window.__audioCalls.length)>count);
 results.push('Mocked voice: Iris priorities/settings, explicit start, mute stops next scene, replay re-enables PASS (not audible proof)');await a.close();
 const u=await pageSetup({unsupported:true});await u.getByRole('button',{name:/Start adventure with Iris voice/}).click();assert.match(await u.locator('#voiceStatus').innerText(),/unavailable/);await u.getByRole('button',{name:/Follow the forest trail/}).click();assert.equal(await u.evaluate(()=>currentScene),'forest');results.push('Unsupported speech: honest status and continued gameplay PASS');await u.close();
 const silent=await pageSetup({silent:true});await silent.getByRole('button',{name:/Start adventure with Iris voice/}).click();await silent.waitForTimeout(7200);assert.match(await silent.locator('#voiceStatus').innerText(),/Voice did not play/);results.push('Speech start watchdog: non-starting engine reports failure, no false speaking status PASS');await silent.close();
 const m=await pageSetup({mobile:true,motion:true});await chooseGift(m,'moth');assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await m.screenshot({path:path.join(__dirname,'mobile-grove.png'),fullPage:true});
 assert.notEqual(await m.locator('.firefly').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 await rescueAll(m);await m.screenshot({path:path.join(__dirname,'mobile-river.png'),fullPage:true});assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);results.push('375px mobile: no horizontal overflow, visible animation and stable-button alternative PASS');await m.close();
 const r=await pageSetup({mock:false});const real=await r.evaluate(()=>({speech:!!window.speechSynthesis,voices:window.speechSynthesis?.getVoices().map(v=>v.name)}));results.push('Local Chromium actual speech availability: '+JSON.stringify(real)+'; audible playback not claimed');await r.screenshot({path:path.join(__dirname,'desktop-intro.png'),fullPage:true});await r.close();
 assert.deepEqual(errors,[],'No browser JS errors');results.push('Browser JavaScript errors: 0');
 fs.writeFileSync(path.join(__dirname,'qa-results.json'),JSON.stringify({url,results,errors},null,2));console.log(results.join('\n'));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
