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
let CLK=400000; global.performance={now:()=>CLK};
// a DOM stub that actually REMEMBERS what was written, so the test reads the
// real markup instead of asserting a function ran
const EL={};
// the base element the harness already builds (canvas, listeners, etc) plus a
// REAL innerHTML/style so the test can read the markup the painters produce
function mk(id){ const base=el(); base.id=id; base.style={display:'none'}; base.innerHTML='';
  base.getBoundingClientRect=()=>({left:10,top:10,right:200,bottom:120,width:190,height:110});
  return EL[id]=base; }
['companionStrip','a5Charge','rizerHud','game'].forEach(mk);
// the canvas has an INTRINSIC size (960x528) and a CSS size · the badge maps
// world → canvas → screen through that ratio, so the stub must carry both
EL.game.width=960; EL.game.height=528;
EL.game.getBoundingClientRect=()=>({left:100,top:50,right:1060,bottom:578,width:960,height:528});
global.document={getElementById:(id)=>EL[id]||mk(id),querySelector:()=>mk('q'),querySelectorAll:()=>[],
  createElement:()=>mk('c'),addEventListener:noop,body:mk('body'),documentElement:mk('de'),head:mk('h'),
  hidden:false,visibilityState:'visible'};
try{new Function(src+';globalThis.__C={zorynIsHere,zorynNpc,ZORYN_HUD_SHOW,ZORYN_HUD_HIDE,paintA5Charge,voltstormReady,voltstormCharge,VOLTSTORM_KILL_COST,TILE,_cam,paintCompanionStrip,zorynIsCompanion,zorynIsDown,zorynHp,ZORYN_HP_MAX,ZORYN_REVIVE_ITEM,advancePunchCombo,resetPunchCombo,punchComboStep,PUNCH_COMBO_WINDOW_MS,PUNCH_COMBO_STEPS,PUNCH_COMBO_NAME,rizerInCombat,player,game,NPCS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;
const P=C.player, S=EL.companionStrip, PC=EL.punchChain;
const calm=()=>{ P._lastHurtAt=-999999; for(const n of C.NPCS){ if(n){n._chasing=false;n._aggroUntil=0;} } };

H('1 · ★★★ ZORYN’S CONDITION IS VISIBLE AT ALL');
{
  ok(/neither\n\/\/ was visible anywhere/.test(src2)||/was visible anywhere/.test(src2),
     '★★★ debt I created · you could only learn he was hurt by watching him fall over');
  P.bonds=P.bonds||{}; P.bonds.zoryn=0; P.companion=null; P.hp=100; P.hpMax=100;
  C.paintCompanionStrip(true);
  ok(S.style.display==='none','★ no companion, no strip · absent when it has nothing to say');
  P.bonds.zoryn=50; P.zorynDown=false; P.zorynHp=C.ZORYN_HP_MAX;
  // ★ v0.95.933 · he must actually BE here now, not merely recruited
  const _z=C.zorynNpc(); _z.scene=C.game.scene; _z.tileX=P.x+2; _z.tileY=P.y; P._zoHudOn=false;
  C.paintCompanionStrip(true);
  ok(S.style.display==='block' && /ZORYN/.test(S.innerHTML),'★★ with him along, his bar shows');
  ok(/120\/120/.test(S.innerHTML),'★ and reads '+C.ZORYN_HP_MAX+'/'+C.ZORYN_HP_MAX);
  P.zorynHp=30; C.paintCompanionStrip(true);
  ok(/#ff6b6b/.test(S.innerHTML),'★★★ under 25% it goes RED · you can see him failing BEFORE he drops, which is the whole point');
  P.zorynHp=80; C.paintCompanionStrip(true);
  ok(/#ffd66b/.test(S.innerHTML)||/#8fe36b/.test(S.innerHTML),'★ and recovers its colour as he does');
}

H('2 · ★★★ THE DOWN LINE CARRIES THE ANSWER');
{
  P.zorynDown=true; P.items=P.items||{}; P.items[C.ZORYN_REVIVE_ITEM]=0;
  { const _z=C.zorynNpc(); _z.scene=C.game.scene; _z.tileX=P.x+2; _z.tileY=P.y; P._zoHudOn=false; }
  C.paintCompanionStrip(true);
  ok(/ZORYN DOWN/.test(S.innerHTML),'★★ it says he is down');
  ok(/MYTHIC ELIXIR ×0/.test(S.innerHTML),'★★★ and NAMES the cure and your count · the fix is never a guess');
  ok(/you have none/.test(S.innerHTML),'★★ and tells you plainly when you cannot pay it');
  P.items[C.ZORYN_REVIVE_ITEM]=3;
  C.paintCompanionStrip(true);
  ok(/MYTHIC ELIXIR ×3/.test(S.innerHTML) && /face him, press X/.test(S.innerHTML),
     '★★★ with elixirs in the bag it tells you the ACTION · "face him, press X"');
  P.zorynDown=false;
}

H('3 · ★★ YARA SHOWS ONLY WHILE SHE IS ACTUALLY MENDING');
{
  P.companion=null; P.hp=50; calm();
  C.paintCompanionStrip(true);
  ok(!/YARA/.test(S.innerHTML),'★ not with you · nothing');
  P.companion='yara';
  C.paintCompanionStrip(true);
  ok(/YARA MENDING/.test(S.innerHTML),'★★ with her and hurt and calm · it appears');
  P.hp=P.hpMax;
  C.paintCompanionStrip(true);
  ok(!/YARA/.test(S.innerHTML),'★★★ at full HP it goes away · a permanent badge for a passive is noise');
  P.hp=50; P._lastHurtAt=CLK-100;      // in combat
  C.paintCompanionStrip(true);
  ok(!/YARA/.test(S.innerHTML),
     '★★★ and in combat it goes away · the badge appearing IS the rule being taught, no tutorial needed');
  calm();
}

// ★★★ v0.95.926 INVERTED.  Sections 4-6 asserted the punch-chain overlay for
// exactly two versions.  Creator: "I dont need players to see punch combo
// overlay thing."  The checks are kept and turned around rather than deleted,
// so the file records that the overlay existed, why it went, and that its
// removal is now the thing under test.
H('4 · ★★★ THE PUNCH-CHAIN OVERLAY IS GONE');
{
  ok(!/id="punchChain"/.test(src2),'★★★ the element is removed, not just hidden');
  ok(!/paintPunchChain/.test(src2),'★★ and the painter with it · nothing left running each frame');
  ok(!/voltstorm-cine #punchChain/.test(src2),'★ and it is off the cutscene hide list · nothing to hide');
  ok(/THE PUNCH-CHAIN OVERLAY IS GONE/.test(src2),'the removal is recorded where it lived');
  ok(/the punch chain is FELT/.test(src2),
     '★★★ and WHY · four distinct silhouettes and four impacts already tell you which blow you are on');
  ok(/Reading a HUD is not what a combo is\n\/\/ for/.test(src2)||/not what a combo is/.test(src2),
     '★★★ a meter naming what your own fists are doing is the game explaining what the animation already said');
}

H('5 · ★★ THE CHAIN ITSELF IS UNTOUCHED');
{
  ok(/jab\/cross\/elbow\/backfist still advance per/.test(src2),'the mechanic survives the overlay');
  P.swordEquipped=false; P.axeEquipped=false; P.bowEquipped=false; P.rubypawEquipped=false;
  P.cosmeticSkin='normal';
  C.resetPunchCombo();
  CLK+=10; C.advancePunchCombo(CLK);
  ok(C.punchComboStep()===0,'★ press one · the jab');
  CLK+=100; C.advancePunchCombo(CLK);
  ok(C.punchComboStep()===1,'★★ press two · the cross · the chain still advances with nothing on screen');
  CLK+=C.PUNCH_COMBO_WINDOW_MS+50; C.advancePunchCombo(CLK);
  ok(C.punchComboStep()===0,'★★ and still resets on a lapse');
}

H('6 · ★ THE COMPANION STRIP STAYS');
{
  ok(/id="companionStrip"/.test(src2),
     '★★ only the punch overlay went · Zoryn’s HP is a DECISION (revive, or fall back), which is what a readout is for');
}

H('7 · ★ THE STRIP DOES NOT SIT ON THE A5 CUTSCENE');
{
  ok(/body\.voltstorm-cine #companionStrip/.test(src2),'★★ the companion strip is on the full-cinema hide list');
  ok(!/#punchChain/.test(src2),'★ the chain needs no entry · it no longer exists (v0.95.926)');
  ok(/pure DOM, no art/.test(src2),'★ the strip is DOM · no new assets');
}


H('8 · ★★★ VOLTSTORM READY RIDES ON RIZER');
{
  const A=EL.a5Charge;
  P.voltstormUnlocked=true; P.cosmeticSkin='normal';
  // ── charging: parked under the HUD ──
  P._voltstormKills=5;
  C.paintA5Charge(true);
  ok(!C.voltstormReady(),'charging · 5/'+C.VOLTSTORM_KILL_COST);
  ok(/⚡ 5\//.test(A.textContent),'★ it shows the count');
  const parkedLeft=A.style.left, parkedTop=A.style.top;
  ok(parkedLeft==='10px','★★ and stays PARKED under the HUD · ambient info belongs with the ambient info');
  ok(A.style.transform==='none','★ no centring while parked');
  // ── ready: rides on the character ──
  P._voltstormKills=C.VOLTSTORM_KILL_COST;
  P.x=20; P.y=30; C._cam.x=0; C._cam.y=0;
  C.paintA5Charge(true);
  ok(C.voltstormReady(),'charged');
  ok(/VOLTSTORM READY/.test(A.textContent),'★ it says READY');
  ok(A.style.left!==parkedLeft || A.style.top!==parkedTop,
     '★★★ and it MOVED off the HUD · a prompt that a button is live belongs where your eyes are');
  ok(A.style.transform==='translateX(-50%)','★★ centred on him, not left-aligned');
  // the maths: world tile → canvas px → screen px through the CSS scale
  const expX=100+((20*C.TILE+C.TILE/2)-0)*(960/960);
  const expY=50 +((30*C.TILE+C.TILE)-0)*(528/528)+6;
  ok(A.style.left===Math.round(expX)+'px','★★ x lands under his tile centre ('+A.style.left+')');
  ok(A.style.top===Math.round(expY)+'px','★★ y lands just below his feet ('+A.style.top+')');
  // and it tracks him
  P.x=40;
  C.paintA5Charge(true);
  ok(A.style.left===Math.round(100+((40*C.TILE+C.TILE/2))*(960/960))+'px','★★★ it FOLLOWS him as he walks');
  ok(/two jobs, two homes/.test(src2),'the split is recorded · READY is a moment, 14\/20 is ambient');
}

H('9 · ★★ THE STRIP DOES NOT CHASE IT');
{
  P._voltstormKills=C.VOLTSTORM_KILL_COST;   // badge is out on the character
  P.bonds=P.bonds||{}; P.bonds.zoryn=50; P.zorynDown=false; P.zorynHp=C.ZORYN_HP_MAX;
  C.paintA5Charge(true);
  C.paintCompanionStrip(true);
  ok(S.style.display==='block','the strip still shows');
  ok(S.style.left==='10px',
     '★★★ pinned to the HUD, not to the badge · otherwise it would end up stuck to his feet mid-fight');
  ok(/would end up stuck to his feet/.test(src2),'and the reason is recorded');
}


H('10 · ★★★ THE BAR GOES WHEN HE DOES');
{
  const z=C.zorynNpc();
  P.bonds=P.bonds||{}; P.bonds.zoryn=50; P.zorynDown=false; P.zorynHp=C.ZORYN_HP_MAX;
  C.game.scene='overworld'; z.scene='overworld';
  P.companion=null; P.hp=P.hpMax;               // keep Yara out of the strip
  z.tileX=P.x+2; z.tileY=P.y; P._zoHudOn=false;
  C.paintCompanionStrip(true);
  ok(/ZORYN/.test(S.innerHTML),'★★ beside you · the bar shows');
  // walk away
  z.tileX=P.x+40;
  C.paintCompanionStrip(true);
  ok(!/ZORYN/.test(S.innerHTML),'★★★ across the map · it GOES · bond 50 means "recruited", not "here"');
  ok(S.style.display==='none','★ and the strip closes entirely when it has nothing to say');
  // another scene
  z.tileX=P.x+1; z.scene='interior_home'; P._zoHudOn=false;
  C.paintCompanionStrip(true);
  ok(!/ZORYN/.test(S.innerHTML),'★★ same tile numbers, different scene · still gone');
  z.scene='overworld';
}

H('11 · ★★ IT DOES NOT STROBE ON THE BOUNDARY');
{
  const z=C.zorynNpc();
  ok(C.ZORYN_HUD_HIDE>C.ZORYN_HUD_SHOW,'★★ show at '+C.ZORYN_HUD_SHOW+', hide at '+C.ZORYN_HUD_HIDE+' · hysteresis');
  P._zoHudOn=false;
  z.tileX=P.x+16; z.tileY=P.y;                  // between the two thresholds
  ok(C.zorynIsHere()===false,'★ approaching from outside · 16 tiles is not yet close enough');
  z.tileX=P.x+10; ok(C.zorynIsHere()===true,'★ inside SHOW · on');
  z.tileX=P.x+16; ok(C.zorynIsHere()===true,'★★★ drifting back out to 16 · STAYS on · walking the line does not blink it');
  z.tileX=P.x+20; ok(C.zorynIsHere()===false,'★★ past HIDE · off');
  ok(/HYSTERESIS on purpose/.test(src2),'the reason is recorded');
}

H('12 · ★★ THE DOWN LINE FOLLOWS THE SAME RULE');
{
  const z=C.zorynNpc();
  P.zorynDown=true; P.items=P.items||{}; P.items[C.ZORYN_REVIVE_ITEM]=1;
  z.tileX=P.x+2; P._zoHudOn=false;
  C.paintCompanionStrip(true);
  ok(/ZORYN DOWN/.test(S.innerHTML),'★★ standing over his body · the revive prompt is there');
  z.tileX=P.x+40; P._zoHudOn=false;
  C.paintCompanionStrip(true);
  ok(!/ZORYN DOWN/.test(S.innerHTML),
     '★★★ walked away · it goes too · a body you have left is not a decision you are making');
  ok(/the toast already told you it happened/.test(src2),
     '★★ and you were told once when he fell · come back and the prompt returns');
  P.zorynDown=false;
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
