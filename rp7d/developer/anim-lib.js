// Animation library + retargeting + per-actor slot assignments.
//
// Clips come from three places:
//   · built-in  — the five clips baked into each character GLB (Idle/Walk/Run/Punch/Kick)
//   · library   — files listed in assets/anims/library.js (committed, shared by everyone)
//   · dropped   — FBX/GLB files dragged onto the playtest (kept in this browser only)
// Any clip can be retargeted onto any actor that uses Mixamo bone names. The
// retarget works in world space against each skeleton's own rest pose, so a clip
// made on the T-pose Rizer plays correctly on the arms-down game rig (and on the
// Seer / Elzoran, which share that rig).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import LIBRARY from './assets/anims/library.js';
import DEFAULT_ASSIGNMENTS from './anim-assignments.js';

// Every slot an actor can fill. `kind` decides how the actor drives it.
export const SLOTS = [
  { key: 'plantTree', label: 'Plant tree seeds', kind: 'oneshot' },
  { key: 'ladderClimb', label: 'Treehouse ladder climb / descent', kind: 'state' },
  { key: 'idle', label: 'Idle', kind: 'state' },
  { key: 'walk', label: 'Walk', kind: 'locomotion' },
  { key: 'run', label: 'Run', kind: 'locomotion' },
  { key: 'stairWalkUp', label: 'Walk up stairs', kind: 'locomotion' },
  { key: 'stairRunUp', label: 'Run up stairs', kind: 'locomotion' },
  { key: 'stairWalkDown', label: 'Walk down stairs', kind: 'locomotion' },
  { key: 'stairRunDown', label: 'Run down stairs', kind: 'locomotion' },
  { key: 'turn', label: 'Turn 180° (joystick reversal)', kind: 'oneshot' },
  { key: 'astralift', label: 'Astralift (locked target)', kind: 'oneshot' },
  { key: 'astraliftHit', label: 'Astralift hit reaction', kind: 'oneshot' },
  { key: 'standup', label: 'Enemy stand up', kind: 'oneshot' },
  { key: 'shocked', label: 'Enemy electrocuted (Astralthunder)', kind: 'oneshot' },
  { key: 'tornadoWobble', label: 'Enemy tornado · wobbling', kind: 'state' },
  { key: 'tornadoFloat', label: 'Enemy tornado · floating', kind: 'state' },
  { key: 'dazedWalk', label: 'Enemy dazed walk (Astralstrike)', kind: 'locomotion' },
  { key: 'dazedRun', label: 'Enemy dazed run (Astralstrike)', kind: 'locomotion' },
  { key: 'crawl', label: 'Mori / Daemon crawl', kind: 'locomotion' },
  { key: 'stunned', label: 'Enemy surprise stun (unaware Astralstrike)', kind: 'oneshot' },
  { key: 'bite', label: 'Mori / Daemon neck bite', kind: 'oneshot' },
  { key: 'feedBody', label: 'Mori / Daemon feed at fallen body', kind: 'oneshot' },
  { key: 'fight', label: 'Combat stance', kind: 'state' },
  { key: 'heavyFight', label: 'Heavy weapon · combat stance (axe, longswords)', kind: 'state' },
  { key: 'guitarPlay', label: 'Guitar playing', kind: 'state' },
  { key: 'craft', label: 'Crafting (set up the Stargazer Telescope)', kind: 'oneshot' },
  // RIFLE_HUMANOID: one rifle set for every rifle-carrying humanoid (Nova Guardian, Rizer). Empty slots fall back to
  // the ordinary clips and the rifle rig holds the weapon (thardin-rifle.js RIFLE_PROFILE).
  { key: 'pullStart', label: 'Furniture · pull heavy object · start', kind: 'oneshot' },
  { key: 'pullMove', label: 'Furniture · pull heavy object · moving', kind: 'state' },
  { key: 'pullStop', label: 'Furniture · pull heavy object · stop', kind: 'oneshot' },
  // Universal chair set (INTERACTIVE_SEAT): any compatible humanoid sits, rests, types and stands with these.
  { key: 'chairSit', label: 'Chair · sit down (its last frame is the seated pose)', kind: 'oneshot' },
  { key: 'chairStand', label: 'Chair · stand up', kind: 'oneshot' },
  { key: 'chairToType', label: 'Chair · lean in to type', kind: 'oneshot' },
  { key: 'chairFromType', label: 'Chair · lean back from typing', kind: 'oneshot' },
  { key: 'chairTyping', label: 'Chair · typing at a keyboard', kind: 'state' },
  { key: 'heavyRun', label: 'Heavy weapon · run (axe, longswords)', kind: 'locomotion' },
  { key: 'rifleIdle', label: 'Rifle · idle', kind: 'state' },
  { key: 'rifleAim', label: 'Rifle · aim', kind: 'state' },
  { key: 'rifleFire', label: 'Rifle · fire', kind: 'oneshot' },
  { key: 'rifleWalk', label: 'Rifle · walk', kind: 'locomotion' },
  { key: 'rifleRun', label: 'Rifle · run', kind: 'locomotion' },
  { key: 'rifleAimWalk', label: 'Rifle · walk while aiming', kind: 'locomotion' },
  { key: 'rifleBack', label: 'Rifle · walk backward', kind: 'locomotion' },
  { key: 'rifleStrafeL', label: 'Rifle · run left', kind: 'locomotion' },
  { key: 'rifleStrafeR', label: 'Rifle · run right', kind: 'locomotion' },
  { key: 'rifleStart', label: 'Rifle · start run', kind: 'oneshot' },
  { key: 'rifleJump', label: 'Rifle · jump', kind: 'air' },
  { key: 'rifleCrouch', label: 'Rifle · crouched aim', kind: 'state' },
  { key: 'rifleKneel', label: 'Rifle · aim to kneel', kind: 'oneshot' },
  { key: 'drawBlaster', label: 'Rifle · take from the back', kind: 'oneshot' },
  { key: 'sheatheBlaster', label: 'Rifle · put on the back', kind: 'oneshot' },
  { key: 'rifleStrafe', label: 'Rifle · strafe', kind: 'locomotion' },
  { key: 'rifleHit', label: 'Rifle · hit reaction', kind: 'oneshot' },
  { key: 'rifleDeath', label: 'Rifle · death', kind: 'oneshot' },
  { key: 'dance', label: 'Dance', kind: 'state' },
  { key: 'sprint', label: 'Sprint', kind: 'locomotion' },
  { key: 'jump', label: 'Jump (rising)', kind: 'air' },
  { key: 'fall', label: 'Fall', kind: 'air' },
  { key: 'land', label: 'Land', kind: 'oneshot' },
  { key: 'bigland', label: 'Big landing (flight / high drop)', kind: 'oneshot' },
  { key: 'bail', label: 'Flight bail (out of stamina)', kind: 'air' },
  { key: 'bailImpact', label: 'Flight bail impact', kind: 'oneshot' },
  { key: 'fastfall', label: 'Fast dive down (flying: R2 + L3)', kind: 'air' },
  { key: 'fastland', label: 'Rolling landing (after the fast dive)', kind: 'oneshot' },
  { key: 'punch', label: 'Punch · combo 1', kind: 'oneshot' },
  { key: 'punch2', label: 'Punch · combo 2', kind: 'oneshot' },
  { key: 'punch3', label: 'Punch · combo 3', kind: 'oneshot' },
  { key: 'punch4', label: 'Punch · combo 4', kind: 'oneshot' },
  { key: 'sword', label: 'Sword · combo 1 (uses punch clips until set)', kind: 'oneshot' },
  { key: 'draw', label: 'Sword · take out', kind: 'oneshot' },
  { key: 'sheathe', label: 'Sword · put away', kind: 'oneshot' },
  { key: 'sword2', label: 'Sword · combo 2', kind: 'oneshot' },
  { key: 'sword3', label: 'Sword · combo 3', kind: 'oneshot' },
  { key: 'sword4', label: 'Sword · combo 4', kind: 'oneshot' },
  { key: 'drawBow', label: 'Pearlbow · take out', kind: 'oneshot' },
  { key: 'bowDraw', label: 'Pearlbow · draw arrow', kind: 'oneshot' },
  { key: 'bowAim', label: 'Pearlbow · aim', kind: 'state' },
  { key: 'bowAimWalk', label: 'Pearlbow · aim walking', kind: 'locomotion' },
  { key: 'bowShoot', label: 'Pearlbow · shoot', kind: 'oneshot' },
  { key: 'axe', label: 'Axe · combo 1', kind: 'oneshot' },
  { key: 'axe2', label: 'Axe · combo 2', kind: 'oneshot' },
  { key: 'axe3', label: 'Axe · combo 3', kind: 'oneshot' },
  { key: 'axe4', label: 'Axe · combo 4', kind: 'oneshot' },
  { key: 'drawAxe', label: 'Axe · take out', kind: 'oneshot' },
  { key: 'sheatheAxe', label: 'Axe · put away', kind: 'oneshot' },
  { key: 'kick', label: 'Kick · combo 1', kind: 'oneshot' },
  { key: 'kick2', label: 'Kick · combo 2', kind: 'oneshot' },
  { key: 'kick3', label: 'Kick · combo 3', kind: 'oneshot' },
  { key: 'kick4', label: 'Kick · combo 4', kind: 'oneshot' },
  { key: 'flykick', label: 'Flying kick (running + △)', kind: 'oneshot' },
  { key: 'runpunch', label: 'Running punch (running + □)', kind: 'oneshot' },
  { key: 'kickHeavy', label: 'Heavy weapon · kick (△ with the axe or a longsword drawn)', kind: 'oneshot' },
  { key: 'aerialEvade', label: 'Aerial evade (perfect dodge of a projectile)', kind: 'oneshot' },
  { key: 'treeSpin', label: 'Tree spin evade (running into a tree)', kind: 'oneshot' },
  { key: 'heavyRunAttack', label: 'Heavy weapon · running attack (running + □)', kind: 'oneshot' },
  { key: 'blast', label: 'Astral Blast (○)', kind: 'oneshot' },
  { key: 'blast2', label: 'Astralstrike · combo 2 (○)', kind: 'oneshot' },
  { key: 'blast3', label: 'Astralstrike · combo 3 · two-hand blast (○)', kind: 'oneshot' },
  { key: 'dodge', label: 'Dodge roll', kind: 'oneshot' },
  { key: 'block', label: 'Block (hold L2 + R2)', kind: 'state' },
  { key: 'parry', label: 'Parry (perfect block: guard up just as the blow lands)', kind: 'oneshot' },
  { key: 'airslam', label: 'Aerial slam (in the air + lock on + □)', kind: 'oneshot' },
  { key: 'thunder', label: 'Astralthunder cast (lock + d-pad ↓)', kind: 'oneshot' },
  { key: 'astralburst', label: 'Astralburst cast (lock + d-pad ←)', kind: 'oneshot' },
  { key: 'rollingThunder', label: 'Rolling Thunder (lock + d-pad →)', kind: 'oneshot' },
  { key: 'astralclap', label: 'Astralclap (Focus Move · lock + d-pad)', kind: 'oneshot' },
  { key: 'astralspin', label: 'Astralspin (Focus Move · d-pad, ground or air)', kind: 'oneshot' },
  { key: 'slide', label: 'Dodge slide (hold L2)', kind: 'oneshot' },
  { key: 'doublejump', label: 'Double jump', kind: 'oneshot' },
  { key: 'runpickup', label: 'Pick up on the run (running + ○)', kind: 'oneshot' },
  { key: 'faeCatch', label: 'Fae catch · leap and catch (○ near a fae)', kind: 'oneshot' },
  { key: 'faeCatchMiss', label: 'Fae catch · missed leap', kind: 'oneshot' },
  { key: 'kickup', label: 'Kick-up combo (run + △△)', kind: 'oneshot' },
  { key: 'vault', label: 'Running vault (run + ✕ at a low obstacle)', kind: 'oneshot' },
  { key: 'ledgeGrab', label: 'Ledge · jump to hang', kind: 'oneshot' },
  { key: 'ledgeClimb', label: 'Ledge · climb up', kind: 'oneshot' },
  { key: 'prayKneel', label: 'Prayer · kneel (L2 + R2, outside combat)', kind: 'oneshot' },
  { key: 'prayHold', label: 'Prayer · hold and charge Astral Energy', kind: 'state' },
  { key: 'prayStand', label: 'Prayer · stand on release', kind: 'oneshot' },
  ...Array.from({ length: 10 }, (_, i) => ({ key: `bond${i + 1}`, label: `Zyrex bond · difficulty ${i + 1}`, kind: 'oneshot' })),
  { key: 'astralboardCruise', label: 'Astralboard · cruise stance', kind: 'state' },
  { key: 'astralboardPush', label: 'Astralboard · boost push (R2)', kind: 'oneshot' },
  { key: 'wallflip', label: 'Wall flip (jump at a wall, jump again)', kind: 'oneshot' },
  { key: 'exitDoor', label: 'Walk out the door (the enter clip, mirrored)', kind: 'oneshot' },
  { key: 'crouch', label: 'Stealth crouch / sneak (L3)', kind: 'state' },
  { key: 'swim', label: 'Swim (moving in water)', kind: 'state' },
  { key: 'float', label: 'Float (still in water)', kind: 'state' },
  { key: 'swimrun', label: 'Swim stroke (sprinting in water)', kind: 'state' },
  { key: 'hurt', label: 'Hit reaction', kind: 'oneshot' },
  { key: 'knockdown', label: 'Knockdown', kind: 'hold' },
  { key: 'interact', label: 'Interact (landmark)', kind: 'oneshot' },
  { key: 'enter', label: 'Enter door', kind: 'oneshot' },
  { key: 'pickup', label: 'Pick up item', kind: 'oneshot' },
  { key: 'store', label: 'Kneel · store ground loot', kind: 'oneshot' },
  { key: 'emote', label: 'Emote', kind: 'oneshot' },
  { key: 'fly', label: 'Fly (double jump + hold ✕)', kind: 'state' },
  { key: 'descend', label: 'Flight descent (L3)', kind: 'state' },
  { key: 'hover', label: 'Hover (unused yet)', kind: 'state' }
];
const AIR = new Set(['jump', 'rifleJump', 'fall', 'doublejump', 'wallflip', 'hover', 'fly', 'descend', 'fastfall', 'bail']); // physics owns height for these
const FIXED_ROOT = new Set(['ledgeGrab', 'ledgeClimb', 'ladderClimb']); // geometry drives the root; clips supply the body pose
const DROP = new Set(['bigland', 'fastland']);
const FLOOR = new Set(['bailImpact', 'airslam']); // physics owns the fall; the body keeps its whole drop to the floor (it ends lying down) // physics owns the fall; keep only the landing's downward give
export const SLOT_KEYS = SLOTS.map(s => s.key);
export const BUILTIN_SLOTS = { idle: 'Idle', walk: 'Walk', run: 'Run', punch: 'Punch', kick: 'Kick' };
export const ACTORS = {
  rizer: { name: 'Rizer', url: './assets/rizer/rizer.glb' },
  psychosyd: { name: 'Rizer · Psychosyd', url: './assets/rizer/rizer_psychosyd.glb' },
  elzoran: { name: 'Elzoran', url: './assets/elzoran/elzoran.glb' },
  seer: { name: 'Seer grunt', url: './assets/seer/seer.glb' },
  mori: { name: 'Mori', url: './assets/mori/mori.glb' },
  'daemon-black': { name: 'Black Daemon', url: './assets/mori/mori.glb' },
  'daemon-red': { name: 'Red Daemon', url: './assets/mori/mori.glb' },
  nova: { name: 'Nova Guardian', url: './assets/seer/seer.glb' } // the shared humanoid rig in Thardin armor (nova.js)
};

