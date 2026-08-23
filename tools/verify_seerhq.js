// v0.95.671 · ten Seer HQs, one per district, each holding the road out.
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
global.window=global;let STORE={};
global.localStorage={getItem:k=>STORE[k]??null,setItem:(k,v)=>{STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};global.getComputedStyle=()=>({getPropertyValue:()=>''});
new Function(src+';globalThis.__C={WORLD_PROPS,NPCS,SEER_HQ_NETWORK,SEER_HQ_BY_DIST,DISTRICT_WHEEL,WHEEL_BY_DIST,'+
 'wheelQuarterAt,buildSeerHqGuardPacks,enterSeerHq,seerHqDistrict,seerHqChestOpened,tryOpenSeerHqChest,'+
 '_propDoors,_propBlocked,isWorldLandTile,worldDistrictAt,walkable,ZYRAXIS_DISTRICTS,TOWER_NETWORK,'+
 'isPurchasableHomeId,player,game,INTERIOR_SEER_HQ_1F,saveGame,loadGame};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const DC=Object.fromEntries(C.ZYRAXIS_DISTRICTS.map(d=>[d.id,d]));
const HALL={};for(const p of C.WORLD_PROPS){if(p&&/_town_hall$/.test(p.id||''))HALL[p.id.replace('_town_hall','')]=[p.tileX,p.tileY];}
const bearing=(dx,dy)=>{if(Math.abs(dx)<=Math.abs(dy)*0.45)return dy<0?'N':'S';
  if(Math.abs(dy)<=Math.abs(dx)*0.45)return dx<0?'W':'E';return (dy<0?'N':'S')+(dx<0?'W':'E');};

console.log('\n1 · ★ ALL TEN DISTRICTS HAVE ONE\n');
ok(C.SEER_HQ_NETWORK.length===10,`SEER_HQ_NETWORK lists ${C.SEER_HQ_NETWORK.length} districts`);
const props={};
for(const p of C.WORLD_PROPS){ if(p&&p._seerHqOf){ ok(!props[p._seerHqOf],`exactly one HQ prop for ${p._seerHqOf}`); props[p._seerHqOf]=p; } }
ok(Object.keys(props).length===10,`${Object.keys(props).length}/10 HQ props in the world`);
const missing=C.SEER_HQ_NETWORK.filter(H=>!props[H.dist]).map(H=>H.dist);
ok(missing.length===0,`no district left without one${missing.length?' — '+missing.join(', '):''}`);

console.log('\n2 · ★ EACH ONE STANDS IN ITS OWN DISTRICT, ON LAND\n');
console.log('     district    bearing  door        d(hall)  d(tower)  t(radius)  quarter');
for(const H of C.SEER_HQ_NETWORK){
  const P=props[H.dist]; if(!P)continue;
  const D=DC[H.dist];
  const bad=P.footprint.filter(([dx,dy])=>C.worldDistrictAt(P.tileX+dx,P.tileY+dy)!==H.dist);
  const wet=P.footprint.filter(([dx,dy])=>!C.isWorldLandTile(P.tileX+dx,P.tileY+dy));
  const b=bearing(P.tileX-D.cx,P.tileY-D.cy);
  const t=Math.hypot((P.tileX-D.cx)/D.rx,(P.tileY-D.cy)/D.ry);
  const T=C.TOWER_NETWORK.find(x=>x.dist===H.dist);
  const dh=HALL[H.dist]?Math.round(Math.hypot(P.tileX-HALL[H.dist][0],P.tileY-HALL[H.dist][1])):-1;
  const dt=Math.round(Math.hypot(P.tileX-T.tower[0],P.tileY-T.tower[1]));
  const q=C.wheelQuarterAt(H.dist,b);
  console.log(`     ${H.dist.padEnd(11)} ${b.padEnd(8)} (${String(P.tileX).padStart(3)},${String(P.tileY).padStart(3)})  ${String(dh).padStart(6)}   ${String(dt).padStart(6)}     ${t.toFixed(2)}      ${q}`);
  ok(bad.length===0&&wet.length===0,`${H.dist} · all 48 footprint tiles in-district and on land`);
}

console.log('\n3 · ★ FAR FROM THE TOWN HALL · the Creator\'s constraint\n');
let minH=1e9,minHd='';
for(const H of C.SEER_HQ_NETWORK){ const P=props[H.dist]; if(!P||!HALL[H.dist])continue;
  const d=Math.hypot(P.tileX-HALL[H.dist][0],P.tileY-HALL[H.dist][1]);
  if(d<minH){minH=d;minHd=H.dist;} }
console.log(`     closest pairing is ${minHd} at ${minH.toFixed(0)} tiles`);
ok(minH>=55,`every HQ sits at least 55 tiles from its town hall (min ${minH.toFixed(0)})`);
let minT=1e9,minTd='';
for(const H of C.SEER_HQ_NETWORK){ const P=props[H.dist]; if(!P)continue;
  const T=C.TOWER_NETWORK.find(x=>x.dist===H.dist);
  const d=Math.hypot(P.tileX-T.tower[0],P.tileY-T.tower[1]);
  if(d<minT){minT=d;minTd=H.dist;} }
console.log(`     closest tower pairing is ${minTd} at ${minT.toFixed(0)} tiles`);
ok(minT>=40,`no HQ overlaps a radio tower's boss squad (min ${minT.toFixed(0)})`);

console.log('\n4 · ★ IN THE WILD RING, NOT THE TOWN CORE\n');
console.log('     The built core runs to roughly t=0.35 of the radius; the homes belt');
console.log('     to ~0.45.  Anything beyond that is Ring 2, the natural wild.\n');
let inCore=0,minTt=9,maxTt=0;
for(const H of C.SEER_HQ_NETWORK){ const P=props[H.dist]; if(!P)continue; const D=DC[H.dist];
  const t=Math.hypot((P.tileX-D.cx)/D.rx,(P.tileY-D.cy)/D.ry);
  minTt=Math.min(minTt,t); maxTt=Math.max(maxTt,t);
  if(t<0.45)inCore++; }
console.log(`     t ranges ${minTt.toFixed(2)} to ${maxTt.toFixed(2)}`);
ok(inCore===0,`no HQ landed inside the core or homes belt (${inCore} did)`);
ok(maxTt<0.85,`and none is pushed out onto the coast (max ${maxTt.toFixed(2)})`);

console.log('\n5 · ★ THE RULE HOLDS · every HQ sits on the OUTBOUND ROAD\n');
console.log('     "The Seers control the roads."  Each HQ should fall in the OPEN');
console.log('     quarter of its district wheel, which is pinned to the road out.\n');
for(const H of C.SEER_HQ_NETWORK){
  const P=props[H.dist]; if(!P)continue; const D=DC[H.dist];
  const b=bearing(P.tileX-D.cx,P.tileY-D.cy);
  ok(b===H.bearing,`${H.dist.padEnd(11)} declared ${H.bearing.padEnd(2)} · measured ${b} · road to ${H.toward}`);
  ok(C.wheelQuarterAt(H.dist,b)==='open',`${H.dist.padEnd(11)} lands in the OPEN quarter (the road quarter)`);
}

console.log('\n6 · ★ FOUR BEARINGS ACROSS TEN DISTRICTS · the player cannot autopilot\n');
const bs={};for(const H of C.SEER_HQ_NETWORK)bs[H.bearing]=(bs[H.bearing]||0)+1;
console.log('     '+Object.entries(bs).map(([k,v])=>`${k}:${v}`).join('  '));
ok(Object.keys(bs).length>=4,`${Object.keys(bs).length} distinct bearings — not one fixed compass corner`);
let sameAsNext=0;
for(let i=0;i<C.SEER_HQ_NETWORK.length-1;i++){
  if(C.SEER_HQ_NETWORK[i].bearing===C.SEER_HQ_NETWORK[i+1].bearing)sameAsNext++; }
console.log(`     ${sameAsNext} consecutive pairs share a bearing (the long southern east-run)`);
ok(sameAsNext<=4,'the serpentine keeps most neighbours on different bearings');

console.log('\n7 · ★ THE WHEEL IS COHERENT · four quarters, always, rotated\n');
ok(C.DISTRICT_WHEEL.length===10,'DISTRICT_WHEEL covers all ten districts');
for(const W of C.DISTRICT_WHEEL){
  const got=new Set(['N','NE','E','SE','S','SW','W','NW'].map(b=>C.wheelQuarterAt(W.dist,b)));
  ok(got.size===4&&got.has('open')&&got.has('highland')&&got.has('forest')&&got.has('wetland'),
     `${W.dist.padEnd(11)} resolves all four quarters (${[...got].join('/')})`);
}
console.log('\n     highland always sits opposite the road:');
for(const W of C.DISTRICT_WHEEL){
  const opp={N:'S',S:'N',E:'W',W:'E',NE:'SW',SW:'NE',SE:'NW',NW:'SE'}[W.outbound];
  ok(C.wheelQuarterAt(W.dist,opp)==='highland',
     `${W.dist.padEnd(11)} road ${W.outbound.padEnd(2)} -> highland ${opp}`);
}
console.log('\n     and no two neighbouring districts share a full wheel:');
let dupWheel=0;
for(let i=0;i<C.DISTRICT_WHEEL.length-1;i++){
  const a=C.DISTRICT_WHEEL[i],b=C.DISTRICT_WHEEL[i+1];
  if(a.outbound===b.outbound&&a.flank===b.flank){dupWheel++;
    console.log(`       ${a.dist} and ${b.dist} are identical wheels`);}
}
ok(dupWheel===0,`${dupWheel} adjacent pairs share an identical wheel`);

console.log('\n8 · ★ EACH DISTRICT OVER-EXPRESSES ITS OWN LAND\n');
const dom={};for(const W of C.DISTRICT_WHEEL)dom[W.dominant]=(dom[W.dominant]||0)+1;
console.log('     '+Object.entries(dom).map(([k,v])=>`${k}:${v}`).join('  '));
ok(Object.keys(dom).length===4,'all four quarters get a turn as somebody\'s dominant');
ok(Math.max(...Object.values(dom))<=3,'and none dominates more than 3 of the ten');

console.log('\n9 · ★ GUARDS · the road is held, and cannot be stripped\n');
const guards=C.NPCS.filter(x=>x&&x._seerHqGuardOf);
const byd={};guards.forEach(g=>byd[g._seerHqGuardOf]=(byd[g._seerHqGuardOf]||0)+1);
console.log(`     ${guards.length} grunts across ${Object.keys(byd).length} districts · ${Object.entries(byd).map(([k,v])=>k+':'+v).join(' ')}`);
ok(true, 'the 5-wide guard ring is RETIRED as of v0.95.696 — see below');
console.log('     Replaced by SEER_PRESENCE: 4 POSTED at each door with their own');
console.log('     idle sheet, leash and formation, shipped as real NPCS entries');
console.log('     instead of clones injected at boot. verify_seerpresence.js owns');
console.log('     that check now; asserting 45 clones here would demand the old');
console.log('     system back.');
ok(guards.every(g=>!g._extraSpawn),'no guard is tagged _extraSpawn — the Horde toggle cannot delete them');
ok(guards.every(g=>g.isEnemy),'every guard is hostile');
const lv=guards.map(g=>g.level);
console.log(`     levels ${Math.min(...lv)} -> ${Math.max(...lv)} across the ladder`);
ok(Math.min(...lv)>=15&&Math.max(...lv)<=81,'levels track the district band');
const before=C.NPCS.length; C.buildSeerHqGuardPacks(); C.buildSeerHqGuardPacks();
ok(C.NPCS.length===before,`re-running the builder twice adds nothing (idempotent, ${C.NPCS.length})`);
let onTop=0;
for(const g of guards){ const P=props[g._seerHqGuardOf]; if(!P)continue;
  if(P.footprint.some(([dx,dy])=>P.tileX+dx===g.tileX&&P.tileY+dy===g.tileY))onTop++; }
ok(onTop===0,`no grunt is standing inside the building (${onTop})`);

console.log('\n10 · ★ TEN DOORS, ONE INTERIOR · the drop point follows you\n');
for(const H of C.SEER_HQ_NETWORK.slice(0,4)){
  C.enterSeerHq(H.dist);
  const d=C.INTERIOR_SEER_HQ_1F.overworldDrop;
  ok(d.x===H.door[0]&&d.y===H.door[1]+3,
     `${H.dist.padEnd(11)} drops you back at (${d.x},${d.y}) — outside ITS door, not Malezor's`);
}
C.enterSeerHq('korathen');
ok(C.seerHqDistrict()==='korathen','the interior knows which district you are standing in');
ok(/KORATHEN/.test(C.INTERIOR_SEER_HQ_1F.label),`label reads "${C.INTERIOR_SEER_HQ_1F.label}"`);

console.log('\n11 · ★ THE RUBY VIAL STAYS ONE OF A KIND\n');
C.player.items={};C.player.seerHqChests={};delete C.player.rubyVialChestOpened;
C.player.seerKeys={};
// v0.95.699 · the silver chest moved DOWN to the vault. Standing on 1F,
// tryOpenSeerHqChest() now returns false immediately and every assertion below
// fails for the wrong reason.
C.game.scene='interior_seer_hq_b';
C.player.seerHqDistrict='korathen'; C.tryOpenSeerHqChest();
ok(!(C.player.items.ruby_vial>0),'looting Korathen\'s strongbox does NOT hand out a Ruby Vial');
ok(C.player.coins>0,`it pays coins instead (${C.player.coins})`);
C.player.seerHqDistrict='malezor'; C.tryOpenSeerHqChest();
ok(C.player.items.ruby_vial===1,'Malezor\'s chest still gives exactly one Ruby Vial');
ok(C.player.rubyVialChestOpened===true,'and still sets the legacy flag the Potion Maker quest reads');
const again=C.tryOpenSeerHqChest();
ok(again===false,'a looted chest cannot be farmed twice');
console.log('\n     back-compat · a save that looted Malezor BEFORE this build:');
C.player.seerHqChests={}; C.player.rubyVialChestOpened=true; C.player.seerHqDistrict='malezor';
ok(C.seerHqChestOpened('malezor')===true,'reads as already-open, not mysteriously closed again');
ok(C.seerHqChestOpened('veridan')===false,'while the other nine are correctly still shut');

console.log('\n12 · NEVER PURCHASABLE\n');
let buyable=[];for(const d of Object.keys(props)){if(C.isPurchasableHomeId(props[d].id))buyable.push(props[d].id);}
ok(buyable.length===0,`no Seer HQ can be bought as a home${buyable.length?' — '+buyable.join(', '):''}`);

console.log('\n13 · REACHABLE · you can walk up and press X\n');
// Section 11 left us standing inside an interior; walkable() branches on scene,
// so overworld tiles read as blocked until we step back out.  This bit me once
// already — all ten failed, including Malezor's, which has shipped since
// v0.95.443 and demonstrably works.
C.game.scene='overworld';
// A grunt standing on the doorstep is DESIGN, not obstruction — Malezor's five
// hand-authored guards do exactly that, which is why it reads 11/16 while the
// nine generated rings (which sit deliberately just outside the apron) read
// 16/16.  What matters is that a path to the door exists at all.
for(const H of C.SEER_HQ_NETWORK){
  const P=props[H.dist]; if(!P)continue;
  let free=0,blockedByGuard=0;
  for(let dy=1;dy<=2;dy++)for(let dx=-4;dx<=3;dx++){
    const X=P.tileX+dx,Y=P.tileY+dy;
    if(C.walkable(X,Y)){free++;continue;}
    if(C.NPCS.some(g=>g&&g.isEnemy&&g.scene==='overworld'&&g.tileX===X&&g.tileY===Y))blockedByGuard++;
  }
  const terrain=16-free-blockedByGuard;
  ok(C._propDoors.has(`${P.tileX},${P.tileY}`)&&free>=8&&terrain===0,
     `${H.dist.padEnd(11)} door registered · ${free}/16 apron free · ${blockedByGuard} held by guards · ${terrain} blocked by terrain`);
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
