// ★★★★ v0.99.14 · THE GEMLORD CAVE HAD EXACTLY ONE WALL.
//
//   Creator, 2026-09-20: "fix collision on all gemlord cave borders and
//   stairs. stairs three tiles wide. cave has an imaginary z axis second story"
//
// ★★★★ walkable() blocks row 0 for any cfg carrying a wallImg — `if
//   (cfg.wallImg && y === 0) return false` — and nothing else. Mapped by
//   driving the booted game rather than reading the config, the 30x30 cave came
//   back 869/900 open: the whole left column, right column and bottom row were
//   walkable floor with wall painted over them. On the ORIGINAL 10x25 shaft the
//   art reached the grid edge and the grid bound WAS the wall, so one band
//   sufficed. The v0.99.0 cave rung grew the room to 30x30 and quietly ended
//   that — the bug was introduced by a resize that touched none of this code.
import { bootGame } from './lib/boot_game.mjs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const TILE = 48;

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['INTERIOR_CAVE','INTERIOR_CAVE_2F','walkable','game','player',
  'interiorConfig','CAVE_STAIR_X','CAVE_STAIR_W','CAVE_STAIR_Y','CAVE_STAIR_VIS','CAVE_LAND',
  'GEMLORD_CAVE_INTERIORS','STAIRCASE_UP_BBOX'] });
console.log = _L;

const FLOORS = [['interior_cave', G.INTERIOR_CAVE], ['interior_cave_2f', G.INTERIOR_CAVE_2F]];
const mapOf = (scene, I) => { G.game.scene = scene; const w = new Set();
  for (let y = 0; y < I.rows; y++) for (let x = 0; x < I.cols; x++) if (G.walkable(x, y)) w.add(x + ',' + y);
  return w; };

H('★★★★ EVERY BORDER IS ROCK · not just the one row that had a wall band');
{
  for (const [scene, I] of FLOORS){
    const w = mapOf(scene, I);
    const open = [];
    for (let x = 0; x < I.cols; x++){ if (w.has(x + ',0')) open.push([x,0]); if (w.has(x + ',' + (I.rows-1))) open.push([x,I.rows-1]); }
    for (let y = 0; y < I.rows; y++){ if (w.has('0,' + y)) open.push([0,y]); if (w.has((I.cols-1) + ',' + y)) open.push([I.cols-1,y]); }
    const mouth = I.exit ? 1 : 0;
    ok(open.length === mouth,
       `  ${scene.padEnd(17)} ${open.length} open border tile(s), expected ${mouth}`
     + (I.exit ? ` · the exit mouth at ${I.exit.x},${I.exit.y}` : ' · no mouth, the stair is the only way out')
     + (open.length > mouth ? ` · STILL OPEN: ${JSON.stringify(open.slice(0,6))}` : ''));
    if (I.exit) ok(w.has(I.exit.x + ',' + I.exit.y), '  ★★ and the mouth itself is still walkable · a sealed exit traps the player');
  }
}

H('★★★ THE STAIRS ARE THREE TILES WIDE · all three of them work');
{
  ok(G.CAVE_STAIR_W === 3, `CAVE_STAIR_W = ${G.CAVE_STAIR_W}`);
  for (const [scene, I] of FLOORS){
    const w = mapOf(scene, I);
    const t = I.stairs.triggers;
    ok(t.length === 3, `  ${scene.padEnd(17)} ${t.length} trigger tiles · a 3-wide stair you can only take from the middle is 1 wide`);
    ok(t.every(([x, y]) => w.has(x + ',' + y)), '  ★★ and all three are walkable · a trigger inside a wall never fires');
    const xs = t.map(p => p[0]).sort((a, b) => a - b);
    ok(xs[2] - xs[0] === 2 && new Set(t.map(p => p[1])).size === 1,
       `  ★ they are CONTIGUOUS on one row (x ${xs[0]}-${xs[2]}) · three scattered tiles are not a staircase`);
  }
}

H('★★★ AND THE ART ACTUALLY FILLS THOSE THREE TILES');
{
  // ★★★★ The draw fits the sprite inside visW x visH at its OWN aspect
  //   ([[image-never-stretch-console-fullscreen]]), so the BOX HEIGHT decides
  //   the drawn WIDTH. At visH 3 a 3-tile footprint renders 2.03 tiles wide —
  //   a stair asked to be three wide, drawn two wide, with bare floor either
  //   side. Asserting the footprint alone would have called that a pass.
  const [, , sw, sh] = G.STAIRCASE_UP_BBOX;
  const V = G.CAVE_STAIR_VIS;
  const scale = Math.min((V.visW * TILE) / sw, (V.visH * TILE) / sh);
  const drawnW = sw * scale / TILE;
  ok(Math.abs(drawnW - 3) < 0.02,
     `★★★ drawn ${drawnW.toFixed(2)} of ${V.visW} tiles wide at visH ${V.visH} · width saturates only at visH>=5`);
  ok(V.visY + V.visH - 1 === G.CAVE_STAIR_Y,
     `★★ bottom-anchored ON the trigger row (visY ${V.visY} + visH ${V.visH} - 1 = ${G.CAVE_STAIR_Y}) · `
   + 'a staircase stands on its base tile the way a character stands on its feet');
}

