// ★★★ v0.96.66 · A HOLLOW SHEET · the defect that keys the CHARACTER, not the
// background.
//
// Zoryn wears a black coat.  Commit c990b69 baked his action sheets with a
// "smart baker" that auto-detected the corner colour and flood-filled from the
// edges — and for punch / kick / hurt / skate it detected BLACK.  The coat
// touches the silhouette edge, so the flood walked straight in and hollowed him
// out.  What shipped was red hair, a face, gold trim and pauldrons floating in
// empty space, held together by nothing.  It survived ~1,200 commits because
// nothing ever asked the art whether it was still solid.
//
// ★★ CANON (aov-chroma-key-canon): the key is MAGENTA or NEON GREEN.  Never
//   black, never white, never "whatever colour the corner happens to be" — a
//   corner-sniffing baker will happily key a character's own wardrobe.
//
// ★ WHY SOLIDITY, AND WHY VERSUS SIBLINGS.  There is no absolute solidity a
//   sprite must hit: a skateboard pose is legitimately airier than a crouch,
//   and a winged form airier still.  But the SAME character in the SAME
//   costume across a bank of action sheets is solid to within a few points.
//   So the test is relative — a sheet that is far emptier than its own
//   siblings has lost body pixels, and that is a claim about art, not taste.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

// ── alpha-only PNG reader · IHDR + zlib, no dependencies ────────────────
function readAlpha(p){
  const b = fs.readFileSync(p);
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const bitDepth = b[24], colorType = b[25];
  if (colorType !== 6 || bitDepth !== 8) return null;   // ★ RGBA8 only · else no alpha to judge
  let idat = [], off = 8;
  while (off < b.length){
    const len = b.readUInt32BE(off), typ = b.toString('ascii', off+4, off+8);
    if (typ === 'IDAT') idat.push(b.slice(off+8, off+8+len));
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = 4, stride = w * ch, px = Buffer.alloc(h * stride);
  let pos = 0;
  for (let y = 0; y < h; y++){
    const ft = raw[pos++]; const line = raw.slice(pos, pos + stride); pos += stride;
    const cur = px.slice(y*stride, (y+1)*stride), prv = y ? px.slice((y-1)*stride, y*stride) : null;
    for (let i = 0; i < stride; i++){
      const a = i >= ch ? cur[i-ch] : 0, bb = prv ? prv[i] : 0, c = (prv && i >= ch) ? prv[i-ch] : 0;
      let v = line[i];
      if (ft === 1) v += a; else if (ft === 2) v += bb; else if (ft === 3) v += (a+bb)>>1;
      else if (ft === 4){ const pa=Math.abs(bb-c), pb=Math.abs(a-c), pc=Math.abs(a+bb-2*c);
        v += (pa<=pb && pa<=pc) ? a : (pb<=pc ? bb : c); }
      cur[i] = v & 255;
    }
  }
  return { w, h, px };
}

// ★ solidity of the FIRST CELL: what fraction of the pose's own tight bounding
//   box is still art.  Measured on one cell rather than the sheet, because a
//   4x4 sheet is mostly gutter and the gutter would drown the signal.
function solidity(p){
  const im = readAlpha(p);
  if (!im) return null;
  const cw = im.w >> 2, chh = im.h >> 2;             // ★ the 4x4 standard
  let x0 = cw, y0 = chh, x1 = -1, y1 = -1, n = 0;
  for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++){
    if (im.px[(y*im.w + x)*4 + 3] > 0){
      n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return null;
  return n / ((x1 - x0 + 1) * (y1 - y0 + 1));
}

// ★★ the banks worth policing: a folder of action sheets for ONE character in
//   ONE costume.  Add a line here whenever a new bank lands.
//
// ★★★ NOT rizer/.  87 sheets, but they are not comparable to each other: the
//   bank mixes poses with VFX sheets (astralstrike-projectile), weapon swings
//   (sapphire-sword-combo) and raw un-keyed green masters.  A block pose is
//   legitimately half the solidity of an idle.  Running solidity across that
//   bank produces confident nonsense, so it is deliberately excluded rather
//   than tuned until it is quiet — a suite should make one claim it can defend.
const BANKS = [
  ['Zoryn action bank',  'assets/2D sprites/zoryn'],
];

// ★★★ AGAINST THE BEST SIBLING, NOT THE MEDIAN.  The first version of this
//   test compared each sheet to the bank median and passed all seven — because
//   FOUR of the seven are the broken ones, so the median WAS the damage.  Same
//   shape as a crashed suite reporting nothing: when the defect is the
//   majority, an average-based test calls it normal.  The most solid sibling
//   is the only reading in the bank that cannot have been hollowed.
const TOLERANCE = 0.75;   // ★ no sheet may be under 75% as solid as its bank's best

H('★ HOLLOW-SHEET GUARD · no sheet may be far emptier than its own siblings');
for (const [label, dir] of BANKS){
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)){ ok(false, `${label}: ${dir} is missing`); continue; }
  const rows = [];
  for (const nm of fs.readdirSync(abs).sort()){
    if (!nm.endsWith('.png')) continue;
    let s = null;
    try { s = solidity(path.join(abs, nm)); } catch (e) { s = null; }
    // ★ a fully solid cell was never keyed at all — a raw master parked beside
    //   the ported sheets.  It is not evidence about the port either way.
    if (s != null && s < 0.999) rows.push([nm, s]);
  }
  if (rows.length < 3){ ok(false, `${label}: only ${rows.length} readable sheets — cannot compare`); continue; }
  const best = Math.max(...rows.map(r => r[1]));
  H(`  ${label} · ${rows.length} sheets · best sibling ${(100*best).toFixed(1)}%`);
  for (const [nm, s] of rows){
    const ratio = s / best;
    ok(ratio >= TOLERANCE,
       `${nm.padEnd(16)} ${(100*s).toFixed(1)}%  (${(100*ratio).toFixed(0)}% of best)` +
       (ratio >= TOLERANCE ? '' : '  ← HOLLOW · the key ate the character'));
  }
}

H(f ? `❌ ${f} failed` : '✅ all sheets solid');
process.exit(f ? 1 : 0);
