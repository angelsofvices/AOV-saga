// RP7D · cave interiors (RP7D Cave System V1.1 · §2, §7, §8 and §6 steps 9–12).
//
// One continuous 3D interior per cave. Its floors are levels of the same space, stacked: mountain caves rise from
// Floor 1, canyon caves sink. Floors are joined by real spiral staircases (a helical ramp of treads round a stone
// pillar) that Rizer walks: no loading between floors, no teleports. Each cave lives in its own region of the same
// world, far beyond the coast (REGION), and world.js hands every physical query there to this module, so Rizer,
// the Seers and the camera use the exact same rules as outside.
//
// Layout (per floor, deterministic from the cave's layoutSeed): a GW × GH grid of CELL-unit cells. Chambers are
// placed and joined by tunnels into one guaranteed-connected plan:
//   · Floor 1: the entrance chamber at the bottom centre, the mouth (way back out) at its bottom edge
//   · every staircase stands in the upper-left or lower-left of the plan (layout space), alternating floor to floor,
//     so the arrival from below and the climb onward are both on the left
//   · Floor 2: a crystal vein (rare Everstone + an Astralite) · Floors 1–2: an NPC
//   · Floor 3 (Ancient and Gemlord caves): a Seer patrol through its chambers; Ancient caves keep a raid cache
//   · Floor 4 (Gemlord): the Gemlord's sanctum, a fixed chamber on the right of the plan
//   · the last staircase is blocked by boulders until Rizer smashes through (a permanent clear, saved)
import * as THREE from 'three';
import { seeded } from './caves-data.js';

export const CAVE_GRID = { CELL: 3, GW: 26, GH: 20, GAP: 6.5, WALL: 5.6, STAIR_R: 3.4, PILLAR_R: 0.85, CHAMBER: 2.6 };
export const REGION = { x0: 6000, z0: 6000, pitch: 120 }; // cave i's plan starts at x0 + i·pitch
const { CELL, GW, GH, GAP, WALL, STAIR_R, PILLAR_R } = CAVE_GRID;

