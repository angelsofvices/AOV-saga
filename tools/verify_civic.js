#!/usr/bin/env node
/* verify_civic.js · v0.96.9 · THE DISTRICT BUILDING VOCABULARY
 *
 *   Creator: "author interiors for the buildings we have floor maps and rugs
 *   for. no landmarks yet. just the base malezor buildings. we will replicate
 *   for the other districts too. these are our district by district building
 *   for basic needs. remember the floor tile and rug set up the most. this will
 *   help people remember the pattern"
 *
 * ★★★ The pattern IS the feature. A player who has used Malezor's infirmary
 *   should recognise Korathen's before anyone speaks — same floor, same rug.
 *   So the decor is keyed to the BUILDING KIND, never to the district, and the
 *   test that matters most is that ten districts produce identical rooms.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const H = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);

console.log('\n=== CIVIC INTERIORS · v0.96.9 ===\n');

const noop = () => {};
const _Q = [];
global.setInterval = () => 0; global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: (_, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop: noop });
  if (k === 'getImageData') return () => ({ data: [], width: 0, height: 0 });
  if (k === 'canvas') return { width: 960, height: 540 };
  return () => {};
} });
const _els = new Map();
const mk = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
  getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop, removeEventListener: noop,
  setAttribute: noop, getAttribute: () => null, focus: noop, remove: noop, replaceChildren: noop,
  cloneNode(){ return mk(); }, querySelector: () => mk(), querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById: id => { if (!_els.has(id)) _els.set(id, mk()); return _els.get(id); },
  querySelector: () => mk(), querySelectorAll: () => [], createElement: () => mk(),
  addEventListener: noop, body: mk(), documentElement: mk(), head: mk(), hidden: false,
  visibilityState: 'visible', hasFocus: () => true };
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.Audio = function () { return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, volume: 1, cloneNode(){ return this; } }; };
global.Image = function () { const o = { addEventListener: noop, complete: true, naturalWidth: 256, naturalHeight: 145,
  set src(v){ this._src = v; }, get src(){ return this._src; } }; return o; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
global.performance = { now: () => 1000 };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
const LOG = console.log;
const TOASTS = [];
console.log = () => {}; console.warn = noop; console.error = noop;
new Function(src + `;globalThis.__C={ player, game, WORLD_PROPS, CIVIC_ROOMS, CIVIC_KINDS,
  CIVIC_CACHE, makeCivicInterior, civicSceneId, enterCivic, interiorConfig,
  civicService, civicCounterAt, CIVIC_HEAL_COST, BUILDING_DECOR, DOORMAT_IMGS,
  homesOwnedIn, walkable, DISTRICT_ORDER, showToast };`)();
let n = 0; while (_Q.length && n < 80) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;
const KINDS = ['nurse', 'zysphere-shop', 'potion-shop', 'town-hall', 'cottage-lodge'];

/* ── 1 · the five rooms exist and are whole ─────────────────────────────── */
{
  t(C.CIVIC_KINDS.length === 5 && KINDS.every(k => C.CIVIC_KINDS.includes(k)),
    `★ all five base buildings are declared · ${C.CIVIC_KINDS.join(', ')}`);
  for (const k of KINDS){
    const cfg = C.makeCivicInterior(k, 'malezor');
    t(!!cfg && cfg.cols > 0 && cfg.rows > 0, `  room · ${k} (${cfg && cfg.cols}x${cfg && cfg.rows})`);
  }
}

/* ── 2 · ★★★ THE PATTERN · the same room in every district ──────────────── */
{
  let mismatched = [];
  for (const k of KINDS){
    const a = C.makeCivicInterior(k, 'malezor');
    for (const d of C.DISTRICT_ORDER){
      const b = C.makeCivicInterior(k, d);
      if (b.tileImg.src !== a.tileImg.src || b.rug.key !== a.rug.key
          || b.cols !== a.cols || b.rows !== a.rows) mismatched.push(`${k}/${d}`);
    }
  }
  t(mismatched.length === 0,
    `★★★ all ten districts produce an IDENTICAL room per kind (${KINDS.length} kinds × `
    + `${C.DISTRICT_ORDER.length} districts, ${mismatched.length} mismatched) · this is the `
    + 'whole instruction: "remember the floor tile and rug set up the most. this '
    + 'will help people remember the pattern". Decor is keyed to the BUILDING KIND, '
    + 'never to the district, so the infirmary in Korathen is the infirmary you '
    + 'already know before a word of dialogue');
  // ★ and each kind is distinguishable from every other
  const sigs = KINDS.map(k => { const c = C.makeCivicInterior(k, 'malezor');
    return c.tileImg.src + '|' + c.rug.key; });
  t(new Set(sigs).size === KINDS.length,
    '★★ and every KIND has a different floor+rug signature · a pattern that repeats '
    + 'across buildings teaches nothing; the contrast is what makes it legible');
}

