'use strict';
/* Data/interpreter/state contracts for Code Quest's dungeon adventure.
 * Run: node tests/test-code-quest-contracts.cjs
 * These checks do not render 3D, emulate the async game UI, or verify audio.
 * The runtime owns the interpreter -> objective check -> solve() boundary.
 * Local saves are normalized state, not authenticated completion evidence.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const directory=path.join(__dirname,'..','docs','arcade','code-quest');
const source=name=>fs.readFileSync(path.join(directory,name),'utf8');
const copy=value=>JSON.parse(JSON.stringify(value));

function runCodeQuestContracts(){
  const html=source('index.html'),game=source('game.js'),scene=source('scene.js');
  const sandbox=source('sandbox.js');
  for(const id of ['voiceToggle','voiceReplay','choicePanel','choiceButtons','easyContinue','easyHint','codeInput','guidedButton','findTokenButton','worldArt','sceneCaption','graphicsStatus']){
    assert(html.includes('id="'+id+'"'),'Missing Code Quest control/caption: '+id);
  }
  for(const file of ['missions.js','choices.js','encounters.js','quest-state.js','voice.js','game.js']){
    assert(html.includes('src="'+file),'Page must load '+file);
  }
  assert.match(game,/import\s*\(\s*['"`]\.\/scene\.js/,'Game must load its scene module');
  assert.match(game,/createScene\s*\(/,'Game must create the action world');
  assert.match(scene,/export\s+async\s+function\s+createScene\s*\(/,'Scene module needs its async renderer entry point');
  assert(scene.includes('./vendor/three.module.min.js'),'Three renderer must load from the local vendor directory');
  assert(scene.includes('./scene-fallback.js'),'An illustrated fallback must remain available');
  for(const file of ['scene-fallback.js','vendor/three.module.min.js','vendor/three.core.min.js','vendor/THREE-LICENSE.txt']){
    assert(fs.statSync(path.join(directory,file)).size>0,'Missing local renderer asset: '+file);
  }

  // Only trusted curriculum sources execute in this VM. Player code always goes
  // through the actual bounded interpreter, with dynamic host compilation disabled.
  const curriculum={};
  for(const file of ['missions.js','choices.js','encounters.js']){
    vm.runInNewContext(source(file),{window:curriculum},{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
  }
  const missions=curriculum.CodeQuestMissions;
  const choices=curriculum.CodeQuestChoices;
  const encounters=curriculum.CodeQuestEncounters;
  const {runTeachingProgram}=require('../docs/arcade/code-quest/sandbox.js');
  const {create}=require('../docs/arcade/code-quest/quest-state.js');
  const fresh=saved=>create({missions,encounters,saved});
  assert.equal(missions.length,14,'The dungeon must teach all fourteen gradual missions');
  assert.equal(choices.length,14,'Every mission needs an optional no-typing path');
  assert.equal(encounters.length,14,'Every mission needs a route junction');

  function simulate(mission,result){
    if(!result.ok)return {...result,error:result.error};
    const directions=['east','south','west','north'];
    let {x,y,dir}=mission.start;
    for(const action of result.actions){
      if(action.type==='turn')dir=directions[(directions.indexOf(dir)+(action.value==='right'?1:3))%4];
      if(action.type==='move')for(let step=0;step<action.value;step++){
        if(dir==='east')x++;else if(dir==='south')y++;else if(dir==='west')x--;else y--;
        if(x<0||x>6||y<0||y>3)return {...result,x,y,dir,error:'map edge'};
      }
    }
    return {...result,x,y,dir};
  }
  function passes(mission,program){
    const result=simulate(mission,runTeachingProgram(program));
    return !result.error&&Boolean(mission.check(result));
  }

  const rewardIds=new Set(),routeIds=new Set();
  let defense=0;
  for(const [level,mission] of missions.entries()){
    const label='Mission '+(level+1)+': '+mission.title;
    assert.equal(passes(mission,mission.solution),true,label+' canonical solution fails');
    assert.equal(passes(mission,mission.starter),false,label+' starter must leave a meaningful change');
    assert.equal(mission.hints.length,2,label+' needs staged conceptual/exact hints');
    assert(mission.explanation.length>35,label+' needs an explanation of what the code did');
    assert(mission.quest.need&&mission.quest.threat,label+' needs a concrete quest need and threat');
    assert(mission.quest.reward.id&&mission.quest.reward.name,label+' needs named equipment or a quest reward');
    assert(!rewardIds.has(mission.quest.reward.id),label+' repeats an equipment identifier');
    rewardIds.add(mission.quest.reward.id);
    assert(mission.quest.defense>=defense&&mission.quest.defense<=100,label+' protection must grow within its displayed scale');
    defense=mission.quest.defense;
    assert.equal(choices[level].length,3,label+' needs three large command choices');
    for(const [index,option] of choices[level].entries()){
      assert(option.label&&option.why.length>30,label+' choice needs specific teaching feedback');
      assert.equal(runTeachingProgram(option.code).ok,true,label+' choice must be valid teaching code');
      assert.equal(passes(mission,option.code),index===0,label+' choice '+(index+1)+' has the wrong objective result');
    }
    assert.equal(encounters[level].length,2,label+' needs two original route choices');
    for(const route of encounters[level]){
      assert(route.id&&!routeIds.has(route.id),label+' route identifiers must be unique');
      routeIds.add(route.id);
      assert(['safe','ambush','detour'].includes(route.kind),label+' has an unknown encounter kind');
      for(const field of ['label','description','narration','blocked','clear']){
        assert.equal(typeof route[field],'string',label+' route '+route.id+' needs '+field);
        assert(route[field].length>0,label+' route '+route.id+' has empty '+field);
      }
    }
  }
  assert.equal(defense,100,'Completing the adventure must restore the town defenses');
  assert.equal(routeIds.size,28,'All twenty-eight routes must be distinct');
  assert.equal(runTeachingProgram('delete self.fetch; say(String(fetch).includes("[native code]") ? "native fetch exposed" : "not native");').ok,false,'The inherited-fetch bypass must be rejected');
  assert(!/new\s+Function\s*\(/.test(sandbox),'Learner programs must not become host functions');

  // Run both routes through the complete real curriculum. A failed interpreted
  // attempt calls fail(), and only a checked solution calls the trusted solve()
  // signal. Browser tests separately verify the actual UI uses that boundary.
  let solvedRoutes=0;
  for(let routeIndex=0;routeIndex<2;routeIndex++){
    let machine=fresh();
    assert.equal(machine.solve(),false,'A junction cannot be solved before a route is chosen');
    assert.equal(machine.canVisit(1),false,'A fresh save cannot jump forward');
    for(let level=0;level<missions.length;level++){
      const mission=missions[level],route=encounters[level][routeIndex];
      assert.equal(machine.data.level,level);
      const beforeChoice=copy(machine.data);
      assert.equal(machine.chooseRoute('not-a-real-route'),false);
      assert.deepEqual(copy(machine.data),beforeChoice,'Rejected routes cannot mutate quest state');
      assert.equal(machine.chooseRoute(route.id),true);
      assert.equal(machine.activeRoute().id,route.id);
      assert.equal(machine.gateOpen(),false,'Choosing a route never clears its coding lock');
      assert.equal(machine.room().phase,'encounter');
      const inventory=copy(machine.data.inventory),protection=machine.data.defense;
      assert.equal(passes(mission,mission.starter),false);
      assert.equal(machine.fail(),true);
      assert.deepEqual(copy(machine.data.inventory),inventory,'Failed code cannot award equipment');
      assert.equal(machine.data.defense,protection,'Failed code cannot restore town protection');
      assert.equal(machine.canVisit(level+1),false,'An unresolved selected route blocks forward travel');
      machine.setDraft(mission.starter);
      machine=fresh(copy(machine.data));
      assert.equal(machine.activeRoute().id,route.id,'Reload must retain the unresolved chosen route');
      assert.equal(machine.gateOpen(),false,'Reload cannot convert an attempt into a cleared lock');
      assert.equal(machine.completedCount(),level);
      assert.deepEqual(copy(machine.data.inventory),inventory);
      assert.equal(machine.data.defense,protection);
      assert.equal(machine.data.drafts[level],mission.starter);
      assert.equal(machine.canVisit(level+1),false);
      assert.equal(passes(mission,mission.solution),true);
      assert.equal(machine.solve(),true);
      solvedRoutes++;
      assert.equal(machine.gateOpen(),true);
      assert.equal(machine.room().reward,mission.quest.reward.id);
      assert.equal(machine.completedCount(),level+1);
      assert.equal(machine.data.inventory.length,level+1);
      assert(machine.data.inventory.includes(mission.quest.reward.id));
      assert.equal(machine.data.defense,mission.quest.defense);
      machine.solve();
      assert.equal(machine.data.inventory.length,level+1,'Replaying a cleared lock cannot duplicate equipment');
      machine=fresh(copy(machine.data));
      assert.equal(machine.gateOpen(),true,'Reload retains an earned selected gate');
      assert.equal(machine.data.inventory.length,level+1);
      if(level<missions.length-1)assert.equal(machine.goTo(level+1),true);
    }
    assert.equal(machine.completedCount(),14);
    assert.equal(machine.data.defense,100);
    assert.equal(machine.canVisit(14),false,'No route points beyond the ending');
  }
  assert.equal(solvedRoutes,28);

  // Previously earned room credit must not clear a newly selected alternative.
  const alternative=fresh();
  alternative.chooseRoute(encounters[0][0].id);
  assert(passes(missions[0],missions[0].solution));alternative.solve();
  alternative.retreat();
  assert.equal(alternative.gateOpen(),false);
  assert.equal(alternative.canVisit(1),false,'Retreating to the junction closes the current traversal gate');
  alternative.chooseRoute(encounters[0][1].id);
  assert.equal(alternative.gateOpen(),false,'An alternative route has its own coding gate');
  const reloadedAlternative=fresh(copy(alternative.data));
  assert.equal(reloadedAlternative.gateOpen(),false,'Reload cannot use a different route\'s cleared gate');
  assert.equal(reloadedAlternative.canVisit(1),false);
  assert.equal(reloadedAlternative.data.inventory.length,1,'The already earned item stays safe during a detour');
  reloadedAlternative.fail();
  assert.equal(reloadedAlternative.data.inventory.length,1,'Failed detours neither erase nor duplicate prior rewards');
  reloadedAlternative.chooseRoute(encounters[0][0].id);
  assert.equal(reloadedAlternative.gateOpen(),true,'Returning to the solved route recovers the open exit');
  assert.equal(reloadedAlternative.goTo(1),true);

  // Normalize inconsistent local state without implying an anti-cheat boundary.
  const impossible=copy(fresh().data),last=13,lastRoute=encounters[last][1];
  impossible.level=last;impossible.inventory=['injected-item'];impossible.defense=100;
  impossible.rooms[last].route=lastRoute.id;
  impossible.rooms[last].gates[lastRoute.id]=true;
  impossible.rooms[last].phase='cleared';
  const repaired=fresh(impossible);
  assert.equal(repaired.data.level,0);
  assert.equal(repaired.completedCount(),0,'An unreachable future gate cannot grant a completed path');
  assert.deepEqual(copy(repaired.data.inventory),[]);
  assert.equal(repaired.data.defense,0);
  assert.equal(repaired.canVisit(last),false);
  const legacy=fresh({schema:2,level:13,cleared:Array(14).fill(true)});
  assert.equal(legacy.completedCount(),0,'Old story saves cannot silently grant dungeon equipment');
  assert.deepEqual(copy(legacy.data.inventory),[]);

  const summary={missions:14,choices:42,routes:solvedRoutes};
  console.log('Code Quest contracts passed: 14 interpreted missions, all 42 choices, all 28 route gates, failure/retry inventory, forward travel, and normalized reload state. Renderer loading is checked statically; 3D motion and runtime UI require browser QA.');
  return summary;
}

module.exports={runCodeQuestContracts};
if(require.main===module)runCodeQuestContracts();
