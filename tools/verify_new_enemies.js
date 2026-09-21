// ★★★ v0.96.99 · MORVEXAR · NYMPHYSYL · PENUMBRA.
//
// ★★ THE RULING THAT MADE THIS CHEAP. Nymphysyl's brief said "immune to all
//   physical damage, harmed only by astral abilities", which reads as a request
//   for a damage-type system — and the build has none. No `damageType`, no
//   `immuneTo`, nothing, in 3.5 MB. Then the Creator said what he actually
//   meant: *"can only be hurt by astralstrike or astralkick, no punch or kick."*
//   ★ Two attacks THAT ALREADY EXIST. The immunity is a two-string allowlist,
//     not a combat rewrite. This suite drives that allowlist rather than
//     trusting it, because an immunity that silently lets a punch through is
//     indistinguishable from no immunity at all.
//
// ★★★ AND THE OTHER RULING FIXED A CONFLICT THAT WAS NEVER REAL. Morvexar's
//   brief called him "Final Boss", which collided with the ruled Part One
//   finale. It was a missing word: "boss" is a RANK and APEX sits above it.
//   Nothing moved — the ladder just got written down.
const fs = require('fs'), vm = require('vm');
const src = require('./lib/all_src.cjs')();
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const ROOT = '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/';

function grab(decl){
  const i = src.indexOf(decl); let j = src.indexOf('{', i), d = 0;
  do { if (src[j] === '{') d++; else if (src[j] === '}') d--; j++; } while (d);
  return src.slice(i, j) + ';';
}
const ctx = vm.createContext({ console, Math, Array, Object });
for (const n of ['MORVEXAR_ART', 'NYMPHYSYL_ART', 'PENUMBRA_ART'])
  vm.runInContext(grab('const ' + n + ' = {'), ctx);
vm.runInContext(grab('const ENEMY_RANKS = ['.replace('{', '[')) || '', ctx);
const R = e => vm.runInContext(e, ctx);

