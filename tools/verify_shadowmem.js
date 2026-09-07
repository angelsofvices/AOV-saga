#!/usr/bin/env node
/* verify_shadowmem.js · v0.96.25
 *
 *   Creator: "page goes unresponsive during this freeze bug btw"
 *
 * ★★★ Chrome's "Page Unresponsive" = the MAIN THREAD BLOCKED FOR SECONDS. The
 *   shadow silhouettes were offscreen canvases at the ART'S SOURCE RESOLUTION
 *   (up to 1264x1253), each built lazily on first sight under
 *   ctx.filter='blur(4px)' — while being DRAWN at ~144 px wide.
 *
 * ★★ Every shim in this project stubs the canvas, so the most expensive call in
 *   the frame was invisible to all ~190 suites. This one COUNTS PIXELS.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== SHADOW SILHOUETTES · pixels actually allocated ===\n');

const CANVASES=[];
const noop=()=>{};const _Q=[];let CLOCK=1000;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='canvas')return{width:960,height:540};return()=>{};},set:()=>true});
const _els=new Map();
function mkCanvas(){
  const o={ _w:0,_h:0, style:{}, dataset:{}, getContext:()=>CTX,
    get width(){return o._w;}, set width(v){ o._w=v; o._rec(); },
    get height(){return o._h;}, set height(v){ o._h=v; o._rec(); },
    _rec(){ if(o._w>0&&o._h>0&&!o._logged){ o._logged=true; CANVASES.push([o._w,o._h]); } },
    addEventListener:noop, removeEventListener:noop, appendChild:noop, remove:noop,
    setAttribute:noop, getAttribute:()=>null, querySelector:()=>null, querySelectorAll:()=>[],
    getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}) };
  return o;
}
const mk=id=>({id,style:{display:'none'},dataset:{},_buttons:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},pause:noop,
 play:()=>Promise.resolve(),load:noop,currentTime:0,
 querySelector:()=>mk(id),querySelectorAll(){return this._buttons;},
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
const elFor=id=>{if(!_els.has(id))_els.set(id,mk(id));return _els.get(id);};
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:(tag)=> tag==='canvas' ? mkCanvas() : mk('x'),
 addEventListener:noop,body:mk('body'),documentElement:mk('html'),head:mk('head'),
 hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;const LS={};
global.localStorage={getItem:k=>LS[k]??null,setItem:(k,v)=>{LS[k]=String(v);},removeItem:k=>{delete LS[k];}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,currentTime:0,cloneNode(){return this;}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:1254,naturalHeight:1254,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+';globalThis.__C={WORLD_PROPS,_castsShadow,_silhouette,SHADOW,TILE,SIL_MAX_PX};')();
let n=0;while(_Q.length&&n<400){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const C=globalThis.__C;

// ★ build EVERY silhouette the game can ever build
CANVASES.length=0;
const seen=new Set(); let built=0;
for (const p of C.WORLD_PROPS){
  if (!p) continue;
  let cast=false; try{ cast=C._castsShadow(p); }catch(_){ continue; }
  if (!cast || !p.bbox) continue;
  const k=`${p.src}|${p.bbox.join(',')}|${p.tileW}`;
  if (seen.has(k)) continue; seen.add(k);
  try { C._silhouette(p); built++; } catch(_){}
}
const px = CANVASES.reduce((s,[w,h])=>s+w*h, 0);
const mb = px*4/1048576;
const biggest = CANVASES.slice().sort((a,b)=>b[0]*b[1]-a[0]*a[1])[0] || [0,0];

console.log(`  built ${built} silhouettes · ${CANVASES.length} canvases`);
console.log(`  total ${(px/1e6).toFixed(2)} Mpx = ${mb.toFixed(1)} MB of RGBA`);
console.log(`  largest single: ${biggest[0]} x ${biggest[1]} = ${((biggest[0]*biggest[1])/1e6).toFixed(3)} Mpx\n`);

t(mb < 25,
  `★★★ the whole shadow cache fits in ${mb.toFixed(1)} MB · it was 558 MB of RGBA `
  + 'across 146 megapixels, allocated a canvas at a time as you ran into new '
  + 'prop types, each one filtered through blur(4px). That is what blocked the '
  + 'main thread hard enough for Chrome to offer "Exit Page"');
t(biggest[0]*biggest[1] < 120000,
  `★★★ the largest single silhouette is ${((biggest[0]*biggest[1])/1e6).toFixed(3)} Mpx · `
  + 'it was 1.58 Mpx (1264x1253) for a building drawn 144 px wide — seventy-six '
  + 'times the pixels needed, blurred, for every building in the game');
t(built > 80, `★ and it really did build them all (${built}) · a test that builds `
  + 'nothing proves nothing');

/* ── the drawn size is what decides it ─────────────────────────────── */
const code=H.replace(/^\s*\/\/.*$/gm,'');
t(/const drawW = Math\.max\(1, Math\.round\(\(p\.tileW \|\| 1\) \* TILE\)\);/.test(code),
  '★★ the silhouette is sized from the DRAWN width, not the source art');
t(/\|\$\{drawW\}`;/.test(code),
  '★★ and drawW is in the cache key · two props sharing art at different tile '
  + 'widths need different silhouettes, and sharing one would shrink a shadow');
t(/const SIL_MAX_PX = 400_000;/.test(code) && /if \(W \* H > SIL_MAX_PX\)/.test(code),
  '★ a hard ceiling as well · nothing may ever allocate a huge canvas here again');
t(/sil\.canvas\.width \/ SIL_RES, sil\.canvas\.height \/ SIL_RES\);/.test(code),
  '★★ the blit upscales a small silhouette · the GPU does that for free, and a '
  + 'shadow is a defocused black shape so there is no detail to lose');
t(/const SIL_RES = 0\.5;/.test(code) && /blur\(\$\{SHADOW\.blurPx \* SIL_RES\}px\)/.test(code),
  '★★★ half resolution, WITH THE BLUR RADIUS SCALED TO MATCH · scaling the '
  + 'canvas without scaling the blur would have doubled every shadow\'s softness');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
