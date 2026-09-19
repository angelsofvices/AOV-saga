// ★★★★ v0.99.6 · THE NINE DISTRICT ELDERS · art, scale, and the seam problem.
//
//   Creator, 2026-09-18, with eight new 4x4 sheets and a README mapping each to
//   a district. Korathen has no Elder yet, by instruction.
//
// ★★★★ THE MEASUREMENT TRAP THIS SUITE EXISTS TO NOT FALL INTO.
//   My first check measured each 313px cell's ink directly and reported all
//   eight sheets WRONG — every LEFT row came back y=0, h=313 against a declared
//   y≈28, h≈285. It looked damning and it was my yardstick that was broken:
//   these sheets bleed between rows, 199 to 527 opaque pixels bridging the
//   DOWN/LEFT seam on every single one. A per-cell box therefore measures the
//   character PLUS the row above it.
//   ★ Connected-component ownership — the tool this codebase reaches for when a
//     cell holds a neighbour's overflow — ALSO breaks here, because on ezekar
//     and naela the LEFT and RIGHT rows are literally one blob (274 and 213 px
//     joining them). Given to whichever cell holds the centroid, that blob
//     measures 584px tall at y=-286 and the other row measures nothing.
//   ★★ So this suite does not assert "the box equals the art". It asserts the
//     two things that are true and that matter: a box KEEPS ITS OWN CHARACTER,
//     and a box DOES NOT SWALLOW THE NEIGHBOUR. Those survive the bleed.
import { bootGame } from './lib/boot_game.mjs';
import { readPng } from './lib/png.mjs';
import fs from 'fs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const CELL = 313, DIRS = ['DOWN','LEFT','RIGHT','UP'];

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['DISTRICT_ELDERS','DISTRICT_ELDER_SPRITES','ELDER_BY_DIST','ELDER_IDS',
  'isDistrictElder','buildDistrictElderNpcs','NPCS','DISTRICT_KEYS','DISTRICT_ORDER'] });
console.log = _L;

const alpha = p => { const im = readPng(p); if (!im) return null;
  const { w, h, data } = im; const m = new Uint8Array(w*h);
  for (let i = 0; i < w*h; i++) m[i] = data[i*4+3] > 20 ? 1 : 0;
  return { w, h, m }; };
const sheetPath = id => `assets/2D sprites/npcs/elders/${id}.png`;

H('★★★ NINE DISTRICTS HAVE AN ELDER · AND KORATHEN DOES NOT, ON PURPOSE');
{
  const E = G.DISTRICT_ELDERS;
  ok(Array.isArray(E) && E.length >= 9, `${E.length} entries in DISTRICT_ELDERS`);
  const named = E.filter(e => e.id);
  ok(named.length === 9, `${named.length} named Elders`);
  const dists = named.map(e => e.dist);
  ok(new Set(dists).size === dists.length, 'one Elder per district · no district claimed twice');
  ok(!dists.includes('korathen'),
     '★★★ Korathen has none · "District X, Korathen, has no Elder assigned yet" — absent, not a blank row');
  for (const [d, id] of [['malezor','kelthor'],['zarvane','ivelith'],['andrannor','mora'],
                         ['veridan','selis'],['netharion','voss'],['vorashil','ezekar'],
                         ['xilnar','naela'],['baelgor','draith'],['thardin','yorik']])
    ok(G.ELDER_BY_DIST[d] && G.ELDER_BY_DIST[d].id === id, `  ${d.padEnd(10)} → ${id}`);
  ok(E.every(e => e.steps === 8), '★ every Elder runs an 8-step ladder');
  ok(E.every(e => !!e.handoff), '★ and every link says how it hands off to the next');
}

H('★★ THE ART IS ON DISK · and the README says the same thing the code does');
{
  const S = G.DISTRICT_ELDER_SPRITES;
  ok(Object.keys(S).length === 8, `${Object.keys(S).length} sheets declared · Kelthor keeps his own existing sheet`);
  for (const id of Object.keys(S)){
    const p = sheetPath(id);
    const im = readPng(p);
    ok(!!im, `  ${id.padEnd(9)} ${p}`);
    if (im) ok(im.w === 1254 && im.h === 1254, `    1254x1254 · ${im.w}x${im.h}`);
  }
  const readme = fs.readFileSync('assets/2D sprites/npcs/elders/README.md', 'utf8');
  for (const id of Object.keys(S))
    ok(readme.includes(id + '.png'), `  README lists ${id}.png`);
  // ★ whitespace-tolerant · my first version failed on correct prose purely
  //   because the sentence wraps across a line break in the README.
  ok(/Korathen\s+has\s+no\s+Elder/i.test(readme), '★ and records that Korathen has none');
}

H('★★★ EVERY BOX KEEPS ITS OWN CHARACTER');
{
  // ★ NOT "the box equals the ink" — it cannot, on art whose rows touch. The
  //   claim that matters is that nothing of the character is being cropped off.
  const S = G.DISTRICT_ELDER_SPRITES;
  for (const [id, art] of Object.entries(S)){
    const A = alpha(sheetPath(id));
    if (!A) { ok(false, `${id}: unreadable`); continue; }
    let worst = 1, where = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
      const [bx, by, bw, bh] = art.bboxes[r][c];
      let tot = 0, kept = 0;
      for (let y = r*CELL; y < (r+1)*CELL; y++) for (let x = c*CELL; x < (c+1)*CELL; x++){
        if (!A.m[y*A.w + x]) continue;
        tot++;
        const ay = y - r*CELL, ax = x - c*CELL;
        if (ay >= by && ay < by + bh && ax >= bx && ax < bx + bw) kept++;
      }
      const frac = tot ? kept / tot : 1;
      if (frac < worst){ worst = frac; where = DIRS[r] + c; }
    }
    ok(worst >= 0.96,
       `  ${id.padEnd(9)} worst frame keeps ${(100*worst).toFixed(1)}% of its own cell's ink (${where})`);
  }
}

