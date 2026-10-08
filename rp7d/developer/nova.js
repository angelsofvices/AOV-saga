// Nova Guardian: a Thardin combat unit. (At a quarter health its rifle is knocked loose and it fights on hand to hand.)
// Nova Guardian: a Thardin combat unit. A humanoid on the shared Mixamo rig that fights with a rifle, not fists:
// it patrols, sees Rizer (range, facing, line of sight), squares up, shoulders its Thardin Blaster Rifle, lets the
// chamber charge (the tell), fires a short burst of visible bolts, then moves — forward if he is far, sideways at
// mid range, back if he closes in — and does it again. Cover stops both its sight and its bolts.
// The rifle is its own asset (thardin-rifle.js) held on the Guardian's weaponSocket. When the Guardian falls the
// rifle comes off the socket, drops, and lies in the world as that same weapon for Rizer to take (game.js).
// Tech body interface (alive · center · r · aimY · hit) so lock-on, arrows, bolts and the Astral moves all reach it.
import * as THREE from 'three';
import { Actor, loadGLB } from './actor.js';
import { clamp, damp, rng } from './util.js';
import { HitRig, touch, STRIKERS, HITBOX } from './hitbox.js';
import { COMBAT, BLADES } from './rizer.js';
import { quarterAt } from './world-data.js';
import { THARDIN_BLASTER_RIFLE, RIFLE_PROFILE, rifleSlot, buildBlasterRifle, createRifleRig, boneMount, muzzleOf, hasRifleClips, gripRifle } from './thardin-rifle.js';

export const NOVA_GUARDIAN = {
  id: 'nova', key: 'nova', name: 'Nova Guardian', faction: 'Thardin', enemyType: 'RANGED_TECH',
  url: './assets/seer/seer.glb', scale: 1.3,          // the shared humanoid rig, dressed in Thardin armor (dressNova)
  health: 26, radius: 0.6,
  walk: 1.9, combat: 3.2, turn: 3.6,                  // patrol / combat speed · turn rate (rad/s)
  detectionRange: 30, sense: 4, cone: 1.1,            // sight · the range it notices him at whatever it faces · half-angle of its view
  reactionTime: 0.85,                                 // alert: it turns to him before it may raise the rifle
  preferredCombatRange: [11, 20], retreatRange: 7, maxRange: 40,
  accuracy: 0.04, lead: 0.3,                          // spread (rad) · how much of Rizer's motion it aims ahead of (0–1)
  aimTime: 0.8, burst: [1, 3], burstGap: 0.36, recover: 0.7, // raise + charge (the tell) · bolts per burst · between bolts · after
  move: [1.0, 1.9],                                   // seconds spent on one advance / strafe / fall back
  choices: { long: { fire: 65, advance: 35 }, mid: { fire: 55, strafe: 45 }, close: { retreat: 75, fire: 25 } },
  stagger: { every: 9, time: 0.7 }, flinch: 0.35,
  disarmAt: 0.25,                                     // at this fraction of its health the rifle is knocked out of its hands
  // Disarmed, it fights hand to hand like a Seer, but better: quicker to commit, quicker to recover, and it hits harder.
  melee: { run: 6.6, punch: { damage: 8, range: 1.3 }, kick: { damage: 12, range: 1.65 }, kickOdds: 0.4, windup: [0.16, 0.32], combo: [1, 3], cooldown: [0.45, 1.0], speed: 1.08, arc: 0.9 },
  equippedWeapon: THARDIN_BLASTER_RIFLE.id, animationProfile: RIFLE_PROFILE.key,
  count: 1, spawn: [45, 110], loop: [5, 9],           // first playtest: one Guardian, on a small loop out past the town
  corpse: 40, respawn: 240, respawnDist: 70, visible: 120
};
const rand = ([a, b]) => a + Math.random() * (b - a);
const pick = table => { let r = Math.random() * Object.values(table).reduce((s, w) => s + w, 0); for (const [k, w] of Object.entries(table)) if ((r -= w) < 0) return k; return Object.keys(table)[0]; };
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

