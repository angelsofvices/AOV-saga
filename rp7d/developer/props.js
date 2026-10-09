// Structure recipes. Each recipe builds a Group in local space (front = +Z),
// returns colliders + a door anchor, then gets baked (meshes merged per
// material) so a whole building costs a handful of draw calls.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng } from './util.js';
import { championStadium } from './stadium.js';

const cache = new Map();
export function M(color, rough = 0.85, extra = {}) {
  const key = color + rough + JSON.stringify(extra);
  if (!cache.has(key)) cache.set(key, new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra }));
  return cache.get(key);
}

// Night-reactive materials, shared so one uniform tick lights the whole town.
export const glow = {
  window: new THREE.MeshStandardMaterial({ color: '#2d2b27', roughness: 0.35, emissive: new THREE.Color('#ffbf6b'), emissiveIntensity: 0.05 }),
  windowDark: new THREE.MeshStandardMaterial({ color: '#2a2c2c', roughness: 0.3 }),
  lamp: new THREE.MeshStandardMaterial({ color: '#f5dca6', roughness: 0.4, emissive: new THREE.Color('#ffc978'), emissiveIntensity: 0.3 }),
  ruby: new THREE.MeshStandardMaterial({ color: '#b3122a', roughness: 0.2, metalness: 0.1, emissive: new THREE.Color('#ff1f3d'), emissiveIntensity: 0.9 }),
  seer: new THREE.MeshStandardMaterial({ color: '#3a1f63', roughness: 0.3, emissive: new THREE.Color('#9b5cff'), emissiveIntensity: 1.2 }),
  beacon: new THREE.MeshStandardMaterial({ color: '#661111', emissive: new THREE.Color('#ff3b3b'), emissiveIntensity: 2 }),
  ember: new THREE.MeshStandardMaterial({ color: '#2a0e0c', roughness: 0.6, emissive: new THREE.Color('#ff3a24'), emissiveIntensity: 0.1 }), // the stadium's fire-lit arches
  lab: new THREE.MeshStandardMaterial({ color: '#7fa7b3', roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.75, emissive: new THREE.Color('#9fe3ff'), emissiveIntensity: 0.05 })
};
export function setNight(n, t) {
  glow.window.emissiveIntensity = 0.04 + n * 1.25;
  glow.lamp.emissiveIntensity = 0.15 + n * 2.2;
  glow.ruby.emissiveIntensity = 0.7 + n * 1.6 + Math.sin(t * 1.3) * 0.25;
  glow.seer.emissiveIntensity = 0.8 + n * 1.8 + Math.sin(t * 2.1) * 0.2;
  glow.beacon.emissiveIntensity = (Math.sin(t * 3) > 0.6 ? 3.5 : 0.2);
  glow.lab.emissiveIntensity = 0.05 + n * 1.2;
  glow.ember.emissiveIntensity = 0.12 + n * 1.5 + Math.sin(t * 2.7) * 0.08 * n;
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);
function mesh(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); parent.add(m); return m;
}
const box = (p, w, h, d, mat, x, y, z, ry = 0) => mesh(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z, 0, ry);
const cyl = (p, rt, rb, h, mat, x, y, z, seg = 10) => mesh(p, new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);

// Gable roof: triangular prism, ridge running along local X.
function gable(p, w, d, h, mat, y, overhang = 0.6) {
  const s = new THREE.Shape(); const hd = d / 2 + overhang;
  s.moveTo(-hd, 0); s.lineTo(hd, 0); s.lineTo(0, h); s.lineTo(-hd, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: w + overhang * 2, bevelEnabled: false });
  g.translate(0, 0, -(w / 2 + overhang)); g.rotateY(Math.PI / 2);
  return mesh(p, g, mat, 0, y, 0);
}
function pyramid(p, r, h, mat, x, y, z) { const m = mesh(p, new THREE.ConeGeometry(r, h, 4), mat, x, y + h / 2, z); m.rotation.y = Math.PI / 4; return m; }
function windowsRow(p, count, w, y, z, mat, ww = 1.1, wh = 1.3, skip = []) {
  for (let i = 0; i < count; i++) {
    if (skip.includes(i)) continue;
    const x = -w / 2 + (i + 0.5) * (w / count);
    box(p, ww, wh, 0.12, mat, x, y, z);
    box(p, ww + 0.3, 0.14, 0.3, M('#5a4632'), x, y - wh / 2 - 0.06, z + 0.06);
  }
}
function door(p, w, h, z, mat = M('#4a3524')) { box(p, w, h, 0.16, mat, 0, 0.6 + h / 2, z); box(p, w + 0.5, 0.3, 0.3, M('#5a4632'), 0, 0.6 + h + 0.12, z); }
function banner(p, x, y, z, color, trim = '#d9b45c') {
  box(p, 1.1, 2.6, 0.06, M(color, 0.9), x, y, z);
  box(p, 1.1, 0.12, 0.08, M(trim, 0.4, { metalness: 0.4 }), x, y - 1.3, z);
  box(p, 1.4, 0.1, 0.1, M('#3d2f22'), x, y + 1.35, z);
}

const WALLS = ['#e6dcc4', '#d8c7a4', '#cdb58f', '#e3d2b2', '#c4ab88'];
const ROOFS = ['#8a4b3a', '#56636b', '#7a5a3a', '#6b7a4a', '#96553d'];
const gableSurface = (w, d, h, y, overhang = 0.6) => ({ shape: 'gable', x: 0, z: 0, hw: w / 2 + overhang, hd: d / 2 + overhang, h, y, localY: true });
const flatSurface = (x, z, hw, hd, y) => ({ shape: 'flat', x, z, hw, hd, y, localY: true });

