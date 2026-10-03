'use strict';
// Optional real-browser smoke test: node tests/test-iris-browser.cjs
// Uses installed Playwright/Chromium and a loopback static server. No contact submit.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const docs=path.resolve(__dirname,'../docs');
let checks=0;const check=fn=>{fn();checks++;};
const server=http.createServer((req,res)=>{
 const file=path.resolve(docs,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(docs+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',({'html':'text/html','js':'text/javascript','css':'text/css','json':'application/json','svg':'image/svg+xml','png':'image/png'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
   const page=await browser.newPage({viewport}),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));
   await page.goto(origin+'/contact.html');await page.waitForFunction(()=>!document.getElementById('send-question').disabled);
   const ask=async q=>{await page.locator('#question').fill(q);await page.locator('#send-question').click();return page.locator('#answer-body').innerText();};
   assert.match(await ask('Tell me about Newbrian'),/matched that name to NewBrain/);checks++;
   const evidence=await ask('What has been tested?');assert.match(evidence,/16 fixtures remain unrun/);assert.match(evidence,/passed all 20 local pure-Python engineering checks/);assert.match(evidence,/scientific campaign remains unrun/);checks+=3;
   assert.match(await ask('Tell me about BlueBook'),/attribution and uncertainty/);checks++;
   assert.match(await ask('How does it work?'),/no probability or winner/);checks++;
   assert.match(await ask('Email Robert about NewBrain'),/Send message form/);checks++;
   await page.locator('#previous-answer').click();assert.match(await page.locator('#answer-title').innerText(),/BlueBook/);checks++;
   await page.locator('#next-answer').click();assert.match(await page.locator('#answer-title').innerText(),/Send Robert/);checks++;
   await page.locator('#clear-chat').click();assert.equal(await page.locator('#asked-question').isVisible(),false);checks++;
   assert.match(await ask('Is it ready?'),/choose a project/i);checks++;
   await page.locator('[data-prompt="What are the current projects?"]').click();assert.match(await page.locator('#answer-body').innerText(),/NewBrain.*IdeaForge.*Humanoid Researcher.*Kira World.*BlueBook/s);checks++;
   await page.locator('#refresh-notes').click();await page.waitForFunction(()=>!document.getElementById('send-question').disabled);
   assert.match(await ask('What is the latest Avatar Builder status?'),/8 new.*18 inherited.*22 inherited.*unrun/s);checks++;
   assert.match(await ask('Does Iris send my NewBrain questions anywhere?'),/conversation is not saved or sent/);checks++;
   assert.match(await ask('Tell me about NewBrain in plain English.'),/separate local-first research project/);checks++;
   assert.match(await ask('Can I actually talk to it yet?'),/actual generated replies remain unrun/);checks++;
   assert.match(await ask('Have the plasticity experiments shown it recovers from damage?'),/damage recovery is not yet demonstrated/);checks++;
   assert.match(await ask('What does IdeaForge do?'),/Start with an idea/);checks++;
   assert.match(await ask('Can I install Ideaforg on a Mac?'),/documented setup is Windows/);checks++;
   assert.match(await ask('Humanoid Researcher. Are its blueprints safe to manufacture?'),/not engineering certification or fabrication-ready geometry/);checks++;
   assert.match(await ask('What are the risks and limitations?'),/not engineering certification or fabrication-ready geometry/);checks++;
   const costPrivacy=await ask('How much does BlueBook cost, and does it keep my questions private?');assert.match(costPrivacy,/No public BlueBook price/);assert.match(costPrivacy,/not fully offline/);assert.doesNotMatch(costPrivacy,/FormSubmit/);checks+=3;
   assert.equal(await page.locator('#answer-sources a').getAttribute('href'),'knowledge.html#bluebook');checks++;
   await ask('What is Bluebok?');assert.match(await ask('So has it proven aliens are real?'),/does not prove extraterrestrial life/);checks++;
   assert.match(await ask('Does Iris send this chat to Robert?'),/conversation is not saved or sent/);checks++;
   assert.equal(await page.locator('#contact-name').inputValue(),'');assert.equal(await page.locator('#contact-message').inputValue(),'');checks+=2;
   await page.locator('#open-profiles').click();assert.equal(await page.locator('#profiles-dialog').isVisible(),true);await page.locator('#close-profiles').click();assert.equal(await page.locator('#profiles-dialog').isVisible(),false);checks+=2;
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);checks++;
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);checks++;
   assert.equal(requests.some(r=>r.method!=='GET'||r.body||/Newbrian|Who%20|questions%20|Avatar%20Builder/.test(r.url)),false);checks++;
   assert.deepEqual(errors,[]);checks++;
   await ask('Tell me about IdeaForge');await page.locator('#iris-title').scrollIntoViewIfNeeded();
   await page.screenshot({path:'/tmp/iris-'+viewport.width+'.png',fullPage:false});
   await page.goto(origin+'/knowledge.html#newbrain');assert.equal(await page.locator('#newbrain').count(),1);assert.equal(await page.locator('#kira-world').count(),1);assert.equal(await page.locator('#bluebook').count(),1);checks+=3;
   await page.locator('#newbrain summary').click();assert.equal(await page.locator('#newbrain details').getAttribute('open'),'');checks++;
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);checks++;
   await page.close();
  }
  // Integrity failure is visible and a retry recovers without sending a form.
  const page=await browser.newPage();let corrupt=true;
  await page.route('**/knowledge/iris-projects-2026-10-03-2.json',async route=>{if(corrupt)await route.fulfill({status:200,contentType:'application/json',body:'{}'});else await route.continue();});
  await page.goto(origin+'/contact.html');await page.waitForFunction(()=>document.getElementById('guide-status').textContent.includes('could not load'));
  assert.equal(await page.locator('#send-question').isDisabled(),true);checks++;
  assert.equal(await page.locator('#send-message').isDisabled(),false);checks++;
  corrupt=false;await page.locator('#refresh-notes').click();await page.waitForFunction(()=>!document.getElementById('send-question').disabled);
  await page.locator('#question').fill('Tell me about NewBrain');await page.locator('#send-question').click();assert.match(await page.locator('#answer-title').innerText(),/NewBrain/);checks++;
  await page.close();
  console.log(JSON.stringify({status:'PASS',checks,viewports:['1440x1000','390x844'],screenshots:['/tmp/iris-1440.png','/tmp/iris-390.png'],contact_submissions:0,model_calls:0},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
