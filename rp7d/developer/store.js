// RP7D · the merchant system (RP7D Malezor Town Store V2 · §3–4). One reusable merchant with department inventories:
// every store and department shares the same shop screen (station-ui.js · kind 'shop'), the same gold (inventory.coins,
// shown on the RHUD), the same destination (the Zycube, through storage.js, which checks capacity) and the same
// validation and saving. Stock and prices are data on top of the existing item definitions (item-registry.js).
//
//   STORES[id].departments[dept] = { title, floor, stock: [{ id, price }], buyback }
//   buy(store, dept, id, qty)    gold ≥ price·qty and the Zycube has room, else nothing changes
//   sell(store, dept, id, qty)   only what this department stocks, only what Rizer carries; pays price·buyback
// Per-store state (inventory.stores[id]): visits, the department last browsed, and a ledger of what was traded.
import { storage, LOC } from './storage.js';
import { defOf } from './item-registry.js';
import { inventory, saveInv } from './loot.js';

export const STORES = {
  'malezor-town-store': {
    name: 'Malezor Town Store', site: 'malezor-gear-shop',
    departments: {
      rizer: { title: 'Rizer Department', sub: 'FLOOR 1 · RIZER SUPPLIES', floor: 1, buyback: 0.5, stock: [
        { id: 'fruit-red', price: 12 }, { id: 'fruit-gold', price: 10 }, { id: 'fruit-violet', price: 14 }, { id: 'fruit-white', price: 60 },
        { id: 'scrap_metal', price: 8 }, { id: 'fresh_wood', price: 6 }, { id: 'everstone', price: 7 }
      ] },
      zyrex: { title: 'Zyrex Department', sub: 'FLOOR 2 · ZYREX SUPPLIES', floor: 2, buyback: 0.5, stock: [
        { id: 'zyphere', price: 40 }
      ] }
    }
  }
};

const fail = (reason, message) => ({ ok: false, reason, message });
export function storeState(storeId) {
  const all = inventory.stores ||= {}, s = all[storeId] ||= {};
  s.visits ??= 0; s.lastDept ??= null; s.bought ||= {}; s.sold ||= {}; s.spent ??= 0; s.earned ??= 0;
  return s;
}
export function department(storeId, dept) { return STORES[storeId]?.departments[dept] || null; }
export const gold = () => inventory.coins || 0;
export const priceOf = (storeId, dept, id) => department(storeId, dept)?.stock.find(s => s.id === id)?.price ?? null;
export const sellPrice = (storeId, dept, id) => { const p = priceOf(storeId, dept, id), D = department(storeId, dept); return p == null ? null : Math.max(1, Math.floor(p * D.buyback)); };

// Everything this department will buy back that Rizer carries in his Zycube
export function sellable(storeId, dept) {
  const D = department(storeId, dept); if (!D) return [];
  return D.stock.map(s => ({ id: s.id, qty: storage.count(LOC.ZYCUBE, s.id), def: defOf(s.id), price: sellPrice(storeId, dept, s.id) })).filter(r => r.qty > 0 && r.def);
}
export function stockRows(storeId, dept) {
  const D = department(storeId, dept); if (!D) return [];
  return D.stock.map(s => ({ id: s.id, price: s.price, def: defOf(s.id), have: storage.count(LOC.ZYCUBE, s.id) })).filter(r => r.def);
}

// One purchase: validated in full before anything moves; gold and Zycube change together or not at all.
export function buy(storeId, dept, id, qty = 1, onWallet) {
  const price = priceOf(storeId, dept, id); if (price == null) return fail('NOT_STOCKED', 'Not sold here');
  const cost = price * qty;
  if (gold() < cost) return fail('INSUFFICIENT_GOLD', `Not enough gold · ${cost} needed, ${gold()} carried`);
  const can = storage.canStore(LOC.ZYCUBE, id, qty); if (!can.ok) return can;
  const res = storage.add(LOC.ZYCUBE, id, qty); if (!res.ok) return res;
  inventory.coins = gold() - cost;
  const s = storeState(storeId); s.bought[id] = (s.bought[id] || 0) + qty; s.spent += cost;
  saveInv(); onWallet?.(inventory);
  return { ok: true, id, qty, cost, message: `Bought ${defOf(id)?.name || id}${qty > 1 ? ' ×' + qty : ''} · −${cost} gold` };
}
export function sell(storeId, dept, id, qty = 1, onWallet) {
  const price = sellPrice(storeId, dept, id); if (price == null) return fail('NOT_BOUGHT', 'This department does not buy that');
  if (storage.count(LOC.ZYCUBE, id) < qty) return fail('INSUFFICIENT', 'You are not carrying that many');
  const res = storage.remove(LOC.ZYCUBE, id, qty); if (!res.ok) return res;
  const pay = price * qty; inventory.coins = gold() + pay;
  const s = storeState(storeId); s.sold[id] = (s.sold[id] || 0) + qty; s.earned += pay;
  saveInv(); onWallet?.(inventory);
  return { ok: true, id, qty, pay, message: `Sold ${defOf(id)?.name || id}${qty > 1 ? ' ×' + qty : ''} · +${pay} gold` };
}
