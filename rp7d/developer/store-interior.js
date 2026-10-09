// RP7D · the Malezor Town Store interior (RP7D Malezor Town Store V2). The second enterable building, on the same
// interior-level standard as Rizer's Home (home-interior.js): its own level with its own floors, collision, camera
// handling and borrowed lights, entered and left through the existing door walk (game.js · walkDoor).
//
//   Floor 1 · Rizer Department   potions and supplies, hanging herbs, a weapon rack, the Rizer counter and merchant
//   Floor 2 · Zyrex Department   the Zysphere display (blue spheres on gold stands), Zyrex gear, the Zyrex counter
//   one staircase against the east wall joins them: real stepped ground paced to the stair clips, railed, no loading
//
// The interface matches home-interior.js (root · roomWorld · start · show · update · nearDoor · frontDoor · stationAt ·
// lights · showAll), so the game drives either interior the same way.
import * as THREE from 'three';

const COLS = 14, ROWS = 10, TILE = 1.5, HALF_W = COLS * TILE / 2, HALF_D = ROWS * TILE / 2;
const F2 = 4.25, WALL_H = 3.9;
export const STORE_INTERIOR = { id: 'malezor-town-store', exteriorDoor: 'storeDoor', name: 'Malezor Town Store' };

export function createStoreInterior(scene) {
  const root = new THREE.Group(); root.name = 'MalezorStoreInterior'; root.visible = false; scene.add(root);
  const mat = (color, roughness = 0.82, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, flatShading: true, ...extra });
  const glowMat = (color, k = 1.4) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.25, flatShading: true });
  const wood = mat('#6a4a32'), darkWood = mat('#3e2a1e'), plank = mat('#8a6242'), plankAlt = mat('#7a5538'), stone = mat('#8d867a'), plaster = mat('#d8c9a8'), trim = mat('#a9824f');
  const gold = mat('#c9a04a', 0.35, { metalness: 0.7 }), navy = mat('#1d2d5c'), rugRed = mat('#7a2b2b'), rugBlue = mat('#243a7a');
  const box = (parent, w, h, d, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const cyl = (parent, rt, rb, h, m, x, y, z, seg = 8) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  const ball = (parent, r, m, x, y, z, seg = 12) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 4)), m); o.position.set(x, y, z); parent.add(o); return o; };
  const cell = (c, r, y) => new THREE.Vector3((c - (COLS - 1) / 2) * TILE, y, (r - (ROWS - 1) / 2) * TILE);
  const blockers = { 1: [], 2: [] }, stations = [];
  const solid = (lv, x, z, hw, hd, top) => blockers[lv].push({ x, z, hw, hd, top });
  let frontDoor = null;

  // the staircase: against the east wall, rising toward the back (−Z)
  const SW = TILE * 2.2, SD = TILE * 3.4, SX = HALF_W - SW / 2 - 0.25, SZ1 = -HALF_D + 1.8, SZ2 = SZ1 + SD; // x centre · top (−Z) · foot (+Z)
  const FX0 = SX - SW / 2 - 0.1, FX1 = HALF_W + 0.2;
  const overWell = (x, z) => x > FX0 - 0.1 && z > SZ1 - 0.05 && z < SZ2 + 0.05;

  function room(level) {
    const floorY = level === 1 ? 0 : F2, g = new THREE.Group(); g.name = `store-floor-${level}`; root.add(g);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const p = cell(c, r, floorY); if (level === 2 && overWell(p.x, p.z)) continue; // the stairwell is a real opening
      box(g, TILE - 0.03, 0.3, TILE - 0.03, darkWood, p.x, floorY - 0.17, p.z);
      box(g, TILE - 0.04, 0.05, TILE - 0.04, (r + c) % 2 ? plank : plankAlt, p.x, floorY - 0.01, p.z);
    }
    const wy = floorY + WALL_H / 2;
    box(g, HALF_W * 2, WALL_H, 0.34, plaster, 0, wy, -HALF_D);
    for (const sx of [-1, 1]) box(g, 0.34, WALL_H, HALF_D * 2, plaster, sx * HALF_W, wy, 0);
    for (const sx of [-1, 1]) box(g, 0.34, 1.0, HALF_D * 2, stone, sx * (HALF_W - 0.02), floorY + 0.5, 0); // stone skirting, as in the reference
    box(g, HALF_W * 2, 0.9, 0.36, stone, 0, floorY + 0.45, -HALF_D + 0.02);
    const doorW = 2.4;
    if (level === 1) {
      for (const sx of [-1, 1]) box(g, (HALF_W * 2 - doorW) / 2, WALL_H, 0.34, plaster, sx * (doorW + HALF_W * 2) / 4, wy, HALF_D);
      box(g, doorW, 1.2, 0.34, plaster, 0, floorY + WALL_H - 0.6, HALF_D);
      const leafW = 1.6, leafH = WALL_H - 1.2;
      box(g, doorW - leafW, leafH, 0.2, darkWood, -doorW / 2 + leafW + (doorW - leafW) / 2, floorY + leafH / 2, HALF_D);
      frontDoor = new THREE.Group(); frontDoor.name = 'storeDoorInside'; frontDoor.position.set(-doorW / 2, floorY, HALF_D); g.add(frontDoor);
      box(frontDoor, leafW, leafH, 0.14, darkWood, leafW / 2, leafH / 2, 0); box(frontDoor, 0.08, 0.08, 0.3, gold, leafW - 0.15, 1.1, 0);
    } else box(g, HALF_W * 2, WALL_H, 0.34, plaster, 0, wy, HALF_D);
    for (const x of [-HALF_W + 0.22, HALF_W - 0.22]) for (const z of [-HALF_D + 0.22, HALF_D - 0.22]) box(g, 0.42, WALL_H, 0.42, darkWood, x, wy, z);
    for (let i = -3; i <= 3; i++) box(g, 0.3, 0.26, HALF_D * 2, darkWood, i * 3, floorY + WALL_H - 0.15, 0); // ceiling beams
    const L = new THREE.PointLight('#ffcf8a', 30, 30, 1.6); L.position.set(-2, floorY + 3.1, 0); g.add(L);
    const L2 = new THREE.PointLight('#ffb870', 14, 16, 1.8); L2.position.set(-HALF_W + 2.5, floorY + 2.6, -3); g.add(L2);
    if (level === 2) { const L3 = new THREE.PointLight('#7fb8ff', 12, 14, 1.8); L3.position.set(0, floorY + 2.2, -3.5); g.add(L3); }
    return { g, floorY };
  }
  const first = room(1), second = room(2);
  second.g.visible = false;
  // ceilings: over Floor 1 with the stairwell open; the roof over Floor 2
  const ceiling = new THREE.Group(), wellCover = new THREE.Group(); root.add(ceiling, wellCover);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const p = cell(c, r, 0); box(overWell(p.x, p.z) ? wellCover : ceiling, TILE + 0.02, 0.18, TILE + 0.02, wood, p.x, F2 - 0.36, p.z); box(ceiling, TILE + 0.02, 0.18, TILE + 0.02, wood, p.x, F2 + WALL_H - 0.08, p.z); }
  wellCover.visible = false;
  // the flight: 14 risers at the stair clips' scale, rails on its open west side
  {
    const g = new THREE.Group(); g.position.set(SX, 0, (SZ1 + SZ2) / 2); root.add(g);
    const n = 14, rise = F2 / n, run = SD / n;
    for (let i = 1; i < n; i++) { const h = rise * i, z = SD / 2 - (i + 0.5) * run; box(g, SW, h, run, i % 2 ? plank : darkWood, 0, h / 2, z); box(g, SW, 0.03, 0.05, trim, 0, h + 0.015, z - run / 2 + 0.025); }
    const rail = box(g, 0.12, 0.12, SD + 0.3, trim, -SW / 2 - 0.08, 2.1, 0); rail.rotation.x = -0.695;
    for (let i = 0; i < 6; i++) cyl(g, 0.05, 0.05, 1.1, trim, -SW / 2 - 0.08, rise * (i * 2.4 + 1) + 0.55, SD / 2 - (i * 2.4 + 1) * run, 5);
  }
  // ── Floor 1 · Rizer Department ──
  const F = first.g;
  box(F, 7.2, 0.05, 4.6, rugRed, -1.2, 0.03, 1.4); box(F, 6, 0.06, 3.4, rugBlue, -1.2, 0.04, 1.4); // the star rug
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, s = box(F, 0.18, 0.02, 1.4, gold, -1.2 + Math.sin(a) * 0.7, 0.08, 1.4 + Math.cos(a) * 0.7); s.rotation.y = a; }
  // the counter, the Rizer merchant behind it, the banner above
  const counter = (g, x, z, w, fy) => { box(g, w, 1.05, 1.0, wood, x, fy + 0.52, z); box(g, w + 0.2, 0.12, 1.2, plank, x, fy + 1.1, z); box(g, 1.2, 0.9, 0.04, navy, x, fy + 0.55, z + 0.52); ball(g, 0.18, gold, x, fy + 0.62, z + 0.56, 8); };
  counter(F, -1.6, -4.2, 4.6, 0); solid(1, -1.6, -4.2, 2.4, 0.6, 1.2);
  const merchant = (g, x, z, fy, apron) => {
    const m = new THREE.Group(), cloth = mat(apron), skin = mat('#b9875f');
    cyl(m, 0.32, 0.42, 1.1, mat('#e8e2d6'), 0, 0.55, 0); cyl(m, 0.34, 0.44, 0.75, cloth, 0, 0.42, 0.02); cyl(m, 0.3, 0.32, 0.5, mat('#e8e2d6'), 0, 1.3, 0);
    ball(m, 0.23, skin, 0, 1.75, 0, 10); ball(m, 0.25, mat('#3b2418'), 0, 1.84, -0.04, 10);
    for (const sx of [-1, 1]) { const arm = cyl(m, 0.08, 0.08, 0.7, mat('#e8e2d6'), sx * 0.38, 1.2, 0.1); arm.rotation.x = -0.6; }
    m.position.set(x, fy, z); m.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(m); return m;
  };
  merchant(F, -1.6, -5.4, 0, '#26407e');
  box(F, 1.4, 2.2, 0.06, navy, -1.6, 2.6, -HALF_D + 0.22); ball(F, 0.35, gold, -1.6, 2.8, -HALF_D + 0.27, 8);
  // potion walls (west): shelves of glowing bottles
  const bottleCols = ['#e0393e', '#36c25a', '#3d7cff', '#b84bff', '#ffcf3a', '#3fe0d0'], bottles = bottleCols.map(c => glowMat(c, 0.9));
  for (const z of [-4.5, -1.5, 1.5]) {
    box(F, 0.5, 3.0, 2.6, wood, -HALF_W + 0.45, 1.5, z); solid(1, -HALF_W + 0.45, z, 0.35, 1.3);
    for (let s = 0; s < 4; s++) { box(F, 0.55, 0.06, 2.5, plank, -HALF_W + 0.72, 0.5 + s * 0.68, z); for (let k = 0; k < 6; k++) { const b = cyl(F, 0.08, 0.1, 0.24, bottles[(k + s + Math.round(z)) % bottles.length], -HALF_W + 0.8, 0.66 + s * 0.68, z - 1.05 + k * 0.42, 7); ball(F, 0.05, gold, b.position.x, b.position.y + 0.15, b.position.z, 6); } }
  }
  // hanging herbs and lanterns
  const herb = [mat('#5f8a3a'), mat('#9a3b2a'), mat('#b8a040')];
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 6), herb[i % 3]); c.position.set(-HALF_W + 1.2 + i * 1.4, WALL_H - 0.6, -HALF_D + 0.6 + (i % 2) * 0.3); c.rotation.x = Math.PI; F.add(c); }
  const lantern = (g, x, y, z) => { box(g, 0.32, 0.42, 0.32, darkWood, x, y, z); box(g, 0.22, 0.3, 0.22, glowMat('#ffc66a', 1.8), x, y, z); cyl(g, 0.02, 0.02, 0.5, trim, x, y + 0.45, z, 4); };
  for (const [x, z] of [[-6, -2], [3, -2], [-6, 4], [2, 4]]) lantern(F, x, WALL_H - 0.75, z);
  // weapon rack and gear shelf (east of the counter, west of the stairs)
  box(F, 2.4, 2.4, 0.3, wood, 3.2, 1.2, -HALF_D + 0.35); solid(1, 3.2, -HALF_D + 0.35, 1.3, 0.3);
  for (let i = 0; i < 4; i++) { box(F, 0.08, 1.6, 0.06, mat('#c9ccd4', 0.3, { metalness: 0.6 }), 2.3 + i * 0.6, 1.4, -HALF_D + 0.55); box(F, 0.3, 0.06, 0.08, gold, 2.3 + i * 0.6, 0.65, -HALF_D + 0.55); }
  box(F, 0.6, 2.2, 2.2, wood, 1.2, 1.1, 3.6); solid(1, 1.2, 3.6, 0.4, 1.2); // a gear shelf: boots and packs
  for (let s = 0; s < 3; s++) for (let k = 0; k < 3; k++) box(F, 0.35, 0.3, 0.45, mat(['#5a3a24', '#2c3a6a', '#6a2a2a'][(s + k) % 3]), 1.2, 0.35 + s * 0.7, 2.9 + k * 0.7);
  // crates and barrels by the entrance
  for (const [x, z] of [[-6.8, 5.6], [-5.6, 6.2], [5.2, 6.0]]) { box(F, 0.9, 0.8, 0.9, wood, x, 0.4, z); solid(1, x, z, 0.5, 0.5); }
  for (const [x, z] of [[-4.4, 6.4], [6.4, 5.0]]) { cyl(F, 0.42, 0.42, 1.0, plank, x, 0.5, z, 10); solid(1, x, z, 0.45, 0.45); }
  stations.push({ id: 'shop:rizer', name: 'Rizer Department · counter', dept: 'rizer', x: -1.6, z: -3.0, level: 1, r: 2.2 });

  // ── Floor 2 · Zyrex Department ──
  const S = second.g, fy = F2;
  box(S, 6.4, 0.05, 4.0, rugBlue, -2, fy + 0.03, 1.6); box(S, 5.2, 0.06, 3.0, rugRed, -2, fy + 0.04, 1.6);
  counter(S, 1.0, -4.6, 3.8, fy); solid(2, 1.0, -4.6, 2.0, 0.6, fy + 1.2);
  merchant(S, 1.0, -5.8, fy, '#1f5f8a');
  const blueOrb = glowMat('#4fa8ff', 1.6), deepOrb = glowMat('#2a6cff', 1.2), violetOrb = glowMat('#a46bff', 1.3);
  // the Zysphere display: shelves of spheres on gold stands (back-left and west wall)
  const sphereShelf = (x, z, ry, w) => {
    const g = new THREE.Group(); g.position.set(x, fy, z); g.rotation.y = ry; S.add(g);
    box(g, w, 3.0, 0.55, wood, 0, 1.5, 0);
    for (let s = 0; s < 3; s++) { box(g, w - 0.1, 0.07, 0.6, plank, 0, 0.55 + s * 0.85, 0.08); const n = Math.floor(w / 0.6);
      for (let k = 0; k < n; k++) { const xx = -w / 2 + 0.35 + k * ((w - 0.7) / Math.max(1, n - 1)); cyl(g, 0.12, 0.16, 0.12, gold, xx, 0.65 + s * 0.85, 0.12, 8); ball(g, 0.19, k % 3 === 2 ? violetOrb : k % 2 ? deepOrb : blueOrb, xx, 0.9 + s * 0.85, 0.12, 14); } }
    return g;
  };
  sphereShelf(-4.8, -HALF_D + 0.4, 0, 4.2); solid(2, -4.8, -HALF_D + 0.4, 2.1, 0.35);
  sphereShelf(-HALF_W + 0.4, -1.2, Math.PI / 2, 4.6); solid(2, -HALF_W + 0.4, -1.2, 0.35, 2.3);
  // the central sphere display
  { const g = new THREE.Group(); g.position.set(-2.4, fy, 1.6); S.add(g);
    cyl(g, 1.2, 1.35, 0.7, wood, 0, 0.35, 0, 12); cyl(g, 1.25, 1.25, 0.08, gold, 0, 0.72, 0, 16);
    ball(g, 0.62, blueOrb, 0, 1.5, 0, 20); for (const r of [0.75, 0.82]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 6, 32), gold); t.position.y = 1.5; t.rotation.x = r === 0.75 ? Math.PI / 2 : 0.6; g.add(t); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4; cyl(g, 0.12, 0.16, 0.3, gold, Math.sin(a) * 0.95, 0.88, Math.cos(a) * 0.95, 8); ball(g, 0.18, i % 2 ? deepOrb : violetOrb, Math.sin(a) * 0.95, 1.12, Math.cos(a) * 0.95, 12); }
    g.userData.spin = true; second.display = g; solid(2, -2.4, 1.6, 1.35, 1.35); }
  // Zyrex gear shelf (collars and harness rings) by the west wall, front
  box(S, 0.55, 2.6, 2.6, wood, -HALF_W + 0.4, fy + 1.3, 4.2); solid(2, -HALF_W + 0.4, 4.2, 0.35, 1.3);
  for (let s = 0; s < 3; s++) for (let k = 0; k < 3; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 6, 14), mat(['#3a5aa8', '#8a2a3a', '#c9a04a'][(s + k) % 3], 0.5)); t.position.set(-HALF_W + 0.75, fy + 0.6 + s * 0.75, 3.4 + k * 0.8); t.rotation.y = Math.PI / 2; S.add(t); }
  // the balcony rail round the stairwell
  box(S, 0.1, 1.0, SD, trim, FX0 - 0.05, fy + 0.5, (SZ1 + SZ2) / 2); box(S, FX1 - FX0, 1.0, 0.1, trim, (FX0 + FX1) / 2, fy + 0.5, SZ2 + 0.05);
  for (let i = 0; i < 6; i++) cyl(S, 0.05, 0.05, 1.0, trim, FX0 - 0.05, fy + 0.5, SZ1 + 0.4 + i * (SD - 0.8) / 5, 5);
  for (const [x, z] of [[-5, -2], [2, 0], [-5, 4]]) lantern(S, x, fy + WALL_H - 0.75, z);
  box(S, 1.4, 2.2, 0.06, navy, 1.0, fy + 2.6, -HALF_D + 0.22); { const t = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 8, 20), gold); t.position.set(1.0, fy + 2.8, -HALF_D + 0.27); S.add(t); }
  stations.push({ id: 'shop:zyrex', name: 'Zyrex Department · counter', dept: 'zyrex', x: 1.0, z: -3.4, level: 2, r: 2.2 });

  // ── physics: the floor, the flight, the walls, the counters and shelves, the rails ──
  let level = 1;
  const STEPS = 14, RUN = SD / STEPS, RISE = F2 / STEPS, EASE = 0.22, TOP_OPEN = 1.1;
  const inFlight = (x, z, m = 0) => x >= FX0 - m && x <= FX1 && z >= SZ1 - m && z <= SZ2 + m;
  const stairGround = (x, z) => {
    if (!inFlight(x, z)) return null;
    const u = THREE.MathUtils.clamp(SZ2 - z, 0, SD); let h = 0;
    for (let i = 1; i <= STEPS; i++) { const r = i * RUN; if (u > r - EASE) h += RISE * THREE.MathUtils.smoothstep(u, r - EASE, r + 0.02); }
    return h;
  };
  const floorY = () => level === 1 ? 0 : F2;
  const roomGround = (x, z) => stairGround(x, z) ?? floorY();
  const rails = [
    { x: FX0, z: (SZ1 + TOP_OPEN + SZ2) / 2, hw: 0.06, hd: (SD - TOP_OPEN) / 2 },                 // the flight's open side, all the way up
    { x: FX0, z: SZ1 + TOP_OPEN / 2, hw: 0.06, hd: TOP_OPEN / 2, maxY: F2 - 1.05 },                 // …except the top step, once he is high enough
    { x: (FX0 + FX1) / 2, z: SZ2, hw: (FX1 - FX0) / 2, hd: 0.06, minY: F2 / 2 }                     // upstairs: the stairwell's front rim
  ];
  const roomWorld = {
    bound: 100, waterAt: () => -Infinity, cameraMinDist: 0.15,
    heightAt: roomGround, groundAt: roomGround, surfaceAt: roomGround,
    stairPace: { stairWalkUp: 2 * RUN / 1.37, stairRunUp: 2 * RUN / 0.60, stairWalkDown: 2 * RUN / 0.93, stairRunDown: 2 * RUN / 0.40 },
    stairMotion(p, vel, running) { if (!inFlight(p.x, p.z, 0.2)) return null; if (vel.z < -0.15) return running ? 'stairRunUp' : 'stairWalkUp'; if (vel.z > 0.15) return running ? 'stairRunDown' : 'stairWalkDown'; return null; },
    rayClear(a, b) {
      const ray = b.clone().sub(a), total = ray.length(); if (total < 1e-4) return total;
      const onStairs = inFlight(a.x, a.z, 0.4), ceilingY = (level === 2 || onStairs ? F2 : 0) + 3.68;
      let clear = total;
      if (ray.y > 1e-5 && b.y > ceilingY && a.y < ceilingY) clear = Math.min(clear, Math.max(0.15, (ceilingY - a.y) / ray.y * total - 0.12));
      const horizontal = Math.hypot(ray.x, ray.z); if (horizontal < 1e-4) return clear;
      const dx = ray.x / horizontal, dz = ray.z / horizontal, m = 0.32; let edge = horizontal;
      if (dx > 1e-5) edge = Math.min(edge, (HALF_W - m - a.x) / dx); else if (dx < -1e-5) edge = Math.min(edge, (-HALF_W + m - a.x) / dx);
      if (dz > 1e-5) edge = Math.min(edge, (HALF_D - m - a.z) / dz); else if (dz < -1e-5) edge = Math.min(edge, (-HALF_D + m - a.z) / dz);
      return Math.min(clear, Math.max(0.15, edge - 0.12) * total / horizontal);
    },
    keepOnLand(p) { const ox = p.x, oz = p.z; p.x = THREE.MathUtils.clamp(p.x, -HALF_W + 0.8, HALF_W - 0.8); p.z = THREE.MathUtils.clamp(p.z, -HALF_D + 0.8, HALF_D - 0.8); return ox !== p.x || oz !== p.z; },
    resolve(p, radius) {
      let hit = false; const ox = p.x, oz = p.z;
      p.x = THREE.MathUtils.clamp(p.x, -HALF_W + radius, HALF_W - radius); p.z = THREE.MathUtils.clamp(p.z, -HALF_D + radius, HALF_D - radius); hit ||= ox !== p.x || oz !== p.z;
      for (const b of blockers[level]) {
        if (p.y > (b.top ?? Infinity) + 0.1) continue;
        const dx = p.x - b.x, dz = p.z - b.z, px = b.hw + radius - Math.abs(dx), pz = b.hd + radius - Math.abs(dz);
        if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx || 1) * px; else p.z += Math.sign(dz || 1) * pz; hit = true; }
      }
      for (const r of rails) {
        if (p.y < (r.minY ?? -Infinity) || p.y > (r.maxY ?? Infinity)) continue;
        const dx = p.x - r.x, dz = p.z - r.z, px = r.hw + radius - Math.abs(dx), pz = r.hd + radius - Math.abs(dz);
        if (px > 0 && pz > 0) { if (px < pz) p.x += Math.sign(dx || 1) * px; else p.z += Math.sign(dz || 1) * pz; hit = true; }
      }
      return hit;
    }
  };
  // anything between the camera and Rizer turns see-through while it is in the way (as in Rizer's Home)
  const _ray = new THREE.Raycaster(), _from = new THREE.Vector3(), _to = new THREE.Vector3(), faded = new Set();
  function fadeOccluders(cam, rizer) {
    const camera = cam?.cam; if (!camera || !root.visible) return;
    camera.getWorldPosition(_from); const hits = new Set();
    for (const up of [1.85, 1.3, 0.8]) {
      _to.copy(rizer.position); _to.y += up; const d = _from.distanceTo(_to); if (d < 0.05) continue;
      _ray.set(_from, _to.clone().sub(_from).normalize()); _ray.far = d - 0.45; _ray.camera = camera;
      for (const h of _ray.intersectObject(root, true)) if (h.object.isMesh) hits.add(h.object);
    }
    for (const m of hits) { if (!m.userData.fadeMat) { m.userData.baseMat = m.material; m.userData.fadeMat = m.material.clone(); m.userData.fadeMat.transparent = true; m.userData.fadeMat.depthWrite = false; m.userData.fadeMat.opacity = 0.18; } m.material = m.userData.fadeMat; faded.add(m); }
    for (const m of faded) if (!hits.has(m)) { m.material = m.userData.baseMat; faded.delete(m); }
  }
  // borrowed lights (game.js · lightIndoors): the room's lights become specs the town's lights take on
  const lightSpecs = [];
  root.updateMatrixWorld(true);
  root.traverse(o => { if (o.isPointLight) lightSpecs.push({ level: o.getWorldPosition(new THREE.Vector3()).y > 3.5 ? 2 : 1, pos: o.getWorldPosition(new THREE.Vector3()), color: o.color.clone(), intensity: o.intensity, distance: o.distance, decay: o.decay, o }); });
  for (const s of lightSpecs) { s.o.removeFromParent(); delete s.o; }
  lightSpecs.sort((a, b) => b.intensity - a.intensity);

  const entry = cell((COLS - 1) / 2, ROWS - 1.6, 0);
  function snap(rizer, cam, lv, at) {
    level = lv; second.g.visible = lv === 2; wellCover.visible = lv === 1;
    rizer.position.set(at.x, floorY(), at.z); rizer.vel.set(0, 0, 0); rizer.vy = 0; rizer.speed = 0; rizer.flying = false; rizer.onGround = true; rizer.attack = null;
    rizer.facing = at.facing ?? Math.PI; cam.yaw = rizer.facing + Math.PI; cam.focus.set(rizer.position.x, floorY() + 1.7, rizer.position.z);
  }
  return {
    ...STORE_INTERIOR, root, roomWorld, get level() { return level; }, get frontDoor() { return frontDoor; },
    lights: () => level === 2 ? [...lightSpecs.filter(s => s.level === 2), ...lightSpecs.filter(s => s.level === 1)] : lightSpecs.filter(s => s.level === 1),
    showAll(on) { if (on) { this._was = [second.g.visible, wellCover.visible]; second.g.visible = wellCover.visible = true; } else if (this._was) { [second.g.visible, wellCover.visible] = this._was; this._was = null; } },
    start: (rizer, cam, lv = 1) => snap(rizer, cam, lv, { x: entry.x, z: entry.z, facing: Math.PI }),
    show: v => { root.visible = !!v; },
    update(rizer, cam, onExit, toast, dt = 1 / 60) {
      fadeOccluders(cam, rizer);
      if (second.display) second.display.rotation.y += dt * 0.35;
      const P = rizer.position, onFlight = inFlight(P.x, P.z, 0.35);
      rizer.flying = false;
      const want = P.y > F2 / 2 ? 2 : 1;
      if (want !== level) { level = want; toast?.(level === 1 ? 'Malezor Town Store · Floor 1 · Rizer Department' : 'Malezor Town Store · Floor 2 · Zyrex Department'); }
      const ground = roomGround(P.x, P.z);
      if (P.y < ground) { P.y = ground; if (rizer.vy < 0) rizer.vy = 0; rizer.onGround = true; }
      const ceil = (onFlight || level === 2 ? F2 : 0) + 3.35;
      if (P.y > ceil) { P.y = ceil; if (rizer.vy > 0) rizer.vy = 0; }
      second.g.visible = level === 2 || (onFlight && P.y > 0.6);
      wellCover.visible = level === 1 && !onFlight;
    },
    nearDoor(p) { p = p.position || p; return level === 1 && p.z > HALF_D - 2.6 && Math.abs(p.x - (frontDoor ? frontDoor.position.x + 0.8 : 0)) < 1.7; },
    stationAt(p) { p = p.position || p; let best = null; for (const s of stations) { if (s.level !== level) continue; const d = Math.hypot(p.x - s.x, p.z - s.z); if (d < s.r && (!best || d < best.d)) best = { ...s, d }; } return best; },
    interact() { return null; },
    get stations() { return stations; }
  };
}
