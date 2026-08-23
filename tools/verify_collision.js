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
// verify_collision · v0.95.759 · flora and moved buildings actually block

try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={WORLD_PROPS,_propBlocked,registerPropCollision,unregisterPropCollision,snapBuildingsToLattice,buildAllTrails,worldDistrictAt,isWorldLandTile,isWorldBorderTile,DISTRICT_WHEEL,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
const tiles=p=>(p.footprint||[]).map(([dx,dy])=>`${p.tileX+dx},${p.tileY+dy}`);
const solid=p=>{const t=tiles(p); return t.length>0 && t.every(k=>C._propBlocked.has(k));};

const b30=C.WORLD_PROPS.filter(p=>p&&p._district30);
const oldT=new Map(b30.map(p=>[p.id,tiles(p)]));
const sizeBefore=C._propBlocked.size;
C.snapBuildingsToLattice(); C.buildAllTrails();

H('1 · ★★ TRAIL FLORA IS SOLID');
// _propBlocked is baked once at boot. Trail flora is pushed in a deferred tick
// long after, so 13,215 bushes, trees and cacti declared footprints and blocked
// nothing — the player walked through every forest and hedge in the game.
{
  const FL=/decor\/(?:[a-z]+\/)?[a-z0-9-]*(?:tree|cactus|bush)/;
  const fl=C.WORLD_PROPS.filter(p=>p&&p.src&&FL.test(p.src)&&(p.footprint||[]).length);
  const trail=fl.filter(p=>p._trailVerge||p._borderForest);
  ok(fl.length>15000,`${fl.length} flora props declare a footprint`);
  ok(trail.length>10000,`${trail.length} of them are built after the bake — the ones that were hollow`);
  ok(fl.filter(solid).length===fl.length,
     `all ${fl.length} are in _propBlocked (${fl.length-fl.filter(solid).length} hollow)`);
  const cactus=fl.filter(p=>/cactus/.test(p.src));
  ok(cactus.length>0&&cactus.every(solid),`Zarvane's ${cactus.length} cacti block`);
}

H('2 · ★ GRASS STILL DOES NOT BLOCK');
// Grass is the encounter trigger. Making it solid would wall off every wild zone.
{
  const g=C.WORLD_PROPS.filter(p=>p&&/grass/.test(p.src||''));
  ok(g.length>5000,`${g.length} grass props to check`);
  ok(g.every(p=>!(p.footprint||[]).length),'none of them carry a footprint — you walk through grass');
}

H('3 · ★★ MOVED BUILDINGS TOOK THEIR COLLISION WITH THEM');
// snapBuildingsToLattice runs after the bake too. Without the register pair,
// all 30 blocked the tiles they used to stand on and none they now do.
{
  const t=b30.reduce((a,p)=>a+(p.footprint||[]).length,0);
  const live=b30.reduce((a,p)=>a+tiles(p).filter(k=>C._propBlocked.has(k)).length,0);
  ok(b30.length===30,`${b30.length} lore buildings`);
  ok(live===t,`all ${t} of their footprint tiles are solid at the NEW positions`);
  // every leftover tile at an old site must be OWNED by something else now
  let orphan=0;
  for(const p of b30) for(const k of oldT.get(p.id)) if(C._propBlocked.has(k)){
    const owner=C.WORLD_PROPS.some(q=>q&&q!==p&&(q.footprint||[]).some(([dx,dy])=>`${q.tileX+dx},${q.tileY+dy}`===k));
    if(!owner) orphan++;
  }
  ok(orphan===0,`no orphaned collision left at the old sites (${orphan})`);
}

H('4 · THE CHOKEPOINT IS SYMMETRIC');
// register/unregister must be exact inverses or repeated moves leak tiles.
{
  const p=b30[0], n=C._propBlocked.size;
  C.unregisterPropCollision(p);
  const afterOff=C._propBlocked.size;
  C.registerPropCollision(p);
  ok(afterOff<n,`unregister frees tiles (${n-afterOff})`);
  ok(C._propBlocked.size===n,`and register puts back exactly the same count (${C._propBlocked.size} vs ${n})`);
}

H('5 · ★★ NOTHING GOT SEALED IN');
// 13k new solid tiles is the risk. Every POI must still be walkable-to, and
// every district still reachable overland.
{
  const walk=(x,y)=>C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(`${x},${y}`);
  const spot=p=>{for(let r=1;r<=8;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)
    if(walk(p.tileX+dx,p.tileY+dy))return[p.tileX+dx,p.tileY+dy];return null;};
  const anchors={};
  for(const w of C.DISTRICT_WHEEL){
    const b=b30.find(p=>p._district30===w.dist);
    if(b) anchors[w.dist]=spot(b);
  }
  const start=anchors['malezor'];
  ok(!!start,'Malezor has standing room beside its first lore building');
  const seen=new Set([start.join(',')]),q=[start];
  while(q.length){const[x,y]=q.pop();
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;
      if(!seen.has(k)&&walk(nx,ny)){seen.add(k);q.push([nx,ny]);}}}
  ok(seen.size>200000,`the walkable world is one big region (${seen.size} tiles)`);
  const cut=C.DISTRICT_WHEEL.filter(w=>!anchors[w.dist]||!seen.has(anchors[w.dist].join(',')));
  ok(cut.length===0,`all 10 districts reachable on foot from Malezor${cut.length?' — cut off: '+cut.map(w=>w.dist).join(', '):''}`);
  // and every lore building + Gemlord cave individually
  let un=[];
  for(const w of C.DISTRICT_WHEEL){
    const P=C.WORLD_PROPS.filter(p=>p&&C.worldDistrictAt(p.tileX,p.tileY)===w.dist);
    for(const t of [...P.filter(p=>p._district30), ...P.filter(p=>/_cave$/.test(p.id||''))]){
      const s=spot(t);
      if(!s||!seen.has(s.join(','))) un.push(`${w.dist}:${(t.id||'?').slice(0,24)}`);
    }
  }
  ok(un.length===0,`every lore building and Gemlord cave is walkable-to${un.length?' — '+un.slice(0,5).join(' '):''}`);
}

H('6 · THE WORLD GOT MEANINGFULLY MORE SOLID');
ok(C._propBlocked.size>sizeBefore+10000,
   `_propBlocked grew ${sizeBefore} -> ${C._propBlocked.size} (+${C._propBlocked.size-sizeBefore})`);

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
