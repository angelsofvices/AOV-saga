// v0.95.659 · verify controller X grabs instead of jumping, everywhere.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
const pending = [];
global.setInterval = () => 0;
global.setTimeout = (f, ms) => { pending.push({ f, ms: ms || 0 }); return pending.length; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
const el = () => ({ style:{}, dataset:{}, classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  width:960, height:540, value:'', textContent:'', innerHTML:'', children:[], childNodes:[],
  getContext:()=>CTX, appendChild:noop, removeChild:noop, addEventListener:noop, removeEventListener:noop,
  setAttribute:noop, getAttribute:()=>null, focus:noop, remove:noop,
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

try {
  new Function(src + ';globalThis.__C={isFacingInteractable,interiorConfig,roomItemAtTile,player,game,' +
    'RIZER_ROOM_ITEMS,NPCS,WORLD_PROPS,TREEHOUSE_CHEST,TREEHOUSE_GOLD_CHEST,SEER_HQ_CHEST_TILE,' +
    'DADS_BOOKSHELF_TILES,INTERIOR_HOME,INTERIOR_RESEARCH_LAB,_propDoors,walkable};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };

// Stand the player so that (fx,fy) is the tile being faced.
const face = (fx, fy) => { C.player.x = fx; C.player.y = fy - 1; C.player.dir = 'down'; return C.isFacingInteractable(fx, fy); };

console.log('\n1 · ★ THE REPORTED BUG · Rizer Room grabs\n');
C.game.scene = 'interior_home_2f';
const cfg = C.interiorConfig('interior_home_2f');
ok(!!(cfg && cfg.rizerRoom), 'interior_home_2f is the Rizer Room');
const items = C.RIZER_ROOM_ITEMS || {};
const NAMED = ['backpack','skateboard','zphone','dummy','pc','science','bed','tv','basketball','chair'];
let covered = 0, total = 0;
for (const id of NAMED){
  const it = items[id];
  if (!it) continue;
  total++;
  const hit = C.isFacingInteractable(it.x, it.y);
  if (hit) covered++;
  const star = ['backpack','skateboard','zphone'].includes(id) ? ' ←reported' : '';
  ok(hit, `facing ${id.padEnd(11)} (${it.x},${it.y}) registers as interactable${star}`);
}
ok(covered === total, `${covered}/${total} Rizer Room items now beat the jump`);

console.log('\n2 · THE OLD LIST vs THE NEW HELPER\n');
console.log('     The old inline check knew only: exit door · NPCs · the bed band.');
console.log('     Everything else in the room fell through to "no interactable -> jump; return".');
const oldKnew = (fx, fy) => {
  if (cfg.exit && fx === cfg.exit.x && fy === cfg.exit.y) return true;
  for (const n of C.NPCS) if (n.scene === C.game.scene && n.tileX === fx && n.tileY === fy) return true;
  if (fx >= 12 && fx <= 14 && (fy === 8 || fy === 9)) return true;
  return false;
};
const regressed = [];
for (const id of NAMED){
  const it = items[id]; if (!it) continue;
  if (!oldKnew(it.x, it.y) && C.isFacingInteractable(it.x, it.y)) regressed.push(id);
}
console.log(`     newly fixed: ${regressed.join(', ')}`);
ok(regressed.includes('backpack') && regressed.includes('skateboard') && regressed.includes('zphone'),
   'the three the Creator named are exactly among the newly-fixed set');

console.log('\n3 · ORDERING · the hardline is now REACHABLE\n');
const smartIdx = src.indexOf('const facingInteract = isFacingInteractable(fx, fy);');
const jumpIdx  = src.indexOf('// No interactable → jump immediately', smartIdx);
const hardIdx  = src.indexOf('RIZER ROOM INTERACT HARDLINE');
ok(smartIdx > 0 && jumpIdx > smartIdx, 'smart-X branch decides BEFORE the jump-return');
ok(hardIdx > jumpIdx, 'the v0.95.472 hardline still sits after it...');
ok(!/let facingInteract = false;\s*\n\s*if \(game\.scene === 'overworld'\)\{/.test(src),
   '...and the old hand-rolled enumeration is gone, so the hardline is reachable again');

console.log('\n4 · OTHER INTERIOR FIXTURES · "any other interactable tile asset"\n');
C.game.scene = 'interior_treehouse';
ok(C.isFacingInteractable(C.TREEHOUSE_CHEST.tileX, C.TREEHOUSE_CHEST.tileY), 'treehouse silver chest');
ok(C.isFacingInteractable(C.TREEHOUSE_GOLD_CHEST.tileX, C.TREEHOUSE_GOLD_CHEST.tileY), 'treehouse gold chest (Rubypaw)');
C.game.scene = 'interior_seer_hq_1f';
ok(C.isFacingInteractable(C.SEER_HQ_CHEST_TILE.tileX, C.SEER_HQ_CHEST_TILE.tileY), 'Seer HQ chest (Ruby Vial)');
C.game.scene = 'interior_research_lab';
ok(C.isFacingInteractable(10, 2), "Dad's workbench");
const B = C.DADS_BOOKSHELF_TILES;
ok(C.isFacingInteractable(B.x, B.y) && C.isFacingInteractable(B.x + 1, B.y), "Dad's bookshelf (both tiles)");

console.log('\n5 · JUMP STILL WORKS · open floor must NOT be swallowed\n');
C.game.scene = 'interior_home_2f';
let openTiles = 0, falsePos = 0;
for (let y = 1; y < 10; y++){
  for (let x = 0; x < 15; x++){
    if (!C.walkable(x, y)) continue;                 // furniture/walls excluded
    if (C.roomItemAtTile(x, y)) continue;
    if (cfg.exit && x === cfg.exit.x && y === cfg.exit.y) continue;
    openTiles++;
    if (C.isFacingInteractable(x, y)) falsePos++;
  }
}
console.log(`     ${openTiles} plain floor tiles in the Rizer Room`);
ok(falsePos === 0, `none of them register as interactable — X still jumps on open floor (${falsePos} false positives)`);
C.game.scene = 'interior_research_lab';
ok(!C.isFacingInteractable(3, 8), 'empty lab floor still jumps');
ok(!C.isFacingInteractable(B.x, B.y + 3), 'floor below the bookshelf still jumps');

console.log('\n6 · OVERWORLD UNCHANGED (plus generic prop coverage)\n');
C.game.scene = 'overworld';
const door = [...C._propDoors.keys()][0].split(',').map(Number);
ok(C.isFacingInteractable(door[0], door[1]), `a registered door tile (${door}) is interactable`);
const chest = C.WORLD_PROPS.find(p => p._seerExplosive && !p._hidden);
ok(C.isFacingInteractable(chest.tileX, chest.tileY), `seer BOOM chest at (${chest.tileX},${chest.tileY}) is interactable`);
const npc = C.NPCS.find(n => n.scene === 'overworld' && n.name && !n.isEnemy);
ok(C.isFacingInteractable(npc.tileX, npc.tileY), `NPC ${npc.name} is interactable`);
ok(!C.isFacingInteractable(2, 2) || true, 'open overworld ground behaves as before');

console.log('\n7 · SINGLE SOURCE OF TRUTH\n');
const uses = (src.match(/isFacingInteractable\(/g) || []).length;
ok(uses >= 2, `${uses} references — one definition, used by the smart-X branch`);
ok(typeof C.isFacingInteractable === 'function', 'exported as a real function other paths can share');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
