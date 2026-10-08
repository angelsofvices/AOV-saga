// RP7D · central item registry.
// A definition says WHAT an item is. It never says how many there are or where they are: that is inventory state
// (storage.js). Weapons come from loot.js · WEAPONS, resources / consumables / key items from loot.js · ITEMS, and
// Field Equipment (deployables) from FIELD_EQUIPMENT below. Everything is looked up through defOf(id).
import { ITEMS, WEAPONS, RIDES } from './loot.js';

export const CATEGORY = Object.freeze({
  WEAPON: 'WEAPON', RESOURCE: 'RESOURCE', ITEM: 'ITEM', FIELD_EQUIPMENT: 'FIELD_EQUIPMENT', SPECIAL: 'SPECIAL', MEDIA: 'MEDIA'
});
export const CATEGORY_ORDER = [CATEGORY.WEAPON, CATEGORY.FIELD_EQUIPMENT, CATEGORY.RESOURCE, CATEGORY.ITEM, CATEGORY.MEDIA, CATEGORY.SPECIAL];
export const CATEGORY_LABEL = {
  WEAPON: 'WEAPONS', FIELD_EQUIPMENT: 'FIELD EQUIPMENT', RESOURCE: 'RESOURCES', ITEM: 'ITEMS', MEDIA: 'DVDS', SPECIAL: 'KEY ITEMS'
};

// Field Equipment: physical utility assets Rizer crafts, stores, carries, deploys, uses and packs up again.
// Each one is a UNIQUE instance (inventory.equipment) that is in exactly one place: ZYCUBE, HOME_PC or DEPLOYED.
//   slots      Zycube capacity it takes while carried
//   footprint  half-extents of its placement box (metres, local x = width, z = depth)
//   modules    field utilities it will grow into; `available: false` ones are shown as not installed yet
export const FIELD_EQUIPMENT = {
  // A ride: unique (there is only one Astralboard), deployed where it is called down, packed up to carry again.
  astralboard: {
    name: 'Astralboard', color: '#6b4bef', slots: 3, ride: true, single: true,
    blurb: RIDES.astralboard.blurb + ' Deploy it to set it down, ○ / E beside it to ride, pack it up to carry it again.',
    footprint: { hw: 0.55, hd: 1.15 }, reach: 3.4, modules: []
  },
  field_workstation: {
    name: 'Field Workstation', color: '#7fd6ff', slots: 4,
    blurb: 'A deployable bench Rizer built at his Experiment Table. Set it down anywhere to get practical field support away from home. It is a field utility, not a second Experiment Table.',
    footprint: { hw: 1.15, hd: 0.55 }, reach: 3.2,
    modules: [
      { id: 'maintenance', name: 'Field maintenance', note: 'Repairs and upkeep for carried equipment', available: false },
      { id: 'configuration', name: 'Equipment configuration', note: 'Adjust how carried gear is set up', available: false },
      { id: 'salvage', name: 'Salvaging', note: 'Break down finds into parts', available: false },
      { id: 'processing', name: 'Resource processing', note: 'Prepare gathered materials', available: false },
      { id: 'expedition', name: 'Expedition preparation', note: 'Get ready before heading further out', available: false }
    ]
  }
};

const cache = new Map();
export function defOf(id) {
  if (!id) return null;
  if (cache.has(id)) return cache.get(id);
  let d = null;
  if (FIELD_EQUIPMENT[id]) {
    const e = FIELD_EQUIPMENT[id];
    d = { id, name: e.name, category: CATEGORY.FIELD_EQUIPMENT, unique: true, stackable: false, slots: e.slots, transferable: true, deployable: true, color: e.color, blurb: e.blurb };
  } else if (WEAPONS[id]) {
    const w = WEAPONS[id];
    d = { id, name: w.name, category: CATEGORY.WEAPON, unique: true, stackable: false, slots: id === 'fists' ? 0 : 1, transferable: id !== 'fists', deployable: false, color: '#c9d6e6', blurb: w.blurb || '' };
  } else if (ITEMS[id]?.kind === 'dvd') { // a collectible movie (dvd-registry.js): one of each, played in the TV (tv-system.js)
    const it = ITEMS[id];
    d = { id, name: it.name, category: CATEGORY.MEDIA, unique: false, stackable: true, stackMax: 1, slots: 1, transferable: true, deployable: false, color: it.color, blurb: it.blurb };
  } else if (ITEMS[id] && ITEMS[id].kind !== 'currency') {
    const it = ITEMS[id], key = it.kind === 'key';
    d = { id, name: it.name, category: key ? CATEGORY.SPECIAL : it.kind === 'consumable' ? CATEGORY.ITEM : CATEGORY.RESOURCE,
      unique: false, stackable: true, stackMax: 99, slots: 1, transferable: !key, deployable: false, color: it.color || '#ccc', blurb: it.blurb || '' };
    // Key items (Portal Chips, Zypheres) stay in the Zycube: gatelocks and bonding read them there.
  }
  if (d) cache.set(id, d); // unknown ids are not cached: loot.js may still be adding to ITEMS
  return d;
}
export const isUnique = id => !!defOf(id)?.unique;
export const isStackable = id => !!defOf(id)?.stackable;
export const isWeaponId = id => !!WEAPONS[id] && !FIELD_EQUIPMENT[id];
export const isEquipmentId = id => !!FIELD_EQUIPMENT[id];
