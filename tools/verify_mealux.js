// v0.95.959 · one Key of Mealux per district, re-rolled per playthrough.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const rng = new Function('return ' + H.slice(H.indexOf('function _mealuxRng'),
                                             H.indexOf('// the hand-placed wilds')).trim())();

console.log('\n1 · every district, not a subset');
t('MEALUX_DISTRICTS returns all ten', () => {
  const f = H.slice(H.indexOf('function MEALUX_DISTRICTS'), H.indexOf('function _mealuxTileFor'));
  ok(/ZYRAXIS_DISTRICTS\.slice\(\)/.test(f), 'still striding a subset: ' + f.trim().slice(0, 90));
  ok(!/MEALUX_STRIDE/.test(H), 'the old stride constants survive somewhere');
  const n = (/const ZYRAXIS_DISTRICTS\s*=\s*\[([\s\S]*?)\n\];/.exec(H)[1].match(/\{\s*id:/g) || []).length;
  ok(n === 10, `expected 10 districts, the table has ${n}`);
});
t('Malezor is included now', () => {
  const f = H.slice(H.indexOf('function MEALUX_DISTRICTS'), H.indexOf('function _mealuxTileFor'));
  ok(!/START|\+= ?2|slice\(1\)/.test(f), 'index 0 is still skipped');
});

console.log('\n2 · the layout is per PLAYTHROUGH, not per boot');
t('the seed is part of the tile hash', () => {
  const f = H.slice(H.indexOf('function _mealuxTileFor'), H.indexOf('function _mealuxTileFor') + 300);
  ok(/_mealuxRng\('mealux:' \+ mealuxSeed\(\)/.test(f),
     'the district name alone still seeds it · every save would share one layout');
});
t('one seed always gives the same stream · the Key cannot move mid-playthrough', () => {
  const a = rng('mealux:abc123:veridan'), b = rng('mealux:abc123:veridan');
  const A = Array.from({ length: 20 }, a), B = Array.from({ length: 20 }, b);
  ok(A.every((v, i) => v === B[i]), 'the same seed produced two different streams');
});
t('different seeds diverge · a new game is a new layout', () => {
  const seeds = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6'];
  const firsts = seeds.map(s => rng('mealux:' + s + ':veridan')());
  ok(new Set(firsts).size === seeds.length, 'two playthroughs drew identical first samples');
  // and the divergence must be real, not a rounding difference
  const spread = Math.max(...firsts) - Math.min(...firsts);
  ok(spread > 0.2, `six seeds spread only ${spread.toFixed(3)} · not usefully random`);
});
t('districts diverge within one playthrough', () => {
  const ds = ['malezor','zarvane','andrannor','veridan','netharion','vorashil','xilnar','baelgor','thardin','korathen'];
  const firsts = ds.map(d => rng('mealux:seed9:' + d)());
  ok(new Set(firsts).size === ds.length, 'two districts sampled the same point');
});
t('a fresh seed is rolled and remembered, not re-rolled per call', () => {
  const f = H.slice(H.indexOf('function mealuxSeed'), H.indexOf('let _mealuxSeedUsed'));
  ok(/if \(!player\.mealuxSeed\)/.test(f), 'unguarded · every call would re-roll and the Key would teleport');
  ok(/Math\.random/.test(f), 'not actually random');
});

console.log('\n3 · the save owns the layout');
t('seed and taken-list are persisted', () => {
  ok(/mealuxSeed:\s*player\.mealuxSeed/.test(H), 'the seed is never saved · new layout every load');
  ok(/mealuxTaken:\s*player\.mealuxTaken/.test(H), 'the taken districts are never saved');
});
t('the Keys are re-laid AFTER the save is read', () => {
  // the world builds at page init, before loadGame — the same ordering trap
  // that made filed scroll pages respawn at v0.95.950
  ok(/function replaceMealuxKeys/.test(H), 'no post-load pass');
  const load = H.indexOf('function loadGame');
  const call = H.indexOf('replaceMealuxKeys()', load);
  ok(call > load, 'never called from loadGame · the boot seed would win over the saved one');
  ok(call < H.indexOf('pruneFiledScrolls()', load), 'runs after the other sweeps');
});
t('re-laying is idempotent when nothing changed', () => {
  const f = H.slice(H.indexOf('function replaceMealuxKeys'), H.indexOf('function pruneFiledScrolls'));
  ok(/seed === _mealuxSeedUsed && !taken\.size/.test(f), 'no early-out · it would rebuild on every load');
  ok(/!w\._gone/.test(f), 'it would delete a Key the player already bonded');
});

console.log('\n4 · a bonded Key stays bonded');
t('the district is recorded on the bond', () => {
  ok(/player\.mealuxTaken\.push\(w\._mealuxDistrict\)/.test(H), 'nothing records the catch');
  // ★ anchor on the CURRENT id · the earlier version still searched for the
  // pre-rename string, found -1, and sliced from the top of the file
  const at = H.indexOf("if (w.speciesId === 'mealux' && w._mealuxDistrict)");
  ok(at > 0, 'the record block is gone');
  const f = H.slice(at, at + 400);
  ok(/!player\.mealuxTaken\.includes\(w\._mealuxDistrict\)/.test(f), 'would push duplicates');
  ok(/saveGame\(\)/.test(f), 'the catch is not persisted immediately · a crash would resurrect the Mealux');
});
t('taken districts are skipped at placement, in BOTH paths', () => {
  // world build and post-load re-lay each place Keys · a guard in one only
  // means reloading resurrects the Key you bonded
  const build = H.slice(H.indexOf('const _taken = new Set(player.mealuxTaken'), H.indexOf('const _taken = new Set(player.mealuxTaken') + 700);
  ok(/_taken\.has\(d\.id\)\) continue/.test(build), 'world build ignores the taken list');
  const rel = H.slice(H.indexOf('function replaceMealuxKeys'), H.indexOf('function pruneFiledScrolls'));
  ok(/taken\.has\(d\.id\)\) continue/.test(rel), 'the post-load pass ignores the taken list');
});

