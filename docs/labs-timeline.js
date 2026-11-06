/* Picture timeline: chronological constellation, selected details below.
   Uses the existing lab-wide record; no network calls or generated dates. */
(() => {
  'use strict';
  const data=window.KIRA_LABS_TIMELINE;
  const root=document.getElementById('timeline-explorer');
  if(!root||!data?.milestones?.length)return;
  const $=id=>document.getElementById(id);
  const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const currentURL=()=>new URL(window.__PREVIEW_URL||location.href,'https://kiralabs.org/');
  const initial=currentURL();
  let project=data.projects.includes(initial.searchParams.get('project'))?initial.searchParams.get('project'):'all';
  const groups={released:'completed',demo:'completed',prototype:'completed',development:'working',future:'next'};
  let filter=['all','completed','working','next'].includes(initial.searchParams.get('status'))?initial.searchParams.get('status'):(groups[initial.searchParams.get('status')]||'all');
  let selected='';try{selected=decodeURIComponent(initial.hash.slice(1));}catch{}
  if(!data.milestones.some(m=>m.id===selected))selected='shiftbrief-010';
  let visible=[],debounce;
  // Autoplay is purely a visual tour of already reviewed records: no new research claims.
  const STEP=228, OFFSET=118, SPEED_PX_PER_SECOND=68;
  const rail=$('timeline-scroll'),tourButton=$('journey-autoplay'),tourRestart=$('journey-restart');
  const motionStatus=$('journey-motion-status'),journeyFill=$('journey-progress-fill');
  let tourActive=false,frameId=0,lastTick=0,autoSelected=-1;
  let hasDeepLink=false;
  try{hasDeepLink=Boolean(initial.hash&&data.milestones.some(m=>m.id===decodeURIComponent(initial.hash.slice(1))));}catch{hasDeepLink=false;}

  const safeURL=value=>{try{const u=new URL(value,'https://kiralabs.org/');return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u:null;}catch{return null;}};
  const imageURL=m=>/^assets\/[a-z0-9._-]+$/i.test(m.image?.path||'')?'https://kiralabs.org/'+m.image.path:'';
  const label=m=>m.date?new Date(m.date+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}):m.status==='future'?'Next':'Now';
  const link=(text,href)=>{const a=make('a',text);const u=safeURL(href);a.href=u?(u.origin==='https://kiralabs.org'?u.pathname.replace(/^\//,'')+u.search+u.hash:u.href):'knowledge.html';if(u&&u.origin!=='https://kiralabs.org'){a.target='_blank';a.rel='noopener noreferrer';}return a;};
  function writeURL(){
    const u=currentURL();if(project==='all')u.searchParams.delete('project');else u.searchParams.set('project',project);
    if(filter==='all')u.searchParams.delete('status');else u.searchParams.set('status',filter);u.hash=selected;
    if(window.KIRA_LABS_PREVIEW){window.__PREVIEW_URL=u.href;parent.postMessage({kind:'kl-preview-state',route:u.pathname.slice(1)+u.search+u.hash},'*');}
    else try{history.replaceState(null,'',u.pathname+u.search+u.hash);}catch{}
  }
  function centerSelected(smooth=true){
    const i=visible.findIndex(m=>m.id===selected);if(i<0)return;
    const scroll=rail;const x=OFFSET+i*STEP;
    scroll.scrollTo({left:Math.max(0,x-scroll.clientWidth/2),behavior:smooth&&!reduced()?'smooth':'auto'});
  }
  function showVideo(m){
    const host=$('video-area');
    if(window.KiraVideo)window.KiraVideo.clear(host);
    host.replaceChildren();

    if(m.playlist&&/^[A-Za-z0-9_-]+$/.test(m.playlist.id)&&/^[A-Za-z0-9_-]{11}$/.test(m.playlist.lead_video)){
      const card=make('section',undefined,'timeline-playlist-card');
      const preview=make('button',undefined,'timeline-playlist-preview');preview.type='button';preview.setAttribute('aria-label','Play '+m.playlist.title+' playlist');
      const kicker=make('span',m.playlist.eyebrow,'timeline-playlist-kicker');
      const coverTitle=make('strong',m.playlist.cover_title,'timeline-playlist-cover-title');
      const coverEm=make('em',m.playlist.cover_emphasis,'timeline-playlist-cover-emphasis');
      const bottom=make('span',undefined,'timeline-playlist-bottom');bottom.append(make('span',m.playlist.cover_bottom),make('span','▶','timeline-playlist-play'));
      preview.append(kicker,coverTitle,coverEm,bottom);
      const copy=make('div',undefined,'timeline-playlist-copy');copy.append(make('p',m.playlist.eyebrow,'timeline-playlist-eyebrow'),make('h3',m.playlist.title),make('p',m.playlist.description));
      const open=link(m.playlist.open_label,'https://www.youtube.com/watch?v='+m.playlist.lead_video+'&list='+m.playlist.id);open.className='timeline-playlist-open';copy.append(open);
      const details=document.createElement('details');details.className='timeline-playlist-episodes';const summary=document.createElement('summary');summary.textContent=m.playlist.episodes_label;details.append(summary);const p=make('p','The playlist opens with the newest NewBrain research update and can grow as new experiments are published.');details.append(p);copy.append(details);
      const frameWrap=make('div',undefined,'timeline-playlist-frame');frameWrap.hidden=true;
      preview.addEventListener('click',()=>{if(frameWrap.querySelector('iframe'))return;const frame=make('iframe');frame.src='https://www.youtube-nocookie.com/embed/videoseries?list='+m.playlist.id+'&rel=0';frame.title=m.playlist.title;frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frameWrap.append(frame);frameWrap.hidden=false;preview.hidden=true;});
      card.append(preview,copy,frameWrap);host.append(card);return;
    }

    if(window.KiraVideo){
      if(m.video)window.KiraVideo.mount(host,{id:m.video.id,title:m.video.title,fallbackPoster:imageURL(m)});
    }else if(m.video&&/^[a-zA-Z0-9_-]{11}$/.test(m.video.id)){
      host.append(link('Watch on YouTube ↗','https://www.youtube.com/watch?v='+m.video.id));
    }
  }
  $('detail-image').addEventListener('load',()=>{$('detail-image').hidden=false;$('timeline-image-error').hidden=true;});
  $('detail-image').addEventListener('error',()=>{$('detail-image').hidden=true;$('timeline-image-error').hidden=false;});
  function select(id,announce=true,center=true,automatic=false){
    const m=visible.find(x=>x.id===id);if(!m)return;selected=id;
    const i=visible.indexOf(m);
    root.querySelectorAll('.milestone-point').forEach(b=>{const on=b.dataset.id===id;b.setAttribute('aria-pressed',String(on));b.tabIndex=on?0:-1;});
    $('milestone-slider').value=String(i);$('milestone-slider').setAttribute('aria-valuetext',`${i+1} of ${visible.length}: ${m.title}`);$('milestone-slider').style.setProperty('--progress',`${visible.length>1?i/(visible.length-1)*100:0}%`);
    $('selected-position').textContent=`${i+1} / ${visible.length}`;
    $('journey-current-title').textContent=label(m)+' · '+m.title;
    $('previous-milestone').disabled=i===0;$('next-milestone').disabled=i===visible.length-1;
    const badge=$('detail-status');badge.textContent=data.statuses[m.status];badge.className='pill '+m.status;
    $('detail-date').textContent=m.date?label(m):m.status==='future'?'No date set':'Snapshot reviewed '+m.reviewed_on;
    $('detail-track').textContent=m.project+(m.track!==m.project?' / '+m.track:'');
    $('detail-title').textContent=m.title;$('detail-summary').textContent=m.summary;
    const paragraphs=Array.isArray(m.body)?m.body:String(m.body||'').split(/\n\n+/);$('detail-body').replaceChildren(...paragraphs.filter(Boolean).map(p=>make('p',p)));
    $('detail-boundary').textContent=m.boundary;
    const image=$('detail-image');image.hidden=false;image.style.visibility='visible';$('timeline-image-error').hidden=true;image.src=imageURL(m);image.alt=m.image.alt;image.dataset.mediaLabel=m.image.label;
    $('detail-image-link').href=imageURL(m);$('image-label').textContent=m.image.label;$('image-caption').textContent=m.image.caption;
    $('detail-sources').replaceChildren(...m.sources.map(s=>link(s.label+(s.url.startsWith('http')?' ↗':' →'),s.url)),link(m.project==='Lab & website'?'Meet the founder →':'Explore '+m.project+' →',m.project_page));
    showVideo(m);$('milestone-detail').hidden=false;
    if(!automatic)$('load-status').textContent='Selected: '+m.title+'. Full details below the timeline.';
    if(announce)writeURL();if(center)centerSelected(announce);
  }
  function draw(){
    const list=$('milestones'),svg=$('connections');list.replaceChildren();svg.replaceChildren();
    const width=Math.max(rail.clientWidth,visible.length*STEP+40);$('constellation').style.width=width+'px';svg.setAttribute('viewBox',`0 0 ${width} 445`);
    const points=visible.map((m,i)=>({x:OFFSET+i*STEP,y:[164,258,142,252,174,267][i%6]}));
    if(points.length>1){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',points.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' '));path.setAttribute('class','connection-path');svg.append(path);}
    visible.forEach((m,i)=>{
      const li=make('li');li.style.setProperty('--x',points[i].x+'px');li.style.setProperty('--y',points[i].y+'px');
      const b=make('button',undefined,'milestone-point');b.type='button';b.dataset.id=m.id;b.dataset.status=groups[m.status];b.setAttribute('aria-controls','milestone-detail');b.setAttribute('aria-pressed',String(m.id===selected));b.setAttribute('aria-label',`${label(m)}. ${m.title}. ${data.statuses[m.status]}. Details below.`);
      const img=make('img',undefined,'point-image');img.src=imageURL(m);img.alt='';img.width=160;img.height=64;img.loading='lazy';
      const copy=make('span',undefined,'point-copy');copy.append(make('span',label(m),'point-date'),make('span',m.title,'point-title'),make('span',m.project,'point-track'));
      b.append(img,copy);b.addEventListener('click',()=>select(m.id));
      b.addEventListener('keydown',e=>{
        let next=i;if(['ArrowRight','ArrowDown'].includes(e.key))next=Math.min(i+1,visible.length-1);else if(['ArrowLeft','ArrowUp'].includes(e.key))next=Math.max(i-1,0);else if(e.key==='Home')next=0;else if(e.key==='End')next=visible.length-1;else return;
        e.preventDefault();select(visible[next].id);list.children[next].querySelector('button').focus({preventScroll:true});
      });li.append(b);list.append(li);
    });
    $('visible-count').textContent=`${visible.length} ${visible.length===1?'milestone':'milestones'}`;
    $('milestone-slider').max=String(Math.max(0,visible.length-1));$('milestone-slider').disabled=visible.length<2;
    $('range-start').textContent=visible[0]?label(visible[0]):'';$('range-end').textContent=visible.length?label(visible.at(-1)):'';
    const empty=!visible.length;$('timeline-scroll').hidden=empty;$('empty-timeline').hidden=!empty;
    if(empty){if(window.KiraVideo)window.KiraVideo.clear($('video-area'));$('milestone-detail').hidden=true;$('previous-milestone').disabled=true;$('next-milestone').disabled=true;$('selected-position').textContent='0 / 0';$('journey-current-title').textContent='No matching milestones';$('load-status').textContent='No results. Your other milestones have not been removed.';}
  }
  function render(announce=true){
    const tokens=$('timeline-search').value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const candidates=data.milestones.filter(m=>(project==='all'||m.project===project)&&tokens.every(t=>[m.title,m.summary,m.body,m.track,m.project].join(' ').toLowerCase().includes(t)));
    root.querySelectorAll('[data-count]').forEach(n=>n.textContent=String(candidates.filter(m=>n.dataset.count==='all'||groups[m.status]===n.dataset.count).length));
    visible=candidates.filter(m=>filter==='all'||groups[m.status]===filter);
    visible.sort((a,b)=>{if(Boolean(a.date)!==Boolean(b.date))return a.date?-1:1;if(a.date&&b.date)return $('timeline-sort').value==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date);return (a.status==='future'?1:0)-(b.status==='future'?1:0);});
    if(!visible.some(m=>m.id===selected)){const actual=visible.filter(m=>m.date&&m.status!=='future');selected=(actual.length?($('timeline-sort').value==='newest'?actual[0]:actual[actual.length-1]):visible[0])?.id||'';}
    root.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
    root.querySelectorAll('[data-project]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.project===project)));
    draw();if(selected)select(selected,announce);else if(announce)writeURL();
  }
  root.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;render();}));
  root.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>{project=b.dataset.project;render();}));
  $('timeline-search').addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(()=>render(),130);});$('timeline-sort').addEventListener('change',()=>render());
  $('milestone-slider').addEventListener('input',e=>{const m=visible[Number(e.target.value)];if(m)select(m.id);});
  for(const [id,direction] of [['previous-milestone',-1],['next-milestone',1]])$(id).addEventListener('click',()=>{const i=visible.findIndex(m=>m.id===selected);if(visible[i+direction])select(visible[i+direction].id);});
  window.addEventListener('hashchange',()=>{stopTour('Paused for navigation');let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const m=data.milestones.find(m=>m.id===id);if(!m)return;selected=id;if(!visible.some(m=>m.id===id)){project='all';filter='all';$('timeline-search').value='';}render(false);});
  // Re-centering affects the picture rail, never the visitor's vertical reading position.
  if(window.ResizeObserver){let first=true;new ResizeObserver(()=>{if(first){first=false;return;}if(!tourActive)centerSelected(false);}).observe(rail);}
  function maxJourneyScroll(){return Math.max(0,rail.scrollWidth-rail.clientWidth);}
  function paintJourneyProgress(){
    const max=maxJourneyScroll();
    const ratio=max?Math.min(1,Math.max(0,rail.scrollLeft/max)):0;
    journeyFill.style.transform='scaleX('+ratio.toFixed(5)+')';
  }
  function displayTourState(message){
    root.closest('main')?.querySelector('.constellation-shell')?.setAttribute('data-playing',String(tourActive));
    tourButton.setAttribute('aria-pressed',String(tourActive));
    tourButton.textContent=tourActive?'Ⅱ Pause journey':'▶ Play journey';
    tourButton.setAttribute('aria-label',tourActive?'Pause automatic timeline':'Play automatic timeline from the current position');
    motionStatus.textContent=message||(tourActive?'Auto journey playing':'Journey paused');
    tourButton.disabled=reduced()||visible.length<2;
    tourButton.title=reduced()?'Automatic motion is disabled by your reduced-motion preference':'';
    paintJourneyProgress();
  }
  function stopTour(reason='Journey paused'){
    if(frameId)cancelAnimationFrame(frameId);
    frameId=0;lastTick=0;tourActive=false;
    displayTourState(reason);
  }
  function onJourneyFrame(time){
    if(!tourActive)return;
    if(reduced()){stopTour('Motion disabled by your accessibility setting');return;}
    if(!lastTick)lastTick=time;
    const dt=Math.min(Math.max(0,time-lastTick),100)/1000;
    lastTick=time;
    const max=maxJourneyScroll();
    if(max<=0){stopTour('Journey fits in the visible area');return;}
    rail.scrollLeft=Math.min(max,rail.scrollLeft+SPEED_PX_PER_SECOND*dt);
    // Follow the leading visible card, not the middle of the viewport.
    const cursor=rail.scrollLeft+Math.min(OFFSET,rail.clientWidth*.23);
    const index=Math.max(0,Math.min(visible.length-1,Math.round((cursor-OFFSET)/STEP)));
    if(index!==autoSelected&&visible[index]){
      autoSelected=index;
      select(visible[index].id,false,false,true);
    }
    paintJourneyProgress();
    if(rail.scrollLeft>=max-.6){
      if(visible.at(-1))select(visible.at(-1).id,false,false,true);
      stopTour('Journey complete · choose Play to start again');
      return;
    }
    frameId=requestAnimationFrame(onJourneyFrame);
  }
  function startTour(fromBeginning=false){
    if(reduced()){stopTour('Automatic movement is off for reduced motion');return;}
    if(visible.length<2){stopTour('Select more than one milestone to play');return;}
    if(frameId)cancelAnimationFrame(frameId);
    const max=maxJourneyScroll();
    if(fromBeginning||rail.scrollLeft>=max-1){
      rail.scrollTo({left:0,behavior:'instant'});
      if(visible[0])select(visible[0].id,false,false,true);
    }
    tourActive=true;lastTick=0;autoSelected=visible.findIndex(m=>m.id===selected);
    displayTourState('Auto journey playing · click to pause');
    frameId=requestAnimationFrame(onJourneyFrame);
  }
  // Every deliberate visitor interaction ends automatic motion. The play control is
  // intentionally exempt so the visitor can pause and resume with the same button.
  document.addEventListener('pointerdown',event=>{
    if(!tourActive||event.target.closest('#journey-autoplay'))return;
    stopTour('Paused for your selection');
  },{capture:true,passive:true});
  document.addEventListener('keydown',event=>{
    if(!tourActive||event.target?.id==='journey-autoplay'&&['Enter',' '].includes(event.key))return;
    stopTour('Paused for keyboard navigation');
  },{capture:true});
  document.addEventListener('wheel',()=>{if(tourActive)stopTour('Paused for scrolling');},{capture:true,passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&tourActive)stopTour('Paused while the tab is hidden');});
  root.addEventListener('focusin',event=>{if(tourActive&&event.target!==tourButton)stopTour('Paused for keyboard focus');});
  rail.addEventListener('scroll',()=>{if(!tourActive)paintJourneyProgress();},{passive:true});
  tourButton.addEventListener('click',()=>{
    if(tourActive)stopTour('Paused by you');
    else startTour();
  });
  tourRestart.addEventListener('click',()=>{
    stopTour('Restarted at the beginning · press Play to continue');
    if(visible[0]){
      select(visible[0].id,true,false);
      rail.scrollTo({left:0,behavior:'instant'});
      paintJourneyProgress();
    }
  });
  const accessibilityMotion=matchMedia('(prefers-reduced-motion: reduce)');
  accessibilityMotion.addEventListener?.('change',()=>{
    if(accessibilityMotion.matches)stopTour('Motion disabled by your accessibility setting');
    else displayTourState('Journey paused · press Play when ready');
  });
  window.addEventListener('pagehide',()=>{
    stopTour('Journey paused');
    if(window.KiraVideo)window.KiraVideo.clear($('video-area'));
  });
  try{
    $('journey-total').textContent=String(data.milestones.length);
    $('journey-projects').textContent=String(data.projects.length);
    render(false);
    root.dataset.ready='true';
    const initiallyLinked=hasDeepLink;
    if(!initiallyLinked&&visible.length){
      select(visible[0].id,false,false,true);
      rail.scrollTo({left:0,behavior:'instant'});
    }
    displayTourState(reduced()?'Manual journey · reduced motion enabled':'Journey ready');
    if(!initiallyLinked&&!reduced())startTour(true);
  }catch(e){
    stopTour('Journey unavailable · use the milestone controls');
    $('load-status').textContent='The picture controls could not load. Read the development updates below instead.';
    console.error('Timeline:',e);
  }
})();
