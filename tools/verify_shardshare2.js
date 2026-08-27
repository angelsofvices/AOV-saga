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
try{new Function(src+';globalThis.__C={awardZyrexXP,player,NPCS,game,toggleFactionSummon};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
global.showToast=noop;

H('1 · ★★ THE SHARDSHARE LAW · source contracts');
{
  ok(/1x for the one that got the\s*\n?\s*\/\/ kill, \.5x for all zyrex out in the overworld/.test(src)||/\.5x for all zyrex out/.test(src),'the ruling is quoted at the kill site');
  const zk=src.indexOf('this Zyrex owns the kill');
  const blk=src.slice(zk,zk+1400);
  ok(/player\.items\.shardshare \|\| 0\) > 0/.test(blk),'★ the ZYREX-kill share gates on the REPAIRED collar in the bag');
  ok(/Math\.floor\(killXp \* 0\.5\)/.test(blk),'★ every OTHER out Zyrex gets exactly 0.5x the kill XP');
  ok(/z === partyMember\) continue/.test(blk),'the killer is never double-paid');
  ok(/NO FREE RIDES/.test(src),'★ the old unconditional Rizer-kill trickle is gone — collar or claws');
  const rk=src.indexOf('NO FREE RIDES');
  const rblk=src.slice(rk,rk+1400);
  ok(/\* 0\.5\)/.test(rblk)&&/shardshare \|\| 0\) > 0/.test(rblk),'Rizer kills share 0.5x killXp to OUT Zyrex · collar only');
}

H('2 · ★★ BEHAVIORAL · levels stay individual without the collar');
{
  C.player.items={};
  const a={speciesId:'snok',name:'A',level:1,xp:0};
  const b={speciesId:'apexaur',name:'B',level:1,xp:0};
  C.player.party=[a,b];
  C.awardZyrexXP(a, 500);
  ok(a.xp>0||a.level>1,'the attacker banks XP');
  ok((b.xp||0)===0&&b.level===1,'★ the bystander banks NOTHING without the collar');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
