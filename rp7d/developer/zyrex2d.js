// 2DHD Zyrex: every RP7B species that has overworld art, standing in 3D Malezor as an upright sprite that turns to
// the camera (Y-axis billboard) and shows the RP7B facing row (DOWN / LEFT / RIGHT / UP) for the way it is heading.
// Species, tiers, types and the population's temperaments come from RP7B (zyrex2d-data.js · tools/build_zyrex2d.py).
//   WildZyrex2D        one wild individual. Same surface as the old 3D WildZyrex (pos, def, b.root, state, bondFocus,
//                      bondCapture, bonded, update) so lock-on, the bond trial, the minimap and the HUD read it unchanged.
//   populate()         RP7B's populations sampled into Malezor's wild: every species, placed on dry open land.
//   createPartner()    the bonded, active Zyrex: follows Rizer and fights what he fights.
// Temperament (RP7B): Calm grazes and never runs · Skittish bolts when it notices you · Wary watches, then runs if
// pressed · Territorial holds its ground and bristles · Dominant comes to meet you and stands in your way.
import * as THREE from 'three';
import { rng, damp, dampAngle, clamp } from './util.js';
import { loadArtTexture } from './art-texture.js';
import { quarterAt } from './world-data.js';
import { ZYREX2D } from './zyrex2d-data.js';

const DIR = './assets/zyrex2d/';
export const ZYREX2D_FILES = [...new Set(Object.values(ZYREX2D).flatMap(s => [s.idle?.file, s.move?.file]).filter(Boolean))].map(f => DIR + f);
// How tall a species stands in the world (metres), by tier: a T1 is knee-to-waist high, a T8 towers.
const heightOf = tier => 1.0 + clamp(tier, 1, 10) * 0.22;
const PLANE = new THREE.PlaneGeometry(1, 1); PLANE.translate(0, 0.5, 0); // origin at the bottom edge
const BLOB = new THREE.CircleGeometry(0.5, 14); BLOB.rotateX(-Math.PI / 2);
const blobMat = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.26, depthWrite: false });
const NIGHT = new THREE.Color('#5b6a94'), DAY = new THREE.Color('#ffffff'), tint = new THREE.Color('#ffffff');
export function setZyrex2DNight(n) { tint.copy(DAY).lerp(NIGHT, clamp(n, 0, 1)); }
const _p = new THREE.Vector3(), _s = new THREE.Vector3(), _q = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0);

// The sprite: a root group (what the rest of the game moves, scales, hides) holding the billboard and a ground shadow.
function buildSprite(spec, scale = 1) {
  const root = new THREE.Group(), R0 = spec.idle.rows[0], frac = Math.max(0.2, R0[1] - R0[0]);
  const cell = heightOf(spec.tier) * scale / frac; // world size of one sheet cell, so the creature itself stands heightOf() tall
  const mat = new THREE.MeshBasicMaterial({ transparent: false, alphaTest: 0.5, side: THREE.DoubleSide, visible: false });
  const mesh = new THREE.Mesh(PLANE, mat); mesh.frustumCulled = false; mesh.matrixAutoUpdate = false; mesh.userData.noCollide = true; root.add(mesh);
  const width = Math.max(0.5, (R0[3] - R0[2]) * cell * 0.7), blob = new THREE.Mesh(BLOB, blobMat); blob.scale.set(width, 1, width * 0.62); blob.position.y = 0.04; blob.renderOrder = 1; blob.userData.noCollide = true; root.add(blob);
  const S = { root, mesh, mat, blob, cell, sheets: {}, sheet: null, row: 0, col: 0, heading: 0, lift: 0, hop: 0, moving: false };
  const use = (key, def) => { if (def) loadArtTexture(DIR + def.file, 4).then(t => { const tex = t.clone(); tex.needsUpdate = true; S.sheets[key] = { tex, rows: def.rows }; if (!S.sheet || key === 'idle') pick(); }).catch(() => {}); };
  const pick = () => { const sh = (S.moving && S.sheets.move) || S.sheets.idle || S.sheets.move; if (sh && sh !== S.sheet) { S.sheet = sh; mat.map = sh.tex; mat.visible = true; mat.needsUpdate = true; } };
  S.pick = pick; use('idle', spec.idle); use('move', spec.move);
  // Billboard + facing row, decided against the camera that is actually drawing it.
  mesh.onBeforeRender = (renderer, scene, camera) => {
    const sh = S.sheet; if (!sh) return;
    root.matrixWorld.decompose(_p, _q, _s);
    const view = Math.atan2(_p.x - camera.position.x, _p.z - camera.position.z); // the way the camera looks at it
    let rel = S.heading - view; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
    S.row = Math.abs(rel) < Math.PI / 4 ? 3 : Math.abs(rel) > Math.PI * 0.75 ? 0 : rel > 0 ? 1 : 2; // away → UP · toward → DOWN · else LEFT / RIGHT
    sh.tex.offset.set(S.col * 0.25, 1 - (S.row + 1) * 0.25);
    const feet = sh.rows[S.row][1], c = cell * _s.y;
    _p.y += S.lift * _s.y + S.hop - (1 - feet) * c; // the drawn feet, not the cell's bottom edge, stand on the ground
    mesh.matrixWorld.compose(_p, _q.setFromAxisAngle(_up, view + Math.PI), _s.set(cell * _s.x, c, 1));
    mat.color.copy(tint);
  };
  return S;
}

