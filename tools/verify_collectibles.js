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
// verify_collectibles · v0.95.762 · fae + life/astralite stones in all ten districts

try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={BOULDERS,_fae,WORLD_PROPS,_propBlocked,FAE_RESPAWN_MS,COLLECTIBLE_TARGET,COLLECT_MIN_APART,topUpDistrictCollectibles,snapBuildingsToLattice,buildAllTrails,scatterWoodChests,worldDistrictAt,isWorldLandTile,isWorldBorderTile,boulderAt,DISTRICT_WHEEL,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests(); C.topUpDistrictCollectibles();

const per=d=>({
  fae:C._fae.filter(f=>C.worldDistrictAt(f.x,f.y)===d),
  life:C.BOULDERS.filter(b=>b.type==='life'&&C.worldDistrictAt(b.tileX,b.tileY)===d),
  astralite:C.BOULDERS.filter(b=>b.type==='astralite'&&C.worldDistrictAt(b.tileX,b.tileY)===d),
});

H('1 · ★★ EVERY DISTRICT HITS THE TARGET');
// Before this, SEVEN districts had zero fae, zero life stones and zero
// astralite — no faedust for the stamina meter, nothing for Nurse Rein.
{
  const T=C.COLLECTIBLE_TARGET;
  let short=[];
  for(const w of C.DISTRICT_WHEEL){
    const p=per(w.dist);
    for(const k of ['fae','life','astralite'])
      if(p[k].length<T[k]) short.push(`${w.dist}:${k}=${p[k].length}/${T[k]}`);
  }
  ok(short.length===0,`all 10 districts have >= ${T.fae} fae / ${T.life} life / ${T.astralite} astralite${short.length?' — short: '+short.join(' '):''}`);
  const tot=C.DISTRICT_WHEEL.reduce((a,w)=>{const p=per(w.dist);
    return {f:a.f+p.fae.length,l:a.l+p.life.length,a:a.a+p.astralite.length};},{f:0,l:0,a:0});
  ok(tot.l===100,`exactly 100 life stones worldwide (${tot.l})`);
  ok(tot.f>=400&&tot.a>=150,`${tot.f} fae · ${tot.a} astralite`);
  // Malezor keeps its curated surplus — it is the starting district
  ok(per('malezor').fae.length>40,`Malezor keeps its hand-placed surplus (${per('malezor').fae.length} fae) rather than being trimmed to target`);
}

H('2 · ★ FAE RESPAWN IN 120 SECONDS');
ok(C.FAE_RESPAWN_MS===120000,`FAE_RESPAWN_MS is ${C.FAE_RESPAWN_MS/1000}s`);

H('3 · ★★ NOTHING IS BURIED OR STACKED');
// My own passes caused this: trail flora (v0.95.752) and the lattice snap
// (v0.95.753) were laid on top of collectibles that had been there all along,
// and v0.95.759 made every bit of it solid.
{
  const buried=[...C._fae.filter(f=>C._propBlocked.has(`${f.x},${f.y}`)),
                ...C.BOULDERS.filter(b=>C._propBlocked.has(`${b.tileX},${b.tileY}`))];
  ok(C._fae.length+C.BOULDERS.length>700,`${C._fae.length+C.BOULDERS.length} collectibles to check`);
  ok(buried.length===0,`none sits inside a solid prop (${buried.length})`);
  const keys=[...C._fae.map(f=>`${f.x},${f.y}`),...C.BOULDERS.map(b=>`${b.tileX},${b.tileY}`)];
  ok(keys.length===new Set(keys).size,`no two share a tile (${keys.length-new Set(keys).size} collisions)`);
}

H('4 · ★ EVERY ONE CAN BE REACHED');
{
  const walk=(x,y)=>C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(`${x},${y}`);
  const stranded=[...C._fae.map(f=>[f.x,f.y]),...C.BOULDERS.map(b=>[b.tileX,b.tileY])]
    .filter(([x,y])=>![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>walk(x+dx,y+dy)));
  ok(stranded.length===0,`every collectible has a walkable tile beside it (${stranded.length} stranded)`);
}

H('5 · THE FLORA CLEARED OFF THEM IS REALLY GONE');
// Unburying removes the offending bush from WORLD_PROPS AND from _propBlocked.
// Leaving the collision behind would be an invisible wall.
{
  const ghosts=C.WORLD_PROPS.filter(p=>p&&p._hidden&&(p._trailVerge||p._borderForest)
    &&(p.footprint||[]).some(([dx,dy])=>C._propBlocked.has(`${p.tileX+dx},${p.tileY+dy}`)));
  ok(ghosts.length===0,`no cleared bush left an invisible wall behind (${ghosts.length})`);
}

H('6 · SPACING HOLDS');
{
  for(const w of C.DISTRICT_WHEEL){
    const p=per(w.dist);
    for(const k of ['life','astralite']){
      const g=C.COLLECT_MIN_APART[k];
      const arr=p[k].map(b=>[b.tileX,b.tileY]);
      let close=0;
      for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++)
        if(Math.abs(arr[i][0]-arr[j][0])+Math.abs(arr[i][1]-arr[j][1])<g) close++;
      if(close>3){ ok(false,`${w.dist} ${k}: ${close} pairs closer than ${g} tiles`); return; }
    }
  }
  ok(true,'life and astralite stones stay spread within every district');
}

H('7 · IDEMPOTENT');
ok(C.topUpDistrictCollectibles()===null,'a second top-up is a no-op — counts cannot drift on re-entry');

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
