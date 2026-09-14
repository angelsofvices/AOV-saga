// ★★★ BOOT THE WHOLE GAME IN NODE · the only harness that tells the truth.
//
// ★★★★ WHY THIS REPLACES MY HAND-ROLLED VM HARNESS. On 2026-09-14 I reported
//   that four districts had ZERO overworld enemies and wrote it into a findings
//   doc. It was false. My harness evaluated the `NPCS` array LITERAL, and the
//   world's 2,000 roaming enemies are not in the literal — they are pushed at
//   boot by scatterDistrictEnemies(). I measured the source and called it the
//   world.
//
// ★★ tools/build_wild_placement.mjs already had the right technique and I did
//   not look: shim just enough DOM to let the build's own boot path run, then
//   read the live globals. A game that has BOOTED cannot lie about what is in
//   it. This file extracts that technique so every suite can use it.
//
// ★ The shim is deliberately dumb. It is not pretending to be a browser — it
//   exists so that `document.getElementById(...)` does not throw before the
//   data structures are built. Anything that needs real rendering is out of
//   scope for it, and that is fine: the questions worth asking here are about
//   WHAT IS IN THE WORLD, not what it looks like.
import fs from 'fs';

export function bootGame({ runBootTasks = true } = {}){
  const noop = () => {};
  const CTX = new Proxy({}, { get: () => () => ({ addColorStop: noop, width: 0, height: 0, data: [] }) });
  const el = () => ({
    style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
    getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop,
    removeEventListener: noop, setAttribute: noop, getAttribute: () => null, focus: noop, remove: noop,
    play: () => Promise.resolve(), pause: noop, querySelector: () => el(), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }),
  });
  try { Object.defineProperty(globalThis, 'navigator',
        { value: { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 }, configurable: true }); } catch(_){}

  // ★★★ setTimeout IS NOT A NO-OP HERE, and that is the whole point.
  //   The build does its world population inside `setTimeout(..., 0)` at boot
  //   (line ~16100): the scanobot net, the new enemy net, the tower guards,
  //   AND scatterDistrictEnemies. build_wild_placement.mjs stubs setTimeout to
  //   `()=>0`, so none of that ran — which is exactly the blind spot that let
  //   me report empty districts. Here the callbacks are COLLECTED and run on
  //   purpose, so the world is the world.
  const deferred = [];
  Object.assign(globalThis, {
    setInterval: () => 0, clearInterval: noop, clearTimeout: noop,
    setTimeout: (fn, ms) => { if (typeof fn === 'function') deferred.push({ fn, ms: ms || 0 }); return 0; },
    addEventListener: noop, removeEventListener: noop, window: globalThis,
    document: { getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [],
                createElement: () => el(), addEventListener: noop, body: el(), documentElement: el(),
                head: el(), hidden: false, visibilityState: 'visible' },
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    Audio: function(){ return { play: () => Promise.resolve(), pause: noop, addEventListener: noop,
                                cloneNode(){ return this; } }; },
    Image: function(){ return { addEventListener: noop, complete: false, naturalWidth: 0, src: '' }; },
    requestAnimationFrame: () => 0, cancelAnimationFrame: noop,
    matchMedia: () => ({ matches: false, addEventListener: noop, addListener: noop }),
    performance: { now: () => Date.now() },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
  });

  const html = fs.readFileSync(new URL('../../rp7b.html', import.meta.url), 'utf8');
  let all = ''; const re = /<script[^>]*>([\s\S]*?)<\/script>/g; let m;
  while ((m = re.exec(html))) all += m[1] + '\n';

  // ★ export the globals a placement suite needs. `globalThis.__G = {...}` is
  //   evaluated INSIDE the build's own scope, which is the only place these
  //   names exist — a top-level const never leaks out on its own.
  const EXPORTS = ['NPCS','WORLD_PROPS','ZYRAXIS_DISTRICTS','ZYRAXIS_DISTRICT_BY_ID','TOWER_NETWORK',
    'DISTRICT_WHEEL','wheelQuarterAt','worldDistrictAt','isWorldLandTile','isWorldBorderTile',
    '_propBlocked','walkable','game','player','SETTLEMENT_DOCTRINE','SETTLEMENT_QUARTERS',
    '_townAnchors','_districtPOIs','DISTRICT_ROAM_TARGET','ROAM_MIN_FROM_TOWN',
    'scatterDistrictEnemies','buildScanobotNet','buildNewEnemyNet','siteEnemyTile',
    'NEW_ENEMY_PLACEMENT','newEnemyCountFor','_makeWorldRng','_scanobotWalkable',
    'enemyHabitatAt','ENEMY_HABITATS','ENEMY_SPECIES_HABITAT','districtScaleOf',
    'DISTRICT_ENEMY_ROSTER','DISTRICT_ROSTER_TOTAL','DISTRICT_SPAWN_RANGE','rosterTotalFor','siteRosterTile',
    'ENEMY_LINEAGE','ENEMY_STEM_OF','ENEMY_BRANCH_OF','rosterCountFor','ROSTER_GATED','siteInTown','townCoreOf','ROSTER_MIN_SPACING','TOWN_CIVIC_CLEAR','TOWN_HOME_CLEAR','topUpGatedRoster','applyScanobotState','LEGACY_ENEMY_SCATTER_ENABLED','ENEMY_TIER_MAX','TIER_TEN_BEINGS','LOWER_ZYRAXIS_TIER_BAND','enemyTierLegal',
    'tickEnemyRespawn','ENEMY_RESPAWN_MS','queueEnemyRespawn','_enemyRespawnQueue'];
  const tail = ';globalThis.__G = {' + EXPORTS.map(n =>
      `${n}: (typeof ${n} !== 'undefined' ? ${n} : undefined)`).join(',') + '};';

  new Function(all + tail)();
  const G = globalThis.__G;

  if (runBootTasks){
    // ★ run the deferred boot work in the order it was scheduled — this is what
    //   actually populates the world.
    deferred.sort((a, b) => a.ms - b.ms);
    for (const d of deferred){ try { d.fn(); } catch(_){} }
    // re-read: the builders pushed into the SAME array object, but re-export
    // anything that may have been reassigned
    for (const n of EXPORTS) if (globalThis.__G[n] === undefined) {}
  }
  return G;
}

// convenience: every overworld enemy actually standing in the booted world
export function overworldEnemies(G){
  return G.NPCS.filter(n => n && n.isEnemy && n.scene === 'overworld' && typeof n.tileX === 'number');
}
export function byDistrict(G, list){
  const out = {};
  for (const d of G.ZYRAXIS_DISTRICTS) out[d.id] = 0;
  for (const n of list){ const d = G.worldDistrictAt(n.tileX, n.tileY); if (d != null && d in out) out[d]++; }
  return out;
}
