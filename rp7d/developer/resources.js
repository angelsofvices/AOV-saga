// Resources: stackable crafting materials that lie in the world as physical piles.
// One system for every material. Scrap Metal is the first; a new one is a RESOURCES entry and a pile builder.
//   RESOURCES                         what each resource is (the Zyphone's Items page reads the matching ITEMS entry)
//   addResource / removeResource / getResourceCount / hasResource
//                                     the only way anything touches a quantity (owner: inventory.items[resourceId])
//   createResourcePiles(scene, world, fx)
//        authored(id, resourceId, quantity, x, z)   a one-time pile placed on purpose; stays collected (inventory.picked.resources)
//        drop(resourceId, quantity, x, y, z)        a pile thrown out by something (a wreck, a container, test code)
//        wreck(ref, kind)                           a destroyed tech body becomes salvage: hit the wreck to knock scrap out of it
// A pile is one object whatever it holds: quantity is data, never one physics body per bolt.
import * as THREE from 'three';
import { inventory, saveInv } from './loot.js';
import { HITBOX } from './hitbox.js';

export const RESOURCES = {
  scrap_metal: { id: 'scrap_metal', name: 'Scrap Metal', category: 'RESOURCE', stackable: true, pickupable: true, persistent: true, color: '#a8744a',
    blurb: 'Salvaged metal and mechanical components used in technological crafting and repairs.' },
  // Fresh Wood from fallen trees can be gathered from the logs, or carried as a lasting physical resource pile.
  fresh_wood: { id: 'fresh_wood', name: 'Fresh Wood', category: 'RESOURCE', stackable: true, pickupable: true, persistent: true, color: '#c9a36b',
    blurb: 'Green timber from a felled tree or a broken bush, gathered before the ground takes it back. Used in field crafting.' },
  // Everstone from smashed rocks can be gathered from rubble, or carried as a lasting physical resource pile.
  everstone: { id: 'everstone', name: 'Everstone', category: 'RESOURCE', stackable: true, pickupable: true, persistent: true, color: '#9a968c',
    blurb: 'Broken stone gathered from the rubble of a smashed rock. Used in crafting and repairs.' },
  gemshard: { id: 'gemshard', name: 'Gemshard', category: 'RESOURCE', stackable: true, pickupable: true, persistent: true, color: '#9fe8ff',
    blurb: 'A piece of gem power used for crafting. Whole Gems remain separate Gemlord power.' },
  life_seed: { id: 'life_seed', name: 'Life Seed', category: 'RESOURCE', stackable: true, pickupable: true, persistent: true, color: '#7ee36b',
    blurb: 'A rare seed released when a living tree falls. Equip it in the Armory and press Square on grassy ground to plant a treehouse.' }
};
// What a destroyed tech body gives up when its wreck is struck: total scrap, and how many blows it takes to strip it.
export const SALVAGE = {
  scanobot: { resourceId: 'scrap_metal', quantity: 3, hits: 2, reach: 1.0 },
  nova: { resourceId: 'scrap_metal', quantity: 6, hits: 3, reach: 1.2 },
  penumbra: { resourceId: 'scrap_metal', quantity: 12, hits: 4, reach: 2.0 }
};
// Future recipe costs read the same way: [{ resourceId: 'scrap_metal', quantity: 10 }] → canAfford(cost) / spend(cost).

export const getResourceCount = id => inventory.items?.[id] || 0;
export const hasResource = (id, amount = 1) => getResourceCount(id) >= amount;
export function addResource(id, amount = 1) { if (!RESOURCES[id] || !(amount > 0)) return getResourceCount(id); const m = inventory.items ||= {}; m[id] = (m[id] || 0) + Math.round(amount); saveInv(); return m[id]; }
export function removeResource(id, amount = 1) { if (!hasResource(id, amount)) return false; inventory.items[id] -= Math.round(amount); saveInv(); return true; }
export const canAfford = cost => cost.every(c => hasResource(c.resourceId, c.quantity));
export function spend(cost) { if (!canAfford(cost)) return false; for (const c of cost) removeResource(c.resourceId, c.quantity); return true; }

