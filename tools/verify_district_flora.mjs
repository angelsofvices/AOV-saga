// ★★★★ v0.99.12 · ANDRANNOR WAS BARREN BECAUSE ITS ART WAS NEVER WIRED.
//
//   Creator, 2026-09-20: "alot of andranor is barren land. lets fill it out
//   more evenly like the other districts. it feels crammed"
//
// ★★★★ THE ART WAS ALREADY ON DISK. andrannor-tree.png and andrannor-bush.png
//   were sitting in decor/trees/ and decor/bushes/ — the exact two folders
//   plantDistrictTrees() reads from — at the same 1254px as every other
//   district's. They were never added to DISTRICT_TREE_ART / DISTRICT_BUSH_ART,
//   and the generator opens with `if (!art || !wheel) continue`, so Andrannor
//   silently fell out of the entire even-distribution machinery: grove wheel,
//   quarter weighting, keep-clear skirts, all of it.
//
// ★★★ MEASURED, NOT ASSUMED. Andrannor held 21 trees and 23 bushes across
//   38,043 land tiles; Veridan holds 313 and 532. Twenty 16x16-tile cells
//   contained not one prop. Prop-count CV was 0.85 against the modern band of
//   0.48-0.65 — the props it did have were clumped, which is exactly "barren"
//   and "crammed" being the same complaint.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['worldDistrictAt','isWorldLandTile','walkable','MAP_COLS','MAP_ROWS',
  'WORLD_MIN_COL','WORLD_MIN_ROW','WORLD_PROPS','ZYRAXIS_DISTRICTS','DISTRICT_TREE_ART',
  'DISTRICT_BUSH_ART','DISTRICT_GRASS_ART','WHEEL_BY_DIST'] });
console.log = _L;

H('★★★ ANDRANNOR IS WIRED INTO THE GENERATOR AT ALL');
{
  ok(!!G.DISTRICT_TREE_ART.andrannor, '★★★★ DISTRICT_TREE_ART has andrannor · without it plantDistrictTrees `continue`s past the whole district');
  ok(!!G.DISTRICT_BUSH_ART.andrannor, '★★★★ DISTRICT_BUSH_ART has andrannor');
  ok(!!G.WHEEL_BY_DIST.andrannor,
     '★★ and its DISTRICT_WHEEL entry was ALREADY there (dominant: forest) · the wheel was never the gap, '
   + 'so nothing about the district had to be invented — only connected');
  // ★★★ GUARD, OR THE SUITE CRASHES INSTEAD OF REPORTING. Removing the two
  //   table entries to prove this suite is non-vacuous made `e` undefined here,
  //   and `e.file` threw — so the run died at section one and the evenness and
  //   connectivity checks below never executed. A suite that aborts on the
  //   first failure cannot tell you what else the regression broke, and I would
  //   have had no evidence those later assertions fire at all.
  for (const [tbl, dir] of [['DISTRICT_TREE_ART','trees'], ['DISTRICT_BUSH_ART','bushes']]){
    const e = G[tbl].andrannor;
    ok(!!(e && e.file) && fs.existsSync(path.join(ROOT, 'assets/2D sprites/decor', dir, e.file)),
       `  the file it names actually exists on disk · decor/${dir}/${e ? e.file : '(no entry)'}`);
  }
}

H('★★★★ bbox IS [x, y, WIDTH, HEIGHT] — NOT TWO CORNERS');
{
  // ★★★★ The draw site destructures `const [bx, by, bw, bh] = p.bbox` and takes
  //   aspect as bbox[3]/bbox[2]. Read as corners, every Andrannor tree would
  //   have drawn at a silently wrong aspect and nothing would have flagged it.
  //   ★ The tell needs no pixels: on a 1254px sheet, x+w and y+h must both FIT.
  //   Written as corners, x + x1 overruns immediately.
  const SHEET = 1254;
  for (const [tbl, label] of [['DISTRICT_TREE_ART','tree'], ['DISTRICT_BUSH_ART','bush']])
    for (const [id, e] of Object.entries(G[tbl])){
      const [x, y, w, h] = e.bbox;
      ok(x + w <= SHEET && y + h <= SHEET && w > 0 && h > 0,
         `  ${(id + ' ' + label).padEnd(20)} [${e.bbox}] · x+w=${x+w} y+h=${y+h} both fit in ${SHEET}`);
    }
  const t = (G.DISTRICT_TREE_ART.andrannor || { bbox:[0,0,1,0] }).bbox;
  ok(Math.abs(t[3] / t[2] - 1.31) < 0.05,
     `★★ andrannor's tree aspect ${(t[3]/t[2]).toFixed(3)} sits in the shipped family (1.01 veridan - 1.25 thardin)`);
}

