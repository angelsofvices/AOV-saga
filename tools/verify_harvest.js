#!/usr/bin/env node
/* verify_harvest.js · v0.96.30
 *
 *   Creator: "we collect berries and fruits and seeds easily so lets create
 *   something worth alot of them in harvest value to give us common but good
 *   items"
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync('/tmp/all.js','utf8');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== THE HARVEST SINK ===\n');

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
new Function(src+`;globalThis.__H={player,game,HARVEST_RECIPES,TREAT_BOND_CAP,
  grantHarvestRecipes,feedZyrexTreat,useItem:(typeof useItem==='function'?useItem:null),
  INVENTORY_META,ZYCUBE_CAT_OF,ZYREX_CONSUMABLE_PCT,
  grantFieldStationRecipe};`)();
let n=0;while(_Q.length&&n<300){const f=_Q.shift();n++;try{f();}catch(_){}}
console.log=LOG;const C=globalThis.__H;

/* ── 1 · the recipes exist and are payable three ways ──────────────── */
t(C.HARVEST_RECIPES.length === 4, `★ four harvest recipes (${C.HARVEST_RECIPES.length})`);
for (const r of C.HARVEST_RECIPES){
  const opts = r.costOptions || [];
  t(opts.length === 3, `  · ${r.name} takes three payment paths`);
  const keys = new Set(opts.flatMap(o => Object.keys(o)));
  t(keys.has('berry') && keys.has('fruit') && keys.has('seed'),
    `  · ${r.name} accepts berries, fruits AND seeds · whichever you are drowning in`);
}

/* ── 2 · ★★★ the field kit items ALREADY WORK · no new effect code ─── */
t(C.ZYREX_CONSUMABLE_PCT.berry_juice === 0.50 && C.ZYREX_CONSUMABLE_PCT.fruit_bar === 1.00,
  '★★★ berry_juice and fruit_bar were ALREADY wired as 50%/100% Zyrex heals · '
  + 'they simply had no recipe and could only be bought at 140/320 coins. The '
  + 'field kit is pure data: the items exist and work');

/* ── 3 · ★★★ THE BOND CAP · the whole design ───────────────────────── */
t(C.TREAT_BOND_CAP === 60, `★ treats cap bond at ${C.TREAT_BOND_CAP}`);
t(/const canCompanion = factionGranted \|\| bond >= 100/.test(H),
  '★★ companionship is bond >= 100 · that is what the cap protects');
t(C.TREAT_BOND_CAP < 80 && C.TREAT_BOND_CAP < 100,
  '★★★ the cap sits BELOW the Trial gate (80) and companionship (100) · a treat '
  + 'you can farm from a hedge must never buy a recruitment, or every creature '
  + 'in the game is a shopping trip [[aov-bond-tier-gate]]');

// drive it: feed one creature until it refuses
C.player.party = [{ speciesId:'elzebub', name:'Elzebub', bond: 0, hp: 50, maxHp: 100 }];
let fed = 0;
for (let i = 0; i < 40; i++){ if (!C.feedZyrexTreat('wild_treat')) break; fed++; }
const z = C.player.party[0];
t(z.bond === C.TREAT_BOND_CAP,
  `★★★ feeding stops EXACTLY at the cap (${z.bond}) after ${fed} treats · it does `
  + 'not creep past on the last one');
t(C.feedZyrexTreat('sweet_cache') === false,
  '★★ and a bigger treat is REFUSED at the cap, not partially applied');

/* ── 4 · a refused treat is NOT consumed ───────────────────────────── */
const codeUse = H.slice(H.indexOf("case 'wild_treat':"), H.indexOf("case 'wild_treat':") + 420);
t(/if \(!feedZyrexTreat\(key\)\) return;\s*\n\s*player\.items\[key\] = qty - 1;/.test(codeUse),
  '★★★ the item is spent only AFTER the helper agrees · offering a treat to a '
  + 'creature already at the cap costs nothing. Spending an item to be told "no" '
  + 'is how a player learns to distrust a menu');

/* ── 5 · ★★ the treat targets ONE creature, not the party ─────────── */
t(/facedNpc\(\)[\s\S]{0,400}_summonSpeciesId/.test(H),
  '★★ it feeds the summoned Zyrex you are FACING, else your leader · that is '
  + 'what separates it from the guitar, which lifts the whole party at once');

/* ── 6 · the bench teaches them, and back-fills old saves ──────────── */
C.player.knownRecipes = [];
C.grantHarvestRecipes();
t((C.player.knownRecipes||[]).length === 4, '★ granting adds all four');
const again = C.grantHarvestRecipes();
t(again === 0 && C.player.knownRecipes.length === 4,
  '★★ granting twice is idempotent · the bench back-fills saves that already '
  + 'knew the workstation, and must not duplicate the list every deploy');
const code = H.replace(/^\s*\/\/.*$/gm,'');
t((code.match(/grantHarvestRecipes\(\)/g)||[]).length >= 3,
  '★★ called from BOTH the lesson and the deploy · a save from before today '
  + 'already knows the bench and would otherwise never hear about the recipes');

/* ── 7 · the bag knows what they are ───────────────────────────────── */
t(!!C.INVENTORY_META.wild_treat && !!C.INVENTORY_META.sweet_cache,
  '★ both treats have inventory labels');
t(C.ZYCUBE_CAT_OF.wild_treat === 'harvest' && C.ZYCUBE_CAT_OF.sweet_cache === 'harvest',
  '★★ filed under HARVEST · they are made FROM the forage, so they live beside it');

/* ── 8 · ★★ IS IT ACTUALLY REACHABLE? priced against real yields ──── */
//   bushes give 1-3 berries (M=1 Z=2 A=3), trees 2-6 fruits (M=2 Z=4 A=6)
const juice = C.HARVEST_RECIPES.find(r=>r.id==='berry_juice_h');
const bar   = C.HARVEST_RECIPES.find(r=>r.id==='fruit_bar_h');
const barFruits = bar.costOptions.find(o=>o.fruit).fruit;
const trees = Math.ceil(barFruits / 4);          // Zarvane rate, mid-game
t(trees <= 15,
  `★★ a Fruit Bar is ~${trees} trees at the mid-game rate (4 fruits each) · a walk, `
  + 'not an afternoon. "Common but good" fails in both directions — free is not a '
  + 'sink, and an afternoon is not common');
const juiceBerries = juice.costOptions.find(o=>o.berry).berry;
t(juiceBerries < barFruits * 2 + 1 && juiceBerries > 20,
  `★ and Berry Juice (${juiceBerries} berries) is cheaper than the Bar, matching `
  + 'the shop ratio it already has (140 vs 320 coins) rather than a number I made up');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
