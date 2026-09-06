#!/usr/bin/env node
/* verify_phrenetic.js · v0.95.972
 *
 * The redrawn Phrenetic sheet.  Three things can go wrong when a sprite bank is
 * replaced, and this suite is one test per failure mode:
 *
 *   1. the table is written in ABSOLUTE sheet coordinates instead of
 *      cell-relative, so the draw reads off-sheet and the creature vanishes
 *      (apexaur, v0.95.953 — six tables at once);
 *   2. the art file was never actually copied over the old one, so the new
 *      bboxes describe a sheet that isn't there;
 *   3. the drawn SIZE moves, because the engine's yardstick (the tallest col-0
 *      body in the bank) landed somewhere else in the new art
 *      (elzoran, v0.95.970 · skybeam, v0.95.954).
 *
 * Failure 3 is the subtle one and the reason this file exists: it does not
 * throw, it does not look wrong in a still, and you only catch it by doing the
 * engine's own arithmetic on both banks and comparing.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== PHRENETIC · redrawn sheet (v0.95.972) ===\n');

/* ── pull the bank out of SUMMONABLE_SPRITES ─────────────────────────────── */
// ★ anchor on the DECLARATION, not the first mention of the name.  The string
// 'SUMMONABLE_SPRITES' first appears ~12,000 lines earlier in a comment, and
// searching from there lands on SPECIES.phrenetic instead — a bank with no
// bboxes and no scaleMul, which reads as six failures that have nothing to do
// with the patch.
const decl = HTML.search(/const\s+SUMMONABLE_SPRITES\s*=/);
t(decl > 0, 'SUMMONABLE_SPRITES declaration located');
const at = HTML.indexOf('\n  phrenetic: {', decl);
t(at > 0, 'phrenetic bank found in SUMMONABLE_SPRITES');
// slice to the STRUCTURAL end of the object, never a fixed byte window —
// fixed windows have silently truncated three suites in this project.
const end = HTML.indexOf('\n  },', at);
const bank = HTML.slice(at, end);

const bbTxt = bank.slice(bank.indexOf('bboxes:'), bank.indexOf(']\n', bank.indexOf('bboxes:')));
const rows = [...bbTxt.matchAll(/\[\s*\[([^\]]*)\]\s*,\s*\[([^\]]*)\]\s*,\s*\[([^\]]*)\]\s*,\s*\[([^\]]*)\]\s*\]/g)]
  .map(m => m.slice(1, 5).map(s => s.split(',').map(n => parseInt(n.trim(), 10))));

t(rows.length === 4, `bboxes parses as 4 rows (got ${rows.length})`);
t(rows.every(r => r.length === 4 && r.every(b => b.length === 4)),
  'every row is 4 frames of [x,y,w,h]');

/* ── 1 · cell-relative, not absolute ─────────────────────────────────────── */
const CW = 313, CH = 313;
const absLooking = rows.flat().filter(b => b[0] >= CW || b[1] >= CH);
t(absLooking.length === 0,
  `no bbox origin exceeds one cell — the table is cell-relative (${absLooking.length} suspect)`);
// and the derived source rect must land on the sheet for all 16 frames
let offSheet = 0;
rows.forEach((row, r) => row.forEach((b, c) => {
  if (c * CW + b[0] + b[2] > 1254 + 1 || r * CH + b[1] + b[3] > 1254 + 1) offSheet++;
}));
t(offSheet === 0, `all 16 source rects land inside the 1254² sheet (${offSheet} off)`);

/* ── 2 · the art file is the NEW art ─────────────────────────────────────── */
const art = path.join(ROOT, 'assets/2D sprites/zyrex/phrenetic.png');
const prev = path.join(ROOT, 'assets/2D sprites/zyrex/_orig/phrenetic-prev.png');
t(fs.existsSync(art), 'assets/2D sprites/zyrex/phrenetic.png exists');
t(fs.existsSync(prev), 'the superseded sheet is archived in _orig/');
if (fs.existsSync(art) && fs.existsSync(prev)) {
  const a = fs.statSync(art).size, p = fs.statSync(prev).size;
  t(a !== p, `live art differs from the archived old sheet (${a} vs ${p} bytes) — ` +
             'the copy actually happened');
}
t(/src:\s*'assets\/2D%20sprites\/zyrex\/phrenetic\.png'/.test(bank),
  'src still points at the canonical space-escaped path');

