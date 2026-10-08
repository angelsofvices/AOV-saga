// Terrain, roads, water and the settlement plan for a district.
// Height is authored as layered fields that follow the district wheel:
// highland rises opposite the outbound road, the forest flank rolls,
// the wetland flank sinks toward its river and ponds, the open road
// quarter stays broad and walkable. The civic core and every building
// pad are graded flat so structures sit on the land, not in it.
import * as THREE from 'three';
import { clipCoast } from './coast-mesh.js';
import { overworldEdge } from './overworld-land.js';
import { smooth, lerp, rng, makeNoise, samplePath, SegmentIndex, clamp } from './util.js';
import { quarterWeights } from './world-data.js';

const PAD_R = { championStadium: 36, townHall: 22, academy: 20, shop: 12, gearShop: 13, hospital: 20, zysphereShop: 13, house: 13, research: 27, barn: 20, seerHQ: 20, seerGate: 12, districtGate: 17, sealedChest: 4, fountain: 0, fallenTitan: 20, rubyCave: 18, bridge: 0, fanghall: 20, bloodscentLodge: 20, firstDen: 19, radioTower: 8, treehouse: 12, novariusStatue: 5, ufo: 10 };

// ── Settlement doctrine: find neighbour plots in the forest + highland arc ──
function planSettlement(W, roads) {
  const r = rng(W.seed ^ 0x5e7), plots = [];
  const taken = [...W.structures, ...W.landmarks].map(s => ({ x: s.x, z: s.z, r: (PAD_R[s.recipe] || 8) + 6 }));
  const { tMin, tMax, spacing } = W.settlement;
  const R = W.districtRadius;
  for (let tries = 0; tries < 4000 && plots.length < W.neighbourHomes; tries++) {
    const ang = r.range(-Math.PI, Math.PI), t = r.range(Math.max(tMin, 0.27), tMax);
    const x = Math.sin(ang) * t * R, z = 4 - Math.cos(ang) * t * R;
    const dir = Math.abs(ang) < Math.PI / 4 ? 'N' : Math.abs(ang) > Math.PI * 3 / 4 ? 'S' : ang > 0 ? 'E' : 'W';
    if (!W.settlement.quarters.includes(W.wheel.quarters[dir])) continue;
    const road = roads.nearest(x, z, 14);
    if (!road || road.d < 6.5 || road.d > 13) continue;           // on a lane, never on it
    if (taken.some(o => Math.hypot(x - o.x, z - o.z) < o.r)) continue;
    if (plots.some(p => Math.hypot(x - p.x, z - p.z) < spacing + 2)) continue;
    if (W.ponds.some(p => Math.hypot(x - p.x, z - p.z) < p.r + 10)) continue;
    const face = Math.atan2(road.x - x, road.z - z);               // doors look at the lane
    plots.push({ id: 'home-' + plots.length, recipe: 'house', x, z, face, variant: 1 + (plots.length % 4), lit: r() > 0.25,
      name: 'Malezor home', kind: 'home', note: 'A Malezor family lives here.', t });
  }
  return plots;
}