// ── the Scrap Metal pile: pipes, a gear, plates, nuts, a bolt and a loop of cable. Four arrangements, one resource. ──
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0.35, flatShading: true, ...o });
let MATS = null;
const mats = () => MATS ||= { steel: mat('#74787f'), dark: mat('#3d3f44'), rust: mat('#8f4d24', { metalness: 0.15, roughness: 0.95 }), rust2: mat('#b0672e', { metalness: 0.15, roughness: 0.95 }), red: mat('#b3272c', { metalness: 0, roughness: 0.6 }), blue: mat('#2a5cb8', { metalness: 0, roughness: 0.6 }), bark: mat('#76502f', { metalness: 0, roughness: 0.95 }), woodCut: mat('#c9a36b', { metalness: 0, roughness: 0.95 }), stone: mat('#96938b', { metalness: 0.06, roughness: 0.95 }) };
function rnd(seed) { return () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const PARTS = {
  pipe(M, r) { const g = new THREE.Group(), R = 0.045 + r() * 0.025, L = 0.16 + r() * 0.1; g.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 9, 1, true), Object.assign(M.steel.clone(), { side: THREE.DoubleSide }))); const lip = new THREE.Mesh(new THREE.TorusGeometry(R, 0.012, 5, 9), M.rust); lip.rotation.x = Math.PI / 2; lip.position.y = L / 2; g.add(lip); return g; },
  gear(M) { const g = new THREE.Group(), ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.03, 6, 12), M.rust2); g.add(ring); for (let i = 0; i < 8; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.05), M.rust2), a = i / 8 * Math.PI * 2; t.position.set(Math.cos(a) * 0.115, Math.sin(a) * 0.115, 0); t.rotation.z = a; g.add(t); } return g; },
  plate(M, r) { const s = new THREE.Shape(), n = 6, pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, d = 0.09 + r() * 0.07; pts.push([Math.cos(a) * d, Math.sin(a) * d * 0.75]); } s.moveTo(...pts[0]); pts.slice(1).forEach(p => s.lineTo(...p)); return new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.014, bevelEnabled: false }), r() < 0.5 ? M.rust : M.steel); },
  nut(M) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), M.steel)); const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.052, 8), M.dark); g.add(hole); return g; },
  bolt(M) { const g = new THREE.Group(), sh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.13, 7), M.dark); g.add(sh); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), M.steel); hd.position.y = 0.075; g.add(hd); for (let i = 0; i < 4; i++) { const th = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.005, 4, 7), M.rust); th.rotation.x = Math.PI / 2; th.position.y = -0.05 + i * 0.025; g.add(th); } return g; },
  block(M) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.1), M.steel)); const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.085, 7), M.dark); g.add(hole); return g; },
  cable(M, r) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.1 + r() * 0.05, 0.012, 5, 10, Math.PI * (0.8 + r() * 0.5)), r() < 0.5 ? M.red : M.blue); return m; }
};
const RECIPES = [ // which parts lead each arrangement
  ['pipe', 'gear', 'plate', 'block', 'nut', 'cable', 'bolt', 'pipe', 'plate', 'cable'],
  ['plate', 'plate', 'pipe', 'nut', 'cable', 'block', 'pipe', 'bolt', 'nut'],
  ['gear', 'pipe', 'pipe', 'plate', 'cable', 'cable', 'nut', 'block', 'bolt', 'plate'],
  ['pipe', 'bolt', 'bolt', 'gear', 'plate', 'nut', 'nut', 'cable', 'block']
];
export function buildScrapPile(variant = 0, seed = 1) {
  const g = new THREE.Group(), M = mats(), r = rnd(seed * 7919 + variant * 131), list = RECIPES[variant % RECIPES.length];
  list.forEach((k, i) => {
    const p = PARTS[k](M, r), a = r() * Math.PI * 2, d = i < 3 ? r() * 0.07 : 0.08 + r() * 0.14; // the big pieces lead in the middle, the rest heap round them
    p.position.set(Math.cos(a) * d, 0.04 + (i < 3 ? 0.07 + r() * 0.1 : r() * 0.07), Math.sin(a) * d);
    p.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI); g.add(p);
  });
  g.rotation.y = r() * Math.PI * 2; g.scale.setScalar(1.05 + r() * 0.3); // about 25–35 cm tall in the world
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
function buildWoodPile(variant = 0, seed = 1) {
  const g = new THREE.Group(), r = rnd(seed * 6151 + variant * 173), M = mats();
  const count = 4 + variant;
  for (let i = 0; i < count; i++) {
    const radius = 0.09 + r() * 0.055, length = 0.42 + r() * 0.2, log = new THREE.Mesh(new THREE.CylinderGeometry(radius * (0.9 + r() * 0.2), radius, length, 7), M.bark);
    log.rotation.z = Math.PI / 2 + (r() - 0.5) * 0.16; log.rotation.y = (r() - 0.5) * 0.55;
    log.position.set((r() - 0.5) * 0.32, radius + i * 0.045, (r() - 0.5) * 0.32); log.castShadow = log.receiveShadow = true; g.add(log);
    for (const side of [-1, 1]) { const end = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.91, 7), M.woodCut); end.position.copy(log.position); end.position.x += side * length * 0.5; end.rotation.y = side * Math.PI / 2; g.add(end); }
  }
  g.scale.setScalar(0.85); return g;
}
function buildEverstonePile(variant = 0, seed = 1) {
  const g = new THREE.Group(), r = rnd(seed * 4283 + variant * 97), stone = mats().stone;
  for (let i = 0, n = 5 + variant; i < n; i++) {
    const size = 0.12 + r() * 0.14, rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), stone);
    rock.position.set((r() - 0.5) * 0.55, size * 0.72, (r() - 0.5) * 0.5); rock.rotation.set(r() * 2, r() * 6.2, r() * 2); rock.castShadow = rock.receiveShadow = true; g.add(rock);
  }
  return g;
}
const PILE = { scrap_metal: buildScrapPile, fresh_wood: buildWoodPile, everstone: buildEverstonePile };

