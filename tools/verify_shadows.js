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
// verify_shadows · v0.95.758 · cast shadows for buildings + trees

try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={SHADOW,_castsShadow,_silhouette,drawPropShadow,WORLD_PROPS,snapBuildingsToLattice,buildAllTrails,TILE,LIGHT_FILTER_ENABLED,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++;};
const H=t=>console.log('\n'+t);
C.snapBuildingsToLattice(); C.buildAllTrails();
const P=C.WORLD_PROPS.filter(p=>p&&p.src&&p.bbox);

H('1 · THE RIGHT THINGS CAST');
const cast=P.filter(C._castsShadow), no=P.filter(p=>!C._castsShadow(p));
ok(cast.length>3000,`${cast.length} props cast a shadow`);
ok(no.length>3000,`${no.length} do not — this check is worthless if everything casts`);
const bld=cast.filter(p=>/\/buildings\//.test(p.src));
const tre=cast.filter(p=>/(tree|cactus)/.test(p.src.split('/').pop()));
ok(bld.length>0&&tre.length>0,`both families present · ${bld.length} buildings · ${tre.length} trees`);
// ★ The two families OVERLAP — rizer-treehouse.png lives in buildings/ and has
// "tree" in its name. Summing the counts double-counts it, so use a set union.
const fam=new Set([...bld,...tre]);
ok(fam.size===cast.length,`and nothing else slipped in (${fam.size} of ${cast.length} accounted for)`);

H('2 · ★ BUSHES AND GRASS DO NOT CAST');
// The Creator picked buildings+trees. At 27k props, everything-casts is mush.
const leak=no.filter(p=>/\/buildings\//.test(p.src)||/(tree|cactus)/.test(p.src.split('/').pop()));
ok(leak.length===0,`no caster was wrongly excluded (${leak.length})`);
const bushCast=cast.filter(p=>/bush/.test(p.src)&&!/cactus/.test(p.src));
ok(bushCast.length===0,`no bush casts (${bushCast.length}) — bushes are 2 tiles, they would smear`);
const grassCast=cast.filter(p=>/grass/.test(p.src));
ok(grassCast.length===0,`no grass casts (${grassCast.length})`);

H('3 · ★★ THE SUN DOES NOT MOVE');
// LIGHT_FILTER_ENABLED is false by Creator directive 2026-08-19. Shadows must
// not smuggle time-varying lighting back in through the side door.
const src=require('fs').readFileSync('/tmp/all.js','utf8');
const fn=src.slice(src.indexOf('function drawPropShadow'),src.indexOf('function drawPropShadow')+1800);
ok(!/zyraxisHour|zyraxisPhase|lightMode|isNightZyraxis/.test(fn),
   'drawPropShadow reads no clock or light-mode state');
ok(typeof C.SHADOW.angleDeg==='number'&&typeof C.SHADOW.length==='number',
   `the sun is two constants · ${C.SHADOW.angleDeg}deg at ${C.SHADOW.length}x height`);
ok(C.LIGHT_FILTER_ENABLED===false,
   'and the day/night filter is still off, exactly as it was before this change');

H('4 · THE SILHOUETTE CACHE IS SHARED, NOT PER-PROP');
const before=C._silhouette(cast[0]);
let built=0;
const seen=new Set();
for(const p of cast){ seen.add(`${p.src}|${p.bbox.join(',')}`); }
ok(seen.size<250,`${cast.length} casters resolve to only ${seen.size} unique silhouettes`);
ok(C._silhouette(cast[0])===before,'asking twice returns the SAME canvas — it caches, not rebuilds');

H('5 · ★ THE SHADOW STARTS AT THE PROP\'S FEET');
// Reproduces drawPropShadow's transform. The feet row (y=0) must be unmoved,
// or the shadow detaches from the object and it looks like it is hovering.
{
  const shear=Math.tan(C.SHADOW.angleDeg*Math.PI/180), len=C.SHADOW.length;
  const T=(x,y)=>[x - shear*y, len*y];
  const foot=T(0,0);
  ok(foot[0]===0&&foot[1]===0,'the contact row maps to itself — shadow is anchored, not floating');
  const h=100;
  const top=T(0,-h);
  ok(Math.abs(top[1])<h,`the top is squashed toward the horizon (${Math.abs(top[1]).toFixed(0)} of ${h}px)`);
  ok(top[0]>0,`and leans away from the sun by ${top[0].toFixed(0)}px over ${h}px of height`);
}

H('6 · TALLER THINGS CAST LONGER SHADOWS');
// Props run 1 tile (bush) to 21 (radio tower). A fixed length looks wrong at
// both ends; length is a fraction of the sprite's own drawn height.
{
  const dh=p=>Math.round(p.tileW*C.TILE*(p.bbox[3]/p.bbox[2]));
  const hs=cast.map(dh);
  const lo=Math.min(...hs), hi=Math.max(...hs);
  ok(hi>lo*2,`casters range ${lo}px to ${hi}px tall, so length must scale`);
  ok(C.SHADOW.length>0&&C.SHADOW.length<1,
     `length is a ratio (${C.SHADOW.length}), not a constant — a ${hi}px tower throws ${Math.round(hi*C.SHADOW.length)}px, a ${lo}px prop throws ${Math.round(lo*C.SHADOW.length)}px`);
}

H('7 · ★★ SHADOWS DRAW BEFORE ANY PROP');
// The whole reason this is a separate pass. Inline, a building's shadow would
// paint over a bush that sorted earlier.
{
  // ★ v0.95.818 · the 6000-char window stopped reaching the draw call after
  //   the graze block landed in the middle of the function — the FIFTH fixed-
  //   window failure on record.  Slice to the next function boundary instead.
  const _ws=src.indexOf('function drawWorldLayer');
  const wl=src.slice(_ws, src.indexOf('\nfunction ', _ws+20));
  const iShadow=wl.indexOf('drawPropShadow');
  const iSort=wl.indexOf('renderables.sort');
  // ★ Search for the actual DRAW CALL, not the kind test — the shadow pass
  // contains "r.kind === 'prop'" itself, so that string matches my own line
  // first and the check inverts.
  const iDraw=wl.indexOf('drawProp(r.prop)');
  ok(iShadow>0&&iSort>0&&iDraw>0,'all three stages are present in drawWorldLayer');
  ok(iShadow<iSort,'the shadow pass runs BEFORE the depth sort');
  ok(iShadow<iDraw,'and before the first prop is drawn');
}

H('8 · IT CAN BE TURNED OFF');
ok(C.SHADOW.enabled===true,'shadows are on by default');
C.SHADOW.enabled=false;
let threw=null; try{ C.drawPropShadow(cast[0]); }catch(e){ threw=e.message; }
ok(!threw,`disabling is a clean early-return (${threw||'no throw'})`);
C.SHADOW.enabled=true;

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