/* ── 3 · the drawn size did not move ─────────────────────────────────────── */
// The engine's own arithmetic: scale = (TILE*2) / max(216, tallest col-0 body)
// then × scaleMul.  Reproduced here rather than described, because a described
// formula cannot go stale and this one can.
const TILE = 48;
const mulM = bank.match(/scaleMul:\s*([\d.]+)/);
t(!!mulM, 'scaleMul present');
const MUL = mulM ? parseFloat(mulM[1]) : 1;
t(MUL === 1.10, `scaleMul is still 1.10 (a Legend reads over the Rizer) — got ${MUL}`);

const scaleOf = (bb) => (TILE * 2) / Math.max(216, ...bb.map(r => r[0][3])) * MUL;
const OLD = [ // the shipped bank, verbatim, before this patch
  [[ 40, 23,233,266],[ 35, 22,242,268],[ 32, 16,247,281],[ 33, 21,247,270]],
  [[ 30, 40,252,233],[ 27, 41,259,231],[ 26, 40,259,233],[ 26, 43,260,226]],
  [[ 30, 40,252,231],[ 30, 39,252,232],[ 31, 39,248,232],[ 29, 41,254,228]],
  [[ 45, 18,223,277],[ 48, 20,216,273],[ 46, 20,218,272],[ 48, 21,216,271]],
];
const sOld = scaleOf(OLD), sNew = scaleOf(rows);
const hOld = OLD.map(r => Math.round(r[0][3] * sOld));
const hNew = rows.map(r => Math.round(r[0][3] * sNew));

console.log(`\n       old  scale ${sOld.toFixed(4)}  drawn heights ${JSON.stringify(hOld)}`);
console.log(`       new  scale ${sNew.toFixed(4)}  drawn heights ${JSON.stringify(hNew)}\n`);

// The DOWN row is the one the player sees on approach and the one that must not
// move.  The side rows are ALLOWED to grow here — the old sheet drew him
// squashed in profile (233 tall against a 266 front view of the same creature)
// and the redraw fixes that, which is a correction, not a regression.
const downDrift = Math.abs(hNew[0] / hOld[0] - 1);
t(downDrift < 0.06,
  `DOWN-row drawn height holds within 6% (${hOld[0]}px → ${hNew[0]}px, ` +
  `${(downDrift * 100).toFixed(1)}%) — no shrink, no pop`);

// and the new bank must be internally uniform, which is the whole point of the
// redraw: all four rows within 10% of each other.
const spread = Math.max(...hNew) / Math.min(...hNew) - 1;
t(spread < 0.10,
  `new bank is uniform across all four facings (spread ${(spread * 100).toFixed(1)}%) — ` +
  'frame rule 2');
// prove the OLD bank was NOT, so the growth above is explained rather than excused
const oldSpread = Math.max(...hOld) / Math.min(...hOld) - 1;
t(oldSpread > 0.15,
  `and the OLD bank was not (spread ${(oldSpread * 100).toFixed(1)}%) — this is why ` +
  'no scaleRefBh pin was added');

/* ── 4 · no pin was added by accident ────────────────────────────────────── */
// match the FIELD, not the word — the bank carries a comment explaining why the
// pin is absent, and a bare /scaleRefBh/ fails on its own explanation.
t(!/^\s*scaleRefBh\s*:/m.test(bank.replace(/\/\/[^\n]*/g, '')),
  'no scaleRefBh FIELD on the bank — pinning would re-impose the squash the art removed');

/* ── 5 · the species and its wild placements still resolve ───────────────── */
t(/^\s{2}phrenetic:\s*\{/m.test(HTML.slice(HTML.indexOf('phrenetic: {'))),
  'SPECIES.phrenetic entry intact');
const wilds = [...HTML.matchAll(/\{\s*id:\s*'phrenetic'/g)].length;
t(wilds >= 2, `phrenetic still pinned as a wild (${wilds} placements)`);

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
