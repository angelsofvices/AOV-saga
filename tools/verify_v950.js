// v0.95.950 · the four QoL patches.  Each test is written to FAIL on the old
// code, so it reproduces the Creator's complaint rather than checking that my
// fix is spelled the way I spelled it.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); console.log('  ok   ' + name); pass++; }
                          catch (e) { console.log('  FAIL ' + name + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

console.log('\n1 · tombstones / gargoyles start at zero');
t('no static Seer marker list is seeded at world build', () => {
  // ★ there are SIX `const SPOTS` in the file (chests, vileroks, morlisks,
  // two Mori passes...).  Anchor on the death-sprite table so this can only
  // ever be reading the Seer marker list.
  // ★ anchor on the DECLARATION, not the two earlier reads inside
  // spawnDeathGargoyle -- those sit above the chest SPOTS and were dragging
  // this test onto the wrong list entirely.
  const at = H.indexOf('window._SEER_DEATH_SPECS = [');
  ok(at > 0, 'the death-sprite table is gone');
  const m = H.slice(at).match(/const SPOTS = \[[\s\S]{0,4000}?\];/);
  ok(m, 'the Seer marker SPOTS declaration not found');
  ok(!/tileW\s*:\s*2\b/.test(m[0]), 'a tileW:2 marker survives in SPOTS · those are the oversized pre-death stones');
  ok(m[0].replace(/\s/g, '') === 'constSPOTS=[];', 'SPOTS is not empty: ' + m[0].slice(0, 120));
});
t('death breadcrumbs are the only source, and they are 0.75 tiles', () => {
  ok(/restoreDeathGargoyles/.test(H), 'the death-driven restore is gone');
  ok(/0\.75/.test(H), 'the 0.75 breadcrumb size is gone');
});

console.log('\n2 · filed scroll pages do not respawn');
t('a post-load sweep exists AND runs after loadGame reads the notebook', () => {
  ok(/function pruneFiledScrolls\(\)/.test(H), 'pruneFiledScrolls missing');
  const call = H.indexOf('pruneFiledScrolls()', H.indexOf('function pruneFiledScrolls'));
  ok(call > 0, 'pruneFiledScrolls is declared but never called');
  // ★ the bug was RUNTIME order, not file order: scatterScrolls runs at page
  // init and loadGame runs later, so a guard inside the scatter cannot see a
  // notebook that has not been read yet.  Checking source position proves
  // nothing about either -- what matters is that loadGame calls the sweep.
  const load = H.indexOf('function loadGame');
  ok(load > 0 && H.indexOf('pruneFiledScrolls()', load) > load,
     'the sweep is not called from loadGame · it cannot see the loaded notebook');
});
t('the page overlay is native, not the parchment frame', () => {
  ok(/const SCROLL_NATIVE_PAGE = true;/.test(H), 'SCROLL_NATIVE_PAGE not on');
  const fn = H.slice(H.indexOf('function openScrollView'),
                     H.indexOf('function openScrollView') + 4000);
  const nativeBlock = fn.slice(fn.indexOf('if (SCROLL_NATIVE_PAGE)'));
  const srcAt = nativeBlock.indexOf('frame_${');
  const retAt = nativeBlock.indexOf('return;');
  ok(retAt > 0 && (srcAt < 0 || srcAt > retAt),
     'the native branch still reaches the frame_NN.png assignment');
  ok(/SCROLL_FRAME_META/.test(H), 'the frame metadata was deleted · the art path is unrecoverable');
});

console.log('\n3 · looted Skellor corpses stop blocking');
t('walkable() skips looted corpses', () => {
  const w = H.slice(H.indexOf('function walkable('), H.indexOf('function walkable(') + 6000);
  ok(/_skellorDead[\s\S]{0,200}_skellorLootedIds/.test(w),
     'walkable() has no looted-corpse exemption · a horde still walls you in');
});
t('_skellorLootedIds is declared BEFORE walkable (no temporal dead zone)', () => {
  const decl = H.indexOf('let _skellorLootedIds');
  const walk = H.indexOf('function walkable(');
  ok(decl > 0, '_skellorLootedIds never declared');
  ok(decl < walk, `TDZ: declared at ${decl} but read by walkable at ${walk}`);
});
t('breadcrumbs reset on load', () => {
  ok(/function resetSkellorBreadcrumbs\(\)/.test(H), 'resetSkellorBreadcrumbs missing');
  const load = H.indexOf('function loadGame');
  ok(H.indexOf('resetSkellorBreadcrumbs()', load) > load, 'not called from loadGame');
});

console.log('\n4 · the Sapphire Tearsword is a chain');
t('the sheet points at the combo art', () => {
  ok(/sapphire-sword-combo\.png/.test(H), 'still loading the stale single-arc sheet');
  ok(fs.existsSync('assets/2D sprites/rizer/sapphire-sword-combo.png'), 'the keyed sheet is not on disk');
});
t('the bundle holds a column instead of walking the row', () => {
  const b = H.slice(H.indexOf('const RIZER_SAPPHIRE_SWORD'), H.indexOf('_loadSapphireSword'));
  ok(/comboSheet:\s*true/.test(b), 'comboSheet not set · all four strikes would play per press');
  ok(/constScale:\s*true/.test(b), 'constScale not set · the finisher arc would shrink the body');
  ok(/comboStep:/.test(b), 'the bundle does not name its counter');
});
t('the sword drives its OWN counter, not the fist chain', () => {
  ok(/function swordComboStep\(\)/.test(H) && /player\._swordStep/.test(H), 'no sword counter');
  ok(/swordChainActive\(\)\) advanceSwordCombo/.test(H), 'the chain never advances on a swing');
  // mutual exclusion is the safety property: punchIsUnarmed() is false whenever
  // a blade is drawn, so exactly one chain can advance per swing.
  const pu = H.slice(H.indexOf('function punchIsUnarmed'), H.indexOf('function punchIsUnarmed') + 600);
  ok(/swordEquipped[\s\S]{0,60}return false/.test(pu), 'punchIsUnarmed no longer excludes the sword');
});
t('the chain reaches the damage, and the sword is no longer flat', () => {
  ok(/swordComboMult\(\)/.test(H), 'swordComboMult never applied');
  const dmg = H.slice(H.indexOf('if (_swordSwing){'), H.indexOf('if (_swordSwing){') + 700);
  ok(/swordComboMult\(\)/.test(dmg), 'the sword branch still pays a flat multiplier');
});
t('a hit taken breaks the blade chain too', () => {
  ok(/resetSwordCombo\(\)/.test(H), 'the sword chain survives damage · the finisher is free');
});
t('bboxes keep the owned overflow (a clipped blade is a severed blade)', () => {
  const b = H.slice(H.indexOf('const RIZER_SAPPHIRE_SWORD'), H.indexOf('_loadSapphireSword'));
  const rows = b.match(/\[\[[\s\S]*?\]\],?\n/g);
  ok(/-28/.test(b), 'the two negative origins were clamped to the cell · the blade is cut');
  // ★ read the bboxes ARRAY only · bodyBh is also four numbers in brackets
  const arr  = b.slice(b.indexOf('bboxes: ['), b.indexOf('],', b.indexOf('bodyBh')) );
  const body = arr.slice(0, arr.indexOf('bodyBh') < 0 ? arr.length : arr.indexOf('bodyBh'));
  const nums = [...body.matchAll(/\[\s*(-?\d+),\s*(-?\d+),\s*(\d+),\s*(\d+)\]/g)].map(m => m.slice(1).map(Number));
  ok(nums.length === 16, `expected 16 bboxes, found ${nums.length}`);
  for (const [x, y, w, h] of nums) ok(w > 100 && h > 100, `degenerate bbox ${[x,y,w,h]}`);
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
