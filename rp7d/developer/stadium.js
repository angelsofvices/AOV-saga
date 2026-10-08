// Gemlord Champion Stadium: every district has one, the arena where the Novarian Challenge is held
// (the qualifiers and the 9-year challenge). Malezor's is Rakoron's Stadium of Champions.
// Built after the references: a Colosseum-style elliptical amphitheatre in dark stone and crimson, with
// three arcades, an attic crowned with bone tusks, a beast-skull grand gate, and the Gemlord's crystal.
//
// Local space (front = +Z): the long axis runs front to back. Two gate tunnels (front = the grand gate
// under the Champions' box and the crystal, back = the town side) run straight through the stands into
// the arena. The arena floor is the (levelled) ground. The podium wall rings it; two stairs on the long
// sides climb onto the podium walk, and the stands rise from there as one walkable bowl (a smooth slope
// through the rows, so every row can be climbed) to the top gallery under the attic.
//
// `s.gem` tints the Gemlord's crystal and trim for other districts (Rakoron: ruby).
import * as THREE from 'three';
import { M, glow, bake } from './props.js';

export const STADIUM = {
  ax: 13, bz: 19,         // arena half-axes (x, z): 26 × 38 of open sand to fight on
  Ax: 27, Bz: 32,         // outer facade half-axes
  podium: 2.8,            // podium wall height (arena floor → first walk)
  top: 11.3,              // top gallery height
  attic: 17,              // attic crown
  gate: 5,                // gate blocks: |x| < gate at both ends of the long axis
  tunnel: 3, tunnelH: 5.2,
  tower: 6.2,             // the facade stops at |x| < tower (the gate towers stand there)
  rows: [[0.07, 0.45], [0.5, 0.88]], perTier: 6, // two tiers of stands (t = 0 arena edge → 1 facade)
  bays: 19,               // facade bays per side
  steps: 14, stairW: 3.2, stairL: 7 // arena stairs: 14 steps of 0.2 (each one a real step underfoot)
};

