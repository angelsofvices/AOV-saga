// Astral Blast (○) and lock-on (R3).
//  · Lock-on: R3 locks to the nearest actor in range — a Seer (enemy: attack it) or a wild
//    Zyrex (bond with it). Press R3 again to release. The camera frames the target and
//    Rizer squares up to it; strikes and blasts aim at it.
//  · Astral Blast: a blue energy bolt thrown from Rizer's hand at the release frame of the
//    cast clip. It homes on the locked enemy (or the nearest Seer ahead), flies until it
//    hits a Seer, the ground or a wall, then bursts.
import * as THREE from 'three';
import { clamp } from './util.js';

export const ASTRAL = {
  blast: { damage: 2, speed: 30, range: 42, radius: 1.1, turn: 7, cooldown: 0.35, anim: 1.15, move: 0.15 },
  lock: { range: 30, keep: 42, assistCone: 0.6 },
  // Astralthunder (lock on + d-pad ↓): lightning out of the sky onto the locked target, with a small splash
  thunder: { energy: 30, damage: 6, splash: 2.6, splashDamage: 3, strikeAt: 0.62, strikeClip: 0.98, height: 38 }, // strikeClip: the slam, on the clip
  // Astralift (lock on + d-pad ↑): lands on the upward thrust of the cast (Standing 1H Magic Attack 03)
  lift: { energy: 18, release: 0.8 },
  // Astralburst (lock on + d-pad ←): Rizer gathers lightning over his body, then it bursts out around him,
  // blasting everything in the radius up and away — a bigger Astralift for the whole area, each body scattered
  // at its own angle (full damage close in, less at the edge; see seers.blastBack).
  // Times are on the clip (Standing 2H Magic Area Attack 02): charge = the crouch with the hands gathered,
  // release = arms flung wide.
  burst: { energy: 40, radius: 7.5, damage: 5, edgeDamage: 3, chargeFrom: 0.35, release: 1.38, wave: 0.38 },
  rolling: { energy: 36, speed: 24, range: 48, fuse: 3, chainRadius: 8.5, chainInterval: 0.24, baseBlastRadius: 5, blastPerTarget: 1.35, maxBlastRadius: 18, baseDamage: 3, buildDamage: 4, chainDamage: 3, explosionDamage: 8 }
};

function reticleSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.renderOrder = 30; s.scale.set(0.62, 0.62, 1);
  s.draw = (color, label) => {
    const g = c.getContext('2d'); g.clearRect(0, 0, 128, 128);
    g.fillStyle = color; g.shadowColor = color; g.shadowBlur = 5;
    g.beginPath(); g.arc(64, 64, 4, 0, Math.PI * 2); g.fill();
    if (label) {
      g.shadowBlur = 0; g.font = '600 13px "DM Sans", sans-serif'; g.textAlign = 'center';
      g.fillStyle = '#fff'; g.fillText(label, 64, 91);
    }
    tex.needsUpdate = true;
  };
  return s;
}

// Astral energy colour per character (CHARACTERS[..].astral): Rizer's is blue, the Psychosyd skin's green.
export const ASTRAL_PALETTES = {
  blue: { core: '#e8f2ff', shell: '#2e6cff', light: '#4a8cff', cast: '#8fb8ff', burst: '#7fb0ff', trail: '#5b8fff' },
  green: { core: '#eaffef', shell: '#1fd460', light: '#3dff7e', cast: '#8dffaa', burst: '#6dff95', trail: '#39e86a' }
};

