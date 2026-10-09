// RP7D · Malezor Sandbox — bootstrap and main loop.
// world-data.js describes the district; world.js builds it; rizer.js moves
// through it; sky.js lights it; hud.js reports on it.
import { applyLockIcon } from './lock-icon.js';
import * as THREE from 'three';
import { createN3000 } from './n3000.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { MALEZOR, quarterAt } from './world-data.js';
import { DISTRICTS } from './district-view.js';
import { createWorld } from './world.js';
import { createSky } from './sky.js';
import { Rizer, FollowCamera, CHARACTERS, COMBAT, BLADES, FAE_HAND_HEIGHT } from './rizer.js';
import { DOORWALK, doorAngle } from './doorwalk.js';
import { createZycube } from './zycube.js';
import { createSeers } from './seers.js';
import { debugMesh, HITBOX, touch } from './hitbox.js';
import { createNovaGuardians } from './nova.js';
import { createResourcePiles, addResource, removeResource, getResourceCount, hasResource, RESOURCES, SALVAGE } from './resources.js';
import { createBolts, holdRifle, muzzleOf, THARDIN_BLASTER_RIFLE, hasRifleClips, gripRifle } from './thardin-rifle.js';
import { createZyphone } from './zyphone.js';
import { createAnimLab } from './anim-lab.js';
import { createSkinLab } from './skin-lab.js';
import { createBuildLab } from './build-lab.js';
import { populate as populateZyrex, createPartner, setZyrex2DNight } from './zyrex2d.js'; // 2DHD Zyrex (RP7B art)
import { WildZyrex } from './zyrex.js'; // the 3D meshes: Dev › Zyrex as 3D meshes
import { createBondGame } from './bond.js';
import { createFX } from './fx.js';
import { createAstral, ASTRAL } from './astral.js';
import { focus, FOCUS_MOVES, DIRS, DIR_NAME, DIR_KEY, DIR_CODE, createLightbulbChests } from './focus-moves.js';
import { CAVES, CAVE_BY_ID } from './caves-data.js';
import { createCaveInteriors } from './cave-interior.js';
import { createStoreInterior } from './store-interior.js';
import { createAstralStorm, STORM, STORM_TIMING } from './astral-storm.js';
import { createAstralvision } from './astralvision.js';
import { createLoot, createCommonChests, createChestLight, createHeldWeapons, buildTelescope, buildAstralboard, buildChest, chestFront, porchChestSpots, PLAYTEST_PORCH_CHESTS, ASTRALITE_FAMILIES, inventory, saveInv, WEAPONS, RIDES, ITEMS, ENTITIES, addItem, eatItem, hasWeapon } from './loot.js';
import { storage } from './storage.js';
import { createTVSystem, buildDvdPickup } from './tv-system.js';
import { DVDS } from './dvd-registry.js';
import { createLabs } from './labs.js';
import { createXray } from './astral-xray.js';
import { astral as astralBuild, ASTRAL as ASTRAL_AP, STATS, SYSTEMS, MODS, meleeMul, staminaRegenMul, dodgeCostMul, astralHitMul, astralRegen, hpRegen } from './astral-stats.js';
import { crafting } from './crafting.js';
import { createDeployables } from './deployables.js';
import { pushOut, sweepOut } from './body-collision.js';
import { createStationUI } from './station-ui.js';
import { createAstralboard } from './astralboard.js';
import { createAstragraphy } from './astragraphy.js';
import { createAstragraphyLog } from './aethryx-data.js';
import { createWestLakeBus } from './west-lake-bus.js';
import { createPearlbow } from './pearlbow.js';
import { resetAssignments, unregisterActor } from './anim-lib.js';
import { registerPlayableBuilds, savePlayableBuild, playableEntry, removeBuildAssets } from './build-library.js';
import { createHUD } from './hud.js';
import { createUILayout } from './ui-layout.js';
import { setNight } from './props.js';
import { createHomeInterior } from './home-interior.js';
import { createFurnitureMover } from './home-furniture.js';
import { createSeating } from './seating.js';
import { createSoundtrack } from './soundtrack.js';
import { createSfx } from './sfx.js';
import { createAnciuxor } from './anciuxor.js';
import { createScanobots } from './scanobots.js';
import { createPenumbras } from './penumbra.js';
import { progression, awardRizerXP, levelInfo, levelStart, RXP_CURVE } from './progression.js';
import { awardCombatRXP, awardDiscovery, awardObjective, awardOnce, combatRXP, RXP_BANDS, RXP_REWARDS, RXP_COMBAT, RXP_ENEMIES, RXP_DISCOVERY, RXP_OBJECTIVES } from './rxp-rewards.js';
import { createCoinPiles, COIN_PILES } from './coin-piles.js';
import { createGatelocks, GATELOCK } from './gatelocks.js';

