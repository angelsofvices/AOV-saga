// RP7D · Field Equipment in the world: placement preview, validation, the physical object, and pack up.
// The unit's STATE lives in storage.js (inventory.equipment: ZYCUBE → DEPLOYED → ZYCUBE). This file only shows it in the
// world. Stored unit is removed only when placement succeeds, and a failed pack up leaves the object standing.
import * as THREE from 'three';
import { storage, LOC } from './storage.js';
import { FIELD_EQUIPMENT, defOf } from './item-registry.js';
import { buildAstralboard } from './loot.js';

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.7, metalness: o.m ?? 0.2, emissive: o.e || '#000', emissiveIntensity: o.ei ?? 0 });
const box = (g, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };

// Field Workstation: a sturdy folding bench with a lit work panel and a tool rack. Emissive only: no real lights are added.
export function buildFieldWorkstation() {
  const g = new THREE.Group(), steel = mat('#4b5764', { m: 0.5, r: 0.5 }), top = mat('#8a6a46'), dark = mat('#2c333b'), glow = mat('#7fd6ff', { e: '#4fc3ff', ei: 1.3, r: 0.3 }), amber = mat('#ffb347', { e: '#ff9a1f', ei: 0.9 });
  box(g, 2.3, 0.1, 1.0, top, 0, 0.95, 0);                               // bench top
  box(g, 2.34, 0.06, 1.04, steel, 0, 0.88, 0);                          // frame lip
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.12, 0.88, 0.12, steel, sx * 1.04, 0.44, sz * 0.4); // legs
  box(g, 2.0, 0.07, 0.8, dark, 0, 0.3, 0);                              // lower shelf
  box(g, 0.5, 0.28, 0.4, mat('#566270'), -0.7, 0.47, 0);                // parts case
  box(g, 0.34, 0.2, 0.3, amber, 0.55, 0.43, 0.05);                      // canister
  box(g, 2.2, 0.9, 0.08, dark, 0, 1.45, -0.46);                         // back panel
  box(g, 1.1, 0.5, 0.04, glow, -0.35, 1.5, -0.4);                       // work screen
  for (let i = 0; i < 4; i++) box(g, 0.1, 0.34 + (i % 2) * 0.1, 0.05, steel, 0.55 + i * 0.16, 1.55, -0.4); // hung tools
  box(g, 0.24, 0.12, 0.24, steel, 0.9, 1.07, 0.2);                      // vise
  box(g, 0.08, 0.08, 0.5, glow, -1.12, 0.96, 0.1);                      // status strip
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
const BUILDERS = { field_workstation: buildFieldWorkstation, astralboard: buildAstralboard };

