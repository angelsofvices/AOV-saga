#!/usr/bin/env node
/* verify_dracolord_arches.js · v0.96.37
 *   Creator: "6 archways in dreamland... take rizer to different parts of the
 *   cosmos... the 6 dracolords... each dracolord at the end of each inner level."
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== THE SIX ARCHWAYS ===\n');

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
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__D={DRACOLORD_DOMAINS,dracolordArchTile,dracolordArchAt,
 DRACOLORD_ARCH_RADIUS,enterDracolordRealm,leaveDracolordRealm,dracolordRealmScene,
 buildDreamlandDecor,DREAMLAND_SIZE,DREAMLAND_SCENE,INTERIOR_DREAMLAND,dreamlandSolid,
 tickDreamland,player,game,decor:()=>_dreamDecor,blocked:()=>_dreamBlocked};`)();
let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const D=globalThis.__D;

/* ── 1 · six domains, six Dracolords, canon typing ─────────────────── */
t(D.DRACOLORD_DOMAINS.length===6, `★ six domains (${D.DRACOLORD_DOMAINS.length})`);
const CANON={aetherion:'Divine/Aura',abominalys:'Divine/Beast',
  aethravax:'Divine/Aura/Draconic',alphaea:'Divine/Aura/Spirit',
  azyrath:'Divine/Unknown/Spirit',abyssion:'Divine/Unknown/Draconic'};
const wrong=D.DRACOLORD_DOMAINS.filter(d=>CANON[d.id]!==d.types);
t(wrong.length===0,
  `★★★ every typing matches the locked Dracolord canon (${wrong.length} wrong) · `
  + 'these are the SIX SURVIVORS of the First Ancient War and their types are '
  + 'what decides what each realm looks like [[aov-dracolords-immortals]]');
t(D.DRACOLORD_DOMAINS.every(d=>d.realm && d.line && d.tint),
  '★ each carries a realm name, a tint and an opening line');

/* ── 2 · ★★ the ring · findable from a centre spawn ────────────────── */
D.buildDreamlandDecor();
const c=Math.floor(D.DREAMLAND_SIZE/2);
const tiles=D.DRACOLORD_DOMAINS.map((_,i)=>D.dracolordArchTile(i));
t(tiles.every(p=>p.x>1 && p.y>1 && p.x<D.DREAMLAND_SIZE-2 && p.y<D.DREAMLAND_SIZE-2),
  '★★ all six sit inside the plane with room for a three-tile span');
const rad=tiles.map(p=>Math.hypot(p.x-c,p.y-c));
//   ★ THE RING IS AN INTENTION, NOT A CIRCLE. Dreamland's terrain is procedural
//     and two of the six had to snap off the ideal arc to find ground that could
//     hold a door. My first threshold demanded 1.5 tiles of spread, which asked
//     the arithmetic to beat the terrain. What actually matters is that they are
//     all roughly the same walk away and spread around you by ANGLE — so you can
//     pick a direction and find one.
t(Math.min(...rad) > 16 && Math.max(...rad) < 30,
  `★★★ all six sit ${Math.min(...rad).toFixed(0)}-${Math.max(...rad).toFixed(0)} tiles from the spawn · far enough that `
  + 'reaching one is a decision, close enough that a low-level Rizer on a short '
  + 'clock can still get to one');
const angs=tiles.map(p=>Math.atan2(p.y-c,p.x-c)).sort((a,b)=>a-b);
const gaps=angs.map((a,i)=>{ const nx=angs[(i+1)%6]+(i===5?Math.PI*2:0); return nx-a; });
t(Math.min(...gaps) > 0.6,
  `★★★ and they are spread around you by ANGLE (smallest gap ${(Math.min(...gaps)*57.3).toFixed(0)}°) · `
  + 'the six are the only navigable landmarks on a hundred tiles of identical '
  + 'cloud. A random scatter would make finding one luck; this means you pick a '
  + 'direction and walk');
