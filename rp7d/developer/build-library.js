// Build Lab · the Rizer 1:1 standard. Every Build Lab character starts as the NPC base (assets/npc/npc_base.glb,
// built by assets/npc/build_npc_base.py): a completely generic humanoid on the exact Rizer skeleton — Mori's
// simple layout without the undead details (bare torso, plain trousers, bare feet, no hair) and Rizer's head
// with plain features (dot eyes, line brows, line mouth). It plays Rizer's Anim Lab clips.
// The Rizer skeleton at its bind pose is the ASSET FIT STANDARD: every wearable / body asset is authored
// against it, on the untouched base, before any slider changes it. Assets go in slots and are independently
// swappable; a jacket made for one character fits every other build, because they all share this body.
//
//   RIZER BASE SKELETON → BODY SLIDERS → HEAD / FEATURES → MODULAR ASSETS → MATERIAL / COLOR → SAVED BUILD
//
// DISCOVERY (checked against the project files):
//   rizer.glb            1 Mixamo skeleton (33 bones), 10 skinned primitives, one per material: R_skin (head,
//                        neck, arms, hands), R_hair (100% on the Head bone), R_cloth / R_navy / R_gold /
//                        R_leather / R_boot / R_gem (the outfit, which is also the torso and legs: there is no
//                        skin under it), R_eye, R_lip.
//   rizer_psychosyd.glb  the same skeleton, bone for bone (same names, order and bind inverses), so its
//                        R_hair primitive (the mohawk, 100% on Head) fits the standard 1:1.
//   mori.glb / npc_base.glb  the same skeleton again (both built on rizer_lowpoly.blend's rig).
// The generic NPC base and Mori share this skeleton. Mori retains its native head and undead details;
// older unsupported bases fall back to the NPC base. Saved templates preserve the chosen foundation.
import * as THREE from 'three';
import { BODY_PRESETS } from './morphology.js';
import { loadGLB } from './actor.js';

export const BUILD_STORAGE = 'rp7d.buildLab.v1';
export const BUILD_RIG = 'mixamo-humanoid-01';
export const BUILD_STANDARD = 'rizer-standard-01'; // = morphology.js HUMANOID_BASELINE
// The one base. `hide`: the base's own primitives (by material) left off the mannequin. N_skull is the round
// skull the base model carries so it reads whole outside the lab (and its head hitbox measures a full head);
// in the lab the skull comes from the Head shape slot instead.
export const BUILD_BASE = Object.freeze({ id:'npc', name:'NPC base', rig:BUILD_RIG, url:'./assets/npc/npc_base.glb', scale:1.25, animProfile:'rizer', hide:['N_skull'] }); // its round skull: worn instead as a Head shape
export const BUILD_PARTS = Object.freeze({
  [BUILD_BASE.id]: BUILD_BASE,
  mori: Object.freeze({ id:'mori', name:'Mori', rig:BUILD_RIG, url:'./assets/mori/mori.glb', scale:1.25, animProfile:'mori', hide:[], nativeHead:true })
});
export const buildBase = value => BUILD_PARTS[value?.foundation] || BUILD_BASE;
// Safe ranges (every preset in morphology.js sits inside them). Checked on the rig in motion: past these,
// girth starts to overlap at elbows / knees and limb length starts to open gaps in the fused outfit.
export const BUILD_CONTROLS = Object.freeze({
  height: { name:'Height', min:0.84, max:1.08 },
  weight: { name:'Weight / body fullness', min:0.88, max:1.18 },
  shoulders: { name:'Shoulders', min:0.88, max:1.18 },
  chest: { name:'Chest', min:0.88, max:1.16 },
  waist: { name:'Waist', min:0.86, max:1.14 },
  arms: { name:'Arms', min:0.86, max:1.16 },
  legs: { name:'Legs', min:0.86, max:1.14 },
  limbs: { name:'Limb length', min:0.92, max:1.08 },
  head: { name:'Head', min:0.94, max:1.08 }
});

