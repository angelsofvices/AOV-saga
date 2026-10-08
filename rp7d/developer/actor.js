// Animated character shared by the player and NPCs. Every model uses the
// Mixamo rig. Each actor has named SLOTS (idle, walk, run, sprint, jump, fall,
// land, punch, kick, hurt, knockdown, interact, emote). The five built into
// every GLB fill idle/walk/run/punch/kick; the Anim Lab can put any clip in any
// slot (see anim-lib.js). One driver handles locomotion blending, air poses,
// one-shots and a full-body preview for the lab.
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { clamp } from './util.js';
import { loadGLB, registerActor, BUILTIN_SLOTS } from './anim-lib.js';
export { loadGLB };

// Clip data measured from SK_Elzoran.fbx for the built-in clips: Walk holds two
// 42-frame cycles, Run one 16-frame cycle; `dist` is ground covered per cycle at
// scale 1, `phase` lines each clip's left-foot-forward moment up so they blend.
export const CLIPS = {
  walk: { name: 'Walk', cycle: 1.4, dist: 1.32, phase: 0.167 },
  run: { name: 'Run', cycle: 0.533, dist: 2.0, phase: 0.188 },
  sprint: { cycle: 0.5, dist: 2.6, phase: 0 },
  // One-shots. `active` is the moment the blow lands, in seconds at 1× speed.
  punch: { name: 'Punch', active: 0.17, recover: 0.46 },
  kick: { name: 'Kick', active: 0.3, recover: 0.66 }
};
const ONE_SHOTS = ['punch', 'punch2', 'punch3', 'punch4', 'kick', 'kick2', 'kick3', 'kick4', 'bite', 'feedBody', 'turn', 'astralift', 'astraliftHit', 'stunned', 'standup', 'dodge', 'doublejump', 'enter', 'pickup', 'store', 'land', 'hurt', 'knockdown', 'interact', 'emote', 'blast', 'blast2', 'blast3', 'sword', 'sword2', 'sword3', 'sword4', 'axe', 'axe2', 'axe3', 'axe4', 'teeter', 'astralboardPush', 'rollingThunder', ...Array.from({ length: 10 }, (_, i) => `bond${i + 1}`)];
const STAIR_SLOTS = ['stairWalkUp', 'stairRunUp', 'stairWalkDown', 'stairRunDown'];

