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


H('8 · ★★★ REVOKED · THE BADGE NO LONGER RIDES ON RIZER');
{
  // ★★★ v0.95.936 · THIS SECTION IS INVERTED, NOT DELETED.
  //
  // v0.95.929 shipped on the Creator's own words -- "move the voltstorm ready
  // dom right under my cursor" -- and eight checks below used to prove the
  // badge tracked him tile by tile.  Two days later, seeing it in play:
  //
  //   "I dont want the voltstorm blue or yellow dom under rizer. move it to
  //    under the other doms In the top left and make me able to drag and drop
  //    it like other."
  //
  // The reasoning that produced the old behaviour was not wrong about attention
  // -- a live-button prompt does belong where your eyes are.  It was wrong
  // about cost: the badge landed ON the character you are trying to read, and
  // it MOVED, and a HUD element that will not hold still is one you never learn
  // the position of.  Attention is not the only thing a HUD spends.
  //
  // The checks are kept, flipped, with the ruling quoted, so the next person to
  // have the good idea of pinning it to him finds out here that it was tried.
  const A=EL.a5Charge;
  P.voltstormUnlocked=true; P.cosmeticSkin='normal';
  P._voltstormKills=5;
  A.style.left=''; A.style.top=''; A.style.transform='';
  C.paintA5Charge(true);
  ok(!C.voltstormReady(),'charging · 5/'+C.VOLTSTORM_KILL_COST);
  ok(/⚡ 5\//.test(A.textContent),'★ it still shows the count');
  ok(A.style.left==='' && A.style.top==='',
     '★★ paintA5Charge wrote NO position · the CSS default (top-left stack) stands');
  // ── ready · and it must NOT move ──
  P._voltstormKills=C.VOLTSTORM_KILL_COST;
  P.x=20; P.y=30; C._cam.x=0; C._cam.y=0;
  C.paintA5Charge(true);
  ok(C.voltstormReady(),'charged');
  ok(/VOLTSTORM READY/.test(A.textContent),'★ it says READY · the TEXT is still its job');
  ok(A.style.left==='' && A.style.top==='',
     '★★★ and it did NOT move · this is the assertion that used to say the opposite');
  // walking must not drag it either
  P.x=40; P.y=44;
  C.paintA5Charge(true);
  ok(A.style.left==='' && A.style.top==='',
     '★★★ it does not follow him · the tile→screen maths is deleted, not disabled');
  ok(!/two jobs, two homes/.test(src2),
     'the old "two jobs, two homes" split is gone from the source · one home now');
  ok(/does not follow Rizer any more|DOES NOT FOLLOW RIZER/i.test(src2),
     'and the revocation is recorded where the code is, not only here');
}

H('9 · ★★ THE STRIP FOLLOWS THE BADGE AGAIN');
{
  // ★ v0.95.936 · the companion strip used to REFUSE to anchor to the badge
  // while VOLTSTORM was ready, because the badge was out on the character and
  // the strip would have ended up stuck to his feet.  The badge no longer goes
  // anywhere, so that guard protected against a behaviour the game does not
  // have -- the kind of rule that survives three refactors and then confuses
  // somebody.  Removed with the thing it was guarding.
  P._voltstormKills=C.VOLTSTORM_KILL_COST;
  P.bonds=P.bonds||{}; P.bonds.zoryn=50; P.zorynDown=false; P.zorynHp=C.ZORYN_HP_MAX;
  C.paintA5Charge(true);
  C.paintCompanionStrip(true);
  ok(S.style.display==='block','the strip still shows');
  ok(!/&& !voltstormReady\(\)/.test(src2),
     '★★ the "only while the badge is parked" guard is gone · both are parked now');
  ok(/the badge does not ride on Rizer any more/.test(src2),
     'and the removal says why, so it is not read later as an oversight');
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
