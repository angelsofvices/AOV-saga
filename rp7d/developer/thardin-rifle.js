// Thardin Blaster Rifle: one weapon definition, one model, one way of holding and firing it.
// The same rifle is carried by a Nova Guardian (nova.js), lies in the world when its owner falls, and is fired by
// Rizer once he picks it up (game.js). Nothing here knows who is holding it:
//   THARDIN_BLASTER_RIFLE   tuning for the weapon itself
//   buildBlasterRifle()     the model (barrel along +Z, grip at the origin)
//   RIFLE_PROFILE           the reusable humanoid rifle animation slots, and what stands in while a slot is empty
//   createRifleRig(actor)   weaponSocket on the chest + both hands brought to the rifle (works on any Mixamo humanoid)
//   createBolts(...)        the visible energy bolts: muzzle → travel → world or body → impact
import * as THREE from 'three';

export const THARDIN_BLASTER_RIFLE = {
  id: 'blaster', name: 'Thardin Blaster Rifle', weaponType: 'RIFLE', animationProfile: 'RIFLE',
  damage: 6,                 // one bolt, on whoever it hits (Rizer's own shots use playerDamage)
  playerDamage: 4,
  knock: 0.9,
  projectileSpeed: 46, life: 1.3, radius: 0.16,
  fireInterval: 0.32,        // Rizer: seconds between bolts while □ is held
  raise: 0.2,                // seconds to shoulder the rifle before the first bolt
  lower: 1.3,                // seconds it stays shouldered after the last bolt
  effectiveRange: 48,
  color: { bolt: '#ffe14a', core: '#fffbd6', muzzle: '#fff0a0', impact: '#ffd23a', accent: '#39d8ff' }, // yellow Thardin beams, never Astral blue
  audio: { fire: ['thardin', 1, 1], impact: ['land', 0.4, 2.1] },
  droppable: true, pickupable: true, usableByRizer: true
};

// The humanoid rifle set. Every slot is optional: while one is empty the fallback clip plays and the rifle rig
// (below) holds the weapon. Drop Mixamo rifle clips into these slots in the Anim Lab; no code changes needed.
export const RIFLE_PROFILE = {
  key: 'RIFLE_HUMANOID',
  slots: { rifleIdle: 'idle', rifleAim: null, rifleFire: null, rifleWalk: 'walk', rifleRun: 'run', rifleStrafe: 'walk', rifleHit: 'hurt', rifleDeath: 'knockdown' }
};
export const rifleSlot = (actor, slot) => actor?.has(slot) ? slot : RIFLE_PROFILE.slots[slot]; // the slot to play, or its stand-in (null = pose only)

