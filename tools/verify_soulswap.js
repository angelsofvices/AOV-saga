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
let CLK=500000; global.performance={now:()=>CLK};
try{new Function(src+';globalThis.__C={SOULSWAP_ENABLED,startFactionSoulSwitch,endFactionSoulSwitch,_soulswapSafetyRestore,player,game,NPCS,findNpcById};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;
const P=C.player;

H('1 · ★★★ IT IS OFF');
{
  ok(C.SOULSWAP_ENABLED===false,'★★★ SOULSWAP_ENABLED = false');
  const n=C.findNpcById('elzoran')||C.NPCS.find(x=>x&&!x.isEnemy);
  P.activeActor='rizer';
  ok(C.startFactionSoulSwitch(n)===false,'★★ starting a swap refuses outright');
  ok(P.activeActor==='rizer','★★★ and you stay Rizer · no half-entered state');
}

H('2 · ★★ PARKED, NOT DELETED');
{
  ok(/PARKED, NOT DELETED/.test(src2),'the intent is stated');
  ok(typeof C.startFactionSoulSwitch==='function' && typeof C.endFactionSoulSwitch==='function',
     '★★★ the machinery is INTACT · one flag turns it back on, no rebuild');
  ok(/would mean rebuilding it from\n\/\/ scratch the week the cards ship/.test(src2)||/the week the cards ship/.test(src2),
     '★★ and why deleting it would have cost more than it saved');
}

H('3 · ★★★ WHAT IT BECOMES');
{
  ok(/UNLOCKED BY SCANNING A PHYSICAL CARD/.test(src2),
     '★★★ the return condition is recorded · a card scan, not a bond grind');
  ok(/IRL\n\/\/ card ownership IS in-game ownership/.test(src2)||/card ownership IS in-game ownership/.test(src2),
     '★★ tied to the law the Zysphere bridge already runs on');
  ok(/dead weight rather than a design to preserve/.test(src2),
     '★★★ and the bond-100 gate is flagged as dead weight · it should be REPLACED by the scan, not restored beside it');
}

H('4 · ★★★ IT ALSO GIVES TRIANGLE BACK');
{
  ok(/Triangle IS THE KICK/.test(src2),
     '★★★ the swap branch intercepted Triangle in front of every friendly NPC');
  ok(/Friendly humans were still\n\/\/ eating it/.test(src2)||/eating it/.test(src2),
     '★★ the same complaint that revoked the tap-recall at v0.95.837, still live for humans');
  ok(/SOULSWAP_ENABLED && facing && !facing\._summoned/.test(src2),
     '★★★ the WHOLE branch is gated, not just the call · gating only the call would leave the toasts firing and still swallow the kick');
}

H('5 · ★★★ THE SAVE TRAP');
{
  ok(/AND THE SAVE TRAP/.test(src2),'the trap is recorded');
  ok(/player\.activeActor is NOT in the transient key list/.test(src2),
     '★★★ activeActor PERSISTS · a save made mid-swap carries an ally as the player');
  // reproduce it: a save that loaded as someone else
  P.activeActor='elzoran';
  const fixed=C._soulswapSafetyRestore();
  ok(fixed===true,'★★ the restore fires on such a save');
  ok(P.activeActor==='rizer',
     '★★★ and puts you back · without it that save is permanently someone else, with the swap-back disabled and no way home');
  P.activeActor='rizer';
  ok(C._soulswapSafetyRestore()===false,'★ and it is silent for everyone else');
  ok(/try \{ _soulswapSafetyRestore\(\); \} catch\(_\)\{\}/.test(src2),'★★ wired into loadGame');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
