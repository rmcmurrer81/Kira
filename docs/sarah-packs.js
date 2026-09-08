/* Versioned public notes. No provider, microphone, account or persistent chat store. */
(() => {
  'use strict';
  const ID=/^[A-Za-z0-9][A-Za-z0-9:_-]{0,100}$/;
  const VERSION=/^\d{4}-\d{2}-\d{2}\.\d+$/;
  const HASH=/^[a-f0-9]{64}$/;
  const DATE=/^\d{4}-\d{2}-\d{2}$/;
  const PACK_IDS=['robert','kira-world','updates'];
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
  const normalize=s=>String(s).toLowerCase().normalize('NFKC').replace(/[’']/g,'').replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  const includes=(q,s)=>(' '+q+' ').includes(' '+normalize(s)+' ');
  const unique=xs=>[...new Set(xs)];
  function assert(ok,message){if(!ok)throw Error(message);}
  function safeURL(url){
    if(typeof url!=='string'||url.length>2000)return false;
    if(/^https:\/\//.test(url)){try{const u=new URL(url);return !u.username&&!u.password;}catch{return false;}}
    if(/^mailto:rmcmurrer@kiralabs\.org(?:\?subject=[A-Za-z0-9%._~-]+)?$/.test(url))return true;
    return /^[a-z0-9][a-z0-9-]*\.html(?:#[a-z0-9-]+)?$/.test(url);
  }
  async function sha(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),n=>n.toString(16).padStart(2,'0')).join('');}
  function baseValid(base){return base?.schema_version===1&&Array.isArray(base.topics)&&object(base.bio)&&object(base.sources);}
  async function read(fetcher,path){
    // A missing static asset must not leave the guide's send button disabled indefinitely.
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),8000);
    try{const response=await fetcher(path,{cache:'no-store',signal:controller.signal});assert(response.ok,'asset unavailable');const text=await response.text();assert(text.length<=800000,'asset too large');return text;}finally{clearTimeout(timer);}
  }
  async function assemble(base,baseText,index,packs){
    assert(object(index)&&index.schema_version===1&&VERSION.test(index.content_version)&&DATE.test(index.reviewed_on),'index invalid');
    assert(HASH.test(index.base_sha256)&&await sha(baseText)===index.base_sha256,'base version mismatch');
    assert(Array.isArray(index.packs)&&index.packs.length===3&&packs.length===3,'pack set incomplete');
    const expected=PACK_IDS.map(id=>'knowledge/'+id+'-'+index.content_version.replaceAll('.','-')+'.json');
    const next=JSON.parse(JSON.stringify(base));
    const sources=Object.assign(Object.create(null),next.sources), topics=new Map(), facts=[], routes=[], seenFacts=new Set();
    const seenRoutes=new Set();
    for(let i=0;i<3;i++){
      const descriptor=index.packs[i],pack=packs[i];
      assert(descriptor.id===PACK_IDS[i]&&descriptor.path===expected[i]&&HASH.test(descriptor.sha256),'pack path invalid');
      assert(object(pack)&&pack.schema_version===1&&pack.id===descriptor.id&&pack.content_version===index.content_version&&pack.reviewed_on===index.reviewed_on,'pack version mismatch');
      assert(object(pack.sources)&&Array.isArray(pack.topics)&&Array.isArray(pack.facts)&&Array.isArray(pack.routes),'pack shape invalid');
      for(const [id,s] of Object.entries(pack.sources)){
        assert(ID.test(id)&&!['constructor','prototype','__proto__'].includes(id)&&object(s)&&typeof s.label==='string'&&safeURL(s.url),'source invalid');
        if(own(sources,id))assert(sources[id].url===s.url&&sources[id].label===s.label,'source ID collision');
        sources[id]=s;
      }
      for(const t of pack.topics){
        assert(ID.test(t.id)&&!topics.has(t.id)&&typeof t.title==='string'&&typeof t.answer==='string'&&typeof t.label==='string'&&Array.isArray(t.terms)&&Array.isArray(t.sources),'topic invalid');
        topics.set(t.id,t);
      }
      for(const f of pack.facts){
        assert(ID.test(f.id)&&!seenFacts.has(f.id)&&Array.isArray(f.subject_ids)&&f.subject_ids.length&&Array.isArray(f.intents)&&typeof f.statement==='string'&&f.statement.trim()&&typeof f.status==='string'&&DATE.test(f.reviewed_on)&&HASH.test(f.revision)&&Array.isArray(f.sources)&&f.sources.length,'fact invalid');
        seenFacts.add(f.id);facts.push(f);
      }
      for(const r of pack.routes){
        assert(ID.test(r.id)&&!seenRoutes.has(r.id)&&Array.isArray(r.matches)&&r.matches.length&&r.matches.every(g=>Array.isArray(g)&&g.length&&g.every(s=>typeof s==='string'&&s.trim()))&&Array.isArray(r.fact_ids)&&r.fact_ids.length&&['any','robert','previous'].includes(r.scope),'route invalid');
        seenRoutes.add(r.id);routes.push(r);
      }
    }
    const refs=ids=>assert(Array.isArray(ids)&&ids.every(id=>typeof id==='string'&&own(sources,id)),'unknown source ID');
    for(const t of topics.values()){
      refs(t.sources);
      for(const entry of Object.values(t.followups||{})){assert(typeof entry.answer==='string','facet invalid');refs(entry.sources||t.sources);}
      for(const ids of Object.values(t.coverage||{}))assert(Array.isArray(ids)&&ids.every(id=>seenFacts.has(id)),'unknown coverage fact');
    }
    for(const f of facts){refs(f.sources);assert(f.subject_ids.every(id=>topics.has(id)),'unknown fact subject');}
    for(const r of routes)assert(topics.has(r.subject_id)&&r.fact_ids.every(id=>seenFacts.has(id))&&(!r.detail_fact_ids||(Array.isArray(r.detail_fact_ids)&&r.detail_fact_ids.every(id=>seenFacts.has(id)))),'unknown route fact or subject');
    assert(next.topics.every(t=>topics.has(t.id)),'base topic missing');
    refs(next.bio.sources||[]);
    for(const b of next.book_catalogue||[])refs([b.source]);
    assert(Array.isArray(packs[2].updates)&&packs[2].updates.length,'update history missing');
    const noLater=(a,b)=>a.slice(0,10)<b.slice(0,10)||(a.slice(0,10)===b.slice(0,10)&&Number(a.split('.')[1])<=Number(b.split('.')[1]));
    const updateIds=new Set();
    for(const u of packs[2].updates){
      assert(ID.test(u.id)&&!updateIds.has(u.id)&&VERSION.test(u.content_version)&&noLater(u.content_version,index.content_version)&&DATE.test(u.published_on)&&u.published_on<=index.reviewed_on&&u.content_version.slice(0,10)<=u.published_on&&typeof u.summary==='string'&&Array.isArray(u.affected_topics)&&u.affected_topics.every(id=>topics.has(id)),'update history invalid');
      updateIds.add(u.id);
    }
    assert(packs[2].updates.some(u=>u.content_version===index.content_version),'current update entry missing');
    next.topics=[...topics.values()];next.sources=sources;
    next.updated_at=index.reviewed_on;
    next.public_packs={content_version:index.content_version,reviewed_on:index.reviewed_on,facts,routes,updates:packs[2].updates||[]};
    return next;
  }
  async function load(baseText,fetcher,previous){
    const base=JSON.parse(baseText);assert(baseValid(base),'base notes invalid');
    try{
      const index=JSON.parse(await read(fetcher,'knowledge-index.json'));
      // Validate paths before fetching anything named by the index.
      assert(index.schema_version===1&&VERSION.test(index.content_version)&&Array.isArray(index.packs)&&index.packs.length===3,'index invalid');
      const texts=await Promise.all(index.packs.map((p,i)=>{
        assert(p.id===PACK_IDS[i]&&p.path==='knowledge/'+p.id+'-'+index.content_version.replaceAll('.','-')+'.json'&&HASH.test(p.sha256),'pack path invalid');
        return read(fetcher,p.path);
      }));
      const packs=[];
      for(let i=0;i<texts.length;i++){assert(await sha(texts[i])===index.packs[i].sha256,'pack bytes mismatch');packs.push(JSON.parse(texts[i]));}
      return {knowledge:await assemble(base,baseText,index,packs),mode:'packs'};
    }catch{
      // Do not replace a coherent previously loaded release with part of a failed refresh.
      return previous?.public_packs?{knowledge:previous,mode:'retained'}:{knowledge:base,mode:'base'};
    }
  }
  function metadata(knowledge,result,subjectIds,intent,ids){
    const facts=knowledge.public_packs.facts.filter(f=>ids.includes(f.id));
    return {...result,retrieval:{content_version:knowledge.public_packs.content_version,subject_ids:subjectIds,intent,fact_ids:unique(ids),fact_keys:facts.map(f=>f.id+':'+f.revision)}};
  }
  function factReply(knowledge,t,facts,intent){
    const result={id:t.id,title:t.title+(intent==='details'?' · more from the notes':''),answer:facts.map(f=>f.statement).join('\n\n'),sources:unique([...facts.map(f=>f.sources[0]),...facts.flatMap(f=>f.sources)]),next:t.next||[],facet:intent,label:'PUBLIC SOURCES · REVIEWED '+knowledge.public_packs.reviewed_on};
    return metadata(knowledge,result,[t.id],intent,facts.map(f=>f.id));
  }
  function enrich(knowledge,question,lastTopic,exchanges,result){
    const pack=knowledge.public_packs;if(!pack)return result;
    const q=normalize(question), t=knowledge.topics.find(t=>t.id===result.id);
    // Keep the established safety, full-text, biography and comparison responses intact.
    if(!result.id&&result.title!=='Let’s find the right part of the story')return result;
    if(result.id?.startsWith('compare:'))return metadata(knowledge,result,result.id.slice(8).split(','),'comparison',[]);
    if(result.id?.startsWith('bio:'))return metadata(knowledge,result,['robert'],'biography',knowledge.topics.find(t=>t.id==='robert').coverage?.overview||[]);
    if(result.id?.startsWith('book:'))return metadata(knowledge,result,['books'],'book',pack.facts.filter(f=>f.book_source===result.id.slice(5)).map(f=>f.id));
    const more=/^(?:and\s+)?(?:tell me more\b|more(?: details?)?$|more detail\b|what else\b|go deeper\b|explain further\b|expand\b)/.test(q)&&(!t||t.id===lastTopic);
    const robert=/\b(roberts?|mcmurrers?)\b/.test(q)||((['robert','entertainment','books'].includes(lastTopic)||lastTopic.startsWith('bio:'))&&/\b(he|his|him)\b/.test(q));
    const routes=pack.routes.filter(r=>(r.scope==='any'||(r.scope==='robert'&&robert)||(r.scope==='previous'&&r.subject_id===lastTopic))&&r.matches.every(group=>group.some(s=>includes(q,s))));
    if(routes.length&&!more){
      const best=routes.sort((a,b)=>b.matches.flat().join(' ').length-a.matches.flat().join(' ').length)[0];
      const subject=knowledge.topics.find(t=>t.id===best.subject_id);
      let facts=best.fact_ids.map(id=>pack.facts.find(f=>f.id===id));
      if(best.credit_title){
        const intent=/\b(direct|directed|director)\b/.test(q)?'director':/\b(write|wrote|writer|screenplay)\b/.test(q)?'writer':/\b(release|released|date|when)\b/.test(q)?'release':null;
        if(intent){const selected=facts.filter(f=>f.credit_kind===intent);if(selected.length)facts=selected;else return metadata(knowledge,{...result,id:subject.id,title:subject.title,answer:'The reviewed listing does not establish Robert’s '+intent+' credit or detail for '+best.credit_title+'. I can share the exact listed roles without inferring another credit.',sources:unique(facts.flatMap(f=>f.sources)),label:'LIMIT OF THE PUBLIC SOURCES'},[subject.id],intent,[]);}
      }
      const reply=factReply(knowledge,subject,facts.slice(0,4),best.intent||'specific');
      reply.retrieval.detail_fact_ids=best.detail_fact_ids||best.fact_ids;return reply;
    }
    if(robert&&/\b(favou?rite|preferred|prefers?|likes?|hobbies|hobby|pets?|breakfast)\b/.test(q)&&result.id==='robert')return metadata(knowledge,{...result,title:'Robert · not documented',answer:'The reviewed public notes do not answer “'+question.trim().slice(0,240)+'”. I can share his documented work and background, but should not invent a personal preference.',sources:knowledge.topics.find(t=>t.id==='robert').sources,label:'LIMIT OF THE PUBLIC SOURCES'},['robert'],'unknown',[]);
    if(!t)return result;
    if(more){
      const used=new Set(exchanges.flatMap(e=>e.reply.retrieval?.fact_keys||[]));
      let pool=pack.facts.filter(f=>f.subject_ids.includes(t.id)&&f.intents.includes('details'));
      const priorReply=[...exchanges].reverse().find(e=>e.reply.id===t.id)?.reply;
      const detailScope=routes.find(r=>r.subject_id===t.id)?.detail_fact_ids||priorReply?.retrieval?.detail_fact_ids;
      if(detailScope)pool=pool.filter(f=>detailScope.includes(f.id));
      // Continue the kind of detail being discussed; a technical answer should
      // not fall back to unrelated introductory facts on the next More.
      const priorIntent=priorReply?.retrieval?.detail_intent||priorReply?.retrieval?.intent;
      const detailIntent=['how','technical'].includes(priorIntent)?'technical':null;
      if(!detailScope&&detailIntent)pool=pool.filter(f=>f.intents.includes(detailIntent));
      // After a TV-only or film-only answer, an unqualified More keeps that useful scope.
      if(t.id==='entertainment'){
        const last=[...exchanges].reverse().find(e=>e.reply.id===t.id)?.reply;
        const prior=last?.retrieval?.intent||last?.facet;
        if(prior==='television'||prior==='films')pool=pool.filter(f=>f.intents.includes(prior));
      }
      const unseen=pool.filter(f=>!used.has(f.id+':'+f.revision)).slice(0,2);
      if(unseen.length){
        const last=[...exchanges].reverse().find(e=>e.reply.id===t.id)?.reply;
        const intent=t.id==='entertainment'&&['television','films'].includes(last?.retrieval?.intent)?last.retrieval.intent:'details';
        const reply=factReply(knowledge,t,unseen,intent);
        if(detailScope)reply.retrieval.detail_fact_ids=detailScope;
        if(detailIntent)reply.retrieval.detail_intent=detailIntent;return reply;
      }
      if(pool.length||detailScope||detailIntent||exchanges.some(e=>e.reply.id===t.id&&e.reply.answer===result.answer)){
        const exhausted=metadata(knowledge,{...result,title:t.title+' · available detail',answer:'We have covered the reviewed details I can add about '+t.title+'. The source links below offer the original material. You can ask a specific question or choose another topic; I will say when its answer is not documented.',sources:t.sources,label:'LIMIT OF THE PUBLIC SOURCES',facet:'exhausted'},[t.id],'exhausted',[]);
        if(detailScope)exhausted.retrieval.detail_fact_ids=detailScope;
        if(detailIntent)exhausted.retrieval.detail_intent=detailIntent;
        return exhausted;
      }
    }
    const intent=result.facet||'overview';
    return metadata(knowledge,result,[t.id],intent,t.coverage?.[intent]||[]);
  }
  window.SarahPacks=Object.freeze({load,enrich});
})();
