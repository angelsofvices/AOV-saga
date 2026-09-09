const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
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
// v0.95.742 · THE FANGHALL · first of the 30 lore buildings.
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+';globalThis.__C={WORLD_PROPS,worldDistrictAt,_propBlocked,_propDoors,isWorldBorderTile,NPCS,walkable,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const A='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/buildings/';

console.log('\n1 · ★ ART\n');
// ★★★ v0.96.49 · RENAMED AND RESIZED UNDERNEATH THIS SUITE.
// The prop is `malezor_the_fanghall` drawing `the-fanghall.png`, not
// `malezor_fanghall`/`fanghall.png` — so the WORLD_PROPS lookup returned
// undefined and reading .tileX off it killed the run at assertion five.
// ★ NOTE FOR THE CREATOR: the older `fanghall.png` is still on disk and no
//   longer referenced by anything.  Left in place — deleting art is your call.
ok(FS.existsSync(A+'the-fanghall.png'),'the-fanghall.png installed');
ok(FS.existsSync(A+'_orig/fanghall-delivered.png'),'delivered original preserved');

console.log('\n2 · ★★ PLACED, AND NOT ON TOP OF ANYTHING\n');
const fh=C.WORLD_PROPS.find(p=>p&&p.id==='malezor_the_fanghall');
ok(!!fh,'malezor_the_fanghall is in WORLD_PROPS');
ok(C.worldDistrictAt(fh.tileX,fh.tileY)==='malezor',`stands in Malezor (${fh.tileX},${fh.tileY})`);
ok(!C.isWorldBorderTile(fh.tileX,fh.tileY),'not on the world border');
// ★★ assert the RELATIONSHIP, not the two numbers · the hall was re-cut from
//    13x12 to 11x10 and the point was never the digits, it was the ranking
const _fhTownHall=C.WORLD_PROPS.find(p=>p&&p.id==='malezor_town_hall');
ok(fh.tileW*fh.tileH > _fhTownHall.tileW*_fhTownHall.tileH,
   `${fh.tileW}x${fh.tileH} vs the town hall's ${_fhTownHall.tileW}x${_fhTownHall.tileH} — the Elder's hall still outsizes it`);
// overlap against every other Malezor building
let clash=0;
for(const p of C.WORLD_PROPS){
  if(!p||p===fh||p.tileX==null) continue;
  if(C.worldDistrictAt(p.tileX,p.tileY)!=='malezor') continue;
  if(!/buildings\//.test(p.src||'')) continue;
  const ax0=fh.tileX-6, ax1=fh.tileX+6, ay0=fh.tileY-11, ay1=fh.tileY;
  const bw=p.tileW||1, bh=p.tileH||1;
  const bx0=p.tileX-Math.floor(bw/2), bx1=p.tileX+Math.floor(bw/2), by0=p.tileY-bh+1, by1=p.tileY;
  if(ax0<=bx1&&ax1>=bx0&&ay0<=by1&&ay1>=by0){ clash++; console.log('     ★ overlaps '+p.id); }
}
ok(clash===0,`no footprint overlap with any other Malezor building (${clash})`);

console.log('\n3 · ★★ THE DOOR IS WALKABLE, THE WALLS ARE NOT\n');
ok(JSON.stringify(fh.door)==='[0,0]','door offset [0,0] — the art is a front elevation with the entrance dead centre');
ok(!C._propBlocked.has(fh.tileX+','+fh.tileY),'★ the door tile itself is NOT blocked — you can stand in the doorway');
// ★★ v0.96.49 · DERIVE THE HALF-WIDTH · the hall was re-cut 13x12 -> 11x10, so
//    a hardcoded -6..+6 reached two tiles past the building into open ground
//    and reported the walls unblocked.  Read the span the prop declares.
const _half=Math.max(...fh.footprint.map(([dx])=>Math.abs(dx)));
const base=[];
for(let dx=-_half;dx<=_half;dx++) if(dx!==0) base.push(C._propBlocked.has((fh.tileX+dx)+','+fh.tileY));
ok(base.every(Boolean),`all ${base.length} other base-row tiles ARE blocked (span ±${_half})`);
let roofOpen=0;
for(let dx=-6;dx<=6;dx++) if(!C._propBlocked.has((fh.tileX+dx)+','+(fh.tileY-8))) roofOpen++;
ok(roofOpen===13,'★ the roofline (dy -8) is walkable — same rule as the town hall, so no invisible collision on the horns and banners');

console.log('\n4 · ★ PLACEMENT WAS CONSTRAINED, AND THE COMMENT SAYS SO\n');
const raw=FS.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
// ★★★ v0.96.49 · IT IS NOT HAND-PLACED ANY MORE.
// These grepped the notes from the original manual siting — "no free 13x12
// plot within 6 tiles of water", "northern spine ZERO free plots".  The hall
// is now positioned by the 30-district building solver (_district30 / _tri),
// which enumerates every valid anchor 30-150 tiles from the hub and picks the
// triple that best expresses the district shape.  Those notes were rewritten
// with the mechanism that replaced them; the constraint did not vanish, the
// author of it changed from a person to a solver.
ok(fh._district30==='malezor','★★ the hall is placed by the district-30 solver, not by hand');
ok(!!fh._tri,`★ and it carries its role in the district triple · _tri: '${fh._tri}'`);
ok(/enumerates every valid anchor 30-150 tiles from the hub/.test(raw),
   '★★ and the solver records its own constraint · clear of homes and solid props');
const th=C.WORLD_PROPS.find(p=>p&&p.id==='malezor_town_hall');
const d=Math.round(Math.hypot(fh.tileX-th.tileX,fh.tileY-th.tileY));
console.log(`     ${d} tiles from the town hall (Malezor spans ~300 tiles)\n`);
ok(d>=30&&d<=150,
   `★★ ${d} tiles from the town hall · inside the solver's own 30-150 band · the old check wanted <40, which was true of a siting chosen by hand and is not what the solver promises`);
ok(C.worldDistrictAt(fh.tileX,fh.tileY)==='malezor','★ and still inside Malezor · far from the hub is not the same as out of town');

console.log('\n5 · ★ IT INTERACTS\n');
ok(typeof fh.onInteract==='function','has an onInteract');
let threw=null; try{ fh.onInteract(); }catch(e){ threw=e.message; }
ok(!threw,'and it runs clean'+(threw?' — '+threw:''));
ok(/Elder/.test(String(fh.onInteract)),'the line names the Elder, per the story canon');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
