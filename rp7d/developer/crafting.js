// RP7D · crafting foundation. Items are CREATED only at the Experiment Table (the Zyphone never crafts).
// Recipes are data. Adding one is one more entry here: nothing else in the game changes.
//   { id, name, outputId, outputQuantity, ingredients:[{itemId, quantity}], known, prerequisites:[recipeId], stationType }
// Reads resources through ZyLink (Home PC + Zycube), spends Home PC stock first, and delivers the output to the Home PC.
import { storage, LOC } from './storage.js';
import { link } from './zylink.js';
import { defOf } from './item-registry.js';
import { ASTRALITE_FAMILIES } from './loot.js';

export const STATIONS = {
  EXPERIMENT_TABLE: { id: 'EXPERIMENT_TABLE', name: 'Experiment Table', device: 'experiment_table' },
  ASTRALITE_STATION: { id: 'ASTRALITE_STATION', name: 'Astralite Station', device: 'astralite_station' }
};

const TEST = 'Test recipe · final cost and parts will change';
export const RECIPES = [
  { id: 'field_workstation', name: 'Field Workstation', outputId: 'field_workstation', outputQuantity: 1,
    ingredients: [{ itemId: 'scrap_metal', quantity: 15 }, { itemId: 'fresh_wood', quantity: 6 }], known: true, prerequisites: [], stationType: 'EXPERIMENT_TABLE', testRecipe: true, note: TEST },
  { id: 'guitar', name: "Psychosyd's Signed Red Guitar", outputId: 'guitar', outputQuantity: 1,
    ingredients: [{ itemId: 'scrap_metal', quantity: 20 }], known: true, prerequisites: [], stationType: 'EXPERIMENT_TABLE', testRecipe: true, note: TEST },
  { id: 'telescope', name: 'Stargazer Telescope', outputId: 'telescope', outputQuantity: 1,
    ingredients: [{ itemId: 'scrap_metal', quantity: 25 }], known: true, prerequisites: [], stationType: 'EXPERIMENT_TABLE', testRecipe: true, note: TEST },
  { id: 'astralboard', name: 'Astralboard', outputId: 'astralboard', outputQuantity: 1,
    ingredients: [{ itemId: 'scrap_metal', quantity: 30 }, { itemId: 'gemshard', quantity: 3 }], known: true, prerequisites: [], stationType: 'EXPERIMENT_TABLE', testRecipe: true, note: TEST + ' · Gemshards come from the Astralite Station' },
  // Astralite Station: every one of the 63 Astralites can be synthesised into Gemshards (placeholder rate: 3 of one → 1 Gemshard).
  ...ASTRALITE_FAMILIES.flatMap(f => f.items.map(a => ({
    id: `synth_${a.key}`, name: `${a.symbol} · ${a.name}`, outputId: 'gemshard', outputQuantity: 1,
    ingredients: [{ itemId: a.key, quantity: 3 }], known: true, prerequisites: [], stationType: 'ASTRALITE_STATION',
    group: f.name, color: f.color, tier: a.energy, note: 'Placeholder rate · 3 of one Astralite → 1 Gemshard'
  })))
];
const byId = new Map(RECIPES.map(r => [r.id, r]));
export const recipeOf = id => byId.get(id) || null;

export function isKnown(r) {
  if (!r) return false;
  const learned = storage.knownRecipes();
  const self = r.known || learned.includes(r.id);
  return self && (r.prerequisites || []).every(p => isKnown(byId.get(p)));
}
export const listRecipes = (stationType = 'EXPERIMENT_TABLE') => RECIPES.filter(r => r.stationType === stationType && isKnown(r));

const dev = r => STATIONS[r.stationType].device;
// What the station can see of an ingredient, split by place.
function have(device, itemId) {
  const home = link.canRead(device, LOC.HOME_PC) ? storage.count(LOC.HOME_PC, itemId) : 0;
  const cube = link.canRead(device, LOC.ZYCUBE) ? storage.count(LOC.ZYCUBE, itemId) : 0;
  return { home, cube, total: home + cube };
}

// Everything checked, nothing changed: { ok, reason, message, lines:[{itemId,name,need,have}] }
export function availability(recipeOrId) {
  const r = typeof recipeOrId === 'string' ? recipeOf(recipeOrId) : recipeOrId;
  if (!r) return { ok: false, reason: 'UNKNOWN_RECIPE', message: 'Unknown recipe', lines: [] };
  const device = dev(r);
  const lines = r.ingredients.map(i => ({ itemId: i.itemId, name: defOf(i.itemId)?.name || i.itemId, need: i.quantity, have: have(device, i.itemId).total }));
  const out = { lines, recipe: r };
  if (!isKnown(r)) return { ...out, ok: false, reason: 'NOT_KNOWN', message: 'Recipe not known yet' };
  if (!defOf(r.outputId)) return { ...out, ok: false, reason: 'UNKNOWN_ITEM', message: 'Unknown output' };
  if (lines.some(l => l.have < l.need)) return { ...out, ok: false, reason: 'MISSING_RESOURCES', message: 'Missing resources' };
  // Output lands in the Home PC (reserve storage has no limit). A unique weapon already owned is the only refusal.
  const c = storage.canStore(LOC.HOME_PC, r.outputId, r.outputQuantity);
  if (!c.ok) return { ...out, ok: false, reason: c.reason, message: c.message };
  return { ...out, ok: true };
}

// Validate → consume → produce. Never consumes without producing: a failed output refunds exactly what was spent.
export function craft(recipeId) {
  const a = availability(recipeId); if (!a.ok) return a;
  const r = a.recipe, device = dev(r), spent = [];
  const refund = () => { for (const s of spent.reverse()) storage.add(s.loc, s.itemId, s.qty); };
  for (const ing of r.ingredients) {
    let need = ing.quantity;
    for (const loc of [LOC.HOME_PC, LOC.ZYCUBE]) {
      if (need <= 0 || !link.canRead(device, loc)) continue;
      const n = Math.min(need, storage.count(loc, ing.itemId));
      if (n <= 0) continue;
      const res = storage.remove(loc, ing.itemId, n);
      if (!res.ok) { refund(); return { ok: false, reason: res.reason, message: res.message }; }
      spent.push({ loc, itemId: ing.itemId, qty: n }); need -= n;
    }
    if (need > 0) { refund(); return { ok: false, reason: 'MISSING_RESOURCES', message: 'Missing resources' }; }
  }
  const out = storage.add(LOC.HOME_PC, r.outputId, r.outputQuantity);
  if (!out.ok) { refund(); return { ok: false, reason: out.reason, message: out.message }; }
  return { ok: true, recipe: r, outputId: r.outputId, quantity: r.outputQuantity, message: `${defOf(r.outputId).name} crafted · stored in your Home PC` };
}
// Craft the same recipe repeatedly until something runs out (each pass is its own atomic craft).
export function craftMax(recipeId, limit = 99) {
  let n = 0, last = null; while (n < limit) { const r = craft(recipeId); if (!r.ok) { last = r; break; } n++; }
  return { ok: n > 0, count: n, message: n ? `Synthesised ×${n}` : (last?.message || 'Missing resources') };
}
export const learnRecipe = id => storage.learnRecipe(id);
export const crafting = { STATIONS, RECIPES, recipeOf, isKnown, listRecipes, availability, craft, craftMax, learnRecipe };
export default crafting;
