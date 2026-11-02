'use strict';
/* Real browser QA for Code Quest. No npm install or external service is required.
 * PLAYWRIGHT_MODULE may point at playwright or playwright-core; CHROMIUM_PATH may
 * select an installed Chromium browser. Requests outside the loopback site are intercepted.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');
function loadBrowser() {
  const candidates = [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core'];
  if (process.platform === 'win32') candidates.push(path.join(os.homedir(), 'Kira', 'Avatar', 'runtime3d', 'node_modules', 'playwright-core'));
  for (const name of candidates.filter(Boolean)) {
    try { return require(name); } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; }
  }
  throw new Error('An existing Playwright installation is required. Set PLAYWRIGHT_MODULE; this test does not install dependencies.');
}
const { chromium } = loadBrowser();
const docs = path.resolve(__dirname, '../docs');
const output = process.env.QA_OUTPUT || path.resolve(__dirname, '../qa/code-quest-last-light');
const STORE = 'kira-code-quest-last-light-v2';
const browserPath = process.env.CHROMIUM_PATH || (process.platform === 'win32' ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' : '/usr/bin/chromium');
const stats = { assertions: 0, solutions: 0, choiceSolutions: 0, choiceDistractors: 0, hostileWorkerPrograms: 0, screenshots: [] };
function check(value, expected, label) { assert.deepEqual(value, expected, label); stats.assertions++; }
function match(value, pattern, label) { assert.match(value, pattern, label); stats.assertions++; }
const server = http.createServer((req, res) => {
  let target;
  try { target = path.resolve(docs, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch (_) { res.writeHead(400); res.end(); return; }
  if (!target.startsWith(docs + path.sep)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(target)] || 'application/octet-stream');
  res.end(fs.readFileSync(target));
});
(async () => {
  fs.mkdirSync(output, {recursive:true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const url = origin + '/arcade/code-quest/';
  const browser = await chromium.launch({executablePath:browserPath, headless:true, args:['--no-sandbox']});
  const errors = [], unexpected = [];
  async function context(options={}) {
    const ctx = await browser.newContext(options);
    await ctx.route('**/*', route => {
      const request = route.request();
      if (!request.url().startsWith(origin + '/')) { unexpected.push(request.url()); return route.abort(); }
      return route.continue();
    });
    ctx.on('page', page => page.on('pageerror', error => errors.push(String(error))));
    return ctx;
  }
  async function ready(page) { await page.waitForFunction(() => window.CodeQuestMissions && window.CodeQuestChoices && document.querySelector('#sceneTitle').textContent); }
  async function result(page, expected='success') {
    await page.waitForFunction(() => !document.querySelector('#runButton').disabled && document.querySelector('#outputPanel').dataset.state !== 'ready', null, {timeout:12000});
    check(await page.locator('#outputPanel').getAttribute('data-state'), expected, await page.locator('#outputText').innerText());
  }
  async function run(page, expected='success', inspectStage=false) {
    await page.locator('#runButton').click();
    if(inspectStage) check(await page.locator('#stage').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),true,'Mobile Run brings the animated scene fully into view');
    await result(page,expected);
  }
  async function mission(page) { return page.locator('#chapterCount').innerText(); }
  async function fillSolution(page, level) { await page.locator('#codeInput').fill(await page.evaluate(i => window.CodeQuestMissions[i].solution, level)); }
  async function screenshot(page, name, locator) {
    const filename = path.join(output, name + '.png');
    if (locator) await page.locator(locator).screenshot({path:filename});
    else {
      await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});
      await page.screenshot({path:filename, fullPage:true});
    }
    stats.screenshots.push(filename);
  }
  async function noOverflow(page) { check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal page overflow'); }
  async function unobstructed(page, selector) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    check(await page.locator(selector).evaluate(el => {
      const r=el.getBoundingClientRect(), hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      return hit===el || el.contains(hit);
    }), true, selector + ' is not covered by Iris or another control');
  }
  async function contrast(page, selector) {
    const ratio=await page.locator(selector).evaluate(el=>{
      const style=getComputedStyle(el),rgb=value=>(value.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
      const luminance=channels=>channels.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
      const text=luminance(rgb(style.color)),background=luminance(rgb(style.backgroundColor));
      return (Math.max(text,background)+.05)/(Math.min(text,background)+.05);
    });
    check(ratio>=4.5,true,selector+' text contrast is at least 4.5:1 (actual '+ratio.toFixed(2)+':1)');
  }
  async function mockSpeech(ctx) {
    await ctx.addInitScript(()=>{
      window.__speechCalls=[];
      const voices=[{name:'Microsoft Jenny Online (Natural)',lang:'en-US',default:false,localService:false},{name:'Microsoft David',lang:'en-US',default:true,localService:true}];
      const synth={getVoices:()=>voices,cancel(){},addEventListener(){},speak(utter){window.__speechCalls.push({text:utter.text,voice:utter.voice?.name,rate:utter.rate,pitch:utter.pitch,volume:utter.volume});utter.onstart?.();}};
      Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});
      Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class {constructor(text){this.text=text;}}});
      // Sound cue hardware is outside this mocked narration test.
      Object.defineProperty(window,'AudioContext',{configurable:true,value:undefined});
      Object.defineProperty(window,'webkitAudioContext',{configurable:true,value:undefined});
    });
  }
  try {
    const desktop = await context({viewport:{width:1440,height:1000}});
    const page = await desktop.newPage();
    await page.goto(url); await ready(page);
    check(await mission(page), 'Mission 1 of 14', 'Fresh start');
    check(await page.locator('#nextButton').isDisabled(), true, 'No success before code runs');
    check(await page.locator('#journeyMap button:disabled').count(), 13, 'Later missions stay locked');
    check(await page.locator('#board .is-goal').count(),0,'Text lesson has no misleading movement destination');
    match(await page.locator('#guidedText').innerText(), /friend.*PIX/s, 'Opening names the exact small edit');
    match(await page.locator('#workedExample').innerText(), /quotes.*not spoken/s, 'Opening explains why text and quotes differ');
    check(await page.locator('#worldArt .world-workshop').evaluate(el => getComputedStyle(el).display !== 'none'), true, 'Workshop art is visible');
    check(await page.locator('#worldArt .world-stars').evaluate(el => getComputedStyle(el).animationName !== 'none'), true, 'Scene animation enabled by default');
    await contrast(page,'.site-header .nav a.contact');
    await page.locator('#startLessonButton').click();
    check(await page.evaluate(()=>document.activeElement?.id),'findTokenButton','Begin here points a beginner directly at the guided first edit');
    check(await page.locator('#guidedStep').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),true,'The first-step explanation is fully visible after Begin here');
    await screenshot(page, 'desktop');
    await run(page, 'error');
    match(await page.locator('#outputText').innerText(), /Replace friend with PIX|word friend/, 'Wrong first attempt teaches the edit');
    check(await page.locator('#nextButton').isDisabled(), true, 'Wrong first attempt cannot advance');
    await page.locator('#findTokenButton').click();
    check(await page.locator('#codeInput').evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd)),'friend','Pointing selects the exact word in actual code');
    await page.keyboard.insertText('PIX');
    match(await page.locator('#codeInput').inputValue(),/say\("Hello, PIX!"\)/,'Typing over the highlighted word makes the intended edit');
    check(await page.locator('#nextButton').isDisabled(),true,'Manual edit waits for Run');
    await page.locator('#resetButton').click();
    await page.locator('#guidedButton').click();
    match(await page.locator('#codeInput').inputValue(), /say\("Hello, PIX!"\)/);
    check(await page.locator('#nextButton').isDisabled(), true, 'Guided edit never auto-runs or marks success');
    match(await page.locator('#outputText').innerText(), /Now press Run my code/, 'Guided edit gives next action');
    check(await page.locator('#codeInput').evaluate(el => el.value.slice(el.selectionStart,el.selectionEnd)), 'PIX', 'Changed token is selected');
    await page.locator('#runButton').click();
    await page.waitForFunction(()=>!document.querySelector('#pixSpeech').hidden&&document.querySelector('#runButton').disabled);
    await page.waitForTimeout(900);
    check(await page.locator('#skipAnimation').isVisible(),true,'Skip remains available during final visible action hold');
    await page.locator('#skipAnimation').click();
    await page.waitForFunction(()=>!document.querySelector('#runButton').disabled);
    check(await page.locator('#outputPanel').getAttribute('data-state'),'success','Skipping final frame still evaluates the solved attempt');
    stats.solutions++;
    check(await page.locator('#pixSpeech').innerText(), 'Hello, PIX!', 'PIX visibly speaks the learner text');
    check(await page.locator('#progressBar').getAttribute('aria-valuenow'), '1');
    await unobstructed(page, '#nextButton');
    await page.reload(); await ready(page);
    check(await mission(page), 'Mission 1 of 14', 'Reload restores current completed scene');
    check(await page.locator('#nextButton').isEnabled(), true, 'Reload retains Continue');
    match(await page.locator('#codeInput').inputValue(), /Hello, PIX!/, 'Reload preserves the draft');
    await page.locator('#nextButton').click();
    check(await mission(page), 'Mission 2 of 14');
    await page.locator('#hintButton').click();
    check(await page.locator('#hintBox').isVisible(), true);
    check(await page.locator('#solutionButton').isVisible(), false, 'First hint teaches before showing solution');
    await page.locator('#moreHintButton').click();
    check(await page.locator('#solutionButton').isVisible(), true);
    match(await page.locator('#hintText').innerText(), /let crystals = 3/);
    await page.locator('#solutionButton').click();
    check(await page.locator('#nextButton').isDisabled(), true, 'Example also waits for learner to run');
    await run(page); stats.solutions++;
    check(await page.locator('#energy i.charged').count(), 3, 'Charging visibly lights three sockets');
    await page.locator('#resetButton').click();
    match(await page.locator('#codeInput').inputValue(), /crystals = 1/);
    check(await page.locator('#progressBar').getAttribute('aria-valuenow'), '2', 'Reset code preserves completed sparks');
    await run(page, 'error');
    check(await page.locator('#nextButton').isEnabled(), true, 'A retry does not erase an earlier success');
    await page.locator('#nextButton').click();
    check(await page.locator('#board .is-goal').count(),1,'Movement lesson marks its visible destination');
    // Watch actual positional animation before testing cancellation.
    await fillSolution(page, 2); await page.locator('#runButton').click();
    await page.waitForFunction(() => document.querySelector('#stage').classList.contains('is-running'));
    check(await page.locator('#runButton').isDisabled(), true);
    await page.locator('#resetButton').click();
    await page.waitForTimeout(1400);
    check(await page.locator('#outputPanel').getAttribute('data-state'), 'ready', 'Reset cancels old completion');
    check(await page.locator('#progressBar').getAttribute('aria-valuenow'), '2', 'Canceled run does not grant spark');
    match(await page.locator('#board').getAttribute('aria-label'), /column 1, row 3/, 'Reset returns PIX to scene entrance');
    await fillSolution(page, 2); await page.locator('#runButton').click();
    await page.waitForFunction(() => document.querySelector('#stage').classList.contains('is-running'));
    await page.locator('#previousButton').click();
    await page.waitForTimeout(1400);
    check(await mission(page),'Mission 2 of 14','Previous cancels the in-flight third mission');
    check(await page.locator('#progressBar').getAttribute('aria-valuenow'),'2','Previous never awards an abandoned spark');
    await page.locator('#nextButton').click();
    // Complete the rest with actual workers and normal animation.
    for (let i=2;i<14;i++) {
      check(await mission(page), 'Mission ' + (i+1) + ' of 14');
      await fillSolution(page,i); await run(page); stats.solutions++;
      if (i===3) {
        check(await page.locator('#stage').getAttribute('data-theme'), 'river');
        check(await page.locator('#worldArt .world-river').evaluate(el => getComputedStyle(el).display !== 'none'), true);
        await screenshot(page,'river','#stage');
      }
      if (i===5) check(await page.locator('#stage').evaluate(el => el.classList.contains('gate-open')), true, 'Gate opens for a true condition');
      if (i===9) check(await page.locator('#stage').evaluate(el => el.classList.contains('stars-collected')), true, 'Collected stars react');
      await unobstructed(page,'#nextButton');
      if (i<13) await page.locator('#nextButton').click();
    }
    check(stats.solutions,14,'Every real mission solution completed');
    check(await page.locator('#progressBar').getAttribute('aria-valuenow'),'14');
    check(await page.locator('#ending').isVisible(),true);
    check(await page.locator('#stage').evaluate(el => el.classList.contains('is-lit')),true,'Final beacon lights');
    await screenshot(page,'ending','#ending');
    await page.reload(); await ready(page);
    check(await page.locator('#ending').isVisible(),true,'Reload retains earned ending');
    await noOverflow(page);
    page.once('dialog',dialog=>dialog.accept()); await page.locator('#replayButton').click();
    check(await mission(page),'Mission 1 of 14');
    check(await page.locator('#progressBar').getAttribute('aria-valuenow'),'0','Replay resets only this adventure save');
    // Host capabilities are never exposed to programs. Probe the real worker with
    // harmless intercepted network targets, not live external network requests.
    const hostile = [
      'delete self.fetch; say(String(fetch).includes("[native code]") ? "native fetch exposed" : "not native");',
      'fetch("https://example.invalid/quest-probe");',
      'self.fetch("https://example.invalid/quest-probe");',
      'globalThis.fetch("https://example.invalid/quest-probe");',
      'say.constructor("return fetch")()("https://example.invalid/quest-probe");',
      'importScripts("https://example.invalid/quest-probe");',
      'new WebSocket("wss://example.invalid/quest-probe");',
      '({}).constructor.constructor("return self")();',
      'import("https://example.invalid/quest-probe");',
      'while (true) {}',
      'for (let i=0; i<1000; i++) { say("x"); }',
      'function repeat() { repeat(); } repeat();'
    ];
    const workerResults = await page.evaluate(async programs => {
      const run = code => new Promise(resolve => {
        const worker = new Worker('sandbox.js?v=browser-qa');
        const timer=setTimeout(()=>{worker.terminate();resolve({ok:true,error:'QA timed out'});},2200);
        worker.onmessage=e=>{clearTimeout(timer);worker.terminate();resolve(e.data);};
        worker.onerror=()=>{clearTimeout(timer);worker.terminate();resolve({ok:true,error:'Worker load error'});};
        worker.postMessage({code});
      });
      const results=[];for(const code of programs)results.push(await run(code));return results;
    }, hostile);
    for (let i=0;i<workerResults.length;i++) { check(workerResults[i].ok,false,'Worker rejected hostile/limited program '+i+': '+workerResults[i].error); stats.hostileWorkerPrograms++; }
    check(unexpected.length,0,'No intercepted external requests (including from hostile worker inputs)');
    // Corrupt and out-of-order saves recover to a usable opening.
    await page.evaluate(key=>localStorage.setItem(key,'{broken'),STORE);await page.reload();await ready(page);
    check(await mission(page),'Mission 1 of 14','Malformed JSON save recovers');
    await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({level:13,cleared:[false,...Array(13).fill(true)],drafts:Array(14).fill('say("draft");')})),STORE);
    await page.reload();await ready(page);
    check(await mission(page),'Mission 1 of 14','Non-contiguous save never unlocks finale');
    check(await page.locator('#journeyMap button:disabled').count(),13);
    await desktop.close();
    // Preserve the landed no-typing route: all fourteen correct choices run
    // through actual workers; representative mistakes teach and recover in UI.
    const choiceContext=await context({viewport:{width:1165,height:747},reducedMotion:'reduce'});
    await mockSpeech(choiceContext);
    const cp=await choiceContext.newPage();await cp.goto(url);await ready(cp);
    check(await cp.evaluate(()=>window.__speechCalls.length),0,'Choices never start narration on page load');
    await cp.locator('#choicePanel summary').click();
    await cp.locator('#choiceButtons button').nth(1).click();await result(cp,'error');
    check(await cp.evaluate(()=>window.__speechCalls.length),0,'A command choice does not silently turn voice on');
    check(await cp.locator('#voiceToggle').getAttribute('aria-pressed'),'false','Voice remains explicitly off after silent choice');
    await cp.locator('#voiceToggle').click();
    check(await cp.evaluate(()=>window.__speechCalls.length>0),true,'Explicit voice click narrates the latest feedback');
    const spoken=await cp.evaluate(()=>window.__speechCalls.at(-1));
    check(spoken.voice,'Microsoft Jenny Online (Natural)','Integrated narration uses Iris voice priority');
    check([spoken.rate,spoken.pitch,spoken.volume],[.96,1,1],'Integrated narration keeps Iris speech settings');
    await cp.locator('#choiceButtons button').nth(0).click();await result(cp);
    check(await cp.locator('#outputText').innerText().then(t=>t.includes('friend')&&t.includes('PIX')),true,'No-typing success explains the exact string replacement');
    check(await cp.locator('#easyContinue').isVisible(),true,'Large Continue appears after a choice succeeds');
    const explained=await cp.evaluate(()=>window.CodeQuestChoices[0][0].why);
    check((await cp.locator('#outputText').innerText()).includes(explained),true,'Selected choice teaching reason survives into feedback');
    check(await cp.evaluate(why=>{const words=text=>text.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();return window.__speechCalls.some(call=>words(call.text).includes(words(why)));},explained),true,'Selected choice teaching reason is narrated after running');
    stats.choiceSolutions++;
    await cp.locator('#voiceToggle').click();
    const mutedCalls=await cp.evaluate(()=>window.__speechCalls.length);
    for(let i=1;i<14;i++){
      await cp.locator('#easyContinue').click();
      check(await mission(cp),'Mission '+(i+1)+' of 14','Choice Continue advances one chapter');
      check(await cp.locator('#choiceButtons button').count(),3,'Every chapter retains three explained no-typing commands');
      if([5,9,11].includes(i)){
        await cp.locator('#choiceButtons button').nth(1).click();await result(cp,'error');
        check(await cp.locator('#easyContinue').isVisible(),false,'A wrong choice cannot continue an unsolved chapter');
        match(await cp.locator('#easyInstruction').innerText(),/PIX is safe|another command|guided edit/,'Wrong choices remain recoverable');
      }
      const why=await cp.evaluate(level=>window.CodeQuestChoices[level][0].why,i);
      await cp.locator('#choiceButtons button').nth(0).click();await result(cp);
      check((await cp.locator('#outputText').innerText()).includes(why),true,'Mission '+(i+1)+' explains the chosen program');
      await unobstructed(cp,'#easyContinue');
      stats.choiceSolutions++;
    }
    check(stats.choiceSolutions,14,'All fourteen no-typing choices complete through real workers');
    check(await cp.evaluate(()=>window.__speechCalls.length),mutedCalls,'Muted narration stays off through command choices and chapter changes');
    check(await cp.locator('#voiceToggle').getAttribute('aria-pressed'),'false');
    // Test all distractor programs inside real workers, then check their actions
    // against the actual mission objectives with independent positional replay.
    const distractors=await cp.evaluate(async()=>{
      const run=code=>new Promise((resolve,reject)=>{const worker=new Worker('sandbox.js?v=choices-qa');const timer=setTimeout(()=>{worker.terminate();reject(new Error('Choice worker timeout'));},2200);worker.onmessage=e=>{clearTimeout(timer);worker.terminate();resolve(e.data);};worker.onerror=()=>{clearTimeout(timer);worker.terminate();reject(new Error('Choice worker error'));};worker.postMessage({code});});
      const results=[];
      for(let level=0;level<CodeQuestMissions.length;level++)for(let choice=1;choice<3;choice++){
        const payload=await run(CodeQuestChoices[level][choice].code),m=CodeQuestMissions[level];let {x,y,dir}=m.start;
        if(payload.ok){const dirs=['east','south','west','north'];for(const action of payload.actions){if(action.type==='turn')dir=dirs[(dirs.indexOf(dir)+(action.value==='right'?1:3))%4];else if(action.type==='move')for(let n=0;n<action.value;n++){if(dir==='east')x++;else if(dir==='west')x--;else if(dir==='south')y++;else y--;}}}
        results.push({level,choice,ok:payload.ok,solved:payload.ok&&m.check({...payload,x,y,dir})});
      }
      return results;
    });
    for(const item of distractors){check(item.ok,true,'Distractor '+item.level+':'+item.choice+' is a valid small teaching program');check(item.solved,false,'Distractor '+item.level+':'+item.choice+' does not accidentally solve the mission');stats.choiceDistractors++;}
    check(stats.choiceDistractors,28);await choiceContext.close();
    // Transfer only the unchanged opening concepts. Keep the old save intact and
    // prefer an existing new-adventure save on later visits.
    const legacyContext=await context({reducedMotion:'reduce'}),legacyRaw=JSON.stringify({level:7,cleared:Array(8).fill(true),drafts:Array(8).fill('legacy draft')});
    await legacyContext.addInitScript(raw=>{if(location.protocol==='http:')localStorage.setItem('kira-code-quest-starlight-v1',raw);},legacyRaw);
    const lp=await legacyContext.newPage();await lp.goto(url);await ready(lp);
    check(await mission(lp),'Mission 5 of 14','An old complete adventure begins at the first new concept');
    check(await lp.locator('#progressBar').getAttribute('aria-valuenow'),'4','Only the four unchanged opening concepts transfer');
    check(await lp.evaluate(()=>localStorage.getItem('kira-code-quest-starlight-v1')),legacyRaw,'Legacy save remains byte-for-byte intact');
    await lp.evaluate(key=>localStorage.setItem(key,JSON.stringify({level:1,cleared:[true,...Array(13).fill(false)],drafts:Array(14).fill(null)})),STORE);
    await lp.reload();await ready(lp);check(await mission(lp),'Mission 2 of 14','Existing new-adventure save takes priority over legacy credit');
    check(await lp.locator('#progressBar').getAttribute('aria-valuenow'),'1');await legacyContext.close();
    // Touch-first narrow screens: guided editing, retries, next, and persisted state.
    for (const width of [390,320]) {
      const mobile=await context({viewport:{width,height:844},isMobile:true,hasTouch:true});
      const p=await mobile.newPage();await p.goto(url);await ready(p);await noOverflow(p);
      await contrast(p,'.site-header .menubtn');
      await p.locator('#startLessonButton').tap();
      check(await p.evaluate(()=>document.activeElement?.id),'findTokenButton','Mobile Begin here focuses the concrete edit helper');
      await p.locator('#guidedButton').tap();await run(p,'success',true);
      await unobstructed(p,'#nextButton');
      check(await p.locator('#nextButton').evaluate(el=>el.getBoundingClientRect().height>=43),true,'Continue has usable touch target');
      if(width===390)await screenshot(p,'mobile');
      await p.locator('#nextButton').tap();check(await mission(p),'Mission 2 of 14');
      await p.locator('#guidedButton').tap();await run(p);
      await p.reload();await ready(p);check(await mission(p),'Mission 2 of 14');
      check(await p.locator('#nextButton').isEnabled(),true,'Mobile reload keeps progress');
      await noOverflow(p);await mobile.close();
    }
    const motion=await context({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const rp=await motion.newPage();await rp.goto(url);await ready(rp);
    check(await rp.locator('#worldArt .world-stars').evaluate(el=>getComputedStyle(el).animationName),'none','Reduced motion removes world animation');
    await rp.locator('#guidedButton').click();await run(rp);await motion.close();
    const blocked=await context({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await blocked.addInitScript(()=>{
      Object.defineProperty(Storage.prototype,'getItem',{value(){throw new DOMException('Storage unavailable','SecurityError');}});
      Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('Storage unavailable','SecurityError');}});
    });
    const bp=await blocked.newPage();await bp.goto(url);await ready(bp);
    match(await bp.locator('#saveStatus').innerText(),/not saving progress/);
    await bp.locator('#guidedButton').click();await run(bp);await bp.locator('#nextButton').click();
    check(await mission(bp),'Mission 2 of 14','Blocked storage still allows play');
    await blocked.close();
    check(errors,[],'No page errors throughout desktop/mobile/reload flows');
    check(unexpected,[],'No program caused a network request');
    console.log('Code Quest real browser QA passed: '+JSON.stringify(stats,null,2));
    console.log('Speech audibility was not tested by this headless suite. Voice API behavior has a separate mocked test.');
  } finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
