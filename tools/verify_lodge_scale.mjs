// ★★★★ v0.99.51 · TEN TIMES THE ROOM, THE SAME ROOM — and the Fanghall put back.
//
//   Creator, 2026-09-25: "when I said make the fanghall 10x bigger I didnt mean
//   the overworld building. I meant the interior tile map. please put it back
//   where it was. same size, just make the interior world bigger."
//   …then: "sorry I didnt mean the fanghall I meant the bloodscent lodge.
//   thats why it got messed up in the original request too."
//
// ★★★★ THIS FILE USED TO ASSERT THE MISTAKE. It shipped as verify_fanghall_scale
//   at v0.99.43 and its headline check was that the Fanghall's OVERWORLD sprite
//   had grown to 35x32 — a careful, well-measured proof of the wrong thing on
//   the wrong building. Every number in that pass was sound and not one of them
//   was about what was asked. A suite that guards a misreading is worse than no
//   suite: it makes the misreading permanent and calls the correction a
//   regression. So it is repurposed rather than patched, and it now holds BOTH
//   halves of the fix so neither can drift back.
//
// ★★★ THE LESSON WORTH KEEPING is not "measure harder" — I did measure the
//   land, the neighbours and the walk. It is that a building has TWO sizes, and
//   nothing in that pass asked which one was meant.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['WORLD_PROPS','INTERIOR_BLOODSCENT_LODGE','INTERIOR_SCALE',
  'interiorSize','walkable','worldDistrictAt','isWorldLandTile','player'] });
console.log = _L;

const HALL  = G.INTERIOR_BLOODSCENT_LODGE;
const FH    = G.WORLD_PROPS.find(p => p && p.id === 'malezor_the_fanghall');
const at    = (x, y) => ((HALL.plan[y] || '')[x] === '.');
const FLOOR = HALL.plan.reduce((a, r) => a + r.split('').filter(c => c === '.').length, 0);

H('★★★★ THE FANGHALL IS BACK WHERE IT WAS · 11x10, exactly as v0.95.742 shipped it');
{
  ok(!!FH, 'the prop is still there');
  ok(FH.tileW === 11 && FH.tileH === 10,
     `★★★★ ${FH.tileW}x${FH.tileH} · it was grown to 35x32 at v0.99.43 in answer to a request about a different building`);
  ok(FH.footprint.length === 43,
     `★★★ ${FH.footprint.length} solid tiles · 4 rows x 11 columns less the doorstep, the original block`);
  const dys = FH.footprint.map(p => p[1]), dxs = FH.footprint.map(p => p[0]);
  ok(Math.min(...dys) === -3 && Math.max(...dys) === 0,
     `★★ the footprint is ${Math.min(...dys)}..${Math.max(...dys)} deep again`);
  ok(Math.min(...dxs) === -5 && Math.max(...dxs) === 5,
     `★★ and ${Math.min(...dxs)}..${Math.max(...dxs)} wide`);
  ok(!FH.footprint.some(p => p[0] === 0 && p[1] === 0),
     '★★★ the doorstep is still walkable · the one tile the block has always left out');
  ok(G.walkable(FH.tileX, FH.tileY),
     '★★★★ and the door tile really is walkable in the built world · a landmark you cannot stand in front of is a landmark you cannot enter');
}

H('★★★★ THE LODGE INTERIOR IS TEN TIMES THE AREA · which is what was asked');
{
  ok(!!G.INTERIOR_SCALE.hall, 'the `hall` rung exists on the ladder');
  ok(HALL.cols === 63 && HALL.rows === 63,
     `★★★★ the room is ${HALL.cols}x${HALL.rows} · it was 20x20 on the building rung`);
  const ratio = (HALL.cols * HALL.rows) / 400;
  ok(ratio > 9.5 && ratio < 10.5,
     `★★★★ ${(HALL.cols*HALL.rows)} tiles against the old 400 · ${ratio.toFixed(2)}x the AREA`);
  ok(HALL.cols === HALL.rows,
     '★★★ still square · the old room was 1:1 and a square is the only shape that scales without stretching');
  // ★★ the room and its plan must agree, or the walls land in the wrong place
  ok(HALL.plan.length === HALL.rows,
     `★★★★ the plan has ${HALL.plan.length} rows for a ${HALL.rows}-row room`);
  const widths = [...new Set(HALL.plan.map(r => r.length))];
  ok(widths.length === 1 && widths[0] === HALL.cols,
     `★★★★ and every row is exactly ${HALL.cols} characters (${widths.join(', ')}) · one short row silently shifts a wall`);
}

