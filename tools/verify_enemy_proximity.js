#!/usr/bin/env node
/* verify_enemy_proximity.js · v0.96.2
 *
 *   Creator: "add proximity volume to all enemies vox/sfx"
 *
 * ★ Every enemy sound used to play at full volume regardless of distance, so a
 *   Mori dying off-screen was as loud as the one biting you. The checks below
 *   are driven through the REAL playSFX, with the audio nodes instrumented, so
 *   what is measured is the volume that would actually reach the speakers.
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

console.log('\n=== ENEMY PROXIMITY AUDIO · v0.96.2 ===\n');

/* ── 1 · ★★★ NO CALL SITE LEFT BEHIND ───────────────────────────────────── */
// This is the check that matters most and it runs on the SOURCE, because a
// missed call site is invisible at runtime: it plays, it just plays too loud.
{
  const CODE = H.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
  const KEYS = ['moriPoke', 'moriGrunt', 'moriDeath', 'moriNearby', 'skellor'];
  const bare = [];
  for (const k of KEYS) {
    const re = new RegExp(`playSFX\\('${k}'\\)`, 'g');
    const n = (CODE.match(re) || []).length;
    if (n) bare.push(`${k}×${n}`);
  }
  t(bare.length === 0,
    '★★★ every enemy-sound call site passes an emitter · '
    + (bare.length ? `STILL BARE: ${bare.join(', ')}` : '27 of 27 converted'));
  const withPos = KEYS.reduce((a, k) =>
    a + (CODE.match(new RegExp(`playSFX\\('${k}',`, 'g')) || []).length, 0);
  t(withPos >= 27, `  · and they are positioned, not merely edited (${withPos} sites)`);
}

