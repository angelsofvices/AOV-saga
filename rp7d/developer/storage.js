// RP7D · storage service: the one place that knows WHERE every owned thing is.
//
//   ZYCUBE    what Rizer is carrying (his portable inventory; capacity comes from the Zycube tier)
//   HOME_PC   reserve storage for everything he owns but left at home (no capacity limit)
//   DEPLOYED  field equipment standing in the world
//   WORLD     not owned yet (never stored here)
//
// Ownership is not the same as carrying. The saved shape (inventory in loot.js) stays backward compatible:
//   inventory.items            stackable counts in the Zycube        (unchanged)
//   inventory.owned            weapons in the Zycube                 (unchanged)
//   inventory.home             { items: {id: n}, weapons: [id] }     reserve storage
//   inventory.equipment        [{ uid, type, loc, at? }]             unique Field Equipment, one place each
//   inventory.zycubeTier       Zycube upgrade level
//   inventory.recipes          recipe ids learned beyond the starting set
// Nothing outside this file should add to or remove from those directly. Every mutation is atomic: it is checked
// first, applied once, and rolled back whole if anything fails. UI never owns any of this; it reads and asks.
import { inventory, saveInv } from './loot.js';
import { defOf, FIELD_EQUIPMENT, isWeaponId, isEquipmentId } from './item-registry.js';
import { link } from './zylink.js';

export const LOC = Object.freeze({ ZYCUBE: 'ZYCUBE', HOME_PC: 'HOME_PC', DEPLOYED: 'DEPLOYED', WORLD: 'WORLD' });
export const LOC_NAME = { ZYCUBE: 'Zycube', HOME_PC: 'Home Storage', DEPLOYED: 'Deployed', WORLD: 'World' };

// Capacity is a plain table so the final model (slots, units, per-category limits) can be swapped in later.
// "Better Zycube = more portable capacity" is the only rule fixed here. Numbers are NOT final balance.
export const ZYCUBE_TIERS = Object.freeze([
  { tier: 1, name: 'Zycube Mk I', slots: 36 },
  { tier: 2, name: 'Zycube Mk II', slots: 48 },
  { tier: 3, name: 'Zycube Mk III', slots: 64 },
  { tier: 4, name: 'Zycube Mk IV', slots: 84 },
  { tier: 5, name: 'Zycube Mk V', slots: 110 }
]);

const listeners = new Set(), guards = [];
const emit = (type, data) => { for (const f of listeners) try { f(type, data); } catch (e) { console.warn('[storage] listener', e); } };

function ensure() {
  inventory.items ||= {};
  inventory.owned ||= ['fists'];
  const h = inventory.home ||= {}; h.items ||= {}; h.weapons ||= [];
  inventory.equipment ||= [];
  inventory.zycubeTier = Math.max(1, Math.min(ZYCUBE_TIERS.length, inventory.zycubeTier | 0 || 1));
  inventory.recipes ||= [];
}
// One-time tidy on load: nothing may exist in two places (an old duplicate goes to the Zycube side only).
function normalise() {
  ensure();
  const h = inventory.home, seen = new Set(inventory.owned);
  h.weapons = h.weapons.filter(k => { if (seen.has(k) || !isWeaponId(k)) return false; seen.add(k); return true; });
  const uids = new Set();
  inventory.equipment = inventory.equipment.filter(e => e && e.uid && isEquipmentId(e.type) && !uids.has(e.uid) && uids.add(e.uid));
  for (const e of inventory.equipment) if (!['ZYCUBE', 'HOME_PC', 'DEPLOYED'].includes(e.loc)) e.loc = 'HOME_PC';
}
normalise();

// ── reading ─────────────────────────────────────────────────────────────────
export const onChange = f => (listeners.add(f), () => listeners.delete(f));
// Something else may veto a transfer of a unique item (a weapon in use, a deployed telescope): guard(id, from, to) → null | 'reason'.
export const addGuard = f => guards.push(f);

