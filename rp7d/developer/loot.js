// Loot: three silver chests by Rizer's home (Tearsword, Jaded Axe and Pearlbow),
// the common wooden chests around Malezor (coins), and the small inventory the
// Zyphone's Weapons tab and the weapon wheel equip from.
//   chest closed → (○ / E) Rizer walks up, lifts the lid, the weapon springs out and settles
//   hovering at hand height → (○ / E) he takes it with the Picking Up clip and puts it away
//   → it goes into the inventory → equip it on the wheel (L1 / R1) or Zyphone → Weapons.
import * as THREE from 'three';
import { THARDIN_BLASTER_RIFLE, buildBlasterRifle } from './thardin-rifle.js';
import { rollChestPiles } from './coin-piles.js';
import { DVDS } from './dvd-registry.js';

// ── inventory (kept per browser; fine to lose) ───────────────────────
const KEY = 'rp7d.inventory.v1';
// Mythic weapons are tied to the Gemlords. For the playtest both wait in silver chests by Rizer's
// home; they'll be much harder to earn later.
export const WEAPONS = {
  fists: { name: 'Fists', blurb: 'Punches and kicks. Always with you.' },
  sword: { name: 'Tearsword of Azurel', tier: 'Mythic', gemlord: 'Azurel', color: '#6fb4ff', blurb: 'A mythic blade tied to the Gemlord Azurel: tempered steel with an azure fuller, gold guard, a teardrop sapphire in the pommel. □ swings a four-cut combo.' },
  axe: { name: 'Jaded Axe of Emeralix', tier: 'Mythic', gemlord: 'Emeralix', color: '#3dff7a', blurb: 'A mythic double-bladed war axe tied to the Gemlord Emeralix: emerald crescent edges on a moss-green head, a caged emerald at its heart. Heavy — every blow lands hard. □ swings a four-stage combo.' },
  bow: { name: 'Pearlbow of Ivirium', tier: 'Mythic', gemlord: 'Ivirium', color: '#f4ddff', blurb: 'An ivory and pearl bow with gold fittings. Tap □ to loose a traveling arrow; hold □ to aim while walking. Lock on to choose a target.' },
  // Psychosyd — Baelgor rockstar, electric-guitar apex of the Zyraxis Humanoidlands — signed this cherry-red guitar.
  guitar: { name: "Psychosyd's Signed Red Guitar", tier: 'Legendary', color: '#ff3b3b', banner: 'LEGENDARY · PSYCHOSYD', blurb: 'Cherry-red electric guitar with a gold signature: "Keep it loud. — PSYCHOSYD." □ plays the solo; every Seer and Mori in earshot drops everything and dances until it ends. □ again, moving or taking a hit stops it.' },
  rubypaw: { name: 'Rubypaw Sword · Longsword of Rakoron', tier: 'Uncommon', color: '#ff2a2a', banner: 'RUBYPAW · RAKORON', blurb: 'Rakoron’s heavy crimson longsword: obsidian inset, ruby edge and clawed guard. Stows across Rizer’s back. □ swings the Jaded Axe’s four-stage combo.' },
  telescope: { name: 'Stargazer Telescope', tier: 'Uncommon', color: '#6fb4ff', banner: 'EXPLORATION · STARGAZER', blurb: 'A brass-and-glass refractor on a wooden tripod. Draw it, then □ to set it up: Rizer crafts it piece by piece and plants it in the overworld. ○ / E beside it looks through it into the Aethryx Expanse; □ beside it packs it away.' },
  // The crafted Field Workstation, as an Armory tool (game.js · syncWorkstationKit): on the wheel while one is owned; □ builds it.
  workstation: { name: 'Field Workstation', tier: 'Crafted', color: '#7fd6ff', banner: 'FIELD EQUIPMENT · BUILD', blurb: 'The Field Workstation you crafted at your Experiment Table. Draw it, then □ to build it where you look; ○ / E sets it down. It stays in the Armory while you own one.' },
  // One definition for every owner: a Nova Guardian carries it, drops it when it falls, and Rizer fires the same weapon (thardin-rifle.js).
  blaster: { name: THARDIN_BLASTER_RIFLE.name, tier: 'Rare', color: '#ffb347', banner: 'THARDIN TECH · BLASTER RIFLE', weaponType: THARDIN_BLASTER_RIFLE.weaponType, blurb: 'A high-precision Thardin energy rifle, standard issue for Nova Guardians. Dark alloy, a long scope, and an amber energy chamber. □ shoulders it and fires; hold □ to keep firing. Lock on to choose a target.' }
};

// ── rides ──────────────────────────────────────────────────────────────
// Rideable items and vehicles (not to be confused with the weapon-mounting MOUNTS below)
export const RIDES = {
  astralboard: { name: 'Astralboard', type: 'hoverboard', tier: 'Uncommon', color: '#6b4bef', blurb: 'An arcane hoverboard wreathed in ethereal energy. Allows swift traversal across Malezor.' }
};

// ── creatures: Zyrex only — bondable wildlife, not enemies ──────────────────
export const CREATURES = {
  elzebub: { name: 'Elzebub', kind: 'zyrex', type: 'dragon', color: '#3a5eff', tier: 'Mythic', rideable: true, blurb: 'A blue dragon with golden spikes along its spine. Elzebub is the first official wild Zyrex of Malezor.' }
};

// ── enemies: hostiles Rizer fights. Mori and Seer grunts are defined in seers.js
// (SEER/MORI/ENEMY_TYPES) — Crept and Skellor are catalogued here alongside them. ──
export const ENEMIES = {
  crept: { name: 'Crept', kind: 'enemy', type: 'humanoid', color: '#4a7c3c', blurb: 'A verdant creeper: a humanoid being of vine and leaf. Found in wild corners of Malezor.' },
  skellor: { name: 'Skellor', kind: 'enemy', type: 'humanoid', color: '#c9c9c9', blurb: 'A skeletal warrior of bone and marrow. Haunts forgotten tombs and dark passages.' },
  scanobot: { name: 'Scanobot', kind: 'enemy', type: 'drone', color: '#c9a77c', blurb: 'A bronze utility drone with a blue scanner lens, crystal antennas and claw arms (scanobots.js). Drops one Portalchip when defeated.' }
};

// ── fae entities: neither creatures (Zyrex) nor enemies — ambient wildlife ──
export const ENTITIES = {
  faery: { name: 'Faery', kind: 'entity', type: 'fae', color: '#e89cff', blurb: 'Five ethereal pink faeries combined into one luminous being. Catch one to restore full health.' },
  fae: { name: 'Fae', kind: 'entity', type: 'fae', color: '#f4d48f', blurb: 'A fair cluster of five golden faeries. They dance and weave through the air with grace. Catch one to restore full stamina.' },
  fae_astral: { name: 'Astral Fae', kind: 'entity', type: 'fae', color: '#6fb4ff', blurb: 'Five blue faeries pulsing with astral energy. Catch one to restore full astral energy.' },
  zyphere: { name: 'Zyphere', kind: 'object', type: 'interactive', color: '#1a1a2e', blurb: 'A dark metallic sphere bearing the mark of Zyraxis. Interactive and mysterious.' }
};

// ── environment props ───────────────────────────────────────────────────────
export const PROPS = {
  fieldWorkStation: { name: 'Field Work Crafting Station', kind: 'crafting', type: 'workbench', color: '#8b6d4a', blurb: 'A modular crafting table for field work. Use it to craft and combine items.' },
  rizersTreehouse: { name: 'Rizer\'s Tree House', kind: 'structure', type: 'dwelling', color: '#6b4a2a', blurb: 'A treehouse structure, home to Rizer. A sanctuary in the wilds of Malezor.' }
};

// ── creature spawns: wild Zyrex and enemies ─────────────────────────────────
// Elzebub's actual world placement (position, palette, AI, minimap blip, astral
// lock-on/BOND targeting) is wired through the live wild-Zyrex system: world-data.js's
// `wildZyrex` array places him by the treehouse, zyrex.js's WildZyrex class gives him
// a body and behavior, and game.js/astral.js surface his name and level when Rizer
// locks onto him. This entry is the canonical record of his identity and progression,
// not a separate spawner.
export const CREATURE_SPAWNS = {
  elzebub: {
    id: 'elzebub-wild-1', creature: 'elzebub', name: 'Elzebub', kind: 'zyrex', level: 10, tier: 1,
    color: '#3a5eff', rideable: true,
    // Stats beyond level/tier will be added once creature progression is in place
    blurb: 'The first official wild Zyrex of Malezor: a blue dragon with golden spikes. Found near the treehouse.'
  }
};

