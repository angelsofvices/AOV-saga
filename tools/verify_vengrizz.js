#!/usr/bin/env node
/* verify_vengrizz.js · v0.96.33
 *   Creator: "make vengrizz tier 4 level 40 at base"
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== VENGRIZZ · TIER 4, LEVEL 40 ===\n');

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
global.Audio=function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,volume:1,currentTime:0,cloneNode(){return this;}};};
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:64,naturalHeight:64,set src(v){this._src=v;},get src(){return this._src;}};};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=noop;
global.matchMedia=()=>({matches:false,addEventListener:noop,addListener:noop});
global.navigator={userAgent:'node',getGamepads:()=>[],maxTouchPoints:0,platform:'MacIntel'};
global.performance={now:()=>CLOCK};
global.URL={createObjectURL:()=>'x',revokeObjectURL:noop};global.Blob=function(){};
global.getComputedStyle=()=>({getPropertyValue:()=>'',display:'block',visibility:'visible'});
const LOG=console.log;console.log=()=>{};console.warn=noop;console.error=noop;
new Function(src+`;globalThis.__G={SPECIES,createZyrex,player,game,grantVengrizz,
  ATHRENOLOGY_INDEX:(typeof ATHRENOLOGY_INDEX!=='undefined'?ATHRENOLOGY_INDEX:null)};`)();
let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const G=globalThis.__G;

const V=G.SPECIES.vengrizz;
t(!!V, '★ vengrizz exists in SPECIES');
t(V.tier===4, `★★★ TIER 4 (${V.tier}) · restored to the codex's IV. The codex triage `
  + 'says IV, a later roster pass pulled him to 2, and canon precedence is '
  + 'STORY > CARDS > GAME [[aov-canon-precedence]]');
t(V.type==='Spirit' && V.type2==='Beast', '★ typing unchanged · Spirit/Beast');

/* ── ★★★ the pool follows the tier ─────────────────────────────────── */
const pool = V.baseHP+V.baseATK+V.baseDEF+V.baseSPD+V.baseSATK+V.baseSDEF;
t(pool === V.tier*333,
  `★★★ base pool ${pool} = tier x 333 (${V.tier} x 333) · a tier change that left `
  + 'the pool at 666 would be a T4 with a T2 body [[rizing-powers-t333-stat-pool]]');
// the SHAPE must survive · every stat exactly doubled from the T2 spread
const OLD={baseHP:120,baseATK:150,baseDEF:95,baseSPD:140,baseSATK:86,baseSDEF:75};
const doubled = Object.keys(OLD).every(k => V[k] === OLD[k]*2);
t(doubled,
  '★★★ every stat is EXACTLY DOUBLED, not redistributed · the spread IS the '
  + 'character (a spirit bear on ATK and SPD with soft defences). Re-authoring '
  + 'it while "fixing" the total would make him a different animal wearing the '
  + 'same name');
t(V.baseATK > V.baseDEF && V.baseSPD > V.baseSDEF,
  '  · and the profile still reads: ATK over DEF, SPD over SDEF');

/* ── level 40 · the file's own law, twice over ─────────────────────── */
const code=H.replace(/^\s*\/\/.*$/gm,'');
t(/createZyrex\('vengrizz', 40\)/.test(code),
  `★★★ the quest grants him at Lv 40 · tier x 10, which is the wild level law `
  + 'this file already states for T4, and also the card level '
  + '([[rizing-powers-stat-math]]). Two existing rules, same number');
const z = G.createZyrex('vengrizz', 40);
t(z && z.level===40 && z.tier===4, `★★ and a created one really is T${z&&z.tier} Lv${z&&z.level}`);
t(z && z.maxHp > 240,
  `★ level scaling applied on top of the new base (maxHp ${z&&z.maxHp}) · the base is `
  + 'the floor, not the delivered creature');

/* ── the index agrees · one drifting copy is how tiers rot ─────────── */
const idx = (G.ATHRENOLOGY_INDEX||[]).find(e=>e && e.n==='Vengrizz');
t(idx && idx.t===4,
  `★★★ ATHRENOLOGY_INDEX says t:${idx&&idx.t} · the index and SPECIES must agree `
  + 'or the codex page and the game show different tiers for the same creature');

/* ── ★★ the quest still works · a gift the gate refuses is a dead quest ── */
t(/addZyrexToRoster\(z, \{ bypassBondGate: true \}\)/.test(code),
  '★★★ the grant bypasses the bond gate · 10% bond per tier means T4 now needs '
  + '40%, and a Lost Boy reward that the gate silently refused would be a '
  + 'broken quest with no error [[aov-bond-tier-gate]]');
G.player.vengrizzGifted=false; G.player.party=[]; G.player.bonds={};
let granted=null; try { granted=G.grantVengrizz(); } catch(e){ }
t(granted && granted.tier===4 && granted.level===40,
  `★★★ DRIVEN · the quest actually hands over a T${granted&&granted.tier} Lv${granted&&granted.level}`);
t(G.grantVengrizz()===null, '★ and a second call is still a no-op');

/* ── the locked roster is NOT edited · the delta is recorded ───────── */
const RV=path.join(ROOT,'data/ROSTER_V2_DELTAS.md');
t(fs.existsSync(RV),
  '★★★ the divergence is RECORDED in data/ROSTER_V2_DELTAS.md · v1 is locked and '
  + 'all changes are v2, so nothing was edited in place. Without the record the '
  + 'next person to diff game against roster finds a contradiction and no way to '
  + 'tell a decision from a mistake [[aov-rp7-master-roster-v7]]');
const v1=JSON.parse(fs.readFileSync(path.join(ROOT,'data/staple_roster_v1.json'),'utf8'));
const inV1=(v1.species||[]).find(x=>x&&x.name==='Vengrizz');
t(inV1 && inV1.tier===2,
  `★★ and staple_roster_v1.json is UNTOUCHED (still tier ${inV1&&inV1.tier}) · `
  + '"locked" has to mean locked, or the next lock means nothing');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
