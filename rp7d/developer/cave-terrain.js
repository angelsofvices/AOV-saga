// RP7D · cave formations in the overworld (RP7D Cave System V1.1 · §6 steps 7–8).
//
// Every cave mouth belongs to a mountain or a canyon wall, never a freestanding opening on flat ground:
//   mountain  the ground swells into a mound and a rock mass rises on it; the mouth is an arch of boulders round a
//             dark recess at its foot, facing the approach
//   canyon    the ground itself is cut: a trench with steep rock walls and a walkable ramp down at the approach end;
//             the mouth is in the back wall, at the canyon floor
// The cut and the mound are one height function (sculpt) applied to BOTH terrain meshes (Malezor and the empty
// districts) and to every ground query, so what Rizer stands on is what he sees. Rock meshes join the structures
// group (collision through the mass grid, hidden with the exterior), and each footprint is registered as a pad so
// trees, rocks and building placement keep off it.
import * as THREE from 'three';
import { seeded } from './caves-data.js';

const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const CANYON = { halfL: 12, halfW: 5, wall: 3.6, ramp: 13, depth: 9 };
export const MOUND = { r: 25, h: 4.5 };

// Local frame of a formation: u along its facing (toward the approach), v across.
const local = (f, x, z) => { const dx = x - f.center.x, dz = z - f.center.z, s = Math.sin(f.face), c = Math.cos(f.face); return { u: dx * s + dz * c, v: dx * c - dz * s }; };
const toWorld = (f, u, v) => { const s = Math.sin(f.face), c = Math.cos(f.face); return { x: f.center.x + u * s + v * c, z: f.center.z + u * c - v * s }; };

// How much the ground moves at (x, z): + raises (a mound), − cuts (a canyon).
function sculptOf(f, x, z) {
  const dx = x - f.center.x, dz = z - f.center.z; if (dx * dx + dz * dz > 40 * 40) return 0;
  if (f.terrain === 'mountain') return MOUND.h * (1 - smooth(MOUND.r * 0.35, MOUND.r, Math.hypot(dx, dz)));
  const { u, v } = local(f, x, z), C = CANYON;
  const across = 1 - smooth(C.halfW, C.halfW + C.wall, Math.abs(v));
  const along = u < -C.halfL ? 1 - smooth(C.halfL, C.halfL + C.wall, -u) : u > C.halfL ? 1 - Math.min(1, (u - C.halfL) / C.ramp) : 1;
  return -C.depth * across * along;
}

// The rock: noise-displaced, flat-shaded masses in the district's stone.
function rockMass(rand, rx, ry, rz, detail, palette) {
  const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position, v = new THREE.Vector3(), col = [];
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = 0.82 + 0.3 * Math.sin(v.x * 3.1 + rand.seed) * Math.cos(v.z * 2.7 - rand.seed) + 0.12 * Math.sin(v.y * 7.3 + v.x * 5.1);
    v.multiplyScalar(n); if (v.y < 0) v.y *= 0.25; // the base spreads, the top stays craggy
    p.setXYZ(i, v.x * rx, v.y * ry, v.z * rz);
  }
  const geo = g.toNonIndexed(); geo.computeVertexNormals();
  const q = geo.attributes.position, c = new THREE.Color();
  for (let i = 0; i < q.count; i += 3) { const y = (q.getY(i) + q.getY(i + 1) + q.getY(i + 2)) / 3; c.copy(palette[(Math.floor(rand() * 3))]).lerp(palette[3], Math.max(0, Math.min(1, y / ry)) * 0.35); for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
}
const STONE = {
  default: ['#7d776d', '#6b665d', '#8a8478', '#a39d90'], malezor: ['#7c776c', '#6c675d', '#8a8477', '#9b9486'], zarvane: ['#b49a6c', '#a08657', '#c3aa7c', '#d8c49a'],
  andrannor: ['#5b4b49', '#4b3d3d', '#6a5856', '#80706c'], veridan: ['#6c7a5a', '#5d6a4d', '#7b8a69', '#93a07f'], netharion: ['#4a3d6e', '#3d325c', '#5a4c80', '#7466a0'],
  vorashil: ['#8ea3b4', '#7d93a5', '#a0b4c4', '#c4d4e0'], xilnar: ['#9a9cab', '#878a99', '#aeb0be', '#cfd1db'], baelgor: ['#9a6334', '#87552a', '#ab7441', '#c48e5a'],
  thardin: ['#5e7178', '#4f6168', '#6e828a', '#8ea0a6'], korathen: ['#c4b78f', '#b1a47c', '#d4c8a2', '#e6dcbc']
};

