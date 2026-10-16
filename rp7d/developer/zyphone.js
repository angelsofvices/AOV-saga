// The Zyphone: Rizer's phone — the game's menu and hub. Opens from the
// controller touchpad (Z on keyboard). Tabs: Map · Time · Field Notes ·
// Rizer · Armory · Controls · Options · Dev. Time skipping lives only here.
import { describeHour } from './sky.js';
import { focus as focusMoves, FOCUS_MOVES, DIRS, DIR_NAME, DIR_KEY } from './focus-moves.js';
import { SLOTS } from './anim-lib.js';

const $ = s => document.querySelector(s);
import { createPortalChipsUI } from './portal-chips-ui.js';
import { engineering, selectWeaponInstance } from './engineering.js';
const TABS = ['home', 'map', 'time', 'notes', 'rizer', 'skilltree', 'zyrex', 'weapons', 'utilities', 'items', 'missions', 'contacts', 'zydex', 'astral', 'portal', 'experiment', 'camera', 'controls', 'options', 'dev'];
const HOME_KEY = 'rp7d.zyphone.home.v1';
const SKIN_LIBRARY_KEY = 'rp7d.skinLibrary.v1';
const COMBO_LOADOUT_KEY = 'rp7d.skillTree.combos.v1';
const COMBO_CHAINS = { punch: 4, kick: 5, sword: 4, axe: 4 };
const COMBO_MOVES = { punch:['punch','punch2','punch3','punch4'], kick:['kick','kick2','kick3','kick4','kick5'], sword:['sword','sword2','sword3','sword4'], axe:['axe','axe2','axe3','axe4'] };
const COMBO_LABEL = Object.fromEntries(Object.entries(COMBO_MOVES).flatMap(([kind, moves]) => moves.map(k => [k, `${kind[0].toUpperCase() + kind.slice(1)} · ${+(k.match(/\d+$/)?.[0] || 1)}`])));
function readComboLoadout() { try { return JSON.parse(localStorage.getItem(COMBO_LOADOUT_KEY) || '{}'); } catch { return {}; } }
// The head bar shows six sections; each section folds its related pages under one second-row strip.
// Every page still exists and still opens by its own id (zy.open('map'), the Home app grid, the HUD panels).
const GROUPS = [
  { id: 'home', name: 'Home', pages: ['home'] },
  { id: 'world', name: 'World', pages: ['map', 'portal', 'notes', 'time'] },        // where things are, how to get there, what's been found, when
  { id: 'rizer', name: 'Labs', pages: ['rizer', 'skilltree', 'astral', 'zyrex'] }, // Rizer, Skill Tree, Focus and Zyrex
  { id: 'gear', name: 'Gear', pages: ['weapons', 'utilities', 'items', 'experiment'] },          // what he carries and what he makes from it
  { id: 'journal', name: 'Journal', pages: ['missions', 'contacts', 'zydex', 'camera'] }, // what to do, who he knows, what he's recorded
  { id: 'system', name: 'System', pages: ['controls', 'options', 'dev'] }
];
const ORDER = GROUPS.flatMap(g => g.pages), groupOf = key => GROUPS.findIndex(g => g.pages.includes(key));
const PAGE_NAME = { home: 'Home', map: 'Map', portal: 'Portal', notes: 'Field Notes', time: 'Time', rizer: 'Rizer', skilltree: 'Skill Tree', astral: 'Focus', zyrex: 'Zyrex', weapons: 'Weapons', utilities: 'Utilities', items: 'Items', experiment: 'Experiment', missions: 'Missions', contacts: 'Contacts', zydex: 'Zydex', camera: 'Camera', controls: 'Controls', options: 'Options', dev: 'Dev' };
const APPS = Object.freeze([
  ['map','✦','Map','Locations & Navigation'], ['time','☀','Time','Day / Night & Weather'], ['notes','▤','Field Notes','Discoveries & Progress'],
  ['rizer','♟','Labs','Rizer · Builds, Skins & Animations'], ['zyrex','❧','Zyrex','Partners & Bonding'], ['weapons','⚔','Weapons','Weapon loadout'], ['utilities','◆','Utilities','Utility loadout'],
  ['items','◆','Items','Inventory & Materials'], ['missions','!','Missions','Main Story & Side Quests'], ['contacts','●','Contacts','People & Messages'],
  ['zydex','▱','Zydex','Creatures, Places & Lore'], ['astral','✧','Focus','Attributes & Focus Moves'], ['portal','◉','Portal','Gatelocks & Fast Travel'],
  ['experiment','⚗','Experiment','Compounds & Research'], ['camera','▣','Camera','Photos, Scans & Evidence'], ['controls','⚙','Controls','Game & HUD Settings'], ['options','⌁','Options','Audio, Display & More']
].map(([id,icon,name,desc]) => ({ id, icon, name, desc })));
export const TIME_PRESETS = [
  { h: 7.5, name: 'Dawn' }, { h: 12, name: 'Midday' }, { h: 16.5, name: 'Afternoon' },
  { h: 18.7, name: 'Golden hour' }, { h: 20.3, name: 'Dusk' }, { h: 23.5, name: 'Night' }
];

// Kept beside the live controls page so each action has one reference in the UI.
// The active context is supplied by game.js; the player can still browse any mode.
const CONTROL_GUIDE = {
  field: { name:'On foot', rows:[
    ['Move','W A S D / arrows','Left stick'],['Look','Mouse drag / captured mouse','Right stick'],['Walk / run','WASD / Shift','Left stick / R2'],
    ['Jump / double jump','Space / Space again','✕ / ✕ again'],['Crouch / stealth','X','L3'],['Interact / pick up','E','○'],['Lock / release target','R / middle click','R3'],['Open Zyphone','Z','Touchpad']
  ]},
  combat: { name:'Combat & Astral', rows:[
    ['Punch combo','J / left click','□'],['Kick combo','K / right click','△'],['Astral Blast','F','○'],['AstralSlam','Airborne + locked target + J / left click','Airborne + locked target + □'],['Dodge roll / slide','C tap / hold','L2 tap / hold'],['Block','Shift + C hold','L2 + R2 hold'],['Switch WHUD type','Q / wheel page','L1 + R1'],['Pray','L1 + R1 + L2 + R2 hold','L1 + R1 + L2 + R2 hold'],['Astralvision','B','L3 + R3 (also during fast flight)'],['Focus move','Direction keys shown in Focus setup','Lock + assigned D-pad direction'],['Swap locked target','V','Right-stick flick']
  ]},
  traversal: { name:'Parkour & flight', rows:[
    ['Jump / double jump','Space / Space again','✕ / ✕ again'],['Fly','Double jump, hold Space','Double jump, hold ✕'],['Rise / descend','Space / X','✕ / L3'],['Grab a ledge','Jump toward its edge','✕ toward its edge'],['Climb while hanging','Space','✕'],['Drop while hanging','X or C','L3 or L2'],['Crouch / walk to an edge','X / WASD','L3 / left stick'],['Vault a low obstacle','Run + Space','Run + ✕']
  ]},
  bus: { name:'West Lake Bus', rows:[
    ['Steer','A / D','Left stick'],['Accelerate','W','R2'],['Brake / reverse','S','L2'],['Handbrake','Q','R1'],['Boost','Space','✕'],['Look behind','V','R3'],['Headlights','L','D-pad ↑'],['Horn','H','L3'],['Fold / unfold stop sign','F','○'],['Exit bus','E','△'],['Radio station','R / T · B hold','D-pad ← / → · L1 hold']
  ]},
  board: { name:'Astralboard', rows:[
    ['Steer / look','W A S D / mouse','Left / right stick'],['Push / boost','Shift hold','R2 hold'],['Rise / descend','Space / X','✕ / L3'],['Dismount on ground','E','△'],['Stow board','O','○']
  ]},
  ufo: { name:'Aetherstride', rows:[
    ['Steer','W A S D / arrows','Left stick'],['Accelerate','Shift','R2'],['Rise / descend','Space / C','✕ / L3'],['Turbo / locked laser','F','○'],['Exit craft','E','△']
  ]},
  interior: { name:'Interiors & menus', rows:[
    ['Move / look','W A S D / mouse','Left / right stick'],['Interact / doors','E / Space at door','○ / ✕ at door'],['Move furniture','R to lock · J to pick · E cancel','R3 · □ · ○'],['Zyphone','Z','Touchpad'],['Navigate menus','Arrows / Enter / Esc','D-pad / ✕ / ○']
  ]}
};

