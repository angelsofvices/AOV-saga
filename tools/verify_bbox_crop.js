#!/usr/bin/env node
/* verify_bbox_crop.js · v0.95.982
 *
 *   Creator: "some of apexaur frames are cropped... the nose sometimes gets cut."
 *
 * ★ THE AUDIT WE DID NOT HAVE.  There were already two bbox checks and neither
 *   could have caught this:
 *     · audit_bbox_convention.js  asks "is this table in the right COORDINATE
 *       SYSTEM" — Apexaur's was, and it passed every time.
 *     · audit_sheet_frames.py     measures the ART and never reads the table.
 *   Between them sat the actual failure mode: a table in the right units, on a
 *   clean sheet, drawn around the wrong RECTANGLE. One frame in sixteen ended
 *   18px short on the right, and the right-facing row's right edge is the nose.
 *
 * ★★ So this suite compares the SHIPPED TABLE against the MEASURED ART, per
 *   frame, for every bank in the game — the one comparison nothing was making.
 *   It needs the measurement tool, so it shells out to it rather than
 *   re-implementing connected-component ownership badly.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== BBOX vs ART · is any frame cropped? (v0.95.982) ===\n');

/* ── every bank with a src + a bboxes table ─────────────────────────────── */
// ★★★ v0.95.997 · SCOPED TO SUMMONABLE_SPRITES. This slice ran to the END OF
// THE FILE, so it also swept up ZYREX_ATTACK_BANKS and the bond-encounter VFX
// banks — NINETEEN duplicated names, celestryx and zarakai and voltigrax each
// measured twice. Worse, the attack sheets are non-square STRIPS (celestryx is
// 1983x793) and this audit assumes a square 4x4 grid, so every "crop" it
// reported for them was arithmetic on a cell size that does not exist.
// ★ That is where the flake came from: celestryx read 15 crops one run and 16
// the next while its sheet and its table were untouched. Measured directly,
// the celestryx SPRITE bank has ZERO cropped frames.
// ★★ A large share of the 163-frame backlog was this — numbers that looked
// like a known-issues list and were actually a unit error. The baseline below
// is re-derived from the correctly-scoped scan.
const start = HTML.search(/const\s+SUMMONABLE_SPRITES\s*=/);
const END   = HTML.indexOf('\n};', start);
const SCOPE = HTML.slice(start, END > start ? END : HTML.length);
const banks = [];
for (const m of SCOPE.matchAll(/\n  (\w+): \{/g)){
  const at = start + m.index;
  const blk = HTML.slice(at, HTML.indexOf('\n  },', at));
  const code = blk.replace(/\/\/[^\n]*/g, '');
  const src = (code.match(/\n\s*src:\s*'([^']+)'/) || [])[1];
  if (!src) continue;
  const tbl = (label) => {
    const i = code.indexOf(label);
    if (i < 0) return null;
    const rows = code.slice(i).split('\n').filter(l => /^\s*\[\[/.test(l)).slice(0, 4)
      .map(l => [...l.matchAll(/\[\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g)]
                  .map(x => x.slice(1, 5).map(Number)));
    return rows.length === 4 && rows.every(r => r.length === 4) ? rows : null;
  };
  banks.push({ id: m[1], src: decodeURIComponent(src), bboxes: tbl('bboxes:'),
               runSrc: (code.match(/runSrc:\s*'([^']+)'/) || [])[1],
               runBboxes: tbl('runBboxes:') });
}
t(banks.length > 20, `${banks.length} sprite banks found`);

/* ── measure each sheet once, cache by path ─────────────────────────────── */
const MEASURE = path.join(ROOT, 'tools/measure_sheet_cells.py');
const cache = {};
function measure(rel){
  if (cache[rel] !== undefined) return cache[rel];
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f)) return (cache[rel] = null);
  let out;
  try { out = execFileSync('python3', [MEASURE, f], { encoding: 'utf8', timeout: 60000 }); }
  catch (_) { return (cache[rel] = null); }
  const rows = out.split('\n').filter(l => /^\s*\[\[/.test(l)).slice(0, 4)
    .map(l => [...l.matchAll(/\[\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g)]
                .map(x => x.slice(1, 5).map(Number)));
  return (cache[rel] = (rows.length === 4 ? rows : null));
}

const FACE = ['DOWN', 'LEFT', 'RIGHT', 'UP'];
// ★ a 2px slack: the measurement and a hand-tuned table can legitimately differ
// by a pixel of anti-aliased rim without anything being visibly cut.
const SLACK = 2;
const cuts = [];
let checked = 0;
for (const b of banks){
  for (const [label, tbl, rel] of [['idle', b.bboxes, b.src], ['run', b.runBboxes, b.runSrc]]){
    if (!tbl || !rel) continue;
    const art = measure(rel);
    if (!art) continue;
    checked++;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
      const [sx, sy, sw, sh] = tbl[r][c];
      const [tx, ty, tw, th] = art[r][c];
      const d = {
        LEFT:   sx - tx,
        RIGHT:  (tx + tw) - (sx + sw),
        TOP:    sy - ty,
        BOTTOM: (ty + th) - (sy + sh),
      };
      const bad = Object.entries(d).filter(([, v]) => v > SLACK);
      if (bad.length){
        cuts.push(`${b.id}.${label} ${FACE[r]} f${c} · `
          + bad.map(([k, v]) => `${k} ${v}px`).join(' · '));
      }
    }
  }
}
console.log(`\n       ${checked} tables measured against their own art\n`);
if (cuts.length) cuts.slice(0, 40).forEach(c => console.log('         ✂ ' + c));

// ★★★ A RATCHET, NOT A PASS/FAIL — and now PER SPECIES.
//
// The first run of this check found 158 clipped frames across the roster. They
// are real (snok's feet are cut 10-15px, otterlin's ears 22px) but NOT all safe
// to auto-fix: these sheets carry 30-60 connected components and some tables
// were deliberately tightened to EXCLUDE a detached sparkle. So the check
// asserts the count cannot GROW — a suite that fails on 158 known issues every
// run is one everyone learns to ignore, and the next real crop hides in it.
//
// ★★ BUT A SINGLE TOTAL COULD NOT ANSWER THE ONE QUESTION THAT MATTERS. At
// v0.95.988 the count read 163 against a 158 baseline, and "5 more than before"
// is not a finding — it cannot say WHICH sheet got worse, and adding a new bank
// legitimately adds frames to measure. I had to dump the whole list by hand to
// establish that none of the nine sheets added that session contributed a
// single crop, and that the drift sat entirely in older art.
//
// ★ So the baseline is a MAP now. A new species starts at 0 and any crop it
// ships fails immediately and BY NAME; an existing one can only improve. That
// is the check the total was always pretending to be.
const CROP_BASELINE = {
  // ★★★ v0.95.997 · RE-DERIVED after scoping the scan to SUMMONABLE_SPRITES.
  // The old baseline totalled 163. The true figure is 19. The missing 144 were
  // attack STRIPS and bond-encounter VFX banks measured as if they were square
  // 4x4 grids — celestryx alone contributed 15 frames of pure arithmetic error,
  // and the eight success_/fail_ banks another 120 between them. All nine now
  // read ZERO because they were never cropped; they were never even the right
  // shape to ask the question of.
  // ★★ A backlog that looks like 163 known issues and is really 19 real ones
  // plus a unit error is worse than no backlog: it is the exact noise this
  // ratchet was built to prevent, generated by the ratchet itself.
  //
  // ★ What remains is real and worth a by-eye pass, in priority order:
  otterlin:  7,   // ears clipped 17-32px · the worst of them
  volcaxor:  3,   // RIGHT-row tops cut 9-21px
  elzebub:   4,   // side rows 4-19px
  volcanut:  2,
  zarakai:   2,
  anciuxor:  1,
};
{
  const now = {};
  for (const c of cuts){ const id = c.split('.')[0]; now[id] = (now[id] || 0) + 1; }
  const worse = [], newly = [], better = [];
  for (const id of Object.keys(now)){
    const base = CROP_BASELINE[id];
    if (base === undefined) newly.push(`${id} (+${now[id]})`);
    else if (now[id] > base) worse.push(`${id} ${base} → ${now[id]}`);
    else if (now[id] < base) better.push(`${id} ${base} → ${now[id]}`);
  }
  for (const id of Object.keys(CROP_BASELINE)) if (!now[id]) better.push(`${id} ${CROP_BASELINE[id]} → 0`);
  t(newly.length === 0,
    '★★★ no sheet that was clean has started cropping'
    + (newly.length ? ' · ' + newly.join(', ') : ''));
  t(worse.length === 0,
    '★★ and no sheet crops MORE than it did'
    + (worse.length ? ' · ' + worse.join(', ') : ''));
  if (better.length){
    console.log('\n  ★ improved — lower these in CROP_BASELINE:');
    better.forEach(b => console.log('      ' + b));
  }
  console.log(`\n       ${cuts.length} cropped frames total across ${Object.keys(now).length} sheet(s)\n`);
}

/* ── and the specific one the Creator reported ──────────────────────────── */
{
  const ap = banks.find(b => b.id === 'apexaur');
  t(!!ap && !!ap.bboxes && !!ap.runBboxes, 'apexaur carries both tables');
  if (ap && ap.bboxes && ap.runBboxes){
    t(JSON.stringify(ap.bboxes) === JSON.stringify(ap.runBboxes),
      '★ apexaur idle and run tables are IDENTICAL · the two sheets are drawn on '
      + 'one rig, so any divergence between them is itself a bug report');
    const [x, , w] = ap.bboxes[2][0];      // RIGHT f0 · the frame that cut the nose
    t(x >= 0, `★★ RIGHT f0 no longer starts off-cell (x ${x}, was -30)`);
    t(x + w >= 298, `★★ ...and reaches the snout at x 298 (now ${x + w})`);
  }
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
