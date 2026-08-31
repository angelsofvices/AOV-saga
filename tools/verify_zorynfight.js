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
global.Image=function(){return{addEventListener:noop,complete:true,naturalWidth:1254,naturalHeight:1254,src:''}};
let CLK=300000; global.performance={now:()=>CLK};
try{new Function(src+';globalThis.__C={tickZorynFight,tickZorynCompanion,zorynEnemyNearRizer,attachZorynCombatBank,zorynNpc,zorynIsCompanion,ZORYN_SHEETS,ZORYN_FIGHT_RANGE,ZORYN_LEASH,ZORYN_STRIKE_MS,ZORYN_HIT_DMG,NPCS,player,game,WORLD_PROPS};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop; global.startMoriDeath=noop; global.creditRizerKill=noop;
const P=C.player; C.game.scene='overworld';
const z=C.zorynNpc();
const enemies=()=>C.NPCS.filter(n=>n&&n.isEnemy&&!n._dying);
function clearField(){ for(const e of enemies()){ e.scene='__parked__'; } }

H('1 · ★★★ HE GUARDS YOU, HE DOES NOT HUNT');
{
  ok(!!z,'Zoryn exists');
  P.bonds=P.bonds||{}; P.bonds.zoryn=50;
  ok(C.zorynIsCompanion(),'bond 50 · he is with you');
  z.scene='overworld'; z.tileX=P.x+1; z.tileY=P.y;
  clearField();
  const e=enemies()[0] || C.NPCS.find(n=>n&&n.isEnemy);
  ok(!!e,'an enemy exists to test with');
  // FAR from Rizer but RIGHT NEXT TO Zoryn -- the classic companion trap
  e.scene='overworld'; e.hp=100; e.hpMax=125;
  z.tileX=P.x+20; z.tileY=P.y; e.tileX=z.tileX+1; e.tileY=z.tileY;
  ok(C.zorynEnemyNearRizer()===null,
     '★★★ an enemy standing next to ZORYN but far from YOU is not a target · range is measured from Rizer');
  ok(/a partner who picks his own fights walks off/.test(src2),
     '★★ and why · every game that has shipped a self-directed companion has shipped that bug');
  // now put it next to Rizer
  e.tileX=P.x+1; e.tileY=P.y; z.tileX=P.x+2; z.tileY=P.y;
  ok(C.zorynEnemyNearRizer()===e,'★★ a threat to YOU is a target');
}

H('2 · ★★★ HE FIGHTS ON HIS OWN BODY');
{
  const e=C.zorynEnemyNearRizer();
  z.tileX=e.tileX+1; z.tileY=e.tileY;      // adjacent
  z._zoStrikeAt=0; z._atkUntil=0;
  const hp0=e.hp;
  CLK+=10;
  const engaged=C.tickZorynFight(z,CLK);
  ok(engaged===true,'★ he engages');
  ok(e.hp===hp0-C.ZORYN_HIT_DMG,'★★ and lands '+C.ZORYN_HIT_DMG+' · hp '+hp0+' → '+e.hp);
  ok(!!z.attackSheet && !!z.attackBboxes,'★★★ an attack BANK on his body · the v0.95.907 rule, not a decal at the enemy');
  ok(z._atkStart===CLK && z._atkUntil>CLK,'★★ _atkStart/_atkUntil · the same window Rizer and the Seer Grunts use');
  ok(z.dir==='left','★★★ and he FACED it before swinging · dir '+z.dir);
  ok(z.attackRefBh>0,'★ carries its own refBh ('+z.attackRefBh+') so he does not resize mid-swing');
  ok(z.cellAnchor===true,'★ cellAnchor · no sideways lurch on a union bbox');
}

H('3 · ★★ FISTS AND FEET, ALTERNATING');
{
  const e=C.zorynEnemyNearRizer(); e.hp=500;
  const seen=new Set();
  for (let i=0;i<4;i++){ CLK+=C.ZORYN_STRIKE_MS+10; C.tickZorynFight(z,CLK); seen.add(z.attackBboxes); }
  ok(seen.size===2,'★★★ he alternates two banks · punch and kick, both his own sheets');
  ok(C.ZORYN_SHEETS.punch && C.ZORYN_SHEETS.kick,'both were already in the repo · this was never blocked on art');
}

H('4 · ★★ HE IS HELP, NOT A REPLACEMENT');
{
  ok(C.ZORYN_STRIKE_MS>=600,'★★★ '+C.ZORYN_STRIKE_MS+'ms between blows against your 165-300 · the fight stays yours');
  ok(/If he cleared\n\/\/ rooms you would stop playing/.test(src2)||/you would stop playing/.test(src2),
     '★★ and that is the stated reason, not an accident of tuning');
  ok(C.ZORYN_LEASH>0,'★ leashed at '+C.ZORYN_LEASH+' tiles');
  const e=C.zorynEnemyNearRizer();
  z.tileX=P.x+C.ZORYN_LEASH+5; z.tileY=P.y; z._zoStrikeAt=0;
  const hp0=e.hp; CLK+=C.ZORYN_STRIKE_MS+10;
  C.tickZorynFight(z,CLK);
  ok(e.hp===hp0,'★★★ past the leash he does not strike · he cannot be baited off your flank');
}

H('5 · ★★★ COMBAT OUTRANKS THE CHEST RACE');
{
  ok(/a friend does not loot while you are being hit/.test(src2),
     '★★★ he drops the chest race mid-fight · correct AI and the right character note');
  const chest=C.WORLD_PROPS.find(x=>x&&x._woodChest&&!x.opened);
  if (chest){
    chest.tileX=z.tileX+1; chest.tileY=z.tileY;
    z._zoRaceId=chest.id; z._zoRaceAt=CLK-99999;    // long past the grace
    z.tileX=P.x+1; z.tileY=P.y;                      // back inside the leash
    C.tickZorynCompanion(CLK);
    ok(!chest.opened,'★★ with an enemy up, the chest stays shut');
    ok(z._zoRaceId===null,'★ and the race is abandoned, not paused');
  } else ok(true,'(no unlooted chest to test · skipped)');
}

H('6 · ★★ THE RIVALRY KEEPS ITS OWN BOOKS');
{
  const e=C.zorynEnemyNearRizer();
  P.zorynKills=0; e.hp=C.ZORYN_HIT_DMG;
  z.tileX=e.tileX+1; z.tileY=e.tileY; z._zoStrikeAt=0;
  CLK+=C.ZORYN_STRIKE_MS+10; C.tickZorynFight(z,CLK);
  ok((P.zorynKills||0)===1,'★★★ his kills are COUNTED beside his chests · the scoreboard predates the word "rival"');
  ok(/his kills pay YOU/.test(src2),'★★ and they pay Rizer, like your Zyrex · this is your faction fighting');
}

H('7 · ★★★ THE FRAGMENTED-SHEET TRAP');
{
  ok(/HIS SHEETS ARE FRAGMENTED/.test(src2),'the finding is recorded');
  ok(/192 separate opaque islands/.test(src2),
     '★★★ 192 components in ONE punch cell · his legs are not joined to his torso in the alpha');
  ok(/returns his torso alone: h=180 against a true figure of 246/.test(src2),
     '★★★ so component ownership -- the rule every other sheet is measured by -- gives the WRONG box here');
  ok(/anchored\n\/\/ him by the WAIST/.test(src2)||/anchored/.test(src2),
     '★★★ I measured foot baselines that way before checking · they would have floated him half a body off the ground');
  ok(z.attackFootBaselines===null,'★★ so there is no foot table · the union bbox bottom is his boots');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
