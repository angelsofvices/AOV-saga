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
// verify_facade · v0.95.763 · nothing stands inside a building

try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={FLORA_SRC_RE,isFloraProp,propDrawTilesH,WORLD_PROPS,BOULDERS,_fae,_propBlocked,_buildingFacadeTiles,evictFromBuildings,snapBuildingsToLattice,buildAllTrails,scatterWoodChests,topUpDistrictCollectibles,isWorldLandTile,isWorldBorderTile,worldDistrictAt,DISTRICT_WHEEL};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
// ★★ v0.95.771 · USE THE ENGINE'S OWN PREDICATE.
// This file used to carry its own copy of the flora pattern — and it was the
// same NARROW copy evictFromBuildings had, matching tree|cactus|bush and NOT
// grass. So the suite validated exactly the subset the code handled, passed
// clean, and 51 grass tufts sat inside buildings the whole time. A check
// written from the code's own assumption cannot catch the code's blind spot.
const FLORA={test:src=>C.FLORA_SRC_RE.test(src)};
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests();
C.topUpDistrictCollectibles(); C.evictFromBuildings();
const facade=C._buildingFacadeTiles();

H('1 · THE FACADE MAP IS REAL');
// This whole suite is worthless if the facade set is empty, and an empty set is
// exactly what a broken visual-box calculation would produce.
{
  ok(facade.size>5000,`${facade.size} tiles sit inside a drawn building`);
  const blocked=[...facade].filter(k=>C._propBlocked.has(k)).length;
  ok(blocked<facade.size,
     `only ${blocked} of them actually block — the other ${facade.size-blocked} are walkable upper storeys, which is why every scatter pass missed them`);
}

H('2 · ★★ NO TREE, BUSH OR CACTUS INSIDE A BUILDING');
{
  const fl=C.WORLD_PROPS.filter(p=>p&&p.src&&FLORA.test(p.src));
  const inside=fl.filter(p=>facade.has(`${p.tileX},${p.tileY}`));
  ok(fl.length>15000,`${fl.length} flora props checked`);
  ok(inside.length===0,`none stands inside a facade (${inside.length})`);
}

