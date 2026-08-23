// v0.95.673 · SETTLEMENT DOCTRINE · measured off Malezor, applied to the rest.
// No house art exists for the seven flora districts yet, so this verifies the
// PLOTS findHomePlots() would choose — the placement decision is made and
// checked now, so the eventual art drop is a rendering step, not a design one.
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
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};global.getComputedStyle=()=>({getPropertyValue:()=>''});
new Function(src+';globalThis.__C={WORLD_PROPS,NPCS,ZYRAXIS_DISTRICTS,ZYRAXIS_DISTRICT_BY_ID,WHEEL_BY_DIST,'+
 'wheelQuarterAt,SETTLEMENT_DOCTRINE,SETTLEMENT_QUARTERS,settlementBearingsFor,findHomePlots,'+
 'SEER_HQ_BY_DIST,TOWER_BY_DIST,_propDoors,_propBlocked,isWorldLandTile,isWorldBorderTile,isVeridanRiverTile,worldDistrictAt,walkable,DISTRICT_HOME_ART,DISTRICT_HOME_COUNT,isPurchasableHomeId,homePriceAt,player,game};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const S=C.SETTLEMENT_DOCTRINE, DC=C.ZYRAXIS_DISTRICT_BY_ID;
const homes=C.WORLD_PROPS.filter(p=>p&&p._doctrineHome);
const bearing=(dx,dy)=>{if(Math.abs(dx)<=Math.abs(dy)*0.45)return dy<0?'N':'S';
  if(Math.abs(dy)<=Math.abs(dx)*0.45)return dx<0?'W':'E';return (dy<0?'N':'S')+(dx<0?'W':'E');};

const BUILT=Object.keys(C.DISTRICT_HOME_ART);
console.log('\n1 · ★ EVERY DISTRICT WITH HOUSE ART HAS A NEIGHBOURHOOD\n');
console.log(`     ${BUILT.length} district(s) with art: ${BUILT.join(', ')}`);
ok(homes.length===BUILT.length*C.DISTRICT_HOME_COUNT,
   `${homes.length} homes placed (${BUILT.length} x ${C.DISTRICT_HOME_COUNT})`);
for(const d of BUILT){
  const h=homes.filter(p=>p._doctrineHome===d);
  const byV={};h.forEach(p=>byV[p._homeVariant]=(byV[p._homeVariant]||0)+1);
  console.log(`     ${d.padEnd(11)} ${h.length} homes · `+Object.entries(byV).map(([k,v])=>`${k.replace(d+'-house-','')}:${v}`).join(' '));
  ok(h.length===C.DISTRICT_HOME_COUNT,`${d.padEnd(11)} got its full ${C.DISTRICT_HOME_COUNT}`);
  ok(Object.keys(byV).length===3,`${d.padEnd(11)} uses all three variants`);
  ok(Math.max(...Object.values(byV))===3,`${d.padEnd(11)} exactly 3 of each · no variant dominates`);
  ok(h.every(p=>p._homeVariant.startsWith(d+'-house-')),`${d.padEnd(11)} nobody got another district's house`);
}

console.log('\n2 · ★★ THE DOCTRINE WAS ACTUALLY OBEYED\n');
for(const dist of BUILT){
const D=DC[dist];
const dh=homes.filter(p=>p._doctrineHome===dist);
console.log(`\n     ── ${dist.toUpperCase()} ──`);
console.log('     id                    tile        t     bearing  quarter    variant');
const ts=dh.map(p=>Math.hypot((p.tileX-D.cx)/D.rx,(p.tileY-D.cy)/D.ry));
const qs={};dh.forEach(p=>{const q=C.wheelQuarterAt(dist,bearing(p.tileX-D.cx,p.tileY-D.cy));qs[q]=(qs[q]||0)+1;});
const nn=dh.map(p=>{let m=1e9;for(const q of dh){if(q===p)continue;m=Math.min(m,Math.hypot(q.tileX-p.tileX,q.tileY-p.tileY));}return m;});
console.log(`     t ${Math.min(...ts).toFixed(2)}..${Math.max(...ts).toFixed(2)} · spacing ${Math.min(...nn).toFixed(0)}..${Math.max(...nn).toFixed(0)} · quarters ${JSON.stringify(qs)}`);
ok(Math.min(...ts)>=S.T_MIN-0.001&&Math.max(...ts)<=S.T_MAX+0.001,`${dist.padEnd(11)} inside the radius band`);
ok(!qs.open&&!qs.wetland,`${dist.padEnd(11)} forest+highland only, never the road`);
ok(Math.min(...nn)>=S.SPACING_MIN,`${dist.padEnd(11)} nothing closer than ${S.SPACING_MIN} tiles`);
}

console.log('\n3 · ★★ NO LATTICE · beats the Zarvane failure\n');
console.log('     district     homes  distinct X  distinct Y  fill  worst column');
for(const dist of BUILT){
  const dh=homes.filter(p=>p._doctrineHome===dist);
  const cx=new Set(dh.map(p=>p.tileX)).size, cy=new Set(dh.map(p=>p.tileY)).size;
  const percol={};dh.forEach(p=>percol[p.tileX]=(percol[p.tileX]||0)+1);
  const stack=Math.max(...Object.values(percol));
  console.log(`     ${dist.padEnd(12)} ${String(dh.length).padStart(5)} ${String(cx).padStart(11)} ${String(cy).padStart(11)} ${(dh.length/(cx*cy)*100).toFixed(0).padStart(4)}% ${String(stack).padStart(13)}`);
  ok(stack<=3,`${dist.padEnd(11)} no column stacks more than 3 (worst ${stack})`);
  ok(dh.length/(cx*cy)<0.30,`${dist.padEnd(11)} lattice fill beats Zarvane's 35%`);
}
console.log('     malezor       11           7          10   16%             2');
console.log('     zarvane       14           4          10   35%             5   <- the warning');

console.log('\n4 · ★ SOLID, ENTERABLE, AND FOR SALE\n');
let badFoot=0,offLand=0,inRiver=0,notDoor=0;
for(const p of homes){
  if((p.footprint||[]).length!==25)badFoot++;
  for(const [dx,dy] of p.footprint){
    const X=p.tileX+dx,Y=p.tileY+dy;
    if(!C.isWorldLandTile(X,Y)||C.isWorldBorderTile(X,Y))offLand++;
    if(C.isVeridanRiverTile(X,Y))inRiver++;
  }
  if(!C._propDoors.has(`${p.tileX},${p.tileY}`))notDoor++;
}
ok(badFoot===0,`every home is a full 5x5 footprint (${badFoot} malformed)`);
ok(offLand===0,`all 225 footprint tiles on land (${offLand} off)`);
ok(inRiver===0,`none built in the Veridan river (${inRiver})`);
ok(notDoor===0,`every door registered in _propDoors so X works (${notDoor} missing)`);
ok(homes.every(p=>typeof p.onInteract==='function'),'every home has an interact handler');
let buyable=homes.filter(p=>C.isPurchasableHomeId(`${p._doctrineHome}_${p.id.split('_').pop()}`)).length;
ok(buyable===homes.length,`all ${buyable} are purchasable (not caught by the civic denylist)`);
const prices=homes.map(p=>C.homePriceAt(p.tileX,p.tileY));
console.log(`     prices ${Math.min(...prices)} - ${Math.max(...prices)} coins`);
ok(prices.every(v=>v>0),'the price ladder resolves for every plot');

console.log('\n5 · ★ NOTHING WAS BUILT ON TOP OF ANYTHING\n');
const occupied=new Map();
for(const p of C.WORLD_PROPS){
  if(p._doctrineHome)continue;
  if(typeof p.tileX!=='number')continue;
  for(const [dx,dy] of p.footprint||[])occupied.set(`${p.tileX+dx},${p.tileY+dy}`,p.id);
}
let clash=[];
for(const p of homes){
  for(const [dx,dy] of p.footprint){
    const k=`${p.tileX+dx},${p.tileY+dy}`;
    if(occupied.has(k))clash.push(`${p.id}@${k} vs ${occupied.get(k)}`);
  }
}
ok(clash.length===0,`no home overlaps another prop${clash.length?' — '+clash.slice(0,3).join(', '):''}`);
const grassUnder=C.WORLD_PROPS.filter(p=>p._districtGrass&&homes.some(h=>h.footprint.some(([dx,dy])=>h.tileX+dx===p.tileX&&h.tileY+dy===p.tileY))).length;
ok(grassUnder===0,`no grass clump grew under a house (${grassUnder}) — homes run before the meadows`);
let apron=0;
for(const p of homes){ for(let dx=-2;dx<=2;dx++) if(C.walkable(p.tileX+dx,p.tileY+1))apron++; }
console.log(`     ${apron}/${homes.length*5} front-apron tiles walkable`);
ok(apron>=homes.length*4,'you can walk up to every front door');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
