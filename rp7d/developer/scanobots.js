// Scanobots: Malezor's utility drones, turned hostile. A bronze sphere hull with a blue front lens, two
// crystal antennas, two articulated claw arms and a blue thruster crystal it hovers on (~0.45× Rizer's height).
// Each one drifts a small patrol loop; when it sees Rizer it closes in, keeps a little distance, charges its
// lens and fires a slow scan bolt (dodgeable), or swipes with its claws when he's right on it.
// Rizer's blows land by contact (hitbox.js, the same striker capsules and contact windows as against Seers),
// and Astralstrike bolts and Pearlbow arrows hit them too (astral.js / pearlbow.js take `bodies`).
//
// Defeated, a Scanobot drops one Portalchip on the ground where it was: a small glowing chip lying in the
// world (picked up with ○ / E through the usual loot path in game.js → collectChip). One drone = one chip,
// dropped exactly once. The wreck sinks away and a fresh drone comes back on the same loop later.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp, damp, dampAngle, rng } from './util.js';
import { touch, STRIKERS, HITBOX } from './hitbox.js';
import { COMBAT, BLADES } from './rizer.js';
import { quarterAt, districtAt } from './world-data.js';

export const SCANOBOT = {
  name: 'Scanobot', key: 'scanobot', hp: 7,
  scale: 0.95,               // model units → world (the whole drone ≈ 1.05 tall: ~0.47× Rizer)
  hover: 1.2,                // hull centre above the ground (chest-high on Rizer: fists and kicks both reach it)
  radius: 0.4,               // hurt sphere (hull + arms) around the hull centre
  count: 14, spacing: 20,    // how many loops, and how far apart
  homeMin: 48, homeMax: 175, // distance band from Rizer's home (the town stays drone-free)
  loop: [3.5, 7],            // patrol loop radius
  patrol: 1.5, chase: 4.4, accel: 5,
  sight: 15, sense: 3.2, cone: 1.25, loseAfter: 5, leash: 34, callRadius: 12,
  standoff: [3.4, 6.2],      // keeps this far off while it lines up a shot
  zap: { range: 9, windup: 0.75, damage: 4, speed: 12.5, life: 1.5, r: 0.13 },
  claw: { range: 1.55, windup: 0.42, swipe: 0.3, damage: 5 },
  cooldown: [1.5, 2.6],
  respawn: 60, respawnDist: 35,
  active: 80, visible: 95
};
const rand = ([a, b]) => a + Math.random() * (b - a);