// ── loading ──────────────────────────────────────────────────────────
const glbCache = new Map();
const b64ToBuf = b64 => { const bin = atob(b64), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i); return buf.buffer; };
// Fetch a binary asset; hosts that can't serve .glb/.fbx get the base64 module beside it.
async function fetchBin(url) {
  const packed = globalThis.__RP7D_ASSETS?.[url]; // the single-file build carries every asset inline (gzip + base64)
  if (packed) {
    const buf = b64ToBuf(packed.replace(/^gz:/, ''));
    return packed.startsWith('gz:') ? new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer() : buf;
  }
  try { const r = await fetch(url); if (!r.ok) throw new Error(r.status); const ct = r.headers.get('content-type') || ''; if (ct.includes('text/html')) throw new Error('html'); return await r.arrayBuffer(); }
  catch (e) { return b64ToBuf((await import(url + '.js')).default); }
}
export function loadGLB(url) {
  if (!glbCache.has(url)) glbCache.set(url, fetchBin(url).then(buf => new GLTFLoader().parseAsync(buf, '')));
  return glbCache.get(url);
}
// Parse an animation file into { root, clips }.
async function parseAnimFile(buf, name) {
  if (/\.(glb|gltf)$/i.test(name)) { const g = await new GLTFLoader().parseAsync(buf, ''); return { root: g.scene, clips: g.animations }; }
  const root = new FBXLoader().parse(buf, ''); return { root, clips: root.animations || [] };
}

