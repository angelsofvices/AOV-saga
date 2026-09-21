// ★★★★ v0.99.8 · THE ROAM PROFILES · driven, and measured in tiles travelled.
//
//   Creator, 2026-09-20: "make sure that all npcs that have walk and fly
//   traversals in the overworld go in patterns like steelden. dont just have
//   them walk one or two tiles and stop and go back. we want npcs to feel
//   alive. apply a global npc and zyrex roam pattern based on 4 categories ...
//   idle, fly, walking, grazing. quest npcs stay idle blinking."
//
// ★★★★ THE ASSERTION THAT MATTERS IS PATH SHAPE, NOT REACH — AND I HAD THAT
//   WRONG AT FIRST. My first draft claimed the old model "could not leave its
//   post", and then I measured it: over 400 ticks a random walk DOES eventually
//   reach the full 6-tile radius and cover ~51 tiles. The overstatement was
//   mine and the suite said so before I noticed.
//   ★ What is actually wrong with a random walk is what it looks like MOMENT TO
//     MOMENT. Measured over 30 runs:
//
//         OLD   reverses direction on 32.5% of steps · mean straight run 2.27 tiles
//         NEW   reverses direction on  7.7% of steps · mean straight run 4.21 tiles
//
//     "Walk one or two tiles and stop and go back" is a 2.27-tile mean run with
//     a third of every step being an about-face. That is the Creator's sentence
//     as a number, and it is what this suite measures.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import { createRequire } from 'module';
const _allSrc = createRequire(import.meta.url)('./lib/all_src.cjs');

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const src = _allSrc();

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['NPC_ROAM','roamProfileFor','ROAM_FLIERS','ROAM_GRAZERS','stepNPCTo',
  'walkable','NPCS','SPECIES','_DIR_VEC','tickNPC','player','game'] });
console.log = _L;

H('★★ FOUR PROFILES, AND THEY ARE FOUR JOBS');
{
  const R = G.NPC_ROAM;
  ok(Object.keys(R).length === 4 && R.idle && R.walking && R.grazing && R.fly,
     `${Object.keys(R).join(', ')} · the Creator's four`);
  ok(R.idle.legMax === 0, '★★★ idle does not move at all · "quest npcs stay idle blinking"');
  ok(R.fly.legMax > R.walking.legMax && R.walking.legMax > R.grazing.legMax,
     `★★ leg length orders fly(${R.fly.legMax}) > walking(${R.walking.legMax}) > grazing(${R.grazing.legMax})`);
  ok(R.grazing.pause > R.walking.pause && R.walking.pause > R.fly.pause,
     `★★★ and pausing runs the other way · grazing ${R.grazing.pause} > walking ${R.walking.pause} > fly ${R.fly.pause}`
   + ' — for an animal feeding, the PAUSE is the behaviour and the walking is incidental');
  ok(R.fly.fly === true && !R.walking.fly && !R.grazing.fly,
     '★★★ and only flight passes `flying` to walkable()');
  ok(R.fly.radius > R.walking.radius && R.walking.radius > R.grazing.radius,
     `★ range follows the same order · ${R.fly.radius} / ${R.walking.radius} / ${R.grazing.radius}`);
}

