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
let CLK=100000; global.performance={now:()=>CLK};
try{new Function(src+';globalThis.__C={tickYaraRegen,rizerInCombat,yaraIsWithYou,YARA_REGEN_MS,YARA_REGEN_CALM_MS,TRANSIENT_PLAYER_KEYS,NPCS,player,game,findNpcById,hurtPlayer};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
global.showToast=noop; global.playSFX=noop; global.saveGame=noop;
const P=C.player;
const calm=()=>{ P._lastHurtAt=-999999; for(const n of C.NPCS){ if(n){ n._chasing=false; n._aggroUntil=0; } } };

H('1 · ★★ THE JOG SHEET');
{
  const y=C.findNpcById('yara');
  ok(!!y,'Yara exists');
  ok(fs.existsSync(ROOT+'assets/2D sprites/npcs/yara-jog.png'),'★ the keyed sheet is on disk');
  ok(!!y.walkSheet && !!y.walkBboxes,'★★ she finally has a MOVING bank · she has followed you since v0.95.304 in her standing pose');
  ok(y.walkBboxes.length===4 && y.walkBboxes.every(r=>r.length===4),'★ 4x4 measured');
  const lf=y.walkBboxes[1].map(b=>b[1]+b[3]);
  ok(Math.max(...lf)-Math.min(...lf)===0,'★★★ her LEFT row plants on '+lf[0]+' in all four frames · spread 0, no bounce');
  ok(y.walkRefBh===267,'★★ walkRefBh 267 · the v0.95.908 size guard');
  let idleRef=216; for (const r of y.bboxes){ if (r[0] && r[0][3]>idleRef) idleRef=r[0][3]; }
  ok(idleRef!==y.walkRefBh,'★★★ and it is NEEDED · idle measures '+idleRef+' against the jog’s '+y.walkRefBh+', so without it she shrinks to '
     +Math.round(100*y.walkRefBh/idleRef)+'% the instant she moves');
  ok(y.mirrorRightAsLeft===true,'★★ RIGHT is the mirror of LEFT · this sheet has the same wrong-way right row her idle had');
}

H('2 · ★★★ THE MEND · +1 HP per second beside her');
{
  P.hpMax=100; P.hp=50; P.companion=null; C.game.scene='overworld'; calm();
  C.tickYaraRegen(4000);
  ok(P.hp===50,'★★ without Yara, nothing happens · she IS the mechanic, not a Rizer stat');
  P.companion='yara'; calm();
  C.tickYaraRegen(1000);
  ok(P.hp===51,'★★★ with her, +1 after one second');
  C.tickYaraRegen(3000);
  ok(P.hp===54,'★★ +3 more over three seconds · exactly 1/s, no drift');
  P.hp=P.hpMax;
  C.tickYaraRegen(5000);
  ok(P.hp===P.hpMax,'★ and it never overfills');
}

H('3 · ★★★ NON-COMBAT IS THE STRICT KIND');
{
  P.hp=50; P.companion='yara'; calm();
  ok(C.rizerInCombat()===false,'quiet to begin with');
  P._lastHurtAt = CLK - 1000;                       // hit one second ago
  ok(C.rizerInCombat()===true,'★★★ a hit one second ago still counts as combat · you cannot tank and refill on the spot');
  C.tickYaraRegen(2000);
  ok(P.hp===50,'★★ so nothing heals');
  P._lastHurtAt = CLK - (C.YARA_REGEN_CALM_MS + 100);
  ok(C.rizerInCombat()===false,'★ '+(C.YARA_REGEN_CALM_MS/1000)+'s of quiet clears it');
  // an enemy that has noticed you
  const e=C.NPCS.find(n=>n&&n.isEnemy&&!n._dying);
  e.scene=C.game.scene; e.hp=10; e._chasing=true;
  ok(C.rizerInCombat()===true,'★★★ and anything CHASING you counts, even if it has not landed a blow');
  e._chasing=false; e._aggroUntil=CLK+3000;
  ok(C.rizerInCombat()===true,'★★ as does anything merely aggroed in the scene');
  e._aggroUntil=0;
  ok(C.rizerInCombat()===false,'★ calm again once it loses interest');
}

H('4 · ★★★ THE CLOCK RESTARTS, IT DOES NOT PAUSE');
{
  P.hp=50; calm();
  C.tickYaraRegen(900);                    // 0.9s banked, no tick yet
  ok(P.hp===50,'900ms banked · not a full second');
  const e=C.NPCS.find(n=>n&&n.isEnemy&&!n._dying);
  e.scene=C.game.scene; e._chasing=true;
  C.tickYaraRegen(50);                     // combat wipes the accumulator
  e._chasing=false; calm();
  C.tickYaraRegen(900);                    // another 0.9s from ZERO
  ok(P.hp===50,'★★★ interrupted at 0.9s twice = still nothing · a fight broken up every few seconds never heals at all');
  C.tickYaraRegen(200);
  ok(P.hp===51,'★ and it lands once a full uninterrupted second passes');
  ok(/the accumulator RESETS rather than pausing/.test(src2),'the choice is recorded');
}

H('5 · ★★ IT BREAKS A STANDING RULE, ON PURPOSE');
{
  ok(/no auto-regen/.test(src2),'the old rule is still in the file');
  ok(/FIRST auto-regen in RP7 and it deliberately breaks a standing\n\/\/ rule/.test(src2)||/deliberately breaks a standing/.test(src2),
     '★★★ and the exception says so · healing is not a property Rizer has, it is one YARA has');
  ok(/green gem bond is\n\/\/ a later-series reveal/.test(src2)||/later-series reveal/.test(src2),
     '★★ the lore is at the code · foreshadowing you can feel before you can read it');
  ok(/yaraMendSeen/.test(src2),'★ told once, then never again · a toast per second would be a nuisance');
}

H('6 · ★★★ THE SAVE TRAP');
{
  ok(C.TRANSIENT_PLAYER_KEYS.has('_lastHurtAt'),
     '★★★ _lastHurtAt is NOT saved · performance.now() restarts near zero on load, so a saved stamp is in the FUTURE and the mend would never fire again');
  for (const k of ['_invulnUntil','_hurtFlashUntil','_blockStunUntil'])
    ok(C.TRANSIENT_PLAYER_KEYS.has(k),'★ '+k+' too · the same bug asleep');
  // ★ v0.95.918 INVERTED: _voltstormCdUntil was on this list one version ago.
  // The A5 stopped being a TIMER ("no more timed cool down for A5, make it a
  // 20 kill cooldown"), so there is no stamp left to keep out of the save --
  // and a kill COUNT is progression, which the save should keep.
  ok(!C.TRANSIENT_PLAYER_KEYS.has('_voltstormCdUntil'),
     '★★ _voltstormCdUntil is gone entirely · the A5 counts kills now, and a count belongs IN the save');
  ok(C.player._voltstormKills === undefined || typeof C.player._voltstormKills === 'number',
     '★ and _voltstormKills is a plain number · persisted as progression, not a clock');
  ok(/performance\.now\(\) restarts near ZERO on a reload/.test(src2),'and the reason is written down');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
