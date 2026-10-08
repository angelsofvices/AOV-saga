// The Zyphone: Rizer's phone — the game's menu and hub. Opens from the
// controller touchpad (Tab on keyboard). Tabs: Map · Time · Field Notes ·
// Rizer · Armory · Controls · Options · Dev. Time skipping lives only here.
import { describeHour } from './sky.js';

const $ = s => document.querySelector(s);
const TABS = ['home', 'map', 'time', 'notes', 'rizer', 'zyrex', 'weapons', 'items', 'missions', 'contacts', 'zydex', 'astral', 'portal', 'experiment', 'camera', 'controls', 'options', 'dev'];
const HOME_KEY = 'rp7d.zyphone.home.v1';
// The head bar shows six sections; each section folds its related pages under one second-row strip.
// Every page still exists and still opens by its own id (zy.open('map'), the Home app grid, the HUD panels).
const GROUPS = [
  { id: 'home', name: 'Home', pages: ['home'] },
  { id: 'world', name: 'World', pages: ['map', 'portal', 'notes', 'time'] },        // where things are, how to get there, what's been found, when
  { id: 'rizer', name: 'Labs', pages: ['rizer', 'astral', 'zyrex'] },               // LABS: Rizer (builds · skins · animations), Astral, Zyrex
  { id: 'gear', name: 'Gear', pages: ['weapons', 'items', 'experiment'] },          // what he carries and what he makes from it
  { id: 'journal', name: 'Journal', pages: ['missions', 'contacts', 'zydex', 'camera'] }, // what to do, who he knows, what he's recorded
  { id: 'system', name: 'System', pages: ['controls', 'options', 'dev'] }
];
const ORDER = GROUPS.flatMap(g => g.pages), groupOf = key => GROUPS.findIndex(g => g.pages.includes(key));
const PAGE_NAME = { home: 'Home', map: 'Map', portal: 'Portal', notes: 'Field Notes', time: 'Time', rizer: 'Rizer', astral: 'Astral', zyrex: 'Zyrex', weapons: 'Armory', items: 'Items', experiment: 'Experiment', missions: 'Missions', contacts: 'Contacts', zydex: 'Zydex', camera: 'Camera', controls: 'Controls', options: 'Options', dev: 'Dev' };
const APPS = Object.freeze([
  ['map','✦','Map','Locations & Navigation'], ['time','☀','Time','Day / Night & Weather'], ['notes','▤','Field Notes','Discoveries & Progress'],
  ['rizer','♟','Labs','Rizer · Builds, Skins & Animations'], ['zyrex','❧','Zyrex','Partners & Bonding'], ['weapons','⚔','Armory','Weapons & Equipment'],
  ['items','◆','Items','Inventory & Materials'], ['missions','!','Missions','Main Story & Side Quests'], ['contacts','●','Contacts','People & Messages'],
  ['zydex','▱','Zydex','Creatures, Places & Lore'], ['astral','◈','Astral','Techniques & Aura'], ['portal','◉','Portal','Gatelocks & Fast Travel'],
  ['experiment','⚗','Experiment','Compounds & Research'], ['camera','▣','Camera','Photos, Scans & Evidence'], ['controls','⚙','Controls','Game & HUD Settings'], ['options','⌁','Options','Audio, Display & More']
].map(([id,icon,name,desc]) => ({ id, icon, name, desc })));
export const TIME_PRESETS = [
  { h: 7.5, name: 'Dawn' }, { h: 12, name: 'Midday' }, { h: 16.5, name: 'Afternoon' },
  { h: 18.7, name: 'Golden hour' }, { h: 20.3, name: 'Dusk' }, { h: 23.5, name: 'Night' }
];

