#!/usr/bin/env node
/* verify_opening.js · v0.96.13 · THE MALEZOR TUTORIAL, IN ORDER
 *
 *   Creator: "can we clean up the order of the opening events? they should all
 *   fit inside the malezor tutorial side of things with kelthor and dad guiding
 *   you before zarvane. make it flow. no level caps. just progression. sanity
 *   check too."
 *
 * ★ A quest chain is prose until something checks it against the world. Every
 *   claim below is measured against real flags, real NPCs and real gates.
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

console.log('\n=== THE OPENING · v0.96.13 ===\n');

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
global.Image = function () { return { addEventListener: noop, complete: true, naturalWidth: 313, naturalHeight: 313, src: '' }; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
global.performance = { now: () => 1000 };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
const LOG = console.log;
console.log = () => {}; console.warn = noop; console.error = noop;
new Function(src + `;globalThis.__C={ player, game, NPCS, WORLD_PROPS, MAIN_QUESTS,
  DISTRICT_ORDER, districtRoadOpen, districtCleared, districtGateReason,
  towerRestored, seerCommanderBeaten, findNpcById, TOWER_ORDER };`)();
let n = 0; while (_Q.length && n < 80) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;
const Q = C.MAIN_QUESTS;

/* ── 1 · ★★★ MALEZOR HOLDS THE TUTORIAL ─────────────────────────────────── */
{
  const towns = Q.map(c => c.town);
  const mal = towns.filter(x => x === 'MALEZOR').length;
  t(mal === 4,
    `★★★ FOUR chapters happen in Malezor before you leave (${towns.join(' → ')}) · the old `
    + 'chain had two, and its third chapter was LABELLED ZARVANE while its first '
    + 'three steps were Malezor content — the journal told you to leave for a '
    + 'district you had not finished');
  const firstNonMal = towns.findIndex(x => x !== 'MALEZOR');
  t(towns.slice(0, firstNonMal).every(x => x === 'MALEZOR')
    && towns.slice(firstNonMal).every(x => x !== 'MALEZOR'),
    '★★ and Malezor is CONTIGUOUS · the tutorial is not interleaved with travel, '
    + 'so "finish home first" is legible from the journal alone');
  t(towns[firstNonMal] === 'ZARVANE',
    '★ the first district you are sent to is Zarvane · matching DISTRICT_ORDER');
  t(C.DISTRICT_ORDER[0] === 'malezor' && C.DISTRICT_ORDER[1] === 'zarvane',
    `  · which is what the world itself says (${C.DISTRICT_ORDER.slice(0,3).join(' → ')})`);
}

/* ── 2 · ★★ DAD AND KELTHOR ARE THE TEACHERS ────────────────────────────── */
{
  const malSteps = Q.filter(c => c.town === 'MALEZOR').flatMap(c => c.steps).join(' | ');
  t(/Dad/.test(malSteps) && /KELTHOR|Kelthor/.test(malSteps),
    '★★ both teachers appear in the Malezor chapters · "with kelthor and dad '
    + 'guiding you". The old chain named Kelthor ZERO times in the entire game');
  const dadN = (malSteps.match(/Dad/g) || []).length;
  const kelN = (malSteps.match(/Kelthor/gi) || []).length;
  t(dadN >= 2 && kelN >= 2,
    `★ and each guides more than once (Dad ×${dadN}, Kelthor ×${kelN}) · one `
    + 'mention is a cameo, not a mentor');
  // ★ they are real NPCs, not names in prose
  for (const id of ['dad', 'mom', 'kelthor', 'scrapjaw', 'professor_elarian', 'omniris'])
    t(!!C.NPCS.find(n => n && n.id === id), `  · ${id} exists in the world`);
}

