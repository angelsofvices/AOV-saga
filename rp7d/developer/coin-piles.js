// Coin piles: the physical reward a standard wooden chest throws out when it is opened.
// A chest rolls 1–3 piles; each pile independently rolls its class (weights below), then its exact value inside
// that class's range. A pile is ONE pickup entity (one merged mesh of stacked coins, per the RP7D gold-coin pile
// reference) carrying its rolled value — never one object per coin. It hops out of the chest, falls, bounces
// once or twice and settles; when Rizer comes near it slides to him and its value goes into his Gold.
// Everything tunable is in COIN_PILES.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const COIN_PILES = {
  count: [1, 3],                       // piles per chest (inclusive)
  classes: {                           // weight: share of the roll · value: coins inside (inclusive)
    small:  { name: 'Small pile',  weight: 60, value: [0, 20] },
    medium: { name: 'Medium pile', weight: 30, value: [25, 45] },
    large:  { name: 'Large pile',  weight: 10, value: [50, 75] }
  },
  launch: { out: [2.0, 3.1], up: [3.6, 4.8], spread: 0.75, jitter: 0.22 }, // speed outward / upward · angle between piles · random extra
  gravity: 15, bounce: 0.38, friction: 0.55, settleSpeed: 1.1,
  pickup: { attract: 2.6, collect: 0.65, speed: 3.2, accel: 22, after: 0.45 }, // attraction radius · collect radius · pull · a settled pile waits until it is this old (s) before it can be pulled
  visible: 80
};
const randInt = ([a, b], rnd = Math.random) => a + Math.floor(rnd() * (b - a + 1));
// One pile's roll: class by weight, then the exact value inside that class's range.
export function rollPile(rnd = Math.random) {
  const C = COIN_PILES.classes, total = Object.values(C).reduce((s, c) => s + c.weight, 0);
  let r = rnd() * total, cls = Object.keys(C)[0];
  for (const [key, c] of Object.entries(C)) { if ((r -= c.weight) < 0) { cls = key; break; } }
  return { cls, value: randInt(C[cls].value, rnd) };
}
// A chest's whole reward: 1–3 independent piles. Rolled once, when the chest is opened.
export function rollChestPiles(rnd = Math.random) { return Array.from({ length: randInt(COIN_PILES.count, rnd) }, () => rollPile(rnd)); }

