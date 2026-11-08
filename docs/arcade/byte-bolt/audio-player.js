/* Small file player. No speech models, GPU, cloud requests or browser TTS. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.TownAudioPlayer=factory;})(typeof globalThis!=='undefined'?globalThis:this,function(env,onStatus){'use strict';
 const key='kira-town-read-aloud-v1';
 let enabled=false,audio=null,generation=0,timer=null,playing=false,last={text:'',who:''};
 try{enabled=env.localStorage.getItem(key)==='on';}catch{}
 const status=text=>onStatus(text);
 function stop(){
  generation++;playing=false;env.clearTimeout(timer);timer=null;
  if(audio){audio.onplaying=audio.onended=audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();}
 }
 function setEnabled(value){enabled=!!value;try{env.localStorage.setItem(key,enabled?'on':'off');}catch{}if(!enabled)stop();}
 function clips(text,who){
  const original=(env.TOWN_AUDIO?.lines||[]).find(line=>line.speaker===who&&line.text===text);
  if(original)return {sources:[original.src],label:'original character recording'};
  const sources=env.TownDialogue.segments(text).map(part=>env.TOWN_BUNDLED_AUDIO?.[part]);
  return sources.length&&sources.every(Boolean)?{sources,label:'bundled narrator'}:null;
 }
 function play(text,who){
  last={text,who};stop();
  if(!enabled){status('Read-aloud is off. Press Read aloud to enable it.');return;}
  const sequence=clips(text,who),id=generation;
  if(!sequence){status('Audio is not available for this line. Complete captions are shown.');return;}
  if(!audio){audio=new env.Audio();audio.preload='auto';audio.volume=1;}
  let index=0,settled=false;
  const fail=error=>{
   if(id!==generation||settled)return;
   settled=true;stop();
   status(error?.name==='NotAllowedError'?'Your browser blocked audio. Press Read aloud or Test voice to start it.':'Audio could not play. Check your connection and site sound, then press Read aloud or Test voice to retry. Captions stay available.');
  };
  function next(){
   if(id!==generation)return;
   env.clearTimeout(timer);settled=false;playing=false;
   if(index>=sequence.sources.length){status('Finished reading.');audio.onplaying=audio.onended=audio.onerror=null;return;}
   audio.onplaying=()=>{if(id===generation){env.clearTimeout(timer);timer=null;playing=true;status('Playing '+sequence.label+'. If silent, check your speaker volume and that this browser tab is not muted.');}};
   audio.onended=()=>{if(id===generation){index++;next();}};
   audio.onerror=()=>fail(new Error('media-error'));
   audio.src=sequence.sources[index];
   status('Loading voice…');
   timer=env.setTimeout(()=>fail(new Error('load-timeout')),10000);
   try{const pending=audio.play();if(pending&&typeof pending.catch==='function')pending.catch(fail);}catch(error){fail(error);}
  }
  next();
 }
 return {get enabled(){return enabled;},get playing(){return playing;},setEnabled,play,stop,replay(){play(last.text,last.who);},clips};
});
