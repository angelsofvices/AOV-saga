// Pearlbow of Ivirium: visible arrows travel through the world and hit one enemy.
// `power` (0..1, from how long □ was held at full draw) sets speed, reach, damage and knockback.
// `nock(from, to)` shows the loaded arrow on the string (from the draw hand toward the grip); nock(null) hides it.
export const BOWSHOT = { speed: [36, 78], life: [1.2, 2.1], damage: [3, 8], knock: [0.6, 1.8] };
const lerp = (r, p) => r[0] + (r[1] - r[0]) * p;
import * as THREE from 'three';
import { buildPearlArrow } from './loot.js';

// others(): extra bodies an arrow can strike ({ center, r, alive, hit(damage, dx, dz, kind, power) } — the Scanobots)
export function createPearlbow(scene, world, seers, fx, others = null, sfx = null) {
  const shots = [], UP = new THREE.Vector3(0, 0, 1), next = new THREE.Vector3(); let shotId = 0;
  const nocked = buildPearlArrow(); nocked.visible = false; scene.add(nocked); const _d = new THREE.Vector3();
  function nock(from, to) {
    if (!from) { nocked.visible = false; return; }
    _d.copy(to).sub(from); const len = _d.length(); if (len < 1e-3) return; _d.divideScalar(len);
    nocked.position.copy(from).addScaledVector(_d, 0.36); nocked.quaternion.setFromUnitVectors(UP, _d); nocked.visible = true;
  }
  function shoot(rizer, target, power = 0) {
    const from = rizer.position.clone().add(new THREE.Vector3(0, 1.55, 0));
    const hand = rizer.actor?.model?.getObjectByName('mixamorigLeftHand');
    if (hand) { hand.updateWorldMatrix(true, false); from.copy(hand.getWorldPosition(new THREE.Vector3())); }
    from.addScaledVector(new THREE.Vector3(Math.sin(rizer.facing), 0, Math.cos(rizer.facing)), 0.45);
    const aim = target && (target.isScanobot ? target.alive : seers.alive(target)) ? target.pos.clone().add(new THREE.Vector3(0, target.aimY ?? 1.25, 0)) : from.clone().add(new THREE.Vector3(Math.sin(rizer.facing), 0, Math.cos(rizer.facing)).multiplyScalar(55));
    const dir = aim.sub(from).normalize(), mesh = buildPearlArrow();
    mesh.position.copy(from); mesh.quaternion.setFromUnitVectors(UP, dir); scene.add(mesh);
    shots.push({ id: ++shotId, mesh, pos: from.clone(), start: from.clone(), dir, age: 0, target, power, speed: lerp(BOWSHOT.speed, power), life: lerp(BOWSHOT.life, power) });
    nocked.visible = false;
    fx.emit(from.x, from.y, from.z, 5 + Math.round(power * 10), { color: '#f3ddff', speed: 0.8 + power * 1.6, up: 0.2, size: 0.18 + power * 0.1, life: 0.2, g: 0 });
  }
  function dispose(s) { scene.remove(s.mesh); s.mesh.traverse(o => { o.geometry?.dispose(); if (o.material?.dispose) o.material.dispose(); }); }
  function update(dt) {
    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i]; s.age += dt; next.copy(s.pos).addScaledVector(s.dir, s.speed * dt);
      let hit = null, best = Infinity;
      const sx = next.x - s.pos.x, sy = next.y - s.pos.y, sz = next.z - s.pos.z, len2 = sx * sx + sy * sy + sz * sz;
      for (const g of seers.grunts) {
        if (!seers.alive(g)) continue;
        const dx = g.pos.x - s.pos.x, dy = g.pos.y + 1.25 - s.pos.y, dz = g.pos.z - s.pos.z;
        const t = Math.max(0, Math.min(1, (dx * sx + dy * sy + dz * sz) / (len2 || 1)));
        const ex = dx - sx * t, ey = dy - sy * t, ez = dz - sz * t;
        if (ex * ex + ey * ey + ez * ez < 0.85 * 0.85 && t < best) { hit = g; best = t; }
      }
      let body = null;
      for (const o of others?.() || []) {
        if (!o.alive) continue;
        const dx = o.center.x - s.pos.x, dy = o.center.y - s.pos.y, dz = o.center.z - s.pos.z;
        const t = Math.max(0, Math.min(1, (dx * sx + dy * sy + dz * sz) / (len2 || 1)));
        const ex = dx - sx * t, ey = dy - sy * t, ez = dz - sz * t;
        if (ex * ex + ey * ey + ez * ez < (o.r + 0.12) ** 2 && t < best) { hit = null; body = o; best = t; }
      }
      const blocked = world.rayClear(s.start, next, 0.06) < s.start.distanceTo(next) - 0.12;
      if (body && !blocked) {
        const result = body.hit(Math.round(lerp(BOWSHOT.damage, s.power)), s.dir.x, s.dir.z, 'bow', lerp(BOWSHOT.knock, s.power));
        if (result) sfx?.play('arrow_hit', 0.8 + s.power * 0.2);
        if (result) fx.emit(result.x, result.y, result.z, 10 + Math.round(s.power * 14), { color: '#fff0ff', speed: 2.4, up: 0.6, size: 0.22, life: 0.35, g: 1 });
      }
      if (hit && !blocked) {
        const result = seers.hitGrunt(hit, Math.round(lerp(BOWSHOT.damage, s.power)), s.dir.x, s.dir.z, 'bow', lerp(BOWSHOT.knock, s.power));
        sfx?.play('arrow_hit', 0.8 + s.power * 0.2); // the arrow striking an enemy
        fx.emit(result.x, result.y, result.z, 10 + Math.round(s.power * 14), { color: '#fff0ff', speed: 2.4, up: 0.6, size: 0.22, life: 0.35, g: 1 });
      }
      const stoneHit = !hit && !body && world.nature?.userData?.breakables?.strike({ a: s.pos, b: next, r: 0.12 }, Math.round(lerp(BOWSHOT.damage, s.power)), `pearl-arrow-${s.id}`, { first: true });
      if (stoneHit) { dispose(s); shots.splice(i, 1); continue; }
      if (hit || body || blocked || s.age > s.life || next.y < world.groundAt(next.x, next.z) + 0.05) { dispose(s); shots.splice(i, 1); continue; }
      s.pos.copy(next); s.mesh.position.copy(s.pos);
      if (Math.random() < dt * (20 + s.power * 40)) fx.emit(s.pos.x, s.pos.y, s.pos.z, 1, { color: '#f4e3ff', speed: 0.2, up: 0, size: 0.1, life: 0.15, g: 0 });
    }
  }
  return { shoot, update, nock, shots };
}