function loadInv() { try { return { owned: ['fists'], equipped: 'fists', chestOpen: false, coins: 0, gems: 0, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { return { owned: ['fists'], equipped: 'fists', chestOpen: false, coins: 0, gems: 0 }; } }
export const inventory = loadInv();
{ const m = inventory.items, old = { 'flower-red': 'fruit-red', 'flower-violet': 'fruit-violet', 'flower-gold': 'fruit-gold', 'flower-orange': 'fruit-gold', 'flower-white': 'fruit-white' }; // flowers became fruit
  if (m) for (const [a, b] of Object.entries(old)) if (m[a]) { m[b] = (m[b] || 0) + m[a]; delete m[a]; } }
export function saveInv() { try { localStorage.setItem(KEY, JSON.stringify(inventory)); } catch (e) {} }
// A weapon is owned if it is in the Zycube OR left in the Home PC (ownership is not the same as carrying).
export const hasWeapon = k => inventory.owned.includes(k) || !!inventory.home?.weapons?.includes(k);

// ── items: everything carried that isn't a weapon (the Zyphone's Items tab) ──
// kind: 'consumable' · 'material' · 'key'. Counts live in inventory.items; world finds are remembered
// in inventory.picked (so a picked flower stays picked).
export const ITEMS = {
  // Resources (resources.js): stackable crafting materials. One stack each, counted in inventory.items like everything else here.
  scrap_metal: { name: 'Scrap Metal', kind: 'material', resource: true, color: '#a8744a', blurb: 'Salvaged metal and mechanical components used in technological crafting and repairs.' },
  fresh_wood: { name: 'Fresh Wood', kind: 'material', resource: true, color: '#c9a36b', blurb: 'Green timber from a felled tree or a broken bush, gathered before the ground takes it back. Used in field crafting.' },
  // Everstone: the in-universe word for any stone. Astralite everstones (astralite stones) are the ones that hold an
  // Astralite and are said to keep it forever; every other stone is plain everstone, gathered from the rubble.
  everstone: { name: 'Everstone', kind: 'material', resource: true, color: '#9a968c', blurb: 'Broken stone gathered from the rubble of a smashed rock. "Everstone" is the old word for every stone; the ones that hold an Astralite (astralite stones) are said to keep it forever. Used in crafting and repairs.' },
  zyphere: { name: 'Zyphere', kind: 'key', color: '#5bb9ff', blurb: 'A blue-lit sphere used to attempt a bond with a wild Zyrex. One is committed per attempt.' },
  // Dropped by Scanobots (one each). A Portal Gatelock takes 10 to open (gatelocks.js).
  portalchip: { name: 'Portalchip', kind: 'key', color: '#3a8cff', blurb: 'A small blue circuit chip with gold contacts and a glowing portal display, dropped by Scanobots. A Portal Gatelock opens for 10.' },
  // Wild fruit lying in the grass all over Malezor. Picked up, it's eaten on the spot for a small boost to its
  // RHUD meter; if that meter is already full it goes in the bag to eat later (Zyphone → Items).
  'fruit-gold': { name: 'Gold Fruit', kind: 'consumable', color: '#e2b64e', boost: { stamina: 10 }, blurb: 'A sweet golden fruit, the most common in Malezor. Restores a little stamina.' },
  'fruit-red': { name: 'Red Fruit', kind: 'consumable', color: '#c8455a', boost: { hp: 6 }, blurb: 'A tart red fruit. Restores a little health.' },
  'fruit-violet': { name: 'Purple Fruit', kind: 'consumable', color: '#8a63c4', boost: { astral: 8 }, blurb: 'A purple fruit that hums faintly with astral energy. Restores a little astral energy.' },
  'fruit-white': { name: 'White Fruit', kind: 'consumable', color: '#efe8dc', boost: { hp: 15, stamina: 15, astral: 15 }, blurb: 'A rare pale fruit. Restores health, stamina and astral energy.' },
  gemshard: { name: 'Gemshard', kind: 'material', color: '#9fe8ff', blurb: 'A crystalline shard fused from Astralites at the Astralite Station. Used in advanced crafting.' },
  // Gold Coins: currency and collectible, found in wooden chests throughout Malezor
  'coins': { name: 'Gold Coins', kind: 'currency', color: '#ffd700', blurb: 'Golden coins of Malezor. Valuable for trade and treasure.' }
};
// Every DVD in dvd-registry.js is an item: collectible, stored in one place at a time (storage.js), never consumed.
for (const [id, d] of Object.entries(DVDS)) ITEMS[id] = { name: d.title, kind: 'dvd', color: d.cover?.color || '#1743AA', blurb: d.blurb || '' };
// Canonical RP7B ASTRALITE_FAMILIES table and order. Keep the family/tier
// identity as the inventory key because several canon symbols intentionally repeat.
export const ASTRALITE_FAMILIES = Object.freeze([
  { id: 1, name: 'CREATION', color: '#ffd66b', items: [['Ax-1','Aethryx Prime'],['Gn','Genesis Core'],['Cr','Creatrix'],['Em','Embryonix'],['St','Stellarion'],['Ph','Primordial Hollow'],['Ex','Ex Nihilo Shard']] },
  { id: 2, name: 'PAST', color: '#bc83ff', items: [['Ax-2','Mnemosyne Aethra'],['Rc','Recallite'],['Ec','Echo Crystal'],['Tr','Time Residue'],['Il','Illuminor'],['Pz','Phasedust'],['Om','Omnirecord']] },
  { id: 3, name: 'DESTRUCTION', color: '#ff6848', items: [['Ax-3','Pyroclast Aethra'],['Ig','Ignis Core'],['Dn','Detonite'],['Ru','Ruin Shard'],['Af','Abyssal Flare'],['Rs','Riftstone'],['Oh','Oblivion Heart']] },
  { id: 4, name: 'MIND', color: '#65e3ff', items: [['Ax-4','Cognara'],['Mg','Mindglass'],['Nl','Neuralite'],['Pc','Psycore'],['Tb','Thought Bind'],['Iv','Idea Veil'],['Ao','Auramind Core']] },
  { id: 5, name: 'PRESENT', color: '#68ef91', items: [['Ax-5','Viridion Prime'],['Eq','Equilibris'],['Cf','Coreflux'],['Vb','Vitae Balance'],['Tc','True Balance Crystal'],['Wr','Worldroot'],['Pv','Primordial Verdance']] },
  { id: 6, name: 'PRESERVATION', color: '#ffc85c', items: [['Ax-6','Fortaris'],['Sh','Stoneheart'],['An','Anchorite'],['Bc','Bastion Core'],['Vs','Vital Shell'],['Pr','Protectorite'],['Ic','Imperish Core']] },
  { id: 7, name: 'BODY', color: '#ff79ae', items: [['Ax-7','Corporex'],['Fs','Fleshstone'],['Dc','Density Core'],['Gv','Gravite'],['Dx','Durexion'],['Hd','Hardenite'],['Px','Phoenix Shell']] },
  { id: 8, name: 'FUTURE', color: '#72bfff', items: [['Ax-8','Synthara'],['Me','Mechite'],['Gr','Gridstone'],['Dc','Datacore'],['Ps','Protostar Core'],['Nc','Nexus Chip'],['Sx','Synapse Prime']] },
  { id: 9, name: 'SPIRIT', color: '#d796ff', items: [['Ax-9','Astryx Soul'],['Sp','Spirit Gem'],['Ec','Ethereal Core'],['Sf','Soulfract'],['Tc','Transcendent'],['LS','Luminal Soul'],['Ah','Astral Heart']] }
].map(f => Object.freeze({ ...f, items: Object.freeze(f.items.map(([symbol, name], i) => Object.freeze({ key: `astralite_${f.id}_${i + 1}`, symbol, name, energy: i + 1, family: f.id, familyName: f.name }))) })));
for (const family of ASTRALITE_FAMILIES) for (const item of family.items) {
  ITEMS[item.key] = { name: `${item.symbol} · ${item.name}`, kind: 'material', color: family.color, blurb: `${family.name} family · tier ${item.energy} of the canonical Astralite Matrix. Kept for future crafting.` };
}
// Eat a fruit: boost what isn't full. Returns what it restored ({ hp, stamina, astral }), or null when every
// meter it boosts is already full (so it's kept for later).
export function eatItem(key, rizer, { yieldMultiplier = 1 } = {}) {
  const b = ITEMS[key]?.boost; if (!b) return null;
  const room = { hp: (rizer.maxHp || 100) - rizer.hp, stamina: rizer.maxStamina - rizer.stamina, astral: rizer.maxAstralEnergy - rizer.astralEnergy };
  if (!Object.keys(b).some(k => room[k] > 0.5)) return null;
  const got = {};
  for (const [k, v] of Object.entries(b)) { const add = Math.min(v * (k === 'hp' ? 2 : 1) * yieldMultiplier, Math.max(0, room[k])); // HP boosts are on the old 100-HP scale (HP_SCALE) if (add <= 0) continue; got[k] = Math.round(add);
    if (k === 'hp') rizer.hp += add; else if (k === 'stamina') rizer.stamina += add; else rizer.astralEnergy += add; }
  return got;
}
export function addItem(key, n = 1) { const m = inventory.items ||= {}; m[key] = (m[key] || 0) + n; saveInv(); return m[key]; }

// ── the Tearsword of Azurel (blade along +Y, grip at the origin) ─────
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, ...o });
export function buildSword() {
  const g = new THREE.Group();
  const steel = M('#cdd8e6', { metalness: 0.9, roughness: 0.2 }), gold = M('#c8923c', { metalness: 0.85, roughness: 0.3 });
  const navy = M('#15245a', { roughness: 0.8 }), gem = M('#2e8dff', { roughness: 0.12, emissive: new THREE.Color('#3f9bff'), emissiveIntensity: 1.7 });
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.95, 0.018), steel); blade.position.y = 0.62; g.add(blade);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.053, 0.16, 4), steel); tip.rotation.y = Math.PI / 4; tip.scale.set(1, 1, 0.34); tip.position.y = 1.17; g.add(tip);
  const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.78, 0.022), M('#8fc6ff', { emissive: new THREE.Color('#3f9bff'), emissiveIntensity: 1.4, metalness: 0.6 })); fuller.position.y = 0.6; g.add(fuller);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.045, 0.06), gold); guard.position.y = 0.135; g.add(guard);
  for (const s of [-1, 1]) { const end = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), gold); end.position.set(s * 0.16, 0.135, 0); g.add(end); }
  const guardGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.03), gem); guardGem.position.set(0, 0.135, 0.035); g.add(guardGem);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.027, 0.22, 8), navy); grip.position.y = 0.0; g.add(grip);
  for (const y of [-0.06, 0.02, 0.09]) { const band = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.006, 4, 10), gold); band.rotation.x = Math.PI / 2; band.position.y = y; g.add(band); }
  // the tear: a sapphire drop hanging point-down from a gold cap
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.03, 8), gold); cap.position.y = -0.125; g.add(cap);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), gem); drop.position.y = -0.175; g.add(drop);
  const dropTip = new THREE.Mesh(new THREE.ConeGeometry(0.041, 0.07, 12), gem); dropTip.rotation.x = Math.PI; dropTip.position.y = -0.23; g.add(dropTip);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  g.userData.tip = new THREE.Vector3(0, 1.2, 0); g.userData.base = new THREE.Vector3(0, 0.2, 0); g.userData.hitR = 0.05;
  g.userData.trail = [0.25, 0.5, 1.0];
  return g;
}

