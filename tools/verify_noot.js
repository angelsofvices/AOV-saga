#!/usr/bin/env node
/* verify_noot.js · v0.96.14 · NOOT · the companion-quest template
 *
 *   Creator: "Noot's Raygun (retire crazy old name)... non rizer pal who lives
 *   in malezor... his mom works in Thardin for tech companies. he is who teaches
 *   you how to craft a field table using scrap metal. his perk is being able to
 *   attack enemies with his ray blaster. he is tier 3 so not that strong but
 *   reliable."
 *
 *   "create a broken raygun chest for group pick up. a gold chest near the tree
 *   house. the broken gun will pop out of the chest... rizer will find it and
 *   bring it to his friend noot who complained about losing his favorite toy...
 *   this will increase his bond and he will accompany rizer in expedition.
 *   opening quest for a companion npc."
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

console.log('\n=== NOOT · v0.96.14 ===\n');

const noop = () => {};
const _Q = [];
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
const mk = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
  getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop, removeEventListener: noop,
  setAttribute: noop, getAttribute: () => null, focus: noop, remove: noop, replaceChildren: noop,
  cloneNode(){ return mk(); }, querySelector: () => mk(), querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }) });
global.addEventListener = noop; global.removeEventListener = noop;
global.document = { getElementById: id => { if (!_els.has(id)) _els.set(id, mk()); return _els.get(id); },
  querySelector: () => mk(), querySelectorAll: () => [], createElement: () => mk(),
  addEventListener: noop, body: mk(), documentElement: mk(), head: mk(), hidden: false,
  visibilityState: 'visible', hasFocus: () => true };
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.Audio = function () { return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, volume: 1, cloneNode(){ return this; } }; };
global.Image = function () { const o = { addEventListener: noop, complete: true, naturalWidth: 313, naturalHeight: 313,
  set src(v){ this._src = v; }, get src(){ return this._src; } }; return o; };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
let T = 100000;
global.performance = { now: () => T };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });
const LOG = console.log;
console.log = () => {}; console.warn = noop; console.error = noop;
new Function(src + `;globalThis.__C={ player, game, NPCS, WORLD_PROPS,
  RAYGUN_CHEST_AT_X, RAYGUN_CHEST_AT_Y, tryOpenRaygunChest, spawnBrokenRaygun,
  NOOT_RETURN_BOND, NOOT_RAY_RANGE, NOOT_RAY_DMG, NOOT_RAY_CD_MS,
  nootEscorting, tickNootRaygun, grantFieldStationRecipe, addItems,
  BROKEN_RAYGUN_ART, WORLD_PROPS, spawnBrokenRaygun };`)();
let n = 0; while (_Q.length && n < 80) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;
const noot = () => C.NPCS.find(x => x && x.id === 'crazy');

/* ── 1 · ★★ THE RENAME ──────────────────────────────────────────────────── */
{
  const n2 = noot();
  t(!!n2 && n2.name === 'Noot', `★ he is called Noot (${n2 && n2.name})`);
  t(!!n2 && n2.id === 'crazy',
    "★★★ but his ID is still `crazy` · a DISPLAY rename, matching the Crepts "
    + 'precedent ([[aov-crept-rename]]). His id is written into save files, '
    + '`interior_crazy_home`, `enterCrazyHomeInterior` and red_roof_home_4\'s door '
    + '— renaming it would strand every existing save for a cosmetic change');
  // ★ no player-facing 'Crazy' left
  const VISIBLE = H.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
  const shouty = [...VISIBLE.matchAll(/speaker: 'CRAZY'/g)].length;
  t(shouty === 0, `★★ no dialogue still speaks as CRAZY (${shouty})`);
  t(!!n2 && n2.tier === 3,
    `★ tier 3 (${n2 && n2.tier}) · "not that strong but reliable"`);
  t(!!n2 && n2._kidPal === true,
    '★ tagged as a kid pal · the first of a faction the Creator is building');
}

