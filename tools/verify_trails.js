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
// v0.95.750 · trails + border forest · ALL TEN DISTRICTS, one derived solver.
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
 ';globalThis.__C={buildAllTrails,buildDistrictTrails,_districtRuns,_districtPOIs,DISTRICT_WHEEL,'+
 'WORLD_PROPS,worldDistrictAt,isWorldBorderTile,_propBlocked,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
C.buildAllTrails();
const V=C.WORLD_PROPS.filter(p=>p&&p._trailVerge);
const T=C.WORLD_PROPS.filter(p=>p&&p._borderForest);
const WP=C.WORLD_PROPS, WD=C.worldDistrictAt;

console.log('\n1 · ★★ EVERY DISTRICT GOT ROADS · from ONE derived solver\n');
let noRoads=0;
for(const w of C.DISTRICT_WHEEL){
  const v=V.filter(p=>p._trailVerge===w.dist).length;
  const t=T.filter(p=>p._borderForest===w.dist).length;
  const runs=C._districtRuns(w.dist).length;
  if(!v||!t) noRoads++;
  console.log(`     ${w.dist.padEnd(11)} ${String(runs).padStart(2)} roads · ${String(v).padStart(3)} verge · ${String(t).padStart(3)} forest`);
}
console.log('');
ok(noRoads===0,'★ all ten districts have both roads and a forest ring');
ok(V.length>3000&&T.length>3000,`${V.length} verge bushes · ${T.length} border trees world-wide`);
ok(C.buildAllTrails()===0,'idempotent — boot cannot double-carve');

console.log('\n2 · ★★ THE GRAPH IS DERIVED, NOT LISTED\n');
const src=String(C._districtRuns);
ok(!/malezor|zarvane|veridan/i.test(src),
   '★ _districtRuns names NO district — the prototype hardcoded 12 routes, which would have needed hand-writing 10 times and rotted on the next building');
for(const w of C.DISTRICT_WHEEL){
  const P=C._districtPOIs(w.dist);
  if(w.dist==='malezor') ok(P.b30.length===3&&!!P.cave&&!!P.seer,'malezor POIs read off the world: 3 buildings, a cave, a Seer HQ');
}
ok(C.DISTRICT_WHEEL.every(w=>C._districtPOIs(w.dist).b30.length===3),'every district resolves exactly 3 district buildings');
ok(C.DISTRICT_WHEEL.every(w=>!!C._districtPOIs(w.dist).cave),'and every district resolves its Gemlord cave');

console.log('\n3 · ★★ CAN YOU ACTUALLY WALK IT? · connectivity, not tile stats\n');
console.log('     I first scored this as "% of roadbed blocked" and chased the');
console.log('     number down two revisions. It was the wrong question: a house');
console.log('     on the roadside blocks its own footprint and the player simply');
console.log('     steps around it. What a road exists to answer is whether you');
console.log('     can GET there — so flood-fill it and check.\n');
const walkT=(x,y,d)=>C.worldDistrictAt(x,y)===d && !C.isWorldBorderTile(x,y) && !C._propBlocked.has(x+','+y);
let unreachable=0, totalPOI=0;
for(const w of C.DISTRICT_WHEEL){
  const d=w.dist, P=C._districtPOIs(d);
  const pois=P.civic.concat(P.b30,[P.cave,P.seer].filter(Boolean));
  totalPOI+=pois.length;
  let st=null;
  for(const p of pois){ for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1],[0,2],[2,0]]){
    if(walkT(p.tileX+dx,p.tileY+dy,d)){st=[p.tileX+dx,p.tileY+dy];break;} } if(st)break; }
  if(!st){ unreachable+=pois.length; continue; }
  const seen=new Set([st.join(',')]); const q=[st];
  while(q.length){
    const [x,y]=q.shift();
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,k=nx+','+ny;
      if(seen.has(k)||!walkT(nx,ny,d))continue;
      seen.add(k); q.push([nx,ny]);
    }
  }
  let miss=0;
  for(const p of pois){
    let got=false;
    for(let r=1;r<=3&&!got;r++)for(let dy=-r;dy<=r&&!got;dy++)for(let dx=-r;dx<=r&&!got;dx++)
      if(seen.has((p.tileX+dx)+','+(p.tileY+dy))) got=true;
    if(!got) miss++;
  }
  unreachable+=miss;
  console.log(`     ${d.padEnd(11)} ${pois.length-miss}/${pois.length} POIs reachable on foot${miss?'   ← STRANDED':''}`);
}
console.log('');
ok(unreachable===0,`★★ all ${totalPOI} POIs across ten districts are reachable on foot (${unreachable} stranded)`);

