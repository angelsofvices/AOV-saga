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
try{new Function(src+';globalThis.__C={DAEMON_SPRINT_BBOXES,DAEMON_WALK_BBOXES,DAEMON_SPRINT_IMG,DAEMON_SPRINT_SRC,NPCS,TILE};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · ★ THE SPRINT SHEET IS ON DISK AND KEYED');
{
  const p=ROOT+'assets/2D sprites/enemies/daemon-sprint.png';
  ok(fs.existsSync(p),'daemon-sprint.png exists');
  ok(fs.statSync(p).size>100000,`${(fs.statSync(p).size/1024|0)}KB · real art, not a stub`);
  const zlib=require('zlib');
  const buf=fs.readFileSync(p);
  // PNG IHDR dims
  const w=buf.readUInt32BE(16), h=buf.readUInt32BE(20);
  ok(w===1254&&h===1254,`1254x1254 canvas (got ${w}x${h}) · same as the walk sheet`);
}

H('2 · ★★ THE TABLE · 4x4 · measured, in-cell, no negative widths');
{
  const B=C.DAEMON_SPRINT_BBOXES;
  ok(Array.isArray(B)&&B.length===4&&B.every(r=>r.length===4),'4 rows x 4 cols');
  let sane=true, inCell=true;
  for(const row of B) for(const [bx,by,bw,bh] of row){
    if(bw<80||bh<150||bw>313||bh>313) sane=false;
    if(bx<0||by<0||bx+bw>313||by+bh>313) inCell=false;
  }
  ok(sane,'every frame is a plausible body (80<=w, 150<=h, none past a full cell)');
  ok(inCell,'no frame overflows its cell — this sheet needed no overflow, unlike the walk UP row');
  // row shapes: 0=UP and 3=DOWN are TALL (vertical run), 1=LEFT and 2=RIGHT are WIDE (profile lunge)
  const avgW=r=>C.DAEMON_SPRINT_BBOXES[r].reduce((a,c)=>a+c[2],0)/4;
  const avgH=r=>C.DAEMON_SPRINT_BBOXES[r].reduce((a,c)=>a+c[3],0)/4;
  ok(avgH(0)>avgW(0)&&avgH(3)>avgW(3),'★ UP + DOWN rows are taller than wide (running at/away from camera)');
  ok(avgW(1)>avgH(1)&&avgW(2)>avgH(2),'★ LEFT + RIGHT rows are wider than tall (profile sprint lunge)');
}

H('3 · ★★ ROW ORDER MATCHES THE WALK rowMap · one map serves both banks');
{
  // The asset was re-banded to UP/LEFT/RIGHT/DOWN at keying time.  If a
  // runRowMap ever appears, someone has broken this contract — the fix is to
  // re-band the asset, not to fork the map.
  // ★ v0.95.823 · match CODE, not the attack-bank comment that now QUOTES the
  // contract ("no runRowMap, no attackRowMap, ever")
  ok(!/[.\[]\s*runRowMap|runRowMap\s*:/.test(src),'★ no runRowMap anywhere — the shared rowMap is the contract');
  ok(/rowMap:\s*s\.mode === 'daemon' \? \{ up:0, left:1, right:2, down:3 \}/.test(src)
   ||/rowMap: s\.mode === 'daemon' \? \{ up:0, left:1, right:2, down:3 \}/.test(src),
     'corridor daemons still carry the UP/LEFT/RIGHT/DOWN map');
}

H('4 · ★ EVERY DAEMON CARRIES THE RUN BANK · both spawn sites');
{
  const daemons=C.NPCS.filter(n=>n&&n.mode==='daemon');
  ok(daemons.length>0,`${daemons.length} daemons live in NPCS`);
  ok(daemons.every(n=>n.runSheet===C.DAEMON_SPRINT_IMG),'★ all share the ONE sprint Image (no per-NPC copies)');
  ok(daemons.every(n=>n.runBboxes===C.DAEMON_SPRINT_BBOXES),'★ all read the ONE measured table');
  const nonDaemons=C.NPCS.filter(n=>n&&n.isEnemy&&n.mode!=='daemon'&&n.runSheet===C.DAEMON_SPRINT_IMG);
  ok(nonDaemons.length===0,'and nobody else borrowed it (no sprinting Mori)');
}

H('5 · ★★ SIGHT = 8 TILES = SPRINT TRIGGER · one number rules both');
{
  ok(/n\.detectR \|\| 8\)/.test(src),'★ default detect radius is 8 (was 14 for daemons)');
  ok(!/isDaemon \? 14 : 8/.test(src),'the old 14-tile daemon default is gone');
  // _chasing is set from the same manh<=detectR test that decides pursuit,
  // and drawNPC's useRun reads _chasing — so "sees you" and "sprints" cannot
  // be two different distances.
  ok(/n\._chasing = \(manh <= detectR\)/.test(src),'_chasing set from the SAME detect test');
  ok(/useRun\s*=\s*!useCompanion && !useAtk && n\.moving && _hunting && n\.runSheet/.test(src),
     'drawNPC swaps to the run bank while hunting');
}

H('6 · ★ SAME SIZE AS WALKING · shared scale, no special-casing');
{
  // _downScale is computed once per NPC from the WALK bank col-0 heights and
  // rowScale is applied to whichever bank is live — so the sprint silhouette
  // inherits walk scale by construction.  Assert no sprint-specific scale
  // override crept in.
  ok(!/SPRINT[^\n]*scaleMul|scaleMul[^\n]*SPRINT/i.test(src),'no sprint-only scale multiplier');
  const walkMax=Math.max(...C.DAEMON_WALK_BBOXES.map(r=>r[0][3]));
  const scale=(C.TILE*2)/walkMax;
  const sprintDown=C.DAEMON_SPRINT_BBOXES[3][0][3];
  const drawn=Math.round(sprintDown*scale);
  ok(Math.abs(drawn-C.TILE*2)<=8,`sprint DOWN frame draws ${drawn}px vs walk's ${C.TILE*2}px target · within 8px`);
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
