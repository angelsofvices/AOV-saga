// Poly-bound hitboxes. Every character shares the Mixamo rig, so each GLB's own skinned
// mesh is measured once: every vertex goes to the body part its strongest skin weight
// belongs to, and each part gets a capsule fitted to those vertices in the bone's
// bind space (centre line along the bone, ends at the 4th/96th percentile of the
// vertices along it, radius at the 82nd percentile around it). Capsules ride their
// bones every frame, so they follow the animation exactly: the hurtboxes are the body,
// and the hitboxes of a strike are the limb actually swinging (fist + forearm, shin +
// foot, or the sword's blade). A blow only counts when the swinging limb touches a
// hurtbox while it's moving fast, which is what makes contact real.
import * as THREE from 'three';

export const HITBOX = {
  radialPct: 0.82, axialPct: [0.04, 0.96], // how tightly the capsules hug the mesh
  minSpeed: 2.2,        // a limb has to be moving this fast (units/s, relative to the body) to hurt
  windowBefore: 0.2,    // seconds before / after each analysed contact frame a strike can land
  windowAfter: 0.14,
  bodyGap: 0.04         // extra space kept between two bodies' torsos
};

const norm = n => n.replace(/^mixamorig[:_]?/, '');
// Which part a bone's vertices count toward (fingers → hand, toes → foot, shoulders → chest).
function partOf(name) {
  const n = norm(name);
  if (/^(Left|Right)Hand/.test(n)) return n.match(/^(Left|Right)/)[1] + 'Hand';
  if (/^(Left|Right)(ToeBase|Toe_End)/.test(n)) return n.match(/^(Left|Right)/)[1] + 'Foot';
  if (/^(Left|Right)Shoulder$/.test(n)) return 'Spine2';
  if (n === 'HeadTop_End') return 'Head';
  return n;
}
// The bone each part's capsule points along.
const AXIS = {
  Hips: 'Spine', Spine: 'Spine1', Spine1: 'Spine2', Spine2: 'Neck', Neck: 'Head', Head: 'HeadTop_End',
  LeftArm: 'LeftForeArm', LeftForeArm: 'LeftHand', LeftHand: 'LeftHandMiddle1', RightArm: 'RightForeArm', RightForeArm: 'RightHand', RightHand: 'RightHandMiddle1',
  LeftUpLeg: 'LeftLeg', LeftLeg: 'LeftFoot', LeftFoot: 'LeftToeBase', RightUpLeg: 'RightLeg', RightLeg: 'RightFoot', RightFoot: 'RightToeBase'
};
export const PARTS = Object.keys(AXIS);
// Striking limbs per attack kind.
export const STRIKERS = {
  punch: ['LeftHand', 'LeftForeArm', 'RightHand', 'RightForeArm'],
  bite: ['Head', 'Neck'],
  kick: ['LeftFoot', 'LeftLeg', 'RightFoot', 'RightLeg'],
  flykick: ['LeftFoot', 'LeftLeg', 'RightFoot', 'RightLeg'],
  kickup: ['LeftFoot', 'LeftLeg', 'RightFoot', 'RightLeg'],
  runpunch: ['LeftHand', 'LeftForeArm', 'RightHand', 'RightForeArm'],
  sword: ['RightHand'],  // plus the blade itself (see weapon segments)
  axe: ['RightHand', 'LeftHand'] // two-handed; plus the axe head (see weapon segments)
};
export const TORSO = ['Hips', 'Spine', 'Spine1', 'Spine2'];

const pct = (arr, p) => { if (!arr.length) return 0; const s = Float64Array.from(arr).sort(); return s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))]; };
const shapes = new WeakMap(); // gltf → { part: { a, b, r } } in bone space