// placements: cave-placement.js PASS records. Returns { sculpt, formations, entrances }.
export function createCaveFormations({ placements, pads }) {
  const formations = placements.filter(p => p.status === 'PASS').map(p => ({ cave: p.cave, center: p.center, face: p.face, terrain: p.cave.terrainType, pinned: p.pinned, entranceRaw: p.entrance }));
  const sculpt = (x, z) => { let s = 0; for (const f of formations) if (!f.pinned) s += sculptOf(f, x, z); return s; };
  // Where the mouth is and where Rizer stands to enter (the overworld end of every cave)
  for (const f of formations) {
    if (f.pinned) { f.mouth = { ...f.entranceRaw }; f.stand = toWorld({ ...f, center: f.entranceRaw }, 2, 0); f.stand.face = f.face + Math.PI; continue; }
    if (f.terrain === 'mountain') { f.mouth = toWorld(f, 13.5, 0); f.stand = toWorld(f, 17.5, 0); }
    else { f.mouth = toWorld(f, -CANYON.halfL - 0.6, 0); f.stand = toWorld(f, -CANYON.halfL + 3.5, 0); }
    f.mouth.face = f.face; f.stand.face = f.face + Math.PI; // standing at the mouth, facing in
  }
  // Pads: nature, chests and building placement keep off every formation (the pinned cave already has its own).
  for (const f of formations) if (!f.pinned) pads.push({ x: f.center.x, z: f.center.z, r: f.terrain === 'mountain' ? 24 : 22, k: 1, late: true, h: 0, cave: f.cave.id });
  // Meshes, built once the ground is sculpted (heightAt already includes the sculpt).
  function build(heightAt, structures) {
    for (const f of formations) {
      if (f.pinned) continue;
      const rand = seeded(f.cave.layoutSeed + ':outside'); rand.seed = rand() * 10;
      const pal = (STONE[f.cave.districtId] || STONE.default).map(c => new THREE.Color(c));
      const g = new THREE.Group(); g.name = `cave-formation-${f.cave.id}`;
      const gy = heightAt(f.mouth.x, f.mouth.z);
      if (f.terrain === 'mountain') {
        const base = heightAt(f.center.x, f.center.z);
        const main = rockMass(rand, 15, 19 + rand() * 6, 13, 3, pal); main.position.set(0, base - 1.5, -2); g.add(main);
        for (let i = 0; i < 5; i++) { const a = Math.PI * (0.55 + i * 0.22), r = 9 + rand() * 4, m = rockMass(rand, 6 + rand() * 4, 9 + rand() * 9, 6 + rand() * 3, 2, pal); m.position.set(Math.sin(a) * r, base - 1, Math.cos(a) * r - 3); g.add(m); }
        archAndRecess(g, rand, pal, f, toLocal(f, f.mouth), gy, 4.2, f.cave.gem);
      } else {
        // the canyon's back wall framing the mouth, and broken rock along both rims
        const wall = rockMass(rand, 9, 8, 3.2, 2, pal); const back = toLocal(f, toWorld(f, -CANYON.halfL - 5.5, 0)); wall.position.set(back.x, gy + 4.5, back.z); g.add(wall);
        for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
          const u = -CANYON.halfL + i * 5 + rand() * 2, v = side * (CANYON.halfW + CANYON.wall + 1.2 + rand() * 1.5), w = toWorld(f, u, v), l = toLocal(f, w);
          const b = rockMass(rand, 1.6 + rand() * 1.6, 1.2 + rand() * 1.6, 1.6 + rand() * 1.2, 1, pal); b.position.set(l.x, heightAt(w.x, w.z) + 0.3, l.z); g.add(b);
        }
        archAndRecess(g, rand, pal, f, toLocal(f, f.mouth), gy, 3.6, f.cave.gem);
      }
      g.position.set(f.center.x, 0, f.center.z); g.rotation.y = f.face;
      g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      structures.add(g); f.group = g;
    }
  }
  // Recolour sculpted ground: cut walls and floors turn to the district's stone; the mound's rim stays grass.
  function paintAndDeform(mesh, heightAt) {
    const p = mesh.geometry.attributes.position, col = mesh.geometry.attributes.color; if (!p) return 0;
    let moved = 0; const c = new THREE.Color(), rock = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), s = sculpt(x, z); if (Math.abs(s) < 1e-3) continue;
      p.setY(i, p.getY(i) + s); moved++;
      if (col && s < -0.6) { const f = formations.find(q => Math.hypot(q.center.x - x, q.center.z - z) < 40); rock.set((STONE[f?.cave.districtId] || STONE.default)[s < -6 ? 1 : 0]); c.fromBufferAttribute(col, i).lerp(rock, Math.min(1, -s / 3)); col.setXYZ(i, c.r, c.g, c.b); }
    }
    if (moved) { p.needsUpdate = true; if (col) col.needsUpdate = true; mesh.geometry.computeVertexNormals(); mesh.geometry.computeBoundingSphere(); mesh.geometry.computeBoundingBox(); }
    return moved;
  }
  return { formations, sculpt, build, paintAndDeform };
}
const toLocal = (f, w) => { const dx = w.x - f.center.x, dz = w.z - f.center.z, s = Math.sin(f.face), c = Math.cos(f.face); return { x: dx * c - dz * s, z: dx * s + dz * c }; };