const TEMPER = { Calm: { notice: 9 }, Skittish: { notice: 14 }, Wary: { notice: 12 }, Territorial: { notice: 10 }, Dominant: { notice: 15 } };
export class WildZyrex2D {
  constructor(scene, def, world, patchHalf = 18) {
    const spec = ZYREX2D[def.species]; this.spec = spec;
    this.def = { tier: spec.tier, name: spec.name, level: spec.tier * 10, bondDifficulty: spec.tier, temperament: 'Calm', ...def }; // RP7B: a wild's level is tier × 10
    this.world = world; this.half = def.graze ? Math.max(9, def.graze * 2.6) : patchHalf; this.temper = this.def.temperament;
    this.r = rng(Math.floor(def.x * 97 + def.z * 13 + (def.n || 0) * 7) >>> 0);
    this.home = new THREE.Vector2(def.x, def.z);
    this.pos = new THREE.Vector3(def.x, world.heightAt(def.x, def.z), def.z);
    this.s = buildSprite(spec, def.scale || 1); this.b = { root: this.s.root }; scene.add(this.s.root);
    this.flyer = spec.move?.kind === 'fly';
    this.heading = this.r() * Math.PI * 2; this.state = 'idle'; this.timer = 1 + this.r() * 3;
    this.target = null; this.speed = 0; this.frameT = this.r() * 4; this.bristle = 0;
    this.s.root.position.copy(this.pos);
  }
  inPatch(x, z, pad = 0) { return Math.abs(x - this.home.x) < this.half + pad && Math.abs(z - this.home.y) < this.half + pad; }
  dry(x, z) { return (!this.world.containsLand || this.world.containsLand(x, z)) && this.world.waterAt(x, z) <= this.world.heightAt(x, z) - 0.1; }
  pickTarget() {
    for (let i = 0; i < 12; i++) { const x = this.home.x + this.r.range(-this.half, this.half), z = this.home.y + this.r.range(-this.half, this.half); if (this.dry(x, z)) return new THREE.Vector2(x, z); }
    return this.home.clone();
  }
  update(dt, t, rizer, guards = []) {
    if (this.bondCapture || this.bonded) return;
    const p = this.pos, rp = rizer.position, dx = rp.x - p.x, dz = rp.z - p.z, dist = Math.hypot(dx, dz), S = this.s;
    if (dist > 120) { S.root.visible = false; this.far = true; return; } // out of sight: asleep until he comes back
    if (this.far) { this.far = false; S.root.visible = this.shown !== false; }
    const T = this.temper, bold = T === 'Territorial' || T === 'Dominant';
    let guard = null, guardDist = Infinity;
    if (!bold) for (const g of guards || []) { if (!g?.pos || g.state === 'down' || g.state === 'sinking') continue; const d = Math.hypot(g.pos.x - p.x, g.pos.z - p.z); if (d < guardDist) { guard = g; guardDist = d; } }
    const guardNear = guardDist < 16;
    // Noise: crouched sneaking is quiet, running is loud. Locked on for bonding, any Zyrex lets Rizer walk right up.
    const noise = rizer.crouched ? 0.35 : rizer.speed > 5 ? 1.5 : 1, notice = TEMPER[T].notice * noise;
    const pressed = (rizer.speed > 5 && dist < 9 * noise) || dist < 3.6 * noise;
    const spooked = this.bondFocus ? rizer.speed > 5 && dist < 6 && !rizer.crouched && !bold && T !== 'Calm'
      : T === 'Skittish' ? dist < notice : T === 'Wary' ? pressed : false;
    if (this.bondFocus && dist < 14 && this.state !== 'flee') this.state = 'watch';
    let want = 0;
    if ((spooked || guardNear) && this.state !== 'flee') { this.state = 'flee'; this.timer = guardNear ? 4 : 2.6; }
    switch (this.state) {
      case 'idle': this.timer -= dt; if (dist < notice && T !== 'Calm') this.state = bold ? 'hold' : 'watch'; else if (this.timer <= 0) { this.state = 'wander'; this.target = this.pickTarget(); } break;
      case 'wander': {
        if (dist < notice && T !== 'Calm') { this.state = bold ? 'hold' : 'watch'; break; }
        const tx = this.target.x - p.x, tz = this.target.y - p.z;
        if (Math.hypot(tx, tz) < 1) { this.state = 'idle'; this.timer = this.r.range(T === 'Calm' ? 3 : 2, T === 'Calm' ? 8 : 6); break; } // Calm stops longer: it is grazing
        this.heading = dampAngle(this.heading, Math.atan2(tx, tz), 3, dt); want = T === 'Calm' ? 1.4 : 1.9; break;
      }
      case 'watch':
        this.heading = dampAngle(this.heading, Math.atan2(dx, dz), 2.5, dt);
        if (dist > notice + 3) { this.state = 'idle'; this.timer = this.r.range(1, 3); }
        break;
      case 'hold': { // Territorial / Dominant: square up to him. Too close and it bristles — a short warning lunge, never a blow.
        this.heading = dampAngle(this.heading, Math.atan2(dx, dz), 5, dt);
        if (T === 'Dominant' && dist > 5.5 && this.inPatch(p.x, p.z, 10) && !this.bondFocus) want = 2.6; // comes to meet him
        this.bristle -= dt;
        if (dist < 4.2 && this.bristle <= 0 && !this.bondFocus) { this.bristle = 1.6; this.lunge = 0.34; }
        if (dist > notice + 4) { this.state = 'return'; }
        break;
      }
      case 'flee':
        this.heading = dampAngle(this.heading, guardNear ? Math.atan2(p.x - guard.pos.x, p.z - guard.pos.z) : Math.atan2(-dx, -dz), 7, dt); want = 9;
        this.timer -= dt; if (this.timer <= 0 && dist > 10 && !guardNear) this.state = 'return';
        break;
      case 'return': { // the long walk home — never re-homed where it ran to
        const tx = this.home.x - p.x, tz = this.home.y - p.z;
        if (this.inPatch(p.x, p.z, -2)) { this.state = 'idle'; this.timer = 2; break; }
        if (dist < 12 && !pressed && !bold) { this.heading = dampAngle(this.heading, Math.atan2(dx, dz), 2, dt); break; }
        this.heading = dampAngle(this.heading, Math.atan2(tx, tz), 2.5, dt); want = 2.4; break;
      }
    }
    this.step(dt, t, want);
  }
  // Move along the heading, stay on dry land, and animate the sheet.
  step(dt, t, want, free = false) {
    const p = this.pos, S = this.s, W = this.world;
    this.speed = damp(this.speed, want, want > this.speed ? 5 : 7, dt);
    let fwd = this.speed;
    if (this.lunge > 0) { this.lunge -= dt; fwd += Math.sin(clamp(this.lunge / 0.34, 0, 1) * Math.PI * 2) * 6; } // out and back
    const oldX = p.x, oldZ = p.z, nx = p.x + Math.sin(this.heading) * fwd * dt, nz = p.z + Math.cos(this.heading) * fwd * dt;
    if (W.waterAt(nx, nz) <= W.heightAt(nx, nz) - 0.1 || this.flyer) { p.x = nx; p.z = nz; }
    else if (this.state === 'wander') this.target = this.pickTarget(); else if (!free) this.heading += dt * 2.5; // skirt the water's edge
    if (!this.flyer || this.speed < 3) { if (W.resolve(p, 0.6) && this.state === 'wander') this.target = this.pickTarget(); }
    if (W.keepOnLand?.(p, oldX, oldZ)) { this.speed = 0; if (this.state === 'wander' || this.state === 'return') this.target = this.pickTarget(); }
    const B = W.bound; p.x = clamp(p.x, -B, B); p.z = clamp(p.z, -B, B);
    p.y = free ? W.groundAt(p.x, p.z, p.y + 1.5) : W.heightAt(p.x, p.z);
    const moving = this.speed > 0.35; S.moving = moving; S.pick();
    this.frameT += dt * (moving ? (S.sheets.move ? 4.5 + this.speed * 0.55 : 6) : 2.6);
    S.col = Math.floor(this.frameT) % 4; S.heading = this.heading;
    S.lift = damp(S.lift, this.flyer && moving ? 0.9 : 0, 4, dt);
    S.hop = moving && !S.sheets.move ? Math.abs(Math.sin(this.frameT * 1.6)) * 0.12 : 0; // no travel sheet: it hops along on its idle frames
    S.root.position.copy(p);
  }
  setVisible(v) { this.shown = v; this.s.root.visible = v && !this.far && !this.bonded; }
}

