// Rizer progression state: RXP → Level. This is the foundation only — Level is a progression index and changes
// nothing about Rizer yet (no stats, AP, Power Level or scaling: that wiring comes later and reads from here).
//
//   awardRizerXP(amount, source?)   the ONE way experience is earned: validates, adds, levels up, saves, notifies
//   progression.info                { xp, level, into, need, pct } — everything a view needs
//   progression.onChange(fn)        views (the RHUD) subscribe; the state works with no view at all
//   progression.unlock()            RXP is locked until Rizer first stands in the overworld, then live for good
//
// One authoritative number is stored: lifetime RXP (inventory.rizerXP, saved with the rest of the bag, so a new
// game starts it at 0). Level, current-Level RXP and the next requirement are always derived from it, so they can
// never drift apart. RP7D progression is open-ended: there is no cap on RXP or Level and no "max" state.
import { inventory, saveInv } from './loot.js';

// ── the curve: the only place thresholds are defined — replace or tune it here and nothing else changes ──
// total(level) = lifetime RXP at which `level` begins (0 at Level 1, strictly increasing).
// This is RP7B's curve (rp7b.html · rizerTotalXPFor): 1,000,000 × (L² − 1) / 9999, i.e. 0 at Lv 1 and exactly
// 1,000,000 at Lv 100, about 100 × (2L + 1) per Level. RP7B clamps it at Level 100; RP7D does not — the same
// quadratic simply carries on, so the next threshold always exists.
export const RXP_CURVE = {
  at100: 1000000, // lifetime RXP at Level 100 (RP7B's figure)
  total(level) { return Math.round(this.at100 * (level * level - 1) / 9999); }
};

const startOf = level => { const v = RXP_CURVE.total(level); return Number.isFinite(v) && v > 0 ? v : 0; };
function cleanXP(v) { v = Number(v); return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0; }
// The Level a lifetime total sits in: a bounded search on total() (at most ~130 steps, whatever the number), so a
// retuned curve needs no other change and no award can loop forever.
function levelAt(xp) {
  let lo = 1, hi = 2, guard = 0;
  while (startOf(hi) <= xp && guard++ < 64) { lo = hi; hi *= 2; }
  while (hi - lo > 1 && guard++ < 200) { const mid = Math.floor((lo + hi) / 2); if (startOf(mid) <= xp) lo = mid; else hi = mid; }
  return lo;
}
// Everything about a lifetime RXP total: { xp, level, start, into, need, pct }.
export function levelInfo(xp) {
  xp = cleanXP(xp);
  const level = levelAt(xp), start = startOf(level), need = Math.max(1, startOf(level + 1) - start), into = Math.max(0, Math.min(xp - start, need - 1));
  return { xp, level, start, into, need, pct: into / need };
}
export const levelStart = level => startOf(Math.max(1, Math.floor(level)));

const listeners = new Set();
export const progression = {
  get xp() { return cleanXP(inventory.rizerXP); },
  get info() { return levelInfo(this.xp); },
  get level() { return this.info.level; },
  // RP7B rule: nothing pays before Rizer first stands in the overworld (the home givens are givens). The first step
  // outside arms it permanently — including back indoors afterwards. Never locked again.
  get unlocked() { return !!inventory.rxpUnlocked || this.xp > 0; },
  unlock() { if (inventory.rxpUnlocked) return false; inventory.rxpUnlocked = true; saveInv(); return true; },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  // Dev / testing only: put lifetime RXP at an exact value (gameplay always goes through awardRizerXP).
  set(xp) { inventory.rizerXP = cleanXP(xp); saveInv(); const info = this.info; for (const fn of listeners) fn({ info, gained: 0, levels: 0, from: info.level, source: 'set' }); return info; }
};

// Award experience. Returns { gained, levels, from, to, info }, or null when nothing was awarded: the amount is not
// a valid award (not a number, not finite, zero or negative), or RXP is still locked. Fractions are rounded down.
export function awardRizerXP(amount, source = '') {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null;
  const gained = Math.floor(amount); if (gained <= 0) return null;
  if (!progression.unlocked) return null; // before the overworld: swallowed whole
  const from = progression.info.level;
  inventory.rizerXP = progression.xp + gained; saveInv();
  const info = progression.info, result = { gained, levels: info.level - from, from, to: info.level, info, source }; // every threshold crossed is counted; the overflow is `info.into`
  for (const fn of listeners) fn(result);
  return result;
}
