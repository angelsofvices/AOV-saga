#!/usr/bin/env node
/* verify_walkable_perf.js · v0.96.22
 *
 *   Creator: "another random freeze after dialouge. elarian"
 *   Creator: "overworld freezes. music still plays... started early this morning."
 *
 * ★★★ THE FREEZE WAS NEVER AN EXCEPTION. It is `walkable()` being O(NPCS), and
 *   `npcPathDir()` calling it 700 times for one NPC step. Measured before the
 *   fix: 47.2 ms PER PATHFIND — three whole frame budgets to move one character
 *   one tile. The renderer starves, the picture stops, and the music (decoded
 *   off-thread) plays on. Seven rounds of hunting a thrown error found nothing
 *   because nothing was ever thrown.
 *
 * ★★★ AND IT STARTED THIS MORNING BECAUSE v0.96.0 (09:52) — "the full census" —
 *   took the world to 2,013 NPCs. Every one joined the list walkable() walks.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== walkable() MUST BE O(1) IN ACTORS ===\n');

const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
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
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:1254,naturalHeight:1254,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.CustomEvent=function(t,o){return{type:t,...(o||{})};};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__C={player,game,NPCS,walkable,npcPathDir,
  rebuildNpcOccupancy,npcBlockingAt,stepNPCTo,
  WILD:(typeof WILD_ZYREX!=='undefined'?WILD_ZYREX:[]),
  occSize:()=>_npcOcc.size};`)();
let n=0;while(_Q.length&&n<400){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const C=globalThis.__C;

C.game.scene='overworld'; C.player.x=20; C.player.y=128;
C.rebuildNpcOccupancy();

t(C.NPCS.length > 1500,
  `★ the world really does hold ${C.NPCS.length} NPCs · this is the census v0.96.0 added`);
t(C.occSize() > 1500, `★ and all of them are indexed (${C.occSize()})`);

/* ── 1 · ★★★ THE COST ─────────────────────────────────────────────── */
const probe={tileX:21,tileY:128};
let r; const N=100;
const t0=process.hrtime.bigint();
for(let i=0;i<N;i++) r=C.npcPathDir(probe, 9, 3);
const ms=Number(process.hrtime.bigint()-t0)/1e6/N;
console.log(`\n  npcPathDir · ${ms.toFixed(2)} ms/call  (was 47.20 before the index)\n`);
t(ms < 16.7,
  `★★★ one pathfind costs less than a frame (${ms.toFixed(2)} ms) · at 47 ms it was `
  + 'THREE frame budgets to move one NPC one tile, and any actor that pathfinds '
  + 'after a conversation — Yara walking home from Elarion, a follower re-forming, '
  + 'an enemy re-aggroing — collapsed the frame rate to a slideshow');

/* ── 2 · the rebuild is paid ONCE, not per call ────────────────────── */
const t1=process.hrtime.bigint();
for(let i=0;i<200;i++) C.rebuildNpcOccupancy();
const rb=Number(process.hrtime.bigint()-t1)/1e6/200;
t(rb < 3, `★★ the whole index rebuilds in ${rb.toFixed(2)} ms · paid once a frame `
  + 'instead of 700 times per pathfind');

/* ── 3 · ★★★ CORRECTNESS · the index must agree with the old scan ──── */
//   A fast collision filter that disagrees with the one it replaced is a much
//   worse bug than the slowness. Check the ACTUAL npc positions.
let disagree=0, checked=0;
for (const npc of C.NPCS){
  if (!npc || npc.scene !== 'overworld' || npc.tileX == null) continue;
  if (npc._astralslamHeld || npc._astralthrowHeld) continue;
  if (npc._skellorDead) continue;               // looted-corpse rule tested below
  checked++;
  if (!C.npcBlockingAt('overworld', npc.tileX, npc.tileY)) disagree++;
  if (checked > 800) break;
}
t(disagree===0,
  `★★★ every blocking NPC is found at its own tile (${checked} checked, ${disagree} `
  + 'missed) · the index carries the EXACT conditions the two old scans used');

/* ── 4 · an empty tile is still empty ──────────────────────────────── */
let falsePos=0;
for (let x=-40; x<-20; x++) for (let y=200; y<220; y++){
  const hit=C.npcBlockingAt('overworld',x,y);
  if (hit && (hit.tileX!==x || hit.tileY!==y)) falsePos++;
}
t(falsePos===0, '★★ no tile reports an NPC that is not standing on it');

/* ── 5 · walking keeps the index exact ─────────────────────────────── */
const mover=C.NPCS.find(n=>n&&n.scene==='overworld'&&n.tileX!=null&&!n._skellorDead);
if (mover){
  const ox=mover.tileX, oy=mover.tileY;
  let nx=ox, ny=oy;
  for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    if (C.walkable(ox+dx, oy+dy) && !C.npcBlockingAt('overworld',ox+dx,oy+dy)){ nx=ox+dx; ny=oy+dy; break; }
  }
  if (nx!==ox || ny!==oy){
    C.stepNPCTo(mover, nx, ny, 'down');
    t(!!C.npcBlockingAt('overworld',nx,ny) && !C.npcBlockingAt('overworld',ox,oy),
      '★★★ stepNPCTo updates the index INCREMENTALLY · it is the funnel every '
      + 'walking NPC goes through, so the common case stays exact between rebuilds');
  }
}

/* ── 6 · the scans are actually gone from the code ─────────────────── */
const code=H.replace(/^\s*\/\/.*$/gm,'');
const wk=code.slice(code.indexOf('function walkable(x, y){'),
                    code.indexOf('function _walkableNpcScan_RETIRED'));
t(!/for \(const n of NPCS\)/.test(wk),
  '★★★ walkable() no longer walks NPCS at all');
t(!/for \(const w of WILD_ZYREX\)/.test(wk) && !/for \(const f of _fae\)/.test(wk),
  '★★ nor WILD_ZYREX nor _fae · all three per-call scans are indexed');
t(/try \{ invalidateNpcOccupancy\(\); \} catch\(_\)\{\}/.test(code),
  '★ the frame marks the index stale once a tick · the rebuild then happens on '
  + 'the first walkable() that needs it, so a frame that never asks never pays');
t(/if \(_npcOccDirty \|\| NPCS\.length !== _npcOccCount\) rebuildNpcOccupancy\(\);/.test(code),
  '★★★ and it SELF-HEALS · walkable() is called from spawn placement, the NPC '
  + 'sanitiser and world generation, none of which run inside _frameBody. My '
  + 'first cut rebuilt only at the top of the frame, so all of those saw an '
  + 'EMPTY index and placed actors on top of each other — caught by '
  + 'verify_devspawn and verify_qol going red');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
