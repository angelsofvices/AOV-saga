// RP7D · Lightbulbs & Focus Moves.
//
//   Lightbulb     a knowledge collectible. Six wait in gold chests around Malezor: open a chest (○) and its bulb
//                 floats out; collect it (✕) and Rizer learns its Focus Move for good (it is never spent, and it is not
//                 a crafting material).
//   Focus Move    a technique Rizer knows. Four of them are set on the D-pad (Zyphone › Labs › Focus) and cast with
//                 Lock-On + D-pad. This file only says WHAT he knows and WHERE it sits; the existing Astral combat
//                 (astral.js, run from game.js) still owns damage, targeting, animation, energy and cooldowns.
//
// Adding a technique: one FOCUS_MOVES entry (and a cast for its id in game.js · FOCUS_CAST), plus a LIGHTBULBS
// entry if it is learned from a Lightbulb. Concept moves (Fire Surge, Wind Step, Earth Break) stay out until their
// canonical definitions are approved.
//
// State lives in inventory.focus { learned:[id], slots:{ up, right, down, left }, bulbs:[lightbulbId], chests:{ id:1 } },
// saved with the bag, so everything learned and assigned survives a reload (a new game starts it clean).
import * as THREE from 'three';
import { inventory, saveInv } from './loot.js';

export const DIRS = ['up', 'right', 'down', 'left'];
export const DIR_NAME = { up: '↑', right: '→', down: '↓', left: '←' };
export const DIR_KEY = { up: 'I', right: 'U', down: 'T', left: 'Y' }; // keyboard stand-ins for the D-pad
export const DIR_CODE = { up: 'KeyI', right: 'KeyU', down: 'KeyT', left: 'KeyY' };

// innate: he knows it from the start, without a Lightbulb (none do for now: every technique comes from a gold chest).
export const FOCUS_MOVES = {
  astralthunder: { name: 'Astralthunder', element: 'LIGHTNING', color: '#6fb0ff', glyph: 'ϟ', innate: false,
    blurb: 'Calls lightning down from the sky onto the locked enemy. Anyone standing close is caught in the strike.' },
  astralift: { name: 'Astralift', element: 'ASTRAL', color: '#5ef2ff', glyph: '⇑', innate: false,
    blurb: 'Lifts the locked enemy off its feet and throws it back. (A locked chest always takes ↑ to lift its lid.)' },
  astralburst: { name: 'Astralburst', element: 'ASTRAL', color: '#b98bff', glyph: '✺', innate: false,
    blurb: 'Lightning gathers over Rizer, then bursts out around him, throwing back everything in the radius.' },
  rolling_thunder: { name: 'Rolling Thunder', element: 'LIGHTNING', color: '#ffd04a', glyph: '◉', innate: false,
    blurb: 'Rolls a sphere of lightning at the target. Every impact chains to the enemies near it before the final blast.' },
  // Thunder-based moves (astral-storm.js · RP7D_ASTRALCLAP_ASTRALSPIN_V1.md)
  astralclap: { name: 'Astralclap', element: 'LIGHTNING', color: '#8fd0ff', glyph: '⇆', innate: false,
    blurb: 'Lightning erupts under every enemy near the lock and holds them up. On the clap they are pulled together and collide in an electrical explosion: the more bodies, the harder it hits.' },
  astralspin: { name: 'Astralspin', element: 'STORM', color: '#b8e4ff', glyph: '✴', innate: false, noLock: true,
    blurb: 'Rizer spins (on the ground or in the air) and a tornado forms on the ground below him. It travels along the surface; its storm drags in, lifts and shocks every enemy inside until it dissipates. Needs no lock.' }
};
// A brand-new save starts with an empty D-pad: every slot is filled from what the Lightbulbs teach.
const DEFAULT_SLOTS = { up: null, right: null, down: null, left: null };

// Lightbulbs: what each teaches and its glow. Each waits in its own gold chest; `near` says which part of Malezor the
// chest is placed near (a compass bearing from Malezor Square, so it follows the map; 'home' = by Rizer's door).
export const LIGHTBULBS = {
  lb_astralthunder: { move: 'astralthunder', color: '#ffc24a', near: 'home' },          // the first one: a short walk from Rizer's door
  lb_astralift:     { move: 'astralift', color: '#4fa8ff', near: 'east' },
  lb_astralburst:   { move: 'astralburst', color: '#b98bff', near: 'west' },
  lb_rolling:       { move: 'rolling_thunder', color: '#ff7a3d', near: 'north' },
  lb_astralclap:    { move: 'astralclap', color: '#8fd0ff', near: 'south' },
  lb_astralspin:    { move: 'astralspin', color: '#d9f1ff', near: 'northwest' }
};