// ── slots ──────────────────────────────────────────────────────────────────────────────────────
// One asset per slot (none allowed), except Accessories, which takes several. More specialised slots can be
// added here later; a build simply carries one entry per slot key. stage:'head' slots belong to the
// HEAD / FEATURES step; a `required` slot is never empty (it falls back to its default).
// Variation is the point: each slot offers several pieces at the same fidelity on the same skeleton (the two
// head shapes are the model), which is how phenotypes and species become visible.
export const BUILD_SLOTS = Object.freeze([
  { key:'headShape', name:'Head shape', stage:'head', required:true, default:'head_round' },
  { key:'hair', name:'Hair' },
  { key:'headFace', name:'Head / Face add-ons' },
  { key:'ears', name:'Ears' },
  { key:'neck', name:'Neck' },
  { key:'torsoBase', name:'Torso base' },
  { key:'torsoOuter', name:'Torso outer' },
  { key:'shoulders', name:'Shoulders' },
  { key:'upperArms', name:'Upper arms' },
  { key:'forearms', name:'Forearms' },
  { key:'hands', name:'Hands' },
  { key:'waist', name:'Waist' },
  { key:'legs', name:'Legs' },
  { key:'feet', name:'Feet' },
  { key:'back', name:'Back' },
  { key:'accessories', name:'Accessories', multi:true }
]);
const SLOT = Object.fromEntries(BUILD_SLOTS.map(s => [s.key, s]));

// ── the asset library (Rizer 1:1) ──────────────────────────────────────────────────────────────
// An asset is a skinned mesh authored on the standard skeleton at its bind pose. `source` says where it lives:
// { url, material } = the skinned primitive with that material in that GLB, or { url, node } = the skinned
// mesh with that node name (several assets can share one GLB and one material). Adding an asset = adding an entry
// (and, for new geometry, a GLB exported on the Rizer skeleton). When an asset loads, its skeleton is checked
// against the base bone for bone; an asset that doesn't fit 1:1 is refused, never bent to fit.
// The two hair pieces are the reference for how every later asset attaches.
export const BUILD_ASSETS = Object.freeze({
  head_round: { name:'Rounded', slot:'headShape', source:{ url:'./assets/npc/npc_heads.glb', node:'HeadRound' }, note:'smooth dome' },
  head_pointed: { name:'Pointed', slot:'headShape', source:{ url:'./assets/npc/npc_heads.glb', node:'HeadPointed' }, note:'faceted, peaked crown (Rizer\'s skull)' },
  hair_spiked: { name:'Spiked', slot:'hair', source:{ url:'./assets/rizer/rizer.glb', material:'R_hair' }, note:'Rizer\'s hair' },
  hair_mohawk: { name:'Mohawk', slot:'hair', source:{ url:'./assets/rizer/rizer_psychosyd.glb', material:'R_hair' }, note:'from the Psychosyd look' }
});
export const assetsFor = slot => Object.entries(BUILD_ASSETS).filter(([, a]) => a.slot === slot).map(([id, a]) => ({ id, ...a }));

const emptyParts = () => Object.fromEntries(BUILD_SLOTS.map(s => [s.key, s.multi ? [] : s.required ? s.default : null]));
const base = () => ({ version:2, rig:BUILD_RIG, standard:BUILD_STANDARD, foundation:BUILD_BASE.id, body:{ preset:'standard', proportions:{} }, head:{}, parts:emptyParts(), materials:{} });
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fits = (id, slot) => BUILD_ASSETS[id]?.slot === slot;
// Any build value (v1 from the old lab, v2, an import) → a clean v2 build. Unknown or retired parts are dropped.
export function normalizeBuild(value) {
  const out = base(), v = value?.build || value || {};
  if (BUILD_PARTS[v.foundation]) out.foundation = v.foundation;
  if (BODY_PRESETS[v.body?.preset]) out.body.preset = v.body.preset;
  for (const [key, range] of Object.entries(BUILD_CONTROLS)) {
    const n = Number(v.body?.proportions?.[key]);
    if (Number.isFinite(n) && n > 0) out.body.proportions[key] = +clamp(n, range.min, range.max).toFixed(3);
  }
  for (const s of BUILD_SLOTS) {
    const got = v.parts?.[s.key];
    if (s.multi) out.parts[s.key] = Array.isArray(got) ? [...new Set(got.filter(id => fits(id, s.key)))] : [];
    else out.parts[s.key] = fits(got, s.key) ? got : s.required ? s.default : null;
  }
  // Mori keeps its own skull, sunken face, mouth and eyes instead of wearing the NPC head.
  if (buildBase(out).nativeHead) out.parts.headShape = null;
  return out;
}
export const equippedAssets = build => BUILD_SLOTS.flatMap(s => s.multi ? build.parts[s.key] : build.parts[s.key] ? [build.parts[s.key]] : []);
// The proportions a build resolves to (preset + fine-tuning), clamped to the safe ranges.
export function resolveProportions(value) {
  const build = normalizeBuild(value), p = { ...BODY_PRESETS[build.body.preset], ...build.body.proportions };
  for (const [key, r] of Object.entries(BUILD_CONTROLS)) p[key] = clamp(Number.isFinite(p[key]) ? p[key] : 1, r.min, r.max);
  return p;
}

