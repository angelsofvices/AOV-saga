// Penumbra: sentient tech, the heavy tier above the Scanobots. A slow, deliberate walker (~2.7 m beside Rizer)
// with two shoulder rocket pods. It patrols a loop like a machine; when it sees Rizer it turns to him, its orange
// lights come up (the warning), and it fights at range: it repositions, and it fires single rockets from
// alternating pods. Every rocket is telegraphed — the pod's chambers brighten and it tilts onto its aim — and is
// a physical projectile: it leads Rizer a little, corrects only lightly and only early (a well-timed dodge
// beats it), and explodes on whatever it meets. The blast hurts by distance, knocks him back, and is stopped
// by substantial cover. Destroyed, it always drops 3 Portalchips, as one large purple ×3 chip (scanobots.js).
// Arm cannons, salvos and weak points are later patches; the hit regions (body / legs / pods) already exist.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp, damp, dampAngle, rng } from './util.js';
import { touch, STRIKERS, HITBOX } from './hitbox.js';
import { COMBAT, BLADES } from './rizer.js';
import { quarterAt, districtAt } from './world-data.js';

// Collision footprint in the mech's local frame (metres): widest at the forearm cannons, deepest from back vent to front plate.
export const BODY = { hw: 1.62, zmin: -0.8, zmax: 0.92, top: 3.35 };

export const PENUMBRA = {
  name: 'Penumbra', key: 'penumbra', hp: 36, chips: 3,
  count: 5, spacing: 70, homeMin: 80, homeMax: 250, loop: [8, 14],
  walk: 1.15, combat: 1.9, turn: 1.5, radius: 1.15,      // patrol / combat speed · turn rate (rad/s) · body radius
  sight: 26, sense: 5, cone: 1.15, alert: 1.1,           // alert: the warning before it may fire (s)
  ranges: { close: 7, mid: 16, max: 38 },
  // what it does next, by range (weights; tuning values). Arm cannons are not wired yet.
  choices: {
    long: { rocket: 70, advance: 30 },
    mid: { rocket: 55, reposition: 45 },
    close: { backstep: 80, rocket: 20 }
  },
  move: [1.3, 2.2],                                      // seconds spent on one advance / reposition / backstep
  rocket: { windup: 1.15, recover: 0.85, cooldown: 3.4,  // telegraph · recovery · each pod's own recharge
    speed: 15, life: 4.5, gravity: 1.4, lead: 0.55,      // lead: how much of Rizer's motion it aims ahead of (0–1)
    track: 0.75, trackFor: 0.9,                          // light homing: rad/s, only for the first seconds of flight
    direct: 16, blast: 11, radius: 3.8, r: 0.18 },       // direct hit · blast at the centre (falls off to 0 at radius)
  stagger: { every: 6, time: 0.7 },                      // damage taken before it buckles
  wreck: 40, respawn: 180, respawnDist: 60, visible: 130
};
const rand = ([a, b]) => a + Math.random() * (b - a);
const pick = table => { let r = Math.random() * Object.values(table).reduce((s, w) => s + w, 0); for (const [k, w] of Object.entries(table)) if ((r -= w) < 0) return k; return Object.keys(table)[0]; };

