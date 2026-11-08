/* Shared dialogue is also the build-time source for lightweight bundled speech. */
(function(root,factory){const value=factory(typeof module==='object'&&module.exports?require('./core.js'):root.TownCore);if(typeof module==='object'&&module.exports)module.exports=value;else root.TownDialogue=value;})(typeof globalThis!=='undefined'?globalThis:this,function(C){'use strict';
const projectPlaces={yard:'Repair yard · Town center',lab:'Your lab · Town center',store:'Parts & Pieces · Town center',gardener:'Orchard Common · southwest',walker:'Lakeside Walk · northeast',neighbor:'East Village · southeast'};
const residents={yard:['Iris',['Good to see you! I’ve been tidying the repair yard. A clear bench makes a tricky problem feel smaller.','Thanks for stopping by. The delivery robot has become quite the local celebrity.','How is your workshop coming along? It’s fine to test one idea at a time.']],lab:['Evelyn',['Welcome back! You don’t need a project to stop in and say hello.','I put the kettle on while the instruments warmed up. Even engineers need a breather.','My favorite moment is when a failed test suddenly explains the whole problem.']],store:['Clerk',['Hello again! Browsing is welcome. You don’t need to buy anything today.','I’ve been sorting the resistor drawers. Small parts love to wander off.','Nice to see you. Your credits stay in your pocket until you choose a part.']],gardener:['Nora',['Hello! The garden is a lovely place to take a break between projects.','I’m checking the seedlings. Plants have their own timetable.','Thanks for stopping to chat. There’s always something new to notice here.']],walker:['Arthur',['Hi there! I’m taking the long way around town today.','A little walk often helps me untangle a problem.','I’m happy to have some company. Thanks for stopping by.']],neighbor:['Sam',['Hello, neighbor! How is the workshop treating you?','I like watching the town change one small improvement at a time.','Come back for a chat whenever you like.']]};
const projectLocation=j=>`${j.who} · ${projectPlaces[j.place]||j.place}`;
const projectType=j=>j.category==='personal'?'Personal lab upgrade':'Paid town job';
const board='New campaign projects come first. Later, the mixed board spaces out familiar topics. You can always revisit a completed bench for unpaid practice.';
const intro='Our delivery robot bumps into boxes. Its distance sensor is broken. Can you replace it and program a safe stopping rule?';
const store='Each finished project opens a new shelf. Parts cost credits. Paid town jobs fund your supplies and personal lab upgrades; you do not get paid for upgrading your own lab. The main path funds every required part without grinding. These are virtual purchases only.';
const test='Sound check. Byte and Bolt voices are ready.';
const parts=j=>`This project needs the ${C.items[j.part].name}. The unlocked store shelf has it for ${C.items[j.part].price} credits.`;
const noWork=next=>next?`I don’t have a new project for you right now. ${next.who} has the next project: ${next.short}, a ${projectType(next).toLowerCase()}. You can still revisit completed work on the project board.`:'There is no new campaign work here right now. All town projects are complete. The project board still has mastery practice and repeat service contracts.';
function conversation(place,turn,completed){
 const [who,lines]=residents[place]||residents.neighbor,next=C.jobs[completed.length],local=next&&next.place===place;
 let text=lines[turn%lines.length];
 if(place==='yard'&&completed.includes('robot'))text+=' Your repair is keeping the delivery robot busy.';
 if(place==='lab'&&completed.includes('light'))text+=' Those workshop lights make the room feel welcoming.';
 if(local)text+=` When you’re ready, we can work on ${next.short}.`;
 else if(place!=='store')text+=next?` I don’t have a new job for you at the moment. ${projectLocation(next)} is where to find ${next.short}. Please come back and see me later.`:' I don’t have a new campaign job today. Come back for a chat anytime, or try the mixed board.';
 return {who,text,local};
}
// Only split at sentence boundaries followed by an uppercase letter; decimals stay intact.
const segments=text=>text.trim().split(/(?<=[.!?])\s+(?=[A-Z])/);
function allText(){
 const lines=[board,intro,store,test];
 for(const j of C.jobs){lines.push(parts(j),noWork(j));for(let round=0;round<=48;round++)lines.push(C.challenge(j.id,round).brief);}
 lines.push(noWork(null));
 for(let n=0;n<=C.jobs.length;n++)for(const place of Object.keys(residents))for(let turn=0;turn<3;turn++)lines.push(conversation(place,turn,C.jobs.slice(0,n).map(j=>j.id)).text);
 return [...new Set(lines)];
}
return {residents,projectLocation,board,intro,store,test,parts,noWork,conversation,segments,allText};
});
