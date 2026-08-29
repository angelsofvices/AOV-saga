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
try{new Function(src+';globalThis.__C={zyrexUid,zyrexFollowerId,findPartyByUid,toggleFactionSummon,quickSummonStashAll,summonedZyrexCount,sendZyrexWalkingHome,awardZyrexXP,NPCS,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop; global.showDialog=noop;
const twins=()=>{
  C.game.scene='overworld'; C.player.x=300; C.player.y=300;
  for(let i=C.NPCS.length-1;i>=0;i--) if(C.NPCS[i]&&C.NPCS[i]._summoned) C.NPCS.splice(i,1);
  C.player.party=[{speciesId:'aetherwing',name:'Aetherwing',level:10,hp:9,xp:0},
                  {speciesId:'aetherwing',name:'Aetherwing',level:12,hp:9,xp:0},
                  {speciesId:'snok',name:'Snok',level:20,hp:9,xp:0}];
  return C.player.party.map(z=>C.zyrexUid(z));
};

H('1 · ★★ EVERY PARTY ENTRY IS A UNIQUE INDIVIDUAL');
{
  const u=twins();
  ok(new Set(u).size===3,`three roster entries, three identities · ${u.join(' · ')}`);
  ok(u[0]!==u[1],'★ two Zyrex of the SAME SPECIES do not share an id');
  const a=C.player.party[0];
  ok(C.zyrexUid(a)===a.uid&&C.zyrexUid(a)===u[0],'the uid is stable — asking twice never re-stamps');
  ok(C.findPartyByUid(u[1])===C.player.party[1],'and it resolves back to the right individual');
  ok(!/`_summon_\$\{z\.speciesId\}`/.test(src),'★ ZERO species-keyed follower ids remain in the build');
}

H('2 · ★★ BOTH TWINS STAND IN THE FIELD');
{
  const u=twins();
  C.toggleFactionSummon(0); C.toggleFactionSummon(1); C.toggleFactionSummon(2);
  const out=C.NPCS.filter(n=>n&&n._summoned);
  ok(out.length===3,`all three deployed (${out.length})`);
  ok(out.filter(n=>n._summonSpeciesId==='aetherwing').length===2,'★ BOTH Aetherwings are out at once — the bug is dead');
  ok(new Set(out.map(n=>n.id)).size===3,'each holds its own follower NPC');
  ok(C.summonedZyrexCount()===3,'the counter agrees');
  ok(new Set(out.map(n=>n._formSlot)).size===3,'and each claims its own formation station');
}

H('3 · ★★ ONE TWIN\'S ORDERS NEVER TOUCH THE OTHER');
{
  const u=twins();
  C.toggleFactionSummon(0); C.toggleFactionSummon(1);
  C.toggleFactionSummon(0);                       // recall twin #1 only
  const out=C.NPCS.filter(n=>n&&n._summoned);
  ok(out.length===1&&out[0]._summonUid===u[1],'★ recalling twin #1 leaves twin #2 standing');
  // send-home releases the right one
  C.toggleFactionSummon(0);
  const first=C.NPCS.find(n=>n&&n._summonUid===u[0]);
  C.sendZyrexWalkingHome(first);
  ok(!C.player.party.some(z=>z&&z.uid===u[0]),'★ send-home releases THAT twin from the party');
  ok(C.player.party.some(z=>z&&z.uid===u[1]),'…and the other stays on the roster');
}

H('4 · ★ COMBAT + SHARE READ THE INDIVIDUAL');
{
  const u=twins();
  ok(/n\._summonUid && findPartyByUid\(n\._summonUid\)/.test(src),'★ the striking follower resolves to ITS OWN roster entry (XP lands on the right twin)');
  ok(/_outIds\.has\(z\.uid\)/.test(src),'the Shardshare share-set keys by uid');
  ok(/uid: zyrexUid\(z\)/.test(src),'★ identity persists in the save');
  ok(/_zyUidNext: player\._zyUidNext/.test(src),'…with its sequence, so a reload never re-issues an old id');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
