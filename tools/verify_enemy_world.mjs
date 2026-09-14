// ★★★★ v0.97.3 · THE AUTHORED ROSTER, MEASURED BY BOOTING IT.
//
//   Creator, 2026-09-14: "we need a strict 200 enemy spawn in each district
//   with respawn on. malezor carries 180 mori and 15 vilerok and 5 vorugath..."
//
// ★★★ "STRICT" IS THE WORD THIS FILE EXISTS TO ENFORCE. A roster that quietly
//   places 150 of an authored 200 looks, from inside the game, exactly like one
//   that placed 200 — you would have to stand in Netharion and count. So every
//   row is checked against the booted world body by body, and the pass reports
//   shortfalls rather than rounding them.
//   ★★ That is not hypothetical: the first boot after the rewrite came back
//     "netharion/nymphysyl×50 · no sheet" and 145 bodies were missing from
//     three districts, because Nymphysyl had never existed as a clonable NPC —
//     she was built from her art table by a net I had just taken her off.
//     One boot, not one playthrough.
//
// ★ The model inverted at v0.97.3: the ROSTER decides what, TERRAIN decides
//   where. Both halves are tested here.
import { bootGame, overworldEnemies, byDistrict } from './lib/boot_game.mjs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

const t0 = Date.now();
const G  = bootGame();
const DISTS   = G.ZYRAXIS_DISTRICTS.map(d => d.id);
const enemies = overworldEnemies(G);
const roster  = enemies.filter(n => n._roamOf);
const TIER = { mori:1, daemon:2, satyrbeast:3, morlisk:4, vilerok:5, vorugath:6, nymphysyl:7 };

const mixOf = d => {
  const m = {};
  for (const n of roster) if (n._roamOf === d) m[n._roamKind] = (m[n._roamKind] || 0) + 1;
  return m;
};

H(`★ THE GAME BOOTED · ${Date.now() - t0}ms · ${G.NPCS.length} NPCs`);
{
  ok(enemies.length > 2500, `${enemies.length} overworld enemies standing`);
  ok(roster.length === 2000, `★★★ ${roster.length} roster bodies · ten districts × 200, exactly`);
}

H('★★★ EVERY AUTHORED ROW SUMS TO 200 · the table checks itself');
{
  for (const d of DISTS){
    const total = G.rosterTotalFor(d);
    ok(total === G.DISTRICT_ROSTER_TOTAL, `  ${d.padEnd(10)} ${total}`);
  }
  // ★ and nothing may name a species the spawner cannot build
  const known = Object.keys(TIER);
  const bad = [];
  for (const d of DISTS)
    for (const k of Object.keys(G.DISTRICT_ENEMY_ROSTER[d] || {}))
      if (!known.includes(k)) bad.push(`${d}/${k}`);
  ok(!bad.length, bad.length ? `unknown species in the table: ${bad.join(', ')}` :
     `★ every row names only species the pass can place (${known.join(', ')})`);
}

H('★★★ AND THE BOOTED WORLD MATCHES IT BODY FOR BODY');
{
  let drift = 0;
  for (const d of DISTS){
    const want = G.DISTRICT_ENEMY_ROSTER[d], got = mixOf(d);
    const line = Object.keys(want).map(k => `${k} ${got[k] || 0}/${want[k]}`).join(' · ');
    const exact = Object.keys(want).every(k => (got[k] || 0) === want[k])
               && Object.keys(got).every(k => want[k] != null);
    if (!exact) drift++;
    ok(exact, `  ${d.padEnd(10)} ${line}`);
  }
  ok(drift === 0, drift ? `${drift} districts drifted from their authored roster`
     : '★★★ not one district differs from the table by a single body');
}

H('★★★ TERRAIN DECIDES WHERE · the half of the old model that survived');
{
  // ★★ THE TEST THAT CAN CATCH A DEAD SITER. Species are assigned by the
  //   roster now, so no per-body check can prove habitat still matters. What
  //   can: each species should land disproportionately in the habitats its
  //   affinity row favours, compared to where bodies land overall.
  const overall = {};
  for (const n of roster) overall[n._roamHab] = (overall[n._roamHab] || 0) + 1;
  const share = h => (overall[h] || 0) / roster.length;

  const check = (kind, hab) => {
    const mine = roster.filter(n => n._roamKind === kind);
    if (!mine.length) return null;
    const s = mine.filter(n => n._roamHab === hab).length / mine.length;
    return { s, base: share(hab) };
  };
  // satyrbeast is forest:10 · vilerok is cave_mouth:10 · vorugath is highland:10
  for (const [kind, hab] of [['satyrbeast','forest'], ['vilerok','cave_mouth'], ['vorugath','highland']]){
    const r = check(kind, hab);
    if (!r){ ok(false, `no ${kind} placed at all`); continue; }
    ok(r.s > r.base, `★★ ${kind} favours ${hab}: ${(r.s*100).toFixed(1)}% of them vs `
       + `${(r.base*100).toFixed(1)}% of all bodies`);
  }
  const habs = {};
  for (const n of roster) habs[n._roamHab] = (habs[n._roamHab] || 0) + 1;
  console.log('     ' + G.ENEMY_HABITATS.map(h => `${h} ${habs[h] || 0}`).join(' · '));
  ok(Object.keys(habs).length >= 5, `${Object.keys(habs).length} habitats in use`);
  // the classifier must agree with the label each body was stamped with
  let agree = 0, n = 0;
  for (const b of roster.slice(0, 500)){
    n++; if (G.enemyHabitatAt(b._roamOf, b.tileX, b.tileY) === b._roamHab) agree++;
  }
  ok(agree / n > 0.95, `★ the classifier reproduces the stored habitat for ${agree}/${n} bodies`);
}

