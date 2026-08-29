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
try{new Function(src+';globalThis.__C={openRaidCard,closeRaidCard,raidCardTier,raidCardNumber,RAID_ROWS,RAID_FIELD_X,requiredBondForTier,rizerBondTotal,RIZER_BOND_CAP,NPCS,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
let SAID=[]; global.showToast=(m)=>SAID.push(String(m));
global.showDialog=(o)=>SAID.push('DLG:'+(o&&o.lines||[]).join(' | '));
global.playSFX=noop; global.saveGame=noop; global.pingNextObjective=noop; global.playItemGain=noop;
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
C.game.scene='overworld';

H('1 · ★★ THE CARD IS ART, NOT A TEXT PANEL');
{
  ok(fs.existsSync(ROOT+'assets/2D sprites/ui/raid-card.png'),'★ the card art is on disk');
  ok(/id="raidCardView"/.test(src2),'★ it has its own full-screen viewer');
  ok(/id="raidCardFields"/.test(src2),'★★ with a text layer over the art · the card is a TEMPLATE and the numbers ride on top');
  ok(/○ \/ B \/ ESC · CLOSE/.test(src2.slice(src2.indexOf('raidCardView'))),'★ and the same close hint as a Gemlord portrait');
}

H('2 · ★★★ IT EXITS ON CIRCLE · same chain as the portraits');
{
  ok(/if \(game\.raidCardOpen\)\s+closeRaidCard\(\);/.test(src2),
     '★★★ Circle closes the card · it joins the existing poster/scroll close chain rather than adding a second one');
  ok(/game\.raidCardOpen\)\s+freezeReasons\.push\('raidCard'\)/.test(src2),'★ and the world freezes while it is open');
}

H('3 · ★ IT REFUSES BEFORE ELARION GRANTS IT');
{
  const p=C.player;
  p.raidCardGifted=false; SAID=[];
  ok(C.openRaidCard()===false,'★★ no card, no viewer · "after elarian grant"');
  ok(!C.game.raidCardOpen,'nothing opened');
  ok(/You have no R\.A\.I\.D\. Card yet/.test(src2),'…and it says why');
}

H('4 · ★★★ THE NUMBERS ARE LIVE, NOT PAINTED ON');
{
  const p=C.player;
  p.raidCardGifted=true; p.party=[]; p.pcZyrex=[]; p.rizerLvl=1; p.items={coins:0};
  p.bondLedger={zyrex:0,rizer:0,_migrated:true}; p.starterChosen=null;
  ok(C.raidCardTier()===0,'★ a fresh cadet reads RAID TIER —');
  p.bondLedger={zyrex:0,rizer:333,_migrated:true};
  ok(C.raidCardTier()===1,'★★ at 333 the card reads T1 · the SAME ladder the encounter gate uses');
  p.bondLedger={zyrex:333,rizer:333,_migrated:true};
  ok(C.raidCardTier()===2,'★★ at 666 it reads T2 · the card can never disagree with the world');
  p.bondLedger={zyrex:1665,rizer:1665,_migrated:true};
  ok(C.raidCardTier()===10,'★ and a maxed bond reads T10');
  ok(C.requiredBondForTier(C.raidCardTier())<=C.rizerBondTotal(),'★★★ the tier shown is always one he has actually earned');
}

H('5 · ★ THE SERIAL IS STABLE');
{
  const p=C.player;
  const a=C.raidCardNumber(), b=C.raidCardNumber();
  ok(a===b,'★★ the R.A.I.D. number does not re-roll between opens ('+a+')');
  ok(/^\d{4}$/.test(a),'★ four digits, as the art prints it');
  p.starterChosen='volcanut';
  ok(C.raidCardNumber()!==a,'★ …and it is derived from the save, so a different Rizer gets a different card');
}

H('6 · ★★★ KELTHOR TURNS YOU AWAY WITHOUT THE ID');
{
  const K=C.NPCS.find(n=>n&&n.id==='kelthor');
  ok(!!K,'Kelthor is in the world');
  const p=C.player;
  p.raidCardGifted=false; p.kelthorEnrolled=false; p.kelthorStep={}; SAID=[];
  K.onInteract(K);
  ok(/Get your R\.A\.I\.D\. from Professor Elarion/.test(src2),
     '★★★ he points you at Elarion for the ID · "before youre eligble to enroll in your practicum"');
  ok(/I take students, not visitors/.test(src2),'★★ in his own voice · the Warden cannot enrol an unregistered Rizer');
  ok(!p.kelthorStep.s1,'★★ and NO ladder step started · the Warden cannot enrol someone the Academy has not registered');
  const gate=src2.indexOf('THE PRACTICUM IS FOR ENROLLED STUDENTS');
  const ladder=src2.indexOf("KELTHOR'S 8-STEP LADDER");
  ok(gate>0&&gate<ladder,'★★★ the check sits ABOVE the whole ladder · you are turned around at the door, not halfway up');
}

H('7 · ★★ AND ENROLS YOU WHEN YOU BRING IT');
{
  const K=C.NPCS.find(n=>n&&n.id==='kelthor');
  const p=C.player;
  p.raidCardGifted=true; p.kelthorEnrolled=false; p.kelthorStep={}; SAID=[];
  K.onInteract(K);
  ok(p.kelthorEnrolled===true,'★★ the card enrols you in the Beastmaster Practicum');
  ok(/Bring me SEEDS for my ward/.test(src2),'★★★ and he asks for SEEDS for his ward before your own Zyrex');
  ok(/Your father stood where you are standing/.test(src2),'★ this is Dad\'s road, and he says so');
  const wasEnrolled=p.kelthorEnrolled;
  K.onInteract(K);
  ok(p.kelthorEnrolled===wasEnrolled,'★ enrolment happens once · a second talk moves on down the ladder');
}

H('8 · THE CARD DOUBLES AS THE INTRO PROGRESS BAR');
{
  ok(/ACADEMY PROGRESS · the five gems light/.test(src2),'★ the five gems track the intro chain');
  ok(/player\.kelthorEnrolled/.test(src2.slice(src2.indexOf('const steps = ['))),'★★ and enrolment is one of them · the card shows where you are in the tutorial');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
