/* Iris messenger presentation: UI only. The verified Sarah/Iris answer engine remains unchanged. */
(()=>{
  'use strict';
  const card=document.querySelector('.kb-contact-iris-card');
  const feed=document.getElementById('iris-chat-transcript');
  const messages=document.getElementById('iris-chat-messages');
  const send=document.getElementById('send-question');
  const clear=document.getElementById('clear-chat');
  const qEl=document.getElementById('asked-question');
  const titleEl=document.getElementById('answer-title');
  const bodyEl=document.getElementById('answer-body');
  const pageEl=document.getElementById('answer-page');
  const sourceEl=document.getElementById('answer-sources');
  if(!card||!feed||!messages||!send||!clear||!qEl||!titleEl||!bodyEl||!pageEl||!sourceEl)return;

  let enhanced=false;
  let seenCount=0;
  let scheduled=false;
  function scrollToLatest(){feed.scrollTop=feed.scrollHeight;}
  function addWelcome(){
    const row=document.createElement('div');row.className='iris-chat-row from-iris';
    const icon=document.createElement('span');icon.className='iris-chat-avatar';icon.setAttribute('aria-hidden','true');icon.textContent='I';
    const bubble=document.createElement('div');bubble.className='iris-chat-bubble';
    const name=document.createElement('span');name.className='iris-chat-sender';name.textContent='Iris · Kira Labs guide';
    const greeting=document.createElement('p');greeting.textContent='Hi! I can help you explore Kira Labs, NewBrain, Kira World, Robert’s work, and the latest published results. What would you like to know?';
    bubble.append(name,greeting);row.append(icon,bubble);messages.append(row);
  }
  function enable(){
    if(enhanced||send.disabled)return;
    enhanced=true;
    feed.hidden=false;
    card.classList.add('iris-chat-enhanced');
    addWelcome();
  }
  function validSource(link){
    try{
      const url=new URL(link.getAttribute('href')||'',location.href);
      return url.protocol==='https:'||(url.protocol==='http:'&&url.origin===location.origin);
    }catch{return false;}
  }
  function addMessage(side,text,title,links){
    const row=document.createElement('div');
    row.className='iris-chat-row '+(side==='visitor'?'from-visitor':'from-iris');
    if(side==='iris'){
      const icon=document.createElement('span');icon.className='iris-chat-avatar';icon.setAttribute('aria-hidden','true');icon.textContent='I';row.append(icon);
    }
    const bubble=document.createElement('div');bubble.className='iris-chat-bubble';
    if(side==='iris'){
      const sender=document.createElement('span');sender.className='iris-chat-sender';sender.textContent='Iris · Published knowledge';bubble.append(sender);
      if(title){const heading=document.createElement('strong');heading.className='iris-chat-answer-title';heading.textContent=title;bubble.append(heading);}
    }else{
      const who=document.createElement('span');who.className='iris-chat-sender';who.textContent='You';bubble.append(who);
    }
    const p=document.createElement('p');p.textContent=text;bubble.append(p);
    if(side==='iris'&&links.length){
      const sources=document.createElement('div');sources.className='iris-chat-bubble-sources';
      const label=document.createElement('span');label.textContent='Sources';sources.append(label);
      for(const link of links.slice(0,3)){
        if(!validSource(link))continue;
        const a=document.createElement('a');a.href=link.href;a.textContent=link.textContent.trim();
        if(a.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}
        sources.append(a);
      }
      if(sources.querySelector('a'))bubble.append(sources);
    }
    row.append(bubble);messages.append(row);
  }
  function sync(){
    if(!enhanced)enable();
    if(!enhanced)return;
    const question=qEl.textContent.trim();
    const answer=bodyEl.textContent.trim();
    const title=titleEl.textContent.trim();
    if(!answer||!question||title==='What would you like to know?')return;
    const match=/Reply\s+(\d+)\s+of\s+(\d+)/i.exec(pageEl.textContent);
    const current=match?Number(match[1]):1;
    const count=match?Number(match[2]):1;
    if(!Number.isSafeInteger(count)||count<1||count<=seenCount||current!==count)return;
    // The original engine sends an internal Hello on New Chat; don't pose it as a visitor question.
    if(qEl.hidden&&question.toLowerCase()==='hello'){seenCount=count;return;}
    addMessage('visitor',question,'',[]);
    addMessage('iris',answer,title,Array.from(sourceEl.querySelectorAll('a')));
    seenCount=count;
    scrollToLatest();
  }
  function queueSync(){
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;sync();});
  }
  clear.addEventListener('click',()=>{
    if(!enhanced)return;
    seenCount=0;messages.replaceChildren();addWelcome();scrollToLatest();
  },{capture:true});
  // Observe the original answer renderer instead of replacing its verified knowledge or routing.
  new MutationObserver(queueSync).observe(card,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','hidden']});
  queueSync();
})();