export function capacity() { ensure(); return ZYCUBE_TIERS[inventory.zycubeTier - 1].slots; }
export function tier() { ensure(); return ZYCUBE_TIERS[inventory.zycubeTier - 1]; }
export const nextTier = () => ZYCUBE_TIERS[inventory.zycubeTier] || null;

export function contents(loc) {
  ensure();
  const items = loc === LOC.ZYCUBE ? inventory.items : inventory.home.items;
  const weaponList = loc === LOC.ZYCUBE ? inventory.owned : inventory.home.weapons;
  return {
    stacks: Object.entries(items).filter(([k, n]) => n > 0 && defOf(k)).map(([id, qty]) => ({ id, qty, def: defOf(id) })),
    weapons: weaponList.filter(k => defOf(k)).map(id => ({ id, uid: id, def: defOf(id) })),
    equipment: inventory.equipment.filter(e => e.loc === loc).map(e => ({ id: e.type, uid: e.uid, def: defOf(e.type), at: e.at }))
  };
}
export function count(loc, id) {
  ensure();
  if (isEquipmentId(id)) return inventory.equipment.filter(e => e.type === id && e.loc === loc).length;
  if (isWeaponId(id)) return (loc === LOC.ZYCUBE ? inventory.owned : loc === LOC.HOME_PC ? inventory.home.weapons : []).includes(id) ? 1 : 0;
  if (loc === LOC.ZYCUBE) return inventory.items[id] || 0;
  if (loc === LOC.HOME_PC) return inventory.home.items[id] || 0;
  return 0;
}
export const total = id => count(LOC.ZYCUBE, id) + count(LOC.HOME_PC, id) + count(LOC.DEPLOYED, id);
export const ownsWeapon = id => count(LOC.ZYCUBE, id) + count(LOC.HOME_PC, id) > 0;
export const equipmentIn = (loc, type) => inventory.equipment.filter(e => e.loc === loc && (!type || e.type === type));
export const equipmentByUid = uid => inventory.equipment.find(e => e.uid === uid) || null;

const slotsOfStack = (id, n) => n > 0 ? Math.ceil(n / (defOf(id)?.stackMax || 99)) * (defOf(id)?.slots ?? 1) : 0;
export function slotsUsed(loc = LOC.ZYCUBE) {
  const c = contents(loc);
  return c.stacks.reduce((s, x) => s + slotsOfStack(x.id, x.qty), 0) + c.weapons.reduce((s, x) => s + x.def.slots, 0) + c.equipment.reduce((s, x) => s + x.def.slots, 0);
}

const fail = (reason, message) => ({ ok: false, reason, message });
const OK = { ok: true };
// `moving`: the unit is already owned and is only changing place, so it is not a duplicate of itself.
export function canStore(loc, id, qty = 1, { moving = false } = {}) {
  ensure();
  const d = defOf(id); if (!d) return fail('UNKNOWN_ITEM', 'Unknown item');
  if (!moving && isEquipmentId(id) && FIELD_EQUIPMENT[id].single && (total(id) > 0 || (id === 'astralboard' && inventory.rides?.includes('astralboard')))) return fail('DUPLICATE', `${d.name} is already owned`);
  if (loc === LOC.HOME_PC) return !moving && d.unique && isWeaponId(id) && ownsWeapon(id) ? fail('DUPLICATE', `${d.name} is already owned`) : OK; // reserve storage has no limit
  if (loc !== LOC.ZYCUBE) return fail('BAD_LOCATION', 'Not a storage location');
  if (inventory.zycube) return fail('ZYCUBE_LOST', 'No Zycube · it dropped where you were knocked out');
  if (!moving && d.unique && isWeaponId(id) && ownsWeapon(id)) return fail('DUPLICATE', `${d.name} is already owned`);
  const cur = inventory.items[id] || 0;
  const extra = d.stackable ? slotsOfStack(id, cur + qty) - slotsOfStack(id, cur) : d.slots * (d.unique ? 1 : qty);
  if (extra <= 0 || slotsUsed(LOC.ZYCUBE) + extra <= capacity()) return OK;
  return fail('INSUFFICIENT_CAPACITY', 'INSUFFICIENT ZYCUBE CAPACITY');
}

