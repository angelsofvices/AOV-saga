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
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [],
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
  handleHomeBuyConfirmKey, tryPurchaseHome, ownedHomePins, invalidateHomePins,
  drawMinimap, minimapPOIs, minimapVisible, MINIMAP, isPurchasableHomeId, homePriceAt };`)();
let n = 0;
while (_Q.length && n < 60) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;

/* ── 1 · ★★★ THE SPEND IS NO LONGER SILENT ──────────────────────────────── */
// ★★ Find a house that REALLY ROUTES to the purchase path, by reading the
// prop's own onInteract source — not merely one that isPurchasableHomeId()
// tolerates. Asking the guard instead handed back `oatheus_cave`: that filter
// is a deny-list, and passing it is not the same as being a house. (The regex
// was hardened in the same patch; the test still should not have trusted it.)
const house = C.WORLD_PROPS.find(p => p && p.id && p.tileX != null
  && typeof p.onInteract === 'function' && /tryPurchaseHome/.test(p.onInteract.toString()));
t(!!house, `a really-purchasable home exists in the world to test against (${house && house.id})`);
t(!C.isPurchasableHomeId('oatheus_cave') && !C.isPurchasableHomeId('rakoron_cave'),
  "★★ and a Gemlord's cave is NOT for sale · the deny-list said it was, offering "
  + 'the Tenth Gemlord\'s sanctum as a 5,000-coin starter home. No door routed a '
  + 'cave into the purchase path, so nothing was buyable in play — but this list '
  + 'exists to survive the copy-paste that would, and it did not');

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
  C.tryPurchaseHome(house.id, house.tileX, house.tileY);
  const price = C.homeBuyConfirm.price;
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

/* ── 2 · the dispatch actually reaches it ───────────────────────────────── */
t(/if \(handleHomeBuyConfirmKey\(k\)\)\{ e\.preventDefault\(\); return; \}/.test(H),
  '★ the handler is wired into the keydown dispatch · a confirm nobody calls is a '
  + 'dead overlay, and the function alone would have passed every test above');
t(/id="homeBuyConfirm"/.test(H), 'the overlay markup exists');
// ★ SCOPE THE ORDERING CHECK TO THE DISPATCH. A bare indexOf found the FUNCTION
// DEFINITION (`function handleHomeBuyConfirmKey(k){`), which sits 13,000 lines
// above the call site, and reported the priority backwards. Same trap that bit
// the ZyPhone suite twice: an identifier that occurs more than once.
{
  const i = H.indexOf('if (handleNewGameConfirmKey(k)){');
  const win = H.slice(i, i + 400);
  t(/handleNewGameConfirmKey\(k\)[\s\S]*handleHomeBuyConfirmKey\(k\)/.test(win),
    '  · dispatched in the same priority band as the other confirm, immediately after it');
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
