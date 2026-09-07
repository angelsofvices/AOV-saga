#!/usr/bin/env node
/* verify_drawsafety.js · v0.96.21
 *
 *   Creator: "overworld freezes. music still plays."
 *
 * ★★★ THAT PAIRING IS THE WHOLE CLUE. A frozen picture with running audio is a
 *   RENDER that stopped, not a tab that hung: the <audio> element lives in the
 *   browser's media pipeline and does not care what the JS thread is doing.
 *
 * ★★★ AND MY HARNESS HAS BEEN BLIND TO THE MOST LIKELY CAUSE ALL SESSION.
 *   Every previous shim made `Image` report complete/1254x1254 and made the
 *   canvas a Proxy that swallows everything. A real browser THROWS
 *   InvalidStateError from drawImage() when handed an image that failed to
 *   load — and a 404'd image still reports `complete === true`, only with
 *   naturalWidth 0. So `if (img.complete)` passes and the draw throws.
 *
 * This shim tells the truth: images that are not on disk report width 0, and
 * drawImage validates like a canvas does.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== DRAW SAFETY · a broken image must not stop the picture ===\n');

/* ── 1 · static · every .complete guard must also check naturalWidth ── */
const code=H.replace(/^\s*\/\/.*$/gm,'');
const completeOnly=[...code.matchAll(/[^\n]*\.complete[^\n]*/g)]
  .map(m=>m[0])
  .filter(l=>!/naturalWidth|naturalHeight/.test(l))
  .filter(l=>/return|if *\(/.test(l));
t(completeOnly.length===0,
  `★★★ every .complete guard also checks naturalWidth (${completeOnly.length} that `
  + 'do not) · a 404\'d image reports complete === true with naturalWidth 0, so '
  + '`if (img.complete)` waves it straight through into a drawImage that throws');
completeOnly.slice(0,6).forEach(l=>console.log('         ' + l.trim().slice(0,110)));

/* ── 2 · ★★★ DRIVE IT · truthful images, validating canvas ─────────── */
const MISSING=new Set(), DREW=[], THREW=[];
const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;

// ★ a canvas that validates its arguments the way a browser's does
function drawImage(img, ...a){
  if (!img) throw new TypeError("drawImage: argument 1 is not an object");
  // ★★★ A CANVAS IS A LEGAL SOURCE AND HAS NO naturalWidth. My first cut of
  //   this validator threw on every canvas source and reported drawPropShadow
  //   as the freeze — a false positive that would have sent me rewriting
  //   working code. The browser's actual rule is: the source must have a
  //   non-zero intrinsic size, however that size is spelled.
  const isCanvas = img.getContext !== undefined || img.tagName === 'CANVAS';
  const w = isCanvas ? img.width  : img.naturalWidth;
  const h = isCanvas ? img.height : img.naturalHeight;
  if (!w || !h){
    const e=new Error(`InvalidStateError: drawImage on a zero-sized `
      + `${isCanvas?'canvas':'image'} (${img._src||'no src'}) ${w}x${h}`);
    e.name='InvalidStateError'; e._img=img; THREW.push(new Error().stack); throw e;
  }
  for (const v of a) if (typeof v==='number' && !Number.isFinite(v)){
    // per spec non-finite args are a silent no-op — recorded, not thrown
    DREW.push({src:img._src, nonFinite:true}); return;
  }
  DREW.push({src:img._src});
}
const CTX=new Proxy({drawImage},{get:(o,k)=>{
  if(k==='drawImage')return o.drawImage;
  if(k==='measureText')return()=>({width:10});
  if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
  if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
  if(k==='canvas')return{width:960,height:540};
  return()=>{};},set:()=>true});
const _els=new Map();
const mk=id=>({id,style:{display:'none'},dataset:{},_buttons:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},pause:noop,
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

// ★★★ TRUTHFUL IMAGES · on disk → real size · not on disk → complete but 0x0,
//     which is exactly what a browser reports for a 404.
const sizeOf = p => {
  try { const b=fs.readFileSync(p);
    if (b.slice(1,4).toString()==='PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
    return [1,1];
  } catch(_) { return null; }
};
global.Image=function(){
  const o={addEventListener:noop,complete:true,naturalWidth:0,naturalHeight:0,
    set src(v){ o._src=v;
      const rel=decodeURIComponent(String(v)).replace(/^\/+/,'');
      const s=sizeOf(path.join(ROOT,rel));
      if(s){ o.naturalWidth=s[0]; o.naturalHeight=s[1]; }
      else { MISSING.add(rel); o.naturalWidth=0; o.naturalHeight=0; }   // 404 shape
    }, get src(){return o._src;}};
  return o;};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'blob:x',revokeObjectURL:noop};
global.Blob=function(){};global.CustomEvent=function(t,o){return{type:t,...(o||{})};};
global.getComputedStyle=el=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;const ERR=[];
console.log=()=>{};console.warn=noop;console.error=(...a)=>ERR.push(a.map(String).join(' '));
new Function(src+`;globalThis.__C={player,game,NPCS,_frameBody,startNewGame,interiorConfig,
  set last(v){last=v;}};`)();
let n=0;while(_Q.length&&n<400){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const C=globalThis.__C;

t(MISSING.size===0,
  `★★★ every image the game asks for EXISTS ON DISK (${MISSING.size} missing) · `
  + 'a missing one is not a blank square, it is a throw');
[...MISSING].slice(0,10).forEach(m=>console.log('         MISSING · '+m));

/* ── 3 · run the real frame with a validating canvas ───────────────── */
function runScene(scene, label){
  const cfg = C.interiorConfig(scene);
  C.game.scene = scene;
  if (cfg && cfg.spawn){ C.player.x=cfg.spawn.x; C.player.y=cfg.spawn.y; }
  else { C.player.x=22; C.player.y=106; }
  C.last = CLOCK;
  const before = ERR.length;
  let raw = 0, first = null;
  for (let i=0;i<30;i++){ CLOCK+=16.7;
    try { C._frameBody(CLOCK); } catch(e){ raw++; if(!first) first=e; } }
  const named = ERR.slice(before).filter(e=>/frame step/.test(e));
  t(raw===0 && named.length===0,
    `★★ ${label} draws 30 frames against a VALIDATING canvas with no fault`);
  if (first){ console.log('         RAW · '+first.message);
    const st=(THREW[THREW.length-1]||'').split('\n').slice(1,7).join('\n');
    console.log('         WHERE ·\n'+st.replace(/^/gm,'           ')); }
  [...new Set(named)].slice(0,2).forEach(e=>console.log('         '+e.slice(0,190)));
}
C.startNewGame();
runScene('interior_home_2f', 'Rizer\'s room (the opening spawn)');
runScene('interior_home',    'home 1F');
runScene('overworld',        'the overworld');

t(DREW.length>0, `★ the validating canvas actually saw draws (${DREW.length}) · a test `
  + 'that never reaches drawImage proves nothing');
const nf = DREW.filter(d=>d.nonFinite);
t(nf.length===0, `★★ no draw was called with a non-finite coordinate (${nf.length}) · `
  + 'those are silent no-ops in a browser, so they do not crash — they just make '
  + 'art vanish with no error at all');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