// Sneak-right clip: facing turned this far from the direction of travel so the side-steps carry him along it.
const SNEAK_YAW = 0; // the sneak faces its direction of travel (the side-step clip used to turn his body across the path)
// Ease a looping clip's time back to its first frame (the crouched idle pose) along the shorter way round.
const damp0 = (t, d, dt) => { const k = Math.min(1, dt * 6); return t > d / 2 ? Math.min(d - 1e-4, t + (d - t) * k) % d : t * (1 - k); };
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export class Actor {
  constructor(gltf, scale, charKey) {
    this.gltf = gltf; this.charKey = charKey;
    this.model = cloneSkinned(gltf.scene); this.model.scale.setScalar(scale); this.scale = scale;
    // The rigs are exported with the hips ~0.41 in front of the scene origin, which drew every
    // body half a unit ahead of its collision point. Centre the hips over the feet point.
    gltf.scene.updateMatrixWorld(true);
    const hips = gltf.scene.getObjectByName('mixamorigHips');
    if (hips) { const h = hips.getWorldPosition(new THREE.Vector3()); this.model.position.set(-h.x * scale, 0, -h.z * scale); }
    this.model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
    this.pivot = new THREE.Group(); this.pivot.add(this.model); // lean/bank/fall pivot at the feet
    this.mixer = new THREE.AnimationMixer(this.model);
    this.acts = {}; this.meta = {}; this.builtin = {};
    this.poseAlignment = null;
    for (const [slot, name] of Object.entries(BUILTIN_SLOTS)) { const c = gltf.animations.find(a => a.name === name); if (c) this.builtin[slot] = c; }
    for (const slot in this.builtin) this._bind(slot, this.builtin[slot], {});
    this.cycle = 0; this.shot = null; this.air = 0; this.airT = 0; this.preview = null;
    this.ready = charKey ? registerActor(this) : Promise.resolve();
  }
  _bind(slot, clip, meta) {
    const old = this.acts[slot]; if (old && old.getClip() !== clip) old.setEffectiveWeight(0);
    if (!clip) { delete this.acts[slot]; delete this.meta[slot]; return; }
    const a = this.mixer.clipAction(clip); a.play(); a.setEffectiveWeight(0); a.timeScale = 0;
    this.acts[slot] = a; this.meta[slot] = meta;
  }
  // Fill a slot with a clip — or a list of { clip, meta } variants — or null to fall
  // back to the GLB's own clip (or nothing). Looping slots pick one variant per actor
  // (so ten Seers don't all walk alike); one-shots pick again every time they play.
  setSlot(slot, clip, meta = {}) {
    let list = Array.isArray(clip) ? clip : clip ? [{ clip, meta }] : [];
    if (!list.length && this.builtin[slot]) list = [{ clip: this.builtin[slot], meta: {} }];
    const same = this.vars?.[slot] && this.vars[slot].length === list.length && this.vars[slot].every((v, i) => v.clip === list[i].clip);
    if (same) return;
    (this.vars ||= {})[slot] = list;
    if (this.shot?.kind === slot) this.shot = null;
    const pick = list.length ? list[Math.floor(Math.random() * list.length)] : null;
    this._bind(slot, pick?.clip || null, pick?.meta || {});
  }
  // Re-roll a one-shot slot's variant.
  _reroll(slot) {
    const list = this.vars?.[slot]; if (!list || list.length < 2) return;
    const v = list[Math.floor(Math.random() * list.length)]; this._bind(slot, v.clip, v.meta);
  }
  has(slot) { return !!this.acts[slot]; }
  // When a strike's blow lands and when the actor can act again (seconds at 1×).
  timing(kind) {
    const a = this.acts[kind], base = CLIPS[kind] || CLIPS.punch;
    if (!a) return { ...base, hits: [base.active] };
    if (a.getClip() === this.builtin[kind]) return { ...base, hits: [base.active], dur: a.getClip().duration };
    const d = a.getClip().duration, hits = this.meta[kind]?.hits?.length ? this.meta[kind].hits : [d * 0.38];
    return { active: hits[0], hits, recover: d * 0.85, dur: d };
  }
  // Locomotion stride data for a slot: seconds per cycle and ground covered per cycle.
  // Ground speed (world units/s) at which a locomotion clip plays at its authored rate with feet planted.
  naturalSpeed(slot) { const st = this.stride(slot); return st.dist * this.scale / st.cycle; }
  stride(slot) {
    const st = this._stride(slot), c = this.cadence?.[slot];
    return c ? { ...st, dist: st.dist / c } : st; // cadence < 1: the legs cycle slower for the same ground speed
  }
  _stride(slot) {
    const a = this.acts[slot], base = CLIPS[slot] || CLIPS.run;
    if (!a || a.getClip() === this.builtin[slot]) return base;
    const d = a.getClip().duration, travel = this.meta[slot]?.travel;
    return { cycle: d, dist: travel > 0.3 ? travel : base.dist * d / base.cycle, phase: 0 }; // travel is in model units, like base.dist
  }
  // Start a one-shot clip. `hold` keeps the last frame until release(). Returns false if the slot is empty.
  play(kind, speed = 1, { hold = false, loop = false, from = 0, until = 0, soft = false, overlay = false } = {}) {
    this._clearPoseAlignment();
    if (!this.acts[kind]) return false;
    // Keep the outgoing one-shot on its last pose while the next one starts.
    // Keep linked actions continuous instead of exposing idle between clips.
    const outgoing = this.shot;
    this.blendFrom = (((outgoing?.kind === 'astraliftHit' || outgoing?.kind === 'bailImpact') && kind === 'standup') ||
      (outgoing?.kind === 'ledgeGrab' && kind === 'ledgeClimb') ||
      (outgoing?.kind === 'prayKneel' && (kind === 'prayHold' || kind === 'prayStand')) ||
      (outgoing?.kind === 'prayHold' && kind === 'prayStand')) ? {
      kind: outgoing.kind,
      time: Math.min(outgoing.t, this.acts[outgoing.kind].getClip().duration - 1e-4),
      age: 0,
      duration: 0.16
    } : null;
    if (this.shot?.kind !== kind) this._reroll(kind);
    const dur = until || this.acts[kind].getClip().duration;
    this.shot = { kind, t: from, speed, dur, hold, loop, from, soft, overlay, age: 0, blendIn: this.blendFrom?.duration || 0 }; return true;
  }
  _clearPoseAlignment() {
    const p = this.poseAlignment; if (!p) return;
    this.model.position.copy(p.basePos); this.model.quaternion.copy(p.baseQuat); this.poseAlignment = null;
  }
  // Start a recovery clip with its reference bone aligned to the current pose.
  // The correction eases back to the rig's normal transform over the clip, so a
  // fallen enemy gets up at the point where Blastback left it instead of snapping.
  playAligned(kind, referenceBone = 'Head', speed = 1) {
    this._clearPoseAlignment();
    const action = this.acts[kind]; if (!action) return this.play(kind, speed);
    let reference = null, hips = null;
    this.model.traverse(o => {
      if (!o.isBone) return;
      const key = o.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (!reference && key.endsWith(referenceBone.toLowerCase())) reference = o;
      if (!hips && key.endsWith('hips')) hips = o;
    });
    if (!reference || !hips) return this.play(kind, speed);

    this.pivot.updateMatrixWorld(true); this.model.updateMatrixWorld(true);
    const parentQ = this.pivot.getWorldQuaternion(new THREE.Quaternion()).invert();
    const oldHead = this.pivot.worldToLocal(reference.getWorldPosition(new THREE.Vector3()));
    const oldHipsQ = parentQ.clone().multiply(hips.getWorldQuaternion(new THREE.Quaternion()));
    const saved = Object.values(this.acts).map(a => ({ a, time: a.time, weight: a.getEffectiveWeight(), enabled: a.enabled }));
    for (const s of saved) s.a.setEffectiveWeight(0);
    action.enabled = true; action.time = 0; action.setEffectiveWeight(1);
    this.mixer.update(0); this.model.updateMatrixWorld(true);
    const newHead = this.pivot.worldToLocal(reference.getWorldPosition(new THREE.Vector3()));
    const newHipsQ = parentQ.clone().multiply(hips.getWorldQuaternion(new THREE.Quaternion()));
    for (const s of saved) { s.a.time = s.time; s.a.enabled = s.enabled; s.a.setEffectiveWeight(s.weight); }
    this.mixer.update(0); this.model.updateMatrixWorld(true);

    const basePos = this.model.position.clone(), baseQuat = this.model.quaternion.clone();
    const correctionQ = oldHipsQ.multiply(newHipsQ.invert());
    const correctedHead = newHead.sub(basePos).applyQuaternion(correctionQ).add(basePos);
    const correctionPos = oldHead.sub(correctedHead);
    const played = this.play(kind, speed); if (!played) return false;
    const correctedQuat = correctionQ.clone().multiply(baseQuat).normalize();
    this.model.position.copy(basePos).add(correctionPos);
    this.model.quaternion.copy(correctedQuat);
    this.poseAlignment = { basePos, baseQuat, correctionPos, correctedQuat, t: 0, duration: Math.max(0.1, this.acts[kind].getClip().duration / Math.abs(speed || 1)) };
    return true;
  }
  // Stop a one-shot; with `fade` (s) it blends out instead of cutting.
  release(kind, fade = 0) {
    if (kind && this.shot?.kind !== kind) return;
    if (fade > 0 && this.shot) { if (!this.shot.fadeOut) { this.shot.fadeOut = fade; this.shot.fadeT = fade; } }
    else this.shot = null;
  }
  get busy() { return !!this.shot && !this.shot.hold; }
  // Pose the skeleton for this frame. `shape` (optional, set by the Build Lab's build-library.js) layers a
  // character's proportions over the animation: before() puts back what it changed last frame, the mixer
  // writes the clips, after() applies the proportions on top. Actors without a shape (Rizer) are unchanged.
  _pose() { this.shape?.before(); this.mixer.update(0); this.shape?.after(); }
  // Anim Lab preview: one clip at full weight, overriding everything.
  startPreview(clip, { loop = true, speed = 1 } = {}) {
    this.stopPreview();
    const a = this.mixer.clipAction(clip); a.play(); a.timeScale = 0; a.setEffectiveWeight(1);
    this.preview = { a, t: 0, loop, speed, dur: clip.duration };
  }
  stopPreview() { if (this.preview) { const a = this.preview.a; if (!Object.values(this.acts).includes(a)) a.stop(); else a.setEffectiveWeight(0); this.preview = null; } }
  get previewTime() { return this.preview ? this.preview.t : 0; }

  // Stride locked to ground speed so feet plant. `air` = { grounded, vy }.
  update(dt, speed, grounded = true, vy = 0) {
    const a = this.acts;
    for (const k in a) a[k].setEffectiveWeight(0);
    if (this.preview) {
      const p = this.preview; p.t += dt * p.speed;
      if (p.t >= p.dur) p.t = p.loop ? p.t % Math.max(p.dur, 1e-3) : p.dur;
      p.a.time = Math.min(p.t, p.dur - 1e-4); p.a.setEffectiveWeight(1);
      this._pose(); return;
    }
    const hv = this.heavy && a.heavyRun && !this.rifle ? 'heavyRun' : 'run';
    const W = this.stride('walk'), R = this.stride(hv), S = this.stride('sprint');
    const hasAir = !!(a.jump || a.fall);
    this.air = grounded ? Math.max(0, this.air - dt * 8) : Math.min(1, this.air + dt * 10);
    this.airT = grounded ? 0 : this.airT + dt;
    const moving = grounded || hasAir ? smoothstep(0.25, 1.4, speed) : Math.max(this._moving || 0, 0.6); // no air clips: hold mid-stride
    this._moving = moving;
    // Walk → run blend keyed to each clip's own natural pace, so walking speed shows the walk clip.
    const walkV = this.naturalSpeed('walk'), runV = this.naturalSpeed(hv);
    const r = a.run ? smoothstep(walkV * 1.2, Math.max(runV * 0.85, walkV * 1.6), speed) : 0, sp = a.sprint ? smoothstep(8.4, 11.5, speed) : 0;
    const stairKey = this.stairMotion && a[this.stairMotion] ? this.stairMotion : null;
    this.stairWeights ||= Object.fromEntries(STAIR_SLOTS.map(k => [k, 0]));
    let stairSum = 0;
    for (const key of STAIR_SLOTS) {
      const action = a[key]; if (!action) continue;
      const weight = this.stairWeights[key] = clamp(this.stairWeights[key] + ((stairKey === key ? 1 : 0) - this.stairWeights[key]) * Math.min(1, dt * 18), 0, 1);
      stairSum += weight;
      if (weight > 0.001) action.time = (action.time + dt * (this.stairPace?.[key] ? clamp(speed / this.stairPace[key], 0.4, 1.4) : clamp(speed / Math.max(1, this.naturalSpeed(key)), 0.65, 1.5))) % action.getClip().duration;
    }
    // Cross-fade stair direction / pace changes as well as the transition to
    // ordinary locomotion, so opposing clips never snap over one another.
    if (stairSum > 1) for (const key of STAIR_SLOTS) this.stairWeights[key] /= stairSum;
    this.stairW = clamp(stairSum, 0, 1);
    const dist = W.dist + (R.dist - W.dist) * r + (S.dist - R.dist) * sp * r;
    if (grounded) this.cycle = (this.cycle + speed * dt / (this.scale * dist)) % 1;
    const at = (slot, st) => { if (a[slot]) a[slot].time = ((this.cycle + st.phase) % 1) * a[slot].getClip().duration * Math.min(1, st.cycle / a[slot].getClip().duration); };
    at('walk', W); at('run', R); at('heavyRun', R); at('sprint', S);
    // Rifle stance (actor.rifle): the rifle set takes over idle / walk / run, on its own stride so its feet plant too.
    const rifleOn = this.rifle && a.rifleIdle ? 1 : 0;
    this.rifleW = clamp((this.rifleW || 0) + (rifleOn - (this.rifleW || 0)) * Math.min(1, dt * 9), 0, 1);
    const rw = this.rifleW; let rr = 0;
    if (rw > 0) {
      const RW = this.stride(a.rifleWalk ? 'rifleWalk' : 'walk'), RR = this.stride(a.rifleRun ? 'rifleRun' : 'run');
      const rwV = RW.dist * this.scale / RW.cycle, rrV = RR.dist * this.scale / RR.cycle;
      rr = a.rifleRun ? smoothstep(rwV * 1.2, Math.max(rrV * 0.85, rwV * 1.6), speed) : 0;
      if (grounded) this.rcycle = ((this.rcycle || 0) + speed * dt / (this.scale * (RW.dist + (RR.dist - RW.dist) * rr))) % 1;
      const rat = (slot, st) => { if (a[slot]) a[slot].time = (((this.rcycle || 0) + st.phase) % 1) * a[slot].getClip().duration; };
      rat('rifleWalk', RW); rat('rifleAimWalk', RW); rat('rifleBack', RW); rat('rifleRun', RR); rat('rifleStrafeL', RR); rat('rifleStrafeR', RR);
      for (const k of ['rifleIdle', 'rifleAim', 'rifleCrouch']) if (a[k]) a[k].time = (a[k].time + dt) % a[k].getClip().duration;
      this.aimW = clamp((this.aimW || 0) + ((this.aiming ? 1 : 0) - (this.aimW || 0)) * Math.min(1, dt * 10), 0, 1);
      this.strafeW = (this.strafeW || 0) + (clamp(this.strafe || 0, -1, 1) - (this.strafeW || 0)) * Math.min(1, dt * 8);
      this.backW = (this.backW || 0) + (clamp(this.backing || 0, 0, 1) - (this.backW || 0)) * Math.min(1, dt * 8);
    }
    const DW = a.dazedWalk ? this.stride('dazedWalk') : W, DR = a.dazedRun ? this.stride('dazedRun') : R;
    at('dazedWalk', DW); at('dazedRun', DR);
    this.crawlW = a.crawl ? clamp((this.crawlW || 0) + ((this.crawling ? 1 : 0) - (this.crawlW || 0)) * Math.min(1, dt * 8), 0, 1) : 0;
    if (a.crawl && this.crawlW > 0.001 && grounded) {
      const C = this.stride('crawl');
      this.crawlCycle = ((this.crawlCycle || 0) + speed * dt / Math.max(0.1, this.scale * C.dist)) % 1;
      a.crawl.time = this.crawlCycle * a.crawl.getClip().duration;
    }
    if (a.idle) a.idle.time = (a.idle.time + dt) % a.idle.getClip().duration;
    // air: jump clip plays once from take-off, fall loops
    let airW = hasAir ? this.air : 0;
    if (airW) {
      if (a.jump) { const m = this.meta.jump || {}, end = Math.max(0.05, (m.landT || a.jump.getClip().duration) - 1e-3); a.jump.time = Math.min((m.takeoff || 0) + this.airT, end); }
      if (a.fall) a.fall.time = (this.airT) % a.fall.getClip().duration;
    }
    let shotW = 0, blendW = 0;
    if (this.shot) {
      const s = this.shot; s.t += dt * s.speed;
      if (s.loop && s.t >= s.dur) s.t %= s.dur;
      if (s.t >= s.dur && !s.hold) this.shot = null;
      else {
        const t = Math.min(s.t, s.dur - 1e-4);
        s.age = (s.age || 0) + dt;
        shotW = s.blendIn ? smoothstep(0, s.blendIn, s.age) : s.hold || s.loop ? Math.min(s.age / 0.1, 1) : Math.min(s.age / 0.05, (s.dur - s.t) / 0.12, 1);
        if (s.overlay) shotW *= 0.62; // weapon handling rides over the walk / run cycle
        if (s.fadeOut) { s.fadeT -= dt; shotW *= Math.max(0, s.fadeT / s.fadeOut); if (s.fadeT <= 0) { this.shot = null; shotW = 0; } }
        a[s.kind].time = t; a[s.kind].setEffectiveWeight(shotW);
      }
    }
    if (this.blendFrom) {
      const b = this.blendFrom; b.age += dt;
      blendW = 1 - smoothstep(0, b.duration, b.age);
      const old = a[b.kind];
      if (old && blendW > 0) { old.time = b.time; old.setEffectiveWeight(blendW); }
      else { this.blendFrom = null; blendW = 0; }
    }
    // water: float while still, tread while moving, swim (the stroke) while sprinting. flight overrides ground and air.
    const water = a.swim || a.float ? (this.swim || 0) : 0, still = 1 - smoothstep(0.4, 1.6, speed);
    // sprinting in water (R2): the swimming stroke takes over from treading
    const fastW = a.swimrun ? water * smoothstep(2.2, 3.0, speed) : 0;
    const floatW = a.float ? water * (a.swim ? still : 1) : 0, swimW = a.swim ? water * (a.float ? 1 - still : 1) * (1 - fastW) : 0;
    if (fastW) a.swimrun.time = (a.swimrun.time + dt * clamp(speed / 3.9, 0.75, 1.3)) % a.swimrun.getClip().duration;
    if (swimW) a.swim.time = (a.swim.time + dt * (0.8 + Math.min(speed, 4) * 0.15)) % a.swim.getClip().duration;
    if (floatW) a.float.time = (a.float.time + dt) % a.float.getClip().duration;
    this.flyW = a.fly ? clamp((this.flyW || 0) + ((this.fly ? 1 : 0) - (this.flyW || 0)) * Math.min(1, dt * 6), 0, 1) : 0;
    if (this.flyW) { a.fly.time = (a.fly.time + dt * (0.8 + Math.min(speed, 20) * 0.03)) % a.fly.getClip().duration; airW *= 1 - this.flyW; }
    // L3 descent: the flight pose gives way to the floating clip on the way down
    // …and hovering in place (flying, barely moving) floats too; moving through the air flies.
    const hover = this.fly && Math.hypot(speed, vy || 0) < 1.2;
    this.descW = a.descend ? clamp((this.descW || 0) + ((this.descend || hover ? 1 : 0) - (this.descW || 0)) * Math.min(1, dt * 4), 0, 1) : 0;
    if (this.descW) a.descend.time = (a.descend.time + dt) % a.descend.getClip().duration;
    // R2 + L3 dive: the fast controlled fall takes over the whole flight pose
    this.ffW = a.fastfall ? clamp((this.ffW || 0) + ((this.fastfall ? 1 : 0) - (this.ffW || 0)) * Math.min(1, dt * 6), 0, 1) : 0;
    if (this.ffW) a.fastfall.time = (a.fastfall.time + dt) % a.fastfall.getClip().duration;
    // Fight stance while locked on — but running breaks into the real run cycle (the stance fades out as the run blends in).
    this.fightW = clamp((this.fightW || 0) + ((this.fighting ? 1 - r : 0) - (this.fightW || 0)) * Math.min(1, dt * 7), 0, 1);
    if (a.fight) a.fight.time = (a.fight.time + dt) % a.fight.getClip().duration;
    if (a.heavyFight) a.heavyFight.time = (a.heavyFight.time + dt) % a.heavyFight.getClip().duration;
    const fk = this.heavy && a.heavyFight && !this.rifle ? 'heavyFight' : 'fight'; // axe / longsword drawn: the heavy stance
    // stealth crouch: the sneak cycle while moving, its first frame held as the crouched idle.
    // It's a side-step clip, so while sneaking the body turns across the path (sideYaw) to step along it.
    this.crouchW = a.crouch ? clamp((this.crouchW || 0) + ((this.crouch ? 1 : 0) - (this.crouchW || 0)) * Math.min(1, dt * 8), 0, 1) : 0;
    if (this.crouchW) {
      const m = smoothstep(0.2, 0.9, speed), cd = a.crouch.getClip().duration;
      this._sneakT = m > 0.02 ? ((this._sneakT || 0) + dt * clamp(speed / 1.8, 0.4, 1.6)) % cd : damp0(this._sneakT || 0, cd, dt);
      a.crouch.time = this._sneakT;
      this.sideYaw = (this.sideYaw || 0) + ((this.crouch ? m * SNEAK_YAW : 0) - (this.sideYaw || 0)) * Math.min(1, dt * 7);
    } else this.sideYaw = (this.sideYaw || 0) * Math.max(0, 1 - dt * 7);
    const base = Math.max(0, 1 - shotW - blendW), ground = base * (1 - airW) * (1 - water) * (1 - this.flyW) * (1 - this.crouchW);
    a.crouch?.setEffectiveWeight(this.crouchW * base * (1 - airW) * (1 - water) * (1 - this.flyW));
    a.swim?.setEffectiveWeight(swimW * base * (1 - airW) * (1 - this.flyW));
    a.float?.setEffectiveWeight(floatW * base * (1 - airW) * (1 - this.flyW));
    a.swimrun?.setEffectiveWeight(fastW * base * (1 - airW) * (1 - this.flyW));
    a.fly?.setEffectiveWeight(this.flyW * base * (1 - this.descW) * (1 - this.ffW));
    a.descend?.setEffectiveWeight(this.flyW * base * this.descW * (1 - this.ffW));
    a.fastfall?.setEffectiveWeight(this.flyW * base * this.ffW);
    const fightW = a[fk] ? this.fightW * (1 - rw) : 0;
    const locomotion = ground * (1 - fightW) * (1 - rw) * (1 - this.crawlW);
    a.crawl?.setEffectiveWeight(moving * ground * (1 - fightW) * (1 - rw) * this.crawlW);
    if (a.idle) a.idle.setEffectiveWeight((1 - moving) * locomotion);
    // Fight Form is full-body while standing and stepping in combat; running hands over to the run clip.
    a.fight?.setEffectiveWeight(fk === 'fight' ? fightW * ground : 0);
    a.heavyFight?.setEffectiveWeight(fk === 'heavyFight' ? fightW * ground : 0);
    const ordinaryLocomotion = 1 - this.stairW;
    const dazedW = this.dazed && (a.dazedWalk || a.dazedRun) ? 1 : 0;
    a.walk?.setEffectiveWeight(moving * (1 - r) * locomotion * ordinaryLocomotion * (1 - dazedW));
    a.run?.setEffectiveWeight(hv === 'run' ? moving * r * (1 - sp) * locomotion * ordinaryLocomotion * (1 - dazedW) : 0);
    a.heavyRun?.setEffectiveWeight(hv === 'heavyRun' ? moving * r * (1 - sp) * locomotion * ordinaryLocomotion * (1 - dazedW) : 0);
    a.sprint?.setEffectiveWeight(moving * r * sp * locomotion * ordinaryLocomotion * (1 - dazedW));
    a.dazedWalk?.setEffectiveWeight(moving * (1 - r) * locomotion * ordinaryLocomotion * dazedW);
    a.dazedRun?.setEffectiveWeight(moving * r * locomotion * ordinaryLocomotion * dazedW);
    for (const key of STAIR_SLOTS) a[key]?.setEffectiveWeight(moving * this.stairWeights[key] * locomotion);
    if (rw > 0) {
      // Crouched in stealth with the rifle up: the kneeling aim. In the air: the rifle jump. Otherwise idle ↔ aim, walk ↔ run.
      const rg = base * (1 - water) * (1 - this.flyW) * rw, crouchR = a.rifleCrouch ? this.crouchW * (1 - moving) : 0;
      if (crouchR) { a.crouch?.setEffectiveWeight(this.crouchW * base * (1 - airW) * (1 - water) * (1 - this.flyW) * (1 - rw * (1 - moving))); a.rifleCrouch.setEffectiveWeight(rg * (1 - airW) * crouchR); }
      const stand = rg * (1 - airW) * (1 - this.crouchW), aimW = a.rifleAim ? this.aimW : 0;
      a.rifleIdle.setEffectiveWeight((1 - moving) * stand * (1 - aimW));
      a.rifleAim?.setEffectiveWeight((1 - moving) * stand * aimW);
      const hasWalk = !!a.rifleWalk, wk = moving * stand * (hasWalk ? 1 - rr : 0), rn = moving * stand * (hasWalk ? rr : 1);
      const back = a.rifleBack ? this.backW : 0, aw = a.rifleAimWalk ? aimW : 0;
      a.rifleWalk?.setEffectiveWeight(wk * (1 - back) * (1 - aw)); a.rifleAimWalk?.setEffectiveWeight(wk * (1 - back) * aw); a.rifleBack?.setEffectiveWeight((wk + rn) * back);
      const sl = a.rifleStrafeL ? Math.max(0, this.strafeW) : 0, sr = a.rifleStrafeR ? Math.max(0, -this.strafeW) : 0;
      if (a.rifleRun) a.rifleRun.setEffectiveWeight(rn * (1 - back) * (1 - sl - sr)); else if (a.run) a.run.setEffectiveWeight(rn);
      a.rifleStrafeL?.setEffectiveWeight(rn * (1 - back) * sl); a.rifleStrafeR?.setEffectiveWeight(rn * (1 - back) * sr);
      if (airW && a.rifleJump) {
        const m = this.meta.rifleJump || {}, d = a.rifleJump.getClip().duration;
        a.rifleJump.time = Math.min(d * 0.34 + this.airT, d * 0.6);
        a.rifleJump.setEffectiveWeight(airW * rg); this._rifleAir = 1 - rw;
      } else this._rifleAir = 1;
    } else this._rifleAir = 1;
    if (airW) {
      const rising = a.jump && (vy > 0 || !a.fall) ? 1 : 0;
      a.jump?.setEffectiveWeight(airW * base * rising * this._rifleAir);
      a.fall?.setEffectiveWeight(airW * base * (1 - rising) * this._rifleAir);
    }
    if (this.poseAlignment) {
      const p = this.poseAlignment; p.t += dt;
      const u = smoothstep(0, p.duration, p.t);
      this.model.position.copy(p.basePos).addScaledVector(p.correctionPos, 1 - u);
      this.model.quaternion.slerpQuaternions(p.correctedQuat, p.baseQuat, u);
      if (u >= 1) this.poseAlignment = null;
    }
    this._pose();
  }
}
export { ONE_SHOTS };
