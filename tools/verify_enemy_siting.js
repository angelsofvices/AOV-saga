// ★★★ v0.97.1 · WHERE THE THREE NEW ENEMIES ACTUALLY STAND.
//
//   Creator, 2026-09-14: "make sure there are enemies all over the map. no area
//   should be super dense and others scarce. also, try to keep enemies out of
//   the main town districts. more so in the wilds, in the outskirts, in the
//   coasts, near valuable chests, etc."
//
// ★★★ THIS SUITE RUNS THE SITER ON THE REAL MAP. Every earlier placement check
//   in this repo asserted that a table said the right thing. A table cannot be
//   in a lake. So this one loads the actual terrain chain into a vm
//   (tools/lib/world_harness.js), calls siteEnemyTile exactly as the game does,
//   and then asks the tiles it gets back whether they are any good.
//
// ★★ AND THE HARDEST ASSERTION IS THE LAST ONE. Rules 3 and 4 — prefer coasts,
//   prefer guarded treasure — are SOFT: they score rather than reject, so no
//   single tile can ever violate them and no per-tile test can prove they work.
//   A scorer that silently returned 0 for everything would pass every other
//   check in this file. The only honest test is statistical: site the enemies,
//   then site the same number of tiles with the scoring switched off, and show
//   the real ones score higher. ★ That is the difference between "the code ran"
//   and "the code did something."
const fs = require('fs'), vm = require('vm');
const { buildWorld } = require('./lib/world_harness.js');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

const ctx = buildWorld(src);
const R = e => vm.runInContext(e, ctx);
const call = (fn, args) => vm.runInContext(`${fn}(${args.map(a => JSON.stringify(a)).join(',')})`, ctx);

H('★ THE HARNESS HAS A REAL WORLD IN IT');
{
  ok(R('__decls.length') > 40, `${R('__decls.length')} declarations resolved from the build`);
  ok(R('__props.length') > 400, `${R('__props.length')} real WORLD_PROPS evaluated, not regex-scraped`);
  ok(R("worldDistrictAt(58,103)") === 'malezor' && R("worldDistrictAt(895,655)") === 'korathen',
     'the map answers for both ends of the world');
  const civ = R("siteCivicTiles('malezor').length");
  ok(civ >= 5, `★ Malezor's ${civ} civic doors found — the empty list was the bug that started this`);
}

// ── run the siter exactly the way buildNewEnemyNet does ────────────────────
const DISTS = R('JSON.stringify(ZYRAXIS_DISTRICTS.map(function(d){return d.id;}))');
const districts = JSON.parse(DISTS);
function siteAll(spread){
  vm.runInContext(`player.districtsVisited = ${spread ? '{thardin:true}' : '{}'};`, ctx);
  vm.runInContext('_siteCivic2 = {};', ctx);
  const out = [];
  // ★★★ SEED FROM THE ENEMIES ALREADY STANDING, exactly as buildNewEnemyNet
  //   does. My first version of this simulation started from an empty map,
  //   which made the siting look freer than it is and — worse — would have
  //   let a new body spawn on top of a Vilerok while the suite called it
  //   evenly spread. "No area super dense" is a claim about the WHOLE map.
  const placed = JSON.parse(R('JSON.stringify(__npcs.filter(function(n){'
    + 'return n && n.isEnemy && n.scene==="overworld" && typeof n.tileX==="number";'
    + '}).map(function(n){ return [n.tileX, n.tileY]; }))'));
  for (const id of JSON.parse(R('JSON.stringify(NEW_ENEMY_IDS)'))){
    for (const d of districts){
      const want = call('newEnemyCountFor', [id, d]);
      if (!want) continue;
      vm.runInContext(`__rand = _makeWorldRng(0x5E7 + ZYRAXIS_DISTRICT_BY_ID[${JSON.stringify(d)}].cx * 31`
        + ` + NEW_ENEMY_IDS.indexOf(${JSON.stringify(id)}) * 7919);`, ctx);
      for (let i = 0; i < want; i++){
        ctx.__taken = placed;
        const spot = vm.runInContext(`siteEnemyTile(${JSON.stringify(d)}, __rand, __taken)`, ctx);
        if (!spot) { out.push({ id, d, spot: null }); continue; }
        placed.push([spot[0], spot[1]]);
        out.push({ id, d, spot: [spot[0], spot[1]] });
      }
    }
  }
  return out;
}