export function createTerrain(W, shared) {
  const noise = makeNoise(W.seed), N = makeNoise(W.seed + 17);

  // Roads + river as indexed polylines.
  const roads = new SegmentIndex(8);
  for (const rd of W.roads) roads.add(rd.id, samplePath(rd.pts, 1), { width: rd.width, late: !!rd.late });
  const riverPts = samplePath(W.river, 1);
  const riverIdx = new SegmentIndex(8); riverIdx.add('river', riverPts, { width: 6 });

  const homes = W.homes || planSettlement(W, roads);
  const allSites = [...W.structures, ...homes, ...W.landmarks];
  const pads = allSites.filter(s => PAD_R[s.recipe]).map(s => ({ x: s.x, z: s.z, r: s.id === 'player-home' ? 18 : PAD_R[s.recipe], k: s.recipe === 'fallenTitan' ? 0.55 : s.recipe === 'rubyCave' ? 0.35 : 1, late: !!s.late, easeR: s.padEase || 0 }));

  // Layer 1 — the land itself, following the wheel.
  function raw(x, z) {
    // Keep the height field continuous for coast intersections. Offshore triangles
    // are trimmed later, rather than pulling boundary cells down to a void floor.
    const n1 = noise.fbm(x * 0.018, z * 0.018), n2 = N.fbm(x * 0.06, z * 0.06, 3);
    let h = 1.1 + n1 * 2.2 + n2 * 0.55;
    const north = smooth(18, 190, W.center.z - z);
    h += north * (13 + 7 * noise.fbm(x * 0.03 + 9, z * 0.03 - 3)) + north * north * 6;
    h += 7.5 * smooth(-154, -174, z) * (1 - smooth(18, 56, Math.abs(x + 78)) * 0.6); // escarpment behind Rakoron's Cave
    const west = smooth(30, 205, W.center.x - x) * (1 - north * 0.5);
    h += west * (2.2 + 3.4 * Math.max(0, N.fbm(x * 0.045 + 4, z * 0.045)) * 2);
    const east = smooth(34, 205, x - W.center.x) * (1 - north * 0.85);
    h -= east * 2.4;
    const south = smooth(12, 205, z - W.center.z);
    h -= south * 2.4;
    h += south * (0.65 * Math.sin(x * 0.025 + 1.2) * Math.cos(z * 0.022));
    const coast = W.edge ? W.edge(x, z) : 0;
    h += (1 - smooth(-0.045, 0.005, coast)) * (12 + 4 * noise.fbm(x * 0.05, z * 0.05));
    return h;
  }
  // Layer 1b — Malezor Central is eased: inside the central ring the land follows a heavily
  // smoothed copy of itself, so it keeps its elevation (the north still climbs) but rises as a
  // long gradual ramp instead of lumps and drop-offs. Outside the ring the land is untouched.
  const CR = W.centralRadius || 0;
  const central = (() => {
    if (!CR) return null;
    const G = 4, span = CR + 95, n = Math.ceil(span * 2 / G) + 1, x0 = W.hub.x - span, z0 = W.hub.z - span;
    let A = new Float32Array(n * n), B = new Float32Array(n * n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) A[j * n + i] = raw(x0 + i * G, z0 + j * G);
    const sig = 24 / G, rad = Math.ceil(sig * 3), k = [];
    for (let t = -rad; t <= rad; t++) k.push(Math.exp(-(t * t) / (2 * sig * sig)));
    const blur = (src, dst, dx, dy) => { for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      let s = 0, w = 0;
      for (let t = -rad; t <= rad; t++) { const ii = i + t * dx, jj = j + t * dy; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue; s += src[jj * n + ii] * k[t + rad]; w += k[t + rad]; }
      dst[j * n + i] = s / w;
    } };
    blur(A, B, 1, 0); blur(B, A, 0, 1);
    return (x, z) => {
      const fx = clamp((x - x0) / G, 0, n - 1.001), fz = clamp((z - z0) / G, 0, n - 1.001), i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
      const a = A[j * n + i], b = A[j * n + i + 1], c = A[(j + 1) * n + i], d = A[(j + 1) * n + i + 1];
      return lerp(lerp(a, b, u), lerp(c, d, u), v);
    };
  })();
  const hubD = (x, z) => Math.hypot(x - W.hub.x, z - W.hub.z);
  const centralW = (x, z) => CR ? 1 - smooth(CR - 25, CR + 15, hubD(x, z)) : 0;
  function land(x, z) {
    const h = raw(x, z), w = centralW(x, z);
    return w > 0 ? lerp(h, central(x, z), w) : h;
  }
  // The civic core sits level at the land's own height (it used to be sunk into a pit).
  const coreH = CR ? central(W.hub.x, W.hub.z) : raw(W.hub.x, W.hub.z) * 0.4 + 1.3;
  const coreIn = CR ? W.coreRadius - 6 : W.coreRadius - 8, coreOut = CR ? W.coreRadius + 30 : W.coreRadius + 12;
  // Layer 2 — civic core and building pads graded flat.
  function graded(x, z) {
    let h = land(x, z);
    const dc = Math.hypot(x - W.hub.x, (z - W.hub.z) * 1.1);
    h = lerp(h, coreH, (1 - smooth(coreIn, coreOut, dc)) * 0.92);
    let sw = 0, swh = 0, wmax = 0;
    for (const p of pads) {
      const d = Math.hypot(x - p.x, z - p.z); if (d > p.r + p.ease) continue;
      const w = (1 - smooth(p.r, p.r + p.ease, d)) * p.k;
      if (!p.central) { h = lerp(h, p.h, w); continue; }
      // Central pads blend together, nearest pad winning, so every pad's rim meets its own level.
      const m = w / (Math.max(0, d - p.r) + 0.5) ** 4; sw += m; swh += m * p.h; wmax = Math.max(wmax, w);
    }
    if (sw > 0) h = lerp(h, swh / sw, wmax);
    return h;
  }
  for (const p of pads) { p.h = 0; p.central = CR > 0 && p.k === 1 && hubD(p.x, p.z) < CR - 10; p.ease = p.easeR || (p.central && hubD(p.x, p.z) < CR - 45 ? 34 : 22); } // central pads ease out wider
  for (const p of pads) { let s = 0; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; s += land(p.x + Math.cos(a) * p.r * 0.6, p.z + Math.sin(a) * p.r * 0.6); } p.h = s / 8; }
  for (const p of pads) { const dc = Math.hypot(p.x - W.hub.x, (p.z - W.hub.z) * 1.1); p.h = lerp(p.h, coreH, 1 - smooth(coreIn, coreOut, dc)); }
  // Neighbouring central pads may only differ by a gentle grade across the ground between them,
  // so no building sits at the foot of another's cliff. Core pads hold still; the rest settle.
  if (CR) {
    const cp = pads.filter(p => p.central), GRADE = 0.2;
    for (let it = 0; it < 60; it++) for (let i = 0; i < cp.length; i++) for (let j = i + 1; j < cp.length; j++) {
      const a = cp[i], b = cp[j], gap = Math.hypot(a.x - b.x, a.z - b.z) - a.r - b.r;
      if (gap > 40) continue;
      const allow = 0.4 + GRADE * Math.max(0, gap), diff = b.h - a.h, over = Math.abs(diff) - allow;
      if (over <= 0) continue;
      const held = p => hubD(p.x, p.z) < W.coreRadius, fa = held(a) ? 0 : 1 / (a.r * a.r), fb = held(b) ? 0 : 1 / (b.r * b.r);
      if (!(fa + fb)) continue;
      const s = Math.sign(diff) * over * 0.5 / (fa + fb);
      a.h += s * fa; b.h -= s * fb;
    }
  }

  // Where water gathers on the lanes: the low points of each dirt road, well clear of buildings, plaza, river and ponds.
  const puddles = [];
  for (const rd of W.roads) {
    const pts = samplePath(rd.pts, 1), hh = pts.map(([x, z]) => graded(x, z)), S = 9;
    for (let i = S; i < pts.length - S; i++) {
      let low = true; for (let k = -S; k <= S && low; k++) if (hh[i + k] < hh[i]) low = false;
      if (!low || hh[i - S] - hh[i] < 0.07 || hh[i + S] - hh[i] < 0.07) continue;
      const [x, z] = pts[i];
      if (W.containsLand && !W.containsLand(x, z)) continue;
      if (Math.hypot(x - W.plaza.x, z - W.plaza.z) < W.plaza.r + 8 || pads.some(p => Math.hypot(x - p.x, z - p.z) < p.r + 3)) continue;
      if (riverIdx.nearest(x, z, 14) || W.ponds.some(p => Math.hypot(x - p.x, z - p.z) < p.r * 2.2) || puddles.some(q => Math.hypot(x - q.x, z - q.z) < 16)) continue;
      puddles.push({ x, z, r: clamp(rd.width * 0.75, 1.1, 2.1) });
    }
  }

  // Layer 3 — roads graded across, then the river cuts its channel, ponds sink in.
  function final(x, z, out) {
    let h = graded(x, z);
    const rd = roads.nearest(x, z, 7);
    let road = 0;
    if (rd) {
      const w = rd.line.data.width;
      road = 1 - smooth(w * 0.55, w + 0.9, rd.d);
      const hc = graded(rd.x, rd.z);
      h = lerp(h, hc - 0.05, (1 - smooth(w, w + 4, rd.d)) * 0.85);
    }
    const rv = riverIdx.nearest(x, z, 9);
    let river = 0;
    for (const p of W.ponds) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r * 1.9) h = lerp(h, p.base ??= graded(p.x, p.z), 1 - smooth(p.r * 1.15, p.r * 1.9, d)); } // a pond's shore is levelled first, so its basin holds water all the way round
    if (rv) { river = Math.exp(-((rv.d / 3.8) ** 2)); h -= 2.3 * river + 0.6 * Math.exp(-((rv.d / 6) ** 2)); } // a broad, deep channel: the water fills it bank to bank
    let pond = 0;
    for (const p of W.ponds) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r * 1.8) { const k = 1 - smooth(p.r * 0.2, p.r * 1.25, d); pond = Math.max(pond, k); h -= 3.1 * k; } }
    // Puddles: rain collects in the dips of the dirt lanes (never on grass). Each sits in a shallow scoop of the road.
    for (const q of puddles) { const d = Math.hypot(x - q.x, z - q.z); if (d < q.r * 1.2) h -= 0.2 * (1 - smooth(q.r * 0.15, q.r * 1.1, d)); }
    // Roads and water shape the landscape, but may not warp the ground beneath
    // a building. Reapply the fully level building pads as the final height pass.
    for (const p of pads) {
      const d = Math.hypot(x - p.x, z - p.z);
      if (d < p.r - 0.75) h = lerp(h, p.h, p.k);
    }
    if (out) { out.road = road; out.river = river; out.pond = pond; out.roadId = rd && road > 0.05 ? rd.line.id : null; }
    return h;
  }

  // Height grid — the mesh and every runtime height query read the same numbers.
  // Keep the original 0.875-unit terrain grid. The expanded grid is aligned
  // to the old ±112 edge, so every existing center vertex stays in place.
  const E = W.extent, SIZE = E * 2, STEP_TARGET = 0.875, DIV = Math.round(SIZE / STEP_TARGET), STEP = SIZE / DIV, VN = DIV + 1;
  const H = new Float32Array(VN * VN), ROAD = new Float32Array(VN * VN), WET = new Float32Array(VN * VN);
  const tmp = {};
  for (let iz = 0; iz < VN; iz++) for (let ix = 0; ix < VN; ix++) {
    const x = -E + ix * STEP, z = -E + iz * STEP, i = iz * VN + ix;
    H[i] = final(x, z, tmp); ROAD[i] = tmp.road * (tmp.roadId === 'zarvane-road' ? 1 : 0.92); WET[i] = Math.max(tmp.river, tmp.pond);
  }
  function heightAt(x, z) {
    const fx = clamp((x + E) / STEP, 0, DIV - 1e-4), fz = clamp((z + E) / STEP, 0, DIV - 1e-4);
    const ix = Math.floor(fx), iz = Math.floor(fz), u = fx - ix, v = fz - iz;
    const a = H[iz * VN + ix], b = H[iz * VN + ix + 1], c = H[(iz + 1) * VN + ix], d = H[(iz + 1) * VN + ix + 1];
    return u + v <= 1 ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v);
  }
  const gridAt = (arr, x, z) => arr[clamp(Math.round((z + E) / STEP), 0, DIV) * VN + clamp(Math.round((x + E) / STEP), 0, DIV)];
  const roadAt = (x, z) => gridAt(ROAD, x, z);

  // Water surfaces: the river ribbon sits a fixed depth above its bed; ponds fill to their rim.
  const riverBed = riverPts.map(([x, z]) => heightAt(x, z));
  const riverSurf = riverBed.map((_, i) => { let s = 0, n = 0; for (let k = -6; k <= 6; k++) { const b = riverBed[i + k]; if (b !== undefined) { s += b; n++; } } return s / n + 1.7; }); // the surface follows the bed, eased along its length: no dry stretches
  for (const p of W.ponds) {
    let m = Infinity; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; m = Math.min(m, heightAt(p.x + Math.cos(a) * p.r * 1.05, p.z + Math.sin(a) * p.r * 1.05)); }
    p.level = Math.max(m - 0.1, (p.base ?? m) - 0.12); // brim-full to its levelled shore
  }
  for (let i = 0; i < riverPts.length; i++) for (const p of W.ponds) { // where the river runs through a pond they share one surface
    const d = Math.hypot(riverPts[i][0] - p.x, riverPts[i][1] - p.z); if (d < p.r * 2.6) riverSurf[i] = lerp(riverSurf[i], p.level, 1 - smooth(p.r * 1.3, p.r * 2.6, d));
  }
  for (const q of puddles) { // a puddle fills to the lowest point of its rim; one that would drain away is dropped
    let m = Infinity; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; m = Math.min(m, heightAt(q.x + Math.cos(a) * q.r * 1.15, q.z + Math.sin(a) * q.r * 1.15)); }
    q.level = m - 0.02; q.ok = q.level - heightAt(q.x, q.z) > 0.06;
  }
  // The water level that governs a spot (river or pond), for painting the banks: -Infinity away from water.
  function shoreAt(x, z) {
    let best = -Infinity; const rv = riverIdx.nearest(x, z, 10);
    if (rv) best = riverSurf[rv.i] + (riverSurf[Math.min(riverSurf.length - 1, rv.i + 1)] - riverSurf[rv.i]) * rv.t;
    for (const p of W.ponds) if (Math.hypot(x - p.x, z - p.z) < p.r * 1.9) best = Math.max(best, p.level);
    return best;
  }
  function waterAt(x, z) { // surface height or -Infinity
    let best = -Infinity;
    const rv = riverIdx.nearest(x, z, 5.4);
    if (rv) best = riverSurf[rv.i] + (riverSurf[rv.i + 1] - riverSurf[rv.i]) * rv.t;
    for (const p of W.ponds) if (Math.hypot(x - p.x, z - p.z) < p.r * 1.22) best = Math.max(best, p.level);
    return best;
  }

  // ── Terrain mesh with painted vertex colours ──
  const pos = new Float32Array(VN * VN * 3), col = new Float32Array(VN * VN * 3), idx = [];
  for (let iz = 0; iz < VN; iz++) for (let ix = 0; ix < VN; ix++) {
    const i = iz * VN + ix; pos[i * 3] = -E + ix * STEP; pos[i * 3 + 1] = H[i]; pos[i * 3 + 2] = -E + iz * STEP;
    if (ix < DIV && iz < DIV) { const a = i, b = a + 1, c = a + VN, d = c + 1; idx.push(a, c, b, b, c, d); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const nrm = geo.attributes.normal.array;
  const C = hex => new THREE.Color(hex);
  const pal = {
    core: [C('#86975f'), C('#7e9159')], open: [C('#98a262'), C('#8c9a5a')], forest: [C('#5e7644'), C('#6a7f4a')],
    wetland: [C('#6d8a52'), C('#61804c')], highland: [C('#8a955f'), C('#7c8a58')],
    rock: C('#8b877a'), rockDark: C('#6f6c62'), road: C('#b39a6b'), roadEdge: C('#9d8a60'), mud: C('#6b6447'), sand: C('#a89a74'), plaza: C('#aea48d')
  };
  const c = new THREE.Color(), c2 = new THREE.Color(), c3 = new THREE.Color();
  const ringStone = C('#b6b09f'), ringSand = C('#cdbd8c'), ringDirt = C('#97794d');
  const FOOT = { house: 6.5, shop: 6.5, gearShop: 7, zysphereShop: 7.5, hospital: 10, townHall: 12, academy: 11, research: 13, barn: 10, seerHQ: 10, fanghall: 10, bloodscentLodge: 10, firstDen: 10, treehouse: 6 };
  const feet = pads.filter(p => FOOT[allSites.find(s => s.x === p.x && s.z === p.z)?.recipe]).map(p => ({ x: p.x, z: p.z, r: FOOT[allSites.find(s => s.x === p.x && s.z === p.z).recipe] + (p.r === 18 ? 1 : 0) }));
  for (let i = 0; i < VN * VN; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2], ny = nrm[i * 3 + 1];
    const n = noise.noise(x * 0.11, z * 0.11) * 0.5 + 0.5, n2 = N.noise(x * 0.35, z * 0.35) * 0.5 + 0.5;
    const wts = quarterWeights(x, z, W); c.setRGB(0, 0, 0);
    for (const k in wts) if (wts[k] > 0) { c2.copy(pal[k][0]).lerp(pal[k][1], n); c.r += c2.r * wts[k]; c.g += c2.g * wts[k]; c.b += c2.b * wts[k]; }
    c.multiplyScalar(0.92 + n2 * 0.14);
    c3.copy(c); // the plain grass here, kept for ground that must stay grass (under buildings)
    const steep = smooth(0.9, 0.72, ny);
    c.lerp(n > 0.5 ? pal.rock : pal.rockDark, steep * 0.9);
    c.lerp(pal.rock, smooth(20, 30, y) * 0.35);
    const wet = WET[i]; if (wet > 0.05) c.lerp(wet > 0.5 ? pal.mud : pal.sand, smooth(0.05, 0.4, wet) * 0.85);
    // Banks: wherever the ground dips to the waterline it is bare mud and silt, so water only ever meets dirt.
    const sl = shoreAt(x, z); if (sl > -1e9) c.lerp(y < sl ? pal.mud : pal.sand, 1 - smooth(sl + 0.12, sl + 0.75, y));
    const rd = ROAD[i]; if (rd > 0) { c2.copy(pal.roadEdge).lerp(pal.road, smooth(0.2, 0.9, rd)); c.lerp(c2, smooth(0, 0.6, rd) * (0.75 + n2 * 0.25)); }
    for (const q of puddles) if (q.ok) { const d = Math.hypot(x - q.x, z - q.z); if (d < q.r * 1.5) c.lerp(pal.mud, (1 - smooth(q.r * 0.5, q.r * 1.5, d)) * 0.7); } // wet earth round a puddle
    // Malezor Square: fountain stone > sand > dirt > grass, each ring a tight band (about one unit of blend), nothing graded wide.
    const dp = Math.hypot(x - W.plaza.x, z - W.plaza.z);
    if (dp < 13) {
      const ringK = 1 - smooth(11.6, 12.4, dp);
      c2.copy(ringDirt); if (dp < 8.6) c2.copy(ringSand); if (dp < 5.2) c2.copy(ringStone);
      const bS = smooth(4.7, 5.7, dp), bD = smooth(8.1, 9.1, dp); // blends between neighbouring rings
      if (dp >= 4.7 && dp < 5.7) c2.copy(ringStone).lerp(ringSand, bS); else if (dp >= 8.1 && dp < 9.1) c2.copy(ringSand).lerp(ringDirt, bD);
      c.lerp(c2.offsetHSL(0, 0, (n2 - 0.5) * 0.04), ringK);
    }
    // Buildings stand on grass only: no road, sand, dirt or paving under a footprint (a short band of blend at its edge).
    for (const f of feet) { const d = Math.hypot(x - f.x, z - f.z); if (d < f.r + 0.8) c.lerp(c3, 1 - smooth(f.r - 0.6, f.r + 0.8, d)); }
    // Only an outer shore gets bare ground; district borders remain continuous.
    c.lerp(pal.sand, (1 - smooth(1, 10, -overworldEdge(x, z))) * .65);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  if (W.edge) clipCoast(geo, (x, z) => Math.max(W.edge(x, z) * 290, Math.abs(x) - (E - 1), Math.abs(z) - (E - 1)), {
    // District joins are land, not cliffs. Only outer shores receive a skirt.
    skirt: (x, z) => overworldEdge(x, z) > -0.04
  });
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, metalness: 0 }));
  // Ground detail: the painted colours stay, and the grass gets real variation over them: lush and sun-dried
  // patches, darker clumps, fine blade grain up close, and bare soil showing through thin spots. Dirt and rock
  // only get a little grit.
  mesh.material.onBeforeCompile = sh => {
    sh.vertexShader = 'varying vec3 vGroundW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vGroundW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = `varying vec3 vGroundW;
      float gHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float gNoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(gHash(i), gHash(i+vec2(1.,0.)), f.x), mix(gHash(i+vec2(0.,1.)), gHash(i+vec2(1.,1.)), f.x), f.y); }
      ` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      {
        vec3 gc = diffuseColor.rgb; vec2 gp = vGroundW.xz;
        float grassy = smoothstep(0.0, 0.035, gc.g - max(gc.r * 0.97, gc.b));
        float nearK = 1.0 - smoothstep(22.0, 75.0, length(cameraPosition - vGroundW));
        float patches = gNoise(gp * 0.06) * 0.55 + gNoise(gp * 0.19 + 5.3) * 0.3 + gNoise(gp * 0.55 + 9.1) * 0.15;
        float clump = gNoise(gp * 1.25 + 2.7);
        vec2 sp = vec2(gp.x * 0.83 + gp.y * 0.56, gp.y * 0.83 - gp.x * 0.56), sq = vec2(gp.x * 0.34 - gp.y * 0.94, gp.y * 0.34 + gp.x * 0.94);
        float blades = smoothstep(0.2, 0.8, gNoise(sp * vec2(17.0, 6.0))) * 0.4 + smoothstep(0.2, 0.8, gNoise(sq * vec2(15.0, 5.5) + 17.0)) * 0.3 + gNoise(gp * 19.0 + 4.0) * 0.3;
        vec3 lush = gc * vec3(0.72, 0.94, 0.62), dry = gc * vec3(1.16, 1.07, 0.78);
        vec3 gr = mix(lush, dry, smoothstep(0.34, 0.68, patches));
        gr *= 0.84 + 0.30 * clump;
        gr *= mix(1.0, 0.76 + 0.48 * blades, nearK);
        float bare = smoothstep(0.72, 0.9, gNoise(gp * 0.42 + 31.0)) * smoothstep(0.45, 0.8, gNoise(gp * 2.1 + 3.0));
        gr = mix(gr, vec3(0.20, 0.155, 0.095), bare * 0.55);
        vec3 grit = gc * (0.90 + 0.20 * gNoise(gp * 3.1) * nearK + 0.06 * gNoise(gp * 0.4));
        diffuseColor.rgb = mix(grit, gr, grassy);
      }`);
  };
  mesh.material.customProgramCacheKey = () => 'ground-detail';
  mesh.receiveShadow = true; mesh.name = 'terrain';

  // ── Water ──
  const water = makeWaterMaterial(shared);
  const group = new THREE.Group();
  {
    const p = [], uv = [], ix = [], hw = 5.4; // wider than the channel: the banks rise through its edges
    let acc = 0;
    for (let i = 0; i < riverPts.length; i++) {
      const a = riverPts[Math.max(0, i - 1)], b = riverPts[Math.min(riverPts.length - 1, i + 1)];
      const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L * hw, nz = dx / L * hw;
      const [x, z] = riverPts[i], y = riverSurf[i];
      if (i) acc += Math.hypot(x - riverPts[i - 1][0], z - riverPts[i - 1][1]);
      p.push(x + nx, y, z + nz, x - nx, y, z - nz); uv.push(0, acc, 1, acc);
      if (i < riverPts.length - 1) { const n = i * 2; ix.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix);
    const m = new THREE.Mesh(g, water.river); m.renderOrder = 1; group.add(m);
  }
  for (const p of W.ponds) {
    const g = new THREE.CircleGeometry(p.r * 1.22, 40); g.rotateX(-Math.PI / 2);
    const uvs = g.attributes.uv; for (let i = 0; i < uvs.count; i++) uvs.setXY(i, uvs.getX(i) * 0.5, uvs.getY(i) * 0.5);
    const m = new THREE.Mesh(g, water.pond); m.position.set(p.x, p.level, p.z); m.renderOrder = 1; group.add(m);
  }

  for (const q of puddles) if (q.ok) {
    const g = new THREE.CircleGeometry(q.r * 1.2, 18); g.rotateX(-Math.PI / 2);
    const uvs = g.attributes.uv; for (let i = 0; i < uvs.count; i++) uvs.setXY(i, uvs.getX(i) * 0.3 + 0.1, uvs.getY(i) * 0.3 + 0.1);
    const m = new THREE.Mesh(g, water.pond); m.position.set(q.x, q.level, q.z); m.renderOrder = 1; group.add(m);
  }

  const colorAt = (x, z, out = new THREE.Color()) => {
    const fx = clamp((x + E) / STEP, 0, DIV - 1e-4), fz = clamp((z + E) / STEP, 0, DIV - 1e-4);
    const ix = Math.floor(fx), iz = Math.floor(fz), u = fx - ix, v = fz - iz, k = iz * VN + ix;
    const a = u + v <= 1 ? k : k + VN + 1, b = u + v <= 1 ? k + 1 : k + VN, d = u + v <= 1 ? k + VN : k + 1;
    const bu = u + v <= 1 ? u : 1 - u, dv = u + v <= 1 ? v : 1 - v;
    return out.setRGB(...[0, 1, 2].map(c => col[a * 3 + c] + (col[b * 3 + c] - col[a * 3 + c]) * bu + (col[d * 3 + c] - col[a * 3 + c]) * dv));
  };
  return { mesh, water: group, puddles: puddles.filter(q => q.ok), waterMats: water, heightAt, colorAt, waterAt, roadAt, roads, riverIdx, homes, sites: allSites, pads, extent: E };
}