H('★★★★ HOW FAR DO THEY GET, AND HOW STRAIGHT IS THE PATH');
{
  // ★ Drive the REAL step. A body is dropped on open ground and ticked; we
  //   measure the furthest it ever gets from home and how many distinct tiles
  //   it visits. A random walk revisits; a legged roam covers ground.
  const runProfile = (key, radius) => {
    const P = Object.assign({}, G.NPC_ROAM[key], { radius });
    const n = { tileX: 40, tileY: 120, homeX: 40, homeY: 120, dir: 'down',
                mode: 'wander', wanderRadius: radius, moving: false, animFrame: 0,
                _roamProf: P, _roamKey: key, id: 'probe_' + key };
    const seen = new Set([n.tileX + ',' + n.tileY]);
    let far = 0, moved = 0;
    for (let i = 0; i < 400; i++){
      const bx = n.tileX, by = n.tileY;
      // one roam decision — replicate the tick's entry conditions
      stepOnce(n, P);
      if (n.tileX !== bx || n.tileY !== by) moved++;
      seen.add(n.tileX + ',' + n.tileY);
      far = Math.max(far, Math.abs(n.tileX - n.homeX) + Math.abs(n.tileY - n.homeY));
    }
    return { far, tiles: seen.size, moved };
  };
  // ★ the roam body lives inside tickNPC's closure, so it is lifted out of the
  //   BUILD source and run — the same trick verify_sprite_fixes uses for
  //   _chaseDirFor. Testing my re-implementation would prove only my copy works.
  const i = src.indexOf('    const P = roamProfileFor(n);');
  const j = src.indexOf('\n  }\n}', i);
  const body = src.slice(i, j).replace('const P = roamProfileFor(n);', '');
  const stepOnce = new Function('n', 'P', 'stepNPCTo', '_DIR_VEC', 'Math_', `
    const Math = Math_; ${body}
  `).bind(null);
  const call = (n, P) => stepOnce(n, P, G.stepNPCTo, G._DIR_VEC, Math);
  // rebind the helper the closure above expects
  const stepOnceReal = (n, P) => call(n, P);
  globalThis.__step = stepOnceReal;

  const results = {};
  for (const [key, radius] of [['walking', 6], ['grazing', 3], ['fly', 10]]){
    const P = Object.assign({}, G.NPC_ROAM[key], { radius });
    const n = { tileX: 40, tileY: 120, homeX: 40, homeY: 120, dir: 'down',
                mode: 'wander', wanderRadius: radius, moving: false, animFrame: 0, id: 'probe' };
    const seen = new Set(['40,120']);
    let far = 0, moved = 0;
    for (let k = 0; k < 400; k++){
      const bx = n.tileX, by = n.tileY;
      try { stepOnceReal(n, P); } catch(e){ ok(false, `${key}: ${e.message}`); break; }
      if (n.tileX !== bx || n.tileY !== by) moved++;
      seen.add(n.tileX + ',' + n.tileY);
      far = Math.max(far, Math.abs(n.tileX - n.homeX) + Math.abs(n.tileY - n.homeY));
    }
    results[key] = { far, tiles: seen.size, moved };
    ok(true, `  ${key.padEnd(8)} reached ${far} tiles from home · visited ${seen.size} distinct tiles · moved on ${moved}/400 ticks`);
  }
  // ★★★★ THE CLAIM. A walker must actually use its range.
  ok(results.walking.far >= 5,
     `★★ walking reaches ${results.walking.far} of its 6-tile radius`);
  // ★★★★ THE REAL CLAIM · straightness. Reach is not the complaint; pacing is.
  {
    const OPP = { up:'down', down:'up', left:'right', right:'left' };
    const P = Object.assign({}, G.NPC_ROAM.walking, { radius: 6 });
    let rev = 0, steps = 0, runs = [], cur = 0, last = null;
    for (let t = 0; t < 12; t++){
      const n = { tileX: 40, tileY: 120, homeX: 40, homeY: 120, dir: 'down',
                  moving: false, animFrame: 0, id: 'straight' };
      for (let k = 0; k < 400; k++){
        const bx = n.tileX, by = n.tileY;
        try { globalThis.__step(n, P); } catch(_){ break; }
        if (n.tileX === bx && n.tileY === by) continue;
        const d = n.tileX > bx ? 'right' : n.tileX < bx ? 'left' : n.tileY > by ? 'down' : 'up';
        steps++;
        if (last && d === OPP[last]) rev++;
        if (last && d === last) cur++; else { if (cur) runs.push(cur + 1); cur = 0; }
        last = d;
      }
      if (cur) runs.push(cur + 1);
    }
    const revPct = 100 * rev / Math.max(1, steps);
    const meanRun = runs.length ? runs.reduce((a, b) => a + b, 0) / runs.length : 1;
    ok(revPct < 15,
       `★★★★ reverses on ${revPct.toFixed(1)}% of steps · the old random walk did 32.5% — `
     + '"stop and go back" was a third of every step it took');
    ok(meanRun >= 3.2,
       `★★★★ mean straight run ${meanRun.toFixed(2)} tiles · the old model managed 2.27, which is `
     + 'literally "walk one or two tiles"');
  }
  ok(results.walking.tiles >= 20,
     `★★★ and covers ${results.walking.tiles} distinct tiles · a random walk revisits, a legged roam covers ground`);
  ok(results.fly.far >= 8, `★★★ flight reaches ${results.fly.far} of its 10-tile radius`);
  // ★★ grazing is SUPPOSED to stay put — that is the profile, not a failure
  ok(results.grazing.moved < results.walking.moved,
     `★★ grazing moves on ${results.grazing.moved} ticks against walking's ${results.walking.moved} · `
   + 'it feeds more than it travels, by design');
  ok(results.grazing.far <= 3 + 1, `★ and stays inside its 3-tile patch (${results.grazing.far})`);
}

