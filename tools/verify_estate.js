#!/usr/bin/env node
/* verify_estate.js · v0.96.5 · THE ESTATE + MOBILE RIZER HQ
 *
 *   Creator: "rizer should gain rxp for buying properties scale by how many he
 *   owns in per district. he will gain district unlocks the more houses he
 *   buys. he will be able to relocate his faction and have them defend the
 *   house."
 *   "make it so that your bond level grows with a particular contact when u buy
 *   them a new house to defend."
 *   "npcs will take their native home position function with them when you
 *   assign them to a new house."
 *   "first the cell tower must be up in that town. then you must purchase home.
 *   then you can summon npcs allies to guard that home."
 *   "when scrapjaw is with you... he will basically loot everything for you."
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

console.log('\n=== ESTATE · MOBILE HQ · GUARDS · SCRAPJAW · v0.96.5 ===\n');

/* ── headless shell ─────────────────────────────────────────────────────── */
const noop = () => {};
const _Q = [], KEYDOWN = [];
global.setInterval = () => 0;
global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: (_, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop: noop });
  if (k === 'getImageData') return () => ({ data: [], width: 0, height: 0 });
  if (k === 'canvas') return { width: 960, height: 540 };
  return () => {};
} });
const _els = new Map();
const mk = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
  getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop, removeEventListener: noop,
  setAttribute: noop, getAttribute: () => null, focus: noop, remove: noop, replaceChildren: noop,
  insertBefore: noop, contains: () => false, closest: () => null, cloneNode(){ return mk(); },
  play: () => Promise.resolve(), pause: noop, querySelector: () => mk(), querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }) });