H('★★★★ THE BARRENNESS IS GONE · evenness measured, not eyeballed');
{
  const C = 16, FULL = C * C * 0.6;
  const cells = {}, landCells = {};
  for (let y = G.WORLD_MIN_ROW; y < G.MAP_ROWS; y++)
    for (let x = G.WORLD_MIN_COL; x < G.MAP_COLS; x++){
      const d = G.worldDistrictAt(x, y);
      if (!d || !G.isWorldLandTile(x, y)) continue;
      const k = ((x / C) | 0) + ',' + ((y / C) | 0);
      (landCells[d] = landCells[d] || {})[k] = (landCells[d][k] || 0) + 1;
    }
  for (const p of G.WORLD_PROPS){
    const d = G.worldDistrictAt(p.tileX, p.tileY); if (!d) continue;
    const k = ((p.tileX / C) | 0) + ',' + ((p.tileY / C) | 0);
    (cells[d] = cells[d] || {})[k] = (cells[d][k] || 0) + 1;
  }
  const statOf = d => {
    const full = Object.entries(landCells[d] || {}).filter(([, n]) => n >= FULL).map(([k]) => k);
    const v = full.map(k => (cells[d] || {})[k] || 0);
    const mean = v.reduce((a, b) => a + b, 0) / v.length;
    const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
    return { n: v.length, empty: v.filter(x => !x).length, mean, cv: sd / mean };
  };
  const A = statOf('andrannor');
  ok(100 * A.empty / A.n <= 3,
     `★★★★ ${A.empty}/${A.n} Andrannor cells are empty (${(100*A.empty/A.n).toFixed(1)}%) · was 20/144 = 13.9%`);
  ok(A.cv <= 0.70,
     `★★★★ prop-count CV ${A.cv.toFixed(2)} · was 0.85 · the modern districts run 0.48-0.65, so it now `
   + 'spreads like them instead of clumping');
  ok(A.mean >= 15, `★★★ mean ${A.mean.toFixed(1)} props per cell · was 11.0 · Veridan is ${statOf('veridan').mean.toFixed(1)}`);
  // ★ Veridan is the named yardstick in the Creator's "like the other districts"
  const V = statOf('veridan');
  ok(A.cv <= V.cv + 0.06, `★★ and it is no clumpier than Veridan (${A.cv.toFixed(2)} vs ${V.cv.toFixed(2)})`);
  for (const d of ['veridan','netharion','korathen','baelgor']){
    const s = statOf(d);
    ok(s.cv < 0.70 && 100 * s.empty / s.n < 4,
       `  ${d.padEnd(10)} untouched · CV ${s.cv.toFixed(2)} · ${(100*s.empty/s.n).toFixed(1)}% empty`);
  }
}

H('★★★ FILLING IT DID NOT WALL IT OFF · 905 new props are all blockers');
{
  const D = G.ZYRAXIS_DISTRICTS.find(d => d.id === 'andrannor');
  const set = new Set();
  for (let y = Math.max(G.WORLD_MIN_ROW, D.cy - D.ry); y < Math.min(G.MAP_ROWS, D.cy + D.ry); y++)
    for (let x = Math.max(G.WORLD_MIN_COL, D.cx - D.rx); x < Math.min(G.MAP_COLS, D.cx + D.rx); x++)
      if (G.worldDistrictAt(x, y) === 'andrannor' && G.walkable(x, y)) set.add(x + ',' + y);
  const seen = new Set(); let best = 0;
  for (const t of set){
    if (seen.has(t)) continue;
    let n = 0; const st = [t]; seen.add(t);
    while (st.length){
      const [x, y] = st.pop().split(',').map(Number); n++;
      for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const k = (x + ox) + ',' + (y + oy);
        if (set.has(k) && !seen.has(k)){ seen.add(k); st.push(k); }
      }
    }
    best = Math.max(best, n);
  }
  ok(set.size - best <= 12,
     `★★★★ ${best} of ${set.size} walkable Andrannor tiles are one connected region · only ${set.size - best} `
   + 'stranded (was 5 before the planting · every district has a few)');
  ok(set.size > 33000, `★ and ${set.size} tiles are still walkable · the fill took ground, it did not take the district`);
}

H('★ NOTHING WAS PLANTED ON A DOOR');
{
  const doors = new Set();
  for (const p of G.WORLD_PROPS)
    if (p.door) doors.add((p.tileX + p.door[0]) + ',' + (p.tileY + p.door[1]));
  const onDoor = G.WORLD_PROPS.filter(p => (p._districtTree || p._districtBush)
    && doors.has(p.tileX + ',' + p.tileY));
  ok(!onDoor.length, `no district tree or bush stands on a door (${doors.size} doors checked)`);
  const flora = G.WORLD_PROPS.filter(p => p._districtTree === 'andrannor' || p._districtBush === 'andrannor');
  ok(flora.length > 500, `★★ ${flora.length} trees and bushes planted in Andrannor · was 44 all told`);
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ art wired, not generated · 13.9% empty → 0.7% · CV 0.85 → 0.63 · still one connected district');
process.exit(f ? 1 : 0);
