'use strict';
/* Protect the learner tutorial while allowing a separately playable arcade edition. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const docs=path.resolve(__dirname,'../docs');
const file=(p)=>fs.readFileSync(path.join(docs,p));
const text=(p)=>file(p).toString('utf8');
const html=text('arcade/index.html');
const play=text('arcade/little-signal/index.html');
const game=text('arcade/little-signal/game.js');
const tutorialGame=text('tutorials/story-game/game.js');
assert.equal(game,tutorialGame,'Arcade must start as an independent exact game-code copy');
assert.equal(text('arcade/little-signal/style.css'),text('tutorials/story-game/style.css'),'Arcade must start with its own exact style copy');
const scenes=['park','workshop','rooftop','ending-light','ending-stars'];
for(const scene of scenes){
  const relative='audio/'+scene+'.wav';
  assert.ok(game.includes(relative),'Missing local audio reference: '+relative);
  const a=file('arcade/little-signal/'+relative),b=file('tutorials/story-game/'+relative);
  assert.equal(createHash('sha256').update(a).digest('hex'),createHash('sha256').update(b).digest('hex'),'Audio mismatch: '+relative);
}
assert.match(html,/href="little-signal\/"/);
assert.match(html,/href="\.\.\/tutorials\/story-game\/"/);
assert.match(play,/href="\.\.\/\.\.\/tutorials\/story-game\/"/);
for(const id of ['scene-title','stage','characters','grid','speaker','line','audio-status','choices','restart','voice','replay','toggle-grid','reduce-motion'])assert.ok(play.includes('id="'+id+'"'),'Missing playable control '+id);
assert.match(play,/src="game\.js"/);
assert.match(play,/href="style\.css"/);
assert.match(play,/href="theme\.css/);
assert.match(html,/src="\.\.\/labs\.js\?v=20261101-iris-float4"/);
assert.match(play,/src="\.\.\/\.\.\/labs\.js\?v=20261101-iris-float4"/);
assert.ok(fs.existsSync(path.join(docs,'tutorials/story-game/starter.zip')),'Original downloadable tutorial must remain');
assert.match(text('index.html'),/href="arcade\/"/);
assert.match(text('tools-apps.html'),/href="arcade\/"/);
assert.match(text('labs.js'),/new URL\('arcade\/'/);
assert.match(text('sitemap.xml'),/https:\/\/kiralabs\.org\/arcade\/little-signal\//);
console.log('Arcade integrity passed: dedicated landing, playable edition, original tutorial, five intact voice recordings and links.');