// RP7B's populations, sampled into Malezor: every species with art, a few individuals each, their temperaments taken
// in order from the species' RP7B placements. Low tiers live nearer home; the higher the tier, the further out.
export function populate(scene, world, W, { skip = new Set(), pinned = [], make = null } = {}) {
  const born = d => make ? make(d) : new WildZyrex2D(scene, d, world, W.wildPatchHalf); // make: build each individual some other way (the dev 3D-mesh view)
  const out = [], taken = [], r = rng((W.seed || 7) + 20260), B = (world.bound || 300) - 14, home = W.playerStart;
  const free = (x, z, pad) => {
    if ((W.containsLand && !W.containsLand(x, z)) || world.waterAt(x, z) > world.heightAt(x, z) - 0.15 || quarterAt(x, z, W) === 'core') return false;
    if (Math.abs(world.heightAt(x + 1.5, z) - world.heightAt(x - 1.5, z)) + Math.abs(world.heightAt(x, z + 1.5) - world.heightAt(x, z - 1.5)) > 1.8) return false; // not on a cliff face
    if (world.resolve(new THREE.Vector3(x, world.heightAt(x, z), z), 1.2)) return false;
    return !taken.some(v => Math.hypot(v.x - x, v.y - z) < pad);
  };
  for (const d of pinned) if (ZYREX2D[d.species] && !skip.has(d.id)) { out.push(born(d)); taken.push(new THREE.Vector2(d.x, d.z)); }
  const order = Object.entries(ZYREX2D).sort((a, b) => a[1].tier - b[1].tier || a[0].localeCompare(b[0]));
  for (const [species, spec] of order) {
    const count = spec.tier <= 1 ? 3 : spec.tier >= 6 ? 1 : 2, near = 26 + spec.tier * 16; // metres from home at the closest
    for (let n = 0; n < count; n++) {
      const id = `z2d-${species}-${n + 1}`, pop = spec.pop.length ? spec.pop[n % spec.pop.length] : ['Calm', 0];
      let spot = null;
      for (let i = 0; i < 400 && !spot; i++) {
        const x = r.range(-B, B), z = r.range(-B, B), dh = Math.hypot(x - home.x, z - home.z);
        if (dh < near || (i < 300 && dh > near + 190)) continue;
        if (free(x, z, i < 200 ? 16 : 9)) spot = { x, z };
      }
      if (!spot) continue; taken.push(new THREE.Vector2(spot.x, spot.z)); // (the spot is held even when this one is already bonded, so the rest never shift)
      if (skip.has(id)) continue;
      out.push(born({ id, species, n, x: spot.x, z: spot.z, name: spec.name, tier: spec.tier, level: spec.tier * 10, bondDifficulty: spec.tier, temperament: pop[0], graze: pop[1] || 0, habitat: quarterAt(spot.x, spot.z, W) }));
    }
  }
  return out;
}

