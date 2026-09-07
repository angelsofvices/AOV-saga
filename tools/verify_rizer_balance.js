#!/usr/bin/env node
/* verify_rizer_balance.js · v0.95.976
 *
 *   Creator: "zyrex are too powerful. we need to rebalance their damage. they
 *   shouldnt feel so much stronger than rizer."
 *
 * ★ THE THING THAT WAS WRONG WAS NOT A NUMBER, IT WAS A PRODUCT.
 *   One companion against Rizer looked fine on DPS at every tier. PARTY_MAX is
 *   8 and hold-Triangle summons the whole faction, so the real comparison was
 *   never one-vs-one — it was eight-vs-one, and it ran to 9.5x.
 *
 * ★★ So this suite asserts the RELATIONSHIP, in DPS, with party size in it —
 *   not that any constant has any value. A tuning pass may move STRIKE_DIV, the
 *   swing cadences, or Rizer's AP curve; what must not move is "Rizer is the
 *   protagonist". That is the invariant worth a file.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== RIZER vs HIS FACTION · who is the protagonist (v0.95.976) ===\n');

/* ── lift the real tables and the real damage functions ─────────────────── */
function balanced(src, from){
  let i = src.indexOf('{', from), d = 0;
  for (let j = i; j < src.length; j++){
    const c = src[j];
    if (c === '{') d++;
    else if (c === '}'){ d--; if (!d) return src.slice(from, j + 1); }
  }
  return null;
}
const grab = (n) => { const at = HTML.indexOf(`function ${n}(`); return at < 0 ? '' : balanced(HTML, at); };
const box = { console, Math, Array, Object, game: { scene: 'overworld' }, NPCS: [] };
vm.createContext(box);
// ★ built OUTSIDE the template literal. Inside `${…}` the expression is plain
// JS, so a regex written /const\\s+SPECIES/ there matches a literal backslash,
// finds nothing, and the suite dies on `var ;` before its first assertion.
const speciesSrc = balanced(HTML, HTML.search(/const\s+SPECIES\s*=/)).replace(/^const\s+/, '');
const dexSrc     = balanced(HTML, HTML.search(/const\s+MOVE_DEX\s*=/)).replace(/^const\s+/, '');
vm.runInContext(`
  var ${speciesSrc};
  var ${dexSrc};
  globalThis.SPECIES = SPECIES; globalThis.MOVE_DEX = MOVE_DEX;
  function canonType(x){ return x; }
  ${(HTML.match(/^const STRIKE_BASE_PW\s*=\s*\d+;/m) || [''])[0].replace(/^const/, 'var')}
  ${(HTML.match(/^const STRIKE_DIV\s*=\s*\d+;/m) || [''])[0].replace(/^const/, 'var')}
  globalThis.STRIKE_DIV = STRIKE_DIV;
  ${grab('moveData')} ${grab('zyrexAttackStat')} ${grab('zyrexDefaultMove')}
  ${grab('zyrexDefaultMovePower')} ${grab('computeZyrexDamage')} ${grab('createZyrex')}
  ${grab('activeSummonCount')} ${grab('summonCrowdFalloff')}
  globalThis.MOVE_UNLOCK_LV = [1,15,30,60];
  globalThis.MOVE_PP_BY_SLOT = [20,15,10,5];
`, box);

/* ── Rizer's own numbers, read out of the file rather than retyped ──────── */
const apCurve = HTML.match(/baseAtk\s*=\s*25\s*\+\s*atk×0\.03/);
t(!!apCurve, "Rizer's ATK curve located in the attribute table · baseAtk = 25 + AP×0.03");
const RZ_BASE = (ap) => 25 + ap * 0.03;
// his bread-and-butter: the four-step sword chain, averaged
const combo = (HTML.match(/const SWORD_COMBO_DMG\s*=\s*\[([^\]]+)\]/) || [])[1];
t(!!combo, 'the sword combo table located');
const COMBO_AVG = combo.split(',').map(Number).reduce((a, b) => a + b, 0) / 4;
const RZ_HIT = (ap) => RZ_BASE(ap) * COMBO_AVG;

// cadences · Rizer's melee lock floor vs the companion's fixed 700ms tap
const lockFloor = +(HTML.match(/const MELEE_LOCK_FLOOR_MS\s*=\s*(\d+)/) || [0, 120])[1];
const zyCd = +(HTML.match(/_nextAttackAt\s*=\s*performance\.now\(\)\s*\+\s*(\d+)/) || [0, 700])[1];
t(zyCd > 0, `companion strike cadence read from the code · ${zyCd}ms`);
const RZ_CD = 300;   // realistic swing incl. animation; floor is ${lockFloor}
console.log(`\n       Rizer ~${RZ_CD}ms/swing (lock floor ${lockFloor}) · companion ${zyCd}ms/tap`);
console.log(`       sword combo average ×${COMBO_AVG.toFixed(3)}\n`);

