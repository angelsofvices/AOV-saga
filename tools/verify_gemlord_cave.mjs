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
import fs from 'fs';
import path from 'path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const TILE = 48;

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['INTERIOR_CAVE','INTERIOR_CAVE_F2','INTERIOR_CAVE_F3','walkable','game','player',
  'caveFloorUnlock','CAVE_F2_LEVEL','CAVE_UP_Y','grantDistrictKey','gemlordCavesOpen','GEMLORD_CAVE_FLOOR',
  'GEMLORD_THRONE','GEMLORD_BY_DIST','gemlordThroneScene','NPCS',
  'interiorConfig','CAVE_STAIR_X','CAVE_STAIR_W','CAVE_STAIR_Y','CAVE_STAIR_VIS','CAVE_LAND',
  'GEMLORD_CAVE_INTERIORS','STAIRCASE_UP_BBOX'] });
console.log = _L;

// ★★★★ v0.99.37 · THREE FLOORS, GOING DOWN. This suite was written at v0.99.14
//   for a cave with a second story going UP — my reading of "second story" then,
//   and wrong about the fiction: a cave descends. Creator: "the cave then goes
//   downwards... 3 interior floors total... the gemlords will all sit at the
//   bottom level of each cave."
const FLOORS = [['interior_cave', G.INTERIOR_CAVE],
                ['interior_cave_f2', G.INTERIOR_CAVE_F2],
                ['interior_cave_f3', G.INTERIOR_CAVE_F3]];
// ★ a floor may have ONE stair or TWO · always ask through here
const setsOf = I => I.stairsList || (I.stairs ? [I.stairs] : []);
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
    for (const st of setsOf(I)){
      const t = st.triggers;
      ok(t.length === 3, `  ${scene.padEnd(17)} ${st.art.padEnd(4)} ${t.length} trigger tiles · a 3-wide stair you can only take from the middle is 1 wide`);
      ok(t.every(([x, y]) => w.has(x + ',' + y)), '  ★★ and all three are walkable · a trigger inside a wall never fires');
      const xs = t.map(p => p[0]).sort((a, b) => a - b);
      ok(xs[2] - xs[0] === 2 && new Set(t.map(p => p[1])).size === 1,
         `  ★ CONTIGUOUS on one row (x ${xs[0]}-${xs[2]}, y ${t[0][1]}) · three scattered tiles are not a staircase`);
    }
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

H('★★★★ THE SHAFT GOES DOWN, AND EVERY FLOOR KNOWS WHICH WAY');
{
  const all = [['interior_cave_f2', G.INTERIOR_CAVE_F2], ['interior_cave_f3', G.INTERIOR_CAVE_F3]];
  for (const [scene, I] of all)
    ok(!!G.interiorConfig(scene), `${scene} resolves · an unregistered scene is a black screen with a live player in it`);
  const sets = I2 => I2.stairsList || (I2.stairs ? [I2.stairs] : []);
  ok(sets(G.INTERIOR_CAVE).every(s2 => s2.art === 'down'),
     '★★★★ F1 only goes DOWN · the art is set EXPLICITLY, because the renderer infers UP from a target ending in _2f and would have drawn an up-stair on every descent');
  const f2 = sets(G.INTERIOR_CAVE_F2);
  ok(f2.length === 2 && f2.some(x => x.art === 'down') && f2.some(x => x.art === 'up'),
     '★★★ the middle floor has BOTH · one down to F3, one back up to F1');
  ok(sets(G.INTERIOR_CAVE_F3).every(s2 => s2.art === 'up'),
     '★★ and the bottom only goes back up · there is nothing below the Gemlord');
  // ★★★★ two shafts on one floor CANNOT share tiles, or the first found wins forever
  const tiles = f2.flatMap(x => x.triggers.map(t => t.join(',')));
  ok(new Set(tiles).size === tiles.length,
     `★★★★ F2's two shafts occupy ${new Set(tiles).size} distinct tiles · put them on the same three and one becomes unreachable forever`);
  ok(G.CAVE_UP_Y !== 1, `★★ the up-shaft is on row ${G.CAVE_UP_Y}, the down-shaft on row 1 · a switchback, not a stack`);
}

