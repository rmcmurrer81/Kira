/* Six-node orbital motion adapted from Roz's original
   Consolidated Refinements assets/app.js:
   180-second orbit, upright labels, and two slowly rotating petal layers. */
(()=>{'use strict';
 const art=document.querySelector('#ecosystem .ecosystem-art');
 if(!art)return;
 const sourceWheel=art.querySelector('svg.petals');
 if(sourceWheel&&!art.querySelector('.inner-petals')){
   const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
   svg.setAttribute('viewBox','0 0 500 500');
   svg.setAttribute('class','inner-petals');
   svg.setAttribute('aria-hidden','true');
   const group=document.createElementNS(ns,'g');
   group.setAttribute('transform','translate(250 250)');
   group.setAttribute('fill','none');
   group.setAttribute('stroke','#b9a4f7');
   group.setAttribute('stroke-width','1.2');
   group.setAttribute('stroke-opacity','.55');
   for(let i=0;i<8;i++){
     const ellipse=document.createElementNS(ns,'ellipse');
     ellipse.setAttribute('cx','0');ellipse.setAttribute('cy','-56');
     ellipse.setAttribute('rx','16');ellipse.setAttribute('ry','70');
     ellipse.setAttribute('transform','rotate('+(i*45+22.5)+')');
     group.appendChild(ellipse);
   }
   svg.appendChild(group);
   art.insertBefore(svg,art.querySelector('.center-jewel'));
 }
 const nodes=[...art.querySelectorAll('.wheel-node')];
 if(nodes.length!==6||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let visible=true;
 if('IntersectionObserver' in window){
   new IntersectionObserver(([entry])=>{visible=!!entry?.isIntersecting;},
     {rootMargin:'150px 0px 150px 0px'}).observe(art);
 }
 const start=performance.now(),lap=180000;let last=0;
 function place(now){
   const w=art.clientWidth;if(w<120)return;
   const t=(now-start)/lap*Math.PI*2;
   nodes.forEach((node,i)=>{
     const angle=-Math.PI/2+i*Math.PI/3+t;
     const radius=Math.min(w*.385,w/2-node.offsetWidth/2-9);
     const x=w/2+Math.cos(angle)*radius-node.offsetWidth/2;
     const y=w/2+Math.sin(angle)*radius-node.offsetHeight/2;
     node.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';
   });
 }
 place(start);art.classList.add('orbit-ready');
 const resize=()=>place(performance.now());
 if('ResizeObserver' in window)new ResizeObserver(resize).observe(art);
 else addEventListener('resize',resize,{passive:true});
 function step(now){
   if(visible&&!document.hidden&&now-last>=33){place(now);last=now;}
   requestAnimationFrame(step);
 }
 requestAnimationFrame(step);
})();
