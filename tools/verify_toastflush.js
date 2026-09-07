#!/usr/bin/env node
/* verify_toastflush.js · v0.96.29
 *
 * ★★★ THE FREEZE. Twelve reports across a whole session:
 *   "overworld freezes, music still plays" · "page goes unresponsive" ·
 *   "frozen after talking to elarian and running".
 *
 *   _flushPendingPhoneToasts ran `while (_pendingPhoneToasts.length)`, and
 *   showToast RE-QUEUES its own argument whenever a card is already showing.
 *   TOAST_STACK_MAX is 1, so after the first card one always is. Shift, push,
 *   shift, push — the condition refills itself and the main thread never
 *   returns to the browser.
 *
 * ★★★★★ AND IT LIVES IN A setTimeout CALLBACK, so it never enters _frameBody.
 *   Every guard built this session — the rAF try/finally, per-step timing, the
 *   flight recorder, the crumb, the stalled-loop watchdog — is inside the frame
 *   loop and could not see it. That is why the tile label honestly read 120 fps
 *   while the tab was dead.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== THE PHONE-TOAST FLUSH MUST TERMINATE ===\n');

const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=(fn,ms)=>{_Q.push([fn,ms]);return _Q.length;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
const _els=new Map();
const mk=id=>{const o={id,style:{display:'none'},dataset:{},_buttons:[],_kids:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',
 get children(){return o._kids;}, get childNodes(){return o._kids;},
 get firstChild(){return o._kids[0]||null;},
 getContext:()=>CTX,
 appendChild(c){o._kids.push(c);c.parentNode=o;return c;},
 removeChild(c){const i=o._kids.indexOf(c);if(i>=0)o._kids.splice(i,1);c.parentNode=null;return c;},
 addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,
 focus:noop,remove(){if(o.parentNode)o.parentNode.removeChild(o);},
 replaceChildren(){o._kids.length=0;},cloneNode(){return mk(id);},pause:noop,
 play:()=>Promise.resolve(),load:noop,currentTime:0,parentNode:null,
 querySelector:()=>mk(id),querySelectorAll(){return o._kids;},
 getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})};return o;};
const elFor=id=>{if(!_els.has(id))_els.set(id,mk(id));return _els.get(id);};
global.addEventListener=noop;global.removeEventListener=noop;
global.document={getElementById:elFor,querySelector:()=>mk('x'),querySelectorAll:()=>[],
 createElement:()=>mk('x'),addEventListener:noop,body:mk('body'),documentElement:mk('html'),
 head:mk('head'),hidden:false,visibilityState:'visible',hasFocus:()=>true};
global.window=global;const LS={};
global.localStorage={getItem:k=>LS[k]??null,setItem:(k,v)=>{LS[k]=String(v);},removeItem:k=>{delete LS[k];}};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,currentTime:0,cloneNode(){return this;}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=(fn)=>{try{fn(CLOCK);}catch(_){}return 1;};
global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.CustomEvent=function(t,o){return{type:t,...(o||{})};};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__T={showToast,_flushPendingPhoneToasts,_isPhoneWorthy,
 _phoneToastShowing,TOAST_STACK_MAX,
 get pending(){return _pendingPhoneToasts;},
 get dialogState(){return dialogState;}, set dialogState(v){dialogState=v;},
 stack:()=>toastStackEl};`)();
let n=0;while(_Q.length&&n<400){const [f]=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const T=globalThis.__T;

const M1='★ RIZER LEVEL UP · Lv 5 · +33 attribute points';
const M2='★ Received: RAID Card · Rizer Academy ID';
const M3='★ ORREN · 10/10 Grunt dodges · return to Albert Orren';
t(T._isPhoneWorthy(M1, undefined) === true,
  '★ a ★ level-up toast is phone-worthy · that is what puts it in the queue');
t(T.TOAST_STACK_MAX === 1,
  '★★ the card stack holds ONE · which is why a card is ALWAYS showing after '
  + 'the first, and why the re-queue always fired');

/* ── 1 · ★★★ THE LOOP TERMINATES ───────────────────────────────────── */
function queueTwoThenFlush(msgs){
  T.pending.length = 0;
  T.stack()._kids.length = 0;
  T.dialogState = { speaker:'PROFESSOR ELARION', lines:['x'], idx:0 };
  for (const m of msgs) T.showToast(m, 2200);
  const queued = T.pending.length;
  T.dialogState = null;
  T.stack()._kids.length = 0;             // no card up when the flush fires
  const real = Array.prototype.shift;
  let shifts = 0, tripped = false;
  T.pending.shift = function(){
    if (++shifts > 500){ tripped = true; this.length = 0; return undefined; }
    return real.call(this);
  };
  try { T._flushPendingPhoneToasts(); } catch(_){}
  delete T.pending.shift;
  return { queued, shifts, tripped };
}
const r = queueTwoThenFlush([M1, M2]);
t(r.queued === 2, `★ two cards queue behind the dialogue (${r.queued})`);
t(!r.tripped,
  `★★★ THE FLUSH TERMINATES · ${r.shifts} shift(s). With \`while\` this ran past `
  + 'a 500-shift tripwire and never exited — the browser tab was simply gone, '
  + 'which is the "Page Unresponsive" dialog the Creator sent');
