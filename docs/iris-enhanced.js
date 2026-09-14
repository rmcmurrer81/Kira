/* Optional enhancement only. With enabled:false, it adds no UI, storage or network calls. */
(() => {
  'use strict';
  const config=window.KIRA_IRIS_ENHANCED;
  if(!config?.enabled)return;
  let endpoint;
  try{const u=new URL(config.endpoint);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||!(/\.workers\.dev$/.test(u.hostname)||u.hostname==='iris.kiralabs.org'))return;endpoint=u.origin;}catch{return;}
  const $=id=>document.getElementById(id), form=$('sarah-form');
  if(!form||!config.turnstileSiteKey)return;
  const KEY='kira-iris-remember-v1', DAY=86400000;
  let token='',tokenExpires=0,history=[],page=-1,busy=false,widget=null,challenge='',voice=false,generation=0;
  const panel=document.createElement('section');panel.className='iris-options';panel.setAttribute('aria-label','Enhanced Iris and privacy choices');
  panel.innerHTML='<h3>More natural questions. Your choice.</h3>'+
    '<label><input id="iris-cloud-choice" type="checkbox"> Use enhanced question matching</label>'+
    '<p>Your question and recent conversation are processed by Cloudflare. Iris still answers from reviewed public notes. The standard guide works without this option.</p>'+
    '<label><input id="iris-share-choice" type="checkbox" disabled> Share future questions and replies with Robert</label>'+
    '<p>Optional. Shared records are kept for up to 30 days and may appear in Robert’s weekly email. Do not enter secrets or sensitive records. Sharing is separate from contacting Robert.</p>'+
    '<label><input id="iris-remember-choice" type="checkbox"> Remember this conversation on this device</label>'+
    '<p>Optional. Avoid this on a shared device. Saved conversation expires after 30 days.</p>'+
    '<div id="iris-challenge" hidden></div><p id="iris-enhanced-status" role="status" aria-live="polite"></p>'+
    '<button type="button" id="iris-forget" class="subtle-button">Delete saved conversation</button>'+
    '<p><a href="privacy.html#enhanced-iris">Privacy and deletion details</a></p>';
  form.before(panel);
  const cloud=$('iris-cloud-choice'),share=$('iris-share-choice'),remember=$('iris-remember-choice'),status=$('iris-enhanced-status');
  const say=text=>{status.textContent=text;};
  function persist(){
    if(!remember.checked)return;
    try{localStorage.setItem(KEY,JSON.stringify({expires:Date.now()+30*DAY,token,tokenExpires,history:history.slice(-20)}));}
    catch{remember.checked=false;say('Device storage is unavailable. The conversation remains in this tab only.');}
  }
  // Reading only a previously opted-in record does not enable hosted processing.
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&saved.expires>Date.now()&&Array.isArray(saved.history)){
    token=typeof saved.token==='string'?saved.token:'';tokenExpires=Number(saved.tokenExpires)||0;
    history=saved.history.filter(e=>typeof e.question==='string'&&typeof e.reply?.answer==='string').slice(-20);page=history.length-1;remember.checked=true;
    say('A saved conversation is available. Enable enhanced matching to continue it. Nothing has been sent.');
  }else if(saved)localStorage.removeItem(KEY);}catch{}
  async function request(path,options={}){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),22000);
    try{
      const response=await fetch(endpoint+path,{...options,credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers},signal:controller.signal});
      const result=await response.json();if(!response.ok)throw Error(result.error||'service-unavailable');return result;
    }finally{clearTimeout(timeout);}
  }
  function showChallenge(){
    if(!cloud.checked)return;
    if(token&&tokenExpires>Date.now())return;
    $('iris-challenge').hidden=false;
    const render=()=>{
      if(!cloud.checked||widget!==null)return;
      widget=window.turnstile.render('#iris-challenge',{sitekey:config.turnstileSiteKey,action:'iris-start',theme:'dark',callback:value=>{challenge=value;say('Ready for your question.');},'expired-callback':()=>{challenge='';say('Please complete the check again.');},'error-callback':()=>say('The enhanced check could not load. Standard Iris is still available.')});
    };
    if(window.turnstile){render();return;}
    if(document.getElementById('iris-turnstile-script'))return;
    const script=document.createElement('script');script.id='iris-turnstile-script';script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=render;script.onerror=()=>say('The enhanced check could not load. Standard Iris is still available.');document.head.append(script);
  }
  cloud.addEventListener('change',()=>{
    generation++;share.disabled=!cloud.checked;
    if(!cloud.checked){share.checked=false;$('iris-challenge').hidden=true;voice=false;window.speechSynthesis?.cancel();say('Standard Iris selected. New questions stay in this tab.');return;}
    showChallenge();if(history.length)render();
  });
  share.addEventListener('change',()=>say(share.checked?'Future enhanced questions and replies may be shared with Robert. Earlier messages are not uploaded.':'Sharing is off. Previously shared records can be deleted with Delete saved conversation.'));
  remember.addEventListener('change',()=>{if(remember.checked)persist();else{try{localStorage.removeItem(KEY);}catch{}say('Device memory removed. Any shared server records are separate; use Delete saved conversation to remove them.');}});
  function safeSource(source){try{const u=new URL(source.url);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
  function speak(){if(!voice)return;const r=history[page]?.reply;if(!r||!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(r.title+'. '+r.answer);u.lang='en-US';window.speechSynthesis.speak(u);}
  function render(){
    const entry=history[page];if(!entry)return;const r=entry.reply;
    $('asked-question').hidden=false;$('asked-question').textContent=entry.question;
    $('answer-title').textContent=r.title;$('answer-label').textContent='IRIS · REVIEWED NOTES · '+(r.mode==='model-assisted-source-match'?'ENHANCED MATCHING':'STANDARD MATCHING');
    $('answer-body').replaceChildren(...r.answer.split(/\n\n+/).map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
    $('answer-sources').replaceChildren(...(r.sources||[]).filter(safeSource).map(s=>{const a=document.createElement('a');a.textContent=s.label+' ↗';a.href=s.url;if(new URL(s.url).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}return a;}));
    $('previous-answer').disabled=page<=0;$('next-answer').disabled=page>=history.length-1;
    $('answer-page').textContent='Reply '+(page+1)+' of '+history.length;$('copy-answer').disabled=false;
    document.querySelector('.sarah-answer')?.scrollTo(0,0);
    let feedback=$('iris-feedback');if(!feedback){feedback=document.createElement('div');feedback.id='iris-feedback';feedback.className='iris-feedback';$('answer-body').after(feedback);}
    feedback.replaceChildren();if(r.saved&&r.record_id){for(const [label,vote]of [['Helpful',1],['Not helpful',-1]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=async()=>{try{await request('/api/feedback',{method:'POST',body:JSON.stringify({id:r.record_id,vote})});b.disabled=true;say('Feedback recorded.');}catch{say('Feedback could not be saved.');}};feedback.append(b);}}
  }
  async function send(question){
    const q=question.trim();if(!q||busy||!cloud.checked)return;
    if(q.length>1200){say('Please keep your question under 1,200 characters.');return;}
    busy=true;const own=generation;$('send-question').disabled=true;
    try{
      if(!token||tokenExpires<=Date.now()){
        if(!challenge){showChallenge();say('Complete the check above, or turn off enhanced matching to use standard Iris.');return;}
        try{const s=await request('/api/session',{method:'POST',body:JSON.stringify({turnstile_token:challenge})});token=s.token;tokenExpires=s.expires;challenge='';$('iris-challenge').hidden=true;persist();}
        catch{challenge='';if(widget!==null)window.turnstile?.reset(widget);say('Enhanced Iris could not start. Standard Iris is still available.');return;}
      }
      if(own!==generation||!cloud.checked)return;
      say('Finding the right published notes…');
      const r=await request('/api/chat',{method:'POST',body:JSON.stringify({question:q,history:history.slice(-4).map(e=>({question:e.question.slice(0,600),answer:e.reply.answer.slice(0,1200)})),save:share.checked,consent_version:config.consentVersion})});
      if(own!==generation)return;
      if(r.fallback){fallback(q,r.answer);return;}
      history.push({question:q,reply:r});history=history.slice(-20);page=history.length-1;render();$('question').value='';persist();speak();
      say(r.saved?'This question and reply were shared with Robert.':(r.storage_notice||'Answered without saving this conversation on the server.'));
    }catch{if(own===generation)fallback(q,'Enhanced Iris is unavailable. Using the standard guide without a paid fallback.');}
    finally{busy=false;$('send-question').disabled=false;}
  }
  function fallback(question,message){cloud.checked=false;share.checked=false;share.disabled=true;voice=false;window.speechSynthesis?.cancel();say(message);$('send-question').disabled=false;$('question').value=question;form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));}
  form.addEventListener('submit',e=>{if(cloud.checked){e.preventDefault();e.stopImmediatePropagation();send($('question').value);}},true);
  $('question').addEventListener('keydown',e=>{if(cloud.checked&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();e.stopImmediatePropagation();send($('question').value);}},true);
  document.addEventListener('click',e=>{if(!cloud.checked)return;
    const prompt=e.target.closest('[data-prompt]');if(prompt){e.preventDefault();e.stopImmediatePropagation();send(prompt.dataset.prompt);return;}
    const id=e.target.closest('button')?.id;if(!['previous-answer','next-answer','clear-chat','copy-answer','voice-toggle'].includes(id))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(id==='previous-answer'){page=Math.max(0,page-1);render();speak();}
    if(id==='next-answer'){page=Math.min(history.length-1,page+1);render();speak();}
    if(id==='clear-chat'){generation++;history=[];page=-1;persist();$('answer-body').textContent='A new conversation. What would you like to know?';$('answer-title').textContent='Ask Iris';$('asked-question').hidden=true;$('answer-sources').replaceChildren();$('iris-feedback')?.replaceChildren();$('answer-page').textContent='';$('previous-answer').disabled=true;$('next-answer').disabled=true;say('New chat. Saved server records can be removed with Delete saved conversation.');}
    if(id==='copy-answer')navigator.clipboard?.writeText(history[page]?.reply.answer||'').then(()=>say('Answer copied.')).catch(()=>say('Select the answer text to copy it.'));
    if(id==='voice-toggle'){voice=!voice;e.target.textContent=voice?'Voice off':'Voice on';e.target.setAttribute('aria-pressed',String(voice));$('voice-status').textContent=voice?'Voice on · reads each reply':'Voice off';if(voice)speak();else window.speechSynthesis?.cancel();}
  },true);
  $('iris-forget').addEventListener('click',async()=>{
    generation++;
    try{if(token&&tokenExpires>Date.now())await request('/api/forget',{method:'DELETE'});}
    catch{say('Deletion was not confirmed. The deletion key remains in this tab so you can retry.');return;}
    token='';tokenExpires=0;history=[];page=-1;remember.checked=false;share.checked=false;cloud.checked=false;share.disabled=true;voice=false;window.speechSynthesis?.cancel();
    try{localStorage.removeItem(KEY);}catch{}
    $('answer-body').textContent='The saved conversation was cleared.';$('answer-title').textContent='Start fresh';$('asked-question').hidden=true;$('answer-sources').replaceChildren();$('iris-feedback')?.replaceChildren();$('answer-page').textContent='';$('previous-answer').disabled=true;$('next-answer').disabled=true;
    say('Saved device conversation and this session’s shared server records are cleared. Already delivered emails cannot be recalled.');
  });
})();
