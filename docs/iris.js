/* Restore the original, complete published guide under the Iris name.
 * Original guide/pack code is loaded from the preserved source snapshot and
 * verified against its Git blob IDs BEFORE execution. Public JSON pack content
 * is checked by the original loader's SHA-256 validation.
 * No question, answer, credential, or private state enters these asset requests.
 */
(async()=>{
 'use strict';
 if(!document.getElementById('sarah-form'))return;
 const SNAPSHOT='5fb345f72852d180b0c4b25a4c1bb83215ace6a7';
 const BASE='https://raw.githubusercontent.com/rmcmurrer81/Kira/'+SNAPSHOT+'/docs/';
 const registry=Object.freeze({
  'sarah-guide.js':'b68d35c9a2707af483ee437ef250bf79d22d3cb3',
  'sarah-packs.js':'c0470269b5cc6e8cb859d490c10795182c3d5b4f',
  'sarah-knowledge.json':'c0222a64881f5e7889cdfc5d30bbcc9d90a078a0',
  'knowledge-index.json':'2236f326f1e20425c596aeb51f01939046ce0b47',
  'knowledge/robert-2026-09-12-1.json':null,
  'knowledge/kira-world-2026-09-12-1.json':null,
  'knowledge/updates-2026-09-12-1.json':null,
  'knowledge/projects-2026-09-12-1.json':null
 });
 // Immutable release path: never overwrite a pack needed by a cached loader.
 const PROJECT_NOTES='knowledge/iris-projects-2026-10-22-2.json';
 const PROJECT_SHA256='e52835ea40547d243acf1ccd5cf1572e660feae41704d632fba343be9fe5a886';
 const status=document.getElementById('guide-status'),send=document.getElementById('send-question');
 const nativeFetch=window.fetch.bind(window);
 async function blobHash(text){
  const enc=new TextEncoder(),body=enc.encode(text),header=enc.encode('blob '+body.length+'\0');
  const bytes=new Uint8Array(header.length+body.length);bytes.set(header);bytes.set(body,header.length);
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
 }
 async function readOriginal(path,options={}){
  if(typeof path!=='string'||!Object.prototype.hasOwnProperty.call(registry,path))throw Error('Unapproved original asset path');
  const urls=[];
  if(!window.KIRA_LABS_PREVIEW&&/^https?:$/.test(location.protocol))urls.push(new URL(path,location.href).href);
  urls.push(BASE+path);
  let last;
  for(const url of urls){
   const controller=new AbortController();const abort=()=>controller.abort();
   options.signal?.addEventListener('abort',abort,{once:true});
   const timer=setTimeout(abort,10000);
   try{
    const response=await nativeFetch(url,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal});
    if(!response.ok)throw Error('Original asset unavailable');
    const text=await response.text();if(text.length>800000)throw Error('Original asset too large');
    if(registry[path]&&await blobHash(text)!==registry[path])throw Error('Original asset integrity mismatch');
    return {ok:true,status:200,text:async()=>text,json:async()=>JSON.parse(text)};
   }catch(e){last=e;if(options.signal?.aborted)throw e;}
   finally{clearTimeout(timer);options.signal?.removeEventListener('abort',abort);}
  }
  throw last||Error('Original asset unavailable');
 }
 async function readProjects(){
  if(!window.KiraIrisProjects)throw Error('Project retrieval module unavailable');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   const url=new URL(PROJECT_NOTES,location.href).href;
   const response=await nativeFetch(url,{method:'GET',credentials:'omit',cache:'no-store',signal:controller.signal});
   if(!response.ok)throw Error('Current project notes unavailable');
   const text=await response.text();if(text.length>100000)throw Error('Project notes too large');
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),n=>n.toString(16).padStart(2,'0')).join('');
   if(digest!==PROJECT_SHA256)throw Error('Project notes integrity mismatch');
   return window.KiraIrisProjects.validate(JSON.parse(text));
  }finally{clearTimeout(timer);}
 }

 // The published legacy scripts are served as normal same-origin scripts.
 // Avoid dynamic Function() execution in production, which may be restricted by
 // a visitor's browser security policy even when all knowledge files are valid.
 const LEGACY_SCRIPTS=new Set(['sarah-packs.js','sarah-guide.js']);
 function loadLocalScript(path){
   if(!LEGACY_SCRIPTS.has(path))return Promise.reject(Error('Unknown guide script'));
   return new Promise((resolve,reject)=>{
     const script=document.createElement('script');
     const url=new URL(path,location.href);url.searchParams.set('iris-core','2026-10-18.3');script.src=url.href;
     script.async=false;
     script.onload=()=>resolve();
     script.onerror=()=>reject(Error('A required guide script could not load: '+path));
     document.head.appendChild(script);
   });
 }
 function keepGuideName(){
   const el=document.getElementById('voice-status');
   if(!el||!window.MutationObserver)return;
   const rename=()=>{if(el.textContent.includes('Sarah is speaking'))el.textContent=el.textContent.replace('Sarah is speaking','Iris is speaking');};
   new MutationObserver(rename).observe(el,{childList:true,characterData:true,subtree:true});
   rename();
 }
 let started=false;
 async function start(){
   if(started)return;
   send.disabled=true;status.textContent='Checking published knowledge…';
   try{
     if(!window.crypto?.subtle)throw Error('Secure knowledge verification is unavailable in this browser');
     if(!window.KiraIrisPolicy||!window.KiraIrisProjects)throw Error('A required Iris module did not load');
     // The independently reviewed project extension is optional at startup:
     // missing updated notes must not disable the entire legacy guide.
     let projectNotes=null,projectNoteProblem='';
     try{projectNotes=await readProjects();}
     catch(e){projectNoteProblem=e?.message||'Project extension unavailable';}
     window.KIRA_IRIS_PROJECT_EXTENSION_UNAVAILABLE=Boolean(projectNoteProblem);
     // Verify exact core scripts from the preserved public snapshot first.
     const [pack,core]=await Promise.all([
       readOriginal('sarah-packs.js').then(r=>r.text()),
       readOriginal('sarah-guide.js').then(r=>r.text())
     ]);
     if(window.KIRA_LABS_PREVIEW){
       // The existing review-only test route still runs with the pinned fetcher.
       Function(pack)();
       window.SarahPacks=window.KiraIrisPolicy.wrap(window.SarahPacks,projectNotes);
       const renamed=core.replaceAll('Hi, I’m Sarah','Hi, I’m Iris').replaceAll('Sarah is speaking','Iris is speaking');
       Function('fetch',renamed)(readOriginal);
     }else{
       await loadLocalScript('sarah-packs.js');
       window.SarahPacks=window.KiraIrisPolicy.wrap(window.SarahPacks,projectNotes);
       await loadLocalScript('sarah-guide.js');
       keepGuideName();
     }
     started=true;
     if(projectNoteProblem){
       const coverage=document.getElementById('knowledge-coverage');
       if(coverage){
         coverage.hidden=false;
         coverage.textContent='Iris is using the complete core guide; the latest project extension is temporarily unavailable. Select Check updates to retry.';
       }
       const reload=document.getElementById('refresh-notes');
       if(reload){reload.textContent='Reload updated guide';reload.onclick=()=>location.reload();}
       console.warn('Optional Iris extension unavailable',projectNoteProblem);
     }
   }catch(e){
     // Preserve readable pages and the independent contact form. Show a clear
     // recovery path instead of leaving an unexplained disabled Ask button.
     const cause=String(e?.message||'startup error');
     const detail=/integrity mismatch/i.test(cause)?'A published file did not pass its integrity check.':/script could not load/i.test(cause)?'A required chat script did not load.':/unavailable|fetch|network|load failed|timeout|abort/i.test(cause)?'A required knowledge file could not be reached.':/secure knowledge verification/i.test(cause)?'Secure browser verification is unavailable.':'A required guide component could not initialize.';
     status.textContent='Iris could not start: '+detail+' Tap Retry Iris below, or use the separate contact form to reach Kira Labs.';
     const coverage=document.getElementById('knowledge-coverage');if(coverage){coverage.hidden=false;coverage.textContent='The guide has not loaded; this is a website issue, not a failure of the research projects. The contact form remains separate.';}
     const reload=document.getElementById('refresh-notes');
     if(reload){reload.textContent='Retry Iris';reload.onclick=()=>location.reload();}
     console.warn('Iris startup unavailable',e);
   }
 }
 await start();
})();
