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
// v0.95.732 · SCANOBOTS · Thardin's survey net · 5 per district · passive until
// the flip, then hostile everywhere, dropping scrap + a blue gem into a tiered
// shop at Scrapjaw.
try{new Function(fs.readFileSync('/tmp/all.js','utf8')+';globalThis.__C={SCANOBOT_OFFSETS,SCANOBOT_PER_DIST,SCANOBOT_ROGUE_DISTRICT,NPCS,player,game,buildScanobotNet,applyScanobotState,triggerScanobotRogue,scanobotDrop,scanobotsAreRogue,_scanobotWalkable,scrapShopBest,scrapShopBuy,scrapCount,SCRAP_SHOP,SCANOBOT_HP,SCANOBOT_TIER,SCANOBOT_ROGUE_TOWERS,TOWER_NETWORK,worldDistrictAt,MAP_COLS,MAP_ROWS,GEM_ENTITIES,startMoriDeath,addItems};')();}
catch(e){console.log('❌ BOOT FAILED:',e.message);process.exit(1);}
const C=globalThis.__C,P=C.player;let f=0;
const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)f++;};

console.log('\n1 · ★★ THE COUNT COMES FROM THE CONSTANT NOW\n');
C.buildScanobotNet();
const bots=C.NPCS.filter(n=>n&&n._scanobot);
// ★★ SCANOBOT_PER_DIST WAS A LIE.  The real count was the LENGTH of the
//    hand-written SCANOBOT_OFFSETS array, so raising the constant from 5 to 30
//    changed nothing.  A constant that does not drive the thing it names reads
//    as the knob while not being the knob.  Test the RELATIONSHIP, not a number.
ok(C.SCANOBOT_OFFSETS.length === C.SCANOBOT_PER_DIST,
   `★ the offset table is generated FROM the constant · ${C.SCANOBOT_OFFSETS.length} offsets for ${C.SCANOBOT_PER_DIST} per district`);
const want = C.SCANOBOT_PER_DIST * C.TOWER_NETWORK.length;
ok(bots.length===want,`${bots.length} Scanobots seeded · ${C.SCANOBOT_PER_DIST} x ${C.TOWER_NETWORK.length} districts`);
const per={};bots.forEach(b=>per[b._scanobot]=(per[b._scanobot]||0)+1);
ok(Object.keys(per).length===10,`spread over ${Object.keys(per).length} districts`);
ok(Object.values(per).every(v=>v===C.SCANOBOT_PER_DIST),`exactly ${C.SCANOBOT_PER_DIST} in every district · `+JSON.stringify(per));
ok(C.buildScanobotNet()===0,'re-running the seeder adds none (idempotent · boot AND load both call it)');

