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
let CLK=200000; global.performance={now:()=>CLK};
try{new Function(src+';globalThis.__C={kickComboStep,kickComboMult,resetKickCombo,advanceKickCombo,KICK_COMBO_DMG,KICK_COMBO_NAME,RIZER_POWER_PUNCH,punchIsUnarmed,advancePunchCombo,punchComboStep,punchComboMult,resetPunchCombo,PUNCH_COMBO_STEPS,PUNCH_COMBO_WINDOW_MS,PUNCH_COMBO_DMG,PUNCH_COMBO_NAME,RIZER,TRANSIENT_PLAYER_KEYS,player,hurtPlayer};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;
const P=C.player;

H('1 · ★★★ FOUR DIFFERENT BLOWS, ONE PER PRESS');
{
  const b=C.RIZER.punch;
  ok(fs.existsSync(ROOT+'assets/2D sprites/rizer/punch.png'),'★ the sheet is on disk');
  ok(fs.readFileSync(ROOT+'assets/2D sprites/rizer/punch.png').subarray(0,8)
       .equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),'★ and it is a real PNG');
  ok(b.comboSheet===true,'★★★ flagged comboSheet · the draw HOLDS a column instead of walking the row');
  ok(C.PUNCH_COMBO_NAME.length===4,'★ four named beats: '+C.PUNCH_COMBO_NAME.join(' → '));
  // the four columns must READ APART in silhouette, which is the whole ask
  const w=b.bboxes[0].map(x=>x[2]), h=b.bboxes[0].map(x=>x[3]);
  ok(new Set(w).size===4,'★★★ four DISTINCT widths on the DOWN row · '+w.join('/')+' · not the same jab');
  ok(w[3]===Math.max(...w),'★★ the backfist is the widest · full cape follow-through');
  ok(h[2]===Math.max(...h) && w[2]<w[1],
     '★★★ the elbow is NARROW and TALLEST ('+w[2]+'w '+h[2]+'h) · it folds vertically, exactly as spec’d');
}

H('2 · ★★★ THE CHAIN ADVANCES, THEN RESETS');
{
  C.resetPunchCombo();
  ok(C.punchComboStep()===0,'starts on the jab');
  C.advancePunchCombo(CLK);      ok(C.punchComboStep()===0,'★ first press = step 0 · the jab');
  CLK+=200; C.advancePunchCombo(CLK); ok(C.punchComboStep()===1,'★★ second press inside the window = the cross');
  CLK+=200; C.advancePunchCombo(CLK); ok(C.punchComboStep()===2,'★★ third = the elbow');
  CLK+=200; C.advancePunchCombo(CLK); ok(C.punchComboStep()===3,'★★★ fourth = the backfist · every press a different blow');
  CLK+=200; C.advancePunchCombo(CLK); ok(C.punchComboStep()===0,'★ and it wraps back to the jab');
  // a lapse resets
  CLK+=C.PUNCH_COMBO_WINDOW_MS+50; C.advancePunchCombo(CLK);
  ok(C.punchComboStep()===0,'★★★ let the window lapse ('+(C.PUNCH_COMBO_WINDOW_MS)+'ms) and you start over');
}

H('3 · ★★ A HIT TAKEN BREAKS IT');
{
  C.resetPunchCombo();
  CLK+=10; C.advancePunchCombo(CLK); CLK+=100; C.advancePunchCombo(CLK);
  ok(C.punchComboStep()===1,'mid-chain');
  P.hp=50; P.hpMax=100; P._invulnUntil=0; P.blocking=false; P.ufoFlying=false;
  C.hurtPlayer(1,'mori');
  ok(C.punchComboStep()===0,'★★★ taking a hit resets it · you have to stay on the offensive to reach the finisher');
  ok(/taking a hit breaks the chain/.test(src2),'the rule is at the code');
}

H('4 · ★★ THE FINISHER IS WORTH REACHING');
{
  const D=C.PUNCH_COMBO_DMG;
  ok(D.length===4,'four multipliers · '+D.join(' / '));
  ok(D[3]===Math.max(...D),'★★ the backfist hits hardest');
  ok(D[0]<1,'★ and the jab is the cheapest blow');
  const avg=D.reduce((a,b)=>a+b,0)/4;
  ok(Math.abs(avg-1.125)<0.001,'★★★ a full chain averages ×'+avg.toFixed(3)+' · a reward for staying in, not a rebalance');
  C.resetPunchCombo();
  ok(C.punchComboMult()===D[0],'★ the multiplier follows the step');
  CLK+=10; C.advancePunchCombo(CLK); CLK+=10; C.advancePunchCombo(CLK); CLK+=10; C.advancePunchCombo(CLK); CLK+=10; C.advancePunchCombo(CLK);
  ok(C.punchComboMult()===D[3],'★★ and on the finisher it is ×'+D[3]);
  // ★ v0.95.931 INVERTED: this asserted the kick sat OUTSIDE the chain, true
  // for exactly two versions.  Creator: "here is new kick animation sheet.
  // manual master. wire the combo."  The kick now has its own chain, and the
  // punch multiplier must still not leak into it.
  ok(/\(mode === 'kick'\) \? 2 \* kickComboMult\(\) : punchComboMult\(\)/.test(src2),
     '★★★ the kick runs its OWN multiplier now, not the punch’s · the two never cross');
}

H('5 · ★★★ WEAPONS STILL SWING NORMALLY');
{
  ok(/Weapon sheets do NOT\n      \/\/ carry comboSheet/.test(src2)||/carry comboSheet/.test(src2),
     '★★★ a sword swing is four frames of ONE arc · it keeps walking them');
  // ★ v0.95.931 INVERTED: `kick` was on this list until it became a chain too.
  for (const k of ['idle','walk','run'])
    ok(!C.RIZER[k].comboSheet,'★ '+k+' is not a combo sheet');
  ok(C.RIZER.kick.comboSheet===true,'★★ but the KICK is one now · v0.95.931');
}

H('6 · ★ MID-CHAIN IS NOT A SAVE STATE');
{
  for (const k of ['_punchStep','_punchStepAt'])
    ok(C.TRANSIENT_PLAYER_KEYS.has(k),'★ '+k+' is transient · _punchStepAt is a performance.now() stamp, and those poison a reload');
}


H('7 · ★★★ S2 CARRIES THE SAME FOUR BEATS');
{
  const b=C.RIZER_POWER_PUNCH;
  ok(fs.existsSync(ROOT+'assets/2D sprites/rizer/punch-power-upgrade.png'),'★ the S2 sheet is on disk');
  ok(fs.readFileSync(ROOT+'assets/2D sprites/rizer/punch-power-upgrade.png').subarray(0,8)
       .equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),'★ real PNG');
  ok(b.comboSheet===true,'★★ Rakoron chains too');
  const w=b.bboxes[0].map(x=>x[2]);
  ok(new Set(w).size===4,'★★★ four distinct widths · '+w.join('/'));
  ok(w[3]===Math.max(...w),'★★ backfist widest');
  let elbowTallest=0;
  b.bboxes.forEach(r=>{ const h=r.map(x=>x[3]); if (h[2]===Math.max(...h)) elbowTallest++; });
  ok(elbowTallest===4,'★★★ the elbow is the TALLEST pose in ALL FOUR rows · the rise is drawn in, every direction');
  b.bboxes.forEach((r,ri)=>{
    const fl=r.map(x=>x[1]+x[3]); const sp=Math.max(...fl)-Math.min(...fl);
    ok(sp<=1,'★ row '+ri+' floor spread '+sp+'px · his boots hold through the chain');
  });
  const ov=[];
  b.bboxes.forEach((r,ri)=>r.forEach((c,ci)=>{ if(c[0]<0||c[1]<0) ov.push(ri+','+ci); }));
  ok(ov.length===3,'★★ 3 owned overflows ('+ov.join(' ')+') · cape off the side, gauntlet off the top · kept, not clipped');
}