export function createAstral(scene, world, fx) {
  // ── bolt visuals: a bright core in a soft coloured shell (bloom does the glow) ──
  const coreGeo = new THREE.IcosahedronGeometry(0.22, 1), shellGeo = new THREE.IcosahedronGeometry(0.45, 1);
  const mats = {};
  for (const [k, P] of Object.entries(ASTRAL_PALETTES)) mats[k] = {
    core: new THREE.MeshBasicMaterial({ color: new THREE.Color(P.core).multiplyScalar(3) }),
    shell: new THREE.MeshBasicMaterial({ color: new THREE.Color(P.shell).multiplyScalar(2.2), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })
  };
  let palKey = 'blue', pal = ASTRAL_PALETTES.blue;
  function setPalette(k) { if (ASTRAL_PALETTES[k]) { palKey = k; pal = ASTRAL_PALETTES[k]; } }
  const bolts = []; let boltSequence = 0, attackSequence = 0;
  // Point lights are pooled and never added or removed at runtime (a change in the light count recompiles every material).
  const boltLights = [0, 1].map(() => { const L = new THREE.PointLight('#4a8cff', 0, 9, 2); scene.add(L); return L; });
  const flash = new THREE.PointLight('#cfe3ff', 0, 60, 1.6); scene.add(flash);
  // Astralthunder: pending strikes and the visible bolts
  const strikes = [], zaps = [], rollers = [];
  const zapCore = new THREE.MeshBasicMaterial({ color: new THREE.Color('#f4f8ff').multiplyScalar(3), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const zapGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color('#5aa0ff').multiplyScalar(2.4), transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending });
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
  function segment(g, a, b, r, mat) {
    const len = a.distanceTo(b), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 5, 1, true), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(_up, _b.copy(b).sub(a).normalize()); g.add(m);
  }
  // A jagged bolt from high above down to `p`, with a couple of forks.
  function lightning(p) {
    const g = new THREE.Group(), H = ASTRAL.thunder.height, pts = [];
    for (let i = 0; i <= 14; i++) { const k = i / 14, j = (1 - k) * 2.2 + 0.2; pts.push(new THREE.Vector3(p.x + (i && i < 14 ? (Math.random() - 0.5) * j : 0), p.y + H * (1 - k), p.z + (i && i < 14 ? (Math.random() - 0.5) * j : 0))); }
    for (let i = 0; i < 14; i++) { segment(g, pts[i], pts[i + 1], 0.07, zapCore); segment(g, pts[i], pts[i + 1], 0.32, zapGlow); }
    for (const at of [4, 8]) { let q = pts[at].clone(); for (let s = 0; s < 3; s++) { const n = q.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, -2 - Math.random() * 2, (Math.random() - 0.5) * 3)); segment(g, q, n, 0.04, zapCore); segment(g, q, n, 0.16, zapGlow); q = n; } }
    scene.add(g); zaps.push({ g, t: 0 });
  }

  // A jagged arc between two points (the bolt's core in a soft glow), flickering out like the thunder bolts.
  function arc(a, b, jag = 0.35, core = 0.035, glow = 0.13, steps = 7) {
    const g = new THREE.Group(), pts = [];
    for (let i = 0; i <= steps; i++) { const k = i / steps, j = i && i < steps ? jag : 0; pts.push(new THREE.Vector3(a.x + (b.x - a.x) * k + (Math.random() - 0.5) * j, a.y + (b.y - a.y) * k + (Math.random() - 0.5) * j, a.z + (b.z - a.z) * k + (Math.random() - 0.5) * j)); }
    for (let i = 0; i < steps; i++) { segment(g, pts[i], pts[i + 1], core, zapCore); segment(g, pts[i], pts[i + 1], glow, zapGlow); }
    scene.add(g); zaps.push({ g, t: 0 }); return pts;
  }
  // Astralburst's shockwave: a flat ring of light racing out over the ground, and a thin glowing dome.
  const waveRing = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color('#9cc8ff').multiplyScalar(2.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  waveRing.rotation.x = -Math.PI / 2; waveRing.visible = false; waveRing.renderOrder = 2; scene.add(waveRing);
  const waveDome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#5aa0ff').multiplyScalar(1.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  waveDome.visible = false; waveDome.renderOrder = 2; scene.add(waveDome);
  const bursts = []; // { rizer, seers, onBlast, t, release, speed, done, bones, at }

  // ── lock-on ──
  const reticle = reticleSprite(); reticle.visible = false; scene.add(reticle);
  let lock = null; // { kind, ref, pos: () => Vector3, alive: () => bool }

  // extra: targets other systems hand in already shaped ({ kind, ref, pos, alive, h, color?, label? }) — the Scanobots
  const targetsOf = (seers, zyrex, loot, commonChests, friendlies = [], extra = []) => [
    ...(seers?.grunts || []).filter(g => seers.alive(g)).map(g => ({ kind: 'enemy', ref: g, pos: () => g.pos, alive: () => seers.alive(g), h: 1.7 })),
    ...(loot?.all || []).filter(c => c.state === 'closed').map(c => ({ kind: 'chest', ref: c, pos: () => c.chest.position, alive: () => c.state === 'closed', h: 2.3 })),
    // Wooden coin chests: also astral-liftable — see canAstralift/updateLifts below for the coin-pop payoff.
    ...(commonChests?.chests || []).filter(ch => ch.state === 'closed').map(ch => ({ kind: 'coinchest', ref: ch, pos: () => ch.C.root.position, alive: () => ch.state === 'closed', h: 1.6 })),
    ...(zyrex || []).filter(z => !z.bonded).map(z => ({ kind: 'zyrex', ref: z, pos: () => z.pos, alive: () => !z.bonded, h: 2.2 * (z.def.scale || 1) })),
    ...friendlies.filter(n => n?.met).map(n => ({ kind: 'friendly', ref: n, pos: () => n.root.position, alive: () => true, h: 1.8 })),
    ...(world.nature?.userData?.stones?.list || []).filter(s => !s.broken).map(s => ({ kind: 'stone', ref: s, pos: () => new THREE.Vector3(s.x, s.y + s.h * 0.42, s.z), alive: () => !s.broken, h: 0 })),
    ...(extra || []).filter(t => t.alive())
  ];
  // R3: lock the nearest actor in range, or release the current lock.
  // Enemies come first: with one in range, lock-on takes it (the one nearest and most in front of Rizer) before any chest,
  // stone, Zyrex or friendly. Only with no enemy around does it fall back to the nearest of anything else.
  const HOSTILE = k => k === 'enemy' || k === 'scanobot';
  function pickEnemy(rizer, targets, range) {
    const p = rizer.position; let best = null, bs = Infinity;
    for (const t of targets) {
      if (!HOSTILE(t.kind)) continue;
      const q = t.pos(), d = q.distanceTo(p); if (d >= range) continue;
      const a = Math.atan2(q.x - p.x, q.z - p.z), off = Math.abs(Math.atan2(Math.sin(a - rizer.facing), Math.cos(a - rizer.facing)));
      const s = d + off * 2.5; if (s < bs) { bs = s; best = t; }
    }
    return best;
  }
  let manualOff = 0, lastAuto = 0;
  function toggleLock(rizer, seers, zyrex, loot, commonChests, friendlies, extra) {
    if (lock) { lock = null; reticle.visible = false; manualOff = performance.now() + 6000; return null; } // released on purpose: no auto lock for a moment
    const all = targetsOf(seers, zyrex, loot, commonChests, friendlies, extra);
    let best = pickEnemy(rizer, all, ASTRAL.lock.range);
    if (!best) { const p = rizer.position; let bd = ASTRAL.lock.range; for (const t of all) { const d = t.pos().distanceTo(p); if (d < bd) { bd = d; best = t; } } }
    setLock(best);
    return lock;
  }
  // In a fight with nothing locked: take the enemy in front automatically (the player can still release with R3).
  function autoLock(rizer, seers, zyrex, loot, commonChests, friendlies, extra) {
    const now = performance.now(); if (lock || now < manualOff || now - lastAuto < 250) return null; lastAuto = now;
    const best = pickEnemy(rizer, targetsOf(seers, zyrex, loot, commonChests, friendlies, extra), 18);
    if (best) setLock(best);
    return best;
  }
  function clearLock() { lock = null; reticle.visible = false; }
  function setLock(t) { lock = t; if (t) { const named = t.kind === 'zyrex' && t.ref.def.name; reticle.visible = true; reticle.draw(t.color || (t.kind === 'enemy' ? '#ff5a6e' : t.kind === 'friendly' ? '#7ce8bd' : t.kind === 'stone' && t.ref.isAstraliteStone ? '#76ccff' : '#e9c982'), t.label ?? (t.kind === 'enemy' ? 'FIGHT' : t.kind === 'friendly' ? (t.ref.downed ? 'REVIVE' : 'ALLY') : t.kind === 'zyrex' ? (named ? `BOND · ${t.ref.def.name.toUpperCase()}` : 'BOND') : t.kind === 'stone' ? (t.ref.isAstraliteStone ? 'ASTRALITE' : 'STONE') : '')); } }
  // Right-stick flick while locked: swap to the next target to the left (dir -1) or right (+1) on screen.
  const scr = new THREE.Vector3();
  function switchLock(dir, rizer, seers, zyrex, camera, loot, commonChests, friendlies, extra) {
    if (!lock) return null;
    const sx = v => scr.set(v.x, v.y + 1.2, v.z).project(camera).x, ahead = v => scr.set(v.x, v.y + 1.2, v.z).project(camera).z < 1;
    const cur = sx(lock.pos()), p = rizer.position;
    let best = null, bd = Infinity;
    for (const t of targetsOf(seers, zyrex, loot, commonChests, friendlies, extra)) {
      if (t.ref === lock.ref || t.pos().distanceTo(p) > ASTRAL.lock.range || !ahead(t.pos())) continue;
      if (HOSTILE(lock.kind) && !HOSTILE(t.kind)) continue; // flicking between enemies never jumps to a chest
      const dx = (sx(t.pos()) - cur) * dir; // how far over, in the flicked direction
      if (dx > 0.02 && dx < bd) { bd = dx; best = t; }
    }
    if (best) setLock(best);
    return best;
  }

  // D-pad up: base-level Astralift on a locked enemy, or open a locked chest. Rizer casts it (crouch, then
  // the right hand thrusts up) and the lift lands on that thrust. canAstralift() checks first, so energy is
  // only spent on a real target; onDone(result) reports what happened.
  const lifts = [];
  function canAstralift(seers) { return !!lock && (((lock.kind === 'enemy' || lock.kind === 'scanobot') && seers?.alive(lock.ref)) || (lock.kind === 'chest' && lock.ref?.state === 'closed') || (lock.kind === 'coinchest' && lock.ref?.state === 'closed')); }
  function astralift(rizer, seers, loot, commonChests, onDone) {
    if (!canAstralift(seers)) return null;
    const target = lock, p = target.pos(), A = rizer.actor;
    rizer.facing = Math.atan2(p.x - rizer.position.x, p.z - rizer.position.z);
    A?.play('astralift', 1); rizer.attack = null;
    const dur = A?.has('astralift') ? A.acts.astralift.getClip().duration : 1;
    rizer.landLock = Math.max(rizer.landLock || 0, Math.min(dur * 0.75, ASTRAL.lift.release + 0.25)); // planted for the cast
    lifts.push({ t: A?.has('astralift') ? Math.min(ASTRAL.lift.release, dur * 0.8) : 0, target, rizer, seers, commonChests, onDone });
    fx.emit(rizer.position.x, rizer.position.y + 1.2, rizer.position.z, 10, { color: '#b8d6ff', speed: 1.4, up: 1.6, size: 0.3, life: 0.5, g: -0.5 }); // the gather
    return { kind: target.kind, pending: true };
  }
  // Astralift's jolt: arcs erupt from the ground around the target and run up into its legs, with a spark ring and a flash.
  function groundJolt(target, p) {
    const g = target.kind === 'enemy' ? target.ref : null, legs = g ? ['LeftFoot', 'RightFoot', 'LeftLeg', 'RightLeg', 'LeftUpLeg', 'RightUpLeg'].map(n => g.actor.model?.getObjectByName('mixamorig' + n)).filter(Boolean) : [];
    const gy = world.groundAt?.(p.x, p.z, p.y + 1) ?? p.y;
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2, r = 0.9 + Math.random() * 1.1, from = new THREE.Vector3(p.x + Math.sin(a) * r, gy + 0.02, p.z + Math.cos(a) * r);
      const to = legs.length ? legs[i % legs.length].getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(p.x, gy + 0.3 + Math.random() * 0.6, p.z);
      arc(from, to, 0.4, 0.035, 0.15, 6);
      fx.emit(from.x, from.y + 0.05, from.z, 4, { color: '#cfe3ff', speed: 2.4, up: 1.4, size: 0.22, life: 0.35, g: 4 });
    }
    fx.emit(p.x, gy + 0.1, p.z, 30, { color: '#9cc8ff', speed: 5, up: 1.8, size: 0.35, life: 0.45, g: 5, spread: 0.6 }); // the ground spark ring
    flash.position.set(p.x, gy + 1.5, p.z); flash.intensity = Math.max(flash.intensity, 35);
  }
  function updateLifts(dt) {
    for (let i = lifts.length - 1; i >= 0; i--) {
      const L = lifts[i]; if ((L.t -= dt) > 0) continue; lifts.splice(i, 1);
      const target = L.target, p = target.pos(); let result = null;
      if (target.kind === 'enemy' || target.kind === 'chest' || target.kind === 'coinchest') groundJolt(target, p); // lightning out of the ground, up through the legs
      if ((target.kind === 'enemy' || target.kind === 'scanobot') && L.seers?.alive(target.ref)) { result = L.seers.astralift(target.ref, L.rizer.position) || null; target.ref.shockT = Math.max(target.ref.shockT || 0, 1.5); } // static crackles over them through the flight
      else if (target.kind === 'chest' && target.ref?.state === 'closed' && target.ref.open()) result = { kind: 'chest' };
      else if (target.kind === 'coinchest' && target.ref?.state === 'closed') { const coins = L.commonChests?.open(target.ref, { astral: true }); if (coins) result = { kind: 'coinchest', coins }; } // the coin pop itself lands a beat later — see createCommonChests' update()
      if (result) {
        fx.emit(p.x, p.y + 1.3, p.z, 26, { color: '#b8d6ff', speed: 3.2, up: 2.1, size: 0.42, life: 0.75, g: 1 });
        fx.emit(p.x, p.y + 1.3, p.z, 12, { color: '#ffd98a', speed: 2, up: 1.2, size: 0.28, life: 0.55, g: 0.5 });
        if ((target.kind === 'chest' || target.kind === 'coinchest') && lock === target) clearLock();
      }
      L.onDone?.(result);
    }
  }

  // Nearest Seer roughly in front (aim assist when nothing is locked).
  function assistTarget(rizer, seers) {
    let best = null, bd = ASTRAL.blast.range;
    for (const g of seers?.grunts || []) {
      if (!seers.alive(g)) continue;
      const dx = g.pos.x - rizer.position.x, dz = g.pos.z - rizer.position.z, d = Math.hypot(dx, dz);
      const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - rizer.facing), Math.cos(Math.atan2(dx, dz) - rizer.facing)));
      if (off < ASTRAL.lock.assistCone && d < bd) { bd = d; best = g; }
    }
    return best;
  }

  // Launch a bolt from `from` along Rizer's facing, homing on `target` (a Seer grunt) if any.
  function fire(from, facing, target, damage = ASTRAL.blast.damage) {
    const g = new THREE.Group(), core = new THREE.Mesh(coreGeo, mats[palKey].core), shell = new THREE.Mesh(shellGeo, mats[palKey].shell);
    g.add(core, shell); g.position.copy(from); scene.add(g);
    const dir = new THREE.Vector3(Math.sin(facing), 0, Math.cos(facing));
    const stoneTarget = lock?.kind === 'stone' && !lock.ref.broken ? lock.ref : null;
    if (stoneTarget) dir.set(stoneTarget.x - from.x, stoneTarget.y + stoneTarget.h * 0.42 - from.y, stoneTarget.z - from.z).normalize();
    else if (target) dir.copy(target.pos).setY(target.pos.y + (target.aimY ?? 1.4)).sub(from).normalize(); // aimY: a Scanobot's hull height
    bolts.push({ id: ++boltSequence, g, shell, dir, target, stoneTarget, damage, travelled: 0, t: 0, pal });
    fx.emit(from.x, from.y, from.z, 10, { color: pal.cast, speed: 2.5, up: 0.6, size: 0.35, life: 0.35, g: 0 });
  }

  function burst(p, big, P = pal) {
    fx.emit(p.x, p.y, p.z, big ? 26 : 14, { color: P.burst, speed: big ? 5 : 3.5, up: 1.2, size: 0.5, life: 0.5, g: 2 });
    fx.emit(p.x, p.y, p.z, 8, { color: '#e8f2ff', speed: 2, up: 0.6, size: 0.3, life: 0.3, g: 0 });
  }

  // Astralthunder on a locked enemy: Rizer calls it down (the Astralift 2 cast), and it lands `strikeAt` of the way through.
  function thunder(rizer, target, seers, onStrike) {
    const A = rizer.actor, dur = A?.has('thunder') ? A.acts.thunder.getClip().duration : 1.2, hit = A?.has('thunder') ? Math.min(ASTRAL.thunder.strikeClip, dur * 0.9) : dur * ASTRAL.thunder.strikeAt; // the bolt lands on the slam
    const castTime = 2.5, speed = dur / castTime;
    const p = target.pos; rizer.facing = Math.atan2(p.x - rizer.position.x, p.z - rizer.position.z);
    A?.play('thunder', speed); rizer.landLock = Math.max(rizer.landLock || 0, castTime); // planted through the full cast
    fx.emit(rizer.position.x, rizer.position.y + 2.2, rizer.position.z, 16, { color: '#cfe3ff', speed: 1.5, up: 2.5, size: 0.35, life: 0.6, g: -1 });
    strikes.push({ id: ++attackSequence, t: Math.max(0.25, Math.min(hit / speed, castTime * 0.85)), target, seers, onStrike });
  }
  // Astralburst: the cast plays, lightning crackles over Rizer's body while he gathers it, and at the
  // release frame it explodes out around him.
  function astralburst(rizer, seers, onBlast) {
    const A = rizer.actor, B = ASTRAL.burst, dur = A?.has('astralburst') ? A.acts.astralburst.getClip().duration : 2.4;
    const hit = A?.meta.astralburst?.hits?.find(h => h > 1.1 && h < 1.7) ?? B.release;
    A?.play('astralburst', 1); rizer.landLock = Math.max(rizer.landLock || 0, dur * 0.8); // planted through the cast
    rizer.attack = null; rizer.vel.x = rizer.vel.z = 0;
    bursts.push({ id: ++attackSequence, rizer, seers, onBlast, t: 0, release: hit, done: false, bones: null });
  }
  // Rolling Thunder: static gathers across Rizer, the sphere hits the locked target, then starts
  // a three-second fuse. Nearby enemies are pulled into the live chain before the expanding blast.
  function rollingThunder(rizer, target, seers, onDone) {
    const A = rizer.actor, B = ASTRAL.rolling;
    const dur = A?.has('rollingThunder') ? A.acts.rollingThunder.getClip().duration : 1.8;
    // Let the bowling motion finish through the wrist flick before the sphere leaves his hand.
    const release = Math.max(.42, dur * .76), p = target.pos;
    rizer.facing = Math.atan2(p.x - rizer.position.x, p.z - rizer.position.z);
    rizer.attack = null; rizer.vel.x = rizer.vel.z = 0; rizer.landLock = Math.max(rizer.landLock || 0, dur * .9);
    A?.play('rollingThunder', 1);
    const orb = new THREE.Group();
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.3, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color('#f5fbff').multiplyScalar(3.2) }));
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(.62, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#4a8cff').multiplyScalar(2.5), transparent: true, opacity: .58, depthWrite: false, blending: THREE.AdditiveBlending }));
    orb.add(core, shell); orb.visible = false; scene.add(orb);
    rollers.push({ id: ++attackSequence, phase: 'charge', t: 0, release, dur, castLeft: dur, rizer, target, seers, onDone, orb, shell, charge: 0, travelled: 0, hits: [], seen: new Set(), chainWait: 0, fuseLeft: B.fuse, current: null });
  }
  const BODY = ['Head', 'Neck', 'Spine2', 'Spine', 'Hips', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand', 'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg', 'LeftFoot', 'RightFoot'];
  const _p = new THREE.Vector3(), _q = new THREE.Vector3();
  // The Astralburst shockwave without the cast: thrown out from `c` (where Rizer's aerial slam lands · game.js).
  // `target` (a Seer or a tech body) takes `targetDamage`; everyone else in `radius` is blasted back for
  // `damage` at the centre down to `edgeDamage` at the rim. Returns the hits (seers.blastBack / body.hit results).
  // The same force reaches the world: stones, trees and bushes in range take it too (nature.js · breakables).
  const quake = (c, radius, damage, edge) => world.nature?.userData?.breakables?.blast(c, radius, damage, edge);
  let slamWave = null;
  function shockwave(c, seers, { radius = 6, damage = 5, edgeDamage = 2, target = null, targetDamage = damage, others = null } = {}) {
    const hits = [], from = new THREE.Vector3(c.x, c.y + 0.5, c.z);
    flash.position.set(c.x, c.y + 2.5, c.z); flash.intensity = 60;
    fx.emit(c.x, c.y + 0.6, c.z, 50, { color: '#cfe3ff', speed: 8, up: 1.6, size: 0.5, life: 0.5, g: 3 });
    fx.emit(c.x, c.y + 0.2, c.z, 36, { color: pal.burst, speed: 7, up: 0.6, size: 0.5, life: 0.6, g: 2 });
    for (let s = 0; s < 9; s++) { // lightning thrown out along the ground in every direction
      const a = s / 9 * Math.PI * 2 + Math.random() * 0.4, d = radius * (0.7 + Math.random() * 0.35), to = new THREE.Vector3(c.x + Math.sin(a) * d, 0, c.z + Math.cos(a) * d);
      to.y = world.groundAt?.(to.x, to.z, c.y + 2) ?? c.y; arc(from.clone(), to, 0.9, 0.05, 0.22, 9);
    }
    for (const g of seers?.grunts || []) {
      if (!seers.alive(g)) continue;
      const d = Math.hypot(g.pos.x - c.x, g.pos.z - c.z), hitIt = g === target;
      if (!hitIt && (d > radius || Math.abs(g.pos.y - c.y) > 3)) continue;
      const near = 1 - Math.min(1, d / radius), dmg = hitIt ? targetDamage : Math.round(damage - (damage - edgeDamage) * (1 - near));
      _q.set(g.pos.x, g.pos.y + 1.2, g.pos.z); arc(from.clone(), _q, 0.6, 0.05, 0.2, 8);
      hits.push(seers.blastBack(g, c, dmg, hitIt ? 1 : near, hitIt ? 'astralslam' : 'splash'));
    }
    for (const o of others || []) {
      if (!o.alive) continue;
      const dx = o.center.x - c.x, dz = o.center.z - c.z, d = Math.hypot(dx, dz), hitIt = o === target;
      if (!hitIt && (d > radius + (o.r || 0) || Math.abs(o.center.y - c.y) > 5)) continue;
      const near = 1 - Math.min(1, d / radius), dmg = hitIt ? targetDamage : Math.round(damage - (damage - edgeDamage) * (1 - near));
      arc(from.clone(), o.center, 0.6, 0.05, 0.2, 8);
      hits.push(o.hit(dmg, d > 0.05 ? dx / d : 0, d > 0.05 ? dz / d : 1, hitIt ? 'astralslam' : 'splash', hitIt ? 2.5 : 1 + near));
    }
    waveRing.position.set(c.x, (world.groundAt?.(c.x, c.z, c.y + 1) ?? c.y) + 0.08, c.z); waveRing.visible = waveDome.visible = true; waveDome.position.set(c.x, c.y, c.z);
    slamWave = { t: 0, radius };
    quake(c, radius, targetDamage, edgeDamage);
    return hits.filter(Boolean);
  }
  function updateSlamWave(dt) {
    if (!slamWave) return;
    const B = ASTRAL.burst, w = slamWave; w.t += dt; if (bursts.some(b => b.done)) { slamWave = null; return; } // an Astralburst took the ring over
    const k = w.t / B.wave, e = 1 - (1 - Math.min(1, k)) ** 3;
    waveRing.scale.setScalar(0.4 + e * w.radius); waveRing.material.opacity = Math.max(0, 1 - k) * 0.95;
    waveDome.scale.set(0.3 + e * w.radius, (0.3 + e * w.radius) * 0.55, 0.3 + e * w.radius); waveDome.material.opacity = Math.max(0, 1 - k) * 0.35;
    if (k >= 1) { waveRing.visible = waveDome.visible = false; slamWave = null; }
  }
  function updateBursts(dt) {
    const B = ASTRAL.burst;
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i], r = b.rizer, model = r.actor?.model; b.t += dt;
      b.bones ||= BODY.map(n => model?.getObjectByName('mixamorig' + n)).filter(Boolean);
      const at = k => { const bone = b.bones[k % b.bones.length]; if (bone) bone.getWorldPosition(_p); else _p.set(r.position.x, r.position.y + 1, r.position.z); return _p.clone(); };
      // charge: static crawling over his whole body, arcs jumping limb to limb, a flickering glow
      if (!b.done && b.t >= B.chargeFrom) {
        const k = Math.min(1, (b.t - B.chargeFrom) / Math.max(0.1, b.release - B.chargeFrom)); // builds toward the release
        const sparks = Math.random() < dt * (30 + 60 * k) ? 2 + Math.floor(k * 3) : 0;
        for (let s = 0; s < sparks; s++) { const q = at(Math.floor(Math.random() * 99)); fx.emit(q.x + (Math.random() - 0.5) * 0.2, q.y, q.z + (Math.random() - 0.5) * 0.2, 1, { color: Math.random() < 0.5 ? '#dff0ff' : pal.light, speed: 3 + k * 3, up: 0.6, size: 0.16 + Math.random() * 0.14, life: 0.14, g: 0, spread: 0.05 }); }
        if (Math.random() < dt * (6 + 16 * k) && b.bones.length > 1) { const x = Math.floor(Math.random() * b.bones.length); let y = Math.floor(Math.random() * b.bones.length); if (y === x) y = (x + 3) % b.bones.length; arc(at(x), at(y), 0.22 + k * 0.2, 0.022, 0.09, 5); }
        const L = boltLights[1]; r.actor?.model && at(2); L.position.copy(_p); L.color.set('#9fd4ff'); L.intensity = (2.5 + k * 6) * (0.6 + Math.random() * 0.8);
      }
      // release: the explosion
      if (!b.done && b.t >= b.release) {
        b.done = true; b.at = r.position.clone();
        const c = b.at, S = b.seers, hits = [];
        flash.position.set(c.x, c.y + 2.5, c.z); flash.intensity = 70;
        fx.emit(c.x, c.y + 1.1, c.z, 60, { color: '#cfe3ff', speed: 9, up: 2.2, size: 0.55, life: 0.55, g: 3 });
        fx.emit(c.x, c.y + 0.3, c.z, 40, { color: pal.burst, speed: 7, up: 0.8, size: 0.5, life: 0.6, g: 2 });
        for (let s = 0; s < 10; s++) { // lightning thrown out along the ground in every direction
          const a = s / 10 * Math.PI * 2 + Math.random() * 0.4, d = B.radius * (0.7 + Math.random() * 0.35);
          const from = at(Math.floor(Math.random() * 99)), to = new THREE.Vector3(c.x + Math.sin(a) * d, 0, c.z + Math.cos(a) * d);
          to.y = world.groundAt?.(to.x, to.z, c.y + 2) ?? c.y; arc(from, to, 0.9, 0.05, 0.22, 9);
        }
        for (const g of S?.grunts || []) {
          if (!S.alive(g)) continue;
          const dx = g.pos.x - c.x, dz = g.pos.z - c.z, d = Math.hypot(dx, dz);
          if (d > B.radius || Math.abs(g.pos.y - c.y) > 3) continue;
          const dmg = Math.round(B.damage - (B.damage - B.edgeDamage) * Math.min(1, d / B.radius));
          _q.set(g.pos.x, g.pos.y + 1.2, g.pos.z); arc(at(Math.floor(Math.random() * 99)), _q, 0.6, 0.05, 0.2, 8); // a bolt finds each one
          hits.push(S.blastBack(g, c, dmg, 1 - Math.min(1, d / B.radius))); // thrown back, scattered
        }
        quake(c, B.radius, B.damage, B.edgeDamage);
        waveRing.position.set(c.x, (world.groundAt?.(c.x, c.z, c.y + 1) ?? c.y) + 0.08, c.z); waveRing.visible = waveDome.visible = true; waveDome.position.set(c.x, c.y, c.z);
        b.onBlast?.(c, hits.filter(Boolean));
      }
      // the shockwave races out, then fades
      if (b.done) {
        const k = (b.t - b.release) / B.wave, e = 1 - (1 - Math.min(1, k)) ** 3;
        waveRing.scale.setScalar(0.4 + e * B.radius); waveRing.material.opacity = Math.max(0, 1 - k) * 0.95;
        waveDome.scale.set(0.3 + e * B.radius, (0.3 + e * B.radius) * 0.55, 0.3 + e * B.radius); waveDome.material.opacity = Math.max(0, 1 - k) * 0.35;
        if (k >= 1) { waveRing.visible = waveDome.visible = false; bursts.splice(i, 1); }
      }
    }
  }
  function updateRolling(dt) {
    const B = ASTRAL.rolling;
    for (let i = rollers.length - 1; i >= 0; i--) {
      const q = rollers[i], r = q.rizer, S = q.seers; q.t += dt; q.castLeft = Math.max(0, q.castLeft - dt);
      const finish = (exploded = false, explosionHits = []) => {
        scene.remove(q.orb); rollers.splice(i, 1);
        q.onDone?.({ hits: q.hits.filter(Boolean), exploded, explosionHits: explosionHits.filter(Boolean), charge: q.charge });
      };
      if (q.phase === 'charge') {
        q.charge = Math.min(1, q.t / q.release);
        const f = new THREE.Vector3(Math.sin(r.facing), 0, Math.cos(r.facing));
        q.orb.visible = q.charge > .12;
        q.orb.position.copy(r.position).add(new THREE.Vector3(0, 1.15, 0)).addScaledVector(f, .55 + q.charge * .38);
        q.orb.scale.setScalar(.18 + q.charge * .82); q.shell.rotation.y += dt * (5 + q.charge * 14); q.shell.rotation.x += dt * 7;
        const bones = q.bones ||= BODY.map(n => r.actor?.model.getObjectByName('mixamorig' + n)).filter(Boolean);
        if (Math.random() < dt * (25 + 75 * q.charge)) {
          const bone = bones[Math.floor(Math.random() * Math.max(1, bones.length))];
          if (bone) bone.getWorldPosition(_p); else _p.copy(q.orb.position);
          fx.emit(_p.x, _p.y, _p.z, 2, { color: Math.random() < .45 ? '#ffffff' : '#63a5ff', speed: 2 + q.charge * 4, up: .4, size: .16 + q.charge * .14, life: .16, g: 0, spread: .08 });
        }
        if (bones.length > 2 && Math.random() < dt * (5 + 14 * q.charge)) {
          const a = bones[Math.floor(Math.random() * bones.length)], b = bones[Math.floor(Math.random() * bones.length)];
          if (a !== b) arc(a.getWorldPosition(new THREE.Vector3()), b.getWorldPosition(new THREE.Vector3()), .28, .028, .11, 5);
        }
        if (q.t < q.release) continue;
        q.phase = 'travel'; q.t = 0; q.orb.scale.setScalar(1); q.orb.visible = true;
      }
      if (q.phase === 'travel') {
        if (!S?.alive(q.target)) { finish(); continue; }
        const aimAt = q.target.pos.clone().add(new THREE.Vector3(0, 1.15, 0));
        const fromOrb = q.orb.position.clone(), toTarget = aimAt.clone().sub(fromOrb);
        const dir = toTarget.normalize(), step = B.speed * dt;
        const next = fromOrb.clone().addScaledVector(dir, step);
        q.travelled += step; q.orb.position.copy(next); q.shell.rotation.y += dt * 18; q.shell.rotation.x += dt * 11;
        if (Math.random() < dt * 70) fx.emit(next.x, next.y, next.z, 2, { color: '#72b1ff', speed: 1.2, up: .3, size: .24, life: .22, g: 0, spread: .12 });
        // Test the whole swept segment against the locked target. `aimAt` stays in world
        // coordinates; only the cloned vector is normalized for steering.
        const along = clamp(aimAt.clone().sub(fromOrb).dot(dir), 0, step);
        const closest = fromOrb.clone().addScaledVector(dir, along);
        const clear = world.rayClear(fromOrb, next, 0), blocked = clear < step - 1e-3;
        if (closest.distanceToSquared(aimAt) < 1.5 * 1.5 && (!blocked || along <= clear + 0.15)) {
          const g = q.target, dmg = Math.round(B.baseDamage + B.buildDamage * q.charge);
          const hit = S.shock(g, dmg, 0, 0, B.fuse + 0.35);
          if (hit) { q.hits.push(hit); q.seen.add(g); q.current = g; }
          q.phase = 'fuse'; q.t = 0; q.fuseLeft = B.fuse; q.chainWait = 0; q.orb.position.copy(g.pos).add(new THREE.Vector3(0, 1.15, 0));
          flash.position.copy(aimAt); flash.intensity = 42; fx.emit(aimAt.x, aimAt.y, aimAt.z, 24, { color: '#cfe8ff', speed: 5, up: 1.2, size: .38, life: .4, g: 1 });
        } else if (q.travelled > B.range || blocked) finish();
        continue;
      }
      if (q.phase === 'fuse') {
        q.fuseLeft -= dt; q.chainWait -= dt;
        const glow = 1 + Math.sin(q.t * 24) * .12;
        q.orb.visible = true; q.orb.scale.setScalar(glow * (1 + q.seen.size * .08));
        q.shell.rotation.y += dt * 20; q.shell.rotation.x += dt * 13;
        if (Math.random() < dt * (38 + q.seen.size * 5)) fx.emit(q.orb.position.x, q.orb.position.y, q.orb.position.z, 2, { color: '#cfe8ff', speed: 2, up: .7, size: .2 + Math.random() * .12, life: .22, g: 0, spread: .12 });
        // Find the closest fresh enemy near any already electrified target. Keep chaining until
        // the three-second fuse expires, with no fixed target cap.
        if (q.chainWait <= 0 && S?.grunts) {
          let next = null, from = null, best = B.chainRadius;
          for (const caught of q.seen) {
            if (!S.alive(caught)) continue;
            for (const g of S.grunts) {
              if (!S.alive(g) || q.seen.has(g)) continue;
              const d = Math.hypot(g.pos.x - caught.pos.x, g.pos.z - caught.pos.z);
              if (d < best && Math.abs(g.pos.y - caught.pos.y) < 3.5) { best = d; next = g; from = caught; }
            }
          }
          if (next) {
            const a = from.pos.clone().add(new THREE.Vector3(0, 1.15, 0)), b = next.pos.clone().add(new THREE.Vector3(0, 1.15, 0));
            arc(a, b, .65, .06, .24, 10); fx.emit(b.x, b.y, b.z, 22, { color: '#a5d2ff', speed: 4.5, up: 1.4, size: .36, life: .4, g: 0 });
            const hit = S.shock(next, Math.round(B.chainDamage + B.buildDamage * .4 * q.charge), 0, 0, q.fuseLeft + .35);
            if (hit) { q.hits.push(hit); q.seen.add(next); q.current = next; q.orb.position.copy(next.pos).add(new THREE.Vector3(0, 1.15, 0)); }
            q.chainWait = B.chainInterval;
          }
        }
        if (q.fuseLeft > 0) continue;
        const caught = [...q.seen].filter(g => S?.alive(g));
        // Center the final blast among the whole caught group so the larger chain is covered.
        const c = new THREE.Vector3();
        for (const g of caught) c.add(g.pos);
        if (caught.length) c.multiplyScalar(1 / caught.length);
        else c.copy(q.orb.position);
        c.y += .8;
        const radius = Math.min(B.maxBlastRadius, B.baseBlastRadius + Math.max(0, q.seen.size - 1) * B.blastPerTarget), blastHits = [];
        flash.position.copy(c); flash.intensity = 85 + q.seen.size * 5;
        fx.emit(c.x, c.y, c.z, 72 + q.seen.size * 8, { color: '#d9ecff', speed: 10 + q.seen.size * .35, up: 2.5, size: .58 + q.seen.size * .025, life: .65, g: 2 });
        fx.emit(c.x, c.y, c.z, 40 + q.seen.size * 5, { color: '#428cff', speed: 7 + q.seen.size * .25, up: 1.2, size: .5 + q.seen.size * .02, life: .58, g: 1 });
        for (const g of S?.grunts || []) {
          if (!S.alive(g)) continue;
          const d = Math.hypot(g.pos.x - c.x, g.pos.z - c.z); if (d > radius || Math.abs(g.pos.y - c.y) > 4) continue;
          const near = 1 - d / radius, damage = Math.round(B.explosionDamage * (.65 + .35 * near) + Math.max(0, q.seen.size - 1) * .5);
          const toG = g.pos.clone().add(new THREE.Vector3(0, 1.1, 0)); arc(c, toG, .9, .05, .22, 10);
          blastHits.push(S.blastBack(g, c, damage, near));
        }
        { const boom = Math.round(B.explosionDamage + Math.max(0, q.seen.size - 1) * .5); quake(c, radius, boom, boom * 0.4); } // tech bodies and ground in the blast
        finish(true, blastHits);
      }
    }
  }
  const tmp = new THREE.Vector3(), aim = new THREE.Vector3();
  // others: extra bodies the bolts can strike ({ center, r, alive, hit(damage, dx, dz, kind) } — the Scanobots)
  function update(dt, t, rizer, seers, onHit, others = null) {
    updateBursts(dt); updateSlamWave(dt); updateLifts(dt); updateRolling(dt);
    // Astralthunder: strikes land, bolts flicker out, the flash fades
    for (let i = strikes.length - 1; i >= 0; i--) {
      const s = strikes[i]; if ((s.t -= dt) > 0) continue; strikes.splice(i, 1);
      const g = s.target, S = s.seers, T = ASTRAL.thunder; if (!S?.alive(g)) continue;
      const p = g.pos.clone(); lightning(p); flash.position.set(p.x, p.y + 6, p.z); flash.intensity = 60;
      fx.emit(p.x, p.y + 0.2, p.z, 34, { color: '#cfe3ff', speed: 6, up: 3, size: 0.5, life: 0.6, g: 6 });
      fx.emit(p.x, p.y + 1.2, p.z, 18, { color: '#5aa0ff', speed: 3, up: 2, size: 0.45, life: 0.5, g: 0 });
      const hits = [S.shock(g, T.damage)]; quake(p, T.splash, T.damage, T.splashDamage);
      for (const o of S.grunts) { if (o === g || !S.alive(o)) continue; const dx = o.pos.x - p.x, dz = o.pos.z - p.z, d = Math.hypot(dx, dz); if (d < T.splash) hits.push(S.shock(o, T.splashDamage, dx / (d || 1), dz / (d || 1))); }
      s.onStrike?.(p, hits);
    }
    // static electricity crackling over anyone still charged from a strike
    for (const g of seers?.grunts || []) {
      if (!(g.shockT > 0)) continue; g.shockT -= dt;
      if (!g.root.visible) continue;
      const n = Math.random() < dt * 45 ? 3 : 0, down = g.state === 'down' || g.state === 'sinking' || g.state === 'astraliftDown';
      const bones = g.shockBones ||= ['Head', 'Spine2', 'LeftHand', 'RightHand', 'LeftFoot', 'RightFoot'].map(name => g.actor.model?.getObjectByName('mixamorig' + name)).filter(Boolean);
      for (let k = 0; k < n; k++) {
        const bone = bones.length ? bones[Math.floor(Math.random() * bones.length)] : null;
        if (bone) bone.getWorldPosition(tmp);
        else tmp.set(g.pos.x + (Math.random() - 0.5) * (down ? 1.6 : 0.7), g.pos.y + (down ? 0.25 + Math.random() * 0.4 : 0.3 + Math.random() * 1.7), g.pos.z + (Math.random() - 0.5) * (down ? 1.6 : 0.7));
        fx.emit(tmp.x + (Math.random() - 0.5) * 0.18, tmp.y, tmp.z + (Math.random() - 0.5) * 0.18, 1, { color: Math.random() < 0.5 ? '#bfe3ff' : '#5aa0ff', speed: 3.5, up: 0.4, size: 0.16 + Math.random() * 0.12, life: 0.12, g: 0, spread: 0.05 });
      }
      if (Math.random() < dt * 6) { const L = boltLights.find(q => q.intensity === 0); if (L) { L.position.set(g.pos.x, g.pos.y + 1, g.pos.z); L.color.set('#9fd4ff'); L.intensity = 3; } }
    }
    for (let i = zaps.length - 1; i >= 0; i--) {
      const z = zaps[i]; z.t += dt; z.g.visible = z.t < 0.08 || (z.t > 0.12 && z.t < 0.3) || (z.t > 0.36 && z.t < 0.42); // flicker
      if (z.t > 0.45) { scene.remove(z.g); z.g.traverse(o => o.geometry?.dispose()); zaps.splice(i, 1); }
    }
    flash.intensity = Math.max(0, flash.intensity - dt * 160) * (0.8 + Math.random() * 0.4);
    boltLights.forEach((L, i) => { const b = bolts[i]; if (b) { L.intensity = 6; L.position.copy(b.g.position); L.color.set(b.pal.light); } else L.intensity = Math.max(0, L.intensity - dt * 30); }); // (idle lights double as static flickers)
    // lock-on upkeep
    if (lock) {
      const p = lock.pos();
      if (!lock.alive() || p.distanceTo(rizer.position) > ASTRAL.lock.keep || rizer.hp <= 0) clearLock();
      else { reticle.position.set(p.x, p.y + lock.h * 0.5, p.z); reticle.material.rotation = 0; }
    }
    // bolts
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i], B = ASTRAL.blast;
      b.t += dt;
      if (b.target && (b.target.isScanobot ? b.target.alive : seers?.alive(b.target))) { // steer toward the target's chest
        aim.copy(b.target.pos).setY(b.target.pos.y + (b.target.aimY ?? 1.4)).sub(b.g.position).normalize();
        b.dir.lerp(aim, clamp(B.turn * dt, 0, 1)).normalize();
      }
      else if (b.stoneTarget && !b.stoneTarget.broken) {
        aim.set(b.stoneTarget.x, b.stoneTarget.y + b.stoneTarget.h * 0.42, b.stoneTarget.z).sub(b.g.position).normalize();
        b.dir.lerp(aim, clamp(B.turn * dt, 0, 1)).normalize();
      }
      const step = B.speed * dt; tmp.copy(b.g.position).addScaledVector(b.dir, step);
      let done = false, big = false;
      // enemy contact
      for (const g of seers?.grunts || []) {
        if (!seers.alive(g)) continue;
        const cx = g.pos.x - tmp.x, cy = g.pos.y + 1.3 - tmp.y, cz = g.pos.z - tmp.z;
        if (cx * cx + cz * cz < B.radius * B.radius && Math.abs(cy) < 1.5) {
          const d = Math.hypot(b.dir.x, b.dir.z) || 1;
          const hit = seers.hitGrunt(g, b.damage ?? B.damage, b.dir.x / d, b.dir.z / d, 'blast'); onHit?.(hit); done = big = true; break;
        }
      }
      if (!done) for (const o of others || []) {
        if (!o.alive || tmp.distanceTo(o.center) > B.radius * 0.6 + o.r) continue;
        const d = Math.hypot(b.dir.x, b.dir.z) || 1, hit = o.hit(b.damage ?? B.damage, b.dir.x / d, b.dir.z / d, 'blast');
        if (hit) onHit?.(hit); done = big = true; break;
      }
      // world contact
      if (!done && world.nature?.userData?.breakables?.strike({ a: b.g.position, b: tmp, r: 0.24 }, b.damage ?? B.damage, `astral-bolt-${b.id}`, { first: true })) done = big = true; // stone, tree or bush: whatever it reaches first
      if (!done && (tmp.y <= world.groundAt(tmp.x, tmp.z, tmp.y + 1) + 0.1 || world.rayClear(b.g.position, tmp, 0) < step - 1e-3)) done = true;
      b.travelled += step;
      if (b.travelled > B.range) done = true;
      if (done) { burst(b.g.position, big, b.pal); scene.remove(b.g); bolts.splice(i, 1); continue; }
      b.g.position.copy(tmp);
      const pulse = 1 + Math.sin(b.t * 30) * 0.12; b.shell.scale.setScalar(pulse);
      if (Math.random() < dt * 40) fx.emit(tmp.x, tmp.y, tmp.z, 1, { color: b.pal.trail, speed: 0.4, up: 0.2, size: 0.32, life: 0.3, g: 0, spread: 0.1 });
    }
  }
  return { arc, get flash() { return flash; }, setPalette, get palette() { return palKey; }, toggleLock, autoLock, switchLock, clearLock, assistTarget, astralift, canAstralift, thunder, astralburst, shockwave, rollingThunder, fire, update, get bursting() { return bursts.length > 0; }, get rolling() { return rollers.length > 0; }, get rollingCast() { return rollers.some(q => q.castLeft > 0); }, get lock() { return lock; }, get bolts() { return bolts.length; } };
}
