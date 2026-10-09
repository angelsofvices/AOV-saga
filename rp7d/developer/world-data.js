// RP7D · Malezor. RP7B is the placement skeleton; RP7D renders it in 3D.
// All map placements are stored in RP7B tile space and converted here.
export const RP7B = { K: 2, cx: 61, cy: 94 };
export const fromRP7B = (tx, ty) => ({ x: (tx - RP7B.cx) * RP7B.K, z: (ty - RP7B.cy) * RP7B.K });
const P = (tx, ty) => { const p = fromRP7B(tx, ty); return [p.x, p.z]; };
const path = pts => pts.map(([x, y]) => P(x, y));

// RP7B's irregular coast mask, expressed in tile space so the scale can change
// without moving the canon boundary relative to its landmarks.
export function malezorEdge(x, z) {
  const tx = x / RP7B.K + RP7B.cx, ty = z / RP7B.K + RP7B.cy;
  const d = { cx: 58, cy: 103, rx: 145, ry: 135, seed: 0.8 };
  const nx = (tx - d.cx) / d.rx, ny = (ty - d.cy) / d.ry;
  const coast = 1 + Math.sin((ty + d.seed * 31) * 0.105) * 0.055 + Math.sin((tx - d.seed * 17) * 0.073) * 0.038 + Math.sin((tx + ty + d.seed * 53) * 0.041) * 0.028;
  return Math.sqrt(nx * nx + ny * ny) - coast;
}
export const malezorContains = (x, z) => malezorEdge(x, z) <= 0;

const site = (id, recipe, tx, ty, data = {}) => ({ id, recipe, ...data, ...Object.fromEntries(Object.entries(fromRP7B(tx, ty))) });
const roads = (items) => items.map(([id, width, pts]) => ({ id, width, pts: path(pts) }));

