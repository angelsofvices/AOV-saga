// ★★★ v0.99.0 · THE LIVE SEER HQ FLOORS · read the world, not the file.
//
// Three suites used to pull these plans out of rp7b.html with a regex over
// `plan: [ '...' , ]`. That worked for exactly as long as the plans were typed
// literals — the moment v0.99.0 generated them from the size ladder, all three
// reported "lost its plan" and went red over a refactor that had broken nothing.
//
// ★★ That is the same mistake as the enemy-distribution retraction: measuring
//   the SOURCE instead of the WORLD. A plan that is computed is still a plan;
//   the only honest way to read it is to boot the game and look at the array.
//   This helper does that once, so no suite has to know how the plan was made.
import { bootGame } from './boot_game.mjs';

const NAMES = ['INTERIOR_SEER_HQ_1F','INTERIOR_SEER_HQ_R2','INTERIOR_SEER_HQ_2F','INTERIOR_SEER_HQ_B'];
let _G = null;
export function hqGame(extra = []){
  if (!_G){
    // ★ try/finally, not two statements. My first cut restored console.log on
    //   the line AFTER bootGame — so when the boot threw, the restore never ran,
    //   every subsequent print went into the void, and the suite exited silently
    //   with one header on screen and no error. A muted logger has to be
    //   unmuted on the failure path or a crash looks like a hang.
    const L = console.log; console.log = () => {};
    try {
      _G = bootGame({ extra: NAMES.concat(['HQ','HQ_AT','interiorSize','INTERIOR_SCALE',
        'SEER_HQ_WALLS_ON','seerHqPlan','hqStair'], extra) });
    } finally { console.log = L; }
  }
  return _G;
}
// One floor, in the shape the old regex produced — plus the live object, so a
// suite can reach anything the literal used to hide.
export function hqFloor(name){
  const G = hqGame();
  const I = G[name];
  if (!I) throw new Error(`${name} is not exported from the build`);
  return { plan: I.plan, spawn: I.spawn, exit: I.exit, cols: I.cols, rows: I.rows,
           doorTargets: I.doorTargets || {}, stairsList: I.stairsList || [], live: I };
}
export function hqAll(){
  const out = {};
  for (const n of NAMES) out[n] = hqFloor(n);
  return out;
}
export { NAMES as HQ_NAMES };
