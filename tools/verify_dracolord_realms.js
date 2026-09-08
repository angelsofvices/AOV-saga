#!/usr/bin/env node
/* verify_dracolord_realms.js · v0.96.38
 *
 * ★★★ THE SIX INNER LEVELS.
 *   Creator: "each dracolord will sit at the END of each inner level."
 *
 *   v0.96.37 shipped the six ARCHES and nothing behind them: the scene id had
 *   no config, enterDracolordRealm() left the player on his Dreamland tile
 *   (~28,28) inside a 15x44 corridor, and leaveDracolordRealm() was defined and
 *   bound to no input at all. Stepping through a door led out of the map, and
 *   there was no way back but a page reload.
 *
 * ★★★ WHAT THIS SUITE IS ACTUALLY FOR: the arch ring had to spiral-search for
 *   legal ground because procedural cloud carves holes wherever it likes. A
 *   Dracolord standing behind a severed causeway is the same failure and it
 *   looks IDENTICAL to a working one — you just walk until you cannot. So the
 *   headline assertion here is a BFS from the arrival tile to the throne, run
 *   for all six domains, every row of every corridor.
 *
 * ★★ RULING 2 IS ALSO A TEST. They judge, they do not fight — Dracolords are
 *   T9 and Rizer's ceiling is T8 ([[aov-dracolords-immortals]]). A battle call
 *   in this code path would be a canon break, so its ABSENCE is asserted
 *   against the code, not the prose.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== LOAD RESCUE · no save may land you outside the world ===\n');
const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='createPattern')return()=>({});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='createImageData')return(w,h)=>({data:new Uint8ClampedArray(Math.max(1,w*h*4)),width:w,height:h});
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
new Function(src+`;globalThis.__D={game,player,DRACOLORD_DOMAINS,dracolordRealmConfig,
 dracolordRealmScene,dracolordRealmSolid,dracolordRealmDensity,dracolordGateAt,
 dracolordBodyAt,currentDracolordRealm,isDreamScene,enterDracolordRealm,
 leaveDracolordRealm,tickDracolordRealm,dracolordAudience,dracolordSeen,interiorConfig,
 DRACOLORD_REALM_W,DRACOLORD_REALM_H,DRACOLORD_REALM_CX,DRACOLORD_REALM_SPINE,
 DRACOLORD_THRONE_Y,DRACOLORD_ARRIVE_Y,DRACOLORD_GATE_Y,DRACOLORD_AUDIENCE_Y,
 DREAMLAND_SCENE,drawDracolordPresence,drawDracolordGate,
 dlg:()=>dialogState,clearDlg:()=>{dialogState=null;}};`)();
let n=0;while(_Q.length&&n<400){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const D=globalThis.__D;
const drain=()=>{let k=0;while(_Q.length&&k<300){const f=_Q.shift();k++;try{f();}catch(_){}}};
const CX=Math.round(D.DRACOLORD_REALM_CX);

/* ── 1 · ★★★ EVERY CAUSEWAY IS WALKABLE END TO END ─────────────────── */
for(const d of D.DRACOLORD_DOMAINS){
  const cfg=D.dracolordRealmConfig(d.id);
  if(!cfg){t(false,`${d.id} has a config`);continue;}
  const W=D.DRACOLORD_REALM_W,H=D.DRACOLORD_REALM_H;
  const seen=new Set(),q=[[cfg.spawn.x,cfg.spawn.y]];seen.add(cfg.spawn.x+','+cfg.spawn.y);
  while(q.length){const [x,y]=q.shift();
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;
      if(nx<0||ny<0||nx>=W||ny>=H)continue;const k=nx+','+ny;if(seen.has(k))continue;
      if(cfg.isBlocked(nx,ny))continue;seen.add(k);q.push([nx,ny]);}}
  t(seen.has(CX+','+(D.DRACOLORD_THRONE_Y+1)),
    `★★★ ${d.lord.padEnd(11)} · you can WALK from the gate to the throne (${seen.size} tiles)`);
  // the guarantee that makes the above true by construction, not by luck
  let spine=true;
  for(let y=0;y<H;y++)for(let dx=-D.DRACOLORD_REALM_SPINE;dx<=D.DRACOLORD_REALM_SPINE;dx++)
    if(!D.dracolordRealmSolid(d,CX+dx,y))spine=false;
  t(spine,`    ${d.lord.padEnd(11)} · spine solid at all ${H} rows`);
  // and there IS void beside it · a corridor with no edge is just a room
  let anyVoid=false;
  for(let y=2;y<H-2;y++){if(!D.dracolordRealmSolid(d,0,y)||!D.dracolordRealmSolid(d,W-1,y))anyVoid=true;}
  t(anyVoid,`    ${d.lord.padEnd(11)} · the causeway has edges to fall off`);
}

