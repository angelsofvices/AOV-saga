#!/usr/bin/env node
/* verify_doorverbs.js · v0.96.10
 *
 *   Creator: "you must press square to enter an unlocked building. you can
 *   quick interact with it by pressing x. allow dualsense controller navigation
 *   in all building and other native UI pop ups."
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const H = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);

console.log('\n=== DOOR VERBS + PAD NAVIGATION · v0.96.10 ===\n');

const noop = () => {};
const _Q = [], KEYDOWN = [];
global.setInterval = () => 0; global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: (_, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop: noop });
  if (k === 'getImageData') return () => ({ data: [], width: 0, height: 0 });
  if (k === 'canvas') return { width: 960, height: 540 };
  return () => {};
} });
const _els = new Map();
const CLICKS = [];
function mkBtn(name){
  return { tagName: 'BUTTON', _name: name, disabled: false, style: {}, dataset: {},
    offsetParent: {}, click(){ CLICKS.push(this._name); },
    scrollIntoView: noop, addEventListener: noop, getAttribute: () => null };
}
const mk = (id) => {
  // ★ panels start display:none, exactly as they do in the real markup. A mock
  //   whose style object is empty reports every panel as OPEN, and then
  //   "nothing is open" is untestable.
  const el = { id, style: { display: 'none' }, dataset: {}, _buttons: [],
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
    getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop,
    removeEventListener: noop, setAttribute: noop, getAttribute: () => null, focus: noop,
    remove: noop, replaceChildren: noop, cloneNode(){ return mk(id); },
    querySelector: () => mk(id), querySelectorAll(sel){ return this._buttons; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }) };
  return el;
};
const elFor = id => { if (!_els.has(id)) _els.set(id, mk(id)); return _els.get(id); };
global.addEventListener = (ty, fn) => { if (ty === 'keydown' && typeof fn === 'function') KEYDOWN.push(fn); };
global.removeEventListener = noop;
global.document = { getElementById: elFor, querySelector: () => mk('x'), querySelectorAll: () => [],
  createElement: () => mk('x'), addEventListener: noop, body: mk('body'),
  documentElement: mk('html'), head: mk('head'), hidden: false,
  visibilityState: 'visible', hasFocus: () => true };
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.Audio = function () { return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, volume: 1, cloneNode(){ return this; } }; };
global.Image = function () { const o = { addEventListener: noop, complete: true, naturalWidth: 256, naturalHeight: 145,
  set src(v){ this._src = v; }, get src(){ return this._src; } }; return o; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
global.performance = { now: () => 1000 };
// ★ computed style FOLLOWS the element · returning a constant 'block' made the
//   visibility check unfalsifiable
global.getComputedStyle = (el) => ({ getPropertyValue: () => '',
  display: (el && el.style && el.style.display) || 'block', visibility: 'visible' });
const LOG = console.log;
console.log = () => {}; console.warn = noop; console.error = noop;
new Function(src + `;globalThis.__C={ player, game, WORLD_PROPS, facedCivicDoor,
  enterFacedCivicDoor, civicQuickInteract, civicService, enterCivic, civicSceneId,
  UI_PANEL_IDS, openUiPanel, handleUiPanelKey, CIVIC_HEAL_COST, interiorConfig };`)();
let n = 0; while (_Q.length && n < 80) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;

/* ── 1 · ★★★ SQUARE ENTERS · X DOES NOT ─────────────────────────────────── */
{
  const hosp = C.WORLD_PROPS.find(p => p && p.id === 'malezor_hospital');
  t(!!hosp && !!hosp._civicEnter, 'the hospital declares an enterable door');
  C.game.scene = 'overworld';
  // stand one tile south, facing north at the door tile
  C.player.x = hosp.tileX; C.player.y = hosp.tileY + 1; C.player.dir = 'up';
  t(C.facedCivicDoor() === hosp,
    '★★ facing the door tile finds the door · the check is on the FACED TILE, not '
    + 'on proximity, so Square can never eat a swing at something standing beside you');
  C.player.dir = 'down';
  t(C.facedCivicDoor() === null, '  · facing away finds nothing');
  C.player.x = hosp.tileX + 4;
  C.player.dir = 'up';
  t(C.facedCivicDoor() === null, '  · four tiles east finds nothing');

  // ★ Square really enters
  C.player.x = hosp.tileX; C.player.y = hosp.tileY + 1; C.player.dir = 'up';
  const went = C.enterFacedCivicDoor();
  t(went && C.game.scene === C.civicSceneId('nurse', 'malezor'),
    `★★★ Square opens the building (${C.game.scene}) · entering is a deliberate act `
    + 'now, not something that happens because you pressed the universal button '
    + 'near a wall');
  C.game.scene = 'overworld';

  // ★★ X is the quick service, from the street
  C.player.items = C.player.items || {};
  C.player.items.coins = 500;
  C.player.party = [{ hp: 5, maxHp: 100, speciesId: 'elzebub' }];
  const before = C.player.items.coins;
  hosp.onInteract();
  t(C.player.party[0].hp === 100 && C.player.items.coins === before - C.CIVIC_HEAL_COST,
    '★★★ X heals AT THE DOOR without entering · that split gives the buildings back '
    + 'the service they had before the interiors existed, without making you walk '
    + 'through a room to buy one potion');
  t(C.game.scene === 'overworld', '  · and X never changes the scene');
}