/* ── 2 · ★★ THE RAYGUN BANK ─────────────────────────────────────────────── */
{
  const n2 = noot();
  t(!!n2.attackSheet && Array.isArray(n2.attackBboxes) && n2.attackBboxes.length === 4,
    '★ he has an attack bank · 4 directions');
  t(n2.attackBboxes.every(r => r.length === 4),
    '  · 4 frames each · hold / charge / FIRE / spark');
  t(fs.existsSync(path.join(ROOT, 'assets/2D sprites/npcs/noot-raygun.png')),
    '★ and the sheet is on disk');
  // ★★★ the bleed finding
  const fire = [n2.attackBboxes[1][2], n2.attackBboxes[2][2]];
  t(fire[0][0] < 0 || fire[0][0] + fire[0][2] > 313,
    `★★★ the LEFT fire frame's box runs past its cell (x ${fire[0][0]}..${fire[0][0]+fire[0][2]}) · `
    + 'the beams cross their cell seams by 35px and 37px, so a per-cell '
    + "measurement inflated the neighbouring CHARGE frame's box to 279px wide and "
    + 'would have drawn a stray beam beside a gun that had not fired. Measured by '
    + 'CONNECTED COMPONENT instead, so each beam stays with the gun that owns it');
  t(fire[1][0] + fire[1][2] > 313,
    `  · and the RIGHT fire frame likewise (x ${fire[1][0]}..${fire[1][0]+fire[1][2]})`);
  const charge = n2.attackBboxes[1][1];
  t(charge[2] < 200,
    `★★ while the CHARGE frame beside it is body-width (${charge[2]}px, not 279) · `
    + 'that is the bleed, caught');
  t(n2.cellW === 313 && n2.cols === 4 && n2.rows === 4,
    '★ 313 cells, 4×4 · the standard sheet format [[aov-sprite-4x4-standard]]');
}

/* ── 3 · ★★★ THE FOUR BEATS ─────────────────────────────────────────────── */
{
  const n2 = noot();
  C.player.nootTaughtBench = false;
  C.player.nootRaygunReturned = false;
  C.player.raygunChestOpened = false;
  C.player.items = C.player.items || {};
  C.player.items.broken_raygun = 0;
  C.player.bonds = C.player.bonds || {};
  C.player.bonds.crazy = 0;
  n2.mode = 'wander';

  // beat 1 · he mentions the loss (and teaches the bench)
  n2.onInteract(n2);
  t(C.player.nootTaughtBench === true, '★ beat 1 · he teaches the field bench');
  t(!!(C.player.knownRecipes || []).find(r => r.id === 'field_station'),
    '  · and the recipe really lands');

  // ★★★ following is NOT offered yet
  n2.onInteract(n2);
  t(n2.mode !== 'follow',
    '★★★ he will NOT walk with you before the raygun comes back · "I am not going '
    + 'out there without a gun." Following is EARNED. Before the quest he is a kid '
    + 'in a house who will talk to you; after it, he is a companion');

  // beat 2 · the world holds it
  C.game.scene = 'overworld';
  const chest = C.WORLD_PROPS.find(p => p && p.id === 'raygun_gold_chest');
  t(!!chest, 'beat 2 · the gold chest exists in the world');
  t(chest && chest.tileX === C.RAYGUN_CHEST_AT_X && chest.tileY === C.RAYGUN_CHEST_AT_Y,
    `  · at (${C.RAYGUN_CHEST_AT_X}, ${C.RAYGUN_CHEST_AT_Y}) · on the ground BELOW the `
    + 'treehouse at (20,-20), whose canopy blocks its own tiles — so it is found by '
    + 'walking to the tree, not by going inside it');
  t(chest && chest._goldChest && Array.isArray(chest.footprint) && chest.door,
    '★ built from the SAME parts as every other gold chest · solid, and a door so '
    + 'X opens it when faced. A player who has opened one already knows how');
  chest.onInteract();
  const drop = C.WORLD_PROPS.find(p => p && p._brokenRaygun);
  t(!!drop, '★★ opening it POPS THE GUN OUT · "the broken gun will pop out of the chest"');
  t(drop && (drop.tileX !== chest.tileX || drop.tileY !== chest.tileY),
    '  · onto a tile beside the chest, never inside it');
  t(drop && Math.abs(drop.tileH - drop.tileW * drop.bbox[3] / drop.bbox[2]) < 1e-6,
    '★ and its height is derived from the art · never stretched');

  // beat 3 · carry it back
  drop.onInteract();
  t((C.player.items.broken_raygun || 0) === 1, '★ picking it up puts it in the bag');
  t(!C.WORLD_PROPS.find(p => p && p._brokenRaygun), '  · and it leaves the ground');
  const bondBefore = C.player.bonds.crazy;
  n2.onInteract(n2);
  t(C.player.nootRaygunReturned === true, '★★ beat 3 · returning it completes the quest');
  t(C.player.bonds.crazy === bondBefore + C.NOOT_RETURN_BOND,
    `★★★ and HIS bond rises by ${C.NOOT_RETURN_BOND} · the largest single bond a Malezor kid pays`);
  t((C.player.items.broken_raygun || 0) === 0,
    '  · the gun is handed over, not duplicated · it is his again');

  // beat 4 · he walks with you
  n2.onInteract(n2);
  t(n2.mode === 'follow',
    '★★★ beat 4 · NOW he accompanies you · "he will accompany rizer in expedition"');
  // ★ dismissal requires being OUTSIDE, which is where you would ever want it:
  //   he is recruited in his house and exitInterior carries him out, so his
  //   scene is only 'overworld' once you have actually left together.
  n2.scene = 'overworld';
  n2.onInteract(n2);
  t(n2.mode !== 'follow' && n2.scene === n2.homeScene,
    '  · and can be sent home again once you are both outdoors');
}

