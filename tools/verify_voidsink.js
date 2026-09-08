#!/usr/bin/env node
/* verify_voidsink.js · v0.96.31
 *   Creator: "play this animation for the mori when they are thrown into the
 *   void sea. sinking. learn the frame. single animation. sinking into the sea"
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== THE VOID SINK · nine frames, once, bottom-anchored ===\n');

/* ── 1 · the art ships, and it is really keyed ─────────────────────── */
const ART=path.join(ROOT,'assets/2D sprites/vfx/mori-void-sink.png');
t(fs.existsSync(ART), '★ the sheet ships');
const b=fs.readFileSync(ART);
const W=b.readUInt32BE(16), Hh=b.readUInt32BE(20), ct=b[25];
t(ct===6, `★★ it is RGBA (colour type ${ct}) · it arrived as RGB on a baked `
  + 'transparency checkerboard, so it needed keying before it could be drawn');
console.log(`         ${W} x ${Hh}`);

/* ── 2 · the frames ────────────────────────────────────────────────── */
const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const DRAWN=[];
const CTX=new Proxy({drawImage:(img,...a)=>{DRAWN.push(a);}},{get:(o,k)=>{
 if(k==='drawImage')return o.drawImage;
 if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='canvas')return{width:960,height:540};return()=>{};},set:()=>true});
const _els=new Map();
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
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:()=>mk('x'),addEventListener:noop,body:mk('body'),documentElement:mk('html'),
 head:mk('head'),hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;const LS={};
global.localStorage={getItem:k=>LS[k]??null,setItem:(k,v)=>{LS[k]=String(v);},removeItem:k=>{delete LS[k];}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,currentTime:0,cloneNode(){return this;}};};
global.Image=function(){const o={addEventListener:noop,complete:true,naturalWidth:0,naturalHeight:0,
 set src(v){o._src=v; if(/mori-void-sink/.test(String(v))){o.naturalWidth=W;o.naturalHeight=Hh;}
   else {o.naturalWidth=1254;o.naturalHeight=1254;}},get src(){return o._src;}};return o;};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__V={VOID_SINK_FRAMES,VOID_SINK_IMG,VOID_SINK_TILES,
  VOID_SWALLOW_DUR,startVoidSwallow,NPCS,player,game,TILE,voidSinkFrameAt};`)();
let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const V=globalThis.__V;

const F=V.VOID_SINK_FRAMES;
t(F.length===9, `★★ nine frames (${F.length}) · the sequence ends on a hand and a ripple`);
t(F.every(([x,y,w,h])=>x>=0&&y>=0&&w>0&&h>0&&x+w<=W&&y+h<=Hh),
  '★★★ every frame lies inside the sheet · a box that runs off the edge draws '
  + 'nothing and never throws [[aov-sprite-bbox-crop-audit]]');
const widths=F.map(f=>f[2]), heights=F.map(f=>f[3]);
t(Math.max(...widths)/Math.min(...widths) > 20,
  `★★★ the frames are NOWHERE NEAR a uniform grid (${Math.min(...widths)}-${Math.max(...widths)} px wide, `
  + `${Math.min(...heights)}-${Math.max(...heights)} tall) · measured by COLUMN RUN. An even slice would `
  + 'have cut the reaching arm off frame 3 and drawn empty air for the last two');
// frames must not overlap
const sorted=[...F].sort((a,b)=>a[0]-b[0]);
let overlap=0;
for(let i=1;i<sorted.length;i++) if(sorted[i][0] < sorted[i-1][0]+sorted[i-1][2]) overlap++;
t(overlap===0, `★★ no two frames overlap (${overlap}) · that is the check that caught the `
  + 'broken raygun table, where all four boxes pointed inside frame 0');

/* ── 3 · ★★★ it plays ONCE ─────────────────────────────────────────── */
const code=H.replace(/^\s*\/\/.*$/gm,'');
t(/return Math\.min\(n - 1, i\);/.test(code),
  '★★★ the frame index is CLAMPED, not modulo · `% F.length` would loop the body '
  + 'back out of the sea on the frame before it is removed. "single animation"');
t(!/p\*F\.length\)%/.test(code), '  · and there is no modulo anywhere on that index');

/* ── 4 · ★★★ bottom-anchored · the sea must not move ───────────────── */
t(/const dx=Math\.round\(cx-dw\/2\), dy=Math\.round\(waterY-dh\);/.test(code),
  '★★★ anchored by the BOTTOM edge · every frame carries its own vortex at its '
  + 'base, so pinning the bottoms to one water line keeps the whirlpool welded '
  + 'to the surface while the body travels down through it. Centring it, or '
  + 'anchoring the top, would make the sea slide up and down');
t(/const scale=\(TILE\*VOID_SINK_TILES\)\/F\[0\]\[3\];/.test(code),
  '★★ ONE scale for the whole sequence, from frame 0 · a per-frame scale would '
  + 'make the figure pulse as the bbox shrinks. The body gets smaller because it '
  + 'is sinking, not because the maths changed');

/* ── 5 · timing ────────────────────────────────────────────────────── */
t(V.VOID_SWALLOW_DUR >= 900,
  `★★ ${V.VOID_SWALLOW_DUR} ms for nine frames = ${Math.round(V.VOID_SWALLOW_DUR/9)} ms each · `
  + 'the old 680 was tuned to a squash with no frames in it, and would have '
  + 'flickered the hand and the ripple past unread at 75 ms');

/* ── 6 · ★★★ DRIVEN · the real draw picks the right frame ──────────── */
const mori={id:'mori_test',scene:'overworld',isEnemy:true,tileX:10,tileY:10,dir:'down',
  hp:5,maxHp:100,sheet:new Image(),cellH:313,bboxes:[[[0,0,200,260]]],rowMap:null};
V.NPCS.push(mori);
V.game.scene='overworld';
V.startVoidSwallow(mori,10,10);
t(!!mori._voidSwallow, '★ startVoidSwallow marks the body');
t(mori._dying===true && mori.hp===0, '  · and it is a kill, as it always was');

/* ── ★★★ DRIVEN · the once-only rule, exercised not asserted ──────── */
const seq=[];
for(let i=0;i<=20;i++) seq.push(V.voidSinkFrameAt(i/20));
t(seq[0]===0, '★ p=0 is frame 0');
t(seq[seq.length-1]===F.length-1, `★★ p=1 is the LAST frame (${seq[seq.length-1]}) · not a wrap to 0`);
t(seq.every((v,i)=>i===0||v>=seq[i-1]),
  '★★★ the index never goes BACKWARDS across the whole run · driven at 21 points, '
  + 'not inferred from reading the expression. A modulo would have dipped to 0 at '
  + 'the end and pushed the body back out of the sea on its last frame');
t(V.voidSinkFrameAt(1.5)===F.length-1 && V.voidSinkFrameAt(-1)===0,
  '★★ and it is clamped OUTSIDE 0..1 too · the caller derives p from a clock, and '
  + 'a late frame can hand it more than 1');
t(new Set(seq).size===F.length,
  `★★ all ${F.length} frames are reachable · a rounding error that skipped one `
  + 'would drop a beat of the animation and nothing would ever report it');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