// ── model (facing +Z, origin on the ground between its feet) ──
const C = { armor: '#77839a', armor2: '#515b6e', dark: '#24262c', mech: '#3b3e47', orange: '#dd7a26' };
function geoSet() {
  const out = [], m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const add = (geo, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.deleteAttribute('uv');
    g.applyMatrix4(m.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), new THREE.Vector3(1, 1, 1)));
    const c = new THREE.Color(color), n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3)); out.push(g);
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (r, l, n = 10) => new THREE.CylinderGeometry(r, r, l, n);
  return { add, box, cyl, done: () => mergeGeometries(out) };
}
let SHARED = null;
function shared() {
  if (SHARED) return SHARED;
  const H = Math.PI / 2;
  // upper body: pelvis, torso, cockpit, shoulders, arms with cannons, back
  let S = geoSet();
  S.add(S.box(1.0, 0.34, 0.8), C.mech, 0, 1.52, 0); S.add(S.cyl(0.3, 0.3, 12), C.dark, 0, 1.76, 0);
  S.add(S.box(1.7, 1.0, 1.25), C.armor, 0, 2.3, 0);
  S.add(S.box(1.36, 0.3, 1.1), C.armor2, 0, 1.92, 0.05);                      // lower chest band
  S.add(S.box(1.05, 0.46, 0.95), C.armor, 0, 2.95, 0.08); S.add(S.box(0.78, 0.1, 0.8), C.armor2, 0, 3.22, 0.05); // cockpit
  for (const s of [-1, 1]) {
    S.add(S.box(0.5, 0.75, 1.0), C.armor2, s * 0.98, 2.42, 0, 0, 0, s * -0.22);   // side armor
    S.add(S.box(0.5, 0.42, 0.62), C.armor, s * 1.22, 2.5, 0);                      // shoulder
    S.add(S.cyl(0.2, 0.3, 10), C.dark, s * 1.3, 2.22, 0, 0, 0, H);
    S.add(S.box(0.34, 0.66, 0.42), C.armor2, s * 1.34, 1.92, 0.06, 0.2);            // upper arm
    S.add(S.box(0.52, 0.46, 0.95), C.armor, s * 1.36, 1.5, 0.42);                  // forearm cannon block
    S.add(S.box(0.54, 0.1, 0.4), C.orange, s * 1.36, 1.5, 0.3);
    for (const [bx, by] of [[-0.13, 0.09], [0.13, 0.09], [0, -0.11]]) S.add(S.cyl(0.075, 0.5, 8), C.dark, s * 1.36 + bx, 1.5 + by, 1.08, H);
    S.add(S.box(0.3, 0.3, 0.5), C.mech, s * 0.78, 2.92, -0.05);                    // pod mount
  }
  S.add(S.box(0.9, 0.7, 0.14), C.dark, 0, 2.3, -0.66); S.add(S.box(0.5, 0.3, 0.2), C.mech, 0, 1.75, -0.5); // back vent housing
  S.add(new THREE.TorusGeometry(0.09, 0.025, 6, 14), C.dark, 0.02, 2.5, 0.635);    // chest emblem
  const upper = S.done();
  // lights: visor, chest bar, chest lamps, back vent bars (one emissive material per Penumbra)
  S = geoSet();
  S.add(S.box(0.72, 0.24, 0.06), '#ffffff', 0, 2.97, 0.56); S.add(S.box(0.5, 0.12, 0.05), '#ffffff', 0, 2.0, 0.63);
  for (const x of [-0.62, -0.42, 0.42, 0.62]) S.add(S.cyl(0.085, 0.05, 10), '#ffffff', x, 2.02, 0.63, H);
  for (const y of [2.18, 2.3, 2.42]) S.add(S.box(0.5, 0.06, 0.04), '#ffffff', 0, y, -0.74);
  const lights = S.done();
  // one leg (pivot at the hip): hip drum, thigh, knee drum, shin, foot and toes
  S = geoSet();
  S.add(S.cyl(0.3, 0.36, 12), C.mech, 0, 0, 0, 0, 0, H); S.add(S.box(0.36, 0.72, 0.44), C.armor, 0, -0.34, 0.14, -0.38);
  S.add(S.cyl(0.25, 0.4, 12), C.dark, 0, -0.68, 0.27, 0, 0, H); S.add(S.box(0.3, 0.7, 0.36), C.armor2, 0, -0.98, 0.13, 0.4);
  S.add(S.box(0.5, 0.2, 0.8), C.mech, 0, -1.3, 0.1); S.add(S.box(0.4, 0.16, 0.3), C.armor, 0, -1.2, -0.18);
  for (const x of [-0.17, 0, 0.17]) S.add(S.box(0.13, 0.14, 0.26), C.armor, x, -1.33, 0.58);
  const leg = S.done();
  // one rocket pod (pivot at its mount, tubes facing +Z)
  S = geoSet();
  S.add(S.cyl(0.36, 0.95, 12), C.armor, 0, 0.08, 0.05, H); S.add(S.cyl(0.385, 0.14, 12), C.orange, 0, 0.08, 0.4, H); S.add(S.cyl(0.385, 0.1, 12), C.orange, 0, 0.08, -0.2, H);
  S.add(S.cyl(0.3, 0.06, 12), C.dark, 0, 0.08, 0.53, H); S.add(S.box(0.2, 0.12, 0.6), C.armor2, 0, 0.44, -0.05);
  const pod = S.done();
  S = geoSet();
  for (const [x, y] of [[0, 0], [-0.15, 0.13], [0.15, 0.13], [-0.15, -0.13], [0.15, -0.13]]) S.add(S.cyl(0.085, 0.05, 10), '#ffffff', x, 0.08 + y, 0.55, H);
  const tubes = S.done();
  // rocket: body + nose + band + fins (points +Z)
  S = geoSet();
  S.add(S.cyl(0.11, 0.6, 8), '#6d7684', 0, 0, 0, H); S.add(new THREE.ConeGeometry(0.11, 0.26, 8), '#3c4350', 0, 0, 0.43, H);
  S.add(S.cyl(0.118, 0.1, 8), C.orange, 0, 0, 0.18, H); S.add(S.cyl(0.118, 0.07, 8), C.orange, 0, 0, -0.2, H);
  for (let i = 0; i < 4; i++) S.add(S.box(0.02, 0.2, 0.18), '#3c4350', Math.cos(i * H) * 0.13, Math.sin(i * H) * 0.13, -0.24, 0, 0, i * H + H);
  const rocket = S.done();
  const flame = new THREE.ConeGeometry(0.1, 0.7, 8, 1, true).rotateX(-H).translate(0, 0, -0.62);
  const c = document.createElement('canvas'); c.width = c.height = 64; const g2 = c.getContext('2d'), rg = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.3, 'rgba(255,190,90,.8)'); rg.addColorStop(1, 'rgba(255,110,20,0)'); g2.fillStyle = rg; g2.fillRect(0, 0, 64, 64);
  const M = {
    body: new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.35, roughness: 0.55, flatShading: true }),
    glow: new THREE.MeshStandardMaterial({ color: '#2a1608', emissive: '#ff8a1e', emissiveIntensity: 0.25, roughness: 0.4 }),
    flame: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb24a').multiplyScalar(2.4), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
    spark: new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    scorch: new THREE.MeshBasicMaterial({ color: '#0b0a09', transparent: true, opacity: 0.6, depthWrite: false })
  };
  return (SHARED = { G: { upper, lights, leg, pod, tubes, rocket, flame, scorch: new THREE.CircleGeometry(1, 20).rotateX(-H) }, M });
}
function buildPenumbra() {
  const { G, M } = shared();
  const root = new THREE.Group(), upper = new THREE.Group(); root.add(upper);
  const mesh = (geo, mat, parent) => { const o = new THREE.Mesh(geo, mat); o.castShadow = true; parent.add(o); return o; };
  mesh(G.upper, M.body, upper);
  const lightMat = M.glow.clone(); mesh(G.lights, lightMat, upper).castShadow = false;
  const pods = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.78, 3.12, -0.05); upper.add(g); mesh(G.pod, M.body, g); const mat = M.glow.clone(); mesh(G.tubes, mat, g).castShadow = false; return { g, mat, s, cool: 0 }; });
  const legs = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.5, 1.45, -0.05); root.add(g); mesh(G.leg, M.body, g); return g; });
  return { root, upper, lightMat, pods, legs };
}
function barSprite() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 12;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(1.5, 0.14, 1); s.renderOrder = 20;
  s.redraw = f => { const g = c.getContext('2d'); g.clearRect(0, 0, 128, 12); g.fillStyle = 'rgba(12,10,20,.8)'; g.fillRect(0, 0, 128, 12); g.fillStyle = '#ff9a3a'; g.fillRect(2, 2, 124 * clamp(f, 0, 1), 8); tex.needsUpdate = true; };
  return s;
}

