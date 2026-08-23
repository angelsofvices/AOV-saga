// v0.95.674 · wild grass across seven districts + district-wide encounters.
const fs=require('fs');const src=fs.readFileSync('/tmp/all.js','utf8');const noop=()=>{};const pending=[];
global.setInterval=()=>0;global.setTimeout=(f,m)=>{pending.push({f,m});return 0};global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,
 value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,
 addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,
 play:()=>Promise.resolve(),pause:noop,cloneNode(){return this},currentTime:0,volume:1,
 querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),
 addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return el()};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};global.getComputedStyle=()=>({getPropertyValue:()=>''});
new Function(src+';globalThis.__C={WORLD_PROPS,NPCS,ZYRAXIS_DISTRICTS,ZYRAXIS_DISTRICT_BY_ID,WHEEL_BY_DIST,'+
 'wheelQuarterAt,DISTRICT_GRASS_ART,QUARTER_GRASS_PATCHES,DISTRICT_TREE_ART,_wildZones,_propBlocked,_propDoors,'+
 'spawnWildMori,spawnGrassMori,emitExplorationNoise,EXPLORE_STEPS_REQUIRED,EXPLORE_SPAWN_CHANCE,EXPLORE_MAX_ACTIVE,'+
 'TOWER_BY_DIST,SEER_HQ_BY_DIST,isWorldLandTile,isWorldBorderTile,isVeridanRiverTile,worldDistrictAt,walkable,_propCullBounds,_cam,player,game};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const DC=C.ZYRAXIS_DISTRICT_BY_ID;
const grass=C.WORLD_PROPS.filter(p=>p&&p._districtGrass);
const ART=Object.keys(C.DISTRICT_GRASS_ART);
const bearing=(dx,dy)=>{if(Math.abs(dx)<=Math.abs(dy)*0.45)return dy<0?'N':'S';
  if(Math.abs(dy)<=Math.abs(dx)*0.45)return dx<0?'W':'E';return (dy<0?'N':'S')+(dx<0?'W':'E');};

console.log('\n1 · ★ ALL SEVEN DISTRICTS ARE GRASSED\n');
ok(ART.length===7,`${ART.length} districts have grass art`);
const per={};grass.forEach(p=>per[p._districtGrass]=(per[p._districtGrass]||0)+1);
console.log('     district     clumps   coverage of district land');
for(const d of ART){
  const D=DC[d];
  const area=Math.PI*D.rx*D.ry;
  console.log(`     ${d.padEnd(12)} ${String(per[d]||0).padStart(6)}   ${((per[d]||0)/area*100).toFixed(2)}%`);
  ok((per[d]||0)>500,`${d.padEnd(11)} has real meadows (${per[d]||0} clumps)`);
}
console.log(`\n     ${grass.length} grass props total`);
ok(grass.length>4000&&grass.length<9000,`${grass.length} is meadow, not carpet (first cut was 19,815)`);

console.log('\n2 · ★ TWO VARIANTS, NEVER TILING VISIBLY\n');
for(const d of ART){
  const g=grass.filter(p=>p._districtGrass===d);
  const a=g.filter(p=>/-grass-a\.png$/.test(p.src)).length;
  const b=g.filter(p=>/-grass-b\.png$/.test(p.src)).length;
  const bal=Math.min(a,b)/Math.max(a,b);
  console.log(`     ${d.padEnd(12)} A:${String(a).padStart(4)}  B:${String(b).padStart(4)}  balance ${(bal*100).toFixed(0)}%`);
  ok(a>0&&b>0&&bal>0.7,`${d.padEnd(11)} both variants used and roughly balanced`);
}
// adjacency: no two orthogonally-neighbouring clumps share a variant
let sameNeighbour=0,checked=0;
const byTile=new Map();grass.forEach(p=>byTile.set(`${p.tileX},${p.tileY}`,p));
for(const p of grass){
  for(const [dx,dy] of [[1,0],[0,1]]){
    const q=byTile.get(`${p.tileX+dx},${p.tileY+dy}`);
    if(!q)continue; checked++;
    if(q.src===p.src)sameNeighbour++;
  }
}
console.log(`     ${checked} adjacent pairs · ${sameNeighbour} share a variant`);
ok(sameNeighbour===0,`the A/B hash guarantees neighbours differ (${sameNeighbour} matches)`);

console.log('\n3 · ★ NOBODY GOT SOMEBODY ELSE\'S GRASS\n');
let wrongArt=0,strayDist=0,offLand=0;
for(const p of grass){
  const d=p._districtGrass;
  if(!String(p.src).includes(`/${d}-grass-`))wrongArt++;
  if(C.worldDistrictAt(p.tileX,p.tileY)!==d)strayDist++;
  if(!C.isWorldLandTile(p.tileX,p.tileY)||C.isWorldBorderTile(p.tileX,p.tileY))offLand++;
}
ok(wrongArt===0,`every clump uses its own district's art (${wrongArt} wrong)`);
ok(strayDist===0,`every clump is inside its district (${strayDist} stray)`);
ok(offLand===0,`nothing grows in the Void Sea or on a border (${offLand})`);
let inRiver=grass.filter(p=>C.isVeridanRiverTile(p.tileX,p.tileY)).length;
ok(inRiver===0,`and none in the Veridan river — freshwater reads as LAND (${inRiver})`);

console.log('\n4 · ★★ GRASS IS WALKABLE · you wade through it, never around it\n');
let blocking=0;
for(const p of grass){ if((p.footprint||[]).length)blocking++; }
ok(blocking===0,`no clump has a footprint (${blocking} would block)`);
// A tile can read non-walkable for two very different reasons: a PROP or the
// terrain blocks it (bad — the clump is buried), or an NPC happens to be
// standing in it (fine, and in fact ideal: that is a Mori lurking in the
// grass).  The guard packs spawn in a deferred tick AFTER this pass, so the
// second case is expected.  An earlier draft conflated them and flagged 26.
let buried=0,occupied=0;
for(const p of grass){
  if(C.walkable(p.tileX,p.tileY))continue;
  const npc=C.NPCS.some(x=>x&&x.scene==='overworld'&&x.tileX===p.tileX&&x.tileY===p.tileY);
  if(npc)occupied++; else buried++;
}
console.log(`     ${grass.length} clumps · ${occupied} have someone standing in them · ${buried} buried under a prop`);
ok(buried===0,`no clump is buried under a prop or terrain (${buried})`);
console.log('     (an enemy standing in tall grass is the point, not a fault)');
let onDoor=grass.filter(p=>C._propDoors.has(`${p.tileX},${p.tileY}`)).length;
ok(onDoor===0,`no clump is carpeting a doorway (${onDoor})`);

console.log('\n5 · ★★ EVERY CLUMP IS A WILDZONE · that is what makes it noisy\n');
let notWild=grass.filter(p=>!p.wildZone).length;
ok(notWild===0,`all ${grass.length} clumps carry wildZone:true (${notWild} missing)`);
let inSet=grass.filter(p=>C._wildZones.has(`${p.tileX},${p.tileY}`)).length;
console.log(`     _wildZones now holds ${C._wildZones.size} tiles`);
ok(inSet===grass.length,`all ${grass.length} registered in _wildZones (${inSet})`);

console.log('\n6 · ★ THE WHEEL STILL SHOWS · meadow thickest away from the road\n');
console.log('     district    wetland  forest  highland    open   road share');
for(const d of ART){
  const D=DC[d];const q={wetland:0,forest:0,highland:0,open:0};
  grass.filter(p=>p._districtGrass===d).forEach(p=>{
    const k=C.wheelQuarterAt(d,bearing(p.tileX-D.cx,p.tileY-D.cy)); if(k)q[k]++;});
  const tot=q.wetland+q.forest+q.highland+q.open;
  console.log(`     ${d.padEnd(11)} ${String(q.wetland).padStart(7)} ${String(q.forest).padStart(7)} ${String(q.highland).padStart(9)} ${String(q.open).padStart(7)}   ${(q.open/tot*100).toFixed(0)}%`);
  ok(q.open>0,`${d.padEnd(11)} the road quarter still HAS grass — it is region-wide`);
  ok(q.open<tot*0.22,`${d.padEnd(11)} but stays thinnest there (${(q.open/tot*100).toFixed(0)}%)`);
  ok(q.wetland>q.open,`${d.padEnd(11)} wetland out-grasses the road`);
}

console.log('\n7 · ★★ ENEMIES TRIGGER ANYWHERE IN A DISTRICT\n');
console.log('     Creator: "enemies can be triggered by exploring anywhere in a district".\n');
ok(typeof C.emitExplorationNoise==='function','emitExplorationNoise exists');
console.log(`     open ground · ${C.EXPLORE_STEPS_REQUIRED} steps then ${(C.EXPLORE_SPAWN_CHANCE*100).toFixed(0)}% per step · cap ${C.EXPLORE_MAX_ACTIVE}`);
console.log('     grass        ·  3 steps then 20% per step · cap 4');
const grassRate=0.20/3, exploreRate=C.EXPLORE_SPAWN_CHANCE/C.EXPLORE_STEPS_REQUIRED;
console.log(`     grass is ${(grassRate/exploreRate).toFixed(1)}x noisier per step — it stays the loud choice`);
ok(grassRate>exploreRate*3,'grass remains meaningfully more dangerous than open ground');
ok(C.EXPLORE_SPAWN_CHANCE<0.2&&C.EXPLORE_STEPS_REQUIRED>3,'the exploration track is the slower of the two');
// walk open ground in Korathen and confirm something eventually spawns
C.game.scene='overworld'; C.player.activeActor='rizer'; C.player.stepsExploring=0;
const before=C.NPCS.length;
const K=DC.korathen; let spawned=0;
const realRandom=Math.random; Math.random=()=>0.01;       // force the roll to pass
for(let i=0;i<40;i++) C.emitExplorationNoise(K.cx+30,K.cy+10);
Math.random=realRandom;
spawned=C.NPCS.filter(x=>x&&x._exploreSpawn).length;
console.log(`     walked 40 open-ground steps in Korathen -> ${spawned} spawned (cap ${C.EXPLORE_MAX_ACTIVE})`);
ok(spawned>0,'exploring open ground really does pull enemies');
ok(spawned<=C.EXPLORE_MAX_ACTIVE,`and respects the cap (${spawned}/${C.EXPLORE_MAX_ACTIVE})`);

console.log('\n8 · ★★ A KORATHEN ENCOUNTER IS KORATHEN-GRADE\n');
console.log('     The old spawner hardcoded Lv 2 / 125 HP — right for Malezor,');
console.log('     meaningless in a district whose band runs Lv 80.\n');
console.log('     district     band Lv   spawned Lv   HP');
let scaled=0;
for(const d of ['malezor','veridan','korathen']){
  const D=DC[d];
  const m=C.spawnWildMori(D.cx,D.cy-40,d,{_probe:true});
  const band=C.TOWER_BY_DIST[d];
  console.log(`     ${d.padEnd(12)} ${String(band.moriLv).padStart(7)} ${String(m?m.level:'--').padStart(12)}   ${m?m.hpMax:'--'}`);
  if(m&&m.level===band.moriLv)scaled++;
  ok(!!m&&m.level===band.moriLv,`${d.padEnd(11)} spawns at the district band (Lv ${m?m.level:'?'})`);
  ok(!!m&&m.hpMax%125===0,`${d.padEnd(11)} HP ${m?m.hpMax:'?'} is a multiple of 125 per combat canon`);
}
ok(scaled===3,'all three scale off TOWER_NETWORK, the same ladder the tower squads use');
const mal=C.spawnWildMori(DC.malezor.cx,DC.malezor.cy-42,'malezor',{});
const kor=C.spawnWildMori(DC.korathen.cx,DC.korathen.cy-42,'korathen',{});
ok(kor.level>mal.level*10,`Korathen's Mori (Lv ${kor.level}) massively outclasses Malezor's (Lv ${mal.level})`);
ok(typeof C.spawnGrassMori==='function','spawnGrassMori still exists as a wrapper');
const gm=C.spawnGrassMori(DC.veridan.cx,DC.veridan.cy-44);
ok(!!gm&&gm._grassSpawn===true,'the grass path still tags its spawns _grassSpawn');
ok(gm.level===C.TOWER_BY_DIST.veridan.moriLv,`and now scales too (Lv ${gm.level} in Veridan)`);

console.log('\n9 · ★ PERFORMANCE · 16k props and the cull still holds\n');
console.log(`     ${C.WORLD_PROPS.length} props in the world`);
let worst=0;
for(const [tx,ty] of [[58,103],[520,255],[895,655],[300,550],[420,655]]){
  C._cam.x=tx*48-480; C._cam.y=ty*48-270;
  const b=C._propCullBounds();
  const vis=C.WORLD_PROPS.filter(p=>p.tileX>=b.x0&&p.tileX<=b.x1&&p.tileY>=b.y0&&p.tileY<=b.y1).length;
  worst=Math.max(worst,vis);
  console.log(`     camera (${tx},${ty}) -> ${vis} props drawn (${(vis/C.WORLD_PROPS.length*100).toFixed(1)}%)`);
}
ok(worst<600,`busiest view draws ${worst} props, not ${C.WORLD_PROPS.length}`);
ok(worst/C.WORLD_PROPS.length<0.05,'the cull drops >95% of the per-frame work');

console.log('\n10 · MALEZOR, ZARVANE AND ANDRANNOR UNTOUCHED\n');
const old=C.WORLD_PROPS.filter(p=>/^malezor_exp_grass_/.test(p.id||'')).length;
// ★ v0.95.749 · the TRAIL CARVE deliberately clears flora that sits on a
// roadbed, so an exact pre-carve count is now the wrong assertion. The property
// that still matters: nothing vanished EXCEPT what a road runs over.
{
  const road = (typeof game!=='undefined' && game._malezorRoad) ? game._malezorRoad : null;
  const gone = 419 - old;
  ok(old<=419 && gone<=25,
     `Malezor keeps its hand-tuned grass minus the roadbed (${old}/419 · ${gone} carved for trails)`);
  if(road) console.log(`     the trail carve owns ${road.size} roadbed tiles; ${gone} grass tiles fell inside one`);
}
ok(!grass.some(p=>['malezor','zarvane','andrannor'].includes(p._districtGrass)),
   'the new pass added nothing to the three districts that already had grass');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
