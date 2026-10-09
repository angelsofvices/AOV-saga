// RP7D · Astral stats: what LABS › ASTRAL (the X-ray Rizer) spends Astral Points on, and what they change.
//
//   Astral Points (AP)  ASTRAL.base + ASTRAL.perLevel × (Level − 1), from progression.js's Level. Spent on stats and
//                       on mods; a full reset refunds everything.
//   stats               VITALITY max health · ENDURANCE max stamina · ASTRAL max astral energy · POWER melee damage
//   mods                installed into four body systems on his nervous system (CORTEX, SPINE, ARMS, LEGS), two each
//
// State lives in inventory.astralBuild (saved with the bag, so a new game starts it clean). rizer.js and seers.js read
// the effects through the functions below; nothing else touches the numbers.
import { inventory, saveInv } from './loot.js';
import { progression } from './progression.js';

export const ASTRAL = { base: 3, perLevel: 2, statMax: 10 };
export const STATS = [
  { id: 'vit', name: 'VITALITY', short: 'VIT', per: 10, unit: 'max health', color: '#ff3b4f' },
  { id: 'end', name: 'ENDURANCE', short: 'END', per: 10, unit: 'max stamina', color: '#f3e600' },
  { id: 'ast', name: 'ASTRAL', short: 'AST', per: 10, unit: 'max astral energy', color: '#5ef2ff' },
  { id: 'pow', name: 'POWER', short: 'POW', per: 5, unit: '% melee damage', color: '#ff8a3d' }
];
// Mods: the body systems they install into, what they cost and what they do.
export const SYSTEMS = [
  { id: 'cortex', name: 'CORTEX', note: 'Brain · the astral source', side: 'left' },
  { id: 'spine', name: 'SPINAL CORD', note: 'Core · how he holds up', side: 'right' },
  { id: 'arms', name: 'ARMS · HANDS', note: 'Nerves of the strike', side: 'left' },
  { id: 'legs', name: 'LEGS', note: 'Nerves of the stride', side: 'right' }
];
export const MODS = {
  calm_mind:    { system: 'cortex', name: 'Calm Mind', cost: 2, effect: 'Astral energy slowly refills on its own (+1.5 / s)' },
  overcharge:   { system: 'cortex', name: 'Overcharge', cost: 3, effect: '+50% astral energy from every landed blow' },
  iron_core:    { system: 'spine', name: 'Iron Core', cost: 2, effect: '+25 max health' },
  second_wind:  { system: 'spine', name: 'Second Wind', cost: 3, effect: 'Health regenerates (+2 / s) after 5 s without a hit' },
  heavy_hands:  { system: 'arms', name: 'Heavy Hands', cost: 2, effect: '+15% melee damage' },
  arc_fists:    { system: 'arms', name: 'Arc Fists', cost: 3, effect: 'Combo finishers hit +30% harder' },
  aetherstride: { system: 'legs', name: 'Aetherstride', cost: 2, effect: '+40% stamina regeneration' },
  light_feet:   { system: 'legs', name: 'Light Feet', cost: 2, effect: 'Dodges cost half the stamina' }
};

const state = () => {
  const b = inventory.astralBuild ||= {};
  b.stats ||= {}; b.mods ||= [];
  for (const s of STATS) b.stats[s.id] = Math.max(0, Math.min(ASTRAL.statMax, b.stats[s.id] | 0));
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

// ── the effects (read by rizer.js and seers.js) ──
export const maxHpOf = base => base + astral.stat('vit') * 10 + (astral.has('iron_core') ? 25 : 0);
export const maxStaminaOf = base => base + astral.stat('end') * 10;
export const maxEnergyOf = base => base + astral.stat('ast') * 10;
export const meleeMul = (finisher = false) => (1 + astral.stat('pow') * 0.05) * (astral.has('heavy_hands') ? 1.15 : 1) * (finisher && astral.has('arc_fists') ? 1.3 : 1);
export const staminaRegenMul = () => (astral.has('aetherstride') ? 1.4 : 1);
export const dodgeCostMul = () => (astral.has('light_feet') ? 0.5 : 1);
export const astralHitMul = () => (astral.has('overcharge') ? 1.5 : 1);
export const astralRegen = () => (astral.has('calm_mind') ? 1.5 : 0);
export const hpRegen = () => (astral.has('second_wind') ? 2 : 0);
