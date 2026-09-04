// v0.95.957 · every species you can meet in the world is grantable in dev.
// The sync is EXTRACTED and RUN — the point is what the table ends up
// containing, which reading the source cannot tell you.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

// ── the three lists, read straight out of the build ───────────────────────
const SPECIES = {};
for (const m of H.matchAll(/id:'([a-z_0-9]+)',\s*name:'([^']+)',\s*tier:(\d+)/g))
  SPECIES[m[1]] = { id: m[1], name: m[2], tier: Number(m[3]) };
const S = H.indexOf('const SUMMONABLE_SPRITES');
const SB = H.slice(S, H.indexOf('const ZYREX_ATTACK_BANKS', S));
const SUMMONABLE_SPRITES = {};
for (const m of SB.matchAll(/\n  ([a-z_0-9]+): \{/g)) SUMMONABLE_SPRITES[m[1]] = {};
const curated = {};
for (const m of /const DEV_FACTION_ACTORS=\{([\s\S]*?)\n\};/.exec(H)[1]
                  // ★ whitespace-tolerant.  The first version demanded
                  // `id:{label:'X',level:N` with no spaces and silently missed
                  // `snok:   {label:'Snok',   level:35` -- so snok was scored as
                  // DERIVED and the "curated levels are never overwritten" test
                  // never checked the one entry most likely to be hand-spaced.
                  .matchAll(/^  ([a-z_0-9]+):\s*\{\s*label:\s*'([^']+)'\s*,\s*level:\s*(\d+)/gm))
  curated[m[1]] = { label: m[2], level: Number(m[3]) };
// every species actually placed in the world as a wild
const wild = new Set();
for (const m of H.matchAll(/spawnWildZyrex\('([a-z_0-9]+)'/g)) wild.add(m[1]);
for (const m of /const MALEZOR_WILD_ROSTER = \[([\s\S]*?)\];/.exec(H)[1].matchAll(/'([a-z_0-9]+)'/g)) wild.add(m[1]);
for (const m of H.matchAll(/\{ id: '([a-z_0-9]+)', at: \[/g)) wild.add(m[1]);
for (const m of H.matchAll(/\{ id: '([a-z_0-9]+)', dist:/g)) wild.add(m[1]);

// ── run the real sync ─────────────────────────────────────────────────────
function runSync(){
  const DEV_FACTION_ACTORS = JSON.parse(JSON.stringify(curated));
  const src = H.slice(H.indexOf('function _devFactionLabel'), H.indexOf('function setDevFactionActor'))
            + '\nreturn syncDevFactionRoster();';
  const added = new Function('SPECIES', 'SUMMONABLE_SPRITES', 'DEV_FACTION_ACTORS', 'console', src)
                  (SPECIES, SUMMONABLE_SPRITES, DEV_FACTION_ACTORS, { info(){} });
  return { table: DEV_FACTION_ACTORS, added };
}

console.log('\n1 · the gap the Creator found');
t('the curated table was read completely', () => {
  const declared = (/const DEV_FACTION_ACTORS=\{([\s\S]*?)\n\};/.exec(H)[1]
                     .match(/^  [a-z_0-9]+:\s*\{/gm) || []).length;
  ok(Object.keys(curated).length === declared,
     `parsed ${Object.keys(curated).length} of ${declared} curated entries · the ones missed are scored as derived and go unchecked`);
});
t('the eight missing species were really missing before', () => {
  const gap = Object.keys(SUMMONABLE_SPRITES).filter(id => SPECIES[id] && !curated[id]).sort();
  ok(gap.length >= 8, `expected the reported gap, found ${gap.length}`);
  ['aetherwing','frosane','key_of_mealux','mutamech','phrenetic','skybeam','smogrin','zorbil']
    .forEach(id => ok(gap.includes(id), `${id} was already curated · the diff is wrong`));
});
t('every one of them is a species you can meet in the world', () => {
  ['aetherwing','frosane','key_of_mealux','mutamech','phrenetic','skybeam','smogrin','zorbil']
    .forEach(id => ok(wild.has(id), `${id} is not actually placed as a wild`));
});

console.log('\n2 · after the sync');
t('nothing with overworld art is left out', () => {
  const { table } = runSync();
  const left = Object.keys(SUMMONABLE_SPRITES).filter(id => SPECIES[id] && !table[id]);
  ok(!left.length, 'still missing: ' + left.join(', '));
});
t('every WILD species is grantable', () => {
  const { table } = runSync();
  const left = [...wild].filter(id => SPECIES[id] && SUMMONABLE_SPRITES[id] && !table[id]);
  ok(!left.length, 'wild but ungrantable: ' + left.join(', '));
});
t('curated grant levels are never overwritten', () => {
  const { table } = runSync();
  for (const [id, c] of Object.entries(curated)){
    ok(table[id].level === c.level, `${id} was ${c.level}, sync made it ${table[id].level}`);
    ok(table[id].label === c.label, `${id} label changed to ${table[id].label}`);
    ok(!table[id]._derived, `${id} was marked derived · a hand-tuned entry got rebuilt`);
  }
});
t('derived levels follow tier, and none is nonsense', () => {
  const { table } = runSync();
  Object.entries(table).filter(([, c]) => c._derived).forEach(([id, c]) => {
    ok(c.level >= 5 && c.level <= 100, `${id} granted at Lv${c.level}`);
    ok(c.level === Math.max(5, SPECIES[id].tier * 10),
       `${id} is T${SPECIES[id].tier} but granted at Lv${c.level}`);
    ok(c.label && c.label !== id, `${id} has no display label`);
  });
});
t('art with no species entry is skipped, not granted', () => {
  const { table } = runSync();
  Object.keys(SUMMONABLE_SPRITES).filter(id => !SPECIES[id])
    .forEach(id => ok(!table[id], `${id} has a sprite bank but no species · it is a prop, not a Zyrex`));
});
t('running it twice adds nothing', () => {
  const DEV = JSON.parse(JSON.stringify(curated));
  const src = H.slice(H.indexOf('function _devFactionLabel'), H.indexOf('function setDevFactionActor'))
            + '\nreturn [syncDevFactionRoster(), syncDevFactionRoster()];';
  const [a, b] = new Function('SPECIES','SUMMONABLE_SPRITES','DEV_FACTION_ACTORS','console', src)
                   (SPECIES, SUMMONABLE_SPRITES, DEV, { info(){} });
  ok(a > 0, 'the first pass added nothing');
  ok(b === 0, `the second pass added ${b} more · not idempotent, and it runs on every refresh`);
});

console.log('\n3 · a derived entry can actually be pressed');
t('buttons are generated, sorted, and wired at creation', () => {
  ok(/id="devFactionAuto"/.test(H), 'no container for the generated buttons');
  const f = H.slice(H.indexOf('function _devFactionMountButtons'), H.indexOf('function refreshDevFactionButtons'));
  ok(/addEventListener\('click'/.test(f),
     'no handler · the boot wiring pass ran once over the old table and cannot see these');
  ok(/setDevFactionActor\(id, !factionAllyInParty\(id\)\)/.test(f), 'the handler does not toggle the ally');
  ok(/tier/.test(f), 'not sorted by tier · the list would read in sprite-declaration order');
  ok(/!document\.getElementById\(c\.buttonId\)/.test(f), 'would re-create buttons on every refresh');
});
t('the sync runs before the panel paints', () => {
  const r = H.slice(H.indexOf('function refreshDevFactionButtons(){\n  // ★ v0.95.957'), 900 + H.indexOf('function refreshDevFactionButtons(){\n  // ★ v0.95.957'));
  ok(r.indexOf('syncDevFactionRoster()') < r.indexOf('let count=0'), 'sync runs after the count');
  ok(r.indexOf('_devFactionMountButtons()') < r.indexOf('let count=0'), 'buttons mount after the paint');
});
t('giveAll still means all', () => {
  ok(/allOn=count===Object\.keys\(DEV_FACTION_ACTORS\)\.length/.test(H.replace(/\s/g, '')
       .replace(/allOn=count===Object\.keys\(DEV_FACTION_ACTORS\)\.length/, 'allOn=count===Object.keys(DEV_FACTION_ACTORS).length'))
     || /Object\.keys\(DEV_FACTION_ACTORS\)\.length/.test(H),
     'the ALL toggle counts a hardcoded total · it would never read ON');
});

const { added, table } = runSync();
console.log(`\n   roster: ${Object.keys(curated).length} curated + ${added} derived = ${Object.keys(table).length} grantable`);
console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