export function createZyphone({ W, hud, characters, getState, onTime, onCharacter, onAnimLab, onSkinLab, onBuildLab, weapons, inventory, storage = null, crafting = null, onDeploy, onPackDeployed, itemCatalog = {}, onUseItem, onPartner, onWeapon, onWheel, icons = {}, menus, onAction, onOpen, onClose, labsHub = null, onLabsView }) {
  const root = $('#zyphone');
  let isOpen = false, tab = 0, focus = 0;
  let carry = null; // Armory: what's being moved — { from: 'slot', i, k } or { from: 'bag', k }
  let homeEdit = false, homeDrag = null;
  const lastIn = {}; // the page each section was last on, so coming back to a section returns there
  const tabsEl = root.querySelector('.zy-tabs'), subEl = document.createElement('nav');
  tabsEl.innerHTML = GROUPS.map(g => `<button data-group="${g.id}" role="tab">${g.name}</button>`).join('');
  subEl.className = 'zy-subtabs'; subEl.setAttribute('role', 'tablist'); tabsEl.after(subEl);
  // One frame for every page, the same as Home: a title block on top, the page's content beneath it.
  const heroEl = document.createElement('div'); heroEl.className = 'zy-home-hero zy-page-hero'; root.querySelector('.zy-body').prepend(heroEl);
  let homeOrder = APPS.map(a => a.id);
  try { const saved = JSON.parse(localStorage.getItem(HOME_KEY) || '[]'); if (Array.isArray(saved)) homeOrder = [...saved.filter(id => APPS.some(a => a.id === id)), ...homeOrder.filter(id => !saved.includes(id))]; } catch {}
  const saveHome = () => { try { localStorage.setItem(HOME_KEY, JSON.stringify(homeOrder)); } catch {} };

  const items = () => [...root.querySelectorAll(`.zy-page.on [data-item]`)];
  function paintFocus() {
    const list = items(); focus = Math.max(0, Math.min(focus, list.length - 1));
    list.forEach((el, i) => el.classList.toggle('focus', i === focus));
    list[focus]?.scrollIntoView({ block: 'nearest' });
  }
  function render() {
    const st = getState(), key = TABS[tab];
    const gi = groupOf(key), G = GROUPS[gi]; lastIn[gi] = key;
    tabsEl.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-selected', i === gi));
    subEl.hidden = G.pages.length < 2;
    heroEl.hidden = key === 'home';
    heroEl.innerHTML = `<div><small>${G.name.toUpperCase()} · ZYPHONE</small><b>${PAGE_NAME[key].toUpperCase()}</b><span>${key === 'dev' ? 'Playtest tools' : APPS.find(a => a.id === key)?.desc || ''}</span></div>`;
    subEl.innerHTML = G.pages.map(p => `<button data-page-tab="${p}" role="tab" aria-selected="${p === key}">${PAGE_NAME[p]}</button>`).join('');
    root.querySelectorAll('.zy-page').forEach(p => p.classList.toggle('on', p.dataset.page === key));
    if (key === 'home') renderHome(st);
    if (key === 'map') {
      const counts = {};
      for (const it of hud.places) { const q = hud.regionOf(it.cx, it.cz); counts[q] ||= [0, 0]; counts[q][1]++; if (hud.found.has(it.id)) counts[q][0]++; }
      $('#zy-regions').innerHTML = Object.entries(counts).map(([n, [f, t]]) => `<li><b>${n}</b><span>${f} / ${t}</span></li>`).join('');
      hud.resize();
    }
    if (key === 'time') {
      $('#zy-times').innerHTML = st.dev ? TIME_PRESETS.map(p => {
        const cur = Math.abs(((st.hour - p.h + 36) % 24) - 12) > 11.5;
        return `<button class="zy-item${cur ? ' current' : ''}" data-item data-hour="${p.h}"><span>${p.name}</span><small>${describeHour(p.h).time}${cur ? ' · NOW' : ''}</small></button>`;
      }).join('') : '<p class="zy-note">Time advances with the world clock. Preset time skips are developer-only.</p>';
    }
    if (key === 'notes') {
      $('#zy-notes-lede').textContent = `${hud.found.size} of ${hud.places.length} places found in Malezor.`;
      $('#zy-notes').innerHTML = hud.places.map(it => hud.found.has(it.id)
        ? `<div class="zy-note"><small>${hud.kindLabel(it.kind)}</small><b>${it.name}</b><p>${it.note || ''}</p></div>`
        : `<div class="zy-note locked"><small>UNDISCOVERED</small><b>? ? ?</b><p>Somewhere in ${hud.regionOf(it.cx, it.cz)}.</p></div>`).join('');
    }
    if (key === 'contacts') {
      const page = root.querySelector('.zy-page[data-page="contacts"]');
      if (page) page.innerHTML = `<h2>CONTACTS</h2>${st.contacts?.length
        ? st.contacts.map(c => `<div class="zy-note"><small>MALEZOR · HERO</small><b>${esc(c.name)}</b><p>${esc(c.note)}</p></div>`).join('')
        : '<p>People, messages and lore connections will appear here as Rizer meets Malezor\'s residents.</p>'}`;
    }
    root.classList.toggle('labs', key === 'rizer' && !!labsHub); onLabsView?.(isOpen && key === 'rizer' && !!labsHub);
    heroEl.hidden ||= key === 'rizer' && !!labsHub;
    if (key === 'rizer' && labsHub) renderLabs();
    else if (key === 'rizer') {
      $('#zy-stats').innerHTML = [
        ['Health', `${Math.ceil(st.hp)} / ${st.maxHp}`], ['Enemies defeated', `${st.defeated} / ${st.seers}`],
        ['Places found', `${hud.found.size} / ${hud.places.length}`], ['Location', st.region], ['Weapon', weapons[inventory.equipped]?.name || 'Fists']
      ].map(([k, v]) => `<div class="zy-stat"><small>${k.toUpperCase()}</small><b>${v}</b></div>`).join('');
      $('#zy-chars').innerHTML = Object.entries(characters).map(([k, c]) =>
        `<button class="zy-item${k === st.charKey ? ' current' : ''}" data-item data-char="${k}"><span>${c.name}</span><small>${c.skinOf ? 'SKIN · ' : ''}${k === st.charKey ? 'PLAYING' : 'SWITCH'}</small></button>`).join('')
        + `<button class="zy-item" data-item data-lab><span>Anim Lab</span><small>PLAY · ASSIGN CLIPS</small></button>`
        + `<button class="zy-item" data-item data-skin-lab><span>Skin Lab</span><small>COLOR · TEST · SAVE</small></button>`
        + `<button class="zy-item" data-item data-build-lab><span>Build Lab</span><small>CONSTRUCT · PREVIEW · SAVE</small></button>`;
    }
    if (key === 'zyrex') {
      const page = root.querySelector('.zy-page[data-page="zyrex"]');
      const bonded = inventory.bondedZyrex || [];
      const active = bonded.find(z => z.id === inventory.activeZyrex);
      if (page) page.innerHTML = `<h2>ZYREX</h2><p>Bonded partners and Zypheres held for the next bond trial.</p><div class="zy-system-cards"><article><small>ACTIVE PARTNER</small><b>${active ? esc(active.name) : 'No partner bonded'}</b><span>${active ? `Lv ${active.level} · ${esc(active.species)} · bond difficulty ${active.difficulty}/10` : 'Lock on to a wild Zyrex and press D-pad ↓ / T nearby, then spin the stick.'}</span></article><article><small>ZYPHERE BAG</small><b>${inventory.items?.zyphere || 0} available</b><span>One Zyphere is used for each bond attempt.</span></article></div><div class="zy-system-cards">${bonded.map(z => `<article class="zy-item" data-item data-partner="${esc(z.id)}" style="cursor:pointer"><small>${z.id === inventory.activeZyrex ? 'WALKING WITH YOU' : 'BOND RECORD · SELECT TO CALL'}</small><b>${esc(z.name)}</b><span>Lv ${z.level} · ${esc(z.species)} · difficulty ${z.difficulty}/10</span></article>`).join('')}</div>`;
    }
    if (key === 'weapons') renderArmory();
    if (key === 'items') renderItems();
    if (key === 'experiment') renderExperiment();
    if (key === 'options' || key === 'dev') { // generic setting / action rows supplied by game.js
      const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const rows = menus?.[key]?.() || [];
      $(key === 'options' ? '#zy-options' : '#zy-dev').innerHTML = rows.map(r => r.head
        ? `<small class="zy-head-row">${esc(r.head)}</small>`
        : `<button class="zy-item${r.danger ? ' danger' : ''}${r.on ? ' current' : ''}" data-item data-act="${esc(r.act)}"><span>${esc(r.label)}${r.note ? `<em>${esc(r.note)}</em>` : ''}</span><small>${esc(r.value ?? '')}</small></button>`).join('');
    }
    paintFocus();
  }

  // ── LABS › RIZER: builds, skins and animations on the player's real body (game.js · labsHub, labs.js) ──
  // Three bins on the left, Rizer himself in the open middle, the subject readout, templates and clones on the right.
  function renderLabs() {
    const page = root.querySelector('.zy-page[data-page="rizer"]'); if (!page) return;
    const v = labsHub.view(), keepName = page.querySelector('[data-labs-name]')?.value ?? '';
    const row = (attrs, label, value = '', cls = '') => `<button class="zy-item rz-row${cls}" data-item ${attrs}><span>${esc(label)}</span><small>${esc(value)}</small></button>`;
    const bin = (code, title, sub, body) => `<section class="rz-bin"><header><i>${code}</i><b>${title}</b><small>${sub}</small></header>${body}</section>`;
    page.innerHTML = `<div class="rz-labs">
      <div class="rz-col rz-left">
        ${bin('01', 'BUILD', 'BODY · FORM · HAIR', `
          ${row('data-labs="body" data-arg="1"', 'Body', `‹ ${v.bodyName} ›`, ' rz-cycle')}
          ${v.hair.can ? row('data-labs="hair" data-arg="1"', 'Hairstyle', `‹ ${v.hair.name} ›`, ' rz-cycle') : ''}
          ${row('data-build-lab', 'Open Build Lab', 'CONSTRUCT ›', ' rz-open')}`)}
        ${bin('02', 'SKINS', 'COLOUR · LOOK', `
          ${v.skins.map(k => row(`data-char="${esc(k.key)}"`, k.name, k.current ? 'WEARING' : 'WEAR', k.current ? ' current' : '')).join('')}
          <div class="rz-chips">${v.colors.map(c => `<i title="${esc(c.label)} ${c.hex}" style="--c:${c.hex}"></i>`).join('')}</div>
          ${row('data-skin-lab', 'Open Skin Lab', 'PAINT ›', ' rz-open')}
          ${row('data-labs="resetColors"', 'Reset colours', v.charName.toUpperCase())}`)}
        ${bin('03', 'ANIMATIONS', 'CLIPS · STATES', `
          <p class="rz-note">Clips play on the body you are wearing. Assign, preview and import them in the Anim Lab.</p>
          ${row('data-lab', 'Open Anim Lab', 'ASSIGN ›', ' rz-open')}`)}
      </div>
      <div class="rz-stage" aria-hidden="true"><span class="rz-tl"></span><span class="rz-tr"></span><span class="rz-bl"></span><span class="rz-br"></span>
        <div class="rz-tag"><small>SUBJECT · LIVE</small><b>${esc(v.charName)}</b><em>${esc(v.hair.can ? v.hair.name : '')}</em></div>
        <div class="rz-scan"></div></div>
      <div class="rz-col rz-right">
        ${bin('ID', 'SUBJECT', 'WHAT THE PLAYER WEARS', `
          <dl class="rz-dl"><dt>BODY</dt><dd>${esc(v.bodyName)}</dd><dt>SKIN</dt><dd>${esc(v.charName)}</dd><dt>HAIR</dt><dd>${esc(v.hair.can ? v.hair.name : '—')}</dd><dt>COLOURS</dt><dd>${v.colors.filter(c => c.custom).length} custom</dd><dt>CLONES</dt><dd>${v.clones} live</dd></dl>`)}
        ${bin('TPL', 'TEMPLATE', 'SAVE · CLONE · PLAY AS', `
          <label class="rz-name"><small>NAME</small><input data-labs-name type="text" maxlength="40" placeholder="e.g. Kelthor (blue)" value="${esc(keepName)}" spellcheck="false" autocomplete="off"></label>
          ${row('data-labs="save"', 'Save template', 'JSON ↓')}
          ${row('data-labs="clone"', 'Spawn live clone', 'IN WORLD')}
          ${row('data-labs="swap"', 'Play as clone', v.clones ? 'SWAP BODIES' : 'SPAWN ONE FIRST')}
          ${v.clones ? row('data-labs="clear"', 'Clear clones', `${v.clones} LIVE`) : ''}
          ${v.templates.length ? `<small class="rz-sub">SAVED · ${v.templates.length}</small>` + v.templates.map((t, i) => `<div class="rz-tpl"><button class="zy-item rz-row" data-item data-labs="wear" data-arg="${i}"><span>${esc(t.name)}</span><small>WEAR</small></button><button class="zy-item rz-mini" data-item data-labs="cloneT" data-arg="${i}">CLONE</button><button class="zy-item rz-mini" data-item data-labs="dl" data-arg="${i}">JSON</button><button class="zy-item rz-mini" data-item data-labs="del" data-arg="${i}">✕</button></div>`).join('') : '<p class="rz-note">Saved templates appear here. A downloaded template JSON can be dropped onto the game to wear it.</p>'}`)}
        ${row('data-labs="reset"', v.resetArmed ? 'Press again to reset' : 'Reset Rizer', 'DEFAULT LOOK', ' rz-danger')}
      </div></div>`;
  }
  function renderHome(st) {
    const grid = $('#zy-app-grid'); if (!grid) return;
    grid.classList.toggle('editing', homeEdit);
    grid.innerHTML = homeOrder.map((id, i) => {
      const a = APPS.find(v => v.id === id);
      return `<button class="zy-app${homeEdit ? ' editing' : ''}" data-item data-app="${a.id}" data-app-index="${i}" draggable="${homeEdit}"><i>${a.icon}</i><b>${a.name}</b><span>${a.desc}</span>${homeEdit ? '<em>MOVE</em>' : ''}</button>`;
    }).join('');
    $('#zy-edit-layout').textContent = homeEdit ? 'DONE' : 'EDIT APPS';
    $('#zy-edit-layout').classList.toggle('active', homeEdit);
    $('#zy-home-region').textContent = st.region || 'Malezor Central';
    $('#zy-home-coords').textContent = `X ${Number(st.x || 0).toFixed(1)} · Y ${Number(st.y || 0).toFixed(1)} · Z ${Number(st.z || 0).toFixed(1)}`;
    $('#zy-home-status').textContent = `${hud.found.size} locations discovered · ${inventory.owned.length} weapons registered`;
  }

  function swapHome(from, to) {
    if (from === to || from < 0 || to < 0 || to >= homeOrder.length) return;
    [homeOrder[from], homeOrder[to]] = [homeOrder[to], homeOrder[from]];
    saveHome(); render(); focus = to + 1; paintFocus();
  }

  // ── Armory: the weapon wheel's six slots + every weapon Rizer owns ──
  // Drag a weapon onto a slot (or a slot onto another slot to swap, or back onto the list to take it off
  // the wheel). Pad / keys: ✕ (Enter) picks up the focused weapon, ✕ on a slot puts it there, ○ (Esc) cancels,
  // □ (E) equips the focused weapon.
  const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function renderArmory() {
    const wheel = inventory.wheel, eq = inventory.equipped, name = k => weapons[k]?.name || k;
    const slots = wheel.map((k, i) => {
      const a = -Math.PI / 2 + i * Math.PI / 3, moving = carry?.from === 'slot' && carry.i === i;
      return `<button class="zy-slot${k ? ' filled' : ''}${k === eq ? ' current' : ''}${moving ? ' moving' : ''}" data-item data-slot="${i}" draggable="${!!k}" style="--x:${Math.cos(a).toFixed(3)};--y:${Math.sin(a).toFixed(3)}" title="${k ? esc(name(k)) : 'Empty slot'}"><i>${k ? icons[k] || '' : ''}</i><small>${i + 1}</small></button>`;
    }).join('');
    const held = carry ? `<b>MOVING · ${esc(name(carry.k))}</b><span>Put it on a slot · ○ / Esc to cancel</span>` : `<b>${esc(name(eq))}</b><span>EQUIPPED</span>`;
    $('#zy-wheel').innerHTML = `<div class="zy-ring">${slots}<div class="zy-ring-core${carry ? ' carrying' : ''}">${carry ? icons[carry.k] || '' : icons[eq] || ''}${held}</div></div>`;
    const owned = Object.keys(weapons).filter(k => inventory.owned.includes(k));
    $('#zy-weapons').innerHTML = owned.map(k => {
      const w = weapons[k], at = wheel.indexOf(k), moving = carry?.from === 'bag' && carry.k === k;
      const tag = w.tier ? `<i class="zy-tier">${esc(w.tier.toUpperCase())}${w.gemlord ? ' · ' + esc(w.gemlord.toUpperCase()) : ''}</i>` : '';
      return `<button class="zy-item zy-weapon${k === eq ? ' current' : ''}${moving ? ' moving' : ''}" data-item data-bag="${k}" draggable="true"><i class="zy-wicon">${icons[k] || ''}</i><span><b>${esc(w.name)}</b>${tag}<em>${esc(w.blurb)}</em></span><small>${k === eq ? 'EQUIPPED' : at >= 0 ? 'WHEEL · ' + (at + 1) : 'IN BAG'}</small></button>`;
    }).join('') + (owned.length < Object.keys(weapons).length ? `<div class="zy-item zy-weapon locked"><span><b>? ? ?</b><em>More weapons wait out in the world.</em></span><small>LOCKED</small></div>` : '');
  }
  // ── Items: everything that isn't a weapon, by kind (consumables · materials · key items) ──
  const ITEM_KINDS = [['consumable', 'CONSUMABLES'], ['material', 'MATERIALS'], ['key', 'KEY ITEMS']];
  function renderItems() {
    if (inventory.zycube) { // knocked out: the Zycube (the inventory itself) is lying where he fell
      const Z = inventory.zycube, n = Object.values(Z.items || {}).reduce((s, v) => s + v, 0);
      $('#zy-items-lede').textContent = 'ZYCUBE LOST · your inventory dropped where you were knocked out.';
      $('#zy-items').innerHTML = `<div class="zy-note"><small>ZYCUBE · OUT IN THE WORLD</small><b>Recover your Zycube</b><p>It holds ${[n && `${n} item${n === 1 ? '' : 's'}`, Z.coins && `${Z.coins} coins`, Z.gems && `${Z.gems} gems`].filter(Boolean).join(', ') || 'your inventory'}. Pulse Astralvision (AV · L3 + R3 / B) to trace it: it's marked on screen and on the minimap from any distance. Walk up to it and press ○ (E). Until then there's nowhere to carry anything new.</p></div>`;
      return;
    }
    const have = Object.entries(inventory.items || {}).filter(([k, n]) => n > 0 && itemCatalog[k]);
    const total = have.reduce((s, [, n]) => s + n, 0);
    $('#zy-items-lede').textContent = total ? `${total} item${total === 1 ? '' : 's'} carried. Find loot out in the world and press ○ (E) to pick it up.` : 'Nothing carried yet. Find loot out in the world (wild fruit in the grass, what defeated enemies drop) and press ○ (E) to pick it up.';
    $('#zy-items').innerHTML = ITEM_KINDS.map(([kind, head]) => {
      const rows = have.filter(([k]) => itemCatalog[k].kind === kind);
      return `<small class="zy-head-row">${head}</small>` + (rows.length
        ? rows.map(([k, n]) => { const d = itemCatalog[k]; return `<div class="zy-note zy-itemrow" data-item${d.boost ? ` data-use="${esc(k)}"` : ''}><small><i class="zy-swatch" style="background:${esc(d.color || '#ccc')}"></i>${esc(head.replace(/S$/, ''))} · ×${n}</small><b>${esc(d.name)}</b><p>${esc(d.blurb || '')}${d.boost ? '<em class="zy-use">✕ / Enter to eat</em>' : ''}</p></div>`; }).join('')
        : `<div class="zy-note locked"><small>NONE YET</small><p>${kind === 'key' ? 'Key items come from quests and the people of Malezor.' : kind === 'consumable' ? 'Fruit you pick up while its meter is full is kept here to eat later.' : 'Materials are gathered out in the world.'}</p></div>`);
    }).join('');
    decorateItems();
  }
  // The Zyphone only READS the Zycube (through ZyLink). It shows capacity and Field Equipment, and starts a deploy; it never moves or crafts.
  function decorateItems() {
    if (!storage) return;
    const e2 = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const used = storage.slotsUsed('ZYCUBE'), cap = storage.capacity(), T = storage.tier();
    const carried = storage.contents('ZYCUBE').equipment, out = storage.equipmentIn('DEPLOYED');
    const rows = carried.map(e => `<div class="zy-note zy-itemrow" data-item data-deploy="${e2(e.uid)}"><small><i class="zy-swatch" style="background:${e2(e.def.color)}"></i>FIELD EQUIPMENT · ○ DEPLOY</small><b>${e2(e.def.name)}</b><p>${e2(e.def.blurb)}</p></div>`)
      .concat(out.map(e => `<div class="zy-note zy-itemrow" data-item data-packdep="${e2(e.uid)}"><small>FIELD EQUIPMENT · DEPLOYED · ○ PACK UP</small><b>${e2(defName(e.type))}</b><p>Standing out in the field. Walk back to it, then pack it up here.</p></div>`));
    $('#zy-items').insertAdjacentHTML('afterbegin', `<div class="zy-capline"><b>ZYCUBE</b><i><span style="width:${Math.min(100, used / cap * 100)}%"></span></i><span>${used} / ${cap} slots · ${e2(T.name)}</span></div><small class="zy-head-row">FIELD EQUIPMENT</small>${rows.join('') || '<div class="zy-note locked"><small>NONE CARRIED</small><p>Craft Field Equipment at your Experiment Table, then carry it here.</p></div>'}`);
  }
  const defName = id => itemCatalog[id]?.name || id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  function renderExperiment() {
    const page = root.querySelector('.zy-page[data-page="experiment"]'); if (!page) return;
    const e2 = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const rs = crafting?.listRecipes('EXPERIMENT_TABLE') || [];
    page.innerHTML = `<h2>EXPERIMENT</h2><p>Items are created at your Experiment Table at home. The Zyphone shows what you know and what your Zycube holds, but it never crafts.</p><div class="zy-system-cards">${rs.map(r => `<article><small>KNOWN RECIPE · EXPERIMENT TABLE</small><b>${e2(r.name)}</b><span>${r.ingredients.map(i => `${e2(defName(i.itemId))} ×${i.quantity} (Zycube ${storage?.count('ZYCUBE', i.itemId) ?? 0})`).join(' · ')}</span></article>`).join('') || '<article><small>NO RECIPES</small><b>Nothing known yet</b></article>'}</div>`;
  }
  function setWheel(next) { inventory.wheel = next; onWheel?.(next); render(); }
  // Put `k` into slot i (swapping with whatever is there, or with the slot it came from).
  function place(k, i, fromSlot = null) {
    const w = inventory.wheel.slice(), old = w[i], was = fromSlot ?? w.indexOf(k);
    if (was === i) return render();
    if (was >= 0) { w[was] = old ?? null; w[i] = k; }            // on the wheel already: the two swap places
    else {                                                       // from the list: it takes the slot, the old one goes to the bag
      if (old === 'fists') { const e = w.indexOf(null); if (e < 0) return render(); w[e] = 'fists'; } // fists never leave the wheel
      w[i] = k;
    }
    setWheel(w);
  }
  function takeOff(i) {
    const w = inventory.wheel.slice(); if (w[i] === 'fists') return render(); w[i] = null; setWheel(w);
  }
  function armoryPick(el) {
    if (el.dataset.slot != null) {
      const i = +el.dataset.slot, k = inventory.wheel[i];
      if (!carry) { if (k) { carry = { from: 'slot', i, k }; render(); } return; }
      const c = carry; carry = null; place(c.k, i, c.from === 'slot' ? c.i : null); return;
    }
    const k = el.dataset.bag;
    if (carry?.from === 'slot') { const c = carry; carry = null; takeOff(c.i); return; } // a wheel weapon dropped on the list comes off the wheel
    carry = carry?.k === k ? null : { from: 'bag', k }; render();
  }
  function equipFocused() {
    const el = items()[focus]; if (!el) return;
    const k = el.dataset.bag || (el.dataset.slot != null ? inventory.wheel[+el.dataset.slot] : null);
    if (k) { onWeapon?.(k); render(); }
  }
  // mouse drag and drop
  let drag = null;
  root.addEventListener('dragstart', e => {
    const el = e.target.closest('[data-slot],[data-bag]'); if (!el) return;
    drag = el.dataset.slot != null ? { from: 'slot', i: +el.dataset.slot, k: inventory.wheel[+el.dataset.slot] } : { from: 'bag', k: el.dataset.bag };
    if (!drag.k) { drag = null; e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', drag.k); el.classList.add('dragging');
  });
  root.addEventListener('dragend', e => { e.target.closest?.('[draggable]')?.classList.remove('dragging'); root.querySelectorAll('.drop').forEach(x => x.classList.remove('drop')); drag = null; homeDrag = null; });
  root.addEventListener('dragover', e => { if (!drag) return; const t = e.target.closest('[data-slot], #zy-weapons'); if (!t) return; e.preventDefault(); root.querySelectorAll('.drop').forEach(x => x.classList.remove('drop')); t.classList.add('drop'); });
  root.addEventListener('drop', e => {
    if (!drag) return; e.preventDefault(); const d = drag; drag = null; carry = null;
    const slot = e.target.closest('[data-slot]');
    if (slot) place(d.k, +slot.dataset.slot, d.from === 'slot' ? d.i : null);
    else if (e.target.closest('#zy-weapons') && d.from === 'slot') takeOff(d.i);
    else render();
  });
  root.addEventListener('dragstart', e => {
    const app = e.target.closest('[data-app]'); if (!app || !homeEdit) return;
    homeDrag = +app.dataset.appIndex; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', app.dataset.app); app.classList.add('dragging');
  });
  root.addEventListener('dragover', e => { const app = e.target.closest('[data-app]'); if (app && homeDrag != null) { e.preventDefault(); app.classList.add('drop'); } });
  root.addEventListener('dragleave', e => e.target.closest('[data-app]')?.classList.remove('drop'));
  root.addEventListener('drop', e => {
    const app = e.target.closest('[data-app]'); if (!app || homeDrag == null) return;
    e.preventDefault(); const from = homeDrag; homeDrag = null; swapHome(from, +app.dataset.appIndex);
  });
  function status() {
    const st = getState(), f = st.hp / st.maxHp;
    $('#zy-clock').textContent = describeHour(st.hour).time;
    $('#zy-hp').textContent = Math.ceil(st.hp); $('#zy-hp-fill').style.width = `${f * 100}%`;
    $('#zy-hp-fill').parentElement.classList.toggle('low', f < 0.3);
  }
  function setTab(i) { tab = (i + TABS.length) % TABS.length; focus = 0; carry = null; homeEdit = false; render(); }
  const setPage = key => setTab(TABS.indexOf(key));
  const stepPage = d => setPage(ORDER[(ORDER.indexOf(TABS[tab]) + d + ORDER.length) % ORDER.length]); // next page, running on into the next section
  const stepInGroup = d => { const P = GROUPS[groupOf(TABS[tab])].pages; if (P.length > 1) setPage(P[(P.indexOf(TABS[tab]) + d + P.length) % P.length]); }; // stays inside the section, wrapping round
  const stepGroup = d => { const g = (groupOf(TABS[tab]) + d + GROUPS.length) % GROUPS.length; setPage(lastIn[g] || GROUPS[g].pages[0]); };
  function activate(el = items()[focus]) {
    if (!el) return;
    if (el.id === 'zy-edit-layout') { homeEdit = !homeEdit; render(); return; }
    if (el.dataset.app) { if (!homeEdit) setTab(TABS.indexOf(el.dataset.app)); return; }
    if (el.dataset.hour) { onTime(+el.dataset.hour); setTimeout(render, 50); }
    if (el.dataset.char) Promise.resolve(onCharacter(el.dataset.char)).then(render);
    if (el.dataset.partner) { onPartner?.(el.dataset.partner); render(); return; } // call that bonded Zyrex to walk with him
    if (el.dataset.labs) { const keep = focus, name = root.querySelector('[data-labs-name]')?.value || ''; Promise.resolve(labsHub?.act(el.dataset.labs, el.dataset.arg, name)).then(() => { if (isOpen && TABS[tab] === 'rizer') { render(); focus = keep; paintFocus(); } }); return; }
    if ('lab' in el.dataset) onAnimLab?.();
    if ('skinLab' in el.dataset) onSkinLab?.();
    if ('buildLab' in el.dataset) onBuildLab?.();
    if (el.dataset.packdep) { onPackDeployed?.(el.dataset.packdep); return; }
    if (el.dataset.deploy) { onDeploy?.(el.dataset.deploy); return; }
    if (el.dataset.use) { const keep = focus; onUseItem?.(el.dataset.use); render(); focus = keep; paintFocus(); return; }
    if (el.dataset.slot != null || el.dataset.bag) { armoryPick(el); return; }
    if (el.dataset.act) { const keep = focus; onAction?.(el.dataset.act); if (isOpen) { render(); focus = keep; paintFocus(); } }
  }
  function open(which) {
    if (isOpen) { if (which) setTab(TABS.indexOf(which)); return; }
    isOpen = true; root.hidden = false; if (which) tab = TABS.indexOf(which); focus = 0; render(); status(); onOpen?.();
  }
  function close() { if (!isOpen) return; isOpen = false; carry = null; root.hidden = true; root.classList.remove('labs'); onLabsView?.(false); onClose?.(); }

  tabsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const g = GROUPS.findIndex(x => x.id === b.dataset.group); setPage(lastIn[g] || GROUPS[g].pages[0]); });
  subEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setPage(b.dataset.pageTab); });
  root.addEventListener('click', e => { const el = e.target.closest('[data-item]'); if (el) { focus = items().indexOf(el); paintFocus(); activate(el); } });
  root.addEventListener('mousedown', e => e.stopPropagation());

  // Keyboard while open. Returns true when the key was used.
  function key(code) {
    if (!isOpen) return false;
    const typing = document.activeElement?.matches?.('[data-labs-name]');
    if (typing) { if (code === 'Escape' || code === 'Enter') document.activeElement.blur(); if (code === 'Enter') { focus = items().findIndex(el => el.dataset.labs === 'save'); paintFocus(); } return true; }
    if (carry && (code === 'Escape' || code === 'Backspace')) { carry = null; render(); }
    else if (TABS[tab] === 'home' && homeEdit && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(code)) {
      const cols = 5, delta = code === 'ArrowLeft' ? -1 : code === 'ArrowRight' ? 1 : code === 'ArrowUp' ? -cols : cols;
      const from = +(items()[focus]?.dataset.appIndex ?? 0); swapHome(from, Math.max(0, Math.min(homeOrder.length - 1, from + delta)));
    }
    else if (code === 'Tab' || code === 'Escape' || code === 'Backspace') close();
    else if (TABS[tab] === 'weapons' && code === 'KeyE') equipFocused();
    else if (code === 'KeyQ' || code === 'PageUp') stepGroup(-1);
    else if (code === 'KeyR' || code === 'PageDown') stepGroup(1);
    else if (code === 'ArrowLeft' || code === 'KeyA') stepInGroup(-1);
    else if (code === 'ArrowRight' || code === 'KeyD') stepInGroup(1);
    else if (code === 'ArrowUp' || code === 'KeyW') { focus--; paintFocus(); }
    else if (code === 'ArrowDown' || code === 'KeyS') { focus++; paintFocus(); }
    else if (code === 'Enter' || code === 'Space') activate();
    else return false;
    return true;
  }
  // Controller while open: L1/R1 or d-pad ←/→ tabs, d-pad ↑/↓ choose, ✕ select, ○/touchpad close.
  function pad(p) {
    if (!isOpen) return;
    if (carry && p.edge(1)) { carry = null; render(); return; } // ○ drops what you're moving back where it was
    if (p.edge(1) || p.edge(17)) return close();
    if (TABS[tab] === 'weapons' && p.edge(2)) equipFocused(); // □ equips
    if (TABS[tab] === 'home' && homeEdit && (p.edge(12) || p.edge(13) || p.edge(14) || p.edge(15))) {
      const delta = p.edge(14) ? -1 : p.edge(15) ? 1 : p.edge(12) ? -5 : 5;
      const from = +(items()[focus]?.dataset.appIndex ?? 0); swapHome(from, Math.max(0, Math.min(homeOrder.length - 1, from + delta))); return;
    }
    if (p.edge(4)) stepGroup(-1); else if (p.edge(6) || p.edge(14)) stepInGroup(-1); // L1 / R1 sections · L2 / R2 (LT / RT) or d-pad ← → pages within the section
    if (p.edge(5)) stepGroup(1); else if (p.edge(7) || p.edge(15)) stepInGroup(1);
    if (p.edge(12)) { focus--; paintFocus(); }
    if (p.edge(13)) { focus++; paintFocus(); }
    if (p.edge(0)) activate();
  }
  return { open, close, toggle: w => (isOpen ? close() : open(w)), key, pad, status, get isOpen() { return isOpen; }, get tab() { return TABS[tab]; } };
}
