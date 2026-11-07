/* Offline dependency-free 3D town. GPU and CPU share the same lit polygon geometry. */
(function(){
'use strict';
const canvas=document.getElementById('world');let gl=null,ctx=null,program,staticBuffer,dynamicBuffer,position,color;
try{gl=canvas.getContext('webgl',{antialias:true,alpha:false});}catch(e){}
if(!gl)ctx=canvas.getContext('2d');
const bounds={minX:-20,maxX:20,minZ:-20,maxZ:20},stops={yard:{x:5,z:1},store:{x:-1,z:-4},lab:{x:-5,z:2}};
let facing=0,bodyTransform=null; // Heading is runtime-only; existing position saves remain unchanged.
const player={x:0,z:5},camera={x:0,z:5},keys=new Set(),obstacles=[];
const buildings=[
 {id:'lab',x:-5,z:0,w:3,d:3,h:2.25,c:'#d9c8a6',roof:'#506c70',kind:'lab'},
 {id:'store',x:-1,z:-6,w:3.4,d:2.8,h:2.1,c:'#d4d9c1',roof:'#a96d53',kind:'shop'},
 {id:'yard',x:5,z:-1,w:3.8,d:2.6,h:1.8,c:'#a7b5af',roof:'#586c79',kind:'shed'},
 {x:-14,z:-1.2,w:3.3,d:3.4,h:2.3,c:'#d1b39c',roof:'#85695c',kind:'house'},
 {x:-18,z:-7.2,w:3.1,d:3.2,h:2.55,c:'#c0c8b8',roof:'#777d78',kind:'house'},
 {x:-14,z:-7.8,w:3.2,d:3.3,h:2.2,c:'#d8d2bf',roof:'#a87662',kind:'house'},
 {x:14,z:-4,w:4.1,d:3.4,h:2.55,c:'#d7bda7',roof:'#677780',kind:'cafe'},
 {x:14,z:11,w:4.8,d:3.2,h:3.15,c:'#d8cdb8',roof:'#7a7972',kind:'hall'},
 {x:-5,z:14,w:3.5,d:3.6,h:2.5,c:'#c4c4b1',roof:'#9a7460',kind:'house'},
 {x:-14,z:18,w:3,d:2.7,h:1.9,c:'#c8b492',roof:'#747b69',kind:'garden'}
];
const trees=[[-19,-17,1.3],[-15,-17,1.05],[-10,-15,1.35],[-6,-13,1.2],[0,-16,1.35],[5,-14,1.1],[-18,2,1.15],[-17,8,1.4],[-16,12,1],[-19,17,1.3],[-8,18,1.15],[-2,18,1.4],[3,16,1.15],[7,12,1.1],[11,18,1.3],[17,17,1.4],[19,6,1.3],[18,1,1.05],[18,-5,1.1],[11,-16,1.35],[18,-17,1.3],[19,-12,.85],[-8,-8,.95],[-8,6,.9],[2,-10,.95],[7,-7,.8],[-3,8,.9]];
let aspect=1,scale=8.6,zoom=1,viewW=innerWidth,viewH=innerHeight,time=0,last=0,lastDraw=0,moved=false,near=null,ready=false,staticKey='',staticGeo,dynamicGeo,geo,layer=0,frameCount=0;
const reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const colours=new Map(),rgb=s=>{if(!colours.has(s))colours.set(s,[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255));return colours.get(s);},clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),newGeo=()=>({vertices:[],faces:[],count:0});
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
if(gl){try{
 program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec3 a;attribute vec3 c;varying vec3 v;uniform float ratio;uniform float scale;uniform vec2 camera;void main(){vec3 p=a-vec3(camera.x,0.0,camera.y);float sx=(p.x-p.z)*0.7071068;float sy=p.y*0.8164966-(p.x+p.z)*0.4082483;gl_Position=vec4(sx/(scale*ratio),sy/scale-0.08,-(p.x+p.y+p.z)/110.0,1.0);v=c;}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 v;void main(){gl_FragColor=vec4(v,1.0);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL linking failed');
 gl.useProgram(program);staticBuffer=gl.createBuffer();dynamicBuffer=gl.createBuffer();position=gl.getAttribLocation(program,'a');color=gl.getAttribLocation(program,'c');gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(color);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
}catch(e){const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);ctx=replacement.getContext('2d');gl=null;}}
const surface=gl?canvas:document.getElementById('world'),fallback=document.getElementById('fallback');if(fallback)fallback.hidden=!!(gl||ctx);

/* Fixed orthographic viewing direction lets both renderers discard rear-facing polygons. */
function face(points,colour,shade){
 // Rotate complete body polygons before normals, visibility, lighting and projection.
 if(bodyTransform){const {x,z,sin,cos}=bodyTransform;points=points.map(p=>{const dx=p[0]-x,dz=p[2]-z;return [x+dx*cos+dz*sin,p[1],z-dx*sin+dz*cos];});}
 const a=points[0],b=points[1],c=points[2],u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
 let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n);if(!len)return;n=n.map(v=>v/len);if(n[0]+n[1]+n[2]<-.001)return;
 const light=shade===undefined?.63+Math.max(0,n[0]*-.35+n[1]*.83+n[2]*.43)*.37:shade,col=rgb(colour).map(v=>clamp(v*light,0,1));
 let depth=0,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(const p of points){depth+=p[0]+p[1]+p[2];const sx=(p[0]-p[2])*.7071068,sy=p[1]*.8164966-(p[0]+p[2])*.4082483;minX=Math.min(minX,sx);maxX=Math.max(maxX,sx);minY=Math.min(minY,sy);maxY=Math.max(maxY,sy);}
 geo.faces.push({points,depth:depth/points.length,layer,minX,maxX,minY,maxY,css:'rgb('+col.map(v=>Math.round(v*255)).join(',')+')'});
 for(let i=1;i<points.length-1;i++)for(const p of [points[0],points[i],points[i+1]])geo.vertices.push(...p,...col);
}
function box(x,y,z,w,h,d,c){
 const p=[[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y+h,z-d/2],[x-w/2,y+h,z-d/2],[x-w/2,y,z+d/2],[x+w/2,y,z+d/2],[x+w/2,y+h,z+d/2],[x-w/2,y+h,z+d/2]];
 for(const f of [[1,0,3,2],[4,5,6,7],[0,4,7,3],[5,1,2,6],[3,7,6,2]])face(f.map(i=>p[i]),c);
}
function disk(x,y,z,rx,rz,c,sides=16){const p=[];for(let i=0;i<sides;i++){const a=-i*Math.PI*2/sides;p.push([x+Math.cos(a)*rx,y,z+Math.sin(a)*rz]);}face(p,c,1);}
function cylinder(x,y,z,r,h,c,sides=8,topR=r){
 const top=[];for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides,p=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],q=[x+Math.cos(b)*r,y,z+Math.sin(b)*r],t=[x+Math.cos(a)*topR,y+h,z+Math.sin(a)*topR],s=[x+Math.cos(b)*topR,y+h,z+Math.sin(b)*topR];face([q,p,t,s],c);top.unshift(t);}face(top,c);
}
function sphere(x,y,z,rx,ry,rz,c,sides=9,rings=4){
 const at=(i,j)=>{const a=i/sides*Math.PI*2,b=j/rings*Math.PI;return [x+Math.cos(a)*Math.sin(b)*rx,y+Math.cos(b)*ry,z+Math.sin(a)*Math.sin(b)*rz];};
 for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){const p=j===0?[at(i,0),at(i,1),at(i+1,1)]:j===rings-1?[at(i,j),at(i,rings),at(i+1,j)]:[at(i,j),at(i,j+1),at(i+1,j+1),at(i+1,j)];face(p.reverse(),c);}
}
function beam(a,b,r,c,sides=6){
 let d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);if(!len)return;d=d.map(v=>v/len);let u=Math.abs(d[1])<.9?[-d[2],0,d[0]]:[1,0,0],ul=Math.hypot(...u);u=u.map(v=>v/ul);const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]],ring=(p,i)=>p.map((q,k)=>q+r*(u[k]*Math.cos(i/sides*Math.PI*2)+v[k]*Math.sin(i/sides*Math.PI*2)));
 for(let i=0;i<sides;i++)face([ring(a,i),ring(a,i+1),ring(b,i+1),ring(b,i)],c);
}
function roof(x,y,z,w,d,rise,c){
 const p=[[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x-w/2,y,z+d/2],[x-w/2,y+rise,z],[x+w/2,y+rise,z]];
 face([p[0],p[4],p[5],p[1]],c);face([p[3],p[2],p[5],p[4]],c);face([p[2],p[1],p[5]],c);face([p[0],p[3],p[4]],c);
 box(x,y-.09,z,w,.1,d,'#e8e0cb');beam([x-w/2,y+rise+.025,z],[x+w/2,y+rise+.025,z],.055,c);
 for(let i=1;i<4;i++){const zz=z+d/2*(1-i/4),yy=y+rise*i/4+.015;beam([x-w/2,yy,zz],[x+w/2,yy,zz],.013,c,4);}
}
function shadow(x,z,rx,rz,y=.04){disk(x+.2,y,z+.13,rx*1.14,rz*1.1,'#839570');disk(x+.2,y+.002,z+.13,rx,rz,'#738964');}
function tree(x,z,s=1,i=0){
 layer=-1;shadow(x,z,1.35*s,.9*s);layer=0;cylinder(x,.03,z,.13*s,1.75*s,'#77644b',7,.08*s);
 beam([x,.8*s,z],[x-.45*s,1.8*s,z+.12*s],.06*s,'#77644b');beam([x,1.2*s,z],[x+.55*s,1.9*s,z-.18*s],.065*s,'#77644b');
 const c=['#6d895a','#748d5b','#819360','#64805a'];sphere(x,2.05*s,z,1.1*s,.95*s,1*s,c[i%4]);sphere(x-.6*s,1.9*s,z+.15*s,.63*s,.67*s,.67*s,c[(i+1)%4],8,3);sphere(x+.3*s,2.6*s,z-.16*s,.71*s,.67*s,.72*s,c[(i+2)%4],8,3);
}
function hedge(x,z,w,d){box(x,.05,z,w,.12,d,'#8c8069');box(x,.17,z,w-.08,.57,d-.08,'#6d8055');box(x,.7,z,w-.18,.12,d-.14,'#81945f');}
function planter(x,z,c='#b97565'){cylinder(x,.06,z,.28,.35,'#ab8063',8,.34);cylinder(x,.41,z,.29,.025,'#615744');sphere(x,.63,z,.29,.3,.3,'#72865a',7,3);sphere(x+.08,.84,z,.1,.1,.1,c,6,3);}
function windowFront(x,y,z,w=.63,h=.7,lit=false){
 box(x,y-.055,z,w+.16,h+.12,.07,'#f1e9d5');box(x,y,z+.045,w,h,.045,lit?'#efcf88':'#73959b');box(x,y+h*.48,z+.075,w,.045,.035,'#e7dfc9');box(x,y,z+.08,.045,h,.035,'#e7dfc9');box(x,y-.08,z+.08,w+.2,.07,.2,'#e4dbc4');
 face([[x-w/2+.04,y+h-.05,z+.072],[x-.08,y+h-.05,z+.072],[x+w/2-.04,y+.05,z+.072]],lit?'#f7dda4':'#a5bfc1',.9);
}
function building(b,lit=false){
 const {x,z,w,d,h,c}=b,front=z+d/2,top=h+.2,rise=b.kind==='shed'?.55:.92;
 layer=-1;face([[x-w/2,.043,z-d/2],[x-w/2,.043,z+d/2],[x+w/2+1.3,.043,z+d/2+.7],[x+w/2+1.3,.043,z-d/2+.7]],'#7f906b',1);layer=0;
 box(x,.04,z,w+.2,.16,d+.2,'#a69e8d');box(x,.2,z,w,h,d,c);box(x,.22,z,w+.045,.22,d+.045,'#b3aa96');box(x,top-.12,z,w+.07,.12,d+.07,'#f0e4ce');
 for(const xx of [x-w/2+.07,x+w/2-.07])box(xx,.44,front+.03,.12,h-.35,.09,'#e8ddc5');
 roof(x,top+.05,z,w+.45,d+.5,rise,b.roof);
 if(b.kind!=='shed'){box(x+w*.26,top+.4,z-d*.18,.38,1.05,.43,'#a48a73');box(x+w*.26,top+1.4,z-d*.18,.48,.12,.51,'#c8bda5');}
 box(x,.2,front+.065,.68,1.48,.12,b.kind==='house'?'#5d736f':'#536b6d');box(x,.3,front+.135,.51,.62,.025,'#637b76');box(x,.99,front+.135,.44,.5,.025,lit?'#f2d49a':'#8da8a8');sphere(x+.22,.94,front+.17,.035,.035,.035,'#c6ad73',6,3);box(x,.05,front+.34,1.15,.13,.55,'#c7bea7');
 for(const dx of [-w*.31,w*.31])windowFront(x+dx,1.04,front+.045,w>4?.88:.62,.78,lit);
 for(const dz of [-d*.25,d*.25]){box(x+w/2+.02,1.04,z+dz,.07,.83,.72,'#e8e0ce');box(x+w/2+.065,1.1,z+dz,.035,.69,.59,lit?'#e7cd92':'#73949c');box(x+w/2+.087,1.42,z+dz,.025,.04,.61,'#eee4ce');}
 if(b.kind==='house'){box(x,.16,front+.8,w-1,.05,1.2,'#c1b79e');planter(x-w*.34,front+.5);planter(x+w*.34,front+.5,'#c4b06d');}
 if(b.kind==='shop'||b.kind==='cafe'){
  face([[x-w/2-.08,1.97,front],[x-w/2-.08,1.7,front+1.1],[x+w/2+.08,1.7,front+1.1],[x+w/2+.08,1.97,front]],'#bc8564');
  for(let i=0;i<7;i++){const xx=x-w/2+.12+i*w/7;face([[xx,1.974,front],[xx,1.704,front+1.1],[xx+w/14,1.704,front+1.1],[xx+w/14,1.974,front]],'#e5d7b7');}
  box(x,1.57,front+1.11,w+.15,.13,.06,'#b78867');for(const dx of [-w*.48,w*.48])cylinder(x+dx,.04,front+1.1,.035,1.64,'#766e58',6);
 }
 if(b.kind==='shed'){box(x+.9,.24,front+.08,1.4,1.35,.06,'#647876');for(let y=.45;y<1.5;y+=.23)box(x+.9,y,front+.12,1.35,.025,.025,'#9eaaa0');}
}
function bench(x,z,rotate=false){
 for(const s of [-1,1])box(x+(rotate?0:s*.67),.04,z+(rotate?s*.67:0),rotate?.48:.11,.5,rotate?.11:.48,'#596460');
 for(let i=0;i<3;i++)box(x+(rotate?(i-1)*.16:0),.52,z+(rotate?0:(i-1)*.16),rotate?.13:1.85,.08,rotate?1.85:.13,'#aa8c67');
 for(const y of [.78,1])box(x+(rotate?-.24:0),y,z+(rotate?0:-.24),rotate?.07:1.85,.13,rotate?1.85:.07,'#aa8c67');
 for(const s of [-1,1])box(x+(rotate?-.24:s*.65),.25,z+(rotate?s*.65:-.24),.07,.87,.07,'#596460');
}
function lamp(x,z,lit=false){cylinder(x,.03,z,.19,.16,'#8e9180');cylinder(x,.19,z,.065,2.4,'#526664',8,.04);box(x,2.55,z,.42,.08,.42,'#4f6663');box(x,2.63,z,.27,.34,.27,lit?'#efd38f':'#cbd2bd');roof(x,2.99,z,.47,.47,.18,'#506765');}
function fence(x,z,length,alongZ=false){for(let n=0;n<=length;n+=.7)box(x+(alongZ?0:n),.02,z+(alongZ?n:0),.1,.72,.1,'#d0c6aa');for(const y of [.28,.57])box(x+(alongZ?0:length/2),y,z+(alongZ?length/2:0),alongZ?.07:length,.1,alongZ?length:.07,'#c6bfa5');}
function road(x,z,length,alongZ=false){
 layer=-4;box(x,.025,z,alongZ?3.1:length,.025,alongZ?length:3.1,'#858d86');layer=-3;
 for(const s of [-1,1]){box(x+(alongZ?s*1.95:0),.04,z+(alongZ?0:s*1.95),alongZ?.74:length,.1,alongZ?length:.74,'#c8c5b3');box(x+(alongZ?s*1.58:0),.09,z+(alongZ?0:s*1.58),alongZ?.08:length,.08,alongZ?length:.08,'#ded9c6');}
 for(let n=-length/2+1;n<length/2;n+=2.7)box(x+(alongZ?0:n),.057,z+(alongZ?n:0),alongZ?.055:.9,.005,alongZ?.9:.055,'#c9c6aa');
 for(let n=-length/2;n<length/2;n+=2)for(const s of [-1,1])box(x+(alongZ?s*1.97:n),.145,z+(alongZ?n:s*1.97),alongZ?.65:.025,.004,alongZ?.025:.65,'#aeaf9e');layer=0;
}
function finish(g){g.faces.sort((a,b)=>a.layer-b.layer||a.depth-b.depth);g.data=new Float32Array(g.vertices);g.count=g.vertices.length/6;g.vertices=[];return g;}
function buildTown(){
 const done=window.townState?.completed||[],has=id=>done.includes(id);staticKey=done.join('|');geo=newGeo();obstacles.length=0;layer=-6;
 box(0,-.65,0,47,.65,47,'#92957a');box(0,0,0,47,.025,47,'#9da77c');
 for(let i=0;i<7;i++)for(let j=0;j<7;j++)box(-21+i*7,.026,-21+j*7,6.98,.004,6.98,['#9ca67b','#9aa57b','#9fa97e','#98a47a'][(i*3+j*7)%4]);
 road(0,4,42);road(9,-1,39,true);road(-10,-.5,37,true);road(-14,-11,12);road(-10.5,11,15);
 layer=-3;box(-1,.035,-.7,1.3,.055,6.6,'#c6bda1');box(-5,.035,2,3.7,.055,1.1,'#c6bda1');box(5,.035,1.4,4.8,.055,2.1,'#c6bda1');box(-14,.035,1.1,4.2,.055,1.8,'#c7c2ac');box(14,.035,-.5,5,.055,2.8,'#c7c2ac');box(14,.035,8,8,.06,4,'#cec7b2');box(-5,.035,11.7,3.8,.055,1.4,'#c4b99e');
 box(2,.036,8.2,6,.07,4.7,'#b8ae96');for(let i=0;i<6;i++)for(let j=0;j<5;j++)box(-.5+i,.11,6.3+j*.8,.94,.012,.74,(i+j)%2?'#c8bda4':'#c1b59c');
 for(let i=0;i<6;i++){box(7.7+i*.44,.061,4,.23,.007,2.4,'#dedaca');box(-10,.061,2.8+i*.44,2.4,.007,.23,'#dedaca');}
 layer=0;for(const b of buildings)building(b,has('light')&&b.id==='lab');
 // Solar panels follow the roof pitch, with visible cell divisions.
 for(let i=0;i<4;i++){const x=-6.12+i*.58,y=2.72,z=1.4,w=.49;face([[x,y,z],[x+w,y,z],[x+w,y+.64,z-1.19],[x,y+.64,z-1.19]],has('divider')?'#456f86':'#394d60');for(let j=1;j<3;j++)beam([x,y+.64*j/3+.01,z-1.19*j/3],[x+w,y+.64*j/3+.01,z-1.19*j/3],.008,'#9baeba',4);}
 box(6.5,.06,.95,.9,.55,.65,'#997d5c');box(6.5,.63,.95,1.12,.08,.76,'#c4aa7d');box(6.68,.71,.95,.18,.14,.28,'#5a6a69');box(6.15,.71,.9,.28,.05,.16,'#c5c4ae');
 layer=-3;box(5,.058,3.6,3,.013,1.3,'#647a79');for(const x of [3.5,6.5])box(x,.075,3.6,.05,.007,1.3,'#d7bc77');layer=0;box(7,.05,-.8,.8,.65,.7,'#b19570');box(7,.7,-.8,.86,.06,.76,'#c4ab84');
 // Open-sided greenhouse and restored crops retain the existing project effects.
 box(-5,.04,-5,2.7,.2,1.95,'#927a5d');box(-5,.24,-5,2.45,.025,1.7,'#766747');
 for(let i=0;i<8;i++){const x=-5.9+(i%4)*.6,z=-5.5+Math.floor(i/4);cylinder(x,.27,z,.035,has('garden')?.48:.13,'#729359',5);if(has('garden')){sphere(x-.09,.57,z,.18,.09,.13,'#74975c',6,3);sphere(x+.1,.68,z,.19,.1,.14,'#7d9f63',6,3);sphere(x,.77,z,.09,.09,.09,'#bca25c',6,3);}}
 for(const x of [-6.45,-3.55])for(const z of [-6.05,-3.95])box(x,.05,z,.06,1.85,.06,'#c0c8b3');roof(-5,1.9,-5,3.05,2.2,.5,'#a9bdac');
 cylinder(-6.9,.03,-5,.34,.8,has('garden')?'#79a6ab':'#7b8780',12);cylinder(-6.9,.83,-5,.38,.06,'#a5b4a3',12);beam([-6.6,.5,-5],[-6.2,.5,-5],.035,'#777f6d');
 if(has('light')){box(-4.1,.1,2.15,.8,.64,.55,'#9b8364');box(-4.1,.75,2.15,.85,.06,.61,'#ccb18b');cylinder(-4.1,.82,2.15,.12,.08,'#666f61');sphere(-4.1,1.02,2.15,.12,.17,.12,'#f0ce80',8,4);}
 if(has('echo')){box(-4.5,.8,2.25,.4,.4,.12,'#435a60');box(-4.5,.89,2.32,.31,.22,.02,'#99c79a');for(let i=0;i<4;i++)box(4.4+i*.36,.1,3.6,.09,.03,.15,'#b8d1c3');}
 if(has('divider')){box(-6.2,.15,1.8,.45,.95,.3,'#66858b');box(-6.2,.78,1.97,.25,.18,.03,'#c7d29b');}
 if(has('fan')){box(-6.6,.1,2,.7,.8,.4,'#526b72');cylinder(-6.6,.9,2,.23,.06,'#a5b2a7',10);}
 if(has('battery'))for(let i=0;i<3;i++)box(3.4+i*.18,.14,3.6,.1,.14,.2,'#a9be7c');
 for(const x of [4,6]){cylinder(x,.05,5.2,.12,1.2,'#617775');sphere(x,1.3,5.2,.12,.12,.12,x===6?(has('gate')?'#b1ca87':'#bd886d'):'#d2b979',8,3);}
 if(has('gate')){beam([4,1.2,5.2],[4,2.6,5.2],.045,'#d5b77a');cylinder(2,.14,8,.5,.55,'#8e9981',10);cylinder(2,.69,8,.36,.08,'#c9bb91',10);sphere(2,1.06,8,.23,.3,.23,'#ddbc71',8,4);}
 else{beam([4,1.12,5.2],[6,1.12,5.2],.055,'#cfb37c');for(let i=0;i<4;i++)box(4.2+i*.45,1.1,5.25,.2,.09,.03,'#e8dfbd');}
 // Willow Row cottages have fenced front gardens and mailboxes.
 for(const b of buildings.filter(b=>b.kind==='house')){fence(b.x-b.w/2-.6,b.z+b.d/2+1.8,b.w*.4);fence(b.x+.65,b.z+b.d/2+1.8,b.w*.4);cylinder(b.x+b.w/2+.35,.03,b.z+b.d/2+.8,.045,.8,'#7f7963',6);box(b.x+b.w/2+.35,.83,b.z+b.d/2+.8,.35,.22,.24,'#8d7663');}
 hedge(-14.5,6.7,4,.65);hedge(-18.6,-3,.55,4);hedge(-6.5,17,4,.55);
 // Heron Pond: shore, water, reeds, wooden viewing deck and benches.
 layer=-3;disk(15,.032,-12,5.4,4.1,'#b8b398',24);disk(15,.038,-12,4.85,3.6,'#829b8e',24);disk(15,.043,-12,4.55,3.3,'#6f9898',24);disk(14.5,.046,-12.3,3.7,2.5,'#78a3a1',24);layer=0;obstacles.push({x:15,z:-12,rx:4.5,rz:3.25});
 for(let i=0;i<7;i++)box(11.3+i*.44,.19,-8.7,.4,.12,1.5,'#b99b74');for(const x of [11.2,14.15])for(const z of [-9.3,-8.1])cylinder(x,.03,z,.06,.55,'#8d7c61',6);
 for(let i=0;i<9;i++){const a=i*.63,x=15+Math.cos(a)*4.7,z=-12+Math.sin(a)*3.45;beam([x,.04,z],[x+.1,.65,z+.08],.025,'#839063',5);sphere(x+.1,.68,z+.08,.05,.12,.05,'#978461',6,3);}
 for(let i=0;i<5;i++)box(14+i*.48,.05,-11.5+Math.sin(i)*.5,.34,.006,.025,'#b1cfbf');bench(12,-6.8);bench(16.7,-7.4);lamp(10.8,-7.4);
 // Allotments in the southwest district.
 for(let i=0;i<3;i++){const x=-17+i*2.1;box(x,.035,14.2,1.5,.18,3,'#9a8260');box(x,.22,14.2,1.32,.02,2.8,'#776a4e');for(let k=0;k<5;k++)sphere(x,.4,13.2+k*.5,.38,.2,.2,['#839258','#9aa064','#749265'][i],7,3);}
 fence(-18,12.2,5.2);fence(-18,12.2,4.8,true);box(-17.5,.04,17.8,.8,.5,.8,'#a5926e');
 // Civic square with clock tower, steps and fountain.
 box(14,.04,7.8,4.5,.12,.8,'#b4b19c');box(14,.16,8.1,3.8,.12,.6,'#c7c2ac');box(14,3.37,11,1.25,1.6,1.25,'#c8bea6');roof(14,4.97,11,1.6,1.6,.65,'#6b7771');
 box(14,4.04,11.64,.66,.66,.035,'#f0e7ca');box(14,4.12,11.67,.035,.45,.025,'#4f655e');box(14.12,4.31,11.67,.26,.035,.025,'#4f655e');
 cylinder(14,.11,6.3,.85,.26,'#b4b19c',16);cylinder(14,.37,6.3,.7,.06,'#83a2a0',16);cylinder(14,.43,6.3,.17,.55,'#c5bfa5',10);sphere(14,1.05,6.3,.2,.15,.2,'#b7c7ac',8,3);obstacles.push({x:14,z:6.3,rx:.95,rz:.95});bench(11.8,7.5,true);bench(16.6,7.5,true);
 for(const x of [11,17]){planter(x,9,'#c3916b');planter(x,6,'#b98982');}bench(0,9.5);bench(4,8.6,true);planter(0,6.4);planter(4,6.4,'#b7a16d');
 for(const [x,z] of [[-7.7,1.7],[1.8,1.9],[7.2,6.3],[-7.7,6.3],[-11.9,6.3],[11.2,1.7],[7,-10],[11.2,14.8]])lamp(x,z,has('light'));
 for(let i=0;i<trees.length;i++){const [x,z,s]=trees[i];tree(x,z,s,i);obstacles.push({x,z,rx:.24,rz:.24});}
 for(let i=0;i<12;i++)sphere(-19+(i*13)%38,.15,i%2?-18.4:19,.35+(i%3)*.12,.23,.32,'#a9ac95',7,3);
 for(let i=0;i<22;i++){const x=-7+(i%11)*.36,z=9.7+Math.floor(i/11)*.3;beam([x,.04,z],[x,.25,z],.013,'#7d8e57',4);sphere(x,.27,z,.07,.07,.07,i%3?'#cfbb77':'#bf8c79',6,3);}
 layer=0;staticGeo=finish(geo);if(gl){gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);gl.bufferData(gl.ARRAY_BUFFER,staticGeo.data,gl.STATIC_DRAW);}
}
function human(x,z,shirt,walk=0,style=0,isPlayer=false,heading=0){
 const swing=Math.sin(walk)*.2,skin=style===1?'#a87d5f':style===2?'#bf9a77':'#c49b79',trousers=isPlayer?'#4b5c65':'#56696a';layer=-1;shadow(x,z,.36,.27,.086);layer=0;
 // Keep the world-lit ground shadow fixed; rotate every body part together.
 if(isPlayer)bodyTransform={x,z,sin:Math.sin(heading),cos:Math.cos(heading)};
 for(const side of [-1,1]){const xx=x+side*.105,zz=z+side*swing;beam([xx,.63,z],[xx,.12,zz],.09,trousers,7);box(xx,.07,zz+.045,.18,.12,.31,'#485453');}
 cylinder(x,.6,z,.22,.46,shirt,9,.245);cylinder(x,1.06,z,.075,.11,skin,7);sphere(x,1.32,z,.18,.23,.17,skin,10,5);sphere(x,1.43,z-.018,.188,.15,.174,style===2?'#a9aaa0':'#65594c',9,4);
 for(const dx of [-.065,.065])sphere(x+dx,1.33,z+.157,.017,.021,.012,'#4d4c43',5,3);sphere(x,1.28,z+.172,.031,.035,.043,skin,6,3);
 for(const side of [-1,1]){const zz=z-side*swing*.65;beam([x+side*.24,1,z],[x+side*.31,.72,zz],.075,shirt,7);beam([x+side*.31,.72,zz],[x+side*.3,.52,zz+.025],.055,skin,7);sphere(x+side*.3,.52,zz+.025,.065,.08,.065,skin,7,3);}
 if(style===1){box(x,.64,z+.205,.29,.42,.045,'#ac8b63');beam([x-.11,1,z+.21],[x+.11,.7,z+.23],.023,'#d4b988',5);}
 if(isPlayer){box(x,.76,z-.23,.28,.31,.12,'#a98054');for(const dx of [-.13,.13])beam([x+dx,1.02,z-.12],[x+dx,.75,z+.15],.025,'#c0a575',5);}
 bodyTransform=null;
}
function robot(x,z,walking){
 layer=-1;shadow(x,z,.38,.3,.088);layer=0;for(const dx of [-.24,.24])sphere(x+dx,.18,z,.105,.18,.2,'#425b60',8,4);box(x,.18,z,.49,.51,.42,'#c5a567');box(x,.3,z+.222,.33,.19,.035,'#e5cd91');
 cylinder(x,.7,z,.1,.09,'#71847f');sphere(x,.92,z,.27,.2,.22,'#bdc9bd',9,4);box(x,.89,z+.19,.34,.13,.04,'#455e68');for(const dx of [-.09,.09])sphere(x+dx,.965,z+.22,.025,.025,.02,'#a3cfc0',6,3);beam([x,1.08,z],[x+.02,1.3,z],.02,'#788d83',6);sphere(x+.02,1.31,z,.05,.05,.05,walking?'#becf8f':'#d4ad74',7,3);
}
function buildDynamic(){
 geo=newGeo();const s=window.townState,has=id=>s?.completed?.includes(id),t=reducedMotion?0:time;human(5,1,'#a76f58',Math.sin(t*.4)*.07);human(-1,-4,'#67877e',0,1);human(-5,2,'#938495',0,2);robot(s?.repair?4.35+Math.sin(t*.6)*.6:4.3,3.6,!!s?.repair);
 human(-14,1,'#778476',0,1);human(13,-1.2,'#a28b70',0,2);human(16,8.4,'#7d8c92');
 if(has('garden'))for(let i=0;i<5;i++)sphere(-6.3+i*.5,.38+Math.sin(t*3+i)*.025,-5,.03,.045,.03,'#b7d1c5',5,3);
 if(has('fan'))for(let i=0;i<4;i++){const a=t*5+i*Math.PI/2;beam([-6.6,.59,2.23],[-6.6+Math.cos(a)*.23,.59+Math.sin(a)*.23,2.23],.04,'#bec9bc',5);}
 human(player.x,player.z,'#d3ad60',moved?t*9:0,0,true,facing);
 const y=1.85+(reducedMotion?0:Math.sin(t*2)*.035),x=player.x,z=player.z;face([[x,y+.1,z],[x-.085,y,z+.04],[x,y-.1,z],[x+.085,y,z+.04]],'#f4d38e',1);dynamicGeo=finish(geo);
}
function project(x,y,z){const dx=x-camera.x,dz=z-camera.z;return {x:(.5+(dx-dz)*.7071068/(scale*aspect)*.5)*viewW,y:(.5-((y*.8164966-(dx+dz)*.4082483)/scale-.08)*.5)*viewH};}
function drawGL(g,buffer,upload){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);if(upload)gl.bufferData(gl.ARRAY_BUFFER,g.data,gl.DYNAMIC_DRAW);gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(color,3,gl.FLOAT,false,24,12);gl.drawArrays(gl.TRIANGLES,0,g.count);}
function drawCPU(){
 const cx=(camera.x-camera.z)*.7071068,cy=-(camera.x+camera.z)*.4082483,px=viewW/(2*scale*aspect),py=viewH/(2*scale),baseX=viewW/2-cx*px,baseY=viewH*.54+cy*py;let i=0,j=0;const a=staticGeo.faces,b=dynamicGeo.faces;
 while(i<a.length||j<b.length){let f;if(j>=b.length)f=a[i++];else if(i>=a.length)f=b[j++];else if(a[i].layer<b[j].layer||a[i].layer===b[j].layer&&a[i].depth<=b[j].depth)f=a[i++];else f=b[j++];
  if(baseX+f.maxX*px<0||baseX+f.minX*px>viewW||baseY-f.minY*py<0||baseY-f.maxY*py>viewH)continue;ctx.beginPath();
  for(let n=0;n<f.points.length;n++){const p=f.points[n],x=baseX+(p[0]-p[2])*.7071068*px,y=baseY-(p[1]*.8164966-(p[0]+p[2])*.4082483)*py;if(n)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fillStyle=f.css;ctx.fill();
 }
}
function render(){
 if(!gl&&!ctx)return;viewW=innerWidth;viewH=innerHeight;aspect=viewW/viewH;scale=(aspect<.8?10.5:aspect<1.2?9.6:8.6)/zoom;
 const dpr=Math.min(devicePixelRatio||1,gl?2:1.5),w=Math.round(viewW*dpr),h=Math.round(viewH*dpr);if(surface.width!==w||surface.height!==h){surface.width=w;surface.height=h;if(gl)gl.viewport(0,0,w,h);}
 if(!staticGeo||staticKey!==(window.townState?.completed||[]).join('|'))buildTown();buildDynamic();
 if(gl){gl.clearColor(.70,.76,.69,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(gl.getUniformLocation(program,'ratio'),aspect);gl.uniform1f(gl.getUniformLocation(program,'scale'),scale);gl.uniform2f(gl.getUniformLocation(program,'camera'),camera.x,camera.z);drawGL(staticGeo,staticBuffer,false);drawGL(dynamicGeo,dynamicBuffer,true);}
 else{ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#b3c2b0';ctx.fillRect(0,0,viewW,viewH);drawCPU();}updateUI();frameCount++;
}

/* Readable status text, not colour alone. No icons for finished/practice jobs. */
const style=document.createElement('style');style.textContent='.town-job-marker{position:fixed;z-index:4;display:flex;align-items:center;gap:5px;white-space:nowrap;transform:translate(-50%,-100%);padding:5px 8px 5px 5px;min-height:31px;border:1px solid #ffe9b1;background:#fff0c8;color:#3d463d;border-radius:8px;box-shadow:0 3px 10px #2a3b313d;font-size:9px;font-weight:800;letter-spacing:.35px;line-height:1.2}.town-job-marker:after{content:"";position:absolute;left:calc(50% - 5px);bottom:-6px;border:5px solid transparent;border-top-color:#fff0c8;border-bottom:0}.town-job-marker:hover{background:#fff6df}.town-job-marker:active{transform:translate(-50%,-100%) scale(.98)}.town-job-marker b{display:grid;place-items:center;width:19px;height:19px;background:#c49a41;color:#fff7dd;border-radius:50%;font-size:14px;line-height:1}.town-job-marker[data-status="active"]{background:#e2f1ed;border-color:#f7fffb}.town-job-marker[data-status="active"]:after{border-top-color:#e2f1ed}.town-job-marker[data-status="active"] b{background:#587e7c}.town-job-marker[hidden]{display:none!important}.town-zoom{position:fixed;right:23px;bottom:112px;z-index:4;display:flex;align-items:center;gap:3px;background:#19342edb;border:1px solid #ffffff30;border-radius:10px;padding:4px}.town-zoom button{padding:5px;width:31px;height:31px;border:0;background:transparent;font-size:20px;border-radius:6px}.town-zoom output{min-width:35px;font-size:9px;text-align:center;color:#e5e3cd}.town-zoom[hidden]{display:none}.district-label{position:fixed;pointer-events:none;transform:translate(-50%,-50%);font-size:9px;letter-spacing:1.5px;font-weight:700;color:#f9f6df;text-shadow:0 1px 5px #345347,0 1px 2px #345347;white-space:nowrap}.district-label[hidden]{display:none}.world-label{z-index:1}.town-job-marker:focus-visible{outline:3px solid #173d38;outline-offset:4px}@media(max-width:600px){.town-zoom{right:18px;bottom:162px}.town-zoom button{width:29px;height:28px}.town-job-marker{font-size:8px;padding:4px 6px 4px 4px;min-height:28px}.town-job-marker b{width:17px;height:17px;font-size:12px}.district-label{font-size:8px}}@media(max-height:550px){.town-zoom{bottom:94px;right:15px}.district-label{display:none}}';document.head.appendChild(style);
const markers={};for(const id of Object.keys(stops)){const el=document.createElement('button');el.type='button';el.className='town-job-marker';el.hidden=true;el.dataset.npc=id;el.innerHTML='<b aria-hidden="true">!</b><span></span>';el.onclick=()=>{if(!window.townPaused)window.TownScene.go(id);};document.body.appendChild(el);markers[id]=el;}
const zoomControls=document.createElement('div');zoomControls.className='town-zoom';zoomControls.setAttribute('role','group');zoomControls.setAttribute('aria-label','Town camera zoom');zoomControls.innerHTML='<button type="button" aria-label="Zoom out">−</button><output aria-label="Zoom level">100%</output><button type="button" aria-label="Zoom in">+</button>';document.body.appendChild(zoomControls);
const zoomButtons=zoomControls.querySelectorAll('button'),zoomOutput=zoomControls.querySelector('output');zoomButtons[0].onclick=()=>setZoom(zoom-.15);zoomButtons[1].onclick=()=>setZoom(zoom+.15);
function setZoom(value){zoom=clamp(Number(value)||1,.7,1.6);zoomOutput.textContent=Math.round(zoom*100)+'%';zoomButtons[0].disabled=zoom<=.7;zoomButtons[1].disabled=zoom>=1.6;}
const districts=[{name:'WILLOW ROW',x:-14,y:3.6,z:-1.2},{name:'HERON POND',x:15,y:.3,z:-12},{name:'TOWN HALL',x:14,y:5.8,z:11},{name:'COMMUNITY GARDENS',x:-15,y:1,z:14}];
for(const d of districts){d.el=document.createElement('div');d.el.className='district-label';d.el.textContent=d.name;document.body.appendChild(d.el);}
function npcStatus(id){const s=window.townState;if(s?.npcJobs)return s.npcJobs[id]||'complete';if(window.townQuestState?.npcJobs)return window.townQuestState.npcJobs[id]||'complete';const j=window.TownCore?.jobs[s?.completed?.length||0];if(!j)return 'complete';if(id==='store')return s?.inventory?.includes(j.part)?'complete':'available';return j.place===id?(s?.accepted?'active':'available'):'complete';}
function updateUI(){
 const paused=!!window.townPaused;zoomControls.hidden=paused;
 for(const [id,el] of Object.entries(markers)){const status=npcStatus(id),s=stops[id],p=project(s.x,1.95,s.z),visible=!paused&&(status==='available'||status==='active')&&p.x>45&&p.x<viewW-45&&p.y>83&&p.y<viewH-115;
  el.hidden=!visible;if(!visible)continue;el.style.left=p.x+'px';el.style.top=p.y+'px';el.dataset.status=status;
  const text=id==='store'?'PARTS NEEDED':status==='active'?'JOB ACTIVE':'NEW JOB';el.querySelector('b').textContent=id==='store'?'+':status==='active'?'…':'!';el.querySelector('span').textContent=text;el.setAttribute('aria-label',(id==='yard'?'Iris':id==='lab'?'Evelyn':'Parts store')+': '+text.toLowerCase()+'. Visit '+(id==='yard'?'repair yard':id==='lab'?'your lab':'store'));el.title=el.getAttribute('aria-label');
 }
 for(const [id,x,y,z] of [['lab',-5,3.6,0],['store',-1,3.5,-6],['yard',5,2.95,-1]]){const el=document.querySelector('.label-'+id);if(!el)continue;const p=project(x,y,z);el.hidden=paused||p.x<45||p.x>viewW-45||p.y<85||p.y>viewH-120;el.style.left=p.x+'px';el.style.top=p.y+'px';}
 for(const d of districts){const p=project(d.x,d.y,d.z);d.el.hidden=paused||Math.hypot(d.x-player.x,d.z-player.z)>14||p.x<80||p.x>viewW-80||p.y<95||p.y>viewH-150;d.el.style.left=p.x+'px';d.el.style.top=p.y+'px';}
}
function allowed(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&x>=bounds.minX&&x<=bounds.maxX&&z>=bounds.minZ&&z<=bounds.maxZ&&!buildings.some(b=>Math.abs(x-b.x)<b.w/2+.23&&Math.abs(z-b.z)<b.d/2+.23)&&!obstacles.some(o=>((x-o.x)/o.rx)**2+((z-o.z)/o.rz)**2<1);}
function safePosition(){
 if(allowed(player.x,player.z))return false;const x=Number.isFinite(player.x)?clamp(player.x,-20,20):0,z=Number.isFinite(player.z)?clamp(player.z,-20,20):5;
 for(let r=.25;r<=8;r+=.25)for(let i=0;i<24;i++){const xx=clamp(x+Math.cos(i*Math.PI/12)*r,-20,20),zz=clamp(z+Math.sin(i*Math.PI/12)*r,-20,20);if(allowed(xx,zz)){player.x=xx;player.z=zz;return true;}}
 player.x=0;player.z=5;return true;
}
function frame(ms){
 const dt=Math.min((ms-last)/1000||0,.04);last=ms;time+=dt;moved=false;
 if(!ready){buildTown();safePosition();camera.x=player.x;camera.z=player.z;ready=true;}
 // Imports can replace coordinates while the save dialog is still open.
 safePosition();
 if(!document.hidden&&!window.townPaused){
  const right=+(keys.has('ArrowRight')||keys.has('d'))-+(keys.has('ArrowLeft')||keys.has('a')),down=+(keys.has('ArrowDown')||keys.has('s'))-+(keys.has('ArrowUp')||keys.has('w'));let dx=(right+down)*.7071068,dz=(down-right)*.7071068,n=Math.hypot(dx,dz);if(n>1){dx/=n;dz/=n;}
  const oldX=player.x,oldZ=player.z;
  const nx=player.x+dx*dt*3.9,nz=player.z+dz*dt*3.9;if(allowed(nx,player.z)){moved=moved||Math.abs(nx-player.x)>.001;player.x=nx;}if(allowed(player.x,nz)){moved=moved||Math.abs(nz-player.z)>.001;player.z=nz;}
  const actualX=player.x-oldX,actualZ=player.z-oldZ;moved=Math.hypot(actualX,actualZ)>1e-8;if(moved)facing=Math.atan2(actualX,actualZ);
  near=Object.keys(stops).find(k=>Math.hypot(stops[k].x-player.x,stops[k].z-player.z)<1.5)||null;const e=document.getElementById('interact');e.hidden=!near;if(near)e.textContent=(near==='yard'?'Talk to Iris':near==='store'?'Visit parts store':'Talk to Evelyn')+' · E';
 }else{const e=document.getElementById('interact');if(e)e.hidden=true;}
 const follow=reducedMotion?1:1-Math.exp(-dt*7);camera.x+=(player.x-camera.x)*follow;camera.z+=(player.z-camera.z)*follow;
 if(!document.hidden&&(gl||ms-lastDraw>=1000/30)){render();lastDraw=ms;}requestAnimationFrame(frame);
}
addEventListener('keydown',e=>{if(window.townPaused||e.ctrlKey||e.metaKey||e.altKey)return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','e'].includes(key)){e.preventDefault();if(key==='e'){if(near&&!e.repeat)window.dispatchEvent(new CustomEvent('town-arrive',{detail:near}));}else keys.add(key);}});
addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{if(window.townPaused)return;keys.add(b.dataset.key);b.setPointerCapture(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key));}
document.getElementById('interact').onclick=()=>{if(near&&!window.townPaused)window.dispatchEvent(new CustomEvent('town-arrive',{detail:near}));};
surface.addEventListener('wheel',e=>{if(window.townPaused||!e.ctrlKey)return;e.preventDefault();setZoom(zoom-Math.sign(e.deltaY)*.08);},{passive:false});
window.TownScene={player,stops,bounds,project,setZoom,get zoom(){return zoom;},get facing(){return facing;},isWalkable:allowed,ensureSafePosition:safePosition,
 getMapInfo(){return {bounds:{...bounds},player:{...player},stops,buildings:buildings.map(({x,z,w,d})=>({x,z,w,d})),districts:districts.map(({name,x,z})=>({name,x,z})),renderer:gl?'webgl':'canvas3d',frameCount,staticFaces:staticGeo?.faces.length||0};},
 go(id){const s=stops[id];if(!s)return false;keys.clear();player.x=s.x;player.z=s.z+.8;safePosition();facing=Math.atan2(s.x-player.x,s.z-player.z);moved=false;camera.x=player.x;camera.z=player.z;window.dispatchEvent(new CustomEvent('town-arrive',{detail:id}));return true;},
 clear(){keys.clear();near=null;}
};
requestAnimationFrame(frame);
})();