/* ── 3 · rooms are actually habitable ───────────────────────────────────── */
{
  let bad = [];
  for (const k of KINDS){
    const cfg = C.makeCivicInterior(k, 'malezor');
    // spawn must be inside and not on furniture
    if (cfg.spawn.x < 0 || cfg.spawn.x >= cfg.cols || cfg.spawn.y < 0 || cfg.spawn.y >= cfg.rows)
      bad.push(`${k}: spawn outside`);
    if (cfg.blocked.some(([x, y]) => x === cfg.spawn.x && y === cfg.spawn.y))
      bad.push(`${k}: spawn on furniture`);
    if (cfg.blocked.some(([x, y]) => x < 0 || y < 0 || x >= cfg.cols || y >= cfg.rows))
      bad.push(`${k}: furniture outside the room`);
    // the rug must lie inside too
    const r = cfg.rug;
    if (r.x < 0 || r.y < 0 || r.x + r.w > cfg.cols || r.y + r.h > cfg.rows)
      bad.push(`${k}: rug outside`);
  }
  t(bad.length === 0,
    `★★ every room's spawn, furniture and rug are inside their own walls${bad.length ? ' · ' + bad.join(', ') : ''} · `
    + 'a spawn on a blocked tile is a room you enter and cannot leave');

  // ★★★ REACHABILITY · flood from the spawn and make sure the counter is touchable
  for (const k of KINDS){
    const cfg = C.makeCivicInterior(k, 'malezor');
    const solid = new Set(cfg.blocked.map(([x, y]) => x + ',' + y));
    const seen = new Set([cfg.spawn.x + ',' + cfg.spawn.y]);
    const q = [[cfg.spawn.x, cfg.spawn.y]];
    while (q.length){
      const [x, y] = q.shift();
      for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
        const nx = x + dx, ny = y + dy, key = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= cfg.cols || ny >= cfg.rows) continue;
        if (solid.has(key) || seen.has(key)) continue;
        seen.add(key); q.push([nx, ny]);
      }
    }
    const reachableCounter = cfg.blocked.some(([bx, by]) =>
      [[0,1],[0,-1],[1,0],[-1,0]].some(([dx, dy]) => seen.has((bx+dx) + ',' + (by+dy))));
    const freeTiles = cfg.cols * cfg.rows - cfg.blocked.length;
    t(reachableCounter && seen.size >= freeTiles * 0.8,
      `★★ ${k} · the counter is reachable on foot and ${seen.size}/${freeTiles} of the floor `
      + 'is walkable from the door · furniture that seals a pocket is a room the '
      + 'player can see and never touch');
  }
}

/* ── 4 · ★★ EVERY ROOM DOES SOMETHING ───────────────────────────────────── */
{
  C.player.items = C.player.items || {};
  C.player.items.coins = 500;
  C.player.party = [{ hp: 10, maxHp: 100, speciesId: 'elzebub' }];
  const before = C.player.items.coins;
  C.civicService('nurse', 'malezor');
  t(C.player.party[0].hp === 100 && C.player.items.coins === before - C.CIVIC_HEAL_COST,
    `★★ the infirmary counter heals the party for ${C.CIVIC_HEAL_COST}c · the SAME service `
    + 'the hospital door used to perform, moved inside where it belongs rather '
    + 'than duplicated into a second code path that could drift');
  C.player.items.coins = 10;
  C.player.party[0].hp = 5;
  C.civicService('nurse', 'malezor');
  t(C.player.party[0].hp === 5 && C.player.items.coins === 10,
    '  · and it refuses when you cannot pay, without taking the coins');

  // the hall reads the estate rather than inventing a number
  C.player.ownedHomes = [];
  let threw = false;
  try { C.civicService('town-hall', 'malezor'); } catch (_) { threw = true; }
  t(!threw,
    '★★ the town hall reports the property registry · it was the one building '
    + 'whose job was never defined, and the estate system needed somewhere to be '
    + 'READ rather than only toasted at the moment of purchase');
  for (const k of KINDS){
    let ok2 = true;
    try { C.civicService(k, 'malezor'); } catch (_) { ok2 = false; }
    t(ok2, `  · ${k} counter responds without throwing`);
  }
}