// ── materials and shared geometry (built once; every drone shares them except its own hull/lens) ──
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// Hull panels: bronze with dark seams and rivets (equirectangular, wraps the sphere).
const hullTex = () => canvasTex(512, 256, (g, w, h) => {
  const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#e2c9a2'); grd.addColorStop(0.5, '#c9a77c'); grd.addColorStop(1, '#8f6e4b');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(52,34,20,.75)'; g.lineWidth = 3;
  for (const y of [0.22, 0.38, 0.62, 0.78]) { g.beginPath(); g.moveTo(0, y * h); g.lineTo(w, y * h); g.stroke(); }
  for (let i = 0; i < 8; i++) { const x = (i + 0.5) / 8 * w; g.beginPath(); g.moveTo(x, 0.22 * h); g.lineTo(x, 0.38 * h); g.moveTo(x + w / 16, 0.62 * h); g.lineTo(x + w / 16, 0.78 * h); g.stroke(); }
  g.fillStyle = 'rgba(70,46,26,.85)';
  for (const y of [0.25, 0.35, 0.65, 0.75]) for (let i = 0; i < 32; i++) { g.beginPath(); g.arc((i + 0.5) / 32 * w, y * h, 2.2, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(255,240,210,.18)'; g.fillRect(0, 0.06 * h, w, 0.05 * h); // sheen band
});
// Front lens: deep blue glass with a bright four-point star (the scanner core).
const lensTex = () => canvasTex(128, 128, (g, w) => {
  const c = w / 2, rg = g.createRadialGradient(c, c, 2, c, c, c);
  rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.18, '#9fd2ff'); rg.addColorStop(0.45, '#2f7dff'); rg.addColorStop(0.8, '#0d2a8a'); rg.addColorStop(1, '#061444');
  g.fillStyle = rg; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(235,248,255,.95)';
  for (const [a, l, wd] of [[0, 56, 7], [Math.PI / 2, 56, 7], [Math.PI / 4, 30, 4], [-Math.PI / 4, 30, 4]]) {
    g.save(); g.translate(c, c); g.rotate(a); g.beginPath(); g.moveTo(-l, 0); g.lineTo(0, -wd); g.lineTo(l, 0); g.lineTo(0, wd); g.closePath(); g.fill(); g.restore();
  }
});
const glowTex = () => canvasTex(64, 64, (g, w) => {
  const c = w / 2, rg = g.createRadialGradient(c, c, 0, c, c, c);
  rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.25, 'rgba(150,205,255,.85)'); rg.addColorStop(0.6, 'rgba(60,130,255,.25)'); rg.addColorStop(1, 'rgba(40,90,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, w, w);
});
// Portalchip faces: the portal display (front) and the circuit board.
const CHIP_BLUE = ['#04123a', 'rgba(80,160,255,.45)', '#0a1b6a', '#2c6cff', '#8fd0ff', 'rgba(60,140,255,0)', '#cfeaff', '#6fb4ff'];
const CHIP_PURPLE = ['#1a0638', 'rgba(190,110,255,.45)', '#2a0a6a', '#9a3cff', '#e0a8ff', 'rgba(170,80,255,0)', '#f3dcff', '#c98bff']; // the ×3 chip
const chipScreenTex = (K = CHIP_BLUE) => canvasTex(128, 128, (g, w) => {
  g.fillStyle = K[0]; g.fillRect(0, 0, w, w);
  g.strokeStyle = K[1]; g.lineWidth = 1;
  for (let i = 8; i < w; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, w); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
  const rg = g.createRadialGradient(64, 60, 4, 64, 60, 40); rg.addColorStop(0, K[2]); rg.addColorStop(0.55, K[3]); rg.addColorStop(0.8, K[4]); rg.addColorStop(1, K[5]);
  g.fillStyle = rg; g.beginPath(); g.ellipse(64, 60, 30, 40, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = K[6]; g.lineWidth = 3; g.beginPath(); g.ellipse(64, 60, 26, 36, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = K[7]; g.lineWidth = 2; g.strokeRect(30, 98, 68, 14); g.strokeRect(10, 10, 20, 14); g.strokeRect(98, 10, 20, 14);
});
const chipBoardTex = () => canvasTex(128, 128, (g, w) => {
  g.fillStyle = '#0d2b63'; g.fillRect(0, 0, w, w);
  g.strokeStyle = '#3d7fd6'; g.lineWidth = 2;
  for (let i = 0; i < 9; i++) { const y = 10 + i * 13; g.beginPath(); g.moveTo(6, y); g.lineTo(40, y); g.lineTo(52, y + 8); g.lineTo(122, y + 8); g.stroke(); }
  g.fillStyle = '#e1aa3c'; for (let i = 0; i < 14; i++) { g.fillRect(4 + i * 9, 2, 5, 6); g.fillRect(4 + i * 9, w - 8, 5, 6); }
});

let SHARED = null;
function shared() {
  if (SHARED) return SHARED;
  const M = {
    hull: new THREE.MeshStandardMaterial({ color: '#ffffff', map: hullTex(), metalness: 0.35, roughness: 0.42, emissive: '#000000' }), // (no env map in Malezor: low metalness keeps the bronze readable)
    bronze: new THREE.MeshStandardMaterial({ color: '#9a7048', metalness: 0.45, roughness: 0.42 }),
    gold: new THREE.MeshStandardMaterial({ color: '#e0a844', metalness: 0.55, roughness: 0.3, emissive: '#5a3800', emissiveIntensity: 0.45 }),
    dark: new THREE.MeshStandardMaterial({ color: '#30303a', metalness: 0.6, roughness: 0.5 }),
    lensDark: new THREE.MeshStandardMaterial({ color: '#0b1640', metalness: 0.3, roughness: 0.15 }),
    lens: new THREE.MeshBasicMaterial({ map: lensTex(), color: new THREE.Color('#ffffff').multiplyScalar(1.6), toneMapped: false }),
    crystal: new THREE.MeshStandardMaterial({ color: '#2f7dff', emissive: '#1f6bff', emissiveIntensity: 2.3, metalness: 0.1, roughness: 0.12 }),
    port: new THREE.MeshBasicMaterial({ color: new THREE.Color('#4aa0ff').multiplyScalar(1.8), toneMapped: false }),
    thrust: new THREE.MeshBasicMaterial({ color: new THREE.Color('#7cc6ff').multiplyScalar(2.2), toneMapped: false }),
    flame: new THREE.MeshBasicMaterial({ color: new THREE.Color('#3f8cff').multiplyScalar(1.6), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
    glow: new THREE.SpriteMaterial({ map: glowTex(), color: '#6fb8ff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    zap: new THREE.MeshBasicMaterial({ color: new THREE.Color('#bfe6ff').multiplyScalar(3), toneMapped: false }),
    // Portalchip
    pcb: new THREE.MeshStandardMaterial({ color: '#ffffff', map: chipBoardTex(), metalness: 0.35, roughness: 0.5 }),
    screen: new THREE.MeshBasicMaterial({ map: chipScreenTex(), color: new THREE.Color('#ffffff').multiplyScalar(1.35), toneMapped: false }),
    pins: new THREE.MeshStandardMaterial({ color: '#e7b041', metalness: 0.9, roughness: 0.25, emissive: '#4a3000', emissiveIntensity: 0.4 }),
    chipGlow: null,
    ring: new THREE.MeshBasicMaterial({ color: new THREE.Color('#5aa8ff').multiplyScalar(1.5), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })
  };
  // 8-point gold sun (top emblem), flat
  const sun = new THREE.Shape(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 0.04 : 0.085; i ? sun.lineTo(Math.sin(a) * r, Math.cos(a) * r) : sun.moveTo(Math.sin(a) * r, Math.cos(a) * r); }
  const sunGeo = new THREE.ExtrudeGeometry(sun, { depth: 0.014, bevelEnabled: false }); sunGeo.rotateX(-Math.PI / 2);
  // claw: three curved fingers around the wrist, merged
  const fingers = [];
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2, f = new THREE.ConeGeometry(0.024, 0.12, 6); f.translate(0, -0.06, 0);
    f.rotateX(0.5); f.rotateY(a); f.translate(Math.sin(a) * 0.025, -0.02, Math.cos(a) * 0.025); fingers.push(f);
  }
  const G = {
    hull: new THREE.SphereGeometry(0.27, 32, 22), band: new THREE.TorusGeometry(0.272, 0.02, 8, 48), cap: new THREE.CylinderGeometry(0.16, 0.11, 0.07, 24),
    housing: new THREE.CylinderGeometry(0.15, 0.165, 0.07, 32), bezel: new THREE.TorusGeometry(0.128, 0.026, 10, 36), lensDisc: new THREE.CircleGeometry(0.122, 32), lensCore: new THREE.CircleGeometry(0.106, 32),
    rim: new THREE.TorusGeometry(0.165, 0.012, 6, 36),
    port: new THREE.CylinderGeometry(0.07, 0.08, 0.05, 20), portLight: new THREE.CircleGeometry(0.04, 16),
    sun: sunGeo, sunCore: new THREE.SphereGeometry(0.022, 10, 8),
    collar: new THREE.CylinderGeometry(0.032, 0.04, 0.05, 12), rod: new THREE.CylinderGeometry(0.014, 0.017, 0.2, 8), crystal: new THREE.OctahedronGeometry(0.045, 0),
    joint: new THREE.SphereGeometry(0.05, 12, 10), elbow: new THREE.SphereGeometry(0.036, 10, 8), upper: new THREE.CylinderGeometry(0.03, 0.034, 0.15, 8), fore: new THREE.CylinderGeometry(0.027, 0.03, 0.13, 8),
    claw: mergeGeometries(fingers),
    thrHouse: new THREE.CylinderGeometry(0.09, 0.06, 0.06, 20), thrRing: new THREE.TorusGeometry(0.07, 0.014, 8, 24), thrCrystal: new THREE.OctahedronGeometry(0.065, 0), flame: new THREE.ConeGeometry(0.055, 0.32, 12, 1, true),
    zap: new THREE.SphereGeometry(1, 10, 8),
    // Portalchip, lying flat: X = width, Z = length (contacts at -Z), Y = thickness
    board: new THREE.BoxGeometry(0.05, 0.007, 0.072), screen: new THREE.PlaneGeometry(0.036, 0.034), module: new THREE.BoxGeometry(0.03, 0.006, 0.012),
    pins: mergeGeometries([0, 1, 2, 3].map(i => new THREE.BoxGeometry(0.008, 0.002, 0.014).translate(-0.0135 + i * 0.009, 0.0045, -0.03))),
    ring: new THREE.RingGeometry(0.15, 0.19, 40)
  };
  M.chipGlow = M.glow.clone(); M.chipGlow.opacity = 0.5;
  // the ×3 Portalchip (a Penumbra's drop): the same chip, larger, in purple
  M.screen3 = new THREE.MeshBasicMaterial({ map: chipScreenTex(CHIP_PURPLE), color: new THREE.Color('#ffffff').multiplyScalar(1.4), toneMapped: false });
  M.pcb3 = M.pcb.clone(); M.pcb3.color.set('#b98cff');
  M.chipGlow3 = M.chipGlow.clone(); M.chipGlow3.color.set('#b060ff'); M.chipGlow3.opacity = 0.6;
  M.ring3 = M.ring.clone(); M.ring3.color.copy(new THREE.Color('#b05cff').multiplyScalar(1.6));
  G.screen.rotateX(-Math.PI / 2); G.screen.translate(0, 0.0038, 0.004);
  G.ring.rotateX(-Math.PI / 2);
  G.flame.rotateX(Math.PI); // tip down
  return (SHARED = { M, G });
}

// One drone, facing +Z (its lens), origin at the hull centre.
function buildDrone() {
  const { M, G } = shared();
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const mesh = (geo, mat, parent = body) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; parent.add(m); return m; };
  const hullMat = M.hull.clone(), lensMat = M.lens.clone(); // own copies: the hit flash and the charge glow are per drone
  mesh(G.hull, hullMat);
  const band = mesh(G.band, M.gold); band.rotation.x = Math.PI / 2;
  const band2 = mesh(G.band, M.gold); band2.scale.setScalar(0.995); // meridian, side to side over the top
  band2.rotation.y = Math.PI / 2;
  const cap = mesh(G.cap, M.bronze); cap.position.y = -0.235;
  // front lens / scanner core
  const housing = mesh(G.housing, M.gold); housing.rotation.x = Math.PI / 2; housing.position.z = 0.25; // stands proud of the hull
  const disc = mesh(G.lensDisc, M.lensDark); disc.position.z = 0.287;
  const core = mesh(G.lensCore, lensMat); core.position.z = 0.29; core.castShadow = false;
  const bezel = mesh(G.bezel, M.gold); bezel.position.z = 0.29;
  const rim = mesh(G.rim, M.bronze); rim.position.z = 0.282;
  const lensGlow = new THREE.Sprite(M.glow.clone()); lensGlow.scale.setScalar(0.34); lensGlow.position.z = 0.32; body.add(lensGlow);
  // side ports
  for (const s of [-1, 1]) {
    const p = mesh(G.port, M.gold); p.rotation.z = Math.PI / 2; p.position.x = s * 0.255;
    const l = mesh(G.portLight, M.port); l.rotation.y = s * Math.PI / 2; l.position.x = s * 0.282; l.castShadow = false;
  }
  // top emblem
  const sun = mesh(G.sun, M.gold); sun.position.y = 0.262;
  const sc = mesh(G.sunCore, M.gold); sc.position.y = 0.282;
  // crystal antennas
  const antennas = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.12, 0.225, -0.03); a.rotation.z = -s * 0.36; a.rotation.x = -0.12; body.add(a);
    const col = mesh(G.collar, M.gold, a); col.position.y = 0.02;
    const rod = mesh(G.rod, M.bronze, a); rod.position.y = 0.14;
    const cr = mesh(G.crystal, M.crystal, a); cr.scale.set(1, 2.3, 1); cr.position.y = 0.34;
    antennas.push(a);
  }
  // articulated claw arms: shoulder → upper arm → elbow → forearm → claw
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.215, -0.1, 0.03); body.add(sh);
    mesh(G.joint, M.dark, sh);
    const up = mesh(G.upper, M.bronze, sh); up.position.y = -0.075;
    const el = new THREE.Group(); el.position.y = -0.15; sh.add(el);
    mesh(G.elbow, M.gold, el);
    const fo = mesh(G.fore, M.bronze, el); fo.position.y = -0.065;
    const cl = mesh(G.claw, M.gold, el); cl.position.y = -0.13;
    const wr = mesh(G.elbow, M.dark, el); wr.position.y = -0.125; wr.scale.setScalar(0.8);
    arms.push({ s, sh, el });
  }
  // thruster unit
  const th = mesh(G.thrHouse, M.gold); th.position.y = -0.285;
  const tr = mesh(G.thrRing, M.port); tr.rotation.x = Math.PI / 2; tr.position.y = -0.31; tr.castShadow = false;
  const tc = mesh(G.thrCrystal, M.thrust); tc.scale.set(1, 1.8, 1); tc.position.y = -0.4; tc.castShadow = false;
  const flame = mesh(G.flame, M.flame); flame.position.y = -0.5; flame.castShadow = false;
  const thrGlow = new THREE.Sprite(M.glow); thrGlow.scale.setScalar(0.42); thrGlow.position.y = -0.42; body.add(thrGlow);
  root.scale.setScalar(SCANOBOT.scale);
  return { root, body, hullMat, lensMat, lensGlow, antennas, arms, flame, thrGlow, tc };
}

// The Portalchip lying in the world: a small blue circuit board with gold contacts and a portal display.
function buildChip(value = 1) {
  const { M: M0, G } = shared(), big = value >= 3, size = big ? 2.3 : 1;
  const M = big ? { ...M0, screen: M0.screen3, pcb: M0.pcb3, chipGlow: M0.chipGlow3, ring: M0.ring3 } : M0;
  const root = new THREE.Group(), chip = new THREE.Group(), tilt = new THREE.Group(); root.add(chip); chip.add(tilt);
  const board = new THREE.Mesh(G.board, M.pcb); tilt.add(board);
  const screen = new THREE.Mesh(G.screen, M.screen); tilt.add(screen);
  const mod = new THREE.Mesh(G.module, M.pins); mod.position.set(0, 0.006, 0.028); tilt.add(mod);
  const pins = new THREE.Mesh(G.pins, M.pins); tilt.add(pins);
  tilt.traverse(o => { if (o.isMesh) o.castShadow = true; });
  tilt.rotation.x = -1.1; // stood up like a card, display outward, while it turns on the spot
  chip.scale.setScalar(1.2 * size); // ≈ 7 cm long next to Rizer: USB-drive sized (the ×3 chip is a good deal larger)
  const glow = new THREE.Sprite(M.chipGlow); glow.scale.setScalar(0.16); root.add(glow);
  const ring = new THREE.Mesh(G.ring, M.ring); root.add(ring);
  return { root, chip, glow, ring, size };
}

function barSprite() {
  const c = document.createElement('canvas'); c.width = 96; c.height = 12;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(0.72, 0.09, 1); s.renderOrder = 20;
  s.redraw = f => { const g = c.getContext('2d'); g.clearRect(0, 0, 96, 12); g.fillStyle = 'rgba(12,10,20,.8)'; g.fillRect(0, 0, 96, 12); g.fillStyle = '#5fb0ff'; g.fillRect(2, 2, 92 * clamp(f, 0, 1), 8); tex.needsUpdate = true; };
  return s;
}

export function createScanobots(scene, world, W, fx, opts = {}) {
  const S = SCANOBOT, bots = [], chips = [], shots = [];
  const home = W.playerStart, B = (world.bound || 300) - 12;
  let defeated = 0, chipSeq = 0, hidden = false, clock = 0;
  const live = []; // the drones still flying, refreshed once a frame (bolts and arrows test against these)
  const tA = new THREE.Vector3(), tB = new THREE.Vector3(), probe = new THREE.Vector3(), _hit = {};

  // ── placement: seeded loops in the wild, never in the town ──
  const onLand = (x, z) => (!world.containsLand || world.containsLand(x, z)) && world.waterAt(x, z) < world.heightAt(x, z) - 0.1;
  const open = (x, z) => {
    if (Math.abs(x) > B || Math.abs(z) > B || !onLand(x, z) || quarterAt(x, z, W) === 'core') return false;
    const dh = Math.hypot(x - home.x, z - home.z); if (dh < S.homeMin || dh > S.homeMax) return false;
    probe.set(x, world.heightAt(x, z), z); return !world.resolve(probe, 0.9);
  };
  const pathOpen = (a, b) => { const L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(L / 1.5); for (let i = 1; i < n; i++) if (!open(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n)) return false; return true; };
  const r = rng((W.seed || 7) + 7373);
  for (let t = 0; t < 8000 && bots.length < S.count; t++) {
    const a = r() * Math.PI * 2, d = S.homeMin + 6 + r() * (S.homeMax - S.homeMin - 6), x = home.x + Math.sin(a) * d, z = home.z + Math.cos(a) * d;
    if (!open(x, z) || bots.some(b => Math.hypot(b.home.x - x, b.home.y - z) < S.spacing)) continue;
    const a0 = r() * Math.PI * 2, pts = [];
    for (let k = 0; k < 4; k++) {
      const aa = a0 + k * Math.PI / 2 + (r() - 0.5) * 0.5, rr = S.loop[0] + r() * (S.loop[1] - S.loop[0]);
      const v = new THREE.Vector2(x + Math.sin(aa) * rr, z + Math.cos(aa) * rr);
      if (open(v.x, v.y) && (!pts.length || pathOpen(pts[pts.length - 1], v))) pts.push(v);
    }
    if (pts.length < 3 || !pathOpen(pts[pts.length - 1], pts[0])) continue;
    bots.push(makeBot(bots.length + 1, new THREE.Vector2(x, z), pts));
  }
  console.log(`[rp7d] scanobots: ${bots.length}`);

  function makeBot(n, homePt, pts) {
    const d = buildDrone(); scene.add(d.root);
    const bar = barSprite(); bar.visible = false; scene.add(bar);
    const bot = {
      id: `scanobot-${n}`, isScanobot: true, T: S, name: S.name, home: homePt, pts, wp: 1, ...d, bar,
      pos: new THREE.Vector3(), center: new THREE.Vector3(), vel: new THREE.Vector3(), knock: new THREE.Vector3(), heading: 0,
      alt: S.hover, phase: Math.random() * 10, side: n % 2 ? 1 : -1, r: S.radius,
      state: 'patrol', t: 0, hp: S.hp, cool: 0, lost: 0, flash: 0, barT: 0, dropped: false, respawnAt: 0, vy: 0, spin: 0, seenT: 0, seen: false,
      get alive() { return alive(bot); },
      get aimY() { return bot.alt; },
      hit: (damage, dx, dz, kind, power) => hitBot(bot, damage, dx, dz, kind, power)
    };
    bot.hurtRig = { parts: { Body: { a: bot.center, b: bot.center, r: S.radius } } }; // a sphere for hitbox.js touch()
    reset(bot); return bot;
  }
  function reset(b) {
    const s = b.pts[0]; b.pos.set(s.x, world.groundAt(s.x, s.y), s.y); b.wp = 1 % b.pts.length;
    b.heading = Math.atan2(b.pts[b.wp].x - s.x, b.pts[b.wp].y - s.y); b.vel.set(0, 0, 0); b.knock.set(0, 0, 0);
    b.rxpPaid = false; b.state = 'patrol'; b.t = 0; b.hp = S.hp; b.cool = 0; b.lost = 0; b.flash = 0; b.barT = 0; b.dropped = false; b.vy = 0; b.spin = 0; b.alt = S.hover; b.seen = false;
    b.root.visible = !hidden; b.root.rotation.set(0, b.heading, 0); b.root.scale.setScalar(S.scale); b.body.rotation.set(0, 0, 0);
    b.hullMat.emissive.setRGB(0, 0, 0); b.bar.visible = false; b.bar.redraw(1); b.bar.drawn = true;
    placeBody(b);
  }
  const alive = b => b.state !== 'down' && b.state !== 'wreck' && b.state !== 'gone';
  const hostile = b => b.state === 'alert' || b.state === 'chase' || b.state === 'charge' || b.state === 'clawWind' || b.state === 'claw' || b.state === 'stagger';
  const baseY = (x, z, y) => Math.max(world.groundAt(x, z, y + 2), world.waterAt(x, z));
  function placeBody(b) {
    b.center.set(b.pos.x, b.pos.y + b.alt, b.pos.z);
    b.root.position.copy(b.center);
    b.bar.position.set(b.center.x, b.center.y + 0.85, b.center.z);
  }

  // Can it see him? A forward cone (wide: it's a scanner), blocked by terrain and buildings.
  function canSee(b, rizer) {
    if (rizer.hp <= 0 || rizer.inVehicle) return false;
    const rp = rizer.position, dx = rp.x - b.pos.x, dz = rp.z - b.pos.z, d = Math.hypot(dx, dz);
    if (rizer.hidden) return d < 1.2;
    const hush = rizer.crouched ? (rizer.stealth?.sense ?? 0.5) : 1, low = rizer.crouched ? (rizer.stealth?.sight ?? 0.6) : 1;
    if (d < S.sense * hush) return true;
    if (d > S.sight * low) return false;
    const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - b.heading), Math.cos(Math.atan2(dx, dz) - b.heading)));
    if (off > S.cone && !hostile(b)) return false;
    tA.copy(b.center); tB.set(rp.x, rp.y + 1.5, rp.z);
    return world.rayClear(tA, tB, 0.1) >= d - 0.8;
  }
  function alertAround(b) {
    for (const o of bots) if (o !== b && alive(o) && !hostile(o) && Math.hypot(o.pos.x - b.pos.x, o.pos.z - b.pos.z) < S.callRadius) { o.state = 'alert'; o.t = 0.35 + Math.random() * 0.3; }
  }

  // Damage one drone from direction (dx, dz). Returns a hit report like seers.hitGrunt's.
  function hitBot(b, damage, dx, dz, kind = 'punch', power = 1) {
    if (!alive(b)) return null;
    b.hp -= damage; b.barT = 4; b.bar.redraw(Math.max(0, b.hp) / S.hp); b.flash = 0.14;
    const push = (kind === 'kick' ? 7 : kind === 'flykick' || kind === 'kickup' ? 9 : kind === 'blast' ? 6 : kind === 'axe' ? 7 : kind === 'bow' ? 3 : 4.5) * power;
    b.knock.set(dx, 0, dz).multiplyScalar(push);
    const at = { x: b.center.x, y: b.center.y, z: b.center.z, name: S.name, scanobot: true, down: false };
    if (b.hp <= 0) { defeat(b, dx, dz, power, kind); at.down = true; }
    else { b.state = 'stagger'; b.t = 0.32; b.lost = 0; b.cool = Math.max(b.cool, 0.4); alertAround(b); }
    return at;
  }
  // Parried: its claws (or bolt) are turned aside and it reels, lens dark, for a moment.
  function stun(b, from) {
    if (!alive(b)) return null;
    b.state = 'stagger'; b.t = 1.6; b.cool = Math.max(b.cool, 2.2); b.flash = 0.14; b.barT = 4;
    if (from) { const dx = b.pos.x - from.x, dz = b.pos.z - from.z, d = Math.hypot(dx, dz) || 1; b.knock.set(dx / d, 0, dz / d).multiplyScalar(5); }
    return { x: b.center.x, y: b.center.y, z: b.center.z, name: S.name };
  }
  // Defeated: it drops out of the air, tumbling, and its Portalchip lands where it was. Exactly once.
  function defeat(b, dx, dz, power, kind = 'punch') {
    opts.onDefeated?.(b, kind);
    b.state = 'down'; b.t = 0; b.vy = 1.2; b.spin = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 3); defeated++;
    b.knock.set(dx, 0, dz).multiplyScalar(3 * power); b.bar.visible = false;
    fx?.emit(b.center.x, b.center.y, b.center.z, 22, { color: '#8fd0ff', speed: 3.6, up: 1.6, size: 0.3, life: 0.5 });
    fx?.emit(b.center.x, b.center.y, b.center.z, 10, { color: '#ffd38a', speed: 4.5, up: 1.2, size: 0.16, life: 0.35, g: 6 });
    if (!b.dropped) { b.dropped = true; dropChip(b.center.x, b.center.z, b.pos.y); }
  }

  // ── Portalchips lying in the world ──
  // value: how many Portalchips this pickup is worth (1, or 3 for the large purple chip a Penumbra drops).
  function dropChip(x, z, y0 = world.heightAt(x, z), value = 1) {
    const c = { id: `portalchip-${++chipSeq}`, kind: 'portalchip', x, z, y: baseY(x, z, y0), value, taken: false, age: 0, ...buildChip(value) };
    c.root.position.set(x, c.y, z); c.root.visible = !hidden; scene.add(c.root);
    chips.push(c); opts.onChip?.(c);
    return c;
  }
  // Take a chip off the ground. True once; a chip can't be collected twice.
  function collectChip(c) {
    if (!c || c.taken) return false;
    c.taken = true; scene.remove(c.root);
    const i = chips.indexOf(c); if (i >= 0) chips.splice(i, 1);
    c.unreg?.(); c.unreg = null;
    return true;
  }

  // ── scan bolts ──
  function fire(b, rizer) {
    const { M, G } = shared();
    let s = shots.find(q => !q.live);
    if (!s) { s = { mesh: new THREE.Mesh(G.zap, M.zap), glow: new THREE.Sprite(M.glow), pos: new THREE.Vector3(), prev: new THREE.Vector3(), vel: new THREE.Vector3() }; s.mesh.scale.setScalar(S.zap.r * 0.6); s.mesh.add(s.glow); s.glow.scale.setScalar(0.55 / (S.zap.r * 0.6)); s.start = new THREE.Vector3(); scene.add(s.mesh); shots.push(s); }
    const from = tA.set(0, 0, 0.3 * S.scale).applyAxisAngle(_up, b.heading).add(b.center);
    tB.set(rizer.position.x, rizer.position.y + 1.25, rizer.position.z);
    s.pos.copy(from); s.prev.copy(from); s.start.copy(from); s.vel.subVectors(tB, from).normalize().multiplyScalar(S.zap.speed);
    s.age = 0; s.live = true; s.bot = b; s.mesh.visible = !hidden; s.mesh.position.copy(from);
    fx?.emit(from.x, from.y, from.z, 8, { color: '#9fd4ff', speed: 1.6, up: 0.2, size: 0.18, life: 0.25, g: 0 });
  }
  const _up = new THREE.Vector3(0, 1, 0);
  function updateShots(dt, rizer, hooks) {
    const rig = hooks.rizerRig?.();
    for (const s of shots) {
      if (!s.live) continue;
      s.age += dt; s.prev.copy(s.pos); s.pos.addScaledVector(s.vel, dt); s.mesh.position.copy(s.pos);
      let end = s.age > S.zap.life || s.pos.y < world.groundAt(s.pos.x, s.pos.z, s.pos.y + 1) + 0.05 || world.rayClear(s.start, s.pos, 0.06) < s.start.distanceTo(s.pos) - 0.12;
      if (!end && rizer.hp > 0 && !rizer.inVehicle) {
        let at = null;
        if (rig && !rig.fresh) { const q = { a: s.pos, b: s.pos, pa: s.prev, pb: s.prev, r: S.zap.r }; if (touch(q, rig, _hit)) at = _hit.at.clone(); }
        else { const rp = rizer.position, dy = s.pos.y - rp.y; if (dy > 0.3 && dy < 2 && Math.hypot(s.pos.x - rp.x, s.pos.z - rp.z) < 0.45) at = s.pos.clone(); }
        if (at) { end = true; if (rizer.hurt(S.zap.damage, s.bot.center, s.bot)) hooks.onPlayerHit?.('punch', s.bot, at, S.zap.damage); }
      }
      if (end) { s.live = false; s.mesh.visible = false; fx?.emit(s.pos.x, s.pos.y, s.pos.z, 10, { color: '#9fd4ff', speed: 2.4, up: 0.6, size: 0.2, life: 0.3 }); }
      else if (Math.random() < dt * 30) fx?.emit(s.pos.x, s.pos.y, s.pos.z, 1, { color: '#7fc0ff', speed: 0.2, up: 0, size: 0.14, life: 0.2, g: 0, spread: 0.04 });
    }
  }

  // ── Rizer's blows: same contact rules as against Seers (seers.js · contacts) ──
  const windowAt = (hits, t, spd) => { for (let i = 0; i < hits.length; i++) { const h = hits[i] / spd; if (t >= h - HITBOX.windowBefore && t <= h + HITBOX.windowAfter) return i; } return -1; };
  const ASSIST = { range: 3.2, arc: 0.9, speed: 6.5, time: 0.2, contact: { punch: 0.8, kick: 1.1, flykick: 1.2, kickup: 1.4, runpunch: 0.9, sword: 1.2, axe: 1.25 } };
  let ghost = null; // the blow that destroyed its target
  function playerBlows(dt, rizer, hooks) {
    const at = rizer.attack, rig = hooks.rizerRig?.();
    if (!at || !rig || rig.fresh || rizer.hp <= 0 || rizer.inVehicle || !at.hits) return;
    const rp = rizer.position, spd = at.spd || COMBAT[at.kind]?.speed || 1;
    if (!at.sbAssist) { // carry him onto a drone just out of reach in front — unless a Seer already claimed this swing
      at.sbAssist = true;
      if (!at.target) {
        const lockRef = hooks.lockRef?.(); let best = null, bd = Infinity;
        for (const b of bots) {
          if (!alive(b) || !b.root.visible) continue;
          const dx = b.pos.x - rp.x, dz = b.pos.z - rp.z, d = Math.hypot(dx, dz);
          const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - rizer.facing), Math.cos(Math.atan2(dx, dz) - rizer.facing)));
          if (d < ASSIST.range && (off < ASSIST.arc || b === lockRef) && d < bd) { bd = d; best = b; }
        }
        at.sbTarget = best;
      }
    }
    const tg = at.sbTarget;
    if (tg && alive(tg) && (at.t < ASSIST.time || at.hits.some(h => at.t > h / spd - 0.3 && at.t < h / spd - 0.02))) {
      const dx = tg.pos.x - rp.x, dz = tg.pos.z - rp.z, d = Math.hypot(dx, dz), want = ASSIST.contact[at.kind] || 0.8;
      rizer.facing = dampAngle(rizer.facing, Math.atan2(dx, dz), 18, dt);
      if (d > want) { const step = Math.min(ASSIST.speed * dt, d - want); rp.x += dx / d * step; rp.z += dz / d * step; }
    }
    const w = at.kind === 'kickup' ? (at.t * spd >= 0.46 && at.t * spd <= 1.0 ? 0 : -1) : windowAt(at.hits, at.t, spd);
    if (w < 0) return;
    // It was destroyed earlier in this clip (or this combo): the remaining contact frames still land (sound,
    // haptics), unless another drone is in reach to be hit for real.
    if (ghost && clock - ghost.t > 1.2) ghost = null;
    if (ghost && (at !== ghost.at || w > ghost.w) && at.t >= at.hits[w] / spd && !(at.done ||= new Set()).has('ghost:' + w)
        && !bots.some(b => alive(b) && Math.hypot(b.pos.x - rp.x, b.pos.z - rp.z) < 3)) {
      at.done.add('ghost:' + w); ghost.t = clock;
      hooks.onLanded?.({ x: ghost.x, y: ghost.y, z: ghost.z, down: false, ghost: true, scanobot: true, name: S.name }, at.kind, null);
    }
    const list = (STRIKERS[at.kind] || STRIKERS.punch).map(k => rig.parts[k]).filter(q => q && q.vel >= HITBOX.minSpeed);
    if (BLADES[at.kind]) { const bl = hooks.blade?.(); if (bl) list.push({ a: bl.a, b: bl.b, pa: bl.a, pb: bl.b, r: bl.r ?? 0.05, vel: 99 }); }
    if (!list.length) return;
    const stageMul = (COMBAT.comboDamage?.[at.stage - 1] || 1) / Math.max(1, at.hits.length) * (at.od?.damage || 1), base = COMBAT[at.kind]?.damage || 1;
    for (const b of bots) {
      if (!alive(b) || Math.hypot(b.pos.x - rp.x, b.pos.z - rp.z) > 4) continue;
      const key = 'sb' + w + ':' + b.id; if ((at.done ||= new Set()).has(key)) continue;
      let hit = null; for (const s of list) { hit = touch(s, b.hurtRig, _hit, at.kind === 'kickup') && { ..._hit, s }; if (hit) break; }
      if (!hit) continue;
      at.done.add(key);
      const kx = b.pos.x - rp.x, kz = b.pos.z - rp.z, kd = Math.hypot(kx, kz) || 1;
      const fin = at.stage >= rizer.comboMax(at.kind) && w === at.hits.length - 1;
      const res = hitBot(b, base * stageMul, kx / kd, kz / kd, at.kind, (fin ? 1.3 : 0.6) * (at.od?.power || 1));
      if (res) hooks.onLanded?.({ ...res, x: hit.at.x, y: hit.at.y, z: hit.at.z, part: 'Body' }, at.kind, b);
      if (res?.down) ghost = { at, w, x: hit.at.x, y: hit.at.y, z: hit.at.z, t: clock };
    }
  }

  // ── the drones ──
  function update(dt, t, rizer, hooks = {}) {
    clock += dt;
    const rp = rizer.position, inView = hooks.inView;
    for (const b of bots) {
      const p = b.pos, dx = rp.x - p.x, dz = rp.z - p.z, dist = Math.hypot(dx, dz), toP = Math.atan2(dx, dz);
      if (b.state === 'gone') {
        if (clock >= b.respawnAt && Math.hypot(rp.x - b.pts[0].x, rp.z - b.pts[0].y) > S.respawnDist) reset(b);
        continue;
      }
      const far = dist > S.active && !hostile(b) && alive(b);
      b.cool = Math.max(0, b.cool - dt); b.barT = Math.max(0, b.barT - dt);
      let want = 0, face = null, strafe = 0;
      // sight is checked a few times a second (it casts a ray)
      if (!far && alive(b) && (b.seenT -= dt) <= 0) { b.seenT = 0.15 + Math.random() * 0.1; b.seen = canSee(b, rizer); }
      if (far) b.seen = false;
      switch (b.state) {
        case 'patrol': case 'return': {
          if (b.seen) { b.state = 'alert'; b.t = 0.45; alertAround(b); break; }
          const tg = b.pts[b.wp], tx = tg.x - p.x, tz = tg.y - p.z;
          if (Math.hypot(tx, tz) < 0.8) { b.state = 'scan'; b.t = 1 + Math.random() * 1.6; b.wp = (b.wp + 1) % b.pts.length; break; }
          face = Math.atan2(tx, tz); want = b.state === 'return' ? S.patrol * 1.6 : S.patrol; break;
        }
        case 'scan': // hovers and sweeps its lens
          b.t -= dt; face = b.heading + dt * 1.2 * b.side;
          if (b.seen) { b.state = 'alert'; b.t = 0.45; alertAround(b); } else if (b.t <= 0) b.state = 'patrol';
          break;
        case 'alert': // spotted: turn to him, lens flares
          b.t -= dt; face = toP; if (b.t <= 0) { b.state = 'chase'; b.lost = 0; b.cool = Math.max(b.cool, 0.6); }
          break;
        case 'chase': {
          b.lost = b.seen ? 0 : b.lost + dt; face = toP;
          // the hunt is relentless: it ends when the drone is destroyed, Rizer is knocked out, or he is in another district
          if (rizer.hp <= 0 || districtAt(rp.x, rp.z, W) !== (b.district ||= districtAt(b.home.x, b.home.y, W))) { b.state = 'return'; b.wp = nearestWp(b); break; }
          if (dist > S.standoff[1]) want = S.chase * (dist > 10 ? 1 : 0.7);
          else if (dist < S.standoff[0] && dist > S.claw.range) want = -S.patrol;
          strafe = dist < S.standoff[1] + 1 ? b.side * 1.2 : 0;
          if (b.cool <= 0 && rizer.hp > 0) {
            if (dist < S.claw.range + 0.2) { b.state = 'clawWind'; b.t = S.claw.windup; }
            else if (dist < S.zap.range && b.seen) { b.state = 'charge'; b.t = S.zap.windup; }
          }
          if (dist < S.claw.range + 0.2 && b.cool > 0) want = -S.patrol * 0.8; // too close while recharging: back off
          break;
        }
        case 'charge': // the tell: it stops, the lens brightens, then the bolt
          b.t -= dt; face = toP;
          if (Math.random() < dt * 30) { tA.set(0, 0, 0.3).applyAxisAngle(_up, b.heading).add(b.center); fx?.emit(tA.x + (Math.random() - 0.5) * 0.5, tA.y + (Math.random() - 0.5) * 0.5, tA.z + (Math.random() - 0.5) * 0.5, 1, { color: '#9fd4ff', speed: 0.3, up: 0, size: 0.12, life: 0.2, g: 0 }); }
          if (b.t <= 0) { if (rizer.hp > 0) fire(b, rizer); b.state = 'chase'; b.cool = rand(S.cooldown); if (Math.random() < 0.5) b.side *= -1; }
          break;
        case 'clawWind':
          b.t -= dt; face = toP;
          if (b.t <= 0) { b.state = 'claw'; b.t = S.claw.swipe; b.struck = false; }
          break;
        case 'claw': {
          b.t -= dt; face = toP; want = 2.2;
          if (!b.struck && b.t < S.claw.swipe * 0.55) {
            b.struck = true;
            const dy = b.center.y - (rp.y + 1.1);
            if (dist < S.claw.range + 0.3 && Math.abs(dy) < 1.1 && rizer.hp > 0 && !rizer.inVehicle) {
              const at = new THREE.Vector3(rp.x - dx / (dist || 1) * 0.3, rp.y + 1.2, rp.z - dz / (dist || 1) * 0.3);
              if (rizer.hurt(S.claw.damage, b.center, b)) hooks.onPlayerHit?.('punch', b, at, S.claw.damage);
            }
          }
          if (b.t <= 0) { b.state = 'chase'; b.cool = rand(S.cooldown); }
          break;
        }
        case 'stagger':
          b.t -= dt; if (b.t <= 0) { b.state = 'chase'; b.lost = 0; }
          break;
        case 'down': { // falling out of the air, tumbling
          b.t += dt; b.vy -= 14 * dt; b.alt += b.vy * dt;
          b.body.rotation.x += b.spin * dt; b.body.rotation.z += b.spin * 0.6 * dt;
          if (Math.random() < dt * 25) fx?.emit(b.center.x, b.center.y, b.center.z, 1, { color: Math.random() < 0.5 ? '#ffd38a' : '#8fd0ff', speed: 1.5, up: 0.8, size: 0.12, life: 0.3, g: 5 });
          if (b.alt <= 0.24) { b.alt = 0.24; b.state = 'wreck'; b.t = 40; /* it lies there to be salvaged (resources.js); stripped, it goes at once */ b.knock.set(0, 0, 0); fx?.emit(b.center.x, b.pos.y + 0.2, b.center.z, 14, { speed: 2.4, up: 0.8, size: 0.4, life: 0.5 }); }
          break;
        }
        case 'wreck': // lies there sparking, then sinks away
          b.t -= dt; if (b.salvaged && b.t > 0.8) b.t = 0.8;
          if (b.t < 0.8) b.root.scale.setScalar(S.scale * Math.max(0.01, b.t / 0.8));
          else if (Math.random() < dt * 4) fx?.emit(b.center.x, b.center.y + 0.1, b.center.z, 2, { color: '#9fd4ff', speed: 1.2, up: 1, size: 0.1, life: 0.25 });
          if (b.t <= 0) { b.state = 'gone'; b.root.visible = false; b.respawnAt = clock + S.respawn; }
          break;
      }
      if (b.state === 'gone') continue;
      // movement (in the air: a smoothed velocity, pushed by blows, kept out of buildings and trees)
      if (face !== null && alive(b)) b.heading = dampAngle(b.heading, face, b.state === 'patrol' || b.state === 'scan' ? 3 : 8, dt);
      const fx_ = Math.sin(b.heading), fz_ = Math.cos(b.heading);
      const wantX = fx_ * want + fz_ * strafe, wantZ = fz_ * want - fx_ * strafe;
      b.vel.x = damp(b.vel.x, alive(b) ? wantX : 0, S.accel, dt); b.vel.z = damp(b.vel.z, alive(b) ? wantZ : 0, S.accel, dt);
      const ox = p.x, oz = p.z;
      p.x += (b.vel.x + b.knock.x) * dt; p.z += (b.vel.z + b.knock.z) * dt; b.knock.multiplyScalar(Math.exp(-6 * dt));
      if (!far) {
        probe.set(p.x, p.y, p.z); if (world.resolve(probe, 0.42)) { p.x = probe.x; p.z = probe.z; if (b.state === 'patrol' || b.state === 'return') b.wp = (b.wp + 1) % b.pts.length; }
        world.keepOnLand?.(p, ox, oz);
        // Rizer's body: it can't fly through him
        const ddx = p.x - rp.x, ddz = p.z - rp.z, dd = Math.hypot(ddx, ddz), dy = b.center.y - (rp.y + 1.1);
        if (alive(b) && dd < 0.75 && Math.abs(dy) < 1.2 && rizer.hp > 0) { const k = (0.75 - dd) / (dd || 1); p.x += (dd > 1e-4 ? ddx : 1) * k; p.z += (dd > 1e-4 ? ddz : 0) * k; }
      }
      p.x = clamp(p.x, -B - 10, B + 10); p.z = clamp(p.z, -B - 10, B + 10);
      if (!far || (b.frame = (b.frame || 0) + 1) % 15 === 0) p.y = baseY(p.x, p.z, p.y);
      if (alive(b)) b.alt = damp(b.alt, S.hover + Math.sin(t * 1.9 + b.phase) * 0.07 + (b.state === 'claw' ? -0.15 : 0), 4, dt);
      placeBody(b);
      // visibility: drawn when near and on screen
      const show = !hidden && dist < S.visible && (dist < 10 || !inView || inView(b.pos));
      b.root.visible = show;
      if (!show) { b.bar.visible = false; continue; }
      // pose: heading, a lean into the flight, arms, thruster and lens
      b.root.rotation.y = b.heading;
      if (alive(b)) {
        const fwd = b.vel.x * fx_ + b.vel.z * fz_, side = b.vel.x * fz_ - b.vel.z * fx_;
        b.body.rotation.x = damp(b.body.rotation.x, clamp(fwd * 0.07, -0.3, 0.3) + (b.state === 'stagger' ? -0.45 : 0), 8, dt);
        b.body.rotation.z = damp(b.body.rotation.z, clamp(-side * 0.08, -0.3, 0.3), 8, dt);
        const swing = b.state === 'clawWind' ? -1.4 * (1 - b.t / S.claw.windup) : b.state === 'claw' ? -1.4 + 2.2 * (1 - b.t / S.claw.swipe) : Math.sin(t * 2.3 + b.phase) * 0.12;
        for (const a of b.arms) { a.sh.rotation.x = damp(a.sh.rotation.x, swing, 14, dt); a.sh.rotation.z = a.s * (0.32 + Math.sin(t * 1.7 + b.phase + a.s) * 0.06); a.el.rotation.x = b.state === 'claw' || b.state === 'clawWind' ? -0.3 : -0.75 + Math.sin(t * 2.1 + b.phase) * 0.1; }
      }
      const charge = b.state === 'charge' ? 1 - b.t / S.zap.windup : b.state === 'alert' ? 0.6 : 0;
      b.lensMat.color.setScalar(1.6 + charge * 2.4 + (b.seen && hostile(b) ? 0.3 : 0));
      b.lensGlow.scale.setScalar((0.34 + charge * 0.5) * (alive(b) ? 1 : 0.4));
      b.lensGlow.material.opacity = alive(b) ? 0.8 + charge * 0.2 : 0.25;
      const thrust = alive(b) ? 0.85 + Math.sin(t * 31 + b.phase) * 0.1 + Math.random() * 0.08 : 0;
      b.flame.scale.set(1, Math.max(0.01, thrust * (1 + Math.min(1, Math.hypot(b.vel.x, b.vel.z) / S.chase) * 0.4)), 1); b.flame.visible = thrust > 0;
      b.thrGlow.visible = thrust > 0; b.thrGlow.scale.setScalar(0.42 * thrust);
      for (const a of b.antennas) a.children[2].rotation.y = t * 1.5;
      b.flash = Math.max(0, b.flash - dt);
      b.hullMat.emissive.setScalar(b.flash > 0 ? 0.9 * b.flash / 0.14 : 0);
      b.bar.visible = alive(b) && (b.barT > 0 || hostile(b));
      if (b.bar.visible && !b.bar.drawn) { b.bar.redraw(b.hp / S.hp); b.bar.drawn = true; }
    }
    live.length = 0; for (const b of bots) if (alive(b)) live.push(b);
    playerBlows(dt, rizer, hooks);
    updateShots(dt, rizer, hooks);
    // chips: a gentle hover and turn, a soft pulsing ring under them
    for (const c of chips) {
      c.age += dt;
      c.chip.position.y = 0.36 + (c.size - 1) * 0.08 + Math.sin(t * 2.2 + c.x) * 0.035; c.chip.rotation.y = t * 1.4;
      c.glow.position.y = c.chip.position.y - 0.01; c.glow.scale.setScalar((0.16 + Math.sin(t * 3 + c.z) * 0.025) * c.size);
      c.ring.position.y = 0.025; c.ring.scale.setScalar((1 + Math.sin(t * 3 + c.x) * 0.08) * (1 + (c.size - 1) * 0.5));
      c.root.visible = !hidden && Math.hypot(c.x - rp.x, c.z - rp.z) < S.visible;
    }
  }
  function nearestWp(b) { let best = 0, bd = Infinity; b.pts.forEach((v, i) => { const d = Math.hypot(v.x - b.pos.x, v.y - b.pos.z); if (d < bd) { bd = d; best = i; } }); return best; }

  function setVisible(v) {
    hidden = !v;
    for (const b of bots) { b.root.visible = v && b.state !== 'gone'; if (!v) b.bar.visible = false; }
    for (const c of chips) c.root.visible = v;
    for (const s of shots) if (!v) { s.live = false; s.mesh.visible = false; }
  }
  // After a knock-out: everyone forgets him and drifts back to its loop.
  function standDown() { for (const b of bots) if (alive(b) && b.state !== 'patrol' && b.state !== 'scan') { b.state = 'return'; b.wp = nearestWp(b); } for (const s of shots) { s.live = false; s.mesh.visible = false; } }
  // Lock-on targets for astral.js (kind 'scanobot': FIGHT, red).
  const lockTargets = () => bots.filter(b => alive(b) && !hidden).map(b => ({ kind: 'scanobot', ref: b, pos: () => b.pos, alive: () => alive(b), h: b.alt * 2, color: '#ff5a6e', label: 'FIGHT', icon: 'scanobot' }));

  return {
    bots, chips, update, hitBot, stun, collectChip, dropChip, setVisible, standDown, lockTargets, alive,
    get bodies() { return live; }, // for Astralstrike bolts / Pearlbow arrows: { center, r, alive, hit() } (each checks .alive too)
    inCombat: pos => bots.some(b => hostile(b) && Math.hypot(b.pos.x - pos.x, b.pos.z - pos.z) < 18),
    get defeated() { return defeated; }, get total() { return bots.length; }
  };
}