t(tiles.every(p=>D.dreamlandSolid(p.x,p.y)),
  '★★ every arch stands on solid cloud · one over a gap is a door to nowhere');

/* ── 3 · ★★★ SIX, and only six ─────────────────────────────────────── */
const arches=D.decor().filter(o=>o.id==='arch');
t(arches.length===6,
  `★★★ Dreamland contains exactly SIX arches (${arches.length}) · the arch was `
  + 'previously scatterable decor with weight 1, so the plane had anonymous '
  + 'arches leading nowhere. An arch that opens on nothing standing beside one '
  + 'that opens on a Demigod is a promise the game cannot keep');
t(arches.every(a=>!!a.domain), '★★ and every one of them carries a domain');
const ids=new Set(arches.map(a=>a.domain.id));
t(ids.size===6, `★ all six are distinct (${ids.size})`);

/* ── 4 · you can walk up to one ────────────────────────────────────── */
let blockedApproach=0;
for(const p of tiles){
  const below=`${p.x},${p.y+1}`;
  if(D.blocked().has(below) || !D.dreamlandSolid(p.x,p.y+1)) blockedApproach++;
}
t(blockedApproach===0,
  `★★★ every doorway has clear ground in front of it (${blockedApproach} blocked) · `
  + 'the scatter runs AFTER the ring and is forbidden within 3 tiles of one, '
  + 'because a spire parked in a doorway is a door that does not exist');

/* ── 5 · the door span is three tiles wide ─────────────────────────── */
const p0=tiles[0];
t(D.dracolordArchAt(p0.x,p0.y) && D.dracolordArchAt(p0.x-1,p0.y) && D.dracolordArchAt(p0.x+1,p0.y),
  '★★ X works across the WHOLE three-tile arch, not just its centre pixel · the '
  + 'art is three wide and the hitbox should be the thing you can see');
t(!D.dracolordArchAt(p0.x+2,p0.y), '  · and stops at the edge of it');

/* ── 6 · ★★★ THE CLOCK STOPS AT THE THRESHOLD ──────────────────────── */
D.game.scene=D.DREAMLAND_SCENE;
D.player.x=p0.x; D.player.y=p0.y+1;
D.player._dreamEndsAt = CLOCK + 12000;          // 12s left on the plane
const dom=D.DRACOLORD_DOMAINS[0];
D.enterDracolordRealm(dom);
t(D.game.scene===D.dracolordRealmScene(dom.id), `★ stepping through enters ${D.game.scene}`);
t(D.player._dreamEndsAt===0,
  '★★★ THE CLOCK STOPS · seconds = Rizer level, so a Lv40 Rizer has FORTY '
  + 'SECONDS, which cannot hold a realm crossing plus a Demigod. Past an arch '
  + "you are on the Dracolord's time");
CLOCK += 500000;                                 // spend eight minutes inside
D.tickDreamland();
t(D.game.scene===D.dracolordRealmScene(dom.id),
  '★★★ and eight minutes inside does NOT wake you · tickDreamland returns early '
  + 'off the cloud plane, so the timeout cannot fire in a realm. The ruling is '
  + 'enforced in the one place that could break it');

/* ── 7 · ★★ shelter, not a refill ──────────────────────────────────── */
D.leaveDracolordRealm();
t(D.game.scene===D.DREAMLAND_SCENE, '★ stepping back out returns to the plane');
const left=(D.player._dreamEndsAt-CLOCK)/1000;
t(left > 11 && left < 13,
  `★★★ you come out with the ${left.toFixed(1)}s you went in with · an arch is SHELTER, `
  + 'not a refill. Handing back a full clock would make the plane\'s timer '
  + 'meaningless the moment a player learned to step in and out');
t(D.player.y===p0.y+1 && D.player.x===p0.x, '★ and you step out BELOW the arch, not inside it');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
