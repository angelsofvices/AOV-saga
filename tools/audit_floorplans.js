// ★★★ Validate every interior floor plan the way the ENGINE reads it.
//   '#' wall (solid) · '.' floor · 'D' door (SOLID — a transition, not a hole)
//   ' ' void (solid, drawn black)
// Creator: "the seer hq walls are still wrong and I get stuck when entering."
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');

const CFGS = ['INTERIOR_SEER_HQ_1F','INTERIOR_SEER_HQ_R2','INTERIOR_SEER_HQ_B','INTERIOR_SEER_HQ_2F'];
const WALL_TILES_H = Number(/const WALL_TILES_H = (\d+);/.exec(H)[1]);
let bad = 0;

function parse(name){
  const at = H.indexOf(`const ${name} = {`);
  if (at < 0) return null;
  const end = H.indexOf('\n};', at);
  const src = H.slice(at, end);
  const pm = /plan: \[([\s\S]*?)\n  \],/.exec(src);
  if (!pm) return { name, src, plan: null };
  const plan = [...pm[1].matchAll(/'([^']*)'/g)].map(m => m[1]);
  const g = k => { const m = new RegExp(k + ':\\s*\\{\\s*x:\\s*(\\d+),\\s*y:\\s*(\\d+)').exec(src);
                   return m ? { x: +m[1], y: +m[2] } : null; };
  const dt = {};
  const dm = /doorTargets: \{([\s\S]*?)\n  \},/.exec(src);
  if (dm) for (const m of dm[1].matchAll(/'(\d+),(\d+)':/g)) dt[`${m[1]},${m[2]}`] = true;
  const dims = /cols: (\d+), rows: (\d+)/.exec(src);
  return { name, src, plan, spawn: g('spawn'), exit: g('exit'), doorTargets: dt,
           cols: dims ? +dims[1] : null, rows: dims ? +dims[2] : null,
           stairs: [...src.matchAll(/\{\s*x:\s*(\d+),\s*y:\s*(\d+)[^}]*?(?:to|target)/g)]
                     .map(m => ({ x:+m[1], y:+m[2] })) };
}
const isFloor = ch => ch === '.' || ch === 'S' || ch === 'C' || ch === 'G';
const walkable = (P, x, y) => {
  if (y < 0 || y >= P.plan.length) return false;
  const row = P.plan[y];
  if (x < 0 || x >= row.length) return false;
  return isFloor(row[x]);
};

for (const name of CFGS){
  const P = parse(name);
  console.log(`\n═══ ${name} ═══`);
  if (!P || !P.plan){ console.log('  (no plan — open box)'); continue; }
  const R = P.plan.length, C = Math.max(...P.plan.map(r => r.length));
  console.log(`  plan ${C}x${R}   declared cols/rows ${P.cols}x${P.rows}`);
  if (P.cols !== C || P.rows !== R){
    console.log(`  ✗ DIMENSION MISMATCH · declared ${P.cols}x${P.rows}, plan is ${C}x${R}`); bad++;
  }
  const ragged = P.plan.filter(r => r.length !== C).length;
  if (ragged) { console.log(`  ✗ ${ragged} row(s) are not ${C} chars — ragged plan`); bad++; }

  // ── 1 · SPAWN must be a floor tile ──────────────────────────────────────
  if (P.spawn){
    const ch = (P.plan[P.spawn.y] || '')[P.spawn.x] ?? '?';
    const okSpawn = walkable(P, P.spawn.x, P.spawn.y);
    console.log(`  spawn (${P.spawn.x},${P.spawn.y}) = '${ch === ' ' ? '␠' : ch}' ${okSpawn ? '· ok' : '· ✗ NOT WALKABLE — YOU SPAWN STUCK'}`);
    if (!okSpawn) bad++;
  }
  if (P.exit){
    const ch = (P.plan[P.exit.y] || '')[P.exit.x] ?? '?';
    if (!walkable(P, P.exit.x, P.exit.y)){
      console.log(`  ✗ exit  (${P.exit.x},${P.exit.y}) = '${ch === ' ' ? '␠' : ch}' — not walkable, cannot leave`); bad++;
    }
  }
  // ── 2 · every door must be REACHABLE from the spawn ─────────────────────
  if (P.spawn && walkable(P, P.spawn.x, P.spawn.y)){
    const seen = new Set([`${P.spawn.x},${P.spawn.y}`]);
    const q = [[P.spawn.x, P.spawn.y]];
    while (q.length){
      const [x, y] = q.shift();
      for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
        const nx = x+dx, ny = y+dy, k = `${nx},${ny}`;
        if (seen.has(k) || !walkable(P, nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    console.log(`  reachable floor from spawn: ${seen.size} tiles`);
    const totalFloor = P.plan.join('').split('').filter(isFloor).length;
    if (seen.size < totalFloor){
      console.log(`  ✗ ${totalFloor - seen.size} floor tile(s) UNREACHABLE from spawn`); bad++;
    }
    // a door is solid — you must be able to STAND next to it
    for (const key of Object.keys(P.doorTargets)){
      const [dx, dy] = key.split(',').map(Number);
      const adj = [[0,1],[0,-1],[1,0],[-1,0]].some(([ax,ay]) => seen.has(`${dx+ax},${dy+ay}`));
      const ch = (P.plan[dy] || '')[dx];
      console.log(`  door ${key} = '${ch}' ${adj ? '· reachable' : '· ✗ CANNOT BE REACHED'}`);
      if (ch !== 'D'){ console.log(`     ✗ doorTargets points at '${ch}', not a 'D' in the plan`); bad++; }
      if (!adj) bad++;
    }
  }
  // ── 3 · WALL GEOMETRY ───────────────────────────────────────────────────
  // a wall draws a WALL_TILES_H-tall face when floor is beneath it, else a cap.
  // So the plan needs WALL_TILES_H rows of wall above any floor, or the face
  // is drawn over tiles the author did not reserve for it.
  let faces = 0, shortStacks = [];
  for (let y = 0; y < R; y++){
    for (let x = 0; x < C; x++){
      const ch = (P.plan[y] || '')[x] || ' ';
      if (ch !== '#' && ch !== 'D') continue;
      if (!walkable(P, x, y + 1)) continue;         // not a face
      faces++;
      // count how many solid rows stack above this face
      let up = 0;
      while (up < 8){ const c = (P.plan[y-1-up] || '')[x]; if (c === '#' || c === 'D') up++; else break; }
      if (up + 1 < WALL_TILES_H) shortStacks.push({ x, y, have: up + 1 });
    }
  }
  console.log(`  wall faces: ${faces}   (each draws ${WALL_TILES_H} tiles tall)`);
  if (shortStacks.length){
    const ex = shortStacks.slice(0, 4).map(s => `(${s.x},${s.y}) has ${s.have}`).join(', ');
    console.log(`  ✗ ${shortStacks.length} face(s) have fewer than ${WALL_TILES_H} solid rows above them: ${ex}`);
    console.log(`     the ${WALL_TILES_H}-tall face draws UP over whatever is there — floor, void or nothing`);
    bad++;
  }
}
console.log(`\n${bad ? '✗' : '★'} ${bad} problem(s)\n`);
process.exit(bad ? 1 : 0);