const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3, flatShading: true, ...o });
export function buildBlasterRifle() {
  const g = new THREE.Group(), C = THARDIN_BLASTER_RIFLE.color;
  const dark = M('#23272e'), mid = M('#3c434e'), light = M('#59616e');
  const cyan = M(C.accent, { emissive: new THREE.Color(C.accent), emissiveIntensity: 1.6, metalness: 0.1 });
  const chamber = M('#ffd24a', { emissive: new THREE.Color('#ffb81e'), emissiveIntensity: 1.4, metalness: 0, roughness: 0.3 });
  const box = (w, h, d, mat, x, y, z, rx = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.x = rx; g.add(m); return m; };
  const tube = (r1, r2, len, mat, y, z, n = 10) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, len, n), mat); m.rotation.x = Math.PI / 2; m.position.set(0, y, z); g.add(m); return m; };
  box(0.07, 0.12, 0.42, dark, 0, 0, 0.05);                          // receiver
  box(0.06, 0.1, 0.24, mid, 0, -0.012, -0.27); box(0.07, 0.15, 0.04, dark, 0, -0.02, -0.4); // stock, butt plate
  box(0.064, 0.03, 0.1, cyan, 0, -0.045, -0.3);                     // the stock's cyan mark
  box(0.045, 0.14, 0.055, dark, 0, -0.115, -0.04, 0.32);            // grip
  box(0.014, 0.014, 0.085, cyan, 0, -0.075, 0.035);                 // trigger guard
  box(0.055, 0.1, 0.09, mid, 0, -0.1, 0.13); box(0.058, 0.02, 0.07, chamber, 0, -0.1, 0.13); // power cell
  tube(0.043, 0.043, 0.3, chamber, 0.004, 0.43, 12);                // the energy chamber
  box(0.085, 0.022, 0.36, dark, 0, 0.058, 0.43); box(0.085, 0.022, 0.36, dark, 0, -0.05, 0.43); // its housing rails
  for (const z of [0.27, 0.43, 0.59]) box(0.092, 0.125, 0.018, mid, 0, 0.004, z);                // and ribs
  tube(0.024, 0.024, 0.2, light, 0.004, 0.69); tube(0.036, 0.03, 0.08, dark, 0.004, 0.8, 8);     // barrel, muzzle
  box(0.03, 0.02, 0.42, mid, 0, 0.07, 0.08);                        // top rail
  tube(0.032, 0.032, 0.28, dark, 0.128, 0.04, 10); tube(0.044, 0.034, 0.07, dark, 0.128, 0.2, 10); tube(0.036, 0.03, 0.05, dark, 0.128, -0.12, 10); // scope
  const lens = tube(0.036, 0.036, 0.006, cyan, 0.128, 0.237, 10); lens.material = cyan;
  box(0.02, 0.04, 0.03, mid, 0, 0.095, -0.04); box(0.02, 0.04, 0.03, mid, 0, 0.095, 0.13);       // scope mounts
  for (const s of [-1, 1]) box(0.004, 0.012, 0.16, cyan, s * 0.037, 0.02, 0.08);                 // side accents
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.muzzle = new THREE.Vector3(0, 0.004, 0.85); g.userData.grip = new THREE.Vector3(0, -0.1, -0.04); g.userData.fore = new THREE.Vector3(0, -0.06, 0.27);
  g.userData.chamber = chamber; g.userData.weapon = THARDIN_BLASTER_RIFLE.id;
  g.userData.charge = k => { chamber.emissiveIntensity = 1.4 + k * 5; }; // the telegraph: the chamber brightens before a shot
  // held.js conventions (loot.js · createHeldWeapons): a contact segment and trail colour, unused by a rifle
  g.userData.base = new THREE.Vector3(0, 0, -0.3); g.userData.tip = new THREE.Vector3(0, 0, 0.8); g.userData.hitR = 0.06; g.userData.trail = [1, 0.7, 0.3];
  return g;
}

