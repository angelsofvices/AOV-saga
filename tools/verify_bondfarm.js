#!/usr/bin/env node
/* verify_bondfarm.js · v0.95.998
 *
 *   Creator: "implement new ways for rizer to gain bond points to be able to
 *   bond with higher tier zyrex at lower levels. must note, if the zyrex is
 *   higher rank than rizer, it may bond but it might not listen (may wander
 *   off, not help in battle, etc.) I want there to be a few ways we can farm
 *   bond level."
 *
 * ★★ TWO HALVES THAT ONLY WORK TOGETHER. The farms let you reach above your
 *   weight; obedience is what makes reaching above your weight cost something.
 *   Either alone is a worse feature: farms alone are a difficulty slider,
 *   obedience alone is a punishment with no way out.
 */
const fs = require('fs');
const path = require('path');
const HTML = fs.readFileSync(path.join(__dirname, '..', 'rp7b.html'), 'utf8');
const CODE = HTML.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);

console.log('\n=== BOND FARMS + OBEDIENCE (v0.95.998) ===\n');

/* ── 1 · the four routes exist, are priced, and are REACHABLE ───────────── */
for (const [k, pts] of [['zyrexStudy',3],['zyrexHomecoming',5],['zyrexSpar',1],['zyrexTrust',0.5]]){
  t(new RegExp(k + `:\\s*\\{[^}]*pts:\\s*${pts}\\b`).test(CODE), `${k.padEnd(16)} priced at ${pts}`);
  // ★ THE CHECK THAT MATTERS · an event nothing calls is a dead route, which is
  // the exact shape of the five dead flags elsewhere in this file
  t(new RegExp(`bumpRizerBond\\('${k}'`).test(CODE), `  · and something CALLS it`);
}

/* ── 2 · the ledger's two-path cap still holds ─────────────────────────── */
t(/BOND_PATH_CAP = RIZER_BOND_CAP \/ 2/.test(CODE),
  '★ neither path alone can max you · four new routes did not change that');
{
  // ★ study is on the RIZER path and homecoming/spar/trust on the ZYREX path,
  // so no single half gets all four
  const r = (CODE.match(/zyrexStudy:\s*\{\s*path:'(\w+)'/) || [])[1];
  const h = (CODE.match(/zyrexHomecoming:\s*\{\s*path:'(\w+)'/) || [])[1];
  t(r === 'rizer' && h === 'zyrex',
    `★★ the routes are SPLIT across both halves (study→${r}, homecoming→${h}) · ` +
    'stacking all four on one path would let that half alone reach 1665 faster ' +
    'than the design intends');
}

/* ── 3 · OBEDIENCE ─────────────────────────────────────────────────────── */
t(/function zyrexObedience/.test(CODE), 'zyrexObedience() exists');
{
  const i = CODE.indexOf('function zyrexObedience');
  const fn = CODE.slice(i, CODE.indexOf('\n}', i));
  t(/requiredBondForTier/.test(fn) && /rizerBondTotal/.test(fn),
    '★ it compares the Zyrex TIER gate against your standing');
  t(/have >= need\) return 1/.test(fn),
    '★★ a Zyrex you HAVE earned is never disobedient · obedience is about rank, ' +
    'not a random tax on everyone');
  t(/z\.bond/.test(fn),
    '★★★ and its OWN bond counts for half · a creature that loves you listens ' +
    'even when you are outranked, so the answer to disobedience is time spent ' +
    'together rather than a stat check you cannot influence');
  t(/OBEY_FLOOR/.test(fn), '  · floored · even a stranger sometimes helps');
}

/* ── 4 · the two consequences the Creator named ─────────────────────────── */
t(/zyrexObeys\(partyMember, 'looks away'\)/.test(CODE),
  "★★ \"may not help in battle\" · the summon strike rolls obedience");
t(/_sulkUntil/.test(CODE),
  '  · with a sulk window · without one the roll re-fires every frame the ' +
  'creature is adjacent and reads as a stutter, not a decision');
t(/wanders off/.test(CODE), '★★ "may wander off" · the formation station drifts');
t(/_driftOff \|\| _formationRotate/.test(CODE),
  '★★★ and the drift is an OFFSET fed through the existing walkable nudge, not ' +
  'a bypass of it · otherwise "wanders off" becomes "stands inside a tree"');

/* ── 5 · ★★ disobedience PAYS · the loop closes ─────────────────────────── */
{
  const i = CODE.indexOf('function zyrexObeys');
  const fn = CODE.slice(i, CODE.indexOf('\n}', i) + 200);
  t(/bumpRizerBond\('zyrexTrust'\)/.test(fn),
    '★★★ every obeyed order from an over-ranked Zyrex pays TRUST · fielding a ' +
    'creature you have not earned is how you earn it, so the punishment is ' +
    'also the cure');
  t(/showToast/.test(fn) && /requiredBondForTier/.test(fn),
    '★★ and a refusal NAMES the number that fixes it · an unexplained refusal ' +
    'reads as the game dropping your input');
}

/* ── 6 · the farms are called, and gated ────────────────────────────────── */
t(/tickFieldStudy\(\); \} catch/.test(CODE) && /tickHomecoming\(\); \} catch/.test(CODE),
  '★ both tickers run in the frame loop');
{
  const i = CODE.indexOf('function tickFieldStudy');
  const fn = CODE.slice(i, CODE.indexOf('\n}\n', i));
  t(/attackUntil/.test(fn),
    '★★★ ATTACKING CANCELS A FIELD STUDY · the one bond route you can farm on ' +
    'purpose is the one that requires you not to fight');
  t(/seen\[/.test(fn), '  · once per species · it writes the Athrenology index');
}
t(/SPAR_COOLDOWN_MS/.test(CODE),
  '★★ sparring has a cooldown · a farm you can stand at forever is a printer, ' +
  'and a printer devalues the three routes that cost real effort');
t(/homecomings:\s*Object\.assign/.test(CODE),
  '★ homecomings PERSIST · once-per-species that forgets on reload is an exploit');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
