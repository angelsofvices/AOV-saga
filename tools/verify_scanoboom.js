const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
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
// v0.95.733 · SCANOBOT DETONATION · "explode like boom chests. aoe is 2x2.
// best to astralblast them. melee will inflict dmage to you on explosion."
//
// The harness stubs setTimeout to a no-op; the fuse needs it to be a QUEUE so
// the pre-fuse and post-fuse states can both be asserted.
let TICKS = [];
global.setTimeout = (fn) => { TICKS.push(fn); return 0; };
const flush = () => { const t = TICKS; TICKS = []; t.forEach(fn => { try { fn(); } catch(e){ console.log('   tick threw:', e.message); } }); };
try{new Function(require('fs').readFileSync('/tmp/all.js','utf8')+';globalThis.__C={NPCS,player,game,buildScanobotNet,applyScanobotState,detonateScanobot,scanobotBlastBlock,scanobotInBlast,scanobotDrop,SCANOBOT_BLAST,BOOM_BLASTS,BOOM,BOOM_DEBRIS,drawBoomBlasts,GEM_ENTITIES,startMoriDeath};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C,P=C.player,G=C.game;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};
TICKS=[];                       // drop anything boot queued
C.buildScanobotNet();P.scanobotsRogue=true;C.applyScanobotState();
G.scene='overworld';P.baseAtk=25;P.hpMax=100;
const bots=C.NPCS.filter(n=>n&&n._scanobot);

console.log('\n1 · ★ THE BLOCK IS A LITERAL 2x2\n');
const n0=bots[0];
P.x=n0.tileX+3;P.y=n0.tileY;
let blk=C.scanobotBlastBlock(n0);
ok((blk.bx-blk.ax+1)===2&&(blk.by-blk.ay+1)===2,`block is ${blk.bx-blk.ax+1}x${blk.by-blk.ay+1}`);
ok(C.scanobotInBlast(blk,n0.tileX,n0.tileY),'the drone is always inside its own blast');
ok(C.scanobotInBlast(blk,n0.tileX+1,n0.tileY),'and it reaches EAST, toward the Rizer');
P.x=n0.tileX-3;blk=C.scanobotBlastBlock(n0);
ok(C.scanobotInBlast(blk,n0.tileX-1,n0.tileY),'stand WEST and it reaches west instead');
ok(C.scanobotInBlast(blk,n0.tileX,n0.tileY),'drone still inside either way');
ok(C.SCANOBOT_BLAST.TILES===2,'declared size is 2, matching the damage footprint');

console.log('\n2 · ★★ MELEE HURTS YOU · RANGED DOES NOT\n');
console.log('     Nothing here reads the attack mode. POSITION decides, so the');
console.log('     rule cannot be gamed by meleeing then walking, nor broken by');
console.log('     astralstriking one from point blank.\n');
function boom(n,px,py){
  P.hp=100;P.x=px;P.y=py;delete n._scanoBoomed;
  C.BOOM_BLASTS.length=0;C.detonateScanobot(n);flush();
  return 100-P.hp;
}
const n1=bots[1];
const adj=boom(n1,n1.tileX+1,n1.tileY);
ok(adj>0,`MELEE range (adjacent) → you take ${adj} HP`);
ok(boom(n1,n1.tileX,n1.tileY)>0,'standing ON it → also hit');
const far2=boom(n1,n1.tileX+2,n1.tileY);
ok(far2===0,`2 tiles out → ${far2} HP · already clear`);
const far4=boom(n1,n1.tileX+4,n1.tileY);
ok(far4===0,`A3 astralstrike range (4 tiles) → ${far4} HP · this is why ranged is "best"`);
const exp=Math.round(25*C.SCANOBOT_BLAST.DMG*C.SCANOBOT_BLAST.SELF);
ok(adj===exp,`self-damage ${adj} = baseAtk 25 x ${C.SCANOBOT_BLAST.DMG} x ${C.SCANOBOT_BLAST.SELF}`);
ok(adj<100,'and never one-shots a full-HP Rizer by itself');

console.log('\n3 · ★ IT REALLY IS A BOOM-CHEST BLAST\n');
const n2=bots[2];delete n2._scanoBoomed;
C.BOOM_BLASTS.length=0;C.BOOM_DEBRIS.length=0;
P.x=n2.tileX+9;P.y=n2.tileY+9;
C.detonateScanobot(n2);flush();
ok(C.BOOM_BLASTS.length===1,'pushes onto the SAME BOOM_BLASTS layer the chests use');
const e=C.BOOM_BLASTS[0];
ok(e.tiles===2,`FX drawn at ${e.tiles} tiles — visual and damage footprint cannot disagree`);
ok(e.cxT!=null&&e.cxT%1===0,'centre is the CORNER of the 2x2 (integer tile boundary) — an even block has no middle tile');
ok(e.ms===C.SCANOBOT_BLAST.FX_MS,`sharper pop than the chest (${e.ms}ms vs ${C.BOOM.BLAST_MS}ms)`);
ok(C.BOOM_DEBRIS.length===4,`debris on all ${C.BOOM_DEBRIS.length} tiles of the block`);
ok(C.BOOM.AOE_TILES===7,'★ BOOM chest UNCHANGED at 7x7 — the new defaults reproduce it exactly');
let threw=0;try{C.drawBoomBlasts();}catch(err){threw=1;console.log('   '+err.message);}
ok(!threw,'drawBoomBlasts renders the new entry shape without throwing');

console.log('\n4 · ★★ THE FUSE\n');
const n3=bots[3];delete n3._scanoBoomed;
C.BOOM_BLASTS.length=0;P.hp=100;P.x=n3.tileX+1;P.y=n3.tileY;
C.detonateScanobot(n3);
ok(C.BOOM_BLASTS.length===0&&P.hp===100,`nothing for ${C.SCANOBOT_BLAST.FUSE_MS}ms — there IS a window to step clear`);
flush();
ok(P.hp<100,'and then it goes off');
const hpAfter=P.hp;
C.detonateScanobot(n3);flush();
ok(P.hp===hpAfter,'the same drone cannot detonate twice (_scanoBoomed latch)');

console.log('\n5 · ★★ LOOT SURVIVES THE BLAST\n');
console.log('     The gem is spawned BEFORE the fuse is lit, so a drone can');
console.log('     never blow up its own drop.\n');
const n4=bots[4];P.items=P.items||{};P.items.scrap_metal=0;
C.GEM_ENTITIES.length=0;C.BOOM_BLASTS.length=0;
P.x=n4.tileX+9;P.y=n4.tileY+9;
C.scanobotDrop(n4);
// ★ v0.95.814 · the scrap SPILLS as a ground pile now, alongside the chip —
// the bag stays empty until the player walks the wreckage.  Inverted with reason.
ok((P.items.scrap_metal||0)===0,'scrap lands as a GROUND PILE, not a bag credit');
ok(C.GEM_ENTITIES.filter(g=>!g.collected).length===1,'gem on the ground at kill time');
ok(C.BOOM_BLASTS.length===0,'and the blast has not fired yet');
flush();
ok(C.GEM_ENTITIES.filter(g=>!g.collected).length===1,'★ gem still on the ground after the detonation');
const body=String(C.scanobotDrop);
ok(body.indexOf('spawnGemDrop')<body.indexOf('detonateScanobot'),'ordering is explicit in the source, not luck');

console.log('\n6 · ★ IT CATCHES OTHER ENEMIES TOO\n');
const n6=bots[6];
const host={id:'t_host',scene:'overworld',isEnemy:true,hp:40,hpMax:125,tileX:n6.tileX+1,tileY:n6.tileY,level:5,tier:1};
C.NPCS.push(host);
delete n6._scanoBoomed;P.x=n6.tileX+9;P.y=n6.tileY+9;
C.detonateScanobot(n6);flush();
ok(host.hp<40||host._dying,`a Mori inside the block wears it too (hp ${host.hp}, dying ${!!host._dying})`);

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
