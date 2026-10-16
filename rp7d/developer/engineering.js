// Astralite Engineering transactions: all resources and progress commit to the
// existing inventory save in one write. Closing a screen never submits a hack.
import { inventory, saveInv, WEAPONS } from './loot.js';
import { storage, LOC } from './storage.js';
import { engineeringState, projectEngineering, mintPlasmabeam } from './engineering-ledger.js';
import { AX36_INPUTS, AX36_COMPOUND, AX36_RECIPE, hasStudied } from './engineering-research.js';

export const FROST_MOD = 'frost_of_destruction';
export const MOD_NAME = 'Frost of Destruction';
export const engineering = () => engineeringState(inventory);
const fail = message => ({ ok: false, message });
const required = (condition, message) => { if (!condition) throw new Error(message); };
// Only these fields participate; leave captured references to chests and unrelated
// world/UI data intact during rollback. Durability is checked before reporting success.
function transact(fn) {
  const fields = ['engineering', 'items', 'owned', 'home', 'equippedUid'];
  const before = Object.fromEntries(fields.map(k => [k, inventory[k] === undefined ? undefined : JSON.parse(JSON.stringify(inventory[k]))]));
  try {
    const result = fn(); projectEngineering(inventory);
    required(saveInv(), 'Could not save · no resources changed · try again');
    return { ok: true, ...result };
  } catch (error) {
    for (const k of fields) { if (before[k] === undefined) delete inventory[k]; else inventory[k] = before[k]; }
    return fail(error.message);
  }
}
export const chipByUid = uid => engineering().chips.find(c => c.uid === uid);
export const weaponByUid = uid => engineering().weapons.find(w => w.uid === uid);
export function selectedPlasmabeam() {
  return engineering().weapons.find(w => w.uid === inventory.equippedUid && w.loc === LOC.ZYCUBE)
    || engineering().weapons.find(w => w.type === 'plasmabeam' && w.loc === LOC.ZYCUBE);
}
export function claimPlasmabeam(source) {
  if (engineering().pickups[source]) return fail('This Plasmabeam was already collected');
  const can = storage.canStore(LOC.ZYCUBE, 'plasmabeam'); if (!can.ok) return can;
  return transact(() => {
    const w = mintPlasmabeam(inventory, LOC.ZYCUBE, source); engineering().pickups[source] = w.uid;
    return { weapon: w, message: 'Plasmabeam acquired · stored in Zycube · choose it from the Armory' };
  });
}
export function claimResearchNode(id, item) {
  const can = storage.canStore(LOC.ZYCUBE,item);if(!can.ok)return can;
  return transact(() => {
    const node=engineering().nodes[id];required(node?.harvested&&!node.collected,'This sample is not available');
    required((id==='home-ax3'&&item==='astralite_3_1')||(id==='home-ax6'&&item==='astralite_6_1'),'Incorrect research sample');
    inventory.items[item]=(inventory.items[item]||0)+1;node.collected=true;
    return {message:'Research sample collected · study it at the Astralite Station'};
  });
}
export function selectWeaponInstance(uid) {
  const w = weaponByUid(uid); if (!w || w.loc !== LOC.ZYCUBE) return fail('That weapon is not carried');
  return transact(() => { inventory.equippedUid = uid; return { message: 'Plasmabeam instance selected' }; });
}
export function carriedChips(custom = false) {
  return engineering().chips.filter(c => c.loc === LOC.ZYCUBE && (custom ? c.state === 'custom' : ['standard', 'decoded'].includes(c.state)));
}
export function insertChip(uid) {
  return transact(() => {
    const lab = engineering().lab, c = chipByUid(uid);
    required(!lab.fried && !lab.complete, 'Start a new session first');
    required(!lab.chipUid, 'A chip is already inserted');
    required(c && c.loc === LOC.ZYCUBE && ['standard', 'decoded'].includes(c.state), 'Select a carried standard or decoded chip');
    c.loc = 'LAB'; if (c.state === 'standard') c.state = 'inserted'; lab.chipUid = uid; lab.challenge = null;
    return { message: 'Chip inserted · saved in the computer · closing or reloading preserves it' };
  });
}
export function ejectChip() {
  return transact(() => {
    const lab = engineering().lab, c = chipByUid(lab.chipUid); required(c?.loc === 'LAB', 'No chip inserted');
    required(!inventory.zycube, 'Recover your Zycube before ejecting this chip');
    if (c.state === 'inserted') c.state = 'standard'; c.loc = LOC.ZYCUBE; lab.chipUid = null; lab.challenge = null;
    projectEngineering(inventory); required(storage.slotsUsed() <= storage.capacity(), 'Make room in your Zycube first');
    return { message: 'Chip returned safely · no failed attempt charged' };
  });
}
export function newLabSession() {
  return transact(() => {
    const lab = engineering().lab;
    required(!lab.chipUid && (lab.fried || lab.complete), 'A session ends only after three failed submissions or successful programming');
    if(lab.fried)required(carriedChips().some(c=>c.state==='standard') && storage.count(LOC.ZYCUBE,AX36_COMPOUND)>0 && !inventory.zycube,'A fried session needs a fresh standard chip and a carried AX-36 compound to restart');
    engineering().lab = { failures: 0, fried: false, complete: false, chipUid: null, challenge: null };
    return { message: 'New firewall session · bring a chip and AX-36 for programming' };
  });
}
export function beginChallenge(phase) {
  return transact(() => {
    const e = engineering(), lab = e.lab, chip = chipByUid(lab.chipUid);
    required(!lab.fried && lab.failures < 3 && chip?.loc === 'LAB', 'Insert a chip into an active session first');
    if (lab.challenge) return { message: 'Continue your saved challenge' };
    required(phase === 'decode' || phase === 'program', 'Unknown challenge');
    if (phase === 'decode') required(chip.state === 'inserted', 'This chip is already decoded');
    else {
      required(chip.state === 'decoded', 'Decode the chip first');
      required(AX36_INPUTS.every(hasStudied) && inventory.recipes?.includes(AX36_RECIPE), 'Study and synthesize AX-36 first');
      required(storage.count(LOC.ZYCUBE, AX36_COMPOUND) > 0 && !inventory.zycube, 'Carry one physical AX-36 compound');
    }
    const variant = (e.seq + lab.failures) % 3;
    lab.challenge = phase === 'decode'
      ? { phase, target: ['A3', '06', '36', 'AX'], input: ['36', 'AX', 'A3', '06'], selected: null }
      : { phase, blocked: [[1, 2, 6], [2, 6, 7], [3, 6, 7]][variant], path: [0] };
    return { message: phase === 'decode' ? 'DECODE · swap fragments into the reference order; submit to test' : 'REPROGRAM · connect IN (1) to OUT (9) through adjacent open cells, then submit' };
  });
}
export function challengeInput(index) {
  return transact(() => {
    const q = engineering().lab.challenge; required(q && Number.isInteger(index), 'No active challenge');
    if (q.phase === 'decode') {
      required(index >= 0 && index < 4, 'Invalid fragment');
      if (q.selected == null) q.selected = index;
      else { [q.input[q.selected], q.input[index]] = [q.input[index], q.input[q.selected]]; q.selected = null; }
    } else {
      required(index >= 0 && index < 9 && !q.blocked.includes(index), 'That circuit cell is blocked');
      const previous = q.path.at(-1);
      if (index === 0) q.path = [0];
      else if (q.path.includes(index)) q.path = q.path.slice(0, q.path.indexOf(index) + 1);
      else { required(Math.abs(index % 3 - previous % 3) + Math.abs(Math.floor(index / 3) - Math.floor(previous / 3)) === 1, 'Connect an adjacent cell'); q.path.push(index); }
    }
    return {};
  });
}
export function submitChallenge() {
  return transact(() => {
    const lab = engineering().lab, chip = chipByUid(lab.chipUid), q = lab.challenge;
    required(!lab.fried && lab.failures < 3 && chip?.loc === 'LAB' && q, 'No submitted challenge available');
    const correct = q.phase === 'decode' ? q.input.every((s, i) => s === q.target[i]) : q.path.at(-1) === 8;
    if (!correct) {
      chip.state = 'destroyed'; chip.loc = 'DESTROYED'; lab.failures++; lab.fried = lab.failures >= 3; lab.chipUid = null; lab.challenge = null;
      return { failedAttempt: true, message: `Firewall rejected submission · chip destroyed · ${lab.failures}/3 failures${lab.fried ? ' · SESSION CIRCUIT-FRIED' : ' · insert another chip'}. AX-36 was not consumed.` };
    }
    if (q.phase === 'decode') { chip.state = 'decoded'; lab.challenge = null; return { message: 'Chip decoded · reprogramming challenge unlocked' }; }
    required(chip.state === 'decoded' && AX36_INPUTS.every(hasStudied) && inventory.recipes?.includes(AX36_RECIPE), 'AX-36 research and synthesis required');
    required(!inventory.zycube && (inventory.items?.[AX36_COMPOUND] || 0) >= 1, 'Carry one AX-36 compound to finish programming');
    inventory.items[AX36_COMPOUND]--; if (!inventory.items[AX36_COMPOUND]) delete inventory.items[AX36_COMPOUND];
    chip.state = 'custom'; chip.loc = LOC.ZYCUBE; chip.compound = 'AX-36'; chip.mod = FROST_MOD;
    lab.chipUid = null; lab.challenge = null; lab.complete = true;
    projectEngineering(inventory); required(storage.slotsUsed() <= storage.capacity(), 'Make room for the programmed chip');
    return { message: 'Frost of Destruction programmed · AX-36 ×1 consumed · same chip returned to Zycube' };
  });
}
export function installationReason(chip, weapon) {
  if (!chip || chip.state !== 'custom' || chip.loc !== LOC.ZYCUBE) return 'Carry this custom chip first';
  if (!weapon || weapon.loc !== LOC.ZYCUBE) return 'Item is not carried';
  if (weapon.type !== 'plasmabeam' || chip.mod !== FROST_MOD) return 'Frost of Destruction is compatible with Plasmabeam';
  if (weapon.mods.some(uid => chipByUid(uid)?.mod === chip.mod)) return 'This active mode is already installed';
  if (weapon.mods.length >= weapon.level) return 'All permanent mod slots are occupied';
  return null;
}
export function installChip(chipUid, weaponUid) {
  return transact(() => {
    const c = chipByUid(chipUid), w = weaponByUid(weaponUid), reason = installationReason(c, w); required(!reason, reason);
    w.mods.push(c.uid); c.state = 'installed'; c.loc = 'WEAPON'; c.weaponUid = w.uid;
    return { message: `${MOD_NAME} permanently installed · ${w.mods.length}/${w.level} slots · cannot remove or replace` };
  });
}
export function cyclePlasmaMode() {
  return transact(() => {
    const w = selectedPlasmabeam(); required(w, 'Carry a Plasmabeam first');
    const frost = w.mods.some(uid => chipByUid(uid)?.mod === FROST_MOD);
    w.mode = frost && w.mode !== 'frost' ? 'frost' : 'plasma';
    return { mode: w.mode, message: w.mode === 'frost' ? 'BLUE FIRE-ICE · Frost of Destruction · zero direct HP damage' : `GREEN PLASMA${frost ? '' : ' · install a Frost chip to unlock fire-ice'}` };
  });
}
export function ownedItemRows() {
  return ['ZYCUBE', 'HOME_PC'].flatMap(loc => {
    const c = storage.contents(loc);
    return [...c.weapons.map(w => ({ uid: w.uid, type: w.id, name: w.def.name, loc, level: 1, mods: [], ...weaponByUid(w.uid) })),
      ...c.equipment.map(e => ({ uid: e.uid, type: e.id, name: e.def.name, loc })),
      ...c.stacks.map(s => ({ uid: `stack:${loc}:${s.id}`, type: s.id, name: s.def.name, loc }))];
  });
}
export const UPGRADE_LEVELS = Object.freeze([1, 2, 3, 4, 5]);
export const WEAPON_UPGRADE_NOTE = 'Weapon levels 1–5 support 1–5 permanent mod slots. Gem upgrade prices are not configured yet.';
