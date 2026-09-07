#!/usr/bin/env node
/* verify_hardlocks.js · v0.96.21
 *
 *   Creator: "overworld freezes. music still plays. its ruining the opening
 *   story loops. it started happening like early this morning."
 *
 * ★★★ THE FREEZE. A hard freeze lock survived every reset path in the game, so
 *   a NEW GAME could be born frozen — with the music playing, because
 *   startNewGame() calls playBGM('home').
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== HARD LOCKS · no reset path may leave one set ===\n');

const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
const _els=new Map();
const HIDDEN=[];
const mk=id=>({id,style:{display:'block'},dataset:{},_buttons:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},
 pause(){HIDDEN.push('pause:'+id);},play:()=>Promise.resolve(),load:noop,currentTime:0,
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
const sizeOf=p=>{try{const b=fs.readFileSync(p);if(b.slice(1,4).toString()==='PNG')return[b.readUInt32BE(16),b.readUInt32BE(20)];return[1,1];}catch(_){return null;}};
global.Image=function(){const o={addEventListener:noop,complete:true,naturalWidth:0,naturalHeight:0,
 set src(v){o._src=v;const rel=decodeURIComponent(String(v)).replace(/^\/+/,'');
 const s=sizeOf(path.join(ROOT,rel));if(s){o.naturalWidth=s[0];o.naturalHeight=s[1];}},get src(){return o._src;}};return o;};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.CustomEvent=function(t,o){return{type:t,...(o||{})};};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__C={player,game,tryMove,startNewGame,restartToTitleScreen,
 closeAllOverlaysAndMenus,forceUnstick,releaseHardLocks,
 get rizerDeath(){return _rizerDeath;}, set rizerDeath(v){_rizerDeath=v;},
 get dreamPlaying(){return _dreamPlaying;}, set dreamPlaying(v){_dreamPlaying=v;},
 get sleepFade(){return _sleepFade;}, set sleepFade(v){_sleepFade=v;},
 get volt(){return _voltstormPlaying;}, set volt(v){_voltstormPlaying=v;},
 get tv(){return _tvMoviePlaying;}, set tv(v){_tvMoviePlaying=v;}};`)();
let n=0;while(_Q.length&&n<400){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const C=globalThis.__C;

const setAll=()=>{ C.rizerDeath={t0:CLOCK,dur:1800,skin:'normal'}; C.dreamPlaying=true;
  C.sleepFade={t0:CLOCK,dur:900}; C.volt=true; C.tv=true; };
const anySet=()=>!!C.rizerDeath||!!C.dreamPlaying||!!C.sleepFade||!!C.volt||!!C.tv;
function canMove(){ C.player.moveCd=0; C.tryMove._lastReason=''; C.tryMove(16.7);
  return !(C.tryMove._lastReason||'').length; }

t(typeof C.releaseHardLocks==='function',
  '★ there is ONE named function that drops every hard lock · the next lock '
  + 'added has an obvious place to be released from');

/* ── 1 · ★★★ NEW GAME IS BORN UNFROZEN ────────────────────────────── */
setAll();
C.restartToTitleScreen();
C.startNewGame();
C.game.scene='overworld'; C.player.x=22; C.player.y=106;
t(!anySet() && canMove(),
  '★★★ die → restart to title → NEW GAME leaves you able to move. It did not: '
  + '_rizerDeath survived closeAllOverlaysAndMenus, restartToTitleScreen, '
  + 'resetPlayerToPristine AND startNewGame, so the new game was born frozen — '
  + 'and startNewGame calls playBGM(\'home\'), which is the music still playing '
  + 'over a world that will never move');

/* ── 2 · the backtick panic reset must actually reset panic ────────── */
setAll(); C.game.scene='overworld';
C.closeAllOverlaysAndMenus();
t(!anySet() && canMove(),
  '★★★ the ` panic reset clears them · it is commented as the "escape hatch for '
  + 'any stuck state" and was blind to the one family of states most worth '
  + 'escaping, so the only real fix was a page reload — and reloading is exactly '
  + 'what destroyed the evidence in all seven earlier reports');

/* ── 3 · forceUnstick · the CONSOLE player's only hatch ────────────── */
setAll(); C.game.scene='overworld';
C.forceUnstick();
t(!anySet() && canMove(),
  '★★★ L2+touchpad clears them too · on a console there is no keyboard, so no '
  + 'backtick and no Cmd+Esc · this is the only hatch that exists there');

/* ── 4 · each lock individually, so a partial fix cannot pass ──────── */
const each=[['rizerDeath',()=>{C.rizerDeath={t0:CLOCK,dur:1800};}],
            ['dreamPlaying',()=>{C.dreamPlaying=true;}],
            ['sleepFade',()=>{C.sleepFade={t0:CLOCK,dur:900};}],
            ['voltstorm',()=>{C.volt=true;}],
            ['tvMovie',()=>{C.tv=true;}]];
for (const [name,set] of each){
  set(); C.game.scene='overworld'; C.releaseHardLocks();
  t(!anySet() && canMove(), `  · ${name} alone is released`);
}

/* ── 5 · the videos are hidden, not just un-flagged ────────────────── */
HIDDEN.length=0; setAll(); C.releaseHardLocks();
t(HIDDEN.length>=3,
  `★★ the video ELEMENTS are paused and hidden (${HIDDEN.length}) · clearing the `
  + 'flag while leaving a paused movie over the screen is its own kind of frozen');

/* ── 6 · called from every reset path · read the CODE ──────────────── */
const code=H.replace(/^\s*\/\/.*$/gm,'');
const calls=(code.match(/releaseHardLocks\(\)/g)||[]).length;
t(calls>=4, `★★ releaseHardLocks is called from every reset path (${calls} sites: `
  + 'its definition, the panic reset, New Game, and forceUnstick)');
t(/_dreamSkipHandlers = null;/.test(code) && /removeEventListener\('keydown',     _dreamSkipHandlers\.k, true\)/.test(code),
  '★★ and the dream\'s CAPTURE-PHASE skip listeners come off · left attached '
  + 'they sit on the window swallowing X/Enter/Escape for the rest of the session');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
