// RP7D · crafting foundation. Items are CREATED only at the Experiment Table (the Zyphone never crafts).
// Recipes are data. Adding one is one more entry here: nothing else in the game changes.
//   { id, name, outputId, outputQuantity, ingredients:[{itemId, quantity}], known, prerequisites:[recipeId], stationType }
// Reads resources through ZyLink (Home PC + Zycube), spends Home PC stock first, and delivers the output to the Home PC.
import { storage, LOC } from './storage.js';
import { link } from './zylink.js';
import { defOf } from './item-registry.js';
import { ASTRALITE_FAMILIES } from './loot.js';
import { AX36_INPUTS, AX36_RECIPE, AX36_COMPOUND, hasStudied } from './engineering-research.js';

export const STATIONS = {
  EXPERIMENT_TABLE: { id: 'EXPERIMENT_TABLE', name: 'Experiment Table', device: 'experiment_table' },
  FIELD_WORKSTATION: { id: 'FIELD_WORKSTATION', name: 'Field Workstation', device: 'field_workstation' },
  ASTRALITE_STATION: { id: 'ASTRALITE_STATION', name: 'Astralite Station', device: 'astralite_station' }
};

const TEST = 'Test recipe · final cost and parts will change';
// The three base materials are Scrap Metal (salvage), Fresh Wood (felled trees, broken bushes) and Everstone (smashed
// stone rubble). The rule for every cost: the more complex the item, the more material it takes to make (and, when
// repairs come, to repair). A simple field tool takes a little of each; a machine like the Astralboard takes a lot.
export const RECIPES = [
  { id: AX36_RECIPE, name: 'Synthesize AX-36', outputId: AX36_COMPOUND, outputQuantity: 1,
    ingredients: AX36_INPUTS.map(itemId => ({ itemId, quantity: 1 })), research: AX36_INPUTS,
    known: true, prerequisites: [], stationType: 'EXPERIMENT_TABLE', atomic: true, outputLoc: LOC.ZYCUBE,
    note: 'Study AX-3 and AX-6 individually at the Astralite Station. Consumes one physical sample of each; research remains learned.' },
  { id: 'field_workstation', name: 'Field Workstation', outputId: 'field_workstation', outputQuantity: 1,
    ingredients: [{ itemId: 'scrap_metal', quantity: 12 }, { itemId: 'fresh_wood', quantity: 8 }, { itemId: 'everstone', quantity: 4 }], known: true, prerequisites: [], stationType: 'EXPERIMENT_TABLE', testRecipe: true, note: TEST },
  ...[
    { id: 'guitar', name: "Rebuild Psychosyd's Signed Red Guitar", outputId: 'guitar', materials: [['guitar_body',1],['guitar_neck',1],['fresh_wood',14],['scrap_metal',8]] },
    { id: 'telescope', name: 'Stargazer Telescope', outputId: 'telescope', broken: 'broken_telescope', materials: [['scrap_metal',20],['everstone',8],['fresh_wood',6]] },
    { id: 'astralboard', name: 'Astralboard', outputId: 'astralboard', broken: 'broken_astralboard', materials: [['scrap_metal',30],['everstone',14],['fresh_wood',10],['gemshard',3]] }
  ].flatMap(x => (x.id === 'guitar' ? ['EXPERIMENT_TABLE'] : ['EXPERIMENT_TABLE','FIELD_WORKSTATION']).map(stationType => ({
    id: `${x.id === 'guitar' ? 'rebuild' : 'repair'}_${x.id}_${stationType.toLowerCase()}`, name: `${x.id === 'guitar' ? 'Rebuild' : 'Repair'} · ${x.name}`, outputId: x.outputId, outputQuantity: 1,
    ingredients: [...(x.broken ? [{ itemId: x.broken, quantity: 1 }] : []), ...x.materials.map(([itemId, quantity]) => ({ itemId, quantity }))],
    known: true, prerequisites: [], stationType, testRecipe: true,
    outputLoc: x.id === 'guitar' ? LOC.ZYCUBE : undefined,
    note: x.id === 'guitar'
      ? `${TEST} · combines the guitar body and neck; rebuilt guitar goes to Utilities in the Zycube`
      : `${TEST} · returns the repaired item to ${stationType === 'EXPERIMENT_TABLE' ? 'Home Storage' : 'the Zycube'}`
  }))),
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
  if (r.research?.some(id => !hasStudied(id))) return { ...out, ok: false, reason: 'RESEARCH_REQUIRED', message: 'Study AX-3 and AX-6 at the Astralite Station first' };
  if (!defOf(r.outputId)) return { ...out, ok: false, reason: 'UNKNOWN_ITEM', message: 'Unknown output' };
  if (lines.some(l => l.have < l.need)) return { ...out, ok: false, reason: 'MISSING_RESOURCES', message: 'Missing resources' };
  if (r.atomic) {
    const c = storage.exchange(exchangeInputs(r), [{ loc: r.outputLoc, id: r.outputId, qty: r.outputQuantity }], { preview: true });
    return { ...out, ...c };
  }
  // Output lands in the Home PC (reserve storage has no limit). A unique weapon already owned is the only refusal.
  const outputLoc = r.outputLoc || (r.stationType === 'FIELD_WORKSTATION' ? LOC.ZYCUBE : LOC.HOME_PC);
  const c = storage.canStore(outputLoc, r.outputId, r.outputQuantity);
  if (!c.ok) return { ...out, ok: false, reason: c.reason, message: c.message };
  return { ...out, ok: true };
}