// Measure a GLB once.
export function measure(gltf) {
  if (shapes.has(gltf)) return shapes.get(gltf);
  gltf.scene.updateMatrixWorld(true);
  const pts = {}; // part → Vector3[] in that part's bone space
  const v = new THREE.Vector3(), m = new THREE.Matrix4();
  let bonesByPart = {}, skel = null;
  gltf.scene.traverse(o => {
    if (!o.isSkinnedMesh) return;
    const sk = o.skeleton; skel ||= sk;
    const pos = o.geometry.attributes.position, si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight;
    const partBone = sk.bones.map(b => { const p = partOf(b.name); return AXIS[p] ? p : null; });
    const partIdx = {}; sk.bones.forEach((b, i) => { if (AXIS[norm(b.name)]) partIdx[norm(b.name)] = i; });
    for (let i = 0; i < pos.count; i++) {
      let best = -1, bw = 0; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } }
      const part = partBone[best]; if (!part || partIdx[part] === undefined) continue;
      v.fromBufferAttribute(pos, i).applyMatrix4(o.bindMatrix).applyMatrix4(sk.boneInverses[partIdx[part]]);
      (pts[part] ||= []).push(v.clone());
    }
    for (const p in partIdx) bonesByPart[p] = { idx: partIdx[p], sk };
  });
  const out = {};
  for (const part of PARTS) {
    const list = pts[part], info = bonesByPart[part]; if (!list || list.length < 4 || !info) continue;
    const { sk, idx } = info;
    // axis: toward the child bone in this bone's bind space
    const child = sk.bones.find(b => norm(b.name) === AXIS[part]);
    const dir = new THREE.Vector3(0, 1, 0);
    if (child) { const ci = sk.bones.indexOf(child); m.copy(sk.boneInverses[ci]).invert(); dir.setFromMatrixPosition(m.premultiply(sk.boneInverses[idx])); if (dir.lengthSq() < 1e-10) dir.set(0, 1, 0); dir.normalize(); }
    const c = new THREE.Vector3(); list.forEach(p => c.add(p)); c.divideScalar(list.length);
    const ts = [], rs = [], d = new THREE.Vector3();
    for (const p of list) { d.subVectors(p, c); const t = d.dot(dir); ts.push(t); rs.push(d.addScaledVector(dir, -t).length()); }
    const t0 = pct(ts, HITBOX.axialPct[0]), t1 = pct(ts, HITBOX.axialPct[1]), r = pct(rs, HITBOX.radialPct);
    // a capsule's caps add r at each end: pull the ends in so the tips sit on the mesh
    const len = t1 - t0, inset = Math.min(r, len / 2) * 0.85;
    out[part] = { a: c.clone().addScaledVector(dir, t0 + inset), b: c.clone().addScaledVector(dir, t1 - inset), r };
  }
  shapes.set(gltf, out);
  return out;
}

// A live set of capsules on one Actor.
export class HitRig {
  constructor(actor) {
    this.actor = actor; this.parts = {}; this.prev = {}; this.t = -1;
    this.bind();
  }
  bind() {
    const a = this.actor, shape = measure(a.gltf), bones = {};
    a.model.traverse(o => { if (o.isBone && AXIS[norm(o.name)]) bones[norm(o.name)] = o; });
    this.parts = {};
    for (const p in shape) if (bones[p]) this.parts[p] = { part: p, bone: bones[p], la: shape[p].a, lb: shape[p].b, lr: shape[p].r, a: new THREE.Vector3(), b: new THREE.Vector3(), r: 0, pa: new THREE.Vector3(), pb: new THREE.Vector3(), vel: 0 };
    this.model = a.model; this.fresh = true;
  }
  // Recompute world capsules (call after the actor has animated this frame).
  update(dt) {
    if (this.model !== this.actor.model) this.bind();
    let top = this.model; while (top.parent && !top.parent.isScene) top = top.parent;
    top.updateMatrixWorld(true);
    const body = this.parts.Hips;
    for (const k in this.parts) {
      const q = this.parts[k], mw = q.bone.matrixWorld;
      q.pa.copy(q.a); q.pb.copy(q.b);
      q.a.copy(q.la).applyMatrix4(mw); q.b.copy(q.lb).applyMatrix4(mw);
      q.r = q.lr * Math.hypot(mw.elements[0], mw.elements[1], mw.elements[2]);
    }
    // limb speed relative to the hips (so running into someone isn't a punch)
    if (!this.fresh && dt > 0 && body) {
      const hv = _s.subVectors(body.a, body.pa);
      for (const k in this.parts) { const q = this.parts[k]; q.vel = _t.subVectors(q.b, q.pb).sub(hv).length() / dt; }
    } else for (const k in this.parts) { const q = this.parts[k]; q.pa.copy(q.a); q.pb.copy(q.b); q.vel = 0; }
    this.fresh = false;
  }
  // Horizontal torso radius (for bodies bumping into each other).
  get torso() { let r = 0; for (const k of TORSO) if (this.parts[k]) r = Math.max(r, this.parts[k].r); return r || 0.3; }
}
const _s = new THREE.Vector3(), _t = new THREE.Vector3();