H('8 · ★★★ constScale · THE MISS FROM v0.95.920');
{
  ok(C.RIZER.punch.constScale===true,'★★★ S1 punch opts OUT of the forced idle height');
  ok(C.RIZER_POWER_PUNCH.constScale===true,'★★★ and so does S2');
  ok(/MISSED AT v0\.95\.920 AND IT MATTERED/.test(src2),'the miss is owned at the code');
  ok(/flattens a measured 13\.4% height difference/.test(src2),
     '★★★ measured, not asserted · and the frame it flattens hardest is the ELBOW, whose whole identity is that it rises');
}

H('9 · ★★ THE CHAIN IS UNARMED');
{
  const P3=C.player;
  P3.cosmeticSkin='normal';
  P3.swordEquipped=false; P3.axeEquipped=false; P3.bowEquipped=false; P3.rubypawEquipped=false;
  ok(C.punchIsUnarmed()===true,'bare fists');
  C.resetPunchCombo(); CLK+=10; C.advancePunchCombo(CLK); CLK+=10; C.advancePunchCombo(CLK);
  CLK+=10; C.advancePunchCombo(CLK); CLK+=10; C.advancePunchCombo(CLK);
  ok(C.punchComboMult()===1.5,'★ unarmed finisher is ×1.5');
  P3.swordEquipped=true; P3.swordBroken=false;
  ok(C.punchIsUnarmed()===false,'★★ Sapphire Tearsword in hand');
  ok(C.punchComboMult()===1,'★★★ and the chain multiplier drops to ×1 · the sword ran through the SAME dmgMult and was being combo-scaled invisibly');
  P3.swordEquipped=false;
  ok(C.punchComboMult()===1.5,'★ and returns when you sheathe it');
  ok(/there was nothing on screen to earn it/.test(src2),'the reason is recorded · no sheet shows a chain with a blade in hand');
}


