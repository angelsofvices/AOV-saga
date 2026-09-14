// ★★★★ v0.97.2 · THE ENEMY WORLD, MEASURED BY BOOTING IT.
//
//   Creator, 2026-09-14: "borrow the ZYREX_POPULATIONS habitat model, so
//   species tie to terrain rather than district id. but make it so that u can
//   find almost all enemies in any district, just weighted to the district
//   scale 1-10. harder fights in korathen than malezor and the enemies are
//   harder, not necessarily more. all districts can have 100 enemies spread out
//   so 1000 total and they respawn after 10 mins of death maybe? should feel
//   like seers are reroducing enemies while we explore."
//
// ★★★★ THIS FILE EXISTS BECAUSE I GOT IT WRONG BY READING INSTEAD OF RUNNING.
//   At v0.97.1 I reported four districts with ZERO overworld enemies and wrote
//   it into a findings doc. The real number was 200 each. My harness evaluated
//   the NPCS array LITERAL; the world's 2,000 roamers are pushed at boot by
//   scatterDistrictEnemies(), inside a setTimeout the harness never ran.
//   ★★★ I measured the source and called it the world.
//
// So this suite boots the actual game — DOM shimmed, boot tasks executed — and
// counts what is standing there. It replaces tools/verify_enemy_siting.js and
// tools/lib/world_harness.js, both deleted: two harnesses that disagree is the
// same failure as two town rules that disagree, and I have now made that
// mistake twice in one day.
import { bootGame, overworldEnemies, byDistrict } from './lib/boot_game.mjs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

const t0 = Date.now();
const G  = bootGame();
const DISTS = G.ZYRAXIS_DISTRICTS.map(d => d.id);
const enemies = overworldEnemies(G);
const roamers = enemies.filter(n => n._roamOf);

H(`★ THE GAME BOOTED · ${Date.now() - t0}ms · ${G.NPCS.length} NPCs`);
{
  ok(G.NPCS.length > 1500, `${G.NPCS.length} NPCs in the live world`);
  ok(enemies.length > 1500, `★★★ ${enemies.length} overworld enemies actually standing — `
     + 'the number my source-reading harness reported as 177');
  ok(typeof G.enemyHabitatAt === 'function', 'the habitat classifier is exported and live');
  ok(roamers.length > 500, `${roamers.length} of them placed by the roamer pass`);
}

H('★★★ "ALL DISTRICTS" · the count the Creator set in v0.95.979 still holds');
{
  const per = byDistrict(G, enemies);
  console.log('     ' + DISTS.map(d => `${d} ${per[d]}`).join(' · '));
  ok(DISTS.every(d => per[d] >= 180), 'every district holds at least 180 enemies');
  const vals = DISTS.map(d => per[d]);
  ok(Math.max(...vals) - Math.min(...vals) <= 20,
     `★★ and the spread across all ten is ${Math.min(...vals)}–${Math.max(...vals)} — `
     + 'flat, which is what "no area super dense and others scarce" asked for');
  ok(G.DISTRICT_ROAM_TARGET === 200,
     `★ target is still ${G.DISTRICT_ROAM_TARGET}/district · the Creator kept his own earlier ruling`);
}

H('★★★ THE HABITAT CLASSIFIER · terrain, not district id');
{
  const HABS = ['hub_fringe','meadow','forest','waterside','highland','cave_mouth','wild_fringe','landmark'];
  ok(JSON.stringify(G.ENEMY_HABITATS) === JSON.stringify(HABS),
     'the eight habitats match tools/build_wild_placement.mjs exactly');
  // ★ every habitat must be REACHABLE, or it is a definition with no territory
  const seen = {};
  for (const n of roamers) seen[n._roamHab] = (seen[n._roamHab] || 0) + 1;
  console.log('     ' + HABS.map(h => `${h} ${seen[h] || 0}`).join(' · '));
  const live = HABS.filter(h => seen[h]);
  ok(live.length >= 6, `★★ ${live.length}/8 habitats actually hold enemies`);
  // ★★ waterside was 0 on the first run — not because the classifier was wrong
  //   but because the pack anchor never reached a coast. A habitat you cannot
  //   sample does not exist, however correctly it is defined.
  ok((seen.waterside || 0) > 0, `★★★ waterside is populated (${seen.waterside || 0}) — `
     + 'it was zero until the anchor radius reached 0.99 of the district');
  // the classifier must AGREE with where things were put
  let agree = 0, checked = 0;
  for (const n of roamers.slice(0, 400)){
    const h = G.enemyHabitatAt(n._roamOf, n.tileX, n.tileY);
    checked++; if (h === n._roamHab) agree++;
  }
  ok(agree / checked > 0.95, `★ the classifier still returns the stored habitat for `
     + `${agree}/${checked} sampled bodies — it is deterministic, not a one-shot label`);
}

