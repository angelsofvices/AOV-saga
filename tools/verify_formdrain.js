#!/usr/bin/env node
/* verify_formdrain.js · v0.96.41 · HOLDING A FORM COSTS ◆ SPECIAL
 *
 *   Creator: "I want s2 and s3 forms to burn stamina at a fixed cost. once it
 *   runs out, rizer goes back to s1." — then chose BLUE over stamina.
 *
 * ★★ WHY NOT STAMINA. ⚡ pays for SPRINT (18/s) and DODGE (20/roll) — the two
 *   things you need most while transformed, so draining it would make the power
 *   form slow and unevasive. It also regenerates at 22/s after 600ms idle, so
 *   standing still would refill the form forever.
 *
 * ★★★ AND BLUE'S OBVIOUS OBJECTION DOES NOT EXIST. Voltstorm needs a FULL ◆
 *   bar, so a constant drain looks like it locks the ultimate out — except
 *   Voltstorm is already S1-ONLY (voltstormGate refuses when isRizerPowered()).
 *   Checked before building, not assumed.
 *
 * ★★ ◆ is EARNED BY FIGHTING (slam +15, throw +20, every kill), so the form is
 *   fuelled by combat: it sustains through a fight and lapses when the fight
 *   ends, with no timer anywhere.
 *
 * ★★★ THE HAZARD THIS EXPOSED. applyPlayerSkin never touched the weapon flags.
 *   Survivable while the only way out of S2 was a deliberate toggle — but an
 *   AUTOMATIC drop makes the broken state reachable by accident: you run out of
 *   ◆ mid-swing and land in S1 still holding the Rubypaw, an S2-only blade read
 *   at 16 sites. Fixed in BOTH directions (fix the class, not the instance).
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== LOAD RESCUE · no save may land you outside the world ===\n');
const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='createPattern')return()=>({});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 if(k==='createImageData')return(w,h)=>({data:new Uint8ClampedArray(Math.max(1,w*h*4)),width:w,height:h});
 if(k==='canvas')return{width:960,height:540};return()=>{};}});
const _els=new Map();
const mk=id=>({id,style:{display:'none'},dataset:{},_buttons:[],
 classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
 width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],
 getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,
 removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,
 remove:noop,replaceChildren:noop,cloneNode(){return mk(id);},pause:noop,
 play:()=>Promise.resolve(),load:noop,currentTime:0,
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
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__D={player,game,PLAYER_SKINS,tickFormDrain,dropRizerForm,
 syncFormWeapons,formDrainPerSec,FORM_DRAIN_PER_SEC,FORM_WARN_FRAC,rizerFormId,
 isRizerPowered,isRizerS1,setPlayerSkin,togglePlayerSkin,changePlayerDiamond,enterLuminaryForm,canEnterRizerForm,
 S1_WEAPON_RING,startNewGame,worldFrozen,rizerSpecialFactor,
 setDialog:v=>{dialogState=v;}};`)();
let n=0;while(_Q.length&&n<500){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;console.log=LOG;const D=globalThis.__D;
const drain=()=>{let k=0;while(_Q.length&&k<400){const f=_Q.shift();k++;try{f();}catch(_){}}};

D.startNewGame(); drain();
D.player.rizerLvl=100; D.player.luminaryUnlocked=true; D.game.devNoDefeat=true;
// neutralise the SPECIAL attribute so the rates read raw
D.player.attrs={}; 
console.log('\n=== FORM DRAIN · ◆ SPECIAL ===\n');
t(D.FORM_DRAIN_PER_SEC.power_upgrade===3&&D.FORM_DRAIN_PER_SEC.luminary===6,
  `★ S2 ${D.FORM_DRAIN_PER_SEC.power_upgrade}/s · S3 ${D.FORM_DRAIN_PER_SEC.luminary}/s · the higher form costs double`);
// ── S1 does not drain ──
D.setPlayerSkin('normal',false); D.player.diamond=100;
for(let i=0;i<60;i++) D.tickFormDrain(16);
t(D.player.diamond===100,'★★ S1 does NOT drain · base form is free');
t(D.formDrainPerSec()===0,'   · and its rate is zero');
// ── S2 drains at 3/s ──
D.setPlayerSkin('power_upgrade',false); D.player.diamond=100; D.player._formWarned=false;
const f=D.rizerSpecialFactor?D.rizerSpecialFactor():1;
for(let i=0;i<1000/16;i++) D.tickFormDrain(16);   // ~1 second
const spent=100-D.player.diamond;
t(Math.abs(spent-3/f)<0.3,`★★★ S2 burns ${spent.toFixed(2)} ◆ in one second (rate 3, special factor ${f.toFixed(2)})`);
// ── S3 drains double ──
D.setPlayerSkin('luminary',false); D.player.diamond=100; D.player._formWarned=false;
for(let i=0;i<1000/16;i++) D.tickFormDrain(16);
const spent3=100-D.player.diamond;
t(spent3>spent*1.8,`★★★ S3 burns ${spent3.toFixed(2)} ◆ · ${(spent3/spent).toFixed(1)}x S2`);
// ── a frozen world does not burn ──
D.player.diamond=100; D.setDialog({speaker:'x',lines:['y'],idx:0,at:0});
for(let i=0;i<120;i++) D.tickFormDrain(16);
t(D.player.diamond===100,'★★★ dialogue open · the form does NOT burn');
D.setDialog(null);
D.game.zphoneOpen=true; D.player.diamond=100;
for(let i=0;i<120;i++) D.tickFormDrain(16);
t(D.player.diamond===100,'★★★ phone open (worldFrozen) · does NOT burn');
D.game.zphoneOpen=false;
// ── tab-restore spike ignored ──
D.player.diamond=100; D.tickFormDrain(60000);
t(D.player.diamond===100,'★★ a 60s tab-restore delta is ignored · no instant collapse');
// ── the warning, once ──
D.setPlayerSkin('luminary',false); D.player.diamond=100; D.player._formWarned=false;
// ★ 600 frames is only 9.6s = 57.6 of 100 burnt; the threshold is 20% so the
//   warning cannot possibly have fired yet. Run until it does, or give up.
let warnedAt=-1;
for(let i=0;i<2000&&warnedAt<0;i++){ D.tickFormDrain(16); if(D.player._formWarned) warnedAt=i; }
t(warnedAt>0,`★★ the LOW warning fires on the way down (frame ${warnedAt}, ◆ ${D.player.diamond.toFixed(1)})`);
t(D.player._formWarned===true,'   · and latches, so it cannot repeat');
// ── the drop ──
D.setPlayerSkin('luminary',false); D.player.diamond=8; D.player._formWarned=true;
let dropped=false;
for(let i=0;i<400&&!dropped;i++){ D.tickFormDrain(16); if(D.isRizerS1()) dropped=true; }
t(dropped,'★★★ ◆ hits zero → he FALLS BACK TO S1');
t(D.player.diamond<=0.001,'   · with the meter empty');
t(D.player._formWarned===false,'★ and the warning re-arms for the next transformation');
// ── ★ the weapon hazard ──
D.setPlayerSkin('power_upgrade',false); D.player.rubypawEquipped=true;
D.dropRizerForm();
t(D.player.rubypawEquipped===false,'★★★ dropping S2→S1 STOWS the Rubypaw · no S2 blade in S1 hands');
D.setPlayerSkin('normal',false);
for(const W of D.S1_WEAPON_RING) D.player[W.equipFlag]=true;
D.setPlayerSkin('luminary',false);
t(D.S1_WEAPON_RING.every(W=>!D.player[W.equipFlag]),
  '★★★ and going UP stows the S1 ring · the hole was open in both directions');

// ── ★ cannot transform on fumes ──
D.setPlayerSkin('normal',false); D.player.diamond=2;
D.togglePlayerSkin(false);
t(D.isRizerS1(),'★★★ ◆ at 2 · the transform is REFUSED, not granted-then-collapsed');
D.player.diamond=100; D.togglePlayerSkin(false);
t(!D.isRizerS1(),'★ with a full bar it transforms normally');
D.setPlayerSkin('normal',false); D.player.diamond=2;
t(D.enterLuminaryForm()===false,'★★ and the R3 gesture is refused on fumes too');
t(D.isRizerS1(),'   · he stays S1');
console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
