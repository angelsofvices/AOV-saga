// Shared combat taxonomy. Inventory category (weapon vs utility) is separate:
// this registry tells combat systems which effects a held item can call.
export const WEAPON_GROUPS = Object.freeze({
  UNARMED: Object.freeze({ id: 'UNARMED', label: 'Unarmed', cleanFinisher: 'none' }),
  MELEE_BLADE: Object.freeze({ id: 'MELEE_BLADE', label: 'Melee blades', cleanFinisher: 'combo-dismember' }),
  BOW: Object.freeze({ id: 'BOW', label: 'Bows', cleanFinisher: 'precision-headshot' }),
  ENERGY_PISTOL: Object.freeze({ id: 'ENERGY_PISTOL', label: 'Energy pistols', cleanFinisher: 'precision-headshot' }),
  ENERGY_RIFLE: Object.freeze({ id: 'ENERGY_RIFLE', label: 'Energy rifles', cleanFinisher: 'precision-headshot' }),
  UTILITY: Object.freeze({ id: 'UTILITY', label: 'Utilities', cleanFinisher: 'none' }),
  UNCLASSIFIED: Object.freeze({ id: 'UNCLASSIFIED', label: 'Unclassified', cleanFinisher: 'none' })
});

const GROUP_BY_ITEM = Object.freeze({
  fists: 'UNARMED',
  sword: 'MELEE_BLADE', axe: 'MELEE_BLADE', rubypaw: 'MELEE_BLADE',
  bow: 'BOW',
  plasmabeam: 'ENERGY_PISTOL', pistol: 'ENERGY_PISTOL',
  blaster: 'ENERGY_RIFLE', rifle: 'ENERGY_RIFLE',
  guitar: 'UTILITY', telescope: 'UTILITY', workstation: 'UTILITY', life_seed: 'UTILITY', astralboard: 'UTILITY'
});

export function weaponGroupOf(itemId) {
  return WEAPON_GROUPS[GROUP_BY_ITEM[String(itemId || '').toLowerCase()]] || WEAPON_GROUPS.UNCLASSIFIED;
}

export function qualifiesForCleanComboDismemberment(itemId, impact = {}) {
  return weaponGroupOf(itemId).cleanFinisher === 'combo-dismember'
    && impact.perfectKill === true && impact.comboFinisher === true;
}

export function qualifiesForCleanPrecisionHeadshot(itemId, target) {
  const effect = weaponGroupOf(itemId).cleanFinisher;
  return effect === 'precision-headshot' && !target?.perfectKillBroken && !target?.isScanobot;
}
