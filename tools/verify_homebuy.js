#!/usr/bin/env node
/* verify_homebuy.js · v0.96.2
 *
 *   Creator: "confirm house purchase overlay on new properties. and owned
 *   properties show up on minimap as purple star blip."
 *
 * ★ Two halves, one suite. The first half is about an IRREVERSIBLE spend that
 *   used to happen with no prompt at all; the second is about a pin that must
 *   survive a crowded map. Both are driven for real against /tmp/all.js rather
 *   than grepped, because "the string is present" has been wrong here before.
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

console.log('\n=== HOME PURCHASE CONFIRM + PROPERTY STARS · v0.96.2 ===\n');

/* ── the headless shell ─────────────────────────────────────────────────── */
const noop = () => {};
const _Q = [];
global.setInterval = () => 0;
global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CALLS = { star: 0, arc: 0, fillText: [] };
const CTX = new Proxy({}, { get: (_, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient')
    return () => ({ addColorStop: noop });
  if (k === 'getImageData') return () => ({ data: [], width: 0, height: 0 });
  if (k === 'canvas') return { width: 960, height: 540 };
  if (k === 'fillText') return (s2, x, y) => CALLS.fillText.push(String(s2));
  if (k === 'arc') return () => { CALLS.arc++; };
  if (typeof k === 'string') return () => {};
  return undefined;
} });
const el = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
  getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop,
  removeEventListener: noop, setAttribute: noop, getAttribute: () => null, focus: noop, remove: noop,
  play: () => Promise.resolve(), pause: noop, querySelector: () => el(), querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }) });
