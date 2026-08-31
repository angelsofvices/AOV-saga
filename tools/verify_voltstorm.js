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
try{new Function(src+';globalThis.__timerGone=(typeof VOLTSTORM_CD_MS==="undefined");globalThis.__C={VOLTSTORM_KILL_COST,voltstormCharge,voltstormReady,bumpVoltstormCharge,cinematicPlaying,hurtPlayer,fireSapphireVoltstorm,voltstormGate,voltstormAdjacentEnemy,_voltstormKO,NPCS,player,game,setVoltstorm:(v)=>{_voltstormPlaying=v},getVoltstorm:()=>_voltstormPlaying};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;

H('1 · ★★★ THE BUG · a Mori could kill you behind the movie');
{
  ok(C.cinematicPlaying()===null,'no cutscene running to begin with');
  C.player.hp = 3; C.player._invulnUntil = 0; C.player.blocking=false; C.player.ufoFlying=false;
  C.hurtPlayer(2,'mori');
  ok(C.player.hp < 3,'★ a Mori hit lands normally · hp '+C.player.hp);
  const hpBefore = C.player.hp = 3;
  C.setVoltstorm(true);
  ok(C.cinematicPlaying()==='voltstormVideo','★★ the cutscene is named by the ONE list');
  C.hurtPlayer(999,'mori');
  ok(C.player.hp === hpBefore,'★★★ and now the SAME hit does nothing · hp still '+C.player.hp+' · you cannot die behind a movie you cannot skip');
  C.setVoltstorm(false);
  // the first hit granted i-frames and the harness clock is frozen -- step it
  // past them, or this asserts the invulnerability window, not the fix.
  CLK += 5000; C.player._invulnUntil = 0;
  C.player.hp = 3; C.hurtPlayer(2,'mori');
  ok(C.player.hp < 3,'★ and damage resumes the moment the film ends · hp '+C.player.hp);
}

H('2 · ★★★ THE WORLD FREEZE · the gate that owns tickNPC');
{
  ok(/const _paused = game\.zphoneOpen \|\| game\.paused \|\| cinematicPlaying\(\);/.test(src2),
     '★★★ the FRAME LOOP gate now includes the cutscenes · it owns tickNPC and tickProjectiles');
  ok(/A CUTSCENE FREEZES THE WORLD, not just the player/.test(src2),'the rule is stated where it is applied');
  ok(/Freezing the player alone is worse than freezing nothing/.test(src2),
     '★★★ and why the half-fix was worse than none · it held him still at point-blank for seventeen seconds');
  // the two guarded ticks must sit behind that same _paused
  const gate = src2.indexOf('const _paused = game.zphoneOpen || game.paused || cinematicPlaying();');
  const npcTick = src2.indexOf('tickNPC(n, dt)', gate);
  const projTick = src2.indexOf('tickProjectiles(performance.now())', gate);
  ok(gate>0 && npcTick>gate,'★★ tickNPC is downstream of it');
  ok(projTick>gate,'★★ tickProjectiles too · the storm’s own victims cannot shoot you mid-film');
}

H('3 · ★★ ONE LIST, NOT FOUR COPIES');
{
  ok(/ONE LIST OF "A MOVIE IS PLAYING"/.test(src2),'the list is named');
  ok(/a rule was\n\/\/ written three times and one copy never heard about the third case/.test(src2)
   ||/never heard about the third case/.test(src2),
     '★★★ the diagnosis is recorded · three copies of one rule, and a fourth place that never heard');
  C.setVoltstorm(true);
  ok(C.cinematicPlaying()==='voltstormVideo','voltstorm reported');
  C.setVoltstorm(false);
  ok(C.cinematicPlaying()===null,'and cleared');
  // tryMove no longer keeps its own private copies
  ok(!/freezeReasons\.push\('voltstormVideo'\)/.test(src2),'★★ tryMove no longer hard-codes the Voltstorm');
  ok(!/freezeReasons\.push\('dreamVideo'\)/.test(src2),'★★ nor the dream');
  ok(!/freezeReasons\.push\('tvMovie'\)/.test(src2),'★★ nor the TV movie');
  ok(/const _cine = cinematicPlaying\(\); if \(_cine\) freezeReasons\.push\(_cine\)/.test(src2),
     '★★★ all three come from the one list, so a FOURTH movie is covered the day it is added');
}

H('4 · ★★ THE MOVE ITSELF STILL WORKS');
{
  ok(fs.existsSync(ROOT+'video/sapphire-voltstorm.mp4'),'★ the film is on disk');
  ok(C.VOLTSTORM_KILL_COST===20,'★★ the cooldown is 20 KILLS now · Creator: "no more timed cool down for A5, make it a 20 kill cooldown"');
  ok(globalThis.__timerGone === true,'★★★ and the 2-minute timer is GONE, not left inert beside it');
  const p=C.player;
  p.cosmeticSkin='normal'; p.voltstormUnlocked=true; C.game.scene='overworld';
  p.diamond=0; p.diamondMax=100; p._voltstormKills=C.VOLTSTORM_KILL_COST;
  // stand an enemy next to him
  const e=C.NPCS.find(n=>n&&n.isEnemy&&!n._dying);
  ok(!!e,'an enemy exists to test against');
  e.scene='overworld'; e.tileX=p.x+1; e.tileY=p.y; e.hp=10; e.scene=C.game.scene;
  ok(!!C.voltstormAdjacentEnemy(),'★ it is within the 1-tile reach');
  let g=C.voltstormGate();
  ok(!g.ok && /FULL ◆ SPECIAL/.test(g.why||''),'★★ refused on an empty meter, and SAYS so · "'+g.why+'"');
  p.diamond=100;
  g=C.voltstormGate();
  ok(g.ok===true,'★★★ full meter + adjacent enemy + attuned + S1 · the gate OPENS');
  p._voltstormKills=5;
  g=C.voltstormGate();
  ok(!g.ok && /15 more kills/.test(g.why||''),'★★★ the refusal names the KILLS left, a number you can act on · "'+g.why+'"');
  p._voltstormKills=C.VOLTSTORM_KILL_COST;
  // headless: no <video>, so fire() takes the straight-to-KO path
  const before=(e.hp);
  const fired=C.fireSapphireVoltstorm();
  ok(fired===true,'★★★ it FIRES');
  ok(p.diamond===0,'★ the meter is paid immediately');
  ok((p._voltstormKills||0)===0,'★★ and the CHARGE is spent on the press · 20 more to earn it back');
  // ★★★ the storm must not recharge itself
  p._voltstormKills=0;
  for (let i=0;i<25;i++) C.bumpVoltstormCharge('voltstorm');
  ok((p._voltstormKills||0)===0,'★★★ its OWN victims do not count · 25 voltstorm kills bank ZERO, or it would be a spammable field-wipe');
  for (let i=0;i<5;i++) C.bumpVoltstormCharge('punch');
  ok(C.voltstormCharge()===5,'★ punches count');
  C.bumpVoltstormCharge('zyrex');
  ok(C.voltstormCharge()===6,'★★ and so do your ZYREX’s kills · that is your faction fighting');
  for (let i=0;i<40;i++) C.bumpVoltstormCharge('punch');
  ok(C.voltstormCharge()===C.VOLTSTORM_KILL_COST,'★★ the charge CAPS · a long fight cannot bank a second storm');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
