// Zyrex bonding: the Rizer clip and the input challenge share one timeline.
import * as THREE from 'three';
import { makeZysphereSprite, disposeZysphereSprite } from './zysphere-art.js';

const GLYPHS = ['✕', '○', '□', '△'];
const KEYS = { Space: 0, KeyF: 1, KeyJ: 2, KeyK: 3 };
const clamp = THREE.MathUtils.clamp;
const nameOf = z => z.def.name || z.def.species.replace(/(^|[-_])\w/g, m => m.replace(/[-_]/g, '').toUpperCase());
export const bondDifficulty = z => clamp(Math.round(z.def.bondDifficulty || z.def.tier || 1), 1, 10);

export function createBondGame({ scene, host, fx, inventory, saveInv, toast, onSuccess }) {
  const panel = document.createElement('section');
  panel.className = 'bond-game'; panel.hidden = true; panel.setAttribute('aria-label', 'Zyrex bond challenge');
  panel.innerHTML = '<header><small>ZY-LINK · BOND TRIAL</small><b data-bond-title></b><span data-bond-tier></span></header><div class="bond-instruction" data-bond-instruction></div><div class="bond-keys" data-bond-keys></div><div class="bond-track"><i data-bond-fill></i></div><footer><span data-bond-progress></span><span data-bond-clock></span></footer><p class="bond-help" data-bond-help></p>';
  host.appendChild(panel);
  const el = key => panel.querySelector(`[data-bond-${key}]`);
  const blue = new THREE.MeshBasicMaterial({ color: '#73cfff', transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false });
  const beamGeo = new THREE.CylinderGeometry(.09, .16, 1, 10);
  let trial = null;

  // The bonding ball is the RP7 Zysphere (zysphere-art.js: the same 2DHD art as the world pickup),
  // with the blue link beam and light reaching from it to the Zyrex.
  function makeOrb() {
    const root = new THREE.Group();
    const ball = makeZysphereSprite(.62); root.add(ball);
    const beam = new THREE.Mesh(beamGeo, blue); root.add(beam);
    const light = new THREE.PointLight('#55b9ff', 3, 7); root.add(light);
    scene.add(root); return { root, ball, beam, light };
  }
  function disposeOrb(v) {
    scene.remove(v.root);
    disposeZysphereSprite(v.ball);
    v.light.dispose?.();
  }
  // RP7B's wild bond (WILD_BOND): the only trial is the spin. One gate per tier, three rotations a gate; each rotation
  // is two full turns of a stick inside 2.5 s, and every rotation re-rolls which stick and which way — never the same
  // stick and direction twice running.
  const SPIN = { rotationsPerGate: 3, turns: 2, seconds: 2.5, slips: 3 };
  // A missed rotation is a SLIP, not the end: the link falls back to the start of the gate he was on, and the bond
  // only breaks on the third slip. The Zyrex's temperament (RP7B) then shapes the spin itself:
  //   Calm         the full window, and the next rotation is shown ahead of time
  //   Skittish     a shorter window, and it bolts on the first slip
  //   Wary         it turns once mid-rotation: the direction reverses halfway
  //   Territorial  it bristles between gates: hold both sticks still for a beat before the next spin
  //   Dominant     it pushes back: the bar drains whenever he stops spinning
  const TEMPER = {
    Calm: { seconds: 2.5, preview: true, line: 'CALM · it lets you see the next turn' },
    Skittish: { seconds: 2.0, slips: 1, line: 'SKITTISH · one slip and it bolts' },
    Wary: { seconds: 2.7, flip: true, line: 'WARY · it turns on you mid-spin' },
    Territorial: { seconds: 2.5, hold: 1.0, line: 'TERRITORIAL · hold still when it bristles' },
    Dominant: { seconds: 2.6, drain: 2.6, line: 'DOMINANT · stop spinning and it pushes back' }
  };
  function makeStages(tier, z) {
    const count = tier * SPIN.rotationsPerGate; let prev = null;
    return Array.from({ length: count }, () => {
      let stick, direction; do { stick = Math.random() < 0.5 ? 'L' : 'R'; direction = Math.random() < 0.5 ? 1 : -1; } while (prev && prev[0] === stick && prev[1] === direction);
      prev = [stick, direction];
      return { kind: 'spin', stick, direction, first: direction, target: SPIN.turns * Math.PI * 2, value: 0, t: 0, strikes: 0, angle: null, keyDirection: null, flipped: false, idle: 0 };
    });
  }
  function stageOf(q) { return q.stages[q.index]; }
  function start(z, rizer) {
    if (trial || !z || z.bonded || z.bondCapture) return false;
    if (!rizer.onGround || rizer.flying || rizer.attack || rizer.dodgeT > 0) { toast('BOND · stand still on the ground first'); return false; }
    if (!(inventory.items?.zyphere > 0)) { toast('BOND · collect a Zyphere first'); return false; }
    const tier = bondDifficulty(z), slot = `bond${tier}`, action = rizer.actor?.acts?.[slot];
    if (!action) { toast('BOND · animation still loading'); return false; }
    const clipDuration = action.getClip().duration, stages = makeStages(tier, z);
    const temper = TEMPER[z.temper] ? z.temper : 'Calm', K = TEMPER[temper], stageCap = K.seconds;
    const animDuration = Math.max(clipDuration, stages.length * stageCap);
    rizer.finishSwap?.(.1); rizer.setBlock?.(false); rizer.attack = null; rizer.vel.set(0, 0, 0); rizer.speed = 0;
    rizer.facing = Math.atan2(z.pos.x - rizer.position.x, z.pos.z - rizer.position.z);
    if (!rizer.actor.play(slot, clipDuration / animDuration, { hold: true })) return false;
    inventory.items.zyphere--; saveInv();
    z.bondCapture = true; z.speed = 0; z.b.root.position.copy(z.pos);
    const modelScale = z.b.root.scale.clone(), modelPosition = z.pos.clone();
    trial = { z, rizer, tier, slot, stages, index: 0, stageCap, animDuration, elapsed: 0, phase: 'challenge', phaseT: 0, modelScale, modelPosition, visual: makeOrb(), temper, K, slips: 0, maxSlips: K.slips || SPIN.slips, rest: 0, hold: 0, note: '' };
    panel.hidden = false; el('title').textContent = nameOf(z); el('tier').textContent = `DIFFICULTY ${tier} / 10 · ${K.line}`;
    toast(`BOND TRIAL · ${nameOf(z)} · Zyphere committed`);
    paint(); return true;
  }
  function clean(q) {
    panel.hidden = true; disposeOrb(q.visual); trial = null;
    q.rizer.actor?.release(q.slot, .22);
  }
  function fail(reason = 'The bond broke') {
    const q = trial; if (!q) return;
    const z = q.z; z.bondCapture = false; z.b.root.position.copy(q.modelPosition); z.b.root.scale.copy(q.modelScale);
    z.state = 'flee'; z.timer = 2.6; z.bondFocus = false;
    clean(q); toast(`BOND FAILED · ${reason} · Zyphere used`);
  }
  function succeed() {
    const q = trial; if (!q) return;
    const z = q.z; z.bondCapture = false; z.bonded = true; z.b.root.visible = false; z.bondFocus = false;
    clean(q); onSuccess?.(z, q.tier);
    toast(`BOND SECURED · ${nameOf(z)} joined the Zyphone`);
  }
  function advance() {
    const q = trial; if (!q) return;
    fx?.emit(q.z.pos.x, q.z.pos.y + 1.5, q.z.pos.z, 10, { color: '#78caff', speed: 1.4, up: 1, size: .18, life: .38 });
    q.index++; q.note = '';
    if (q.index >= q.stages.length) { q.phase = 'stabilize'; q.phaseT = 0; }
    else if (q.K.hold && q.index % SPIN.rotationsPerGate === 0) q.hold = q.K.hold; // a gate closed: the Territorial bristles before the next
    paint();
  }
  // A missed rotation: back to the start of this gate, unless that was the last slip it will stand for.
  function slip(reason) {
    const q = trial; if (!q) return;
    q.slips++;
    if (q.slips >= q.maxSlips) { fail(q.maxSlips === 1 ? `${reason} · it bolted` : `${reason} · third slip`); return; }
    const from = Math.floor(q.index / SPIN.rotationsPerGate) * SPIN.rotationsPerGate;
    for (let i = from; i < Math.min(q.stages.length, from + SPIN.rotationsPerGate); i++) { const s = q.stages[i]; s.value = 0; s.t = 0; s.angle = null; s.keyDirection = null; s.direction = s.first; s.flipped = false; s.idle = 0; }
    q.index = from; q.rest = 0.7; q.hold = 0; q.note = `${reason} · back to the start of gate ${from / SPIN.rotationsPerGate + 1}`;
    fx?.emit(q.z.pos.x, q.z.pos.y + 1.5, q.z.pos.z, 8, { color: '#ff8f6b', speed: 1.6, up: 1, size: .18, life: .35 });
    paint();
  }
  // Progress on the current rotation (radians, signed by whether it went the asked way). Wary reverses once, halfway.
  function turn(s, amount) {
    const q = trial;
    if (amount > 0) { s.value += amount; s.idle = 0; } else s.value = Math.max(0, s.value + amount);
    if (q.K.flip && !s.flipped && s.value >= s.target * 0.5) { s.flipped = true; s.direction *= -1; s.angle = null; s.keyDirection = null; q.note = 'IT TURNS · reverse!'; }
    if (s.value >= s.target) { advance(); return true; }
    return false;
  }
  function pressButton(button) {
    const q = trial; if (!q || q.phase !== 'challenge') return;
    const s = stageOf(q);
    if (s.kind === 'spin' || (s.kind === 'pattern' && s.t < s.sequence.length * .43 + .3)) return;
    const expected = s.kind === 'mash' ? s.button : s.sequence[s.value];
    if (button === expected) { s.value++; if (s.value >= s.target) advance(); }
    else { s.strikes++; s.t += .42; if (s.strikes >= 3) fail('Too many wrong inputs'); }
    paint();
  }
  function turnKey(code) {
    const q = trial; if (!q || q.phase !== 'challenge') return;
    const s = stageOf(q), v = (s.stick === 'R' ? { ArrowRight: 0, ArrowDown: 1, ArrowLeft: 2, ArrowUp: 3 } : { KeyD: 0, KeyS: 1, KeyA: 2, KeyW: 3 })[code]; // left stick = W A S D · right stick = the arrow keys
    if (s.kind !== 'spin' || v == null) return;
    if (q.rest > 0) return;
    if (q.hold > 0) { q.hold = q.K.hold; q.note = 'It felt that · hold still'; paint(); return; } // moved while it bristled: the beat starts over
    const prev = s.keyDirection; s.keyDirection = v;
    if (prev != null) {
      const step = (v - prev + 4) % 4;
      if (step === (s.direction > 0 ? 1 : 3)) { if (turn(s, Math.PI / 2)) return; }
      else if (step && step !== 2) turn(s, -Math.PI / 2);
    }
    paint();
  }
  function key(code) {
    if (!trial) return false;
    if (code === 'Escape') { fail('Cancelled'); return true; }
    if (code in KEYS) pressButton(KEYS[code]); else turnKey(code);
    return true;
  }
  function paint() {
    const q = trial; if (!q) return;
    const s = stageOf(q);
    if (q.phase !== 'challenge') {
      el('instruction').textContent = q.phase === 'capture' ? 'BOND SECURED · pulling into the Zyphere' : 'Keep the link steady…';
      el('keys').textContent = '✦  ✦  ✦'; el('fill').style.width = '100%'; el('progress').textContent = `${q.stages.length} / ${q.stages.length}`;
      el('clock').textContent = ''; el('help').textContent = 'The blue light is drawing the Zyrex in.'; return;
    }
    const gate = Math.floor(q.index / SPIN.rotationsPerGate) + 1, slipsLine = q.maxSlips === 1 ? 'NO SLIPS ALLOWED' : `SLIPS ${q.slips} / ${q.maxSlips}`;
    if (q.rest > 0 || q.hold > 0) {
      el('instruction').textContent = q.rest > 0 ? 'THE LINK SLIPPED · steady…' : 'HOLD STILL · it is bristling';
      el('keys').innerHTML = `<strong>${q.rest > 0 ? '…' : '✋'}</strong><span>${q.note || (q.hold > 0 ? 'Sticks at rest until it settles' : '')}</span>`;
      el('fill').style.width = '0%'; el('progress').textContent = `GATE ${gate} / ${q.tier} · ${slipsLine}`;
      el('clock').textContent = `${Math.max(0, q.rest > 0 ? q.rest : q.hold).toFixed(1)}s`; el('help').textContent = q.K.line; return;
    }
    const preview = s.kind === 'pattern' && s.t < s.sequence.length * .43 + .3;
    const flash = preview && Math.floor(s.t / .43) < s.sequence.length && s.t % .43 < .31 ? s.sequence[Math.floor(s.t / .43)] : -1;
    el('instruction').textContent = s.kind === 'mash' ? `MASH ${GLYPHS[s.button]} TO HOLD THE LINK` : s.kind === 'spin' ? `SPIN THE ${s.stick === 'R' ? 'RIGHT' : 'LEFT'} STICK ${s.direction > 0 ? 'CLOCKWISE ↻' : 'COUNTERCLOCKWISE ↺'}` : preview ? 'WATCH THE FLASHING PATTERN' : 'REPEAT THE PATTERN';
    el('keys').innerHTML = s.kind === 'mash' ? `<strong>${GLYPHS[s.button]}</strong><span>${s.value} / ${s.target}</span>`
      : s.kind === 'spin' ? `<strong>${s.direction > 0 ? '↻' : '↺'}</strong><span>${(s.value / (Math.PI * 2)).toFixed(1)} / ${(s.target / (Math.PI * 2)).toFixed(0)} turns</span>`
      : s.sequence.map((b, i) => `<strong class="${i === flash ? 'flash' : i < s.value && !preview ? 'done' : ''}">${i === flash || i < s.value && !preview ? GLYPHS[b] : '◇'}</strong>`).join('');
    el('fill').style.width = `${clamp(s.value / s.target, 0, 1) * 100}%`;
    el('progress').textContent = `GATE ${gate} / ${q.tier} · ROTATION ${q.index % SPIN.rotationsPerGate + 1} / ${SPIN.rotationsPerGate} · ${slipsLine}`;
    el('clock').textContent = `${Math.max(0, s.t ? q.stageCap - s.t : q.stageCap).toFixed(1)}s`;
    const nx = q.K.preview ? q.stages[q.index + 1] : null; // Calm: the next rotation, ahead of time
    el('help').textContent = q.note ? q.note : nx ? `NEXT · ${nx.stick === 'R' ? 'right' : 'left'} stick ${nx.first > 0 ? 'clockwise ↻' : 'counterclockwise ↺'}`
      : s.stick === 'R' ? 'Right stick · keyboard ↑ → ↓ ← (or reverse) · two full turns' : 'Left stick · keyboard W → D → S → A (or reverse) · two full turns';
  }
  function update(dt, pad) {
    const q = trial; if (!q) return;
    if (q.rizer.hp <= 0) { fail('Rizer was interrupted'); return; }
    q.elapsed += dt; q.phaseT += dt;
    const orb = q.visual, r = q.rizer;
    orb.root.position.set(r.position.x + Math.sin(r.facing) * 1.25, r.position.y + 1.25 + Math.sin(q.elapsed * 5) * .05, r.position.z + Math.cos(r.facing) * 1.25);
    { const pulse = 1 + Math.sin(q.elapsed * 6) * .045; orb.ball.scale.set(.62 * (912 / 955) * pulse, .62 * pulse, 1); }
    if (q.phase === 'challenge') {
      const s = stageOf(q);
      if (pad && q.elapsed > .22 && pad.edge(17)) { fail('Cancelled'); return; }
      if (q.rest > 0) { q.rest -= dt; s.angle = null; paint(); }
      else if (q.hold > 0) { // Territorial, between gates: any stick movement starts the beat again
        if (pad && (Math.hypot(pad.x, pad.z) > .4 || Math.hypot(pad.lx, pad.ly) > .4)) { q.hold = q.K.hold; q.note = 'It felt that · hold still'; } else q.hold -= dt;
        s.angle = null; paint();
      } else {
      s.t += dt; s.idle += dt;
      if (q.K.drain && s.idle > .28 && s.value > 0) s.value = Math.max(0, s.value - q.K.drain * dt); // Dominant: it pushes back
      if (pad && q.elapsed > .22) {
        const sx = s.stick === 'R' ? pad.lx : pad.x, sy = s.stick === 'R' ? pad.ly : pad.z; // (pad.lx / ly are the right stick)
        if (s.kind === 'spin' && Math.hypot(sx, sy) > .66) {
          const angle = Math.atan2(sy, sx);
          if (s.angle != null) {
            const delta = Math.atan2(Math.sin(angle - s.angle), Math.cos(angle - s.angle));
            s.angle = angle;
            if (Math.abs(delta) < 1.3 && delta * s.direction > 0) { if (turn(s, Math.abs(delta))) return; }
            else if (delta * s.direction < -.1) turn(s, -Math.abs(delta) * .45);
          } else s.angle = angle;
        } else if (s.kind === 'spin') s.angle = null;
      }
      if (s.t >= q.stageCap) { slip('The link slipped'); return; }
      paint();
      }
    } else if (q.phase === 'stabilize' && q.elapsed >= q.animDuration) { q.phase = 'capture'; q.phaseT = 0; paint(); }
    const target = q.z.b.root, center = target.position.clone().add(new THREE.Vector3(0, .95, 0));
    if (q.phase === 'challenge' || q.phase === 'stabilize') {
      target.position.copy(q.modelPosition).add(new THREE.Vector3(0, Math.sin(q.elapsed * 4) * .12 + .55, 0));
      target.rotation.y += dt * .5;
    } else if (q.phase === 'capture') {
      const u = clamp(q.phaseT / 1.25, 0, 1), ease = u * u * (3 - 2 * u);
      target.position.copy(q.modelPosition).add(new THREE.Vector3(0, .55 + ease * .9, 0)).lerp(orb.root.position, ease);
      target.scale.copy(q.modelScale).multiplyScalar(Math.max(.001, 1 - ease)); target.rotation.y += dt * (1 + ease * 13);
      orb.light.intensity = 3 + ease * 7;
      if (u >= 1) { succeed(); return; }
    }
    const delta = center.sub(orb.root.position), length = delta.length();
    orb.beam.position.copy(delta).multiplyScalar(.5); orb.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    orb.beam.scale.set(1, length, 1); orb.beam.material.opacity = q.phase === 'capture' ? .95 : .43 + Math.sin(q.elapsed * 12) * .12;
    if (Math.random() < dt * 22) fx?.emit(target.position.x, target.position.y + 1, target.position.z, 1, { color: '#7bcfff', speed: .9, up: .7, size: .13, life: .45 });
  }
  return { start, key, update, fail, get active() { return !!trial; } };
}