/* ── 3 · ★★★ THE ORDER IS DEPENDENCY, NOT TASTE ─────────────────────────── */
{
  const flat = Q.flatMap(c => c.steps.map(s2 => `${c.town}: ${s2}`));
  const idx = (re) => flat.findIndex(s2 => re.test(s2));
  const backpack = idx(/Backpack/), notebook = idx(/Notebook to Dad/);
  const starter = idx(/Choose your starter/), spheres = idx(/Buy more Zyspheres/);
  const bond1 = idx(/Bond your first wild/);
  const tower = idx(/battery/), seer = idx(/SEER COMMANDER/);
  const road = idx(/road east opens/), cross = idx(/Cross the sand transition/);
  const omni = idx(/Find OMNIRIS/), sight = idx(/Earn the SIGHT/);

  t(backpack >= 0 && backpack < notebook,
    '★ the Backpack comes before the errand · it gates the ZyCube, so an errand '
    + 'first would hand you a notebook you cannot carry');
  t(starter < spheres,
    '★★★ the starter comes before the SPHERE SHOP · the shop is genuinely shut '
    + 'until you have a partner ("Spheres are for Rizers with something to put in '
    + 'them"), so listing it earlier would be sending the player at a locked door');
  t(starter < bond1,
    '★★ and before your first wild bond · the tier gate opens at 333 bond, which '
    + 'the starter grant is what pays');
  t(tower < seer,
    '★ the tower before the Seer HQ · contact calls are how Kelthor reaches you');
  t(seer < road && road < cross,
    '★★★ the COMMANDER comes before the road, and the road before the crossing · '
    + 'that is not narrative preference, it is districtRoadOpen(): the soft gate '
    + 'will refuse Zarvane until the commander falls');
  t(cross < omni && omni < sight,
    '★ and Omniris is found before his trials are finished');
}

/* ── 4 · ★★★ THE GATE THE CHAIN CLAIMS IS THE GATE THAT EXISTS ──────────── */
{
  C.player.seerCommandersBeaten = {};
  C.player.towerBossKills = {};
  t(C.districtRoadOpen('malezor') === true,
    '★ Malezor is always open · you start there');
  t(C.districtRoadOpen('zarvane') === false,
    '★★★ Zarvane is CLOSED to a fresh save · the journal sends you there at '
    + 'chapter five and the world agrees. A chapter list that promises a road the '
    + 'code refuses is worse than no chapter list');
  C.player.seerCommandersBeaten.malezor = true;
  t(C.districtRoadOpen('zarvane') === true,
    '★★★ and beating the MALEZOR commander opens it · exactly the step chapter 4 '
    + 'ends on. The journal and the gate are the same fact stated twice');
  t(typeof C.districtGateReason === 'function' && !!C.districtGateReason('andrannor'),
    '  · and a closed road can say why');
}

/* ── 5 · ★★★ NO LEVEL CAPS ──────────────────────────────────────────────── */
{
  //   Creator: "no level caps. just progression."
  const CODE = H.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
  const gates = (CODE.match(/if \(gate\(\d+\)\)/g) || []);
  t(gates.length === 0,
    `★★★ Omniris no longer gates on Rizer LEVEL (${gates.length} numeric gates left) · his `
    + 'eight trials demanded Lv 15/18/22/26/32/38/46/55, which is not progression '
    + 'but a WAITING ROOM: go away, grind numbers elsewhere, come back to the same '
    + 'conversation. Worse, it made an ELDER\'S TEACHING gate on a stat rather than '
    + 'on anything he had taught');
  t((CODE.match(/if \(gate\(\)\)/g) || []).length === 8,
    '  · all eight branches keep their shape · a future condition has an obvious home');
  // ★★ and nothing ELSE in the game blocks progress on a level number
  const lvlGates = [...CODE.matchAll(/\(player\.rizerLvl \|\| 1\)\s*([<>]=?)\s*(\d+)/g)]
    .filter(m => !(m[1] === '>' && m[2] === '1'));   // the bond-ledger migration
  t(lvlGates.length === 0,
    `★★ and no other progression check compares Rizer level to a number`
    + (lvlGates.length ? ` · FOUND: ${lvlGates.map(m => m[0]).join(', ')}` : ''));
}

/* ── 6 · ★ sanity · the chain is well-formed ────────────────────────────── */
{
  t(Q.every(c => c.town && c.title && Array.isArray(c.steps) && c.steps.length),
    'every chapter has a town, a title and steps');
  const titles = Q.map(c => c.title);
  t(new Set(titles).size === titles.length, '  · no duplicate chapter titles');
  const nums = titles.map(x => +((x.match(/Chapter (\d+)/) || [])[1] || 0));
  t(nums.every((v, i) => v === i + 1),
    `★ chapters are numbered 1..${nums.length} with no gaps or repeats (${nums.join(',')}) · `
    + 'the old list numbered 1-4 and the journal renders the number, so a skip '
    + 'reads to the player as content they missed');
  t(Q.every(c => c.steps.every(s2 => typeof s2 === 'string' && s2.length > 8)),
    '  · and no empty or stub steps');
  t(C.player.mainQuestStep >= 0 && C.player.mainQuestStep < Q.length,
    `★ the saved progress pointer is inside the new chain (${C.player.mainQuestStep}/${Q.length}) · `
    + 'lengthening a quest list is safe, but a pointer past the end renders nothing');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