// ── the pile meshes (one merged geometry per class, shared by every pile of that class) ──
const R = 0.105, TH = 0.036; // one coin
const tint = (g, hex) => { const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
function coinGeo() { // a 12-sided coin: rim, a raised inner face on both sides, a four-point star on each
  const parts = [tint(new THREE.CylinderGeometry(R, R, TH, 12), '#f0a81c')];
  parts.push(tint(new THREE.CylinderGeometry(R * 0.74, R * 0.74, TH * 1.22, 12), '#d98c12'));
  for (const s of [1, -1]) parts.push(tint(new THREE.OctahedronGeometry(1, 0).scale(R * 0.46, TH * 0.5, R * 0.46).translate(0, s * TH * 0.62, 0), '#ffd648'));
  return mergeGeometries(parts.map(g => g.index ? g.toNonIndexed() : g));
}
function pileGeo(cls) {
  const coin = coinGeo(), out = [], m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let seed = cls.length * 7919; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const put = (x, y, z, rx = 0, ry = 0, rz = 0) => { m.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), new THREE.Vector3(1, 1, 1)); out.push(coin.clone().applyMatrix4(m)); };
  const stack = (x, z, n) => { for (let i = 0; i < n; i++) put(x + (r() - 0.5) * 0.02, TH * 0.6 + i * TH * 1.12, z + (r() - 0.5) * 0.02, 0, r() * 6.28, 0); };
  const flat = (x, z) => put(x, TH * 0.6, z, (r() - 0.5) * 0.2, r() * 6.28, (r() - 0.5) * 0.2);
  const lean = (x, z, to) => put(x, R * 0.86, z, 1.15, Math.atan2(-x + to[0], -z + to[1]), 0); // propped against a stack, face out
  const L = { // stacks [x, z, coins] · flat coins [x, z] · leaning coins [x, z]
    small: { stacks: [[0, 0, 3]], flats: [[0.19, 0.05], [-0.15, 0.13], [0.03, -0.2]], leans: [[0.02, 0.16]] },
    medium: { stacks: [[0, -0.04, 6], [0.2, 0.05, 4], [-0.2, 0.03, 3]], flats: [[0.34, -0.1], [-0.36, -0.08], [0.1, -0.26], [-0.12, 0.3], [0.38, 0.2]], leans: [[0.02, 0.2], [-0.24, 0.24]] },
    large: { stacks: [[0, -0.05, 8], [0.21, 0.05, 6], [-0.21, 0.02, 5], [0.08, -0.26, 4], [-0.14, -0.25, 3]], flats: [[0.42, -0.08], [-0.44, -0.1], [0.36, 0.26], [-0.34, 0.3], [0.5, 0.12], [-0.02, 0.44], [0.28, -0.4], [-0.36, -0.36]], leans: [[0.04, 0.22], [-0.26, 0.25], [0.32, 0.22]] }
  }[cls];
  for (const [x, z, n] of L.stacks) stack(x, z, n);
  for (const [x, z] of L.flats) flat(x, z);
  for (const [x, z] of L.leans) lean(x, z, [0, 0]);
  const g = mergeGeometries(out); g.computeVertexNormals(); return g;
}
let SHARED = null;
function shared() {
  if (SHARED) return SHARED;
  const geo = Object.fromEntries(Object.keys(COIN_PILES.classes).map(k => [k, pileGeo(k)]));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.45, roughness: 0.34, emissive: '#6a3c00', emissiveIntensity: 0.55, flatShading: true });
  const c = document.createElement('canvas'); c.width = c.height = 64; const g2 = c.getContext('2d'), rg = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,236,170,.9)'); rg.addColorStop(0.4, 'rgba(255,196,60,.35)'); rg.addColorStop(1, 'rgba(255,170,0,0)'); g2.fillStyle = rg; g2.fillRect(0, 0, 64, 64);
  const glow = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.3 });
  return (SHARED = { geo, mat, glow });
}

