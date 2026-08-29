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
try{new Function(src+';globalThis.__C={pickStarter,STARTER_IDS,rizerBondTotal,requiredBondForTier,startWildBondEncounter,_wildBondResolve,spawnWildZyrex,openZysphereShop,BOND_EVENTS,BOND_PATH_CAP,bondLedger,addZyrexToRoster,createZyrex,SPECIES,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
let SAID=[];
global.showToast=(m)=>SAID.push(String(m)); global.showDialog=(o)=>SAID.push('DIALOG '+(o&&o.speaker));
global.playSFX=noop; global.saveGame=noop; global.pingNextObjective=noop; global.playItemGain=noop;
C.game.scene='overworld';
const newGame=()=>{const p=C.player; p.party=[];p.pcZyrex=[];p.sanctuary=[];p.items={};
  p.bondLedger={zyrex:0,rizer:0,_migrated:true}; p.starterChosen=null; p.starterBondGranted=false;
  p.rizerLvl=1; p.dadStarterQuestComplete=true; SAID=[]; return p;};

H('1 · ★★★ BEFORE DAD · the world is shut');
{
  const p=newGame();
  ok(C.rizerBondTotal()===0,'★ bond starts at 0, as ruled');
  SAID=[]; C.openZysphereShop();
  ok(!C.game.zysphereShopOpen,'★★★ the Zysphere shop will NOT open · "you cannot even buy zysphere until you get starter"');
  // ★ the game calls its OWN showDialog, not a harness global, so nothing lands
  // in SAID.  Assert the refusal TEXT exists at the site instead of trying to
  // capture a message the stub can never see.
  const _src=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/Spheres are for Rizers with something to put in them/.test(_src),
     '…and the shutter says why, in the shop\'s own voice');
  const w=C.spawnWildZyrex('aetherwing',60,60,{temperament:'Calm'});
  SAID=[];
  ok(C.startWildBondEncounter(w,C.SPECIES.aetherwing)===false,
     '★★★ and NO wild may be bonded · "you have to get your starter before any wild"');
  ok(/You have no Zyrex of your own yet · see your DAD first/.test(_src),
     '★ the refusal points at DAD, not at a number');
  ok(!C.game.wildBondOpen,'nothing opened');
}

H('2 · ★★★ DAD\'S FIRST MISSION · the first rung');
{
  const p=newGame();
  C.pickStarter(C.STARTER_IDS[0]);
  ok(C.rizerBondTotal()===333,'★★★ taking the starter puts bond at exactly 333');
  ok(C.requiredBondForTier(1)===333,'★★ which is precisely the T1 gate · the number is the unlock');
  ok(p.party.length===1&&p.pcZyrex.length===0,'★ and the starter is in the FACTION, not storage');
  ok((p.items.zysphere||0)===2,'★★★ Dad hands over 2 Zyspheres · the first spheres in the game');
  ok(p.starterChosen===C.STARTER_IDS[0],'the choice is recorded');
}

H('3 · ★★ THE LADDER · 333 per tier, attempt-gated');
{
  const p=newGame(); C.pickStarter(C.STARTER_IDS[0]);
  ok(C.rizerBondTotal()>=C.requiredBondForTier(1),'★★ T1 is attemptable the moment you have a starter');
  ok(C.rizerBondTotal()<C.requiredBondForTier(2),'★ T2 is not · 666 is the next rung');
  const t2=Object.keys(C.SPECIES).find(k=>C.SPECIES[k].tier===2);
  const w=C.spawnWildZyrex(t2,62,62,{temperament:'Calm'});
  SAID=[];
  ok(C.startWildBondEncounter(w,C.SPECIES[t2])===false,'★★ a T2 attempt is REFUSED at 333');
  const _src3=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/needs BOND \$\{_need\}/.test(_src3),'★ and the refusal names the number you need');
  ok((p.items.zysphere||0)===2,'★★★ and it cost NOTHING · refusing before the minigame does not burn a sphere');
  p.bondLedger={zyrex:333,rizer:333,_migrated:true};
  ok(C.rizerBondTotal()===666&&C.startWildBondEncounter(w,C.SPECIES[t2])===true,'★★ at 666 the same wild opens');
}

