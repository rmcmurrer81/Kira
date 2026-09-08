(() => {
  'use strict';
  const $=id=>document.getElementById(id), labels={completed:'Completed',working:'Working on',next:'Next goal'};
  let data=null,visible=[],selected='',filter='all';
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=()=>window.matchMedia('(max-width: 650px)').matches;
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  function safeLink(value){if(typeof value!=='string')return null;try{const u=new URL(value,location.href);return (u.protocol==='https:'||(u.origin===location.origin&&/^https?:$/.test(u.protocol))||(u.protocol==='mailto:'&&u.pathname==='rmcmurrer@kiralabs.org'))?u.href:null;}catch{return null;}}
  function link(row){const a=el('a',row.label+' ↗');a.href=safeLink(row.url);if(new URL(a.href).protocol==='https:'&&new URL(a.href).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}return a;}
  function dateLabel(row){return row.date?new Date(row.date+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}):row.status==='next'?'Next':'Now';}
  function currentIndex(){return Math.max(0,visible.findIndex(x=>x.id===selected));}
  function validate(next){
    if(next.schema_version!==1||!Array.isArray(next.milestones)||!next.milestones.length||!next.hardware)throw Error('Timeline data is incomplete');
    const ids=new Set();for(const r of next.milestones){
      if(!r.id||ids.has(r.id)||!labels[r.status]||!r.title||!r.summary||!r.image||!/^assets\/[a-z0-9_.-]+$/i.test(r.image.path))throw Error('Invalid milestone');ids.add(r.id);
      if(r.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date))))throw Error('Invalid date');
      if(r.status==='next'&&r.date)throw Error('Future goals cannot have promised dates');
      if(!r.date_basis||!Array.isArray(r.body)||!Array.isArray(r.sources)||r.sources.some(s=>!safeLink(s.url)))throw Error('Missing source details');
      if(r.video&&!/^[A-Za-z0-9_-]{11}$/.test(r.video.id))throw Error('Invalid video');
    }
  }
  function drawTimeline(){
    const list=$('milestones');list.replaceChildren();const svg=$('connections');svg.replaceChildren();
    const width=Math.max(920,visible.length*182+30);$('constellation').style.width=width+'px';svg.setAttribute('viewBox',`0 0 ${width} 376`);
    const points=visible.map((r,i)=>({x:103+i*182,y:[145,245,125,225,155,250][i%6]}));
    if(points.length>1){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('class','connection-path');path.setAttribute('d',points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' '));svg.append(path);}
    visible.forEach((r,i)=>{
      const li=el('li'),p=points[i];li.style.setProperty('--x',p.x+'px');li.style.setProperty('--y',p.y+'px');
      const b=el('button',undefined,'milestone-point');b.type='button';b.dataset.id=r.id;b.dataset.status=r.status;b.setAttribute('aria-controls','milestone-detail');b.setAttribute('aria-pressed',String(r.id===selected));b.setAttribute('aria-label',`${dateLabel(r)}. ${r.title}. ${labels[r.status]}.`);
      const img=el('img',undefined,'point-image');img.src=r.image.path;img.alt='';img.loading='lazy';img.width=158;img.height=62;b.append(img);
      const copy=el('span',undefined,'point-copy');copy.append(el('span',dateLabel(r),'point-date'),el('span',r.title,'point-title'),el('span',r.track,'point-track'));b.append(copy);b.addEventListener('click',()=>select(r.id,true));
      b.addEventListener('keydown',e=>{let index=i;if(['ArrowRight','ArrowDown'].includes(e.key))index=Math.min(i+1,visible.length-1);else if(['ArrowLeft','ArrowUp'].includes(e.key))index=Math.max(i-1,0);else if(e.key==='Home')index=0;else if(e.key==='End')index=visible.length-1;else return;e.preventDefault();select(visible[index].id,true);list.children[index].querySelector('button').focus({preventScroll:true});});
      li.append(b);list.append(li);
    });
    $('visible-count').textContent=`${visible.length} ${visible.length===1?'milestone':'milestones'}`;
    $('milestone-slider').max=String(Math.max(0,visible.length-1));$('milestone-slider').disabled=visible.length<2;
    $('range-start').textContent=visible[0]?dateLabel(visible[0]):'';$('range-end').textContent=visible.length?dateLabel(visible[visible.length-1]):'';
  }
  function bringIntoView(){const i=currentIndex(),li=$('milestones').children[i];if(!li)return;const scroll=$('timeline-scroll');if(mobile()){scroll.scrollTo({top:Math.max(0,li.offsetTop-scroll.clientHeight/2+li.offsetHeight/2),behavior:reduced()?'auto':'smooth'});}else{scroll.scrollTo({left:Math.max(0,103+i*182-scroll.clientWidth/2),behavior:reduced()?'auto':'smooth'});}}
  function showVideo(r){const area=$('video-area');area.replaceChildren();if(!r.video)return;const card=el('div',undefined,'video-card');card.append(el('p',r.video.title,'video-title'));
    const actions=el('div',undefined,'video-actions'),watch=el('button','▷  Watch video');watch.type='button';const external=link({label:'Open on YouTube',url:'https://www.youtube.com/watch?v='+r.video.id});actions.append(watch,external);card.append(actions,el('p','The YouTube player loads only when you choose Watch. It will not autoplay.'));
    watch.addEventListener('click',()=>{if(card.querySelector('iframe'))return;const frame=el('iframe',undefined,'video-frame');frame.src='https://www.youtube-nocookie.com/embed/'+r.video.id+'?autoplay=0&rel=0';frame.title=r.video.title;frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';card.append(frame);watch.disabled=true;watch.textContent='Video player loaded';});area.append(card);
  }
  function select(id,announce=false){const r=visible.find(x=>x.id===id);if(!r)return;selected=id;const index=currentIndex();for(const b of $('milestones').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.id===id));
    $('milestone-slider').value=String(index);$('milestone-slider').setAttribute('aria-valuetext',`${index+1} of ${visible.length}: ${r.title}`);$('selected-position').textContent=`${index+1} / ${visible.length}`;$('previous-milestone').disabled=index===0;$('next-milestone').disabled=index===visible.length-1;
    $('detail-status').textContent=labels[r.status];$('detail-status').dataset.status=r.status;$('detail-date').textContent=r.date?'Published '+dateLabel(r):r.date_basis;$('detail-track').textContent=r.track;$('detail-title').textContent=r.title;$('detail-summary').textContent=r.summary;
    $('detail-body').replaceChildren(...r.body.map(p=>el('p',p)));$('boundary-label').textContent=r.status==='next'?'The next boundary':'What this establishes';$('detail-boundary').textContent=r.boundary;
    $('detail-image').src=r.image.path;$('detail-image').alt=r.image.alt;$('image-caption').textContent=r.image.caption;$('detail-sources').replaceChildren(...r.sources.map(link));showVideo(r);$('milestone-detail').hidden=false;
    if(announce)$('load-status').textContent=`Selected: ${r.title}. Full details below the timeline.`;
    if(announce)history.replaceState(null,'','#'+encodeURIComponent(id));bringIntoView();
  }
  function applyFilter(next){filter=next;visible=data.milestones.filter(r=>filter==='all'||r.status===filter);for(const b of document.querySelectorAll('[data-filter]'))b.setAttribute('aria-pressed',String(b.dataset.filter===filter));if(!visible.some(r=>r.id===selected))selected=visible[0]?.id||'';drawTimeline();select(selected,true);}
  function hardware(){const h=data.hardware;$('hardware-specs').replaceChildren(...h.specs.map(s=>{const row=el('div'),value=el('dd',s.value);if(s.note)value.append(el('small',s.note));row.append(el('dt',s.label),value);return row;}));$('hardware-date').textContent=h.note;$('hardware-sources').replaceChildren(...h.sources.filter(s=>safeLink(s.url)).map(link));
    $('hardware-goals').replaceChildren(...h.goals.map(g=>{const card=el('article',undefined,'upgrade-card');card.append(el('span',g.priority,'priority'),el('h4',g.title),el('p',g.target,'goal-target'),el('p',g.reason),el('p',g.caution));if(g.sources?.length){const sources=el('div',undefined,'need-links');g.sources.filter(s=>safeLink(s.url)).forEach(s=>sources.append(link(s)));card.append(sources);}card.append(el('p','Have spare hardware or want to invest?','need-invitation'));const email=el('a','rmcmurrer@kiralabs.org ↗','email-need');email.href='mailto:rmcmurrer@kiralabs.org?subject='+encodeURIComponent(g.email_subject);email.setAttribute('aria-label','Email Robert about '+g.title);card.append(email);return card;}));
  }
  async function load(){try{const response=await fetch('progress-data.json',{cache:'no-store'});if(!response.ok)throw Error('Notes unavailable');const next=await response.json();validate(next);data=next;hardware();$('reviewed-date').textContent='Notes reviewed '+new Date(data.reviewed_on+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});for(const n of document.querySelectorAll('[data-count]'))n.textContent=String(data.milestones.filter(r=>n.dataset.count==='all'||r.status===n.dataset.count).length);
      let requested='';try{requested=decodeURIComponent(location.hash.slice(1));}catch{}selected=data.milestones.some(r=>r.id===requested)?requested:data.default_id;visible=data.milestones.slice();drawTimeline();select(selected);if(requested==='hardware')requestAnimationFrame(()=>$('hardware').scrollIntoView({behavior:'auto',block:'start'}));$('load-status').textContent='';for(const b of document.querySelectorAll('[data-filter]'))b.addEventListener('click',()=>applyFilter(b.dataset.filter));$('milestone-slider').addEventListener('input',e=>select(visible[Number(e.target.value)].id,true));$('previous-milestone').addEventListener('click',()=>select(visible[Math.max(0,currentIndex()-1)].id,true));$('next-milestone').addEventListener('click',()=>select(visible[Math.min(visible.length-1,currentIndex()+1)].id,true));
    }catch(e){$('load-status').replaceChildren(el('span','The journal could not load. '),link({label:'Read the project notes',url:'projects.html'}));}}
  load();
})();
