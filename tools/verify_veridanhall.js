
// ★★ v0.95.789 · GATED CONTENT SKIP.
// The Creator removed the 8 overworld Zyrex NPCs (v0.95.768) and the 50
// townsfolk (v0.95.767). Suites asserting those NPCs exist were RIGHT when
// written and now assert a world nobody wants. They skip while the content is
// gated rather than being deleted, so restoring the content restores the checks.
const _GATED_NPC_IDS = ['apexaur_1','zarakai_wild','voltigrax_wild','anciuxor_wild',
                        'snok_wild','gearbyte','voltaryn','elzoran'];
const _npcGated = id => _GATED_NPC_IDS.includes(id);
const fs=require('fs');const src=fs.readFileSync('/tmp/all.js','utf8');const noop=()=>{};const pending=[];
global.setInterval=()=>0;global.setTimeout=(f,m)=>{pending.push({f,m});return 0};global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,
 value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,
 addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,
 querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),
 addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};global.getComputedStyle=()=>({getPropertyValue:()=>''});
new Function(src+';globalThis.__C={WORLD_PROPS,NPCS,_propBlocked,_propDoors,_buildingCovered,isWorldLandTile,isWorldBorderTile,worldDistrictAt,walkable,isPurchasableHomeId,TOWER_NETWORK,game};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
let f=0;

const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const HALLS=[['veridan_town_hall','veridan'],['netharion_town_hall','netharion'],['baelgor_town_hall','baelgor'],['vorashil_town_hall','vorashil'],['xilnar_town_hall','xilnar'],['thardin_town_hall','thardin'],['korathen_town_hall','korathen']];
for (const [HID,DIST] of HALLS){
const P=C.WORLD_PROPS.find(p=>p&&p.id===HID);
console.log(`\n${'='.repeat(60)}\n${HID.toUpperCase()}\n${'='.repeat(60)}`);
console.log('\n1 · PLACED AND IN THE RIGHT DISTRICT\n');
ok(!!P,`${HID} exists in WORLD_PROPS`); if(!P) continue;
console.log(`     door (${P.tileX},${P.tileY})  ${P.tileW}x${P.tileH} tiles  footprint ${P.footprint.length} tiles`);
ok(C.worldDistrictAt(P.tileX,P.tileY)===DIST,`door tile is in ${DIST.toUpperCase()} (${C.worldDistrictAt(P.tileX,P.tileY)})`);
let out=0; for(const [dx,dy] of P.footprint){ if(C.worldDistrictAt(P.tileX+dx,P.tileY+dy)!==DIST) out++; }
ok(out===0,`all ${P.footprint.length} footprint tiles inside ${DIST} (${out} stray)`);
let water=0; for(const [dx,dy] of P.footprint){ if(!C.isWorldLandTile(P.tileX+dx,P.tileY+dy)) water++; }
ok(water===0,`every footprint tile is land (${water} off-land)`);
console.log('\n2 · REACHABLE · you can stand at the door\n');
const nb=[[0,1],[0,2],[-1,1],[1,1]].filter(([dx,dy])=>C.walkable(P.tileX+dx,P.tileY+dy));
ok(nb.length>0,`${nb.length} standable tiles in front of the door`);
ok(C._propDoors.has(`${P.tileX},${P.tileY}`),'door registered in _propDoors so X interacts');
let plaza=0; for(let dy=1;dy<=2;dy++)for(let dx=-5;dx<=5;dx++){ if(C.walkable(P.tileX+dx,P.tileY+dy))plaza++; }
ok(plaza===22,`the full 11x2 plaza in front is walkable (${plaza}/22)`);
console.log('\n3 · NO COLLISION WITH ANYTHING ELSE\n');
const fset=new Set(P.footprint.map(([dx,dy])=>`${P.tileX+dx},${P.tileY+dy}`));
const clash=C.WORLD_PROPS.filter(q=>q&&q!==P&&typeof q.tileX==='number'&&fset.has(`${q.tileX},${q.tileY}`));
ok(clash.length===0,`no other prop inside the footprint${clash.length?' — '+clash.map(q=>q.id).join(', '):''}`);
const npc=C.NPCS.filter(nn=>nn&&nn.scene==='overworld'&&fset.has(`${nn.tileX},${nn.tileY}`));
ok(npc.length===0,`no NPC trapped inside it${npc.length?' — '+npc.map(nn=>nn.id).join(', '):''}`);
const T=C.TOWER_NETWORK.find(t=>t.dist===DIST);
const dTower=Math.hypot(P.tileX-T.tower[0],P.tileY-T.tower[1]);
ok(dTower>40,`well clear of the ${DIST} radio tower (${dTower.toFixed(0)} tiles away)`);
console.log('\n4 · NEVER PURCHASABLE\n');
ok(C.isPurchasableHomeId(HID)===false,'a town hall can never be bought');
console.log('\n5 · ASPECT · not stretched\n');
const [bx,by,bw,bh]=P.bbox; const TILE=48;
const dw=P.tileW*TILE, dh=Math.round(dw*(bh/bw));
console.log(`     bbox ${bw}x${bh} (aspect ${(bw/bh).toFixed(3)}) -> drawn ${dw}x${dh} = ${(dw/TILE).toFixed(1)}x${(dh/TILE).toFixed(1)} tiles`);
ok(Math.abs((dw/dh)-(bw/bh))<0.02,'drawn aspect matches the source');
ok(Math.abs(dh/TILE - P.tileH) < 1.3, `declared tileH ${P.tileH} matches the drawn height ${(dh/TILE).toFixed(1)}`);
}

// ── KORATHEN ONLY · the God must not be built over ────────────────────────
console.log(`\n${'='.repeat(60)}\nKORATHEN · ANCIUXOR CLEARANCE\n${'='.repeat(60)}\n`);
console.log('     Korathen is the one capital that could NOT take the 3-tile-north');
console.log('     offset: anciuxor_wild — the Ultimate Tier X God — is enthroned at');
console.log('     its centre column and renders ~4 tiles tall at scaleMul 2.0.\n');
{
const P=C.WORLD_PROPS.find(p=>p&&p.id==='korathen_town_hall');
const A=_npcGated('anciuxor_wild') ? {__gated:true} : C.NPCS.find(nn=>nn&&nn.id==='anciuxor_wild');
ok(!!A,A&&A.__gated?'(anciuxor_wild is gated · displacement check skipped)':'anciuxor_wild still exists and was not displaced');
if(P&&A){
  const fset=new Set(P.footprint.map(([dx,dy])=>`${P.tileX+dx},${P.tileY+dy}`));
  ok(!fset.has(`${A.tileX},${A.tileY}`),`the God is NOT inside the hall footprint (He stands at ${A.tileX},${A.tileY})`);
  ok(A.tileX===895&&A.tileY===650,'He is exactly where canon put Him — the hall moved, not the God');
  const gap=A.tileY-P.tileY;
  const godTiles=2*(A.scaleMul||1);   // scaleMul 1.0 == Rizer's 2-tile baseline
  console.log(`     hall base y=${P.tileY} · God feet y=${A.tileY} · gap ${gap} tiles · He renders ~${godTiles} tiles tall`);
  ok(gap>godTiles,`the gap (${gap}) clears His full ${godTiles}-tile height — no sprite overlap with the facade`);
  ok(P.tileX===A.tileX,'hall and God share the centre column, so He is framed dead-centre');
  const chest=C.WORLD_PROPS.find(q=>q&&q.id==='chest_mythic_12');
  ok(!!chest&&!fset.has(`${chest.tileX},${chest.tileY}`),'chest_mythic_12 is still reachable in the open square');
  console.log(`     approach from the south: chest (895,${chest?chest.tileY:'?'}) -> God (895,650) -> Hall (895,${P.tileY})`);
  let path=0; for(let y=P.tileY+1;y<A.tileY;y++){ if(C.walkable(895,y)) path++; }
  ok(path===A.tileY-P.tileY-1,`the whole forecourt between hall and God is walkable (${path}/${A.tileY-P.tileY-1})`);
}
}
console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
