// ★★★★ v0.99.0 · THE SIZE LADDER · every room on a rung, and nothing walled off.
//
//   Creator, 2026-09-18: "make the interior tile map of the school the same size
//   as the research lab ... set the new standard size for all official district
//   buildings (not shops) ... homes keep their dimensions ... shops a
//   dimensional balance in between ... scale seer hqs to buildings size ... cave
//   the next scale (very large) ... landmarks 1/30th of the overworld map."
//
// ★★★★ THE ASSERTION THAT MATTERS IS THE FLOOD FILL.
//   Every other check here is arithmetic — is this room the size the table says.
//   The one that catches the damage a resize actually does is: CAN YOU STILL
//   WALK FROM THE SPAWN TO THE EXIT. Shrink a room and its furniture stays where
//   it was typed; a crate authored against the east wall of a 15-wide shop ends
//   up mid-floor in a 19-wide one, and four of them in a row is a wall. That
//   failure is invisible in a diff, invisible in a screenshot of the top half of
//   the room, and total for the player, who simply cannot leave.
//
// ★★ AND THE SECOND ONE IS BOUNDS. A body whose tile was inside the old canvas
//   and is outside the new one does not throw — it stands in void, like the Seer
//   commander did at (17,18) until the HQ rebuild moved him.
import { bootGame } from './lib/boot_game.mjs';

let f = 0;
// ★★★★ IT MUST RETURN c. My first cut ended `if (!c) f++;` and returned
//   undefined — so every `if (!ok(...)) continue;` in this file saw !undefined,
//   which is true, and CONTINUED UNCONDITIONALLY. Each room checked its spawn
//   and skipped the flood fill; every scene confirmed it had a config and
//   skipped the bounds check. Forty green ticks, and the two assertions this
//   suite exists for never ran once.
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['INTERIOR_SCALE','interiorSize','HOME_LEVEL','homeLevelOf','homeSizeFor',
  'INTERIOR_HOME','INTERIOR_HOME_2F','INTERIOR_CRAZY_HOME','INTERIOR_RESEARCH_LAB','INTERIOR_TRAINING_FARM',
  'INTERIOR_MALEZOR_SCHOOL','INTERIOR_TREEHOUSE','INTERIOR_CAVE','INTERIOR_BLOODSCENT_LODGE',
  'bloodscentLodgeUnlocked','floorPlan','INTERIOR_SEER_HQ_1F','INTERIOR_SEER_HQ_2F',
  'INTERIOR_SEER_HQ_R2','INTERIOR_SEER_HQ_B','CIVIC_ROOMS','makeCivicInterior','civicBlocked','civicRug',
  'civicCounterSlot','makeMalezorHomeInterior','MAP_COLS','MAP_ROWS','NPCS','interiorConfig','HQ'] });
console.log = _L;
const S = G.INTERIOR_SCALE;

H('★★★ THE LADDER · every rung a real step, in order');
{
  const order = ['nook','home1','home2','home3','shop','building','cave','landmark'];
  let prev = 0;
  for (const r of order){
    const R = S[r], area = R.cols * R.rows;
    ok(area > prev, `  ${r.padEnd(9)} ${(R.cols+'x'+R.rows).padEnd(9)} ${String(area).padStart(6)} tiles`
       + `  ${(area/220).toFixed(2).padStart(6)} screens`);
    prev = area;
  }
  // ★ the Creator's three named relationships, asserted rather than assumed
  ok(S.home2.cols === 15 && S.home2.rows === 10,
     '★★★ "homes keep their dimensions" · level 2 IS the shipped 15x10, untouched');
  const homeMax = S.home3.cols * S.home3.rows, bld = S.building.cols * S.building.rows;
  const shop = S.shop.cols * S.shop.rows;
  ok(shop > homeMax && shop < bld,
     `★★★ "shops ... in between homes (small) and buildings (large)" · ${homeMax} < ${shop} < ${bld}`);
  ok(S.cave.cols * S.cave.rows > bld,
     `★★ "cave ... the next scale to buildings (very large)" · ${S.cave.cols*S.cave.rows} vs ${bld}`);
}

H('★★★★ THE LANDMARK IS 1/30 OF THE OVERWORLD · by area, in the world\'s own shape');
{
  const world = G.MAP_COLS * G.MAP_ROWS, lm = S.landmark.cols * S.landmark.rows;
  ok(Math.abs(world / lm - 30) < 0.5, `${S.landmark.cols}x${S.landmark.rows} = ${lm} · 1/${(world/lm).toFixed(2)} of ${world}`);
  // ★ 1/30 of AREA, not of each dimension — 1/30 linear would be 34x27 = 918
  //   tiles, barely bigger than the old school, and nobody calls that a world.
  ok(lm > 20000, `★★ ${lm} tiles · a linear 1/30 would have been ${Math.round(G.MAP_COLS/30)}x${Math.round(G.MAP_ROWS/30)} = ${Math.round(G.MAP_COLS/30)*Math.round(G.MAP_ROWS/30)}`);
  const a1 = S.landmark.cols / S.landmark.rows, a2 = G.MAP_COLS / G.MAP_ROWS;
  ok(Math.abs(a1 - a2) < 0.01,
     `★★★ and it is the WORLD'S SHAPE · aspect ${a1.toFixed(3)} vs ${a2.toFixed(3)} · a square would have `
   + 'been the same area wearing the wrong silhouette');
}

