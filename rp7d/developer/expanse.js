// Empty district terrain only. Canon coasts and routes contribute to one land union.
// Ownership never introduces a cliff or a mesh seam; no district props are placed.
import * as THREE from 'three';
import { smooth, lerp, makeNoise } from './util.js';
import { DISTRICTS, ZYRAXIS, malezorOwns, emptyDistrictAt } from './district-view.js';
import { overworldEdge, malezorSurfaceEdge } from './overworld-land.js';
import { clipCoast } from './coast-mesh.js';

const STEP = 3, SEAM = 42;
export function createExpanse(baseHeightAt, baseColorAt) {
  const t0 = performance.now(), B = ZYRAXIS.bounds;
  const X0 = Math.floor(B.x0 / STEP) * STEP, Z0 = Math.floor(B.z0 / STEP) * STEP;
  const NX = Math.ceil((B.x1 - X0) / STEP) + 1, NZ = Math.ceil((B.z1 - Z0) / STEP) + 1;
  const H = new Float32Array(NX * NZ), pos = new Float32Array(NX * NZ * 3), col = new Float32Array(pos.length), idx = [];
  const noise = makeNoise(90210), fine = makeNoise(90227), c = new THREE.Color(), c2 = new THREE.Color(), shore = new THREE.Color('#a89a74');
  const palette = DISTRICTS.map(d => d.tint.map(hex => new THREE.Color(hex)));
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const x = X0 + i * STEP, z = Z0 + j * STEP, k = j * NX + i;
    const edge = overworldEdge(x, z), seam = malezorSurfaceEdge(x, z);
    let h = 1.1 + noise.fbm(x * .018, z * .018) * 2.2 + fine.fbm(x * .06, z * .06, 3) * .55 + (1 - smooth(-18, 0, edge)) * 12;
    // Match Malezor's actual edge height, then ease out over a broad border valley.
    if (seam < SEAM) h = lerp(baseHeightAt(x, z), h, smooth(0, SEAM, Math.max(0, seam)));
    H[k] = h; pos.set([x, h, z], k * 3);
    const shade = noise.noise(x * .045, z * .045) * .5 + .5;
    const distances = DISTRICTS.map(d => d.edge(x, z) * d.extent / 1.097), nearest = Math.min(...distances);
    let total = 0; c.setRGB(0, 0, 0);
    for (let n = 0; n < DISTRICTS.length; n++) {
      const weight = Math.exp(-(distances[n] - nearest) / 26);
      if (weight < .0001) continue;
      c2.copy(palette[n][0]).lerp(palette[n][1], shade);
      c.r += c2.r * weight; c.g += c2.g * weight; c.b += c2.b * weight; total += weight;
    }
    c.multiplyScalar((.93 + (fine.noise(x * .31, z * .31) * .5 + .5) * .14) / total);
    c.lerp(shore, (1 - smooth(1, 10, -edge)) * .65);
    if (seam < SEAM && baseColorAt) c.lerp(baseColorAt(x, z, c2), 1 - smooth(0, SEAM, Math.max(0, seam)));
    col.set([c.r, c.g, c.b], k * 3);
    if (i < NX - 1 && j < NZ - 1) { const a = k, b = a + 1, cc = a + NX, d = cc + 1; idx.push(a, cc, b, b, cc, d); }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geometry.setIndex(idx); geometry.computeVertexNormals();
  const clipped = clipCoast(geometry, (x, z) => Math.max(overworldEdge(x, z), -malezorSurfaceEdge(x, z)), {
    columns: NX - 1, skirt: (x, z) => overworldEdge(x, z) > -.04,
    boundaryHeight: (x, z) => Math.abs(malezorSurfaceEdge(x, z)) < .02 ? baseHeightAt(x, z) : null
  });
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .97 }));
  mesh.name = 'expanse-terrain'; mesh.receiveShadow = true;
  const group = new THREE.Group(); group.name = 'expanse'; group.add(mesh);
  const contains = (x, z) => x >= B.x0 && x <= B.x1 && z >= B.z0 && z <= B.z1 && !malezorOwns(x, z) && overworldEdge(x, z) <= 0;
  function heightAt(x, z) {
    if (!contains(x, z)) return null;
    const fx = (x - X0) / STEP, fz = (z - Z0) / STEP, i = Math.min(NX - 2, Math.floor(fx)), j = Math.min(NZ - 2, Math.floor(fz)), u = fx - i, v = fz - j;
    const boundary = clipped.boundaryHeightAt(j * (NX - 1) + i, x, z); if (boundary !== null) return boundary;
    const k = j * NX + i, a = H[k], b = H[k + 1], cc = H[k + NX], d = H[k + NX + 1];
    return u + v <= 1 ? a + (b - a) * u + (cc - a) * v : d + (cc - d) * (1 - u) + (b - d) * (1 - v);
  }
  console.log('[rp7d] Continuous empty district terrain ·', Math.round(performance.now() - t0), 'ms');
  return { group, meshes: { terrain: mesh }, heightAt, contains, districtAt: (x, z) => contains(x, z) ? emptyDistrictAt(x, z) : null, step: STEP };
}
