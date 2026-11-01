const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{constructor(){this.textContent='';this.handlers={};this.disabled=false;}addEventListener(e,f){this.handlers[e]=f;}fire(e){return this.handlers[e]?.();}set innerHTML(_){throw Error('No HTML injection');}}
const els=Object.fromEntries(['position','speaker','subtitle','next','replay','sequence','stop','restart','status'].map(k=>[k,new Element()]));
let mode='ok';const clips=[];
class AudioMock{
 constructor(path){this.path=path;this.events={};this.saved={};this.paused=false;clips.push(this);}
 addEventListener(e,f){this.events[e]=f;this.saved[e]=f;}removeEventListener(e,f){if(this.events[e]===f)delete this.events[e];}
 play(){if(mode==='reject')return Promise.reject(Error('missing'));if(mode==='hold')return new Promise(r=>this.resolve=r);return Promise.resolve();}
 pause(){this.paused=true;}fire(e){this.events[e]?.();}
}
const ctx=vm.createContext({document:{getElementById:k=>els[k]},Audio:AudioMock});vm.runInContext(fs.readFileSync(__dirname+'/conversation.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),tick=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};let count=0;
async function check(name,fn){await fn();count++;console.log('PASS '+name);}
(async()=>{
await check('initial text and no autoplay',()=>{assert.equal(clips.length,0);assert.equal(els.speaker.textContent,'Mira');assert.equal(run('lineIndex'),0);});
await check('valid cast and ordered lines',()=>{assert.equal(run('validateConversation(CHARACTERS,DIALOGUE).length'),0);assert.equal(run('describeLine(1).name'),'Sol');assert.equal(run('describeLine(1).path'),'audio/sol/02-neighbors.wav');});
await check('unknown speaker and unsafe path rejected',()=>{assert.ok(run("validateConversation(CHARACTERS,[{speaker:'ghost',text:'Hi',file:'../oops.wav'}]).length")>0);});
await check('third character works without changing player',()=>{assert.equal(run("describeLine(0,{...CHARACTERS,lee:{name:'Lee',voiceFolder:'audio/lee/'}},[{speaker:'lee',text:'Hello!',file:'04-hello.wav'}]).path"),'audio/lee/04-hello.wav');assert.equal(run("validateConversation({...CHARACTERS,lee:{name:'Lee',voiceFolder:'audio/lee/'}},[...DIALOGUE,{speaker:'lee',text:'Hello!',file:'04-hello.wav'}]).length"),0);});
await check('Next changes speaker and text without audio',()=>{els.next.fire('click');assert.equal(els.speaker.textContent,'Sol');assert.equal(clips.length,0);els.restart.fire('click');});
await check('sequence does not advance when play promise resolves',async()=>{run('void playRemaining()');await tick();assert.equal(run('lineIndex'),0);assert.equal(clips.length,1);assert.equal(clips[0].volume,0.8);});
await check('ended advances in exact speaker order',async()=>{clips.at(-1).fire('ended');await tick();assert.equal(run('lineIndex'),1);assert.equal(els.speaker.textContent,'Sol');assert.equal(clips.at(-1).path,'audio/sol/02-neighbors.wav');clips.at(-1).fire('ended');await tick();assert.equal(run('lineIndex'),2);assert.equal(els.speaker.textContent,'Mira');clips.at(-1).fire('ended');await tick();assert.match(els.status.textContent,/finished/);assert.equal(els.next.disabled,true);});
await check('Next cancels sequence and pauses old line',async()=>{els.restart.fire('click');run('void playRemaining()');await tick();const old=clips.at(-1);els.next.fire('click');await tick();assert.equal(old.paused,true);assert.equal(old.currentTime,0);assert.equal(run('lineIndex'),1);assert.equal(run('activeAudio'),null);});
await check('stale ended cannot advance after Next',async()=>{const old=clips.at(-1),before=clips.length;old.saved.ended();await tick();assert.equal(run('lineIndex'),1);assert.equal(clips.length,before);});
await check('Stop cancels without changing subtitle',async()=>{run('void playRemaining()');await tick();const old=clips.at(-1),line=els.subtitle.textContent;els.stop.fire('click');old.saved.ended();await tick();assert.equal(old.paused,true);assert.equal(els.subtitle.textContent,line);assert.match(els.status.textContent,/Stopped/);});
await check('Replay stops previous clip',async()=>{run('void replay()');await tick();const old=clips.at(-1);run('void replay()');await tick();assert.equal(old.paused,true);clips.at(-1).fire('ended');await tick();assert.match(els.status.textContent,/Line finished/);});
await check('missing/rejected play stops sequence with text fallback',async()=>{mode='reject';const before=run('lineIndex');run('void playRemaining()');await tick();assert.equal(run('lineIndex'),before);assert.match(els.status.textContent,/unavailable/);assert.equal(clips.at(-1).paused,true);mode='ok';});
await check('error event has same fallback',async()=>{run('void replay()');await tick();clips.at(-1).fire('error');await tick();assert.match(els.status.textContent,/unavailable/);});
await check('late play result after Stop remains stopped',async()=>{mode='hold';run('void replay()');const old=clips.at(-1);els.stop.fire('click');old.resolve();await tick();assert.equal(old.paused,true);assert.match(els.status.textContent,/Stopped/);mode='ok';});
await check('restart returns first line and stays silent',()=>{const before=clips.length;els.restart.fire('click');assert.equal(run('lineIndex'),0);assert.equal(clips.length,before);assert.equal(els.speaker.textContent,'Mira');});
console.log(`${count} checks passed. Mock DOM/audio only; real browser/playback not tested.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
