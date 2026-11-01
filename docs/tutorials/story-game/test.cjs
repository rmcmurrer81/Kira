const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(tag='DIV'){this.tagName=tag.toUpperCase();this.children=[];this.handlers={};this.attributes={};this.checked=false;this.hidden=false;this.textContent='';this.style={setProperty(k,v){this[k]=v;}};this.classList={toggle:(c,on)=>{this.toggled={c,on};}};}
 append(x){this.children.push(x);}replaceChildren(){this.children=[];}setAttribute(k,v){this.attributes[k]=v;}addEventListener(k,f){this.handlers[k]=f;}focus(){this.focused=true;}fire(k,e={}){return this.handlers[k]?.(e);}set innerHTML(_){throw Error('No innerHTML allowed');}
}
const ids=['stage','characters','choices','audio-status','scene-title','scene-count','location-label','speaker','line','restart','voice','replay','toggle-grid','grid','reduce-motion'];
const els=Object.fromEntries(ids.map(x=>[x,new Element()]));els.grid.hidden=true;
const docHandlers={},clips=[];let rejectPlay=false,holdPlay=false;
class FakeAudio{constructor(path){this.path=path;this.handlers={};this.paused=false;this.currentTime=0;clips.push(this);}pause(){this.paused=true;}addEventListener(k,f){this.handlers[k]=f;}play(){if(holdPlay)return new Promise(r=>{this.resolve=r;});return rejectPlay?Promise.reject(Error('blocked')):Promise.resolve();}}
const ctx=vm.createContext({document:{getElementById:id=>els[id],createElement:tag=>new Element(tag),addEventListener:(k,f)=>docHandlers[k]=f},window:{matchMedia:()=>({matches:false})},Audio:FakeAudio});
vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);let n=0;
async function check(name,fn){await fn();n++;console.log('PASS '+name);}
(async()=>{
await check('valid story data',()=>assert.equal(run('validateStory(SCENES).length'),0));
await check('three locations and two reachable endings',()=>{const data=JSON.parse(run('JSON.stringify(SCENES)'));assert.equal(new Set(Object.values(data).map(s=>s.location)).size,3);const seen=new Set(),walk=id=>{if(seen.has(id))return;seen.add(id);for(const c of data[id].choices)walk(c.to);};walk('park');assert.equal(seen.size,5);assert.equal([...seen].filter(id=>data[id].ending).length,2);});
await check('invalid destination caught',()=>assert.ok(run("validateStory({...SCENES,park:{...SCENES.park,choices:[{to:'typo'}]}}).length")>0));
await check('initial park is text-only and does not steal focus',()=>{assert.equal(run('currentId'),'park');assert.equal(clips.length,0);assert.equal(els['scene-title'].focused,undefined);});
await check('coordinate foot placement, facing and layers',()=>{const a=els.characters.children[0];assert.equal(a.style.left,'30%');assert.equal(a.style.bottom,'22%');assert.equal(a.style.zIndex,3);assert.equal(a.style['--facing'],1);assert.equal(a.children[0].children.length,6);});
await check('choice updates all scene parts',()=>{els.choices.children[0].fire('click');assert.equal(run('currentId'),'workshop');assert.match(els.stage.className,/workshop/);assert.equal(els.speaker.textContent,'Sol');assert.equal(els['scene-title'].focused,true);assert.equal(els.choices.children.length,2);});
await check('old detached button cannot navigate twice',()=>{run("showScene('park')");const old=els.choices.children[0];old.fire('click');old.fire('click');assert.equal(run('currentId'),'workshop');});
await check('both ending paths and restart',()=>{run("showScene('workshop')");els.choices.children[0].fire('click');assert.equal(run('currentId'),'ending-light');els.restart.fire('click');els.choices.children[1].fire('click');els.choices.children[0].fire('click');assert.equal(run('currentId'),'ending-stars');els.restart.fire('click');assert.equal(run('currentId'),'park');});
function key(key,extra={}){docHandlers.keydown({key,target:{tagName:'BODY'},preventDefault(){},...extra});}
await check('number keys select branch and R restarts',()=>{key('2');assert.equal(run('currentId'),'rooftop');key('1');assert.equal(run('currentId'),'ending-stars');key('R');assert.equal(run('currentId'),'park');});
await check('repeated and input keys ignored',()=>{key('2',{repeat:true});key('2',{target:{tagName:'INPUT'}});assert.equal(run('currentId'),'park');});
await check('unknown scene preserves current state',()=>{assert.equal(run("showScene('missing')"),false);assert.equal(run('currentId'),'park');});
await check('grid and reduced motion controls',()=>{els['toggle-grid'].fire('click');assert.equal(els.grid.hidden,false);els['reduce-motion'].checked=true;els['reduce-motion'].fire('change');assert.equal(els.stage.toggled.on,true);run("showScene('workshop')");assert.match(els.stage.className,/no-motion/);});
await check('voice-off replay cannot start audio',async()=>{await run('playLine()');assert.equal(clips.length,0);assert.match(els['audio-status'].textContent,/muted/);});
await check('explicit Enable voice click starts current line',async()=>{els.voice.fire('click');await Promise.resolve();assert.equal(clips.length,1);assert.equal(clips[0].path,'audio/workshop.wav');assert.equal(clips[0].volume,0.8);assert.equal(els.voice.attributes['aria-pressed'],'true');assert.equal(els.voice.textContent,'Mute voice');});
await check('explicit play selects relative scene WAV',async()=>{await run('playLine()');assert.equal(clips.at(-1).path,'audio/workshop.wav');assert.match(els['audio-status'].textContent,/Playing/);});
await check('navigation stops previous audio and choice plays new line',async()=>{const old=clips.at(-1);run("showScene('park',{speak:true})");await Promise.resolve();assert.equal(old.paused,true);assert.equal(old.currentTime,0);assert.equal(clips.at(-1).path,'audio/park.wav');});
await check('play rejection shows honest fallback',async()=>{rejectPlay=true;await run('playLine()');assert.match(els['audio-status'].textContent,/could not play/);rejectPlay=false;});
await check('missing audio event shows fallback',async()=>{await run('playLine()');clips.at(-1).handlers.error();assert.match(els['audio-status'].textContent,/unavailable/);});
await check('stale play promise cannot claim current playback',async()=>{holdPlay=true;const pending=run('playLine()');const old=clips.at(-1);run("showScene('rooftop')");old.resolve();await pending;assert.equal(old.paused,true);assert.doesNotMatch(els['audio-status'].textContent,/Playing/);holdPlay=false;});
await check('mute stops voice and leaves captions',async()=>{await run('playLine()');const old=clips.at(-1);els.voice.fire('click');assert.equal(old.paused,true);assert.equal(els.voice.attributes['aria-pressed'],'false');assert.ok(els.line.textContent.length>20);});
await check('no external runtime assets/storage/service API',()=>{const js=fs.readFileSync(__dirname+'/game.js','utf8');assert.doesNotMatch(js,/\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\s*[.(]/);});
await check('restart stops sound without opening clip',async()=>{els.voice.fire('click');await Promise.resolve();const clip=clips.at(-1),count=clips.length;els.restart.fire('click');assert.equal(clip.paused,true);assert.equal(clips.length,count);assert.equal(run('currentId'),'park');});
console.log(`${n} checks passed. Node DOM/audio mocks; no real GUI/audio/mobile/accessibility verification.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
