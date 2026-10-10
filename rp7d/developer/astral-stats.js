// RP7D · Astral stats: what LABS › ASTRAL (the X-ray Rizer) spends Astral Points on, and what they change.
//
//   Astral Points (AP)  ASTRAL.base + ASTRAL.perLevel × (Level − 1), from progression.js's Level. Spent on stats and
//                       on mods; a full reset refunds everything.
//   stats               the 5 core combat stats (RP7 · The 5 Core Combat Stats), each raised by AP on top of his base:
//                         HP  health points · how much damage he survives          (resource)
//                         ATK attack        · physical damage, against the target's DEF (attribute)
//                         DEF defense       · reduces incoming physical damage      (attribute)
//                         STA stamina       · physical energy for dodges, runs, techniques (resource)
//                         SP  special       · Astral energy capacity                (resource)
//                       SP is capacity only: an Astral technique's damage is its own number (ASTRAL in astral.js,
//                       STORM in astral-storm.js) and its SP cost is separate, so each can be balanced on its own.
//   mods                installed into four body systems on his nervous system (CORTEX, SPINE, ARMS, LEGS), two each
//
// Damage (physical only; Astral damage ignores ATK and DEF):
//   dealt = power × ATK / ATK_REF × (100 + DEF_REF) / (100 + DEF)
// with ATK_REF / DEF_REF = Rizer's base 80 / 60, so a base Rizer against a standard foe (ATK 80, DEF 60) hits exactly
// as hard as every move was tuned. Blows on Rizer were authored against the old 100-HP scale: they are scaled by
// HP_SCALE so the doubled HP keeps the same feel until DEF (or HP) is raised.
//
// State lives in inventory.astralBuild (saved with the bag, so a new game starts it clean). rizer.js and seers.js read
// the effects through the functions below; nothing else touches the numbers.
import { inventory, saveInv } from './loot.js';
import { progression } from './progression.js';

export const ASTRAL = { base: 3, perLevel: 2, statMax: 10 };
// Rizer's base block (the spec's example) and the standard foe; the refs make the base line hit as tuned.
export const BASE = { hp: 200, atk: 80, def: 60, sta: 150, sp: 100 };
export const FOE = { atk: 80, def: 60 };
export const ATK_REF = 80, DEF_REF = 60, HP_SCALE = BASE.hp / 100;
export const STATS = [
  { id: 'hp', name: 'HP', full: 'HEALTH POINTS', short: 'HP', per: 20, unit: 'max HP', kind: 'resource', color: '#ff3b4f' },
  { id: 'atk', name: 'ATK', full: 'ATTACK', short: 'ATK', per: 4, unit: 'ATK · physical damage', kind: 'attribute', color: '#ff8a3d' },
  { id: 'def', name: 'DEF', full: 'DEFENSE', short: 'DEF', per: 6, unit: 'DEF · less damage taken', kind: 'attribute', color: '#9fb4ff' },
  { id: 'sta', name: 'STA', full: 'STAMINA', short: 'STA', per: 15, unit: 'max STA', kind: 'resource', color: '#f3e600' },
  { id: 'sp', name: 'SP', full: 'SPECIAL · ASTRAL', short: 'SP', per: 10, unit: 'max SP', kind: 'resource', color: '#5ef2ff' }
];
const OLD = { vit: 'hp', pow: 'atk', end: 'sta', ast: 'sp' }; // the pre-5-stat ids, carried over on load
// Mods: the body systems they install into, what they cost and what they do.
export const SYSTEMS = [
  { id: 'cortex', name: 'CORTEX', note: 'Brain · the astral source', side: 'left' },
  { id: 'spine', name: 'SPINAL CORD', note: 'Core · how he holds up', side: 'right' },
  { id: 'arms', name: 'ARMS · HANDS', note: 'Nerves of the strike', side: 'left' },
  { id: 'legs', name: 'LEGS', note: 'Nerves of the stride', side: 'right' }
];
export const MODS = {
  calm_mind:    { system: 'cortex', name: 'Calm Mind', cost: 2, effect: 'SP slowly refills on its own (+1.5 / s)' },
  overcharge:   { system: 'cortex', name: 'Overcharge', cost: 3, effect: '+50% SP from every landed blow' },
  iron_core:    { system: 'spine', name: 'Iron Core', cost: 2, effect: '+50 max HP' },
  second_wind:  { system: 'spine', name: 'Second Wind', cost: 3, effect: 'HP regenerates (+4 / s) after 5 s without a hit' },
  heavy_hands:  { system: 'arms', name: 'Heavy Hands', cost: 2, effect: '+12 ATK' },
  arc_fists:    { system: 'arms', name: 'Arc Fists', cost: 3, effect: 'Combo finishers hit +30% harder' },
  aetherstride: { system: 'legs', name: 'Aetherstride', cost: 2, effect: '+40% STA regeneration' },
  light_feet:   { system: 'legs', name: 'Light Feet', cost: 2, effect: 'Dodges cost half the STA' }
};