H('10 · ★★★ THE KICK CHAIN');
{
  const b=C.RIZER.kick;
  ok(b.comboSheet===true,'★★ the kick sheet is a combo sheet · the draw HOLDS a column');
  ok(b.constScale===true,'★★ and opts out of the forced idle height · the rising knee is meant to be taller');
  ok(C.KICK_COMBO_NAME.length===4,'★ four beats: '+C.KICK_COMBO_NAME.join(' → '));
  // RIGHT must match LEFT exactly · he mirrored it himself, I only fixed the order
  const L=b.bboxes[1], R=b.bboxes[2];
  ok(L.every((x,i)=>x[2]===R[i][2] && x[3]===R[i][3]),
     '★★★ RIGHT and LEFT are the same four poses in the same ORDER · w '+L.map(x=>x[2]).join('/'));
  ok(b.bboxes[3].every(x=>x[1]<0),
     '★★★ UP keeps its negative by ('+b.bboxes[3].map(x=>x[1]).join('/')+') · the raised boot leaves the cell and is OWNED');
  ok(/186 pixels inside row 2/.test(src2),
     '★★★ and the trap is recorded · a plain rectangle swap moved the UP row’s boots with it');
}

H('11 · ★★ IT ADVANCES, RESETS, AND ESCALATES');
{
  C.resetKickCombo();
  ok(C.kickComboStep()===0,'starts on the low snap');
  CLK+=10; C.advanceKickCombo(CLK); ok(C.kickComboStep()===0,'★ press one');
  CLK+=100; C.advanceKickCombo(CLK); ok(C.kickComboStep()===1,'★★ press two · '+C.KICK_COMBO_NAME[1]);
  CLK+=100; C.advanceKickCombo(CLK); ok(C.kickComboStep()===2,'★★ press three · '+C.KICK_COMBO_NAME[2]);
  CLK+=100; C.advanceKickCombo(CLK); ok(C.kickComboStep()===3,'★★★ press four · '+C.KICK_COMBO_NAME[3]);
  ok(C.kickComboMult()===1.5,'★★ finisher ×1.5, on top of the kick’s own ×2');
  CLK+=C.PUNCH_COMBO_WINDOW_MS+50; C.advanceKickCombo(CLK);
  ok(C.kickComboStep()===0,'★ and a lapse starts it over');
  ok(/2 \* kickComboMult\(\)/.test(src2),'★★★ the chain rides ON TOP of the ×2 · a kick is still the heavy attack');
}

H('12 · ★★ THE TWO CHAINS ARE INDEPENDENT');
{
  C.resetPunchCombo(); C.resetKickCombo();
  CLK+=10; C.advancePunchCombo(CLK); CLK+=10; C.advancePunchCombo(CLK);
  ok(C.punchComboStep()===1 && C.kickComboStep()===0,
     '★★ punching does not advance the kick chain');
  CLK+=10; C.advanceKickCombo(CLK);
  ok(C.punchComboStep()===1,'★★ and kicking does not advance the punch chain');
  ok(/Creator.s call to make rather than mine to assume/.test(src2),
     '★★★ shared-vs-independent is flagged as HIS call · a shared counter is more interesting and much harder to balance');
  ok(/no weapon in the game swaps the kick sheet/.test(src2),
     '★★ and the kick needs no armed\/unarmed split · every weapon branch is gated on mode === punch');
  ok(C.TRANSIENT_PLAYER_KEYS.has('_kickStep') && C.TRANSIENT_PLAYER_KEYS.has('_kickStepAt'),
     '★ mid-chain is not a save state');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