// every enemy that was on the overworld BEFORE this patch — the baseline the
// density question has to be asked against
const PRIOR = JSON.parse(R('JSON.stringify(__npcs.filter(function(n){'
  + 'return n && n.isEnemy && n.scene==="overworld" && typeof n.tileX==="number";'
  + '}).map(function(n){ return [n.tileX, n.tileY]; }))'));
const before = siteAll(false);
const after  = siteAll(true);

H('★★★ EVERY BODY GOT A TILE · a siter that quietly places nobody is worse than one that throws');
{
  const failed = after.filter(e => !e.spot);
  ok(failed.length === 0,
     failed.length ? `${failed.length} found no legal tile: ${failed.map(e => e.id + '/' + e.d).join(', ')}`
                   : `all ${after.length} placed`);
  ok(after.length >= 60, `★ ${after.length} new enemies in the world after the Thardin spread`);
}

H('★★★ HARD RULE 1 · REAL GROUND');
{
  let bad = [];
  for (const e of after){
    if (!e.spot) continue;
    if (!call('_scanobotWalkable', e.spot)) bad.push(`${e.id}@${e.spot}`);
  }
  ok(!bad.length, bad.length ? `${bad.length} standing in water/props/off-map: ${bad.slice(0,4)}` : 'every tile is walkable land, in bounds, off the border, out of the river');
}

H('★★★ HARD RULE 2 · IN ITS OWN DISTRICT');
{
  const bad = after.filter(e => e.spot && call('worldDistrictAt', e.spot) !== e.d);
  ok(!bad.length, bad.length ? `${bad.length} drifted out of district` : 'every body is in the district it was assigned');
}

H('★★★ HARD RULE 3 · NOT IN TOWN · the settlement law, read backwards');
{
  const bad = [];
  for (const e of after){
    if (!e.spot) continue;
    if (vm.runInContext(`siteIsTownGround(${JSON.stringify(e.d)},${e.spot[0]},${e.spot[1]})`, ctx))
      bad.push(`${e.id}@${e.spot}`);
  }
  ok(!bad.length, bad.length ? `${bad.length} standing on ground a HOUSE would be allowed on: ${bad.slice(0,4)}`
                             : '★★ not one enemy stands where SETTLEMENT_DOCTRINE would permit a home');
  // ★ and the inverse must be true too, or the test above is vacuous: the town
  //   test has to actually say yes somewhere, or "not in town" means nothing.
  let townYes = 0;
  for (const d of districts){
    const D = JSON.parse(R(`JSON.stringify(ZYRAXIS_DISTRICT_BY_ID[${JSON.stringify(d)}])`));
    for (let a = 0; a < 360; a += 7)
      for (const t of [0.15, 0.25, 0.35, 0.45]){
        const x = Math.round(D.cx + Math.cos(a * Math.PI / 180) * D.rx * t);
        const y = Math.round(D.cy + Math.sin(a * Math.PI / 180) * D.ry * t);
        if (vm.runInContext(`siteIsTownGround(${JSON.stringify(d)},${x},${y})`, ctx)) townYes++;
      }
  }
  ok(townYes > 200, `★★★ and siteIsTownGround says YES for ${townYes} tiles — the rule has teeth, `
     + 'so the clean result above is a result and not a function that always returns false');
}