const state = () => {
  const b = inventory.astralBuild ||= {};
  b.stats ||= {}; b.mods ||= [];
  for (const [o, n] of Object.entries(OLD)) if (o in b.stats) { b.stats[n] = (b.stats[n] | 0) + (b.stats[o] | 0); delete b.stats[o]; }
  for (const s of STATS) b.stats[s.id] = Math.max(0, Math.min(ASTRAL.statMax, b.stats[s.id] | 0));
  for (const k of Object.keys(b.stats)) if (!STATS.some(st => st.id === k)) delete b.stats[k];
  b.mods = b.mods.filter(id => MODS[id]);
  return b;
};
const listeners = new Set();
const changed = () => { saveInv(); for (const f of listeners) try { f(); } catch (e) {} };

export const astral = {
  get total() { return ASTRAL.base + ASTRAL.perLevel * Math.max(0, progression.level - 1); },
  get spent() { const b = state(); return Object.values(b.stats).reduce((a, n) => a + n, 0) + b.mods.reduce((a, id) => a + MODS[id].cost, 0); },
  get free() { return this.total - this.spent; },
  stat: id => state().stats[id] || 0,
  has: id => state().mods.includes(id),
  get mods() { return [...state().mods]; },
  onChange(f) { listeners.add(f); return () => listeners.delete(f); },
  raise(id) { const b = state(); if (this.free < 1) return 'No Astral Points left'; if (b.stats[id] >= ASTRAL.statMax) return 'That stat is maxed'; b.stats[id]++; changed(); return null; },
  lower(id) { const b = state(); if (!b.stats[id]) return 'Nothing to take back'; b.stats[id]--; changed(); return null; },
  toggle(id) {
    const b = state(), m = MODS[id]; if (!m) return 'Unknown mod';
    if (b.mods.includes(id)) { b.mods = b.mods.filter(x => x !== id); changed(); return null; }
    if (this.free < m.cost) return `Needs ${m.cost} AP`;
    b.mods.push(id); changed(); return null;
  },
  reset() { inventory.astralBuild = { stats: {}, mods: [] }; changed(); }
};

// ── the 5 stats, live (read by rizer.js, seers.js and the Focus tab) ──
const per = id => STATS.find(st => st.id === id).per;
export const statOf = id => BASE[id] + astral.stat(id) * per(id) + (id === 'hp' && astral.has('iron_core') ? 50 : 0) + (id === 'atk' && astral.has('heavy_hands') ? 12 : 0);
export const rizerStats = () => Object.fromEntries(STATS.map(st => [st.id, statOf(st.id)]));
// physical damage: ATK against DEF (Astral techniques never come through here)
export const defMul = def => (100 + DEF_REF) / (100 + Math.max(0, def ?? FOE.def));
export const physical = (power, atk, def) => power * (atk ?? FOE.atk) / ATK_REF * defMul(def);
// a blow Rizer lands on a foe (finishers get Arc Fists) · a blow a foe lands on Rizer (the HP scale, then his DEF)
export const dealt = (power, foeDef, finisher = false) => physical(power, statOf('atk'), foeDef) * (finisher && astral.has('arc_fists') ? 1.3 : 1);
export const taken = (power, foeAtk) => physical(power * HP_SCALE, foeAtk, statOf('def'));

// ── the effects (read by rizer.js and seers.js) ──
export const maxHpOf = () => statOf('hp');
export const maxStaminaOf = () => statOf('sta');
export const maxEnergyOf = () => statOf('sp');
export const meleeMul = (finisher = false) => dealt(1, FOE.def, finisher); // vs a standard foe, for the readout
export const staminaRegenMul = () => (astral.has('aetherstride') ? 1.4 : 1);
export const dodgeCostMul = () => (astral.has('light_feet') ? 0.5 : 1);
export const astralHitMul = () => (astral.has('overcharge') ? 1.5 : 1);
export const astralRegen = () => (astral.has('calm_mind') ? 1.5 : 0);
export const hpRegen = () => (astral.has('second_wind') ? 4 : 0);