H('★★★ EVERY INTERIOR SITS ON A RUNG · no strays');
{
  const rung = (c, r) => Object.keys(S).find(k => S[k].cols === c && S[k].rows === r);
  const NAMED = {
    INTERIOR_TREEHOUSE: 'nook', INTERIOR_RESEARCH_LAB: 'building', INTERIOR_TRAINING_FARM: 'building',
    INTERIOR_MALEZOR_SCHOOL: 'building', INTERIOR_CAVE: 'cave',
    INTERIOR_BLOODSCENT_LODGE: 'building',
    INTERIOR_SEER_HQ_1F: 'building', INTERIOR_SEER_HQ_2F: 'building',
    INTERIOR_SEER_HQ_R2: 'building', INTERIOR_SEER_HQ_B: 'building',
  };
  for (const [n, want] of Object.entries(NAMED)){
    const I = G[n];
    ok(I && I.cols === S[want].cols && I.rows === S[want].rows,
       `  ${n.replace('INTERIOR_','').padEnd(18)} ${I ? I.cols+'x'+I.rows : '??'} · ${want}`);
  }
  for (const [k, R] of Object.entries(G.CIVIC_ROOMS)){
    const want = k === 'town-hall' ? 'building' : 'shop';
    ok(R.cols === S[want].cols && R.rows === S[want].rows,
       `  civic:${k.padEnd(14)} ${R.cols}x${R.rows} · ${want}`
       + (k === 'town-hall' ? '  ★ the one civic room that is not a shop' : ''));
  }
  // ★ the two Rizer-house interiors are hand-authored and predate the ladder;
  //   they are named here so "no strays" means something rather than skipping
  //   whatever it cannot classify.
  for (const n of ['INTERIOR_HOME','INTERIOR_HOME_2F','INTERIOR_CRAZY_HOME']){
    const I = G[n];
    ok(!!rung(I.cols, I.rows), `  ${n.replace('INTERIOR_','').padEnd(18)} ${I.cols}x${I.rows} · ${rung(I.cols,I.rows) || 'OFF-LADDER'}`);
  }
}

H('★★★ HOME LEVEL 1-3 · three per district, and the middle one does not move');
{
  const lv = {};
  for (const id of Object.keys(G.HOME_LEVEL)) (lv[G.HOME_LEVEL[id]] = lv[G.HOME_LEVEL[id]] || []).push(id);
  ok([1,2,3].every(n => (lv[n] || []).length >= 7), `levels present · 1:${lv[1].length} 2:${lv[2].length} 3:${lv[3].length}`);
  const byDist = {};
  for (const id of Object.keys(G.HOME_LEVEL)){
    const d = id.split(/[-_]house[-_]|_home_/)[0];
    (byDist[d] = byDist[d] || []).push(G.HOME_LEVEL[id]);
  }
  for (const [d, ls] of Object.entries(byDist))
    ok(ls.sort().join('') === '123', `  ${d.padEnd(10)} has exactly one of each level (${ls.join(',')})`);
  // ★★ the shipped home is unchanged · this is the Creator's "keep their dimensions"
  const mal = G.makeMalezorHomeInterior('interior_malezor_home_redroof_3');
  ok(mal.cols === 15 && mal.rows === 10 && mal.spawn.x === 7 && mal.spawn.y === 9 && mal.rug.x === 6,
     `★★★ a Malezor home is still 15x10, spawn 7,9, doormat x6 — byte for byte what it shipped as`);
  // and the anchors follow the rung rather than the old literals
  for (const [id, want] of [['veridan-house-cottage',1],['baelgor-house-forgehall',2],['netharion-house-manor',3]]){
    const c = G.makeMalezorHomeInterior('interior_malezor_home_' + id);
    ok(c.homeLevel === want && c.cols === S['home'+want].cols,
       `  L${want} ${id.padEnd(26)} ${c.cols}x${c.rows} · door centred at ${c.spawn.x} of ${c.cols}`);
    ok(c.spawn.x === (c.cols >> 1) && c.rug.x === (c.cols >> 1) - 1,
       `     ★ spawn and doormat derived, not the old x:7 / x:6 literals`);
  }
}

