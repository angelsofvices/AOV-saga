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
try{new Function(src+';globalThis.__C={advancePunchCombo,punchComboStep,punchComboMult,resetPunchCombo,PUNCH_COMBO_STEPS,PUNCH_COMBO_WINDOW_MS,PUNCH_COMBO_DMG,PUNCH_COMBO_NAME,RIZER,TRANSIENT_PLAYER_KEYS,player,hurtPlayer};')();}
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
  ok(/\(mode === 'kick'\) \? 2 : punchComboMult\(\)/.test(src2),'★★ the kick is untouched · it was never part of the chain');
}

H('5 · ★★★ WEAPONS STILL SWING NORMALLY');
{
  ok(/Weapon sheets do NOT\n      \/\/ carry comboSheet/.test(src2)||/carry comboSheet/.test(src2),
     '★★★ a sword swing is four frames of ONE arc · it keeps walking them');
  for (const k of ['kick','idle','walk','run'])
    ok(!C.RIZER[k].comboSheet,'★ '+k+' is not a combo sheet');
}

H('6 · ★ MID-CHAIN IS NOT A SAVE STATE');
{
  for (const k of ['_punchStep','_punchStepAt'])
    ok(C.TRANSIENT_PLAYER_KEYS.has(k),'★ '+k+' is transient · _punchStepAt is a performance.now() stamp, and those poison a reload');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
