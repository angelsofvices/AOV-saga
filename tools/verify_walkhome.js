const fs = require('fs');
const _harnessSrc = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
global.setInterval = () => 0; global.setTimeout = () => 0;
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width:0, height:0, data:[] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop, play:()=>Promise.resolve(), pause:noop,
  querySelector:()=>el(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById:()=>el(), querySelector:()=>el(), querySelectorAll:()=>[],
  createElement:()=>el(), addEventListener:noop, body:el(), documentElement:el(), head:el(),
  hidden:false, visibilityState:'visible' };
global.window = global;
global.localStorage = { getItem:()=>null, setItem:noop, removeItem:noop };
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this} }; };
global.Image = function(){ return { addEventListener:noop, complete:false, naturalWidth:0, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
// verify_whud · v0.95.784 · the weapon wheel shows what is in hand
// verify_walkhome · v0.95.808 · Yara walks to the front door, not through spacetime
const FS=require('fs');
try{new Function(FS.readFileSync('/tmp/all.js','utf8')+
  ';globalThis.__C={player,game,walkNpcHome,INTERIOR_FRONT_DOORS,NPCS,findNpcById,tickNPC:(typeof tickNPC!=="undefined"?tickNPC:null),_propBlocked};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C; let fail=0;
const ok=(c,m)=>{ console.log(`  ${c?'✅':'❌'} ${m}`); if(!c) fail++; };
const H=t=>console.log('\n'+t);
const src=FS.readFileSync('/tmp/all.js','utf8');

H('1 · ★★ THE DOOR IS ON RECORD, AND IT IS THE RIGHT TILE');
{
  ok(!!C.INTERIOR_FRONT_DOORS.interior_home,'the family home has a front door entry');
  const d=C.INTERIOR_FRONT_DOORS.interior_home;
  ok(d.x===22&&d.y===106,`at (22,106) · one south of the door tile`);
  // ★ the DOOR tile (22,105) is solid · the DOORSTEP must not be, or the walk
  //   can never finish
  // ★ my first assertion here said the door tile was solid "as authored" — the
  //   prop's own comment says the opposite ("door tile stays walkable"), and
  //   the world agrees.  Test what IS true: both tiles are reachable.
  ok(!C._propBlocked.has('22,105'),'the door tile itself is left walkable by the prop, per its comment');
  ok(!C._propBlocked.has('22,106'),'★ and the doorstep is walkable — she can actually stand there');
}

H('2 · ★★ SCENE MISMATCH NO LONGER MEANS TELEPORT');
{
  const i=src.indexOf("if (n.mode === 'walkHome')");
  const body=src.slice(i, i+3600);
  ok(/INTERIOR_FRONT_DOORS\[tgt\.scene\]/.test(body),'★ the mismatch branch consults the door table');
  ok(/n\.scene === 'overworld'/.test(body),'only when she is OUTSIDE — interior-to-interior keeps the swap');
  ok(/n\.tileX === door\.x && n\.tileY === door\.y/.test(body),
     '★ the scene swap fires ONLY on the doorstep — the moment she is seen going inside');
  ok(/n\._walkHomeAim = door/.test(body),'until then the stepping code aims at the door');
  ok(/const _aim = n\._walkHomeAim \|\| tgt/.test(body),'and the step + axis logic reads that aim');
  // interiors with no recorded door keep the old behaviour, stated as a choice
  ok(/pathfinding project wearing a bugfix/.test(body)||/instant swap/.test(body),
     'unlisted interiors keep the instant swap, by stated choice');
}

H('3 · ★★ WALK IT · SCHOOL TO DOORSTEP TO KITCHEN');
{
  const P=C.player; C.game.scene='overworld';
  // ★ park the player OFF the route — stepNPCTo refuses to step onto the
  //   player's tile, and the boot spawn sits close enough to the doorstep to
  //   deadlock the walk.  In play the player is walking away from the school;
  //   in the harness nobody moves unless told.
  P.x=50; P.y=140;
  const y={ id:'test_yara', name:'Yara', scene:'overworld', tileX:30, tileY:110,
            dir:'down', mode:'stationary', moving:false, moveCd:0 };
  C.walkNpcHome(y, 9, 3, 'interior_home');
  ok(y.mode==='walkHome','the walk starts');
  // drive the tick until she gets home or we give up
  const tick=C.tickNPC;
  ok(typeof tick==='function','tickNPC is reachable');
  let steps=0, sawDoorstep=false, teleportedEarly=false;
  for (let t=0; t<400 && y.mode==='walkHome'; t++){
    y.moveCd=0; y._walkHomeStart=performance.now();   // hold the bail-out timer off
    try { tick(y); } catch(e){ break; }
    steps++;
    if (y.scene==='overworld' && y.tileX===22 && y.tileY===106) sawDoorstep=true;
    if (y.scene==='interior_home' && !sawDoorstep) teleportedEarly=true;
  }
  ok(!teleportedEarly,'★ she NEVER changes scene without standing on the doorstep first');
  ok(sawDoorstep,`★ she physically reached the doorstep (${steps} ticks)`);
  ok(y.scene==='interior_home'&&y.tileX===9&&y.tileY===3,'and finished at home with Mom');
  ok(y.mode==='stationary','settled');
}

H('4 · ★ THE BAIL-OUT SURVIVED, DOUBLED');
{
  ok(/> 20000/.test(src.slice(src.indexOf("if (n.mode === 'walkHome')"), src.indexOf("if (n.mode === 'walkHome')")+3600)),
     '★ 10s → 20s · the doorstep leg is a real journey, and the old timer would have "fixed" the walk by teleporting mid-street');
  const y2={ id:'t2', name:'x', scene:'overworld', tileX:500, tileY:500, dir:'down', mode:'stationary', moveCd:0 };
  C.walkNpcHome(y2, 9, 3, 'interior_home');
  y2._walkHomeStart=performance.now()-21000;
  y2.moveCd=0; C.tickNPC(y2);
  ok(y2.scene==='interior_home'&&y2.mode==='stationary',
     'a genuinely stuck walker still snaps home instead of pacing forever');
}

console.log('\n'+(fail?`❌ ${fail} CHECK(S) FAILED`:'✅ ALL CHECKS PASS'));
process.exit(fail?1:0);