H('4 · ★★★ THE GATE MOVED TO THE ATTEMPT · and this reverses a ruling');
{
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  ok(/THE TIER GATE MOVED TO THE ATTEMPT/.test(src2),'the move is documented at the site');
  ok(/SUPERSEDES the v0\.95\.866 ruling/.test(src2),
     '★★★ and it is named as a REVERSAL of "an under-bonded Rizer may still TRY" · not a silent overwrite');
  ok(/refusing before the minigame costs the player nothing/.test(src2),
     '★★ with the reason: refuse before the spin, not after a sphere, a spin and a win');
  // the .886 fix must still hold · a WON encounter always joins
  const p=newGame(); C.pickStarter(C.STARTER_IDS[0]);
  const w=C.spawnWildZyrex('aetherwing',63,63,{temperament:'Calm'});
  C.startWildBondEncounter(w,C.SPECIES.aetherwing);
  C._wildBondResolve(true);
  ok(p.party.length===2,'★★ a won encounter STILL joins the faction · v0.95.886 is not undone by the new gate');
  ok(p.pcZyrex.length===0,'nothing diverted to PC');
}

H('5 · ★ THE 333 IS PAID ONCE');
{
  const p=newGame();
  C.pickStarter(C.STARTER_IDS[0]);
  const after=C.rizerBondTotal(), spheres=p.items.zysphere;
  C.pickStarter(C.STARTER_IDS[1]);
  C.pickStarter(C.STARTER_IDS[2]);
  ok(C.rizerBondTotal()===after,'★★ re-entering the picker does not re-pay the largest bond event in the game');
  ok(p.items.zysphere===spheres,'★ nor re-issue Dad\'s spheres');
  ok(p.party.length===1,'★ and you still have exactly one starter');
}

H('6 · THE EVENT IS ON THE LEDGER, NOT A MAGIC NUMBER');
{
  const E=C.BOND_EVENTS.rizerStarter;
  ok(!!E,'rizerStarter is a registered bond event');
  ok(E.pts===333,'★ worth 333');
  ok(E.path==='rizer','★★ on the RIZER path · it is a mission completed, not a Zyrex action');
  ok(E.pts<C.BOND_PATH_CAP,'★ and it does not alone fill the 1665 path');
  const p=newGame(); C.pickStarter(C.STARTER_IDS[0]);
  // ★ the zyrex half picks up 0.5 from zyrexDeploy — the starter auto-summons
  // and walking the world together is a real bond event.  Correct behaviour,
  // so the assertion measures "essentially untouched", not "exactly zero".
  ok(C.bondLedger().rizer===333,'★★ the 333 lands on the RIZER half');
  ok(C.bondLedger().zyrex<1,'★★ and the zyrex half is still all to earn ('+C.bondLedger().zyrex+' from the auto-summon walking with you)');
}

H('7 · ★ THE R.A.I.D. CARD PAYS BOND');
{
  const E=C.BOND_EVENTS.rizerRaidcard;
  ok(!!E,'★ rizerRaidcard is a registered, labelled event');
  ok(E.path==='rizer','★ on the RIZER path · a credential, not a Zyrex action');
  ok(E.pts===20,'★★ worth 20 · the same as bonding an ally, which is what Elarion handing it over IS');
  ok(E.pts<C.BOND_EVENTS.rizerStarter.pts,
     '★★★ and it is NOT another cliff · the starter placed the first rung because nothing was bondable at 0; this is a step along the climb to 666');
  const src2=fs.readFileSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/rp7b.html','utf8');
  // ★ anchor on the ASSIGNMENT, which happens once, not on the guard `if
  // (!player.raidCardGifted){`, which appears twice — indexOf found the school
  // door's check hundreds of lines earlier and measured the wrong window.
  // Tenth sighting of a first-match anchor in this project.
  const blk=src2.slice(src2.indexOf('player.raidCardGifted = true;'));
  ok(/bumpRizerBond\('rizerRaidcard'\)/.test(blk.slice(0,600)),'★ granted at the card hand-over');
  ok(/player\.items\.raidcard = \(player\.items\.raidcard \|\| 0\) \+ 1/.test(blk.slice(0,900)),
     '★★ in the same one-shot block as the card itself · the card and the bond are one event that cannot repeat');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