// opts: { saved: [{ id, cls, value, x, y, z }] to restore · onChange(list) to persist · onCollect(pile) when Rizer takes one }
export function createCoinPiles(scene, world, fx, opts = {}) {
  const P = COIN_PILES, piles = [];
  let seq = 0, hidden = false;
  const probe = new THREE.Vector3();
  const ground = (x, z, y) => Math.max(world.groundAt(x, z, y + 1), world.waterAt(x, z));
  const persist = () => opts.onChange?.(piles.filter(p => !p.taken).map(p => ({ id: p.id, cls: p.cls, value: p.value, x: +p.pos.x.toFixed(2), y: +p.pos.y.toFixed(2), z: +p.pos.z.toFixed(2) })));
  function make(cls, value, id) {
    const S = shared(), root = new THREE.Group(), mesh = new THREE.Mesh(S.geo[cls], S.mat); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh);
    const glow = new THREE.Sprite(S.glow); glow.scale.setScalar(cls === 'large' ? 1.5 : cls === 'medium' ? 1.15 : 0.75); glow.position.y = 0.16; root.add(glow);
    root.rotation.y = Math.random() * Math.PI * 2; root.visible = !hidden; scene.add(root);
    return { id: id || `pile-${Date.now().toString(36)}-${++seq}`, cls, value, root, pos: root.position, vel: new THREE.Vector3(), state: 'air', age: 0, bounces: 0, spin: (Math.random() - 0.5) * 6, taken: false };
  }
  // Throw a chest's rolled piles out of its reward point, each on its own outward line (fanned round `face`).
  function spawn(origin, face, rolls) {
    const n = rolls.length, made = [];
    rolls.forEach((r, i) => {
      const p = make(r.cls, r.value);
      const a = face + (i - (n - 1) / 2) * P.launch.spread + (Math.random() - 0.5) * 2 * P.launch.jitter, out = P.launch.out[0] + Math.random() * (P.launch.out[1] - P.launch.out[0]);
      p.pos.set(origin.x + Math.sin(a) * 0.15, origin.y, origin.z + Math.cos(a) * 0.15);
      p.vel.set(Math.sin(a) * out, P.launch.up[0] + Math.random() * (P.launch.up[1] - P.launch.up[0]), Math.cos(a) * out);
      piles.push(p); made.push(p);
    });
    persist();
    return made;
  }
  for (const s of Array.isArray(opts.saved) ? opts.saved : []) { // piles left on the ground last session
    if (!P.classes[s?.cls] || !Number.isFinite(s.value) || !Number.isFinite(s.x) || !Number.isFinite(s.z)) continue;
    const p = make(s.cls, Math.max(0, Math.round(s.value)), typeof s.id === 'string' ? s.id : null); p.pos.set(s.x, ground(s.x, s.z, Number.isFinite(s.y) ? s.y : 500), s.z); p.state = 'rest'; p.age = 9; piles.push(p);
  }
  function collect(p) {
    if (p.taken) return false; // a pile pays out once
    p.taken = true; scene.remove(p.root); piles.splice(piles.indexOf(p), 1);
    persist(); opts.onCollect?.(p);
    return true;
  }
  function update(dt, t, rizer) {
    const rp = rizer.position;
    for (let i = piles.length - 1; i >= 0; i--) {
      const p = piles[i], d = Math.hypot(p.pos.x - rp.x, p.pos.z - rp.z), dy = p.pos.y - rp.y;
      p.age += dt;
      if (p.state === 'air') { // launch, gravity, a short bounce, settle
        p.vel.y -= P.gravity * dt; const ox = p.pos.x, oz = p.pos.z;
        p.pos.addScaledVector(p.vel, dt); p.root.rotation.y += p.spin * dt;
        if (p.age > 0.25) { probe.copy(p.pos); if (world.resolve(probe, 0.3)) { p.pos.x = probe.x; p.pos.z = probe.z; p.vel.x *= 0.3; p.vel.z *= 0.3; } } // not through walls (the first moments clear the chest itself)
        world.keepOnLand?.(p.pos, ox, oz);
        const g = ground(p.pos.x, p.pos.z, p.pos.y);
        if (p.pos.y <= g && p.vel.y < 0) {
          p.pos.y = g; p.bounces++;
          if (Math.abs(p.vel.y) < P.settleSpeed || p.bounces > 3) { p.vel.set(0, 0, 0); p.state = 'rest'; persist(); }
          else { p.vel.y = -p.vel.y * P.bounce; p.vel.x *= P.friction; p.vel.z *= P.friction; p.spin *= 0.5; fx?.emit(p.pos.x, g + 0.05, p.pos.z, 4, { color: '#ffd24a', speed: 1.2, up: 0.8, size: 0.14, life: 0.3 }); }
        }
      } else if (p.state === 'pull') { // sliding to Rizer
        const tx = rp.x - p.pos.x, ty = rp.y + 0.9 - p.pos.y, tz = rp.z - p.pos.z, L = Math.hypot(tx, ty, tz) || 1;
        p.pull = Math.min(18, (p.pull || P.pickup.speed) + P.pickup.accel * dt);
        p.pos.x += tx / L * Math.min(L, p.pull * dt); p.pos.y += ty / L * Math.min(L, p.pull * dt); p.pos.z += tz / L * Math.min(L, p.pull * dt);
        p.root.scale.setScalar(Math.max(0.35, Math.min(1, L / 1.6))); p.root.rotation.y += 9 * dt;
        if (L < P.pickup.collect) { collect(p); continue; }
      }
      if (p.state === 'rest' && p.age > P.pickup.after && rizer.hp > 0 && d < P.pickup.attract && Math.abs(dy) < 2.5) p.state = 'pull';
      p.root.visible = !hidden && d < P.visible;
    }
  }
  function setVisible(v) { hidden = !v; for (const p of piles) p.root.visible = v; }
  return { piles, spawn, update, collect, setVisible };
}
