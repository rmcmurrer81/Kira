'use strict';
// 1. STORY DATA: change names, lines and choices here before editing behavior.
// x is left-to-right; y is top-to-bottom. Both are percentages of the stage.
// y marks the FEET, not the head. layer sets who appears in front.
const CAST = {
  mira: { name: 'Mira', shirt: '#367ba2', skin: '#d8a979' },
  sol: { name: 'Sol', shirt: '#bc6648', skin: '#a96f4c' }
};
const SCENES = {
  park: {
    title: 'A signal in the park', location: 'park', speaker: 'mira',
    description: 'A sunny park with a tree, green hill and small lantern between two friends.',
    line: 'Look, Sol! This old lantern still flickers. Should we fix it in the workshop, or take it to the rooftop and watch the sky?',
    audio: 'audio/park.wav',
    characters: [{id:'mira',x:30,y:78,facing:1,layer:3,pose:'wave'}, {id:'sol',x:70,y:78,facing:-1,layer:2,pose:'still'}],
    choices: [{text:'Visit the workshop',to:'workshop'}, {text:'Climb to the rooftop',to:'rooftop'}]
  },
  workshop: {
    title: 'A little repair', location: 'workshop', speaker: 'sol',
    description: 'A warm workshop with a window, workbench and lantern. Mira and Sol stand on either side.',
    line: 'The loose switch is fixed! We can share the warm light with our neighbors, or carry it upstairs for a quiet night of stars.',
    audio: 'audio/workshop.wav',
    characters: [{id:'mira',x:25,y:78,facing:1,layer:2,pose:'still'}, {id:'sol',x:75,y:78,facing:-1,layer:3,pose:'wave'}],
    choices: [{text:'Share the light',to:'ending-light'}, {text:'Watch the stars',to:'ending-stars'}]
  },
  rooftop: {
    title: 'Above the city', location: 'rooftop', speaker: 'mira',
    description: 'A safe flat rooftop beneath a moon and distant city skyline. Two friends stand by their lantern.',
    line: 'The city looks different from up here. We could stay and count the stars, or bring this little light back to our neighbors.',
    audio: 'audio/rooftop.wav',
    characters: [{id:'mira',x:34,y:78,facing:1,layer:3,pose:'wave'}, {id:'sol',x:67,y:78,facing:-1,layer:2,pose:'still'}],
    choices: [{text:'Stay and count stars',to:'ending-stars'}, {text:'Bring the light home',to:'ending-light'}]
  },
  'ending-light': {
    title: 'Ending: a light to share', location: 'workshop', speaker: 'sol',
    description: 'The workshop lantern glows beside Mira and Sol after their small adventure.',
    line: 'One little lantern gave us something to share. Tomorrow, let us invite everyone to make a lantern of their own. The end.',
    audio: 'audio/ending-light.wav',ending:true,
    characters: [{id:'mira',x:26,y:78,facing:1,layer:2,pose:'wave'}, {id:'sol',x:74,y:78,facing:-1,layer:3,pose:'wave'}],choices:[]
  },
  'ending-stars': {
    title: 'Ending: a sky to explore', location: 'rooftop', speaker: 'mira',
    description: 'A moonlit rooftop, a distant skyline and two friends enjoying their lantern and the sky.',
    line: 'We found no secret treasure, but we found time to wonder together. Tomorrow, we will draw the constellations we imagined. The end.',
    audio: 'audio/ending-stars.wav',ending:true,
    characters: [{id:'mira',x:35,y:78,facing:1,layer:3,pose:'still'}, {id:'sol',x:65,y:78,facing:1,layer:2,pose:'wave'}],choices:[]
  }
};
// 2. VALIDATE: a misspelled destination should be caught, not become a blank game.
function validateStory(scenes) {
  const errors=[];
  for (const [id,scene] of Object.entries(scenes)) {
    if (!['park','workshop','rooftop'].includes(scene.location)) errors.push(id+': unknown location');
    if (!CAST[scene.speaker]) errors.push(id+': unknown speaker');
    if (!scene.line || !Array.isArray(scene.choices)) errors.push(id+': missing line/choices');
    for (const choice of scene.choices || []) if (!Object.hasOwn(scenes,choice.to)) errors.push(id+': missing destination '+choice.to);
    for (const person of scene.characters || []) {
      if (!CAST[person.id] || person.x<10 || person.x>90 || person.y<55 || person.y>85 || ![1,-1].includes(person.facing)) errors.push(id+': unsafe character position or facing');
    }
  }
  return errors;
}
// 3. STATE: this page remembers only the current scene while it is open.
let currentId='park', voiceEnabled=false, audio=null, audioEpoch=0;
const $=id=>document.getElementById(id);
const stage=$('stage'), characters=$('characters'), choices=$('choices');
function setStatus(message) { $('audio-status').textContent=message; }
// 4. AUDIO: new navigation invalidates old play promises and stops the last line.
function stopAudio() {
  audioEpoch++;
  if (audio) { audio.pause(); audio.currentTime=0; audio=null; }
}
async function playLine() {
  stopAudio();
  if (!voiceEnabled) { setStatus('Voice is off. Turn it on, then choose Play voice line.'); return; }
  const token=audioEpoch, clip=new Audio(SCENES[currentId].audio);
  audio=clip;
  setStatus('Loading optional voice… Captions remain available.');
  clip.addEventListener('ended',()=>{ if(token===audioEpoch) setStatus('Voice finished. Captions remain available.'); });
  clip.addEventListener('error',()=>{ if(token===audioEpoch) setStatus('Voice file unavailable. Continue using the dialogue text.'); });
  try {
    await clip.play();
    if (token!==audioEpoch) { clip.pause(); return; }
    setStatus('Playing optional voice. Dialogue remains visible.');
  } catch (error) {
    if (token===audioEpoch) setStatus('Voice could not play. Check the local file or browser permission; text still works.');
  }
}
// 5. DRAW: original CSS stick figures, no downloaded avatar pictures.
function drawCharacter(person,speaker) {
  const info=CAST[person.id], actor=document.createElement('div');
  actor.className='character enter '+(person.pose==='wave'?'wave ':'')+(speaker===person.id?'speaking':'');
  actor.style.left=person.x+'%'; actor.style.bottom=(100-person.y)+'%'; actor.style.zIndex=person.layer;
  actor.style.setProperty('--shirt',info.shirt); actor.style.setProperty('--skin',info.skin); actor.style.setProperty('--facing',person.facing);
  const figure=document.createElement('div'); figure.className='figure';
  for(const part of ['head','torso','arm left','arm right','leg left','leg right']) { const piece=document.createElement('span');piece.className=part;figure.append(piece); }
  actor.append(figure);characters.append(actor);
}
// 6. TRANSITION: update location, people, dialogue and choices together.
function showScene(id,{speak=false,focus=true}={}) {
  if (!Object.hasOwn(SCENES,id)) { setStatus('That scene does not exist. Restart to continue.'); return false; }
  stopAudio(); currentId=id;
  const scene=SCENES[id];
  stage.className='stage '+scene.location+($('reduce-motion').checked?' no-motion':'');
  stage.setAttribute('aria-label',scene.description);
  $('scene-title').textContent=scene.title; $('scene-count').textContent=scene.ending?'THE END':'CHOOSE YOUR PATH';
  $('location-label').textContent=scene.location.toUpperCase()+' · scripted 2D scene';
  $('speaker').textContent=CAST[scene.speaker].name; $('line').textContent=scene.line;
  characters.replaceChildren();scene.characters.forEach(person=>drawCharacter(person,scene.speaker));
  choices.replaceChildren();
  // Capture the originating scene. A late click on an old button cannot transition again.
  scene.choices.forEach((choice,index)=>{
    const button=document.createElement('button');button.type='button';button.textContent=(index+1)+'. '+choice.text;
    button.addEventListener('click',()=>{if(currentId===id) showScene(choice.to,{speak:true});});choices.append(button);
  });
  if(scene.ending){const end=document.createElement('p');end.textContent='You reached an ending. Restart to try another path.';choices.append(end);}
  setStatus(voiceEnabled?'Voice ready. Play the line or choose a path.':'Text mode. Optional voice files are not required to play.');
  if(focus) $('scene-title').focus();
  if(speak && voiceEnabled) void playLine();
  return true;
}
// 7. CONTROLS: real buttons support mouse, touch, Tab and Enter.
$('restart').addEventListener('click',()=>showScene('park',{speak:false}));
$('voice').addEventListener('click',()=>{
  voiceEnabled=!voiceEnabled;stopAudio();$('voice').setAttribute('aria-pressed',String(voiceEnabled));$('voice').textContent='Voice: '+(voiceEnabled?'on':'off');
  setStatus(voiceEnabled?'Voice enabled. Choose Play voice line to start.':'Voice off. The story remains playable with captions.');
});
$('replay').addEventListener('click',()=>void playLine());
$('toggle-grid').addEventListener('click',()=>{const grid=$('grid');grid.hidden=!grid.hidden;$('toggle-grid').setAttribute('aria-pressed',String(!grid.hidden));});
$('reduce-motion').checked=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
$('reduce-motion').addEventListener('change',()=>{stage.classList.toggle('no-motion',$('reduce-motion').checked);});
document.addEventListener('keydown',event=>{
  if(event.repeat || event.ctrlKey || event.altKey || event.metaKey || ['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName) || event.target.isContentEditable) return;
  if(event.key.toLowerCase()==='r'){event.preventDefault();showScene('park');}
  else if(event.key==='1'||event.key==='2'){
    const choice=SCENES[currentId].choices[Number(event.key)-1];
    if(choice){event.preventDefault();showScene(choice.to,{speak:true});}
  }
});
const storyErrors=validateStory(SCENES);
if(storyErrors.length){$('scene-title').textContent='Story data needs a fix';setStatus(storyErrors.join('; '));}
else showScene('park',{focus:false}); // Never starts audio on initial page load.
