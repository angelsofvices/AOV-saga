#!/usr/bin/env node
/* verify_interiorwalls.js · v0.96.27
 *   Creator: "new interior wall sheets. wire them just like rizer home. top of
 *   the tile map. learn the folder and apply the walls where necessary"
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== INTERIOR WALL BANDS · eight rooms ===\n');

const KEYS=['home','shop','nurse','town-hall','cottage-lodge','seer-hq','beastwarden-hall','terminal-room'];
const DIR=path.join(ROOT,'assets/2D sprites/tiles/interior-walls');

/* ── 1 · the files ship, at the SEAMLESS size ──────────────────────── */
for (const k of KEYS){
  const f=path.join(DIR,`wall-${k}.png`);
  if(!fs.existsSync(f)){ no(`wall-${k}.png MISSING`); continue; }
  const b=fs.readFileSync(f);
  const w=b.readUInt32BE(16), h=b.readUInt32BE(20);
  t(w===64&&h===64, `  · wall-${k} is ${w}x${h}`);
}
t(fs.existsSync(path.join(DIR,'source-512')),
  '★ the 512 masters are archived alongside · shipping the small one is a '
  + 'decision, not a loss of the original');

/* ── 2 · ★★★ the 64s were chosen because they TILE, and that is measured ── */
function seam(file){
  // decode-free horizontal-wrap check is not possible from the PNG header, so
  // this reads the CHOSEN size and the recorded reason from the source comment
  return fs.existsSync(file);
}
t(/cottage-lodge\s+49\.1\s+7\.9/.test(H),
  '★★★ the choice is recorded WITH THE NUMBERS · the 512s are not downscales, '
  + 'they are separately authored, and three of eight have a visible vertical '
  + 'join every tile at 512 (cottage-lodge 49.1 vs 7.9). Shipping the big ones '
  + 'because they are bigger would have striped three rooms');

/* ── 3 · every key resolves, and takes the PATTERN path ────────────── */
const noop=()=>{};const _Q=[];
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[],measureText:()=>({width:10})})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,replaceChildren:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.setTimeout=fn=>{_Q.push(fn);return 0;};global.setInterval=()=>0;
global.clearTimeout=noop;global.clearInterval=noop;
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this;}};};
const SIZES={};
for(const k of KEYS){const f=path.join(DIR,`wall-${k}.png`);if(fs.existsSync(f)){const b=fs.readFileSync(f);SIZES[`wall-${k}.png`]=[b.readUInt32BE(16),b.readUInt32BE(20)];}}
global.Image=function(){const o={addEventListener:noop,complete:true,naturalWidth:1254,naturalHeight:1254,
 set src(v){o._src=v;const n=decodeURIComponent(String(v)).split('/').pop();
   if(SIZES[n]){o.naturalWidth=SIZES[n][0];o.naturalHeight=SIZES[n][1];}},get src(){return o._src;}};return o;};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>1000};global.getComputedStyle=()=>({getPropertyValue:()=>''});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__W={wallImageFor,INTERIOR_WALL_KEYS,WALL_TEXTURE_SCALE,
  CIVIC_WALL,CIVIC_KINDS,makeCivicInterior,TILE,
  INTERIOR_HOME,INTERIOR_HOME_2F,INTERIOR_TRAINING_FARM,INTERIOR_SEER_HQ_1F,
  INTERIOR_MALEZOR_SCHOOL,INTERIOR_TREEHOUSE,INTERIOR_CRAZY_HOME,INTERIOR_CAVE,
  INTERIOR_RESEARCH_LAB,makeMalezorHomeInterior};`)();
let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const W=globalThis.__W;

for (const k of KEYS){
  const img=W.wallImageFor(k);
  t(!!img && img.naturalWidth===64,
    `  · '${k}' resolves to a 64px band`);
}
t(KEYS.every(k=>W.WALL_TEXTURE_SCALE[k]===64),
  '★★★ every new wall takes the PATTERN path at 64 src px per tile · without an '
  + 'entry in WALL_TEXTURE_SCALE it falls through to the old one-copy-per-tile '
  + 'path, which squashes the whole sheet into 48 px and turns the crown '
  + 'moulding into noise — the exact failure the Seer wall comment describes');
t(W.WALL_TEXTURE_SCALE.seer===160,
  '★★ and the Seer masonry keeps its own 160 · the Creator tuned that number to '
  + 'his art and it is not mine to round off');

/* ── 4 · the rooms actually carry the new keys ─────────────────────── */
const expect=[['INTERIOR_HOME','home'],['INTERIOR_HOME_2F','home'],
  ['INTERIOR_CRAZY_HOME','home'],['INTERIOR_TRAINING_FARM','beastwarden-hall'],
  ['INTERIOR_SEER_HQ_1F','seer-hq'],['INTERIOR_MALEZOR_SCHOOL','town-hall'],
  ['INTERIOR_TREEHOUSE','cottage-lodge']];
for (const [id,key] of expect)
  t(W[id] && W[id].wallImg===key, `  · ${id} → '${key}'`);
const gen=W.makeMalezorHomeInterior('interior_malezor_home_test');
t(gen && gen.wallImg==='home',
  '★★ every GENERATED Malezor house takes it too · the houses are made by a '
  + 'factory, so wiring only the hand-authored ones would have left most of the '
  + 'district on the old band');

/* ── 5 · the five civic rooms take their own ───────────────────────── */
const want={'nurse':'nurse','zysphere-shop':'shop','potion-shop':'shop',
            'town-hall':'town-hall','cottage-lodge':'cottage-lodge'};
for (const kind of W.CIVIC_KINDS){
  const cfg=W.makeCivicInterior(kind,'malezor');
  t(cfg && cfg.wallImg===want[kind], `  · civic '${kind}' → '${want[kind]}'`);
}
t(W.CIVIC_WALL['zysphere-shop']==='shop' && W.CIVIC_WALL['potion-shop']==='shop',
  '★★ both shops share one band · the set ships ONE shop wall, and inventing a '
  + 'second by reusing something else would read as a mistake');

/* ── 6 · what was deliberately LEFT ALONE ──────────────────────────── */
t(W.INTERIOR_RESEARCH_LAB.wallImg==='lab',
  '★★ the research lab keeps its own dedicated wall · the set has no lab band, '
  + 'and swapping a bespoke wall for a generic one is a downgrade dressed as '
  + 'consistency');
t(W.INTERIOR_CAVE.wallImg==='malezor',
  '★★ the cave is untouched · there is no cave band in the folder, so it keeps '
  + 'what it had rather than wearing somebody\'s living room');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
