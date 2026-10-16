import { inventory, saveInv } from './loot.js';
import { engineering, chipByUid, ownedItemRows, installationReason, installChip, selectWeaponInstance, WEAPON_UPGRADE_NOTE } from './engineering.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
export function createPortalChipsUI(root) {
  let tab = 'standard', selected = null, applying = false, pending = null, message = '';
  const b = (label, action, extra = '') => `<button class="zy-item" data-item data-portal-chip="${action}" ${extra}>${label}</button>`;
  function render() {
    const e = engineering(), c = chipByUid(selected), custom = tab === 'custom';
    const chips = e.chips.filter(c => custom ? ['custom','installed'].includes(c.state) : ['standard','inserted','decoded'].includes(c.state));
    root.innerHTML = `<h2>PORTAL CHIPS</h2><p>Physical chip instances · standard chips also power Gatelocks. Insert and decode chips at your home computer.</p>
      <div class="cf-fragments">${b('STANDARD CHIPS','tab','data-tab="standard"')}${b('CUSTOM CHIPS','tab','data-tab="custom"')}</div>
      <p role="status">${esc(message)}</p><div class="zy-system-cards">${chips.map(c => b(`${esc(c.uid)} · ${esc(c.mod ? 'Frost of Destruction · AX-36' : 'Portal Chip')}<small>${esc(c.state)} · ${esc(c.loc)}</small>`, 'select', `data-uid="${c.uid}"`)).join('') || '<p>No chips in this view. Defeat tech enemies to find standard chips.</p>'}</div>
      ${c ? `<article class="cf-post"><h3>${esc(c.uid)} · ${esc(c.state)}</h3><p>${c.mod ? 'AX-36 · Frost of Destruction · compatible with Plasmabeam · permanent installation' : 'Decode and program this physical chip in CyberFall Lab.'}</p>${c.state === 'custom' && c.loc === 'ZYCUBE' ? b('APPLY TO ITEM','apply') : ''}</article>` : ''}
      ${applying && c ? `<h3>OWNED ITEMS · choose a compatible carried weapon</h3><div class="zy-system-cards">${ownedItemRows().map(w => { const reason = installationReason(c,w); return b(`${esc(w.name)} · ${esc(w.uid)}<small>${esc(reason || `COMPATIBLE · Level ${w.level} · ${w.mods.length}/${w.level} slots`)}</small>`, 'item', `data-uid="${esc(w.uid)}" ${reason ? 'disabled' : ''}`); }).join('')}</div>${pending ? b('CONFIRM PERMANENT INSTALL · cannot remove or replace','install') : ''}` : ''}
      <p>${esc(WEAPON_UPGRADE_NOTE)}</p>`;
  }
  root.addEventListener('click', ev => {
    const el = ev.target.closest('[data-portal-chip]'); if (!el || el.disabled) return;
    ev.stopPropagation(); const action = el.dataset.portalChip;
    if (action === 'tab') { tab = el.dataset.tab; selected = null; applying = false; pending = null; }
    if (action === 'select') { selected = el.dataset.uid; applying = false; pending = null; }
    if (action === 'apply') applying = true;
    if (action === 'item') pending = el.dataset.uid;
    if (action === 'install') { const res = installChip(selected,pending); message = res.message; if (res.ok) { applying = false; pending = null; } }
    render();
  });
  return { render };
}
