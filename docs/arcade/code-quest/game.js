/* Code Quest: Save Starlight Bay. Original Kira Labs educational game.
 * Every coding puzzle runs locally in a disposable web worker (sandbox.js).
 * State persists only in this browser's localStorage, never on a server.
 */
(() => {
  "use strict";
  const MISSIONS = [
    {
      chapter:"CHAPTER 1 · THE BLACKOUT", topic:"STRINGS", speaker:"MIRA · THE INVENTOR",
      title:"A Voice in the Dark", place:"The workshop · 11:47 PM",
      story:"Something has stolen the light from Starlight Bay. Outside, everyone is waiting for the midnight festival. Mira pulls a sheet from her little robot. “This is PIX. He can help us—but first, he needs to hear his name.”",
      goal:"Change the text inside the quotes to say: Hello, PIX!",
      lessonTitle:"1. Strings tell the story",
      lesson:"Text in JavaScript belongs inside quotation marks. The say() command makes PIX speak those exact words.",
      starter:'// Change "friend" to the robot’s name.\nsay("Hello, friend!");',
      solution:'say("Hello, PIX!");',
      hint:"Inside say( ... ), replace friend with PIX. Keep both quotation marks and the semicolon.",
      success:"PIX opens his bright blue eyes. “Hello, Mira! Hello, programmer!” The first spark is back.",
      start:{x:1,y:2,dir:"east"}, target:{x:4,y:2,icon:"✦"},
      check:(r) => r.actions.some(a => a.type==="say" && a.value.trim().toLowerCase()==="hello, pix!")
    },
    {
      chapter:"CHAPTER 1 · THE BLACKOUT", topic:"VARIABLES", speaker:"PIX · WORKSHOP ROBOT",
      title:"The Crystal Charger", place:"The workshop · 11:52 PM",
      story:"PIX points to a lantern with three empty crystal sockets. “We need three crystals,” he says. “This machine stores its charge in a variable. Can you give it enough energy?”",
      goal:"Set crystals to 3 or more, then run charge(crystals).",
      lessonTitle:"2. Variables remember values",
      lesson:"let creates a named container for information. Change the number stored in crystals and watch the lantern respond.",
      starter:"// We need at least three crystals.\nlet crystals = 1;\ncharge(crystals);",
      solution:"let crystals = 3;\ncharge(crystals);",
      hint:"The variable already exists. Change the 1 to 3, then leave charge(crystals) in place.",
      success:"Three crystal sockets flash to life! A map appears on the wall: the old beacon is across the village.",
      start:{x:1,y:2,dir:"east"}, target:{x:5,y:1,icon:"💎"},
      check:(r) => r.actions.some(a => a.type==="charge" && a.value>=3)
    },
    {
      chapter:"CHAPTER 2 · THE JOURNEY", topic:"COMMANDS", speaker:"MIRA · THE INVENTOR",
      title:"The Moonlit Courtyard", place:"Village courtyard · 12:01 AM",
      story:"The workshop doors open onto a silent courtyard. PIX can move only when you give him instructions. Three squares ahead is the glowing stone that opens the path to the river.",
      goal:"Make PIX move exactly 3 squares to the right, ending on the glowing stone.",
      lessonTitle:"3. Commands make things happen",
      lesson:"move(3) tells PIX to move three squares. Change the number between parentheses to control how far he travels.",
      starter:"// One step is not enough.\nmove(1);",
      solution:"move(3);",
      hint:"PIX starts at the left edge of the trail. Use move(3); instead of move(1);.",
      success:"PIX lands on the glowing stone. The village gates slide open, revealing a moonlit river.",
      start:{x:0,y:2,dir:"east"}, target:{x:3,y:2,icon:"✨"},
      check:(r) => r.x===3 && r.y===2
    },
    {
      chapter:"CHAPTER 2 · THE JOURNEY", topic:"DIRECTIONS", speaker:"PIX · WORKSHOP ROBOT",
      title:"The Twisting Bridge", place:"Moonwater River · 12:08 AM",
      story:"A glass bridge bends around a dark waterfall. PIX has to go two squares east, turn right toward the riverbank, then go two squares south. A wrong turn sends him toward the old ruins!",
      goal:"Travel east 2 squares, turn right, then travel south 2 squares.",
      lessonTitle:"4. Order matters",
      lesson:"JavaScript runs your commands from top to bottom. turn('right') changes PIX's direction before the next move.",
      starter:'move(2);\nturn("left");\nmove(2);',
      solution:'move(2);\nturn("right");\nmove(2);',
      hint:"PIX begins facing east. A right turn points south; a left turn points north. Change only the direction word.",
      success:"The bridge lights beneath his feet. On the other side, an enormous iron door guards the next path.",
      start:{x:0,y:0,dir:"east"}, target:{x:2,y:2,icon:"🏁"},
      check:(r) => r.x===2 && r.y===2
    },
    {
      chapter:"CHAPTER 3 · THE LOST ARCHIVE", topic:"IF STATEMENTS", speaker:"MIRA · THE INVENTOR",
      title:"The Gatekeeper's Riddle", place:"The Archive · 12:17 AM",
      story:"An old brass gatekeeper speaks: “Only a traveler with at least two keys may enter.” Mira checks her bag. Two keys! But the gate's program is asking for too many.",
      goal:"Fix the if statement so the gate opens when keys is 2.",
      lessonTitle:"5. Conditions make decisions",
      lesson:"if (condition) runs the code in braces only when the condition is true. >= means greater than or equal to.",
      starter:"let keys = 2;\nif (keys >= 3) {\n  openGate();\n}",
      solution:"let keys = 2;\nif (keys >= 2) {\n  openGate();\n}",
      hint:"Mira has 2 keys. The gate currently requires 3. Change the number after >= to 2.",
      success:"The gatekeeper bows. “The condition is true. Welcome, friends.” Inside, a starrail hums to life.",
      start:{x:1,y:2,dir:"east"}, target:{x:5,y:2,icon:"🚪"},
      check:(r,code) => /\bif\s*\(/.test(code) && r.actions.some(a=>a.type==="openGate")
    },
    {
      chapter:"CHAPTER 3 · THE LOST ARCHIVE", topic:"LOOPS", speaker:"PIX · WORKSHOP ROBOT",
      title:"The Clockwork Starrail", place:"Starrail Station · 12:26 AM",
      story:"A long clockwork corridor leads toward the hill. PIX can take one step at a time, but repeating the same command four times would be tedious. “Let's make the computer do the repeating!” he says.",
      goal:"Use a loop to move 1 square at a time until PIX reaches square 4.",
      lessonTitle:"6. Loops repeat your commands",
      lesson:"A for loop runs the code between { } again and again. Change the stop number to tell PIX to take four steps.",
      starter:"// Repeat the command four times.\nfor (let step = 0; step < 2; step++) {\n  move(1);\n}",
      solution:"for (let step = 0; step < 4; step++) {\n  move(1);\n}",
      hint:"The loop starts at 0 and stops before the number after <. Change step < 2 to step < 4.",
      success:"The starrail carries PIX safely through the corridor. Ahead, three falling stars wait to be gathered.",
      start:{x:0,y:2,dir:"east"}, target:{x:4,y:2,icon:"🌠"},
      check:(r,code) => r.x===4 && r.y===2 && /\b(?:for|while)\s*\(/.test(code) && r.actions.filter(a=>a.type==="move").length>=4
    },
    {
      chapter:"CHAPTER 4 · THE STARFALL", topic:"ARRAYS", speaker:"MIRA · THE INVENTOR",
      title:"Three Pieces of Starlight", place:"Starfall Meadow · 12:35 AM",
      story:"At the foot of Beacon Hill, three little stars have fallen into the grass. Each has a number: 1, 2 and 3. PIX's collection program lists the stars it knows about, but one is missing.",
      goal:"Update the array so PIX collects stars 1, 2 and 3.",
      lessonTitle:"7. Arrays keep lists together",
      lesson:"An array is a list inside square brackets. The for...of loop visits each item in the array, one at a time.",
      starter:"// Add the missing star.\nconst stars = [1, 2];\nfor (const star of stars) {\n  collect(star);\n}",
      solution:"const stars = [1, 2, 3];\nfor (const star of stars) {\n  collect(star);\n}",
      hint:"The array currently contains 1 and 2. Add a comma and 3 before the closing square bracket.",
      success:"All three stars settle inside PIX's lantern. The tower doors swing open, and the village gathers below.",
      start:{x:2,y:2,dir:"east"}, target:{x:5,y:1,icon:"⭐"},
      check:(r,code) => /\bfor\s*\(/.test(code) && [1,2,3].every(id=>r.actions.some(a=>a.type==="collect" && a.value===id))
    },
    {
      chapter:"CHAPTER 5 · THE BEACON", topic:"FUNCTIONS", speaker:"PIX · WORKSHOP ROBOT",
      title:"Light Starlight Bay!", place:"Beacon Hill · 12:44 AM",
      story:"The ancient beacon stands silent. PIX has written a function with all the steps needed to light it—but he forgot to call it. Mira takes your hand. “One last command. The whole town is counting on you.”",
      goal:"Call the lightBeacon function after its closing brace.",
      lessonTitle:"8. Functions package useful actions",
      lesson:"A function gives a name to a group of commands. Defining a function isn't enough—you must call it with parentheses to run its instructions.",
      starter:'function lightBeacon() {\n  charge(3);\n  say("Light Starlight Bay!");\n}\n// Your turn: call lightBeacon below.',
      solution:'function lightBeacon() {\n  charge(3);\n  say("Light Starlight Bay!");\n}\nlightBeacon();',
      hint:"The function is already defined. On a new line after }, write lightBeacon(); with parentheses and a semicolon.",
      success:"A brilliant beam rushes into the stars! The village glows gold. The festival is saved, and PIX cheers for his newest coding partner.",
      start:{x:3,y:2,dir:"east"}, target:{x:5,y:1,icon:"🏮"},
      check:(r,code) => /\bfunction\s+\w+\s*\(/.test(code) && r.actions.some(a=>a.type==="charge" && a.value>=3) && r.actions.some(a=>a.type==="say" && a.value.toLowerCase().includes("starlight bay"))
    }
  ];

  // Story-first play: each card is a complete, real JavaScript example.
  // Players can choose without typing and open the code editor whenever ready.
  const EASY_CHOICES=[
    [
      {label:'Wake PIX by saying “Hello, PIX!”',code:'say("Hello, PIX!");',why:"A string is a piece of text between quotation marks. PIX recognizes his name!"},
      {label:'Just say “Hello, friend!”',code:'say("Hello, friend!");',why:"That's a friendly message, but PIX is waiting to hear his own name."},
      {label:'Charge the lantern',code:'charge(3);',why:"Charging is useful later, but first we need to wake PIX by speaking."}
    ],
    [
      {label:'Put 3 crystals into the charger',code:"let crystals = 3;\ncharge(crystals);",why:"A variable stores the number 3, and PIX uses it to fill the charger."},
      {label:'Use just 1 crystal',code:"let crystals = 1;\ncharge(crystals);",why:"The lantern still needs more crystals to power on."},
      {label:'Use an empty charger',code:"let crystals = 0;\ncharge(crystals);",why:"There is no energy in an empty charger."}
    ],
    [
      {label:'Move PIX three squares forward',code:"move(3);",why:"A move command tells PIX exactly how many squares to walk."},
      {label:'Move PIX only one square',code:"move(1);",why:"PIX has two more squares to travel."},
      {label:'Walk five squares instead',code:"move(5);",why:"That goes past the glowing stone."}
    ],
    [
      {label:'Go forward, turn right and cross the bridge',code:'move(2);\nturn("right");\nmove(2);',why:"Order matters. PIX goes east, turns south, then walks two more squares."},
      {label:'Turn left at the bridge',code:'move(2);\nturn("left");\nmove(2);',why:"PIX has turned toward the waterfall, not the path."},
      {label:'Keep going straight',code:'move(2);\nmove(2);',why:"The bridge bends. PIX needs to turn to reach the end."}
    ],
    [
      {label:'Open the gate with 2 keys',code:"let keys = 2;\nif (keys >= 2) {\n  openGate();\n}",why:"if checks the number of keys. Two keys meet the condition."},
      {label:'Demand 3 keys',code:"let keys = 2;\nif (keys >= 3) {\n  openGate();\n}",why:"Mira has two keys. The gate must not require three."},
      {label:'Open only with fewer than 2 keys',code:"let keys = 2;\nif (keys < 2) {\n  openGate();\n}",why:"That condition is false because Mira has two keys."}
    ],
    [
      {label:'Repeat one step four times',code:"for (let step = 0; step < 4; step++) {\n  move(1);\n}",why:"A loop repeats a small action. PIX makes four steps automatically."},
      {label:'Repeat only twice',code:"for (let step = 0; step < 2; step++) {\n  move(1);\n}",why:"PIX needs to travel two more squares."},
      {label:'Repeat six times',code:"for (let step = 0; step < 6; step++) {\n  move(1);\n}",why:"That's too far down the corridor."}
    ],
    [
      {label:'Collect all three stars: 1, 2 and 3',code:"const stars = [1, 2, 3];\nfor (const star of stars) {\n  collect(star);\n}",why:"An array holds all three star numbers, and a loop visits each one."},
      {label:'Collect only stars 1 and 2',code:"const stars = [1, 2];\nfor (const star of stars) {\n  collect(star);\n}",why:"A star is still missing from the meadow."},
      {label:'Collect 2, 3 and 4',code:"const stars = [2, 3, 4];\nfor (const star of stars) {\n  collect(star);\n}",why:"You need star 1 as well as 2 and 3."}
    ],
    [
      {label:'Call the function to light the beacon!',code:'function lightBeacon() {\n  charge(3);\n  say("Light Starlight Bay!");\n}\nlightBeacon();',why:"A function groups commands, but calling it makes everything happen!"},
      {label:'Build a function but never call it',code:'function lightBeacon() {\n  charge(3);\n  say("Light Starlight Bay!");\n}',why:"You defined the function, but PIX won't run it until you call its name."},
      {label:'Call a function with no power',code:'function lightBeacon() {\n  charge(0);\n  say("Light Starlight Bay!");\n}\nlightBeacon();',why:"The beacon needs all three crystals to shine."}
    ]
  ];
  const WORLDS=["workshop","workshop","village","river","archive","station","meadow","beacon"];

  const $=id=>document.getElementById(id);
  const el={
    count:$("chapterCount"),progressLabel:$("progressLabel"),progressBar:$("progressBar"),progressFill:$("progressFill"),
    chapter:$("chapterName"),topic:$("topicName"),title:$("sceneTitle"),place:$("sceneCaption"),
    speaker:$("speaker"),story:$("storyText"),goal:$("goalText"),lessonTitle:$("lessonTitle"),
    lesson:$("lessonText"),editor:$("codeInput"),form:$("codeForm"),
    run:$("runButton"),hintBtn:$("hintButton"),reset:$("resetButton"),hint:$("hintBox"),
    hintText:$("hintText"),solution:$("solutionButton"),output:$("outputPanel"),outputTitle:$("outputTitle"),
    outputIcon:$("outputIcon"),outputText:$("outputText"),actionLog:$("actionLog"),
    previous:$("previousButton"),next:$("nextButton"),board:$("board"),stage:document.querySelector(".cq-stage"),
    ending:$("ending"),replay:$("replayButton"),
    choiceButtons:$("choiceButtons"),easyHint:$("easyHint"),choicePanel:$("choicePanel"),
    easyInstruction:$("easyInstruction"),easyContinue:$("easyContinue"),codeDetails:$("codeDetails"),
    startSound:$("startSound"),soundToggle:$("soundToggle"),hearAgain:$("hearAgain"),soundStatus:$("soundStatus"),
    pixSprite:$("pixSprite"),stageFlash:$("stageFlash")
  };
  const STORE="kira-code-quest-starlight-v1";
  const state={level:0,cleared:Array(MISSIONS.length).fill(false),drafts:Array(MISSIONS.length).fill(null)};
  let worker=null,timeout=null,animator=null;
  let selectedChoice=null,soundDecisionMade=false;
  const voice=window.KiraArcadeVoice.create({
    onStatus(message){el.soundStatus.textContent=message;},
    onSpeaking(speaking){el.pixSprite.classList.toggle("cq-talking",speaking);}
  });
  function updateSoundButtons(){
    el.startSound.hidden=soundDecisionMade;
    el.soundToggle.setAttribute("aria-pressed",String(voice.enabled));
    el.soundToggle.textContent=voice.enabled?"🔇 Mute narration":"🔊 Turn sound on";
  }
  function narrateScene(){
    const m=MISSIONS[state.level];
    voice.speak(m.title+". "+m.story+" Your mission: "+m.goal);
  }
  function startVoice(){
    soundDecisionMade=true;
    if(voice.enable()){voice.cue("scene");narrateScene();}
    updateSoundButtons();
  }
  function activateSoundFromChoice(){if(!soundDecisionMade)startVoice();}
  updateSoundButtons();
  try{
    const saved=JSON.parse(localStorage.getItem(STORE)||"null");
    if(saved && Array.isArray(saved.cleared) && saved.cleared.length===MISSIONS.length) {
      state.cleared=saved.cleared.map(Boolean);
      const firstUnfinished=state.cleared.findIndex(done=>!done);
      const ceiling=firstUnfinished<0?MISSIONS.length-1:firstUnfinished;
      state.level=Math.max(0,Math.min(ceiling,Number.isInteger(saved.level)?saved.level:0));
      if(Array.isArray(saved.drafts) && saved.drafts.length===MISSIONS.length){
        state.drafts=saved.drafts.map(v=>typeof v==="string" ? v.slice(0,6000) : null);
      }
    }
  }catch(_){/* Privacy modes may block storage; playing still works. */}
  const save=()=>{
    try{localStorage.setItem(STORE,JSON.stringify(state));}catch(_){/* No account or network needed. */}
  };
  const fmtAction=a=>{
    if(a.type==="say") return 'say('+JSON.stringify(a.value)+')';
    if(a.type==="openGate") return "openGate()";
    return a.type+"("+JSON.stringify(a.value)+")";
  };
  function setOutput(kind,title,message,actions=[]){
    el.output.dataset.state=kind;
    el.outputTitle.textContent=title;
    el.outputIcon.textContent=kind==="success"?"✓":kind==="error"?"!":"⌁";
    el.outputText.textContent=message;
    el.actionLog.replaceChildren();
    actions.slice(0,13).forEach(a=>{
      const tag=document.createElement("code");
      tag.textContent=fmtAction(a);
      el.actionLog.appendChild(tag);
    });
    if(actions.length>13){
      const tag=document.createElement("code");
      tag.textContent="+"+(actions.length-13)+" more";
      el.actionLog.appendChild(tag);
    }
  }
  function renderChoices(){
    el.choiceButtons.replaceChildren();
    EASY_CHOICES[state.level].forEach((option,i)=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="cq-choice-option";
      const label=document.createElement("span");
      label.className="cq-choice-name";
      label.textContent=(i+1)+". "+option.label;
      const code=document.createElement("code");
      code.className="cq-choice-code";
      code.textContent=option.code.length>115?option.code.slice(0,112)+"…":option.code;
      button.appendChild(label);
      button.appendChild(code);
      button.addEventListener("click",()=>chooseEasy(option,button));
      el.choiceButtons.appendChild(button);
    });
    el.easyInstruction.textContent=state.cleared[state.level]
      ?"This mission is complete! Continue the adventure below or explore the code."
      :"Tap a command below to help PIX. No typing, spelling or programming experience needed.";
    el.easyContinue.hidden=!state.cleared[state.level];
  }
  function chooseEasy(option,button){
    activateSoundFromChoice();
    selectedChoice={option,button,level:state.level};
    el.editor.value=option.code;
    state.drafts[state.level]=option.code;
    save();
    el.choiceButtons.querySelectorAll(".cq-choice-option").forEach(b=>b.classList.remove("is-selected","is-correct","is-try-again"));
    button.classList.add("is-selected");
    run();
  }
  function animateResult(ok){
    el.stage.classList.remove("cq-success-effect","cq-try-effect");
    void el.stage.offsetWidth;
    el.stage.classList.add(ok?"cq-success-effect":"cq-try-effect");
    if(ok)el.pixSprite.classList.add("cq-celebrate");
    setTimeout(()=>el.pixSprite.classList.remove("cq-celebrate"),900);
  }
  function describeSelection(ok,detail){
    if(selectedChoice && selectedChoice.level===state.level){
      selectedChoice.button.classList.add(ok?"is-correct":"is-try-again");
      if(ok){
        el.easyInstruction.textContent=selectedChoice.option.why+" Click Continue the story to keep playing!";
      }else{
        el.easyInstruction.textContent=selectedChoice.option.why+" Try another button — PIX can wait!";
      }
    }
    if(ok){voice.cue("win");voice.speak("You did it! "+detail+" Now choose Continue the story.");}
    else{voice.cue("wrong");voice.speak("Not quite. "+(selectedChoice?.option.why||"Try another command or tap the clue."));}
  }
  function updateProgress(){
    const done=state.cleared.filter(Boolean).length;
    el.count.textContent="Mission "+(state.level+1)+" of "+MISSIONS.length;
    el.progressLabel.textContent=done+" of "+MISSIONS.length+" complete";
    el.progressBar.setAttribute("aria-valuenow",String(done));
    el.progressFill.style.width=(100*done/MISSIONS.length)+"%";
    el.previous.disabled=state.level===0;
    el.next.disabled=!state.cleared[state.level];
    el.next.textContent=state.level===MISSIONS.length-1?"See the ending →":"Continue the story →";
    el.easyContinue.hidden=!state.cleared[state.level];
  }
  function tileKey(x,y){return x+","+y;}
  function renderBoard(pos,path=[]){
    const mission=MISSIONS[state.level];
    const current=pos||mission.start;
    const traveled=new Set(path.map(p=>tileKey(p.x,p.y)));
    const fragment=document.createDocumentFragment();
    for(let y=0;y<4;y++){
      for(let x=0;x<7;x++){
        const tile=document.createElement("span");
        tile.className="cq-tile";
        if((x+y)%3===0)tile.classList.add("is-trail");
        if(traveled.has(tileKey(x,y)))tile.classList.add("is-path");
        if(mission.target && mission.target.x===x && mission.target.y===y){
          tile.classList.add("is-goal");tile.textContent=mission.target.icon;
        }
        if(current.x===x && current.y===y){
          tile.classList.add("is-robot");tile.textContent="🤖";
        }
        fragment.appendChild(tile);
      }
    }
    el.board.replaceChildren(fragment);
    el.board.setAttribute("aria-label","PIX is at column "+(current.x+1)+", row "+(current.y+1)+", facing "+current.dir+". The glowing destination is marked on the grid.");
  }
  function stopActive(){
    if(worker){worker.terminate();worker=null;}
    if(timeout!==null){clearTimeout(timeout);timeout=null;}
    if(animator!==null){clearInterval(animator);animator=null;}
    el.run.disabled=false;el.run.innerHTML='<span aria-hidden="true">▶</span> Run my code';
  }
  function render(){
    stopActive();
    const m=MISSIONS[state.level];
    el.chapter.textContent=m.chapter;el.topic.textContent=m.topic;
    el.title.textContent=m.title;el.place.textContent=m.place;el.speaker.textContent=m.speaker;
    el.story.textContent=m.story;el.goal.textContent=m.goal;
    el.lessonTitle.textContent=m.lessonTitle;el.lesson.textContent=m.lesson;
    el.editor.value=state.drafts[state.level]??m.starter;
    el.hintText.textContent=m.hint;el.hint.hidden=true;el.hintBtn.setAttribute("aria-expanded","false");
    el.stage.classList.toggle("is-lit",state.cleared[MISSIONS.length-1]);
    el.stage.dataset.world=WORLDS[state.level];
    el.stage.classList.remove("cq-success-effect","cq-try-effect");
    selectedChoice=null;
    renderChoices();
    el.ending.hidden=true;
    setOutput(state.cleared[state.level]?"success":"ready",
      state.cleared[state.level]?"Mission already complete":"Ready to code",
      state.cleared[state.level]?"You solved this chapter. You can run it again, change your code, or continue.":"Choose one of the big buttons above. You can open the coding editor later if you want.");
    renderBoard(m.start);
    updateProgress();
    save();
    if(state.cleared.every(Boolean) && state.level===MISSIONS.length-1)showEnding(false);
    if(voice.enabled){voice.cue("scene");narrateScene();}
  }
  function simulate(m,actions){
    const directions=["east","south","west","north"];
    let x=m.start.x,y=m.start.y,dir=m.start.dir;
    const path=[{x,y,dir}];
    for(const a of actions){
      if(a.type==="turn"){
        const di=directions.indexOf(dir);
        dir=directions[(di+(a.value==="right"?1:3))%4];
        path.push({x,y,dir});
      } else if(a.type==="move"){
        for(let step=0;step<a.value;step++){
          if(dir==="east")x++;else if(dir==="west")x--;
          else if(dir==="south")y++;else if(dir==="north")y--;
          if(x<0||x>6||y<0||y>3)
            return {actions,x,y,dir,path,error:"PIX walked off the map. Check the number of steps and the direction of your turn."};
          path.push({x,y,dir});
        }
      }
    }
    return {actions,x,y,dir,path};
  }
  function animate(path){
    if(animator!==null){clearInterval(animator);animator=null;}
    if(path.length<2){renderBoard(path[0]);return;}
    let i=0;
    animator=setInterval(()=>{
      renderBoard(path[i],path.slice(0,i+1));
      i++;
      if(i>=path.length){clearInterval(animator);animator=null;renderBoard(path[path.length-1],path);}
    },175);
  }
  function showEnding(scroll=true){
    el.ending.hidden=false;el.stage.classList.add("is-lit");
    if(voice.enabled)voice.speak("The beacon shines again! The whole town celebrates. You saved Starlight Bay!");
    if(scroll) el.ending.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"nearest"});
  }
  function onResult(payload,runLevel,code){
    stopActive();
    if(runLevel!==state.level)return;
    if(!payload || !payload.ok){
      setOutput("error","PIX needs a little help",payload&&payload.error ? payload.error : "Try another command.");
      animateResult(false);describeSelection(false,"");
      return;
    }
    const m=MISSIONS[state.level];
    const sim=simulate(m,payload.actions);
    animate(sim.path);
    if(sim.error){setOutput("error","PIX took a wrong turn",sim.error,payload.actions);animateResult(false);describeSelection(false,"");return;}
    if(m.check(sim,code)){
      state.cleared[state.level]=true;
      save();
      updateProgress();
      el.stage.classList.toggle("is-lit",state.cleared[MISSIONS.length-1]);
      setOutput("success","Wonderful! PIX did it! ✦",m.success,payload.actions);
      animateResult(true);
      describeSelection(true,m.success);
      el.easyContinue.hidden=false;
      if(state.cleared.every(Boolean))showEnding();
    } else {
      setOutput("error","Try a different choice","PIX followed that command, but it didn’t get us to the next scene. Choose another button or tap the clue.",payload.actions);
      animateResult(false);describeSelection(false,"");
    }
  }
  function run(){
    if(worker)return;
    const code=el.editor.value;
    if(code.length>6000){setOutput("error","Code is too long","Keep your mission code under 6,000 characters.");return;}
    const runLevel=state.level;
    state.drafts[state.level]=code;save();
    setOutput("ready","PIX is following your instructions…","Your code is running locally in the browser.");
    el.run.disabled=true;el.run.textContent="Running…";
    let running;
    try{running=new Worker("sandbox.js?v=1");}catch(_){
      el.run.disabled=false;el.run.textContent="Run my code";
      setOutput("error","Code runner unavailable","This browser blocked JavaScript workers. Try opening the game in a current version of Chrome, Edge, Firefox, or Safari.");
      return;
    }
    worker=running;
    const finish=data=>{
      if(worker!==running)return;
      onResult(data,runLevel,code);
    };
    running.onmessage=e=>finish(e.data);
    running.onerror=()=>finish({ok:false,error:"The JavaScript runner stopped unexpectedly. Please check the code."});
    timeout=setTimeout(()=>finish({ok:false,error:"Your code ran for too long (possibly an endless loop). Check the loop condition and try again."}),1400);
    running.postMessage({code});
  }
  el.startSound.addEventListener("click",startVoice);
  el.soundToggle.addEventListener("click",()=>{
    soundDecisionMade=true;
    if(voice.enabled)voice.disable();else{voice.enable();narrateScene();}
    updateSoundButtons();
  });
  el.hearAgain.addEventListener("click",()=>{
    if(!voice.enabled){startVoice();}else narrateScene();
  });
  el.easyHint.addEventListener("click",()=>{
    activateSoundFromChoice();
    const hint=MISSIONS[state.level].hint;
    el.hint.hidden=false;el.hintBtn.setAttribute("aria-expanded","true");
    el.easyInstruction.textContent="PIX's clue: "+hint;
    voice.speak("PIX's clue. "+hint);
  });
  el.easyContinue.addEventListener("click",()=>el.next.click());
  el.form.addEventListener("submit",e=>{e.preventDefault();activateSoundFromChoice();selectedChoice=null;run();});
  el.editor.addEventListener("input",()=>{state.drafts[state.level]=el.editor.value;save();});
  el.editor.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();run();}
    if(e.key==="Tab"){
      e.preventDefault();
      const from=el.editor.selectionStart,to=el.editor.selectionEnd;
      el.editor.setRangeText("  ",from,to,"end");
      state.drafts[state.level]=el.editor.value;save();
    }
  });
  el.hintBtn.addEventListener("click",()=>{
    el.hint.hidden=!el.hint.hidden;
    el.hintBtn.setAttribute("aria-expanded",String(!el.hint.hidden));
  });
  el.solution.addEventListener("click",()=>{
    el.editor.value=MISSIONS[state.level].solution;
    state.drafts[state.level]=el.editor.value;save();
    setOutput("ready","A working example is in your editor","Read the lines, then press Run my code to see why this solution works.");
    el.editor.focus();
  });
  el.reset.addEventListener("click",()=>{
    el.editor.value=MISSIONS[state.level].starter;state.drafts[state.level]=null;save();
    setOutput("ready","Editor reset","This chapter's starter code is back. Your completed missions are still saved.");
    renderBoard(MISSIONS[state.level].start);
  });
  function goTo(index){
    if(index<0||index>=MISSIONS.length)return;
    const first=state.cleared.findIndex(done=>!done);
    if(first>=0 && index>first)return;
    state.level=index;render();
    document.querySelector(".cq-progress").scrollIntoView({behavior:"instant",block:"start"});
  }
  el.previous.addEventListener("click",()=>goTo(state.level-1));
  el.next.addEventListener("click",()=>{
    if(!state.cleared[state.level])return;
    if(state.level===MISSIONS.length-1)showEnding();
    else goTo(state.level+1);
  });
  el.replay.addEventListener("click",()=>{
    if(!window.confirm("Replay from the beginning? Your completed missions will reset on this device."))return;
    state.level=0;state.cleared=Array(MISSIONS.length).fill(false);state.drafts=Array(MISSIONS.length).fill(null);
    render();document.querySelector(".cq-progress").scrollIntoView({behavior:"instant",block:"start"});
  });
  window.addEventListener("pagehide",stopActive);
  render();
})();