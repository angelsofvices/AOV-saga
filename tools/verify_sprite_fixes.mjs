// ★★★★ v0.97.8 · FOUR THINGS THE CREATOR COULD SEE AND THE SUITES COULD NOT.
//
//   "make sure the daemon frames have no clipping or cell bleed please. also
//    make them the same size as mori. also make sure seer grunts run straight
//    line, not the zig zag line they currently do. crepts have that same zig
//    zag run too. idk why though. also make sure morlisks stays same size when
//    they fly. rn they shrinks on flight."
//
// ★ Every one of these was visible in one glance at the screen and invisible to
//   ~240 passing suites, because the suites checked that things EXIST and this
//   is about how they MOVE and how big they LOOK.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import { createRequire } from 'module';
const _allSrc = createRequire(import.meta.url)('./lib/all_src.cjs');

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const src = _allSrc();
const G = bootGame();

// ★ _chaseDirFor lives inside the same wrapper as tickNPC, so it is not a
//   global and the harness cannot export it. Extract the REAL source and run
//   that — testing a re-implementation would only prove my copy works.
function grabFn(name){
  const i = src.indexOf(`function ${name}(`);
  if (i < 0) return null;
  let j = src.indexOf('{', i), d = 0;
  do { if (src[j] === '{') d++; else if (src[j] === '}') d--; j++; } while (d);
  return src.slice(i, j);
}
const _chaseSrc = grabFn('_chaseDirFor');
const _chaseDirFor = _chaseSrc ? new Function(_chaseSrc + '; return _chaseDirFor;')() : null;

H('★★★★ THE ZIG-ZAG · one cause, shared by Seer Grunts and Crepts');
{
  // ★★★ THEY SHARE IT BECAUSE THEY SHARE THE CODE — both are `mode: 'drainer'`,
  //   and the chase step re-picked its axis every single step:
  //       if (|dx| >= |dy|) horizontal; else vertical;
  //   On a diagonal approach each step shortens the longer axis, which makes
  //   the OTHER axis longer, so the test flips next step. right, down, right,
  //   down — a perfect staircase, with the sprite's FACING flipping along with
  //   it twice a second.
  ok(typeof _chaseDirFor === 'function', 'the axis-commitment helper is live (extracted from the build)');
  ok(!/if \(Math\.abs\(dxp\) >= Math\.abs\(dyp\)\) dir = dxp > 0/.test(src),
     '★★ the greedy per-step axis pick is gone from the chase');
  ok(!/if \(Math\.abs\(dxp\) >= Math\.abs\(dyp\)\) pdir = dxp > 0/.test(src),
     '★ and from the prowl, which had an identical copy');

  // ★★★★ DRIVE IT. Walk a fake chaser diagonally at a target and count how
  //   many times it changes direction. A staircase turns on nearly every step;
  //   a committed run turns once.
  const walk = (dx0, dy0) => {
    const n = { tileX: 0, tileY: 0, _chaseAxis: null };
    const dirs = [];
    for (let i = 0; i < 40; i++){
      const dxp = dx0 - n.tileX, dyp = dy0 - n.tileY;
      if (dxp === 0 && dyp === 0) break;
      const d = _chaseDirFor(n, dxp, dyp, () => false);   // nothing blocked
      dirs.push(d);
      if (d === 'right') n.tileX++; else if (d === 'left') n.tileX--;
      else if (d === 'down') n.tileY++; else n.tileY--;
    }
    let turns = 0;
    for (let i = 1; i < dirs.length; i++) if (dirs[i] !== dirs[i-1]) turns++;
    return { steps: dirs.length, turns, path: dirs.join(',') };
  };
  for (const [dx, dy, label] of [[10, 10, 'perfect diagonal'], [12, 7, 'shallow'], [5, 14, 'steep']]){
    const r = walk(dx, dy);
    ok(r.turns <= 1, `★★★ ${label} (${dx},${dy}): ${r.steps} steps, ${r.turns} direction change(s)`);
  }
  // ★ and the old behaviour, for contrast — this is what the Creator was seeing
  const greedy = (dx0, dy0) => {
    let x = 0, y = 0, last = null, turns = 0, steps = 0;
    while ((x !== dx0 || y !== dy0) && steps < 40){
      const dxp = dx0 - x, dyp = dy0 - y;
      const d = Math.abs(dxp) >= Math.abs(dyp) ? (dxp > 0 ? 'right' : 'left')
                                               : (dyp > 0 ? 'down' : 'up');
      if (last && d !== last) turns++;
      last = d; steps++;
      if (d === 'right') x++; else if (d === 'left') x--; else if (d === 'down') y++; else y--;
    }
    return turns;
  };
  ok(greedy(10, 10) >= 15,
     `★★★★ the old greedy pick turned ${greedy(10,10)} times over the same 20 steps — that was the zig-zag`);

  // both species must actually reach this code
  const creeper = G.NPCS.find(n => n && n._verdantCreeper);
  ok(creeper && creeper.mode === 'drainer', '★ Crepts are drainers · they use the fixed path');
  ok(/mode:\s*'drainer'/.test(src), '★ and so are the Seer Grunts');
}

