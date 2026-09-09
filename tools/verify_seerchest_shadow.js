// ★★★ v0.96.55 · THE SEER HQ CHESTS COULD NOT BE OPENED
//
// Two functions were both named `seerChestAt`:
//
//     ~19540  function seerChestAt(x, y)          the HQ interior chests
//     ~21866  function seerChestAt(scene, x, y)   the overworld explosives
//
// A later function declaration wins, so the 3-argument overworld version
// silently replaced the 2-argument one.  Every 2-arg call handed a tile NUMBER
// in as `scene`, which failed `scene !== 'overworld'` and returned null — every
// time, for the whole life of the feature.
//
// Three call sites were affected:
//     walkable()             you could walk THROUGH both chests
//     isFacingInteractable() X never lit them up
//     tryInteract()          got null and fell through to the NPC scan
//
// So neither HQ chest could be opened: no BASEMENT KEY, therefore no ATTIC KEY,
// therefore no Commander, therefore no Ruby Vial and no district soft-gate.
//
// ★★ WHAT MAKES THIS WORTH ITS OWN SUITE: the comment sitting directly above
// the shadowed definition describes the PREVIOUS incarnation of this same bug
// — "the Seer Key has been unobtainable ever since" — and introducing that
// helper was the repair for it.  The repair was cancelled by a name collision
// on the day it landed, so the key stayed unobtainable for a brand new reason,
// and the suite that should have caught it (verify_interact) was standing on
// the wrong floor looking at empty air.
//
// Driven, not read: at HEAD, X on either chest granted nothing.
const fs = require('fs');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const noop = () => {};
const _Q = [];
global.setInterval = () => 0; global.setTimeout = (f) => { _Q.push(f); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
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
global.Audio = function(){ return { play:()=>Promise.resolve(), pause:noop, addEventListener:noop, cloneNode(){return this;} }; };
global.Image = function(){ return { addEventListener:noop, complete:true, naturalWidth:1254, src:'' }; };
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches:false, addEventListener:noop, addListener:noop });
global.navigator = { userAgent:'node', getGamepads:()=>[], maxTouchPoints:0 };
global.performance = { now: () => Date.now() };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

try {
  new Function(src + ';globalThis.__C={SEER_HQ_CHESTS,seerHqChestAt,seerChestAt,isFacingInteractable,' +
    'walkable,tryInteract,game,player,hasSeerKey,hasSeerBasementKey,seerHqDistrict,' +
    'SEER_HQ_CHEST_TILE,SEER_HQ_CHEST_SCENE,tryOpenSeerHqChest};')();
} catch (e) { console.log('❌ BOOT FAILED:', e.message); process.exit(1); }
const C = globalThis.__C; let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H = t => console.log('\n' + t);
global.showToast = noop; global.playSFX = noop; global.saveGame = noop;
{ let n = 0; while (_Q.length && n < 600) { const fn = _Q.shift(); n++; try { fn(); } catch (_) {} } }
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
const HTML = fs.readFileSync(ROOT + 'rp7b.html', 'utf8');
const P = C.player;

H('1 · ★★★ NO TWO TOP-LEVEL FUNCTIONS MAY SHARE A NAME');
{
  const names = (HTML.match(/^\s*function [a-zA-Z_$][a-zA-Z0-9_$]*\(/gm) || [])
    .map(s => s.replace(/^\s*function /, '').replace(/\($/, ''));
  const seen = new Set(), dupes = new Set();
  for (const n of names) { if (seen.has(n)) dupes.add(n); seen.add(n); }
  ok(dupes.size === 0,
     `★★★ ${names.length} top-level functions, ${dupes.size} duplicated names${dupes.size ? ' · ' + [...dupes].join(', ') : ''}`);
  console.log('     A later declaration silently REPLACES an earlier one. No error, no');
  console.log('     warning — the losing function simply stops existing, and every call');
  console.log('     to it starts running code with a different signature.');
  ok(!/function seerChestAt\(x, y\)/.test(HTML),
     '★★ specifically: the 2-arg seerChestAt is gone · it is seerHqChestAt now');
  ok(/function seerChestAt\(scene, x, y\)/.test(HTML),
     '★ and the overworld 3-arg version keeps the plain name · it was the survivor, so renaming IT would have moved the bug rather than fixed it');
}

H('2 · ★★ THE TWO HELPERS ANSWER DIFFERENT QUESTIONS');
{
  ok(typeof C.seerHqChestAt === 'function', 'seerHqChestAt(x, y) · the HQ interior chests');
  ok(typeof C.seerChestAt === 'function',   'seerChestAt(scene, x, y) · the overworld explosives');
  ok(C.seerHqChestAt.length === 2 && C.seerChestAt.length === 3,
     '★★ and their ARITIES differ (2 vs 3) — which is exactly why the collision was silent instead of loud');
}

H('3 · ★★★ BOTH CHESTS EXIST, BLOCK, AND ANSWER X');
{
  ok(Array.isArray(C.SEER_HQ_CHESTS) && C.SEER_HQ_CHESTS.length === 2,
     `${(C.SEER_HQ_CHESTS || []).length} HQ chests · R2 holds the basement key, the vault holds the attic key`);
  for (const c of C.SEER_HQ_CHESTS) {
    C.game.scene = c.scene;
    const tag = `${c.scene.replace('interior_seer_hq_', '')} (${c.key || 'attic'})`;
    ok(!!C.seerHqChestAt(c.tileX, c.tileY), `★ ${tag} · the helper finds it`);
    ok(C.isFacingInteractable(c.tileX, c.tileY), `★★★ ${tag} · X lights it up`);
    ok(!C.walkable(c.tileX, c.tileY), `★★ ${tag} · and it BLOCKS · you cannot stand inside a strongbox`);
  }
}

H('4 · ★★★ AND THE KEYS ACTUALLY COME OUT · driven, not read');
{
  P.seerKeys = {}; P.seerBasementKeys = {}; P.seerHqChests = {};
  P.rubyVialChestOpened = false; P.seerHqDistrict = 'zarvane'; P.rizerLvl = 5;
  const drain = () => { let n = 0; while (_Q.length && n < 200) { const fn = _Q.shift(); n++; try { fn(); } catch (_) {} } };
  const r2 = C.SEER_HQ_CHESTS.find(c => c.key === 'basement');
  const vault = C.SEER_HQ_CHESTS.find(c => c.key !== 'basement');

  ok(C.hasSeerBasementKey() === false && C.hasSeerKey('zarvane') === false, 'starting with neither key');

  C.game.scene = r2.scene; P.x = r2.tileX; P.y = r2.tileY + 1; P.dir = 'up';
  C.tryInteract(); drain();
  ok(C.hasSeerBasementKey() === true,
     '★★★ X on the R2 chest yields the BASEMENT KEY · at HEAD this granted nothing at all');

  C.game.scene = vault.scene; P.x = vault.tileX; P.y = vault.tileY + 1; P.dir = 'up';
  C.tryInteract(); drain();
  ok(C.hasSeerKey('zarvane') === true,
     '★★★ and X on the vault chest yields the ATTIC KEY · the Commander is reachable again');

  // ★ the per-district law still holds · one raid, one key
  let leaked = 0;
  for (const d of ['malezor','andrannor','veridan','netharion','vorashil','xilnar','baelgor','thardin','korathen'])
    if (C.hasSeerKey(d)) leaked++;
  ok(leaked === 0, `★★ and NO other district was opened by it (${leaked} leaked) · ten raids, ten keys`);
}

console.log(f ? `\n❌ ${f} FAILED` : '\n✅ ALL PASS');
process.exit(0);