export const MALEZOR = {
  id: 'malezor', district: 'Malezor', numeral: 'I', land: 'Beastlands', seed: 73104,
  gemlord: { id: 'rakoron', name: 'Rakoron', epithet: 'Guardian of Malezor · The Crimson One of Ruby', gem: 'Ruby · Instinct' },
  levels: { mori: 5, seerGrunt: 6, seerCommander: 10, daemon: null, boss: 8 }, // RP7B's tower and Seer HQ tables; Malezor has no daemons
  center: (() => { const [x, z] = P(58, 103); return { x, z }; })(),
  hub: (() => { const [x, z] = P(22, 94); return { x, z }; })(),
  edge: malezorEdge, containsLand: malezorContains,
  extent: 318, bound: 300, boundZ: 300, featureExtent: 302, tileScale: RP7B.K,
  coast: { kind: 'rp7b-irregular-ellipse' },
  subdistricts: { central: 'Malezor Central', north: 'the northern ridge', east: 'the eastern flats', south: 'the southern lowlands', west: 'the western reach' },
  wildZones: {
    north: { ...fromRP7B(94, -9), label: 'the northern ridge' },
    east: { ...fromRP7B(191, 71), label: 'the eastern flats' },
    south: { ...fromRP7B(-17, 200), label: 'the southern lowlands' },
    west: { ...fromRP7B(-66, 104), label: 'the western reach' }
  },
  centralRadius: 108,
  coreRadius: 34,
  districtRadius: 270,
  wheel: { outbound: 'S', quarters: { S: 'open', N: 'highland', W: 'forest', E: 'wetland' }, dominant: 'open', flank: 'FW', verified: true },

  // Rizer starts at the south-facing door of his home, looking along the spine.
  playerStart: { ...fromRP7B(22, 108), facing: 0 },

  river: path([[153, 16], [151, 31], [145, 46], [137, 62], [126, 77], [113, 90], [103, 102], [100, 116], [103, 132], [111, 148], [118, 165], [123, 180]]),
  ponds: [
    { ...fromRP7B(143, 54), r: 9 }, { ...fromRP7B(104, 105), r: 8 }, { ...fromRP7B(109, 137), r: 6 }
  ],

  roads: roads([
    ['civic-spine', 4.2, [[22, 10], [22, 24], [22, 38], [19, 48], [16, 56], [22, 66], [22, 78], [22, 94], [22, 105], [25, 126], [22, 156]]],
    ['south-road-to-zarvane', 4.8, [[22, 150], [34, 160], [52, 167], [75, 172], [80, 180], [84, 190], [92, 202]]],
    ['north-cave-road', 3.2, [[22, 78], [22, 55], [22, 34], [22, 20], [22, 10]]],
    ['west-lane', 2.8, [[22, 94], [12, 92], [2, 91], [-8, 91], [-18, 92], [-28, 96]]],
    ['east-crossing-lane', 2.8, [[22, 94], [42, 95], [64, 97], [84, 99], [100, 101], [111, 103]]],
    ['farm-lane', 2.5, [[25, 126], [35, 135], [45, 144], [59, 154], [75, 172]]],
    ['fanghall-trail', 2.3, [[22, 78], [5, 61], [-10, 44], [-22, 27], [-34, 12]]],
    ['bloodscent-trail', 2.3, [[22, 126], [38, 140], [58, 157], [75, 168], [90, 174]]],
    ['first-den-trail', 2.3, [[22, 126], [10, 143], [-7, 159], [-25, 171], [-42, 180]]],
    ['radio-tower-trail', 2.1, [[22, 38], [28, 28], [34, 20], [38, 14]]],
    ['treehouse-trail', 1.8, [[22, 10], [22, -4], [21, -12], [20, -20]]]
  ]).concat([
    // Added after the first Malezor pass (`late`): wild fruit keeps its numbering, so fruit already picked stays picked.
    { id: 'stadium-road', width: 3, pts: path([[111, 103], [124, 104], [138, 104], [153, 104]]), late: true } // east from Timber Crossing to the Stadium of Champions
  ]),

  plaza: { ...fromRP7B(22, 87), r: 16, name: 'Malezor Square' },
  structures: [
    site('rakoron-cave', 'rubyCave', 22, 10, { name: "Rakoron's Ruby Cave", kind: 'gemlord', note: "Rakoron's sanctum. The north road ends at the foot of the ridge." }),
    site('research-facility', 'research', 22, 38, { name: "Dad's Research Facility", kind: 'civic', note: "Dad's Beastology lab." }),
    site('malezor-gear-shop', 'gearShop', 16, 56, { name: 'Malezor Town Store', kind: 'shop', note: 'Two floors: the Rizer Department downstairs, the Zyrex Department upstairs.' }),
    site('town-hall', 'townHall', 22, 78, { name: 'Malezor Town Hall', kind: 'civic', note: 'Warden Kelthor keeps his hall here.' }),
    site('player-home', 'house', 22, 105, { variant: 'red', name: "Rizer's Home", kind: 'home', note: 'Rizer’s home on the civic spine.' }),
    site('academy', 'academy', 25, 126, { name: 'Rizer Academy', kind: 'civic', note: 'Malezor’s school.' }),
    site('zysphere-shop', 'zysphereShop', -20, 120, { accent: '#7a5aa8', name: 'Zysphere Shop', kind: 'shop', note: 'The Zysphere shop.' }),
    site('potion-shop', 'shop', 10, 138, { accent: '#b8584b', name: 'Potion Shop', kind: 'shop', note: 'Potions, elixirs and supplies.' }),
    site('kaizari-farm', 'barn', 35, 138, { name: "Kaizari's Farm", kind: 'farm', note: 'Zyrex pasture and farm.' }),
    site('hospital', 'hospital', 22, 156, { name: 'Malezor Hospital', kind: 'civic', note: 'Nurse Rein’s hospital.' }),
    site('seer-hq', 'seerHQ', 75, 172, { name: 'Seer HQ · Malezor', kind: 'seer', note: 'The Seers control the roads.' }),
    site('seer-checkpoint', 'seerGate', 75, 180, { name: 'Seer Checkpoint', kind: 'seer', note: 'The southern road leads toward Zarvane.' }),
    site('malezor-zarvane-gate', 'districtGate', 84, 190, { name: 'Malezor–Zarvane Gate', kind: 'crossing', note: 'The district seam and the only road out of Malezor.' }),
    site('malezor-radio-tower', 'radioTower', 38, 14, { name: 'Radio Tower', kind: 'landmark', note: 'The tower is broken. Its remote belongs with Scrapjaw.' }),
    site('rizer-treehouse', 'treehouse', 20, -20, { name: "Rizer's Treehouse", kind: 'landmark', note: 'The Kid Pals’ hideout.' }),
    site('novarius-statue', 'novariusStatue', 8, 29, { name: "Novarius' Statue", kind: 'landmark', note: 'A monument to Novarius.' }),
    site('rakoron-stadium', 'championStadium', 165.85, 95.685, { face: 2.12, late: true, padEase: 16, gem: '#ff1f3d', name: "Rakoron's Stadium of Champions", kind: 'stadium', note: "Malezor's Gemlord Champion Stadium. Every district has one: the Novarian Challenge is held here, the qualifiers and the 9-year challenge." }),
    site('auraxion-ufo', 'ufo', 17, 176, { name: 'Aetherstride', kind: 'landmark', note: 'Auraxion’s sleek astral craft, grounded in the southern wilds.' })
    // The sealed quest chests (Voltshard, Raygun, Astralcore) are removed for now; quest loot returns with the quests.
    // Chests in the world today: Rizer's silver chest and the common wooden chests (loot.js).
  ],
  homes: [
    [10,50,'far-north west','villager'], [35,60,'north-2 east','villager'], [10,80,'town-hall west','villager'], [10,110,'middle west','villager'], [35,120,'south east','villager'],
    [6,90,'red-roof','red'], [36,89,'red-roof','red'], [22,94,'red-roof','red'], [12,98,'red-roof','red'], [32,98,'Crazy’s House','red']
  ].map(([tx, ty, label, style], i) => site(`malezor-home-${i}`, 'house', tx, ty, {
    variant: style, name: label === 'Crazy’s House' ? label : `Malezor Home · ${label}`, kind: 'home', note: label === 'Crazy’s House' ? 'Crazy’s House.' : 'A Malezor family home.',
    purchasable: label !== 'Crazy’s House', face: 0
  })),
  neighbourHomes: 0,
  settlement: { quarters: ['forest', 'highland'], tMin: 0, tMax: 0, spacing: 0, spacingFloor: 0 },

  landmarks: [
    site('malezor-the-fanghall', 'fanghall', -34, 12, { name: 'The Fanghall', kind: 'landmark', note: 'The Elder judges territorial disputes here. Sealed for now.', canon: true }),
    site('malezor-the-bloodscent-lodge', 'bloodscentLodge', 90, 174, { name: 'The Bloodscent Lodge', kind: 'landmark', note: 'The door opens to an empty great hall; interior work comes later.', canon: true }),
    site('malezor-the-first-den', 'firstDen', -42, 180, { name: 'The First Den', kind: 'landmark', note: 'Sanctuary for young Zyrex deciding whether to bond. Sealed for now.', canon: true }),
    site('fallen-titan', 'fallenTitan', -14, 68, { name: 'The Fallen Titan', kind: 'landmark', note: 'A Malezor landmark, kept from the RP7D pass.' }),
    site('malezor-square', 'fountain', 22, 87, { name: 'Malezor Square', kind: 'civic', note: 'The heart of Malezor.' }),
    site('timber-crossing', 'bridge', 100, 101, { face: Math.PI / 2 + 0.07, span: 18, name: 'Timber Crossing', kind: 'crossing', note: 'A crossing over the East Wetland river.' })
  ],

  paddocks: [
    { ...fromRP7B(38, 145), w: 28, d: 20, rot: 0.05 }, { ...fromRP7B(50, 150), w: 24, d: 25, rot: -0.1 },
    { ...fromRP7B(2, 142), w: 26, d: 20, rot: 0.12 }, { ...fromRP7B(41, 128), w: 22, d: 17, rot: -0.04 }
  ],
  clearings: [{ ...fromRP7B(-54, 27), r: 17, name: 'Orchard Clearing' }],
  wildZyrex: (() => {
    // Bond difficulty is playtest tuning, separate from a species' canon tier.
    const bondDifficulty = { aetherwing: 3, frosane: 4, verdanix: 2, otterlin: 1, volcanut: 7,
      zarakai: 4, voltigrax: 6, apexaur: 9, snok: 2, skybeam: 3, mutamech: 8,
      phrenetic: 7, zorbil: 5, voltaryn: 8, elzoran: 10 };
    const zones = [
      { name: 'Northern Ridge', quarter: 'highland', at: fromRP7B(94, -9), palette: 'ember' },
      { name: 'Eastern Flats', quarter: 'wetland', at: fromRP7B(191, 71), palette: 'moss' },
      { name: 'Southern Lowlands', quarter: 'open', at: fromRP7B(-17, 200), palette: 'dune' },
      { name: 'Western Reach', quarter: 'forest', at: fromRP7B(-66, 104), palette: 'moss' }
    ];
    const roster = ['aetherwing','frosane','verdanix','otterlin','volcanut','zarakai','voltigrax','apexaur','snok','skybeam','mutamech','phrenetic','zorbil','voltaryn','elzoran'].map((species, i) => {
      const zone = zones[i % zones.length], slot = Math.floor(i / zones.length), a = (i * 2.399963) % (Math.PI * 2), r = 5 + slot * 5;
      return { id: `wild-${species}`, species, bondDifficulty: bondDifficulty[species], habitat: zone.name, quarter: zone.quarter, x: zone.at.x + Math.cos(a) * r, z: zone.at.z + Math.sin(a) * r, palette: zone.palette, scale: 0.8 + (i % 3) * 0.1 };
    }).filter(d => malezorContains(d.x, d.z));
    // Elzebub — the first official wild Zyrex, canon-placed by the treehouse (a blue dragon
    // with golden spikes, standing apart from the generic roster above). Stats beyond
    // level/tier arrive with the bonding system; rideable is a forward-looking flag.
    const treehouse = fromRP7B(20, -20);
    const elzebub = { id: 'elzebub-wild-1', species: 'elzebub', name: 'Elzebub', level: 10, tier: 1, bondDifficulty: 1, rideable: true,
      habitat: "Rizer's Treehouse", quarter: 'highland', x: treehouse.x + 7, z: treehouse.z - 5, palette: 'elzebub', scale: 0.92 };
    return malezorContains(elzebub.x, elzebub.z) ? roster.concat([elzebub]) : roster;
  })(),
  anciuxorStart: { ...fromRP7B(22, -19) },
  wildPatchHalf: 18,
  wildRoster: ['aetherwing','frosane','verdanix','otterlin','volcanut','zarakai','voltigrax','apexaur','snok','skybeam','mutamech','phrenetic','zorbil','voltaryn','elzoran'],
  wildZoneRadius: 22,

  // Hand-placed starter patrols. Spawn intensity is applied by radial distance
  // from the home tile in createSeers; no enemy may spawn within 44 world units.
  seerPatrols: [
    { id: 'hq-gate', pts: path([[75,172],[75,180],[84,190]]) },
    { id: 'hq-yard', loop: true, pts: path([[67,166],[83,166],[84,178],[68,178]]) },
    { id: 'zarvane-approach', pts: path([[75,180],[80,190],[92,202]]) },
    { id: 'south-spine', pts: path([[22,156],[42,162],[60,168],[75,172]]) },
    { id: 'south-lowlands', loop: true, pts: path([[-17,200],[-30,190],[-5,184],[4,204]]) },
    { id: 'fanghall-road', pts: path([[-34,12],[-22,27],[-10,44],[5,61]]) },
    { id: 'bloodscent-trail', pts: path([[58,157],[75,168],[90,174]]) },
    { id: 'east-lane', pts: path([[64,97],[84,99],[100,101]]) }
  ],
  moriPatrols: [
    { id: 'mori-west-reach', loop: true, pts: path([[-66,104],[-76,92],[-58,86],[-52,108]]) },
    { id: 'mori-first-den', pts: path([[-42,180],[-54,168],[-25,171]]) },
    { id: 'mori-east-flats', loop: true, pts: path([[180,60],[198,48],[205,80],[186,84]]) }, // (last point moved off the Stadium of Champions' gate)
    { id: 'mori-northern-ridge', loop: true, pts: path([[80,2],[102,-18],[115,0],[86,18]]) },
    { id: 'mori-south-lowlands', pts: path([[-17,200],[-35,211],[-5,221]]) },
    { id: 'mori-radio-trail', pts: path([[38,14],[50,20],[57,5]]) }
  ],
  enemyHomeTile: { x: 22, y: 105 },
  enemyDensity: [{ radius: 22, chance: 0 }, { radius: 40, chance: 0.2 }, { radius: 64, chance: 0.6 }, { radius: Infinity, chance: 1 }],
  detail: { forestTrees: 540, scatterTrees: 360, highlandPines: 330, wetlandWillows: 90, rocks: 420, reeds: 1600, grass: 32000, flowers: 2200, hay: 48, fae: 90, faery: 18, zyphere: 30 },
  regions: { core: 'Malezor Central', central: 'Malezor Central', highland: 'the northern ridge', forest: 'the western reach', wetland: 'the eastern flats', open: 'the southern lowlands' }
};