// ── bone matching ────────────────────────────────────────────────────
// "mixamorig:LeftArm", "mixamorig1:LeftArm", "mixamorigLeftArm", "LeftArm" → "leftarm"
export const canon = n => n.replace(/^mixamorig\d*[:_]?/i, '').replace(/[^A-Za-z0-9]/g, '').toLowerCase();
function bonesOf(root) {
  const list = [];
  root.traverse(o => { if (o.isBone) list.push(o); });
  if (!list.length) root.traverse(o => { if (/mixamorig|hips|spine/i.test(o.name) && !o.isMesh) list.push(o); });
  const map = new Map(); for (const b of list) { const k = canon(b.name); if (!map.has(k)) map.set(k, b); }
  return { list, map };
}
// Pose of every bone relative to `root`, taken from the file's node transforms
// (glTF joints and Mixamo FBX both store the rest pose there).
function restOf(root) {
  root.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert(), out = new Map();
  root.traverse(o => {
    const m = inv.clone().multiply(o.matrixWorld);
    const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s);
    out.set(o, { p, q, m });
  });
  return out;
}

// ── sampling + retarget ──────────────────────────────────────────────
const FPS = 30;
// Sample a source clip once: per frame, each bone's rotation (and hips position) relative to the source root.
function sampleSource(entry, clip) {
  const root = entry.root, { map } = bonesOf(root), rest = restOf(root);
  const hips = map.get('hips');
  const mixer = new THREE.AnimationMixer(root), act = mixer.clipAction(clip); act.play();
  const n = Math.max(2, Math.round(clip.duration * FPS) + 1), times = new Float32Array(n);
  const keys = [...map.keys()], rot = new Map(keys.map(k => [k, []])), hipsPos = [], reach = [];
  const HANDS = ['lefthand', 'righthand'].filter(k => map.has(k)), FEET = ['leftfoot', 'rightfoot'].filter(k => map.has(k)), reachFeet = [], footY = [], chest = map.get('spine2') || map.get('spine1') || hips;
  const inv = new THREE.Matrix4(), m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const t = Math.min(clip.duration, i / FPS); times[i] = t;
    mixer.setTime(Math.min(t, clip.duration - 1e-4)); root.updateMatrixWorld(true); inv.copy(root.matrixWorld).invert(); // exactly `duration` would wrap back to frame 0
    for (const k of keys) { m.multiplyMatrices(inv, map.get(k).matrixWorld); m.decompose(p, q, s); rot.get(k).push(q.clone()); if (k === 'hips') hipsPos.push(p.clone()); }
    if (chest) { const c = new THREE.Vector3().setFromMatrixPosition(m.multiplyMatrices(inv, chest.matrixWorld)); const rel = list => list.map(k => new THREE.Vector3().setFromMatrixPosition(m.multiplyMatrices(inv, map.get(k).matrixWorld)).sub(c)); reach.push(rel(HANDS)); reachFeet.push(rel(FEET)); }
    const toes = ['lefttoebase', 'righttoebase', 'leftfoot', 'rightfoot'].filter(k => map.has(k)); if (toes.length) footY.push(Math.min(...toes.map(k => new THREE.Vector3().setFromMatrixPosition(m.multiplyMatrices(inv, map.get(k).matrixWorld)).y))); // hand / foot positions around the chest (+Z faces forward)
  }
  act.stop(); mixer.uncacheRoot(root);
  const restQ = new Map(keys.map(k => [k, rest.get(map.get(k)).q])), restHips = hips ? rest.get(hips).p : new THREE.Vector3();
  const restPos = new Map(keys.map(k => [k, rest.get(map.get(k)).p]));
  return { times, rot, hipsPos, restQ, restPos, restHips, duration: clip.duration, ...analyse(times, strikeSpeed(reach), hipsPos), hitsFeet: contacts(times, strikeSpeed(reachFeet)), peak: peakTime(times, strikeSpeed(reach)), touch: touchTime(times, footY) };
}

