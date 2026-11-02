/* Code Quest's action world: persistent geometry and articulated, interpolated actions.
 * Three.js is vendored locally. No player program is executed here. */
import {createFallbackAdapter} from './scene-fallback.js';

const PI=Math.PI, clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const yawFor=dir=>({east:PI/2,south:0,west:-PI/2,north:PI}[dir]??PI/2);
const archetypeFor=index=>['wraith','crawler','hound','lurker','sentinel','sentinel','wraith','crawler','hound','hound','wraith','sentinel','wraith','wraith'][index]||'sentinel';
const angle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
const worldPos=pos=>({x:((pos?.x??1)-3)*1.05,z:((pos?.y??2)-1.5)*1.05,yaw:yawFor(pos?.dir)});
const clone=value=>JSON.parse(JSON.stringify(value));

export async function createScene({container,reducedMotion=()=>false,onStatus=()=>{}}={}){
  if(!container)throw new Error('Code Quest needs a world container.');
  const reduce=()=>typeof reducedMotion==='function'?reducedMotion():Boolean(reducedMotion);
  let adapter,mode='fallback',renderCount=0,token=0,raf=null,pending=null,activeFinish=null,disposed=false;
  let state={
    theme:'workshop',index:0,progress:0,action:'ready',time:0,
    actor:{x:-2.1,y:0,z:.525,yaw:PI/2,headYaw:0,armAngle:0,legAngle:0,reach:0,carrying:false,awake:false},
    device:{energy:0,gateOpen:0,collected:[],beam:0,lever:0},
    items:[],reward:{x:2.25,y:.95,z:-.7,visible:true,claimed:false},
    encounter:{route:'safe',blocking:false,revealed:false,creature:{x:1.8,y:0,z:-2.5,armAngle:0,visible:false}}
  };
  try{
    const THREE=await import('./vendor/three.module.min.js');
    adapter=createWebGLAdapter(THREE,container,()=>{
      if(disposed||mode!=='webgl')return;
      adapter.dispose();container.replaceChildren();
      adapter=createFallbackAdapter({container,onStatus});mode='fallback';container.dataset.graphics=mode;
      onStatus('3D graphics were interrupted. The lighter animated world keeps the quest playable.');
      // Retire the GPU frame and settle its exact endpoint before continuing.
      // Pending lesson promises resolve; no abandoned callback can later redraw.
      if(activeFinish)activeFinish();else render();
    });
    mode='webgl';
    onStatus('Interactive 3D world · walking, mechanisms and carried quest parts');
  }catch(error){
    container.replaceChildren();
    adapter=createFallbackAdapter({container,onStatus});
    onStatus('Interactive illustrated world · 3D graphics are unavailable on this device');
  }
  container.dataset.graphics=mode;
  const actorIdentity=adapter.actorId||'persistent-canvas-actor';
  function render(){
    if(disposed)return;
    renderCount++;
    adapter.render(state);
    container.dataset.action=state.action;
    container.dataset.actorX=state.actor.x.toFixed(3);
    container.dataset.actorZ=state.actor.z.toFixed(3);
  }
  function cancel(){
    token++;
    if(raf!==null){cancelAnimationFrame(raf);raf=null;}
    if(pending){const resolve=pending;pending=null;resolve({cancelled:true});}
    activeFinish=null;
  }
  function tween(duration,update){
    cancel();
    const ticket=token;
    state.frameDuration=duration;state.frameProgress=0;state.frameElapsed=0;
    if(reduce()||duration<=0){state.frameProgress=1;state.frameElapsed=duration;update(1);render();return Promise.resolve({cancelled:false});}
    update(0);render();
    return new Promise(resolve=>{
      pending=resolve;const start=performance.now(),time=state.time;
      activeFinish=()=>{
        if(ticket!==token||disposed)return;
        if(raf!==null){cancelAnimationFrame(raf);raf=null;}
        state.frameProgress=1;state.frameElapsed=duration;update(1);render();
        pending=null;activeFinish=null;resolve({cancelled:false,graphicsFallback:true});
      };
      const tick=now=>{
        if(ticket!==token||disposed)return;
        const t=reduce()?1:clamp((now-start)/Math.max(1,duration));
        state.time=time+(now-start)/1000;
        state.frameProgress=t;state.frameElapsed=Math.min(duration,now-start);
        update(t);render();
        if(t<1)raf=requestAnimationFrame(tick);
        else{raf=null;pending=null;activeFinish=null;resolve({cancelled:false});}
      };
      raf=requestAnimationFrame(tick);
    });
  }
  function neutral(){
    state.actor.armAngle=0;state.actor.legAngle=0;state.actor.headYaw=0;state.actor.reach=0;
  }
  function reset({mission={},index=0,cleared=[],inventory=[],encounter}={}){
    cancel();
    const point=worldPos(mission.start);
    const completed=Array.isArray(cleared)?cleared.filter(Boolean).length:0;
    const spatial=[2,3,7,8,11].includes(index),destination=worldPos(mission.target);
    const rewardX=spatial?destination.x:2.25,rewardZ=spatial?destination.z-.55:-.7;
    const rewardId=mission.quest?.reward?.id||'quest-part-'+index;
    const rewardKind=mission.quest?.reward?.kind||([0,1,2,5,8,9,12].includes(index)?'part':'passage');
    const ids=Array.isArray(inventory)?inventory:[];
    const claimed=ids.includes(rewardId)||(Array.isArray(cleared)&&cleared[index]===true);
    const partIds=new Set(['pix-companion','ward-lantern','twin-crypt-keys','warden-seal','focusing-lens','ward-crystal-set','beacon-heart']);
    state={
      theme:mission.theme||'workshop',index,progress:completed/14,action:'ready',time:0,frameDuration:0,frameProgress:0,frameElapsed:0,
      actor:{...point,y:0,headYaw:0,armAngle:0,legAngle:0,reach:0,carrying:ids.some(id=>partIds.has(id))||(rewardKind==='part'&&ids.includes(rewardId)),awake:index>0},
      device:{energy:0,gateOpen:encounter?.revealed&&encounter?.blocking===false?1:0,collected:[],beam:completed===14?1:0,lever:0},
      items:[1,2,3].map((id,i)=>({id,x:.6+i*.95,y:.48,z:-.6-(i%2)*.65,visible:true})),
      reward:{id:rewardId,kind:rewardKind,x:rewardX,y:.95,z:rewardZ,homeX:rewardX,homeZ:rewardZ,visible:!claimed,claimed},
      spatial,destination,
      encounter:{route:encounter?.route||'safe',blocking:Boolean(encounter?.blocking),revealed:Boolean(encounter?.revealed),creature:{archetype:archetypeFor(index),x:.9,y:0,z:1.25,armAngle:0,visible:encounter?.route==='ambush'&&Boolean(encounter?.revealed)&&Boolean(encounter?.blocking)}},
      objective:mission.objective||'',inventory:Array.isArray(inventory)?inventory:[]
    };
    render();return snapshot();
  }
  function setPose(pos){cancel();Object.assign(state.actor,worldPos(pos));neutral();render();}
  async function playFrame(frame,duration=700){
    const a=frame?.action||{type:'wait'},target=worldPos(frame?.pos),start={...state.actor};
    const before={...state.device,collected:state.device.collected.slice()};
    state.action=a.type;
    const durationMs=Math.max(450,Number(duration)||700);
    const item=state.items.find(value=>value.id===a.value);
    const itemStart=item?{...item}:null;
    let result;
    if(a.type==='step'||a.type==='move'){
      result=await tween(durationMs,t=>{
        const p=smooth(t);state.actor.x=mix(start.x,target.x,p);state.actor.z=mix(start.z,target.z,p);
        state.actor.yaw=angle(start.yaw,target.yaw,clamp(t*3));
        state.actor.legAngle=Math.sin(t*PI*4)*.55*Math.sin(PI*t);
        state.actor.armAngle=-state.actor.legAngle*.7;
        state.actor.y=0;state.actor.headYaw=0;
      });
    }else if(a.type==='turn'){
      result=await tween(Math.max(550,durationMs),t=>{
        state.actor.yaw=angle(start.yaw,target.yaw,smooth(t));
        state.actor.headYaw=Math.sin(PI*t)*.25;
        state.actor.legAngle=Math.sin(t*PI*4)*.17*Math.sin(PI*t);
      });
    }else if(a.type==='say'){
      result=await tween(Math.max(950,durationMs),t=>{
        state.actor.awake=t>.1||start.awake;
        state.actor.headYaw=Math.sin(t*PI*2)*.23*Math.sin(PI*t);
        state.actor.armAngle=-Math.sin(PI*t)*1.15;state.actor.reach=Math.sin(PI*t)*.25;
      });
    }else if(a.type==='charge'||a.type==='openGate'){
      const operator={x:-.9,z:.1};
      const dx=operator.x-start.x,dz=operator.z-start.z,length=Math.hypot(dx,dz)||1;
      const reachPoint={x:start.x+dx/length*Math.min(.55,length),z:start.z+dz/length*Math.min(.55,length)};
      const facing=Math.atan2(dx,dz);
      result=await tween(Math.max(1250,durationMs),t=>{
        const approach=t<.25?smooth(t/.25):t>.82?1-smooth((t-.82)/.18):1;
        state.actor.x=mix(start.x,reachPoint.x,approach);state.actor.z=mix(start.z,reachPoint.z,approach);
        state.actor.yaw=angle(start.yaw,facing,approach);
        state.actor.armAngle=-1.35*Math.sin(PI*clamp((t-.2)/.65));
        state.actor.reach=Math.sin(PI*clamp((t-.18)/.65));
        state.device.lever=Math.sin(PI*clamp((t-.27)/.6));
        if(a.type==='charge')state.device.energy=mix(before.energy,clamp(a.value,0,3),smooth(clamp((t-.38)/.5)));
        else state.device.gateOpen=mix(before.gateOpen,1,smooth(clamp((t-.3)/.65)));
      });
    }else if(a.type==='collect'){
      const destination=itemStart||{x:1.5,y:.5,z:-.6};
      const near={x:destination.x-.42,z:destination.z+.5};
      result=await tween(Math.max(1500,durationMs),t=>{
        const reach=t<.38?smooth(t/.38):t>.75?1-smooth((t-.75)/.25):1;
        state.actor.x=mix(start.x,near.x,reach);state.actor.z=mix(start.z,near.z,reach);
        state.actor.yaw=angle(start.yaw,Math.atan2(destination.x-near.x,destination.z-near.z),reach);
        state.actor.legAngle=(t<.38||t>.75)?Math.sin(t*PI*10)*.35*Math.sin(PI*t):0;
        state.actor.armAngle=-1.5*Math.sin(PI*clamp((t-.3)/.5));state.actor.reach=Math.sin(PI*clamp((t-.3)/.5));
        if(item){
          const lift=smooth(clamp((t-.42)/.32));
          item.x=mix(destination.x,state.actor.x,lift);item.z=mix(destination.z,state.actor.z-.17,lift);
          item.y=mix(destination.y,1.05,lift);
          item.visible=t<.8;
        }
        state.actor.carrying=t>.72||start.carrying;
      });
      if(!result.cancelled&&!state.device.collected.includes(a.value))state.device.collected.push(a.value);
    }else result=await tween(Math.min(450,durationMs),()=>{});
    if(!result.cancelled){
      state.actor.x=target.x;state.actor.z=target.z;state.actor.yaw=target.yaw;state.actor.y=0;neutral();
      state.device.lever=0;
      state.action='ready';render();
    }
    return result;
  }
  function enterEncounter({route='safe'}={}){
    const previous={...state.actor};
    state.action='encounter';state.encounter.route=route;state.encounter.revealed=true;
    state.encounter.blocking=true;
    const creature=state.encounter.creature;
    creature.visible=route==='ambush';
    return tween(1000,t=>{
      if(route==='ambush'){
        creature.x=mix(4.4,.9,smooth(t));creature.z=mix(1.45,1.25,smooth(t));
        creature.y=Math.sin(PI*t)*1.6;creature.armAngle=Math.sin(PI*t)*1.4;
        state.actor.x=previous.x-Math.sin(PI*t)*.22;state.actor.z=previous.z-Math.sin(PI*t)*.2;state.actor.armAngle=-Math.sin(PI*t)*.85;
        state.actor.headYaw=-Math.sin(PI*t)*.35;
      }else if(route==='detour'){
        state.device.gateOpen=0;
        state.actor.headYaw=Math.sin(PI*t)*.3;
      }else{
        state.actor.headYaw=Math.sin(PI*t)*-.2;
      }
      if(t===1){creature.y=0;creature.armAngle=0;state.actor.x=previous.x;state.actor.z=previous.z;neutral();state.action='ready';}
    });
  }
  async function complete({mission={},index=state.index,cleared=[],success=true}={}){
    state.action=success?'claim':'retry';
    if(!success){
      const start=state.encounter.creature.armAngle;
      const gateBefore=state.device.gateOpen;
      const result=await tween(450,t=>{
        state.actor.headYaw=Math.sin(PI*t)*-.25;
        state.encounter.creature.armAngle=start+Math.sin(PI*t)*.5;
        state.device.gateOpen=mix(gateBefore,0,smooth(t));
      });
      if(!result.cancelled){
        neutral();state.device.gateOpen=0;state.encounter.blocking=Boolean(state.encounter.revealed);
        state.encounter.creature.visible=state.encounter.route==='ambush'&&state.encounter.revealed;
        state.action='ready';render();
      }return result;
    }
    const actor={...state.actor},part={...state.reward},creature={...state.encounter.creature};
    const pickup=part.kind==='part'&&!part.claimed;
    const near={x:part.x-.35,z:part.z+.5};
    const result=await tween(pickup?1900:1100,t=>{
      const approach=pickup?(t<.35?smooth(t/.35):t>.79?1-smooth((t-.79)/.21):1):0;
      state.actor.x=mix(actor.x,near.x,approach);state.actor.z=mix(actor.z,near.z,approach);
      state.actor.yaw=angle(actor.yaw,Math.atan2(part.x-near.x,part.z-near.z),approach);
      state.actor.legAngle=pickup&&(t<.35||t>.79)?Math.sin(t*PI*10)*.4*Math.sin(PI*t):0;
      const reach=Math.sin(PI*clamp((t-.32)/.48));
      state.actor.armAngle=-reach*1.35;state.actor.reach=reach;
      const u=smooth(clamp((t-.43)/.3));
      if(pickup){
        state.reward.x=mix(part.x,state.actor.x,u);state.reward.y=mix(part.y,1.05,u)+Math.sin(PI*u)*.25;
        state.reward.z=mix(part.z,state.actor.z-.18,u);state.reward.visible=t<.79;
      }
      state.actor.carrying=(pickup&&t>.7)||actor.carrying;
      if(!pickup)state.device.lever=Math.sin(PI*t);
      if(state.encounter.blocking){
        state.encounter.creature.x=mix(creature.x,2.9,smooth(t));
        state.encounter.creature.z=mix(creature.z,-2.5,smooth(t));
        state.encounter.creature.y=Math.sin(PI*t)*.35;
        state.encounter.creature.armAngle=-Math.sin(PI*t)*.5;
      }
      state.device.gateOpen=Math.max(state.device.gateOpen,smooth(t));
      if(index===13)state.device.beam=smooth(t);
      state.progress=mix(state.progress,Array.isArray(cleared)?Math.max((index+1)/14,cleared.filter(Boolean).length/14):(index+1)/14,smooth(t));
    });
    if(!result.cancelled){
      state.actor.x=actor.x;state.actor.z=actor.z;state.actor.yaw=actor.yaw;
      state.reward.claimed=true;state.reward.visible=false;state.encounter.blocking=false;
      state.encounter.creature.visible=false;state.encounter.creature.y=0;state.encounter.creature.armAngle=0;state.actor.carrying=pickup||actor.carrying;state.device.lever=0;neutral();state.action='ready';render();
    }
    return result;
  }
  function snapshot(){
    return clone({...state,mode,renderCount,actor:{...state.actor,id:actorIdentity},threat:{strength:clamp(1-state.progress),visible:state.progress<.97,retreat:state.progress*5},camera:adapter.cameraState?.()||null,renderer:adapter.stats?.()||null});
  }
  const resize=()=>{adapter.resize?.();render();};
  let observer=null;
  if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(container);}
  else window.addEventListener('resize',resize);
  const visibility=()=>{if(document.hidden)cancel();};
  document.addEventListener('visibilitychange',visibility);
  function dispose(){cancel();disposed=true;observer?.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);adapter.dispose?.();}
  reset();
  return {reset,setPose,playFrame,enterEncounter,complete,cancel,snapshot,dispose,get mode(){return mode;}};
}

