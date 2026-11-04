/* Circuitbound: The Lantern Siege — original procedural canvas art.
 * No external images, fonts, libraries, tracking, or generated media.
 * Tutorial-friendly classic script. The renderer never changes game state.
 */
(function (root) {
  'use strict';

  const WIDTH = 1200;
  const HEIGHT = 680;
  const TAU = Math.PI * 2;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const mix = (a, b, x) => a + (b - a) * x;
  const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  // A repeatable number for scenery. We deliberately do not use Math.random().
  const noise = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  function create(canvas) {
    if (!canvas || typeof canvas.getContext !== 'function') throw new TypeError('A canvas is required.');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { setScene() {}, resize() {}, destroy() {}, pulse() {}, renderAt() {} };

    const media = typeof root.matchMedia === 'function' ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let reduced = !!(media && media.matches);
    let scene = { id: 'arrival', visual: 'village' };
    let state = {};
    let visual = 'village';
    let motif = 'storm';
    let origin = now();
    let sceneOrigin = origin;
    let pulseAt = -100;
    let pulseType = '';
    let animation = 0;
    let alive = true;
    let drawWidth = WIDTH;
    let drawHeight = HEIGHT;
    let pixelRatio = 1;
    let currentTime = 0;

    function now() { return root.performance && root.performance.now ? root.performance.now() / 1000 : Date.now() / 1000; }
    function colorGradient(x1, y1, x2, y2, stops) {
      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      stops.forEach(([position, color]) => g.addColorStop(position, color));
      return g;
    }
    function polygon(points, fill, stroke, lineWidth) {
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth || 2; ctx.stroke(); }
    }
    function line(points, stroke, width) {
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width || 2;
      ctx.stroke();
    }
    function ellipse(x, y, rx, ry, fill, stroke) {
      ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, TAU);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
    }
    function rect(x, y, w, h, fill, stroke) {
      if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h); }
    }
    function glow(x, y, radius, color) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ellipse(x, y, radius, radius, g);
    }
    function gear(x, y, radius, time, fill, toothCount) {
      const count = toothCount || 12;
      ctx.save(); ctx.translate(x, y); ctx.rotate(time);
      const points = [];
      for (let i = 0; i < count * 4; i++) {
        const angle = i * TAU / (count * 4);
        const r = radius * (i % 4 < 2 ? 1 : .84);
        points.push([Math.cos(angle) * r, Math.sin(angle) * r]);
      }
      polygon(points, fill || '#86725b', '#bb9969', 1.4);
      ellipse(0, 0, radius * .53, radius * .53, '#15232c', '#bb9969');
      for (let i = 0; i < 5; i++) {
        const a = i * TAU / 5;
        line([[Math.cos(a) * radius * .23, Math.sin(a) * radius * .23], [Math.cos(a) * radius * .63, Math.sin(a) * radius * .63]], '#a28c6c', radius * .1);
      }
      ellipse(0, 0, radius * .17, radius * .17, '#d7ad6f');
      ctx.restore();
    }
    function lantern(x, y, scale, t, lit) {
      ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
      if (lit !== false) glow(0, 0, 94, 'rgba(255,183,77,.23)');
      line([[-7, -25], [-7, -40], [7, -40], [7, -25]], '#d2a45f', 3);
      polygon([[-17,-22],[17,-22],[20,21],[-20,21]], '#a2794c', '#e1b56e', 2);
      rect(-12, -17, 24, 31, lit === false ? '#233440' : '#ffdb88');
      if (lit !== false) {
        polygon([[-5,10],[-8,2],[0,-10-Math.sin(t * 9)*2],[8,3],[4,10]], '#fff8cb');
      }
      line([[-20,21],[20,21]], '#3f3335', 5);
      line([[0,-22],[0,19]], '#886039', 3);
      ctx.restore();
    }
    function sky(t, warm) {
      rect(0, 0, WIDTH, HEIGHT, colorGradient(0, 0, 0, HEIGHT, warm ? [[0,'#20304a'],[.52,'#bd7959'],[1,'#394d56']] : [[0,'#071320'],[.6,'#193b4a'],[1,'#34515a']]));
      for (let i = 0; i < 68; i++) {
        const x = noise(i + 1) * WIDTH;
        const y = noise(i + 74) * 315;
        const a = .25 + .42 * (.5 + .5 * Math.sin(t * .8 + i));
        ellipse(x, y, i % 6 === 0 ? 1.8 : 1, i % 6 === 0 ? 1.8 : 1, `rgba(230,240,242,${a})`);
      }
      if (warm) {
        glow(872, 255, 220, 'rgba(255,196,111,.35)');
        ellipse(872, 255, 70, 70, '#f4ce9a');
      } else {
        glow(980, 116, 125, 'rgba(127,201,205,.13)');
        ellipse(980, 116, 39, 39, '#98babe');
        ellipse(995, 107, 36, 36, '#0c1c2b');
      }
      // Moving clouds are assembled from many shapes, not translated photographs.
      for (let i = 0; i < 9; i++) {
        const x = ((i * 179 + t * (6 + i % 3)) % 1560) - 180;
        const y = 70 + noise(i + 90) * 155;
        for (let j = 0; j < 4; j++) ellipse(x + j * 36, y - Math.sin(j) * 8, 71, 14 + j * 2, warm ? 'rgba(57,66,85,.24)' : 'rgba(64,95,112,.19)');
      }
      polygon([[0,405],[90,281],[144,338],[253,229],[370,375],[470,284],[580,413],[675,303],[775,384],[902,242],[1063,393],[1140,310],[1200,370],[1200,600],[0,600]], '#18313e');
      polygon([[0,460],[131,374],[264,434],[397,345],[524,475],[698,387],[837,436],[997,355],[1200,467],[1200,680],[0,680]], warm ? '#354a50' : '#20404a');
    }
    function ground(t, stone) {
      polygon([[0,543],[154,526],[330,546],[506,528],[727,548],[937,529],[1200,552],[1200,680],[0,680]], stone ? '#253940' : '#203b3e');
      polygon([[270,680],[502,543],[705,543],[973,680]], '#3c4d50');
      for (let i = 0; i < 26; i++) {
        const y = 556 + noise(i + 174) * 130;
        const x = 310 + noise(i + 29) * 595;
        ellipse(x, y, 10 + noise(i) * 23, 2 + noise(i + 50) * 3, '#52635e');
      }
      for (let i = 0; i < 30; i++) {
        const x = noise(i + 46) * WIDTH;
        const y = 560 + noise(i + 97) * 120;
        line([[x-5,y],[x,y-7-Math.sin(t+i)*2],[x+3,y]], '#657263', 1);
      }
    }
    function house(x, y, s, roof, t, dark) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s,s);
      rect(-58,-106,116,106,dark ? '#26353b' : '#586267', '#182b33');
      polygon([[-73,-100],[0,-166],[75,-100]], roof || '#5f4553', '#c09272', 2);
      rect(29,-154,15,44,'#4b4d52');
      for (let i = 0; i < 5; i++) line([[-53+i*24,-110-Math.min(i,4-i)*18],[-29+i*24,-110-Math.min(i+1,4-i-1)*18]],'#8e6c68',1);
      rect(-15,-51,30,51,'#20313a','#9b8066');
      for (const side of [-1,1]) {
        rect(side*35-10,-79,20,26,dark ? '#20333e' : '#efbc6e','#9c816b');
        line([[side*35,-79],[side*35,-53]],'#655042',2);
        line([[side*35-10,-66],[side*35+10,-66]],'#655042',2);
      }
      line([[-58,-20],[58,-20]],'#3e4448',4);
      if (!dark) for (let j=0;j<4;j++) {
        const age=(t*.45+j*.27)%1;
        ellipse(38+Math.sin(age*4+j)*12,-170-age*77,8+age*12,8+age*5,`rgba(153,173,180,${(1-age)*.16})`);
      }
      ctx.restore();
    }
    function village(t, good, dark) {
      sky(t,good);
      const oppressive=motif==='crown';
      for (let i=0;i<10;i++) house(40+i*134,490+noise(i+4)*32,.52+noise(i+22)*.25,i%2?'#594857':'#475b62',t,dark&&!oppressive);
      const towerX=785;
      rect(towerX-35,236,70,269,'#41545d','#8f8c79');
      polygon([[towerX-49,247],[towerX,170],[towerX+49,247]],'#6c5d69','#b98e6a');
      for (let i=0;i<5;i++) rect(towerX-5,272+i*43,10,23,oppressive?'#d4b3df':dark?'#18303c':'#d8b776');
      line([[towerX+46,304],[towerX+46,187]],'#b59470',3);
      polygon([[towerX+46,188],[towerX+100+Math.sin(t*3)*6,201],[towerX+46,216]],good?'#74c6ad':'#df8b75');
      if (good) {
        glow(towerX,184,230,'rgba(129,229,190,.19)');
        for (let i=0;i<6;i++) {
          const a=-Math.PI*.85+i*.22+Math.sin(t*.35)*.08;
          line([[towerX,184],[towerX+Math.cos(a)*540,184+Math.sin(a)*540]],'rgba(183,242,199,.10)',9);
        }
      } else {
        // A visibly articulated, distant siege creature circles the skyline.
        ctx.save(); ctx.translate(280+Math.sin(t*.12)*70,190+Math.sin(t*.35)*9); ctx.scale(.31,.31);
        dragon(t,true,dark); ctx.restore();
      }
      ground(t,true);
      if (!dark) for(let i=0;i<4;i++) lantern(80+i*348,532,.43,t,true);
      if(oppressive) {
        polygon([[towerX-21,167],[towerX-29,137],[towerX-8,148],[towerX,126],[towerX+10,148],[towerX+30,137],[towerX+22,167]],'#d6b487','#eee0ad',2);
        for(let i=0;i<5;i++) {
          const x=100+i*241;
          polygon([[towerX,184],[x-23,512],[x+23,512]],'rgba(189,166,228,.12)');
          glow(x,512,49,'rgba(189,166,228,.17)');
        }
      }
      if (dark) {
        rect(0,0,WIDTH,HEIGHT,'rgba(9,15,24,.24)');
        for(let i=0;i<22;i++) {
          const a=(t*.13+noise(i+31))%1;
          line([[noise(i+12)*WIDTH+a*50,580-a*330],[noise(i+12)*WIDTH+a*50+4,574-a*330]],'rgba(190,143,112,.36)',2);
        }
      }
    }
    function stoneColumn(x,y,w,h) {
      rect(x,y,w,h,'#3a515c','#7d8c8a');
      for(let row=0;row<h/30;row++) {
        line([[x,y+row*30],[x+w,y+row*30]],'#203640',2);
        const split=x+w*(row%2?.34:.62);
        line([[split,y+row*30],[split,y+(row+1)*30]],'#203640',2);
      }
    }
    function gate(t, age) {
      sky(t,false); ground(t,true);
      stoneColumn(610,177,105,380); stoneColumn(930,177,105,380);
      polygon([[600,177],[636,117],[1006,117],[1045,177]],'#4b6168','#a49b7c',3);
      for(let i=0;i<9;i++) rect(625+i*45,101,22,36,'#4c626b','#96a096');
      rect(715,177,215,378,'#0a1b27');
      const open=motif==='beam'?.86:(pulseType==='success'||pulseType==='open')?(reduced?1:smooth((t-pulseAt)*.7)):.05+.02*Math.sin(t);
      ctx.save(); ctx.beginPath(); ctx.rect(715,177,215,378); ctx.clip();
      glow(822,373,190,'rgba(125,234,223,.21)');
      rect(718,180,99*(1-open),376,'#594f4b','#b19770');
      rect(829+99*open,180,99*(1-open),376,'#594f4b','#b19770');
      for(let i=0;i<6;i++) {
        const y=210+i*54;
        line([[728,y],[804-88*open,y]],'#8e7861',3);
        line([[842+88*open,y],[918,y]],'#8e7861',3);
      }
      ctx.restore();
      gear(662,286,34,t*.25,'#776d5b'); gear(983,286,34,-t*.25,'#776d5b');
      for(let i=0;i<6;i++) {
        const x=664+(i%2)*319, y=373+Math.floor(i/2)*44;
        rect(x-13,y-9,26,18,'#263e49','#668d91');
        line([[x-5,y-5],[x+4,y],[x-3,y+6]],'#92ddd1',2);
      }
      line([[662,321],[662,505],[563,505],[563,547]],'#80b9ad',3);
      for(let i=0;i<8;i++) ellipse(563+(i%3)*20,548+Math.floor(i/3)*13,3,3,`rgba(168,238,206,${.35+.5*Math.sin(t*2+i)**2})`);
      lantern(594,381,.65,t,true);
      if(motif==='beam') {
        rect(699,426,27,39,'#63837f','#c1d8ba');rect(918,426,27,39,'#63837f','#c1d8ba');
        line([[725,445],[919,445]],pulseType==='success'?'#b8ecc5':'rgba(239,141,126,.78)',3);
        ellipse(714,445,5,5,'#f3d5a0');ellipse(932,445,5,5,'#f3d5a0');
      }
      // Gate cogs turn at distinct ratios; success actually separates the leaves.
    }
    function tree(x,y,s,t,near) {
      ctx.save(); ctx.translate(x,y);ctx.scale(s,s);
      const trunk=near?'#1d3539':'#294449';
      polygon([[-38,0],[-17,-180],[-34,-307],[-15,-380],[14,-382],[31,-230],[26,-120],[62,0]],trunk);
      line([[-2,-220],[-76,-304],[-124,-326]],trunk,22);
      line([[15,-278],[82,-352],[128,-367]],trunk,17);
      for(let j=0;j<8;j++) {
        const a=j*2.1;
        ellipse(Math.cos(a)*88+Math.sin(t*.4+j)*2,-339+Math.sin(a)*67,74,61,near?'#244743':'#31564e');
      }
      line([[-24,0],[-71,12]],trunk,12);line([[22,-4],[95,15]],trunk,14);
      for(let j=0;j<5;j++) line([[8,-80-j*38],[11+Math.sin(j)*8,-99-j*38]],'#3c5b50',2);
      ctx.restore();
    }
    function forest(t) {
      sky(t,false);
      for(let i=0;i<10;i++) tree(30+i*145,520,.72+noise(i+33)*.25,t,false);
      ground(t,false);
      tree(58,623,1.55,t,true);tree(1138,619,1.5,t,true);
      for(let i=0;i<26;i++) {
        const x=140+noise(i+18)*930+Math.sin(t*(.4+noise(i)))*21;
        const y=240+noise(i+54)*330+Math.sin(t*.85+i)*12;
        glow(x,y,13,'rgba(121,245,190,.15)');ellipse(x,y,2,2,'#bdf4b5');
      }
      // Range sensor on a survey plinth sweeps an angular beam across the trail.
      stoneColumn(802,434,75,121);
      rect(793,401,93,38,'#5e7d80','#b6ccb2');
      for(const x of [817,858]) {ellipse(x,420,13,13,'#193a45','#b1c1ad');ellipse(x,420,5,5,'#91e1d2');}
      const sweep=.45*Math.sin(t*.5);
      ctx.save();ctx.translate(839,414);ctx.rotate(sweep);
      polygon([[0,0],[-370,-80],[-370,80]],'rgba(111,229,213,.07)');
      for(let i=0;i<4;i++) {
        const r=40+((t*45+i*85)%340);
        ctx.beginPath();ctx.arc(0,0,r,Math.PI-.21,Math.PI+.21);ctx.strokeStyle=`rgba(135,229,211,${(1-r/400)*.5})`;ctx.lineWidth=2;ctx.stroke();
      }
      ctx.restore();
      for(let i=0;i<9;i++) {
        const age=(t*.07+i*.135)%1;
        ctx.save();ctx.translate(210+age*870,130+noise(i)*200+age*110);ctx.rotate(t*.3+i);
        ellipse(0,0,7,2,'#a8a571');ctx.restore();
      }
    }
    function bridge(t) {
      sky(t,false);
      polygon([[0,430],[275,485],[336,680],[0,680]],'#263f46');
      polygon([[947,464],[1200,405],[1200,680],[902,680]],'#263f46');
      polygon([[335,680],[566,525],[698,525],[906,680]],'#47777b');
      for(let i=0;i<22;i++) {
        const y=539+((t*47+i*14)%155), s=(y-510)/170;
        line([[600-100*s+noise(i)*50,y],[600+60*s+noise(i)*100,y]],'rgba(158,213,210,.24)',2);
      }
      const yAt = x => 513+Math.sin((x-235)/740*Math.PI)*49;
      for(let i=0;i<29;i++) {
        if(scene.id==='bridgeCode'&&i>=13&&i<=15) {
          const progress=(pulseType==='success'||pulseType==='open')?(reduced?1:smooth((t-pulseAt)*.55)):0;
          if(progress<(i-12)/3)continue;
        }
        const x=241+i*26, y=yAt(x);
        polygon([[x-12,y-2],[x+10,y-1],[x+12,y+24],[x-13,y+25]],i%5===0?'#8f7055':'#b08b64','#5d5047',2);
      }
      for(const offset of [-55,-5]) {
        const rope=[];for(let x=240;x<=970;x+=12) rope.push([x,yAt(x)+offset]);
        line(rope,'#c3b28c',5);
      }
      for(let x=247;x<980;x+=78) line([[x,yAt(x)-57],[x,yAt(x)+17]],'#9c8a6c',3);
      for(const x of [235,980]) {rect(x-9,431,18,147,'#7e6b52');lantern(x,422,.56,t,true);}
      // A mechanical winch pulls the bridge cable: joints and spokes rotate.
      gear(1028,515,40,t*.33,'#8b7b5e');
      line([[1028,475],[983,475]],'#d1b889',4);
      ctx.save();ctx.translate(1030,393);ctx.rotate(Math.sin(t*.6)*.07);
      line([[0,-36],[0,35]],'#a7bba6',4);polygon([[0,-36],[40,-22],[0,-5]],'#cc8a70');ctx.restore();
    }
    function room(t, archive) {
      rect(0,0,WIDTH,HEIGHT,colorGradient(0,0,0,HEIGHT,[[0,'#122733'],[1,'#31484b']]));
      for(let row=0;row<11;row++) {
        const y=row*47;
        line([[0,y],[WIDTH,y]],'#29414b',2);
        for(let col=0;col<14;col++) { const x=col*98+(row%2)*49;line([[x,y],[x,y+47]],'#29414b',2); }
      }
      for(let i=0;i<5;i++) {
        const x=120+i*241;
        polygon([[x-14,0],[x+14,0],[x+22,552],[x-22,552]],'#40565b','#68827f',2);
      }
      polygon([[0,552],[1200,552],[1200,680],[0,680]],'#2c3b3f');
      for(let i=0;i<10;i++) line([[600,552],[(i-4.5)*220+600,680]],'#56615c',1);
      for(let i=0;i<4;i++)line([[0,554+i*i*14],[1200,554+i*i*14]],'#56615c',1);
      ellipse(790,133,87,87,'#182f3a','#8c947f');
      for(let i=0;i<4;i++) {
        const a=i*TAU/4+t*.13;
        line([[790,133],[790+Math.cos(a)*79,133+Math.sin(a)*79]],'#486b6d',4);
      }
      glow(790,133,125,'rgba(127,212,209,.12)');
      lantern(177,144,.85,t,true);lantern(1075,144,.85,t,true);
      if(archive) {
        for(const x of [260,980]) {
          rect(x-85,243,170,295,'#2a353e','#a08b6a');
          for(let r=0;r<4;r++) {
            rect(x-83,304+r*70,166,7,'#7e6c55');
            for(let b=0;b<9;b++) {
              const height=29+noise(b+r*9+x)*24;
              rect(x-74+b*17,303+r*70-height,12,height,['#7c6064','#68786f','#75848c','#aa8b65'][(b+r)%4]);
              line([[x-71+b*17,299+r*70-height],[x-66+b*17,299+r*70-height]],'#d2b77e',1);
            }
          }
        }
        rect(545,455,290,23,'#98785a','#ccb087');
        polygon([[561,479],[578,479],[569,564],[552,564]],'#725b4b');
        polygon([[805,479],[821,479],[836,564],[818,564]],'#725b4b');
        // An orrery rotates in three independent planes above the desk.
        ctx.save();ctx.translate(688,341);
        for(let j=0;j<3;j++) {
          ctx.save();ctx.rotate(t*(.17+j*.045)+j*1.1);
          ellipse(0,0,103,26,'rgba(69,113,116,.03)','#c2a971');
          const a=t*(.5+j*.08)+j;
          ellipse(Math.cos(a)*103,Math.sin(a)*26,8,8,['#d3c08c','#79d8ca','#dd8f81'][j]);ctx.restore();
        }
        glow(0,0,75,'rgba(126,230,203,.23)');ellipse(0,0,14,14,'#c2f0db');ctx.restore();
        line([[689,365],[689,454]],'#ac966e',5);
        polygon([[580,434],[637,420],[684,434],[732,420],[786,433],[786,450],[733,438],[684,453],[637,439],[580,451]],'#d7c49b','#8e7b61',2);
      }
    }
    function workshop(t) {
      room(t,false);
      const powered=scene.id!=='psu'||pulseType==='success'||pulseType==='open';
      const machineTime=powered?t:0;
      gear(388,223,88,machineTime*.2,'#6b746b');gear(517,175,56,-machineTime*.32,'#907d64');gear(534,294,69,-machineTime*.26,'#6c7569');
      line([[389,311],[389,445]],'#8a9f95',12);
      rect(588,333,297,173,'#2d4d55','#85b2a8');
      rect(611,358,94,104,'#18333e','#6d9691');
      for(let i=0;i<4;i++)for(let j=0;j<5;j++)ellipse(624+i*22,370+j*20,3,3,'#47616a');
      gear(657,411,35,machineTime*1.3,'#769d92',9);
      rect(731,357,125,60,'#0a2732','#5e8b87');
      for(let i=0;i<8;i++) rect(744+i*12,399-i*3,7,8+i*3,!powered?'#31494e':i<5?'#91dbb7':'#dbb16c');
      for(let i=0;i<5;i++)ellipse(744+i*24,445,5,5,powered&&Math.sin(t*3+i)>.2?'#d4f4a1':'#416657');
      // Distinct conductors flow between the supply and the experiment board.
      for(let i=0;i<3;i++) {
        const points=[[852,480+i*7],[919+i*9,480+i*7],[919+i*9,372+i*7],[1024,372+i*7]];
        line(points,['#dfaa73','#78bcae','#cc8182'][i],4);
        const p=(t*.48+i*.33)%1;
        if(powered)ellipse(857+64*p,480+i*7,4,4,'#e1f5c8');
      }
      rect(1001,330,121,74,'#376366','#9dc6a8');
      for(let i=0;i<6;i++) rect(1012+i*17,322,7,10,'#b8b484');
      // A real two-joint servo mechanism reaches, pauses, and returns.
      const shoulder={x:981,y:530};
      const a=-1.8+Math.sin(t*.65)*.22, b=.82+Math.sin(t*.65+1)*.36;
      const elbow={x:shoulder.x+Math.cos(a)*84,y:shoulder.y+Math.sin(a)*84};
      const wrist={x:elbow.x+Math.cos(a+b)*76,y:elbow.y+Math.sin(a+b)*76};
      line([[shoulder.x,shoulder.y],[elbow.x,elbow.y],[wrist.x,wrist.y]],'#859e98',17);
      line([[shoulder.x,shoulder.y],[elbow.x,elbow.y],[wrist.x,wrist.y]],'#bcd0b8',5);
      ellipse(shoulder.x,shoulder.y,18,18,'#a58f6c','#e5c68b');ellipse(elbow.x,elbow.y,14,14,'#a58f6c','#e5c68b');
      line([[wrist.x-13,wrist.y-8],[wrist.x,wrist.y],[wrist.x+13,wrist.y-8]],'#e7c596',5);
      rect(946,542,71,18,'#a78b65');
      rect(565,509,574,25,'#8f7357','#c1a176');
      for(const x of [593,1098]) rect(x,534,19,103,'#645343');
    }
    function dragon(t, miniature, dark) {
      // Local origin is the creature's chest. Most pieces are articulated.
      const beat=Math.sin(t*1.6), breathe=Math.sin(t*1.1)*3;
      ctx.save();ctx.translate(0,breathe);
      // Rear wing hinges: membranes stretch between animated metal spars.
      for(const side of [-1,1]) {
        ctx.save();ctx.translate(side*53,-37);ctx.scale(side,1);ctx.rotate(-.12+beat*.13);
        polygon([[0,0],[67,-139],[180,-217],[156,-76],[253,-86],[194,4],[267,63],[118,63]],dark?'#293f4a':'#36525c','#b4946b',3);
        line([[0,0],[67,-139],[180,-217],[115,-39],[253,-86]],'#b9a27b',5);
        line([[0,0],[115,-39],[194,4],[267,63]],'#b9a27b',5);
        line([[67,-139],[115,-39],[118,63]],'#8f8f79',3);
        for(let j=0;j<4;j++) {
          const a=j*.2;
          line([[15+j*17,-16-j*13],[85+j*8,-44-j*12]],'#60817d',2);
        }
        ellipse(0,0,18,18,'#9a865f','#dec08b');ctx.restore();
      }
      // A segmented tail follows a wave with an actual changing curve.
      const tail=[];
      for(let i=0;i<10;i++) tail.push([43+i*23,65+i*8+Math.sin(t*1.4-i*.5)*i*3]);
      line(tail,'#172c37',29);line(tail,'#8d8b72',18);
      for(let i=1;i<tail.length;i++) ellipse(tail[i][0],tail[i][1],10-i*.6,10-i*.6,'#8c8b72','#c1ae82');
      polygon([[tail[9][0]+6,tail[9][1]-10],[tail[9][0]+40,tail[9][1]+6],[tail[9][0]+7,tail[9][1]+14]],'#c5ae79');
      ellipse(0,0,76,109,'#556b6d','#c3a877');
      for(let j=0;j<5;j++) {
        const y=-70+j*34;
        line([[-57,y],[57,y]],'#aec1a7',3);
        for(const side of [-1,1])ellipse(side*56,y,4,4,'#e4c792');
      }
      glow(0,0,86,dark?'rgba(238,108,82,.15)':'rgba(255,176,77,.26)');
      gear(0,0,40,t*.48,dark?'#924d49':'#a77e51',10);
      ellipse(0,0,14,14,dark?'#f0796e':'#ffdc88');
      for(const side of [-1,1]) {
        const kneeX=side*(67+Math.sin(t*1.25+side)*5), kneeY=91;
        line([[side*47,55],[kneeX,kneeY],[side*83,153]],'#263d46',23);
        line([[side*47,55],[kneeX,kneeY],[side*83,153]],'#a6ac92',10);
        ellipse(kneeX,kneeY,14,14,'#9c936f','#d4bc83');
        polygon([[side*83-20,148],[side*83+27,148],[side*83+34,166],[side*83-24,166]],'#b5a778','#e1c58b',2);
        line([[side*60,-17],[side*110,15+beat*5],[side*129,62+beat*7]],'#9eaf9f',14);
        ellipse(side*110,15+beat*5,12,12,'#a18f6d','#dec08b');
        for(let j=0;j<3;j++) line([[side*129+j*8-8,60+beat*7],[side*133+j*9-8,78+beat*7]],'#dac18c',4);
      }
      // Neck plates and head turn together; jaws open independently.
      ctx.save();ctx.translate(-15,-101);ctx.rotate(Math.sin(t*.65)*.06);
      polygon([[-30,19],[-37,-40],[-15,-76],[25,-73],[45,-33],[35,18]],'#667d7b','#c4b081',3);
      for(let j=0;j<3;j++)line([[-30,-j*19],[31,-j*19]],'#b9c4a6',3);
      polygon([[-49,-50],[-65,-106],[-38,-122],[-28,-154],[-7,-132],[22,-129],[47,-152],[49,-117],[72,-98],[54,-48]],'#66817f','#c6b284',3);
      polygon([[-57,-98],[-79,-121],[-45,-112]],'#dbc78f');polygon([[56,-101],[83,-123],[46,-116]],'#dbc78f');
      for(const side of [-1,1]) {
        ellipse(side*28,-94,13,8,'#112c36','#b5b78a');
        ellipse(side*28-2,-94,7,5,dark?'#ee8174':'#fbd88a');
      }
      const jaw=5+Math.max(0,Math.sin(t*.7))*12;
      polygon([[-43,-60],[-16,-48-jaw],[22,-49-jaw],[48,-64],[33,-32+jaw],[-28,-32+jaw]],'#223b46','#c7b585',3);
      for(let j=0;j<6;j++)polygon([[-33+j*13,-58],[-27+j*13,-48],[-22+j*13,-58]],'#d6d4aa');
      line([[-29,-38+jaw],[31,-38+jaw]],'#91b3a6',3);
      ctx.restore();ctx.restore();
    }
    function dragonScene(t, age) {
      sky(t,false);
      polygon([[0,491],[205,354],[335,483],[493,337],[670,487],[858,349],[1200,488],[1200,680],[0,680]],'#253c45');
      ground(t,true);
      stoneColumn(915,256,69,300);stoneColumn(1053,256,69,300);
      polygon([[893,256],[939,213],[1095,213],[1141,256]],'#516a6d','#b09b75',3);
      glow(1019,346,115,'rgba(103,233,204,.23)');
      ellipse(1019,346,49,62,'#244d57','#91d5be');
      for(let i=0;i<5;i++) {
        const y=290+i*29;
        line([[969,y],[1068,y]],'#75bcb0',2);
      }
      // Tethers carry pulses between the dragon furnace and the captured beacon.
      const chest={x:754,y:367};
      for(let j=0;j<3;j++) {
        const y=344+j*28;
        const points=[];
        for(let i=0;i<13;i++) points.push([chest.x+(1019-chest.x)*i/12,y+Math.sin(i*.6+t*3+j)*7]);
        line(points,'rgba(105,225,204,.24)',7);
        const p=(t*.32+j*.33)%1;
        glow(mix(chest.x,1019,p),y,12,'rgba(164,255,216,.35)');
      }
      ctx.save();ctx.translate(chest.x,chest.y);ctx.scale(.98,.98);dragon(t,false,false);ctx.restore();
      // Sparks arc down, following a gravity-like path.
      for(let j=0;j<15;j++) {
        const p=(t*.42+noise(j+7))%1;
        const x=756+p*(noise(j+16)*180-90),y=350-p*90+p*p*180;
        line([[x,y],[x-3,y-7]],`rgba(255,201,121,${(1-p)*.75})`,2);
      }
    }
    function beacon(t, good, dark) {
      sky(t,good);ground(t,true);
      stoneColumn(770,333,188,235);
      polygon([[747,335],[795,297],[932,297],[980,335]],'#60797b','#cad0ac',3);
      for(let i=0;i<5;i++) rect(801+i*29,399,13,72,'#182f3e','#7d9b94');
      rect(821,474,86,94,'#253b44','#ad9c7d');
      for(const side of [-1,1]) {
        ctx.save();ctx.translate(863+side*47,279);ctx.rotate(side*(.2+Math.sin(t*.45)*.12));
        polygon([[-12,46],[-25,-10],[0,-71],[26,-9],[12,46]],dark?'#54636a':'#76bdb4','#d5d4ad',3);
        line([[0,-71],[0,46]],'#d6efe0',2);ctx.restore();
      }
      gear(863,278,36,t*.25,'#a3976f');
      const energy=dark?0.08:good?1:.65;
      glow(863,260,135*energy+30,`rgba(123,241,212,${energy*.34})`);
      ellipse(863,260,18,26,dark?'#3c5360':'#cef8d9','#f6ecc3');
      if(!dark&&motif!=='lens'&&motif!=='fracture') {
        for(let i=0;i<7;i++) {
          const a=-Math.PI/2+(i-3)*.23+Math.sin(t*.3)*.04;
          polygon([[854,258],[863+Math.cos(a-.028)*690,260+Math.sin(a-.028)*690],[863+Math.cos(a+.028)*690,260+Math.sin(a+.028)*690],[871,258]],`rgba(170,246,207,${good?.10:.045})`);
        }
        for(let i=0;i<4;i++) {
          const radius=31+((t*35+i*55)%250);
          ellipse(863,260,radius,radius*.43,null,`rgba(174,239,212,${(1-radius/290)*.24})`);
        }
      }
      for(const x of [671,1064]) { stoneColumn(x-20,435,40,130);lantern(x,416,.75,t,!dark); }
      if(good) for(let i=0;i<34;i++) {
        const p=(t*.12+noise(i+3))%1;
        const x=noise(i+91)*WIDTH+Math.sin(t*.6+i)*25,y=p*710-15;
        ctx.save();ctx.translate(x,y);ctx.rotate(t+i);rect(-3,-6,6,12,['#d9c683','#9bdac5','#e6a68a'][i%3]);ctx.restore();
      }
    }
    function hero(t, age) {
      let x=336;
      // On entry the apprentice walks to a clear mark; legs, arms, cloak and staff
      // move independently. Reduced motion shows the final stance immediately.
      const walking=!reduced&&age<2.8;
      if(walking)x=mix(220,336,smooth(age/2.8));
      const step=walking?Math.sin(age*9):Math.sin(t*.5)*.04;
      const lift=walking?Math.abs(Math.sin(age*9))*3:0;
      const y=581-lift;
      ellipse(x+1,585,44,10,'rgba(3,15,24,.32)');
      ctx.save();ctx.translate(x,y);
      // Cloak changes shape along the hem and shoulder while the character walks.
      const wind=Math.sin(t*2.3)*4+(walking?10:0);
      polygon([[-15,-105],[-40,-75],[-48-wind,-17],[-19-wind,-23],[-6,-11],[14,-20],[23,-80],[10,-105]],'#6773ac','#adb0d0',2);
      line([[-18,-86],[-25-wind,-30]],'#8189ba',2);
      // Boots follow separate hip/knee joints rather than translating a sprite.
      for(const side of [-1,1]) {
        const swing=step*side*15;
        const kneeX=side*9+swing*.6, kneeY=-25-Math.max(0,-step*side)*5;
        line([[side*8,-52],[kneeX,kneeY],[side*10+swing,-5]],'#1b2939',14);
        line([[side*8,-52],[kneeX,kneeY],[side*10+swing,-5]],'#7c695c',7);
        polygon([[side*10+swing-8,-10],[side*10+swing+8,-10],[side*10+swing+14,0],[side*10+swing-9,0]],'#29313c','#9c8267',1.5);
      }
      polygon([[-16,-94],[14,-94],[21,-48],[-20,-48]],'#8b7867','#d0ad80',2);
      rect(-22,-57,46,8,'#3d3a43');rect(0,-57,10,9,'#d2b778');
      line([[-13,-86],[-32,-66+step*4],[-22,-44+step*7]],'#c2a485',9);
      ellipse(-22,-44+step*7,5,5,'#e6c8a0');
      line([[15,-86],[30,-72-step*3],[46,-83]],'#c2a485',9);
      ellipse(46,-83,5,5,'#e6c8a0');
      line([[48,-134],[43,0]],'#b2a17a',5);
      polygon([[48,-158],[37,-139],[46,-120],[59,-140]],'#83d4c7','#d5e8c6',2);
      glow(48,-139,38,'rgba(136,242,210,.17)');
      // Face, side-swept hair, and a tiny spectacle lens stay readable on phones.
      ellipse(0,-115,18,23,'#e5bd92','#e6c69e');
      polygon([[-20,-111],[-20,-126],[-9,-141],[11,-141],[25,-125],[15,-114],[8,-128],[-8,-121]],'#393746','#8c7d87',1.5);
      line([[1,-113],[14,-113]],'#393a44',2);
      ellipse(11,-114,4,4,null,'#a49a87');
      line([[7,-101],[13,-102]],'#a27666',1.5);
      ctx.restore();
      pix(t,x+100,439,age);
    }
    function pix(t, x, y, age) {
      // PIX travels a small figure-eight, opens hinged wings, and changes gaze.
      const px=x+Math.sin(t*.9)*16,py=y+Math.sin(t*1.8)*8;
      ctx.save();ctx.translate(px,py);ctx.rotate(Math.sin(t*.9)*.08);
      if(motif==='pix')ctx.scale(1.65,1.65);
      glow(0,0,73,'rgba(135,232,210,.17)');
      const folded=motif==='crown'||motif==='silence';
      const wing=folded?1.05:Math.sin(t*7)*.24;
      for(const side of [-1,1]) {
        ctx.save();ctx.scale(side,1);ctx.rotate(-.1+wing);
        polygon([[8,-8],[37,-26],[49,-16],[26,3],[43,12],[33,22],[8,10]],'#8babb0','#c7e3d3',1.5);
        line([[14,0],[37,-14]],'#e2d4a5',2);ctx.restore();
      }
      if(motif==='pix')for(const side of [-1,1]) {
        ctx.save();ctx.scale(side,1);ctx.rotate(.25+Math.sin(t*7+.7)*.18);
        polygon([[10,6],[33,10],[39,31],[18,26]],'#789ca6','#d1e6c9',1.5);ctx.restore();
      }
      polygon([[-15,-20],[14,-20],[22,0],[12,21],[-12,21],[-22,0]],'#537b83','#d3ce9d',2);
      rect(-12,-9,24,17,'#163c48','#9bcfbe');
      for(const side of [-1,1])ellipse(side*6,-1,2,3,'#d9f7cb');
      line([[0,-20],[0,-33]],'#c0c79a',2);ellipse(0,-34,4,4,'#d5f6c8');
      for(let i=0;i<4;i++) {const p=(t*.35+i*.24)%1;ellipse(-23-p*42,8+Math.sin(p*5+i)*7,2*(1-p),2*(1-p),`rgba(178,244,211,${1-p})`);}
      ctx.restore();
    }
    // Narrative props give shared environments a different purpose in each scene.
    function storyDetails(t,age) {
      if(motif==='alley') {
        const target=650+Math.sin(t*.32)*280;
        polygon([[1050,160],[target-110,580],[target+110,580]],'rgba(225,221,180,.08)');
        rect(880,456,72,45,'#d1bd92','#927b5b');
        line([[889,468],[909,463],[927,476],[943,468]],'#777c68',2);
      }
      if(motif==='relay')for(let i=0;i<7;i++) {
        const x=110+i*161, p=(t*.10+i*.11)%1, y=519-p*167;
        line([[x,60],[x,y-24]],'#a6ad92',1);
        lantern(x,y,.38,t,true);
      }
      if(motif==='crossroads') {
        rect(873,410,12,164,'#968064','#c7ad81');
        polygon([[822,423],[922,423],[945,438],[922,453],[822,453]],'#8ba49a','#cfca9f',2);
        polygon([[813,473],[922,473],[922,500],[813,500],[793,487]],'#7d9292','#c3ba94',2);
        polygon([[827,521],[912,521],[930,533],[912,546],[827,546]],'#b28f6e','#ddd0a3',2);
        // Pictograms remain decorative: the HTML provides all route names.
        line([[846,436],[865,436],[865,444]],'#e4dfb5',2);
        ellipse(849,487,7,6,null,'#e4dfb5');
        line([[850,528],[850,540],[868,540],[868,528]],'#e4dfb5',2);
      }
      if(['flood','sluice','ferry'].includes(motif)) {
        rect(0,601,WIDTH,79,'rgba(50,104,115,.42)');
        for(let i=0;i<24;i++) {
          const x=(noise(i+94)*1300+t*23)%1300-50,y=608+noise(i+12)*60;
          line([[x,y],[x+25+noise(i)*37,y]],'rgba(167,217,207,.23)',2);
        }
        if(motif==='flood') {
          line([[1020,337],[1020,563]],'#d0c392',4);
          for(let i=0;i<6;i++)line([[1010,356+i*35],[1033,356+i*35]],'#d0c392',2);
          ellipse(1020,524+Math.sin(t*.9)*7,15,9,'#d9a57d','#ead2a1');
        }
        if(motif==='sluice') {
          const progress=(pulseType==='success'||pulseType==='open')?(reduced?1:smooth((t-pulseAt)*.6)):0;
          stoneColumn(989,375,30,219);stoneColumn(1121,375,30,219);
          ctx.save();ctx.beginPath();ctx.rect(1018,382,104,213);ctx.clip();
          rect(1019,392-progress*170,101,192,'#799592','#c0ccb0');
          for(let i=0;i<6;i++)line([[1025,405+i*29-progress*170],[1114,405+i*29-progress*170]],'#c2d3ba',3);
          ctx.restore();gear(1070,368,23,t*.25,'#b09970');
        }
        if(motif==='ferry') {
          const bx=730+Math.sin(t*.18)*85,by=620+Math.sin(t*.8)*3;
          polygon([[bx-100,by-15],[bx+113,by-15],[bx+79,by+17],[bx-71,by+17]],'#8f7057','#ceb58a',3);
          line([[bx-120,by-85],[bx+116,by-85]],'#cbb891',3);
          line([[bx+8,by-85],[bx+8,by-15]],'#cbb891',3);
          for(let i=0;i<5;i++) {
            const px=bx-61+i*30;
            ellipse(px,by-47,6,7,'#c9b193');
            polygon([[px-8,by-39],[px+8,by-39],[px+11,by-16],[px-10,by-16]],['#8f888c','#758f8a','#b1987d'][i%3]);
          }
          lantern(bx+88,by-38,.35,t,true);
        }
      }
      if(motif==='cellar') {
        const x=862,y=455;
        line([[x-84,y-173],[x+9,y+66],[x+81,y-136]],'#577167',7);
        line([[x-64,y-121],[x-37,y+58],[x+50,y-127]],'#647e6c',4);
        ellipse(x,y-57,28,25,'#92967b','#dbca96');
        rect(x-33,y-30,66,65,'#6f8c87','#c6c899');
        ellipse(x-10,y-60,5,6,'#f2d88c');ellipse(x+10,y-60,5,6,'#f2d88c');
        for(const side of [-1,1]) {
          line([[x+side*29,y-20],[x+side*56,y+6],[x+side*69,y-43]],'#a4ac8b',11);
          line([[x+side*15,y+32],[x+side*21,y+65]],'#a4ac8b',13);
        }
        lantern(x+70,y-66,.53,t,true);
      }
      if(motif==='clock') {
        for(let i=0;i<4;i++) {
          const x=697+i*68,y=276-i*19;
          polygon([[x,y],[x+44,y-11],[x+44,y+5],[x,y+16]],'#a89b7e','#d2c8a2',2);
        }
        gear(1040,257,52,-t*.22,'#98896e');
      }
      if(motif==='mirror'||motif==='fracture') {
        polygon([[747,194],[955,194],[991,418],[711,418]],motif==='mirror'?'#a5c2ba':'#3f5d68','#d1c59e',8);
        for(let i=0;i<7;i++) {
          const x=750+i*31;
          rect(x,328-noise(i)*26,23,63+noise(i)*26,'#6b8c89');
          polygon([[x-4,328-noise(i)*26],[x+12,305-noise(i)*25],[x+28,328-noise(i)*26]],'#4f7477');
        }
        if(motif==='mirror') {
          ellipse(853,263,28,28,'#e6d7a1');
          polygon([[761,210],[797,210],[878,404],[846,404]],'rgba(231,249,228,.16)');
          line([[1007,477],[1007,427],[1038,396]],'#bda66f',9);ellipse(1040,394,12,12,'#ddc38b');
        } else {
          line([[837,195],[855,253],[809,305],[872,334],[844,417]],'#d8d5bd',3);
          line([[855,253],[906,272],[945,248]],'#d8d5bd',2);
          line([[872,334],[934,349],[960,394]],'#d8d5bd',2);
          glow(849,306,110,'rgba(167,131,195,.2)');
          for(let i=0;i<6;i++)polygon([[918+i*8,447+i*4],[935+i*8,425+i*6],[942+i*8,461+i*4]],'#847297','#d8bda4',1);
        }
      }
      if(motif==='lens') {
        const progress=(pulseType==='success'||pulseType==='open')?(reduced?1:smooth((t-pulseAt)*.65)):0;
        const a=mix(-.12,-2.25,progress);
        ctx.save();ctx.translate(863,260);ctx.rotate(a);
        polygon([[0,-9],[515,-72],[515,72],[0,9]],'rgba(167,244,214,.13)');
        rect(-37,-21,75,42,'#6d9292','#d0d5aa');
        ellipse(39,0,8,26,'#a7d7c7','#e8e2b6');
        line([[-28,-13],[25,-13]],'#acd1bc',3);ctx.restore();
        ellipse(863,260,14,14,'#d0c18b','#eee4b0');
      }
      if(motif==='heart') {
        const x=1053,y=565;
        polygon([[x-17,y-90],[x+14,y-90],[x+32,y],[x-32,y]],'#535372','#aaa2a7',2);
        ellipse(x,y-109,15,19,'#b4a58f','#d4c1a0');
        polygon([[x-19,y-108],[x-16,y-132],[x+14,y-132],[x+22,y-108],[x+9,y-120]],'#6b7182');
        line([[x-12,y-75],[x-31,y-43],[x-54,y-51]],'#8f91a0',10);
        lantern(x-56,y-65,.47,t,true);
      }
      if(motif==='memory'||motif==='pix') {
        const wave=[];
        for(let i=0;i<50;i++)wave.push([570+i*5,248+Math.sin(i*.7+t*2)*Math.sin(i*.15)*16]);
        line(wave,'rgba(185,238,205,.7)',2);
        for(let i=0;i<5;i++) {
          const x=581+i*61,y=191+Math.sin(t*.4+i)*5;
          ellipse(x,y,16,19,'rgba(169,216,189,.12)','#8cb9a7');
          line([[x-9,y+30],[x,y+17],[x+9,y+30]],'#8cb9a7',2);
        }
      }
      if(motif==='console'&&(pulseType==='success'||pulseType==='open')) {
        const p=reduced?1:smooth((t-pulseAt)*.5);
        ctx.save();ctx.beginPath();ctx.rect(380,80,820,470);ctx.clip();
        for(let i=0;i<4;i++) {
          ctx.beginPath();ctx.ellipse(811,553,290*p+i*15,392*p+i*15,0,Math.PI,TAU);
          ctx.strokeStyle=`rgba(179,241,205,${.20-i*.025})`;ctx.lineWidth=8-i;ctx.stroke();
        }
        ctx.restore();
      }
      if(motif==='celebration')for(let i=0;i<10;i++) {
        const x=570+i*53+Math.sin(t*.9+i)*16,y=325+Math.sin(t*1.1+i)*40;
        const flap=4+Math.sin(t*8+i)*4;
        ellipse(x-5,y,6,flap,'#acd6c2');ellipse(x+5,y,6,flap,'#acd6c2');
        ellipse(x,y,2,5,'#ecd6a1');
      }
      if(motif==='embers')for(let i=0;i<7;i++) {
        const x=591+i*67+(reduced?0:(t*9)%70),y=580+Math.sin(i)*14;
        const step=Math.sin(t*3+i)*4;
        ellipse(x,y-38,7,8,'#c9b390');
        polygon([[x-8,y-31],[x+9,y-31],[x+13,y-9],[x-12,y-9]],['#708b87','#9a7b77','#9c956f'][i%3]);
        line([[x-4,y-9],[x-5-step,y+9]],'#4d575b',6);line([[x+5,y-9],[x+6+step,y+9]],'#4d575b',6);
        if(i%2===0)lantern(x+17,y-18,.25,t,true);
      }
      if(motif==='silence')for(const x of [610,942,1103]) {
        glow(x,559,31,'rgba(233,160,93,.14)');
        polygon([[x-6,566],[x-10,555],[x-1,541-Math.sin(t*5)*3],[x+8,557],[x+5,566]],'#c38f65');
      }
    }
    function weather(t) {
      if(['workshop','archive','victory'].includes(visual))return;
      const dry=visual==='forest'||visual==='beacon';
      for(let i=0;i<(dry?18:58);i++) {
        const p=(t*(dry?.19:.76)+noise(i+51))%1;
        const x=noise(i+93)*1300-50-p*70;
        const y=p*760-40;
        if(dry)ellipse(x,y,1.7,1.7,'rgba(167,213,191,.31)');
        else line([[x,y],[x-4,y+14]],'rgba(163,203,213,.15)',1);
      }
    }
    function pulseParticles(t) {
      const age=t-pulseAt;
      if(age<0||age>1.6||reduced)return;
      const failed=['failure','error','wrong'].includes(pulseType);
      for(let i=0;i<24;i++) {
        const a=i*TAU/24;
        const radius=30+age*(55+noise(i+4)*55);
        const x=600+Math.cos(a)*radius,y=350+Math.sin(a)*radius+age*age*24;
        const color=failed?`rgba(245,147,125,${1-age/1.6})`:`rgba(174,244,208,${1-age/1.6})`;
        line([[x,y],[x-Math.cos(a)*7,y-Math.sin(a)*7]],color,2);
      }
    }
    function resolveVisual(s) {
      const v=String(s.visual||'').toLowerCase();
      const aliases={storm:'village',alley:'village',relay:'village',crossroads:'village',flood:'bridge',sluice:'bridge',ferry:'bridge',cellar:'workshop',clock:'workshop',mirror:'beacon',fracture:'beacon',lens:'beacon',heart:'dragon',memory:'archive',pix:'archive',beam:'gate',console:'beacon',dawn:'beacon',celebration:'victory',embers:'victory',crown:'dark',silence:'dark'};
      if(aliases[v])return aliases[v];
      const supported=['village','gate','forest','bridge','workshop','archive','dragon','beacon','victory','dark'];
      if(supported.includes(v))return v;
      const search=(v+' '+s.id+' '+s.title+' '+s.location).toLowerCase();
      if(/ending|dawn|saved|victory|homecoming|good/.test(search))return /dark|bad|lost|price|ashes|throne|silence/.test(search)?'dark':'victory';
      if(/dragon|siege|warden|heart|climax|battle/.test(search))return 'dragon';
      if(/beacon|lantern|tower|spire|summit/.test(search))return 'beacon';
      if(/gate|door|lock|password/.test(search))return 'gate';
      if(/bridge|river|canyon|servo/.test(search))return 'bridge';
      if(/forest|grove|sensor|marsh|trail/.test(search))return 'forest';
      if(/archive|library|map|memory|scroll/.test(search))return 'archive';
      if(/workshop|forge|power|psu|circuit|supply/.test(search))return 'workshop';
      return 'village';
    }
    function draw(time, age) {
      currentTime=time;
      const t=reduced?4:Math.max(0,Number.isFinite(time)?time:0);
      age=reduced?4:Math.max(0,Number.isFinite(age)?age:0);
      ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
      ctx.clearRect(0,0,drawWidth,drawHeight);
      // Shallow phone stages need the whole composition: cover would crop the
      // apprentice and PIX below the frame. Uniform contain adds quiet sidebars.
      const shallow=drawWidth/drawHeight>2.2;
      if(shallow)rect(0,0,drawWidth,drawHeight,colorGradient(0,0,0,drawHeight,[[0,'#091724'],[1,'#17313b']]));
      const scale=(shallow?Math.min:Math.max)(drawWidth/WIDTH,drawHeight/HEIGHT);
      const ox=(drawWidth-WIDTH*scale)/2,oy=(drawHeight-HEIGHT*scale)/2;
      ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
      ctx.beginPath();ctx.rect(0,0,WIDTH,HEIGHT);ctx.clip();
      ctx.lineJoin='round';ctx.lineCap='round';
      const failed=['failure','error','wrong'].includes(pulseType)&&(reduced?pulseAt>=0:t-pulseAt<.5&&t-pulseAt>=0);
      if(failed&&!reduced)ctx.translate(Math.sin((t-pulseAt)*58)*4*(1-(t-pulseAt)*2),0);
      switch(visual) {
        case 'gate':gate(t,age);break;
        case 'forest':forest(t);break;
        case 'bridge':bridge(t);break;
        case 'workshop':workshop(t);break;
        case 'archive':room(t,true);break;
        case 'dragon':dragonScene(t,age);break;
        case 'beacon':beacon(t,false,false);break;
        case 'victory':village(t,true,false);break;
        case 'dark':village(t,false,true);break;
        default:village(t,false,false);
      }
      hero(t,age);
      storyDetails(t,age);
      weather(t);pulseParticles(t);
      // Foreground haze and vignette unify the scenery, while the center remains
      // clear for the game's action. Canvas text is intentionally not used.
      rect(0,HEIGHT-59,WIDTH,59,colorGradient(0,HEIGHT-59,0,HEIGHT,[[0,'rgba(6,20,28,0)'],[1,'rgba(6,20,28,.48)']]));
      const vignette=ctx.createRadialGradient(WIDTH*.55,HEIGHT*.46,HEIGHT*.28,WIDTH*.55,HEIGHT*.46,WIDTH*.69);
      vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(3,13,23,.52)');
      rect(0,0,WIDTH,HEIGHT,vignette);
      if(age<.7&&!reduced)rect(0,0,WIDTH,HEIGHT,`rgba(8,20,30,${(1-smooth(age/.7))*.45})`);
      if(failed&&reduced) {ctx.strokeStyle='#e69b87';ctx.lineWidth=8;ctx.strokeRect(5,5,WIDTH-10,HEIGHT-10);}
      ctx.restore();
    }
    function resize() {
      if(!alive)return;
      const bounds=canvas.getBoundingClientRect?canvas.getBoundingClientRect():{width:canvas.width,height:canvas.height};
      drawWidth=Math.max(1,bounds.width||canvas.clientWidth||WIDTH);
      drawHeight=Math.max(1,bounds.height||canvas.clientHeight||HEIGHT);
      pixelRatio=clamp(root.devicePixelRatio||1,1,2);
      const w=Math.round(drawWidth*pixelRatio),h=Math.round(drawHeight*pixelRatio);
      if(canvas.width!==w)canvas.width=w;
      if(canvas.height!==h)canvas.height=h;
      const elapsed=now()-origin;
      draw(elapsed,now()-sceneOrigin);
    }
    function setScene(nextScene,nextState) {
      scene=nextScene||{id:'arrival',visual:'village'};
      state=nextState||{};
      motif=String(scene.visual||'').toLowerCase();
      visual=resolveVisual(scene);
      // If a story engine supplies a specific ending palette, honour it.
      if(scene.ending && /dark|bad|tragic|loss/.test(String(scene.ending)))visual='dark';
      sceneOrigin=now();
      pulseAt=-100;pulseType='';
      draw(now()-origin,0);
    }
    function pulse(type) {
      pulseType=String(type||'success');pulseAt=currentTime;
      draw(currentTime,now()-sceneOrigin);
    }
    function renderAt(seconds) {
      const t=Math.max(0,Number(seconds)||0);
      draw(t,t);
    }
    function tick() {
      if(!alive)return;
      if(!reduced&&!(root.document&&root.document.hidden))draw(now()-origin,now()-sceneOrigin);
      animation=root.requestAnimationFrame(tick);
    }
    function motionChanged(event) {
      reduced=!!event.matches;
      draw(now()-origin,now()-sceneOrigin);
    }
    let observer=null;
    if(typeof root.ResizeObserver==='function') {observer=new root.ResizeObserver(resize);observer.observe(canvas);}
    if(root.addEventListener)root.addEventListener('resize',resize);
    if(media&&media.addEventListener)media.addEventListener('change',motionChanged);
    resize();
    if(typeof root.requestAnimationFrame==='function')animation=root.requestAnimationFrame(tick);
    function destroy() {
      alive=false;
      if(animation&&root.cancelAnimationFrame)root.cancelAnimationFrame(animation);
      if(observer)observer.disconnect();
      if(root.removeEventListener)root.removeEventListener('resize',resize);
      if(media&&media.removeEventListener)media.removeEventListener('change',motionChanged);
    }
    return {setScene,resize,destroy,pulse,renderAt};
  }

  root.CircuitboundArt=Object.freeze({create,WIDTH,HEIGHT});
})(typeof window!=='undefined'?window:globalThis);
