// RP7D · Astralclap & Astralspin: two thunder-based Astral moves (RP7D_ASTRALCLAP_ASTRALSPIN_V1.md).
//
// Both run on Rizer's existing Astral combat: astral.js draws the lightning (arc · flash), seers.js / the tech bodies
// take the hits through game.js's `foes` (shock · blastBack), and the cast plays on the Mixamo animation driver.
// Each move is a timeline of NAMED animation events; the animation sets WHEN, this file decides WHAT happens:
//
//   ASTRALCLAP  CLAP_START → GROUND_STRIKE → TARGET_SUSPEND → CLAP_IMPACT → CLAP_END
//               lightning erupts under every enemy near the lock, holds them in the air, and on the clap pulls them
//               all to one midline where their bodies collide in an electrical explosion (more bodies, more damage)
//   ASTRALSPIN  SPIN_START → TORNADO_SPAWN → STORM_ACTIVE → SPIN_RELEASE → STORM_END
//               Rizer spins (on the ground or in the air); a tornado forms on the GROUND below him, travels along the
//               surface, and its storm drags in, lifts, swirls and shocks the enemies inside it until it dissipates
//
// TIMING comes from the moves' own clips (assets/anims/rizer/Astralclap.fbx · Astralspin.fbx, 30 fps, Rizer's mixamo
// skeleton), measured off the bones:
//   Astralclap (2.667 s)  0.00 arms rise · 0.60 crouched, hands at the ground (hand height min) · 0.93 rising, hands
//                         lifting · 1.53 hands swing in · 1.62 the hands meet (93 cm → 14 cm apart) · 2.45 back to rest
//   Astralspin (1.367 s)  0.00 the spin starts · 0.42 first full turn · 0.60 at full speed (~840°/s) · 1.00 slowing,
//                         arms opening out of it · ~800° in all. The tornado outlives the clip (STORM.spin.life).
import * as THREE from 'three';

export const STORM = {
  clap: { energy: 35, cooldown: 4, radius: 8, strikeDamage: 2, impactDamage: 4, perBody: 2, lift: 1.1, blast: 3.2 },
  spin: { energy: 40, cooldown: 8, radius: 5.5, life: 5, speed: 3.2, tick: 0.8, tickDamage: 1, endDamage: 2, swirl: 2.4, lift: 1.2 }
};
// The animation timeline of each move: the slot to play (its own when loaded, else the stand-in) and when each event fires.
export const STORM_TIMING = {
  astralclap: { slot: 'astralclap', standIn: 'thunder', speed: 1, contact: 1.62, // contact: the frame the hands meet (the collision lands on it)
    events: { CLAP_START: 0, GROUND_STRIKE: 0.6, TARGET_SUSPEND: 0.93, CLAP_IMPACT: 1.53, CLAP_END: 2.45 } },
  astralspin: { slot: 'astralspin', standIn: 'treeSpin', standInAir: 'aerialEvade', speed: 1,
    events: { SPIN_START: 0, TORNADO_SPAWN: 0.42, STORM_ACTIVE: 0.6, SPIN_RELEASE: 1.0, STORM_END: 0.6 + STORM.spin.life } }
};