export const RECIPES = {
  house(p, s, ctx) {
    const r = rng(Math.floor(s.x * 131 + s.z * 17) >>> 0), playerHome = s.id === 'player-home';
    const style = typeof s.variant === 'string' ? s.variant : playerHome ? 'red' : 'red';
    const w = 10, d = 10, storyH = playerHome ? 4.0 : 3.5, wh = storyH * 2;
    const wall = M(playerHome ? '#e8dcc0' : style === 'villager' ? '#d4c7aa' : r.pick(WALLS));
    const roof = M(style === 'villager' ? '#536c3e' : '#8b3d34'), wood = M('#5a4632');
    box(p, w + 0.7, 1.4, d + 0.7, M('#8a8474'), 0, 0, 0);
    box(p, w, wh, d, wall, 0, 0.7 + wh / 2, 0);
    for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) box(p, 0.35, wh, 0.35, wood, x, 0.7 + wh / 2, z);
    // A clear belt course marks the real second storey on every house.
    box(p, w + 0.18, 0.24, d + 0.18, wood, 0, 0.7 + storyH, 0);
    box(p, w + 0.1, 0.3, d + 0.1, wood, 0, 0.7 + wh, 0);
    const roofH = 3.4, roofY = 0.7 + wh + 0.1;
    gable(p, w, d, roofH, roof, roofY);
    const win = s.lit ? glow.window : glow.windowDark;
    if (playerHome) { // Rizer's front door swings: a live leaf on a hinge at its left edge (seen from the lane)
      box(p, 2.1, 0.3, 0.3, M('#5a4632'), 0, 0.6 + 2.9 + 0.12, d / 2 + 0.05); // lintel
      box(p, 1.72, 2.9, 0.06, M('#1c1510'), 0, 0.6 + 1.45, d / 2 - 0.02);   // the dark doorway behind the leaf
      const hinge = new THREE.Group(); hinge.name = 'homeDoor'; hinge.userData.keep = true; hinge.position.set(-0.8, 0.6, d / 2 + 0.05); p.add(hinge);
      const leaf = box(hinge, 1.6, 2.9, 0.16, M('#4a3524'), 0.8, 1.45, 0);
      box(hinge, 0.08, 0.08, 0.3, M('#c9a34d', 0.4, { metalness: 0.5 }), 1.45, 1.1, 0); // handle, both faces
      hinge.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); leaf.userData.door = true;
    } else door(p, 1.6, 2.9, d / 2 + 0.05);
    for (const storey of [0, 1]) {
      const wy = 0.7 + storyH * (storey + 0.56);
      windowsRow(p, 4, w, wy, d / 2 + 0.06, win, 1.05, 1.2, playerHome && storey === 0 ? [1, 2] : []);
      for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.x = sx * (w / 2 + 0.05); g.rotation.y = sx * Math.PI / 2; p.add(g); windowsRow(g, 2, d, wy, 0.06, win); }
    }
    box(p, 0.9, 2.4, 0.9, M('#7c7466'), w * 0.28, 0.7 + wh + 2.0, -d * 0.18);
    if (playerHome) { // porch + planter: the player's house reads as "home" from the lane
      box(p, 3.6, 0.25, 2.2, wood, 0, 0.82, d / 2 + 1.1);
      for (const x of [-1.6, 1.6]) box(p, 0.22, 2.9, 0.22, wood, x, 2.2, d / 2 + 2.05);
      const pr = new THREE.Group(); pr.position.set(0, 3.75, d / 2 + 1.1); pr.rotation.x = 0.28; p.add(pr); box(pr, 4.2, 0.18, 2.6, roof, 0, 0, 0);
      box(p, 2.6, 0.5, 0.6, M('#6b5038'), -3.2, 0.95, d / 2 + 0.5); mesh(p, new THREE.IcosahedronGeometry(0.5, 0), M('#c0485a'), -3.6, 1.4, d / 2 + 0.5); mesh(p, new THREE.IcosahedronGeometry(0.45, 0), M('#e2b64e'), -2.8, 1.4, d / 2 + 0.5);
    }
    const eaves = roofY;
    return { colliderTop: eaves, colliders: [
      { type: 'box', x: 0, z: 0, hw: w / 2 + 0.4, hd: d / 2 + 0.4, top: eaves },
      { type: 'box', x: w * 0.28, z: -d * 0.18, hw: 0.5, hd: 0.5, top: 0.7 + wh + 3.2 }
    ], surfaces: [gableSurface(w, d, roofH, roofY), flatSurface(w * 0.28, -d * 0.18, 0.5, 0.5, 0.7 + wh + 3.2)], door: V(0, 0, d / 2 + (playerHome ? 3.4 : 1.8)) };
  },

  townHall(p) {
    const w = 17, d = 10.5, wh = 7, wall = M('#e3d6b8'), wood = M('#5c4631'), stone = M('#8f887a'), slate = M('#4f5961');
    box(p, w + 1.2, 1.6, d + 1.2, stone, 0, 0, 0);
    for (let i = 0; i < 3; i++) box(p, 7 - i * 0.8, 0.35, 1.2, stone, 0, 0.18 + i * 0.35, d / 2 + 1.9 - i * 0.5);
    box(p, w, wh, d, wall, 0, 0.8 + wh / 2, 0);
    for (const x of [-w / 2, -w / 6, w / 6, w / 2]) box(p, 0.5, wh, 0.5, wood, x, 0.8 + wh / 2, d / 2 + 0.05);
    box(p, w + 0.2, 0.45, d + 0.2, wood, 0, 0.8 + wh * 0.5, 0);
    box(p, w + 0.2, 0.45, d + 0.2, wood, 0, 0.8 + wh, 0);
    gable(p, w, d, 4.2, slate, 0.8 + wh + 0.2, 0.8);
    // tower
    box(p, 4.6, 7, 4.6, wall, 0, 0.8 + wh + 3.5, -0.5);
    box(p, 5, 0.4, 5, wood, 0, 0.8 + wh + 7, -0.5);
    pyramid(p, 3.9, 4.6, M('#7d5f3a', 0.6), 0, 0.8 + wh + 7.2, -0.5);
    mesh(p, new THREE.OctahedronGeometry(0.75, 0), glow.ruby, 0, 0.8 + wh + 4.6, 1.85).scale.set(1, 1.5, 0.5);
    box(p, 2.4, 2.4, 0.12, M('#d9b45c', 0.35, { metalness: 0.5 }), 0, 0.8 + wh + 4.6, 1.8);
    door(p, 2.6, 3.4, d / 2 + 0.06, M('#3e2c1e'));
    windowsRow(p, 6, w, 0.8 + wh * 0.35, d / 2 + 0.07, glow.window, 1.2, 1.6, [2, 3]);
    windowsRow(p, 6, w, 0.8 + wh * 0.75, d / 2 + 0.07, glow.window, 1.2, 1.3);
    banner(p, -2.6, 0.8 + wh * 0.62, d / 2 + 0.2, '#5b3a8c');
    banner(p, 2.6, 0.8 + wh * 0.62, d / 2 + 0.2, '#5b3a8c');
    const eaves = 0.8 + wh + 0.2;
    return { colliderTop: eaves, colliders: [
      { type: 'box', x: 0, z: 0, hw: w / 2 + 0.7, hd: d / 2 + 0.7, top: eaves },
      { type: 'box', x: 0, z: -0.5, hw: 2.5, hd: 2.5, top: 0.8 + wh + 7.0 }
    ], surfaces: [gableSurface(w, d, 4.2, 0.8 + wh + 0.2, 0.8), { shape: 'pyramid', x: 0, z: -0.5, radius: 2.75, h: 4.6, y: 0.8 + wh + 7.2, localY: true }], door: V(0, 0, d / 2 + 3.2) };
  },

  academy(p) {
    const w = 18, d = 8.5, wh = 5.4, wall = M('#ded2b6'), wood = M('#5c4631'), roof = M('#4d5f73');
    box(p, w + 1, 1.4, d + 1, M('#8f887a'), 0, 0, 0);
    box(p, w, wh, d, wall, 0, 0.7 + wh / 2, 0);
    for (let i = 0; i <= 6; i++) box(p, 0.35, wh, 0.35, wood, -w / 2 + i * w / 6, 0.7 + wh / 2, d / 2 + 0.05);
    const roofY = 0.7 + wh + 0.05, roofH = 3.2;
    gable(p, w, d, roofH, roof, roofY);
    windowsRow(p, 6, w, 0.7 + wh * 0.55, d / 2 + 0.07, glow.window, 1.3, 1.7, [3]);
    door(p, 2.2, 3, d / 2 + 0.06);
    // bell tower
    const tx = -w / 2 + 2.4;
    box(p, 3.6, 5.5, 3.6, wall, tx, 0.7 + wh + 2.7, 0);
    for (const x of [-1.5, 1.5]) for (const z of [-1.5, 1.5]) box(p, 0.35, 2.6, 0.35, wood, tx + x, 0.7 + wh + 6.7, z);
    cyl(p, 0.35, 0.75, 1.1, M('#b88f3c', 0.35, { metalness: 0.6 }), tx, 0.7 + wh + 6.7, 0, 10);
    pyramid(p, 3.2, 3.2, roof, tx, 0.7 + wh + 8, 0);
    const crest = mesh(p, new THREE.CircleGeometry(1.3, 6), M('#d9b45c', 0.35, { metalness: 0.5 }), 3.4, 0.7 + wh + 1.4, d / 2 + 0.95);
    crest.rotation.x = -0.1;
    mesh(p, new THREE.CircleGeometry(0.8, 6), M('#5b3a8c', 0.6), 3.4, 0.7 + wh + 1.4, d / 2 + 1.0).rotation.x = -0.1;
    const eaves = 0.7 + wh + 0.05;
    return { colliderTop: eaves, colliders: [
      { type: 'box', x: 0, z: 0, hw: w / 2 + 0.5, hd: d / 2 + 0.5, top: eaves },
      { type: 'box', x: tx, z: 0, hw: 1.8, hd: 1.8, top: 0.7 + wh + 11.2 }
    ], surfaces: [gableSurface(w, d, roofH, roofY), { shape: 'pyramid', x: tx, z: 0, radius: 3.2, h: 3.2, y: 0.7 + wh + 8, localY: true }], door: V(0, 0, d / 2 + 2) };
  },

  shop(p, s) {
    const w = 8, d = 7, wh = 4.2, wall = M('#e1d3b4'), wood = M('#5c4631');
    box(p, w + 0.6, 1.2, d + 0.6, M('#8a8474'), 0, 0, 0);
    box(p, w, wh, d, wall, 0, 0.6 + wh / 2, 0);
    const roofY = 0.6 + wh + 0.05, roofH = 2.8;
    gable(p, w, d, roofH, M('#6c4a36'), roofY);
    if (s.id === 'malezor-gear-shop') { // the Malezor Town Store: a front door that swings, for the door walk (store-interior.js)
      box(p, 1.72, 2.5, 0.06, M('#1c1510'), 0, 0.6 + 1.25, d / 2 - 0.02);
      // the building is scaled non-uniformly (world.js · BUILDING_SCALE): the hinge undoes it so the leaf swings rigid,
      // and the leaf is cut to the scaled doorway's real width
      const [bx, bz] = s.buildingScale || [1, 1], leafW = 1.6 * bx;
      const hinge = new THREE.Group(); hinge.name = 'storeDoor'; hinge.userData.keep = true; hinge.userData.reach = leafW - 0.15; hinge.position.set(-0.8, 0.6, d / 2 + 0.05); hinge.scale.set(1 / bx, 1, 1 / bz); p.add(hinge);
      const leaf = box(hinge, leafW, 2.5, 0.16, M('#4a3524'), leafW / 2, 1.25, 0); leaf.userData.door = true;
      box(hinge, 0.08, 0.08, 0.3, M('#c9a34d', 0.4, { metalness: 0.5 }), leafW - 0.15, 1.0, 0);
      hinge.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    } else door(p, 1.6, 2.5, d / 2 + 0.05);
    box(p, 2.2, 1.3, 0.12, glow.window, -2.5, 2.3, d / 2 + 0.06); box(p, 2.2, 1.3, 0.12, glow.window, 2.5, 2.3, d / 2 + 0.06);
    const aw = new THREE.Group(); aw.position.set(0, 3.9, d / 2 + 1.1); aw.rotation.x = 0.42; p.add(aw);
    for (let i = 0; i < 8; i++) box(aw, w / 8, 0.1, 2.3, i % 2 ? M('#efe6d0') : M(s.accent || '#b8584b'), -w / 2 + (i + 0.5) * w / 8, 0, 0);
    for (const x of [-w / 2 + 0.2, w / 2 - 0.2]) box(p, 0.18, 3.6, 0.18, wood, x, 2.4, d / 2 + 2.1);
    // hanging sign: a potion flask
    box(p, 0.15, 0.15, 1.6, wood, w / 2 - 0.4, 5.2, d / 2 + 0.8);
    mesh(p, new THREE.SphereGeometry(0.55, 12, 10), M(s.accent || '#b8584b', 0.25, { emissive: new THREE.Color(s.accent || '#b8584b'), emissiveIntensity: 0.25 }), w / 2 - 0.4, 4.3, d / 2 + 1.4);
    cyl(p, 0.16, 0.2, 0.5, M('#e8e2d0', 0.3), w / 2 - 0.4, 4.95, d / 2 + 1.4, 8);
    const eaves = 0.6 + wh + 0.05;
    return { colliderTop: eaves, colliders: [{ type: 'box', x: 0, z: 0, hw: w / 2 + 0.4, hd: d / 2 + 0.4, top: eaves }], surfaces: [gableSurface(w, d, roofH, roofY)], door: V(0, 0, d / 2 + 2.6) };
  },

  zysphereShop(p, s, ctx) {
    const out = RECIPES.shop(p, s, ctx);
    const orb = mesh(p, new THREE.SphereGeometry(1.25, 20, 16), M('#e9e2f5', 0.25, { emissive: new THREE.Color('#7a5aa8'), emissiveIntensity: 0.2 }), 0, 9.3, 0);
    const band = mesh(p, new THREE.TorusGeometry(1.27, 0.12, 8, 28), M('#d9b45c', 0.3, { metalness: 0.6 }), 0, 9.3, 0); band.rotation.x = Math.PI / 2;
    cyl(p, 0.18, 0.3, 1.6, M('#5c4631'), 0, 7.6, 0, 8);
    orb.userData.keep = true; orb.userData.spin = 0.5; band.userData.keep = true; band.userData.spin = 0.5;
    return out;
  },

  research(p) {
    const w = 10.5, d = 8, wh = 8.2, wall = M('#d4d0c4'), trim = M('#4d4f52');
    box(p, w + 0.8, 1.4, d + 0.8, M('#8a8474'), 0, 0, 0);
    box(p, w, wh, d, wall, 0, 0.7 + wh / 2, 0);
    box(p, w + 0.3, 0.5, d + 0.3, trim, 0, 0.7 + wh, 0); box(p, w + 0.2, 0.3, d + 0.2, trim, 0, 0.7 + wh / 2, 0);
    windowsRow(p, 4, w, 0.7 + wh * 0.28, d / 2 + 0.06, glow.window, 1.4, 1.6, [1]);
    windowsRow(p, 4, w, 0.7 + wh * 0.75, d / 2 + 0.06, glow.window, 1.4, 1.6);
    door(p, 1.8, 2.6, d / 2 + 0.05, M('#3b4450'));
    // glass lab annex
    box(p, 5, 3.8, 5.5, glow.lab, w / 2 + 2.5, 0.7 + 1.9, 0.5);
    box(p, 5.3, 0.25, 5.8, trim, w / 2 + 2.5, 0.7 + 3.9, 0.5);
    // dish + mast with a beacon
    const dish = mesh(p, new THREE.SphereGeometry(1.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3), M('#e6e6e0', 0.4, { side: THREE.DoubleSide }), -2.4, 0.7 + wh + 1.6, -1.5);
    dish.rotation.x = -2.2;
    cyl(p, 0.12, 0.16, 6, trim, 2.8, 0.7 + wh + 3, -2.3, 6);
    mesh(p, new THREE.SphereGeometry(0.22, 8, 6), glow.beacon, 2.8, 0.7 + wh + 6.1, -2.3);
    const eaves = 0.7 + wh + 0.25;
    return { colliderTop: eaves, colliders: [
      { type: 'box', x: 0, z: 0, hw: w / 2, hd: d / 2, top: eaves },
      { type: 'box', x: w / 2 + 2.5, z: 0.5, hw: 2.65, hd: 2.9, top: 0.7 + 4.0 },
      { type: 'circle', x: 2.8, z: -2.3, r: 0.2, top: 0.7 + wh + 6.2 }
    ], surfaces: [flatSurface(0, 0, w / 2, d / 2, eaves)], door: V(0, 0, d / 2 + 2) };
  },

  barn(p) {
    const w = 13, d = 9, wh = 5.4, red = M('#983a2f'), white = M('#ede4d2');
    box(p, w + 0.6, 1, d + 0.6, M('#7e776a'), 0, 0, 0);
    box(p, w, wh, d, red, 0, 0.5 + wh / 2, 0);
    gable(p, w, d, 3.8, M('#4a4642'), 0.5 + wh);
    box(p, 4, 4, 0.12, M('#6e2a22'), 0, 2.5, d / 2 + 0.05);
    for (const r of [0.78, -0.78]) { const b = box(p, 5.4, 0.28, 0.14, white, 0, 2.5, d / 2 + 0.12); b.rotation.z = r; }
    box(p, 4.4, 0.3, 0.16, white, 0, 4.6, d / 2 + 0.1);
    const sx = -w / 2 - 2.6;
    cyl(p, 2.3, 2.3, 10, M('#b9b3a6', 0.5, { metalness: 0.3 }), sx, 5, -1, 16);
    mesh(p, new THREE.SphereGeometry(2.35, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M('#7f8a8c', 0.4, { metalness: 0.4 }), sx, 10, -1);
    const eaves = 0.5 + wh;
    return { colliderTop: eaves, colliders: [
      { type: 'box', x: 0, z: 0, hw: w / 2 + 0.4, hd: d / 2 + 0.4, top: eaves },
      { type: 'circle', x: sx, z: -1, r: 2.6, top: 12.35 }
    ], surfaces: [gableSurface(w, d, 3.8, eaves), { shape: 'sphereCap', x: sx, z: -1, radius: 2.35, y: 10, localY: true }], door: V(0, 0, d / 2 + 2.2) };
  },

  seerHQ(p) {
    const obs = M('#27232f', 0.45, { metalness: 0.25 }), dark = M('#1b1822', 0.6);
    box(p, 16, 1.6, 12, M('#3d3a42'), 0, 0, 0);
    const s = new THREE.Shape(); // chamfered, forward-leaning profile
    s.moveTo(-6, 0); s.lineTo(6, 0); s.lineTo(6, 6.5); s.lineTo(3.5, 9); s.lineTo(-3.5, 9); s.lineTo(-6, 6.5); s.lineTo(-6, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 14, bevelEnabled: false }); g.translate(0, 0, -7); g.rotateY(Math.PI / 2);
    mesh(p, g, obs, 0, 0.8, 0);
    const spire = mesh(p, new THREE.ConeGeometry(2.2, 14, 4), dark, 0, 9.8 + 7, 0); spire.rotation.y = Math.PI / 4;
    for (const x of [-6.9, 6.9]) box(p, 0.2, 6, 0.2, glow.seer, x, 4, 6.05);
    box(p, 13.8, 0.2, 0.2, glow.seer, 0, 7.3, 6.05);
    box(p, 3, 4, 0.15, glow.seer, 0, 2.8, 6.02);
    for (const x of [-4, 4]) box(p, 1.3, 3.2, 0.08, M('#3c2463', 0.85), x, 4.6, 6.2);
    mesh(p, new THREE.OctahedronGeometry(0.9, 0), glow.seer, 0, 18.5, 0).scale.set(1, 1.8, 1);
    const roofTop = 9.8;
    return { colliderTop: roofTop, colliders: [
      { type: 'box', x: 0, z: 0, hw: 7.3, hd: 6.4, top: 7.3 },
      { type: 'circle', x: 0, z: 0, r: 2.3, top: 23.8 }
    ], surfaces: [flatSurface(0, 0, 7, 3.5, roofTop), { shape: 'pyramid', x: 0, z: 0, radius: 2.3, h: 14, y: 9.8, localY: true }], door: V(0, 0, 8.5) };
  },

  seerGate(p) {
    const dark = M('#211e27', 0.5, { metalness: 0.2 });
    for (const x of [-5.6, 5.6]) {
      const py = mesh(p, new THREE.CylinderGeometry(0.6, 1.2, 8, 4), dark, x, 4, 0); py.rotation.y = Math.PI / 4;
      mesh(p, new THREE.OctahedronGeometry(0.55, 0), glow.seer, x, 8.6, 0).scale.set(1, 1.7, 1);
    }
    box(p, 12.6, 0.7, 0.9, dark, 0, 7.2, 0);
    box(p, 10.6, 0.14, 0.14, glow.seer, 0, 6.75, 0.5);
    box(p, 1.4, 2.4, 0.08, M('#3c2463', 0.85), 0, 5.6, 0.5);
    return { colliders: [{ type: 'circle', x: -5.6, z: 0, r: 1.3, top: 8.6 }, { type: 'circle', x: 5.6, z: 0, r: 1.3, top: 8.6 }], surfaces: [flatSurface(0, 0, 6.3, 0.55, 7.55), { shape: 'circle', x: -5.6, z: 0, radius: 0.6, y: 8.6, localY: true }, { shape: 'circle', x: 5.6, z: 0, radius: 0.6, y: 8.6, localY: true }], door: V(0, 0, 2.5) };
  },

  // District landmarks are authored as simple, solid silhouettes. Each
  // exposed roof/deck gets a matching collision surface for flight landings.
  gearShop(p, s) { return RECIPES.shop(p, { ...s, accent: '#728c9d' }); },
  hospital(p) {
    const w = 18, d = 13, h = 6.5, wall = M('#e7e0d2'), roof = M('#657c74'), trim = M('#6a4737');
    box(p, w + 1, 1.2, d + 1, M('#999387'), 0, 0, 0); box(p, w, h, d, wall, 0, 0.6 + h / 2, 0);
    gable(p, w, d, 3.2, roof, 0.6 + h);
    { // a live front door (hinged at its west edge): Rizer walks out of it, healed, after a knock-out
      box(p, 2.7, 0.3, 0.3, M('#5a4632'), 0, 0.6 + 3.1 + 0.12, d / 2 + 0.06); box(p, 2.32, 3.1, 0.06, M('#1c1510'), 0, 0.6 + 1.55, d / 2 - 0.01);
      const hinge = new THREE.Group(); hinge.name = 'hospitalDoor'; hinge.userData.keep = true; hinge.userData.reach = 1.5; hinge.position.set(-1.1, 0.6, d / 2 + 0.06); p.add(hinge);
      box(hinge, 2.2, 3.1, 0.16, trim, 1.1, 1.55, 0); box(hinge, 0.08, 0.08, 0.3, M('#c9a34d', 0.4, { metalness: 0.5 }), 2.05, 1.1, 0);
      hinge.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    }
    windowsRow(p, 6, w, 3.1, d / 2 + 0.07, glow.window, 1.4, 1.5, [2, 3]);
    box(p, 0.65, 3.8, 0.2, M('#a83c3c'), 0, 4.1, d / 2 + 0.2); box(p, 2.4, 0.65, 0.2, M('#a83c3c'), 0, 4.1, d / 2 + 0.2);
    return { colliderTop: 0.6 + h, colliders: [{ type:'box', x:0,z:0,hw:w/2,hd:d/2,top:0.6+h }], surfaces:[gableSurface(w,d,3.2,0.6+h)], door:V(0,0,d/2+2) };
  },
  districtGate(p) {
    const stone=M('#776d5c'), gold=M('#c29a54',0.5,{metalness:0.5});
    for (const x of [-8,8]) { box(p,2.2,12,2.2,stone,x,6,0); pyramid(p,1.8,2.6,gold,x,12,0); }
    box(p,18,2.2,2.2,stone,0,12,0); const arch=mesh(p,new THREE.TorusGeometry(6,0.65,8,32,Math.PI),gold,0,6,0); arch.rotation.z=Math.PI;
    return { colliders:[{type:'box',x:-8,z:0,hw:1.2,hd:1.2,top:13.5},{type:'box',x:8,z:0,hw:1.2,hd:1.2,top:13.5},{type:'box',x:0,z:0,hw:9,hd:1.2,top:13.5}], surfaces:[flatSurface(-8,0,1,1,12),flatSurface(8,0,1,1,12),flatSurface(0,0,9,1,13.1)], door:V(0,0,2) };
  },
  radioTower(p) {
    const metal=M('#655d50',0.6,{metalness:0.45}), rust=M('#986441');
    for(const x of [-1.8,1.8]) for(const z of [-1.8,1.8]) cyl(p,0.12,0.2,25,metal,x,12.5,z,6);
    for(let y=3;y<24;y+=4) { const a=box(p,4.1,0.14,0.14,rust,0,y,0); const b=box(p,0.14,0.14,4.1,rust,0,y,0); }
    for(let y=4;y<22;y+=4) { let q=box(p,0.14,5.4,0.14,metal,-0.9,y+2,0); q.rotation.z=0.34; q=box(p,0.14,5.4,0.14,metal,0.9,y+2,0); q.rotation.z=-0.34; }
    cyl(p,0.14,0.14,5,metal,0,26.5,0,8); const beacon=mesh(p,new THREE.OctahedronGeometry(0.8),glow.beacon,0,29.2,0);
    return { colliders:[{type:'box',x:0,z:0,hw:2.2,hd:2.2,top:28.5}], surfaces:[flatSurface(0,0,1.7,1.7,25)], door:V(0,0,3) };
  },
  treehouse(p) {
    const wood=M('#62452d'), bark=M('#58442f'), leaf=M('#536d3a');
    cyl(p,2.3,3.2,20,bark,0,10,0,9); box(p,10,5,8,wood,0,21,0); gable(p,10,8,3.5,leaf,23.5);
    for(const x of [-4.5,4.5]) box(p,0.4,5,0.4,wood,x,21,4.1);
    const ladder=box(p,2.3,12,0.3,wood,0,6,3.25); ladder.rotation.x=-0.22;
    return {colliders:[{type:'circle',x:0,z:0,r:3.4,top:20},{type:'box',x:0,z:0,hw:5.3,hd:4.3,top:23.5}],surfaces:[flatSurface(0,0,5,4,23.5),gableSurface(10,8,3.5,23.5)],door:V(0,0,5)};
  },
  novariusStatue(p) {
    const stone=M('#b8ae98'), gold=M('#c9a65b',0.48,{metalness:0.4});
    cyl(p,4.5,5,1.3,stone,0,0.65,0,12); box(p,2.2,8,1.8,stone,0,5.2,0);
    mesh(p,new THREE.SphereGeometry(2.1,12,10),stone,0,10.7,0); for(const x of [-2.7,2.7]) { const wing=mesh(p,new THREE.ConeGeometry(2,7,5),stone,x,8,0); wing.rotation.z=x<0?0.65:-0.65; }
    mesh(p,new THREE.OctahedronGeometry(0.75),gold,0,10.8,1.8);
    return {colliders:[{type:'circle',x:0,z:0,r:3.6,top:11.5}],surfaces:[{shape:'circle',x:0,z:0,radius:4.2,y:1.3,localY:true}],door:V(0,0,5)};
  },
  ufo(p) {
    const hull=M('#303944',0.45,{metalness:0.48}), edge=M('#a8bdc6',0.32,{metalness:0.55}), glass=M('#18243c',0.24,{metalness:0.25,emissive:new THREE.Color('#20185f'),emissiveIntensity:0.5}), gold=M('#dbb65f',0.4,{metalness:0.58}), core=M('#54dfff',0.28,{emissive:new THREE.Color('#19bfff'),emissiveIntensity:1.35});
    // Faceted, swept saucer: the stepped octagonal hull keeps the RP7D low-poly look.
    const lower=mesh(p,new THREE.CylinderGeometry(4.8,7.7,1.1,8,1),hull,0,4.25,0); lower.rotation.y=Math.PI/8;
    const rim=mesh(p,new THREE.CylinderGeometry(7.7,9.1,0.65,8,1),edge,0,4.9,0); rim.rotation.y=Math.PI/8;
    const deck=mesh(p,new THREE.CylinderGeometry(7.25,7.7,0.35,8,1),hull,0,5.35,0); deck.rotation.y=Math.PI/8;
    const dome=mesh(p,new THREE.SphereGeometry(3.8,8,5,0,Math.PI*2,0,Math.PI/2),glass,0,5.45,0);
    const crown=mesh(p,new THREE.OctahedronGeometry(0.72,0),gold,0,7.85,0); crown.scale.set(1.15,0.8,1.15);
    mesh(p,new THREE.OctahedronGeometry(0.32,0),core,0,7.85,0);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const light=mesh(p,new THREE.OctahedronGeometry(0.34,0),core,Math.cos(a)*7.45,5.15,Math.sin(a)*7.45);light.scale.set(1.5,0.45,0.65);}
    // Three swept fins and compact landing skids give the craft a directional profile.
    for(const side of [-1,1]){
      const fin=mesh(p,new THREE.BoxGeometry(0.25,0.3,5.2),edge,side*4.9,4.65,-4.1); fin.rotation.y=side*0.18; fin.rotation.z=side*0.12;
      const skid=mesh(p,new THREE.BoxGeometry(0.28,0.22,2.9),hull,side*5.8,2.55,0); skid.rotation.y=side*0.2;
      mesh(p,new THREE.BoxGeometry(0.22,1.1,0.22),edge,side*5.8,3.15,0);
    }
    mesh(p,new THREE.BoxGeometry(0.32,0.28,3.8),edge,0,3.65,-6.4);
    return {colliders:[{type:'circle',x:0,z:0,r:8,top:9.3}],surfaces:[{shape:'circle',x:0,z:0,radius:7.6,y:5.55,localY:true},{shape:'sphereCap',x:0,z:0,radius:3.8,y:5.45,localY:true}],door:V(0,0,9)};
  },
  sealedChest(p, s) {
    const dark=M('#28283a',0.55,{metalness:0.2}), trim=M(s.accent || '#c69a4d',0.35,{metalness:0.7}), crystal=M(s.glow || '#6e83d8',0.22,{emissive:new THREE.Color(s.glow || '#6e83d8'),emissiveIntensity:0.35});
    box(p,3.4,1.6,2.4,dark,0,0.9,0); box(p,3.6,0.22,2.55,trim,0,1.75,0);
    const lid=mesh(p,new THREE.SphereGeometry(1.75,12,8,0,Math.PI*2,0,Math.PI/2),dark,0,1.7,-0.1); lid.scale.set(1,0.6,0.8);
    for(const x of [-1.45,1.45]) box(p,0.22,1.8,2.65,trim,x,0.95,0);
    mesh(p,new THREE.OctahedronGeometry(0.36),crystal,0,1.28,1.28);
    return {colliders:[{type:'box',x:0,z:0,hw:1.9,hd:1.45,top:2.2}],surfaces:[flatSurface(0,0,1.7,1.2,1.95)],door:V(0,0,2)};
  },
  fanghall(p) { return RECIPES.districtHall(p, '#51463a', '#65543c', 'fanghall'); },
  bloodscentLodge(p) { return RECIPES.districtHall(p, '#3b302f', '#602e30', 'lodge'); },
  firstDen(p) { return RECIPES.districtHall(p, '#b8aa8d', '#8f8068', 'den'); },
  districtHall(p, wallColor, roofColor, style) {
    const w=24,d=18,h=8,wall=M(wallColor),roof=M(roofColor),stone=M('#817969');
    box(p,w+1.5,1.6,d+1.5,stone,0,0,0); box(p,w,h,d,wall,0,0.8+h/2,0); gable(p,w,d,5,roof,0.8+h,1);
    door(p,3.2,4,d/2+0.06,M('#33291f')); windowsRow(p,8,w,4.2,d/2+0.07,glow.window,1.5,1.8,[3,4]);
    for(const x of [-8,8]) box(p,0.4,10,0.4,stone,x,5.8,0);
    if(style==='fanghall') {
      const tusk=M('#d0c3a5'), red=M('#782d2b');
      for(const x of [-2.7,2.7]) { const c=new THREE.CatmullRomCurve3([V(x,1,d/2+0.4),V(x*1.15,4,d/2+2),V(x*0.9,7,d/2+2.2),V(x*0.45,9,d/2+1.2)]); mesh(p,new THREE.TubeGeometry(c,18,0.34,7,false),tusk); }
      mesh(p,new THREE.DodecahedronGeometry(1.15,0),tusk,0,10.2,0); banner(p,-8,5,d/2+0.2,'#7d2e2b'); banner(p,8,5,d/2+0.2,'#7d2e2b');
      for(const x of [-12,12]) for(let i=0;i<5;i++){const spike=mesh(p,new THREE.ConeGeometry(0.5,3,5),red,x,2.1,-7+i*3.5); spike.rotation.z=x<0?-0.18:0.18;}
    } else if(style==='lodge') {
      const horn=M('#c1ad8b'), red=M('#973e3b');
      box(p,2,8,2,stone,9,7,-5); box(p,2.5,0.5,2.5,red,9,11,-5);
      for(const x of [-2.2,2.2]) { const c=new THREE.CatmullRomCurve3([V(x,6,d/2+0.2),V(x*1.3,8,d/2+1.8),V(x*1.2,11,d/2+1.7),V(x*0.55,12,d/2+0.8)]); mesh(p,new THREE.TubeGeometry(c,18,0.3,7,false),horn); }
      const blade=M('#a8a18f',0.4,{metalness:0.5}); for(const a of [-0.65,0.65]){const sword=box(p,0.22,6,0.22,blade,a*2,5,d/2+0.6); sword.rotation.z=a;}
      banner(p,-9,5,d/2+0.2,'#762a2f'); banner(p,9,5,d/2+0.2,'#762a2f');
    } else {
      const bone=M('#d5c9aa'), red=M('#a24b3c');
      for(const x of [-7,7]) { const c=new THREE.CatmullRomCurve3([V(x,1,d/2+0.8),V(x*1.2,6,d/2+1.5),V(x*0.7,12,d/2+1.8),V(0,16,d/2+1.2)]); mesh(p,new THREE.TubeGeometry(c,24,0.65,8,false),bone); }
      for(const x of [-11,11]) { cyl(p,0.38,0.55,6,bone,x,3, d/2+0.3,6); mesh(p,new THREE.SphereGeometry(0.75,8,6),bone,x,6.4,d/2+0.3); }
      box(p,7,5,0.12,glow.ruby,0,4,d/2+0.4); box(p,8,0.3,0.2,red,0,7,d/2+0.4);
    }
    const e=0.8+h; return {colliderTop:e,colliders:[{type:'box',x:0,z:0,hw:w/2+0.5,hd:d/2+0.5,top:e}],surfaces:[gableSurface(w,d,5,e,1)],door:V(0,0,d/2+2.5)};
  },

  fountain(p) {
    const stone = M('#b3aa96'), dark = M('#8c8574');
    const rim = mesh(p, new THREE.TorusGeometry(4.2, 0.45, 8, 40), stone, 0, 0.75, 0); rim.rotation.x = Math.PI / 2;
    cyl(p, 4.3, 4.5, 0.7, dark, 0, 0.2, 0, 40);
    cyl(p, 0.7, 1, 2.8, stone, 0, 1.6, 0, 12);
    cyl(p, 1.7, 0.6, 0.5, stone, 0, 3.1, 0, 16);
    cyl(p, 0.35, 0.5, 1.2, stone, 0, 3.8, 0, 10);
    mesh(p, new THREE.OctahedronGeometry(0.45, 0), glow.ruby, 0, 4.75, 0).scale.set(1, 1.5, 1);
    return { colliders: [{ type: 'circle', x: 0, z: 0, r: 4.7, top: 0.75 }, { type: 'circle', x: 0, z: 0, r: 1, top: 4.4 }], surfaces: [flatSurface(0, 0, 4.2, 4.2, 0.55), { shape: 'circle', x: 0, z: 0, radius: 0.7, y: 4.4, localY: true }], door: V(0, 0, 6), water: [{ r: 3.9, y: 0.62 }, { r: 1.45, y: 3.3 }] };
  },

  fallenTitan(p) {
    const bone = M('#d8cdb1', 0.9), boneDark = M('#b9ad8f', 0.95), cols = [];
    const spine = new THREE.CatmullRomCurve3([V(-20, -1, 0), V(-12, 2.2, 0.6), V(-2, 3.6, 0), V(8, 3.2, -0.6), V(15, 2.2, 0)]);
    for (let i = 0; i <= 26; i++) {
      const t = i / 26, pt = spine.getPoint(t), s = 0.9 + Math.sin(t * Math.PI) * 0.7;
      const v = mesh(p, new THREE.DodecahedronGeometry(s, 0), i % 2 ? bone : boneDark, pt.x, pt.y, pt.z); v.scale.set(0.8, 1, 1.25); v.rotation.set(t * 3, t * 5, 0);
      if (i % 3 === 0 && pt.y > 0.5) cols.push({ type: 'circle', x: pt.x, z: pt.z, r: s * 1.1 });
    }
    for (let i = 0; i < 7; i++) {
      const x = -13 + i * 3.6, top = spine.getPoint(0.2 + i * 0.09), span = 7.5 - Math.abs(i - 3) * 0.55, rise = 6.5 - Math.abs(i - 3.2) * 0.7;
      for (const sd of [-1, 1]) {
        const lean = (i - 3) * 0.25;
        const c = new THREE.CatmullRomCurve3([V(x, top.y, top.z), V(x + lean, top.y + rise, sd * span * 0.45), V(x + lean * 1.4, top.y + rise * 0.55, sd * span * 0.95), V(x + lean * 1.6, -0.8, sd * span * 1.08)]);
        mesh(p, new THREE.TubeGeometry(c, 20, 0.42 - i * 0.02, 6, false), bone);
        if (i % 2 === 0 || i === 6) cols.push({ type: 'circle', x: x + lean * 1.6, z: sd * span * 1.05, r: 0.9 });
      }
    }
    // skull, half sunk into the grass
    const sk = new THREE.Group(); sk.position.set(19, 2.2, 0); sk.rotation.set(0, 0, -0.32); p.add(sk);
    mesh(sk, new THREE.SphereGeometry(3.2, 14, 10), bone).scale.set(1.35, 0.9, 1);
    mesh(sk, new THREE.BoxGeometry(5.5, 1.5, 3.6), boneDark, 3.2, -1.3, 0).rotation.z = 0.12;
    for (const z of [-1.45, 1.45]) mesh(sk, new THREE.SphereGeometry(0.85, 10, 8), M('#2b2723', 1), 2.1, 0.5, z);
    for (const z of [-1, 1]) {
      const hc = new THREE.CatmullRomCurve3([V(-1, 2, z * 1.6), V(-3.5, 4.5, z * 3.4), V(-7.5, 4.8, z * 4.2), V(-9.5, 3.4, z * 3.6)]);
      const horn = new THREE.TubeGeometry(hc, 18, 0.55, 7, false);
      const pos = horn.attributes.position; // taper toward the tip
      for (let k = 0; k < pos.count; k++) { const u = Math.floor(k / 8) / 18, c = hc.getPoint(Math.min(u, 1)); const f = 1 - u * 0.8; pos.setXYZ(k, c.x + (pos.getX(k) - c.x) * f, c.y + (pos.getY(k) - c.y) * f, c.z + (pos.getZ(k) - c.z) * f); }
      horn.computeVertexNormals(); mesh(sk, horn, boneDark);
    }
    cols.push({ type: 'circle', x: 19, z: 0, r: 4.3 }, { type: 'circle', x: 22.5, z: 0, r: 2.6 });
    return { colliders: cols, door: V(4, 0, 9.5) };
  },

  rubyCave(p) {
    const r = rng(9091), rock = [M('#7c776c', 0.95), M('#6c675d', 0.95), M('#8a8477', 0.95)], cols = [];
    // arch of boulders around the mouth
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * i / 12, rad = 6.2 + r.range(-0.3, 0.6), s = r.range(2.1, 3.1);
      const b = mesh(p, new THREE.DodecahedronGeometry(s, 1), rock[i % 3], Math.cos(a) * rad, Math.sin(a) * rad * 1.05 - 0.4, r.range(-0.8, 0.8));
      b.scale.set(1, r.range(0.8, 1.2), 1.1); b.rotation.set(r() * 3, r() * 3, r() * 3);
    }
    // mass swelling back into the escarpment
    for (let i = 0; i < 16; i++) {
      const x = r.range(-13, 13), z = r.range(-12, -2.5), s = r.range(3.2, 6.5) * (1 - Math.abs(x) / 22);
      const b = mesh(p, new THREE.DodecahedronGeometry(s, 1), rock[i % 3], x, s * 0.45 + 1.5 - z * 0.12, z); b.rotation.set(r() * 3, r() * 3, r() * 3); b.scale.y = 0.85;
    }
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
      const b = mesh(p, new THREE.DodecahedronGeometry(r.range(2, 3.2), 1), rock[i % 3], sd * (9 + i * 2.3), 1 + r(), -2 - i * 1.4); b.rotation.set(r() * 3, r() * 3, r() * 3);
    }
    // the mouth
    const mouth = mesh(p, new THREE.CylinderGeometry(4.6, 4.6, 9, 20, 1, true, Math.PI / 2, Math.PI), M('#0f0b0c', 1, { side: THREE.BackSide }), 0, 0, -3.2);
    mouth.rotation.x = Math.PI / 2;
    mesh(p, new THREE.CircleGeometry(4.6, 20, 0, Math.PI), M('#070506', 1), 0, 0, -7.6);
    box(p, 9.4, 0.3, 9, M('#1a1414', 1), 0, 0.05, -3.2);
    // rubies
    const clusters = [[-4.8, 1, 1.4], [4.9, 1.3, 1.2], [-3.2, 6.2, 0.9], [3.6, 5.8, 1], [0, 7.3, 1], [-1.8, 0.4, -5], [2.2, 0.5, -6], [0, 2.8, -7.2]];
    for (const [x, y, z] of clusters) for (let k = 0; k < 4; k++) {
      const c = mesh(p, new THREE.OctahedronGeometry(r.range(0.35, 0.7), 0), glow.ruby, x + r.range(-0.6, 0.6), y + r.range(-0.2, 0.4), z + r.range(-0.3, 0.3));
      c.scale.y = r.range(1.6, 2.6); c.rotation.set(r.range(-0.5, 0.5), r() * 3, r.range(-0.5, 0.5));
    }
    for (let i = 0; i < 4; i++) box(p, 7 - i * 0.6, 0.35, 1.1, M('#8a8477'), 0, 0.15 + i * 0.2, 5.4 - i * 1.0);
    // signpost
    cyl(p, 0.14, 0.16, 2.6, M('#5c4631'), 7.6, 1.3, 5.6, 6);
    box(p, 2.2, 0.8, 0.12, M('#6e5338'), 7.6, 2.4, 5.62);
    const light = new THREE.PointLight('#ff2a48', 30, 22, 2); light.position.set(0, 3, 0); light.userData.keep = true; light.userData.ruby = true; p.add(light);
    cols.push({ type: 'box', x: -8.2, z: -3, hw: 3.6, hd: 5 }, { type: 'box', x: 8.2, z: -3, hw: 3.6, hd: 5 }, { type: 'box', x: 0, z: -12, hw: 16, hd: 5 }, { type: 'box', x: 0, z: -8.4, hw: 5, hd: 0.8 }, { type: 'circle', x: 7.6, z: 5.6, r: 0.4 });
    return { colliders: cols, door: V(0, 0, 4), surfaces: [] };
  },

  bridge(p, s, ctx) {
    const span = s.span || 12, hw = 1.9, wood = M('#6b5139', 0.9), dark = M('#4d3a28', 0.95);
    const deckY = s.deckY;
    for (let i = 0; i < Math.floor(span / 0.55); i++) {
      const z = -span / 2 + 0.27 + i * 0.55, arch = Math.sin((z / span + 0.5) * Math.PI) * 0.45;
      box(p, hw * 2 + (i % 3 ? 0 : 0.25), 0.2, 0.48, i % 2 ? wood : dark, 0, deckY + arch, z);
    }
    for (const x of [-hw, hw]) {
      for (let i = 0; i <= 5; i++) { const z = -span / 2 + i * span / 5, arch = Math.sin((z / span + 0.5) * Math.PI) * 0.45; box(p, 0.24, 1.9 + 1.6, 0.24, dark, x, deckY + arch - 0.4, z); }
      const rail = new THREE.CatmullRomCurve3([...Array(9)].map((_, i) => { const z = -span / 2 + i * span / 8; return V(x, deckY + 1.15 + Math.sin((z / span + 0.5) * Math.PI) * 0.45, z); }));
      mesh(p, new THREE.TubeGeometry(rail, 16, 0.1, 5, false), wood);
    }
    for (const z of [-span / 2 + 1.2, span / 2 - 1.2]) box(p, hw * 2 + 1, 0.5, 0.7, dark, 0, deckY - 0.45, z);
    return {
      colliders: [{ type: 'box', x: -hw - 0.1, z: 0, hw: 0.18, hd: span / 2 - 0.4 }, { type: 'box', x: hw + 0.1, z: 0, hw: 0.18, hd: span / 2 - 0.4 }],
      surfaces: [{ x: 0, z: 0, hw: hw + 0.2, hd: span / 2 + 0.2, y: deckY, arch: 0.45, span }],
      door: V(0, 0, 0)
    };
  },

  championStadium(p, s) { return championStadium(p, s); },

  lamp(p) {
    const iron = M('#2f302e', 0.5, { metalness: 0.5 });
    cyl(p, 0.1, 0.16, 4.2, iron, 0, 2.1, 0, 6);
    box(p, 0.9, 0.12, 0.12, iron, 0.35, 4.15, 0);
    box(p, 0.46, 0.62, 0.46, glow.lamp, 0.75, 3.75, 0);
    pyramid(p, 0.42, 0.3, iron, 0.75, 4.08, 0);
    return { colliders: [{ type: 'circle', x: 0, z: 0, r: 0.3 }], door: V(0, 0, 0), lampAt: V(0.75, 3.75, 0) };
  }
};

// Merge a recipe group's meshes by material. Keeps flagged meshes and lights live.
export function bake(group) {
  group.updateMatrixWorld(true);
  const byMat = new Map(), keep = [];
  group.traverse(o => {
    if (o.isLight || o.userData.keep) { keep.push(o); return; }
    for (let a = o.parent; a && a !== group; a = a.parent) if (a.userData.keep) return; // parts of a live piece stay with it
    if (!o.isMesh || !o.visible || !o.parent?.visible) return;
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(o.matrixWorld);
    if (!byMat.has(o.material)) byMat.set(o.material, []); byMat.get(o.material).push(g);
  });
  const out = new THREE.Group();
  for (const [mat, geos] of byMat) {
    const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
    const glowy = Object.values(glow).includes(mat) || mat.transparent;
    m.castShadow = !glowy; m.receiveShadow = true; out.add(m);
  }
  for (const k of keep) { k.updateMatrixWorld(true); const wm = k.matrixWorld.clone(); k.removeFromParent(); wm.decompose(k.position, k.quaternion, k.scale); out.add(k); }
  return out;
}