H('★★★ HARD RULE 4 · OFF THE PLAZA');
{
  const clear = R('ENEMY_SITE_CIVIC_CLEAR');
  const bad = [];
  for (const e of after){
    if (!e.spot) continue;
    const civ = JSON.parse(vm.runInContext(`JSON.stringify(siteCivicTiles(${JSON.stringify(e.d)}))`, ctx));
    for (const [cx, cy] of civ)
      if (Math.hypot(e.spot[0] - cx, e.spot[1] - cy) < clear){ bad.push(`${e.id}@${e.spot}`); break; }
  }
  ok(!bad.length, bad.length ? `${bad.length} within ${clear} tiles of a civic door` :
     `every body is ≥${clear} tiles from every shop, school, hall and hospital`);
}

H('★★★ HARD RULE 5 · EVEN · "no area should be super dense and others scarce"');
{
  const S = R('ENEMY_SITE_MIN_SPACING');
  let worst = 1e9, pair = null;
  const pts = after.filter(e => e.spot).map(e => e.spot);
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++){
      const d = Math.max(Math.abs(pts[i][0] - pts[j][0]), Math.abs(pts[i][1] - pts[j][1]));
      if (d < worst){ worst = d; pair = [pts[i], pts[j]]; }
    }
  ok(worst >= S, `closest pair on the whole map is ${worst} tiles apart (floor ${S}) · ${JSON.stringify(pair)}`);

  // ★★ SPACING IS NOT COVERAGE. Two bodies can respect a 9-tile floor and still
  //   sit in the same corner of a 110x100 ellipse. So density is measured per
  //   district against its own AREA, and the spread of those densities is what
  //   "no area dense, none scarce" actually means.
  //
  // ★★★ AND IT IS MEASURED OVER EVERY ENEMY ON THE MAP, not just these three.
  //   My first version counted only the new species and reported Malezor 9x
  //   scarcer than Xilnar — which is true of the new layer and false of the
  //   world, because Malezor is already full of Vileroks and Moris. Judging a
  //   patch by the patch instead of by the result is how you "fix" a balance
  //   problem that was never there and create one that is.
  const dens = [];
  for (const d of districts){
    const D = JSON.parse(R(`JSON.stringify(ZYRAXIS_DISTRICT_BY_ID[${JSON.stringify(d)}])`));
    const inD = p => vm.runInContext(`worldDistrictAt(${p[0]},${p[1]})`, ctx) === d;
    const prior = PRIOR.filter(inD).length;
    const fresh = after.filter(e => e.d === d && e.spot).length;
    const area  = Math.PI * D.rx * D.ry;
    dens.push({ d, prior, fresh, total: prior + fresh, per10k: +((prior + fresh) / area * 10000).toFixed(2) });
  }
  console.log('     ' + dens.map(x => `${x.d} ${x.prior}+${x.fresh}`).join(' · '));

  // ★★★★ THE MEASUREMENT FOUND SOMETHING BIGGER THAN THIS PATCH.
  //
  //   Before today: Malezor 76 overworld enemies, Zarvane 53, Andrannor 40 —
  //   and Xilnar, Baelgor, Thardin and Korathen with ZERO. Veridan, Netharion
  //   and Vorashil had ONE each. 169 of 172 bodies stood in the first three
  //   districts.
  //
  // ★★★ So "no area should be super dense and others scarce" was not a note
  //   about the three new species. It was a description of the shipped world,
  //   and the Creator was right about it without having the number. The
  //   endgame district had no overworld enemies at all.
  //
  // ★★ WHICH IS WHY THE MAP-WIDE RATIO IS RECORDED HERE AS A BASELINE RATHER
  //   THAN ASSERTED AS A PASS. This patch adds 64 bodies and cannot fix a
  //   76-to-0 distribution; the redistribution pass the Creator has already
  //   flagged is what owns that. Relaxing the threshold until it went green
  //   would have hidden the single most useful thing this suite found.
  //   ★ The ratchet: it must not get WORSE. That is a real test.
  const vals = dens.map(x => x.per10k);
  const ratio = Math.max(...vals) / Math.min(...vals);
  const BASELINE = 17.6;        // measured 2026-09-14 at v0.97.1
  console.log(`\n     ★★★★ MAP-WIDE IMBALANCE · ${ratio.toFixed(1)}x between densest and sparsest district`);
  console.log(`     ★ pre-existing overworld enemies: ${PRIOR.length} total, `
            + `${dens.slice(0,3).reduce((s,x)=>s+x.prior,0)} of them in the first three districts`);
  console.log(`     ★ districts that had NONE before this patch: `
            + dens.filter(x => !x.prior).map(x => x.d).join(', '));
  console.log('     → owned by the enemy REDISTRIBUTION pass, not by this one\n');
  ok(ratio <= BASELINE + 0.5,
     `★★ the imbalance did not get worse: ${ratio.toFixed(1)}x vs the ${BASELINE}x baseline`);

  // ── what THIS patch is actually responsible for ────────────────────────
  ok(dens.every(x => x.fresh > 0), '★ every one of the ten districts gained new enemies');
  ok(dens.filter(x => !x.prior).every(x => x.fresh >= 7),
     '★★★ and the four districts that had NO overworld enemies at all now hold at least seven each');
  // ★ the new layer is deliberately NOT uniform — "each district to get harder"
  //   means the gradient is the feature. What must hold is that it rises.
  const fresh = dens.map(x => x.fresh);
  const west = fresh.slice(0, 4).reduce((a, b) => a + b, 0);
  const east = fresh.slice(6).reduce((a, b) => a + b, 0);
  ok(east > west * 2, `★★ the new layer climbs eastward: ${west} bodies across the first four `
     + `districts, ${east} across the last four — the range the Creator asked for`);
  ok(Math.max(...fresh) - Math.min(...fresh) <= 9,
     `★ and it is a ramp, not a cliff — ${Math.min(...fresh)} to ${Math.max(...fresh)} per district`);
}

