
(()=>{'use strict';
document.querySelectorAll('a').forEach(a=>{if(a.textContent?.includes('View all proposals'))a.remove()});
const hero=document.querySelector('section.hero');if(!hero)return;
document.querySelector('.review-ribbon')?.setAttribute('hidden','');
const header=document.querySelector('.site-header'),nav=document.querySelector('.site-nav');
if(nav){nav.innerHTML='<a href="#gap">The Information Gap</a><span aria-hidden="true" class="nav-sep">›</span><a href="#ecosystem">The Ecosystem</a><span aria-hidden="true" class="nav-sep">›</span><a href="#technologies">Technologies</a><a class="nav-cta" href="#contact">Let\'s Connect <span aria-hidden="true">↗</span></a>';nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');document.getElementById('menu-button')?.setAttribute('aria-expanded','false')}))}
const setHeader=()=>header?.classList.toggle('is-scrolled',scrollY>50);addEventListener('scroll',setHeader,{passive:true});setHeader();
hero.classList.add('roz-hero');hero.removeAttribute('data-reveal');
hero.innerHTML='<canvas id="hero-stars" aria-hidden="true"></canvas><div class="sky-glow" aria-hidden="true"></div><div class="sky-curtains" aria-hidden="true"></div><div class="sky-flare" aria-hidden="true"></div><div class="hero-message"><h1 class="statement" id="hero-title"><span class="statement-a">Information</span><span class="statement-b">Becomes.</span></h1></div><a class="scroll-cue" href="#company"><span>SCROLL</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v17M5 13l7 7 7-7"/></svg></a>';
const params=new URLSearchParams(location.search),v=params.get('contact');if(v==='gold'||v==='cyan')document.body.classList.add('contact-'+v);
const c=document.querySelector('#hero-stars'),ctx=c?.getContext('2d');
let W=0,H=0,stars=[],seed=214785;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
function size(){if(!ctx)return;const r=hero.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);W=c.width=Math.max(1,Math.round(r.width*d));H=c.height=Math.max(1,Math.round(r.height*d));c.style.width=r.width+'px';c.style.height=r.height+'px';stars=Array.from({length:Math.min(1050,Math.round(r.width*r.height/1000))},()=>({x:rand()*W,y:rand()*H,r:(rand()>.97?1.65:.32+rand()*.65)*d,p:rand()*6.283,spd:(.08+rand()*.18)*d}));paint(0)}
function paint(t){if(!ctx)return;ctx.clearRect(0,0,W,H);ctx.fillStyle='#070c20';ctx.fillRect(0,0,W,H);const halo=ctx.createRadialGradient(W*.5,-H*.24,0,W*.5,H*.04,W*.89);halo.addColorStop(0,'rgba(36,81,140,.38)');halo.addColorStop(.52,'rgba(10,28,63,.13)');halo.addColorStop(1,'rgba(4,7,19,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);for(const s of stars){const op=.48+.2*Math.sin(t*.0004+s.p);ctx.fillStyle='rgba(221,238,255,'+(op*.8)+')';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.283);ctx.fill();if(!reduced){s.x-=s.spd*.018;if(s.x<0)s.x+=W}}}
function loop(t){paint(t);requestAnimationFrame(loop)}size();if(!reduced)requestAnimationFrame(loop);if('ResizeObserver'in window)new ResizeObserver(size).observe(hero);
const word=hero.querySelector('.statement-a'),becomes=hero.querySelector('.statement-b');
function finish(){word.style.visibility='visible';word.style.opacity='1';becomes.classList.add('becomes-in')}
function reveal(){if(!word||reduced)return finish();const r=word.getBoundingClientRect(),cw=Math.round(r.width),ch=Math.round(r.height);if(cw<20||ch<20)return finish();
const paper=document.createElement('canvas'),pc=paper.getContext('2d',{willReadFrequently:true});if(!pc)return finish();paper.width=cw;paper.height=ch;
const cs=getComputedStyle(word);pc.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;pc.textBaseline='middle';pc.textAlign='center';pc.fillStyle='#f5f7ff';pc.fillText('Information',cw/2,ch/2+3);
const pixels=pc.getImageData(0,0,cw,ch).data,step=cw>800?3:2;let parts=[];for(let y=0;y<ch;y+=step)for(let x=0;x<cw;x+=step){const alpha=pixels[(y*cw+x)*4+3];if(alpha>80)parts.push({x,y,dx:(rand()-.5)*100,dy:(rand()-.5)*56,delay:x/cw*900+rand()*260})}
if(parts.length<60)return finish();const veil=document.createElement('canvas');veil.className='statement-vapour';veil.width=cw;veil.height=ch;const parent=hero.getBoundingClientRect();veil.style.cssText='position:absolute;left:'+(r.left-parent.left)+'px;top:'+(r.top-parent.top)+'px;width:'+cw+'px;height:'+ch+'px;pointer-events:none;z-index:5';hero.appendChild(veil);word.style.visibility='hidden';const vc=veil.getContext('2d');let start=0;
function stepFrame(now){if(!start)start=now;const dt=now-start;vc.clearRect(0,0,cw,ch);vc.fillStyle='#f5f7ff';for(const p of parts){const f=Math.max(0,Math.min(1,(dt-p.delay)/1650));if(!f)continue;const e=1-(1-f)**3;vc.globalAlpha=Math.min(1,f*1.9);vc.fillRect(p.x+p.dx*(1-e),p.y+p.dy*(1-e),step,step)}vc.globalAlpha=1;if(dt<2900)requestAnimationFrame(stepFrame);else{veil.remove();finish()}}requestAnimationFrame(stepFrame)}
(document.fonts?.ready||Promise.resolve()).then(reveal,finish);setTimeout(()=>{if(!becomes.classList.contains('becomes-in'))finish()},4800);
})();
