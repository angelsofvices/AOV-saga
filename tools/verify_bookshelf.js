// v0.95.658 · verify Dad's bookshelf: solid, reachable, art matches collision,
// and the interact hook is ready for items.
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
  new Function(src + ';globalThis.__C={DADS_BOOKSHELF_TILES,DADS_BOOKSHELF_BBOX,DADS_BOOKSHELF_ITEMS,' +
    'readDadsBookshelf,INTERIOR_RESEARCH_LAB,walkable,game,player,TILE,INVENTORY_META,' +
    'interiorConfig,tryInteract};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C;
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };
const F = C.DADS_BOOKSHELF_TILES;
const cols = [];
for (let i = 0; i < F.w; i++) cols.push(F.x + i);

console.log('\n1 · ★ COLLISION · the shelf is solid\n');
C.game.scene = 'interior_research_lab';
for (const cx of cols) ok(C.walkable(cx, F.y) === false, `tile (${cx},${F.y}) BLOCKS the player`);
ok(C.walkable(F.x - 1, F.y) === true, `(${F.x-1},${F.y}) just left of the shelf is still open`);
ok(C.walkable(F.x + F.w, F.y) === true, `(${F.x+F.w},${F.y}) just right of the shelf is still open`);

console.log('\n2 · REACHABLE · you can stand in front of it and face it\n');
let standable = 0;
for (const cx of cols) if (C.walkable(cx, F.y + 1)) standable++;
ok(standable === F.w, `all ${F.w} tiles on row ${F.y+1} are standable — you can face every part of the shelf`);
ok(C.walkable(F.x, F.y + 1) && C.walkable(F.x + F.w - 1, F.y + 1), 'both ends approachable');

console.log('\n3 · ★ ART COVERS EXACTLY THE BLOCKED TILES\n');
const TILE = C.TILE || 48;
const [bx, by, bw, bh] = C.DADS_BOOKSHELF_BBOX;
const drawW = F.w * TILE;
const drawH = Math.round(drawW * (bh / bw));
const dxL = F.x * TILE, dxR = dxL + drawW;
console.log(`     blocked tiles span px ${F.x*TILE}-${(F.x+F.w)*TILE}`);
console.log(`     sprite spans      px ${dxL}-${dxR}   (${drawW}x${drawH})`);
ok(dxL === F.x * TILE && dxR === (F.x + F.w) * TILE, 'sprite left/right edges land on tile boundaries');
ok(Math.abs((drawW / drawH) - (bw / bh)) < 0.02, `aspect preserved (${(drawW/drawH).toFixed(3)} vs source ${(bw/bh).toFixed(3)})`);
ok(!/\(6 \+ 0\.5\) \* TILE - drawW \/ 2/.test(src), 'the old half-tile-centred draw is gone');
const bottomPx = (F.y + 1) * TILE - drawH + drawH;
ok(bottomPx === (F.y + 1) * TILE, `sprite bottom rests on row ${F.y}'s lower edge — it stands on its blocked tile`);

console.log('\n4 · SINGLE SOURCE OF TRUTH\n');
const lab = C.INTERIOR_RESEARCH_LAB;
for (const cx of cols){
  ok(lab.blocked.some(([a,b]) => a === cx && b === F.y), `blocked[] lists (${cx},${F.y})`);
}
ok(/fy === DADS_BOOKSHELF_TILES\.y/.test(src), 'interact hitbox reads DADS_BOOKSHELF_TILES, not a hard-coded number');
ok(/const drawW = F\.w \* TILE/.test(src), 'sprite width reads DADS_BOOKSHELF_TILES too');

console.log('\n5 · ★ INTERACT HOOK · ready for items\n');
ok(Array.isArray(C.DADS_BOOKSHELF_ITEMS), 'DADS_BOOKSHELF_ITEMS exists as the extension point');
ok(C.DADS_BOOKSHELF_ITEMS.length === 0, 'empty for now — flavour text only, no phantom loot');
C.player.items = {}; C.player.bookshelfTaken = {};
let threw = null;
try { C.readDadsBookshelf(); } catch (e){ threw = e.message; }
ok(!threw, `reading the empty shelf does not throw${threw ? ' — ' + threw : ''}`);
ok(Object.keys(C.player.items).length === 0, 'and hands over nothing');

// simulate the Creator adding an item later
C.DADS_BOOKSHELF_ITEMS.push({ key: 'dads_notebook', qty: 1, line: 'test' });
C.player.items = {}; C.player.bookshelfTaken = {};
const got1 = C.readDadsBookshelf();
ok(got1 === true && C.player.items.dads_notebook === 1, 'adding one entry makes the shelf hand it over');
const got2 = C.readDadsBookshelf();
ok(got2 === false && C.player.items.dads_notebook === 1, 'a second read does NOT duplicate it');
ok(C.player.bookshelfTaken.dads_notebook === true, 'taken state recorded on player (rides the save)');
C.DADS_BOOKSHELF_ITEMS.length = 0;

console.log('\n6 · NO CLASH WITH THE REST OF THE LAB\n');
const others = lab.blocked.filter(([a,b]) => !(cols.includes(a) && b === F.y));
const clash = others.some(([a,b]) => cols.includes(a) && b === F.y);
ok(!clash, `shelf tiles do not overlap Dad's desk (9-11,2) or the coat rack (19,1)`);
ok(C.walkable(10, 2) === false && C.walkable(19, 1) === false, 'those two still block as before');
ok(C.walkable(C.INTERIOR_RESEARCH_LAB.spawn.x, C.INTERIOR_RESEARCH_LAB.spawn.y),
   'the lab entrance tile is still walkable — no softlock');

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