t(r.shifts === 1,
  '★★ exactly ONE card is taken per flush · the stack holds one, so taking more '
  + 'would only re-queue them, which is precisely how the loop fed itself');

/* ── 2 · ★★★ AND NOTHING IS STRANDED ───────────────────────────────── */
//   `if` is only correct because the card-removal handler calls back. If it did
//   not, this fix would trade a hang for silently lost notifications.
// ★ there are TWO card-removal sites — a plain-toast one with no drain and the
//   PHONE one with it. Anchor on the phone path or the check passes on the
//   wrong function, which is exactly what my first version did.
t(/★ v0\.95\.985 · the card is gone · let the next one in[\s\S]{0,260}_flushPendingPhoneToasts\(\)/.test(H),
  '★★★ the card-removal handler DRAINS THE NEXT ONE · this is what makes `if` '
  + 'safe. Without that callback, `if` would trade a hang for silently dropped '
  + 'notifications, which is a worse bug and a quieter one');

// drive the full drain the way the game does: flush, expire the card, repeat
T.pending.length = 0; T.stack()._kids.length = 0;
T.dialogState = { speaker:'X', lines:['x'], idx:0 };
for (const m of [M1,M2,M3]) T.showToast(m, 2200);
T.dialogState = null; T.stack()._kids.length = 0;
// ★ order is captured at the SOURCE — what showToast was actually handed —
//   rather than by reading mock DOM text. The card's inner markup is built by a
//   path this harness does not model, and a test that reads '' three times and
//   calls it a pass would be worse than no test.
// ★ order is read from the QUEUE ITSELF as it drains — the card's inner markup
//   is built by a path this harness does not model, so reading mock DOM text
//   returned three empty strings and would have "passed" on nothing.
const shown = [];
for (let i=0; i<8 && T.pending.length; i++){
  const next = T.pending[0] && T.pending[0].msg;   // what this flush will take
  T._flushPendingPhoneToasts();
  if (next != null && T.pending[0] !== next) shown.push(String(next));
  T.stack()._kids.length = 0;          // the card expires · the drain callback's job
}
t(shown.length === 3, `★★★ all three cards are shown, none stranded (${shown.length})`);
console.log('    drained in order: ' + shown.map(x=>x.slice(0,26)).join('  |  '));
t(shown[0].includes('LEVEL UP') && shown[1].includes('RAID Card') && shown[2].includes('ORREN'),
  '★★ and IN ORDER · a queue that drains out of order would reorder the story '
  + 'beats a player reads');
t(T.pending.length === 0, '★ the queue is empty at the end');

/* ── 3 · the source says `if`, and says why ────────────────────────── */
const code = H.replace(/^\s*\/\/.*$/gm,'');
t(/if \(_pendingPhoneToasts\.length\)\{/.test(code) && !/while \(_pendingPhoneToasts\.length\)/.test(code),
  '★★★ the `while` is gone from the source');
t(/★★★★★ AND WHY NONE OF MY INSTRUMENTATION EVER SAW IT/.test(H),
  '★★ and the reason it hid for twelve rounds is written down: a synchronous '
  + 'infinite loop in a setTimeout callback never enters _frameBody, so every '
  + 'guard in the frame loop was structurally blind to it');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