console.log('\n4 · ★★ FOREST IS A BORDER, NOT A BLANKET\n');
let inland=0;
for(const p of T){
  let edge=false;
  for(const [ex,ey] of [[22,0],[-22,0],[0,22],[0,-22]])
    if(C.worldDistrictAt(p.tileX+ex,p.tileY+ey)!==p._borderForest){edge=true;break;}
  if(!edge) inland++;
}
ok(inland===0,`★ all ${T.length} forest trees sit within 22 tiles of their district edge (${inland} strays inland)`);
ok(T.every(p=>C.worldDistrictAt(p.tileX,p.tileY)===p._borderForest),'and every one is inside the district it is tagged for');

console.log('\n5 · ★ NOTHING WAS TRAMPLED\n');
ok(C.WORLD_PROPS.filter(p=>p&&p._district30).length===30,'all 30 district buildings survived the carve');
const dup=new Set(); let stacked=0;
for(const p of V.concat(T)){ const k=p.tileX+','+p.tileY; if(dup.has(k)) stacked++; dup.add(k); }
ok(stacked===0,`no new prop stacked on another (${stacked})`);
ok(/footprint\.length <= 1/.test(String(C.buildDistrictTrails)),
   '★ clearing still only touches FLORA — a real footprint means a building');

console.log('\n6 · ★ DISTRICT-NATIVE FLORA ON DISTRICT ROADS\n');
// ★ v0.95.752 · every district grows its OWN tree. The rollout shipped a
// one-entry map with a silent fallback and planted 3,343 Malezor trees across
// eight foreign districts.
{
  const bySrc={};
  for(const p of T) (bySrc[p._borderForest]=bySrc[p._borderForest]||new Set()).add(decodeURIComponent(p.src).split('/').pop());
  let foreign=0;
  for(const [d,set] of Object.entries(bySrc))
    for(const f of set) if(!f.startsWith(d)) foreign++;   // zarvane-cactus starts with 'zarvane'
  ok(foreign===0,`★ no district borrows another's forest (${foreign} foreign) — Malezor's tree is Malezor's alone`);
  ok(!Object.entries(bySrc).some(([d,set])=>d!=='malezor'&&set.has('malezor-tree.png')),
     'and specifically: malezor-tree.png appears in no other district');
  // ★ v0.95.755 · this used to assert Zarvane grew a HEDGE of its own bush,
  // because it had no tree art. It now has a cactus, so that assertion became
  // false and the suite caught it. Replaced with what is true, not deleted.
  ok((bySrc.zarvane||new Set()).has('zarvane-cactus.png'),
     'Zarvane grows its own cactus stand — no borrowed forest, no bush hedge');
  ok(!(bySrc.zarvane||new Set()).has('zarvane-bush.png'),
     'and its bush is back to lining verges only');
}
// ★★ v0.95.754 · EVERY district lines its verges with its OWN bush. The tree
// fix left bushes still falling back to Malezor's bush.png in seven districts.
{
  const byD={};
  for(const p of V) (byD[p._trailVerge]=byD[p._trailVerge]||new Set()).add(decodeURIComponent(p.src).split('/').pop());
  const ds=Object.keys(byD);
  ok(ds.length>=9,`verges exist in ${ds.length} districts — this check is worthless on few`);
  const wrong=ds.filter(d=>[...byD[d]].some(f=>d==='malezor'?f!=='bush.png':!f.startsWith(d)));
  ok(wrong.length===0,`every district's verges use its own bush${wrong.length?' — wrong: '+wrong.join(', '):''}`);
  ok(!ds.some(d=>d!=='malezor'&&byD[d].has('bush.png')),
     "bush.png is Malezor's and appears in no other district's verges");
}

console.log('\n7 · ★★ NO DISTRICT USES ANOTHER\'S FLORA — ANY OF IT');
// No longer tree-specific. Walks EVERY flora prop in the world, derives the
// owning district from the filename, and fails if it stands anywhere else.
{
  const FLORA=/decor\/(?:[a-z]+\/)?[a-z0-9-]*(?:tree|bush|grass|grassblade)/;
  const MAL=/^(bush|grass-patch-[ab]|grassblade)\.png$/;
  const seen={};
  for(const p of WP){
    if(!p||p.tileX==null||!p.src||!FLORA.test(p.src)) continue;
    const art=decodeURIComponent(p.src).split('/').pop();
    const d=WD(p.tileX,p.tileY); if(!d) continue;
    (seen[art]=seen[art]||new Set()).add(d);
  }
  const arts=Object.keys(seen);
  ok(arts.length>=30,`the world has flora to check (${arts.length} distinct assets)`);
  let bad=[];
  for(const art of arts){
    const owner=MAL.test(art)?'malezor':(/^([a-z]+)-/.exec(art)||[])[1];
    if(!owner){ bad.push(art+' (no owner derivable)'); continue; }
    for(const d of seen[art]) if(d!==owner) bad.push(`${art} in ${d}`);
  }
  ok(bad.length===0,`all ${arts.length} flora assets stay home${bad.length?' — '+bad.slice(0,5).join(', '):''}`);
}

