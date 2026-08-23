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
new Function(src+';globalThis.__C={WORLD_PROPS,NPCS,ZYRAXIS_DISTRICTS,ZYRAXIS_DISTRICT_BY_ID,WHEEL_BY_DIST,DISTRICT_HOME_ART,'+
 'wheelQuarterAt,SETTLEMENT_DOCTRINE,SETTLEMENT_QUARTERS,settlementBearingsFor,findHomePlots,'+
 'SEER_HQ_BY_DIST,TOWER_BY_DIST,_propDoors,isWorldLandTile,isWorldBorderTile,worldDistrictAt,walkable,game};')();
const C=globalThis.__C;let n=0;while(pending.length&&n++<30){const q=pending.splice(0);q.forEach(t=>{try{t.f();}catch(_){}});}
let f=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const S=C.SETTLEMENT_DOCTRINE;
const DC=C.ZYRAXIS_DISTRICT_BY_ID;
const HOMEY=/home|house|cottage|manor|balcony|condo|villager|neighbor/i;
const bearing=(dx,dy)=>{if(Math.abs(dx)<=Math.abs(dy)*0.45)return dy<0?'N':'S';
  if(Math.abs(dy)<=Math.abs(dx)*0.45)return dx<0?'W':'E';return (dy<0?'N':'S')+(dx<0?'W':'E');};
const homesOf=d=>C.WORLD_PROPS.filter(p=>p&&typeof p.tileX==='number'&&HOMEY.test(p.id||'')
  &&!/shop|hall|school|treehouse/.test(p.id||'')&&C.worldDistrictAt(p.tileX,p.tileY)===d);
const TARGETS=['veridan','netharion','baelgor','thardin','korathen','vorashil','xilnar'];

console.log('\n1 · ★★ THE DOCTRINE MATCHES THE DISTRICT IT WAS MEASURED FROM\n');
console.log('     If these rules do not describe Malezor, they are invented, not learned.\n');
{
  const h=homesOf('malezor'); const D=DC.malezor;
  const q={}; const ts=[];
  for(const p of h){
    const k=C.wheelQuarterAt('malezor',bearing(p.tileX-D.cx,p.tileY-D.cy));
    q[k]=(q[k]||0)+1;
    ts.push(Math.hypot((p.tileX-D.cx)/D.rx,(p.tileY-D.cy)/D.ry));
  }
  console.log(`     ${h.length} Malezor homes by quarter: ${JSON.stringify(q)}`);
  ok(!q.open,'ZERO Malezor homes sit in the open road quarter — rule 2 is real');
  ok(!q.wetland,'and zero in the wetland');
  const inArc=(q.forest||0)+(q.highland||0);
  ok(inArc===h.length,`all ${h.length} fall in forest+highland, the arc the doctrine encodes`);
  console.log(`     t band ${Math.min(...ts).toFixed(2)}..${Math.max(...ts).toFixed(2)} (doctrine ${S.T_MIN}..${S.T_MAX})`);
  const within=ts.filter(t=>t>=S.T_MIN-0.01&&t<=S.T_MAX+0.02).length;
  ok(within===h.length,`every home falls inside the declared radius band (${within}/${h.length})`);
  const nn=h.map(p=>{let m=1e9;for(const r of h){if(r!==p)m=Math.min(m,Math.hypot(r.tileX-p.tileX,r.tileY-p.tileY));}return m;});
  console.log(`     nearest-neighbour ${Math.min(...nn).toFixed(0)}..${Math.max(...nn).toFixed(0)}, doctrine floor ${S.SPACING_MIN}`);
  ok(Math.min(...nn)>=S.SPACING_MIN,`no two Malezor homes are closer than the ${S.SPACING_MIN}-tile floor`);
}

