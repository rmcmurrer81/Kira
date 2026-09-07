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
    const q=normalize(question);
    const make=(title,text,sources=[],next=[],id='')=>({title,answer:text,sources,next,id,label:'FROM THE PUBLISHED NOTES'});
    const namedBook=(knowledge.book_catalogue||[]).filter(b=>q.includes(normalize(b.title))).sort((a,b)=>b.title.length-a.title.length)[0];
    if(namedBook && !/full text|whole book|entire book|chapter by chapter|quote a chapter/.test(q))return make('About this book',namedBook.title+' is listed under Robert McMurrer on Amazon. '+(namedBook.summary||'I have its catalogue listing, but no reviewed description in these notes yet.')+' Open the listing for details and available editions.',[namedBook.source],['Show the book list','Write an author-focused mini bio'],'book:'+namedBook.source);
    if(/book list|list (all |his |the )?books|all (his )?titles|bibliography|other titles/.test(q))return make('Explore Robert’s books',(knowledge.book_catalogue||[]).map(b=>b.title).join(' • '),['books'],['Tell me about The Long Walk North','Tell me about Sci-Fi Seeds: Tech of Tomorrow'],'books');
    if(/\b(ignore|pretend|fabricate|invent|make up|secret|password|api secret)\b/.test(q))return make('Let’s keep it factual','I can help with Robert’s public work and the published project notes. I cannot invent credits, awards, private information or finished features. What would you like to know?',['about'],['Write a mini bio of Robert','What works today?']);
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
    if(selected)return {...selected,label:selected.label.toUpperCase()};
    return make('Let’s find the right part of the story','I don’t have a documented answer to that question. I can help with Kira Labs, Kira World, Robert’s entertainment credits, books and AI work—or create a short factual bio. For details beyond those notes, email Robert directly.',['about'],['Write a mini bio of Robert','Tell me about his books','What works today?']);
  }
  
  function fitChunks(reply){
    $('answer-body').replaceChildren();$('answer-label').textContent=reply.label||'FROM THE PUBLISHED NOTES';$('answer-title').textContent=reply.title;
    const container=document.querySelector('.sarah-answer'),heading=document.querySelector('.answer-heading'),title=$('answer-title');
    const style=getComputedStyle(container);const gap=parseFloat(style.rowGap)||0;
    const headingHeight=heading.getBoundingClientRect().height;
    const available=Math.max(30,container.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-headingHeight-title.getBoundingClientRect().height-gap*(headingHeight?2:1)-4);
    const paragraph=document.createElement('p');$('answer-body').replaceChildren(paragraph);
    const words=reply.answer.split(/\s+/),result=[];let index=0;
    while(index<words.length){let low=1,high=words.length-index,best=1;while(low<=high){const mid=Math.floor((low+high)/2);paragraph.textContent=words.slice(index,index+mid).join(' ');if(paragraph.getBoundingClientRect().height<=available){best=mid;low=mid+1;}else high=mid-1;}result.push(words.slice(index,index+best).join(' '));index+=best;}
    return result;
  }

  function rebuildPages(goLast=false){
    const old=pages[pageIndex];
    pages=exchanges.flatMap((e,i)=>fitChunks(e.reply).map((text,n,all)=>({exchange:i,part:n,parts:all.length,text})));
    pageIndex=goLast?Math.max(0,pages.findIndex(p=>p.exchange===exchanges.length-1)):Math.max(0,pages.findIndex(p=>p.exchange===old?.exchange&&p.part===old?.part));
    render();
  }
  function setLinks(ids){$('answer-sources').replaceChildren();for(const id of [...new Set(ids)].slice(0,3)){const s=knowledge.sources[id];if(!s)continue;const a=document.createElement('a');a.textContent=s.label+' ↗';a.href=s.url;if(/^https:\/\//.test(s.url)){a.target='_blank';a.rel='noopener noreferrer';}$('answer-sources').append(a);}}
  function render(){
    const p=pages[pageIndex];if(!p)return;const entry=exchanges[p.exchange],r=entry.reply;
    $('asked-question').hidden=!entry.question;$('asked-question').textContent=entry.question;$('asked-question').title=entry.question;
    $('answer-label').textContent=r.label||'FROM THE PUBLISHED NOTES';$('answer-title').textContent=r.title;
    const paragraph=document.createElement('p');paragraph.textContent=p.text;$('answer-body').replaceChildren(paragraph);
    $('answer-page').textContent=p.parts>1?`Part ${p.part+1} of ${p.parts}`:exchanges.length>1?`Reply ${p.exchange+1} of ${exchanges.length}`:'';
    $('previous-answer').disabled=pageIndex===0;$('next-answer').disabled=pageIndex===pages.length-1;
    $('copy-answer').disabled=false;$('related-questions').replaceChildren();for(const suggestion of (r.next||[]).slice(0,3)){const b=document.createElement('button');b.type='button';b.dataset.prompt=suggestion;b.textContent=suggestion;$('related-questions').append(b);}setLinks(r.sources||[]);
  }
  function send(question){if(!knowledge||loading)return;const q=question.trim();if(!q)return;const r=answer(q);lastTopic=r.id||lastTopic;exchanges.push({question:q,reply:r});$('asked-question').hidden=false;$('asked-question').textContent=q;rebuildPages(true);$('question').value='';$('guide-status').textContent='Ready for your next question';}
  async function loadKnowledge(){if(loading)return;loading=true;$('send-question').disabled=true;$('guide-status').textContent='Checking the published notes…';
    try{const response=await fetch('sarah-knowledge.json',{cache:'no-store'});if(!response.ok)throw Error('notes unavailable');const next=await response.json();if(next.schema_version!==1||!Array.isArray(next.topics)||!next.bio||!next.sources)throw Error('notes invalid');knowledge=next;const date=new Date(next.updated_at+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});$('knowledge-date').textContent='Notes updated '+date;$('guide-status').textContent='Here to help · answers from published notes';$('send-question').disabled=false;
    }catch(e){$('guide-status').textContent=knowledge?'Update unavailable · using notes already loaded':'Notes could not load. Try Check updates.';$('send-question').disabled=!knowledge;}
    finally{loading=false;}
  }
  $('sarah-form').addEventListener('submit',e=>{e.preventDefault();send($('question').value);});
  $('question').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send($('question').value);}});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-prompt]');if(b)send(b.dataset.prompt);});
  $('previous-answer').onclick=()=>{if(pageIndex>0){pageIndex--;render();}};$('next-answer').onclick=()=>{if(pageIndex<pages.length-1){pageIndex++;render();}};
  $('refresh-notes').onclick=loadKnowledge;
  $('open-profiles').onclick=()=>$('profiles-dialog').showModal();
  $('close-profiles').onclick=()=>$('profiles-dialog').close();
  $('clear-chat').onclick=()=>{exchanges=[];pages=[];pageIndex=0;lastTopic='';send('Hello');$('asked-question').hidden=true;};
  $('copy-answer').onclick=async()=>{const p=pages[pageIndex];if(!p)return;const r=exchanges[p.exchange].reply;try{await navigator.clipboard.writeText(r.answer);$('guide-status').textContent='Complete answer copied';}catch{const textarea=document.createElement('textarea');textarea.value=r.answer;document.body.append(textarea);textarea.select();const ok=document.execCommand('copy');textarea.remove();$('guide-status').textContent=ok?'Complete answer copied':'Select the answer text to copy it';}};
  let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>rebuildPages(),100);});
  loadKnowledge();
})();
