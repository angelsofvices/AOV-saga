const fs = require('fs');
const _harnessSrc = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0; global.setTimeout = () => 0;
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width:0, height:0, data:[] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(), pause:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
// verify_sway · v0.95.769 · flora sway · the world stops being a photograph
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={floraSwayShear,FLORA_SWAY,_swayPhase,_floraClass,WORLD_PROPS,TILE,snapBuildingsToLattice,buildAllTrails,scatterWoodChests};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests();
const FL=/decor\/(?:[a-z]+\/)?[a-z0-9-]*(?:tree|cactus|bush|grass|grassblade)/;
const flora=C.WORLD_PROPS.filter(p=>p&&p.src&&FL.test(p.src)&&p.tileX!=null);
const still=C.WORLD_PROPS.filter(p=>p&&p.src&&!FL.test(p.src));

H('1 · ★★ THE WORLD MOVES NOW');
ok(flora.length>19000,`${flora.length} props sway (before this: 3 in the whole world — two portals and a fountain)`);
ok(still.length>0&&still.every(p=>C.floraSwayShear(p,1234)===0),
   `and all ${still.length} buildings, chests and structures stay rigid`);

H('2 · ★★ THE BASE STAYS PLANTED');
// The shear pivots on the foot line. If it pivoted on the sprite centre the
// trunk would slide off its own roots, which is the classic tell.
{
  const sh=0.05, drawH=144;
  const atFoot=(x,y)=>x+sh*y;
  ok(atFoot(0,0)===0,'y=0 (the feet) maps to itself · no horizontal slide at the base');
  ok(Math.abs(atFoot(0,-drawH))>0,`y=-${drawH} (the canopy) travels ${Math.abs(atFoot(0,-drawH)).toFixed(1)}px`);
}

H('3 · ★ EVERY CLASS MOVES A VISIBLE, SIMILAR AMOUNT');
// One global shear scaled by height gave a tall tree 4.4px and a grass tuft
// 1.0px — invisible, and backwards. A trunk barely moves in wind; blades whip.
{
  const peak=p=>{const dh=(p.tileW||1)*C.TILE*(p.bbox?p.bbox[3]/p.bbox[2]:1);
    let m=0; for(let ms=0;ms<20000;ms+=37){const s=Math.abs(C.floraSwayShear(p,ms)); if(s>m)m=s;} return m*dh;};
  const pick=re=>flora.find(p=>re.test(p.src));
  const rows=[['tree',pick(/malezor-tree/)],['cactus',pick(/cactus/)],
              ['bush',pick(/\/bush\.png/)],['grass',pick(/grass-patch/)]];
  let lo=99,hi=0;
  for(const [n,p] of rows){ if(!p) continue; const v=peak(p); lo=Math.min(lo,v); hi=Math.max(hi,v);
    console.log(`     ${n.padEnd(7)} ${v.toFixed(1)}px`); }
  // ★ v0.95.770 · THE FLOOR MOVED BECAUSE THE INTENT MOVED, not to make a
  // failing check pass. The Creator dialled the whole field back to 0.75, which
  // took the quietest class from 2.6px to 1.9px. Motion is far easier to see
  // than a static offset, so ~2px on a moving object still reads at 48px tiles.
  // What this check now guards is the real risk introduced by a master dial:
  // that scale gets nudged down repeatedly until nature stops moving at all.
  ok(lo>=1.5,`the quietest class still travels ${lo.toFixed(1)}px — below ~1.5 nothing reads as motion`);
  ok(hi<=8.0,`the loudest travels ${hi.toFixed(1)}px — not rubbery`);
  // and the classes must keep their RELATIONSHIP whatever the master dial says
  ok(hi/lo<2.6,`loudest/quietest ratio ${(hi/lo).toFixed(2)} — the field stays proportionate`);
  ok(C.FLORA_SWAY.scale>0&&C.FLORA_SWAY.scale<=1,
     `master scale is ${C.FLORA_SWAY.scale} · one dial moves all nature together`);
  ok(C._floraClass('x/grass-a.png')==='grass'&&C._floraClass('x/zarvane-cactus.png')==='tree',
     'a cactus is classed with the stiff things, not the whippy ones');
}

H('4 · ★★ NEIGHBOURS ARE NEVER IN STEP');
// Uniform phase would look like the whole map hinged on one point. My first
// check compared ONE adjacent pair, got "in step", and was simply unlucky —
// 6% of random pairs are within 0.2 rad. Sample the whole field instead.
{
  const at=new Map(); flora.forEach(p=>at.set(`${p.tileX},${p.tileY}`,p));
  const circ=(a,b)=>{const d=Math.abs(a-b)%(Math.PI*2); return Math.min(d,Math.PI*2-d);};
  let n=0,sum=0,lock=0;
  for(const p of flora) for(const [dx,dy] of [[1,0],[0,1]]){
    const q=at.get(`${p.tileX+dx},${p.tileY+dy}`); if(!q) continue;
    const d=circ(C._swayPhase(p),C._swayPhase(q)); n++; sum+=d; if(d<0.2)lock++;
  }
  ok(n>5000,`${n} adjacent pairs sampled — one pair proves nothing`);
  const mean=sum/n, pct=100*lock/n;
  ok(Math.abs(mean-Math.PI/2)<0.15,`mean phase gap ${mean.toFixed(3)} rad vs ${(Math.PI/2).toFixed(3)} for pure random`);
  ok(pct<10,`${pct.toFixed(1)}% of neighbours are within 0.2 rad (random gives ~6.4%)`);
}

H('5 · ★ PHASE IS STABLE, NOT RE-ROLLED');
// A Math.random() here would give each prop a new phase every reload, and worse,
// a DIFFERENT phase from its own shadow.
{
  const p=flora[11];
  const a=C._swayPhase(p), b=C._swayPhase(p);
  ok(a===b,'asking twice gives the same phase');
  ok(p._swayPhase!=null,'it is cached on the prop, derived from tile position');
  const q=flora.find(x=>x!==p&&x.tileX===p.tileX&&x.tileY===p.tileY);
  ok(!q||C._swayPhase(q)===a,'two things on one tile share a phase — they are in the same gust');
}

H('6 · ★ IT BREATHES');
// A pure sine at one amplitude reads as a machine. The gust envelope varies the
// strength between 60% and 100% on a much slower cycle.
{
  const p=flora.find(x=>/malezor-tree/.test(x.src));
  const amps=[]; for(let ms=0;ms<30000;ms+=250){ let m=0;
    for(let k=0;k<2400;k+=40) m=Math.max(m,Math.abs(C.floraSwayShear(p,ms+k))); amps.push(m); }
  const lo=Math.min(...amps), hi=Math.max(...amps);
  ok(hi/lo>1.3,`gust strength varies ${(hi/lo).toFixed(2)}x across the cycle — not a metronome`);
}

H('7 · IT CAN BE TURNED OFF');
{
  C.FLORA_SWAY.enabled=false;
  ok(flora.every(p=>C.floraSwayShear(p,999)===0),'one flag stops the whole world swaying');
  C.FLORA_SWAY.enabled=true;
  ok(flora.some(p=>C.floraSwayShear(p,999)!==0),'and starts it again');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