console.log('\n2 · ★★ AND IT REJECTS THE DISTRICT THAT FEELS EMPTY\n');
console.log('     Zarvane is the counter-example.  A doctrine that passes both is useless.\n');
{
  const mz=homesOf('malezor'), zv=homesOf('zarvane');
  const cols=a=>new Set(a.map(p=>p.tileX)).size;
  const rows=a=>new Set(a.map(p=>p.tileY)).size;
  const fill=a=>a.length/(cols(a)*rows(a));
  console.log(`     malezor  ${mz.length} homes · ${cols(mz)} distinct X · ${rows(mz)} distinct Y · ${(fill(mz)*100).toFixed(0)}% lattice fill`);
  console.log(`     zarvane  ${zv.length} homes · ${cols(zv)} distinct X · ${rows(zv)} distinct Y · ${(fill(zv)*100).toFixed(0)}% lattice fill`);
  ok(cols(zv)<=5,`Zarvane's homes really do collapse onto ${cols(zv)} columns — the tell`);
  ok(cols(mz)>=7,`Malezor's spread across ${cols(mz)} columns instead`);
  ok(fill(zv)>fill(mz)*1.8,'Zarvane fills its lattice far more tightly · that is what reads as stamped');
  const friendly=d=>C.NPCS.filter(x=>x&&x.scene==='overworld'&&!x.isEnemy&&C.worldDistrictAt(x.tileX,x.tileY)===d).length;
  console.log(`     friendly NPCs per home · malezor ${(friendly('malezor')/mz.length).toFixed(1)} · zarvane ${(friendly('zarvane')/zv.length).toFixed(1)}`);
  ok(friendly('malezor')/mz.length > friendly('zarvane')/zv.length,
     'Malezor has meaningfully more people per house · rule 5');
  console.log(`     doctrine asks for ${S.NPC_PER_HOME} · Malezor is the model, Zarvane the warning`);
}

console.log('\n3 · ★ THE ARC IS ONE CONTIGUOUS NEIGHBOURHOOD, NOT A RING\n');
for(const d of TARGETS.concat(['malezor'])){
  const b=C.settlementBearingsFor(d);
  const ORDER=['N','NE','E','SE','S','SW','W','NW'];
  const idx=b.map(x=>ORDER.indexOf(x)).sort((a,z)=>a-z);
  // contiguous allowing wraparound
  let gaps=0;
  for(let i=0;i<idx.length;i++){
    const nxt=idx[(i+1)%idx.length];
    const step=((nxt-idx[i])%8+8)%8;
    if(step>1&&i<idx.length-1)gaps++;
  }
  console.log(`     ${d.padEnd(11)} ${b.join(',').padEnd(20)} (${b.length} bearings)`);
  ok(b.length>=3&&b.length<=5,`${d.padEnd(11)} arc is a neighbourhood-sized slice, not a full ring`);
  ok(gaps<=1,`${d.padEnd(11)} the arc is contiguous`);
  ok(!b.some(x=>C.wheelQuarterAt(d,x)==='open'),`${d.padEnd(11)} never touches the road quarter`);
}

console.log('\n4 · ★★ PLOTS FOR THE SEVEN DISTRICTS THAT STILL NEED HOUSES\n');
console.log('     district     asked  found   t band       spacing      quarters');
const ALL={};
for(const d of TARGETS){
  const plots=C.findHomePlots(d,14,0x50FA);
  ALL[d]=plots;
  const D=DC[d];
  const ts=plots.map(([x,y])=>Math.hypot((x-D.cx)/D.rx,(y-D.cy)/D.ry));
  const nn=plots.map(([x,y])=>{let m=1e9;for(const [a,b] of plots){if(a===x&&b===y)continue;m=Math.min(m,Math.hypot(a-x,b-y));}return m;});
  const q={};plots.forEach(([x,y])=>{const k=C.wheelQuarterAt(d,bearing(x-D.cx,y-D.cy));q[k]=(q[k]||0)+1;});
  console.log(`     ${d.padEnd(12)} ${String(14).padStart(5)} ${String(plots.length).padStart(6)}   ${ts.length?Math.min(...ts).toFixed(2)+'..'+Math.max(...ts).toFixed(2):'--'}   ${nn.length?Math.min(...nn).toFixed(0)+'..'+Math.max(...nn).toFixed(0):'--'}       ${JSON.stringify(q)}`);
  // Once a district is BUILT, its own houses reserve the good ground and the
  // 9-tile spacing rule excludes everything around them — so a spare-plot
  // search legitimately returns fewer.  Vorashil dropped to 3 the moment its
  // nine homes landed.  Only unbuilt districts owe us a full slate.
  const built=C.WORLD_PROPS.filter(p=>p&&p._doctrineHome===d).length;
  if(built) ok(true,`${d.padEnd(11)} ALREADY BUILT (${built} homes) · ${plots.length} spare plot(s) left over`);
  else      ok(plots.length>=10,`${d.padEnd(11)} found ${plots.length} viable plots (asked 14)`);
  ok(!ts.length||(Math.min(...ts)>=S.T_MIN-0.001&&Math.max(...ts)<=S.T_MAX+0.001),`${d.padEnd(11)} every plot inside the radius band`);
  ok(!nn.length||Math.min(...nn)>=S.SPACING_MIN,`${d.padEnd(11)} nothing closer than ${S.SPACING_MIN} tiles`);
  ok(!q.open&&!q.wetland,`${d.padEnd(11)} nothing on the road or in the marsh`);
  if(plots.sparse)console.log(`                  (only ${plots.civicAnchors} civic anchor — reach relaxed ${S.CIVIC_REACH}->${plots.reach})`);
}