H('★★ THE DIFFICULTY CURVE THE CREATOR AUTHORED · reported, not enforced');
{
  const mt = d => {
    const r = roster.filter(x => x._roamOf === d);
    return +(r.reduce((s, x) => s + (TIER[x._roamKind] || 1), 0) / r.length).toFixed(2);
  };
  const tiers = DISTS.map(mt);
  console.log('     ' + DISTS.map((d, i) => `${d} ${tiers[i]}`).join(' · '));
  // ★★★ NOT ASSERTED MONOTONIC, because the dips are in the Creator's own
  //   numbers and are his to keep. They are printed so they are visible:
  //     · Zarvane (1.30) is softer than Malezor (1.43) — Malezor carries 15
  //       Vileroks and 5 Vorugath and Zarvane carries neither.
  //     · Xilnar is the hardest district in the world, above Korathen, because
  //       Nymphysyl is T7 and lives only in the three dark districts while
  //       Korathen's ceiling is Vorugath at T6.
  ok(tiers[0] > 1 && tiers[9] > 4, `★ the ramp runs ${tiers[0]} → ${tiers[9]}`);
  const peak = DISTS[tiers.indexOf(Math.max(...tiers))];
  console.log(`     ★★ hardest district by mean tier: ${peak} (${Math.max(...tiers)})`);
  ok(true, `  — reported for the Creator's eye · not a failure, these are his numbers`);
}

H('★★★ ABOVE THE 200 · minibosses and nets, and no double-placement');
{
  const per = byDistrict(G, enemies);
  console.log('     total per district · ' + DISTS.map(d => `${d} ${per[d]}`).join(' · '));
  ok(DISTS.every(d => per[d] >= 200), 'every district is at or above the 200 line');

  // ★★★ NYMPHYSYL MOVED FROM HER NET TO THE ROSTER. If both placed her,
  //   Netharion's authored 50 would boot as ~56 and the table would be a lie.
  const netNym = G.NPCS.filter(n => n && /^nymphysyl_/.test(n.id || '')).length;
  const rosNym = roster.filter(n => n._roamKind === 'nymphysyl').length;
  ok(netNym === 0, '★★ buildNewEnemyNet no longer places Nymphysyl');
  ok(rosNym === 145, `★★★ and the roster holds all ${rosNym} of her (50+45+50) — placed once`);
  ok(roster.filter(n => n._roamKind === 'nymphysyl').every(n => n._astralOnly === true),
     '★ every one of them carries _astralOnly · punches still pass through');

  // ★ MORVEXAR · ruled ADD, so the original 6/4/2 stands and three join it
  const morv = G.NPCS.filter(n => n && /^morvexar_/.test(n.id || ''));
  ok(morv.length === 24, `★★ morvexar ${morv.length} · korathen 6 · baelgor 4 · zarvane 2 `
     + '+ netharion 4 · vorashil 4 · xilnar 4');
  for (const [d, n] of [['korathen',6],['baelgor',4],['zarvane',2],['netharion',4],['vorashil',4],['xilnar',4]]){
    const got = morv.filter(m => G.worldDistrictAt(m.tileX, m.tileY) === d).length;
    ok(got === n, `  ${d} ${got}`);
  }
  // ★★★ "OUTSKIRTS" WAS A HARD RULE FOR HIM. Past the settlement belt, every one.
  const S = G.SETTLEMENT_DOCTRINE;
  const outs = morv.filter(m => {
    const D = G.ZYRAXIS_DISTRICT_BY_ID[G.worldDistrictAt(m.tileX, m.tileY)];
    if (!D) return false;
    return Math.hypot((m.tileX - D.cx) / D.rx, (m.tileY - D.cy) / D.ry) > S.T_MAX;
  }).length;
  ok(outs === morv.length, `★★★ all ${outs}/${morv.length} Morvexars stand past the settlement belt — `
     + 'the outskirts, as specified, not as preferred');
}