// ★★★ CAPTURE the real keydown listeners so the dispatch can be DRIVEN, not
// grepped. v0.96.2 shipped a confirm whose handler was wired inside the
// `scene === 'title'` branch — the one scene where you cannot buy a house — and
// this suite passed it, because it called the handler directly and then checked
// the SOURCE for the call. The game froze on the Creator's screen.
const KEYDOWN = [];
global.addEventListener = (type, fn) => { if (type === 'keydown' && typeof fn === 'function') KEYDOWN.push(fn); };
global.removeEventListener = noop;
const _els = new Map();
const elFor = id => { if (!_els.has(id)) _els.set(id, el()); return _els.get(id); };
global.document = { getElementById: id => elFor(id), querySelector: () => el(), querySelectorAll: () => [],
  createElement: () => el(), addEventListener: noop, body: el(), documentElement: el(), head: el(),
  hidden: false, visibilityState: 'visible' };
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.Audio = function () { return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, cloneNode() { return this; } }; };
global.Image = function () { return { addEventListener: noop, complete: true, naturalWidth: 1254, src: '' }; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
let T = 1000;
global.performance = { now: () => T };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

const LOG = console.log;
console.log = () => {};
console.warn = () => {};
new Function(src + `;globalThis.__C={ player, game, WORLD_PROPS,
  get homeBuyConfirm(){return homeBuyConfirm}, set homeBuyConfirm(v){homeBuyConfirm=v},
  drawHomeBuyConfirm, migrateOwnedHomeIds,
  handleHomeBuyConfirmKey, tryPurchaseHome, ownedHomePins, invalidateHomePins,
  drawMinimap, minimapPOIs, minimapVisible, MINIMAP, isPurchasableHomeId, homePriceAt };`)();
let n = 0;
while (_Q.length && n < 60) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;

/* ── 0 · ★★★ ONLY HOMES ARE FOR SALE ────────────────────────────────────── */
//   Creator: "the only purchasable properties are each districts 3 types of
//   home. not the POIS or landmark or caves"
const ROUTES = C.WORLD_PROPS.filter(p => p && p.id && typeof p.onInteract === 'function'
  && /tryPurchaseHome/.test(p.onInteract.toString()));
const SELLABLE = C.WORLD_PROPS.filter(p => p && p.id && C.isPurchasableHomeId(p.id));
{
  t(SELLABLE.length === ROUTES.length && SELLABLE.length === 89,
    `★★★ EXACTLY the ${ROUTES.length} homes are for sale · nothing else in the world `
    + `(${SELLABLE.length} pass the guard). This was a DENY-LIST — everything was for `
    + 'sale unless its id contained one of forty banned words — so it offered '
    + "`oatheus_cave`, the Tenth Gemlord's sanctum, as a 5,000-coin starter home, "
    + 'and would have offered every landmark added after it was written');
  const strays = SELLABLE.filter(p => !ROUTES.includes(p)).map(p => p.id);
  t(strays.length === 0,
    '  · no building passes the guard without a door that sells it'
    + (strays.length ? ` · STRAYS: ${strays.slice(0, 6).join(', ')}` : ''));
  for (const id of ['oatheus_cave', 'rakoron_cave', 'malezor_seer_hq', 'zarvane_town_hall',
                    'malezor_academy', 'zarvane_oasis', 'malezor_broadcast_tower'])
    t(!C.isPurchasableHomeId(id), `  · not for sale · ${id}`);
  // every district that has homes has its three art variants
  const byDist = {};
  for (const p of ROUTES) {
    const d = (p._doctrineHome) || String(p.id).split('_')[0];
    (byDist[d] = byDist[d] || new Set()).add(p._homeVariant || String(p.id).replace(/_\d+$/, ''));
  }
  const three = Object.entries(byDist).filter(([, v]) => v.size === 3).map(([k]) => k);
  t(three.length >= 8,
    `★ ${three.length} districts sell three distinct home types · ${three.sort().join(', ')}`);
}

/* ── 1 · ★★★ THE SPEND IS NO LONGER SILENT ──────────────────────────────── */
const house = ROUTES.find(p => p.tileX != null);
t(!!house, `a really-purchasable home exists in the world to test against (${house && house.id})`);

if (house) {
  C.player.items = C.player.items || {};
  C.player.items.coins = 99999;
  C.player.ownedHomes = [];
  C.homeBuyConfirm = null;
  const before = C.player.items.coins;
  C.tryPurchaseHome(house.id, house.tileX, house.tileY);

  t(C.player.items.coins === before,
    '★★★ walking up and pressing X SPENDS NOTHING · this is the whole request. '
    + 'Before v0.96.2 tryPurchaseHome() ran `player.items.coins = coins - price` '
    + 'inline, so an affordable house was bought by the same keypress that opens '
    + 'every other door in the game — up to 5,000 coins, no prompt, no undo');
  t(C.player.ownedHomes.length === 0, '  · and the deed is not filed yet either');
  t(!!C.homeBuyConfirm, 'the confirm is open instead');
  t(C.homeBuyConfirm && C.homeBuyConfirm.idx === 0,
    '★★ CANCEL is the default selection · the answer to an irreversible question '
    + 'starts at no, the same habit the new-game confirm keeps');
  t(C.homeBuyConfirm && C.homeBuyConfirm.price === C.homePriceAt(house.tileX, house.tileY),
    '  · and it carries the real district price, not a constant');

  // ── cancelling ──
  C.handleHomeBuyConfirmKey('b');
  t(!C.homeBuyConfirm && C.player.items.coins === before && !C.player.ownedHomes.length,
    '★ B backs out clean · no coins moved, no deed filed');

  // ── confirming ──
  C.game.scene = 'overworld'; C.game.zphoneOpen = false; C.game.paused = false;
  C.tryPurchaseHome(house.id, house.tileX, house.tileY);
  t(!!C.homeBuyConfirm, '  · and it reopens for the confirm path');
  const price = C.homeBuyConfirm ? C.homeBuyConfirm.price : -1;
  C.handleHomeBuyConfirmKey('arrowdown');
  t(C.homeBuyConfirm.idx === 1, 'DOWN moves to BUY IT');
  C.handleHomeBuyConfirmKey('arrowdown');
  t(C.homeBuyConfirm.idx === 0,
    '★ and it TOGGLES rather than running off the end · two options, either key, always lands somewhere');
  C.handleHomeBuyConfirmKey('arrowup');
  C.handleHomeBuyConfirmKey('enter');
  t(C.player.items.coins === before - price, `★ confirming debits exactly the price (-${price})`);
  t(C.player.ownedHomes.includes(house.id), '  · and files the deed');
  t(!C.homeBuyConfirm, '  · and closes');

  // ── ★★★ the stale-purse re-check ──
  C.player.ownedHomes = [];
  C.tryPurchaseHome(house.id, house.tileX, house.tileY);
  C.player.items.coins = 1;                       // spent it in the ZyPhone meanwhile
  C.handleHomeBuyConfirmKey('arrowdown');
  C.handleHomeBuyConfirmKey('enter');
  t(C.player.items.coins === 1 && !C.player.ownedHomes.length,
    '★★★ the purse is re-read AT THE MOMENT OF PURCHASE, not when the prompt '
    + 'opened · a confirm that trusts the number it captured will happily sell '
    + 'you a house you can no longer afford and drive coins negative');

  // ── it swallows the world while it is up ──
  C.player.items.coins = 99999;
  C.tryPurchaseHome(house.id, house.tileX, house.tileY);
  t(C.handleHomeBuyConfirmKey('arrowleft') === true && C.handleHomeBuyConfirmKey('e') === true,
    '★★ every key is CONSUMED while the prompt is up · a modal that lets movement '
    + 'and X leak through lets you walk away mid-question and buy the house by '
    + 'attacking something');
  C.handleHomeBuyConfirmKey('b');
  t(C.handleHomeBuyConfirmKey('x') === false,
    '  · and it consumes NOTHING once closed · the return value is the only thing '
    + 'stopping the key dispatch from eating the whole game');
}

/* ── 2 · ★★★ THE DISPATCH IS DRIVEN, NOT GREPPED ────────────────────────── */
t(/id="homeBuyConfirm"/.test(H), 'the overlay markup exists');
t(KEYDOWN.length > 0, `the game registered ${KEYDOWN.length} keydown listeners`);
// Fire a real event through every registered listener, exactly as the browser
// would, and see whether the prompt actually responds.
const press = (key) => {
  let prevented = false;
  const ev = { key, repeat: false, preventDefault(){ prevented = true; }, stopPropagation: noop };
  for (const fn of KEYDOWN){ try { fn(ev); } catch (_) {} }
  return prevented;
};
if (house) {
  C.player.items.coins = 99999;
  C.player.ownedHomes = [];
  C.game.scene = 'overworld';
  C.game.zphoneOpen = false; C.game.paused = false;
  C.homeBuyConfirm = null;
  C.tryPurchaseHome(house.id, house.tileX, house.tileY);
  t(!!C.homeBuyConfirm, 'standing in a district, the confirm opens');
  press('ArrowDown');
  t(C.homeBuyConfirm && C.homeBuyConfirm.idx === 1,
    '★★★ a REAL ArrowDown through the REAL keydown listener moves the selection · '
    + 'v0.96.2 wired this dispatch inside the `scene === \'title\'` branch, the one '
    + 'scene where a house cannot be bought. In a district the prompt opened, owned '
    + 'the screen, and no handler was reachable — unanswerable, undismissable, and '
    + 'indistinguishable from a hung game. The Creator hit it within the hour');
  press('b');
  t(!C.homeBuyConfirm, '★ and a real B closes it · there is a way out from the keyboard');
  t(!C.player.ownedHomes.length && C.player.items.coins === 99999, '  · with nothing spent');

  // ★★ and the overworld is not the only place it must work
  C.tryPurchaseHome(house.id, house.tileX, house.tileY);
  t(!!C.homeBuyConfirm && press('Escape') && !C.homeBuyConfirm,
    '★ Escape works too · three ways out, like every other modal in the file');
}
// ★★ a modal that cannot be SEEN must not eat input
{
  C.homeBuyConfirm = { idx: 0, homeId: 'ghost', price: 1, doorX: 0, doorY: 0, dist: 'malezor' };
  const realGet = global.document.getElementById;
  global.document.getElementById = (id) => (id === 'homeBuyConfirm' ? null : realGet(id));
  const swallowed = C.handleHomeBuyConfirmKey('arrowdown');
  global.document.getElementById = realGet;
  t(swallowed === false && !C.homeBuyConfirm,
    '★★ if the overlay cannot be shown the state CLEARS and the key passes through · '
    + 'an invisible modal holding input hostage is exactly what the freeze looked '
    + 'like, so the failure mode is now "no prompt" rather than "no game"');
}
// ★ and it refuses to open underneath the phone
{
  C.game.zphoneOpen = true;
  C.homeBuyConfirm = null;
  if (house) C.tryPurchaseHome(house.id, house.tileX, house.tileY);
  t(!C.homeBuyConfirm,
    '★ it will not open beneath an open ZyPhone · the touchpad toggle outranks every '
    + 'other handler by design, so a confirm opened under it would be unreachable again');
  C.game.zphoneOpen = false;
}

/* ── 2b · ★★★ THE DEED NAMES A BUILDING THAT EXISTS ─────────────────────── */
{
  // The Creator's own save carried `redroof_1` — visible in his ZyPhone message
  // log — because three families passed tryPurchaseHome() an id no prop used.
  C.player.ownedHomes = ['redroof_1', 'villager_2', 'veridan_5', 'zarvane_condo_0'];
  const moved = C.migrateOwnedHomeIds();
  t(moved === 3, `★★★ ${moved} legacy deeds migrated to real building ids`);
  t(C.player.ownedHomes.includes('red_roof_home_1')
    && C.player.ownedHomes.includes('villager_home_2')
    && C.player.ownedHomes.includes('veridan_home_5'),
    '★★★ redroof_N → red_roof_home_N, villager_N → villager_home_N, '
    + '<district>_N → <district>_home_N · 72 of the 89 homes filed a deed under an '
    + 'id NO PROP CARRIED. _homeIdDoorTile() resolves a deed by matching p.id, so '
    + 'every one of those purchases bought a Rizer Room that '
    + 'findNearestOwnedHomeSpawn() could never find — up to 5,000 coins for a house '
    + 'that never became your respawn point, and no minimap star either');
  t(C.player.ownedHomes.includes('zarvane_condo_0'),
    '  · and an id that was ALREADY correct is left alone');
  t(C.player.ownedHomes.every(id => C.isPurchasableHomeId(id)),
    '★★ every migrated deed now resolves to a real for-sale building · '
    + 'checked against the allow-list, not against the regex that produced it');
  const twice = C.migrateOwnedHomeIds();
  t(twice === 0 && C.player.ownedHomes.length === 4,
    '★ running it a second time is a no-op · a migration that is not idempotent '
    + 'corrupts on every save/load cycle');
}

/* ── 3 · ★★ THE PURPLE STARS ────────────────────────────────────────────── */
C.player.ownedHomes = house ? [house.id] : [];
C.invalidateHomePins();
const pins = C.ownedHomePins();
t(pins.length >= 1, `owned homes resolve to pins (${pins.length})`);
t(pins.every(p => p.kind === 'home'), '  · all tagged kind:home');
t(pins.some(p => p.x === 22 && p.y === 106),
  "★ Malezor's starting Rizer Room is pinned too · it is a home you own without "
  + 'a deed, and findNearestOwnedHomeSpawn() already treats it as one');
if (house) t(pins.some(p => p.x === house.tileX && p.y === house.tileY),
  '  · and the purchased house sits at its real door tile');

// ★★★ THE EVICTION TEST. This is the reason home pins are a separate pass.
{
  const poi = C.minimapPOIs();
  t(!poi.some(p => p.kind === 'home'),
    '★★★ home pins are NOT in the minimapPOIs feed · that feed is sliced to '
    + 'maxPOI (6) by minimapVisible, so a home pushed through it would be evicted '
    + 'by nearer landmarks exactly where settlements are densest — i.e. anywhere '
    + 'you would actually buy property');
  // prove the slice really does drop things, so the check above means something
  C.MINIMAP._cache = null;
  const vis = C.minimapVisible(42, 49);
  t(vis.length <= C.MINIMAP.maxPOI && C.minimapPOIs().length > C.MINIMAP.maxPOI,
    `  · demonstrated: ${C.minimapPOIs().length} POIs in the world, `
    + `${vis.length} survive the slice at Malezor centre`);
}

// ★ and the star is genuinely drawn
{
  CALLS.arc = 0; CALLS.fillText = [];
  C.game.scene = 'overworld';
  C.player.minimapHidden = false;
  C.player.x = 22; C.player.y = 106;             // stand on the Malezor room
  C.MINIMAP._cache = null;
  try { C.drawMinimap(); } catch (e) { no('drawMinimap threw · ' + e.message); }
  t(CALLS.fillText.includes('RIZER ROOM'),
    '★★ standing beside an owned home, the map paints its label · driven through '
    + 'the real draw call, not asserted from the source');
}
t(/MINIMAP_KIND_COLOR\.home/.test(H) && /home:'#c77dff'/.test(H),
  '★ purple · #c77dff, distinct from the cave purple #c060ff it sits next to');
t(/function _mmStar/.test(H) && /_mmStar\(g, x, y/.test(H),
  '★ a five-point STAR, not a circle · every other blip on this map is an arc, '
  + 'so shape is what makes "that one is mine" readable at 6px');
// ★ ABSENCE CHECKED IN CODE, NOT PROSE (the trap that has bitten four suites here)
{
  const CODE = H.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
  t(!/player\.items\.coins = coins - price/.test(CODE),
    '★★ the old inline debit is gone from the CODE · comments stripped first, '
    + 'because the comment explaining the fix quotes the line it removed');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
