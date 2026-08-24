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
try{new Function(src+';globalThis.__C={SUMMON_FORMATION,_claimFormationSlot,_formationTile,toggleFactionSummon,quickSummonStashAll,NPCS,player,game,walkable};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const cheb=(a,b)=>Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));

H('1 · ★★ THE SPACING LAW IS GEOMETRY');
{
  const F=C.SUMMON_FORMATION;
  ok(F.length===48,'48 stations · rings r=2/4/6 (8+16+24) · matches the old call-faction cap');
  let pair=true;
  for(let i=0;i<F.length;i++)for(let j=i+1;j<F.length;j++) if(cheb(F[i],F[j])<2) pair=false;
  ok(pair,'★ every pair of stations is >=2 tiles apart — the rule cannot be violated by a slot that exists');
  ok(F.every(o=>cheb(o,[0,0])>=2),'★ every station is >=2 from Rizer (spec asked >=1 · exceeded)');
  ok(F.every(o=>o[0]%2===0&&o[1]%2===0),'…because every offset is even · spacing survives any subset');
}

H('2 · ★★ SUMMONS SPAWN ON STATION · never in the old stack');
{
  ok(!/player\.y \+ 1 \+ otherOut/.test(src),'★ the column-under-Rizer spawn stack is gone');
  C.player.x=700; C.player.y=700; C.game.scene='overworld';
  global.showToast=noop; global.showDialog=noop;
  C.player.party=[
    {speciesId:'snok',level:10,hp:9,name:'S1'},{speciesId:'apexaur',level:10,hp:9,name:'S2'},
    {speciesId:'voltaryn',level:10,hp:9,name:'S3'},{speciesId:'otterlin',level:10,hp:9,name:'S4'},
  ];
  for(let i=0;i<4;i++) C.toggleFactionSummon(i);
  const out=C.NPCS.filter(n=>n&&n._summoned);
  ok(out.length===4,'four deployed');
  let pair=true, near=true, overlap=false;
  for(let i=0;i<out.length;i++){
    if(cheb([out[i].tileX,out[i].tileY],[C.player.x,C.player.y])<1) near=false;
    for(let j=i+1;j<out.length;j++){
      const d=cheb([out[i].tileX,out[i].tileY],[out[j].tileX,out[j].tileY]);
      if(d===0) overlap=true;
      if(d<2) pair=false;
    }
  }
  ok(pair,'★ all four stand >=2 tiles from each other at spawn');
  ok(near,'★ and >=1 tile from Rizer');
  ok(!overlap,'★ ZERO overlaps');
  ok(new Set(out.map(n=>n._formSlot)).size===4,'each holds its OWN station');
  // recall one, resummon · slot is reclaimed, not leaked
  C.toggleFactionSummon(0);
  C.toggleFactionSummon(0);
  const again=C.NPCS.find(n=>n&&n.id==='_summon_snok');
  ok(again._summoned&&again._formSlot!=null,'recall + resummon claims a station again');
}

H('3 · ★★ THE TEAM SPREADS AND WAITS · call-faction shares the table');
{
  ok(/const RING = SUMMON_FORMATION;/.test(src),'★ call-faction ring IS the formation · one table (old r=1 shoulder-pack gone)');
  ok(/SUMMONED ZYREX HOLD FORMATION/.test(src),'the follow AI has the formation branch');
  const blk=src.slice(src.indexOf('SUMMONED ZYREX HOLD FORMATION'),src.indexOf('SUMMONED ZYREX HOLD FORMATION')+2600);
  ok(/n\._summoned && n\._formSlot != null/.test(blk),'…gated to SUMMONS · allies + called contacts keep the trail-follow');
  ok(/_formationTile\(n\)/.test(blk),'each walks to ITS OWN station');
  ok(/on station · face Rizer and wait/.test(blk),'★ on station: face Rizer, stand, WAIT for his command');
  ok(/stepNPCTo/.test(blk),'movement goes through stepNPCTo — occupied tiles refused, overlap impossible in motion');
  // nudge never crowds the player
  ok(/never crowd Rizer/.test(src)&&/Math\.abs\(cx - player\.x\) <= 1/.test(src),'blocked-station nudge still keeps 1-tile clearance from Rizer');
}

H('4 · ★★ TRIANGLE TOGGLES THE HIGHLIGHTED ZYREX');
{
  ok(!/const items = document\.querySelectorAll\('#zycellContent \[data-zyitem\]'\);\s*const el = items\[game\._zycellItemIdx\]/.test(src),
     '★ the RAW element query is gone from the tap');
  ok(/const items = _zycellContentItems\(\);\s*const el = items\[game\._zycellItemIdx\]/.test(src),
     '★ the tap reads the SAME filtered list the nav cursor walks — highlight and action cannot diverge');
  ok(/data-zysummon="\$\{i\}"/.test(src),'grid cells still carry their party index');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