H('★★★ THE SOFT RULES ACTUALLY MOVED THE TILES · coasts and treasure');
{
  // ★★★ THE ONLY TEST THAT CAN CATCH A DEAD SCORER. Site the same count with
  //   the preferences OFF (first legal candidate wins) and compare. If the
  //   scoring were a no-op both numbers would match.
  const real = after.filter(e => e.spot);
  const score = ([x, y]) => call('siteCoastScore', [x, y]) + call('siteTreasureScore', [x, y]);
  const mReal = real.reduce((s, e) => s + score(e.spot), 0) / real.length;

  // unscored control: the same districts, same counts, first legal tile taken
  vm.runInContext(`__ctrl = []; __ctrlRand = _makeWorldRng(0xC0FFEE);`, ctx);
  const ctrl = [];
  for (const e of real){
    const D = JSON.parse(R(`JSON.stringify(ZYRAXIS_DISTRICT_BY_ID[${JSON.stringify(e.d)}])`));
    for (let t = 0; t < 4000; t++){
      const a = vm.runInContext('__ctrlRand()', ctx) * Math.PI * 2;
      const r = Math.sqrt(vm.runInContext('__ctrlRand()', ctx)) * 0.97;
      const x = Math.round(D.cx + Math.cos(a) * D.rx * r);
      const y = Math.round(D.cy + Math.sin(a) * D.ry * r);
      if (!call('_scanobotWalkable', [x, y])) continue;
      if (call('worldDistrictAt', [x, y]) !== e.d) continue;
      if (vm.runInContext(`siteIsTownGround(${JSON.stringify(e.d)},${x},${y})`, ctx)) continue;
      ctrl.push([x, y]); break;
    }
  }
  const mCtrl = ctrl.reduce((s, p) => s + score(p), 0) / (ctrl.length || 1);
  ok(ctrl.length > real.length * 0.9, `control group sited ${ctrl.length}/${real.length} tiles`);
  ok(mReal > mCtrl * 1.3,
     `★★★ sited mean score ${mReal.toFixed(2)} vs unscored control ${mCtrl.toFixed(2)} — `
     + `the coast/treasure preference is doing real work, not returning zero`);

  const coastal = real.filter(e => call('siteCoastScore', e.spot) > 0).length;
  const guarding = real.filter(e => call('siteTreasureScore', e.spot) > 0).length;
  ok(coastal > 0, `★ ${coastal}/${real.length} stand within three tiles of open water`);
  ok(guarding > 0, `★★ ${guarding}/${real.length} stand 4–14 tiles from a gold or cosmic chest — `
     + 'guarding it, not sitting on the lid');
}

