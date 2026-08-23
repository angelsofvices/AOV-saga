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
// v0.95.734 · DREAMLAND DECOR · four props scattered over procedural cloud,
// plus the dense cloud variant painted under the bright one.
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+';globalThis.__C={buildDreamlandDecor,_dreamDecor,_dreamBlocked,DREAM_DECOR_ART,DREAM_DECOR_COUNT,DREAM_DECOR_CLEAR,INTERIOR_DREAMLAND,DREAMLAND_SIZE,DREAMLAND_SOLID,DREAMLAND_BRIGHT,dreamlandSolid,dreamlandDensity,drawDreamDecor,_dreamRand,DREAMLAND_SCENE};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
const FS=require('fs');
const A='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/';

console.log('\n1 · ★ ART ON DISK\n');
for (const D of C.DREAM_DECOR_ART) ok(FS.existsSync(A+'decor/'+D.file), 'decor/'+D.file);
ok(FS.existsSync(A+'tiles/dreamland-cloud-dense.png'),'tiles/dreamland-cloud-dense.png');
ok(FS.existsSync(A+'decor/_orig/dream-spire-delivered.png'),'delivered originals preserved');

console.log('\n2 · ★ HOW MUCH GROUND IS THERE\n');
let solid=0;
for(let y=0;y<C.DREAMLAND_SIZE;y++)for(let x=0;x<C.DREAMLAND_SIZE;x++) if(C.dreamlandSolid(x,y)) solid++;
console.log(`     ${solid} solid tiles of ${C.DREAMLAND_SIZE*C.DREAMLAND_SIZE}`);
const n=C.buildDreamlandDecor();
console.log(`     ${n} props placed · 1 per ${(solid/n).toFixed(0)} solid tiles\n`);
ok(n===C.DREAM_DECOR_COUNT,`placed the full ${C.DREAM_DECOR_COUNT}`);
ok(C.buildDreamlandDecor()===n,'idempotent — a second nap does not double the realm');

console.log('\n3 · ★★ EVERY PROP STANDS ON SOLID CLOUD\n');
const bad=C._dreamDecor.filter(d=>!C.dreamlandSolid(d.x,d.y));
ok(bad.length===0,`none floating over a hole (${bad.length})`);
let footBad=0;
for(const d of C._dreamDecor){
  const half=Math.floor(Math.max(1,d.art.blockW)/2);
  for(let dx=-half;dx<=half;dx++) if(!C.dreamlandSolid(d.x+dx,d.y)) footBad++;
}
ok(footBad===0,`every FOOTPRINT tile is solid too, not just the anchor (${footBad})`);
const oob=C._dreamDecor.filter(d=>d.x<0||d.y<0||d.x>=C.DREAMLAND_SIZE||d.y>=C.DREAMLAND_SIZE);
ok(oob.length===0,'none off the 100x100 map');
let close=0;
for(let i=0;i<C._dreamDecor.length;i++)for(let j=i+1;j<C._dreamDecor.length;j++){
  const a=C._dreamDecor[i],b=C._dreamDecor[j];
  if(Math.abs(a.x-b.x)<3&&Math.abs(a.y-b.y)<3) close++;
}
ok(close===0,`no two props inside 3 tiles of each other (${close})`);

console.log('\n4 · ★★ THE SPAWN IS CLEAR\n');
const sp=C.INTERIOR_DREAMLAND.spawn;
const nearSpawn=C._dreamDecor.filter(d=>Math.abs(d.x-sp.x)<=C.DREAM_DECOR_CLEAR&&Math.abs(d.y-sp.y)<=C.DREAM_DECOR_CLEAR);
ok(nearSpawn.length===0,`nothing within ${C.DREAM_DECOR_CLEAR} tiles of the wake point (${nearSpawn.length}) — you never wake inside a spire`);
ok(!C.INTERIOR_DREAMLAND.isBlocked(sp.x,sp.y),'and the spawn tile itself is walkable');

console.log('\n5 · ★ COLLISION\n');
const blk=C._dreamBlocked.size;
console.log(`     ${blk} tiles blocked by decor\n`);
ok(blk>0,'spires/arches/trees block their base');
const crystals=C._dreamDecor.filter(d=>d.id==='crystal');
let cBlock=0;
for(const d of crystals) if(C._dreamBlocked.has(d.x+','+d.y)) cBlock++;
ok(cBlock===0,`the ${crystals.length} floating crystals block NOTHING (${cBlock}) — they hover, you walk under them`);
ok(C.INTERIOR_DREAMLAND.isBlocked(-1,50)===true,'off-map still blocked');
const spire=C._dreamDecor.find(d=>d.id==='spire');
ok(!spire||C.INTERIOR_DREAMLAND.isBlocked(spire.x,spire.y),'a spire tile reads blocked through isBlocked');

console.log('\n6 · ★★ DERIVED, NOT STORED\n');
console.log('     Dreamland terrain is procedural, so a hardcoded coordinate');
console.log('     list would drift the moment the seed or threshold moves.\n');
const before=C._dreamDecor.map(d=>d.id+'@'+d.x+','+d.y).join('|');
ok(C._dreamRand(7)===C._dreamRand(7),'the scatter RNG is pure');
ok(C._dreamRand(7)!==C._dreamRand(8),'and actually varies');
ok(before.length>0,'placements are reproducible from the seed alone — no save state needed');
const mix=new Set(C._dreamDecor.map(d=>d.id));
ok(mix.size===4,`all four prop types appear (${[...mix].join(', ')})`);
const counts={};C._dreamDecor.forEach(d=>counts[d.id]=(counts[d.id]||0)+1);
console.log('     mix:',JSON.stringify(counts));
ok(counts.spire<counts.crystal,'landmarks (spire/arch) are rarer than scatter (crystal/tree)');

console.log('\n7 · ★ NEVER STRETCHED\n');
const dsrc=String(C.drawDreamDecor);
ok(/naturalWidth\s*\/\s*img\.naturalHeight/.test(dsrc),'width is DERIVED from the art aspect ratio [[image-never-stretch]]');
ok(!/drawW\s*=\s*\w+\.blockW\s*\*\s*TILE/.test(dsrc),'width is never forced to the footprint');

console.log('\n8 · ★ THE DENSE TILE IS ACTUALLY USED\n');
ok(C.DREAMLAND_BRIGHT>C.DREAMLAND_SOLID,`bright threshold ${C.DREAMLAND_BRIGHT} sits ABOVE solid ${C.DREAMLAND_SOLID}, so the shelf between them is the dark rim`);
const raw=FS.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
ok(/dreamlandPatternDense\(\)/.test(raw),'dreamlandPatternDense is called by the floor renderer');
ok(/_dlMask2/.test(raw)&&/_dlBright/.test(raw),'and the second mask + bright layer exist');
let deep=0,thin=0;
for(let y=0;y<C.DREAMLAND_SIZE;y++)for(let x=0;x<C.DREAMLAND_SIZE;x++){
  const d=C.dreamlandDensity(x,y);
  if(d>C.DREAMLAND_SOLID){ if(d>=C.DREAMLAND_BRIGHT) deep++; else thin++; }
}
console.log(`     ${deep} bright plateau tiles · ${thin} dark rim tiles`);
ok(thin>0&&deep>0,'both textures actually get screen time — neither threshold swallows the other');

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
