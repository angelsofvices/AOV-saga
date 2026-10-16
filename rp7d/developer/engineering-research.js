// Permanent study records are knowledge. Astralite samples and AX-36 are physical inventory.
// This module adds no entries to the canonical 63-Astralite Matrix.
import { inventory, saveInv } from './loot.js';
import { storage, LOC } from './storage.js';
import { defOf } from './item-registry.js';

export const AX36_INPUTS = Object.freeze(['astralite_3_1', 'astralite_6_1']);
export const AX36_RECIPE = 'synth_ax36';
export const AX36_COMPOUND = 'compound_ax36';
export const hasStudied = id => !!inventory.astraliteEngineering?.studied?.[id];
export function studyRows() {
  return AX36_INPUTS.map(id => ({ id, name: defOf(id).name, studied: hasStudied(id),
    carried: storage.count(LOC.ZYCUBE, id), home: storage.count(LOC.HOME_PC, id) }));
}
// Only called from the physical Astralite Station. Samples are inspected, never consumed.
export function studyAstralite(id) {
  if (!AX36_INPUTS.includes(id)) return { ok: false, message: 'No study configured for that Astralite' };
  if (hasStudied(id)) return { ok: true, message: `${defOf(id).name} · already studied` };
  if (storage.count(LOC.ZYCUBE, id) + storage.count(LOC.HOME_PC, id) < 1) return { ok: false, message: 'Bring a physical sample in your Zycube or Home Storage' };
  const before = JSON.stringify(inventory.astraliteEngineering ?? null);
  const progress = inventory.astraliteEngineering ||= { version: 1, studied: {} };
  (progress.studied ||= {})[id] = true;
  if (!saveInv()) {
    const old = JSON.parse(before); if (old === null) delete inventory.astraliteEngineering; else inventory.astraliteEngineering = old;
    return { ok: false, message: 'Study could not be saved · sample unchanged · try again' };
  }
  return { ok: true, message: `${defOf(id).name} studied · sample preserved${AX36_INPUTS.every(hasStudied) ? ' · AX-36 recipe ready at the Experiment Table' : ''}` };
}