/* ── 2 · ★ ENTERING PUTS YOU SOMEWHERE THAT EXISTS (the v0.96.37 bug) ─ */
let allLand=true,allSolid=true;
for(const d of D.DRACOLORD_DOMAINS){
  D.game.scene=D.DREAMLAND_SCENE;D.player.x=28;D.player.y=28;
  D.player._dreamEndsAt=CLOCK+9000;
  D.enterDracolordRealm(d);drain();
  const c=D.interiorConfig(D.game.scene);
  if(!c||D.player.x<0||D.player.y<0||D.player.x>=c.cols||D.player.y>=c.rows)allLand=false;
  else if(c.isBlocked(D.player.x,D.player.y))allSolid=false;
  D.leaveDracolordRealm();drain();
}
t(allLand,'★★★ all six arches land the player INSIDE the realm');
t(allSolid,'★★★ all six land him on solid ground');

/* ── 3 · ★★★ RULING 1 · THE CLOCK STOPS AT THE THRESHOLD ───────────── */
const dom=D.DRACOLORD_DOMAINS[0];
D.game.scene=D.DREAMLAND_SCENE;D.player.x=31;D.player.y=27;
D.player._dreamEndsAt=CLOCK+9000;
D.enterDracolordRealm(dom);drain();
t(D.player._dreamEndsAt===0,'★★★ the clock STOPS past an arch');
t(Math.abs(D.player._dreamClockHeld-9000)<50,`★ and 9000ms is HELD (${Math.round(D.player._dreamClockHeld)})`);
CLOCK+=120000;                                   // two minutes inside
t(D.game.scene===D.dracolordRealmScene(dom.id),'★★★ two minutes later · still inside · no timeout');
const held=D.player._dreamClockHeld;
D.leaveDracolordRealm();drain();
t(D.player.x===31&&D.player.y===27,`★★★ you come out on the EXACT tile you left (${D.player.x},${D.player.y})`);
t(Math.abs((D.player._dreamEndsAt-CLOCK)-held)<50,
  `★★★ shelter, NOT a refill · resumed with ${Math.round(D.player._dreamEndsAt-CLOCK)}ms of ${Math.round(held)}`);
// ★ the +1 drift bug: v0.96.37 stored the tile then added one on the way out
for(let i=0;i<5;i++){D.enterDracolordRealm(dom);drain();D.leaveDracolordRealm();drain();}
t(D.player.x===31&&D.player.y===27,'★ five round trips · ZERO drift');

/* ── 4 · ★★★ RULING 2 · THEY JUDGE, THEY DO NOT FIGHT ──────────────── */
D.player.dracolordSeen={};
D.player._dreamEndsAt=CLOCK+9000;
D.enterDracolordRealm(dom);drain();D.clearDlg();
t(!D.dracolordSeen(dom.id),'not recognised before the walk');
// walk the whole corridor a tile at a time
let fires=0;
for(let y=D.DRACOLORD_ARRIVE_Y;y>=D.DRACOLORD_THRONE_Y+1;y--){
  D.player.y=y;
  const had=!!D.dlg();
  D.tickDracolordRealm();
  if(!had&&D.dlg())fires++;
}
t(fires===1,`★★★ the audience fires EXACTLY once on the walk in (${fires})`);
t(D.dracolordSeen(dom.id),'★★★ RECOGNITION is recorded');
const box=D.dlg();
t(!!box&&box.speaker===dom.lord,`★ and ${dom.lord} is the speaker`);
t(!!box&&box.lines.some(l=>/TIER 9/.test(l)),'★ the tier gap is stated to the player');
// ★ RULING 2 read off the CODE, not the prose
const body=src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const aStart=body.indexOf('function dracolordAudience');
let dep=0,aEnd=aStart;
for(let i=body.indexOf('{',aStart);i<body.length;i++){
  if(body[i]==='{')dep++;else if(body[i]==='}'){dep--;if(!dep){aEnd=i;break;}}}
