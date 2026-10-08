// RP7D morphology registries. Rizer's Mixamo body is the 1:1 humanoid baseline.
// These profiles only make rig-safe proportion changes; identity, clothing and
// canonical features stay in their authored character/species definitions.
export const HUMANOID_BASELINE = 'rizer-standard-01';

export const BODY_PRESETS = Object.freeze({
  standard: { height: 1, shoulders: 1, chest: 1, waist: 1, arms: 1, legs: 1, limbs: 1, head: 1 },
  lean:     { height: 1.01, shoulders: .94, chest: .92, waist: .88, arms: .90, legs: .92, limbs: 1.03, head: .98 },
  athletic: { height: 1.02, shoulders: 1.08, chest: 1.05, waist: .94, arms: 1.05, legs: 1.04, limbs: 1.01, head: .97 },
  heavy:    { height: 1.00, shoulders: 1.13, chest: 1.14, waist: 1.13, arms: 1.12, legs: 1.12, limbs: .98, head: 1.00 },
  powerful: { height: 1.05, shoulders: 1.18, chest: 1.16, waist: 1.02, arms: 1.16, legs: 1.10, limbs: 1.00, head: .96 },
  compact:  { height: .95, shoulders: 1.08, chest: 1.06, waist: 1.04, arms: 1.05, legs: 1.06, limbs: .94, head: 1.03 },
  lanky:    { height: 1.08, shoulders: .92, chest: .90, waist: .88, arms: .88, legs: .88, limbs: 1.08, head: .96 },
  elder:    { height: .98, shoulders: .96, chest: .94, waist: .98, arms: .91, legs: .91, limbs: .98, head: 1.01 },
  youth:    { height: .84, shoulders: .88, chest: .88, waist: .90, arms: .86, legs: .86, limbs: .92, head: 1.08 }
});

export const POSTURE_PROFILES = Object.freeze({
  rizer: { spine: 0, neck: 0 }, scholar: { spine: -.025, neck: .035 },
  guard: { spine: .025, neck: -.01 }, elder: { spine: -.08, neck: .07 },
  hunter: { spine: -.04, neck: .02 }, seer: { spine: -.065, neck: .045 }
});

const has = (n, term) => n.toLowerCase().includes(term);
const boneScale = (bone, x, y, z) => { if (bone) bone.scale.multiply({ x, y, z }); };

export function applyHumanoidMorphology(actor, profile = {}) {
  const p = { ...BODY_PRESETS.standard, ...(BODY_PRESETS[profile.body] || {}), ...(profile.proportions || {}) };
  const posture = POSTURE_PROFILES[profile.posture] || POSTURE_PROFILES.rizer;
  const model = actor.model;
  model.scale.x *= p.height ? 1 : 1; // baseline scale remains the single height authority
  model.traverse(o => {
    if (!o.isBone) return;
    const n = o.name;
    if (has(n, 'head')) boneScale(o, p.head, p.head, p.head);
    else if (has(n, 'spine2') || has(n, 'shoulder')) boneScale(o, p.shoulders, p.chest, p.chest);
    else if (has(n, 'spine')) boneScale(o, p.waist, 1, p.chest);
    else if (has(n, 'arm') || has(n, 'forearm')) boneScale(o, p.arms, p.limbs, p.arms);
    else if (has(n, 'upleg') || has(n, 'leg')) boneScale(o, p.legs, p.limbs, p.legs);
  });
  const spine = model.getObjectByName('mixamorigSpine') || model.getObjectByName('mixamorigSpine1');
  const neck = model.getObjectByName('mixamorigNeck');
  if (spine) spine.rotation.x += posture.spine || 0;
  if (neck) neck.rotation.x += posture.neck || 0;
  actor.morphology = { baseline: HUMANOID_BASELINE, ...profile, resolved: p };
  return actor.morphology;
}

export const ZYREX_BODY_FAMILIES = Object.freeze({
  predatorQuadruped: { posture: 'predatory', locomotion: 'quadruped', mass: { shoulders: 1.25, chest: 1.12, hips: .90 } },
  heavyQuadruped: { posture: 'brute', locomotion: 'quadruped', mass: { shoulders: 1.35, chest: 1.28, hips: 1.18 } },
  grazerQuadruped: { posture: 'proud', locomotion: 'quadruped', mass: { shoulders: .96, chest: 1.05, hips: 1.02 } },
  lowCrawler: { posture: 'stalker', locomotion: 'crawler', mass: { shoulders: 1.08, chest: .72, hips: .84 } },
  avian: { posture: 'proud', locomotion: 'avian', mass: { shoulders: .72, chest: .86, hips: .58 } },
  wingedBeast: { posture: 'predatory', locomotion: 'winged', mass: { shoulders: 1.28, chest: 1.14, hips: .82 } },
  serpentine: { posture: 'alien', locomotion: 'serpentine', mass: { shoulders: .70, chest: .78, hips: .55 } },
  construct: { posture: 'alien', locomotion: 'exotic', mass: { shoulders: 1.05, chest: 1.05, hips: 1.05 } }
});

export function resolveZyrexMorphology(definition, seed = 0) {
  const family = ZYREX_BODY_FAMILIES[definition.family] || ZYREX_BODY_FAMILIES.predatorQuadruped;
  const v = definition.variation || {};
  const unit = ((Math.sin(seed * 12.9898 + 78.233) * 43758.5453) % 1 + 1) % 1;
  const range = (r, fallback = 1) => Array.isArray(r) ? r[0] + (r[1] - r[0]) * unit : fallback;
  return {
    family: definition.family,
    posture: definition.posture || family.posture,
    mass: { ...family.mass, ...(definition.mass || {}) },
    canonical: Object.freeze({ ...(definition.canonical || {}) }),
    individual: { scale: range(v.scale), muscle: range(v.muscle), patternSeed: seed }
  };
}