// ── Rubypaw, the Longsword of Rakoron ────────────────────────────────
// Broad red faceted frame around a black inset, hooked claw guard, ruby heart and pommel.
// The grip remains at the origin so the existing sword animation mount still fits.
export function buildRubypaw() {
  const g = new THREE.Group(), ruby = M('#e5242f', { metalness: 0.72, roughness: 0.2 }), edge = M('#ff4850', { metalness: 0.65, roughness: 0.16 });
  const dark = M('#160d16', { metalness: 0.62, roughness: 0.27 }), deep = M('#760c17', { metalness: 0.7, roughness: 0.23 });
  const gem = M('#ff293b', { emissive: '#b50716', emissiveIntensity: 0.8, metalness: 0.2, roughness: 0.1 });
  const gold = M('#c18b30', { metalness: 0.8, roughness: 0.3 }), gripMat = M('#1c191d', { roughness: 0.78 });
  const poly = (pts, depth, mat, z = 0) => { const s = new THREE.Shape(); s.moveTo(...pts[0]); for (const p of pts.slice(1)) s.lineTo(...p); s.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1, curveSegments: 1 }), mat); m.position.z = z - depth / 2; g.add(m); return m; };
  // Rakoron's blade is a slender longsword: a ruby frame around a black inset,
  // with most of its length above the guard and a long, narrow diamond point.
  poly([[-0.14, 0.36],[-0.18, 0.62],[-0.155, 1.48],[0, 1.94],[0.155, 1.48],[0.18, 0.62],[0.14, 0.36]], 0.045, ruby);
  poly([[-0.075, 0.53],[-0.105, 0.76],[-0.09, 1.46],[0, 1.74],[0.09, 1.46],[0.105, 0.76],[0.075, 0.53]], 0.05, dark, 0.008);
  for (const s of [-1, 1]) {
    poly([[s*0.135,0.47],[s*0.175,0.64],[s*0.13,1.47],[0,1.94],[s*0.195,1.5],[s*0.205,0.6]], 0.018, edge, 0.031);
    // Three outward-curved guard talons on each side, visible from front and back.
    for (let i = 0; i < 3; i++) { const y = 0.32 - i * 0.1, x = 0.1 + i * 0.04;
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(s*0.06,y,0),new THREE.Vector3(s*(x+0.06),y+0.09,0),new THREE.Vector3(s*(x+0.14),y+0.13,0),new THREE.Vector3(s*(x+0.17),y+0.24,0)]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.02, 5, false), deep));
    }
  }
  for (const y of [0.8, 1.32]) { const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.04, 0), gem); shard.scale.set(0.8, 1.5, 0.5); shard.position.set(0,y,0.05); g.add(shard); }
  const heart = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), gem); heart.scale.set(1.18, 1.12, 0.65); heart.position.set(0,0.29,0.047); g.add(heart);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.04,8), gold); collar.position.y = 0.12; g.add(collar);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.043,0.046,0.31,8), gripMat); handle.position.y = -0.06; g.add(handle);
  for (let i = 0; i < 5; i++) { const band = new THREE.Mesh(new THREE.TorusGeometry(0.046,0.006,4,8), deep); band.rotation.x = Math.PI/2; band.position.y = -0.18 + i*0.06; g.add(band); }
  const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.09,0), gem); pommel.position.y = -0.29; g.add(pommel);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.tip = new THREE.Vector3(0,1.94,0); g.userData.base = new THREE.Vector3(0,0.34,0); g.userData.hitR = 0.08;
  g.userData.trail = [1,0.12,0.18];
  return g;
}

// ── the Jaded Axe of Emeralix (haft along +Y, lower grip at the origin, blades on ±X) ──
// Heavy two-handed war axe after the RP7B sprite: two emerald crescent blades on a moss-green
// head, a gold-caged emerald at the centre, a spike on top, a long gold-banded haft and an
// emerald spike pommel.
export function buildAxe() {
  const root = new THREE.Group(), g = new THREE.Group(), S = 0.8; g.scale.setScalar(S); root.add(g); // built at 1.25 m, carried at 80%
  const wood = M('#4a2e1b', { roughness: 0.85 }), leather = M('#2f1e14', { roughness: 0.9 });
  const gold = M('#d1a23a', { metalness: 0.85, roughness: 0.28 });
  const moss = M('#3f5c25', { roughness: 0.62, metalness: 0.25, side: THREE.DoubleSide });
  const emerald = M('#2fe86b', { roughness: 0.12, metalness: 0.3, emissive: new THREE.Color('#19c957'), emissiveIntensity: 0.9, side: THREE.DoubleSide });
  const gem = M('#35ff7c', { roughness: 0.08, metalness: 0.2, emissive: new THREE.Color('#1fe060'), emissiveIntensity: 1.6 });
  const HEAD = 1.02; // head centre along the haft
  // haft
  const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.036, 1.32, 10), wood); haft.position.y = 0.36; g.add(haft);
  const wrap = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.42, 10), leather); wrap.position.y = 0.02; g.add(wrap);
  for (const y of [-0.2, 0.24, 0.52, 0.8]) { const band = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, y === 0.52 ? 0.06 : 0.035, 10), gold); band.position.y = y; g.add(band); }
  // pommel: gold collar and an emerald spike, point down
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.06, 10), gold); collar.position.y = -0.3; g.add(collar);
  const spikeB = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 6), gem); spikeB.rotation.x = Math.PI; spikeB.position.y = -0.4; g.add(spikeB);
  // head core: moss block, gold cage, emerald at the heart (both faces)
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.34, 0.1), moss); core.position.y = HEAD; g.add(core);
  for (const s of [-1, 1]) {
    const heart = new THREE.Mesh(new THREE.OctahedronGeometry(0.075), gem); heart.scale.set(1, 1.15, 0.45); heart.position.set(0, HEAD, s * 0.05); g.add(heart);
    for (const [w, h, x, y] of [[0.19, 0.022, 0, 0.1], [0.19, 0.022, 0, -0.1], [0.022, 0.2, 0.09, 0], [0.022, 0.2, -0.09, 0]]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), gold); bar.position.set(x, HEAD + y, s * 0.056); g.add(bar); }
    for (const [x, y] of [[0.09, 0.1], [-0.09, 0.1], [0.09, -0.1], [-0.09, -0.1]]) { const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), gold); rivet.position.set(x, HEAD + y, s * 0.065); g.add(rivet); }
  }
  // crescent blades: a moss backing plate with a bright emerald edge, extruded
  const R = 0.62, C0 = -0.07, A = 0.8; // outer arc radius, arc centre (x), half-angle of the edge
  const tip = a => [C0 + R * Math.cos(a), R * Math.sin(a)];
  const plate = new THREE.Shape();
  const [tx, ty] = tip(A);
  plate.moveTo(0.08, -0.13);
  plate.quadraticCurveTo(0.2, -0.18, tx, -ty);            // lower beard, curving out
  plate.absarc(C0, 0, R, -A, A, false);                 // the cutting arc
  plate.quadraticCurveTo(0.2, 0.18, 0.08, 0.13);        // upper horn back to the eye
  plate.lineTo(0.08, -0.13);
  const edge = new THREE.Shape();
  edge.absarc(C0, 0, R + 0.015, -A - 0.04, A + 0.04, false);
  edge.absarc(C0, 0, R - 0.11, A + 0.02, -A - 0.02, true);
  const ext = (sh, d) => { const geo = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1, curveSegments: 16 }); geo.translate(0, 0, -d / 2); return geo; };
  const plateG = ext(plate, 0.045), edgeG = ext(edge, 0.03);
  for (const s of [1, -1]) {
    const side = new THREE.Group(); side.position.y = HEAD; side.scale.x = s; g.add(side);
    side.add(new THREE.Mesh(plateG, moss), new THREE.Mesh(edgeG, emerald));
    for (const [x, y] of [[0.3, 0.12], [0.34, -0.1], [0.22, 0.02]]) { const stud = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), gem); stud.position.set(x, y, 0.03); side.add(stud); const b = stud.clone(); b.position.z = -0.03; side.add(b); }
  }
  // top spike
  const topCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.05, 8), gold); topCollar.position.y = HEAD + 0.2; g.add(topCollar);
  const spikeT = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), gem); spikeT.position.y = HEAD + 0.33; g.add(spikeT);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  // contact segment: through the head, blade to blade width covered by the radius
  root.userData.tip = new THREE.Vector3(0, (HEAD + 0.3) * S, 0); root.userData.base = new THREE.Vector3(0, (HEAD - 0.3) * S, 0); root.userData.hitR = 0.45 * S;
  root.userData.trail = [0.2, 1.0, 0.45]; // green swing trail (rgb)
  return root;
}
// The pearl bow follows the RP7B ivory limbs, curled tips, gold fittings and inset pearls.
export function buildPearlbow() {
  const g = new THREE.Group(), pearl = M('#f3e8f7', { metalness: 0.25, roughness: 0.22 }), gold = M('#d7a745', { metalness: 0.82, roughness: 0.28 });
  const limb = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.18, -0.72, 0), new THREE.Vector3(-0.13, -0.56, 0),
    new THREE.Vector3(-0.31, -0.31, 0), new THREE.Vector3(-0.18, 0, 0),
    new THREE.Vector3(-0.31, 0.31, 0), new THREE.Vector3(-0.13, 0.56, 0),
    new THREE.Vector3(0.18, 0.72, 0)
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(limb, 28, 0.047, 7, false), pearl));
  const ring = (x, y, r) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.013, 5, 12), gold); m.position.set(x, y, 0.047); g.add(m); };
  for (const [x, y] of [[-0.18, 0], [-0.27, 0.32], [-0.27, -0.32], [-0.1, 0.56], [-0.1, -0.56]]) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), pearl); p.position.set(x, y, 0.054); g.add(p); ring(x, y, 0.056);
  }
  for (const y of [-0.72, 0.72]) { const tip = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.025, 6, 12, Math.PI * 1.45), pearl); tip.position.set(0.2, y, 0); tip.rotation.z = y > 0 ? 1.2 : -1.2; g.add(tip); }
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.44, 5), gold); string.position.x = 0.18; g.add(string);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.19, 8), gold); grip.position.set(-0.18, 0, 0); g.add(grip);
  for (const part of g.children) part.position.x += 0.18; // origin is the wrapped grip in Rizer's left hand
  const stowedArrow = buildPearlArrow(); stowedArrow.rotation.x = -Math.PI / 2; stowedArrow.position.set(-0.08, 0.2, -0.04);
  stowedArrow.visible = false; g.add(stowedArrow); g.userData.stowedArrow = stowedArrow;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.base = new THREE.Vector3(0, 0, 0); g.userData.tip = new THREE.Vector3(0.36, 0.72, 0); g.userData.hitR = 0.05; g.userData.trail = [0.9, 0.78, 1];
  return g;
}
export function buildPearlArrow() {
  const g = new THREE.Group(), gold = M('#c99536', { metalness: 0.8, roughness: 0.26 }), pearl = M('#f9eaf8', { roughness: 0.32 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.78, 6), gold); shaft.rotation.x = Math.PI / 2; g.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 6), pearl); tip.rotation.x = Math.PI / 2; tip.position.z = 0.43; g.add(tip);
  for (const s of [-1, 1]) { const feather = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.014, 0.16), pearl); feather.position.set(s * 0.04, 0, -0.32); feather.rotation.z = s * 0.3; g.add(feather); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