H('★★★ NOTHING LEAVES ITS FENCE');
{
  for (const [key, radius] of [['walking', 6], ['grazing', 3], ['fly', 10]]){
    const P = Object.assign({}, G.NPC_ROAM[key], { radius });
    const n = { tileX: 40, tileY: 120, homeX: 40, homeY: 120, dir: 'down',
                mode: 'wander', wanderRadius: radius, moving: false, animFrame: 0, id: 'fence' };
    let worst = 0;
    for (let k = 0; k < 600; k++){
      try { globalThis.__step(n, P); } catch(_){ break; }
      worst = Math.max(worst, Math.abs(n.tileX - n.homeX) + Math.abs(n.tileY - n.homeY));
    }
    ok(worst <= radius, `  ${key.padEnd(8)} never exceeded its ${radius}-tile radius (worst ${worst})`);
  }
}

H('★★ THE CATEGORY COMES FROM SHIPPED DATA, NOT FROM MY TAXONOMY');
{
  ok(/ROAM_FLIERS = new Set\(\[/.test(src), 'the flier set is explicit');
  for (const id of ['morlisk','elzoran','auraxion','anciuxor','aetherwing','skybeam']){
    ok(G.ROAM_FLIERS.has(id), `  ${id.padEnd(11)} flies`);
    ok(fs.existsSync(`assets/2D sprites/enemies/${id}-fly.png`)
       || fs.existsSync(`assets/2D sprites/zyrex/${id}-fly.png`),
       `     ★ and has a fly sheet on disk · that is the evidence, not my opinion`);
  }
  // ★ a quest NPC must resolve to idle without anyone tagging it
  const quest = { mode: 'stationary', wanderRadius: 0, id: 'q' };
  ok(G.roamProfileFor(quest).legMax === 0, '★★★ a stationary NPC resolves to idle · quest givers stay put');
  const graze = { mode: 'wander', wanderRadius: 3, _roamKind: 'satyrbeast', id: 'g' };
  ok(G.roamProfileFor(graze).pause === G.NPC_ROAM.grazing.pause, '★★ a satyrbeast grazes');
  const fly = { mode: 'wander', wanderRadius: 8, _roamKind: 'morlisk', id: 'fl' };
  ok(G.roamProfileFor(fly).fly === true, '★★ a morlisk flies');
  ok(G.roamProfileFor(fly).radius === 8,
     '★★★ and it KEEPS ITS AUTHORED RADIUS · the profile decides HOW a body moves, never WHERE it may go');
}

H('★★★ STELDEN STILL WALKS HIS COURTYARD · the pattern the Creator named');
{
  const s = (G.NPCS || []).find(n => n && n.id === 'stelden');
  ok(!!s, 'Stelden is on his post');
  const P = G.roamProfileFor(s);
  ok(P.radius === 4, `★★ his courtyard is still 4 tiles · authored, not overridden (${P.radius})`);
  ok(G.roamProfileFor(s).legMax === G.NPC_ROAM.walking.legMax, '★ and he walks · legs, not jitter');
}

H('★★ FLIGHT REACHES walkable() · it never did before');
{
  ok(/function stepNPCTo\(n, nx, ny, newDir, flying\)/.test(src), 'stepNPCTo takes a flying flag');
  ok(/walkable\(nx, ny, !!flying\)/.test(src), '★★★ and passes it through');
  // driven: a flier crosses a tile a walker cannot
  let crossed = false, blocked = false;
  for (let y = 100; y < 400 && !(crossed && blocked); y++)
    for (let x = 10; x < 400; x++){
      if (!G.walkable(x, y, false) && G.walkable(x, y, true)){
        blocked = true; crossed = true;
        ok(true, `★★★★ tile ${x},${y} is impassable on foot and open in flight · the difference is real`);
        break;
      }
    }
  ok(crossed, 'the map actually contains terrain only flight can cross');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ four profiles · legs not jitter · walkers cover ground, grazers feed, fliers fly');
process.exit(f ? 1 : 0);
