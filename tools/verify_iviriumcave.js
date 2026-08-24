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
new Function(src+';globalThis.__C={WORLD_PROPS,NPCS,_propBlocked,_propDoors,isWorldLandTile,isWorldBorderTile,worldDistrictAt,walkable,game};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
const IV=C.WORLD_PROPS.find(p=>p&&p.id==='ivirium_cave');
const RK=C.WORLD_PROPS.find(p=>p&&p.id==='rakoron_cave');
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
console.log('\n1 · ★ PLACED ON THE ZARVANE SAND, HUGGING THE COAST\n');
ok(!!IV,'ivirium_cave exists');
console.log(`     anchor (${IV.tileX},${IV.tileY}) · ${IV.tileW}x${IV.tileH} · ${IV.footprint.length} footprint tiles`);
let offD=0,offL=0,bord=0;
for(const [dx,dy] of IV.footprint){
  const x=IV.tileX+dx,y=IV.tileY+dy;
  if(C.worldDistrictAt(x,y)!=='zarvane')offD++;
  if(!C.isWorldLandTile(x,y))offL++;
  if(C.isWorldBorderTile(x,y))bord++;
}
ok(offD===0,`all ${IV.footprint.length} footprint tiles in ZARVANE (${offD} stray)`);
ok(offL===0,`all on land — nothing hanging over the sea (${offL})`);
ok(bord===0,`none on the border buffer (${bord})`);
let sea=0; for(let x=IV.tileX-6;x>IV.tileX-30;x--){ if(!C.isWorldLandTile(x,IV.tileY)){sea=IV.tileX-6-x;break;} }
console.log(`     west face sits ${sea} tiles from open water`);
ok(sea>0&&sea<=6,`hugging the coast (${sea} tiles)`);

console.log('\n2 · ★★ RAKORON GEOMETRY, EXACTLY\n');
console.log("                    ivirium   rakoron");
console.log(`     tileW          ${String(IV.tileW).padEnd(9)} ${RK.tileW}`);
console.log(`     tileH          ${String(IV.tileH).padEnd(9)} ${RK.tileH}`);
console.log(`     footprint      ${String(IV.footprint.length).padEnd(9)} ${RK.footprint.length}`);
console.log(`     door           ${String(JSON.stringify(IV.door)).padEnd(9)} ${JSON.stringify(RK.door)}`);
console.log(`     depthOffset    ${String(IV.depthOffset).padEnd(9)} ${RK.depthOffset}`);
// ★ v0.95.832 · INVERTED.  "Rakoron geometry, exactly" was the v0.95.689
// design and the Creator RETIRED it at v0.95.692/693: the nine later sheets
// are squarer, so they draw at 90% of Rakoron's visible height (CAVE_TARGET_H
// 8.49) with a 9-wide footprint (CAVE_HALF_W 4) against his 13.  "He stays
// the biggest door in the game."  What must still match exactly: the door
// offset, the depthOffset, and the STAIR-COLUMN footprint RULE — solid mass
// minus one climbable column, which v0.95.832 re-affirmed for all ten
// ("only the stair case tiles should be walkable up to the cave door").
ok(IV.tileW<RK.tileW&&IV.tileH===RK.tileH,'ivirium draws NARROWER than Rakoron by design (90% rule)');
ok(IV.footprint.length<RK.footprint.length,'…so it holds fewer solid tiles than his 13-wide mass');
ok(JSON.stringify(IV.door)===JSON.stringify(RK.door),'same door offset');
ok(IV.depthOffset===RK.depthOffset,'same depthOffset');
const shape=a=>a.footprint.map(([x,y])=>`${x},${y}`).sort().join('|');
const ruleShape=(halfW)=>{const f=[];for(let dy=-10;dy<=0;dy++)for(let dx=-halfW;dx<=halfW;dx++){if(!(dy>=-3&&dx===0))f.push(`${dx},${dy}`);}return f.sort().join('|');};
ok(shape(IV)===ruleShape(4),'★ the footprint IS the cave rule: solid mass minus the one stair column (halfW 4)');
ok(shape(RK)===ruleShape(6),'★ and Rakoron holds the same RULE at his own width (halfW 6) — the v0.95.832 collision fix');

console.log('\n3 · ★★ THE STAIR WORKS · one walkable column, like Rakoron\n');
let climb=[];
for(let dy=-3;dy<=0;dy++) climb.push(C.walkable(IV.tileX,IV.tileY+dy));
console.log(`     stair column (${IV.tileX}, ${IV.tileY-3}..${IV.tileY}): ${climb.map(v=>v?'open':'BLOCKED').join(' ')}`);
ok(climb.every(Boolean),'all 4 stair tiles are walkable — Rizer can climb');
ok(!C.walkable(IV.tileX,IV.tileY-4),'and stops at the wall above (the door tile blocks)');
let sides=0;
for(const dx of [-1,1]) for(let dy=-3;dy<=0;dy++) if(C.walkable(IV.tileX+dx,IV.tileY+dy)) sides++;
ok(sides===0,`both sides of the stair are solid (${sides} leaks)`);
const dx2=IV.door[0],dy2=IV.door[1];
console.log(`     door tile (${IV.tileX+dx2},${IV.tileY+dy2}) · Rizer stands at (${IV.tileX},${IV.tileY-3}) facing up`);
ok(C._propDoors.has(`${IV.tileX+dx2},${IV.tileY+dy2}`),'door registered in _propDoors so X interacts');
let ap=0; for(let dy=1;dy<=3;dy++) if(C.walkable(IV.tileX,IV.tileY+dy)) ap++;
ok(ap===3,`approach from the south is clear (${ap}/3)`);

console.log('\n4 · ★ SCALE\n');
const TILE=48;
const dw=IV.tileW*TILE, dh=dw*IV.bbox[3]/IV.bbox[2];
const rw=RK.tileW*TILE, rh=rw*RK.bbox[3]/RK.bbox[2];
console.log(`     ivirium  aspect ${(IV.bbox[2]/IV.bbox[3]).toFixed(3)}  drawn ${(dw/TILE).toFixed(2)} x ${(dh/TILE).toFixed(2)} tiles`);
console.log(`     rakoron  aspect ${(RK.bbox[2]/RK.bbox[3]).toFixed(3)}  drawn ${(rw/TILE).toFixed(2)} x ${(rh/TILE).toFixed(2)} tiles`);
// ★ v0.95.832 · inverted with the 90% ruling · same-width was the retired design
ok(dw<rw&&dw>rw*0.6,'drawn NARROWER than Rakoron (90% height on a squarer sheet) — by design, not drift');
console.log('     (taller face is the art, not a scale error — the sheet is squarer)');

console.log('\n5 · NOTHING ELSE IS THERE\n');
const fs2=new Set(IV.footprint.map(([dx,dy])=>`${IV.tileX+dx},${IV.tileY+dy}`));
const clash=C.WORLD_PROPS.filter(p=>p&&p!==IV&&typeof p.tileX==='number'&&fs2.has(`${p.tileX},${p.tileY}`));
ok(clash.length===0,`no other prop inside it${clash.length?' — '+clash.map(p=>p.id).join(', '):''}`);
const npc=C.NPCS.filter(n=>n&&n.scene==='overworld'&&fs2.has(`${n.tileX},${n.tileY}`));
ok(npc.length===0,`no NPC trapped inside${npc.length?' — '+npc.map(n=>n.id).join(', '):''}`);
console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