/* ── 2 · one implementation, two entry points ───────────────────────────── */
{
  const CODE = H.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
  t(/function civicQuickInteract\(kind, dist\)\{?[\s\S]{0,220}?civicService\(kind, dist\)/.test(CODE),
    '★★ the street verb CALLS the counter service · one implementation, so the '
    + 'pavement and the counter can never drift into telling you different prices');
  const doors = (H.match(/_civicEnter: \{ kind: '/g) || []).length;
  const quick = (H.match(/civicQuickInteract\('/g) || []).length;
  t(doors === 4 && quick === 4,
    `★ all four Malezor doors carry BOTH verbs (${doors} enter, ${quick} quick)`);
}

/* ── 3 · ★★★ ONE TILE AUTHORITY · BOTH VERBS, THE SAME DOOR TILE ────────── */
{
  //   Creator: "must interact with the building door tile in order to 'use it
  //   or enter it' x/square"
  t(/const p = _propDoors\.get\(`\$\{fx\},\$\{fy\}`\);/.test(H),
    '★★★ the door test reads _propDoors — the map keyed on the DOOR TILE '
    + '(`p.tileX + p.door[0]`), which is the same map X already used. v0.96.10 '
    + 'scanned WORLD_PROPS for a prop whose ORIGIN matched the faced tile: the '
    + 'same tile for these four buildings, and silently the wrong one for any '
    + 'prop whose door is offset from its anchor');
  t(!/if \(k === 'j'\)\{\s*\n\s*try \{ if \(enterFacedCivicDoor\(\)\) return; \}/.test(H),
    '★★ and the bespoke Square override in the melee branch is GONE · the game '
    + 'already had onSquare (v0.95.366) dispatched off the same map. Two '
    + 'mechanisms with different tile rules is how X and Square end up '
    + 'disagreeing about where a building is');
  const sq = (H.match(/onSquare:   \(\) => \{ enterCivic\(/g) || []).length;
  t(sq === 4, `★ all four doors define onSquare (${sq}) · the game's own convention`);
  // both verbs resolve through the same registry entry
  const hosp = C.WORLD_PROPS.find(p => p && p.id === 'malezor_hospital');
  t(typeof hosp.onSquare === 'function' && typeof hosp.onInteract === 'function',
    '★★ the SAME prop carries both verbs · so a re-sited door moves them together');
}

/* ── 3b · ★★★ A FOOTSTEP IS NOT A PURCHASE ─────────────────────────────── */
{
  // ★ Ask the PROPS, not the file. Counting occurrences of the flag broke the
  //   moment v0.96.12's field workstation became the fifth press-only door —
  //   an exact-count assertion on a growing family is a test that fails for
  //   being right.
  const CIVIC_DOORS = ['malezor_hospital', 'malezor_town_hall',
                       'malezor_potion_shop', 'malezor_zysphere_shop'];
  const notPressOnly = CIVIC_DOORS.filter(id => {
    const p = C.WORLD_PROPS.find(x => x && x.id === id);
    return !(p && p._pressOnlyDoor);
  });
  t(notPressOnly.length === 0,
    `★ all four civic doors are press-only${notPressOnly.length ? ' · MISSING: ' + notPressOnly.join(', ') : ''}`);
  const i = H.indexOf('if (doorProp && doorProp._pressOnlyDoor){');
  const j = H.indexOf("if (doorProp && typeof doorProp.onInteract === 'function'){",
                      H.indexOf('const doorProp = _propDoors.get(`${player.x},${player.y}`)'));
  t(i > 0 && i < j,
    '★★★ the press-only bounce is checked BEFORE the walk-on auto-fire · since '
    + 'v0.95.710 every registered door fires onInteract the moment you step on '
    + 'its tile. That was harmless while onInteract only opened doors — but '
    + 'v0.96.10 made X the QUICK SERVICE, so walking across the infirmary '
    + 'threshold would have silently charged 50 coins and healed a party that '
    + 'did not need it, with no prompt and no way to decline');
  t(/doorProp\._doorHintAt/.test(H),
    '★ and the "SQUARE to enter" nudge is throttled · a hint that fires on every '
    + 'footstep against a wall is noise, not teaching');
}

/* ── 4 · ★★★ THE PAD NAVIGATES EVERY DOM PANEL ──────────────────────────── */
{
  t(C.UI_PANEL_IDS.length >= 14,
    `★★ ${C.UI_PANEL_IDS.length} panels are routed · the ZyPhone got a D-pad router months `
    + 'ago and every other panel in the game has only ever answered a MOUSE. On a '
    + 'DualSense they opened and then did nothing, which is worse than not opening');
  for (const id of ['expPanel', 'bagPanel', 'walletPanel', 'zysphereShopOverlay',
                    'potionShopOverlay', 'weaponShopOverlay', 'ultrashardPicker'])
    t(C.UI_PANEL_IDS.includes(id), `  routed · ${id}`);

  // ── drive it ──
  t(C.openUiPanel() === null, 'nothing open · no panel found');
  t(C.handleUiPanelKey('arrowdown') === false,
    '★★ and it consumes NOTHING when no panel is open · a navigator that swallows '
    + 'arrows in the overworld would stop the player walking');

  const exp = elFor('expPanel');
  exp.style.display = 'flex';
  exp._buttons = [mkBtn('craft-a'), mkBtn('craft-b'), mkBtn('craft-c')];
  t(C.openUiPanel() === exp, 'the science bench is found when open');
  CLICKS.length = 0;
  t(C.handleUiPanelKey('arrowdown') === true, '★ D-pad down moves the cursor');
  t(exp._buttons[1].style.outline.includes('#7ad4ff'),
    '★★ and the SELECTION IS VISIBLE · a cursor you cannot see is not navigation');
  C.handleUiPanelKey('x');
  t(CLICKS.length === 1 && CLICKS[0] === 'craft-b',
    `★★★ Cross clicks the highlighted control (${CLICKS[0]}) · it drives the panel's own `
    + 'button, so every existing mouse handler works unchanged and no panel needed '
    + 'a second code path');
  // wrap
  C.handleUiPanelKey('arrowdown'); C.handleUiPanelKey('arrowdown');
  CLICKS.length = 0; C.handleUiPanelKey('x');
  t(CLICKS[0] === 'craft-a', '★ the cursor wraps · three items, four presses, back to the first');

  t(C.handleUiPanelKey('b') === false,
    "★★ B/Circle FALLS THROUGH · this router navigates, it does not own a panel's "
    + 'lifecycle, so every existing close handler still closes its own panel');

  // ★ an empty panel must not become an input black hole
  exp._buttons = [];
  t(C.handleUiPanelKey('arrowdown') === false,
    '★★★ a panel with no controls swallows nothing · otherwise an empty recipe list '
    + 'would trap the player behind a panel the D-pad appears to be inside');

  // ★ disabled controls are skipped
  exp._buttons = [mkBtn('ok1'), mkBtn('nope'), mkBtn('ok2')];
  exp._buttons[1].disabled = true;
  CLICKS.length = 0;
  C.handleUiPanelKey('arrowdown');
  C.handleUiPanelKey('x');
  t(CLICKS[0] === 'ok2',
    '★★ disabled controls are skipped · cursoring onto a dead button is a press the '
    + 'player cannot explain');
  exp.style.display = 'none';
}

/* ── 5 · it does not fight the ZyPhone ──────────────────────────────────── */
{
  t(/if \(!game\.zphoneOpen && handleUiPanelKey\(k\)\)/.test(H),
    '★★ the router stands down while the ZyPhone is open · the phone has its own '
    + 'complete router and two cursors on one screen is the bug this was meant to fix');
  const dispatch = H.indexOf('if (!game.zphoneOpen && handleUiPanelKey(k))');
  const hq = H.indexOf('if (handleHqPanelKey(k))');
  t(hq > 0 && dispatch > hq,
    '  · and it sits BELOW the purpose-built confirms, which own their own keys');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
