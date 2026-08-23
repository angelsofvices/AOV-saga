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
// verify_harvest · v0.95.760 · chests everywhere · cacti/bushes/trees all yield

try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={_townAnchors,WOOD_CHEST_PER_DISTRICT,CHEST_MIN_FROM_TOWN,CHEST_MIN_APART,WORLD_PROPS,_propBlocked,plantKind,plantPropAt,harvestPlant,chargePlant,DISTRICT_YIELD,scatterWoodChests,markChestLooted,restoreLootedChests,snapBuildingsToLattice,buildAllTrails,worldDistrictAt,districtAt,isWorldLandTile,isWorldBorderTile,DISTRICT_WHEEL,game,player,addItems};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails(); C.scatterWoodChests();

H('1 · ★★ WOODEN CHESTS IN EVERY DISTRICT');
{
  const ch=C.WORLD_PROPS.filter(p=>p&&p._woodChest);
  ok(ch.length>=200,`${ch.length} wooden chests (the game shipped with 8)`);
  const byD={};
  for(const c of ch){const d=C.worldDistrictAt(c.tileX,c.tileY)||'(none)';byD[d]=(byD[d]||0)+1;}
  const missing=C.DISTRICT_WHEEL.filter(w=>!byD[w.dist]);
  ok(missing.length===0,`every district has chests${missing.length?' — none in: '+missing.map(w=>w.dist).join(', '):''}`);
  console.log('     '+C.DISTRICT_WHEEL.map(w=>`${w.dist}:${byD[w.dist]||0}`).join(' '));
  ok(!byD['(none)'],`none landed outside a district (${byD['(none)']||0})`);
}

H('2 · ★★ THEY REWARD LEAVING TOWN');
// v0.95.760 sampled a box around the district HUB, which put chests thickest
// exactly where the player already stands. This asserts the opposite property:
// nothing near the built-up core, and the spread skewed to the frontier.
{
  const ch=C.WORLD_PROPS.filter(p=>p&&p._woodChest&&/^chest_[a-z]+_/.test(p.id||''));
  const walk=(x,y)=>C.isWorldLandTile(x,y)&&!C.isWorldBorderTile(x,y)&&!C._propBlocked.has(`${x},${y}`);
  ok(ch.length===200,`${ch.length} scattered chests · ${C.WOOD_CHEST_PER_DISTRICT} per district`);
  const stranded=ch.filter(c=>![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>walk(c.tileX+dx,c.tileY+dy)));
  ok(stranded.length===0,`every one has a walkable tile beside it (${stranded.length} stranded)`);
  let onRoad=0;
  for(const c of ch){
    const R=(C.game._trailRoad||{})[C.worldDistrictAt(c.tileX,c.tileY)];
    if(R&&R.has(`${c.tileX},${c.tileY}`)) onRoad++;
  }
  ok(onRoad===0,`none sits on the carved roadbed (${onRoad})`);
  // ★ distance from EVERY town anchor — hub, civic buildings and homes. Houses
  // sprawl past the centre, so hub distance alone would not prove much.
  const towns={};
  for(const w of C.DISTRICT_WHEEL) towns[w.dist]=C._townAnchors(w.dist);
  const ds=ch.map(c=>{
    const t=towns[C.worldDistrictAt(c.tileX,c.tileY)]||[];
    return Math.min(...t.map(([tx,ty])=>Math.hypot(tx-c.tileX,ty-c.tileY)));
  }).sort((a,b)=>a-b);
  ok(ds[0]>=C.CHEST_MIN_FROM_TOWN,
     `closest chest is ${Math.round(ds[0])} tiles from any building (floor is ${C.CHEST_MIN_FROM_TOWN})`);
  const med=ds[Math.floor(ds.length/2)];
  ok(med>=70,`median distance from town is ${Math.round(med)} tiles — the spread is out in the wild, not on the doorstep`);
  // ★★ THE RENDER CAUGHT WHAT THE NUMBERS HID. My first weighting culled the
  // near half AND squared the bias; median distance looked great (86) but every
  // chest had been pushed into a ring around the district rim. A halo is not
  // exploration. So the assertion is no longer "how far is the median" — it is
  // that all three distance bands are populated.
  const band=(lo,hi)=>ds.filter(d=>d>=lo&&d<hi).length;
  const near=band(C.CHEST_MIN_FROM_TOWN,70), mid=band(70,100), far2=ds.filter(d=>d>=100).length;
  ok(near>=30,`${near} chests in the near band (${C.CHEST_MIN_FROM_TOWN}-70 tiles) — the blocks just past the houses`);
  ok(mid>=50,`${mid} in the middle band (70-100) — between the roads`);
  ok(far2>=10,`${far2} out on the frontier (100+)`);
  ok(near>0&&mid>0&&far2>0,'★ all three bands populated — a spread, not a ring around the rim');
  // spacing · 20 in a district must not clump
  let close=0;
  for(let i=0;i<ch.length;i++)for(let j=i+1;j<ch.length;j++){
    if(C.worldDistrictAt(ch[i].tileX,ch[i].tileY)!==C.worldDistrictAt(ch[j].tileX,ch[j].tileY))continue;
    if(Math.abs(ch[i].tileX-ch[j].tileX)+Math.abs(ch[i].tileY-ch[j].tileY)<C.CHEST_MIN_APART) close++;
  }
  ok(close===0,`no two chests in a district are closer than ${C.CHEST_MIN_APART} tiles (${close} pairs)`);
  const byD={};
  for(const c of ch){const d=C.worldDistrictAt(c.tileX,c.tileY);byD[d]=(byD[d]||0)+1;}
  ok(C.DISTRICT_WHEEL.every(w=>byD[w.dist]===C.WOOD_CHEST_PER_DISTRICT),
     `every district got exactly ${C.WOOD_CHEST_PER_DISTRICT}`);
}

