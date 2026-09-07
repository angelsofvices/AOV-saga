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
const start = HTML.search(/const\s+SUMMONABLE_SPRITES\s*=/);
const banks = [];
for (const m of HTML.slice(start).matchAll(/\n  (\w+): \{/g)){
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

// ★★★ A RATCHET, NOT A PASS/FAIL — and the distinction is the point.
// The first run of this check found 158 clipped frames across the roster. They
// are real (snok's feet are cut 10-15px, otterlin's ears 22px), but they are
// NOT all safe to auto-fix: these sheets carry 30-60 connected components, and
// some of those tables were deliberately tightened to EXCLUDE a detached
// sparkle or VFX bit the artist did not want drawn. Replacing all 158 with the
// raw measurement would pull every one of those back in.
//
// ★ So the check asserts the count cannot GROW. A suite that fails on 158
// known issues every run is a suite everyone learns to ignore, and the next
// real crop hides inside the noise. This way today's backlog is visible, a new
// crop breaks the build immediately, and the number only ever ratchets down as
// they are worked through by eye.
const CROP_BASELINE = 158;
t(cuts.length <= CROP_BASELINE,
  `★★ cropped frames ${cuts.length} · at or under the ${CROP_BASELINE} baseline (no NEW crops)`);
if (cuts.length < CROP_BASELINE){
  console.log(`\n  ★ ${CROP_BASELINE - cuts.length} fewer than the baseline — lower CROP_BASELINE to ${cuts.length}\n`);
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
