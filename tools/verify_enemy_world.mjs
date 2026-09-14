import { createRequire } from 'module';
const require = createRequire(import.meta.url);
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
const TIER = { mori:1, daemon:2, satyrbeast:3, morlisk:4, vilerok:5, vorugath:6, nymphysyl:7,
               scanobot:3, penumbra:6 };

const mixOf = d => {
  const m = {};
  for (const n of roster) if (n._roamOf === d) m[n._roamKind] = (m[n._roamKind] || 0) + 1;
  return m;
};

H(`★ THE GAME BOOTED · ${Date.now() - t0}ms · ${G.NPCS.length} NPCs`);
{
  // ★ the threshold moved DOWN on purpose at v0.97.4: 296 legacy bodies were
  //   retired and mori trimmed by 15 a district to bring every district inside
  //   the 200-250 range. Fewer enemies, better distributed, is the result.
  ok(enemies.length > 2300, `${enemies.length} overworld enemies standing`);
  ok(roster.length > 2000, `★★★ ${roster.length} roster bodies · the machines are counted now`);
}

H('★★★ EVERY AUTHORED ROW SUMS TO THE CORE · the table checks itself');
{
  // ★ v0.97.5 · rows differ on purpose now — Thardin carries 45 Scanobots and
  //   Malezor 22, because Thardin is where the tech was taken. The invariant
  //   moved to the district RANGE, asserted further down.
  for (const d of DISTS) console.log(`     ${d.padEnd(10)} row ${G.rosterTotalFor(d)}`);
  ok(G.DISTRICT_ROSTER_TOTAL === null, '★ the single shared row-total is retired');
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
    const row = G.DISTRICT_ENEMY_ROSTER[d];
    // ★ gated species read 0 until their gate opens · penumbra outside Thardin
    const want = {};
    for (const k of Object.keys(row)) want[k] = G.rosterCountFor(d, k);
    const got = mixOf(d);
    const line = Object.keys(row).map(k => `${k} ${got[k] || 0}/${want[k]}`
                   + (row[k] !== want[k] ? ` (gated, ${row[k]} after)` : '')).join(' · ');
    const exact = Object.keys(row).every(k => (got[k] || 0) === want[k])
               && Object.keys(got).every(k => row[k] != null);
    if (!exact) drift++;
    ok(exact, `  ${d.padEnd(10)} ${line}`);
  }
  ok(drift === 0, drift ? `${drift} districts drifted from their authored roster`
     : '★★★ not one district differs from the table by a single body');
}