// Psychosyd's signed red electric guitar: cherry-red double-cutaway body, white pickguard, three pickups, dark neck,
// six silver strings, a gold signature. Origin at the body's centre; +Y runs up the neck, +Z is the strings' face.
export function buildGuitar() {
  const g = new THREE.Group(), red = M('#b3121c', { roughness: 0.28, metalness: 0.15 }), white = M('#f1ece2', { roughness: 0.45 }), neck = M('#4a2a17', { roughness: 0.6 }), board = M('#2a1a10', { roughness: 0.7 });
  const chrome = M('#d9dde2', { roughness: 0.2, metalness: 0.9 }), gold = M('#d7a745', { metalness: 0.85, roughness: 0.25 }), black = M('#141214', { roughness: 0.5 });
  const sh = new THREE.Shape(); // body outline (x across, y along the neck), a Strat-like double cutaway
  sh.moveTo(0, -0.235);
  sh.bezierCurveTo(0.17, -0.235, 0.2, -0.12, 0.165, -0.04); sh.bezierCurveTo(0.145, 0.01, 0.16, 0.06, 0.185, 0.12);
  sh.bezierCurveTo(0.2, 0.19, 0.16, 0.235, 0.12, 0.2); sh.bezierCurveTo(0.09, 0.17, 0.07, 0.14, 0.035, 0.14);
  sh.lineTo(-0.035, 0.14); sh.bezierCurveTo(-0.07, 0.14, -0.08, 0.18, -0.105, 0.19);
  sh.bezierCurveTo(-0.15, 0.2, -0.175, 0.15, -0.16, 0.1); sh.bezierCurveTo(-0.145, 0.05, -0.15, 0.0, -0.165, -0.05);
  sh.bezierCurveTo(-0.2, -0.13, -0.16, -0.235, 0, -0.235);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.042, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 16 }), red); body.position.z = -0.021; g.add(body);
  const pg = new THREE.Shape(); pg.moveTo(-0.03, 0.13); pg.bezierCurveTo(-0.1, 0.13, -0.12, 0.05, -0.1, -0.02); pg.bezierCurveTo(-0.08, -0.1, 0.02, -0.17, 0.08, -0.13); pg.bezierCurveTo(0.12, -0.1, 0.09, -0.05, 0.05, 0.0); pg.lineTo(0.035, 0.13); pg.lineTo(-0.03, 0.13);
  const guard = new THREE.Mesh(new THREE.ExtrudeGeometry(pg, { depth: 0.004, bevelEnabled: false }), white); guard.position.z = 0.028; g.add(guard);
  for (const [y, r] of [[0.085, 0.08], [0.02, 0.0], [-0.05, -0.1]]) { const pu = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.018, 0.01), black); pu.position.set(0, y, 0.034); pu.rotation.z = r; g.add(pu); }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.03, 0.012), chrome); bridge.position.set(0, -0.12, 0.034); g.add(bridge);
  for (const [x, y] of [[0.1, -0.12], [0.075, -0.165], [0.04, -0.19]]) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.014, 10), gold); k.rotation.x = Math.PI / 2; k.position.set(x, y, 0.036); g.add(k); }
  const nk = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.62, 0.028), neck); nk.position.set(0, 0.44, 0.004); g.add(nk);
  const fb = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.006), board); fb.position.set(0, 0.45, 0.021); g.add(fb);
  for (const y of [0.3, 0.42, 0.52, 0.6, 0.66]) { const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.003, 8), white); dot.rotation.x = Math.PI / 2; dot.position.set(0, y, 0.025); g.add(dot); }
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.17, 0.018), red); head.position.set(0.012, 0.83, -0.002); head.rotation.z = -0.08; g.add(head);
  for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), chrome); t.position.set(0.045, 0.765 + i * 0.024, 0.01); t.rotation.z = Math.PI / 2; g.add(t); }
  for (let i = 0; i < 6; i++) { const x = -0.017 + i * 0.0068, st = new THREE.Mesh(new THREE.BoxGeometry(0.0022, 0.9, 0.0022), chrome); st.position.set(x, 0.33, 0.029); g.add(st); }
  const sig = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.004, 5, 18, Math.PI * 1.4), gold); sig.position.set(-0.09, -0.15, 0.024); sig.rotation.z = 0.5; g.add(sig); // the gold signature
  g.scale.setScalar(1.25);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.base = new THREE.Vector3(0, -0.2, 0); g.userData.tip = new THREE.Vector3(0, 0.9, 0); g.userData.hitR = 0.06; g.userData.trail = [1, 0.3, 0.3];
  return g;
}
// Astralboard: a low-poly astralite/technology deck.  The controller brightens
// the emissive pieces while it is being ridden; at rest it keeps only a dim pulse.
export function buildAstralboard() {
  // A sleek hover-skateboard: long axis along +Z (the way it travels), nose forward, deck top at y = 0.
  // Rizer rides it in a skate stance, one foot ahead of the other along the deck (astralboard.js keeps it under him).
  const g = new THREE.Group();
  const deck = M('#111a31', { metalness: 0.72, roughness: 0.28 });
  const grip = M('#1b2238', { metalness: 0.35, roughness: 0.6 });
  const gold = M('#d69d3d', { metalness: 0.92, roughness: 0.2 });
  const cyan = M('#4de7ff', { emissive: new THREE.Color('#19bfff'), emissiveIntensity: 1.15, metalness: 0.25, roughness: 0.12 });
  const violet = M('#8a63ff', { emissive: new THREE.Color('#6334ff'), emissiveIntensity: 0.72, transparent: true, opacity: 0.6, metalness: 0.08, roughness: 0.18 });
  const glowMaterials = [cyan, violet];
  const L = 0.8, Wd = 0.19; // half length, half width
  const outline = (l, w) => { const sh = new THREE.Shape(); // x = across, y = along (nose at +y), a pointed nose and a squarer tail
    sh.moveTo(0, l); sh.bezierCurveTo(w * 0.75, l * 0.96, w, l * 0.72, w, l * 0.42);
    sh.lineTo(w, -l * 0.62); sh.bezierCurveTo(w, -l * 0.9, w * 0.6, -l, 0, -l);
    sh.bezierCurveTo(-w * 0.6, -l, -w, -l * 0.9, -w, -l * 0.62); sh.lineTo(-w, l * 0.42);
    sh.bezierCurveTo(-w, l * 0.72, -w * 0.75, l * 0.96, 0, l); return sh; };
  const flat = (mesh, y) => { mesh.rotation.x = Math.PI / 2; mesh.position.y = y; g.add(mesh); return mesh; }; // shape +y → +Z (nose forward); the extrusion hangs down from y
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(outline(L, Wd), { depth: 0.035, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 14 }), deck);
  flat(body, -0.012);
  const top = new THREE.Mesh(new THREE.ExtrudeGeometry(outline(L * 0.9, Wd * 0.78), { depth: 0.006, bevelEnabled: false, curveSegments: 14 }), grip);
  flat(top, 0);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.006, L * 1.5), gold); stripe.position.set(0, 0.002, 0); g.add(stripe);
  // underside: one thin light strip down the keel and two shallow hover fields under the feet
  const keel = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.014, L * 1.45), cyan); keel.position.set(0, -0.062, 0); g.add(keel);
  for (const z of [-0.42, 0.42]) { const field = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 6), violet); field.scale.set(0.85, 0.16, 1.15); field.position.set(0, -0.085, z); g.add(field); }
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 14), cyan); core.position.set(0, 0.004, -L * 0.82); g.add(core); // tail light
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData.glowMaterials = glowMaterials; g.userData.core = core; g.userData.ride = true;
  return g;
}
// Stargazer Telescope: brass refractor on a wooden tripod. Origin on the ground under the hub, the lens looks along +Z.
// userData.legs / hub / tube are the three stages Rizer assembles in front of him (game.js · scopeStages).
export function buildTelescope() {
  const g = new THREE.Group();
  const brass = M('#c9a64f', { metalness: 0.85, roughness: 0.25 }), wood = M('#8a5a32', { roughness: 0.72 });
  const blue = M('#2d55b0', { metalness: 0.15, roughness: 0.45 }), navy = M('#1c3068', { metalness: 0.15, roughness: 0.55 });
  const glass = M('#58c4ff', { roughness: 0.06, metalness: 0.1, emissive: new THREE.Color('#2f9fff'), emissiveIntensity: 0.9, side: THREE.DoubleSide });
  const dark = M('#16384f', { roughness: 0.12, metalness: 0.25 });
  const H = 0.74, UP = new THREE.Vector3(0, 1, 0);
  const seg = (bot, top, rTop, rBot, mat) => { const d = top.clone().sub(bot), m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, d.length(), 7), mat); m.position.copy(bot).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.normalize()); return m; };
  const legs = new THREE.Group(); g.add(legs);
  for (const a of [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6]) { // one leg to the back, two forward
    const c = Math.cos(a), s = Math.sin(a), foot = new THREE.Vector3(c * 0.44, 0.03, s * 0.44), top = new THREE.Vector3(c * 0.04, H - 0.05, s * 0.04);
    legs.add(seg(foot, top, 0.028, 0.018, wood));
    const mid = foot.clone().lerp(top, 0.55); legs.add(seg(mid.clone().addScaledVector(UP, -0.05), mid.clone().addScaledVector(UP, 0.05), 0.03, 0.03, brass));
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), brass); shoe.position.copy(foot); legs.add(shoe);
  }
  const hub = new THREE.Group(); hub.position.y = H; g.add(hub);
  hub.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.1, 12), brass));
  for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), brass); k.position.set(s * 0.085, 0.07, 0); hub.add(k); } // pivot knobs
  const tube = new THREE.Group(); tube.position.y = H + 0.07; tube.userData.tilt = 0.95; tube.rotation.x = 0.95; g.add(tube); // local +Y is the viewing axis, tilted up and out toward +Z
  const r = y => 0.05 + 0.02 * (y + 0.07) / 0.62;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.62, 18), blue); barrel.position.y = 0.24; tube.add(barrel);
  for (const y of [0.0, 0.24, 0.46]) { const band = new THREE.Mesh(new THREE.CylinderGeometry(r(y) + 0.01, r(y) + 0.01, 0.032, 18), brass); band.position.y = y; tube.add(band); }
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.078, 0.14, 18, 1, true), navy); shield.material = M('#1c3068', { metalness: 0.15, roughness: 0.55, side: THREE.DoubleSide }); shield.position.y = 0.6; tube.add(shield);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.072, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), glass); lens.scale.y = 0.45; lens.position.y = 0.55; tube.add(lens); // bright convex objective
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 24), brass); bezel.rotation.x = Math.PI / 2; bezel.position.y = 0.56; tube.add(bezel);
  const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.036, 0.15, 12), brass); eye.position.y = -0.15; tube.add(eye);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 12), dark); cap.position.y = -0.228; tube.add(cap);
  const focus = new THREE.Mesh(new THREE.TorusGeometry(0.043, 0.013, 6, 14), brass); focus.rotation.x = Math.PI / 2; focus.position.y = -0.04; tube.add(focus);
  const finder = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.018, 0.26, 10), navy); finder.position.set(0, 0.32, -0.105); tube.add(finder);
  for (const y of [0.22, 0.4]) { const br = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.07), brass); br.position.set(0, y, -0.07); tube.add(br); }
  const fl = new THREE.Mesh(new THREE.CircleGeometry(0.018, 10), glass); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.452, -0.105); tube.add(fl);
  g.userData.legs = legs; g.userData.hub = hub; g.userData.tube = tube;
  g.scale.setScalar(1.2);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  g.userData.base = new THREE.Vector3(0, 0.3, 0); g.userData.tip = new THREE.Vector3(0, 1.0, 0.4); g.userData.hitR = 0.08; g.userData.trail = [0.4, 0.75, 1];
  return g;
}