const W = MALEZOR;
registerPlayableBuilds(CHARACTERS); // characters saved from the Build Lab, playable beside Rizer
const $ = s => document.querySelector(s);
const canvas = $('#world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.info.autoReset = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 420);

// Uniforms shared by water, grass, trees, sky and particles.
const shared = {
  uTime: { value: 0 }, uNight: { value: 0 }, uPlayer: { value: new THREE.Vector3() },
  uCam: { value: new THREE.Vector3() }, uFocus: { value: new THREE.Vector3() },
  uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunColor: { value: new THREE.Color('#fff') }, uSkyHorizon: { value: new THREE.Color('#cfe2e6') }
};

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.35, 0.55, 0.9);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ── input ────────────────────────────────────────────────────────────
const keys = new Set(), pressed = new Set();
let mousePunchHeld = false;
let locked = false, toastTimer;
addEventListener('keydown', e => {
  if (n3000?.isOpen) { n3000.key(e); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if (tv?.isOpen) { tv.key(e); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if (!e.target?.matches?.('[data-skin-hex], [data-build-name], [data-labs-name]') && ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (bondGame?.active) { if (!e.repeat) bondGame.key(e.code); e.preventDefault(); return; }
  if (stationUI?.isOpen) { if (!e.repeat) stationUI.key(e.code); e.preventDefault(); return; } // Home PC / Experiment Table / Field Workstation screens
  if (dep?.placing && (e.code === 'Escape' || e.code === 'Backspace')) { if (!e.repeat) dep.cancel(); e.preventDefault(); return; }
  if (zy?.isOpen) { if (!e.repeat) zy.key(e.code); return; } // the Zyphone takes the keyboard while open
  if (buildLab?.isOpen && buildLab.key(e.code, e.target)) { if (!e.target?.matches?.('[data-build-name]') || e.code === 'Escape') e.preventDefault(); return; }
  if (skinLab?.isOpen && skinLab.key(e.code, e.target)) { if (!e.target?.matches?.('[data-skin-hex]') || e.code === 'Escape' || e.code === 'Enter') e.preventDefault(); return; }
  if (lab?.isOpen && (e.repeat ? /^Arrow(Up|Down)$/.test(e.code) && lab.key(e.code) : lab.key(e.code))) { e.preventDefault(); return; } // then the Anim Lab
  if (e.code === 'KeyL' && !e.repeat && started && lab && !skinLab?.isOpen) { lab.open(); return; }
  if (!keys.has(e.code)) pressed.add(e.code);
  keys.add(e.code); setPad(false);
}, { capture: true });
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
// Pointer lock is optional: embedded frames and some browsers refuse it, so drag-to-look always works too.
function tryLock() { try { const r = canvas.requestPointerLock?.(); r?.catch?.(() => {}); } catch (e) {} }
let dragging = false;
canvas.addEventListener('mousedown', e => {
  dragging = true; canvas.focus?.();
  if (locked) { if (e.button === 0) { pressed.add('MousePunch'); mousePunchHeld = true; } if (e.button === 2) pressed.add('MouseKick'); }
  if (e.button === 1) { e.preventDefault(); pressed.add('MouseLock'); }
});
canvas.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('mouseup', () => { dragging = false; mousePunchHeld = false; });
addEventListener('blur', () => { mousePunchHeld = false; });
canvas.addEventListener('click', () => { if (document.pointerLockElement !== canvas && !zy?.isOpen && !scopeView) tryLock(); });
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  $('.crosshair').style.opacity = locked ? '.45' : '0';
  if (locked) showToast('Mouse captured · Left click punch · Right click kick');
});
function showToast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1800); }
function enterUfo() {
  const v = world?.ufo; if (!v || ufoPilot || ufoTransition) return;
  const scale = rizer.obj.scale.clone(), from = rizer.position.clone();
  const to = v.root.position.clone().add(new THREE.Vector3(0, 5, 0));
  v.setPiloted(true); rizer.inUfo = true; rizer.flying = false; rizer.onGround = false; rizer.attack = null; rizer.lockPos = null;
  astral.clearLock(); rizer.actor?.play('float', 1, { loop: true });
  ufoTransition = { kind: 'enter', t: 0, duration: 0.78, from, to, scale };
  showToast('Aetherstride · Triangle to pilot · ✕ rise · L2 descend · R2 speed · ○ turbo / locked laser');
}
function exitUfo() {
  if (!ufoPilot || ufoTransition) return;
  const v = world.ufo, yaw = v.root.rotation.y;
  const candidates = [1, -1].map(side => ({ x: rizer.position.x + Math.cos(yaw) * side * 11, z: rizer.position.z - Math.sin(yaw) * side * 11 }));
  let at = candidates.find(q => world.onLand(q.x, q.z) && !world.resolve(new THREE.Vector3(q.x, world.groundAt(q.x, q.z), q.z), 1));
  if (!at) at = { x: rizer.position.x, z: rizer.position.z };
  const from = v.root.position.clone().add(new THREE.Vector3(0, 4.8, 0)), scale = rizer.obj.scale.clone();
  const to = new THREE.Vector3(at.x, world.groundAt(at.x, at.z), at.z);
  rizer.position.copy(from); rizer.obj.visible = true; rizer.obj.scale.setScalar(0.015); rizer.inUfo = true;
  rizer.flying = true; rizer.onGround = false; rizer.actor?.play('float', 1, { loop: true });
  ufoTransition = { kind: 'exit', t: 0, duration: 0.92, from, to, scale };
  showToast('Aetherstride · holographic projection');
}
function updateUfoTransition(dt) {
  const q = ufoTransition; if (!q) return;
  q.t = Math.min(q.duration, q.t + dt);
  const t = q.t / q.duration, ease = t * t * (3 - 2 * t);
  rizer.position.lerpVectors(q.from, q.to, ease);
  if (q.kind === 'enter') rizer.obj.scale.copy(q.scale).multiplyScalar(Math.max(0.012, 1 - ease));
  else rizer.obj.scale.copy(q.scale).multiplyScalar(Math.max(0.012, ease));
  rizer.speed = 0; rizer.vy = 0; rizer.animateModel(dt);
  if (t < 1) return;
  if (q.kind === 'enter') {
    rizer.obj.visible = false; rizer.obj.scale.copy(q.scale); ufoPilot = true; ufoVelocity.set(0, 0, 0); ufoFireCooldown = 0;
  } else {
    rizer.obj.scale.setScalar(1); rizer.inUfo = false; rizer.flying = false; rizer.onGround = true; rizer.vy = 0; rizer.vel.set(0, 0, 0); rizer.speed = 0;
    ufoPilot = false; world.ufo.setPiloted(false); ufoVelocity.set(0, 0, 0); ufoTurboT = 0; rizer.actor?.release('float', 0.2); showToast('Exited Aetherstride');
  }
  ufoTransition = null;
}
function updateUfo(dt, inp, camYaw) {
  const v = world.ufo, p = rizer.position;
  const fwd = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw)), right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  const want = fwd.multiplyScalar(-inp.z).add(right.multiplyScalar(inp.x));
  let mag = Math.min(1, want.length()); if (mag > 0.01) want.normalize();
  ufoTurboT = Math.max(0, ufoTurboT - dt); ufoTurboCooldown = Math.max(0, ufoTurboCooldown - dt);
  if (ufoTurboT > 0 && mag < 0.02) {
    if (Math.hypot(ufoVelocity.x, ufoVelocity.z) > 1) want.set(ufoVelocity.x, 0, ufoVelocity.z).normalize();
    else want.set(-Math.sin(camYaw), 0, -Math.cos(camYaw));
    mag = 1;
  }
  const top = ufoTurboT > 0 ? 112 : inp.run ? 54 : 30; want.multiplyScalar(mag * top);
  const blend = 1 - Math.exp(-(mag > 0.02 ? 3.8 : 2.4) * dt); ufoVelocity.lerp(want, blend);
  const oldX = p.x, oldZ = p.z; p.x += ufoVelocity.x * dt; p.z += ufoVelocity.z * dt;
  if (world.keepOnLand(p, oldX, oldZ)) ufoVelocity.multiplyScalar(0.15);
  const floor = world.groundAt(p.x, p.z);
  // Match Rizer's flight pitch: looking up climbs and looking down dives while steering.
  const aim = THREE.MathUtils.clamp(((inp.camPitch ?? 0.2) - 0.2) * -1.8, -1, 1) * (mag > 0.1 ? 1 : 0);
  const vertical = (inp.jumpHeld ? COMBAT.fly.climb : 0) - (inp.descendHeld || keys.has('KeyC') ? COMBAT.fly.climb : 0) + aim * Math.hypot(ufoVelocity.x, ufoVelocity.z) * COMBAT.fly.pitchClimb;
  ufoVelocity.y += (vertical - ufoVelocity.y) * (1 - Math.exp(-4 * dt));
  p.y = Math.max(floor + 2.7, Math.min(floor + 62, p.y + ufoVelocity.y * dt));
  if ((p.y <= floor + 2.7 && ufoVelocity.y < 0) || (p.y >= floor + 62 && ufoVelocity.y > 0)) ufoVelocity.y = 0;
  if (ufoVelocity.length() > 1) rizer.facing = Math.atan2(ufoVelocity.x, ufoVelocity.z);
  rizer.speed = ufoVelocity.length(); rizer.onGround = false; rizer.flying = false;
  v.root.position.set(p.x, p.y - 5, p.z); v.root.rotation.y = rizer.facing;
}
function turboUfo() {
  if (ufoTurboCooldown > 0) return;
  ufoTurboT = 1.35; ufoTurboCooldown = 2.4;
  const p = world.ufo.root.position, a = world.ufo.root.rotation.y;
  fx.emit(p.x - Math.sin(a) * 5, p.y + 4.4, p.z - Math.cos(a) * 5, 24, { color: '#55e7ff', speed: 11, up: 0, size: 0.42, life: 0.7 });
  showToast('AETHERSTRIDE · TURBO');
}
function fireUfoLaser() {
  if (ufoFireCooldown > 0) return;
  const target = astral.lock;
  if (!target || target.kind !== 'enemy' || !seers?.alive(target.ref)) { showToast('Lock onto a Seer or Mori first'); return; }
  if (!rizer.spendEnergy(10)) { showToast('ASTRAL ENERGY LOW'); return; }
  const root = world.ufo.root, start = new THREE.Vector3(0, 4.3, 9).applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y).add(root.position);
  const end = target.pos().clone().add(new THREE.Vector3(0, 1.4, 0)), delta = end.clone().sub(start), dist = delta.length();
  if (world.rayClear(start, end, 0.1) < dist - 1.2) { showToast('Laser blocked'); return; }
  delta.normalize(); seers.hitGrunt(target.ref, 4, delta.x, delta.z, 'blast', 0.35);
  if (ufoBeam) { scene.remove(ufoBeam.mesh); ufoBeam.mesh.geometry.dispose(); ufoBeam.mesh.material.dispose(); }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, dist, 8), new THREE.MeshBasicMaterial({ color: '#81efff', transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  beam.position.copy(start).add(end).multiplyScalar(0.5); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta); scene.add(beam); ufoBeam = { mesh: beam, age: 0 };
  fx.emit(end.x, end.y, end.z, 9, { color: '#81efff', speed: 3, up: 1, size: 0.3, life: 0.3 });
  ufoFireCooldown = 0.55; showToast(`UFO laser · ${target.ref.T.name} hit`);
}
// Drag a saved skin (a Skin Lab export, e.g. "goku skin.json") anywhere onto the game: its colors become that
// character's skin preset and the player switches to that character if needed. Handled in the capture phase so
// the Anim Lab's page-wide drop (FBX / GLB clips) never sees skin files; anything else still goes to it.
const isSkinFile = f => /\.json$/i.test(f.name || '') || f.type === 'application/json';
const draggedSkins = e => { const it = [...(e.dataTransfer?.items || [])].filter(i => i.kind === 'file'); return it.length > 0 && it.every(i => i.type === 'application/json'); };
addEventListener('dragover', e => { if (!draggedSkins(e)) return; e.preventDefault(); e.stopImmediatePropagation(); document.body.classList.add('skin-drop'); }, true);
addEventListener('dragleave', e => { if (!e.relatedTarget) document.body.classList.remove('skin-drop'); }, true);
addEventListener('drop', e => {
  document.body.classList.remove('skin-drop');
  const files = [...(e.dataTransfer?.files || [])];
  if (!files.length || !files.every(isSkinFile)) return; // clips (or a mix) go on to the Anim Lab
  e.preventDefault(); e.stopImmediatePropagation(); document.body.classList.remove('lab-drop');
  loadSkinFile(files[files.length - 1]);
}, true);
async function loadSkinFile(file) {
  const label = file.name.replace(/\.json$/i, '');
  let data; try { data = JSON.parse(await file.text()); } catch { return showToast(`${label} · not a skin file`); }
  if (labs?.isTemplate(data)) { const r = await labs.applyTemplate(data); if (!r.ok) showToast(`${label} · ${r.reason}`); return; } // a LABS template: wear it
  if (!skinLab || !rizer) return showToast('The game is still loading · drop the skin again in a moment');
  const key = typeof data?.character === 'string' && data.character ? data.character : rizer.charKey;
  if (!CHARACTERS[key]) return showToast(`${label} · it is for an unknown character (${key})`);
  if (rizer.charKey !== key) { settings.char = key; saveSettings(); await rizer.setCharacter(key); }
  const r = skinLab.load(data, key);
  if (!r.ok) return showToast(`${label} · ${r.reason}`);
  showToast(`SKIN LOADED · ${label} · ${CHARACTERS[key].name}`);
  const p = rizer.position; fx?.emit(p.x, p.y + 1.2, p.z, 18, { color: '#e9c982', speed: 1.6, up: 1.6, size: 0.25, life: 0.6, g: -1 });
}
// Build Lab · Save to playable characters: store the build, list it with the playable characters, and if it is
// the one being played, rebuild its body now (the old one is dropped once the new one stands in).
async function savePlayable(name, build) {
  const row = savePlayableBuild(name, build);
  CHARACTERS[row.key] = playableEntry(row);
  const old = rizer.cast[row.key];
  if (old) {
    delete rizer.cast[row.key];
    if (rizer.charKey === row.key) await rizer.setCharacter(row.key);
    const a = await old.catch(() => null);
    if (a) { unregisterActor(a); a.mixer.stopAllAction(); removeBuildAssets(a); a.pivot.removeFromParent(); }
  }
  return row;
}
// Jumped through an open Portal Gatelock (gatelocks.js): he is already at the far gate; the camera and the fight catch up.
function portalJump(to) {
  astral.clearLock(); cam.snapBehind(rizer); cam.kick(0.5); rumbleHit('medium');
  showToast('PORTAL · through to the other gate');
}
// The wild Zyrex population. Every RP7B Zyrex with 2DHD art, sampled into Malezor's wild (zyrex2d.js); Elzebub keeps
// his canon spot by the treehouse. Dev › Wild Zyrex OFF clears them out of the world; Dev › Zyrex as 3D meshes builds
// the same individuals, in the same places, from zyrex.js's meshes instead of the 2DHD sheets.
function spawnZyrex() {
  for (const z of zyrex || []) scene.remove(z.b.root);
  astral?.clearLock?.(); zyrex = [];
  if (settings.dev && settings.zyrexOff) return;
  const skip = new Set((inventory.bondedZyrex || []).map(b => b.id)), mesh3d = settings.dev && settings.zyrex3d;
  zyrex = populateZyrex(scene, world, W, { skip, pinned: W.wildZyrex.filter(d => d.species === 'elzebub').map(d => ({ ...d, scale: mesh3d ? d.scale : 1, temperament: 'Calm' })),
    make: mesh3d ? d => { const z = new WildZyrex(scene, { palette: 'moss', scale: 0.8 + ((d.n || 0) % 3) * 0.1, ...d }, world, W.wildPatchHalf); z.temper = d.temperament || 'Calm'; return z; } : null });
  for (const z of zyrex) z.setVisible ? z.setVisible(!homeMode) : (z.b.root.visible = !homeMode);
  console.log(`[rp7d] wild Zyrex (${mesh3d ? '3D' : '2DHD'}):`, zyrex.length);
}
// FocusLock (hold R3): on, a fight locks the nearest enemy without being asked; off, every lock is manual.
function toggleFocus() {
  settings.focus = settings.focus === false; saveSettings();
  showToast(settings.focus ? 'FOCUSLOCK ON · enemies in reach are locked automatically' : 'FOCUSLOCK OFF · lock on manually (R3 / R)');
}
// The active partner: one bonded Zyrex out in the world with Rizer. Picking another (Zyphone › Zyrex) swaps it.
function setPartner(id) {
  const rec = (inventory.bondedZyrex || []).find(b => b.id === id); if (!rec) return false;
  if (partner) { scene.remove(partner.b.root); partner = null; }
  inventory.activeZyrex = rec.id; saveInv();
  const a = rizer.facing + Math.PI - 0.7, at = { x: rizer.position.x + Math.sin(a) * 2.3, z: rizer.position.z + Math.cos(a) * 2.3 };
  partner = createPartner(scene, world, rec, at); partner?.setVisible(!homeMode);
  hud?.setPartner({ name: rec.name, type: rec.species, lv: rec.level, hp: 100, maxHp: 100, ap: 100, maxAp: 100 });
  if (partner && !homeMode) fx?.emit(at.x, rizer.position.y + 1, at.z, 18, { color: '#70c8ff', speed: 2.2, up: 1.6, size: 0.22, life: 0.5 });
  return !!partner;
}
function partnerHit(h, z) {
  if (!h) return; fx.emit(h.x, h.y, h.z, h.down ? 16 : 8, { color: h.down ? '#c9a0ff' : '#9fe0ff', speed: 3, up: 1.3, size: 0.34, life: 0.38 });
  sfx.play(h.down ? 'heavy' : 'medium', 0.8, 1.1);
  if (h.down) showToast(`${z.record.name} brings ${h.name || 'it'} down · ${seers.defeated} fewer holding Malezor`);
}
function setOutdoorActorsVisible(value) {
  const visible = !!value;
  if (zycube) zycube.root.visible = visible && zycube.dropped;
  if (npcs) for (const n of npcs.npcs) n.root.visible = visible;
  for (const z of zyrex || []) z.setVisible ? z.setVisible(visible) : z.b?.root && (z.b.root.visible = visible);
  partner?.setVisible(visible);
  if (seers) for (const g of seers.grunts) { const v = g.cave ? caveMode && g.cave === caveId : visible; g.root.visible = v; g.lootBag.visible = v && g.state === 'down' && !g.looted; }
  commonChests?.setVisible(visible);
  if (loot) for (const c of loot.all) { c.chest.visible = visible; c.mesh.visible = visible && c.state === 'waiting'; }
  astralboard?.setVisible(visible);
  if (westLakeBus) westLakeBus.root.visible = visible;
  if (anciuxor) anciuxor.sprite.visible = visible;
  scanobots?.setVisible(visible); penumbras?.setVisible(visible); novas?.setVisible(visible); bolts?.setVisible(visible); resources?.setVisible(visible); gatelocks?.setVisible(visible); coinPiles?.setVisible(visible);
}
// Building interiors: one mechanism for every enterable building (Rizer's Home, the Malezor Town Store, …). The exterior
// stays part of the overworld; walking through the door loads that building's own interior level, and leaving puts
// Rizer back where he went in. Inventory, gold, progress: untouched by the trip.
function showInterior(I = homeInterior) {
  if (homeMode || !I) return;
  homeReturn = { x: rizer.position.x, y: rizer.position.y, z: rizer.position.z, facing: rizer.facing };
  indoor = I; homeMode = true; world.setExteriorVisible(false); I.show(true); setOutdoorActorsVisible(false);
  $('#game').classList.add('home-interior'); astral.clearLock(); I.start(rizer, cam, 1);
  cam.snapBehind(rizer);
  showToast(I === homeInterior ? 'Rizer’s Living Room · walk upstairs to Rizer’s room' : 'Malezor Town Store · Floor 1 · Rizer Department · the stairs on the right lead up to the Zyrex Department', 3400);
}
const showHomeInterior = () => showInterior(homeInterior);
// ── Pickups: loot lying in the world. Wild fruit in the grass (nature.js) and the bags defeated enemies drop.
// ○ (E) near one picks it up: running, he scoops it on the move (Pick Up Item); otherwise he walks up and
// picks it up (Picking Up). Works mid-fight. Picked fruit stays picked (inventory.picked.flowers — the key predates fruit).
// Fruit is eaten on the spot for a small boost to its RHUD meter; if that meter is full it goes in the bag (Zyphone → Items).
let fruitGrid = null;
function fruitReady() {
  if (fruitGrid) return fruitGrid;
  const F = world.nature?.userData.fruits; if (!F) return null;
  const done = new Set(inventory.picked?.flowers || []);
  fruitGrid = new Map();
  for (const f of F.list) { if (done.has(f.i)) F.pick(f); const k = Math.floor(f.x / 8) + ',' + Math.floor(f.z / 8); if (!fruitGrid.has(k)) fruitGrid.set(k, []); fruitGrid.get(k).push(f); }
  return fruitGrid;
}
// Fae, Faery, Astral Fae and Zyphere: pickups scattered by nature.js, gridded the same way as fruit
// (see fruitReady) so nearestLoot() can look them up by cell. Zyphere rests on the ground; the three
// fae wander at FAE_HAND_HEIGHT (rizer.js) — the height of Rizer's hands at the top of his catch leap —
// and ○ near one leaps for it: a coin flip decides the catch (attemptFaeCatch below). Collected ones
// respawn on their own timer once Rizer has wandered far enough off — see tickFieldPickups() below.
const FAE_KINDS = ['fae', 'faery', 'fae_astral'], FIELD_KINDS = [...FAE_KINDS, 'zyphere'];
const FAE_CATCH_RATE = 0.5; // 50/50
const FIELD_RESPAWN_MS = 90 * 1000, FIELD_RESPAWN_DIST = 30;
const fieldGrids = {};
function fieldReady(kind) {
  if (fieldGrids[kind]) return fieldGrids[kind];
  const F = world.nature?.userData[kind]; if (!F) return null;
  const grid = new Map();
  for (const f of F.list) { const k = Math.floor(f.x / 8) + ',' + Math.floor(f.z / 8); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(f); }
  fieldGrids[kind] = { F, grid };
  return fieldGrids[kind];
}
function tickFieldPickups() {
  if (!rizer) return;
  for (const kind of FIELD_KINDS) {
    const ready = fieldReady(kind); if (!ready) continue;
    const { F } = ready;
    F.animate?.(elapsed);
    for (const f of F.list) {
      if (!f.gone || !f._collectedAt) continue;
      if (performance.now() - f._collectedAt < FIELD_RESPAWN_MS) continue;
      if (Math.hypot(f.x - rizer.position.x, f.z - rizer.position.z) < FIELD_RESPAWN_DIST) continue;
      const m = new THREE.Matrix4().compose(new THREE.Vector3(f.x, f.y, f.z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      F.inst.setMatrixAt(f.i, m); F.inst.instanceMatrix.needsUpdate = true; f.gone = false; f._collectedAt = null;
    }
  }
}
function nearestLoot() {
  if (homeMode || !rizer || rizer.hp <= 0) return null;
  tickFieldPickups();
  const p = rizer.position, fwd = rizer.facing, cand = [];
  const score = (x, z, reach) => { const d = Math.hypot(x - p.x, z - p.z); if (d > reach) return null; const off = Math.abs(Math.atan2(Math.sin(Math.atan2(x - p.x, z - p.z) - fwd), Math.cos(Math.atan2(x - p.x, z - p.z) - fwd))); return off < 1.1 || d < 1.1 ? d + off * 0.6 : null; };
  const G = fruitReady();
  if (G) { const cx = Math.floor(p.x / 8), cz = Math.floor(p.z / 8); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const f of G.get((cx + i) + ',' + (cz + j)) || []) { if (f.gone) continue; const s = score(f.x, f.z, rizer.speed > 4.5 ? 3.2 : 2.2); if (s != null) cand.push({ s, d: Math.hypot(f.x - p.x, f.z - p.z), kind: 'fruit', f, x: f.x, y: f.y, z: f.z, name: ITEMS[f.item].name }); } }
  for (const kind of FIELD_KINDS) {
    const ready = fieldReady(kind); if (!ready) continue;
    const fae = FAE_KINDS.includes(kind);
    if (fae && (!rizer.onGround || rizer.fc)) continue; // the catch leap starts from the ground (and one at a time)
    // Fae drift across cell boundaries, so use their current positions. The field
    // has only a few hundred pickups; a direct distance pass is cheaper than regridding.
    for (const f of ready.F.list) {
      if (f.gone) continue;
      if (fae && Math.abs(f.y - (p.y + FAE_HAND_HEIGHT)) > 1.2) continue; // over a ledge or down a slope: out of his leap
      const s = score(f.x, f.z, fae ? COMBAT.faeCatch.range : rizer.speed > 4.5 ? 3.2 : 2.2); // the leap covers ground, so fae are in reach from further off
      if (s != null) cand.push({ s, d: Math.hypot(f.x - p.x, f.z - p.z), kind, f, x: f.x, y: f.y, z: f.z, name: fae ? `Catch · ${ENTITIES[kind].name}` : ENTITIES[kind].name });
    }
  }
  for (const g of seers?.grunts || []) if (g.state === 'down' && !g.looted && g.lootBag.visible) { const s = score(g.pos.x, g.pos.z, 3); if (s != null) cand.push({ s, d: Math.hypot(g.pos.x - p.x, g.pos.z - p.z), kind: 'bag', it: g.drop, x: g.pos.x, y: g.pos.y, z: g.pos.z, name: g.drop?.name || 'Loot' }); }
  for (const c of scanobots?.chips || []) if (!c.taken) { const s = score(c.x, c.z, rizer.speed > 4.5 ? 3.2 : 2.4); if (s != null) cand.push({ s, d: Math.hypot(c.x - p.x, c.z - p.z), kind: 'portalchip', it: c, x: c.x, y: c.y, z: c.z, name: chipName(c) }); } // a Scanobot's Portalchip, or a Penumbra's ×3
  for (const s of resources?.piles || []) if (!s.taken && s.settled) { const sc = score(s.x, s.z, rizer.speed > 4.5 ? 3.2 : 2.4); if (sc != null) cand.push({ s: sc, d: Math.hypot(s.x - p.x, s.z - p.z), kind: 'resource', it: s, x: s.x, y: s.y, z: s.z, name: `${s.name} ×${s.quantity}` }); } // a pile of Scrap Metal
  for (const w of novas?.drops || []) if (!w.taken && w.settled) { const s = score(w.x, w.z, 2.6); if (s != null) cand.push({ s, d: Math.hypot(w.x - p.x, w.z - p.z), kind: 'weapon', it: w, x: w.x, y: w.y, z: w.z, name: `Pick up · ${w.name}` }); } // a rifle a Nova Guardian dropped
  if (zycube?.dropped) { const q = zycube.root.position, d = Math.hypot(q.x - p.x, q.z - p.z); if (d < 2.6) cand.push({ s: d - 5, d, kind: 'zycube', x: q.x, y: q.y, z: q.z, name: 'Zycube' }); } // it always wins
  return cand.sort((a, b) => a.s - b.s)[0] || null;
}

// ── storage · crafting · field equipment (storage.js, crafting.js, deployables.js, station-ui.js) ──
// Pickups ask storage whether the Zycube can take them FIRST: a full Zycube leaves the world item where it is.
function canCarry(id, qty = 1) {
  const c = storage.canStore('ZYCUBE', id, qty);
  if (c.ok || c.reason === 'DUPLICATE' || c.reason === 'UNKNOWN_ITEM') return true;
  showToast(c.message || 'INSUFFICIENT ZYCUBE CAPACITY'); return false;
}
const deployBlocked = () => homeMode || !rizer || rizer.hp <= 0 || koT > 0 || rizer.flying || rizer.swimW > 0.5 || !!ufoPilot || !!westLakeBus?.driving || !!astralboard?.active || !!inventory.zycube || !!scopeView;
function placementOccupants() {
  const o = [];
  try { for (const n of npcs?.npcs || []) { const q = n.position || n.pos; if (q) o.push({ x: q.x, z: q.z }); } for (const g of seers?.grunts || []) if (g.pos && g.state !== 'down') o.push({ x: g.pos.x, z: g.pos.z }); } catch (e) {}
  return o;
}
function onStorageChange() { // a weapon that left the Zycube also leaves the hand, the wheel and the hip
  syncWorkstationKit();
  if (!inventory.owned.includes(inventory.equipped)) equip('fists');
  syncWheel(); wheel.render(); dep?.sync();
}
function initStorage() {
  n3000 = createN3000({ audioProfile: () => ({ music: music.getState(), sfx: sfx.getState() }), onOpen: () => {
    saveGame(); keys.clear(); pressed.clear(); mousePunchHeld = dragging = false;
    if (document.pointerLockElement) document.exitPointerLock();
    n3000Camera = { position: camera.position.clone(), quaternion: camera.quaternion.clone(), target: homeInterior.n3000(), k: 0 };
    music.setHostPaused(true); sfx.setHostPaused(true); dep?.showPrompt(null);
  }, onClose: () => {
    if (n3000Camera) { camera.position.copy(n3000Camera.position); camera.quaternion.copy(n3000Camera.quaternion); } n3000Camera = null;
    keys.clear(); pressed.clear(); mousePunchHeld = dragging = false;
    const pad = [...(navigator.getGamepads?.() || [])].find(Boolean); padPrev = pad?.buttons.map(b => b.pressed) || [];
    music.setHostPaused(false); sfx.setHostPaused(false); canvas.focus?.();
  } });
  stationUI = createStationUI({ toast: showToast, onPack: uid => dep.packUp(uid), onOpen: () => { keys.clear(); if (document.pointerLockElement) document.exitPointerLock(); }, onClose: () => { canvas.focus?.(); if (pcUse && pcUse.phase === 'on') pcUse.phase = 'out'; seating?.pcClosed(); } });
  dep = createDeployables({ scene, world, getRizer: () => rizer, isBlocked: deployBlocked, occupants: placementOccupants, toast: showToast,
    ride: { spawn: e => { if (!astralboard) return false; astralboard.unlock({ x: e.at.x, z: e.at.z }); return true; }, despawn: () => astralboard?.pack() } });
  storage.addGuard((id, from) => id === 'telescope' && from === 'ZYCUBE' && (scopeSet || inventory.scope) ? 'Pack up the Stargazer Telescope first' : null);
  storage.onChange(onStorageChange);
  syncWorkstationKit();
  dep.sync(); // deployed Field Equipment comes back where it was left
}
const _pcPos = new THREE.Vector3(), _pcLook = new THREE.Vector3();
// Typing pose reached (seating.js): the camera eases to the monitor over his shoulder, then the screen opens. Closing it eases back.
function pcCamIn() {
  if (pcUse || !homeMode || !rizer) return;
  const n = homeInterior.nebuladock(); if (!n) return openStation('homepc');
  pcUse = { phase: 'in', k: 0, n }; dep?.showPrompt(null);
}
function tickPcUse(dt) {
  const u = pcUse;
  if (u.phase === 'in') { u.k = Math.min(1, u.k + dt / 0.8); if (u.k >= 1) { u.phase = 'on'; openStation('homepc'); } }
  else if (u.phase === 'out') { u.k = Math.max(0, u.k - dt / 0.6); if (u.k <= 0) { pcUse = null; keys.clear(); canvas.focus?.(); return; } }
  if (u.k > 0) { const e = u.k * u.k * (3 - 2 * u.k), s = u.n.screen; _pcPos.set(s.x + 0.5, s.y + 0.05, s.z + 1.55); camera.position.lerp(_pcPos, e); _pcLook.copy(cam.focus).lerp(s, e); camera.lookAt(_pcLook); }
}
function openStation(kind, ctx) {
  if (kind === 'n3000') { if (homeMode && indoor === homeInterior && !rizer.seq && !bondGame?.active && !seating?.active) n3000?.open(); return; }
  if (kind === 'homepc') kind = 'home'; // the interior calls the desk 'homepc', the screen is 'home'
  if (kind !== 'home' && kind !== 'experiment' && kind !== 'workstation' && kind !== 'astralite') return;
  dep?.showPrompt(null); stationUI.open(kind, ctx || {});
}
function packDeployedFromZyphone(uid) {
  const d = dep.live.get(uid); if (!d) return showToast('That is not deployed');
  if (d.ride && astralboard?.active) return showToast('Get off the Astralboard first');
  const p = rizer.position; if (Math.hypot(d.mesh.position.x - p.x, d.mesh.position.z - p.z) > 8) return showToast('Walk back to it to pack it up');
  dep.packUp(uid); zy.open('items');
}
// ── Astralboard: △ on and off (every vehicle), ○ stows it: packed into the Zycube and carried on his back ──
let boardStowAfter = false, backBoard = null;
function stowBoard() {
  const e = storage.equipmentIn('DEPLOYED', 'astralboard')[0];
  if (!e) return showToast('The Astralboard is already stowed');
  dep.packUp(e.uid);
  if (!storage.equipmentIn('DEPLOYED', 'astralboard').length) showToast('Astralboard stowed · on your back · deploy it from the Zyphone (Items)');
}
const _bb = { up: new THREE.Vector3(), back: new THREE.Vector3(), x: new THREE.Vector3(), m: new THREE.Matrix4(), a: new THREE.Vector3(), b: new THREE.Vector3() };
function updateBackBoard() { // the board slung on his back while it's carried (in the Zycube), deck out, nose up
  if (boardStowAfter && !astralboard?.active) { boardStowAfter = false; stowBoard(); }
  const carried = !homeMode && !!rizer?.actor && storage.equipmentIn('ZYCUBE', 'astralboard').length > 0 && !astralboard?.active;
  if (!carried) { if (backBoard) backBoard.visible = false; return; }
  if (!backBoard) { backBoard = buildAstralboard(); backBoard.matrixAutoUpdate = false; scene.add(backBoard); }
  const M = rizer.actor.model, s1 = M.getObjectByName('mixamorigSpine1'), nk = M.getObjectByName('mixamorigNeck'), s2 = M.getObjectByName('mixamorigSpine2');
  if (!s1 || !nk || !s2) { backBoard.visible = false; return; }
  s1.getWorldPosition(_bb.a); nk.getWorldPosition(_bb.b); _bb.up.subVectors(_bb.b, _bb.a).normalize();
  const f = rizer.facing; _bb.back.set(-Math.sin(f), 0, -Math.cos(f)); _bb.back.addScaledVector(_bb.up, -_bb.back.dot(_bb.up)).normalize();
  _bb.x.crossVectors(_bb.back, _bb.up);
  s2.getWorldPosition(_bb.a); _bb.a.addScaledVector(_bb.back, 0.2).addScaledVector(_bb.up, -0.12);
  _bb.m.makeBasis(_bb.x, _bb.back, _bb.up).scale(new THREE.Vector3(0.62, 0.62, 0.62)).setPosition(_bb.a);
  backBoard.matrix.copy(_bb.m); backBoard.visible = true;
}
// ── Field Workstation in the Armory: the 'workstation' kit is owned while a crafted workstation is (carried or set
// up); equipped, □ builds the carried one where he looks, the same placement as the Zyphone's Deploy ──
function syncWorkstationKit() {
  const have = storage.equipmentIn('ZYCUBE', 'field_workstation').length + storage.equipmentIn('DEPLOYED', 'field_workstation').length + storage.equipmentIn('HOME_PC', 'field_workstation').length > 0;
  const owns = inventory.owned.includes('workstation');
  if (have && !owns) { inventory.owned.push('workstation'); saveInv(); syncWheel(); wheel.render(); showToast(inventory.wheel.includes('workstation') ? 'Field Workstation · in the Armory · draw it, □ to build' : 'Field Workstation · in the Armory · put it on the wheel (Zyphone → Armory)'); }
  else if (!have && owns) { inventory.owned = inventory.owned.filter(k => k !== 'workstation'); if (inventory.equipped === 'workstation') equip('fists'); saveInv(); syncWheel(); wheel.render(); }
}
function buildWorkstation() {
  if (homeMode) return showToast('Build it outdoors');
  const e = storage.equipmentIn('ZYCUBE', 'field_workstation')[0];
  if (!e) return showToast(storage.equipmentIn('DEPLOYED', 'field_workstation').length ? 'Your Field Workstation is already built · ○ / E at it to pack it up' : 'The Field Workstation is in Home Storage · carry it in the Zycube to build it');
  if (dep.placing) return;
  const r = dep.start(e.uid); if (!r.ok) return showToast(r.message || 'Cannot build here');
  showToast('Look where you want it · ○ / E build · △ / Esc cancel', 4200);
}
function deployFromZyphone(uid) {
  const r = dep.start(uid); if (!r.ok) return showToast(r.message || 'Cannot deploy');
  zy.close(); showToast('Look where you want it · ○ / E place · △ / Esc cancel', 4200);
}

// ── solid bodies: enemies always have collision on ──────────────────────────────────────────────────────────
// Runs after every enemy has moved this frame. The Penumbra is an oriented box of its real size (and stays solid as a wreck);
// Rizer cannot be inside it however he got there (strike lunge, dodge, a hit), and no other enemy walks through it either.
const rizerPrev = new THREE.Vector3(), RIZER_R = 0.42;
function solidPass() {
  const boxes = penumbras?.boxes?.() || []; if (!boxes.length || !rizer) return;
  const rp = rizer.position, havePrev = rizerPrev.lengthSq() > 0;
  for (const B of boxes) {
    if (Math.hypot(rp.x - B.x, rp.z - B.z) > 9 && (!havePrev || Math.hypot(rizerPrev.x - B.x, rizerPrev.z - B.z) > 9)) continue;
    if (havePrev) sweepOut(rizerPrev, rp, RIZER_R, B); else pushOut(rp, RIZER_R, B);
  }
  const others = [...(seers?.grunts || []), ...(novas?.bodies || [])];
  for (const b of others) {
    if (!b.pos || b.state === 'down' || b.state === 'gone' || b.alive === false) continue;
    const r = b.T?.radius ?? b.r ?? 0.5;
    for (const B of boxes) if (Math.hypot(b.pos.x - B.x, b.pos.z - B.z) < 4) pushOut(b.pos, r, B, 1.8);
  }
  for (const B of boxes) { // downed Seers and wrecks lie where they fell: the box does not move them, it only keeps living things off
    for (const o of scanobots?.bodies || []) if (o.pos && o.alive !== false && o.state !== 'down') pushOut(o.pos, o.r ?? 0.4, B, 0.9);
  }
}
const RUNNING_FRUIT_YIELD = 1.5;
function collectLoot(L, { running = false } = {}) {
  if (L.kind === 'zycube') return takeZycube();
  if (L.kind === 'weapon') return takeWeaponDrop(L.it);
  if (L.kind === 'resource') return takeResource(L.it);
  if (L.kind === 'fruit') {
    if (L.f.gone) return;
    const yieldMultiplier = running ? RUNNING_FRUIT_YIELD : 1;
    if (inventory.zycube && !eatItem(L.f.item, { ...rizer, maxHp: rizer.maxHp, maxStamina: rizer.maxStamina, maxAstralEnergy: rizer.maxAstralEnergy, hp: rizer.hp, stamina: rizer.stamina, astralEnergy: rizer.astralEnergy }, { yieldMultiplier })) return showToast(`No Zycube · nowhere to carry the ${ITEMS[L.f.item].name} · find your Zycube (AV)`); // (a dry run: would it be eaten?)
    if (!eatItem(L.f.item, { ...rizer, maxHp: rizer.maxHp, maxStamina: rizer.maxStamina, maxAstralEnergy: rizer.maxAstralEnergy, hp: rizer.hp, stamina: rizer.stamina, astralEnergy: rizer.astralEnergy }, { yieldMultiplier }) && !canCarry(L.f.item)) return; // it would be stored, and the Zycube is full
    world.nature.userData.fruits.pick(L.f);
    ((inventory.picked ||= {}).flowers ||= []).push(L.f.i); saveInv();
    fx.emit(L.x, L.y, L.z, 6, { color: L.f.color, speed: 1.2, up: 1, size: 0.18, life: 0.4 });
    sfx.play('land', 0.25, 1.7);
    const got = eatItem(L.f.item, rizer, { yieldMultiplier }), name = ITEMS[L.f.item].name;
    if (got) { showToast(`${name} · ${boostText(got)}${running ? ' · running boost ×1.5' : ''}`); fruitGlow(L.f.color); }
    else { addItem(L.f.item); showToast(`${name} stored · ${fullText(L.f.item)} · eat it later from Zyphone → Items`); }
  } else if (FIELD_KINDS.includes(L.kind)) {
    if (L.f.gone) return;
    if (!canCarry(L.kind)) return;
    world.nature.userData[L.kind].pick(L.f);
    const E8 = ENTITIES[L.kind];
    fx.emit(L.x, L.y, L.z, L.kind === 'zyphere' ? 10 : 8, { color: E8.color, speed: 1.3, up: 1.3, size: L.kind === 'faery' ? 0.24 : 0.16, life: 0.5 });
    sfx.play('land', 0.28, L.kind === 'faery' ? 2.1 : 1.9);
    if (L.kind === 'zyphere') {
      addItem('zyphere'); showToast(`${E8.name} stored · used to bond a Zyrex · from Zyphone → Items`);
    } else {
      // A caught fae fills one meter to the top: pink Faery → health · golden Fae → stamina ·
      // blue Astral Fae → astral energy.
      const fill = { faery: ['hp', 'maxHp', 'health'], fae: ['stamina', 'maxStamina', 'stamina'], fae_astral: ['astralEnergy', 'maxAstralEnergy', 'astral energy'] }[L.kind];
      rizer[fill[0]] = rizer[fill[1]];
      addItem(L.kind);
      showToast(`${E8.name} · ${fill[2]} full`);
    }
  } else if (L.kind === 'portalchip') { // into the bag (Zyphone → Items · key items), stackable
    if (inventory.zycube) return showToast('No Zycube · nowhere to carry loot · find your Zycube (AV)');
    if (!canCarry('portalchip', L.it.value || 1)) return;
    if (!scanobots?.collectChip(L.it)) return; // already taken: never counted twice
    const got = L.it.value || 1, n = addItem('portalchip', got); // a Penumbra's large purple chip is worth 3
    fx.emit(L.x, L.y + 0.35, L.z, got > 1 ? 22 : 12, { color: got > 1 ? '#c58cff' : '#6fb8ff', speed: 1.6, up: 1.3, size: 0.18, life: 0.45 });
    sfx.play('land', 0.3, 1.8);
    showToast(`PORTALCHIP ACQUIRED · ${ITEMS.portalchip.name} ×${got} · ${n} / ${GATELOCK.need}`);
  } else {
    if (inventory.zycube) return showToast('No Zycube · nowhere to carry loot · find your Zycube (AV)');
    const reward = seers?.collectLoot(L.it); if (!reward) return;
    inventory[reward.currency] = (inventory[reward.currency] || 0) + reward.amount; saveInv(); hud.setWallet(inventory);
    sfx.play('land', 0.3, 1.5); showToast(`+${reward.amount} ${reward.currency} · ${reward.enemy} loot`);
  }
}
const boostText = got => Object.entries(got).map(([k, v]) => `+${v} ${k === 'hp' ? 'health' : k === 'astral' ? 'astral energy' : 'stamina'}`).join(' · ');
const fullText = key => { const b = Object.keys(ITEMS[key].boost); return b.length > 1 ? 'every meter is full' : `${b[0] === 'hp' ? 'health' : b[0] === 'astral' ? 'astral energy' : 'stamina'} is full`; };
function fruitGlow(color) { const p = rizer.position; fx.emit(p.x, p.y + 1.1, p.z, 12, { color, speed: 1.4, up: 1.6, size: 0.22, life: 0.6, g: -1 }); }
// Zyphone → Items: eat something from the bag (only if it would boost something).
function useItem(key) {
  if (!(inventory.items?.[key] > 0) || !ITEMS[key]?.boost) return;
  const got = eatItem(key, rizer), name = ITEMS[key].name;
  if (!got) return showToast(`${name} · ${fullText(key)} · keep it for later`);
  inventory.items[key]--; saveInv(); fruitGlow(ITEMS[key].color); showToast(`${name} · ${boostText(got)}`);
}
// Catching a fae / faery / astral fae: ○ near one leaps for it and a coin flip decides it on the spot.
// The fae holds still (at his hand height) for the attempt. A hit plays catch_fae_success — his hands
// close on it at the top of the leap and it's collected on that frame. A miss plays catch_fae_miss — he
// lunges, his hands whiff just under it (whoosh), he dives to the ground and gets back up, and the fae
// flutters on. rizer.faeCatch() places him along each clip so his hands reach the fae (rizer.js).
function attemptFaeCatch(L) {
  if (rizer.hp <= 0 || rizer.attack || L.f.gone) return;
  const hit = Math.random() < FAE_CATCH_RATE;
  L.f.catchUntil = performance.now() + 6000; L.f.catchY = rizer.position.y + FAE_HAND_HEIGHT; // hold it where his hands will be (refined below)
  const started = rizer.faeCatch(L, hit, caught => {
    if (caught) return collectLoot(L);
    L.f.catchUntil = performance.now() + 450; // a beat, then it flutters on
    fx.emit(L.x, L.y, L.z, 4, { color: '#ffffff', speed: 1, up: 0.3, size: 0.13, life: 0.3 });
    sfx.play('whoosh', 0.45, 1.15);
    showToast(`The ${ENTITIES[L.kind].name} slips your hand · it was never yours to grab`);
  });
  if (!started) { L.f.catchUntil = 0; L.f.catchY = null; return; }
  const foot = rizer.fc?.foot; // his hands top out FAE_HAND_HEIGHT above wherever his feet are on the reach frame
  if (foot) L.f.catchY = world.groundAt(foot.x, foot.z, rizer.position.y + 1) + FAE_HAND_HEIGHT;
}
function pickupLoot(L) {
  if (FAE_KINDS.includes(L.kind)) return attemptFaeCatch(L);
  if (rizer.attack || rizer.pick || rizer.rpick || !rizer.onGround) return;
  if (rizer.speed > 4.5 && rizer.actor?.has('runpickup') && rizer.runPick(L, () => collectLoot(L, { running: true }))) return; // on the run: immediate boosted yield when the hand reaches fruit
  rizer.pickUp({ x: L.x, y: rizer.position.y + 0.2, z: L.z }, () => collectLoot(L), L.kind === 'bag' ? 'store' : 'pickup');
}
// Rizer's front door. Entering: he walks up, takes the handle, pushes the door open and walks in; under a
// quick dip to black the scene becomes the living room and he pulls the same door shut behind him. Leaving
// is the same walk mirrored. The door leaf rides his hands (doorwalk.js); his body follows the clip's path.
let doorFade = null;
function fadeEl() { if (!doorFade) { doorFade = document.createElement('div'); doorFade.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:40'; document.body.appendChild(doorFade); } return doorFade; }
function doorFrame(hinge, sign) { // sign +1: walking in · -1: walking out
  hinge.parent.updateMatrixWorld(true);
  const h = hinge.getWorldPosition(new THREE.Vector3()), q = hinge.parent.getWorldQuaternion(new THREE.Quaternion());
  const f = new THREE.Euler().setFromQuaternion(q, 'YXZ').y, ex = Math.cos(f), ez = -Math.sin(f), ux = -Math.sin(f) * sign, uz = -Math.cos(f) * sign;
  return { hx: h.x, hz: h.z, ux, uz, ex, ez, reach: hinge.userData.reach ?? 1.45,
    set(a) { const dx = ex * Math.cos(a) + ux * Math.sin(a), dz = ez * Math.cos(a) + uz * Math.sin(a); hinge.rotation.y = Math.atan2(-dz, dx) - f; } };
}
// Camera for anyone who has just stepped out of Rizer's front door. "Behind him" is straight back into the house wall,
// so the camera swings round to the side just enough that its line back from Rizer clears the wall at full distance:
// low, behind and beside him, never inside the house and never overhead.
function snapOutsideDoor(dist = 3.4) {
  cam.snapBehind(rizer, dist);
  const outside = world.structures.getObjectByName(indoor?.exteriorDoor || 'homeDoor'); if (!outside) return;
  const fr = doorFrame(outside, -1), d0 = (rizer.position.x - fr.hx) * fr.ux + (rizer.position.z - fr.hz) * fr.uz; // how far he stands outside the wall
  if (d0 > dist + 0.6) return;
  const a = Math.acos(THREE.MathUtils.clamp((d0 - 0.55) / dist, 0, 1)); // enough angle that the ray back to the camera runs along the wall, not through it
  cam.yaw = Math.atan2(-fr.ux, -fr.uz) + a; cam.targetDist = cam.dist = cam.cur = dist; cam.pitch = 0.08;
}
const walkHomeDoor = mode => walkDoor(mode, mode === 'enter' ? homeInterior : indoor);
// The door walk, for any building: up to the knob, the door swings, through the doorway into its interior (or out).
function walkDoor(mode, I = indoor) {
  const outside = world.structures.getObjectByName(I?.exteriorDoor || 'homeDoor'), inside = I?.frontDoor;
  if (!outside || !inside || rizer.seq || !rizer.actor) return;
  const sign = mode === 'enter' ? 1 : -1, ext = doorFrame(outside, sign), int = doorFrame(inside, sign);
  const [first, second] = mode === 'enter' ? [ext, int] : [int, ext], slot = mode === 'enter' ? 'enter' : 'exitDoor';
  if (!rizer.actor.has(slot)) { if (mode === 'enter') showInterior(I); else leaveHomeInterior(); return; } // clip not loaded: plain switch
  let switched = false;
  fadeEl();
  const go = () => rizer.startDoorWalk(first, slot, {
    step: t => {
      const reach = first.reach / rizer.hipHeight(), a = doorAngle(t, reach);
      (switched ? second : first).set(a);
      const sw = DOORWALK.switchAt; doorFade.style.opacity = t < sw - 0.25 ? 0 : t < sw ? (t - sw + 0.25) / 0.25 : Math.max(0, 1 - (t - sw) / 0.3);
      if (!switched && t >= DOORWALK.switchAt) { // through the doorway: change scene, same door on the other side
        switched = true; first.set(0); second.set(a);
        if (mode === 'enter') showInterior(I); else leaveHomeInterior();
        rizer.retargetDoor(second); rizer.doorStep(0, homeMode ? indoor.roomWorld : world);
        cam.snapBehind(rizer);
      }
      // Follow the animated body through the doorway instead of leaving the
      // camera at its pre-door focus. A short shoulder distance clears the
      // front header and decorations while Rizer crosses the threshold.
      if (mode === 'exit' && switched) snapOutsideDoor(3.2); else cam.snapBehind(rizer, mode === 'exit' ? 3.2 : 3.7);
      if (t > DOORWALK.close[1] - 0.02 && !second.latched) { second.latched = true; sfx.play('land', 0.35, 1.35); } // the latch clicks shut
    },
    done: () => { first.set(0); second.set(0); doorFade.style.opacity = 0; if (mode === 'exit') { snapOutsideDoor(3.4); cam.targetDist = 3.6; } else { cam.snapBehind(rizer, 3.4); cam.targetDist = 4.6; } }
  });
  const m = rizer.doorMark(first);
  if (Math.hypot(rizer.position.x - m.x, rizer.position.z - m.z) > 0.12) rizer.walkTo({ x: m.x, z: m.z }, m.face, go, { pass: { x: m.x, z: m.z, r: 1.3 } }); else { rizer.facing = m.face; go(); } // walk up to the knob, then open
}
function leaveHomeInterior() {
  if (!homeMode) return;
  homeMode = false; indoor.show(false); world.setExteriorVisible(true); setOutdoorActorsVisible(true); $('#game').classList.remove('home-interior');
  const at = homeReturn || { x: W.playerStart.x, z: W.playerStart.z, facing: W.playerStart.facing };
  rizer.position.set(at.x, world.groundAt(at.x, at.z, Number.isFinite(at.y) ? at.y + 0.5 : undefined), at.z); rizer.facing = at.facing; rizer.vel.set(0, 0, 0); rizer.vy = 0; rizer.speed = 0; rizer.onGround = true; rizer.flying = false; // the ground he went in from, never a roof above the doorway
  snapOutsideDoor(3.4); homeReturn = null;
  showToast('Outside · the door will still be here');
}
// Soundtrack: the draft pack loops in the background. It starts on the Wake Up click (a user
// gesture, so Chrome lets it play); Zyphone → Options has Music on/off and volume, and M toggles it.
let musicState = null;
const MUSIC_VOLS = [0.05, 0.1, 0.16, 0.25, 0.4, 0.6, 0.8, 1];
const music = createSoundtrack({ onChange: s => {
  const was = musicState?.status; musicState = s;
  if (was && was !== s.status && zy?.isOpen && zy.tab === 'options') zy.open('options');
} });
const musicNote = () => {
  const s = musicState || music.getState();
  return s.error ? s.error : s.status === 'waiting' ? 'Press any button or click to start it (the browser is holding it back).' : s.status === 'playing' ? 'Playing · the draft music pack, looping.' : s.status === 'muted' ? 'Muted.' : 'Starts when you wake up.';
};
const sfx = createSfx();
function rumbleHit(kind = 'light') {
  try {
    const pad = [...(navigator.getGamepads?.() || [])].find(p => p?.vibrationActuator?.playEffect);
    if (!pad) return;
    const spec = kind === 'thunder' ? { duration: 260, strongMagnitude: 0.9, weakMagnitude: 0.65 }
      : kind === 'heavy' ? { duration: 200, strongMagnitude: 0.72, weakMagnitude: 0.48 }
      : kind === 'medium' ? { duration: 145, strongMagnitude: 0.5, weakMagnitude: 0.3 }
      : { duration: 95, strongMagnitude: 0.32, weakMagnitude: 0.18 };
    pad.vibrationActuator.playEffect('dual-rumble', spec)?.catch?.(() => {});
  } catch (_) { /* gamepad haptics vary by browser and controller */ }
}
for (const ev of ['pointerdown', 'keydown', 'touchstart']) addEventListener(ev, () => { if (started) sfx.unlock(); }, { capture: true }); // browsers only allow audio after a real gesture (a pad press isn't one)
let missChecks = [], lastLanded = -9, timers = []; // timers: game-time callbacks (later)
const later = (sec, fn) => timers.push({ at: elapsed + sec, fn }); // swing-and-miss: a punch or kick with no contact around its blow
function toggleMusic() { const m = !music.getState().muted; music.setMuted(m); showToast(m ? 'Music off' : 'Music on'); }
// ── Title screen · NEW GAME / LOAD GAME (mouse, keyboard and DualSense) ─────────
// The save is Rizer's place in the world; inventory, settings and music are saved on their own keys.
const SAVE_KEY = 'rp7d.save.v1';
const readSave = () => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; } };
let newArmed = false, titleIndex = 0;
function saveGame() {
  if (!started || !rizer || koT > 0 || ufoPilot || astralboard?.active) return;
  const hero = npcs?.npcs.find(n => n.role === 'hero');
  if (hero) { inventory.zorynMet = hero.met; inventory.zorynRecruited = hero.recruited || hero.wasRecruited; inventory.zorynDowned = hero.downed; inventory.zorynHealth = hero.health; saveInv(); }
  const p = rizer.position, at = homeMode ? homeReturn : caveMode && caveReturn ? { x: caveReturn.x, y: world.groundAt(caveReturn.x, caveReturn.z), z: caveReturn.z, facing: caveReturn.face } : { x: p.x, y: p.y, z: p.z, facing: rizer.facing };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, t: Date.now(), home: homeMode && indoor === homeInterior, at, hour, region: hud?.regionOf(p.x, p.z) })); } catch (e) {}
}
function titleButtons() { return [...document.querySelectorAll('#title-menu .title-btn')].filter(b => !b.disabled); }
function titleFocus(i) { const list = titleButtons(); if (!list.length) return; titleIndex = (i + list.length) % list.length; list.forEach((b, k) => b.classList.toggle('focus', k === titleIndex)); }
function refreshTitle() {
  const sv = readSave(), load = $('#load-game');
  load.disabled = !sv;
  if (sv) { const d = new Date(sv.t); $('#load-sub').textContent = `${sv.home ? 'Rizer’s Home' : sv.region || 'Malezor'} · ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`; }
  titleFocus(sv ? 1 : 0); // a returning player lands on LOAD GAME
}
function beginPlay() { $('#intro').classList.add('hidden'); $('#game').classList.add('playing'); tryLock(); started = true; canvas.focus?.(); music.unlock(); sfx.unlock(); }
function startNewGame() {
  if (readSave() && !newArmed) { newArmed = true; $('#title-confirm').hidden = false; $('#new-sub').textContent = 'Press again to start over'; return; }
  // A new game resets progress (inventory, chest, save) and reloads into a fresh Malezor, straight past the title.
  try { localStorage.removeItem('rp7d.inventory.v1'); localStorage.removeItem('rp7d.homeLayout.v1'); localStorage.removeItem(SAVE_KEY); sessionStorage.setItem('rp7d.boot', 'new'); } catch (e) {}
  location.reload();
}
function loadGame() {
  const sv = readSave(); if (!sv || !world) return;
  if (typeof sv.hour === 'number') { hour = sv.hour; hourTarget = null; }
  if (!sv.home && sv.at) { homeReturn = { ...sv.at }; leaveHomeInterior(); }
  beginPlay(); showToast(sv.home ? 'Home · it kept your place' : `${sv.region || 'Malezor'} · it kept your place`);
}
$('#enter').addEventListener('click', () => { if (world) startNewGame(); });
$('#load-game').addEventListener('click', () => loadGame());
document.querySelectorAll('#title-menu .title-btn').forEach((b, i) => b.addEventListener('pointerenter', () => titleFocus(titleButtons().indexOf(b))));
addEventListener('keydown', e => {
  if (started || $('#intro').classList.contains('hidden')) return;
  if (['ArrowUp', 'KeyW'].includes(e.code)) { titleFocus(titleIndex - 1); e.preventDefault(); }
  if (['ArrowDown', 'KeyS'].includes(e.code)) { titleFocus(titleIndex + 1); e.preventDefault(); }
  if (['Enter', 'Space'].includes(e.code)) { titleButtons()[titleIndex]?.click(); e.preventDefault(); }
});
(function titlePad() { // DualSense on the title: D-pad / left stick to move, ✕ to select
  let prev = {}, stickHeld = 0;
  const tick = () => {
    if (started) return;
    const gp = [...(navigator.getGamepads?.() || [])].find(g => g && g.connected);
    if (gp && $('#game').classList.contains('intro-on')) prev = Object.fromEntries(gp.buttons.map((x, i) => [i, x.pressed])); // the intro movie owns the pad
    else if (gp) {
      setPad(true);
      const b = i => !!gp.buttons[i]?.pressed, edge = i => b(i) && !prev[i];
      const y = gp.axes[1] || 0, stick = Math.abs(y) > 0.6 ? Math.sign(y) : 0;
      if (edge(12) || (stick < 0 && stickHeld >= 0)) titleFocus(titleIndex - 1);
      if (edge(13) || (stick > 0 && stickHeld <= 0)) titleFocus(titleIndex + 1);
      stickHeld = stick;
      if (edge(0) && world) titleButtons()[titleIndex]?.click();
      prev = Object.fromEntries(gp.buttons.map((x, i) => [i, x.pressed]));
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
addEventListener('beforeunload', saveGame);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
setInterval(saveGame, 5000);
$('#map-toggle').addEventListener('click', e => { e.stopPropagation(); zy?.open('map'); });
// The HUD is the Zyphone's live surface: click any panel to open its page.
for (const el of document.querySelectorAll('.hud-panel[data-zy]')) el.addEventListener('click', e => {
  if ($('#game').classList.contains('layout-editing') || e.target.closest('[data-layout-ignore]')) return;
  zy?.open(el.dataset.zy);
});
function setPad(on) { if (usingPad !== on) { usingPad = on; $('#game').classList.toggle('pad', on); } }
// Standard mapping: 0 ✕ · 1 ○ · 2 □ · 3 △ · 4 L1 · 5 R1 · 7 R2 · 10 L3 · 12–15 d-pad · 17 touchpad.
let padPrev = [];
function readPad() {
  const p = navigator.getGamepads?.().find(Boolean); if (!p) return null;
  const btn = i => !!p.buttons[i]?.pressed, prev = padPrev.slice(), edge = i => btn(i) && !prev[i];
  const dz = v => Math.abs(v) > 0.14 ? v : 0;
  const out = { x: dz(p.axes[0] || 0), z: dz(p.axes[1] || 0), lx: dz(p.axes[2] || 0), ly: dz(p.axes[3] || 0), btn, edge,
    jump: btn(0), jumpEdge: edge(0), run: btn(7), descendHeld: btn(6), crouch: false, punch: edge(2), punchHeld: btn(2), kick: edge(3), interact: edge(1), zyphone: edge(17), dodge: edge(6), dodgeHeld: btn(6), burst: edge(14), down: edge(13), astralift: edge(12), rolling: edge(15), prevWeapon: edge(4), nextWeapon: edge(5), lock: false, vision: false };
  // L3 / R3 alone = crouch / lock-on; both together = Astralvision. Single presses wait 120 ms for a partner.
  const e10 = edge(10), e11 = edge(11);
  // R3: a tap locks on (on release) · held for a moment, it toggles FocusLock instead.
  if ((e10 || e11) && btn(10) && btn(11)) { out.vision = true; stickPend = null; r3Hold = null; }
  else if (e10) stickPend = { k: 'crouch', t: performance.now() };
  else if (e11) r3Hold = { t: performance.now(), fired: false };
  if (r3Hold) {
    if (btn(11)) { if (!r3Hold.fired && performance.now() - r3Hold.t > 550) { r3Hold.fired = true; out.focus = true; } }
    else { if (!r3Hold.fired) out.lock = true; r3Hold = null; }
  }
  if (stickPend && performance.now() - stickPend.t > 120) { out[stickPend.k] = true; stickPend = null; } // L2 = dodge roll · L3 = crouch (grounded) / auto-land (flying)
  if (p.buttons.some(b => b.pressed)) setPad(true);
  padPrev = p.buttons.map(b => b.pressed);
  return out;
}

// ── build ────────────────────────────────────────────────────────────
let flickReady = true, stickPend = null, r3Hold = null, av;
let loot, held, chestLight, picking = null, bowProjectiles = null; // picking: the weapon chest Rizer is reaching into
let partner = null; // the bonded, active Zyrex walking with Rizer (zyrex2d.js · createPartner)
let world, sky, rizer, cam, zyrex, fx, hud, zy, lab, skinLab, buildLab, bondGame, anciuxor = null, astral, seers = null, started = false, usingPad = false;
let seating = null; // INTERACTIVE_SEAT controller (the Nebuladock chair)
let pcUse = null; // Nebuladock 3000 session: {phase 'walk'|'in'|'on'|'out', k 0..1 camera blend, n:{screen}}
let labs = null, labsView = null, xray = null, astralResetArmed = 0; // LABS › Rizer (labs.js): clones, templates, reset · labsView: the camera held on him while the page is up
let n3000 = null, n3000Camera = null, tv = null, tvCamera = null; // tv: the living-room TV & DVD system (tv-system.js)
let dep = null, stationUI = null; // storage foundation: deployed Field Equipment · Home PC / Experiment Table screens
let storeInterior = null, indoor = null; // every enterable building is an interior level; `indoor` is the one Rizer is in (homeMode = indoors)
let furnMover = null, homeInterior = null, homeMode = false, homeReturn = null, npcs = null, commonChests = null, zycube = null;
let astralboard = null;
// ── Lightbulbs (focus-moves.js): ✕ collects one and its Focus Move is learned for good ──
let lightbulbs = null, learnedCardT = null, storm = null;
function lightbulbLearned(bulbId, moveId) {
  const M = FOCUS_MOVES[moveId] || null;
  sfx.play('lift', 0.9, 1.2); sfx.play('thunder', 0.35, 1.4); cam.kick(0.5); rumbleHit('medium');
  let el = $('#focus-learned');
  if (!el) { el = document.createElement('section'); el.id = 'focus-learned'; el.className = 'focus-learned'; $('#game').appendChild(el); }
  el.innerHTML = `<header>LIGHTBULB ACQUIRED</header><div class="fl-body"><i class="fl-bulb" style="--c:${M?.color || '#ffc24a'}"><b></b></i><div>`
    + (M ? `<small>NEW FOCUS MOVE LEARNED</small><b style="color:${M.color}">${M.name.toUpperCase()}</b><p>You can now equip this Focus Move in the Zyphone · Labs › Focus.</p>`
         : `<small>ALREADY KNOWN</small><p>This Lightbulb holds a technique Rizer already knows.</p>`) + `</div></div>`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(learnedCardT); learnedCardT = setTimeout(() => el.classList.remove('show'), 5200);
}

// ── Caves (caves-data.js · cave-placement.js · cave-terrain.js · cave-interior.js) ──
// The third layer of the world: building interiors · the overworld · cave interiors. ✕ (Space) at a cave mouth
// takes Rizer inside; ○ (E) at the daylight on Floor 1 brings him back out at the same mouth, facing out. Inside, the
// floors are one continuous space joined by spiral staircases. Progress per cave lives in inventory.caves (saved).
let caveTp = -1, caveSys = null, caveMode = false, caveId = null, caveReturn = null, caveLight = null;
const caveGrunts = new Map(); // cave id → its Floor 3 Seer patrol (spawned the first time Rizer goes in)
function caveState(id) {
  const all = inventory.caves ||= {}, s = all[id] ||= {};
  s.discovered ??= false; s.clearedObstacles ||= []; s.collectedUniqueItems ||= []; s.unlockedFloors ||= [1]; s.completedEvents ||= [];
  Object.defineProperty(s, 'save', { value: () => saveInv(), enumerable: false, configurable: true });
  return s;
}
const caveFormation = id => world.caves.formations.find(f => f.cave.id === id);
function spawnCavePatrol(P) {
  if (caveGrunts.has(P.cave.id) || P.floors.length < 3 || !seers?.spawnRoute) return;
  const f3 = P.floors[2], stops = f3.rooms.filter(r => r.tag !== 'arrive' && r.tag !== 'stair'), list = [];
  const pts = (stops.length >= 2 ? stops : f3.rooms).slice(0, 4).map(r => ({ x: r.x, z: r.z }));
  for (let i = 0; i < (P.cave.classification === 'gemlord' ? 3 : 2); i++) {
    const g = seers.spawnRoute('seer', i % 2 ? [...pts].reverse() : pts, { id: `${P.cave.id}-f3-seer-${i}`, y: f3.y + 0.3 });
    if (g) { g.cave = P.cave.id; list.push(g); }
  }
  caveGrunts.set(P.cave.id, list);
}
function showCaveGrunts() { for (const [id, L] of caveGrunts) for (const g of L) g.root.visible = caveMode && id === caveId; }
function enterCave(id) {
  if (caveMode || homeMode || !caveSys || ufoPilot || westLakeBus?.driving || astralboard?.active || rizer.seq) return;
  const f = caveFormation(id); if (!f) return;
  const P = caveSys.enter(id), s = caveState(id), fade = fadeEl();
  if (!s.discovered) { s.discovered = true; s.worldEntrance = { x: +f.stand.x.toFixed(2), z: +f.stand.z.toFixed(2), face: +f.face.toFixed(4) }; s.save(); }
  caveReturn = { x: f.stand.x, z: f.stand.z, face: f.face };
  caveMode = true; caveId = id; astral.clearLock();
  world.setExteriorVisible(false); setOutdoorActorsVisible(false); $('#game').classList.add('in-cave');
  spawnCavePatrol(P); showCaveGrunts();
  rizer.position.set(P.entry.x, P.floors[0].y, P.entry.z); rizer.facing = P.entry.face; rizer.vel.set(0, 0, 0); rizer.vy = 0; rizer.onGround = true; rizer.flying = false;
  cam.snapBehind(rizer, 5); fade.style.transition = 'opacity .5s'; fade.style.opacity = 1; requestAnimationFrame(() => { fade.style.opacity = 0; });
  sfx.play('land', 0.5, 0.7);
  showToast(`${P.cave.name} · ${P.cave.floorCount} floors ${P.cave.verticalDirection === 'up' ? 'rising' : 'sinking'} from here · ○ at the daylight to leave`, 4200);
}
function exitCave(quiet = false) {
  if (!caveMode) return;
  caveSys.exit(); caveMode = false; const id = caveId; caveId = null;
  world.setExteriorVisible(true); setOutdoorActorsVisible(true); showCaveGrunts(); $('#game').classList.remove('in-cave');
  if (caveLight) caveLight.intensity = 0; scene.background = null; sky.dome.visible = true;
  const at = caveReturn || caveFormation(id)?.stand; caveReturn = null;
  if (at && !quiet) { rizer.position.set(at.x, world.groundAt(at.x, at.z), at.z); rizer.facing = at.face; rizer.vel.set(0, 0, 0); rizer.vy = 0; cam.snapBehind(rizer, 5); showToast(`Back outside · ${CAVE_BY_ID[id]?.name || 'the cave'} stays open`); }
}
// One cave thing under Rizer's hand (cave-interior.js · spots): talk, mine, search, smash, leave.
function useCaveSpot(sp) {
  const P = caveSys.active, s = caveState(P.cave.id);
  if (sp.kind === 'exit') return exitCave();
  if (sp.kind === 'npc') { hud.say(sp.who, sp.lines[sp.i++ % sp.lines.length]); return; }
  if (sp.kind === 'vein' || sp.kind === 'raid') {
    if (s.collectedUniqueItems.includes(sp.item)) return showToast(sp.kind === 'vein' ? 'The vein is worked out' : 'The cache is empty');
    const fam = ASTRALITE_FAMILIES[P.index % ASTRALITE_FAMILIES.length], ast = fam.items[(P.index * 7 + (sp.kind === 'raid' ? 3 : 0)) % fam.items.length];
    rizer.playInteract(false); s.collectedUniqueItems.push(sp.item); s.save();
    if (sp.kind === 'vein') { const t = addResource('everstone', 4); addItem(ast.key, 1); showToast(`+4 EVERSTONE (${t}) · +1 ${ast.symbol} ${ast.name}`); }
    else { inventory.coins = (inventory.coins || 0) + 90; saveInv(); hud.setWallet(inventory); addItem(ast.key, 1); showToast(`SEER RAID CACHE · +90 coins · +1 ${ast.symbol} ${ast.name}`); }
    sfx.play('lift', 0.7, 1.2); fx.emit(sp.x, rizer.position.y + 1, sp.z, 20, { color: '#9fdcff', speed: 2, up: 2, size: 0.25, life: 0.6 });
    if (sp.mesh && sp.kind === 'vein') sp.mesh.children.forEach((c, i) => { if (i < sp.mesh.children.length - 1) c.visible = false; });
    return;
  }
  if (sp.kind === 'sanctum') {
    if (!s.completedEvents.includes(sp.event)) { s.completedEvents.push(sp.event); s.save(); }
    hud.say(`${P.cave.gemlord}'s Sanctum`, `The gem hums with ${P.cave.gemlord}'s presence. The Gemlord is not here yet: this domain waits for its story.`);
    return;
  }
  if (sp.kind === 'blocker') {
    const b = sp.blocker; if (b.cleared) return;
    rizer.strike('kick'); b.hp--; cam.kick(0.6); sfx.play('heavy', 0.8, 0.8);
    fx.emit(b.x, b.y + 0.8, b.z, 16, { color: '#a49a8c', speed: 3, up: 2, size: 0.3, life: 0.6 });
    if (b.hp <= 0) { b.cleared = true; b.mesh.visible = false; s.clearedObstacles.push(b.id); s.save(); showToast('The way up is clear · it stays clear'); }
    else showToast(`The boulders crack · ${b.hp} more`);
  }
}
let caveSpotShown = null;
function caveFrame(dt) {
  if (!caveMode) return;
  caveSys.update(dt, rizer);
  // the cave's own light: the sky gone, a dim cool ambience, and a warm glow that walks with Rizer
  sky.sun.intensity = 0; sky.hemi.intensity = 0.55; sky.hemi.color.set('#8fa6c8'); sky.hemi.groundColor.set('#2a2230');
  scene.fog.color.set('#07060b'); scene.fog.density = 0.03; sky.dome.visible = false; scene.background ||= new THREE.Color('#050409');
  if (caveLight) { caveLight.intensity = 26; caveLight.position.set(rizer.position.x, rizer.position.y + 2.6, rizer.position.z); }
  for (const g of caveGrunts.get(caveId) || []) if (Math.abs(g.pos.y - rizer.position.y) > 4) { g.root.visible = false; g.lootBag.visible = false; } // only the floor he is on
  const P = caveSys.active; if (P) $('#loc-name').textContent = `${P.cave.name.toUpperCase()} · FLOOR ${P.phys.floorIndexAt(rizer.position.y) + 1}`;
  const sp = caveSys.spotNear(rizer.position); caveSpotShown = sp;
  if (sp) dep?.showPrompt(sp.name, sp.kind === 'exit' ? 'LEAVE · ○ / E' : sp.kind === 'npc' ? 'TALK · ○ / E' : sp.kind === 'blocker' ? 'SMASH · ○ / E' : '○ / E');
}
let westLakeBus = null;
let coinPiles = null; // the coin piles wooden chests throw out (coin-piles.js)
let scanobots = null, gatelocks = null, penumbras = null, novas = null, bolts = null; // Penumbra: the heavy rocket tier above the Scanobots (penumbra.js)
const chipName = c => (c.value || 1) > 1 ? `${ITEMS.portalchip.name} ×${c.value}` : ITEMS.portalchip.name;
const techBodies = () => penumbras || novas ? [...(scanobots?.bodies || []), ...(penumbras?.bodies || []), ...(novas?.bodies || [])] : scanobots?.bodies; // what bolts and arrows can strike besides Seers
const techLocks = () => [...(scanobots?.lockTargets() || []), ...(penumbras?.lockTargets() || []), ...(novas?.lockTargets() || [])];
// Every enemy the lock d-pad moves can reach, behind the one interface astral.js speaks (the Seers' own): Seers and
// Mori answer as before; Scanobots and Penumbras (tech bodies) take the same moves as damage, a shove and a stun.
const isFoeLock = lk => !!lk && ((lk.kind === 'enemy' && !!seers?.alive(lk.ref)) || (lk.kind === 'scanobot' && !!lk.ref.alive));
// ── Focus Move executor: runs a learned technique on the existing Astral combat (astral.js owns damage, targeting,
// animation, energy and timing). One cast per move id; a new Focus Move adds its cast here. ──
function castFocus(id, context = false) {
  const M = FOCUS_MOVES[id], lk = astral.lock, label = (M?.name || id).toUpperCase();
  if (!M || (!context && !focus.knows(id))) return;
  if (id === 'astralift') {
    if (!astral.canAstralift(foes)) return showToast('ASTRALIFT · lock an enemy or a closed chest');
    if (!rizer.onGround || rizer.attack || rizer.dodgeT > 0) return;
    if (!rizer.spendEnergy(ASTRAL.lift.energy)) return showToast('ASTRAL ENERGY LOW');
    if (astral.astralift(rizer, foes, loot, commonChests, result => {
      if (!result) return;
      if (result.kind === 'chest') showToast('ASTRALIFT · chest opening');
      else if (result.kind === 'coinchest') showToast('ASTRALIFT · the lid gives');
      else showToast(result.down && result.scanobot ? downToast(result) : `${result.name || 'Enemy'} blasted back · 2 damage`);
    })) later(Math.max(0, ASTRAL.lift.release - 0.25), () => sfx.play('lift', 1, 1)); // the crack peaks as the lift lands
    return;
  }
  if (id === 'astralspin') { // no lock needed; grounded or airborne
    const r = storm.astralspin(rizer); if (r.fail) return showToast(r.fail);
    rumbleHit('medium'); showToast(r.airborne ? 'ASTRALSPIN · the tornado forms on the ground below' : 'ASTRALSPIN'); return;
  }
  if (!isFoeLock(lk)) return showToast(`${label} · lock an enemy first (R3 / R)`);
  if (id === 'astralclap') {
    const r = storm.astralclap(rizer, lk.ref); if (r.fail) return r.fail && showToast(r.fail);
    rumbleHit('light'); return;
  }
  if (id === 'astralthunder') { // lightning from the sky onto the locked Seer or Mori
    if (!rizer.onGround || rizer.attack || rizer.dodgeT > 0) return;
    if (!rizer.spendEnergy(ASTRAL.thunder.energy)) return showToast('ASTRAL ENERGY LOW');
    astral.thunder(rizer, lk.ref, foes, (p, hits) => {
      cam.kick(1.2); hitStop = Math.max(hitStop, 0.1); sfx.play('thunder'); rumbleHit('thunder');
      const main = hits[0]; showToast(main?.down ? `ASTRALTHUNDER · ${main.name} down` : `ASTRALTHUNDER · ${ASTRAL.thunder.damage} damage${hits.length > 1 ? ` · ${hits.length - 1} caught in the blast` : ''}`);
    });
  } else if (id === 'astralburst') { // lightning crackles over Rizer, then explodes out around him
    if (!rizer.onGround || rizer.attack || rizer.dodgeT > 0 || astral.bursting) return;
    if (!rizer.spendEnergy(ASTRAL.burst.energy)) return showToast('ASTRAL ENERGY LOW');
    const p = lk.ref.pos; rizer.facing = Math.atan2(p.x - rizer.position.x, p.z - rizer.position.z);
    sfx.play('blast', 0.55, 0.8); rumbleHit('light'); // the charge hums up
    astral.astralburst(rizer, foes, (c, hits) => {
      cam.kick(1.6); hitStop = Math.max(hitStop, 0.1); sfx.play('thunder', 0.9); sfx.play('heavy', 0.8); if (hits.length) sfx.play('lift', 1); rumbleHit('thunder');
      const down = hits.filter(h => h.down).length;
      showToast(hits.length ? `ASTRALBURST · ${hits.length} blasted back${down ? ` · ${down} down` : ''}` : 'ASTRALBURST');
    });
  } else if (id === 'rolling_thunder') { // every impact starts a 3 s fuse; nearby enemies chain before the final blast
    if (!rizer.onGround || rizer.attack || rizer.dodgeT > 0 || astral.rolling) return;
    if (!rizer.spendEnergy(ASTRAL.rolling.energy)) return showToast('ASTRAL ENERGY LOW');
    sfx.play('blast', 0.6, 0.75); rumbleHit('light');
    astral.rollingThunder(rizer, lk.ref, foes, result => {
      if (result.exploded) {
        cam.kick(1.45); hitStop = Math.max(hitStop, 0.11); sfx.play('thunder', 0.9); sfx.play('heavy', 0.75); rumbleHit('thunder');
        showToast(`ROLLING THUNDER · ${result.hits.length} chained · ${result.explosionHits.length} caught in final blast`);
      } else {
        sfx.play('thunder', 0.55, 0.8); rumbleHit('medium');
        showToast(result.hits.length ? `ROLLING THUNDER · ${result.hits.length} electrocuted · charge ${Math.round(result.charge * 100)}%` : 'ROLLING THUNDER · blast dissipated');
      }
    });
  }
}
const techStun = (o, from) => { if (o.alive) (o.isNova ? novas : o.isPenumbra ? penumbras : scanobots)?.stun(o, from); };
const foes = {
  get grunts() { return [...(seers?.grunts || []), ...(techBodies() || [])]; },
  alive: g => g?.isScanobot ? !!g.alive : !!seers?.alive(g),
  shock(g, damage, dx = 0, dz = 0, hold = 0) { // Astralthunder, Rolling Thunder's chain: electrocuted where it stands
    if (!g.isScanobot) return seers.shock(g, damage, dx, dz, hold);
    if (!g.alive) return null;
    const hit = g.hit(damage, dx, dz, 'thunder', 0.6); techStun(g, rizer.position);
    fx.emit(g.center.x, g.center.y, g.center.z, 14, { color: '#9fd4ff', speed: 3, up: 1, size: 0.22, life: 0.4, g: 0 }); return hit;
  },
  blastBack(g, from, damage, near = 1, tech = 'splash') { // Astralburst, Rolling Thunder's blast: thrown away from it
    if (!g.isScanobot) return seers.blastBack(g, from, damage, near, tech);
    if (!g.alive) return null;
    const dx = g.center.x - from.x, dz = g.center.z - from.z, d = Math.hypot(dx, dz) || 1, hit = g.hit(damage, dx / d, dz / d, tech, 1.6 + near * 1.4); techStun(g, from); return hit;
  },
  astralift(g, from) { // Astralift: hurled back from Rizer
    if (!g.isScanobot) return seers.astralift(g, from);
    if (!g.alive) return null;
    const dx = g.center.x - from.x, dz = g.center.z - from.z, d = Math.hypot(dx, dz) || 1, hit = g.hit(2, dx / d, dz / d, 'astralift', 3.2); techStun(g, from);
    fx.emit(g.center.x, g.center.y, g.center.z, 18, { color: '#8fb8ff', speed: 4, up: 2.2, size: 0.3, life: 0.5, g: 1 }); return hit;
  }
};
const downToast = h => h.nova ? `${h.name.toUpperCase()} DOWN${h.drop ? ` · ${h.drop} dropped` : ''}` : `${(h.name || 'Scanobot').toUpperCase()} DOWN · Portalchip${h.chips > 1 ? ' ×' + h.chips : ''} dropped`; // Scanobot drones → Portalchips → Portal Gatelocks
let ufoPilot = false, ufoTransition = null, ufoVelocity = new THREE.Vector3(), ufoBeam = null, ufoFireCooldown = 0, ufoTurboT = 0, ufoTurboCooldown = 0;
let hour = 16.5, hourTarget = null, hitStop = 0, koT = 0, hurtTimer;
let last = performance.now(), elapsed = 0;

function build() {
  const tb = performance.now();
  world = createWorld(W, scene, shared);
  console.log('[rp7d] world built in', Math.round(performance.now() - tb), 'ms');
  world.bound = W.bound; world.roam = W.extent - 1; // spawns keep Malezor's bound; Rizer himself may walk to the edge of Malezor's ground and on into the empty districts
  shared.groundAt = world.groundAt;
  sky = createSky(scene, shared);
  homeInterior = createHomeInterior(scene); indoor = homeInterior; homeMode = true; world.setExteriorVisible(false);
  storeInterior = createStoreInterior(scene); // the Malezor Town Store (the Gear Shop's door)
  homeInterior.setGuitarTaken(hasWeapon('guitar'));
  initTV();
  const s = W.playerStart;
  rizer = new Rizer(scene, { x: s.x, y: world.groundAt(s.x, s.z), z: s.z, facing: s.facing });
  seating = createSeating({ interior: homeInterior, rizer, toast: showToast, onType: () => pcCamIn() });
  furnMover = createFurnitureMover({ interior: homeInterior, rizer, toast: showToast, prompt: (n, h) => dep?.showPrompt(n, h) });
  rizer.ready.then(n => n && console.log('[rp7d] playing as', n));
  if (settings.char && settings.char !== 'rizer' && CHARACTERS[settings.char]) rizer.ready.then(() => rizer.setCharacter(settings.char)); // last skin / character picked in the Zyphone
  cam = new FollowCamera(camera); cam.yaw = s.facing + Math.PI; cam.focus.set(s.x, rizer.position.y + 1.7, s.z);
  homeInterior.start(rizer, cam); cam.snapBehind(rizer); $('#game').classList.add('home-interior');
  const bondedIds = new Set((inventory.bondedZyrex || []).map(b => b.id));
  spawnZyrex();
  // Anciuxor: the RP7B 2DHD sprite (idle + flight sheets) roaming the district, taking off when Rizer comes close.
  createAnciuxor(scene, world, W).then(a => { anciuxor = a; a.sprite.visible = !homeMode; }).catch(e => console.warn('[rp7d] Anciuxor art failed to load', e));
  setOutdoorActorsVisible(false);
  fx = createFX(scene, shared);
  // A stone struck or broken (nature.js throws the chips and fragments): grit and dust, the crack of it, and the pad.
  world.nature?.userData?.stones?.setHitEffect((x, y, z, broken, stone, force = 1) => {
    const s = stone?.scale || 1, near = Math.hypot(x - rizer.position.x, z - rizer.position.z) < 14;
    if (!broken) {
      fx.emit(x, y + s * 0.3, z, 9, { color: '#b9b5a8', speed: 2.2, up: 0.9, size: 0.16, life: 0.3, g: 6 });   // grit off the face
      fx.emit(x, y + s * 0.25, z, 4, { color: '#d9d5c9', speed: 0.7, up: 0.5, size: 0.5, life: 0.6, g: -0.4 }); // a puff of dust
      if (near) { sfx.play('medium', 0.75, 0.72); rumbleHit('medium'); cam.kick(0.2); }
      return;
    }
    fx.emit(x, y + s * 0.3, z, 26, { color: '#c9c5b8', speed: 4.2 * force, up: 1.8, size: 0.2, life: 0.45, g: 7 });           // grit thrown out
    fx.emit(x, y + s * 0.2, z, 12, { color: '#dcd8cc', speed: 1.5, up: 0.9, size: 0.95 * s, life: 1.25, g: -0.5 });            // the dust cloud rolling up
    fx.emit(x, y + 0.1, z, 10, { color: '#cfcabd', speed: 2.6, up: 0.25, size: 0.6 * s, life: 0.9, g: 0, spread: 0.3 });        // and along the ground
    if (stone?.isAstraliteStone) fx.emit(x, y + 0.2, z, 9, { color: '#78caff', speed: 2, up: 1.2, size: 0.16, life: 0.6 });
    if (near) { sfx.play('heavy', 0.95, 0.7); sfx.play('land', 0.9, 0.6); rumbleHit('heavy'); cam.kick(0.55 * Math.min(1.6, force)); hitStop = Math.max(hitStop, 0.05); }
  });
  // Trees and bushes (nature.js throws the bark, logs and leaves): the sound, the dust and the pad for each moment.
  world.nature?.userData?.breakables?.setHitEffect((kind, event, x, y, z, e, tip) => {
    const s = e?.scale || 1, near = Math.hypot(x - rizer.position.x, z - rizer.position.z) < 16;
    if (kind === 'bush') {
      if (event === 'rustle') { if (near) sfx.play('slide', 0.22, 1.5); return; }
      fx.emit(x, y, z, event === 'break' ? 16 : 6, { color: '#7fa55a', speed: event === 'break' ? 3 : 1.6, up: 1.2, size: 0.22, life: 0.5, g: 2 });
      if (near) { sfx.play(event === 'break' ? 'medium' : 'light', 0.6, event === 'break' ? 0.8 : 1.4); sfx.play('slide', 0.35, 1.3); rumbleHit(event === 'break' ? 'medium' : 'light'); }
      return;
    }
    if (event === 'hit') { // the thock of wood
      fx.emit(x, y, z, 7, { color: '#c8a877', speed: 2.2, up: 0.9, size: 0.14, life: 0.35, g: 6 });
      if (near) { sfx.play('medium', 0.8, 0.62); rumbleHit('medium'); cam.kick(0.18); }
    } else if (event === 'fall') { // it gives: the crack, then it goes over
      fx.emit(x, y, z, 14, { color: '#d9bd8c', speed: 3, up: 1.2, size: 0.16, life: 0.4, g: 6 });
      if (near) { sfx.play('heavy', 0.7, 1.25); sfx.play('whoosh', 0.5, 0.6); rumbleHit('medium'); showToast('It comes down slowly, then all at once'); }
    } else if (event === 'crash') { // and lands
      fx.emit(x, y + 0.3, z, 16, { color: '#d6d1c2', speed: 2.4, up: 0.8, size: 0.9 * s, life: 1.1, g: -0.4 });
      fx.emit(x, y + 0.6, z, 26, { color: '#6e9149', speed: 4, up: 1.8, size: 0.3, life: 0.7, g: 2 });
      if (near) { sfx.play('heavy', 1, 0.55); sfx.play('land', 1, 0.5); rumbleHit('heavy'); cam.kick(0.7); }
      // anything standing where it comes down is struck by it
      const hitBy = o => { const p = o.center || o.pos, ax = tip.x - e.x, az = tip.z - e.z, L = ax * ax + az * az || 1, t = Math.max(0.15, Math.min(1, ((p.x - e.x) * ax + (p.z - e.z) * az) / L)); return Math.hypot(p.x - e.x - ax * t, p.z - e.z - az * t) < 1.3 + (o.r || 0.5); };
      for (const g of seers?.grunts || []) if (seers.alive(g) && hitBy(g)) seers.hitGrunt(g, 6, e.dir[0], e.dir[1], 'kick', 1.4);
      for (const o of techBodies() || []) if (o.alive && hitBy(o)) o.hit(6, e.dir[0], e.dir[1], 'kick', 1.4);
    }
  });
  astral = createAstral(scene, world, fx);
  storm = createAstralStorm({ scene, world, fx, astral, foes, sfx, cam: { kick: k => cam?.kick(k) }, onToast: showToast }); // Astralclap · Astralspin
  av = createAstralvision(scene, camera, fx);
  loot = createLoot(scene, world, fx, W); held = createHeldWeapons(scene); chestLight = createChestLight(scene); restoreScope(); initStorage();
  astralboard = createAstralboard(scene, world, fx, showToast, loot.astralboard.rest); dep?.sync(); // a deployed Astralboard comes back where it was set down
  lightbulbs = createLightbulbChests({ scene, world, W, fx, buildChest, chestFront, porch: PLAYTEST_PORCH_CHESTS ? porchChestSpots(W, world).gold : null, onCollect: lightbulbLearned, onOpen: () => { sfx.play('lift', 0.7, 1.1); showToast('GOLD CHEST · a Lightbulb rises · ✕ to collect'); } }); // the gold chests: ○ opens one, ✕ collects its Lightbulb and learns its Focus Move for good
  // Caves: the interiors answer every physical query in their region of the world (world.js · setInterior)
  caveSys = createCaveInteriors({ scene, caves: CAVES, toast: showToast, fx, state: caveState });
  world.setInterior({ name: x => caveSys.planAt(x)?.cave.name, owns: caveSys.owns, groundAt: (x, z, y) => caveSys.planAt(x)?.phys.groundAt(x, z, y) ?? -60, resolve: (p, r) => caveSys.planAt(p.x)?.phys.resolve(p, r) ?? false, rayClear: (a, b) => caveSys.planAt(a.x)?.phys.rayClear(a, b) ?? a.distanceTo(b) });
  caveLight = new THREE.PointLight('#ffd9a8', 0, 18, 1.6); scene.add(caveLight); // one light, always in the scene (a light appearing later would recompile every material)
  westLakeBus = createWestLakeBus(scene, world, fx, showToast, { x:W.playerStart.x + 14, z:W.playerStart.z + 8, facing:Math.PI * 0.15 });
  commonChests = createCommonChests(scene, world, fx, W, (x, z) => quarterAt(x, z, W) === 'core', [...loot.all.filter(c => !['psychosyd-chest', 'astralboard-chest'].includes(c.id)).map(c => ({ x: c.chest.position.x, z: c.chest.position.z })), ...(lightbulbs?.list || []).map(c => ({ x: c.x, z: c.z })), { x: W.playerStart.x, z: W.playerStart.z }],
    (ch, n) => showToast(`✦ ASTRALIFT · ${n} coin pile${n === 1 ? '' : 's'} shaken loose`), // the astral-pop payoff
    (ch, rolls, at) => coinPiles?.spawn(at, ch.face, rolls)); // every wooden chest: its 1–3 rolled piles fly out of the reward point, fanned toward its front
  // Coin piles: one pickup each, carrying its rolled value. Walking near a settled pile pulls it in and adds exactly that
  // much Gold. Piles still on the ground are remembered (inventory.coinPiles), so a reload neither loses nor repeats them.
  coinPiles = createCoinPiles(scene, world, fx, {
    saved: inventory.coinPiles, onChange: list => { inventory.coinPiles = list; saveInv(); },
    onCollect: p => {
      inventory.coins = (inventory.coins || 0) + p.value; saveInv(); hud.setWallet(inventory);
      sfx.play('land', 0.35, 1.9); sfx.play('light', 0.25, 2);
      fx.emit(rizer.position.x, rizer.position.y + 1, rizer.position.z, 10, { color: '#ffd24a', speed: 1.6, up: 1.4, size: 0.2, life: 0.45 });
      showToast(`+${p.value} coins · ${COIN_PILES.classes[p.cls].name.toLowerCase()}`);
    } });
  coinPiles.setVisible(!homeMode);
  console.log('[rp7d] wooden chests:', commonChests.chests.length);
  // Loot is created after the initial interior visibility pass; keep it outside too.
  setOutdoorActorsVisible(false);
  // Astralvision targets: loot now; quests register the same way later
  for (const c of loot.all) {
    av.register({ id: c.id, kind: 'loot', label: 'Silver chest', tagHeight: 1.4, pos: () => c.chest.position, object: () => c.chest, active: () => c.state !== 'empty' && c.state !== 'waiting' });
    av.register({ id: c.id + '-item', kind: 'loot', label: (WEAPONS[c.item] || RIDES[c.item]).name, tagHeight: 1.6, pos: () => c.mesh.position, object: () => c.mesh, active: () => c.state === 'waiting' });
  }
  for (const ch of commonChests.chests) av.register({ id: ch.id, kind: 'loot', label: 'Wooden chest', tagHeight: 1.2, pos: () => ch.C.root.position, object: () => ch.C.root, active: () => ch.state === 'closed' });
  zycube = createZycube(scene, world, fx); if (inventory.zycube) zycube.show(inventory.zycube);
  av.register({ id: 'zycube', kind: 'loot', label: 'Zycube', far: true, tagHeight: 1.9, pos: () => zycube.pos(), object: () => zycube.root, active: () => zycube.dropped && !homeMode });
  for (const it of world.interactables.filter(q => q.canon)) av.register({
    id: it.id, kind: 'quest', label: it.name, tagHeight: 2.2,
    pos: () => new THREE.Vector3(it.cx, world.groundAt(it.cx, it.cz) + 1.4, it.cz), active: () => true
  });
  // Scanobots (drones that drop Portalchips) and the two Portal Gatelocks that take 10 to open. AV marks
  // dropped chips, and always finds both gatelocks with their state and the chips carried.
  scanobots = createScanobots(scene, world, W, fx, { onDefeated: (b, kind) => { awardCombatRXP(b, 'scanobot', kind); resources?.wreck(b, 'scanobot'); }, onChip: c => { c.unreg = av.register({ id: c.id, kind: 'loot', label: chipName(c), tagHeight: 0.8, pos: () => c.root.position, object: () => c.chip, active: () => !c.taken && !homeMode }); } });
  gatelocks = createGatelocks(scene, world, W, fx, { toast: showToast, sfx, onEvent: (type, g) => { if (type === 'found') awardDiscovery('gatelock', g.id); else if (type === 'open') awardObjective('gatelock-open', g.id); else if (type === 'teleport') portalJump(g); } });
  for (const g of gatelocks.list) av.register({ id: g.id, kind: 'quest', far: true, tagHeight: 4.2, get label() { return gatelocks.label(g); }, pos: () => g.root.position, object: () => g.base, active: () => !homeMode });
  penumbras = createPenumbras(scene, world, W, fx, { dropChip: (x, z, y, v) => scanobots.dropChip(x, z, y, v), onEvent: penumbraEvent });
  bolts = createBolts(scene, world, fx, boltEvent);
  resources = createResourcePiles(scene, world, fx, { onEvent: resourceEvent, onPile: s => { s.unreg = av.register({ id: s.id, kind: 'loot', label: `${s.name} ×${s.quantity}`, tagHeight: 0.7, pos: () => s.mesh.position, object: () => s.mesh, active: () => !s.taken && !homeMode }); } });
  gatelocks.list.forEach((g, i) => { // authored test piles: discarded parts beside each Portal Gatelock (one-time; they stay collected)
    const q = g.root.position; [[3, 3.4, 0.6], [5, 3.9, 2.5], [4, 4.6, 4.3]].forEach(([n, r, a], k) => { const x = q.x + Math.sin(a + i) * r, z = q.z + Math.cos(a + i) * r; if (world.waterAt(x, z) < world.heightAt(x, z) - 0.1) resources.authored(`gatelock_${i + 1}_scrap_${String(k + 1).padStart(3, '0')}`, 'scrap_metal', n, x, z); });
  });
  createNovaGuardians(scene, world, W, fx, { bolts, onEvent: novaEvent }).then(n => { novas = n; n.setVisible(!homeMode); }).catch(e => console.warn('[rp7d] nova guardians', e));
  scanobots.setVisible(!homeMode); penumbras.setVisible(!homeMode); gatelocks.setVisible(!homeMode);
  rizer.weapon = inventory.equipped; rizer.swordAt = BLADES[inventory.equipped] ? 'hand' : 'hip'; rizer.handWeapon = BLADES[inventory.equipped] ? inventory.equipped : null; syncWheel(); wheel.render(); applySettings();
  hud = createHUD(W, world); hud.setProgress(progression.info);
  // RXP sources · exploration: a named region, a landmark, the first objectives. Each pays once, ever (rxp-rewards.js).
  const homeRegion = hud.regionOf(W.playerStart.x, W.playerStart.z);
  hud.onEvent = (type, d) => {
    if (homeMode) return;
    if (type === 'region' && d !== homeRegion) awardDiscovery('region', d);
    else if (type === 'place' && d.id !== 'player-home') awardDiscovery('place', d.id, d.kind);
    else if (type === 'square') awardObjective('malezor-square');
    else if (type === 'allPlaces') awardObjective('malezor-landmarks');
  };
  hud.setScanSource(() => av.minimap());
  const activeBond = (inventory.bondedZyrex || []).find(b => b.id === inventory.activeZyrex);
  if (activeBond) hud.setPartner({ name:activeBond.name, type:activeBond.species, lv:activeBond.level, hp:100, maxHp:100, ap:100, maxAp:100 });
  if (activeBond) setPartner(activeBond.id);
  bondGame = createBondGame({ scene, host:$('#game'), fx, inventory, saveInv, toast:showToast,
    onSuccess:(z, difficulty) => {
      const record = { id:z.def.id, name:z.def.name || z.def.species.replace(/^./, c => c.toUpperCase()), species:z.def.species,
        level:z.def.level || difficulty * 5, difficulty };
      (inventory.bondedZyrex ||= []).push(record); inventory.activeZyrex = record.id; saveInv();
      hud.setPartner({ name:record.name, type:record.species, lv:record.level, hp:100, maxHp:100, ap:100, maxAp:100 });
      astral.clearLock(); const at = zyrex.indexOf(z); if (at >= 0) zyrex.splice(at, 1);
      fx.emit(z.pos.x, z.pos.y + 1.3, z.pos.z, 32, { color:'#70c8ff', speed:3, up:2, size:.25, life:.7 });
      scene.remove(z.b.root); setPartner(record.id); // it steps back out of the Zysphere at his side
    } });
  // Zoryn is paused for the art pass. Keep his NPC implementation and saved
  // progress intact so he can return without resetting the player's history.
  createSeers(scene, world, W).then(sq => { seers = sq; sq.onDefeated = (g, kind) => awardCombatRXP(g, g.T.key, kind); // RXP source · combat: one award per defeat, by RP7B's formula
     bowProjectiles = createPearlbow(scene, world, sq, fx, techBodies, sfx); setOutdoorActorsVisible(!homeMode); console.log('[rp7d] seers on patrol:', sq.total); })
    .catch(e => console.warn('[rp7d] seers failed to load', e));
  zy = createZyphone({
    W, hud, characters: CHARACTERS, itemCatalog: ITEMS, onUseItem: k => useItem(k),
    getState: () => ({ hour, dev: settings.dev, hp: rizer.hp, maxHp: rizer.maxHp, charKey: rizer.charKey, defeated: seers?.defeated || 0, seers: seers?.total || W.seerPatrols.length, region: hud.regionOf(rizer.position.x, rizer.position.z), x: rizer.position.x, y: rizer.position.y, z: rizer.position.z, contacts: npcs?.npcs.filter(n => n.met).map(n => ({ name:n.name, note:n.recruited ? 'Companion · following Rizer' : n.downed ? 'Downed · lock on and press D-pad ↓ to revive' : 'Contact · Malezor' })) || [] }),
    onPartner: id => { const ok = setPartner(id); if (ok) showToast(`${partner.record.name} walks with you`); return ok; },
    labsHub: makeLabsHub(), astralHub: makeAstralHub(), onLabsView: on => setLabsView(on),
    onTime: h => { if (settings.dev) hourTarget = h > hour + 0.05 ? h : h + 24; },
    onCharacter: async k => { settings.char = k; saveSettings(); await rizer.setCharacter(k); skinLab?.apply(); }, // skins and characters stick between sessions
    onAnimLab: () => { zy.close(); skinLab?.close(); buildLab?.close(); lab.open(); },
    onSkinLab: () => { zy.close(); lab.close(); buildLab?.close(); skinLab.open(); },
    onBuildLab: () => { zy.close(); lab.close(); skinLab?.close(); buildLab.open(); },
    weapons: WEAPONS, inventory, storage, crafting, onDeploy: uid => deployFromZyphone(uid), onPackDeployed: uid => packDeployedFromZyphone(uid),
    onWeapon: k => { if (inventory.wheel?.includes(k)) equip(k); else showToast('In the Zycube · put it on the weapon wheel to use it'); }, icons: ICONS,
    onWheel: w => { // off the wheel = back in the Zycube: it leaves Rizer's hand and body
      if (!w.includes(inventory.equipped)) equip('fists');
      if (inventory.hip && !w.includes(inventory.hip)) inventory.hip = null;
      saveInv(); wheel.render(); },
    menus: { options: optionsMenu, dev: devMenu }, onAction: act => menuAction(act),
    onOpen: () => { keys.clear(); if (document.pointerLockElement) document.exitPointerLock(); },
    onClose: () => canvas.focus?.()
  });
  let labCam = null;
  lab = createAnimLab({
    getActor: () => rizer.actor, getCharKey: () => rizer.charKey, setCharacter: k => rizer.setCharacter(k), playableCharacters: CHARACTERS, toast: showToast,
    onOpen: () => { keys.clear(); if (document.pointerLockElement) document.exitPointerLock(); labCam = cam.targetDist; cam.yaw = rizer.facing + 0.55; cam.pitch = 0.12; cam.targetDist = 5.6; $('#game').classList.add('lab-open'); },
    onClose: () => { if (labCam) cam.targetDist = labCam; $('#game').classList.remove('lab-open'); canvas.focus?.(); }
  });
  let skinCam = null;
  skinLab = createSkinLab({
    getActor: () => rizer.actor, getCharKey: () => rizer.charKey, characters: CHARACTERS,
    setCharacter: async k => { settings.char = k; saveSettings(); await rizer.setCharacter(k); }, toast: showToast,
    onOpen: () => { keys.clear(); if (document.pointerLockElement) document.exitPointerLock(); skinCam = cam.targetDist; cam.yaw = rizer.facing + 0.55; cam.pitch = 0.12; cam.targetDist = 5.6; $('#game').classList.add('lab-open'); },
    onClose: () => { if (skinCam != null) cam.targetDist = skinCam; $('#game').classList.remove('lab-open'); canvas.focus?.(); }
  });
  buildLab = createBuildLab({
    toast: showToast,
    onPlayable: savePlayable, // Save to playable characters
    // "Place in world": a couple of steps in front of Rizer, facing him (the build is a new character; Rizer is untouched)
    getAnchor: () => { const p = rizer.position, f = rizer.facing, x = p.x + Math.sin(f) * 2.4, z = p.z + Math.cos(f) * 2.4; return { scene, x, z, y: homeMode ? p.y : world.groundAt(x, z, p.y + 1), facing: f + Math.PI }; },
    onOpen: () => { keys.clear(); if (document.pointerLockElement) document.exitPointerLock(); $('#game').classList.add('lab-open'); },
    onClose: () => { $('#game').classList.remove('lab-open'); canvas.focus?.(); }
  });
  const uiLayout = createUILayout($('#game'), $('#layout-toggle'));
  $('#layout-toggle').addEventListener('click', () => uiLayout.toggle());
  document.addEventListener('mousemove', e => { if ((locked || dragging) && !zy.isOpen && !n3000?.isOpen && !tv?.isOpen) { cam.look(e.movementX * 0.0022 * settings.sens, e.movementY * 0.0018 * settings.sens * (settings.invertY ? -1 : 1)); setPad(false); } });
  $('#map-canvas').addEventListener('click', e => devMapJump(hud.mapToWorld(e.clientX, e.clientY)));
  $('#map-canvas').addEventListener('mousemove', e => { if (devMapOn()) hud.mapCursor = hud.mapToWorld(e.clientX, e.clientY); });
  addEventListener('wheel', e => { if (!zy.isOpen && !n3000?.isOpen && !tv?.isOpen) cam.zoom(Math.sign(e.deltaY) * 0.12); }, { passive: true });
  $('#loading').classList.add('done');
  // Debug/test hook for playtests and automated checks.
  window.__rp7d = { get store() { return storeInterior; }, get indoor() { return indoor; }, enterStore: () => walkDoor('enter', storeInterior), stationUI: () => stationUI, focus, get storm() { return storm; }, castFocus, get lightbulbs() { return lightbulbs; }, caves: { get sys() { return caveSys; }, enter: id => enterCave(id), exit: () => exitCave(), get mode() { return caveMode; }, get id() { return caveId; }, report: () => world.caveReport(), plan: () => world.cavePlan, state: caveState, grunts: caveGrunts },  get seers() { return seers; }, get labs() { return labs; }, get skinLab() { return skinLab; }, get tv() { return tv; }, get n3000() { return n3000; }, get homeInterior() { return homeInterior; }, get elapsed() { return elapsed; }, music, get gatelocks() { return gatelocks; }, get partner() { return partner; }, get astralboard() { return astralboard; }, get furn() { return homeInterior?.furn; }, get furnMover() { return furnMover; }, storage, crafting, get dep() { return dep; }, get stationUI() { return stationUI; }, openStation, get astro() { return astro; }, get scopeView() { return scopeView; }, scope: { start: startScope, use: useScope, toggle: toggleScope, get set() { return scopeSet; }, get build() { return scopeBuild; } }, world, rizer, cam, get zyrex() { return zyrex; }, zy, lab, skinLab, buildLab, bondGame, astral, loot, held, inventory, hud, sfx, westLakeBus, get commonChests() { return commonChests; }, get npcs() { return npcs; }, get scanobots() { return scanobots; }, get penumbras() { return penumbras; }, get novas() { return novas; }, get resources() { return resources; }, resource: { add: addResource, remove: removeResource, count: getResourceCount, has: hasResource, RESOURCES, SALVAGE }, get bolts() { return bolts; }, foes, progression, awardRizerXP, levelInfo, levelStart, RXP_CURVE, rxp: { awardCombatRXP, awardDiscovery, awardObjective, awardOnce, combatRXP, RXP_BANDS, RXP_REWARDS, RXP_COMBAT, RXP_ENEMIES, RXP_DISCOVERY, RXP_OBJECTIVES }, get coinPiles() { return coinPiles; }, get gatelocks() { return gatelocks; }, press: c => pressed.add(c), setHour: h => { hour = h; hourTarget = null; }, settle: (sec = 2) => { for (let i = 0; i < sec * 60; i++) { elapsed += 1 / 60; update(1 / 60, elapsed); } }, teleport: (x, z, yaw = 0, pitch = 0.3, dist = 9) => { rizer.position.set(x, world.groundAt(x, z), z); rizer.vel.set(0, 0, 0); cam.yaw = yaw; cam.pitch = pitch; cam.targetDist = cam.dist = dist; cam.focus.set(x, rizer.position.y + 1.7, z); }, get hour() { return hour; }, leaveHome: () => leaveHomeInterior(), get lootNear() { return nearestLoot(); }, renderer, scene, camera, composer };
  frame();
  // title screen: ready once the world exists · a NEW GAME reload skips straight into play
  $('#new-sub').textContent = 'Wake up in Rizer’s room';
  refreshTitle();
  try { if (sessionStorage.getItem('rp7d.boot') === 'new') { sessionStorage.removeItem('rp7d.boot'); beginPlay(); showToast('Morning in Malezor · wake up, Rizer'); } } catch (e) {}
}

// ── weapon wheel (bottom left) ──────────────────────────────────────
const ICONS = {
  fists: '<svg viewBox="0 0 48 48"><path d="M14 22c0-3 2-5 5-5h2v-3c0-2 2-3 3.5-3S27 12 27 14v3h2c3 0 6 2 6 6v8c0 6-4 10-10 10h-3c-5 0-8-3-8-8v-6c-1 0-2-2 0-3 1-1 1-2 0-2z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M21 17v7M27 17v7M20 27h11" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  sword: '<svg viewBox="0 0 48 48"><path d="M36 6l6 0 0 6-18 18-6-6z" fill="#c9d2dc" stroke="#e8f0ff" stroke-width="1.2"/><path d="M26 22l-4 4" stroke="#6fa0ff" stroke-width="1.6"/><path d="M13 27l8 8" stroke="#c8923c" stroke-width="4" stroke-linecap="round"/><path d="M17 31l-8 8" stroke="#15245a" stroke-width="4" stroke-linecap="round"/><circle cx="8" cy="40" r="3" fill="#3f82ff"/></svg>',
  axe: '<svg viewBox="0 0 48 48"><path d="M13 39L31 17" stroke="#6b4428" stroke-width="3.6" stroke-linecap="round"/><path d="M16 35.5l2.4 2M21 29.6l2.4 2" stroke="#d1a23a" stroke-width="2.2"/><path d="M26 10c-7 1-11 6-11 13l9-4z" fill="#3f5c25" stroke="#3dff7a" stroke-width="2"/><path d="M38 26c-1 7-6 11-13 11l4-9z" fill="#3f5c25" stroke="#3dff7a" stroke-width="2"/><rect x="26.5" y="18.5" width="7" height="7" transform="rotate(40 30 22)" fill="#35ff7c" stroke="#d1a23a" stroke-width="1.4"/><path d="M36 12l4-4" stroke="#35ff7c" stroke-width="3" stroke-linecap="round"/><circle cx="11" cy="41.5" r="2.4" fill="#35ff7c"/></svg>',
  rubypaw: '<svg viewBox="0 0 48 48"><path d="M24 2 31 13 29 30 19 30 17 13Z" fill="#e72732" stroke="#ff6566" stroke-width="1.2"/><path d="M24 8 27 15 26 27 22 27 21 15Z" fill="#180c16"/><path d="M24 13v12" stroke="#d71a2c" stroke-width="1.5"/><path d="M19 29q-7-1-10-8 1 8 8 12l7 2 7-2q7-4 8-12-3 7-10 8" fill="#a20e1f" stroke="#fa3a47" stroke-width="1.4"/><path d="M22 34v9h4v-9" fill="#17151b" stroke="#c18b30" stroke-width="1.4"/><path d="M20 43h8l-4 4z" fill="#df2331"/><path d="M24 28l4 4-4 4-4-4z" fill="#ff4b60"/></svg>',
  bow: '<svg viewBox="0 0 48 48"><path d="M34 5Q8 14 20 24Q8 34 34 43" fill="none" stroke="#f6e9f5" stroke-width="5" stroke-linecap="round"/><path d="M34 5V43" stroke="#d6a746" stroke-width="1.8"/><path d="M9 24h32m-6-5 6 5-6 5" fill="none" stroke="#d6a746" stroke-width="2.2"/><circle cx="19" cy="24" r="3" fill="#fff2ff" stroke="#d6a746"/></svg>',
  guitar: '<svg viewBox="0 0 48 48"><path d="M29 17l12-12" stroke="#4a2a17" stroke-width="4" stroke-linecap="round"/><path d="M38 4l5 5-3 2-4-4z" fill="#d11c26"/><path d="M26 16c-4-2-8 0-9 4-1 2-3 2-5 3-5 2-6 9-2 13s11 3 13-2c1-2 1-4 3-5 4-1 6-5 4-9l-2 2-4-4z" fill="#d11c26" stroke="#ffb3b3" stroke-width="1.2"/><path d="M14 26l5 5" stroke="#f1ece2" stroke-width="3"/><path d="M18 34l12-12" stroke="#d9dde2" stroke-width="0.9"/><circle cx="14" cy="34" r="2" fill="#d7a745"/></svg>',
  workstation: '<svg viewBox="0 0 48 48"><rect x="7" y="18" width="34" height="5" rx="1" fill="#7fd6ff" stroke="#d7f4ff" stroke-width="1"/><path d="M11 23v15M37 23v15M11 31h26" stroke="#9aa7b8" stroke-width="3" stroke-linecap="round"/><path d="M17 18l4-8h6l4 8" fill="none" stroke="#d7a745" stroke-width="2"/><circle cx="24" cy="13" r="2.4" fill="#5ef2ff"/></svg>',
  telescope: '<svg viewBox="0 0 48 48"><path d="M24 29 13 45M24 29 35 45M24 29V45" stroke="#a0774a" stroke-width="2.4" stroke-linecap="round"/><g transform="rotate(-38 24 26)"><rect x="7" y="21.5" width="31" height="9" rx="2" fill="#1b3166" stroke="#c9a64f" stroke-width="1.4"/><rect x="33" y="19.5" width="7" height="13" rx="1.6" fill="#58c4ff" stroke="#c9a64f" stroke-width="1"/><path d="M17 21.5v9M25 21.5v9" stroke="#c9a64f" stroke-width="1.6"/></g><circle cx="24" cy="29" r="2.6" fill="#c9a64f"/></svg>',
  blaster: '<svg viewBox="0 0 48 48"><path d="M4 27h9l3-4h14v6H16l-3 4H6z" fill="#2a2f38" stroke="#59616e" stroke-width="1"/><rect x="22" y="22.5" width="13" height="5" rx="2" fill="#ffab45"/><path d="M35 25h9" stroke="#59616e" stroke-width="2.6" stroke-linecap="round"/><rect x="15" y="17" width="13" height="3.6" rx="1.6" fill="#23272e" stroke="#39d8ff" stroke-width="0.9"/><path d="M17 29l-2 8h4l2-7" fill="#23272e"/><path d="M20 30q3 4 6 0" fill="none" stroke="#39d8ff" stroke-width="1.3"/></svg>'
};
// The weapon wheel: six slots, arranged in the Zyphone Armory (inventory.wheel). L1 / R1 cycle the filled ones.
function syncWheel() {
  let w = Array.isArray(inventory.wheel) ? inventory.wheel.slice(0, 6) : null;
  if (!w) w = ['fists', ...inventory.owned.filter(k => k !== 'fists')].slice(0, 6); // first run: everything owned, in order
  while (w.length < 6) w.push(null);
  w = w.map(k => k && inventory.owned.includes(k) ? k : null);
  if (!w.includes('fists')) { const e = w.indexOf(null); w[e >= 0 ? e : 0] = 'fists'; }
  for (const k of inventory.owned) if (!(inventory.seen ||= []).includes(k)) { inventory.seen.push(k); if (!w.includes(k)) { const e = w.indexOf(null); if (e >= 0) w[e] = k; } } // new finds go on the wheel if there's room
  if (!inventory.hip) inventory.hip = [...inventory.owned].reverse().find(k => BLADES[k] && w.includes(k)) || null; // nothing used yet: the newest blade rides on the hip
  inventory.wheel = w; saveInv();
}
const wheelList = () => inventory.wheel.filter(Boolean);
const wheel = (() => { // WHUD: six slots ringed round what's in hand · L1 / R1 cycle
  const el = document.createElement('section'); el.className = 'wheel whud hud-panel'; el.dataset.zy = 'weapons'; el.setAttribute('aria-label', 'Weapon wheel');
  const slots = [0, 1, 2, 3, 4, 5].map(i => { const a = -Math.PI / 2 + i * Math.PI / 3; return `<span class="whud-slot" data-i="${i}" style="--x:${Math.cos(a).toFixed(3)};--y:${Math.sin(a).toFixed(3)}"></span>`; }).join('');
  el.innerHTML = `<header class="hud-tag"><i></i>WHUD<b class="zy-link">ZY·LINK</b></header><div class="whud-ring"><svg class="whud-arc" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="74"/><path d="M40 52 a82 82 0 0 1 22 -22"/><path d="M160 52 a82 82 0 0 0 -22 -22"/></svg>${slots}<div class="whud-core"><span id="wh-icon"></span><b id="wh-name"></b></div><kbd class="p whud-l">L1</kbd><kbd class="p whud-r">R1</kbd><kbd class="k whud-r">Q</kbd></div>`;
  $('#game').appendChild(el);
  el.addEventListener('click', e => { if (!$('#game').classList.contains('layout-editing')) zy?.open('weapons'); });
  return { render() {
    const list = wheelList(), eq = inventory.equipped;
    el.classList.toggle('solo', list.length < 2);
    $('#wh-icon').innerHTML = ICONS[eq] || ''; $('#wh-name').textContent = WEAPONS[eq]?.name || 'Fists';
    el.querySelectorAll('.whud-slot').forEach((s, k) => { const w = inventory.wheel[k]; s.innerHTML = w ? ICONS[w] || '' : ''; s.classList.toggle('on', w === eq && !!w); s.classList.toggle('filled', !!w); s.title = w ? WEAPONS[w]?.name || w : 'Empty slot'; });
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  } };
})();
function equip(k) {
  if (!inventory.owned.includes(k) || k === inventory.equipped) return;
  if (scopeBuild) cancelScope(); inventory.equipped = k; saveInv(); rizer.setWeapon(k); wheel.render();
  if (k === 'telescope') showToast(scopeSet ? 'Stargazer Telescope · set up nearby · □ beside it packs it away' : 'Stargazer Telescope · □ to set it up here');
  if (BLADES[k]) fx.emit(rizer.position.x, rizer.position.y + 1.4, rizer.position.z, 10, { color: WEAPONS[k].color || '#9cc0ff', speed: 1.4, up: 1, size: 0.3, life: 0.5, g: 0 });
}
function cycleWeapon(dir) { const list = wheelList(); if (!list.length) return; const i = list.indexOf(inventory.equipped); equip(list[i < 0 ? 0 : (i + dir + list.length) % list.length]); }
// Psychosyd's guitar, on □ with the guitar equipped: Rizer plays Guitar Playing to the Beat It solo, and every
// Seer and Mori within GUITAR.radius drops what it's doing and dances (Mori: Zombie Dance; Seers: one of the
// dance-pack loops each) until the song ends. □ again, moving, jumping, striking or taking a hit stops it early.
// The soundtrack ducks under the solo. seers.setMusic() carries where the music is; npcs join in when they return.
const GUITAR = { radius: 24, duck: 0.12, astralRate: COMBAT.prayer.stamina };
let jam = null; // { t, dur, song }
// ── LABS › RIZER (labs.js · zyphone.js renderLabs) ──
// The Zyphone page reads view() and calls act(); everything edits the player's own body. While the page is up the
// camera stands in front of him, so the real Rizer fills the open middle of the screen.
// Body changes run one after another, so a slow load (Elzoran, a build) can't land after a later change (Reset).
let labsCharQ = Promise.resolve();
function setCharFromLabs(k) { settings.char = k; saveSettings(); return (labsCharQ = labsCharQ.then(() => rizer.setCharacter(k)).then(() => skinLab?.apply()).catch(e => console.warn('[rp7d] Labs body change failed', e))); }
function ensureLabs() {
  return labs ||= createLabs({ scene, getRizer: () => rizer, characters: CHARACTERS, skinLab, setCharacter: setCharFromLabs, savePlayable, toast: showToast, fx });
}
function makeLabsHub() {
  const hasHair = () => { let on = false; rizer?.actor?.model.traverse(o => { if (o.isSkinnedMesh && !o.name.startsWith('asset:') && [].concat(o.material).some(m => m?.name === 'R_hair')) on = true; }); return on; };
  return {
    view() {
      const L = ensureLabs(), key = rizer.charKey, C = CHARACTERS[key] || {}, base = C.skinOf || key;
      return {
        charName: C.name || key, bodyName: CHARACTERS[base]?.name || base,
        skins: [base, ...Object.keys(CHARACTERS).filter(k => CHARACTERS[k].skinOf === base)].map(k => ({ key: k, name: CHARACTERS[k].name, current: k === key })),
        hair: { can: hasHair(), name: skinLab?.hairName(skinLab.hair) || 'Character default' },
        colors: skinLab?.swatches() || [], templates: L.templates, clones: L.clones.length, resetArmed: L.resetArmed
      };
    },
    async act(action, arg, name) {
      const L = ensureLabs(), i = +arg, t = L.templates[i];
      if (action === 'body') { const bodies = Object.keys(CHARACTERS).filter(k => !CHARACTERS[k].skinOf), cur = CHARACTERS[rizer.charKey]?.skinOf || rizer.charKey; return setCharFromLabs(bodies[(bodies.indexOf(cur) + 1) % bodies.length]); }
      if (action === 'hair') return skinLab.setHair(i || 1);
      if (action === 'resetColors') return skinLab.setLook(rizer.charKey, { colors: {}, hair: skinLab.hair });
      if (action === 'save') return L.saveTemplate(name);
      if (action === 'clone') return L.spawnClone();
      if (action === 'swap') return L.playAsClone();
      if (action === 'clear') return L.clearClones();
      if (action === 'reset') return L.resetRizer();
      if (!t) return;
      if (action === 'wear') return L.applyTemplate(t, { keep: false });
      if (action === 'cloneT') return L.spawnClone(t, null, t.name);
      if (action === 'dl') { L.download(t); return showToast(`${t.name} · JSON downloaded`); }
      if (action === 'del') return L.deleteTemplate(i);
    }
  };
}
// ── LABS › ASTRAL: the X-ray Rizer (astral-xray.js) and his stats and mods (astral-stats.js) ──
function makeAstralHub() {
  const pct = v => `${Math.round(v * 100)}%`;
  return {
    view() {
      const lv = progression.level;
      return {
        name: CHARACTERS[rizer.charKey]?.name || 'Rizer', level: lv, total: astralBuild.total, free: astralBuild.free, perLevel: ASTRAL_AP.perLevel, statMax: ASTRAL_AP.statMax,
        stats: STATS.map(st => ({ ...st, value: astralBuild.stat(st.id) })), mods: astralBuild.mods.length, resetArmed: performance.now() - astralResetArmed < 4000,
        systems: SYSTEMS.map((sys, i) => ({ ...sys, code: ['CTX', 'SPN', 'ARM', 'LEG'][i], mods: Object.entries(MODS).filter(([, m]) => m.system === sys.id).map(([id, m]) => ({ id, ...m, installed: astralBuild.has(id) })) })),
        readout: [['LEVEL', lv], ['MAX HEALTH', rizer.maxHp], ['MAX STAMINA', rizer.maxStamina], ['MAX ASTRAL', rizer.maxAstralEnergy], ['MELEE DAMAGE', pct(meleeMul())],
          ['FINISHERS', pct(meleeMul(true))], ['STAMINA REGEN', pct(staminaRegenMul())], ['DODGE COST', pct(dodgeCostMul())], ['ASTRAL / BLOW', pct(astralHitMul())],
          ['HEALTH REGEN', hpRegen() ? `+${hpRegen()} / s` : '—'], ['ASTRAL REGEN', astralRegen() ? `+${astralRegen()} / s` : '—']]
      };
    },
    act(action, arg) {
      let err = null;
      if (action === 'raise') err = astralBuild.raise(arg);
      else if (action === 'lower') err = astralBuild.lower(arg);
      else if (action === 'mod') { const had = astralBuild.has(arg); err = astralBuild.toggle(arg); if (!err) showToast(`${MODS[arg].name} · ${had ? 'removed' : 'installed'}`); }
      else if (action === 'reset') {
        if (performance.now() - astralResetArmed > 4000) { astralResetArmed = performance.now(); return showToast('RESET ASTRAL · press again to refund every point'); }
        astralResetArmed = 0; astralBuild.reset(); showToast('Astral reset · every point refunded');
      }
      if (err) return showToast(err);
      rizer.hp = Math.min(rizer.hp, rizer.maxHp); rizer.stamina = Math.min(rizer.stamina, rizer.maxStamina); rizer.astralEnergy = Math.min(rizer.astralEnergy, rizer.maxAstralEnergy);
    }
  };
}
function setLabsView(on) {
  xray ||= createXray({ scene, camera, renderer, getRizer: () => rizer });
  if (on === 'astral') xray.enable(); else xray.disable();
  $('#game').classList.toggle('labs-view', !!on);
  if (on && !labsView) labsView = { yaw: cam.yaw, pitch: cam.pitch, dist: cam.targetDist };
  else if (!on && labsView) { cam.yaw = labsView.yaw; cam.pitch = labsView.pitch; cam.targetDist = labsView.dist; labsView = null; }
}
// ── the TV & DVD system (tv-system.js · dvd-registry.js) ──
// While the TV is up the world waits: frame() renders the room (the movie plays on the 3D screen) but skips update().
function initTV() {
  tv = createTVSystem({ set: homeInterior.tvSet, storage, inventory, saveInv, toast: showToast,
    onOpen: () => {
      saveGame(); keys.clear(); pressed.clear(); mousePunchHeld = dragging = false;
      if (document.pointerLockElement) document.exitPointerLock();
      tvCamera = { position: camera.position.clone(), quaternion: camera.quaternion.clone(), k: 0 };
      music.setHostPaused(true); sfx.setHostPaused(true); dep?.showPrompt(null); $('#game').classList.add('tv-watching');
    },
    onClose: () => {
      if (tvCamera) { camera.position.copy(tvCamera.position); camera.quaternion.copy(tvCamera.quaternion); } tvCamera = null;
      keys.clear(); pressed.clear(); mousePunchHeld = dragging = false; $('#game').classList.remove('tv-watching');
      const pad = [...(navigator.getGamepads?.() || [])].find(Boolean); padPrev = pad?.buttons.map(b => b.pressed) || [];
      music.setHostPaused(false); sfx.setHostPaused(false); canvas.focus?.();
    } });
  // each disc waits where the registry says until it is found: its case, lying on the floor
  for (const [id, d] of Object.entries(DVDS)) {
    if (!d.find) continue;
    const mesh = buildDvdPickup(id); mesh.rotation.y = 0.5; mesh.position.y = 0.005;
    homeInterior.addPickup({ id: 'dvd:' + id, name: `DVD · ${d.title}`, level: d.find.level, x: d.find.x, z: d.find.z, mesh, hidden: () => tv.owned(id) });
  }
}
function tvFrame(realDt) { // camera glide to the screen, then the room renders with the movie on it
  tv.update(Math.min(realDt, 0.05));
  const v = tv.view(camera.fov), u = tvCamera;
  if (u) {
    u.k = Math.min(1, u.k + realDt / 0.6); const e = u.k * u.k * (3 - 2 * u.k);
    const look = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(v.eye, v.screen, new THREE.Vector3(0, 1, 0)));
    camera.position.copy(u.position).lerp(v.eye, e); camera.quaternion.slerpQuaternions(u.quaternion, look, e);
  }
  renderer.info.reset(); composer.render(); pressed.clear();
}
// A new game starts with Psychosyd's guitar on the floor of Rizer's room (home-interior.js); ○ / E there takes it.
function takeFloorGuitar() {
  if (hasWeapon('guitar')) return homeInterior.setGuitarTaken(true);
  inventory.owned.push('guitar'); saveInv(); syncWheel(); wheel.render();
  const g = homeInterior.floorGuitar, p = g.getWorldPosition(new THREE.Vector3());
  homeInterior.setGuitarTaken(true);
  fx.emit(p.x, p.y + 0.3, p.z, 18, { color: '#ff3b3b', speed: 2.2, up: 1.2, size: 0.35, life: 0.5, g: 0 });
  showToast("Psychosyd's Signed Red Guitar · R1 to equip, □ to play", 3600);
}
function toggleGuitar() { if (jam) stopJam(); else startJam(); }
function startJam() {
  const A = rizer.actor;
  if (rizer.weapon !== 'guitar' || !A?.has('guitarPlay') || rizer.flying || !rizer.onGround || rizer.swimW > 0.5 || rizer.attack || rizer.dodgeT > 0 || rizer.hp <= 0 || rizer.pick || rizer.vault || rizer.ledge) return;
  rizer.finishSwap(0.05); rizer.swordAt = 'hand'; rizer.handWeapon = 'guitar'; rizer.vel.set(0, 0, 0);
  A.release('emote'); A.play('guitarPlay', 1, { loop: true });
  sfx.unlock(); const song = sfx.track('solo');
  jam = { t: 0, dur: song?.duration || 35, song };
  music.duck(GUITAR.duck); seers?.setMusic({ x: rizer.position.x, z: rizer.position.z, r: GUITAR.radius });
  showToast("♪ Psychosyd's solo · for one song, nobody in earshot is at war");
  fx.emit(rizer.position.x, rizer.position.y + 1.3, rizer.position.z, 14, { color: '#ff5a5a', speed: 1.6, up: 1.4, size: 0.3, life: 0.6, g: -0.5 });
}
function stopJam(why) {
  if (!jam) return; jam.song?.stop(); jam = null;
  if (rizer.actor?.shot?.kind === 'guitarPlay') rizer.actor.release('guitarPlay', 0.25);
  music.duck(1); seers?.setMusic(null);
  if (why) showToast(why);
}
function updateJam(dt, moving) {
  if (!jam) return;
  jam.t += dt;
  if (jam.t >= jam.dur) return stopJam('The solo rings out · the dancers come to their senses');
  if (rizer.weapon !== 'guitar' || moving || rizer.attack || rizer.hurtT > 0 || !rizer.onGround || rizer.flying || rizer.dodgeT > 0 || rizer.hp <= 0 || homeMode || rizer.actor?.shot?.kind !== 'guitarPlay') return stopJam();
  rizer.astralEnergy = Math.min(rizer.maxAstralEnergy, rizer.astralEnergy + GUITAR.astralRate * dt);
  seers?.setMusic({ x: rizer.position.x, z: rizer.position.z, r: GUITAR.radius });
  if (Math.random() < dt * 5) { const q = rizer.position; fx.emit(q.x + (Math.random() - 0.5) * 0.8, q.y + 1.2 + Math.random() * 0.6, q.z + (Math.random() - 0.5) * 0.8, 1, { color: Math.random() < 0.5 ? '#ff5a5a' : '#ffd98a', speed: 0.5, up: 1.4, size: 0.2, life: 0.9, g: -0.8 }); } // notes in the air
}

// Stargazer Telescope, on □ with it drawn: Rizer plays Crafting and the telescope assembles in front of him (tripod, then
// hub, then tube unfolding up to its angle). It stays set up in the overworld (saved in inventory.scope). ○ / E beside it
// packs it away again, and □ near it does the same. Moving, jumping, taking a hit or switching weapons cancels a build.
let scopeBuild = null; // { t, dur, x, y, z, f, mesh }
let scopeSet = null;   // { mesh, x, y, z, f, spot, packT }
const scopeEase = v => { v = Math.min(1, Math.max(0, v)); return v * v * (3 - 2 * v); };
function scopeStages(m, p) { // p 0 → 1: legs open from the ground, the hub pops on, the tube swings up and out
  const U = m.userData, a = scopeEase(p / 0.4), b = scopeEase((p - 0.3) / 0.2), c = scopeEase((p - 0.45) / 0.55);
  U.legs.visible = a > 0; U.legs.scale.setScalar(Math.max(a, 0.001));
  U.hub.visible = b > 0; U.hub.scale.setScalar(Math.max(b, 0.001));
  U.tube.visible = c > 0; U.tube.scale.setScalar(Math.max(c, 0.001)); U.tube.rotation.x = U.tube.userData.tilt * (0.25 + 0.75 * c);
}
function scopeSparks(x, y, z, n = 1) { for (let i = 0; i < n; i++) fx.emit(x + (Math.random() - 0.5) * 0.7, y + 0.2 + Math.random() * 1.1, z + (Math.random() - 0.5) * 0.7, 1, { color: Math.random() < 0.5 ? '#8fd0ff' : '#ffd98a', speed: 0.5, up: 0.9, size: 0.22, life: 0.55, g: -0.2 }); }
function scopeInteractable(S) {
  S.spot = { id: 'stargazer-deployed', kind: 'scope', discover: false, reach: 3.2, name: 'Use Stargazer Telescope', x: S.x, z: S.z, cx: S.x, cz: S.z };
  world.interactables.push(S.spot);
}
function toggleScope() {
  if (scopeBuild || scopeView) return;
  if (scopeSet) {
    if (scopeSet.packT != null) return;
    if (Math.hypot(scopeSet.x - rizer.position.x, scopeSet.z - rizer.position.z) < 4) packScope();
    else showToast('Stargazer Telescope is set up nearby · ○ / E beside it to look through it · □ beside it packs it away');
    return;
  }
  startScope();
}
function startScope() {
  const A = rizer.actor;
  if (rizer.weapon !== 'telescope' || !A?.has('craft') || rizer.flying || !rizer.onGround || rizer.swimW > 0.5 || rizer.attack || rizer.dodgeT > 0 || rizer.hp <= 0 || rizer.pick || rizer.rpick || rizer.vault || rizer.ledge || jam || homeMode) return;
  const f = rizer.facing, x = rizer.position.x + Math.sin(f) * 1.7, z = rizer.position.z + Math.cos(f) * 1.7, y = world.groundAt(x, z);
  if (world.resolve(new THREE.Vector3(x, y, z), 0.7) || world.waterAt(x, z) >= world.heightAt(x, z) - 0.2) { showToast('No room to set up here · find open, dry ground'); return; }
  rizer.finishSwap(0.05); rizer.vel.set(0, 0, 0);
  A.release('emote'); A.play('craft', 1);
  const mesh = buildTelescope(); mesh.position.set(x, y, z); mesh.rotation.y = f; scene.add(mesh); scopeStages(mesh, 0);
  scopeBuild = { t: 0, dur: A.acts.craft.getClip().duration, x, y, z, f, mesh };
  held.hidden.add('telescope');
  showToast('Setting up the Stargazer Telescope…');
}
function cancelScope(why) {
  const S = scopeBuild; if (!S) return;
  scene.remove(S.mesh); scopeBuild = null; held.hidden.delete('telescope');
  if (rizer.actor?.shot?.kind === 'craft') rizer.actor.release('craft', 0.2);
  if (why) showToast(why);
}
function finishScope() {
  const S = scopeBuild; scopeBuild = null; scopeStages(S.mesh, 1);
  scopeSet = { mesh: S.mesh, x: S.x, y: S.y, z: S.z, f: S.f, packT: null }; scopeInteractable(scopeSet);
  inventory.scope = { x: S.x, z: S.z, f: S.f }; saveInv();
  fx.emit(S.x, S.y + 0.9, S.z, 22, { color: '#8fd0ff', speed: 2, up: 1.4, size: 0.3, life: 0.6, g: 0 });
  hud.banner('SET UP · STARGAZER', 'Stargazer Telescope'); showToast('Stargazer Telescope set up · ○ / E to look through it · □ beside it packs it away');
}
function packScope() {
  const S = scopeSet; if (!S || S.packT != null) return;
  rizer.pickUp({ x: S.x, y: S.y + 0.6, z: S.z }, () => { if (scopeSet === S) S.packT = 0; }, 'pickup');
}
function restoreScope() {
  const s = inventory.scope; if (!s || !inventory.owned.includes('telescope')) return;
  const y = world.groundAt(s.x, s.z), mesh = buildTelescope(); mesh.position.set(s.x, y, s.z); mesh.rotation.y = s.f; scene.add(mesh); scopeStages(mesh, 1);
  scopeSet = { mesh, x: s.x, y, z: s.z, f: s.f, packT: null }; scopeInteractable(scopeSet); held.hidden.add('telescope');
}
function updateScope(dt, moving) {
  const P = scopeSet;
  if (P && P.packT != null) { // folding away: the stages run backwards, then it's back in the pack
    P.packT += dt / 0.7; scopeStages(P.mesh, 1 - P.packT); scopeSparks(P.x, P.y, P.z, Math.random() < dt * 20 ? 1 : 0);
    if (P.packT >= 1) {
      scene.remove(P.mesh); const i = world.interactables.indexOf(P.spot); if (i >= 0) world.interactables.splice(i, 1);
      scopeSet = null; inventory.scope = null; saveInv(); held.hidden.delete('telescope'); showToast('Stargazer Telescope packed away · □ to set it up again');
    }
  }
  const S = scopeBuild; if (!S) return;
  S.t += dt;
  const A = rizer.actor, ended = S.t >= S.dur - 0.05;
  if (!ended && (rizer.weapon !== 'telescope' || moving || rizer.hurtT > 0 || !rizer.onGround || rizer.flying || rizer.dodgeT > 0 || rizer.hp <= 0 || homeMode || (S.t > 0.2 && A?.shot?.kind !== 'craft'))) return cancelScope('Setup interrupted');
  rizer.vel.set(0, 0, 0);
  const p = (S.t - S.dur * 0.2) / (S.dur * 0.7);
  scopeStages(S.mesh, Math.min(1, Math.max(0, p)));
  if (p > 0 && p < 1) scopeSparks(S.x, S.y, S.z, Math.random() < dt * 14 ? 1 : 0);
  if (ended) finishScope();
}

// Looking through the Telescope: ○ / E beside the set-up telescope. Rizer steps to the eyepiece, the camera pushes into
// it and the view goes dark, then Astragraphy (astragraphy.js) shows the Aethryx Expanse. Rizer never moves: backing
// out of the Expanse pulls the camera back to where he stands. The world is paused while he looks.
let astro = null, astroLog = null, scopeView = null; // scopeView: { phase: 'in' | 'open' | 'out', k, eye, look, fov, dark }
function useScope() {
  const S = scopeSet; if (!S || S.packT != null || scopeView || scopeBuild) return;
  const stand = { x: S.x - Math.sin(S.f) * 1.0, z: S.z - Math.cos(S.f) * 1.0 };
  rizer.walkTo(stand, S.f, () => {
    if (scopeSet !== S || S.packT != null || scopeView) return;
    S.mesh.updateMatrixWorld(true);
    const tube = S.mesh.userData.tube, eye = tube.localToWorld(new THREE.Vector3(0, -0.3, 0)), far = tube.localToWorld(new THREE.Vector3(0, 6, 0));
    scopeView = { phase: 'in', k: 0, eye, look: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(eye, far, camera.up)), fov: camera.fov, dark: false };
    astroLog ||= createAstragraphyLog(inventory, saveInv);
    astro ||= createAstragraphy({ host: $('#game'), renderer, log: astroLog, toast: showToast,
      onExit: () => { if (scopeView) { scopeView.phase = 'out'; scopeView.k = 1; $('#game').classList.add('astro-open'); last = performance.now(); } } });
    keys.clear(); pressed.clear(); if (document.pointerLockElement) document.exitPointerLock();
    $('#game').classList.add('astro-open'); rizer.vel.set(0, 0, 0);
  }, { around: { x: S.x, z: S.z, r: 0.6 } });
}
function scopeCamera(dt) { // runs after the follow camera has placed itself: blends from there to the eyepiece and back
  const V = scopeView; if (!V || V.phase === 'open') return;
  V.k = Math.min(1, Math.max(0, V.k + (V.phase === 'in' ? dt / 1.0 : -dt / 0.9)));
  const e = scopeEase(V.k);
  camera.position.lerp(V.eye, e); camera.quaternion.slerp(V.look, e);
  camera.fov = V.fov + (26 - V.fov) * e; camera.updateProjectionMatrix();
  rizer.obj.visible = V.k < 0.45;
  if (V.phase === 'in') { if (V.k > 0.6 && !V.dark) { V.dark = true; astro.shutter(true); } if (V.k >= 1) { V.phase = 'open'; astro.open(); } }
  else { if (V.k < 0.8 && V.dark) { V.dark = false; astro.shutter(false); }
    if (V.k <= 0) { scopeView = null; camera.fov = V.fov; camera.updateProjectionMatrix(); rizer.obj.visible = true; $('#game').classList.remove('astro-open'); keys.clear(); pressed.clear(); } }
}

// ── Resources: Scrap Metal (resources.js). Piles lie in the world; a destroyed tech body is a wreck Rizer can strike
// to knock its scrap loose. Picking a pile up adds its quantity to the one stack in the bag. No RXP, no currency. ──
let resources = null;
function takeResource(p) {
  if (inventory.zycube) return showToast('No Zycube · nowhere to carry loot · find your Zycube (AV)');
  if (!canCarry(p.resourceId, p.quantity)) return;
  const got = resources?.take(p); if (!got) return;
  const total = addResource(got.resourceId, got.quantity), name = RESOURCES[got.resourceId].name.toUpperCase();
  fx.emit(p.x, p.y + 0.2, p.z, 8, { color: '#d8c4a0', speed: 1.4, up: 1, size: 0.16, life: 0.35 });
  sfx.play('light', 0.5, 0.62); sfx.play('land', 0.25, 1.5); // compact and metallic
  showToast(`+${got.quantity} ${name} · ${total} carried`);
}
// Fresh Wood: run over the lengths of a felled tree before they sink back into the soil (no button, like coins).
// Everstone the same way: run over the larger rubble of a smashed stone before it sinks (bushes give Fresh Wood too).
function freshWoodTick() {
  if (homeMode || !rizer || rizer.hp <= 0 || rizer.flying || ufoPilot || inventory.zycube) return;
  const N = world.nature?.userData, p = rizer.position;
  const room = id => { const c = storage.canStore('ZYCUBE', id, 1); return c.ok || c.reason === 'DUPLICATE' || c.reason === 'UNKNOWN_ITEM'; }; // no room: it stays where it lies
  const gather = (id, got, color, name, sound) => {
    if (!got?.length) return;
    const total = addResource(id, got.length);
    for (const g of got) fx.emit(g.x, g.y + 0.2, g.z, 7, { color, speed: 1.3, up: 1.2, size: 0.16, life: 0.35 });
    sound(); showToast(`+${got.length} ${name} · ${total} carried`);
  };
  if (N?.trees?.collectWood && room('fresh_wood')) gather('fresh_wood', N.trees.collectWood(p.x, p.y, p.z, 0.9), '#e2c08a', 'FRESH WOOD', () => { sfx.play('land', 0.4, 1.25); sfx.play('light', 0.3, 0.7); });
  if (N?.stones?.collectStone && room('everstone')) gather('everstone', N.stones.collectStone(p.x, p.y, p.z, 0.9), '#cfcac0', 'EVERSTONE', () => { sfx.play('land', 0.5, 0.8); sfx.play('light', 0.3, 0.55); });
}
function resourceEvent(type, w, n) {
  if (type === 'salvage') { sfx.play('medium', 0.7, 0.75); cam.kick(0.35); showToast(w.left > 0 ? `SALVAGE · ${RESOURCES[w.S.resourceId].name} ×${n} knocked loose` : `SALVAGE · wreck stripped · ${RESOURCES[w.S.resourceId].name} ×${n}`); }
  else if (type === 'landed') sfx.play('land', 0.25, 1.3);
}

// ── Thardin Blaster Rifle in Rizer's hands, and the Nova Guardians that carry it (thardin-rifle.js · nova.js) ──
// □ shoulders the rifle and fires; holding □ keeps firing. The bolt leaves the rifle's own muzzle and flies at the
// locked target, or the enemy he faces, or straight ahead. One weapon definition: THARDIN_BLASTER_RIFLE.
let rifleUp = 0, rifleCool = 0, rifleK = 0, rifleKick = 0;
const blasterReady = () => !!bolts && rizer.weapon === 'blaster' && !rizer.flying && !astralboard?.active && !rizer.attack && rizer.dodgeT <= 0 && !rizer.pick && !rizer.rpick && !rizer.bail && rizer.hp > 0 && rizer.swimW < 0.5 && !zy.isOpen && !homeMode && !ufoPilot && !scopeView && !(koT > 0);
function blasterTarget() {
  const t = bowTarget(); if (t) return t;
  let best = null, distance = THARDIN_BLASTER_RIFLE.effectiveRange;
  for (const o of techBodies() || []) { if (!o.alive) continue; const dx = o.pos.x - rizer.position.x, dz = o.pos.z - rizer.position.z, d = Math.hypot(dx, dz), a = Math.atan2(dx, dz) - rizer.facing; if (d < distance && Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.38) { best = o; distance = d; } }
  return best;
}
const _rf = [new THREE.Vector3(), new THREE.Vector3()];
function updateBlaster(dt, held) {
  const R = THARDIN_BLASTER_RIFLE, mesh = held_().meshes.blaster;
  rifleCool = Math.max(0, rifleCool - dt); rifleKick = Math.max(0, rifleKick - dt);
  if (!blasterReady()) rifleUp = 0; else if (held) rifleUp = R.lower; else rifleUp = Math.max(0, rifleUp - dt);
  rifleK += ((rifleUp > 0 ? 1 : 0) - rifleK) * Math.min(1, dt * (rifleUp > 0 ? 1.6 / R.raise : 7));
  if (rifleUp <= 0) return;
  // Locked on: he always faces the lock while aiming or firing (never a turned back), and a bolt only leaves once he's squared up to it.
  const lk = astral.lock, lp = lk && lk.kind !== 'chest' && lk.alive?.() !== false ? lk.pos() : null;
  const tg = lp ? { pos: lp, aimY: 1.25 } : blasterTarget();
  let aimErr = 0;
  if (tg) {
    const a = Math.atan2(tg.pos.x - rizer.position.x, tg.pos.z - rizer.position.z) - rizer.facing, e = Math.atan2(Math.sin(a), Math.cos(a));
    rizer.facing += (lp && Math.abs(e) > 1.0 ? e : e * Math.min(1, dt * (lp ? 22 : 14))); // turned away: swing straight round to it
    aimErr = Math.abs(e) - Math.abs(e) * Math.min(1, dt * 22);
    if (lp) aimErr = Math.abs(Math.atan2(Math.sin(Math.atan2(tg.pos.x - rizer.position.x, tg.pos.z - rizer.position.z) - rizer.facing), Math.cos(Math.atan2(tg.pos.x - rizer.position.x, tg.pos.z - rizer.position.z) - rizer.facing)));
  } // he turns onto what he's shooting at
  mesh.userData.charge?.(rifleCool > 0 ? rifleCool / R.fireInterval : held ? 0.5 : 0.15);
  if (!held || rifleK < 0.85 || rifleCool > 0 || !mesh.parent || rizer.swap || (lp && aimErr > 0.28)) return;
  const from = muzzleOf(mesh, _rf[0]), f = rizer.facing;
  if (tg) _rf[1].set(tg.pos.x, tg.pos.y + (tg.aimY ?? 1.25), tg.pos.z).sub(from).normalize(); else _rf[1].set(Math.sin(f), 0, Math.cos(f));
  bolts.fire(from, _rf[1], { owner: rizer, hostile: false });
  rifleCool = R.fireInterval; rifleKick = 0.1; cam.kick(0.12);
  if (rizer.actor?.has('rifleFire') && !rizer.attack) rizer.actor.play('rifleFire', 1, { overlay: rizer.speed > 1.4 }); // Firing Rifle: one recoil per bolt
}
const held_ = () => held;
function boltEvent(type, d) {
  if (homeMode) return; const A = THARDIN_BLASTER_RIFLE.audio, p = type === 'fire' ? d.from : d.at, near = Math.hypot(p.x - rizer.position.x, p.z - rizer.position.z);
  if (near < 60) sfx.play(...(type === 'fire' ? A.fire : A.impact));
}
const boltCtx = {
  get rizer() { return rizer; }, rizerRig: () => seers?.rizerRig, touch, get seers() { return seers; }, bodies: () => techBodies() || [],
  onPlayerHit: (owner, at, dmg) => onPlayerHit('kick', owner, at, dmg),
  onLanded: res => { if (res?.down) showToast(res.scanobot ? downToast(res) : `${res.name || 'Seer grunt'} falls`); }
};
function novaEvent(type, g) {
  if (type === 'defeated') resources?.wreck(g, 'nova');
  if (homeMode || !g) return; const near = Math.hypot(g.pos.x - rizer.position.x, g.pos.z - rizer.position.z);
  if (type === 'alert' && near < 50) { sfx.play('medium', 0.6, 0.8); showToast('NOVA GUARDIAN · target acquired'); }
  else if (type === 'telegraph' && near < 50) sfx.play('light', 0.5, 0.5); // the rifle coming up and charging
  else if (type === 'disarmed') { sfx.play('medium', 0.8, 1.3); showToast('NOVA GUARDIAN DISARMED · Thardin Blaster Rifle dropped'); }
}
// Rizer takes a rifle a Guardian dropped: the world object goes into the same weapon inventory as everything else.
function takeWeaponDrop(d) {
  if (inventory.zycube) return showToast('No Zycube · nowhere to carry it · find your Zycube (AV)');
  if (!canCarry(d.weapon)) return; // a full Zycube leaves the rifle on the ground
  const k = novas?.take(d); if (!k) return;
  const had = hasWeapon(k), W8 = WEAPONS[k];
  if (!had) inventory.owned.push(k); saveInv(); syncWheel(); wheel.render();
  sfx.play('land', 0.4, 1.4); fx.emit(d.x, d.y + 0.3, d.z, 14, { color: '#ffb347', speed: 2, up: 1.2, size: 0.3, life: 0.5, g: 0 });
  if (had) return showToast(`${W8.name} · already owned`);
  hud.banner(W8.banner || 'WEAPON', W8.name); showToast(inventory.wheel.includes(k) ? `${W8.name} acquired · R1 / L1 to draw · □ fires` : `${W8.name} acquired · in the Zycube · put it on the weapon wheel (Zyphone → Gear)`);
}

// Pearlbow of Ivirium, on □. A tap plays the whole shot: Draw Arrow (reach back, load, raise to full draw) then
// Shoot Bow (loose + follow-through). Holding □ stops at full draw and plays Aim Bow (Aim Bow Walking on the move)
// until □ is let go; the longer he holds at full draw, the harder the arrow flies (BOW.fullHold s for full power).
// Shoot Bow ends in Draw Arrow's first pose, so pressing again (during the shot or after) loops straight into the next draw.
const BOW = { draw: 1.35, shoot: 1.15, looseAt: 0.1, nockFrom: 0.5, fullHold: 1.6 }; // clip speeds, loose frame (s into Shoot Bow), arrow on the string from (s into Draw Arrow)
let bow = null; // { phase: 'draw' | 'aim' | 'shoot', t, dur, held, holdT, target, again, fired, aimSlot }
const bowReady = () => !!bowProjectiles && rizer.weapon === 'bow' && !rizer.flying && !astralboard?.active && rizer.dodgeT <= 0 && !rizer.pick && !rizer.bail && rizer.hp > 0 && !zy.isOpen && !homeMode && !ufoPilot && !(koT > 0);
const bowAlive = g => !!g && (g.isScanobot ? g.alive : seers.alive(g)); // a Seer/Mori grunt or a Scanobot
function bowTarget() {
  if (astral.lock?.kind === 'enemy' && seers.alive(astral.lock.ref)) return astral.lock.ref;
  if (astral.lock?.kind === 'scanobot' && astral.lock.ref.alive) return astral.lock.ref;
  let best = null, distance = 55;
  for (const g of seers.grunts) {
    if (!seers.alive(g)) continue;
    const dx = g.pos.x - rizer.position.x, dz = g.pos.z - rizer.position.z, d = Math.hypot(dx, dz);
    const angle = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - rizer.facing), Math.cos(Math.atan2(dx, dz) - rizer.facing)));
    if (d < distance && angle < 0.38) { best = g; distance = d; }
  }
  return best;
}
const bowPlay = (slot, speed, opts = {}) => rizer.actor?.play(slot, speed, { overlay: rizer.speed > 0.6 && slot !== 'bowAimWalk', ...opts }); // standing: the full pose; on the move it rides over the walk
function firePearlbow() { // □ pressed
  if (!bowReady()) return;
  if (bow) { if (bow.phase === 'shoot') bow.again = true; return; } // queue the next arrow
  startBowDraw();
}
function startBowDraw() {
  rizer.finishSwap(0.08); rizer.swordAt = 'hand'; rizer.handWeapon = 'bow';
  const clip = rizer.actor?.acts.bowDraw?.getClip().duration || 1.03;
  bow = { phase: 'draw', t: 0, dur: clip / BOW.draw, held: true, holdT: 0, target: bowTarget(), again: false, fired: false, aimSlot: null };
  bowPlay('bowDraw', BOW.draw, { hold: true });
}
function bowFace() { const g = bow.target; if (bowAlive(g)) rizer.facing = Math.atan2(g.pos.x - rizer.position.x, g.pos.z - rizer.position.z); }
const bowPower = () => Math.min(1, Math.max(0, bow.holdT / BOW.fullHold));
function looseBow() {
  bow.power = bowPower(); bow.phase = 'shoot'; bow.t = 0; bow.fired = false;
  bow.dur = (rizer.actor?.acts.bowShoot?.getClip().duration || 0.6) / BOW.shoot;
  bowPlay('bowShoot', BOW.shoot);
}
const _bw = [new THREE.Vector3(), new THREE.Vector3()];
function updateBow(dt, held) {
  if (!bow) { bowProjectiles?.nock(null); return; }
  const A = rizer.actor;
  if (!bowReady() || rizer.attack || rizer.hurtT > 0 || (A?.shot ? !/^bow/.test(A.shot.kind) : bow.phase !== 'shoot')) { // interrupted (hit, dodge, weapon swap, took off…)
    if (/^bow/.test(A?.shot?.kind || '')) A.release(A.shot.kind, 0.15);
    bow = null; bowProjectiles?.nock(null); return;
  }
  bow.t += dt; if (!held) bow.held = false;
  if (bow.target && !bowAlive(bow.target)) bow.target = bowTarget();
  bowFace();
  if (bow.phase === 'draw' && bow.t >= bow.dur) { if (bow.held) { bow.phase = 'aim'; bow.t = 0; } else looseBow(); }
  if (bow.phase === 'aim') {
    bow.holdT += dt;
    const slot = rizer.speed > 0.6 && A.has('bowAimWalk') ? 'bowAimWalk' : 'bowAim';
    if (slot !== bow.aimSlot && A.has(slot)) { bowPlay(slot, 1, { loop: true }); bow.aimSlot = slot; }
    const p = bowPower(); // the string hums brighter as the shot charges; a flash at full power
    if (Math.random() < dt * (4 + p * 22)) { const h = A.model.getObjectByName('mixamorigLeftHand')?.getWorldPosition(_bw[0]); if (h) fx.emit(h.x, h.y, h.z, 1, { color: p >= 1 ? '#ffffff' : '#f3ddff', speed: 0.3 + p, up: 0.2, size: 0.1 + p * 0.1, life: 0.3, g: 0 }); }
    if (p >= 1 && !bow.full) { bow.full = true; const h = A.model.getObjectByName('mixamorigLeftHand')?.getWorldPosition(_bw[0]); if (h) fx.emit(h.x, h.y, h.z, 14, { color: '#fff4ff', speed: 1.6, up: 0.4, size: 0.2, life: 0.35, g: 0 }); }
    if (!bow.held) looseBow();
  }
  if (bow.phase === 'shoot') {
    if (!bow.fired && bow.t >= BOW.looseAt / BOW.shoot) {
      bow.fired = true; bowProjectiles?.shoot(rizer, bowAlive(bow.target) ? bow.target : null, bow.power);
      sfx.play('arrow_fire', 0.8 + bow.power * 0.2); sfx.play('whoosh', 0.35 + bow.power * 0.2, 1.08 - bow.power * 0.16); // the arrow leaving the string, with its wind under it
    }
    if (bow.t >= bow.dur) { const again = bow.again || held; bow = null; if (again && bowReady()) startBowDraw(); }
  }
  // the loaded arrow rides on the string from the moment it's drawn from the quiver until the loose
  const loaded = bow && (bow.phase === 'aim' || (bow.phase === 'draw' && bow.t * BOW.draw >= BOW.nockFrom) || (bow.phase === 'shoot' && !bow.fired));
  const rh = loaded && A.model.getObjectByName('mixamorigRightHand'), lh = loaded && A.model.getObjectByName('mixamorigLeftHand');
  if (rh && lh) { A.model.updateMatrixWorld(true); bowProjectiles.nock(rh.getWorldPosition(_bw[0]), lh.getWorldPosition(_bw[1])); } else bowProjectiles?.nock(null);
}