export function championStadium(p, s = {}) {
  const S = STADIUM, DS = THREE.DoubleSide, gemCol = s.gem || '#ff1f3d';
  const gem = gemCol === '#ff1f3d' ? glow.ruby : M(gemCol, 0.2, { emissive: new THREE.Color(gemCol), emissiveIntensity: 1 });
  const mat = {
    stone: M('#5a4d46', 0.92, { side: DS }), dark: M('#3b322e', 0.95, { side: DS }), light: M('#776a5f', 0.9, { side: DS }),
    red: M('#7c1d22', 0.8), cloth: M('#8e1c24', 0.95, { side: DS }), bone: M('#d9ccb1', 0.85), gold: M('#c9a14a', 0.35, { metalness: 0.6 }),
    iron: M('#2b2626', 0.6, { metalness: 0.4 }), sand: M('#c8a57a', 1), sandDark: M('#a8855e', 1), void: M('#140e0d', 1, { side: DS }),
    seatA: M('#6f635a', 0.95, { side: DS }), seatB: M('#645950', 0.95, { side: DS }), seatRed: M('#7a2227', 0.9, { side: DS })
  };
  // ── ribbons around the ellipse family: t = 0 arena edge … 1 facade (t may run a little past either end) ──
  const acc = new Map();
  const tri = (m, a, b, c) => { let arr = acc.get(m); if (!arr) acc.set(m, arr = []); arr.push(...a, ...b, ...c); };
  const quad = (m, a, b, c, d) => { tri(m, a, b, c); tri(m, a, c, d); };
  const E = t => [S.ax + (S.Ax - S.ax) * t, S.bz + (S.Bz - S.bz) * t];
  const P = (t, phi, y) => { const [a, b] = E(t); return [a * Math.sin(phi), y, b * Math.cos(phi)]; };
  const normal = (t, phi) => { const [a, b] = E(t), nx = b * Math.sin(phi), nz = a * Math.cos(phi), l = Math.hypot(nx, nz); return [nx / l, nz / l]; };
  const gapPhi = (t, G) => G <= 0 ? 0 : Math.asin(Math.min(1, G / E(t)[0]));
  // the band between ring (tA, yA) and ring (tB, yB), both long sides, leaving out |x| < G at both ends
  function ring(m, tA, yA, tB, yB, G = 0, n = 44) {
    const gA = gapPhi(tA, G), gB = gapPhi(tB, G);
    for (const side of [0, 1]) for (let i = 0; i < n; i++) {
      const fA = u => side * Math.PI + gA + u * (Math.PI - 2 * gA), fB = u => side * Math.PI + gB + u * (Math.PI - 2 * gB), u0 = i / n, u1 = (i + 1) / n;
      quad(m, P(tA, fA(u0), yA), P(tA, fA(u1), yA), P(tB, fB(u1), yB), P(tB, fB(u0), yB));
    }
  }
  // points around one ring at even steps between the gaps (bay layout)
  const bayPhi = (t, G, n, u, side) => { const g = gapPhi(t, G); return side * Math.PI + g + u * (Math.PI - 2 * g); };
  // Collision is a 2.5D mass grid (massgrid.js): anything standing on the gate roofs right over a tunnel would close
  // the tunnel below it, so those pieces go in `deco`, merged separately and left out of collision.
  const deco = new THREE.Group(); let into = p;
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; into.add(o); return o; };
  const box = (w, h, d, m, x, y, z, ry = 0) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, ry);

  // ── the arena ──
  const floor = new THREE.CircleGeometry(1, 72); floor.rotateX(-Math.PI / 2); floor.scale(S.ax + 0.1, 1, S.bz + 0.1); add(floor, mat.sand, 0, 0.04, 0);
  const rim = new THREE.RingGeometry(0.9, 0.995, 72); rim.rotateX(-Math.PI / 2); rim.scale(S.ax, 1, S.bz); add(rim, mat.sandDark, 0, 0.05, 0);
  const ring1 = new THREE.RingGeometry(5.2, 5.6, 64); ring1.rotateX(-Math.PI / 2); add(ring1, mat.red, 0, 0.055, 0);
  add(new THREE.CylinderGeometry(3.4, 3.55, 0.24, 40), mat.light, 0, 0.12, 0);        // the champions' dais (low enough to step on)
  const inlay = new THREE.RingGeometry(2.5, 2.8, 40); inlay.rotateX(-Math.PI / 2); add(inlay, mat.gold, 0, 0.245, 0);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, ray = new THREE.BoxGeometry(0.22, 0.02, 1.9); add(ray, mat.red, Math.sin(a) * 3.9, 0.06, Math.cos(a) * 3.9, a); }
  for (const [x, z, sc, h] of [[0, 0, 1, 2.2], [0.55, 0.25, 0.6, 1.3], [-0.5, 0.3, 0.55, 1.1], [0.1, -0.55, 0.6, 1.4]]) { const c = add(new THREE.OctahedronGeometry(0.45 * sc, 0), gem, x, 0.24 + h * 0.5, z); c.scale.y = h / (0.9 * sc); } // the Gemlord's crystal at the centre

  // ── podium wall, stands, gallery, attic (inside) ──
  const G = S.gate, P0 = S.podium, NR = S.perTier, rise = (S.top - P0) / (NR * 2);
  ring(mat.stone, 0, 0, 0, P0, G);
  ring(mat.red, -0.006, P0 - 0.75, -0.006, P0 - 0.25, G); ring(mat.red, 0, P0 - 0.75, -0.006, P0 - 0.75, G); ring(mat.red, 0, P0 - 0.25, -0.006, P0 - 0.25, G); // crimson band round the arena
  ring(mat.light, 0, P0, S.rows[0][0], P0, G);           // podium walk
  // walkable profile: flat walks, then a line through the middle of every row (see world.surfaceAt 'bowl')
  const DT = (S.rows[0][1] - S.rows[0][0]) / NR, prof = [[0.02, P0], [S.rows[0][0] - DT * 0.5, P0]];
  let y = P0;
  S.rows.forEach(([t0, t1], tier) => {
    const dt = (t1 - t0) / NR;
    for (let k = 0; k < NR; k++) {
      const a = t0 + k * dt, b = a + dt, y1 = y + rise, row = tier * NR + k;
      const seat = row < 2 ? mat.seatRed : row % 2 ? mat.seatA : mat.seatB;
      ring(mat.stone, a, y, a, y1, G); ring(seat, a, y1, b, y1, G);
      prof.push([a + dt * 0.5, y1 - 0.03]); y = y1;
    }
    if (tier === 0) { ring(mat.light, t1, y, S.rows[1][0], y, G); prof.push([S.rows[1][0] - DT * 0.5, y]); } // the walk between the tiers
  });
  ring(mat.light, S.rows[1][1], y, 0.94, y, G); prof.push([S.rows[1][1] + DT * 0.5, y], [0.94, y]); // top gallery
  ring(mat.stone, 0.94, y, 0.94, S.attic, G);            // attic wall behind the gallery
  for (let i = 0; i < 2; i++) for (let k = 0; k < S.bays; k++) { // small dark doorways along the gallery
    const u = (k + 0.5) / S.bays, phi = bayPhi(0.94, G + 1, S.bays, u, i), [nx, nz] = normal(0.94, phi), [x, , z] = P(0.94, phi, 0);
    box(1.1, 2.1, 0.08, mat.void, x - nx * 0.03, y + 1.05, z - nz * 0.03, Math.atan2(nx, nz));
  }
  ring(mat.dark, 0.94, S.attic, 1.0, S.attic, G);        // attic crown

  // ── outer facade: plinth, three arcades, attic windows, cornices ──
  const T = S.tower, tiers = [0.8, 5.3, 9.8, 14.3];
  ring(mat.stone, 1, 0, 1, S.attic, T);
  ring(mat.dark, 1.03, 0, 1.03, 0.8, T); ring(mat.dark, 1, 0.8, 1.03, 0.8, T);
  for (const cy of tiers.slice(1)) { ring(mat.light, 1.018, cy - 0.35, 1.018, cy, T); ring(mat.light, 1, cy, 1.018, cy, T); ring(mat.light, 1, cy - 0.35, 1.018, cy - 0.35, T); }
  ring(mat.light, 1.018, S.attic - 0.3, 1.018, S.attic + 0.2, T); ring(mat.light, 0.99, S.attic + 0.2, 1.018, S.attic + 0.2, T);
  const archShape = (w, h) => { const sh = new THREE.Shape(), r = w / 2; sh.moveTo(-r, 0); sh.lineTo(r, 0); sh.lineTo(r, h - r); sh.absarc(0, h - r, r, 0, Math.PI, false); sh.lineTo(-r, 0); return new THREE.ShapeGeometry(sh, 8); };
  const arch = archShape(2.3, 3.4), archFrame = archShape(2.8, 3.75), win = new THREE.PlaneGeometry(0.9, 0.9);
  for (let side = 0; side < 2; side++) for (let k = 0; k < S.bays; k++) {
    const phi = bayPhi(1, T, S.bays, (k + 0.5) / S.bays, side), [nx, nz] = normal(1, phi), [x, , z] = P(1, phi, 0), ry = Math.atan2(nx, nz);
    for (let tr = 0; tr < 3; tr++) {
      const base = tiers[tr] + 0.35, glowy = tr > 0 && (k + tr) % 2 === 0;
      add(archFrame, mat.light, x + nx * 0.03, base - 0.05, z + nz * 0.03, ry);
      add(arch, glowy ? glow.ember : mat.void, x + nx * 0.06, base, z + nz * 0.06, ry);
    }
    if (k % 2 === 0) add(win, mat.void, x + nx * 0.04, 15.6, z + nz * 0.04, ry);
  }
  for (let side = 0; side < 2; side++) for (let k = 0; k <= S.bays; k++) { // half-columns between the bays, tusks along the crown
    const phi = bayPhi(1, T, S.bays, k / S.bays, side), [nx, nz] = normal(1, phi), [x, , z] = P(1, phi, 0), ry = Math.atan2(nx, nz);
    for (let tr = 0; tr < 3; tr++) box(0.5, 4.15, 0.34, tr === 0 ? mat.stone : mat.light, x + nx * 0.17, tiers[tr] + 2.1, z + nz * 0.17, ry);
    box(0.45, 2.4, 0.25, mat.stone, x + nx * 0.12, 15.6, z + nz * 0.12, ry);
    const big = k % 2 === 0, [ix, , iz] = P(0.975, phi, 0);
    tusk(p, mat.bone, ix, S.attic + 0.15, iz, ry, big ? 3.4 : 2.2, big ? 0.42 : 0.3);
    if (k % 3 === 1 && k < S.bays) { // crimson banners down the upper arcades
      const g = new THREE.Group(); g.position.set(x + nx * 0.38, 0, z + nz * 0.38); g.rotation.y = ry; p.add(g);
      const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.3, 6.2, 0.06), mat.cloth); cloth.position.y = 10.9; g.add(cloth);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 0.14), mat.gold); bar.position.y = 14.05; g.add(bar);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.7, 3), mat.cloth); tip.position.y = 7.45; tip.rotation.set(Math.PI, 0, 0); tip.scale.z = 0.1; g.add(tip);
      const em = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), gem); em.position.set(0, 12.2, 0.06); em.scale.set(1, 1.5, 0.3); g.add(em);
    }
    if (k % 6 === 3) { // pennants on the crown
      const [fx, , fz] = P(0.97, phi, 0);
      add(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 6), mat.iron, fx, S.attic + 2.1, fz);
      box(1.6, 0.8, 0.05, mat.cloth, fx + Math.cos(ry) * 0.8, S.attic + 3.7, fz - Math.sin(ry) * 0.8, ry + Math.PI / 2);
    }
  }
  // inside: crimson banners on the podium wall, facing the arena
  for (let side = 0; side < 2; side++) for (let k = 0; k < 6; k++) {
    const phi = bayPhi(0, G + 2.5, 6, (k + 0.5) / 6, side), [nx, nz] = normal(0, phi), [x, , z] = P(0, phi, 0), ry = Math.atan2(-nx, -nz);
    if (Math.abs(z) < S.stairL / 2 + 3) continue; // not over the stairs
    box(1.0, 1.7, 0.05, mat.cloth, x - nx * 0.06, P0 - 1.2, z - nz * 0.06, ry);
    add(new THREE.OctahedronGeometry(0.2, 0), gem, x - nx * 0.1, P0 - 1.0, z - nz * 0.1).scale.set(1, 1.5, 0.3);
  }

  // ── stairs from the arena up to the podium walk (long sides) ──
  // Real steps underfoot ('stairs' surface: each tread is its own height, 0.2 a step), a wall along the arena side,
  // and a landing at the top level with the podium walk. Each step is a slab at its own height: a solid block
  // under the stairs would stand inside the walkable steps and the collision grid would read it as a wall.
  const surfaces = [], NS = S.steps, rs = P0 / NS, SL = S.stairL, sd = SL / NS, SW = S.stairW, xOut = S.ax, xIn = xOut - SW - 0.1;
  for (const sx of [-1, 1]) {
    const cx = sx * (xIn + SW / 2);
    into = deco; // the steps themselves stay out of the collision grid (their 'stairs' surface is what he walks on; the side wall below keeps him from walking under them)
    for (let i = 0; i < NS; i++) box(SW, rs, sd, i % 2 ? mat.light : mat.stone, cx, (i + 0.5) * rs, -SL / 2 + (i + 0.5) * sd);
    box(SW, rs, 2.2, mat.light, cx, P0 - rs / 2, SL / 2 + 1.1); into = p; // landing
    const sh = new THREE.Shape(); sh.moveTo(-SL / 2, 0); sh.lineTo(SL / 2 + 2.2, 0); sh.lineTo(SL / 2 + 2.2, P0 + 0.6); sh.lineTo(SL / 2, P0 + 0.6); sh.lineTo(-SL / 2, 0.6); sh.lineTo(-SL / 2, 0);
    const stringer = new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: false }); stringer.rotateY(-Math.PI / 2); // profile in (z, y), 0.35 thick along x
    add(stringer, mat.dark, sx * (xIn - 0.2) + 0.175, 0, 0); // side wall along the arena, following the steps up
    const x0 = xIn + 0.05, x1 = xOut + 0.5, scx = sx * (x0 + x1) / 2, shw = (x1 - x0) / 2;
    surfaces.push({ shape: 'stairs', x: scx, z: 0, hw: shw, hd: SL / 2, y: 0, h: P0, n: NS, localY: true, solid: true });
    surfaces.push({ shape: 'flat', x: scx, z: SL / 2 + 1.1, hw: shw, hd: 1.1, y: P0, localY: true });
  }

  // ── gates: tunnels through the stands, the Champions' box over the grand gate ──
  for (const side of [1, -1]) {
    const grand = side === 1, zIn = S.bz * Math.sqrt(1 - (G / S.ax) ** 2), zMid = zIn + 5.5, zOut = S.Bz + 1.2, H = grand ? 18.5 : 17, HA = 8.4, tw = S.tunnel;
    const piece = (x0, x1, y0, y1, z0, z1, m = mat.stone) => box(x1 - x0, y1 - y0, z1 - z0, m, (x0 + x1) / 2, (y0 + y1) / 2, side * (z0 + z1) / 2);
    for (const [z0, z1, h] of [[zIn, zMid, HA], [zMid, zOut, H]]) {
      piece(-G, -tw, 0, h, z0, z1); piece(tw, G, 0, h, z0, z1); piece(-tw, tw, S.tunnelH, h, z0, z1, mat.dark);
      piece(-G - 0.15, G + 0.15, h, h + 0.35, z0 - 0.15, z1 + 0.15, mat.light);
      into = deco; if (h > HA) for (let i = 0; i < 9; i++) { const x = -G + 0.35 + i * (2 * G - 0.7) / 8; piece(x - 0.3, x + 0.3, h + 0.35, h + 1.25, z1 - 0.45, z1 + 0.15); } // merlons along the gate's outer edge
      into = p;
      if (h > HA) for (let i = 1; i < 7; i++) { const z = z0 + i * (z1 - z0) / 7; for (const sx of [-1, 1]) piece(sx > 0 ? G - 0.6 : -G, sx > 0 ? G : -G + 0.6, h + 0.35, h + 1.25, z - 0.3, z + 0.3); } // and along its sides
    }
    piece(-tw, tw, 0, 0.05, zIn, zOut, mat.dark);                                // tunnel paving
    piece(-tw - 0.5, -tw, 0, S.tunnelH + 0.6, zIn - 0.3, zIn, mat.light); piece(tw, tw + 0.5, 0, S.tunnelH + 0.6, zIn - 0.3, zIn, mat.light); piece(-tw - 0.5, tw + 0.5, S.tunnelH, S.tunnelH + 0.6, zIn - 0.3, zIn, mat.light); // arena mouth frame
    piece(-tw - 0.6, -tw, 0, S.tunnelH + 0.8, zOut, zOut + 0.35, mat.light); piece(tw, tw + 0.6, 0, S.tunnelH + 0.8, zOut, zOut + 0.35, mat.light); piece(-tw - 0.6, tw + 0.6, S.tunnelH, S.tunnelH + 0.8, zOut, zOut + 0.35, mat.light); // outer mouth frame
    for (let i = -2; i <= 2; i++) box(0.12, 1.2, 0.12, mat.iron, i * 1.2, S.tunnelH - 0.6, side * (zOut + 0.2)); // raised portcullis teeth
    into = deco; piece(-G, G, HA + 0.35, HA + 1.25, zIn, zIn + 0.4, mat.light); into = p; // box parapet over the arena
    surfaces.push({ shape: 'flat', x: 0, z: side * (zIn + zMid) / 2, hw: G, hd: (zMid - zIn) / 2, y: HA + 0.35, localY: true, open: true }); // open: a roof you can stand under (the tunnel), so the camera isn't held above it
    surfaces.push({ shape: 'flat', x: 0, z: side * (zMid + zOut) / 2, hw: G, hd: (zOut - zMid) / 2, y: H + 0.35, localY: true, open: true });
    for (const sx of [-1, 1]) { // gate towers
      const tx = sx * (T + 0.6), tz = side * (S.Bz + 0.2), th = grand ? 22 : 19;
      add(new THREE.CylinderGeometry(2.0, 2.3, th, 8), mat.stone, tx, th / 2, tz).rotation.y = Math.PI / 8;
      for (const by of [5.3, 9.8, 14.3, th]) add(new THREE.CylinderGeometry(2.4, 2.4, 0.4, 8), mat.light, tx, by, tz).rotation.y = Math.PI / 8;
      add(new THREE.ConeGeometry(2.6, 6, 8), mat.dark, tx, th + 3.2, tz).rotation.y = Math.PI / 8;
      add(new THREE.OctahedronGeometry(0.45, 0), gem, tx, th + 6.6, tz).scale.y = 1.8;
      for (const wy of [7, 11.5, 16]) box(0.8, 1.6, 0.1, glow.ember, tx + sx * 0.3, wy, tz + side * 2.05);
      tusk(p, mat.bone, tx, th + 0.2, tz + side * 1.2, grand ? 0 : Math.PI, 3.6, 0.45);
    }
    // beast skull over the outer mouth, fangs round the opening
    const sk = new THREE.Group(); sk.position.set(0, S.tunnelH + 3.1, side * (zOut + 0.6)); sk.rotation.y = grand ? 0 : Math.PI; p.add(sk);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 10), mat.bone); skull.scale.set(1.25, 0.95, 0.9); sk.add(skull);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 2.2), mat.bone); snout.position.set(0, -0.9, 1.4); snout.rotation.x = 0.25; sk.add(snout);
    for (const ex of [-0.95, 0.95]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), gem); e.position.set(ex, 0.3, 1.75); e.scale.z = 0.5; sk.add(e); tusk(sk, mat.bone, ex * 1.6, 0.9, 0.2, ex > 0 ? -Math.PI / 2 : Math.PI / 2, 3.6, 0.5); }
    for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.2, 6), mat.bone); f.position.set(-2.5 + i, -1.9 - (i === 0 || i === 5 ? 0 : 0.25), 1.9); f.rotation.x = Math.PI; sk.add(f); }
    if (grand) { // the Champions' box: canopy and throne; the Gemlord's crystal above the gate
      for (const [x, z] of [[-4.4, zIn + 0.7], [4.4, zIn + 0.7], [-4.4, zMid - 0.5], [4.4, zMid - 0.5]]) box(0.3, 3.2, 0.3, mat.gold, x, HA + 0.35 + 1.6, z);
      box(10.6, 0.3, 5.8, mat.red, 0, HA + 3.75, (zIn + zMid) / 2);
      into = deco; box(1.6, 2.4, 1.1, mat.red, 0, HA + 1.55, zMid - 1.1); box(1.8, 0.25, 1.3, mat.gold, 0, HA + 2.8, zMid - 1.1);
      add(new THREE.ConeGeometry(1.4, 4.5, 6), mat.iron, 0, H + 2.6, (zMid + zOut) / 2); into = p;
      const crystal = add(new THREE.OctahedronGeometry(2.1, 0), gem, 0, H + 8.4, (zMid + zOut) / 2); crystal.scale.set(1, 2.1, 1);
      crystal.userData.keep = true; crystal.userData.spin = 0.35; // turns slowly over the stadium
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, c = add(new THREE.OctahedronGeometry(0.55, 0), gem, Math.sin(a) * 1.3, H + 5.1, (zMid + zOut) / 2 + Math.cos(a) * 1.3); c.scale.y = 1.9; c.rotation.z = Math.sin(a) * 0.4; c.rotation.x = Math.cos(a) * 0.4; }
    }
  }

  // ── build the ribbons ──
  for (const [m, arr] of acc) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); g.computeVertexNormals(); add(g, m, 0, 0, 0); }
  p.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const decoBaked = bake(deco); decoBaked.userData.keep = true; decoBaked.userData.noCollide = true; p.add(decoBaked);

  // The stands as one walkable bowl (world.surfaceAt 'bowl'); the gate tunnels are cut out of it.
  surfaces.push({ shape: 'bowl', x: 0, z: 0, y: 0, localY: true, ax: S.ax, bz: S.bz, Ax: S.Ax, Bz: S.Bz, gap: G - 0.4, prof, radius: S.Bz + 1 });
  surfaces.push({ shape: 'circle', x: 0, z: 0, radius: 3.4, y: 0.24, localY: true });
  return { colliders: [], surfaces, mapShape: { ax: S.Ax, bz: S.Bz, inAx: S.ax, inBz: S.bz } };
}

// A curved, tapering tusk / horn: base at (x, y, z), sweeping up and out along the local +Z of `ry`.
function tusk(parent, m, x, y, z, ry, len = 3, r = 0.4) {
  const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, len * 0.42, len * 0.12), new THREE.Vector3(0, len * 0.78, len * 0.38), new THREE.Vector3(0, len, len * 0.78)]);
  const seg = 12, rad = 6, g = new THREE.TubeGeometry(c, seg, r, rad, false), pos = g.attributes.position;
  for (let k = 0; k < pos.count; k++) { const u = Math.floor(k / (rad + 1)) / seg, q = c.getPoint(Math.min(u, 1)), f = Math.max(0.05, 1 - u * 0.95); pos.setXYZ(k, q.x + (pos.getX(k) - q.x) * f, q.y + (pos.getY(k) - q.y) * f, q.z + (pos.getZ(k) - q.z) * f); }
  g.computeVertexNormals();
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.rotation.y = ry; parent.add(o); return o;
}