// Find the moments that matter: strike contacts (a hand or foot at full extension)
// and, for jumps, take-off and touch-down (hips rising past / falling back to the start height).
function analyse(times, reach, hipsPos) {
  const hits = contacts(times, reach);
  let takeoff = 0, landT = times[times.length - 1];
  if (hipsPos.length > 4) {
    const y = hipsPos.map(v => v.y), y0 = y[0], top = Math.max(...y), iTop = y.indexOf(top);
    if (top - y0 > 0.05 * Math.abs(y0 || 1)) {
      let iMin = 0; for (let i = 0; i < iTop; i++) if (y[i] < y[iMin]) iMin = i;
      for (let i = iMin; i <= iTop; i++) if (y[i] >= y0) { takeoff = times[i]; break; }
      for (let i = iTop; i < y.length; i++) if (y[i] <= y0) { landT = times[i]; break; }
    }
  }
  return { hits, takeoff, landT };
}
// How hard any limb is driving outward: forward plus upward speed (pull-backs and wind-ups don't count).
function strikeSpeed(series) {
  return series.map((limbs, i) => {
    if (!i || !limbs.length) return 0;
    return Math.max(...limbs.map((v, j) => { const p = series[i - 1][j]; return Math.max(0, v.z - p.z) + Math.max(0, v.y - p.y) * 0.8 + Math.max(0, Math.abs(v.x) - Math.abs(p.x)) * 0.6; })) * FPS;
  });
}
// When the feet first reach the floor (the lowest they get) — a landing clip's touchdown frame.
function touchTime(times, y) { if (y.length < 3) return 0; const lo = Math.min(...y), hi = Math.max(...y), tol = Math.max(0.02, (hi - lo) * 0.06); const i = y.findIndex(v => v <= lo + tol); return times[Math.max(0, i)]; }
// The single hardest outward drive in a clip (a cast's release moment).
function peakTime(times, v) { let i = 0; for (let k = 1; k < v.length; k++) if (v[k] > v[i]) i = k; return times[Math.min(i + 2, times.length - 1)]; }
function contacts(times, reach) {
  const hits = [];
  if (reach.length > 4) {
    // a contact is a forward-extension peak that stands clear of the guard on both sides
    const lo = Math.min(...reach), hi = Math.max(...reach), prom = (hi - lo) * 0.33, W = Math.round(0.25 * FPS), end = times[times.length - 1];
    for (let i = 1; i < reach.length - 1; i++) {
      if (!(reach[i] >= reach[i - 1] && reach[i] > reach[i + 1]) || times[i] < 0.08 || times[i] > end - 0.08) continue;
      const before = Math.min(...reach.slice(Math.max(0, i - W), i)), after = Math.min(...reach.slice(i + 1, i + 1 + W));
      if (reach[i] - before < prom || reach[i] - after < prom) continue;
      const t = times[Math.min(i + 2, times.length - 1)]; if (hits.length && t - hits[hits.length - 1] < 0.15) continue; // blow lands just after peak drive
      hits.push(t);
    }
  }
  return hits;
}

