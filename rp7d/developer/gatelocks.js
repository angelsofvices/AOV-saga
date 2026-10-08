// Portal Gatelocks: two in Malezor, both closed at the start. A closed gatelock is a stone platform with the
// gold winged emblem and its blue gem, and a narrow beam of light standing up out of it; it is solid.
// Walk up to one with 10 Portalchips (dropped by Scanobots — scanobots.js) and it takes exactly 10 on its
// own: CLOSED → ACTIVATING → OPEN, on the same base. Open, the beam has become a tall pointed aperture (dark
// centre, purple/blue/cyan energy edge), a runic ring of light around it, sparkles and a blue-violet glow.
// Open is passable, stays open for the session and never asks for chips again. JUMP (or fly) through an open
// aperture and he comes out of another open gatelock, picked at random, still moving the way he was; walking
// through on the ground does nothing, and with no other gatelock open the aperture goes nowhere.
// Closed gatelocks move to a new spot every 5 real minutes; an open one stays put.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng } from './util.js';
import { quarterAt } from './world-data.js';
import { inventory, saveInv } from './loot.js';

export const GATELOCK = {
  count: 2, need: 10, item: 'portalchip',
  relocateMs: 5 * 60 * 1000,  // closed ones move every 5 real minutes
  reach: 2.7,                 // proximity that activates it (centre to Rizer)
  solid: 1.25,                // closed: Rizer can't walk into this radius (+ his own)
  activate: 2.4,              // seconds from ACTIVATING to OPEN
  toastEvery: 4,              // "not enough chips" reminder while he stands there (seconds)
  through: { half: 0.85, lo: 0.3, hi: 3.5, out: 1.0, cool: 900 }, // the aperture he must cross airborne: half width, feet height above the base (lo…hi), how far out the far side he lands, ms before either end takes him again
  homeMin: 45, hubMax: 110, spacing: 40, awayFromRizer: 25
};
const STATE_NAME = { closed: 'CLOSED', activating: 'ACTIVATING', open: 'OPEN' };

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// The platform's top: worn flagstones in rings, blue channels between them.
const stoneTex = () => canvasTex(256, 256, (g, w) => {
  const c = w / 2; g.fillStyle = '#4a4552'; g.fillRect(0, 0, w, w);
  for (let ring = 0; ring < 4; ring++) {
    const r0 = 18 + ring * 28, r1 = r0 + 26, n = 6 + ring * 4;
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2 + ring * 0.3, a1 = (i + 1) / n * Math.PI * 2 + ring * 0.3 - 0.05, l = 58 + ((i * 37 + ring * 11) % 17);
      g.fillStyle = `hsl(265, 7%, ${l * 0.55}%)`; g.beginPath(); g.arc(c, c, r1, a0, a1); g.arc(c, c, r0, a1, a0, true); g.closePath(); g.fill();
    }
  }
  g.strokeStyle = 'rgba(80,150,255,.9)'; g.lineWidth = 3; for (const r of [44, 100, 127]) { g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke(); }
});
const sparkTex = () => canvasTex(32, 32, (g, w) => {
  const c = w / 2, rg = g.createRadialGradient(c, c, 0, c, c, c); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.3, 'rgba(170,210,255,.8)'); rg.addColorStop(1, 'rgba(90,120,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, w, w);
  g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(c - 0.75, 2, 1.5, w - 4); g.fillRect(2, c - 0.75, w - 4, 1.5);
});