function exchangeInputs(r) {
  const device = dev(r), inputs = [];
  for (const ing of r.ingredients) {
    let left = ing.quantity;
    for (const loc of [LOC.HOME_PC, LOC.ZYCUBE]) {
      if (!left || !link.canRead(device, loc)) continue;
      const qty = Math.min(left, storage.count(loc, ing.itemId));
      if (qty) { inputs.push({ loc, id: ing.itemId, qty }); left -= qty; }
    }
  }
  return inputs;
}

// Validate → consume → produce. Never consumes without producing: a failed output refunds exactly what was spent.
export function craft(recipeId) {
  const a = availability(recipeId); if (!a.ok) return a;
  const r = a.recipe, device = dev(r), spent = [];
  if (r.atomic) {
    const res = storage.exchange(exchangeInputs(r), [{ loc: r.outputLoc, id: r.outputId, qty: r.outputQuantity }], { learnRecipeId: r.id });
    return res.ok ? { ok: true, recipe: r, outputId: r.outputId, quantity: r.outputQuantity, message: 'AX-36 synthesized · stored in your Zycube · research preserved' } : res;
  }
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
  const outputLoc = r.outputLoc || (r.stationType === 'FIELD_WORKSTATION' ? LOC.ZYCUBE : LOC.HOME_PC);
  const out = storage.add(outputLoc, r.outputId, r.outputQuantity);
  if (!out.ok) { refund(); return { ok: false, reason: out.reason, message: out.message }; }
  return { ok: true, recipe: r, outputId: r.outputId, quantity: r.outputQuantity, message: `${defOf(r.outputId).name} repaired · stored in ${outputLoc === LOC.HOME_PC ? 'Home Storage' : 'your Zycube'}` };
}
// Craft the same recipe repeatedly until something runs out (each pass is its own atomic craft).
export function craftMax(recipeId, limit = 99) {
  let n = 0, last = null; while (n < limit) { const r = craft(recipeId); if (!r.ok) { last = r; break; } n++; }
  return { ok: n > 0, count: n, message: n ? `Synthesised ×${n}` : (last?.message || 'Missing resources') };
}
export const learnRecipe = id => storage.learnRecipe(id);
export const crafting = { STATIONS, RECIPES, recipeOf, isKnown, listRecipes, availability, craft, craftMax, learnRecipe };
export default crafting;
