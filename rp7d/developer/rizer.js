// Rizer V0 — a replaceable placeholder body under one controller root,
// plus the movement model and orbit camera. Swap `buildBody()` for the
// Blender rig later; the controller only talks to the named pivots.
import * as THREE from 'three';
import { Actor, CLIPS, loadGLB } from './actor.js';
import { clamp, damp, dampAngle } from './util.js';
import { DOORWALK, doorPath } from './doorwalk.js';
import { preloadBuild, applyBuildToActor } from './build-library.js';
import { maxHpOf, maxStaminaOf, maxEnergyOf, staminaRegenMul, dodgeCostMul, astralHitMul, astralRegen, hpRegen } from './astral-stats.js';

// Playable characters. All share the Mixamo rig and its Idle/Walk/Run/Punch/Kick clips.
// Characters saved from the Build Lab join this list at startup (build-library.js · registerPlayableBuilds): they
// carry `build` (applied to the body here) and `animProfile` (whose Anim Lab clips they move with).
export const CHARACTERS = {
  rizer: { name: 'Rizer', url: './assets/rizer/rizer.glb', scale: 1.25, astral: 'blue' },     // low-poly placeholder for the art pass
  psychosyd: { name: 'Rizer · Psychosyd', skinOf: 'rizer', url: './assets/rizer/rizer_psychosyd.glb', scale: 1.25, astral: 'green',
    blurb: 'Green mohawk + skull shirt, after Baelgor\'s rock-star idol. Green astral energy.' }, // skin: same rig, same clips
  elzoran: { name: 'Elzoran', url: './assets/elzoran/elzoran.glb', scale: 1.3 },
  seer: { name: 'Seer grunt', url: './assets/seer/seer.glb', scale: 1.25 },        // playable so the Anim Lab can preview on it
  mori: { name: 'Mori', url: './assets/mori/mori.glb', scale: 1.25, animProfile:'mori', blurb:'Corrupted humanoid template · customize in Build Lab and Skin Lab' }
};
export const DEFAULT_CHARACTER = 'rizer';
// Player combat: damage dealt to Seers, reach in units, and how hits land on you.
// Weapons held in the hands: each has its own combo slots (sword, sword2… / axe, axe2…).
export const BLADES = { sword: true, axe: true, bow: true, guitar: true, rubypaw: true, telescope: true, blaster: true }; // what can be in hand (the guitar is played, not swung)
// Rizer's run cycles a little slower than the clip's natural pace (same ground speed, longer-looking strides).
const RUN_CADENCE = { run: 0.86, heavyRun: 0.86, sprint: 0.86 };
export const COMBAT = {
  punch: { damage: 1, reach: 2.6, arc: 1.05, speed: 1.15, move: 0.3 },
  runpunch: { damage: 3.5, reach: 2.8, arc: 1.0, speed: 1.05, move: 0.85, carry: 0.8, minSpeed: 6, from: 1.3 }, // from: skip the clip's opening jab (plain punch) and go straight into the lunging punch-to-elbow // running + □ (fists): punch into elbow, carrying the run
  // Running + ✕ at a waist-high obstacle (a fence, a gate, a boulder, furniture): the Running Vault carries him over it.
  // Heights in hip heights (H) above the ground he's on; distances in world units. over = clip window with no collision
  // (he's above it); peak = clip time his body crosses the obstacle's middle; out = clip time control returns.
  vault: { lo: 0.3, hi: 1.12, depth: 1.8, land: 1.1, near: 0.55, reach: 7, over: [0.32, 1.17], peak: 0.73, t0Max: 0.4, out: 1.62, touch: 1.13, speed: [1, 1.6], clipSpeed: 4.3 },
  ledge: { reach: 1.35, riseMin: 0.55, riseMax: 2.85, hangBelow: 2.4, grabSpeed: 1.3, climbSpeed: 1.55 },
  kickup: { damage: 5.5, speed: 1, move: 0, hit: 0.66, minSpeed: 6, tap: 0.35 }, // running + △△ (a second △ within `tap` s of the flying kick): the inverted kick lands at `hit` (clip s), then he kips up and runs on
  flykick: { damage: 4, reach: 3.2, arc: 0.9, speed: 1.05, move: 0.9, carry: 0.85, minSpeed: 6 }, // running (R2 held) + △: a leaping kick that carries the run's momentum · minSpeed: also triggers at this speed without R2
  kick: { damage: 2, reach: 3.0, arc: 0.9, speed: 1.0, move: 0.15, stageSpeed: [1, 1, 1, 1.3], overdrive: { stage: 4, damage: 1.75, power: 1.9 } }, // stage 4 (the backflip kick): comes through 30% faster and hits in overdrive
  blast: { damage: 2, speed: 1.15, move: 0.15 },
  sword: { damage: 3, reach: 3.7, arc: 1.3, speed: 1.1, move: 0.3 }, // Tearsword of Azurel: 3 per swing (split across the clip's blows), longer reach than fists
  rubypaw: { damage: 4, reach: 3.7, arc: 1.5, speed: 1.25, move: 0.22, lead: 0.6, tail: 0.7, spin4: true }, // Heavy longsword: uses the axe's four-stage combo cadence
  axe: { damage: 5, reach: 3.5, arc: 1.5, speed: 1.25, move: 0.22, lead: 0.6, tail: 0.7, spin4: true }, // Jaded Axe of Emeralix: heavy — hits hardest, swings a touch slower, you commit to each blow
  pickup: { speed: 1.35, grab: 0.26, reach: 0.52 }, // reach: how far in front of Rizer's centre the item sits when his hand closes on it
  store: { speed: 1, grab: 0.68, reach: 0.52 },
  draw: { speed: 1.3, grab: 0.4 },     // Sword Take Out: the hand closes on the hilt 40% in
  sheathe: { speed: 1.3, grab: 0.74 },
  drawBlaster: { speed: 2.1, grab: 0.5 },    // Grab Rifle From Behind Shoulder: the hand closes on it over the shoulder, half way in
  sheatheBlaster: { speed: 1.9, grab: 0.5 }, // Put Back Rifle Behind Shoulder: it seats on the back half way in
  drawAxe: { speed: 1.1, grab: 0.47 },    // Unarmed Equip Underarm: the hand closes on the axe at the right hip, 47% in
  sheatheAxe: { speed: 1.1, grab: 0.35 }, // Standing Disarm Underarm: it lets go at the hip, 35% in  // Sword Put Away: the blade seats in the scabbard 74% in // pick-up clip speed · grab frame (0-1 of the clip) · how far in front of Rizer the item sits // Astral Blast cast (the bolt itself: ASTRAL.blast in astral.js)
  drawBow: { speed: 1.05, grab: 0.55 },
  maxHp: 100, invuln: 0.7,
  // Meters (fruit refills all three; waking after a knock-out refills everything):
  //   health  · never regenerates (hp 0) — archetypes and perks (the Rizer build) may turn it on later
  //   stamina · regenerates slowly (`stamina`/s) once he's gone `staminaDelay` s without high output
  //             (running, flying, rolling, sliding, blocking, striking, vaulting, in the air)
  //   astral  · charges up from landed melee blows: `astralHit` per blow by combo stage, `astralFinisher` extra on the finisher
  regen: { hp: 0, hpDelay: 5, stamina: 7, combatStamina: 3, staminaDelay: 0.9, combatStaminaDelay: 0.55, astral: 0, astralHit: [1, 1.5, 2.5, 3.5], astralFinisher: 3 },
  dodge: { stamina: 4, time: 0.62, dist: 6.2, cooldown: 0.12, anim: 1.15, rise: 0.6, riseAnim: 0.8, getUp: 0.9 }, // athletic roll cost · burst / recovery timing
  block: { hold: 0.12, reduce: 0.15, stamina: 4, arc: 1.9, push: 1.2 }, // hold L2 + R2 standing: blocks every hit while the guard is up · takes `reduce` of the damage · each block costs stamina (the guard does not break yet) · push: how hard a blocked blow shoves him back
  // Parry: a perfect block. The guard has to have gone up within `window` s before the blow lands, with the attacker in
  // front (block.arc): no damage, no stamina, the parry clip plays and the attacker is stunned (game.js · onPlayerHit) if
  // within `reach`. Any later and it is an ordinary block.
  parry: { window: 0.2, reach: 3.5, time: 0.7 },
  // Perfect dodge: the roll began within `dodge` s of a blow that would have landed. Against a projectile (a bolt
  // `bolt` s or less from him when he dodges) the roll becomes the Aerial Evade jump spin (`aerial`: its burst).
  perfect: { dodge: 0.2, bolt: 0.4 },
  aerial: { time: 1.0, dist: 4.6, cooldown: 0.12 },
  // Aerial slam (in the air, locked on an enemy, □): he dives onto the target at `speed` u/s (the dive lasts between
  // `time[0]` and `time[1]` s), lands `stop` short of it and slams the ground as the clip's fist comes down (`impact`, clip s).
  // The target takes `damage`; a lightning shockwave (astral.js · shockwave) blasts back everyone within `radius`
  // (`blast` at the centre, `edge` at the rim). `minHeight`: how far off the ground he must be · `out`: clip s he is free again.
  airslam: { range: 34, minHeight: 1.2, speed: 24, time: [0.38, 0.85], stop: 1.15, impact: 0.58, recover: 1.25, out: 1.5, damage: 8, blast: 5, edge: 2, radius: 6 },
  prayer: { hold: 0.12, hp: 1.5, astral: 6, stamina: 18 }, // held prayer: health slow, Astral medium, stamina fast
  slide: { stamina: 5, time: 0.8, dist: 7.4, cooldown: 0.15, anim: 1.1, hold: 0.2 }, // hold L2 (C): a low running slide · `hold` s of L2 before a tap becomes a slide
  runStamina: 4, flightStamina: 6, // flight remains 1.5× run drain, with lighter athletic costs
  doubleJump: 0.95,  // second jump strength vs the first
  swimDepth: 0.85,   // water deeper than this switches to treading water
  swimNeck: -0.05,   // where the water line sits on the neck while swimming (units; + = body higher)
  crouch: { speed: 1.8, sight: 0.55, sense: 0.4 }, // stealth: sneak speed · Seer sight range and close-sense radius multipliers while crouched
  bigLand: { minDrop: 4, lock: 0.85 },
  runPick: { grab: 0.3, min: 5, side: 0.32 }, // running + ○ near loot: the right hand scoops it at `grab` (clip s) · keeps at least `min` u/s · the item passes `side` to his right
  // Fae catch (○ on the ground near a fae / faery / astral fae). Measured on Rizer's rig in-game:
  // `reach` = clip time (s) his hands are at their highest · `hand` = where the hands are then, relative
  // to his feet point [left, forward] in world units (the hips' own travel comes from FAE_HIT/FAE_MISS).
  // hit (catch_fae_success): jog-in, leap, two-handed catch at 2.59 above the ground, land, recover.
  //   It starts partway into the jog-in when the fae is close (t0 ≤ t0Max) and stretches its travel
  //   within `k` when it's far, so his hands always close on the fae. `out`: landed — input can blend out.
  // miss (catch_fae_miss): a sideways lunge up at it (hands ~0.25 short of it), then a dive to the floor.
  //   He jogs to the spot the lunge needs first; `getUp`: lying there → Standing Up.
  faeCatch: {
    range: 4.8,
    hit: { reach: 1.15, hand: [0.05, 0.47], t0Max: 0.8, k: [0.35, 1.2], out: 1.5 },
    miss: { reach: 0.5, hand: [0.15, 0.10], k: [0.55, 1], getUp: 1.55, jog: [4.5, 7.2], turn: 0.25 }
  },
  dive: { speed: 16, top: 13, standAt: 1.33 },
  bail: { safe: 3, perUnit: 3, min: 6, lie: 0.7, touch: 0.33 }, // out of stamina mid-flight: he falls; damage = (fall height − safe) × perUnit (at least `min`); lies `lie` s before getting up // flying, R2 held + L3: dive straight down (u/s), capped to `top` across, then roll out of the landing; `standAt` = on his feet (clip time) // Falling-to-Landing plays after flight or a fall from at least `minDrop` above the ground; control returns `lock` of the way through the landing
  fly: { descend: 0.75, pitchClimb: 0.85, speed: 13, boost: 22, climb: 7, ceiling: 45, holdToFly: 0.3 }, // flight speeds (units/s), max height above ground, and how long ✕ is held after the double jump to take off
  comboWindow: 0.5,  // seconds after a punch ends in which the next press continues the chain
  comboCancel: 0.06, // (Seers) their next combo blow can cut in this long after the last contact
  attackSpeed: 1.2,  // every attack clip (fists, feet, weapons, blasts, running moves) plays this much faster
  comboBlend: 0.12, // a queued next hit starts this long before the current clip's end, so the chain flows (every clip still plays through)
  comboDamage: [1, 1, 1.5, 2] // punch damage multiplier per combo stage
};

const _v = new THREE.Vector3();
// Seconds until touchdown from height h with vertical speed vy (gravity is heavier on the way down).
// Wall flip (Run To Flip): the clip's own hip path, sampled at 30 fps and measured in hip heights.
// Z is the hips' distance out from the wall, Y their height above the standing pose. Rizer's body
// travels this exact arc on the wall, so the foot plants on the wall and the flip carries him off it
// the way the mocap did. Times (s): reach = foot swinging up to the wall, plant = foot on the wall,
// peak = top of the flip (physics takes the fall from here), touch = feet back on the ground.
const WALLFLIP = {
  Z: [2.743,2.589,2.435,2.262,2.101,1.942,1.805,1.681,1.556,1.425,1.305,1.204,1.119,1.032,0.969,0.926,0.895,0.878,0.879,0.898,0.913,0.947,0.98,1.004,1.026,1.062,1.109,1.166,1.228,1.306,1.398,1.49,1.577,1.654,1.725,1.787,1.841,1.883,1.917,1.958,1.992],
  Y: [-0.101,-0.144,-0.175,-0.203,-0.239,-0.242,-0.234,-0.21,-0.162,-0.09,0.001,0.084,0.157,0.226,0.306,0.377,0.444,0.507,0.576,0.652,0.711,0.764,0.806,0.84,0.876,0.91,0.935,0.948,0.953,0.947,0.921,0.866,0.784,0.685,0.568,0.436,0.282,0.132,-0.027,-0.145,-0.178],
  reach: 0.33, plant: 0.43, peak: 0.93, touch: 1.25,
  range: 5.5,      // furthest a wall can be (from his feet point) when ✕ is pressed (≈0.7 s out at a full run)
  footUp: 1.15,    // how high the wall must reach above his feet point (in hip heights) to take a foot
  minApproach: 3.5 // he closes on the wall at least this fast once the flip is called
};
// Rolling landing (Fast Controlled Landing): the hips' forward travel at 30 fps, in hip heights. Feet touch at 0.33 s.
const ROLL_Z = [0.017,0.105,0.197,0.294,0.395,0.498,0.603,0.708,0.815,0.911,0.974,1.011,1.057,1.135,1.257,1.437,1.666,1.898,2.107,2.29,2.449,2.585,2.701,2.795,2.87,2.938,3.011,3.108,3.233,3.351,3.435,3.494,3.54,3.575,3.606,3.643,3.683,3.712,3.728,3.74,3.749,3.754,3.76,3.764,3.768,3.77];
// Kick-up combo: the hips' forward travel at 30 fps, in hip heights (dive to the hands, inverted kick, kip up, run off).
const KICKUP_Z = [-0.017,0.11,0.244,0.367,0.485,0.608,0.729,0.844,0.955,1.071,1.195,1.326,1.466,1.621,1.784,1.933,2.071,2.203,2.326,2.442,2.522,2.566,2.615,2.675,2.707,2.701,2.695,2.706,2.73,2.747,2.756,2.762,2.758,2.746,2.728,2.704,2.67,2.633,2.595,2.558,2.533,2.526,2.526,2.514,2.502,2.527,2.565,2.594,2.633,2.683,2.722,2.757,2.788,2.82,2.851,2.874,2.891,2.913,2.948,2.985,3.012,3.033,3.066,3.119,3.185,3.267,3.361,3.477,3.604];
// Running Vault (running vault waist level): the clip's hips path along +Z, 30 fps, in hip heights. Feet leave the
// ground at ~0.43 s, the body is over the obstacle at ~0.73 s (`peak`), first touchdown ~1.13 s, then it runs out.
const VAULT_Z = [-0.024,0.133,0.286,0.455,0.624,0.734,0.874,1.01,1.145,1.272,1.39,1.499,1.614,1.718,1.814,1.915,2.026,2.146,2.265,2.386,2.513,2.64,2.758,2.865,2.96,3.053,3.133,3.21,3.286,3.357,3.445,3.539,3.632,3.745,3.834,3.919,4.007,4.09,4.175,4.276,4.374,4.48,4.592,4.7,4.791,4.867,4.931,4.987,5.045,5.102,5.167,5.232,5.311,5.4,5.488,5.579,5.673,5.779,5.883,5.98,6.073,6.163,6.253];
const vaultAt = t => { const f = clamp(t * 30, 0, VAULT_Z.length - 1.001), i = Math.floor(f); return VAULT_Z[i] + (VAULT_Z[i + 1] - VAULT_Z[i]) * (f - i); };
const kickAt = t => { const f = clamp(t * 30, 0, KICKUP_Z.length - 1.001), i = Math.floor(f); return KICKUP_Z[i] + (KICKUP_Z[i + 1] - KICKUP_Z[i]) * (f - i); };
const rollAt = t => { const f = clamp(t * 30, 0, ROLL_Z.length - 1.001), i = Math.floor(f); return ROLL_Z[i] + (ROLL_Z[i + 1] - ROLL_Z[i]) * (f - i); };
const wfAt = (arr, t) => { const f = clamp(t * 30, 0, arr.length - 1.001), i = Math.floor(f); return arr[i] + (arr[i + 1] - arr[i]) * (f - i); };
function airTime(h, vy) {
  const g = TUNE.gravity, gd = g * TUNE.fallMul; h = Math.max(0, h);
  if (vy > 0) { const up = vy / g, peak = h + vy * vy / (2 * g); return up + Math.sqrt(2 * peak / gd); }
  return (vy + Math.sqrt(vy * vy + 2 * gd * h)) / gd;
}
const TUNE = {
  walk: 3.2, run: 7.2, sprint: 12.4, accelGround: 42, accelAir: 11, brake: 30,
  turnRate: 14, jumpVel: 9.2, gravity: 27, fallMul: 1.55, jumpCut: 0.5, coyote: 0.12, buffer: 0.14,
  radius: 0.6, stepDown: 0.65, wadeMul: 0.55
};
// Where fae, faery and astral fae hover: the height of Rizer's hands (above his feet) at the top of the
// catch leap in catch_fae_success — measured on his rig in-game (hand centre 2.59 at 1.13–1.2 s). The miss
// clip's lunge tops out ~0.25 lower (fingertips just under it), which is what makes it read as a whiff.
export const FAE_HAND_HEIGHT = 2.59;
// Fae catch clips: the hips' travel at 30 fps, in hip heights, in the clip's own frame (x = his left, z = forward).
// catch_fae_success: jog-in to ~0.83 s, leap, catch at ~1.15 s, land ~1.45 s, recover.
const FAE_HIT = {
  x: [0.001,-0.009,-0.018,-0.024,-0.029,-0.03,-0.028,-0.024,-0.02,-0.014,-0.01,-0.007,-0.004,0.004,0.008,0.01,0.013,0.012,0.013,0.021,0.027,0.037,0.049,0.063,0.067,0.062,0.065,0.09,0.12,0.14,0.16,0.181,0.196,0.206,0.219,0.231,0.245,0.257,0.269,0.279,0.286,0.292,0.299,0.31,0.313,0.316,0.335,0.363,0.389,0.421,0.461,0.501,0.536,0.569,0.603,0.639,0.667,0.695,0.718,0.737,0.75],
  z: [-0.004,0.027,0.057,0.089,0.12,0.151,0.185,0.223,0.262,0.3,0.336,0.366,0.406,0.477,0.584,0.706,0.834,0.957,1.088,1.239,1.413,1.598,1.765,1.915,2.028,2.135,2.238,2.355,2.464,2.544,2.634,2.72,2.803,2.893,2.989,3.081,3.173,3.261,3.347,3.428,3.506,3.584,3.659,3.722,3.769,3.801,3.833,3.869,3.906,3.947,3.994,4.035,4.07,4.102,4.129,4.15,4.165,4.179,4.2,4.219,4.237]
};
// catch_fae_miss: a lunge up and to his left, the reach tops out at ~0.5 s, then he dives flat (down by ~1.15 s).
const FAE_MISS = {
  x: [-0.63,-0.595,-0.564,-0.524,-0.475,-0.4,-0.301,-0.197,-0.091,0.013,0.127,0.243,0.35,0.433,0.482,0.515,0.568,0.62,0.674,0.732,0.797,0.866,0.936,1.008,1.086,1.172,1.262,1.345,1.426,1.511,1.604,1.703,1.797,1.883,1.952,1.996,2.02,2.03,2.041,2.051,2.064,2.08,2.089,2.089,2.082,2.073,2.065,2.06,2.059,2.062,2.067,2.072,2.075,2.077,2.08,2.088,2.099,2.108,2.114,2.117,2.117,2.117,2.118,2.119,2.12,2.123,2.126,2.13,2.133,2.136,2.137,2.138,2.139,2.139,2.14],
  z: [0.317,0.325,0.335,0.345,0.352,0.35,0.337,0.326,0.317,0.314,0.312,0.313,0.32,0.338,0.372,0.413,0.446,0.478,0.508,0.538,0.564,0.586,0.605,0.623,0.639,0.653,0.668,0.675,0.673,0.671,0.682,0.708,0.741,0.774,0.795,0.804,0.802,0.796,0.79,0.793,0.798,0.798,0.799,0.803,0.809,0.817,0.824,0.831,0.837,0.843,0.849,0.855,0.862,0.868,0.872,0.874,0.874,0.874,0.875,0.876,0.876,0.877,0.877,0.877,0.876,0.876,0.876,0.876,0.878,0.879,0.88,0.881,0.882,0.883,0.883]
};