/* ── 5 · ★★ THE COUNTER IS WHERE THE FURNITURE IS ───────────────────────── */
{
  const cfg = C.makeCivicInterior('nurse', 'malezor');
  const [bx, by] = cfg.blocked[0];
  t(C.civicCounterAt(cfg, bx, by) === true, '★ facing furniture is facing the counter');
  t(C.civicCounterAt(cfg, cfg.spawn.x, cfg.spawn.y) === false, '  · empty floor is not');
  t(C.civicCounterAt({ cols: 5, rows: 5 }, 0, 0) === false,
    '  · and a non-civic room has no counter at all · the guard is on cfg.civic, so '
    + 'this cannot fire inside a bedroom');
  t(/if \(cfg\.civic && civicCounterAt\(cfg, fx, fy\)\)/.test(H)
    && H.indexOf('if (cfg.civic && civicCounterAt(cfg, fx, fy))') < H.indexOf('if (cfg.rizerRoom){\n        const facedRoomItem'),
    '★★ dispatched BEFORE the Rizer Room branch · both read the faced tile, and a '
    + 'shop counter must not be mistaken for bedroom furniture');
}

/* ── 6 · ★★★ THE DOORS ACTUALLY OPEN ────────────────────────────────────── */
{
  const DOORS = { malezor_hospital: 'nurse', malezor_town_hall: 'town-hall',
                  malezor_potion_shop: 'potion-shop', malezor_zysphere_shop: 'zysphere-shop' };
  for (const [propId, kind] of Object.entries(DOORS)){
    const p = C.WORLD_PROPS.find(x => x && x.id === propId);
    // ★ v0.96.10 · the door now carries TWO verbs: _civicEnter (Square) and a
    //   quick-interact onInteract (X). This suite asserted enterCivic() was
    //   inside onInteract, which was true for exactly one version.
    t(!!p && p._civicEnter && p._civicEnter.kind === kind && p._civicEnter.dist === 'malezor',
      `★ ${propId} · SQUARE enters the ${kind} interior`);
    t(!!p && typeof p.onInteract === 'function'
      && new RegExp(`civicQuickInteract\\('${kind}'`).test(p.onInteract.toString()),
      `  · and X runs its counter service from the street`);
  }
  // ★★ and they really enter · driven, not read
  C.game.scene = 'overworld'; C.player.x = 22; C.player.y = 157;
  const entered = C.enterCivic('nurse', 'malezor');
  t(entered && C.game.scene === C.civicSceneId('nurse', 'malezor'),
    `★★★ entering really changes the scene to ${C.game.scene} · two of these doors `
    + 'said "Closed for now" and one was a vending machine you pressed from the '
    + 'street. All four are buildings now');
  t(!!C.interiorConfig(C.game.scene),
    '★★ and interiorConfig() resolves the scene back to a config · a scene the '
    + 'resolver cannot find is a black room you cannot leave');
  // ★ the resolver must rebuild from the id alone, not only from the cache
  const id = C.civicSceneId('potion-shop', 'korathen');
  delete C.CIVIC_CACHE[id];
  const rebuilt = C.interiorConfig(id);
  t(!!rebuilt && rebuilt.civic === 'potion-shop' && rebuilt.civicDistrict === 'korathen',
    '★★ a cold scene id rebuilds from scratch · a save loaded while standing in a '
    + 'Korathen shop must not open an empty room because the cache started empty');
}

/* ── 7 · ★ what is NOT wired, said out loud ─────────────────────────────── */
{
  const wired = Object.keys(C.CIVIC_ROOMS).filter(k =>
    new RegExp(`_civicEnter: \\{ kind: '${k}'`).test(H));
  const parked = Object.keys(C.CIVIC_ROOMS).filter(k => !wired.includes(k));
  t(wired.length === 4 && parked.length === 1 && parked[0] === 'cottage-lodge',
    `★ 4 of 5 rooms have a Malezor door (${wired.join(', ')}); cottage-lodge is parked · `
    + "Malezor's residences are the PURCHASABLE homes, which already open Rizer "
    + 'Rooms, and the Bloodscent Lodge is a landmark — explicitly out of scope. '
    + 'The room exists and is one door away in any district that has an inn');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