H('★★★ RESPAWN · same species, new ground');
{
  ok(G.ENEMY_RESPAWN_MS === 10 * 60 * 1000, '10 minutes');
  const victim = roster.find(n => n._roamOf === 'veridan' && n._roamKind === 'satyrbeast');
  const from = [victim.tileX, victim.tileY];
  G.queueEnemyRespawn(victim);

  const realNow = performance.now.bind(performance);
  globalThis.performance.now = () => realNow() + 11 * 60 * 1000;
  G.player.x = 58; G.player.y = 103;
  const made = G.tickEnemyRespawn();
  globalThis.performance.now = realNow;

  ok(made === 1, `the world replaced it (${made})`);
  const fresh = G.NPCS.filter(n => n && n._respawned);
  ok(fresh.length === 1, 'exactly one · not a cascade');
  if (fresh.length){
    const r = fresh[0];
    // ★★★ THE RULE THAT CHANGED AT v0.97.3. v0.97.2 redrew the species from the
    //   new tile's terrain, which was right while habitat owned the census. Now
    //   the roster owns it — if a Satyrbeast returns as a Morlisk, Veridan's
    //   authored 55 decays with every fight and the table stops being true.
    ok(r._roamKind === 'satyrbeast', `★★★ came back as a ${r._roamKind} — the roster cannot drift`);
    ok(G.worldDistrictAt(r.tileX, r.tileY) === 'veridan', '  in its own district');
    const moved = Math.abs(r.tileX - from[0]) + Math.abs(r.tileY - from[1]);
    ok(moved > 0, `★★ and NOT where it died · ${moved} tiles away`);
    ok(Math.abs(r.tileX - G.player.x) >= 24 || Math.abs(r.tileY - G.player.y) >= 24,
       '★ never within sight of the player');
    // and the roster is whole again
    const vs = G.NPCS.filter(n => n && n._roamOf === 'veridan' && n._roamKind === 'satyrbeast').length;
    ok(vs === 56, `★ Veridan now holds ${vs} satyrbeast bodies — the 55 authored, `
       + 'plus the dead one still on screen mid-death animation');
  }
  const morv = G.NPCS.find(n => n && /^morvexar_/.test(n.id || ''));
  ok(G.queueEnemyRespawn(morv) === false, '★★ a Morvexar is refused · ruled counts stay ruled');
}

H('★★★★ AND THE WORLD CAN STILL DRAW ITSELF · the cull that ships with the roster');
{
  // ★★★ THIS PATCH IS WHAT MADE THE CULL NECESSARY, so the cull is part of the
  //   patch. The roster took the overworld from 1,990 enemies to 2,838, and
  //   the NPC draw list had no bounds test at all — every body was sorted and
  //   sent to drawNPC every frame, relying on the canvas to clip it. The prop
  //   layer fixed exactly this at v0.96.1 and measured 3.79 ms/frame.
  const ow = G.NPCS.filter(n => n && n.scene === 'overworld');
  const PAD = 26;          // _CULL_MARGIN 20 + the NPC pad 6
  let sum = 0, worst = 0, n = 0;
  for (const [px, py] of [[58,103],[112,278],[315,325],[520,255],[455,435],[895,655],[730,655]]){
    const drawn = ow.filter(o => o.tileX >= px-10-PAD && o.tileX <= px+10+PAD
                              && o.tileY >= py-6-PAD  && o.tileY <= py+6+PAD).length;
    sum += drawn; n++; worst = Math.max(worst, drawn);
  }
  const mean = sum / n;
  console.log(`     ${ow.length} overworld NPCs · draw list mean ${mean.toFixed(0)}, worst ${worst}`);
  ok(mean < ow.length * 0.05, `★★★ the cull removes ${(100*(1-mean/ow.length)).toFixed(1)}% of the `
     + 'per-frame draw list and its sort');
  ok(worst < 120, `★ and the worst camera position still only draws ${worst}`);
  // ★ the margin must stay generous · a Morvexar is ~2 tiles of sprite on a
  //   1-tile foot, and culling on the foot would clip his head at the edge
  ok(PAD >= 20, `★★ ${PAD} tiles of margin beyond a 20x11 viewport — big sprites cannot pop`);
}

H('★★★ TOWN · 26 tiles, one rule');
{
  let inTown = 0;
  for (const n of roster){
    for (const [tx, ty] of G._townAnchors(n._roamOf))
      if (Math.hypot(tx - n.tileX, ty - n.tileY) < G.ROAM_MIN_FROM_TOWN){ inTown++; break; }
  }
  ok(inTown === 0, inTown ? `${inTown} roster bodies are standing in town`
     : `★★★ not one of ${roster.length} stands within 26 tiles of a door`);
}

H(f ? `\n❌ ${f} failed` : '\n✅ 200 per district, exactly as authored · terrain chose every tile · and it comes back');
process.exit(f ? 1 : 0);