// ── loading assets and checking the 1:1 fit ────────────────────────────────────────────────────
const skeletonOf = scene => { let sk = null; scene.traverse(o => { if (!sk && o.isSkinnedMesh) sk = o.skeleton; }); return sk; };
const loaded = new Map(); // id → Promise<{ mesh, matrix, ok, issue }>
function loadAsset(id) {
  if (!loaded.has(id)) loaded.set(id, (async () => {
    const def = BUILD_ASSETS[id], [baseG, srcG] = await Promise.all([loadGLB(BUILD_BASE.url), loadGLB(def.source.url)]);
    srcG.scene.updateMatrixWorld(true);
    const want = o => def.source.node ? o.name === def.source.node : [].concat(o.material).some(m => m.name === def.source.material);
    let mesh = null; srcG.scene.traverse(o => { if (!mesh && o.isSkinnedMesh && want(o)) mesh = o; });
    if (!mesh) return { ok:false, issue:`${def.name}: no ${def.source.node || def.source.material} mesh in ${def.source.url}` };
    const a = skeletonOf(baseG.scene), b = mesh.skeleton;
    for (let i = 0; i < b.bones.length; i++) {
      const j = a.bones.findIndex(x => x.name === b.bones[i].name);
      if (j < 0) return { ok:false, issue:`${def.name}: bone ${b.bones[i].name} is not on the Rizer skeleton` };
      const ea = a.boneInverses[j].elements, eb = b.boneInverses[i].elements;
      for (let k = 0; k < 16; k++) if (Math.abs(ea[k] - eb[k]) > 1e-3) return { ok:false, issue:`${def.name}: not authored on the Rizer 1:1 bind pose (${b.bones[i].name})` };
    }
    return { ok:true, mesh, matrix:mesh.matrixWorld.clone().premultiply(srcG.scene.matrixWorld.clone().invert()) };
  })().catch(e => ({ ok:false, issue:`${BUILD_ASSETS[id]?.name || id}: ${e.message}` })).then(r => { loaded.get(id).result = r; return r; }));
  return loaded.get(id);
}
// Load every asset a build wears (cached). Returns the issues of any that can't be fitted.
export async function preloadBuild(value) {
  const res = await Promise.all(equippedAssets(normalizeBuild(value)).map(loadAsset));
  return res.filter(r => !r.ok).map(r => r.issue);
}