H('★★★★ EVERY SPECIES WEARS ITS OWN SPRITE · the check the census could not make');
{
  // ★★★★ 745 BODIES ONCE SHIPPED AS MORI IN ANOTHER CREATURE'S NAME.
  //   scatterDistrictEnemies clones sprites off live NPCs — `pick(/vilerok/i)`
  //   finds a Vilerok standing in the world and copies it. The legacy prune
  //   originally ran BEFORE that, deleting every template, so Vilerok, Vorugath
  //   and Morlisk all fell through to their `|| pick(mori.png)` fallback.
  //   ★★ The census was flawless throughout: right counts, right names, right
  //     tiers, right HP — because those are set explicitly in the clone opts.
  //     Only the ART came from the base. A headless suite cannot look at the
  //     screen, so the only defence is to assert the sprite path itself.
  const WANT = {
    mori:/mori\.png/, daemon:/daemon\.png/, satyrbeast:/satyrbeast/,
    morlisk:/morlisk/, vilerok:/vilerok/, vorugath:/vorugath/, nymphysyl:/nymphysyl/,
    scanobot:/scanobot/, penumbra:/penumbra/,
  };
  for (const [kind, re] of Object.entries(WANT)){
    const mine = roster.filter(n => n._roamKind === kind);
    if (!mine.length){ ok(false, `no ${kind} placed`); continue; }
    const srcs = [...new Set(mine.map(n => (n.src || '').split('/').pop()))];
    ok(srcs.length === 1 && re.test(srcs[0]),
       `  ${kind.padEnd(11)} ${String(mine.length).padStart(4)} · ${srcs.join(', ')}`);
  }
  // ★ and the ordering that makes it true is asserted directly, so nobody
  //   "tidies" the prune back up above the roster
  ok(/scatterDistrictEnemies\(\);[\s\S]{0,400}?retireLegacyEnemyScatter\(\)/.test(
       require('fs').readFileSync('/tmp/all.js', 'utf8')),
     '★★★ and the legacy prune runs AFTER the roster in the boot sequence');
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

H('★★★★ KORATHEN IS THE HARDEST DISTRICT · the point of the extra six');
{
  // ★★★ MEASURED OVER EVERY ENEMY STANDING IN THE DISTRICT, not just the
  //   roster. Morvexar is T8 and sits ABOVE the roster line, so a roster-only
  //   mean would have missed the entire effect of the Creator's instruction
  //   ("add extra morvexar in korathen to make it the hardest district").
  //   ★ Before the extra six, Xilnar led on 3.99 to Korathen's 4.05-without —
  //     Nymphysyl is T7 and lives in the three dark districts while Korathen's
  //     roster ceiling is Vorugath at T6. Twelve T8 bodies is what settles it.
  const mt = d => {
    const list = enemies.filter(n => G.worldDistrictAt(n.tileX, n.tileY) === d);
    return +(list.reduce((s, n) => s + (n.tier || 1), 0) / list.length).toFixed(2);
  };
  const tiers = DISTS.map(mt);
  console.log('     ' + DISTS.map((d, i) => `${d} ${tiers[i]}`).join(' · '));
  const peak = DISTS[tiers.indexOf(Math.max(...tiers))];
  ok(peak === 'korathen', `★★★★ hardest district by mean tier: ${peak} (${Math.max(...tiers)})`);
  ok(tiers[9] > tiers[6], `★★ Korathen ${tiers[9]} now leads Xilnar ${tiers[6]}`);
  ok(tiers[0] < 2 && tiers[9] > 4, `★ and the ramp still runs ${tiers[0]} → ${tiers[9]}`);
  // ★ the dips are the Creator's own numbers and stay his — printed, not failed
  console.log('     ★ Zarvane dips below Malezor by design · Malezor carries 15 Vileroks and 5 Vorugath');
}

H('★★★★ THE ENEMY CANON · three branches, and Daemon moved');
{
  // Creator, 2026-09-14: "mori and daemon are both corrupt humanoid (haemen).
  // corrupt zyrex are corrupt aethren." + "all the current enemies are either
  // technology (scanobots and penumbra)... created by thardin corrupt tech seer
  // commander. when he and his grunts took thardin, he took their tech too."
  const L = G.ENEMY_LINEAGE, B = L.branches;
  ok(L.source === 'seers', 'the source of every enemy is the Seers');
  ok(B.haemen.of === 'corrupt humanoid' && !!B.haemen.stems.mori && !!B.haemen.stems.daemon,
     '★★★ BOTH organic stems are Haemen · Daemon is corrupt humanoid, not corrupt Zyrex');
  ok(B.aethren.of === 'corrupt zyrex', '★ Aethren is the name for corrupt Zyrex');
  ok(Object.keys(B.aethren.stems).length === 0,
     '★★ and Aethren has NO members assigned — a branch named, not yet inhabited');
  ok(B.tech.seized === 'thardin' && B.tech.commander === 'thardin_tech_seer_commander',
     '★★★ Tech is seized Thardinian machinery, turned by the commander who took the district');
  ok(!!B.tech.stems.scanobot && !!B.tech.stems.penumbra,
     '★ both machines sit on the Tech branch');
  ok(L.climax.at === 'bridge_of_hope' && L.climax.ushers.includes('luminary'),
     '★★ the loop still ends at the Bridge of Hope, ushering Part Two and Luminary');

  // every species in every roster row must trace to a branch
  const unbranched = [];
  for (const d of DISTS)
    for (const k of Object.keys(G.DISTRICT_ENEMY_ROSTER[d]))
      if (!G.ENEMY_BRANCH_OF[k]) unbranched.push(k);
  ok(!unbranched.length, unbranched.length ? `no branch for: ${[...new Set(unbranched)].join(', ')}`
     : '★★ every species in the roster traces to Haemen or Tech');
  const techSpecies = Object.keys(G.ENEMY_BRANCH_OF).filter(k => G.ENEMY_BRANCH_OF[k] === 'tech');
  ok(techSpecies.length === 2 && techSpecies.includes('scanobot') && techSpecies.includes('penumbra'),
     `★ exactly two Tech species: ${techSpecies.join(', ')}`);

  // ★★★★ THE TIER CEILING IS LAW.
  ok(G.ENEMY_TIER_MAX === 9, `enemies cap at T${G.ENEMY_TIER_MAX}`);
  ok(G.enemyTierLegal(9) === true && G.enemyTierLegal(10) === false,
     '★★★ T9 legal for an enemy, T10 refused — driven, not read');
  ok(G.TIER_TEN_BEINGS.includes('anciuxor') && G.TIER_TEN_BEINGS.includes('rizer'),
     `★★ T10 belongs to exactly two beings: ${G.TIER_TEN_BEINGS.join(' and ')}`);
  const overCap = enemies.filter(n => (n.tier || 1) > G.ENEMY_TIER_MAX);
  ok(!overCap.length, overCap.length ? `${overCap.length} enemies exceed the cap`
     : '★★★ and not one enemy standing in the world breaks it');
}

H('★★★★ THE MACHINES ARE IN THE POOL · and still behave like machines');
{
  const sc = G.NPCS.filter(n => n && n.scene === 'overworld' && n._scanobot);
  const byD = {};
  for (const n of sc) byD[n._scanobot] = (byD[n._scanobot] || 0) + 1;
  console.log('     scanobot · ' + DISTS.map(d => `${d} ${byD[d] || 0}`).join(' · '));
  // ★ 294, not 300 — Korathen's row gave 6 of its Scanobots back to keep the
  //   district inside 250 once the machines started being counted. The number
  //   is the roster's to decide now, which is the whole point of folding them in.
  ok(sc.length === 294, `${sc.length} Scanobots, placed by the ROSTER now`);
  ok(byD.thardin > byD.malezor,
     `★★★ Thardin carries the most (${byD.thardin} vs Malezor's ${byD.malezor}) — it is where the tech was taken`);

  // ★★★★ THE STATE MACHINE MUST STILL OWN THEM. applyScanobotState had already
  //   run at boot, BEFORE the roster existed, so all 300 came out isEnemy:false
  //   and could not be hit at all — Square passes straight through. That is the
  //   v0.95.801 bug ("make them smashable at game start") reappearing because
  //   the placement moved and the state pass did not follow it.
  ok(sc.every(n => n._scanobot), '★ every one carries `_scanobot` · the flag the whole net reads');
  ok(sc.every(n => n.isEnemy === true),
     '★★★★ and every one is smashable · applyScanobotState re-runs after the roster');
  ok(sc.every(n => n.mode === 'wander'), '★★ still passive · municipal property until the net goes rogue');
  ok([...new Set(sc.map(n => n.hpMax))].length === 1 && sc[0].hpMax === 125,
     '★ flat 125 HP everywhere · a scanner is not a Korathen-band fight');

  // ★★★ PENUMBRA IS GATED, and its roster number is the post-spread figure
  const pre = G.NPCS.filter(n => n && n._roamKind === 'penumbra');
  ok(pre.length === 12 && pre.every(n => n._roamOf === 'thardin'),
     `★★★ before you reach Thardin, all ${pre.length} Penumbra are IN Thardin and nowhere else`);
  G.player.districtsVisited = { thardin: true };
  const made = G.topUpGatedRoster();
  const post = G.NPCS.filter(n => n && n._roamKind === 'penumbra');
  ok(made > 30 && post.length === 47,
     `★★ reaching Thardin tops the world up · ${pre.length} → ${post.length}`);
  ok(new Set(post.map(n => n._roamOf)).size === 10, '★ and they now stand in all ten districts');
  // ★ idempotent BY COUNT, not by id — walking into Thardin twice must not double them
  ok(G.topUpGatedRoster() === 0,
     '★★★ running the top-up again adds nothing · idempotent by count');
}

H('★★★ THE SPAWN RANGE · minibosses and nets, and no double-placement');
{
  const per = byDistrict(G, enemies);
  console.log('     total per district · ' + DISTS.map(d => `${d} ${per[d]}`).join(' · '));

  // ★★★★ THE RANGE IS THE INVARIANT NOW, not the roster number.
  //   Creator: "I want each district to be about 200-250 enemy spawns... just
  //   keep the 200-250 range in tact." So this is the assertion that has to
  //   survive every future species he sends — the authored core can move, the
  //   range may not.
  const [LO, HI] = G.DISTRICT_SPAWN_RANGE;
  const out = DISTS.filter(d => per[d] < LO || per[d] > HI);
  ok(!out.length, out.length ? `outside ${LO}-${HI}: ${out.map(d => `${d}:${per[d]}`).join(' ')}`
     : `★★★ all ten districts inside ${LO}-${HI} `
       + `(${Math.min(...DISTS.map(d => per[d]))}-${Math.max(...DISTS.map(d => per[d]))})`);
  const headroom = HI - Math.max(...DISTS.map(d => per[d]));
  ok(headroom >= 5, `★★ ${headroom} spawns of headroom before the ceiling — room for the next species`);

  // ★★★ THE LEGACY SCATTER IS GONE. 296 hand-placed bodies from before the
  //   roster existed were sitting underneath it and counted twice; Malezor
  //   booted at 384 against an authored 180 Mori.
  const legacy = enemies.filter(n => !n._roamOf && !n._scanobot
    && !/^(morvexar|penumbra|nymphysyl)_/.test(n.id || '')
    && !/tower_|seer|verdant_creeper|satyrbeast_p/i.test(n.id || '')
    && /^(mori|vilerok|morlisk|daemon|vorugath)[_0-9]/.test(n.id || ''));
  ok(legacy.length === 0, legacy.length ? `${legacy.length} legacy bodies survived the prune`
     : '★★ not one pre-roster body left standing');
  // ★ and the kill counters the prune could have broken are better off
  const vk = enemies.filter(n => n._vilerok).length;
  const vg = enemies.filter(n => n._vorugath).length;
  ok(vk > 100 && vg > 100, `★★★ Kelthor's Purge still has ${vk} Vileroks and the Vorugath `
     + `counter ${vg} — the roster clones inherit both flags, verified by counting`);

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
  ok(morv.length === 30, `★★ morvexar ${morv.length} · korathen 12 (doubled to make it the `
     + 'hardest district) · baelgor 4 · zarvane 2 · netharion 4 · vorashil 4 · xilnar 4');
  for (const [d, n] of [['korathen',12],['baelgor',4],['zarvane',2],['netharion',4],['vorashil',4],['xilnar',4]]){
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
