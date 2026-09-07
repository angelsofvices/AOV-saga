#!/usr/bin/env node
/* verify_deadman.js · v0.96.18
 *
 *   Creator, six times: "game froze" / "I keep going f (fail/freeze after
 *   dialogue...)" / "it seems to freeze when I leave a dialogue and run".
 *
 * ★★★ Every one of these locks is a HARD entry in freezeReasons released only
 *   by a video callback or a bare setTimeout. This suite STRANDS each one — the
 *   exact thing a blocked autoplay or a throttled background tab does — and
 *   proves the frame takes it back off.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const H = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);
console.log('\n=== THE DEADMAN · stranded locks must self-heal ===\n');

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
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},pause:noop,play:()=>Promise.resolve(),
 querySelector:()=>mk(id),querySelectorAll(){return this._buttons;},
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
const elFor=id=>{if(!_els.has(id))_els.set(id,mk(id));return _els.get(id);};
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:()=>mk('x'),addEventListener:noop,body:mk('body'),documentElement:mk('html'),
 head:mk('head'),hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,cloneNode(){return this;}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:1254,naturalHeight:1254,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'blob:x',revokeObjectURL:noop};
global.Blob=function(){};
global.getComputedStyle=el=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__C={player,game,tryMove,_tickDeadman,DEADMAN_GRACE_MS,
 get rizerDeath(){return _rizerDeath;}, set rizerDeath(v){_rizerDeath=v;},
 get dreamPlaying(){return _dreamPlaying;}, set dreamPlaying(v){_dreamPlaying=v;},
 get sleepFade(){return _sleepFade;}, set sleepFade(v){_sleepFade=v;},
 get voltstorm(){return _voltstormPlaying;}, set voltstorm(v){_voltstormPlaying=v;},
 get tvMovie(){return _tvMoviePlaying;}, set tvMovie(v){_tvMoviePlaying=v;},
 cinematicPlaying, dumpFlight, flightRows, recordFlight};`)();
let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const C=globalThis.__C;

// advance the clock in believable frame steps so the tab-gap guard doesn't fire
function run(ms){ const end=CLOCK+ms; while(CLOCK<end){ CLOCK+=16.7; C._tickDeadman(); } }
function reset(){ C.rizerDeath=null; C.dreamPlaying=false; C.sleepFade=null;
  C.voltstorm=false; C.tvMovie=false; CLOCK+=50; C._tickDeadman(); }

/* ── 1 · a death whose dream never starts ──────────────────────────── */
reset();
C.rizerDeath={t0:CLOCK,dur:1800,skin:'normal'};
run(1000);
t(!!C.rizerDeath, '★ a fresh death lock is LEFT ALONE for its own duration · the deadman '
  + 'is a floor, not a replacement for the real animation');
run(8000);
t(!C.rizerDeath, '★★★ a death whose dream never starts is CLEARED by the frame · this is '
  + 'the freeze: _rizerDeath is a hard freezeReason and its only clear path ran '
  + 'downstream of a video that a browser is free never to play');

/* ── 2 · a dream video that never ends ─────────────────────────────── */
reset();
C.dreamPlaying=true; C.rizerDeath={t0:CLOCK,dur:1800};
run(60000);
t(C.dreamPlaying, '★ a dream still inside its running time is not touched (60s in)');
run(320000);
t(!C.dreamPlaying && !C.rizerDeath,
  '★★★ a dream that never fires `ended` or `error` is cleared, AND it takes the '
  + 'death lock with it · autoplay refusal fires neither event');

/* ── 3 · the other two cinematics ──────────────────────────────────── */
reset(); C.voltstorm=true; run(370000);
t(!C.voltstorm, '★★ a stranded Voltstorm video unfreezes');
reset(); C.tvMovie=true; run(370000);
t(!C.tvMovie, '★★ a stranded TV movie unfreezes');

/* ── 4 · the sleep fade ────────────────────────────────────────────── */
reset(); C.sleepFade={t0:CLOCK,dur:900}; run(2000);
t(!!C.sleepFade, '★ a live sleep fade is left alone');
run(9000);
t(!C.sleepFade, '★★ a sleep fade whose setTimeout never fired is cleared');

/* ── 5 · ★★★ AND MOVEMENT ACTUALLY COMES BACK ──────────────────────── */
reset();
C.game.scene='overworld'; C.player.x=16; C.player.y=63; C.player.moveCd=0;
C.rizerDeath={t0:CLOCK,dur:1800,skin:'normal'};
C.tryMove(16.7);
t(/rizerDeath/.test(C.tryMove._lastReason||''),
  '★★ while the lock is on, tryMove names it as the freeze reason');
run(9000);
C.tryMove(16.7);
t(!/rizerDeath/.test(C.tryMove._lastReason||''),
  '★★★ after the deadman, tryMove no longer reports a freeze · the player can '
  + 'move again. THIS is the assertion the previous five freeze fixes lacked: '
  + 'each one guarded a symptom, none of them proved movement returned');

/* ── 6 · a backgrounded tab is not a hang ──────────────────────────── */
reset();
C.rizerDeath={t0:CLOCK,dur:1800,skin:'normal'};
CLOCK+=600000;            // alt-tabbed for ten minutes · rAF was not running
C._tickDeadman();
t(!!C.rizerDeath,
  '★★★ a ten-minute tab gap does NOT trip the deadman · rAF stops while hidden, '
  + 'so on return every deadline looks blown at once and a naive check would '
  + 'unfreeze a player who simply alt-tabbed mid-death');

/* ── 7 · the ordering fix · locks come off BEFORE the work ─────────── */
const code = H.replace(/<!--[\s\S]*?-->/g,'').replace(/^\s*\/\/.*$/gm,'');
t(/_rizerDeath = null;\s*\n\s*restoreRizerOnRest\(\);/.test(code),
  '★★★ the no-video wake clears the lock BEFORE restoreRizerOnRest/wakeInRizerRoom · '
  + 'it used to clear it after a scene warp + interior rebuild + save, so any '
  + 'throw in there stranded the player permanently');
t(/_dreamPlaying = false;\s*\n\s*_rizerDeath   = null;\s*\n\s*_sleepFade    = null;/.test(code),
  '★★★ finish() drops all THREE locks first · three freeze reasons hung off one '
  + 'function and were released either side of a warp');
t(/try \{ wakeInRizerRoom\(\); \}/.test(code) && (code.match(/try \{ wakeInRizerRoom\(\); \}/g)||[]).length===2,
  '★★ and both wake calls are guarded · a wake that fails now costs you a warp, '
  + 'not the rest of the session');

/* ── 8 · the flight recorder ───────────────────────────────────────── */
t(typeof C.recordFlight==='function' && typeof C.flightRows==='function',
  '★ the flight recorder exists');
C.recordFlight(CLOCK,'frame'); C.recordFlight(CLOCK+16,'frame');
const rows=C.flightRows();
t(rows.length>=2 && rows[rows.length-1].t>=rows[0].t,
  `★★ it records, oldest-first (${rows.length} rows) · a ring buffer read in ring `
  + 'order is a timeline nobody can follow');
t(rows.some(r=>'why' in r && 'keys' in r && 'dlg' in r),
  '★★ each row carries the freeze reason, the held keys and the speaker · the '
  + 'three things I have had to guess at in all six reports');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