const audienceCode=body.slice(aStart,aEnd);
t(aEnd>aStart,'dracolordAudience located by brace match');
t(!/startBattle|beginBattle|enterBattle|battleState\s*=/.test(audienceCode),
  '★★★ NO battle call in the audience · they are audiences, not health bars');
t(!/\bgold\s*\+=|addItem\(|giveItem\(|rizerXP\s*\+=|awardRXP\(/.test(audienceCode),
  '★★★ NO loot and NO XP · the reward is RECOGNITION');
t(/dracolordSeen\s*\[/.test(audienceCode),'★ it writes the recognition flag');
// twice is not worth more than once
D.clearDlg();D.player._realmAudience=false;D.player.y=D.DRACOLORD_THRONE_Y+1;
D.tickDracolordRealm();
const box2=D.dlg();
t(!!box2&&box2.lines.length<box.lines.length,'★ a second audience is shorter · being known twice is not worth more');

/* ── 5 · ★★★ THE WAY OUT · v0.96.37 bound it to nothing ────────────── */
t(D.dracolordGateAt(CX,D.DRACOLORD_GATE_Y),'the gate hitbox covers the centre');
t(D.dracolordGateAt(CX-1,D.DRACOLORD_GATE_Y)&&D.dracolordGateAt(CX+1,D.DRACOLORD_GATE_Y),
  '★ all three tiles of the arch are the door');
t(!D.dracolordGateAt(CX,D.DRACOLORD_THRONE_Y),'the throne row is not a gate');
t(!D.dracolordGateAt(CX,D.DRACOLORD_ARRIVE_Y),'where you stand is not a gate');
const cfg0=D.dracolordRealmConfig(dom.id);
t(cfg0.isBlocked(CX,D.DRACOLORD_GATE_Y),'★ the gate is SOLID · you press X on it, you do not walk through');
t(cfg0.isBlocked(CX,D.DRACOLORD_THRONE_Y),'★ the Dracolord is SOLID · not scenery');
t(!cfg0.isBlocked(CX,D.DRACOLORD_THRONE_Y+1),'★ but you can stand in front of him');
// the binding itself · read off the code
t(/dracolordGateAt\([^)]*\)\s*\)?\s*\{[\s\S]{0,900}?leaveDracolordRealm/.test(body)
  ||/leaveDracolordRealm/.test(body.slice(body.indexOf('dracolordGateAt(fx, fy)'),
                                          body.indexOf('dracolordGateAt(fx, fy)')+1200)),
  '★★★ X on the gate CALLS leaveDracolordRealm · it is wired to an input');

/* ── 6 · the scene plumbing ────────────────────────────────────────── */
t(!!D.interiorConfig(D.dracolordRealmScene('abyssion')),'★ every realm scene id resolves to a config');
t(D.DRACOLORD_DOMAINS.every(d=>!!D.interiorConfig(D.dracolordRealmScene(d.id))),'   · all six of them');
t(D.interiorConfig('dreamland_realm_nonsense')===null,'★ a bogus realm id resolves to null, not a broken room');
t(D.DRACOLORD_DOMAINS.every(d=>D.dracolordRealmConfig(d.id)===D.dracolordRealmConfig(d.id)),
  '★ configs are cached · same object every call');
t(D.DRACOLORD_DOMAINS.every(d=>D.dracolordRealmConfig(d.id).realmTint===d.tint),
  '★ each realm carries its own domain tint');
t(new Set(D.DRACOLORD_DOMAINS.map(d=>d.tint)).size===6,'★ six distinct tints · you can tell whose realm it is');
t(D.DRACOLORD_DOMAINS.every(d=>D.dracolordRealmConfig(d.id).cloudFloor===true),
  '★ realms reuse the cloud floor · no new art needed');
t(D.DRACOLORD_DOMAINS.every(d=>typeof D.dracolordRealmConfig(d.id).densityFn==='function'),
  '★ and their own terrain function');

/* ── 7 · drawing must not throw ────────────────────────────────────── */
let drew=true;
for(const d of D.DRACOLORD_DOMAINS){
  try{D.drawDracolordPresence(d);}catch(e){drew=false;console.log('       ! '+d.lord+': '+e.message);}
}
t(drew,'★ all six presences draw without throwing');
try{D.drawDracolordGate();ok('★ the gate draws without throwing');}catch(e){no('gate draw: '+e.message);}

console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
