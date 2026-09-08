/* Sarah's browser guide: grounded retrieval and factual bio composition.
   No provider calls, account, installed model, persistent chat storage or credits. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let knowledge=null, exchanges=[], pages=[], pageIndex=0, lastTopic='', loading=false;
  const normalize=s=>String(s).toLowerCase().normalize('NFKC').replace(/[’']/g,'').replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  const topic=id=>knowledge.topics.find(t=>t.id===id);
  const match=(q,t)=>t.startsWith(' ')?(' '+q+' ').includes(t.trim()+' '):t.length<4?new RegExp('\\b'+t+'\\b').test(q):q.includes(t);
  function answer(question){
    const result=answerFromNotes(question);
    return window.SarahPacks?window.SarahPacks.enrich(knowledge,question,lastTopic,exchanges,result):result;
  }
  function answerFromNotes(question){
    const q=normalize(question);
    const asksForParts=/\b(parts?|components?|layers?|pieces|elements|sections|aspects|features)\b|\b(?:made up of|consists? of|break(?: it| that)? down)\b/.test(q);
    const make=(title,text,sources=[],next=[],id='')=>({title,answer:text,sources,next,id,label:'FROM THE PUBLISHED NOTES'});
    const namedBook=(knowledge.book_catalogue||[]).filter(b=>q.includes(normalize(b.title))).sort((a,b)=>b.title.length-a.title.length)[0];
    if(namedBook && !/full text|whole book|entire book|chapter by chapter|quote a chapter/.test(q))return make('About this book',namedBook.title+' is listed under Robert McMurrer on Amazon. '+(namedBook.summary||'I have its catalogue listing, but no reviewed description in these notes yet.')+' Open the listing for details and available editions.',[namedBook.source],['Show the book list','Write an author-focused mini bio'],'book:'+namedBook.source);
    if(/book list|list (all |his |the )?books|all (his )?titles|bibliography|other titles/.test(q))return make('Explore Robert’s books',(knowledge.book_catalogue||[]).map(b=>b.title).join(' • '),['books'],['Tell me about The Long Walk North','Tell me about Sci-Fi Seeds: Tech of Tomorrow'],'books');
    if(/\b(ignore|pretend|fabricate|invent|secret|password|api secret)\b/.test(q)||/^(?:(?:please|could you|can you|would you)\s+)*make up\b/.test(q))return make('Let’s keep it factual','I can help with Robert’s public work and the published project notes. I cannot invent credits, awards, private information or finished features. What would you like to know?',['about'],['Write a mini bio of Robert','What works today?']);
    // A follow-up belongs to the named or remembered subject, not a generic keyword.
    const facet=/\b(privacy|private|security|permission|personal data|offline)\b/.test(q)?'privacy':
      /\b(status|ready|finished|available|download|release|launch|working|implemented)\b|works (now|today)|work (now|today)|current state|when (can|will)|can i (try|use|access)/.test(q)?'status':
      /\b(how many|which models?|what models?|algorithm|database|architecture|technical|implementation|headset|hardware|supported devices)\b/.test(q)?'technical':
      /how (?:does|do|would|will|is|are|can)|how .*work|how it works/.test(q)?'how':
      /\b(voice|speak|audio)\b/.test(q)?'voice':
      /\b(credits|cost|pay|paid|free|price)\b/.test(q)?'cost':
      /\b(limit|limits|limitation|limitations|cannot|cant|not do)\b/.test(q)?'limits':
      /tell me more|more detail|what else|expand|go deeper|explain further/.test(q)?'details':'overview';
    const replyFor=(t,requested=facet)=>{
      // A newly named subject starts with its own introduction, even after More.
      if(requested==='details'&&t.id!==lastTopic)requested='overview';
      const history=exchanges.filter(e=>e.reply.id===t.id).map(e=>e.reply);
      let chosen=(t.id==='privacy'&&requested==='privacy')||(t.id==='status'&&requested==='status')?'overview':requested;
      if(chosen==='details' && history.some(r=>r.facet==='details')){
        chosen=['how','status','limits','privacy'].find(f=>t.followups?.[f]&&!history.some(r=>r.facet===f))||'exhausted';
      }
      const entry=t.followups?.[chosen];
      if(entry)return {...t,...entry,id:t.id,facet:chosen,label:(entry.label||t.label).toUpperCase()};
      if(chosen==='overview')return {...t,facet:chosen,label:t.label.toUpperCase()};
      const subject={privacy:'privacy and data handling',status:'current availability',technical:'that technical detail',how:'how it is implemented',voice:'voice support',cost:'pricing or credits',limits:'its precise limits',details:'further detail',exhausted:'further detail'}[chosen]||'that detail';
      return {...make(t.title+' · what is documented',chosen==='exhausted'?
        'We have covered the available overview and follow-up notes for '+t.title+'. I do not have another verified layer of detail to add. The source links below are the next place to check; Robert can clarify anything they do not cover.':
        'I do not have a reviewed answer about '+subject+' for '+t.title+'. I can explain the documented overview, but I should not infer details from another project. The links below show the available notes.',t.sources,t.next,t.id),facet:chosen,label:'LIMIT OF THE AVAILABLE NOTES'};
    };
    // A screen-work question is an explicit subject change, even after a project follow-up.
    const screenWords=/\b(movies?|films?|tv|television|shows?|series|filmography)\b|\b(?:screen|acting) credits\b/.test(q);
    const namedRobert=/\b(roberts?|mcmurrers?)\b/.test(q);
    const knownRobert=lastTopic==='robert'||lastTopic==='entertainment'||lastTopic.startsWith('bio:');
    const personalCredits=namedRobert||(knownRobert&&/\b(he|his|him)\b/.test(q))||lastTopic==='entertainment';
    const screenWork=/\b(worked|work|appeared|appear|acted|acting|act|played|play|done|roles?|credits?|filmography)\b/.test(q)||/\b(?:was|were|been)\b.*\bin\b/.test(q);
    const asksForCredits=(screenWords&&personalCredits&&screenWork)||(namedRobert&&/\b(?:filmography|screen credits|acting credits)\b/.test(q));
    const named=knowledge.topics.filter(t=>[...(t.project_names||[]),...(t.concept_names||[])].some(name=>(' '+q+' ').includes(' '+normalize(name)+' ')));
    const specific=named.some(t=>!['world','labs','ai'].includes(t.id))?named.filter(t=>!['world','labs','ai'].includes(t.id)):named;
    if(specific.length===1)return replyFor(specific[0],specific[0].id==='world'&&asksForParts?'components':facet);
    if(specific.length>1){const replies=specific.map(t=>replyFor(t));return make('The concepts you asked about',replies.map(t=>t.title+': '+t.answer).join('\n\n'),[...new Set(replies.flatMap(t=>t.sources))],specific.slice(0,3).map(t=>'Tell me more about '+t.title),'compare:'+specific.map(t=>t.id).join(','));}
    if(asksForCredits){const films=/\b(movies?|films?)\b/.test(q),television=/\b(tv|television|shows)\b|\b(?:what|which|a|the) show\b/.test(q);return replyFor(topic('entertainment'),films&&!television?'films':television&&!films?'television':'overview');}
    // Specific requests keep their existing handling before subject selection.
    if(/\b(?:prototypes?|hackathons?|current (?:projects|apps)|new (?:projects|apps)|other apps|broader projects)\b|what else is robert building|what is being tested/.test(q)){const current=topic('prototypes');return replyFor(current);}
    if(/\b(address|phone number|medical|diagnosis|family|relationship|net worth|criminal|arrest|jail)\b/.test(q)&&!q.includes('email'))return make('Ask Robert directly','My notes cover Robert’s public creative and AI work. I do not have a reviewed answer to that personal question. You can contact him at rmcmurrer@kiralabs.org.',['about'],['Tell me about his entertainment work','Which books has he written?']);
    if(/\b(bio|biography|introduc|introduction)\b/.test(q)||((/\b(shorter|longer|expand|shorten|brief|focus)\b/.test(q))&&lastTopic.startsWith('bio:'))){
      const previous=lastTopic.split(':')[1]||'short';
      const focus=/entertainment|acting|screen|film/.test(q)?'entertainment':/author|books|writing/.test(q)?'books':/\bai\b|technology/.test(q)?'ai':/longer|expand|more detail/.test(q)?'expanded':/shorter|shorten|brief|short/.test(q)?'short':lastTopic.startsWith('bio:')?previous:'short';
      return {...make('Robert McMurrer · mini bio',knowledge.bio[focus],knowledge.bio.sources,['Make it shorter','Give me a longer bio','Make it focus on AI'],'bio:'+focus),label:'A FACTUAL INTRODUCTION · READY TO COPY'};
    }
    if(/^(hi|hello|hey|good morning|good evening|help|where (do|should) (i|we) start)[.! ]*$/.test(q))return make('Hi, I’m Sarah','I can introduce Robert, explain Kira Labs and Kira World, or help you find his books and entertainment credits. You can ask for a short biography, too.',[],['Write a mini bio of Robert','What is Kira World?','Tell me about his books']);
    if(/^(thanks|thank you|thankyou|great|ok|okay|cool)\b/.test(q))return make('You’re welcome','What would you like to explore next?',[],['His entertainment work','His books','His AI work']);
    if(/\b(send|email|tell|contact)\b.*\b(him|robert)\b/.test(q)&&/\b(send|message|tell him)\b/.test(q))return make('Contact Robert directly','This conversation stays in your browser; it is not a message to Robert. Use rmcmurrer@kiralabs.org to email him directly.',['about'],['Write a mini bio for an introduction']);
    if(/\b(award|awards|oscar|emmy|bestseller|best seller|sales|copies sold)\b/.test(q))return make('That isn’t confirmed in my notes','I do not have a verified record for that claim. I can share Robert’s published credits and book listings without inventing awards, sales totals or rankings.',['imdb','books'],['Show me his entertainment credits','Which books has he written?']);
    if(/\b(full text|whole book|entire book|chapter by chapter|quote a chapter)\b/.test(q))return make('I can help you find the book','I have book listings and brief descriptions, not the complete manuscripts. The Amazon link will help you find the available editions.',['books'],['Which books has he written?']);
    // A named new subject outranks the generic 'tell me more' continuation.
    const personalSubject=/\b(entertainment|acting|screenwriting|screenwriter|hollywood|filmography)\b|film career|background work/.test(q)?'entertainment':
      /\b(books?|novels?|author|bibliography|cookbooks?|poetry)\b/.test(q)?'books':
      namedRobert&&/\b(ai|artificial intelligence)\b/.test(q)?'ai':namedRobert?'robert':/\bsarah\b/.test(q)?'voice':null;
    if(personalSubject&&/^(?:and\s+)?(?:tell me more\b|more detail\b|what else\b|go deeper\b|explain further\b|expand\b)/.test(q))return replyFor(topic(personalSubject));
    const previous=topic(lastTopic);
    const partsFollowup=asksForParts&&(/\b(it|its|this|that|these|those|they|their)\b/.test(q)||!q.replace(/\b(and|what|which|is|are|does|do|the|a|an|some|all|of|different|main|major|basic|various|other|each|parts?|components?|layers?|pieces|elements|sections|aspects|features|exist|have|explain|describe|list|show|tell|me|please)\b/g,'').trim());
    if(previous?.id==='world'&&partsFollowup)return replyFor(previous,'components');
    const continuation=/^(?:and\b|tell me more\b|more details?\b|what else\b|go deeper\b|explain further\b|expand\b|how (?:does|would) (?:it|that|this)\b|how do (?:they|those)\b|what about (?:it|its|that|their|privacy|security|voice|audio|credits|cost|pricing)\b|(?:is|does|can|will|would) (?:it|this|that|they)\b|are (?:they|these|those)\b|can i (?:try|download|use|access) it\b)/.test(q);
    if(lastTopic.startsWith('compare:') && (continuation||partsFollowup)){const subjects=lastTopic.slice(8).split(',').map(topic).filter(Boolean);return make('Choose a topic to explore','Our last answer covered '+subjects.map(t=>t.title).join(' and ')+'. Choose one below so I can give the right follow-up rather than return to an older subject.',[...new Set(subjects.flatMap(t=>t.sources))],subjects.slice(0,3).map(t=>'Tell me more about '+t.title),lastTopic);}
    if(previous && (continuation || (facet==='technical' && /\b(it|its|they|their|that)\b/.test(q))))return replyFor(previous,facet==='overview'?'details':facet);
    const scored=knowledge.topics.map(t=>({t,score:t.terms.reduce((s,x)=>s+(match(q,x)?Math.max(2,x.trim().split(' ').length*4):0),0)})).sort((a,b)=>b.score-a.score);
    let selected=scored[0]?.score?scored[0].t:null;
    // Specific book titles, product names and question intent outrank a generic name.
    for(const id of ['poetry','driving','studio','travel','memory','privacy','home','entertainment','books']){
      const candidate=scored.find(x=>x.t.id===id);if(candidate?.score>=4 && candidate.score >= (scored[0]?.score||0)-4){selected=candidate.t;break;}
    }
    if(/\b(latest|current|ready|finished|release|available|download|buy|launch)\b|works today|working today|when (can|will)/.test(q)&& !/book|poetry|dark storm/.test(q))selected=topic('status');
    if(/\b(ai|artificial intelligence)\b/.test(q)&&!(/kira world|video studio|travel/.test(q)))selected=topic('ai');
    if(/\b(email|contact|reach|collaborat)/.test(q))selected=topic('contact');
    if(/\b(voice|speak|audio|api key|credits)\b|who are you/.test(q)&&!q.includes('kira world'))selected=topic('voice');
    if(!selected && /^(tell me more|more details|what else|and|what about it|how does it work)/.test(q)&&lastTopic){selected=topic(lastTopic);}
    if(selected)return replyFor(selected);
    return make('Let’s find the right part of the story','I don’t have a documented answer to that question. I can help with Kira Labs, Kira World, Robert’s entertainment credits, books and AI work—or create a short factual bio. For details beyond those notes, email Robert directly.',['about'],['Write a mini bio of Robert','Tell me about his books','What works today?']);
  }
  
  // Keep a complete answer in one scrollable card. History moves between replies only.
  function rebuildPages(goLast=false){
    pages=exchanges.map((e,i)=>({exchange:i,text:e.reply.answer}));
    pageIndex=goLast?Math.max(0,pages.length-1):Math.min(pageIndex,Math.max(0,pages.length-1));
    render();
  }
  function setSuggestions(items){$('related-questions').replaceChildren();for(const suggestion of items.slice(0,3)){const b=document.createElement('button');b.type='button';b.dataset.prompt=suggestion;b.textContent=suggestion;$('related-questions').append(b);}}
  function setLinks(ids){$('answer-sources').replaceChildren();for(const id of [...new Set(ids)].slice(0,3)){const s=knowledge.sources[id];if(!s)continue;const a=document.createElement('a');a.textContent=s.label+' ↗';a.href=s.url;if(/^https:\/\//.test(s.url)){a.target='_blank';a.rel='noopener noreferrer';}$('answer-sources').append(a);}}
  function render(){
    const p=pages[pageIndex];if(!p)return;const entry=exchanges[p.exchange],r=entry.reply;
    $('asked-question').hidden=!entry.question;$('asked-question').textContent=entry.question;$('asked-question').title=entry.question;
    $('answer-label').textContent=r.label||'FROM THE PUBLISHED NOTES';$('answer-title').textContent=r.title;
    const paragraph=document.createElement('p');paragraph.textContent=p.text;$('answer-body').replaceChildren(paragraph);
    $('answer-page').textContent=exchanges.length>1?`Reply ${p.exchange+1} of ${exchanges.length}`:'';
    document.querySelector('.sarah-answer').scrollTop=0;
    $('previous-answer').disabled=pageIndex===0;$('next-answer').disabled=pageIndex===pages.length-1;
    $('copy-answer').disabled=false;setSuggestions(r.next||[]);setLinks(r.sources||[]);
  }
  function send(question){if(!knowledge||loading)return;const q=question.trim();if(!q)return;const r=answer(q);lastTopic=r.id||lastTopic;exchanges.push({question:q,reply:r});$('asked-question').hidden=false;$('asked-question').textContent=q;rebuildPages(true);$('question').value='';$('guide-status').textContent='Ready for your next question';speakAnswer();}
  async function loadKnowledge(){if(loading)return;loading=true;$('send-question').disabled=true;$('guide-status').textContent='Checking the published notes…';
    try{const response=await fetch('sarah-knowledge.json',{cache:'no-store'});if(!response.ok)throw Error('notes unavailable');const text=await response.text();const next=JSON.parse(text);if(next.schema_version!==1||!Array.isArray(next.topics)||!next.bio||!next.sources)throw Error('notes invalid');
      const loaded=window.SarahPacks?await window.SarahPacks.load(text,fetch,knowledge):{knowledge:next,mode:'base'};knowledge=loaded.knowledge;
      const date=new Date(knowledge.updated_at+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});$('knowledge-date').textContent='Notes updated '+date;
      $('guide-status').textContent=loaded.mode==='retained'?'Update incomplete · using the complete notes already loaded':loaded.mode==='base'?'Here to help · using the core published notes':'Here to help · answers from reviewed public sources';$('send-question').disabled=false;
    }catch(e){$('guide-status').textContent=knowledge?'Update unavailable · using notes already loaded':'Notes could not load. Try Check updates.';$('send-question').disabled=!knowledge;}
    finally{loading=false;}
  }
  $('sarah-form').addEventListener('submit',e=>{e.preventDefault();send($('question').value);});
  $('question').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send($('question').value);}});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-prompt]');if(b)send(b.dataset.prompt);});
  $('previous-answer').onclick=()=>{if(pageIndex>0){pageIndex--;render();speakAnswer();}};$('next-answer').onclick=()=>{if(pageIndex<pages.length-1){pageIndex++;render();speakAnswer();}};
  $('refresh-notes').onclick=loadKnowledge;
  $('open-profiles').onclick=()=>$('profiles-dialog').showModal();
  $('close-profiles').onclick=()=>$('profiles-dialog').close();
  $('clear-chat').onclick=()=>{exchanges=[];pages=[];pageIndex=0;lastTopic='';send('Hello');$('asked-question').hidden=true;};
  $('copy-answer').onclick=async()=>{const p=pages[pageIndex];if(!p)return;const r=exchanges[p.exchange].reply;try{await navigator.clipboard.writeText(r.answer);$('guide-status').textContent='Complete answer copied';}catch{const textarea=document.createElement('textarea');textarea.value=r.answer;document.body.append(textarea);textarea.select();const ok=document.execCommand('copy');textarea.remove();$('guide-status').textContent=ok?'Complete answer copied':'Select the answer text to copy it';}};
  // Opt in once for this visit. Never persist consent or request microphone access.
  const synth=window.speechSynthesis;
  let voiceEnabled=false,speechToken=0,activeUtterance=null;
  function voiceUI(message){
    $('voice-toggle').textContent=voiceEnabled?'Voice off':'Voice on';
    $('voice-toggle').setAttribute('aria-pressed',String(voiceEnabled));
    $('voice-status').textContent=message||(voiceEnabled?'Voice on · reads each reply':'Voice off · no account needed');
  }
  function stopSpeech(){speechToken++;activeUtterance=null;if(synth)synth.cancel();}
  function speakAnswer(){
    stopSpeech();if(!voiceEnabled)return;
    const token=speechToken;
    const current=pages[pageIndex];
    const reply=current?exchanges[current.exchange].reply:null;
    const text=reply?reply.title+'. '+reply.answer:$('answer-title').textContent+'. '+$('answer-body').textContent;
    // Small sentence groups prevent long utterances being cut off by some browsers.
    const chunks=text.match(/[^.!?]+[.!?]+(?:[”’"']|$)?|[^.!?]+$/g)||[text];
    const voices=synth.getVoices().filter(v=>/^en(?:-|_)/i.test(v.lang));
    const selected=voices.find(v=>v.localService&&/zira|samantha|hazel|susan/i.test(v.name))||voices.find(v=>v.localService)||voices.find(v=>v.default)||voices[0];
    function next(){
      if(!voiceEnabled||token!==speechToken)return;
      const chunk=chunks.shift();if(!chunk){activeUtterance=null;voiceUI();return;}
      const utterance=new SpeechSynthesisUtterance(chunk.trim());activeUtterance=utterance;
      if(selected)utterance.voice=selected;utterance.lang=selected?.lang||'en-US';utterance.rate=1;
      utterance.onstart=()=>{if(token===speechToken)voiceUI('Sarah is speaking · voice stays on');};
      utterance.onend=next;
      utterance.onerror=e=>{if(token!==speechToken)return;voiceEnabled=false;stopSpeech();voiceUI(e.error==='not-allowed'?'Press Voice on to allow speech':'Voice unavailable in this browser · text is ready');};
      synth.speak(utterance);
    }
    next();
  }
  $('voice-toggle').onclick=()=>{voiceEnabled=!voiceEnabled;voiceUI();if(voiceEnabled)speakAnswer();else stopSpeech();};
  if(!synth||!window.SpeechSynthesisUtterance){$('voice-toggle').disabled=true;voiceUI('Read aloud is unavailable in this browser');}
  addEventListener('pagehide',()=>{voiceEnabled=false;stopSpeech();voiceUI();});
  loadKnowledge();
})();
