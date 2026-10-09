// RP7D · LABS › ASTRAL: the X-ray Rizer — a look at his matrix.
//
// His real body turns to a dark hologram under a cyan wire mesh, and his central nervous system is drawn on his own
// skeleton (so it moves with every clip): a dense neural tangle in the head, the spinal cord, nerves down both arms
// to the fingertips and both legs to the toes, with fine peripheral branches and a glowing synapse at every joint.
// Lightning pulses fire from the brain and run out through the whole system; the lines crackle as they carry it.
// The room drops away into a dark void with a faint grid under his feet. enable() / disable() swap it all in and out
// without touching the body's own materials or the world (both are restored exactly).
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

const B = n => 'mixamorig' + n;
// The nerve tree, as bone-to-bone runs (each is subdivided and given branches).
const RUNS = [
  ['Head', 'Neck'], ['Neck', 'Spine2'], ['Spine2', 'Spine1'], ['Spine1', 'Spine'], ['Spine', 'Hips'],
  ...['Left', 'Right'].flatMap(s => [
    ['Spine2', `${s}Shoulder`], [`${s}Shoulder`, `${s}Arm`], [`${s}Arm`, `${s}ForeArm`], [`${s}ForeArm`, `${s}Hand`],
    [`${s}Hand`, `${s}HandIndex1`], [`${s}HandIndex1`, `${s}HandIndex2`], [`${s}HandIndex2`, `${s}HandIndex3`], [`${s}HandIndex3`, `${s}HandIndex4`],
    ['Hips', `${s}UpLeg`], [`${s}UpLeg`, `${s}Leg`], [`${s}Leg`, `${s}Foot`], [`${s}Foot`, `${s}ToeBase`], [`${s}ToeBase`, `${s}Toe_End`]
  ])
];
const SYNAPSES = ['Head', 'Neck', 'Spine2', 'Spine1', 'Hips', ...['Left', 'Right'].flatMap(s => [`${s}Shoulder`, `${s}Arm`, `${s}ForeArm`, `${s}Hand`, `${s}UpLeg`, `${s}Leg`, `${s}Foot`])];
const PULSE = { speed: 1.25, spacing: 0.55, width: 10 };      // metres/s along the nerves · gap between pulses · sharpness
const COL = { base: new THREE.Color('#1a6db0'), hot: new THREE.Color('#bff8ff'), brain: new THREE.Color('#3fb8ff') };

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#ffffff'); r.addColorStop(0.25, '#9ff4ff'); r.addColorStop(1, 'rgba(94,242,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createXray({ scene, camera, renderer, getRizer }) {
  let on = null; // { actor, swaps, wires, lines, points, backdrop, nodes, ... }
  const fill = new THREE.MeshBasicMaterial({ color: '#04101a', transparent: true, opacity: 0.62, depthWrite: false });
  const wire = new THREE.MeshBasicMaterial({ color: '#2fd6ff', wireframe: true, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), q = new THREE.Quaternion();

  function enable() {
    const r = getRizer(), actor = r?.actor; if (!actor || on?.actor === actor) return;
    if (on) disable();
    const bone = n => actor.model.getObjectByName(B(n));
    if (!bone('Head') || !bone('Hips')) return; // not a humanoid on the Rizer rig: no X-ray
    const S = actor.scale || 1, rnd = mulberry(7);
    // ── the body: dark hologram + wire mesh, originals kept ──
    const swaps = [], wires = [];
    actor.model.traverse(o => {
      if (!o.isSkinnedMesh || !o.visible) return;
      swaps.push([o, o.material]); o.material = fill;
      const w = new THREE.SkinnedMesh(o.geometry, wire); w.position.copy(o.position); w.quaternion.copy(o.quaternion); w.scale.copy(o.scale);
      w.frustumCulled = false; w.renderOrder = 2; o.parent.add(w); w.bind(o.skeleton, o.bindMatrix); wires.push(w);
    });
    // ── the nervous system: nodes (bone a → bone b at t, plus a fixed offset in a's frame) joined into segments ──
    const nodes = [], segs = [];
    const node = (a, b, t, off, depth, brain = false) => { nodes.push({ a, b, t, off, depth, brain, jit: new THREE.Vector3() }); return nodes.length - 1; };
    actor.model.updateMatrixWorld(true);
    const wp = n => bone(n).getWorldPosition(new THREE.Vector3());
    const head = wp('Head'), depthOf = {}; depthOf.Head = 0;
    for (const [a, b] of RUNS) { if (!bone(a) || !bone(b)) continue; depthOf[b] = (depthOf[a] ?? 0) + wp(a).distanceTo(wp(b)); }
    for (const [a, b] of RUNS) {
      const A = bone(a), Bn = bone(b); if (!A || !Bn) continue;
      const len = wp(a).distanceTo(wp(b)), n = Math.max(3, Math.round(len / (0.035 * S))), d0 = depthOf[a] ?? 0;
      let prev = node(A, Bn, 0, new THREE.Vector3(), d0);
      for (let i = 1; i <= n; i++) {
        const t = i / n, cur = node(A, Bn, t, new THREE.Vector3(), d0 + len * t); segs.push([prev, cur]); prev = cur;
        if (rnd() < 0.55 && i < n) { // a peripheral branch: two or three kinked steps off the run, fixed in a's frame
          let from = cur, dir = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), off = new THREE.Vector3();
          const steps = 2 + (rnd() < 0.4 ? 1 : 0), step = (0.025 + rnd() * 0.03) * S;
          for (let k = 1; k <= steps; k++) {
            dir.add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.9)).normalize();
            off = off.clone().addScaledVector(dir, step / S);
            const nb = node(A, Bn, t, off, d0 + len * t + step * k); segs.push([from, nb]); from = nb;
          }
        }
      }
    }
    // the brain: a dense tangle inside the skull, every neuron wired to its nearest few
    const top = bone('HeadTop_End'), hb = bone('Head'), brainIdx = [], R = 0.085;
    for (let i = 0; i < 46; i++) {
      const v = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5); if (v.length() > 0.5) { i--; continue; }
      v.multiplyScalar(2 * R).add(new THREE.Vector3(0, 0.06, 0.01));
      brainIdx.push(node(hb, top || hb, 0, v, v.length() * 0.6, true));
    }
    for (const i of brainIdx) {
      const near = brainIdx.filter(j => j !== i).sort((x, y) => nodes[x].off.distanceTo(nodes[i].off) - nodes[y].off.distanceTo(nodes[i].off)).slice(0, 2);
      for (const j of near) segs.push([i, j]);
    }
    segs.push([brainIdx[0], 0]); // the brain into the top of the cord
    // ── buffers: the nerves as screen-space fat lines, a bright core over a soft halo ──
    const size = renderer.getSize(new THREE.Vector2());
    const fat = (width, opacity, order) => {
      const geo = new LineSegmentsGeometry(); geo.setPositions(new Float32Array(segs.length * 6)); geo.setColors(new Float32Array(segs.length * 6));
      const mat = new LineMaterial({ linewidth: width, vertexColors: true, transparent: true, opacity, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false });
      mat.resolution.copy(size);
      const l = new LineSegments2(geo, mat); l.frustumCulled = false; l.renderOrder = order; scene.add(l); return l;
    };
    const halo = fat(9, 0.28, 9), lines = fat(2.6, 1, 10);
    const syn = SYNAPSES.map(bone).filter(Boolean);
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((syn.length + 1) * 3), 3));
    pgeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array((syn.length + 1) * 3), 3));
    const points = new THREE.Points(pgeo, new THREE.PointsMaterial({ size: 0.09 * S, map: glowTex(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false }));
    points.frustumCulled = false; points.renderOrder = 11; scene.add(points);
    // the room drops away: everything but him goes dark, and a faint grid lies under his feet
    let holder = actor.pivot; while (holder.parent && holder.parent !== scene) holder = holder.parent;
    const own = new Set([lines, halo, points]), hidden = scene.children.filter(o => o !== holder && !own.has(o) && o.visible).map(o => (o.visible = false, o));
    const world = { background: scene.background, fog: scene.fog }; scene.background = new THREE.Color('#01040a'); scene.fog = null;
    const grid = new THREE.GridHelper(8, 32, '#5ef2ff', '#0d4a7a'); grid.material.transparent = true; grid.material.opacity = 0.35; grid.material.depthWrite = false; scene.add(grid);
    on = { actor, swaps, wires, lines, halo, points, grid, hidden, world, nodes, segs, syn, depthOf, t: 0, crackle: 0, rnd, S, brainIdx };
  }
  function disable() {
    if (!on) return;
    for (const [o, m] of on.swaps) o.material = m;
    for (const w of on.wires) { w.removeFromParent(); w.skeleton = null; }
    for (const o of [on.lines, on.halo, on.points, on.grid]) { o.removeFromParent(); o.geometry.dispose(); o.material.map?.dispose(); o.material.dispose(); }
    for (const o of on.hidden) o.visible = true;
    scene.background = on.world.background; scene.fog = on.world.fog;
    on = null;
  }
  function update(dt) {
    if (!on) return;
    const r = getRizer(); if (r?.actor !== on.actor) { disable(); enable(); if (!on) return; }
    on.t += dt; on.crackle -= dt;
    const { nodes, segs, S } = on, crack = on.crackle <= 0; if (crack) on.crackle = 0.07;
    on.actor.model.updateMatrixWorld(true);
    // node positions (with a fresh lightning jitter every crackle)
    const P = nodes.map(n => {
      n.a.getWorldPosition(tmpA); n.b.getWorldPosition(tmpB); const p = tmpA.clone().lerp(tmpB, n.t);
      if (n.off.lengthSq()) p.add(n.off.clone().multiplyScalar(S).applyQuaternion(n.a.getWorldQuaternion(q)));
      if (crack) n.jit.set(on.rnd() - 0.5, on.rnd() - 0.5, on.rnd() - 0.5).multiplyScalar((n.brain ? 0.006 : 0.012) * S);
      return p.add(n.jit);
    });
    // pulses: bright fronts running outward from the brain along nerve depth
    const glow = d => { const w = ((d - on.t * PULSE.speed) / PULSE.spacing) % 1, k = 1 - (w < 0 ? w + 1 : w); return Math.pow(k, PULSE.width); };
    const posBuf = on.lines.geometry.attributes.instanceStart.data, colBuf = on.lines.geometry.attributes.instanceColorStart.data;
    const pos = posBuf.array, col = colBuf.array, c = new THREE.Color();
    segs.forEach(([i, j], s) => {
      for (const [k, idx] of [[0, i], [1, j]]) {
        const n = nodes[idx], p = P[idx], o = s * 6 + k * 3;
        pos[o] = p.x; pos[o + 1] = p.y; pos[o + 2] = p.z;
        const h = n.brain ? 0.15 + 0.55 * Math.max(0, Math.sin(on.t * 9 + idx * 1.7)) * (0.5 + 0.5 * Math.sin(on.t * 2.3)) : glow(n.depth);
        c.copy(n.brain ? COL.brain : COL.base).lerp(COL.hot, Math.min(1, h)).multiplyScalar(n.brain ? 0.35 + 0.7 * h : 0.75 + 1.6 * h); // neurons flicker without blowing out the skull
        col[o] = c.r; col[o + 1] = c.g; col[o + 2] = c.b;
      }
    });
    posBuf.needsUpdate = true; colBuf.needsUpdate = true;
    const hp = on.halo.geometry.attributes.instanceStart.data, hc = on.halo.geometry.attributes.instanceColorStart.data; // the halo follows the core
    hp.array.set(pos); hc.array.set(col); hp.needsUpdate = true; hc.needsUpdate = true;
    const size = renderer.getSize(new THREE.Vector2()); on.lines.material.resolution.copy(size); on.halo.material.resolution.copy(size);
    const pp = on.points.geometry.attributes.position.array, pc = on.points.geometry.attributes.color.array;
    on.syn.forEach((b, i) => {
      b.getWorldPosition(tmpA); pp[i * 3] = tmpA.x; pp[i * 3 + 1] = tmpA.y; pp[i * 3 + 2] = tmpA.z;
      const name = b.name.replace('mixamorig', ''), h = glow(on.depthOf[name] ?? 0);
      c.copy(COL.base).lerp(COL.hot, h).multiplyScalar(0.8 + 1.8 * h); pc[i * 3] = c.r; pc[i * 3 + 1] = c.g; pc[i * 3 + 2] = c.b;
    });
    const bp = P[on.brainIdx[0]], last = on.syn.length; // the brain's core, breathing
    pp[last * 3] = bp.x; pp[last * 3 + 1] = bp.y; pp[last * 3 + 2] = bp.z;
    const br = 0.45 + 0.3 * Math.sin(on.t * 4.2); c.copy(COL.brain).multiplyScalar(br); pc[last * 3] = c.r; pc[last * 3 + 1] = c.g; pc[last * 3 + 2] = c.b;
    on.points.geometry.attributes.position.needsUpdate = true; on.points.geometry.attributes.color.needsUpdate = true;
    on.actor.pivot.getWorldPosition(tmpA); on.grid.position.set(tmpA.x, tmpA.y + 0.01, tmpA.z); // the grid stays under his feet
  }
  return { enable, disable, update, get active() { return !!on; } };
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