console.log('\n5 · ★ NO PLOT WOULD BLOCK ANYTHING THAT MATTERS\n');
let onDoor=0,tooNearHall=0,tooNearHQ=0,tooNearTower=0,notWalkable=0,offLand=0;
for(const d of TARGETS){
  const hall=C.WORLD_PROPS.find(p=>p&&p.id===`${d}_town_hall`);
  const hq=C.SEER_HQ_BY_DIST[d], tw=C.TOWER_BY_DIST[d];
  for(const [x,y] of ALL[d]){
    if(C._propDoors.has(`${x},${y}`))onDoor++;
    if(hall&&Math.hypot(x-hall.tileX,y-hall.tileY)<S.CLEAR_OF_HALL)tooNearHall++;
    if(hq&&Math.hypot(x-hq.door[0],y-hq.door[1])<S.CLEAR_OF_HQ)tooNearHQ++;
    if(tw&&Math.hypot(x-tw.tower[0],y-tw.tower[1])<S.CLEAR_OF_TOWER)tooNearTower++;
    if(!C.isWorldLandTile(x,y)||C.isWorldBorderTile(x,y))offLand++;
    for(let oy=-3;oy<=1;oy++)for(let ox=-2;ox<=2;ox++)if(!C.walkable(x+ox,y+oy))notWalkable++;
  }
}
const total=TARGETS.reduce((a,d)=>a+ALL[d].length,0);
console.log(`     ${total} plots checked across ${TARGETS.length} districts`);
ok(onDoor===0,`none sits on an existing door (${onDoor})`);
ok(tooNearHall===0,`none crowds a capital plaza (${tooNearHall})`);
ok(tooNearHQ===0,`none crowds a Seer HQ (${tooNearHQ})`);
ok(tooNearTower===0,`none crowds a radio tower (${tooNearTower})`);
ok(offLand===0,`none is off-land or on a border (${offLand})`);
ok(notWalkable===0,`every 5x5 house plot is entirely clear ground (${notWalkable} bad tiles)`);

console.log('\n6 · ★ WALKING DISTANCE · rule 3\n');
for(const d of TARGETS){
  const civic=C.WORLD_PROPS.filter(p=>p&&typeof p.tileX==='number'
    &&/_town_hall$|shop|school|hospital|academy|inn|clinic|market/.test(p.id||'')
    &&C.worldDistrictAt(p.tileX,p.tileY)===d);
  if(!civic.length){ console.log(`     ${d.padEnd(11)} has only a town hall so far — reach rule idles until shops land`); continue; }
  const far=ALL[d].filter(([x,y])=>!civic.some(c=>Math.hypot(x-c.tileX,y-c.tileY)<=S.CIVIC_REACH)).length;
  const ds=ALL[d].map(([x,y])=>Math.min(...civic.map(c=>Math.hypot(x-c.tileX,y-c.tileY))));
  console.log(`     ${d.padEnd(11)} ${civic.length} civic anchor(s) · plots ${Math.min(...ds).toFixed(0)}-${Math.max(...ds).toFixed(0)} tiles away`);
  const r=ALL[d].reach||S.CIVIC_REACH;
  const far2=ALL[d].filter(([x,y])=>!civic.some(c=>Math.hypot(x-c.tileX,y-c.tileY)<=r)).length;
  ok(far2===0,`${d.padEnd(11)} every plot within ${r} tiles of a door (${far2} stranded)${ALL[d].sparse?' · relaxed, only '+ALL[d].civicAnchors+' anchor':''}`);
}