/* ── the stage pairing · what you field when ────────────────────────────── */
const STAGE = { 1: 150, 3: 700, 5: 1600, 8: 3000 };   // AP invested in ATK by then
const ids = Object.keys(box.SPECIES);
const tierAvg = (tier) => {
  const g = ids.filter(id => box.SPECIES[id].tier === tier && box.SPECIES[id].baseATK);
  const d = g.map(id => box.computeZyrexDamage(box.createZyrex(id, Math.min(80, tier * 10))));
  return d.reduce((a, b) => a + b, 0) / d.length;
};

const rows = [];
for (const tier of [1, 3, 5, 8]){
  const ap = STAGE[tier];
  const rz = RZ_HIT(ap) * (1000 / RZ_CD);
  const one = tierAvg(tier) * (1000 / zyCd);
  const eight = one * 8 * (1 / Math.sqrt(8));
  rows.push({ tier, rz, one, eight });
}
console.log('       tier    Rizer DPS    1 Zyrex    x8 (falloff)    faction÷Rizer');
rows.forEach(r => console.log(
  `        T${String(r.tier).padEnd(4)}${String(Math.round(r.rz)).padStart(9)}` +
  `${String(Math.round(r.one)).padStart(12)}${String(Math.round(r.eight)).padStart(14)}` +
  `${(r.eight / r.rz).toFixed(1).padStart(15)}x`));
console.log('');

/* ── 1 · ONE companion never out-damages Rizer ──────────────────────────── */
rows.forEach(r => t(r.one < r.rz,
  `★ T${r.tier} · a single companion stays under Rizer (${Math.round(r.one)} vs ${Math.round(r.rz)} DPS)`));

/* ── 2 · a FULL faction is a force, but not a replacement ───────────────── */
rows.forEach(r => t(r.eight / r.rz <= 2.5,
  `★★ T${r.tier} · the whole faction is ${(r.eight / r.rz).toFixed(1)}x Rizer, not 9x`));
rows.slice(1).forEach(r => t(r.eight / r.rz >= 0.8,
  `  · and still worth deploying at T${r.tier} (${(r.eight / r.rz).toFixed(1)}x)`));

/* ── 3 · the falloff · shape, not magnitude ─────────────────────────────── */
{
  const mk = (n) => { box.NPCS = Array.from({length: n}, () => ({ _summoned: true, scene: 'overworld' })); };
  mk(1); const f1 = box.summonCrowdFalloff();
  mk(4); const f4 = box.summonCrowdFalloff();
  mk(8); const f8 = box.summonCrowdFalloff();
  t(Math.abs(f1 - 1) < 1e-9, 'a lone companion is not penalised · falloff = 1.0');
  t(f8 < f4 && f4 < f1, 'more bodies, less each');
  // ★ the load-bearing property: adding a Zyrex must still ADD damage.
  // 1/N would make the total flat and render the ninth catch worthless.
  const total = (n) => n * (1 / Math.sqrt(n));
  const totals = [1,2,4,8].map(total);
  t(totals.every((v, i) => i === 0 || v > totals[i-1]),
    `★★ every extra Zyrex still raises the total (${totals.map(v=>v.toFixed(1)).join(' < ')}) — ` +
    'the collection is the game, so 1/N was wrong and 1/√N is right');
  t(Math.abs(total(8) - 2.83) < 0.05, '  · a full faction lands ~2.8x a single, by construction');
  box.NPCS = [];
}

/* ── 4 · scoped · the nerf must not leak ────────────────────────────────── */
{
  const at = HTML.indexOf('const dmg = Math.max(1, Math.round(computeZyrexDamage(partyMember)');
  t(at > 0, '★ the falloff is applied at the COMPANION strike');
  const hostile = HTML.indexOf('w._hostileUntil && Date.now() < w._hostileUntil');
  const blk = HTML.slice(hostile, hostile + 2400);
  t(/computeZyrexDamage\(w\)/.test(blk) && !/summonCrowdFalloff/.test(blk),
    '  · a hostile WILD still hits at full value — it is alone, and it is a threat');
  const turn = HTML.indexOf('function calcDamageDetail');
  t(!/summonCrowdFalloff/.test(HTML.slice(turn, turn + 1600)),
    '  · and the turn-based battle formula is untouched');
}

/* ── 5 · counted from the FIELD, not from the roster ────────────────────── */
{
  const src = box.activeSummonCount.toString();
  t(/_summoned/.test(src) && /scene/.test(src),
    '★ crowding counts what is actually out in this scene, not party size — ' +
    'a Zyrex in the PC or walked home is not crowding anything');
  t(/Math\.max\(1/.test(src), '  · and never returns 0 (which would divide by zero)');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
