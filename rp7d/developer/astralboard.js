import * as THREE from 'three';
import { buildAstralboard, inventory, saveInv } from './loot.js';

const MIN_SPEED = 12.5;                 // roughly Rizer's sprint
const MAX_SPEED = 300 / 3.6;            // 300 km/h in world metres / second
const HOVER = 0.42;                     // deck top above the ground
// Rizer's skate stance (Astralboard Cruise): his soles sit ~0.12 above his own origin, one foot ahead of the other
// along the way he faces. RIDER puts those soles on the deck; STANCE is where the middle of his feet falls, in his
// own frame (x = to his right, z = ahead), so the board sits directly under them.
const RIDER = -0.12;
const STANCE = { x: -0.06, z: 0.04 };
const STAGES = 6;

export function createAstralboard(scene, world, fx, toast, at) {
  const root = buildAstralboard(); scene.add(root);
  const owned = () => (inventory.rides || []).includes('astralboard');
  let mounted = false, transition = null, speed = MIN_SPEED, stage = 0, boostClock = 0;
  let cruiseSpeed = null, r2Was = false, r2DownFor = 0, holdBoosting = false, descending = false, visible = true;
  const velocity = new THREE.Vector3(), home = new THREE.Vector3(at.x, 0, at.z);
  let tiltX = 0, tiltZ = 0; const _eul = new THREE.Euler(0, 0, 0, 'YXZ'), _rider = new THREE.Vector3();
  // Where Rizer stands for a board at `p` heading `yaw` (the inverse of STANCE), so the deck is always under his feet.
  const riderAt = (p, yaw, out = _rider) => out.set(p.x - (Math.cos(yaw) * STANCE.x + Math.sin(yaw) * STANCE.z), p.y + RIDER, p.z - (-Math.sin(yaw) * STANCE.x + Math.cos(yaw) * STANCE.z));
  const setGlow = active => root.userData.glowMaterials?.forEach((m, i) => { m.emissiveIntensity = active ? (i ? 2.6 : 3.2) : (i ? .55 : .8); });
  const placeHome = p => { home.copy(p); home.y = world.groundAt(home.x, home.z) + HOVER; if (!mounted && !transition) root.position.copy(home); };
  placeHome(at); setGlow(false);
  root.visible = owned();
  const spot = {
    id: 'astralboard-ride', kind: 'ride', vehicle: true, discover: false, reach: 3.2, // a vehicle: △ gets on and off (game.js), ○ stows it
    get name() { return 'Ride Astralboard · ○ / O stow'; },
    get x() { return root.position.x; }, get z() { return root.position.z; },
    get cx() { return root.position.x; }, get cz() { return root.position.z; },
    active: () => owned() && root.visible && !mounted && !transition
  };
  world.interactables.push(spot);

  function unlock(p = at) {
    inventory.rides ||= [];
    if (!inventory.rides.includes('astralboard')) inventory.rides.push('astralboard');
    saveInv(); placeHome(p); root.visible = visible; setGlow(false);
  }
  // Packed up (storage.js): it leaves the world and stops counting as unlocked until it is deployed again.
  function pack() { inventory.rides = (inventory.rides || []).filter(k => k !== 'astralboard'); saveInv(); root.visible = false; }
  function mount(rizer) {
    if (!owned() || mounted || transition || rizer.position.distanceTo(root.position) > 3.4) return false;
    const from = rizer.position.clone(), to = riderAt(root.position, root.rotation.y).clone();
    rizer.attack = null; rizer.flying = false; rizer.onGround = true; rizer.vel.set(0, 0, 0); rizer.vy = 0; rizer.speed = 0;
    rizer.actor?.play('stairWalkUp', 1.05, { hold: true });
    transition = { kind: 'mount', t: 0, dur: .68, from, to };
    setGlow(true); toast('Astralboard activating'); return true;
  }
  function dismount(rizer) {
    if (!mounted || transition) return false;
    const floor = world.groundAt(root.position.x, root.position.z);
    if (root.position.y > floor + HOVER + .28) { toast('Come down with L3 before dismounting'); return false; }
    const side = new THREE.Vector3(Math.cos(rizer.facing), 0, -Math.sin(rizer.facing));
    let to = root.position.clone().addScaledVector(side, .8); to.y = world.groundAt(to.x, to.z);
    if (world.resolve(to.clone(), .35)) { to.copy(root.position).addScaledVector(side, -.8); to.y = world.groundAt(to.x, to.z); }
    rizer.actor?.release(); rizer.actor?.play('stairWalkDown', 1.05, { hold: true });
    transition = { kind: 'dismount', t: 0, dur: .66, from: rizer.position.clone(), to };
    velocity.set(0, 0, 0); cruiseSpeed = null; descending = false; return true;
  }
  function finishTransition(rizer) {
    const q = transition; transition = null; rizer.actor?.release();
    if (q.kind === 'mount') {
      mounted = true; rizer.inAstralboard = true; rizer.onGround = false; rizer.flying = false;
      rizer.actor?.play('astralboardCruise', 1, { loop: true, hold: true });
      toast('Astralboard · R2 boost · tap R2 cruise · L3 descend · ○ dismount');
    } else {
      mounted = false; rizer.inAstralboard = false; rizer.onGround = true; rizer.flying = false; rizer.speed = 0; rizer.vel.set(0, 0, 0); rizer.vy = 0;
      setGlow(false); placeHome(root.position); toast('Astralboard parked');
    }
  }
  // His body turns with the board: the model's yaw is normally set by Rizer's own update, which doesn't run while he
  // rides, so without this the board swung round under a body that stayed facing where he mounted.
  const square = rizer => { if (rizer.body?.root) rizer.body.root.rotation.y = rizer.facing; rizer.lean = 0; rizer.bank = 0; };
  function push(rizer) {
    stage = Math.min(STAGES, stage + 1); boostClock = 0;
    rizer.actor?.play('astralboardPush', 1.12);
    const p = root.position, back = new THREE.Vector3(-Math.sin(rizer.facing), 0, -Math.cos(rizer.facing));
    fx.emit(p.x + back.x, p.y - .15, p.z + back.z, 15, { color: '#75eaff', speed: 5 + stage, up: .2, size: .25, life: .45, g: 0 });
    toast(`ASTRALBOARD · BOOST ${stage}/${STAGES} · ${Math.round((MIN_SPEED + (MAX_SPEED - MIN_SPEED) * stage / STAGES) * 3.6)} km/h`);
  }
  function updateTransition(dt, rizer) {
    const q = transition; q.t = Math.min(q.dur, q.t + dt); const u = q.t / q.dur, e = u * u * (3 - 2 * u);
    rizer.position.lerpVectors(q.from, q.to, e); rizer.facing = root.rotation.y; rizer.speed = 0; rizer.vy = 0; square(rizer); rizer.animateModel(dt);
    if (u >= 1) finishTransition(rizer);
  }
  function update(dt, inp, camYaw, rizer) {
    if (!root.visible) return;
    if (transition) { updateTransition(dt, rizer); return; }
    if (!mounted) {
      const floor = world.groundAt(root.position.x, root.position.z) + HOVER;
      root.position.y += (floor + Math.sin(performance.now() * .0022) * .035 - root.position.y) * Math.min(1, dt * 5);
      tiltX *= Math.max(0, 1 - dt * 6); tiltZ *= Math.max(0, 1 - dt * 6); root.rotation.set(tiltX, root.rotation.y, tiltZ + Math.sin(performance.now() * .0013) * .018, 'YXZ'); return;
    }
    const r2 = !!inp.run;
    if (r2 && !r2Was) { r2DownFor = 0; boostClock = 0; holdBoosting = false; }
    if (r2) {
      r2DownFor += dt;
      if (!holdBoosting && r2DownFor > .18) { holdBoosting = true; cruiseSpeed = null; push(rizer); }
      else if (holdBoosting) { boostClock += dt; if (boostClock >= .58 && stage < STAGES) push(rizer); }
    }
    if (!r2 && r2Was) {
      if (r2DownFor <= .24) {
        if (cruiseSpeed != null) { cruiseSpeed = null; toast('Astralboard cruise released'); }
        else { cruiseSpeed = speed; toast(`Cruise locked · ${Math.round(speed * 3.6)} km/h`); }
      }
      holdBoosting = false;
    }
    r2Was = r2;
    const stageTarget = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * stage / STAGES;
    const targetSpeed = holdBoosting ? stageTarget : cruiseSpeed ?? MIN_SPEED;
    speed += (targetSpeed - speed) * (1 - Math.exp(-(holdBoosting ? 2.8 : .7) * dt));
    if (!r2 && cruiseSpeed == null && speed < MIN_SPEED + .3) stage = 0;
    const fwd = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const want = fwd.multiplyScalar(-inp.z).add(right.multiplyScalar(inp.x)); let mag = Math.min(1, want.length());
    if (mag > .02) want.normalize();
    // Cruise control carries forward even with the stick released.
    if (mag < .02 && cruiseSpeed != null) { want.set(Math.sin(rizer.facing), 0, Math.cos(rizer.facing)); mag = 1; }
    const desired = want.multiplyScalar(speed * mag);
    velocity.x += (desired.x - velocity.x) * (1 - Math.exp(-4.2 * dt));
    velocity.z += (desired.z - velocity.z) * (1 - Math.exp(-4.2 * dt));
    if (inp.crouchPressed) descending = !descending;
    if (root.position.y <= world.groundAt(root.position.x, root.position.z) + HOVER + .05 && descending) descending = false;
    const aim = THREE.MathUtils.clamp(((inp.camPitch ?? .2) - .2) * -1.8, -1, 1) * (mag > .1 ? 1 : 0);
    const vertical = descending ? -10 : (inp.jumpHeld ? 10 : aim * Math.max(5, speed * .34));
    velocity.y += (vertical - velocity.y) * (1 - Math.exp(-4 * dt));
    const oldX = root.position.x, oldZ = root.position.z;
    root.position.x += velocity.x * dt; root.position.z += velocity.z * dt;
    if (world.keepOnLand(root.position, oldX, oldZ)) velocity.multiplyScalar(.18);
    const floor = world.groundAt(root.position.x, root.position.z) + HOVER;
    root.position.y = Math.max(floor, Math.min(floor + 62, root.position.y + velocity.y * dt));
    if (root.position.y <= floor && velocity.y < 0) velocity.y = 0;
    if (Math.hypot(velocity.x, velocity.z) > .7) rizer.facing = Math.atan2(velocity.x, velocity.z);
    rizer.position.copy(riderAt(root.position, rizer.facing));
    rizer.speed = velocity.length(); rizer.vy = velocity.y; rizer.onGround = false; rizer.flying = false; rizer.vel.copy(velocity);
    // The board is locked to his heading — nose always the way he faces, never swinging round under his feet.
    // Only a slight nose pitch and carve lean are eased in, small enough that the deck stays on his soles.
    const k = 1 - Math.exp(-7 * dt);
    tiltX += (THREE.MathUtils.clamp(-velocity.y / Math.max(18, speed), -.3, .3) * .35 - tiltX) * k;
    tiltZ += (THREE.MathUtils.clamp(-inp.x * .07, -.07, .07) - tiltZ) * k;
    root.quaternion.setFromEuler(_eul.set(tiltX, rizer.facing, tiltZ, 'YXZ'));
    if (!rizer.actor?.shot && rizer.actor?.has('astralboardCruise')) rizer.actor.play('astralboardCruise', 1, { loop: true, hold: true });
    square(rizer); rizer.animateModel(dt);
  }
  function setVisible(v) { visible = !!v; root.visible = visible && owned(); }
  return { root, spot, unlock, pack, mount, dismount, update, setVisible, get mounted() { return mounted; }, get transitioning() { return !!transition; }, get active() { return mounted || !!transition; }, get speedKmh() { return speed * 3.6; } };
}
