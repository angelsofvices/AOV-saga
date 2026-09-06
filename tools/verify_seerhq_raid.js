// v0.95.966 · the raid formula · R2 -> basement key -> basement -> attic key -> attic.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const WALLS_ON = /const SEER_HQ_WALLS_ON = true/.test(H);
const isFloor = ch => '.SCG'.includes(ch) || (!WALLS_ON && ch === '#');
const cfg = name => {
  const at = H.indexOf(`const ${name} = {`);
  const src = H.slice(at, H.indexOf('\n};', at));
  const pm = /plan: \[([\s\S]*?)\n  \],/.exec(src);
  return { src, plan: pm ? [...pm[1].matchAll(/'([^']*)'/g)].map(m => m[1]) : null };
};
const chests = [...(/const SEER_HQ_CHESTS = \[([\s\S]*?)\n\];/.exec(H)[1])
  // ★ whitespace-tolerant.  The table is column-aligned, so `tileY:  7` has
  // TWO spaces and a rigid `tileY: (\d+)` silently found only one of the two
  // chests — the second time this session an alignment space has defeated a
  // regex (the dev-roster table did it with `snok:   {`).  Parse loosely.
  .matchAll(/scene:\s*'([^']+)'\s*,\s*tileX:\s*(\d+)\s*,\s*tileY:\s*(\d+)\s*,\s*key:\s*'(\w+)'/g)]
  .map(m => ({ scene: m[1], x: +m[2], y: +m[3], key: m[4] }));

console.log('\n1 · four floors, four real plans');
t('the basement and the attic are no longer open boxes', () => {
  ['INTERIOR_SEER_HQ_B','INTERIOR_SEER_HQ_2F'].forEach(n => {
    const c = cfg(n);
    ok(c.plan, `${n} has no plan`);
    ok(c.plan.length === 25 && c.plan[0].length === 35, `${n} is ${c.plan[0].length}x${c.plan.length}, not 35x25`);
    ok(!/cols: 14/.test(c.src), `${n} still declares the old 14-wide box`);
  });
});
t('the two floors are DIFFERENT shapes', () => {
  const b = cfg('INTERIOR_SEER_HQ_B').plan, a = cfg('INTERIOR_SEER_HQ_2F').plan;
  const w = p => Math.max(...p.map(r => (r.match(/[.#]+/) || [''])[0].length));
  ok(w(b) !== w(a), 'basement and attic are the same box · they should not read as one room twice');
  ok(w(b) > w(a), `basement ${w(b)} should be WIDER than the attic ${w(a)}`);
});

console.log('\n2 · the key chain');
t('two keys exist and are stored separately', () => {
  ok(/function hasSeerBasementKey/.test(H), 'no basement key');
  ok(/function grantSeerBasementKey/.test(H), 'the basement key can never be granted');
  ok(/seerBasementKeys:\s*player\.seerBasementKeys/.test(H), 'the basement key is not persisted');
  ok(/seerKeys:\s*player\.seerKeys/.test(H), 'the attic key stopped being persisted');
});
t('an old save that holds the attic key implies the basement key', () => {
  // you could only reach the old chest by going DOWN, so anyone with the top
  // -floor key has been through the basement
  const f = H.slice(H.indexOf('function hasSeerBasementKey'), H.indexOf('function grantSeerBasementKey'));
  ok(/player\.seerKeys \|\| \{\}\)\[dist\]/.test(f),
     'an existing save would find the basement re-locked behind a key it cannot get');
});
t('the DOWN stair is gated on the basement key', () => {
  const r2 = cfg('INTERIOR_SEER_HQ_R2').src;
  const down = r2.slice(r2.indexOf("target: 'interior_seer_hq_b'"), r2.indexOf("target: 'interior_seer_hq_2f'"));
  ok(/locked: \(\) => !hasSeerBasementKey\(\)/.test(down), 'the way down is not locked');
  ok(/lockedMsg/.test(down), 'no message telling the player what they need');
});
t('the UP stair is still gated on the attic key', () => {
  const r2 = cfg('INTERIOR_SEER_HQ_R2').src;
  const up = r2.slice(r2.indexOf("target: 'interior_seer_hq_2f'"));
  ok(/locked: \(\) => !hasSeerKey\(\)/.test(up), 'the way up is not locked');
  ok(/ATTIC KEY/.test(up), 'the locked message still calls it the SEER KEY');
});

console.log('\n3 · the chests, and the bug they exposed');
t('one chest per key, each on its own floor', () => {
  ok(chests.length === 2, `expected 2 chests, found ${chests.length}`);
  const r2 = chests.find(c => c.key === 'basement'), b = chests.find(c => c.key === 'attic');
  ok(r2 && r2.scene === 'interior_seer_hq_r2', 'the basement key is not in R2');
  ok(b && b.scene === 'interior_seer_hq_b', 'the attic key is not in the basement');
});
t('every chest stands on a floor tile of its own plan', () => {
  const map = { 'interior_seer_hq_r2': 'INTERIOR_SEER_HQ_R2', 'interior_seer_hq_b': 'INTERIOR_SEER_HQ_B' };
  chests.forEach(c => {
    const plan = cfg(map[c.scene]).plan;
    const ch = (plan[c.y] || '')[c.x];
    ok(isFloor(ch), `${c.scene} chest at (${c.x},${c.y}) sits on '${ch === ' ' ? 'VOID' : ch}'`);
  });
});
t('★ the chest is reachable · it was NOT before', () => {
  // v0.95.699 moved the chest to the vault and updated SEER_HQ_CHEST_SCENE,
  // but three of the four sites still tested interior_seer_hq_1f — so the X
  // handler never fired downstairs and the Seer Key was unobtainable.
  ok(!/game\.scene === 'interior_seer_hq_1f'\s*\n?\s*&& fx === SEER_HQ_CHEST_TILE/.test(H),
     'the interact still gates the chest on the 1F scene');
  ok(/function seerChestAt/.test(H), 'no shared lookup · the four sites can drift again');
  const uses = (H.match(/seerChestAt\(/g) || []).length;
  ok(uses >= 4, `only ${uses} of the four sites use the shared lookup`);
});
t('the R2 chest has its own flag, not the vault\'s', () => {
  ok(/function seerR2ChestOpened/.test(H), 'no separate flag');
  ok(/seerR2Chests:\s*player\.seerR2Chests/.test(H), 'the R2 chest is not persisted');
  // seerHqChests[dist] is read by three other places that mean the VAULT
  const f = H.slice(H.indexOf('function tryOpenSeerR2Chest'), H.indexOf('function seerHqChestOpened'));
  ok(!/seerHqChests/.test(f), 'the R2 chest writes the vault flag · opening one would open both');
});

console.log('\n4 · the commander is in the room');
t('he stands inside the new attic plan', () => {
  const at = H.indexOf("homeScene: 'interior_seer_hq_2f'");
  const src = H.slice(at - 400, at);
  const m = /tileX: (\d+), tileY: (\d+)/.exec(src);
  ok(m, 'no commander tile');
  const plan = cfg('INTERIOR_SEER_HQ_2F').plan;
  const ch = (plan[+m[2]] || '')[+m[1]];
  ok(isFloor(ch), `commander at (${m[1]},${m[2]}) stands on '${ch === ' ' ? 'VOID' : ch}'`);
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