// Closest distance between segments p1-q1 and p2-q2 (Ericson, Real-Time Collision Detection).
const d1 = new THREE.Vector3(), d2 = new THREE.Vector3(), rr = new THREE.Vector3(), c1 = new THREE.Vector3(), c2 = new THREE.Vector3();
export function segSeg(p1, q1, p2, q2, outA, outB) {
  d1.subVectors(q1, p1); d2.subVectors(q2, p2); rr.subVectors(p1, p2);
  const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(rr);
  let s, t;
  if (a <= 1e-9 && e <= 1e-9) { s = t = 0; }
  else if (a <= 1e-9) { s = 0; t = THREE.MathUtils.clamp(f / e, 0, 1); }
  else {
    const c = d1.dot(rr);
    if (e <= 1e-9) { t = 0; s = THREE.MathUtils.clamp(-c / a, 0, 1); }
    else {
      const b = d1.dot(d2), den = a * e - b * b;
      s = den > 1e-9 ? THREE.MathUtils.clamp((b * f - c * e) / den, 0, 1) : 0;
      t = (b * s + f) / e;
      if (t < 0) { t = 0; s = THREE.MathUtils.clamp(-c / a, 0, 1); } else if (t > 1) { t = 1; s = THREE.MathUtils.clamp((b - c) / a, 0, 1); }
    }
  }
  c1.copy(p1).addScaledVector(d1, s); c2.copy(p2).addScaledVector(d2, t);
  outA?.copy(c1); outB?.copy(c2);
  return c1.distanceTo(c2);
}

// Does a striker (segment a-b, radius r, plus where it was last frame) touch any hurt
// capsule of `rig`? Tests the current pose and the halfway pose so fast swings don't pass through.
const ma = new THREE.Vector3(), mb = new THREE.Vector3(), hitA = new THREE.Vector3(), hitB = new THREE.Vector3();
export function touch(s, rig, out, sweep = false) {
  let best = null;
  for (const k in rig.parts) {
    const q = rig.parts[k];
    for (let step = 0; step < (sweep ? 5 : 2); step++) {
      if (step === 1) { ma.lerpVectors(s.pa, s.a, 0.5); mb.lerpVectors(s.pb, s.b, 0.5); }
      else if (step === 2) { ma.copy(s.pa); mb.copy(s.pb); }
      else if (step === 3) { ma.copy(s.pa); mb.copy(s.a); }
      else if (step === 4) { ma.copy(s.pb); mb.copy(s.b); }
      else { ma.copy(s.a); mb.copy(s.b); }
      const d = segSeg(ma, mb, q.a, q.b, hitA, hitB) - s.r - q.r;
      if (d <= 0 && (!best || d < best.d)) best = { d, part: k, at: hitB.clone(), from: hitA.clone() };
    }
  }
  if (best && out) Object.assign(out, best);
  return best;
}

// Debug view: wireframe capsules for a rig (Dev tab → Show hitboxes).
export function debugMesh(color = 0x6fffb0) {
  const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.55, depthTest: false });
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), sph = new THREE.SphereGeometry(1, 10, 6);
  const pool = [];
  g.renderOrder = 50;
  g.draw = (caps) => {
    let i = 0;
    const get = () => { if (!pool[i]) { const c = new THREE.Group(); c.add(new THREE.Mesh(cyl, mat), new THREE.Mesh(sph, mat), new THREE.Mesh(sph, mat)); c.children.forEach(m => m.renderOrder = 50); g.add(c); pool[i] = c; } return pool[i++]; };
    for (const c of caps) {
      const o = get(); o.visible = true; o.children[0].material = c.hot ? hotMat : mat; o.children[1].material = o.children[2].material = o.children[0].material;
      const len = c.a.distanceTo(c.b);
      o.position.lerpVectors(c.a, c.b, 0.5);
      o.quaternion.setFromUnitVectors(_up, _s.subVectors(c.b, c.a).normalize().lengthSq() ? _s : _up);
      o.children[0].scale.set(c.r, Math.max(1e-3, len), c.r);
      o.children[1].position.set(0, len / 2, 0); o.children[1].scale.setScalar(c.r);
      o.children[2].position.set(0, -len / 2, 0); o.children[2].scale.setScalar(c.r);
    }
    for (; i < pool.length; i++) pool[i].visible = false;
  };
  const hotMat = new THREE.MeshBasicMaterial({ color: 0xff5a4a, wireframe: true, transparent: true, opacity: 0.9, depthTest: false });
  return g;
}
const _up = new THREE.Vector3(0, 1, 0);
