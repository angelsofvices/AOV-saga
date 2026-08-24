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
try{new Function(src+';globalThis.__C={SPECIES_RECRUIT_GATES,SPECIES,seedMalezorWild,player,game,tryRecruitWildZyrex,rizerBondTotal,requiredBondForTier,zyTriangleArm,zyTriangleRelease,quickSummonStashAll,toggleFactionSummon,NPCS,_wild:()=>{try{return _malezorWildPlaced}catch(e){return []}}};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);

H('1 · ★★ ELZORAN ANSWERS · the Lv-50 bar was a Zyrex that cannot exist');
{
  ok(/evolveTo:'elzimir', evolveLv:30/.test(src),'root cause on record: Elzebub becomes Elzimir at Lv 30');
  ok(!/speciesId === 'elzebub' && \(z\.level \|\| 0\) >= 50/.test(src),'★ the unsatisfiable Lv-50 test is gone');
  const G=C.SPECIES_RECRUIT_GATES.elzoran;
  C.player.pcZyrex=[];
  C.player.party=[{speciesId:'elzebub',level:3}];
  ok(G.test()===true,'★ Elzebub at ANY level satisfies him');
  C.player.party=[{speciesId:'elzimir',level:31}];
  ok(G.test()===true,'★ …and so does the evolved Elzimir (he recognises his kin, not a number)');
  C.player.party=[{speciesId:'apexaur',level:100}];
  ok(G.test()===false,'a stranger\'s roster still gets silence');
  ok(G.silent===true,'the silence canon stands · no vox, no dialog, just ignored');
}

H('2 · ★★ RARE TIER-5 WILD · the level law holds');
{
  ok(C.SPECIES.elzoran.tier===5,'Elzoran is Tier 5 in SPECIES');
  C.seedMalezorWild();
  const w=C._wild().find(x=>x&&x.speciesId==='elzoran');
  ok(!!w,'the wild stands at the statue');
  ok(w&&w.tileX===5&&w.tileY===28,'…at (5,28)');
  ok(w&&w.level===50,'★ level 50 · tier x 10 · the law, no override');
  ok(w&&w.temperament==='Calm','Calm · he does not flee a failed approach');
  ok(C.requiredBondForTier(5)===1665,'T5 bond bar = 50% of 3330');
  // the full path: kin + bond → he joins
  C.player.party=[{speciesId:'elzimir',level:100,hp:9},{speciesId:'apexaur',level:100,hp:9},{speciesId:'snok',level:100,hp:9},
                  {speciesId:'voltaryn',level:100,hp:9},{speciesId:'otterlin',level:100,hp:9},{speciesId:'celestryx',level:100,hp:9},
                  {speciesId:'volcanut',level:100,hp:9},{speciesId:'verdanix',level:100,hp:9}];
  C.player.pcZyrex=[];
  global.showDialog=noop; global.showToast=noop;
  C.tryRecruitWildZyrex(w);
  ok(!!w._recruitedAt,'★ END TO END: kin at any level + bond over the bar → Elzoran joins');
}

H('3 · ★★ TRIANGLE IS THE ZYSPHERE TOGGLE · final fix');
{
  const kAt=src.indexOf("TRIANGLE IS THE ZYSPHERE TOGGLE");
  ok(kAt>0,'the recall branch exists');
  const blk=src.slice(kAt,kAt+1400);
  ok(/facing\._summoned && facing\._summonSpeciesId/.test(blk),'tap on YOUR summoned Zyrex recognises it');
  ok(/toggleFactionSummon\(_pi\)/.test(blk),'★ recall routes through toggleFactionSummon — combat lock + take-five VO + toast for free');
  ok(kAt < src.indexOf('isFriendlyNpc(facing)', kAt),'★ checked BEFORE the soul-swap branch that used to eat the press');
  // the hold · overworld venue
  ok(/zyTriangleArm\(\); \} catch/.test(src)&&/k === 'k' && game\.scene === 'overworld'/.test(src),'★ overworld keydown ARMS the clock-polled hold (gamepads are edge-triggered)');
  const tick=src.slice(src.indexOf('function zyTriangleHoldTick'),src.indexOf('function zyTriangleHoldTick')+1200);
  ok(/game\.zphoneOpen\s*\|\|\s*\(game\.scene === 'overworld'/.test(tick),'★ the hold tick completes with the phone CLOSED too');
  ok(/quickSummonStashAll/.test(tick),'hold = all out / all in · one existing chokepoint');
  ok(/if \(game\.zphoneOpen\)\{[\s\S]{0,120}paintZycellNav/.test(tick),'phone repaints only when the phone is up');
  // behavioral: recall a summoned follower through the same door
  C.player.party=[{speciesId:'snok',level:10,hp:9,name:'Snok'}];
  C.game.scene='overworld';
  C.toggleFactionSummon(0);                       // out
  const fol=C.NPCS.find(n=>n&&n.id==='_summon_snok');
  ok(!!fol&&fol._summoned===true,'deploy works (orb fallback if no sheet)');
  C.toggleFactionSummon(0);                       // back in
  ok(fol._summoned===false&&fol.scene==='__despawn__','and the same call stores it · the toggle IS a toggle');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
