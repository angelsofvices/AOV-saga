// RP7D · station screens: Nebuladock 3000 (Home Storage ⇄ Zycube), Experiment Table (crafting), Field Workstation (field utility), Astralite Station.
// These are the only places items move between storage locations or get created. The Zyphone never does either.
// UI owns no data: it asks storage.js / crafting.js and re-reads.
// Nebuladock keys: ↑↓ choose · ←→ Home Storage / Zycube · Q E category · F sort · Z X / digits quantity · Enter move · Space move all · Esc leave.
import { storage, LOC } from './storage.js';
import { crafting } from './crafting.js';
import { defOf, CATEGORY_ORDER, CATEGORY_LABEL, FIELD_EQUIPMENT } from './item-registry.js';
import { nebulaAudio } from './nebula-audio.js';
import { STORES, department, stockRows, sellable, buy, sell, gold, storeState } from './store.js';

const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const TABS = [{ id: 'ALL', label: 'STORAGE' }, { id: 'WEAPON', label: 'WEAPONS' }, { id: 'ITEM', label: 'ITEMS' }, { id: 'RESOURCE', label: 'RESOURCES' }, { id: 'FIELD_EQUIPMENT', label: 'FIELD EQUIPMENT' }];
const SORTS = ['CATEGORY', 'NAME', 'QUANTITY'];
const PRESETS = [1, 5, 10, 'ALL'];
const TYPE = { WEAPON: 'Weapon', FIELD_EQUIPMENT: 'Field Equipment', RESOURCE: 'Resource', ITEM: 'Item', SPECIAL: 'Key Item' };
const PLACE = { ZYCUBE: 'WITH RIZER', HOME_PC: 'HOME STORAGE', DEPLOYED: 'DEPLOYED' };

