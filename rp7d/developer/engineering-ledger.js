// Physical identity ledger. Legacy quantity fields are projections for the HUD,
// item browser and Gatelocks; they are never a second set of spendable chips.
export function engineeringState(inv) {
  const e = inv.engineering ||= { version: 1 };
  e.seq ||= 0; e.chips ||= []; e.weapons ||= []; e.pickups ||= {}; e.nodes ||= {};
  e.lab ||= { failures: 0, fried: false, chipUid: null, challenge: null, complete: false };
  e.social ||= { read: [], bookmarks: [], unlocked: [], notified: [] }; e.social.downloads ||= [];
  if (!e.migrated) {
    for (const [loc, items] of [['ZYCUBE', inv.items], ['HOME_PC', inv.home?.items], ['LOST', inv.zycube?.items]])
      for (let i = 0, n = Math.max(0, items?.portalchip | 0); i < n; i++) e.chips.push({ uid: `chip-${++e.seq}`, state: 'standard', loc });
    e.migrated = true;
  }
  return e;
}
export const nextEngineeringUid = (inv, prefix) => `${prefix}-${++engineeringState(inv).seq}`;
export function projectEngineering(inv) {
  const e = engineeringState(inv); inv.items ||= {}; inv.owned ||= ['fists']; inv.home ||= { items: {}, weapons: [] }; inv.home.items ||= {}; inv.home.weapons ||= [];
  for (const [loc, items] of [['ZYCUBE', inv.items], ['HOME_PC', inv.home.items], ['LOST', inv.zycube?.items]]) {
    if (!items) continue;
    for (const [state, key] of [['standard', 'portalchip'], ['decoded', 'decoded_portalchip'], ['custom', 'custom_portalchip']]) {
      const n = e.chips.filter(c => c.loc === loc && c.state === state).length;
      if (n) items[key] = n; else delete items[key];
    }
  }
  for (const [loc, list] of [['ZYCUBE', inv.owned], ['HOME_PC', inv.home.weapons]]) {
    const has = e.weapons.some(w => w.type === 'plasmabeam' && w.loc === loc), i = list.indexOf('plasmabeam');
    if (has && i < 0) list.push('plasmabeam'); else if (!has && i >= 0) list.splice(i, 1);
  }
}
export function mintStandardChips(inv, qty, loc = 'ZYCUBE') {
  const e = engineeringState(inv);
  for (let i = 0; i < qty; i++) e.chips.push({ uid: nextEngineeringUid(inv, 'chip'), state: 'standard', loc });
  projectEngineering(inv);
}
export function spendStandardChips(inv, qty, loc = 'ZYCUBE') {
  const chips = engineeringState(inv).chips.filter(c => c.loc === loc && c.state === 'standard');
  if (!Number.isSafeInteger(qty) || qty < 1 || chips.length < qty) return false;
  for (const c of chips.slice(0, qty)) { c.state = 'spent'; c.loc = 'CONSUMED'; }
  projectEngineering(inv); return true;
}
export function moveEngineeringChips(inv, from, to) {
  for (const c of engineeringState(inv).chips) if (c.loc === from && ['standard', 'decoded', 'custom'].includes(c.state)) c.loc = to;
  projectEngineering(inv);
}
export function mintPlasmabeam(inv, loc = 'ZYCUBE', source = null) {
  const e = engineeringState(inv), w = { uid: nextEngineeringUid(inv, 'plasmabeam'), type: 'plasmabeam', loc, level: 1, mods: [], mode: 'plasma', source };
  e.weapons.push(w); projectEngineering(inv); return w;
}
