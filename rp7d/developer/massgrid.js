// Mass grid: universal collision for every solid thing in Malezor.
// The hand-placed colliders (building boxes, trunk circles) cover the big shapes; this
// covers everything else — rib bones, rocks, fences, lamp posts, crates, canopies that
// hang low, bushes — straight from the rendered triangles, so nothing visible can be
// walked through.
//
// How it works: the world is split into 16 m chunks of 0.25 m cells. A chunk is built
// the first time something moves near it (and pre-warmed around Rizer): every triangle
// of the static meshes that overlaps the chunk is sliced every 20 cm, and each slice
// point that sits in the body band (0.4 – 1.9 m above the floor under it, where the
// floor is terrain or any walkable surface like a roof or stair) marks its cell solid.
// Each cell also keeps the top of the mass there, so jumping or flying over it is free.
//
// Two layers: hard mass (1) and bushes (2). resolve(..., { stealth: true }) lets a
// crouched Rizer push into bushes to hide; everything else is always solid.
//
// Meshes opt out with userData.noCollide (grass, flowers, reeds, water, moving vehicles)
// and opt into the bush layer with userData.soft. userData.massHi caps the band at that height above the
// mesh's own origin (tree canopies are overhead, so broadleaf and willow block at the trunk only).
import * as THREE from 'three';

export const MASS = { cell: 0.25, chunk: 64, lo: 0.4, hi: 1.9, slice: 0.2, warmRadius: 36, warmBudgetMs: 3, pocket: 200 };

