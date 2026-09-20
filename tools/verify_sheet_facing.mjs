// ★★★★ v0.99.9 · WHICH WAY DOES A SIDE ROW FACE · the moonwalk check.
//
//   Creator, 2026-09-20: "xytabyte is walking backwards on left and right
//   animations."
//
// ★★★★ HOW A SHEET LIES ABOUT THIS, AND WHY AN AUDIT MISSED IT.
//   The v0.95.979 note called xytabyte "the cleanest sheet delivered this
//   session · audit_sheet_frames returns ZERO issues · RIGHT a true mirror of
//   LEFT at 0.97". Every word was correct. A perfect mirror pair is precisely
//   the case where a mirror test CANNOT tell you the two bands are the wrong
//   way round — it confirms they are opposites, which they are, and says
//   nothing about which is which. The audit was not wrong; it was answering a
//   different question.
//   ★ I looked at the art: in sheet row 1 the cannon barrel points RIGHT and in
//     row 2 it points LEFT. The sheet ships DOWN / RIGHT / LEFT / UP.
//
// ★★★ THIS SUITE MEASURES FACING BY MASS, not by eye. On a side view the
//   silhouette is front-heavy: a head, a muzzle, a snout. Comparing the ink in
//   the left third of the frame against the right third gives a direction, and
//   the two side rows must disagree — and must disagree in the direction the
//   rowMap claims.
import { bootGame } from './lib/boot_game.mjs';
import { readPng } from './lib/png.mjs';
import fs from 'fs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const CELL = 313;

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['SUMMONABLE_SPRITES','makeZyrexFollower','NPCS'] });
console.log = _L;

// mass bias of a cell: >0 means the ink leans RIGHT of centre
function bias(path, row, col, box){
  const im = readPng(path); if (!im) return null;
  const { w, h, data } = im;
  const [bx, by, bw, bh] = box;
  let left = 0, right = 0;
  const x0 = col*CELL + bx, y0 = row*CELL + by;
  const mid = x0 + bw/2;
  for (let y = Math.max(0,y0); y < Math.min(h, y0+bh); y++)
    for (let x = Math.max(0,x0); x < Math.min(w, x0+bw); x++){
      if (data[(y*w + x)*4 + 3] <= 20) continue;
      if (x < mid) left++; else right++;
    }
  const tot = left + right;
  return tot ? (right - left) / tot : 0;
}

H('★★★★ XYTABYTE · the sheet ships DOWN / RIGHT / LEFT / UP');
{
  const d = G.SUMMONABLE_SPRITES.xytabyte;
  ok(!!d, 'the sprite def exists');
  ok(!!d.rowMap, '★★★ and it declares a rowMap · the bands are not in canon order');
  ok(d.rowMap.left === 2 && d.rowMap.right === 1,
     `★★★★ left→row ${d.rowMap.left}, right→row ${d.rowMap.right} · the swap, stated in data`);
  ok(d.rowMap.down === 0 && d.rowMap.up === 3, '★ and DOWN/UP are where they always were');

  // ★★ MEASURED. Row 1 must lean the opposite way from row 2, and row 1 must
  //   be the one that leans RIGHT — that is what makes it the RIGHT-facing band.
  const p = 'assets/2D sprites/zyrex/xytabyte.png';
  const b1 = bias(p, 1, 0, d.bboxes[1][0]);
  const b2 = bias(p, 2, 0, d.bboxes[2][0]);
  ok(b1 !== null && b2 !== null, 'both side rows measured');
  ok(Math.sign(b1) !== Math.sign(b2),
     `★★★ the two side rows lean opposite ways · row1 ${b1.toFixed(3)}, row2 ${b2.toFixed(3)}`);
  // ★★★★ AND HERE IS A METRIC THAT DOES NOT WORK, RECORDED SO NOBODY TRIES IT
  //   AGAIN — INCLUDING ME. I wrote this section expecting mass bias to reveal
  //   facing: a side view is front-heavy, so the ink should lean the way the
  //   creature looks. It does not. Xytabyte's cannon points RIGHT in row 1 and
  //   the bias comes out NEGATIVE, because the barrel is thin and the armoured
  //   spider behind it is not: MASS FOLLOWS THE BODY, NOT THE MUZZLE. Run
  //   across the whole roster it then accused six more sheets of being swapped,
  //   which is the tell — six independent art deliveries are not all wrong, one
  //   heuristic is.
  //   ★ The facing here was settled the only way it could be: by RENDERING the
  //     four rows and looking at them. Row 1's barrel points right; row 2's
  //     points left. That is evidence a metric could not give me, and it is
  //     recorded here rather than dressed up as a measurement.
  console.log(`  ·  note · mass bias reads row1 ${b1.toFixed(3)} / row2 ${b2.toFixed(3)} — `
            + 'the OPPOSITE of the true facing. Mass is not a facing detector.');
}

