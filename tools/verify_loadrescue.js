#!/usr/bin/env node
/* verify_loadrescue.js · v0.96.38
 *
 * ★★★ THE BLACK SCREEN ON LOAD.
 *   Creator: "game is loading to straight black screen after load game."
 *
 *   v0.96.36 shrank the treehouse 30x30 -> 10x10. Every save ever taken inside
 *   it stores a position like (15,20), and loadGame restored it verbatim into a
 *   room that is now ten tiles square. The player stood outside his own house,
 *   the camera followed him to (264,714) — 234px below a 480px room — and the
 *   frame drew four images of nothing.
 *
 *   Not a crash. Not an error. Just black.
 *
 * ★★★ THE POINT OF THIS SUITE IS THE CLASS, NOT THE ROOM.
 *   The treehouse is fixed by clamping the treehouse; that would be worthless.
 *   The guard is "a restored position must exist in the room it claims to be
 *   in", and this file asserts it for EVERY interior in the build — so the next
 *   resize, re-plan or rename cannot ship the same silent break.
 *   [[aov-freeze-lock-deadman]]: fix the class.
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
new Function(src+`;globalThis.__D={game,player,loadGame,saveGame,startNewGame,interiorConfig,
 SAVE_KEY,rescueRestoredPosition,isDreamScene,DREAMLAND_SCENE,INTERIOR_HOME,
 INTERIOR_TREEHOUSE,dracolordRealmScene,DRACOLORD_DOMAINS};`)();
let n=0;while(_Q.length&&n<400){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const D=globalThis.__D;
const drain=()=>{let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}};

/* ── 1 · the exact reported bug ────────────────────────────────────── */
D.game.scene='interior_treehouse';
D.player.x=15;D.player.y=20;                 // a pre-v0.96.36 treehouse position
const moved=D.rescueRestoredPosition();
const th=D.INTERIOR_TREEHOUSE;
t(moved===true,'★ a pre-v0.96.36 treehouse position is caught');
t(D.player.x===th.spawn.x&&D.player.y===th.spawn.y,
  `★ rescued to the spawn (${D.player.x},${D.player.y})`);
t(D.player.x<th.cols&&D.player.y<th.rows,'★ and it is inside the room');

/* ── 2 · THE CLASS · every interior, every corner ───────────────────── */
// Collect every scene id the build can name, and prove that a save holding an
// impossible position in ANY of them comes back somewhere real.
const SCENES=['interior_home','interior_home_2f','interior_research_lab',
  'interior_training_farm','interior_treehouse','interior_malezor_school',
  'interior_seer_hq_1f','interior_seer_hq_r2','interior_seer_hq_b',
  'interior_seer_hq_2f','interior_cave','interior_crazy_home'];
let allRescued=true, allSpawnLegal=true, checked=0;
for(const s of SCENES){
  const cfg=D.interiorConfig(s);
  if(!cfg) continue;
  checked++;
  // a spawn that is itself illegal would make the rescue a trap
  if(cfg.spawn){
    const sp=cfg.spawn;
    const inB=sp.x>=0&&sp.y>=0&&sp.x<cfg.cols&&sp.y<cfg.rows;
    let blk=false; try{blk=!!(cfg.isBlocked&&cfg.isBlocked(sp.x,sp.y));}catch(_){}
    if(!inB||blk){allSpawnLegal=false;console.log(`       ! ${s} spawn (${sp.x},${sp.y}) illegal`);}
  }
  // four impossible positions per scene
  for(const [px,py] of [[cfg.cols+5,cfg.rows+5],[-3,2],[2,-3],[cfg.cols,0]]){
    D.game.scene=s;D.player.x=px;D.player.y=py;
    try{D.rescueRestoredPosition();}catch(e){allRescued=false;continue;}
    const c2=D.interiorConfig(D.game.scene);
    const inB=c2&&D.player.x>=0&&D.player.y>=0&&D.player.x<c2.cols&&D.player.y<c2.rows;
    if(!inB){allRescued=false;console.log(`       ! ${s} (${px},${py}) -> (${D.player.x},${D.player.y})`);}
  }
}
t(checked>=10,`★ ${checked} interiors examined`);
t(allSpawnLegal,'★ every interior spawn is itself in bounds and standable');
t(allRescued,`★★★ EVERY interior rescues EVERY out-of-bounds position (${checked*4} cases)`);