// ── holding it ──────────────────────────────────────────────────────────────
// Character space at rest: +Z forward, +Y up, +X his left (the same convention as loot.js MOUNTS).
// A transform given in character space → the matching bone-local transform, measured on the rest pose.
export function boneMount(gltf, boneName, off, fwd = new THREE.Vector3(0, 0, 1), up = new THREE.Vector3(0, 1, 0)) {
  const src = gltf.scene, bone = src.getObjectByName(boneName); src.updateMatrixWorld(true);
  const rel = src.matrixWorld.clone().invert().multiply(bone.matrixWorld), inv = rel.clone().invert();
  const Z = fwd.clone().normalize(), Y = up.clone().sub(Z.clone().multiplyScalar(up.dot(Z))).normalize(), X = new THREE.Vector3().crossVectors(Y, Z);
  const charQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)), boneQ = new THREE.Quaternion(), s = new THREE.Vector3();
  rel.decompose(new THREE.Vector3(), boneQ, s);
  return { pos: new THREE.Vector3().setFromMatrixPosition(rel).add(off).applyMatrix4(inv), quat: boneQ.invert().multiply(charQ), scale: new THREE.Vector3(1 / s.x, 1 / s.y, 1 / s.z) };
}
// Where the rifle sits on the chest: low and angled down while carried, level at the shoulder to aim.
export const RIFLE_HOLD = {
  bone: 'mixamorigSpine2',
  ready: { off: new THREE.Vector3(-0.1, -0.2, 0.2), fwd: new THREE.Vector3(0.3, -0.62, 0.72), up: new THREE.Vector3(0.1, 0.75, 0.62) },
  aim: { off: new THREE.Vector3(-0.13, 0.1, 0.17), fwd: new THREE.Vector3(0.06, 0, 1), up: new THREE.Vector3(0, 1, 0) }
};
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
// Turn `bone` so its child lands on `target` (world). Works whatever the rig's own bone axes are.
function pointBone(bone, child, target, weight) {
  bone.getWorldPosition(_a); child.getWorldPosition(_b);
  _c.copy(_b).sub(_a).normalize(); _d.copy(target).sub(_a).normalize();
  _q.setFromUnitVectors(_c, _d); bone.getWorldQuaternion(_q2); _q.multiply(_q2);      // the new world rotation
  bone.parent.getWorldQuaternion(_q3); _q3.invert().multiply(_q);                     // … as a local one
  bone.quaternion.slerp(_q3, weight); bone.updateWorldMatrix(false, true);
}
// Two-bone reach: shoulder → elbow → hand onto `target`, the elbow kept down and out.
function reach(upper, fore, hand, target, pole, weight) {
  upper.getWorldPosition(_a); fore.getWorldPosition(_b); hand.getWorldPosition(_c);
  const l1 = _a.distanceTo(_b), l2 = _b.distanceTo(_c), to = _e.copy(target).sub(_a), d = Math.min(Math.max(to.length(), Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
  to.normalize();
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const side = _d.copy(pole).addScaledVector(to, -pole.dot(to)).normalize(), elbow = new THREE.Vector3().copy(_a).addScaledVector(to, x).addScaledVector(side, h), tip = new THREE.Vector3().copy(_a).addScaledVector(to, d);
  pointBone(upper, fore, elbow, weight); pointBone(fore, hand, tip, weight);
}
// The rifle rig for one actor. attach(rifle) parents it to the weaponSocket; pose(k, pitch) runs after the actor has
// animated: k 0 = carried at the ready, 1 = shouldered and aimed; pitch tilts the upper body onto the target.
export function createRifleRig(actor) {
  const bone = n => actor.model.getObjectByName(n), spine = bone(RIFLE_HOLD.bone), chest = bone('mixamorigSpine1') || spine;
  const arm = s => [bone(`mixamorig${s}Arm`), bone(`mixamorig${s}ForeArm`), bone(`mixamorig${s}Hand`)];
  const R = arm('Right'), L = arm('Left'), ok = !!spine && R.every(Boolean) && L.every(Boolean);
  const socket = new THREE.Group(); socket.name = 'weaponSocket'; if (spine) spine.add(socket);
  const A = ok ? boneMount(actor.gltf, RIFLE_HOLD.bone, RIFLE_HOLD.ready.off, RIFLE_HOLD.ready.fwd, RIFLE_HOLD.ready.up) : null;
  const B = ok ? boneMount(actor.gltf, RIFLE_HOLD.bone, RIFLE_HOLD.aim.off, RIFLE_HOLD.aim.fwd, RIFLE_HOLD.aim.up) : null;
  if (A) { socket.position.copy(A.pos); socket.quaternion.copy(A.quat); socket.scale.copy(A.scale); }
  let rifle = null; const pole = new THREE.Vector3(), tg = new THREE.Vector3(), wq = new THREE.Quaternion();
  return {
    socket, ok, get rifle() { return rifle; },
    attach(r) { rifle = r; r.position.set(0, 0, 0); r.quaternion.identity(); r.scale.setScalar(1); socket.add(r); },
    detach() { const r = rifle; if (!r) return null; r.updateWorldMatrix(true, false); const m = r.matrixWorld.clone(); socket.remove(r); m.decompose(r.position, r.quaternion, r.scale); rifle = null; return r; }, // it keeps its place in the world
    pose(k = 0, pitch = 0, weight = 1) {
      if (!ok) return;
      if (pitch) { chest.rotateOnWorldAxis(_a.set(1, 0, 0).applyQuaternion(actor.model.getWorldQuaternion(wq)), -pitch * k); }
      socket.position.lerpVectors(A.pos, B.pos, k); socket.quaternion.slerpQuaternions(A.quat, B.quat, k);
      actor.model.updateMatrixWorld(true);
      if (!rifle || weight <= 0) return;
      actor.model.getWorldQuaternion(wq);
      reach(R[0], R[1], R[2], tg.copy(rifle.userData.grip).applyMatrix4(rifle.matrixWorld), pole.set(-0.5, -1, -0.3).applyQuaternion(wq), weight);
      reach(L[0], L[1], L[2], tg.copy(rifle.userData.fore).applyMatrix4(rifle.matrixWorld), pole.set(0.6, -1, 0.1).applyQuaternion(wq), weight);
    }
  };
}
// The same two-handed hold for a rifle that something else has already placed (Rizer's, mounted by loot.js).
export function holdRifle(actor, rifle, weight = 1) {
  const bone = n => actor.model.getObjectByName(n), arm = s => [bone(`mixamorig${s}Arm`), bone(`mixamorig${s}ForeArm`), bone(`mixamorig${s}Hand`)];
  const R = arm('Right'), L = arm('Left'); if (!R.every(Boolean) || !L.every(Boolean) || weight <= 0) return;
  actor.model.updateMatrixWorld(true); const wq = actor.model.getWorldQuaternion(new THREE.Quaternion()), tg = new THREE.Vector3(), pole = new THREE.Vector3();
  reach(R[0], R[1], R[2], tg.copy(rifle.userData.grip).applyMatrix4(rifle.matrixWorld), pole.set(-0.5, -1, -0.3).applyQuaternion(wq), weight);
  reach(L[0], L[1], L[2], tg.copy(rifle.userData.fore).applyMatrix4(rifle.matrixWorld), pole.set(0.6, -1, 0.1).applyQuaternion(wq), weight);
}
// With real rifle clips the hands lead and the rifle follows: its grip sits in the right palm and its handguard
// runs through the left palm, so both hands stay on it and the barrel points wherever the clip carries it (no
// tilt of its own). When the left hand is away (slinging it, a fall) it rides in the right hand alone.
const GRIP_Q = new THREE.Quaternion(-0.439, -0.4448, -0.4748, 0.6197); // barrel pose in the right hand's own frame (measured on Rifle · Aiming Idle)
const _g = { r: new THREE.Vector3(), l: new THREE.Vector3(), d: new THREE.Vector3(), x: new THREE.Vector3(), y: new THREE.Vector3(), m: new THREE.Matrix4(), q: new THREE.Quaternion(), q1: new THREE.Quaternion(), hq: new THREE.Quaternion(), s: new THREE.Vector3(), p: new THREE.Vector3(), up: new THREE.Vector3(), t: new THREE.Vector3() };
const TILT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.atan2(0.04, 0.31)); // grip → handguard runs slightly up the rifle
export const hasRifleClips = actor => !!actor?.has('rifleIdle');
export function gripRifle(actor, rifle, kick = 0) {
  const B = actor._rifleHands ||= (() => { const b = n => actor.model.getObjectByName('mixamorig' + n); return { rh: b('RightHand'), rm: b('RightHandMiddle1') || b('RightHandIndex1'), lh: b('LeftHand'), lm: b('LeftHandMiddle1') || b('LeftHandIndex1') }; })();
  if (!B.rh || !B.lh || !rifle.parent) return false;
  actor.model.updateMatrixWorld(true);
  const G = _g, palm = (h, m, out) => { out.setFromMatrixPosition(h.matrixWorld); if (m) out.lerp(G.t.setFromMatrixPosition(m.matrixWorld), 0.6); return out; };
  palm(B.rh, B.rm, G.r); palm(B.lh, B.lm, G.l);
  rifle.parent.matrixWorld.decompose(G.p, G.q1, G.s); const ws = actor.model.getWorldScale(G.t).x, rs = rifle.userData.heldScale || 1;
  B.rh.getWorldQuaternion(G.hq); G.q1.copy(G.hq).multiply(GRIP_Q); // one-handed pose
  const dist = G.d.copy(G.l).sub(G.r).length() / ws, two = 1 - THREE.MathUtils.smoothstep(dist, 0.6, 0.78);
  if (two > 0) {
    G.d.normalize(); G.up.set(0, 1, 0).applyQuaternion(actor.model.getWorldQuaternion(G.q));
    if (Math.abs(G.d.dot(G.up)) > 0.92) G.up.set(0, 1, 0).applyQuaternion(G.q1);
    G.x.crossVectors(G.up, G.d).normalize(); G.y.crossVectors(G.d, G.x);
    G.q.setFromRotationMatrix(G.m.makeBasis(G.x, G.y, G.d)).multiply(TILT);
    G.q1.slerp(G.q, two);
  }
  G.s.setScalar(ws * rs);
  G.p.copy(rifle.userData.grip).multiply(G.s).applyQuaternion(G.q1); G.r.sub(G.p);
  if (kick) G.r.addScaledVector(G.t.set(0, 0, -1).applyQuaternion(G.q1), kick * ws);
  G.m.compose(G.r, G.q1, G.s).premultiply(G.x.set(0, 0, 0) && new THREE.Matrix4().copy(rifle.parent.matrixWorld).invert());
  G.m.decompose(rifle.position, rifle.quaternion, rifle.scale); rifle.updateMatrixWorld(true);
  return true;
}
export const muzzleOf = (rifle, out = new THREE.Vector3()) => { rifle.updateWorldMatrix(true, false); return out.copy(rifle.userData.muzzle).applyMatrix4(rifle.matrixWorld); };

// ── bolts ───────────────────────────────────────────────────────────────────
// One pool for every rifle in the world. A bolt flies straight from the muzzle and stops at the first thing it
// meets: solid world (cover works), a body, or the end of its life.
//   fire(from, dir, { owner, hostile })   hostile bolts look for Rizer; the rest look for enemies
//   update(dt, ctx)  ctx: { rizer, rizerRig(), onPlayerHit(owner, at, dmg), seers, bodies() → [{ center, r, alive, hit }], touch }
export function createBolts(scene, world, fx, onEvent = () => {}) {
  const W = THARDIN_BLASTER_RIFLE, C = W.color, pool = [], next = new THREE.Vector3(), UPZ = new THREE.Vector3(0, 0, 1), _hit = {};
  const geo = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6); geo.rotateX(Math.PI / 2); geo.translate(0, 0, -0.9); // a long beam trailing back from its head
  const mat = new THREE.MeshBasicMaterial({ color: C.bolt, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
  const coreGeo = new THREE.CylinderGeometry(0.022, 0.022, 2.3, 5); coreGeo.rotateX(Math.PI / 2); coreGeo.translate(0, 0, -0.9);
  const coreMat = new THREE.MeshBasicMaterial({ color: C.core });
  let hidden = false;
  function fire(from, dir, { owner = null, hostile = false, damage = hostile ? W.damage : W.playerDamage } = {}) {
    let k = pool.find(q => !q.live);
    if (!k) { k = { mesh: new THREE.Mesh(geo, mat), pos: new THREE.Vector3(), start: new THREE.Vector3(), dir: new THREE.Vector3() }; k.mesh.add(new THREE.Mesh(coreGeo, coreMat)); k.mesh.frustumCulled = false; scene.add(k.mesh); pool.push(k); }
    k.pos.copy(from); k.start.copy(from); k.dir.copy(dir).normalize(); k.age = 0; k.live = true; k.owner = owner; k.hostile = hostile; k.damage = damage;
    k.mesh.position.copy(from); k.mesh.quaternion.setFromUnitVectors(UPZ, k.dir); k.mesh.visible = !hidden;
    fx?.emit(from.x, from.y, from.z, 9, { color: C.muzzle, speed: 2.6, up: 0.3, size: 0.28, life: 0.16, g: 0 });
    onEvent('fire', { from, owner, hostile });
    return k;
  }
  function end(k, at, struck) {
    k.live = false; k.mesh.visible = false;
    fx?.emit(at.x, at.y, at.z, struck ? 14 : 9, { color: C.impact, speed: struck ? 3.6 : 2.6, up: 1, size: 0.22, life: 0.3, g: 5 });
    fx?.emit(at.x, at.y, at.z, 4, { color: C.core, speed: 1.2, up: 0.4, size: 0.34, life: 0.14, g: 0 });
    onEvent('impact', { at, struck, hostile: k.hostile });
  }
  // the nearest point of a body's centre to the bolt's step this frame
  const near = (k, c, sx, sy, sz, len2) => { const dx = c.x - k.pos.x, dy = c.y - k.pos.y, dz = c.z - k.pos.z, t = Math.max(0, Math.min(1, (dx * sx + dy * sy + dz * sz) / (len2 || 1))), ex = dx - sx * t, ey = dy - sy * t, ez = dz - sz * t; return { t, d2: ex * ex + ey * ey + ez * ez }; };
  function update(dt, ctx) {
    for (const k of pool) {
      if (!k.live) continue;
      k.age += dt; next.copy(k.pos).addScaledVector(k.dir, W.projectileSpeed * dt);
      const sx = next.x - k.pos.x, sy = next.y - k.pos.y, sz = next.z - k.pos.z, len2 = sx * sx + sy * sy + sz * sz;
      const far = k.start.distanceTo(next), blocked = world.rayClear(k.start, next, 0.06) < far - 0.12; // rock, wall, tree, terrain
      if (blocked) { end(k, k.pos, false); continue; }
      if (k.hostile) { // a Guardian's bolt: Rizer's own hit capsules decide it
        const r = ctx.rizer, rig = ctx.rizerRig?.(); let struck = false;
        if (r.hp > 0 && !r.inVehicle) {
          if (rig && !rig.fresh && ctx.touch) struck = !!ctx.touch({ a: next, b: next, pa: k.pos, pb: k.pos, r: W.radius }, rig, _hit);
          else { const q = near(k, { x: r.position.x, y: r.position.y + 1.1, z: r.position.z }, sx, sy, sz, len2); struck = q.d2 < 0.55 * 0.55; }
        }
        if (struck) { end(k, next, true); if (r.hurt(k.damage, k.start, k.owner)) ctx.onPlayerHit?.(k.owner, next.clone(), k.damage); continue; }
      } else { // Rizer's bolt: the first Seer, Mori or tech body in its path
        let best = Infinity, grunt = null, body = null;
        for (const g of ctx.seers?.grunts || []) { if (!ctx.seers.alive(g)) continue; const q = near(k, { x: g.pos.x, y: g.pos.y + 1.25, z: g.pos.z }, sx, sy, sz, len2); if (q.d2 < 0.8 * 0.8 && q.t < best) { best = q.t; grunt = g; body = null; } }
        for (const o of ctx.bodies?.() || []) { if (!o.alive || o === k.owner) continue; const q = near(k, o.center, sx, sy, sz, len2); if (q.d2 < (o.r + W.radius) ** 2 && q.t < best) { best = q.t; body = o; grunt = null; } }
        if (grunt) { const res = ctx.seers.hitGrunt(grunt, k.damage, k.dir.x, k.dir.z, 'blaster', W.knock); end(k, res || next, true); ctx.onLanded?.(res, grunt); continue; }
        if (body) { const res = body.hit(k.damage, k.dir.x, k.dir.z, 'blaster', W.knock); end(k, res || next, true); ctx.onLanded?.(res, body); continue; }
        if (world.nature?.userData?.breakables?.strike({ a: k.pos, b: next, r: 0.12 }, k.damage, `bolt-${k.age.toFixed(3)}-${k.start.x.toFixed(2)}`, { first: true })) { end(k, next, false); continue; }
      }
      if (k.age > W.life || far > W.effectiveRange * 1.4 || next.y < world.groundAt(next.x, next.z, next.y + 1) + 0.04) { end(k, next, false); continue; }
      k.pos.copy(next); k.mesh.position.copy(k.pos);
    }
  }
  return { fire, update, pool, setVisible(v) { hidden = !v; if (!v) for (const k of pool) { k.live = false; k.mesh.visible = false; } }, clear() { for (const k of pool) { k.live = false; k.mesh.visible = false; } } };
}