// ── Roads stay clear of buildings ───────────────────────────────────────────────
// RP7B threads its lanes through each building's tile; in 3D that put roads under houses and halls.
// Every road that meets a building footprint bends around it (the shorter way, with rounded
// corners), and a road that begins or ends at a building stops at its edge. The terrain paint,
// grading, the minimap and the Zyphone map all read these same lines, so they always agree.
// Footprints are the built recipes' real extents (building scale and porches included), in
// local space: hw = half width, back / front = depth behind and in front of the centre (front = +Z).
export const FOOTPRINT = {
  house: { hw: 5.6, back: 5.6, front: 5.6 }, playerHome: { hw: 5.6, back: 5.6, front: 7.4 },
  research: { hw: 19.8, back: 9.7, front: 9.7 }, gearShop: { hw: 7.6, back: 7.8, front: 10.8 }, shop: { hw: 7.6, back: 7.8, front: 10.8 },
  townHall: { hw: 12.1, back: 10, front: 12.8 }, academy: { hw: 13.4, back: 8.7, front: 9.6 }, zysphereShop: { hw: 4.6, back: 4.1, front: 5.7 },
  barn: { hw: 19.5, back: 10.2, front: 10.2 }, hospital: { hw: 11.5, back: 9.6, front: 9.6 }, seerHQ: { hw: 9.6, back: 7.5, front: 7.8 },
  treehouse: { hw: 5.6, back: 4.6, front: 4.7 }, radioTower: { hw: 2, back: 2, front: 2 }, novariusStatue: { hw: 6.3, back: 5, front: 5 },
  fanghall: { hw: 13, back: 10, front: 11.6 }, championStadium: { hw: 28, back: 34.5, front: 34.5 }, bloodscentLodge: { hw: 13, back: 10, front: 11.2 }, firstDen: { hw: 13, back: 10, front: 11.5 }
}; // not listed (the road is meant to run through or up to them): gates, the bridge, the fountain, the cave, the UFO, the Fallen Titan
export function clearRoads(world) {
  const blocks = [...world.structures, ...world.homes, ...world.landmarks].map(s => {
    const f = FOOTPRINT[s.id === 'player-home' ? 'playerHome' : s.recipe]; return f ? { s, f, rot: s.face || 0 } : null;
  }).filter(Boolean);
  const dense = pts => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az))); for (let k = 0; k < n; k++) out.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]); } out.push(pts[pts.length - 1]); return out; };
  const hits = (b, width) => { const m = width + 2.2, c = Math.cos(b.rot), sn = Math.sin(b.rot); return ([x, z]) => { const dx = x - b.s.x, dz = z - b.s.z, lx = dx * c - dz * sn, lz = dx * sn + dz * c; return lx > -b.f.hw - m && lx < b.f.hw + m && lz > -b.f.back - m && lz < b.f.front + m; }; };
  function detour(pts, b, width) {
    const others = blocks.filter(o => o !== b).map(o => hits(o, width));
    const m = width + 2.2, c = Math.cos(b.rot), sn = Math.sin(b.rot); // the painted road reaches ~width + 0.9 from its centre line
    const x0 = -b.f.hw - m, x1 = b.f.hw + m, z0 = -b.f.back - m, z1 = b.f.front + m;
    const toL = ([x, z]) => { const dx = x - b.s.x, dz = z - b.s.z; return [dx * c - dz * sn, dx * sn + dz * c]; };
    const toW = ([lx, lz]) => [b.s.x + lx * c + lz * sn, b.s.z - lx * sn + lz * c];
    const inside = q => { const [lx, lz] = toL(q); return lx > x0 && lx < x1 && lz > z0 && lz < z1; };
    const edge = (a, q) => { let lo = 0, hi = 1; for (let i = 0; i < 20; i++) { const t = (lo + hi) / 2, r = [a[0] + (q[0] - a[0]) * t, a[1] + (q[1] - a[1]) * t]; if (inside(r)) hi = t; else lo = t; } return [a[0] + (q[0] - a[0]) * lo, a[1] + (q[1] - a[1]) * lo]; };
    // perimeter coordinate, counter-clockwise from (x0, z0)
    const W_ = x1 - x0, D_ = z1 - z0, P = 2 * (W_ + D_);
    const per = ([lx, lz]) => { const e = 1e-6; if (Math.abs(lz - z0) < 0.05 + e) return lx - x0; if (Math.abs(lx - x1) < 0.05 + e) return W_ + (lz - z0); if (Math.abs(lz - z1) < 0.05 + e) return W_ + D_ + (x1 - lx); return 2 * W_ + D_ + (z1 - lz); };
    const at = s => { s = ((s % P) + P) % P; if (s < W_) return [x0 + s, z0]; s -= W_; if (s < D_) return [x1, z0 + s]; s -= D_; if (s < W_) return [x1 - s, z1]; s -= W_; return [x0, z1 - s]; };
    const snap = ([lx, lz]) => { const d = [lz - z0, x1 - lx, z1 - lz, lx - x0], i = d.indexOf(Math.min(...d)); return i === 0 ? [lx, z0] : i === 1 ? [x1, lz] : i === 2 ? [lx, z1] : [x0, lz]; };
    const corners = [0, W_, W_ + D_, 2 * W_ + D_];
    const out = []; let i = 0;
    while (i < pts.length) {
      if (!inside(pts[i])) { out.push(pts[i]); i++; continue; }
      let j = i; while (j < pts.length && inside(pts[j])) j++;
      if (i === 0 && j === pts.length) return []; // entirely under the building
      if (i === 0) { out.push(edge(pts[j], pts[j - 1])); i = j; continue; }        // starts at the building: begin at its edge
      if (j === pts.length) { out.push(edge(pts[i - 1], pts[i])); break; }        // ends at the building: stop at its edge
      const A = snap(toL(edge(pts[i - 1], pts[i]))), B = snap(toL(edge(pts[j], pts[j - 1])));
      const sa = per(A), sb = per(B), fwd = ((sb - sa) % P + P) % P;
      const route = dir => { // A → B round the box one way, rounding each corner passed
        const span = dir > 0 ? fwd : P - fwd, r = [toW(A)];
        const cs = corners.map(q => ({ q, off: dir > 0 ? ((q - sa) % P + P) % P : ((sa - q) % P + P) % P })).filter(o => o.off > 0.01 && o.off < span - 0.01).sort((a, b) => a.off - b.off);
        for (const { q, off } of cs) { const rr = Math.min(3, off, span - off); r.push(toW(at(q - dir * rr)), toW(at(q + dir * rr))); }
        r.push(toW(B)); return { r, span };
      };
      // go round the side that doesn't run into another building (then the shorter side)
      const score = ({ r, span }) => dense(r).filter(q => others.some(o => o(q))).length * 1000 + span;
      const a1 = route(1), a2 = route(-1);
      out.push(...(score(a1) <= score(a2) ? a1 : a2).r); i = j;
    }
    return out;
  }
  const out = [];
  for (const rd of world.roads) {
    let pts = dense(rd.pts);
    for (let pass = 0; pass < 6; pass++) { const before = pts.length; for (const b of blocks) pts = detour(pts, b, rd.width); if (pts.length === before && pass > 0) break; }
    const keep = pts.filter((q, k) => k === 0 || Math.hypot(q[0] - pts[k - 1][0], q[1] - pts[k - 1][1]) > 0.05);
    if (keep.length >= 2) out.push({ ...rd, rp7b: rd.pts, pts: keep });
  }
  return out;
}
MALEZOR.roads = clearRoads(MALEZOR);