export function createAstralStorm({ scene, world, fx, astral, foes, sfx, cam, onToast }) {
  const active = []; // running timelines
  const cool = { astralclap: 0, astralspin: 0 };
  const held = new Map(); // enemy → { x, y, z } its body is held at by a move (this frame)
  const center = g => g.isScanobot ? g.center : g.pos;
  const ground = (x, z, y) => world.groundAt(x, z, y);
  // Rizer's hands, from the playing clip's own bones: the lightning comes off his real palms
  const _l = new THREE.Vector3(), _r = new THREE.Vector3();
  function hands(rizer) {
    const o = rizer.obj || rizer.actor?.pivot; if (!o) return null;
    const L = rizer._lh ||= o.getObjectByName('mixamorigLeftHand'), R = rizer._rh ||= o.getObjectByName('mixamorigRightHand'); if (!L || !R) return null;
    L.getWorldPosition(_l); R.getWorldPosition(_r); return [_l, _r];
  }
  const spark = (p, n, color = '#cfe3ff', up = 0.6) => fx.emit(p.x, p.y, p.z, n, { color, speed: 1.4, up, size: 0.18, life: 0.3, g: 0 });
  // what the lightning does WHILE a move plays (between its events), frame by frame off the hands
  function crackle(tl, dt) {
    const h = hands(tl.rizer); if (!h) return;
    tl.zap = (tl.zap || 0) - dt; if (tl.zap > 0) return; tl.zap = 0.07;
    const [L, R] = h, t = tl.t;
    if (tl.id === 'astralclap') {
      const E = STORM_TIMING.astralclap.events;
      if (t < E.GROUND_STRIKE) { astral.arc(L.clone(), R.clone(), 0.25, 0.025, 0.1, 6); spark(L, 1); spark(R, 1); } // charging: static jumps palm to palm
      else if (t < E.CLAP_IMPACT) { for (const b of tl.bodies || []) if (b.hold) astral.arc((Math.random() < 0.5 ? L : R).clone(), new THREE.Vector3(b.hold.x, b.hold.y + 0.9, b.hold.z), 0.45, 0.03, 0.12, 8); } // lifting: tethers to every held body
      else if (t < STORM_TIMING.astralclap.contact + 0.12) { astral.arc(L.clone(), R.clone(), 0.12, 0.05, 0.2, 4); spark(L.clone().lerp(R, 0.5), 3, '#ffffff', 0.4); } // the clap closing
    } else if (tl.id === 'astralspin' && t < STORM_TIMING.astralspin.events.SPIN_RELEASE) { // arcs flung off his hands as he turns
      for (const P of [L, R]) { const d = P.clone().sub(tl.rizer.position); d.y = 0; d.normalize(); astral.arc(P.clone(), P.clone().addScaledVector(d, 1.6 + Math.random()).setY(P.y + (Math.random() - 0.5)), 0.4, 0.025, 0.1, 5); }
    }
  }

  function playCast(rizer, id, airborne = false) {
    const T = STORM_TIMING[id], A = rizer.actor;
    const slot = A?.has(T.slot) ? T.slot : airborne && T.standInAir && A?.has(T.standInAir) ? T.standInAir : T.standIn; // the move's own clip on the ground and in the air
    if (A?.has(slot)) A.play(slot, T.speed);
    return slot;
  }
  // a timeline: fires each event once, in order, as its time comes
  function run(id, rizer, handlers, extra = {}) {
    const T = STORM_TIMING[id], ev = Object.entries(T.events).sort((a, b) => a[1] - b[1]);
    const tl = { id, t: 0, rizer, ev, i: 0, handlers, ...extra };
    active.push(tl); return tl;
  }

  // ── ASTRALCLAP ──
  function astralclap(rizer, lockRef) {
    const C = STORM.clap;
    if (cool.astralclap > 0) return { fail: `ASTRALCLAP · ready in ${Math.ceil(cool.astralclap)} s` };
    if (!rizer.onGround || rizer.attack || rizer.dodgeT > 0) return { fail: null };
    const lp = center(lockRef);
    const targets = foes.grunts.filter(g => foes.alive(g) && Math.hypot(center(g).x - lp.x, center(g).z - lp.z) < C.radius && Math.abs(center(g).y - lp.y) < 4);
    if (!targets.includes(lockRef) && foes.alive(lockRef)) targets.unshift(lockRef);
    if (!targets.length) return { fail: 'ASTRALCLAP · no enemies in reach' };
    if (!rizer.spendEnergy(C.energy)) return { fail: 'SP LOW' };
    cool.astralclap = C.cooldown;
    rizer.facing = Math.atan2(lp.x - rizer.position.x, lp.z - rizer.position.z);
    rizer.attack = null; rizer.vel.x = rizer.vel.z = 0;
    const slot = playCast(rizer, 'astralclap'); rizer.landLock = Math.max(rizer.landLock || 0, STORM_TIMING.astralclap.events.CLAP_END);
    const bodies = targets.map(g => ({ g, from: center(g).clone(), y0: center(g).y, hold: null }));
    run('astralclap', rizer, {
      CLAP_START: tl => { const p = rizer.position; fx.emit(p.x, p.y + 1.4, p.z, 22, { color: '#bfe0ff', speed: 1.6, up: 1.4, size: 0.28, life: 0.6, g: -1 }); sfx?.play('blast', 0.45, 1.3); },
      GROUND_STRIKE: tl => { // lightning erupts upward from the ground under every target
        for (const b of bodies) { if (!foes.alive(b.g)) continue; const c = center(b.g), gy = ground(c.x, c.z, c.y + 1);
          astral.arc(new THREE.Vector3(c.x, gy, c.z), new THREE.Vector3(c.x, gy + 3.2, c.z), 0.5, 0.05, 0.2, 8);
          fx.emit(c.x, gy + 0.1, c.z, 14, { color: '#9fd4ff', speed: 2.6, up: 3, size: 0.3, life: 0.5, g: -2 });
          foes.shock(b.g, C.strikeDamage, 0, 0, 2.2); }
        const h = hands(rizer); if (h) for (const P of h) astral.arc(P.clone(), new THREE.Vector3(P.x, ground(P.x, P.z, P.y), P.z), 0.2, 0.05, 0.2, 5); // palms to the ground
        astral.flash.position.copy(center(bodies[0].g)).y += 2; astral.flash.intensity = 40; sfx?.play('thunder', 0.55, 1.25);
      },
      TARGET_SUSPEND: tl => { for (const b of bodies) if (foes.alive(b.g) && !b.g.isScanobot) { const c = center(b.g); b.hold = { x: c.x, y: ground(c.x, c.z, c.y + 1) + C.lift, z: c.z }; held.set(b.g, b.hold); } },
      CLAP_IMPACT: tl => { // the clap: every held body is pulled to one midline and they collide
        const live = bodies.filter(b => foes.alive(b.g) || b.hold);
        const mid = live.reduce((m, b) => m.add(center(b.g)), new THREE.Vector3()).divideScalar(Math.max(1, live.length));
        mid.y = ground(mid.x, mid.z, mid.y + 1);
        tl.pull = { mid, t: 0, live };
        for (const b of live) if (b.hold) b.pullFrom = { x: b.hold.x, y: b.hold.y, z: b.hold.z };
      },
      CLAP_END: tl => { for (const b of bodies) held.delete(b.g); }
    }, { bodies, slot });
    return { ok: true, count: targets.length, slot };
  }
  function clapStep(tl, dt) {
    const P = tl.pull; if (!P || P.done) return;
    const C = STORM.clap; P.t += dt;
    const T = STORM_TIMING.astralclap, k = Math.min(1, P.t / Math.max(0.05, T.contact - T.events.CLAP_IMPACT)), e = k * k; // accelerating into each other: they collide on the frame the hands meet
    P.live.forEach((b, i) => {
      if (!b.hold || !b.pullFrom) return;
      const a = (i / Math.max(1, P.live.length)) * Math.PI * 2, off = P.live.length > 1 ? 0.45 : 0; // they meet shoulder to shoulder
      b.hold.x = b.pullFrom.x + (P.mid.x + Math.sin(a) * off - b.pullFrom.x) * e; b.hold.z = b.pullFrom.z + (P.mid.z + Math.cos(a) * off - b.pullFrom.z) * e;
      b.hold.y = b.pullFrom.y + (P.mid.y + 0.4 - b.pullFrom.y) * e;
    });
    if (k >= 1) { // collision: the electrical impact explosion
      P.done = true; const n = P.live.length, dmg = C.impactDamage + C.perBody * Math.max(0, n - 1), m = P.mid, hits = [];
      astral.flash.position.set(m.x, m.y + 2, m.z); astral.flash.intensity = 70;
      const hh = hands(tl.rizer); if (hh) { const c = hh[0].clone().lerp(hh[1], 0.5); fx.emit(c.x, c.y, c.z, 30, { color: '#ffffff', speed: 4, up: 0.5, size: 0.3, life: 0.3, g: 0 }); astral.arc(c.clone(), new THREE.Vector3(m.x, m.y + 1.2, m.z), 0.5, 0.06, 0.24, 10); } // the clap itself flashes between his palms
      fx.emit(m.x, m.y + 1.2, m.z, 46, { color: '#cfe3ff', speed: 6, up: 2.2, size: 0.45, life: 0.55, g: 2 });
      fx.emit(m.x, m.y + 1.2, m.z, 26, { color: '#6fa8ff', speed: 4, up: 1.2, size: 0.5, life: 0.6, g: 1 });
      for (let s = 0; s < 7; s++) { const a = s / 7 * Math.PI * 2, to = new THREE.Vector3(m.x + Math.sin(a) * 3.5, m.y + 0.3, m.z + Math.cos(a) * 3.5); astral.arc(new THREE.Vector3(m.x, m.y + 1.2, m.z), to, 0.7, 0.05, 0.2, 8); }
      for (const b of P.live) { held.delete(b.g); if (foes.alive(b.g)) { const h = foes.blastBack(b.g, m, dmg, 0.35, 'astralclap'); if (h) hits.push(h); } }
      cam?.kick(1.5); sfx?.play('thunder', 0.9, 1.1); sfx?.play('heavy', 0.9, 0.9);
      onToast?.(`ASTRALCLAP · ${n} bod${n === 1 ? 'y' : 'ies'} collide · ${dmg} damage each${hits.filter(h => h?.down).length ? ` · ${hits.filter(h => h?.down).length} down` : ''}`);
    }
  }

  // ── ASTRALSPIN ──
  function astralspin(rizer) {
    const S = STORM.spin;
    if (cool.astralspin > 0) return { fail: `ASTRALSPIN · ready in ${Math.ceil(cool.astralspin)} s` };
    if (rizer.attack || rizer.dodgeT > 0) return { fail: null };
    if (!rizer.spendEnergy(S.energy)) return { fail: 'SP LOW' };
    cool.astralspin = S.cooldown;
    const airborne = !rizer.onGround || !!rizer.flying, slot = playCast(rizer, 'astralspin', airborne);
    if (!airborne) { rizer.vel.x = rizer.vel.z = 0; rizer.landLock = Math.max(rizer.landLock || 0, STORM_TIMING.astralspin.events.SPIN_RELEASE); }
    run('astralspin', rizer, {
      SPIN_START: tl => { const p = rizer.position; fx.emit(p.x, p.y + 1.2, p.z, 24, { color: '#9fd4ff', speed: 2.4, up: 0.6, size: 0.3, life: 0.5, g: 0 }); sfx?.play('blast', 0.5, 1.1); },
      TORNADO_SPAWN: tl => { // on the ground below him, wherever he is (in the air too)
        const p = rizer.position, gy = ground(p.x, p.z, p.y + 0.5);
        tl.tornado = makeTornado(); tl.tornado.position.set(p.x, gy, p.z); scene.add(tl.tornado);
        tl.dir = new THREE.Vector3(Math.sin(rizer.facing), 0, Math.cos(rizer.facing)); tl.caught = new Map(); tl.tick = 0;
        fx.emit(p.x, gy + 0.3, p.z, 30, { color: '#cfe3ff', speed: 4, up: 0.8, size: 0.4, life: 0.6, g: 1 });
      },
      STORM_ACTIVE: tl => { tl.storm = true; sfx?.play('thunder', 0.5, 1.3); },
      SPIN_RELEASE: tl => { if (rizer.actor?.shot && (rizer.actor.shot.kind === slot)) rizer.actor.release?.(slot, 0.25); },
      STORM_END: tl => { // the tornado dissipates and lets go of everything it holds
        if (tl.tornado) { const c = tl.tornado.position; fx.emit(c.x, c.y + 2, c.z, 40, { color: '#bcd8ff', speed: 4, up: 2, size: 0.4, life: 0.7, g: 1 }); scene.remove(tl.tornado); tl.tornado = null; }
        for (const [g] of tl.caught || []) { held.delete(g); if (foes.alive(g)) foes.blastBack(g, tl.lastAt || rizer.position, S.endDamage, 0.4, 'astralspin'); }
        tl.storm = false;
      }
    }, { slot, airborne });
    return { ok: true, airborne, slot };
  }
  function makeTornado() {
    const g = new THREE.Group(), layers = [];
    for (let i = 0; i < 6; i++) {
      const r0 = 0.5 + i * 0.45, r1 = 0.8 + i * 0.55, h = 1.1;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, h, 18, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(i % 2 ? '#9fc8ff' : '#e6f2ff').multiplyScalar(1.4), transparent: true, opacity: 0.22 - i * 0.02, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
      m.position.y = 0.55 + i * h * 0.92; g.add(m); layers.push(m);
    }
    g.userData.layers = layers; return g;
  }
  function spinStep(tl, dt) {
    const S = STORM.spin, T = tl.tornado; if (!T) return;
    // it travels along the ground surface, following the terrain (or a cave floor)
    const nx = T.position.x + tl.dir.x * S.speed * dt, nz = T.position.z + tl.dir.z * S.speed * dt;
    T.position.set(nx, ground(nx, nz, T.position.y + 0.6), nz); tl.lastAt = T.position.clone();
    T.userData.layers.forEach((m, i) => { m.rotation.y += dt * (6 + i * 1.5); m.scale.setScalar(1 + Math.sin(tl.t * 7 + i) * 0.06); });
    if (Math.random() < dt * 14) fx.emit(T.position.x + (Math.random() - 0.5) * 3, T.position.y + Math.random() * 5, T.position.z + (Math.random() - 0.5) * 3, 2, { color: '#cfe3ff', speed: 1.2, up: 1.5, size: 0.2, life: 0.4, g: -1 });
    if (!tl.storm) return;
    // the storm: enemies inside are dragged in, lifted and swirled, and the lightning keeps striking them
    for (const g of foes.grunts) {
      if (!foes.alive(g) || g.isScanobot) continue;
      const c = center(g), d = Math.hypot(c.x - T.position.x, c.z - T.position.z);
      if (d > S.radius || Math.abs(c.y - T.position.y) > 4) continue;
      if (!tl.caught.has(g)) { tl.caught.set(g, { a: Math.atan2(c.x - T.position.x, c.z - T.position.z), r: Math.max(1.2, d) }); foes.shock(g, 0, 0, 0, S.life); }
    }
    for (const [g, o] of tl.caught) {
      if (!foes.alive(g)) { held.delete(g); tl.caught.delete(g); continue; }
      o.a += dt * S.swirl; o.r += (1.6 - o.r) * Math.min(1, dt * 1.5);
      held.set(g, { x: T.position.x + Math.sin(o.a) * o.r, y: T.position.y + S.lift + Math.sin(tl.t * 3 + o.a) * 0.3, z: T.position.z + Math.cos(o.a) * o.r });
    }
    tl.tick -= dt;
    if (tl.tick <= 0) { tl.tick = S.tick; for (const [g] of tl.caught) { const c = center(g); astral.arc(new THREE.Vector3(T.position.x, T.position.y + 4.5, T.position.z), new THREE.Vector3(c.x, c.y + 1, c.z), 0.6, 0.04, 0.16, 7); foes.shock(g, S.tickDamage, 0, 0, S.life); } if (tl.caught.size) sfx?.play('light', 0.5, 1.4); }
  }

  // Runs AFTER the enemies' own update each frame, so a held body stays exactly where the move holds it.
  function update(dt) {
    for (const k in cool) cool[k] = Math.max(0, cool[k] - dt);
    for (let i = active.length - 1; i >= 0; i--) {
      const tl = active[i]; tl.t += dt;
      while (tl.i < tl.ev.length && tl.t >= tl.ev[tl.i][1]) { const [name] = tl.ev[tl.i++]; try { tl.handlers[name]?.(tl); } catch (e) { console.warn('[rp7d] storm event', name, e); } }
      crackle(tl, dt);
      if (tl.id === 'astralclap') clapStep(tl, dt); else spinStep(tl, dt);
      if (tl.i >= tl.ev.length && (tl.id !== 'astralclap' || tl.pull?.done !== false)) active.splice(i, 1);
    }
    for (const [g, h] of held) { if (!foes.alive(g)) { held.delete(g); continue; } g.pos.set(h.x, h.y, h.z); g.root.position.copy(g.pos); g.speed = 0; g.knock?.set(0, 0, 0); }
  }
  return { astralclap, astralspin, update, get busy() { return active.length > 0; }, cooldown: id => cool[id] || 0, get active() { return active; } };
}
