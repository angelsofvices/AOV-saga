// v0.95.951 · Rustbyte rename + the missing summon sprite.
// Written to FAIL on the pre-rename code.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

console.log('\n1 · the sprite actually loads now');
t('rustbyte is registered in SUMMONABLE_SPRITES', () => {
  const at = H.indexOf('const SUMMONABLE_SPRITES');
  ok(at > 0, 'SUMMONABLE_SPRITES missing');
  const block = H.slice(at, H.indexOf('const ZYREX_ATTACK_BANKS', at));
  ok(/\n  rustbyte: \{/.test(block),
     'no rustbyte entry · the faction ally still has no sheet to walk in');
  ok(!/\n  gearbyte: \{/.test(block), 'a gearbyte sprite entry survives');
});
t('it points at art that exists, at his own scale', () => {
  const at = H.indexOf('\n  rustbyte: {', H.indexOf('const SUMMONABLE_SPRITES'));
  const e = H.slice(at, at + 900);
  ok(/zyrex\/rustbyte\.png/.test(e), 'wrong source');
  ok(fs.existsSync('assets/2D sprites/zyrex/rustbyte.png'), 'the PNG is not on disk');
  ok(/scaleMul: 0\.55/.test(e), 'not at the 0.55 baseline he has carried since v0.89.1');
  const n = [...e.matchAll(/\[\s*(-?\d+),\s*(-?\d+),\s*(\d+),\s*(\d+)\]/g)];
  ok(n.length === 16, `expected 16 bboxes, found ${n.length}`);
});

console.log('\n2 · the rename is complete, not cosmetic');
t('the NPC beside Auraxion is Rustbyte', () => {
  const at = H.indexOf("id: 'rustbyte'");
  ok(at > 0, 'the NPC id is still gearbyte');
  const b = H.slice(at - 400, at + 2200);
  ok(/name: 'Rustbyte'/.test(b), 'display name not renamed');
  ok(/speaker: 'RUSTBYTE'/.test(b), 'he still introduces himself as Gearbyte');
});
t('no gearbyte id survives in live code (comments may cite the history)', () => {
  const code = H.split('\n')
    .filter(l => !/^\s*(\/\/|\*|<!--)/.test(l))
    .join('\n');
  const hits = [...code.matchAll(/['"]gearbyte['"]/g)].map(m => m.index);
  // the only legal remaining literals are the stage-2 SPECIES entry itself
  const stage2 = H.indexOf("id:'gearbyte', name:'Gearbyte', tier:2");
  ok(stage2 > 0, 'the stage-2 Gearbyte species was not created');
  hits.forEach(i => {
    const line = code.slice(code.lastIndexOf('\n', i), code.indexOf('\n', i));
    // ★ the migration function is allowed to name the old id -- rewriting it
    // is its entire job.  Everything else must be the stage-2 species.
    // ★ the migration TABLE is allowed to name the old id -- rewriting it is
    // its entire job -- and so is the stage-2 species entry.
    ok(/tier:2|gearbyte: \{|evolveTo|'gearbyte', 'rustbyte'/.test(line),
       'a live gearbyte id survives outside the stage-2 entry: ' + line.trim().slice(0, 90));
  });
});
t('the dev faction button was renamed on BOTH sides', () => {
  ok(/id="devFactionRustbyte"/.test(H), 'the DOM button still says Gearbyte');
  ok(/buttonId:'devFactionRustbyte'/.test(H), 'the handler still looks up the old id');
  ok(!/devFactionGearbyte/.test(H), 'a stale devFactionGearbyte reference remains');
});
t('the attack-bank alias is gone, not repointed', () => {
  ok(!/ZYREX_ATTACK_BANKS\.gearbyte\s*=/.test(H),
     'gearbyte still borrows rustbyte art · stage 2 would silently look like stage 1');
  ok(/rustbyte:\s*\{ cols:4/.test(H), 'the rustbyte attack bank went missing');
});

console.log('\n3 · the chain, and the save');
t('rustbyte T1 evolves into gearbyte T2', () => {
  const r = H.slice(H.indexOf("id:'rustbyte', name:'Rustbyte'"), H.indexOf("id:'rustbyte', name:'Rustbyte'") + 400);
  ok(/tier:1/.test(r), 'Rustbyte is not T1');
  ok(/evolveTo:'gearbyte'/.test(r), 'no evolution declared');
  const g = H.slice(H.indexOf("id:'gearbyte', name:'Gearbyte'"), H.indexOf("id:'gearbyte', name:'Gearbyte'") + 400);
  ok(/tier:2/.test(g), 'Gearbyte is not T2');
  const m = g.match(/baseHP:(\d+), baseATK:(\d+), baseDEF:(\d+), baseSPD:(\d+), baseSATK:(\d+), baseSDEF:(\d+)/);
  ok(m, 'stat line unreadable');
  const total = m.slice(1).map(Number).reduce((a, b) => a + b, 0);
  ok(total === 666, `T2 pool must be 666, got ${total}`);   // [[rizing-powers-t333-stat-pool]]
  const rm = H.slice(H.indexOf("id:'rustbyte'")).match(/baseHP:(\d+), baseATK:(\d+), baseDEF:(\d+), baseSPD:(\d+), baseSATK:(\d+), baseSDEF:(\d+)/);
  const rt = rm.slice(1).map(Number).reduce((a, b) => a + b, 0);
  ok(rt === 333, `T1 pool must be 333, got ${rt}`);
});
t('a save written as gearbyte still finds him', () => {
  // ★ RUN the migrator rather than grep for its name.  v0.95.959 folded it
  // into a table and renamed the entry point, and a string test broke while
  // the behaviour was fine -- which is the wrong way round for a suite whose
  // job is to protect old saves.
  const src = H.slice(H.indexOf('const SPECIES_ID_MIGRATIONS'), H.indexOf('function migrateSpeciesIds'))
            + '\nreturn { migrateSpeciesId, SPECIES_ID_MIGRATIONS };';
  const save = {
    party: [{ speciesId: 'gearbyte', level: 22, xp: 900 }],
    pcZyrex: [{ speciesId: 'gearbyte' }],
    faction: ['auraxion', 'gearbyte'],
    factionState: { gearbyte: { met: true } },
    bonds: { gearbyte: 47 },
  };
  const api = new Function('player', 'console', src)(save, { warn(){} });
  ok(api.SPECIES_ID_MIGRATIONS.some(([f, t]) => f === 'gearbyte' && t === 'rustbyte'),
     'the gearbyte rename is not in the migration table');
  const n = api.migrateSpeciesId('gearbyte', 'rustbyte');
  ok(n >= 5, `only ${n} references migrated`);
  ok(save.party[0].speciesId === 'rustbyte', 'the party member was left pointing at the stage 2');
  ok(save.party[0].level === 22 && save.party[0].xp === 900, 'the migration wiped his level');
  ok(save.pcZyrex[0].speciesId === 'rustbyte', 'a PC-stored one was missed');
  ok(save.faction.includes('rustbyte') && !save.faction.includes('gearbyte'), 'the faction list was missed');
  ok(save.factionState.rustbyte && !save.factionState.gearbyte, 'factionState was missed');
  ok(save.bonds.rustbyte === 47 && !save.bonds.gearbyte, 'bond progress was lost in the rename');
  // and it must run on load
  const load = H.indexOf('function loadGame');
  ok(H.indexOf('migrateSpeciesIds()', load) > load, 'never called from loadGame');
});
t('the wild placements followed the rename', () => {
  const h = fs.readFileSync('data/rp7_habitats_v1.json', 'utf8');
  ok(!/"speciesId": "gearbyte"/.test(h), 'wild spawns still place the stage 2 as a T1 catch');
  ok(/"speciesId": "rustbyte"/.test(h), 'the placements went missing entirely');
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