function buildBody() {
  const M = (c, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const skin = M('#d6ad86'), cloth = M('#b34e3e'), dark = M('#343c38'), gold = M('#dfbd70', 0.45), boot = M('#4a3a2c');
  const cast = m => { m.castShadow = true; return m; };
  const root = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 1.02; root.add(hips);
  const torso = new THREE.Group(); hips.add(torso);
  const chest = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.62, 4, 10), cloth)); chest.position.y = 0.46; torso.add(chest);
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.13, 0.5), gold); sash.position.set(0, 0.2, 0.02); torso.add(sash);
  const neck = new THREE.Group(); neck.position.y = 1.02; torso.add(neck);
  const head = new THREE.Group(); neck.add(head);
  const skull = cast(new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), skin)); skull.position.y = 0.2; skull.scale.set(0.92, 1.05, 0.9); head.add(skull);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), dark); hair.position.set(0, 0.36, -0.05); hair.scale.set(1, 0.7, 0.98); head.add(hair);
  for (const x of [-0.12, 0.12]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), M('#1d1f1f', 0.3)); e.position.set(x, 0.23, 0.29); head.add(e); }
  const limb = (parent, x, y, r, len, mat, lower) => {
    const pivot = new THREE.Group(); pivot.position.set(x, y, 0); parent.add(pivot);
    const up = cast(new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, 8), mat)); up.position.y = -len / 2 - r * 0.4; pivot.add(up);
    const joint = new THREE.Group(); joint.position.y = -len - r * 0.8; pivot.add(joint);
    const lo = cast(new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.92, len * 0.9, 3, 8), lower || mat)); lo.position.y = -len * 0.45 - r * 0.3; joint.add(lo);
    return { pivot, joint, end: lo };
  };
  const legL = limb(hips, -0.2, -0.02, 0.15, 0.36, dark, boot), legR = limb(hips, 0.2, -0.02, 0.15, 0.36, dark, boot);
  const armL = limb(torso, -0.55, 0.86, 0.12, 0.3, cloth, skin), armR = limb(torso, 0.55, 0.86, 0.12, 0.3, cloth, skin);
  // scarf: three segments that trail on a spring
  const scarf = []; let prev = torso;
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group(); g.position.set(i ? 0 : 0.16, i ? -0.28 : 0.92, i ? 0 : -0.36); prev.add(g);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.2 - i * 0.03, 0.3, 0.05), cloth); m.position.y = -0.14; g.add(m); m.castShadow = true;
    scarf.push(g); prev = g;
  }
  return { root, hips, torso, neck, head, legL, legR, armL, armR, scarf };
}