// ── the plan ──
function planCave(cave, index) {
  const ox = REGION.x0 + index * REGION.pitch, oz = REGION.z0, dir = cave.verticalDirection === 'up' ? 1 : -1, n = cave.floorCount;
  const rand = seeded(cave.layoutSeed);
  const at = (c, r) => ({ x: ox + (c + 0.5) * CELL, z: oz + (r + 0.5) * CELL });
  const floorY = k => (k - 1) * GAP * dir;
  // staircase k joins floor k and floor k + 1: odd ones upper-left, even ones lower-left (layout space)
  const stairs = [];
  for (let k = 1; k < n; k++) {
    const upper = k % 2 === 1, c = 3 + rand.int(0, 2), r = upper ? 3 + rand.int(0, 2) : GH - 5 - rand.int(0, 2);
    const p = at(c, r); stairs.push({ k, c, r, x: p.x, z: p.z, a0: rand() * Math.PI * 2, yA: floorY(k), yB: floorY(k + 1), region: upper ? 'upper-left' : 'lower-left' });
  }
  const floors = [];
  for (let k = 1; k <= n; k++) {
    const fr = seeded(`${cave.layoutSeed}:floor${k}`), grid = new Uint8Array(GW * GH), rooms = [];
    const room = (c, r, rad, tag) => { rooms.push({ c, r, rad, tag }); for (let j = Math.max(1, r - rad - 1); j <= Math.min(GH - 2, r + rad + 1); j++) for (let i = Math.max(1, c - rad - 1); i <= Math.min(GW - 2, c + rad + 1); i++) if (Math.hypot(i - c, (j - r) * 1.1) <= rad + 0.35) grid[j * GW + i] = 1; };
    if (k === 1) room(Math.floor(GW / 2), GH - 4, 2.6, 'entrance');
    if (k > 1) { const s = stairs[k - 2]; room(s.c, s.r, CAVE_GRID.CHAMBER, 'arrive'); }
    if (k < n) { const s = stairs[k - 1]; room(s.c, s.r, CAVE_GRID.CHAMBER, 'stair'); }
    if (cave.classification === 'gemlord' && k === n) room(GW - 7, Math.floor(GH / 2), 4.2, 'sanctum');
    if (cave.rarity === 'ancient' && k === 3) room(GW - 6, 4 + fr.int(0, 3), 2.4, 'raid');
    const extra = 4 + fr.int(0, 2);
    for (let t = 0, made = 0; t < 60 && made < extra; t++) {
      const c = fr.int(9, GW - 4), r = fr.int(3, GH - 4), rad = 1.4 + fr() * 1.8;
      if (rooms.some(q => Math.hypot(q.c - c, q.r - r) < q.rad + rad + 1.5)) continue;
      room(c, r, rad, made === 0 && k <= 2 ? 'npc' : made === 1 && k === 2 ? 'vein' : 'room'); made++;
    }
    // tunnels: a minimum spanning tree over the chambers (plus one loop), each an L of two-cell-wide passage
    const inTree = [0], edges = [];
    while (inTree.length < rooms.length) {
      let best = null;
      for (const a of inTree) for (let b = 0; b < rooms.length; b++) if (!inTree.includes(b)) { const d = Math.hypot(rooms[a].c - rooms[b].c, rooms[a].r - rooms[b].r); if (!best || d < best.d) best = { a, b, d }; }
      inTree.push(best.b); edges.push(best);
    }
    if (rooms.length > 3) edges.push({ a: 1, b: rooms.length - 1 });
    const carve = (c, r) => { for (const [dc, dr] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const i = c + dc, j = r + dr; if (i > 0 && j > 0 && i < GW - 1 && j < GH - 1) grid[j * GW + i] = 1; } };
    for (const e of edges) {
      const A = rooms[e.a], B = rooms[e.b], horizFirst = fr() < 0.5;
      let c = A.c, r = A.r;
      const stepTo = (tc, tr) => { while (c !== tc) { c += Math.sign(tc - c); carve(c, r); } while (r !== tr) { r += Math.sign(tr - r); carve(c, r); } };
      if (horizFirst) { stepTo(B.c, A.r); stepTo(B.c, B.r); } else { stepTo(A.c, B.r); stepTo(B.c, B.r); }
    }
    if (k === 1) { const c = Math.floor(GW / 2); for (let j = GH - 4; j < GH; j++) for (const i of [c - 1, c, c + 1]) grid[j * GW + i] = 1; } // the mouth runs out to the plan's bottom edge
    floors.push({ k, y: floorY(k), grid, rooms: rooms.map(q => ({ ...q, ...at(q.c, q.r) })) });
  }
  const mouth = { ...at(Math.floor(GW / 2), GH - 1), y: 0 };
  const entry = { ...at(Math.floor(GW / 2), GH - 4), face: Math.PI };
  return { cave, index, ox, oz, x1: ox + GW * CELL, z1: oz + GH * CELL, dir, floors, stairs, floorY, mouth, entry };
}