console.log('\n8 · ★ THE COLLISION BOX MATCHES THE DRAWN ART');
// ★ v0.95.756 · CORRECTION. This section used to be called "no bush is
// stretched". It could not have been: drawProp computes
// drawH = drawW * (bh/bw), deriving height from the bbox and ignoring tileH
// entirely. Nothing was ever stretched by the cell.
// What tileH DOES drive is collision and plantPropAt (punch/harvest hit
// detection). So the real property worth asserting is that the declared cell
// matches the shape actually drawn — otherwise the player punches air, or
// walks through a bush that looks solid.
{
  let worst=0, off=[];
  for(const p of V){
    if(!p.bbox) continue;
    const ar=p.bbox[2]/p.bbox[3], ca=(p.tileW||2)/(p.tileH||1);
    const st=Math.max(ar/ca, ca/ar);
    if(st>worst) worst=st;
    if(st>1.02) off.push(decodeURIComponent(p.src).split('/').pop());
  }
  ok(V.length>0,`there are ${V.length} verge bushes to measure`);
  ok(worst<1.02,`bush: collision box matches drawn shape to ${worst.toFixed(3)}x${off.length?' — '+[...new Set(off)].join(', '):''}`);
}
{
  // ★ v0.95.755 · the treeline block hardcoded Malezor's crop for every tree.
  // Andrannor read 226px of empty padding and drew small and offset.
  let worst=0, off=[];
  for(const p of T){
    if(!p.bbox) continue;
    const ar=p.bbox[2]/p.bbox[3], ca=(p.tileW||3)/(p.tileH||3);
    const st=Math.max(ar/ca, ca/ar);
    if(st>worst) worst=st;
    if(st>1.02) off.push(decodeURIComponent(p.src).split('/').pop());
  }
  ok(T.length>1000,`there are ${T.length} border trees to measure`);
  ok(worst<1.02,`tree: collision box matches drawn shape to ${worst.toFixed(3)}x${off.length?' — '+[...new Set(off)].join(', '):''}`);
  ok(T.every(p=>p.bbox&&p.bbox.length===4),'every tree carries a bbox of its own');
}

console.log('\n8b · ★ EVERY VERGE BUSH IS 2 TILES WIDE');
// ★ v0.95.757 · Creator's call. v0.95.756 widened the nine tall bushes to 3 to
// match Zarvane's authored ones; reverted. A verge bush is 2 tiles, uniformly,
// so the road's edge reads the same in every district. This check used to
// assert the opposite -- replaced rather than left to rot.
{
  const widths=new Set(V.map(p=>p.tileW));
  ok(V.length>1000,`${V.length} verge bushes to check`);
  ok(widths.size===1&&widths.has(2),
     `every verge bush is 2 tiles wide (found: ${[...widths].join(', ')})`);
  // and the AUTHORED bushes too — Zarvane's Wilds perimeter and hall garden
  // were the only 3-tile bushes left in the world.
  const A=WP.filter(p=>p&&/bush/.test(p.src||'')&&!p._trailVerge&&!p._borderForest);
  const aw=new Set(A.map(p=>p.tileW));
  ok(A.length>3000,`${A.length} authored bushes to check`);
  ok(aw.size===1&&aw.has(2),
     `no bush anywhere in the world is 3 tiles wide (found: ${[...aw].join(', ')})`);
}

console.log('\n9 · ★ ZARVANE GROWS CACTUS, NOT A HEDGE');
{
  const z=T.filter(p=>p._borderForest==='zarvane');
  ok(z.length>0,`Zarvane has a treeline (${z.length} props)`);
  ok(z.every(p=>/zarvane-cactus/.test(p.src)),'and it is built from zarvane-cactus.png');
  ok(z.every(p=>!p._hedge),'none of it is flagged as a hedge any more');
  ok(!T.some(p=>p._hedge),'no district anywhere still falls back to a hedge');
  const verge=new Set(V.filter(p=>p._trailVerge==='zarvane').map(p=>decodeURIComponent(p.src).split('/').pop()));
  ok(!verge.has('zarvane-cactus.png'),
     "Zarvane's border art differs from its verge art — the map edge cannot be mistaken for a roadside");
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
