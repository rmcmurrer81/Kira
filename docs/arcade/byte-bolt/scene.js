/* Dependency-free WebGL town. Positions are real 3D coordinates, not image sprites. */
(function(){
'use strict';
const canvas=document.getElementById('world'),gl=canvas.getContext('webgl',{antialias:true});
const stops={yard:{x:5,z:1},store:{x:-1,z:-4},lab:{x:-5,z:2}};
const player={x:0,z:5},keys=new Set();let target=null,near=null,moved=false,time=0,last=0;
const buildings=[{x:-5,z:0,w:3,d:3,h:2.3,c:'#e5cf9c',roof:'#3d7075'}, {x:-1,z:-6,w:3.4,d:2.8,h:2.1,c:'#d2dcc5',roof:'#c57554'}, {x:5,z:-1,w:3.8,d:2.6,h:1.6,c:'#94b1b4',roof:'#506d81'}];
let program,buffer,position,color,aspect=1,scale=12,vertex=[],ctx=null;
if(!gl){ctx=canvas.getContext('2d');}
const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255);
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
if(gl){try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec3 a;attribute vec3 c;varying vec3 v;uniform float ratio;uniform float scale;void main(){float sx=(a.x-a.z)*0.7071068;float sy=a.y*0.8164966-(a.x+a.z)*0.4082483;gl_Position=vec4(sx/(scale*ratio),sy/scale+0.04,-(a.x+a.y+a.z)/80.0,1.0);v=c;}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 v;void main(){gl_FragColor=vec4(v,1.0);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL linking failed');gl.useProgram(program);buffer=gl.createBuffer();position=gl.getAttribLocation(program,'a');color=gl.getAttribLocation(program,'c');gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(color);gl.enable(gl.DEPTH_TEST);}catch(e){document.getElementById('fallback').hidden=false;}}
else document.getElementById('fallback').hidden=true;
function box(x,y,z,w,h,d,colour){const c=hex(colour),p=[[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y+h,z-d/2],[x-w/2,y+h,z-d/2],[x-w/2,y,z+d/2],[x+w/2,y,z+d/2],[x+w/2,y+h,z+d/2],[x-w/2,y+h,z+d/2]],faces=[[0,1,2,3,.66],[4,5,6,7,.85],[0,4,7,3,.76],[1,5,6,2,.9],[3,2,6,7,1],[0,1,5,4,.6]];for(const f of (gl?faces:[faces[1],faces[3],faces[4]])){for(const i of [0,1,2,0,2,3])vertex.push(...p[f[i]],...c.map(v=>v*f[4]));}}
function person(x,z,c,walk=0,robot=false){let swing=Math.sin(walk)*.12;box(x,0,z,.5,.08,.55,'#467369');box(x-.13,.1,z+swing,.17,.36,.2,'#294e60');box(x+.13,.1,z-swing,.17,.36,.2,'#294e60');box(x,.45,z,.48,.5,.3,c);box(x,.97,z,.34,.32,.31,robot?'#b6d6d2':'#c7916f');box(x,.99,z+.17,.25,.1,.05,robot?'#243b48':'#4b3c37');box(x-.32,.45,z-swing,.12,.4,.15,c);box(x+.32,.45,z+swing,.12,.4,.15,c);if(robot){box(x,1.3,z,.04,.18,.04,'#eece79');box(x,1.45,z,.1,.08,.1,'#e4b054');}}
function project(x,y,z){return {x:(.5+(x-z)*.7071068/(scale*aspect)*.5)*innerWidth,y:(.5-((y*.8164966-(x+z)*.4082483)/scale+.04)*.5)*innerHeight};}
function render(){if(!gl&&!ctx)return;const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(innerWidth*dpr),h=Math.round(innerHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;if(gl)gl.viewport(0,0,w,h);}aspect=innerWidth/innerHeight;scale=aspect<.8?14:aspect<1.2?11:8.2;
 if(gl){gl.clearColor(.56,.72,.74,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);}else{ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#91b9bd';ctx.fillRect(0,0,innerWidth,innerHeight);}vertex=[];
 box(0,-.8,0,22,.75,20,'#5b9a83');box(0,-.05,0,21,.05,19,'#7fba98');
 // The two streets meet at a paved community square.
 box(0,0,2,19,.04,2.2,'#d1cbb0');box(0,0,-2,2.4,.04,12,'#d1cbb0');box(0,.02,2,4,.04,4,'#e2d8b5');
 for(let x=-8;x<9;x+=2)box(x,.055,2,.7,.015,.06,'#f2e9d0');
 for(const b of buildings){box(b.x,0,b.z,b.w+.25,.22,b.d+.25,'#a8a38c');box(b.x,.22,b.z,b.w,b.h,b.d,b.c);box(b.x,b.h+.22,b.z,b.w+.35,.3,b.d+.35,b.roof);box(b.x,.25,b.z+b.d/2+.025,.65,1.3,.08,'#254d53');for(const offset of [-.95,.95]){box(b.x+offset,1.1,b.z+b.d/2+.04,.5,.6,.09,'#73bbcb');box(b.x+offset,1.38,b.z+b.d/2+.1,.5,.04,.03,'#d9e1cd');}box(b.x,b.h+.56,b.z,.9,.08,.7,'#e7cf86');}
 // Solar roof, shop awning, service bench, and robot testing lane.
 for(let x=-5.9;x<-4;x+=.45)box(x,2.88,0,.38,.05,1.8,'#264c65');
 box(-1,1.8,-4.35,3.3,.15,1,'#e3ba6f');for(let x=-2.5;x<.6;x+=.6)box(x,1.89,-4.35,.25,.04,1,'#f5e5bd');
 box(6,.4,1.5,1.2,.12,.65,'#d4b080');box(5,.05,3.6,3,.03,1.4,'#647f85');box(6.35,.08,3.6,.1,.1,1.4,'#f1c96b');
 // Trees and flowers, with depth-tested crowns.
 for(const [x,z] of [[-8,-6],[-8,4],[-7,7],[3,-7],[8,5],[8,-5],[-3,7]]){box(x,0,z,.19,1.2,.19,'#8b7854');box(x,1,z,1.1,1,1.1,'#3c896f');box(x+.1,1.7,z,.75,.6,.75,'#64a479');}
 for(let i=0;i<7;i++){box(2.8+i*.4,.1,6,.11,.2,.11,i%2?'#dcae66':'#d98b78');}
 // Mentor, clerk, and a moving service robot.
 person(5,1,'#ce8770',0);person(-1,-4,'#6ba7a3',0);person(-5,2,'#aa96b6',0);
 const repaired=window.townState&&window.townState.repair;person(repaired?4.4+Math.sin(time)*.65:4.3,3.6,'#e8bd6c',repaired?time*5:0,true);
 person(player.x,player.z,'#edca72',moved?time*12:0);
 // A small beacon marks the player.
 box(player.x,1.55+Math.sin(time*2)*.035,player.z,.15,.15,.15,'#f5de94');
 if(gl){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertex),gl.DYNAMIC_DRAW);gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(color,3,gl.FLOAT,false,24,12);gl.uniform1f(gl.getUniformLocation(program,'ratio'),aspect);gl.uniform1f(gl.getUniformLocation(program,'scale'),scale);gl.drawArrays(gl.TRIANGLES,0,vertex.length/6);}else{
 // CPU fallback projects the very same 3D triangles; painter sorting replaces a depth buffer.
 const tris=[];for(let i=0;i<vertex.length;i+=36){let points=[],depth=0;for(const j of [0,6,12,30]){let k=i+j;points.push(project(vertex[k],vertex[k+1],vertex[k+2]));depth+=vertex[k]+vertex[k+1]+vertex[k+2];}if(Math.max(vertex[i+1],vertex[i+7],vertex[i+13])<=.09)depth-=1000;tris.push({points,depth,color:'rgb('+vertex.slice(i+3,i+6).map(v=>Math.round(v*255)).join(',')+')'});}tris.sort((a,b)=>a.depth-b.depth);for(const t of tris){ctx.beginPath();ctx.moveTo(t.points[0].x,t.points[0].y);for(const p of t.points.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fillStyle=t.color;ctx.fill();ctx.strokeStyle=t.color;ctx.lineWidth=.5;ctx.stroke();}
 }
 for(const [id,x,y,z] of [['lab',-5,3.6,0],['store',-1,3.4,-6],['yard',5,3,-1]]){let p=project(x,y,z),el=document.querySelector('.label-'+id);el.style.left=p.x+'px';el.style.top=p.y+'px';}
}
function allowed(x,z){return Math.abs(x)<9&&Math.abs(z)<8&&!buildings.some(b=>Math.abs(x-b.x)<b.w/2+.25&&Math.abs(z-b.z)<b.d/2+.25);}
function frame(ms){const dt=Math.min((ms-last)/1000||0,.04);last=ms;time+=dt;moved=false;
 if(!document.hidden&&!window.townPaused){let dx=0,dz=0;if(target){let distance=Math.hypot(target.x-player.x,target.z-player.z);if(distance<.1){let id=target.id;target=null;window.dispatchEvent(new CustomEvent('town-arrive',{detail:id}));}else{dx=(target.x-player.x)/distance;dz=(target.z-player.z)/distance;}}else{let right=+(keys.has('ArrowRight')||keys.has('d'))-+(keys.has('ArrowLeft')||keys.has('a')),down=+(keys.has('ArrowDown')||keys.has('s'))-+(keys.has('ArrowUp')||keys.has('w'));dx=(right+down)*.707;dz=(down-right)*.707;let n=Math.hypot(dx,dz);if(n>1){dx/=n;dz/=n;}}
 const nx=player.x+dx*dt*3,nz=player.z+dz*dt*3;if(allowed(nx,player.z)){moved=moved||Math.abs(nx-player.x)>.001;player.x=nx;}if(allowed(player.x,nz)){moved=moved||Math.abs(nz-player.z)>.001;player.z=nz;}
 near=Object.keys(stops).find(k=>Math.hypot(stops[k].x-player.x,stops[k].z-player.z)<1.5)||null;let e=document.getElementById('interact');e.hidden=!near;if(near)e.textContent=(near==='yard'?'Talk to Iris':near==='store'?'Talk to the clerk':'Open your lab')+' · E';}
 render();requestAnimationFrame(frame);
}
addEventListener('keydown',e=>{if(window.townPaused)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','e','E'].includes(e.key)){e.preventDefault();if(e.key.toLowerCase()==='e'){if(near&&!e.repeat)window.dispatchEvent(new CustomEvent('town-arrive',{detail:near}));}else{target=null;keys.add(e.key);}}});addEventListener('keyup',e=>keys.delete(e.key));addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{target=null;keys.add(b.dataset.key);b.setPointerCapture(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key));}
document.getElementById('interact').onclick=()=>near&&window.dispatchEvent(new CustomEvent('town-arrive',{detail:near}));
window.TownScene={player,stops,go(id){/* Destination shortcuts provide accessible travel without collision traps. */target=null;player.x=stops[id].x;player.z=stops[id].z+1;window.dispatchEvent(new CustomEvent('town-arrive',{detail:id}));},clear(){keys.clear();target=null;}};requestAnimationFrame(frame);
})();