H('★★★ "ALMOST ALL ENEMIES IN ANY DISTRICT" · weights, never zeros');
{
  const mix = {};
  for (const n of roamers) (mix[n._roamOf] ||= {})[n._roamKind] = ((mix[n._roamOf] ||= {})[n._roamKind] || 0) + 1;
  for (const d of DISTS) console.log(`     ${d.padEnd(10)} ${JSON.stringify(mix[d] || {})}`);

  // ★★★ THE LONG TAIL, BOTH WAYS. The shipped DISTRICT_ENEMY_MIX had
  //   `malezor: { mori: 10 }` — a hard zero for everything else. The test that
  //   matters is that heavy things reach shallow districts AND light things
  //   survive into deep ones, because a zero in either direction is the rule
  //   the Creator asked me to remove.
  const deep = ['xilnar','baelgor','thardin','korathen'];
  const lightInDeep = deep.filter(d => (mix[d] || {}).mori > 0);
  ok(lightInDeep.length >= 3, `★★ Mori still appear in ${lightInDeep.length}/4 of the deepest districts`);
  const kindsPerDist = DISTS.map(d => Object.keys(mix[d] || {}).length);
  ok(Math.min(...kindsPerDist.slice(2)) >= 3,
     `★ every district past the tutorial pair draws from ≥3 species (${kindsPerDist.join(',')})`);

  // ★ and the draw itself must offer nearly everything nearly everywhere,
  //   which is a property of the TABLE and is testable without waiting for
  //   a rare roll to actually happen.
  let offered = 0, slots = 0;
  for (const d of DISTS)
    for (const h of G.ENEMY_HABITATS){
      const bag = G.enemyDrawFor(d, h);
      slots++; if (bag.length >= 5) offered++;
    }
  ok(offered / slots > 0.8, `★★★ ${offered}/${slots} district×habitat draws offer 5+ species — `
     + 'a weighted bag, not a lookup');
}

H('★★★ "HARDER, NOT NECESSARILY MORE" · the gradient is in the TIER, not the count');
{
  const meanTier = d => {
    const r = roamers.filter(n => n._roamOf === d);
    return r.length ? r.reduce((s, n) => s + (n.tier || 1), 0) / r.length : 0;
  };
  const tiers = DISTS.map(d => +meanTier(d).toFixed(2));
  console.log('     mean tier · ' + DISTS.map((d, i) => `${d} ${tiers[i]}`).join(' · '));
  const west = tiers.slice(0, 3).filter(Boolean);
  const east = tiers.slice(7);
  const wAvg = west.reduce((a, b) => a + b, 0) / west.length;
  const eAvg = east.reduce((a, b) => a + b, 0) / east.length;
  ok(eAvg > wAvg * 1.5, `★★★ mean enemy tier climbs ${wAvg.toFixed(2)} → ${eAvg.toFixed(2)} west to east`);

  // ★ monotonic-ish: allow local dips, but the trend must not invert.
  //   ★★ My first curve DID invert — Korathen came back softer than Xilnar,
  //     because the target tier (8.4) had run off the end of the roamable
  //     roster and every species fell onto the 0.04 floor, where rarity alone
  //     decided and Mori won. This assertion exists to catch that again.
  const nz = tiers.map((t, i) => [i, t]).filter(([, t]) => t > 0);
  let inversions = 0;
  for (let i = 1; i < nz.length; i++) if (nz[i][1] < nz[i - 1][1] - 0.35) inversions++;
  ok(inversions <= 2, `★★ ${inversions} significant inversions in the difficulty ramp`);
  ok(tiers[9] >= Math.max(...tiers) - 0.4,
     `★★★ Korathen (${tiers[9]}) is at or near the hardest in the world — the inversion is gone`);

  // levels and HP scale too, and always did
  const lv = d => { const r = roamers.filter(n => n._roamOf === d); return r.length ? r[0].level : 0; };
  ok(lv('korathen') > lv('andrannor') * 2, `★ level bands still climb (${lv('andrannor')} → ${lv('korathen')})`);
}

H('★★★ RARITY · a miniboss is rare EVERYWHERE');
{
  const count = k => roamers.filter(n => n._roamKind === k).length;
  const vor = count('vorugath');
  console.log(`     vorugath ${vor} · vilerok ${count('vilerok')} · morlisk ${count('morlisk')} `
            + `· satyrbeast ${count('satyrbeast')} · daemon ${count('daemon')} · mori ${count('mori')}`);
  // ★★★ The first habitat draw put NINETY-SEVEN Vorugath in Baelgor. The world
  //   was designed to hold five. Tier-fit was answering "does a T6 belong at
  //   depth 9" — yes — and nothing was asking "is this a heavy thing".
  ok(vor < 60, `★★★ vorugath is ${vor} world-wide, not the 97-in-one-district the first draw produced`);
  ok(count('mori') > vor * 2, '★ and the common thing is still commoner than the miniboss');
  // net-owned species must NEVER be roam-cloned — their counts are ruled
  for (const k of ['scanobot','penumbra','nymphysyl','morvexar'])
    ok(count(k) === 0, `  ${k} is not roam-cloned · its own placer owns its count`);
  const morv = G.NPCS.filter(n => n && /^morvexar_/.test(n.id || '')).length;
  ok(morv === 12, `★★ and Morvexar is still exactly 12 — the ruled 6/4/2 survived the redistribution`);
}