H('3 · ★ PLACEMENT IS DETERMINISTIC');
// ids must be stable or a save saying "chest_veridan_31 is looted" points at a
// different chest next boot.
{
  const ids=C.WORLD_PROPS.filter(p=>p&&p._woodChest).map(p=>p.id);
  ok(new Set(ids).size===ids.length,`all ${ids.length} chest ids are unique`);
  const n=C.scatterWoodChests();
  ok(n===0,'calling scatter twice is a no-op — it cannot double up');
}

H('4 · ★★ CACTI YIELD FRUIT AND SEEDS');
{
  ok(C.plantKind({src:'assets/2D%20sprites/decor/zarvane-cactus.png'})==='tree',
     'a cactus reads as a FRUIT plant');
  const cacti=C.WORLD_PROPS.filter(p=>p&&/cactus/.test(p.src||''));
  ok(cacti.length>500,`${cacti.length} cacti in Zarvane`);
  ok(cacti.every(p=>C.plantKind(p)==='tree'),'every one of them is harvestable');
}

H('5 · EVERY BUSH AND TREE STILL YIELDS');
{
  const FL=/decor\/(?:[a-z]+\/)?[a-z0-9-]*(?:tree|cactus|bush)/;
  const fl=C.WORLD_PROPS.filter(p=>p&&p.src&&FL.test(p.src));
  const kinds={};
  for(const p of fl){const k=C.plantKind(p)||'NONE';kinds[k]=(kinds[k]||0)+1;}
  ok(!kinds.NONE,`all ${fl.length} flora props resolve to a plant kind (${kinds.NONE||0} unrecognised)`);
  console.log(`     tree/fruit: ${kinds.tree}   bush/berry: ${kinds.bush}`);
  // and grass must NOT be harvestable — it is the encounter trigger
  const g=C.WORLD_PROPS.filter(p=>p&&/grass/.test(p.src||'')&&!/bush|tree/.test(p.src));
  ok(g.length>0&&g.every(p=>C.plantKind(p)===null),`grass is not a plant to harvest (${g.length} checked)`);
}

H('6 · ★ EVERY DISTRICT HAS A YIELD TABLE');
// harvestPlant does DISTRICT_YIELD[dist].fruit — a missing district throws.
{
  const miss=C.DISTRICT_WHEEL.filter(w=>!C.DISTRICT_YIELD[w.dist]);
  ok(miss.length===0,`all 10 districts have berry/fruit values${miss.length?' — missing: '+miss.map(w=>w.dist).join(', '):''}`);
}

H('7 · ★★ A HARVEST ACTUALLY PAYS OUT');
{
  C.player.items = C.player.items || {};
  const before={fruit:C.player.items.fruit||0,berry:C.player.items.berry||0,seed:C.player.items.seed||0};
  const cactus=C.WORLD_PROPS.find(p=>p&&/cactus/.test(p.src||''));
  const r=C.harvestPlant(cactus);
  ok(r&&r.yield>0,`harvesting a cactus yields ${r&&r.yield} ${r&&r.kind}`);
  ok(r&&r.seeds>0,`and ${r&&r.seeds} seeds`);
  ok((C.player.items.fruit||0)>before.fruit,'fruit landed in the bag');
  ok((C.player.items.seed||0)>before.seed,'seeds landed in the bag');
  const again=C.harvestPlant(cactus);
  ok(again&&again.regrowing,'and it goes on a regrow cooldown rather than paying twice');
  const bush=C.WORLD_PROPS.find(p=>p&&/bush/.test(p.src||''));
  const rb=C.harvestPlant(bush);
  ok(rb&&rb.kind==='berry'&&rb.yield>0,`a bush yields ${rb&&rb.yield} berries + ${rb&&rb.seeds} seeds`);
}

H('8 · ★★ LOOTED CHESTS SURVIVE A RELOAD');
// At 8 chests a non-persistent chest was a curiosity. At 80+ it is an
// infinite coin faucet, so scaling them up forces the fix.
{
  const ch=C.WORLD_PROPS.filter(p=>p&&p._woodChest);
  const target=ch[3];
  C.player.lootedChests=[];
  C.markChestLooted(target.id);
  ok(C.player.lootedChests.includes(target.id),'looting records the chest id on the player');
  target.opened=false; target.looted=false;      // simulate a fresh world build
  const n=C.restoreLootedChests();
  ok(n>0,`restore re-opened ${n} chest(s) from the save list`);
  ok(target.opened&&target.looted,'the looted chest comes back open and empty');
  const other=ch[4];
  ok(!other.opened,'and an unlooted chest is left shut');
  C.player.lootedChests=[];
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