// ── proportions: a post-animation pass (see the header) ────────────────────────────────────────
// Each shaped bone gets a scale in its OWN frame (x/z = thickness, y = along the bone, since every rig
// here points +Y down the bone). Its child joints are then pinned to clean, unscaled world transforms
// (their local matrix absorbs the parent's scale), so nothing downstream is sheared or resized: the
// segment's flesh thickens and stretches to meet a joint that moved along the bone. The low-poly bodies
// are rigid per-bone segments, so this is what keeps elbows, knees and shoulders closed.
const SIDES = ['Left', 'Right'];
const _W = new THREE.Matrix4(), _S = new THREE.Matrix4(), _D = new THREE.Matrix4(), _I = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
function makeShape(actor, p) {
  const bone = n => actor.model.getObjectByName('mixamorig' + n);
  const depth = b => { let d = 0; for (let o = b; o.parent; o = o.parent) d++; return d; };
  const ops = [];
  const shape = (name, x, y, z) => { const b = bone(name); if (b && (Math.abs(x - 1) > 1e-4 || Math.abs(y - 1) > 1e-4 || Math.abs(z - 1) > 1e-4)) ops.push({ b, k: new THREE.Vector3(x, y, z), kids: b.children.filter(c => c.isBone) }); };
  shape('Head', p.head, p.head, p.head);
  shape('Spine2', p.chest * p.weight, 1, p.chest * p.weight);
  shape('Spine1', p.weight, 1, p.weight);
  shape('Spine', p.waist * p.weight, 1, p.waist * p.weight);
  for (const side of SIDES) {
    shape(side + 'Shoulder', 1, p.shoulders, 1);                      // clavicle length: shoulder width
    shape(side + 'Arm', p.arms * p.weight, p.limbs, p.arms * p.weight); shape(side + 'ForeArm', p.arms * p.weight, p.limbs, p.arms * p.weight);
    shape(side + 'UpLeg', p.legs * p.weight, p.limbs, p.legs * p.weight); shape(side + 'Leg', p.legs * p.weight, p.limbs, p.legs * p.weight);
  }
  ops.sort((a, b) => depth(a.b) - depth(b.b)); // parents before children
  // longer or shorter legs: lift / lower the hips by the change in rest leg height, so the feet stay grounded
  const hips = bone('Hips'), src = actor.gltf.scene; src.updateMatrixWorld(true);
  const sHips = src.getObjectByName('mixamorigHips'), sUp = src.getObjectByName('mixamorigLeftUpLeg'), sFoot = src.getObjectByName('mixamorigLeftFoot');
  let lift = null;
  if (hips && sHips?.parent && sUp && sFoot && Math.abs(p.limbs - 1) > 1e-4) {
    const h = sUp.getWorldPosition(new THREE.Vector3()).y - sFoot.getWorldPosition(new THREE.Vector3()).y;
    lift = new THREE.Vector3(0, (p.limbs - 1) * h, 0).applyMatrix3(new THREE.Matrix3().setFromMatrix4(sHips.parent.matrixWorld.clone().invert()));
  }
  const pinned = new Set(ops.flatMap(o => o.kids)), saved = ops.map(o => ({ b: o.b, s: new THREE.Vector3(), set: false }));
  const hipSave = { p: new THREE.Vector3(), set: false };
  return {
    proportions: { ...p },
    before() { // hand the bones back to the animation
      for (const c of pinned) c.matrixAutoUpdate = true;
      for (const t of saved) if (t.set) t.b.scale.copy(t.s);
      if (hipSave.set && hips) hips.position.copy(hipSave.p);
    },
    after() {
      for (const t of saved) { t.s.copy(t.b.scale); t.set = true; }
      if (lift && hips) { hipSave.p.copy(hips.position); hipSave.set = true; hips.position.add(lift); }
      actor.model.updateMatrixWorld(true); // the clean, animated pose
      for (const { b, k, kids } of ops) {
        _W.copy(b.matrixWorld);                                                    // this bone's world (already clean / pinned upstream)
        const clean = kids.map(c => c.matrixWorld.clone());                        // its children as the clip posed them
        _S.makeScale(k.x, k.y, k.z); b.matrixWorld.multiply(_S);                    // scale in its own frame
        if (b.matrixAutoUpdate) { b.scale.multiply(k); b.updateMatrix(); } else b.matrix.multiply(_S);
        _I.copy(b.matrixWorld).invert();
        kids.forEach((c, i) => {                                                   // pin each child: joint moves along the bone, nothing else changes
          clean[i].decompose(_p, _q, _s); _p.copy(c.position).applyMatrix4(b.matrixWorld);
          _D.compose(_p, _q, _s); c.matrix.multiplyMatrices(_I, _D); c.matrixAutoUpdate = false; c.matrixWorld.copy(_D);
        });
      }
      actor.model.updateMatrixWorld(true);
    }
  };
}

// ── the mannequin and its assets ───────────────────────────────────────────────────────────────
// Any `hide` primitive of the base is hidden on THIS actor only (object visibility; materials are shared with
// the live Rizer and are never touched). Each equipped asset becomes this actor's own SkinnedMesh: the
// asset's geometry (shared, read-only), its own copy of the material, bound to this actor's bones by name
// with the asset's bind inverses (identical to the base's: checked on load). So it rides every clip and
// every slider exactly like the body does.
function prepareBase(actor, build) {
  if (actor.buildBase) return;
  const foundation = buildBase(build);
  actor.model.traverse(o => { if (o.isSkinnedMesh && [].concat(o.material).some(m => foundation.hide.includes(m.name))) o.visible = false; });
  actor.buildBase = foundation.id;
}
function wearAsset(actor, id, a) {
  const src = a.mesh, bones = src.skeleton.bones.map(b => actor.model.getObjectByName(b.name));
  if (bones.some(b => !b)) return null;
  const mats = [].concat(src.material).map(m => m.clone());
  const mesh = new THREE.SkinnedMesh(src.geometry, mats.length === 1 ? mats[0] : mats);
  mesh.name = 'asset:' + id; mesh.matrixAutoUpdate = false; mesh.matrix.copy(a.matrix); mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  actor.model.add(mesh); mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones, src.skeleton.boneInverses.map(m => m.clone())), src.bindMatrix.clone());
  mesh.userData.ownMaterials = mats;
  return mesh;
}
function dropAsset(mesh) { mesh.removeFromParent(); for (const m of mesh.userData.ownMaterials || []) m.dispose(); mesh.skeleton?.dispose?.(); } // never the shared geometry
function attachAssets(actor, build) {
  const st = actor.buildAssets ||= new Map(), want = new Set(equippedAssets(build)), issues = [];
  for (const [id, mesh] of st) if (!want.has(id)) { dropAsset(mesh); st.delete(id); }
  for (const id of want) {
    if (st.has(id)) continue;
    const a = loaded.get(id)?.result;
    if (!a) { issues.push(`${BUILD_ASSETS[id].name}: still loading`); continue; }
    if (!a.ok) { issues.push(a.issue); continue; }
    const mesh = wearAsset(actor, id, a); if (mesh) st.set(id, mesh); else issues.push(`${BUILD_ASSETS[id].name}: bones missing on this body`);
  }
  return issues;
}