// The mouth: a ring of boulders round a dark, deep recess, a couple of gem shards for a Gemlord's cave.
function archAndRecess(g, rand, pal, f, at, gy, R, gem) {
  const dark = new THREE.MeshStandardMaterial({ color: '#0b0809', roughness: 1, side: THREE.BackSide });
  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 7, 18, 1, true, Math.PI / 2, Math.PI), dark); tunnel.rotation.x = Math.PI / 2; tunnel.position.set(at.x, gy, at.z - 3.2); g.add(tunnel);
  const back = new THREE.Mesh(new THREE.CircleGeometry(R, 18, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#050304', roughness: 1 })); back.position.set(at.x, gy, at.z - 6.6); g.add(back);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(R * 2, 0.25, 7), new THREE.MeshStandardMaterial({ color: '#1a1513', roughness: 1 })); floor.position.set(at.x, gy - 0.05, at.z - 3.2); g.add(floor);
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * i / 10, s = 1.3 + rand() * 0.9, b = rockMass(rand, s, s * (0.8 + rand() * 0.5), s, 1, pal);
    b.position.set(at.x + Math.cos(a) * (R + 0.7), gy + Math.sin(a) * (R + 0.5) - 0.3, at.z + rand() * 0.6); g.add(b);
  }
  if (gem) {
    const mat = new THREE.MeshStandardMaterial({ color: gem, emissive: gem, emissiveIntensity: 1.1, roughness: 0.2, flatShading: true });
    for (const [x, y] of [[-R - 0.8, 0.6], [R + 0.9, 0.9], [-R * 0.5, R + 0.9]]) for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.35 + rand() * 0.3, 0), mat); c.scale.y = 1.8 + rand(); c.position.set(at.x + x + (rand() - 0.5) * 0.8, gy + y + rand() * 0.4, at.z + 0.4); c.rotation.set(rand() - 0.5, rand() * 3, rand() - 0.5); g.add(c); }
  }
}