const DIRS = [['N', 0], ['E', Math.PI / 2], ['S', Math.PI], ['W', -Math.PI / 2]];
// Bearings as angles in this file's frame (clockwise from north, the same sense as RP7B's bearing degrees).
const BEARING = { N: 0, NE: Math.PI / 4, E: Math.PI / 2, SE: Math.PI * 3 / 4, S: Math.PI, SW: -Math.PI * 3 / 4, W: -Math.PI / 2, NW: -Math.PI / 4 };
const OPPOSITE = { N: 'S', NE: 'SW', E: 'W', SE: 'NW', S: 'N', SW: 'NE', W: 'E', NW: 'SE' };
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
function angleFromCenter(x, z, world) { return Math.atan2(x - world.center.x, -(z - world.center.z)); }
export function quarterAt(x, z, world = MALEZOR) {
  if (Math.hypot(x - world.hub.x, z - world.hub.z) < world.coreRadius + 3) return 'core';
  // OPEN is the dominant sector along the outbound road (Malezor: south); HIGHLAND faces the
  // opposite way, and the district's flank parity says which side is forest and which wetland
  // (Malezor's confirmed FW flank puts forest west, wetland east). Same rule as RP7B's wheelQuarterAt.
  const ang = angleFromCenter(x, z, world), out = BEARING[world.wheel.outbound], diff = wrap(ang - out);
  if (Math.abs(diff) < Math.PI * 0.4) return 'open';
  if (Math.abs(wrap(ang - BEARING[OPPOSITE[world.wheel.outbound]])) < Math.PI * 0.25) return 'highland';
  return (world.wheel.flank === 'FW') === (diff > 0) ? 'forest' : 'wetland';
}
// Which district a point is in. Only Malezor is rendered so far, so everywhere on its map is Malezor (the
// Malezor branch is unchanged). Other districts answer from their own coast. Enemies that are hunting Rizer give
// up only when he is in another district than their own (seers.js, scanobots.js). When a second district is
// rendered next to Malezor, switch callers to worldDistrictAt (below), which resolves the whole Z.
export function districtAt(x, z, world = MALEZOR) {
  if (world === MALEZOR) return Math.abs(x) <= world.extent && Math.abs(z) <= world.extent ? world.id : 'beyond';
  return world.containsLand(x, z) ? world.id : 'beyond';
}
export function sectionAt(x, z, world = MALEZOR) {
  if (Math.hypot(x - world.hub.x, z - world.hub.z) <= world.centralRadius) return 'central';
  const a = angleFromCenter(x, z, world);
  if (Math.abs(a) < Math.PI / 4) return 'north';
  if (Math.abs(a) > Math.PI * 3 / 4) return 'south';
  return a > 0 ? 'east' : 'west';
}
export function quarterWeights(x, z, world = MALEZOR) {
  const q = quarterAt(x, z, world), out = { core: 0, highland: 0, forest: 0, wetland: 0, open: 0 };
  out[q] = 1;
  const d = Math.hypot(x - world.hub.x, z - world.hub.z), fade = Math.max(0, 1 - d / 52);
  if (fade > 0) { out.core = fade; out[q] = 1 - fade; }
  return out;
}