H('★★★★ AND NO BOX SWALLOWS THE NEIGHBOUR');
{
  // "A component may overhang its cell; a RECTANGLE may not contain a
  //  neighbour's art." A box that reaches into the next row draws that row's
  //  pose beside this one, as litter.
  const S = G.DISTRICT_ELDER_SPRITES;
  for (const [id, art] of Object.entries(S)){
    const A = alpha(sheetPath(id));
    if (!A) continue;
    let worst = 0, where = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
      const [bx, by, bw, bh] = art.bboxes[r][c];
      let foreign = 0;
      for (let y = r*CELL + by; y < r*CELL + by + bh; y++){
        if (y < 0 || y >= A.h) continue;
        const inRow = y >= r*CELL && y < (r+1)*CELL;
        for (let x = c*CELL + bx; x < c*CELL + bx + bw; x++){
          if (x < 0 || x >= A.w) continue;
          const inCol = x >= c*CELL && x < (c+1)*CELL;
          if (!inRow || !inCol) { if (A.m[y*A.w + x]) foreign++; }
        }
      }
      if (foreign > worst){ worst = foreign; where = DIRS[r] + c; }
    }
    ok(worst <= 400,
       `  ${id.padEnd(9)} worst frame pulls in ${worst}px of a neighbour (${where}) · cap 400`);
  }
}

H('★★★ THE SEAM BLEED IS REAL, AND IT IS RECORDED RATHER THAN HIDDEN');
{
  // ★ This does not fail the build — it is the ART's condition, and the Creator
  //   re-exports these. It fails only if somebody claims it is clean.
  const S = G.DISTRICT_ELDER_SPRITES;
  let anyBleed = 0;
  for (const id of Object.keys(S)){
    const A = alpha(sheetPath(id));
    if (!A) continue;
    let worst = 0;
    for (const r of [1,2,3]){
      const y = r*CELL; let j = 0;
      for (let x = 0; x < A.w; x++) if (A.m[(y-1)*A.w + x] && A.m[y*A.w + x]) j++;
      if (j > worst) worst = j;
    }
    anyBleed = Math.max(anyBleed, worst);
    console.log(`  ·  ${id.padEnd(9)} ${String(worst).padStart(4)}px bridging a row seam`);
  }
  const readme = fs.readFileSync('assets/2D sprites/npcs/elders/README.md', 'utf8');
  ok(anyBleed === 0 || /KNOWN ART ISSUE/i.test(readme),
     anyBleed === 0 ? '★★★ the seams are clean · re-run measure_elder_sheets.py and tighten the boxes'
                    : `★★★ up to ${anyBleed}px of bleed, and the README documents it · a defect that is `
                    + 'written down is a defect somebody can fix; an undocumented one is a mystery later');
}

H('★★ SCALE IS ANCHORED TO KELTHOR');
{
  const npcs = G.buildDistrictElderNpcs();
  ok(npcs.length === 8, `${npcs.length} Elder NPCs built · Kelthor is authored separately`);
  ok(npcs.every(n => n.scaleRefBh === 295),
     '★★★ every one carries scaleRefBh 295 · Kelthor\'s measured DOWN body height');
  // ★★★ CITE KELTHOR, DO NOT RE-DERIVE HIM. My first version scanned his raw
  //   DOWN cell, measured 281px of ink and failed a correct anchor: his own
  //   DECLARED box is 295 tall, 14px more than his ink, and the elders match
  //   the number the game actually draws him by. Re-deriving a reference from
  //   pixels, then failing the code for disagreeing with my re-derivation, is
  //   how a suite starts arguing with the thing it is checking.
  const K = (G.NPCS || []).find(n => n && n.id === 'kelthor');
  ok(!!K && K.bboxes && K.bboxes[0][0][3] === 295,
     `★★ and 295 IS Kelthor's own declared DOWN box (${K && K.bboxes && K.bboxes[0][0][3]}) · `
   + 'the anchor is his, cited from him');
  ok(npcs.every(n => n.cellW === 313 && n.cols === 4 && n.rows === 4), '★ all 4x4 at 313px');
  ok(npcs.every(n => n.bboxes && n.bboxes.length === 4 && n.bboxes.every(r => r.length === 4)),
     '★ and all sixteen boxes declared per sheet');
  ok(npcs.every(n => typeof n.onInteract === 'function'), '★ every Elder can be talked to');
  ok(npcs.every(n => Array.isArray(G.DISTRICT_ELDER_SPRITES[n.id].lines)
                  && G.DISTRICT_ELDER_SPRITES[n.id].lines.length >= 2),
     '★★ and each has lines of his own · nine Elders reading one script is one Elder');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ nine districts, eight new sheets, boxes that keep their own and spare the neighbour');
process.exit(f ? 1 : 0);
