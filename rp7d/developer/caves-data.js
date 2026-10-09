// RP7D · the Zyraxis cave manifest (RP7D Cave System V1.1 · LOCKED canon).
//
// Exactly two caves per district: one Gemlord cave (4 floors) and one natural cave (Ancient · 3 floors in Andrannor,
// Netharion and Xilnar only; Common · 2 floors everywhere else). 20 caves, 63 floors, 12 mountain and 8 canyon.
// Mountain caves ascend from Floor 1; canyon caves descend. Floor 1 is always the overworld entrance.
//
// This file is data only. cave-placement.js finds each cave's place in its district, cave-terrain.js raises the
// mountain or cuts the canyon round its mouth, cave-interior.js builds the one continuous interior.
//
//   prior   the provisional map-image candidate (pixels on the 1429 × 1055 Zyraxis map, from the top-left). A soft
//           preference only, never a constraint (see cave-placement.js · calibration).
//   pinned  an existing landmark that already IS this cave's mouth: placement keeps it exactly where it stands.

export const CAVE_FLOORS = { gemlord: 4, ancient: 3, common: 2 };
export const ANCIENT_DISTRICTS = ['andrannor', 'netharion', 'xilnar'];

// [district, Gemlord, Gemlord cave terrain, natural cave rarity, natural cave terrain, Gemlord prior px, natural prior px, gem colour]
const TABLE = [
  ['malezor',   'Rakoron',  'mountain', 'common',  'canyon',   [160, 85],   [335, 235], '#ff1f3d'],
  ['zarvane',   'Ivirium',  'canyon',   'common',  'canyon',   [195, 490],  [370, 520], '#e9f1ff'],
  ['andrannor', 'Mutaryn',  'mountain', 'ancient', 'canyon',   [545, 375],  [615, 535], '#c06bff'],
  ['veridan',   'Emeralix', 'mountain', 'common',  'mountain', [785, 285],  [905, 420], '#2fd27a'],
  ['netharion', 'Eurakeon', 'canyon',   'ancient', 'canyon',   [740, 555],  [800, 680], '#5d7bff'],
  ['vorashil',  'Azurel',   'mountain', 'common',  'mountain', [465, 735],  [580, 825], '#36b8ff'],
  ['xilnar',    'Obsidius', 'mountain', 'ancient', 'mountain', [620, 945],  [735, 860], '#2b2b38'],
  ['baelgor',   'Ambrevon', 'mountain', 'common',  'canyon',   [835, 815],  [925, 955], '#ffb13b'],
  ['thardin',   'Oathane',  'mountain', 'common',  'canyon',   [1040, 795], [1110, 950], '#d8d2c0'],
  ['korathen',  'Oatheus',  'mountain', 'common',  'mountain', [1235, 790], [1345, 940], '#ffe27a']
];
const title = s => s[0].toUpperCase() + s.slice(1);

export const CAVES = TABLE.flatMap(([district, gemlord, gTerrain, rarity, nTerrain, gPrior, nPrior, gem]) => [
  {
    id: `cave_${district}_gemlord`, districtId: district, gemlord, classification: 'gemlord', rarity: 'gemlord',
    terrainType: gTerrain, verticalDirection: gTerrain === 'mountain' ? 'up' : 'down', floorCount: CAVE_FLOORS.gemlord, entranceFloor: 1,
    name: `${gemlord}'s ${gTerrain === 'mountain' ? 'Peak' : 'Deep'}`, gem, prior: gPrior, layoutSeed: `rp7d-cave-${district}-gemlord-v1`,
    ...(district === 'malezor' ? { pinned: 'rakoron-cave', name: "Rakoron's Ruby Cave" } : {})
  },
  {
    id: `cave_${district}_natural`, districtId: district, gemlord: null, classification: 'natural', rarity,
    terrainType: nTerrain, verticalDirection: nTerrain === 'mountain' ? 'up' : 'down', floorCount: CAVE_FLOORS[rarity], entranceFloor: 1,
    name: `${title(district)} ${rarity === 'ancient' ? 'Ancient ' : ''}${nTerrain === 'mountain' ? 'Hollow' : 'Gorge'}`, gem: null, prior: nPrior,
    layoutSeed: `rp7d-cave-${district}-natural-v1`
  }
]);
export const CAVE_BY_ID = Object.fromEntries(CAVES.map(c => [c.id, c]));

// The canon, checked: a broken table never ships quietly (console + the placement report carry this).
export function validateManifest(caves = CAVES) {
  const out = [], by = d => caves.filter(c => c.districtId === d);
  const districts = [...new Set(caves.map(c => c.districtId))];
  if (districts.length !== 10) out.push(`expected 10 districts, found ${districts.length}`);
  for (const d of districts) { const L = by(d); if (L.filter(c => c.classification === 'gemlord').length !== 1 || L.filter(c => c.classification === 'natural').length !== 1) out.push(`${d}: needs exactly 1 Gemlord + 1 natural cave`); }
  const count = r => caves.filter(c => c.rarity === r).length;
  if (count('gemlord') !== 10 || count('ancient') !== 3 || count('common') !== 7) out.push('rarity counts must be 10 Gemlord / 3 Ancient / 7 Common');
  const ancient = caves.filter(c => c.rarity === 'ancient').map(c => c.districtId).sort().join(',');
  if (ancient !== [...ANCIENT_DISTRICTS].sort().join(',')) out.push(`Ancient caves must be ${ANCIENT_DISTRICTS.join(', ')} only`);
  const floors = caves.reduce((n, c) => n + c.floorCount, 0); if (floors !== 63) out.push(`expected 63 floors, found ${floors}`);
  const mt = caves.filter(c => c.terrainType === 'mountain').length; if (mt !== 12 || caves.length - mt !== 8) out.push(`expected 12 mountain / 8 canyon, found ${mt} / ${caves.length - mt}`);
  for (const c of caves) if ((c.terrainType === 'mountain') !== (c.verticalDirection === 'up')) out.push(`${c.id}: mountain must go up, canyon down`);
  return { ok: out.length === 0, problems: out, floors, mountains: mt, canyons: caves.length - mt };
}

// A small deterministic random stream from a string seed (layouts, dressing): the same seed, the same cave, forever.
export function seeded(str) {
  let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  const r = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.range = (a, b) => a + r() * (b - a); r.int = (a, b) => Math.floor(a + r() * (b - a + 1)); r.pick = L => L[Math.floor(r() * L.length)];
  return r;
}
