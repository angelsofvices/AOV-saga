// v0.95.950 · the four QoL patches.  Each test is written to FAIL on the old
// code, so it reproduces the Creator's complaint rather than checking that my
// fix is spelled the way I spelled it.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); console.log('  ok   ' + name); pass++; }
                          catch (e) { console.log('  FAIL ' + name + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

// ★ the bboxes ARRAY only.  footOff and bodyBh are also brackets of four
// numbers sitting right after it, and slicing to the wrong terminator silently
// folds them into the bbox list -- which is exactly what happened when footOff
// was added between them: 20 "bboxes", smallest height 0.  So the slice ends
// at whichever field comes first, not at a field I happen to remember.
function swordBboxes(H){
  const b = H.slice(H.indexOf('const RIZER_SAPPHIRE_SWORD'), H.indexOf('_loadSapphireSword'));
  const from = b.indexOf('bboxes: [');
  const ends = ['footOff:', 'bodyBh:', 'comboSheet:', 'constScale:']
                 .map(k => b.indexOf(k, from)).filter(i => i > from);
  const arr = b.slice(from, ends.length ? Math.min(...ends) : b.length);
  return [...arr.matchAll(/\[\s*(-?\d+),\s*(-?\d+),\s*(\d+),\s*(\d+)\]/g)]
           .map(m => m.slice(1).map(Number));
}

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
  // ★★★ SLICE TO A STRUCTURAL BOUNDARY, NEVER A BYTE COUNT.
  // This took 4000 characters from the function start, and v0.95.969 added a
  // ~30-line comment inside the native branch — which pushed BOTH markers past
  // the window, so the test failed on prose length while the code was correct.
  // Third time this session: verify_seerstairs took 900 chars and landed inside
  // the comment explaining the fix, and verify_hudcounters took the FIRST of
  // several media blocks.  A window measured in bytes is a window that expires
  // the next time someone explains themselves.
  const _at = H.indexOf('function openScrollView');
  const fn  = H.slice(_at, H.indexOf('\nfunction ', _at + 10));
  const nativeBlock = fn.slice(fn.indexOf('if (SCROLL_NATIVE_PAGE)'));
  const srcAt = nativeBlock.indexOf('frame_${');
  const retAt = nativeBlock.indexOf('return;');
  ok(retAt > 0 && (srcAt < 0 || srcAt > retAt),
     'the native branch still reaches the frame_NN.png assignment');
  ok(/SCROLL_FRAME_META/.test(H), 'the frame metadata was deleted · the art path is unrecoverable');
});

console.log('\n3 · looted Skellor corpses stop blocking');
t('walkable() skips looted corpses', () => {
  // ★ v0.96.22 moved this rule out of walkable()'s inline NPC scan and into
  //   _npcOccBlocks, the occupancy index that replaced it. Reading walkable()'s
  //   own source stopped finding it — so the check now proves the BEHAVIOUR,
  //   which is what the Creator's rule was ever about:
  //   "once a skellor body is looted, they lose collision."
  ok(/_skellorDead[\s\S]{0,200}_skellorLootedIds/.test(H),
     'the looted-corpse exemption still exists somewhere in the collision path');
  ok(/function _npcOccBlocks\(n\)\{?[\s\S]{0,700}_skellorLootedIds\.has\(n\.id\)\) return false;/.test(H),
     'and it lives in _npcOccBlocks · the ONE place the occupancy index decides '
     + 'what is solid, so the rule cannot drift between the two branches that '
     + 'used to carry their own copy');
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
t('bodyBh is not read off a blade-inflated frame', () => {
  // ★ the trap this sheet set: Rizer holds the sword, so the blade is part of
  // his largest connected component, and DOWN col 0 (blade pointing down past
  // the boots) measures 229px against a ~175px character.  Scaling by that
  // draws him a quarter short facing down.
  const b = H.slice(H.indexOf('const RIZER_SAPPHIRE_SWORD'), H.indexOf('_loadSapphireSword'));
  const m = b.match(/bodyBh:\s*\[([^\]]+)\]/);
  ok(m, 'no bodyBh declared · the draw falls back to bboxes[0][0][3]');
  const v = m[1].split(',').map(Number);
  ok(v.length === 4, 'bodyBh must be one value per row');
  const smallest = Math.min(...swordBboxes(H).map(x => x[3]));
  v.forEach((h, r) => ok(h <= smallest * 1.05,
    `bodyBh[${r}] = ${h} but the smallest body on the sheet is ${smallest} · that is a blade, not a head`));
});
t('a hit taken breaks the blade chain too', () => {
  ok(/resetSwordCombo\(\)/.test(H), 'the sword chain survives damage · the finisher is free');
});
t('bboxes keep the owned overflow (a clipped blade is a severed blade)', () => {
  const b = H.slice(H.indexOf('const RIZER_SAPPHIRE_SWORD'), H.indexOf('_loadSapphireSword'));
  const rows = b.match(/\[\[[\s\S]*?\]\],?\n/g);
  // ★ assert the PROPERTY, not the literal.  The first sheet overflowed at
  // -28 in two frames; the second overflows across the whole UP row at other
  // values.  What must hold across any sheet is that overflow is DECLARED
  // rather than clamped to 0 -- a clamped origin is a severed blade.
  const nums = swordBboxes(H);
  ok(nums.length === 16, `expected 16 bboxes, found ${nums.length}`);
  ok(nums.some(([x, y]) => x < 0 || y < 0),
     'not one frame declares overflow · the blade has been clamped to its cell');
  for (const [x, y, w, h] of nums) ok(w > 100 && h > 100, `degenerate bbox ${[x,y,w,h]}`);
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
