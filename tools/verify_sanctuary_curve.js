#!/usr/bin/env node
/* verify_sanctuary_curve.js · v0.96.35
 *   Creator: "500 tier 1 zyrex to hit 3330 bond. scale all other tiers to this
 *   baseline. exponential. span the whole game."
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== THE SANCTUARY CURVE ===\n');

const noop=()=>{};const _Q=[];let CLOCK=1000;
global.setInterval=()=>0;global.setTimeout=fn=>{_Q.push(fn);return 0;};
global.clearInterval=noop;global.clearTimeout=noop;
const CTX=new Proxy({},{get:(_,k)=>{if(k==='measureText')return()=>({width:10});
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop:noop});
 if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4),width:1,height:1});
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
const PLAYED=[];
global.Audio=function(s2){return{_s:s2,play(){PLAYED.push(s2);return Promise.resolve();},
 pause:noop,addEventListener:noop,volume:1,currentTime:0,cloneNode(){return this;}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__C={SANCTUARY_T1_BOND,SANCTUARY_TIER_K,sanctuaryTierBond,
  sanctuaryBondValue,BOND_EVENTS,SPECIES,SANCTUARY_DUPLICATE_RATE,
  AUDIO,showLevelUpBanner,playSFX};`)();
let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const C=globalThis.__C;

/* ── ★★★ the Creator's anchor, exactly ─────────────────────────────── */
const T1=C.sanctuaryTierBond(1);
t(Math.abs(T1 - 3330/500) < 1e-9,
  `★★★ a Tier 1 rescue is ${T1.toFixed(3)} bond · 3330 / 500, exactly the anchor `
  + 'given. Every other tier is that number carried up a curve, not a second set '
  + 'of invented values');
t(Math.abs(500*T1 - 3330) < 1e-6,
  '★★★ 500 Tier 1 donations = 3330 points earned · the sentence, satisfied');

/* ── exponential, and k fitted to the roster ───────────────────────── */
t(C.SANCTUARY_TIER_K === 1.4, `★ k = ${C.SANCTUARY_TIER_K}`);
const pts={}; for(let i=1;i<=10;i++) pts[i]=C.sanctuaryTierBond(i);
const ratios=[]; for(let i=2;i<=10;i++) ratios.push(pts[i]/pts[i-1]);
t(ratios.every(r=>Math.abs(r-1.4)<1e-9),
  '★★ every step up a tier multiplies by the same 1.4 · EXPONENTIAL, not a '
  + 'hand-tuned table that happens to rise');
console.log('         ' + [1,2,3,4,5,6,7,8,9,10].map(i=>`T${i} ${pts[i].toFixed(1)}`).join(' · '));

/* ── ★★★ "span the whole game" · measured against the real roster ──── */
const roster=JSON.parse(fs.readFileSync(path.join(ROOT,'data/staple_roster_v1.json'),'utf8'));
const sp=roster.species||roster;
const counts={}; for(const s of sp){ const t2=+s.tier; if(t2) counts[t2]=(counts[t2]||0)+1; }
const complete=Object.entries(counts).reduce((a,[t2,n])=>a+pts[t2]*n,0);
t(complete > 3330 && complete < 4600,
  `★★★ a COMPLETE sanctuary (all ${sp.length} species, once each) = ${complete.toFixed(0)} bond · `
  + 'just over the 3,330 full bond. That is what "span the whole game" has to '
  + 'mean — the complete sanctuary IS the complete journey, with nothing left '
  + `over. k=1.3 tops out at 2,943 and can never reach it; k=1.5 hits 5,325 and `
  + 'you finish long before the roster does');

/* ── ★★★ the path cap STANDS · asked, not assumed ──────────────────── */
const code=H.replace(/^\s*\/\/.*$/gm,'');
t(/pathCap|1665|CAP/.test(H),
  '★ the 1665 path cap is still in the file');
t(/AND THE 1665 PATH CAP STANDS/.test(H),
  '★★★ and the decision is RECORDED · the Creator\'s sentence reads as though the '
  + 'sanctuary alone reaches 3330. The anchor is the RATE; the cap is the LAW. '
  + 'A complete sanctuary is a complete route to HALF your bond and the Rizer '
  + 'path must supply the other half [[aov-rizer-bond-formula]]');

/* ── ★★★ the curve is computed in ONE place ────────────────────────── */
t(C.BOND_EVENTS.zyrexSanctuary.pts === 1,
  `★★★ zyrexSanctuary.pts is ${C.BOND_EVENTS.zyrexSanctuary.pts} · sanctuaryBondValue now returns the `
  + 'FULL bond, so leaving pts at 5 would have applied the curve TWICE — a T10 '
  + 'rescue worth 688 instead of 138, and nothing in the game would have '
  + 'complained');

/* ── duplicates still quartered ────────────────────────────────────── */
t(C.SANCTUARY_DUPLICATE_RATE === 0.25,
  `★★ duplicates are still quarter value (${C.SANCTUARY_DUPLICATE_RATE}) · without it you could farm `
  + 'one common species to max bond and the tier curve would mean nothing');
const fake={speciesId:'__not_a_species__', tier:5};
t(Math.abs(C.sanctuaryBondValue(fake) - pts[5]) < 1e-9,
  '★ an unrecorded species pays full curve value');

/* ── ★★ THE LEVEL-UP CHIME ─────────────────────────────────────────── */
t(fs.existsSync(path.join(ROOT,'audio/sfx-level-up-chime.mp3')), '★ the chime ships');
t(!!C.AUDIO.sfx.levelUpChime, '★ it is registered as its own key');
t(!!C.AUDIO.sfx.levelUp && C.AUDIO.sfx.levelUp._s !== C.AUDIO.sfx.levelUpChime._s,
  '★★★ the existing `levelUp` VO is UNTOUCHED and is a different file · ten other '
  + 'events borrow that key (the Omniris trial, a homecoming, every evolution), '
  + 'so overwriting it would have put a chime in all ten places and silently '
  + 'retired a voice line');
PLAYED.length=0;
C.showLevelUpBanner();
t(PLAYED.some(s2=>/level-up-chime/.test(String(s2))),
  '★★★ DRIVEN · raising the banner plays the chime · it fires from '
  + 'showLevelUpBanner, the one place the banner is raised, so it can never '
  + 'drift out of sync with the thing it announces');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