export const WEAPON_MESH = { blaster: buildBlasterRifle, telescope: buildTelescope, sword: buildSword, axe: buildAxe, bow: buildPearlbow, guitar: buildGuitar, rubypaw: buildRubypaw, astralboard: buildAstralboard };

// ── chests ───────────────────────────────────────────────────────────
// One standard chest, two finishes. Every chest in the game is this size.
//   common   · wooden: oak planks, black-iron bands and lock · coins inside
//   uncommon · silver: dark slate wood, polished silver bands and lock, a pale-blue gem · a weapon inside
//   gold     · gilded: gold body and bands, a blue crystal lock · a Lightbulb inside
export const CHEST = { w: 1.1, d: 0.7, h: 0.55 }; // body size (units); the rounded lid adds ~0.22
const FINISH = {
  common: { wood: '#7a5230', dark: '#553823', band: '#3b3d42', bandM: 0.6, gem: null, glow: '#ffcf7a', inner: '#e9c982' },
  uncommon: { wood: '#4d5561', dark: '#363c46', band: '#d6dde6', bandM: 0.95, gem: '#bfe4ff', glow: '#dff0ff', inner: '#cfe6ff' },
  // gold · gilded body, bright gold bands, a blue crystal lock · a Lightbulb inside (focus-moves.js)
  gold: { wood: '#c08a2a', woodM: 0.75, woodR: 0.35, dark: '#5e3f0e', band: '#ffd76a', bandM: 1, gem: '#4fa8ff', glow: '#ffd98a', inner: '#ffe7a8' }
};
export function buildChest(tier = 'common') {
  const F = FINISH[tier] || FINISH.common, root = new THREE.Group();
  const wood = M(F.wood, { roughness: F.woodR ?? 0.82, metalness: F.woodM ?? 0 }), dark = M(F.dark, { roughness: 0.88 }), band = M(F.band, { metalness: F.bandM, roughness: tier !== 'common' ? 0.22 : 0.5 });
  const { w: W, d: D, h: H } = CHEST;
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wood); body.position.y = H / 2; root.add(body);
  for (const y of [H * 0.33, H * 0.66]) { const seam = new THREE.Mesh(new THREE.BoxGeometry(W + 0.005, 0.012, D + 0.005), dark); seam.position.y = y; root.add(seam); } // plank lines
  const inner = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.1), M('#2b1d12', { emissive: new THREE.Color(F.inner), emissiveIntensity: 0 })); inner.position.y = H - 0.05; root.add(inner);
  for (const x of [-W / 2 + 0.06, W / 2 - 0.06]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, H + 0.02, D + 0.03), band); b.position.set(x, H / 2, 0); root.add(b); }
  const rim = new THREE.Mesh(new THREE.BoxGeometry(W + 0.03, 0.05, D + 0.03), band); rim.position.y = H; root.add(rim);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(W + 0.05, 0.06, D + 0.05), dark); foot.position.y = 0.03; root.add(foot);
  // lid hinged along the back edge
  const hinge = new THREE.Group(); hinge.position.set(0, H, -D / 2); root.add(hinge);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(D / 2, D / 2, W, 12, 1, false, 0, Math.PI), M(F.wood, { roughness: F.woodR ?? 0.82, metalness: F.woodM ?? 0, side: THREE.DoubleSide })); lid.rotation.set(0, 0, Math.PI / 2); lid.scale.set(0.62, 1, 1); lid.position.set(0, 0, D / 2); hinge.add(lid);
  for (const x of [-W / 2 + 0.06, 0, W / 2 - 0.06]) { const arc = new THREE.Mesh(new THREE.TorusGeometry(D / 2, 0.03, 5, 14, Math.PI), band); arc.rotation.set(0, Math.PI / 2, 0); arc.scale.set(1, 0.62, 1); arc.position.set(x, 0, D / 2); hinge.add(arc); }
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.2, 0.05), band); lock.position.set(0, H - 0.06, D / 2 + 0.02); root.add(lock);
  let lockGem = null;
  if (F.gem) { lockGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), M(F.gem, { roughness: 0.15, metalness: 0.2, emissive: new THREE.Color(F.gem), emissiveIntensity: 0.9 })); lockGem.position.set(0, H - 0.06, D / 2 + 0.06); root.add(lockGem); }
  else { const hole = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.01), M('#111111')); hole.position.set(0, H - 0.08, D / 2 + 0.05); root.add(hole); }
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // No real light per chest (every point light costs every lit pixel on screen): a stand-in the shared chest light reads.
  const light = { intensity: 0, color: new THREE.Color(F.glow), at: new THREE.Vector3(0, H + 0.4, 0), root }; CHEST_GLOWS.push(light);
  return { root, hinge, inner, light, lockGem, H, D, tier };
}
// One real point light serves every chest: each frame it sits on the brightest glowing chest near Rizer.
const CHEST_GLOWS = [];
export function createChestLight(scene) {
  const L = new THREE.PointLight('#ffd98a', 0, 6, 2); scene.add(L); const w = new THREE.Vector3();
  return { off() { L.intensity = 0; }, update(p) {
    let best = null, bi = 0.05;
    for (const g of CHEST_GLOWS) { if (g.intensity <= bi || !g.root.visible) continue; g.root.getWorldPosition(w); if (Math.hypot(w.x - p.x, w.z - p.z) > 45) continue; bi = g.intensity; best = g; }
    L.intensity = best ? best.intensity : 0;
    if (best) { L.color.copy(best.color); L.position.copy(best.at).applyMatrix4(best.root.matrixWorld); }
  } };
}
// Chests collide through their rendered geometry, never a broader invisible box.
function chestCollider(world, x, z, y, face, mesh) { world.addMesh?.(mesh); }
// Where Rizer stands to open a chest: square in front of the lock, facing it.
export function chestFront(C) { const f = C.root.rotation.y, p = C.root.position; return { x: p.x + Math.sin(f) * 1.15, z: p.z + Math.cos(f) * 1.15, face: f + Math.PI, around: { x: p.x, z: p.z, r: 0.66 } }; }

// ── playtest layout: every silver and gold chest in two arcs in front of Rizer's porch ──
// PLAYTEST_PORCH_CHESTS on: the six silver chests (weapons, rides) stand in an inner arc and the six gold Lightbulb
// chests (focus-moves.js) in an outer one, all facing the porch, on clear ground (no walls, water, slopes, nor the
// West Lake bus parked beside the porch). Off: each chest goes back to its own place in the world. Chest progress is
// saved by chest id, so moving them never resets what was opened or collected.
export const PLAYTEST_PORCH_CHESTS = true;
let porchCache = null;
export function porchChestSpots(W, world) {
  if (porchCache) return porchCache;
  const s = W.playerStart, chosen = [], avoid = [{ x: s.x + 14, z: s.z + 8, r: 8 }]; // the bus
  const clear = (cx, cz, r) => { const probe = new THREE.Vector3(cx, world.groundAt(cx, cz), cz); return !world.resolve(probe, r) && world.waterAt(cx, cz) < world.heightAt(cx, cz) - 0.2 && Math.abs(world.heightAt(cx + 1.5, cz) - world.heightAt(cx - 1.5, cz)) < 0.7 && Math.abs(world.heightAt(cx, cz + 1.5) - world.heightAt(cx, cz - 1.5)) < 0.7; };
  const ring = (r0, n) => {
    const out = [];
    for (const r of [r0, r0 + 1.5, r0 + 3, r0 + 4.5]) {
      for (let k = 0; k <= 26 && out.length < n; k++) { // fan out from straight ahead of the porch, alternating sides
        const da = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.19, a = s.facing + da, x = s.x + Math.sin(a) * r, z = s.z + Math.cos(a) * r;
        if (Math.abs(da) > 1.75 || !clear(x, z, 1.4) || avoid.some(o => Math.hypot(o.x - x, o.z - z) < o.r) || chosen.some(c => Math.hypot(c.x - x, c.z - z) < 3.3)) continue;
        const spot = { x, z, face: Math.atan2(s.x - x, s.z - z) }; out.push(spot); chosen.push(spot);
      }
      if (out.length >= n) break;
    }
    return out.sort((a, b) => Math.atan2(a.x - s.x, a.z - s.z) - Math.atan2(b.x - s.x, b.z - s.z));
  };
  const silver = ring(7.5, 6), gold = ring(12, 6);
  return (porchCache = { silver, gold });
}

