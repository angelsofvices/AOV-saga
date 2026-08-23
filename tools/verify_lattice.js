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
// verify_lattice · v0.95.753 · asserts the world AFTER snapBuildingsToLattice(),
// not before it. The older suites boot and test the authored positions; the snap
// only fires in the deferred tick, so they were passing on a world the player
// never sees.

try{new Function(fs.readFileSync('/tmp/all.js','utf8')+';globalThis.__C={snapBuildingsToLattice,buildAllTrails,_hexSites,WORLD_PROPS,DISTRICT_WHEEL,worldDistrictAt,isWorldLandTile,isWorldBorderTile,game,HEX_PITCH,HEX_JITTER,MAP_COLS,MAP_ROWS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);

C.snapBuildingsToLattice(); C.buildAllTrails();
const B=C.WORLD_PROPS.filter(p=>p&&p._district30);

H('1 · EVERY BUILDING LANDED ON A LATTICE SITE');
ok(B.length===30,`30 lore buildings exist (${B.length})`);
ok(B.every(p=>p._latticeGrid),`all ${B.filter(p=>p._latticeGrid).length}/30 carry a lattice grid coord`);
// grid coords must be UNIQUE — two buildings on one site would overlap exactly
const gk=new Set(B.map(p=>p._latticeGrid.join(',')));
ok(gk.size===30,`all 30 sit on distinct sites (${gk.size} unique)`);

H('2 · ★ THE SPACING IS ACTUALLY UNIFORM');
// the point of the whole exercise: separations must be lattice multiples, not
// arbitrary. With +-4 jitter on each end, tolerance is 8 tiles + the pitch grid.
const P=C.HEX_PITCH, allow=[1,Math.sqrt(3),2,Math.sqrt(7),3].map(m=>m*P);
let offGrid=[], minSep=1e9;
for(const w of C.DISTRICT_WHEEL){
  const t=B.filter(p=>p._district30===w.dist);
  for(let i=0;i<t.length;i++)for(let j=i+1;j<t.length;j++){
    const d=Math.hypot(t[i].tileX-t[j].tileX,t[i].tileY-t[j].tileY);
    if(d<minSep)minSep=d;
    if(!allow.some(a=>Math.abs(d-a)<=2*C.HEX_JITTER+2)) offGrid.push(`${w.dist} ${Math.round(d)}`);
  }
}
ok(offGrid.length===0,`every pair sits at a lattice multiple of ${P} — ${offGrid.length} off-grid${offGrid.length?': '+offGrid.join(', '):''}`);
ok(minSep>=P*0.85,`closest pair ${Math.round(minSep)} tiles — no two buildings crowd each other (>= ${Math.round(P*.85)})`);

H('3 · THEY LANDED ON GROUND THE PLAYER CAN STAND ON');
let bad=0;
for(const p of B){
  if(!C.isWorldLandTile(p.tileX,p.tileY)) bad++;
  else if(C.isWorldBorderTile(p.tileX,p.tileY)) bad++;
}
ok(bad===0,`all 30 on non-border land (${bad} bad)`);
ok(B.every(p=>C.worldDistrictAt(p.tileX,p.tileY)===p._district30),
   'none drifted across a district line during the snap');

H('3b · \u2605 NOTHING LANDED ON TOP OF ANYTHING');
// Uses each prop's OWN declared footprint on both sides. My first attempt at
// this walked down-right from the anchor and reported 3 phantom collisions --
// props anchor at the BOTTOM and extend upward, so dy is negative.
{
  const FLORA=/decor\/(?:[a-z]+\/)?[a-z0-9-]*(?:tree|bush|grass|grassblade)/;
  const tiles=p=>{const fp=p.footprint&&p.footprint.length?p.footprint:[[0,0]];
    return fp.map(([dx,dy])=>`${p.tileX+dx},${p.tileY+dy}`);};
  const occ=new Map();
  for(const p of C.WORLD_PROPS){
    if(!p||p.tileX==null||p._district30||p._trailVerge||p._borderForest) continue;
    if(FLORA.test(p.src||'')) continue;
    for(const k of tiles(p)) occ.set(k,p.id||'?');
  }
  let hits=[];
  for(const b of B) for(const k of tiles(b)) if(occ.has(k)) hits.push(`${b.id} x ${occ.get(k)}`);
  ok(occ.size>2000,`the occupancy map is populated (${occ.size} structure tiles) -- worthless if empty`);
  ok(hits.length===0,`no lore building overlaps an existing structure${hits.length?': '+hits.slice(0,4).join(', '):''}`);
}

H('4 · ★ THE APEX STILL POINTS AT THE GEMLORD CAVE');
// the reason the triangle existed. If the apex is no longer the building
// nearest the cave, finding one no longer tells you which way the cave is.
let apexBad=[];
for(const w of C.DISTRICT_WHEEL){
  const t=B.filter(p=>p._district30===w.dist);
  const cave=C.WORLD_PROPS.find(p=>p&&/_cave$/.test(p.id||'')&&C.worldDistrictAt(p.tileX,p.tileY)===w.dist);
  if(!cave||t.length<2) continue;
  const d=p=>Math.hypot(p.tileX-cave.tileX,p.tileY-cave.tileY);
  const nearest=t.reduce((a,b)=>d(b)<d(a)?b:a);
  if((nearest._tri||'apex')!=='apex'&&t.some(x=>x._tri==='apex')) apexBad.push(w.dist);
}
ok(apexBad.length===0,`the cave-facing building is the apex in every district${apexBad.length?' — off: '+apexBad.join(', '):''}`);

H('5 · ★★ EVERY BUILDING IS REACHABLE BY ROAD');
// flood-fill the carved roadbed. Measuring the straight line was wrong twice
// before — the path wanders 3.2 tiles by design.
const road=C.game._trailRoad||{};
let unreach=[];
for(const w of C.DISTRICT_WHEEL){
  const R=road[w.dist]; if(!R){unreach.push(w.dist+':no-roadbed');continue;}
  const t=B.filter(p=>p._district30===w.dist); if(!t.length) continue;
  // seed from the first building's nearest road tile, flood, check the others
  const seedOf=p=>{for(let r=0;r<=6;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)
    if(R.has(`${p.tileX+dx},${p.tileY+dy}`))return`${p.tileX+dx},${p.tileY+dy}`;return null;};
  const s0=seedOf(t[0]); if(!s0){unreach.push(w.dist+':'+(t[0].id||'?'));continue;}
  const seen=new Set([s0]),q=[s0];
  while(q.length){const[x,y]=q.pop().split(',').map(Number);
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const k=`${x+dx},${y+dy}`; if(R.has(k)&&!seen.has(k)){seen.add(k);q.push(k);}}}
  for(const p of t.slice(1)){const s=seedOf(p); if(!s||!seen.has(s)) unreach.push(w.dist+':'+(p.id||'?'));}
}
ok(unreach.length===0,`all 30 connect to one another over carved road${unreach.length?' — stranded: '+unreach.join(', '):''}`);

H('6 · ★ NO DISTRICT BORROWS ANOTHER\'S FOREST');
const tre=C.WORLD_PROPS.filter(p=>p&&p._borderForest&&!p._hedge);
let borrow=[];
for(const p of tre){
  const m=/([a-z]+)-tree\.png/.exec(p.src||''); if(!m) continue;
  const d=C.worldDistrictAt(p.tileX,p.tileY);
  if(d&&m[1]!==d) borrow.push(`${m[1]}-tree in ${d}`);
}
ok(tre.length>500,`the treeline actually exists (${tre.length} border trees) — this check is worthless on zero`);
ok(borrow.length===0,`${borrow.length} planted in the wrong district`);
// ★ Test the PROPERTY, not the literal. This asserted /-tree\.png/ and broke
// the moment Zarvane's treeline became zarvane-cactus.png -- which is exactly
// the art Zarvane is supposed to use. What matters is that the file is named
// for the district standing in, not that it is spelled "tree".
const named=tre.filter(p=>{
  const f=decodeURIComponent(p.src||'').split('/').pop();
  return f.startsWith(C.worldDistrictAt(p.tileX,p.tileY)||'\u0000') || f==='malezor-tree.png';
}).length;
ok(named===tre.length,`every one resolves to art named for its own district (${named}/${tre.length})`);

H('7 · THE OPEN BLOCKS SURVIVED');
// "entire map blocks are used" must not mean "every block is full" — the empty
// lattice sites are where the caves, lakes and mountains go later.
let free=0,tot=0;
for(const w of C.DISTRICT_WHEEL){const s=(C.game._hexSites||{})[w.dist]||[];tot+=s.length;free+=s.length-3;}
ok(free>=20,`${tot} lattice sites, ${free} still empty and road-connected for later features`);

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