export class Rizer {
  constructor(scene, start) {
    this.obj = new THREE.Group(); scene.add(this.obj);
    this.body = buildBody(); this.obj.add(this.body.root);
    this.obj.position.set(start.x, start.y, start.z);
    this.facing = start.facing || 0; this.body.root.rotation.y = this.facing;
    this.vel = new THREE.Vector3(); this.vy = 0;
    this.onGround = true; this.coyote = 0; this.buffer = 0; this.airTime = 0;
    this.phase = 0; this.lean = 0; this.bank = 0; this.squash = 0; this.landDip = 0;
    this.speed = 0; this.mode = 'idle'; this.wading = false; this.events = [];
    this.scarfVel = [0, 0, 0]; this.scarfAng = [0, 0, 0];
    this.actor = null; this.cast = {}; this.charKey = null; this.C = null;
    this.comboStage = 0; this.comboT = 0; this.strikeStage = 1; this.comboKind = null;
    this.weapon = 'fists'; this.swordAt = 'hip'; this.handWeapon = null; this.swap = null; this.pick = null; this.crouched = false; this.autoLand = false; this.lockPos = null; this.flying = false; this.dodgeT = 0; this.dodgeCool = 0; this.dodgeDir = new THREE.Vector3(); this.usedDouble = false; this.swimW = 0; this.ledge = null; this.ledgeCooldown = 0; this.teeter = null; this.groundNormal = new THREE.Vector3(0, 1, 0); this.slopeSliding = false; this.prayer = null; this.prayerIntent = 0; this.prayerSpentHold = false;
    this.hp = this.maxHp; this.stamina = this.maxStamina; this.astralEnergy = this.maxAstralEnergy; this.hurtT = 0; this.sinceHurt = 99; this.attack = null; this.knock = new THREE.Vector3(); this.flinch = 0; this.guardT = 0; this.parryT = 0; this.lastParried = false;
    this.ready = this.setCharacter(DEFAULT_CHARACTER);
  }
  get model() { return this.actor?.model; }
  get maxHp() { return maxHpOf(COMBAT.maxHp); }          // LABS › ASTRAL stats and mods (astral-stats.js)
  get maxStamina() { return maxStaminaOf(100); }
  get maxAstralEnergy() { return maxEnergyOf(100); }
  spendEnergy(amount) { if (this.god) return true; if (this.astralEnergy < amount) return false; this.astralEnergy -= amount; return true; }
  // Swap the visible character; each GLB loads once and is kept.
  async setCharacter(key) {
    try {
      const C = CHARACTERS[key];
      this.cast[key] ||= loadGLB(C.url).then(async g => {
        const a = new Actor(g, C.scale, C.animProfile || key); a.cadence = RUN_CADENCE;
        if (C.build) { await preloadBuild(C.build); applyBuildToActor(a, C.build); } // a Build Lab character: its head, hair, assets and sliders
        a.pivot.visible = false; this.body.root.add(a.pivot); return a;
      });
      const actor = await this.cast[key];
      for (const k in this.cast) (await this.cast[k]).pivot.visible = false;
      actor.pivot.visible = true; this.body.hips.visible = false;
      this.actor = actor; this.C = C; this.charKey = key;
      return C.name;
    } catch (e) { console.warn('[rp7d] character model failed, keeping current body', e); }
  }
  // Punch or kick. Both chain: presses in quick succession walk the combo
  // 1 → 2 → 3 → 4 (as far as the actor has combo clips: punch/punch2.. or kick/kick2..),
  // then start over at 1. No mashing: every hit plays its whole clip. A press only counts once
  // the current hit has landed (earlier presses are ignored); it queues the next stage, which
  // starts as the current clip finishes. After a hit ends, a press inside COMBAT.comboWindow
  // continues the chain; switching punch ↔ kick (or weapon) starts that chain at 1.
  strike(kind) {
    const at = this.attack;
    if (this.dodgeT <= 0 && this.dodgeLock > 0) { this.dodgeLock = 0; this.actor?.release(this.dodgeKind === 'aerial' ? 'aerialEvade' : this.dodgeKind || 'dodge', 0.12); } // strike straight out of a roll
    if (this.dodgeT > 0 || this.landLock > 0 || this.hp <= 0 || this.blocking || this.vault || this.ledge || this.teeter || this.fc || this.slam) return false;
    if (kind === 'punch' && (this.weapon === 'bow' || this.weapon === 'guitar' || this.weapon === 'telescope' || this.weapon === 'blaster')) return false; // bow shots are ranged (Pearlbow); □ with the guitar plays it (game.js · toggleGuitar)
    if (kind === 'punch' && BLADES[this.weapon]) kind = this.weapon; // □ swings the equipped melee weapon
    this.finishSwap(0.1);
    if (BLADES[kind] && (this.swordAt !== 'hand' || this.handWeapon !== kind)) { this.swordAt = 'hand'; this.handWeapon = kind; } // never swing an empty hand
    if (this.pick) return false;
    // running + □ with the axe or a longsword drawn: the heavy running attack (its own clip, carrying the run)
    if ((kind === 'axe' || kind === 'rubypaw') && !at && !this.flying && (this.onGround || this.airTime < 0.2) && ((this.runGrace > 0 && this.speed > 3) || this.speed >= COMBAT.runpunch.minSpeed) && this.actor?.has('heavyRunAttack')) { this.actor?.release('emote'); return this.startStrike(kind, 1, 0, 'heavyRunAttack'); }
    // running + △: the flying kick (its own one-hit move, not part of the kick chain)
    // running + □ (fists): the running punch · running + △: the flying kick — their own moves, not part of the chains
    { const run = kind === 'kick' ? 'flykick' : kind === 'punch' ? 'runpunch' : null;
      if (run && !at && !this.flying && (this.onGround || this.airTime < 0.2) && ((this.runGrace > 0 && this.speed > 3) || this.speed >= COMBAT[run].minSpeed) && this.actor?.has(run)) { this.actor?.release('emote'); return this.startStrike(run, 1); } }
    if (kind === 'kick' && at?.kind === 'flykick' && at.t < COMBAT.kickup.tap && this.actor?.has('kickup')) { // △△ while running: the flying kick becomes the kick-up
      const entry = at.entry; this.attack = null; this.startStrike('kickup', 1); this.attack.entry = entry; return true;
    }
    if (at?.kind === kind) { if (at.hi < at.hits.length) return false; at.queued = 1; return true; } // only after this hit has landed: queue the next one
    if (at) return false; // a different attack waits for this one to play out
    if (kind === 'kick' && !this.onGround) return false;
    this.actor?.release('emote');
    const cont = this.comboT > 0 && this.comboKind === kind && this.comboStage < this.comboMax(kind);
    return this.startStrike(kind, cont ? this.comboStage + 1 : 1);
  }
  // Aerial slam: start the dive at `target` (a world point: the locked enemy). False when he can't (on the ground,
  // too low, too far, busy). slamStep owns him until he is back on his feet; 'slamImpact' fires as he hits the ground.
  airSlam(target, world, stopAt = COMBAT.airslam.stop) { // stopAt: how far short of the target's centre he lands
    const A = this.actor, S = COMBAT.airslam, p = this.position;
    if (!A?.has('airslam') || !target || this.slam || this.hp <= 0 || this.attack || this.ledge || this.teeter || this.vault || this.bail || this.fc || this.wf || this.pick || this.rpick || this.seq || this.inUfo || this.swimW > 0.5) return false;
    if (this.onGround && !this.flying) return false;
    const dx = target.x - p.x, dz = target.z - p.z, d = Math.hypot(dx, dz); if (d > S.range) return false;
    const stop = Math.min(stopAt, d), ux = d > 0.05 ? dx / d : Math.sin(this.facing), uz = d > 0.05 ? dz / d : Math.cos(this.facing);
    const to = new THREE.Vector3(target.x - ux * stop, 0, target.z - uz * stop); to.y = world.groundAt(to.x, to.z, (target.y ?? p.y) + 1.5);
    if (p.y - to.y < S.minHeight) return false;
    const dur = clamp(p.distanceTo(to) / S.speed, S.time[0], S.time[1]);
    this.finishSwap(0.1); this.flying = false; this.autoLand = false; this.crouched = false; this.dodgeT = 0; this.dodgeLock = 0; this.auto = null;
    this.facing = Math.atan2(ux, uz); A.release('emote');
    A.play('airslam', S.impact / dur); // the fist comes down exactly as he arrives
    this.slam = { t: 0, dur, from: p.clone(), to, face: this.facing, phase: 'dive', begun: false };
    return true;
  }
  slamStep(dt, world) {
    const s = this.slam, A = this.actor, p = this.position, S = COMBAT.airslam;
    if (!A || this.hp <= 0 || A.shot?.kind !== 'airslam') { // knocked out, or the clip was taken from him
      if (A?.shot?.kind === 'airslam') A.release('airslam', 0.15);
      if (s.phase === 'dive') { this.onGround = false; this.vy = -2; } this.slam = null; return;
    }
    if (!s.begun) { s.begun = true; this.events.push('airslam'); }
    s.t += dt; this.vel.set(0, 0, 0); this.speed = 0; this.vy = 0; this.facing = s.face;
    if (s.phase === 'dive') {
      const k = Math.min(1, s.t / s.dur), h = k * (0.55 + 0.45 * k), v = k * k; // he drops faster and faster
      p.set(s.from.x + (s.to.x - s.from.x) * h, s.from.y + (s.to.y - s.from.y) * v, s.from.z + (s.to.z - s.from.z) * h); this.onGround = false;
      if (k >= 1) {
        p.copy(s.to); world.resolve(p, TUNE.radius ?? 0.4); p.y = world.groundAt(p.x, p.z, p.y + 1);
        s.phase = 'land'; this.onGround = true; this.airTime = 0; this.usedDouble = false; this.landDip = 0.2;
        if (A.shot) { A.shot.t = Math.max(A.shot.t, S.impact); A.shot.speed = S.recover; }
        this.events.push('slamImpact');
      }
    } else {
      p.y = world.groundAt(p.x, p.z, p.y + 1); this.onGround = true;
      if (A.shot.t >= S.out) { A.release('airslam', 0.25); this.slam = null; this.landLock = Math.max(this.landLock || 0, 0.12); }
    }
    this.animate(dt, this.vel, {}); if (this.actor) this.animateModel(dt);
  }
  // Sword swings use the sword slots, falling back to the punch combo clips until sword clips are assigned.
  heavyDrawn() { return this.swordAt === 'hand' && (this.handWeapon === 'axe' || this.handWeapon === 'rubypaw'); }
  slotFor(kind, stage) { if (kind === 'kick' && this.heavyDrawn() && this.actor?.has('kickHeavy')) return 'kickHeavy'; const s = kind === 'rubypaw' ? (stage === 1 ? 'axe' : 'axe' + stage) : stage === 1 ? kind : kind + stage; return BLADES[kind] && !this.actor?.has(s) ? (stage === 1 ? 'punch' : 'punch' + stage) : s; }
  // How many combo stages the current character has for `kind` (filled in a row).
  comboMax(kind = 'punch') { if (kind === 'kick' && this.heavyDrawn() && this.actor?.has('kickHeavy')) return 1; if (kind === 'rubypaw') kind = 'axe'; if (BLADES[kind] && !this.actor?.has(kind)) kind = 'punch'; let n = 1; while (n < 4 && this.actor?.has(kind + (n + 1))) n++; return n; }
  startStrike(kind, stage, queued = 0, slotOverride = null) {
    if (kind === 'blast' && !this.spendEnergy(8)) return false;
    const slot = slotOverride || this.slotFor(kind, stage), T = this.timing(slot);
    if (this.lockPos) this.facing = Math.atan2(this.lockPos.x - this.position.x, this.lockPos.z - this.position.z); // square up to the lock
    // Heavy clips carry a long idle lead-in and tail: start `lead` s before the first blow, recover `tail` s after the last.
    // Every hit plays its whole clip (heavy clips end `tail` s after their last blow instead of idling on).
    const Ck = COMBAT[kind], spd = Ck.speed * (Ck.stageSpeed?.[stage - 1] || 1) * COMBAT.attackSpeed, full = T.dur || T.recover / 0.85;
    const from = Ck.from != null ? Ck.from : Ck.lead != null ? Math.max(0, T.hits[0] - Ck.lead) : 0; if (Ck.from != null) T.hits = T.hits.filter(h => h >= from);
    const recover = Ck.tail != null ? Math.min(full, T.hits[T.hits.length - 1] + Ck.tail) : full;
    const od = Ck.overdrive?.stage === stage ? Ck.overdrive : null;
    this.attack = { kind, slot, stage, spd, od, t: from / spd, hits: T.hits, hi: 0, recover, queued };
    if (kind === 'flykick' || kind === 'runpunch' || slotOverride) { this.attack.entry = this.speed; this.attack.run = !!slotOverride; }
    if (kind === 'kickup') this.attack.hits = [COMBAT.kickup.hit]; // one blow: the inverted kick
    this.comboKind = kind; this.comboStage = stage; this.comboT = 0; this.comboFlash = stage;
    this.actor?.play(slot, spd, { from });
    return true;
  }
  startPunch(stage, queued = 0) { return this.startStrike('punch', stage, queued); }
  // Dodge roll: a quick burst along the stick (or facing), untouchable while rolling.
  // Hold L2: a running slide along the stick (or facing), low and untouchable like the roll; the clip plays out, then control returns.
  slide(dir) {
    const S = COMBAT.slide, A = this.actor;
    if (!A?.has('slide') || !this.onGround || this.flying || this.dodgeT > 0 || this.dodgeCool > 0 || this.hp <= 0 || this.stamina < S.stamina || this.swimW > 0.5) return false;
    this.stamina = Math.max(0, this.stamina - S.stamina);
    const d = dir && dir.lengthSq() > 0.01 ? dir.clone().setY(0).normalize() : new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing));
    this.dodgeAge = 0; this.perfectDone = false;
    const was = this.attack; this.dodgeKind = 'slide'; this.dodgeDir = d; this.dodgeT = S.time; this.attack = null; this.facing = Math.atan2(d.x, d.z); this.crouched = false;
    this.dodgeLock = Math.max(S.time, A.acts.slide.getClip().duration / S.anim * 0.9); this.dodgeCool = S.time + S.cooldown;
    this.keepChain(was); A.play('slide', S.anim); this.events.push('slide');
    return true;
  }
  // Rolling or sliding out of a combo keeps the chain alive: the next press after it continues at the next stage.
  keepChain(at) {
    if (at) { this.comboKind = at.kind; this.comboStage = at.stage; }
    if (at || this.comboT > 0) this.comboT = Math.max(this.comboT || 0, (this.dodgeLock || 0) + COMBAT.comboWindow);
  }
  dodge(dir) {
    if (!this.onGround || this.flying || this.dodgeT > 0 || this.dodgeCool > 0 || this.hp <= 0 || this.vault || this.fc || this.stamina < COMBAT.dodge.stamina * dodgeCostMul()) return false;
    this.dodgeKind = 'dodge'; this.dodgeAge = 0; this.perfectDone = false;
    this.stamina = Math.max(0, this.stamina - COMBAT.dodge.stamina * dodgeCostMul());
    if (this.boltThreat != null && this.boltThreat <= COMBAT.perfect.bolt && this.actor?.has('aerialEvade')) { // a bolt is about to land: the jump spin carries him clear of it
      const C = COMBAT.aerial, A = this.actor, d = dir && dir.lengthSq() > 0.01 ? dir.clone().setY(0).normalize() : new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing));
      this.dodgeKind = 'aerial'; this.dodgeDir = d; this.dodgeT = C.time; this.dodgeLock = C.time; this.dodgeCool = C.time + C.cooldown;
      this.attack = null; this.facing = Math.atan2(d.x, d.z);
      A.play('aerialEvade', clamp(A.acts.aerialEvade.getClip().duration / (C.time + 0.2), 0.8, 1.7));
      this.perfectDone = true; this.events.push('perfectDodge');
      return true;
    }
    const d = dir && dir.lengthSq() > 0.01 ? dir.clone().setY(0).normalize() : new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing));
    this.dodgeDir = d; this.dodgeT = COMBAT.dodge.time; this.dodgeCool = COMBAT.dodge.time + COMBAT.dodge.cooldown;
    const was = this.attack; this.attack = null; this.facing = Math.atan2(d.x, d.z);
    // the whole clip plays — roll, then the get-up — and control returns near its end
    const D = COMBAT.dodge, dur = this.actor?.has('dodge') ? this.actor.acts.dodge.getClip().duration : 0;
    this.dodgeLock = dur ? Math.max(D.time, dur * D.rise / D.anim + dur * (D.getUp - D.rise) / D.riseAnim) : D.time;
    this.dodgeCool = D.time + D.cooldown; // chainable: roll again as soon as this roll's burst is done
    this.keepChain(was); this.actor?.play('dodge', COMBAT.dodge.anim);
    return true;
  }
  // Emote (Flair): loops until you move, jump or fight.
  // Running pick-up: scoop loot off the ground without breaking stride (Pick Up Item). He steers so the item
  // passes his right hand at the scoop, and onGrab fires on that frame.
  runPick(L, onGrab) {
    const A = this.actor; if (!A?.has('runpickup') || this.attack || this.pick || this.rpick || !this.onGround) return false;
    const spd = clamp(this.speed / 6.5, 0.9, 1.3);
    A.play('runpickup', spd); this.rpick = { t: 0, L, onGrab, spd, grab: COMBAT.runPick.grab / spd, end: A.acts.runpickup.getClip().duration / spd, v: Math.max(this.speed, COMBAT.runPick.min) };
    return true;
  }
  // Walk through a door with the Walk Inside Door clip (slot 'enter', or its mirror 'exitDoor' to leave).
  // door = { hx, hz: hinge · ux, uz: through the door · ex, ez: hinge → handle edge · reach: hinge → handle }.
  // His body follows the clip's own hip path relative to the door, placed so his hand meets the handle;
  // any gap between where he stands and that path closes over the first steps (no snapping).
  doorMark(door) {
    const H = this.hipHeight(), s = doorPath(0), a = s.fwd * H, b = door.reach + s.side * H; // hand on the handle at the clip's first frame
    return { x: door.hx + door.ux * a + door.ex * b, z: door.hz + door.uz * a + door.ez * b, face: Math.atan2(door.ux, door.uz) };
  }
  startDoorWalk(door, slot, hooks = {}, from = 0) { // from: start partway through (a respawn walks out already through the doorway)
    const A = this.actor; if (!A?.has(slot) || this.seq) return false;
    const m = this.doorMark(door), p = this.position;
    this.seq = { door, slot, t: from, hooks, ox: from ? 0 : p.x - m.x, oz: from ? 0 : p.z - m.z, H: this.hipHeight() };
    this.attack = null; this.auto = null; this.crouched = false; this.setBlock?.(false); this.facing = m.face;
    this.vel.set(0, 0, 0); this.vy = 0; this.speed = 0; this.onGround = true; this.flying = false; this.dodgeT = 0;
    A.play(slot, 1, { from }); A.shot.speed = 0;
    if (from) this.doorStep(0, this.lastWorld || { groundAt: () => p.y }); // stand him on the path right away
    return true;
  }
  // Move the walk onto another door (the same door seen from the other side of the scene switch).
  retargetDoor(door) { if (this.seq) { this.seq.door = door; this.seq.ox = this.seq.oz = 0; } }
  sitStep(dt) {
    this.vel.set(0, 0, 0); this.speed = 0; this.vy = 0; this.onGround = true; this.flying = false; this.attack = null; this.auto = null; this.crouched = false;
    this.animate(dt, this.vel.clone(), {});
    if (this.actor) this.animateModel(dt);
  }
  doorStep(dt, world) {
    const s = this.seq, A = this.actor, d = s.door, p = this.position;
    s.t = Math.min(DOORWALK.dur, s.t + dt);
    const m = this.doorMark(d), w = doorPath(s.t), a = w.fwd * s.H, b = d.reach + w.side * s.H;
    const k = 1 - Math.min(1, s.t / 0.35), fade = k * k * (3 - 2 * k); // any last few cm from the walk-up close as he reaches for the knob
    p.x = d.hx + d.ux * a + d.ex * b + s.ox * fade; p.z = d.hz + d.uz * a + d.ez * b + s.oz * fade;
    p.y = world.groundAt(p.x, p.z, p.y + 0.5);
    this.facing = m.face; this.vel.set(0, 0, 0); this.speed = 0; this.vy = 0; this.onGround = true;
    if (A?.shot?.kind === s.slot) { A.shot.t = s.t; A.shot.speed = 0; }
    s.hooks.step?.(s.t);
    if (s.t >= DOORWALK.dur) { this.seq = null; A?.release(s.slot, 0.2); s.hooks.done?.(); }
    this.animate(dt, this.vel.clone(), {});
    if (this.actor) this.animateModel(dt);
  }
  hipHeight() {
    if (this.hipH == null) { const A = this.actor, s = A?.gltf.scene, h = s?.getObjectByName('mixamorigHips'); if (!h) return 1.1; s.updateMatrixWorld(true); this.hipH = h.getWorldPosition(new THREE.Vector3()).y * A.scale; }
    return this.hipH;
  }
  // Catch only the edge of a walkable, nearly level surface. Roof slopes, trees and bare walls
  // have no safe landing point, so they remain ordinary jump / wall-flip collision.
  startLedge(world, direction) {
    const A = this.actor, p = this.position, L = COMBAT.ledge;
    if (!A?.has('ledgeGrab') || !A.has('ledgeClimb') || this.onGround || this.flying || this.vault || this.wf || this.bail || this.attack || this.pick || this.hurtT > 0 || this.ledgeCooldown > 0 || this.airTime < 0.08 || this.vy > 3 || this.hp <= 0) return false;
    const len = Math.hypot(direction.x, direction.z); if (len < 0.1) return false;
    const fx = direction.x / len, fz = direction.z / len, from = p.clone();
    const probe = new THREE.Vector3(), clear = (x, y, z, r = 0.08) => !world.resolve(probe.set(x, y, z), r, { stealth: true });
    for (let d = 0.35; d <= L.reach; d += 0.12) {
      const wx = p.x + fx * d, wz = p.z + fz * d;
      if (clear(wx, p.y + 0.55, wz)) continue; // no actual wall at hand range
      for (const inside of [0.75, 1.0, 1.25]) {
        const lx = p.x + fx * (d + inside), lz = p.z + fz * (d + inside);
        const top = world.surfaceAt?.(lx, lz, p.y + L.riseMax + 0.35);
        if (!Number.isFinite(top) || top - p.y < L.riseMin || top - p.y > L.riseMax) continue;
        const hangY = top - L.hangBelow;
        if (Math.abs(hangY - p.y) > 1.2 || !clear(wx, top + 0.16, wz) || !clear(lx, top + 0.12, lz, TUNE.radius)) continue;
        if (world.containsLand && !world.containsLand(lx, lz)) continue;
        const floor = (x, z) => world.surfaceAt(x, z, top + 0.15);
        if ([[0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]].some(([dx, dz]) => Math.abs(floor(lx + dx, lz + dz) - top) > 0.18)) continue;
        const hx = p.x + fx * Math.max(0, d - 0.48), hz = p.z + fz * Math.max(0, d - 0.48);
        const grabDur = A.acts.ledgeGrab.getClip().duration / L.grabSpeed;
        const climbDur = A.acts.ledgeClimb.getClip().duration / L.climbSpeed;
        this.finishSwap(0.1); this.swordAt = 'hip'; // keep both hands free for the ledge; heavy weapons ride on the back
        this.ledge = { phase: 'grab', t: 0, from, hx, hz, hangY, lx, lz, top, face: Math.atan2(fx, fz), grabDur, climbDur };
        this.attack = null; this.auto = null; this.dj = null; this.djHold = null; this.bl = null; this.crouched = false; this.buffer = 0;
        this.vel.set(0, 0, 0); this.vy = 0; this.speed = 0; this.facing = this.ledge.face;
        A.play('ledgeGrab', L.grabSpeed, { hold: true });
        return true;
      }
    }
    return false;
  }
  // Find the lip of the material surface beneath Rizer. Terrain cliffs do not
  // become magic grab volumes: this is deliberately limited to authored roofs,
  // platforms and other collision surfaces.
  edgeAhead(world, direction, reach = 0.65) {
    const p = this.position, len = Math.hypot(direction.x, direction.z);
    if (!world.surfaceAt || len < 0.1) return null;
    const dx = direction.x / len, dz = direction.z / len;
    const top = world.surfaceAt(p.x, p.z, p.y + 0.42);
    if (!Number.isFinite(top) || Math.abs(p.y - top) > 0.36) return null;
    let safe = 0, edge = null;
    for (let d = 0.12; d <= reach; d += 0.08) {
      const h = world.surfaceAt(p.x + dx * d, p.z + dz * d, top + 0.42);
      // Follow a continuous sloped roof until its real mesh surface ends;
      // comparing every sample to the starting height falsely marks a slope
      // as an edge before Rizer reaches the lip.
      if (Number.isFinite(h)) safe = d;
      else { edge = d; break; }
    }
    if (edge == null) return null;
    // Refine the actual lip so stopping and hanging use the same coordinate.
    let lo = safe, hi = edge;
    for (let i = 0; i < 7; i++) {
      const d = (lo + hi) * 0.5;
      const h = world.surfaceAt(p.x + dx * d, p.z + dz * d, top + 0.42);
      if (Number.isFinite(h)) lo = d; else hi = d;
    }
    const ex = p.x + dx * lo, ez = p.z + dz * lo;
    const below = world.groundAt(ex + dx * 0.95, ez + dz * 0.95, top + 0.2);
    if (top - below < 1.05) return null; // an ordinary step-down, not a ledge
    return { x: ex, z: ez, top, dx, dz, below };
  }
  startEdgeHang(world, direction, edge = null) {
    const A = this.actor, L = COMBAT.ledge, p = this.position;
    edge ||= this.edgeAhead(world, direction);
    if (!edge || !A?.has('ledgeGrab') || !A.has('ledgeClimb') || !this.onGround || this.flying || this.attack || this.pick || this.hurtT > 0 || this.ledgeCooldown > 0) return false;
    const hangY = edge.top - L.hangBelow;
    const hx = edge.x + edge.dx * 0.48, hz = edge.z + edge.dz * 0.48;
    const lx = edge.x - edge.dx * 0.72, lz = edge.z - edge.dz * 0.72;
    const from = p.clone(), dropDur = 0.32;
    this.finishSwap(0.1); this.swordAt = 'hip';
    this.ledge = { phase: 'drop', t: 0, from, hx, hz, hangY, lx, lz, top: edge.top,
      face: Math.atan2(-edge.dx, -edge.dz), dropDur,
      grabDur: dropDur, climbDur: A.acts.ledgeClimb.getClip().duration / L.climbSpeed };
    this.attack = null; this.auto = null; this.crouched = false; this.vel.set(0, 0, 0); this.vy = 0; this.speed = 0; this.onGround = false; this.facing = this.ledge.face;
    A.play('ledgeGrab', Math.max(0.65, A.acts.ledgeGrab.getClip().duration / dropDur), { hold: true });
    this.events.push('ledgeDropToHang');
    return true;
  }
  startTeeter(world, direction, edge = null) {
    const A = this.actor, p = this.position;
    edge ||= this.edgeAhead(world, direction);
    if (!edge || !A?.has('teeter') || !this.onGround || this.ledgeCooldown > 0) return false;
    p.x = edge.x - edge.dx * 0.34; p.z = edge.z - edge.dz * 0.34; p.y = edge.top;
    this.facing = Math.atan2(edge.dx, edge.dz); this.vel.set(0, 0, 0); this.speed = 0;
    // Play the authored stop once, then hold its final pose while waiting for input.
    A.play('teeter', 1, { hold: true });
    this.teeter = { t: 0, x: p.x, y: p.y, z: p.z, face: this.facing, edge: { ...edge }, dir: { x: edge.dx, z: edge.dz } };
    this.events.push('teeter');
    return true;
  }
  teeterStep(dt, world, inp = {}, camYaw = 0) {
    const t = this.teeter, A = this.actor, p = this.position;
    if (!t || !A || this.hp <= 0) { this.teeter = null; A?.release('teeter', 0.12); return false; }
    // Teeter is an input-owned parkour stop. Other animation updates must not
    // silently release it and let residual movement carry Rizer over the lip.
    if (A.shot?.kind !== 'teeter' && A.has('teeter')) A.play('teeter', 1, { hold: true });
    if (inp.jumpPressed) { // only an explicit jump releases the run-stop
      this.teeter = null; this.ledgeCooldown = 0; this.onGround = true; this.vy = 0; this.vel.set(0, 0, 0); this.speed = 0; A.release('teeter', 0.08); return false;
    }
    const ix = inp.x || 0, iz = inp.z || 0, mag = Math.hypot(ix, iz);
    const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = -fz, rz = fx;
    const mx = fx * -iz + rx * ix, mz = fz * -iz + rz * ix;
    const towardLip = mag > 0.2 && mx * t.dir.x + mz * t.dir.z > 0.25;
    if (inp.crouchPressed || (!inp.run && towardLip)) { // deliberate walk/crouch converts the stop into a hang
      this.onGround = true; this.vel.set(0, 0, 0); this.speed = 0; this.vy = 0;
      if (this.startEdgeHang(world, t.dir, t.edge)) { this.teeter = null; A.release('teeter', 0.08); this.ledgeStep(0, world, inp); return true; }
    }
    t.t += dt; p.set(t.x, world.groundAt(t.x, t.z, t.y + 0.35), t.z); this.facing = t.face;
    this.vel.set(0, 0, 0); this.speed = 0; this.vy = 0; this.onGround = true;
    this.animate(dt, this.vel, {}); this.animateModel(dt);
    return true;
  }
  ledgeStep(dt, world, inp = {}) {
    const l = this.ledge, A = this.actor, p = this.position;
    if (!l) return;
    const slot = l.phase === 'climb' ? 'ledgeClimb' : 'ledgeGrab';
    if (!A || this.hp <= 0 || this.hurtT > 0 || this.flying || A.shot?.kind !== slot) {
      A?.release(slot, 0.12); this.ledge = null; this.ledgeCooldown = 0.5; this.vy = -1; this.onGround = false; return;
    }
    l.t += dt; this.vel.set(0, 0, 0); this.speed = 0; this.vy = 0; this.onGround = false; this.facing = l.face;
    const ease = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
    if (l.phase === 'drop') {
      const k = ease(l.t / l.dropDur);
      p.set(l.from.x + (l.hx - l.from.x) * k, l.from.y + (l.hangY - l.from.y) * k, l.from.z + (l.hz - l.from.z) * k);
      if (l.t >= l.dropDur) { p.set(l.hx, l.hangY, l.hz); l.phase = 'hang'; l.t = 0; if (A.shot) { A.shot.t = Math.max(0, A.shot.dur - 1e-3); A.shot.speed = 0; A.shot.hold = true; } this.events.push('ledgeHang'); }
    } else if (l.phase === 'grab') {
      const k = ease(l.t / l.grabDur);
      p.set(l.from.x + (l.hx - l.from.x) * k, l.from.y + (l.hangY - l.from.y) * k, l.from.z + (l.hz - l.from.z) * k);
      if (l.t >= l.grabDur) {
        p.set(l.hx, l.hangY, l.hz); l.phase = 'hang'; l.t = 0;
        this.events.push('ledgeHang');
      }
    } else if (l.phase === 'hang') {
      p.set(l.hx, l.hangY, l.hz);
      if (inp.crouchPressed || inp.dodgePressed) {
        A.release('ledgeGrab', 0.12); this.ledge = null; this.ledgeCooldown = 0.65;
        this.usedDouble = true; this.vy = -1; this.events.push('ledgeDrop');
      } else if (inp.jumpPressed) {
        l.phase = 'climb'; l.t = 0;
        A.playAligned('ledgeClimb', 'LeftHand', COMBAT.ledge.climbSpeed);
        this.events.push('ledgeClimb');
      }
    } else {
      const k = l.t / l.climbDur, up = ease((k - 0.05) / 0.58), across = ease((k - 0.64) / 0.32);
      // Lift the body clear of the roof lip before moving the root over it.
      p.set(l.hx + (l.lx - l.hx) * across, l.hangY + (l.top + 0.22 - l.hangY) * up, l.hz + (l.lz - l.hz) * across);
      if (k >= 1) {
        p.set(l.lx, l.top, l.lz); this.ledge = null; this.ledgeCooldown = 0.4;
        this.onGround = true; this.airTime = 0; this.usedDouble = false; A.release('ledgeClimb', 0.18); this.events.push('land');
      }
    }
    this.animate(dt, this.vel, {}); if (this.actor) this.animateModel(dt);
  }
  // Running Vault: ✕ while running with a waist-high obstacle ahead. Probes along the run for the obstacle's front,
  // checks it's low enough to clear (free at `hi`·H), shallow enough (`depth`) and that there's room to land, then plays
  // the clip from the frame that puts his body over the obstacle's middle at `peak`. Returns true (vaulting),
  // 'wait' (an obstacle is coming up but still out of reach: hold the jump a moment) or false (just jump).
  startVault(world) {
    const A = this.actor, V = COMBAT.vault, p = this.position;
    if (!A?.has('vault') || !this.onGround || this.flying || this.wading || this.hp <= 0 || this.attack || this.dodgeT > 0 || this.hurtT > 0 || this.vault) return false;
    const H = this.hipHeight(), sp = Math.hypot(this.vel.x, this.vel.z), fx = sp > 1 ? this.vel.x / sp : Math.sin(this.facing), fz = sp > 1 ? this.vel.z / sp : Math.cos(this.facing);
    const q = new THREE.Vector3(), g0 = world.groundAt(p.x, p.z, p.y + 0.5);
    const solid = (d, side, h) => { const x = p.x + fx * d - fz * side, z = p.z + fz * d + fx * side; q.set(x, g0 + h, z); return world.resolve(q, 0.08); };
    const lanes = [0, -0.28, 0.28], lo = V.lo * H;
    let front = null;
    for (let d = 0.3; d <= V.reach; d += 0.1) if (lanes.some(s => solid(d, s, lo))) { front = d; break; }
    if (front == null) return false;
    let back = front;
    while (back < front + V.depth + 0.1 && lanes.some(s => solid(back, s, lo))) back += 0.1;
    const depth = back - front;
    if (depth > V.depth) return false;                                                        // a wall, not a fence
    for (let d = front; d < back; d += 0.1) if (lanes.some(s => solid(d, s, V.hi * H))) return false; // too tall to clear
    for (let d = back; d < back + V.land; d += 0.1) if (lanes.some(s => solid(d, s, lo))) return false; // nowhere to land
    const gl = world.groundAt(p.x + fx * (back + 0.6), p.z + fz * (back + 0.6), g0 + 2);
    if (Math.abs(gl - g0) > 0.9 * H) return false;
    // clip start: its body crosses the obstacle's middle at `peak`
    const mid = (front + back) / 2, z0 = vaultAt(V.peak) - mid / H;
    if (z0 < 0) return 'wait';                                                                  // still too far
    let t0 = 0; while (t0 < V.t0Max && vaultAt(t0 + 1 / 60) <= z0) t0 += 1 / 60;
    if (front < V.near) return false;                                                           // right on top of it: no room to take off
    const spd = clamp(sp / (V.clipSpeed * H), V.speed[0], V.speed[1]);
    A.release('emote'); A.play('vault', spd, { from: t0 });
    this.vault = { t: t0, spd, face: Math.atan2(fx, fz), entry: sp, H, up: false, down: false };
    this.facing = this.vault.face; this.attack = null;
    return true;
  }
  // Wall flip: called on the second ✕ in the air. Looks ahead for a wall tall enough to take a foot;
  // if there is one, he keeps flying at it (no snapping), plants a foot at the clip's own contact
  // distance and flips off along the mocap arc. Returns false (a normal double jump) when there's no wall.
  startWallFlip(world) {
    const A = this.actor, p = this.position;
    if (!A?.has('wallflip') || this.flying || this.wading || this.hp <= 0 || this.hurtT > 0) return false;
    const H = this.hipHeight(), sp = Math.hypot(this.vel.x, this.vel.z);
    const dx = sp > 1.5 ? this.vel.x / sp : Math.sin(this.facing), dz = sp > 1.5 ? this.vel.z / sp : Math.cos(this.facing);
    const y = p.y + WALLFLIP.footUp * H, q = new THREE.Vector3(), t = new THREE.Vector3();
    const probe = (ox, oz) => { // first solid point along the travel line at foot-plant height
      for (let d = 0.2; d <= WALLFLIP.range; d += 0.08) {
        q.set(ox + dx * d, y, oz + dz * d); t.copy(q);
        if (world.resolve(t, 0.05, { stealth: true })) return { x: q.x, z: q.z, d };
      }
      return null;
    };
    const c = probe(p.x, p.z); if (!c) return false;
    // The wall's face from two side probes (falls back to square-on for a post or trunk).
    let nx = -dx, nz = -dz;
    const l = probe(p.x - dz * 0.35, p.z + dx * 0.35), r = probe(p.x + dz * 0.35, p.z - dx * 0.35);
    if (l && r && Math.abs(l.d - r.d) < 0.6) { const tx = r.x - l.x, tz = r.z - l.z, L = Math.hypot(tx, tz) || 1; nx = tz / L; nz = -tx / L; if (nx * dx + nz * dz > 0) { nx = -nx; nz = -nz; } }
    if (-(nx * dx + nz * dz) < 0.5) return false; // glancing along the wall, not at it
    const D = (p.x - c.x) * nx + (p.z - c.z) * nz, plantD = wfAt(WALLFLIP.Z, WALLFLIP.plant) * H;
    const s = Math.max(WALLFLIP.minApproach, -(this.vel.x * nx + this.vel.z * nz));
    // The second ✕ is a jump too: it lifts him just enough to reach the wall before he'd come down
    // (never more than the double jump would). Too far to make it: a normal double jump instead.
    const need = D > plantD ? (D - plantD) / s + 0.06 : 0, h0 = p.y - world.groundAt(p.x, p.z, p.y);
    let vy = this.vy; const vyMax = TUNE.jumpVel * COMBAT.doubleJump;
    while (airTime(h0, vy) < need && vy < vyMax) vy = Math.min(vyMax, Math.max(vy, 0) + 0.25);
    if (airTime(h0, vy) < need) return false;
    const rise = vy > 0 ? vy * vy / (2 * TUNE.gravity) : 0; // the wall must still be there at the height he'll reach it
    if (rise > 0.3) { const t2 = new THREE.Vector3(c.x, y + rise, c.z); if (!world.resolve(t2, 0.08, { stealth: true })) return false; }
    this.vy = vy;
    this.wf = { phase: 'approach', nx, nz, cx: c.x, cz: c.z, H, s, D0: Math.max(D, plantD + 0.01), plantD, face: Math.atan2(-nx, -nz) };
    this.dj = null; this.djHold = null; this.attack = null;
    A.play('wallflip', 1, { from: WALLFLIP.reach }); A.shot.speed = 0;
    return true;
  }
  wallFlipMove(dt, world, ev) {
    const w = this.wf, A = this.actor, p = this.position, W = WALLFLIP;
    const sh = A?.shot, D = (p.x - w.cx) * w.nx + (p.z - w.cz) * w.nz;
    if (!sh || sh.kind !== 'wallflip' || this.flying || this.hp <= 0 || this.hurtT > 0) { this.wf = null; this.dj = null; if (sh?.kind === 'wallflip') A.release('wallflip', 0.2); return; }
    if (w.phase === 'approach') {
      if (this.onGround) { this.wf = null; A.release('wallflip', 0.2); return; } // came down short of the wall
      this.vel.x = -w.nx * w.s; this.vel.z = -w.nz * w.s; // close on it square-on at his own pace
      sh.t = W.reach + (W.plant - W.reach) * clamp((w.D0 - D) / (w.D0 - w.plantD), 0, 1); sh.speed = 0; // the foot swings up to the wall as he nears it
      if (D - w.s * dt > w.plantD) return;
      w.phase = 'wall'; w.t = W.plant; w.px = p.x; w.pz = p.z; w.py = p.y; // foot on the wall, right where he is
      ev.push('wallplant');
    }
    if (w.phase === 'wall') {
      const t0 = w.t; w.t = Math.min(W.peak, w.t + dt);
      const out = (wfAt(W.Z, w.t) - wfAt(W.Z, W.plant)) * w.H, up = (wfAt(W.Y, w.t) - wfAt(W.Y, W.plant)) * w.H;
      this.vel.x = (w.px + w.nx * out - p.x) / dt; this.vel.z = (w.pz + w.nz * out - p.z) / dt;
      w.y = w.py + up; w.vy = (wfAt(W.Y, w.t) - wfAt(W.Y, t0)) * w.H / dt;
      sh.t = w.t; sh.speed = 0;
      if (w.t < W.peak) return;
      // Top of the flip: gravity takes the fall, still travelling out from the wall at the clip's pace,
      // and the clip is steered so its touchdown frame meets the ground (same as the double jump).
      const k = 2 / 30, away = (wfAt(W.Z, W.peak + k) - wfAt(W.Z, W.peak - k)) / (2 * k) * w.H;
      w.phase = 'fall'; w.vx = w.nx * away; w.vz = w.nz * away;
      this.vy = (wfAt(W.Y, W.peak + k) - wfAt(W.Y, W.peak - k)) / (2 * k) * w.H;
      this.dj = { from: W.peak, to: W.touch, t: 0, kind: 'wallflip' };
    }
    if (w.phase === 'fall') {
      if (this.onGround) { this.wf = null; this.landLock = Math.max(this.landLock || 0, 0.3); this.vel.x = 0; this.vel.z = 0; return; }
      this.vel.x = w.vx; this.vel.z = w.vz; // a committed flip: no air steering
    }
  }
  emote() { if (this.onGround && !this.attack && this.hp > 0) return this.actor?.play('emote', 1, { loop: true, soft: true }); }
  // Interact at a place: walk in through a door, otherwise the landmark / pick-up clip.
  // Pick something up at `target` (a point at hand height): step to it, play the pick-up clip, and call
  // onGrab at the clip's grab frame. Movement is held until just after the grab.
  // `from` (optional): the side to reach from, as a unit direction pointing from the item toward where he stands.
  pickUp(target, onGrab, animation = 'pickup', { from = null, around = null } = {}) {
    if (this.attack || !this.onGround || this.flying || this.pick || this.hp <= 0) return false;
    const P = COMBAT[animation === 'store' ? 'store' : 'pickup'];
    let dx = target.x - this.position.x, dz = target.z - this.position.z, d = Math.hypot(dx, dz) || 1;
    if (from) { dx = -from.x; dz = -from.z; d = Math.hypot(dx, dz) || 1; }
    // Never slide onto it: walk (a normal, casual walk) to where his hand will meet it, turn to it, then reach.
    const stand = { x: target.x - dx / d * P.reach, z: target.z - dz / d * P.reach }, face = Math.atan2(dx, dz);
    this.crouched = false;
    return this.walkTo(stand, face, () => this.startPick(target, onGrab, animation), { around });
  }
  startPick(target, onGrab, animation) {
    if (this.attack || !this.onGround || this.flying || this.pick || this.hp <= 0) return false;
    const A = this.actor, P = COMBAT[animation === 'store' ? 'store' : 'pickup'], dur = A?.has(animation) ? A.acts[animation].getClip().duration : 0;
    this.facing = Math.atan2(target.x - this.position.x, target.z - this.position.z);
    this.pick = { t: 0, grab: dur ? dur * P.grab / P.speed : 0.3, onGrab, animation };
    A?.play(animation, P.speed);
    return true;
  }
  // Auto-walk to a spot (x, z), turn to `face`, then run `then`. Right there already: just turn and go.
  // Pushing the stick takes control back and cancels it. Gets stuck on something → acts from where he is.
  // `around` ({ x, z, r }): an object in the way (a chest); he walks round it rather than into it.
  walkTo(to, face, then, { around = null, pass = null } = {}) { // pass: { x, z, r } — no collision inside it (stepping right up to a door)
    if (this.hp <= 0 || this.flying || !this.onGround) return false;
    const p = this.position, path = [];
    if (around) { // detour round its far side in steps of ≤ 50°, at a comfortable distance
      const R = around.r + 0.95, a0 = Math.atan2(p.x - around.x, p.z - around.z), a1 = Math.atan2(to.x - around.x, to.z - around.z);
      const da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0)), n = Math.floor(Math.abs(da) / 0.87);
      const seg = Math.hypot(to.x - p.x, to.z - p.z), cross = Math.abs((to.x - p.x) * (p.z - around.z) - (to.z - p.z) * (p.x - around.x)) / (seg || 1);
      if (Math.abs(da) > 0.6 && cross < around.r + 0.7) for (let i = 1; i <= n; i++) { const a = a0 + da * i / (n + 1); path.push({ x: around.x + Math.sin(a) * R, z: around.z + Math.cos(a) * R }); }
    }
    path.push({ x: to.x, z: to.z });
    this.auto = { path, to: path[0], face, then, t: 0, best: Infinity, still: 0, pass };
    return true;
  }
  // Change weapon: play the handling motion over locomotion so it never makes Rizer stop.
  // Blade → blade puts the one in hand away first, then draws the next.
  setWeapon(k) {
    if (k === this.weapon) return;
    this.weapon = k;
    if (this.ledge) { this.finishSwap(0.1); this.swordAt = 'hip'; this.handWeapon = k; return; }
    if (this.swordAt === 'hand' && BLADES[this.handWeapon]) this.sheatheThen(BLADES[k] ? k : null);
    else if (BLADES[k]) this.drawBlade(k);
  }
  // Each weapon can have its own take-out / put-away clips (drawAxe / sheatheAxe); otherwise the sword's.
  handling(w, kind) { if (w === 'rubypaw') return kind === 'draw' ? 'drawAxe' : kind === 'sheathe' ? 'sheatheAxe' : kind; const own = kind + (w ? w[0].toUpperCase() + w.slice(1) : ''); return this.actor?.has(own) ? own : kind; }
  drawBlade(k) {
    const A = this.actor, slot = this.handling(k, 'draw'), C = COMBAT[slot];
    if (A?.has(slot) && this.onGround && !this.flying && !this.attack) { A.play(slot, C.speed, { overlay: true }); this.swap = { to: 'hand', w: k, t: 0, at: A.acts[slot].getClip().duration * C.grab / C.speed }; }
    else { this.swordAt = 'hand'; this.handWeapon = k; }
  }
  sheatheThen(next = null) {
    const A = this.actor, slot = this.handling(this.handWeapon, 'sheathe'), C = COMBAT[slot];
    if (A?.has(slot) && this.onGround && !this.flying) { A.play(slot, C.speed, { overlay: true }); this.swap = { to: 'hip', w: this.handWeapon, next, t: 0, at: A.acts[slot].getClip().duration * C.grab / C.speed }; }
    else { this.swordAt = 'hip'; if (next) this.drawBlade(next); }
  }
  // Put what's in hand away (after picking up a new weapon); if a different weapon is equipped, draw it next.
  stow() { this.sheatheThen(BLADES[this.weapon] && this.weapon !== this.handWeapon ? this.weapon : null); }
  completeSwap() { const s = this.swap; if (!s) return; this.swap = null; this.swordAt = s.to; if (s.to === 'hand') this.handWeapon = s.w; if (s.next) this.drawBlade(s.next); }
  finishSwap(fade = 0.15) {
    const s = this.swap; if (!s) return; this.swap = null;
    this.swordAt = s.next ? 'hand' : s.to; this.handWeapon = s.next || (s.to === 'hand' ? s.w : this.handWeapon);
    const k = this.actor?.shot?.kind; if (/^(draw|sheathe)/.test(k || '')) this.actor.release(k, fade);
  }
  playInteract(atDoor) { const a = this.actor; if (!a || this.attack) return; a.play(atDoor && a.has('enter') ? 'enter' : 'interact', 1, { soft: true }); }
  // Try to catch a fae / faery / astral fae hovering at FAE_HAND_HEIGHT (○ on the ground near one; the
  // coin flip is made by the caller). Both clips carry their own motion, and he's placed along it so his
  // hands arrive at the fae on the clip's reach frame — `onReach(hit)` fires then (the catch, or the whiff).
  //   hit:  catch_fae_success from the right point in its jog-in (or stretched a little when it's far).
  //   miss: he jogs to where the sideways lunge needs him, lunges and whiffs, dives down, then stands up.
  // Returns false (nothing happens) if he's busy or the slot isn't filled.
  faeCatch(L, hit, onReach) {
    const A = this.actor, slot = hit ? 'faeCatch' : 'faeCatchMiss';
    if (!A?.has(slot) || this.fc || this.attack || this.pick || this.rpick || this.vault || this.wf || this.bail || this.seq || this.ledge || this.teeter || this.prayer ||
      !this.onGround || this.flying || this.hp <= 0 || this.hurtT > 0 || this.dodgeT > 0 || this.landLock > 0) return false;
    const F = COMBAT.faeCatch[hit ? 'hit' : 'miss'], path = hit ? FAE_HIT : FAE_MISS, H = this.hipHeight(), p = this.position;
    const dx = L.x - p.x, dz = L.z - p.z, D = Math.hypot(dx, dz);
    // where his hands are at the reach frame, relative to his feet at clip time t0 (model frame: [left, forward])
    const reach = (t0, k) => [k * (wfAt(path.x, F.reach) - wfAt(path.x, t0)) * H + F.hand[0], k * (wfAt(path.z, F.reach) - wfAt(path.z, t0)) * H + F.hand[1]];
    const len = (t0, k) => Math.hypot(...reach(t0, k));
    const solve = (f, lo, hi, want) => { for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (f(m) < want) lo = m; else hi = m; } return (lo + hi) / 2; }; // f rising
    let t0 = 0, k = 1;
    if (hit) {
      if (D >= len(0, 1)) k = solve(q => len(0, q), 1, F.k[1], D);                              // far: stretch the jog-in
      else if (D <= len(F.t0Max, 1)) { t0 = F.t0Max; k = solve(q => len(t0, q), F.k[0], 1, D); } // right under it: shorten the last steps
      else t0 = solve(t => -len(t, 1), 0, F.t0Max, -D);                                            // in between: start partway into the jog-in
    } else if (D < len(0, 1)) k = solve(q => len(0, q), F.k[0], 1, D);
    const r = reach(t0, k), aim = Math.atan2(dx, dz), turn = Math.atan2(r[0], r[1]); // facing f puts model [x, z] at world angle atan2(x, z) + f
    const fc = { slot, hit, F, path, H, k, t: t0, onReach, done: false, phase: 'clip', face: aim - turn, L };
    if (!hit) { // the lunge travels sideways: run to the spot from which it reaches the fae, facing its way
      let face = aim - turn, mx = p.x, mz = p.z;
      for (let i = 0; i < 12; i++) { // settle on a spot he can run straight into (his path lines up with the lunge's facing)
        mx = L.x - (r[0] * Math.cos(face) + r[1] * Math.sin(face)); mz = L.z - (-r[0] * Math.sin(face) + r[1] * Math.cos(face));
        const d = Math.hypot(mx - p.x, mz - p.z); if (d < 0.6) break;
        face = Math.atan2(mx - p.x, mz - p.z);
      }
      mx = L.x - (r[0] * Math.cos(face) + r[1] * Math.sin(face)); mz = L.z - (-r[0] * Math.sin(face) + r[1] * Math.cos(face));
      Object.assign(fc, { phase: 'jog', face, mx, mz, jogT: 0, v: clamp(this.speed, F.jog[0], F.jog[1]) });
    }
    { // where his feet will be on the reach frame (the fae is held at FAE_HAND_HEIGHT above the ground there)
      const vx = k * (wfAt(path.x, F.reach) - wfAt(path.x, t0)) * H, vz = k * (wfAt(path.z, F.reach) - wfAt(path.z, t0)) * H, f = fc.face;
      const sx = hit ? p.x : fc.mx, sz = hit ? p.z : fc.mz;
      fc.foot = { x: sx + vx * Math.cos(f) + vz * Math.sin(f), z: sz - vx * Math.sin(f) + vz * Math.cos(f) };
    }
    this.fc = fc; this.auto = null; this.crouched = false; A.release('emote');
    if (hit) { this.facing = fc.face; A.play(slot, 1, { from: t0 }); }
    return true;
  }
  // Called from update() once the velocity has been worked out: the catch owns his motion.
  faeCatchStep(dt) {
    const c = this.fc, A = this.actor, p = this.position, F = c.F;
    const stop = () => { this.fc = null; if (A?.shot?.kind === c.slot || A?.shot?.kind === 'standup') A.release(null, 0.15); };
    if (this.hp <= 0 || this.hurtT > 0 || this.flying || this.attack || this.dodgeT > 0 || this.ledge || this.teeter || this.bail || this.seq || this.prayer) return stop();
    if (c.phase === 'jog') {
      c.jogT += dt;
      const ax = c.mx - p.x, az = c.mz - p.z, d = Math.hypot(ax, az), step = c.v * dt;
      if (!this.onGround || c.jogT > 1.6) return stop(); // knocked off his line: give up quietly
      if (d > Math.max(0.12, step)) { // on the way: run to the mark, easing in over the last stretch
        const v = Math.min(c.v, d / 0.12 * 0.9 + 1.5);
        this.vel.x = ax / d * v; this.vel.z = az / d * v;
        this.facing = dampAngle(this.facing, d > 0.7 ? Math.atan2(ax, az) : c.face, 14, dt);
        return;
      }
      this.vel.x = 0; this.vel.z = 0; // there: square up to the lunge, then go
      const off = Math.abs(Math.atan2(Math.sin(c.face - this.facing), Math.cos(c.face - this.facing)));
      c.turnT = (c.turnT || 0) + dt;
      if (off > 0.08 && c.turnT < F.turn) { this.facing = dampAngle(this.facing, c.face, 18, dt); return; }
      this.facing = c.face; c.phase = 'clip'; c.t = 0; A.play(c.slot, 1);
      return;
    }
    if (c.phase === 'up') { // getting back up after the missed dive
      this.vel.x = 0; this.vel.z = 0;
      const sh = A?.shot;
      if (!sh || sh.kind !== 'standup') { this.fc = null; return; }
      if (sh.t >= sh.dur * 0.7) { sh.soft = true; this.fc = null; } // nearly up: moving blends out of the rest
      return;
    }
    if (A?.shot?.kind !== c.slot || !this.onGround) return stop();
    c.t += dt; this.facing = c.face;
    const f = c.face, cs = Math.cos(f), sn = Math.sin(f);
    const vx = (wfAt(c.path.x, c.t + 1 / 60) - wfAt(c.path.x, c.t - 1 / 60)) * 30 * c.H * c.k, vz = (wfAt(c.path.z, c.t + 1 / 60) - wfAt(c.path.z, c.t - 1 / 60)) * 30 * c.H * c.k;
    this.vel.x = vx * cs + vz * sn; this.vel.z = -vx * sn + vz * cs; // the clip's own hip travel, turned to his facing
    if (!c.done && c.t >= F.reach) { c.done = true; c.onReach?.(c.hit); }
    if (c.hit && c.t >= F.out) { A.shot.soft = true; this.fc = null; return; } // landed and recovering: any input blends out
    if (!c.hit && c.t >= F.getUp) { // down on the ground: stand back up from wherever the dive left him
      this.vel.x = 0; this.vel.z = 0;
      if (A.has('standup') && A.playAligned('standup', 'Head')) c.phase = 'up'; else stop();
    }
  }
  // Take a hit from `from` (a point) by `src` (the attacker). Returns false while still invulnerable.
  // The recovery frames after a hit shield you from everyone else, but not from the rest of the
  // same attacker's combo (so combos land, and two Seers can't stun-lock you together).
  // Take a hit from `from` (a point) by `src` (the attacker). Returns false while still invulnerable.
  // The recovery frames after a hit shield you from everyone else, but not from the rest of the
  // same attacker's combo (so combos land, and two Seers can't stun-lock you together).
  hurt(dmg, from, src = null) {
    if (this.inUfo) return false; // the pilot is protected while inside the vehicle
    const chain = src && src === this.hurtBy && this.hurtT > 0;
    if (this.dodgeT > 0 && this.hp > 0 && !(this.hurtT > 0 && !chain) && !this.perfectDone && (this.dodgeAge ?? 9) <= COMBAT.perfect.dodge) { this.perfectDone = true; this.events.push('perfectDodge'); } // the roll began just as this blow arrived
    if ((this.hurtT > 0 && !chain) || this.dodgeT > 0 || this.hp <= 0 || this.god) return false; // no damage mid-roll (or in dev god mode)
    this.hurtBy = src;
    this.lastParried = false;
    if (this.parryT > 0) return false; // mid-parry: everything is turned aside
    // Guard up: the blow is blocked (a sliver of damage, a small shove, some stamina). The block stance holds through
    // every hit — nothing breaks it yet, he doesn't flinch and he doesn't turn. If the guard went up just as the blow
    // arrived, from the front, it is a parry instead.
    if (this.blocking && from) {
      const B = COMBAT.block, P = COMBAT.parry, to = Math.atan2(from.x - this.position.x, from.z - this.position.z), off = Math.abs(Math.atan2(Math.sin(to - this.facing), Math.cos(to - this.facing)));
      this.sinceHurt = 0; this.hurtT = COMBAT.invuln * 0.6;
      if (this.guardT <= P.window && off < B.arc / 2 + 0.6) {
        const A = this.actor, dur = A?.has('parry') ? A.acts.parry.getClip().duration : P.time;
        A?.play('parry', 1); this.parryT = dur; this.guardT = P.window + 1; // one parry per raise of the guard
        this.lastBlocked = false; this.lastParried = true; this.events.push('parried');
        return true;
      }
      this.stamina = Math.max(0, this.stamina - B.stamina); this.hp = Math.max(0, this.hp - dmg * B.reduce);
      this.knock.set(this.position.x - from.x, 0, this.position.z - from.z).normalize().multiplyScalar(B.push); this.events.push('blocked'); this.lastBlocked = true;
      return true;
    }
    this.lastBlocked = false;
    this.hp = Math.max(0, this.hp - dmg); this.hurtT = COMBAT.invuln; this.sinceHurt = 0; this.flinch = 1;
    const d = new THREE.Vector3(this.position.x - from.x, 0, this.position.z - from.z).normalize();
    this.knock.copy(d).multiplyScalar(7); this.attack = null; if (this.hp <= 0) this.flying = false;
    if (this.actor) { this.actor.shot = null; if (this.hp <= 0) this.actor.play('knockdown', 1, { hold: true }); else this.actor.play('hurt'); }
    return true;
  }
  // Guard up / down: the block stance loops while it's held.
  setBlock(on) {
    if (on === !!this.blocking) return;
    this.blocking = on; this.events.push(on ? 'guard' : 'unguard'); if (on) this.guardT = 0;
    if (on) { this.attack = null; this.crouched = false; this.actor?.play('block', 1, { loop: true }); }
    else if (this.actor?.shot?.kind === 'block') this.actor.release('block', 0.18);
  }
  startPrayer() {
    const A = this.actor;
    if (!A?.has('prayKneel') || !A.has('prayHold') || !A.has('prayStand')) return false;
    this.finishSwap(0.1); this.setBlock(false);
    this.l2 = null; this.dodgeBuf = 0; this.auto = null; this.crouched = false;
    this.vel.set(0, 0, 0); this.speed = 0; this.vy = 0;
    this.prayer = { phase: 'kneel', t: 0, standAfterKneel: false };
    this.prayerSpentHold = true;
    A.play('prayKneel', 1, { hold: true });
    return true;
  }
  prayerStep(dt, keepPraying) {
    const p = this.prayer, A = this.actor; if (!p || !A) return;
    if (!keepPraying) p.standAfterKneel = true;
    p.t += dt; this.vel.set(0, 0, 0); this.speed = 0; this.vy = 0; this.onGround = true;
    this.restT = (this.restT || 0) + dt;
    if (p.phase === 'kneel' && p.t >= A.acts.prayKneel.getClip().duration) {
      p.phase = p.standAfterKneel ? 'stand' : 'hold'; p.t = 0;
      A.play(p.phase === 'hold' ? 'prayHold' : 'prayStand', 1, { hold: true, loop: p.phase === 'hold' });
    } else if (p.phase === 'hold') {
      if (p.standAfterKneel) { p.phase = 'stand'; p.t = 0; A.play('prayStand', 1, { hold: true }); }
      else {
        const P = COMBAT.prayer;
        this.hp = Math.min(this.maxHp, this.hp + P.hp * dt);
        this.astralEnergy = Math.min(this.maxAstralEnergy, this.astralEnergy + P.astral * dt);
        this.stamina = Math.min(this.maxStamina, this.stamina + P.stamina * dt);
      }
    } else if (p.phase === 'stand' && p.t >= A.acts.prayStand.getClip().duration) {
      A.release('prayStand', 0.18); this.prayer = null;
    }
    this.animate(dt, this.vel, {}); this.animateModel(dt);
  }
  // A melee blow landed (game.js · onLanded): astral energy charges up, more the deeper into the combo. Returns the gain.
  chargeAstral(stage = 1, finisher = false) {
    const R = COMBAT.regen, gain = ((R.astralHit[Math.min(R.astralHit.length, stage) - 1] || 1) + (finisher ? R.astralFinisher : 0)) * astralHitMul();
    const before = this.astralEnergy; this.astralEnergy = clamp(this.astralEnergy + gain, 0, this.maxAstralEnergy); return this.astralEnergy - before;
  }
  heal() { this.bail = null; this.bl = null; this.fc = null; this.hp = this.maxHp; this.stamina = this.maxStamina; this.astralEnergy = this.maxAstralEnergy; this.hurtT = 0; this.knock.set(0, 0, 0); this.attack = null; this.actor?.release(); }
  timing(kind) { return this.actor ? this.actor.timing(kind) : CLIPS[kind]; }
  animateModel(dt) {
    const A = this.actor, still = !!A.preview;
    A.update(dt, this.speed, this.onGround, this.vy);
    // Procedural slope contact is limited to the anatomical chain below the
    // waist. The locomotion clip supplies the stride; knees and ankles absorb
    // the grade so the feet follow hills without tilting the whole character.
    if (this.onGround && !this.flying && !this.ledge && !this.teeter && !this.bail && this.hp > 0) {
      const n = this.groundNormal, ny = Math.max(0.2, n?.y || 1);
      const fx = Math.sin(this.facing), fz = Math.cos(this.facing), sx = Math.cos(this.facing), sz = -Math.sin(this.facing);
      const pitch = clamp(Math.atan(-(n.x * fx + n.z * fz) / ny), -0.62, 0.62);
      const roll = clamp(Math.atan(-(n.x * sx + n.z * sz) / ny), -0.5, 0.5);
      const bones = (A._slopeBones ||= {
        ll: A.model.getObjectByName('mixamorigLeftLeg'), rl: A.model.getObjectByName('mixamorigRightLeg'),
        lf: A.model.getObjectByName('mixamorigLeftFoot'), rf: A.model.getObjectByName('mixamorigRightFoot')
      });
      const knee = Math.max(0, Math.abs(pitch) - 0.08) * 0.24;
      if (bones.ll) bones.ll.rotation.x += knee; if (bones.rl) bones.rl.rotation.x += knee;
      if (bones.lf) { bones.lf.rotation.x -= pitch * 0.62; bones.lf.rotation.z += roll * 0.58; }
      if (bones.rf) { bones.rf.rotation.x -= pitch * 0.62; bones.rf.rotation.z += roll * 0.58; }
    }
    this.flinch = damp(this.flinch, 0, 6, dt);
    this.koTilt = damp(this.koTilt || 0, this.hp <= 0 && !A.has('knockdown') ? 1.45 : 0, this.hp <= 0 ? 5 : 3, dt); // knocked flat on your back (unless a clip does it)
    const flinch = A.has('hurt') ? 0 : this.flinch;
    if (still) A.pivot.rotation.set(0, 0, 0);
    else A.pivot.rotation.set(this.lean * 0.5 - flinch * 0.35 - this.koTilt - (this.flying ? (this.flyAim || 0) * 0.65 : 0) - (this.lieTilt?.x || 0), A.sideYaw || 0, this.bank * 0.8 + (this.lieTilt?.z || 0)); // flying: nose up to climb, down to dive // sideYaw: the side-step sneak turns the body across its path
    // Axe finisher: a full 360° turn through the swing (COMBAT.axe.spin4)
    { const at = this.attack; let spin = 0;
      if (at?.slot === 'axe4' && COMBAT[at.kind]?.spin4) { const h = at.hits[0] / at.spd, k = clamp((at.t - (h - 0.5)) / 0.62, 0, 1); spin = -Math.PI * 2 * k * k * (3 - 2 * k); }
      A.pivot.rotation.y += spin; }
    A.swim = this.onGround ? this.swimW : 0; A.fly = this.flying ? 1 : 0; A.descend = this.flying && !!this.autoLand; A.fastfall = this.flying && this.autoLand === 'fast'; A.crouch = this.crouched ? 1 : 0;
    // In deep water the body sits under the surface: shift it so the water line is at the neck
    // (measured from the pose itself, so it holds for any float / tread clip).
    let lift = 0;
    if ((A.has('swim') || A.has('float')) && this.swimW > 0.001 && Number.isFinite(this.waterY)) {
      const neck = (A._neck ||= A.model.getObjectByName('mixamorigNeck') || A.model.getObjectByName('mixamorigHead'));
      A.model.updateMatrixWorld(true);
      const neckY = neck.getWorldPosition(_v).y - A.pivot.position.y; // where the neck would be with no offset
      this.swimLift = damp(this.swimLift || 0, COMBAT.swimNeck + this.waterY - neckY, 8, dt);
      lift = this.swimW * clamp(this.swimLift, -2.5, 1.5);
    } else this.swimLift = 0;
    this.actor.pivot.position.y = -this.landDip * 0.5 + lift;
  }
  get position() { return this.obj.position; }
  get stealth() { return COMBAT.crouch; }

  update(dt, inp, world, camYaw) {
    const p = this.obj.position, ev = this.events; ev.length = 0; this.lastWorld = world;
    if (this.seq) { this.doorStep(dt, world); return; } // walking through a door: the clip owns him
    if (this.sit) { this.sitStep(dt); return; } // seated (seating.js): the seat controller places him; only the animation runs here
    const prayerButtons = !!inp.dodgeHeld && !!inp.run;
    if (!prayerButtons) this.prayerSpentHold = false;
    if (this.prayer && (this.hp <= 0 || this.hurtT > 0)) { this.prayer = null; this.prayerSpentHold = true; }
    if (this.prayer) { this.prayerStep(dt, prayerButtons && !inp.inCombat); return; }
    const prayerReady = prayerButtons && inp.allowPrayer !== false && !this.prayerSpentHold && !this.teeter && !inp.inCombat && this.onGround && !this.flying && !this.wading &&
      !this.attack && !this.pick && !this.rpick && !this.vault && !this.fc && !this.wf && !this.bail && this.dodgeT <= 0 && this.dodgeLock <= 0 &&
      this.landLock <= 0 && this.hurtT <= 0 && this.hp > 0 && Math.hypot(inp.x || 0, inp.z || 0) < 0.25 && Math.hypot(this.vel.x, this.vel.z) < 1.2;
    this.prayerIntent = prayerReady ? this.prayerIntent + dt : 0;
    if (this.prayerIntent >= COMBAT.prayer.hold && this.startPrayer()) { this.prayerIntent = 0; this.prayerStep(0, true); return; }
    if (this.teeter && this.teeterStep(dt, world, inp, camYaw)) return;
    if (this.ledge) { this.ledgeStep(dt, world, inp); return; }
    if (this.slam) { this.slamStep(dt, world); return; } // the aerial slam owns him from the dive to getting up
    this.ledgeCooldown = Math.max(0, this.ledgeCooldown - dt);
    // Camera-relative intent.
    const fwd = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw)), right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const want = fwd.multiplyScalar(-inp.z).add(right.multiplyScalar(inp.x));
    let autoTop = 0; // auto-walk speed cap (0 = not auto-walking)
    if (this.auto) {
      const a = this.auto; a.t += dt;
      const dx = a.to.x - p.x, dz = a.to.z - p.z, d = Math.hypot(dx, dz);
      if (d < a.best - 0.02) { a.best = d; a.still = 0; } else a.still += dt;
      if ((want.lengthSq() > 0.25 && !a.pass) || this.hp <= 0 || this.attack || this.flying || !this.onGround || this.dodgeT > 0 || a.t > 6) this.auto = null; // the player took over
      else if (a.path.length > 1 && (d < 0.45 || a.still > 0.5)) { a.path.shift(); a.to = a.path[0]; a.best = Infinity; a.still = 0; want.set(dx / (d || 1), 0, dz / (d || 1)); autoTop = 1; } // round the corner: keep walking
      else if (d < 0.1 || a.still > 0.5) { // there: plant, turn to it, act
        want.set(0, 0, 0); this.vel.x = 0; this.vel.z = 0;
        this.facing = dampAngle(this.facing, a.face, 12, dt);
        const off = Math.abs(Math.atan2(Math.sin(a.face - this.facing), Math.cos(a.face - this.facing)));
        if (off < 0.1 || a.turnT > 0.5) { this.facing = a.face; this.auto = null; a.then?.(); }
        a.turnT = (a.turnT || 0) + dt;
      } else { want.set(dx / d, 0, dz / d); autoTop = Math.min(1, 0.35 + d / 0.9); } // ease in over the last stretch, no overshoot
    }
    this.dodgeLock = Math.max(0, (this.dodgeLock || 0) - dt);
    this.landLock = Math.max(0, (this.landLock || 0) - dt);
    if (this.dodgeLock > 0 && this.dodgeT <= 0 && want.lengthSq() > 0.01) this.dodgeLock = 0; // steering out of a roll: skip the get-up and keep moving (roll → run chains)
    if (this.swap) { this.swap.t += dt; if (this.swap.t >= this.swap.at) this.completeSwap(); else if (!this.onGround) this.finishSwap(); }
    if (this.pick) { // stepping in and reaching down: hold still until the item is in hand
      const k = this.pick; k.t += dt;
      if (!k.done && k.t >= k.grab) { k.done = true; k.onGrab?.(); }
      if (k.t < k.grab + 0.35) want.set(0, 0, 0);
      else if (this.pickStow) { this.pick = null; this.pickStow = false; this.stow(); } // a new blade: straight into putting it away at the hip
      else { if (this.actor?.shot?.kind === k.animation) this.actor.shot.soft = true; this.pick = null; } // then any input blends out of the rest
    }
    if ((this.dodgeLock > 0 && this.dodgeT <= 0) || this.landLock > 0 || this.blocking || this.parryT > 0) want.set(0, 0, 0); // getting up / landing: hold still, ease to a stop
    const mag = Math.min(1, want.length()); if (mag > 0) want.normalize();
    const running = !autoTop && !!inp.run && mag > 0.08 && !this.flying && this.dodgeT <= 0 && this.stamina > 0;
    this.isRunning = running; this.runGrace = running ? 0.3 : Math.max(0, (this.runGrace || 0) - dt); // a press just as a stride leaves the ground (or R2 lifts) still counts as running
    // Flight only costs stamina while actively climbing or cruising under power; holding altitude in
    // place and any descent (controlled float-down or a fast dive) are free, same as standing still.
    const flyIdle = this.flying && (!!this.autoLand || (mag < 0.08 && !inp.jumpHeld));
    const exerting = running || (this.flying && !flyIdle) || this.dodgeT > 0 || this.dodgeLock > 0 || this.blocking || this.attack || this.vault || this.wf || !this.onGround || this.bail;
    this.restT = exerting ? 0 : (this.restT || 0) + dt; // how long he's been taking it easy
    const R = COMBAT.regen, regenDelay = inp.inCombat ? R.combatStaminaDelay : R.staminaDelay;
    const passiveRegen = !this.attack && this.restT > regenDelay ? (inp.inCombat ? R.combatStamina : R.stamina) * staminaRegenMul() : 0;
    const staminaRate = running ? -COMBAT.runStamina : (this.flying && !flyIdle) ? -COMBAT.flightStamina : passiveRegen;
    this.stamina = clamp(this.stamina + staminaRate * dt, 0, this.maxStamina);
    const astralRate = COMBAT.regen.astral + astralRegen(); // Calm Mind (LABS › ASTRAL)
    if (astralRate) this.astralEnergy = clamp(this.astralEnergy + astralRate * dt, 0, this.maxAstralEnergy);
    // L2 (C): a tap rolls, a hold slides. The press is decided on release, or once it's been held `slide.hold` s.
    // L2 + R2 while still prays outside combat; in combat it blocks.
    if (inp.dodgePressed && !this.flying) this.l2 = { t: 0 };
    if (this.l2) {
      if (inp.dodgeHeld === undefined) { this.l2 = null; this.dodgeBuf = 0.3; } // no hold info (lab / scripts): a plain roll
      else if (inp.dodgeHeld) {
        this.l2.t += dt;
        if (inp.run && mag < 0.3 && !inp.inCombat) { /* wait for prayer rather than spending L2 on a dodge */ }
        else if (inp.run && mag < 0.3 && inp.inCombat && this.l2.t >= COMBAT.block.hold) { this.l2 = null; this.setBlock(true); }
        else if (this.l2.t >= COMBAT.slide.hold) { this.l2 = null; if (!this.slide(mag > 0.08 ? want.clone().normalize() : null)) this.dodgeBuf = 0.3; }
      }
      else { this.l2 = null; this.dodgeBuf = 0.3; } // released quickly: roll
    }
    if (this.blocking && (!inp.inCombat || !inp.dodgeHeld || !inp.run || !this.onGround || this.flying || this.hp <= 0 || this.swimW > 0.5 || this.dodgeT > 0)) this.setBlock(false);
    if (this.blocking) this.guardT += dt;
    if (this.parryT > 0) this.parryT = Math.max(0, this.parryT - dt);
    this.dodgeAge = (this.dodgeAge ?? 9) + dt;
    // the block stance is never left hanging: after a parry (or anything else that took the pose) it comes straight back
    if (this.blocking && this.actor && this.parryT <= 0 && this.actor.shot?.kind !== 'block') this.actor.play('block', 1, { loop: true });
    if (this.dodgeBuf > 0) this.dodgeBuf = this.dodge(mag > 0.08 ? want.clone() : null) ? 0 : this.dodgeBuf - dt;
    if (inp.emotePressed && mag < 0.1) this.emote();
    const water = world.waterAt(p.x, p.z), depth = water - world.heightAt(p.x, p.z);
    this.wading = depth > 0.25 && p.y < water + 0.1;
    this.swimW = damp(this.swimW, this.wading && depth > COMBAT.swimDepth ? 1 : 0, 5, dt); this.depth = depth; this.waterY = water;
    // Walking is the default, at the walk clip's own pace (Walk 1: one full 1.17 s cycle per stride pair).
    const walkTop = this.actor?.has('walk') ? clamp(this.actor.naturalSpeed('walk'), 1.2, 4.5) : TUNE.walk;
    // Stealth crouch (L3): toggles on the ground; running, jumping, rolling, flying or swimming stands him back up.
    if (inp.crouchPressed && this.onGround && !this.flying) { this.crouched = !this.crouched; this.events.push(this.crouched ? 'crouch' : 'stand'); }
    if (this.crouched && (inp.run || !this.onGround || this.flying || this.dodgeT > 0 || this.swimW > 0.5 || this.hp <= 0)) { this.crouched = false; this.events.push('stand'); }
    let top = this.crouched ? COMBAT.crouch.speed : running ? TUNE.run : walkTop;
    top *= autoTop ? autoTop : inp.analog ? Math.max(mag, 0.35) : 1;
    if (this.pulling) top = Math.min(top, this.pulling.speed);
    { const sp = this.actor?.stairMotion && this.actor.stairPace?.[this.actor.stairMotion]; if (sp) top = Math.min(top, sp); } // on the flight he climbs at the stair clip's pace // dragging furniture: a slow, steady pull
    if (this.wading) top *= TUNE.wadeMul;
    if (this.flying) top = (this.autoLand === 'fast' ? COMBAT.dive.top : inp.run ? COMBAT.fly.boost : COMBAT.fly.speed) * (inp.analog ? Math.max(mag, 0.35) : 1);
    if (this.attack) top *= COMBAT[this.attack.kind].move;
    // Uphill drag: grade along the travel direction.
    if (mag > 0) { const g = (world.heightAt(p.x + want.x * 0.8, p.z + want.z * 0.8) - world.heightAt(p.x, p.z)) / 0.8; top *= clamp(1 - Math.max(0, g - 0.25) * 0.9, 0.35, 1); }
    const target = want.multiplyScalar(mag > 0.08 ? top : 0);
    const acc = this.onGround || this.flying ? (mag > 0.08 ? TUNE.accelGround * (this.flying ? 0.5 : 1) : TUNE.brake * (this.flying ? 0.4 : 1)) : TUNE.accelAir;
    const dv = target.clone().sub(this.vel.clone().setY(0)), step = acc * dt;
    if (dv.length() > step) dv.setLength(step);
    const prevVel = this.vel.clone();
    this.vel.x += dv.x; this.vel.z += dv.z;
    if (this.dodgeT > 0) { // roll: fast out, easing to a stop
      const D = COMBAT[this.dodgeKind || 'dodge'], k = 1 - this.dodgeT / D.time, v = Math.max((2 * D.dist / D.time) * (1 - k), target.length()) * (this.wading ? 0.6 : 1); // eases down to walk/run pace if you're steering
      this.vel.x = this.dodgeDir.x * v; this.vel.z = this.dodgeDir.z * v; this.dodgeT = Math.max(0, this.dodgeT - dt);
    }
    if (this.landLock > 0 && this.onGround) { this.vel.x = 0; this.vel.z = 0; } // landing: planted, no slide
    if (this.bail?.phase === 'fall') { this.vel.copy(prevVel).multiplyScalar(Math.max(0, 1 - dt * 0.6)); } // falling: his momentum carries him, no steering
    else if (this.bail) { this.vel.x = 0; this.vel.z = 0; } // down on the ground / getting up
    if (this.rpick) { // running pick-up: carried along at running pace, lined up so the item meets his right hand
      const r = this.rpick; r.t += dt;
      if (!this.onGround || this.hp <= 0 || this.attack || this.actor?.shot?.kind !== 'runpickup' || r.t >= r.end) { this.rpick = null; }
      else if (!r.done) {
        const f = Math.atan2(r.L.x - p.x, r.L.z - p.z), sx = Math.cos(f), sz = -Math.sin(f); // his right, facing the item
        const ax = r.L.x - sx * COMBAT.runPick.side - p.x, az = r.L.z - sz * COMBAT.runPick.side - p.z, d = Math.hypot(ax, az) || 1;
        const ahead = (ax * Math.sin(this.facing) + az * Math.cos(this.facing)) / d > 0.3; // passed it: run straight on, never turn back
        const hx = ahead ? ax / d : Math.sin(this.facing), hz = ahead ? az / d : Math.cos(this.facing);
        this.vel.x = hx * r.v; this.vel.z = hz * r.v; if (ahead) this.facing = dampAngle(this.facing, Math.atan2(ax, az), 16, dt);
        if (r.t >= r.grab) { r.done = true; if (Math.hypot(r.L.x - p.x, r.L.z - p.z) < 2.4) r.onGrab?.(); }
      }
    }
    if (this.attack?.kind === 'kickup' && this.onGround) { // the kick-up carries him along the clip's own path, out of his run and on into the next
      const at = this.attack, ct = at.t * at.spd, H = this.hipHeight(); at.face ??= this.facing; this.facing = at.face; const f = Math.sin(at.face), c = Math.cos(at.face); // committed to the line he started on
      let v = (kickAt(ct + 1 / 60) - kickAt(ct - 1 / 60)) * 30 * H * at.spd;
      if (ct < 0.35) v = Math.max(v, (at.entry || 0) * (1 - ct / 0.35)); // the run's momentum eases into the dive
      this.vel.x = f * v; this.vel.z = c * v;
    }
    if (this.roll) { // rolling landing: carried forward along the clip's own hip path until he's on his feet
      const sh = this.actor?.shot;
      if (!sh || sh.kind !== 'fastland' || sh.t >= COMBAT.dive.standAt || !this.onGround) this.roll = null;
      else { const H = this.hipHeight(), v = (rollAt(sh.t + 1 / 60) - rollAt(sh.t - 1 / 60)) * 30 * H; this.vel.x = Math.sin(this.facing) * v; this.vel.z = Math.cos(this.facing) * v; }
    }
    this.spinCool = Math.max(0, (this.spinCool || 0) - dt);
    if (this.spin) { // tree spin: he rolls off the trunk to its open side and comes out still running
      const s = this.spin, A = this.actor; s.t += dt;
      if (s.t >= s.dur || !this.onGround || this.flying || this.hp <= 0 || this.hurtT > 0 || A?.shot?.kind !== 'treeSpin') {
        if (A?.shot?.kind === 'treeSpin') A.release('treeSpin', 0.18);
        this.spin = null; this.spinCool = 0.45; this.runGrace = Math.max(this.runGrace || 0, 0.3);
      } else { const f = Math.sin(s.dir), c = Math.cos(s.dir), l = s.t < s.dur * 0.4 ? s.lat * s.side : 0; this.vel.x = f * s.v + c * l; this.vel.z = c * s.v - f * l; }
    }
    if (this.attack?.kind === 'flykick' || this.attack?.kind === 'runpunch' || this.attack?.run) { // running moves carry the run: keep driving forward until the blow lands
      const at = this.attack, end = at.hits[0] / at.spd; // up to the first blow
      if (at.t < end) { const f = Math.sin(this.facing), c = Math.cos(this.facing), v = (at.entry || 0) * (COMBAT[at.kind].carry ?? 0.8) * (1 - 0.5 * at.t / end), cur = this.vel.x * f + this.vel.z * c; if (cur < v) { this.vel.x += f * (v - cur); this.vel.z += c * (v - cur); } }
    }
    if (this.vault) { // the vault carries him along the clip's own hip path, committed to the line he started on
      const v = this.vault, V = COMBAT.vault, A = this.actor; v.t += dt * v.spd;
      if (A?.shot?.kind !== 'vault' || this.hp <= 0 || this.hurtT > 0 || this.flying) { this.vault = null; if (A?.shot?.kind === 'vault') A.release('vault', 0.15); }
      else {
        this.facing = v.face; const f = Math.sin(v.face), c = Math.cos(v.face);
        let sv = (vaultAt(v.t + 1 / 60) - vaultAt(v.t - 1 / 60)) * 30 * v.H * v.spd;
        if (v.t < V.over[0]) sv = Math.max(sv, v.entry * 0.85); // the run's momentum carries into the take-off
        this.vel.x = f * sv; this.vel.z = c * sv;
        if (!v.up && v.t >= V.over[0] + 0.1) { v.up = true; ev.push('jump'); }
        if (!v.down && v.t >= V.touch) { v.down = true; ev.push('land'); }
        if (v.t >= V.out) { // back on his feet and running: hand control back, blending out of the clip
          const keep = mag > 0.1;
          this.vault = null; if (keep) A.release('vault', 0.25); else A.shot.soft = true;
        }
      }
    }
    if (this.fc) this.faeCatchStep(dt); // catching a fae: the jog-in and the clip's own travel own his motion
    this.vel.x += this.knock.x; this.vel.z += this.knock.z; this.knock.set(0, 0, 0);
    if (this.wf) this.wallFlipMove(dt, world, ev); // wall flip: the approach, the foot on the wall and the fall away own his motion
    this.speed = Math.hypot(this.vel.x, this.vel.z);

    // Running into a tree: instead of stopping dead on the trunk he spins off it (Tree Spin Evade) and keeps his run.
    if (this.onGround && !this.spin && this.spinCool <= 0 && this.speed >= 5.5 && !this.flying && !this.attack && !this.vault && !this.wf && !this.fc && !this.bail && !this.pick && this.dodgeT <= 0 && this.hurtT <= 0 && !this.crouched && !this.blocking && this.actor?.has('treeSpin')) {
      const list = world.nature?.userData?.trees?.list;
      if (list) {
        const fx = this.vel.x / this.speed, fz = this.vel.z / this.speed; let best = null, bd = 1.5, blat = 0;
        for (const t of list) {
          if (t.broken) continue; const dx = t.x - p.x, dz = t.z - p.z; if (dx > 2.2 || dx < -2.2 || dz > 2.2 || dz < -2.2 || Math.abs(t.gy - p.y) > 1.5) continue;
          const ahead = dx * fx + dz * fz, lat = dx * fz - dz * fx; // lat > 0: the trunk is to his right
          if (ahead > 0.15 && ahead < bd + t.radius && Math.abs(lat) < t.radius + 0.42) { best = t; bd = ahead - t.radius; blat = lat; }
        }
        if (best) {
          const spd = 1.25, dur = (this.actor.acts.treeSpin.getClip().duration || 1) / spd, need = Math.max(0.15, best.radius + 0.62 - Math.abs(blat));
          this.spin = { t: 0, dur, dir: Math.atan2(fx, fz), v: Math.max(this.speed, 6), side: blat > 0 ? -1 : 1, lat: need / (dur * 0.4) };
          this.actor.release('emote'); this.actor.play('treeSpin', spd); this.events.push('treeSpin');
        }
      }
    }
    // A roof/platform edge owns grounded traversal. Walking or crouching can
    // transition into a hang; any running momentum is caught by Teeter first.
    const intentMag = Math.hypot(want.x, want.z);
    if (this.onGround && !inp.jumpPressed && !this.flying && !this.wf && !this.vault && !this.fc && !this.bail && !this.attack && !this.pick && (this.speed > 0.18 || intentMag > 0.08) && this.ledgeCooldown <= 0) {
      const drive = this.speed > 0.35 ? { x: this.vel.x / this.speed, z: this.vel.z / this.speed } : { x: want.x / (intentMag || 1), z: want.z / (intentMag || 1) };
      const reach = Math.min(1.5, Math.max(0.65, this.speed * dt + (running || this.runGrace > 0 ? 0.65 : 0.38)));
      const edge = this.edgeAhead(world, drive, reach);
      if (edge) {
        const carryingRun = running || this.runGrace > 0;
        if (carryingRun) {
          // Run intent, including residual sprint momentum, never turns into a
          // hang or carries Rizer over the lip. Stop just inside and play the
          // authored teeter; the player can then jump or release run to hang.
          if (this.startTeeter(world, drive, edge)) { this.teeterStep(0, world, inp, camYaw); return; }
          p.x = edge.x - edge.dx * 0.34; p.z = edge.z - edge.dz * 0.34; p.y = edge.top;
          this.vel.set(0, 0, 0); this.speed = 0; this.ledgeCooldown = 0.12;
        } else if (this.startEdgeHang(world, drive, edge)) {
          this.ledgeStep(0, world, inp); return;
        } else if (this.startTeeter(world, drive, edge)) {
          // If an edge cannot accept a hang transition, keep Rizer planted at
          // the lip instead of letting an ordinary walk carry him off it.
          this.teeterStep(0, world, inp, camYaw); return;
        }
      }
    }

    // Follow the real local surface normal. Walkable grades retain traction;
    // steep mountain and roof faces contribute downhill motion instead.
    this.groundNormal.copy(world.groundNormalAt?.(p.x, p.z, p.y + 0.5) || _v.set(0, 1, 0));
    this.slopeSliding = this.onGround && this.groundNormal.y < 0.68;
    if (this.slopeSliding) {
      const sx = this.groundNormal.x, sz = this.groundNormal.z, sl = Math.hypot(sx, sz) || 1;
      const slide = (0.68 - this.groundNormal.y) * 32 * dt;
      this.vel.x += sx / sl * slide; this.vel.z += sz / sl * slide;
      this.speed = Math.hypot(this.vel.x, this.vel.z);
    }

    // Horizontal move + collision.
    const oldX = p.x, oldZ = p.z;
    const preResolveSpeed = Math.hypot(this.vel.x, this.vel.z);
    // Sub-stepped so fast flight or a roll can't tunnel through a thin wall, rib or post.
    const travel = Math.hypot(this.vel.x, this.vel.z) * dt, steps = Math.min(8, Math.max(1, Math.ceil(travel / 0.18)));
    let blockedMove = false;
    const pass = this.auto?.pass, passing = pass && Math.hypot(p.x - pass.x, p.z - pass.z) < pass.r; // the last step up to a door
    for (let i = 0; i < steps; i++) {
      p.x += this.vel.x * dt / steps; p.z += this.vel.z * dt / steps;
      const vaulting = this.vault && this.vault.t >= COMBAT.vault.over[0] && this.vault.t < COMBAT.vault.over[1]; // over the obstacle: no collision
      let landedOnSurface = false;
      // A descending foot that has reached a material top lands before the side
      // wall resolves it. Roof impacts therefore cannot eject Rizer sideways.
      if (!this.flying && !vaulting && this.vy <= 0) {
        const top = world.surfaceAt?.(p.x, p.z, p.y + 0.46);
        if (Number.isFinite(top) && p.y >= top - 0.3 && p.y <= top + 0.2) { p.y = top; this.vy = 0; this.onGround = true; landedOnSurface = true; }
      }
      const descending = this.vy < -0.05 || (!this.onGround && this.vy <= 0);
      if (!passing && !vaulting && world.resolve(p, TUNE.radius, { stealth: this.crouched, descending, landedOnSurface })) blockedMove = true;
    }
    if (blockedMove) { // bleed velocity into walls so we slide instead of sticking
      let rx = (p.x - oldX) / dt, rz = (p.z - oldZ) / dt, rs = Math.hypot(rx, rz);
      // Positional overlap correction may remove speed, but never creates it.
      if (rs > preResolveSpeed && rs > 1e-4) { const k = preResolveSpeed / rs; rx *= k; rz *= k; }
      this.vel.x = rx; this.vel.z = rz;
    }
    // Hiding: crouched inside a bush, the Seers and Mori lose sight of him.
    const wasHidden = this.hidden;
    this.hidden = this.crouched && this.onGround && !!(world.mass?.cellAt(p.x, p.z)?.f & 2);
    if (this.hidden !== !!wasHidden) ev.push(this.hidden ? 'hide' : 'unhide');
    if (!passing && world.keepOnLand?.(p, oldX, oldZ)) {
      let rx = (p.x - oldX) / Math.max(dt, 1e-4), rz = (p.z - oldZ) / Math.max(dt, 1e-4), rs = Math.hypot(rx, rz);
      if (rs > preResolveSpeed && rs > 1e-4) { const k = preResolveSpeed / rs; rx *= k; rz *= k; }
      this.vel.x = rx; this.vel.z = rz;
    }
    if (!world.expanse?.contains(p.x, p.z)) { const B = world.roam ?? world.bound; p.x = clamp(p.x, -B, B); p.z = clamp(p.z, -B, B); } // Malezor's map edge; the empty districts beyond it are open

    // Jumping into the edge of a flat roof or platform catches it; the two mocap clips own
    // the short path from reach to hang to standing on that same material surface.
    if (!this.onGround && !this.flying && !this.wf && mag > 0.2 && this.startLedge(world, target)) { this.ledgeStep(0, world, inp); return; }

    // Flight: double jump, then keep ✕ held (Space) to take off. In the air ✕ rises, L2 (Q) sinks, R2 (Shift) boosts;
    // sink onto the ground to land.
    if (this.djHold != null && !this.flying) {
      if (!inp.jumpHeld || this.onGround || this.hp <= 0) this.djHold = null;
      else if ((this.djHold += dt) >= COMBAT.fly.holdToFly) {
        this.djHold = null; this.flying = true; this.vy = Math.max(this.vy, COMBAT.fly.climb * 0.6); this.dj = null; this.attack = null;
        this.actor?.release('doublejump', 0.25); ev.push('jump');
      }
    }
    if (this.flying && this.stamina <= 0 && this.hp > 0 && this.actor?.has('bail')) { // out of stamina: he drops out of the sky
      this.flying = false; this.autoLand = false; this.djHold = null; this.dj = null; this.attack = null; this.usedDouble = true; this.bl = null;
      this.bail = { peak: p.y - world.groundAt(p.x, p.z, p.y), phase: 'fall' };
      this.actor.play('bail', 1, { loop: true }); ev.push('bail');
    }
    if (this.flying) {
      if (inp.crouchPressed) this.autoLand = this.autoLand ? false : inp.run && this.actor?.has('fastland') ? 'fast' : true; // L3 while flying: float down and land · with R2 held: dive and roll out
      if (inp.jumpPressed) this.autoLand = false;
      const diving = this.autoLand === 'fast';
      const want = diving ? -COMBAT.dive.speed / COMBAT.fly.climb : this.autoLand ? -COMBAT.fly.descend : inp.jumpHeld ? 1 : 0; // L3 descent: a slower, floating drop
      // Steer by the camera: look up (right stick) and he climbs as he flies, look down and he dives.
      const aim = this.autoLand ? 0 : clamp(((inp.camPitch ?? 0.2) - 0.2) * -1.8, -1, 1) * (mag > 0.1 ? 1 : 0);
      this.flyAim = damp(this.flyAim || 0, aim, 5, dt);
      this.vy = damp(this.vy, want * COMBAT.fly.climb + aim * this.speed * COMBAT.fly.pitchClimb, diving ? 6 : 4, dt);
      p.y += this.vy * dt;
      const floor = world.groundAt(p.x, p.z, p.y), water = world.waterAt(p.x, p.z);
      p.y = Math.min(p.y, Math.max(floor, water) + COMBAT.fly.ceiling);
      if (p.y <= floor) { p.y = floor; if (want < 0 || this.vy < -0.5) { this.flying = false; this.autoLand = false; this.onGround = true; this.vy = 0; this.landDip = 0.2; ev.push('land');
        this.vel.x = 0; this.vel.z = 0; // touch down planted: no sliding off a flight
        if (!this.bl) { this.landLock = Math.max(this.landLock || 0, 0.4); if (this.actor && !this.attack) this.actor.play('land'); } } else this.vy = Math.max(0, this.vy); }
      this.airTime = 0; this.usedDouble = false; this.buffer = 0; this.coyote = 0;
    } else {
    // Jump: coyote time + input buffer + variable height.
    this.coyote = this.onGround ? TUNE.coyote : this.coyote - dt;
    this.buffer = inp.jumpPressed ? TUNE.buffer : this.buffer - dt;
    if (this.fc) this.buffer = 0; // mid fae-catch: ✕ waits
    if (this.onGround) this.usedDouble = false;
    else if (inp.jumpPressed && this.coyote <= 0 && !this.usedDouble && this.airTime > 0.08 && this.dodgeT <= 0 && this.startWallFlip(world)) { // a wall ahead: plant a foot on it and backflip off
      this.usedDouble = true; this.buffer = 0; this.attack = null;
    }
    else if (inp.jumpPressed && this.coyote <= 0 && !this.usedDouble && this.airTime > 0.08 && this.dodgeT <= 0) { // double jump (flip)
      this.usedDouble = true; this.buffer = 0; this.attack = null; ev.push('jump');
      const A = this.actor, m = A?.meta.doublejump, h = p.y - world.groundAt(p.x, p.z, p.y);
      const from = m?.takeoff || 0, to = m?.landT || A?.acts.doublejump?.getClip().duration || 0.8;
      // launch hard enough that the flip has its full air time (within limits), then keep the
      // clip locked to the fall so its landing frame meets the ground (see below).
      let vy = TUNE.jumpVel * COMBAT.doubleJump;
      while (vy < TUNE.jumpVel * 1.5 && airTime(h, vy) < (to - from) * 0.95) vy += 0.2;
      this.vy = vy; this.dj = A?.play('doublejump', 1, { from }) ? { from, to, t: 0 } : null; this.djHold = 0; // keep ✕ held to take flight
    }
    if (this.buffer > 0 && this.coyote > 0 && this.isRunning && !this.vault && !this.crouched) { // running: ✕ at a low obstacle vaults it
      const vt = this.startVault(world);
      if (vt === true) { this.buffer = 0; this.coyote = 0; }
      else if (vt === 'wait') { this.vaultWait = (this.vaultWait || 0) + dt; if (this.vaultWait < 0.4) this.buffer = Math.max(this.buffer, dt * 2); else { this.buffer = 0; this.vaultWait = 0; } } // hold the press until it's in reach
    }
    if (this.buffer <= 0 || !this.isRunning) this.vaultWait = 0;
    if (this.buffer > 0 && this.coyote > 0 && !(this.vaultWait > 0)) { this.vy = TUNE.jumpVel * (this.wading ? 0.75 : 1); this.onGround = false; this.coyote = 0; this.buffer = 0; this.squash = -0.18; ev.push('jump'); }
    if (this.wf?.phase === 'wall') { // foot on the wall: the flip's own arc carries him up and off it
      p.y = Math.max(this.wf.y, world.groundAt(p.x, p.z, p.y)); this.vy = this.wf.vy; this.onGround = false; this.airTime += dt;
    } else {
    if (!inp.jumpHeld && this.vy > 0 && !this.dj && !this.wf) this.vy -= TUNE.gravity * (1 / TUNE.jumpCut - 1) * dt; // (a double jump always goes full height)
    this.vy -= TUNE.gravity * (this.vy < 0 ? TUNE.fallMul : 1) * dt;
    p.y += this.vy * dt;
    const floor = world.groundAt(p.x, p.z, p.y);
    if (p.y <= floor) {
      if (!this.onGround) { const impact = Math.min(1, -this.vy / 22); this.landDip = 0.12 + impact * 0.25; this.squash = 0.1 + impact * 0.22; ev.push(impact > 0.35 ? 'landHard' : 'land'); if (this.actor && !this.actor.shot && this.speed < 3) this.actor.play('land'); }
      p.y = floor; this.vy = 0; this.onGround = true; this.airTime = 0;
    } else if (this.onGround && this.vy <= 0 && p.y - floor < TUNE.stepDown + Math.min(0.55, this.speed * dt * 0.7)) {
      p.y = floor; this.vy = 0; // stick to slopes and stairs going down
    } else { this.onGround = false; this.airTime += dt; }
    }
    } // end of non-flight vertical movement
    // Big landing: after flight or a high drop, Falling-to-Landing starts in the air and is steered by the
    // measured height so its touchdown frame meets the ground; the full landing then plays out.
    {
      const A = this.actor, hNow = p.y - world.groundAt(p.x, p.z, p.y);
      if (!this.onGround) this.airPeak = Math.max(this.airPeak || 0, hNow);
      const slot = this.bail ? 'bailImpact' : this.autoLand === 'fast' && A?.has('fastland') ? 'fastland' : 'bigland', touch = slot === 'bailImpact' ? COMBAT.bail.touch : A?.meta[slot]?.touch ?? 0.3; // bail impact: the body hits at 0.33 s (the feet settle later)
      if (this.bail && !this.onGround) this.bail.peak = Math.max(this.bail.peak, hNow);
      // A bail lands where his drift is taking him, not straight below: time the impact against that ground.
      const landAhead = () => { let t = airTime(hNow, this.vy); for (let k = 0; k < 3; k++) { const x = p.x + this.vel.x * t, z = p.z + this.vel.z * t; t = airTime(p.y - world.groundAt(x, z, p.y), this.vy); } return t; };
      const timeLeft = () => this.flying ? hNow / Math.max(0.5, -this.vy) : this.bail ? landAhead() : airTime(hNow, this.vy);
      if (!this.bl && A?.has(slot) && !this.onGround && !this.dj && !this.wf && this.hp > 0 && this.dodgeT <= 0
          && (this.flying ? this.vy < -0.5 : this.vy < 0 && (this.bail || this.airPeak >= COMBAT.bigLand.minDrop)) && timeLeft() <= touch) {
        this.attack = null; A.play(slot, 1); A.shot.speed = 0; A.shot.t = Math.max(0, touch - timeLeft()); this.bl = { touch, slot };
      }
      if (this.bl) {
        const sh = A?.shot;
        if (!sh || sh.kind !== this.bl.slot) this.bl = null;
        else if (this.onGround) {
          if (!this.bl.landed) { sh.t = Math.max(sh.t, this.bl.touch); sh.speed = 1; this.bl.landed = true; this.landDip = 0; this.squash = 0; this.vel.x = 0; this.vel.z = 0;
            if (this.bl.slot === 'bailImpact') { // slammed into the ground: fall damage by the height he fell from
              const B = COMBAT.bail, dmg = Math.round(Math.max(B.min, (this.bail.peak - B.safe) * B.perUnit));
              this.hp = Math.max(0, this.hp - dmg); this.sinceHurt = 0; this.hurtT = COMBAT.invuln; this.bail.phase = 'down'; this.bail.dmg = dmg;
              sh.hold = true; this.landLock = 99; ev.push('bailImpact');
            }
            else if (this.bl.slot === 'fastland') { this.roll = { t: sh.t }; this.landLock = Math.max(0.05, COMBAT.dive.standAt - sh.t); ev.push('landHard'); } // roll out along the clip's own path
            else this.landLock = (sh.dur - sh.t) * COMBAT.bigLand.lock; }
        } else if (this.flying && this.vy > -0.3) { A.release(this.bl.slot, 0.2); this.bl = null; } // stopped sinking: back to flight
        else if (this.bl.slot === 'bailImpact') { // still falling: keep the body-hits-the-ground frame on the real ground, both ways
          const tl = timeLeft();
          if (tl > this.bl.touch + 0.3) { this.bl = null; A.play('bail', 1, { loop: true }); } // the ground fell away below him: back to flailing
          else sh.t = clamp(this.bl.touch - tl, 0, this.bl.touch - 0.02);
        }
        else sh.t = Math.max(sh.t, this.bl.touch - timeLeft());
      }
      if (this.onGround) this.airPeak = 0;
    }
    // Lying after a bail on uneven ground: tilt the body to the slope under it, so head and feet rest on the ground.
    { const lying = this.bail && this.bail.phase !== 'fall' && (this.bail.phase === 'down' || (this.actor?.shot?.kind === 'standup' && this.actor.shot.t < 0.5));
      let tx = 0, tz = 0;
      if (lying) { const f = this.facing, fx = Math.sin(f), fz = Math.cos(f), lx = Math.cos(f), lz = -Math.sin(f), g = (x, z) => world.groundAt(x, z, p.y + 1.5);
        tx = Math.atan2(g(p.x + fx * 0.9, p.z + fz * 0.9) - g(p.x - fx * 0.9, p.z - fz * 0.9), 1.8); tz = Math.atan2(g(p.x + lx * 0.4, p.z + lz * 0.4) - g(p.x - lx * 0.4, p.z - lz * 0.4), 0.8); }
      this.lieTilt ||= { x: 0, z: 0 }; this.lieTilt.x = damp(this.lieTilt.x, clamp(tx, -0.6, 0.6), 8, dt); this.lieTilt.z = damp(this.lieTilt.z, clamp(tz, -0.5, 0.5), 8, dt); }
    // Flight bail: after the impact he lies there a moment, then gets up if he survived; if not, he stays down.
    if (this.bail && this.bail.phase !== 'fall') {
      const A = this.actor, sh = A?.shot, B = COMBAT.bail;
      if (this.bail.phase === 'down' && this.hp > 0 && (!sh || sh.kind !== 'bailImpact' || sh.t >= sh.dur + B.lie || sh.t >= sh.dur - 1e-3 && (this.bail.lie = (this.bail.lie || 0) + dt) >= B.lie)) {
        this.bail.phase = 'stand'; if (A?.has('standup')) A.play('standup', 1); else this.bail = null;
      } else if (this.bail.phase === 'stand' && (!sh || sh.kind !== 'standup' || sh.t >= sh.dur - 0.05)) { this.bail = null; this.bl = null; this.landLock = 0; }
    }
    if (this.bail?.phase === 'fall' && this.onGround && !this.bl) { this.bail = null; this.actor?.release('bail', 0.2); } // (landed without the impact clip)
    // Double-jump flip: steer the clip by the fall itself. Each frame, predict the time left
    // until touchdown and set the clip so it reaches its landing frame exactly as the feet hit.
    if (this.dj) {
      const j = this.dj, A = this.actor, sh = A?.shot;
      if (!sh || sh.kind !== (j.kind || 'doublejump') || this.flying) this.dj = null;
      else if (this.onGround) { sh.t = j.to; sh.speed = 1; this.dj = null; } // land on the landing frame, then play out the recovery
      else {
        j.t += dt;
        const left = airTime(p.y - world.groundAt(p.x, p.z, p.y), this.vy);
        j.p = Math.max(j.p || 0, Math.min(1, j.t / (j.t + left)));
        sh.t = j.from + (j.to - j.from) * j.p; sh.speed = 0;
      }
    }

    // Facing follows actual travel, not raw input.
    if (this.fc) { if (this.fc.phase !== 'jog') this.facing = this.fc.face; } // fae catch: faeCatchStep steers the jog-in; the clips (the miss lunges sideways) keep their line
    else if (this.wf) this.facing = dampAngle(this.facing, this.wf.face, this.wf.phase === 'approach' ? 22 : 40, dt); // chest to the wall through the flip
    else if (this.spin) this.facing = this.spin.dir; // the clip does the spinning; his line holds
    else if (this.lockPos && this.dodgeT <= 0 && !inp.run && !this.flying) // locked on: keep facing the target (strafe)
      this.facing = dampAngle(this.facing, Math.atan2(this.lockPos.x - p.x, this.lockPos.z - p.z), TUNE.turnRate * 0.8, dt);
    else if (this.pulling) this.facing = this.pulling.face; // pulling a heavy piece: he keeps facing it
    else if (this.blocking || this.parryT > 0) {} // guard up: a blocked blow shoves him but never turns him
    else if (this.speed > 0.4 && this.dodgeT <= 0 && this.hurtT < COMBAT.invuln - 0.25 && this.attack?.kind !== 'kickup') this.facing = dampAngle(this.facing, Math.atan2(this.vel.x, this.vel.z), TUNE.turnRate * (this.attack ? 0.25 : 1), dt);
    // Combat timers: the blow lands at the clip's active frame.
    this.hurtT = Math.max(0, this.hurtT - dt); this.sinceHurt += dt;
    const hpRate = COMBAT.regen.hp + hpRegen(); // Second Wind (LABS › ASTRAL)
    if (hpRate && this.sinceHurt > COMBAT.regen.hpDelay && this.hp > 0) this.hp = Math.min(this.maxHp, this.hp + hpRate * dt);
    if (this.attack) {
      const at = this.attack, spd = at.spd || COMBAT[at.kind].speed; at.t += dt;
      while (at.hi < at.hits.length && at.t >= at.hits[at.hi] / spd) { at.hi++; this.strikeStage = at.stage; ev.push(at.kind === 'blast' ? `blast${at.stage > 1 ? at.stage : ''}` : at.kind); }
      const landed = at.hi >= at.hits.length, next = at.recover / spd - COMBAT.comboBlend;
      if (at.queued && landed && at.t >= next) {
        this.startStrike(at.kind, at.stage < this.comboMax(at.kind) ? at.stage + 1 : 1, at.queued - 1);
      } else if (at.t >= at.recover / spd) {
        this.attack = null; if (COMBAT[at.kind].tail != null) this.actor?.release(at.slot, 0.3); // heavy clips: blend out instead of playing their idle tail
        this.comboT = at.stage < this.comboMax(at.kind) ? COMBAT.comboWindow : 0; // finished the chain → next press starts at 1
      }
    }
    this.comboT = Math.max(0, (this.comboT || 0) - dt);
    this.dodgeCool = Math.max(0, this.dodgeCool - dt);
    // Emotes and interact clips give way the moment you move, jump or fight.
    const A = this.actor;
    if (A) A.stairPace = world.stairPace || null;
    if (A) A.stairMotion = this.onGround && !this.flying && this.dodgeT <= 0
      ? world.stairMotion?.(p, this.vel, inp.run && this.stamina > 0.1) || null
      : null;
    if (A?.shot?.soft && (mag > 0.1 || !this.onGround || this.attack || this.dodgeT > 0)) A.release(null, 0.2);
    if (A?.shot?.kind === 'dodge' && !A.shot.fadeOut) A.shot.speed = A.shot.t > A.shot.dur * COMBAT.dodge.rise ? COMBAT.dodge.riseAnim : COMBAT.dodge.anim; // unhurried get-up
    if (A && this.landLock <= 0 && A.shot?.kind === 'wallflip' && !this.wf && this.onGround && (mag > 0.1 || this.attack)) A.release('wallflip', 0.2); // walk out of the flip's recovery
    if (A && this.landLock <= 0 && (A.shot?.kind === 'bigland' || A.shot?.kind === 'fastland') && this.bl?.landed && (mag > 0.1 || this.attack || !this.onGround)) A.release(A.shot.kind, 0.2); // walk off the end of the landing
    if (A && this.dodgeT <= 0 && this.dodgeLock <= 0 && (A.shot?.kind === 'dodge' || A.shot?.kind === 'slide' || A.shot?.kind === 'aerialEvade') && (mag > 0.1 || this.attack || !this.onGround)) A.release(A.shot.kind, 0.15); // move away early: blend out of the get-up
    this.animate(dt, prevVel, inp);
    if (this.actor) this.animateModel(dt);
    if (this.onGround && this.speed > 9 && Math.random() < dt * 14) ev.push('dust');
    if (this.wading && this.speed > 1 && Math.random() < dt * 10) ev.push('splash');
  }

  animate(dt, prevVel, inp) {
    const b = this.body, s = this.speed, run = clamp((s - 2) / 8, 0, 1), sprint = clamp((s - TUNE.run) / (TUNE.sprint - TUNE.run), 0, 1);
    b.root.rotation.y = this.facing;
    // Distance-driven stride keeps feet from skating.
    if (this.onGround) this.phase += s * dt * (1.9 - run * 0.55);
    const moving = clamp(s / 1.5, 0, 1), sw = Math.sin(this.phase), cw = Math.cos(this.phase);
    const amp = (0.45 + run * 0.55) * moving;
    // Acceleration lean + turn banking.
    const accel = this.vel.clone().sub(prevVel).divideScalar(Math.max(dt, 1e-3));
    const fwd = new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing)), side = new THREE.Vector3(fwd.z, 0, -fwd.x);
    this.lean = damp(this.lean, clamp(accel.dot(fwd) * 0.012, -0.18, 0.2) + run * 0.12 + sprint * 0.1, 8, dt);
    this.bank = damp(this.bank, clamp(accel.dot(side) * -0.01, -0.22, 0.22), 7, dt);
    this.squash = damp(this.squash, 0, 11, dt); this.landDip = damp(this.landDip, 0, 9, dt);
    const t = performance.now() / 1000, breathe = Math.sin(t * 2.2) * (1 - moving) * 0.012;
    if (this.onGround) {
      b.legL.pivot.rotation.x = sw * amp; b.legR.pivot.rotation.x = -sw * amp;
      b.legL.joint.rotation.x = Math.max(0, -cw) * amp * 1.3 + this.landDip * 1.5; b.legR.joint.rotation.x = Math.max(0, cw) * amp * 1.3 + this.landDip * 1.5;
      b.armL.pivot.rotation.x = -sw * amp * 0.85; b.armR.pivot.rotation.x = sw * amp * 0.85;
      b.armL.joint.rotation.x = -0.25 - run * 0.9; b.armR.joint.rotation.x = -0.25 - run * 0.9;
      b.armL.pivot.rotation.z = -0.1 - breathe * 2; b.armR.pivot.rotation.z = 0.1 + breathe * 2;
      b.hips.position.y = 1.02 + Math.abs(Math.sin(this.phase)) * 0.07 * moving - this.landDip * 0.6 + breathe;
    } else { // airborne pose: tuck on the way up, reach on the way down
      const up = clamp(this.vy / 9, -1, 1);
      b.legL.pivot.rotation.x = damp(b.legL.pivot.rotation.x, 0.5 * up + 0.2, 10, dt); b.legR.pivot.rotation.x = damp(b.legR.pivot.rotation.x, -0.3 + 0.2 * up, 10, dt);
      b.legL.joint.rotation.x = damp(b.legL.joint.rotation.x, 0.9 * Math.max(up, 0) + 0.2, 10, dt); b.legR.joint.rotation.x = damp(b.legR.joint.rotation.x, 0.5, 10, dt);
      b.armL.pivot.rotation.z = damp(b.armL.pivot.rotation.z, -0.55 - up * 0.25, 10, dt); b.armR.pivot.rotation.z = damp(b.armR.pivot.rotation.z, 0.55 + up * 0.25, 10, dt);
      b.armL.pivot.rotation.x = damp(b.armL.pivot.rotation.x, -0.3, 8, dt); b.armR.pivot.rotation.x = damp(b.armR.pivot.rotation.x, -0.3, 8, dt);
      b.hips.position.y = damp(b.hips.position.y, 1.02, 10, dt);
    }
    b.torso.rotation.x = this.lean; b.torso.rotation.z = this.bank; b.torso.rotation.y = -sw * 0.12 * amp;
    b.head.rotation.x = -this.lean * 0.6; b.head.rotation.y = sw * 0.06 * amp;
    const sq = this.squash; b.root.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
    // Scarf spring: trails with speed, flutters, falls when still.
    const trail = clamp(s / 10, 0, 1) + (this.onGround ? 0 : clamp(-this.vy / 12, -0.4, 0.6));
    for (let i = 0; i < 3; i++) {
      const target = 0.25 + trail * (1.0 + i * 0.25) + Math.sin(t * (7 + i * 2) + i) * 0.12 * (0.2 + trail);
      this.scarfVel[i] += (target - this.scarfAng[i]) * 90 * dt; this.scarfVel[i] *= Math.exp(-9 * dt);
      this.scarfAng[i] += this.scarfVel[i] * dt; b.scarf[i].rotation.x = i === 0 ? this.scarfAng[0] : this.scarfAng[i] - this.scarfAng[i - 1] * 0.4;
    }
  }
}