// ── the silver weapon chests by Rizer's home ─────────────────────────
// Three near the doorstep, with clear walk-up space and lids toward Rizer's home.
export function createLoot(scene, world, fx, W) {
  const porch = PLAYTEST_PORCH_CHESTS ? porchChestSpots(W, world).silver : null, atPorch = (i, o) => porch?.[i] ? { ...o, ...porch[i] } : o;
  const s = W.playerStart; let x = s.x, z = s.z, face = 0, side = 1;
  const clear = (cx, cz, r) => { const probe = new THREE.Vector3(cx, world.groundAt(cx, cz), cz); return !world.resolve(probe, r) && world.waterAt(cx, cz) < world.heightAt(cx, cz) - 0.2 && Math.abs(world.heightAt(cx + 1.5, cz) - world.heightAt(cx - 1.5, cz)) < 0.35 && Math.abs(world.heightAt(cx, cz + 1.5) - world.heightAt(cx, cz - 1.5)) < 0.35; };
  // Near Rizer's front door, in the first open spot with room for both chests, a few steps off the way he faces at the start.
  search: for (const r of [8.5, 9.5, 11, 12.5, 14]) for (const da of [0.55, -0.55, 0.9, -0.9, 0.25, -0.25, 1.3, -1.3]) {
    const a = s.facing + da, cx = s.x + Math.sin(a) * r, cz = s.z + Math.cos(a) * r, f = Math.atan2(s.x - cx, s.z - cz);
    if (!clear(cx, cz, 2.2)) continue;
    for (const sd of [1, -1]) { const ox = cx + Math.cos(f) * 3.6 * sd, oz = cz - Math.sin(f) * 3.6 * sd; if (clear(ox, oz, 1.6)) { x = cx; z = cz; face = f; side = sd; break search; } }
  }
  const sword = itemChest(scene, world, fx, atPorch(0, { id: 'rizer-chest', item: 'sword', x, z, face, isOpen: () => !!inventory.chestOpen, setOpen: () => { inventory.chestOpen = true; } }));
  const ax = x + Math.cos(face) * 3.6 * side, az = z - Math.sin(face) * 3.6 * side;
  const axe = itemChest(scene, world, fx, atPorch(1, { id: 'emeralix-chest', item: 'axe', x: ax, z: az, face, isOpen: () => !!inventory.chests?.['emeralix-chest'], setOpen: () => { (inventory.chests ||= {})['emeralix-chest'] = 1; } }));
  let bx = x - Math.cos(face) * 3.6 * side, bz = z + Math.sin(face) * 3.6 * side;
  if (!clear(bx, bz, 1.6)) {
    bowSpot: for (const r of [3.8, 4.6, 5.6, 7]) for (let i = 0; i < 12; i++) {
      const a = face + i * Math.PI / 6, tx = x + Math.sin(a) * r, tz = z + Math.cos(a) * r;
      if (Math.hypot(tx - ax, tz - az) > 3.4 && Math.hypot(tx - x, tz - z) > 3.4 && clear(tx, tz, 1.6)) { bx = tx; bz = tz; break bowSpot; }
    }
  }
  const bow = itemChest(scene, world, fx, atPorch(2, { id: 'ivirium-chest', item: 'bow', x: bx, z: bz, face, isOpen: () => !!inventory.chests?.['ivirium-chest'], setOpen: () => { (inventory.chests ||= {})['ivirium-chest'] = 1; } }));
  // Rubypaw Sword's chest: a fourth silver chest in the same home cluster, tucked wherever there's still
  // room around the sword/axe/bow trio.
  let rx = x, rz = z + 2.5;
  rubySpot: for (const r of [3.8, 4.6, 5.6, 7, 9]) for (let i = 0; i < 14; i++) {
    const a = face + i * (Math.PI / 7), tx = x + Math.sin(a) * r, tz = z + Math.cos(a) * r;
    if (Math.hypot(tx - ax, tz - az) > 3.4 && Math.hypot(tx - bx, tz - bz) > 3.4 && Math.hypot(tx - x, tz - z) > 3.4 && clear(tx, tz, 1.6)) { rx = tx; rz = tz; break rubySpot; }
  }
  const rface = Math.atan2(x - rx, z - rz);
  const rubypaw = itemChest(scene, world, fx, atPorch(3, { id: 'rubypaw-chest', item: 'rubypaw', x: rx, z: rz, face: rface, isOpen: () => !!inventory.chests?.['rubypaw-chest'], setOpen: () => { (inventory.chests ||= {})['rubypaw-chest'] = 1; } }));
  // The spot on the west side of Malezor Square's fountain anchors the Astralboard and Telescope chests. (Psychosyd's guitar
  // used to wait in a chest here; it now lies on the floor of Rizer's room, home-interior.js.)
  const P = W.plaza; let gx = P.x - (P.r - 3), gz = P.z, gFace = Math.PI / 2;
  guitarSpot: for (const r of [P.r - 3, P.r - 5, P.r - 1.5]) for (const a of [-Math.PI / 2, -Math.PI / 2 + 0.35, -Math.PI / 2 - 0.35, -Math.PI / 2 + 0.7, -Math.PI / 2 - 0.7, Math.PI, 0]) {
    const tx = P.x + Math.sin(a) * r, tz = P.z + Math.cos(a) * r;
    if (clear(tx, tz, 1.8)) { gx = tx; gz = tz; gFace = Math.atan2(P.x - tx, P.z - tz); break guitarSpot; }
  }
  // Astralboard chest sits beside that spot in Malezor Square.
  let qx = gx + Math.cos(gFace) * 3.6, qz = gz - Math.sin(gFace) * 3.6;
  if (!clear(qx, qz, 1.6)) { qx = gx - Math.cos(gFace) * 3.6; qz = gz + Math.sin(gFace) * 3.6; }
  const astralboard = itemChest(scene, world, fx, atPorch(4, { id: 'astralboard-chest', item: 'astralboard', ride: true, x: qx, z: qz, face: gFace, isOpen: () => !!inventory.chests?.['astralboard-chest'], setOpen: () => { (inventory.chests ||= {})['astralboard-chest'] = 1; } }));
  // Stargazer Telescope chest: on the spot's other side from the Astralboard, so the two face each other across it.
  let sx = 2 * gx - qx, sz = 2 * gz - qz;
  if (!clear(sx, sz, 1.6)) { sx = qx + (qx - gx); sz = qz + (qz - gz); }
  const telescope = itemChest(scene, world, fx, atPorch(5, { id: 'stargazer-chest', item: 'telescope', x: sx, z: sz, face: gFace, isOpen: () => !!inventory.chests?.['stargazer-chest'], setOpen: () => { (inventory.chests ||= {})['stargazer-chest'] = 1; } }));
  const all = [sword, axe, bow, rubypaw, astralboard, telescope];
  return { all, sword, axe, bow, rubypaw, astralboard, telescope, update: (dt, t) => all.forEach(c => c.update(dt, t)), get spot() { return sword.spot; } };
}

// One silver chest holding one weapon. States: closed → opening → launch → waiting → empty.
function itemChest(scene, world, fx, { id, item, ride = false, x, z, face, isOpen, setOpen }) {
  const W8 = WEAPONS[item] || RIDES[item], tint = W8.color || '#bcd6ff';
  const y = world.groundAt(x, z);
  const C = buildChest('uncommon'); C.root.position.set(x, y, z); C.root.rotation.y = face; scene.add(C.root); // silver: an uncommon-or-better weapon inside, no coins
  chestCollider(world, x, z, y, face, C.root);
  const front = new THREE.Vector3(Math.sin(face), 0, Math.cos(face));
  const mesh = WEAPON_MESH[item](); mesh.visible = false; scene.add(mesh);
  const rest = new THREE.Vector3(x, y, z).addScaledVector(front, 1.25); rest.y = y + 0.36; // hovers where Rizer's hand closes in the pick-up clip (he reaches from the front, a step back from the lid)
  const owns = () => ride ? (inventory.rides || []).includes(item) : hasWeapon(item);
  let state = isOpen() ? (owns() ? 'empty' : 'waiting') : 'closed', t = 0;
  if (state !== 'closed') C.hinge.rotation.x = -1.9;
  if (state === 'waiting') { mesh.visible = true; mesh.position.copy(rest); }
  const spot = { // the chest as an interactable (hud.js prompts for it like any place)
    id, kind: 'chest', item, discover: false, reach: 3.2,
    get name() { return state === 'closed' ? 'Open silver chest' : state === 'waiting' ? `Take the ${W8.name}` : 'Empty chest'; },
    get x() { return state === 'waiting' ? rest.x : x; }, get z() { return state === 'waiting' ? rest.z : z; },
    get cx() { return state === 'waiting' ? rest.x : x; }, get cz() { return state === 'waiting' ? rest.z : z; }
  };
  world.interactables.push(spot);
  function open() { if (state !== 'closed') return false; state = 'opening'; t = 0; setOpen(); saveInv(); return true; }
  // While Rizer reaches for it: k (0-1) of the way into his hand, whose grip sits at pos / quat.
  let reach = null;
  function attract(k, pos, quat) {
    if (state !== 'waiting') return;
    if (!reach) reach = { from: mesh.position.clone(), fromQ: mesh.quaternion.clone(), pos: new THREE.Vector3(), quat: new THREE.Quaternion(), k: 0 };
    reach.k = Math.min(1, Math.max(reach.k, k)); reach.pos.copy(pos); reach.quat.copy(quat);
  }
  // Rizer grabs it (called at the grab frame of the pick-up clip).
  function take() {
    if (state !== 'waiting') return false;
    state = 'empty'; mesh.visible = false; reach = null;
    if (ride) { const rides = inventory.rides ||= []; if (!rides.includes(item)) rides.push(item); }
    else if (!hasWeapon(item)) inventory.owned.push(item);
    saveInv();
    fx.emit(rest.x, rest.y, rest.z, 18, { color: tint, speed: 2.2, up: 1.2, size: 0.35, life: 0.5, g: 0 });
    return true;
  }
  const arcFrom = new THREE.Vector3();
  function update(dt, time) {
    t += dt;
    if (C.lockGem) C.lockGem.rotation.y += dt * 1.5;
    if (state === 'opening') {
      const k = Math.min(1, t / 0.55), e = 1 - Math.pow(1 - k, 3);
      C.hinge.rotation.x = -1.9 * e + Math.sin(k * Math.PI) * -0.1;
      C.light.intensity = 9 * e; C.inner.material.emissiveIntensity = 1.4 * e;
      if (k >= 1) {
        state = 'launch'; t = 0; mesh.visible = true; arcFrom.set(x, y + C.H, z);
        fx.emit(x, y + C.H + 0.2, z, 30, { color: '#ffd98a', speed: 3.2, up: 3, size: 0.45, life: 0.8, g: 3 });
        fx.emit(x, y + C.H + 0.2, z, 14, { color: tint, speed: 2, up: 2.5, size: 0.35, life: 0.7, g: 1 });
      }
    } else if (state === 'launch') { // springs up out of the chest, spins, drifts to the front and settles
      const k = Math.min(1, t / 1.1), e = k * k * (3 - 2 * k);
      mesh.position.lerpVectors(arcFrom, rest, e); mesh.position.y += Math.sin(k * Math.PI) * 2.4;
      mesh.rotation.set(0, k * Math.PI * 4, (1 - e) * 0.4);
      C.light.intensity = 9 - 5 * k;
      if (Math.random() < dt * 40) fx.emit(mesh.position.x, mesh.position.y + 0.6, mesh.position.z, 1, { color: tint, speed: 0.3, up: 0.1, size: 0.3, life: 0.5, g: 0, spread: 0.1 });
      if (k >= 1) { state = 'waiting'; t = 0; fx.emit(rest.x, rest.y, rest.z, 16, { color: '#ffd98a', speed: 1.6, up: 0.8, size: 0.35, life: 0.6, g: 0 }); }
    } else if (state === 'waiting' && reach) { // being taken: it floats into Rizer's closing hand
      const k = reach.k * reach.k * (3 - 2 * reach.k);
      mesh.position.lerpVectors(reach.from, reach.pos, k); mesh.quaternion.slerpQuaternions(reach.fromQ, reach.quat, k);
      C.light.intensity = 4 * (1 - k);
    } else if (state === 'waiting') { // hovers, turning slowly, head up
      mesh.position.set(rest.x, rest.y + 0.08 + Math.sin(time * 2) * 0.06, rest.z);
      mesh.rotation.set(0, time * 1.2, 0.08);
      C.light.intensity = 4 + Math.sin(time * 3) * 0.8;
      if (Math.random() < dt * 8) fx.emit(rest.x, rest.y + 0.4 + Math.random() * 0.6, rest.z, 1, { color: tint, speed: 0.2, up: 0.4, size: 0.25, life: 0.8, g: -0.3, spread: 0.15 });
    } else if (state === 'empty') { C.light.intensity = Math.max(0, C.light.intensity - dt * 4); C.inner.material.emissiveIntensity = Math.max(0.2, C.inner.material.emissiveIntensity - dt); }
  }
  return { id, item, ride, spot, open, take, attract, update, rest, chest: C.root, mesh, front: () => chestFront(C), dir: front, get state() { return state; } };
}