H('★★★★ THE SHAPE IS THE SAME SHAPE · resampled, not redrawn');
{
  // ★★★★ Hand-typing sixty-three rows of a cross-and-throat would drift — a
  //   column off here, a tapered row there — and "keep the same shape" would
  //   quietly stop being true. The plan is a nearest-neighbour upscale of the
  //   original at 63/20, so this suite can re-derive it and compare.
  const SRC = [
    '                    ','    ............    ','    ............    ','    ............    ',
    '    ............    ','....................','....................','....................',
    '....................','    ............    ','    ............    ','    ............    ',
    '    ............    ','      ........      ','       ......       ','        ....        ',
    '        ....        ','        ....        ','        ....        ','                    '];
  const N = HALL.cols, S = 20;
  const want = [];
  for (let y = 0; y < N; y++){
    const sy = Math.min(S - 1, (y * S / N) | 0);
    let row = '';
    for (let x = 0; x < N; x++) row += SRC[sy][Math.min(S - 1, (x * S / N) | 0)];
    want.push(row);
  }
  // the arms and the crossbar must match the resample exactly
  const mouthFrom = 54;                       // the funnel is deliberately different
  const armRows = HALL.plan.slice(0, mouthFrom);
  const bad = armRows.filter((r, i) => r !== want[i]);
  ok(!bad.length,
     `★★★★ rows 0..${mouthFrom - 1} are the exact 63/20 upscale of the 20x20 plan (${bad.length} differ) · `
   + 'the four arms, the crossbar and the funnel are identical by construction, not by eye');
  // ★★★ and the silhouette is the same proportions top to bottom
  const w = r => { const xs = [...r].reduce((a, c, i) => c === '.' ? (a.push(i), a) : a, []); return xs.length ? xs[xs.length-1] - xs[0] + 1 : 0; };
  ok(w(HALL.plan[20]) === HALL.cols,
     `★★★ the crossbar still spans the full width (${w(HALL.plan[20])}/${HALL.cols}) · it did at 20x20 too`);
  ok(w(HALL.plan[4]) < HALL.cols && w(HALL.plan[4]) > 0,
     `★★ and the arms are still inset (${w(HALL.plan[4])} of ${HALL.cols})`);
}

H('★★★★ EXCEPT THE MOUTH, WHICH STAYS DOOR-SIZED ON PURPOSE');
{
  // ★★★★ autoExit is a SINGLE-TILE check — `player.x === exit.x && player.y
  //   === exit.y`. Resampled faithfully the throat would be twelve tiles
  //   across, so eleven of them would be a dead end you walk into wondering
  //   why the door stopped working. A hall can be ten times bigger; a doorway
  //   is sized to a person either way.
  const lastFloor = HALL.plan.reduce((a, r, i) => r.includes('.') ? i : a, 0);
  const mouth = HALL.plan[lastFloor].split('').filter(c => c === '.').length;
  ok(mouth === 4,
     `★★★★ the bottom row of the funnel is ${mouth} tiles wide · the width the throat has had since v0.99.4`);
  ok(lastFloor === HALL.exit.y,
     `★★★ and the exit sits on it (row ${HALL.exit.y}) · the last floor tile of the throat IS the threshold`);
  ok(at(HALL.exit.x, HALL.exit.y), '★★★★ the exit tile is FLOOR · an exit inside a wall is a locked room');
  ok(at(HALL.spawn.x, HALL.spawn.y), '★★★★ and the spawn tile is floor · walking in must not drop you inside a wall');
  ok(HALL.spawn.y === HALL.exit.y - 1 && HALL.spawn.x === HALL.exit.x,
     '★★★ you arrive one tile in from the threshold, facing up · step back onto it to leave, same gesture as every other interior');
  ok(HALL.autoExit === true, '★★ autoExit is still on');
  // the funnel must actually narrow, or the taper did nothing
  const wOf = i => HALL.plan[i].split('').filter(c => c === '.').length;
  ok(wOf(lastFloor - 5) > wOf(lastFloor),
     `★★★ it tapers (${wOf(lastFloor-5)} → ${wOf(lastFloor)} over six rows) rather than stopping dead at a twelve-wide wall`);
}

H('★★★★ AND EVERY TILE OF IT IS WALKABLE FROM THE DOOR');
{
  // ★★★★ A 2,005-tile room is exactly where a stranded pocket hides. Ten times
  //   the floor is ten times the chance that one resampled row pinched shut.
  const seen = new Set([HALL.spawn.x + ',' + HALL.spawn.y]);
  const st = [[HALL.spawn.x, HALL.spawn.y]];
  while (st.length){
    const [x, y] = st.pop();
    for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx = x + a, ny = y + b, k = nx + ',' + ny;
      if (!seen.has(k) && at(nx, ny)){ seen.add(k); st.push([nx, ny]); }
    }
  }
  ok(seen.size === FLOOR,
     `★★★★ all ${FLOOR} floor tiles are reachable on foot from the spawn (${seen.size} flooded) · nothing is walled off`);
  ok(FLOOR > 1900,
     `★★★ ${FLOOR} tiles of actual floor · the 20x20 room had 206, so the walkable space grew ${(FLOOR/206).toFixed(1)}x too`);
  ok(HALL.plan[0].trim() === '' && HALL.plan[HALL.rows - 1].trim() === '',
     '★★ the top and bottom rows are still wall · the room has not been pushed against its own edge');
}

H('★★ THE ROOM IS OTHERWISE UNTOUCHED · only the size changed');
{
  ok(/bloodscent-lodge-floor\.png/.test(HALL.tileImg.src),
     '★★ same floor tile art');
  ok(HALL.label === '◈ BLOODSCENT LODGE', `★ same label (${HALL.label})`);
  ok(Array.isArray(HALL.blocked) && HALL.blocked.length === 0,
     '★★★ still empty · Creator, v0.99.4: "dont add anything in the world yet, just the tiles"');
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  ok(/function bloodscentLodgeUnlocked\(\)\{ return player\.bloodscentLodgeLocked !== true; \}/.test(src),
     '★★ and the door is still unlocked through the same predicate');
}

console.log(f ? `\n❌ ${f} failed`
  : '\n✅ Fanghall back at 11x10 · the Lodge interior is 63x63, the same shape resampled, door-sized mouth, every tile reachable');
process.exit(f ? 1 : 0);