function createWebGLAdapter(T,container,onContextLost){
  const scene=new T.Scene();scene.background=new T.Color(0x111e2a);scene.fog=new T.Fog(0x182736,12,32);
  const camera=new T.PerspectiveCamera(43,1,.1,70);
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;position:absolute;inset:0';
  renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.className='cq-world-canvas';
  container.replaceChildren(renderer.domElement);
  const contextLost=event=>{event.preventDefault();onContextLost?.();};
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  const materials=[],geometries=[],textures=[];
  const mat=(color,roughness=.65,metalness=.05,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness,metalness,...extra});materials.push(m);return m;};
  function texture(kind){
    const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
    if(kind==='stone'){
      x.fillStyle='#748084';x.fillRect(0,0,128,128);
      for(let row=0;row<4;row++)for(let col=0;col<4;col++){
        const v=75+((row*37+col*19)%35);x.fillStyle='rgb('+v+','+(v+8)+','+(v+11)+')';
        x.fillRect(col*32+2+(row%2)*-8,row*32+2,29,29);
        x.strokeStyle='#343f45';x.strokeRect(col*32+2+(row%2)*-8,row*32+2,29,29);
      }
    }else if(kind==='wood'){
      x.fillStyle='#6f4c30';x.fillRect(0,0,128,128);
      for(let i=0;i<32;i++){x.strokeStyle=i%2?'#97704a':'#503722';x.beginPath();x.moveTo(0,i*4);x.bezierCurveTo(40,i*4+3,70,i*4-3,128,i*4);x.stroke();}
      for(let i=0;i<4;i++){x.fillStyle='#292a28';x.fillRect(0,i*32,128,2);}
    }else{
      x.fillStyle='#5b7075';x.fillRect(0,0,128,128);
      for(let i=0;i<70;i++){x.fillStyle='rgba(185,213,210,'+(.03+(i%4)*.02)+')';x.fillRect(0,(i*19)%128,128,1);}
      x.strokeStyle='#324349';x.strokeRect(2,2,124,124);
    }
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;
    tex.repeat.set(kind==='stone'?3:1,kind==='stone'?3:1);tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(tex);return tex;
  }
  const stone=mat(0x7d8887,.84,.03,{map:texture('stone')});
  const darkStone=mat(0x394951,.94,.02),edgeStone=mat(0x8b9188,.8),wood=mat(0x9c7955,.85,.02,{map:texture('wood')});
  const iron=mat(0x627b83,.4,.6,{map:texture('metal')}),bronze=mat(0xb78a4d,.36,.6),black=mat(0x18262e,.46,.25);
  const robotMetal=mat(0x8fb6b7,.31,.65),robotTrim=mat(0x416875,.35,.7),rubber=mat(0x15252c,.86,.05);
  const glass=mat(0x223842,.22,.45),eyes=mat(0xb9f7f6,.18,.05,{emissive:0x68e8ee,emissiveIntensity:2.3});
  const amber=mat(0xffd389,.2,.25,{emissive:0xffb341,emissiveIntensity:1.5});
  const cyan=mat(0x91d4da,.23,.3,{emissive:0x3ab2cb,emissiveIntensity:.85});
  const seaMat=mat(0x1b4d62,.25,.3),threatMat=mat(0x243745,.86),moss=mat(0x466259,.95),roof=mat(0x76594e,.9);
  const make=(g,m,parent,x=0,y=0,z=0)=>{geometries.push(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;(parent||scene).add(o);return o;};
  const box=(parent,w,h,d,m,x=0,y=0,z=0)=>make(new T.BoxGeometry(w,h,d),m,parent,x,y,z);
  const bevelBox=(parent,w,h,d,m,x=0,y=0,z=0,r=.035)=>{
    const shape=new T.Shape(),hw=w/2-r,hh=h/2-r;
    shape.moveTo(-hw,-hh);shape.lineTo(hw,-hh);shape.lineTo(hw,hh);shape.lineTo(-hw,hh);shape.closePath();
    const geometry=new T.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,steps:1});
    geometry.translate(0,0,-(d-2*r)/2);return make(geometry,m,parent,x,y,z);
  };
  const cylinder=(parent,r1,r2,h,m,x=0,y=0,z=0,n=14)=>make(new T.CylinderGeometry(r1,r2,h,n),m,parent,x,y,z);
  const sphere=(parent,r,m,x=0,y=0,z=0)=>make(new T.SphereGeometry(r,14,10),m,parent,x,y,z);
  const torus=(parent,r,t,m,x=0,y=0,z=0)=>make(new T.TorusGeometry(r,t,8,28),m,parent,x,y,z);
  const group=(parent,x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);(parent||scene).add(g);return g;};
  const hemi=new T.HemisphereLight(0xa9d5e3,0x3e332a,1.85);scene.add(hemi);
  const key=new T.DirectionalLight(0xffdfb5,3.1);key.position.set(-3,9,6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-8,right:8,top:7,bottom:-7,near:.5,far:24});key.shadow.bias=-.0007;key.shadow.normalBias=.025;scene.add(key);
  const rim=new T.DirectionalLight(0x84b6e5,1.8);rim.position.set(7,6,-9);scene.add(rim);
  const torch=new T.PointLight(0xffa658,32,10,2);torch.position.set(-2.5,2.1,-1.5);scene.add(torch);
  const beaconLight=new T.PointLight(0xffce6b,0,20,2);beaconLight.position.set(3.3,3,-5);scene.add(beaconLight);
  const platform=group();box(platform,9,.45,6,stone,0,-.25,0);box(platform,9.15,.2,6.15,darkStone,0,-.52,0);
  // Raised border blocks and visible side faces give the path real thickness.
  for(let i=0;i<9;i++){box(platform,.98,.4,.42,edgeStone,-4+i,.03,-2.85);if(i<3||i>5)box(platform,.98,.25,.4,darkStone,-4+i,-.04,2.85);}
  const tileMat=mat(0xa3aaa0,.85,.04);
  const trail=group();for(let i=0;i<7;i++){const slab=box(trail,.97,.07,.93,tileMat,(i-3)*1.05,.015,.525);slab.rotation.y=(i%2)*.018;}
  // A town and incoming storm are seen through the dungeon's open rear arch.
  const town=group(scene,0,-.85,-11);
  for(let i=0;i<7;i++){
    const x=(i-3)*1.1,z=(i%2)*-.6;
    box(town,.85,1.3+(i%3)*.24,.8,darkStone,x,.5,z);
    const roofMesh=cylinder(town,.02,.73,.5,roof,x,1.5+(i%3)*.24,z,4);roofMesh.rotation.y=PI/4;
    for(let j=0;j<2;j++)box(town,.14,.24,.025,amber,x-.22+j*.42,.75,z+.415);
  }
  const ocean=box(scene,35,.1,13,seaMat,0,-1.05,-13);ocean.castShadow=false;
  const wave=group(scene,0,-.68,-14.8);
  for(let i=0;i<8;i++){const rock=sphere(wave,1.2+(i%3)*.2,threatMat,(i-3.5)*2.1,.2,-.2);rock.scale.set(1.2,.75,.5);rock.castShadow=false;}
  const clouds=group(scene,0,5,-19);
  for(let i=0;i<8;i++){const cloud=sphere(clouds,1.5+(i%3)*.4,threatMat,(i-3.5)*2.3,(i%2)*.5,0);cloud.scale.set(1.5,.5,.6);cloud.castShadow=false;}
  // The present threat is physical hood/cloak/claw geometry beyond the arch.
  // It retreats only as the ward is repaired, never on an idle bobbing loop.
  const wraith=group(scene,-.8,-.2,-7.4);
  const wraithCloth=mat(0x35455c,.96,.02,{emissive:0x365a7d,emissiveIntensity:.3,transparent:true,opacity:.88,side:T.DoubleSide});
  const wraithFace=mat(0x05090f,.99,.01,{transparent:true,opacity:.97});
  const wraithEyes=mat(0xffd3a4,.2,.01,{emissive:0xff7644,emissiveIntensity:3,transparent:true,opacity:1});
  const cloakGeometry=new T.ConeGeometry(.8,1.85,9,1,true);
  const cloakPositions=cloakGeometry.attributes.position;
  for(let i=0;i<cloakPositions.count;i++)if(cloakPositions.getY(i)<0)cloakPositions.setY(i,cloakPositions.getY(i)+(i%3)*.11);
  cloakGeometry.computeVertexNormals();make(cloakGeometry,wraithCloth,wraith,0,1,0);
  const hood=sphere(wraith,.57,wraithCloth,0,1.96,.03);hood.scale.set(.95,1.13,.9);
  const face=sphere(wraith,.41,wraithFace,0,1.97,.38);face.scale.set(.85,.9,.4);
  for(const x of [-.13,.13])sphere(wraith,.052,wraithEyes,x,2.04,.54);
  const hoodTip=make(new T.ConeGeometry(.4,.82,7),wraithCloth,wraith,-.04,2.43,-.06);hoodTip.rotation.z=.17;
  for(const sign of [-1,1]){
    const arm=group(wraith,sign*.58,1.6,0);arm.name='wraith-arm-'+sign;arm.rotation.z=-sign*.65;
    cylinder(arm,.13,.19,.65,wraithCloth,0,-.31,0,7);
    const hand=group(arm,0,-.69,.12);sphere(hand,.16,wraithCloth);
    for(let j=0;j<3;j++){
      const claw=make(new T.ConeGeometry(.036,.38,5),bronze,hand,(j-1)*.11,-.21,.09);
      claw.rotation.x=.35;claw.rotation.z=(j-1)*.16;
    }
  }
  const arch=group();
  for(const x of [-4,4]){box(arch,.7,4.8,.9,stone,x,2.15,-2.5);box(arch,1.05,.25,1.1,edgeStone,x,4.35,-2.5);}
  box(arch,8.7,.5,.95,darkStone,0,4.65,-2.5);
  for(let i=0;i<8;i++){const vous=box(arch,.72,.5,.9,edgeStone,(i-3.5)*.75,3.9+Math.cos((i-3.5)*.21)*.32,-2.5);vous.rotation.z=-(i-3.5)*.045;}
  const sideArches=group();
  for(const sign of [-1,1]){
    const a=group(sideArches,sign*3.65,0,-.3);a.rotation.y=sign*PI/2;
    box(a,.36,2.6,.5,stone,-.8,1.2,0);box(a,.36,2.6,.5,stone,.8,1.2,0);box(a,1.95,.4,.6,edgeStone,0,2.65,0);
    box(a,1.5,.08,2.3,wood,0,.04,-1.1);
  }
  const target=group(scene,2.25,0,-.7);cylinder(target,.48,.58,.6,darkStone,0,.3,0);cylinder(target,.54,.54,.1,bronze,0,.65,0);
  const destinationRing=torus(scene,.46,.045,amber,0,.07,0);destinationRing.rotation.x=-PI/2;
  const reward=group(),rewardParts={};
  for(const name of ['module','lantern','keys','seal','lens','crystals','heart'])rewardParts[name]=group(reward);
  const module=rewardParts.module;sphere(module,.18,amber);const moduleRing=torus(module,.27,.065,bronze);moduleRing.rotation.x=PI/2;
  const moduleAxis=box(module,.07,.58,.07,iron);moduleAxis.rotation.z=PI/4;
  const lantern=rewardParts.lantern;cylinder(lantern,.17,.21,.4,amber,0,0,0);cylinder(lantern,.23,.23,.07,bronze,0,-.24,0);cylinder(lantern,.22,.22,.07,bronze,0,.24,0);
  for(let i=0;i<4;i++)cylinder(lantern,.018,.018,.48,bronze,Math.cos(i*PI/2)*.19,0,Math.sin(i*PI/2)*.19,8);
  torus(lantern,.14,.025,bronze,0,.38,0);
  const keys=rewardParts.keys;for(const sign of [-1,1]){const key=group(keys,sign*.13,0,sign*.035);key.rotation.z=sign*.17;torus(key,.12,.034,bronze,0,.2,0);cylinder(key,.032,.032,.4,bronze,0,-.09,0,8);box(key,.11,.055,.06,bronze,.045,-.24,0);box(key,.09,.045,.06,bronze,.035,-.13,0);}
  const seal=rewardParts.seal;const medallion=cylinder(seal,.25,.25,.085,bronze);medallion.rotation.x=PI/2;const runeMark=box(seal,.13,.13,.025,cyan,0,0,.06);runeMark.rotation.z=PI/4;
  const lensPart=rewardParts.lens;torus(lensPart,.26,.055,bronze);const lensGlass=sphere(lensPart,.22,glass);lensGlass.scale.z=.18;
  const crystals=rewardParts.crystals;for(let i=0;i<3;i++){const crystal=make(new T.ConeGeometry(.105,.45,5),cyan,crystals,(i-1)*.17,(i%2)*.08,0);crystal.rotation.z=(i-1)*.16;}
  const heart=rewardParts.heart;sphere(heart,.18,amber);torus(heart,.26,.035,bronze).rotation.y=PI/2;torus(heart,.26,.035,bronze).rotation.x=PI/2;
  const rewardGlow=new T.PointLight(0xffb855,5,3,2);reward.add(rewardGlow);
  const terminal=group(scene,-.9,0,.1);box(terminal,.5,.8,.45,iron,0,.4,0);box(terminal,.63,.1,.55,bronze,0,.84,0);
  const lever=group(terminal,0,.92,0);cylinder(lever,.035,.035,.4,bronze,0,.2,0);sphere(lever,.085,rubber,0,.41,0);
  const energyCells=[];for(let i=0;i<3;i++){const cell=cylinder(terminal,.085,.085,.27,cyan,-.18+i*.18,.58,.245);cell.rotation.x=PI/2;energyCells.push(cell);}
  const gate=group(scene,2.8,0,-2.25);
  box(gate,.25,2.9,.4,stone,-.95,1.4,0);box(gate,.25,2.9,.4,stone,.95,1.4,0);box(gate,2.2,.25,.6,stone,0,2.9,0);
  const gateLeft=group(gate,-.42,0,0),gateRight=group(gate,.42,0,0);
  for(const leaf of [gateLeft,gateRight])for(let i=0;i<3;i++)box(leaf,.07,2.65,.1,bronze,(i-1)*.26,1.35,0);
  for(const leaf of [gateLeft,gateRight]){box(leaf,.8,.07,.13,iron,0,.45,0);box(leaf,.8,.07,.13,iron,0,2.2,0);}
  const gateCog=torus(gate,.32,.08,bronze,0,2.72,.22);
  const rune=box(gate,.2,.2,.08,cyan,0,1.45,.1);rune.rotation.z=PI/4;
  const detour=group(scene,-3.5,0,.5);
  for(let i=0;i<5;i++){const r=box(detour,.7,.55,.6,stone,(i%2)*.4,.3+Math.floor(i/2)*.5,(i%3)*-.3);r.rotation.set(i*.12,0,i*.19);}
  const themes={};for(const name of ['workshop','courtyard','river','archive','rail','meadow','beacon'])themes[name]=group();
  // Smithy: worked iron, riveted furnace, a real gear and a workbench.
  const smith=themes.workshop;
  box(smith,1.65,.15,.8,wood,-2.7,.85,-1.4);for(const dx of [-.65,.65])for(const dz of [-.27,.27])box(smith,.12,.8,.12,iron,-2.7+dx,.4,-1.4+dz);
  const anvil=box(smith,.66,.24,.3,iron,-2.7,1.04,-1.4);box(smith,.3,.24,.25,black,-2.7,1.24,-1.4);
  const furnace=box(smith,.9,1.5,.8,darkStone,-3.45,.75,-1.8);box(smith,.55,.45,.035,amber,-3.45,.65,-1.38);
  cylinder(smith,.17,.2,1.3,iron,-3.45,2,-1.8);const gear=torus(smith,.34,.09,bronze,-1.8,1.13,-1.65);gear.rotation.x=.3;
  // Ruined garden: stone roots, moss and a broken guardian statue.
  const court=themes.courtyard;
  for(let i=0;i<8;i++){const rubble=box(court,.5,.3+(i%3)*.15,.5,i%2?moss:stone,-3.5+i,.15,-1.9+(i%2)*.3);rubble.rotation.y=i*.7;}
  const statue=group(court,-2.7,0,-1.8);cylinder(statue,.42,.6,.45,stone,0,.2,0);box(statue,.52,.9,.4,darkStone,0,.85,0);sphere(statue,.24,edgeStone,0,1.55,0);
  // Underground bridge: recessed water, timber deck and stout rails.
  const river=themes.river;
  box(river,8.3,.09,4.7,seaMat,0,-.035,0);
  for(let i=0;i<8;i++)box(river,.7,.16,1.35,wood,-3.5+i,.1,.525);
  for(let i=0;i<6;i++){cylinder(river,.035,.035,.7,iron,-3+i*1.25,.48,-.2);cylinder(river,.035,.035,.7,iron,-3+i*1.25,.48,1.25);}
  box(river,7.5,.08,.08,iron,0,.84,-.2);box(river,7.5,.08,.08,iron,0,.84,1.25);
  // Vault: book niches, brass lock wheels and an inert stone keeper.
  const archive=themes.archive;
  for(let i=0;i<3;i++){
    box(archive,1.2,.14,.65,wood,-2.6,.5+i*.62,-1.85);
    for(let j=0;j<6;j++)box(archive,.11,.34+(j%2)*.07,.35,j%2?bronze:robotTrim,-3.07+j*.18,.75+i*.62,-1.85);
  }
  const keeper=group(archive,.7,0,-1.95);cylinder(keeper,.35,.55,.7,darkStone,0,.35,0);box(keeper,.65,.7,.5,stone,0,.95,0);sphere(keeper,.29,edgeStone,0,1.52,0);
  for(const x of [-.1,.1])sphere(keeper,.045,cyan,x,1.53,.25);
  // Mine: rails carry depth, ore carts and timber supports.
  const rail=themes.rail;
  for(const z of [-.02,1.08])box(rail,8.3,.08,.08,iron,0,.14,z);
  for(let i=0;i<12;i++)box(rail,.16,.1,1.4,wood,-3.8+i*.68,.08,.525);
  const cart=group(rail,2.25,0,-1.7);box(cart,1.2,.65,.8,iron,0,.65,0);
  for(const x of [-.4,.4])for(const z of [-.4,.4]){const wheel=cylinder(cart,.2,.2,.12,black,x,.25,z);wheel.rotation.x=PI/2;}
  for(const x of [-3.3,3.3]){box(rail,.25,3,.25,wood,x,1.5,-1.8);box(rail,1,.25,.4,wood,x,3,-1.8);}
  // Cavern: faceted translucent-looking crystals are solid geometry, not sprites.
  const meadow=themes.meadow;
  for(let i=0;i<11;i++){const crystal=make(new T.ConeGeometry(.2+(i%3)*.06,.7+(i%4)*.2,5),i%2?cyan:robotTrim,meadow,-3.8+(i%6)*1.3,.45+(i%4)*.1,-1.9+(i%2)*.45);crystal.rotation.z=(i%3-1)*.2;}
  // Storm ward: a lens ring, vertical copper conductors, and an actual beam.
  const tower=themes.beacon;
  const mast=cylinder(tower,.42,.7,2.4,stone,2.7,1.2,-1.75,16);
  for(let i=0;i<4;i++)cylinder(tower,.04,.04,3.5,bronze,2.7+Math.cos(i*PI/2)*.52,1.8,-1.75+Math.sin(i*PI/2)*.52);
  const lens=torus(tower,.68,.13,bronze,2.7,2.9,-1.75);lens.rotation.y=PI/3;
  sphere(tower,.35,glass,2.7,2.9,-1.75);
  const beamMat=new T.MeshBasicMaterial({color:0xffdd91,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,toneMapped:false});materials.push(beamMat);
  const beam=make(new T.ConeGeometry(2.2,14,24,1,true),beamMat,tower,2.7,2.9,-8.75);beam.rotation.x=PI/2;
  const lensLight=sphere(tower,.22,amber,2.7,2.9,-1.75);
  // Items are separate meshes and are moved through the actor's hand into the pack.
  const itemMeshes=[1,2,3].map((id,i)=>{
    const g=group();const core=sphere(g,.15,cyan);const ring=torus(g,.23,.045,bronze);ring.rotation.x=PI/2;
    cylinder(g,.25,.3,.12,darkStone,0,-.3,0);
    const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.clearRect(0,0,64,64);ctx.fillStyle='#fff0b7';ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.fillText(String(id),32,46);
    const tex=new T.CanvasTexture(c);textures.push(tex);const sm=new T.SpriteMaterial({map:tex,transparent:true,depthTest:false});materials.push(sm);const s=new T.Sprite(sm);s.position.y=.43;s.scale.set(.3,.3,.3);g.add(s);return g;
  });
  // Persistent articulated companion.
  const actor=group();const body=group(actor,0,.69,0);
  const torso=make(new T.CapsuleGeometry(.29,.25,4,14),robotMetal,body,0,.14,0);
  box(body,.42,.32,.09,robotTrim,0,.14,.25);const chest=torus(body,.11,.035,bronze,0,.14,.31);sphere(body,.065,amber,0,.14,.33);
  cylinder(body,.12,.12,.18,bronze,0,.53,0);
  const head=group(body,0,.68,0);const shell=bevelBox(head,.7,.42,.42,robotMetal,0,.04,0,.045);
  bevelBox(head,.59,.27,.07,rubber,0,.04,.23,.025);
  const eyeMeshes=[];for(const x of [-.16,.16])eyeMeshes.push(sphere(head,.063,eyes,x,.055,.27));
  for(const x of [-.39,.39]){const ear=cylinder(head,.1,.1,.11,bronze,x,.04,0);ear.rotation.z=PI/2;}
  cylinder(head,.023,.023,.2,bronze,0,.36,0);sphere(head,.055,amber,0,.48,0);
  const arms=[],forearms=[];
  for(const sign of [-1,1]){
    const arm=group(body,sign*.37,.36,0);sphere(arm,.1,bronze);cylinder(arm,.066,.074,.3,robotTrim,0,-.19,0);
    const elbow=group(arm,0,-.35,0);sphere(elbow,.085,bronze);cylinder(elbow,.06,.07,.25,robotMetal,0,-.16,0);box(elbow,.15,.15,.17,rubber,0,-.34,0);
    arms.push(arm);forearms.push(elbow);
  }
  const legs=[];
  for(const sign of [-1,1]){
    const leg=group(actor,sign*.15,.51,0);sphere(leg,.105,bronze);cylinder(leg,.085,.07,.26,robotTrim,0,-.17,0);
    const knee=group(leg,0,-.31,0);sphere(knee,.075,bronze);cylinder(knee,.065,.08,.17,robotMetal,0,-.13,0);box(knee,.21,.1,.32,rubber,0,-.25,.065);legs.push(leg);
  }
  const pack=box(body,.4,.45,.23,wood,0,.14,-.3);const carried=sphere(body,.13,cyan,.05,.42,-.4);
  const antennaRings=[];for(let i=0;i<3;i++){const m=new T.MeshBasicMaterial({color:0x9ef8fc,transparent:true,opacity:0});materials.push(m);const ring=torus(head,.2+i*.12,.012,m,0,.48,0);ring.rotation.x=PI/2;antennaRings.push(ring);}
  // A jointed vault creature leaps from behind a side corridor on a wrong turn.
  const creature=group(),creatureModels={};for(const type of ['sentinel','hound','crawler','lurker'])creatureModels[type]=group(creature);
  const sentinel=creatureModels.sentinel,creatureMat=mat(0x253743,.72,.3),creatureEye=mat(0xff995c,.25,.1,{emissive:0xee5b2f,emissiveIntensity:2});
  const creatureBody=make(new T.IcosahedronGeometry(.45,1),creatureMat,sentinel,0,.85,0);
  const creatureHead=make(new T.IcosahedronGeometry(.28,0),darkStone,sentinel,0,1.37,.06);
  for(const x of [-.1,.1])sphere(sentinel,.05,creatureEye,x,1.4,.29);
  const creatureArms=[];
  for(const sign of [-1,1]){
    const arm=group(sentinel,sign*.45,1.05,0);cylinder(arm,.1,.15,.55,creatureMat,0,-.25,0,6);sphere(arm,.14,darkStone,0,-.55,.08);creatureArms.push(arm);
    const leg=cylinder(sentinel,.13,.18,.5,creatureMat,sign*.21,.25,0,6);leg.rotation.z=sign*.12;
    if(sign<0)bevelBox(arm,.42,.6,.11,bronze,-.04,-.3,.17,.025);
    else{cylinder(arm,.035,.035,.6,wood,0,-.48,.15,8);box(arm,.34,.18,.22,iron,0,-.77,.15);}
  }
  const hound=creatureModels.hound,houndLegs=[];
  const houndBody=make(new T.CapsuleGeometry(.28,.55,4,12),creatureMat,hound,0,.6,0);houndBody.rotation.x=PI/2;
  sphere(hound,.27,darkStone,0,.76,.57);bevelBox(hound,.37,.2,.4,creatureMat,0,.65,.77,.025);
  box(hound,.3,.045,.32,black,0,.57,.8);
  for(const sign of [-1,1]){sphere(hound,.045,creatureEye,sign*.16,.82,.76);const ear=make(new T.ConeGeometry(.11,.29,5),darkStone,hound,sign*.18,1.04,.51);ear.rotation.z=-sign*.14;}
  for(const x of [-.24,.24])for(const z of [-.3,.32]){const leg=group(hound,x,.53,z);cylinder(leg,.065,.09,.36,creatureMat,0,-.19,0,7);box(leg,.16,.1,.25,black,0,-.43,.07);houndLegs.push(leg);}
  for(let i=0;i<4;i++){const spike=make(new T.ConeGeometry(.075,.23,5),bronze,hound,0,.93,-.35+i*.19);spike.rotation.x=-.22;}
  const tail=cylinder(hound,.04,.07,.55,darkStone,0,.7,-.67,8);tail.rotation.x=-.8;
  const crawler=creatureModels.crawler,crawlerLegs=[];
  const crawlerBody=sphere(crawler,.46,creatureMat,0,.38,0);crawlerBody.scale.set(1.1,.55,1.3);
  sphere(crawler,.21,darkStone,0,.35,.53);for(const x of [-.1,.1])sphere(crawler,.045,creatureEye,x,.42,.7);
  for(const sign of [-1,1])for(let i=0;i<3;i++){
    const leg=group(crawler,sign*.34,.36,(i-1)*.32);leg.rotation.z=sign*.9;
    cylinder(leg,.035,.055,.4,bronze,0,-.2,0,7);const foot=group(leg,0,-.39,0);foot.rotation.z=-sign*1.3;cylinder(foot,.025,.045,.36,creatureMat,0,-.18,0,7);crawlerLegs.push(leg);
  }
  const lurker=creatureModels.lurker,lurkerBody=sphere(lurker,.43,seaMat,0,.52,0);lurkerBody.scale.set(1.25,.8,1.5);
  const fin=make(new T.ConeGeometry(.34,.65,3),creatureMat,lurker,0,1.04,-.08);fin.scale.z=.18;
  bevelBox(lurker,.62,.15,.46,darkStone,0,.63,.53,.025);
  const lurkerJaw=group(lurker,0,.44,.37);bevelBox(lurkerJaw,.58,.1,.48,seaMat,0,0,.16,.025);
  for(const sign of [-1,1]){sphere(lurker,.055,creatureEye,sign*.24,.72,.48);for(let i=0;i<3;i++)make(new T.ConeGeometry(.04,.13,5),edgeStone,lurkerJaw,sign*(.12+i*.08),.1,.28);}
  const encounterWraith=wraith.clone(true);encounterWraith.position.set(0,0,0);encounterWraith.scale.setScalar(.68);
  encounterWraith.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.opacity=1;materials.push(o.material);}});
  creature.add(encounterWraith);creatureModels.wraith=encounterWraith;
  const wraithArms=[encounterWraith.getObjectByName('wraith-arm--1'),encounterWraith.getObjectByName('wraith-arm-1')];
  const effectLight=new T.PointLight(0x82dce5,0,5,2);effectLight.position.set(0,1.8,0);actor.add(effectLight);
  let width=1,height=1,lastState=null;
  const cameraBase=new T.Vector3(),cameraTarget=new T.Vector3(0,.95,-.15);
  function resize(){
    width=Math.max(1,container.clientWidth||container.parentElement?.clientWidth||640);height=Math.max(1,container.clientHeight||400);
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
    const mobile=camera.aspect<1.15;
    cameraBase.set(mobile?8.2:7.6,mobile?7.5:6.6,mobile?11.2:9.7);camera.position.copy(cameraBase);
    camera.lookAt(cameraTarget);
  }
  function render(s){
    lastState=s;
    for(const name of Object.keys(themes))themes[name].visible=name===s.theme;
    trail.visible=s.theme!=='river';
    target.visible=!s.reward.claimed&&s.reward.kind==='part';
    target.position.set(s.reward.homeX??2.25,0,s.reward.homeZ??-.7);target.scale.y=s.spatial?.15:1;
    destinationRing.visible=Boolean(s.spatial);destinationRing.position.set(s.destination?.x||0,.07,s.destination?.z||0);
    reward.position.set(s.reward.x,s.reward.y,s.reward.z);reward.visible=s.reward.visible&&s.reward.kind==='part';
    const partName=({1:'lantern',2:'keys',5:'seal',8:'lens',9:'crystals',12:'heart'})[s.index]||'module';
    for(const name of Object.keys(rewardParts))rewardParts[name].visible=name===partName;
    reward.rotation.y=.7;reward.rotation.z=.2;
    for(let i=0;i<itemMeshes.length;i++){
      const data=s.items[i];itemMeshes[i].visible=s.theme==='meadow'&&Boolean(data?.visible);
      if(data)itemMeshes[i].position.set(data.x,data.y,data.z);
    }
    const a=s.actor;actor.position.set(a.x,a.y||0,a.z);actor.rotation.y=a.yaw;
    const focus=s.action==='ready'?0:Math.sin(PI*(s.frameProgress||0));
    camera.position.copy(cameraBase);camera.position.x-=focus*.2;camera.position.y-=focus*.12;camera.position.z-=focus*.32;
    camera.lookAt(a.x*focus*.1,.95+focus*.06,-.15+a.z*focus*.05);
    head.rotation.y=a.headYaw;head.rotation.x=s.action==='say'?Math.sin(s.time*9)*.035:0;
    arms[0].rotation.x=a.armAngle;arms[1].rotation.x=-a.armAngle*.65;
    arms[0].rotation.z=-a.reach*.2;arms[1].rotation.z=a.reach*.1;
    forearms[0].rotation.x=-a.reach*.65;forearms[1].rotation.x=-a.reach*.25;
    legs[0].rotation.x=a.legAngle;legs[1].rotation.x=-a.legAngle;
    for(const eye of eyeMeshes)eye.scale.y=a.awake?1:.1;
    carried.visible=a.carrying;effectLight.intensity=s.action==='say'?4:0;
    antennaRings.forEach((r,i)=>{r.material.opacity=s.action==='say'?(.22+.18*Math.sin(s.time*6-i)):0;});
    energyCells.forEach((cell,i)=>{cell.material=s.device.energy>i+.3?amber:cyan;cell.scale.y=s.device.energy>i+.3?1.12:1;});
    lever.rotation.z=-s.device.lever*.9;
    gateLeft.position.x=-.42-s.device.gateOpen*.8;gateRight.position.x=.42+s.device.gateOpen*.8;
    gateCog.rotation.z=s.device.gateOpen*PI*2;
    gate.visible=true;
    detour.visible=s.encounter.route==='detour'&&s.encounter.blocking;
    const c=s.encounter.creature;creature.visible=c.visible;creature.position.set(c.x,c.y,c.z);creature.rotation.y=-.45;
    for(const type of Object.keys(creatureModels))creatureModels[type].visible=type===(c.archetype||'sentinel');
    creatureArms[0].rotation.x=c.armAngle;creatureArms[1].rotation.x=-c.armAngle*.8;
    houndLegs.forEach((leg,i)=>leg.rotation.x=(i%2?1:-1)*c.armAngle*.35);
    crawlerLegs.forEach((leg,i)=>leg.rotation.x=(i%2?1:-1)*c.armAngle*.4);
    lurkerJaw.rotation.x=c.armAngle*.45;
    wraithArms.forEach((arm,i)=>{if(arm)arm.rotation.x=(i?-1:1)*c.armAngle*.45;});
    creatureHead.rotation.z=s.action==='retry'?Math.sin(s.time*12)*.06:0;
    const beam=s.device.beam;beamMat.opacity=.2*beam;lensLight.scale.setScalar(.7+beam*.6);beaconLight.intensity=30*beam;
    wave.position.y=-.68-beam*1.1;clouds.position.z=-19-beam*6;
    const danger=clamp(1-s.progress);wraith.visible=danger>.03;wraith.scale.setScalar(.7+danger*.45);
    wraith.position.set(-.8,-.2,-7.4-(1-danger)*5);wraithCloth.opacity=.88*danger;wraithFace.opacity=.97*danger;wraithEyes.opacity=danger;
    town.traverse(o=>{if(o.isMesh&&o.material===amber)o.visible=true;});
    torch.intensity=s.theme==='workshop'?34:s.theme==='archive'?23:15;
    hemi.intensity=s.theme==='meadow'?1.4:1.85;
    scene.background.set(s.device.beam>.5?0x344759:0x111e2a);
    renderer.render(scene,camera);
  }
  resize();
  return{
    render,resize,actorId:actor.uuid,
    cameraState:()=>({x:camera.position.x,y:camera.position.y,z:camera.position.z,aspect:camera.aspect}),
    stats:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles}),
    dispose(){renderer.domElement.removeEventListener('webglcontextlost',contextLost);renderer.dispose();materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());renderer.domElement.remove();}
  };
}