// ── common wooden chests scattered through Malezor: 1–100 coins each, opened once ──
export function createCommonChests(scene, world, fx, W, isCore, avoid = [], onPop, onPiles) {
  const opened = inventory.chests ||= {};
  let seed = ((W.seed || 7) + 9191) >>> 0;
  const r = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const B = (world.bound || 300) - 10, list = [], probe = new THREE.Vector3(), taken = [...avoid];
  const want = { core: 12, wild: 36 }, got = { core: 0, wild: 0 };
  for (let t = 0; t < 8000 && list.length < want.core + want.wild; t++) {
    const x = (r() * 2 - 1) * B, z = (r() * 2 - 1) * B;
    if (!world.containsLand(x, z) || world.waterAt(x, z) > world.heightAt(x, z) - 0.2) continue;
    if (world.T?.pads?.some(p => p.late && Math.hypot(x - p.x, z - p.z) < p.r)) continue; // never on a later addition's pad (the stadium): the rest keep their places and ids
    const zone = isCore(x, z) ? 'core' : 'wild'; if (got[zone] >= want[zone]) continue;
    if (Math.abs(world.heightAt(x + 1.2, z) - world.heightAt(x - 1.2, z)) > 0.35 || Math.abs(world.heightAt(x, z + 1.2) - world.heightAt(x, z - 1.2)) > 0.35) continue;
    if (taken.some(p => Math.hypot(p.x - x, p.z - z) < (zone === 'core' ? 12 : 28))) continue;
    probe.set(x, world.heightAt(x, z), z); if (world.resolve(probe, 2.2)) continue; // room to walk up to it
    const face = r() * Math.PI * 2, f = { x: x + Math.sin(face) * 1.05, z: z + Math.cos(face) * 1.05 };
    got[zone]++; taken.push({ x, z }); list.push({ id: `chest-${zone}-${got[zone]}`, x, z, face });
  }
  const chests = list.map(c => {
    const y = world.groundAt(c.x, c.z), C = buildChest('common'); C.root.position.set(c.x, y, c.z); C.root.rotation.y = c.face; scene.add(C.root);
    chestCollider(world, c.x, c.z, y, c.face, C.root);
    const ch = { ...c, y, C, state: opened[c.id] ? 'empty' : 'closed', t: 0 };
    if (ch.state === 'empty') { C.hinge.rotation.x = -1.9; C.inner.material.emissiveIntensity = 0.2; }
    ch.spot = { id: c.id, kind: 'chest', common: true, chest: ch, discover: false, reach: 3.2, name: 'Open wooden chest', x: c.x, z: c.z, cx: c.x, cz: c.z };
    if (ch.state === 'closed') world.interactables.push(ch.spot);
    return ch;
  });
  // Open it: rolls the chest's reward ONCE — 1–3 coin piles, each with its own class and value (coin-piles.js) —
  // and returns how many piles it holds, or 0 if it's already open. The chest is marked looted here (saved), so
  // it can never roll again. Nothing goes into the bag yet: the piles fly out of the chest as the lid opens
  // (update() below → onPiles) and pay their value when Rizer picks them up.
  // Opened by Astralift (astral=true) the burst is bigger and onPop fires.
  function open(ch, { astral = false } = {}) {
    if (ch.state !== 'closed') return 0;
    const piles = rollChestPiles();
    ch.state = 'opening'; ch.t = 0; ch.piles = piles; ch.astral = astral; opened[ch.id] = piles.reduce((s, p) => s + p.value, 0) || 1;
    const i = world.interactables.indexOf(ch.spot); if (i >= 0) world.interactables.splice(i, 1);
    saveInv();
    return piles.length;
  }
  let shown = true;
  function update(dt, p) {
    for (const ch of chests) {
      if (p && shown) ch.C.root.visible = Math.hypot(ch.x - p.x, ch.z - p.z) < 70; // far chests aren't drawn (7 draw calls each)
      if (ch.state !== 'opening') continue;
      ch.t += dt; const k = Math.min(1, ch.t / 0.5), e = 1 - Math.pow(1 - k, 3), C = ch.C;
      C.hinge.rotation.x = -1.9 * e; C.light.intensity = 6 * Math.sin(k * Math.PI) + 1.5 * e; C.inner.material.emissiveIntensity = 1.2 * e;
      if (k >= 0.35 && !ch.burst) {
        ch.burst = true;
        const piles = ch.piles || []; ch.piles = null;
        if (piles.length) onPiles?.(ch, piles, { x: ch.x, y: ch.y + CHEST.h + 0.2, z: ch.z }); // the reward point: the piles leave from here
        if (ch.astral) { // Astralift: a bigger, showier burst as the piles launch out
          fx.emit(ch.x, ch.y + CHEST.h + 0.2, ch.z, 46, { color: '#ffd24a', speed: 4.4, up: 5.2, size: 0.42, life: 1.1, g: 7 });
          fx.emit(ch.x, ch.y + CHEST.h + 0.2, ch.z, 20, { color: '#fff2b8', speed: 3.2, up: 4.2, size: 0.3, life: 0.95, g: 6 });
          onPop?.(ch, piles.length);
        } else {
          fx.emit(ch.x, ch.y + CHEST.h + 0.2, ch.z, 26, { color: '#ffd24a', speed: 2.6, up: 3.2, size: 0.3, life: 0.8, g: 6 });
        }
      }
      if (k >= 1) { ch.state = 'empty'; C.light.intensity = 0; C.inner.material.emissiveIntensity = 0.2; }
    }
  }
  const setVisible = v => { shown = v; for (const ch of chests) ch.C.root.visible = v; };
  return { chests, open, update, setVisible, front: ch => chestFront(ch.C) };
}

