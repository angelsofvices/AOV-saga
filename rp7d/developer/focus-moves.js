// RP7D · Lightbulbs & Focus Moves.
//
//   Lightbulb     a knowledge collectible lying in the world. Collecting one teaches Rizer its Focus Move for good
//                 (it is never spent, and it is not a crafting material).
//   Focus Move    a technique Rizer knows. Four of them are set on the D-pad (Zyphone › Labs › Focus) and cast with
//                 Lock-On + D-pad. This file only says WHAT he knows and WHERE it sits; the existing Astral combat
//                 (astral.js, run from game.js) still owns damage, targeting, animation, energy and cooldowns.
//
// Adding a technique: one FOCUS_MOVES entry (and a cast for its id in game.js · FOCUS_CAST), plus a LIGHTBULBS
// entry if it is learned from a Lightbulb. Concept moves (Fire Surge, Wind Step, Earth Break) stay out until their
// canonical definitions are approved.
//
// State lives in inventory.focus { learned:[id], slots:{ up, right, down, left }, bulbs:[lightbulbId] }, saved with
// the bag, so everything learned and assigned survives a reload (a new game starts it clean).
import * as THREE from 'three';
import { inventory, saveInv } from './loot.js';

export const DIRS = ['up', 'right', 'down', 'left'];
export const DIR_NAME = { up: '↑', right: '→', down: '↓', left: '←' };
export const DIR_KEY = { up: 'I', right: 'U', down: 'T', left: 'Y' }; // keyboard stand-ins for the D-pad
export const DIR_CODE = { up: 'KeyI', right: 'KeyU', down: 'KeyT', left: 'KeyY' };

// innate: he already knows it (the techniques RP7D shipped with before Lightbulbs). The rest come from a Lightbulb.
export const FOCUS_MOVES = {
  astralthunder: { name: 'Astralthunder', element: 'LIGHTNING', color: '#6fb0ff', glyph: 'ϟ', innate: false,
    blurb: 'Calls lightning down from the sky onto the locked enemy. Anyone standing close is caught in the strike.' },
  astralift: { name: 'Astralift', element: 'ASTRAL', color: '#5ef2ff', glyph: '⇑', innate: true,
    blurb: 'Lifts the locked enemy off its feet and throws it back. (A locked chest always takes ↑ to lift its lid.)' },
  astralburst: { name: 'Astralburst', element: 'ASTRAL', color: '#b98bff', glyph: '✺', innate: true,
    blurb: 'Lightning gathers over Rizer, then bursts out around him, throwing back everything in the radius.' },
  rolling_thunder: { name: 'Rolling Thunder', element: 'LIGHTNING', color: '#ffd04a', glyph: '◉', innate: true,
    blurb: 'Rolls a sphere of lightning at the target. Every impact chains to the enemies near it before the final blast.' }
};
// The slots a brand-new save starts with: the innate techniques where they always were; ↓ waits for Astralthunder.
const DEFAULT_SLOTS = { up: 'astralift', right: 'rolling_thunder', down: null, left: 'astralburst' };

// Lightbulbs: what each teaches, its glow, and where it waits (a function of the world data, so it follows the map).
export const LIGHTBULBS = {
  lb_astralthunder: { move: 'astralthunder', color: '#ffc24a', place: W => {
    // beside the lane from home down into Malezor Square, a little way off the path
    const a = W.playerStart, b = W.plaza || a, t = 0.42, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 1;
    return { x: x - (dz / d) * 6.5, z: z + (dx / d) * 6.5 }; // the open side, by the bus stop
  } }
};

const state = () => {
  const f = inventory.focus ||= {};
  f.learned ||= []; f.bulbs ||= [];
  for (const [id, m] of Object.entries(FOCUS_MOVES)) if (m.innate && !f.learned.includes(id)) f.learned.push(id);
  f.learned = f.learned.filter(id => FOCUS_MOVES[id]);
  if (!f.slots) f.slots = { ...DEFAULT_SLOTS };
  for (const d of DIRS) if (!f.learned.includes(f.slots[d])) f.slots[d] = null;
  return f;
};
const listeners = new Set();
const changed = () => { saveInv(); for (const fn of listeners) try { fn(); } catch (e) {} };