export function createZyphone({ W, hud, characters, getState, onTime, onCharacter, onAnimLab, onSkinLab, onBuildLab, weapons, inventory, storage = null, crafting = null, onDeploy, onPackDeployed, itemCatalog = {}, onUseItem, onPartner, onWeapon, onWheel, onUtilityWheel, icons = {}, menus, onAction, onOpen, onClose, labsHub = null, astralHub = null, onLabsView }) {
  const root = $('#zyphone');
  let isOpen = false, tab = 0, focus = 0;
  let fpick = null, axMode = 'attr'; // Focus: the move being placed on a D-pad direction · which side of the page (attributes | moves)
  let carry = null; // Armory: what's being moved — { from: 'slot', i, k } or { from: 'bag', k }
  let homeEdit = false, homeDrag = null, journalOpen = false, mapPoiDetailOpen = false;
  let skillCategory = 'combat', skillSelected = 'punch';
  let skinLibrary = [];
  try { const saved = JSON.parse(localStorage.getItem(SKIN_LIBRARY_KEY) || '[]'); if (Array.isArray(saved)) skinLibrary = saved.filter(s => s && typeof s.id === 'string' && typeof s.name === 'string' && s.data?.colors); } catch {}
  const saveSkinLibrary = () => { try { localStorage.setItem(SKIN_LIBRARY_KEY, JSON.stringify(skinLibrary)); } catch {} };
  const skinToast = message => { const el = $('#toast'); if (el) { el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1800); } };
  let controlContext = null;
  const lastIn = {}; // the page each section was last on, so coming back to a section returns there
  const tabsEl = root.querySelector('.zy-tabs'), subEl = document.createElement('nav');
  tabsEl.innerHTML = GROUPS.map(g => `<button data-group="${g.id}" role="tab">${g.name}</button>`).join('');
  subEl.className = 'zy-subtabs'; subEl.setAttribute('role', 'tablist'); tabsEl.after(subEl);
  // One frame for every page, the same as Home: a title block on top, the page's content beneath it.
  const heroEl = document.createElement('div'); heroEl.className = 'zy-home-hero zy-page-hero'; root.querySelector('.zy-body').prepend(heroEl);
  let homeOrder = APPS.map(a => a.id), portalChips = null;
  $('#zy-weapons').addEventListener('click', ev => {
    const el = ev.target.closest('[data-plasma-instance]'); if (!el) return;
    ev.stopPropagation(); const res = selectWeaponInstance(el.dataset.plasmaInstance);
    if (res.ok && inventory.wheel?.includes('plasmabeam')) onWeapon?.('plasmabeam'); render();
  });
  try { const saved = JSON.parse(localStorage.getItem(HOME_KEY) || '[]'); if (Array.isArray(saved)) homeOrder = [...saved.filter(id => APPS.some(a => a.id === id)), ...homeOrder.filter(id => !saved.includes(id))]; } catch {}
  const saveHome = () => { try { localStorage.setItem(HOME_KEY, JSON.stringify(homeOrder)); } catch {} };

  const items = () => [...root.querySelectorAll(`.zy-page.on [data-item]`)];
  function paintFocus() {
    const list = items(); focus = Math.max(0, Math.min(focus, list.length - 1));
    list.forEach((el, i) => el.classList.toggle('focus', i === focus));
    list[focus]?.scrollIntoView({ block: 'nearest' });
  }
  function moveSpatial(dx, dy) {
    const list = items(); if (!list.length) return;
    focus = Math.max(0, Math.min(focus, list.length - 1));
    const current = list[focus], a = current?.getBoundingClientRect();
    if (!a || !a.width || !a.height) { focus = (focus + (dy > 0 || dx > 0 ? 1 : -1) + list.length) % list.length; paintFocus(); return; }
    const ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = -1, bestScore = Infinity;
    for (let i = 0; i < list.length; i++) {
      if (i === focus) continue;
      const r = list[i].getBoundingClientRect(); if (!r.width || !r.height) continue;
      const vx = r.left + r.width / 2 - ax, vy = r.top + r.height / 2 - ay;
      const primary = dx ? vx * dx : vy * dy, cross = dx ? Math.abs(vy) : Math.abs(vx);
      if (primary <= 1) continue;
      const score = primary + cross * 1.65;
      if (score < bestScore) { best = i; bestScore = score; }
    }
    if (best < 0) {
      let edge = -Infinity;
      for (let i = 0; i < list.length; i++) {
        const r = list[i].getBoundingClientRect(); if (!r.width || !r.height) continue;
        const pos = dx ? (r.left + r.width / 2) * dx : (r.top + r.height / 2) * dy;
        const cross = dx ? Math.abs(r.top + r.height / 2 - ay) : Math.abs(r.left + r.width / 2 - ax);
        const score = pos - cross * 1.65;
        if (score > edge) { edge = score; best = i; }
      }
    }
    if (best >= 0) focus = best;
    paintFocus();
  }
  function render() {
    const st = getState(), key = TABS[tab];
    const gi = groupOf(key), G = GROUPS[gi]; lastIn[gi] = key;
    root.classList.toggle('map-focus-mode', key === 'map' && hud.mapFocusMode);
    const padHint = $('#zy-controller-hint'); if (padHint) padHint.textContent = key === 'map' && hud.mapFocusMode ? 'LEFT STICK BROWSE · R2/L2 ZOOM · ✕ DETAILS · □ TELEPORT · △ PING · ○ EXIT FOCUS' : 'L1/R1 SECTIONS · L2/R2 APPS · D-PAD NAVIGATE · ✕ SELECT · ○ OR TOUCHPAD CLOSE';
    tabsEl.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-selected', i === gi));
    subEl.hidden = G.pages.length < 2;
    heroEl.hidden = key === 'home';
    heroEl.innerHTML = `<div><small>${G.name.toUpperCase()} · ZYPHONE</small><b>${PAGE_NAME[key].toUpperCase()}</b><span>${key === 'dev' ? 'Playtest tools' : APPS.find(a => a.id === key)?.desc || ''}</span></div>`;
    subEl.innerHTML = G.pages.map(p => `<button data-page-tab="${p}" role="tab" aria-selected="${p === key}">${PAGE_NAME[p]}</button>`).join('');
    root.querySelectorAll('.zy-page').forEach(p => p.classList.toggle('on', p.dataset.page === key));
    if (key === 'home') renderHome(st);
    if (key === 'map') {
      renderMapBrowser();
      hud.resize();
    }
    if (key === 'skilltree') renderSkillTree();
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
    if (key === 'missions') {
      const page = root.querySelector('.zy-page[data-page="missions"]'), J = st.journal || {};
      let cards;
      if (!J.started) cards = '<article><small>NO ACTIVE MISSION</small><b>Playtest Journal</b><span>Your first Zyphone reminder will arrive during gameplay. It will point you to Rizer’s journal near the Malezor Square fountain.</span></article>';
      else if (!J.found) cards = '<article><small>ACTIVE · MAIN MISSION</small><b>INTO MALEZOR SQUARE</b><span>Go to the fountain and pick up your journal.</span></article>';
      else if (journalOpen) {
        const T = J.tutorial || {}, basics = T.basics || {}, basicRows = [['jump','Jump'],['doubleJump','Double jump'],['sprint','Sprint'],['punch','Punch'],['kick','Kick'],['astralstrike','Astralstrike · ○'],['treeDodge','Sprint-dodge a tree'],['farmGateVault','Run + X hurdle-roll over a waist-high obstacle'],['treeSpin','Spin around a tree while sprinting']];
        const moves = Object.entries(FOCUS_MOVES).map(([id, m]) => `<li class="${(T.focusUsed || []).includes(id) ? 'done' : ''}">${(T.focusUsed || []).includes(id) ? '✓' : '·'} ${esc(m.name)} · ${(T.focusUsed || []).includes(id) ? 'used' : 'learn and use'}</li>`).join('');
        const weaponIds = ['rubypaw','sword','bow','axe'], foundWeapons = weaponIds.filter(id => (T.weaponsFound || []).includes(id)).length, usedWeapons = weaponIds.filter(id => (T.weaponsUsed || []).includes(id)).length;
        const weaponRows = [['rubypaw','Rubypaw Longsword of Rakoron'],['sword','Sapphire Tearsword of Azurel'],['bow','Pearlbow of Ivirium'],['axe','Jaded Axe of Emeralix']].map(([id,name]) => `<li class="${(T.weaponsUsed || []).includes(id) ? 'done' : ''}">${(T.weaponsUsed || []).includes(id) ? '✓' : '·'} ${esc(name)} · ${(T.weaponsUsed || []).includes(id) ? 'used' : 'find and try'}</li>`).join('');
        cards = '<article class="current"><small>COMPLETE · MAIN MISSION</small><b>INTO MALEZOR SQUARE</b><span>You found your journal at the fountain.</span></article><button class="zy-item" data-item data-journal-back>← Back to Missions</button><article><small>PLAYTEST JOURNAL · TUTORIAL</small><b>Movement and combat</b><span>Complete an action to check it off. Punch and kick are checked when they connect.</span><ul class="journal-checklist">' + basicRows.map(([id,label]) => `<li class="${basics[id] ? 'done' : ''}">${basics[id] ? '✓' : '·'} ${label}</li>`).join('') + '</ul></article><article><small>FOCUS TRAINING · ' + (T.focusCollected || []).length + '/6 LEARNED · ' + (T.focusUsed || []).length + '/6 USED</small><b>Silver chests</b><span>Open the Zyphone Map, select a silver chest icon, then press △ to ping it. Follow the meter distance.</span><ul class="journal-checklist">' + moves + '</ul></article><article><small>GEMLORD ARMORY · ' + foundWeapons + '/4 FOUND · ' + usedWeapons + '/4 USED</small><b>Mythic chests</b><span>Find and try the four Gemlord weapons near their caves. Map pings work the same way.</span><ul class="journal-checklist">' + weaponRows + '</ul></article>';
      }
      else cards = '<article><small>COMPLETE · MAIN MISSION</small><b>INTO MALEZOR SQUARE</b><span>You found your journal at the fountain.</span></article><button class="zy-item" data-item data-journal-open><span>Rizer’s Journal</span><small>OPEN PLAYTEST TASKS ›</small></button>';
      if (page) page.innerHTML = `<h2>MISSIONS</h2><p>Playtest objectives and tutorial tasks for the current build.</p><div class="zy-system-cards">${cards}</div>`;
    }
    const labsPage = (key === 'rizer' && !!labsHub) || (key === 'astral' && !!astralHub); // LABS pages: Rizer in the open middle
    root.classList.toggle('labs', labsPage); root.classList.toggle('labs-astral', key === 'astral' && labsPage); onLabsView?.(isOpen && labsPage ? key : null);
    heroEl.hidden ||= labsPage;
    if (key === 'astral' && astralHub) renderAstral();
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
    if (key === 'utilities') renderUtilities();
    if (key === 'items') renderItems();
    if (key === 'portal') { portalChips ||= createPortalChipsUI(root.querySelector('[data-page="portal"]')); portalChips.render(); }
    if (key === 'experiment') renderExperiment();
    if (key === 'controls') renderControls(st);
    if (key === 'options' || key === 'dev') { // generic setting / action rows supplied by game.js
      const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const rows = menus?.[key]?.() || [];
      $(key === 'options' ? '#zy-options' : '#zy-dev').innerHTML = rows.map(r => r.head
        ? `<small class="zy-head-row">${esc(r.head)}</small>`
        : `<button class="zy-item${r.danger ? ' danger' : ''}${r.on ? ' current' : ''}" data-item data-act="${esc(r.act)}"><span>${esc(r.label)}${r.note ? `<em>${esc(r.note)}</em>` : ''}</span><small>${esc(r.value ?? '')}</small></button>`).join('');
    }
    paintFocus();
  }

  function renderControls(st) {
    const page = root.querySelector('.zy-page[data-page="controls"]'); if (!page) return;
    const contexts = Object.keys(CONTROL_GUIDE), active = contexts.includes(st.controlContext) ? st.controlContext : 'field';
    if (!contexts.includes(controlContext)) controlContext = active;
    const guide = CONTROL_GUIDE[controlContext];
    const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    page.innerHTML = `<div class="zy-controls-guide"><p class="zy-lede">Showing <b>${esc(guide.name)}</b> controls · current input: <b>${st.controlInput === 'controller' ? 'Controller' : 'Keyboard & mouse'}</b>. Choose another mode to browse its controls.</p>
      <div class="zy-control-modes">${contexts.map(id => `<button class="zy-item${id === controlContext ? ' current' : ''}" data-item data-control-context="${id}">${esc(CONTROL_GUIDE[id].name)}${id === active ? ' · CURRENT' : ''}</button>`).join('')}</div>
      <div class="zy-scroll"><table class="zy-table"><thead><tr><th>Action</th><th>Keyboard &amp; mouse</th><th>Controller</th></tr></thead><tbody>${guide.rows.map(([action,k,p]) => `<tr><td>${esc(action)}</td><td>${esc(k)}</td><td>${esc(p)}</td></tr>`).join('')}</tbody></table></div></div>`;
  }

  // ── LABS › RIZER: builds, skins and animations on the player's real body (game.js · labsHub, labs.js) ──
  // Three bins on the left, Rizer himself in the open middle, the subject readout, templates and clones on the right.
  function renderLabs() {
    const page = root.querySelector('.zy-page[data-page="rizer"]'); if (!page) return;
    const v = labsHub.view(), keepName = page.querySelector('[data-labs-name]')?.value ?? '';
    const scroll = [...page.querySelectorAll('.rz-col')].map(c => c.scrollTop);
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
          <div class="rz-skin-library" data-skin-library-drop>
            <small class="rz-sub">SAVED SKINS · DROP SKIN LAB JSON HERE</small>
            ${skinLibrary.length ? skinLibrary.map(s => `<button class="zy-item rz-skin-card${s.data.character === 'rizer' ? ' rz-skin-default' : ''}" data-item data-skin-saved="${esc(s.id)}" draggable="true" title="Drag outside this cell to remove"><span>${esc(s.name)}<em>${esc(s.data.character || 'Rizer')} · ${Object.keys(s.data.colors || {}).length} colours</em></span><small>WEAR · DRAG OUT TO REMOVE</small></button>`).join('') : '<p class="rz-note">Drop an exported Skin Lab JSON file here to save it in this library.</p>'}
          </div>
          <div class="rz-chips">${v.colors.map(c => `<i title="${esc(c.label)} ${c.hex}" style="--c:${c.hex}"></i>`).join('')}</div>
          ${row('data-skin-lab', 'Open Skin Lab', 'PAINT ›', ' rz-open')}
          ${row('data-labs="resetColors"', 'Reset colours', v.charName.toUpperCase())}`)}
        ${bin('03', 'ANIMATIONS', 'CLIPS · STATES', `
          <p class="rz-note">Clips play on the body you are wearing. Assign, preview and import them in the Anim Lab.</p>
          ${row('data-labs="prayerStyle"', 'Prayer style', `‹ ${v.prayerStyle.toUpperCase()}${v.prayerStyle === 'meditating' && !v.meditationReady ? ' · CLIPS NEEDED' : ''} ›`, ' rz-cycle')}
          ${v.prayerStyle === 'meditating' && !v.meditationReady ? '<p class="rz-note">Assign Meditation · settle, hold and stand clips in Anim Lab to complete this style.</p>' : ''}
          ${row('data-lab', 'Open Anim Lab', 'ASSIGN ›', ' rz-open')}`)}
      </div>
      <div class="rz-stage" aria-hidden="true"><span class="rz-tl"></span><span class="rz-tr"></span><span class="rz-bl"></span><span class="rz-br"></span>
        <div class="rz-tag"><small>SUBJECT · LIVE</small><b>${esc(v.charName)}</b><em>${esc(v.hair.can ? v.hair.name : '')}</em></div>
        <div class="rz-scan"></div></div>
      <div class="rz-col rz-right">
        <button class="zy-item rz-bin rz-skill-entry" data-item data-skill-tree aria-label="Open Rizer Skill Tree">
          <header><i>✦</i><b>SKILL TREE</b><small>RIZER · MOVES & ANIMATIONS</small></header>
          <strong>GO TO SKILL TREE <span>›</span></strong>
          <p>Build Rizer’s combat combos, astral attacks, traversal, flight and special moves.</p>
          <small class="rz-skill-entry-meta">${RIZER_SKILL_SLOTS.length} ANIMATION SLOTS · OPEN MODULE ›</small>
        </button>
        ${bin('TPL', 'TEMPLATE', 'SAVE · CLONE · PLAY AS', `
          <label class="rz-name"><small>NAME</small><input data-labs-name type="text" maxlength="40" placeholder="e.g. Kelthor (blue)" value="${esc(keepName)}" spellcheck="false" autocomplete="off"></label>
          ${row('data-labs="save"', 'Save template', 'JSON ↓')}
          ${row('data-labs="clone"', 'Spawn live clone', 'IN WORLD')}
          ${row('data-labs="swap"', 'Play as clone', v.clones ? 'SWAP BODIES' : 'SPAWN ONE FIRST')}
          ${v.clones ? row('data-labs="clear"', 'Clear clones', `${v.clones} LIVE`) : ''}
          ${v.templates.length ? `<small class="rz-sub">SAVED · ${v.templates.length}</small>` + v.templates.map((t, i) => `<div class="rz-tpl"><button class="zy-item rz-row" data-item data-labs="wear" data-arg="${i}"><span>${esc(t.name)}</span><small>WEAR</small></button><button class="zy-item rz-mini" data-item data-labs="cloneT" data-arg="${i}">CLONE</button><button class="zy-item rz-mini" data-item data-labs="dl" data-arg="${i}">JSON</button><button class="zy-item rz-mini" data-item data-labs="del" data-arg="${i}">✕</button></div>`).join('') : '<p class="rz-note">Saved templates appear here. A downloaded template JSON can be dropped onto the game to wear it.</p>'}`)}
        ${row('data-labs="reset"', v.resetArmed ? 'Press again to reset' : 'Reset Rizer', 'DEFAULT LOOK', ' rz-danger')}
      </div></div>`;
    page.querySelectorAll('.rz-col').forEach((c, i) => { c.scrollTop = scroll[i] || 0; });
  }
  const SKILL_CATEGORIES = [
    { id:'combat', label:'COMBAT', icon:'⚔', note:'Punches · kicks · weapons' },
    { id:'astral', label:'ASTRAL', icon:'✦', note:'Astralstrike · focus attacks' },
    { id:'traversal', label:'TRAVERSAL', icon:'↗', note:'Movement · parkour · evasion' },
    { id:'flight', label:'FLIGHT', icon:'✧', note:'Flight · aerial movement' },
    { id:'special', label:'SPECIAL', icon:'◈', note:'Prayer · interactions · bonds' }
  ];
  const RIZER_SKILL_EXCLUDES = new Set(['astraliftHit','standup','shocked','tornadoWobble','tornadoFloat','dazedWalk','dazedRun','undeadRun','crawl','stunned','bite','feedBody']);
  function skillCategoryFor(slot) {
    const k = slot.key;
    if (/^(blast|astral|thunder|rollingThunder|airslam|astralclap|astralspin)/i.test(k)) return 'astral';
    if (/^(fly|float|descend|fastfall|fastland|bigland|bail|bailImpact|astralboard|swim)/i.test(k)) return 'flight';
    if (/^(punch|kick|sword|axe|stomp|runKick|runpunch|kickup|draw|sheathe|bow|rifle|heavy|block|parry)/i.test(k)) return 'combat';
    if (/^(walk|run|sprint|tiredRun|strafe|stair|turn|jump|doublejump|fall|land|teleportLand|dodge|slide|treeSpin|vault|ledge|wall|teeter)/i.test(k)) return 'traversal';
    return 'special';
  }
  const RIZER_SKILL_SLOTS = SLOTS.filter(slot => !RIZER_SKILL_EXCLUDES.has(slot.key));
  function renderSkillTree() {
    const host = root.querySelector('#zy-skill-tree'); if (!host) return;
    const category = SKILL_CATEGORIES.find(c => c.id === skillCategory) || SKILL_CATEGORIES[0];
    const slots = RIZER_SKILL_SLOTS.filter(slot => skillCategoryFor(slot) === category.id);
    if (!slots.some(slot => slot.key === skillSelected)) skillSelected = slots[0]?.key || '';
    const selected = slots.find(slot => slot.key === skillSelected) || slots[0];
    const loadout = readComboLoadout();
    const chainSlot = selected && Object.entries(COMBO_MOVES).flatMap(([kind, moves]) => moves.map((key, i) => ({ kind, key, i }))).find(entry => entry.key === selected.key);
    const selectedComboStage = chainSlot ? (loadout[chainSlot.kind] || COMBO_MOVES[chainSlot.kind])[chainSlot.i] : null;
    const comboLabel = selectedComboStage ? (COMBO_LABEL[selectedComboStage] || selectedComboStage) : '';
    const iconFor = slot => ({oneshot:'✦',state:'◉',locomotion:'➤',air:'◇'})[slot.kind] || '•';
    const nodes = slots.map((slot, i) => `<button class="zy-item skill-node${slot.key === selected?.key ? ' selected' : ''}${chainSlot && slot.key === selected.key ? ' equipped' : ''}" data-item data-skill-node="${slot.key}" style="--node-index:${i}" title="${esc(slot.label)}"><i>${iconFor(slot)}</i><span>${esc(slot.label)}</span>${chainSlot && slot.key === selected.key ? '<em>CHAIN SLOT</em>' : ''}</button>`).join('');
    host.innerHTML = `<div class="skilltree-shell">
      <header class="skilltree-head"><div><small>RIZER · ABILITY ARCHIVE</small><h2>SKILL TREE</h2><p>Choose the moves and animation clips that shape Rizer’s play style.</p></div><div class="skilltree-count"><b>${RIZER_SKILL_SLOTS.length}</b><small>AVAILABLE<br>ANIMATION SLOTS</small></div></header>
      <nav class="skilltree-branches" aria-label="Skill categories">${SKILL_CATEGORIES.map(c => `<button class="zy-item skill-branch${c.id === skillCategory ? ' current' : ''}" data-item data-skill-category="${c.id}"><i>${c.icon}</i><span><b>${c.label}</b><small>${c.note}</small></span><em>${RIZER_SKILL_SLOTS.filter(s => skillCategoryFor(s) === c.id).length}</em></button>`).join('')}</nav>
      <div class="skilltree-main"><section class="skilltree-map"><div class="skilltree-map-head"><div><small>${category.label} BRANCH</small><h3>${category.note}</h3></div><span>${slots.length} NODES</span></div><div class="skilltree-path"><div class="skilltree-root"><i>✦</i><span>RIZER</span><small>${category.label} PATH</small></div><div class="skilltree-links" aria-hidden="true"></div><div class="skilltree-nodes">${nodes}</div></div><p class="skilltree-foot">Move nodes are sourced from the project’s animation slot library. Unlock rules and progression costs can be added when the skill system is finalized.</p></section>
      <aside class="skilltree-detail"><small>SELECTED ABILITY</small><div class="skilltree-detail-icon">${selected ? iconFor(selected) : '✦'}</div><h3>${esc(selected?.label || 'Choose a move')}</h3><span class="skilltree-kind">${selected ? `${category.label} · ${selected.kind.toUpperCase()} SLOT` : 'ANIMATION SLOT'}</span><p>${selected ? 'This node represents an existing Rizer animation slot. The live animation system remains the source for its assigned clip.' : 'Select an ability node to see its details.'}</p>${chainSlot ? `<div class="skilltree-equip"><small>COMBO ASSIGNMENT</small><b>${chainSlot.kind.toUpperCase()} · STAGE ${chainSlot.i + 1}</b><span>Currently assigned: ${esc(comboLabel)}</span><button class="zy-item skilltree-action" data-item data-combo-kind="${chainSlot.kind}" data-combo-stage="${chainSlot.i}">CYCLE THIS COMBO SLOT ↻</button></div>` : '<div class="skilltree-equip"><small>LOADOUT STATUS</small><b>ANIMATION SLOT READY</b><span>Move unlock and button assignment wiring will build on this tree.</span></div>'}<div class="skilltree-controls"><span>✕ SELECT NODE</span><span>← → CATEGORY</span></div></aside></div>
    </div>`;
  }
  // ── LABS › ASTRAL: the X-ray Rizer · stats and mods on his nervous system (game.js · astralHub, astral-stats.js) ──
  function renderAstral() {
    const page = root.querySelector('.zy-page[data-page="astral"]'); if (!page) return;
    const scroll = [...page.querySelectorAll('.rz-col')].map(c => c.scrollTop); // a redraw keeps each column where it was
    const v = astralHub.view();
    const bin = (code, title, sub, body, cls = '') => `<section class="rz-bin${cls}"><header><i>${code}</i><b>${title}</b><small>${sub}</small></header>${body}</section>`;
    const stat = s => `<div class="ax-stat"><div class="ax-stat-top"><b style="color:${s.color}">${s.name} <span class="ax-total">${s.total}</span></b><small>${esc(s.full)} · ${s.kind.toUpperCase()} · +${s.per} ${esc(s.unit)} per AP</small></div>
      <div class="ax-pips">${Array.from({ length: v.statMax }, (_, i) => `<i class="${i < s.value ? 'on' : ''}" style="--c:${s.color}"></i>`).join('')}</div>
      <div class="ax-btns"><button class="zy-item rz-mini" data-item data-astral="lower" data-arg="${s.id}">−</button><span>${s.value}</span><button class="zy-item rz-mini" data-item data-astral="raise" data-arg="${s.id}">+</button></div></div>`;
    const system = sys => bin(sys.code, sys.name, sys.note, sys.mods.map(m => `<button class="zy-item rz-row${m.installed ? ' current' : ''}" data-item data-astral="mod" data-arg="${m.id}"><span>${esc(m.name)}<em>${esc(m.effect)}</em></span><small>${m.installed ? 'INSTALLED' : m.cost + ' AP'}</small></button>`).join(''), ' ax-sys');
    const [cortex, spine, arms, legs] = v.systems;
    const modes = `<div class="ax-modes">${[['attr', 'ATTRIBUTES'], ['moves', 'FOCUS MOVES']].map(([m, t]) => `<button class="zy-item ax-mode${axMode === m ? ' current' : ''}" data-item data-focus="mode" data-arg="${m}">${t}</button>`).join('')}</div>`;
    // ── the move editor: the D-pad loadout (left) and every learned Focus Move (right) · focus-moves.js ──
    const learned = focusMoves.learned, slots = focusMoves.slots, sel = FOCUS_MOVES[fpick] ? fpick : null, D = sel ? FOCUS_MOVES[sel] : null, at = sel ? focusMoves.dirOf(sel) : null;
    const ico = (M, big = '') => `<i class="fm-ico${big}" style="--c:${M.color}">${M.glyph}</i>`;
    const slot = d => { const M = FOCUS_MOVES[slots[d]]; return `<button class="zy-item fm-slot fm-${d}${M ? ' filled' : ''}${sel && slots[d] === sel ? ' current' : ''}" data-item data-focus="slot" data-arg="${d}">${M ? ico(M, ' big') : '<i class="fm-plus">+</i>'}<b>${M ? esc(M.name) : 'Empty'}</b><small>${DIR_NAME[d]} · ${DIR_KEY[d]}</small></button>`; };
    const loadout = bin('FM', 'LOADOUT', 'LOCK ON + D-PAD', `<div class="fm-cross">${slot('up')}${slot('left')}<div class="fm-core">${sel ? `${ico(D, ' big')}<b>${esc(D.name)}</b><small>CHOOSE A DIRECTION</small>` : '<b>D-PAD</b><small>PICK A MOVE · THEN A DIRECTION</small>'}</div>${slot('right')}${slot('down')}</div>
      <p class="fm-hint">${sel ? `Placing <b>${esc(D.name)}</b> · ✕ (Enter) on a direction · ○ (Esc) cancels` : 'Lock onto an enemy (R3 / R), then press the D-pad direction to cast what sits there.'}</p>`);
    const known = bin('LB', 'LEARNED', `${learned.length} FOCUS MOVES KNOWN`, `<div class="fm-list">${learned.map(id => { const M = FOCUS_MOVES[id], d = focusMoves.dirOf(id); return `<button class="zy-item fm-row${id === sel ? ' current' : ''}" data-item data-focus="pick" data-arg="${id}">${ico(M)}<span><b>${esc(M.name)}</b><em>${esc(M.element)}${M.innate ? '' : ' · LIGHTBULB'}</em></span><small>${d ? 'D-PAD ' + DIR_NAME[d] : 'NOT SET'}</small></button>`; }).join('')}
      <div class="fm-more">(More to be discovered · find Lightbulbs in the world)</div></div>
      ${D ? `<div class="fm-detail"><small>${esc(D.element)} · ${at ? 'ON D-PAD ' + DIR_NAME[at] : 'NOT EQUIPPED'}</small><b style="color:${D.color}">${esc(D.name.toUpperCase())}</b><p>${esc(D.blurb)}</p></div>` : ''}`);
    const moves = axMode === 'moves';
    page.innerHTML = `<div class="rz-labs ax-labs">
      <div class="rz-col rz-left">${modes}
        ${moves ? loadout : `<section class="ax-ap"><small>ASTRAL POINTS</small><b>${v.free}</b><span>of ${v.total} · Level ${v.level} · +${v.perLevel} per Level</span></section>
        ${bin('01', 'CORE STATS', 'HP · ATK · DEF · STA · SP', v.stats.map(stat).join(''))}
        ${system(cortex)}${system(arms)}`}
      </div>
      <div class="rz-stage" aria-hidden="true"><span class="rz-tl"></span><span class="rz-tr"></span><span class="rz-bl"></span><span class="rz-br"></span>
        <em class="ax-tag ax-t-cortex">CORTEX</em><em class="ax-tag ax-t-spine">SPINAL CORD</em><em class="ax-tag ax-t-arms">ARMS · HANDS</em><em class="ax-tag ax-t-legs">LEGS</em>
        <div class="rz-tag"><small>ASTRAL MATRIX · LIVE</small><b>${esc(v.name)}</b><em>NERVOUS SYSTEM · ${v.mods} MOD${v.mods === 1 ? '' : 'S'}</em></div>
        <div class="rz-scan"></div></div>
      <div class="rz-col rz-right">
        ${moves ? known : `${bin('ID', 'READOUT', 'WHAT THE MATRIX GIVES HIM', `<dl class="rz-dl">${v.readout.map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`).join('')}</dl>`)}
        ${system(spine)}${system(legs)}
        <button class="zy-item rz-row rz-danger" data-item data-astral="reset"><span>${v.resetArmed ? 'Press again to reset' : 'Reset Astral'}</span><small>REFUND ALL AP</small></button>`}
      </div></div>`;
    page.querySelectorAll('.rz-col').forEach((c, i) => { c.scrollTop = scroll[i] || 0; });
  }
  function focusAct(action, arg) {
    if (action === 'mode') { axMode = arg === 'moves' ? 'moves' : 'attr'; fpick = null; return; }
    if (action === 'pick') { fpick = fpick === arg ? null : arg; return; }
    if (action === 'slot') {
      const here = focusMoves.slot(arg);
      if (fpick) { if (here === fpick) focusMoves.clear(arg); else focusMoves.assign(arg, fpick); fpick = null; }
      else if (here) fpick = here;
    }
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
    $('#zy-weapons').insertAdjacentHTML('beforeend', engineering().weapons.filter(w => w.loc === 'ZYCUBE').map(w => `<button class="zy-item" data-item data-plasma-instance="${w.uid}"><b>Plasmabeam · ${w.uid}</b><small>LEVEL ${w.level} · MODS ${w.mods.length}/${w.level} · ${esc(w.mode.toUpperCase())} · ${inventory.equippedUid === w.uid ? 'SELECTED' : inventory.wheel?.includes('plasmabeam') ? 'SELECT & EQUIP' : 'SELECT INSTANCE · ASSIGN PLASMABEAM TO WHEEL TO EQUIP'}</small></button>`).join(''));
  }
  function renderUtilities() {
    const wheel = inventory.utilityWheel ||= Array(6).fill(null);
    const owned = [...new Set([...(inventory.owned || []).filter(k => ['life_seed','telescope','workstation'].includes(k)), ...(storage?.count('ZYCUBE','guitar') ? ['guitar'] : [])])];
    const defs = { guitar: { name: "Psychosyd's Signed Red Guitar", blurb: 'Instrument utility · rebuilt from its body and neck at the Experiment Table. □ plays; movement or a hit stops the solo.' }, life_seed: { name: 'Life Seed', blurb: 'Plant a treehouse on grass.' }, telescope: { name: 'Stargazer Telescope', blurb: 'Set it up to look into the Aethryx Expanse.' }, workstation: { name: 'Field Workstation', blurb: 'Deploy a portable field crafting station.' } };
    const esc = v => String(v).replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const slots = wheel.map((k,i) => `<button class="zy-slot${k ? ' filled' : ''}${k === inventory.equipped ? ' current' : ''}" data-item data-utility-slot="${i}" style="--x:${Math.cos(-Math.PI / 2 + i * Math.PI / 3).toFixed(3)};--y:${Math.sin(-Math.PI / 2 + i * Math.PI / 3).toFixed(3)}"><i>${k ? icons[k] || '' : ''}</i><small>${i+1}</small></button>`).join('');
    const rows = owned.map(k => `<button class="zy-item zy-weapon${wheel.includes(k) ? ' current' : ''}" data-item data-utility="${k}"><i class="zy-wicon">${icons[k] || ''}</i><span><b>${esc(defs[k]?.name || k)}</b><em>${esc(defs[k]?.blurb || '')}</em></span><small>${wheel.includes(k) ? 'UTILITY WHUD' : 'IN ZYCUBE'}</small></button>`).join('');
    $('#zy-utility-wheel').innerHTML = `<div class="zy-ring">${slots}<div class="zy-ring-core"><b>UTILITIES</b><span>Tap a carried utility to add or remove it from the wheel.</span></div></div>`;
    $('#zy-utilities').innerHTML = rows || '<div class="zy-note locked"><small>NO UTILITIES</small><p>Rebuild the guitar at the Experiment Table or find utility items in the world.</p></div>';
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
    const carried = storage.contents('ZYCUBE').equipment.filter(e => e.def.category === 'FIELD_EQUIPMENT'), out = storage.equipmentIn('DEPLOYED').filter(e => e.def.category === 'FIELD_EQUIPMENT');
    const rows = ['<div class="zy-note zy-itemrow" data-item><small>OVERWORLD BASE · LIFE SEED</small><b>Rizer’s Treehouse</b><p>Fallen trees have a 10% chance to release a Life Seed. Equip it from the Armory, then press □ on grass. The treehouse grows magically for 8 seconds; climb its ladder when it is ready.</p></div>'].concat(carried.map(e => `<div class="zy-note zy-itemrow" data-item data-deploy="${e2(e.uid)}"><small><i class="zy-swatch" style="background:${e2(e.def.color)}"></i>FIELD EQUIPMENT · ○ DEPLOY</small><b>${e2(e.def.name)}</b><p>${e2(e.def.blurb)}</p></div>`)
      ).concat(out.map(e => `<div class="zy-note zy-itemrow" data-item data-packdep="${e2(e.uid)}"><small>FIELD EQUIPMENT · DEPLOYED · ○ PACK UP</small><b>${e2(defName(e.type))}</b><p>Standing out in the field. Walk back to it, then pack it up here.</p></div>`));
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
  function setTab(i) { if (TABS[tab] === 'map' && TABS[(i + TABS.length) % TABS.length] !== 'map' && hud.mapFocusMode) hud.setMapFocus(false); tab = (i + TABS.length) % TABS.length; focus = 0; carry = null; fpick = null; homeEdit = false; render(); }
  const setPage = key => setTab(TABS.indexOf(key));
  const stepPage = d => setPage(ORDER[(ORDER.indexOf(TABS[tab]) + d + ORDER.length) % ORDER.length]); // next page, running on into the next section
  const stepInGroup = d => { const P = GROUPS[groupOf(TABS[tab])].pages; if (P.length > 1) setPage(P[(P.indexOf(TABS[tab]) + d + P.length) % P.length]); }; // stays inside the section, wrapping round
  const stepGroup = d => { const g = (groupOf(TABS[tab]) + d + GROUPS.length) % GROUPS.length; setPage(lastIn[g] || GROUPS[g].pages[0]); };
  function activate(el = items()[focus]) {
    if (!el) return;
    if (el.dataset.skinSaved) {
      const saved = skinLibrary.find(s => s.id === el.dataset.skinSaved); if (!saved) return;
      Promise.resolve(onCharacter(saved.data.character || 'rizer')).then(() => {
        const applied = skinLab?.load(saved.data, saved.data.character || 'rizer');
        skinToast(applied?.ok ? `SKIN APPLIED · ${saved.name}` : `SKIN COULD NOT APPLY · ${saved.name}`);
        if (isOpen && TABS[tab] === 'rizer') render();
      }); return;
    }
    if (el.dataset.mapAction === 'world') { hud.setMapView('world'); render(); return; }
    if (el.dataset.mapAction === 'ping') { hud.toggleMapPing(); render(); return; }
    if (el.dataset.mapAction === 'details') { if (hud.mapSelectedPoi) { mapPoiDetailOpen = true; render(); } return; }
    if (el.dataset.mapAction === 'back') { mapPoiDetailOpen = false; render(); return; }
    if (el.dataset.mapAction === 'teleport') { onAction?.('map-teleport'); return; }
    if (el.dataset.skillCategory) { skillCategory = el.dataset.skillCategory; skillSelected = ''; renderSkillTree(); focus = items().indexOf(root.querySelector('.skill-branch.current')); paintFocus(); return; }
    if (el.dataset.skillNode) { skillSelected = el.dataset.skillNode; renderSkillTree(); focus = items().indexOf(root.querySelector(`[data-skill-node="${CSS.escape(skillSelected)}"]`)); paintFocus(); return; }
    if (el.dataset.comboKind) {
      const loadout = readComboLoadout(), kind = el.dataset.comboKind, stage = +el.dataset.comboStage;
      loadout[kind] ||= Array.from({ length: COMBO_CHAINS[kind] }, (_, i) => i ? `${kind}${i + 1}` : kind);
      const options = COMBO_MOVES[kind], i = options.indexOf(loadout[kind][stage]); loadout[kind][stage] = options[(i + 1 + options.length) % options.length];
      localStorage.setItem(COMBO_LOADOUT_KEY, JSON.stringify(loadout)); const keep = focus; render(); focus = keep; paintFocus(); return;
    }
    if (el.dataset.skillTree != null) { setPage('skilltree'); return; }
    if (el.dataset.mapDistrict) { hud.selectDistrict(el.dataset.mapDistrict); render(); return; }
    if (el.dataset.mapCategory) { hud.setMapCategory(el.dataset.mapCategory); render(); return; }
    if (el.dataset.mapPoi) { hud.selectPoi(el.dataset.mapPoi); mapPoiDetailOpen = true; render(); return; }
    if (el.dataset.journalOpen != null) { journalOpen = true; render(); return; }
    if (el.dataset.journalBack != null) { journalOpen = false; render(); return; }
    if (el.dataset.controlContext) { controlContext = el.dataset.controlContext; render(); focus = items().findIndex(x => x.dataset.controlContext === controlContext); paintFocus(); return; }
    if (el.id === 'zy-edit-layout') { homeEdit = !homeEdit; render(); return; }
    if (el.dataset.app) { if (!homeEdit) setTab(TABS.indexOf(el.dataset.app)); return; }
    if (el.dataset.hour) { onTime(+el.dataset.hour); setTimeout(render, 50); }
    if (el.dataset.char) Promise.resolve(onCharacter(el.dataset.char)).then(render);
    if (el.dataset.partner) { onPartner?.(el.dataset.partner); render(); return; } // call that bonded Zyrex to walk with him
    if (el.dataset.focus) { const keep = focus; focusAct(el.dataset.focus, el.dataset.arg); render(); focus = keep; paintFocus(); return; }
    if (el.dataset.astral) { const keep = focus; astralHub?.act(el.dataset.astral, el.dataset.arg); if (isOpen) { render(); focus = keep; paintFocus(); } return; }
    if (el.dataset.labs) { const keep = focus, name = root.querySelector('[data-labs-name]')?.value || ''; Promise.resolve(labsHub?.act(el.dataset.labs, el.dataset.arg, name)).then(() => { if (isOpen && TABS[tab] === 'rizer') { render(); focus = keep; paintFocus(); } }); return; }
    if ('lab' in el.dataset) onAnimLab?.();
    if ('skinLab' in el.dataset) onSkinLab?.();
    if ('buildLab' in el.dataset) onBuildLab?.();
    if (el.dataset.packdep) { onPackDeployed?.(el.dataset.packdep); return; }
    if (el.dataset.deploy) { onDeploy?.(el.dataset.deploy); return; }
    if (el.dataset.use) { const keep = focus; onUseItem?.(el.dataset.use); render(); focus = keep; paintFocus(); return; }
    if (el.dataset.utility) { onUtilityWheel?.(el.dataset.utility, inventory.utilityWheel?.includes(el.dataset.utility) ? 'remove' : 'add'); render(); return; }
    if (el.dataset.utilitySlot != null) { const i = +el.dataset.utilitySlot, k = inventory.utilityWheel?.[i]; if (k) { onUtilityWheel?.(k, 'remove'); render(); } return; }
    if (el.dataset.slot != null || el.dataset.bag) { armoryPick(el); return; }
    if (el.dataset.act) { const keep = focus; onAction?.(el.dataset.act); if (isOpen) { render(); focus = keep; paintFocus(); } }
  }
  function renderMapBrowser() {
    const ds = hud.districts, d = ds.find(q => q.id === hud.viewedDistrict) || ds[0], worldView = hud.mapView === 'world';
    const area = $('#zy-map-area'), back = $('#zy-map-view'), districtList = $('#zy-map-districts'), cats = $('#zy-map-categories'), list = $('#zy-map-pois'), title = $('#zy-map-list-title');
    if (area) area.textContent = worldView ? 'ZYRAXIS · 10 DISTRICTS' : `${d.name.toUpperCase()} · DISTRICT ${d.numeral}`;
    if (back) { back.hidden = worldView; back.textContent = '← FULL ZYRAXIS MAP'; }
    if (districtList) districtList.innerHTML = `<small>DISTRICTS · SELECT TO ZOOM</small>` + ds.map(q => `<button class="zy-map-row district${q.id === d.id && !worldView ? ' current' : ''}" data-item data-map-district="${q.id}"><span><b>${q.numeral} · ${esc(q.name)}</b><em>${esc(q.land)}</em></span><i>${q.built ? 'OPEN' : 'REGION'}</i></button>`).join('');
    const categories = [['all','All POIs'],['landmarks','Landmarks'],['services','Civic & services'],['chests','Chests'],['seer','Seer territory'],['gemlord','Gemlord sites']];
    if (cats) cats.innerHTML = categories.map(([id,label]) => `<button class="zy-map-category${hud.mapCategory === id ? ' current' : ''}" data-item data-map-category="${id}">${label}</button>`).join('');
    const rows = hud.mapPois().filter(it => worldView || hud.districtAt(it.cx,it.cz)?.id === d.id);
    if (title) title.textContent = worldView ? 'SELECT A DISTRICT TO BROWSE ITS POIS' : `${rows.length} LOCATIONS · ${d.name.toUpperCase()}`;
    if (list) list.innerHTML = rows.length ? rows.map(it => `<li><button class="zy-map-row${hud.mapSelectedPoi === it.id ? ' current' : ''}${hud.mapPingPoi === it.id ? ' pinged' : ''}" data-item data-map-poi="${esc(it.id)}"><span><b>${esc(it.name)}</b><em>${esc(hud.kindLabel(it.kind))}${hud.found.has(it.id) ? ' · FOUND' : ''}</em></span><i>${hud.mapPingPoi === it.id ? 'PINGED' : 'VIEW'}</i></button></li>`).join('') : `<li class="zy-map-empty">${worldView ? 'Choose a district on the map or from the list above.' : 'No mapped points in this district yet. Its world region is ready for future location data.'}</li>`;
    const canvas = $('#map-canvas'), detail = $('#zy-map-detail'), poi = hud.mapPois().find(it => it.id === hud.mapSelectedPoi);
    if (detail && mapPoiDetailOpen && poi) {
      canvas.hidden = true; detail.hidden = false;
      const placeDistrict = hud.districtAt(poi.cx, poi.cz) || d;
      const description = poi.note || (poi.kind === 'goldchest' || poi.kind === 'chest' ? `${poi.chestTier ? `${poi.chestTier.toUpperCase()} ` : ''}Chest · open it in the world to claim its contents.` : `Mapped ${hud.kindLabel(poi.kind).toLowerCase()} point of interest in ${placeDistrict.name}.`);
      detail.innerHTML = `<small>LOCATION RECORD · ${esc(placeDistrict.name.toUpperCase())}</small><h2>${esc(poi.name)}</h2><span>${esc(hud.kindLabel(poi.kind))}</span><p>${esc(description)}</p><div class="zy-map-detail-coords">X ${poi.cx.toFixed(1)} · Z ${poi.cz.toFixed(1)}</div><div class="zy-map-detail-actions"><button class="zy-layout-button" data-item data-map-action="teleport">□ TELEPORT · PLAYTEST</button><button class="zy-layout-button" data-item data-map-action="back">○ BACK TO MAP</button></div><small class="zy-map-detail-note">FAST TRAVEL IS UNLOCKED FOR THIS PLAYTEST</small>`;
    } else { if (canvas) canvas.hidden = false; if (detail) detail.hidden = true; }
  }
  function open(which) {
    if (isOpen) { if (which) setTab(TABS.indexOf(which)); return; }
    isOpen = true; root.hidden = false; if (which) tab = TABS.indexOf(which); focus = 0; render(); status(); onOpen?.();
  }
  function close() { if (!isOpen) return; if (hud.mapFocusMode) hud.setMapFocus(false); root.classList.remove('map-focus-mode'); isOpen = false; carry = null; fpick = null; root.hidden = true; root.classList.remove('labs'); onLabsView?.(false); onClose?.(); }

  tabsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const g = GROUPS.findIndex(x => x.id === b.dataset.group); setPage(lastIn[g] || GROUPS[g].pages[0]); });
  subEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setPage(b.dataset.pageTab); });
  root.addEventListener('click', e => { const el = e.target.closest('[data-item]'); if (el) { focus = items().indexOf(el); paintFocus(); activate(el); } });
  root.addEventListener('skin-library-file', async e => {
    const file = e.detail?.file; if (!file) return;
    const label = file.name.replace(/\.json$/i, '');
    let data; try { data = JSON.parse(await file.text()); } catch { skinToast(`${label} · not a valid skin JSON`); return; }
    const key = typeof data?.character === 'string' && characters[data.character] ? data.character : 'rizer';
    const colors = {};
    for (const [part, value] of Object.entries(data?.colors && typeof data.colors === 'object' ? data.colors : {})) {
      if (/^(R|M|N)_\w+$/.test(part) && /^#?[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(String(value))) colors[part] = String(value).startsWith('#') ? String(value) : `#${value}`;
    }
    if (!Object.keys(colors).length) { skinToast(`${label} · no skin colours found`); return; }
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    skinLibrary.push({ id, name: String(data.name || label || 'Saved skin').slice(0, 48), data: { character:key, colors, ...(typeof data.hair === 'string' ? { hair:data.hair } : {}) } });
    saveSkinLibrary(); render(); skinToast(`SKIN SAVED · ${label}`);
  });
  root.addEventListener('dragover', e => { if (!e.target.closest('[data-skin-library-drop]')) return; e.preventDefault(); e.stopPropagation(); e.target.closest('[data-skin-library-drop]').classList.add('drag-over'); });
  root.addEventListener('dragleave', e => { const zone = e.target.closest('[data-skin-library-drop]'); if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove('drag-over'); });
  root.addEventListener('dragstart', e => { const card = e.target.closest('[data-skin-saved]'); if (!card) return; card.classList.add('dragging'); e.dataTransfer?.setData('text/plain', card.dataset.skinSaved); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; });
  root.addEventListener('dragend', e => { const card = e.target.closest('[data-skin-saved]'); if (!card) return; card.classList.remove('dragging'); const r = card.getBoundingClientRect(), x = e.clientX, y = e.clientY; if (x < r.left || x > r.right || y < r.top || y > r.bottom) { skinLibrary = skinLibrary.filter(s => s.id !== card.dataset.skinSaved); saveSkinLibrary(); render(); } });
  $('#map-canvas').addEventListener('click', e => {
    if (!isOpen || TABS[tab] !== 'map' || mapPoiDetailOpen) return;
    const point = hud.mapToWorld(e.clientX, e.clientY), result = hud.chooseMapPoint(point);
    if (!result) return;
    render();
    if (result.poi) root.querySelector(`[data-map-poi="${CSS.escape(result.poi)}"]`)?.scrollIntoView({ block: 'nearest' });
  });
  root.addEventListener('mousedown', e => e.stopPropagation());

  // Keyboard while open. Returns true when the key was used.
  function key(code) {
    if (!isOpen) return false;
    const typing = document.activeElement?.matches?.('[data-labs-name]');
    if (typing) { if (code === 'Escape' || code === 'Enter') document.activeElement.blur(); if (code === 'Enter') { focus = items().findIndex(el => el.dataset.labs === 'save'); paintFocus(); } return true; }
    if (carry && (code === 'Escape' || code === 'Backspace')) { carry = null; render(); }
    else if (fpick && (code === 'Escape' || code === 'Backspace')) { fpick = null; render(); }
    else if (TABS[tab] === 'home' && homeEdit && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(code)) {
      const cols = 5, delta = code === 'ArrowLeft' ? -1 : code === 'ArrowRight' ? 1 : code === 'ArrowUp' ? -cols : cols;
      const from = +(items()[focus]?.dataset.appIndex ?? 0); swapHome(from, Math.max(0, Math.min(homeOrder.length - 1, from + delta)));
    }
    else if (TABS[tab] === 'map' && mapPoiDetailOpen && (code === 'Escape' || code === 'Backspace')) { mapPoiDetailOpen = false; render(); }
    else if (code === 'KeyZ' || code === 'Tab' || code === 'Escape' || code === 'Backspace') close();
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
  // Shoulder/trigger buttons change Zyphone sections and apps. All four D-pad directions stay inside the open page.
  function pad(p, dt = 1 / 60) {
    if (!isOpen) return;
    if (TABS[tab] === 'map' && hud.mapFocusMode) {
      if (p.edge(1) || p.edge(17)) { hud.setMapFocus(false); mapPoiDetailOpen = false; root.classList.remove('map-focus-mode'); render(); return; }
      hud.moveMapFocus(p.x || 0, p.z || 0, dt);
      if (p.btn(7)) hud.zoomMapFocus(1, dt); if (p.btn(6)) hud.zoomMapFocus(-1, dt);
      if (p.edge(0) && hud.mapSelectedPoi) { mapPoiDetailOpen = true; render(); return; }
      if (p.edge(2) && hud.mapSelectedPoi) { onAction?.('map-teleport'); return; }
      return;
    }
    if (TABS[tab] === 'map' && p.edge(11)) { hud.setMapFocus(true); mapPoiDetailOpen = false; root.classList.add('map-focus-mode'); render(); return; }
    if (carry && p.edge(1)) { carry = null; render(); return; }
    if (fpick && p.edge(1)) { fpick = null; render(); return; } // ○ drops what you're moving back where it was
    if (TABS[tab] === 'map' && mapPoiDetailOpen && p.edge(1)) { mapPoiDetailOpen = false; render(); return; }
    if (TABS[tab] === 'map' && p.edge(2)) { if (hud.mapSelectedPoi) onAction?.('map-teleport'); return; } // □ fast travel · temporarily open for playtesting
    if (p.edge(1) || p.edge(17)) return close();
    if (TABS[tab] === 'map' && p.edge(0)) { const focused = items()[focus]; if (focused?.dataset.mapPoi) hud.selectPoi(focused.dataset.mapPoi); if (hud.mapSelectedPoi) { mapPoiDetailOpen = true; render(); } return; } // ✕ interacts with the selected POI
    if (TABS[tab] === 'weapons' && p.edge(2)) equipFocused(); // □ equips
    if (TABS[tab] === 'home' && homeEdit && (p.edge(12) || p.edge(13) || p.edge(14) || p.edge(15))) {
      const delta = p.edge(14) ? -1 : p.edge(15) ? 1 : p.edge(12) ? -5 : 5;
      const from = +(items()[focus]?.dataset.appIndex ?? 0); swapHome(from, Math.max(0, Math.min(homeOrder.length - 1, from + delta))); return;
    }
    if (p.edge(4)) stepGroup(-1); else if (p.edge(5)) stepGroup(1);
    if (p.edge(6)) stepPage(-1); else if (p.edge(7)) stepPage(1);
    if (p.edge(12)) moveSpatial(0, -1);
    if (p.edge(13)) moveSpatial(0, 1);
    if (p.edge(14)) moveSpatial(-1, 0);
    if (p.edge(15)) moveSpatial(1, 0);
    if (p.edge(0)) activate();
  }
  return { open, close, toggle: w => (isOpen ? close() : open(w)), refresh: () => { if (isOpen) render(); }, key, pad, status, get isOpen() { return isOpen; }, get tab() { return TABS[tab]; } };
}