// ride: { spawn(e) → true when handled, despawn(e) } lets a ride (the Astralboard) be its own world object instead of a mesh made here.
export function createDeployables({ scene, world, getRizer, isBlocked, occupants = () => [], toast = () => {}, onState = () => {}, ride = null }) {
  const live = new Map();           // uid → { mesh, obs, type }
  let ghost = null, placing = null, lastCheck = null;
  const prompt = document.createElement('div'); prompt.id = 'deploy-banner'; prompt.hidden = true; document.body.appendChild(prompt);
  const nearPrompt = document.createElement('div'); nearPrompt.id = 'station-prompt'; nearPrompt.hidden = true; document.body.appendChild(nearPrompt);

  // ── validation ────────────────────────────────────────────────────────────
  function footprintPoints(x, z, yaw, fp, pad = 0) {
    const c = Math.cos(yaw), s = Math.sin(yaw), hw = fp.hw + pad, hd = fp.hd + pad, pts = [];
    for (const [lx, lz] of [[0, 0], [-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd], [0, -hd], [0, hd], [-hw, 0], [hw, 0]]) pts.push({ x: x + lx * c + lz * s, z: z - lx * s + lz * c });
    return pts;
  }
  // Returns { ok, reasons:[…], y }. Every rule the handoff lists: ground, space, slope, collision, restricted areas, NPC overlap.
  function validate(type, x, z, yaw) {
    const R = getRizer(), fp = FIELD_EQUIPMENT[type].footprint, reasons = [];
    if (isBlocked?.()) return { ok: false, reasons: ['Cannot deploy here'], y: R.position.y };
    const pts = footprintPoints(x, z, yaw, fp), y0 = world.groundAt(x, z, R.position.y + 1);
    const hs = pts.map(p => world.groundAt(p.x, p.z, y0 + 1));
    if (pts.some(p => !world.containsLand(p.x, p.z))) reasons.push('Needs solid ground');
    if (pts.some((p, i) => { const w = world.waterAt?.(p.x, p.z); return Number.isFinite(w) && w > hs[i] - 0.05; })) reasons.push('Too close to water');
    if (Math.max(...hs) - Math.min(...hs) > 0.45) reasons.push('Ground is too uneven');
    const n = world.groundNormalAt(x, z, y0 + 1); if (n.y < 0.93) reasons.push('Slope is too steep');
    for (const p of footprintPoints(x, z, yaw, fp, 0.1)) { const q = new THREE.Vector3(p.x, y0 + 0.6, p.z); if (world.resolve(q, 0.22) && Math.hypot(q.x - p.x, q.z - p.z) > 0.04) { reasons.push('Something is in the way'); break; } }
    for (const p of world.T.pads || []) if (Math.hypot(p.x - x, p.z - z) < p.r + 1.5) { reasons.push('Restricted area'); break; }
    for (const [uid, d] of live) if (Math.hypot(d.mesh.position.x - x, d.mesh.position.z - z) < 2.6) { reasons.push('Too close to other equipment'); break; }
    for (const o of occupants()) if (Math.hypot(o.x - x, o.z - z) < 1.8) { reasons.push('Someone is standing there'); break; }
    const eye = new THREE.Vector3(R.position.x, R.position.y + 1.2, R.position.z), tgt = new THREE.Vector3(x, y0 + 0.8, z);
    if (eye.distanceTo(tgt) > 1.2 && !world.rayClear(eye, tgt, 0.3)) reasons.push('No clear line to the spot');
    return { ok: !reasons.length, reasons: [...new Set(reasons)], y: y0 };
  }

  // ── world objects ─────────────────────────────────────────────────────────
  function spawn(e) {
    if (live.has(e.uid) || !e.at) return;
    if (FIELD_EQUIPMENT[e.type].ride) {
      if (!ride?.spawn(e)) return; // the ride's own system is not ready yet: sync() tries again
      live.set(e.uid, { mesh: { position: new THREE.Vector3(e.at.x, e.at.y, e.at.z) }, obs: null, type: e.type, y: e.at.y, ride: true }); return;
    }
    const fp = FIELD_EQUIPMENT[e.type].footprint, mesh = BUILDERS[e.type]();
    const y = world.groundAt(e.at.x, e.at.z, e.at.y + 1);
    mesh.position.set(e.at.x, y, e.at.z); mesh.rotation.y = e.at.yaw || 0; scene.add(mesh);
    const obs = { type: 'box', x: e.at.x, z: e.at.z, hw: fp.hw, hd: fp.hd, rot: e.at.yaw || 0, top: y + 1.1, active: true };
    world.addObstacle(obs);
    live.set(e.uid, { mesh, obs, type: e.type, y });
  }
  function despawn(uid) {
    const d = live.get(uid); if (!d) return;
    if (d.ride) { ride?.despawn({ uid, type: d.type }); live.delete(uid); return; }
    d.obs.active = false; scene.remove(d.mesh); d.mesh.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose?.(); } }); live.delete(uid);
  }
  // Make the world match the saved state: used on load, and after any storage change.
  function sync() {
    const deployed = storage.equipmentIn(LOC.DEPLOYED);
    for (const e of deployed) spawn(e);
    for (const uid of [...live.keys()]) if (!deployed.some(e => e.uid === uid)) despawn(uid);
  }

  // ── placement ─────────────────────────────────────────────────────────────
  function makeGhost(type) {
    const g = BUILDERS[type]();
    g.traverse(o => { if (o.isMesh) { o.material = new THREE.MeshBasicMaterial({ color: '#46e08a', transparent: true, opacity: 0.5, depthWrite: false }); o.castShadow = false; o.receiveShadow = false; } });
    return g;
  }
  function spot() { const R = getRizer(), f = R.facing; return { x: R.position.x + Math.sin(f) * 2.5, z: R.position.z + Math.cos(f) * 2.5, yaw: f + Math.PI }; }
  function start(uid) {
    const e = storage.equipmentByUid(uid);
    if (!e || e.loc !== LOC.ZYCUBE) return { ok: false, message: 'It is not in your Zycube' };
    if (isBlocked?.()) return { ok: false, message: 'Cannot deploy here' };
    cancel(true); placing = { uid, type: e.type }; ghost = makeGhost(e.type); scene.add(ghost); onState(true); return { ok: true };
  }
  function cancel(silent) { if (!placing) return; scene.remove(ghost); ghost.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } }); ghost = null; placing = null; lastCheck = null; prompt.hidden = true; onState(false); if (!silent) toast('Placement cancelled · still in your Zycube'); }
  function confirm() {
    if (!placing) return { ok: false };
    const s = spot(), v = validate(placing.type, s.x, s.z, s.yaw);
    if (!v.ok) { toast(`INVALID · ${v.reasons[0]}`); return { ok: false, message: v.reasons[0] }; }
    const r = storage.deployEquipment(placing.uid, { x: s.x, y: v.y, z: s.z, yaw: s.yaw });
    if (!r.ok) { toast(r.message || 'Could not deploy'); return r; }
    const name = defOf(placing.type).name; cancel(true); sync(); toast(`${name} deployed`); return { ok: true };
  }
  function update() {
    if (!placing) return;
    const s = spot(), v = validate(placing.type, s.x, s.z, s.yaw); lastCheck = v;
    ghost.position.set(s.x, v.y + 0.02, s.z); ghost.rotation.y = s.yaw;
    const col = v.ok ? '#46e08a' : '#ff5a5a'; ghost.traverse(o => { if (o.isMesh) o.material.color.set(col); });
    prompt.hidden = false; prompt.className = v.ok ? 'ok' : 'bad';
    prompt.innerHTML = `<small>PLACING · ${defOf(placing.type).name.toUpperCase()}</small><b>${v.ok ? 'VALID' : 'INVALID'}</b><span>${v.ok ? 'Look and move to line it up' : v.reasons[0]}</span><em>○ / E place · △ / Esc cancel</em>`;
  }

  // ── pack up ──────────────────────────────────────────────────────────────
  function packUp(uid) {
    const r = storage.packEquipment(uid);
    if (!r.ok) { toast(r.reason === 'INSUFFICIENT_CAPACITY' ? 'INSUFFICIENT ZYCUBE CAPACITY · it stays deployed' : r.message || 'Could not pack up'); return r; }
    sync(); toast('Packed up · back in your Zycube'); return r;
  }

  // ── use: the nearest deployed unit within reach ───────────────────────────
  function nearest(p, extra = 0) {
    let best = null;
    for (const [uid, d] of live) {
      if (d.ride) continue; // rides have their own prompt (○ / E to ride)
      const reach = FIELD_EQUIPMENT[d.type].reach + extra, dist = Math.hypot(d.mesh.position.x - p.x, d.mesh.position.z - p.z);
      if (dist <= reach && Math.abs(d.y - p.y) < 2.2 && (!best || dist < best.dist)) best = { uid, type: d.type, dist };
    }
    return best;
  }
  let lastP = null;
  function showPrompt(name, hint = '○ / E · use') { const k = name ? name + hint : null; if (k === lastP) return; lastP = k; nearPrompt.hidden = !name; if (name) nearPrompt.innerHTML = `<b>${name}</b><span>${hint}</span>`; }
  const showNear = n => showPrompt(n ? defOf(n.type).name : null);

  return { validate, start, cancel, confirm, update, packUp, nearest, showNear, showPrompt, sync, get placing() { return !!placing; }, get lastCheck() { return lastCheck; }, get live() { return live; } };
}