export const focus = {
  get learned() { return [...state().learned]; },
  knows: id => state().learned.includes(id),
  slot: dir => state().slots[dir] || null,
  get slots() { return { ...state().slots }; },
  dirOf: id => DIRS.find(d => state().slots[d] === id) || null,
  hasBulb: id => state().bulbs.includes(id),
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  // Unlock service: a Lightbulb collected → its move learned (once, for good). Returns the move id, or null.
  learnFrom(bulbId) {
    const b = LIGHTBULBS[bulbId], f = state(); if (!b || f.bulbs.includes(bulbId)) return null;
    f.bulbs.push(bulbId); const fresh = !f.learned.includes(b.move); if (fresh) f.learned.push(b.move);
    changed(); return fresh ? b.move : null;
  },
  // Put a learned move on a direction. A move sits on one direction at a time: it leaves its old one.
  assign(dir, id) {
    const f = state(); if (!DIRS.includes(dir)) return 'Unknown direction';
    if (id && !f.learned.includes(id)) return 'Not learned yet';
    for (const d of DIRS) if (id && f.slots[d] === id) f.slots[d] = null;
    f.slots[dir] = id || null; changed(); return null;
  },
  clear(dir) { return this.assign(dir, null); }
};

// ── the Lightbulb: a glass bulb with a burning filament, on a dark gold-trimmed base with a blue crystal ──
export function buildLightbulb(color = '#ffc24a') {
  const g = new THREE.Group(), glow = new THREE.Color(color);
  const navy = new THREE.MeshStandardMaterial({ color: '#141b33', roughness: 0.45, metalness: 0.6 });
  const gold = new THREE.MeshStandardMaterial({ color: '#c9a04a', roughness: 0.3, metalness: 0.95, emissive: '#3a2a08', emissiveIntensity: 0.4 });
  const crystal = new THREE.MeshStandardMaterial({ color: '#4fa8ff', emissive: '#2a7cff', emissiveIntensity: 2.2, roughness: 0.15, metalness: 0.1, flatShading: true });
  // base: a squat tiered drum, gold rims, four crystal windows
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.2, 8), navy); drum.position.y = 0.1; g.add(drum);
  for (const [y, r] of [[0.01, 0.255], [0.2, 0.205], [0.27, 0.15]]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 6, 24), gold); ring.rotation.x = Math.PI / 2; ring.position.y = y; g.add(ring); }
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.08, 8), navy); collar.position.y = 0.24; g.add(collar);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2, c = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), crystal);
    c.scale.set(0.55, 1.3, 0.3); c.position.set(Math.sin(a) * 0.222, 0.11, Math.cos(a) * 0.222); c.rotation.y = a; g.add(c);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.17, 0.05), gold); const b = a + Math.PI / 4; fin.position.set(Math.sin(b) * 0.235, 0.1, Math.cos(b) * 0.235); fin.rotation.y = b; g.add(fin);
  }
  // the bulb: clear glass, a soft inner glow, and a filament of light wound inside it
  const R = 0.3, cy = 0.27 + R * 0.92;
  const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 24), new THREE.MeshPhysicalMaterial({ color: '#fff4dc', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }));
  glass.position.y = cy; g.add(glass);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 0.78, 20, 14), new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.position.y = cy; g.add(halo);
  const fil = new THREE.Group(); fil.position.y = cy; g.add(fil);
  const filMat = new THREE.MeshBasicMaterial({ color: glow.clone().lerp(new THREE.Color('#fff'), 0.35), toneMapped: false });
  for (let k = 0; k < 3; k++) { // three looping ribbons of light, each tilted its own way
    const pts = []; for (let i = 0; i <= 80; i++) { const t = i / 80 * Math.PI * 2; pts.push(new THREE.Vector3(Math.sin(t) * 0.17, Math.sin(2 * t) * 0.09 + Math.cos(t * 3) * 0.03, Math.cos(t) * 0.11)); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 120, 0.009, 5, true), filMat);
    tube.rotation.set(k * 1.05, k * 2.1, k * 0.6); fil.add(tube);
  }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.22, 6), filMat); stem.position.y = -0.17; fil.add(stem);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), filMat); fil.add(core);
  const light = new THREE.PointLight(glow, 2.2, 6, 1.6); light.position.y = cy; g.add(light);
  g.traverse(o => { if (o.isMesh) { o.castShadow = o.material !== filMat && o !== glass && o !== halo; o.userData.noCollide = true; } });
  g.userData.parts = { fil, halo, light, cy };
  return g;
}