H('★★★ THE RANK LADDER · "boss" was a rank, not a collision');
{
  const ranks = JSON.parse(/const ENEMY_RANKS = (\[[^\]]*\])/.exec(src)[1].replace(/'/g, '"'));
  const apex  = JSON.parse(/const ENEMY_APEXES = (\[[^\]]*\])/.exec(src)[1].replace(/'/g, '"'));
  ok(ranks.length === 5, `five ranks: ${ranks.join(' < ')}`);
  ok(ranks[ranks.length - 1] === 'apex', 'apex is the top');
  ok(apex.length === 3 && ['xenoxil','orryx','ophira'].every(a => apex.includes(a)),
     `★★ and the three apexes are the Seers: ${apex.join(', ')}`);
  // ★ the point of the ladder: Morvexar is BELOW apex, so the Part One finale
  //   is untouched
  const mv = R('MORVEXAR_ART.rank');
  ok(mv === 'boss', `★★★ Morvexar is rank "${mv}" — below apex, so the ruled finale stands`);
  ok(ranks.indexOf(mv) < ranks.indexOf('apex'), 'and the ladder agrees he is below it');
  ok(!apex.includes('morvexar'), '★ he is not an apex');
}

H('★★★ SIZES · ruled 2026-09-14');
{
  const sizes = { morvexar: R('MORVEXAR_ART.scaleMul'),
                  nymphysyl: R('NYMPHYSYL_ART.scaleMul'),
                  penumbra: R('PENUMBRA_ART.scaleMul') };
  ok(sizes.nymphysyl === 1.00, `nymphysyl ${sizes.nymphysyl} — normal/Mori size`);
  ok(sizes.penumbra === 1.45, `penumbra ${sizes.penumbra} — Vilerok size`);
  ok(sizes.morvexar > 1.85, `★ morvexar ${sizes.morvexar} — bigger than Vorugath's 1.85`);
  // ★★ "largest enemy so far" · check against every scaleMul in the build,
  //   excluding Anciuxor, who is a god rather than an enemy.
  const all = [...src.matchAll(/scaleMul:\s*([0-9.]+)/g)].map(m => +m[1]);
  const bigger = all.filter(v => v > sizes.morvexar);
  ok(bigger.length <= 2 && bigger.every(v => v >= 2.00),
     `★★ nothing outsizes him but Anciuxor at 2.00 (${bigger.length} larger entries, all gods)`);
}

H('★★★ NYMPHYSYL · THE PUNCH BUTTON DOES NOT WORK ON HER');
{
  ok(R('NYMPHYSYL_ART.astralOnly') === true, 'she is flagged astralOnly');
  const allow = JSON.parse(/const ASTRAL_ONLY_SOURCES = (\[[^\]]*\])/.exec(src)[1].replace(/'/g, '"'));
  ok(allow.length === 2 && allow.includes('astralstrike') && allow.includes('astralkick'),
     `★ the allowlist is exactly the two the Creator named: ${allow.join(', ')}`);

  // ★★ DRIVE IT. An immunity that silently lets a punch through looks identical
  //   to no immunity, so the gate is executed rather than read.
  const toasts = [];
  const c = vm.createContext({
    performance: { now: () => NOW }, console,
    showToast: t => toasts.push(t), playSFX(){}, spawnHitFx(){},
    game: { devCombatFxOn: false },
    ASTRAL_ONLY_SOURCES: allow,
  });
  let NOW = 1000;
  vm.runInContext(grab('function enemyResistsHit(').replace(/^function/, 'var enemyResistsHit = function')
                  .replace(/;$/, ';'), c);
  const her  = { _astralOnly: true, tileX: 0, tileY: 0 };
  const mori = { tileX: 0, tileY: 0 };
  const hits = s => vm.runInContext('enemyResistsHit(SUBJ, ' + JSON.stringify(s) + ')', c);
  c.SUBJ = her;
  for (const s of ['punch', 'kick', 'sword', 'axe', 'pearlbow'])
    ok(hits(s) === true, `  ${s} passes straight through her`);
  for (const s of ['astralstrike', 'astralkick'])
    ok(hits(s) === false, `★★ ${s} LANDS`);
  c.SUBJ = mori;
  ok(hits('punch') === false, '★ and an ordinary Mori still takes a punch — the gate is hers alone');
  ok(toasts.length > 0 && /ASTRAL only/.test(toasts[0]),
     `★ the refusal explains itself: "${toasts[0]}"`);
  // ★ and it must not nag on every swing.
  //   ★★ NOTE: the clock must MOVE first. My first version of this block reset
  //   the toast list but left NOW where it was — so the throttle window opened
  //   by the five swings above was still running and nothing fired at all. The
  //   test failed while the code was behaving correctly, which is the most
  //   expensive kind of red there is.
  c.SUBJ = her; toasts.length = 0; NOW += 4000;
  hits('punch'); hits('punch'); hits('punch');
  ok(toasts.length === 1, 'three blocked swings, one message — a wall that shouts reads as nagging');
  NOW += 4000; hits('punch');
  ok(toasts.length === 2, 'and it speaks again after the cooldown');
}

H('★★ AND THE GATE IS WIRED INTO THE REAL MELEE PATH');
{
  ok(/if \(enemyResistsHit\(hit, mode\)\) \{ \/\* passes through \*\/ \} else \{/.test(src),
     'the punch/kick/blade site checks it');
  // ★ the two astral sites must NOT be guarded — they are what may land
  const ak = src.slice(src.indexOf('ASTRAL_KICK.DMG_MULT') - 400, src.indexOf('ASTRAL_KICK.DMG_MULT'));
  const as = src.slice(src.indexOf('ASTRAL_STRIKE.DMG_MULT') - 400, src.indexOf('ASTRAL_STRIKE.DMG_MULT'));
  ok(!/enemyResistsHit/.test(ak) && !/enemyResistsHit/.test(as),
     '★★ and the astral strike/kick sites are deliberately NOT guarded');
}

H('★★★ PLACEMENT · ruled 2026-09-14');
{
  const P = vm.createContext({ player: { districtsVisited: {} }, Math, Array, Object });
  vm.runInContext(grab('const NEW_ENEMY_PLACEMENT = {'), P);
  // ★ v0.97.1 · the counts became a depth-scaled BAND, so the district table
  //   and the depth helper are dependencies now. Without them newEnemyCountFor
  //   throws a ReferenceError from inside the vm — which reads as a placement
  //   regression rather than as a stale test harness.
  // ★ grab() is brace-matched and cannot take an ARRAY literal — it produced
  //   `{id:'malezor',...};` and a SyntaxError. The districts are a flat literal,
  //   so slice it to its own closing bracket rather than teaching grab() a
  //   second syntax.
  //   ★★ This used to import tools/lib/world_harness.js. That harness has been
  //     DELETED: it read the NPCS source literal and reported four empty
  //     districts in a world that holds 200 each. tools/lib/boot_game.mjs boots
  //     the real game instead, and tools/verify_enemy_world.mjs is where the
  //     placement questions now live.
  {
    const i = src.indexOf('const ZYRAXIS_DISTRICTS = [');
    vm.runInContext(src.slice(i, src.indexOf('];', i) + 2), P);
  }
  vm.runInContext(grab('function newEnemyDepth('), P);
  vm.runInContext(grab('function penumbraHasSpread(').replace(/^function/, 'var penumbraHasSpread = function'), P);
  vm.runInContext(grab('function newEnemyCountFor(').replace(/^function/, 'var newEnemyCountFor = function'), P);
  const N = e => vm.runInContext(e, P);

  // ★★★★ v0.97.3 · NYMPHYSYL IS NO LONGER PLACED BY THIS TABLE.
  //   Creator: "netharion should have 50 mori, 50 nymphysyl, 35 vorugath, and
  //   25 vilerok" — she became a counted member of DISTRICT_ENEMY_ROSTER, so
  //   leaving her here would DOUBLE-PLACE her and make Netharion's authored 50
  //   boot as ~56. Her census now lives in tools/verify_enemy_world.mjs, which
  //   boots the real game and counts bodies.
  ok(!N('NEW_ENEMY_PLACEMENT.nymphysyl'),
     '★★ nymphysyl has left NEW_ENEMY_PLACEMENT · the roster owns her count now');
  for (const d of ['netharion','vorashil','xilnar','malezor'])
    ok(N(`newEnemyCountFor('nymphysyl','${d}')`) === 0,
       `  and this table places none of her in ${d}`);

  // ★★ MORVEXAR · the counts, exactly, and the descent
  // ★★ v0.97.3 · Creator ruled ADD, not move: "morvexar in netharion vorashil
  //   and xilnar outskirts" joins the original 6/4/2 rather than replacing it.
  // ★ v0.97.4 · Creator: "add extra morvexar in korathen to make it the hardest
  //   district. 6 here." Korathen doubles to 12 · 30 world-wide.
  const want = { korathen: 12, baelgor: 4, zarvane: 2, netharion: 4, vorashil: 4, xilnar: 4 };
  let total = 0;
  for (const [d, n] of Object.entries(want)){
    const got = N(`newEnemyCountFor('morvexar','${d}')`);
    ok(got === n, `  morvexar ${d}: ${got}`); total += got;
  }
  ok(total === 30, `★ ${total} in the world across six districts, and none anywhere else`);
  ok(N('NEW_ENEMY_PLACEMENT.morvexar.outskirtsOnly') === true,
     '★★★ and "outskirts" is a HARD siting rule for him, not a preference');
  ok(N("newEnemyCountFor('morvexar','malezor')") === 0, '  none in Malezor');
  ok(N("NEW_ENEMY_PLACEMENT.morvexar.noPack") === true,
     '★★ and they do not fight in pacts — each one is alone');

  // ★★★ PENUMBRA · the world changes because you WENT somewhere
  ok(N("newEnemyCountFor('penumbra','thardin')") >= 9,
     `penumbra is in Thardin IN NUMBER from the start · ${N("newEnemyCountFor('penumbra','thardin')")}`);
  const before = N("newEnemyCountFor('penumbra','malezor')");
  ok(before === 0, '★★★ and NOWHERE else until you reach Thardin');
  P.player.districtsVisited.thardin = true;
  ok(N('penumbraHasSpread()') === true, 'reaching Thardin fires the spread');
  const after = N("newEnemyCountFor('penumbra','malezor')");
  ok(after > before, `★★★ after which they appear in every other district (${before} → ${after})`);
  ok(N("NEW_ENEMY_PLACEMENT.penumbra.escalates") === 'scanobot',
     '★ recorded as the escalation of the Scanobot net, which already covers every district');
}

H('★ ALL 24 SHEETS ARE ON DISK, KEYED AND MASTERED');
{
  let live = 0, orig = 0;
  for (const [ART, pre] of [['MORVEXAR_ART','morvexar'],['NYMPHYSYL_ART','nymphysyl'],['PENUMBRA_ART','penumbra']]){
    const banks = R(`Object.keys(${ART}).filter(k => ${ART}[k] && ${ART}[k].src)`);
    for (const k of banks){
      const rel = decodeURIComponent(R(`${ART}[${JSON.stringify(k)}].src`));
      if (fs.existsSync(ROOT + rel)) live++;
      const base = rel.split('/').pop().replace('.png','');
      if (fs.existsSync(ROOT + `assets/2D sprites/enemies/_orig/${base}_master.png`)) orig++;
    }
    ok(banks.length >= 7, `${pre}: ${banks.length} banks`);
    // every bank is a full 4x4 with no empty frame
    for (const k of banks){
      const bb = R(`${ART}[${JSON.stringify(k)}].bboxes`);
      const bad = bb.length !== 4 || bb.some(r => r.length !== 4 || r.some(c => c[2] < 20 || c[3] < 20));
      if (bad) ok(false, `  ${pre}.${k} has an empty or malformed frame`);
    }
  }
  ok(live === 24, `${live}/24 keyed sheets present`);
  ok(orig === 24, `★ ${orig}/24 untouched masters kept in _orig/`);
}

H(f ? `❌ ${f} failed` : '✅ three enemies sized, ranked, and one of them cannot be punched');
process.exit(f ? 1 : 0);