H('★★★ PENUMBRA · THE WORLD CHANGES BECAUSE YOU WENT SOMEWHERE');
{
  const pBefore = before.filter(e => e.id === 'penumbra');
  const pAfter  = after.filter(e => e.id === 'penumbra');
  const dBefore = new Set(pBefore.map(e => e.d));
  const dAfter  = new Set(pAfter.map(e => e.d));
  ok(dBefore.size === 1 && dBefore.has('thardin'),
     `before Thardin they exist in ${[...dBefore].join(', ')} and nowhere else`);
  ok(dAfter.size === 10, `★★★ after reaching Thardin they are in all ${dAfter.size} districts`);
  ok(pAfter.length > pBefore.length * 2,
     `★ ${pBefore.length} → ${pAfter.length} bodies · the escalation of the Scanobot net`);
}

H('★★★ MORVEXAR · THE RULED NUMBERS SURVIVED THE BAND');
{
  // ★ 6/4/2 was ruled by NUMBER, so it must not have been swept into the
  //   depth-scaled band with the others.
  for (const [d, n] of [['korathen', 6], ['baelgor', 4], ['zarvane', 2]]){
    const got = after.filter(e => e.id === 'morvexar' && e.d === d && e.spot).length;
    ok(got === n, `  morvexar ${d}: ${got}`);
  }
  ok(after.filter(e => e.id === 'morvexar').length === 12, '★ twelve, exactly, and nowhere else');
  ok(!after.some(e => e.id === 'morvexar' && e.d === 'malezor'), '  none in the tutorial district');
}

H('★★★ NYMPHYSYL · A PATROL, NOT A RUMOUR');
{
  const by = {};
  for (const e of after.filter(x => x.id === 'nymphysyl')) by[e.d] = (by[e.d] || 0) + 1;
  ok(Object.keys(by).length === 3 && ['netharion','vorashil','xilnar'].every(d => by[d]),
     `the three dark districts only: ${JSON.stringify(by)}`);
  ok(Object.values(by).every(v => v >= 4),
     '★★ at least four in each — one body in a 110x100 ellipse is a rumour, not a patrol');
  ok(by.xilnar > by.netharion, `★ and the deeper dark holds more of them (${by.netharion} → ${by.xilnar})`);
}

H('★★ AND THE NET IS WIRED AT ALL THREE MOMENTS IT HAS TO BE');
{
  ok(/const ne = buildNewEnemyNet\(\);/.test(src), 'boot · after the drones, so spacing sees them');
  ok(/try \{ buildNewEnemyNet\(\); \} catch\(_\)\{\}/.test(src), 'after a save is loaded');
  ok(/if \(_d === NEW_ENEMY_PLACEMENT\.penumbra\.spreadsAfterReaching\)\{/.test(src),
     '★★★ and on the tile you first enter Thardin — otherwise the spread is true in data and invisible in play');
  // ★ the immunity flag must be written onto the BODY, not left on the art table
  ok(/_astralOnly: !!A\.astralOnly/.test(src),
     '★ _astralOnly is copied onto each spawned body · enemyResistsHit reads the body, never the art');
}

H(f ? `❌ ${f} failed` : '✅ enemies all over the map · out of town · on the coasts and guarding the chests');
process.exit(f ? 1 : 0);
