const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),D=require('../dialogue.js'),C=require('../core.js'),create=require('../audio-player.js');
const maps={window:{}};for(const file of ['audio-map.js','audio-bundled-map.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),maps);
function harness(storageValue){
 const states=[],audios=[],pending=[],timers=new Map();let serial=0;
 class Audio{constructor(){this.paused=true;audios.push(this);}play(){this.paused=false;return new Promise((resolve,reject)=>pending.push({resolve,reject}));}pause(){this.paused=true;}removeAttribute(){this.src='';}load(){}}
 const storage={value:storageValue,getItem(){return this.value;},setItem(k,v){this.value=v;}};
 const env={...maps.window,TownDialogue:D,Audio,localStorage:storage,setTimeout(fn){timers.set(++serial,fn);return serial;},clearTimeout(id){timers.delete(id);}};
 const player=create(env,text=>states.push(text));return {player,states,audios,pending,storage,timers,env};
}
test('every current conversation, project and finite repeat variation has complete packaged speech',()=>{
 const h=harness();
 for(const text of D.allText()){const clips=h.player.clips(text,'Narrator');assert(clips,`Missing: ${text}`);for(const file of clips.sources)assert(fs.statSync(path.join(root,file)).size>1000,file);}
 for(const j of C.jobs)for(let round=49;round<=192;round++)assert(h.player.clips(C.challenge(j.id,round).brief,j.who));
 assert.equal(Object.keys(maps.window.TOWN_BUNDLED_AUDIO).length,318);
 assert.equal(D.segments('Use a 3.3 V supply. Check it.')[0],'Use a 3.3 V supply.');
});
test('original recording only selected for exactly matching text, not a stale prefix',()=>{
 const h=harness();assert.deepEqual(h.player.clips(D.intro,'Iris').sources,['audio/iris-intro.wav']);
 assert.equal(h.player.clips(D.intro+' Different instructions.','Iris'),null);
});
test('read-aloud stays opt-in and its preference survives reload',()=>{
 const h=harness();h.player.play(D.test,'Narrator');assert.equal(h.audios.length,0);h.player.setEnabled(true);assert.equal(h.storage.value,'on');assert(harness('on').player.enabled);h.player.setEnabled(false);assert.equal(h.storage.value,'off');
});
test('audio only reports playing after a media event, advances all sentences and stops at the end',()=>{
 const h=harness('on');h.player.play(D.test,'Narrator');const a=h.audios[0];assert.equal(h.states.at(-1),'Loading voice…');a.onplaying();assert(h.player.playing);assert.match(h.states.at(-1),/^Playing bundled narrator/);assert.equal(h.timers.size,0);a.onended();assert.equal(h.states.at(-1),'Loading voice…');a.onplaying();a.onended();assert.equal(h.states.at(-1),'Finished reading.');assert(!h.player.playing);assert.equal(h.audios.length,1);
});
test('close, hide and disable can cancel immediately without late audio resurrection',async()=>{
 const h=harness('on');h.player.play(D.test,'Narrator');const a=h.audios[0],oldEnd=a.onended,oldError=a.onerror;h.player.stop();oldEnd();oldError();h.pending[0].reject(new Error('late failure'));await Promise.resolve();assert(a.paused);assert.equal(a.src,'');assert.equal(h.pending.length,1);assert.equal(h.timers.size,0);
});
test('rapid replay ignores the rejected promise from the previous playback',async()=>{
 const h=harness('on');h.player.play(D.test,'Narrator');h.player.replay();h.pending[0].reject(new Error('old play aborted'));await Promise.resolve();assert.equal(h.states.at(-1),'Loading voice…');h.audios[0].onplaying();assert(h.player.playing);h.player.setEnabled(false);assert(h.audios[0].paused);
});
test('blocked autoplay, missing audio and a stalled load give useful retry messages, not false success',async()=>{
 const h=harness('on');h.player.play(D.test,'Narrator');h.pending[0].reject({name:'NotAllowedError'});await Promise.resolve();assert.match(h.states.at(-1),/browser blocked audio/);assert(h.audios[0].paused);
 h.player.replay();h.audios[0].onerror();assert.match(h.states.at(-1),/Audio could not play/);
 h.player.replay();[...h.timers.values()][0]();assert.match(h.states.at(-1),/retry/);
});
test('unavailable storage does not break audio or progress',()=>{
 const h=harness();h.env.localStorage={getItem(){throw Error('disabled');},setItem(){throw Error('disabled');}};const p=create(h.env,()=>{});p.setEnabled(true);p.play(D.test,'Narrator');assert.equal(h.audios.length,1);
});
test('the player never calls installed speech or AI inference',()=>{
 const source=fs.readFileSync(path.join(root,'audio-player.js'),'utf8');assert(!/speechSynthesis|SpeechSynthesisUtterance|fetch\(|WebAssembly|WebGPU/.test(source));
});
