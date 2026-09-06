#!/usr/bin/env node
/* verify_elzimir.js · v0.95.975
 *
 *   Creator: "elzimir idle sprite. stage 2 of elzebub @ level 30. right before
 *   elzoran at 50"
 *
 * ★ The species entry and the evolution pointers already existed — Elzebub has
 *   read `evolveTo:'elzimir', evolveLv:30` since the line was written.  What
 *   was missing was a BODY, so a starter hitting Lv30 evolved into a creature
 *   with no sheet.  That is the class of bug that only shows up in a save that
 *   has played for hours, which is exactly why it survived: it is invisible
 *   until someone levels a starter past 30, and the thing to test is therefore
 *   the CHAIN end to end, not the one entry that got added.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== ELZIMIR · the missing middle of the Elzebub line (v0.95.975) ===\n');

/* ── the chain, end to end ──────────────────────────────────────────────── */
const speciesAt = HTML.search(/const\s+SPECIES\s*=/);
const spBlock = (id) => {
  const at = HTML.indexOf(`\n  ${id}: {`, speciesAt);
  return at < 0 ? '' : HTML.slice(at, HTML.indexOf('\n  },', at));
};
// ★ FOUR stages, not three. I first asserted Elzoran was the end of the line
// and the suite corrected me: he reads `evolveTo:'omegoran', evolveLv:80`.
// This is the PERFECT EPSILON ladder — the game's only complete one — and
// Elzimir is its second rung, not the middle of a trilogy.
const chain = ['elzebub', 'elzimir', 'elzoran', 'omegoran'];
const blocks = Object.fromEntries(chain.map(id => [id, spBlock(id)]));
chain.forEach(id => t(!!blocks[id], `SPECIES.${id} exists`));

t(/evolveTo:\s*'elzimir'\s*,\s*evolveLv:\s*30/.test(blocks.elzebub),
  '★ Elzebub → Elzimir at Lv30');
t(/evolveTo:\s*'elzoran'\s*,\s*evolveLv:\s*50/.test(blocks.elzimir),
  '★ Elzimir → Elzoran at Lv50');
t(/evolveTo:\s*'omegoran'\s*,\s*evolveLv:\s*80/.test(blocks.elzoran),
  '★ Elzoran → Omegoran at Lv80 · the PERFECT EPSILON ladder, four rungs');
t(!/evolveTo:/.test(blocks.omegoran), '  · and Omegoran is the end of the line');

// tiers must climb
const tierOf = (id) => { const m = blocks[id].match(/\btier:\s*(\d+)/); return m ? +m[1] : null; };
const tiers = chain.map(tierOf);
t(tiers.every((v, i) => i === 0 || v > tiers[i-1]),
  `tiers climb along the chain · T${tiers.join(' → T')}`);

// and so must the stat pool, because tier×333 says so
const poolOf = (id) => ['baseHP','baseATK','baseDEF','baseSPD','baseSATK','baseSDEF']
  .reduce((a, k) => a + (+(blocks[id].match(new RegExp('\\b' + k + ':\\s*(\\d+)')) || [0,0])[1]), 0);
chain.forEach((id, i) => t(poolOf(id) === tiers[i] * 333,
  `  · ${id} pool ${poolOf(id)} === tier×333 (${tiers[i] * 333})`));

// types hold across an evolution
const typesOf = (id) => (blocks[id].match(/type:\s*'([^']+)'[^\n]*type2:\s*'([^']+)'/) || []).slice(1);
t(JSON.stringify(typesOf('elzimir')) === JSON.stringify(typesOf('elzebub')) &&
  JSON.stringify(typesOf('elzimir')) === JSON.stringify(typesOf('elzoran')),
  `★ the whole line stays ${typesOf('elzimir').join('/')} — an evolution is not a retype`);

/* ── the body it was pointing at ────────────────────────────────────────── */
const bankAt = HTML.indexOf('\n  elzimir: {', HTML.search(/const\s+SUMMONABLE_SPRITES\s*=/));
t(bankAt > 0, '★ elzimir has a sprite bank at last');
const bank = HTML.slice(bankAt, HTML.indexOf('\n  },', bankAt));

const art = path.join(ROOT, 'assets/2D sprites/zyrex/elzimir.png');
t(fs.existsSync(art), 'assets/2D sprites/zyrex/elzimir.png exists on disk');
t(/src:\s*'assets\/2D%20sprites\/zyrex\/elzimir\.png'/.test(bank),
  '  · and the bank points at it, space-escaped');

