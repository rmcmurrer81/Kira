/* Canvas fallback for Code Quest's articulated action timeline.
 * This adapter is a render-only 2.5D projection; it never owns an animation loop.
 * The shared scene state supplies real positions, joints, items and device endpoints. */
export function createFallbackAdapter({container,onStatus=()=>{}}={}) {
  const canvas=document.createElement("canvas");
  canvas.className="cq-scene-canvas cq-scene-fallback";
  canvas.setAttribute("aria-hidden","true");
  canvas.style.cssText="display:block;width:100%;height:100%;position:absolute;inset:0";
  container?.appendChild(canvas);
  let ctx=null,width=700,height=440,unit=50,lastState=null,disposed=false;
  try {ctx=canvas.getContext("2d",{alpha:false});} catch (_) {}
  if(!ctx) {
    onStatus("The animated scene is unavailable; the mission controls and narration still work.");
    return {render(){},resize(){},dispose(){canvas.remove();}};
  }
  onStatus("A lighter 2D scene is active on this device. All actions and missions still work.");
  function resize() {
    if(disposed)return;
    const bounds=container?.getBoundingClientRect?.()||{};
    width=Math.max(250,Math.round(bounds.width||container?.clientWidth||700));
    height=Math.max(220,Math.round(bounds.height||container?.clientHeight||440));
    const dpr=Math.min(1.5,Math.max(1,globalThis.devicePixelRatio||1));
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    unit=Math.min(width/11.8,height/7.4);
    if(lastState)render(lastState);
  }
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
  const finite=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
  const tint=(hex,mul)=>{
    const n=parseInt(hex.slice(1),16);
    return "rgb("+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*mul)))).join(",")+")";
  };
  const p=(x,y,z)=>({x:width*.47+(x-z)*unit*.78,y:height*.68+(x+z)*unit*.255-y*unit});
  function polygon(points,fill,stroke=null,lineWidth=.8) {
    ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();
    ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
  }
  function worldBox(x,y,z,w,h,d,color,yaw=0) {
    const local=(a,b,c)=>p(x+a*Math.cos(yaw)+c*Math.sin(yaw),y+b,z-a*Math.sin(yaw)+c*Math.cos(yaw));
    const a=local(-w/2,0,-d/2),b=local(w/2,0,-d/2),c=local(w/2,0,d/2),e=local(-w/2,0,d/2);
    const at=local(-w/2,h,-d/2),bt=local(w/2,h,-d/2),ct=local(w/2,h,d/2),et=local(-w/2,h,d/2);
    polygon([a,b,bt,at],tint(color,.62),"#0b1a2450");
    polygon([b,c,ct,bt],tint(color,.78),"#0b1a2450");
    polygon([c,e,et,ct],tint(color,.9),"#0b1a2450");
    polygon([e,a,at,et],tint(color,.68),"#0b1a2450");
    polygon([at,bt,ct,et],tint(color,1.15),"#ffffff1c");
    return {a,b,c,e,at,bt,ct,et};
  }
  function rod(a,b,color,radius=.055) {
    const q=p(a.x,a.y,a.z),r=p(b.x,b.y,b.z);
    ctx.lineCap="round";ctx.lineWidth=Math.max(1.5,unit*radius*2);
    const g=ctx.createLinearGradient(q.x-3,q.y,r.x+3,r.y);
    g.addColorStop(0,tint(color,.55));g.addColorStop(.45,tint(color,1.18));g.addColorStop(1,tint(color,.78));
    ctx.strokeStyle=g;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(r.x,r.y);ctx.stroke();
  }
  function ball(x,y,z,r,color) {
    const q=p(x,y,z),rr=Math.max(1,unit*r);
    const g=ctx.createRadialGradient(q.x-rr*.3,q.y-rr*.35,1,q.x,q.y,rr);
    g.addColorStop(0,tint(color,1.3));g.addColorStop(.5,color);g.addColorStop(1,tint(color,.48));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(q.x,q.y,rr,0,Math.PI*2);ctx.fill();
  }
  function glow(x,y,z,color,r=.5,alpha=.5) {
    const q=p(x,y,z),radius=Math.max(1,unit*r);
    ctx.save();ctx.globalAlpha=alpha;
    const g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,radius);
    g.addColorStop(0,color);g.addColorStop(1,"transparent");
    ctx.fillStyle=g;ctx.fillRect(q.x-radius,q.y-radius,radius*2,radius*2);ctx.restore();
  }
  function shadow(x,z,w=1,d=.4,alpha=.35) {
    const q=p(x,.01,z);ctx.fillStyle="rgba(1,10,19,"+alpha+")";
    ctx.beginPath();ctx.ellipse(q.x,q.y,w*unit,d*unit,-.05,0,Math.PI*2);ctx.fill();
  }
  function text(x,y,z,label,color="#d6e9e9",size=10) {
    const q=p(x,y,z);ctx.font="600 "+Math.max(8,Math.min(12,size*width/700))+"px system-ui,sans-serif";
    ctx.fillStyle=color;ctx.textAlign="center";ctx.fillText(label,q.x,q.y);
  }
  function lens(item) {
    if(item.visible===false)return;
    const x=finite(item.x,0),y=finite(item.y,.45),z=finite(item.z,0);
    const center=p(x,y,z),s=unit*.16;
    glow(x,y,z,"#ffdc89",.48,.4);
    polygon([{x:center.x,y:center.y-s*1.25},{x:center.x+s,y:center.y},{x:center.x,y:center.y+s*1.25},{x:center.x-s,y:center.y}],"#dec179","#fff0b1");
    polygon([{x:center.x,y:center.y-s*1.25},{x:center.x+s,y:center.y},{x:center.x,y:center.y+s*.3}],"#fff1bf");
    polygon([{x:center.x-s,y:center.y},{x:center.x,y:center.y+s*1.25},{x:center.x,y:center.y+s*.3}],"#8c704a");
    text(x,y+.26,z,String(item.id),"#ffebba",11);
  }
  function lighthouse(x,z,beam,scale=1) {
    shadow(x,z,.7,.25,.25);
    const h=3.25*scale;
    worldBox(x,0,z,.7*scale,h,.7*scale,"#b8bbb1");
    worldBox(x,h*.35,z,.73*scale,.21*scale,.73*scale,"#6c4945");
    worldBox(x,h*.7,z,.73*scale,.21*scale,.73*scale,"#6c4945");
    worldBox(x,h,z,.93*scale,.46*scale,.93*scale,"#445d68");
    const q=p(x,h+.2*scale,z);
    if(beam>0) {
      ctx.save();ctx.globalAlpha=clamp(beam)*.28;
      const g=ctx.createLinearGradient(q.x,q.y,0,height*.15);
      g.addColorStop(0,"#fff0aa");g.addColorStop(1,"#ffe3a300");
      polygon([q,{x:0,y:height*.08},{x:0,y:height*.53}],g);
      ctx.restore();glow(x,h+.2*scale,z,"#fff0b3",1.1,clamp(beam)*.7);
    }
    worldBox(x,h+.08*scale,z,.62*scale,.25*scale,.63*scale,beam>0?"#f5d181":"#253d4c");
    const roof=[p(x-.6*scale,h+.46*scale,z-.6*scale),p(x+.6*scale,h+.46*scale,z-.6*scale),p(x+.6*scale,h+.46*scale,z+.6*scale),p(x-.6*scale,h+.46*scale,z+.6*scale)];
    const tip=p(x,h+1.03*scale,z);
    polygon([roof[0],roof[1],tip],"#78463d");polygon([roof[1],roof[2],tip],"#aa6851");polygon([roof[2],roof[3],tip],"#915742");
  }
  function backdrop(state) {
    const beam=clamp(state.device?.beam);
    const sky=ctx.createLinearGradient(0,0,0,height);
    sky.addColorStop(0,beam>.8?"#344c50":"#101725");sky.addColorStop(.6,beam>.8?"#708783":"#3d505b");sky.addColorStop(1,"#182d34");
    ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
    // Massive receding arches and layered masonry provide a dimensional crypt.
    const top=height*.12,bottom=height*.67;
    for(let layer=0;layer<4;layer++){
      const inset=width*(.03+layer*.085),archWidth=width-inset*2,archHeight=(bottom-top)*(1-layer*.16);
      const center=width*.5,base=bottom-layer*height*.026,archTop=base-archHeight;
      ctx.fillStyle=["#101b23","#1b2a31","#273b43","#334b51"][layer];
      ctx.beginPath();ctx.rect(inset,archTop+archHeight*.43,archWidth,archHeight*.6);
      ctx.moveTo(inset,archTop+archHeight*.46);ctx.ellipse(center,archTop+archHeight*.46,archWidth*.5,archHeight*.46,0,Math.PI,0);
      ctx.lineTo(center+archWidth*.5,base);ctx.lineTo(inset,base);ctx.closePath();ctx.fill();
      ctx.strokeStyle="#a1b2b226";ctx.lineWidth=Math.max(3,width*.012);
      ctx.beginPath();ctx.ellipse(center,archTop+archHeight*.46,archWidth*.5,archHeight*.46,0,Math.PI,0);ctx.stroke();
      if(layer<3)for(const side of [-1,1]){
        const x=center+side*archWidth*.47;
        const col=ctx.createLinearGradient(x-width*.03,0,x+width*.03,0);
        col.addColorStop(0,"#15242d");col.addColorStop(.5,"#62757a");col.addColorStop(1,"#263c45");
        ctx.fillStyle=col;ctx.fillRect(x-width*.025,archTop+archHeight*.44,width*.05,archHeight*.64);
      }
    }
    const opening=ctx.createRadialGradient(width*.5,height*.42,0,width*.5,height*.42,width*.22);
    opening.addColorStop(0,beam>.8?"#e1e2b85c":"#050e1a");opening.addColorStop(1,"#0f222900");
    ctx.fillStyle=opening;ctx.fillRect(width*.24,height*.14,width*.52,height*.55);
      // The stormwraith is a present threat beyond the gate, not ambient bobbing.
      const danger=clamp(1-(Number(state.progress)||0));
      if(danger>.03){
        ctx.save();ctx.globalAlpha=danger;
        ctx.translate(width*.54,height*.27);const size=unit*(.75+danger*.35);ctx.scale(size,size);
        const cloak=ctx.createLinearGradient(-.6,0,.6,2.2);cloak.addColorStop(0,"#5c6b80");cloak.addColorStop(.5,"#152332");cloak.addColorStop(1,"#08111d");
        ctx.fillStyle=cloak;ctx.beginPath();ctx.moveTo(0,-.4);ctx.lineTo(.56,.3);ctx.lineTo(.78,1.8);ctx.lineTo(.35,1.55);ctx.lineTo(.12,2);ctx.lineTo(-.15,1.7);ctx.lineTo(-.72,1.9);ctx.lineTo(-.5,.3);ctx.closePath();ctx.fill();
        ctx.fillStyle="#04080f";ctx.beginPath();ctx.ellipse(0,.42,.3,.4,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#526579";ctx.lineWidth=.18;ctx.lineCap="round";
        for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(sign*.45,.8);ctx.lineTo(sign*.9,1.25);ctx.stroke();ctx.lineWidth=.035;ctx.strokeStyle="#b3aa93";for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(sign*(.84+j*.05),1.25);ctx.lineTo(sign*(.91+j*.07),1.55);ctx.stroke();}ctx.lineWidth=.18;ctx.strokeStyle="#526579";}
        ctx.shadowColor="#ffb779";ctx.shadowBlur=8;ctx.fillStyle="#ffe3ac";for(const x of [-.12,.12]){ctx.beginPath();ctx.ellipse(x,.37,.05,.025,0,0,Math.PI*2);ctx.fill();}ctx.restore();
      }
    // Stone seams catch low, grazing torch light instead of flat artwork outlines.
    ctx.strokeStyle="#a7b2a919";ctx.lineWidth=1;
    for(let row=0;row<6;row++){
      const y=height*(.18+row*.072);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width*.18,y);ctx.moveTo(width*.82,y);ctx.lineTo(width,y);ctx.stroke();
      for(const side of [0,.83])for(let col=0;col<3;col++){const x=width*(side+col*.07+(row%2)*.025);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+height*.072);ctx.stroke();}
    }
    for(const side of [.14,.86]){
      const x=width*side,y=height*.36;
      ctx.strokeStyle="#232b30";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,y+height*.1);ctx.lineTo(x+3,y);ctx.stroke();
      const torch=ctx.createRadialGradient(x,y,1,x,y,width*.16);
      torch.addColorStop(0,"#ffc16f5c");torch.addColorStop(1,"#ffc16f00");
      ctx.fillStyle=torch;ctx.fillRect(x-width*.16,y-width*.16,width*.32,width*.32);
      ctx.fillStyle=beam>.8?"#fff0b4":"#f0ac60";ctx.beginPath();ctx.ellipse(x,y,Math.max(3,width*.006),height*.022,-.1,0,Math.PI*2);ctx.fill();
    }
    // The violet breach is the visible source of the threat until the ward fires.
    if(beam<.95){
      const danger=ctx.createRadialGradient(width*.5,height*.47,2,width*.5,height*.47,width*.19);
      danger.addColorStop(0,"#baa8d52e");danger.addColorStop(.45,"#5d527b55");danger.addColorStop(1,"#1a203000");
      ctx.fillStyle=danger;ctx.fillRect(width*.27,height*.18,width*.46,height*.53);
      ctx.strokeStyle="#aa99c344";ctx.lineWidth=2;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(width*.5,height*.47,width*(.045+i*.026),height*(.09+i*.03),-.2,0,Math.PI*2);ctx.stroke();}
    }
    return clamp(state.progress);
  }
  function encounters(state) {
    const encounter=state.encounter||{},creature=encounter.creature||{};
    // Two physical paths fork around a broken stone pillar.
    if(encounter.route){
      for(const side of [-1,1]){
        const color=encounter.revealed&&((encounter.route==="safe"&&side<0)||(encounter.route==="ambush"&&side>0))?"#d4b88144":"#788c8633";
        for(let i=0;i<5;i++){
          const x=side*(.45+i*.4),z=1.5-i*.5;
          const a=p(x-.21,.025,z-.15),b=p(x+.21,.025,z-.15),c=p(x+.21,.025,z+.15),d=p(x-.21,.025,z+.15);
          polygon([a,b,c,d],color,"#a1afa42a");
        }
      }
      if(encounter.blocking){worldBox(.9,.02,.8,.8,.65,.8,"#657272",.3);worldBox(.56,.02,1.15,.55,.44,.5,"#556461",-.25);}
    }
    const reward=state.reward;
      if(reward&&reward.visible!==false&&!reward.claimed&&(!reward.kind||reward.kind==='part')){
      const rx=finite(reward.x,1.8),rz=finite(reward.z,-.9);
      worldBox(rx,.02,rz,.65,.62,.65,"#667d7d");
      worldBox(rx,.63,rz,.88,.12,.88,"#899896");
      lens({id:"",x:rx,y:finite(reward.y,1.03),z:rz});
    }
    return creature;
  }
  function creatureDraw(creature) {
    if(!creature.visible)return;
    const x=Number(creature.x)||0,y=Number(creature.y)||0,z=Number(creature.z)||0;
    const arm=Number(creature.armAngle)||0,raise=Math.sin(arm);
    const type=creature.archetype||"sentinel";
    const eye=(ex,ey,ez,color="#f1c58b",radius=.035)=>{
      const q=p(ex,ey,ez);glow(ex,ey,ez,color,.15,.22);
      ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(q.x,q.y,unit*radius,unit*radius*.7,0,0,Math.PI*2);ctx.fill();
    };
    const spike=(sx,sy,sz,height=.25,color="#aaa28b")=>{
      polygon([p(sx-.07,sy,sz),p(sx+.07,sy,sz+.03),p(sx,sy+height,sz-.02)],color,"#111b2155");
    };
    if(type==="wraith"){
      shadow(x,z,.57,.17,.27);
      const top=p(x,y+1.82,z),left=p(x-.43,y+.45,z+.1),right=p(x+.43,y+.45,z+.1);
      const hem=[p(x-.63,y+.06,z+.06),p(x-.3,y+.2,z+.3),p(x-.08,y-.02,z+.37),p(x+.2,y+.18,z+.31),p(x+.65,y+.03,z+.08)];
      const cloak=ctx.createLinearGradient(left.x,left.y,right.x,right.y);
      cloak.addColorStop(0,"#243441");cloak.addColorStop(.42,"#5e7280");cloak.addColorStop(1,"#12232f");
      polygon([top,right,...[...hem].reverse(),left],cloak,"#81969c55");
      const face=p(x,y+1.38,z+.23);
      ctx.fillStyle="#050d16";ctx.beginPath();ctx.ellipse(face.x,face.y,unit*.24,unit*.29,-.1,0,Math.PI*2);ctx.fill();
      for(const side of [-1,1]){
        const shoulder={x:x+side*.33,y:y+1.15,z:z+.04},elbow={x:x+side*.63,y:y+.88+raise*.35,z:z+.12},hand={x:x+side*.88,y:y+.56+raise*.72,z:z+.31};
        rod(shoulder,elbow,"#425768",.085);rod(elbow,hand,"#344e60",.065);
        for(let claw=0;claw<3;claw++)rod({x:hand.x+(claw-1)*.07,y:hand.y,z:hand.z},{x:hand.x+(claw-1)*.1,y:hand.y-.24,z:hand.z+.09},"#b9b09a",.018);
        eye(x+side*.105,y+1.44,z+.29,"#f6c887",.031);
      }
      return;
    }
    if(type==="hound"){
      shadow(x,z,.72,.24,.44);
      worldBox(x,y+.37,z,.57,.48,1.14,"#6b5144",.05);
      for(const side of [-1,1])for(const front of [-1,1]){
        const phase=raise*side*front,hip={x:x+side*.24,y:y+.51,z:z+front*.38};
        const knee={x:x+side*.34,y:y+.24,z:z+front*.44+phase*.12},foot={x:x+side*.34,y:y+.04,z:z+front*.49+phase*.18};
        rod(hip,knee,"#85634e",.09);rod(knee,foot,"#4c3b34",.07);worldBox(foot.x,y,foot.z,.22,.11,.3,"#342b29");
      }
      const neck={x,y:y+.72,z:z+.42},head={x,y:y+.91,z:z+.65};
      rod(neck,head,"#8d6b52",.21);worldBox(x,y+.76,z+.69,.5,.38,.52,"#916b50");
      const mouth=.065+Math.abs(raise)*.14;
      worldBox(x,y+.76-mouth,z+.98,.4,.13,.35,"#49342d");
      worldBox(x,y+.91,z+1,.42,.13,.34,"#77533d");
      for(let i=0;i<4;i++)spike(x-.14+i*.09,y+.87,z+1.13,-.09,"#dfc797");
      for(const side of [-1,1]){spike(x+side*.2,y+1.13,z+.61,.26,"#514236");eye(x+side*.16,y+1.01,z+.95,"#edbf75",.03);}
      for(let i=0;i<4;i++)spike(x,y+.85,z-.38+i*.2,.18,"#afa18a");
      rod({x,y:y+.57,z:z-.57},{x:x+.14,y:y+.8+raise*.08,z:z-1.02},"#6b5144",.07);
      return;
    }
    if(type==="crawler"){
      shadow(x,z,.95,.26,.44);
      worldBox(x,y+.24,z,1.04,.37,.79,"#4b5758",.05);
      ball(x,y+.52,z-.05,.34,"#67746c");
      for(const side of [-1,1])for(let i=0;i<3;i++){
        const zz=z-.3+i*.3,phase=Math.sin(arm+i*.8)*.09;
        const hip={x:x+side*.44,y:y+.43,z:zz},knee={x:x+side*.77,y:y+.53+phase,z:zz+.05},foot={x:x+side*1.02,y:y+.045,z:zz+.2-phase};
        rod(hip,knee,"#788574",.065);ball(knee.x,knee.y,knee.z,.075,"#a5a488");rod(knee,foot,"#465b52",.048);
        spike(foot.x,y+.05,foot.z,.08,"#b5aa8c");
      }
      worldBox(x,y+.28,z+.46,.55,.28,.27,"#354c47");
      for(let i=0;i<4;i++)eye(x-.18+i*.12,y+.49,z+.61,"#d7bb6b",.027);
      for(const side of [-1,1])rod({x:x+side*.17,y:y+.32,z:z+.58},{x:x+side*(.27+raise*.06),y:y+.2,z:z+.84},"#b2a984",.028);
      return;
    }
    if(type==="lurker"){
      shadow(x,z,.75,.24,.4);
      worldBox(x,y+.19,z,.67,.83,.7,"#375c64",-.04);
      ball(x,y+.97,z+.13,.35,"#637d77");
      // Broad membrane fins and hinged jaws make this unlike a walking guard.
      for(const side of [-1,1]){
        polygon([p(x+side*.28,y+.82,z),p(x+side*(.8+raise*.08),y+.5+raise*.25,z-.15),p(x+side*.49,y+.18,z+.15)],side<0?"#476c72":"#6d8780","#b4c4ac44");
        rod({x:x+side*.29,y:y+.72,z},{x:x+side*.68,y:y+.47+raise*.2,z:z-.09},"#87a09a",.035);
        eye(x+side*.17,y+1.1,z+.39,"#c9dc8d",.034);
      }
      const jawGap=.1+Math.abs(raise)*.24;
      worldBox(x,y+.83-jawGap,z+.47,.66,.16,.53,"#284c55");
      worldBox(x,y+1.02,z+.47,.66,.17,.51,"#5e7d78");
      for(let i=0;i<6;i++){spike(x-.25+i*.1,y+.85-jawGap,z+.7,.15,"#e5ddba");spike(x-.25+i*.1,y+1.02,z+.7,-.13,"#e5ddba");}
      rod({x,y:y+.37,z:z-.29},{x,y:y+.18,z:z-.98},"#3d6066",.16);
      return;
    }
    // The sentinel alone has the upright armored humanoid silhouette.
    shadow(x,z,.6,.2,.44);
    worldBox(x,y+.26,z,.66,.79,.5,"#536759",.2);
    ball(x,y+1.24,z,.36,"#6f7b63");
    for(const side of [-1,1]){
      const hip={x:x+side*.22,y:y+.43,z},foot={x:x+side*.4,y:y+.05,z:z+.19};
      rod(hip,foot,"#425e52",.12);worldBox(foot.x,y,foot.z,.31,.13,.42,"#3b5148");
      const shoulder={x:x+side*.4,y:y+.98,z};
      const elbow={x:x+side*.62,y:y+.68+raise*.45,z:z+.16};
      const hand={x:x+side*.75,y:y+.44+raise*.9,z:z+.43};
      rod(shoulder,elbow,"#62775e",.13);ball(elbow.x,elbow.y,elbow.z,.14,"#8b8e70");rod(elbow,hand,"#566e57",.11);
      for(let claw=0;claw<3;claw++)rod({x:hand.x+(claw-1)*.07,y:hand.y,z:hand.z},{x:hand.x+(claw-1)*.07,y:hand.y-.15,z:hand.z+.11},"#b3aa83",.022);
      eye(x+side*.13,y+1.3,z+.28,"#e4b46b",.035);
    }
  }
  function terrain(state) {
    const theme=state.theme;
    if(theme==="river"){
      worldBox(-2.35,-.4,0,3.25,.4,4.7,"#465764");
      worldBox(2.45,-.4,0,2.8,.4,4.7,"#465764");
      for(let i=0;i<9;i++)worldBox(-1.1+i*.28,.04,-.15,.24,.16,1.32,"#93806a");
      rod({x:-1.5,y:.7,z:-.9},{x:1.4,y:.7,z:-.9},"#8da0a8",.035);
      rod({x:-1.5,y:.7,z:.55},{x:1.4,y:.7,z:.55},"#8da0a8",.035);
      for(let i=0;i<4;i++){const x=-1.5+i*.95;rod({x,y:.1,z:-.9},{x,y:.7,z:-.9},"#6c8491",.04);rod({x,y:.1,z:.55},{x,y:.7,z:.55},"#6c8491",.04);}
    }else{
      worldBox(0,-.38,0,8.4,.38,4.8,theme==="workshop"?"#4a4945":theme==="meadow"?"#425d55":"#4e6069");
      // Real projected pavement joints catch light on the wet upper surface.
      for(let x=-4;x<4;x+=.8)for(let z=-2.1;z<2.3;z+=.8){
        const a=p(x,.015,z),b=p(x+.73,.015,z),c=p(x+.73,.015,z+.73),d=p(x,.015,z+.73);
        polygon([a,b,c,d],((Math.round(x*10)+Math.round(z*10))%3===0)?"#81959818":"#243a4520","#a6c0c022",.6);
      }
    }
    // Quay lights make scale and the safe path legible.
    for(const x of [-3.8,3.8])for(const z of [-2,2]){worldBox(x,.02,z,.16,.7,.16,"#344b58");ball(x,.76,z,.09,"#e7be78");glow(x,.76,z,"#f5c67a",.6,.2);}
  }
  function props(state) {
    const theme=state.theme,device=state.device||{},energy=clamp(device.energy,0,3),open=clamp(device.gateOpen);
    // A working ward tower remains in view before the final climb.
    if(theme!=="beacon")lighthouse(3.4,-2.9,device.beam||0,.5);
    if(theme==="workshop"){
      shadow(1.75,-1.35,1,.25);
      worldBox(1.85,.73,-1.35,2.1,.18,1,"#8e7255");
      for(const x of [1.05,2.65])for(const z of [-1.7,-1])worldBox(x,0,z,.12,.73,.12,"#3e4c54");
      worldBox(2.1,.92,-1.55,.7,.35,.35,"#69868c");
      for(let i=0;i<3;i++){worldBox(1.15+i*.33,.91,-1.38,.22,.24,.22,i<energy?"#e8c27b":"#415969");if(i<energy)glow(1.15+i*.33,1.1,-1.38,"#ffda8f",.4,.4);}
      const lever=clamp(device.lever);
      rod({x:2.55,y:.92,z:-1.2},{x:2.55,y:1.32-lever*.25,z:-1.2+lever*.32},"#c3b18e",.045);
      ball(2.55,1.32-lever*.25,-1.2+lever*.32,.085,"#b27355");
      text(1.8,1.65,-1.5,"WARD CRYSTALS","#f2d291",10);
      worldBox(-3.2,.02,-1.8,.85,.55,.7,"#756249");
      worldBox(-2.4,.02,-1.8,.6,.36,.65,"#625841");
    }else if(theme==="archive"||theme==="courtyard"){
      const gx=2.1,gz=-1.1;
      worldBox(gx-.94,0,gz,.24,2.7,.35,"#62727b");worldBox(gx+.94,0,gz,.24,2.7,.35,"#62727b");worldBox(gx,2.6,gz,2.15,.28,.4,"#75878b");
      for(const side of [-1,1]){
        const cx=gx+side*(.43+open*.83);
        worldBox(cx,.08,gz,.84,2.45,.15,"#374b58");
        for(let i=0;i<3;i++)worldBox(cx-.28+i*.28,.16,gz+.11,.045,2.17,.045,"#a39d84");
        worldBox(cx,1.1,gz+.14,.58,.12,.05,"#ae9b73");
      }
      ball(gx,1.7,gz+.18,.17,open>.5?"#edd397":"#8b9ca1");
      text(gx,3.05,gz,theme==="archive"?"ARCHIVE VAULT":"DUNGEON GATE","#d4d2b4",10);
      if(theme==="archive")for(let i=0;i<3;i++){worldBox(-2.8,.1+i*.6,-1.55,1.1,.1,.45,"#77634d");for(let j=0;j<5;j++)worldBox(-3.2+j*.18,.2+i*.6,-1.55,.12,.35,.28,["#617c83","#836c58","#5a7170"][j%3]);}
    }else if(theme==="rail"){
      for(const z of [-.72,.72])rod({x:-3.8,y:.12,z},{x:3.8,y:.12,z},"#8ca1aa",.045);
      for(let x=-3.6;x<4;x+=.42)worldBox(x,.01,0,.16,.08,1.9,"#685d4d");
      worldBox(2.9,.25,-1.55,1.5,.6,.65,"#597982");
      for(const x of [2.4,3.35])ball(x,.22,-1.55,.15,"#283d49");
      text(2.9,1.3,-1.55,"MINE LIFT","#d4d4b5",9);
    }else if(theme==="meadow"){
      for(const rock of [[-3,-1.6,.6],[2.8,1.4,.4],[-2.2,1.9,.3]])worldBox(rock[0],.01,rock[1],rock[2],rock[2]*.45,rock[2]*.7,"#73817a",.4);
      for(let i=0;i<10;i++){const x=-3.7+(i*.87)%7.6,z=1.4+(i%3)*.24;rod({x,y:0,z},{x:x+.04,y:.25,z},"#648f7d",.018);}
      text(1,1.8,-.5,"RECOVER THE WARD CORE","#ffe1aa",10);
    }else if(theme==="beacon"){
      lighthouse(2.25,-1.5,device.beam||0,.87);
      worldBox(.95,.02,-1.65,.62,.95,.55,"#59717b");
      for(let i=0;i<3;i++)worldBox(.95,.28+i*.2,-1.3,.26,.11,.08,i<energy?"#f5d494":"#243e4c");
      text(.8,1.4,-1.4,"BEACON CONTROL","#e2d2a1",9);
    }
    if(theme==="river"){
      worldBox(2.6,0,1.3,.65,.6,.75,"#5b7278");
      for(let i=0;i<3;i++)ball(2.6,.75,1.1+i*.16,.07,i<energy?"#f9d792":"#526c75");
      text(2.6,1.15,1.3,"BRIDGE POWER","#e2d1a2",9);
    }
  }
  function actorDraw(actor) {
    const x=Number(actor.x)||0,z=Number(actor.z)||0,yaw=Number(actor.yaw)||0;
    const transform=(lx,ly,lz,angle=yaw)=>({x:x+lx*Math.cos(angle)+lz*Math.sin(angle),y:ly,z:z-lx*Math.sin(angle)+lz*Math.cos(angle)});
    const leg=Number(actor.legAngle)||0,arm=Number(actor.armAngle)||0,reach=clamp(actor.reach);
    shadow(x,z,.48,.17,.44);
    // A separate articulated leg chain remains visible halfway through a step.
    for(const side of [-1,1]){
      const phase=leg*side,hip=transform(side*.19,.61,0),knee=transform(side*.19,.34,Math.sin(phase)*.17),ankle=transform(side*.19,.09,Math.sin(phase)*.34);
      rod(hip,knee,"#617783",.085);ball(knee.x,knee.y,knee.z,.105,"#adc3c5");rod(knee,ankle,"#405e6d",.085);
      worldBox(ankle.x,.015,ankle.z+.07*Math.cos(yaw),.25,.13,.4,"#425967",yaw);
    }
    // Back-mounted carrier and visible recovered part.
    const pack=transform(0,.68,-.27);
    worldBox(pack.x,pack.y,pack.z,.52,.63,.24,"#6b5d47",yaw);
    if(actor.carrying){const carry=transform(0,1.37,-.36);lens({id:"",x:carry.x,y:carry.y,z:carry.z});}
    worldBox(x,.64,z,.58,.61,.4,"#82a5ab",yaw);
    const chest=transform(0,.91,.225);ball(chest.x,chest.y,chest.z,.105,actor.awake?"#edca85":"#4f6f7a");
    const headYaw=yaw+(Number(actor.headYaw)||0),neck=transform(0,1.25,0);
    rod({x,y:1.18,z},neck,"#465f6f",.09);
    worldBox(x,1.23,z,.76,.47,.51,"#bdd1cc",headYaw);
    const headPoint=(a,b,c)=>transform(a,b,c,headYaw);
    const faceDot=Math.sin(headYaw)*.65+Math.cos(headYaw)*.75;
    if(faceDot>-.15) {
      const face=headPoint(0,1.36,.27);
      worldBox(face.x,face.y,face.z,.6,.22,.045,"#183444",headYaw);
      for(const side of [-1,1]){
        const eye=headPoint(side*.16,1.48,.31),q=p(eye.x,eye.y,eye.z);
        if(actor.awake){glow(eye.x,eye.y,eye.z,"#bffcff",.18,.55);ctx.fillStyle="#c1fbf4";ctx.beginPath();ctx.ellipse(q.x,q.y,unit*.044,unit*.06,0,0,Math.PI*2);ctx.fill();}
        else{ctx.strokeStyle="#6c8b96";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(q.x-unit*.045,q.y);ctx.lineTo(q.x+unit*.045,q.y);ctx.stroke();}
      }
    }
    const antenna=headPoint(.22,1.7,-.04),tip=headPoint(.22,1.92,-.04);
    rod(antenna,tip,"#a3bfc2",.021);ball(tip.x,tip.y,tip.z,.045,actor.awake?"#f4cd8b":"#58747e");
    // Reach progresses shoulder -> elbow -> hand, rather than shifting a picture.
    for(const side of [-1,1]){
      const sign=side===1?1:-1,shoulder=transform(side*.36,1.12,0);
      const swing=Math.sin(arm*sign)*.27;
      const active=side===1?reach:reach*.2;
      const elbow=transform(side*(.42-active*.06),.87+active*.14,swing+active*.38);
      const hand=transform(side*(.44-active*.13),.62+active*.34,swing*1.5+active*.68);
      ball(shoulder.x,shoulder.y,shoulder.z,.1,"#afc4c4");rod(shoulder,elbow,"#6f929e",.065);ball(elbow.x,elbow.y,elbow.z,.08,"#afc4c4");rod(elbow,hand,"#6e8a95",.06);ball(hand.x,hand.y,hand.z,.085,"#b0c8c7");
    }
  }
  function render(state) {
    if(disposed)return;lastState=state||{};
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    ctx.clearRect(0,0,width,height);
    backdrop(lastState);terrain(lastState);props(lastState);
    const creature=encounters(lastState);
    const actor=lastState.actor||{};
    const items=Array.isArray(lastState.items)?lastState.items:[];
    const layers=items.filter(i=>i.visible!==false).map(item=>({depth:(Number(item.x)||0)+(Number(item.z)||0),draw:()=>lens(item)}));
    if(creature.visible)layers.push({depth:(Number(creature.x)||0)+(Number(creature.z)||0),draw:()=>creatureDraw(creature)});
    layers.push({depth:(Number(actor.x)||0)+(Number(actor.z)||0),draw:()=>actorDraw(actor)});
    layers.sort((a,b)=>a.depth-b.depth).forEach(layer=>layer.draw());
    const vignette=ctx.createRadialGradient(width*.5,height*.46,width*.22,width*.5,height*.5,width*.72);
    vignette.addColorStop(0,"#06132100");vignette.addColorStop(1,"#020c1a88");ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
  }
  const observer=typeof ResizeObserver!=="undefined"?new ResizeObserver(resize):null;
  observer?.observe(container);
  resize();
  return {render,resize,dispose(){disposed=true;observer?.disconnect();canvas.remove();}};
}