H('★★★★ THE IMAGINARY Z AXIS · two floors, one staircase, no way to get stuck');
{
  ok(!!G.interiorConfig('interior_cave_2f'),
     '★★★★ interior_cave_2f resolves · an unregistered scene is a black screen with a live player in it');
  ok(G.INTERIOR_CAVE.stairs.target === 'interior_cave_2f'
     && G.INTERIOR_CAVE_2F.stairs.target === 'interior_cave',
     '★★★ 1F points up at 2F and 2F points back down · the same staircase from both sides');
  ok(G.INTERIOR_CAVE_2F.cols === G.INTERIOR_CAVE.cols && G.INTERIOR_CAVE_2F.rows === G.INTERIOR_CAVE.rows,
     `★★ both floors are ${G.INTERIOR_CAVE.cols}x${G.INTERIOR_CAVE.rows} · a storey above a different footprint is not a storey`);
  // ★★★ Landing must never be ON a trigger, or arriving re-fires the stair and
  //   only the 1s cooldown stands between the player and a ping-pong.
  for (const [scene, I] of FLOORS){
    const land = I.stairs.spawnAt;
    const onTrigger = I.stairs.triggers.some(([x, y]) => x === land.x && y === land.y);
    ok(!onTrigger, `  ${scene.padEnd(17)} lands at ${land.x},${land.y} · NOT on a trigger tile`);
    const w = mapOf(scene, I);
    ok(w.has(land.x + ',' + land.y), '  ★★ and the landing tile is walkable');
  }
  // ★★ The art heuristic reads the target name: `target.endsWith('_2f')` picks
  //   the UP sprite. Our naming has to satisfy it or both floors draw a
  //   down-stair, including the one that goes up.
  ok(G.INTERIOR_CAVE.stairs.target.endsWith('_2f') && !G.INTERIOR_CAVE_2F.stairs.target.endsWith('_2f'),
     '★★ 1F draws the UP sprite, 2F the DOWN sprite · the renderer infers it from the target name');
  ok(!G.INTERIOR_CAVE_2F.exit && !G.INTERIOR_CAVE_2F.autoExit,
     '★ 2F has no mouth and no autoExit · INTERIOR_HOME_2F is the proven exit-less precedent');
}

H('★★★★ YOU CAN ACTUALLY WALK IT · flood-fill, not a config read');
{
  for (const [scene, I] of FLOORS){
    const w = mapOf(scene, I);
    const start = I.spawn.x + ',' + I.spawn.y;
    ok(w.has(start), `  ${scene.padEnd(17)} spawn ${start} is walkable`);
    const seen = new Set([start]); const st = [start];
    while (st.length){
      const [x, y] = st.pop().split(',').map(Number);
      for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const k = (x+ox) + ',' + (y+oy);
        if (w.has(k) && !seen.has(k)){ seen.add(k); st.push(k); }
      }
    }
    ok(I.stairs.triggers.every(([x, y]) => seen.has(x + ',' + y)),
       `  ★★★★ all three stair tiles are REACHABLE on foot from the spawn (${seen.size}/${w.size} tiles reached)`);
    if (I.exit) ok(seen.has(I.exit.x + ',' + I.exit.y), '  ★★★ and so is the way out · sealing the border must not seal the door');
    ok(seen.size === w.size,
       `  ★★ no walkable tile is stranded · ${w.size - seen.size} unreachable`);
  }
}

H('★ THE CAVE THE DOORS ACTUALLY OPEN IS THIS ONE');
{
  const carved = Object.entries(G.GEMLORD_CAVE_INTERIORS || {});
  ok(carved.length >= 1, `${carved.length} gemlord cave(s) have a carved interior · the other nine are doors waiting on sanctums`);
  ok(carved.every(([, v]) => v.cfg() === G.INTERIOR_CAVE),
     `★★ every carved gemlord door leads to INTERIOR_CAVE · so fixing it fixes "all gemlord cave borders"`);
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ border sealed both floors · 3-wide stairs that draw 3 wide · two storeys, fully walkable');
process.exit(f ? 1 : 0);
