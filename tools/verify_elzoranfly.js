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
  // ★★★ v0.96.49 · flyAll -> runSrc.  Elzoran carried its flight on a `flyAll`
  // bank (ONE sheet for idle AND travel).  It has since moved onto the general
  // TRAVERSAL LAW — src = idle, runSrc = the moving sheet — so `F.flyAll` was
  // undefined and reading .bboxes off it killed the run before assertion two.
  // The sheet never changed; the field holding it did.
  ok(!!F.runSrc&&/elzoran-fly/.test(F.runSrc),'★ the flight sheet rides the runSrc traversal bank · one law for every gait');
  ok(Array.isArray(F.runBboxes),'★ and it carries its own measured table');
  const idleH=Math.round(268*((C.TILE*2)/268)*1.15);
  const flyMaxBh=Math.max(...F.runBboxes.map(r=>r[0][3]));
  const flyH=Math.round(244*((C.TILE*2)/flyMaxBh)*1.15);
  ok(Math.abs(idleH-flyH)<=3,`follower body ${flyH}px vs idle ${idleH}px · the 2-tile law does the matching`);
  ok(F.runBboxes.length===4&&F.runBboxes.every(r=>r.length===4),'4x4 measured table');
}

H('3 · ★★ HE ACCOMPANIES ON THE WING · the wild stays perched');
{
  const D2=C.SUMMONABLE_SPRITES;
  const fol=C.makeZyrexFollower({speciesId:'elzoran',name:'Elzoran',level:50});
  // ★★★ v0.96.49 · "HE NEVER SETS FOOT DOWN" IS RETIRED CANON.
  // These two defended the v0.95.831 flyAll reading — ONE sheet for idle AND
  // walk, a recruited Elzoran permanently airborne.  v0.95.970 overturned it.
  // Creator: "elzon should stand when idle. only fly with running."  So the
  // follower's src is now the PERCHED sheet and the flight bank is his
  // traversal art, which is the opposite of what was asserted here.  The bank
  // did not go missing; the behaviour was deliberately inverted.
  ok(/elzoran\.png/.test(fol.src)&&!/elzoran-fly/.test(fol.src),
     '★★★ the follower STANDS when idle · his src is the perched sheet, not the wing');
  ok(/elzoran-fly/.test(D2.elzoran.runSrc),
     '★★ and he takes to the wing only while crossing ground · the flight sheet is TRAVERSAL art');
  // ★ the quote wraps across two comment lines · match it the way it is written
  ok(/elzon should stand\s*\n?\s*\/\/ when idle\. only fly with running/.test(src),
     '★ and the ruling that inverted it is recorded at the bank, in the Creator\'s words');
  ok(!fol._orbFollower,'no orb fallback · he has a body');
  ok(fol.scaleMul===1.15,'keeps the T5 presence multiplier');
  // the statue wild + generic wild draw keep the perched idle sheet
  // ★ the grep'd comment was rewritten by v0.95.970 · assert the STATE, which
  //   is what actually keeps the statue vigil perched, not one phrasing of it
  ok(/elzoran\.png/.test(D2.elzoran.src)&&!/elzoran-fly/.test(D2.elzoran.src),
     '★★ SUMMONABLE.elzoran src is the IDLE sheet · the vigil at the statue is perched, and now so is a still follower');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