H('★★★★ NOTHING IS WALLED OFF · flood fill from every spawn to every exit');
{
  const rooms = [];
  for (const n of ['INTERIOR_HOME','INTERIOR_HOME_2F','INTERIOR_CRAZY_HOME','INTERIOR_RESEARCH_LAB',
                   'INTERIOR_TRAINING_FARM','INTERIOR_MALEZOR_SCHOOL','INTERIOR_TREEHOUSE','INTERIOR_CAVE',
                   'INTERIOR_BLOODSCENT_LODGE'])
    rooms.push([n.replace('INTERIOR_',''), G[n]]);
  for (const k of Object.keys(G.CIVIC_ROOMS)) rooms.push(['civic:' + k, G.makeCivicInterior(k, 'malezor')]);
  for (const id of ['veridan-house-cottage','baelgor-house-forgehall','netharion-house-manor','redroof_3'])
    rooms.push(['home:' + id, G.makeMalezorHomeInterior('interior_malezor_home_' + id)]);

  for (const [name, I] of rooms){
    if (!I){ ok(false, `${name} · no config`); continue; }
    // ★★★ v0.99.4 · A SHAPED ROOM KEEPS ITS EDGES IN THE PLAN, NOT IN blocked.
    //   The Bloodscent Lodge carries an empty `blocked` and a 20-row plan whose
    //   void is the unwalkable area. Flood-filling on cfg.blocked alone would
    //   have walked straight through the black and declared 400 tiles reachable
    //   in a 206-tile room — a green tick for a room it never entered.
    const solid = new Set((I.blocked || []).map(t => t[0] + ',' + t[1]));
    const _P = (typeof G.floorPlan === 'function') ? G.floorPlan(I) : null;
    if (_P) for (const k of _P.blocked) solid.add(k);
    const inB = (x, y) => x >= 0 && y >= 0 && x < I.cols && y < I.rows;
    const walk = (x, y) => inB(x, y) && !solid.has(x + ',' + y);
    const sp = I.spawn, ex = I.exit || I.spawn;
    if (!ok(walk(sp.x, sp.y), `${name.padEnd(22)} spawn (${sp.x},${sp.y}) is inside the room and not solid`)) continue;
    if (!ok(walk(ex.x, ex.y), `${name.padEnd(22)} exit  (${ex.x},${ex.y}) likewise`)) continue;
    // flood
    const seen = new Set([sp.x + ',' + sp.y]);
    const q = [[sp.x, sp.y]];
    while (q.length){
      const [x, y] = q.pop();
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (walk(nx, ny) && !seen.has(k)){ seen.add(k); q.push([nx, ny]); }
      }
    }
    let free = 0;
    for (let y = 0; y < I.rows; y++) for (let x = 0; x < I.cols; x++) if (walk(x, y)) free++;
    ok(seen.has(ex.x + ',' + ex.y),
       `${name.padEnd(22)} ★ exit reachable from spawn · ${seen.size}/${free} tiles walkable from the door`);
    ok(seen.size === free,
       `${name.padEnd(22)} ★★ and NO tile is stranded behind the furniture (${free - seen.size} cut off)`);
  }
}

H('★★★ NO BODY LEFT STANDING IN VOID');
{
  const byScene = {};
  for (const n of (G.NPCS || [])){
    if (!n || !n.scene || n.scene === 'overworld') continue;
    (byScene[n.scene] = byScene[n.scene] || []).push(n);
  }
  for (const [scene, list] of Object.entries(byScene)){
    // ★★★★ THIS CHECK WAS VACUOUS ON ITS FIRST RUN. It asked for
    //   `interiorForScene`, which is not what the function is called — so every
    //   lookup returned null, every scene printed "skipped", and nine green
    //   ticks said nothing at all. A skip that reports as a pass is worse than a
    //   failure: it is a failure you will not look at. The name is
    //   interiorConfig(), and a missing config is now a RED, not a shrug.
    let I = null;
    try { I = G.interiorConfig ? G.interiorConfig(scene) : null; } catch(_){}
    if (!ok(!!I, `  ${scene.padEnd(30)} has a config to be checked against`)) continue;
    const out = list.filter(n => n.tileX < 0 || n.tileY < 0 || n.tileX >= I.cols || n.tileY >= I.rows);
    ok(out.length === 0,
       `  ${scene.padEnd(30)} ${list.length} bodies inside ${I.cols}x${I.rows}`
       + (out.length ? ` · ★ ${out.length} IN VOID: ` + out.map(n => `${n.id}@${n.tileX},${n.tileY}`).join(', ') : ''));
  }
}

H('★★ THE COUNTER CENTRES AT ANY WIDTH');
{
  for (const k of Object.keys(G.CIVIC_ROOMS)){
    const R = G.CIVIC_ROOMS[k], slot = G.civicCounterSlot(k);
    ok(Math.abs((slot.x + slot.w / 2) - R.cols / 2) < 1e-9,
       `  ${k.padEnd(15)} counter x=${slot.x} w=${slot.w} in a ${R.cols}-wide room · dead centre`);
  }
  // ★ and the SOLID tiles sit under the art, not beside it — one source
  const b = G.civicBlocked('nurse'), slot = G.civicCounterSlot('nurse');
  const band = b.filter(t => t[1] === 2).map(t => t[0]).sort((x,y) => x-y);
  ok(band.length === slot.w && band[0] === Math.round(slot.x),
     `★★ the infirmary counter's ${band.length} solid tiles start at x${band[0]}, where the art does`);
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ one ladder · every room on a rung · nothing stranded, nothing walled off');
process.exit(f ? 1 : 0);