// Orbit camera: soft follow, collision pull-in, zoom, sprint FOV kick.
export class FollowCamera {
  constructor(camera) {
    this.cam = camera; this.yaw = 0; this.pitch = 0.2; this.dist = 7.4; this.targetDist = 7.4; this.cur = 7.4;
    this.focus = new THREE.Vector3(); this.idle = 0; this.fov = camera.fov;
  }
  look(dx, dy) { this.yaw -= dx; this.pitch = clamp(this.pitch + dy, -0.45, 1.05); this.idle = 0; }
  zoom(d) { this.targetDist = clamp(this.targetDist * (1 + d), 3.2, 14); }
  kick(amount) { this.shake = Math.max(this.shake || 0, amount); }
  // Door/interior transitions need a deterministic shoulder-height view.
  // Reset every smoothed camera value together so an old bird's-eye angle or
  // long zoom cannot survive the scene switch and put the building in front.
  snapBehind(rizer, distance = 4.6) {
    const p = rizer.position;
    this.yaw = rizer.facing + Math.PI; this.pitch = 0.04; this.idle = 0;
    this.targetDist = this.dist = this.cur = distance;
    this.focus.set(p.x, p.y + 1.7, p.z);
    this.lowT = 3.2; // through the doorway and out from under the awning: stay low and behind, never overhead
  }
  _buildingClear(group, from, to, maxD) {
    this._ray ||= new THREE.Raycaster(); this._dir ||= new THREE.Vector3();
    const dir = this._dir.copy(to).sub(from); const len = dir.length(); if (len < 1e-4) return Infinity; dir.divideScalar(len);
    this._ray.set(from, dir); this._ray.near = 0.1; this._ray.far = Math.min(maxD, len) + 0.4;
    for (const h of this._ray.intersectObject(group, true)) {
      const o = h.object; if (!o.visible || o.userData?.noCamBlock) continue;
      if (o.userData._tall === undefined) { const g = o.geometry; if (g && !g.boundingBox) g.computeBoundingBox(); const bb = g?.boundingBox; o.userData._tall = bb ? (bb.max.y - bb.min.y) * Math.abs(o.matrixWorld.elements[5] || 1) > 2.0 : false; }
      if (o.userData._tall) return h.distance;
    }
    return Infinity;
  }
  update(dt, rizer, world, { autoRecenter } = {}) {
    const p = rizer.position;
    this.idle += dt;
    if (this.lowT > 0) { this.lowT -= dt; this.pitch = Math.min(this.pitch, 0.1); }
    if (autoRecenter && this.idle > 1.2 && rizer.speed > 3) this.yaw = dampAngle(this.yaw, rizer.facing + Math.PI, 1.2 * clamp(rizer.speed / 10, 0, 1), dt);
    this.focus.x = damp(this.focus.x, p.x, 16, dt); this.focus.z = damp(this.focus.z, p.z, 16, dt);
    this.focus.y = damp(this.focus.y, p.y + 1.7, rizer.onGround ? 10 : 3.5, dt);
    this.dist = damp(this.dist, this.targetDist, 6, dt);
    const h = Math.cos(this.pitch) * this.dist;
    const desired = new THREE.Vector3(this.focus.x + Math.sin(this.yaw) * h, this.focus.y + Math.sin(this.pitch) * this.dist + 0.4, this.focus.z + Math.cos(this.yaw) * h);
    const clear = world.rayClear(this.focus, desired);
    let want = Math.max(world.cameraMinDist ?? 1.6, Math.min(this.dist, clear));
    // Buildings are solid to the camera: it never sits inside a house wall (the view going solid red at the front door).
    // Standard for every exit: it comes in behind him as far as the wall allows, low and never overhead.
    if (world.structures) {
      const sc = this._buildingClear(world.structures, this.focus, desired, this.dist);
      if (sc < want) want = Math.max(0.9, sc - 0.35);
      if (this.lowT > 3.0 && want < this.cur) this.cur = want;
    }
    this.cur = want < this.cur ? damp(this.cur, want, 28, dt) : damp(this.cur, want, 3.5, dt); // snap in, ease out
    const dir = desired.sub(this.focus).normalize();
    this.cam.position.copy(this.focus).addScaledVector(dir, this.cur);
    const fl = (world.camFloor ? world.camFloor(this.cam.position.x, this.cam.position.z, this.cam.position.y) : world.groundAt(this.cam.position.x, this.cam.position.z)) + 0.45; if (this.cam.position.y < fl) this.cam.position.y = fl;
    if (this.shake > 0) { this.shake = Math.max(0, this.shake - dt * 1.6); const k = this.shake * this.shake * 0.5; this.cam.position.x += (Math.random() - 0.5) * k; this.cam.position.y += (Math.random() - 0.5) * k; }
    this.cam.lookAt(this.focus);
    const sprintK = clamp((rizer.speed - 8) / 4.4, 0, 1);
    this.cam.fov = damp(this.cam.fov, this.fov + sprintK * 8, 5, dt); this.cam.updateProjectionMatrix();
  }
}