/* ── 3 · a scene id this build no longer has ───────────────────────── */
D.game.scene='interior_a_room_that_was_deleted';D.player.x=99;D.player.y=99;
D.rescueRestoredPosition();
t(D.interiorConfig(D.game.scene)!==null,'★ an unknown scene id lands somewhere that exists');
t(D.game.scene==='interior_home','   · and that somewhere is home');

/* ── 4 · a LEGAL position is left alone ────────────────────────────── */
D.game.scene='interior_treehouse';
D.player.x=th.spawn.x;D.player.y=th.spawn.y-1;
const before=[D.player.x,D.player.y];
const touched=D.rescueRestoredPosition();
t(touched===false,'★ a legal position is NOT touched');
t(D.player.x===before[0]&&D.player.y===before[1],'   · the player stays exactly where he was');

/* ── 5 · the overworld is deliberately exempt ──────────────────────── */
D.game.scene='overworld';D.player.x=-27;D.player.y=199;     // signed world coords are legal
t(D.rescueRestoredPosition()===false,'★ the overworld is not clamped (its coords are signed)');
t(D.player.x===-27&&D.player.y===199,'   · and a negative world position survives');

/* ── 6 · the full round trip through loadGame ──────────────────────── */
D.startNewGame();drain();
D.game.scene='interior_treehouse';D.player.x=th.spawn.x;D.player.y=th.spawn.y;
D.saveGame({quiet:true});
// forge the save into a pre-shrink one, exactly as a real old save reads
const raw=JSON.parse(global.localStorage.getItem(D.SAVE_KEY));
raw.player.x=15;raw.player.y=20;
global.localStorage.setItem(D.SAVE_KEY,JSON.stringify(raw));
D.game.scene='title';
const loaded=D.loadGame();drain();
t(loaded===true,'★ loadGame still succeeds on a stale save');
const lc=D.interiorConfig(D.game.scene);
t(!!lc&&D.player.x<lc.cols&&D.player.y<lc.rows&&D.player.x>=0&&D.player.y>=0,
  `★★★ loadGame lands IN BOUNDS (${D.player.x},${D.player.y}) of ${lc&&lc.cols}x${lc&&lc.rows}`);

/* ── 7 · a save taken inside a Dracolord realm ─────────────────────── */
// v0.96.37 added six dream scenes and the wake-on-reload test still read
// `=== DREAMLAND_SCENE`, so a realm save sailed past it.
t(D.isDreamScene(D.DREAMLAND_SCENE),'isDreamScene · the cloud plane');
t(D.isDreamScene(D.dracolordRealmScene('abyssion')),'★ isDreamScene · an inner level too');
t(!D.isDreamScene('interior_home'),'   · and not a normal room');
const raw2=JSON.parse(global.localStorage.getItem(D.SAVE_KEY));
raw2.scene=D.dracolordRealmScene('alphaea');raw2.player.x=7;raw2.player.y=40;
global.localStorage.setItem(D.SAVE_KEY,JSON.stringify(raw2));
D.loadGame();drain();
t(!D.isDreamScene(D.game.scene),'★★★ a save taken inside a realm wakes you up');
t(D.game.scene==='interior_treehouse','   · at the telescope, not on a corridor');
t(!D.player._dreamEndsAt,'   · with no orphaned clock');

/* ── 8 · the guard is actually wired into loadGame ─────────────────── */
const code=src;
t(/rescueRestoredPosition\s*\(\s*\)/.test(code)&&/function\s+rescueRestoredPosition/.test(code),
  'rescueRestoredPosition is defined AND called');
// ★ read the CODE, never the prose — comments in this file discuss the old test
const body=code.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
// ★ brace-match the real extent. My first cut sliced a fixed 4000 chars from
//   the declaration and reported a FAIL for a call that was present — loadGame
//   is far longer than that. A window is a guess; the braces are the answer.
const lstart=body.indexOf('function loadGame()');
let depth=0,lend=lstart;
for(let i=body.indexOf('{',lstart);i<body.length;i++){
  const c=body[i];
  if(c==='{')depth++;
  else if(c==='}'){depth--;if(depth===0){lend=i;break;}}
}
const loadFn=body.slice(lstart,lend);
t(lend>lstart&&/rescueRestoredPosition/.test(loadFn),
  `★ and the call is INSIDE loadGame (${lend-lstart} chars, brace-matched)`);
t(!/if\s*\(\s*game\.scene\s*===\s*DREAMLAND_SCENE\s*\)\s*\{\s*game\.scene\s*=\s*'interior_treehouse'/.test(body),
  '★ the old DREAMLAND_SCENE-only wake test is gone');

console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