H('★★★★ THREE FLOORS, THREE DIFFERENT KEYS');
{
  //   Creator: "players can enter the main floor once they have the village key
  //   of the respective districts... seal each level by rizer progress/level...
  //   not yet find the gemlord until you have a key of mealux to open the
  //   bottom floor."
  const P = G.player;
  P.items = {}; P.rizerLvl = 1; P.gemlordCavesOpen = false; P.party = [];
  G.game.devMaxBond = false;
  const u = f => G.caveFloorUnlock('malezor', f);
  ok(u(1).open === false && /MALEZOR KEY/.test(u(1).why),
     '★★★★ F1 refuses without the district key, and names it');
  G.grantDistrictKey('malezor', 'TEST');
  ok(u(1).open === true, '★★★ the village key opens the mouth');
  ok(u(2).open === false && /RIZER LV/.test(u(2).why),
     `★★★★ F2 still refuses · it wants a LEVEL, not a key · "${u(2).why.slice(0, 54)}…"`);
  ok(u(3).open === false && /MEALUX/.test(u(3).why),
     '★★★★ and F3 refuses for a THIRD reason · the Key of Mealux');
  P.rizerLvl = G.CAVE_F2_LEVEL.malezor;
  ok(u(2).open === true && u(3).open === false,
     `★★★ at Lv${P.rizerLvl} the middle floor opens and the bottom does NOT · you can explore a cave long before you can finish it, which is the whole design`);
  P.gemlordCavesOpen = true;
  ok(u(3).open === true, '★★★ and the Mealux opens the Gemlord floor');
  // ★★★ the Mealux gate MOVED · it used to sit on the cave mouth
  const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
  const enter = src.slice(src.indexOf('function tryEnterGemlordCave'), src.indexOf('function tryEnterTrainingFarm'));
  ok(!/if \(!gemlordCavesOpen\(\)\)/.test(enter),
     '★★★★ the mouth no longer tests the Mealux · that made the cave all-or-nothing, and the Mealux now buys the thing it is actually about');
  ok(/caveFloorUnlock\(_cd, 1\)/.test(enter), '★★ it asks the same predicate every floor asks');
  // ★★ levels climb with the district ladder
  const lv = Object.values(G.CAVE_F2_LEVEL);
  ok(lv.every((n, i) => i === 0 || n >= lv[i - 1]), `★★ F2 level gates climb across districts · ${lv.join(' ')}`);
  P.items = {}; P.rizerLvl = 1; P.gemlordCavesOpen = false;
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
    ok(setsOf(I).every(st => st.triggers.every(([x, y]) => seen.has(x + ',' + y))),
       `  ★★★★ every stair tile is REACHABLE on foot from the spawn (${seen.size}/${w.size} tiles reached)`);
    if (I.exit) ok(seen.has(I.exit.x + ',' + I.exit.y), '  ★★★ and so is the way out · sealing the border must not seal the door');
    else ok(!I.autoExit, '  ★★ a lower floor has no mouth · the shaft is the only way out');
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

H('★★★ TEN CAVE FLOORS, ONE PER DISTRICT');
{
  //   Delivered 2026-09-24 alongside the Elder keys. 1254² seamless textures
  //   with no chroma to key — they are full-bleed floors, not sprites.
  // ★★★ Nine of the ten are wired and WAITING rather than used, because only
  //   Rakoron's cave has a carved interior. That is the right way round: the
  //   table is the seam, so carving a cave becomes a config change instead of
  //   an asset hunt.
  const F = G.GEMLORD_CAVE_FLOOR;
  ok(Object.keys(F).length === 10, `${Object.keys(F).length} floors declared`);
  const gone = Object.entries(F).filter(([, p3]) => !fs.existsSync(path.join(ROOT, decodeURIComponent(p3))));
  ok(!gone.length,
     `★★★ every one resolves to a real file${gone.length ? ' · MISSING: ' + gone.map(x => x[0]).join(', ') : ''}`);
  ok(/gemlordCaveFloorSrc\('malezor'\)/.test(fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8')),
     "★★ and the carved cave reaches its floor THROUGH the table, not by a hard-coded path");
}

H('★★★★ THE GEMLORD SITS ON THE BOTTOM FLOOR');
{
  //   Creator, 2026-09-24: "the gemlords will all sit at the bottom level of
  //   each cave."
  // ★★★★ RAKORON WAS STILL ON F1. He was placed at (10,3) when the cave was a
  //   single room, so digging two floors under him at v0.99.37 left the Gemlord
  //   standing in the ENTRANCE — three gates leading down to empty rock while
  //   the boss waited by the door. Nothing errored; the descent was just
  //   pointless, which is the kind of bug a suite has to be told to look for.
  const r = G.NPCS.find(n => n && n.id === 'rakoron_cave_boss');
  ok(!!r, 'Rakoron exists');
  ok(r.scene === 'interior_cave_f3' && r.homeScene === 'interior_cave_f3',
     `★★★★ he is on the BOTTOM floor (${r.scene}), not the entrance`);
  ok(r.tileX === G.GEMLORD_THRONE.x && r.tileY === G.GEMLORD_THRONE.y,
     `★★★ at the throne tile (${r.tileX},${r.tileY}) · one constant serves all ten caves, since every F3 is the same room`);
  G.game.scene = 'interior_cave_f3';
  ok(!G.walkable(r.tileX, r.tileY), '★★ he BLOCKS his tile · you face the Gemlord, you do not walk through him');
  const nb = [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy]) => [r.tileX+dx, r.tileY+dy])
    .filter(([x,y]) => G.walkable(x,y));
  ok(nb.length >= 1, `★★ ${nb.length} approach tile(s) · a boss you cannot stand beside cannot be spoken to`);
  // ★★★★ and he must be REACHABLE from where a descent drops you
  const I = G.INTERIOR_CAVE_F3;
  const set = new Set();
  for (let y = 0; y < I.rows; y++) for (let x = 0; x < I.cols; x++) if (G.walkable(x, y)) set.add(x + ',' + y);
  const st = I.spawn.x + ',' + I.spawn.y;
  const seen = new Set([st]); const stk = [st];
  while (stk.length){
    const [x, y] = stk.pop().split(',').map(Number);
    for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const k = (x+ox) + ',' + (y+oy);
      if (set.has(k) && !seen.has(k)){ seen.add(k); stk.push(k); }
    }
  }
  ok(nb.some(([x, y]) => seen.has(x + ',' + y)),
     `★★★★ reachable on foot from where the descent lands you · ${Math.abs(I.spawn.y - r.tileY)} rows of floor between you and him`);
  G.game.scene = 'overworld';
  // ★★ the other nine are DATA, waiting on their caves
  ok(Object.keys(G.GEMLORD_BY_DIST).length === 10, 'all ten Gemlords are mapped to their districts');
  const carved = Object.keys(G.GEMLORD_BY_DIST).filter(d => G.gemlordThroneScene(d));
  ok(carved.join() === 'malezor',
     `★★ only ${carved.join(', ') || 'none'} has a carved cave today · the other nine resolve to null, so the row is a placeholder rather than a line to write later`);
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ border sealed both floors · 3-wide stairs that draw 3 wide · two storeys, fully walkable');
process.exit(f ? 1 : 0);
