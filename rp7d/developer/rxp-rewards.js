// What earns RXP, and how much. Every source ends in awardRizerXP (progression.js): nothing here keeps its own
// counter or touches Level. RP7B is the reference (rp7b.html · rizerKillXP / creditRizerKill / awardRizerXP):
// greater accomplishment + greater danger + greater skill = greater RXP. Values are tuning data, not final balance.
import { inventory, saveInv } from './loot.js';
import { progression, awardRizerXP } from './progression.js';

// ── the hierarchy: balancing territory for authored rewards (not caps, and not random ranges) ──
export const RXP_BANDS = {
  micro: [5, 25], minor: [25, 100], standard: [100, 500], major: [500, 2500], elite: [2500, 10000],
  legendary: [10000, Infinity] // no upper boundary: RP7D has no RXP / Level ceiling
};
const B = RXP_BANDS;
export const RXP_REWARDS = {
  discovery: { micro: B.micro, minor: B.minor, standard: B.standard },
  quest: { minor: B.minor, standard: B.standard, major: B.major, elite: B.elite },
  challenge: { minor: B.minor, standard: B.standard, major: B.major, elite: B.elite },
  training: { minor: B.minor, standard: B.standard },
  story: { major: B.major, elite: B.elite, legendary: B.legendary }
};

// ── combat: RP7B's formula, never a flat reward ──
//   enemyLevel × (basePerLevel + tier × tierPerLevel) × mode × levelDifference × technique
export const RXP_COMBAT = {
  basePerLevel: 8, tierPerLevel: 8, // RP7B RIZER_KILL_XP
  mode: { normal: 1 },             // difficulty / battle-type multiplier: RP7D has one mode so far
  levelDiff: { step: 0.05, min: 0.25, max: 2 }, // RP7B: ±5% per Level of gap · fighting far below still pays something · fighting up caps at double
  // RP7B RIZER_KILL_MULT. Only the ones RP7D has a move for are reachable (see `kinds`); the rest wait for theirs.
  technique: { basic: 1, splash: 1.25, astralstrike: 1.5, astralslam: 1.75, throw: 1.75, void: 2, astralkick: 2, boom: 2.5, zyrex: 1 },
  // RP7D's finishing blow → RP7B's technique. Anything not listed is `basic` (fists, feet, blades, bow, thunder).
  kinds: {
    blast: 'astralstrike',    // Astral Blast / Astralstrike bolts
    astralift: 'throw',       // Astralift: lifted and thrown
    astralslam: 'astralslam', // the aerial slam's own target
    splash: 'splash'          // caught in an area blast (Astralburst, Rolling Thunder's burst, the slam's shockwave)
  }
};
// Enemy Level and tier feed the formula. Mori and Skellor are RP7B's (T1 · Lv 1 and Lv 2); the rest are placed
// around them by threat and are placeholders until RP7D gives enemies real Levels (an instance's own
// `level` / `tier` wins when it has them).
export const RXP_ENEMIES = {
  mori: { level: 1, tier: 1 }, crept: { level: 2, tier: 1 }, skellor: { level: 2, tier: 1 }, seer: { level: 3, tier: 1 },
  'daemon-black': { level: 4, tier: 1 }, 'daemon-red': { level: 6, tier: 1 },
  scanobot: { level: 4, tier: 1 }, // sentient tech, the lighter tier
  penumbra: { level: 8, tier: 2 }  // the heavy tier above it
};
export function techniqueOf(kind) { const t = RXP_COMBAT.kinds[kind]; return RXP_COMBAT.technique[t] != null ? t : 'basic'; }
export function combatRXP(enemy, kind = 'punch', rizerLevel = progression.level, mode = 'normal') {
  const C = RXP_COMBAT, lv = Math.max(1, enemy?.level || 1), tier = Math.max(1, enemy?.tier || 1);
  const diff = Math.max(C.levelDiff.min, Math.min(C.levelDiff.max, 1 + (lv - rizerLevel) * C.levelDiff.step));
  return Math.max(1, Math.round(lv * (C.basePerLevel + tier * C.tierPerLevel) * (C.mode[mode] ?? 1) * diff * C.technique[techniqueOf(kind)]));
}
// The one call for every defeat. `enemy`: the instance (needs `key` from RXP_ENEMIES, or its own level / tier).
// Paid once per life: the instance is marked, and whoever revives it clears `rxpPaid`.
export function awardCombatRXP(enemy, key, kind) {
  if (!enemy || enemy.rxpPaid) return null;
  enemy.rxpPaid = true;
  const def = { ...(RXP_ENEMIES[key] || { level: 1, tier: 1 }) }; if (enemy.level) def.level = enemy.level; if (enemy.tier) def.tier = enemy.tier;
  return awardRizerXP(combatRXP(def, kind), 'combat');
}

// ── authored, one-time rewards ──
// Discoveries pay by what they are; objectives and milestones carry their own authored value.
export const RXP_DISCOVERY = {
  place: 25,                                        // a named landmark of the district
  placeKinds: { gemlord: 50, stadium: 50, seer: 50 }, // the notable ones
  region: 25,                                       // first time in a named region
  gatelock: 50                                      // finding a Portal Gatelock
};
export const RXP_OBJECTIVES = {
  'malezor-square': { amount: 50, band: 'minor', name: 'Reached Malezor Square' },             // RP7B's early objectives pay 50 and 100
  'malezor-landmarks': { amount: 250, band: 'standard', name: 'Every landmark of Malezor found' },
  'gatelock-open': { amount: 150, band: 'standard', name: 'Portal Gatelock opened', each: true } // once per gatelock
};
// A one-time award: `id` is remembered with the save, so leaving and coming back, reloading or repeating the
// interaction never pays twice. Nothing is remembered while RXP is still locked.
export function awardOnce(id, amount, source = '') {
  const done = inventory.rxpDone ||= {};
  if (done[id]) return null;
  const r = awardRizerXP(amount, source); if (!r) return null;
  done[id] = 1; saveInv(); return r;
}
export const awardDiscovery = (kind, id, sub) => awardOnce(`discovery:${kind}:${id}`, kind === 'place' ? (RXP_DISCOVERY.placeKinds[sub] ?? RXP_DISCOVERY.place) : RXP_DISCOVERY[kind], 'discovery');
export function awardObjective(key, instance = '') { const o = RXP_OBJECTIVES[key]; return o ? awardOnce(`objective:${key}${o.each ? ':' + instance : ''}`, o.amount, 'quest') : null; }
