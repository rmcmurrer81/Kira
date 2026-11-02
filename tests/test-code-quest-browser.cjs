'use strict';
/* Actual-browser quest and rendered-world QA. Player programs only reach the
 * bounded worker. All requests stay on the loopback static server. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
function loadBrowser(){
  const names=[process.env.PLAYWRIGHT_MODULE,'playwright','playwright-core'];
  if(process.platform==='win32')names.push(path.join(os.homedir(),'Kira','Avatar','runtime3d','node_modules','playwright-core'));
  for(const name of names.filter(Boolean)){try{return require(name);}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}}
  throw new Error('Set PLAYWRIGHT_MODULE to an existing Playwright installation.');
}
const {chromium}=loadBrowser(),docs=path.resolve(__dirname,'../docs');
const output=process.env.QA_OUTPUT||path.resolve(__dirname,'../qa/code-quest-stoneward');
const STORE='kira-code-quest-stoneward-v3';
const executablePath=process.env.CHROMIUM_PATH||(process.platform==='win32'?'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe':'/usr/bin/chromium');
const stats={assertions:0,mainRoutes:0,alternativeRoutes:0,hostilePrograms:0,screenshots:[],animationEvidence:{},renderers:[],creatureArchetypes:[]};
const sourceNames=['index.html','game.css','game.js','scene.js','scene-fallback.js','missions.js','encounters.js','quest-state.js','choices.js','voice.js','sandbox.js','vendor/three.module.min.js','vendor/three.core.min.js','../arcade-voice.js'];
const sourceHashes=()=>Object.fromEntries(sourceNames.map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(docs,'arcade/code-quest',name))).digest('hex')]));
const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);stats.assertions++;};
const match=(actual,expected,label)=>{assert.match(actual,expected,label);stats.assertions++;};
const server=http.createServer((req,res)=>{
  let file;
  try{file=path.resolve(docs,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch(_){res.writeHead(400);res.end();return;}
  if(!file.startsWith(docs+path.sep)){res.writeHead(403);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
});
function pngPixels(buffer){
  const parts=[];let width,height,type;
  for(let at=8;at<buffer.length;){const size=buffer.readUInt32BE(at),name=buffer.toString('ascii',at+4,at+8),data=buffer.subarray(at+8,at+8+size);if(name==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);check(data[8],8,'Screenshot uses 8-bit pixels');type=data[9];}if(name==='IDAT')parts.push(data);at+=12+size;}
  const channels=type===6?4:type===2?3:0;assert(channels,'Unsupported screenshot PNG color type '+type);
  const packed=zlib.inflateSync(Buffer.concat(parts)),stride=width*channels,pixels=Buffer.alloc(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++){const filter=packed[y*(stride+1)];for(let x=0;x<stride;x++){const value=packed[y*(stride+1)+1+x],a=x>=channels?pixels[y*stride+x-channels]:0,b=y?pixels[(y-1)*stride+x]:0,c=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0;pixels[y*stride+x]=(value+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):filter===4?paeth(a,b,c):NaN))&255;}}
  return {width,height,channels,pixels};
}
function pixelDifference(a,b){
  const left=pngPixels(a),right=pngPixels(b);check([left.width,left.height,left.channels],[right.width,right.height,right.channels],'Animation frame dimensions stay constant');
  // Exclude top/bottom status overlays: differences must come from the rendered
  // room, rather than changed captions or energy labels.
  let changed=0,examined=0;for(let y=Math.ceil(left.height*.18);y<left.height*.89;y++)for(let x=0;x<left.width;x++){const at=(y*left.width+x)*left.channels;examined++;if([0,1,2].some(i=>Math.abs(left.pixels[at+i]-right.pixels[at+i])>10))changed++;}
  return changed/examined;
}
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const startingSources=sourceHashes();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port,url=origin+'/arcade/code-quest/';
  const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const errors=[],unexpected=[];
  async function context(options={}){
    const ctx=await browser.newContext(options);
    await ctx.route('**/*',route=>{const u=route.request().url();if(!u.startsWith(origin+'/')){unexpected.push(u);return route.abort();}return route.continue();});
    ctx.on('page',page=>page.on('pageerror',error=>errors.push(String(error))));return ctx;
  }
  async function mockSpeech(ctx){
    await ctx.addInitScript(()=>{
      window.__speechCalls=[];const voices=[{name:'Microsoft Jenny Online (Natural)',lang:'en-US',default:false},{name:'Microsoft David',lang:'en-US',default:true}];
      const synth={getVoices:()=>voices,addEventListener(){},cancel(){},speak(utter){window.__speechCalls.push({text:utter.text,voice:utter.voice?.name,rate:utter.rate,pitch:utter.pitch,volume:utter.volume});utter.onstart?.();queueMicrotask(()=>utter.onend?.());}};
      Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(text){this.text=text;}}});
      Object.defineProperty(window,'AudioContext',{configurable:true,value:undefined});Object.defineProperty(window,'webkitAudioContext',{configurable:true,value:undefined});
    });
  }
  async function ready(page){
    await page.waitForFunction(()=>window.CodeQuestWorld?.snapshot&&window.CodeQuestWorld.snapshot().mode!=='loading'&&document.querySelector('#sceneTitle')?.textContent&&document.querySelector('#routeChoices')?.children.length===2,null,{timeout:20000});
    await page.waitForFunction(()=>document.querySelector('#worldArt canvas')?.width>0);
  }
  const snapshot=page=>page.evaluate(()=>window.CodeQuestWorld.snapshot());
  const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),STORE);
  const room=async page=>{const data=await saved(page);return data.rooms[data.level];};
  const mission=page=>page.locator('#chapterCount').innerText();
  async function idle(page){await page.waitForFunction(()=>!document.querySelector('#stage').classList.contains('is-running')&&![...document.querySelectorAll('#routeChoices button')].some(button=>button.disabled),null,{timeout:25000});}
  async function gate(page,expected){check(await page.locator('#gateStatus').getAttribute('data-state'),expected,'Quest gate reports '+expected);}
  async function choose(page,index){
    await page.locator('#routeChoices button').nth(index).click();await idle(page);
    await page.waitForFunction(()=>!document.querySelector('#runButton').disabled,null,{timeout:15000});
    await gate(page,'blocked');check((await room(page)).phase,'encounter','Selecting a passage starts its required encounter');
  }
  async function result(page,expected='success'){
    await page.waitForFunction(()=>!document.querySelector('#stage').classList.contains('is-running')&&['success','error'].includes(document.querySelector('#outputPanel').dataset.state),null,{timeout:30000});
    check(await page.locator('#outputPanel').getAttribute('data-state'),expected,await page.locator('#outputText').innerText());
  }
  async function run(page,code,expected='success'){
    if(code!==undefined)await page.locator('#codeInput').fill(code);
    await page.locator('#runButton').click();await result(page,expected);
  }
  const solution=(page,index)=>page.evaluate(i=>window.CodeQuestMissions[i].solution,index);
  async function noOverflow(page){check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'World and quest UI have no horizontal overflow');}
  async function unobstructed(page,selector){await page.locator(selector).scrollIntoViewIfNeeded();check(await page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el||el.contains(hit);}),true,selector+' is accessible');}
  async function contrast(page,selector){
    const ratio=await page.locator(selector).evaluate(el=>{const style=getComputedStyle(el),rgb=v=>(v.match(/[\d.]+/g)||[]).slice(0,3).map(Number),luma=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const f=luma(rgb(style.color)),b=luma(rgb(style.backgroundColor));return (Math.max(f,b)+.05)/(Math.min(f,b)+.05);});
    check(ratio>=4.5,true,selector+' has readable contrast ('+ratio.toFixed(2)+':1)');return ratio;
  }
  async function shot(page,name,selector){
    const filename=path.join(output,name+'.png');let png;
    if(selector)png=await page.locator(selector).screenshot({path:filename});
    else{await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});png=await page.screenshot({path:filename,fullPage:true});}
    stats.screenshots.push(filename);return png;
  }
  async function frame(page,name){const state=await snapshot(page),png=await shot(page,name,'#worldArt');return {state,png};}
  async function blockedProgress(page,index){
    check(await page.locator('#nextButton').isDisabled(),true,'Code must clear the current passage before Next');
    check(await page.locator('#easyContinue').isVisible(),false,'No large Continue before the gate is clear');
    if(index<13){check(await page.locator('#journeyMap button').nth(index+1).isDisabled(),true,'The journey map cannot skip an unsolved passage');await page.locator('#journeyMap button').nth(index+1).evaluate(el=>el.dispatchEvent(new Event('click')));}
    await page.locator('#nextButton').evaluate(el=>el.dispatchEvent(new Event('click')));
    check(await mission(page),'Mission '+(index+1)+' of 14','Unsolved passage cannot be skipped by navigation handlers');
  }
  async function credit(page,index){
    const data=await saved(page),expected=await page.evaluate(i=>window.CodeQuestMissions[i].quest,index);
    check(data.inventory.length,index+1,'Each room gives one unique quest reward');check(data.inventory.includes(expected.reward.id),true,'The earned quest part is in the inventory');
    check(data.defense,expected.defense,'Town defense follows the recovered quest parts');match(await page.locator('#defenseLabel').innerText(),new RegExp('^'+expected.defense+'%$'),'Town protection is visible');
    check((await room(page)).phase,'cleared','Code actually clears the active route');await gate(page,'cleared');check(await page.locator('#nextButton').isEnabled(),true,'Cleared route permits Continue');
  }
  async function waitAction(page,action,low=.15,high=.78){await page.waitForFunction(({action,low,high})=>{const s=window.CodeQuestWorld.snapshot();return s.action===action&&s.frameProgress>low&&s.frameProgress<high;},{action,low,high},{timeout:20000});}
  try{
    // A normal-motion desktop run supplies real geometry/joint/pixel evidence.
    const desktop=await context({viewport:{width:1440,height:1050}});
    const page=await desktop.newPage();await page.goto(url);await ready(page);
    check(await mission(page),'Mission 1 of 14','Fresh Stoneward quest');await gate(page,'junction');await blockedProgress(page,0);
    check((await saved(page)).inventory,[],'Route text does not award equipment');check((await saved(page)).defense,0,'Town protection begins at zero');
    const initial=await snapshot(page);stats.renderers.push(initial.mode);check(initial.mode,'webgl','Desktop evidence uses the actual locally vendored Three.js renderer');
    check(initial.threat.visible,true,'The approaching storm threat is present at the beginning');
    check(await page.locator('#worldArt canvas').count(),1,'One persistent rendered world');
    check(initial.renderer.triangles>1000&&initial.renderer.calls>20,true,'The renderer draws substantial mesh geometry');
    stats.webglVersion=await page.evaluate(()=>{const gl=document.querySelector('#worldArt canvas').getContext('webgl2');return gl?.getParameter(gl.VERSION);});match(stats.webglVersion,/WebGL/,'The action world owns a real WebGL context');
    stats.contactContrast=await contrast(page,'.site-header .nav a.contact');
    await page.locator('#startLessonButton').click();
    check(await page.locator('#routeChoices').evaluate(el=>el===document.activeElement||el.contains(document.activeElement)),true,'Begin here first points to the route decision');
    check((await room(page)).route,null,'Begin here never silently chooses a route');await shot(page,'desktop-junction');
    // Wrong turns are animated, visible, recoverable, and still code-gated.
    const ambushBefore=await frame(page,'ambush-begin');
    await page.locator('#routeChoices button').nth(1).click();await waitAction(page,'encounter',.2,.7);
    const ambushMid=await frame(page,'ambush-mid');
    check(ambushMid.state.encounter.creature.y>.2,true,'The creature physically leaps from the side passage');
    check(Math.abs(ambushMid.state.encounter.creature.armAngle)>.1,true,'The leaping creature has moving joints');
    await idle(page);const ambushEnd=await frame(page,'ambush-end');
    check(ambushEnd.state.encounter.revealed,true);check(ambushEnd.state.encounter.blocking,true,'The creature keeps blocking the passage after its entrance');
    check(ambushEnd.state.encounter.creature.visible,true);check(ambushEnd.state.device.gateOpen,0,'Physical bars remain closed until code passes');
    check(pixelDifference(ambushBefore.png,ambushMid.png)>.001,true,'The ambush changes real rendered pixels');
    await blockedProgress(page,0);
    await run(page,'openGate(); say("Wrong greeting");','error');
    check((await saved(page)).inventory.length,0,'Wrong code grants no quest item');check((await saved(page)).defense,0,'Wrong code grants no town defense');
    check((await room(page)).gates[(await room(page)).route],false,'Wrong code never opens the saved route gate');
    check((await snapshot(page)).device.gateOpen,0,'A failed openGate command cannot leave the real passage open');
    check((await snapshot(page)).encounter.blocking,true,'The ambush remains a real obstacle after a wrong program');
    await page.locator('#retreatButton').click();await idle(page);await gate(page,'junction');check((await saved(page)).inventory,[],'Retreat keeps inventory intact');
    check((await room(page)).route,null,'Retreat returns to the junction');await blockedProgress(page,0);
    await choose(page,0);check(await page.locator('#codeInput').inputValue(),'openGate(); say("Wrong greeting");','Retreat preserves the learner draft');
    await page.locator('#resetButton').click();await page.locator('#startLessonButton').click();
    check(await page.evaluate(()=>document.activeElement?.id),'findTokenButton','After route choice, Begin here points to the exact edit');
    await page.locator('#findTokenButton').click();
    check(await page.locator('#codeInput').evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd)),'friend','The actual word in the program is highlighted');
    await page.keyboard.insertText('PIX');match(await page.locator('#codeInput').inputValue(),/Hello, PIX!/);await blockedProgress(page,0);
    await page.locator('#runButton').click();await waitAction(page,'claim',.15,.6);await page.locator('#skipAnimation').click();await result(page);
    stats.mainRoutes++;await credit(page,0);check((await snapshot(page)).reward.claimed,true,'Skipping a completed code action still physically claims the quest reward');
    check((await snapshot(page)).actor.carrying,true,'The recovered part is carried on the actor');
    await page.reload();await ready(page);check((await room(page)).phase,'cleared','Reload preserves the chosen route and cleared gate');await credit(page,0);
    let actorId=(await snapshot(page)).actor.id;
    await page.locator('#nextButton').click();
    for(let i=1;i<14;i++){
      check(await mission(page),'Mission '+(i+1)+' of 14');await gate(page,'junction');await blockedProgress(page,i);
      await choose(page,0);check((await snapshot(page)).actor.id,actorId,'The same actor survives room resets');
      if(i===1){await page.locator('#hintButton').click();check(await page.locator('#solutionButton').isVisible(),false,'First hint teaches before solving');await page.locator('#moreHintButton').click();check(await page.locator('#solutionButton').isVisible(),true);await page.locator('#solutionButton').click();await blockedProgress(page,i);}
      const code=await solution(page,i);
      if(i===1){
        const before=await snapshot(page);await page.locator('#codeInput').fill(code);await page.locator('#runButton').click();await waitAction(page,'charge',.47,.75);const mid=await snapshot(page);
        check(Math.abs(mid.actor.armAngle)>.1&&mid.actor.reach>.1,true,'PIX reaches for the lever using articulated arms');check(mid.device.lever>.1,true,'The lever itself turns');check(mid.device.energy>before.device.energy&&mid.device.energy<3,true,'Energy changes while the lever is being used');
        await shot(page,'lever-mid','#worldArt');await result(page);check((await snapshot(page)).device.energy,3,'Lever action ends with three charged sockets');stats.animationEvidence.lever={before,mid,after:await snapshot(page)};
      }else if(i===2){
        await page.locator('#codeInput').fill(code);await page.locator('#runButton').click();await waitAction(page,'step',.12,.65);await page.locator('#resetButton').click();await idle(page);
        check((await saved(page)).inventory.length,2,'Resetting mid-step never grants the abandoned reward');await gate(page,'blocked');await blockedProgress(page,i);
        check(Math.abs((await snapshot(page)).actor.x+3.15)<1e-9,true,'Reset returns the persistent actor to the safe entrance');
        const begin=await frame(page,'movement-begin');await page.locator('#codeInput').fill(code);await page.locator('#runButton').click();await waitAction(page,'step',.16,.65);const mid=await frame(page,'movement-mid');await result(page);const end=await frame(page,'movement-end');
        check([begin.state.actor.id,mid.state.actor.id,end.state.actor.id],[actorId,actorId,actorId],'Movement uses one persistent actor');
        check(Math.hypot(mid.state.actor.x-begin.state.actor.x,mid.state.actor.z-begin.state.actor.z)>.02,true,'PIX is between the actual start and end positions');
        check(Math.abs(mid.state.actor.legAngle)>.01&&Math.abs(mid.state.actor.armAngle)>.01,true,'Arms and legs articulate mid-step');check(end.state.actor.x!==begin.state.actor.x||end.state.actor.z!==begin.state.actor.z,true,'The actor reaches a different world position');
        const beginToMid=pixelDifference(begin.png,mid.png),midToEnd=pixelDifference(mid.png,end.png);check(beginToMid>.001,true,'Movement begins changing actual canvas pixels');check(midToEnd>.001,true,'Rendered mid and endpoint frames differ');
        stats.animationEvidence.movement={begin:begin.state,mid:mid.state,end:end.state,pixelDifference:{beginToMid,midToEnd}};
      }else if(i===3){
        await page.locator('#codeInput').fill(code);await page.locator('#runButton').click();await waitAction(page,'turn',.2,.7);const mid=await snapshot(page);
        check(mid.actor.yaw>0&&mid.actor.yaw<Math.PI/2,true,'Turn interpolates through an intermediate body orientation');check(Math.abs(mid.actor.headYaw)>.02,true,'The head turns with the body');await shot(page,'turn-mid','#worldArt');await result(page);stats.animationEvidence.turn={mid,after:await snapshot(page)};
        await page.emulateMedia({reducedMotion:'reduce'});
      }else if(i===9){
        await page.emulateMedia({reducedMotion:'no-preference'});const before=await snapshot(page);await page.locator('#codeInput').fill(code);await page.locator('#runButton').click();await waitAction(page,'collect',.5,.7);const mid=await snapshot(page);
        check(mid.items[0].y>before.items[0].y,true,'The crystal moves upward through PIX\'s reach');check(mid.actor.reach>.1,true,'PIX reaches for the crystal');await shot(page,'collect-mid','#worldArt');await result(page);const after=await snapshot(page);check(after.device.collected,[1,2,3],'All crystal items enter the pack');check(after.items.every(item=>!item.visible),true,'Collected meshes leave the chamber');stats.animationEvidence.collect={before,mid,after};await page.emulateMedia({reducedMotion:'reduce'});
      }else await run(page,code);
      stats.mainRoutes++;await credit(page,i);check((await snapshot(page)).actor.id,actorId,'The actor is not replaced by command playback');
      if(i===5){await page.reload();await ready(page);check((await room(page)).phase,'cleared');await credit(page,i);actorId=(await snapshot(page)).actor.id;}
      if(i<13)await page.locator('#easyContinue').click();
    }
    check(stats.mainRoutes,14);check((await saved(page)).inventory.length,14);check((await saved(page)).defense,100);check(await page.locator('#ending').isVisible(),true,'The town is saved only after all code-gated rooms');
    check((await snapshot(page)).device.beam,1,'The final ward beam is actually rendered');check((await snapshot(page)).threat.visible,false,'The restored defenses remove the approaching threat');await shot(page,'ward-complete','#worldArt');await shot(page,'ending','#ending');await shot(page,'desktop-complete');
    await page.reload();await ready(page);check(await page.locator('#ending').isVisible(),true,'Reload retains the earned ending');check((await saved(page)).inventory.length,14);await noOverflow(page);await desktop.close();

    // Every alternative route remains a genuine coding encounter. Retrying and
    // returning to the junction preserve equipment, but cannot bypass its gate.
    const alternate=await context({viewport:{width:1165,height:747},reducedMotion:'reduce'});await mockSpeech(alternate);
    const ap=await alternate.newPage();await ap.goto(url);await ready(ap);check(await ap.evaluate(()=>window.__speechCalls.length),0,'No surprise narration');
    for(let i=0;i<14;i++){
      const speechBefore=await ap.evaluate(()=>window.__speechCalls.length);
      await gate(ap,'junction');await blockedProgress(ap,i);await choose(ap,1);const selected=await room(ap),inventory=(await saved(ap)).inventory.slice(),protection=(await saved(ap)).defense;
      const kind=await ap.evaluate(({i,id})=>window.CodeQuestEncounters[i].find(route=>route.id===id).kind,{i,id:selected.route});check(['ambush','detour'].includes(kind),true,'Alternative route has a recoverable hazard');check((await snapshot(ap)).encounter.blocking,true,'Alternative hazard physically blocks the way');
      const creature=(await snapshot(ap)).encounter.creature;
      if(creature.visible&&!stats.creatureArchetypes.includes(creature.archetype)){stats.creatureArchetypes.push(creature.archetype);await shot(ap,'creature-'+creature.archetype,'#worldArt');}
      if(i===0){
        await ap.locator('#voiceToggle').click();const spoken=await ap.evaluate(()=>window.__speechCalls.at(-1));check(spoken.voice,'Microsoft Jenny Online (Natural)');check([spoken.rate,spoken.pitch,spoken.volume],[.96,1,1]);
        await ap.locator('#choicePanel summary').click();await ap.locator('#choiceButtons button').nth(1).click();await result(ap,'error');
      }else{const wrong=await ap.evaluate(i=>window.CodeQuestChoices[i][1].code,i);await run(ap,wrong,'error');}
      check((await saved(ap)).inventory,inventory,'Wrong code never grants a route reward');check((await saved(ap)).defense,protection,'Wrong code cannot improve town protection');check((await room(ap)).gates[selected.route],false);await blockedProgress(ap,i);
      if(i>0)check(await ap.evaluate(()=>window.__speechCalls.length),speechBefore,'Muted route selection and wrong code do not restart narration');
      await ap.locator('#retreatButton').click();await idle(ap);await gate(ap,'junction');check((await saved(ap)).inventory,inventory,'Retreat preserves all previously earned equipment');
      await ap.reload();await ready(ap);await gate(ap,'junction');check((await saved(ap)).inventory,inventory,'Reload at junction preserves equipment');check(await ap.evaluate(()=>window.__speechCalls.length),0,'Reload never autoplays narration');await choose(ap,1);
      if(i===0){
        await ap.locator('#voiceReplay').click();
        await run(ap,'say("Hello, PIX!"); say("PIX carries a pixel.");');check(await ap.locator('#codeInput').inputValue(),'say("Hello, PIX!"); say("PIX carries a pixel.");','Pronunciation never rewrites learner code');
        const calls=await ap.evaluate(()=>window.__speechCalls);check(calls.some(call=>/picks/i.test(call.text)),true,'Narration says the companion name as picks');check(calls.some(call=>/(^|[^a-z])pix([^a-z]|$)/i.test(call.text)),false,'All standalone PIX narration is normalized');
        match(await ap.locator('#actionLog').innerText(),/PIX/,'Visible command output retains PIX');await ap.locator('#voiceToggle').click();stats.mutedSpeechCalls=await ap.evaluate(()=>window.__speechCalls.length);
      }else{
        // No-typing selections still use real bounded programs and code checks.
        if(!await ap.locator('#choiceButtons button').first().isVisible())await ap.locator('#choicePanel summary').click();
        await ap.locator('#choiceButtons button').first().click();await result(ap);
      }
      stats.alternativeRoutes++;await credit(ap,i);
      if(i>0)check(await ap.evaluate(()=>window.__speechCalls.length),0,'Later choices and successful code remain silent until explicit opt-in');
      if(i===0){
        const earned=(await saved(ap)).inventory.slice();await ap.locator('#retreatButton').click();await gate(ap,'junction');check((await saved(ap)).inventory,earned);await blockedProgress(ap,i);
        await choose(ap,0);await blockedProgress(ap,i);check((await room(ap)).gates[selected.route],true,'Clearing one route does not erase it');check((await room(ap)).gates[(await room(ap)).route],false,'The other route stays independently locked');
        await ap.locator('#retreatButton').click();await gate(ap,'junction');await ap.locator('#routeChoices button').nth(1).click();await idle(ap);await gate(ap,'cleared');
      }
      if(i<13)await ap.locator('#nextButton').click();
    }
    check(stats.alternativeRoutes,14);check((await saved(ap)).inventory.length,14);check((await saved(ap)).defense,100);check(await ap.evaluate(()=>window.__speechCalls.length),0,'Narration stays off through later route choices, code and reloads');check(await ap.locator('#voiceToggle').getAttribute('aria-pressed'),'false');
    check(stats.creatureArchetypes.slice().sort(),['crawler','hound','lurker','sentinel','wraith'],'All five original creature models are encountered');
    await shot(ap,'alternative-ending','#ending');
    ap.once('dialog',dialog=>dialog.accept());await ap.locator('#replayButton').click();await ready(ap);await gate(ap,'junction');check((await saved(ap)).inventory,[],'Replay resets this quest only');check((await saved(ap)).defense,0);
    // Actual-worker host escapes and limits with intercepted, harmless targets.
    const hostile=['delete self.fetch; say(String(fetch).includes("[native code]") ? "native fetch exposed" : "not native");','fetch("https://example.invalid/probe");','self.fetch("https://example.invalid/probe");','globalThis.fetch("https://example.invalid/probe");','say.constructor("return fetch")()("https://example.invalid/probe");','importScripts("https://example.invalid/probe");','new WebSocket("wss://example.invalid/probe");','({}).constructor.constructor("return self")();','import("https://example.invalid/probe");','while (true) {}','for (let i=0; i<1000; i++) { say("x"); }','function repeat() { repeat(); } repeat();'];
    const rejected=await ap.evaluate(async programs=>{const run=code=>new Promise((resolve,reject)=>{const worker=new Worker('sandbox.js?v=stoneward-qa'),timer=setTimeout(()=>{worker.terminate();reject(new Error('Worker timeout'));},2200);worker.onmessage=e=>{clearTimeout(timer);worker.terminate();resolve(e.data);};worker.onerror=()=>{clearTimeout(timer);worker.terminate();reject(new Error('Worker failed to load'));};worker.postMessage({code});});const results=[];for(const code of programs)results.push(await run(code));return results;},hostile);
    for(const payload of rejected){check(payload.ok,false,'Host capability or over-limit program is rejected');stats.hostilePrograms++;}
    check(unexpected,[],'Hostile input never attempts an external request');await alternate.close();

    // Reduced motion, saved encounters, old-save isolation and corrupt-save recovery.
    const restore=await context({reducedMotion:'reduce'}),rp=await restore.newPage();await rp.goto(url);await ready(rp);await choose(rp,1);const encounter=await room(rp);await rp.reload();await ready(rp);check((await room(rp)).route,encounter.route);await gate(rp,'blocked');check((await snapshot(rp)).encounter.blocking,true,'Reload preserves the unresolved creature gate');
    await rp.evaluate(key=>localStorage.setItem(key,'{broken'),STORE);await rp.reload();await ready(rp);await gate(rp,'junction');check((await saved(rp)).inventory,[],'Corrupt save never grants quest parts');
    const old='{"level":13,"cleared":[true,true,true,true,true,true,true,true,true,true,true,true,true,true]}';
    await rp.evaluate(({key,old})=>{localStorage.removeItem(key);localStorage.setItem('kira-code-quest-last-light-v2',old);localStorage.setItem('kira-code-quest-starlight-v1',old);},{key:STORE,old});await rp.reload();await ready(rp);
    check((await saved(rp)).inventory,[],'Previous editions cannot award new quest equipment');check(await rp.evaluate(()=>localStorage.getItem('kira-code-quest-last-light-v2')),old,'Earlier adventure save stays intact');
    await choose(rp,0);await run(rp,await solution(rp,0));check((await snapshot(rp)).frameProgress,1,'Reduced-motion action endpoints complete immediately');await restore.close();

    // Both narrow touch layouts remain playable, without hiding the creature or
    // action world offscreen. Lose a real WebGL context on the 390px run.
    for(const width of [390,320]){
      const mobile=await context({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),mp=await mobile.newPage();await mp.goto(url);await ready(mp);await noOverflow(mp);stats.menuContrast=await contrast(mp,'.site-header .menubtn');
      await mp.locator('#startLessonButton').tap();check(await mp.locator('#routeChoices').evaluate(el=>el===document.activeElement||el.contains(document.activeElement)),true,'Touch Begin here finds the route decision');
      await choose(mp,1);await mp.locator('#startLessonButton').tap();check(await mp.evaluate(()=>document.activeElement?.id),'findTokenButton','Touch Begin here finds the small code edit');
      if(width===390&&(await snapshot(mp)).mode==='webgl'){
        await shot(mp,'mobile');
        stats.contextLoss=await mp.evaluate(()=>{const canvas=document.querySelector('#worldArt canvas'),gl=canvas.getContext('webgl2')||canvas.getContext('webgl'),ext=gl?.getExtension('WEBGL_lose_context');if(ext){ext.loseContext();return 'native-extension';}canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));return 'event';});
        await mp.waitForFunction(()=>window.CodeQuestWorld.snapshot().mode==='fallback',null,{timeout:10000});check((await snapshot(mp)).encounter.blocking,true,'Context loss preserves the active obstacle');stats.renderers.push('context-loss-fallback');
      }
      await mp.locator('#guidedButton').tap();await run(mp);await credit(mp,0);await unobstructed(mp,'#easyContinue');check(await mp.locator('#easyContinue').evaluate(el=>el.getBoundingClientRect().height>=44),true,'Continue has a usable touch target');
      if(width===390)await shot(mp,'mobile-fallback');await mp.locator('#nextButton').tap();await gate(mp,'junction');await choose(mp,0);await mp.locator('#guidedButton').tap();await run(mp);await mp.reload();await ready(mp);await credit(mp,1);await noOverflow(mp);await mobile.close();
    }

    const fallback=await context({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/i.test(type))return null;return original.call(this,type,...args);};});
    const fp=await fallback.newPage();await fp.goto(url);await ready(fp);check((await snapshot(fp)).mode,'fallback','A blocked WebGL context selects the local illustrated renderer');stats.renderers.push('blocked-webgl-fallback');await choose(fp,1);
    const fallbackBegin=await frame(fp,'fallback-begin');await fp.locator('#guidedButton').click();await run(fp);const fallbackEnd=await frame(fp,'fallback-end');check(pixelDifference(fallbackBegin.png,fallbackEnd.png)>.001,true,'Fallback is a functioning action world, not a blank canvas');await credit(fp,0);await noOverflow(fp);await fallback.close();

    const blocked=await context({viewport:{width:390,height:844},reducedMotion:'reduce'});await blocked.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new DOMException('Storage unavailable','SecurityError');}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('Storage unavailable','SecurityError');}});});
    const bp=await blocked.newPage();await bp.goto(url);await ready(bp);match(await bp.locator('#saveStatus').innerText(),/not saving|cannot save|not available/i,'Unavailable storage is explained');
    await bp.locator('#routeChoices button').first().click();await idle(bp);await bp.locator('#guidedButton').click();await run(bp);await gate(bp,'cleared');await bp.locator('#nextButton').click();check(await mission(bp),'Mission 2 of 14','Storage restrictions never block the quest');await blocked.close();

    check(errors,[],'No page errors across real quest, animation, mobile and fallback flows');check(unexpected,[],'No game or player input attempted an external request');
    const sources=sourceHashes();check(sources,startingSources,'Game source remains unchanged throughout final browser verification');
    fs.writeFileSync(path.join(output,'browser-result.json'),JSON.stringify({browserVersion:browser.version(),stats,sources,audio:'Narration API mocked here; audible speaker output is not verified.'},null,2)+'\n');
    console.log('Stoneward actual-browser QA passed: '+JSON.stringify({...stats,animationEvidence:{movement:stats.animationEvidence.movement.pixelDifference,details:'qa/code-quest-stoneward/browser-result.json'}},null,2));
    console.log('Speech audibility is not established by this suite.');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
