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
try{new Function(src+';globalThis.__C={addZyrexToRoster,_wildBondResolve,WILD_BOND,startWildBondEncounter,spawnWildZyrex,pickStarter,createZyrex,STARTER_IDS,requiredBondForTier,rizerBondTotal,SPECIES,player,game,PARTY_MAX};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.showDialog=noop; global.playSFX=noop; global.saveGame=noop;
global.pingNextObjective=noop; global.playItemGain=noop;
C.game.scene='overworld';
// ★★ v0.95.887 · THE LOOP CHANGED IN FRONT OF THIS SUITE.  An encounter now
// requires (a) a starter — "you have to get your starter before any wild" — and
// (b) bond >= tier x 333, because the tier gate moved to the ATTEMPT.  These
// fixtures predate both, so they set the preconditions the new loop demands.
// Not a workaround: a harness that opens an encounter with no starter is
// testing a state the game can no longer be in.
const fresh=()=>{const p=C.player; p.party=[]; p.pcZyrex=[]; p.sanctuary=[]; p.bonds={};
  p.bondLedger={zyrex:0,rizer:0,_migrated:true}; p.rizerLvl=1; p.starterChosen=null;
  p.starterBondGranted=false; p.dadStarterQuestComplete=true;
  p.items=p.items||{}; p.items.zysphere=9; return p;};
// a Rizer who has done Dad's mission · starter in hand, bond 333, T1 open
const afterDad=()=>{const p=fresh(); p.starterChosen='volcanut'; p.starterBondGranted=true;
  p.bondLedger={zyrex:0,rizer:333,_migrated:true}; p.items.zysphere=9; return p;};

H('1 · ★★★ THE REGRESSION · two rules that were each correct alone');
{
  const p=fresh();
  ok(C.rizerBondTotal()===0,'★ a fresh Rizer opens at 0 bond · the v0.95.862 ledger, by the Creator\'s order');
  ok(C.requiredBondForTier(1)===333,'★ and the tier gate asks 333 even for a T1');
  ok(C.rizerBondTotal()<C.requiredBondForTier(1),
     '★★★ so EVERY catch failed the gate · under the old derived formula a fresh save opened at 600 and a T1 sailed through, which is why this was invisible until bond started at zero');
}

H('2 · ★★★ THE REPORTED BUG · buy a sphere, catch an Aetherwing');
{
  const p=afterDad();
  const w=C.spawnWildZyrex('aetherwing',60,60,{temperament:'Calm'});
  C.startWildBondEncounter(w,C.SPECIES.aetherwing);
  C._wildBondResolve(true);
  ok(p.party.length===1,'★★★ a WON encounter puts the Aetherwing in the FACTION');
  ok(p.party[0]&&p.party[0].speciesId==='aetherwing','…and it is the one he caught');
  ok(p.pcZyrex.length===0,'★★ nothing was quietly filed into PC storage');
  ok(p.items.zysphere===8,'★ and the sphere was still spent · the fix did not refund the cost');
}

H('3 · ★★ THE ENCOUNTER IS THE GATE · not a bypass, a doctrine');
{
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/THE ENCOUNTER IS THE GATE/.test(src2),'the reason is written at the call site');
  ok(/the ratio just makes the imprint brutal/.test(src2),
     '★★ and it quotes the v0.95.866 ruling it is enforcing · the encounter already REPLACED the bond refusal');
  ok(/charging twice for one thing/.test(src2),'★ he spent a sphere, out-spun a tier:bond difficulty, and won');
}

H('4 · ★★★ WORSE ONE FOUND NEXT DOOR · the STARTER was being gated');
{
  const p=fresh();
  C.pickStarter(C.STARTER_IDS[0]);
  ok(p.party.length===1,'★★★ the first Zyrex of the game lands in the FACTION');
  ok(p.pcZyrex.length===0,
     '★★★ …it was going to PC STORAGE · a new player picked their partner and was handed nothing');
  ok(p.starterChosen===C.STARTER_IDS[0],'and the choice is recorded');
}

H('5 · ★ EVERY PATH THAT ALREADY CHARGED YOU');
{
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  const n=(src2.match(/addZyrexToRoster\([^)]*bypassBondGate: true/g)||[]).length;
  ok(n>=5,n+' paths bypass · the won encounter, Elzoran, the starter, Mom\'s egg, and the fae ritual');
  ok(/Mom nursed the egg for you/.test(src2),'★ a gift handed over in a cutscene does not land in storage');
  // ★ the phrase is WRAPPED across two comment lines in the source, so a
  // single-line regex could never match it.  Match a fragment that actually
  // lives on one line — or better, assert the behaviour: Elzoran's call site
  // carries the bypass.
  ok(/roster must not check a third time/.test(src2),
     '★★ Elzoran is not checked a THIRD time · kin gate, bond bar, then the roster said no');
  // ★ anchored on the IF, not the bare condition — the same condition also
  // appears in a temperament table 20 lines earlier, so indexOf found THAT
  // first and measured a window nowhere near the call.  Ninth sighting of a
  // first-match anchor in this project, and this one was written while fixing
  // a bug.  Anchor on text that occurs once.
  const elz=src2.slice(src2.indexOf("if (w._noEncounter && w.speciesId === 'elzoran'){"));
  ok(/addZyrexToRoster\(_z, \{ bypassBondGate: true \}\)/.test(elz.slice(0,600)),
     '★ and his call site carries the bypass, not just a comment about it');
  ok(/choosing IS the gate/.test(src2),'★ and there is no bond to have earned before the game begins');
}

H('6 · ★★ THE GATE STILL BITES WHERE NOTHING WAS EARNED');
{
  const p=fresh();
  const legend=C.createZyrex('anciuxor',100);
  const res=C.addZyrexToRoster(legend);
  ok(res.location==='pc'&&res.reason==='bondLow',
     '★★★ an UNEARNED T10 still goes to the PC · the fix did not delete the gate, it stopped double-charging');
  ok(C.requiredBondForTier(10)===3330,'★ and a Gemlord still wants the full 3330 · 100% bond, as canon says');
  ok(p.party.length===0,'nothing slipped into the faction');
}

H('7 · PARTY-FULL IS A REAL LIMIT AND SURVIVES');
{
  const p=afterDad();
  const cap=C.PARTY_MAX||8;
  for(let i=0;i<cap;i++) p.party.push({speciesId:'aetherwing',name:'A'+i,level:10,hp:10,maxHp:10,tier:1,uid:'u'+i});
  const w=C.spawnWildZyrex('aetherwing',61,61,{temperament:'Calm'});
  C.startWildBondEncounter(w,C.SPECIES.aetherwing);
  C._wildBondResolve(true);
  ok(p.party.length===cap,'★ a full faction stays at '+cap);
  ok(p.pcZyrex.length===1,'★★ and the catch overflows to PC · that limit is real and is still enforced');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
