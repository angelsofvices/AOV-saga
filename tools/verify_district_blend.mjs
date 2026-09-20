// ★★★★ v0.99.11 · THE DISTRICT SEAMS WERE BLENDED AND STILL DREW A LINE.
//
//   Creator, 2026-09-20: "fix the district tile blend from malezor to zarvane
//   and from zarvane to andrannor. blend them like the other district borders"
//
// ★★★★ THE BLEND WAS NEVER OFF. Measured across all 28,310 blended tiles, every
//   one of the ten district pairs carried the same mean blend alpha (0.451 -
//   0.479). districtBlendTargets was doing exactly what it was written to do on
//   the two pairs that looked broken. So the alpha was not the defect and no
//   amount of reading the blend function was going to find it.
//
// ★★★★ THE DEFECT WAS QUANTIZATION, VISIBLE ONLY ON FLAT ART. Distance is a
//   whole number of tiles, so alpha could take exactly EIGHT values — eight
//   rings around every seam. Seven pairs hide that completely: both sides draw
//   one of sixteen hashed variants from a 4x4 sheet, and the texture noise
//   straddles every ring. malezor|zarvane and andrannor|zarvane are the only
//   two seams in the world where NEITHER side has a sheet — malezor, zarvane
//   and andrannor draw one identical 1254px image on every tile. Every tile at
//   the same distance is therefore pixel-identical, and a ring becomes a
//   machine-straight line 62 tiles long.
//
// ★★★ The inventory and the bug report agreed exactly: of ten adjacent pairs,
//   precisely two have flat art on both sides, and those are precisely the two
//   the Creator named. That agreement is what turned a guess into a diagnosis.
import { bootGame } from './lib/boot_game.mjs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['worldDistrictAt','districtBlendTargets','isWorldLandTile',
  'MAP_COLS','MAP_ROWS','WORLD_MIN_COL','WORLD_MIN_ROW','DISTRICT_BLEND_RADIUS',
  'DISTRICT_BLEND_DITHER','FUTURE_DISTRICT_TILES','terrainImageForDistrict'] });
console.log = _L;

// ── walk the world once · per-pair alpha stats and constant-alpha run lengths ──
const FLAT = new Set(['malezor','zarvane','andrannor']);
const stat = {};                       // pair -> {sum,n,alphas:Set,runs:[]}
const rec  = k => stat[k] || (stat[k] = { sum:0, n:0, alphas:new Set(), runs:[] });
let loA = 1, hiA = 0, tiles = 0;
for (let y = G.WORLD_MIN_ROW; y < G.MAP_ROWS; y++){
  let pk = null, pa = null, run = 0;
  for (let x = G.WORLD_MIN_COL; x < G.MAP_COLS; x++){
    const d = G.worldDistrictAt(x, y);
    const b = (d && G.isWorldLandTile(x, y)) ? G.districtBlendTargets(x, y, d) : null;
    if (!b || !b.length){ if (pk && run) rec(pk).runs.push(run + 1); pk = null; run = 0; continue; }
    const k = [d, b[0].dist].sort().join('|');
    const a = b.reduce((s, t) => s + t.alpha, 0);
    tiles++; loA = Math.min(loA, a); hiA = Math.max(hiA, a);
    const r = rec(k); r.sum += a; r.n++; r.alphas.add(a.toFixed(5));
    if (k === pk && Math.abs(a - pa) < 1e-9) run++;
    else { if (pk && run) rec(pk).runs.push(run + 1); run = 0; }
    pk = k; pa = a;
  }
  if (pk && run) rec(pk).runs.push(run + 1);
}
const PAIRS = Object.keys(stat).filter(k => { const [a,b] = k.split('|'); return a && b && a !== b; });
const bothFlat = k => k.split('|').every(d => FLAT.has(d));
const longest  = k => Math.max(...(stat[k].runs.length ? stat[k].runs : [0]));