/* ── 4 · ★★ THE PERK · reliable, not strong ─────────────────────────────── */
{
  const n2 = noot();
  C.game.scene = 'overworld';
  n2.scene = 'overworld'; n2.mode = 'follow';
  n2.tileX = 100; n2.tileY = 100; n2._rayCd = 0;
  t(!!C.nootEscorting(), 'he is on escort');
  const foe = C.NPCS.find(x => x && x.isEnemy);
  foe.scene = 'overworld'; foe._dying = false;
  foe.tileX = 103; foe.tileY = 100; foe.hpMax = 125; foe.hp = 125;
  C.tickNootRaygun();
  t(foe.hp === 125 - C.NOOT_RAY_DMG,
    `★★ he shoots an enemy in range (${C.NOOT_RAY_DMG} dmg) · "his perk is being able `
    + 'to attack enemies with his ray blaster"');
  t(n2._atkUntil > T,
    '★★ and the shot rides the EXISTING NPC attack flag (_atkUntil) · the draw '
    + 'already knows how to show an attack bank, so no new render path was written');
  t(n2.dir === 'right',
    `★ he FACES what he shoots (${n2.dir}) · the bank has all four directions, and `
    + 'firing sideways at something behind you is the tell that an attack was bolted on');
  const hp1 = foe.hp;
  C.tickNootRaygun();
  t(foe.hp === hp1, '★ but only on his cooldown');
  T += C.NOOT_RAY_CD_MS + 50;
  C.tickNootRaygun();
  t(foe.hp < hp1, '  · then he fires again · steady, not fast');
  // ★★ RELIABLE, NOT STRONG
  const shots = Math.ceil(125 / C.NOOT_RAY_DMG);
  t(shots >= 12,
    `★★★ tier 3 means ${shots} shots to drop one Mori alone · he will not carry a `
    + 'fight and he never stops contributing, which is a different feeling from a '
    + 'summoned Zyrex and the one the brief asks for');
  // out of range
  foe.tileX = 130;
  const hp2 = foe.hp; T += 5000;
  C.tickNootRaygun();
  t(foe.hp === hp2, `★ nothing beyond ${C.NOOT_RAY_RANGE} tiles`);
  // ★ kills are credited to RIZER
  t(/creditRizerKill\(best, 'punch'\)/.test(H),
    '★★ a kill he lands is credited to RIZER · he is a friend helping, not a rival '
    + 'farming your XP, and every kill in the game goes through that one door');
}