// The Lightbulbs placed in the world: each idles (bobs, its filament turning, light breathing) until collected.
// Collect with ✕ (Space). onCollect(bulbId, moveId | null) is told when one is taken.
export function createLightbulbs({ scene, world, W, fx, onCollect }) {
  const list = [];
  for (const [id, b] of Object.entries(LIGHTBULBS)) {
    if (focus.hasBulb(id)) continue;
    const p = b.place(W), mesh = buildLightbulb(b.color), y = world.groundAt(p.x, p.z);
    mesh.scale.setScalar(1.35); mesh.position.set(p.x, y, p.z); scene.add(mesh);
    const it = { id, bulb: b, mesh, x: p.x, z: p.z, y, taken: false, t: Math.random() * 6 };
    it.spot = { id: 'lightbulb:' + id, kind: 'lightbulb', door: true, discover: false, reach: 2.6, name: 'Collect Lightbulb',
      x: p.x, z: p.z, cx: p.x, cz: p.z, active: () => !it.taken };
    world.interactables.push(it.spot); list.push(it);
  }
  function collect(spotId) {
    const it = list.find(q => q.spot.id === spotId); if (!it || it.taken) return false;
    it.taken = true; const move = focus.learnFrom(it.id);
    fx?.emit(it.x, it.y + 0.8, it.z, 36, { color: it.bulb.color, speed: 3, up: 2.2, size: 0.26, life: 0.9, g: -1 });
    fx?.emit(it.x, it.y + 0.8, it.z, 18, { color: '#ffffff', speed: 1.6, up: 2.8, size: 0.18, life: 0.7, g: -2 });
    let k = 0; const fade = () => { k += 0.06; it.mesh.scale.setScalar(1.35 * (1 + k * 0.8)); it.mesh.position.y = it.y + k * 1.2; it.mesh.traverse(o => { if (o.material && 'opacity' in o.material) { o.material.transparent = true; o.material.opacity = Math.max(0, (o.material.opacity ?? 1) - 0.07); } }); if (k < 1) requestAnimationFrame(fade); else { scene.remove(it.mesh); const i = world.interactables.indexOf(it.spot); if (i >= 0) world.interactables.splice(i, 1); } };
    fade(); onCollect?.(it.id, move);
    return true;
  }
  function update(dt) {
    for (const it of list) if (!it.taken) {
      it.t += dt; const P = it.mesh.userData.parts;
      P.fil.rotation.y += dt * 1.4; P.fil.rotation.x = Math.sin(it.t * 0.7) * 0.4;
      const pulse = 0.5 + 0.5 * Math.sin(it.t * 2.6); P.light.intensity = 1.6 + pulse * 1.4; P.halo.material.opacity = 0.12 + pulse * 0.12;
      it.mesh.position.y = it.y + Math.sin(it.t * 1.3) * 0.04;
    }
  }
  return { list, collect, update, has: spotId => list.some(q => q.spot.id === spotId && !q.taken) };
}
