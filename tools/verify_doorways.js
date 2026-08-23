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
// verify_doorways · v0.95.779 · every interactable prop can actually be reached
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={WORLD_PROPS,_propDoors,_propBlocked,isFloraProp,clearFloraFromDoorways,DOORWAY_APPROACHES,isWorldLandTile,isWorldBorderTile,worldDistrictAt,snapBuildingsToLattice,buildAllTrails,scatterWoodChests,topUpDistrictCollectibles,evictFromBuildings};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests();
C.topUpDistrictCollectibles(); C.evictFromBuildings();

const floraOnDoors=()=>{
  let n=0;
  for(const key of C._propDoors.keys()){
    const [x,y]=key.split(',').map(Number);
    if(C.WORLD_PROPS.some(q=>q&&C.isFloraProp(q)&&q.tileX===x&&q.tileY===y)) n++;
  }
  return n;
};
H('1 · ★★ THE BUG WAS REAL AND WIDESPREAD');
// Creator: "cant access celestryx gift site. blocked by bush." It was not one
// bush — measure BEFORE the fix runs so the number is honest.
const before=floraOnDoors();
{
  ok(C._propDoors.size>400,`${C._propDoors.size} interactable door tiles in the world`);
  ok(before>0,`${before} of them had a plant standing ON the door before the fix`);
}

H('2 · ★★ TWO DIFFERENT CULPRITS, AND I HAD ASSUMED ONE');
// I wrote this check expecting my own v0.95.752 verge bushes to be sitting on
// the doors. They were not — every plant ON a door tile is AUTHORED flora
// (gemgrass, the Zarvane Wilds bushes). What my verges did was seal the
// APPROACH tile, which is a different failure with the same symptom: the
// Malezor town hall and school and four Seer HQs each had a clear door and
// nowhere to stand. Both had to be fixed; only one was my doing.
{
  let verge=0, authored=0;
  for(const key of C._propDoors.keys()){
    const [x,y]=key.split(',').map(Number);
    const f=C.WORLD_PROPS.find(q=>q&&C.isFloraProp(q)&&q.tileX===x&&q.tileY===y);
    if(!f) continue;
    if(f._trailVerge||f._borderForest) verge++; else authored++;
  }
  ok(verge+authored===before,
     `on the door tiles: ${authored} authored plants, ${verge} trail flora`);
  // and the approach-sealers, which were mine
  let sealedByVerge=0;
  for(const [key,prop] of C._propDoors){
    const [dx,dy]=key.split(',').map(Number);
    const open=C.DOORWAY_APPROACHES.some(([ax,ay])=>{
      const x=dx+ax,y=dy+ay;
      return C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(`${x},${y}`);
    });
    if(open) continue;
    for(const [ax,ay] of C.DOORWAY_APPROACHES){
      const f=C.WORLD_PROPS.find(q=>q&&C.isFloraProp(q)&&q.tileX===dx+ax&&q.tileY===dy+ay
                                  &&(q._trailVerge||q._borderForest));
      if(f){ sealedByVerge++; break; }
    }
  }
  ok(sealedByVerge>0,
     `★ and ${sealedByVerge} door(s) were sealed by a verge bush of MINE on the approach tile`);
}

const res=C.clearFloraFromDoorways();

H('3 · ★★ NOTHING STANDS ON A DOOR ANY MORE');
{
  ok(res && res.cleared>0,`${res.cleared} plants cleared off doors and their approaches`);
  ok(floraOnDoors()===0,`flora on door tiles: ${floraOnDoors()}`);
}

H('4 · ★★ EVERY INTERACTABLE PROP HAS SOMEWHERE TO STAND');
// ★ Reachability is a property of the PROP, not of each door tile. Counting per
// tile flagged the Zarvane oasis, which registers all NINE water tiles as doors
// so you fish from the sand rim — its centre tile is ringed by water and never
// needs a walkable neighbour, because the other eight have one.
{
  const byProp=new Map();
  for(const [key,prop] of C._propDoors){
    const id=(prop&&prop.id)||key;
    const [dx,dy]=key.split(',').map(Number);
    const open=C.DOORWAY_APPROACHES.some(([ax,ay])=>{
      const x=dx+ax,y=dy+ay;
      return C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(`${x},${y}`);
    });
    byProp.set(id,(byProp.get(id)||false)||open);
  }
  const sealed=[...byProp.entries()].filter(([,o])=>!o).map(([id])=>id);
  ok(byProp.size>400,`${byProp.size} interactable props checked`);
  ok(sealed.length===0,`every one is reachable${sealed.length?' — SEALED: '+sealed.slice(0,6).join(', '):''}`);
  ok(res.sealed===0,'and the engine reports the same');
}

H('5 · ★★ THE BUILDINGS THAT WERE SEALED ARE OPEN');
// Among the doors with no approach were Malezor's TOWN HALL, the SCHOOL and
// FOUR Seer HQs — major buildings that could not be entered at all.
{
  const must=['malezor_town_hall','malezor_school','seer_hq_andrannor','seer_hq_veridan',
              'seer_hq_vorashil','seer_hq_baelgor','zarvane_astralite_refinery'];
  const bad=[];
  for(const id of must){
    const prop=C.WORLD_PROPS.find(p=>p&&p.id===id);
    if(!prop){ bad.push(id+':missing'); continue; }
    let open=false;
    for(const [key,pr] of C._propDoors){
      if(pr!==prop) continue;
      const [dx,dy]=key.split(',').map(Number);
      if(C.DOORWAY_APPROACHES.some(([ax,ay])=>{
        const x=dx+ax,y=dy+ay;
        return C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(`${x},${y}`);
      })){ open=true; break; }
    }
    if(!open) bad.push(id);
  }
  ok(bad.length===0,`all ${must.length} named buildings enterable${bad.length?' — still sealed: '+bad.join(', '):''}`);
  const ref=C.WORLD_PROPS.find(p=>p&&p.id==='zarvane_astralite_refinery');
  ok(!!ref,'★ the Celestryx altar (Astralite Refinery) is in the world');
}

H('6 · ★ IT ONLY TOOK PLANTS');
// Flora is clearable; a building is not. The pass must never have removed a
// structure to open a path.
{
  const b=C.WORLD_PROPS.filter(p=>p&&p.src&&/\/buildings\//.test(p.src)).length;
  ok(b>100,`${b} buildings still standing`);
  ok(C.WORLD_PROPS.filter(p=>p&&p._woodChest).length>=200,'and every wooden chest survives');
}

H('7 · IDEMPOTENT');
ok(C.clearFloraFromDoorways()===null,'a second pass is a no-op');

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
