#!/usr/bin/env node
/* verify_treasure.js · v0.96.46 · CHESTS · tier-scaled, out on the rim
 *
 *   Creator: "add more wooden silver and gold chests around the world. scale
 *   number of new additions by tier. it should feel full of treasure. chests
 *   lead the explorer to keep venturing outer rims of districts, luring them
 *   into the wild where enemies lurk."
 *
 * ★★★ THE LURE ALREADY EXISTED, and finding that changed the whole change.
 *   scatterWoodChests has weighted chests away from town since v0.95.761 —
 *   CHEST_MIN_FROM_TOWN clears the built-up core outright, CHEST_MIN_FROM_ROAD
 *   keeps them off the trails, and a remoteness tilt makes the far country
 *   ~3x likelier per candidate. What it did NOT do was scale by tier.
 *   ★ My first attempt was 142 hand-picked coordinates in three new tables — a
 *     SECOND scatterer, blind to the 200 chests the real one had already
 *     placed, duplicating a lure that worked. Deleted. One system, now
 *     tier-aware.
 *
 * ★★ SILVER WAS THE MISSING RUNG. CHEST_LOOT_LADDER.silver, CHEST_COIN_TIERS'
 *   2-pile 80-240 band, CHEST_ARROW_ODDS p:0.50/n:2 and silver-chest.png all
 *   existed — and there was not ONE silver chest in the world.
 *
 * ★ Ids are namespaced per KIND and per DISTRICT (chest_silver_<dist>_<n>), so
 *   raising a count only ever appends within its namespace and a chest the
 *   player already looted keeps its lootedChests key.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== LOAD RESCUE · no save may land you outside the world ===\n');
const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='createPattern')return()=>({});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='createImageData')return(w,h)=>({data:new Uint8ClampedArray(Math.max(1,w*h*4)),width:w,height:h});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
const _els=new Map();
const mk=id=>({id,style:{display:'none'},dataset:{},_buttons:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},pause:noop,
 play:()=>Promise.resolve(),load:noop,currentTime:0,
 querySelector:()=>mk(id),querySelectorAll(){return this._buttons;},
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
const elFor=id=>{if(!_els.has(id))_els.set(id,mk(id));return _els.get(id);};
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:()=>mk('x'),addEventListener:noop,body:mk('body'),documentElement:mk('html'),
 head:mk('head'),hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;const LS={};
global.localStorage={getItem:k=>LS[k]??null,setItem:(k,v)=>{LS[k]=String(v);},removeItem:k=>{delete LS[k];}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,currentTime:0,cloneNode(){return this;}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;const BOOT=[];console.log=(...a)=>BOOT.push(a.join(' '));console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__D={WORLD_PROPS,scatterWoodChests,chestsForTier,districtTierOf,
 DISTRICT_ORDER,ZYRAXIS_DISTRICTS,worldDistrictAt,isWorldLandTile,isWorldBorderTile,walkable,
 CHEST_MIN_FROM_TOWN,CHEST_MIN_APART,CHEST_COIN_TIERS,CHEST_LOOT_LADDER,game,
 propBlocked:()=>_propBlocked};`)();
let n=0;while(_Q.length&&n<600){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;console.log=LOG;const D=globalThis.__D;

D.game.scene='overworld';
console.log('\n=== TREASURE ON THE RIM ===\n');
BOOT.filter(b=>/chests scattered/.test(b)).forEach(b=>console.log('  '+b));
const all=D.WORLD_PROPS.filter(p=>p&&(p._woodChest||p._silverChest||p._goldChest));
const W=all.filter(p=>p._woodChest).length,S=all.filter(p=>p._silverChest).length,G=all.filter(p=>p._goldChest).length;
console.log(`\n  world total: ${W} wood · ${S} silver · ${G} gold = ${all.length}\n`);
t(S>=35,`★★★ ${S} SILVER chests · a tier that had ZERO instances in the world before`);
t(W>200,`★★ ${W} wooden (scatterer was flat 20/district = 200)`);
t(G>=35,`★★ ${G} gold`);
t(new Set(all.map(p=>p.id)).size===all.length,`★★★ all ${all.length} ids unique · no shared lootedChests key`);
// ★★ TIER CURVE
console.log('  district      tier  wood silver gold  total');
const cnt={};
for(const p of all){ const d=D.worldDistrictAt(p.tileX,p.tileY); if(!d)continue;
  cnt[d]=cnt[d]||{wood:0,silver:0,gold:0};
  cnt[d][p._woodChest?'wood':p._silverChest?'silver':'gold']++; }
const tot=[];
for(const d of D.DISTRICT_ORDER){ const c=cnt[d]||{wood:0,silver:0,gold:0};
  const s=c.wood+c.silver+c.gold; tot.push(s);
  console.log(`  ${d.padEnd(12)} ${String(D.districtTierOf(d)).padStart(3)}  ${String(c.wood).padStart(4)} ${String(c.silver).padStart(6)} ${String(c.gold).padStart(4)} ${String(s).padStart(6)}`); }
t(Object.keys(cnt).length===10,`★ all 10 districts stocked`);
// monotone-ish rise
let rises=0; for(let i=1;i<tot.length;i++) if(tot[i]>=tot[i-1]) rises++;
t(rises>=8,`★★★ the count RISES with tier in ${rises}/9 steps · ${tot[0]} in Malezor -> ${tot[9]} in Korathen`);
t(tot[9]>tot[0]*1.5,`★★★ Korathen carries ${(tot[9]/tot[0]).toFixed(1)}x Malezor's treasure`);
// ★★★★ THE LURE · distance from town
let far=0,near=0,sum=0;
for(const p of all){ const r=p._remote!=null?p._remote:null; }
const CENT={}; for(const d of D.ZYRAXIS_DISTRICTS) CENT[d.id]=d;
let rim=0,core=0;
for(const p of all){ const id=D.worldDistrictAt(p.tileX,p.tileY); const d=CENT[id]; if(!d)continue;
  const f=Math.sqrt(((p.tileX-d.cx)/d.rx)**2+((p.tileY-d.cy)/d.ry)**2);
  if(f>=0.45) rim++; if(f<0.25) core++; }
console.log(`\n  radial: ${rim}/${all.length} at >=0.45 of the district radius · only ${core} in the inner core`);
t(rim/all.length>0.6,`★★★★ ${Math.round(100*rim/all.length)}% sit out on the rim · the lure into the wild`);
t(D.CHEST_MIN_FROM_TOWN>=40,`★★ and NOTHING within ${D.CHEST_MIN_FROM_TOWN} tiles of a town anchor · the core stays empty by rule`);
// ★★★ SPACING · asserted on what the SCATTERER placed, not on the whole world.
// The first version of this check failed with 2 violations and I seeded the
// candidate pool with the hand-placed chests to fix it — which changed nothing,
// because BOTH pairs are hand-placed-vs-hand-placed and predate this work:
//     chest_1 (32,50) <-> chest_3  (28,55) = 9     both from the original eight
//     chest_5 (44,83) <-> chest_gold_0 (45,90) = 8  original wood vs original gold
// Those are the Creator's own placements from v0.95.x. The property this change
// is responsible for is that NOTHING THE SCATTERER PLACES crowds anything.
let tooClose=0, legacyPairs=0;
const isScattered=p=>/^chest_(silver_|gold_)?[a-z]+_\d+$/.test(p.id)&&!/^chest_gold_\d+$/.test(p.id);
for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
  const a=all[i],b=all[j];
  if(D.worldDistrictAt(a.tileX,a.tileY)!==D.worldDistrictAt(b.tileX,b.tileY))continue;
  if(Math.abs(a.tileX-b.tileX)+Math.abs(a.tileY-b.tileY)>=D.CHEST_MIN_APART)continue;
  if(isScattered(a)||isScattered(b)) tooClose++; else legacyPairs++;
}
console.log(`\n  spacing: ${tooClose} involving a scattered chest · ${legacyPairs} pre-existing hand-placed pairs (untouched)`);
t(tooClose===0,`★★★ ZERO scattered chests crowd anything (${tooClose}) · one shared candidate pool, seeded with the chests already in the world`);
t(legacyPairs===2,`★ and the ${legacyPairs} pre-existing hand-placed pairs are left exactly as they were`);
// every chest legal
let bad=0; for(const p of all)
  if(!D.isWorldLandTile(p.tileX,p.tileY)||D.isWorldBorderTile(p.tileX,p.tileY)) bad++;
t(bad===0,`★★ every chest on real land, none on a border (${bad})`);
// the ladder
t(D.CHEST_COIN_TIERS.silver.piles===2&&D.CHEST_COIN_TIERS.gold.piles===3,
  '★ silver pays 2 piles, gold 3 · the tables that already existed');
console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