// This path is shared by the Lab preview and character construction (character-factory.js).
// Only the given actor changes: its own model scale, its own bones (per frame), its own asset meshes.
const originals = new WeakMap();
export function applyBuildToActor(actor, value) {
  if (!actor?.model) return null;
  const build = normalizeBuild(value), p = resolveProportions(build);
  prepareBase(actor, build);
  if (!originals.has(actor)) originals.set(actor, { scale:actor.model.scale.clone(), position:actor.model.position.clone(), s:actor.scale });
  const start = originals.get(actor);
  actor.model.scale.copy(start.scale).multiplyScalar(p.height); actor.model.position.copy(start.position).multiplyScalar(p.height); actor.scale = start.s * p.height;
  actor.shape?.before(); // put back last build's pass before swapping it
  actor.shape = makeShape(actor, p);
  actor.buildIssues = attachAssets(actor, build);
  actor.morphology = { baseline:BUILD_STANDARD, body:build.body.preset, proportions:p };
  return build;
}
export function removeBuildAssets(actor) { for (const mesh of actor?.buildAssets?.values() || []) dropAsset(mesh); actor?.buildAssets?.clear(); }

export function readBuildTemplates() {
  try {
    const rows = JSON.parse(localStorage.getItem(BUILD_STORAGE) || '[]');
    if (Array.isArray(rows)) return rows.filter(r => typeof r?.id === 'string' && typeof r?.name === 'string').map(r => ({ id:r.id, name:r.name.slice(0,80), build:normalizeBuild(r.build) }));
  } catch {}
  return [];
}
export function writeBuildTemplates(rows) { localStorage.setItem(BUILD_STORAGE, JSON.stringify(rows)); }

// ── playable builds ────────────────────────────────────────────────────────────────────────────
// "Save to playable characters" (Build Lab) keeps a build here; the game lists it beside Rizer in the
// character switcher (rizer.js CHARACTERS · Zyphone → Characters, Anim Lab, Skin Lab) so it can be played and
// its animations tested. It moves with Rizer's Anim Lab clips (BUILD_BASE.animProfile). Saving again under the
// same name updates it.
export const PLAYABLE_STORAGE = 'rp7d.buildLab.playable.v1';
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'character';
export function readPlayableBuilds() {
  try {
    const rows = JSON.parse(localStorage.getItem(PLAYABLE_STORAGE) || '[]');
    if (Array.isArray(rows)) return rows.filter(r => typeof r?.key === 'string' && r.key.startsWith('npc-') && typeof r?.name === 'string').map(r => ({ key:r.key, name:r.name.slice(0, 80), build:normalizeBuild(r.build) }));
  } catch {}
  return [];
}
// A row → a character entry (the shape rizer.js CHARACTERS uses, plus the build itself).
export const playableEntry = row => {
  const build = normalizeBuild(row.build), foundation = buildBase(build);
  return { name:row.name, url:foundation.url, scale:foundation.scale, animProfile:foundation.animProfile, build, built:true, blurb:`Built in the Build Lab · ${foundation.name}` };
};
export function registerPlayableBuilds(characters) { for (const r of readPlayableBuilds()) characters[r.key] = playableEntry(r); }
export function savePlayableBuild(name, value) {
  const rows = readPlayableBuilds(), key = 'npc-' + slug(name), build = normalizeBuild(value);
  const row = rows.find(r => r.key === key), isNew = !row;
  if (row) { row.name = name; row.build = build; } else rows.push({ key, name, build });
  localStorage.setItem(PLAYABLE_STORAGE, JSON.stringify(rows));
  return { key, name, build, isNew };
}