// ── physics: the floor under a point at a height, the walls round it, and the camera's line of sight ──
function physicsOf(P, blockers) {
  const cellOf = (x, z) => { const c = Math.floor((x - P.ox) / CELL), r = Math.floor((z - P.oz) / CELL); return c < 0 || r < 0 || c >= GW || r >= GH ? -1 : r * GW + c; };
  const walk = (f, x, z) => { const i = cellOf(x, z); return i >= 0 && f.grid[i] === 1; };
  const helix = (s, x, z) => { // height of the staircase treads under (x, z), or null off the treads
    const dx = x - s.x, dz = z - s.z, r = Math.hypot(dx, dz); if (r < PILLAR_R || r > STAIR_R) return null;
    let a = Math.atan2(dx, dz) - s.a0; a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return s.yA + (s.yB - s.yA) * (a / (Math.PI * 2));
  };
  const upperOf = s => Math.max(s.yA, s.yB);
  // every surface at (x, z): each floor's rock (except over a stairwell it is the top of), and the staircase treads
  function candidates(x, z, out = []) {
    out.length = 0;
    for (const f of P.floors) {
      if (!walk(f, x, z)) continue;
      let hole = false; for (const s of P.stairs) if (upperOf(s) === f.y && Math.hypot(x - s.x, z - s.z) < STAIR_R) { hole = true; break; }
      if (!hole) out.push(f.y);
    }
    for (const s of P.stairs) { const h = helix(s, x, z); if (h !== null) out.push(h); }
    return out;
  }
  const tmp = [];
  function groundAt(x, z, y) {
    const C = candidates(x, z, tmp); if (!C.length) return (y ?? P.floors[0].y) - 30;
    const ref = y === undefined ? P.refY : y; let best = -Infinity;
    for (const h of C) if (h <= ref + 0.6 && h > best) best = h;
    if (best === -Infinity) { best = Infinity; for (const h of C) best = Math.min(best, h); }
    return best;
  }
  const floorIndexAt = y => { let best = 0, by = -Infinity; P.floors.forEach((f, i) => { if (f.y <= y + 0.6 && f.y > by) { by = f.y; best = i; } }); if (by === -Infinity) { let lo = Infinity; P.floors.forEach((f, i) => { if (f.y < lo) { lo = f.y; best = i; } }); } return best; };
  // A wall is any cell this floor (or the stairwell he is in) has no ground in; the staircase has rails: no stepping
  // onto treads more than a step above or below where he stands, and nobody walks through the pillar.
  function solidAt(x, z, y) {
    const f = P.floors[floorIndexAt(y)];
    let inStairwell = false;
    for (const s of P.stairs) {
      const dx = x - s.x, dz = z - s.z, r = Math.hypot(dx, dz);
      if (r < PILLAR_R) return true;
      // inside the stair column there are no grid walls, only rails: a tread too high to step onto (but too low to
      // walk under), or too far below to step down to, is solid
      if (r <= STAIR_R) { inStairwell = true; const h = helix(s, x, z); if (h !== null && ((h > y + 0.6 && h < y + 1.9) || h < y - 0.9)) return true; }
    }
    for (const b of blockers) if (!b.cleared && Math.abs(b.y - y) < 2 && Math.hypot(x - b.x, z - b.z) < b.r) return true;
    if (inStairwell) return false;
    return !walk(f, x, z);
  }
  function resolve(p, rad) {
    let hit = false;
    for (let it = 0; it < 3; it++) {
      let moved = false;
      for (const [ox, oz] of [[rad, 0], [-rad, 0], [0, rad], [0, -rad], [rad * 0.7, rad * 0.7], [-rad * 0.7, rad * 0.7], [rad * 0.7, -rad * 0.7], [-rad * 0.7, -rad * 0.7], [0, 0]]) {
        if (!solidAt(p.x + ox, p.z + oz, p.y)) continue;
        // push back along the probe, out of the solid
        const L = Math.hypot(ox, oz) || 1, step = 0.12;
        p.x -= (ox / L) * step || 0; p.z -= (oz / L) * step || 0; if (!ox && !oz) { p.x += 0.1; } moved = hit = true;
      }
      if (!moved) break;
    }
    return hit;
  }
  function rayClear(a, b) {
    const d = b.clone().sub(a), len = d.length(); if (len < 1e-4) return len; d.divideScalar(len);
    const q = new THREE.Vector3();
    for (let t = 0.4; t < len; t += 0.25) {
      q.copy(a).addScaledVector(d, t);
      const f = P.floors[floorIndexAt(a.y - 1.5)], i = cellOf(q.x, q.z);
      if (i < 0 || (!f.grid[i] && q.y < f.y + WALL)) return Math.max(0.15, t - 0.3);
    }
    return len;
  }
  return { groundAt, resolve, rayClear, candidates, helix, floorIndexAt, walk, cellOf, solidAt };
}

