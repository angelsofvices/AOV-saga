// ★★★ v0.96.90 · EVERY DOOR IN THE SEER HQ GOES SOMEWHERE.
//
// Creator: "I cannot enter the main floor door in the seer hq. that door
// should lead me to r2 where the up and down staircases are."
//
// ★★ IT WAS TWO FAILURES STACKED, AND BOTH WERE SILENT.
//   1. The 1F door called enterInterior(), whose FIRST LINE is
//        if (game.scene !== 'overworld') return;
//      — and you are inside a building when you press X. It returned instantly
//      every time, while the playSFX('confirm') on the next line still fired.
//      The door acknowledged you and refused to move you.
//   2. R2's plan still carried a 'D' at (17,7) that its own comment claimed
//      had been deleted at v0.95.980 — a full grand door, drawn three tiles
//      tall, wired to nothing.
//
// ★ So this suite does not check that doors exist. It checks that every door
//   tile in the building HAS A DESTINATION, and that the destination is a real
//   scene — the two things a comment cannot guarantee.
import fs from 'fs';
import vm from 'vm';   // ★ still needed below: the step-path block is DRIVEN against a synthetic door, which is the one place a fake context is the right tool
import { hqGame } from './lib/hq_floors.mjs';
const src = fs.readFileSync('/tmp/all.js', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

function grabObj(n){ const i = src.indexOf('const ' + n + ' = {'); if (i < 0) return '';
  let j = src.indexOf('{', i), d = 0; do { if (src[j]==='{') d++; else if (src[j]==='}') d--; j++; } while (d);
  return src.slice(i, j) + ';'; }
function grabFn(n){ const i = src.indexOf('function ' + n + '('); if (i < 0) return '';
  let j = src.indexOf('{', i), d = 0; do { if (src[j]==='{') d++; else if (src[j]==='}') d--; j++; } while (d);
  return src.slice(i, j); }

const FLOORS = ['INTERIOR_SEER_HQ_1F', 'INTERIOR_SEER_HQ_R2', 'INTERIOR_SEER_HQ_B', 'INTERIOR_SEER_HQ_2F'];
const SCENES = { INTERIOR_SEER_HQ_1F:'interior_seer_hq_1f', INTERIOR_SEER_HQ_R2:'interior_seer_hq_r2',
                 INTERIOR_SEER_HQ_B:'interior_seer_hq_b',  INTERIOR_SEER_HQ_2F:'interior_seer_hq_2f' };
// ★★★★ v0.99.0 · WAS A HAND-BUILT VM. This suite used to slice the four floor
//   literals out of rp7b.html, stub every image they name, and eval them in a
//   fresh vm context. That is a faithful reproduction of the objects only while
//   they are self-contained literals — the moment v0.99.0 built them from the
//   size ladder, the slice pulled in calls to seerHqPlan(), interiorSize() and
//   hqStair() that the stub context had never heard of, and the suite died
//   before its first assertion.
//   ★ Booting the real game is both less code and more honest: floorPlan() and
//     planDoorAt() are then the SHIPPED functions operating on the SHIPPED
//     objects, rather than my reconstruction of both.
const G = hqGame(['floorPlan','planDoorAt','SEER_HQ_WALLS_ON']);
const R = expr => new Function('G', 'with (G) { return (' + expr + '); }')(G);

H(`★ SEER_HQ_WALLS_ON = ${R('SEER_HQ_WALLS_ON')}`);
console.log('      (walls off turns every "#" into floor — so a door is the only');
console.log('       solid tile left, and it had better be a working one)');

H('★★★ EVERY DOOR TILE HAS A DESTINATION');
{
  let orphans = 0, total = 0;
  for (const F of FLOORS){
    const plan = R(`floorPlan(${F})`);
    if (!plan) continue;
    for (const d of plan.doors){
      total++;
      const t = R(`planDoorAt(${F}, ${d.x}, ${d.y})`);
      if (!t){ orphans++; console.log(`       ✖ ${SCENES[F]} draws a door at (${d.x},${d.y}) that goes NOWHERE`); }
      else if (!Object.values(SCENES).includes(t.target) && !/interior_/.test(t.target)){
        orphans++; console.log(`       ✖ ${SCENES[F]} (${d.x},${d.y}) points at unknown scene ${t.target}`);
      }
    }
    console.log(`      ${SCENES[F].padEnd(22)} ${plan.doors.length} door tile(s), ` +
                `${Object.keys(R(`${F}.doorTargets || {}`)).length} target(s)`);
  }
  ok(orphans === 0, `${total} door tile(s) across the building, none orphaned`);
}

H('★★ THE 1F DOOR LEADS TO R2, AND R2 LEADS BACK');
{
  // ★★★ v0.99.0 · (17,7) and (17,21) were the 35x25 tiles. Every official
  //   building is on one rung now, so a door's position is a RELATIONSHIP —
  //   the hall's door is at the middle of the lowest wall-band row, and the way
  //   back is the hall's own threshold. Cite the anchors the building is built
  //   from and this check never needs touching again.
  const D = { x: G.HQ.midX, y: G.HQ.doorY };
  const t = G.planDoorAt(G.INTERIOR_SEER_HQ_1F, D.x, D.y);
  ok(!!t && t.target === 'interior_seer_hq_r2', `1F (${D.x},${D.y}) → interior_seer_hq_r2`);
  ok(!!(t && t.spawnAt), `and names where you land: ${JSON.stringify(t && t.spawnAt)}`);
  ok(G.floorPlan(G.INTERIOR_SEER_HQ_1F).blocked.has(`${D.x},${D.y}`), 'the door tile itself is solid');
  ok(!G.floorPlan(G.INTERIOR_SEER_HQ_1F).blocked.has(`${D.x},${D.y + 1}`),
     '★ and the tile you press X from is standable');
  const BK = { x: G.HQ.midX, y: G.HQ.botFloorY };
  const b = G.planDoorAt(G.INTERIOR_SEER_HQ_R2, BK.x, BK.y);
  ok(!!b && b.target === 'interior_seer_hq_1f', `R2 (${BK.x},${BK.y}) → back to the hall`);
  ok(b.spawnAt && b.spawnAt.x === G.HQ.midX && b.spawnAt.y === G.HQ.topFloorY,
     `★ landing you under the door at (${b.spawnAt.x},${b.spawnAt.y}), not at the far end of the hall`);
}

H('★★ R2 IS A LANDING, NOT A CORRIDOR · the phantom door is gone');
{
  const plan = R('floorPlan(INTERIOR_SEER_HQ_R2)');
  const north = plan.doors.filter(d => d.y < 10);
  ok(north.length === 0,
     north.length ? `★ R2 still draws a grand door on its north wall at ${JSON.stringify(north)} — wired to nothing`
                  : 'no door on the north wall — the comment and the plan finally agree');
  ok(!G.INTERIOR_SEER_HQ_R2.plan.some(r => r.includes('D')),
     "★ no row of the landing carries a 'D' · was pinned to row 7, which stopped "
   + 'being the wall band the moment the building changed rung');
  const stairs = R('INTERIOR_SEER_HQ_R2.stairsList || []');
  ok(stairs.length === 2, `and the landing has its two staircases (${stairs.length})`);
  const targets = stairs.map(s => s.target).sort();
  ok(targets.includes('interior_seer_hq_b') && targets.includes('interior_seer_hq_2f'),
     `★ one down to the vault, one up to the Commander: ${targets.join(' + ')}`);
}

H('★★★ THE TRANSITION USES THE RIGHT FUNCTION');
{
  const branch = src.slice(src.indexOf('const _door = planDoorAt(cfg, fx, fy);'),
                           src.indexOf('const _door = planDoorAt(cfg, fx, fy);') + 2400);
  ok(!/enterInterior\(_door\.target/.test(branch),
     '★ the door no longer calls enterInterior — it refuses to run outside the overworld');
  ok(/useStairs\(\{ target: _door\.target, spawnAt: _door\.spawnAt \}\)/.test(branch),
     'it calls useStairs, the interior→interior move the staircases already use');
  // ★ and prove the old call really was impossible, rather than asserting it
  const ei = src.slice(src.indexOf('function enterInterior('), src.indexOf('function enterInterior(') + 200);
  ok(/if \(game\.scene !== 'overworld'\) return;/.test(ei),
     "★★ enterInterior's first line is still the overworld guard — that is WHY it failed");
  ok(/game\.overworldReturn = \{ x: player\.x/.test(ei),
     '★ and its second line is why the guard is right: it would overwrite your way home');
  // useStairs must not touch overworldReturn
  const us = src.slice(src.indexOf('function useStairs('), src.indexOf('function exitInterior('));
  ok(!/overworldReturn/.test(us), 'useStairs leaves overworldReturn alone');
  ok(/const spawn = s\.spawnAt \|\|/.test(us), '★ and it actually reads spawnAt');
}

H('★★ STEPPING ONTO A DOOR TILE USES IT');
{
  ok(/interiorWildCfg && interiorWildCfg\.doorTargets/.test(src),
     'the step path checks doorTargets');
  ok(/useStairs\(\{ target: _d\.target, spawnAt: _d\.spawnAt \}\);/.test(src),
     'and takes the same route as X-on-door');
  // drive it
  const blk = src.slice(src.indexOf('  if (interiorWildCfg && interiorWildCfg.doorTargets){'),
                        src.indexOf('  // Interiors are encounter-safe by default.'));
  const calls = [];
  const c2 = vm.createContext({
    console,
    interiorWildCfg: { doorTargets: { '17,21': { target:'interior_seer_hq_1f', spawnAt:{x:17,y:8,dir:'down'} } } },
    interiorConfig: () => ({}),
    useStairs: s => calls.push(s),
    playSFX(){}, player: { x:0, y:0, moving:true },
  });
  const run = (nx, ny) => { calls.length = 0;
    vm.runInContext(`(function(nx,ny){${blk}\nreturn 'fellthrough';})(${nx},${ny})`, c2);
    return calls; };
  ok(run(17, 21).length === 1, '★ stepping onto (17,21) leaves the landing');
  ok(calls[0].spawnAt.y === 8, 'and lands you under the 1F door');
  ok(run(17, 20).length === 0, 'stepping anywhere else does nothing');
  // a locked door must still refuse
  c2.interiorWildCfg.doorTargets['17,21'].locked = () => true;
  ok(run(17, 21).length === 0, '★ and a locked door still refuses a step, not just an X');
}

H(f ? `❌ ${f} failed` : '✅ every door in the building opens, and opens onto a real room');
process.exit(f ? 1 : 0);
