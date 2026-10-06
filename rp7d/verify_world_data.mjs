// RP7D · world-data checks. Run: node rp7d/verify_world_data.mjs [path/to/original-world-data.js]
// With an original file, Malezor is also compared against it (it must not have moved).
import { pathToFileURL } from 'node:url';
import * as W from './world-data.js';

let fails = 0;
const check = (ok, msg) => { if (!ok) { fails++; console.log('  ✗ ' + msg); } return ok; };
const warn = (ok, msg) => { if (!ok) console.log('  ! ' + msg + ' (hand-placed, left as is)'); return ok; };
const P = (tx, ty) => W.fromRP7B(tx, ty);

console.log('· canon names, order, Gemlords');
const canon = [['malezor', 'I', 'rakoron'], ['zarvane', 'II', 'ivirium'], ['andrannor', 'III', 'mutaryn'], ['veridan', 'IV', 'emeralix'], ['netharion', 'V', 'eurakeon'],
  ['vorashil', 'VI', 'azurel'], ['xilnar', 'VII', 'obsidius'], ['baelgor', 'VIII', 'ambrevon'], ['thardin', 'IX', 'oathane'], ['korathen', 'X', 'oatheus']];
check(W.DISTRICTS.length === 10, `10 districts (got ${W.DISTRICTS.length})`);
canon.forEach(([id, n, g], i) => { const d = W.DISTRICTS[i]; check(d.id === id && d.numeral === n && d.gemlord.id === g, `#${i + 1} is ${id} ${n} ${g} (got ${d.id} ${d.numeral} ${d.gemlord?.id})`); });

console.log('· patrols: on their own land, clear of the home tile, density live');
for (const d of W.DISTRICTS) {
  const home = P(d.enemyHomeTile.x, d.enemyHomeTile.y);
  const all = [...d.seerPatrols.map(p => ['seer', p]), ...d.moriPatrols.map(p => [p.mode || 'mori', p])];
  let n = 0;
  for (const [kind, p] of all) for (const [x, z] of p.pts) {
    n++;
    (d === W.MALEZOR ? warn : check)(d.containsLand(x, z), `${d.id} ${kind} ${p.id} point (${x.toFixed(1)}, ${z.toFixed(1)}) is off ${d.district}'s coast`);
    if (d !== W.MALEZOR) check(W.worldDistrictAt(x, z) === d.id, `${d.id} ${kind} ${p.id} point resolves to ${W.worldDistrictAt(x, z)}`);
    check(Math.hypot(x - home.x, z - home.z) >= 44, `${d.id} ${kind} ${p.id} point is inside the 44-unit no-spawn ring`);
  }
  check(d.enemyDensity.at(-1).chance > 0, `${d.id} enemyDensity spawns nothing`);
  const daemons = d.moriPatrols.filter(p => p.mode === 'daemon').length;
  check(d.id === 'malezor' ? daemons === 0 : daemons >= 1, `${d.id} daemon count ${daemons}`);
  for (const [q, z] of Object.entries(d.wildZones)) check(d.containsLand(z.x, z.z), `${d.id} wild zone ${q} is off the coast`);
  check(Object.keys(d.wildZones).length === 4, `${d.id} has ${Object.keys(d.wildZones).length} wild zones`);
  for (const z of Object.values(d.wildZones)) { const q = W.quarterAt(z.x, z.z, d); check(d.regions[q] === z.label, `${d.id} zone "${z.label}" sits in quarter ${q}`); }
  console.log(`  ${d.numeral.padEnd(4)} ${d.district.padEnd(10)} ${String(n).padStart(3)} patrol points · ${d.seerPatrols.length} seer · ${d.moriPatrols.length - daemons} mori · ${daemons} daemon`);
}

console.log('· Z traversal: every step centre → centre is on land');
for (const r of W.ROUTES) {
  const a = W.DISTRICT_BY_ID[r.from].center, b = W.DISTRICT_BY_ID[r.to].center, len = Math.hypot(b.x - a.x, b.z - a.z);
  let seen = [], gap = 0;
  for (let s = 0; s <= len; s += 0.5) {
    const x = a.x + (b.x - a.x) * s / len, z = a.z + (b.z - a.z) * s / len, id = W.worldDistrictAt(x, z);
    if (id === 'beyond') gap++;
    else if (seen.at(-1) !== id) seen.push(id);
  }
  check(gap === 0, `${r.name}: ${gap} steps off land`);
  check(seen.join('>') === `${r.from}>${r.to}`, `${r.name}: walked ${seen.join(' > ')}`);
  console.log(`  ${r.from} → ${r.to}  ${gap ? '✗' : '✓'}  ${r.name}`);
}

const orig = process.argv[2];
if (orig) {
  console.log('· Malezor regression against', orig);
  const O = await import(pathToFileURL(orig).href);
  const strip = o => JSON.stringify(o, (k, v) => typeof v === 'function' ? undefined : v === Infinity ? 'Inf' : v);
  const { gemlord, levels, ...now } = W.MALEZOR;
  check(strip(now) === strip(O.MALEZOR), 'MALEZOR data changed');
  let diff = 0;
  for (let x = -330; x <= 330; x += 3) for (let z = -330; z <= 330; z += 3) {
    if (W.quarterAt(x, z) !== O.quarterAt(x, z) || W.districtAt(x, z) !== O.districtAt(x, z) || W.sectionAt(x, z) !== O.sectionAt(x, z)) diff++;
  }
  check(diff === 0, `Malezor quarterAt / districtAt / sectionAt differ at ${diff} points`);
  if (!diff) console.log('  ✓ Malezor identical (data, quarters, district, sections)');
}

console.log(fails ? `\n${fails} check(s) failed` : '\nall checks passed');
process.exit(fails ? 1 : 0);
