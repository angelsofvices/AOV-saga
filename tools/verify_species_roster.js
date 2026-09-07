#!/usr/bin/env node
/* verify_species_roster.js · v0.95.986
 *
 *   Creator: "make sure all new species are in."
 *
 * ★★★ THIS SUITE EXISTS BECAUSE OF A MISTAKE I MADE AN HOUR BEFORE WRITING IT.
 *   I wrote Veridrax as a brand-new species — twice in one sitting, once at T2
 *   Draconic/Nature and once at T4, each with a confident paragraph of
 *   reasoning — while data/STAPLE_ROSTER_V1_LOCKED.md had carried
 *   "Veridrax · Beast/Crystal ⬇ T2→T1" the whole time. Somebody had already
 *   considered T2 for that creature and ruled against it.
 *
 * ★★ The roster is not a list of names to check against. It is a RECORD OF
 *   RULINGS ALREADY MADE, and a demotion arrow is a decision someone took
 *   deliberately. Nothing in the codebase enforced it, so the only thing
 *   standing between a locked ruling and my improvisation was whether I
 *   happened to grep first. Now something enforces it.
 *
 * Three checks, in the order they matter:
 *   1 · every SPECIES entry agrees with the locked roster on TIER and TYPES
 *   2 · every species is in ATHRENOLOGY_INDEX exactly once (the Zyredex is
 *       built from the index, not from SPECIES — and duplicate object keys
 *       resolve silently, last-one-wins)
 *   3 · every species the Creator asked for is pinned in the districts he
 *       named, AND IN NO OTHERS
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0, warn = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const wr = (m) => { warn++; console.log('  warn · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== SPECIES vs THE LOCKED ROSTER (v0.95.986) ===\n');

/* ── the locked roster, as data ─────────────────────────────────────────── */
const ROSTER = {};
for (const r of JSON.parse(fs.readFileSync(path.join(ROOT, 'data/staple_roster_v1.json'), 'utf8')).species)
  ROSTER[r.name.toLowerCase()] = r;
t(Object.keys(ROSTER).length > 150, `${Object.keys(ROSTER).length} species in the locked roster`);