// ── mutation (private: use add / transfer / craft / deploy) ─────────────────
const snap = () => JSON.stringify({ items: inventory.items, owned: inventory.owned, home: inventory.home, equipment: inventory.equipment, tier: inventory.zycubeTier });
const restore = s => { const o = JSON.parse(s); inventory.items = o.items; inventory.owned = o.owned; inventory.home = o.home; inventory.equipment = o.equipment; inventory.zycubeTier = o.tier; };
let seq = 0;
const newUid = type => { const used = new Set(inventory.equipment.map(e => e.uid)); let u; do u = `${type}-${Date.now().toString(36)}${(seq++).toString(36)}`; while (used.has(u)); return u; };

function put(loc, id, qty) {
  if (isEquipmentId(id)) { for (let i = 0; i < qty; i++) inventory.equipment.push({ uid: newUid(id), type: id, loc }); return; }
  if (isWeaponId(id)) { const l = loc === LOC.ZYCUBE ? inventory.owned : inventory.home.weapons; if (!l.includes(id)) l.push(id); return; }
  const m = loc === LOC.ZYCUBE ? inventory.items : inventory.home.items; m[id] = (m[id] || 0) + qty;
}
function take(loc, id, qty) {
  if (isEquipmentId(id)) { for (let i = 0; i < qty; i++) { const k = inventory.equipment.findIndex(e => e.type === id && e.loc === loc); if (k < 0) return false; inventory.equipment.splice(k, 1); } return true; }
  if (isWeaponId(id)) { const l = loc === LOC.ZYCUBE ? inventory.owned : inventory.home.weapons, k = l.indexOf(id); if (k < 0) return false; l.splice(k, 1); return true; }
  const m = loc === LOC.ZYCUBE ? inventory.items : inventory.home.items; if ((m[id] || 0) < qty) return false;
  m[id] -= qty; if (m[id] <= 0) delete m[id]; return true;
}
function commit(type, data) { saveInv(); emit(type, data); }

// Put something new into a location (a pickup, a craft's output). Checked first; nothing changes on failure.
export function add(loc, id, qty = 1) {
  const c = canStore(loc, id, qty); if (!c.ok) return c;
  const s = snap();
  try { put(loc, id, qty); } catch (e) { restore(s); return fail('ERROR', String(e)); }
  commit('add', { loc, id, qty }); return { ok: true, id, qty, loc, total: count(loc, id) };
}
// Take something out for good (spent by a recipe, handed over). False and unchanged if there isn't enough.
export function remove(loc, id, qty = 1) {
  if (count(loc, id) < qty) return fail('INSUFFICIENT', 'Not enough');
  const s = snap();
  if (!take(loc, id, qty)) { restore(s); return fail('ERROR', 'Could not remove'); }
  commit('remove', { loc, id, qty }); return OK;
}

// Move between the Zycube and the Home PC. Only a device that moves things may do it, and in practice only the Home PC
// screen passes one. ZyLink / the Zyphone do not, so nothing is pulled in from home remotely.
export function transfer(from, to, id, qty = 1, { via } = {}) {
  ensure();
  if (from === to) return fail('SAME_LOCATION', 'Already there');
  if (!link.canMove(via, from, to)) return fail('NO_REMOTE_TRANSFER', 'ZyLink connects your devices but does not move items · do it at your Home PC');
  const d = defOf(id); if (!d) return fail('UNKNOWN_ITEM', 'Unknown item');
  if (!d.transferable) return fail('NOT_TRANSFERABLE', `${d.name} stays in the Zycube`);
  qty = d.unique ? 1 : Math.max(1, Math.floor(qty));
  if (count(from, id) < qty) return fail('INSUFFICIENT', `Not enough ${d.name}`);
  if (d.unique) for (const g of guards) { const r = g(id, from, to); if (r) return fail('IN_USE', r); }
  const c = canStore(to, id, qty, { moving: true }); if (!c.ok) return c; // checked before anything leaves the source
  const s = snap();
  try {
    if (isEquipmentId(id)) { const e = inventory.equipment.find(q => q.type === id && q.loc === from); if (!e) throw new Error('missing'); e.loc = to; }
    else { if (!take(from, id, qty)) throw new Error('missing'); put(to, id, qty); }
  } catch (e) { restore(s); return fail('ERROR', String(e)); }
  commit('transfer', { from, to, id, qty }); return { ok: true, id, qty, from, to };
}
export function transferAll(from, to, id, opts) { return transfer(from, to, id, count(from, id) || 1, opts); }

