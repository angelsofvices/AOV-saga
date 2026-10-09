// Vegetation, rocks, pasture — a few reusable masters instanced across the
// district, each pass reading the wheel quarter for what belongs where.
import * as THREE from 'three';
import { ASTRALITE_FAMILIES } from './loot.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng, makeNoise, smooth } from './util.js';
import { quarterAt } from './world-data.js';
import { ENTITIES } from './loot.js';
import { segSeg } from './hitbox.js';
import { FAE_HAND_HEIGHT } from './rizer.js';
import { makeZysphereSprite, zysphereTexture } from './zysphere-art.js';

// ── shader hooks ─────────────────────────────────────────────────────────
// Occlusion fade: any tree or boulder sitting between the lens and Rizer (or
// right against the lens) drops to an ordered screen-door pattern as a whole
// instance, so it reads as "see-through" instead of filling the screen.
let FADE_U = null;
function addNearFade(sh) {
  sh.uniforms.uCam = FADE_U.uCam; sh.uniforms.uFocus = FADE_U.uFocus;
  sh.vertexShader = 'uniform vec3 uCam; uniform vec3 uFocus; varying float vFade;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
    #ifdef USE_INSTANCING
      vec3 ipos = (modelMatrix * instanceMatrix * vec4(0.0, 3.0, 0.0, 1.0)).xyz;
    #else
      vec3 ipos = (modelMatrix * vec4(0.0, 3.0, 0.0, 1.0)).xyz;
    #endif
    vec3 seg = uFocus - uCam; float L = max(length(seg), 0.001); vec3 sd = seg / L;
    float tt = dot(ipos - uCam, sd), tc = clamp(tt, 0.0, L);
    float dLine = length(uCam + sd * tc - ipos);
    float occl = (1.0 - smoothstep(2.4, 3.8, dLine)) * step(0.3, tt) * step(tt, L - 1.0);
    float nearC = 1.0 - smoothstep(3.5, 6.5, length(ipos - uCam));
    vFade = 1.0 - 0.72 * max(occl, nearC);`);
  sh.fragmentShader = 'varying float vFade;\n' + sh.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
    if (vFade < 0.999) {
      ivec2 bi = ivec2(mod(gl_FragCoord.xy, 4.0));
      int idx = bi.x + bi.y * 4;
      float bm[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
      if ((bm[idx] + 0.5) / 16.0 > vFade) discard;
    }`);
}
function addWind(mat, uTime, { from = 1.5, amp = 0.012, key = 'wind' } = {}) {
  mat.onBeforeCompile = sh => {
    addNearFade(sh);
    sh.uniforms.uTime = uTime;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float hgt = max(position.y - ${from.toFixed(2)}, 0.0);
      #ifdef USE_INSTANCING
        vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      #else
        vec3 ip = vec3(0.0);
      #endif
      float w = sin(uTime * 1.3 + ip.x * 0.21 + ip.z * 0.17) + 0.45 * sin(uTime * 2.7 + ip.x * 0.53 + ip.z * 0.1);
      transformed.x += w * hgt * hgt * ${amp.toFixed(4)};
      transformed.z += w * hgt * hgt * ${(amp * 0.6).toFixed(4)};`);
  };
  mat.customProgramCacheKey = () => key + from + amp;
  return mat;
}

// ── geometry masters (vertex-coloured, merged) ─────────────────────────
function colored(geo, hex, jitter = 0, r) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(hex), n = geo.attributes.position.count, col = new Float32Array(n * 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < n; i++) {
    if (jitter) pos.setXYZ(i, pos.getX(i) + (r() - 0.5) * jitter, pos.getY(i) + (r() - 0.5) * jitter, pos.getZ(i) + (r() - 0.5) * jitter);
    const k = 0.9 + (r ? r() * 0.2 : 0.1); col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  if (geo.attributes.uv) geo.deleteAttribute('uv');
  geo.computeVertexNormals();
  return geo;
}
function master(kind, seed) {
  const r = rng(seed), parts = [];
  const trunk = (h, rb) => { const g = new THREE.CylinderGeometry(rb * 0.6, rb, h, 6); g.translate(0, h / 2, 0); parts.push(colored(g, '#5f4b35', 0, r)); };
  const branch = (a, b, radius = 0.12) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
    const g = new THREE.CylinderGeometry(radius * 0.55, radius, delta.length(), 5);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize()));
    g.translate(...start.clone().add(end).multiplyScalar(0.5).toArray()); parts.push(colored(g, '#604a32', 0, r));
  };
  const leafCluster = (x, y, z, sx, sy, sz, color, detail = 1) => {
    const g = new THREE.IcosahedronGeometry(1, detail); g.scale(sx, sy, sz); g.translate(x, y, z);
    parts.push(colored(g, color, 0.06, r));
  };
  if (kind === 'broadleaf') {
    trunk(3.4, 0.36);
    // A visible branching crown with overlapping leaf masses reads as a tree,
    // while keeping the existing two tree silhouettes and low-poly palette.
    [[0, 2.0, 0, -1.0, 3.8, 0.4], [0, 2.35, 0, 1.05, 3.75, 0.2], [0, 2.55, 0, 0.15, 4.45, -1.0], [0, 2.5, 0, -0.2, 4.1, 1.1]].forEach(v => branch(v.slice(0, 3), v.slice(3), 0.14));
    leafCluster(0, 5.05, 0, 1.9, 1.65, 1.75, '#4f7040', 1);
    leafCluster(-1.12, 4.55, 0.32, 1.35, 1.22, 1.3, '#5d7d45', 1);
    leafCluster(1.05, 4.52, 0.28, 1.32, 1.18, 1.28, '#48683b', 1);
    leafCluster(-0.25, 4.65, -1.05, 1.28, 1.2, 1.25, '#628449', 1);
    leafCluster(0.32, 4.48, 1.05, 1.28, 1.16, 1.3, '#557842', 1);
    leafCluster(0.1, 5.9, -0.15, 1.25, 1.15, 1.22, '#66874a', 1);
  } else if (kind === 'pine') {
    trunk(2.2, 0.3);
    [[2.3, 3.4, 2.4], [1.8, 3.0, 4.1], [1.25, 2.6, 5.6], [0.7, 2.0, 6.9]].forEach(([rad, h, y], i) => {
      const g = new THREE.ConeGeometry(rad, h, 7); g.translate(0, y, 0); parts.push(colored(g, i % 2 ? '#3f5e3f' : '#365438', 0.18, r));
    });
  } else if (kind === 'willow') {
    trunk(3, 0.45);
    const g = new THREE.SphereGeometry(2.8, 9, 7, 0, Math.PI * 2, 0, Math.PI * 0.62); g.scale(1, 1.1, 1); g.translate(0, 3.2, 0); parts.push(colored(g, '#6f8a4c', 0.3, r));
    const s = new THREE.CylinderGeometry(2.4, 3.3, 3.2, 10, 1, true); s.translate(0, 2.6, 0); parts.push(colored(s, '#68844a', 0.4, r));
  } else if (kind === 'bush') {
    // Low, broad thicket with a layered crown instead of three round blobs.
    leafCluster(0, 0.68, 0, 0.88, 0.55, 0.74, '#557a42', 0);
    leafCluster(-0.62, 0.58, 0.12, 0.62, 0.48, 0.58, '#648448', 0);
    leafCluster(0.55, 0.61, 0.24, 0.64, 0.5, 0.6, '#486d3c', 0);
    leafCluster(-0.25, 0.72, -0.48, 0.62, 0.48, 0.57, '#6b8a49', 0);
    leafCluster(0.28, 0.76, -0.28, 0.6, 0.48, 0.62, '#507641', 0);
  } else if (kind === 'rock') {
    // Broad, angular stone planes and an irregular silhouette make small
    // pieces read as stones and larger instances as boulders.
    const g = new THREE.DodecahedronGeometry(1, 0), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      // Coordinate-based variation stays identical at shared copies of a
      // vertex, keeping the closed polyhedron watertight.
      const n = 0.92 + (Math.sin(x * 19.17 + y * 37.41 + z * 11.73) * 0.5 + 0.5) * 0.16;
      pos.setXYZ(i, x * n, y * (n * 0.94 + 0.06), z * n);
    }
    // Keep each broad face a single, uniformly filled plane. Per-vertex color
    // noise on tiny triangles made the stones read as cracked or unfinished.
    g.computeVertexNormals(); parts.push(colored(g, '#858174', 0, null));
  }
  return mergeGeometries(parts);
}

export function createNature(W, T, shared, obstacles, interactables = []) {
  FADE_U = shared;
  const group = new THREE.Group();
  const stones = [];
  const trees = [];
  const tri = new THREE.Triangle(), ray = new THREE.Ray(), edgeA = new THREE.Vector3(), edgeB = new THREE.Vector3();
  const point = new THREE.Vector3(), nearest = new THREE.Vector3(), contact = new THREE.Vector3();
  const instance = new THREE.Matrix4(), worldInstance = new THREE.Matrix4();
  const segmentTouchesTriangle = (a, b, radius) => {
    const r2 = radius * radius;
    for (const p of [a, b]) if (tri.closestPointToPoint(p, nearest).distanceToSquared(p) <= r2) return true;
    point.subVectors(b, a);
    const len = point.length();
    if (len > 1e-8 && ray.set(a, point.multiplyScalar(1 / len)).intersectTriangle(tri.a, tri.b, tri.c, false, contact) && contact.distanceTo(a) <= len) return true;
    for (const [u, v] of [[tri.a, tri.b], [tri.b, tri.c], [tri.c, tri.a]])
      if (segSeg(a, b, u, v, edgeA, edgeB) <= radius) return true;
    return false;
  };
  function stoneSurfaceTouch(stone, segment) {
    const mesh = stone.mesh, geo = mesh.geometry, pos = geo.attributes.position, idx = geo.getIndex();
    mesh.getMatrixAt(stone.index, instance); mesh.updateMatrixWorld(true);
    worldInstance.multiplyMatrices(mesh.matrixWorld, instance);
    const count = idx ? idx.count : pos.count, radius = segment.r ?? 0.12;
    const check = (a, b) => {
      for (let i = 0; i < count; i += 3) {
        tri.a.fromBufferAttribute(pos, idx ? idx.getX(i) : i).applyMatrix4(worldInstance);
        tri.b.fromBufferAttribute(pos, idx ? idx.getX(i + 1) : i + 1).applyMatrix4(worldInstance);
        tri.c.fromBufferAttribute(pos, idx ? idx.getX(i + 2) : i + 2).applyMatrix4(worldInstance);
        if (segmentTouchesTriangle(a, b, radius)) return true;
      }
      return false;
    };
    if (check(segment.a, segment.b)) return true;
    // A fast limb can pass through the stone between frames. Sweep its prior
    // capsule endpoints as well, with the same visible surface contact rule.
    return !!(segment.pa && segment.pb &&
      (check(segment.pa, segment.a) || check(segment.pb, segment.b)));
  }
  let disableStoneInstance = () => {};
  let disableTreeInstance = () => {};
  let stoneFX = null;
  const stoneDust = (stone, destroyed = false) => {
    stoneFX?.(stone.x, stone.y + 0.12, stone.z, destroyed);
  };
  function spawnAstralite(stone) {
    // RP7B's unchanged drop rule: family from the RP7B tile coordinate hash,
    // tier from the original seven-cut rarity ladder.
    const tx = Math.round(stone.x / 2 + 61), ty = Math.round(stone.z / 2 + 94);
    const family = ASTRALITE_FAMILIES[Math.abs((tx * 31 + ty * 17)) % ASTRALITE_FAMILIES.length];
    const roll = Math.random(), cuts = [0.40, 0.61, 0.76, 0.87, 0.94, 0.98, 1];
    const energy = cuts.findIndex(cut => roll < cut) + 1, item = family.items[energy - 1];
    const pickup = new THREE.Group(), color = new THREE.Color(family.color);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.2 + energy * 0.012, 0), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.85, metalness: 0.42, roughness: 0.18 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 5, 20), new THREE.MeshStandardMaterial({ color: '#d7e9ff', emissive: color, emissiveIntensity: 0.55, metalness: 0.7, roughness: 0.25 }));
    ring.rotation.x = Math.PI / 2; pickup.add(core, ring); pickup.position.set(stone.x + 0.48, T.heightAt(stone.x + 0.48, stone.z) + 0.58, stone.z); pickup.userData.noCollide = true; group.add(pickup);
    const id = `astralite-${tx}-${ty}-${stone.index}`;
    const it = { id, kind: 'astraliteGem', name: `${item.symbol} · ${item.name}`, note: `${family.name} family · Matrix tier ${energy}. Material saved for future crafting.`, x: pickup.position.x, z: pickup.position.z, cx: pickup.position.x, cz: pickup.position.z, reach: 2.2, itemKey: item.key, astralite: item, mesh: pickup, baseY: pickup.position.y, collected: false, active: () => !it.collected };
    interactables.push(it); stone.drop = it;
    return it;
  }
  // ── stone damage you can read ──
  // A struck stone jolts, throws chips off the side it was hit from and cracks (dark fractures spreading over its
  // faces as it weakens). Broken, it comes apart: its own rock in fragments — the core slumps where it stood, the
  // rest is thrown — that tumble, bounce, settle as rubble and then sink away.
  const STONE = {
    shards: 640,                 // fragment pool (shared by every stone)
    gravity: 15, bounce: 0.32, friction: 0.55, rest: [3.2, 5.2], sink: 0.9,
    shake: 0.22,                 // seconds a hit stone jolts
    crack: { color: '#2a2925', width: 0.03, faces: [0, 4, 8], lift: 0.022 } // faces cracked at stage 0 / 1 / 2
  };
  const shaking = new Set();
  const sM = new THREE.Matrix4(), sM2 = new THREE.Matrix4(), sM3 = new THREE.Matrix4(), sQ = new THREE.Quaternion(), sE = new THREE.Euler(), sS = new THREE.Vector3(), sP = new THREE.Vector3(), sV = new THREE.Vector3();
  const srand = (stone, k) => { const v = Math.sin((stone.index + 1) * 127.1 + stone.x * 3.11 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
  const baseOf = stone => { if (!stone.base) { stone.base = new THREE.Matrix4(); stone.mesh.getMatrixAt(stone.index, stone.base); } return stone.base; };
  // Debris: one instanced pool per material (rock · wood · leaves). Every piece is thrown, falls, bounces, comes to
  // rest and then sinks into the ground — the same life for a stone's fragments, a felled tree's logs and a bush's leaves.
  const pools = [];
  function makeDebris(geometry, material, cap) {
    const mesh = new THREE.InstancedMesh(geometry, material, cap), list = [];
    mesh.count = 0; mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.noCollide = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.setColorAt(0, new THREE.Color('#fff')); group.add(mesh);
    const pool = {
      list, mesh,
      // q: { x y z · vx vy vz · sx sy sz · color · half (rest height) · life? · rx ry rz? · spin? (0 = no tumble) · drag? (air drag: leaves drift) }
      add(q) {
        if (list.length >= cap) list.shift();
        const r = Math.random, spin = q.spin ?? 1;
        list.push({ rx: r() * 6.3, ry: r() * 6.3, rz: r() * 6.3, ax: (r() - 0.5) * 12 * spin, ay: (r() - 0.5) * 12 * spin, az: (r() - 0.5) * 12 * spin, life: STONE.rest[0] + r() * (STONE.rest[1] - STONE.rest[0]), drag: 0, ...q, t: 0, still: false });
      },
      update(dt) {
        for (let i = list.length - 1; i >= 0; i--) {
          const q = list[i]; q.t += dt;
          if (q.t > q.life + STONE.sink) { list.splice(i, 1); continue; }
          if (q.still) continue;
          q.vy -= STONE.gravity * (q.drag ? 0.35 : 1) * dt; if (q.drag) { const k = 1 - Math.min(1, q.drag * dt); q.vx *= k; q.vz *= k; q.vy = Math.max(q.vy, -2.2); }
          q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.rx += q.ax * dt; q.ry += q.ay * dt; q.rz += q.az * dt;
          const floor = T.heightAt(q.x, q.z) + q.half;
          if (q.y <= floor) {
            q.y = floor;
            if (q.vy < -1.6 && !q.drag) { q.vy = -q.vy * STONE.bounce; q.vx *= STONE.friction; q.vz *= STONE.friction; q.ax *= 0.5; q.ay *= 0.5; q.az *= 0.5; }
            else { const k = 1 - Math.min(1, dt * 9); q.vy = 0; q.vx *= k; q.vz *= k; q.ax *= k; q.ay *= k; q.az *= k; if (Math.hypot(q.vx, q.vz) < 0.12) q.still = true; }
          }
        }
        const n = list.length; mesh.count = n;
        for (let i = 0; i < n; i++) {
          const q = list[i], k = q.t > q.life ? Math.max(0, 1 - (q.t - q.life) / STONE.sink) : 1; // it sinks into the ground at the end
          sP.set(q.x, q.y - (1 - k) * q.half * 2, q.z); sQ.setFromEuler(sE.set(q.rx, q.ry, q.rz)); sS.set(q.sx * k, q.sy * k, q.sz * k);
          mesh.setMatrixAt(i, sM.compose(sP, sQ, sS)); mesh.setColorAt(i, q.color);
        }
        mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }
    };
    pools.push(pool); return pool;
  }
  let rockDebris = null;
  // One rock fragment — the stone's own geometry and material, so fragments are the same stone.
  // ever: a piece of Everstone Rizer can gather by running over it (it lies a little longer than the rest).
  function addShard(stone, x, y, z, vx, vy, vz, size, ever = false) {
    rockDebris ||= makeDebris(stone.mesh.geometry, stone.mesh.material, STONE.shards);
    const r = Math.random;
    rockDebris.add({ x, y, z, vx, vy, vz, sx: size * (0.7 + r() * 0.6), sy: size * (0.45 + r() * 0.5), sz: size * (0.6 + r() * 0.6), color: stone.baseColor.clone().multiplyScalar(0.82 + r() * 0.3), half: size * 0.3, ...(ever ? { ever: 1, life: 6 + r() * 2 } : {}) });
  }
  // Chips knocked off by a blow, away from where it came from.
  function chipStone(stone, from, n) {
    let dx = from ? from.x - stone.x : Math.random() - 0.5, dz = from ? from.z - stone.z : Math.random() - 0.5; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
    for (let i = 0; i < n; i++) {
      const a = (Math.random() - 0.5) * 1.5, c = Math.cos(a), sn = Math.sin(a), ox = dx * c - dz * sn, oz = dx * sn + dz * c, sp = 1.6 + Math.random() * 2.6;
      addShard(stone, stone.x + ox * stone.radius * 0.9, stone.y + stone.h * (0.25 + Math.random() * 0.5), stone.z + oz * stone.radius * 0.9, ox * sp, 1.8 + Math.random() * 2.6, oz * sp, stone.scale * (0.05 + Math.random() * 0.06));
    }
  }
  // Fractures: jagged dark seams across the stone's own faces, more of them (and wider) the weaker it is.
  function crackStone(stone, stage) {
    if (stone.cracks) { group.remove(stone.cracks); stone.cracks.geometry.dispose(); stone.cracks = null; }
    const C = STONE.crack, faces = C.faces[stage] || 0; if (!faces) return;
    const geo = stone.mesh.geometry, pos = geo.attributes.position, idx = geo.getIndex(), tris = (idx ? idx.count : pos.count) / 3;
    const out = [], A = new THREE.Vector3(), B = new THREE.Vector3(), Cc = new THREE.Vector3(), n = new THREE.Vector3(), u = new THREE.Vector3(), w = new THREE.Vector3(), p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), side = new THREE.Vector3(), seg = new THREE.Vector3();
    const width = C.width * (stage >= 2 ? 1.5 : 1);
    for (let f = 0; f < faces; f++) {
      // a dodecahedron face is three triangles in a row: take one face, walk a broken line across it
      const face = Math.floor(srand(stone, f * 7 + 1) * (tris / 3)) % Math.max(1, Math.floor(tris / 3)), t0 = face * 3, at = i => idx ? idx.getX(i) : i;
      A.fromBufferAttribute(pos, at(t0 * 3)); B.fromBufferAttribute(pos, at(t0 * 3 + 1)); Cc.fromBufferAttribute(pos, at(t0 * 3 + 2));
      n.subVectors(B, A).cross(u.subVectors(Cc, A)).normalize();
      const cen = new THREE.Vector3(), seen = [];
      for (let k = 0; k < 9; k++) seen.push(new THREE.Vector3().fromBufferAttribute(pos, at(t0 * 3 + k)));
      for (const v of seen) cen.add(v); cen.multiplyScalar(1 / seen.length);
      u.subVectors(seen[0], cen).normalize(); w.crossVectors(n, u).normalize();
      const ang = srand(stone, f * 13 + 2) * Math.PI, ca = Math.cos(ang), sa = Math.sin(ang), len = 0.36 + srand(stone, f * 5 + 3) * 0.16, steps = 5;
      const pt = (k, target) => { const t = k / steps * 2 - 1, j = (srand(stone, f * 31 + k * 3 + 4) - 0.5) * 0.2 * (k === 0 || k === steps ? 0.3 : 1); const a = t * len, bb = j; return target.copy(cen).addScaledVector(u, a * ca - bb * sa).addScaledVector(w, a * sa + bb * ca).addScaledVector(n, C.lift); };
      for (let k = 0; k < steps; k++) {
        pt(k, p0); pt(k + 1, p1); seg.subVectors(p1, p0); side.crossVectors(n, seg).normalize();
        const w0 = width * (k === 0 ? 0.15 : 1) * 0.5, w1 = width * (k === steps - 1 ? 0.15 : 1) * 0.5; // tapered ends
        const q = [p0.clone().addScaledVector(side, w0), p0.clone().addScaledVector(side, -w0), p1.clone().addScaledVector(side, w1), p1.clone().addScaledVector(side, -w1)];
        for (const i of [0, 1, 2, 2, 1, 3]) out.push(q[i].x, q[i].y, q[i].z);
        if (k === 2 && stage >= 2) { // a branch off the middle
          p0.copy(p1); p1.addScaledVector(side, 0.2 + srand(stone, f + 40) * 0.12).addScaledVector(seg, 0.5);
          const s2 = new THREE.Vector3().crossVectors(n, new THREE.Vector3().subVectors(p1, p0)).normalize(), qb = [p0.clone().addScaledVector(s2, width * 0.4), p0.clone().addScaledVector(s2, -width * 0.4), p1.clone()];
          for (const v of qb) out.push(v.x, v.y, v.z);
        }
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3)); g.computeVertexNormals();
    if (!crackMat) { crackMat = new THREE.MeshBasicMaterial({ color: C.color, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); crackMat.onBeforeCompile = addNearFade; crackMat.customProgramCacheKey = () => 'nearfade-crack'; } // fades with the rock when it stands between the camera and Rizer
    const m = new THREE.Mesh(g, crackMat); m.matrixAutoUpdate = false; m.userData.noCollide = true; m.frustumCulled = false;
    stone.cracks = m; group.add(m); placeCracks(stone, baseOf(stone));
  }
  let crackMat = null;
  const placeCracks = (stone, matrix) => { if (stone.cracks) { stone.cracks.matrix.copy(matrix); stone.cracks.matrixWorldNeedsUpdate = true; } };
  // It comes apart. `force`: 1 = broken by blows · higher = shattered (the aerial slam).
  function crumbleStone(stone, from, force = 1) {
    const s = stone.scale, n = Math.max(12, Math.min(32, Math.round(12 + s * 11))), ever = Math.max(2, Math.min(6, Math.round(1 + s * 2.5))); // the first few core pieces are Everstone to gather
    let ax = from ? stone.x - from.x : 0, az = from ? stone.z - from.z : 0; const ad = Math.hypot(ax, az) || 1; ax /= ad; az /= ad; // away from the blow
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * stone.radius * 0.8, core = i < n * 0.4;
      const x = stone.x + Math.cos(a) * rr, z = stone.z + Math.sin(a) * rr, y = stone.y + stone.h * (0.15 + Math.random() * 0.7);
      const out = (core ? 0.4 + Math.random() * 0.9 : 1.8 + Math.random() * 3.2) * force, push = from ? (core ? 0.5 : 1.6) * force : 0;
      addShard(stone, x, y, z, Math.cos(a) * out + ax * push, (core ? 0.6 + Math.random() * 1.6 : 2.4 + Math.random() * 3.6) * Math.min(1.6, force), Math.sin(a) * out + az * push, s * (core ? 0.14 + Math.random() * 0.1 : 0.06 + Math.random() * 0.09), core && i < ever);
    }
  }
  function updateShards(dt) {
    for (const stone of shaking) {
      stone.shake -= dt; const k = Math.max(0, stone.shake / STONE.shake), base = baseOf(stone);
      if (stone.broken) { shaking.delete(stone); continue; }
      if (k <= 0) { stone.mesh.setMatrixAt(stone.index, base); placeCracks(stone, base); shaking.delete(stone); }
      else { const j = 0.045 * stone.scale * k; sM.makeTranslation((Math.random() - 0.5) * j, -Math.abs(Math.sin(k * 9)) * j * 0.6, (Math.random() - 0.5) * j).multiply(base); stone.mesh.setMatrixAt(stone.index, sM); placeCracks(stone, sM); }
      stone.mesh.instanceMatrix.needsUpdate = true;
    }
    for (const p of pools) p.update(dt);
    updateGreenery(dt);
  }
  // from: where the blow came from (chips fly back toward it, the break is thrown away from it) · force: see crumbleStone.
  function damageStone(stone, damage, hitKey, from = null, force = 1) {
    if (stone.broken || !(damage > 0) || stone.hitKeys.has(hitKey)) return false;
    stone.hitKeys.add(hitKey); if (stone.hitKeys.size > 16) stone.hitKeys.clear();
    stone.hp = Math.max(0, stone.hp - damage);
    const ratio = stone.hp / stone.maxHP, stage = ratio <= 0 ? 3 : ratio <= 0.34 ? 2 : ratio < 1 ? 1 : 0;
    if (stone.hp > 0) {
      if (stage !== stone.stage) { stone.stage = stage; crackStone(stone, stage); }
      baseOf(stone); stone.shake = STONE.shake; shaking.add(stone);
      chipStone(stone, from, 2 + Math.round(Math.random() * 2) + (stage >= 2 ? 2 : 0));
    }
    stoneFX?.(stone.x, stone.y + 0.12, stone.z, stone.hp <= 0, stone, force);
    if (stone.hp <= 0) {
      stone.broken = true; stone.stage = 3;
      crumbleStone(stone, from, force);
      if (stone.cracks) { group.remove(stone.cracks); stone.cracks.geometry.dispose(); stone.cracks = null; }
      stone.mesh.setMatrixAt(stone.index, new THREE.Matrix4().makeScale(0, 0, 0));
      stone.mesh.instanceMatrix.needsUpdate = true;
      for (const o of stone.colliders) o.active = false;
      if (stone.glints) group.remove(stone.glints);
      disableStoneInstance(stone.mesh, stone.index);
      if (stone.isAstraliteStone) spawnAstralite(stone);
    }
    return true;
  }
  // ── trees and bushes: alive the same way ──
  // A tree struck shudders, sheds leaves and bark, shows pale fresh wood where it was cut and leans a little more
  // with every wound; felled, it topples away from the blow, crashes, and comes apart into logs and leaf, leaving
  // its stump. A bush rustles when anything pushes through it, sheds leaves when struck and bursts apart when broken.
  const GREEN = {
    tree: { hp: s => Math.round(8 + s * 6), lean: 0.07, shake: 0.45, fall: [0.35, 3.4], notches: 6 }, // hp by size · lean (rad) at 0 health · fall: angular push · gravity
    bush: { hp: s => Math.max(2, Math.round(2 + s * 2)), shake: 0.4 },
    // per kind: trunk height and base radius (master()), where the crown sits, its width, and its leaf colours
    kinds: {
      broadleaf: { trunkH: 3.4, trunkR: 0.3, top: 6.6, crown: [3.6, 6.4], crownR: 1.9, leaves: ['#4f7040', '#5d7d45', '#48683b', '#628449'] },
      pine: { trunkH: 2.2, trunkR: 0.26, top: 7.9, crown: [1.2, 7.4], crownR: 1.5, leaves: ['#3f5e3f', '#365438'], hit: 0.85 },
      willow: { trunkH: 3, trunkR: 0.38, top: 6.3, crown: [2.4, 5.8], crownR: 2.6, leaves: ['#6f8a4c', '#68844a'] },
      bush: { leaves: ['#557a42', '#648448', '#486d3c', '#6b8a49'] }
    },
    wood: '#5f4b35', fresh: '#caa877'
  };
  const bushes = [], swaying = new Set(), falling = new Set();
  let woodDebris = null, leafDebris = null, stumpMesh = null, notchMesh = null, stumps = 0, notches = 0, natureFX = null;
  const softMat = () => new THREE.MeshStandardMaterial({ roughness: 0.95, flatShading: true });
  function greenPools() {
    if (woodDebris) return;
    woodDebris = makeDebris(new THREE.CylinderGeometry(0.5, 0.5, 1, 6), softMat(), 260);
    leafDebris = makeDebris(new THREE.IcosahedronGeometry(1, 0), softMat(), 420);
    const side = new THREE.CylinderGeometry(0.86, 1.12, 1, 7, 1, true); side.translate(0, 0.5, 0);
    const top = new THREE.CircleGeometry(0.86, 7); top.rotateX(-Math.PI / 2); top.translate(0, 1, 0);
    stumpMesh = new THREE.InstancedMesh(mergeGeometries([colored(side, GREEN.wood, 0, null), colored(top, GREEN.fresh, 0, null)]), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }), 320);
    notchMesh = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: GREEN.fresh, roughness: 0.9, flatShading: true }), 900);
    for (const m of [stumpMesh, notchMesh]) { m.count = 0; m.frustumCulled = false; m.receiveShadow = true; m.userData.noCollide = true; group.add(m); }
  }
  const leafColor = (K, r = Math.random) => new THREE.Color(K.leaves[Math.floor(r() * K.leaves.length)]).multiplyScalar(0.85 + r() * 0.3);
  const woodColor = (fresh = false) => new THREE.Color(fresh ? GREEN.fresh : GREEN.wood).multiplyScalar(0.85 + Math.random() * 0.3);
  // The instance, tipped over its own base by `angle` toward (dx, dz).
  function tipped(e, dx, dz, angle, out) {
    sV.set(dz, 0, -dx); if (sV.lengthSq() < 1e-6) sV.set(1, 0, 0);
    sM2.makeRotationAxis(sV.normalize(), angle);
    return out.makeTranslation(e.x, e.gy, e.z).multiply(sM2).multiply(sM3.makeTranslation(-e.x, -e.gy, -e.z)).multiply(baseOf(e));
  }
  const setInstance = (e, m) => { e.mesh.setMatrixAt(e.index, m); e.mesh.instanceMatrix.needsUpdate = true; };
  const awayFrom = (e, from) => { let dx = from ? e.x - from.x : Math.random() - 0.5, dz = from ? e.z - from.z : Math.random() - 0.5; const d = Math.hypot(dx, dz) || 1; return [dx / d, dz / d]; };
  function shedLeaves(e, K, n, spread, y0, y1, burst = 1) {
    greenPools();
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * spread, sz = e.scale * (0.05 + Math.random() * 0.06) * (burst > 1 ? 1.6 : 1);
      leafDebris.add({ x: e.x + Math.cos(a) * rr, y: e.gy + y0 + Math.random() * (y1 - y0), z: e.z + Math.sin(a) * rr, vx: Math.cos(a) * (0.4 + Math.random() * 1.4) * burst, vy: (0.2 + Math.random() * 1.6) * burst, vz: Math.sin(a) * (0.4 + Math.random() * 1.4) * burst,
        sx: sz * 1.6, sy: sz * 0.35, sz: sz * 1.2, color: leafColor(K), half: sz * 0.2, drag: 2.2, life: 2.4 + Math.random() * 2.2 });
    }
  }
  function damageTree(tree, damage, hitKey, from = null, at = null) {
    if (tree.broken || !(damage > 0) || tree.hitKeys.has(hitKey)) return false;
    tree.hitKeys.add(hitKey); if (tree.hitKeys.size > 16) tree.hitKeys.clear();
    greenPools();
    const K = GREEN.kinds[tree.kind], s = tree.scale, [dx, dz] = awayFrom(tree, from);
    tree.hp = Math.max(0, tree.hp - damage); tree.dir = [dx, dz];
    // bark and fresh chips off the struck side, leaves shaken out of the crown
    const hitY = Math.max(0.35 * s, Math.min(K.trunkH * s * 0.8, (at?.y ?? tree.gy + 1.1) - tree.gy));
    for (let i = 0, n = 2 + Math.round(Math.random() * 2); i < n; i++) {
      const a = (Math.random() - 0.5) * 1.6, c = Math.cos(a), sn = Math.sin(a), ox = -(dx * c - dz * sn), oz = -(dx * sn + dz * c), sp = 1.4 + Math.random() * 2.2, sz = s * (0.05 + Math.random() * 0.05);
      woodDebris.add({ x: tree.x + ox * tree.trunkR, y: tree.gy + hitY + (Math.random() - 0.5) * 0.3, z: tree.z + oz * tree.trunkR, vx: ox * sp, vy: 1.2 + Math.random() * 2, vz: oz * sp, sx: sz * 0.7, sy: sz * 2.2, sz: sz * 0.5, color: woodColor(Math.random() < 0.6), half: sz * 0.3, life: 2.5 + Math.random() * 2 });
    }
    shedLeaves(tree, K, 5 + Math.round(Math.random() * 4), K.crownR * s * 0.8, K.crown[0] * s, K.crown[1] * s);
    if (tree.hp > 0) {
      if (tree.notches.length < GREEN.tree.notches && notches < 900) { // the wound: pale fresh wood where the blow landed
        const w = s * (0.16 + Math.random() * 0.08);
        sP.set(tree.x - dx * tree.trunkR * 0.82, tree.gy + hitY, tree.z - dz * tree.trunkR * 0.82); sQ.setFromEuler(sE.set(0, Math.atan2(-dx, -dz), (Math.random() - 0.5) * 0.7)); sS.set(w, w * 0.45, w * 0.3);
        notchMesh.setMatrixAt(notches, sM.compose(sP, sQ, sS)); tree.notches.push(notches); notchMesh.count = ++notches; notchMesh.instanceMatrix.needsUpdate = true;
      }
      tree.shake = GREEN.tree.shake; swaying.add(tree);
      natureFX?.('tree', 'hit', tree.x, tree.gy + hitY, tree.z, tree);
    } else {
      tree.broken = true; tree.fall = { a: (1 - 0) * GREEN.tree.lean, w: GREEN.tree.fall[0] }; swaying.delete(tree); falling.add(tree);
      for (const o of tree.colliders) o.active = false;
      for (const i of tree.notches) { notchMesh.setMatrixAt(i, sM.makeScale(0, 0, 0)); } notchMesh.instanceMatrix.needsUpdate = true;
      natureFX?.('tree', 'fall', tree.x, tree.gy + 1, tree.z, tree);
    }
    return true;
  }
  // It has hit the ground: the instance goes, and what it was made of is left lying there.
  function crashTree(tree) {
    const K = GREEN.kinds[tree.kind], s = tree.scale, [dx, dz] = tree.dir, head = Math.atan2(dx, dz);
    setInstance(tree, sM.makeScale(0, 0, 0)); disableTreeInstance(tree.mesh, tree.index);
    const logs = 3 + (s > 1.15 ? 1 : 0), len = K.trunkH * s / logs;
    for (let i = 0; i < logs; i++) { // the trunk, in lengths, where it fell
      const d = (i + 0.6) * len, r = tree.trunkR * (1 - i * 0.12), x = tree.x + dx * d, z = tree.z + dz * d;
      woodDebris.add({ x, y: T.heightAt(x, z) + r + 0.25, z, vx: dx * 0.6 + (Math.random() - 0.5) * 1.6, vy: 1.6 + Math.random() * 1.6, vz: dz * 0.6 + (Math.random() - 0.5) * 1.6, sx: r * 2, sy: len * 0.92, sz: r * 2,
        rx: Math.PI / 2, ry: 0, rz: -head + (Math.random() - 0.5) * 0.5, spin: 0, ay: 0, color: woodColor(), half: r, life: 6 + Math.random() * 2, wood: 1 }); // wood: a length of Fresh Wood, until it sinks
    }
    for (let i = 0, n = 5 + Math.round(s * 3); i < n; i++) { // split wood and branches
      const d = K.trunkH * s * (0.3 + Math.random() * 1.1), x = tree.x + dx * d + (Math.random() - 0.5), z = tree.z + dz * d + (Math.random() - 0.5), sz = s * (0.07 + Math.random() * 0.07);
      woodDebris.add({ x, y: T.heightAt(x, z) + 0.4, z, vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 3, vz: (Math.random() - 0.5) * 4, sx: sz, sy: sz * (4 + Math.random() * 5), sz: sz, color: woodColor(Math.random() < 0.4), half: sz * 0.5, life: 4 + Math.random() * 2 });
    }
    for (let i = 0, n = 12 + Math.round(s * 6); i < n; i++) { // the crown, broken into leaf
      const d = (K.crown[0] + Math.random() * (K.crown[1] - K.crown[0])) * s, sd = (Math.random() - 0.5) * K.crownR * s * 1.6, x = tree.x + dx * d + dz * sd, z = tree.z + dz * d - dx * sd, sz = s * (0.3 + Math.random() * 0.34);
      leafDebris.add({ x, y: T.heightAt(x, z) + sz * 0.6 + Math.random() * 0.8, z, vx: (Math.random() - 0.5) * 3 + dx, vy: 1.4 + Math.random() * 2.6, vz: (Math.random() - 0.5) * 3 + dz, sx: sz, sy: sz * 0.62, sz: sz * 0.9, color: leafColor(K), half: sz * 0.45, life: 4.5 + Math.random() * 2.5, spin: 0.35 });
    }
    const tip = { x: tree.x + dx * K.top * s * 0.7, gy: T.heightAt(tree.x + dx * K.top * s * 0.7, tree.z + dz * K.top * s * 0.7), z: tree.z + dz * K.top * s * 0.7, scale: s };
    shedLeaves(tip, K, 26, K.crownR * s, 0.2, 1.6, 1.8);
    if (stumps < 320) { // what stays: the stump, cut pale on top
      sP.set(tree.x, tree.gy - 0.05, tree.z); sQ.setFromEuler(sE.set((Math.random() - 0.5) * 0.08, Math.random() * 6.3, (Math.random() - 0.5) * 0.08)); sS.set(tree.trunkR * 1.05, s * (0.32 + Math.random() * 0.16), tree.trunkR * 1.05);
      stumpMesh.setMatrixAt(stumps, sM.compose(sP, sQ, sS)); stumpMesh.count = ++stumps; stumpMesh.instanceMatrix.needsUpdate = true;
    }
    natureFX?.('tree', 'crash', tree.x + dx * K.top * s * 0.45, T.heightAt(tree.x + dx * K.top * s * 0.45, tree.z + dz * K.top * s * 0.45), tree.z + dz * K.top * s * 0.45, tree, { x: tree.x + dx * K.top * s, z: tree.z + dz * K.top * s });
    // whatever it lands on takes the weight of it
    for (const e of nearby(tree.x + dx * K.top * s * 0.5, tree.z + dz * K.top * s * 0.5, K.top * s * 0.6)) {
      if (e === tree || e.broken) continue;
      const t = Math.max(0, Math.min(K.top * s, (e.x - tree.x) * dx + (e.z - tree.z) * dz)), off = Math.hypot(e.x - tree.x - dx * t, e.z - tree.z - dz * t);
      if (t > 1 && off < K.crownR * s * 0.5 + e.radius) damageEntry(e, 4, `treefall-${tree.index}-${tree.kind}`, tree);
    }
  }
  function damageBush(bush, damage, hitKey, from = null) {
    if (bush.broken || !(damage > 0) || bush.hitKeys.has(hitKey)) return false;
    bush.hitKeys.add(hitKey); if (bush.hitKeys.size > 16) bush.hitKeys.clear();
    greenPools();
    const K = GREEN.kinds.bush, s = bush.scale; bush.hp = Math.max(0, bush.hp - damage);
    if (bush.hp > 0) { bush.shake = GREEN.bush.shake; bush.amp = 1; swaying.add(bush); shedLeaves(bush, K, 7, bush.radius * 0.8, 0.3 * s, 1.1 * s, 1.3); natureFX?.('bush', 'hit', bush.x, bush.gy + 0.6 * s, bush.z, bush); return true; }
    bush.broken = true; swaying.delete(bush); setInstance(bush, sM.makeScale(0, 0, 0)); disableTreeInstance(bush.mesh, bush.index);
    const [dx, dz] = awayFrom(bush, from), bushWood = s > 1 ? 2 : 1;
    for (let i = 0; i < 9; i++) { const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 2.5, sz = s * (0.2 + Math.random() * 0.2);
      leafDebris.add({ x: bush.x + Math.cos(a) * bush.radius * 0.5, y: bush.gy + (0.3 + Math.random() * 0.6) * s, z: bush.z + Math.sin(a) * bush.radius * 0.5, vx: Math.cos(a) * sp + dx * 1.5, vy: 2 + Math.random() * 2.5, vz: Math.sin(a) * sp + dz * 1.5, sx: sz, sy: sz * 0.6, sz: sz * 0.9, color: leafColor(K), half: sz * 0.4, life: 3.5 + Math.random() * 2, spin: 0.4 }); }
    for (let i = 0; i < 6; i++) { const a = Math.random() * Math.PI * 2, sz = s * (0.035 + Math.random() * 0.03);
      woodDebris.add({ x: bush.x, y: bush.gy + 0.3 * s, z: bush.z, vx: Math.cos(a) * (1 + Math.random() * 2.5) + dx, vy: 2 + Math.random() * 2.5, vz: Math.sin(a) * (1 + Math.random() * 2.5) + dz, sx: sz, sy: sz * (8 + Math.random() * 8), sz: sz, color: woodColor(), half: sz * 0.5, life: 3.5 + Math.random() * 2, ...(i < bushWood ? { wood: 1, life: 6 + Math.random() * 2 } : {}) }); } // the first few twigs are Fresh Wood
    shedLeaves(bush, K, 22, bush.radius, 0.2 * s, 1.2 * s, 2);
    natureFX?.('bush', 'break', bush.x, bush.gy + 0.5 * s, bush.z, bush);
    return true;
  }
  function updateGreenery(dt) {
    for (const e of swaying) {
      e.shake -= dt;
      if (e.kind === 'bush') { // rustle: it squashes and springs back
        const k = Math.max(0, e.shake / GREEN.bush.shake), w = Math.sin(k * 16) * 0.1 * k * (e.amp || 1);
        if (k <= 0) { setInstance(e, baseOf(e)); swaying.delete(e); continue; }
        setInstance(e, sM2.makeTranslation(e.x, e.gy, e.z).multiply(sM.makeScale(1 + w, 1 - w * 0.8, 1 - w * 0.6)).multiply(sM.makeTranslation(-e.x, -e.gy, -e.z)).multiply(baseOf(e)));
      } else { // a struck tree shudders about the lean its wounds have given it
        const k = Math.max(0, e.shake / GREEN.tree.shake), lean = (1 - e.hp / e.maxHP) * GREEN.tree.lean;
        tipped(e, e.dir[0], e.dir[1], lean + Math.sin(k * 20) * 0.035 * k, sM); setInstance(e, sM);
        if (k <= 0) swaying.delete(e);
      }
    }
    for (const tree of falling) { // going over: slow at first, then all at once
      const f = tree.fall; f.w += (GREEN.tree.fall[1] * Math.sin(Math.max(0.08, f.a)) + 0.6) * dt; f.a += f.w * dt;
      const K = GREEN.kinds[tree.kind], tx = tree.x + tree.dir[0] * K.top * tree.scale, tz = tree.z + tree.dir[1] * K.top * tree.scale;
      const end = Math.PI / 2 - Math.atan2(T.heightAt(tx, tz) - tree.gy, K.top * tree.scale); // until it lies on the ground it falls onto
      if (f.a >= end) { falling.delete(tree); crashTree(tree); continue; }
      tipped(tree, tree.dir[0], tree.dir[1], f.a, sM); setInstance(tree, sM);
    }
  }
  // ── one way in for everything that can hurt the world ──
  // A grid over every stone, tree and bush, so a blow or a blast only looks at what is near it.
  const CELL = 8, cells = new Map(), cellKey = (x, z) => Math.floor(x / CELL) + ',' + Math.floor(z / CELL);
  let gridBuilt = false;
  function buildGrid() { gridBuilt = true; for (const e of [...stones, ...trees, ...bushes]) { const k = cellKey(e.x, e.z); (cells.get(k) || cells.set(k, []).get(k)).push(e); } }
  function nearby(x, z, r) {
    if (!gridBuilt) buildGrid();
    const out = [], x0 = Math.floor((x - r - 3) / CELL), x1 = Math.floor((x + r + 3) / CELL), z0 = Math.floor((z - r - 3) / CELL), z1 = Math.floor((z + r + 3) / CELL);
    for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) { const c = cells.get(i + ',' + j); if (c) for (const e of c) if (!e.broken) out.push(e); }
    return out;
  }
  const damageEntry = (e, damage, hitKey, from, at, force) => e.kind === 'rock' ? damageStone(e, damage, hitKey, from, force) : e.kind === 'bush' ? damageBush(e, damage, hitKey, from) : damageTree(e, damage, hitKey, from, at);
  const bA = new THREE.Vector3(), bB = new THREE.Vector3(), bC = new THREE.Vector3(), bD = new THREE.Vector3();
  const segPoint = (a, b, p) => { bC.subVectors(b, a); const L = bC.lengthSq(), t = L > 1e-9 ? Math.max(0, Math.min(1, bD.subVectors(p, a).dot(bC) / L)) : 0; return bD.copy(a).addScaledVector(bC, t).distanceTo(p); };
  // Does this capsule (a limb, a blade, a bolt or an arrow: { a, b, r, pa?, pb? }) touch it?
  function touches(e, seg) {
    const r = seg.r ?? 0.12;
    if (e.kind === 'rock') return Math.hypot(seg.b.x - e.x, seg.b.z - e.z) < e.scale * 1.4 + r + 1 && stoneSurfaceTouch(e, seg);
    if (e.kind === 'bush') { bA.set(e.x, e.gy + e.h * 0.5, e.z); return segPoint(seg.a, seg.b, bA) <= e.radius * 0.85 + r; }
    bA.set(e.x, e.gy, e.z); bB.set(e.x, e.gy + e.trunkH, e.z); // a tree is struck on its trunk
    return segSeg(seg.a, seg.b, bA, bB, edgeA, edgeB) <= e.hitR + r || (!!seg.pa && segSeg(seg.pa, seg.a, bA, bB, edgeA, edgeB) <= e.hitR + r);
  }
  const breakables = {
    get stones() { return stones; }, get trees() { return trees; }, get bushes() { return bushes; },
    setHitEffect(fn) { natureFX = fn; }, // fn(kind 'tree' | 'bush', event 'hit' | 'fall' | 'crash' | 'break' | 'rustle', x, y, z, entry, extra)
    // A blow, a blade, a bolt, an arrow: damages whatever it actually touches. Returns how many things it hit.
    // only: restrict to one entry (a locked stone) · first: stop at the first thing hit (projectiles).
    strike(seg, damage, hitKey, { only = null, first = false } = {}) {
      if (!seg?.a || !seg?.b || !(damage > 0)) return 0;
      let hits = 0;
      for (const e of only ? [only] : nearby((seg.a.x + seg.b.x) / 2, (seg.a.z + seg.b.z) / 2, seg.a.distanceTo(seg.b) / 2 + (seg.r ?? 0.12))) {
        if (e.broken || e.hitKeys.has(hitKey) || Math.abs((seg.b.y + seg.a.y) / 2 - (e.gy ?? e.y)) > 12 || !touches(e, seg)) continue;
        if (damageEntry(e, damage, hitKey, seg.pa || seg.a, seg.b)) { hits++; if (first) break; }
      }
      return hits;
    },
    // An explosion or a shockwave at `c`: full `damage` at the centre down to `edge` at `radius`. force: how hard stone is thrown apart.
    blast(c, radius, damage, edge = damage * 0.35, hitKey = `blast-${performance.now()}-${Math.random()}`, force = 1.3) {
      let hits = 0;
      for (const e of nearby(c.x, c.z, radius)) {
        const d = Math.hypot(e.x - c.x, e.z - c.z) - e.radius; if (d > radius || Math.abs((e.gy ?? e.y) - c.y) > radius + 3) continue;
        const dmg = Math.round(damage - (damage - edge) * Math.max(0, Math.min(1, d / radius)));
        if (dmg > 0 && damageEntry(e, dmg, hitKey, c, null, force)) hits++;
      }
      return hits;
    },
    // A body pushing through (Rizer, for now): bushes it brushes rustle. Costs nothing when nothing is near.
    rustle(p, r = 0.55, speed = 0) {
      if (speed < 0.6) return;
      for (const e of nearby(p.x, p.z, r)) if (e.kind === 'bush' && !(e.shake > 0.12) && Math.abs(e.gy - p.y) < 2 && Math.hypot(e.x - p.x, e.z - p.z) < e.radius + r) {
        greenPools(); e.shake = GREEN.bush.shake; e.amp = Math.min(1, 0.35 + speed / 12); swaying.add(e);
        shedLeaves(e, GREEN.kinds.bush, speed > 5 ? 4 : 2, e.radius * 0.7, 0.4 * e.scale, 1 * e.scale); natureFX?.('bush', 'rustle', e.x, e.gy + 0.5 * e.scale, e.z, e);
      }
    },
    fell(tree, from = null) { return !!tree && !tree.broken && damageTree(tree, tree.hp, `fell-${performance.now()}`, from); }
  };
  group.userData.breakables = breakables;
  const stoneSystem = {
    list: stones,
    get fragments() { return pools.reduce((n, p) => n + p.list.length, 0); },
    setDisableInstance(fn) { disableStoneInstance = fn || (() => {}); },
    setHitEffect(fn) { stoneFX = fn; },
    // Everstone: the larger rubble of a smashed stone lying within `r` of (x, z), still above ground. Each is taken
    // (it vanishes) and returned as { x, y, z }; once a piece has begun to sink into the soil it can't be gathered.
    collectStone(x, y, z, r) {
      const out = []; if (!rockDebris) return out; const L = rockDebris.list;
      for (let i = L.length - 1; i >= 0; i--) {
        const q = L[i]; if (!q.ever || q.t > q.life || Math.abs(q.y - y) > 2.2) continue;
        const dx = q.x - x, dz = q.z - z, reach = r + q.sx * 0.5;
        if (dx * dx + dz * dz < reach * reach) { out.push({ x: q.x, y: q.y, z: q.z }); L.splice(i, 1); }
      }
      return out;
    },
    collect(drop) { if (!drop || drop.collected) return false; drop.collected = true; group.remove(drop.mesh); drop.mesh.traverse(o => { o.geometry?.dispose(); if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material?.dispose(); }); return true; },
    // Break it outright, whatever its health (the aerial slam). from: where the blow lands from · force: how hard it is thrown apart.
    shatter(stone, from = null, force = 1.8) { return !!stone && !stone.broken && damageStone(stone, stone.hp, `shatter-${stone.index}-${performance.now()}`, from, force); },
    update(dt) { updateShards(dt); for (const s of stones) if (s.drop && !s.drop.collected) { s.drop.mesh.rotation.y += dt * 0.85; s.drop.mesh.position.y = s.drop.baseY + Math.sin(performance.now() * 0.002 + s.index) * 0.045; } },
    hitSegment(segment, damage, hitKey, target) {
      // Resource damage needs an explicit lock and contact with this instance's
      // visible triangles. A broad rock collider must never stand in for a hit.
      if (!segment?.a || !segment?.b || !(damage > 0) || !target || target.broken) return 0;
      let hits = 0;
      for (const stone of [target]) {
        if (stone.broken || stone.hitKeys.has(hitKey)) continue;
        if (!stoneSurfaceTouch(stone, segment)) continue;
        if (damageStone(stone, damage, hitKey, segment.pa || segment.a)) hits++;
      }
      return hits;
    }
  };
  group.userData.stones = stoneSystem;
  group.userData.trees = {
    list: trees,
    // Fresh Wood: the trunk lengths of a felled tree lying within `r` of (x, z), still above ground. Each is taken
    // (it vanishes) and returned as { x, y, z }; once a length has begun to sink into the soil it can't be gathered.
    collectWood(x, y, z, r) {
      const out = []; if (!woodDebris) return out; const L = woodDebris.list;
      for (let i = L.length - 1; i >= 0; i--) {
        const q = L[i]; if (!q.wood || q.t > q.life || Math.abs(q.y - y) > 2.2) continue;
        const dx = q.x - x, dz = q.z - z, reach = r + q.sy * 0.4;
        if (dx * dx + dz * dz < reach * reach) { out.push({ x: q.x, y: q.y, z: q.z }); L.splice(i, 1); }
      }
      return out;
    },
    setDisableInstance(fn) { disableTreeInstance = fn || (() => {}); },
    setHitEffect(fn) { natureFX = fn; }
  };
  // The bus uses the visible prop footprints swept by its body. This bypasses
  // attack lock-on while retaining the same rock break and Astralite drop path.
  group.userData.boostImpact = (from, to, heading, halfWidth, halfLength) => {
    const c = Math.cos(heading), s = Math.sin(heading);
    const touches = (entry, radius) => {
      if (Math.abs(entry.y - to.y) > 3.5) return false;
      for (const t of [0, 0.5, 1]) {
        const dx = entry.x - (from.x + (to.x - from.x) * t);
        const dz = entry.z - (from.z + (to.z - from.z) * t);
        const side = dx * c - dz * s, forward = dx * s + dz * c;
        if (Math.abs(side) <= halfWidth + radius && Math.abs(forward) <= halfLength + radius) return true;
      }
      return false;
    };
    let rocks = 0, timber = 0;
    for (const stone of stones) if (!stone.broken && touches(stone, stone.radius)) {
      if (damageStone(stone, stone.hp, `bus-${stone.index}`, from, 1.5)) rocks++;
    }
    for (const tree of trees) if (!tree.broken && touches(tree, tree.radius)) {
      if (breakables.fell(tree, from)) timber++;
    }
    for (const bush of bushes) if (!bush.broken && touches(bush, bush.radius)) damageBush(bush, bush.hp, `bus-${bush.index}`, from);
    return { rocks, trees: timber };
  };
  const noise = makeNoise(W.seed + 101);
  const E = (W.featureExtent || W.extent) - 3;
  const pads = T.pads;
  const riverD = (x, z) => T.riverIdx.nearest(x, z, 14)?.d ?? 99;
  const roadD = (x, z, pad = 0, early = false) => { const n = T.roads.nearest(x, z, 10, early ? l => !l.data.late : undefined); return n ? n.d - n.line.data.width - pad : 99; }; // early: only what Malezor first shipped with
  const inWater = (x, z) => T.waterAt(x, z) > T.heightAt(x, z) - 0.2;
  const onPad = (x, z, pad = 2, early = false) => pads.some(p => !(early && p.late) && Math.hypot(x - p.x, z - p.z) < p.r + pad) || (W.clearings || []).some(c => Math.hypot(x - c.x, z - c.z) < c.r + pad) || W.paddocks.some(pd => Math.abs(x - pd.x) < pd.w / 2 + pad && Math.abs(z - pd.z) < pd.d / 2 + pad);
  const inPlaza = (x, z, pad = 0) => Math.hypot(x - W.plaza.x, z - W.plaza.z) < W.plaza.r + pad;
  const clear = (x, z, { road = 2.5, river = 4.5, pad = 2 } = {}) => !(roadD(x, z) < road || riverD(x, z) < river || inWater(x, z) || onPad(x, z, pad) || inPlaza(x, z, 6));

  function scatter(kind, count, seed, accept, { scale = [0.8, 1.3], collide = 0.45, tint = 0.12, color } = {}) {
    const r = rng(seed), mats = [];
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, flatShading: true });
    if (kind !== 'rock' && kind !== 'bush') addWind(mat, shared.uTime, { from: kind === 'pine' ? 2 : 2.4, amp: kind === 'willow' ? 0.02 : 0.008 });
    else { mat.onBeforeCompile = addNearFade; mat.customProgramCacheKey = () => 'nearfade'; }
    const inst = new THREE.InstancedMesh(master(kind, seed), mat, count);
    const d = new THREE.Object3D(), c = new THREE.Color(); let n = 0;
    const rockEntries = kind === 'rock' ? [] : null;
    for (let t = 0; t < count * 60 && n < count; t++) {
      const x = r.range(-E, E), z = r.range(-E, E);
      if (W.containsLand && !W.containsLand(x, z)) continue;
      if (!accept(x, z, r)) continue;
      const s = r.range(...scale), y = T.heightAt(x, z);
      d.position.set(x, y - 0.15, z); d.rotation.set(kind === 'rock' ? r() * 3 : (r() - 0.5) * 0.08, r() * Math.PI * 2, kind === 'rock' ? r() * 3 : (r() - 0.5) * 0.08);
      if (kind === 'rock') { d.scale.set(s, s * r.range(0.45, 0.85), s * r.range(0.7, 1.1)); d.position.y = y + s * 0.12; }
      else d.scale.setScalar(s);
      d.updateMatrix(); inst.setMatrixAt(n, d.matrix);
      c.set(color || '#ffffff').offsetHSL((r() - 0.5) * 0.04, (r() - 0.5) * tint, (r() - 0.5) * tint); inst.setColorAt(n, c);
      const rock = kind === 'rock' ? { kind: 'rock', gy: y, mesh: inst, index: n, x, y: d.position.y, z, scale: s, h: s * 0.85, radius: s * 0.58, maxHP: Math.max(2, Math.round(3 + s * 3.5)), hp: Math.max(2, Math.round(3 + s * 3.5)), stage: 0, baseColor: c.clone(), colliders: [], hitKeys: new Set(), broken: false, isAstraliteStone: false } : null;
      const tree = kind === 'broadleaf' || kind === 'pine' || kind === 'willow'
        ? { kind, mesh: inst, index: n, x, y, gy: y, z, scale: s, radius: Math.min(collide * s, 0.22 * s), trunkH: GREEN.kinds[kind].trunkH * s, trunkR: GREEN.kinds[kind].trunkR * s, hitR: (GREEN.kinds[kind].hit ?? GREEN.kinds[kind].trunkR) * s, maxHP: GREEN.tree.hp(s), hp: GREEN.tree.hp(s), notches: [], dir: [1, 0], hitKeys: new Set(), colliders: [], broken: false } : null;
      if (tree) trees.push(tree);
      if (kind === 'bush') bushes.push({ kind, mesh: inst, index: n, x, y, gy: y, z, scale: s, radius: 0.95 * s, h: 1.2 * s, maxHP: GREEN.bush.hp(s), hp: GREEN.bush.hp(s), hitKeys: new Set(), broken: false });
      if (rock) {
        const hash = Math.abs(Math.sin(x * 127.1 + z * 311.7 + W.seed * 0.17) * 43758.5453) % 1;
        rock.isAstraliteStone = hash < 0.115;
        rockEntries.push(rock); stones.push(rock);
      }
      if (collide && (kind !== 'rock' || s > 0.9)) {
        // Keep tree collision on the visible trunk, not the whole canopy. The
        // top lets jumps clear low rocks, double-jumps clear trunks and flight
        // clear structures; collision never extends above visible material.
        const trunkRadius = kind === 'rock' ? collide * s : Math.min(collide * s, 0.22 * s);
        const height = kind === 'rock' ? 0.95 * s : kind === 'pine' ? 3.4 * s : kind === 'willow' ? 3.1 * s : 3.25 * s;
        const collider = { type: 'circle', x, z, r: trunkRadius, top: y + height, stone: rock };
        obstacles.push(collider);
        if (kind === 'rock') rock.colliders.push(collider);
        if (tree) tree.colliders.push(collider);
      }
      n++;
    }
    inst.count = n; inst.castShadow = true; inst.receiveShadow = true;
    inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    if (kind === 'broadleaf' || kind === 'willow') inst.userData.massHi = kind === 'willow' ? 0.7 : 1.1; // canopy and hanging fronds are overhead or push aside: the trunk is the mass
    group.add(inst);
    if (kind === 'rock') {
      // Sparse, inset blue mineral flecks identify Astralite-bearing stones
      // without recoloring the natural rock surface.
      const glintMat = new THREE.MeshStandardMaterial({ color: '#9bdcff', emissive: '#267db3', emissiveIntensity: 0.9, metalness: 0.32, roughness: 0.2 });
      const glintGeo = new THREE.OctahedronGeometry(0.095, 0);
      for (const rock of rockEntries) if (rock.isAstraliteStone) {
        const flecks = new THREE.Group(); flecks.userData.noCollide = true;
        const count = rock.scale > 1.2 ? 4 : 3;
        for (let k = 0; k < count; k++) {
          const gem = new THREE.Mesh(glintGeo, glintMat);
          const angle = (k / count) * Math.PI * 2 + rock.x * 0.4, rad = rock.radius * (0.56 + 0.1 * ((k + 1) % 2));
          gem.position.set(rock.x + Math.cos(angle) * rad, rock.y + rock.h * (0.3 + 0.12 * (k % 2)), rock.z + Math.sin(angle) * rad);
          gem.scale.set(0.72, 0.9, 0.42); gem.rotation.set(0.2 + k * 0.4, angle, 0.3); flecks.add(gem);
        }
        rock.glints = flecks; group.add(flecks);
      }
    }
    return inst;
  }
  const Q = (x, z) => quarterAt(x, z, W);
  const dens = (x, z, f = 0.035, o = 0) => noise.fbm(x * f + o, z * f - o, 3) * 0.5 + 0.5;

  // Forest flank: dense broadleaf with pines mixed in, clumped by noise.
  scatter('broadleaf', Math.round(W.detail.forestTrees * 0.65), 11, (x, z, r) => Q(x, z) === 'forest' && dens(x, z) > 0.42 && clear(x, z) && r() < 0.8);
  scatter('pine', Math.round(W.detail.forestTrees * 0.35), 12, (x, z, r) => Q(x, z) === 'forest' && dens(x, z, 0.03, 7) > 0.47 && clear(x, z));
  // Highland: pines thinning with altitude, plus the rim beyond the bound.
  scatter('pine', W.detail.highlandPines, 13, (x, z, r) => Q(x, z) === 'highland' && clear(x, z, { road: 3 }) && dens(x, z, 0.04, 3) > 0.38 && r() > smooth(18, 30, T.heightAt(x, z)) * 0.8 && Math.hypot(x - 4, z + 91) > 16, { scale: [0.8, 1.5] });
  // Scatter: lone shade trees in the pasture, the core edges, the wetland.
  scatter('broadleaf', W.detail.scatterTrees, 14, (x, z, r) => { const q = Q(x, z); return (q === 'open' ? r() < 0.35 : q === 'core' ? r() < 0.25 && Math.hypot(x, z - 6) > 22 : q === 'wetland' ? r() < 0.4 : false) && clear(x, z, { road: 3.5, pad: 4 }); }, { scale: [0.9, 1.45] });
  scatter('willow', W.detail.wetlandWillows, 15, (x, z) => { const rd = riverD(x, z); const nearPond = W.ponds.some(p => { const d = Math.hypot(x - p.x, z - p.z); return d > p.r * 1.45 && d < p.r * 2.1; }); return (Q(x, z) === 'wetland' || Q(x, z) === 'open') && ((rd > 5.5 && rd < 10) || nearPond) && clear(x, z, { river: 5 }); }, { scale: [0.9, 1.3], collide: 0.55 });
  scatter('bush', 220, 16, (x, z, r) => Q(x, z) !== 'highland' && clear(x, z, { road: 1.5, pad: 1 }) && (dens(x, z, 0.05, 2) > 0.52 || r() < 0.08), { scale: [0.6, 1.3], collide: 0 }).userData.soft = true; // bushes: solid, but a crouched Rizer can slip in to hide
  // Rocks: boulders in the highland, pebbles everywhere, never on a road.
  scatter('rock', W.detail.rocks, 17, (x, z, r) => { const q = Q(x, z); return (q === 'highland' ? true : q === 'core' ? r() < 0.1 : r() < 0.4) && clear(x, z, { road: 1.2, river: 3, pad: 1.5 }); }, { scale: [0.4, 2.4], collide: 0.75, tint: 0.1 });

  // ── Grass: blade tufts that sway and part around Rizer ──
  {
    const r = rng(W.seed + 7), pos = [], col = [], tip = [], nrm = [];
    const hues = { core: ['#8fa566', '#9cab6a'], open: ['#a8ad6c', '#b3b16f', '#98a864'], forest: ['#6f8d4d', '#7b9656'], wetland: ['#7fa05a', '#8aa860'], highland: ['#9fa468', '#a9a36c'] };
    const c = new THREE.Color(), straw = new THREE.Color('#c2ad6a');
    let blades = 0;
    for (let t = 0; t < W.detail.grass * 8 && blades < W.detail.grass; t++) {
      const x = r.range(-E, E), z = r.range(-E, E), q = Q(x, z);
      const want = q === 'open' ? 0.95 : q === 'wetland' ? 0.8 : q === 'forest' ? 0.55 : q === 'core' ? 0.45 : 0.4 * (1 - smooth(16, 28, T.heightAt(x, z)));
      if (r() > want * (0.55 + dens(x, z, 0.08) * 0.8)) continue;
      if (roadD(x, z) < 0.4 || riverD(x, z) < 5.6 || inWater(x, z) || onPad(x, z, -1) || inPlaza(x, z, 0.5)) continue;
      const y = T.heightAt(x, z), tuft = 2 + Math.floor(r() * 3);
      for (let k = 0; k < tuft; k++) {
        const a = r() * Math.PI, ox = x + (r() - 0.5) * 0.5, oz = z + (r() - 0.5) * 0.5, w = r.range(0.07, 0.13), h = r.range(0.35, 0.8) * (q === 'open' || q === 'wetland' ? 1.25 : 1);
        const dx = Math.cos(a) * w, dz = Math.sin(a) * w, lean = (r() - 0.5) * 0.25;
        // A real blade: wide at the root, narrowing through a bent mid-section to a point; dark at the root,
        // sunlit at the tip, and every so often a dry straw-coloured one among the green.
        const mh = h * r.range(0.42, 0.58), mx = ox + lean * 0.3, mz = oz + lean * 0.15, tx = ox + lean * 1.25, tz = oz + lean * 0.6, mw = 0.58;
        const bl = [ox - dx, y - 0.02, oz - dz], br = [ox + dx, y - 0.02, oz + dz], ml = [mx - dx * mw, y + mh, mz - dz * mw], mr = [mx + dx * mw, y + mh, mz + dz * mw], tp = [tx, y + h, tz];
        pos.push(...bl, ...br, ...ml, ...br, ...mr, ...ml, ...ml, ...mr, ...tp);
        tip.push(0, 0, 0.32, 0, 0.32, 0.32, 0.32, 0.32, 1); for (let n = 0; n < 9; n++) nrm.push(0, 1, 0);
        c.set(r.pick(hues[q])); const dryK = r() < 0.16 ? r.range(0.35, 0.8) : r() * 0.12; c.lerp(straw, dryK); c.multiplyScalar(r.range(0.86, 1.1));
        const base = c.clone().multiplyScalar(0.5), mid = c.clone().multiplyScalar(0.82), top = [c.r * 1.12, c.g * 1.1, c.b * 1.0];
        const B = [base.r, base.g, base.b], Mi = [mid.r, mid.g, mid.b];
        col.push(...B, ...B, ...Mi, ...B, ...Mi, ...Mi, ...Mi, ...Mi, ...top);
        blades++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('aTip', new THREE.Float32BufferAttribute(tip, 1));
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1 });
    m.onBeforeCompile = sh => {
      sh.uniforms.uTime = shared.uTime; sh.uniforms.uPlayer = shared.uPlayer;
      sh.vertexShader = 'uniform float uTime; uniform vec3 uPlayer; attribute float aTip;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec3 wp0 = position;
        float sw = sin(uTime * 2.1 + wp0.x * 0.35 + wp0.z * 0.27) * 0.11 + sin(uTime * 3.6 + wp0.x * 0.9) * 0.035;
        vec2 away = wp0.xz - uPlayer.xz; float dd = length(away);
        float push = (1.0 - smoothstep(0.3, 1.7, dd)) * aTip * step(abs(wp0.y - uPlayer.y), 2.0);
        transformed.xz += aTip * vec2(sw, sw * 0.6) + (away / max(dd, 0.001)) * push * 0.42;
        transformed.y -= push * 0.28;`);
    };
    m.customProgramCacheKey = () => 'grass';
    const grass = new THREE.Mesh(g, m); grass.receiveShadow = true; grass.frustumCulled = false; grass.userData.noCollide = true; group.add(grass);
  }

  // ── Wild fruit resting in the grass: gold (stamina) is the most common, then red (health), purple (astral
  // energy), and rare white (all three). Each can be picked up (○ / E): group.userData.fruits lists them;
  // picking one shrinks its instance away (game.js · pickups). Colours come in loose patches, not a uniform mix.
  {
    const r = rng(W.seed + 8), count = W.detail.flowers;
    const fruitGeo = new THREE.IcosahedronGeometry(0.13, 1); fruitGeo.scale(1, 0.88, 1); // round, a touch squat
    const inst = new THREE.InstancedMesh(fruitGeo, new THREE.MeshStandardMaterial({ roughness: 0.45 }), count);
    const d = new THREE.Object3D(), c = new THREE.Color(), cols = { 'fruit-gold': '#e2b64e', 'fruit-red': '#c8455a', 'fruit-violet': '#8a63c4', 'fruit-white': '#efe8dc' };
    const pickKind = (x, z) => { // weighted, in patches: gold 48% · red 30% · purple 16% · white 6%
      const h = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1, u = (h + 0.5 * (noise.noise(x * 0.05 + 31, z * 0.05 - 7) + 1)) % 1; // (random + patch) wrapped: still an even spread, so the weights hold
      return u < 0.48 ? 'fruit-gold' : u < 0.78 ? 'fruit-red' : u < 0.94 ? 'fruit-violet' : 'fruit-white';
    };
    const list = [];
    let n = 0;
    for (let t = 0; t < count * 30 && n < count; t++) {
      const x = r.range(-E, E), z = r.range(-E, E), q = Q(x, z);
      if (q === 'highland' && r() < 0.7) continue;
      if (dens(x, z, 0.06, 5) < 0.55 || roadD(x, z, 0, true) < 0.6 || riverD(x, z) < 3.5 || inWater(x, z) || onPad(x, z, 0, true) || inPlaza(x, z)) continue;
      // placed by the original rules so the numbering never shifts; any that a later addition (a `late` pad or road) now covers stays hidden
      const covered = roadD(x, z) < 0.6 || onPad(x, z, 0);
      r.range(0.3, 0.55); const s = r.range(0.7, 1.3); // (the first draw is kept so every fruit stays where it was)
      const fr = 0.13 * s, h0 = T.heightAt(x, z), gy = Math.min(h0 + fr * 0.5, Math.max(h0, T.heightAt(x + fr, z), T.heightAt(x - fr, z), T.heightAt(x, z + fr), T.heightAt(x, z - fr))); // on a slope it rests against the high side (on a steep one it sits into it)
      d.position.set(x, gy + fr * 0.88 * 0.92, z); d.scale.setScalar(s); d.rotation.set(0, (x * 7.13 + z * 3.71) % 6.28, 0); if (covered) d.scale.setScalar(0); d.updateMatrix(); inst.setMatrixAt(n, d.matrix); // resting on the ground
      const kind = pickKind(x, z); c.set(cols[kind]); inst.setColorAt(n, c);
      list.push({ i: n, x, y: d.position.y, z, item: kind, color: cols[kind], ...(covered ? { gone: true } : {}) }); n++;
    }
    inst.count = n; inst.userData.noCollide = true; group.add(inst); // fruit: walk-through
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.userData.fruits = { inst, list, pick(f) { const m = new THREE.Matrix4().makeScale(0, 0, 0); inst.setMatrixAt(f.i, m); inst.instanceMatrix.needsUpdate = true; f.gone = true; } };
  }

  // Five individually shaped tiny fae travel together as one catchable cluster.
  // Merging them into one instance keeps the wild population inexpensive to draw.
  // Palettes: golden Fae (stamina) · pink Faery (health) · blue Astral Fae (astral energy).
  const FAE_PALETTES = {
    gold: { hair: '#dbaa58', dress: '#f7db8a', wing: '#93caff' },
    pink: { hair: '#d27cb8', dress: '#f5b4e4', wing: '#b58fff' },
    blue: { hair: '#2f63c9', dress: '#8fc4ff', wing: '#6fb4ff' }
  };
  function faeClusterGeometry(tone = 'gold') {
    const P = FAE_PALETTES[tone] || FAE_PALETTES.gold;
    const parts = [], put = (geometry, color, pos, rot = [0, 0, 0]) => {
      const g = geometry.toNonIndexed ? (geometry.index ? geometry.toNonIndexed() : geometry) : geometry;
      g.rotateX(rot[0]); g.rotateY(rot[1]); g.rotateZ(rot[2]); g.translate(...pos);
      const c = new THREE.Color(color), a = new Float32Array(g.attributes.position.count * 3);
      for (let i = 0; i < a.length; i += 3) { a[i] = c.r; a[i + 1] = c.g; a[i + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(a, 3)); parts.push(g);
    };
    const spots = [[0,0.12,0],[-0.27,0.03,0.05],[0.27,0.04,-0.04],[-0.12,-0.18,-0.1],[0.15,-0.17,0.1]];
    for (const [i, [x,y,z]] of spots.entries()) {
      const s = i === 0 ? 1.12 : 0.88;
      put(new THREE.SphereGeometry(0.058*s,7,5), '#f7d9ad', [x,y+0.055,z+0.025]);
      put(new THREE.SphereGeometry(0.061*s,7,5), P.hair, [x,y+0.086,z-0.016]);
      put(new THREE.ConeGeometry(0.065*s,0.19*s,5), P.dress, [x,y-0.075,z]);
      for (const side of [-1,1]) {
        put(new THREE.PlaneGeometry(0.19*s,0.14*s), P.wing, [x+side*0.115*s,y+0.005,z-0.03], [0,side*0.32,side*0.35]);
        put(new THREE.PlaneGeometry(0.12*s,0.1*s), '#d7eaff', [x+side*0.09*s,y-0.075,z-0.035], [0,side*0.3,-side*0.3]);
      }
    }
    return mergeGeometries(parts, false);
  }
  // Fae, Faery and Astral Fae hover and wander at Rizer's catch height (FAE_HAND_HEIGHT: where his hands
  // are at the top of the catch leap); Zypheres remain on the ground. While a catch is being attempted
  // (game.js sets catchUntil / catchY) a fae holds still at his hand height.
  function scatterPickup(kind, count, seed, geo, mat, place) {
    const r = rng(seed);
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const d = new THREE.Object3D();
    const list = []; let n = 0;
    for (let t = 0; t < count * 50 && n < count; t++) {
      const x = r.range(-E, E), z = r.range(-E, E), q = Q(x, z);
      if (!place(x, z, q, r)) continue;
      if (roadD(x, z, 0, true) < 1 || riverD(x, z) < 3 || inWater(x, z) || onPad(x, z, 1, true) || inPlaza(x, z, 2)) continue;
      const flying = kind === 'fae' || kind === 'faery' || kind === 'fae_astral';
      const y = T.heightAt(x, z) + (flying ? FAE_HAND_HEIGHT : 0.32);
      d.position.set(x, y, z); d.rotation.set(0, r() * Math.PI * 2, 0); d.scale.setScalar(r.range(0.85, 1.2)); d.updateMatrix();
      inst.setMatrixAt(n, d.matrix);
      list.push({ i: n, x, y, z, homeX: x, homeZ: z, homeY: y, phase: r() * Math.PI * 2, size: d.scale.x, yaw: d.rotation.y, kind, gone: false }); n++;
    }
    inst.count = n; inst.userData.noCollide = true; inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage); group.add(inst);
    if (kind === 'zyphere') {
      for (const f of list) {
        f.sprite = makeZysphereSprite(0.78 * f.size);
        f.sprite.position.set(f.x, f.y + 0.02, f.z);
        group.add(f.sprite);
      }
      zysphereTexture().then(() => { inst.visible = false; });
    }
    const api = { inst, list, pick(f) { const m = new THREE.Matrix4().makeScale(0, 0, 0); inst.setMatrixAt(f.i, m); inst.instanceMatrix.needsUpdate = true; f.gone = true; if (f.sprite) { f.sprite.visible = false; f.sprite.userData.disposed = true; } f._collectedAt = performance.now(); f.catchUntil = 0; },
      animate(t) { if (kind === 'zyphere') { for (const f of list) { if (f.gone || !f.sprite) continue; f.sprite.position.y = f.homeY + 0.02 + Math.sin(t * 1.8 + f.phase) * 0.045; f.sprite.material.opacity = 0.91 + Math.sin(t * 2.8 + f.phase) * 0.09; } return; }
        if (kind !== 'fae' && kind !== 'faery' && kind !== 'fae_astral') return; const now = performance.now(); for (const f of list) { if (f.gone) continue;
        if (f.catchUntil > now) { if (f.catchY != null) f.y += (f.catchY - f.y) * 0.25; } // held for a catch: settle at his hand height
        else {
          const tx = f.homeX + Math.sin(t*0.74 + f.phase) * 2.0, tz = f.homeZ + Math.cos(t*0.61 + f.phase*1.3) * 2.0, ty = f.homeY + Math.sin(t*2.1 + f.phase) * 0.21;
          if (f.catchY != null) { f.x += (tx - f.x) * 0.08; f.z += (tz - f.z) * 0.08; f.y += (ty - f.y) * 0.08; if (Math.hypot(tx - f.x, tz - f.z, ty - f.y) < 0.02) f.catchY = null; } // released after a miss: drift back into its path
          else { f.x = tx; f.z = tz; f.y = ty; }
        }
        d.position.set(f.x,f.y,f.z); d.rotation.set(0, f.yaw + t*0.42, Math.sin(t*2.1+f.phase)*0.07); d.scale.setScalar(f.size); d.updateMatrix(); inst.setMatrixAt(f.i,d.matrix);
      } inst.instanceMatrix.needsUpdate = true; }
    };
    group.userData[kind] = api; return api;
  }
  {
    const faeGeo = faeClusterGeometry('gold');
    const faeMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, emissive: '#6c8ec8', emissiveIntensity: 0.42, roughness: 0.34 });
    scatterPickup('fae', W.detail.fae, 21, faeGeo, faeMat, (x, z, q) => dens(x, z, 0.05, 4) > 0.3);
    const faeryGeo = faeClusterGeometry('pink');
    const faeryMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, emissive: '#9262b1', emissiveIntensity: 0.52, roughness: 0.3 });
    scatterPickup('faery', W.detail.faery, 22, faeryGeo, faeryMat, (x, z, q) => dens(x, z, 0.04, 9) > 0.6);
    const astralGeo = faeClusterGeometry('blue');
    const astralMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, emissive: '#3f7fe0', emissiveIntensity: 0.6, roughness: 0.3 });
    scatterPickup('fae_astral', W.detail.faeAstral ?? W.detail.faery, 24, astralGeo, astralMat, (x, z, q) => dens(x, z, 0.04, 11) > 0.55);
    const zyGeo = new THREE.SphereGeometry(0.18, 12, 10);
    const zyMat = new THREE.MeshStandardMaterial({ color: ENTITIES.zyphere.color, metalness: 0.8, roughness: 0.3, emissive: new THREE.Color('#3a2a6e'), emissiveIntensity: 0.5 });
    scatterPickup('zyphere', W.detail.zyphere, 23, zyGeo, zyMat, (x, z, q) => dens(x, z, 0.045, 14) > 0.55);
  }

  // ── Reeds: wetland shallows and river banks ──
  {
    const r = rng(W.seed + 9), count = W.detail.reeds;
    const geo = new THREE.ConeGeometry(0.05, 1, 3); geo.translate(0, 0.5, 0);
    const mat = addWind(new THREE.MeshStandardMaterial({ color: '#7d8f4f', roughness: 0.9 }), shared.uTime, { from: 0.0, amp: 0.06, key: 'reed' });
    const inst = new THREE.InstancedMesh(geo, mat, count), d = new THREE.Object3D(), c = new THREE.Color(); let n = 0;
    for (let t = 0; t < count * 40 && n < count; t++) {
      const x = r.range(-E, E), z = r.range(-E, E), rd = riverD(x, z);
      const pd = Math.min(...W.ponds.map(p => Math.hypot(x - p.x, z - p.z) / p.r));
      if (!((rd > 2.6 && rd < 5.5) || (pd > 0.85 && pd < 1.5))) continue;
      if (Q(x, z) === 'highland' && r() < 0.6) continue;
      if (roadD(x, z) < 0.5 || onPad(x, z, 0)) continue;
      d.position.set(x, T.heightAt(x, z) - 0.1, z); d.scale.set(1, r.range(1.2, 2.6), 1); d.rotation.set((r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3); d.updateMatrix(); inst.setMatrixAt(n, d.matrix);
      c.set(r() > 0.8 ? '#a69a5c' : '#7b8e4c'); inst.setColorAt(n, c); n++;
    }
    inst.count = n; inst.userData.noCollide = true; group.add(inst); // reeds: walk-through
  }

  // ── Pasture: fenced paddocks with a gate toward the nearest road, hay bales ──
  {
    const posts = [], rails = [], r = rng(W.seed + 10);
    for (const pd of W.paddocks) {
      const cos = Math.cos(pd.rot), sin = Math.sin(pd.rot), toW = (lx, lz) => [pd.x + lx * cos + lz * sin, pd.z - lx * sin + lz * cos];
      const road = T.roads.nearest(pd.x, pd.z, 60);
      const gateDir = road ? Math.atan2(road.x - pd.x, road.z - pd.z) : 0;
      const corners = [[-pd.w / 2, -pd.d / 2], [pd.w / 2, -pd.d / 2], [pd.w / 2, pd.d / 2], [-pd.w / 2, pd.d / 2]];
      for (let s = 0; s < 4; s++) {
        const [ax, az] = corners[s], [bx, bz] = corners[(s + 1) % 4], len = Math.hypot(bx - ax, bz - az), steps = Math.ceil(len / 2.4);
        const mid = toW((ax + bx) / 2, (az + bz) / 2), sideDir = Math.atan2(mid[0] - pd.x, mid[1] - pd.z);
        const isGate = Math.abs(((sideDir - gateDir + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < Math.PI / 4;
        for (let i = 0; i < steps; i++) {
          const t0 = i / steps, t1 = (i + 1) / steps;
          if (isGate && Math.abs((t0 + t1) / 2 - 0.5) < 0.12) continue; // the gate gap
          const [x0, z0] = toW(ax + (bx - ax) * t0, az + (bz - az) * t0), [x1, z1] = toW(ax + (bx - ax) * t1, az + (bz - az) * t1);
          posts.push([x0, z0]); if (i === steps - 1) posts.push([x1, z1]);
          rails.push([x0, z0, x1, z1]);
          const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
          obstacles.push({ type: 'box', x: mx, z: mz, hw: Math.hypot(x1 - x0, z1 - z0) / 2 + 0.1, hd: 0.14, rot: Math.atan2(-(z1 - z0), x1 - x0), top: T.heightAt(mx, mz) + 1.35 });
        }
      }
    }
    const wood = new THREE.MeshStandardMaterial({ color: '#7a5f41', roughness: 0.95 });
    const pi = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 1.5, 0.2), wood, posts.length), d = new THREE.Object3D();
    posts.forEach(([x, z], i) => { d.position.set(x, T.heightAt(x, z) + 0.55, z); d.rotation.set(0, 0, 0); d.scale.setScalar(1); d.updateMatrix(); pi.setMatrixAt(i, d.matrix); });
    const ri = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.1, 0.07), wood, rails.length * 2);
    rails.forEach(([x0, z0, x1, z1], i) => for2(i));
    function for2(i) {
      const [x0, z0, x1, z1] = rails[i], len = Math.hypot(x1 - x0, z1 - z0), y0 = T.heightAt(x0, z0), y1 = T.heightAt(x1, z1);
      for (let k = 0; k < 2; k++) {
        d.position.set((x0 + x1) / 2, (y0 + y1) / 2 + 0.55 + k * 0.5, (z0 + z1) / 2);
        d.rotation.set(0, Math.atan2(-(z1 - z0), x1 - x0), Math.atan2(y1 - y0, len)); d.scale.set(len, 1, 1); d.updateMatrix(); ri.setMatrixAt(i * 2 + k, d.matrix);
      }
    }
    pi.castShadow = ri.castShadow = true; group.add(pi, ri);
    // hay bales inside paddocks
    const hay = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.75, 0.75, 1.3, 12), new THREE.MeshStandardMaterial({ color: '#cfb26a', roughness: 1 }), W.detail.hay);
    let n = 0;
    for (let t = 0; t < 400 && n < W.detail.hay; t++) {
      const pd = W.paddocks[n % W.paddocks.length], lx = r.range(-pd.w / 2 + 2, pd.w / 2 - 2), lz = r.range(-pd.d / 2 + 2, pd.d / 2 - 2);
      const x = pd.x + lx * Math.cos(pd.rot) + lz * Math.sin(pd.rot), z = pd.z - lx * Math.sin(pd.rot) + lz * Math.cos(pd.rot);
      if (obstacles.some(o => o.hay && Math.hypot(o.x - x, o.z - z) < 2)) continue;
      d.position.set(x, T.heightAt(x, z) + 0.72, z); d.rotation.set(Math.PI / 2, r() * Math.PI, 0); d.scale.setScalar(1); d.updateMatrix(); hay.setMatrixAt(n, d.matrix);
      obstacles.push({ type: 'circle', x, z, r: 0.95, top: T.heightAt(x, z) + 1.45, hay: true }); n++;
    }
    hay.count = n; hay.castShadow = hay.receiveShadow = true; group.add(hay);
  }
  return group;
}
