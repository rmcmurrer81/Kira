/* Public-site selection and the approved Iris name.
 * The original knowledge is validated BEFORE this presentation policy is applied.
 * It is not a replacement answer bank. Books, credits and retained facts stay intact.
 */
(function(root){
  'use strict';
  const excluded = /\b(?:ClearTrail|Clear Trail|CutBrief|Cut Brief|Kira Sequence Desk|Production Director|Carry On)\b|cleartrail|cutbrief|sequence-desk|production-director|carry-on/i;
  const excludedIds = new Set(['cleartrail','carry-on','carry_on','carryon','sequence-desk','sequence_desk','cutbrief','director','production-director','production_director']);
  const contactSource = {label:'Send Robert a message',url:'contact.html#direct-contact'};
  const norm = s=>String(s||'').toLowerCase().normalize('NFKC').replace(/[’']/g,'').replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  const clone = x=>JSON.parse(JSON.stringify(x));
  const rename = text=>String(text||'')
    .replace(/\b(?:website|site)[’']?s? Sarah\b/gi,'website guide Iris')
    .replace(/\bSarah(?:[’']s)? (?:website|site) guide\b/gi,'Iris, the website guide')
    .replace(/\bHi, I[’']m Sarah\b/g,'Hi, I’m Iris')
    .replace(/\bSarah is speaking\b/g,'Iris is speaking')
    .replace(/Prepare an email/gi,'Send a message');
  function cleanText(text){
    if(typeof text!=='string')return text;
    // Remove only sentences promoting the projects the owner excluded.
    if(!excluded.test(text))return rename(text);
    return rename(text.split(/(?<=[.!?])\s+|\n\n+/).filter(s=>!excluded.test(s)).join(' ').trim());
  }
  function moveURL(value){
    if(typeof value!=='string')return value;
    let u=value.replace(/^https:\/\/kiralabs\.org\//,'');
    const maps={
      'index.html#reality':'kira-world.html#reality','index.html#technical':'kira-world.html',
      'index.html#support':'support.html','index.html#worlds':'kira-world.html',
      'projects.html#kira-world':'kira-world.html','projects.html#shiftbrief':'shiftbrief.html',
      'projects.html#video-studio':'video-studio.html','projects.html#sarah-travel':'sarah-travel.html',
      'projects.html#current-prototypes':'projects.html'
    };
    if(maps[u])return maps[u];
    if(/(?:github\.com|raw\.githubusercontent\.com)/i.test(value)&&!/(?:releases\/(?:download|tag))/.test(value)){
      if(/shiftbrief/i.test(value))return 'shiftbrief.html#install';
      if(/sarah-travel/i.test(value))return 'sarah-travel.html';
      if(/knowledge\.html|technical/i.test(value))return 'updates.html#studio-tests-2026-09';
      if(/progress-data|progress\.html|\/commit\//i.test(value))return 'updates.html';
      return 'knowledge.html';
    }
    if(/(?:sarah-knowledge|knowledge-index|progress-data)\.json/.test(u)||/\.(?:js|py|json)(?:[?#]|$)/i.test(u))return 'knowledge.html';
    return value;
  }

  // Resolve the person independently of the last product/topic. No new factual
  // answers live here: every credit reply comes from the validated public topic.
  function personReference(question,k){
    const q=norm(question);
    if (/\brobert\s+(?!mcmurrer\b|is\b|was\b|has\b|had\b|does\b|did\b|and\b|or\b|in\b|on\b|for\b|from\b|about\b|work\b|worked\b|appear\b|appeared\b|act\b|acted\b|play\b|played\b|been\b|as\b|do\b|wrote\b|written\b|the\b)(?:[a-z]+)\b/.test(q)) return 'other';
    if (/\broberts?\b|\bmcmurrers?\b/.test(q))return 'robert';
    // A named subject in a credit question must never inherit Robert's credits.
    const named=q.match(/\b(?:has|had|was|is|did|does)\s+([a-z]+(?:\s+[a-z]+){0,2}?)\s+(?:been|appeared|acted|worked|played|starred|won)\b/);
    if(named&&!/^(?:he|she|it|they|this person|the founder|the creator|the developer)$/.test(named[1]))return 'other';
    const about=q.match(/^(?:who is|who was|tell me about|what about)\s+(.+?)\s*$/);
    if(about){
      const subject=about[1];
      if(/^(?:him|her|them|it|this|that|his|her|their)\b/.test(subject))return null;
      const known=k.topics.some(t=>[t.title,...(t.project_names||[]),...(t.concept_names||[]),...(t.terms||[])].some(x=>norm(x)===subject)) ||
        (k.book_catalogue||[]).some(b=>norm(b.title)===subject);
      if(!known&&/^[a-z]+(?:\s+[a-z]+){0,3}$/.test(subject)&&
        !/\b(?:more|work|credits|books|movies|films|shows|television|tv|ai|models|model|voice|privacy|projects|acting|entertainment|memory|home|world|worlds|creator|founder|author|writing|artificial|intelligence)\b/.test(subject))return 'other';
    }
    return null;
  }
  function resolvePerson(k,question,lastTopic,exchanges){
    const direct=personReference(question,k);if(direct)return direct;
    if(!/\b(?:he|his|him|she|her|hers|they|their|them)\b/.test(norm(question)))return lastTopic==='entertainment'?'robert':null;
    // This guide's opening page explicitly introduces Robert. A fresh "he"
    // about screen work refers to him unless another person was introduced.
    let person='robert';
    for(const e of exchanges||[]){
      const named=personReference(e.question||'',k);
      if(named){person=named;continue;}
      const id=e.reply?.id||'';
      if((id==='robert'||id.startsWith('bio:'))&&person!=='other')person='robert';
      // Changing from biography to books, voice or a product does not erase
      // the last explicitly named person. Unknown people are not overwritten.
    }
    if(/\b(?:she|her|hers|they|their|them)\b/.test(norm(question)))return 'other';
    return person;
  }
  function screenIntent(q){
    if(/\b(?:ignore|pretend|invent|fabricate|secret|password|awards?|oscars?|emmys?|bestseller|sales|favourites?|favorites?|likes?|watch|recommend|generate|create|script|screenplay|trailers?)\b|make up|full text/.test(q))return null;
    if(/\b(?:biography|bio|focus|shorter|longer|not|never|hasnt|wasnt)\b|tell me more|more detail|go deeper|how many|total (?:films|movies|credits)/.test(q))return null;
    const films=/\b(?:movies?|films?)\b/.test(q);
    const tv=/\b(?:tv|television|shows|series)\b|\bt v\b|\b(?:what|which|the|a) show\b/.test(q);
    const credits=/\b(?:filmography|screen credits|acting credits|movie credits|tv credits)\b/.test(q);
    const career=/\b(?:entertainment|acting|acted|actor|actress|film industry|show business)\b/.test(q);
    const participation=/\b(?:acted|acting|appeared|appear|worked|work|played|play|been|roles?|credits?|filmography|done|starred)\b/.test(q);
    const broad=/\b(?:what|which|some|any|list|name|show|tell|movies|films|shows|credits|filmography)\b/.test(q)||/^(?:and\s+)?his\s+(?:tv|television|film|movie|screen)/.test(q);
    if((films||tv)&&participation&&broad)return films&&!tv?'films':tv&&!films?'television':'overview';
    if(credits || (career&&/\b(?:what|which|is|was|does|has|tell|his|him|robert|mcmurrer)\b/.test(q)))return 'overview';
    // e.g. "And his TV work?" or a plain "His filmography".
    return null;
  }
  function publicScreenReply(k,question,lastTopic,exchanges,result){
    const q=norm(question),facet=screenIntent(q);if(!facet)return null;
    const person=resolvePerson(k,question,lastTopic,exchanges);
    // Preserve specific named-film questions, authoring questions and existing
    // source-level limitations. This is a broad credits/career route only.
    if(/\b(?:direct|directed|director|write|writer|written|wrote|produce|producer|produced)\b/.test(q))return null;
    if(person==='other')return {reply:{id:'',title:'Whose screen work would you like to explore?',answer:'My published movie and television credits cover Robert McMurrer. Are you asking about Robert, or someone else?',label:'CLARIFY THE PERSON',sources:['credits','about'].filter(id=>k.sources[id]),next:['Which movies and TV shows has Robert appeared in?']},context:lastTopic};
    if(person!=='robert')return null;
    const t=k.topics.find(t=>t.id==='entertainment');if(!t)return null;
    const entry=facet==='overview'?{}:t.followups?.[facet];if(!entry)return null;
    return {reply:{...t,...entry,id:t.id,facet,label:(entry.label||t.label).toUpperCase(),sources:entry.sources||t.sources},context:'robert'};
  }

  function prepare(input){
    const k=clone(input);
    const original={topics:k.topics.length,books:(k.book_catalogue||[]).length,facts:(k.public_packs?.facts||[]).length};
    const rejectedTopics=new Set(k.topics.filter(t=>excludedIds.has(t.id)||excluded.test(t.title||'')).map(t=>t.id));
    k.topics=k.topics.filter(t=>!rejectedTopics.has(t.id));
    const rejectedSources=new Set(Object.entries(k.sources).filter(([id,s])=>excluded.test(id+' '+s.label+' '+s.url)).map(([id])=>id));
    for(const id of rejectedSources)delete k.sources[id];
    for(const s of Object.values(k.sources)){s.label=rename(s.label);const old=s.url;s.url=moveURL(s.url);if(s.url!==old&&/(?:github\.com|raw\.githubusercontent\.com|\.(?:json|js|py))/i.test(old))s.label=s.url.startsWith('updates.html')?'Read the development update':s.url.startsWith('shiftbrief.html')?'ShiftBrief setup and help':'Read the project notes';}
    k.sources['iris-contact']=contactSource;
    k.sources['iris-projects']={label:'Current Kira Labs projects',url:'projects.html'};
    k.sources['iris-privacy']={label:'Website privacy',url:'privacy.html'};
    k.sources['iris-knowledge']={label:'Iris sources and knowledge',url:'knowledge.html'};
    // Owner-supplied professional profile URLs, September 14, 2026.
    k.sources['robert-linkedin-current']={label:'Robert’s LinkedIn biography',url:'https://www.linkedin.com/in/rmcmurrer'};
    k.sources['robert-facebook-professional']={label:'Robert’s professional Facebook',url:'https://www.facebook.com/rmcmurrer/'};
    const allowedSources=xs=>(xs||[]).filter(id=>k.sources[id]);
    for(const t of k.topics){
      t.sources=allowedSources(t.sources);t.title=rename(t.title);t.label=rename(t.label);
      t.answer=cleanText(t.answer);
      for(const key of ['terms','project_names','concept_names','next'])if(Array.isArray(t[key]))t[key]=t[key].filter(x=>!excluded.test(x));
      for(const [id,f] of Object.entries(t.followups||{})){
        const cleaned=cleanText(f.answer);
        if(!cleaned){delete t.followups[id];continue;}
        f.answer=cleaned;f.sources=allowedSources(f.sources||t.sources);
        if(f.title)f.title=rename(f.title);
        if(f.next)f.next=f.next.filter(x=>!excluded.test(x));
      }
      // The 'voice' subject is the legacy WEBSITE guide/speech subject, not a resident.
      if(t.id==='voice'){
        t.title='Iris · the Kira Labs website guide';
        t.answer='I’m Iris, the automated Kira Labs website guide. I use the published biography, entertainment credits, book catalogue and project notes. I am not Kira or Sarah inside ShiftBrief or Sarah Travel. Optional Voice on reads my replies using your browser; I cannot access private records.';
        t.sources=['iris-knowledge','iris-privacy'];t.terms=[...(t.terms||[]),'iris','website guide','site guide'];
        t.followups={...(t.followups||{}),overview:{answer:t.answer,sources:t.sources}};
      }
    }
    const p=k.topics.find(t=>t.id==='prototypes');
    if(p){
      p.title='The projects featured at Kira Labs';
      p.answer='Kira World is the flagship research project. ShiftBrief is a free Windows release. Video Studio is a private local creative tool in development, and Sarah Travel has private debug builds. Each project has its own page and status.';
      p.sources=['iris-projects'];p.next=['Tell me about Kira World','How do I install ShiftBrief?','Tell me about Video Studio'];p.coverage={};p.followups={};
    }
    const privacy=k.topics.find(t=>t.id==='privacy');
    if(privacy){
      privacy.answer='Iris loads published knowledge files, then answers inside this browser tab. The conversation is not saved or sent to Robert. The separate Send message form transmits your name, email, reason and message to FormSubmit for email delivery to Robert. It does not include this chat. Optional voice playback uses your browser’s speech system.';
      privacy.sources=['iris-privacy','iris-contact'];privacy.coverage={};privacy.followups={};
    }
    if(k.public_packs){
      const pack=k.public_packs;
      const allowedTopics=new Set(k.topics.map(t=>t.id));
      pack.facts=pack.facts.filter(f=>!excluded.test(f.statement||'')&&!f.subject_ids.some(id=>rejectedTopics.has(id))&&(f.sources||[]).some(id=>k.sources[id]));
      for(const f of pack.facts){f.sources=allowedSources(f.sources);f.subject_ids=f.subject_ids.filter(id=>allowedTopics.has(id));}
      pack.facts=pack.facts.filter(f=>f.subject_ids.length);
      const facts=new Set(pack.facts.map(f=>f.id));
      pack.routes=pack.routes.filter(r=>allowedTopics.has(r.subject_id)&&!excluded.test(JSON.stringify(r.matches||[]))&&r.fact_ids.every(id=>facts.has(id)));
      for(const r of pack.routes)if(r.detail_fact_ids)r.detail_fact_ids=r.detail_fact_ids.filter(id=>facts.has(id));
      for(const t of k.topics)for(const [intent,ids] of Object.entries(t.coverage||{}))t.coverage[intent]=ids.filter(id=>facts.has(id));
      pack.updates=(pack.updates||[]).filter(u=>!excluded.test(u.summary||''));
    }
    k.iris_preservation={source_version:k.public_packs?.content_version||k.updated_at,original,retained:{topics:k.topics.length,books:(k.book_catalogue||[]).length,facts:(k.public_packs?.facts||[]).length}};
    return k;
  }
  function wrap(original){
    return Object.freeze({
      async load(text,fetcher,previous){
        const loaded=await original.load(text,fetcher,previous);
        // Never silently substitute a smaller core-only bank for the full guide.
        if(!loaded.knowledge?.public_packs)throw new Error('Complete published knowledge did not load');
        const knowledge=prepare(loaded.knowledge);
        if(root.document){const n=root.document.getElementById('knowledge-coverage');if(n){n.hidden=false;n.textContent='Published knowledge loaded · '+knowledge.iris_preservation.retained.topics+' topics · '+knowledge.iris_preservation.retained.books+' book listings';}}
        return {...loaded,knowledge};
      },
      enrich(k,question,lastTopic,exchanges,result){
        const q=norm(question);
        const make=(title,answer,id='')=>({title,answer,id,label:'FROM THE PUBLISHED NOTES',sources:['iris-contact','iris-projects'],next:['Write a mini bio of Robert','Tell me about Kira World','How do I install ShiftBrief?']});
        if(/\b(linkedin|linked in|facebook|professional profiles|social profiles|social pages|social accounts)\b/.test(q)||/where (?:can i|to) follow (?:robert|him)/.test(q)){
          return {...make('Robert’s professional profiles','Robert’s LinkedIn is his professional biography and background profile. His professional Facebook page is facebook.com/rmcmurrer. These are the profiles Robert supplied for this website. They are separate from the Kira World project page.','robert'),sources:['robert-linkedin-current','robert-facebook-professional'],next:['Write a mini bio of Robert','Tell me about his entertainment work','Which books has Robert written?']};
        }
        if(excluded.test(question))return make('Explore the current Kira Labs projects','That project is not featured on the current website. Explore Kira World, ShiftBrief, Video Studio and Sarah Travel, or ask Robert directly.');
        if(/\b(iris|website guide|site guide|who are you|your name)\b/.test(q))return {...k.topics.find(t=>t.id==='voice'),id:'voice'};
        if(/\b(send|contact|email|message)\b/.test(q)&&/\b(robert|him|message|email)\b/.test(q)&&!/\b(shiftbrief|employee|books|credits)\b/.test(q))return make('Send Robert a message','Use the Send message form beside this guide. It submits directly through FormSubmit without opening an email app. This conversation itself is not sent to Robert.');
        const routed=publicScreenReply(k,question,lastTopic,exchanges,result);
        if(routed)result=routed.reply;
        let answer=original.enrich(k,question,routed?.context||lastTopic,exchanges,result);
        answer={...answer,title:rename(answer.title),answer:cleanText(answer.answer)};
        if(!answer.answer)return make('Ask Robert about that detail','The current published notes do not provide a reliable answer to that question. You can send Robert a message using the form.');
        if(answer.next)answer.next=answer.next.filter(x=>!excluded.test(x)).map(rename);
        answer.sources=(answer.sources||[]).filter(id=>k.sources[id]);
        if(!answer.sources.length)answer.sources=['iris-contact'];
        return answer;
      }
    });
  }
  const api=Object.freeze({prepare,wrap,rename,moveURL,resolvePerson,screenIntent,publicScreenReply});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.KiraIrisPolicy=api;
})(typeof window!=='undefined'?window:globalThis);
