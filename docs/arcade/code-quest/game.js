/* Code Quest: The Stoneward Oath. Original branching fantasy/code adventure.
 * Player programs go only to the bounded teaching interpreter. */
(() => {
  "use strict";
  const $=id=>document.getElementById(id), MISSIONS=window.CodeQuestMissions, ROUTES=window.CodeQuestEncounters;
  const STORE="kira-code-quest-stoneward-v3", VERSION="20261102-stoneward4";
  let saved=null;try{saved=JSON.parse(localStorage.getItem(STORE)||"null");}catch(_){}
  const quest=window.CodeQuestState.create({missions:MISSIONS,encounters:ROUTES,saved}), state=quest.data;
  const voice=window.CodeQuestVoice.init({toggle:$("voiceToggle"),replay:$("voiceReplay"),status:$("voiceStatus")});
  const effects=window.KiraArcadeVoice.create();
  let world=null,graphicsReady,worker=null,watchdog=null,generation=0,busy=false,hintStage=0,skipRequested=false,selectedChoice=null,checkedDraft=null;
  const reduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mission=()=>MISSIONS[state.level];
  const room=()=>quest.room();
  const route=()=>quest.activeRoute();
  const credited=()=>state.rooms.map(r=>Object.values(r.gates).some(Boolean));
  const worldOptions=()=>({mission:mission(),index:state.level,cleared:credited(),inventory:state.inventory,
    encounter:{route:route()?.kind||"safe",revealed:Boolean(route()),blocking:Boolean(route()&&!quest.gateOpen())}});
  function save(){try{localStorage.setItem(STORE,JSON.stringify(state));$("saveStatus").textContent="Code, passages and rewards save automatically on this device.";}
    catch(_){$("saveStatus").textContent="This browser is not saving progress. You can still play the quest.";}
  }
  function cue(kind){if(!voice.isEnabled())return;if(!effects.enabled)effects.enable();effects.cue(kind);}
  function setOutput(kind,title,message,actions=[]){
    $("outputPanel").dataset.state=kind;$("outputTitle").textContent=title;$("outputText").textContent=message;
    $("outputIcon").textContent=kind==="success"?"✓":kind==="error"?"!":"→";
    $("resultTitle").textContent=title;$("resultText").textContent=message;
    $("actionLog").replaceChildren(...actions.slice(0,12).map(a=>{const c=document.createElement("code");c.textContent=a.type+"("+(a.value===null?"":JSON.stringify(a.value))+")";return c;}));
  }
  function stopActive(){
    generation++;busy=false;skipRequested=false;world?.cancel();
    if(worker){worker.terminate();worker=null;}
    if(watchdog!==null){clearTimeout(watchdog);watchdog=null;}
    $("stage").classList.remove("is-running");$("skipAnimation").hidden=true;
  }
  function resetWorld(){world?.reset(worldOptions());}
  function openDialog(id){const d=$(id);if(!d.open)d.showModal();}
  function closeDialogs(){document.querySelectorAll(".cq-dialog[open]").forEach(d=>d.close());}
  function reveal(element){const b=element.getBoundingClientRect();if(b.top<0||b.bottom>innerHeight)element.scrollIntoView({behavior:"instant",block:"center"});}
  function revealAction(){
    const stage=$("stage"),bounds=stage.getBoundingClientRect();
    const header=document.querySelector(".site-header")?.getBoundingClientRect();
    const safeTop=Math.max(16,(header?.bottom||0)+12),safeBottom=innerHeight-16;
    if(bounds.top<safeTop||bounds.bottom>safeBottom){
      const desiredTop=safeTop+Math.max(0,(safeBottom-safeTop-bounds.height)/2);
      // Scroll the document directly: nested overflow containers and asymmetric
      // scroll margins can move scrollIntoView's center below a short viewport.
      window.scrollBy({top:bounds.top-desiredTop,behavior:"instant"});
    }
  }
  function revealResult(){
    const panel=$("outputPanel"),bounds=panel.getBoundingClientRect();
    if(bounds.top<90||bounds.bottom>innerHeight-20)panel.scrollIntoView({behavior:reduced()?"instant":"smooth",block:"center"});
  }
  // Draft wording is deliberately neutral. A changed comment, wrong program or
  // incomplete edit is "untested", never evidence of a solved encounter.
  function instruction(){
    const m=mission(),code=$("codeInput").value,active=route(),changed=code!==m.starter;
    const checked=checkedDraft&&checkedDraft.level===state.level&&checkedDraft.route===active?.id&&checkedDraft.code===code;
    const status=checked?(checkedDraft.ok?"verified":"retry"):quest.gateOpen()?"cleared-earlier":changed?"untested":"starter";
    let next;
    if(status==="verified")next="Your code passed. Press Continue to reach the next encounter.";
    else if(status==="retry")next=quest.gateOpen()?"This run needs work. Your earlier reward is safe; retry or Continue.":"This run needs work. Review the feedback or Teach me / hints, then try again.";
    else if(status==="cleared-earlier")next="Passage cleared earlier. Run to check this draft, or Continue with your reward.";
    else if(!active)next=changed?"Your draft is saved. Choose a passage, then Run to check it.":"First: choose a passage. Then make the coding change and Run.";
    else next=changed?"Your draft is saved. Press Run to check it.":"Next: make the coding change below, then press Run my code.";
    const goal=status==="starter"||(!m.guided&&status==="untested")?m.goal:next;
    return {status,changed,next,goal};
  }
  function storyCopy(){
    let story=mission().story;
    if(instruction().changed){
      if(state.level===0)story=story.replace(" Change friend to PIX.","");
      if(state.level===1)story=story.replace("Give crystals the value 3; the lantern will hold back the things below.","The lantern needs three crystals to hold back the things below.");
    }
    return story;
  }
  function currentNarration(){return storyCopy()+" "+$("encounterText").textContent+" "+instruction().next;}
  function syncInstructions(){
    const info=instruction();$("goalText").textContent=info.goal;
    $("currentAction").textContent=busy?"Watch the encounter. Your code and supplies are safe.":info.next;
    $("storyText").textContent=storyCopy();
    $("lessonText").textContent=state.level===0&&info.changed?
      'A string is text inside quotation marks. say() makes PIX speak that text. The starting example used friend; its working example uses PIX. Your draft is kept. '+info.next:mission().lesson;
    guided();
    if(!$("hintBox").hidden)updateHint();
    voice.remember(currentNarration());
  }
  function progress(){
    const count=quest.completedCount(),active=route(),open=quest.gateOpen();
    $("chapterCount").textContent="Mission "+(state.level+1)+" of "+MISSIONS.length;
    $("progressLabel").textContent=count+" / "+MISSIONS.length+" encounters cleared";
    $("progressFill").style.width=100*count/MISSIONS.length+"%";$("progressBar").setAttribute("aria-valuenow",String(count));
    $("previousButton").disabled=state.level===0;
    $("nextButton").disabled=busy||!open;$("easyContinue").hidden=busy||!open;
    $("nextButton").textContent=state.level===MISSIONS.length-1?"See the town's fate →":"Continue the quest →";
    // At a junction, Run explains the prerequisite instead of silently locking.
    $("runButton").disabled=busy;$("runButton").textContent=busy?"PIX is acting...":"Run my code";
    const step=!active?"route":open?"continue":"code";
    $("flowSteps").querySelectorAll("li").forEach(li=>{if(li.dataset.step===step)li.setAttribute("aria-current","step");else li.removeAttribute("aria-current");});
    syncInstructions();
    $("nextButton").setAttribute("aria-describedby","currentAction");
    $("startLessonButton").textContent=active?"Face this encounter: use code ↓":"Begin here: choose a passage ↓";
    $("enterPuzzleButton").hidden=!active;$("enterPuzzleButton").disabled=busy;
    $("retreatButton").hidden=!active;
    $("journeyMap").replaceChildren(...MISSIONS.map((m,i)=>{
      const b=document.createElement("button");b.type="button";b.textContent=credited()[i]?"✦":String(i+1);b.disabled=busy||!quest.canVisit(i);
      b.setAttribute("aria-label","Mission "+(i+1)+": "+m.title+(b.disabled?" (locked)":""));
      if(i===state.level)b.setAttribute("aria-current","step");b.addEventListener("click",()=>goTo(i));return b;
    }));
    $("choiceButtons").querySelectorAll("button").forEach(b=>{b.disabled=busy||!active;});
    $("choiceRouteNote").hidden=Boolean(active);$("choiceRouteButton").hidden=Boolean(active);
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
      const desc=document.createElement("span");desc.textContent=r.description;b.append(label,desc);b.title=r.description;b.setAttribute("aria-label",r.label+". "+r.description);
      b.addEventListener("click",()=>chooseRoute(r.id));return b;
    }));
  }
  function renderChoices(){
    selectedChoice=null;$("easyInstruction").textContent="Choose what PIX should do. Each command is shown, then runs in the encounter. No typing is required.";
    $("choiceButtons").replaceChildren(...window.CodeQuestChoices[state.level].map(option=>{
      const b=document.createElement("button");b.type="button";b.className="cq-choice-option";
      const strong=document.createElement("strong");strong.textContent=option.label;const c=document.createElement("code");c.textContent=option.code;b.append(strong,c);
      b.addEventListener("click",()=>{if(busy)return;closeDialogs();selectedChoice=option;$("codeInput").value=option.code;quest.setDraft(option.code);save();run();});return b;
    }));
  }
  function guided(){
    const m=mission(),g=m.guided,info=instruction();$("guidedStep").hidden=!g;$("guidedStep").dataset.status=info.status;if(!g)return;
    const original=!info.changed;
    $("guidedText").textContent=original?(state.level===0?'say() speaks the text inside quotes. Keep the punctuation; change only friend to PIX.':"Try one small edit. "+g.label):info.next;
    $("guidedButton").textContent=original?g.label:"See original example";
    $("findTokenButton").textContent=original?"Point to the part I change":"Look at my draft";
    $("workedExample").replaceChildren();
    const label=document.createElement("strong");label.textContent=original?"Starting example":"Original working example (reference)";$("workedExample").append(label);
    const line=document.createElement("pre");
    if(original&&state.level===0){const mark=document.createElement("mark");mark.textContent="friend";line.append('say("Hello, ',mark,'!");');}
    else line.textContent=original?m.starter:m.solution;
    $("workedExample").append(line);
    const explanation=document.createElement("p");explanation.textContent=original?m.lesson:"This example explains the original task. Your current draft is kept; Run checks what it does. "+info.next;$("workedExample").append(explanation);
  }
  function render(announce=true){
    stopActive();voice.stop();hintStage=0;const m=mission();
    for(const [id,text] of Object.entries({chapterName:m.chapter,topicName:m.topic,sceneTitle:m.title,sceneCaption:m.place,speaker:m.speaker,storyText:m.story,goalText:m.goal,lessonTitle:m.lessonTitle,lessonText:m.lesson,sceneCue:m.cue,worldStatus:m.objective}))$(id).textContent=text;
    $("codeInput").value=state.drafts[state.level]??m.starter;
    $("hintBox").hidden=true;$("hintButton").setAttribute("aria-expanded","false");$("moreHintButton").hidden=false;$("solutionButton").hidden=true;
    $("pixSpeech").hidden=true;$("ending").close();$("ending").hidden=true;$("stage").dataset.theme=m.theme;$("stage").classList.remove("is-success");
    $("energy").querySelectorAll("i").forEach(i=>i.classList.remove("charged"));
    $("board").textContent="PIX waits at the entrance. "+m.quest.need;
    guided();renderChoices();renderRoutes();progress();save();
    const active=route();
    setOutput(instruction().status==="verified"?"success":"ready",quest.gateOpen()?"Passage cleared earlier":active?"Your code can open the way":"Choose your passage first",
      quest.gateOpen()?"This passage was cleared earlier. Your reward is safe. Run to check this draft, or Continue.":instruction().next);
    const ticket=generation;graphicsReady?.then(()=>{if(ticket===generation)resetWorld();});
    if(announce)voice.read(currentNarration());
    if(quest.completedCount()===MISSIONS.length&&quest.gateOpen()&&state.level===MISSIONS.length-1)ending(false);
  }
  async function chooseRoute(id){
    stopActive();if(!quest.chooseRoute(id))return;render(false);
    const active=route(),ticket=generation;busy=true;progress();
    $("worldStatus").textContent=active.blocked;
    voice.read(quest.gateOpen()?"You return to a passage you already cleared. "+active.clear:active.narration+" "+instruction().next);
    revealAction();
    await graphicsReady;if(ticket!==generation)return;
    if(quest.gateOpen())resetWorld();
    else{const opts=worldOptions();world.reset({...opts,encounter:{...opts.encounter,revealed:false}});await world.enterEncounter({route:active.kind});}
    if(ticket!==generation)return;busy=false;progress();save();
    // The route buttons were rebuilt. Recover keyboard focus only if it fell
    // back to the body, leaving anyone who began typing undisturbed.
    if(document.activeElement===document.body)$("routeChoices").querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
  }
  function retreat(){
    stopActive();quest.retreat();render(false);
    const text="You step back to the junction. Your recovered parts are safe. Choose another passage, or return to the same encounter and try its code again.";
    $("encounterText").textContent=text;voice.read(text);reveal($("encounterPanel"));
  }
  function simulate(m,actions,features=[]){
    const dirs=["east","south","west","north"];let {x,y,dir}=m.start;
    const path=[{x,y,dir}],frames=[];
    for(const a of actions){
      if(a.type==="turn")dir=dirs[(dirs.indexOf(dir)+(a.value==="right"?1:3))%4];
      if(a.type==="move"){
        for(let n=0;n<a.value;n++){
          if(dir==="east")x++;else if(dir==="west")x--;else if(dir==="south")y++;else y--;
          if(x<0||x>6||y<0||y>3)return{actions,features,x,y,dir,frames,path,error:"That route reaches the edge of the safe path. Review your movement commands, or open Teach me / hints for the original example."};
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
    await complete(ok,sim.error||(ok?m.success:"This run did not clear the encounter. Review Teach me / hints for the original example, then try your code again."),payload.actions,ticket);
  }
  async function complete(ok,message,actions,ticket){
    await world.complete({...worldOptions(),success:ok});
    if(ticket!==generation)return;
    checkedDraft={level:state.level,route:route()?.id,code:$("codeInput").value,ok};
    if(ok)quest.solve();else quest.fail();
    busy=false;skipRequested=false;$("skipAnimation").hidden=true;$("stage").classList.remove("is-running");$("stage").classList.toggle("is-success",ok);
    if(selectedChoice)message=selectedChoice.why+" "+message;
    const active=route(),m=mission();
    if(ok){message+=" "+m.explanation+" Secured: "+m.quest.reward.name+".";
      $("worldStatus").textContent=active.clear+" Reward: "+m.quest.reward.name;
      $("encounterText").textContent=active.clear;
      voice.read(active.clear+" You secure "+m.quest.reward.name+". Town protection is now "+state.defense+" percent. "+(state.defense===100?"The stormwraith cannot reach the town.":"Another passage leads deeper. Continue when you are ready."));
    }else{message+=" Nothing is lost. Try another change, ask Iris for help, or retreat to the junction.";
      voice.read("This run needs another idea. PIX and your supplies are safe. Review the feedback or Teach me / hints, then try again.");
    }
    $("easyInstruction").textContent=selectedChoice?selectedChoice.why+(ok?" The way is open.":" Try a different command."):
      ok?"Your code opened the way. Continue the quest.":"PIX is safe. Try again or use a hint.";
    setOutput(ok?"success":"error",ok?"The passage is yours":"The encounter needs another idea",message,actions);
    save();progress();cue(ok?"win":"wrong");
    if(quest.completedCount()===MISSIONS.length&&quest.gateOpen())ending(false);
    revealResult();
  }
  async function run(){
    if(busy)return;
    if(!route()){setOutput("ready","Your code is saved. Choose a passage.","Choose either passage at the top of this workspace, then Run the same code. Continue unlocks after the encounter is solved.");reveal($("encounterPanel"));$("routeChoices").querySelector("button")?.focus({preventScroll:true});return;}
    const code=$("codeInput").value;if(!code.trim()){setOutput("error","Your editor is empty","Reset code brings back this encounter's starting point.");return;}
    if(code.length>6000){setOutput("error","That program is too long","Keep your quest program to 6,000 characters.");return;}
    stopActive();quest.setDraft(code);save();voice.stop();busy=true;progress();$("pixSpeech").hidden=true;
    $("stage").classList.add("is-running");
    revealAction();
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
  function updateHint(){
    const info=instruction(),original=!info.changed;
    $("hintTitle").textContent=original?(hintStage?"Iris shows the exact change":"The game master's nudge"):(hintStage?"Original example (reference)":"Your current draft");
    $("hintText").textContent=original?mission().hints[hintStage]:hintStage?"Original working example: "+mission().solution+" This is a reference, not a request to replace your current draft. "+info.next:info.next+" Editing alone does not clear the encounter; Run checks your instructions.";
    $("moreHintButton").textContent=original?"Show the exact change":"Show the original example";
    $("moreHintButton").hidden=hintStage>0;$("solutionButton").hidden=hintStage===0;
    $("solutionButton").textContent=original?"Put a working example in my editor":"Use this example (replaces my draft)";
  }
  function hint(stage=0){
    document.querySelectorAll(".cq-dialog[open]").forEach(d=>{if(d.id!=="helpDialog")d.close();});openDialog("helpDialog");
    hintStage=stage;$("hintBox").hidden=false;$("hintButton").setAttribute("aria-expanded","true");
    updateHint();
    voice.read("Here is a way through this encounter. "+$("hintText").textContent);
  }
  function goTo(index){
    if(!quest.canVisit(index))return;closeDialogs();stopActive();quest.goTo(index);render();
    $("routeChoices").querySelector("button")?.focus({preventScroll:true});reveal($("encounterPanel"));
  }
  function ending(show=true){$("ending").hidden=false;if(show){closeDialogs();openDialog("ending");}}
  function restart(){if(!confirm("Start a new Stoneward quest? Your passages, quest rewards and code for this adventure will reset."))return;
    closeDialogs();stopActive();checkedDraft=null;quest.restart();render();reveal($("encounterPanel"));
  }
  function jumpToPuzzle(){
    if(!route()){reveal($("encounterPanel"));$("routeChoices").querySelector("button")?.focus({preventScroll:true});return;}
    if(mission().guided){reveal($("guidedStep"));$("findTokenButton").focus({preventScroll:true});}
    else{$("codeInput").focus();reveal($("codeInput"));}
  }
  $("sceneTitle").tabIndex=-1;
  $("codeForm").addEventListener("submit",e=>{e.preventDefault();selectedChoice=null;run();});
  $("codeInput").addEventListener("input",()=>{
    selectedChoice=null;if(busy){stopActive();resetWorld();setOutput("ready","Your new draft is ready","Run the changed code to face this encounter again.");}
    quest.setDraft($("codeInput").value);save();progress();
    setOutput("ready","Your current draft",instruction().next);
  });
  $("codeInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();selectedChoice=null;run();}});
  $("guidedButton").addEventListener("click",()=>{
    const m=mission(),g=m.guided;if(!g)return;
    if(instruction().changed){hint(1);return;}
    stopActive();selectedChoice=null;
    let at=$("codeInput").value.lastIndexOf(g.before);if(at<0)return;
    if(at>=0)$("codeInput").setRangeText(g.after,at,at+g.before.length,"select");
    quest.setDraft($("codeInput").value);save();progress();resetWorld();
    const message="Your edited draft is saved. "+instruction().next;
    setOutput("ready","One edit made. Now use it.",message);voice.read(message);$("codeInput").focus();
  });
  $("findTokenButton").addEventListener("click",()=>{
    const g=mission().guided;if(!g)return;const editor=$("codeInput");
    if(instruction().changed){editor.focus({preventScroll:true});reveal(editor);setOutput("ready","Your current draft",instruction().next);voice.read(instruction().next);return;}
    const at=editor.value.lastIndexOf(g.before);
    if(at<0){setOutput("ready","Reset code can bring that part back","Keep experimenting, or reset to the original example.");return;}
    editor.focus();editor.setSelectionRange(at,at+g.before.length);reveal(editor);
    const message="The highlighted part is "+g.before+". Type "+g.after+" to replace it, then run your code.";
    setOutput("ready","This is the part you change",message);voice.read(message);
  });
  $("skipAnimation").addEventListener("click",()=>{skipRequested=true;$("skipAnimation").hidden=true;});
  $("hintButton").addEventListener("click",()=>hint(0));$("easyHint").addEventListener("click",()=>hint(0));$("moreHintButton").addEventListener("click",()=>hint(1));
  $("solutionButton").addEventListener("click",()=>{
    closeDialogs();stopActive();selectedChoice=null;$("codeInput").value=mission().solution;quest.setDraft(mission().solution);save();progress();resetWorld();
    setOutput("ready","Original example copied",instruction().next);voice.read(instruction().next);$("codeInput").focus();
  });
  $("resetButton").addEventListener("click",()=>{stopActive();checkedDraft=null;state.drafts[state.level]=null;render();$("codeInput").focus();});
  $("previousButton").addEventListener("click",()=>goTo(state.level-1));
  $("nextButton").addEventListener("click",()=>{if(!busy&&quest.gateOpen())state.level===MISSIONS.length-1?ending():goTo(state.level+1);});
  $("easyContinue").addEventListener("click",()=>$("nextButton").click());
  $("startLessonButton").addEventListener("click",jumpToPuzzle);$("enterPuzzleButton").addEventListener("click",jumpToPuzzle);
  $("retreatButton").addEventListener("click",retreat);
  $("voiceToggle").addEventListener("click",()=>{if(!voice.isEnabled())effects.disable();});
  for(const [button,dialog] of Object.entries({openStory:"storyDialog",openJourney:"journeyDialog",openAbout:"aboutDialog",openChoices:"choicesDialog",openResult:"resultDialog"}))$(button).addEventListener("click",()=>openDialog(dialog));
  $("choiceRouteButton").addEventListener("click",()=>{closeDialogs();jumpToPuzzle();});
  $("helpDialog").addEventListener("close",()=>$("hintButton").setAttribute("aria-expanded","false"));
  $("storyReplay").addEventListener("click",()=>{
    voice.read(currentNarration());
    if(!voice.isEnabled())$("voiceReplay").click();
  });
  document.querySelectorAll("[data-close-dialog]").forEach(button=>button.addEventListener("click",()=>button.closest("dialog").close()));
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
