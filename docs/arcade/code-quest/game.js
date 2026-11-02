/* Code Quest: The Last Light. Player text is parsed by sandbox.js, never evaluated.
 * Each attempt starts at the scene entrance. Only bounded teaching actions reach the world. */
(() => {
  "use strict";
  const MISSIONS=window.CodeQuestMissions, $=id=>document.getElementById(id);
  const STORE="kira-code-quest-last-light-v2", VERSION="20261102-integrated1";
  const state={level:0,cleared:Array(MISSIONS.length).fill(false),drafts:Array(MISSIONS.length).fill(null)};
  const voice=window.CodeQuestVoice.init({toggle:$("voiceToggle"),replay:$("voiceReplay"),status:$("voiceStatus")});
  // Reuse the landed arcade's opt-in sound cues; only CodeQuestVoice narrates.
  const effects=window.KiraArcadeVoice.create();
  const reduced=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let worker=null,watchdog=null,timer=null,generation=0,busy=false,hintStage=0,pendingPlayback=null,selectedChoice=null;
  const robot='<svg viewBox="0 0 62 72" aria-hidden="true"><path d="M31 13V4" stroke="#b4e6e7" stroke-width="4"/><circle cx="31" cy="4" r="4" fill="#ffe4a3"/><rect x="8" y="14" width="46" height="30" rx="12" fill="#a8edeb" stroke="#234960" stroke-width="3"/><rect x="14" y="21" width="34" height="16" rx="7" fill="#15324a"/><circle cx="24" cy="29" r="3" fill="#b5ffff"/><circle cx="38" cy="29" r="3" fill="#b5ffff"/><rect x="16" y="44" width="30" height="22" rx="7" fill="#6bafb7"/><path d="M31 48l3 5-3 5-3-5z" fill="#ffe3a4"/><path d="M20 68h6m10 0h6" stroke="#b4e6e7" stroke-width="5" stroke-linecap="round"/></svg>';
  $("worldArt").innerHTML='<svg viewBox="0 0 700 440" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="night" x2="0" y2="1"><stop stop-color="#0c1a36"/><stop offset="1" stop-color="#597586"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="#347487"/><stop offset="1" stop-color="#102842"/></linearGradient><radialGradient id="halo"><stop stop-color="#ffe9af" stop-opacity=".5"/><stop offset="1" stop-color="#ffe9af" stop-opacity="0"/></radialGradient></defs><rect width="700" height="440" fill="url(#night)"/><circle cx="539" cy="82" r="78" fill="url(#halo)"/><circle cx="539" cy="82" r="30" fill="#fff0cc"/><g class="world-stars" fill="#d9f7ff"><circle cx="61" cy="87" r="2"/><circle cx="146" cy="46" r="2"/><circle cx="280" cy="98" r="2"/><circle cx="384" cy="54" r="2"/><circle cx="633" cy="142" r="2"/><circle cx="210" cy="158" r="2"/></g><path d="M0 236Q130 102 270 232Q423 107 600 225L700 173V440H0" fill="#25475b"/><path d="M0 276Q171 202 330 276Q519 197 700 269V440H0" fill="#193a49"/><g class="world-village"><path d="M428 277v-64l39-34 40 34v64m11 0v-90l50-43 48 43v90" fill="#243951" stroke="#70858b" stroke-width="2"/><path d="M451 232h17v25h-17m94-49h20v27h-20m29-27h20v27h-20" fill="#e7b36c" class="world-windows"/><path d="M0 360Q350 281 700 350V440H0" fill="#294b4d"/></g><g class="world-workshop"><path d="M0 0h44v300H0m612-300h88v440h-88" fill="#192d42"/><path d="M0 0h700v28H0" fill="#3f4956"/><path d="M48 175h110v10H48m-5 100h200v14H43m15 0v116m163-116v116" stroke="#9e7e5d" stroke-width="9"/><path d="M80 143v31m24-48v48m24-24v24" stroke="#7dafbb" stroke-width="12"/><circle cx="166" cy="208" r="24" fill="none" stroke="#718798" stroke-width="9"/><circle cx="166" cy="208" r="8" fill="#c9b382"/><path d="M300 28v58" stroke="#b69d7c" stroke-width="3"/><path d="M271 103q29-48 58 0z" fill="#b9a27f"/><circle cx="300" cy="103" r="65" fill="url(#halo)" class="world-lamp"/></g><g class="world-river"><path d="M250 226Q453 275 319 340Q215 393 430 440H700V300Q517 282 566 235Z" fill="url(#water)"/><g class="world-ripples" stroke="#8cdbd7" stroke-width="2" opacity=".45"><path d="M390 285h63m12 24h88m-213 43h70m49 39h90m-6 22h98"/></g><path d="M228 291Q398 212 570 288" fill="none" stroke="#9cb4bb" stroke-width="18"/><path d="M228 267Q398 188 570 264" fill="none" stroke="#cee6df" stroke-width="3"/><path d="M259 257v24m48-41v28m50-36v28m50-26v26m50-19v26m49-11v25" stroke="#87a5ad" stroke-width="3"/></g><g class="world-archive"><path d="M440 315V122Q518 30 598 122V315" fill="#13263a" stroke="#779399" stroke-width="15"/><path d="M462 315V131Q519 60 576 131V315" fill="#3d4b60"/><g class="world-gate" stroke="#b8a77e" stroke-width="6"><path d="M479 110v200m26-216v216m26-216v216m26-200v200"/></g><circle cx="519" cy="163" r="19" fill="#d5b176"/><path d="M519 150v15l9 7" stroke="#3c4150" stroke-width="3"/><path d="M30 158h179v10H30m0 71h179v10H30" fill="#9a8265"/><path d="M48 113v42m20-42v42m27-35v35m25-49v49m28-39v39m24-49v49m-125 43v41m30-35v35m29-43v43m29-39v39m29-42v42" stroke="#6997a4" stroke-width="13"/></g><g class="world-rail"><path d="M0 340L700 230m-700 140L700 255" stroke="#8db3bb" stroke-width="6"/><path d="M60 329l7 33m77-46l7 34m78-47l7 34m78-47l7 34m78-48l7 34m78-47l7 34m78-47l7 34m78-48l7 34" stroke="#596f79" stroke-width="8"/><g class="world-train"><rect x="430" y="179" width="159" height="91" rx="20" fill="#577f86" stroke="#a1c4c3" stroke-width="3"/><path d="M447 195h30v35h-30m45-35h30v35h-30m45-35h30v35h-30" fill="#e6c588"/><circle cx="460" cy="276" r="15" fill="#142e40" stroke="#a1c4c3" stroke-width="4"/><circle cx="563" cy="259" r="15" fill="#142e40" stroke="#a1c4c3" stroke-width="4"/></g></g><g class="world-meadow"><path d="M0 330Q300 249 700 322V440H0" fill="#315853"/><g fill="#ffe0a6" class="world-fallen-stars"><path d="M410 252l7 15 17 2-13 11 3 17-14-9-15 9 4-17-13-11 17-2z"/><path d="M490 230l7 15 17 2-13 11 3 17-14-9-15 9 4-17-13-11 17-2z"/><path d="M566 265l7 15 17 2-13 11 3 17-14-9-15 9 4-17-13-11 17-2z"/></g><path d="M32 325l7-23 8 22m53 17l6-30 9 28m74-12l5-22 8 22m390 0l6-30 7 30" stroke="#73a38a" stroke-width="4"/></g><g class="world-beacon"><path d="M492 305l17-169h63l21 169" fill="#c4d2ca" stroke="#7b9caa" stroke-width="3"/><path d="M510 167h63m-67 55h74" stroke="#a9665d" stroke-width="19"/><path d="M502 131v-30h75v30" fill="#8296a2" stroke="#38556c" stroke-width="5"/><path d="M491 100l48-38 51 38" fill="#b46e5d"/><path class="world-beam" d="M539 115L0 12V220Z" fill="#ffe6a3" opacity="0"/><rect class="world-light" x="515" y="104" width="49" height="23" fill="#314b60"/></g><g class="world-mira" transform="translate(612 319)"><path d="M-17-5l-5 49h44L17-5" fill="#b67c6a"/><circle cy="-24" r="16" fill="#dfb589"/><path d="M-18-22q2-34 31-17l7 19-14-8-22 8" fill="#26313e"/><path d="M-10 44l-4 28m24-28l5 28" stroke="#172e41" stroke-width="9"/><path d="M-21 9l-14 21m54-21l14 21" stroke="#dfb589" stroke-width="7" stroke-linecap="round"/></g><g class="world-fireflies" fill="#b7f6ce"><circle cx="213" cy="300" r="2"/><circle cx="572" cy="346" r="3"/><circle cx="345" cy="175" r="2"/><circle cx="90" cy="233" r="2"/></g></svg>';
  try {
    let saved=JSON.parse(localStorage.getItem(STORE)||"null");
    if(!saved){
      // The opening four concepts match the original eight-mission edition.
      // Keep that save untouched and transfer credit only before new chapters.
      const legacy=JSON.parse(localStorage.getItem("kira-code-quest-starlight-v1")||"null");
      if(legacy&&Array.isArray(legacy.cleared)&&legacy.cleared.length===8){
        const cleared=Array(MISSIONS.length).fill(false);let open=true;
        for(let i=0;i<4;i++){open=open&&legacy.cleared[i]===true;cleared[i]=open;}
        const ceiling=cleared.indexOf(false);
        saved={level:Math.min(ceiling,Number.isInteger(legacy.level)?Math.max(0,legacy.level):0),cleared,drafts:Array(MISSIONS.length).fill(null)};
      }
    }
    if(saved&&Array.isArray(saved.cleared)&&saved.cleared.length===MISSIONS.length){
      // Only a contiguous completed path unlocks later scenes.
      let open=true;
      state.cleared=saved.cleared.map(value=>{open=open&&value===true;return open;});
      const first=state.cleared.indexOf(false),ceiling=first<0?MISSIONS.length-1:first;
      state.level=Math.max(0,Math.min(ceiling,Number.isInteger(saved.level)?saved.level:0));
      if(Array.isArray(saved.drafts))state.drafts=MISSIONS.map((_,i)=>typeof saved.drafts[i]==="string"?saved.drafts[i].slice(0,6000):null);
    }
  } catch (_) { /* Corrupt or blocked storage never blocks play. */ }
  function save(){
    try {localStorage.setItem(STORE,JSON.stringify(state));$("saveStatus").textContent="Your code and progress save on this device. You can come back anytime.";}
    catch(_){$("saveStatus").textContent="This browser is not saving progress. You can still play this adventure.";}
  }
  function setOutput(kind,title,text,actions=[]){
    $("outputPanel").dataset.state=kind;
    $("outputTitle").textContent=title;$("outputText").textContent=text;
    $("outputIcon").textContent=kind==="success"?"✦":kind==="error"?"!":"✧";
    $("actionLog").replaceChildren(...actions.slice(0,12).map(a=>{
      const code=document.createElement("code");
      code.textContent=a.type+"("+(a.value===null?"":JSON.stringify(a.value))+")";return code;
    }));
  }
  function stopActive(){
    generation++;busy=false;pendingPlayback=null;$("skipAnimation").hidden=true;
    if(worker){worker.terminate();worker=null;}
    if(watchdog!==null){clearTimeout(watchdog);watchdog=null;}
    if(timer!==null){clearTimeout(timer);timer=null;}
    $("runButton").disabled=false;$("runButton").textContent="▶ 2. Run my code";
    $("stage").classList.remove("is-running");
  }
  function progress(){
    const done=state.cleared.filter(Boolean).length,first=state.cleared.indexOf(false);
    $("chapterCount").textContent="Mission "+(state.level+1)+" of "+MISSIONS.length;
    $("progressLabel").textContent=done+" / "+MISSIONS.length+" sparks restored";
    $("progressFill").style.width=(100*done/MISSIONS.length)+"%";
    $("progressBar").setAttribute("aria-valuenow",String(done));
    $("progressBar").setAttribute("aria-valuemax",String(MISSIONS.length));
    $("previousButton").disabled=state.level===0;
    $("nextButton").disabled=busy||!state.cleared[state.level];
    $("easyContinue").hidden=busy||!state.cleared[state.level];
    $("nextButton").textContent=state.level===MISSIONS.length-1?"See the dawn →":"3. Continue the story →";
    $("startLessonButton").textContent=state.level===0?"Begin here: make your first change ↓":"Show this mission's next move ↓";
    $("journeyMap").replaceChildren(...MISSIONS.map((m,i)=>{
      const b=document.createElement("button");b.type="button";
      b.textContent=state.cleared[i]?"✦":String(i+1);
      b.disabled=first>=0&&i>first;
      b.setAttribute("aria-label","Mission "+(i+1)+": "+m.title+(b.disabled?" (locked)":state.cleared[i]?" (complete)":""));
      if(i===state.level)b.setAttribute("aria-current","step");
      b.addEventListener("click",()=>goTo(i));return b;
    }));
  }
  function cue(kind){
    if(!voice.isEnabled())return;
    if(!effects.enabled)effects.enable();
    effects.cue(kind);
  }
  function renderChoices(){
    selectedChoice=null;
    $("easyInstruction").textContent="Read a command and its effect, then choose what PIX should do. You can keep learning without typing.";
    $("choiceButtons").replaceChildren(...window.CodeQuestChoices[state.level].map(option=>{
      const button=document.createElement("button");button.type="button";button.className="cq-choice-option";
      const label=document.createElement("strong");label.textContent=option.label;
      const code=document.createElement("code");code.textContent=option.code;
      button.append(label,code);
      button.addEventListener("click",()=>{
        if(busy)stopActive();
        selectedChoice=option;$("codeInput").value=option.code;
        state.drafts[state.level]=option.code;save();
        $("easyInstruction").textContent=option.why;
        run();
      });return button;
    }));
  }
  function board(pos,path=[]){
    const m=MISSIONS[state.level],visited=new Set(path.map(p=>p.x+","+p.y));
    const spatial=[2,3,7,8,11].includes(state.level);
    $("stage").classList.toggle("is-spatial",spatial);
    const tiles=[];
    for(let y=0;y<4;y++)for(let x=0;x<7;x++){
      const tile=document.createElement("span");tile.className="cq-tile";
      if(visited.has(x+","+y))tile.classList.add("is-path");
      if(spatial&&m.target.x===x&&m.target.y===y){tile.classList.add("is-goal");tile.textContent="✦";}
      if(pos.x===x&&pos.y===y){tile.classList.add("is-robot");tile.innerHTML=robot;tile.dataset.direction=pos.dir;}
      tiles.push(tile);
    }
    $("board").replaceChildren(...tiles);
    $("board").setAttribute("aria-label",spatial?"PIX: column "+(pos.x+1)+", row "+(pos.y+1)+", facing "+pos.dir+". Destination: column "+(m.target.x+1)+", row "+(m.target.y+1)+".":"PIX is waiting for your command. "+m.objective);
  }
  function guided(){
    const g=MISSIONS[state.level].guided;
    $("guidedStep").hidden=!g;
    if(!g)return;
    $("guidedText").textContent=state.level===0
      ?'The line below says Hello, friend! to PIX. A string is the message inside the quotes. Change just friend to PIX. Leave "Hello, " and the ! alone.'
      :"Try one tiny edit. "+g.label;
    $("guidedButton").textContent=g.label;
    $("workedExample").replaceChildren();
    if(state.level===0){
      const line=document.createElement("pre"),mark=document.createElement("mark");mark.textContent="friend";
      line.append('say("Hello, ',mark,'!");');$("workedExample").append(line);
    }
    const before=document.createElement("code"),after=document.createElement("code");
    before.textContent=g.before;after.textContent=g.after;
    const arrow=document.createElement("span");arrow.textContent="→";
    $("workedExample").append(before,arrow,after);
    const small=document.createElement("p");
    small.textContent=state.level===0?'say("Hello, PIX!"); means: tell PIX to say the text Hello, PIX! The quotes mark text; they are not spoken.':MISSIONS[state.level].lesson;
    $("workedExample").append(small);
  }
  function render(){
    stopActive();voice.stop();hintStage=0;
    const m=MISSIONS[state.level];
    for(const [id,value] of Object.entries({chapterName:m.chapter,topicName:m.topic,sceneTitle:m.title,sceneCaption:m.place,speaker:m.speaker,storyText:m.story,goalText:m.goal,lessonTitle:m.lessonTitle,lessonText:m.lesson,sceneCue:m.cue,worldStatus:m.objective}))$(id).textContent=value;
    $("codeInput").value=state.drafts[state.level]??m.starter;
    $("hintBox").hidden=true;$("hintButton").setAttribute("aria-expanded","false");
    $("moreHintButton").hidden=false;$("solutionButton").hidden=true;
    $("stage").dataset.theme=m.theme;$("stage").classList.remove("is-success","gate-open","stars-collected");
    $("stage").classList.toggle("is-asleep",state.level===0&&!state.cleared[0]);
    $("stage").classList.toggle("is-lit",state.cleared.every(Boolean));
    $("energy").querySelectorAll("i").forEach(i=>i.classList.remove("charged"));
    $("pixSpeech").hidden=true;$("ending").hidden=true;
    board(m.start);guided();renderChoices();progress();save();
    const done=state.cleared[state.level];
    setOutput(done?"success":"ready",done?"This spark is yours":"Start with one small change",
      done?m.explanation+" Continue the story when you are ready.":state.level===0?'1. Find friend in the code. Change it to PIX (the button above can help). 2. Press Run my code. Then watch PIX wake up.':m.goal+" Then press Run my code.");
    voice.read(m.title+". "+m.story+" Your next move. "+m.goal+" "+m.lesson);
    if(state.cleared.every(Boolean)&&state.level===MISSIONS.length-1)ending(false);
  }
  function simulate(m,actions,features=[]){
    const dirs=["east","south","west","north"];
    let {x,y,dir}=m.start;
    const frames=[],path=[{x,y,dir}];
    for(const a of actions){
      if(a.type==="turn")dir=dirs[(dirs.indexOf(dir)+(a.value==="right"?1:3))%4];
      if(a.type==="move"){
        for(let n=0;n<a.value;n++){
          if(dir==="east")x++;else if(dir==="west")x--;else if(dir==="south")y++;else y--;
          if(x<0||x>6||y<0||y>3)return {actions,features,x,y,dir,path,frames,error:"PIX reached the edge of the map. "+m.goal+" Reset code or ask for help, then try again."};
          path.push({x,y,dir});frames.push({pos:{x,y,dir},action:{type:"step",value:n+1},path:path.slice()});
        }
      }else frames.push({pos:{x,y,dir},action:a,path:path.slice()});
    }
    return {actions,features,x,y,dir,path,frames};
  }
  function worldAction(frame){
    board(frame.pos,frame.path);
    const a=frame.action;
    $("worldStatus").textContent=a.type==="step"?"PIX takes another step…":a.type==="say"?"PIX finds his voice.":a.type==="charge"?"The lantern gathers energy.":a.type==="openGate"?"The ancient gate is opening.":a.type==="collect"?"A fallen star joins your lantern.":"PIX turns "+a.value+".";
    if(a.type==="say"){$("stage").classList.remove("is-asleep");$("pixSpeech").textContent=a.value;$("pixSpeech").hidden=false;}
    if(a.type==="charge")$("energy").querySelectorAll("i").forEach((i,n)=>i.classList.toggle("charged",n<Math.min(3,a.value)));
    if(a.type==="openGate")$("stage").classList.add("gate-open");
    if(a.type==="collect"){$("stage").classList.add("stars-collected");$("energy").querySelectorAll("i").forEach((i,n)=>{if(n<a.value)i.classList.add("charged");});}
  }
  function play(sim,done){
    const ticket=generation;let index=0;
    if(reduced()){sim.frames.forEach(worldAction);done();return;}
    pendingPlayback=()=>{if(timer!==null){clearTimeout(timer);timer=null;}sim.frames.forEach(worldAction);pendingPlayback=null;done();};
    $("skipAnimation").hidden=false;
    function step(){
      if(ticket!==generation)return;
      if(index>=sim.frames.length){timer=setTimeout(()=>{timer=null;if(ticket===generation)done();},900);return;}
      worldAction(sim.frames[index++]);
      timer=setTimeout(step,sim.frames[index-1].action.type==="say"?800:360);
    }
    step();
  }
  function finish(payload){
    if(worker){worker.terminate();worker=null;}
    if(watchdog!==null){clearTimeout(watchdog);watchdog=null;}
    if(!payload?.ok){complete(false,payload?.error||"The runner could not start. Reset your code and try again.");return;}
    const m=MISSIONS[state.level];
    const sim=simulate(m,payload.actions,payload.features);
    setOutput("ready","Watch your instructions become actions","PIX follows your code from top to bottom.",payload.actions);
    play(sim,()=>{
      if(sim.error){complete(false,sim.error,payload.actions);return;}
      const ok=m.check(sim);
      complete(ok,ok?m.success+" "+m.explanation+" Choose Continue the story to discover what happens next.":"PIX followed your code. "+m.goal+" "+m.hints[Math.min(1,hintStage)],payload.actions);
    });
  }
  function complete(ok,message,actions=[]){
    busy=false;pendingPlayback=null;$("skipAnimation").hidden=true;$("runButton").disabled=false;$("runButton").textContent="▶ 2. Run my code";$("stage").classList.remove("is-running");
    if(ok){
      state.cleared[state.level]=true;save();$("stage").classList.add("is-success");
      $("worldStatus").textContent="✦ Spark restored · "+MISSIONS[state.level].title;
      if(state.cleared.every(Boolean)){$("stage").classList.add("is-lit");ending(false);}
    }
    if(selectedChoice){
      message=selectedChoice.why+" "+message;
      $("easyInstruction").textContent=selectedChoice.why+(ok?" You did it! Continue the story below.":" PIX is safe. Choose another command or try the guided edit.");
    }
    cue(ok?"win":"wrong");
    setOutput(ok?"success":"error",ok?"You changed their world!":"A small repair, then try again",message,actions);
    voice.read((ok?"You did it! ":"Let's try again. ")+message);progress();
    if(matchMedia("(max-width: 1000px)").matches)$("outputPanel").scrollIntoView({behavior:reduced()?"instant":"smooth",block:"center"});
  }
  function run(){
    if(busy)return;stopActive();
    const code=$("codeInput").value;
    if(!code.trim()){setOutput("error","Your editor is empty","Press Reset code to bring back this mission's starting point.");return;}
    if(code.length>6000){setOutput("error","That program is too long","Keep this adventure program to 6,000 characters.");return;}
    state.drafts[state.level]=code;save();voice.stop();
    $("stage").classList.remove("is-success","gate-open","stars-collected");
    $("stage").classList.add("is-running");$("pixSpeech").hidden=true;
    if(matchMedia("(max-width: 1000px)").matches)$("stage").scrollIntoView({behavior:"instant",block:"center"});
    $("energy").querySelectorAll("i").forEach(i=>i.classList.remove("charged"));
    board(MISSIONS[state.level].start);busy=true;progress();
    $("runButton").disabled=true;$("runButton").textContent="PIX is following your code…";
    setOutput("ready","Your story is moving","Each attempt begins safely at the start of this scene.");
    const ticket=generation;
    try{
      const current=new Worker("sandbox.js?v="+VERSION);worker=current;
      current.onmessage=e=>{if(ticket===generation&&worker===current)finish(e.data);};
      current.onerror=()=>{if(ticket===generation&&worker===current)finish({ok:false,error:"The teaching runner did not load. Please reload this page and try again."});};
      watchdog=setTimeout(()=>{if(ticket===generation)finish({ok:false,error:"That program took too long. Use a smaller loop, or Reset code and try again."});},1800);
      current.postMessage({code});
    }catch(_){finish({ok:false,error:"This browser blocked the teaching runner. Open the game in a current Chrome, Edge, Firefox or Safari browser."});}
  }
  function hint(stage=0){
    hintStage=stage;$("hintBox").hidden=false;$("hintButton").setAttribute("aria-expanded","true");
    $("hintTitle").textContent=stage?"The exact change":"A nudge from Iris";
    $("hintText").textContent=MISSIONS[state.level].hints[stage];
    $("moreHintButton").hidden=stage>0;$("solutionButton").hidden=stage===0;
    voice.read($("hintText").textContent);
  }
  function goTo(index){
    const first=state.cleared.indexOf(false);
    if(index<0||index>=MISSIONS.length||(first>=0&&index>first))return;
    state.level=index;render();
    $("sceneTitle").focus({preventScroll:true});
    $("stage").scrollIntoView({behavior:"instant",block:"start"});
  }
  function ending(scroll=true){
    $("ending").hidden=false;$("stage").classList.add("is-lit");
    if(scroll)$("ending").scrollIntoView({behavior:reduced()?"instant":"smooth",block:"start"});
  }
  function restart(){
    if(!window.confirm("Begin again? This resets Code Quest's 14-mission adventure on this device."))return;
    state.level=0;state.cleared.fill(false);state.drafts.fill(null);render();
    $("stage").scrollIntoView({behavior:"instant",block:"start"});
  }
  $("sceneTitle").tabIndex=-1;
  $("codeForm").addEventListener("submit",e=>{e.preventDefault();selectedChoice=null;run();});
  $("codeInput").addEventListener("input",()=>{selectedChoice=null;if(busy){stopActive();progress();setOutput("ready","Your new draft is ready","Run your changed code to try this scene again.");}state.drafts[state.level]=$("codeInput").value;save();});
  $("codeInput").addEventListener("keydown",e=>{
    if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();selectedChoice=null;run();}
    // Keep Tab's normal focus navigation so keyboard users can leave the editor.
  });
  $("guidedButton").addEventListener("click",()=>{
    const m=MISSIONS[state.level],g=m.guided;if(!g)return;stopActive();selectedChoice=null;
    let index=$("codeInput").value.lastIndexOf(g.before);
    if(index<0){$("codeInput").value=m.starter;index=$("codeInput").value.lastIndexOf(g.before);}
    if(index>=0){$("codeInput").setRangeText(g.after,index,index+g.before.length,"select");}
    state.drafts[state.level]=$("codeInput").value;save();progress();
    const text="You changed "+g.before+" to "+g.after+". "+m.lesson+" Now press Run my code to see the effect.";
    setOutput("ready","You made the change. Now try it.",text);voice.read(text);$("codeInput").focus();
  });
  $("findTokenButton").addEventListener("click",()=>{
    const g=MISSIONS[state.level].guided;if(!g)return;
    const editor=$("codeInput"),index=editor.value.lastIndexOf(g.before);
    if(index<0){setOutput("ready","Try Reset code to find that part again","Your code has changed. Reset code brings back the original example, or keep experimenting.");return;}
    editor.focus();editor.setSelectionRange(index,index+g.before.length);
    editor.scrollIntoView({behavior:"instant",block:"center"});
    const text='The highlighted part is '+g.before+'. Type '+g.after+' to replace it. Then press Run my code.';
    setOutput("ready","This is the part you change",text);voice.read(text);
  });
  $("skipAnimation").addEventListener("click",()=>{if(pendingPlayback)pendingPlayback();});
  $("hintButton").addEventListener("click",()=>hint(0));
  $("easyHint").addEventListener("click",()=>{hint(0);$("easyInstruction").textContent=MISSIONS[state.level].hints[0];});
  $("moreHintButton").addEventListener("click",()=>hint(1));
  $("solutionButton").addEventListener("click",()=>{
    stopActive();selectedChoice=null;const m=MISSIONS[state.level];$("codeInput").value=m.solution;state.drafts[state.level]=m.solution;save();progress();
    setOutput("ready","Read this example, then run it",m.lesson+" Press Run my code to watch these lines work.");
    voice.read(m.lesson+" Now press Run my code.");$("codeInput").focus();
  });
  $("resetButton").addEventListener("click",()=>{stopActive();state.drafts[state.level]=null;render();$("codeInput").focus();});
  $("previousButton").addEventListener("click",()=>goTo(state.level-1));
  $("nextButton").addEventListener("click",()=>{if(!busy&&state.cleared[state.level])state.level===MISSIONS.length-1?ending():goTo(state.level+1);});
  $("easyContinue").addEventListener("click",()=>$("nextButton").click());
  $("startLessonButton").addEventListener("click",()=>{
    if(MISSIONS[state.level].guided){$("guidedStep").scrollIntoView({behavior:"instant",block:"center"});$("findTokenButton").focus({preventScroll:true});}
    else{$("codeInput").focus();$("codeInput").scrollIntoView({behavior:"instant",block:"center"});}
  });
  $("voiceToggle").addEventListener("click",()=>{if(!voice.isEnabled())effects.disable();});
  $("restartButton").addEventListener("click",restart);$("replayButton").addEventListener("click",restart);
  addEventListener("pagehide",()=>{stopActive();voice.stop();});
  render();
})();