// opts: { dropChip(x, z, y, value) · onEvent(type, data) for sound / camera / toasts }
export function createPenumbras(scene, world, W, fx, opts = {}) {
  const P = PENUMBRA, R = P.rocket, list = [], rockets = [], scorches = [], live = [];
  const home = W.playerStart, B = (world.bound || 300) - 14;
  let hidden = false, clock = 0, ghost = null;
  const tA = new THREE.Vector3(), tB = new THREE.Vector3(), tC = new THREE.Vector3(), probe = new THREE.Vector3(), _hit = {}, UP = new THREE.Vector3(0, 1, 0);

  // ── placement: seeded loops out in the wild, on fairly level ground ──
  const onLand = (x, z) => (!world.containsLand || world.containsLand(x, z)) && world.waterAt(x, z) < world.heightAt(x, z) - 0.1;
  const open = (x, z) => {
    if (Math.abs(x) > B || Math.abs(z) > B || !onLand(x, z) || quarterAt(x, z, W) === 'core') return false;
    const dh = Math.hypot(x - home.x, z - home.z); if (dh < P.homeMin || dh > P.homeMax) return false;
    if (Math.abs(world.heightAt(x + 1.5, z) - world.heightAt(x - 1.5, z)) + Math.abs(world.heightAt(x, z + 1.5) - world.heightAt(x, z - 1.5)) > 1.2) return false;
    probe.set(x, world.heightAt(x, z), z); return !world.resolve(probe, 1.8);
  };
  const pathOpen = (a, b) => { const L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(L / 2); for (let i = 1; i < n; i++) if (!open(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n)) return false; return true; };
  const r = rng((W.seed || 7) + 8181);
  for (let t = 0; t < 12000 && list.length < P.count; t++) {
    const a = r() * Math.PI * 2, d = P.homeMin + 8 + r() * (P.homeMax - P.homeMin - 8), x = home.x + Math.sin(a) * d, z = home.z + Math.cos(a) * d;
    if (!open(x, z) || list.some(p => Math.hypot(p.home.x - x, p.home.y - z) < P.spacing)) continue;
    const a0 = r() * Math.PI * 2, pts = [];
    for (let k = 0; k < 4; k++) {
      const aa = a0 + k * Math.PI / 2 + (r() - 0.5) * 0.5, rr = P.loop[0] + r() * (P.loop[1] - P.loop[0]), v = new THREE.Vector2(x + Math.sin(aa) * rr, z + Math.cos(aa) * rr);
      if (open(v.x, v.y) && (!pts.length || pathOpen(pts[pts.length - 1], v))) pts.push(v);
    }
    if (pts.length < 3 || !pathOpen(pts[pts.length - 1], pts[0])) continue;
    list.push(make(list.length + 1, new THREE.Vector2(x, z), pts));
  }
  console.log(`[rp7d] penumbras: ${list.length}`);

  function make(n, homePt, pts) {
    const m = buildPenumbra(); scene.add(m.root);
    const bar = barSprite(); bar.visible = false; scene.add(bar);
    const p = {
      id: `penumbra-${n}`, isScanobot: true, isPenumbra: true, T: P, name: P.name, home: homePt, pts, wp: 1, ...m, bar, // isScanobot: the shared "tech body" interface (alive · aimY · hit) the lock-on, bolts and arrows use
      pos: new THREE.Vector3(), center: new THREE.Vector3(), knock: new THREE.Vector3(), heading: 0, speed: 0, walkT: 0, r: 0.95,
      state: 'patrol', t: 0, hp: P.hp, seen: false, seenT: 0, lit: 0, hurt: 0, flash: 0, barT: 0, sink: 0, dropped: false, respawnAt: 0, nextPod: 0, move: null, side: n % 2 ? 1 : -1,
      get alive() { return alive(p); }, get aimY() { return 2.1; },
      hit: (damage, dx, dz, kind, power) => hit(p, damage, dx, dz, kind, power)
    };
    const part = (rr, name) => ({ part: name, a: new THREE.Vector3(), b: new THREE.Vector3(), r: rr });
    p.rig = { parts: { Body: part(0.85, 'Body'), LegL: part(0.32, 'LegL'), LegR: part(0.32, 'LegR'), PodL: part(0.4, 'PodL'), PodR: part(0.4, 'PodR') } }; // hurt regions (hitbox.js touch): all take normal damage for now
    reset(p); return p;
  }
  function reset(p) {
    const s = p.pts[0]; p.pos.set(s.x, world.groundAt(s.x, s.y), s.y); p.wp = 1 % p.pts.length; p.heading = Math.atan2(p.pts[p.wp].x - s.x, p.pts[p.wp].y - s.y);
    p.rxpPaid = false; p.state = 'patrol'; p.t = 0; p.hp = P.hp; p.seen = false; p.lit = 0; p.hurt = 0; p.flash = 0; p.barT = 0; p.sink = 0; p.dropped = false; p.speed = 0; p.knock.set(0, 0, 0); p.move = null;
    for (const pod of p.pods) { pod.cool = 0; pod.g.rotation.x = 0; }
    p.upper.position.set(0, 0, 0); p.upper.rotation.set(0, 0, 0); p.root.visible = !hidden; p.bar.redraw(1); place(p);
  }
  const alive = p => p.state !== 'down' && p.state !== 'gone';
  const hostile = p => alive(p) && p.state !== 'patrol' && p.state !== 'idle' && p.state !== 'return';
  function place(p) {
    p.center.set(p.pos.x, p.pos.y + 2.1 - p.sink, p.pos.z);
    p.root.position.copy(p.pos); p.root.rotation.y = p.heading; p.bar.position.set(p.pos.x, p.pos.y + 4.0, p.pos.z);
    const sx = Math.cos(p.heading), sz = -Math.sin(p.heading), G = p.rig.parts, y = p.pos.y - p.sink; // sx, sz: its right-hand side
    G.Body.a.set(p.pos.x, y + 1.9, p.pos.z); G.Body.b.set(p.pos.x, y + 2.75, p.pos.z);
    for (const [k, s] of [['L', -1], ['R', 1]]) {
      G['Leg' + k].a.set(p.pos.x + sx * 0.5 * s, p.pos.y + 0.3, p.pos.z + sz * 0.5 * s); G['Leg' + k].b.set(p.pos.x + sx * 0.5 * s, p.pos.y + 1.35, p.pos.z + sz * 0.5 * s);
      G['Pod' + k].a.set(p.pos.x + sx * 0.78 * s, y + 3.2, p.pos.z + sz * 0.78 * s); G['Pod' + k].b.copy(G['Pod' + k].a);
    }
  }
  function canSee(p, rizer) {
    if (rizer.hp <= 0) return false;
    const rp = rizer.position, dx = rp.x - p.pos.x, dz = rp.z - p.pos.z, d = Math.hypot(dx, dz);
    if (rizer.hidden) return d < 1.6;
    const low = rizer.crouched ? (rizer.stealth?.sight ?? 0.6) : 1;
    if (d < P.sense * (rizer.crouched ? (rizer.stealth?.sense ?? 0.5) : 1)) return true;
    if (d > P.sight * low) return false;
    const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - p.heading), Math.cos(Math.atan2(dx, dz) - p.heading)));
    if (off > P.cone && !hostile(p)) return false;
    tA.set(p.pos.x, p.pos.y + 2.9, p.pos.z); tB.set(rp.x, rp.y + 1.4, rp.z);
    return world.rayClear(tA, tB, 0.1) >= tA.distanceTo(tB) - 1;
  }
  const alertNow = (p, t = P.alert) => { p.state = 'alert'; p.t = t; p.move = null; opts.onEvent?.('alert', p); };

  // Damage from direction (dx, dz). Heavier machine: it sparks, and buckles only after enough has landed.
  function hit(p, damage, dx, dz, kind = 'punch', power = 1) {
    if (!alive(p)) return null;
    p.hp -= damage; p.hurt += damage; p.flash = 0.12; p.barT = 5; p.bar.redraw(Math.max(0, p.hp) / P.hp);
    p.knock.set(dx, 0, dz).multiplyScalar(Math.min(1.6, 0.5 * power));
    const at = { x: p.center.x, y: p.center.y, z: p.center.z, name: P.name, scanobot: true, down: false, chips: P.chips };
    fx?.emit(at.x, at.y, at.z, 6, { color: '#ffc27a', speed: 3.2, up: 1, size: 0.14, life: 0.3, g: 6 });
    if (p.hp <= 0) { destroy(p, kind); at.down = true; return at; }
    if (!hostile(p)) alertNow(p, 0.5);
    if (p.hurt >= P.stagger.every) { p.hurt = 0; p.state = 'stagger'; p.t = P.stagger.time; p.move = null; fx?.emit(at.x, at.y, at.z, 16, { color: '#ffd9a0', speed: 4.5, up: 1.6, size: 0.2, life: 0.4, g: 6 }); }
    return at;
  }
  function stun(p, from) { // parried (a rocket turned aside at point-blank)
    if (!alive(p)) return null;
    p.state = 'stagger'; p.t = 1.4; p.move = null; p.flash = 0.12; p.barT = 5;
    return { x: p.center.x, y: p.center.y, z: p.center.z, name: P.name };
  }
  // Destroyed: AI and weapons off, it shuts down and collapses, and its reward is certain — 3 Portalchips, every time.
  function destroy(p, kind = 'punch') {
    p.state = 'down'; p.t = 0; p.move = null; p.speed = 0; p.knock.set(0, 0, 0); p.bar.visible = false;
    fx?.emit(p.center.x, p.center.y, p.center.z, 34, { color: '#ffb060', speed: 5, up: 2, size: 0.4, life: 0.6, g: 4 });
    fx?.emit(p.center.x, p.center.y, p.center.z, 18, { color: '#8a8f99', speed: 2, up: 2.4, size: 0.7, life: 1.2, g: -1 });
    opts.onEvent?.('destroyed', p, kind);
    if (!p.dropped) { p.dropped = true; const f = p.heading; opts.dropChip?.(p.pos.x + Math.sin(f) * 3.6, p.pos.z + Math.cos(f) * 3.6, p.pos.y, P.chips) /* clear of the wreck, which falls forward */; }
  }

  // ── rockets ──
  function fire(p, pod, rizer) {
    const { G, M } = shared();
    let k = rockets.find(q => !q.live);
    if (!k) { k = { mesh: new THREE.Mesh(G.rocket, M.body), pos: new THREE.Vector3(), prev: new THREE.Vector3(), vel: new THREE.Vector3() }; const fl = new THREE.Mesh(G.flame, M.flame); k.mesh.add(fl); const sp = new THREE.Sprite(M.spark); sp.scale.setScalar(0.9); sp.position.z = -0.45; k.mesh.add(sp); k.mesh.castShadow = true; scene.add(k.mesh); rockets.push(k); }
    pod.g.updateWorldMatrix(true, false); tA.set(0, 0.08, 0.7).applyMatrix4(pod.g.matrixWorld);
    const rp = rizer.position, d = tA.distanceTo(rp), lead = Math.min(1.2, d / R.speed) * R.lead;
    tB.set(rp.x + (rizer.vel?.x || 0) * lead, rp.y + 1.1, rp.z + (rizer.vel?.z || 0) * lead); // where he'll be, roughly
    k.pos.copy(tA); k.prev.copy(tA); k.vel.subVectors(tB, tA).normalize(); k.vel.y += R.gravity * d / R.speed / R.speed * 0.5; k.vel.normalize().multiplyScalar(R.speed);
    k.age = 0; k.live = true; k.from = p; k.mesh.visible = !hidden; k.mesh.position.copy(tA);
    pod.cool = R.cooldown;
    fx?.emit(tA.x, tA.y, tA.z, 14, { color: '#ffb060', speed: 3, up: 0.6, size: 0.3, life: 0.35, g: 0 });
    fx?.emit(tA.x, tA.y, tA.z, 8, { color: '#b9a8c8', speed: 1.4, up: 0.8, size: 0.5, life: 0.8, g: -1 });
    opts.onEvent?.('rocket', p);
  }
  // Impact: explosion, then a radial query on Rizer — damage by distance, knockback from the hit, cover blocks it.
  function explode(k, rizer, hooks, direct) {
    k.live = false; k.mesh.visible = false;
    const x = k.pos.x, y = k.pos.y, z = k.pos.z, g = world.groundAt(x, z, y + 1);
    fx?.emit(x, y, z, 30, { color: '#ffb24a', speed: 6.5, up: 2.2, size: 0.6, life: 0.5, g: 3 });
    fx?.emit(x, y, z, 14, { color: '#fff3d0', speed: 3.5, up: 1.4, size: 0.4, life: 0.3, g: 0 });
    fx?.emit(x, y, z, 16, { color: '#6d6a72', speed: 1.8, up: 2.6, size: 0.9, life: 1.5, g: -1.2 }); // smoke
    if (y - g < 1.2) { // scorch on the ground
      let s = scorches.find(q => q.t <= 0); if (!s) { s = { mesh: new THREE.Mesh(shared().G.scorch, shared().M.scorch.clone()), t: 0 }; s.mesh.renderOrder = 1; scene.add(s.mesh); scorches.push(s); }
      s.t = 9; s.mesh.position.set(x, g + 0.04, z); s.mesh.scale.setScalar(1.3 + Math.random() * 0.5); s.mesh.visible = !hidden;
    }
    const rp = rizer.position; tB.set(rp.x, rp.y + 1.1, rp.z); tC.set(x, Math.max(y, g + 0.35), z);
    const d = tC.distanceTo(tB); let dmg = 0, covered = false;
    if (direct) dmg = R.direct;
    else if (d < R.radius) { covered = world.rayClear(tC, tB, 0.1) < d - 0.6; if (!covered) dmg = R.blast * (1 - d / R.radius); }
    opts.onEvent?.('explosion', { x, y, z, dist: d, covered });
    world.nature?.userData?.breakables?.blast(tC, R.radius, R.blast, R.blast * 0.35); // the blast tears into stone, trees and bushes too
    if (dmg > 0.5 && rizer.hp > 0 && !rizer.inVehicle && rizer.hurt(dmg, tC, k.from)) hooks.onPlayerHit?.('kick', k.from, tB.clone(), dmg);
  }
  function updateRockets(dt, rizer, hooks) {
    const rig = hooks.rizerRig?.(), rp = rizer.position;
    for (const k of rockets) {
      if (!k.live) continue;
      k.age += dt;
      if (k.age < R.trackFor && rizer.hp > 0) { // light early correction only
        tA.set(rp.x, rp.y + 1.1, rp.z).sub(k.pos).normalize(); tB.copy(k.vel).normalize();
        const ang = tB.angleTo(tA), step = Math.min(ang, R.track * dt);
        if (ang > 1e-4) { tB.lerp(tA, step / ang).normalize(); k.vel.copy(tB).multiplyScalar(R.speed); }
      }
      k.vel.y -= R.gravity * dt; k.prev.copy(k.pos); k.pos.addScaledVector(k.vel, dt);
      k.mesh.position.copy(k.pos); tA.copy(k.pos).add(k.vel); k.mesh.lookAt(tA);
      if (Math.random() < dt * 40) fx?.emit(k.prev.x, k.prev.y, k.prev.z, 1, { color: Math.random() < 0.5 ? '#c9b4d6' : '#8d8a92', speed: 0.3, up: 0.3, size: 0.45, life: 0.7, g: -0.5, spread: 0.05 });
      let direct = false, end = k.age > R.life || k.pos.y <= world.groundAt(k.pos.x, k.pos.z, k.pos.y + 1) + 0.1;
      if (!end && rizer.hp > 0 && !rizer.inVehicle) {
        if (rig && !rig.fresh) { if (touch({ a: k.pos, b: k.pos, pa: k.prev, pb: k.prev, r: R.r }, rig, _hit)) direct = end = true; }
        else { const dy = k.pos.y - rp.y; if (dy > 0.2 && dy < 2.1 && Math.hypot(k.pos.x - rp.x, k.pos.z - rp.z) < 0.5) direct = end = true; }
      }
      if (!end && k.age > 0.12) { probe.copy(k.pos); if (world.resolve(probe, 0.15)) { end = true; k.pos.copy(k.prev); } } // buildings, trees, rocks, walls
      if (end) explode(k, rizer, hooks, direct);
    }
    for (const s of scorches) if (s.t > 0) { s.t -= dt; s.mesh.material.opacity = 0.6 * Math.min(1, s.t / 3); if (s.t <= 0) s.mesh.visible = false; }
  }

  // ── Rizer's blows (the contact rules he has against everything else) ──
  const windowAt = (hits, t, spd) => { for (let i = 0; i < hits.length; i++) { const h = hits[i] / spd; if (t >= h - HITBOX.windowBefore && t <= h + HITBOX.windowAfter) return i; } return -1; };
  function playerBlows(dt, rizer, hooks) {
    const at = rizer.attack, rig = hooks.rizerRig?.();
    if (!at || !rig || rig.fresh || rizer.hp <= 0 || rizer.inVehicle || !at.hits) return;
    const rp = rizer.position, spd = at.spd || COMBAT[at.kind]?.speed || 1;
    if (!at.pnAssist) { // step in on a Penumbra in front of him, if nothing smaller claimed the swing
      at.pnAssist = true;
      if (!at.target && !at.sbTarget) for (const p of list) {
        if (!alive(p)) continue; const dx = p.pos.x - rp.x, dz = p.pos.z - rp.z, d = Math.hypot(dx, dz);
        const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - rizer.facing), Math.cos(Math.atan2(dx, dz) - rizer.facing)));
        if (d < 4.2 && off < 0.9) at.pnTarget = p;
      }
    }
    const tg = at.pnTarget;
    if (tg && alive(tg) && (at.t < 0.2 || at.hits.some(h => at.t > h / spd - 0.3 && at.t < h / spd - 0.02))) {
      const dx = tg.pos.x - rp.x, dz = tg.pos.z - rp.z, d = Math.hypot(dx, dz), want = P.radius + 0.55;
      rizer.facing = dampAngle(rizer.facing, Math.atan2(dx, dz), 18, dt);
      if (d > want) { const step = Math.min(6.5 * dt, d - want); rp.x += dx / d * step; rp.z += dz / d * step; }
    }
    const w = at.kind === 'kickup' ? (at.t * spd >= 0.46 && at.t * spd <= 1.0 ? 0 : -1) : windowAt(at.hits, at.t, spd);
    if (w < 0) return;
    if (ghost && clock - ghost.t > 1.2) ghost = null; // destroyed mid-combo: the remaining contact frames still land
    if (ghost && (at !== ghost.at || w > ghost.w) && at.t >= at.hits[w] / spd && !(at.done ||= new Set()).has('ghost:' + w) && !list.some(p => alive(p) && Math.hypot(p.pos.x - rp.x, p.pos.z - rp.z) < 4)) {
      at.done.add('ghost:' + w); ghost.t = clock; hooks.onLanded?.({ x: ghost.x, y: ghost.y, z: ghost.z, down: false, ghost: true, scanobot: true, name: P.name }, at.kind, null);
    }
    const strikers = (STRIKERS[at.kind] || STRIKERS.punch).map(k => rig.parts[k]).filter(q => q && q.vel >= HITBOX.minSpeed);
    if (BLADES[at.kind]) { const bl = hooks.blade?.(); if (bl) strikers.push({ a: bl.a, b: bl.b, pa: bl.a, pb: bl.b, r: bl.r ?? 0.05, vel: 99 }); }
    if (!strikers.length) return;
    const stageMul = (COMBAT.comboDamage?.[at.stage - 1] || 1) / Math.max(1, at.hits.length) * (at.od?.damage || 1), base = COMBAT[at.kind]?.damage || 1;
    for (const p of list) {
      if (!alive(p) || Math.hypot(p.pos.x - rp.x, p.pos.z - rp.z) > 5) continue;
      const key = 'pn' + w + ':' + p.id; if ((at.done ||= new Set()).has(key)) continue;
      let h = null; for (const s of strikers) { h = touch(s, p.rig, _hit, at.kind === 'kickup') && { ..._hit }; if (h) break; }
      if (!h) continue;
      at.done.add(key);
      const kx = p.pos.x - rp.x, kz = p.pos.z - rp.z, kd = Math.hypot(kx, kz) || 1, fin = at.stage >= rizer.comboMax(at.kind) && w === at.hits.length - 1;
      const res = hit(p, base * stageMul, kx / kd, kz / kd, at.kind, (fin ? 1.3 : 0.6) * (at.od?.power || 1));
      if (res) hooks.onLanded?.({ ...res, x: h.at.x, y: h.at.y, z: h.at.z, part: h.part }, at.kind, p);
      if (res?.down) ghost = { at, w, x: h.at.x, y: h.at.y, z: h.at.z, t: clock };
    }
  }

  const nearestWp = p => { let best = 0, bd = Infinity; p.pts.forEach((v, i) => { const d = Math.hypot(v.x - p.pos.x, v.y - p.pos.z); if (d < bd) { bd = d; best = i; } }); return best; };
  function update(dt, t, rizer, hooks = {}) {
    clock += dt; live.length = 0;
    const rp = rizer.position, rizerDistrict = districtAt(rp.x, rp.z, W);
    for (const p of list) {
      const dx = rp.x - p.pos.x, dz = rp.z - p.pos.z, dist = Math.hypot(dx, dz), toP = Math.atan2(dx, dz);
      if (p.state === 'gone') { if (clock >= p.respawnAt && Math.hypot(rp.x - p.pts[0].x, rp.z - p.pts[0].y) > P.respawnDist) reset(p); continue; }
      if (alive(p)) live.push(p);
      for (const pod of p.pods) pod.cool = Math.max(0, pod.cool - dt);
      p.barT = Math.max(0, p.barT - dt); p.flash = Math.max(0, p.flash - dt);
      if (alive(p) && (p.seenT -= dt) <= 0) { p.seenT = 0.2 + Math.random() * 0.1; p.seen = dist < P.ranges.max + 6 && canSee(p, rizer); }
      // once it has him the hunt is relentless: destroyed, Rizer knocked out, or another district
      const hunted = rizer.hp > 0 && rizerDistrict === (p.district ||= districtAt(p.home.x, p.home.y, W));
      let want = 0, face = null, dir = 0; // dir: 0 forward, π backward, ±π/2 sideways (relative to its heading)
      switch (p.state) {
        case 'patrol': case 'return': {
          if (p.seen) { alertNow(p); break; }
          const tg = p.pts[p.wp], tx = tg.x - p.pos.x, tz = tg.y - p.pos.z;
          if (Math.hypot(tx, tz) < 1.2) { p.state = 'idle'; p.t = 1.5 + Math.random() * 2; p.wp = (p.wp + 1) % p.pts.length; break; }
          face = Math.atan2(tx, tz); want = P.walk; break;
        }
        case 'idle': p.t -= dt; if (p.seen) alertNow(p); else if (p.t <= 0) p.state = 'patrol'; break;
        case 'alert': // the warning: it turns to him and its lights come up before anything is fired
          face = toP; p.t -= dt; if (p.t <= 0) p.state = 'track'; break;
        case 'track': { // decide the next action by range
          face = toP;
          if (!hunted) { p.state = 'return'; p.wp = nearestWp(p); break; }
          const off = Math.abs(Math.atan2(Math.sin(toP - p.heading), Math.cos(toP - p.heading)));
          if (off > 0.35) break; // square up first: it is deliberate
          const band = dist < P.ranges.close ? 'close' : dist < P.ranges.mid ? 'mid' : 'long';
          let act = dist > P.ranges.max ? 'advance' : pick(P.choices[band]);
          const pod = act === 'rocket' ? (p.pods[p.nextPod].cool <= 0 ? p.pods[p.nextPod] : p.pods[1 - p.nextPod].cool <= 0 ? p.pods[1 - p.nextPod] : null) : null;
          if (act === 'rocket' && (!pod || !p.seen)) act = band === 'close' ? 'backstep' : band === 'mid' ? 'reposition' : 'advance'; // pods recharging, or no line of sight
          if (act === 'rocket') { p.state = 'rocket'; p.t = 0; p.pod = pod; p.fired = false; p.nextPod = 1 - p.pods.indexOf(pod); opts.onEvent?.('telegraph', p); }
          else { p.state = 'move'; p.t = rand(P.move); p.move = act; if (Math.random() < 0.5) p.side *= -1; }
          break;
        }
        case 'move':
          p.t -= dt; face = toP;
          if (p.move === 'advance') { want = P.combat; if (dist < P.ranges.mid * 0.8) p.t = 0; }
          else if (p.move === 'backstep') { want = P.combat * 0.85; dir = Math.PI; if (dist > P.ranges.close + 3) p.t = 0; }
          else { want = P.combat * 0.8; dir = p.side * Math.PI / 2; }
          if (p.t <= 0) { p.state = 'track'; p.move = null; }
          break;
        case 'rocket': { // TARGET → the pod lights and tilts onto its aim → FIRE → RECOVERY
          p.t += dt; face = toP;
          const k = Math.min(1, p.t / R.windup), pitch = -Math.atan2(rp.y + 1.1 - (p.pos.y + 3.2), Math.max(1, dist));
          p.pod.g.rotation.x = damp(p.pod.g.rotation.x, clamp(pitch, -0.5, 0.35), 6, dt);
          p.pod.mat.emissiveIntensity = 0.4 + k * k * 5.5;
          if (!p.fired && p.t >= R.windup) { p.fired = true; if (rizer.hp > 0) fire(p, p.pod, rizer); }
          if (p.fired) p.pod.mat.emissiveIntensity = Math.max(0.3, 5.9 - (p.t - R.windup) * 9);
          if (p.t >= R.windup + R.recover) { p.state = 'track'; }
          break;
        }
        case 'stagger': p.t -= dt; if (p.t <= 0) p.state = 'track'; break;
        case 'down': // shutdown and collapse; the wreck smokes, then sinks away
          p.t += dt; p.sink = damp(p.sink, 0.95, 3.2, dt);
          p.upper.position.y = -p.sink; p.upper.rotation.x = damp(p.upper.rotation.x, 0.42, 2.5, dt); p.upper.rotation.z = damp(p.upper.rotation.z, 0.12 * p.side, 2.5, dt);
          for (const [i, L] of p.legs.entries()) L.rotation.x = damp(L.rotation.x, i ? 0.5 : -0.4, 3, dt);
          if (p.t < P.wreck && Math.random() < dt * 5) fx?.emit(p.center.x + (Math.random() - 0.5), p.center.y, p.center.z + (Math.random() - 0.5), 1, { color: Math.random() < 0.3 ? '#ffc27a' : '#77757c', speed: 0.6, up: 1.8, size: 0.6, life: 1.2, g: -1 });
          if (p.t > P.wreck || p.salvaged) { p.salvaged = true; p.root.position.y -= dt * 1.4; if ((p.sinkT = (p.sinkT || 0) + dt) > 2.6) { p.sinkT = 0; p.salvaged = false; p.state = 'gone'; p.root.visible = false; p.respawnAt = clock + P.respawn; } }
          break;
      }
      if (p.state === 'gone') continue;
      if (p.state === 'down') { p.lit = damp(p.lit, 0, 3, dt); p.lightMat.emissiveIntensity = 0.05 + p.lit * 2.6; for (const pod of p.pods) pod.mat.emissiveIntensity = damp(pod.mat.emissiveIntensity, 0.05, 3, dt); p.root.visible = !hidden && dist < P.visible; continue; }
      // movement: slow to turn, heavy on its feet
      if (face !== null) { const a = Math.atan2(Math.sin(face - p.heading), Math.cos(face - p.heading)), step = P.turn * (hostile(p) ? 1.35 : 1) * dt; p.heading += clamp(a, -step, step); }
      p.speed = damp(p.speed, p.state === 'stagger' ? 0 : want, 4, dt);
      const ma = p.heading + dir, ox = p.pos.x, oz = p.pos.z;
      const nx = p.pos.x + (Math.sin(ma) * p.speed + p.knock.x) * dt, nz = p.pos.z + (Math.cos(ma) * p.speed + p.knock.z) * dt; p.knock.multiplyScalar(Math.exp(-6 * dt));
      if (onLand(nx, nz) && Math.abs(nx) < B + 10 && Math.abs(nz) < B + 10) { p.pos.x = nx; p.pos.z = nz; } else if (p.state === 'move') p.t = 0;
      probe.copy(p.pos); if (world.resolve(probe, P.radius)) { p.pos.x = probe.x; p.pos.z = probe.z; if (p.state === 'patrol' || p.state === 'return') { if ((p.stuck = (p.stuck || 0) + dt) > 1.5) { p.wp = (p.wp + 1) % p.pts.length; p.stuck = 0; } } else if (p.state === 'move' && p.move !== 'advance') p.side *= -1; }
      p.pos.y = damp(p.pos.y, world.groundAt(p.pos.x, p.pos.z, p.pos.y + 1), 10, dt);
      const moved = Math.hypot(p.pos.x - ox, p.pos.z - oz); p.walkT += moved * 2.1;
      // it is solid: the oriented body box in boxes() is resolved against Rizer and the other bodies by game.js · solidPass
      place(p);
      const show = !hidden && dist < P.visible && (dist < 14 || !hooks.inView || hooks.inView(p.pos));
      p.root.visible = show; p.bar.visible = show && (p.barT > 0 || hostile(p));
      if (!show) continue;
      // pose: stride, a weighty bob, lights, pods at rest, hit flash, low-HP instability
      const sw = Math.sin(p.walkT), stride = Math.min(1, p.speed / P.walk) * 0.42;
      p.legs[0].rotation.x = sw * stride; p.legs[1].rotation.x = -sw * stride;
      p.upper.position.y = Math.abs(Math.cos(p.walkT)) * 0.05 * Math.min(1, p.speed) + (p.state === 'stagger' ? -0.12 : 0);
      p.upper.rotation.x = damp(p.upper.rotation.x, p.state === 'stagger' ? 0.2 : p.state === 'rocket' && p.fired && p.t < R.windup + 0.25 ? -0.09 : 0, 8, dt); // recoil
      p.upper.rotation.z = Math.sin(p.walkT) * 0.02;
      p.lit = damp(p.lit, hostile(p) ? 1 : 0.12, 3.5, dt);
      p.lightMat.emissiveIntensity = 0.25 + p.lit * 2.6 + (p.state === 'alert' ? Math.sin(t * 16) * 0.8 + 0.8 : 0) + p.flash * 20;
      for (const pod of p.pods) if (p.state !== 'rocket' || pod !== p.pod) { pod.g.rotation.x = damp(pod.g.rotation.x, 0, 4, dt); pod.mat.emissiveIntensity = damp(pod.mat.emissiveIntensity, pod.cool > 0 ? 0.08 : 0.3 + p.lit * 0.9, 5, dt); }
      if (p.hp < P.hp * 0.35 && Math.random() < dt * 7) fx?.emit(p.center.x + (Math.random() - 0.5) * 1.2, p.center.y + Math.random(), p.center.z + (Math.random() - 0.5) * 1.2, 1, { color: Math.random() < 0.5 ? '#9fd4ff' : '#77757c', speed: 1, up: 1.4, size: Math.random() < 0.5 ? 0.14 : 0.5, life: 0.5, g: -0.5 });
    }
    playerBlows(dt, rizer, hooks);
    updateRockets(dt, rizer, hooks);
  }

  function setVisible(v) { hidden = !v; for (const p of list) { p.root.visible = v && p.state !== 'gone'; if (!v) p.bar.visible = false; } for (const k of rockets) if (!v) { k.live = false; k.mesh.visible = false; } for (const s of scorches) s.mesh.visible = v && s.t > 0; }
  function standDown() { for (const p of list) if (hostile(p)) { p.state = 'return'; p.wp = nearestWp(p); p.move = null; } for (const k of rockets) { k.live = false; k.mesh.visible = false; } }
  const lockTargets = () => list.filter(p => alive(p) && !hidden).map(p => ({ kind: 'scanobot', ref: p, pos: () => p.pos, alive: () => alive(p), h: 4.2, color: '#ff5a6e', label: 'FIGHT', icon: 'penumbra' }));
  return {
    list, rockets, update, hit, stun, setVisible, standDown, lockTargets, alive,
    // The mech's real footprint (shoulders and forearm cannons to the cockpit, back vent to the front plate), turned with its heading.
    // A wreck stays solid until it sinks away. Used for collision only; hits still use the capsules in p.rig.
    boxes() {
      const out = [];
      for (const p of list) {
        if (p.state === 'gone' || p.salvaged || !p.root.visible && p.state !== 'down') continue;
        const f = (BODY.zmin + BODY.zmax) / 2, hd = (BODY.zmax - BODY.zmin) / 2;
        out.push({ x: p.pos.x + Math.sin(p.heading) * f, z: p.pos.z + Math.cos(p.heading) * f, hw: BODY.hw, hd, rot: p.heading, y: p.pos.y - p.sink, top: p.pos.y - p.sink + BODY.top, owner: p });
      }
      return out;
    },
    get bodies() { return live; },
    inCombat: pos => list.some(p => hostile(p) && Math.hypot(p.pos.x - pos.x, p.pos.z - pos.z) < 40),
    get total() { return list.length; }
  };
}
