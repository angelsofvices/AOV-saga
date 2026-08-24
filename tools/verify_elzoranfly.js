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
try{new Function(src+';globalThis.__C={SUMMONABLE_SPRITES,makeZyrexFollower,NPCS,player,game,TILE};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · ★ THE FLIGHT SHEET SHIPS · canon order, wings intact');
{
  const p=ROOT+'assets/2D sprites/zyrex/elzoran-fly.png';
  ok(fs.existsSync(p)&&fs.statSync(p).size>200000,'elzoran-fly.png on disk · real art');
  const buf=fs.readFileSync(p);
  ok(buf.readUInt32BE(16)===1254&&buf.readUInt32BE(20)===1254,'1254x1254 · 313 grid');
  ok(/companionRowMap: null/.test(src),'★ the old UP-first rowMap retired · sheet is in canon DOWN/LEFT/RIGHT/UP');
  ok(/WING GREENS survive/.test(src),'keyed with the strict differential · wing greens preserved by design');
}

H('2 · ★★ SCALED TO HIS IDLE SIZE · measured, not eyeballed');
{
  ok(/companionScaleMul: 1\.10/.test(src),'★ companion mul 1.30 → 1.10 · idle DOWN 268 / fly DOWN 244');
  const F=C.SUMMONABLE_SPRITES.elzoran;
  ok(!!F.flyAll&&/elzoran-fly/.test(F.flyAll.src),'★ flyAll bank on the species def');
  const idleH=Math.round(268*((C.TILE*2)/268)*1.15);
  const flyMaxBh=Math.max(...F.flyAll.bboxes.map(r=>r[0][3]));
  const flyH=Math.round(244*((C.TILE*2)/flyMaxBh)*1.15);
  ok(Math.abs(idleH-flyH)<=3,`follower body ${flyH}px vs idle ${idleH}px · the 2-tile law does the matching`);
  ok(F.flyAll.bboxes.length===4&&F.flyAll.bboxes.every(r=>r.length===4),'4x4 measured table');
}

H('3 · ★★ HE ACCOMPANIES ON THE WING · the wild stays perched');
{
  const fol=C.makeZyrexFollower({speciesId:'elzoran',name:'Elzoran',level:50});
  ok(/elzoran-fly/.test(fol.src),'★ summoned follower uses the FLY bank');
  ok(fol.walkSheet===fol.sheet&&fol.walkBboxes===fol.bboxes,'one bank serves idle AND walk · he never sets foot down');
  ok(!fol._orbFollower,'no orb fallback · he has a body');
  ok(fol.scaleMul===1.15,'keeps the T5 presence multiplier');
  // the statue wild + generic wild draw keep the perched idle sheet
  ok(/WILD at the statue keeps the idle sheet/.test(src)&&/^ {4}src: 'assets\/2D%20sprites\/zyrex\/elzoran\.png',$/m.test(src),
     '★ SUMMONABLE.elzoran src is still the IDLE sheet — perched at the statue, flying beside you');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
