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
    site('malezor-gear-shop', 'gearShop', 16, 56, { name: 'Gear Shop', kind: 'shop', note: 'Equipment and repairs.' }),
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
function angleFromCenter(x, z, world) { return Math.atan2(x - world.center.x, -(z - world.center.z)); }
export function quarterAt(x, z, world = MALEZOR) {
  if (Math.hypot(x - world.hub.x, z - world.hub.z) < world.coreRadius + 3) return 'core';
  const ang = angleFromCenter(x, z, world), out = Math.PI, diff = Math.atan2(Math.sin(ang - out), Math.cos(ang - out));
  // OPEN is deliberately the dominant southern sector; north is highland and
  // the confirmed FW flank puts forest west, wetland east.
  if (Math.abs(diff) < Math.PI * 0.4) return 'open';
  const n = Math.atan2(Math.sin(ang), Math.cos(ang));
  if (Math.abs(n) < Math.PI * 0.25) return 'highland';
  return n > 0 ? 'wetland' : 'forest';
}
// Which district a point is in. Only Malezor is built so far, so everywhere on its map is Malezor; neighbouring
// districts slot in here when they exist. Enemies that are hunting Rizer give up only when he is in another
// district than their own (seers.js, scanobots.js).
export function districtAt(x, z, world = MALEZOR) { return Math.abs(x) <= world.extent && Math.abs(z) <= world.extent ? world.id : 'beyond'; }
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

