// v0.95.956 · followers path around terrain.
// The pathfinder is EXTRACTED and RUN against real obstacle maps — reading the
// source cannot tell you whether a companion actually gets around a rock.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

// ── build a world from ASCII and run the real code over it ────────────────
//   '#' solid   '.' open   'F' follower start   'T' target   'P' Rizer
function world(rows){
  const grid = rows.map(r => r.split(''));
  let F = null, T = null, P = null;
  grid.forEach((row, y) => row.forEach((c, x) => {
    if (c === 'F') F = { x, y };
    if (c === 'T') T = { x, y };
    if (c === 'P') P = { x, y };
  }));
  const walkable = (x, y) => !!(grid[y] && grid[y][x] && grid[y][x] !== '#');
  const src =
    H.slice(H.indexOf('const NPC_PATH_MAX_NODES'), H.indexOf('function stepNPCTo'))
    + '\nreturn { npcPathDir, npcNavigateAround, stepNPCTo };';
  const _DIR_VEC = { up:{dx:0,dy:-1}, down:{dx:0,dy:1}, left:{dx:-1,dy:0}, right:{dx:1,dy:0} };
  const player = P ? { x: P.x, y: P.y } : { x: -99, y: -99 };
  const stepNPCTo = (n, nx, ny, d) => {
    if (!walkable(nx, ny)) return false;
    if (player.x === nx && player.y === ny) return false;
    n.tileX = nx; n.tileY = ny; n.dir = d; n.moving = true; return true;
  };
  const api = new Function('walkable','player','_DIR_VEC','stepNPCTo','performance', src)
                (walkable, player, _DIR_VEC, stepNPCTo, { now: () => Date.now() });
  return { api, F, T, P, walkable };
}
// walk the follower to the target using ONLY the pathfinder; returns steps or -1
function traverse(rows, limit = 400){
  const { api, F, T } = world(rows);
  const n = { tileX: F.x, tileY: F.y, dir: 'down' };
  for (let i = 0; i < limit; i++){
    if (n.tileX === T.x && n.tileY === T.y) return i;
    n._navCd = 0;                        // the throttle is timing, not logic
    if (!api.npcNavigateAround(n, T.x, T.y)) return -1;
  }
  return -1;
}

console.log('\n1 · the exact freeze the Creator reported');
t('a rock due WEST with a wall NORTH · greedy dies, the path does not', () => {
  // target is dead level to the west (dy === 0), so the old fallback was
  // hardcoded 'up' — and up is solid.  The only way through is DOWN.
  const map = [
    '#########',
    '###.#####',
    '#T.#..F.#',
    '#...#...#',
    '#.......#',
    '#########',
  ];
  const steps = traverse(map);
  ok(steps > 0, 'no route found around a single blocker · this is the reported bug');
  ok(steps <= 14, `took ${steps} steps · not a sensible detour`);
});
t('a bush in open ground · goes around, does not stop', () => {
  const map = [
    '###########',
    '#.........#',
    '#F...#...T#',
    '#.........#',
    '###########',
  ];
  ok(traverse(map) > 0, 'a lone bush stopped the follower');
});

t('and the OLD greedy stepper really does freeze on it', () => {
  // ★ A regression test that passes on the broken code proves nothing.  This
  // runs the EXACT pre-v0.95.956 logic -- primary axis, else the other axis,
  // else stop -- including the `dy0 > 0 ? 'down' : 'up'` line that hardcodes
  // 'up' when the deltas are level.  If this ever starts succeeding, the maps
  // above stopped describing the bug and the suite above is worthless.
  const map = [
    '#########',
    '###.#####',
    '#T.#..F.#',
    '#...#...#',
    '#.......#',
    '#########',
  ];
  const { F, T, walkable } = world(map);
  const V = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
  let x = F.x, y = F.y, moved = 0;
  for (let i = 0; i < 60; i++){
    if (x === T.x && y === T.y) break;
    const dx0 = T.x - x, dy0 = T.y - y;
    let dir = Math.abs(dx0) >= Math.abs(dy0) ? (dx0 > 0 ? 'right' : 'left')
                                             : (dy0 > 0 ? 'down' : 'up');
    let v = V[dir];
    if (walkable(x + v[0], y + v[1])){ x += v[0]; y += v[1]; moved++; continue; }
    const alt = (dir === 'left' || dir === 'right') ? (dy0 > 0 ? 'down' : 'up')
                                                    : (dx0 > 0 ? 'right' : 'left');
    v = V[alt];
    if (walkable(x + v[0], y + v[1])){ x += v[0]; y += v[1]; moved++; continue; }
    break;                                   // ← the old code's "freeze"
  }
  ok(!(x === T.x && y === T.y),
     'the old greedy stepper SOLVED this map · the test does not reproduce the bug');
});