// ── The other nine districts ────────────────────────────────────────────────────
// Every district is placed from RP7B's canon tables, in the same RP7B tile space as Malezor, so the whole
// Z sits in one world frame: Malezor ↓ Zarvane → Andrannor → Veridan ↓ Netharion ↙ Vorashil ↘ Xilnar →
// Baelgor → Thardin → Korathen → the Bridge of Hope.
//   coast         ZYRAXIS_DISTRICTS (cx, cy, rx, ry, seed), the same irregular ellipse as malezorEdge
//   wheel         DISTRICT_WHEEL (outbound road bearing, dominant quarter, flank parity)
//   seer HQ       SEER_HQ_NETWORK (door tile, bearing, grunt / commander levels)
//   radio tower   TOWER_NETWORK (tower tile, Mori level, tower boss)
//   routes        ZYRAXIS_ROUTES (land-bridge widths) and RP8's ROUTE_META (names, route Gemlord)
// Gemlords and epithets are Master Codex v16.2 (WORLDS rows 95–104).
// Interiors (homes, shops, landmarks, rivers, vegetation detail) are not built yet: those arrays are empty and
// detail counts are 0, as in the handoff. What IS populated is the enemy layer: Seer patrols round each HQ and
// along the outbound road, and Mori patrols in the four wild quarters, with the Daemons (`mode: 'daemon'`)
// lurking in the quarters farthest from the road. Districts progress as in RP7B: Malezor has no daemons,
// Zarvane has one lurking deep, Andrannor onward is daemon-heavy.

export function districtEdge(d) {
  return (x, z) => {
    const tx = x / RP7B.K + RP7B.cx, ty = z / RP7B.K + RP7B.cy;
    const nx = (tx - d.cx) / d.rx, ny = (ty - d.cy) / d.ry;
    const coast = 1 + Math.sin((ty + d.seed * 31) * 0.105) * 0.055 + Math.sin((tx - d.seed * 17) * 0.073) * 0.038 + Math.sin((tx + ty + d.seed * 53) * 0.041) * 0.028;
    return Math.sqrt(nx * nx + ny * ny) - coast;
  };
}

