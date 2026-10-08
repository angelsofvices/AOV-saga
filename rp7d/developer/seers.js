// Seer grunts: the Seers hold Malezor's roads. Each grunt walks a patrol
// route, sees with a forward cone (shorter at night) blocked by terrain and
// buildings, calls nearby grunts when it spots Rizer, then chases and fights
// with the same 4-stage punch and kick combos Rizer has. Only two attack at once;
// the rest circle and wait. They're the baseline enemy: a readable wind-up before
// every combo, slow to turn mid-swing, and they sometimes keep swinging at air.
// All combat is contact: poly-bound capsules on both bodies (hitbox.js).
//
// The wild: the Seers make and drive the Mori, and they are closing a choke hold on
// Malezor, the last district they have yet to take. Beyond Malezor Central, every Seer
// handler herds a pack of Mori on its rounds (WILD below); when the handler spots
// Rizer, the whole pack comes. Far-off packs run a cheap patrol and stop animating, so
// the population can be large.
import * as THREE from 'three';
import { Actor, CLIPS, loadGLB } from './actor.js';
import { clamp, damp, dampAngle } from './util.js';
import { HitRig, touch, STRIKERS, HITBOX, segSeg } from './hitbox.js';
import { COMBAT, BLADES } from './rizer.js';
import { quarterAt, districtAt, fromRP7B } from './world-data.js';
import { rng } from './util.js';
import { dressCorrupted } from './enemy-skins.js';
import { dressDaemon } from './daemon-skins.js';
import { DAEMON_BLACK_SPEC } from './daemons-black.js';
import { rollEnemyBag } from './coin-piles.js';
import { DAEMON_RED_SPEC } from './daemons-red.js';

export const SEER = {
  name: 'Seer grunt', key: 'seer', patrols: 'seerPatrols',
  url: './assets/seer/seer.glb', scale: 1.25, hp: 15, radius: 0.55,
  walk: 2.1, run: 6.0, sight: 17, sightNight: 11, cone: 1.05, sense: 3.5,
  loseAfter: 4.5, giveUpDist: 32, leash: 48, callRadius: 14, maxAttackers: 2, // (loseAfter / giveUpDist / leash: not used while the hunt is relentless — see `hunted` in update)
  hold: 3.6, respawn: 40,
  // fighting (distances are torso to torso)
  punch: { damage: 5, weight: 0.6, range: 1.1 }, kick: { damage: 8, weight: 0.4, range: 1.45 },
  comboDamage: [1, 1, 1.5, 2],        // per stage, like Rizer's
  comboLength: [0.2, 0.35, 0.3, 0.15], // odds of a 1-, 2-, 3- or 4-hit combo
  clipSpeed: 0.9,                     // a touch slower than Rizer's own swings
  windup: [0.28, 0.5],                // stand-and-square-up before each combo (the tell)
  turnRate: 2.6,                      // how fast they re-aim mid-combo (rad/s): side-steps beat them
  whiff: 0.3,                         // chance to keep swinging after you've left range
  cooldown: [0.9, 1.9],               // rest after a combo
  // Rizer's strikes: how far a swing can pull him onto a target in front of him
  assist: { range: 3.2, arc: 0.9, speed: 6.5, time: 0.2, contact: { punch: 0.8, kick: 1.25, flykick: 1.3, kickup: 1.6, runpunch: 0.9, sword: 1.3, axe: 1.35 } }
};
// Mori: Malezor's undead (tier 1, canon). Less health and slower than a Seer, but each blow hurts more.
// Zombie punch/kick clips drive his attacks; he is slower to turn and swings at air more often.
export const MORI = {
  ...SEER, name: 'Mori', key: 'mori', family: 'corrupted', patrols: 'moriPatrols', url: './assets/mori/mori.glb',
  hp: 9, walk: 1.25, run: 3.6, sight: 13, sightNight: 13, cone: 1.2, sense: 3, loseAfter: 6, giveUpDist: 26, leash: 36, callRadius: 12,
  punch: { damage: 9, weight: 0.8, range: 1.05 }, kick: { damage: 12, weight: 0.2, range: 1.4 },
  bite: { damage: 11, range: 1.02 },
  comboLength: [0.45, 0.35, 0.15, 0.05], clipSpeed: 0.72, windup: [0.45, 0.75], turnRate: 2.0, whiff: 0.45, cooldown: [1.3, 2.4]
};
// Crept and Skellor share Mori's corrupt-humanoid behavior and animation rig.
export const CREPT = {
  ...MORI, name: 'Crept', key: 'crept', patrols: 'creptPatrols', url: MORI.url, hp: 11, radius: 0.55,
  walk: 1.6, run: 4.6, sight: 14, sightNight: 9, cone: 1.1, sense: 3,
  loseAfter: 5, giveUpDist: 28, leash: 40, callRadius: 12, maxAttackers: 2, hold: 3.6, respawn: 40,
  punch: { damage: 6, weight: 0.65, range: 1.1 }, kick: { damage: 8, weight: 0.35, range: 1.4 },
  comboLength: [0.35, 0.35, 0.2, 0.1], clipSpeed: 0.85, windup: [0.32, 0.55], turnRate: 2.3, whiff: 0.35, cooldown: [1.0, 2.0],
  biome: ['forest']
};
// Skellor: skeletal warriors — dead hikers who never came down, bone-pale in the mountains and plains.
// Shares Mori's rig and clip set (Malezor's undead), tinted bone-white.
export const SKELLOR = {
  ...MORI, name: 'Skellor', key: 'skellor', patrols: 'skellorPatrols', url: MORI.url, hp: 12, radius: 0.55,
  walk: 1.5, run: 4.2, sight: 15, sightNight: 12, cone: 1.15, sense: 3.2,
  loseAfter: 5.5, giveUpDist: 30, leash: 40, callRadius: 13, maxAttackers: 2, hold: 3.6, respawn: 40,
  punch: { damage: 8, weight: 0.6, range: 1.1 }, kick: { damage: 10, weight: 0.4, range: 1.4 },
  comboLength: [0.4, 0.35, 0.18, 0.07], clipSpeed: 0.8, windup: [0.38, 0.65], turnRate: 2.2, whiff: 0.4, cooldown: [1.1, 2.1],
  biome: ['highland', 'open']
};
export const DAEMON_BLACK = { ...MORI, ...DAEMON_BLACK_SPEC, url: MORI.url, patrols: 'daemonBlackPatrols' };
export const DAEMON_RED = { ...MORI, ...DAEMON_RED_SPEC, url: MORI.url, patrols: 'daemonRedPatrols' };
export const ENEMY_TYPES = [SEER, MORI, CREPT, SKELLOR, DAEMON_BLACK, DAEMON_RED];
// How many scattered, single-body patrol loops to seed for the biome-bound enemies (Crept, Skellor).
// Unlike the Seer/Mori wild packs (a handler and its followers), these walk alone.
export const SCATTERED = { count: 16, loop: [5, 10], spacing: 22, homeTiles: 30 };
// Wild population, as multiples of the hand-placed road patrols (7 Seers · 6 Mori → ~35 · ~120).
export const WILD = {
  seerMul: 5, moriMul: 20,     // totals, relative to the hand-placed patrols that spawned
  spacing: 24,                 // min distance between packs (and from the hand-placed routes)
  homeTiles: 40,               // no packs within this many RP7B tiles of Rizer's home
  loop: [6, 11],               // radius of a pack's patrol loop
  follow: [1.8, 3.4],          // how far behind and around their handler the Mori walk
  active: 70,                  // full AI + collision within this distance of Rizer
  visible: 85,                 // drawn (animated every 3rd frame) out to here; beyond, hidden
  shadows: 35                  // only bodies this close cast shadows (each caster is drawn again into the shadow map)
};
const pickCombo = (T = SEER) => { let r = Math.random(), n = 1; for (const w of T.comboLength) { if ((r -= w) <= 0) return n; n++; } return 4; };
const rand = ([a, b]) => a + Math.random() * (b - a);

// Shared by runtime spawning and the district audit. Keep density tied to the
// original patrol family, so changing a Mori's mode never rerolls its route.
export function planPatrolSpawn(W, sourceKey, route, onLand = (x, z) => !W.containsLand || W.containsLand(x, z)) {
  const pts = route.pts.filter(([x, z]) => onLand(x, z) && (!W.containsLand || W.containsLand(x, z)));
  if (!pts.length) return null;
  const home = W.enemyHomeTile ? fromRP7B(W.enemyHomeTile.x, W.enemyHomeTile.y) : W.playerStart;
  const distance = Math.min(...pts.map(([x, z]) => Math.hypot(x - home.x, z - home.z)));
  if (distance < 44) return null;
  const minTiles = distance / (W.tileScale || 2);
  const band = (W.enemyDensity || []).find(b => minTiles <= b.radius), chance = band?.chance ?? 1;
  let seed = 2166136261; for (const ch of `${sourceKey}:${route.id}`) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
  if ((seed >>> 0) / 4294967296 >= chance) return null;
  const key = sourceKey === 'mori' && route.mode === 'daemon' ? 'daemon-black' : sourceKey;
  return { ...route, key, pts };
}
export function districtEnemyLevel(W, T, route = {}) {
  const field = T.family === 'daemon' ? 'daemon' : T.key === 'mori' ? 'mori' : T.key === 'seer' ?
    (route.commander || route.role === 'commander' || route.mode === 'commander' ? 'seerCommander' : 'seerGrunt') : null;
  const level = field && W.levels?.[field];
  return Number.isFinite(level) && level > 0 ? level : undefined;
}