// Rest data for a target model (the untouched GLB scene, never animated).
const targetRest = new WeakMap();
function restOfTarget(scene) {
  if (!targetRest.has(scene)) {
    const { list } = bonesOf(scene), rest = restOf(scene);
    targetRest.set(scene, { list, rest });
  }
  return targetRest.get(scene);
}

// The target's rest pose bent to match the source's rest pose (e.g. arms-down → T-pose).
// World-space deltas only transfer correctly between matching rest poses, so every
// limb bone is swung to point the way the source's rest bone points, parents first.
const CHAIN = { spine2: 'neck', lefthand: 'lefthandindex1', righthand: 'righthandindex1', leftshoulder: 'leftarm', rightshoulder: 'rightarm' };
const alignedCache = new WeakMap();
function alignedRest(scene, sample) {
  let per = alignedCache.get(scene); if (!per) alignedCache.set(scene, per = new WeakMap());
  if (per.has(sample)) return per.get(sample);
  const copy = cloneSkinned(scene), { list } = bonesOf(copy);
  const byCanon = new Map(list.map(b => [canon(b.name), b]));
  const pos = o => o.getWorldPosition(new THREE.Vector3()), wq = o => o.getWorldQuaternion(new THREE.Quaternion());
  copy.updateMatrixWorld(true);
  const toRoot = copy.matrixWorld.clone().invert();
  for (const b of list) {
    const k = canon(b.name); if (k === 'hips' || !sample.restPos.has(k)) continue;
    const kids = b.children.filter(c => c.isBone && sample.restPos.has(canon(c.name)));
    const child = kids.find(c => canon(c.name) === CHAIN[k]) || (kids.length === 1 ? kids[0] : null);
    if (!child) continue;
    copy.updateMatrixWorld(true);
    const tDir = pos(child).applyMatrix4(toRoot).sub(pos(b).applyMatrix4(toRoot)).normalize();
    const sDir = sample.restPos.get(canon(child.name)).clone().sub(sample.restPos.get(k)).normalize();
    if (tDir.lengthSq() < 0.5 || sDir.lengthSq() < 0.5 || tDir.dot(sDir) > 0.9999) continue;
    const swing = new THREE.Quaternion().setFromUnitVectors(tDir, sDir);            // in root space
    const rootQ = wq(copy), worldSwing = rootQ.clone().multiply(swing).multiply(rootQ.clone().invert());
    const parentQ = wq(b.parent), newWorld = worldSwing.multiply(wq(b));
    b.quaternion.copy(parentQ.invert().multiply(newWorld));
  }
  const rest = restOf(copy), out = new Map();
  for (const b of list) out.set(scene.getObjectByName(b.name), rest.get(b).q);
  per.set(sample, out); return out;
}