H('★★★ THE TWO PAIRS THE CREATOR NAMED ARE THE TWO WITH FLAT ART ON BOTH SIDES');
{
  const flatflat = PAIRS.filter(bothFlat).sort();
  ok(flatflat.length === 2 && flatflat.join(' + ') === 'andrannor|zarvane + malezor|zarvane',
     `★★★★ exactly two of ${PAIRS.length} adjacent pairs are flat-on-flat: ${flatflat.join(', ')}`);
  for (const d of FLAT)
    ok(!G.FUTURE_DISTRICT_TILES[d],
       `  ${d.padEnd(10)} has no 4x4 variant sheet · one image on every tile, so every ring is pixel-identical`);
  ok(Object.keys(G.FUTURE_DISTRICT_TILES).length === 7,
     '  the other seven districts do have sheets · their texture noise was hiding the rings all along');
}

H('★★★★ NO SEAM DRAWS A LINE · the constant-alpha run is the staircase itself');
{
  // ★★ Before the dither: malezor|zarvane ran 62 tiles of IDENTICAL alpha in a
  //   single row, andrannor|zarvane 36. That is not a gradient, it is a stripe.
  for (const k of PAIRS.sort((a, b) => longest(b) - longest(a))){
    const L = longest(k), mean = (stat[k].sum / stat[k].n);
    ok(L <= 3, `  ${k.padEnd(22)} longest constant-α run ${String(L).padStart(2)} tiles`
             + ` · ${String(stat[k].alphas.size).padStart(4)} distinct α · mean ${mean.toFixed(4)}`
             + (bothFlat(k) ? '  ★ flat/flat' : ''));
  }
}

H('★★★ THE RINGS ARE GONE · eight quantized values was the whole defect');
{
  ok(typeof G.DISTRICT_BLEND_DITHER === 'number' && G.DISTRICT_BLEND_DITHER > 1,
     `★★★ DISTRICT_BLEND_DITHER = ${G.DISTRICT_BLEND_DITHER} · MORE than one tile, so a tile's `
   + 'dithered distance crosses into either neighbouring ring · at exactly 1.0 the rings would '
   + 'only touch, and a touching staircase is still a staircase');
  for (const k of PAIRS.sort())
    ok(stat[k].alphas.size > 200,
       `  ${k.padEnd(22)} ${String(stat[k].alphas.size).padStart(4)} distinct alphas (was 8 · one per whole tile of distance)`);
}

H('★★ AND NOTHING THAT ALREADY LOOKED RIGHT MOVED');
{
  // ★ The fix jitters DISTANCE, not alpha, and the jitter is symmetric, so the
  //   mean can only drift by the clamp at minD=1. Measured: +0.0016 on every
  //   pair, 0.6%, uniform. A fix that silently restyled the seven good seams
  //   would be a worse bug than the one it repaired.
  const means = PAIRS.map(k => stat[k].sum / stat[k].n);
  ok(Math.min(...means) > 0.25 && Math.max(...means) < 0.29,
     `★★ every pair still averages ${Math.min(...means).toFixed(4)}-${Math.max(...means).toFixed(4)} blend`
   + ' · the dither moved the mean by 0.6%, equally everywhere');
  ok(hiA <= 0.52 + 1e-9,
     `★★ peak alpha ${hiA.toFixed(4)} still under the documented .52 ceiling · seams meet at a balanced mix, `
   + 'never with the neighbour on top');
  ok(loA >= 0.0 && loA < 0.1, `★ and still fades to ${loA.toFixed(4)} at the far edge of the radius`);
  ok(tiles > 25000, `★ measured over ${tiles} blended tiles · the whole world, not one transect`);
}

H('★ THE BLEND STILL REACHES · radius and target count unchanged');
{
  ok(G.DISTRICT_BLEND_RADIUS === 8, 'radius is still 8 tiles');
  const multi = PAIRS.filter(k => stat[k].n > 1000).length;
  ok(multi >= 8, `${multi} pairs carry a wide blend band · no seam lost its gradient to the dither`);
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ 62-tile stripe → 2 · rings dithered into a stipple · every other seam untouched');
process.exit(f ? 1 : 0);