export function createMassGrid({ floorAt, surfacesIn }) {
  const C = MASS.cell, N = MASS.chunk, S = C * N;
  const entries = [];            // { mesh, index (instance or -1), soft }
  const bins = new Map();        // chunk key → entry indices
  const chunks = new Map();      // chunk key → { flag: Uint8Array, top: Float32Array }
  const key = (cx, cz) => cx * 65536 + cz;
  const _m = new THREE.Matrix4(), _box = new THREE.Box3();

  const skipMaterial = m => { const a = Array.isArray(m) ? m : [m]; return a.every(q => !q || (q.transparent && q.opacity < 0.6) || q.blending === THREE.AdditiveBlending || q.visible === false); };

  // Register every static mesh under `root`.
  function add(root, { soft = false } = {}) {
    root.updateMatrixWorld(true);
    const walk = (o, sft) => {
      if (o.userData.noCollide || o.visible === false) return;
      sft = sft || !!o.userData.soft;
      if ((o.isMesh || o.isInstancedMesh) && !o.isSkinnedMesh && o.geometry?.attributes.position && !skipMaterial(o.material)) {
        const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox();
        const n = o.isInstancedMesh ? o.count : 1;
        for (let i = 0; i < n; i++) {
          const M = matrixOf(o, i, _m); _box.copy(g.boundingBox).applyMatrix4(M);
          const cap = o.userData.massHi != null ? M.elements[13] + o.userData.massHi : Infinity; // measured from the mesh's own base, so slopes don't lift the band into a canopy
          const id = entries.push({ mesh: o, index: o.isInstancedMesh ? i : -1, soft: sft, cap, disabled: false }) - 1;
          for (let cx = Math.floor(_box.min.x / S); cx <= Math.floor(_box.max.x / S); cx++)
            for (let cz = Math.floor(_box.min.z / S); cz <= Math.floor(_box.max.z / S); cz++) {
              const k = key(cx, cz); let b = bins.get(k); if (!b) bins.set(k, b = []); b.push(id);
              chunks.delete(k); // anything added later rebuilds that chunk
            }
        }
      }
      for (const c of o.children) walk(c, sft);
    };
    walk(root, soft);
  }
  function matrixOf(o, i, out) {
    if (!o.isInstancedMesh) return out.copy(o.matrixWorld);
    o.getMatrixAt(i, out); return out.premultiply(o.matrixWorld);
  }

  // ── building one chunk ──────────────────────────────────────────────
  const A = new THREE.Vector3(), B = new THREE.Vector3(), D = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nrm = new THREE.Vector3();
  function build(cx, cz) {
    const flag = new Uint8Array(N * N), top = new Float32Array(N * N).fill(-Infinity), walkTop = new Float32Array(N * N).fill(-Infinity);
    const x0 = cx * S, z0 = cz * S, x1 = x0 + S, z1 = z0 + S;
    const surf = surfacesIn(x0 - 1, z0 - 1, x1 + 1, z1 + 1);
    const floor = (x, z, y) => floorAt(x, z, y, surf);
    const mark = (x, z, h, bit, yTop, cap = Infinity) => {
      const ix = Math.floor((x - x0) / C), iz = Math.floor((z - z0) / C);
      if (ix < 0 || iz < 0 || ix >= N || iz >= N) return;
      const rel = h - floor(x, z, h); if (rel < MASS.lo) return;
      const c = iz * N + ix; if (yTop > top[c]) top[c] = yTop;
      if (rel <= MASS.hi && h <= cap) flag[c] |= bit;
    };
    for (const id of bins.get(key(cx, cz)) || []) {
      const en = entries[id]; if (en.disabled) continue;
      const g = en.mesh.geometry, pos = g.attributes.position, idx = g.index, bit = en.soft ? 2 : 1, hi = en.cap;
      const M = matrixOf(en.mesh, en.index, _m), tris = (idx ? idx.count : pos.count) / 3;
      const vert = (t, j, out) => out.fromBufferAttribute(pos, idx ? idx.getX(t * 3 + j) : t * 3 + j).applyMatrix4(M);
      for (let t = 0; t < tris; t++) {
        const a = vert(t, 0, A), b = vert(t, 1, B), d = vert(t, 2, D);
        if (Math.max(a.x, b.x, d.x) < x0 - C || Math.min(a.x, b.x, d.x) > x1 + C || Math.max(a.z, b.z, d.z) < z0 - C || Math.min(a.z, b.z, d.z) > z1 + C) continue;
        const ylo = Math.min(a.y, b.y, d.y), yhi = Math.max(a.y, b.y, d.y);
        nrm.crossVectors(e1.subVectors(b, a), e2.subVectors(d, a)); const len = nrm.length(); if (len < 1e-9) continue;
        // Keep a separate height field for real upward-facing mesh surfaces.
        // Vertical wall faces still block bodies, but can never pretend to be
        // the top of a roof while edge detection is looking for a ledge.
        if (Math.abs(nrm.y / len) > 0.35) {
          const bx0 = Math.max(x0, Math.min(a.x, b.x, d.x)), bx1 = Math.min(x1, Math.max(a.x, b.x, d.x));
          const bz0 = Math.max(z0, Math.min(a.z, b.z, d.z)), bz1 = Math.min(z1, Math.max(a.z, b.z, d.z));
          for (let x = Math.floor(bx0 / C) * C + C / 2; x <= bx1; x += C) for (let z = Math.floor(bz0 / C) * C + C / 2; z <= bz1; z += C) {
            if (!inTri(x, z, a, b, d)) continue;
            const y = a.y - (nrm.x * (x - a.x) + nrm.z * (z - a.z)) / nrm.y;
            const ix = Math.floor((x - x0) / C), iz = Math.floor((z - z0) / C), ci = iz * N + ix;
            if (y > walkTop[ci]) walkTop[ci] = y;
          }
        }
        if (Math.abs(nrm.y / len) > 0.75) { // flat face (table top, low overhang): fill its footprint at its height
          const h = (a.y + b.y + d.y) / 3;
          const bx0 = Math.max(x0, Math.min(a.x, b.x, d.x)), bx1 = Math.min(x1, Math.max(a.x, b.x, d.x)), bz0 = Math.max(z0, Math.min(a.z, b.z, d.z)), bz1 = Math.min(z1, Math.max(a.z, b.z, d.z));
          for (let x = Math.floor(bx0 / C) * C + C / 2; x <= bx1; x += C) for (let z = Math.floor(bz0 / C) * C + C / 2; z <= bz1; z += C)
            if (inTri(x, z, a, b, d)) mark(x, z, h, bit, yhi, hi);
          // thin flat faces smaller than a cell still count at their corners
          if (bx1 - bx0 < C || bz1 - bz0 < C) { mark(a.x, a.z, h, bit, yhi, hi); mark(b.x, b.z, h, bit, yhi, hi); mark(d.x, d.z, h, bit, yhi, hi); }
          continue;
        }
        // slice the face every 20 cm (at least once) and walk each cut line
        const h0 = Math.ceil(ylo / MASS.slice) * MASS.slice;
        const cuts = h0 > yhi ? [(ylo + yhi) / 2] : null;
        for (let h = cuts ? cuts[0] : h0, k = 0; cuts ? k < 1 : h <= yhi + 1e-6; h += MASS.slice, k++) {
          if (!cut(a, b, d, h)) continue;
          const L = Math.hypot(_q.x - _p.x, _q.z - _p.z), steps = Math.max(1, Math.ceil(L / (C * 0.5)));
          const yTop = Math.min(yhi, h + MASS.slice);
          for (let s = 0; s <= steps; s++) { const f = s / steps; mark(_p.x + (_q.x - _p.x) * f, _p.z + (_q.z - _p.z) * f, h, bit, yTop, hi); }
        }
      }
    }
    fillPockets(flag, top);
    const ch = { flag, top, walkTop, x0, z0 }; chunks.set(key(cx, cz), ch); return ch;
  }
  // Slicing marks a mass's outline; small enclosed pockets (a bush's middle, a rock or trunk
  // interior) are filled in so nothing can end up standing inside. Big enclosed areas
  // (a walled yard) are left open.
  const seen = new Uint8Array(N * N), stack = new Int32Array(N * N * 4), comp = new Int32Array(N * N);
  function fillPockets(flag, top) {
    seen.fill(0); let sp = 0;
    const push = i => { if (!seen[i] && !flag[i]) { seen[i] = 1; stack[sp++] = i; } };
    for (let i = 0; i < N; i++) { push(i); push((N - 1) * N + i); push(i * N); push(i * N + N - 1); }
    const flood = () => { let n = 0; while (sp) { const i = stack[--sp], x = i % N; comp[n++] = i; if (x > 0) push(i - 1); if (x < N - 1) push(i + 1); if (i >= N) push(i - N); if (i < N * (N - 1)) push(i + N); } return n; };
    flood(); // everything open to the chunk edge is outside
    for (let i = 0; i < N * N; i++) {
      if (seen[i] || flag[i]) continue;
      push(i); const n = flood(); if (n > MASS.pocket) continue;
      let bits = 0, hi = -Infinity; // the pocket takes its walls' layer and height
      for (let k = 0; k < n; k++) { const j = comp[k], x = j % N;
        for (const o of [x > 0 ? j - 1 : -1, x < N - 1 ? j + 1 : -1, j - N, j + N]) if (o >= 0 && o < N * N && flag[o]) { bits |= flag[o]; if (top[o] > hi) hi = top[o]; } }
      if (bits & 1) bits = 1; // anything hard around it: hard
      for (let k = 0; k < n; k++) { flag[comp[k]] = bits; top[comp[k]] = hi; }
    }
  }
  // Where the plane y = h crosses triangle abd: the segment _p → _q.
  const _p = { x: 0, z: 0 }, _q = { x: 0, z: 0 };
  function cut(a, b, d, h) {
    let n = 0; const P = [a, b, d];
    for (let i = 0; i < 3; i++) {
      const u = P[i], v = P[(i + 1) % 3];
      if ((u.y - h) * (v.y - h) > 0 || u.y === v.y) { if (u.y === h) { const o = n++ ? _q : _p; o.x = u.x; o.z = u.z; if (n >= 2) return true; } continue; }
      const f = (h - u.y) / (v.y - u.y), o = n++ ? _q : _p; o.x = u.x + (v.x - u.x) * f; o.z = u.z + (v.z - u.z) * f;
      if (n >= 2) return true;
    }
    if (n === 1) { _q.x = _p.x; _q.z = _p.z; return true; }
    return false;
  }
  function inTri(x, z, a, b, d) {
    const s1 = (b.x - a.x) * (z - a.z) - (b.z - a.z) * (x - a.x), s2 = (d.x - b.x) * (z - b.z) - (d.z - b.z) * (x - b.x), s3 = (a.x - d.x) * (z - d.z) - (a.z - d.z) * (x - d.x);
    return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0);
  }

  function chunkAt(cx, cz) { const k = key(cx, cz); return chunks.get(k) || (bins.has(k) ? build(cx, cz) : null); }
  // Cell lookup: 0 free, 1 hard, 2 bush (3 = both). Also returns the mass top via `out`.
  let lastK = NaN, lastC = null;
  function cellAt(x, z) {
    const cx = Math.floor(x / S), cz = Math.floor(z / S), k = key(cx, cz);
    const ch = k === lastK ? lastC : (lastK = k, lastC = chunkAt(cx, cz));
    if (!ch) return null;
    const i = Math.floor((z - ch.z0) / C) * N + Math.floor((x - ch.x0) / C);
    return ch.flag[i] ? (_cell.f = ch.flag[i], _cell.top = ch.top[i], _cell.walkTop = ch.walkTop[i], _cell) : null;
  }
  const _cell = { f: 0, top: 0, walkTop: -Infinity };

  // A walkable top exists only where the rendered mesh supports most of a
  // player's footprint. Sampling the center and four nearby points prevents
  // narrow walls, spikes, and single triangle tips from becoming platforms.
  function standableAt(x, z, y, radius = 0.24) {
    const samples = [[0, 0], [radius, 0], [-radius, 0], [0, radius], [0, -radius]];
    const tops = [];
    for (const [dx, dz] of samples) {
      const sx = x + dx, sz = z + dz, cx = Math.floor(sx / S), cz = Math.floor(sz / S), ch = chunkAt(cx, cz);
      if (!ch) continue;
      const i = Math.floor((sz - ch.z0) / C) * N + Math.floor((sx - ch.x0) / C), h = ch.walkTop[i];
      if (Number.isFinite(h)) tops.push(h);
    }
    if (tops.length < 4) return -Infinity;
    tops.sort((a, b) => a - b);
    const top = tops[Math.floor(tops.length / 2)];
    if (tops[tops.length - 1] - tops[0] > 1.45 || y < top - 0.3) return -Infinity;
    return top;
  }

  // Push a body circle (feet at p.y, radius rad) out of the mass. Returns true on contact.
  function resolve(p, rad, { stealth = false } = {}) {
    let hit = false;
    for (let it = 0; it < 2; it++) {
      let moved = false;
      const ix0 = Math.floor((p.x - rad) / C), ix1 = Math.floor((p.x + rad) / C), iz0 = Math.floor((p.z - rad) / C), iz1 = Math.floor((p.z + rad) / C);
      for (let iz = iz0; iz <= iz1; iz++) for (let ix = ix0; ix <= ix1; ix++) {
        const cx0 = ix * C, cz0 = iz * C, c = cellAt(cx0 + C / 2, cz0 + C / 2);
        if (!c || (stealth && c.f === 2) || p.y >= c.top - 0.05 || (Number.isFinite(c.walkTop) && p.y >= c.walkTop - 0.32)) continue;
        const qx = Math.min(Math.max(p.x, cx0), cx0 + C), qz = Math.min(Math.max(p.z, cz0), cz0 + C);
        let dx = p.x - qx, dz = p.z - qz, d = Math.hypot(dx, dz);
        if (d >= rad) continue;
        if (d < 1e-5) { // centre inside the cell: leave by the nearest edge
          const mx = cx0 + C / 2, mz = cz0 + C / 2; dx = p.x - mx; dz = p.z - mz;
          if (Math.abs(dx) > Math.abs(dz)) { p.x = mx + Math.sign(dx || 1) * (C / 2 + rad); } else { p.z = mz + Math.sign(dz || 1) * (C / 2 + rad); }
        } else { p.x = qx + dx / d * rad; p.z = qz + dz / d * rad; }
        hit = moved = true;
      }
      if (!moved) break;
    }
    return hit;
  }
  // Is anything solid under this circle? (placement checks)
  function blocked(x, z, rad, y = -Infinity) {
    for (let iz = Math.floor((z - rad) / C); iz <= Math.floor((z + rad) / C); iz++) for (let ix = Math.floor((x - rad) / C); ix <= Math.floor((x + rad) / C); ix++) {
      const c = cellAt(ix * C + C / 2, iz * C + C / 2); if (c && y < c.top) return true;
    }
    return false;
  }
  // Build the chunks around a point a few at a time, so walking into new ground never hitches.
  function warm(x, z, radius = MASS.warmRadius, budgetMs = MASS.warmBudgetMs) {
    const t0 = performance.now(), r = Math.ceil(radius / S), cx = Math.floor(x / S), cz = Math.floor(z / S);
    const todo = [];
    for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { const k = key(cx + dx, cz + dz); if (bins.has(k) && !chunks.has(k)) todo.push([dx * dx + dz * dz, cx + dx, cz + dz]); }
    todo.sort((a, b) => a[0] - b[0]);
    for (const [, x1, z1] of todo) { build(x1, z1); lastK = NaN; if (performance.now() - t0 > budgetMs) break; }
    return todo.length;
  }
  function disableInstance(mesh, index) {
    let changed = false;
    for (let i = 0; i < entries.length; i++) {
      const en = entries[i]; if (en.mesh !== mesh || en.index !== index || en.disabled) continue;
      en.disabled = true; changed = true;
      for (const [k, ids] of bins) if (ids.includes(i)) chunks.delete(k);
    }
    return changed;
  }
  return { add, disableInstance, resolve, blocked, warm, cellAt, standableAt, get chunks() { return chunks; }, get bins() { return bins; }, entries };
}
