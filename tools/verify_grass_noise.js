// ★★★ v0.96.85 · GRASS IS NOISE, AND THE NOISE IS THE RUN'S.
//
// Creator: "no wild grass battles. grass is used to draw in enemies to rizer
// when he runs through it and it makes noise."
//
// ★★ TWO CLAIMS, AND ONLY ONE OF THEM WAS ALREADY TRUE.
//   "No wild grass battles" had been true since v0.95.310 — startWildBattle is
//   reachable only from dev mode, never from terrain.  Verified below rather
//   than assumed, because that is exactly the kind of thing that quietly grows
//   a second caller.
//   "When he RUNS through it" was NOT true.  Every grass step fed the noise
//   counter identically, so creeping through a meadow was as loud as sprinting
//   across it, and the terrain offered no decision at all.
const fs = require('fs'), vm = require('vm');
const src = require('./lib/all_src.cjs')();
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

H('★★ NO WILD GRASS BATTLES · the encounter roll must not exist in terrain');
{
  const calls = [...src.matchAll(/startWildBattle\(\)/g)].length;
  const defs  = [...src.matchAll(/function startWildBattle/g)].length;
  ok(defs === 1, 'startWildBattle is defined once');
  ok(calls - defs === 1, `and CALLED exactly once (${calls - defs}) — the dev "Wild Fighter Test" button`);
  // the one caller must be inside the dev panel, not the movement path
  const ctx = src.slice(Math.max(0, src.indexOf('startWildBattle();') - 260),
                        src.indexOf('startWildBattle();'));
  ok(/devPanel|devWildBattleTest/.test(ctx), '★ and that caller is dev mode, not terrain');
  ok(!/onDeclaredGemgrass[\s\S]{0,600}startWildBattle/.test(src),
     'no path from standing in grass to a battle');
}

H('★★★ RUNNING IS LOUD · WALKING IS NOT');
// Drive the real decision: pull the gate out of the movement block and run it.
{
  const blk = src.match(/const _loud = !!player\.running \|\| !!player\.skating;[\s\S]{0,300}?stepsInGrass \|\| 0\) - 1\);/);
  ok(!!blk, 'the loud/quiet gate exists in the grass step');
  const sandbox = { player: {}, out: null };
  const ctx = vm.createContext(sandbox);
  // ★ `const` in a vm script lives in the context's LEXICAL scope, which SURVIVES
  //   the call — so running the same snippet twice redeclares _loud and throws.
  //   Wrapping it in a block gives each run its own scope.  (This trap has now
  //   cost four harnesses; the fix is always to stop treating runInContext as
  //   a fresh program.)
  const CODE = '{\n' + blk[0].replace(/^\s*/gm, '') + '\n}';
  const run = (p) => {
    sandbox.player = Object.assign({ stepsInGrass: 0 }, p);
    vm.runInContext(CODE, ctx);
    return sandbox.player.stepsInGrass;
  };
  ok(run({ running: true })  === 1, 'a RUNNING step adds to the noise counter');
  ok(run({ skating: true })  === 1, 'the board does too — it is louder still');
  ok(run({ running: false }) === 0, '★ a WALKING step does not');
  // and walking should BLEED a counter you already built up
  sandbox.player = { stepsInGrass: 3, running: false };
  vm.runInContext(CODE, ctx);
  ok(sandbox.player.stepsInGrass === 2, '★★ and it bleeds one back off — slowing down settles the grass');
}

H('★ THE AGGRO PULSE FOLLOWS THE SAME RULE');
ok(/if \(_loud\) emitGrassNoise\(nx, ny\);/.test(src),
   'emitGrassNoise only fires on a loud step — a walk reaches nobody');
ok(/volume = _loud \? 0\.85 : 0\.45/.test(src),
   '★ but the footstep SFX plays either way, quieter — you always hear YOURSELF in grass');

H('★ AND THE SPAWN STILL NEEDS THREE LOUD STEPS');
ok(/\(player\.stepsInGrass \|\| 0\) < 3\) return;/.test(src),
   'three consecutive loud steps before the roll is even attempted');
ok(/activeGrassMori >= 4\) return;/.test(src), 'capped at four grass-spawned Mori');
ok(/dist  = 20 \+ Math\.random\(\) \* 8;/.test(src),
   'and they spawn 20-28 tiles out, off-camera, so they have to WALK to you');

H(f ? `❌ ${f} failed` : '✅ no battles from grass · running draws, walking does not');
process.exit(f ? 1 : 0);
