'use strict';
/* Focused layout/recovery QA for the one-screen desktop adventure.
 * 683x384 at DPR2 is a 200%-zoom-equivalent CSS viewport, not a browser shortcut test. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
function browserModule(){for(const name of [process.env.PLAYWRIGHT_MODULE,'playwright','playwright-core',process.platform==='win32'?path.join(os.homedir(),'Kira','Avatar','runtime3d','node_modules','playwright-core'):null].filter(Boolean)){try{return require(name);}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}}throw new Error('An existing Playwright installation is required.');}
const {chromium}=browserModule(),docs=path.resolve(__dirname,'../docs'),gameRoot=path.join(docs,'arcade/code-quest');
const output=process.env.QA_OUTPUT||path.resolve(__dirname,'../qa/code-quest-screen/layout');
const STORE='kira-code-quest-stoneward-v3',DRAFT='// My edit is already made.\nsay("Hello, PIX!");';
const dataWindow={};for(const name of ['missions.js','encounters.js'])vm.runInNewContext(fs.readFileSync(path.join(gameRoot,name),'utf8'),{window:dataWindow});
const missions=dataWindow.CodeQuestMissions,encounters=dataWindow.CodeQuestEncounters;
const {create}=require('../docs/arcade/code-quest/quest-state.js');
function correctDraftWithoutRoute(){const quest=create({missions,encounters});quest.setDraft(DRAFT);return JSON.stringify(quest.data);}
const sourceNames=['index.html','game.css','screen.css','game.js','scene.js','scene-fallback.js','missions.js','encounters.js','quest-state.js','choices.js','voice.js','sandbox.js'];
const sourceHashes=()=>Object.fromEntries(sourceNames.map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(gameRoot,name))).digest('hex')]));
const stats={assertions:0,desktopMissions:0,viewports:[],layouts:[],accessibility:[],screenshots:[]};
const check=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);stats.assertions++;};
const match=(actual,pattern,label)=>{assert.match(actual,pattern,label);stats.assertions++;};
const server=http.createServer((req,res)=>{let file;try{file=path.resolve(docs,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));}catch(_){res.writeHead(400);return res.end();}if(!file.startsWith(docs+path.sep)){res.writeHead(403);return res.end();}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
(async()=>{
  fs.mkdirSync(output,{recursive:true});const startingSources=sourceHashes();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port,url=origin+'/arcade/code-quest/';
  const executablePath=process.env.CHROMIUM_PATH||(process.platform==='win32'?'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe':'/usr/bin/chromium');
  const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const errors=[],unexpected=[];
  async function context(options={}){
    const ctx=await browser.newContext({reducedMotion:'reduce',...options});
    await ctx.route('**/*',route=>{if(!route.request().url().startsWith(origin+'/')){unexpected.push(route.request().url());return route.abort();}return route.continue();});
    await ctx.addInitScript(({key,draft})=>{if(location.protocol==='http:'&&!localStorage.getItem(key))localStorage.setItem(key,draft);},{key:STORE,draft:correctDraftWithoutRoute()});
    ctx.on('page',page=>page.on('pageerror',e=>errors.push(String(e))));return ctx;
  }
  async function ready(page){await page.waitForFunction(()=>window.CodeQuestWorld?.snapshot&&window.CodeQuestWorld.snapshot().mode!=='loading'&&document.querySelector('#routeChoices')?.children.length===2&&document.querySelector('#flowSteps')&&document.querySelector('#currentAction'),null,{timeout:20000});}
  const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),STORE);
  async function idle(page){await page.waitForFunction(()=>!document.querySelector('#stage').classList.contains('is-running')&&![...document.querySelectorAll('#routeChoices button')].some(button=>button.disabled),null,{timeout:20000});}
  async function result(page,expected='success'){await page.waitForFunction(()=>!document.querySelector('#stage').classList.contains('is-running')&&['success','error'].includes(document.querySelector('#outputPanel').dataset.state),null,{timeout:20000});check(await page.locator('#outputPanel').getAttribute('data-state'),expected,await page.locator('#outputText').textContent());}
  async function shot(page,name){const filename=path.join(output,name+'.png');await page.screenshot({path:filename,fullPage:false});stats.screenshots.push(filename);}
  async function desktopLayout(page,label){
    const measure=await page.evaluate(()=>{
      const selectors=['#stage','#flowSteps','#currentAction','#routeChoices button:nth-child(1)','#routeChoices button:nth-child(2)','#codeInput','#runButton','#nextButton','#outputPanel'];
      const headerBottom=document.querySelector('.site-header')?.getBoundingClientRect().bottom||0;
      return {width:innerWidth,height:innerHeight,scrollWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),scrollHeight:Math.max(document.documentElement.scrollHeight,document.body.scrollHeight),scrollX,scrollY,headerBottom,
        controls:selectors.map(selector=>{const el=document.querySelector(selector);if(!el)return {selector,missing:true};const b=el.getBoundingClientRect(),style=getComputedStyle(el),interactive=el.matches('button,textarea,input')&&!el.disabled,hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return {selector,top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height,visible:style.display!=='none'&&style.visibility!=='hidden'&&b.width>2&&b.height>2,inside:b.top>=headerBottom-1&&b.bottom<=innerHeight+1&&b.left>=-1&&b.right<=innerWidth+1,hit:!interactive||hit===el||el.contains(hit)};})};
    });
    check(measure.scrollWidth<=measure.width+1,true,label+' has no horizontal document overflow: '+JSON.stringify(measure));
    check(measure.scrollHeight<=measure.height+1,true,label+' has no vertical document overflow: '+JSON.stringify(measure));
    check([measure.scrollX,measure.scrollY],[0,0],label+' never requires document scrolling');
    for(const control of measure.controls){check(Boolean(control.visible),true,label+' '+control.selector+' is visibly rendered: '+JSON.stringify(control));check(Boolean(control.inside),true,label+' '+control.selector+' stays in the same viewport: '+JSON.stringify(control));check(Boolean(control.hit),true,label+' '+control.selector+' is not obscured: '+JSON.stringify(control));}
    stats.layouts.push({label,width:measure.width,height:measure.height,scrollHeight:measure.scrollHeight,scrollWidth:measure.scrollWidth,maxBottom:Math.max(...measure.controls.map(c=>c.bottom||0))});
  }
  async function horizontal(page,label){check(await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)<=innerWidth+1),true,label+' has no horizontal overflow');}
  async function closeDialogs(page){for(let index=0;index<4&&await page.locator('dialog[open]').count();index++)await page.keyboard.press('Escape');check(await page.locator('dialog[open]').count(),0,'Dialogs close with Escape');}
  async function testDialog(page,opener,dialog){
    const draft=await page.locator('#codeInput').inputValue();await page.locator(opener).click();await page.waitForFunction(id=>document.querySelector(id)?.open,dialog);
    check(await page.locator(dialog).evaluate(el=>el.contains(document.activeElement)),true,'Dialog receives keyboard focus');
    for(let index=0;index<5;index++)await page.keyboard.press('Tab');
    const focus=await page.locator(dialog).evaluate(el=>({inside:el.contains(document.activeElement),hasFocus:document.hasFocus(),tag:document.activeElement?.tagName,id:document.activeElement?.id,open:el.open}));
    check(focus.inside||(!focus.hasFocus&&focus.tag==='BODY'&&focus.open),true,'Tab never reaches background game controls: '+JSON.stringify(focus));
    // A native browser may put Tab focus in browser chrome. Bring this isolated
    // page back before testing Escape; browser chrome is outside app ownership.
    if(!focus.inside){await page.bringToFront();await page.locator(dialog+' [data-close-dialog]').first().focus();}
    await page.keyboard.press('Escape');check(await page.locator(dialog).evaluate(el=>el.open),false,'Escape closes '+dialog);
    check(await page.evaluate(()=>document.activeElement?.id),opener.slice(1),'Dialog returns focus to its opener');check(await page.locator('#codeInput').inputValue(),draft,'Reading a dialog never loses the code draft');
  }
  async function choose(page,index=0){await page.locator('#routeChoices button').nth(index).click();await idle(page);check(await page.locator('#gateStatus').getAttribute('data-state'),'blocked','A route still requires a code solution');}
  try{
    const desktopViewports=process.env.CODE_QUEST_SCREEN_ACCESS_ONLY?[]:[{width:2048,height:805},{width:1366,height:768},{width:1165,height:800},{width:1165,height:600}];
    for(const viewport of desktopViewports){
      const ctx=await context({viewport}),page=await ctx.newPage();let navigations=0;page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++;});await page.goto(url);await ready(page);
      stats.viewports.push(viewport);check((await saved(page)).rooms[0].route,null,'The reported correct-code/no-route state is reproduced');check((await saved(page)).rooms[0].phase,'junction');check((await saved(page)).inventory,[]);check(await page.locator('#codeInput').inputValue(),DRAFT,'The already-edited program is present');
      match(await page.locator('#currentAction').innerText(),/choose|route|passage/i,'The missing prerequisite is explained next to the code');
      await desktopLayout(page,'edited-no-route '+viewport.width+'x'+viewport.height);await shot(page,'edited-no-route-'+viewport.width+'x'+viewport.height);
      const originalNavigations=navigations;
      await page.locator('#runButton').click();
      await page.waitForFunction(()=>document.querySelector('#outputPanel').dataset.state==='ready'&&/Your code is saved.*Choose a passage/i.test(document.querySelector('#outputTitle').textContent));
      check(await page.locator('#stage').evaluate(el=>el.classList.contains('is-running')),false,'A junction Run explains the prerequisite without executing the program');
      match(await page.locator('#outputText').textContent(),/choose either passage.*then Run the same code/i,'The missing route has a concrete next action');
      check((await saved(page)).rooms[0].route,null,'Running at the junction never silently chooses a route');check(await page.locator('#codeInput').inputValue(),DRAFT,'The explanatory route prerequisite preserves the correct draft');
      match(await page.locator('#currentAction').innerText(),/choose|route|passage/i);await desktopLayout(page,'run-at-junction recovery '+viewport.width+'x'+viewport.height);
      await page.locator('#openChoices').click();check(await page.locator('#choicesDialog').evaluate(el=>el.open),true);
      match(await page.locator('#choiceRouteNote').innerText(),/choose|route|passage/i,'No-typing mode explains its route prerequisite');
      check(await page.locator('#choiceButtons button:disabled').count(),3,'A command cannot bypass the unchosen route');
      await page.locator('#choiceRouteButton').click();check(await page.locator('#choicesDialog').evaluate(el=>el.open),false);
      check(await page.locator('#routeChoices').evaluate(el=>el.contains(document.activeElement)),true,'The route recovery control points to a visible passage');
      check((await saved(page)).rooms[0].route,null,'No-typing recovery never silently chooses for the player');check(await page.locator('#codeInput').inputValue(),DRAFT);
      for(let index=0;index<14;index++){
        check(await page.locator('#chapterCount').innerText(),'Mission '+(index+1)+' of 14');
        await desktopLayout(page,'mission '+(index+1)+' junction '+viewport.width+'x'+viewport.height);
        check(await page.locator('#nextButton').isDisabled(),true,'Continue cannot bypass an unchosen route');
        await choose(page);check(await page.locator('#nextButton').isDisabled(),true,'A chosen route is not automatically solved');
        if(index===0)check(await page.locator('#codeInput').inputValue(),DRAFT,'Choosing the visible route preserves the already-correct draft');
        await desktopLayout(page,'mission '+(index+1)+' blocked '+viewport.width+'x'+viewport.height);
        if(index===1){
          await page.locator('#runButton').click();await result(page,'error');check((await saved(page)).inventory.length,1,'Wrong code does not grant a reward');
          await desktopLayout(page,'wrong code retry '+viewport.width+'x'+viewport.height);
        }
        if(index>0)await page.locator('#codeInput').fill(missions[index].solution);
        await page.locator('#runButton').click();await result(page);check((await saved(page)).inventory.length,index+1);check((await saved(page)).defense,missions[index].quest.defense);
        check(await page.locator('#nextButton').isEnabled(),true,'Code success enables the visible Continue button');
        if(index===13&&await page.locator('dialog[open]').count())await closeDialogs(page);
        await desktopLayout(page,'mission '+(index+1)+' cleared '+viewport.width+'x'+viewport.height);stats.desktopMissions++;
        if(index===0){check(navigations,originalNavigations,'Recovery used no reload, reset, or navigation');check((await saved(page)).drafts[0],DRAFT,'Successful recovery preserves the exact draft');await shot(page,'first-success-'+viewport.width+'x'+viewport.height);}
        if(index<13)await page.locator('#nextButton').click();
      }
      check((await saved(page)).inventory.length,14);check((await saved(page)).defense,100);check(navigations,originalNavigations,'All fourteen chapters stay in the same document');await shot(page,'complete-'+viewport.width+'x'+viewport.height);await ctx.close();
    }
    // Mobile and high zoom may scroll vertically, but controls remain reachable
    // and modal keyboard handling must not trap the user or discard a draft.
    for(const config of [{name:'mobile-390',viewport:{width:390,height:844},isMobile:true,hasTouch:true},{name:'mobile-320',viewport:{width:320,height:844},isMobile:true,hasTouch:true},{name:'zoom-equivalent-200',viewport:{width:683,height:384},deviceScaleFactor:2}]){
      const {name,...options}=config,ctx=await context(options),page=await ctx.newPage();await page.goto(url);await ready(page);await horizontal(page,name);
      check(await page.locator('#codeInput').inputValue(),DRAFT);await page.locator('#routeChoices button').first().scrollIntoViewIfNeeded();await page.locator('#routeChoices button').first().focus();await page.keyboard.press('Enter');await idle(page);check(await page.locator('#codeInput').inputValue(),DRAFT,'Keyboard route selection preserves the draft');
      await testDialog(page,'#hintButton','#helpDialog');await testDialog(page,'#openStory','#storyDialog');await testDialog(page,'#openJourney','#journeyDialog');await testDialog(page,'#openChoices','#choicesDialog');
      await page.locator('#codeInput').focus();await page.keyboard.press('Tab');check(await page.evaluate(()=>document.activeElement?.id!=='codeInput'),true,'Tab leaves the code editor normally');check(await page.locator('#codeInput').inputValue(),DRAFT,'Keyboard navigation never inserts text');
      for(let index=0;index<8;index++){await page.keyboard.press('Tab');check(await page.evaluate(()=>!['startLessonButton','enterPuzzleButton'].includes(document.activeElement?.id)),true,'Legacy offscreen helpers never enter the Tab sequence');}
      await page.locator('#runButton').scrollIntoViewIfNeeded();await page.locator('#runButton').focus();await page.keyboard.press('Enter');await result(page);check(await page.locator('#nextButton').isEnabled(),true);await horizontal(page,name);
      await page.locator('#nextButton').scrollIntoViewIfNeeded();await shot(page,name);await page.locator('#nextButton').focus();await page.keyboard.press('Enter');check(await page.locator('#chapterCount').innerText(),'Mission 2 of 14');await choose(page,1);const route=(await saved(page)).rooms[1].route;await page.reload();await ready(page);check((await saved(page)).rooms[1].route,route,'Reload preserves the chosen encounter');
      await page.locator('#codeInput').fill(missions[1].solution);await page.locator('#runButton').click();await result(page);check((await saved(page)).inventory.length,2);await horizontal(page,name);stats.accessibility.push({name,viewport:options.viewport,deviceScaleFactor:options.deviceScaleFactor||1,passed:true});await ctx.close();
    }
    check(errors,[],'No page errors in layout, recovery, dialog, zoom-equivalent or keyboard flows');check(unexpected,[],'All game requests stay local');check(sourceHashes(),startingSources,'Product source remains unchanged during screen verification');
    const report={browser:browser.version(),stats,sources:sourceHashes(),scope:'Desktop document fits one viewport; mobile and 200%-zoom-equivalent viewport allow vertical scrolling. Browser zoom shortcut and physical devices are not verified.'};
    fs.writeFileSync(path.join(output,'screen-result.json'),JSON.stringify(report,null,2)+'\n');console.log('Code Quest one-screen QA passed: '+JSON.stringify({assertions:stats.assertions,desktopMissions:stats.desktopMissions,viewports:stats.viewports,accessibility:stats.accessibility,screenshots:stats.screenshots}));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
