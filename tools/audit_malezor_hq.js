// ★★★ Walk the MALEZOR Seer HQ end to end, following the real data.
// Creator: "make sure the malezor seer hq is set up correctly with doors,
// stairs, chest, keys, etc."
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let bad = 0;
const X = m => { console.log('   ✗ ' + m); bad++; };
const OK = m => console.log('   ok ' + m);

const WALLS_ON = /const SEER_HQ_WALLS_ON = true/.test(H);
const isFloor = ch => '.SCG'.includes(ch) || (!WALLS_ON && ch === '#');
const cfg = name => {
  const at = H.indexOf(`const ${name} = {`);
  if (at < 0) return null;
  const src = H.slice(at, H.indexOf('\n};', at));
  const pm = /plan: \[([\s\S]*?)\n  \],/.exec(src);
  return { src, plan: pm ? [...pm[1].matchAll(/'([^']*)'/g)].map(m => m[1]) : null };
};
const SCENES = { interior_seer_hq_1f:'INTERIOR_SEER_HQ_1F', interior_seer_hq_r2:'INTERIOR_SEER_HQ_R2',
                 interior_seer_hq_b:'INTERIOR_SEER_HQ_B',  interior_seer_hq_2f:'INTERIOR_SEER_HQ_2F' };
const P = {}; Object.entries(SCENES).forEach(([s, n]) => P[s] = cfg(n));
const tile = (scene, x, y) => ((P[scene].plan[y] || '')[x]) || ' ';
const walk = (scene, x, y) => isFloor(tile(scene, x, y));
const reach = (scene, from) => {
  const seen = new Set([from.join(',')]), q = [from];
  while (q.length){ const [x,y] = q.shift();
    for (const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
      const k = `${x+dx},${y+dy}`;
      if (!seen.has(k) && walk(scene, x+dx, y+dy)){ seen.add(k); q.push([x+dx,y+dy]); } } }
  return seen;
};
const adj = (set, x, y) => [[0,1],[0,-1],[1,0],[-1,0]].some(([a,b]) => set.has(`${x+a},${y+b}`));

console.log(`\n╔═ MALEZOR SEER HQ · full raid trace   (SEER_HQ_WALLS_ON = ${WALLS_ON})`);

// ── 0 · the overworld door ────────────────────────────────────────────
console.log('\n0 · THE WAY IN');
{
  const net = /const SEER_HQ_NETWORK = \[([\s\S]*?)\n\];/.exec(H);
  const mal = net && /\{[^}]*dist:\s*'malezor'[^}]*\}/.exec(net[1]);
  if (!mal) X('malezor has no entry in SEER_HQ_NETWORK');
  else {
    const d = /door:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/.exec(mal[0]);
    const lv = /gruntLv:\s*(\d+)/.exec(mal[0]);
    const cl = /cmdLv:\s*(\d+)/.exec(mal[0]);
    d ? OK(`overworld door at (${d[1]},${d[2]})  · gruntLv ${lv?lv[1]:'?'} · cmdLv ${cl?cl[1]:'?'}`)
      : X('no door tile');
  }
  const sp = /spawn: \{ x: (\d+), y: (\d+)/.exec(P.interior_seer_hq_1f.src);
  walk('interior_seer_hq_1f', +sp[1], +sp[2])
    ? OK(`1F spawn (${sp[1]},${sp[2]}) is floor`)
    : X(`1F spawn (${sp[1]},${sp[2]}) = '${tile('interior_seer_hq_1f',+sp[1],+sp[2])}'`);
}

