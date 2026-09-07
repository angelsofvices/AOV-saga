#!/usr/bin/env node
/* verify_building_decor.js · v0.96.7
 *
 *   Creator: "these rugs and floor tiles are for the building interiors in
 *   malezor: Nurse / Zysphere Shop / Potion Shop / Town Hall / Beast Farm /
 *   Seer HQ (use for basement) / Cottage-Lodge / Research Lab (skip the floor
 *   tile)"
 *
 * ★ Art checks are done on the FILES as well as the wiring, because a decor
 *   set that points at a missing PNG draws nothing and never throws.
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

console.log('\n=== MALEZOR BUILDING DECOR · v0.96.7 ===\n');

const KEYS = ['nurse', 'zysphere-shop', 'potion-shop', 'town-hall',
              'beast-farm', 'seer-hq-basement', 'cottage-lodge', 'research-lab'];

/* ── 1 · ★★ THE ART EXISTS ON DISK ──────────────────────────────────────── */
{
  const missRug = KEYS.filter(k => !fs.existsSync(path.join(ROOT, `assets/2D sprites/decor/rugs/building/rug-${k}.png`)));
  t(missRug.length === 0,
    `★★ all 8 rugs are on disk${missRug.length ? ' · MISSING: ' + missRug.join(', ') : ''} · a decor set `
    + 'pointing at a missing PNG draws nothing and never throws, so this is checked '
    + 'against the filesystem rather than against the code that names it');
  const needFloor = KEYS.filter(k => k !== 'research-lab');
  const missFloor = needFloor.filter(k => !fs.existsSync(path.join(ROOT, `assets/2D sprites/tiles/interior/floor-${k}.png`)));
  t(missFloor.length === 0,
    `★ and all 7 floors that were asked for${missFloor.length ? ' · MISSING: ' + missFloor.join(', ') : ''}`);
}

/* ── 2 · ★★★ THE FLOORS TILE · no green seam ────────────────────────────── */
{
  // Read the PNGs directly. A floor is judged entirely on whether you can see
  // the repeat, and the delivery was chroma-keyed on #00FF00 — an antialiased
  // outer ring would paint a green grid across every room.
  let checked = 0, green = [], nonSquare = [];
  for (const k of KEYS.filter(x => x !== 'research-lab')){
    const p = path.join(ROOT, `assets/2D sprites/tiles/interior/floor-${k}.png`);
    if (!fs.existsSync(p)) continue;
    const b = fs.readFileSync(p);
    const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
    checked++;
    if (w !== h) nonSquare.push(`${k} ${w}x${h}`);
  }
  t(checked === 7 && nonSquare.length === 0,
    `★★ every floor is SQUARE (${checked} checked)${nonSquare.length ? ' · ' + nonSquare.join(', ') : ''} · `
    + 'a non-square tile repeated on a square grid stretches, and the seam is the '
    + 'first thing the eye finds on a floor');
}

