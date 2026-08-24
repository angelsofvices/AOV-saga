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
try{new Function(src+';globalThis.__C={DAEMON_ATTACK_BBOXES,DAEMON_ATTACK_FEET,DAEMON_WALK_FEET,DAEMON_SPRINT_FEET,DAEMON_ATTACK_IMG,DAEMON_ATTACK_CYCLE_MS,DAEMON_PROWL_R,DAEMON_WALK_BBOXES,NPCS,TILE};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)f++;};
const H=t=>console.log('\n'+t);
const ROOT='/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

H('1 · ★ THE ATTACK SHEET SHIPS · re-banded, keyed, de-haloed');
{
  const p=ROOT+'assets/2D sprites/enemies/daemon-attack.png';
  ok(fs.existsSync(p)&&fs.statSync(p).size>100000,'daemon-attack.png on disk, real art');
  const buf=fs.readFileSync(p);
  ok(buf.readUInt32BE(16)===1254&&buf.readUInt32BE(20)===1254,'1254x1254 · same canvas as walk + sprint');
  // match CODE (property use), not the comment that states the contract
  ok(!/[.\[]\s*(attackRowMap|runRowMap)|((attackRowMap|runRowMap)\s*:)/.test(src),
     '★ no per-bank rowMaps — re-band the ASSET, never fork the map');
}

H('2 · ★★ SLASH ≠ BODY · union bboxes + body-sole feet + cellAnchor');
{
  const B=C.DAEMON_ATTACK_BBOXES, F=C.DAEMON_ATTACK_FEET;
  ok(B.length===4&&B.every(r=>r.length===4),'4x4 bbox table');
  ok(F.length===4&&F.every(r=>r.length===4&&r.every(v=>v>200&&v<313)),'4x4 feet table · body soles in cell space');
  ok(B[0][2][0]===-49,'★ col-2 slash overflows PAST the cell seam and is OWNED (bx=-49), not clipped');
  // feet must sit INSIDE each frame's bbox (fb between by and by+bh)
  let inside=true;
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){const[,by,,bh]=B[r][c];if(F[r][c]<by||F[r][c]>by+bh)inside=false;}
  ok(inside,'every foot baseline lies inside its own frame');
  const daemons=C.NPCS.filter(n=>n&&n.mode==='daemon');
  ok(daemons.length>0&&daemons.every(n=>n.cellAnchor===true),'★ every daemon runs cellAnchor · the body stands still while the arc sweeps');
  ok(daemons.every(n=>n.attackSheet===C.DAEMON_ATTACK_IMG&&n.attackBboxes===C.DAEMON_ATTACK_BBOXES),'★ all daemons share the ONE attack bank (all 3 factories)');
  ok(daemons.every(n=>n.footBaselines===C.DAEMON_WALK_FEET&&n.runFootBaselines===C.DAEMON_SPRINT_FEET&&n.attackFootBaselines===C.DAEMON_ATTACK_FEET),'each bank plants on its own feet table');
}

H('3 · ★★ SAME BOUNDS ACROSS WALK · SPRINT · ATTACK');
{
  // one _downScale (walk col-0) serves all banks · assert the attack body
  // heights land near the walk target under that shared scale
  const scale=(C.TILE*2)/Math.max(...C.DAEMON_WALK_BBOXES.map(r=>r[0][3]));
  const bodyH=C.DAEMON_ATTACK_FEET[3][0]-C.DAEMON_ATTACK_BBOXES[3][0][1];   // DOWN col0 · sole minus top
  const drawn=Math.round(bodyH*scale);
  ok(Math.abs(drawn-C.TILE*2)<=10,`attack DOWN body draws ${drawn}px vs ${C.TILE*2}px walk target · shared scale, no per-bank override`);
  ok(!/attackScaleMul|atkScale/i.test(src),'no attack-only scale knob exists');
}

H('4 · ★ THE STRIKE ANIMATES · opt-in column walk');
{
  ok(C.DAEMON_ATTACK_CYCLE_MS===110,'110ms x 4 cols fills the 420ms strike window');
  ok(/\(useAtk && n\.attackCycleMs\) \? Math\.floor\(performance\.now\(\) \/ n\.attackCycleMs\) % useCols/.test(src),
     '★ chooser walks the columns while _atkUntil is live');
  ok(/attackCycleMs/.test(src.slice(src.indexOf('const col     ='),src.indexOf('const col     =')+900)),'…in the col chooser itself');
  const daemons=C.NPCS.filter(n=>n&&n.mode==='daemon');
  ok(daemons.every(n=>n.attackCycleMs===110),'every daemon opts in');
  // opt-in means the shipped Seer Grunt + creeper strikes are untouched
  ok(!/attackCycleMs/.test(src.slice(src.indexOf('_seerGrunt'),src.indexOf('_seerGrunt')+4000)),'Seer Grunts did NOT inherit it — their shipped timing stands');
}

H('5 · ★★ THE HUNT LADDER · >16 wander · 9-16 prowl · <=8 sprint · 1 strike');
{
  ok(C.DAEMON_PROWL_R===16,'prowl band reaches 16 tiles');
  const i=src.indexOf('THE PROWL');
  ok(i>0,'the prowl block exists');
  const blk=src.slice(i,i+1600);
  ok(/isDaemon && manh > detectR && manh <= DAEMON_PROWL_R/.test(blk),'★ prowl only OUTSIDE sprint range and INSIDE 16 · daemons only');
  ok(/340 \+ Math\.random\(\) \* 160/.test(blk),'stalking gait · ~2.6x slower than the sprint step');
  ok(i>src.indexOf("n._chasing = (manh <= detectR)"),'★ prowl sits AFTER _chasing is set — a prowling daemon WALKS (run bank stays holstered)');
  ok(/attackSheet && manh <= 1/.test(src),'the generic adjacent-strike hook plays the attack bank at 1 tile');
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');
process.exit(0);