export function createStationUI({ toast = () => {}, onPack = () => {}, onOpen = () => {}, onClose = () => {} } = {}) {
  const root = document.createElement('div'); root.id = 'station-ui'; root.hidden = true; document.body.appendChild(root);
  let kind = null, ctx = null, col = 0, focus = [0, 0], notice = '', bad = false, showAll = false;
  let tab = 0, sort = 0, qi = 0, custom = '';
  const isOpen = () => !root.hidden;

  // rows for one storage location, filtered by the open category and ordered by the chosen sort
  function rowsFor(loc) {
    const c = storage.contents(loc), t = TABS[tab].id;
    const all = [
      ...c.weapons.filter(w => w.id !== 'fists').map(w => ({ id: w.id, qty: 1, def: w.def, uid: w.uid })),
      ...c.equipment.map(e => ({ id: e.id, qty: 1, def: e.def, uid: e.uid })),
      ...c.stacks.map(s => ({ id: s.id, qty: s.qty, def: s.def }))
    ].filter(r => t === 'ALL' || r.def.category === t);
    if (sort === 0) return CATEGORY_ORDER.map(cat => ({ cat, rows: all.filter(r => r.def.category === cat) })).filter(g => g.rows.length);
    const rows = all.slice().sort(sort === 1 ? (a, b) => a.def.name.localeCompare(b.def.name) : (a, b) => b.qty - a.qty || a.def.name.localeCompare(b.def.name));
    return rows.length ? [{ cat: null, rows }] : [];
  }
  const flat = loc => rowsFor(loc).flatMap(g => g.rows);
  // Home Storage on the left, the connected Zycube on the right
  const columns = () => [{ loc: LOC.HOME_PC, title: 'HOME STORAGE', sub: 'reserve · no limit', to: LOC.ZYCUBE, toName: 'ZYCUBE' }, { loc: LOC.ZYCUBE, title: `ZYCUBE · ${storage.tier().name}`, sub: 'carried', to: LOC.HOME_PC, toName: 'HOME STORAGE' }];
  const sel = () => flat(columns()[col].loc)[focus[col]] || null;
  const zyOnline = () => storage.canStore(LOC.ZYCUBE, 'gemshard', 1).reason !== 'ZYCUBE_LOST'; // derived from the setup: the Zycube is on Rizer
  const amount = r => r.def.unique ? 1 : custom ? Math.max(1, +custom) : PRESETS[qi] === 'ALL' ? r.qty : PRESETS[qi];

  function homeHTML() {
    const used = storage.slotsUsed(LOC.ZYCUBE), cap = storage.capacity(), pct = Math.min(100, used / cap * 100), free = Math.max(0, cap - used);
    const online = zyOnline(), r = sel(), here = columns()[col];
    const deployed = storage.equipmentIn(LOC.DEPLOYED).filter(e => TABS[tab].id === 'ALL' || TABS[tab].id === 'FIELD_EQUIPMENT');
    const tabs = TABS.map((t, i) => `<button class="nb-tab${i === tab ? ' on' : ''}" data-tab="${i}">${t.label}</button>`).join('') + `<span class="nb-tab soon" title="Not available yet">RESEARCH · SOON</span>`;
    const detail = r ? (() => {
      const unique = r.def.unique, can = r.def.transferable, n = amount(r);
      return `<div class="nb-dh"><i class="st-sw" style="background:${esc(r.def.color)}"></i><b>${esc(r.def.name)}</b></div>
        <div class="nb-kv"><span>TYPE</span><b>${TYPE[r.def.category] || ''}</b><span>LOCATION</span><b>${PLACE[here.loc]}</b><span>QUANTITY</span><b>${unique ? 'UNIQUE · 1' : '×' + r.qty}</b><span>SPACE</span><b>${r.def.slots ? r.def.slots + (r.def.slots > 1 ? ' slots' : ' slot') + (unique ? '' : ' each') : 'none'}</b></div>
        <p>${esc(r.def.blurb || 'No description.')}</p>
        ${can ? `<div class="nb-xfer">${unique ? '' : `<div class="nb-q">${PRESETS.map((q, i) => `<button class="nb-chip${!custom && qi === i ? ' on' : ''}" data-q="${i}">${q === 'ALL' ? 'ALL' : q}</button>`).join('')}<button class="nb-chip${custom ? ' on' : ''}" data-q="c">${custom ? 'CUSTOM ' + esc(custom) : 'CUSTOM'}</button></div>`}
          <button class="st-btn" data-xfer>${here.loc === LOC.HOME_PC ? 'SEND' : 'STORE'} ${unique ? '' : '×' + Math.min(n, r.qty) + ' '}→ ${here.toName}</button></div>` : `<small class="st-note">STAYS IN ZYCUBE · not transferable</small>`}`;
    })() : '<div class="st-empty">Nothing selected</div>';
    return `<div class="nb-top"><div><small>RIZER'S HOME PC</small><b>NEBULADOCK 3000</b></div>
      <div class="nb-link ${online ? 'on' : 'off'}"><i></i><span>ZYLINK ${online ? 'ONLINE' : 'OFFLINE'}</span><small>${online ? 'Home Storage ⇄ Zycube' : 'No Zycube on Rizer'}</small></div></div>
      <div class="nb-tabs">${tabs}<em>SORT · ${SORTS[sort]}</em></div>
      <div class="nb-msg${bad ? ' bad' : ''}">${esc(notice) || '&nbsp;'}</div>
      <div class="nb-grid"><div class="st-cols nb-cols">${columns().map((C, ci) => {
        const groups = rowsFor(C.loc); let n = -1;
        return `<section class="st-col${col === ci ? ' on' : ''}" data-col="${ci}"><header><b>${C.title}</b><small>${C.sub}</small></header>
          ${ci === 1 ? `<div class="st-cap${free === 0 ? ' full' : ''}"><i style="width:${pct}%"></i><span>${used} / ${cap} slots · ${free} free</span></div>` : `<div class="st-cap home"><span>${storage.slotsUsed(LOC.HOME_PC)} slots held</span></div>`}
          <div class="st-list">${groups.length ? groups.map(g => (g.cat ? `<small class="st-cat">${CATEGORY_LABEL[g.cat]}</small>` : '') + g.rows.map(x => { n++; const lock = !x.def.transferable;
            return `<div class="st-row${col === ci && focus[ci] === n ? ' focus' : ''}${lock ? ' lock' : ''}" data-col="${ci}" data-i="${n}"><i class="st-sw" style="background:${esc(x.def.color)}"></i><b>${esc(x.def.name)}</b>${x.def.unique ? '<em></em>' : `<em>×${x.qty}</em>`}<small>${lock ? 'STAYS IN ZYCUBE' : '→ ' + C.toName}</small></div>`; }).join('')).join('') : '<div class="st-empty">Empty</div>'}</div></section>`; }).join('')}</div>
        <aside class="st-col nb-side"><header><b>DETAILS</b><small>${PLACE[here.loc]}</small></header>${detail}</aside></div>
      ${deployed.length ? `<div class="nb-dep"><small>DEPLOYED</small>${deployed.map(e => `<span>${esc(defOf(e.type)?.name || e.type)}</span>`).join('')}<em>in the field · not in Home Storage</em></div>` : ''}
      <div class="st-foot"><span>Total owned never changes · items only move between Home Storage and the Zycube</span><em>↑↓ choose · ←→ side · Q/E category · F sort · Z/X or digits quantity · Enter move · Space all · Esc leave</em></div>`;
  }
  function expHTML() {
    const recipes = crafting.listRecipes('EXPERIMENT_TABLE'); focus[0] = Math.min(focus[0], Math.max(0, recipes.length - 1));
    const cur = recipes[focus[0]], a = cur && crafting.availability(cur);
    return `<div class="st-head"><small>EXPERIMENT TABLE · ZYLINK</small><b>Create</b><span>Items are made here. Resources are read from your Home Storage and Zycube; the finished item goes to your Home Storage.</span></div>
      <div class="st-cols one"><section class="st-col on"><header><b>KNOWN RECIPES</b></header><div class="st-list">${recipes.map((r, i) => { const av = crafting.availability(r); return `<div class="st-row${focus[0] === i ? ' focus' : ''}${av.ok ? '' : ' lock'}" data-i="${i}"><i class="st-sw" style="background:${esc(defOf(r.outputId)?.color || '#ccc')}"></i><b>${esc(r.name)}</b><small>${av.ok ? 'READY' : esc(av.message.toUpperCase())}</small></div>`; }).join('') || '<div class="st-empty">No recipes known</div>'}</div></section>
      <section class="st-col detail">${cur ? `<header><b>${esc(cur.name)}</b><small>${esc(defOf(cur.outputId)?.category === 'FIELD_EQUIPMENT' ? 'FIELD EQUIPMENT' : 'ITEM')}</small></header><p>${esc(defOf(cur.outputId)?.blurb || '')}</p>
        <div class="st-ings">${a.lines.map(l => `<div class="${l.have >= l.need ? 'ok' : 'bad'}"><span>${esc(l.name)}</span><b>${l.have} / ${l.need}</b></div>`).join('')}</div>
        <button class="st-btn" data-craft ${a.ok ? '' : 'disabled'}>${a.ok ? 'CRAFT' : esc(a.message.toUpperCase())}</button>${cur.note ? `<small class="st-note">${esc(cur.note)}</small>` : ''}` : ''}</section></div>
      <div class="st-foot"><span>${esc(notice)}</span><em>Experimentation with unknown combinations is not available yet · ↑↓ choose · Enter craft · Esc close</em></div>`;
  }
  function fwHTML() {
    const e = storage.equipmentByUid(ctx.uid), F = FIELD_EQUIPMENT.field_workstation;
    return `<div class="st-head"><small>FIELD WORKSTATION · ZYLINK</small><b>Field utility</b><span>A deployed workbench for use away from home. It is not an Experiment Table: it cannot create items.</span></div>
      <div class="st-cols one"><section class="st-col on"><header><b>MODULES</b><small>not installed yet</small></header><div class="st-list">${F.modules.map(m => `<div class="st-row lock"><b>${esc(m.name)}</b><small>NOT INSTALLED</small><em>${esc(m.note)}</em></div>`).join('')}</div></section>
      <section class="st-col detail"><header><b>Pack up</b></header><p>Fold it away and carry it again. It needs room in the Zycube; if there is none it stays standing.</p><button class="st-btn" data-pack ${e?.loc === LOC.DEPLOYED ? '' : 'disabled'}>PACK UP</button></section></div>
      <div class="st-foot"><span>${esc(notice)}</span><em>Enter pack up · Esc close</em></div>`;
  }

  // Astralite Station: every Astralite you hold (Zycube + Home Storage) can be synthesised into Gemshards.
  function astList() {
    const all = crafting.listRecipes('ASTRALITE_STATION').map(r => ({ r, a: crafting.availability(r) }));
    const held = x => x.a.lines[0].have > 0;
    return (showAll || !all.some(held)) ? all : all.filter(held);
  }
  function astHTML() {
    const list = astList(); focus[0] = Math.max(0, Math.min(focus[0], list.length - 1));
    const gem = storage.count(LOC.ZYCUBE, 'gemshard') + storage.count(LOC.HOME_PC, 'gemshard'), none = !crafting.listRecipes('ASTRALITE_STATION').some(r => crafting.availability(r).lines[0].have > 0);
    let last = null;
    const rows = list.map(({ r, a }, i) => {
      const head = r.group !== last ? `<small class="st-cat" style="color:${esc(r.color)}">${esc(r.group)}</small>` : ''; last = r.group;
      const L = a.lines[0], can = L.have >= L.need;
      return head + `<div class="st-row${focus[0] === i ? ' focus' : ''}${can ? '' : ' lock'}" data-i="${i}"><i class="st-sw" style="background:${esc(r.color)}"></i><b>${esc(r.name)}</b><em>×${L.have}</em><small>${can ? `${L.need} → 1 GEMSHARD` : `NEED ${L.need}`}</small></div>`;
    }).join('');
    return `<div class="st-head"><small>ASTRALITE STATION · ZYLINK</small><b>Synthesize</b><span>Fuse Astralites from your Zycube and Home Storage into Gemshards. Gemshards are stored in your Home Storage.</span></div>
      <div class="st-cols one"><section class="st-col on"><header><b>ASTRALITES</b><small>${showAll ? 'all 63' : 'held only'}</small></header><div class="st-list st-tall">${rows || '<div class="st-empty">Nothing to show</div>'}</div></section>
      <section class="st-col detail"><header><b>GEMSHARDS</b><small>owned</small></header><div class="st-big">${gem}</div>
        <p>${none ? 'You hold no Astralites yet. Astralite stones across Malezor give them up; they will appear here.' : 'Enter fuses one batch of the selected Astralite. Space fuses as many as you can.'}</p>
        <small class="st-note">Placeholder rate · 3 of one Astralite → 1 Gemshard</small></section></div>
      <div class="st-foot"><span>${esc(notice)}</span><em>↑↓ choose · ←→ family · Enter synthesize · Space all · F ${showAll ? 'held only' : 'show all 63'} · Esc close</em></div>`;
  }
  // Shop (store.js): one merchant screen for every store and department. Left: what this counter sells. Right: what
  // it buys back from your Zycube. Gold is shared with the RHUD; everything bought goes into the Zycube.
  const shopRows = c => c === 0 ? stockRows(ctx.store, ctx.dept) : sellable(ctx.store, ctx.dept);
  function shopHTML() {
    const S = STORES[ctx.store], D = department(ctx.store, ctx.dept), cap = storage.capacity(), used = storage.slotsUsed(LOC.ZYCUBE), free = Math.max(0, cap - used);
    const cols = [0, 1].map(c => {
      const rows = shopRows(c); focus[c] = Math.max(0, Math.min(focus[c], rows.length - 1));
      const list = rows.map((r, i) => c === 0
        ? `<div class="st-row${col === 0 && focus[0] === i ? ' focus' : ''}${gold() < r.price ? ' lock' : ''}" data-col="0" data-i="${i}"><i class="st-sw" style="background:${esc(r.def.color || '#9aa')}"></i><b>${esc(r.def.name)}</b><em>${r.price} g</em><small>${r.have ? `CARRYING ${r.have}` : 'BUY'}</small></div>`
        : `<div class="st-row${col === 1 && focus[1] === i ? ' focus' : ''}" data-col="1" data-i="${i}"><i class="st-sw" style="background:${esc(r.def.color || '#9aa')}"></i><b>${esc(r.def.name)}</b><em>×${r.qty}</em><small>SELL · +${r.price} g</small></div>`).join('');
      return `<section class="st-col${col === c ? ' on' : ''}" data-col="${c}"><header><b>${c === 0 ? 'FOR SALE' : 'SELL FROM YOUR ZYCUBE'}</b><small>${c === 0 ? esc(D.sub) : 'HALF PRICE BACK'}</small></header>
        <div class="st-list">${list || `<div class="st-empty">${c === 0 ? 'Nothing in stock' : 'Nothing this counter buys'}</div>`}</div></section>`;
    }).join('');
    const cur = shopRows(col)[focus[col]];
    return `<div class="st-head"><small>${esc(S.name.toUpperCase())} · ${esc(D.sub)}</small><b>${esc(D.title)}</b><span>Gold <b class="st-gold">${gold()}</b> · Zycube ${used} / ${cap} slots · ${free} free</span></div>
      <div class="st-cols">${cols}</div>
      ${cur ? `<p class="st-note">${esc(cur.def.blurb || '')}</p>` : ''}
      <div class="st-foot"><span class="${bad ? 'bad' : ''}">${esc(notice)}</span><em>↑↓ choose · ←→ buy / sell · Enter one · Space five · Esc leave</em></div>`;
  }
  function trade(n) {
    const r = shopRows(col)[focus[col]]; if (!r) return;
    const qty = col === 1 ? Math.min(n, r.qty) : n;
    const res = col === 0 ? buy(ctx.store, ctx.dept, r.id, qty, ctx.onWallet) : sell(ctx.store, ctx.dept, r.id, qty, ctx.onWallet);
    bad = !res.ok; notice = res.message || (res.ok ? '' : 'Not possible');
    if (res.ok) nebulaAudio.transfer(); else nebulaAudio.error();
    render();
  }
  function render() {
    const keep = root.querySelector('.st-list')?.scrollTop || 0;
    root.innerHTML = `<div class="st-panel st-${kind}${kind === 'home' ? ' nb' : ''}">${kind === 'home' ? homeHTML() : kind === 'experiment' ? expHTML() : kind === 'astralite' ? astHTML() : kind === 'shop' ? shopHTML() : fwHTML()}</div>`;
    root.querySelector('.st-row.focus')?.scrollIntoView({ block: 'nearest' });
    void keep;
  }

  function open(k, c = {}) {
    kind = k; ctx = c; col = 0; focus = [0, 0]; notice = ''; bad = false; showAll = false; tab = 0; sort = 0; qi = 0; custom = '';
    root.hidden = false; render(); onOpen();
    if (k === 'home') { nebulaAudio.startup(); nebulaAudio.ambience(true); }
    if (k === 'shop') { const s = storeState(c.store); s.visits++; s.lastDept = c.dept; }
  }
  function close() { if (!isOpen()) return; if (kind === 'home') nebulaAudio.ambience(false); root.hidden = true; kind = null; onClose(); }

  // Everything goes through storage.transfer: atomic, validated at both ends, and nothing changes on a refusal.
  function move(mode) {
    const C = columns()[col], r = flat(C.loc)[focus[col]]; if (!r) return;
    const want = r.def.unique ? 1 : mode === 'all' ? r.qty : amount(r), n = Math.min(want, r.qty);
    const res = storage.transfer(C.loc, C.to, r.id, n, { via: 'homepc' });
    bad = !res.ok;
    notice = res.ok ? `${r.def.name}${r.def.unique ? '' : ' ×' + res.qty} → ${C.toName}` : (res.message || 'Could not move it').toUpperCase();
    if (res.ok) nebulaAudio.transfer(); else { nebulaAudio.error(); toast(res.message || 'Could not move it'); }
    focus[col] = Math.max(0, Math.min(focus[col], flat(C.loc).length - 1)); render();
  }
  function craftNow() {
    const recipes = crafting.listRecipes('EXPERIMENT_TABLE'), r = recipes[focus[0]]; if (!r) return;
    const res = crafting.craft(r.id); notice = res.message; toast(res.message); render();
  }
  function synth(all) {
    const x = astList()[focus[0]]; if (!x) return;
    const res = all ? crafting.craftMax(x.r.id) : crafting.craft(x.r.id);
    notice = all ? res.message : res.ok ? `${x.r.name} → Gemshard` : res.message; if (!res.ok) toast(res.message); render();
  }
  function packNow() { const res = onPack(ctx.uid); if (res?.ok) close(); else { notice = res?.message || ''; render(); } }
  const act = (all = true) => { if (kind === 'shop') return trade(all ? 1 : 5); if (kind === 'home') move(all ? 'one' : 'all'); else if (kind === 'astralite') synth(!all); else if (kind === 'experiment') craftNow(); else if (kind === 'workstation') packNow(); };
  function jump(d) { const L = astList(); let i = focus[0], g = L[i]?.r.group; while (i + d >= 0 && i + d < L.length && L[i + d].r.group === g) i += d; i = Math.max(0, Math.min(L.length - 1, i + d)); if (d < 0) { const gg = L[i]?.r.group; while (i > 0 && L[i - 1].r.group === gg) i--; } focus[0] = i; render(); }
  const step = d => { const n = kind === 'shop' ? shopRows(col).length : kind === 'home' ? flat(columns()[col].loc).length : kind === 'experiment' ? crafting.listRecipes().length : kind === 'astralite' ? astList().length : 0; if (n) { focus[col] = (focus[col] + d + n) % n; if (kind === 'home') nebulaAudio.select(); render(); } };
  const setTab = d => { tab = (tab + d + TABS.length) % TABS.length; focus = [0, 0]; notice = ''; bad = false; nebulaAudio.select(); render(); };
  const setQty = d => { custom = ''; qi = (qi + d + PRESETS.length) % PRESETS.length; nebulaAudio.select(); render(); };
  const sideTo = c => { if (col !== c) { col = c; nebulaAudio.select(); render(); } };

  function key(code) {
    if (!isOpen()) return false;
    const dig = /^(?:Digit|Numpad)(\d)$/.exec(code);
    if (kind === 'home' && dig) { custom = (custom + dig[1]).replace(/^0+/, '').slice(0, 3); nebulaAudio.select(); render(); }
    else if (kind === 'home' && code === 'Backspace' && custom) { custom = custom.slice(0, -1); render(); }
    else if (code === 'Escape' || code === 'Backspace' || code === 'Tab') close();
    else if (code === 'ArrowUp' || code === 'KeyW') step(-1);
    else if (code === 'ArrowDown' || code === 'KeyS') step(1);
    else if ((kind === 'home' || kind === 'shop') && (code === 'ArrowLeft' || code === 'KeyA')) sideTo(0);
    else if ((kind === 'home' || kind === 'shop') && (code === 'ArrowRight' || code === 'KeyD')) sideTo(1);
    else if (kind === 'home' && code === 'KeyQ') setTab(-1);
    else if (kind === 'home' && code === 'KeyE') setTab(1);
    else if (kind === 'home' && code === 'KeyZ') setQty(-1);
    else if (kind === 'home' && code === 'KeyX') setQty(1);
    else if (kind === 'home' && code === 'KeyF') { sort = (sort + 1) % SORTS.length; focus = [0, 0]; nebulaAudio.select(); render(); }
    else if (code === 'Enter') act(true);
    else if (kind === 'astralite' && (code === 'ArrowLeft' || code === 'KeyA')) jump(-1);
    else if (kind === 'astralite' && (code === 'ArrowRight' || code === 'KeyD')) jump(1);
    else if (kind === 'astralite' && code === 'KeyF') { showAll = !showAll; focus[0] = 0; render(); }
    else if (code === 'Space') act(false);
    return true; // the screen swallows everything while open
  }
  function pad(p) {
    if (!isOpen()) return;
    if (p.edge(1) || p.edge(17)) return close();
    if (p.edge(12)) step(-1); if (p.edge(13)) step(1);
    if (kind === 'home') { if (p.edge(14)) sideTo(0); if (p.edge(15)) sideTo(1); if (p.edge(4)) setTab(-1); if (p.edge(5)) setTab(1); if (p.edge(3)) setQty(1); if (p.edge(2)) act(false); }
    if (kind === 'shop') { if (p.edge(14)) sideTo(0); if (p.edge(15)) sideTo(1); if (p.edge(2)) act(false); }
    if (kind === 'astralite') { if (p.edge(14)) jump(-1); if (p.edge(15)) jump(1); if (p.edge(2)) act(false); if (p.edge(3)) { showAll = !showAll; focus[0] = 0; render(); } }
    if (p.edge(0)) act(true);
  }
  root.addEventListener('mousedown', e => e.stopPropagation());
  root.addEventListener('click', e => {
    if (e.target.closest('[data-craft]')) return craftNow();
    if (e.target.closest('[data-pack]')) return packNow();
    if (e.target.closest('[data-close]')) return close();
    if (kind === 'home') {
      const t = e.target.closest('[data-tab]'); if (t) { tab = +t.dataset.tab; focus = [0, 0]; notice = ''; bad = false; nebulaAudio.select(); return render(); }
      const q = e.target.closest('[data-q]'); if (q) { if (q.dataset.q === 'c') { custom = custom || '1'; } else { custom = ''; qi = +q.dataset.q; } nebulaAudio.select(); return render(); }
      if (e.target.closest('[data-xfer]')) return move('one');
    }
    const row = e.target.closest('.st-row');
    if (row && kind === 'shop') { const c = +row.dataset.col, i = +row.dataset.i; if (col === c && focus[c] === i) return trade(1); col = c; focus[c] = i; return render(); } // click to choose, click again to trade
    if (!row || row.classList.contains('lock') && kind !== 'experiment' && kind !== 'home') return;
    if (kind === 'home') { col = +row.dataset.col; focus[col] = +row.dataset.i; nebulaAudio.select(); render(); } else if (kind === 'experiment') { focus[0] = +row.dataset.i; render(); } else if (kind === 'astralite') { focus[0] = +row.dataset.i; synth(false); }
  });
  root.addEventListener('wheel', e => { if (kind === 'home' && !e.target.closest('.st-list')) e.preventDefault(); }, { passive: false });
  storage.onChange(() => { if (isOpen() && (kind === 'workstation' || kind === 'home' || kind === 'shop')) render(); });
  return { open, close, key, pad, get isOpen() { return isOpen(); }, get kind() { return kind; } };
}