// Retarget a sampled source onto a target scene. Returns a clip bound by bone name plus stride data.
function retarget(sample, scene, name, { inPlace = true, rootY = true, yaw = 0 } = {}) { // yaw (degrees): turn the whole clip, for clips authored facing the wrong way // rootY: true · false (air) · 'down' (landing)
  const { list, rest } = restOfTarget(scene);
  const hipsT = list.find(b => canon(b.name) === 'hips');
  const ratio = hipsT && sample.restHips.y ? rest.get(hipsT).p.y / sample.restHips.y : 1;
  const matched = alignedRest(scene, sample); // target rest bent into the source's rest pose
  const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * Math.PI / 180);
  const n = sample.times.length, tracks = [];
  const world = new Map(), local = new Map(list.map(b => [b, new Float32Array(n * 4)]));
  const hipsLocal = new Float32Array(n * 3);
  const tq = new THREE.Quaternion(), pw = new THREE.Quaternion(), d = new THREE.Vector3(), pm = new THREE.Matrix4();
  let travel = 0;
  for (let i = 0; i < n; i++) {
    world.clear();
    for (const b of list) {
      const k = canon(b.name), src = sample.rot.get(k), r = rest.get(b);
      const parentW = world.get(b.parent) || rest.get(b.parent)?.q || new THREE.Quaternion();
      let w;
      if (src) w = qYaw.clone().multiply(src[i]).multiply(sample.restQ.get(k).clone().invert()).multiply(matched.get(b) || r.q); // world delta from the matched rest
      else w = parentW.clone().multiply(b.quaternion); // unmapped: follow parent at rest
      world.set(b, w);
      tq.copy(parentW).invert().multiply(w).normalize().toArray(local.get(b), i * 4);
      if (b === hipsT && sample.hipsPos.length) {
        d.copy(sample.hipsPos[i]).sub(sample.restHips).multiplyScalar(ratio).applyQuaternion(qYaw);
        if (i === n - 1) travel = Math.hypot(sample.hipsPos[i].x - sample.hipsPos[0].x, sample.hipsPos[i].z - sample.hipsPos[0].z) * ratio;
        if (inPlace) { d.x = 0; d.z = 0; }
        if (rootY === 'down') d.y = Math.min(0, d.y + (sample.restHips.y - sample.hipsPos[sample.hipsPos.length - 1].y) * ratio); // landing: keep the dip below the settled stance
        else if (rootY === 'floor') d.y = Math.min(0, d.y); // falls that end on the floor: never above the stance, all the way down to lying flat
        else if (rootY === 'fixed') d.y = 0;
        else if (!rootY) d.y = Math.min(0, d.y) * 0.5; // air clips: physics does the lifting; keep a soft crouch
        const pos = rest.get(b).p.clone().add(d);
        const parentM = rest.get(b.parent)?.m; // hips' parent (the rig node) never animates
        if (parentM) pos.applyMatrix4(pm.copy(parentM).invert());
        pos.toArray(hipsLocal, i * 3);
      }
    }
  }
  for (const b of list) tracks.push(new THREE.QuaternionKeyframeTrack(`${b.name}.quaternion`, sample.times, local.get(b)));
  if (hipsT && sample.hipsPos.length) tracks.push(new THREE.VectorKeyframeTrack(`${hipsT.name}.position`, sample.times, hipsLocal));
  const clip = new THREE.AnimationClip(name, sample.duration, tracks);
  return { clip, travel, hits: sample.hits, hitsFeet: sample.hitsFeet, peak: sample.peak, touch: sample.touch, takeoff: sample.takeoff, landT: sample.landT };
}

// ── library state ────────────────────────────────────────────────────
const entries = new Map();   // id → { id, name, source, file, loop, duration?, load() }
const samples = new Map();   // id → Promise<sample>
const retargeted = new Map(); // `${id}|${actorKey}|${inPlace}` → Promise<{clip, travel}>
const listeners = new Set();
const emit = () => listeners.forEach(f => f());
export const onLibraryChange = f => (listeners.add(f), () => listeners.delete(f));

function addEntry(e) { entries.set(e.id, e); samples.delete(e.id); for (const k of [...retargeted.keys()]) if (k.startsWith(e.id + '|')) retargeted.delete(k); }

