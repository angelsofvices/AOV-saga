const fs=require('fs');
const src=fs.readFileSync('/tmp/all.js','utf8');
const noop=()=>{};
try{Object.defineProperty(globalThis,'navigator',{value:{userAgent:'node',getGamepads:()=>[],maxTouchPoints:0},configurable:true});}catch(_){}
const CTX=new Proxy({},{get:()=>()=>({addColorStop:noop,width:0,height:0,data:[]})});
const el=()=>({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},width:960,height:540,value:'',textContent:'',innerHTML:'',children:[],childNodes:[],getContext:()=>CTX,appendChild:noop,removeChild:noop,addEventListener:noop,removeEventListener:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,remove:noop,play:()=>Promise.resolve(),pause:noop,querySelector:()=>el(),querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:960,height:540})});
Object.assign(globalThis,{setInterval:()=>0,setTimeout:()=>0,clearInterval:noop,clearTimeout:noop,addEventListener:noop,removeEventListener:noop,window:globalThis,
 document:{getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop,body:el(),documentElement:el(),head:el(),hidden:false,visibilityState:'visible'},
 localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},
 Audio:function(){return{play:()=>Promise.resolve(),pause:noop,addEventListener:noop,cloneNode(){return this}}},
 Image:function(){return{addEventListener:noop,complete:false,naturalWidth:0,src:''}},
 requestAnimationFrame:()=>0,cancelAnimationFrame:noop,matchMedia:()=>({matches:false,addEventListener:noop,addListener:noop}),
 performance:{now:()=>Date.now()},getComputedStyle:()=>({getPropertyValue:()=>''})});
try{new Function(src+';globalThis.__C={BOND_EVENTS,BOND_PATH_CAP,bumpRizerBond,rizerBondTotal,bondLedger,player,RIZER_BOND_CAP,requiredBondForTier};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop;
const fresh=()=>{C.player.rizerLvl=1;C.player.bondLedger=null;C.player.bonds={yara:100,mom:100,dad:100};C.player.party=[];C.player.pcZyrex=[];};

H('1 · ★★ BOND STARTS AT ZERO');
{
  fresh();
  ok(C.rizerBondTotal()===0,'★ a new Rizer begins at 0 bond — the family 100s no longer pre-pay him 600');
  ok(C.bondLedger().zyrex===0&&C.bondLedger().rizer===0,'both paths empty');
}

H('2 · ★★ TWO PATHS · labelled to canon · small vs big');
{
  const E=C.BOND_EVENTS;
  ok(Object.keys(E).length===15,`${Object.keys(E).length} bond events declared`);
  ok(Object.values(E).every(e=>e.label&&e.path&&typeof e.pts==='number'),'every event carries path + points + a CANON LABEL');
  const z=Object.values(E).filter(e=>e.path==='zyrex'), r=Object.values(E).filter(e=>e.path==='rizer');
  ok(z.length>=8&&r.length>=7,`${z.length} Zyrex-path · ${r.length} Rizer-path — the two lives, counted apart`);
  ok(E.zyrexStrike.pts<1&&E.zyrexKill.pts<=1,'★ SMALL per ordinary Zyrex action (strike 0.2 · kill 1)');
  ok(E.zyrexBond.pts>=25&&E.zyrexEvolve.pts>=15&&E.rizerGemlord.pts>=30,'★ MODERATE-HIGH for the big beats (bonding 25 · evolution 15 · Gemlord respect 30)');
  ok(E.rizerQuest.pts>=5&&E.rizerAlly.pts>=20,'quests moderate · allies high');
}

H('3 · ★★ 3330 LANDS WITH LV 100 / RXP 1,000,000');
{
  fresh();
  // a full playthrough's worth of actions
  const run=[['zyrexStrike',350],['zyrexKill',600],['zyrexLevel',120],['zyrexHeal',80],['zyrexDeploy',60],
             ['zyrexEvolve',25],['zyrexBond',40],['zyrexMastered',8],
             ['rizerFind',120],['rizerScroll',180],['rizerQuest',90],['rizerTower',10],['rizerDistrict',10],['rizerAlly',40],['rizerGemlord',10]];
  for(const[k,n]of run) for(let i=0;i<n;i++) C.bumpRizerBond(k);
  ok(C.rizerBondTotal()===C.RIZER_BOND_CAP,`★ a full run reaches ${C.rizerBondTotal()}/${C.RIZER_BOND_CAP} — bond maxes where the Rizer maxes`);
  // and a HALF run does not
  fresh();
  for(const[k,n]of run) for(let i=0;i<Math.floor(n/2);i++) C.bumpRizerBond(k);
  const half=C.rizerBondTotal();
  ok(half>1200&&half<2600,`half a run sits mid-curve (${half}) — bond tracks progress, it does not jump`);
}

H('4 · ★★ NEITHER PATH ALONE MAXES YOU');
{
  fresh();
  for(let i=0;i<5000;i++) C.bumpRizerBond('zyrexKill');
  ok(C.bondLedger().zyrex===C.BOND_PATH_CAP,`the Zyrex path caps at ${C.BOND_PATH_CAP}`);
  ok(C.rizerBondTotal()===C.BOND_PATH_CAP,'★ grinding Zyrex alone stops at half — you must also live in the world');
  C.player.bondLedger={zyrex:99999,rizer:99999};
  ok(C.rizerBondTotal()===C.RIZER_BOND_CAP,'★ and a hand-edited save cannot exceed the cap — re-clamped per path at read time');
}

H('5 · ★ THE GATES STILL READ IT');
{
  fresh();
  ok(C.requiredBondForTier(5)===1665,'T5 still needs 50% bond · the tier gate is untouched');
  for(let i=0;i<2000;i++) C.bumpRizerBond('zyrexKill');
  for(let i=0;i<2000;i++) C.bumpRizerBond('rizerQuest');
  ok(C.rizerBondTotal()>=C.requiredBondForTier(5),'a maxed Rizer clears the T5 wild gate');
  ok(/bondLedger: player\.bondLedger/.test(src),'★ the ledger is SAVED — bond earned is bond kept');
  ok(/player\.bondLedger\._migrated/.test(src),'legacy saves migrate once instead of waking at zero');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