// The active partner: at Rizer's shoulder, and into whatever he is fighting.
//   record  { id, name, species, level }     hooks.onHit(result, partner, enemy)
export function createPartner(scene, world, record, at) {
  const spec = ZYREX2D[record.species]; if (!spec) return null;
  const z = new WildZyrex2D(scene, { id: record.id, species: record.species, name: record.name, level: record.level, x: at.x, z: at.z, temperament: 'Calm' }, world, 6);
  z.partner = true; z.record = record; z.cool = 0; z.side = 1;
  const tier = spec.tier, damage = 1.5 + tier * 0.8, reach = 1.5 + tier * 0.08;
  z.update = function (dt, t, rizer, ctx = {}) {
    const p = this.pos, rp = rizer.position, seers = ctx.seers; this.cool = Math.max(0, this.cool - dt);
    const dR = Math.hypot(rp.x - p.x, rp.z - p.z);
    if (dR > 55 || Math.abs(rp.y - p.y) > 30) { const a = rizer.facing + Math.PI; p.set(rp.x + Math.sin(a) * 2.5, rp.y, rp.z + Math.cos(a) * 2.5); this.speed = 0; } // left far behind: it catches him up
    // what to fight: what Rizer has locked, else the nearest thing that has turned on him
    let foe = ctx.lock?.kind === 'enemy' && seers?.alive(ctx.lock.ref) ? ctx.lock.ref : null;
    if (!foe && seers) { let bd = 15; for (const g of seers.grunts) { if (!seers.alive(g) || ['patrol', 'return', 'wait', 'observe', 'dance'].includes(g.state)) continue; const d = Math.hypot(g.pos.x - rp.x, g.pos.z - rp.z); if (d < bd && Math.abs(g.pos.y - rp.y) < 4) { bd = d; foe = g; } } }
    if (foe && Math.hypot(foe.pos.x - rp.x, foe.pos.z - rp.z) > 26) foe = null; // it does not leave his side for a fight across the field
    let want = 0;
    if (foe) {
      const dx = foe.pos.x - p.x, dz = foe.pos.z - p.z, d = Math.hypot(dx, dz) || 1; this.state = 'fight';
      this.heading = dampAngle(this.heading, Math.atan2(dx, dz), 9, dt);
      if (d > reach) want = Math.min(10, 3 + d * 1.6);
      else if (this.cool <= 0) { this.cool = 1.25; this.lunge = 0.34; this.strike = { foe, t: 0.14, dx: dx / d, dz: dz / d }; }
    } else {
      this.state = 'follow';
      const a = rizer.facing + Math.PI - 0.7 * this.side, tx = rp.x + Math.sin(a) * 2.3 - p.x, tz = rp.z + Math.cos(a) * 2.3 - p.z, d = Math.hypot(tx, tz);
      if (d > 0.9) { this.heading = dampAngle(this.heading, Math.atan2(tx, tz), 8, dt); want = Math.min(Math.max(rizer.speed + 2, 4), 2 + d * 2.2, 16); }
      else this.heading = dampAngle(this.heading, rizer.facing, 3, dt);
    }
    if (this.strike) { const k = this.strike; k.t -= dt; if (k.t <= 0) { this.strike = null; if (seers?.alive(k.foe)) ctx.onHit?.(seers.hitGrunt(k.foe, damage, k.dx, k.dz, 'punch', 0.9), this, k.foe); } }
    this.step(dt, t, want, true);
    this.air = damp(this.air || 0, rp.y - p.y > 2.5 ? rp.y - 0.4 - p.y : 0, 3, dt); this.s.root.position.y = p.y + this.air; // he is in the air: it rises with him
  };
  return z;
}