// Stylised water: flowing ripples, fresnel sky reflection, sun glint, foam at the banks.
export function makeWaterMaterial(shared) {
  const base = {
    uTime: shared.uTime, uSunDir: shared.uSunDir, uSunColor: shared.uSunColor, uSky: shared.uSkyHorizon, uNight: shared.uNight,
    uDeep: { value: new THREE.Color('#2f5f63') }, uShallow: { value: new THREE.Color('#6fa39c') }
  };
  const vs = `
    varying vec2 vUv; varying vec3 vWorld;
    #include <fog_pars_vertex>
    void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position,1.0); vWorld = wp.xyz;
      vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`;
  const fs = (flow) => `
    uniform float uTime, uNight; uniform vec3 uSunDir, uSunColor, uSky, uDeep, uShallow;
    varying vec2 vUv; varying vec3 vWorld;
    #include <fog_pars_fragment>
    float h(vec2 p){ return sin(p.x*1.7+sin(p.y*1.3))*0.5 + sin(p.y*2.3+p.x*0.7)*0.5; }
    void main(){
      vec2 p = ${flow ? 'vec2(vUv.x*6.0, vUv.y*0.9 - uTime*1.6)' : 'vWorld.xz*0.55 + vec2(uTime*0.12, uTime*0.07)'};
      float e = 0.05;
      float r0 = h(p) + 0.5*h(p*2.3 + 3.1 + uTime*0.4);
      float rx = h(p+vec2(e,0.)) + 0.5*h((p+vec2(e,0.))*2.3 + 3.1 + uTime*0.4);
      float rz = h(p+vec2(0.,e)) + 0.5*h((p+vec2(0.,e))*2.3 + 3.1 + uTime*0.4);
      vec3 n = normalize(vec3((r0-rx)*0.9, 1.0, (r0-rz)*0.9));
      vec3 v = normalize(cameraPosition - vWorld);
      float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
      float edge = ${flow ? 'smoothstep(0.32, 0.5, abs(vUv.x-0.5))' : 'smoothstep(0.34, 0.5, length(vUv-0.25))'};
      vec3 col = mix(uDeep, uShallow, 0.35 + 0.35*edge + 0.15*r0);
      col = mix(col, uSky, fres*0.75);
      vec3 hdir = normalize(uSunDir + v);
      float spec = pow(max(dot(n, hdir), 0.0), 140.0) * step(0.0, uSunDir.y);
      col += uSunColor * spec * 1.4;
      float foam = edge * smoothstep(0.35, 0.9, r0*0.5+0.5);
      col = mix(col, vec3(0.86,0.93,0.9), foam*0.35);
      col *= mix(1.0, 0.45, uNight);
      gl_FragColor = vec4(col, mix(0.82, 0.95, fres));
      #include <fog_fragment>
    }`;
  const mk = flow => new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {}]), vertexShader: vs, fragmentShader: fs(flow),
    transparent: true, fog: true, depthWrite: false, side: THREE.DoubleSide
  });
  const river = mk(true), pond = mk(false);
  for (const m of [river, pond]) Object.assign(m.uniforms, base);
  return { river, pond };
}