console.log('\n5 · it is a species, not a relic');
t('the invented Key-of-Mealux relic is gone, root and branch', () => {
  // Creator: "it is no longer a relic. it is a species. the relic is the key
  // of anciuxor that proginates mealux."  The v0.95.881 relic object, its item
  // row and its relic-class ruling all had to go together -- leaving any one
  // of them keeps a relic named after a creature alive in the data.
  ok(!/const KEY_OF_MEALUX/.test(H), 'the relic object survives');
  ok(!/key_of_mealux:\s*\{ label:/.test(H), 'the item row survives');
  ok(!/key_of_mealux:\s*RELIC_CLASS/.test(H), 'the relic-class ruling survives');
  ok(!/key_of_mealux:'relic'/.test(H), 'the relic type tag survives');
});
t('the species is named Mealux and keyed mealux', () => {
  ok(/id:'mealux', name:'Mealux', tier:8/.test(H), 'the species was not renamed');
  const live = H.split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n');
  // ★ the migration table is the one place that MUST still name the old id --
  // rewriting it is its whole job.  Everything else is a leftover.
  const hits = live.split('\n')
                   .filter(l => l.includes('key_of_mealux'))
                   .filter(l => !/'key_of_mealux', 'mealux'/.test(l));
  ok(!hits.length, `${hits.length} live key_of_mealux reference(s) remain: ` + hits[0]);
});
t('the sprite banks follow the id', () => {
  ok(/\n  mealux: \{/.test(H), 'no mealux sprite entry');
  ok(fs.existsSync('assets/2D sprites/zyrex/mealux.png'), 'idle art not renamed on disk');
  ok(fs.existsSync('assets/2D sprites/zyrex/mealux-run.png'), 'run art not renamed on disk');
});
t('an old save still finds its Mealux', () => {
  const src = H.slice(H.indexOf('const SPECIES_ID_MIGRATIONS'), H.indexOf('function migrateSpeciesIds'))
            + '\nreturn { migrateSpeciesId, SPECIES_ID_MIGRATIONS };';
  const save = { party: [{ speciesId: 'key_of_mealux', level: 80 }], bonds: { key_of_mealux: 12 } };
  const api = new Function('player', 'console', src)(save, { warn(){} });
  ok(api.SPECIES_ID_MIGRATIONS.some(([f, t]) => f === 'key_of_mealux' && t === 'mealux'),
     'the rename is not in the migration table');
  api.migrateSpeciesId('key_of_mealux', 'mealux');
  ok(save.party[0].speciesId === 'mealux', 'a bonded Mealux would resolve to nothing');
  ok(save.party[0].level === 80, 'the migration wiped its level');
  ok(save.bonds.mealux === 12, 'bond progress lost');
});

console.log('\n6 · the door, and the secret');
t('bonding one opens every Gemlord door', () => {
  ok(/z\.speciesId === 'mealux' && !player\.gemlordCavesOpen/.test(H), 'the catch no longer grants access');
  ok(/function gemlordCavesOpen/.test(H) && /if \(!gemlordCavesOpen\(\)\)/.test(H), 'the door no longer checks');
});
t('no coordinate is ever printed', () => {
  // a console line naming a tile is a printable table · aov-no-easter-egg-spoilers
  const f = H.slice(H.indexOf('function replaceMealuxKeys'), H.indexOf('function pruneFiledScrolls'));
  const logs = f.match(/console\.\w+\(([^\n]*)/g) || [];
  logs.forEach(l => ok(!/spot|\.at\[|tileX|tileY/.test(l), 'a log line leaks a Key tile: ' + l.slice(0, 70)));
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
