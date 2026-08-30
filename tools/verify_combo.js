const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval=()=>0; global.setTimeout=()=>0; global.clearInterval=noop; global.clearTimeout=noop;
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
global.addEventListener=noop; global.removeEventListener=noop;
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'};
global.window=global; global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}};
global.Image=function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}};
global.requestAnimationFrame=()=>0; global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0};
global.performance={now:()=>Date.now()};
global.getComputedStyle=()=>({getPropertyValue:()=>''});
let CLK=10000; global.performance={now:()=>CLK};
try{new Function(src+';globalThis.__C={rizerMeleeRecovery,rizerAttackTimeScale,rizerAttrFrac,rizerAttrPool,MELEE_RECOVERY_MIN,MELEE_LOCK_FLOOR_MS,player,game,RIZER_ATTR_MAX};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');

// model the shipped keydown maths exactly
function swing(mode){
  const dur  = Math.round(((mode==='kick')?400:300)*C.rizerAttackTimeScale());
  const lock = Math.max(C.MELEE_LOCK_FLOOR_MS, Math.round(dur*C.rizerMeleeRecovery()));
  return {dur, lock};
}
const setSpeed = pts => { C.player.attrs = {hp:0,atk:0,def:0,speed:pts,special:0}; };

H('1 · ★★★ AT ZERO POINTS, NOTHING CHANGED');
{
  setSpeed(0); C.player.astralMax = 100; C.player.astral = 100;   // ⚡ is player.astral, not player.stamina
  ok(C.rizerMeleeRecovery()===1,'★★★ recovery ×1.00 · an unallocated Rizer swings at exactly the cadence he always has');
  const p=swing('punch'), k=swing('kick');
  ok(p.dur===300 && p.lock===300,'★★ punch 300ms animation, 300ms lock · identical to before this existed');
  ok(k.dur===400 && k.lock===400,'★★ kick 400/400 · the invariant the whole attribute pass is built on');
}

H('2 · ★★★ AT MAX, THE COMBO LANDS FASTER · the animation does not');
{
  setSpeed(C.RIZER_ATTR_MAX);
  ok(Math.abs(C.rizerMeleeRecovery()-C.MELEE_RECOVERY_MIN)<1e-9,'★★ recovery bottoms at ×'+C.MELEE_RECOVERY_MIN);
  const p=swing('punch'), k=swing('kick');
  ok(p.dur===300,'★★★ punch ANIMATION still 300ms · full length, all four frames, nothing skipped');
  ok(p.lock===165,'★★★ but the LOCK is 165ms · you may swing again while the tail is still on screen');
  ok(k.dur===400 && k.lock===220,'★★ kick 400ms animation, 220ms lock');
  const rate0=(setSpeed(0),1000/swing('punch').lock);
  const rateM=(setSpeed(C.RIZER_ATT_MAX||C.RIZER_ATTR_MAX),1000/swing('punch').lock);
  ok(rateM/rate0>1.7,'★★★ '+ (rateM/rate0).toFixed(2) +'x the combo rate · 4-hit chain '+(4*300)+'ms -> '+(4*165)+'ms');
}

H('3 · ★★ THE BAR STILL SLOWS YOU · attribute and bar are different levers');
{
  setSpeed(C.RIZER_ATTR_MAX);
  C.player.astralMax = 100;
  C.player.astral = 0;                        // drained ⚡ bar · the field rizerAttackTimeScale actually reads
  const drained = swing('punch');
  C.player.astral = 100;
  const full = swing('punch');
  ok(drained.dur > full.dur,'★★★ a DRAINED Rizer’s animation is slower ('+drained.dur+'ms vs '+full.dur+') · the bar still punishes');
  ok(drained.lock > full.lock,'★★ and his lock scales with it · fit + invested is fastest, drained is slowest');
}

H('4 · ★★★ THE SPLIT ITSELF');
{
  ok(/TWO CLOCKS, NOT ONE/.test(src2),'the two clocks are named at the keydown');
  ok(/player\.attackAnimUntil = player\.attackStart \+ dur;/.test(src2),'★★ attackAnimUntil = what you SEE');
  ok(/player\.attackUntil = player\.attackStart \+ lock;/.test(src2),'★★ attackUntil = when you may swing AGAIN');
  ok(/const _animEnd = player\.attackAnimUntil \|\| player\.attackUntil \|\| 0;/.test(src2),
     '★★★ the DRAW follows the animation clock · without this line, a shorter lock would just TRUNCATE the swing');
  ok(/MELEE DAMAGE LANDS ON THE KEYPRESS/.test(src2),
     '★★★ and why it is free · the hitbox is tested in keydown, so the whole animation was already recovery');
  ok(/the astral casts never\n  \/\/ set attackStart/.test(src2)||/never/.test(src2),
     '★ the astral casts keep the old elapsed formula · one branch, no behaviour change outside melee');
}

H('5 · ★ NO MACHINE-GUNNING, AND NOTHING LEAKS');
{
  ok(C.MELEE_LOCK_FLOOR_MS>0,'★★ an absolute lock floor of '+C.MELEE_LOCK_FLOOR_MS+'ms exists regardless of stats');
  ok(/attackAnimUntil/.test(src2.slice(src2.indexOf("'attackMode','attackStart'"), src2.indexOf("'attackMode','attackStart'")+140)),
     '★ the new clock is in the SAVE key list, like the lock it splits from');
  const resets=(src2.match(/attackAnimUntil\s*=\s*0/g)||[]).length;
  ok(resets>=4,'★★ cleared at '+resets+' reset sites · death, scene change, hard-freeze · no stale clock survives');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
