/* Review-only regression checks. Uses the original answer() closure and the
 * complete, already-loaded knowledge. No provider calls, messages or storage. */
(function(root){
 'use strict';
 const combined=[
  'what are some movies and tv shows he has been in',
  'what is some of the movies and tv shows he has been in',
  'What movies and TV shows has Robert appeared in?',
  'Can you list his movie and TV credits?',
  'What has he acted in?',
  'is he in the entertainment industry'
 ];
 const films=['What movies has he been in?','Which films has Robert worked on?'];
 const television=['Which TV shows has he appeared in?','And his TV work?'];
 const prefixes=[[],['Write a mini bio of Robert'],['Write a mini bio of Robert','Which books has Robert written?'],['Write a mini bio of Robert','Tell me about Kira World'],['Write a mini bio of Robert','How do I install ShiftBrief?'],['Write a mini bio of Robert','Tell me about his AI work']];
 function run({knowledge,ask,reset}){
  const t=knowledge.topics.find(x=>x.id==='entertainment');
  if(!t)throw Error('The original entertainment topic is missing.');
  const results=[];
  function check(question,prefix,facet){
   reset();for(const p of prefix)ask(p);
   const reply=ask(question),expected=facet==='overview'?t.answer:t.followups?.[facet]?.answer;
   const passed=reply.id==='entertainment'&&reply.answer===expected&&(reply.sources||[]).includes('credits');
   results.push({question,after:prefix,expectedFacet:facet,passed});
  }
  for(const prefix of prefixes){for(const q of combined)check(q,prefix,'overview');for(const q of films)check(q,prefix,'films');for(const q of television)check(q,prefix,'television');}
  reset();ask('Who is Tom Hanks?');let reply=ask(combined[0]);
  results.push({question:'Pronoun after a different named person',passed:reply.id!=='entertainment'&&!reply.answer.includes('Blood Tulip')});
  reset();ask('Who is Tom Hanks?');ask('Write a mini bio of Robert');reply=ask(combined[0]);
  results.push({question:'Explicitly return to Robert',passed:reply.id==='entertainment'&&reply.answer===t.answer});
  reset();reply=ask('What is a digital twin.');
  results.push({question:'Digital Twin reviewed extension',passed:reply.id==='digital-twin-current'&&Boolean(reply.title)&&Boolean(reply.answer)&&Array.isArray(reply.sources)&&reply.sources.includes('iris-digital-twin-current')});
  reset();reply=ask('What is Healthspan Lab?');
  results.push({question:'Healthspan reviewed extension',passed:reply.id==='healthspan-current'&&Boolean(reply.title)&&Boolean(reply.answer)&&Array.isArray(reply.sources)&&reply.sources.includes('iris-healthspan-current')});
  const failed=results.filter(x=>!x.passed);
  return {version:'2026-09-21-routing-2',scope:'Actual original answer function with complete published knowledge plus reviewed public extensions, inside this preview',total:results.length,passed:results.length-failed.length,failed,results};
 }
 const api=Object.freeze({run,combined,films,television,prefixes});
 if(typeof module==='object'&&module.exports)module.exports=api;else root.KiraIrisRoutingChecks=api;
})(typeof window!=='undefined'?window:globalThis);
