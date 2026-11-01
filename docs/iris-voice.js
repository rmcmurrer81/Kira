/* One gentle voice for Iris. Existing published-answer engine remains untouched.
 * This is optional browser speech, not a microphone or hosted Kira Labs TTS service.
 * No voice selection or preview interface; speech starts only when Voice on is clicked.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const toggle=$('voice-toggle'),status=$('voice-status'),title=$('answer-title');
  const body=$('answer-body'),question=$('asked-question'),page=$('answer-page');
  const clear=$('clear-chat');
  if(!toggle||!status||!title||!body||!question||!page)return;

  const synth=window.speechSynthesis, Utterance=window.SpeechSynthesisUtterance;
  const supported=Boolean(synth&&Utterance&&typeof synth.speak==='function');
  let enabled=false,token=0,lastReply='',pending=null;

  // This is an ordered *fixed* preference, not a user-facing selection menu.
  // Jenny is among the natural female voices actually seen in Edge on this site.
  const priorities=[
    /\bJenny\b.*\bNatural\b/i,
    /\bAva\b.*\bNatural\b/i,
    /\bEmma\b.*\bNatural\b/i,
    /\bSonia\b.*\bNatural\b/i,
    /\bAria\b.*\bNatural\b/i,
    /\bSamantha\b/i,
    /\bZira\b/i,
    /\bHazel\b/i,
    /\bSusan\b/i,
    /\bKaren\b/i,
    /\bMoira\b/i,
    /\bAllison\b/i
  ];
  function chooseVoice(){
    if(!supported)return null;
    const voices=Array.from(synth.getVoices()||[]).filter(v=>/^en(?:-|_|$)/i.test(v.lang||''));
    for(const pattern of priorities){
      const found=voices.find(v=>pattern.test(v.name||''));
      if(found)return found;
    }
    // If none of those is installed, prefer an English voice the browser knows.
    return voices.find(v=>v.default)||voices[0]||null;
  }
  function updateStatus(message){
    toggle.textContent=enabled?'Voice off':'Voice on';
    toggle.setAttribute('aria-pressed',String(enabled));
    status.textContent=message||(enabled?'Iris voice on · reads each new reply':'Voice off · text chat always available');
  }
  function stop(){
    token++;
    if(pending!==null){clearTimeout(pending);pending=null;}
    if(supported)synth.cancel();
  }
  function getReply(){
    const subject=title.textContent.trim(),answer=body.textContent.trim(),q=question.textContent.trim();
    if(!q||question.hidden||q.toLowerCase()==='hello'||!answer||subject==='What would you like to know?')return null;
    return {key:[page.textContent.trim(),q,subject,answer].join('\u001f'),text:subject+'. '+answer};
  }
  function partsOf(text){
    // Word-safe chunks preserve whole answers and reduce browser TTS cutoffs.
    const units=text.replace(/\s+/g,' ').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
    const result=[];let part='';
    for(const sentence of units){
      for(const word of sentence.trim().split(/\s+/)){
        if(!word)continue;
        if(part&&part.length+word.length+1>210){result.push(part);part='';}
        part+=(part?' ':'')+word;
      }
    }
    if(part)result.push(part);
    return result;
  }
  function speak(text){
    stop();
    if(!enabled||!supported)return;
    const current=token,chosen=chooseVoice(),chunks=partsOf(text);
    let index=0;
    function next(){
      if(!enabled||current!==token)return;
      if(index>=chunks.length){updateStatus();return;}
      const utterance=new Utterance(chunks[index++]);
      if(chosen)utterance.voice=chosen;
      utterance.lang=chosen?.lang||'en-US';
      // Avoid a raised artificial pitch: natural voices sound better near default.
      utterance.rate=0.96;utterance.pitch=1;utterance.volume=1;
      utterance.onstart=()=>{if(current===token)updateStatus('Iris is speaking');};
      utterance.onend=next;
      utterance.onerror=event=>{
        if(current!==token||event.error==='canceled'||event.error==='interrupted')return;
        enabled=false;
        stop();
        updateStatus('Speech unavailable · you can still read Iris’s answer');
      };
      try{synth.speak(utterance);}
      catch(_){
        if(current===token){enabled=false;stop();updateStatus('Speech unavailable · text chat still works');}
      }
    }
    next();
  }
  function readLatest(force=false){
    if(!enabled)return;
    const reply=getReply();
    if(!reply){updateStatus();return;}
    if(!force&&reply.key===lastReply)return;
    lastReply=reply.key;
    speak(reply.text);
  }
  function scheduleRead(){
    if(!enabled)return;
    if(pending!==null)clearTimeout(pending);
    pending=setTimeout(()=>{pending=null;readLatest();},100);
  }

  if(!supported){
    toggle.disabled=true;
    updateStatus('Speech is unavailable in this browser · text chat still works');
    return;
  }
  // Intercept the old guide voice toggle before its frozen speech handler:
  // the old internal voice remains off, preventing two people reading at once.
  toggle.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    enabled=!enabled;
    if(!enabled){stop();updateStatus();return;}
    lastReply='';
    updateStatus('Iris voice on');
    readLatest(true);
  },true);
  clear?.addEventListener('click',()=>{
    stop();lastReply='';
    if(enabled)updateStatus('Iris voice on · ready for a new question');
  },true);
  const observer=new MutationObserver(scheduleRead);
  for(const node of [title,body,page,question])
    observer.observe(node,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
  addEventListener('pagehide',()=>{enabled=false;stop();});
  updateStatus();
})();