// ── 1 · 1F -> R2 through the door ────────────────────────────────────
console.log('\n1 · 1F  →  DOOR  →  R2');
{
  const sp = /spawn: \{ x: (\d+), y: (\d+)/.exec(P.interior_seer_hq_1f.src);
  const R = reach('interior_seer_hq_1f', [+sp[1], +sp[2]]);
  const dt = /doorTargets: \{([\s\S]*?)\n  \},/.exec(P.interior_seer_hq_1f.src);
  if (!dt) X('1F has no doorTargets');
  else for (const m of dt[1].matchAll(/'(\d+),(\d+)': \{ target: '([a-z_0-9]+)', spawnAt: \{ x: (\d+), y: (\d+)/g)){
    const [dx,dy,tgt,sx,sy] = [+m[1],+m[2],m[3],+m[4],+m[5]];
    tile('interior_seer_hq_1f',dx,dy) === 'D' ? OK(`door tile (${dx},${dy}) is 'D'`) : X(`door tile is '${tile('interior_seer_hq_1f',dx,dy)}'`);
    !isFloor(tile('interior_seer_hq_1f',dx,dy)) ? OK('the door is SOLID · you press X, you do not walk through')
      : X('the door is walkable · it is a gap, not a door');
    adj(R,dx,dy) ? OK('the door is reachable from the spawn') : X('the door cannot be reached');
    walk(tgt,sx,sy) ? OK(`lands in ${tgt} at (${sx},${sy}) on floor`) : X(`lands on '${tile(tgt,sx,sy)}'`);
  }
}

// ── 2 · R2 · the basement key ────────────────────────────────────────
console.log('\n2 · R2  ·  the BASEMENT KEY');
const chests = [...(/const SEER_HQ_CHESTS = \[([\s\S]*?)\n\];/.exec(H)[1])
  .matchAll(/scene:\s*'([^']+)'\s*,\s*tileX:\s*(\d+)\s*,\s*tileY:\s*(\d+)\s*,\s*key:\s*'(\w+)'/g)]
  .map(m => ({ scene:m[1], x:+m[2], y:+m[3], key:m[4] }));
{
  const sp = /spawn: \{ x: (\d+), y: (\d+)/.exec(P.interior_seer_hq_r2.src);
  const R = reach('interior_seer_hq_r2', [+sp[1], +sp[2]]);
  const c = chests.find(c => c.key === 'basement');
  if (!c) X('no basement-key chest');
  else {
    c.scene === 'interior_seer_hq_r2' ? OK('the basement key is in R2') : X(`it is in ${c.scene}`);
    adj(R, c.x, c.y) ? OK(`chest (${c.x},${c.y}) reachable from the R2 spawn`) : X('chest unreachable');
    /function tryOpenSeerR2Chest/.test(H) && /grantSeerBasementKey\(dist\)/.test(H)
      ? OK('opening it grants the basement key') : X('it grants nothing');
  }
  const st = [...P.interior_seer_hq_r2.src.matchAll(
    /triggers: \[\[(\d+), ?(\d+)\], ?\[(\d+), ?(\d+)\]\], target: '([a-z_0-9]+)',\s*spawnAt: \{ x: (\d+), y: (\d+)[^}]*\},[\s\S]{0,200}?art: '(up|down)'/g)];
  st.length === 2 ? OK('R2 has two staircases') : X(`R2 has ${st.length} staircases`);
  for (const m of st){
    const [t1x,t1y,t2x,t2y,tgt,sx,sy,art] = [+m[1],+m[2],+m[3],+m[4],m[5],+m[6],+m[7],m[8]];
    const lbl = `${art.toUpperCase()} -> ${tgt}`;
    (adj(R,t1x,t1y)||R.has(`${t1x},${t1y}`)) ? OK(`${lbl} trigger (${t1x},${t1y}) reachable`) : X(`${lbl} trigger unreachable`);
    walk(tgt,sx,sy) ? OK(`${lbl} lands on floor at (${sx},${sy})`) : X(`${lbl} lands on '${tile(tgt,sx,sy)}'`);
  }
  const down = P.interior_seer_hq_r2.src.slice(P.interior_seer_hq_r2.src.indexOf("target: 'interior_seer_hq_b'"));
  /locked: \(\) => !hasSeerBasementKey\(\)/.test(down.slice(0,400))
    ? OK('the DOWN stair is locked behind the basement key') : X('the DOWN stair is not locked');
  const up = P.interior_seer_hq_r2.src.slice(P.interior_seer_hq_r2.src.indexOf("target: 'interior_seer_hq_2f'"));
  /locked: \(\) => !hasSeerKey\(\)/.test(up.slice(0,400))
    ? OK('the UP stair is locked behind the attic key') : X('the UP stair is not locked');
}

// ── 3 · basement · the attic key, and Malezor's Ruby Vial ────────────
console.log('\n3 · BASEMENT  ·  the ATTIC KEY  +  Malezor\'s RUBY VIAL');
{
  const sp = /spawn: \{ x: (\d+), y: (\d+)/.exec(P.interior_seer_hq_b.src);
  const R = reach('interior_seer_hq_b', [+sp[1], +sp[2]]);
  const c = chests.find(c => c.key === 'attic');
  c && c.scene === 'interior_seer_hq_b' ? OK('the attic key is in the basement') : X('attic key misplaced');
  adj(R, c.x, c.y) ? OK(`chest (${c.x},${c.y}) reachable from the basement spawn`) : X('chest unreachable');
  const f = H.slice(H.indexOf('function tryOpenSeerHqChest'), H.indexOf('function tryOpenSeerHqChest') + 1800);
  /dist === 'malezor'/.test(f) ? OK('Malezor has its own branch') : X('no Malezor branch');
  /player\.items\.ruby_vial/.test(f) ? OK('Malezor still yields the RUBY VIAL') : X('the Ruby Vial is gone');
  (f.match(/grantSeerKey\(dist\)/g) || []).length >= 2
    ? OK('BOTH branches grant the attic key (Malezor included)') : X('a branch grants no key');
  /function seerChestAt/.test(H) ? OK('the chest uses the shared lookup · it is interactable') : X('the four-site drift is back');
}

// ── 4 · attic · the commander ────────────────────────────────────────
console.log('\n4 · ATTIC  ·  the COMMANDER');
{
  const sp = /spawn: \{ x: (\d+), y: (\d+)/.exec(P.interior_seer_hq_2f.src);
  const R = reach('interior_seer_hq_2f', [+sp[1], +sp[2]]);
  const at = H.indexOf("homeScene: 'interior_seer_hq_2f'");
  const m = /tileX: (\d+), tileY: (\d+)/.exec(H.slice(at - 500, at));
  if (!m) X('no commander');
  else {
    const [cx,cy] = [+m[1],+m[2]];
    walk('interior_seer_hq_2f',cx,cy) ? OK(`commander (${cx},${cy}) stands on floor`) : X(`commander on '${tile('interior_seer_hq_2f',cx,cy)}'`);
    (R.has(`${cx},${cy}`) || adj(R,cx,cy)) ? OK('he is reachable from the attic spawn') : X('he cannot be reached');
  }
  /SEER_COMMANDER_NAME/.test(H) ? OK('commanders are named per district') : X('no name table');
  /ENCOUNTER PENDING/.test(H) ? console.log('   ·  the FIGHT is still unbuilt — talk only (known, by design)') : 0;
}

// ── 5 · grunts, and everything that shares a tile ────────────────────
console.log('\n5 · OCCUPANCY · grunts, chests and stair triggers');
{
  // ★★★ THE GRUNTS ARE BUILT IN A LOOP, not written out as literals.  The first
  // version of this audit looked for `scene: 'interior_seer_hq_*'` next to a
  // tileX and found ONE body out of ten — so it reported "all on walkable
  // floor" while a landing guard was standing inside the R2 chest.  A count is
  // part of the check: if the tables shrink, the audit must say so rather than
  // quietly pass on whatever it managed to parse.
  const tbl = (name, scene) => {
    const m = new RegExp('const ' + name + ' = \\[([\\s\\S]*?)\\n    \\];').exec(H);
    if (!m) { X(`${name} table not found`); return []; }
    return [...m[1].matchAll(/\{ x:\s*(-?\d+), y:\s*(-?\d+)/g)]
             .map(g => ({ x:+g[1], y:+g[2], scene }));
  };
  const hall = tbl('HALL', 'interior_seer_hq_1f');
  const land = tbl('LANDING', 'interior_seer_hq_r2');
  hall.length === 4 ? OK(`HALL · ${hall.length} grunts on 1F`) : X(`HALL parsed ${hall.length}, expected 4`);
  land.length === 6 ? OK(`LANDING · ${land.length} grunts on R2`) : X(`LANDING parsed ${land.length}, expected 6`);

  const bodies = [...hall, ...land];
  let off = 0;
  bodies.forEach(g => { if (!walk(g.scene, g.x, g.y)){ off++; X(`grunt ${g.scene} (${g.x},${g.y}) on '${tile(g.scene,g.x,g.y)}'`); } });
  if (!off) OK(`all ${bodies.length} grunts stand on walkable floor`);

  // ★ ONE TILE, ONE OCCUPANT.  A chest BLOCKS, so a grunt on the same tile is
  // inside the furniture — and NPC interact runs before chest interact, so
  // pressing X there talks to the guard instead of opening it.
  const trig = [];
  for (const m of H.matchAll(/triggers: \[\[(\d+), ?(\d+)\], ?\[(\d+), ?(\d+)\]\], target: '(interior_seer_hq_\w+)'/g)){
    // attribute the trigger to the scene whose config contains it
    for (const sc of Object.keys(SCENES)) if (P[sc].src.includes(m[0])){
      trig.push({ x:+m[1], y:+m[2], scene: sc }, { x:+m[3], y:+m[4], scene: sc });
    }
  }
  const seen = new Map();
  const claim = (o, what) => {
    const k = `${o.scene} ${o.x},${o.y}`;
    if (seen.has(k)) X(`${k} is claimed by BOTH ${seen.get(k)} and ${what}`);
    else seen.set(k, what);
  };
  bodies.forEach(g => claim(g, 'a grunt'));
  chests.forEach(c => claim({ scene:c.scene, x:c.x, y:c.y }, `the ${c.key}-key chest`));
  trig.forEach(t => claim(t, 'a stair trigger'));
  OK(`${seen.size} occupied tiles, no two things sharing one`);
}

console.log(`\n${bad ? '✗ ' + bad + ' problem(s)' : '★ the Malezor raid is complete end to end'}\n`);
process.exit(bad ? 1 : 0);