const CANON = [
  { id: 'zarvane', district: 'Zarvane', numeral: 'II', cx: 112, cy: 278, rx: 140, ry: 130, seed: 1.2, land: 'Auralands',
    gemlord: { id: 'ivirium', name: 'Ivirium', epithet: 'Guardian of Zarvane · The Pearllord', gem: 'Pearl · Balance' },
    wheel: { outbound: 'E', dominant: 'open', flank: 'WF' },
    hq: { door: [202, 297], bearing: 'E', toward: 'andrannor', gruntLv: 15, cmdLv: 20 },
    tower: { at: [170, 220], boss: 'satyrbeast', bossName: 'Satyrbeast Alpha', moriLv: 14, bossLv: 18 }, daemons: 1 },
  { id: 'andrannor', district: 'Andrannor', numeral: 'III', cx: 315, cy: 325, rx: 135, ry: 105, seed: 1.7, land: 'Creaturelands',
    gemlord: { id: 'mutaryn', name: 'Mutaryn', epithet: 'Guardian of Andrannor · The Citrinelord', gem: 'Citrine · Mutation' },
    wheel: { outbound: 'E', dominant: 'forest', flank: 'FW' },
    hq: { door: [382, 320], bearing: 'E', toward: 'veridan', gruntLv: 23, cmdLv: 29 },
    tower: { at: [395, 280], boss: 'daemon', bossName: 'Daemon Sergeant', moriLv: 22, bossLv: 27 }, daemons: 3 },
  { id: 'veridan', district: 'Veridan', numeral: 'IV', cx: 520, cy: 255, rx: 120, ry: 110, seed: 2.9, land: 'Naturelands',
    gemlord: { id: 'emeralix', name: 'Emeralix', epithet: 'Guardian of Veridan · The Emerald', gem: 'Emerald · Growth' },
    wheel: { outbound: 'S', dominant: 'forest', flank: 'WF' },
    hq: { door: [493, 323], bearing: 'S', toward: 'netharion', gruntLv: 31, cmdLv: 38 },
    tower: { at: [600, 210], boss: 'vilerok', bossName: 'Vilerok Warden', moriLv: 30, bossLv: 36 }, daemons: 2 },
  { id: 'netharion', district: 'Netharion', numeral: 'V', cx: 455, cy: 435, rx: 110, ry: 100, seed: 4.2, land: 'Unknownlands',
    gemlord: { id: 'eurakeon', name: 'Eurakeon', epithet: 'Guardian of Netharion · The Amethyst', gem: 'Amethyst · Sanctuary' },
    wheel: { outbound: 'SW', dominant: 'highland', flank: 'FW' },
    hq: { door: [397, 474], bearing: 'SW', toward: 'vorashil', gruntLv: 39, cmdLv: 47 },
    tower: { at: [530, 390], boss: 'morlisk', bossName: 'Morlisk', moriLv: 38, bossLv: 45 }, daemons: 3 },
  { id: 'vorashil', district: 'Vorashil', numeral: 'VI', cx: 300, cy: 550, rx: 105, ry: 95, seed: 5.6, land: 'Alienlands',
    gemlord: { id: 'azurel', name: 'Azurel', epithet: 'Guardian of Vorashil · The Sapphirelord', gem: 'Sapphire · Intellect' },
    wheel: { outbound: 'SE', dominant: 'highland', flank: 'WF' },
    hq: { door: [352, 591], bearing: 'SE', toward: 'xilnar', gruntLv: 47, cmdLv: 56 },
    tower: { at: [370, 505], boss: 'skellor', bossName: 'Skellor Cluster', moriLv: 46, bossLv: 54 }, daemons: 3 },
  { id: 'xilnar', district: 'Xilnar', numeral: 'VII', cx: 420, cy: 655, rx: 110, ry: 95, seed: 7.1, land: 'Spiritlands',
    gemlord: { id: 'obsidius', name: 'Obsidius', epithet: 'Guardian of Xilnar · The Onyx', gem: 'Onyx · Restraint' },
    wheel: { outbound: 'E', dominant: 'wetland', flank: 'FW' },
    hq: { door: [491, 656], bearing: 'E', toward: 'baelgor', gruntLv: 55, cmdLv: 65 },
    tower: { at: [490, 610], boss: 'seer_grunt', bossName: 'Seer Grunt Elite', moriLv: 54, bossLv: 63 }, daemons: 3 },
  { id: 'baelgor', district: 'Baelgor', numeral: 'VIII', cx: 575, cy: 655, rx: 120, ry: 105, seed: 8.4, land: 'Humanoidlands',
    gemlord: { id: 'ambrevon', name: 'Ambrevon', epithet: 'Guardian of Baelgor · The Amber', gem: 'Amber · Perfection' },
    wheel: { outbound: 'E', dominant: 'wetland', flank: 'WF' },
    hq: { door: [651, 657], bearing: 'E', toward: 'thardin', gruntLv: 63, cmdLv: 74 },
    tower: { at: [650, 610], boss: 'vilerok', bossName: 'Vilerok Elite', moriLv: 62, bossLv: 72 }, daemons: 3 },
  { id: 'thardin', district: 'Thardin', numeral: 'IX', cx: 730, cy: 655, rx: 115, ry: 100, seed: 9.8, land: 'Mechlands',
    gemlord: { id: 'oathane', name: 'Oathane', epithet: 'Guardian of Thardin · Egnellahc-born', gem: 'Composite · IX' },
    wheel: { outbound: 'E', dominant: 'open', flank: 'FW' },
    hq: { door: [804, 656], bearing: 'E', toward: 'korathen', gruntLv: 71, cmdLv: 83 },
    tower: { at: [797, 593], boss: 'morlisk', bossName: 'Morlisk Ascendant', moriLv: 70, bossLv: 81 }, daemons: 4 },
  { id: 'korathen', district: 'Korathen', numeral: 'X', cx: 895, cy: 655, rx: 130, ry: 115, seed: 11.3, land: 'Ultralands',
    gemlord: { id: 'oatheus', name: 'Oatheus', epithet: 'Guardian of Korathen · Egnellahc-born', gem: 'Composite · X' },
    wheel: { outbound: 'E', dominant: 'highland', flank: 'WF' },
    hq: { door: [981, 655], bearing: 'E', toward: 'bridge-of-hope', gruntLv: 81, cmdLv: 92 },
    tower: { at: [975, 610], boss: 'vilerok', bossName: 'Vilerok Overlord', moriLv: 80, bossLv: 90 }, daemons: 4 }
];

// Routes between neighbouring districts: RP7B land-bridge width (tiles) and RP8's route names.
export const ROUTES = [
  { id: 'valley_benevolent_beast', from: 'malezor', to: 'zarvane', width: 16, name: 'The Valley of the Benevolent Beast', gemlord: 'rakoron' },
  { id: 'choir_of_pearlord', from: 'zarvane', to: 'andrannor', width: 16, name: 'The Choir of the Pearlord', gemlord: 'ivirium' },
  { id: 'wilds_of_citrinehowl', from: 'andrannor', to: 'veridan', width: 14, name: 'The Wilds of the Citrinehowl', gemlord: 'mutaryn' },
  { id: 'verge_of_emeraldbloom', from: 'veridan', to: 'netharion', width: 12, name: 'The Verge of the Emeraldbloom', gemlord: 'emeralix' },
  { id: 'rift_of_amethyst_voice', from: 'netharion', to: 'vorashil', width: 12, name: 'The Rift of the Amethyst Voice', gemlord: 'eurakeon' },
  { id: 'skylanes_sapphirebroker', from: 'vorashil', to: 'xilnar', width: 12, name: 'The Skylanes of the Sapphirebroker', gemlord: 'azurel' },
  { id: 'threshold_of_onyxwhisper', from: 'xilnar', to: 'baelgor', width: 14, name: 'The Threshold of the Onyxwhisper', gemlord: 'obsidius' },
  { id: 'roads_of_amberchain', from: 'baelgor', to: 'thardin', width: 14, name: 'The Roads of the Amberchain', gemlord: 'ambrevon' },
  { id: 'fracture_of_anomaly', from: 'thardin', to: 'korathen', width: 14, name: 'The Fracture of the Anomaly', gemlord: 'oathane' }
];