export function createResourcePiles(scene, world, fx, opts = {}) {
  const piles = [], wrecks = [], collected = new Set(inventory.picked?.resources || []);
  let hidden = false, clock = 0, serial = 0;
  function add(resourceId, quantity, x, y, z, extra = {}) {
    const n = ++serial, mesh = (PILE[resourceId] || buildScrapPile)(n % 4, n + Math.round(Math.abs(x * 13 + z * 7)));
    mesh.position.set(x, y, z); mesh.visible = !hidden; scene.add(mesh);
    const p = { id: `res-${n}`, resourceId, quantity: Math.max(1, Math.round(quantity)), name: RESOURCES[resourceId]?.name || resourceId, mesh, x, y, z, taken: false, settled: true, authored: false, vel: null, bounced: false, pickupState: 'rest', pickupCooldown: 0, ...extra };
    piles.push(p); opts.onPile?.(p); return p;
  }
  // A one-time pile placed on purpose. Its id is stable, so once collected it never comes back.
  function authored(id, resourceId, quantity, x, z) {
    if (collected.has(id)) return null;
    return add(resourceId, quantity, x, world.groundAt(x, z), z, { id, authored: true });
  }
  // A pile thrown out of something: a short hop, one dull bounce, then it stays where it lands.
  function drop(resourceId, quantity, x, y, z, push = null) {
    const a = Math.random() * Math.PI * 2, s = 1.2 + Math.random() * 1.2;
    return add(resourceId, quantity, x, y, z, { settled: false, vel: new THREE.Vector3((push?.x ?? Math.sin(a)) * s, 3.2 + Math.random() * 1.2, (push?.z ?? Math.cos(a)) * s) });
  }
  function take(p) {
    if (!p || p.taken) return null;
    p.taken = true; scene.remove(p.mesh); p.mesh.traverse(o => o.geometry?.dispose?.()); p.unreg?.();
    const i = piles.indexOf(p); if (i >= 0) piles.splice(i, 1);
    if (p.authored) { collected.add(p.id); ((inventory.picked ||= {}).resources ||= []).push(p.id); saveInv(); }
    const wreck = p.salvageWreck;
    if (wreck) { wreck.pendingPiles.delete(p); finishWreckIfLooted(wreck); }
    return { resourceId: p.resourceId, quantity: p.quantity };
  }
  // A destroyed tech body, lying where it fell. kind picks its SALVAGE entry.
  function finishWreckIfLooted(w) {
    if (!w || w.left > 0 || w.pendingPiles.size > 0) return false;
    w.finished = true; w.ref.salvaged = true; return true;
  }
  function wreck(ref, kind) {
    const S = SALVAGE[kind]; if (!S || !ref?.pos) return null;
    ref.salvaged = false; ref.wreckLooted = false;
    const w = { ref, kind, S, left: S.quantity, chunk: Math.ceil(S.quantity / S.hits), t: 0, finished: false, pendingPiles: new Set() };
    wrecks.push(w); return w;
  }
  function wreckBonus(ref, quantity = 1) {
    const w = wrecks.find(q => q.ref === ref && !q.finished); if (!w) return null;
    const p = drop(w.S.resourceId, quantity, ref.pos.x + (Math.random() - 0.5) * 0.65, ref.pos.y + 0.45, ref.pos.z + (Math.random() - 0.5) * 0.65);
    if (p) { p.salvageWreck = w; w.pendingPiles.add(p); }
    return p;
  }
  const windowAt = (hits, t, spd) => { for (let i = 0; i < hits.length; i++) { const h = hits[i] / spd; if (t >= h - HITBOX.windowBefore && t <= h + HITBOX.windowAfter) return i; } return -1; };
  function update(dt, rizer) {
    clock += dt;
    for (const p of piles) {
      if (p.settled) {
        // Like loose coins, common materials pull toward Rizer when he gets close.
        // Life Seeds and other future resources remain deliberate/manual pickups.
        if (!['fresh_wood', 'scrap_metal', 'everstone'].includes(p.resourceId)) continue;
        if (!rizer || rizer.hp <= 0 || hidden) continue;
        p.pickupCooldown = Math.max(0, p.pickupCooldown - dt);
        const rp = rizer.position, dx = rp.x - p.x, dy = rp.y + 0.9 - p.y, dz = rp.z - p.z, d = Math.hypot(dx, dz), dist = Math.hypot(dx, dy, dz);
        if (p.pickupState === 'pull') {
          p.pullSpeed = Math.min(18, (p.pullSpeed || 3.2) + 22 * dt);
          const step = Math.min(dist, p.pullSpeed * dt);
          p.mesh.position.x += dx / (dist || 1) * step; p.mesh.position.y += dy / (dist || 1) * step; p.mesh.position.z += dz / (dist || 1) * step;
          p.x = p.mesh.position.x; p.y = p.mesh.position.y; p.z = p.mesh.position.z;
          p.mesh.scale.setScalar(Math.max(0.35, Math.min(1, dist / 1.6)));
          if (dist < 0.65) {
            if (opts.onAutoCollect?.(p)) continue;
            p.pickupState = 'rest'; p.pickupCooldown = 1; p.mesh.scale.setScalar(1);
          }
        } else if (p.pickupCooldown <= 0 && d < 2.6 && Math.abs(p.y - rp.y) < 2.5) p.pickupState = 'pull';
        continue;
      }
      p.vel.y -= 16 * dt; p.mesh.position.addScaledVector(p.vel, dt); p.mesh.rotation.y += dt * 3;
      const gy = world.groundAt(p.mesh.position.x, p.mesh.position.z, p.mesh.position.y + 1);
      if (p.mesh.position.y <= gy) { // heavy debris: one small bounce, never a roll
        p.mesh.position.y = gy;
        if (!p.bounced && p.vel.y < -3) { p.bounced = true; p.vel.set(p.vel.x * 0.35, -p.vel.y * 0.22, p.vel.z * 0.35); }
        else { p.settled = true; fx?.emit(p.mesh.position.x, gy + 0.1, p.mesh.position.z, 4, { color: '#c8b89a', speed: 0.9, up: 0.5, size: 0.25, life: 0.4, g: 1 }); opts.onEvent?.('landed', p); }
      }
      p.x = p.mesh.position.x; p.y = p.mesh.position.y; p.z = p.mesh.position.z;
    }
    // wrecks: a blow that reaches one knocks a share of its scrap loose
    for (let i = wrecks.length - 1; i >= 0; i--) { const w = wrecks[i]; w.t += dt; if (w.finished || w.ref.alive || w.ref.state === 'gone') wrecks.splice(i, 1); }
    const at = rizer?.attack;
    if (!at || !at.hits || !wrecks.length || rizer.hp <= 0 || hidden) return;
    const spd = at.spd || 1, wi = at.kind === 'kickup' ? (at.t * spd >= 0.46 && at.t * spd <= 1.0 ? 0 : -1) : windowAt(at.hits, at.t, spd);
    if (wi < 0 || at.t < at.hits[wi] / spd) return;
    const rp = rizer.position;
    for (const w of wrecks) {
      const q = w.ref.pos, dx = q.x - rp.x, dz = q.z - rp.z, d = Math.hypot(dx, dz);
      if (d > w.S.reach + 1.7 || Math.abs(q.y - rp.y) > 2.5) continue;
      const off = Math.atan2(dx, dz) - rizer.facing; if (d > 0.8 && Math.abs(Math.atan2(Math.sin(off), Math.cos(off))) > 1.2) continue;
      const key = 'sv' + wi + ':' + (w.ref.id || wrecks.indexOf(w)); if ((at.done ||= new Set()).has(key)) continue;
      at.done.add(key);
      const n = Math.min(w.left, w.chunk); w.left -= n;
      const k = d || 1, pile = drop(w.S.resourceId, n, q.x - dx / k * 0.3, q.y + 0.5, q.z - dz / k * 0.3, { x: -dx / k + (Math.random() - 0.5), z: -dz / k + (Math.random() - 0.5) }); // it lands on Rizer's side of the wreck
      if (pile) { pile.salvageWreck = w; w.pendingPiles.add(pile); }
      fx?.emit(q.x, q.y + 0.5, q.z, 14, { color: '#ffc27a', speed: 3.6, up: 1.4, size: 0.16, life: 0.35, g: 7 });
      finishWreckIfLooted(w); // the wreck only clears after every salvage pile has also been collected
      opts.onEvent?.('salvage', w, n);
    }
  }
  function setVisible(v) { hidden = !v; for (const p of piles) p.mesh.visible = v; }
  return { piles, wrecks, authored, drop, take, wreck, wreckBonus, update, setVisible };
}