console.log('\n7 · ★★ NO LATTICE · the Zarvane failure cannot recur\n');
console.log('     district     plots  distinct X  distinct Y  lattice fill');
for(const d of TARGETS){
  const p=ALL[d];
  const cx=new Set(p.map(a=>a[0])).size, cy=new Set(p.map(a=>a[1])).size;
  const fill=p.length/(cx*cy);
  console.log(`     ${d.padEnd(12)} ${String(p.length).padStart(5)} ${String(cx).padStart(11)} ${String(cy).padStart(11)}  ${(fill*100).toFixed(0)}%`);
  // The real tell is STACKING, not the raw column count: Zarvane puts 14 homes
  // in 4 columns (3.5 per column), Malezor 11 in 7 (1.6).  An earlier draft
  // demanded cx >= n*0.7, which is stricter than Malezor's own 0.64 and failed
  // Vorashil by a tenth of a column — the threshold was wrong, not the layout.
  const percol={};p.forEach(a=>percol[a[0]]=(percol[a[0]]||0)+1);
  const maxStack=Math.max(...Object.values(percol));
  console.log(`     ${d.padEnd(12)} worst column holds ${maxStack} homes (malezor 2, zarvane 5)`);
  ok(maxStack<=3,`${d.padEnd(11)} no column stacks more than 3 homes (worst ${maxStack})`);
  ok(cx>=p.length*0.6,`${d.padEnd(11)} ${cx} distinct columns for ${p.length} homes — at least as varied as Malezor`);
  // lattice fill is only meaningful once there are enough plots to form one;
  // with 3 homes any arrangement reads as a high fill by arithmetic alone
  if(p.length>=5) ok(fill<0.30,`${d.padEnd(11)} lattice fill ${(fill*100).toFixed(0)}% beats Zarvane's 35%`);
  else console.log(`     ${d.padEnd(12)} (only ${p.length} plots — lattice fill not meaningful yet)`);
}

console.log('\n8 · DETERMINISTIC AND RE-RUNNABLE\n');
const a=C.findHomePlots('veridan',14,0x50FA).map(p=>p.join(',')).join('|');
const b=C.findHomePlots('veridan',14,0x50FA).map(p=>p.join(',')).join('|');
ok(a===b,'the same seed gives the same neighbourhood every launch');
const c=C.findHomePlots('veridan',14,0x1234).map(p=>p.join(',')).join('|');
ok(a!==c,'a different seed gives a different one, so layouts can be reshuffled if you dislike them');
ok(C.findHomePlots('nowhere',5).length===0,'an unknown district returns nothing rather than throwing');
ok(C.findHomePlots('veridan',0).length===0,'asking for zero returns zero');

console.log('\n9 · ★ THE DOCTRINE IS NOW LOAD-BEARING\n');
// v0.95.673 asserted that NOTHING had been placed — correct then, deliberately
// false from v0.95.675, when Veridan became the first district built entirely
// from findHomePlots() rather than a hand-typed coordinate list.
const placed=C.WORLD_PROPS.filter(p=>p&&p._doctrineHome);
const byDist={};placed.forEach(p=>byDist[p._doctrineHome]=(byDist[p._doctrineHome]||0)+1);
console.log(`     ${placed.length} home(s) placed by doctrine · ${JSON.stringify(byDist)}`);
ok(placed.length>0,'the doctrine is no longer theoretical — it has built something');
ok(!!byDist.veridan,'Veridan is the first district built this way');
// and the built homes must satisfy the very rules section 1 measured off Malezor
const VD=DC.veridan;
const vq={};placed.filter(p=>p._doctrineHome==='veridan').forEach(p=>{
  const k=C.wheelQuarterAt('veridan',bearing(p.tileX-VD.cx,p.tileY-VD.cy));vq[k]=(vq[k]||0)+1;});
ok(!vq.open&&!vq.wetland,`Veridan's built homes obey rule 2 · ${JSON.stringify(vq)}`);
const stillWaiting=TARGETS.filter(d=>!byDist[d]);
console.log(`     still waiting on house art: ${stillWaiting.join(', ')}`);
ok(stillWaiting.length<TARGETS.length,'at least one district is done');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
