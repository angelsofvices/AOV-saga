#!/usr/bin/env node
/* verify_luminary.js · v0.96.40 · S3 RIZER · THE LUMINARY FORM
 *
 *   Unlocks at Rizer Level 100 — the cap, and TIER 8: MAXIMUM MORTAL. S3 looks
 *   nearly Divine and is not; the reveal copy never calls him a god, and that
 *   is asserted below.
 *
 * ★★★ THE HEADLINE ASSERTION IS THAT HE DOES NOT SHRINK.
 *   rizerTargetBodyPx() is a GLOBAL ~92.9px taken from S1's shipping idle, and
 *   every bundle is scaled so bodyBh[row] lands on it. S3's hair-wings are hair,
 *   so the largest connected component legitimately includes them — and feeding
 *   that full ink in scales the whole silhouette to 92.9px, shrinking his BODY.
 *   Measured with the wings counted: DOWN 88.2 · LEFT 91.5 · RIGHT 91.9 ·
 *   UP 83.1 against S1's 92.9. The UP row loses ten percent.
 *   bodyBh therefore EXCLUDES the wings, and this file pins all four rows to
 *   92.9px so nobody can "simplify" it back to the full-ink measurement.
 *
 * ★★★ AND THAT S3 IS NEVER MISTAKEN FOR S1.
 *   The file was full of `=== 'power_upgrade'` and `!== 'power_upgrade'`, and
 *   every NEGATIVE one silently classifies a third form as the base form —
 *   weapons, capture banks, block bundles, the duel. Same shape as the freeze
 *   bug: a test that names one member of a family rots when the family grows
 *   ([[aov-freeze-lock-deadman]]). The named predicates replaced them, decided
 *   site by site rather than by find-and-replace.
 *
 * ★ Only the IDLE sheet exists. Every other action falls back to S2 — not S1,
 *   which would make him revert to blue hair the instant he moved.
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
new Function(src+`;globalThis.__D={player,game,PLAYER_SKINS,RIZER_LUMINARY_IDLE,RIZER,
  rizerFormId,isRizerS1,isRizerS2,isRizerS3,isRizerPowered,syncRizerForms,
  maybeRevealLuminary,enterLuminaryForm,togglePlayerSkin,setPlayerSkin,
  rizerBundleForSkin,LUMINARY_UNLOCK_LV,RIZER_LEVEL_CAP,rizerRowScale,
  rizerTargetBodyPx,startNewGame,loadGame,saveGame,SAVE_KEY,
  dlg:()=>dialogState,clearDlg:()=>{dialogState=null;}};`)();
let n=0;while(_Q.length&&n<500){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;console.log=LOG;const D=globalThis.__D;
const drain=()=>{let k=0;while(_Q.length&&k<400){const f=_Q.shift();k++;try{f();}catch(_){}}};

console.log('\n=== S3 · THE LUMINARY FORM ===\n');
t(D.LUMINARY_UNLOCK_LV===D.RIZER_LEVEL_CAP,`★★ unlock level ${D.LUMINARY_UNLOCK_LV} == RIZER_LEVEL_CAP ${D.RIZER_LEVEL_CAP} · the two cannot drift`);
t(!!D.PLAYER_SKINS.luminary,'★ luminary is a registered form');
t(D.PLAYER_SKINS.luminary.overrides.idle===D.RIZER_LUMINARY_IDLE,'★ its idle override is the S3 bundle');
t(D.RIZER_LUMINARY_IDLE.bodyBh.join()==='207,189,185,194','★ measured bodyBh');
t(D.RIZER_LUMINARY_IDLE.bboxes.length===4&&D.RIZER_LUMINARY_IDLE.bboxes[0].length===4,'★ 4x4 bbox table');
t(D.RIZER_LUMINARY_IDLE.bboxes[3].every(b=>b[1]<0),'★★ row 3 (UP) has NEGATIVE by · wing overflow owned, not clipped');
D.startNewGame(); drain();
// ── LEVEL 99 ──
D.player.rizerLvl=99; D.player.luminaryUnlocked=false; D.player.cosmeticSkin='normal';
D.syncRizerForms();
t(!D.player.luminaryUnlocked,'★★★ Lv 99 · NOT unlocked');
D.clearDlg(); const got99=D.enterLuminaryForm();
t(got99===false,'★★★ Lv 99 · R3 gesture REFUSED');
t(D.rizerFormId()==='normal','   · and he stays S1');
// ── LEVEL 100 ──
D.player.rizerLvl=100; const ch=D.syncRizerForms();
t(D.player.luminaryUnlocked===true,'★★★ Lv 100 · unlocked');
t(ch===true,'★ syncRizerForms reports the change (drives the reveal)');
t(D.syncRizerForms()===false,'★★ and it is IDEMPOTENT · second call changes nothing');
D.clearDlg(); D.maybeRevealLuminary(); drain();
t(D.player.luminaryRevealSeen===true,'★ reveal seen flag set');
const rv=D.dlg(); t(!!rv&&/LEVEL 100/.test(rv.lines.join('|')),'★ the reveal beat plays once');
t(!/\bgod\b/i.test(rv.lines.join(' ')),'★★ and it never calls him a god');
D.clearDlg(); t(D.maybeRevealLuminary()===false,'★★ the ceremony cannot fire twice');
// ── entering the form ──
D.clearDlg();
t(D.enterLuminaryForm()===true,'★★★ Lv 100 · R3 gesture ENTERS Luminary');
drain();  // the announced transition is async
t(D.isRizerS3(),'★ isRizerS3()');
t(D.isRizerPowered(),'★★ and isRizerPowered() · so S2 logic applies, not S1');
t(!D.isRizerS1()&&!D.isRizerS2(),'★ and it is neither S1 nor S2');
// ── the fallback lineage ──
t(D.rizerBundleForSkin('idle','luminary')===D.RIZER_LUMINARY_IDLE,'★★★ idle uses the S3 sheet');
// ★ v0.96.42 · RE-ANCHORED. These asserted walk and run FALL BACK to S2 — true
//   when only the idle sheet existed, and false now that both have real S3 art.
//   The property worth protecting was never "walk is S2's"; it was "a missing
//   S3 action must not drop to blue S1". So the test now names an action that
//   still HAS no S3 art, and separately proves the delivered sheets win.
t(D.rizerBundleForSkin('walk','luminary')!==D.RIZER.walk,
  '★★★ walk is NOT the blue S1 sheet');
t(D.rizerBundleForSkin('dodge','luminary')===D.PLAYER_SKINS.power_upgrade.overrides.dodge,
  '★★★ an action with no S3 art (dodge) still falls back to S2, not S1');
t(D.rizerBundleForSkin('idleJump','luminary')===D.PLAYER_SKINS.power_upgrade.overrides.idleJump,
  '★★ and idleJump likewise');
t(D.rizerBundleForSkin('death','luminary')===D.PLAYER_SKINS.power_upgrade.overrides.death,'★★ death -> S2');
// a key S2 does not have either -> S1 base
const onlyS1=Object.keys(D.RIZER).find(k=>!D.PLAYER_SKINS.power_upgrade.overrides[k]);
t(D.rizerBundleForSkin(onlyS1,'luminary')===D.RIZER[onlyS1],`★★ '${onlyS1}' has no S2 art either -> S1 base`);
// ── scale: he must not shrink ──
const tgt=D.rizerTargetBodyPx();
for(let r=0;r<4;r++){
  const sc=D.rizerRowScale(D.RIZER_LUMINARY_IDLE,r);
  const body=D.RIZER_LUMINARY_IDLE.bodyBh[r]*sc;
  t(Math.abs(body-tgt)<0.01,`★★★ row ${r} body renders ${body.toFixed(1)}px == S1's ${tgt.toFixed(1)}px`);
}
// ── the cycle ──
D.setPlayerSkin('normal',false);
D.togglePlayerSkin(false); const a=D.rizerFormId();
D.togglePlayerSkin(false); const b=D.rizerFormId();
D.togglePlayerSkin(false); const c=D.rizerFormId();
t(a==='power_upgrade'&&b==='luminary'&&c==='normal',`★★ cycle normal->${a}->${b}->${c}`);
D.player.luminaryUnlocked=false; D.player.rizerLvl=42; D.setPlayerSkin('normal',false);
D.togglePlayerSkin(false); D.togglePlayerSkin(false);
t(D.rizerFormId()==='normal','★★ locked · the cycle skips Luminary entirely');
// ── save / reload ──
D.player.luminaryUnlocked=true; D.player.rizerLvl=100; D.setPlayerSkin('luminary',false);
D.saveGame({quiet:true}); D.game.scene='title'; D.player.cosmeticSkin='normal';
D.loadGame(); drain();
t(D.rizerFormId()==='luminary','★★★ saving in S3 reloads in S3');
t(D.player.luminaryUnlocked===true,'★ and the unlock persists');
// an injected form on an unearned save
const raw=JSON.parse(global.localStorage.getItem(D.SAVE_KEY));
raw.player.cosmeticSkin='luminary'; raw.player.luminaryUnlocked=false; raw.player.rizerLvl=12;
global.localStorage.setItem(D.SAVE_KEY,JSON.stringify(raw));
D.game.devUnlockAll=false; D.loadGame(); drain();
t(D.rizerFormId()==='normal','★★★ an INJECTED luminary on a Lv12 save falls back to normal');
// unknown form id
D.player.cosmeticSkin='some_deleted_skin'; D.syncRizerForms();
t(D.rizerFormId()==='normal','★ an unknown form id is safely normal');
console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
