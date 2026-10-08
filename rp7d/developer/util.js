// Small shared math helpers — seeded randomness, value noise, polyline queries.
import * as THREE from 'three';

export const clamp = THREE.MathUtils.clamp;
export const lerp = THREE.MathUtils.lerp;
export function smooth(a, b, v) { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
export function damp(a, b, rate, dt) { return lerp(a, b, 1 - Math.exp(-rate * dt)); }
export function wrapAngle(a) { return THREE.MathUtils.euclideanModulo(a + Math.PI, Math.PI * 2) - Math.PI; }
export function dampAngle(a, b, rate, dt) { return a + wrapAngle(b - a) * (1 - Math.exp(-rate * dt)); }

// Deterministic PRNG — every stream is its own seeded generator so adding
// detail to one pass never reshuffles another.
export function rng(seed) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (a, b) => a + (b - a) * next();
  next.pick = arr => arr[Math.floor(next() * arr.length)];
  return next;
}

// 2D value noise + fBm.
export function makeNoise(seed) {
  const perm = new Uint16Array(512); const r = rng(seed);
  const p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const val = new Float32Array(256).map(() => r() * 2 - 1);
  const h = (x, z) => val[perm[(perm[x & 255] + z) & 511] & 255];
  function noise(x, z) {
    const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
    const a = h(xi, zi), b = h(xi + 1, zi), c = h(xi, zi + 1), d = h(xi + 1, zi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, z, oct = 4) {
    let s = 0, amp = 0.5, f = 1, norm = 0;
    for (let i = 0; i < oct; i++) { s += amp * noise(x * f, z * f); norm += amp; amp *= 0.5; f *= 2.03; }
    return s / norm;
  }
  return { noise, fbm };
}

// Catmull-Rom through 2D points, resampled every `step` units.
export function samplePath(pts, step = 1) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const n = Math.max(8, Math.ceil(curve.getLength() / step));
  return curve.getSpacedPoints(n).map(p => [p.x, p.z]);
}

// Spatial index over polylines: nearest-segment queries in O(1)-ish.
export class SegmentIndex {
  constructor(cell = 8) { this.cell = cell; this.map = new Map(); this.lines = []; }
  add(id, pts, data = {}) {
    const line = { id, pts, data }; this.lines.push(line);
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      const pad = data.width || 0;
      const x0 = Math.floor((Math.min(ax, bx) - pad) / this.cell), x1 = Math.floor((Math.max(ax, bx) + pad) / this.cell);
      const z0 = Math.floor((Math.min(az, bz) - pad) / this.cell), z1 = Math.floor((Math.max(az, bz) + pad) / this.cell);
      for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
        const k = cx + ',' + cz; if (!this.map.has(k)) this.map.set(k, []); this.map.get(k).push([line, i]);
      }
    }
    return line;
  }
  // Returns { d, x, z, line, i, t } of the closest point within maxR, or null.
  nearest(x, z, maxR = 16, filter) {
    const c = this.cell, r = Math.ceil(maxR / c), cx = Math.floor(x / c), cz = Math.floor(z / c);
    let best = null, bd = maxR;
    for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) {
      const list = this.map.get((cx + i) + ',' + (cz + j)); if (!list) continue;
      for (const [line, s] of list) {
        if (filter && !filter(line)) continue;
        const [ax, az] = line.pts[s], [bx, bz] = line.pts[s + 1];
        const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1;
        const t = clamp(((x - ax) * dx + (z - az) * dz) / L, 0, 1);
        const px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz);
        if (d < bd) { bd = d; best = { d, x: px, z: pz, line, i: s, t }; }
      }
    }
    return best;
  }
}

// Uniform-grid bucket for circle obstacles / proximity queries.
export class Buckets {
  constructor(cell = 8) { this.cell = cell; this.map = new Map(); }
  key(x, z) { return Math.floor(x / this.cell) + ',' + Math.floor(z / this.cell); }
  add(item) { // item needs x, z, r (bounding radius)
    const c = this.cell, r = item.r || 0;
    for (let cx = Math.floor((item.x - r) / c); cx <= Math.floor((item.x + r) / c); cx++)
      for (let cz = Math.floor((item.z - r) / c); cz <= Math.floor((item.z + r) / c); cz++) {
        const k = cx + ',' + cz; if (!this.map.has(k)) this.map.set(k, []); this.map.get(k).push(item);
      }
  }
  near(x, z, R = 0) {
    const out = new Set(), c = this.cell;
    for (let cx = Math.floor((x - R) / c); cx <= Math.floor((x + R) / c); cx++)
      for (let cz = Math.floor((z - R) / c); cz <= Math.floor((z + R) / c); cz++) {
        const l = this.map.get(cx + ',' + cz); if (l) for (const it of l) out.add(it);
      }
    return out;
  }
}