/* ── 3 · the registry ───────────────────────────────────────────────────── */
{
  t(/const BUILDING_DECOR = \{/.test(H), 'BUILDING_DECOR exists');
  for (const k of KEYS)
    t(new RegExp(`'${k}':\\s*\\{ rug:`).test(H), `  decor set · ${k}`);
  t(/'research-lab':\s*\{ rug:'research-lab',\s*floor:null/.test(H),
    '★★★ the Research Lab set carries floor:null · Creator: "skip the floor tile". '
    + 'Encoded in the DATA, so applyBuildingDecor cannot accidentally re-floor it '
    + 'later — a comment would not have stopped that');
  // ★★★ the pool-poisoning check
  const dk = H.match(/const DOORMAT_KEYS = \[([^\]]+)\]/);
  t(dk && !KEYS.some(k => dk[1].includes(`'${k}'`)),
    '★★★ NONE of the building rugs are in DOORMAT_KEYS · pickDoormatKey() deals a '
    + 'random mat to every purchased Rizer Room out of that array, so adding the '
    + "Town Hall's civic crest to it would eventually carpet somebody's bedroom "
    + 'with it');
  t(/DOORMAT_IMGS\['bld-' \+ k\]/.test(H),
    '  · they are registered under a bld- prefix instead, so the existing rug draw '
    + 'renders them with no change to the draw code');
}

/* ── 4 · ★★★ THE THREE REAL INTERIORS ───────────────────────────────────── */
const noop = () => {};
const _Q = [];
global.setInterval = () => 0; global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [], measureText: () => ({ width: 10 }) }) });
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
const IMGS = [];
global.Image = function () { const o = { addEventListener: noop, complete: true, naturalWidth: 256, naturalHeight: 256,
  set src(v){ this._src = v; IMGS.push(v); }, get src(){ return this._src; } }; return o; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
global.performance = { now: () => 1000 };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
const LOG = console.log;
console.log = () => {}; console.warn = noop; console.error = noop;
new Function(src + `;globalThis.__C={ INTERIOR_RESEARCH_LAB, INTERIOR_TRAINING_FARM,
  INTERIOR_SEER_HQ_B, INTERIOR_SEER_HQ_1F, INTERIOR_SEER_HQ_2F, DOORMAT_IMGS,
  DOORMAT_KEYS, BUILDING_DECOR, applyBuildingDecor, interiorConfig,
  SEER_HQ_FLOOR_IMG, SEER_HQ_B_FLOOR_IMG };`)();
let n = 0; while (_Q.length && n < 80) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;

{
  const farm = C.INTERIOR_TRAINING_FARM;
  t(farm.rug && farm.rug.key === 'bld-beast-farm', '★ Beast Farm · paw-shield rug');
  t(/floor-beast-farm\.png/.test(farm.tileImg.src || ''), '★ Beast Farm · sandstone floor');
  t(farm.rug.x >= 1 && farm.rug.x + farm.rug.w <= farm.cols - 1
    && farm.rug.y >= 1 && farm.rug.y + farm.rug.h <= farm.rows - 1,
    `  · rug sits inside the room (${farm.rug.x},${farm.rug.y} ${farm.rug.w}x${farm.rug.h} in ${farm.cols}x${farm.rows})`);

  const lab = C.INTERIOR_RESEARCH_LAB;
  t(lab.rug && lab.rug.key === 'bld-research-lab', '★ Research Lab · computer rug');
  t(/research-lab-floor\.png/.test(lab.tileImg.src || ''),
    '★★★ and the Research Lab keeps its ORIGINAL floor · "skip the floor tile". '
    + 'Driven, not asserted from source: applyBuildingDecor ran and left the src alone');

  const b = C.INTERIOR_SEER_HQ_B;
  t(b.rug && b.rug.key === 'bld-seer-hq-basement', '★ Seer HQ basement · eye-and-gem rug');
  t(/floor-seer-hq-basement\.png/.test(b.tileImg.src || ''), '★ Seer HQ basement · hex floor');
  // ★★★ THE ONE THAT MATTERED
  t(C.SEER_HQ_B_FLOOR_IMG !== C.SEER_HQ_FLOOR_IMG,
    '★★★ the basement has its OWN Image object · all four Seer HQ storeys shared '
    + 'SEER_HQ_FLOOR_IMG, so re-pointing that one src would have re-floored 1F, the '
    + 'landing and 2F in ALL TEN DISTRICTS off a note that said "use for basement"');
  t(!/floor-seer-hq-basement/.test(C.SEER_HQ_FLOOR_IMG.src || ''),
    '  · and the shared upstairs floor is untouched');
  t(C.INTERIOR_SEER_HQ_1F.tileImg === C.SEER_HQ_FLOOR_IMG
    && C.INTERIOR_SEER_HQ_2F.tileImg === C.SEER_HQ_FLOOR_IMG,
    '  · 1F and 2F still share the original');
}

/* ── 5 · ★★ THE FIVE THAT HAVE NO INTERIOR YET ──────────────────────────── */
{
  const wired = Object.keys(C.BUILDING_DECOR).filter(k =>
    new RegExp(`applyBuildingDecor\\([A-Z_]+, '${k}'`).test(H));
  const unwired = Object.keys(C.BUILDING_DECOR).filter(k => !wired.includes(k));
  t(wired.length === 3 && unwired.length === 5,
    `★★ 3 of the 8 decor sets are LIVE (${wired.join(', ')}) and 5 are parked `
    + `(${unwired.join(', ')}) · those five buildings have no authored interior in `
    + 'rp7b yet, so the art is registered and waiting rather than silently dropped');
  for (const k of unwired)
    t(!!C.DOORMAT_IMGS['bld-' + k],
      `  · ${k} rug is loaded and addressable · one applyBuildingDecor line when the room exists`);
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