// The open aperture: a pointed oval (two-circle lens) with a dark starry centre, swirling purple, and a
// bright blue/cyan edge that ripples; glow falls off outside it. uv → [-1, 1].
const apertureFrag = `uniform float uT; uniform float uA; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 p = vUv * 2.0 - 1.0;
  float c = 0.429, r = 0.979;
  float ang = atan(p.y, p.x), rip = 0.022 * sin(ang * 9.0 + uT * 3.0) + 0.016 * sin(ang * 23.0 - uT * 5.0);
  float d = length(vec2(abs(p.x) + c, p.y)) - r + rip; // < 0 inside
  float rr = length(p * vec2(1.6, 1.0));
  vec3 voidC = vec3(0.03, 0.03, 0.14);
  float swirl = 0.5 + 0.5 * sin(rr * 14.0 - uT * 2.2 + ang * 3.0);
  vec3 inner = mix(voidC, vec3(0.32, 0.12, 0.85), smoothstep(-0.45, -0.05, d) * (0.55 + 0.45 * swirl));
  vec2 sp = floor((p + vec2(uT * 0.02, uT * 0.05)) * 40.0); float star = step(0.985, h(sp)) * (0.5 + 0.5 * sin(uT * 4.0 + h(sp + 3.0) * 30.0));
  inner += vec3(0.7, 0.8, 1.0) * star * smoothstep(-0.05, -0.3, d);
  float edge = exp(-pow((d + 0.03) / 0.045, 2.0));
  float edge2 = exp(-pow((d + 0.12) / 0.05, 2.0));
  vec3 col = inner + vec3(0.55, 0.9, 1.4) * edge * 2.4 + vec3(0.45, 0.25, 1.3) * edge2 * 1.4;
  float outer = d > 0.0 ? exp(-d / 0.07) : 1.0;
  col = d > 0.0 ? vec3(0.25, 0.55, 1.4) * outer * 1.6 : col;
  float a = d > 0.0 ? outer * 0.8 : 0.96;
  gl_FragColor = vec4(col, a * uA);
}`;
const apertureVert = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

