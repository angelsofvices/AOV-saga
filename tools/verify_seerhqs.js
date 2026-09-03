// ★ v0.95.942 · the ten district-flavoured Seer HQs
// Guards the three things that could silently regress: every district gets its
// OWN art, they all share ONE bbox (so the footprint stays uniform), and the
// old generic building is no longer referenced by any HQ.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
let fail = 0;
const ok  = m => console.log('  ok   ' + m);
const bad = m => { console.log('  FAIL ' + m); fail++; };

const DISTS = ['malezor','zarvane','andrannor','veridan','netharion',
               'vorashil','xilnar','baelgor','thardin','korathen'];

// 1 · ten keyed assets on disk, each with real transparency
for (const d of DISTS){
  const p = path.join(ROOT, 'assets/2D sprites/buildings', `seer-hq-${d}.png`);
  if (!fs.existsSync(p)) { bad(`asset missing · seer-hq-${d}.png`); continue; }
  if (fs.statSync(p).size < 50000) bad(`asset suspiciously small · seer-hq-${d}.png`);
}
if (!fail) ok(`ten district assets present`);

// 2 · the union bbox is wired, and it is the union — not the old generic rect
const m = html.match(/const SEER_HQ_BBOX = \[(\d+), (\d+), (\d+), (\d+)\]/);
if (!m) bad('SEER_HQ_BBOX not found');
else {
  const got = m.slice(1,5).map(Number);
  const want = [88, 28, 1197, 1064];
  if (got.join() !== want.join()) bad(`SEER_HQ_BBOX is [${got}] · expected the union [${want}]`);
  else ok('SEER_HQ_BBOX is the union of all ten');
}

// 3 · per-district src helper exists and both call sites use it
if (!/const SEER_HQ_SRC = d =>/.test(html)) bad('SEER_HQ_SRC helper missing');
else ok('SEER_HQ_SRC helper present');
if (!/img: seerHqImg\(H\.dist\)/.test(html)) bad('buildSeerHqProps does not use per-district art');
else ok('buildSeerHqProps uses per-district art');
if (!/const img = seerHqImg\('malezor'\)/.test(html)) bad("Malezor's HQ does not use per-district art");
else ok("Malezor's HQ uses per-district art");

// 4 · ★ the generic building is no longer referenced by ANY seer hq.
//     (It may still exist on disk; what matters is that nothing points at it.)
const genericRefs = [...html.matchAll(/buildings\/seer-hq\.png/g)].length;
if (genericRefs) bad(`generic seer-hq.png still referenced ${genericRefs}x`);
else ok('generic seer-hq.png no longer referenced');

// ★ 6 · GROUND_STOREY_FOOTPRINTS is keyed by SRC — splitting one asset into ten
//       orphaned every HQ's entry with nothing throwing.  Never again.
let gsMissing = [];
for (const d of DISTS){
  const key = `assets/2D%20sprites/buildings/seer-hq-${d}.png|8x7`;
  if (!html.includes(`'${key}'`)) gsMissing.push(d);
}
if (gsMissing.length) bad(`GROUND_STOREY_FOOTPRINTS missing: ${gsMissing.join(', ')}`);
else ok('GROUND_STOREY_FOOTPRINTS has all ten district keys');

// 5 · the shared footprint/tile box is untouched — doors and guard rings depend on it
if (!/tileW: 8, tileH: 7/.test(html)) bad('8x7 tile box changed');
else ok('8x7 tile box intact');

console.log(fail ? `\n${fail} FAILURE(S)` : '\nall seer-hq checks passed');
process.exit(fail ? 1 : 0);