const elFor = id => { if (!_els.has(id)) _els.set(id, mk()); return _els.get(id); };
global.addEventListener = (ty, fn) => { if (ty === 'keydown' && typeof fn === 'function') KEYDOWN.push(fn); };
global.removeEventListener = noop;
global.document = { getElementById: elFor, querySelector: () => mk(), querySelectorAll: () => [],
  createElement: () => mk(), addEventListener: noop, body: mk(), documentElement: mk(), head: mk(),
  hidden: false, visibilityState: 'visible', hasFocus: () => true };
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.Audio = function () { return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, volume: 1, currentTime: 0, cloneNode(){ return Object.assign({}, this); } }; };
global.Image = function () { return { addEventListener: noop, complete: true, naturalWidth: 1254, src: '' }; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
let T = 1000;
global.performance = { now: () => T };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

const LOG = console.log;
console.log = () => {}; console.warn = noop; console.error = noop;
new Function(src + `;globalThis.__C={ player, game, NPCS, WORLD_PROPS, GEM_ENTITIES,
  homesOwnedIn, homesForSaleIn, homePurchaseRxp, DISTRICT_ESTATE_TIERS, estateTier,
  estateHas, guardPostsAllowed, districtShopDiscount, creditHomePurchase,
  HQ_FUNCTIONS, hqPerksFor, homeResident, residentHomeOf, hqServicesIn, hqHasService,
  assignResidentToHome, HQ_HOUSING_BOND, hqChainStatus, guardPostTiles, homeGuards,
  assignGuardToHome, dismissGuard, guardBondFromKill, tickEscortBond,
  scrapjawEscorting, tickScrapjawLoot, SCRAP_LOOT_RANGE, _formationTile,
  hqHomeIdForScene, hqCandidates, openHqPanel, handleHqPanelKey, _homeIdDoorTile,
  purchasableHomeIds, districtAt, towerRestored, isPurchasableHomeId,
  get hqPanel(){return hqPanel}, set hqPanel(v){hqPanel=v},
  DISTRICT_ORDER, GUARD_BOND_RADIUS };`)();
let n = 0;
while (_Q.length && n < 80) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;
C.game.scene = 'overworld';

/* ── helper · every home in a district, by real door tile ───────────────── */
const homesIn = (dist) => [...C.purchasableHomeIds()].filter(id => {
  const p = C._homeIdDoorTile(id);
  return p && C.districtAt(p.x, p.y) === dist;
});
const MAL = homesIn('malezor');

/* ── 1 · ★★ RXP SCALES WITH HOLDINGS ────────────────────────────────────── */
{
  t(MAL.length >= 5, `Malezor has ${MAL.length} homes to buy · enough to walk the tier ladder`);
  const a = C.homePurchaseRxp('malezor', 1), b = C.homePurchaseRxp('malezor', 2), e = C.homePurchaseRxp('malezor', 5);
  t(b > a && e > b,
    `★★ each home in a district pays more than the last (${a} → ${b} → ${e} R.XP) · `
    + '"scale by how many he owns per district" · this is what makes finishing a '
    + 'district worth more than one house in each of ten');
  const kor = C.homePurchaseRxp('korathen', 1), mal = C.homePurchaseRxp('malezor', 1);
  t(kor > mal,
    `★ and a later district pays more per home (Korathen ${kor} vs Malezor ${mal})`);
  t(C.homePurchaseRxp('korathen', 9) < 6000,
    `★ but district rank rides at HALF weight · a Korathen ninth home is `
    + `${C.homePurchaseRxp('korathen', 9)} R.XP. At full weight it was 10,800 — more `
    + 'than the whole Malezor arc pays, for buying a house');
}

/* ── 2 · ★★ TIERS UNLOCK INSIDE THE DISTRICT, NOT THE ROAD OUT ──────────── */
{
  C.player.ownedHomes = [];
  t(C.estateTier('malezor') === null && C.guardPostsAllowed('malezor') === 0,
    'with no property there is no tier and no guard post');
  const seen = [];
  for (let i = 0; i < 5 && i < MAL.length; i++){
    C.player.ownedHomes.push(MAL[i]);
    const T2 = C.estateTier('malezor');
    seen.push(`${i + 1}:${T2 ? T2.key : '-'}`);
  }
  t(seen.join(' ') === '1:resident 2:landlord 3:magnate 4:magnate 5:holding',
    `★ the ladder climbs with holdings · ${seen.join(' ')}`);
  t(C.guardPostsAllowed('malezor') === 6,
    `★ DISTRICT HOLDING opens 6 perimeter posts (${C.guardPostsAllowed('malezor')})`);
  t(C.districtShopDiscount('malezor') === 0.20,
    '★ and 20% off the district’s shops');
  // ★★★ THE ONE THING PROPERTY MUST NOT DO
  const CODE = H.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
  const gateFn = CODE.slice(CODE.indexOf('function districtRoadOpen'), CODE.indexOf('function districtRoadOpen') + 400);
  t(!/homesOwnedIn|estateTier|estateHas|ownedHomes/.test(gateFn),
    '★★★ districtRoadOpen() does NOT consult property · the soft gate stays the '
    + 'only progression spine, so nobody buys past the commander fight the story '
    + 'was written around. Perks live INSIDE a district; the road out is earned');
}

/* ── 3 · ★★ THE PURCHASE CREDIT ─────────────────────────────────────────── */
{
  C.player.ownedHomes = [MAL[0]];
  C.player.estateTier = {};
  C.player.rizerLvl = 20; C.player.rizerXP = 0; C.player.rizerXPMax = 999999;
  C.player.hasBackpack = true;
  const d = C._homeIdDoorTile(MAL[0]);
  const before = C.player.rizerXP;
  const paid = C.creditHomePurchase(MAL[0], d.x, d.y);
  t(paid > 0, `★ buying a home pays R.XP (${paid})`);
  t(C.player.rizerXP > before || C.player.rizerLvl > 20, '  · and it actually lands on the Rizer');
  t(C.player.estateTier.malezor === 'resident',
    '★ and the tier it reached is remembered, so the unlock toast fires ONCE '
    + 'rather than on every later purchase');
}

/* ── 4 · ★★★ THE MOBILE HQ · ids are REAL ───────────────────────────────── */
{
  const ghosts = Object.keys(C.HQ_FUNCTIONS).filter(id => !C.NPCS.some(n => n && n.id === id));
  t(ghosts.length === 0,
    `★★★ every HQ_FUNCTIONS key is a REAL NPC id (${Object.keys(C.HQ_FUNCTIONS).length} contacts) · `
    + (ghosts.length ? `INVENTED: ${ghosts.join(', ')}` : 'none invented')
    + ' — an invented id here is a service that silently never appears, which is '
    + 'exactly how seven identifiers got into this file before');
  // ★★ and the premise of the whole feature, measured
  const native = Object.keys(C.HQ_FUNCTIONS).map(id => {
    const n = C.NPCS.find(x => x && x.id === id);
    return n ? C.districtAt(n.tileX, n.tileY) : null;
  });
  const inMalezor = native.filter(d => d === 'malezor').length;
  t(inMalezor >= Object.keys(C.HQ_FUNCTIONS).length - 1,
    `★★ ${inMalezor} of ${native.length} service contacts natively live in MALEZOR · `
    + 'that is the reason this system exists: walking into Korathen means walking '
    + 'eight districts away from every service you have');
}

/* ── 5 · ★★ HOUSING A CONTACT · bond, relocation, exported function ─────── */
{
  C.player.ownedHomes = MAL.slice(0, 3);       // landlord
  C.player.homeResidents = {}; C.player.bonds = {};
  const home = MAL[0];
  const nurse = C.NPCS.find(n => n && n.id === 'nurse_rein');
  const wasAt = [nurse.tileX, nurse.tileY];
  const r = C.assignResidentToHome(home, 'nurse_rein');
  t(r.ok, `★ Nurse Rein moves in (${r.ok ? r.service : r.why})`);
  t(C.player.bonds.nurse_rein === C.HQ_HOUSING_BOND,
    `★★★ HER bond rises, not a generic pool (+${C.HQ_HOUSING_BOND}) · "your bond level `
    + 'grows with a particular contact when u buy them a new house"');
  t(nurse.tileX !== wasAt[0] || nurse.tileY !== wasAt[1],
    '★★ and the NPC PHYSICALLY MOVES to the doorstep · the function travels '
    + 'because the person does, which is the whole conceit');
  t(Array.isArray(nurse._nativeAt) && nurse._nativeAt[0] === wasAt[0],
    '★ her native position is remembered · a relocation must be reversible');
  t(C.hqHasService('malezor', 'infirmary'),
    '★ the district now HAS an infirmary · queryable by the rest of the game');
  // second house pays no second bond
  const b1 = C.player.bonds.nurse_rein;
  C.assignResidentToHome(MAL[1], 'nurse_rein');
  t(C.player.bonds.nurse_rein === b1,
    '★★ moving her to a second house pays NOTHING · the gift is being housed, '
    + 'not being shuffled, and a re-assign loop would otherwise be a bond farm');
  t(C.homeResident(MAL[0]) === null && C.homeResident(MAL[1]) === 'nurse_rein',
    '  · and she vacates the first · one contact, one home');
  // bond gates the perks
  C.player.bonds.nurse_rein = 10;
  const low = C.hqPerksFor('nurse_rein').length;
  C.player.bonds.nurse_rein = 100;
  const high = C.hqPerksFor('nurse_rein').length;
  t(high > low,
    `★★ "the higher an npc bond with rizer, the more mobile Rizer HQ perks they `
    + `can grant him" · ${low} perk at bond 10, ${high} at bond 100`);
}

/* ── 6 · ★★★ THE THREE-STEP CHAIN ───────────────────────────────────────── */
{
  const ZAR = homesIn('zarvane');
  t(ZAR.length >= 2, `Zarvane has ${ZAR.length} homes · enough to test the chain`);
  C.player.scrapjawTowersRestored = {};
  C.player.radioTowerFixed = false;
  C.player.ownedHomes = ZAR.slice(0, 3);
  const g1 = C.hqChainStatus(ZAR[0]);
  t(!g1.ok && g1.step === 1 && /tower/i.test(g1.why),
    `★★★ STEP 1 · no tower, no station ("${g1.why}") · "first the cell tower must `
    + 'be up in that town"');
  C.player.scrapjawTowersRestored.zarvane = true;
  C.player.ownedHomes = [];
  const g2 = C.hqChainStatus(ZAR[0]);
  t(!g2.ok && g2.step === 2,
    `★★ STEP 2 · tower up but no deed ("${g2.why}")`);
  C.player.ownedHomes = [ZAR[0]];
  const g3 = C.hqChainStatus(ZAR[0]);
  t(!g3.ok && g3.step === 3,
    `★★ STEP 3 · one home is RESIDENT, not LANDLORD ("${g3.why}") · posts open at two`);
  C.player.ownedHomes = ZAR.slice(0, 2);
  const g4 = C.hqChainStatus(ZAR[0]);
  t(g4.ok && g4.posts >= 1, `★★★ STEP 4 · the chain completes · ${g4.posts} posts open`);
}

/* ── 7 · ★★ GUARDS HOLD THE PERIMETER ───────────────────────────────────── */
{
  const ZAR = homesIn('zarvane');
  C.player.homeGuards = {};
  const home = ZAR[0];
  const door = C._homeIdDoorTile(home);
  const posts = C.guardPostTiles(home);
  t(posts.length > 0 && posts.every(([x, y]) => Math.max(Math.abs(x - door.x), Math.abs(y - door.y)) === 3),
    `★ ${posts.length} posts, all on a ring 3 tiles out from the door · a perimeter, not a huddle`);
  const r = C.assignGuardToHome(home, 'kelthor');
  t(r.ok, `★ Kelthor takes a post (${r.ok ? `${r.filled}/${r.of}` : r.why})`);
  const kel = C.NPCS.find(n => n && n.id === 'kelthor');
  t(kel._guardPost && kel.tileX === r.post[0] && kel.tileY === r.post[1],
    '★ and he is standing on it');
  // ★★★ the movement reuse
  const ft = C._formationTile(kel);
  t(ft[0] === r.post[0] && ft[1] === r.post[1],
    '★★★ _formationTile() returns his POST · the whole existing follow/avoid/walk '
    + 'stack now drives the guard for free — he walks there, routes round walls, '
    + 'and returns after a chase, using the code that already keeps a summon '
    + 'behind Rizer. No second movement mode was written');
  const dup = C.assignGuardToHome(home, 'kelthor');
  t(!dup.ok, `  · and he cannot take two posts (${dup.why})`);
  // overfill
  let filled = 1;
  for (const cand of ['nurse_rein', 'kaizari', 'scrapjaw', 'auraxion', 'albert_orren', 'zurelea', 'omniris'])
    if (C.assignGuardToHome(home, cand).ok) filled++;
  t(filled === posts.length,
    `★★ exactly ${posts.length} bodies fit ${posts.length} posts · the district's tier `
    + 'is the cap, so a guard wall is bought, not farmed');
  const before = C.NPCS.find(n => n && n.id === 'kelthor')._nativeAt;
  C.dismissGuard(home, 'kelthor');
  t(!kel._guardPost && kel.tileX === before[0] && kel.tileY === before[1],
    '★★ dismissing sends him HOME, not to (0,0) · _nativeAt was recorded the '
    + 'first time he was ever moved, precisely so this is reversible');
}

/* ── 8 · ★★ BOND EARNED IN THE FIELD ────────────────────────────────────── */
{
  const kai = C.NPCS.find(n => n && n.id === 'kaizari');
  kai.scene = 'overworld'; kai._guardHome = 'x'; kai._hqBondCd = 0;
  kai.tileX = 100; kai.tileY = 100;
  C.player.bonds.kaizari = 0;
  C.guardBondFromKill({ tileX: 104, tileY: 100 });
  t(C.player.bonds.kaizari > 0,
    `★★ a kill near a posted guard pays THEM (+${C.player.bonds.kaizari}) · "their bond `
    + 'with you goes up over time if you spend time fighting in the area with them"');
  const after = C.player.bonds.kaizari;
  C.guardBondFromKill({ tileX: 104, tileY: 100 });
  t(C.player.bonds.kaizari === after,
    '★★ but not twice inside the cooldown · without it, one crowded fight would '
    + 'max a contact in ten seconds');
  T += 5000;
  C.guardBondFromKill({ tileX: 104, tileY: 100 });
  t(C.player.bonds.kaizari > after, '  · and it resumes once the cooldown passes');
  // out of range
  const far = C.player.bonds.kaizari;
  C.guardBondFromKill({ tileX: 400, tileY: 400 });
  t(C.player.bonds.kaizari === far,
    `★ a kill ${C.GUARD_BOND_RADIUS}+ tiles away pays nobody · "in the area" means in the area`);
  // escort accrual
  const orr = C.NPCS.find(n => n && n.id === 'albert_orren');
  orr.scene = 'overworld'; orr.mode = 'follow'; orr._guardHome = null;
  C.player.x = 200; C.player.y = 200; orr.tileX = 202; orr.tileY = 200;
  C.player.bonds.albert_orren = 0;
  T += 100000; C.tickEscortBond();
  t(C.player.bonds.albert_orren > 0,
    `★★ a companion earns on the road too (+${C.player.bonds.albert_orren}) · "or if they `
    + 'are following you around during ur expedition"');
  orr.tileX = 260;                        // wandered off
  const held = C.player.bonds.albert_orren;
  T += 100000; C.tickEscortBond();
  t(C.player.bonds.albert_orren === held,
    '★ but only while actually WITH you · a follower stuck across the map earns nothing');
}

/* ── 9 · ★★ SCRAPJAW LOOTS ──────────────────────────────────────────────── */
{
  const sj = C.NPCS.find(n => n && n.id === 'scrapjaw');
  sj.scene = 'overworld'; sj.mode = 'wander'; sj._guardHome = null; sj._guardPost = null;
  C.player.x = 300; C.player.y = 300; sj.tileX = 302; sj.tileY = 300;
  t(!C.scrapjawEscorting(), '★ not following · he loots nothing');
  sj.mode = 'follow';
  t(!!C.scrapjawEscorting(), '  · following · he is on the clock');

  // drop a coin pile near Rizer
  C.WORLD_PROPS.push({ id: '_test_coins', tileX: 306, tileY: 300, _pickup: { kind: 'coins', amount: 25 } });
  C.player.items = C.player.items || {}; C.player.items.coins = 0;
  sj._lootTarget = null;
  T += 5000;
  C.tickScrapjawLoot();
  t(sj._lootTarget && sj._lootTarget[0] === 306,
    '★★ he TARGETS the loot rather than vacuuming it · "must walk over to the loot item"');
  const ft = C._formationTile(sj);
  t(ft[0] === 306 && ft[1] === 300,
    '★★★ and the errand drives him through the SAME formation code as a guard post '
    + '— he physically jogs there. A companion that teleports loot into your bag is '
    + 'a toggle; one that walks over and stoops is a character');
  t(C.player.items.coins === 0, '  · nothing collected while he is still walking');
  sj.tileX = 306; sj.tileY = 300;         // he arrives
  C.tickScrapjawLoot();
  t(C.player.items.coins === 25,
    `★★★ standing on it, he hands it over (+${C.player.items.coins} coins)`);
  t(!sj._lootTarget, '  · and clears the errand');
  t(!C.WORLD_PROPS.some(p => p && p.id === '_test_coins'), '  · the pile is gone from the world');

  // ★ solid pickups are the player's to open
  C.WORLD_PROPS.push({ id: '_test_chest', tileX: 305, tileY: 300,
    _pickup: { kind: 'coins', amount: 9 }, footprint: [[0, 0]] });
  sj._lootTarget = null; T += 5000;
  C.tickScrapjawLoot();
  t(!sj._lootTarget,
    '★★ he ignores SOLID pickups · those are X-to-open, and a companion should not '
    + 'open what you must. Same rule collectPickupsAt already enforces for Rizer');
  C.WORLD_PROPS.splice(C.WORLD_PROPS.findIndex(p => p && p.id === '_test_chest'), 1);
}

/* ── 10 · ★★ THE PER-HOME PC ────────────────────────────────────────────── */
{
  t(C.hqHomeIdForScene('interior_rizer_room_zarvane_home_3') === 'zarvane_home_3',
    '★ the scene id names the property · the terminal cannot open the wrong roster');
  t(C.hqHomeIdForScene('overworld') === null && C.hqHomeIdForScene('interior_cave') === null,
    '  · and a non-home scene resolves to nothing');
  t(/const _hqId = hqHomeIdForScene\(game\.scene\);/.test(H)
    && /if \(_hqId && openHqPanel\(_hqId\)\) return;/.test(H),
    '★★ the PC in an owned home opens THAT home’s terminal, and falls through to '
    + 'the Nebuladock panel everywhere else');
  t(/pc:\{name:'Nebuladock PC'/.test(H) && /PURCHASED_HOME_LAYOUT = \{\s*\n\s*pc:/.test(H),
    '★★ and every purchased Rizer Room really HAS a PC · it is in RIZER_ROOM_ITEMS '
    + 'and gets a purchased-home position, so the terminal is reachable rather '
    + 'than theoretical');

  const ZAR = homesIn('zarvane');
  C.player.ownedHomes = ZAR.slice(0, 2);
  C.player.bonds = { kelthor: 40, kaizari: 60 };
  C.player.homeGuards = {}; C.player.homeResidents = {};
  const rows = C.hqCandidates(ZAR[0]);
  t(rows.length >= 2 && rows.every(r => r.bond > 0 || r.isGuard || r.isResident),
    `★★ the terminal lists only people you actually KNOW (${rows.length}) · an unmet `
    + 'NPC in this list would be a roster browser, not a contact book');
  t(rows[0].bond >= rows[rows.length - 1].bond, '  · sorted by bond, closest first');

  C.game.zphoneOpen = false; C.game.paused = false;
  t(C.openHqPanel(ZAR[0]) && !!C.hqPanel, 'the panel opens');
  t(C.handleHqPanelKey('arrowdown') === true && C.hqPanel.idx === 1, '★ arrows move the cursor');
  t(C.handleHqPanelKey('q') === true,
    '★ and it swallows everything else while up · a half-modal leaks movement');
  C.handleHqPanelKey('b');
  t(!C.hqPanel, '★ B closes it');
  t(C.handleHqPanelKey('x') === false, '  · and it consumes nothing once closed');

  // ★★ independence · two homes, two rosters
  C.player.scrapjawTowersRestored = { zarvane: true };
  C.assignGuardToHome(ZAR[0], 'kelthor');
  t(C.homeGuards(ZAR[0]).includes('kelthor') && !C.homeGuards(ZAR[1]).includes('kelthor'),
    '★★★ "each PC will exist independently for that home" · the panel is a VIEW over '
    + 'player.homeGuards[homeId], so there is no per-terminal state to keep in sync '
    + 'and two homes cannot drift apart');

  // ★ freeze safety · this modal owns input, so it must be declared and clearable
  t(/freezeReasons\.push\('hqPanel'\)/.test(H),
    '★★ hqPanel is a declared freeze reason · a modal that owns input and is not on '
    + 'that list is a freeze the watchdog cannot name');
  t(/drop\('hqPanel'/.test(H), '★★ and F10 clears it · every new modal joins the escape hatch');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