H('★★★ MORLISK · the shrink was the ART, and the cycle now skips the bad frame');
{
  // ★★★ MEASURED: across every row of morlisk-fly the TORSO runs
  //   195 / 175 / 92 / 180 px — the third frame is drawn at roughly HALF the
  //   zoom of its neighbours. drawH = bh x scale, so it renders at half size
  //   and the Morlisk pulses 2.2x a flap. The idle sheet varies 1.06-1.43x.
  //   ★ No scale rule fixes an off-model frame: normalising it UP 2.3x draws a
  //     blurry giant with a 313px wingspan. The cycle skips it instead.
  const m = G.NPCS.find(n => n && n._morlisk);
  ok(!!m, 'a Morlisk exists');
  if (m){
    ok(!!(m._bankCols && m._bankCols.fly), 'it declares _bankCols for the fly bank');
    ok(JSON.stringify(m._bankCols.fly) === '[0,1,3]',
       `★★★ the fly cycle plays ${JSON.stringify(m._bankCols.fly)} — col 2 omitted`);
    ok(!m._bankCols.idle && !m._bankCols.run,
       '★ and only the fly bank · every other bank keeps its shipped timing');
  }
  ok(/if \(n\._bankCols && n\._activeSheetKey/.test(src),
     '★★ drawNPC honours the omission · opt-in, so nothing else is touched');
  ok(/let col\s+= _attackCol/.test(src),
     '★ and `col` became reassignable for it, rather than a second variable');
}

H('★★★ DAEMON · no cell bleed, and the same size as a Mori');
{
  // ★★★ THE BLEED WAS ONE COLUMN. The Daemon is drawn off-centre in col 0 — its
  //   component runs 41px PAST its own cell line, which is legal and owned. What
  //   was not legal: col 1's RECTANGLE began 10px inside col 0's creature, so
  //   every frame-2 draw carried a strip of frame 1's shoulder. Row 2 was worst
  //   at 23px. "A component may overhang its cell; a rectangle may not contain
  //   a neighbour's art."
  const mm = /const DAEMON_WALK_BBOXES = \[([\s\S]*?)\n\];/.exec(src);
  ok(!!mm, 'DAEMON_WALK_BBOXES found');
  const rows = [...mm[1].matchAll(/\[\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)\]/g)]
                 .map(r => r.slice(1).map(Number));
  ok(rows.length === 16, `${rows.length} boxes`);
  const C = 313;
  let worst = 0;
  for (let r = 0; r < 4; r++){
    const c0 = rows[r*4], c1 = rows[r*4+1];
    const c0Right = c0[0] + c0[2];            // where col 0's box ends, in cell coords
    const c1Left  = C + c1[0];                // where col 1's box starts, absolute
    worst = Math.max(worst, c0Right - c1Left);
  }
  ok(worst <= 0, `★★★ no row's col-1 box reaches back into col 0 (worst overlap ${worst}px, was 23)`);
  ok(rows[0][0] === 154 && rows[0][2] === 201,
     '★ and col 0 keeps its overhang · that part was always correct');

  // sizing · both DOWN poses must draw the same height
  ok(/const ROAM_SCALE_MUL = \{ daemon: 1\.035 \}/.test(src),
     '★★ daemon carries a 1.035 draw scale');
  const d = G.NPCS.find(n => n && n._roamKind === 'daemon');
  ok(d && Math.abs((d.scaleMul || 1) - 1.035) < 1e-6,
     `★★★ and every spawned Daemon carries it (${d ? d.scaleMul : 'none'})`);
  // the arithmetic the number came from
  const moriDown = 265, moriRef = 265, dDown = 240, dRef = 248;
  const moriH = moriDown / moriRef * 2;
  const dH    = dDown / dRef * 2 * 1.035;
  ok(Math.abs(moriH - dH) < 0.02,
     `★★ Mori DOWN draws ${moriH.toFixed(2)} tiles, Daemon DOWN ${dH.toFixed(2)} — `
     + 'matched on the pose you actually look at, not on two different maxima');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ straight-line chases · Morlisk holds its size · Daemon clean and Mori-sized');
process.exit(f ? 1 : 0);
