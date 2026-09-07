#!/usr/bin/env node
/* verify_counters.js · v0.96.18
 *   Creator: "counters: farm, nurse, potion shop, townhall, zysphere store.
 *   place at top of floor in respective building"
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
const src=fs.readFileSync('/tmp/all.js','utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== CIVIC COUNTERS · art, placement, aspect ===\n');

/* ── 1 · the files are on disk and are really transparent ─────────── */
const KINDS=['nurse','zysphere-shop','potion-shop','town-hall','cottage-lodge'];
const DIR=path.join(ROOT,'assets/2D sprites/decor/counters');
let allThere=true;
for(const k of KINDS){
  const f=path.join(DIR,`counter-${k}.png`);
  if(!fs.existsSync(f)){ allThere=false; no(`counter-${k}.png MISSING`); }
}
t(allThere, `★ all ${KINDS.length} counter PNGs are on disk`);
// PNG header · width/height straight out of IHDR, and the colour type
for(const k of KINDS){
  const f=path.join(DIR,`counter-${k}.png`);
  if(!fs.existsSync(f)) continue;
  const b=fs.readFileSync(f);
  const w=b.readUInt32BE(16), h=b.readUInt32BE(20), ct=b[25];
  const tall=(7*h/w);
  t(ct===6, `  · counter-${k} is RGBA (colour type ${ct}) · these arrived already `
    + 'cut out, so no green key pass was run — checked rather than assumed');
  t(tall>3 && tall<6, `  · counter-${k} ${w}x${h} → ${tall.toFixed(2)} tiles tall at the shared 7 wide`);
}

/* ── 2 · ★★★ the height is DERIVED, never the old constant ────────── */
t(/CIVIC_COUNTER\.w \* im\.naturalHeight \/ im\.naturalWidth/.test(H),
  '★★★ artH is computed from the loaded image · the constant said every counter '
  + 'was 3.5 tiles and the real art runs 3.76 to 5.11, so a single number would '
  + 'have squashed all five by five different amounts '
  + '([[image-never-stretch-console-fullscreen]])');
t(/let drawH = Math\.round\(drawW \* natH \/ natW\);/.test(H),
  '★★ and the draw keeps the aspect too · one derived height is no use if the '
  + 'blit stretches it back');
t(/drawW = Math\.round\(drawW \* maxH \/ drawH\);/.test(H),
  '★★★ the overhang cap scales WIDTH WITH HEIGHT · capping height alone would '
  + 'have squashed the potion shop by 20% and been exactly the stretch this '
  + 'whole path exists to avoid');
t(/const COUNTER_MAX_OVERHANG = 1\.1;/.test(H),
  '★★ one tile of overhang above row 0, as a named constant · the stairs already '
  + 'set that precedent with visY = -1');

/* ── 3 · placement · TOP of the floor, bottom edge on the barrier ─── */
t(/const dy = Math\.round\(\(slot\.y \+ 1\) \* TILE - drawH\) - _cam\.y;/.test(H),
  '★★★ the counter BOTTOM rests on the bottom of its blocked row · anchoring by '
  + 'the top would float the face a tile above the barrier on the two tallest '
  + 'counters and leave a gap you can see through');
t(/row: 2/.test(H) && /CIVIC_COUNTER = \{ w: 7, row: 2/.test(H),
  '★ row 2 of 11 (and of 13) · the upper third, as asked');

/* ── 4 · drawn between the rug and the stairs ─────────────────────── */
const rugAt=H.indexOf('WELCOME rug decor');
const cntAt=H.indexOf('THE CIVIC COUNTER');
const stAt =H.indexOf('Staircase decor · draws the 2x3-tile sprite');
t(rugAt>0 && cntAt>rugAt && stAt>cntAt,
  '★★ drawn AFTER the rug and BEFORE the stairs · it sits on the floor the room '
  + 'was decorated with rather than under it');

/* ── 5 · one image per room, loaded once ──────────────────────────── */
const loads=(H.match(/assets\/2D sprites\/decor\/counters\/counter-\$\{_k\}\.png/g)||[]).length;
t(loads===1, `★ ONE templated loader for all five (${loads}) · five hand-written `
  + 'Image() lines is five chances to typo a path that fails silently');

/* ── 6 · it actually resolves in a booted game ────────────────────── */
const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='getImageData')return()=>({data:[],width:0,height:0});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
const _els=new Map();
const mk=id=>({id,style:{display:'none'},dataset:{},_buttons:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},
 querySelector:()=>mk(id),querySelectorAll(){return this._buttons;},
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
const elFor=id=>{if(!_els.has(id))_els.set(id,mk(id));return _els.get(id);};
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:()=>mk('x'),addEventListener:noop,body:mk('body'),documentElement:mk('html'),
 head:mk('head'),hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,cloneNode(){return this;}};};
// ★ the shim reports the REAL file size for counters, so artH is measured for real
const SIZES={};
for(const k of KINDS){ const f=path.join(DIR,`counter-${k}.png`);
  if(fs.existsSync(f)){ const b=fs.readFileSync(f); SIZES[`counter-${k}.png`]=[b.readUInt32BE(16),b.readUInt32BE(20)]; } }
global.Image=function(){const o={addEventListener:noop,complete:true,naturalWidth:1254,naturalHeight:1254,
 set src(v){ this._src=v; const n=decodeURIComponent(String(v)).split('/').pop();
   if(SIZES[n]){ o.naturalWidth=SIZES[n][0]; o.naturalHeight=SIZES[n][1]; } },
 get src(){return this._src;}}; return o;};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>CLOCK};
global.getComputedStyle=el=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__C={COUNTER_IMGS,civicCounterSlot,CIVIC_ROOMS,CIVIC_KINDS,
 CIVIC_COUNTER,makeCivicInterior,civicCounterAt};`)();
let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const C=globalThis.__C;

t(Object.keys(C.COUNTER_IMGS).length===5,
  `★ five counter images registered (${Object.keys(C.COUNTER_IMGS).length})`);
t(C.CIVIC_KINDS.every(k=>C.COUNTER_IMGS[k]),
  '★★★ EVERY civic room has art · a room in CIVIC_ROOMS with no counter draws an '
  + 'invisible wall, which is the worst of both');
for(const k of C.CIVIC_KINDS){
  const slot=C.civicCounterSlot(k);
  const R=C.CIVIC_ROOMS[k];
  t(slot && slot.w===7, `  · ${k} slot is 7 wide`);
  t(slot && slot.x>=0 && slot.x+slot.w<=R.cols,
    `  · ${k} counter fits inside the room (x=${slot.x}, room ${R.cols} wide)`);
  t(slot && Math.abs(slot.artH-3.5)>0.01,
    `  · ${k} artH=${slot.artH.toFixed(2)} · measured, not the 3.5 placeholder`);
  // the blocked row must actually exist under the art
  const onRow=R.blocked.filter(([x,y])=>y===slot.y);
  t(onRow.length>=5,
    `  · ${k} has ${onRow.length} solid tiles on row ${slot.y} · the art is backed by a real barrier`);
}
console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