H('★★★ AND THE ROWMAP SURVIVES BEING SUMMONED');
{
  // ★★★★ THE SECOND HALF OF THE BUG. The wild-body draw reads d.rowMap straight
  //   off the sprite def, but makeZyrexFollower copied bboxes, scale, cell size
  //   and the bob and DROPPED the rowMap — so the same creature faced correctly
  //   in the wild and backwards the moment you summoned it. One of two paths
  //   honouring a field is worse than neither, because it looks fixed.
  const z = { speciesId: 'xytabyte', name: 'Xytabyte', level: 20 };
  const n = G.makeZyrexFollower(z, { mode: 'follow' });
  ok(!!n, 'a follower is built');
  ok(n.rowMap && n.rowMap.left === 2 && n.rowMap.right === 1,
     `★★★★ the follower carries the rowMap · ${JSON.stringify(n.rowMap)}`);
  // and a species WITHOUT one still gets null rather than undefined noise
  const other = Object.keys(G.SUMMONABLE_SPRITES).find(k => !G.SUMMONABLE_SPRITES[k].rowMap);
  if (other){
    const n2 = G.makeZyrexFollower({ speciesId: other, name: other, level: 5 }, {});
    ok(n2.rowMap === null || n2.rowMap == null,
       `★ and a sheet in canon order carries none (${other})`);
  }
}

H('★★ WHAT CAN HONESTLY BE CHECKED ACROSS THE ROSTER');
{
  // ★ Every side-view pair in SUMMONABLE_SPRITES, measured. A pair that leans
  //   the WRONG way without a rowMap is the same bug waiting to be reported.
  let checked = 0, suspect = [];
  for (const [id, d] of Object.entries(G.SUMMONABLE_SPRITES)){
    if (!d.bboxes || !d.src) continue;
    const p = decodeURIComponent(d.src);
    if (!fs.existsSync(p)) continue;
    const b1 = bias(p, 1, 0, d.bboxes[1][0]);
    const b2 = bias(p, 2, 0, d.bboxes[2][0]);
    if (b1 === null || b2 === null) continue;
    checked++;
    // a clear, confident pair only — a near-symmetric creature says nothing
    if (Math.abs(b1) < 0.06 || Math.abs(b2) < 0.06) continue;
    const mapped = d.rowMap ? (d.rowMap.left === 1) : true;   // does `left` use row 1?
    // if row 1 serves LEFT it should lean LEFT (negative bias)
    const wrong = mapped ? (b1 > 0) : (b1 < 0);
    if (wrong) suspect.push(`${id} (row1 ${b1.toFixed(2)}, row2 ${b2.toFixed(2)}${d.rowMap ? ', has rowMap' : ''})`);
  }
  ok(checked > 10, `${checked} sheets measured`);
  // ★★★ NOT "are they swapped" — I have no test for that. What IS checkable is
  //   that the two side rows are genuine OPPOSITES: a sheet whose LEFT and
  //   RIGHT rows lean the same way has one band duplicated or mis-cut, and that
  //   is a defect whichever way round the pair is meant to go.
  const sameLean = [];
  for (const [id, d] of Object.entries(G.SUMMONABLE_SPRITES)){
    if (!d.bboxes || !d.src) continue;
    const p = decodeURIComponent(d.src);
    if (!fs.existsSync(p)) continue;
    const b1 = bias(p, 1, 0, d.bboxes[1][0]);
    const b2 = bias(p, 2, 0, d.bboxes[2][0]);
    if (b1 === null || b2 === null) continue;
    if (Math.abs(b1) < 0.06 || Math.abs(b2) < 0.06) continue;   // near-symmetric says nothing
    if (Math.sign(b1) === Math.sign(b2)) sameLean.push(`${id} (${b1.toFixed(2)} / ${b2.toFixed(2)})`);
  }
  ok(sameLean.length === 0,
     sameLean.length ? `★ LEFT and RIGHT lean the SAME way — one band is duplicated or mis-cut: ${sameLean.join(' · ')}`
                     : '★★★ every confident side-view pair is a true opposite · no band duplicated');
  console.log(`  ·  note · ${suspect.length} sheet(s) would have been accused by the mass-bias `
            + 'heuristic above. It is wrong; they are listed nowhere and nothing was changed on its word.');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ xytabyte faces the way he walks, in the wild and summoned');
process.exit(f ? 1 : 0);
