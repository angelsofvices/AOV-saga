// v0.95.962 · the Seer HQ entry and its doors.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const cfg = (name) => {
  const at = H.indexOf(`const ${name} = {`);
  const src = H.slice(at, H.indexOf('\n};', at));
  const pm = /plan: \[([\s\S]*?)\n  \],/.exec(src);
  const plan = pm ? [...pm[1].matchAll(/'([^']*)'/g)].map(m => m[1]) : null;
  const g = k => { const m = new RegExp(k + ':\\s*\\{\\s*x:\\s*(\\d+),\\s*y:\\s*(\\d+)').exec(src);
                   return m ? { x: +m[1], y: +m[2] } : null; };
  return { src, plan, spawn: g('spawn'), exit: g('exit') };
};
const isFloor = ch => ch === '.' || ch === 'S' || ch === 'C' || ch === 'G';

console.log('\n1 · you arrive INSIDE the building');
t('every planned interior spawns on a floor tile', () => {
  for (const n of ['INTERIOR_SEER_HQ_1F','INTERIOR_SEER_HQ_R2']){
    const c = cfg(n);
    ok(c.plan, `${n} lost its plan`);
    const ch = (c.plan[c.spawn.y] || '')[c.spawn.x];
    ok(isFloor(ch),
       `${n} spawns at (${c.spawn.x},${c.spawn.y}) = '${ch === ' ' ? 'VOID' : ch}' · the player is stuck`);
  }
});
t('the exit tile is reachable too', () => {
  for (const n of ['INTERIOR_SEER_HQ_1F','INTERIOR_SEER_HQ_R2']){
    const c = cfg(n);
    if (!c.exit) continue;
    const ch = (c.plan[c.exit.y] || '')[c.exit.x];
    ok(isFloor(ch), `${n} exit (${c.exit.x},${c.exit.y}) = '${ch === ' ' ? 'VOID' : ch}'`);
  }
});
t('1F specifically · the reported bug', () => {
  const c = cfg('INTERIOR_SEER_HQ_1F');
  ok(!(c.spawn.x === 17 && c.spawn.y === 23), 'still spawning at (17,23), the void row below the south wall');
  // and it must be inside the walls, not merely on some floor
  const row = c.plan[c.spawn.y];
  ok(row.indexOf('#') < c.spawn.x && row.lastIndexOf('#') > c.spawn.x,
     'the spawn is not between the side walls');
});
t('every floor tile is reachable from the spawn', () => {
  for (const n of ['INTERIOR_SEER_HQ_1F','INTERIOR_SEER_HQ_R2']){
    const c = cfg(n);
    const w = (x, y) => isFloor(((c.plan[y] || '')[x]) || ' ');
    const seen = new Set([`${c.spawn.x},${c.spawn.y}`]);
    const q = [[c.spawn.x, c.spawn.y]];
    while (q.length){
      const [x, y] = q.shift();
      for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
        const k = `${x+dx},${y+dy}`;
        if (!seen.has(k) && w(x+dx, y+dy)){ seen.add(k); q.push([x+dx, y+dy]); }
      }
    }
    const total = c.plan.join('').split('').filter(isFloor).length;
    ok(seen.size === total, `${n}: ${total - seen.size} floor tile(s) walled off from the spawn`);
  }
});

console.log('\n2 · a door looks like a door');
t('floorPlan carries the tile character through', () => {
  const f = H.slice(H.indexOf('function floorPlan'), H.indexOf('function planDoorAt'));
  ok(/walls\.push\(\{ x, y, ch,/.test(f),
     'the draw cannot tell a door from masonry without re-reading cfg.plan');
  ok(/doors\.push\(\{ x, y, face:/.test(f), 'doors carry no face flag');
});
t('the door pass exists and runs AFTER the walls', () => {
  const d = H.slice(H.indexOf('function drawInteriorFloor'), H.indexOf('function drawInteriorFloor') + 5000);
  ok(/_plan\.doors\.length/.test(d), '_plan.doors is still collected and never drawn');
  ok(/SEER_DOOR_LOCKED_IMG/.test(d), 'no door art in the interior draw');
  ok(d.indexOf("w.ch === 'D') continue") < d.indexOf('_plan.doors.length'),
     'doors are drawn before the walls · a 3-tall neighbour would paint over them');
});
t('the door is not stretched', () => {
  const d = H.slice(H.indexOf('_plan.doors.length'), H.indexOf('_plan.doors.length') + 1200);
  ok(/DW = Math\.round\(DH \* \(qw \/ qh\)\)/.test(d),
     'width is not derived from the measured aspect · the frame would be squashed');
  ok(/SEER_DOOR_LOCKED_BBOX/.test(d), 'draws the whole 32x64 canvas instead of the measured content');
});
t('a door still blocks and still transitions', () => {
  // the door tile must stay solid — it is a scene change, not a hole
  const f = H.slice(H.indexOf('function floorPlan'), H.indexOf('function planDoorAt'));
  ok(/blocked\.add\(x \+ ',' \+ y\)/.test(f), 'doors stopped being solid');
  ok(/function planDoorAt/.test(H) && /doorTargets/.test(H), 'the transition wiring is gone');
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