H('★★★ RESPAWN · "seers reproducing enemies while we explore"');
{
  ok(G.ENEMY_RESPAWN_MS === 10 * 60 * 1000, `${G.ENEMY_RESPAWN_MS / 60000} minutes, as asked`);
  ok(typeof G.queueEnemyRespawn === 'function' && typeof G.tickEnemyRespawn === 'function',
     'the queue and the tick are both live');

  // ★★ DRIVE IT. Kill a roamer, jump the clock, and see whether the world
  //   actually replaces it — and replaces it SOMEWHERE ELSE, which is the
  //   ruling that makes this reproduction rather than a reset.
  const victim = roamers.find(n => n._roamOf === 'veridan');
  const where0 = [victim.tileX, victim.tileY];
  const before = G.NPCS.length;
  G.queueEnemyRespawn(victim);
  ok(G.NPCS.length === before, 'queueing does not spawn anything immediately');

  // wind the clock past the timer
  const realNow = performance.now.bind(performance);
  let skew = 0;
  globalThis.performance.now = () => realNow() + skew;
  skew = 11 * 60 * 1000;
  // park the player far away so the on-screen guard cannot reject every tile
  G.player.x = 58; G.player.y = 103;
  const made = G.tickEnemyRespawn();
  ok(made === 1, `★★★ ten minutes later the world replaced it (${made})`);
  const fresh = G.NPCS.filter(n => n && n._respawned);
  ok(fresh.length === 1, 'exactly one body came back · not a cascade');
  if (fresh.length){
    const r = fresh[0];
    ok(G.worldDistrictAt(r.tileX, r.tileY) === 'veridan', '  it came back in its own district');
    const moved = Math.abs(r.tileX - where0[0]) + Math.abs(r.tileY - where0[1]);
    ok(moved > 0, `★★★ and NOT on the tile it died on — ${moved} tiles away. `
       + 'Same-tile respawn is a farm; re-siting is being pushed back.');
    ok(Math.abs(r.tileX - G.player.x) >= 24 || Math.abs(r.tileY - G.player.y) >= 24,
       '★★ and never within sight of the player · a body that appears on screen is a bug report');
    ok(!!r._roamHab && G.ENEMY_HABITATS.includes(r._roamHab),
       `★ drawn through the habitat picker again · came back on ${r._roamHab} as a ${r._roamKind}`);
    ok(r.level === G.TOWER_NETWORK.find(t => t.dist === 'veridan').moriLv,
       '★ at the district band, so a respawn cannot escalate past what Veridan may produce');
  }
  globalThis.performance.now = realNow;

  // ★ net-owned bodies must not enter the queue at all
  const morv = G.NPCS.find(n => n && /^morvexar_/.test(n.id || ''));
  ok(G.queueEnemyRespawn(morv) === false, '★★ a Morvexar is refused by the queue — ruled counts stay ruled');
}

H('★★★ TOWN · one rule, not two');
{
  // ★★★★ I shipped a SECOND town test at v0.97.1 while arguing in its own
  //   comment that inverting an existing law beats authoring a parallel one.
  //   _townAnchors already existed and already had 2,000 enemies standing on
  //   it. This asserts they now agree on the number.
  ok(G.ROAM_MIN_FROM_TOWN === 26, 'the roamer pass keeps 26 tiles from town');
  const anchors = G._townAnchors('malezor');
  ok(anchors.length > 5, `★ _townAnchors sees ${anchors.length} anchors in Malezor — hub, civic AND homes`);
  let inTown = 0;
  for (const n of roamers){
    const a = G._townAnchors(n._roamOf);
    for (const [tx, ty] of a) if (Math.hypot(tx - n.tileX, ty - n.tileY) < G.ROAM_MIN_FROM_TOWN){ inTown++; break; }
  }
  ok(inTown === 0, inTown ? `${inTown} roamers are standing in town` :
     `★★★ not one of ${roamers.length} roamers stands within 26 tiles of a door`);
}

H(f ? `\n❌ ${f} failed` : '\n✅ terrain decides what · the 1-10 scale decides how likely · and it comes back');
process.exit(f ? 1 : 0);