// Thardin armor over the shared body: graphite plate, cyan light, a cyan visor. Rigid pieces ride the bones, so
// every existing clip still drives it.
const ARMOR = { plate: '#3b424e', dark: '#22262d', trim: '#59616f', cyan: '#39d8ff' };
function dressNova(actor) {
  const tint = { R_armor: ['#353b46', 0.3, 0.5], R_navy: ['#262a32', 0.25, 0.55], R_navyDark: ['#1a1d23', 0.25, 0.6], R_silver: ['#5a6270', 0.35, 0.45], R_void: ['#0a0b0e', 0.1, 0.7] };
  const glow = [];
  actor.model.traverse(o => {
    if (!o.isMesh) return;
    const swap = m => { const c = m.clone(), t = tint[m.name]; if (t) { c.color.set(t[0]); c.metalness = t[1]; c.roughness = t[2]; } else if (m.name === 'R_visor') { c.color.set(ARMOR.cyan); c.emissive = new THREE.Color(ARMOR.cyan); c.emissiveIntensity = 1.5; glow.push(c); } return c; };
    o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
  });
  const plate = new THREE.MeshStandardMaterial({ color: ARMOR.plate, metalness: 0.3, roughness: 0.5, flatShading: true }), dark = new THREE.MeshStandardMaterial({ color: ARMOR.dark, metalness: 0.25, roughness: 0.6, flatShading: true });
  const cyan = new THREE.MeshStandardMaterial({ color: ARMOR.cyan, emissive: new THREE.Color(ARMOR.cyan), emissiveIntensity: 1.6, roughness: 0.4 }); glow.push(cyan);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const on = (boneName, mesh, off, fwd, up) => { const b = actor.model.getObjectByName(boneName); if (!b) return; const m = boneMount(actor.gltf, boneName, off, fwd, up); mesh.position.copy(m.pos); mesh.quaternion.copy(m.quat); mesh.scale.copy(m.scale); mesh.castShadow = true; b.add(mesh); };
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const part = (w, h, d, mat, strips = []) => { const g = box(w, h, d, mat); for (const [sw, sh, sd, x, y, z] of strips) { const s = box(sw, sh, sd, cyan); s.position.set(x, y, z); g.add(s); } return g; };
  on('mixamorigSpine2', part(0.4, 0.22, 0.12, plate, [[0.12, 0.016, 0.01, 0, 0.02, 0.062], [0.016, 0.07, 0.01, -0.12, 0.0, 0.062], [0.016, 0.07, 0.01, 0.12, 0.0, 0.062]]), V(0, 0.05, 0.12));   // chest
  on('mixamorigSpine2', part(0.32, 0.36, 0.13, dark, [[0.03, 0.24, 0.012, -0.045, 0, -0.068], [0.03, 0.24, 0.012, 0.045, 0, -0.068]]), V(0, 0.02, -0.16));                                  // back unit
  on('mixamorigSpine', part(0.3, 0.12, 0.2, dark, [[0.1, 0.014, 0.01, 0, 0, 0.102]]), V(0, 0.02, 0.01));                                                                                 // abdomen
  for (const [S, s] of [['Left', 1], ['Right', -1]]) {
    on(`mixamorig${S}Arm`, part(0.22, 0.12, 0.24, plate, [[0.1, 0.016, 0.01, 0, 0.0, 0.122]]), V(s * 0.03, 0.06, 0));                    // shoulder
    on(`mixamorig${S}ForeArm`, part(0.2, 0.1, 0.11, plate, [[0.09, 0.014, 0.01, 0, 0.02, 0.056]]), V(s * 0.13, 0, 0));                  // forearm
    on(`mixamorig${S}UpLeg`, part(0.15, 0.26, 0.17, plate, [[0.014, 0.12, 0.01, 0, 0, 0.086]]), V(s * 0.01, -0.2, 0.01));               // thigh
    on(`mixamorig${S}Leg`, part(0.13, 0.28, 0.15, plate, [[0.07, 0.016, 0.01, 0, 0.1, 0.076]]), V(0, -0.2, 0.01));                      // shin + knee light
  }
  // A plain round head with a blue circle on the face. It replaces the shared body's hooded head, which is folded away inside it.
  const head = actor.model.getObjectByName('mixamorigHead'), helmet = new THREE.Group();
  helmet.add(new THREE.Mesh(new THREE.SphereGeometry(0.175, 20, 14), new THREE.MeshStandardMaterial({ color: ARMOR.dark, metalness: 0.25, roughness: 0.55 })));
  const cap = new THREE.SphereGeometry(0.179, 24, 8, 0, Math.PI * 2, 0, 0.62); cap.rotateX(Math.PI / 2); helmet.add(new THREE.Mesh(cap, cyan)); // the blue circle, curved onto the face
  helmet.traverse(o => { if (o.isMesh) o.castShadow = true; });
  if (head) on('mixamorigNeck', helmet, V(0, 0.2, 0.02));
  return { glow, head };
}
function barSprite() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 12; const tex = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); s.scale.set(1.5, 0.14, 1); s.renderOrder = 9;
  s.redraw = f => { const g = c.getContext('2d'); g.clearRect(0, 0, 128, 12); g.fillStyle = 'rgba(8,12,18,.82)'; g.fillRect(0, 0, 128, 12); g.fillStyle = '#39d8ff'; g.fillRect(2, 2, 124 * clamp(f, 0, 1), 8); tex.needsUpdate = true; };
  return s;
}

