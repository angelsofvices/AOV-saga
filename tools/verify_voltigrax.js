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
try{new Function(src+';globalThis.__C={SUMMONABLE_SPRITES,makeZyrexFollower,player,game};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const src2=fs.readFileSync(ROOT+'rp7b.html','utf8');
const V=C.SUMMONABLE_SPRITES.voltigrax;

H('1 · ★★★ THE FLEE BBOXES WERE OFF THE IMAGE');
{
  const flat=[].concat(...V.fleeBboxes);
  ok(flat.every(b=>b[0]>=0&&b[0]<313&&b[1]>=0&&b[1]<313),
     '★★★ every flee box is CELL-RELATIVE now · they were absolute sheet coords ([383,55,…])');
  ok(flat.every(b=>b[0]+b[2]<=313&&b[1]+b[3]<=313),'★★ and every one fits inside its cell');
  ok(/ABSOLUTE SHEET COORDINATES/.test(src2),'the bug is recorded');
  ok(/column 1 was sampling x=696/.test(src2),
     '★★★ the draw does col*313+bx, so col 1 read x=696 and col 3 x=1931 · off the end of a 1254 image');
  ok(/it only played on a\n  \/\/ failed bond/.test(src2)||/failed bond/.test(src2),
     '★★ and why nobody saw it · the flee bank only plays when the creature is running AWAY from you');
}

H('2 · ★★ NO CELL BLEED, AND FLAT FLOORS');
{
  for (const [nm,bb] of [['walk',V.bboxes],['flee/run',V.fleeBboxes],['idle',V.idleBboxes]]){
    const flat=[].concat(...bb);
    ok(flat.every(b=>b[0]>=0&&b[1]>=0&&b[0]+b[2]<=313&&b[1]+b[3]<=313),
       `★★ ${nm}: all 16 frames inside their own cell · no rectangle can pick up a neighbour`);
    let worst=0;
    bb.forEach(r=>{ const fl=r.map(b=>b[1]+b[3]); worst=Math.max(worst,Math.max(...fl)-Math.min(...fl)); });
    ok(worst===0,`★★★ ${nm}: every row floor spread ${worst} · he does not bounce`);
  }
  ok(/drawImage takes a RECTANGLE, not a mask/.test(src2),
     '★★★ the distinction is recorded · overflow is owned, BLEED is two frames sharing pixels');
}

H('3 · ★★★ HE RUNS WHEN YOU RUN');
{
  const n=C.makeZyrexFollower({speciesId:'voltigrax',name:'V',uid:'voltigrax#1'});
  ok(!!n.runSheet && !!n.runBboxes,'★★★ a summoned Voltigrax now carries a RUN bank');
  ok(n.runBboxes===V.fleeBboxes,'★★ the same art as the flee sheet · one file, two occasions');
  ok(n.runRefBh===303,'★★ and its own yardstick (303 vs the idle 275)');
  ok(/useRun  && n\.runRefBh/.test(src2),
     '★★★ applied in the draw · without it he grows a tenth the moment he breaks into a sprint');
  ok(/n\._summoned && player\.running && n\.moving/.test(src2),
     '★★★ the run bank no longer needs _hunting · a companion is never hunting, so your own faction jogged beside a sprinting Rizer forever');
  ok(/running AWAY from you/.test(src2),'the irony is recorded');
}

H('4 · ★ THE TOOL');
{
  ok(fs.existsSync(ROOT+'tools/decell_sheet.py'),'★ tools/decell_sheet.py exists');
  const t=fs.readFileSync(ROOT+'tools/decell_sheet.py','utf8');
  ok(/WHAT CELL BLEED IS, AND WHY IT IS NOT THE SAME AS OVERFLOW/.test(t),
     '★★★ it draws the distinction · overflow is fine and owned, bleed is not fixable by any bbox');
  for (const nm of ['voltigrax','voltigrax-walk','voltigrax-run'])
    ok(fs.existsSync(ROOT+`assets/2D sprites/zyrex/_orig/${nm}-bleeding.png`),'★ '+nm+' original kept');
}

console.log('\n'+(f?('❌ '+f+' FAILED'):'✅ ALL PASS'));
process.exit(f?1:0);
