/* Kira Labs arcade voice — same fixed, gentle English voice preference as Iris.
 * Iris and the games use the browser's SpeechSynthesis voices (no selector).
 * Voice starts only after a player click. Sound never records a microphone.
 * Game effects are original tones synthesized in the visitor's browser.
 */
(() => {
  "use strict";
  const priorities=[
    /\bJenny\b.*\bNatural\b/i, /\bAva\b.*\bNatural\b/i,
    /\bEmma\b.*\bNatural\b/i, /\bSonia\b.*\bNatural\b/i,
    /\bAria\b.*\bNatural\b/i, /\bSamantha\b/i, /\bZira\b/i,
    /\bHazel\b/i, /\bSusan\b/i, /\bKaren\b/i,
    /\bMoira\b/i, /\bAllison\b/i
  ];
  const getEngine=()=>window.speechSynthesis;
  const supported=()=>Boolean(getEngine()&&window.SpeechSynthesisUtterance);
  const chooseVoice=()=>{
    if(!supported())return null;
    const voices=Array.from(getEngine().getVoices()||[]).filter(v=>/^en(?:-|_|$)/i.test(v.lang||""));
    for(const pattern of priorities){const voice=voices.find(v=>pattern.test(v.name||""));if(voice)return voice;}
    return voices.find(v=>v.default)||voices[0]||null;
  };
  const chunk=text=>{
    const pieces=String(text||"").replace(/\s+/g," ").trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
    const output=[];let part="";
    for(const sentence of pieces){
      for(const word of sentence.trim().split(/\s+/)){
        if(!word)continue;
        if(part && part.length+word.length+1>205){output.push(part);part="";}
        part+=(part?" ":"")+word;
      }
    }
    if(part)output.push(part);
    return output.slice(0,30);
  };
  window.KiraArcadeVoice={
    create(options={}){
      const synth=getEngine(), Utterance=window.SpeechSynthesisUtterance;
      const available=supported();
      let enabled=false,token=0,sfx=null,vol=null;
      const status=typeof options.onStatus==="function"?options.onStatus:()=>{};
      function stop(){
        token++;
        if(available)synth.cancel();
        options.onSpeaking?.(false);
      }
      function disable(){
        enabled=false;stop();
        if(sfx){try{sfx.suspend();}catch(_){}}
        status("Sound off");
      }
      function enable(){
        if(!available){status("Voice unavailable in this browser");return false;}
        enabled=true;
        // getVoices() triggers population in browsers that load voices asynchronously.
        synth.getVoices();
        status("Sound on · Iris voice");
        return true;
      }
      function speak(text){
        if(!enabled||!available)return false;
        stop();
        const parts=chunk(text);
        if(!parts.length)return false;
        const ticket=token,voice=chooseVoice();
        let i=0;
        const next=()=>{
          if(ticket!==token||!enabled)return;
          if(i>=parts.length){options.onSpeaking?.(false);status("Sound on · Iris voice");return;}
          const utter=new Utterance(parts[i++]);
          if(voice)utter.voice=voice;
          utter.lang=voice?.lang||"en-US";
          utter.rate=0.96;utter.pitch=1;utter.volume=1;
          utter.onstart=()=>{if(ticket!==token)return;options.onSpeaking?.(true);status("Narrating with Iris voice…");};
          utter.onend=next;
          utter.onerror=event=>{
            if(ticket!==token||event.error==="canceled"||event.error==="interrupted")return;
            options.onSpeaking?.(false);
            status("Narration could not play · try replay");
          };
          try{synth.speak(utter);}catch(_){options.onSpeaking?.(false);status("Narration unavailable");}
        };
        next();return true;
      }
      function cue(kind="tap"){
        if(!enabled)return;
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)return;
        try{
          if(!sfx){sfx=new AC();vol=sfx.createGain();vol.gain.value=0.095;vol.connect(sfx.destination);}
          if(sfx.state==="suspended")sfx.resume();
          const melody=kind==="win"?[[523,0],[659,.14],[784,.29],[1047,.44]]
            :kind==="scene"?[[440,0],[588,.12]]:kind==="wrong"?[[260,0],[220,.12]]:[[540,0]];
          melody.forEach(([frequency,delay])=>{
            const osc=sfx.createOscillator(),gain=sfx.createGain(),at=sfx.currentTime+delay;
            osc.type="sine";osc.frequency.setValueAtTime(frequency,at);
            gain.gain.setValueAtTime(0,at);
            gain.gain.linearRampToValueAtTime(0.20,at+0.02);
            gain.gain.exponentialRampToValueAtTime(0.001,at+0.20);
            osc.connect(gain);gain.connect(vol);osc.start(at);osc.stop(at+0.21);
          });
        }catch(_){/* Speech remains available when Web Audio is blocked. */}
      }
      window.addEventListener("pagehide",()=>{stop();if(sfx)try{sfx.close();}catch(_){}},{once:true});
      return {enable,disable,stop,speak,cue,get enabled(){return enabled;},get supported(){return available;},chooseVoice};
    },
    chooseVoice,priorities
  };
})();