console.log('\n2 · ★★ EVERY DRONE STANDS SOMEWHERE LEGAL\n');
const oob=bots.filter(b=>!(b.tileX>=0&&b.tileY>=0&&b.tileX<C.MAP_COLS&&b.tileY<C.MAP_ROWS));
ok(oob.length===0,`none off the map (${oob.length}) — the first pass put two at y=-1 and y=-7`);
ok(bots.every(b=>b.tileY>0&&b.tileX>0),'none pinned to the world edge either — the "rescue" answer that passed every predicate and still looked wrong');
ok(bots.filter(b=>C.worldDistrictAt(b.tileX,b.tileY)!==b._scanobot).length===0,'every drone is inside the district it reports');
ok(bots.filter(b=>!C._scanobotWalkable(b.tileX,b.tileY)).length===0,'none inside terrain or a prop footprint');
const seen=new Set();let dup=0;bots.forEach(b=>{const k=b.tileX+','+b.tileY;if(seen.has(k))dup++;seen.add(k);});
ok(dup===0,`none stacked on each other (${dup})`);
ok(!/[^_]walkable\(/.test(String(C.buildScanobotNet)+String(C._scanobotWalkable)),
   'placement never calls walkable() — it reads game.scene, and load can fire from inside a house');

console.log('\n3 · ★★ PASSIVE UNTIL THE STORY SAYS OTHERWISE\n');
P.scanobotsRogue=false;C.applyScanobotState();
// ★★ DELIBERATELY INVERTED FROM v0.95.732.  It used to read "at boot NOT ONE
//    is an enemy", and it passed — but the Creator wants them "smashable at
//    game start", and isEnemy was doing two jobs: BOTH "hunts you" and "can be
//    hit at all".  Square went straight through a passive drone.
ok(bots.every(b=>b.isEnemy),
   '★ every drone is a valid TARGET from the first frame — smashable at game start');
ok(bots.every(b=>b.mode==='wander'),
   '★ but none of them HUNTS · mode, not isEnemy, decides that');
ok(bots.every(b=>!b.drainAmt),'and a passive drone drains nothing');
ok(bots.every(b=>b._passive),'each flagged passive so the state is readable, not inferred');
ok(bots.every(b=>b.hpMax===C.SCANOBOT_HP),`all at ${C.SCANOBOT_HP} HP · lightweight, one Mori band, flat`);
ok(C.SCANOBOT_TIER===1,'tier 1 keeps kill XP modest — the reward is the loot, not the fight');
const lv=Object.fromEntries(C.TOWER_NETWORK.map(t=>[t.dist,(bots.find(b=>b._scanobot===t.dist)||{}).level]));
ok(lv.malezor===5&&lv.korathen===80,'levels ride the district band · Malezor 5 → Korathen 80');
C.triggerScanobotRogue();
ok(C.scanobotsAreRogue(),'triggerScanobotRogue sets the flag');
ok(bots.every(b=>b.mode==='drainer'),`and ALL ${bots.length} turn at once`);
ok(bots.every(b=>b.drainAmt>0),'every one of them drains now');
ok(bots.every(b=>!b._passive),'and none is still flagged passive');
ok(C.triggerScanobotRogue()===false,'the event cannot fire twice');
P.scanobotsRogue=false;C.applyScanobotState();
ok(bots.every(b=>b.mode==='wander'&&!b.drainAmt),
   'and the state is re-derivable from the one flag, so a pre-flip save cannot restore a passive net into a rogue world');
P.scanobotsRogue=true;C.applyScanobotState();

console.log('\n4 · ★★ DROPS · SCRAP + A BLUE GEM\n');
P.items=P.items||{};P.items.scrap_metal=0;
C.GEM_ENTITIES.length=0;
const victim=bots[0];
C.scanobotDrop(victim);
ok((P.items.scrap_metal||0)===1,'a kill yields 1× Scrap Metal');
const gems=C.GEM_ENTITIES.filter(g=>!g.collected);
ok(gems.length===1,'and spawns exactly one gem');
ok(gems[0]&&gems[0].color==='blue',`and it is BLUE (${gems[0]&&gems[0].color}) · [[aov-gem-canon]] Blue = DEF+SP`);
ok(gems[0].x===victim.tileX&&gems[0].y===victim.tileY,'dropped where the drone died');
C.scanobotDrop(victim);
ok((P.items.scrap_metal||0)===1,'★ the same corpse cannot be looted twice');
const sd=String(C.startMoriDeath);
ok(/_scanobot/.test(sd)&&/scanobotDrop/.test(sd),
   '★★ the drop hangs off startMoriDeath — the ONE door all ten kill routes pass through, same reason the Creeper heal lives there');

console.log('\n5 · ★ THE SCRAP SINK\n');
ok(C.SCRAP_SHOP.every((t,i,a)=>!i||a[i-1].cost>t.cost),'shop list is cost-DESCENDING, so "first affordable" really is the best tier');
P.items.scrap_metal=3;
ok(C.scrapShopBest()===null,'3 scrap buys nothing (battery trade at 1 is separate and untouched)');
P.items.scrap_metal=4;
ok(C.scrapShopBest().key==='potion','4 → Potion');
P.items.scrap_metal=25;
ok(C.scrapShopBest().key==='zysphere_ultra','25 → the Ultra Zysphere, not the Potion');
const before=P.items.zysphere_ultra||0;
C.scrapShopBuy();
ok((P.items.zysphere_ultra||0)===before+1,'buying grants the item');
ok(C.scrapCount()===5,`and charges exactly 20 (25 → ${C.scrapCount()})`);
P.items.scrap_metal=0;
ok(C.scrapShopBuy()===null,'broke buys nothing and cannot go negative');
ok(C.scrapCount()===0,'scrap never went below zero');

console.log('\n6 · ★ ART\n');
ok(fs.existsSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/enemies/scanobot.png'),'scanobot.png is on disk');
ok(fs.existsSync('/sessions/great-cool-heisenberg/mnt/AOV-saga-new/assets/2D sprites/enemies/_orig/scanobot-delivered.png'),'and the delivered sheet is preserved');
ok(bots.every(b=>b.bboxes&&b.bboxes.length===4&&b.bboxes.every(r=>r.length===4)),'every drone carries a full 4x4 bbox table');
ok(bots.every(b=>b.bboxes.flat().every(x=>x[0]>=0&&x[1]>=0&&x[0]+x[2]<=313&&x[1]+x[3]<=313)),'and every bbox stays inside its 313 cell');


console.log('\n★★ 7 · THARDIN TURNS THE NET\n');
{
  const P=C.player;
  P.scanobotsRogue=false; C.applyScanobotState();
  ok(C.SCANOBOT_ROGUE_DISTRICT==='thardin',
     '★ the trigger district is THARDIN — the corporation that built the drones');
  const src=require('fs').readFileSync('/tmp/all.js','utf8');
  ok(/dist === SCANOBOT_ROGUE_DISTRICT/.test(src),'district entry checks it');
  // ★ fires on ARRIVAL, not FIRST arrival · a save that predates this, or a
  //   border crossed before the flag existed, still turns the net next time in
  const i=src.indexOf('dist === SCANOBOT_ROGUE_DISTRICT');
  const firstBlock=src.indexOf('if (first){', src.indexOf('const first = !player.visitedDistricts'));
  ok(i>0 && firstBlock>0 && i < firstBlock,
     '★ and it fires on ARRIVAL, not inside the first-visit-only block');
  ok(C.triggerScanobotRogue('thardin')===true,'walking in turns them');
  ok(C.scanobotsAreRogue(),'the flag sticks');
  ok(C.triggerScanobotRogue('thardin')===false,'and it is idempotent, so re-entering is harmless');
  P.scanobotsRogue=false; C.applyScanobotState();
}

console.log(f?`\n❌ ${f} failure(s)`:'\n✅ ALL CHECKS PASS');process.exit(0);