// opts: { bolts (thardin-rifle.js createBolts) · onEvent(type, guardian, extra) }
export async function createNovaGuardians(scene, world, W, fx, opts = {}) {
  const P = NOVA_GUARDIAN, list = [], live = [], drops = [];
  const home = W.playerStart, B = (world.bound || 300) - 14;
  let hidden = false, clock = 0, serial = 0;
  const tA = new THREE.Vector3(), tB = new THREE.Vector3(), tC = new THREE.Vector3(), probe = new THREE.Vector3(), _hit = {};
  const gltf = await loadGLB(P.url);

  const onLand = (x, z) => (!world.containsLand || world.containsLand(x, z)) && world.waterAt(x, z) < world.heightAt(x, z) - 0.1;
  const open = (x, z, town = false) => {
    if (Math.abs(x) > B || Math.abs(z) > B || !onLand(x, z) || (!town && quarterAt(x, z, W) === 'core')) return false;
    if (Math.abs(world.heightAt(x + 1.2, z) - world.heightAt(x - 1.2, z)) + Math.abs(world.heightAt(x, z + 1.2) - world.heightAt(x, z - 1.2)) > 1.4) return false;
    probe.set(x, world.heightAt(x, z), z); return !world.resolve(probe, 1.0);
  };
  function loopAround(x, z, r, town) { // a small patrol loop on open ground (fewer points if the ground is tight)
    const a0 = r() * Math.PI * 2, pts = [];
    for (let k = 0; k < 4; k++) { const aa = a0 + k * Math.PI / 2, rr = P.loop[0] + r() * (P.loop[1] - P.loop[0]), v = new THREE.Vector2(x + Math.sin(aa) * rr, z + Math.cos(aa) * rr); if (open(v.x, v.y, town)) pts.push(v); }
    if (pts.length < 2) pts.push(new THREE.Vector2(x, z), new THREE.Vector2(x + 0.5, z + 0.5));
    return pts;
  }
  function make(x, z, town = false, r = Math.random) {
    const actor = new Actor(gltf, P.scale, P.key), dressed = dressNova(actor);
    const root = new THREE.Group(); root.add(actor.pivot); scene.add(root);
    const bar = barSprite(); bar.visible = false; scene.add(bar);
    const g = {
      id: `nova-${++serial}`, isScanobot: true, isNova: true, T: P, name: P.name, home: new THREE.Vector2(x, z), pts: loopAround(x, z, r, town), wp: 1, root, actor, bar, glow: dressed.glow,
      pos: new THREE.Vector3(), center: new THREE.Vector3(), knock: new THREE.Vector3(), heading: 0, speed: 0, r: P.radius,
      rig: new HitRig(actor), hold: createRifleRig(actor), stow: makeStow(actor), carry: 'stowed', grabbed: false, rifle: null, head: dressed.head,
      state: 'patrol', t: 0, hp: P.health, seen: false, seenT: 0, raise: 0, charge: 0, shots: 0, shotT: 0, hurt: 0, flash: 0, barT: 0, move: null, side: serial % 2 ? 1 : -1, respawnAt: 0, fallT: 0,
      get alive() { return alive(g); }, get aimY() { return 1.3; },
      hit: (damage, dx, dz, kind, power) => hit(g, damage, dx, dz, kind, power)
    };
    reset(g); list.push(g); return g;
  }
  // Where the rifle rides when it is not in its hands: slung across the back, muzzle up over the left shoulder
  // (the same mount Rizer uses for his own Thardin Blaster Rifle).
  const STOW = { bone: 'mixamorigHips', off: new THREE.Vector3(0, 0.35, -0.2), fwd: new THREE.Vector3(0.35, 0.94, 0), up: new THREE.Vector3(0, 0, -1) };
  function makeStow(actor) {
    const hips = actor.model.getObjectByName(STOW.bone); if (!hips) return null;
    const m = boneMount(actor.gltf, STOW.bone, STOW.off, STOW.fwd, STOW.up), sock = new THREE.Group(); sock.name = 'rifleStow';
    sock.position.copy(m.pos); sock.quaternion.copy(m.quat); sock.scale.copy(m.scale); hips.add(sock); return sock;
  }
  function stowRifle(g) { if (!g.rifle || !g.stow) return; g.stow.add(g.rifle); g.rifle.position.set(0, 0, 0); g.rifle.quaternion.identity(); g.rifle.scale.setScalar(1); }
  const drawRifle = g => { if (g.rifle && g.rifle.parent !== g.hold.socket) g.hold.socket.add(g.rifle); };
  // Rifle stowed while calm; drawn (Grab Rifle From Behind Shoulder) the moment it turns hostile, put back when it stands down.
  function carryUpdate(g, hos) {
    const A = g.actor; if (!g.rifle) { g.carry = 'none'; return; }
    if (g.carry === 'stowed' && hos && !A.busy) { if (A.has('drawBlaster') && A.play('drawBlaster', 2.1)) { g.carry = 'draw'; g.grabbed = false; } else { drawRifle(g); g.carry = 'ready'; } }
    else if (g.carry === 'ready' && !hos && !A.busy) { if (A.has('sheatheBlaster') && A.play('sheatheBlaster', 1.9)) { g.carry = 'sheath'; g.grabbed = false; } else { stowRifle(g); g.carry = 'stowed'; } }
    else if (g.carry === 'draw' || g.carry === 'sheath') {
      const s = A.shot, kind = g.carry === 'draw' ? 'drawBlaster' : 'sheatheBlaster';
      if (!s || s.kind !== kind) { if (g.carry === 'draw' || hos) { drawRifle(g); g.carry = 'ready'; } else { stowRifle(g); g.carry = 'stowed'; } } // clip over (or a hit cut it short)
      else if (!g.grabbed && s.t >= s.dur * 0.5) { g.grabbed = true; if (g.carry === 'draw') drawRifle(g); else stowRifle(g); }
    }
  }
  const inHands = g => !!g.rifle && (g.carry === 'ready' || (g.carry === 'draw' && g.grabbed) || (g.carry === 'sheath' && !g.grabbed));
  function reset(g) {
    const s = g.pts[0]; g.pos.set(s.x, world.groundAt(s.x, s.y), s.y); g.wp = 1 % g.pts.length; g.heading = Math.atan2(g.pts[g.wp].x - s.x, g.pts[g.wp].y - s.y);
    g.state = 'patrol'; g.t = 0; g.hp = P.health; g.seen = false; g.raise = 0; g.charge = 0; g.hurt = 0; g.flash = 0; g.barT = 0; g.speed = 0; g.move = null; g.fallT = 0; g.knock.set(0, 0, 0);
    g.actor.shot = null; g.actor.pivot.rotation.set(0, 0, 0); g.actor.pivot.position.y = 0; g.root.visible = !hidden; g.bar.redraw(1);
    if (!g.rifle) { g.rifle = buildBlasterRifle(); g.rifle.userData.owner = g.id; g.hold.attach(g.rifle); } // a Guardian always carries one: the same weapon Rizer can end up with
    g.carry = 'stowed'; g.grabbed = false; stowRifle(g); // calm: the rifle is on its back
    place(g);
  }
  const alive = g => g.state !== 'down' && g.state !== 'gone';
  const hostile = g => alive(g) && g.state !== 'patrol' && g.state !== 'idle' && g.state !== 'return';
  function place(g) { g.center.set(g.pos.x, g.pos.y + 1.25, g.pos.z); g.root.position.copy(g.pos); g.root.rotation.y = g.heading; g.bar.position.set(g.pos.x, g.pos.y + 2.75, g.pos.z); }
  // Sight: range, then facing (until it is already hunting), then a clear line through the world.
  function canSee(g, rizer) {
    if (rizer.hp <= 0) return false;
    const rp = rizer.position, dx = rp.x - g.pos.x, dz = rp.z - g.pos.z, d = Math.hypot(dx, dz);
    if (rizer.hidden) return d < 1.6;
    if (d < P.sense * (rizer.crouched ? (rizer.stealth?.sense ?? 0.5) : 1)) return true;
    if (d > P.detectionRange * (rizer.crouched ? (rizer.stealth?.sight ?? 0.6) : 1) && !hostile(g)) return false;
    if (d > P.maxRange) return false;
    if (Math.abs(wrap(Math.atan2(dx, dz) - g.heading)) > P.cone && !hostile(g)) return false;
    tA.set(g.pos.x, g.pos.y + 1.9, g.pos.z); tB.set(rp.x, rp.y + 1.3, rp.z);
    return world.rayClear(tA, tB, 0.1) >= tA.distanceTo(tB) - 0.8;
  }
  const alertNow = (g, t = P.reactionTime) => { g.state = 'alert'; g.t = t; g.move = null; opts.onEvent?.('alert', g); };

  function hit(g, damage, dx, dz, kind = 'punch', power = 1) {
    if (!alive(g)) return null;
    g.hp -= damage; g.hurt += damage; g.flash = 0.12; g.barT = 5; g.bar.redraw(Math.max(0, g.hp) / P.health);
    g.knock.set(dx, 0, dz).multiplyScalar(Math.min(4, 1.6 * power));
    const at = { x: g.center.x, y: g.center.y, z: g.center.z, name: P.name, scanobot: true, nova: true, down: false };
    fx?.emit(at.x, at.y, at.z, 6, { color: '#8fe4ff', speed: 3, up: 1, size: 0.14, life: 0.3, g: 6 });
    if (g.hp <= 0) { if (g.rifle) at.drop = THARDIN_BLASTER_RIFLE.name; defeat(g, kind, dx, dz); at.down = true; return at; }
    if (g.rifle && g.hp <= P.health * P.disarmAt) { dropRifle(g, dx, dz); g.raise = 0; opts.onEvent?.('disarmed', g); } // the rifle is out of the fight; the Guardian is not
    const big = g.hurt >= P.stagger.every; if (big) g.hurt = 0;
    g.state = 'flinch'; g.t = big ? P.stagger.time : P.flinch; g.move = null; g.charge = 0; // a hit breaks its aim
    const slot = rifleSlot(g.actor, 'rifleHit'); if (slot && g.actor.has(slot)) g.actor.play(slot, big ? 0.9 : 1.3);
    return at;
  }
  function stun(g, from) {
    if (!alive(g)) return null;
    g.state = 'flinch'; g.t = 1.3; g.move = null; g.charge = 0; g.flash = 0.12; g.barT = 5;
    if (g.actor.has('stunned')) g.actor.play('stunned');
    return { x: g.center.x, y: g.center.y, z: g.center.z, name: P.name };
  }
  // Defeated: combat stops, the body falls, and the rifle leaves the socket as its own object in the world.
  function defeat(g, kind, dx = 0, dz = 0) {
    g.state = 'down'; g.t = 0; g.move = null; g.speed = 0; g.bar.visible = false; g.raise = 0; g.charge = 0; g.fallT = 0;
    const slot = kind === 'thunder' && g.actor.has('shocked') ? 'shocked' : rifleSlot(g.actor, 'rifleDeath');
    g.fallClip = !!(slot && g.actor.has(slot)); if (g.fallClip) g.actor.play(slot, 1, { hold: true });
    fx?.emit(g.center.x, g.center.y, g.center.z, 20, { color: '#8fe4ff', speed: 4, up: 1.6, size: 0.3, life: 0.5, g: 4 });
    if (g.rifle) dropRifle(g, dx, dz);
    opts.onEvent?.('defeated', g, kind);
  }
  function dropRifle(g, dx, dz) {
    if (g.rifle && g.rifle.parent !== g.hold.socket) g.hold.socket.attach(g.rifle); // (it may be on its back: keep its place in the world)
    const r = g.hold.detach(); if (!r) return; g.rifle = null; g.carry = 'none';
    scene.add(r); r.userData.owner = null; r.userData.charge(0);
    const side = g.side, s = Math.cos(g.heading), c = -Math.sin(g.heading); // (s, c): its right-hand side
    const d = { id: `rifle-${g.id}-${Math.round(clock * 10)}`, weapon: THARDIN_BLASTER_RIFLE.id, name: THARDIN_BLASTER_RIFLE.name, mesh: r, taken: false, settled: false, x: r.position.x, y: r.position.y, z: r.position.z,
      vel: new THREE.Vector3(dx * 1.4 + s * side * 1.2, 2.6, dz * 1.4 + c * side * 1.2), spin: new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 6), flat: new THREE.Quaternion() };
    drops.push(d); opts.onEvent?.('drop', g, d);
  }
  function updateDrops(dt) {
    for (const d of drops) {
      if (d.taken) continue; const m = d.mesh; m.visible = !hidden;
      if (d.settled) { if (Math.random() < dt * 1.5) fx?.emit(d.x, d.y + 0.25, d.z, 1, { color: '#ffb347', speed: 0.2, up: 0.5, size: 0.14, life: 0.7, g: -0.3 }); continue; }
      d.vel.y -= 14 * dt; m.position.addScaledVector(d.vel, dt);
      m.rotateX(d.spin.x * dt); m.rotateY(d.spin.y * dt); m.rotateZ(d.spin.z * dt);
      const gy = world.groundAt(m.position.x, m.position.z, m.position.y + 1) + 0.07;
      if (m.position.y <= gy) { // it lands on its side and stays where it fell
        m.position.y = gy; d.settled = true; const yaw = Math.atan2(d.vel.x, d.vel.z);
        m.quaternion.setFromEuler(new THREE.Euler(0, yaw, Math.PI / 2, 'YXZ'));
        fx?.emit(m.position.x, gy, m.position.z, 5, { color: '#c8b89a', speed: 1, up: 0.6, size: 0.3, life: 0.5, g: 1 }); opts.onEvent?.('landed', null, d);
      }
      d.x = m.position.x; d.y = m.position.y; d.z = m.position.z;
    }
  }
  // Rizer takes the dropped rifle: the world object goes, the weapon id comes back for his inventory.
  function take(d) {
    if (!d || d.taken) return null;
    d.taken = true; scene.remove(d.mesh); d.mesh.traverse(o => { o.geometry?.dispose?.(); });
    const i = drops.indexOf(d); if (i >= 0) drops.splice(i, 1);
    return d.weapon;
  }

  function strike(g) { // one blow of its combo, on the shared punch / kick clips
    const M = P.melee, kind = Math.random() < M.kickOdds ? 'kick' : 'punch', slots = [kind, kind + '2', kind + '3'].filter(s => g.actor.has(s)), slot = slots[Math.floor(Math.random() * slots.length)] || kind;
    const T = g.actor.timing(slot); g.actor.play(slot, M.speed);
    g.state = 'strike'; g.t = 0; g.atk = { kind, damage: M[kind].damage, range: M[kind].range, active: (T.hits?.[0] ?? T.active) / M.speed, recover: (T.dur || T.recover) / M.speed, landed: false };
  }
  function fire(g, rizer) {
    const from = muzzleOf(g.rifle, tA), rp = rizer.position, d = from.distanceTo(rp), lead = Math.min(1, d / THARDIN_BLASTER_RIFLE.projectileSpeed) * P.lead;
    tB.set(rp.x + (rizer.vel?.x || 0) * lead, rp.y + 1.15, rp.z + (rizer.vel?.z || 0) * lead).sub(from).normalize();
    tB.x += (Math.random() - 0.5) * 2 * P.accuracy; tB.y += (Math.random() - 0.5) * P.accuracy; tB.z += (Math.random() - 0.5) * 2 * P.accuracy;
    opts.bolts?.fire(from, tB, { owner: g, hostile: true });
  }

  // ── Rizer's blows: the same contact rules he has against everything else ──
  const windowAt = (hits, t, spd) => { for (let i = 0; i < hits.length; i++) { const h = hits[i] / spd; if (t >= h - HITBOX.windowBefore && t <= h + HITBOX.windowAfter) return i; } return -1; };
  function playerBlows(dt, rizer, hooks) {
    const at = rizer.attack, rig = hooks.rizerRig?.();
    if (!at || !rig || rig.fresh || rizer.hp <= 0 || rizer.inVehicle || !at.hits) return;
    const rp = rizer.position, spd = at.spd || COMBAT[at.kind]?.speed || 1;
    const w = at.kind === 'kickup' ? (at.t * spd >= 0.46 && at.t * spd <= 1.0 ? 0 : -1) : windowAt(at.hits, at.t, spd);
    if (w < 0) return;
    const strikers = (STRIKERS[at.kind] || STRIKERS.punch).map(k => rig.parts[k]).filter(q => q && q.vel >= HITBOX.minSpeed);
    if (BLADES[at.kind]) { const bl = hooks.blade?.(); if (bl) strikers.push({ a: bl.a, b: bl.b, pa: bl.a, pb: bl.b, r: bl.r ?? 0.05, vel: 99 }); }
    if (!strikers.length) return;
    const stageMul = (COMBAT.comboDamage?.[at.stage - 1] || 1) / Math.max(1, at.hits.length) * (at.od?.damage || 1), base = COMBAT[at.kind]?.damage || 1;
    for (const g of list) {
      if (!alive(g) || Math.hypot(g.pos.x - rp.x, g.pos.z - rp.z) > 4) continue;
      const key = 'nv' + w + ':' + g.id; if ((at.done ||= new Set()).has(key)) continue;
      let h = null; for (const s of strikers) { h = touch(s, g.rig, _hit, at.kind === 'kickup') && { ..._hit }; if (h) break; }
      if (!h) continue;
      at.done.add(key);
      const kx = g.pos.x - rp.x, kz = g.pos.z - rp.z, kd = Math.hypot(kx, kz) || 1, fin = at.stage >= rizer.comboMax(at.kind) && w === at.hits.length - 1;
      const res = hit(g, base * stageMul, kx / kd, kz / kd, at.kind, (fin ? 1.3 : 0.6) * (at.od?.power || 1));
      if (res) hooks.onLanded?.({ ...res, x: h.at.x, y: h.at.y, z: h.at.z, part: h.part }, at.kind, g);
    }
  }

  const nearestWp = g => { let best = 0, bd = Infinity; g.pts.forEach((v, i) => { const d = Math.hypot(v.x - g.pos.x, v.y - g.pos.z); if (d < bd) { bd = d; best = i; } }); return best; };
  function update(dt, t, rizer, hooks = {}) {
    clock += dt; live.length = 0; updateDrops(dt);
    const rp = rizer.position, [nearR, farR] = P.preferredCombatRange;
    for (const g of list) {
      const dx = rp.x - g.pos.x, dz = rp.z - g.pos.z, dist = Math.hypot(dx, dz), toP = Math.atan2(dx, dz);
      if (g.state === 'gone') { if (clock >= g.respawnAt && Math.hypot(rp.x - g.pts[0].x, rp.z - g.pts[0].y) > P.respawnDist) reset(g); continue; }
      if (alive(g)) live.push(g);
      g.barT = Math.max(0, g.barT - dt); g.flash = Math.max(0, g.flash - dt);
      if (alive(g) && (g.seenT -= dt) <= 0) { g.seenT = 0.15 + Math.random() * 0.1; g.seen = canSee(g, rizer); }
      let want = 0, face = null, dir = 0, raise = 0; // dir: 0 forward · π back · ±π/2 sideways (relative to its heading)
      switch (g.state) {
        case 'patrol': case 'return': {
          if (g.seen) { alertNow(g); break; }
          const tg = g.pts[g.wp], tx = tg.x - g.pos.x, tz = tg.y - g.pos.z;
          if (Math.hypot(tx, tz) < 0.9) { g.state = 'idle'; g.t = 1.2 + Math.random() * 2; g.wp = (g.wp + 1) % g.pts.length; break; }
          face = Math.atan2(tx, tz); want = P.walk; break;
        }
        case 'idle': g.t -= dt; if (g.seen) alertNow(g); else if (g.t <= 0) g.state = 'patrol'; break;
        case 'alert': face = toP; raise = 0.35; g.t -= dt; if (g.t <= 0) g.state = 'track'; break; // acquired: it turns to him first
        case 'chase': // disarmed: it closes in on him
          face = toP;
          if (rizer.hp <= 0 || dist > P.maxRange + 14) { g.state = 'return'; g.wp = nearestWp(g); break; }
          want = dist > 1.2 ? P.melee.run : 0;
          if (dist < 1.4) { g.state = 'windup'; g.t = rand(P.melee.windup); g.combo = Math.round(rand(P.melee.combo)); }
          break;
        case 'windup': face = toP; g.t -= dt; if (g.t <= 0) strike(g); break; // squares up: the tell
        case 'strike': {
          g.t += dt; face = toP; const a = g.atk;
          if (!a.landed && g.t >= a.active) { a.landed = true; // the blow: in reach and in front of it
            if (rizer.hp > 0 && dist < a.range && Math.abs(wrap(toP - g.heading)) < P.melee.arc && Math.abs(rp.y - g.pos.y) < 1.6 && rizer.hurt(a.damage, g.pos, g)) hooks.onPlayerHit?.(a.kind, g, tC.set(rp.x, rp.y + 1.3, rp.z).clone(), a.damage); }
          if (g.t >= a.recover) { if (--g.combo > 0 && dist < 2.3 && rizer.hp > 0) strike(g); else { g.state = 'cool'; g.t = rand(P.melee.cooldown); } }
          break;
        }
        case 'cool': face = toP; g.t -= dt; if (g.t <= 0) g.state = 'chase'; break;
        case 'track': { // choose the next action by range and by whether it has a shot
          face = toP; raise = 0.35;
          if (!g.rifle) { g.state = 'chase'; break; }
          if (rizer.hp <= 0 || dist > P.maxRange + 14) { g.state = 'return'; g.wp = nearestWp(g); break; }
          if (Math.abs(wrap(toP - g.heading)) > 0.3) break;
          const band = dist < P.retreatRange ? 'close' : dist < farR ? 'mid' : 'long';
          let act = dist > P.maxRange ? 'advance' : pick(P.choices[band]);
          if (act === 'fire' && !g.seen) act = band === 'long' ? 'advance' : 'strafe'; // no line of sight: move for one, never shoot through cover
          if (act === 'fire') { g.state = 'aim'; g.t = 0; g.shots = Math.round(rand(P.burst)); opts.onEvent?.('telegraph', g); }
          else { g.state = 'move'; g.t = rand(P.move); g.move = act; if (Math.random() < 0.5) g.side *= -1; }
          break;
        }
        case 'move':
          g.t -= dt; face = toP; raise = 0.35;
          if (g.move === 'advance') { want = P.combat; if (dist < nearR + 2) g.t = 0; }
          else if (g.move === 'retreat') { want = P.combat * 0.85; dir = Math.PI; if (dist > nearR) g.t = 0; }
          else { want = P.combat * 0.8; dir = g.side * Math.PI / 2; }
          if (g.t <= 0) { g.state = 'track'; g.move = null; }
          break;
        case 'aim': // the tell: the rifle comes up onto him and the chamber charges
          g.t += dt; face = toP; raise = 1; if (g.carry !== 'ready') g.t = 0; // it cannot aim until the rifle is in its hands
          g.charge = clamp(g.t / P.aimTime, 0, 1);
          if (!g.seen && g.t > 0.25) { g.state = 'track'; g.charge = 0; break; } // he broke line of sight: no shot
          if (g.t >= P.aimTime) { g.state = 'fire'; g.shotT = 0; }
          break;
        case 'fire':
          face = toP; raise = 1; g.shotT -= dt;
          if (g.shotT <= 0) {
            if (g.shots > 0 && g.seen && rizer.hp > 0) { fire(g, rizer); g.shots--; g.shotT = P.burstGap; g.charge = 1; g.kick = 0.12; const s = rifleSlot(g.actor, 'rifleFire'); if (s && g.actor.has(s)) g.actor.play(s, 1.4, { overlay: true }); }
            else { g.state = 'recover'; g.t = P.recover; }
          }
          g.charge = Math.max(0.25, g.charge - dt * 3);
          break;
        case 'recover': face = toP; raise = 0.8; g.t -= dt; g.charge = Math.max(0, g.charge - dt * 2); if (g.t <= 0) g.state = 'track'; break;
        case 'flinch': g.t -= dt; raise = 0.2; if (g.t <= 0) g.state = 'track'; break;
        case 'down': {
          g.t += dt; if (g.salvaged && g.t < P.corpse) g.t = P.corpse; // stripped for scrap: the body goes
          if (!g.fallClip) { g.fallT = Math.min(1, g.fallT + dt * 2.2); g.actor.pivot.rotation.x = -g.fallT * g.fallT * 1.5; g.actor.pivot.position.y = g.fallT * 0.12; } // no death clip assigned: it topples
          if (g.t > P.corpse) { g.root.position.y -= dt * 0.5; if (g.t > P.corpse + 3) { g.state = 'gone'; g.root.visible = false; g.respawnAt = clock + P.respawn; } }
          break;
        }
      }
      if (g.state === 'gone') continue;
      const show = !hidden && dist < P.visible && (dist < 14 || !hooks.inView || hooks.inView(g.pos));
      if (g.state === 'down') { g.root.visible = show; if (show) { g.actor.update(dt, 0, true); g.head?.scale.setScalar(0.001); for (const m of g.glow) m.emissiveIntensity = damp(m.emissiveIntensity, 0.05, 2, dt); } continue; }
      if (face !== null) { const a = wrap(face - g.heading), step = P.turn * dt; g.heading += clamp(a, -step, step); }
      carryUpdate(g, hostile(g));
      if (g.carry === 'draw' || g.carry === 'sheath') want = 0; // it stands still to draw or stow
      g.actor.strafe = g.state === 'move' && want > 0 && Math.abs(dir) > 0.3 && Math.abs(dir) < 2.6 ? Math.sign(dir) : 0; g.actor.backing = g.state === 'move' && want > 0 && Math.abs(dir) >= 2.6 ? 1 : 0; // side-step and back-pedal use their own clips
      g.speed = damp(g.speed, g.state === 'flinch' ? 0 : want, 6, dt);
      const ma = g.heading + dir, nx = g.pos.x + (Math.sin(ma) * g.speed + g.knock.x) * dt, nz = g.pos.z + (Math.cos(ma) * g.speed + g.knock.z) * dt; g.knock.multiplyScalar(Math.exp(-6 * dt));
      const nd = Math.hypot(rp.x - nx, rp.z - nz), crowd = nd < 1.15 && nd < dist && rizer.hp > 0; // it stops at arm's length instead of shoving him along
      if (crowd) g.speed = 0; else if (onLand(nx, nz) && Math.abs(nx) < B + 10 && Math.abs(nz) < B + 10) { g.pos.x = nx; g.pos.z = nz; } else if (g.state === 'move') g.t = 0;
      probe.copy(g.pos); if (world.resolve(probe, P.radius)) { g.pos.x = probe.x; g.pos.z = probe.z; if (g.state === 'patrol' || g.state === 'return') { if ((g.stuck = (g.stuck || 0) + dt) > 1.5) { g.wp = (g.wp + 1) % g.pts.length; g.stuck = 0; } } else if (g.state === 'move' && g.move !== 'advance') g.side *= -1; }
      g.pos.y = damp(g.pos.y, world.groundAt(g.pos.x, g.pos.z, g.pos.y + 1), 12, dt);
      if (dist < P.radius + 0.45 && rizer.hp > 0 && Math.abs(rp.y - g.pos.y) < 2) { const k = (P.radius + 0.45) / (dist || 1); rp.x = g.pos.x + dx * k; rp.z = g.pos.z + dz * k; } // it is solid
      place(g);
      g.root.visible = show; g.bar.visible = show && (g.barT > 0 || hostile(g));
      if (!show) continue;
      // body: the shared locomotion clips by speed; then the rifle hold and the aim laid over them
      const hands = inHands(g), clips = hasRifleClips(g.actor) && hands; g.actor.rifle = clips; g.actor.aiming = raise > 0.5; // the rifle set: carry, walk, run, shoulder
      g.actor.fighting = false; g.actor.update(dt, g.speed + Math.hypot(g.knock.x, g.knock.z) * 0.2, true);
      g.head?.scale.setScalar(0.001); // (the clips write the head every frame)
      g.raise = damp(g.raise, raise, raise > g.raise ? 9 : 5, dt); g.kick = Math.max(0, (g.kick || 0) - dt);
      const pitch = clamp(Math.atan2(rp.y + 1.15 - (g.pos.y + 1.75), Math.max(1.5, dist)), -0.5, 0.5);
      if (clips) { gripRifle(g.actor, g.rifle, (g.kick || 0) * 0.5); g.rifle.userData.charge(g.charge); } // its hands lead, the rifle follows
      else if (hands) g.hold.pose(g.raise, hostile(g) ? pitch : 0, g.actor.shot?.kind === 'stunned' ? 0.3 : 1);
      if (g.rifle && hands && !clips) { g.rifle.userData.charge(g.charge); g.rifle.position.z = -(g.kick || 0) * 0.5; } // charge glow · recoil
      const lit = hostile(g) ? 1.7 : 1.1; for (const m of g.glow) m.emissiveIntensity = damp(m.emissiveIntensity, lit + g.flash * 18, 6, dt);
      if (dist < 9) g.rig.update(dt);
    }
    playerBlows(dt, rizer, hooks);
  }

  // placement: seeded, on open ground out past the town
  const r = rng((W.seed || 7) + 2727);
  for (let n = 0; n < 9000 && list.length < P.count; n++) {
    const a = r() * Math.PI * 2, d = P.spawn[0] + r() * (P.spawn[1] - P.spawn[0]), x = home.x + Math.sin(a) * d, z = home.z + Math.cos(a) * d;
    if (open(x, z)) make(x, z, false, r);
  }
  console.log(`[rp7d] nova guardians: ${list.length}`, list.map(g => `${g.pos.x.toFixed(0)}, ${g.pos.z.toFixed(0)}`).join(' · '));

  function setVisible(v) { hidden = !v; for (const g of list) { g.root.visible = v && g.state !== 'gone'; if (!v) g.bar.visible = false; } for (const d of drops) d.mesh.visible = v; }
  function standDown() { for (const g of list) if (hostile(g)) { g.state = 'return'; g.wp = nearestWp(g); g.move = null; g.charge = 0; } }
  const lockTargets = () => list.filter(g => alive(g) && !hidden).map(g => ({ kind: 'scanobot', ref: g, pos: () => g.pos, alive: () => alive(g), h: 2.4, color: '#ff5a6e', label: 'FIGHT', icon: 'nova' }));
  // dev / playtest: put one down at a point (town allowed)
  const spawnAt = (x, z) => { const g = make(x, z, true); g.root.visible = !hidden; return g; };
  return {
    list, drops, update, hit, stun, take, spawnAt, setVisible, standDown, lockTargets, alive,
    get bodies() { return live; },
    inCombat: pos => list.some(g => hostile(g) && Math.hypot(g.pos.x - pos.x, g.pos.z - pos.z) < 45),
    get total() { return list.length; }
  };
}
