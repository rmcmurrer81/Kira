/* Dated public project retrieval. Browser-only; no model calls or chat storage.
 * This layer never searches private repositories at runtime. Its only input is
 * the reviewed, hash-checked public summary distributed with the website.
 */
(function(root){
  'use strict';
  const IDS=['newbrain','ideaforge','humanoid-researcher','world','bluebook'];
  const FACETS=['overview','status','how','technical','evidence','privacy','limits','cost'];
  const normalize=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/[’']/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  // Remove only conversational framing, never a factual clause or instruction.
  function normalizeQuestion(s){
    return normalize(s).replace(/^(?:hi|hello|hey)(?: iris)?\b\s*/,'').replace(/^iris\s+(?=(?:what|how|does|can|tell|please)\b)/,'').replace(/^(?:im|i am) new here\b\s*/,'').replace(/^(?:okay|ok|so|switching gears)\b\s*/,'');
  }
  const includes=(q,s)=>(' '+q+' ').includes(' '+normalize(s)+' ');
  const unique=xs=>[...new Set(xs)];
  function validate(data){
    const assert=(ok,message)=>{if(!ok)throw Error('Public project notes: '+message);};
    assert(data?.schema_version===1&&/^\d{4}-\d{2}-\d{2}\.\d+$/.test(data.content_version),'invalid version');
    assert(/^\d{4}-\d{2}-\d{2}$/.test(data.reviewed_on)&&data.content_version.startsWith(data.reviewed_on),'invalid review date');
    assert(Array.isArray(data.projects)&&data.projects.length===IDS.length,'incomplete project set');
    const seen=new Set();
    for(const p of data.projects){
      assert(IDS.includes(p.id)&&!seen.has(p.id),'invalid project');seen.add(p.id);
      assert(typeof p.title==='string'&&p.title.length<100,'invalid title');
      assert(Array.isArray(p.aliases)&&p.aliases.length&&p.aliases.every(a=>typeof a==='string'&&a.length>=5&&a.length<80),'invalid aliases');
      assert(p.source==='knowledge.html#'+(p.id==='world'?'kira-world':p.id),'invalid visitor source');
      for(const key of FACETS)assert(typeof p[key]==='string'&&p[key].trim()&&p[key].length<3000,'missing '+key);
    }
    return data;
  }
  function prepare(k,data){
    validate(data);k.iris_projects=data;k.updated_at=data.reviewed_on;
    for(const p of data.projects){
      const source='iris-current-'+p.id;
      k.sources[source]={label:p.title+' · reviewed '+data.reviewed_on,url:p.source};
      const t={id:p.id,title:p.title,answer:p.overview,label:'REVIEWED PROJECT NOTES · '+data.reviewed_on,
        project_names:p.aliases,terms:p.aliases,sources:[source],coverage:{},next:suggestions(p),
        followups:Object.fromEntries(FACETS.filter(f=>f!=='overview').map(f=>[f,{answer:p[f],sources:[source]}]))};
      const i=k.topics.findIndex(t=>t.id===p.id);if(i<0)k.topics.push(t);else k.topics[i]=t;
    }
    // The current project answers replace old claims, including legacy pack routes.
    // Biography, credits, book records and other projects remain untouched.
    if(k.public_packs){
      k.public_packs.facts=k.public_packs.facts.filter(f=>!f.subject_ids.some(id=>IDS.includes(id)));
      const facts=new Set(k.public_packs.facts.map(f=>f.id));
      k.public_packs.routes=k.public_packs.routes.filter(r=>!IDS.includes(r.subject_id)&&r.fact_ids.every(id=>facts.has(id)));
      for(const t of k.topics)for(const [intent,ids] of Object.entries(t.coverage||{}))t.coverage[intent]=ids.filter(id=>facts.has(id));
    }
    return k;
  }
  function suggestions(p){return ['What is the current status of '+p.title+'?','What has been tested in '+p.title+'?','What are the limits of '+p.title+'?'];}
  // Restricted Damerau-Levenshtein: one insertion/deletion/substitution or adjacent
  // transposition, only on distinctive project names. No fuzzy factual matching.
  function oneEdit(a,b){
    if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;
    if(a.length===b.length){const diff=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])diff.push(i);
      return diff.length===1||(diff.length===2&&diff[1]===diff[0]+1&&a[diff[0]]===b[diff[1]]&&a[diff[1]]===b[diff[0]]);}
    if(a.length>b.length)[a,b]=[b,a];
    let i=0,j=0,skips=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;}else{if(++skips>1)return false;j++;}}
    return true;
  }
  function detect(projects,q){
    const exact=projects.filter(p=>p.aliases.some(a=>includes(q,a)));
    const words=q.split(' '),corrections=[];
    const fuzzy=projects.filter(p=>!exact.includes(p)&&p.aliases.some(alias=>{
      const target=normalize(alias),count=target.split(' ').length;
      if(target.replace(/ /g,'').length<7)return false;
      for(let i=0;i<=words.length-count;i++){
        const sample=words.slice(i,i+count).join(' ');
        if(sample.length>=7&&oneEdit(sample,target)){corrections.push({id:p.id,from:sample,to:normalize(p.title)});return true;}
      }return false;
    }));
    return {matches:projects.filter(p=>exact.includes(p)||fuzzy.includes(p)),corrected:fuzzy.length>0,correction:corrections[0],corrections,ambiguous:corrections.some((c,i)=>corrections.some((other,j)=>i!==j&&c.from===other.from&&c.id!==other.id))};
  }

  function intent(q){
    // Correct a few common question typos only; never transform project facts.
    q=q.replace(/\bstauts\b|\bsttus\b/g,'status').replace(/\bprivcy\b|\bprivacey\b/g,'privacy').replace(/\btes?tted\b/g,'tested').replace(/\barchitecure\b/g,'architecture');
    if(/\b(?:plasticity|damage recovery|recovers? from damage|recover from damage|lesion|sham)\b/.test(q))return 'evidence';
    if(/\b(conscious|consciousness|sentient|sentience|human brain|certified|certification|proven|guarantee|guaranteed|safe(?:ty)?|risks?|manufactur\w*|alien proof|extraterrestrial proof|replace qwen|replaces qwen|real brain)\b/.test(q)||/\b(?:turn|make|build)\b.*\bworking (?:robot|invention)\b/.test(q))return 'limits';
    if(/(?:how (?:do|can|should)|can|could) i (?:run|start|install|set up)|(?:setup|installation) requirements|\b(?:mac|macos|linux|windows)\b/.test(q))return 'technical';
    if(/\b(?:what|which) (?:local )?models?\b|\bmodels?\b.*\b(?:use|uses|powers|powering)\b/.test(q))return 'technical';
    if(/\b(tests?|tested|testing|fixtures?|benchmark|benchmarks|measured|evidence|validation|validated|results?|reproducible|ran|unrun)\b/.test(q))return 'evidence';
    if(/\b(privacy|private|security|permissions?|data handling|offline|local|cloud|internet|online|storage|stored|saved data|chat history)\b|\b(?:send|save|store|share|record|transmit|collect|keep)\b.*\b(?:my|your|our|questions|data|chat|details|history)\b/.test(q))return 'privacy';
    if(/\b(limits?|limitations?|boundaries|boundary|cannot|cant|unsupported|not do|not yet)\b/.test(q))return 'limits';
    if(/\b(cost|costs|price|pricing|subscription|free|paid|pay|license|licence)\b/.test(q))return 'cost';
    if(/\b(status|progress|ready|finished|available|availability|download|install|release|released|launch|latest|current|new|update|updates|changed|done|implemented)\b|works (?:now|today)|working (?:now|today)|can i (?:actually )?(?:try|use|access|talk|speak|chat)|when (?:can|will)/.test(q))return 'status';
    if(/\b(architecture|technical|implementation|models?|algorithms?|hardware|requirements|dependencies|built with|language|database|blender|pytorch|pybullet|windows)\b/.test(q))return 'technical';
    if(/how (?:does|do|would|will|is|are|can)|how .*work|how it works|\b(workflow|capabilities|features|purpose|used for|useful|benefits)\b|what (?:can|does|do) .+ do\b/.test(q))return 'how';
    if(/^(?:and\s+)?(?:tell me more|more(?: details?)?|what else|go deeper|expand|explain further)\b/.test(q))return 'details';
    return 'overview';
  }
  function reply(p,facet,data){
    return {id:p.id,title:p.title+' · '+(facet==='overview'?'overview':facet==='how'?'how it works':facet),answer:p[facet],
      facet,label:'REVIEWED PROJECT NOTES · '+data.reviewed_on,sources:['iris-current-'+p.id],next:suggestions(p),
      retrieval:{content_version:data.content_version,subject_ids:[p.id],intent:facet,reviewed_on:data.reviewed_on}};
  }
  function clarify(projects,text,id='iris-project-clarification'){
    return {id,title:'Which project do you mean?',answer:text,label:'CLARIFY THE PROJECT',sources:projects.map(p=>'iris-current-'+p.id),next:projects.map(p=>'Tell me about '+p.title)};
  }
  function answer(k,question,lastTopic,exchanges,legacy){
    const data=k.iris_projects;if(!data)return null;
    const originalQuestion=normalizeQuestion(question),found=detect(data.projects,originalQuestion);
    const q=(found.corrections||[]).reduce((s,c)=>s.replace(c.from,c.to),originalQuestion);
    let projects=found.matches;
    // A longer retained concept wins over a shorter embedded current alias.
    if(projects.length===1){
      const retained=k.topics.find(t=>!IDS.includes(t.id)&&[...(t.project_names||[]),...(t.concept_names||[])].some(a=>includes(q,a)&&projects[0].aliases.some(short=>normalize(a)!==normalize(short)&&includes(normalize(a),short))&&!projects[0].aliases.some(short=>includes(q.replace(normalize(a),''),short))));
      if(retained){const selected=intent(q);return {...retained,...(retained.followups?.[selected]||{}),facet:selected};}
    }
    const previous=data.projects.find(p=>p.id===lastTopic);
    let intentText=q;
    for(const p of projects)for(const alias of [...p.aliases].sort((a,b)=>b.length-a.length))intentText=intentText.replace(normalize(alias),'it');
    const facet=intent(intentText);
    if(/\b(ignore|pretend|fabricate|invent|secret|password|api secret)\b|\bmake up\b/.test(q))return null;
    const globalStatus=/^(?:(?:what is|whats|show me|give me)\s+)?(?:the\s+)?(?:current\s+|latest\s+)?(?:status|progress|updates?)(?: today| now)?$|^where do things stand$/.test(q);
    if(!projects.length&&((!previous&&globalStatus)||/^(?:what|which|show|list|tell me about)\b.*\b(projects|research apps|research tools)\b|^what (?:works|is working) (?:now|today)\b|^what is kira labs working on$/.test(q))){
      return {id:'iris-project-list',title:'Current project notes',answer:'These are dated summaries reviewed on '+data.reviewed_on+', not live runtime readings.\n\n'+data.projects.map(p=>p.title+': '+p.status).join('\n\n')+'\n\nShiftBrief, Video Studio and Sarah Travel retain their separate published project pages.',label:'REVIEWED PROJECT NOTES · '+data.reviewed_on,sources:['iris-knowledge','iris-projects'],next:['Tell me about NewBrain','Tell me about IdeaForge','Tell me about Kira World']};
    }
    if(found.ambiguous)return clarify(projects,'That spelling could refer to more than one project. Please choose the one you mean.');
    if(!projects.length){
      const legacyNamed=k.topics.some(t=>!IDS.includes(t.id)&&[...(t.project_names||[]),...(t.concept_names||[])].some(a=>includes(q,a))&&(['labs','studio','travel','shiftbrief','poetry','driving','home','notebook-worlds','temporary-creator','vr'].includes(t.id)||(!/\b(it|its|that|this|they|their)\b/.test(q)&&/\b(?:about|what is|what are|whats|explain|describe)\b/.test(q))));
      const personal=/\b(robert|mcmurrer|books?|movies?|films?|tv|television|filmography|biography|bio|entertainment|he|his|him|she|her|healthspan|digital twin|synthetic robert|iris|website guide|contact|email)\b/.test(q);
      const followup=/\b(it|its|that|this|they|their|them)\b|^(?:and\b|tell me more\b|more\b|what else\b|go deeper\b|expand\b|explain further\b)/.test(q)||/^(?:status|privacy|cost|price|evidence|tests|limits|architecture|what changed|whats new|what has (?:actually )?been tested|what is the current status|what is the status|how does it work|what are (?:the )?(?:risks?|limits?|limitations?)(?: and (?:risks?|limits?|limitations?))?|tell me about the (?:architecture|privacy|cost|status|evidence|limits)|has the plasticity campaign run|is the project ready|is there a public release)\s*$/.test(q);
      // An explicit new subject must never silently inherit a previous project.
      // In a known limits question, "aliens are real" is the claim being
      // questioned, not a new project named "real". Keep the actual question
      // subject for the unknown-subject guard; the answer still denies proof.
      const subjectQuestion=facet==='limits'?q.replace(/\b(?:aliens|extraterrestrial life) (?:is|are) real\b/g,''):q;
      const withoutArticles=subjectQuestion.replace(/\b(about|of|for|is|are|does|do|has|have|can|could|will|would) (?:the|a|an) /g,'$1 ');
      const contextualSubject=/^(?:it|its|that|this|they|them|their|i|me|you|us|users|my|your|our|there|project|code|data|plasticity|dialogue|experiments|campaign|research|blueprints|privacy|security|cost|costs|price|pricing|limits|limitations|risks|risk|status|evidence|tests|architecture|hardware|technical|models|voice|current|latest|been|not|for|with|to|now|today|next)$/;
      const newSubject=[...withoutArticles.matchAll(/\b(?:about|of|for|is|are|does|do|has|have|can|could|will|would)\s+([a-z]+)/g)].some(m=>!contextualSubject.test(m[1]))||/^(?:and\s+)?(?:what (?:is|are) )?(?!and\b|what\b|how\b|is\b|does\b|has\b|can\b|will\b|its\b|their\b|the\b|current\b|latest\b)([a-z]+)\s+(?:privacy|status|cost|price|pricing|limits|evidence)\b/.test(withoutArticles);
      if(newSubject&&(previous||lastTopic.startsWith('compare:')||followup)&&!legacyNamed&&!personal)return {...clarify([], 'I do not have reviewed project notes for that subject. Which project or documented detail would you like to explore?'),title:'That subject is not in these project notes',label:'LIMIT OF THE REVIEWED NOTES'};
      if(lastTopic.startsWith('compare:')&&followup&&!legacyNamed&&!personal){
        const choices=lastTopic.slice(8).split(',').map(id=>data.projects.find(p=>p.id===id)).filter(Boolean);
        if(choices.length)return clarify(choices,'The previous answer covered '+choices.map(p=>p.title).join(' and ')+'. Choose one so I can give the right follow-up.',lastTopic);
      }
      if(!previous&&(!lastTopic||lastTopic==='iris-project-list'||lastTopic==='iris-project-clarification')&&followup&&!personal&&!legacyNamed)return clarify(data.projects,'Please choose a project first so I can answer that follow-up from the right notes.');
      if(previous&&followup&&!legacyNamed&&!personal&&!newSubject)projects=[previous];
      else if(/\b(?:researcher|brain project|research project|blue book|idea forge)\b/.test(q)&&!personal)return clarify(data.projects,'I have separate notes for NewBrain, IdeaForge, Humanoid Researcher, Kira World and BlueBook. Which one would you like?');
      else if(facet==='status'&&legacy?.id==='status'&&!legacyNamed&&!personal)return clarify(data.projects,'I do not have a reviewed status for that subject. Please choose a documented project.');
      else return null;
    }
    const clauses=intentText.split(/\s+(?:and|also|plus)\s+/).map(s=>s.trim()).filter(c=>c&&!/^(?:compare )?it$/.test(c));
    const facets=unique(clauses.map(intent).filter(f=>f!=='overview'&&f!=='details'));
    if(projects.length>1){
      const chosen=facet==='details'?'overview':facet;
      const correction=found.corrected?'I matched the project spelling to '+found.corrections.map(c=>projects.find(p=>p.id===c.id).title).join(' and ')+'.\n\n':'';
      return {id:'compare:'+projects.map(p=>p.id).join(','),title:projects.map(p=>p.title).join(' and '),answer:correction+projects.map(p=>p.title+': '+(facets.length>1?facets.map(f=>f[0].toUpperCase()+f.slice(1)+': '+p[f]).join('\n\n'):p[chosen])).join('\n\n'),facet:facets.length>1?'compound':chosen,facets:facets.length>1?facets:undefined,label:'REVIEWED PROJECT NOTES · '+data.reviewed_on,sources:projects.map(p=>'iris-current-'+p.id),next:projects.map(p=>'Tell me about '+p.title)};
    }
    const p=projects[0];let selected=facet;
    // Answer each documented facet of a compound question using the same
    // project's reviewed text. Unknown clauses are acknowledged, not guessed.
    if(clauses.length>1&&facets.length&&(facets.length>1||clauses.some(c=>intent(c)==='overview'))){
      const r=reply(p,facets[0],data);
      r.facets=facets;r.facet='compound';r.retrieval.intent=facets.join('+');
      r.title=p.title+' · '+facets.join(' and ');
      r.answer=facets.map(f=>(f==='how'?'How it works':f[0].toUpperCase()+f.slice(1))+': '+p[f]).join('\n\n');
      if(clauses.some(c=>intent(c)==='overview'))r.answer+='\n\nI do not have a reviewed answer to the other part of that question.';
      if(found.corrected)r.answer='I matched that name to '+p.title+'.\n\n'+r.answer;
      return r;
    }
    if(p.id==='world'&&selected==='overview'&&/\bavatar builder\b/.test(q))selected='technical';
    if(p.id==='world'&&selected==='overview'&&/\b(?:world builder|world shell)\b/.test(q))selected='how';
    if(selected==='details'){
      const used=new Set(exchanges.filter(e=>e.reply.id===p.id).flatMap(e=>e.reply.facets||[e.reply.facet]));
      selected=['how','status','evidence','technical','limits','privacy','cost'].find(f=>!used.has(f));
      if(!selected)return {...reply(p,'overview',data),title:p.title+' · available detail',facet:'exhausted',answer:'We have covered the reviewed project notes for '+p.title+'. I do not have another verified layer to add. Choose a specific question or read the dated source notes.',label:'LIMIT OF THE REVIEWED NOTES'};
    }
    if(selected==='overview'){
      let rest=q;for(const a of [...p.aliases].sort((a,b)=>b.length-a.length))rest=rest.replace(normalize(a),'');
      // These anchored presentation modifiers add no factual premise. Do not
      // strip arbitrary tails such as "and say it won a Nobel prize".
      rest=normalize(rest).replace(/\s+please$/,'').replace(/\s+(?:in (?:plain english|simple terms|simple language)|without jargon|briefly|simply)$/,'').replace(/\b(?:it|that project|this project)\b/g,'');
      const intro=/^(?:(?:please|can you|could you|would you)\s+)?(?:what is|whats|who is|tell me about|explain|describe|overview of|introduce|and|what about)?\s*(?:the project|project)?\s*$/.test(normalize(rest));
      if(!intro)return {...reply(p,'overview',data),title:p.title+' · not documented',facet:'unknown',answer:'I do not have a reviewed answer to that specific question about '+p.title+'. I can explain its purpose, current status, technical approach, test evidence and limits. I should not infer an answer from another project.',label:'LIMIT OF THE REVIEWED NOTES'};
    }
    const r=reply(p,selected,data);
    if(found.corrected)r.answer='I matched that name to '+p.title+'.\n\n'+r.answer;
    return r;
  }
  const api=Object.freeze({validate,prepare,answer,normalize,normalizeQuestion,detect,intent,oneEdit});
  if(typeof module==='object'&&module.exports)module.exports=api;else root.KiraIrisProjects=api;
})(typeof window!=='undefined'?window:globalThis);