// ── weapons on Rizer: in his hand when drawn, stowed on his body otherwise, plus the swing trail ──
// Mounts are described in character space at the rest pose (+Z forward, +Y up, +X his left):
// an offset from the bone, the weapon's +Y direction ("blade") and its +X direction ("edge").
// Everything carried on his back rides the upper spine (Spine2), not the hips, so it leans, twists and runs with his
// torso instead of hanging in the air behind it. `off` is measured from that bone; his back (the pack) is about 0.14
// behind it at rest, so an offset of −0.16…−0.2 lays a weapon flat against it. The spine itself slopes back as it
// rises (about 0.25 per unit of height), which is why every back `blade` carries a z component: parallel to the back.
const BACK = 'mixamorigSpine2';
const HEAVY_BACK = { // the Jaded Axe: haft across the back, head behind his right shoulder, butt at the left hip
  bone: BACK, off: new THREE.Vector3(0.24, -0.2, -0.15),
  blade: new THREE.Vector3(-0.43, 0.9, -0.22), edge: new THREE.Vector3(-0.9, -0.43, 0)
};
const MOUNTS = {
  sword: {
    hand: { bone: 'mixamorigRightHand', off: new THREE.Vector3(0.0, -0.08, 0.02), blade: new THREE.Vector3(0, 0.12, 1), edge: new THREE.Vector3(0, 1, -0.12) },
    stow: { bone: 'mixamorigHips', off: new THREE.Vector3(0.21, 0.02, 0.14), blade: new THREE.Vector3(0.14, -0.55, -0.83), edge: new THREE.Vector3(0, -0.83, 0.55) } // at the hip, point down and back
  },
  // Rubypaw is a heavy longsword: right-hand grip, diagonal back mount.
  rubypaw: {
    hand: { bone: 'mixamorigRightHand', off: new THREE.Vector3(0.0, -0.08, 0.02), blade: new THREE.Vector3(0, 0.12, 1), edge: new THREE.Vector3(0, 1, -0.12) },
    stow: { bone: BACK, off: new THREE.Vector3(-0.2, 0.2, -0.16), blade: new THREE.Vector3(0.43, -0.9, 0.22), edge: new THREE.Vector3(0.9, 0.43, 0), scale: 0.82 } // hilt up over his right shoulder, blade down across the back to the left leg
  },
  axe: { // gripped low on the haft; heavy head out ahead of the fist
    hand: { bone: 'mixamorigRightHand', off: new THREE.Vector3(0.0, -0.08, 0.02), blade: new THREE.Vector3(0, 0.12, 1), edge: new THREE.Vector3(0, 1, -0.12) },
    stow: HEAVY_BACK
  },
  bow: {
    // Solved in the Aim Bow pose (hand-local): limbs stand upright, string toward Rizer, grip in the palm.
    hand: { bone: 'mixamorigLeftHand', local: { pos: [-0.02, 0.11, 0.012], quat: [-0.5635, 0.7322, -0.3297, 0.1939], scale: 1 } },
    // Keep the bow across the middle of his back: gold grip just under the left
    // shoulder, upper limb angled toward the spine. Reverse its face so the pearls
    // (+Z on the bow mesh) look outward behind Rizer rather than into his coat.
    stow: { bone: BACK, off: new THREE.Vector3(0.12, 0.147, -0.17), blade: new THREE.Vector3(-0.22, 1, -0.25), edge: new THREE.Vector3(-1, -0.22, 0) }
  },
  guitar: {
    hand: { bone: 'mixamorigRightHand', off: new THREE.Vector3(0, -0.634, -0.063), blade: new THREE.Vector3(0, 1, 0.15), edge: new THREE.Vector3(0, -0.15, 1) }, // carried by the neck, body down beside his leg
    stow: { bone: BACK, off: new THREE.Vector3(0, 0.087, -0.2), blade: new THREE.Vector3(0.33, 0.94, -0.23), edge: new THREE.Vector3(-0.94, 0.33, 0) }, // slung across his back, neck over the left shoulder, closer to center-back
    play: { bone: 'mixamorigHips', off: new THREE.Vector3(-0.14, -0.04, 0.2), blade: new THREE.Vector3(1, 0.25, -0.05), edge: new THREE.Vector3(0.25, -1, 0) } // Guitar Playing: body at his right hip, neck across to the fretting hand
  },
  telescope: { // carried folded by the hub, tripod hanging forward of his leg; slung across the back when stowed (it's set up with □, see game.js · toggleScope)
    hand: { bone: 'mixamorigRightHand', off: new THREE.Vector3(0, -0.8, 0.0), blade: new THREE.Vector3(0, 1, 0.3), edge: new THREE.Vector3(0, -0.3, 1) },
    stow: { bone: BACK, off: new THREE.Vector3(0, -0.34, -0.2), blade: new THREE.Vector3(0.12, 0.97, -0.24), edge: new THREE.Vector3(-0.97, 0.12, 0), scale: 0.6 } // packed small, tripod down his back
  },
  blaster: { // the rifle's own axes: +Z barrel, +Y up. `blade` is its +Y and `edge` its +X, so (0,1,0) / (1,0,0) points the barrel straight ahead
    hand: { bone: 'mixamorigRightHand', off: new THREE.Vector3(0, 0.03, 0.1), blade: new THREE.Vector3(0, 0.6, 0.8), edge: new THREE.Vector3(1, 0, 0) },      // carried by the grip, barrel down and ahead
    stow: { bone: BACK, off: new THREE.Vector3(0, 0.057, -0.19), blade: new THREE.Vector3(0, 0, -1), edge: new THREE.Vector3(0.94, -0.35, 0) },      // slung across his back, muzzle over the left shoulder
    aim: { bone: 'mixamorigSpine2', off: new THREE.Vector3(-0.13, 0.1, 0.17), blade: new THREE.Vector3(0, 1, 0), edge: new THREE.Vector3(1, 0, 0) }           // shouldered: the weaponSocket every rifle humanoid uses (thardin-rifle.js RIFLE_HOLD.aim)
  }
};
export function createHeldWeapons(scene) {
  const meshes = Object.fromEntries(Object.keys(MOUNTS).map(k => { const m = WEAPON_MESH[k](); m.visible = false; return [k, m]; }));
  const where = {}; let actor = null; const hidden = new Set(); // hidden: weapons that are out in the world instead (the deployed telescope)
  const restCache = new WeakMap();
  function mountFor(a, key, m) { // bone-local position + rotation for a character-space mount
    let per = restCache.get(a.gltf); if (!per) restCache.set(a.gltf, per = {});
    const ck = key + ':' + m.bone + ':' + (m === MOUNTS[key].hand ? 'h' : m === MOUNTS[key].play ? 'p' : m === MOUNTS[key].aim ? 'a' : 's');
    if (per[ck]) return per[ck];
    const src = a.gltf.scene, bone = src.getObjectByName(m.bone); src.updateMatrixWorld(true);
    const rel = src.matrixWorld.clone().invert().multiply(bone.matrixWorld), inv = rel.clone().invert();
    const bp = new THREE.Vector3().setFromMatrixPosition(rel);
    const Y = m.blade.clone().normalize(), X = m.edge.clone().sub(Y.clone().multiplyScalar(m.edge.dot(Y))).normalize(), Z = new THREE.Vector3().crossVectors(X, Y);
    const charQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
    const boneQ = new THREE.Quaternion(); rel.decompose(new THREE.Vector3(), boneQ, new THREE.Vector3());
    const out = { pos: bp.clone().add(m.off).applyMatrix4(inv), rot: boneQ.clone().invert().multiply(charQ), scale: new THREE.Vector3().setFromMatrixScale(rel) };
    return (per[ck] = out);
  }
  // swing trail: a ribbon through the last positions of the weapon in hand
  const N = 14, pos = new Float32Array(N * 2 * 3), alpha = new Float32Array(N * 2), idx = [];
  for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1)); geo.setIndex(idx);
  const uCol = { value: new THREE.Color(0.25, 0.5, 1.0) };
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uCol },
    vertexShader: 'attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uCol; varying float vA; void main(){ gl_FragColor = vec4(mix(uCol, vec3(0.92,1.0,0.95), vA) * 1.6, vA * 0.75); }'
  });
  const trail = new THREE.Mesh(geo, mat); trail.frustumCulled = false; trail.visible = false; scene.add(trail);
  const hist = []; const a = new THREE.Vector3(), b = new THREE.Vector3();
  // Put each weapon on `act`'s rig: states = { sword: 'hand' | 'stow' | null, axe: … } (null hides it).
  function place(act, states) {
    for (const k in meshes) {
      const at = states[k] || null, mesh = meshes[k];
      if (mesh.userData.stowedArrow) mesh.userData.stowedArrow.visible = at === 'stow';
      if (act === actor && where[k] === at) continue; where[k] = at;
      if (mesh.parent) mesh.parent.remove(mesh);
      const m = at && MOUNTS[k][at], bone = m && act?.model.getObjectByName(m.bone);
      if (!bone) continue;
      bone.add(mesh);
      if (m.local) { mesh.position.fromArray(m.local.pos); mesh.quaternion.fromArray(m.local.quat).normalize(); mesh.scale.setScalar(m.local.scale); continue; }
      const mt = mountFor(act, k, m);
      mesh.position.copy(mt.pos); mesh.quaternion.copy(mt.rot);
      mesh.scale.set((m.scale || 1) / mt.scale.x, (m.scale || 1) / mt.scale.y, (m.scale || 1) / mt.scale.z); // undo rig scale; heavy back mounts may size the prop
    }
    actor = act;
  }
  const inHand = () => Object.keys(meshes).find(k => where[k] === 'hand' && meshes[k].parent && k !== 'guitar' && k !== 'telescope' && k !== 'blaster') || null; // (the guitar isn't a blade: no contact, no trail)
  function update(dt, visible, swinging) {
    for (const k in meshes) meshes[k].visible = visible && !!meshes[k].parent && !hidden.has(k);
    const k = inHand(), w = k && meshes[k], on = !!w && w.visible && swinging;
    if (w) { const c = w.userData.trail; uCol.value.setRGB(c[0], c[1], c[2]); }
    if (w?.visible) {
      w.updateMatrixWorld(true);
      a.copy(w.userData.base).applyMatrix4(w.matrixWorld); b.copy(w.userData.tip).applyMatrix4(w.matrixWorld);
      hist.unshift({ a: a.clone(), b: b.clone(), life: on ? 1 : 0 });
    } else hist.unshift({ a: a.clone(), b: b.clone(), life: 0 });
    hist.length = Math.min(hist.length, N);
    let any = false;
    for (let i = 0; i < N; i++) {
      const h = hist[Math.min(i, hist.length - 1)]; if (!h) continue;
      h.life = Math.max(0, h.life - dt * 3.5);
      pos.set([h.a.x, h.a.y, h.a.z], i * 6); pos.set([h.b.x, h.b.y, h.b.z], i * 6 + 3);
      const f = h.life * (1 - i / N); alpha[i * 2] = f * 0.3; alpha[i * 2 + 1] = f; if (f > 0.01) any = true;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.alpha.needsUpdate = true;
    trail.visible = any;
  }
  // The weapon in hand as a contact capsule (world space): { a, b, r } or null.
  const _ha = new THREE.Vector3(), _hb = new THREE.Vector3();
  function contact() {
    const k = inHand(), w = k && meshes[k]; if (!w?.visible) return null;
    w.updateMatrixWorld(true);
    return { a: _ha.copy(w.userData.base).applyMatrix4(w.matrixWorld), b: _hb.copy(w.userData.tip).applyMatrix4(w.matrixWorld), r: w.userData.hitR || 0.05, key: k };
  }
  // World-space grip transform weapon `key` would have in `act`'s hand right now (for handing things over).
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
  function handGrip(act, key = 'sword') {
    const m = MOUNTS[key]?.hand, bone = m && act?.model.getObjectByName(m.bone); if (!bone) return null;
    // Pearlbow uses a hand-local authored mount. Do not pass it through mountFor(),
    // which expects blade/edge vectors and would throw during the pickup frame.
    const mt = m.local ? { pos: new THREE.Vector3().fromArray(m.local.pos), rot: new THREE.Quaternion().fromArray(m.local.quat).normalize(), scale: new THREE.Vector3().setScalar(1 / m.local.scale) } : mountFor(act, key, m);
    bone.updateWorldMatrix(true, false);
    _m.compose(mt.pos, mt.rot, new THREE.Vector3(1 / mt.scale.x, 1 / mt.scale.y, 1 / mt.scale.z)).premultiply(bone.matrixWorld).decompose(_p, _q, _s);
    return { pos: _p.clone(), quat: _q.clone() };
  }
  return { meshes, hidden, sword: meshes.sword, axe: meshes.axe, bow: meshes.bow, place, update, contact, handGrip, MOUNTS, get inHand() { return inHand(); } };
}