console.log('\n2b · ★★ THE HALF RULE · a plant may cover a house, not wear it');
// Creator: "only the top half of the bushes can be on a house. cannot fully
// cover them. idea of the bush is planted in front of the house."
// So a plant's foot must sit at least half its own drawn height BELOW the
// building's base line — per plant, not per building.
{
  const B=C.WORLD_PROPS.filter(p=>p&&p.src&&/\/buildings\//.test(p.src)&&p.tileX!=null);
  const span=p=>{const w=p.tileW||1;return [Math.round(p.tileX-w/2),Math.round(p.tileX+w/2)];};
  const bad=[];
  for(const f of C.WORLD_PROPS){
    if(!C.isFloraProp(f)||f.tileX==null) continue;
    const [fx0,fx1]=span(f), fh=C.propDrawTilesH(f);
    const need=Math.max(1,Math.ceil(fh/2)), fTop=f.tileY-fh+1;
    for(const b of B){
      const [bx0,bx1]=span(b);
      if(fx1<bx0||fx0>bx1) continue;
      const bh=C.propDrawTilesH(b);
      if(f.tileY<Math.round(b.tileY-bh+1)) continue;   // above the roof · same rounding as the engine
      if(fTop>b.tileY) continue;           // plant sits below the base · in front
      if(f.tileY<b.tileY+need){ bad.push(`${f.id}@${f.tileX},${f.tileY} on ${b.id}`); break; }
    }
  }
  ok(B.length>100&&C.WORLD_PROPS.filter(C.isFloraProp).length>19000,
     'there are buildings and plants to check — worthless on an empty world');
  ok(bad.length===0,`no plant covers a building past its own half height (${bad.length})${bad.length?': '+bad.slice(0,4).join(', '):''}`);
  // ★ and the rule must not have emptied the doorsteps: plants SHOULD still
  // stand in front of buildings, which is the whole point of "planted in front".
  let inFront=0;
  for(const f of C.WORLD_PROPS){
    if(!C.isFloraProp(f)||f.tileX==null) continue;
    const [fx0,fx1]=span(f);
    for(const b of B){
      const [bx0,bx1]=span(b);
      if(fx1<bx0||fx0>bx1) continue;
      const d=f.tileY-b.tileY;
      if(d>=1&&d<=3){ inFront++; break; }
    }
  }
  ok(inFront>200,`${inFront} plants still stand 1-3 rows in front of a building — the fix did not strip the gardens`);
}

H('3 · ★★ NO BOULDER INSIDE A BUILDING');
{
  const inside=C.BOULDERS.filter(b=>facade.has(`${b.tileX},${b.tileY}`));
  ok(C.BOULDERS.length>300,`${C.BOULDERS.length} boulders checked`);
  ok(inside.length===0,`none stands inside a facade (${inside.length})`);
  // and none was quietly deleted — a life stone is a quest resource
  const life=C.BOULDERS.filter(b=>b.type==='life').length;
  ok(life===100,`all 100 life stones survived the eviction (${life})`);
}

H('4 · CHESTS AND FAE TOO');
// Same bug class. A chest drawn inside a wall cannot be opened; a fae inside
// one cannot be caught.
{
  const ch=C.WORLD_PROPS.filter(p=>p&&p._woodChest);
  ok(ch.filter(p=>facade.has(`${p.tileX},${p.tileY}`)).length===0,
     `no wooden chest is inside a facade (of ${ch.length})`);
  ok(C._fae.filter(f=>facade.has(`${f.x},${f.y}`)).length===0,
     `no fae is inside a facade (of ${C._fae.length})`);
}

H('5 · ★ THE BASE ROW IS STILL ALLOWED');
// Flora ON a building's ground row stands IN FRONT of it, which is what a
// garden bush should do. If eviction had swept that too, every building in the
// game would be ringed by bare ground.
{
  let atBase=0;
  for (const p of C.WORLD_PROPS){
    if (!p || !p.src || !/\/buildings\//.test(p.src) || p.tileX==null) continue;
    const w=p.tileW||1;
    const x0=Math.round(p.tileX-w/2), x1=Math.round(p.tileX+w/2);
    for (const q of C.WORLD_PROPS){
      if (!q || !q.src || !FLORA.test(q.src)) continue;
      if (q.tileY===p.tileY && q.tileX>=x0 && q.tileX<=x1) atBase++;
    }
  }
  ok(atBase>0,`${atBase} flora still stand on a building's base row — in front of it, not in it`);
}

H('6 · NOTHING WAS LOST OR CORRUPTED BY THE MOVE');
{
  const fl=C.WORLD_PROPS.filter(p=>p&&p.src&&FLORA.test(p.src));
  const offMap=fl.filter(p=>!C.isWorldLandTile(p.tileX,p.tileY)||C.isWorldBorderTile(p.tileX,p.tileY));
  ok(offMap.length===0,`no relocated flora landed on water or a border tile (${offMap.length})`);
  // ★ v0.95.771 · GRASS IS A GROUND LAYER, not an object. A tree growing out
  // of a grass patch is correct; two bushes on one tile is not. This check used
  // the narrow tree|cactus|bush pattern and so was accidentally right about
  // stacking while being wrong about facades — same regex, two different
  // questions, and only one of the answers was valid.
  const solid=fl.filter(p=>!/grass/.test(p.src));
  const keys=solid.map(p=>`${p.tileX},${p.tileY}`);
  ok(solid.length>10000,`${solid.length} solid plants (grass excluded — it is a ground layer)`);
  ok(keys.length===new Set(keys).size,`no two solid plants share a tile (${keys.length-new Set(keys).size})`);
  // and grass under a tree is fine, but grass under grass is a double-draw
  const g=fl.filter(p=>/grass/.test(p.src)&&!/grass_overlay_/.test(p.id||''));
  const gk=g.map(p=>`${p.tileX},${p.tileY}`);
  ok(gk.length===new Set(gk).size,`no tile carries two grass bases (${gk.length-new Set(gk).size})`);
  // collision must have travelled with them
  const hollow=fl.filter(p=>(p.footprint||[]).length&&!C._propBlocked.has(`${p.tileX},${p.tileY}`));
  ok(hollow.length===0,`every moved prop took its collision with it (${hollow.length} hollow)`);
}

H('7 · IDEMPOTENT');
ok(C.evictFromBuildings()===null,'a second eviction is a no-op');

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
