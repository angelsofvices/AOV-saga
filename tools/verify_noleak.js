#!/usr/bin/env node
/* verify_noleak.js · v0.96.21
 *
 *   Creator: "overworld freezes. music still plays. ruining the opening story
 *   loops. started happening early this morning."
 *
 * ★★★ THE PAIRING AGAIN. A frozen picture with running audio is a stalled
 *   RENDER. One way to stall a render without throwing anything is to make the
 *   engine spend its whole budget in garbage collection — and the way you do
 *   that by accident is an array that only ever grows.
 *
 * ★ "During the OPENING LOOPS" is the tell: a leak is a function of TIME PLAYED,
 *   and the opening is the longest uninterrupted stretch in the game.
 *
 * This runs thousands of real frames and asserts nothing grows without bound.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== UNBOUNDED GROWTH · nothing may grow forever ===\n');

const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
const _els=new Map();
let DOM_NODES=0;
const mk=id=>({id,style:{display:'none'},dataset:{},_buttons:[],_kids:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild(c){DOM_NODES++;this._kids.push(c);},
 removeChild(c){DOM_NODES--;},addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove(){DOM_NODES--;},replaceChildren:noop,cloneNode(){return mk(id);},pause:noop,
 play:()=>Promise.resolve(),load:noop,
 querySelector:()=>mk(id),querySelectorAll(){return this._buttons;},
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
const elFor=id=>{if(!_els.has(id))_els.set(id,mk(id));return _els.get(id);};
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:()=>mk('x'),addEventListener:noop,body:mk('body'),documentElement:mk('html'),
 head:mk('head'),hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;
const LS={};
global.localStorage={getItem:k=>LS[k]??null,setItem:(k,v)=>{LS[k]=String(v);},removeItem:k=>{delete LS[k];}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,cloneNode(){return this;}};};
const sizeOf=p=>{try{const b=fs.readFileSync(p);
  if(b.slice(1,4).toString()==='PNG')return[b.readUInt32BE(16),b.readUInt32BE(20)];return[1,1];}catch(_){return null;}};
global.Image=function(){const o={addEventListener:noop,complete:true,naturalWidth:0,naturalHeight:0,
  set src(v){o._src=v;const rel=decodeURIComponent(String(v)).replace(/^\/+/,'');
    const s=sizeOf(path.join(ROOT,rel));if(s){o.naturalWidth=s[0];o.naturalHeight=s[1];}},
  get src(){return o._src;}};return o;};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.CustomEvent=function(t,o){return{type:t,...(o||{})};};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__C={player,game,NPCS,WORLD_PROPS,_frameBody,startNewGame,
  set last(v){last=v;}, G:()=>globalThis};`)();
let n=0;while(_Q.length&&n<400){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const C=globalThis.__C;

C.startNewGame();
C.game.scene='overworld'; C.player.x=22; C.player.y=106;
C.last=CLOCK;

// ★ snapshot every array/Map/Set reachable on globalThis, plus the big ones
function snapshot(){
  const s={};
  for (const k of Object.getOwnPropertyNames(globalThis)){
    let v; try { v=globalThis[k]; } catch(_){ continue; }
    if (Array.isArray(v)) s['[]'+k]=v.length;
    else if (v instanceof Map || v instanceof Set) s['{}'+k]=v.size;
  }
  s['DOM']=DOM_NODES;
  return s;
}
function run(k){ for(let i=0;i<k;i++){ CLOCK+=16.7; try{ C._frameBody(CLOCK); }catch(_){} } }

run(600);                       // warm up · caches fill, pools settle
const a=snapshot();
run(6000);                      // ~100 seconds of play
const b=snapshot();

const grew=[];
for (const k in b){
  const d=(b[k]||0)-(a[k]||0);
  // ★ a cache that fills once is fine; something that tracks frames is not
  if (d > 200) grew.push([k, a[k], b[k], d]);
}
t(grew.length===0,
  `★★★ nothing grew unboundedly across 6,000 frames (${grew.length} did) · an `
  + 'array that only ever grows turns into a GC stall, and a GC stall is a '
  + 'frozen picture with the music still running');
grew.sort((x,y)=>y[3]-x[3]);
for (const [k,x,y,d] of grew.slice(0,12)) console.log(`         ${k}: ${x} → ${y}  (+${d})`);

// ★ heap, measured rather than inferred
if (global.gc) global.gc();
const h0=process.memoryUsage().heapUsed;
run(6000);
if (global.gc) global.gc();
const h1=process.memoryUsage().heapUsed;
const mb=(h1-h0)/1048576;
console.log(`\n  heap after another 6,000 frames: ${mb>=0?'+':''}${mb.toFixed(1)} MB`);
t(mb < 40, `★★ heap growth over 6,000 frames stays modest (${mb.toFixed(1)} MB) · `
  + 'a real leak shows here as a straight line up');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