// ★ strip the comment block first. This bank carries a long note that contains
// numbers in prose ("204 against 245", "(13,150,7)"), and a bracket-hungry
// regex reads those as bboxes.
const bankCode = bank.replace(/\/\/[^\n]*/g, '');
// ★ parse ROW BY ROW, not with one greedy regex over the whole table.
// The obvious pattern `\[\s*\[([^\]]*)\]…` has a trap: `[^\]]` excludes only
// the CLOSING bracket, so on `bboxes: [\n  [[ 73, 52,…` it happily swallows the
// table's own opening `[` into the first capture and parseInt reads "[ 73" as
// NaN. It only worked on earlier sheets because a comment happened to sit
// between the two brackets. One row per line is unambiguous.
const rows = bankCode.split('\n')
  .filter(l => /^\s*\[\[/.test(l))
  .map(l => [...l.matchAll(/\[\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g)]
              .map(m => m.slice(1, 5).map(Number)));
t(rows.length === 4 && rows.every(r => r.length === 4 && r.every(b => b.length === 4)),
  'bboxes parse as 4 rows × 4 frames of [x,y,w,h]');

// cell-relative, never absolute (the apexaur failure at v0.95.953)
const CW = 313;
t(rows.flat().every(b => b[0] < CW && b[1] < CW),
  '★ the table is cell-relative — no origin reaches a whole cell');
// negative origins are LEGAL here: owned overflow, wings crossing the cell edge
const neg = rows.flat().filter(b => b[0] < 0 || b[1] < 0).length;
ok(`  · ${neg} frame(s) carry negative origins — owned overflow (wings/horns), never clipped`);

/* ── the growth ladder · the point of a middle stage ────────────────────── */
{
  const TILE = 48;
  const mulOf = (blk) => parseFloat((blk.match(/scaleMul:\s*([\d.]+)/) || [])[1]);
  const bankOf = (id) => {
    const a = HTML.indexOf(`\n  ${id}: {`, HTML.search(/const\s+SUMMONABLE_SPRITES\s*=/));
    return HTML.slice(a, HTML.indexOf('\n  },', a));
  };
  // ★ only the FIRST table (`bboxes:`), and only its four col-0 heights.
  // Elzebub's bank carries a second table (`idleBboxes:`) whose tallest frame
  // is 305 — folding that into the yardstick made him measure 56px instead of
  // 67 and quietly understated the first step of the ladder. The engine
  // normalises each bank against its OWN col-0 max, so the suite must too.
  const col0 = (blk) => {
    const at = blk.indexOf('bboxes:');
    const tbl = blk.slice(at, blk.indexOf('],', blk.indexOf(']', blk.lastIndexOf(']],', blk.indexOf('cellW')))) + 2);
    return [...tbl.matchAll(/\[\s*\[\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)].map(m => +m[4]);
  };
  const drawnFront = (id) => {
    const blk = bankOf(id), hs = col0(blk), mul = mulOf(blk);
    if (!hs.length || !mul) return null;
    const mx = Math.max(216, ...hs);
    return Math.round(hs[0] * ((TILE * 2) / mx) * mul);
  };
  // Omegoran has no sheet yet, so the ladder is measured over the three that do
  const h = ['elzebub', 'elzimir', 'elzoran'].map(drawnFront);
  console.log(`\n       drawn front-view height · Elzebub ${h[0]}px → Elzimir ${h[1]}px → Elzoran ${h[2]}px\n`);
  t(h[0] < h[1] && h[1] < h[2],
    '★★ the line visibly GROWS at every step — an evolution the player cannot see is a stat change with a name');
  const s1 = h[1] - h[0], s2 = h[2] - h[1];
  t(Math.abs(s1 - s2) <= Math.max(s1, s2) * 0.4,
    `  · and the two steps are comparable (+${s1} then +${s2}), so the middle does not look like an afterthought`);
}

/* ── the baked shadows are gone ─────────────────────────────────────────── */
{
  const keyer = path.join(ROOT, 'tools/key_elzimir.py');
  t(fs.existsSync(keyer), 'tools/key_elzimir.py kept · this sheet needed a non-standard key');
  const src = fs.existsSync(keyer) ? fs.readFileSync(keyer, 'utf8') : '';
  t(/g > r \* 3 and g > b \* 3/.test(src),
    '★ it keys on GREEN-FAMILY, not on the exact key colour — which is what removes the baked ground shadows');
  t(/deque/.test(src) && /border/.test(src),
    '  · still a border flood-fill, per chroma-key canon · never a global replace');
}

/* ── and the stale comment two versions old ─────────────────────────────── */
// ★ the corrected header still NAMES the retired formula, in order to say it
// is retired — so the test has to distinguish "documents it as current" from
// "documents that it is gone". The tell is the retraction next to it.
{
  const at = HTML.indexOf('// v0.95.318 · ZYREX COMBAT AI');
  t(at > 0, '★ the combat header was rewritten, not left two versions stale');
  const hdr = HTML.slice(at, at + 900);
  t(/replaced in the same version/.test(hdr) && /ATK × \(default move power ÷ 40\) ÷ 6/.test(hdr),
    '  · it now states the LIVE formula and marks the old one dead');
  t(!/Damage: baseDmg = tier×30 \+ level×2 · scales cleanly/.test(HTML),
    '  · the line that presented tier×30 as current is gone');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
