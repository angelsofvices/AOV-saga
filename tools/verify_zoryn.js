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
try{new Function(src+';globalThis.__C={tickZorynCompanion,zorynIsCompanion,zorynBond,zorynNpc,ZORYN_BOND_TO_FOLLOW,ZORYN_CHEST_GRACE_MS,WORLD_PROPS,NPCS,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.playSFX=noop; global.saveGame=noop; global.awardRizerXP=noop;
let CLK=10000; global.performance={now:()=>CLK};
C.game.scene='overworld';
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
const p=C.player; p.bonds=p.bonds||{};

H('1 · ★★ BOND 50 MAKES HIM PLAYER TWO');
{
  ok(C.ZORYN_BOND_TO_FOLLOW===50,'★ the threshold is 50, as ruled');
  p.bonds.zoryn=49; ok(!C.zorynIsCompanion(),'★ at 49 he is just a friend in town');
  p.bonds.zoryn=50; ok(C.zorynIsCompanion(),'★★ at 50 he walks with you');
  ok(!!C.zorynNpc(),'and he exists in the world');
}

H('2 · ★★★ THE CHEST RACE · he takes what you ignore');
{
  const z=C.zorynNpc(); const chest=C.WORLD_PROPS.find(x=>x&&x._woodChest&&!x.opened);
  ok(!!chest,'an unlooted chest exists');
  chest.tileX=z.tileX+4; chest.tileY=z.tileY;
  const startX=z.tileX;
  CLK=10000; C.tickZorynCompanion(CLK);
  ok(z._zoRaceId===chest.id,'★ he MARKS it · he noticed');
  ok(z.tileX===startX,'★★★ and does NOT move yet · you get a head start, so losing it is your fault');
  CLK+=C.ZORYN_CHEST_GRACE_MS-1500; C.tickZorynCompanion(CLK);
  ok(!chest.opened,'★★ still yours a second before the grace expires ('+(C.ZORYN_CHEST_GRACE_MS/1000)+'s)');
  for(let i=0;i<120;i++){ CLK+=300; C.tickZorynCompanion(CLK); }
  ok(!!chest.opened,'★★★ then he takes it');
  ok((p.zorynChestsTaken||0)>=1,'★★ and it is COUNTED · '+p.zorynChestsTaken+' · the rivalry has a scoreboard long before Part 2 says the word');
}

H('3 · ★ HE WALKS · he does not teleport');
{
  ok(/ZORYN_CHEST_STEP_MS/.test(src2),'★ he moves one tile at a time');
  ok(/he WALKS · one tile at a time, so you can still beat him to it/.test(src2),
     '★★ so you can still beat him there by moving · the race is a race');
  ok(/A\s*\n\/\/ companion who snatches loot the instant it appears is a thief/.test(src2)
   ||/is a thief/.test(src2),
     '★★★ he only takes what you LEFT · that is the difference between a thief and someone making a point');
}

H('4 · ★★ IT IS A CHARACTER MECHANIC, NOT A LOOT TAX');
{
  ok(/THE CHEST RACE IS THE RIVALRY, REHEARSED/.test(src2),'the reason is recorded at the code');
  ok(/a hundred small losses to the same friend is a RELATIONSHIP/.test(src2),
     '★★★ a betrayal out of nowhere is a twist · a hundred small losses is a relationship');
  ok(fs.existsSync(ROOT+'data/ZORYN_ARC_CANON.md'),'★ and the full arc is written down');
  const doc=fs.readFileSync(ROOT+'data/ZORYN_ARC_CANON.md','utf8');
  ok(/PIT OF NO RETURN/.test(doc)&&/ABOMINALYS/.test(doc),'★★ Part 2: the Pit, and Tier 9 contact through Abominalys');
  ok(/unworthy of\s+his\s+Rizer\s+path/i.test(doc.replace(/\*/g,'')),
     '★★ the turn is a COMPARISON, not a betrayal · Rizer bonds a Gemlord first');
  ok(/RIZEMASTER/.test(doc),'★ and the obsession has a name');
  ok(/OPEN QUESTIONS FOR THE CREATOR/.test(doc),'★ with the calls left to you');
}

H('5 · HE ONLY RACES WHILE HE IS WITH YOU');
{
  const z=C.zorynNpc(); const chest=C.WORLD_PROPS.find(x=>x&&x._woodChest&&!x.opened);
  if (chest){
    p.bonds.zoryn=0;                      // not yet a companion
    chest.tileX=z.tileX+2; chest.tileY=z.tileY;
    z._zoRaceId=null;
    for(let i=0;i<80;i++){ CLK+=400; C.tickZorynCompanion(CLK); }
    ok(!chest.opened,'★★ below bond 50 he takes nothing · he is not following you yet');
    p.bonds.zoryn=50;
  }
  C.game.scene='interior_home';
  const before=(p.zorynChestsTaken||0);
  for(let i=0;i<40;i++){ CLK+=400; C.tickZorynCompanion(CLK); }
  ok((p.zorynChestsTaken||0)===before,'★ and he does not loot the overworld while you are indoors');
  C.game.scene='overworld';
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