// ── field equipment: deploy and pack up (the same unit changes state; it never exists twice) ────────
export function deployEquipment(uid, at) {
  const e = equipmentByUid(uid); if (!e) return fail('UNKNOWN_ITEM', 'No such equipment');
  if (e.loc !== LOC.ZYCUBE) return fail('NOT_CARRIED', 'It is not in your Zycube');
  const s = snap(); e.loc = LOC.DEPLOYED; e.at = { x: at.x, y: at.y, z: at.z, yaw: at.yaw || 0 };
  commit('deploy', { uid, type: e.type, at: e.at }); void s; return { ok: true, uid };
}
export function packEquipment(uid) {
  const e = equipmentByUid(uid); if (!e) return fail('UNKNOWN_ITEM', 'No such equipment');
  if (e.loc !== LOC.DEPLOYED) return fail('NOT_DEPLOYED', 'It is not deployed');
  const c = canStore(LOC.ZYCUBE, e.type, 1, { moving: true }); if (!c.ok) return c; // no room: it stays standing, nothing is destroyed · a move, so a single item (the Astralboard) isn't refused as a duplicate of itself
  e.loc = LOC.ZYCUBE; delete e.at; commit('pack', { uid, type: e.type }); return { ok: true, uid };
}

// ── zycube upgrade hook (cost and progression come later: the test menu calls this) ─────────────
export function upgradeZycube() {
  ensure(); const n = nextTier(); if (!n) return fail('MAX_TIER', 'Zycube is fully upgraded');
  inventory.zycubeTier = n.tier; commit('upgrade', { tier: n.tier }); return { ok: true, tier: n.tier, slots: n.slots };
}

// ── recipes known ───────────────────────────────────────────────────────────
export const knownRecipes = () => (ensure(), inventory.recipes);
export function learnRecipe(id) { ensure(); if (!inventory.recipes.includes(id)) { inventory.recipes.push(id); commit('recipe', { id }); return true; } return false; }

// ── ownership invariant ─────────────────────────────────────────────────────
// total owned = Zycube + Home PC + deployed. Returns the numbers and any duplicate it finds.
export function audit() {
  ensure();
  const totals = {}, problems = [];
  const bump = (id, n) => { totals[id] = (totals[id] || 0) + n; };
  for (const [k, n] of Object.entries(inventory.items)) if (defOf(k)) bump(k, n);
  for (const [k, n] of Object.entries(inventory.home.items)) if (defOf(k)) bump(k, n);
  const w = [...inventory.owned, ...inventory.home.weapons];
  for (const k of w) bump(k, 1);
  for (const k of new Set(w)) if (w.filter(x => x === k).length > 1) problems.push(`weapon ${k} exists twice`);
  const uids = inventory.equipment.map(e => e.uid);
  for (const e of inventory.equipment) bump(e.type, 1);
  if (new Set(uids).size !== uids.length) problems.push('equipment uid duplicated');
  for (const e of inventory.equipment) if (e.loc === LOC.DEPLOYED && !e.at) problems.push(`deployed ${e.uid} has no position`);
  return { ok: !problems.length, problems, totals, zycube: slotsUsed(LOC.ZYCUBE), capacity: capacity(), home: slotsUsed(LOC.HOME_PC) };
}

export const storage = { LOC, LOC_NAME, ZYCUBE_TIERS, capacity, tier, nextTier, contents, count, total, ownsWeapon, equipmentIn, equipmentByUid, slotsUsed, canStore, add, remove, transfer, transferAll, deployEquipment, packEquipment, upgradeZycube, knownRecipes, learnRecipe, audit, onChange, addGuard };
export default storage;
export { FIELD_EQUIPMENT };
