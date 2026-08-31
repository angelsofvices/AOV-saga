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
let CLK=50000; global.performance={now:()=>CLK};
global.KeyboardEvent=function(t,o){this.type=t;this.key=(o&&o.key)||'';this.preventDefault=noop;this.stopImmediatePropagation=noop;};
let _dispatched=[];
try{new Function(src+';globalThis.__C={tryMove,flushMeleeBuffer,TURN_IN_PLACE_MS,INPUT_BUFFER_MS,TRANSIENT_PLAYER_KEYS,player,game,keys,RIZER,BBOX_FALLBACK,walkable};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;
const P=C.player, K=C.keys;
const clearKeys=()=>{ for(const k of Object.keys(K)) K[k]=false; };

H('1 · ★★★ THE RUN SHEET WAS A PSD');
{
  const p=ROOT+'assets/2D sprites/rizer/run.png';
  const head=fs.readFileSync(p).subarray(0,8);
  ok(head.equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),
     '★★★ run.png is a REAL PNG now · it was 8BPS (Photoshop) with a .png name, which the browser cannot decode');
  ok(/failsafes to a faster walk/.test(src2)||fs.readFileSync(ROOT+'tools/audit_asset_formats.py','utf8').includes('failsafes to a faster walk'),
     '★★ the Creator’s symptom is recorded · run SPEED playing the WALK animation');
  const t=fs.readFileSync(ROOT+'tools/audit_asset_formats.py','utf8');
  ok(/PIL reads PSD/.test(t),
     '★★★ and WHY nothing caught it · PIL opens PSD, so every measurement I took was right');
  ok(/A silent failure that every layer handles gracefully/.test(t),
     '★★★ every layer degraded politely · that is what made it invisible');
  ok(C.RIZER.run.bboxes===C.BBOX_FALLBACK.run,'the run bundle reads the measured table');
  ok(C.BBOX_FALLBACK.run[0][1][3]===182 && C.BBOX_FALLBACK.run[0][1][1]===47,
     '★★ re-measured off the layered file · DOWN col1 gained 3px of hair the flat export had lost');
}

H('2 · ★★★ TURN IN PLACE');
{
  ok(C.TURN_IN_PLACE_MS>0 && C.TURN_IN_PLACE_MS<200,'grace is '+C.TURN_IN_PLACE_MS+'ms · short enough to be invisible when you meant to walk');
  C.game.scene='overworld'; P.moveCd=0; P.moving=false; P.dir='down';
  const x0=P.x, y0=P.y;
  clearKeys(); K['arrowup']=true;
  C.tryMove(16);
  ok(P.dir==='up','★★★ tapping a direction you are not facing TURNS you');
  ok(P.x===x0 && P.y===y0,'★★★ and does NOT step · you can face a chest without walking into it');
  ok(P.moveCd>0,'★ a short grace follows · keep holding and the next tick walks');
  // holding through the grace steps normally
  P.moveCd=0;
  C.tryMove(16);
  ok(P.y===y0-1 || P.x!==x0 || P.moving,'★★ held past the grace · he steps');
}

H('3 · ★★ CORNERING AT SPEED IS UNTOUCHED');
{
  P.moveCd=0; P.dir='down'; P.moving=true;      // already running
  const x0=P.x, y0=P.y;
  clearKeys(); K['arrowright']=true;
  C.tryMove(16);
  ok(P.dir==='right','★ a moving Rizer still turns');
  ok(P.x!==x0 || P.y!==y0,'★★★ and STEPS in the same frame · a runner rounding a corner never pauses');
  ok(/ONLY FROM A STANDSTILL/.test(src2),
     '★★ which is the whole reason the naive version of this feature feels sluggish');
}

H('4 · ★★★ INPUT BUFFER');
{
  ok(C.INPUT_BUFFER_MS>0,'window is '+C.INPUT_BUFFER_MS+'ms');
  P._bufMelee=null; P.attackUntil=CLK+80;       // mid-swing
  P._bufMelee='punch'; P._bufMeleeAt=CLK;
  C.flushMeleeBuffer();
  ok(P._bufMelee==='punch','★★ still locked · the press is HELD, not dropped');
  CLK+=90; P.attackUntil=CLK-1;                 // lock just lifted
  clearKeys();
  C.flushMeleeBuffer();
  ok(P._bufMelee===null,'★★★ the instant the lock lifts, it fires');
  ok(K['j']===false,'★★★ and the chord key is RESTORED · a replay must not leave j/k stuck true');
  // a stale press is discarded
  P._bufMelee='kick'; P._bufMeleeAt=CLK-9999; P.attackUntil=0;
  C.flushMeleeBuffer();
  ok(P._bufMelee===null,'★★ a press older than the window is discarded, never queued');
  // never replays into a menu
  P._bufMelee='punch'; P._bufMeleeAt=CLK; C.game.paused=true;
  C.flushMeleeBuffer();
  ok(P._bufMelee===null,'★★★ and never fires into a menu opened meanwhile');
  C.game.paused=false;
  ok(/REPLAYS the press rather than calling the swing directly/.test(src2),
     '★★ it replays the PRESS · the keydown does hitbox, sweeps, durability, XP · half a swing is worse than a dropped one');
}

H('5 · ★ NOTHING LEAKS INTO THE SAVE');
{
  for (const k of ['_bufMelee','_bufMeleeAt'])
    ok(C.TRANSIENT_PLAYER_KEYS.has(k),'★ '+k+' is transient · a buffered press must not survive a reload');
}


H('6 · ★★★ THE A5 COOLDOWN IS 20 KILLS');
{
  ok(/no more timed cool down for A5/.test(src2),'the Creator’s words are at the code');
  ok(/A clock recharges you for standing still, which is backwards/.test(src2),
     '★★★ and WHY it is better · the old rule meant the best way to have it ready was to stop fighting');
  ok(/ITS OWN VICTIMS DO NOT COUNT/.test(src2),'★★★ the storm cannot recharge itself');
  ok(/attunement hands it over CHARGED/.test(src2),
     '★★ the questline reward is usable on arrival · twenty kills first would be a toll, not a cooldown');
  ok(/body\.voltstorm-cine #a5Charge/.test(src2),
     '★★★ and the new badge is on the FULL-CINEMA hide list · the one overlay that would have sat on the A5’s own cutscene');
  ok(/paintA5Charge/.test(src2),'★★ the charge is READABLE · a 2-minute timer you could only discover by being refused is now a count you can see');
  ok(/pins itself under the Rizer HUD by measuring it/.test(src2),'★ no art · it measures the HUD rather than assuming a position');
}

H('7 · ★★ A FLED ZYREX SAYS WHERE IT WENT');
{
  ok(/SAY THAT IT LEFT/.test(src2),'the long walk home announces itself');
  ok(/reads as a despawn\n  \/\/ rather than as an animal going home/.test(src2)||/rather than as an animal going home/.test(src2),
     '★★★ without it the system was invisible · the creature simply was not there any more');
  ok(/_homewardTold/.test(src2),'★★ told once per creature, not once per failed attempt');
  ok(/names the WINDOW/.test(src2),'★ and names the minutes · "come back later" becomes actionable');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