const MALEZOR_TILES = { cx: 58, cy: 103, rx: 145, ry: 135, seed: 0.8 };
const TILES = Object.fromEntries([['malezor', MALEZOR_TILES], ...CANON.map(c => [c.id, c])]);
const ORDER = ['malezor', ...CANON.map(c => c.id)];
const QUARTER_NOUN = { highland: 'ridge', forest: 'reach', wetland: 'flats', open: 'lowlands' };
const COMPASS = ['northern', 'north-eastern', 'eastern', 'south-eastern', 'southern', 'south-western', 'western', 'north-western'];
const CARDINAL = ['north', 'east', 'south', 'west'];
// Tile-space unit vector for an angle in this file's frame (0 = north, clockwise; RP7B rows grow southward).
const dirOf = a => [Math.sin(a), -Math.cos(a)];

function buildDistrict(c) {
  const edge = districtEdge(c), contains = (x, z) => edge(x, z) <= 0;
  const owned = (x, z) => contains(x, z) && worldDistrictAt(x, z) === c.id;
  // Pull a tile toward the district centre until it is on this district's own land (not a neighbour's overlap).
  const pullIn = ([tx, ty], margin = 0.9) => {
    for (let k = 0; k <= 40; k++) {
      const f = 1 - k / 40 * (1 - 0.1), x = c.cx + (tx - c.cx) * f, y = c.cy + (ty - c.cy) * f, p = fromRP7B(x, y);
      if (owned(p.x, p.z) && edge(p.x, p.z) <= -(1 - margin)) return [x, y];
    }
    return [c.cx, c.cy];
  };
  const out = BEARING[c.wheel.outbound];
  const quarterAngle = { open: out, highland: out + Math.PI, forest: out + ((c.wheel.flank === 'FW') ? Math.PI / 2 : -Math.PI / 2) };
  quarterAngle.wetland = quarterAngle.forest + Math.PI;
  const zoneTile = q => { const [dx, dy] = dirOf(quarterAngle[q]); return pullIn([c.cx + dx * c.rx * 0.62, c.cy + dy * c.ry * 0.62], 0.82); };
  // (the tiny bias settles exact half-way bearings the same way every time, so four quarters get four keys)
  const sector = (a, n) => ((Math.floor(wrap(a) / (2 * Math.PI / n) + 0.5 + 1e-6) % n) + n) % n;
  const label = q => `the ${COMPASS[sector(quarterAngle[q], 8)]} ${QUARTER_NOUN[q]}`;
  const cardinalOf = q => CARDINAL[sector(quarterAngle[q], 4)];

  const wheelQuarters = {};
  for (const [k, a] of DIRS) { // RP7B wheelQuarterAt, applied to the four cardinals
    const d = ((a - out) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    wheelQuarters[k] = d < Math.PI / 4 || d >= Math.PI * 7 / 4 ? 'open' : d >= Math.PI * 3 / 4 && d < Math.PI * 5 / 4 ? 'highland'
      : (c.wheel.flank === 'FW') === (d < Math.PI * 3 / 4) ? 'forest' : 'wetland';
  }

  const zones = ['highland', 'open', 'forest', 'wetland'].map(q => ({ q, tile: zoneTile(q), label: label(q), key: cardinalOf(q) }));
  const wildZones = Object.fromEntries(zones.map(z => [z.key, { ...fromRP7B(...z.tile), label: z.label }]));
  const subdistricts = { central: `${c.district} Central`, ...Object.fromEntries(zones.map(z => [z.key, z.label])) };

  // ── Seers hold the HQ and the outbound road (RP7B: "the Seers control the roads") ──
  const [hx, hy] = c.hq.door, [bx, by] = dirOf(BEARING[c.hq.bearing]);
  const next = TILES[c.hq.toward] || { cx: hx + bx * 200, cy: hy + by * 200 }; // Korathen's road runs on to the Bridge of Hope
  const roadTip = (() => { // the last tile of this district's own land on the line to the next district
    let best = [hx, hy];
    for (let t = 0; t <= 1; t += 0.01) { const tx = hx + (next.cx - hx) * t, ty = hy + (next.cy - hy) * t, p = fromRP7B(tx, ty); if (owned(p.x, p.z)) best = [tx, ty]; else if (t > 0.05) break; }
    return best.map(Math.round);
  })();
  const seerPatrols = [
    { id: 'hq-gate', pts: [[hx, hy], [hx + bx * 8, hy + by * 8], [hx + bx * 16, hy + by * 16]] },
    { id: 'hq-yard', loop: true, pts: [[hx - 8, hy - 6], [hx + 8, hy - 6], [hx + 8, hy + 6], [hx - 8, hy + 6]] },
    { id: `${c.hq.toward}-approach`, pts: [[hx + bx * 12, hy + by * 12], [(hx + roadTip[0]) / 2, (hy + roadTip[1]) / 2], roadTip] },
    { id: 'tower-watch', pts: [c.tower.at, [(c.tower.at[0] * 2 + c.cx) / 3, (c.tower.at[1] * 2 + c.cy) / 3]] }
  ];

  // ── Mori roam the wild quarters; Daemons lurk in the ones farthest from the road ──
  const loopAt = ([tx, ty], r, spin) => [0, 1, 2, 3].map(i => { const a = spin + i * Math.PI / 2; return [tx + Math.cos(a) * r, ty + Math.sin(a) * r * 0.8]; });
  const moriPatrols = zones.map((z, i) => ({ id: `mori-${z.label.replace(/^the /, '').replace(/\s+/g, '-')}`, loop: true, mode: i % 2 ? 'drainer' : 'wander', pts: loopAt(z.tile, 11, c.seed + i) }))
    .concat([{ id: 'mori-radio-trail', mode: 'wander', pts: [c.tower.at, [c.tower.at[0] + 12, c.tower.at[1] + 6], [c.tower.at[0] + 19, c.tower.at[1] - 9]] }]);
  const daemonOrder = ['highland', 'forest', 'wetland', 'open']; // deepest first: away from the outbound road
  for (let i = 0; i < c.daemons; i++) {
    const z = zones.find(zz => zz.q === daemonOrder[i % 4]), [dx, dy] = dirOf(quarterAngle[z.q]);
    const deep = pullIn([z.tile[0] + dx * 14, z.tile[1] + dy * 14], 0.85);
    moriPatrols.push({ id: `daemon-${z.label.replace(/^the /, '').replace(/\s+/g, '-')}${i >= 4 ? '-2' : ''}`, loop: true, mode: 'daemon', pts: loopAt(deep, 7, c.seed * 2 + i) });
  }

  // Every patrol point is kept on this district's own land and clear of the 44-unit no-spawn ring round the home tile.
  const home = { x: c.cx, y: c.cy }, homeW = fromRP7B(home.x, home.y);
  const settle = pts => pts.map(pt => {
    let [tx, ty] = pullIn(pt);
    const p = fromRP7B(tx, ty), d = Math.hypot(p.x - homeW.x, p.z - homeW.z);
    if (d < 48) { const s = 48 / Math.max(d, 1e-3); tx = home.x + (tx - home.x) * s; ty = home.y + (ty - home.y) * s; [tx, ty] = pullIn([tx, ty]); }
    return P(tx, ty);
  });
  const finish = list => list.map(p => ({ ...p, pts: settle(p.pts) }));

  const world = {
    id: c.id, district: c.district, numeral: c.numeral, land: c.land, seed: Math.round(c.seed * 61001),
    gemlord: c.gemlord,
    levels: { mori: c.tower.moriLv, seerGrunt: c.hq.gruntLv, seerCommander: c.hq.cmdLv, daemon: c.tower.moriLv + 4, boss: c.tower.bossLv },
    center: (() => { const [x, z] = P(c.cx, c.cy); return { x, z }; })(),
    hub: (() => { const [x, z] = P(c.cx, c.cy); return { x, z }; })(),
    edge, containsLand: contains,
    // Malezor's scale rules, measured off its own radii: extent / bound are half-sizes about the district centre.
    extent: Math.round(Math.max(c.rx, c.ry) * RP7B.K * 1.097), bound: Math.round(c.rx * RP7B.K * 1.035), boundZ: Math.round(c.ry * RP7B.K * 1.111),
    featureExtent: Math.round(Math.max(c.rx, c.ry) * RP7B.K * 1.041), tileScale: RP7B.K,
    coast: { kind: 'rp7b-irregular-ellipse' },
    subdistricts, wildZones,
    centralRadius: Math.round(108 * Math.min(c.rx, c.ry) / 135), coreRadius: 34, districtRadius: Math.min(c.rx, c.ry) * RP7B.K,
    wheel: { outbound: c.wheel.outbound, quarters: wheelQuarters, dominant: c.wheel.dominant, flank: c.wheel.flank, verified: false },
    playerStart: { ...fromRP7B(c.cx, c.cy), facing: 0 },
    river: [], ponds: [],
    roads: [
      { id: `${c.id}-hub-road`, width: 4.2, pts: path([[c.cx, c.cy], [(c.cx + hx) / 2, (c.cy + hy) / 2], [hx, hy]]) },
      { id: `${c.id}-${c.hq.toward}-road`, width: 4.8, pts: path([[hx, hy], [(hx + roadTip[0]) / 2, (hy + roadTip[1]) / 2], roadTip]) }
    ],
    plaza: null,
    structures: [
      site(`${c.id}-seer-hq`, 'seerHQ', hx, hy, { name: `Seer HQ · ${c.district}`, kind: 'seer', note: 'The Seers control the roads.' }),
      site(`${c.id}-radio-tower`, 'radioTower', ...c.tower.at, { name: 'Radio Tower', kind: 'landmark', note: `The tower is broken. ${c.tower.bossName} holds its remote.`, boss: c.tower.boss, bossLv: c.tower.bossLv })
    ],
    homes: [], neighbourHomes: 0,
    settlement: { quarters: [], tMin: 0, tMax: 0, spacing: 0, spacingFloor: 0 },
    landmarks: [], paddocks: [], clearings: [],
    wildZyrex: [], anciuxorStart: null, wildPatchHalf: 18, wildRoster: [], wildZoneRadius: 22,
    seerPatrols: finish(seerPatrols),
    moriPatrols: finish(moriPatrols),
    enemyHomeTile: home,
    enemyDensity: [{ radius: 22, chance: 0 }, { radius: 40, chance: 0.2 }, { radius: 64, chance: 0.6 }, { radius: Infinity, chance: 1 }],
    detail: { forestTrees: 0, scatterTrees: 0, highlandPines: 0, wetlandWillows: 0, rocks: 0, reeds: 0, grass: 0, flowers: 0, hay: 0, fae: 0, faery: 0, zyphere: 0 },
    regions: { core: `${c.district} Central`, central: `${c.district} Central`, ...Object.fromEntries(zones.map(z => [z.q, z.label])) }
  };
  world.roads = clearRoads(world);
  return world;
}

// Which district a world point belongs to, across the whole Z. Same rule as RP7B's worldDistrictAt: the district
// whose coast holds the point (nearest centre wins where two coasts overlap), else the route land-bridge it is on,
// else 'beyond'.
export function worldDistrictAt(x, z) {
  const tx = x / RP7B.K + RP7B.cx, ty = z / RP7B.K + RP7B.cy;
  let best = null, bestScore = Infinity;
  for (const id of ORDER) {
    const d = TILES[id];
    if (districtEdge(d)(x, z) > 0) continue;
    const s = ((tx - d.cx) / d.rx) ** 2 + ((ty - d.cy) / d.ry) ** 2;
    if (s < bestScore) { best = id; bestScore = s; }
  }
  if (best) return best;
  for (const r of ROUTES) {
    const a = TILES[r.from], b = TILES[r.to], vx = b.cx - a.cx, vy = b.cy - a.cy;
    const t = Math.max(0, Math.min(1, ((tx - a.cx) * vx + (ty - a.cy) * vy) / (vx * vx + vy * vy)));
    if (Math.hypot(tx - (a.cx + vx * t), ty - (a.cy + vy * t)) <= r.width) return t < 0.5 ? r.from : r.to;
  }
  return 'beyond';
}

export const [ZARVANE, ANDRANNOR, VERIDAN, NETHARION, VORASHIL, XILNAR, BAELGOR, THARDIN, KORATHEN] = CANON.map(buildDistrict);
export const DISTRICTS = [MALEZOR, ZARVANE, ANDRANNOR, VERIDAN, NETHARION, VORASHIL, XILNAR, BAELGOR, THARDIN, KORATHEN];
export const DISTRICT_BY_ID = Object.fromEntries(DISTRICTS.map(d => [d.id, d]));