// ── meshes ──
const STONE = { malezor: '#6f6a60', zarvane: '#9d8660', andrannor: '#57484a', veridan: '#5f6d52', netharion: '#463b66', vorashil: '#7e93a4', xilnar: '#86889a', baelgor: '#8a5a33', thardin: '#566870', korathen: '#b2a681' };
function buildMeshes(P, rand) {
  const root = new THREE.Group(); root.name = `cave-${P.cave.id}`; root.visible = false;
  const stone = new THREE.Color(STONE[P.cave.districtId] || '#6f6a60'), c = new THREE.Color(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
  const floorMat = new THREE.MeshStandardMaterial({ vertexColors: false, roughness: 0.96, flatShading: true });
  const rockMat = new THREE.MeshStandardMaterial({ roughness: 0.95, flatShading: true });
  const crystal = new THREE.MeshStandardMaterial({ color: P.cave.gem || '#7fd6ff', emissive: P.cave.gem || '#5ec8ff', emissiveIntensity: 1.3, roughness: 0.2, flatShading: true });
  P.floorGroups = [];
  for (const f of P.floors) {
    const g = new THREE.Group(); g.name = `floor-${f.k}`; root.add(g); P.floorGroups.push(g);
    const slabs = [], walls = [];
    for (let r = 0; r < GH; r++) for (let col = 0; col < GW; col++) {
      const i = r * GW + col, x = P.ox + (col + 0.5) * CELL, z = P.oz + (r + 0.5) * CELL;
      if (f.grid[i]) { let hole = false; for (const s of P.stairs) if (Math.max(s.yA, s.yB) === f.y && Math.hypot(x - s.x, z - s.z) < STAIR_R + 1.3) hole = true; if (!hole) slabs.push([x, z]); continue; }
      let edge = false; for (let dr = -1; dr <= 1 && !edge; dr++) for (let dc = -1; dc <= 1; dc++) { const j = (r + dr) * GW + col + dc; if (r + dr >= 0 && r + dr < GH && col + dc >= 0 && col + dc < GW && f.grid[j]) { edge = true; break; } }
      if (edge) walls.push([x, z]);
    }
    const slab = new THREE.InstancedMesh(new THREE.BoxGeometry(CELL, 0.6, CELL), floorMat, slabs.length);
    slabs.forEach(([x, z], i) => { slab.setMatrixAt(i, m4.makeTranslation(x, f.y - 0.3, z)); slab.setColorAt(i, c.copy(stone).multiplyScalar(0.55 + rand() * 0.12)); });
    slab.receiveShadow = true; g.add(slab);
    const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), rockMat, walls.length * 2);
    let n = 0;
    for (const [x, z] of walls) for (let k = 0; k < 2; k++) {
      s3.set(CELL * (0.62 + rand() * 0.2), WALL * (0.42 + rand() * 0.2) * (k ? 0.75 : 1), CELL * (0.62 + rand() * 0.2));
      p3.set(x + (rand() - 0.5) * 0.6, f.y + (k ? WALL * 0.62 : WALL * 0.32), z + (rand() - 0.5) * 0.6);
      rocks.setMatrixAt(n, m4.compose(p3, q.setFromEuler(e.set(rand() * 3, rand() * 3, rand() * 3)), s3)); rocks.setColorAt(n++, c.copy(stone).multiplyScalar(0.7 + rand() * 0.35));
    }
    rocks.count = n; rocks.castShadow = true; g.add(rocks);
    // crystals along the walls: the cave's own light
    for (let i = 0; i < Math.min(22, walls.length); i += 1) {
      const [x, z] = walls[Math.floor(rand() * walls.length)];
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.3 + rand() * 0.35, 0), crystal); cr.scale.y = 1.8 + rand() * 1.4;
      cr.position.set(x + (rand() - 0.5), f.y + 0.4 + rand() * 1.6, z + (rand() - 0.5)); cr.rotation.set(rand() - 0.5, rand() * 3, rand() - 0.5); g.add(cr);
    }
    // the open stairwell's rim, on the floor a staircase climbs (or sinks) from
    for (const s of P.stairs) if (Math.max(s.yA, s.yB) === f.y) { const ring = new THREE.Mesh(new THREE.RingGeometry(STAIR_R + 0.05, STAIR_R + 2.6, 28), new THREE.MeshStandardMaterial({ color: c.copy(stone).multiplyScalar(0.55), roughness: 0.96, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(s.x, f.y + 0.01, s.z); g.add(ring); }
  }
  // the staircases: a stone pillar and a helix of treads, shown with both floors it joins
  P.stairGroups = [];
  const tread = new THREE.BoxGeometry(STAIR_R - PILLAR_R + 0.1, 0.32, 0.95), treadMat = new THREE.MeshStandardMaterial({ color: c.copy(stone).multiplyScalar(0.85), roughness: 0.9, flatShading: true });
  for (const s of P.stairs) {
    const g = new THREE.Group(); root.add(g); P.stairGroups.push(g);
    const lo = Math.min(s.yA, s.yB), hi = Math.max(s.yA, s.yB), steps = 26;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(PILLAR_R, PILLAR_R * 1.15, hi - lo + WALL * 0.6, 10), rockMat); pillar.position.set(s.x, (lo + hi) / 2 + WALL * 0.3, s.z); g.add(pillar);
    const T = new THREE.InstancedMesh(tread, treadMat, steps);
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps, a = s.a0 + t * Math.PI * 2, rr = (STAIR_R + PILLAR_R) / 2, y = s.yA + (s.yB - s.yA) * t;
      p3.set(s.x + Math.sin(a) * rr, y - 0.16, s.z + Math.cos(a) * rr); q.setFromEuler(e.set(0, a + Math.PI / 2, 0)); s3.set(1, 1, 1);
      T.setMatrixAt(i, m4.compose(p3, q, s3));
    }
    T.castShadow = true; T.receiveShadow = true; g.add(T);
  }
  // Floor 1's mouth: daylight at the end of the tunnel
  const day = new THREE.Mesh(new THREE.PlaneGeometry(CELL * 3, WALL), new THREE.MeshBasicMaterial({ color: '#dff4ff', toneMapped: false }));
  day.position.set(P.mouth.x, P.floors[0].y + WALL / 2, P.oz + GH * CELL - 0.2); day.rotation.y = Math.PI; P.floorGroups[0].add(day);
  return root;
}