// ── Zyphone: Options + Dev ─────────────────────────────────────────
const SKEY = 'rp7d.settings.v1';
const settings = (() => { try { return { hints: true, minimap: true, coords: true, sens: 1, invertY: false, dev: false, god: false, stats: false, slow: false, devMap: false, ...JSON.parse(localStorage.getItem(SKEY) || '{}') }; } catch (e) { return { hints: true, minimap: true, coords: true, sens: 1, invertY: false, dev: false, god: false, stats: false, slow: false }; } })();
const saveSettings = () => { try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch (e) {} };
const SENS = [0.5, 0.75, 1, 1.35, 1.8];
let resetArmed = 0, fpsAcc = 0, fpsN = 0, fps = 0;
const statsEl = Object.assign(document.createElement('div'), { className: 'devstats', hidden: true }); $('#game').appendChild(statsEl);
// Coordinates panel: live X / Y / Z, facing and region. Click it to copy a ready-to-paste
// placement line for dropping 3D assets, e.g. { x: -33.52, y: 1.20, z: -4.21, facing: 1.19 } // Malezor Square
// (It lives in the minimap's footer now: MHUD · live coordinates.)
const coordsEl = $('#coords');
const coordsText = () => { const p = rizer.position, f = ((rizer.facing % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  return `{ x: ${p.x.toFixed(2)}, y: ${p.y.toFixed(2)}, z: ${p.z.toFixed(2)}, facing: ${f.toFixed(2)} } // ${hud.regionOf(p.x, p.z)}`; };
function copyCoords() {
  if (!rizer) return; const txt = coordsText();
  const done = () => { showToast('Copied · ' + txt.split(' //')[0]); coordsEl.classList.remove('copied'); void coordsEl.offsetWidth; coordsEl.classList.add('copied'); };
  const fallback = () => { const ta = Object.assign(document.createElement('textarea'), { value: txt }); ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done(); };
  try { navigator.clipboard?.writeText ? navigator.clipboard.writeText(txt).then(done, fallback) : fallback(); } catch (e) { fallback(); }
  console.log('[RP7D coords]', txt);
}
coordsEl.addEventListener('mousedown', e => e.stopPropagation());
coordsEl.addEventListener('click', e => { e.stopPropagation(); copyCoords(); });
let coordsAcc = 0;
function coordsTick(dt) {
  if (coordsEl.hidden || !rizer) return; coordsAcc += dt; if (coordsAcc < 0.1) return; coordsAcc = 0;
  const p = rizer.position, deg = Math.round(((rizer.facing * 180 / Math.PI) % 360 + 360) % 360);
  const tile = W.tileScale ? ` · TILE (${Math.round(p.x / W.tileScale + 61)}, ${Math.round(p.z / W.tileScale + 94)})` : '';
  $('#coords-xyz').textContent = `X ${p.x.toFixed(1)} · Y ${p.y.toFixed(1)} · Z ${p.z.toFixed(1)}`;
  $('#coords-sub').textContent = `FACING ${deg}°${tile}`;
  hud.setWallet(inventory);
  // RHUD name plate + the player's astral colour runs through every panel (--astral)
  const nm = (rizer.C?.name || 'Rizer').toUpperCase(); if ($('#rhud-name').textContent !== nm) $('#rhud-name').textContent = nm;
  const astralHex = rizer.C?.astral === 'green' ? '#39e86a' : '#39b8ff';
  if (document.documentElement.style.getPropertyValue('--astral') !== astralHex) { document.documentElement.style.setProperty('--astral', astralHex); document.documentElement.style.setProperty('--gem-hue', rizer.C?.astral === 'green' ? '-68deg' : '0deg'); }
}
function applySettings() {
  $('.hud-bottom').style.display = settings.hints ? '' : 'none';
  $('#mini-map').style.display = settings.minimap ? '' : 'none';
  if (rizer) rizer.god = settings.dev && settings.god;
  statsEl.hidden = !(settings.dev && settings.stats);
  coordsEl.hidden = !settings.coords;
  $('#dev-strip').hidden = !settings.dev;
}
const onOff = v => v ? 'ON' : 'OFF';
function optionsMenu() {
  return [
    { head: 'CAMERA' },
    { act: 'sens', label: 'Look sensitivity', value: `${settings.sens}×` },
    { act: 'invert', label: 'Invert camera up / down', value: onOff(settings.invertY) },
    { head: 'SCREEN' },
    { act: 'focus', label: 'FocusLock', note: 'On: a fight locks the nearest enemy automatically. Off: every lock-on is manual. Hold R3 to switch.', value: onOff(settings.focus !== false) },
    { act: 'hints', label: 'Button hints', value: onOff(settings.hints) },
    { act: 'minimap', label: 'Minimap', value: onOff(settings.minimap) },
    { act: 'coords', label: 'Coordinates panel', note: 'Click the panel to copy your position for placing 3D assets.', value: onOff(settings.coords) },
    { head: 'SOUND' },
    { act: 'music', label: 'Music', note: musicNote(), value: onOff(!music.getState().muted) },
    { act: 'musicvol', label: 'Music volume', value: `${Math.round(music.getState().volume * 100)}%` },
    { act: 'sfx', label: 'Sound effects', note: 'Footsteps, hits, whiffs and landings.', value: onOff(!sfx.getState().muted) },
    { act: 'sfxvol', label: 'Effects volume', value: `${Math.round(sfx.getState().volume * 100)}%` },
    { head: 'GAME' },
    { act: 'reset', label: resetArmed > 0 ? 'Press again to reset' : 'Reset game', note: 'Starts Malezor over: closes the chest, takes the sword back, forgets places found. Settings and Anim Lab work are kept.', value: resetArmed > 0 ? 'CONFIRM' : 'RESET', danger: true }
  ];
}
function devMenu() {
  const rows = [{ act: 'dev', label: 'Dev mode', note: 'Unlocks the tools below.', value: onOff(settings.dev), on: settings.dev }];
  if (!settings.dev) return rows;
  rows.push(
    { head: 'PLAYER' },
    { act: 'god', label: 'God mode (HP · STM · AE never drop)', value: onOff(settings.god) },
    { act: 'heal', label: 'Heal to full', value: 'GO' },
    { act: 'sword', label: 'Give the Tearsword of Azurel', value: hasWeapon('sword') ? 'OWNED' : 'GIVE' },
    { act: 'axe', label: 'Give the Jaded Axe of Emeralix', value: hasWeapon('axe') ? 'OWNED' : 'GIVE' },
    { act: 'bow', label: 'Give the Pearlbow of Ivirium', value: hasWeapon('bow') ? 'OWNED' : 'GIVE' },
    { act: 'blaster', label: 'Give the Thardin Blaster Rifle', value: hasWeapon('blaster') ? 'OWNED' : 'GIVE' },
    { act: 'cavenext', label: 'Teleport to the next cave mouth', note: `${CAVES.length} caves · ${CAVES.reduce((n, c) => n + c.floorCount, 0)} floors · next: ${CAVES[(caveTp + 1) % CAVES.length].name}`, value: `${(caveTp + 1) % CAVES.length + 1} / ${CAVES.length}` },
    { act: 'scrap', label: 'Drop a Scrap Metal pile ahead', note: `Carried: ${getResourceCount('scrap_metal')}`, value: '×5' },
    { act: 'zyupgrade', label: 'Upgrade the Zycube', note: `${storage.tier().name} · ${storage.slotsUsed('ZYCUBE')} / ${storage.capacity()} slots`, value: storage.nextTier() ? 'UPGRADE' : 'MAX' },
    { act: 'scrap15', label: 'Give 15 Scrap Metal (to the Zycube)', note: `Zycube: ${storage.count('ZYCUBE', 'scrap_metal')} · Home PC: ${storage.count('HOME_PC', 'scrap_metal')}`, value: '×15' },
    { act: 'zyfill', label: 'Fill the Zycube (capacity test)', note: 'Adds filler fruit until full. Pick up loot to see the capacity message.', value: 'FILL' },
    { act: 'zyclear', label: 'Clear the test filler', value: 'CLEAR' },
    { act: 'astragive', label: 'Give 6 of each CREATION Astralite (test)', note: 'Seven Astralites ×6 into the Zycube, for the Astralite Station.', value: 'GIVE' },
    { act: 'nova', label: 'Spawn a Nova Guardian ahead', note: 'Places one 16 units in front of Rizer for testing.', value: 'SPAWN' },
    { act: 'daemon-black', label: 'Spawn a Black Daemon ahead', note: 'Evasive Daemon · tests its dodge and close combat.', value: 'SPAWN' },
    { act: 'daemon-red', label: 'Spawn a Red Daemon ahead', note: 'Larger Daemon · tests its aggressive combo and red fissure glow.', value: 'SPAWN' },
    { act: 'guitar', label: "Give Psychosyd's Signed Red Guitar", value: hasWeapon('guitar') ? 'OWNED' : 'GIVE' },
    { head: 'PROGRESSION' },
    ...[25, 250, 5000, 50000, 1000000].map(n => ({ act: 'rxp:' + n, label: `Award +${n.toLocaleString('en-US')} RXP`, note: n === 25 ? `LVL. ${progression.info.level.toLocaleString('en-US')} · ${progression.xp.toLocaleString('en-US')} lifetime RXP` : undefined, value: 'GIVE' })),
    { act: 'rxpreset', label: 'Reset RXP to 0', value: 'RESET' },
    { head: 'WORLD' },
    { act: 'chest', label: 'Reset the weapon chests', note: 'Closes all four silver chests and returns what was inside.', value: 'RESET' },
    { act: 'seers', label: 'Respawn all Seers', value: 'GO' },
    { act: 'gatesopen', label: 'Open both Portal Gatelocks', note: 'No Portalchips needed. Jump through one to come out of the other.', value: 'GO' },
    { act: 'zyrexoff', label: 'Wild Zyrex', note: 'Off hides every wild Zyrex from the world. Your partner stays.', value: onOff(!settings.zyrexOff) },
    { act: 'zyrex3d', label: 'Zyrex as 3D meshes', note: 'On: the wild Zyrex use their 3D meshes instead of the 2DHD sprites. Species without a mesh of their own get the shared body.', value: onOff(!!settings.zyrex3d) },
    { act: 'slow', label: 'Slow motion (0.3×)', value: onOff(settings.slow) },
    { head: 'DEBUG' },
    { act: 'hitboxes', label: 'Show hitboxes', note: 'Poly-bound capsules on Rizer and nearby Seers. Red = a limb swinging fast enough to hurt.', value: onOff(settings.hitboxes) },
    { act: 'stats', label: 'Stats overlay', note: 'FPS, position, speed, movement state, weapon.', value: onOff(settings.stats) },
    { act: 'lab', label: 'Open the Anim Lab', value: 'L' },
    { act: 'animreset', label: 'Reset Anim Lab assignments', note: 'Back to the shipped clip set.', value: 'RESET' },
    { head: 'TELEPORT' },
    { act: 'devmap', label: 'Dev map', note: 'On the Zyphone map: click anywhere (or steer the cursor with the left stick and press ✕) to teleport Rizer there.', value: onOff(settings.devMap) },
    { act: 'tp:home', label: "Rizer's front door", value: 'GO' },
    { act: 'tp:chest', label: "The Rizer's chest", value: 'GO' },
    ...hud.places.filter(p => p.id !== 'player-home').map(p => ({ act: 'tp:' + p.id, label: p.name, value: 'GO' })),
    { head: 'ZYRAXIS · EMPTY DISTRICTS' },
    ...DISTRICTS.filter(d => !d.built).map(d => ({ act: 'tpd:' + d.id, label: `${d.numeral} · ${d.name}`, note: `${d.land} · empty land at Malezor's scale.`, value: 'GO' }))
  );
  return rows;
}
// Dev map (Dev › Teleport › Dev map): a click on the Zyphone map, or the left-stick cursor + ✕, drops Rizer there.
const devMapOn = () => settings.dev && settings.devMap;
function devMapJump(pt) {
  if (!pt || !devMapOn()) return false;
  if (homeMode || ufoPilot || ufoTransition || koT > 0) { showToast('Dev map · step outside first'); return true; }
  if (!hud.isLand(pt.x, pt.z)) { showToast('Dev map · no land there'); return true; }
  zy.close(); teleport(pt.x, pt.z); rizer.onGround = true; rizer.bail = null; rizer.seq = null; hud.mapCursor = null;
  showToast(`Dev map · teleported to ${pt.x.toFixed(0)}, ${pt.z.toFixed(0)}`); return true;
}
function teleport(x, z) { rizer.position.set(x, world.groundAt(x, z), z); rizer.vel.set(0, 0, 0); rizer.vy = 0; rizer.flying = false; cam.focus.set(x, rizer.position.y + 1.7, z); }
function menuAction(act) {
  if (act !== 'reset') resetArmed = 0;
  if (act === 'sens') settings.sens = SENS[(SENS.indexOf(settings.sens) + 1) % SENS.length];
  if (act === 'invert') settings.invertY = !settings.invertY;
  if (act === 'hints') settings.hints = !settings.hints;
  if (act === 'minimap') settings.minimap = !settings.minimap;
  if (act === 'coords') settings.coords = !settings.coords;
  if (act === 'sfx') { sfx.setMuted(!sfx.getState().muted); sfx.unlock(); }
  if (act === 'sfxvol') { const v = sfx.getState().volume, i = MUSIC_VOLS.findIndex(x => x > v + 1e-3); sfx.setVolume(MUSIC_VOLS[i < 0 ? 0 : i]); if (sfx.getState().muted) sfx.setMuted(false); sfx.unlock(); }
  if (act === 'music') { music.setMuted(!music.getState().muted); music.unlock(); }
  if (act === 'musicvol') { const v = music.getState().volume, i = MUSIC_VOLS.findIndex(x => x > v + 1e-3); music.setVolume(MUSIC_VOLS[i < 0 ? 0 : i]); if (music.getState().muted) music.setMuted(false); music.unlock(); }
  if (act === 'reset') {
    if (resetArmed <= 0) { resetArmed = 4; return; }
    try { localStorage.removeItem('rp7d.inventory.v1'); } catch (e) {}
    location.reload(); return;
  }
  if (act === 'dev') settings.dev = !settings.dev;
  if (act === 'god') settings.god = !settings.god;
  if (act === 'slow') settings.slow = !settings.slow;
  if (act === 'zyrexoff') { settings.zyrexOff = !settings.zyrexOff; spawnZyrex(); showToast(settings.zyrexOff ? 'Wild Zyrex hidden' : `Wild Zyrex back · ${zyrex.length}`); }
  if (act === 'zyrex3d') { settings.zyrex3d = !settings.zyrex3d; spawnZyrex(); showToast(settings.zyrex3d ? 'Wild Zyrex · 3D meshes' : 'Wild Zyrex · 2DHD sprites'); }
  if (act === 'focus') toggleFocus();
  if (act === 'dev' && (settings.zyrexOff || settings.zyrex3d)) later(0, () => spawnZyrex()); // those two only apply in dev mode
  if (act === 'devmap') settings.devMap = !settings.devMap;
  if (act === 'stats') settings.stats = !settings.stats;
  if (act === 'hitboxes') settings.hitboxes = !settings.hitboxes;
  if (act === 'heal') rizer.heal();
  if (act.startsWith('rxp:') && !awardRizerXP(Number(act.slice(4)), 'dev')) showToast('RXP is locked until Rizer first steps into the overworld');
  if (act === 'rxpreset') progression.set(0);
  if (act === 'sword' && !hasWeapon('sword')) { inventory.owned.push('sword'); inventory.chestOpen = true; saveInv(); syncWheel(); wheel.render(); showToast('Tearsword of Azurel added · R1 to draw'); }
  if (act === 'axe' && !hasWeapon('axe')) { inventory.owned.push('axe'); (inventory.chests ||= {})['emeralix-chest'] = 1; saveInv(); syncWheel(); wheel.render(); showToast('Jaded Axe of Emeralix added · R1 to draw'); }
  if (act === 'bow' && !hasWeapon('bow')) { inventory.owned.push('bow'); (inventory.chests ||= {})['ivirium-chest'] = 1; saveInv(); syncWheel(); wheel.render(); showToast('Pearlbow of Ivirium added · R1 to draw'); }
  if (act === 'blaster' && !hasWeapon('blaster')) { inventory.owned.push('blaster'); saveInv(); syncWheel(); wheel.render(); showToast('Thardin Blaster Rifle added · R1 to draw, □ to fire'); }
  if (act === 'cavenext' && !homeMode) { if (caveMode) exitCave(true); caveTp = (caveTp + 1) % CAVES.length; const f = caveFormation(CAVES[caveTp].id); if (f) { const out = { x: f.stand.x + Math.sin(f.face) * 5, z: f.stand.z + Math.cos(f.face) * 5 }; rizer.position.set(out.x, world.groundAt(out.x, out.z), out.z); rizer.facing = f.face + Math.PI; rizer.vel.set(0, 0, 0); cam.snapBehind(rizer, 7); showToast(`${f.cave.name} · ${f.cave.district || f.cave.districtId} · ✕ at the mouth to go in`); } }
  if (act === 'scrap' && resources && !homeMode) { const f = rizer.facing; resources.drop('scrap_metal', 5, rizer.position.x + Math.sin(f) * 2.5, rizer.position.y + 1.2, rizer.position.z + Math.cos(f) * 2.5, { x: Math.sin(f), z: Math.cos(f) }); }
  if (act === 'zyupgrade') { const r = storage.upgradeZycube(); showToast(r.ok ? `Zycube upgraded · ${storage.tier().name} · ${r.slots} slots` : r.message); }
  if (act === 'scrap15') { const r = storage.add('ZYCUBE', 'scrap_metal', 15); showToast(r.ok ? '+15 Scrap Metal · Zycube' : r.message); }
  if (act === 'zyfill') { while (storage.add('ZYCUBE', 'fruit-white', 99).ok); while (storage.add('ZYCUBE', 'fruit-white', 1).ok); showToast(`Zycube full · ${storage.slotsUsed('ZYCUBE')} / ${storage.capacity()} slots`); }
  if (act === 'astragive') { let n = 0; for (let i = 1; i <= 7; i++) if (storage.add('ZYCUBE', `astralite_1_${i}`, 6).ok) n++; showToast(n ? `+6 each of ${n} Astralites` : 'Zycube is full'); }
  if (act === 'zyclear') { storage.remove('ZYCUBE', 'fruit-white', storage.count('ZYCUBE', 'fruit-white')); showToast('Test filler cleared'); }
  if (act === 'nova' && novas && !homeMode) { const f = rizer.facing, x = rizer.position.x + Math.sin(f) * 16, z = rizer.position.z + Math.cos(f) * 16; novas.spawnAt(x, z); showToast('Nova Guardian spawned ahead'); }
  if ((act === 'daemon-black' || act === 'daemon-red') && seers && !homeMode) {
    const f = rizer.facing, x = rizer.position.x + Math.sin(f) * 12, z = rizer.position.z + Math.cos(f) * 12;
    const g = seers.spawnAt(act, x, z);
    showToast(g ? `${g.T.name} spawned ahead` : 'Move to open ground to spawn a Daemon');
  }
  if (act === 'guitar' && !hasWeapon('guitar')) { inventory.owned.push('guitar'); saveInv(); syncWheel(); wheel.render(); homeInterior?.setGuitarTaken(true); showToast("Psychosyd's Signed Red Guitar added · R1 to equip, □ to play"); }
  if (act === 'chest') { inventory.owned = inventory.owned.filter(k => !BLADES[k]); if (inventory.home?.weapons) inventory.home.weapons = inventory.home.weapons.filter(k => !BLADES[k]); inventory.equipped = 'fists'; inventory.chestOpen = false; if (inventory.chests) { delete inventory.chests['emeralix-chest']; delete inventory.chests['ivirium-chest']; delete inventory.chests['psychosyd-chest']; } saveInv(); location.reload(); return; }
  if (act === 'seers') { seers?.respawnAll(); showToast('Seers respawned'); }
  if (act === 'gatesopen') { gatelocks?.openAll(); showToast('Portal Gatelocks open'); }
  if (act === 'lab') { zy.close(); lab.open(); }
  if (act === 'animreset') { resetAssignments(); showToast('Anim Lab assignments reset'); }
  if (act === 'mapview') hud.toggleMapView();
  if (act.startsWith('tpd:')) { // World Expansion 2: drop Rizer in the middle of an empty district
    const d = DISTRICTS.find(q => q.id === act.slice(4));
    if (d && (homeMode || ufoPilot || ufoTransition || koT > 0)) showToast('Step outside first');
    else if (d) { teleport(d.x, d.z); rizer.onGround = true; rizer.bail = null; rizer.seq = null; zy.close(); showToast(`${d.name} · District ${d.numeral} · ${d.land}`); }
  }
  if (act.startsWith('tp:')) {
    const id = act.slice(3), s = W.playerStart;
    if (id === 'home') teleport(s.x, s.z);
    else if (id === 'chest') { const c = loot.spot; teleport(c.cx + 2.2, c.cz + 2.2); }
    else { const p = hud.places.find(q => q.id === id); if (p) teleport(p.x, p.z); }
    zy.close();
  }
  saveSettings(); applySettings();
}
let hbMesh = null;
function hitboxTick() { // Dev → Show hitboxes
  const on = settings.dev && settings.hitboxes && seers;
  if (!on) { if (hbMesh) hbMesh.visible = false; return; }
  if (!hbMesh) { hbMesh = debugMesh(); scene.add(hbMesh); }
  hbMesh.visible = true;
  const caps = [], add = rig => { if (!rig) return; for (const k in rig.parts) { const q = rig.parts[k]; caps.push({ a: q.a, b: q.b, r: q.r, hot: q.vel >= HITBOX.minSpeed && /Hand|ForeArm|Foot|Leg$/.test(k) }); } };
  add(seers.rizerRig); for (const g of seers.grunts) if (!g.rig.fresh) add(g.rig);
  const bl = seerHooks.blade(); if (bl) caps.push({ a: bl.a.clone(), b: bl.b.clone(), r: bl.r ?? 0.05, hot: !!rizer.attack });
  hbMesh.draw(caps);
}
function devTick(dt) {
  if (resetArmed > 0) { resetArmed -= dt; if (resetArmed <= 0 && zy.isOpen && zy.tab === 'options') zy.open('options'); }
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { fps = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
  if (settings.dev && rizer) { // dev strip under the ZHUD, like RP7B's
    const p = rizer.position, K = W.tileScale || 2;
    $('#dev-line-1').textContent = `[ DEV ] TILE (${Math.round(p.x / K + 61)}, ${Math.round(p.z / K + 94)}) · ${homeMode ? 'HOME' : 'OVERWORLD'} · ${fps} FPS`;
    $('#dev-line-2').textContent = usingPad ? 'DUALSENSE · CONNECTED · ○ INTERACT · R2 RUN' : 'KEYBOARD & MOUSE · E INTERACT · SHIFT RUN';
  }
  if (statsEl.hidden) return;
  const p = rizer.position, st = rizer.flying ? 'flying' : rizer.crouched ? 'crouched' : rizer.swimW > 0.5 ? 'swimming' : !rizer.onGround ? 'air' : rizer.dodgeT > 0 ? (rizer.dodgeKind === 'slide' ? 'sliding' : 'rolling') : rizer.attack ? rizer.attack.kind + ' ' + rizer.attack.stage : 'ground';
  statsEl.textContent = `FPS ${fps}\nPOS ${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}\nSPEED ${rizer.speed.toFixed(1)}\nSTATE ${st}\nWEAPON ${rizer.weapon}\nHP ${Math.ceil(rizer.hp)}${rizer.god ? ' (god)' : ''}\nLOCK ${astral.lock ? astral.lock.kind : '-'}\nCLIP ${rizer.actor?.shot?.kind || '-'}`;
}

// Contact combat (seers.js + hitbox.js): Rizer's blows land where the limb or blade touches a Seer.
const _bladeA = new THREE.Vector3(), _bladeB = new THREE.Vector3();
const _frustum = new THREE.Frustum(), _pv = new THREE.Matrix4(), _sph = new THREE.Sphere(new THREE.Vector3(), 2.6);
const seerHooks = {
  inView: pos => { _sph.center.set(pos.x, pos.y + 1.2, pos.z); return _frustum.intersectsSphere(_sph); },
  projectileThreat: g => bowProjectiles?.shots?.find(s => {
    const dx = g.pos.x - s.pos.x, dy = g.pos.y + 1.25 - s.pos.y, dz = g.pos.z - s.pos.z;
    const along = dx * s.dir.x + dy * s.dir.y + dz * s.dir.z;
    return along > 0 && along < 14 && dx * dx + dy * dy + dz * dz - along * along < 1.8 * 1.8;
  }),
  onDaemonAttack: g => fx.emit(g.pos.x, g.pos.y + 1.4, g.pos.z, 9, { color: '#ff2934', speed: 1.8, up: 0.5, size: 0.13, life: 0.3, g: 0 }),
  playerThreat: () => {
    const shot = rizer.actor?.shot?.kind || '';
    const astralCast = /^(blast|astralift|thunder|astralburst|pray)/.test(shot) || !!rizer.prayer || !!rizer.flying || !!astral?.bursting;
    const combat = !!rizer.attack || !!bow;
    const loud = !jam && !rizer.crouched && (rizer.speed > 5.5 || rizer.dodgeT > 0);
    return { astral: astralCast, combat, loud };
  },
  onPlayerHit: (kind, g, at, dmg) => onPlayerHit(kind, g, at, dmg),
  onEnvironmentHit: (segment, at, damage, hitKey) => {
    // every blow that actually touches a stone, a tree or a bush hurts it, by what the blow is worth (no lock needed)
    const handStrike = ['punch', 'runpunch'].includes(at?.kind);
    if (!handStrike || segment.part?.endsWith('Hand')) world.nature?.userData?.breakables?.strike(segment, damage, hitKey);
  },
  onLanded: (h, kind) => {
    lastLanded = elapsed;
    { // impact weight: opening blows are light, the chain builds, finishers and big kicks hit heavy
      const at = rizer.attack, stage = at?.stage || 1, fin = at && stage >= rizer.comboMax(at.kind);
      const w = h.down || fin || at?.od || kind === 'flykick' || kind === 'kickup' ? 'heavy' : kind === 'runpunch' ? 'medium' : kind === 'kick' ? (stage >= 3 ? 'heavy' : 'medium') : kind === 'axe' || kind === 'rubypaw' ? (stage >= 2 ? 'heavy' : 'medium') : kind === 'sword' ? (stage >= 3 ? 'heavy' : 'medium') : stage >= 3 ? 'medium' : 'light';
      // contact sound by what's in hand: the blue Tearsword → light weapon · the red Rubypaw and the green Jaded Axe → heavy weapon · fists and kicks → the body impacts
      if (kind === 'sword') sfx.play('light_weapon', fin || h.down ? 1.15 : 1);
      else if (kind === 'rubypaw' || kind === 'axe') sfx.play('heavy_weapon', fin || h.down ? 1.15 : 1);
      else sfx.play(w);
      rumbleHit(w);
      // melee blows charge astral energy (not Astralstrike blasts or arrows): a small blue spark runs up Rizer
      if (at && !h.ghost && kind !== 'blast' && kind !== 'bow' && rizer.chargeAstral(stage, fin) > 0) { const q = rizer.position; fx.emit(q.x, q.y + 1.2, q.z, 3 + stage, { color: '#8fc6ff', speed: 0.8, up: 1.6, size: 0.16, life: 0.4, g: -1 }); }
    }
    const od = !!rizer.attack?.od; // overdrive finisher (the 4th kick): a bigger burst, a harder shake, a longer freeze
    fx.emit(h.x, h.y, h.z, h.down || od ? 22 : 9, { color: od ? '#9fd4ff' : h.down ? '#c9a0ff' : '#ffe2a8', speed: od ? 5.2 : 3.4, up: od ? 2.2 : 1.4, size: od ? 0.55 : 0.4, life: od ? 0.55 : 0.4 });
    if (od) fx.emit(h.x, h.y, h.z, 14, { color: '#ffffff', speed: 7, up: 1, size: 0.3, life: 0.25, g: 0 });
    cam.kick(od ? 1.1 : kind === 'kick' ? 0.6 : 0.4); hitStop = Math.max(hitStop, od ? 0.13 : kind === 'kick' ? 0.07 : 0.045);
    if (h.down) showToast(h.scanobot ? downToast(h) : `${h.name || 'Seer grunt'} falls · ${seers.defeated} fewer holding Malezor`);
  },
  blade: () => rizer.swordAt === 'hand' ? held?.contact() : null // the drawn weapon as a contact capsule { a, b, r }
};
// Scanobots share Rizer's contact rules and impact feedback with the Seers (scanobots.js).
const scanHooks = {
  rizerRig: () => seers?.rizerRig, inView: seerHooks.inView, blade: seerHooks.blade,
  onLanded: (h, kind) => seerHooks.onLanded(h, kind), onPlayerHit: (kind, g, at, dmg) => onPlayerHit(kind, g, at, dmg),
  lockRef: () => astral?.lock?.kind === 'scanobot' ? astral.lock.ref : null
};
// RXP → the RHUD's Level panel and the "+N RXP" / level-up feedback. The state lives in progression.js; this only shows it.
progression.onChange(r => {
  if (!hud) return;
  hud.setProgress(r.info, r.gained, r.levels);
  if (r.levels > 0) { showToast(`LEVEL UP · LVL. ${r.info.level.toLocaleString('en-US')}`); sfx?.play('lift', 0.6, 1.4); }
});
// Penumbra feedback: a warning before it commits, the launch, and the blast (felt harder the closer it lands).
function penumbraEvent(type, d, kind) {
  if (type === 'destroyed') { awardCombatRXP(d, 'penumbra', kind); resources?.wreck(d, 'penumbra'); }
  if (homeMode) return;
  const near = (x, z) => Math.hypot(x - rizer.position.x, z - rizer.position.z);
  if (type === 'alert') { if (near(d.pos.x, d.pos.z) < 45) { sfx.play('medium', 0.7, 0.55); showToast('PENUMBRA · target acquired'); } }
  else if (type === 'telegraph') { if (near(d.pos.x, d.pos.z) < 45) sfx.play('light', 0.8, 0.6); }
  else if (type === 'rocket') { if (near(d.pos.x, d.pos.z) < 60) sfx.play('land', 0.8, 0.7); }
  else if (type === 'explosion') { const k = Math.max(0, 1 - d.dist / 30); if (k > 0) { sfx.play('heavy', 0.4 + 0.6 * k, 0.6); cam.kick(1.1 * k); if (d.dist < 6) rumbleHit('heavy'); } }
}
// Aerial slam (in the air, locked on an enemy, □): rizer.js dives him onto the target; when he hits the ground the
// target takes the blow and a lightning shockwave blasts back everything around him.
let slamTarget = null;
function tryAirSlam() {
  const lk = astral.lock; if (!lk || homeMode) return false;
  const stone = lk.kind === 'stone' && !lk.ref.broken ? lk.ref : null; // a locked stone: he comes down on it and it shatters
  if (!stone && !isFoeLock(lk)) return false;
  if (!rizer.airSlam(stone ? { x: stone.x, y: stone.y, z: stone.z } : lk.pos(), world, stone ? stone.radius + 0.75 : undefined)) return false;
  slamTarget = lk.ref; sfx.play('blast', 0.5, 1.3); return true;
}
function slamImpact() {
  const S = COMBAT.airslam, c = rizer.position, target = slamTarget; slamTarget = null;
  const stones = world.nature?.userData?.stones, shattered = target && stones?.list.includes(target) && stones.shatter(target, c, 1.9);
  const hits = astral.shockwave(c, seers, { radius: S.radius, damage: S.blast, edgeDamage: S.edge, target, targetDamage: S.damage, others: techBodies() });
  cam.kick(1.5); hitStop = Math.max(hitStop, 0.1); sfx.play('thunder', 0.8); sfx.play('heavy', 0.9); sfx.play('land', 1.15); rumbleHit('thunder');
  fx.emit(c.x, c.y + 0.05, c.z, 14, { speed: 3.5, up: 0.6, size: 0.6 });
  const down = hits.filter(h => h.down), tech = down.find(h => h.scanobot);
  showToast(tech ? downToast(tech) : shattered ? `AERIAL SLAM · ${target.isAstraliteStone ? 'Astralite stone' : 'stone'} shattered` : hits.length ? `AERIAL SLAM · ${hits.length} blasted back${down.length ? ` · ${down.length} down` : ''}` : 'AERIAL SLAM');
}
// A perfect dodge, block or parry stretches the moment: a short slow motion (real seconds), then back to speed.
const PERFECT_SLOW = { time: 0.45, rate: 0.3 };
let slowT = 0;
function perfectDodge() {
  slowT = PERFECT_SLOW.time; const p = rizer.position, aerial = rizer.dodgeKind === 'aerial';
  fx.emit(p.x, p.y + 1.1, p.z, 16, { color: '#bfe6ff', speed: 3.2, up: 1.2, size: 0.26, life: 0.4, g: 0 });
  sfx.play('whoosh', 0.8, 0.62); rumbleHit('light'); showToast(aerial ? 'PERFECT DODGE · the bolt passes under him' : 'PERFECT DODGE');
}
// How long until a hostile bolt reaches Rizer (seconds), or null: rizer.dodge() turns into the Aerial Evade when one is close.
function boltThreat() {
  let best = null; const p = rizer.position, v = THARDIN_BLASTER_RIFLE.projectileSpeed;
  for (const k of bolts?.pool || []) {
    if (!k.live || !k.hostile) continue;
    const rx = p.x - k.pos.x, ry = p.y + 1.1 - k.pos.y, rz = p.z - k.pos.z, along = rx * k.dir.x + ry * k.dir.y + rz * k.dir.z; if (along < 0) continue;
    if (rx * rx + ry * ry + rz * rz - along * along > 1.3 * 1.3) continue; // it is going to miss him anyway
    const t = along / v; if (best == null || t < best) best = t;
  }
  return best;
}
function onPlayerHit(kind, g, at, dmg = 5) {
  if (rizer.lastParried) { // a perfect block: the blow is turned aside and (in reach) the attacker is stunned
    rizer.lastParried = false;
    const hp = at || { x: rizer.position.x, y: rizer.position.y + 1.5, z: rizer.position.z };
    const src = g?.isScanobot ? g.center : g?.pos, near = src && Math.hypot(src.x - rizer.position.x, src.z - rizer.position.z) <= COMBAT.parry.reach;
    const hit = near ? (g.isNova ? novas?.stun(g, rizer.position) : g.isPenumbra ? penumbras?.stun(g, rizer.position) : g.isScanobot ? scanobots?.stun(g, rizer.position) : seers?.stun?.(g, rizer.position)) : null;
    sfx.play('light', 1, 1.7); sfx.play('medium', 0.8, 1.25); rumbleHit('medium'); cam.kick(0.5); hitStop = Math.max(hitStop, 0.09); slowT = PERFECT_SLOW.time; // a perfect block: the moment stretches
    fx.emit(hp.x, hp.y, hp.z, 20, { color: '#fff6d8', speed: 5.5, up: 1.4, size: 0.3, life: 0.35, g: 2 });
    fx.emit(hp.x, hp.y, hp.z, 8, { color: '#8fc6ff', speed: 2.5, up: 1, size: 0.2, life: 0.4, g: 0 });
    showToast(hit ? `PARRY · ${hit.name} stunned` : 'PARRY');
    return;
  }
  if (rizer.lastBlocked) { // glanced off the guard: sparks and a light clack, no hurt flash
    const hp = at || { x: rizer.position.x, y: rizer.position.y + 1.5, z: rizer.position.z }; sfx.play('light', 0.8, 1.3);
    fx.emit(hp.x, hp.y, hp.z, 12, { color: '#fff1c2', speed: 4, up: 1.2, size: 0.25, life: 0.3, g: 3 }); cam.kick(0.25); return;
  }
  sfx.play(dmg >= 10 ? 'heavy' : dmg >= 5.5 ? 'medium' : 'light');
  cam.kick(kind === 'kick' ? 0.75 : 0.55); hitStop = 0.05;
  const hp = at || { x: rizer.position.x, y: rizer.position.y + 1.5, z: rizer.position.z };
  fx.emit(hp.x, hp.y, hp.z, 8, { color: '#ffb36b', speed: 3, up: 1.5, size: 0.35, life: 0.35 });
  const el = $('#hurt'); el.classList.add('show'); clearTimeout(hurtTimer); hurtTimer = setTimeout(() => el.classList.remove('show'), 140);
  if (rizer.hp <= 0) knockOut('Malezor is still theirs tonight', 2.8);
}
// Knocked out: the Zycube (items, coins, gems) drops where he fell, the screen fades, and he walks out of the
// hospital's front door healed — the tail of the door walk (through the doorway, then he pulls it shut).
function knockOut(sub, hold) {
  koT = hold; hud.banner('RIZER FALLS', sub);
  dropZycube(rizer.position);
}
function dropZycube(at) {
  if (homeMode || !zycube) return;
  if (caveMode && caveReturn) at = { x: caveReturn.x, y: world.groundAt(caveReturn.x, caveReturn.z), z: caveReturn.z }; // fell in a cave: it waits at the mouth
  const prev = inventory.zycube, items = { ...(prev?.items || {}) };
  for (const [k, n] of Object.entries(inventory.items || {})) if (n > 0) items[k] = (items[k] || 0) + n;
  const coins = (prev?.coins || 0) + (inventory.coins || 0), gems = (prev?.gems || 0) + (inventory.gems || 0);
  if (!Object.keys(items).length && !coins && !gems && !prev) return; // nothing to lose
  inventory.zycube = { x: at.x, y: at.y, z: at.z, items, coins, gems }; inventory.items = {}; inventory.coins = 0; inventory.gems = 0; saveInv(); hud.setWallet(inventory);
  zycube.show(inventory.zycube);
}
function takeZycube() {
  const Z = inventory.zycube; if (!Z) return;
  const m = inventory.items ||= {}; for (const [k, n] of Object.entries(Z.items || {})) m[k] = (m[k] || 0) + n;
  inventory.coins = (inventory.coins || 0) + (Z.coins || 0); inventory.gems = (inventory.gems || 0) + (Z.gems || 0);
  inventory.zycube = null; saveInv(); hud.setWallet(inventory); zycube.show(null);
  const n = Object.values(Z.items || {}).reduce((s, v) => s + v, 0);
  hud.banner('ZYCUBE RECOVERED', [n && `${n} item${n === 1 ? '' : 's'}`, Z.coins && `${Z.coins} coins`, Z.gems && `${Z.gems} gems`].filter(Boolean).join(' · ') || 'Inventory restored');
  sfx.play('blast', 0.5, 1.4);
}
function recover() {
  if (homeMode) leaveHomeInterior();
  if (caveMode) exitCave(true);
  rizer.heal(); rizer.stamina = rizer.maxStamina; rizer.astralEnergy = rizer.maxAstralEnergy; rizer.vel.set(0, 0, 0); rizer.vy = 0; rizer.flying = false; rizer.onGround = true;
  seers?.standDown(); scanobots?.standDown(); penumbras?.standDown(); novas?.standDown(); bolts?.clear(); astral.clearLock();
  const hinge = world.structures.getObjectByName('hospitalDoor'), fade = fadeEl();
  const lost = inventory.zycube ? ' · your Zycube dropped where you fell (pulse AV to find it)' : '';
  if (hinge && rizer.actor?.has('exitDoor')) {
    const door = doorFrame(hinge, -1), from = DOORWALK.switchAt;
    fade.style.opacity = 1;
    const ok = rizer.startDoorWalk(door, 'exitDoor', {
      step: t => { door.set(doorAngle(t, door.reach / rizer.hipHeight())); fade.style.opacity = Math.max(0, 1 - (t - from) / 0.7); if (t > DOORWALK.close[1] - 0.02 && !door.latched) { door.latched = true; sfx.play('land', 0.35, 1.35); } },
      done: () => { door.set(0); fade.style.opacity = 0; }
    }, from);
    if (ok) { cam.snapBehind(rizer); showToast('Malezor Hospital · patched up and sent back out' + lost, 4200); return; }
  }
  const s = W.playerStart; // (no hospital door: wake up on the porch at home)
  rizer.position.set(s.x, world.groundAt(s.x, s.z), s.z); rizer.facing = s.facing; cam.snapBehind(rizer); fade.style.opacity = 0;
  showToast('You wake up at home · the house is quiet' + lost);
}

function update(dt, t, realDt = dt) {
  shared.uTime.value = t;
  if (rizer) rizer.boltThreat = boltThreat();
  const pad = scopeView ? (readPad(), pressed.clear(), null) : readPad(); // at the eyepiece nothing reaches the world
  if (westLakeBus?.driving) { stickPend = null; r3Hold = null; }
  if (pad?.focus && started && !zy.isOpen) toggleFocus();
  if (pad && (pad.x || pad.z || pad.lx || pad.ly)) setPad(true);
  const wasOpen = zy.isOpen; // a button that closes the menu must not also act in the world
  const stWas = !!stationUI?.isOpen;
  const labOpen = (lab.isOpen || skinLab?.isOpen || buildLab?.isOpen) && !zy.isOpen;
  if (pad?.zyphone && bondGame?.active) bondGame.fail('Cancelled');
  else if (pad && stationUI?.isOpen) stationUI.pad(pad);
  else if (pad?.zyphone && started) { skinLab?.close(); buildLab?.close(); zy.toggle(); }
  else if (pad && zy.isOpen && zy.tab === 'map' && devMapOn() && pad.edge(0)) devMapJump(hud.mapCursor); // ✕ on the dev map cursor
  else if (pad && zy.isOpen) zy.pad(pad);
  else if (pad && labOpen) (buildLab?.isOpen ? buildLab : skinLab?.isOpen ? skinLab : lab).pad(pad);
  if (pressed.has('Tab') && started) { skinLab?.close(); buildLab?.close(); zy.open(); }
  const pcLock = !!pcUse && pcUse.phase !== 'walk'; // in front of the Nebuladock: locomotion and combat are off
  const menu = zy.isOpen || wasOpen || !!stationUI?.isOpen || stWas || pcLock, ko = koT > 0;
  if ((zy.isOpen || stationUI?.isOpen) && dep?.placing) dep.cancel(true); // opening a menu abandons a placement
  dep?.showPrompt(null); // re-shown below when something usable is in reach
  if (!menu && homeMode && indoor !== homeInterior) { const st = indoor.stationAt(rizer); if (st) dep?.showPrompt(st.name, 'SHOP · ○ / E'); }
  else if (!menu && homeMode && !pcUse) { const sp = seating?.prompt(); if (sp) dep?.showPrompt(sp[0], sp[1]); else if (!seating?.active) { const st = homeInterior?.stationAt(rizer); if (st) { if (st.id === 'homepc') dep?.showPrompt('NEBULADOCK CHAIR', 'SIT · ○ / E'); else dep?.showPrompt(st.name, st.id === 'n3000' ? 'PLAY · ○ / E' : st.id === 'tv' ? 'WATCH TV · ○ / E' : st.id === 'floor-guitar' || st.pickup ? 'PICK UP · ○ / E' : undefined); } } }
  if (!menu) dep?.update(); // the placement ghost
  const kx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
  const kz = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
  const analog = pad && (pad.x || pad.z);
  const downLocked = astral?.lock?.kind === 'enemy' || astral?.lock?.kind === 'scanobot'; // (Scanobots and Penumbras count: tech enemies take the thunder too) // d-pad ↓: Astralthunder while locked on an enemy, otherwise the emote
  const reviveLocked = astral?.lock?.kind === 'friendly' && astral.lock.ref?.downed;
  const bondLocked = astral?.lock?.kind === 'zyrex'; // d-pad ↓ (T) while locked on a wild Zyrex: bond
  const padThunder = !labOpen && !!pad?.down && downLocked;
  const inp = {
    x: analog ? pad.x : kx, z: analog ? pad.z : kz, analog: !!analog,
    run: keys.has('ShiftLeft') || keys.has('ShiftRight') || !!pad?.run, // walk by default · hold R2 (Shift) to run
    descendHeld: keys.has('KeyC') || !!pad?.descendHeld,
    jumpPressed: pressed.has('Space') || pad?.jumpEdge, jumpHeld: keys.has('Space') || pad?.jump,
    dodgePressed: pressed.has('KeyC') || pad?.dodge, dodgeHeld: keys.has('KeyC') || !!pad?.dodgeHeld, emotePressed: pressed.has('KeyG') || (!!pad?.down && !downLocked && !reviveLocked && !bondLocked && focus.slot('down') !== 'astralspin'),
    crouchPressed: pressed.has('KeyX') || !!pad?.crouch // L3 (X): crouch toggle on the ground · auto-land while flying
  };
  const busInput = {
    steer:pad ? pad.x : kx,
    throttle:pad?.btn(7) || keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0,
    brake:pad?.btn(6) || keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0,
    handbrake:pad?.btn(5) || keys.has('KeyQ'),
    boost:pad?.edge(0) || pressed.has('Space'),
    lookBehind:pad?.btn(11) || keys.has('KeyV'),
    lights:pad?.edge(12) || pressed.has('KeyL'),
    horn:pad?.edge(10) || pressed.has('KeyH'),
    stopSign:pad?.edge(1) || pressed.has('KeyF'),
    radioNext:pad?.edge(15) || pressed.has('KeyR'),
    radioPrev:pad?.edge(14) || pressed.has('KeyT'),
    radioWheel:pad?.btn(4) || keys.has('KeyB')
  };
  const act = started && !scopeView && !menu && !ko && !lab.previewing && !buildLab?.isOpen && !bondGame?.active && !ufoTransition && !rizer.seq && !rizer.bail && !rizer.prayer && !astral.rollingCast && !pcUse && !seating?.active; // prayer and the authored Rolling Thunder cast own Rizer until the clip ends
  // a lab preview / hologram transition / walking through a door holds Rizer still
  if (!act) { inp.x = inp.z = 0; inp.jumpPressed = false; inp.dodgePressed = inp.emotePressed = inp.crouchPressed = false; }
  const placingNow = !!dep?.placing; // placing: ○ / E confirms, △ cancels, and nothing else acts on those buttons
  if (placingNow && !menu) { if (pressed.has('KeyE') || pad?.interact) dep.confirm(); else if (pad?.kick) dep.cancel(); for (const c of ['KeyE', 'KeyF', 'KeyJ', 'KeyK', 'MousePunch', 'MouseKick']) pressed.delete(c); }
  const padAct = pad && !labOpen && !placingNow ? pad : null; // while the lab is open the face buttons drive the lab
  if (homeMode && indoor === homeInterior && furnMover) furnMover.update(dt, inp, { active: act && !menu, lock: pressed.has('KeyR') || pressed.has('MouseLock') || !!padAct?.lock, square: pressed.has('KeyJ') || pressed.has('MousePunch') || !!padAct?.punch, cancel: pressed.has('KeyE') || !!padAct?.interact });
  else if (furnMover?.busy) furnMover.abort();
  if (homeMode && seating?.active) seating.update(dt, { interact: !menu && (pressed.has('KeyE') || !!padAct?.interact), square: !menu && (pressed.has('KeyJ') || pressed.has('MousePunch') || !!padAct?.punch) }); else if (seating?.active) seating.abort();
  if (homeMode && !menu && act && !rizer.seq && !furnMover?.busy && indoor.nearDoor(rizer)) { // inside, at the front door: ✕ / Space leaves the same way ✕ enters
    dep?.showPrompt('Front door', 'X / SPACE · go outside');
    if (inp.jumpPressed) { inp.jumpPressed = false; inp.jumpHeld = false; walkHomeDoor('exit'); }
  }
  const doorJump = !homeMode && !!hud.doorPrompt && !!inp.jumpPressed;
  if (!homeMode && hud.doorPrompt) { inp.jumpPressed = false; inp.jumpHeld = false; }
  if (labOpen) { inp.jumpPressed = act && pressed.has('Space'); inp.jumpHeld = keys.has('Space'); inp.crouchPressed = act && pressed.has('KeyX'); inp.dodgePressed = act && pressed.has('KeyC'); inp.emotePressed = act && pressed.has('KeyG'); }
  // Locked on: a right-stick flick left/right (Z / V on keyboard) swaps target; otherwise the stick orbits the camera.
  let flick = 0;
  if (pad && astral.lock && !menu && !westLakeBus?.driving) {
    if (Math.abs(pad.lx) < 0.3) flickReady = true;
    else if (flickReady && Math.abs(pad.lx) > 0.7) { flick = Math.sign(pad.lx); flickReady = false; }
  }
  if (!menu && started && astral.lock) { if (pressed.has('KeyZ')) flick = -1; if (pressed.has('KeyV') && !labOpen) flick = 1; }
  if (flick) {
    const t = astral.switchLock(flick, rizer, seers, zyrex, camera, loot, commonChests, npcs?.lockTargets() || [], techLocks());
    for (const z of zyrex) z.bondFocus = t ? t.kind === 'zyrex' && t.ref === z : z.bondFocus;
    if (t) showToast(`LOCKED · ${t.kind === 'enemy' ? (t.ref?.T?.name || 'Seer grunt') : t.kind === 'scanobot' ? (t.ref.name || 'Scanobot') : t.kind === 'friendly' ? `${t.ref.name}${t.ref.downed ? ' · D-pad ↓ revive' : ' · D-pad ↑ recruit'}` : t.kind === 'stone' ? (t.ref.isAstraliteStone ? 'Astralite stone' : 'stone') : 'wild Zyrex · D-pad ↓ to bond'}`);
  }
  if (pad && !menu && !westLakeBus?.driving && !bondGame?.active) cam.look(astral.lock ? 0 : pad.lx * 2.4 * dt * settings.sens, pad.ly * 1.6 * dt * settings.sens * (settings.invertY ? -1 : 1));
  // lock-on: Rizer tracks the target and the camera frames it from behind him
  applyLockIcon($('.rizer-portrait'), homeMode ? null : astral.lock);
  const lockT = astral.lock; rizer.lockPos = lockT ? lockT.pos() : null;
  if (!lockT) for (const z of zyrex) z.bondFocus = false;
  if (lockT && !menu && !lab.previewing) {
    const lp = lockT.pos(), dx = lp.x - rizer.position.x, dz = lp.z - rizer.position.z;
    if (Math.hypot(dx, dz) > 1.5) { const want = Math.atan2(-dx, -dz); cam.yaw += Math.atan2(Math.sin(want - cam.yaw), Math.cos(want - cam.yaw)) * Math.min(1, dt * 4); }
    cam.pitch += (0.28 - cam.pitch) * Math.min(1, dt * 2);
  }
  if (act) {
    if (westLakeBus?.driving) {
      if ((pressed.has('KeyE') || padAct?.kick) && westLakeBus.exit(rizer)) cam.snapBehind(rizer);
    } else if (ufoPilot) {
      if (pressed.has('KeyE') || padAct?.kick) exitUfo();
      else if (pressed.has('KeyF') || padAct?.interact) {
        if (astral.lock?.kind === 'enemy' && seers?.alive(astral.lock.ref)) fireUfoLaser();
        else turboUfo();
      }
    } else if (astralboard?.active) {
      if (astralboard.mounted && (pressed.has('KeyE') || padAct?.kick)) astralboard.dismount(rizer); // △ off, like every vehicle
      else if (astralboard.mounted && (pressed.has('KeyO') || padAct?.interact)) { astralboard.dismount(rizer); boardStowAfter = true; } // ○ off and onto his back
    } else if (homeMode && indoor !== homeInterior) { // another building: its counters are merchants (store.js · station-ui 'shop')
      if (pressed.has('KeyE') || padAct?.interact) {
        const st = indoor.stationAt(rizer);
        if (st?.dept) { dep?.showPrompt(null); stationUI.open('shop', { store: indoor.id, dept: st.dept, onWallet: inv => hud.setWallet(inv) }); }
        else showToast(indoor.level === 1 ? 'Front door · ✕ / Space to leave · the stairs on the right go up' : 'The stairs by the east wall lead back down');
      }
    } else if (homeMode) {
      if ((pressed.has('KeyE') || padAct?.interact) && !furnMover?.busy && !pcUse && !seating?.active) {
        const st = homeInterior.stationAt(rizer), line = st ? null : homeInterior.interact(rizer);
        if (st) { if (st.id === 'homepc') seating.begin(); else if (st.id === 'floor-guitar') takeFloorGuitar(); else if (st.id === 'tv') tv.open(); else if (st.id.startsWith('dvd:')) tv.collect(st.id.slice(4)); else openStation(st.id); }
        else if (line) showToast(line, 3600);
        else showToast(homeInterior.level === 1 ? 'Front door · ✕ / Space to leave' : 'Use the stairs in the northwest corner to go downstairs');
      }
    } else {
    const promptTarget = hud.promptTarget;
    if (caveMode && caveSpotShown && (pressed.has('KeyE') || padAct?.interact) && !rizer.flying) { useCaveSpot(caveSpotShown); pressed.delete('KeyE'); if (padAct) padAct.interact = false; }
    const boardTriangle = promptTarget?.id === 'astralboard-ride' && (pressed.has('KeyE') || !!padAct?.kick); // △ on, like every vehicle
    if (boardTriangle) { astral.clearLock(); astralboard.mount(rizer); }
    const boardStow = !boardTriangle && promptTarget?.id === 'astralboard-ride' && (pressed.has('KeyO') || !!padAct?.interact); // ○ stows it on his back
    if (boardStow) stowBoard();
    const busTriangle = promptTarget?.id === 'west-lake-bus' && (pressed.has('KeyE') || !!padAct?.kick);
    if (busTriangle) { astral.clearLock(); westLakeBus.entry(rizer); }
    const ufoTriangle = promptTarget?.id === 'auraxion-ufo' && !!padAct?.kick;
    if (ufoTriangle) enterUfo();
    if (doorJump) {
      const it = promptTarget;
      if (it?.id === 'player-home') walkHomeDoor('enter');
      else if (it?.id === 'malezor-gear-shop') walkDoor('enter', storeInterior); // the Malezor Town Store
      else if (it?.cave) enterCave(it.cave);
      else if (it?.kind === 'lightbulb') { rizer.playInteract(true); lightbulbs?.collect(it.id); }
      else if (it?.door) { rizer.playInteract(true); showToast(`◈ ${it.name} · sealed for now`); }
    }
    const square = pressed.has('KeyJ') || pressed.has('MousePunch') || !!padAct?.punch;
    if (square && tryAirSlam()) {} // in the air + locked on an enemy: the aerial slam
    else if (!rizer.flying && square) {
      if (rizer.weapon === 'bow') firePearlbow(); else if (rizer.weapon === 'guitar') toggleGuitar(); else if (rizer.weapon === 'telescope') toggleScope(); else if (rizer.weapon === 'workstation') buildWorkstation(); else if (rizer.weapon === 'blaster') rifleUp = Math.max(rifleUp, 0.01); else rizer.strike('punch');
    }
    if (!rizer.flying && !ufoTriangle && !busTriangle && !boardTriangle && (pressed.has('KeyK') || pressed.has('MouseKick') || padAct?.kick)) rizer.strike('kick');
    // ○ is contextual: a place in front → interact · otherwise → Astral Blast (bonding is lock on + D-pad ↓, below)
    const circle = padAct?.interact, lk = astral.lock;
    // ○ near loot picks it up (flowers, a defeated enemy's bag), mid-fight too; otherwise ○ interacts or casts Astralstrike.
    const lootNear = nearestLoot(), pt = hud.promptTarget;
    const depNear = dep?.nearest(rizer.position); if (depNear && !lootNear) dep.showNear(depNear);
    const lootWins = lootNear && (!hud.hasPrompt || pt?.kind === 'enemyLoot' || Math.hypot(pt.x - rizer.position.x, pt.z - rizer.position.z) > lootNear.d + 0.5);
    hud.setLootHint(lootNear ? lootNear.name : null);
    if (boardTriangle || boardStow || busTriangle) {}
    else if ((pressed.has('KeyE') || circle) && lootWins && !rizer.flying) pickupLoot(lootNear);
    else if ((pressed.has('KeyE') || circle) && depNear && !lootNear && !hud.hasPrompt && !rizer.flying) openStation('workstation', { uid: depNear.uid });
    else if (promptTarget?.id === 'auraxion-ufo' && pressed.has('KeyE')) enterUfo();
    else if ((pressed.has('KeyF') || circle) && lk?.kind === 'zyrex' && lk.pos().distanceTo(rizer.position) < 8) showToast('BOND · D-pad ↓ (T) while locked on'); // ○ no longer bonds — and never blasts a Zyrex you're bonding with
    else if ((pressed.has('KeyE') || circle) && hud.hasPrompt) {
      const it = hud.interact();
      if (it?.kind === 'npc') {
        if (it.id === 'npc-zoryn' && npcs?.meet(it)) { inventory.zorynMet = true; saveInv(); showToast('CONTACT DISCOVERED · ZORYN'); }
        hud.say(it.name, npcs?.talk(it) || it.note);
      } else if (it?.kind === 'goldchest') { // gold chest: walk up to the lock, lift the lid, and its Lightbulb floats out
        const c = lightbulbs?.find(it.id), f = c?.front();
        if (c?.state === 'closed') rizer.walkTo(f, f.face, () => { if (c.state !== 'closed') return; rizer.playInteract(false); later(0.28, () => lightbulbs.open(it.id)); }, { around: f.around });
      } else if (it?.kind === 'chest' && it.common) { // wooden chest: walk up to the lock, lift the lid, coins
        const ch = it.chest, f = commonChests.front(ch);
        if (ch.state === 'closed') rizer.walkTo(f, f.face, () => {
          if (ch.state !== 'closed') return;
          rizer.playInteract(false);
          later(0.28, () => { const n = commonChests.open(ch); if (n) showToast(`Wooden chest · ${n} coin pile${n === 1 ? '' : 's'}`); });
        }, { around: f.around });
      } else if (it?.kind === 'chest') {
        const c = loot.all.find(q => q.id === it.id);
        if (c?.state === 'closed') { const f = c.front(); rizer.walkTo(f, f.face, () => { if (c.state === 'closed') { rizer.playInteract(false); later(0.28, () => c.open()); } }, { around: f.around }); }
        else if (c?.state === 'waiting') { picking = c; rizer.pickUp(c.rest, () => {
          if (c.take()) { // it's in his hand now: he lifts it through the rest of the clip, then puts it away
            const W8 = WEAPONS[c.item] || RIDES[c.item];
            if (c.ride) {
              astralboard.unlock(c.rest); rizer.pickStow = false;
              hud.banner('RIDEABLE PROP · ASTRALITE', W8.name); showToast(`${W8.name} unlocked · ○ / E beside it to ride`);
            } else {
              rizer.swordAt = 'hand'; rizer.handWeapon = c.item; rizer.pickStow = rizer.weapon !== c.item; // he stows it once the pick-up finishes (unless it's what he has equipped)
              hud.banner(W8.banner || (W8.gemlord ? `MYTHIC WEAPON · ${W8.gemlord.toUpperCase()}` : `${(W8.tier || 'WEAPON').toUpperCase()} WEAPON`), W8.name); showToast(`${W8.name} · R1 / L1 on the weapon wheel to draw it`); syncWheel(); wheel.render();
            }
          }
        }, 'pickup', { from: c.dir, around: c.front().around }); } // from the chest's front, never through it
      } else if (it?.kind === 'scope') { useScope();
      } else if (it?.kind === 'enemyLoot') {
        rizer.pickUp({ x: it.x, y: rizer.position.y + 0.2, z: it.z }, () => {
          const reward = seers?.collectLoot(it);
          if (reward) {
            inventory[reward.currency] = (inventory[reward.currency] || 0) + reward.amount;
            saveInv(); hud.setWallet(inventory); showToast(`+${reward.amount} ${reward.currency} · ${reward.enemy} loot`);
          }
        }, 'store');
      } else if (it?.kind === 'astraliteGem') {
        rizer.pickUp({ x: it.x, y: rizer.position.y + 0.2, z: it.z }, () => {
          if (!canCarry(it.itemKey)) return;
          if (!world.nature?.userData?.stones?.collect(it)) return;
          addItem(it.itemKey, 1); showToast(`ASTRALITE ACQUIRED · ${it.name} ×1`);
          fx.emit(it.x, world.heightAt(it.x, it.z) + 0.7, it.z, 14, { color: '#85cfff', speed: 2.2, up: 1.3, size: 0.2, life: 0.5 });
        }, 'pickup');
      }
    }
    else if (!rizer.flying && (pressed.has('KeyF') || circle)) rizer.strike('blast');
    // Weapon wheel: R1 / L1 cycle what's in hand (Q cycles · 1-2 pick directly)
    const friendlyLock = astral.lock?.kind === 'friendly' ? astral.lock.ref : null;
    // ── the D-pad: context first (a friend, a chest, a wild Zyrex), then Focus Moves (Lock-On + D-pad) ──
    // Each direction casts whatever Focus Move sits on it (Zyphone › Labs › Focus · focus-moves.js). Keyboard: I ↑ · U → · T ↓ · Y ←.
    const dpad = { up: !!padAct?.astralift || pressed.has('KeyI'), right: !!padAct?.rolling || pressed.has('KeyU'), down: !!padAct?.down || pressed.has('KeyT'), left: !!padAct?.burst || pressed.has('KeyY') };
    const chestLock = (astral.lock?.kind === 'chest' || astral.lock?.kind === 'coinchest');
    if (dpad.up && friendlyLock && !rizer.flying) {
      if (friendlyLock.downed) showToast('ZORYN · press D-pad ↓ to revive');
      else if (npcs?.recruit(friendlyLock)) { inventory.zorynRecruited = true; saveInv(); showToast('ZORYN WALKS WITH YOU · you are not out here alone'); }
      dpad.up = false;
    } else if (dpad.up && chestLock && !rizer.flying) { castFocus('astralift', true); dpad.up = false; } // a locked chest always lifts on ↑
    if (padAct?.down && reviveLocked && !rizer.flying && Math.hypot(astral.lock.ref.root.position.x-rizer.position.x, astral.lock.ref.root.position.z-rizer.position.z) < 4.5) {
      const downed = astral.lock.ref;
      rizer.actor?.play('blast', 0.85);
      fx.emit(downed.x, downed.root.position.y + 1, downed.z, 15, { color: '#80bfff', speed: 1.4, up: 1.6, size: 0.22, life: 0.8 });
      later(0.75, () => { if (npcs?.revive(downed)) { inventory.zorynDowned = false; inventory.zorynHealth = downed.health; saveInv(); showToast('ZORYN IS BACK ON HIS FEET'); } });
      dpad.down = false;
    }
    // Bond: lock on a wild Zyrex + d-pad ↓ (T) within 8 units starts the bond trial (bond.js)
    if (bondLocked && dpad.down && !rizer.flying) {
      const lz = astral.lock;
      if (lz.pos().distanceTo(rizer.position) >= 8) showToast('BOND · get closer to the Zyrex');
      else if (lz.ref.state === 'flee') showToast('BOND · wait for the Zyrex to calm down');
      else { keys.clear(); bondGame.start(lz.ref, rizer); }
      dpad.down = false;
    }
    for (const d of DIRS) {
      if (!dpad[d]) continue;
      if (rizer.flying && focus.slot(d) !== 'astralspin') continue; // only Astralspin works in the air
      if (d === 'down' && padAct?.down && !astral.lock && focus.slot('down') !== 'astralspin') continue; // d-pad ↓ with nothing locked is the emote (unless Astralspin sits there: it needs no lock)
      if (astral.lock && !isFoeLock(astral.lock) && focus.slot(d) !== 'astralspin') continue; // locked on something that isn't a fight (a friend, a Zyrex): no technique
      const id = focus.slot(d);
      if (!id) { showToast(`D-PAD ${DIR_NAME[d]} · empty · equip a Focus Move in the Zyphone (Labs › Focus)`); continue; }
      castFocus(id);
    }
    if (padAct?.nextWeapon || pressed.has('KeyQ')) cycleWeapon(1);
    if (padAct?.prevWeapon) cycleWeapon(-1);
    for (const [i, k] of inventory.wheel.entries()) if (k && pressed.has('Digit' + (i + 1))) equip(k);
    if (pressed.has('KeyM')) toggleMusic();
    if (pressed.has('KeyB') || padAct?.vision) { if (av.pulse(rizer.position)) showToast('ASTRALVISION'); else showToast(`Astralvision recharging · ${Math.ceil(av.cooldown)} s`); }
    if (!homeMode && (pressed.has('KeyR') || pressed.has('MouseLock') || padAct?.lock)) {
      const t = astral.toggleLock(rizer, seers, zyrex, loot, commonChests, npcs?.lockTargets() || [], techLocks());
      for (const z of zyrex) z.bondFocus = t?.kind === 'zyrex' && t.ref === z;
      showToast(t ? (t.kind === 'enemy' ? 'LOCKED · ' + (t.ref?.T?.name || 'Enemy') : t.kind === 'scanobot' ? 'LOCKED · ' + (t.ref.name || 'Scanobot') : t.kind === 'friendly' ? `${t.ref.name} · ${t.ref.downed ? 'D-pad ↓ revive' : 'D-pad ↑ recruit'}` : t.kind === 'chest' ? 'LOCKED · chest · D-pad ↑ to Astralift' : t.kind === 'coinchest' ? 'LOCKED · coin chest · D-pad ↑ to Astralift' : t.kind === 'stone' ? `LOCKED · ${t.ref.isAstraliteStone ? 'Astralite stone' : 'stone'} · strike its surface` : 'LOCKED · wild Zyrex · walk up calmly · D-pad ↓ to bond') : astral.lock === null ? 'Lock released' : 'Nothing in range');
    }
    }
  }
  pressed.clear();
  if (n3000?.isOpen) return;
  if (ko) { koT -= dt; fadeEl().style.opacity = Math.min(1, Math.max(0, 1 - koT / 0.8)); if (koT <= 0) recover(); } // the last 0.8 s fades to black

  // time of day: slow drift, or a quick sweep to the chosen preset
  if (hourTarget !== null) { const step = Math.max(2.5, (hourTarget - hour) * 2.2) * dt; hour = Math.min(hour + step, hourTarget); if (hour >= hourTarget) hourTarget = null; }
  else hour += realDt / 3600;
  if (hour >= 24) { hour -= 24; if (hourTarget !== null) hourTarget -= 24; }

  inp.camPitch = cam.pitch; // flight steers up/down with the camera
  if (!menu && bondGame?.active) bondGame.update(dt, pad);
  inp.allowPrayer = act || !!rizer.prayer;
  inp.inCombat = !homeMode && ((astral.lock?.kind === 'enemy' && !!seers?.alive(astral.lock.ref)) || (astral.lock?.kind === 'scanobot' && astral.lock.ref.alive) || !!seers?.inCombat(rizer.position) || !!scanobots?.inCombat(rizer.position) || !!penumbras?.inCombat(rizer.position) || !!novas?.inCombat(rizer.position));
  if (settings.focus !== false && inp.inCombat && !astral.lock && !menu && started && !ko && !ufoPilot && !astralboard?.active && !westLakeBus?.driving) { // in a fight: lock the enemy in front without being asked
    const t = astral.autoLock(rizer, seers, zyrex, loot, commonChests, npcs?.lockTargets() || [], techLocks());
    if (t) showToast('LOCKED · ' + (t.kind === 'enemy' ? (t.ref?.T?.name || 'Enemy') : (t.ref.name || 'Scanobot')));
  }
  if (rizer.actor) rizer.actor.fighting = !ufoPilot && !westLakeBus?.driving && !astralboard?.active && !homeMode && !menu && (astral.lock?.kind === 'enemy' || astral.lock?.kind === 'scanobot');
  if (!menu && ufoTransition) updateUfoTransition(dt);
  else if (!menu) { if (westLakeBus?.driving) westLakeBus.update(dt, busInput, rizer); else if (ufoPilot) updateUfo(dt, inp, cam.yaw); else if (astralboard?.active) astralboard.update(dt, inp, cam.yaw, rizer); else { rizer.update(dt, inp, homeMode ? indoor.roomWorld : westLakeBus?.playerWorld || world, cam.yaw); if (!homeMode) westLakeBus?.resolvePlayer(rizer); } }
  if (menu && seating?.active) rizer.update(dt, inp, homeInterior.roomWorld, cam.yaw); // seated at the PC: only his animation runs
  if (rizer.god && rizer.hp > 0) { rizer.hp = rizer.maxHp; rizer.stamina = rizer.maxStamina; rizer.astralEnergy = rizer.maxAstralEnergy; } // dev god mode: HP, STM and AE never drop
  if (!menu && !westLakeBus?.driving) updateBow(dt, rizer.weapon === 'bow' && (keys.has('KeyJ') || mousePunchHeld || !!padAct?.punchHeld));
  if (!menu && !westLakeBus?.driving && held) updateBlaster(dt, act && rizer.weapon === 'blaster' && (keys.has('KeyJ') || mousePunchHeld || !!padAct?.punchHeld));
  if (!menu && !westLakeBus?.driving) { const mv = Math.hypot(inp.x || 0, inp.z || 0) > 0.3 || !!inp.jumpPressed; updateJam(dt, mv); updateScope(dt, mv); }
  if (!menu && homeMode) indoor.update(rizer, cam, () => walkHomeDoor('exit'), showToast, dt);
  if (!menu && !homeMode) npcs?.update(dt, rizer, seers);
  const movementWorld = homeMode ? indoor.roomWorld : world;
  if (westLakeBus?.driving) westLakeBus.cameraUpdate(dt, camera, cam, busInput);
  else { if (labsView) { cam.yaw = rizer.facing; cam.pitch = 0.1; cam.targetDist = 3.4; } cam.update(dt, rizer, movementWorld, { autoRecenter: usingPad && !menu }); }
  labs?.update(dt); xray?.update(dt); lightbulbs?.update(dt);
  updateBackBoard();
  if (homeMode && indoor === homeInterior) homeInterior.nebulaTick?.(dt);
  if (pcUse) tickPcUse(dt);
  if (scopeView) scopeCamera(dt);
  shared.uPlayer.value.copy(rizer.position); shared.uCam.value.copy(camera.position); shared.uFocus.value.copy(cam.focus);
  const night = sky.update(hour, rizer.position);
  caveFrame(dt);
  setNight(night, t); world.update(t, night);
  world.nature?.userData?.stones?.update(dt);
  if (!homeMode && started && !menu && rizer.onGround) world.nature?.userData?.breakables?.rustle(rizer.position, 0.55, rizer.speed); // pushing through a bush
  if (!homeMode && !caveMode && started) world.mass.warm(rizer.position.x, rizer.position.z); // build collision just ahead of him
  bloom.strength = 0.25 + night * 0.3;
  renderer.toneMappingExposure = 1.05 + night * 0.15;
  if (!menu && !homeMode) {
    for (const z of zyrex) z.update(dt, t, rizer, seers?.grunts);
    if (partner && !ufoPilot && !westLakeBus?.driving) partner.update(dt, t, rizer, { seers, lock: astral.lock, onHit: partnerHit });
    setZyrex2DNight(night);
    anciuxor?.update(dt, t, rizer);
    camera.updateMatrixWorld(); _frustum.setFromProjectionMatrix(_pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    seers?.update(dt, t, rizer, night, seerHooks);
    if (started) progression.unlock(); // RP7B: RXP goes live, for good, the first time Rizer stands in the overworld
    penumbras?.update(dt, t, rizer, scanHooks);
    novas?.update(dt, t, rizer, scanHooks); bolts?.update(dt, boltCtx); resources?.update(dt, rizer); freshWoodTick();
    scanobots?.update(dt, t, rizer, scanHooks); // after the Seers: Rizer's hit capsules are fresh for this frame
    solidPass(); rizerPrev.copy(rizer.position);
    gatelocks?.update(dt, t, rizer);
    coinPiles?.update(dt, t, rizer);
    const busHits = westLakeBus?.resolveEnemies(seers, dt) || [];
    if (busHits.length) {
      sfx.play('heavy', 1.1);
      for (const hit of busHits) fx.emit(hit.x, hit.y, hit.z, 12, { color: '#e3af69', speed: 3.2, up: 1.2, size: 0.3, life: 0.4 });
      showToast(`WEST LAKE BUS · ${busHits.length} impact${busHits.length === 1 ? '' : 's'}${westLakeBus.boosting ? ' · BOOST ×1.5' : ''}`);
    }
  }
  if (rizer.comboFlash) { if (rizer.comboFlash > 1) showToast(`${rizer.comboKind === 'flykick' ? 'FLYING KICK ' : rizer.comboKind === 'kick' ? 'KICK ' : rizer.comboKind === 'sword' ? 'SWORD ' : rizer.comboKind === 'axe' ? 'AXE ' : rizer.comboKind === 'rubypaw' ? 'RUBYPAW ' : ''}COMBO ${rizer.comboFlash}${rizer.comboFlash === rizer.comboMax(rizer.comboKind) ? ' · FINISHER' : ''}`); rizer.comboFlash = 0; }
  // Taking the sword: over the last stretch before the grab frame it floats into his closing hand, so they meet.
  if (rizer.pick && picking?.state === 'waiting') {
    const k = rizer.pick, g = held.handGrip(rizer.actor, picking.item);
    if (g) picking.attract((k.t - (k.grab - 0.22)) / 0.22, g.pos, g.quat); // last few cm: fingers close on the grip
  }
  if (!homeMode) { loot.update(dt, t); commonChests?.update(dt, rizer.position); chestLight.update(rizer.position); }
  else chestLight.off();
  if (homeMode) lightIndoors(); else lightOutdoors();
  if (!menu && !homeMode) av.update(dt, t, rizer.position);
  if (!homeMode) zycube?.update(dt, t);
  // One visible stowed weapon: light blades at the waist, heavy axe/Rubypaw across the back.
  if (rizer.swordAt === 'hip' && BLADES[rizer.handWeapon] && inventory.wheel?.includes(rizer.handWeapon) && inventory.hip !== rizer.handWeapon) { inventory.hip = rizer.handWeapon; saveInv(); }
  if (inventory.hip && (!inventory.owned.includes(inventory.hip) || !inventory.wheel?.includes(inventory.hip))) inventory.hip = null; // only weapons on the wheel ride on his body
  // Rifle stance: with the blaster in hand the rifle clips carry idle / walk / run / jump, and □ brings it to the shoulder.
  const rifleClips = hasRifleClips(rizer.actor), rifleOut = rizer.swordAt === 'hand' && rizer.handWeapon === 'blaster' && inventory.wheel?.includes('blaster') && rizer.swimW < 0.5;
  if (rizer.actor) {
    const A = rizer.actor, v = rizer.vel, sp = v ? Math.hypot(v.x, v.z) : 0, rel = sp > 0.6 ? Math.atan2(v.x, v.z) - rizer.facing : 0;
    A.heavy = rizer.swordAt === 'hand' && (rizer.handWeapon === 'axe' || rizer.handWeapon === 'rubypaw') && inventory.wheel?.includes(rizer.handWeapon) && rizer.swimW < 0.5;
    A.rifle = rifleClips && rifleOut && !rizer.flying && !jam; A.aiming = rifleUp > 0;
    A.strafe = A.aiming && sp > 0.6 ? Math.sin(rel) * Math.min(1, Math.abs(Math.sin(rel)) * 1.6) : 0; A.backing = A.aiming && sp > 0.6 ? Math.max(0, -Math.cos(rel) * 1.6 - 0.6) : 0;
  }
  { const drawn = rizer.swordAt === 'hand' ? rizer.handWeapon : null, swim = rizer.swimW >= 0.5;
    held.place(rizer.actor, Object.fromEntries(Object.keys(BLADES).map(k => [k, !inventory.owned.includes(k) || !inventory.wheel?.includes(k) ? null : k === 'guitar' && jam ? 'play' : k === 'blaster' && k === drawn && rifleK > 0.02 && !swim && !rifleClips ? 'aim' : k === drawn ? (swim ? 'stow' : 'hand') : k === inventory.hip && !drawn ? 'stow' : null]))); }
  if (rifleClips && rifleOut && held.meshes.blaster.parent) gripRifle(rizer.actor, held.meshes.blaster, rifleKick * 0.4); // both hands on it, wherever the clip carries it
  else if (rifleK > 0.02 && rizer.weapon === 'blaster' && rizer.actor && held.meshes.blaster.parent) { held.meshes.blaster.position.z -= rifleKick * 0.4; holdRifle(rizer.actor, held.meshes.blaster, rifleK); }
  held.update(dt, !lab.previewing, !!BLADES[rizer.attack?.kind]);
  if ((rizer.C?.astral || 'blue') !== astral.palette) { astral.setPalette(rizer.C?.astral || 'blue'); if (rizer.C?.astral === 'green') av.setColor('#5dff8e', '#2bef66'); else av.setColor('#6fb4ff', '#4d99ff'); } // the skin's astral colour
  if (!menu && !homeMode) astral.update(dt, t, rizer, seers, h => { fx.emit(h.x, h.y, h.z, h.down ? 16 : 9, { color: h.down ? '#c9a0ff' : '#9cc0ff', speed: 3.4, up: 1.4, size: 0.4, life: 0.4 }); cam.kick(0.35); sfx.play(h.down ? 'heavy' : 'medium'); if (h.down) showToast(h.scanobot ? downToast(h) : `${h.name || 'Seer grunt'} falls · ${seers.defeated} fewer holding Malezor`); }, techBodies());
  if (!menu && !homeMode) storm?.update(dt); // after the enemies' own update: a body held by Astralclap / Astralspin stays held
  if (!menu && !homeMode) bowProjectiles?.update(dt);
  ufoFireCooldown = Math.max(0, ufoFireCooldown - dt);
  if (ufoBeam) { ufoBeam.age += dt; ufoBeam.mesh.material.opacity = Math.max(0, 1 - ufoBeam.age / 0.18); if (ufoBeam.age >= 0.18) { scene.remove(ufoBeam.mesh); ufoBeam.mesh.geometry.dispose(); ufoBeam.mesh.material.dispose(); ufoBeam = null; } }
  if (timers.length) { const due = timers.filter(q => elapsed >= q.at); timers = timers.filter(q => elapsed < q.at); due.forEach(q => q.fn()); }
  // Swing and miss: nothing touched within the blow's contact window.
  missChecks = missChecks.filter(at => { if (elapsed < at + 0.16) return true; if (lastLanded < at - 0.22) sfx.play('miss'); return false; });
  { // footsteps: the walk bed for walking and sneaking, the run bed for running
    const r = rizer, moving = !menu && !ufoPilot && !westLakeBus?.driving && !astralboard?.active && r.onGround && !r.flying && r.dodgeT <= 0 && r.swimW < 0.5 && r.speed > 0.6 && r.hp > 0;
    const run = moving && r.speed > (r.actor?.has('walk') ? Math.min(4.5, r.actor.naturalSpeed('walk')) : 3) + 0.8;
    sfx.steps(moving ? (run ? 'run' : 'walk') : null, r.crouched ? 0.45 : 1, 1); // the recordings play at their own pace
    sfx.wind(!menu && r.flying && Math.hypot(r.speed, r.vy) > 2 ? Math.min(1, 0.55 + Math.hypot(r.speed, r.vy) / 40) : 0); // wind: only while actually flying somewhere, a little stronger when boosting
  }
  for (const e of menu || westLakeBus?.driving ? [] : rizer.events) {
    if (e === 'ledgeHang') showToast('LEDGE · ✕ / Space to climb · L3 / keyboard X to drop');
    if (e === 'punch' || e === 'kick' || e === 'flykick' || e === 'kickup' || e === 'runpunch' || BLADES[e]) missChecks.push(elapsed); // every blow (fists, feet, sword, axe) that meets only air whiffs
    if (e === 'land' || e === 'landHard') sfx.play('land', e === 'landHard' ? 1.15 : 0.9);
    if (e === 'slide') sfx.play('slide');
    if (e === 'treeSpin') sfx.play('whoosh', 0.6, 0.9);
    if (e === 'perfectDodge') perfectDodge();
    if (e === 'slamImpact') slamImpact();
    if (e === 'bail') showToast('Nothing left to fly on · falling');
    if (e === 'bailImpact') { // slammed into the ground from the sky
      const p = rizer.position, d = rizer.bail?.dmg || 0;
      sfx.play('heavy', 1.2, 0.85); sfx.play('land', 1.2, 0.8); cam.kick(1.6); hitStop = Math.max(hitStop, 0.12); rumbleHit(d >= 40 ? 'thunder' : 'heavy');
      fx.emit(p.x, p.y + 0.1, p.z, 34, { speed: 5, up: 1.4, size: 0.8, life: 0.7 });
      const el = $('#hurt'); el.classList.add('show'); clearTimeout(hurtTimer); hurtTimer = setTimeout(() => el.classList.remove('show'), 260);
      if (rizer.hp <= 0) knockOut('The sky let go of him', 4.5);
      else showToast(`The ground caught him · ${d} damage`);
    }
    if (e === 'wallplant') { // wall flip: his foot meets the wall
      sfx.play('land', 0.7, 1.12); rumbleHit('light');
      const foot = rizer.actor?.model.getObjectByName('mixamorigRightToeBase') || rizer.actor?.model.getObjectByName('mixamorigRightFoot');
      const at = foot ? foot.getWorldPosition(new THREE.Vector3()) : rizer.position.clone().setY(rizer.position.y + 1.2);
      fx.emit(at.x, at.y, at.z, 6, { speed: 1.4, up: 0.3, size: 0.4 });
    }
    if (e === 'blast' || e === 'blast2' || e === 'blast3') { // astralstrike leaves Rizer's casting hand
      sfx.play('blast', e === 'blast3' ? 1.15 : 1);
      const hand = rizer.actor?.model.getObjectByName('mixamorigRightHand');
      const from = hand ? hand.getWorldPosition(new THREE.Vector3()) : rizer.position.clone().setY(rizer.position.y + 1.6);
      from.addScaledVector(new THREE.Vector3(Math.sin(rizer.facing), 0, Math.cos(rizer.facing)), 0.4);
      const tgt = astral.lock?.kind === 'enemy' || astral.lock?.kind === 'scanobot' ? astral.lock.ref : astral.lock?.kind === 'stone' ? null : astral.assistTarget(rizer, seers);
      const multiplier = e === 'blast3' ? 2 : e === 'blast2' ? 1.5 : 1;
      astral.fire(from, rizer.facing, tgt, COMBAT.blast.damage * multiplier);
    }
    const p = rizer.position;
    if (e === 'guardbreak') showToast('GUARD BROKEN · nothing left to hold it with');
    if (e === 'crouch') showToast('Crouched · quiet enough that a Zyrex might let you close');
    if (e === 'hide') showToast('Hidden in the brush · the Seers look straight past you');
    if (e === 'dust') fx.emit(p.x, p.y + 0.05, p.z, 2, { speed: 1.2, up: 0.6, size: 0.45 });
    if (e === 'land') fx.emit(p.x, p.y + 0.05, p.z, 8, { speed: 2.2, up: 0.5, size: 0.5 });
    if (e === 'landHard') fx.emit(p.x, p.y + 0.05, p.z, 18, { speed: 3.6, up: 0.9, size: 0.65 });
    if (e === 'jump') fx.emit(p.x, p.y + 0.05, p.z, 5, { speed: 1.4, up: 0.4, size: 0.45 });
    if (e === 'splash') fx.emit(p.x, world.waterAt(p.x, p.z), p.z, 4, { color: '#d8efe9', speed: 1.8, up: 3, g: 12, size: 0.35, life: 0.5 });
  }
  // fountain spray
  if (Math.random() < dt * 30) fx.emit(W.plaza.x, world.heightAt(W.plaza.x, W.plaza.z) + 4.9, W.plaza.z, 1, { color: '#e4f2ee', speed: 1.3, up: 2.4, g: 9, size: 0.3, life: 0.9, spread: 0.1 });
  fx.update(dt, t, cam.focus, night);
  if (zy.isOpen && zy.tab === 'map' && devMapOn()) { // the teleport cursor: starts on Rizer, the left stick steers it
    const c = hud.mapCursor || (hud.mapCursor = { x: rizer.position.x, z: rizer.position.z }), E = hud.extent;
    const mb = hud.mapBounds(), rate = (mb.x1 - mb.x0) / (E * 2) * 90; // the cursor crosses either map in the same time
    if (pad && (pad.x || pad.z)) { c.x = Math.max(mb.x0, Math.min(mb.x1, c.x + pad.x * rate * realDt)); c.z = Math.max(mb.z0, Math.min(mb.z1, c.z + pad.z * rate * realDt)); }
  } else if (hud.mapCursor) hud.mapCursor = null;
  { const mc = $('#map-canvas'), want = devMapOn() ? 'crosshair' : ''; if (mc && mc.style.cursor !== want) mc.style.cursor = want; }
  hud.update(dt, { rizer, cam, hour, zyrex, seers: seers?.grunts, mapOpen: menu && zy.tab === 'map', busy: homeMode || !!seers?.engagedNear(rizer.position, 20) || ko });
  if (menu) zy.status();
  devTick(dt);
  coordsTick(dt);
  hitboxTick();
  lab.tick();
  skinLab?.tick();
  buildLab?.tick();
}

let frameErrors = 0;
function reportFrameError(e) {
  let el = document.getElementById('frame-error');
  if (!el) { el = document.createElement('div'); el.id = 'frame-error'; el.style.cssText = 'position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:80;max-width:86vw;padding:8px 14px;font:11px/1.4 ui-monospace,monospace;color:#fff;background:#8a1420e6;border:1px solid #ff8a8a;border-radius:4px;white-space:pre-wrap;cursor:pointer'; el.title = 'Click to dismiss'; el.onclick = () => el.remove(); $('#game').appendChild(el); }
  const where = String(e?.stack || '').split('\n').slice(1, 4).map(s => s.trim().replace(/\(?file:\/\/[^)]*\/([^/)]+)\)?/, '$1')).join('\n');
  el.textContent = `GAME ERROR (still running) · ${e?.message || e}\n${where}`;
  if (window.__rp7d) window.__rp7d.lastError = e;
}
function frame() {
  const now = performance.now(), realDt = Math.max(0, (now - last) / 1000); let dt = Math.min(realDt, 1 / 20); last = now;
  if (tv?.isOpen) { tvFrame(realDt); requestAnimationFrame(frame); return; }
  if (n3000?.isOpen) {
    n3000.update(Math.min(realDt, 0.05));
    let drawConsole = false;
    if (n3000Camera && n3000Camera.k < 1) { drawConsole = true; const u = n3000Camera; u.k = Math.min(1, u.k + realDt / 0.45); const ease = u.k * u.k * (3 - 2 * u.k); camera.position.copy(u.position).lerp(u.target.eye, ease); const end = camera.quaternion.clone(); camera.lookAt(u.target.screen); end.copy(camera.quaternion); camera.quaternion.copy(u.quaternion).slerp(end, ease); }
    pressed.clear(); if (drawConsole) { renderer.info.reset(); composer.render(); } requestAnimationFrame(frame); return;
  }
  if (hitStop > 0) { hitStop -= dt; dt *= 0.08; } // brief freeze on impact
  if (slowT > 0) { slowT -= realDt; dt *= PERFECT_SLOW.rate; } // perfect dodge / block / parry: a short slow motion
  if (settings.dev && settings.slow) dt *= 0.3; // dev: slow motion
  if (scopeView?.phase === 'open') { renderer.info.reset(); astro.frame(Math.min(realDt, 0.05), readPad()); requestAnimationFrame(frame); return; } // Astragraphy has the screen; the world waits
  elapsed += dt;
  try { update(dt, elapsed, realDt); frameErrors = 0; }
  catch (e) { // one bad frame must never stop the game: report it on screen and keep the loop alive
    console.error('[rp7d] frame error', e); pressed.clear();
    if (++frameErrors <= 3 || frameErrors % 120 === 0) reportFrameError(e);
  }
  renderer.info.reset();
  composer.render();
  requestAnimationFrame(frame);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
});

// Borrowed lights. The scene always has the same lights: the four lamp lights and the ruby light light the town,
// and indoors the same five light the house (the current floor's own lights, brightest first). Changing how
// many lights are on screen recompiles every material, which was the hitch on the way in and out.
let lentLights = null;
const townLights = () => [...world.lampLights, shared.rubyLight].filter(Boolean);
function lightIndoors() {
  const L = townLights(), specs = indoor.lights();
  if (!lentLights) lentLights = L.map(l => ({ p: l.position.clone(), c: l.color.clone(), d: l.distance, k: l.decay }));
  L.forEach((l, i) => { const s = specs[i]; if (!s) { l.intensity = 0; return; } l.position.copy(s.pos); l.color.copy(s.color); l.intensity = s.intensity; l.distance = s.distance; l.decay = s.decay; });
}
function lightOutdoors() {
  if (!lentLights) return;
  townLights().forEach((l, i) => { const s = lentLights[i]; l.position.copy(s.p); l.color.copy(s.c); l.distance = s.d; l.decay = s.k; }); // world.update sets their brightness
  lentLights = null;
}
// Compile every material once at load (town and house both drawn), so neither side hitches the first time.
// Compiling isn't the whole cost: the graphics driver finishes each shader, and the meshes upload, the first
// time they're actually drawn. So under the loading screen one real frame is drawn with everything on screen
// (town, both floors of the house, nothing culled), through the game's own render path.
function warmShaders() {
  const culled = [];
  try {
    const was = homeMode; world.setExteriorVisible(true); homeInterior.show(true); homeInterior.showAll(true); storeInterior?.show(true); storeInterior?.showAll(true);
    scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isPoints) && o.frustumCulled) { o.frustumCulled = false; culled.push(o); } });
    renderer.compile(scene, camera); composer.render();
    homeInterior.showAll(false); storeInterior?.showAll(false); if (indoor !== storeInterior || !was) storeInterior?.show(false);
    if (was) world.setExteriorVisible(false); else homeInterior.show(false);
    if (was && indoor !== homeInterior) homeInterior.show(false);
  } catch (e) { console.warn('[rp7d] shader warm-up', e); }
  for (const o of culled) o.frustumCulled = true;
}
requestAnimationFrame(() => setTimeout(() => { build(); warmShaders(); }, 30));
