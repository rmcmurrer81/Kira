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
 let started=false;
 async function start(){
  if(started)return;
  send.disabled=true;status.textContent='Loading the complete published knowledge…';
  try{
   if(!window.crypto?.subtle)throw Error('Secure integrity checks unavailable');
   const [pack,core]=await Promise.all(['sarah-packs.js','sarah-guide.js'].map(async p=>(await readOriginal(p)).text()));
   // Source code belongs to the user's fixed, hash-verified public repository.
   Function(pack)();
   window.SarahPacks=window.KiraIrisPolicy.wrap(window.SarahPacks);
   const renamed=core.replaceAll('Hi, I’m Sarah','Hi, I’m Iris').replaceAll('Sarah is speaking','Iris is speaking');
   let executable=renamed;
   if(window.KIRA_LABS_PREVIEW&&window.KiraIrisRoutingChecks){
    const marker='  loadKnowledge();';
    if(!renamed.includes(marker))throw Error('Original startup anchor changed');
    executable=renamed.replace(marker,`  loadKnowledge().then(()=>{
      if(!knowledge)return;
      const savedTopic=lastTopic,savedExchanges=exchanges;
      try{
        const report=window.KiraIrisRoutingChecks.run({knowledge,
          reset:()=>{lastTopic='';exchanges=[];},
          ask:q=>{const r=answer(q);lastTopic=r.id||lastTopic;exchanges.push({question:q,reply:r});return r;}
        });
        window.KIRA_IRIS_ROUTING_REPORT=report;
        const n=document.getElementById('knowledge-coverage');
        if(n)n.textContent+=report.failed.length?' · routing check needs attention':' · movie & TV checks passed';
        if(report.failed.length)console.warn('Iris routing checks',report);
      }catch(e){console.warn('Iris routing checks could not complete',e);}
      finally{lastTopic=savedTopic;exchanges=savedExchanges;}
    });`);
   }
   Function('fetch',executable)(readOriginal);
   started=true;
  }catch(e){
   status.textContent='The complete published knowledge could not load. Connect to the internet and press Reload notes. The message form still works independently.';
   document.getElementById('refresh-notes').onclick=start;
  }
 }
 await start();
})();
