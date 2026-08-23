// v0.95.672 · district flora pass · trees + bushes placed by DISTRICT_WHEEL.
const fs=require('fs');const src=fs.readFileSync('/tmp/all.js','utf8');const noop=()=>{};const pending=[];
global.setInterval=()=>0;global.setTimeout=(f,m)=>{pending.push({f,m});return 0};global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,
 value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,
 addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,
 play:()=>Promise.resolve(),pause:noop,
 querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),
 addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global;
global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};global.getComputedStyle=()=>({getPropertyValue:()=>''});
new Function(src+';globalThis.__C={WORLD_PROPS,NPCS,ZYRAXIS_DISTRICTS,DISTRICT_WHEEL,WHEEL_BY_DIST,WHEEL_QUARTERS,'+
 'wheelQuarterAt,DISTRICT_TREE_ART,DISTRICT_BUSH_ART,QUARTER_GROVES,SEER_HQ_BY_DIST,TOWER_BY_DIST,'+
 '_propDoors,_propBlocked,isWorldLandTile,isWorldBorderTile,isVeridanRiverTile,worldDistrictAt,walkable,_propCullBounds,_cam,_CULL_MARGIN,game};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const DC=Object.fromEntries(C.ZYRAXIS_DISTRICTS.map(d=>[d.id,d]));
const flora=C.WORLD_PROPS.filter(p=>p&&(p._districtTree||p._districtBush));
const trees=flora.filter(p=>p._districtTree), bushes=flora.filter(p=>p._districtBush);
const bearing=(dx,dy)=>{if(Math.abs(dx)<=Math.abs(dy)*0.45)return dy<0?'N':'S';
  if(Math.abs(dy)<=Math.abs(dx)*0.45)return dx<0?'W':'E';return (dy<0?'N':'S')+(dx<0?'W':'E');};
const ART=Object.keys(C.DISTRICT_TREE_ART);

console.log('\n1 · ★ EVERY DISTRICT WITH ART GOT FLORA\n');
console.log(`     ${ART.length} districts have a tree · ${Object.keys(C.DISTRICT_BUSH_ART).length} have a bush`);
ok(Object.keys(C.DISTRICT_BUSH_ART).length===ART.length,'every tree has a matching bush — no district gets half a plant community');
const perT={},perB={};
trees.forEach(p=>perT[p._districtTree]=(perT[p._districtTree]||0)+1);
bushes.forEach(p=>perB[p._districtBush]=(perB[p._districtBush]||0)+1);
console.log('\n     district    trees  bushes   total  dominant');
for(const d of ART){
  const w=C.WHEEL_BY_DIST[d];
  console.log(`     ${d.padEnd(11)} ${String(perT[d]||0).padStart(5)} ${String(perB[d]||0).padStart(7)} ${String((perT[d]||0)+(perB[d]||0)).padStart(7)}  ${w.dominant}`);
  ok((perT[d]||0)>150,`${d.padEnd(11)} has a real forest, not a token one (${perT[d]||0} trees)`);
  ok((perB[d]||0)>200,`${d.padEnd(11)} has understory (${perB[d]||0} bushes)`);
}
console.log(`\n     ${trees.length} trees + ${bushes.length} bushes = ${flora.length} props`);

console.log('\n2 · ★ NOBODY GOT SOMEBODY ELSE\'S TREE\n');
let wrongArt=0;
for(const p of flora){
  const d=p._districtTree||p._districtBush;
  const want=p._districtTree?C.DISTRICT_TREE_ART[d].file:C.DISTRICT_BUSH_ART[d].file;
  if(!String(p.src).endsWith(want))wrongArt++;
}
ok(wrongArt===0,`all ${flora.length} props use their own district's art (${wrongArt} wrong)`);
let strayDist=0;
for(const p of flora){
  const d=p._districtTree||p._districtBush;
  if(C.worldDistrictAt(p.tileX,p.tileY)!==d)strayDist++;
}
ok(strayDist===0,`and every one stands inside the district it belongs to (${strayDist} stray)`);
let offLand=flora.filter(p=>!C.isWorldLandTile(p.tileX,p.tileY)).length;
ok(offLand===0,`nothing is growing in the Void Sea (${offLand})`);
let onBorder=flora.filter(p=>C.isWorldBorderTile(p.tileX,p.tileY)).length;
ok(onBorder===0,`nothing planted on a district border tile (${onBorder})`);
// v0.95.674 · isWorldLandTile() is TRUE for the Veridan river, because
// freshwater is terrain rather than Void Sea.  This section originally tested
// only land and borders, and so cheerfully passed 43 trees and 41 bushes
// growing out of the water.
let inRiver=flora.filter(p=>C.isVeridanRiverTile(p.tileX,p.tileY)).length;
ok(inRiver===0,`nothing is growing in the Veridan river (${inRiver}) — v0.95.672 had 84`);

console.log('\n3 · ★★ THE WHEEL IS VISIBLE FROM THE GROUND\n');
console.log('     This is the whole point.  If flora does not concentrate in each');
console.log('     district\'s FOREST quarter, the rotation is just a table.\n');
console.log('     district    forest  wetland  highland    open   forest share');
let forestWins=0;
for(const d of ART){
  const D=DC[d]; const q={forest:0,wetland:0,highland:0,open:0};
  for(const p of flora){
    if((p._districtTree||p._districtBush)!==d)continue;
    const b=bearing(p.tileX-D.cx,p.tileY-D.cy);
    const k=C.wheelQuarterAt(d,b); if(k)q[k]++;
  }
  const tot=q.forest+q.wetland+q.highland+q.open;
  const share=tot?Math.round(q.forest/tot*100):0;
  const dom=C.WHEEL_BY_DIST[d].dominant;
  const top=Object.entries(q).sort((a,b)=>b[1]-a[1])[0][0];
  console.log(`     ${d.padEnd(11)} ${String(q.forest).padStart(6)} ${String(q.wetland).padStart(8)} ${String(q.highland).padStart(9)} ${String(q.open).padStart(7)}   ${share}%   (densest: ${top})`);
  if(q.forest>q.open)forestWins++;
  ok(q.forest>q.open*1.5,`${d.padEnd(11)} forest quarter beats the road quarter ${q.forest} vs ${q.open}`);
  ok(q.open<tot*0.20,`${d.padEnd(11)} the road quarter stays open (${Math.round(q.open/tot*100)}% of its flora)`);
}
ok(forestWins===ART.length,`all ${ART.length} districts are densest away from the road`);

console.log('\n4 · ★ THE DOMINANT QUARTER IS ACTUALLY BIGGER\n');
for(const d of ART){
  const D=DC[d]; const w=C.WHEEL_BY_DIST[d]; const q={forest:0,wetland:0,highland:0,open:0};
  for(const p of flora){
    if((p._districtTree||p._districtBush)!==d)continue;
    const k=C.wheelQuarterAt(d,bearing(p.tileX-D.cx,p.tileY-D.cy)); if(k)q[k]++;
  }
  // compare against the same quarter's baseline in districts where it is NOT dominant
  const others=ART.filter(o=>C.WHEEL_BY_DIST[o].dominant!==w.dominant);
  let base=0,cnt=0;
  for(const o of others){
    const O=DC[o]; let c=0;
    for(const p of flora){ if((p._districtTree||p._districtBush)!==o)continue;
      if(C.wheelQuarterAt(o,bearing(p.tileX-O.cx,p.tileY-O.cy))===w.dominant)c++; }
    base+=c;cnt++;
  }
  base=cnt?Math.round(base/cnt):0;
  const got=q[w.dominant];
  console.log(`     ${d.padEnd(11)} dominant=${w.dominant.padEnd(9)} ${String(got).padStart(4)} vs ${String(base).padStart(4)} baseline elsewhere`);
  ok(got>=base,`${d.padEnd(11)} over-expresses its ${w.dominant}`);
}

console.log('\n5 · ★ NOTHING BLOCKS A DOOR, A PLAZA OR A ROAD\n');
let onDoor=0;
for(const p of flora){ if(C._propDoors.has(`${p.tileX},${p.tileY}`))onDoor++; }
ok(onDoor===0,`no plant is standing on a building door (${onDoor})`);
// building footprints
const fset=new Set();
for(const p of C.WORLD_PROPS){
  if(p._districtTree||p._districtBush)continue;
  for(const [dx,dy] of p.footprint||[])fset.add(`${p.tileX+dx},${p.tileY+dy}`);
}
let inBuilding=flora.filter(p=>fset.has(`${p.tileX},${p.tileY}`)).length;
ok(inBuilding===0,`nothing grew inside a building (${inBuilding})`);
let nearHQ=0,nearTower=0,nearHall=0;
const halls=C.WORLD_PROPS.filter(p=>/_town_hall$/.test(p.id||''));
for(const p of flora){
  const d=p._districtTree||p._districtBush;
  const H=C.SEER_HQ_BY_DIST[d], T=C.TOWER_BY_DIST[d];
  if(H&&Math.hypot(p.tileX-H.door[0],p.tileY-H.door[1])<9)nearHQ++;
  if(T&&Math.hypot(p.tileX-T.tower[0],p.tileY-T.tower[1])<9)nearTower++;
  for(const h of halls){ if(Math.hypot(p.tileX-h.tileX,p.tileY-h.tileY)<11){nearHall++;break;} }
}
ok(nearHQ===0,`the Seer HQ approach is clear (${nearHQ} plants inside 9 tiles)`);
ok(nearTower===0,`the radio tower plaza is clear (${nearTower})`);
ok(nearHall===0,`every capital plaza is clear (${nearHall})`);
let dup=0;const seen=new Set();
for(const p of flora){const k=`${p.tileX},${p.tileY}`;if(seen.has(k))dup++;seen.add(k);}
ok(dup===0,`no two plants share a tile (${dup})`);

console.log('\n6 · ★ THE WORLD IS STILL WALKABLE\n');
for(const d of ART){
  const D=DC[d];
  let land=0,blocked=0;
  for(let y=D.cy-D.ry;y<=D.cy+D.ry;y+=2)for(let x=D.cx-D.rx;x<=D.cx+D.rx;x+=2){
    if(C.worldDistrictAt(x,y)!==d||!C.isWorldLandTile(x,y))continue;
    land++; if(!C.walkable(x,y))blocked++;
  }
  const pct=land?(blocked/land*100):0;
  console.log(`     ${d.padEnd(11)} ${String(blocked).padStart(5)} blocked of ${String(land).padStart(6)} sampled land tiles · ${pct.toFixed(1)}%`);
  ok(pct<12,`${d.padEnd(11)} is scenery, not a maze (${pct.toFixed(1)}% blocked)`);
}

console.log('\n7 · ★★ THE VIEWPORT CULL · this pass needed it\n');
console.log(`     ${C.WORLD_PROPS.length} props now exist.  drawWorldLayer used to push EVERY one`);
console.log('     into an array and sort it, 60 times a second.\n');
ok(typeof C._propCullBounds==='function','_propCullBounds exists');
const samples=[[58,103],[520,255],[895,655],[300,550]];
let worst=0;
for(const [tx,ty] of samples){
  C._cam.x=tx*48-480; C._cam.y=ty*48-270;
  const b=C._propCullBounds();
  const vis=C.WORLD_PROPS.filter(p=>p.tileX>=b.x0&&p.tileX<=b.x1&&p.tileY>=b.y0&&p.tileY<=b.y1).length;
  worst=Math.max(worst,vis);
  console.log(`     camera at (${tx},${ty})  ->  ${vis} props survive the cull  (${(vis/C.WORLD_PROPS.length*100).toFixed(1)}%)`);
}
ok(worst<C.WORLD_PROPS.length*0.15,`the busiest view still drops >85% of the work (worst ${worst})`);
ok(C._CULL_MARGIN>=13,`margin ${C._CULL_MARGIN} exceeds the tallest prop (12 tiles) so nothing pops in`);

console.log('\n8 · MALEZOR WAS NOT TOUCHED\n');
const mal=C.WORLD_PROPS.filter(p=>/^malezor_exp_tree_/.test(p.id||'')).length;
const malBush=C.WORLD_PROPS.filter(p=>/^malezor_exp_bush_/.test(p.id||'')).length;
console.log(`     ${mal} hand-tuned Malezor trees and ${malBush} bushes from v0.84 still stand`);
// Baseline measured by evaluating the PREVIOUS commit's script and counting
// the same ids: 130 trees / 235 bushes / 419 grass.  An earlier draft asserted
// >150 trees, taken from an ad-hoc probe that matched any id CONTAINING
// "tree" (treehouse and the NW-branch trees included) — the assertion was
// wrong, not the data.
const malGrass=C.WORLD_PROPS.filter(p=>/^malezor_exp_grass_/.test(p.id||'')).length;
console.log(`     grass ${malGrass}`);
ok(mal<=130 && malBush<=235 && malGrass<=419
   && (130-mal)+(235-malBush)+(419-malGrass) <= 40,
   `v0.84 counts minus the trail carve: ${mal}/${malBush}/${malGrass} of 130/235/419 ` +
   `(${(130-mal)+(235-malBush)+(419-malGrass)} props cleared to open the roads)`)
ok(flora.every(p=>(p._districtTree||p._districtBush)!=='malezor'),'the new pass added nothing to Malezor');
console.log('     (Zarvane and Andrannor have no tree art yet, so they were skipped');
console.log('      rather than being handed another district\'s canopy)');
ok(!ART.includes('zarvane')&&!ART.includes('andrannor'),'Zarvane and Andrannor correctly absent from the art table');

console.log('\n9 · DETERMINISTIC · the same world every launch\n');
const sig=trees.slice(0,40).map(p=>`${p.tileX},${p.tileY}`).join('|');
console.log(`     first 40 tree tiles hash to ${require('crypto').createHash('md5').update(sig).digest('hex').slice(0,16)}`);
ok(/_makeWorldRng\(0x7EE0000/.test(src),'the scatter uses a seeded RNG, not Math.random');
ok(!/Math\.random\(\)/.test(src.slice(src.indexOf('plantDistrictTrees'),src.indexOf('plantDistrictTrees')+6000)),
   'no Math.random anywhere in the planting pass');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
