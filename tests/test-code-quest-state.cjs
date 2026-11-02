'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { create } = require('../docs/arcade/code-quest/quest-state.js');
const missions = Array.from({ length: 14 }, (_, index) => ({ quest: { reward: { id: 'reward-'+index, name: 'Equipment '+index }, defense: [4,9,13,19,26,32,39,46,53,61,68,76,86,100][index] } }));
const encounters = missions.map((_, index) => [
  { id: 'safe-'+index, kind: 'safe', label: 'Lit passage' },
  { id: 'hazard-'+index, kind: index % 2 ? 'detour' : 'ambush', label: 'Shadow passage' }
]);
const fresh = saved => create({ missions, encounters, saved });
const clone = value => JSON.parse(JSON.stringify(value));
let checks = 0;
const check = fn => { fn(); checks++; };

check(() => {
  const machine = fresh();
  assert.equal(machine.data.schema,3); assert.equal(machine.data.rooms.length,14);
  assert.equal(machine.completedCount(),0); assert.equal(machine.firstUnfinished(),0);
  assert.equal(machine.room().phase,'junction'); assert.equal(machine.activeRoute(),null);
  assert.equal(machine.gateOpen(),false); assert.equal(machine.solve(),false); assert.equal(machine.fail(),false);
  assert.equal(machine.canVisit(1),false); assert.equal(machine.goTo(1),false);
  const before=clone(machine.data); assert.equal(machine.chooseRoute('not-a-route'),false); assert.deepEqual(machine.data,before);
});

// Both paths through every room can be solved, with independent gates and no
// duplicate quest reward. Neither a wrong turn nor a failed code attempt advances.
for (let routeIndex=0;routeIndex<2;routeIndex++) check(() => {
  const machine=fresh();
  for(let index=0;index<14;index++) {
    const chosen=encounters[index][routeIndex], other=encounters[index][1-routeIndex];
    assert.equal(machine.data.level,index); assert.equal(machine.chooseRoute(chosen.id),true);
    assert.equal(machine.activeRoute(),chosen); assert.equal(machine.room().phase,'encounter');
    const inventory=machine.data.inventory.slice(), defense=machine.data.defense;
    assert.equal(machine.fail(),true); assert.equal(machine.room().attempts,1);
    assert.deepEqual(machine.data.inventory,inventory); assert.equal(machine.data.defense,defense);
    assert.equal(machine.gateOpen(),false); assert.equal(machine.goTo(index+1),false);
    const reloaded=fresh(clone(machine.data));
    assert.deepEqual(reloaded.data,machine.data); assert.equal(reloaded.gateOpen(),false);
    assert.equal(machine.solve(),true); assert.equal(machine.gateOpen(),true);
    assert.equal(machine.room().gates[other.id],false);
    assert.equal(machine.room().reward,'reward-'+index);
    assert.equal(machine.completedCount(),index+1); assert.equal(machine.data.inventory.length,index+1);
    assert.equal(machine.data.defense,missions[index].quest.defense);
    assert.equal(machine.solve(),true); assert.equal(machine.data.inventory.length,index+1);
    assert.equal(machine.retreat(),true); assert.equal(machine.room().phase,'junction');
    assert.equal(machine.gateOpen(),false); assert.equal(machine.goTo(index+1),false);
    assert.equal(machine.chooseRoute(other.id),true); assert.equal(machine.gateOpen(),false);
    assert.equal(machine.goTo(index+1),false); assert.equal(machine.solve(),true);
    assert.equal(machine.data.inventory.length,index+1); assert.equal(machine.data.setbacks,index+1);
    assert.equal(machine.retreat(),true); assert.equal(machine.chooseRoute(chosen.id),true);
    assert.equal(machine.gateOpen(),true); assert.equal(machine.data.setbacks,index+1);
    if(index<13)assert.equal(machine.goTo(index+1),true);
  }
  assert.equal(machine.firstUnfinished(),14); assert.equal(machine.data.defense,100);
  assert.equal(machine.canVisit(14),false); assert.equal(machine.goTo(0),true);
  assert.equal(machine.data.inventory.length,14); assert.equal(machine.data.setbacks,14);
  const dataReference=machine.data; assert.equal(machine.restart(),true); assert.equal(machine.data,dataReference);
  assert.equal(machine.data.inventory.length,0); assert.equal(machine.data.defense,0);
  assert.equal(machine.data.setbacks,0); assert.equal(machine.data.level,0);
});