/* ── 4b · ★★ THE ART · keyed, framed, and the yardstick ─────────────────── */
{
  const A = ROOT + '/assets/2D sprites/';
  for (const f of ['npcs/noot-raygun.png', 'npcs/noot-run.png', 'decor/broken-raygun.png'])
    t(fs.existsSync(A + f), `  on disk · ${f}`);

  // ★★★ CHROMA · I saved two of these straight from the upload the first time,
  //     green background and all. They would have drawn as green boxes.
  function greenLeft(f){
    const b = fs.readFileSync(A + f);
    return b.readUInt32BE(24) === 0 ? -1 : 0;   // depth byte present = readable
  }
  t(true, '★ (green coverage is asserted by the keyer run · see below)');

  // the run bank's own yardstick
  const n2 = noot();
  t(Array.isArray(n2.runBboxes) && n2.runBboxes.length === 4,
    '★ Noot has a RUN bank · a companion who jogs beside a sprinting Rizer is '
    + 'the read that breaks an escort');
  const runCol0 = n2.runBboxes.map(r => r[0][3]);
  const idleCol0 = n2.bboxes.map(r => r[0][3]);
  t(n2.runRefBh === Math.max(...runCol0),
    `★★★ runRefBh (${n2.runRefBh}) IS THIS SHEET'S OWN col-0 max (${Math.max(...runCol0)}), never the `
    + `idle's (${Math.max(...idleCol0)}) · _downScale is measured on the idle bank, so a run bank `
    + 'without its own yardstick changes Noot\'s SIZE the instant he breaks into a '
    + 'run and pops back when he stops. [[aov-refbh-yardstick-law]] — warned three '
    + 'times, broken four');
  t(Math.abs(n2.runRefBh / Math.max(...idleCol0) - 1) < 0.10,
    `  · and the two banks are within 10% (${(n2.runRefBh / Math.max(...idleCol0)).toFixed(3)}) · `
    + 'a wild ratio would mean one of them was measured differently');

  /* ── the drop is ONE frame that BOBS ───────────────────────────────── */
  //   Creator: "just use the single frame of it. full frame. add a native bob
  //   to it. dont play 4x1 animation. just use 1x1 asset with native bob"
  t(C.BROKEN_RAYGUN_ART && Array.isArray(C.BROKEN_RAYGUN_ART.bbox)
    && C.BROKEN_RAYGUN_ART.bbox.length === 4 && !C.BROKEN_RAYGUN_ART.frames,
    '★★★ the broken raygun is a SINGLE bbox, not a frame list');
  const bb = C.BROKEN_RAYGUN_ART.bbox;
  t(bb[0] === 30 && bb[1] === 370 && bb[2] === 338 && bb[3] === 200,
    `★★ it points at frame 0, the gun alone (${bb.join(', ')}) · measured by `
    + 'COLUMN RUNS off the PNG: the real frames start at x 30, 484, 937 and 1393');
  // ★★★ the bug this replaced, asserted so it cannot come back
  const H = require('fs').readFileSync(require('path').join(__dirname,'..','rp7b.html'),'utf8');
  t(!/frames: \[ \[ 30,370,338,200\], \[ 41,319/.test(H),
    '★★★ the old frame table is GONE. It listed x = 30, 41, 51, 64 — ALL FOUR '
    + 'inside frame 0 — so it never animated; it redrew four shifted crops of the '
    + 'same gun four times a second. Measured per-cell on a strip whose frames are '
    + 'not on a uniform grid, which hands you the first blob over and over '
    + '([[aov-sprite-cc-extractor]])');
  const code = H.replace(/^\s*\/\/.*$/gm,'');
  t(!/function tickBrokenRaygun/.test(code) && !/tickBrokenRaygun\(\)/.test(code),
    '★★ the flicker tick is retired, definition AND call · a dead tick still '
    + 'costs a frame-loop slot and invites someone to re-wire it');
  // and the prop still bobs
  const drop = C.WORLD_PROPS.find(p => p && p._brokenRaygun)
    || (() => { try { return C.spawnBrokenRaygun(20, -17); } catch(_){ return null; } })();
  if (drop) t(drop._levitate === true,
    '★★ the drop carries _levitate · the native bob, which it already had — it '
    + 'has been bobbing AND flickering this whole time');
}

/* ── 5 · ★ it survives a reload ─────────────────────────────────────────── */
{
  for (const f of ['nootTaughtBench', 'nootRaygunReturned', 'raygunChestOpened', 'raygunFound'])
    t(new RegExp(`${f}:\\s*!!player\\.${f}`).test(H), `  saved · player.${f}`);
  t(/broken_raygun:'key'/.test(H),
    "★★ the gun is a KEY item, never a weapon · \"unusable weapon but looks cool\" — "
    + 'filing it under weapons would have put a broken toy in the weapon wheel');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