// A cave dweller (Floors 1–2): a hooded figure with a lantern.
function buildDweller(color) {
  const g = new THREE.Group(), robe = new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true }), skin = new THREE.MeshStandardMaterial({ color: '#a4785a', roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 8), robe); body.position.y = 0.75; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), skin); head.position.y = 1.62; g.add(head);
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.55, 8), robe); hood.position.y = 1.82; g.add(hood);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffd27a', toneMapped: false })); lamp.position.set(0.45, 1.05, 0.25); g.add(lamp);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
const DWELLER_LINES = [
  ['The deeper you go, the older the stone. Some of it remembers the Gemlords.', 'Mind the stairs. They were cut long before Malezor had a name.'],
  ['Everstone? All of it is. The ones holding Astralites are the ones worth carrying out.', 'Seers come down here looking for something. I keep my lantern low when they pass.']
];

// ── the cave system: plans on demand, meshes when entered, physics for every cave that exists ──
export function createCaveInteriors({ scene, caves, toast, fx, state }) {
  const plans = new Map(); // cave id → plan (data, physics, meshes once built)
  const list = caves.map((c, i) => ({ cave: c, index: i }));
  function plan(id) {
    if (plans.has(id)) return plans.get(id);
    const e = list.find(q => q.cave.id === id); if (!e) return null;
    const P = planCave(e.cave, e.index); P.refY = P.floors[0].y + 0.1;
    const saved = state(id);
    // the boulder blockade at the foot of the last staircase (permanent once smashed)
    P.blockers = [];
    const last = P.stairs[P.stairs.length - 1];
    if (last) { const a = last.a0 + 0.35, rr = (STAIR_R + PILLAR_R) / 2; P.blockers.push({ id: `${id}:stair${last.k}-boulders`, x: last.x + Math.sin(a) * rr, z: last.z + Math.cos(a) * rr, y: last.yA, r: 1.9, hp: 3, cleared: saved.clearedObstacles.includes(`${id}:stair${last.k}-boulders`), floor: last.k }); }
    P.phys = physicsOf(P, P.blockers);
    plans.set(id, P); return P;
  }
  function build(P) {
    if (P.root) return P.root;
    const rand = seeded(P.cave.layoutSeed + ':dress');
    P.root = buildMeshes(P, rand); scene.add(P.root);
    // content
    P.spots = []; P.npcs = [];
    const room = (k, tag) => P.floors[k - 1]?.rooms.find(r => r.tag === tag);
    for (const k of [1, 2]) {
      const r = room(k, 'npc') || P.floors[k - 1]?.rooms.find(q => q.tag === 'room'); if (!r) continue;
      const npc = buildDweller(k === 1 ? '#5d4a6e' : '#3f5a52'); npc.position.set(r.x, P.floorY(k), r.z); npc.rotation.y = rand() * 6; P.floorGroups[k - 1].add(npc);
      const lines = DWELLER_LINES[k - 1];
      P.npcs.push(npc);
      P.spots.push({ kind: 'npc', floor: k, x: r.x, z: r.z, r: 2.6, name: k === 1 ? 'Talk · Cave Keeper' : 'Talk · Lantern Hermit', who: k === 1 ? 'Cave Keeper' : 'Lantern Hermit', lines, i: 0 });
    }
    const vein = room(2, 'vein') || P.floors[1]?.rooms.find(q => q.tag === 'room');
    if (vein) {
      const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: '#9fdcff', emissive: '#4fa8ff', emissiveIntensity: 1.4, roughness: 0.15, flatShading: true });
      for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.3 + rand() * 0.3, 0), mat); c.scale.y = 1.6 + rand() * 1.5; c.position.set((rand() - 0.5) * 1.4, 0.4 + rand() * 0.5, (rand() - 0.5) * 1.4); c.rotation.set(rand() - 0.5, rand() * 3, rand() - 0.5); g.add(c); }
      const base = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), new THREE.MeshStandardMaterial({ color: '#5f5a52', roughness: 0.95, flatShading: true })); base.scale.y = 0.6; base.position.y = 0.3; g.add(base);
      g.position.set(vein.x, P.floorY(2), vein.z); P.floorGroups[1].add(g);
      P.spots.push({ kind: 'vein', floor: 2, x: vein.x, z: vein.z, r: 2.4, name: 'Mine the crystal vein', item: `${P.cave.id}:vein`, mesh: g });
    }
    const raid = P.cave.rarity === 'ancient' && room(3, 'raid');
    if (raid) {
      const g = new THREE.Group(), dark = new THREE.MeshStandardMaterial({ color: '#2a1c33', emissive: '#5a1f7a', emissiveIntensity: 0.6, roughness: 0.6, flatShading: true });
      const cache = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.8), new THREE.MeshStandardMaterial({ color: '#6b4a23', roughness: 0.8 })); cache.position.y = 0.35; g.add(cache);
      for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.4, 6), dark); p.position.set(Math.sin(i * 2.1) * 2, 1.2, Math.cos(i * 2.1) * 2); g.add(p); }
      g.position.set(raid.x, P.floorY(3), raid.z); P.floorGroups[2].add(g);
      P.spots.push({ kind: 'raid', floor: 3, x: raid.x, z: raid.z, r: 2.4, name: 'Search the Seer raid cache', item: `${P.cave.id}:raid`, mesh: g });
    }
    const sanctum = P.cave.classification === 'gemlord' && room(P.floors.length, 'sanctum');
    if (sanctum) {
      const g = new THREE.Group(), gem = new THREE.MeshStandardMaterial({ color: P.cave.gem, emissive: P.cave.gem, emissiveIntensity: 1.6, roughness: 0.15, flatShading: true });
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2, 0.8, 8), new THREE.MeshStandardMaterial({ color: '#3b3534', roughness: 0.8, flatShading: true })); plinth.position.y = 0.4; g.add(plinth);
      const mono = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), gem); mono.scale.set(0.9, 2.4, 0.9); mono.position.y = 3; g.add(mono); g.userData.mono = mono;
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, c = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), gem); c.scale.y = 2; c.position.set(Math.sin(a) * 4.2, 0.9, Math.cos(a) * 4.2); g.add(c); }
      g.position.set(sanctum.x, P.floorY(P.floors.length), sanctum.z); P.floorGroups[P.floors.length - 1].add(g); P.sanctum = g;
      P.spots.push({ kind: 'sanctum', floor: P.floors.length, x: sanctum.x, z: sanctum.z, r: 4.5, name: `${P.cave.gemlord}'s Sanctum`, event: `${P.cave.id}:sanctum` });
    }
    for (const b of P.blockers) {
      const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: '#7a7268', roughness: 0.95, flatShading: true });
      for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7 + rand() * 0.5, 0), mat); m.position.set((rand() - 0.5) * 2, 0.5 + rand() * 0.8, (rand() - 0.5) * 2); m.rotation.set(rand() * 3, rand() * 3, rand() * 3); g.add(m); }
      g.position.set(b.x, b.y, b.z); g.visible = !b.cleared; P.floorGroups[b.floor - 1].add(g); b.mesh = g;
      P.spots.push({ kind: 'blocker', floor: b.floor, x: b.x, z: b.z, r: 3.8, blocker: b, get name() { return `Boulders block the stairs · smash (${b.hp})`; } });
    }
    P.spots.push({ kind: 'exit', floor: 1, x: P.mouth.x, z: P.mouth.z - CELL, r: 3.6, name: 'Leave the cave' });
    return P.root;
  }
  // visible floors: the one he stands on, and the other end of a staircase he is on
  let active = null, shownFloor = -1;
  function update(dt, player) {
    if (!active) return;
    const P = active, y = player.position.y; P.refY = y + 0.1;
    const fi = P.phys.floorIndexAt(y);
    let other = -1;
    for (const s of P.stairs) if (Math.hypot(player.position.x - s.x, player.position.z - s.z) < STAIR_R + 1.5) other = (s.k - 1 === fi ? s.k : s.k - 1);
    P.floorGroups.forEach((g, i) => { g.visible = i === fi || i === other; });
    P.stairGroups.forEach((g, i) => { g.visible = P.stairs[i].k - 1 === fi || P.stairs[i].k === fi; });
    if (fi !== shownFloor) { shownFloor = fi; toast?.(`${P.cave.name} · Floor ${fi + 1} of ${P.floors.length}`); const s = state(P.cave.id); if (!s.unlockedFloors.includes(fi + 1)) { s.unlockedFloors.push(fi + 1); s.save(); } }
    if (P.sanctum) P.sanctum.userData.mono.rotation.y += dt * 0.6;
  }
  // §10 acceptance checks on the plans themselves (no meshes needed): every floor's arrival reaches its way onward,
  // every staircase is continuous from floor to floor, stairs sit upper-left / lower-left, direction matches terrain.
  function validate() {
    const out = [];
    for (const { cave } of list) {
      const P = plan(cave.id), problems = [];
      if (P.floors.length !== cave.floorCount) problems.push('floor count');
      for (let i = 1; i < P.floors.length; i++) if (Math.sign(P.floors[i].y - P.floors[i - 1].y) !== (cave.verticalDirection === 'up' ? 1 : -1)) problems.push(`floor ${i + 1} goes the wrong way`);
      for (const f of P.floors) {
        const start = f.k === 1 ? P.entry : P.stairs[f.k - 2], goal = f.k < P.floors.length ? P.stairs[f.k - 1] : null;
        const si = P.phys.cellOf(start.x, start.z), seen = new Uint8Array(GW * GH), q = [si]; seen[si] = 1;
        while (q.length) { const i = q.pop(), c = i % GW, r = (i - c) / GW; for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (r + dr) * GW + c + dc; if (c + dc >= 0 && c + dc < GW && r + dr >= 0 && r + dr < GH && !seen[j] && f.grid[j]) { seen[j] = 1; q.push(j); } } }
        const reach = cell => seen[cell];
        if (goal && !reach(P.phys.cellOf(goal.x, goal.z))) problems.push(`floor ${f.k}: no route to its staircase`);
        if (f.k === 1 && !reach(P.phys.cellOf(P.mouth.x, P.mouth.z - CELL))) problems.push('floor 1: no route to the mouth');
        for (const rm of f.rooms) if (!reach(P.phys.cellOf(rm.x, rm.z))) problems.push(`floor ${f.k}: ${rm.tag} chamber cut off`);
      }
      for (const s of P.stairs) {
        if (!['upper-left', 'lower-left'].includes(s.region) || s.c > 8) problems.push(`stair ${s.k} not on the left`);
        let prev = s.yA, worst = 0; const rr = (STAIR_R + PILLAR_R) / 2;
        for (let t = 0.01; t <= 0.99; t += 0.01) { const a = s.a0 + t * Math.PI * 2, x = s.x + Math.sin(a) * rr, z = s.z + Math.cos(a) * rr, g = P.phys.groundAt(x, z, prev); worst = Math.max(worst, Math.abs(g - prev)); prev = g; }
        if (worst > 0.6 || Math.abs(prev - s.yB) > 0.5) problems.push(`stair ${s.k} not continuous (step ${worst.toFixed(2)}, ends ${prev.toFixed(2)} vs ${s.yB})`);
      }
      if (P.floors.length >= 3 && P.floors[2].rooms.length < 2) problems.push('floor 3 has no patrol route');
      out.push({ id: cave.id, floors: P.floors.length, stairs: P.stairs.map(s => s.region), ok: !problems.length, problems });
    }
    return out;
  }
  return {
    plan, build, update, validate,
    owns: (x, z) => x >= REGION.x0 - 20,
    planAt(x) { const i = Math.floor((x - REGION.x0) / REGION.pitch); const e = list[i]; return e ? plan(e.cave.id) : null; },
    enter(id) { const P = plan(id); build(P); P.root.visible = true; active = P; shownFloor = -1; return P; },
    exit() { if (active?.root) active.root.visible = false; active = null; },
    get active() { return active; },
    spotNear(p) { const P = active; if (!P) return null; const fi = P.phys.floorIndexAt(p.y); let best = null, bd = Infinity; for (const s of P.spots) { if (s.floor !== fi + 1 || (s.blocker && s.blocker.cleared)) continue; const d = Math.hypot(p.x - s.x, p.z - s.z); if (d < s.r && d < bd) { bd = d; best = s; } } return best; }
  };
}