console.log('\n2 · real terrain shapes');
t('a U-shaped pocket · walks out of it, not into the wall', () => {
  const map = [
    '############',
    '#..........#',
    '#..######..#',
    '#..#F...#..#',        // sitting inside a cul-de-sac, mouth to the south
    '#..#.####..#',
    '#..#.#.....#',
    '#..#.#..T..#',
    '#..........#',
    '############',
  ];
  ok(traverse(map) > 0, 'trapped in a concave pocket · never found the mouth');
});
t('a long wall with one gap · finds the gap', () => {
  const map = [
    '##############',
    '#F...........#',
    '#####.########',
    '#............#',
    '#..........T.#',
    '##############',
  ];
  const s = traverse(map);
  ok(s > 0, 'never found the single gap in the wall');
  ok(s >= 8, `${s} steps is impossibly short · it walked through the wall`);
});
t('genuinely walled in · returns no path instead of thrashing', () => {
  const map = [
    '#######',
    '#.#T..#',
    '###...#',
    '#F#...#',
    '###...#',
    '#######',
  ];
  ok(traverse(map) === -1, 'claimed a route through solid terrain');
});

console.log('\n3 · Rizer is solid, and the budget holds');
t('a path is never routed through the player', () => {
  // the ONLY gap is the tile Rizer stands on · stepNPCTo would refuse that
  // step, so a path offering it reads as the companion deciding to stand still
  const map = [
    '#######',
    '#F#T..#',
    '#.P...#',
    '#.....#',
    '#######',
  ];
  const { api } = world(map);
  const n = { tileX: 1, tileY: 1, dir: 'down' };
  const d = api.npcPathDir(n, 3, 1);
  if (d){
    const v = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] }[d];
    ok(!(n.tileX + v[0] === 2 && n.tileY + v[1] === 2),
       'first step walks onto Rizer · stepNPCTo will refuse it and the NPC freezes');
  }
});
t('the search is bounded and cannot scan the overworld', () => {
  const nodes = Number(/const NPC_PATH_MAX_NODES\s*=\s*(\d+)/.exec(H)[1]);
  const pad   = Number(/const NPC_PATH_PAD\s*=\s*(\d+)/.exec(H)[1]);
  const cd    = Number(/const NPC_PATH_COOLDOWN\s*=\s*(\d+)/.exec(H)[1]);
  ok(nodes > 0 && nodes <= 2000, `${nodes} nodes is not a per-frame budget`);
  ok(pad >= 4, `pad ${pad} leaves no room for a detour to bulge into`);
  ok(cd >= 100, `a ${cd}ms cooldown lets a walled-in NPC search every tick`);
  const f = H.slice(H.indexOf('function npcPathDir'), H.indexOf('function npcNavigateAround'));
  ok(/nx < x0 \|\| nx > x1 \|\| ny < y0 \|\| ny > y1/.test(f), 'the search box is not enforced');
});
t('a failed search backs off instead of retrying every tick', () => {
  const map = ['#####','#F#T#','#####'];
  const { api } = world(map);
  const n = { tileX: 1, tileY: 1, dir: 'down' };
  ok(api.npcNavigateAround(n, 3, 1) === false, 'claimed to have moved');
  ok(n._navCd > 0, 'no cooldown set · it will run a full BFS every single tick forever');
});

console.log('\n4 · every follow path ends at the router, not at a freeze');
t('all three stepping sites fall through to it', () => {
  ['npcNavigateAround(n, _ft[0], _ft[1])',      // summoned Zyrex formation
   'npcNavigateAround(n, target.x, target.y)',  // ally / called contact trail
   'npcNavigateAround(n, _aim.x, _aim.y)'       // walkHome
  ].forEach(sig => ok(H.includes(sig), `missing wiring: ${sig}`));
  // and the greedy fast path must still be tried first — pathing every step
  // would be a real cost for a problem that only exists at obstacles
  const trail = H.slice(H.indexOf('// Step 1 tile toward target'), H.indexOf('// Step 1 tile toward target') + 1400);
  ok(trail.indexOf('stepNPCTo') < trail.indexOf('npcNavigateAround'),
     'BFS runs before the free greedy step');
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
