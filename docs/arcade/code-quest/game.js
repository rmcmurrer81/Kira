/* Code Quest: The Stoneward Oath. Original branching fantasy/code adventure.
 * Player programs go only to the bounded teaching interpreter. */
(() => {
  "use strict";
  const $=id=>document.getElementById(id), MISSIONS=window.CodeQuestMissions, ROUTES=window.CodeQuestEncounters;
  const STORE="kira-code-quest-stoneward-v3", VERSION="20261102-stoneward1";
  let saved=null;try{saved=JSON.parse(localStorage.getItem(STORE)||"null");}catch(_){}
  const quest=window.CodeQuestState.create({missions:MISSIONS,encounters:ROUTES,saved}), state=quest.data;
  const voice=window.CodeQuestVoice.init({toggle:$("voiceToggle"),replay:$("voiceReplay"),status:$("voiceStatus")});
  const effects=window.KiraArcadeVoice.create();
  let world=null,graphicsReady,worker=null,watchdog=null,generation=0,busy=false,hintStage=0,skipRequested=false,selectedChoice=null;
  const reduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mission=()=>MISSIONS[state.level];
  const room=()=>quest.room();
  const route=()=>quest.activeRoute();
  const credited=()=>state.rooms.map(r=>Object.values(r.gates).some(Boolean));
  const worldOptions=()=>({mission:mission(),index:state.level,cleared:credited(),inventory:state.inventory,
    encounter:{route:route()?.kind||"safe",revealed:Boolean(route()),blocking:Boolean(route()&&!quest.gateOpen())}});
  function save(){try{localStorage.setItem(STORE,JSON.stringify(state));$("saveStatus").textContent="Your passages, encounters, rewards and code save on this device. Earlier adventure saves are kept.";}
    catch(_){$("saveStatus").textContent="This browser is not saving progress. You can still play the quest.";}
  }
  function cue(kind){if(!voice.isEnabled())return;if(!effects.enabled)effects.enable();effects.cue(kind);}
  function setOutput(kind,title,message,actions=[]){
    $("outputPanel").dataset.state=kind;$("outputTitle").textContent=title;$("outputText").textContent=message;
    $("outputIcon").textContent=kind==="success"?"✦":kind==="error"?"!":"◇";
    $("actionLog").replaceChildren(...actions.slice(0,12).map(a=>{const c=document.createElement("code");c.textContent=a.type+"("+(a.value===null?"":JSON.stringify(a.value))+")";return c;}));
  }
  function stopActive(){
    generation++;busy=false;skipRequested=false;world?.cancel();
    if(worker){worker.terminate();worker=null;}
    if(watchdog!==null){clearTimeout(watchdog);watchdog=null;}
    $("stage").classList.remove("is-running");$("skipAnimation").hidden=true;
  }
  function resetWorld(){world?.reset(worldOptions());}
  function progress(){
    const count=quest.completedCount(),active=route(),open=quest.gateOpen();
    $("chapterCount").textContent="Mission "+(state.level+1)+" of "+MISSIONS.length;
    $("progressLabel").textContent=count+" / "+MISSIONS.length+" encounters cleared";
    $("progressFill").style.width=100*count/MISSIONS.length+"%";$("progressBar").setAttribute("aria-valuenow",String(count));
    $("previousButton").disabled=state.level===0;
    $("nextButton").disabled=busy||!open;$("easyContinue").hidden=busy||!open;
    $("nextButton").textContent=state.level===MISSIONS.length-1?"See the town's fate →":"Continue the quest →";
    $("runButton").disabled=busy||!active;$("runButton").textContent=busy?"PIX is acting...":"▶ Run my code";
    $("startLessonButton").textContent=active?"Face this encounter: use code ↓":"Begin here: choose a passage ↓";
    $("enterPuzzleButton").hidden=!active;$("enterPuzzleButton").disabled=busy;
    $("retreatButton").hidden=!active;
    $("journeyMap").replaceChildren(...MISSIONS.map((m,i)=>{
      const b=document.createElement("button");b.type="button";b.textContent=credited()[i]?"✦":String(i+1);b.disabled=busy||!quest.canVisit(i);
      b.setAttribute("aria-label","Mission "+(i+1)+": "+m.title+(b.disabled?" (locked)":""));
      if(i===state.level)b.setAttribute("aria-current","step");b.addEventListener("click",()=>goTo(i));return b;
    }));
    $("choiceButtons").querySelectorAll("button").forEach(b=>{b.disabled=busy||!active;});
    $("routeChoices").querySelectorAll("button").forEach(b=>{b.disabled=busy;});
    $("gateStatus").dataset.state=!active?"junction":open?"cleared":"blocked";
    $("gateStatus").textContent=!active?"Choose a passage. Every route is guarded by a coding encounter.":open?"Passage cleared. The reward is secured. You can continue.":active.blocked+" Use the code below to get through. You can return to the junction safely.";
    $("defenseLabel").textContent=state.defense+"%";$("defenseMeter").value=state.defense;
    $("threatTitle").textContent=count===MISSIONS.length?"The stormwraith breaks against the restored wards.":mission().quest.threat;
    $("questNeed").textContent=quest.gateOpen()?"Secured: "+mission().quest.reward.name+". "+(count===MISSIONS.length?"The town is safe.":"Continue deeper to recover the next defense."):mission().quest.need;
    $("inventoryList").replaceChildren(...(state.inventory.length?state.inventory.map(id=>{
      const item=MISSIONS.find(m=>m.quest.reward.id===id)?.quest.reward;const s=document.createElement("span");s.className="cq-inventory-item";s.textContent=({part:"Part: ",ally:"Ally: ",passage:"Way open: ",defense:"Defense: "}[item?.kind]||"")+(item?.name||id);return s;
    }):[Object.assign(document.createElement("span"),{className:"cq-inventory-empty",textContent:"Inventory empty · recover the ward equipment"})]));
  }
  function renderRoutes(){
    const active=route();
    $("encounterTitle").textContent=active?active.label:"The passage divides";
    $("encounterText").textContent=active?(quest.gateOpen()?active.clear:active.narration):"Iris: Two passages lie ahead. Choose a route, face what waits there, and use code to open the way.";
    $("routeChoices").replaceChildren(...ROUTES[state.level].map(r=>{
      const b=document.createElement("button");b.className="cq-route";b.type="button";
      b.setAttribute("aria-pressed",String(active?.id===r.id));b.dataset.route=r.id;
      const label=document.createElement("strong");label.textContent=r.label;
      const desc=document.createElement("span");desc.textContent=r.description;b.append(label,desc);
      b.addEventListener("click",()=>chooseRoute(r.id));return b;
    }));
  }
  function renderChoices(){
    selectedChoice=null;$("easyInstruction").textContent="Choose what PIX should do. Each command is shown, then runs in the encounter. No typing is required.";
    $("choiceButtons").replaceChildren(...window.CodeQuestChoices[state.level].map(option=>{
      const b=document.createElement("button");b.type="button";b.className="cq-choice-option";
      const strong=document.createElement("strong");strong.textContent=option.label;const c=document.createElement("code");c.textContent=option.code;b.append(strong,c);
      b.addEventListener("click",()=>{if(busy)return;selectedChoice=option;$("codeInput").value=option.code;quest.setDraft(option.code);save();run();});return b;
    }));
  }
  function guided(){
    const g=mission().guided;$("guidedStep").hidden=!g;if(!g)return;
    $("guidedText").textContent=state.level===0?'PIX is asleep. The greeting below says friend. Change only friend to PIX; the name inside this message wakes your companion.':"Try one small edit. "+g.label;
    $("guidedButton").textContent=g.label;$("workedExample").replaceChildren();
    if(state.level===0){const line=document.createElement("pre"),mark=document.createElement("mark");mark.textContent="friend";line.append('say("Hello, ',mark,'!");');$("workedExample").append(line);}
    const from=document.createElement("code"),to=document.createElement("code"),arrow=document.createElement("span");from.textContent=g.before;to.textContent=g.after;arrow.textContent="→";$("workedExample").append(from,arrow,to);
    const explanation=document.createElement("p");explanation.textContent=state.level===0?'say("Hello, PIX!"); passes a text message to say(). Keep the quotation marks and punctuation.':mission().lesson;$("workedExample").append(explanation);
  }
  function render(announce=true){
    stopActive();voice.stop();hintStage=0;const m=mission();
    for(const [id,text] of Object.entries({chapterName:m.chapter,topicName:m.topic,sceneTitle:m.title,sceneCaption:m.place,speaker:m.speaker,storyText:m.story,goalText:m.goal,lessonTitle:m.lessonTitle,lessonText:m.lesson,sceneCue:m.cue,worldStatus:m.objective}))$(id).textContent=text;
    $("codeInput").value=state.drafts[state.level]??m.starter;
    $("hintBox").hidden=true;$("hintButton").setAttribute("aria-expanded","false");$("moreHintButton").hidden=false;$("solutionButton").hidden=true;
    $("pixSpeech").hidden=true;$("ending").hidden=true;$("stage").dataset.theme=m.theme;$("stage").classList.remove("is-success");
    $("energy").querySelectorAll("i").forEach(i=>i.classList.remove("charged"));
    $("board").textContent="PIX waits at the entrance. "+m.quest.need;
    guided();renderChoices();renderRoutes();progress();save();
    const active=route();
    setOutput(quest.gateOpen()?"success":"ready",quest.gateOpen()?"This passage is open":active?"Your code can open the way":"Choose your passage first",
      quest.gateOpen()?m.explanation+" The reward is in your inventory. Continue when ready.":active?m.goal+" Use the highlighted edit or choose a command.":"The game master has shown two routes above. Explore one to reveal its encounter; then use code to get through.");
    const ticket=generation;graphicsReady?.then(()=>{if(ticket===generation)resetWorld();});
    if(announce)voice.read(m.story+" "+(active?(quest.gateOpen()?active.clear:active.narration+" "+m.goal):"Two passages wait ahead. Choose a route."));
    if(quest.completedCount()===MISSIONS.length&&quest.gateOpen()&&state.level===MISSIONS.length-1)ending(false);
  }
  async function chooseRoute(id){
    stopActive();if(!quest.chooseRoute(id))return;render(false);
    const active=route(),ticket=generation;busy=true;progress();
    $("worldStatus").textContent=active.blocked;
    voice.read(quest.gateOpen()?"You return to a passage you already cleared. "+active.clear:active.narration+" "+mission().goal);
    if(matchMedia("(max-width:1000px)").matches)$("stage").scrollIntoView({behavior:"instant",block:"center"});
    await graphicsReady;if(ticket!==generation)return;
    if(quest.gateOpen())resetWorld();
    else{const opts=worldOptions();world.reset({...opts,encounter:{...opts.encounter,revealed:false}});await world.enterEncounter({route:active.kind});}
    if(ticket!==generation)return;busy=false;progress();save();
    $("enterPuzzleButton").focus({preventScroll:true});
  }
  function retreat(){
    stopActive();quest.retreat();render(false);
    const text="You step back to the junction. Your recovered parts are safe. Choose another passage, or return to the same encounter and try its code again.";
    $("encounterText").textContent=text;voice.read(text);$("encounterPanel").scrollIntoView({behavior:"instant",block:"center"});
  }
  function simulate(m,actions,features=[]){
    const dirs=["east","south","west","north"];let {x,y,dir}=m.start;
    const path=[{x,y,dir}],frames=[];
    for(const a of actions){
      if(a.type==="turn")dir=dirs[(dirs.indexOf(dir)+(a.value==="right"?1:3))%4];
      if(a.type==="move"){
        for(let n=0;n<a.value;n++){
          if(dir==="east")x++;else if(dir==="west")x--;else if(dir==="south")y++;else y--;
          if(x<0||x>6||y<0||y>3)return{actions,features,x,y,dir,frames,path,error:"That route reaches the edge of the safe path. "+m.goal};
          path.push({x,y,dir});frames.push({pos:{x,y,dir},action:{type:"step",value:n+1},path:path.slice()});
        }
      }else frames.push({pos:{x,y,dir},action:a,path:path.slice()});
    }
    return{actions,features,x,y,dir,frames,path};
  }
  function describeAction(frame){
    const a=frame.action;
    $("worldStatus").textContent=a.type==="step"?"PIX crosses the stone path.":a.type==="turn"?"PIX turns "+a.value+".":a.type==="say"?"PIX answers the encounter.":a.type==="charge"?"PIX operates the ward charger.":a.type==="collect"?"PIX reaches for ward crystal "+a.value+".":"PIX releases the ancient gate.";
    $("board").textContent="PIX is at column "+(frame.pos.x+1)+", row "+(frame.pos.y+1)+", facing "+frame.pos.dir+". "+$("worldStatus").textContent;
    if(a.type==="say"){$("pixSpeech").hidden=false;$("pixSpeech").textContent=a.value;}
    if(a.type==="charge")$("energy").querySelectorAll("i").forEach((i,n)=>i.classList.toggle("charged",n<Math.min(3,a.value)));
    if(a.type==="collect")$("energy").querySelectorAll("i").forEach((i,n)=>{if(n<a.value)i.classList.add("charged");});
  }
  async function finish(payload,ticket){
    if(worker){worker.terminate();worker=null;}if(watchdog!==null){clearTimeout(watchdog);watchdog=null;}
    if(ticket!==generation)return;
    if(!payload?.ok){await complete(false,payload?.error||"The code runner could not start.",[],ticket);return;}
    const m=mission(),sim=simulate(m,payload.actions,payload.features);
    setOutput("ready","Your commands become actions","Watch PIX use the instructions you wrote.",payload.actions);
    $("skipAnimation").hidden=reduced();
    for(const frame of sim.frames){
      if(ticket!==generation)return;
      describeAction(frame);
      const duration=frame.action.type==="step"||frame.action.type==="turn"?650:frame.action.type==="collect"?1500:frame.action.type==="charge"||frame.action.type==="openGate"?1350:1000;
      await world.playFrame(frame,duration);
    }
    if(ticket!==generation)return;
    const ok=!sim.error&&m.check(sim);
    await complete(ok,sim.error||(ok?m.success:"The obstacle still blocks your way. "+m.goal),payload.actions,ticket);
  }
  async function complete(ok,message,actions,ticket){
    await world.complete({...worldOptions(),success:ok});
    if(ticket!==generation)return;
    if(ok)quest.solve();else quest.fail();
    busy=false;skipRequested=false;$("skipAnimation").hidden=true;$("stage").classList.remove("is-running");$("stage").classList.toggle("is-success",ok);
    if(selectedChoice)message=selectedChoice.why+" "+message;
    const active=route(),m=mission();
    if(ok){message+=" "+m.explanation+" Secured: "+m.quest.reward.name+".";
      $("worldStatus").textContent=active.clear+" Reward: "+m.quest.reward.name;
      $("encounterText").textContent=active.clear;
      voice.read(active.clear+" You secure "+m.quest.reward.name+". Town protection is now "+state.defense+" percent. "+(state.defense===100?"The stormwraith cannot reach the town.":"Another passage leads deeper. Continue when you are ready."));
    }else{message+=" Nothing is lost. Try another change, ask Iris for help, or retreat to the junction.";
      voice.read("The passage remains blocked. PIX and your supplies are safe. "+m.goal+" Ask for a hint, or return to the junction.");
    }
    $("easyInstruction").textContent=selectedChoice?selectedChoice.why+(ok?" The way is open.":" Try a different command."):
      ok?"Your code opened the way. Continue the quest.":"PIX is safe. Try again or use a hint.";
    setOutput(ok?"success":"error",ok?"The passage is yours":"The encounter needs another idea",message,actions);
    save();progress();cue(ok?"win":"wrong");
    if(quest.completedCount()===MISSIONS.length&&quest.gateOpen())ending(false);
    if(matchMedia("(max-width:1000px)").matches)$("outputPanel").scrollIntoView({behavior:reduced()?"instant":"smooth",block:"center"});
  }
  async function run(){
    if(busy)return;
    if(!route()){setOutput("error","Choose a passage first","A coding encounter waits on each route. Use the passage buttons above.");$("encounterPanel").scrollIntoView({behavior:"instant",block:"center"});return;}
    const code=$("codeInput").value;if(!code.trim()){setOutput("error","Your editor is empty","Reset code brings back this encounter's starting point.");return;}
    if(code.length>6000){setOutput("error","That program is too long","Keep your quest program to 6,000 characters.");return;}
    stopActive();quest.setDraft(code);save();voice.stop();busy=true;progress();$("pixSpeech").hidden=true;
    $("stage").classList.add("is-running");
    if(matchMedia("(max-width:1000px)").matches)$("stage").scrollIntoView({behavior:"instant",block:"center"});
    setOutput("ready","PIX faces the encounter","Each attempt starts from the safe entrance. Your supplies are kept.");
    const ticket=generation;await graphicsReady;if(ticket!==generation)return;resetWorld();
    try{
      const current=new Worker("sandbox.js?v="+VERSION);worker=current;
      current.onmessage=e=>{if(ticket===generation&&worker===current)finish(e.data,ticket);};
      current.onerror=()=>{if(ticket===generation&&worker===current)finish({ok:false,error:"The teaching runner did not load. Reload this page and try again."},ticket);};
      watchdog=setTimeout(()=>{if(ticket===generation)finish({ok:false,error:"That program took too long. Try a smaller loop or reset your code."},ticket);},1800);
      current.postMessage({code});
    }catch(_){finish({ok:false,error:"This browser blocked the teaching runner. Try a current browser."},ticket);}
  }
  function hint(stage=0){
    hintStage=stage;$("hintBox").hidden=false;$("hintButton").setAttribute("aria-expanded","true");
    $("hintTitle").textContent=stage?"Iris shows the exact change":"The game master's nudge";$("hintText").textContent=mission().hints[stage];
    $("moreHintButton").hidden=stage>0;$("solutionButton").hidden=stage===0;
    voice.read("Here is a way through this encounter. "+$("hintText").textContent);
  }
  function goTo(index){
    if(!quest.canVisit(index))return;stopActive();quest.goTo(index);render();
    $("sceneTitle").focus({preventScroll:true});$("stage").scrollIntoView({behavior:"instant",block:"start"});
  }
  function ending(scroll=true){$("ending").hidden=false;if(scroll)$("ending").scrollIntoView({behavior:reduced()?"instant":"smooth",block:"start"});}
  function restart(){if(!confirm("Start a new Stoneward quest? Your passages, quest rewards and code for this adventure will reset."))return;
    stopActive();quest.restart();render();$("stage").scrollIntoView({behavior:"instant",block:"start"});
  }
  function jumpToPuzzle(){
    if(!route()){$("encounterPanel").scrollIntoView({behavior:"instant",block:"center"});$("routeChoices").querySelector("button")?.focus({preventScroll:true});return;}
    if(mission().guided){$("guidedStep").scrollIntoView({behavior:"instant",block:"center"});$("findTokenButton").focus({preventScroll:true});}
    else{$("codeInput").focus();$("codeInput").scrollIntoView({behavior:"instant",block:"center"});}
  }
  $("sceneTitle").tabIndex=-1;
  $("codeForm").addEventListener("submit",e=>{e.preventDefault();selectedChoice=null;run();});
  $("codeInput").addEventListener("input",()=>{
    selectedChoice=null;if(busy){stopActive();resetWorld();setOutput("ready","Your new draft is ready","Run the changed code to face this encounter again.");}
    quest.setDraft($("codeInput").value);save();progress();
  });
  $("codeInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();selectedChoice=null;run();}});
  $("guidedButton").addEventListener("click",()=>{
    const m=mission(),g=m.guided;if(!g)return;stopActive();selectedChoice=null;
    let at=$("codeInput").value.lastIndexOf(g.before);if(at<0){$("codeInput").value=m.starter;at=$("codeInput").value.lastIndexOf(g.before);}
    if(at>=0)$("codeInput").setRangeText(g.after,at,at+g.before.length,"select");
    quest.setDraft($("codeInput").value);save();progress();resetWorld();
    const message="You changed "+g.before+" to "+g.after+". "+m.lesson+" Run the code to see its effect on the encounter.";
    setOutput("ready","One edit made. Now use it.",message);voice.read(message);$("codeInput").focus();
  });
  $("findTokenButton").addEventListener("click",()=>{
    const g=mission().guided;if(!g)return;const editor=$("codeInput"),at=editor.value.lastIndexOf(g.before);
    if(at<0){setOutput("ready","Reset code can bring that part back","Keep experimenting, or reset to the original example.");return;}
    editor.focus();editor.setSelectionRange(at,at+g.before.length);editor.scrollIntoView({behavior:"instant",block:"center"});
    const message="The highlighted part is "+g.before+". Type "+g.after+" to replace it, then run your code.";
    setOutput("ready","This is the part you change",message);voice.read(message);
  });
  $("skipAnimation").addEventListener("click",()=>{skipRequested=true;$("skipAnimation").hidden=true;});
  $("hintButton").addEventListener("click",()=>hint(0));$("easyHint").addEventListener("click",()=>hint(0));$("moreHintButton").addEventListener("click",()=>hint(1));
  $("solutionButton").addEventListener("click",()=>{
    stopActive();selectedChoice=null;$("codeInput").value=mission().solution;quest.setDraft(mission().solution);save();progress();resetWorld();
    setOutput("ready","A worked plan is in the editor",mission().lesson+" Run it to see the encounter respond.");voice.read(mission().lesson+" Now run the code.");$("codeInput").focus();
  });
  $("resetButton").addEventListener("click",()=>{stopActive();state.drafts[state.level]=null;render();$("codeInput").focus();});
  $("previousButton").addEventListener("click",()=>goTo(state.level-1));
  $("nextButton").addEventListener("click",()=>{if(!busy&&quest.gateOpen())state.level===MISSIONS.length-1?ending():goTo(state.level+1);});
  $("easyContinue").addEventListener("click",()=>$("nextButton").click());
  $("startLessonButton").addEventListener("click",jumpToPuzzle);$("enterPuzzleButton").addEventListener("click",jumpToPuzzle);
  $("retreatButton").addEventListener("click",retreat);
  $("voiceToggle").addEventListener("click",()=>{if(!voice.isEnabled())effects.disable();});
  $("restartButton").addEventListener("click",restart);$("replayButton").addEventListener("click",restart);
  addEventListener("pagehide",event=>{stopActive();voice.stop();if(!event.persisted)world?.dispose?.();});
  addEventListener("pageshow",event=>{if(event.persisted){resetWorld();progress();}});
  window.CodeQuestWorld={snapshot:()=>world?.snapshot()||{mode:"loading"}};
  graphicsReady=import("./scene.js?v="+VERSION).then(module=>module.createScene({container:$("worldArt"),reducedMotion:()=>reduced()||skipRequested,onStatus:text=>{$("graphicsStatus").textContent=String(text);if(world)$("graphicsStatus").dataset.mode=world.snapshot().mode;}})).then(scene=>{
    world=scene;$("graphicsStatus").dataset.mode=scene.snapshot().mode;
    $("graphicsStatus").textContent=scene.snapshot().mode==="webgl"?"Rendered 3D dungeon · articulated characters and changing devices":"Canvas adventure view · WebGL unavailable on this device";
    return scene;
  }).catch(()=>{
    world={reset(){},cancel(){},async playFrame(){},async enterEncounter(){},async complete(){},snapshot:()=>({mode:"text"})};
    $("graphicsStatus").textContent="Graphics could not load. The narrated text-and-code quest still works.";return world;
  });
  render();
})();