/* ── what the game actually declares ────────────────────────────────────── */
const SPECIES = {};
{
  const at = HTML.search(/const\s+SPECIES\s*=/);
  const blk = HTML.slice(at, HTML.indexOf('\n};', at));
  for (const m of blk.matchAll(
      /(\w+):\s*\{\s*id:'(\w+)',\s*name:'([^']+)',\s*tier:(\d+),\s*type:'(\w+)',\s*type2:(?:'(\w+)'|null)/g))
    (SPECIES[m[2]] = SPECIES[m[2]] || []).push(
      { name: m[3], tier: +m[4], t1: m[5], t2: m[6] || null });
}
t(Object.keys(SPECIES).length > 50, `${Object.keys(SPECIES).length} species declared in the game`);

// ★ duplicate KEYS in an object literal do not throw — the last one silently
// wins. This is exactly how a T4 Veridrax shipped under a T2's justification.
{
  const dupes = Object.entries(SPECIES).filter(([, v]) => v.length > 1);
  t(dupes.length === 0,
    '★★★ no species is declared TWICE · duplicate object keys resolve silently, '
    + 'last-one-wins, so a second entry ships under the first one\'s comment'
    + (dupes.length ? ' · ' + dupes.map(d => d[0]).join(', ') : ''));
}

/* ── 1 · TIER AND TYPES MUST MATCH THE LOCK ─────────────────────────────── */
// ★ 'Tech' is the engine's id for what the roster spells 'Tech'; the roster
// writes types as "A/B". Compare case-insensitively on both halves.
const norm = (s) => (s || '').toLowerCase().replace(/^technology$/, 'tech');
let checked = 0;
const tierBad = [], typeBad = [];
for (const [id, arr] of Object.entries(SPECIES)){
  const s = arr[0];
  const r = ROSTER[s.name.toLowerCase()];
  if (!r) continue;                       // not every species is on the lock
  checked++;
  if (r.tier !== s.tier) tierBad.push(`${s.name} · game T${s.tier} vs roster T${r.tier}`);
  const [r1, r2] = String(r.types).split('/');
  if (norm(r1) !== norm(s.t1) || norm(r2 || '') !== norm(s.t2 || ''))
    typeBad.push(`${s.name} · game ${s.t1}/${s.t2 || '-'} vs roster ${r.types}`);
}
console.log(`\n       ${checked} species cross-checked against the lock\n`);
t(tierBad.length === 0,
  '★★★ every species matches the locked roster on TIER'
  + (tierBad.length ? '\n         ' + tierBad.join('\n         ') : ''));
// ★ TYPES are a warn, not a fail: the Creator can and does re-rule a typing in
// conversation (Neuromoo went Tech/Aura → Tech/Creature on his word at
// v0.95.986). A divergence is a v2 ROSTER CHANGE to file, not a bug to revert
// — but it must never happen SILENTLY, which is what this print is for.
if (typeBad.length){
  wr(`★★ ${typeBad.length} typing(s) diverge from the lock · each needs a v2 roster entry`);
  typeBad.forEach(b => console.log('         ' + b));
} else ok('every species matches the locked roster on TYPES');

/* ── 2 · in the index exactly once ──────────────────────────────────────── */
{
  const at = HTML.indexOf('const ATHRENOLOGY_INDEX');
  const blk = HTML.slice(at, HTML.indexOf('\n];', at));
  const seen = {};
  for (const m of blk.matchAll(/\{n:'([^']+)',t:(\d+)/g))
    (seen[m[1]] = seen[m[1]] || []).push(+m[2]);
  const dupes = Object.entries(seen).filter(([, v]) => v.length > 1);
  t(dupes.length === 0,
    '★★ no name appears twice in ATHRENOLOGY_INDEX · the Zyredex is built from '
    + 'the index, so a duplicate is a second dex row for one creature'
    + (dupes.length ? ' · ' + dupes.map(d => `${d[0]} (T${d[1].join(', T')})`).join(', ') : ''));

  // ★★ MEALUX IS ABSENT ON PURPOSE. _nbZyrex() renders a catalogued entry's
  // name and typing whether or not the player has ever met it, and Mealux is a
  // hidden per-playthrough trace — a dex row for it IS the spoiler
  // ([[aov-no-easter-egg-spoilers]]). Named here so no future pass "fixes" the
  // gap back in.
  const INDEX_EXEMPT = ['Mealux'];
  const missing = Object.values(SPECIES).map(a => a[0].name)
    .filter(n => !seen[n] && !INDEX_EXEMPT.includes(n));
  t(missing.length === 0,
    '★ every declared species has an index row · one that does not can be '
    + 'CAUGHT AND NEVER APPEAR IN THE DEX'
    + (missing.length ? ' · ' + missing.join(', ') : ''));
}

/* ── 3 · ★★ THE CREATOR'S OWN WORDS, AS A SPEC ──────────────────────────── */
// Each entry is quoted from the request that created it. "only" is load-bearing
// — phrenetic overran its by two districts and nothing noticed until a census.
const ASKED = {
  wynwyrm:    { d: ['malezor'],                          q: 'tier 1 malezor similar spawns to aetherwing class zyrex' },
  terralith:  { d: ['zarvane'],                          q: 'add terralith populations to zarvane' },
  vampella:   { d: ['vorashil', 'xilnar'],               q: 'add vampella populations to vorashil and xilnar' },
  xytabyte:   { d: ['thardin'],                          q: 'xytabyte walking sprite sheet. add to thardin wilds' },
  volcaxor:   { d: ['baelgor'],                          q: 'add volcaxor to baelgor' },
  voltigrax:  { d: ['vorashil'],                         q: 'add voltigrax and frosane populations to vorashil' },
  frosane:    { d: ['vorashil', 'xilnar'],               q: 'add voltigrax and frosane populations to vorashil' },
  snok:       { d: ['veridan', 'netharion'],             q: 'add populations in veridan and netharion' },
  irisol:     { d: ['netharion', 'andrannor', 'xilnar'], q: 'add to netharion, andrannor, and xilnar' },
  phrenetic:  { d: ['netharion', 'vorashil', 'xilnar'],  q: 'add phrenetic populations in netharion vorashil and xilnar ONLY' },
  sigilmore:  { d: ['veridan', 'xilnar', 'andrannor'],   q: 'add populations in veridan xilnar and andrannor' },
  veridrax:   { d: ['malezor', 'veridan', 'baelgor'],    q: 'add in malezor and veridan and baelgor' },
  nimbuscrown:{ d: ['korathen', 'vorashil'],             q: 'add nimbuscrown populations to korathen and vorashil' },
  noxiclaw:   { d: ['netharion', 'andrannor'],           q: 'add noxiclaw to netharion and andrannor' },
  solcryst:   { d: ['vorashil', 'baelgor'],              q: 'add to vorashil and baelgor' },
  neuromoo:   { d: ['thardin', 'zarvane'],               q: 'add them in thardin and zarvane' },
  buzzolt:    { d: ['zarvane'],                          q: 'add buzzolt to zarvane' },
  talenko:    { d: ['zarvane', 'veridan'],               q: 'add talenko to zarvane and veridan' },
};
const live = {};
for (const m of HTML.matchAll(/\{ id: '(\w+)', at: \[\s*(-?\d+),\s*(-?\d+)\], dist: '(\w+)'/g)){
  (live[m[1]] = live[m[1]] || {});
  live[m[1]][m[4]] = (live[m[1]][m[4]] || 0) + 1;
}
console.log('');
for (const [id, spec] of Object.entries(ASKED)){
  const got = live[id] || {};
  const have = Object.keys(got).sort();
  const want = [...spec.d].sort();
  const missing = want.filter(d => !have.includes(d));
  const extra   = have.filter(d => !want.includes(d));
  const total   = Object.values(got).reduce((a, b) => a + b, 0);
  if (!missing.length && !extra.length)
    ok(`${id.padEnd(12)} ${String(total).padStart(2)} wilds in ${have.join(', ')}`);
  else
    no(`${id.padEnd(12)} "${spec.q}"`
       + (missing.length ? `\n         MISSING from ${missing.join(', ')}` : '')
       + (extra.length   ? `\n         ★ UNASKED-FOR in ${extra.join(', ')}` : ''));
}

/* ── 4 · a reward with no trigger is a dead end ─────────────────────────── */
{
  // ★ Vengrizz has 0 wilds ON PURPOSE — it is quest-granted, not caught. But
  // the flag its grant reads is only ever READ and SAVED, never SET, so the
  // creature is currently unobtainable by any path. The Creator said the
  // parents sidequest is coming ("I'll make the parents side quest loop soon"),
  // so this is a WARN that should turn into a pass, not a bug to paper over.
  const CODE = HTML.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const sets = /player\.lostBoyReunited\s*=[^=]/.test(CODE);
  if (sets) ok('★ vengrizz is reachable · lostBoyReunited is set somewhere');
  else wr('★★ VENGRIZZ IS UNOBTAINABLE · grantVengrizz() reads player.lostBoyReunited, '
        + 'which is saved and read but never SET · awaiting the lost-boy sidequest');
}

console.log(`\n★ ${pass} passed · ${fail} failed · ${warn} warned\n`);
process.exit(fail ? 1 : 0);