const state = () => {
  const f = inventory.focus ||= {};
  f.learned ||= []; f.bulbs ||= []; f.chests ||= {};
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
  chestOpen: id => !!state().chests[id],
  openChest(id) { state().chests[id] = 1; changed(); },
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

// ── the gold chests (one per Lightbulb) ──
// Placed once from the map: Malezor's landmarks (the discoverable places) sorted by the bearing each Lightbulb asks for,
// then the first clear, level spot a few steps from that landmark. Chest states: closed → opening → rising (the bulb
// floats up out of it) → waiting (hovering in front of the chest, ✕ to collect) → empty. Opened chests and collected
// bulbs are remembered with the save (inventory.focus), so a reload puts each chest back the way it was left.
export function createLightbulbChests({ scene, world, W, fx, buildChest, chestFront, onCollect, onOpen, porch = null }) { // porch: the playtest spots (loot.js · porchChestSpots), one per Lightbulb in order
  const P = W.plaza || W.playerStart, S = W.playerStart, list = [];
  const clear = (x, z, r) => { const probe = new THREE.Vector3(x, world.groundAt(x, z), z); return !world.resolve(probe, r) && world.waterAt(x, z) < world.heightAt(x, z) - 0.2 && Math.abs(world.heightAt(x + 1.4, z) - world.heightAt(x - 1.4, z)) < 0.6 && Math.abs(world.heightAt(x, z + 1.4) - world.heightAt(x, z - 1.4)) < 0.6; };
  const places = world.interactables.filter(i => i.discover && Number.isFinite(i.cx) && !String(i.id).startsWith('cave:')); // Malezor's own landmarks (cave mouths across Zyraxis are not chest anchors: they would pull a chest out of Malezor)
  const used = [];
  const others = world.interactables.filter(i => Number.isFinite(i.x)).map(i => ({ x: i.x, z: i.z })); // doors, chests, rides: a gold chest never shares their prompt
  const far = (x, z) => used.every(u => Math.hypot(u.x - x, u.z - z) > 40) && others.every(o => Math.hypot(o.x - x, o.z - z) > 7);
  const BEAR = { east: [1, 0], west: [-1, 0], north: [0, -1], south: [0, 1], northwest: [-0.7071, -0.7071] };
  function spotFor(near) {
    let anchors;
    if (near === 'home') anchors = [{ cx: S.x, cz: S.z, r0: 14 }];
    else { const [bx, bz] = BEAR[near]; anchors = places.map(p => ({ cx: p.cx, cz: p.cz, r0: 7, score: ((p.cx - P.x) * bx + (p.cz - P.z) * bz) - Math.abs((p.cx - P.x) * bz - (p.cz - P.z) * bx) * 0.35 }))
      .filter(a => a.score > 30).sort((a, b) => b.score - a.score); }
    for (const a of anchors) for (const r of [a.r0, a.r0 + 2.5, a.r0 + 5, a.r0 + 8]) for (let k = 0; k < 12; k++) {
      const ang = k / 12 * Math.PI * 2, x = a.cx + Math.sin(ang) * r, z = a.cz + Math.cos(ang) * r;
      if (clear(x, z, 2.2) && far(x, z)) return { x, z, face: Math.atan2(a.cx - x, a.cz - z) };
    }
    return null;
  }
  for (const [n, [id, b]] of Object.entries(LIGHTBULBS).entries()) {
    const at = porch?.[n] || spotFor(b.near); if (!at) { console.warn('[rp7d] no spot for', id); continue; }
    used.push(at);
    const y = world.groundAt(at.x, at.z), C = buildChest('gold');
    C.root.position.set(at.x, y, at.z); C.root.rotation.y = at.face; scene.add(C.root); world.addMesh?.(C.root);
    const front = new THREE.Vector3(Math.sin(at.face), 0, Math.cos(at.face));
    const rest = new THREE.Vector3(at.x, y + 1.15, at.z).addScaledVector(front, 0.15); // where the bulb hovers: over the open chest, in view past Rizer's shoulder
    const bulb = buildLightbulb(b.color); bulb.scale.setScalar(1.1); bulb.visible = false; scene.add(bulb);
    const taken = focus.hasBulb(id), opened = focus.chestOpen(id) || taken;
    const it = { id, bulb: b, C, x: at.x, z: at.z, y, rest, mesh: bulb, t: Math.random() * 6, k: 0, state: taken ? 'empty' : opened ? 'waiting' : 'closed' };
    if (opened) { C.hinge.rotation.x = -1.9; C.inner.material.emissiveIntensity = 0.6; }
    if (it.state === 'waiting') { bulb.visible = true; bulb.position.copy(rest); }
    it.front = () => chestFront(C);
    it.chestSpot = { id: 'lbchest:' + id, kind: 'goldchest', discover: false, reach: 3.2, name: 'Open gold chest', x: at.x, z: at.z, cx: at.x, cz: at.z, active: () => it.state === 'closed' };
    it.spot = { id: 'lightbulb:' + id, kind: 'lightbulb', door: true, discover: false, reach: 2.8, name: 'Collect Lightbulb', x: rest.x, z: rest.z, cx: rest.x, cz: rest.z, active: () => it.state === 'waiting' };
    world.interactables.push(it.chestSpot, it.spot); list.push(it);
  }
  const find = spotId => list.find(q => q.spot.id === spotId || q.chestSpot.id === spotId);
  function open(spotId) {
    const it = find(spotId); if (!it || it.state !== 'closed') return false;
    it.state = 'opening'; it.k = 0; focus.openChest(it.id); onOpen?.(it);
    return true;
  }
  function collect(spotId) {
    const it = find(spotId); if (!it || it.state !== 'waiting') return false;
    it.state = 'collected'; it.k = 0; const move = focus.learnFrom(it.id), p = it.mesh.position;
    fx?.emit(p.x, p.y + 0.5, p.z, 36, { color: it.bulb.color, speed: 3, up: 2.2, size: 0.26, life: 0.9, g: -1 });
    fx?.emit(p.x, p.y + 0.5, p.z, 18, { color: '#ffffff', speed: 1.6, up: 2.8, size: 0.18, life: 0.7, g: -2 });
    onCollect?.(it.id, move);
    return true;
  }
  function update(dt) {
    for (const it of list) {
      const P = it.mesh.userData.parts; it.t += dt;
      if (it.state === 'opening') { // the lid swings up, gold light spills out
        it.k = Math.min(1, it.k + dt / 0.55); const e = 1 - Math.pow(1 - it.k, 3);
        it.C.hinge.rotation.x = -1.9 * e; it.C.light.intensity = 9 * e; it.C.inner.material.emissiveIntensity = 1.4 * e;
        if (it.k >= 1) { it.state = 'rising'; it.k = 0; it.mesh.visible = true; fx?.emit(it.x, it.y + 0.6, it.z, 30, { color: '#ffd98a', speed: 3, up: 3, size: 0.4, life: 0.8, g: 3 }); }
      } else if (it.state === 'rising') { // floats up out of the chest, turning, and drifts to the front
        it.k = Math.min(1, it.k + dt / 1.6); const e = it.k * it.k * (3 - 2 * it.k);
        it.mesh.position.set(it.x + (it.rest.x - it.x) * e, it.y + 0.3 + (it.rest.y - it.y - 0.3) * e + Math.sin(it.k * Math.PI) * 1.1, it.z + (it.rest.z - it.z) * e);
        it.mesh.rotation.y = it.k * Math.PI * 3; it.mesh.scale.setScalar(1.1 * (0.4 + 0.6 * e));
        if (Math.random() < dt * 30) fx?.emit(it.mesh.position.x, it.mesh.position.y + 0.4, it.mesh.position.z, 1, { color: it.bulb.color, speed: 0.3, up: 0.2, size: 0.22, life: 0.5, g: 0 });
        if (it.k >= 1) it.state = 'waiting';
      } else if (it.state === 'waiting') { // hovers, its filament turning, light breathing
        it.mesh.position.set(it.rest.x, it.rest.y + Math.sin(it.t * 1.6) * 0.07, it.rest.z); it.mesh.rotation.y += dt * 0.4;
        it.C.light.intensity = 3 + Math.sin(it.t * 2.6);
      } else if (it.state === 'collected') { // swells and fades into light
        it.k = Math.min(1, it.k + dt * 2.2); it.mesh.scale.setScalar(1.1 * (1 + it.k * 0.8)); it.mesh.position.y += dt * 1.4;
        it.mesh.traverse(o => { if (o.material && 'opacity' in o.material) { o.material.transparent = true; o.material.opacity = Math.max(0, o.material.opacity - dt * 2.4); } });
        if (it.k >= 1) { it.mesh.visible = false; it.state = 'empty'; }
      } else if (it.state === 'empty') it.C.light.intensity = Math.max(0, it.C.light.intensity - dt * 4);
      if (it.mesh.visible && it.state !== 'collected') { P.fil.rotation.y += dt * 1.4; P.fil.rotation.x = Math.sin(it.t * 0.7) * 0.4; const pulse = 0.5 + 0.5 * Math.sin(it.t * 2.6); P.light.intensity = 1.6 + pulse * 1.4; P.halo.material.opacity = 0.12 + pulse * 0.12; }
    }
  }
  return { list, open, collect, update, find };
}