check(() => {
  const machine=fresh(); machine.chooseRoute('hazard-0');
  assert.equal(machine.data.setbacks,1); machine.retreat(); machine.chooseRoute('hazard-0');
  assert.equal(machine.data.setbacks,1); machine.fail(); machine.setDraft('say("unfinished");');
  const loaded=fresh(clone(machine.data));
  assert.equal(loaded.activeRoute().id,'hazard-0'); assert.equal(loaded.room().phase,'encounter');
  assert.equal(loaded.room().attempts,1); assert.equal(loaded.data.drafts[0],'say("unfinished");');
  loaded.retreat(); assert.equal(loaded.activeRoute(),null); assert.equal(loaded.chooseRoute('safe-0'),true);
  loaded.solve(); assert.equal(loaded.data.inventory.length,1); assert.equal(loaded.data.setbacks,1);
  assert.deepEqual(fresh(clone(loaded.data)).data,loaded.data);
});

check(() => {
  const machine=fresh(); machine.chooseRoute('safe-0'); machine.solve(); machine.goTo(1);
  machine.chooseRoute('hazard-1'); machine.fail(); machine.goTo(0);
  machine.retreat(); assert.equal(machine.canVisit(1),false);
  machine.chooseRoute('hazard-0'); assert.equal(machine.canVisit(1),false);
  machine.fail(); assert.equal(machine.completedCount(),1); assert.equal(machine.data.inventory.length,1);
  assert.equal(machine.data.defense,4); machine.chooseRoute('safe-0'); assert.equal(machine.canVisit(1),true);
  machine.goTo(1); assert.equal(machine.activeRoute().id,'hazard-1'); assert.equal(machine.room().attempts,1);
});

check(() => {
  const corrupt=fresh().data;
  corrupt.level=100; corrupt.inventory=['injected']; corrupt.defense=100; corrupt.setbacks=999;
  corrupt.rooms[0]={route:'unknown',phase:'cleared',gates:{unknown:true,'safe-0':false},visited:['unknown'],reward:'injected',attempts:-99};
  corrupt.rooms[2]={route:'hazard-2',phase:'cleared',gates:{'hazard-2':true},visited:['hazard-2'],reward:'reward-2',attempts:9};
  const loaded=fresh(corrupt);
  assert.equal(loaded.data.level,0); assert.equal(loaded.completedCount(),0);
  assert.deepEqual(loaded.data.inventory,[]); assert.equal(loaded.data.defense,0); assert.equal(loaded.data.setbacks,0);
  assert.equal(loaded.room().phase,'junction'); assert.equal(loaded.room().attempts,0);
  assert.deepEqual(loaded.data.rooms[2],fresh().data.rooms[2]); assert.equal(Object.hasOwn(loaded.room().gates,'unknown'),false);
});

check(() => {
  const saved=fresh().data; saved.level=13;
  saved.rooms[0]={route:'safe-0',phase:'encounter',gates:{'safe-0':true,'hazard-0':'true'},visited:['safe-0','safe-0','bogus'],reward:'wrong',attempts:Infinity};
  saved.rooms[1]={route:'hazard-1',phase:'cleared',gates:{'safe-1':false,'hazard-1':false},visited:['hazard-1','hazard-1'],reward:'wrong',attempts:2};
  const loaded=fresh(saved);
  assert.equal(loaded.data.level,1); assert.equal(loaded.completedCount(),1); assert.equal(loaded.data.defense,4);
  assert.deepEqual(loaded.data.inventory,['reward-0']); assert.equal(loaded.data.rooms[0].reward,'reward-0');
  assert.equal(loaded.room().reward,null); assert.equal(loaded.room().phase,'encounter');
  assert.equal(loaded.gateOpen(),false); assert.equal(loaded.data.setbacks,1);
  assert.deepEqual(loaded.room().visited,['hazard-1']); assert.equal(loaded.data.rooms[0].attempts,0);
});

