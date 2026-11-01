'use strict';
// 1. CAST: IDs map to display names and folders. These are fictional characters.
// No recordings are supplied. Record yourself or use voices you may distribute.
const CHARACTERS = {
  mira: {name:'Mira', voiceFolder:'audio/mira/'},
  sol: {name:'Sol', voiceFolder:'audio/sol/'}
};
// 2. ORDERED LINES: several turns can happen without changing location.
const DIALOGUE = [
  {speaker:'mira', text:'The lantern is ready. What should we do next?', file:'01-ready.wav'},
  {speaker:'sol', text:'Let us bring it to the neighbors.', file:'02-neighbors.wav'},
  {speaker:'mira', text:'Good idea. I will carry it carefully.', file:'03-carefully.wav'}
];
function validateConversation(cast,lines) {
  const errors=[];
  for(const [index,line] of lines.entries()) {
    if(!Object.hasOwn(cast,line.speaker)) errors.push('Line '+index+' has an unknown speaker');
    if(typeof line.text!=='string' || !line.text.trim()) errors.push('Line '+index+' needs text');
    if(!/^[a-zA-Z0-9_-]+\.wav$/.test(line.file)) errors.push('Line '+index+' needs a simple WAV filename');
  }
  for(const person of Object.values(cast)) if(!/^audio\/[a-zA-Z0-9_-]+\/$/.test(person.voiceFolder)) errors.push('Voice folders must stay under audio/');
  return errors;
}
function describeLine(index,cast=CHARACTERS,lines=DIALOGUE) {
  const line=lines[index];
  if(!line || !Object.hasOwn(cast,line.speaker)) return null;
  return {name:cast[line.speaker].name,text:line.text,path:cast[line.speaker].voiceFolder+line.file};
}
const $=id=>document.getElementById(id);
let lineIndex=0, generation=0, activeAudio=null, cancelWait=null;
function status(text){$('status').textContent=text;}
function showLine(){
  const line=describeLine(lineIndex);
  $('position').textContent='Line '+(lineIndex+1)+' of '+DIALOGUE.length;
  $('speaker').textContent=line.name;
  $('subtitle').textContent=line.text;
  $('next').disabled=lineIndex===DIALOGUE.length-1;
}
// 3. CANCEL: settle the old wait as well as stopping its audio.
// Without settling, a sequential player could wait forever after Next or Stop.
function stopPlayback(){
  generation++;
  if(cancelWait){const cancel=cancelWait;cancelWait=null;cancel();}
  if(activeAudio){activeAudio.pause();activeAudio.currentTime=0;activeAudio=null;}
}
// 4. FINISH, NOT START: play() resolving means playback STARTED.
// Only the ended event means this line completed naturally.
function playOne(token){
  return new Promise(resolve=>{
    const line=describeLine(lineIndex),clip=new Audio(line.path);
    activeAudio=clip;clip.volume=0.8;
    let settled=false;
    function finish(reason){
      if(settled)return;settled=true;
      clip.removeEventListener('ended',ended);clip.removeEventListener('error',failed);
      if(reason!=='ended'){clip.pause();clip.currentTime=0;}
      if(activeAudio===clip)activeAudio=null;
      if(cancelWait===cancel)cancelWait=null;
      resolve(reason);
    }
    function ended(){finish(token===generation?'ended':'cancelled');}
    function failed(){if(settled)return;if(token===generation)status('Audio unavailable. Read the subtitle and use Next line.');finish('failed');}
    function cancel(){finish('cancelled');}
    cancelWait=cancel;
    clip.addEventListener('ended',ended);clip.addEventListener('error',failed);
    status('Loading '+line.name+'’s optional recording…');
    try{
      Promise.resolve(clip.play()).then(()=>{
        if(token!==generation || settled){clip.pause();return;}
        status('Playing '+line.name+'’s line.');
      },()=>failed());
    }catch(error){failed();}
  });
}
async function replay(){
  stopPlayback();const token=generation;
  const result=await playOne(token);
  if(token===generation && result==='ended')status('Line finished. Use Next line or Replay.');
}
async function playRemaining(){
  stopPlayback();const token=generation;
  while(token===generation){
    const result=await playOne(token);
    if(token!==generation || result!=='ended')return;
    if(lineIndex===DIALOGUE.length-1){status('Conversation finished.');return;}
    lineIndex++;showLine();
  }
}
function nextLine(){
  stopPlayback();
  if(lineIndex<DIALOGUE.length-1)lineIndex++;
  showLine();status('Text mode. Replay this line or play the remaining lines.');
}
$('next').addEventListener('click',nextLine);
$('replay').addEventListener('click',()=>void replay());
$('sequence').addEventListener('click',()=>void playRemaining());
$('stop').addEventListener('click',()=>{stopPlayback();status('Stopped. The current subtitle remains visible.');});
$('restart').addEventListener('click',()=>{stopPlayback();lineIndex=0;showLine();status('Restarted in text mode. No sound starts automatically.');});
const errors=validateConversation(CHARACTERS,DIALOGUE);
if(errors.length){status(errors.join('; '));for(const id of ['next','replay','sequence','stop','restart'])$(id).disabled=true;}
else {showLine();status('Text mode. No recordings are included; add your own permitted WAV files to try sound.');}