let SHARED = null;
function shared() {
  if (SHARED) return SHARED;
  const M = {
    stone: new THREE.MeshStandardMaterial({ color: '#ffffff', map: stoneTex(), roughness: 0.92, metalness: 0.05 }),
    stoneSide: new THREE.MeshStandardMaterial({ color: '#3b3743', roughness: 0.95 }),
    gold: new THREE.MeshStandardMaterial({ color: '#e2aa45', metalness: 0.55, roughness: 0.28, emissive: '#5a3600', emissiveIntensity: 0.5 }), // (no env map: modest metalness keeps the gold bright)
    dark: new THREE.MeshStandardMaterial({ color: '#2c2a33', metalness: 0.55, roughness: 0.45 }),
    gem: new THREE.MeshStandardMaterial({ color: '#4c9bff', emissive: '#1e5cff', emissiveIntensity: 1.6, metalness: 0.15, roughness: 0.1 }),
    inlay: new THREE.MeshStandardMaterial({ color: '#2b6dff', emissive: '#1846d6', emissiveIntensity: 1.1, metalness: 0.4, roughness: 0.3 }),
    purple: new THREE.MeshStandardMaterial({ color: '#9b4dff', emissive: '#5a1fd6', emissiveIntensity: 1.2, metalness: 0.3, roughness: 0.25 }),
    rune: new THREE.MeshBasicMaterial({ color: new THREE.Color('#5aa0ff').multiplyScalar(1.6), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  };
  // the winged emblem: a gold chevron wing (one side; mirrored for the other), with a blue inlay strip
  const wing = new THREE.Shape([[0.12, 0.1], [0.62, 0.2], [0.5, 0.06], [0.66, 0.0], [0.42, -0.04], [0.48, -0.12], [0.14, -0.1]].map(([x, y]) => new THREE.Vector2(x, y)));
  const inlay = new THREE.Shape([[0.18, 0.06], [0.52, 0.13], [0.44, 0.04], [0.18, 0.0]].map(([x, y]) => new THREE.Vector2(x, y)));
  const ex = (s, d) => new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1 });
  const wingR = ex(wing, 0.07), wingL = ex(wing, 0.07).scale(-1, 1, 1), inR = ex(inlay, 0.02), inL = ex(inlay, 0.02).scale(-1, 1, 1);
  for (const g of [wingR, wingL]) g.translate(0, 0, -0.035);
  for (const g of [inR, inL]) g.translate(0, 0, 0.045);
  // dashed runic ring: short bars along a pointed oval, bigger than the aperture
  const dashes = [];
  const N = 30, c = 0.429, r = 0.979; // the aperture's lens in its own units: x → world, y → world × 1.375
  for (let i = 0; i < N; i++) {
    if (i % 5 === 2) continue; // gaps, like the reference's broken ring
    const u = i / N * Math.PI * 2, side = Math.cos(u) >= 0 ? 1 : -1;
    // param along the lens: y from the angle, x from the circle
    const y = Math.sin(u) * 0.86, x = side * (Math.sqrt(Math.max(0, r * r - y * y)) - c);
    const y2 = Math.sin(u + 0.08) * 0.86, x2 = side * (Math.sqrt(Math.max(0, r * r - y2 * y2)) - c);
    const g = new THREE.BoxGeometry(0.035, 0.12 + (i % 3) * 0.03, 0.02);
    g.rotateZ(Math.atan2((y2 - y) * 1.72, (x2 - x) * 1.3) - Math.PI / 2); g.translate(x * 1.3, y * 1.72, 0);
    dashes.push(g);
  }
  const G = {
    platform: new THREE.CylinderGeometry(1.2, 1.3, 0.24, 48, 1), top: new THREE.CircleGeometry(1.12, 48), trim: new THREE.TorusGeometry(1.2, 0.03, 8, 64),
    channel: new THREE.RingGeometry(0.96, 1.02, 64),
    stem: new THREE.CylinderGeometry(0.07, 0.13, 0.62, 12), foot: new THREE.CylinderGeometry(0.24, 0.3, 0.1, 6),
    frame: new THREE.BoxGeometry(0.36, 0.36, 0.13), frameInner: new THREE.BoxGeometry(0.26, 0.26, 0.15), gem: new THREE.OctahedronGeometry(0.16, 0),
    wings: mergeGeometries([wingR, wingL]), inlays: mergeGeometries([inR, inL]),
    spike: new THREE.ConeGeometry(0.075, 0.26, 4), tail: new THREE.ConeGeometry(0.05, 0.36, 4), crown: new THREE.OctahedronGeometry(0.07, 0),
    beamCore: new THREE.CylinderGeometry(0.012, 0.04, 2.6, 8, 1, true), beamGlow: new THREE.CylinderGeometry(0.035, 0.09, 2.6, 16, 1, true), beamHaze: new THREE.CylinderGeometry(0.06, 0.16, 2.6, 16, 1, true),
    aperture: new THREE.PlaneGeometry(2, 2.75), runes: mergeGeometries(dashes), crystal: new THREE.OctahedronGeometry(0.09, 0)
  };
  G.spike.rotateX(Math.PI); G.tail.rotateX(Math.PI);
  G.top.rotateX(-Math.PI / 2); G.channel.rotateX(-Math.PI / 2);
  for (const g of [G.beamCore, G.beamGlow, G.beamHaze]) g.translate(0, 1.3, 0);
  M.spark = new THREE.PointsMaterial({ map: sparkTex(), color: '#9cc8ff', size: 0.16, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  return (SHARED = { M, G });
}

function buildGatelock() {
  const { M, G } = shared();
  const root = new THREE.Group();
  const add = (geo, mat, parent, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
  // base: stays on the ground (both states share it)
  const base = new THREE.Group(); root.add(base);
  const plat = add(G.platform, M.stoneSide, base); plat.position.y = 0.04;
  const top = add(G.top, M.stone, base); top.position.y = 0.162;
  const trim = add(G.trim, M.gold, base); trim.rotation.x = Math.PI / 2; trim.position.y = 0.16;
  const channel = add(G.channel, M.rune, base, false); channel.position.y = 0.168;
  const foot = add(G.foot, M.gold, base); foot.position.y = 0.21;
  // floating part: the emblem and whichever light the state shows, bobbing together
  const float = new THREE.Group(); root.add(float);
  const stem = add(G.stem, M.dark, float); stem.position.y = 0.52;
  const emblem = new THREE.Group(); emblem.position.y = 0.98; float.add(emblem);
  const frame = add(G.frame, M.gold, emblem); frame.rotation.z = Math.PI / 4;
  const inner = add(G.frameInner, M.dark, emblem); inner.rotation.z = Math.PI / 4; inner.scale.z = 0.9;
  const gem = add(G.gem, M.gem, emblem); gem.scale.set(1, 1, 0.55); gem.position.z = 0.0;
  add(G.wings, M.gold, emblem); add(G.inlays, M.inlay, emblem, false);
  const spike = add(G.spike, M.purple, emblem); spike.position.y = -0.33;
  const tail = add(G.tail, M.gold, emblem); tail.position.y = -0.38; tail.scale.setScalar(0.8);
  const crown = add(G.crown, M.gold, emblem); crown.position.y = 0.3; crown.scale.set(0.8, 1.4, 0.8);
  // closed: the narrow beam (core, glow, haze), from the crown up to ~3.6 m
  const beam = new THREE.Group(); beam.position.y = 1.1; float.add(beam);
  const beamCoreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#e6f4ff').multiplyScalar(3.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const beamGlowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#3f86ff').multiplyScalar(2), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const beamHazeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#2a5cff').multiplyScalar(1.2), transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const core = add(G.beamCore, beamCoreMat, beam, false), glow = add(G.beamGlow, beamGlowMat, beam, false), haze = add(G.beamHaze, beamHazeMat, beam, false);
  for (const m of [core, glow, haze]) { m.receiveShadow = false; m.renderOrder = 3; }
  // open: the aperture, the runic ring and four crystals around it
  const portal = new THREE.Group(); portal.position.y = 2.35; float.add(portal);
  const ring = new THREE.Group(); ring.scale.setScalar(0.92); portal.add(ring); // (state scaling goes on `portal`)
  const apMat = new THREE.ShaderMaterial({ vertexShader: apertureVert, fragmentShader: apertureFrag, uniforms: { uT: { value: 0 }, uA: { value: 1 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const aperture = add(G.aperture, apMat, ring, false); aperture.renderOrder = 4;
  const runeMat = M.rune.clone();
  const runes = add(G.runes, runeMat, ring, false); runes.renderOrder = 4;
  const crystals = [];
  for (const [x, y, s] of [[0, 1.62, 1.1], [-0.98, 0.05, 0.9], [0.98, 0.05, 0.9]]) { const c = add(G.crystal, M.gem, ring, false); c.position.set(x, y, 0); c.scale.set(s, s * 1.6, s * 0.6); crystals.push(c); }
  // sparkles: drifting up the beam when closed, swirling round the aperture when open
  const N = 56, pos = new Float32Array(N * 3), seed = Array.from({ length: N }, () => [Math.random(), Math.random(), Math.random()]);
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sparks = new THREE.Points(sgeo, M.spark); sparks.frustumCulled = false; sparks.renderOrder = 5; float.add(sparks);
  return { root, base, float, emblem, gem, beam, core, glow, haze, beamCoreMat, beamGlowMat, beamHazeMat, portal, aperture, apMat, runes, runeMat, crystals, sparks, sgeo, seed };
}

export function createGatelocks(scene, world, W, fx, { toast, sfx, onEvent } = {}) { // onEvent('found' | 'open', gatelock)
  const G = GATELOCK, list = [], home = W.playerStart, hub = W.hub || W.plaza || home;
  let hidden = false;
  const probe = new THREE.Vector3();
  const chips = () => inventory.items?.[G.item] || 0;

  // A free spot in Malezor for a closed gatelock: on land, fairly flat, nothing standing there,
  // out of the town centre, away from the other gatelock and (when moving) from Rizer.
  function spotOk(x, z, others, rizer) {
    if ((world.containsLand && !world.containsLand(x, z)) || world.waterAt(x, z) > world.heightAt(x, z) - 0.15) return false;
    if (quarterAt(x, z, W) === 'core' || Math.hypot(x - home.x, z - home.z) < G.homeMin || Math.hypot(x - hub.x, z - hub.z) > G.hubMax) return false;
    const h0 = world.heightAt(x, z); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; if (Math.abs(world.heightAt(x + Math.sin(a) * 1.5, z + Math.cos(a) * 1.5) - h0) > 0.5) return false; }
    probe.set(x, world.groundAt(x, z, h0 + 1), z); if (world.resolve(probe, 1.8)) return false;
    if (Math.abs(probe.y - h0) > 0.3) return false; // not on a roof or a bridge
    if (others.some(o => o.root && Math.hypot(o.root.position.x - x, o.root.position.z - z) < G.spacing)) return false;
    if (rizer && Math.hypot(rizer.position.x - x, rizer.position.z - z) < G.awayFromRizer) return false;
    return true;
  }
  function findSpot(rand, others, rizer) {
    for (let t = 0; t < 1500; t++) {
      const a = rand() * Math.PI * 2, d = 30 + rand() * (G.hubMax - 30), x = hub.x + Math.sin(a) * d, z = hub.z + Math.cos(a) * d;
      if (spotOk(x, z, others, rizer)) return { x, z };
    }
    return null;
  }
  function place(g, x, z) {
    g.root.position.set(x, world.heightAt(x, z) - 0.06, z);
    g.light.position.set(x, g.root.position.y + 2.3, z);
  }

  const r = rng((W.seed || 7) + 9090);
  for (let i = 0; i < G.count; i++) {
    const b = buildGatelock(), g = { id: `portal-gatelock-${i + 1}`, ...b, state: 'closed', t: 0, nextMove: 0, near: false, lastToast: -1e9, phase: i * 1.7 };
    // one light each, created now and always in the scene (a light count that changes recompiles every material)
    g.light = new THREE.PointLight('#5a7dff', 0, 11, 1.6); scene.add(g.light);
    const s = findSpot(r, list, null) || { x: hub.x + (i ? -60 : 60), z: hub.z + 40 };
    scene.add(g.root); place(g, s.x, s.z); g.root.rotation.y = r() * Math.PI * 2;
    g.nextMove = performance.now() + G.relocateMs;
    list.push(g); setState(g, 'closed');
  }
  console.log('[rp7d] portal gatelocks:', list.map(g => `${g.root.position.x.toFixed(0)},${g.root.position.z.toFixed(0)}`).join(' · '));

  function setState(g, s) {
    g.state = s; g.t = 0;
    g.beam.visible = s !== 'open'; g.portal.visible = s !== 'closed';
    if (s === 'closed') { g.beam.scale.set(1, 1, 1); g.portal.scale.setScalar(1); }
    if (s === 'activating') { g.portal.scale.set(0.02, 0.1, 1); g.apMat.uniforms.uA.value = 0; g.runeMat.opacity = 0; }
    if (s === 'open') { g.portal.scale.setScalar(1); g.apMat.uniforms.uA.value = 1; g.runeMat.opacity = 0.85; }
  }
  // Move a closed gatelock somewhere new (never an open or activating one).
  function relocate(g, rizer) {
    if (g.state !== 'closed') return false;
    const s = findSpot(Math.random, list.filter(o => o !== g), rizer); if (!s) return false;
    const p = g.root.position;
    fx?.emit(p.x, p.y + 1.6, p.z, 26, { color: '#7fb4ff', speed: 2.6, up: 2, size: 0.3, life: 0.6, g: -1 });
    place(g, s.x, s.z); g.root.rotation.y = Math.random() * Math.PI * 2; g.near = false;
    fx?.emit(s.x, g.root.position.y + 1.6, s.z, 26, { color: '#7fb4ff', speed: 2.6, up: 2, size: 0.3, life: 0.6, g: -1 });
    return true;
  }
  // Exactly 10, once: only a closed gatelock takes chips, and it stops being closed in the same step.
  function tryActivate(g) {
    if (g.state !== 'closed') return false;
    const have = chips();
    if (have < G.need) return false;
    inventory.items[G.item] = have - G.need; saveInv();
    setState(g, 'activating');
    const p = g.root.position; fx?.emit(p.x, p.y + 1.4, p.z, 30, { color: '#8fc4ff', speed: 3, up: 2.2, size: 0.32, life: 0.7, g: -1 });
    sfx?.play?.('blast', 0.7, 0.7);
    toast?.(`PORTAL GATELOCK · ${G.need} PORTALCHIPS USED · ACTIVATING`);
    return true;
  }

  function update(dt, t, rizer) {
    const now = performance.now();
    for (const g of list) {
      // every 5 real minutes a closed gatelock moves
      if (g.state !== 'closed') g.nextMove = Infinity;
      else if (now >= g.nextMove) { relocate(g, rizer); g.nextMove = now + G.relocateMs; }
      const p = g.root.position, rp = rizer.position, d = Math.hypot(rp.x - p.x, rp.z - p.z), dy = rp.y - p.y;
      // solid while it isn't open: Rizer stops at the platform's edge
      if (g.state !== 'open' && !hidden && d < G.solid + 0.4 && dy > -1 && dy < 4) {
        const m = G.solid + 0.4, nx = d > 1e-4 ? (rp.x - p.x) / d : 1, nz = d > 1e-4 ? (rp.z - p.z) / d : 0;
        rp.x = p.x + nx * m; rp.z = p.z + nz * m;
      }
      // through the aperture, off the ground: out of another open gatelock, chosen at random
      if (g.state === 'open' && !hidden && d < 6) {
        const th = g.root.rotation.y, sn = Math.sin(th), cs = Math.cos(th), lx = (rp.x - p.x) * cs - (rp.z - p.z) * sn, lz = (rp.x - p.x) * sn + (rp.z - p.z) * cs, T = G.through;
        const crossed = g.lastLz != null && lz * g.lastLz < 0 && Math.abs(lz) + Math.abs(g.lastLz) < 3 && Math.abs(lx) < T.half && dy > T.lo && dy < T.hi;
        if (crossed && !rizer.onGround && rizer.hp > 0 && now > (g.tpCool || 0)) {
          const others = list.filter(o => o !== g && o.state === 'open');
          if (!others.length) { if ((now - g.lastToast) / 1000 > G.toastEvery) { g.lastToast = now; toast?.('PORTAL GATELOCK · no other gate is open · it leads nowhere yet'); } }
          else {
            const to = others[Math.floor(Math.random() * others.length)], q = to.root.position, t2 = to.root.rotation.y, s2 = Math.sin(t2), c2 = Math.cos(t2), side = Math.sign(lz) || 1, dT = t2 - th, from = { x: rp.x, y: rp.y, z: rp.z };
            rp.set(q.x + c2 * lx + s2 * side * T.out, q.y + dy, q.z - s2 * lx + c2 * side * T.out); // the same place in the far aperture, a step out the side he was heading for
            const vx = rizer.vel.x, vz = rizer.vel.z, cd = Math.cos(dT), sd = Math.sin(dT); rizer.vel.x = vx * cd + vz * sd; rizer.vel.z = -vx * sd + vz * cd; rizer.facing += dT; // still moving the way he was, turned to the far gate
            g.tpCool = to.tpCool = now + T.cool; to.lastLz = side * T.out; g.lastLz = null;
            fx?.emit(from.x, from.y + 1, from.z, 26, { color: '#b07bff', speed: 3.4, up: 1, size: 0.3, life: 0.5, g: 0 });
            fx?.emit(rp.x, rp.y + 1, rp.z, 30, { color: '#7fe0ff', speed: 3.6, up: 1.2, size: 0.32, life: 0.55, g: 0 });
            sfx?.play?.('blast', 0.6, 1.5); onEvent?.('teleport', to, g);
            continue;
          }
        }
        g.lastLz = lz;
      } else g.lastLz = null;
      // proximity: activate with enough chips, or say how many it needs (not every frame)
      const inReach = !hidden && rizer.hp > 0 && d < G.reach && dy > -1.5 && dy < 3.5;
      if (inReach && !g.near) onEvent?.('found', g);
      if (inReach && g.state === 'closed') {
        if (!tryActivate(g) && (!g.near || (now - g.lastToast) / 1000 > G.toastEvery)) { g.lastToast = now; toast?.(`PORTAL GATELOCK · PORTALCHIPS ${chips()}/${G.need}`); }
      }
      g.near = inReach || (g.near && d < G.reach + 1);
      // ACTIVATING → OPEN: the beam swells, the aperture tears open along it, the ring lights up
      if (g.state === 'activating') {
        g.t += dt; const k = Math.min(1, g.t / G.activate);
        const swell = Math.min(1, g.t / 0.6);
        g.beam.scale.set(1 + swell * 2.5, 1, 1 + swell * 2.5); g.beamGlowMat.opacity = 0.55 * (1 - Math.max(0, (k - 0.35) / 0.65));
        g.beamCoreMat.opacity = 1 - Math.max(0, (k - 0.4) / 0.6); g.beamHazeMat.opacity = 0.18 * (1 - k);
        const open = Math.max(0, (k - 0.25) / 0.75), eo = open * open * (3 - 2 * open);
        g.portal.scale.set(0.02 + 0.98 * eo, 0.1 + 0.9 * Math.min(1, open * 1.6), 1);
        g.apMat.uniforms.uA.value = Math.min(1, open * 1.5); g.runeMat.opacity = 0.85 * Math.max(0, (k - 0.7) / 0.3);
        if (g.t - dt < 0.6 && g.t >= 0.6) fx?.emit(p.x, p.y + 2.35, p.z, 40, { color: '#b07bff', speed: 4, up: 1.5, size: 0.35, life: 0.6, g: 0 });
        if (k >= 1) {
          setState(g, 'open'); g.beam.scale.set(1, 1, 1); g.beamCoreMat.opacity = 1; g.beamGlowMat.opacity = 0.55; g.beamHazeMat.opacity = 0.18;
          fx?.emit(p.x, p.y + 2.4, p.z, 30, { color: '#7fe0ff', speed: 3, up: 1, size: 0.3, life: 0.6, g: 0 });
          toast?.('PORTAL GATELOCK OPEN'); onEvent?.('open', g);
        }
      }
      // idle life: bobbing (both states), beam flicker, aperture swirl, rune pulse, sparkles, light
      const visible = !hidden && d < 160;
      g.root.visible = visible;
      g.light.intensity = hidden ? 0 : g.state === 'open' ? 7 + Math.sin(t * 2.3 + g.phase) * 1.2 : g.state === 'activating' ? 2 + 6 * Math.min(1, g.t / G.activate) : 1.6 + Math.sin(t * 7 + g.phase) * 0.3;
      g.light.color.set(g.state === 'closed' ? '#4f86ff' : '#7a62ff');
      if (!visible) continue;
      g.float.position.y = Math.sin(t * 1.6 + g.phase) * 0.06;
      g.gem.rotation.y = t * 0.8;
      if (g.state === 'closed') {
        const f = 0.85 + Math.sin(t * 23 + g.phase) * 0.08 + Math.random() * 0.07;
        g.core.scale.set(f, 1, f); g.glow.scale.set(0.9 + Math.sin(t * 3.1) * 0.1, 1, 0.9 + Math.sin(t * 3.1) * 0.1); g.beamGlowMat.opacity = 0.45 + Math.sin(t * 5 + g.phase) * 0.1;
      }
      if (g.state !== 'closed') {
        g.apMat.uniforms.uT.value = t;
        if (g.state === 'open') g.runeMat.opacity = 0.6 + Math.sin(t * 2.4 + g.phase) * 0.25;
        g.runes.rotation.z = Math.sin(t * 0.5) * 0.02;
        g.crystals.forEach((c, i) => { c.rotation.y = t * 1.2 + i; c.position.z = Math.sin(t * 1.8 + i) * 0.04; });
      }
      const P = g.sgeo.attributes.position.array, open = g.state !== 'closed';
      for (let i = 0; i < g.seed.length; i++) {
        const [a, b, c] = g.seed[i], k = (t * (0.18 + a * 0.2) + b) % 1;
        if (open) { const ang = c * Math.PI * 2 + t * (0.3 + a * 0.4), rx = 0.75 + a * 0.6; P[i * 3] = Math.sin(ang) * rx * 0.85; P[i * 3 + 1] = 2.35 + Math.cos(ang) * rx * 1.45 + (k - 0.5) * 0.3; P[i * 3 + 2] = (b - 0.5) * 0.5; }
        else { const ang = c * Math.PI * 2 + t; P[i * 3] = Math.sin(ang) * (0.12 + a * 0.25); P[i * 3 + 1] = 1.2 + k * 2.6; P[i * 3 + 2] = Math.cos(ang) * (0.12 + a * 0.25); }
      }
      g.sgeo.attributes.position.needsUpdate = true;
    }
  }

  function setVisible(v) { hidden = !v; for (const g of list) { g.root.visible = v; if (!v) g.light.intensity = 0; } }
  const label = g => g.state === 'open' ? 'PORTAL GATELOCK · OPEN' : `PORTAL GATELOCK · ${STATE_NAME[g.state]} · PORTALCHIPS ${chips()}/${G.need}`;

  const openAll = () => { for (const g of list) if (g.state === 'closed') setState(g, 'open'); }; // dev: open them without chips
  return { list, update, setVisible, label, relocate, tryActivate, openAll, get chips() { return chips(); } };
}