// ── Zyraxis · the ten districts ──────────────────────────────────────────────────────────────────────────────
// World Expansion 2. Zyraxis is ten districts arrayed in a Z (Master Codex · GAMES: "Ten Districts I-X arrayed in
// a Z-shape"; names, numerals and Gemlords from WORLDS · "The 10 Gemlords"). Only Malezor is built. The other nine
// are EMPTY LAND at Malezor's own scale: the same RP7B coast ellipse (145 × 135 tiles at 2 units per tile), each
// with its own coast seed, laid out from the Creator's ten-district map: Zarvane below Malezor (the south road
// and the Zarvane gate already point there), Andrannor and Veridan across the top bar, Netharion on the
// diagonal, then Vorashil → Xilnar → Baelgor → Thardin → Korathen along the bottom bar. Neighbours overlap a
// little so their land joins. Nothing stands in them yet: no roads, buildings, nature, water, loot or enemies.
// expanse.js turns this table into ground; hud.js draws it on the Zyphone world map.
const COAST = { rx: 145 * RP7B.K, ry: 135 * RP7B.K, tx: 58, ty: 103 }; // Malezor's coast, reused for every district
// Signed distance to a district's coast (≤ 0 is land). With Malezor's centre and seed this IS malezorEdge.
export function coastEdge(x, z, c) {
  const lx = x - c.x, lz = z - c.z, tx = lx / RP7B.K + COAST.tx, ty = lz / RP7B.K + COAST.ty, s = c.seed;
  const coast = 1 + Math.sin((ty + s * 31) * 0.105) * 0.055 + Math.sin((tx - s * 17) * 0.073) * 0.038 + Math.sin((tx + ty + s * 53) * 0.041) * 0.028;
  return Math.hypot(lx / COAST.rx, lz / COAST.ry) - coast;
}
// x, z: the centre of the district's coast ellipse in world units · tint: its two ground tones (from the map).
// `land` is the district's land name as lettered on the Creator's map.
export const DISTRICTS = [
  { id: 'malezor', name: 'Malezor', numeral: 'I', land: 'Beastlands', gemlord: 'Rakoron', gem: 'Ruby', x: -6, z: 18, seed: 0.8, tint: ['#98a262', '#5e7644'], built: true },
  { id: 'zarvane', name: 'Zarvane', numeral: 'II', land: 'Auralands', gemlord: 'Ivirium', gem: 'Pearl', x: 162, z: 507, seed: 1.9, tint: ['#c9a24a', '#b0873a'] },
  { id: 'andrannor', name: 'Andrannor', numeral: 'III', land: 'Creaturelands', gemlord: 'Mutaryn', gem: 'Citrine', x: 710, z: 557, seed: 3.1, tint: ['#6a5450', '#544347'] },
  { id: 'veridan', name: 'Veridan', numeral: 'IV', land: 'Naturelands', gemlord: 'Emeralix', gem: 'Emerald', x: 1229, z: 384, seed: 4.6, tint: ['#74a043', '#5b8a36'] },
  { id: 'netharion', name: 'Netharion', numeral: 'V', land: 'Unknownlands', gemlord: 'Eurakeon', gem: 'Amethyst', x: 1075, z: 877, seed: 5.3, tint: ['#7350c2', '#5a3c9e'] },
  { id: 'vorashil', name: 'Vorashil', numeral: 'VI', land: 'Alienlands', gemlord: 'Azurel', gem: 'Sapphire', x: 631, z: 1180, seed: 6.7, tint: ['#b3cee2', '#94b4cf'] },
  { id: 'xilnar', name: 'Xilnar', numeral: 'VII', land: 'Spiritlands', gemlord: 'Obsidius', gem: 'Onyx', x: 1022, z: 1542, seed: 7.2, tint: ['#bdc0cc', '#a4a7b8'] },
  { id: 'baelgor', name: 'Baelgor', numeral: 'VIII', land: 'Humanoidlands', gemlord: 'Ambrevon', gem: 'Amber', x: 1573, z: 1542, seed: 8.4, tint: ['#c2732f', '#a65e27'] },
  { id: 'thardin', name: 'Thardin', numeral: 'IX', land: 'Mechlands', gemlord: 'Oathane', gem: null, x: 2124, z: 1542, seed: 9.5, tint: ['#70909a', '#5b7780'] },
  { id: 'korathen', name: 'Korathen', numeral: 'X', land: 'Ultralands', gemlord: 'Oatheus', gem: null, x: 2674, z: 1518, seed: 10.9, tint: ['#e6d9b0', '#d2c191'] }
];
const REACH_X = COAST.rx * 1.13, REACH_Z = COAST.ry * 1.13; // no coast reaches past this from its centre
export const ZYRAXIS = {
  id: 'zyraxis', name: 'Zyraxis', districts: DISTRICTS,
  bounds: { x0: Math.min(...DISTRICTS.map(d => d.x)) - REACH_X - 12, x1: Math.max(...DISTRICTS.map(d => d.x)) + REACH_X + 12, z0: Math.min(...DISTRICTS.map(d => d.z)) - REACH_Z - 12, z1: Math.max(...DISTRICTS.map(d => d.z)) + REACH_Z + 12 }
};
// Malezor owns its coast wherever its terrain is actually built (the mesh stops one unit short of ±extent).
export const malezorOwns = (x, z) => Math.abs(x) <= MALEZOR.extent - 1 && Math.abs(z) <= MALEZOR.extent - 1 && malezorEdge(x, z) <= 0;
// Which of the nine empty districts a point is in (Malezor not considered): where two overlap, the one whose
// coast the point is deeper inside. `out.edge` receives the winning coast distance. null = no district there.
export function emptyDistrictAt(x, z, out) {
  let best = 0, who = null;
  for (let i = 1; i < DISTRICTS.length; i++) {
    const d = DISTRICTS[i]; if (Math.abs(x - d.x) > REACH_X || Math.abs(z - d.z) > REACH_Z) continue;
    const e = coastEdge(x, z, d); if (e <= best) { best = e; who = d; }
  }
  if (out) out.edge = best;
  return who;
}
// The district record under a point anywhere on Zyraxis (Malezor first), or null over the void.
export const zyraxisDistrictAt = (x, z) => malezorOwns(x, z) ? DISTRICTS[0] : emptyDistrictAt(x, z);