check(() => {
  const saved=fresh().data; saved.drafts=['x'.repeat(7000),42,null];
  const loaded=fresh(saved); assert.equal(loaded.data.drafts[0].length,6000); assert.equal(loaded.data.drafts[1],null);
  assert.equal(loaded.setDraft('y'.repeat(8000)),true); assert.equal(loaded.data.drafts[0].length,6000);
  assert.equal(loaded.setDraft(1),false); assert.equal(loaded.setDraft(null),true); assert.equal(loaded.data.drafts[0],null);
  for(const invalid of [-1,1.5,Infinity,'0',NaN])assert.equal(loaded.canVisit(invalid),false);
});

check(() => {
  for(const corrupt of [null,{},[],false,'garbage',{schema:2,level:13,cleared:Array(14).fill(true)},{schema:3,rooms:'bad',drafts:'bad',level:-1}]) {
    const loaded=fresh(corrupt); assert.equal(loaded.completedCount(),0); assert.equal(loaded.data.level,0);
    assert.equal(loaded.data.inventory.length,0); assert.equal(loaded.data.rooms.length,14);
    assert.ok(loaded.data.drafts.every(draft=>draft===null));
  }
  const empty=create(); assert.equal(empty.room(),null); assert.equal(empty.solve(),false); assert.equal(empty.chooseRoute('safe'),false);
  assert.equal(empty.canVisit(0),false); assert.equal(empty.setDraft('code'),false);
  const invalidRooms=fresh({schema:3,rooms:{0:{route:'safe-0',gates:{'safe-0':true}}}});
  assert.equal(invalidRooms.completedCount(),0);
});

check(() => {
  const c={window:{}}; vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../docs/arcade/code-quest/quest-state.js'),'utf8'),c);
  assert.equal(typeof c.window.CodeQuestState.create,'function');
  assert.equal(c.window.CodeQuestState.create({missions,encounters}).data.schema,3);
  // Duplicate equipment identifiers still produce a unique inventory list.
  const duplicate=create({missions:[missions[0],missions[0]],encounters:[encounters[0],encounters[0]]});
  duplicate.chooseRoute('safe-0');duplicate.solve();duplicate.goTo(1);duplicate.chooseRoute('safe-0');duplicate.solve();
  assert.deepEqual(duplicate.data.inventory,['reward-0']);
});
check(() => {
  const c={window:{}}; vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../docs/arcade/code-quest/missions.js'),'utf8'),c);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../docs/arcade/code-quest/encounters.js'),'utf8'),c);
  const actualMissions=c.window.CodeQuestMissions,actualEncounters=c.window.CodeQuestEncounters;
  assert.equal(actualMissions.length,14);assert.equal(actualEncounters.length,14);
  for(let routeIndex=0;routeIndex<2;routeIndex++) {
    let machine=create({missions:actualMissions,encounters:actualEncounters});
    for(let index=0;index<actualMissions.length;index++) {
      assert.equal(machine.chooseRoute(actualEncounters[index][routeIndex].id),true);
      assert.equal(machine.fail(),true);assert.equal(machine.gateOpen(),false);
      assert.equal(machine.solve(),true);assert.equal(machine.room().reward,actualMissions[index].quest.reward.id);
      machine=create({missions:actualMissions,encounters:actualEncounters,saved:clone(machine.data)});
      assert.equal(machine.gateOpen(),true);if(index<13)assert.equal(machine.goTo(index+1),true);
    }
    assert.equal(machine.completedCount(),14);assert.equal(machine.data.inventory.length,14);assert.equal(machine.data.defense,100);
    assert.equal(machine.data.setbacks,routeIndex===1?14:0);
  }
});
console.log('Code Quest state passed '+checks+' scenario groups, including both routes through all 14 rooms, recovery, reload, credit validation, and draft limits.');