// Built-ins: the five clips inside each character GLB.
for (const [key, A] of Object.entries(ACTORS)) for (const clipName of Object.values(BUILTIN_SLOTS)) {
  addEntry({ id: `builtin:${key}:${clipName}`, name: `${A.name} · ${clipName}`, source: 'builtin', actor: key, clipName,
    loop: !['Punch', 'Kick'].includes(clipName), load: () => loadGLB(A.url).then(g => ({ root: g.scene, clips: g.animations, builtin: true })) });
}
// Committed library.
for (const it of LIBRARY) {
  const url = './assets/anims/' + it.file; let p;
  addEntry({ id: 'lib:' + it.file, name: it.name || it.file.replace(/^.*\//, '').replace(/\.\w+$/, ''), source: 'library', file: it.file,
    loop: it.loop ?? true, inPlace: it.inPlace ?? true, load: () => (p ||= fetchBin(url).then(buf => parseAnimFile(buf, it.file))) });
}

// Dropped files persist in this browser's IndexedDB (best effort).
const DB = 'rp7d-anim-lab', STORE = 'clips';
function db() { return new Promise((res, rej) => { try { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); }
async function dbPut(name, buf) { try { const d = await db(); d.transaction(STORE, 'readwrite').objectStore(STORE).put(buf, name); } catch (e) {} }
async function dbDel(name) { try { const d = await db(); d.transaction(STORE, 'readwrite').objectStore(STORE).delete(name); } catch (e) {} }
async function dbAll() {
  try { const d = await db(); return await new Promise(res => { const out = [], c = d.transaction(STORE).objectStore(STORE).openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out.push([cur.key, cur.value]); cur.continue(); } else res(out); }; c.onerror = () => res([]); }); }
  catch (e) { return []; }
}
function addDropped(name, buf) {
  const id = 'drop:' + name;
  let p; addEntry({ id, name: name.replace(/\.\w+$/, ''), source: 'dropped', file: name, loop: true, inPlace: true, load: () => (p ||= parseAnimFile(buf, name)) });
  return id;
}
export const ready = dbAll().then(all => { for (const [name, buf] of all) addDropped(name, buf); emit(); });

// Add files from a drop or file picker. Returns the new clip ids.
export async function addFiles(files) {
  const ids = [];
  for (const f of files) {
    if (!/\.(fbx|glb|gltf)$/i.test(f.name)) continue;
    const buf = await f.arrayBuffer(); await dbPut(f.name, buf.slice(0));
    const id = addDropped(f.name, buf);
    try { await sampleOf(id); ids.push(id); } catch (e) { console.warn('[anim-lab] could not read', f.name, e); entries.delete(id); dbDel(f.name); }
  }
  emit(); return ids;
}
export function removeClip(id) {
  const e = entries.get(id); if (!e || e.source !== 'dropped') return;
  entries.delete(id); dbDel(e.file);
  for (const a of Object.values(assign)) for (const s in a) if (a[s]?.clip === id) delete a[s];
  saveAssign(); emit(); applyAll();
}
export const clips = () => [...entries.values()];
export const clipById = id => entries.get(id);

async function sampleOf(id) {
  if (!samples.has(id)) samples.set(id, (async () => {
    const e = entries.get(id), data = await e.load();
    const clip = e.clipName ? data.clips.find(c => c.name === e.clipName) : pickClip(data.clips);
    if (!clip) throw new Error('no animation in ' + e.name);
    e.duration = clip.duration;
    if (data.builtin) return { builtin: true, clip };
    const src = { root: cloneSkinned(data.root) }; // sample on a copy so the parsed file stays at rest
    return sampleSource(src, clip);
  })());
  return samples.get(id);
}
// A clip played as its mirror image: left and right bones swap and every rotation reflects across the
// body's centre plane (x → -x), so a right-handed move becomes the same move done left-handed.
const mirrored = new WeakMap();
function mirrorSample(s) {
  if (s.builtin) return s;
  if (mirrored.has(s)) return mirrored.get(s);
  const swap = k => k.startsWith('left') ? 'right' + k.slice(4) : k.startsWith('right') ? 'left' + k.slice(5) : k;
  const src = k => s.rot.has(swap(k)) ? swap(k) : k;
  const mq = q => new THREE.Quaternion(q.x, -q.y, -q.z, q.w), mv = v => new THREE.Vector3(-v.x, v.y, v.z);
  const keys = [...s.rot.keys()];
  const out = { ...s,
    rot: new Map(keys.map(k => [k, s.rot.get(src(k)).map(mq)])),
    restQ: new Map(keys.map(k => [k, mq(s.restQ.get(src(k)))])),
    restPos: new Map(keys.map(k => [k, mv(s.restPos.get(src(k)))])),
    restHips: mv(s.restHips), hipsPos: s.hipsPos.map(mv) };
  mirrored.set(s, out); return out;
}
const pickClip = list => list.slice().sort((a, b) => b.duration - a.duration)[0];

// Longer steps at the same cadence: widen each leg bone's swing around its average pose by `k`
// (arms follow at half strength so the swing stays matched), and scale ground covered per cycle to suit.
const STRIDE_LEGS = /(UpLeg|Leg|Foot|ToeBase)\.quaternion$/, STRIDE_ARMS = /(Arm|ForeArm)\.quaternion$/;
function lengthenStride(r, k) {
  const clip = r.clip.clone(), q = new THREE.Quaternion(), m = new THREE.Quaternion(), mi = new THREE.Quaternion(), d = new THREE.Quaternion();
  for (const tr of clip.tracks) {
    const f = STRIDE_LEGS.test(tr.name) ? k : STRIDE_ARMS.test(tr.name) ? 1 + (k - 1) * 0.5 : 0;
    if (!f || f === 1) continue;
    const v = tr.values = tr.values.slice(), n = v.length / 4, sum = [0, 0, 0, 0];
    for (let i = 0; i < n; i++) { const s = (v[i * 4] * v[0] + v[i * 4 + 1] * v[1] + v[i * 4 + 2] * v[2] + v[i * 4 + 3] * v[3]) < 0 ? -1 : 1; for (let c = 0; c < 4; c++) sum[c] += v[i * 4 + c] * s; }
    m.set(sum[0], sum[1], sum[2], sum[3]).normalize(); mi.copy(m).invert();
    for (let i = 0; i < n; i++) {
      q.fromArray(v, i * 4); d.copy(mi).multiply(q); if (d.w < 0) d.set(-d.x, -d.y, -d.z, -d.w);
      const a = 2 * Math.acos(Math.min(1, d.w)), sn = Math.sqrt(Math.max(0, 1 - d.w * d.w));
      if (sn > 1e-6) { const h = a * f / 2, s2 = Math.sin(h) / sn; d.set(d.x * s2, d.y * s2, d.z * s2, Math.cos(h)); }
      q.copy(m).multiply(d).normalize().toArray(v, i * 4);
    }
  }
  return { ...r, clip, travel: r.travel * k };
}

// The clip `id` as it plays on the actor `actor` (an Actor instance).
export function clipFor(id, actor, { inPlace, rootY = true, yaw = 0, stride = 1, mirror = false } = {}) {
  const e = entries.get(id); if (!e) return Promise.reject(new Error('unknown clip ' + id));
  const ip = inPlace ?? e.inPlace ?? true, key = `${id}|${actor.charKey}|${ip}|${rootY}|${yaw}|${stride}|${mirror}`;
  if (!retargeted.has(key)) retargeted.set(key, sampleOf(id).then(s => mirror ? mirrorSample(s) : s).then(s => {
    if (s.builtin) return { clip: s.clip, travel: 0 }; // every character shares the rig: use as-is
    const r = retarget(s, actor.gltf.scene, e.name, { inPlace: ip, rootY, yaw });
    return stride !== 1 ? lengthenStride(r, stride) : r;
  }));
  return retargeted.get(key);
}

// ── assignments ──────────────────────────────────────────────────────
// { rizer: { walk: { clip: 'lib:Walk.fbx', inPlace: true } }, seer: {...} }
// Saved edits are keyed to the shipped defaults, so new defaults reach everyone.
const hash = str => { let h = 5381; for (let i = 0; i < str.length; i++) h = (h * 33 ^ str.charCodeAt(i)) >>> 0; return h.toString(36); };
const LS = 'rp7d.animAssignments.' + hash(JSON.stringify(DEFAULT_ASSIGNMENTS || {}));
let assign = load();
function load() {
  const base = JSON.parse(JSON.stringify(DEFAULT_ASSIGNMENTS || {}));
  try { const saved = JSON.parse(localStorage.getItem(LS) || 'null'); if (saved) return saved; } catch (e) {}
  return base;
}
function saveAssign() { try { localStorage.setItem(LS, JSON.stringify(assign)); } catch (e) {} }
export const assignments = () => assign;
export function setAssignment(actorKey, slot, clipId, opts = {}) {
  assign[actorKey] ||= {};
  if (clipId) assign[actorKey][slot] = { clip: clipId, ...opts }; else delete assign[actorKey][slot];
  saveAssign(); emit(); applyAll(actorKey);
}
// Add a clip as another variant of a slot (one is picked at random each time).
export function addVariant(actorKey, slot, clipId) {
  const cur = assign[actorKey]?.[slot];
  if (!cur) return setAssignment(actorKey, slot, clipId);
  const all = [cur.clip, ...(cur.more || [])];
  if (!all.includes(clipId)) cur.more = [...(cur.more || []), clipId];
  saveAssign(); emit(); applyAll(actorKey);
}
export function resetAssignments() { assign = JSON.parse(JSON.stringify(DEFAULT_ASSIGNMENTS || {})); saveAssign(); emit(); applyAll(); }
export function exportAssignments() {
  return '// RP7D animation assignments — exported from the Anim Lab.\n// Clip ids: builtin:<actor>:<Clip> · lib:<file in assets/anims> · drop:<file dropped in the lab (local only)>\nexport default ' + JSON.stringify(assign, null, 2) + ';\n';
}

// Live actors register here so assignment changes apply immediately.
const live = new Set();
export function registerActor(actor) { live.add(actor); return applyTo(actor); }
export function unregisterActor(actor) { live.delete(actor); }
function applyAll(only) { for (const a of live) if (!only || a.charKey === only) applyTo(a); }
async function applyTo(actor) {
  const mine = assign[actor.charKey] || {};
  await Promise.all(SLOT_KEYS.map(async slot => {
    const a = mine[slot];
    if (!a) return actor.setSlot(slot, null);
    const ids = [a.clip, ...(a.more || [])], feet = slot.startsWith('kick') || slot === 'flykick';
    try {
      const list = await Promise.all(ids.map(async id => {
        const r = await clipFor(id, actor, { inPlace: a.inPlace, rootY: FIXED_ROOT.has(slot) ? 'fixed' : DROP.has(slot) ? 'down' : FLOOR.has(slot) ? 'floor' : !AIR.has(slot), yaw: a.yaw || 0, stride: a.stride || 1, mirror: !!a.mirror });
        const primary = feet ? r.hitsFeet : r.hits, backup = feet ? r.hits : r.hitsFeet;
        const hits = (slot === 'blast' || slot === 'blast2') && r.peak != null ? [r.peak] : primary?.length ? primary : backup; // astral casts release once
        return { clip: r.clip, meta: { travel: r.travel, clipId: id, hits, takeoff: r.takeoff, landT: r.landT, touch: r.touch } };
      }));
      actor.setSlot(slot, list);
    } catch (e) { console.warn('[anim-lab] slot', actor.charKey, slot, e); actor.setSlot(slot, null); }
  }));
}