function textSprite(draw, w, h, scale) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(scale * w / h, scale, 1); s.renderOrder = 20;
  s.redraw = (...a) => { const g = c.getContext('2d'); g.clearRect(0, 0, w, h); draw(g, ...a); tex.needsUpdate = true; };
  return s;
}
const alertTex = () => textSprite(g => {
  g.fillStyle = '#ff9a30'; g.strokeStyle = '#1b1210'; g.lineWidth = 6; g.font = 'bold 54px Cinzel, serif'; g.textAlign = 'center';
  g.strokeText('!', 32, 52); g.fillText('!', 32, 52);
}, 64, 64, 0.7);
const barTex = () => textSprite((g, f) => {
  g.fillStyle = 'rgba(12,10,20,.8)'; g.fillRect(0, 0, 96, 12);
  g.fillStyle = '#a878ff'; g.fillRect(2, 2, 92 * f, 8);
}, 96, 12, 0.09);

export async function createSeers(scene, world, W) {
  const grunts = [];
  const feedClaims = new Map(), fedBodies = new WeakSet();
  let feedScan = 0;
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  const lootMat = new THREE.MeshStandardMaterial({ color: '#704321', roughness: 0.82 });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#e8ad36', metalness: 0.75, roughness: 0.28, emissive: '#583400', emissiveIntensity: 0.25 });
  const gemMat = new THREE.MeshStandardMaterial({ color: '#6a72ff', metalness: 0.35, roughness: 0.18, emissive: '#373cff', emissiveIntensity: 0.75 });
  let defeated = 0, onDefeated = null; // onDefeated(grunt, finishing technique): one call per defeat (game.js → RXP)

  const kinds = await Promise.all(ENEMY_TYPES.map(async T => ({ T, gltf: await loadGLB(T.url).catch(e => (console.warn('[rp7d] no model for', T.name, e), null)) })));
  const byKey = Object.fromEntries(kinds.map(k => [k.T.key, k]));
  function spawn(T, gltf, route, extra = {}) {
    const actor = new Actor(gltf, T.scale, T.key);
    dressCorrupted(actor, T.key);
    if (T.family === 'daemon') dressDaemon(actor, T.key === 'daemon-red' ? 'red' : 'black');
    const root = new THREE.Group(); root.add(actor.pivot); scene.add(root);
    const bang = alertTex(); bang.position.y = 3.25; bang.visible = false; root.add(bang); bang.redraw();
    const bar = barTex(); bar.position.y = 2.95; bar.visible = false; root.add(bar);
    const lootBag = new THREE.Group(); lootBag.visible = false; scene.add(lootBag);
    const coinDrop = true; // every bag holds coins (coin-piles.js · ENEMY_BAG); no enemy drops gems any more
    const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), lootMat); pouch.scale.set(1, 0.72, 0.8); lootBag.add(pouch);
    const token = new THREE.Mesh(coinDrop ? new THREE.CylinderGeometry(0.11, 0.11, 0.045, 12) : new THREE.OctahedronGeometry(0.13), coinDrop ? goldMat : gemMat);
    token.position.set(0, 0.15, 0); if (coinDrop) token.rotation.x = Math.PI / 2; lootBag.add(token);
    const g = {
      id: route.id, T, pts: route.pts, loop: !!route.loop, root, actor, bang, bar, lootBag, walk: T.walk,
      mode: route.mode || 'wander', level: districtEnemyLevel(W, T, route),
      pos: new THREE.Vector3(), heading: 0, speed: 0, knock: new THREE.Vector3(), rig: new HitRig(actor), side: grunts.length % 2 ? 1 : -1, frame: grunts.length, animAcc: 0, ...extra
    };
    const drop = {
      id: `loot-${route.id}`, kind: 'enemyLoot', name: `${T.name} ${coinDrop ? 'Coin' : 'Gem'} Bag`,
      note: 'Press Circle to collect', reach: 3.2, discover: false, enemy: g,
      get x() { return g.pos.x; }, get z() { return g.pos.z; }, get cx() { return g.pos.x; }, get cz() { return g.pos.z; }
    };
    g.drop = drop; world.interactables.push(drop);
    reset(g); grunts.push(g); return g;
  }
  const onLand = (x, z) => (!W.containsLand || W.containsLand(x, z)) && (!world.containsLand || world.containsLand(x, z)) && world.waterAt(x, z) < world.heightAt(x, z) - 0.1;
  // Hand-placed road patrols (world-data.js).
  const handRoutes = [];
  for (const { T, gltf } of kinds) for (const route of (gltf && W[T.patrols]) || []) {
    const plan = planPatrolSpawn(W, T.key, route, onLand);
    const kind = plan && byKey[plan.key]; if (!kind?.gltf) continue;
    const pts = plan.pts.map(([x, z]) => new THREE.Vector2(x, z));
    spawn(kind.T, kind.gltf, { ...plan, pts }); handRoutes.push(pts);
  }
  // The wild packs: a Seer handler and its Mori, seeded so every visit is the same.
  const seerKind = byKey.seer, moriKind = byKey.mori;
  if (seerKind?.gltf && moriKind?.gltf) {
    const baseS = grunts.filter(g => g.T === SEER).length || 7, baseM = grunts.filter(g => g.T === MORI).length || 6;
    const packs = Math.max(0, WILD.seerMul * baseS - baseS), moriLeft = Math.max(0, WILD.moriMul * baseM - baseM);
    const r = rng((W.seed || 7) + 4242), B = (world.bound || 300) - 12, home = W.playerStart, taken = handRoutes.flat();
    const probe = new THREE.Vector3();
    const open = (x, z) => {
      if (!onLand(x, z) || quarterAt(x, z, W) === 'core' || Math.hypot(x - home.x, z - home.z) / (W.tileScale || 2) < WILD.homeTiles) return false;
      if (Math.abs(world.heightAt(x + 1, z) - world.heightAt(x - 1, z)) + Math.abs(world.heightAt(x, z + 1) - world.heightAt(x, z - 1)) > 1.6) return false; // not on a cliff face
      probe.set(x, world.heightAt(x, z), z); return !world.resolve(probe, 1.1);
    };
    const pathOpen = (a, b) => { const L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(L / 1.5); for (let i = 1; i < n; i++) if (!open(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n)) return false; return true; };
    const centres = [];
    for (let t = 0; t < 6000 && centres.length < packs; t++) {
      const x = (r() * 2 - 1) * B, z = (r() * 2 - 1) * B;
      if (!open(x, z) || centres.some(c => Math.hypot(c.x - x, c.y - z) < WILD.spacing) || taken.some(v => Math.hypot(v.x - x, v.y - z) < WILD.spacing * 0.6)) continue;
      const a0 = r() * Math.PI * 2, pts = [];
      for (let k = 0; k < 4; k++) {
        const a = a0 + k * Math.PI / 2 + (r() - 0.5) * 0.5, rr = WILD.loop[0] + r() * (WILD.loop[1] - WILD.loop[0]);
        const v = new THREE.Vector2(x + Math.sin(a) * rr, z + Math.cos(a) * rr);
        if (open(v.x, v.y) && (!pts.length || pathOpen(pts[pts.length - 1], v))) pts.push(v);
      }
      if (pts.length < 3 || !pathOpen(pts[pts.length - 1], pts[0])) continue;
      centres.push(new THREE.Vector2(x, z));
      const id = `wild-${centres.length}`, handler = spawn(SEER, seerKind.gltf, { id, loop: true, pts }, { walk: MORI.walk * 0.95, pack: [] });
      handler.squad = handler;
      // A field pact is one handler with up to five Mori. Keep the existing
      // population exactly the same; handlers left without a full pact serve
      // as solo rotating patrols between the district routes and HQ routes.
      const count = Math.max(0, Math.min(5, moriLeft - (centres.length - 1) * 5));
      for (let m = 0; m < count; m++) {
        const ang = Math.PI + (m - (count - 1) / 2) * 0.75, dist = WILD.follow[0] + r() * (WILD.follow[1] - WILD.follow[0]);
        const mo = spawn(MORI, moriKind.gltf, { id: `${id}-mori-${m + 1}`, loop: true, pts }, { leader: handler, squad: handler, slot: { ang, dist } });
        handler.pack.push(mo);
        const o = formation(mo); mo.pos.set(o.x, world.groundAt(o.x, o.z), o.z); mo.root.position.copy(mo.pos);
      }
    }
    console.log(`[rp7d] wild packs: ${centres.length} Seer handlers · ${grunts.filter(g => g.leader).length} Mori`);
  }
  // Solitary species use the same terrain-aware patrol routing and sanctuary
  // as Crept and Skellor. Daemons join this roster in a stable 12:9 mix.
  for (const T of [CREPT, SKELLOR, DAEMON_BLACK, DAEMON_RED]) {
    // District data owns the Daemon population. Legacy worlds without levels
    // retain their old scatter; Malezor's null level means no ambient Daemons.
    if (T.family === 'daemon' && W.levels) continue;
    const kind = byKey[T.key]; if (!kind?.gltf) continue;
    const r = rng((W.seed || 7) + (T.seed || (T.key === 'crept' ? 5151 : 6161))), B = (world.bound || 300) - 12, home = W.playerStart;
    const taken = grunts.map(g => ({ x: g.pos.x, y: g.pos.z }));
    const open = (x, z) => {
      if (!onLand(x, z) || !T.biome.includes(quarterAt(x, z, W)) || Math.hypot(x - home.x, z - home.z) / (W.tileScale || 2) < SCATTERED.homeTiles) return false;
      if (Math.abs(world.heightAt(x + 1, z) - world.heightAt(x - 1, z)) + Math.abs(world.heightAt(x, z + 1) - world.heightAt(x, z - 1)) > 1.6) return false;
      return !world.resolve(new THREE.Vector3(x, world.heightAt(x, z), z), 1.1);
    };
    const pathOpen = (a, b) => { const L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(L / 1.5); for (let i = 1; i < n; i++) if (!open(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n)) return false; return true; };
    let placed = 0;
    for (let t = 0; t < 6000 && placed < (T.spawnCount || SCATTERED.count); t++) {
      const x = (r() * 2 - 1) * B, z = (r() * 2 - 1) * B;
      if (!open(x, z) || taken.some(v => Math.hypot(v.x - x, v.y - z) < SCATTERED.spacing)) continue;
      const a0 = r() * Math.PI * 2, pts = [];
      for (let k = 0; k < 4; k++) {
        const a = a0 + k * Math.PI / 2 + (r() - 0.5) * 0.5, rr = SCATTERED.loop[0] + r() * (SCATTERED.loop[1] - SCATTERED.loop[0]);
        const v = new THREE.Vector2(x + Math.sin(a) * rr, z + Math.cos(a) * rr);
        if (open(v.x, v.y) && (!pts.length || pathOpen(pts[pts.length - 1], v))) pts.push(v);
      }
      if (pts.length < 3 || !pathOpen(pts[pts.length - 1], pts[0])) continue;
      taken.push({ x, y: z }); placed++;
      spawn(T, kind.gltf, { id: `${T.key}-${placed}`, loop: true, pts });
    }
    console.log(`[rp7d] scattered ${T.name}: ${placed}`);
  }
  // Where a pack Mori wants to be: behind and around its handler, turned with him.
  function formation(g, out = { x: 0, z: 0 }) {
    const L = g.leader, a = L.heading + g.slot.ang; out.x = L.pos.x + Math.sin(a) * g.slot.dist; out.z = L.pos.z + Math.cos(a) * g.slot.dist; return out;
  }
  const _f = { x: 0, z: 0 };
  // Same side: the same kind, or the same pack (a handler and its Mori answer each other).
  const allied = (a, b) => a.T === b.T || (a.T.family && a.T.family === b.T.family) || (a.squad && a.squad === b.squad);
  const HOSTILE_STATES = new Set(['alert', 'chase', 'windup', 'attack', 'evade', 'stagger', 'dazed', 'surprised', 'astraliftDown', 'gettingUp']);
  const hostile = g => HOSTILE_STATES.has(g.state);
  const calm = g => g.state === 'patrol' || g.state === 'wait' || g.state === 'return' || g.state === 'observe';
  const canFeed = g => g.T.key === 'mori' || g.T.family === 'daemon';
  const bodyAvailable = (body, rizer) => body === rizer ? rizer.hp <= 0 : body.state === 'down' && !body.launch && body.fall > 0.35 && !body.looted && !fedBodies.has(body);
  function releaseFeed(g) {
    if (!g.feedTarget) return;
    if (feedClaims.get(g.feedTarget) === g) feedClaims.delete(g.feedTarget);
    g.feedTarget = null; g.actor.crawling = false;
    if (g.actor.shot?.kind === 'feedBody') g.actor.release('feedBody', 0.16);
  }
  function seekBodies(rizer, battleActive) {
    const deadPlayer = rizer.hp <= 0;
    if (!deadPlayer && (battleActive || music)) return;
    const bodies = deadPlayer ? [rizer] : grunts.filter(o => bodyAvailable(o, rizer) && Math.hypot(o.pos.x - rizer.position.x, o.pos.z - rizer.position.z) < WILD.visible);
    for (const body of bodies) {
      if (feedClaims.has(body)) continue;
      const target = body === rizer ? rizer.position : body.pos;
      let best = null, bestDist = body === rizer ? 6 : 9;
      for (const g of grunts) {
        const quietPursuit = g.state === 'chase' && g.lost > 3 && Math.hypot(g.pos.x - rizer.position.x, g.pos.z - rizer.position.z) > 24;
        if (!canFeed(g) || !alive(g) || g.feedTarget || g.feedRetry > 0 || (!deadPlayer && !calm(g) && !quietPursuit) ||
            (deadPlayer && ['dance', 'stagger', 'surprised', 'dazed', 'astraliftDown', 'gettingUp'].includes(g.state))) continue;
        const d = Math.hypot(g.pos.x - target.x, g.pos.z - target.z);
        if (d >= bestDist || Math.abs(g.pos.y - target.y) > 2.2) continue;
        best = g; bestDist = d;
      }
      if (!best) continue;
      best.feedTarget = body; best.state = 'feedApproach'; best.atk = null; best.next = null;
      best.bang.visible = false; best.actor.release(); feedClaims.set(body, best);
    }
  }

  function reset(g) {
    releaseFeed(g); fedBodies.delete(g);
    const s = g.pts[0];
    g.pos.set(s.x, world.groundAt(s.x, s.y), s.y); g.wp = Math.min(1, g.pts.length - 1); g.dir = 1;
    g.heading = g.pts.length > 1 ? Math.atan2(g.pts[1].x - s.x, g.pts[1].y - s.y) : 0;
    g.rxpPaid = false; g.tech = null; g.state = 'patrol'; g.timer = 0; g.hp = g.T.hp; g.lost = 0; g.cool = 0; g.evadeCool = 0; g.evadeThreat = null; g.atk = null; g.next = null; g.feedRetry = 0; g.barT = 0; g.fall = 0; g.sink = 0; g.looted = false; g.stag = 0; g.dazed = 0; g.dazedMode = null; g.observeLost = 0; g.stuck = 0; g.avoidT = 0; g.actor.dazed = false; g.actor.fighting = false; g.actor.crawling = false;
    g.root.visible = true; g.root.position.copy(g.pos); g.actor.release(); g.actor.pivot.rotation.set(0, 0, 0); g.actor.pivot.position.y = 0; g.bang.visible = false;
    g.lootBag.visible = false;
    if (g.drop && !world.interactables.includes(g.drop)) world.interactables.push(g.drop);
  }
  const alive = g => g.state !== 'down' && g.state !== 'sinking';
  const nearestWp = g => { let best = 0, bd = Infinity; g.pts.forEach((v, i) => { const d = Math.hypot(v.x - g.pos.x, v.y - g.pos.z); if (d < bd) { bd = d; best = i; } }); return best; };

  function canSee(g, rizer, night) {
    if (rizer.hp <= 0) return false;
    if (rizer.hidden) return Math.hypot(rizer.position.x - g.pos.x, rizer.position.z - g.pos.z) < 1.1; // in a bush: only bumping into him gives him away
    const rp = rizer.position, dx = rp.x - g.pos.x, dz = rp.z - g.pos.z, d = Math.hypot(dx, dz);
    // stealth: crouching shrinks how close they sense you and how far they see; running is noisy
    const hush = rizer.crouched ? rizer.stealth.sense : rizer.speed > 5 ? 1.6 : 1, low = rizer.crouched ? rizer.stealth.sight : 1;
    if (d < g.T.sense * hush) return true;
    const range = (g.T.sight + (g.T.sightNight - g.T.sight) * night) * low;
    if (d > range) return false;
    const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - g.heading), Math.cos(Math.atan2(dx, dz) - g.heading)));
    if (off > g.T.cone) return false;
    tmpA.set(g.pos.x, g.pos.y + 2.2, g.pos.z); tmpB.set(rp.x, rp.y + 1.8, rp.z);
    return world.rayClear(tmpA, tmpB, 0.1) >= d - 0.8;
  }
  function spot(g, delay = 0.55) {
    // A Seer command wakes its whole pact; striking one of its Mori reports
    // back to the handler and produces the same response.
    const leader = g.T.key === 'seer' ? g : g.leader;
    const pact = leader ? [leader, ...(leader.pack || [])] : [g];
    for (const o of pact) {
      if (!alive(o) || hostile(o) || o.state === 'down' || o.state === 'sinking') continue;
      releaseFeed(o);
      o.state = 'alert'; o.timer = delay + (o === leader ? 0 : Math.random() * 0.18); o.lost = 0; o.bang.visible = o.T.key === 'seer';
    }
  }

  // (Legacy area blow, unused now that strikes are contact-based.)
  function playerStrike(kind, rizer, spec) {
    const hits = [], rp = rizer.position;
    for (const g of grunts) {
      if (!alive(g)) continue;
      const dx = g.pos.x - rp.x, dz = g.pos.z - rp.z, d = Math.hypot(dx, dz);
      if (d > spec.reach || Math.abs(g.pos.y - rp.y) > 1.6) continue;
      const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - rizer.facing), Math.cos(Math.atan2(dx, dz) - rizer.facing)));
      if (off > spec.arc && d > 1.0) continue;
      hits.push(hitGrunt(g, spec.damage, dx / (d || 1), dz / (d || 1), kind));
    }
    return hits;
  }
  // Damage one grunt from direction (dx, dz). Shared by strikes and the astral blast.
  function hitGrunt(g, damage, dx, dz, kind, power = 1) {
    releaseFeed(g);
    const beforeHit = g.state, priorDazedMode = g.dazedMode;
    g.hp -= damage * (1 - (g.T.armor || 0) * 0.2); g.barT = 4; g.bar.redraw(Math.max(0, g.hp) / g.T.hp);
    // trading blows: a light jab that lands while his own blow is already coming through doesn't stop it
    if (g.hp > 0 && kind === 'punch' && power < 1 && g.state === 'attack' && g.atk && windowAt(g.atk.hits, g.atk.t, g.T.clipSpeed) >= 0) {
      g.knock.set(dx, 0, dz).multiplyScalar(1.2); g.sinceHit = 0;
      return { x: g.pos.x, y: g.pos.y + 1.6, z: g.pos.z, down: false, traded: true, name: g.T.name };
    }
    g.knock.set(dx, 0, dz).multiplyScalar((kind === 'astralift' ? 0 : (kind === 'kick' ? 9 : kind === 'flykick' ? 12 : kind === 'kickup' ? 13 : kind === 'thunder' ? 3 : kind === 'runpunch' ? 8 : kind === 'blast' ? 11 : kind === 'sword' ? 6 : kind === 'axe' ? 9 : 5) * power) * (1 - (g.T.armor || 0) * 0.45));
    if (g.state === 'dance') g.noDance = true; // struck mid-dance: out of the trance until the song ends
    g.atk = null; g.actor.shot = null; g.bang.visible = false;
    if (g.hp <= 0) { g.actor.dazed = false; g.dazed = 0; g.dazedMode = null; g.state = 'down'; g.fall = 0; g.sink = 0; g.looted = false; g.timer = 0; defeated++; onDefeated?.(g, g.tech || kind); g.actor.play(kind === 'thunder' && g.actor.has('shocked') ? 'shocked' : 'knockdown', 1, { hold: true }); g.lootBag.visible = true; } // struck down by thunder: the electrocution plays out and they stay down
    else {
      // the more blows in a row, the quicker they shake it off (so an endless mash gets answered)
      g.flurry = (g.sinceHit < 1.2 ? (g.flurry || 0) : 0) + 1; g.sinceHit = 0;
      const lookingAtRizer = Math.sin(g.heading) * -dx + Math.cos(g.heading) * -dz > Math.cos(g.T.cone * 0.8);
      const surpriseStun = kind === 'blast' && ['patrol', 'return', 'wait'].includes(beforeHit) && !lookingAtRizer && g.actor.has('stunned');
      const moriDazed = kind === 'blast' && !surpriseStun && g.T.key === 'mori' && (g.actor.has('dazedWalk') || g.actor.has('dazedRun'));
      const base = kind === 'astralift' ? 0.9 : kind === 'thunder' ? 1.3 : kind === 'axe' ? 0.75 : kind === 'kick' || kind === 'blast' ? 0.6 : 0.4; // the axe rocks them longest
      g.state = 'stagger'; g.stag = Math.max(0.16, base * (1 - Math.max(0, g.flurry - 4) * 0.12)); g.lost = 0;
      if (!moriDazed) { g.actor.dazed = false; g.dazed = 0; g.dazedMode = null; }
      if (surpriseStun) {
        // An unaware enemy takes the complete reaction before it can answer.
        // Once the clip ends it has Rizer's position and enters pursuit.
        g.knock.set(0, 0, 0); g.state = 'surprised'; g.lost = 0; g.cool = Math.max(g.cool, 0.5);
        g.actor.play('stunned'); g.timer = g.actor.acts.stunned.getClip().duration;
      }
      else if (kind === 'astralift') g.actor.play('astraliftHit', 1, { hold: true });
      else if (kind === 'thunder' && g.actor.has('shocked')) g.actor.play('shocked', 1, { hold: true }); // electrocuted, then (see shock) they get up // play the full fall and hold its last frame until Standing Up starts
      else if (moriDazed) {
        // Astralstrike scrambles a living Mori for three seconds. It keeps the
        // movement intent it had before the hit, but cannot enter windup/attack.
        g.state = 'dazed'; g.dazed = 3;
        g.dazedMode = beforeHit === 'dazed' && priorDazedMode ? priorDazedMode : ['patrol', 'return', 'wait'].includes(beforeHit) ? beforeHit : 'chase';
        g.actor.release(); g.actor.dazed = true; g.cool = Math.max(g.cool, 3);
      }
      else g.actor.play('hurt');
    }
    for (const o of grunts) if (o !== g && allied(o, g) && alive(o) && Math.hypot(o.pos.x - g.pos.x, o.pos.z - g.pos.z) < (o.squad && o.squad === g.squad ? 30 : g.T.callRadius)) spot(o, 0.3);
    return { x: g.pos.x, y: g.pos.y + 1.6, z: g.pos.z, down: g.hp <= 0, name: g.T.name };
  }

  // Base-level Astralift: a jolt of ground lightning through the legs throws the enemy up and back like light
  // telekinesis — a real arc through the air (LIFT.height up, LIFT.dist back), with Blastback steered so its
  // back hits the ground as they land. Then they lie there and get up (Standing Up), the same recovery as before.
  const LIFT = { height: 2.3, dist: 7, g: 20, from: 0.47, land: 1.0 }; // from/land: Blastback's lift-off and back-hits-the-ground frames
  function astralift(g, from) {
    if (!alive(g)) return null;
    const dx = g.pos.x - from.x, dz = g.pos.z - from.z, d = Math.hypot(dx, dz) || 1;
    return throwBack(g, dx / d, dz / d, LIFT.height, LIFT.dist, Math.atan2(-dx, -dz), 2, 0); // facing Rizer as it throws them back
  }
  // Throw an enemy along (dx, dz) (unit) on a real arc: `height` up, `dist` along, body turned to `heading`,
  // turning `spin` rad more over the flight. Survivors ride Blastback (steered by the flight) and get up after;
  // one it kills is thrown just the same and lands where the arc ends.
  function throwBack(g, dx, dz, height, dist, heading, damage, spin = 0) {
    const hit = hitGrunt(g, damage, dx, dz, 'astralift');
    const vy = Math.sqrt(2 * LIFT.g * height), T = 2 * vy / LIFT.g, v = dist / T;
    g.launch = { vx: dx * v, vz: dz * v, vy, t: 0, T, y: 0, spin };
    g.heading = heading; g.knock.set(0, 0, 0); g.speed = 0;
    if (hit.down) return hit;
    g.state = 'astraliftDown';
    if (g.actor.shot?.kind === 'astraliftHit') { g.actor.shot.t = LIFT.from; g.actor.shot.speed = 0; } // (hitGrunt started Blastback) steer it by the flight
    const dur = g.actor.acts.astraliftHit?.getClip().duration || 1.7;
    g.timer = T + Math.max(0.3, dur - LIFT.land);
    g.cool = Math.max(g.cool, 0.45); g.atk = null;
    return hit;
  }
  // Astralburst: the whole blast radius is thrown back — higher and further than Astralift, and scattered:
  // each body leaves at its own angle off the blast line, its own height and distance (closer = harder),
  // turned a little off-square and twisting through the air, so a crowd flies apart instead of in a ring.
  const BLAST = { height: [3.4, 5.2], dist: [11, 17], spread: 0.6, turn: 0.7, spin: 1.3 };
  function blastBack(g, from, damage, near = 1, tech = 'splash') { // tech: what this counts as if it finishes them (rxp-rewards.js)
    if (!alive(g)) return null;
    g.tech = tech;
    const rx = g.pos.x - from.x, rz = g.pos.z - from.z, d = Math.hypot(rx, rz);
    const base = d > 0.05 ? Math.atan2(rx, rz) : Math.random() * Math.PI * 2, a = base + (Math.random() * 2 - 1) * BLAST.spread;
    const dx = Math.sin(a), dz = Math.cos(a), f = 0.75 + 0.25 * near, r = () => 0.8 + Math.random() * 0.2;
    const height = (BLAST.height[0] + (BLAST.height[1] - BLAST.height[0]) * Math.random()) * f;
    const dist = (BLAST.dist[0] + (BLAST.dist[1] - BLAST.dist[0]) * Math.random()) * f * r();
    const heading = a + Math.PI + (Math.random() * 2 - 1) * BLAST.turn; // roughly back-first, never all square
    const thrown = throwBack(g, dx, dz, height, dist, heading, damage, (Math.random() * 2 - 1) * BLAST.spin); g.tech = null; return thrown;
  }
  // The flight: along the arc, Blastback's airborne frames follow it; on landing it plays out on the ground.
  function flyLaunch(g, dt) {
    const L = g.launch, sh = g.actor.shot;
    L.t = Math.min(L.T, L.t + dt); const k = L.t / L.T;
    g.pos.x += L.vx * dt; g.pos.z += L.vz * dt; L.y = Math.max(0, L.vy * L.t - 0.5 * LIFT.g * L.t * L.t);
    if (L.spin) g.heading += L.spin * dt / L.T;
    if (sh?.kind === 'astraliftHit') { sh.t = LIFT.from + (LIFT.land - LIFT.from) * k; sh.speed = 0; }
    if (k >= 1) { g.launch = null; if (sh?.kind === 'astraliftHit') sh.speed = 1; g.landed = 1; } // back hits the ground
  }

  // Astralthunder: electrocuted where they stand (Being Electrocuted), static crackling over them, then —
  // if they survive — Standing Up, the same recovery as Astralift. Killed outright, they stay down.
  function shock(g, damage, dx = 0, dz = 0, hold = 0) {
    if (!alive(g)) return null;
    const hit = hitGrunt(g, damage, dx, dz, 'thunder');
    const dur = g.actor.acts.shocked?.getClip().duration || 1.4;
    g.shockT = Math.max(3.32, dur); // crackle over the body for the full thunder sound
    if (hit.down) return hit;
    g.state = 'astraliftDown';
    g.timer = Math.max(dur, hold);
    g.cool = Math.max(g.cool, 0.6); g.atk = null; g.bang.visible = false;
    g.knock.set(0, 0, 0); g.speed = 0;
    return hit;
  }

  // Psychosyd's guitar (game.js · startJam): while the solo plays, every Seer and Mori within music.r of Rizer stops
  // what it's doing and dances in place, turned toward him — Mori to Zombie Dance, Seers to one of the dance-pack
  // loops each (the `dance` slot's variants). Hit one and it snaps out of it for the rest of that song.
  let music = null;
  const DANCE_FROM = new Set(['patrol', 'return', 'wait', 'observe', 'alert', 'chase', 'windup', 'attack', 'feedApproach', 'feeding']);
  function setMusic(m) {
    const was = music; music = m;
    if (!m && was) for (const g of grunts) { g.noDance = false; if (g.state === 'dance') endDance(g); }
  }
  function startDance(g) {
    releaseFeed(g);
    g.hostile = hostile(g);
    g.state = 'dance'; g.atk = null; g.bang.visible = false; g.speed = 0; g.knock.set(0, 0, 0);
    const slot = g.actor.has('dance') ? 'dance' : 'emote';
    g.actor.play(slot, 0.9 + Math.random() * 0.25, { loop: true, from: Math.random() * 2 }); // each on its own beat
  }
  function endDance(g) {
    if (g.actor.shot?.kind === 'dance' || g.actor.shot?.kind === 'emote') g.actor.release(g.actor.shot.kind, 0.3);
    g.state = g.hostile ? 'chase' : 'return'; if (!g.hostile) g.wp = nearestWp(g); g.cool = Math.max(g.cool, 0.8);
  }

  // Parried: his blow is turned aside and he reels — the full Stunned React, unable to wind up or attack until it
  // ends (the same 'surprised' state as an unaware Astralstrike), then he comes back at you.
  function stun(g, from) {
    if (!alive(g)) return null;
    releaseFeed(g);
    g.atk = null; g.actor.shot = null; g.bang.visible = false; g.speed = 0; g.state = 'surprised'; g.lost = 0; g.barT = 4;
    if (from) { const dx = g.pos.x - from.x, dz = g.pos.z - from.z, d = Math.hypot(dx, dz) || 1; g.knock.set(dx / d, 0, dz / d).multiplyScalar(2.5); }
    if (g.actor.has('stunned')) { g.actor.play('stunned'); g.timer = g.actor.acts.stunned.getClip().duration; }
    else { g.actor.play('hurt'); g.timer = 1.5; }
    g.cool = Math.max(g.cool, g.timer + 0.4);
    return { x: g.pos.x, y: g.pos.y + 1.6, z: g.pos.z, name: g.T.name };
  }
  // Forget the player (after a knock-out): everyone walks back to their route.
  function standDown() { for (const g of grunts) if (alive(g)) { releaseFeed(g); g.state = 'return'; g.bang.visible = false; g.atk = null; g.wp = nearestWp(g); } }

  let rizerRig = null;
  const tA = new THREE.Vector3(), tB = new THREE.Vector3(), blade = { a: new THREE.Vector3(), b: new THREE.Vector3(), pa: new THREE.Vector3(), pb: new THREE.Vector3(), r: 0.05, vel: 0, live: false };
  // Torso line (hips → chest) of a rig, for body contact and spacing.
  const torsoOf = (rig, a, b) => { const P = rig.parts; a.copy(P.Hips?.a || P.Spine.a); b.copy(P.Spine2?.b || P.Spine1.b); return rig.torso; };
  const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  // hooks: { onPlayerHit(kind, g), onLanded(hit, kind), blade() → { a, b } world segment of the drawn sword or null }
  // Off-screen or far bodies aren't drawn (the skinned meshes skip three's own culling), and only close ones cast shadows.
  let inView = null;
  function castShadows(g, on) { if (g.shadow === on) return; g.shadow = on; g.actor.model.traverse(o => { if (o.isMesh) o.castShadow = on; }); }
  function update(dt, t, rizer, night, hooks = {}) {
    inView = hooks.inView || null;
    const onPlayerHit = typeof hooks === 'function' ? hooks : hooks.onPlayerHit;
    const rp = rizer.position;
    // Once a grunt has spotted Rizer and turned on him, the hunt is relentless: no losing sight of him, no giving up
    // at a distance, no leash to its route. It ends when it dies, when he is knocked out, or when he is in another
    // district than the one it belongs to.
    const rizerDistrict = districtAt(rp.x, rp.z, W), hunted = g => rizer.hp > 0 && rizerDistrict === (g.district ||= districtAt(g.pts[0].x, g.pts[0].y, W));
    const threat = hooks.playerThreat?.() || {};
    const attackers = grunts.filter(g => g.state === 'attack' || g.state === 'windup').length;
    const battleActive = grunts.some(g => alive(g) && hostile(g) && Math.hypot(g.pos.x - rp.x, g.pos.z - rp.z) < 14);
    feedScan -= dt;
    if (feedScan <= 0) { feedScan = 0.4; seekBodies(rizer, battleActive); }
    if (rizer.actor && (!rizerRig || rizerRig.actor !== rizer.actor)) rizerRig = new HitRig(rizer.actor);
    for (const g of grunts) {
      const p = g.pos, dx = rp.x - p.x, dz = rp.z - p.z, dist = Math.hypot(dx, dz), toP = Math.atan2(dx, dz);
      if (dist > WILD.active && (calm(g) || g.state === 'down' || g.state === 'sinking')) { farStep(g, dt, t, dist); continue; }
      if (g.state !== 'down' && g.state !== 'sinking') g.root.visible = dist < 12 || !inView || inView(p);
      castShadows(g, dist < WILD.shadows);
      let want = 0, face = null;
      g.cool = Math.max(0, g.cool - dt); g.evadeCool = Math.max(0, (g.evadeCool || 0) - dt); g.feedRetry = Math.max(0, (g.feedRetry || 0) - dt); g.barT = Math.max(0, g.barT - dt); g.sinceHit = (g.sinceHit ?? 9) + dt;
      if (g.feedTarget && !bodyAvailable(g.feedTarget, rizer)) {
        releaseFeed(g); g.state = 'return'; g.wp = nearestWp(g);
      }
      if (music && alive(g) && !g.noDance && g.state !== 'dance' && DANCE_FROM.has(g.state) && Math.hypot(p.x - music.x, p.z - music.z) < music.r) startDance(g);
      else if (g.state === 'dance' && (!music || !alive(g) || Math.hypot(p.x - music.x, p.z - music.z) > music.r + 4)) endDance(g);
      const seen = alive(g) && g.state !== 'dance' && canSee(g, rizer, night);
      if (g.feedTarget && rizer.hp > 0 && dist < 18 && (seen || battleActive || threat.combat || threat.astral)) {
        releaseFeed(g); g.state = 'return'; g.wp = nearestWp(g); spot(g, 0.15);
      }
      if (g.T.dodge && (g.state === 'chase' || g.state === 'windup') && dist < 12) {
        const threat = (rizer.attack && dist < 4.5 ? rizer.attack : null) || hooks.projectileThreat?.(g);
        if (threat && threat !== g.evadeThreat) {
          g.evadeThreat = threat;
          if (g.evadeCool <= 0 && Math.random() < g.T.dodge.chance) {
            g.state = 'evade'; g.timer = g.T.dodge.duration; g.atk = null; g.speed = 0;
            g.evadeSide = g.side; g.side *= -1; g.evadeCool = rand(g.T.dodge.cooldown);
            g.actor.play(g.actor.has('dodge') ? 'dodge' : 'hurt', g.T.key === 'daemon-black' ? 1.1 : 0.9);
          }
        }
      }
      // Seers are neutral observers until Rizer makes the choice: combat in
      // their sight, any nearby Astral display, loud traversal, or a fight with
      // another pact turns the handler and its Mori hostile together.
      if (g.T.key === 'seer' && calm(g)) {
        const provoked = (threat.combat && seen && dist < 20) || (threat.astral && dist < 18) || (threat.loud && dist < 10) || (battleActive && seen && dist < 22);
        if (provoked) spot(g, 0.18);
      }
      switch (g.state) {
        case 'patrol': case 'return': {
          if (g.T.key === 'seer' && seen && dist < 12) { g.state = 'observe'; g.observeLost = 0; break; }
          if (herded(g)) { // a pack Mori: keep to its place behind the handler
            formation(g, _f); const tx = _f.x - p.x, tz = _f.z - p.z, d = Math.hypot(tx, tz);
            if (d > 0.7) { face = Math.atan2(tx, tz); want = Math.min(g.T.run * 0.6, g.walk * (d > 3 ? 1.6 : 1.05)); } else face = g.leader.heading;
            if (g.state === 'return' && d < 2) g.state = 'patrol';
            break;
          }
          if (seen && g.T.key !== 'seer') { spot(g); break; }
          const tgt = g.pts[g.wp], tx = tgt.x - p.x, tz = tgt.y - p.z;
          if (Math.hypot(tx, tz) < 0.9) { nextWp(g); break; }
          face = Math.atan2(tx, tz); want = g.state === 'return' ? g.walk * 1.2 : g.walk; break;
        }
        case 'wait':
          g.timer -= dt; face = g.heading + Math.sin(t * 0.9 + p.x) * dt * 0.8; // scanning
          if (g.T.key === 'seer' && seen && dist < 12) { g.state = 'observe'; g.observeLost = 0; }
          else if (seen && g.T.key !== 'seer' && !g.leader) spot(g); else if (g.timer <= 0) g.state = 'patrol';
          break;
        case 'observe':
          // Neutral PvP read: stop, face Rizer and wait for his decision.
          face = toP; want = 0; g.observeLost = seen && dist < 15 ? 0 : g.observeLost + dt;
          if (g.observeLost > 1.5 || dist > 18) { g.state = 'return'; g.wp = nearestWp(g); g.observeLost = 0; }
          break;
        case 'alert':
          face = toP; g.timer -= dt;
          if (g.timer <= 0) {
            g.state = 'chase'; g.bang.visible = false;
            for (const o of grunts) if (o !== g && allied(o, g) && Math.hypot(o.pos.x - p.x, o.pos.z - p.z) < (o.squad && o.squad === g.squad ? 30 : g.T.callRadius)) spot(o, 0.35 + Math.random() * 0.3);
          }
          break;
        case 'chase': {
          g.lost = seen ? 0 : g.lost + dt; face = toP;
          if (!hunted(g)) { g.state = 'return'; g.wp = nearestWp(g); break; }
          const canAttack = g.cool <= 0 && attackers < g.T.maxAttackers;
          const bite = canFeed(g) && g.actor.has('bite') && Math.random() < 0.14;
          const kind = g.next ||= bite ? 'bite' : Math.random() < g.T.punch.weight ? 'punch' : 'kick', close = g.T[kind].range + 0.15;
          if (dist > close) {
            want = !canAttack && dist < g.T.hold ? 0 : g.T.run * (dist < 6 ? 0.55 : 1);
            if (attackers >= 1 && dist < 6 && dist > close + 0.6) face = toP + 0.55 * g.side; // someone's already on him: work round to his side
          }
          else if (canAttack) { g.state = 'windup'; g.timer = rand(g.T.windup); }
          else if (dist < close - 0.35) want = -g.T.walk * 0.6; // too close while waiting a turn: back off a step
          break;
        }
        case 'windup': // square up, then go
          face = toP; g.timer -= dt;
          if (rizer.hp <= 0) { g.state = 'chase'; break; }
          if (dist > g.T[g.next || 'punch'].range + 0.9) { g.state = 'chase'; break; } // you backed off: follow
          if (g.timer <= 0) { const kind = g.next || 'punch'; g.next = null; startStage(g, kind, 1, kind === 'bite' ? 1 : pickCombo(g.T)); if (g.T.key === 'daemon-red') hooks.onDaemonAttack?.(g); }
          break;
        case 'feedApproach': {
          const target = g.feedTarget === rizer ? rizer.position : g.feedTarget?.pos;
          if (!target) { releaseFeed(g); g.state = 'return'; break; }
          const tx = target.x - p.x, tz = target.z - p.z, d = Math.hypot(tx, tz);
          face = Math.atan2(tx, tz);
          if (d > 1.22) { want = g.feedTarget === rizer && d > 2.8 ? g.T.run * 0.8 : g.T.walk * (d < 3.5 ? 0.75 : 1.15); g.actor.crawling = d < 2.8; }
          else {
            want = 0; g.speed = 0; g.actor.crawling = false;
            if (g.actor.play('feedBody')) { g.state = 'feeding'; g.timer = g.actor.acts.feedBody.getClip().duration; }
            else { releaseFeed(g); g.state = 'return'; g.feedRetry = 5; }
          }
          break;
        }
        case 'feeding':
          want = 0; g.speed = 0; g.actor.crawling = false;
          if (g.feedTarget) { const target = g.feedTarget === rizer ? rizer.position : g.feedTarget.pos; face = Math.atan2(target.x - p.x, target.z - p.z); }
          g.timer -= dt;
          if (g.timer <= 0) {
            if (g.feedTarget && g.feedTarget !== rizer) fedBodies.add(g.feedTarget);
            releaseFeed(g); g.state = 'return'; g.wp = nearestWp(g); g.feedRetry = 3;
          }
          break;
        case 'evade':
          face = toP; want = 0; g.timer -= dt;
          if (g.timer <= 0) { g.state = 'chase'; g.cool = Math.max(g.cool, 0.2); }
          break;
        case 'attack': {
          const a = g.atk; a.t += dt;
          // slow to re-aim mid-swing; a little forward drive in the first part of each blow
          g.heading = dampAngle(g.heading, toP, 1, dt * g.T.turnRate);
          if (a.t < a.drive && dist > g.T[a.kind].range * 0.7) want = 1.6;
          const last = a.hits[a.hits.length - 1] / g.T.clipSpeed;
          if (a.stage < a.plan && a.t >= last + COMBAT.comboCancel + 0.04) {
            // continue the chain if you're still there (or, sometimes, swing at where you were)
            if (rizer.hp > 0 && (dist < g.T[a.kind].range + 0.7 || Math.random() < g.T.whiff)) { startStage(g, a.kind, a.stage + 1, a.plan); break; }
            a.plan = a.stage;
          }
          if (a.t >= a.recover / g.T.clipSpeed) { g.state = 'chase'; g.atk = null; g.cool = rand(g.T.cooldown); }
          break;
        }
        case 'stagger':
          g.stag -= dt;
          if (g.stag <= 0) {
            // shaken off a long string of hits with you right there: swing back straight away
            if (g.flurry >= 5 && dist < g.T.punch.range + 0.3 && rizer.hp > 0 && attackers < g.T.maxAttackers && Math.random() < 0.6) { g.next = 'punch'; g.state = 'windup'; g.timer = 0.1; g.flurry = 0; }
            else { g.state = 'chase'; g.cool = Math.max(g.cool, 0.4); }
          }
          break;
        case 'surprised':
          // Full-body surprise reaction: stationary, unable to wind up or attack.
          g.timer -= dt; want = 0;
          if (g.timer <= 0) { g.state = 'chase'; g.lost = 0; g.cool = Math.max(g.cool, 0.45); }
          break;
        case 'dazed': {
          g.dazed -= dt;
          if (g.dazed <= 0) {
            g.actor.dazed = false;
            g.state = g.dazedMode === 'return' ? 'return' : g.dazedMode === 'patrol' || g.dazedMode === 'wait' ? g.dazedMode : 'chase';
            g.cool = Math.max(g.cool, 0.45); g.dazedMode = null;
            break;
          }
          if (g.dazedMode === 'chase') {
            g.lost = seen ? 0 : g.lost + dt; face = toP;
            if (!hunted(g)) g.dazedMode = 'return';
            else {
              const close = g.T[g.next || 'punch'].range + 0.15;
              if (dist > close) want = g.T.run * (dist < 6 ? 0.55 : 1);
              else if (dist < close - 0.35) want = -g.T.walk * 0.45;
            }
          } else if (herded(g)) {
            formation(g, _f); const tx = _f.x - p.x, tz = _f.z - p.z, d = Math.hypot(tx, tz);
            if (d > 0.7) { face = Math.atan2(tx, tz); want = Math.min(g.T.run * 0.6, g.walk * (d > 3 ? 1.6 : 1.05)); } else face = g.leader.heading;
          } else if (g.dazedMode === 'wait') {
            face = g.heading + Math.sin(t * 0.9 + p.x) * dt * 0.8;
          } else {
            const tgt = g.pts[g.wp], tx = tgt.x - p.x, tz = tgt.y - p.z;
            if (Math.hypot(tx, tz) < 0.9) { g.wp = (g.wp + 1) % g.pts.length; }
            else { face = Math.atan2(tx, tz); want = g.dazedMode === 'return' ? g.walk * 1.2 : g.walk; }
          }
          break;
        }
        case 'dance': // in the music's thrall: dancing in place, turned toward the guitar
          face = toP; want = 0;
          if (!/^(dance|emote)$/.test(g.actor.shot?.kind || '')) g.actor.play(g.actor.has('dance') ? 'dance' : 'emote', 1, { loop: true });
          break;
        case 'astraliftDown':
          if (g.launch) flyLaunch(g, dt);
          g.timer -= dt;
          if (g.timer <= 0) {
            // Keep Blastback's fallen pose until the real Standing Up clip is
            // ready; never let locomotion supply a generic recovery pose.
            if (g.actor.playAligned('standup', 'head') && g.actor.shot?.kind === 'standup') {
              g.state = 'gettingUp';
              const recovery = g.actor.shot;
              g.timer = (recovery.dur - recovery.t) / Math.abs(recovery.speed || 1);
            } else g.timer = 0.1;
          }
          break;
        case 'gettingUp':
          g.timer -= dt;
          if (g.timer <= 0) { g.state = 'chase'; g.cool = Math.max(g.cool, 0.45); }
          break;
        case 'down':
          if (g.launch) { flyLaunch(g, dt); world.resolve(p, g.T.radius); p.y = world.groundAt(p.x, p.z, p.y + 0.5) + (g.launch?.y || 0); } // thrown by the blast that finished them
          // Hold the final death pose indefinitely until the player takes the bag.
          g.fall += dt;
          break;
        case 'sinking':
          g.sink += dt; g.timer -= dt;
          if (g.sink >= 1.5 && g.timer <= 0 && dist > 25) reset(g);
          break;
      }
      // movement
      g.actor.fighting = (g.T.key === 'seer' || g.T.family === 'daemon') && (g.state === 'observe' || g.state === 'alert' || g.state === 'chase' || g.state === 'windup');
      if (g.avoidT > 0 && face !== null) { face += g.avoidTurn || g.side * 0.9; g.avoidT = Math.max(0, g.avoidT - dt); }
      if (face !== null && g.state !== 'down' && g.state !== 'sinking') g.heading = dampAngle(g.heading, face, g.state === 'chase' ? 7 : 3.5, dt);
      const recovering = g.state === 'astraliftDown' || g.state === 'gettingUp';
      if (recovering) { g.speed = 0; g.knock.set(0, 0, 0); }
      else g.speed = damp(g.speed, want, want > g.speed ? 6 : 9, dt);
      if (g.state !== 'down' && g.state !== 'sinking') {
        const oldX = p.x, oldZ = p.z;
        const evadeV = g.state === 'evade' ? g.T.dodge.distance / g.T.dodge.duration * g.evadeSide : 0;
        const nx = p.x + Math.sin(g.heading) * g.speed * dt + Math.cos(g.heading) * evadeV * dt + g.knock.x * dt,
          nz = p.z + Math.cos(g.heading) * g.speed * dt - Math.sin(g.heading) * evadeV * dt + g.knock.z * dt;
        g.knock.multiplyScalar(Math.exp(-7 * dt));
        if (world.waterAt(nx, nz) < world.heightAt(nx, nz) - 0.1) { p.x = nx; p.z = nz; } else if (g.state === 'patrol') g.wp = nearestWp(g);
        world.resolve(p, g.T.radius);
        world.keepOnLand?.(p, oldX, oldZ);
        const B = world.bound; p.x = clamp(p.x, -B, B); p.z = clamp(p.z, -B, B);
        p.y = world.groundAt(p.x, p.z, p.y + 0.5) + (g.launch?.y || 0);
        const moved = Math.hypot(p.x - oldX, p.z - oldZ), trying = Math.abs(want) > 0.35 && !recovering;
        g.stuck = trying && moved < Math.abs(want) * dt * 0.14 ? g.stuck + dt : Math.max(0, g.stuck - dt * 3);
        if (g.stuck > 0.55) {
          // Do not animate forever into a tree/building. Turn around the solid
          // surface; pack Mori also rotate their formation slot to an open side.
          g.avoidT = 0.8; g.avoidTurn = g.side * (0.75 + Math.random() * 0.55); g.speed = 0; g.stuck = 0; g.side *= -1;
          if (g.state === 'feedApproach') { releaseFeed(g); g.state = 'return'; g.feedRetry = 5; g.wp = nearestWp(g); }
          else if (g.leader && g.slot) g.slot.ang += g.avoidTurn * 0.7;
          else if (g.state === 'patrol' || g.state === 'return') g.wp = (g.wp + 1) % g.pts.length;
        }
      }
      // body
      g.root.position.copy(p); g.root.rotation.y = g.heading;
      g.actor.update(dt, g.state === 'down' || g.state === 'sinking' ? 0 : Math.abs(g.speed) + Math.hypot(g.knock.x, g.knock.z) * 0.2, true);
      const pv = g.actor.pivot;
      g.lootBag.position.set(g.pos.x, g.pos.y + 0.18 + Math.sin(t * 2.2 + g.pos.x) * 0.04, g.pos.z);
      g.lootBag.rotation.y = t * 0.35;
      if (g.state === 'down' || g.state === 'sinking') {
        // Sample along the fallen body's length and width. Head, torso and feet
        // share the same ground plane on hills instead of clipping through it.
        const f = g.heading, fx = Math.sin(f), fz = Math.cos(f), lx = Math.cos(f), lz = -Math.sin(f);
        const h = (x, z) => world.groundAt(x, z, p.y + 1.5);
        const tx = Math.atan2(h(p.x + fx * 0.9, p.z + fz * 0.9) - h(p.x - fx * 0.9, p.z - fz * 0.9), 1.8);
        const tz = Math.atan2(h(p.x + lx * 0.42, p.z + lz * 0.42) - h(p.x - lx * 0.42, p.z - lz * 0.42), 0.84);
        g.lieTilt ||= { x: 0, z: 0 };
        g.lieTilt.x = damp(g.lieTilt.x, clamp(tx, -0.62, 0.62), 9, dt);
        g.lieTilt.z = damp(g.lieTilt.z, clamp(tz, -0.52, 0.52), 9, dt);
        pv.rotation.x = (g.actor.has('knockdown') ? 0 : -Math.min(1, g.fall / 0.45) * 1.45) - g.lieTilt.x;
        pv.rotation.z = g.lieTilt.z;
        pv.position.y = g.state === 'sinking' ? 0.08 - Math.min(1.5, g.sink) : 0.08;
        g.root.visible = g.state !== 'sinking' || g.sink < 1.5; g.bar.visible = false; g.bang.visible = false;
      } else {
        pv.rotation.x = damp(pv.rotation.x, g.state === 'stagger' && !g.actor.has('hurt') ? -0.35 : 0, 12, dt);
        pv.rotation.z = damp(pv.rotation.z, 0, 12, dt);
        g.bar.visible = g.barT > 0 || g.state === 'chase' || g.state === 'attack' || g.state === 'windup' || g.state === 'dazed' || g.state === 'surprised';
        if (g.bar.visible && !g.bar.drawn) { g.bar.redraw(g.hp / g.T.hp); g.bar.drawn = true; }
        g.bang.position.y = 3.25 + Math.sin(t * 8) * 0.05;
      }
    }
    contacts(dt, rizer, hooks, onPlayerHit);
  }

  const herded = g => g.leader && alive(g.leader) && calm(g.leader);
  function nextWp(g) {
    if (g.state === 'return') g.state = 'patrol';
    g.state = 'wait'; g.timer = 1.2 + Math.random() * 1.6;
    if (g.loop) g.wp = (g.wp + 1) % g.pts.length;
    else { if (g.wp + g.dir < 0 || g.wp + g.dir >= g.pts.length) g.dir *= -1; g.wp = clamp(g.wp + g.dir, 0, g.pts.length - 1); }
  }
  // Far from Rizer: a cheap patrol (no sight checks, no collision), animated every third
  // frame while in view and hidden beyond it. Anything that has noticed him stays on full AI.
  function farStep(g, dt, t, dist) {
    const p = g.pos; g.bang.visible = false; g.bar.visible = false; g.knock.set(0, 0, 0);
    if (g.state === 'sinking') { g.sink += dt; g.timer -= dt; if (g.sink >= 1.5 && g.timer <= 0) reset(g); }
    else if (g.state !== 'down') {
      let tx = p.x, tz = p.z, spd = 0;
      if (herded(g)) { formation(g, _f); tx = _f.x; tz = _f.z; if (Math.hypot(tx - p.x, tz - p.z) > 0.7) spd = g.walk * 1.3; }
      else if (g.state === 'wait') { g.timer -= dt; if (g.timer <= 0) g.state = 'patrol'; }
      else { const w = g.pts[g.wp]; tx = w.x; tz = w.y; if (Math.hypot(tx - p.x, tz - p.z) < 0.9) nextWp(g); else spd = g.state === 'return' ? g.walk * 1.2 : g.walk; }
      g.speed = spd;
      if (spd > 0) { g.heading = Math.atan2(tx - p.x, tz - p.z); p.x += Math.sin(g.heading) * spd * dt; p.z += Math.cos(g.heading) * spd * dt; }
    }
    const show = dist < WILD.visible && g.state !== 'sinking' && (!inView || inView(p));
    castShadows(g, false);
    g.root.visible = show; g.lootBag.visible = show && g.state === 'down' && !g.looted;
    g.frame++;
    if (!show) { g.animAcc = 0; return; }
    if (g.speed > 0 || g.frame % 20 === 0) p.y = world.groundAt(p.x, p.z, p.y + 0.5);
    g.root.position.copy(p); g.root.rotation.y = g.heading;
    g.animAcc += dt;
    if (g.frame % 3 === 0) { g.actor.update(g.animAcc, g.state === 'down' ? 0 : g.speed, true); g.animAcc = 0; }
    if (g.lootBag.visible) g.lootBag.position.set(p.x, p.y + 0.18, p.z);
  }

  function startStage(g, kind, stage, plan) {
    const slot = stage === 1 ? kind : kind + stage, use = g.actor.has(slot) ? slot : kind, T = g.actor.timing(use);
    g.state = 'attack';
    const hits = kind === 'bite' ? [T.dur * 0.55] : T.hits;
    g.atk = { kind, slot: use, stage, plan, t: 0, hits, recover: T.recover, drive: hits[0] / g.T.clipSpeed * 0.8, done: new Set() };
    g.actor.play(use, g.T.clipSpeed);
  }
  // Is `t` inside a contact window of this strike? Returns the window's index or -1.
  const windowAt = (hits, t, spd) => { for (let i = 0; i < hits.length; i++) { const h = hits[i] / spd; if (t >= h - HITBOX.windowBefore && t <= h + HITBOX.windowAfter) return i; } return -1; };
  const strikers = (rig, kind) => (STRIKERS[kind] || STRIKERS.punch).map(k => rig.parts[k]).filter(q => q && q.vel >= (kind === 'bite' ? 1.1 : HITBOX.minSpeed));

  // Bodies, blows and the strike assist — everything that needs real shapes.
  let ghost = null, clock = 0; // the blow that killed its target (see "The target died earlier" below)
  function contacts(dt, rizer, hooks, onPlayerHit) {
    clock += dt;
    const rp = rizer.position, near = [];
    for (const g of grunts) {
      if (alive(g) && g.root.visible && Math.hypot(g.pos.x - rp.x, g.pos.z - rp.z) < 9) { g.rig.update(dt); near.push(g); }
      else g.rig.fresh = true;
    }
    if (!rizerRig || rizer.hp <= 0 && !near.length) return;
    rizerRig.update(dt);
    const rT = torsoOf(rizerRig, tA, tB), ra = tA.clone(), rb = tB.clone();

    // 1 · bodies: torsos can't overlap; the shove is shared (grunts are a bit heavier when planted)
    for (let i = 0; i < near.length; i++) {
      const g = near[i], gT = torsoOf(g.rig, tA, tB);
      if (rizer.hp > 0 && !rizer.inVehicle) {
        const d = segSeg(ra, rb, tA, tB, _ca, _cb), min = rT + gT + HITBOX.bodyGap, fd = flat(_ca, _cb);
        if (fd < min && Math.abs(_ca.y - _cb.y) < min + 0.6) {
          const nx = fd > 1e-4 ? (_cb.x - _ca.x) / fd : Math.sin(rizer.facing), nz = fd > 1e-4 ? (_cb.z - _ca.z) / fd : Math.cos(rizer.facing), push = min - fd;
          g.pos.x += nx * push * 0.55; g.pos.z += nz * push * 0.55; rp.x -= nx * push * 0.45; rp.z -= nz * push * 0.45;
          world.resolve(g.pos, g.T.radius);
        }
      }
      for (let j = i + 1; j < near.length; j++) {
        const o = near[j]; const oa = _oa, ob = _ob; torsoOf(o.rig, oa, ob);
        segSeg(tA, tB, oa, ob, _ca, _cb); const min = gT + o.rig.torso + HITBOX.bodyGap + 0.15, fd = flat(_ca, _cb);
        if (fd < min) { const nx = fd > 1e-4 ? (_cb.x - _ca.x) / fd : 1, nz = fd > 1e-4 ? (_cb.z - _ca.z) / fd : 0, push = (min - fd) * 0.5; o.pos.x += nx * push; o.pos.z += nz * push; g.pos.x -= nx * push; g.pos.z -= nz * push; }
      }
      g.root.position.copy(g.pos);
    }

    // 2 · Rizer's blows: the swinging limb (or blade) has to touch a Seer's body
    if (rizer.inVehicle) return; // vehicle contact and run-over damage are resolved by the vehicle controller
    const at = rizer.attack;
    if (at && rizer.hp > 0) {
      const spd = at.spd || COMBAT[at.kind]?.speed || 1;
      if (!at.assist) { // aim assist: a swing carries him onto a Seer just out of reach in front
        at.assist = true; const A = SEER.assist; let best = null, bd = Infinity;
        for (const g of near) {
          const dx = g.pos.x - rp.x, dz = g.pos.z - rp.z, d = Math.hypot(dx, dz);
          const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - rizer.facing), Math.cos(Math.atan2(dx, dz) - rizer.facing)));
          if (d < A.range && off < A.arc && d < bd) { bd = d; best = g; }
        }
        at.target = best;
      }
      const tg = at.target;
      if (tg && alive(tg) && (at.t < SEER.assist.time || at.hits.some(h => at.t > h / spd - 0.3 && at.t < h / spd - 0.02))) { // before each blow of a multi-hit clip too
        const dx = tg.pos.x - rp.x, dz = tg.pos.z - rp.z, d = Math.hypot(dx, dz), want = SEER.assist.contact[at.kind] || 0.8;
        rizer.facing = dampAngle(rizer.facing, Math.atan2(dx, dz), 18, dt);
        if (d > want) { const step = Math.min(SEER.assist.speed * dt, d - want); rp.x += dx / d * step; rp.z += dz / d * step; }
      }
      // The kick-up's final inverted leg swing travels with the running body.
      // Keep its contact phase open through the full leg arc, then use a swept
      // foot capsule so that the last kick cannot skip a foe between frames.
      const w = at.kind === 'kickup' ? (at.t * spd >= 0.46 && at.t * spd <= 1.0 ? 0 : -1) : windowAt(at.hits, at.t, spd);
      // The target died earlier in this clip: its remaining contact frames still land (sound, haptics), so a
      // multi-hit blow never goes silent halfway through.
      // The same goes for the rest of the combo he is already chaining. With another enemy still in reach the real
      // contacts speak for themselves.
      if (ghost && clock - ghost.t > 1.2) ghost = null; // he stopped swinging: the chain ended
      if (w >= 0 && ghost && (at !== ghost.at || w > ghost.w) && at.t >= at.hits[w] / spd && !(at.done ||= new Set()).has('ghost:' + w)
          && !near.some(g => alive(g) && Math.hypot(g.pos.x - rp.x, g.pos.z - rp.z) < 3)) {
        at.done.add('ghost:' + w); ghost.t = clock;
        hooks.onLanded?.({ x: ghost.x, y: ghost.y, z: ghost.z, down: false, ghost: true, name: ghost.name }, at.kind, null);
      }
      if (w >= 0) {
        const list = strikers(rizerRig, at.kind);
        if (BLADES[at.kind]) { const bl = hooks.blade?.(); if (bl) { blade.r = bl.r ?? 0.05; blade.pa.copy(blade.live ? blade.a : bl.a); blade.pb.copy(blade.live ? blade.b : bl.b); blade.a.copy(bl.a); blade.b.copy(bl.b); blade.vel = dt > 0 ? blade.b.distanceTo(blade.pb) / dt : 0; blade.live = true; if (blade.vel >= HITBOX.minSpeed) list.push(blade); } }
        const stageMul = (COMBAT.comboDamage[at.stage - 1] || 1) / Math.max(1, at.hits.length) * (at.od?.damage || 1), base = COMBAT[at.kind]?.damage || 1; // a multi-hit clip splits its stage's damage across its blows
        at.stoneAttackId ||= `${Date.now()}-${Math.random()}`;
        const stoneHitKey = `${at.stoneAttackId}:${w}`;
        for (const s of list) hooks.onEnvironmentHit?.(s, at, base * stageMul, stoneHitKey);
        for (const g of near) {
          const key = w + ':' + g.id; if ((at.done ||= new Set()).has(key) || !alive(g)) continue;
          let hit = null; for (const s of list) { hit = touch(s, g.rig, _hit, at.kind === 'kickup') && { ..._hit, s }; if (hit) break; }
          if (!hit) continue;
          at.done.add(key);
          const kx = hit.at.x - ra.x, kz = hit.at.z - ra.z, kd = Math.hypot(kx, kz) || 1;
          const fin = at.stage >= rizer.comboMax(at.kind) && w === at.hits.length - 1; // mid-combo blows rock them; the finisher's last blow sends them
          const r = hitGrunt(g, base * stageMul, kx / kd, kz / kd, at.kind, (fin ? 1.3 : 0.6) * (at.od?.power || 1) * (0.8 + 0.4 * Math.min(1, hit.s.vel / 8)));
          hooks.onLanded?.({ ...r, x: hit.at.x, y: hit.at.y, z: hit.at.z, part: hit.part }, at.kind, g);
          if (r.down) ghost = { at, w, x: hit.at.x, y: hit.at.y, z: hit.at.z, name: r.name, t: clock };
        }
      } else blade.live = false;
    } else blade.live = false;

    // 3 · Seers' blows: same rule, against Rizer's body
    for (const g of near) {
      const a = g.atk; if (g.state !== 'attack' || !a || rizer.hp <= 0) continue;
      const w = windowAt(a.hits, a.t, g.T.clipSpeed); if (w < 0 || a.done.has(w)) continue;
      for (const s of strikers(g.rig, a.kind)) {
        if (!touch(s, rizerRig, _hit)) continue;
        a.done.add(w);
        const dmg = g.T[a.kind].damage * (g.T.comboDamage[a.stage - 1] || 1) / Math.max(1, a.hits.length);
        if (rizer.hurt(dmg, g.pos, g)) onPlayerHit?.(a.kind, g, _hit.at.clone(), dmg);
        break;
      }
    }
  }
  const _ca = new THREE.Vector3(), _cb = new THREE.Vector3(), _oa = new THREE.Vector3(), _ob = new THREE.Vector3(), _hit = {};

  return {
    grunts, update, playerStrike, hitGrunt, stun, setMusic, get dancing() { return grunts.filter(g => g.state === 'dance').length; }, astralift, blastBack, shock, standDown, alive,
    spawnAt(key, x, z) {
      const kind = byKey[key];
      if (!kind?.gltf || !onLand(x, z)) return null;
      const pts = [new THREE.Vector2(x, z)];
      for (const [dx, dz] of [[3, 0], [3, 3], [0, 3]]) if (onLand(x + dx, z + dz)) pts.push(new THREE.Vector2(x + dx, z + dz));
      return spawn(kind.T, kind.gltf, { id: `dev-${key}-${grunts.length}`, loop: true, pts });
    },
    collectLoot: target => {
      const g = target?.enemy;
      if (!g || g.state !== 'down' || g.looted) return null;
      const eater = feedClaims.get(g); if (eater) { releaseFeed(eater); eater.state = 'return'; eater.wp = nearestWp(eater); }
      g.looted = true; g.lootBag.visible = false; g.state = 'sinking'; g.sink = 0; g.timer = g.T.respawn;
      const index = world.interactables.indexOf(g.drop); if (index >= 0) world.interactables.splice(index, 1);
      return { currency: 'coins', amount: rollEnemyBag(g.T), enemy: g.T.name };
    },
    inCombat: pos => grunts.some(g => alive(g) && ['alert', 'chase', 'windup', 'attack', 'evade', 'stagger', 'dazed', 'surprised', 'astraliftDown', 'gettingUp'].includes(g.state) && Math.hypot(g.pos.x - pos.x, g.pos.z - pos.z) < 18),
    respawnAll: () => grunts.forEach(reset),
    get defeated() { return defeated; }, get total() { return grunts.length; }, set onDefeated(f) { onDefeated = f; },
    // Only a fight close to Rizer counts: a grunt alerted across the map must not hide the door and chest prompts.
    engagedNear(p, r = 20) { return grunts.some(g => (g.state === 'chase' || g.state === 'attack' || g.state === 'windup' || g.state === 'evade' || g.state === 'alert' || g.state === 'stagger' || g.state === 'dazed' || g.state === 'surprised' || g.state === 'astraliftDown' || g.state === 'gettingUp') && Math.hypot(g.pos.x - p.x, g.pos.z - p.z) < r); },
    get engaged() { return grunts.some(g => g.state === 'chase' || g.state === 'attack' || g.state === 'windup' || g.state === 'evade' || g.state === 'alert' || g.state === 'stagger' || g.state === 'dazed' || g.state === 'surprised' || g.state === 'astraliftDown' || g.state === 'gettingUp'); },
    get rizerRig() { return rizerRig; }
  };
}