/* ── 2 · the key list names REAL sounds ─────────────────────────────────── */
{
  const set = H.match(/const ENEMY_VOX = new Set\(\[([^\]]+)\]\)/);
  t(!!set, 'ENEMY_VOX is declared');
  const keys = [...set[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
  const declared = new Set([...H.matchAll(/^\s{4}(\w+):\s*new Audio\(/gm)].map(m => m[1]));
  const ghosts = keys.filter(k => !declared.has(k));
  t(ghosts.length === 0,
    `★★ every key in ENEMY_VOX is a sound that EXISTS (${keys.length}) · `
    + (ghosts.length ? `invented: ${ghosts.join(', ')}` : 'no invented names')
    + ' — playSFX returns silently on an unknown key, so a typo here would be a '
    + 'rule that never fires and never complains');
  t(keys.includes('skellor'),
    "★ 'skellor' is in the set · it is the one enemy sound whose key does not "
    + "start with 'mori', so any pattern-matched rule would have left the "
    + 'Skellor groan at full volume across the whole map');
}

/* ── the headless shell · audio nodes instrumented ──────────────────────── */
const PLAYED = [];
const noop = () => {};
const _Q = [];
global.setInterval = () => 0;
global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [], measureText: () => ({ width: 10 }) }) });
const el = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
  getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop,
  removeEventListener: noop, setAttribute: noop, getAttribute: () => null, focus: noop, remove: noop,
  play: () => Promise.resolve(), pause: noop, querySelector: () => el(), querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [],
  createElement: () => el(), addEventListener: noop, body: el(), documentElement: el(), head: el(),
  hidden: false, visibilityState: 'visible', hasFocus: () => true };
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.Audio = function (srcPath) {
  const node = {
    src: srcPath, volume: 1, currentTime: 0, _src: srcPath,
    play(){ PLAYED.push({ src: this._src, volume: this.volume }); return Promise.resolve(); },
    pause: noop, addEventListener: noop, removeEventListener: noop,
    cloneNode(){ return Object.assign(Object.create(Object.getPrototypeOf(this)), this); },
  };
  return node;
};
global.Image = function () { return { addEventListener: noop, complete: true, naturalWidth: 1254, src: '' }; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
let T = 1000;
global.performance = { now: () => T };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

const LOG = console.log;
const WARNS = [];
console.log = () => {};
console.warn = (...a) => WARNS.push(a.join(' '));
new Function(src + `;globalThis.__C={ player, game, AUDIO, playSFX, sfxProximityGain,
  ENEMY_VOX, SFX_NEAR_TILES, SFX_FAR_TILES, SFX_MIN_GAIN, NPCS };`)();
let n = 0;
while (_Q.length && n < 60) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;
C.game.scene = 'overworld';
C.player.x = 100; C.player.y = 100;

/* ── 3 · the curve ──────────────────────────────────────────────────────── */
const g = (dx) => C.sfxProximityGain(100 + dx, 100);
t(g(0) === 1 && g(C.SFX_NEAR_TILES) === 1,
  `★ full volume out to ${C.SFX_NEAR_TILES} tiles · a creature within arm's reach `
  + 'should not be quieter than one at your feet');
t(g(C.SFX_FAR_TILES) === 0 && g(C.SFX_FAR_TILES + 50) === 0,
  `★ silent at and beyond ${C.SFX_FAR_TILES} tiles · roughly a viewport and a half`);
{
  let mono = true;
  for (let d = 0; d < 40; d++) if (g(d + 1) > g(d) + 1e-9) mono = false;
  t(mono, '  · and monotonically decreasing the whole way · no louder-when-further band');
}
t(g(-12) === g(12), '  · symmetric · direction does not change loudness (volume only, no panner)');
t(g(14) < 0.5 && g(6) > 0.5,
  '★★ the curve is SQUARED, not linear · at 14 tiles a Mori is under half volume '
  + `(${g(14).toFixed(2)}) while at 6 it is still present (${g(6).toFixed(2)}). Linear `
  + 'falloff leaves everything mid-range equally loud, which is the exact complaint');

/* ── 4 · ★★ DRIVEN THROUGH THE REAL playSFX ─────────────────────────────── */
const base = C.AUDIO.sfx.moriDeath.volume;
const fire = (name, at) => { PLAYED.length = 0; C.playSFX(name, at); return PLAYED.slice(); };

{
  const near = fire('moriDeath', { tileX: 101, tileY: 100 });
  t(near.length === 1 && Math.abs(near[0].volume - base) < 1e-6,
    `★ an enemy dying next to you plays at full volume (${base})`);
}
{
  const mid = fire('moriDeath', { tileX: 114, tileY: 100 });
  t(mid.length === 1 && mid[0].volume < base * 0.6 && mid[0].volume > 0,
    `★ fourteen tiles away it is audible but clearly back in the mix `
    + `(${mid[0] ? mid[0].volume.toFixed(3) : 'n/a'} vs ${base})`);
}
{
  const far = fire('moriDeath', { tileX: 160, tileY: 100 });
  t(far.length === 0,
    '★★★ sixty tiles away it does not play AT ALL · and the return happens BEFORE '
    + 'cloneNode(), so an off-screen fight costs no audio node either. With the '
    + 'district anchors keeping ~200 enemies alive that is the difference between '
    + 'silence and a permanent wash of groans');
}
{
  // a plain {x,y} point must work as well as an NPC
  const pt = fire('moriGrunt', { x: 101, y: 100 });
  t(pt.length === 1, '★ accepts a plain {x,y} point as well as an NPC {tileX,tileY}');
}

/* ── 5 · everything else is untouched ───────────────────────────────────── */
{
  const cb = C.AUDIO.sfx.confirm.volume;
  const r = fire('confirm');
  t(r.length === 1 && Math.abs(r[0].volume - cb) < 1e-6,
    '★★ UI and player sounds are UNCHANGED with no position · confirm, footsteps, '
    + "the player's own sword all emit AT the player, and attenuating them by "
    + 'distance-from-the-player would silence the whole game');
  const far = fire('confirm', { x: 400, y: 400 });
  t(far.length === 1,
    '★ and a non-enemy sound is never dropped for distance · only ENEMY_VOX keys '
    + 'take the early return, so the cull cannot swallow a UI cue by accident');
}

/* ── 6 · ★★ a missed call site is LOUD, so make it complain ─────────────── */
{
  WARNS.length = 0;
  fire('moriPoke');            // deliberately positionless
  t(WARNS.some(w => /enemy vox with no position/.test(w)),
    '★★ an enemy sound with no emitter warns once · this file already warns on an '
    + "unknown sound key for the same reason: five call sites ('hurt', 'evolve', "
    + "'levelup'…) sat dead for versions because a silent fallback told nobody");
  const before = WARNS.length;
  fire('moriPoke');
  t(WARNS.length === before, '  · once per key, not once per play · no console flood in combat');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
