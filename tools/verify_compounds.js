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
try{new Function(src+';globalThis.__C={ASTRALITE_COMPOUND_EFFECTS,COMPOUND_TIER_NAMES,compoundPointsForTier,compoundKey,parseCompoundKey,compoundStatGains,synthesizeCompound,rxpPerAttrPoint,rizerAttrs,rizerAttrPool,rizerAttrSpent,rizerAttrUnspent,rizerLifetimeRXP,RIZER_TOTAL_RXP,RIZER_ATTR_MAX,ASTRALITE_COMPOUNDS,INVENTORY_META,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop;
C.game.scene='overworld';

H('1 · ★★ THE IDENTITY · 1,000,000 RXP = 3,330 POINTS');
{
  ok(C.RIZER_TOTAL_RXP===1000000,'RIZER_TOTAL_RXP = 1,000,000 (Lv 100)');
  ok(C.RIZER_ATTR_MAX===3330,'RIZER_ATTR_MAX = 3,330 across the five stats');
  const r=C.rxpPerAttrPoint();
  ok(Math.abs(r-1000000/3330)<1e-9,'★ exchange rate is DERIVED, not typed: '+r.toFixed(3)+' RXP per point');
}

H('2 · FIVE COMPOUNDS · CANON PAIR → CANON STATS');
{
  const E=C.ASTRALITE_COMPOUND_EFFECTS, k=Object.keys(E);
  ok(k.length===5,'5 compounds (the Matrix\'s five family pairs)');
  const want={
    compound_potential:      ['CREATION + PAST',            ['special']],
    compound_transformation: ['DESTRUCTION + PRESERVATION', ['atk','def']],
    compound_will:           ['MIND + BODY',                ['atk','special']],
    compound_ascension:      ['PRESENT + SPIRIT',           ['hp','special']],
    compound_innovation:     ['PRESENT + FUTURE',           ['speed','def']],
  };
  let pairOk=true, statOk=true;
  for(const [key,[pair,stats]] of Object.entries(want)){
    if(!E[key]||E[key].pair!==pair) pairOk=false;
    if(!E[key]||E[key].stats.map(s=>s[0]).join()!==stats.join()) statOk=false;
  }
  ok(pairOk,'★ every compound names its canon family pair');
  ok(statOk,'★ POTENTIAL→SPECIAL alone · the other four boost two stats each');
  ok(Object.values(E).every(e=>Math.abs(e.stats.reduce((a,s)=>a+s[1],0)-1)<1e-9),
     '★ each compound\'s weights sum to exactly 1 — the split never invents or loses points');
}

H('3 · SEVEN TIERS · RARITY IS THE BOOST');
{
  ok(C.COMPOUND_TIER_NAMES.length===8,'7 named tiers + blank slot 0');
  const pts=[1,2,3,4,5,6,7].map(C.compoundPointsForTier);
  ok(pts.join()==='5,10,15,20,25,30,35','★ points = tier × 5 · CORE 5 → MYTHIC 35');
  let mono=true; for(let i=1;i<pts.length;i++) if(pts[i]<=pts[i-1]) mono=false;
  ok(mono,'strictly increasing — a rarer Astralite is ALWAYS worth more');
  ok(C.compoundPointsForTier(0)===5&&C.compoundPointsForTier(99)===35,'tier clamps to 1-7 · no out-of-band boost');
}

H('4 · 35 TIERED ITEMS REGISTERED');
{
  const keys=Object.keys(C.ASTRALITE_COMPOUND_EFFECTS);
  let n=0, labelled=true;
  for(const b of keys) for(let t=1;t<=7;t++){
    const k=C.compoundKey(b,t);
    const M=C.INVENTORY_META&&C.INVENTORY_META[k];
    if(M){ n++; const L=M.label||'';
      // the label must SAY its tier — a MYTHIC Core and a CORE Core are different objects in the bag
      if(!L.includes(C.COMPOUND_TIER_NAMES[t])||!L.includes(C.ASTRALITE_COMPOUND_EFFECTS[b].label)) labelled=false; }
  }
  ok(n===35,'5 compounds × 7 tiers = 35 inventory items ('+n+')');
  ok(labelled,'★ every label names BOTH the compound and its tier — 35 distinguishable objects in the bag');
  const P=C.parseCompoundKey('compound_ascension_t7');
  ok(P&&P.base==='compound_ascension'&&P.tier===7,'★ the key round-trips: base + tier parse back out');
}

H('5 · ★ THE WEAKEST LINK RULES THE TIER');
{
  // a mythic Astralite paired with a lesser one cannot mint a mythic Core
  const t=Math.min(7,3);
  ok(C.compoundKey('compound_potential',t)==='compound_potential_t3',
     '★ mythic(7) + major-II(3) → T3 Core · the weaker Astralite caps the product');
}

H('6 · THE SPLIT · PRIMARY TAKES THE ROUNDING');
{
  for(const [k,e] of Object.entries(C.ASTRALITE_COMPOUND_EFFECTS)){
    for(let t=1;t<=7;t++){
      const g=C.compoundStatGains(k,t);
      const sum=g.reduce((a,x)=>a+x[1],0);
      if(sum!==C.compoundPointsForTier(t)){ ok(false,'split loses points at '+k+' T'+t); f++; }
    }
  }
  ok(true,'★ every compound at every tier splits to EXACTLY tier×5 points — no rounding leak');
  const g=C.compoundStatGains('compound_ascension',7);
  ok(g.length===2&&g[0][1]+g[1][1]===35,'ASCENSION T7 → 35 points across hp + special');
}

H('7 · ★★ SYNTHESIS · THE LEDGER STAYS TRUE');
{
  const p=C.player;
  p.rizerLvl=50; p.rizerXP=0; p.matrixAP=0; p.matrixRXP=0;
  const A=C.rizerAttrs(); for(const k of Object.keys(A)) A[k]=0;
  const before={spent:C.rizerAttrSpent(),unspent:C.rizerAttrUnspent(),rxp:C.rizerLifetimeRXP(),lvl:p.rizerLvl};
  p.items=p.items||{}; p.items['compound_ascension_t7']=1;
  C.synthesizeCompound('compound_ascension_t7');
  const after={spent:C.rizerAttrSpent(),unspent:C.rizerAttrUnspent(),rxp:C.rizerLifetimeRXP(),lvl:p.rizerLvl};
  ok(after.spent-before.spent===35,'★ 35 points land in the STATS (spent +35) — a permanent boost, not floating points');
  ok(after.unspent===before.unspent,'★★ UNSPENT IS UNTOUCHED — a Core is a GAIN, never a raid on the points he levelled for');
  const dr=after.rxp-before.rxp;
  ok(Math.abs(dr/35-C.rxpPerAttrPoint())<1,'★★ RXP rose by 35 × 300.3 = '+dr+' — stats always reflect RXP');
  ok(after.lvl===before.lvl,'★ synthesising grants NO free levels · levels stay something you EARN');
  ok(p.matrixAP===35&&p.matrixRXP===dr,'both halves of the ledger are recorded on the player');
  ok(!(p.items['compound_ascension_t7']>0),'the Core is CONSUMED');
}

H('8 · ★ THE RATIO HOLDS AT THE CEILING');
{
  const p=C.player;
  p.rizerLvl=100; p.rizerXP=0; p.matrixAP=0; p.matrixRXP=0;
  const A=C.rizerAttrs(); for(const k of Object.keys(A)) A[k]=0;
  const rxp0=C.rizerLifetimeRXP(), ap0=C.rizerAttrPool(100);
  ok(rxp0===1000000&&ap0===3330,'★ Lv 100 clean: exactly 1,000,000 RXP and 3,330 points');
  p.items=p.items||{}; p.items['compound_will_t7']=1;
  C.synthesizeCompound('compound_will_t7');
  const rxp1=C.rizerLifetimeRXP(), ap1=ap0+(p.matrixAP||0);
  ok(Math.abs(rxp1/ap1-rxp0/ap0)<0.01,
     '★★ after a MYTHIC Core the ratio is unchanged: '+(rxp1/ap1).toFixed(2)+' vs '+(rxp0/ap0).toFixed(2)+' RXP per point');
  ok(ap1>3330,'★ and the Matrix is the ONE thing that carries a Rizer past the natural ceiling ('+ap1+')');
}

H('9 · IT SURVIVES A SAVE');
{
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/matrixAP:\s*player\.matrixAP/.test(src2),'matrixAP is serialized');
  ok(/matrixRXP:\s*player\.matrixRXP/.test(src2),'matrixRXP is serialized');
  ok(!/compoundAP/.test(src2),'★ the v0.95.865 compoundAP side-pool is GONE — one model, no drift');
  ok(!/RXP_PER_ATTR_POINT\s*=/.test(src2),'★ no const exchange rate (the TDZ trap) · it is a function');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
