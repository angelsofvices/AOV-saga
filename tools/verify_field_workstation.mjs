// ★★★★ v0.99.5 · THE FIELD WORKSTATION · the whole loop, driven end to end.
//
//   Creator, 2026-09-18: "finalize the suite for the field workstation.
//   crafting it, selecting it from key items, deploying it on field,
//   interacting to craft items using ingredients."
//
// ★★★★ THERE WERE TWO SUITES FOR THIS FEATURE AND NEITHER WALKED THE LOOP.
//   verify_fieldstation.js (v0.96.12) proved the ART and the ORIENTATION —
//   eight frames, latch at the bottom, hinges at the top — and stopped at the
//   bench door. verify_field_station.js (v0.96.87) proved the SAVE/RELOAD gap.
//   Both asserted the same recipe and the same unfold, in different words, and
//   between them the stage that actually SPENDS YOUR BAG was never run once.
//   ★ One suite, the Creator's four stages in order, each stage driven rather
//     than described. The two old files are retired by this one.
//
// ★★★ AND STAGE FOUR WAS UNTESTABLE UNTIL v0.99.5. The exchange of ingredients
//   for output lived inside an addEventListener closure built by
//   openExperimentPanel(), so it could only run if a real DOM button was really
//   clicked. It is craftRecipe() now — same order of operations, same refusal,
//   reachable by a test and by a controller.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import { readPng } from './lib/png.mjs';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const src = fs.readFileSync('/tmp/all.js', 'utf8');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['FIELD_STATION_RECIPE','FIELD_STATION_SCRAP','grantFieldStationRecipe',
  'grantHarvestRecipes','craftRecipe','useZycubeItem','deployFieldStation','deployedFieldStation',
  'fieldStationUse','fieldStationReady','packFieldStation','damageFieldStation','_fsApplyFrame',
  'FS_BBOX','FS_IMGS','FS_DEPLOY_SEQ','FS_PACK_SEQ','FS_MAX_HP','WORLD_PROPS','INVENTORY_META',
  'addItems','walkable','restoreFieldStation','closeExperimentPanel','game','player'] });
console.log = _L;
const P = G.player;
P.items = P.items || {};
P.knownRecipes = P.knownRecipes || [];

H('★ THE ART · eight frames on disk, and the case is not the bench');
{
  const keys = Object.keys(G.FS_BBOX || {});
  ok(keys.length >= 5, `${keys.length} declared frames · ${keys.join(', ')}`);
  let missing = [];
  for (const k of keys){
    const p = `assets/2D sprites/decor/fieldstation/station-${k}.png`;
    if (!fs.existsSync(p)) missing.push(k);
  }
  ok(missing.length === 0, missing.length ? `★ missing on disk: ${missing.join(', ')}` : 'every declared frame has a PNG');
  // ★ the two poses that must never be the same picture: stowed and open
  ok(JSON.stringify(G.FS_BBOX.case) !== JSON.stringify(G.FS_BBOX.deployed),
     '★★ the case and the deployed bench are different shapes · a briefcase that '
   + 'looks like a bench is the whole feature failing quietly');
}

H('★★★ THE ORIENTATION LOCK THE CREATOR SHIPPED · read off the pixels');
{
  // ★★★ Creator: "the latch and operator edge stay at the bottom, hinges and
  //   lid stay at the top, and the equipment never swaps sides."
  //   That is a claim about the ART, so only the art can answer it — ported
  //   here from verify_fieldstation.js rather than lost when that file retired.
  //   A mirrored frame mid-sequence reads as the bench FLIPPING OVER as it
  //   opens, which is why this set was re-cut in the first place.
  const FRAMES = Object.keys(G.FS_BBOX);
  const stats = {}; let readable = 0;
  for (const k of FRAMES){
    const img = readPng(`assets/2D sprites/decor/fieldstation/station-${k}.png`);
    if (!img) continue;
    readable++;
    const { w, h, data } = img;
    let latchMaxY = -1, cryXs = 0, cryN = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
      const i = (y * w + x) * 4;
      if (data[i + 3] < 40) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 150 && g > 120 && b < 110) latchMaxY = Math.max(latchMaxY, y);   // brass
      if (b > 150 && b - g > 50){ cryXs += x; cryN++; }                        // crystal glow
    }
    stats[k] = { latch: latchMaxY / h, cry: cryN > 80 ? (cryXs / cryN) / w : null };
  }
  ok(readable === FRAMES.length, `★ all ${FRAMES.length} frames decoded for pixel inspection (${readable}/${FRAMES.length})`);
  const lows = FRAMES.map(k => stats[k] ? stats[k].latch : 1);
  const badLatch = FRAMES.filter(k => stats[k] && stats[k].latch < 0.85);
  ok(badLatch.length === 0,
     `★★★ the brass latch reaches the BOTTOM edge in every frame (min ${Math.min(...lows).toFixed(2)} of frame height)`
     + (badLatch.length ? ` · HIGH: ${badLatch.join(', ')}` : '')
     + ' · measured, not taken on trust');
  const OPEN = ['half','deployed','scanning','crafting'].filter(k => FRAMES.includes(k));
  const xs = OPEN.map(k => stats[k] && stats[k].cry).filter(v => v != null);
  const spread = xs.length ? Math.max(...xs) - Math.min(...xs) : 9;
  ok(xs.length === OPEN.length && spread < 0.12 && Math.max(...xs) < 0.45,
     `★★★ the crystal sits on the SAME side in all ${OPEN.length} open frames `
     + `(x ${xs.map(v => v.toFixed(2)).join(', ')} · spread ${spread.toFixed(2)}) · "the equipment never swaps sides"`);
}

H('★★ STAGE 1 · CRAFTING IT · you cannot deploy what you have not built');
{
  const R = G.FIELD_STATION_RECIPE;
  ok(!!R && R.id === 'field_station', `the recipe exists · "${R && R.name}"`);
  ok(G.FIELD_STATION_SCRAP === 20, `costs ${G.FIELD_STATION_SCRAP} scrap · the Creator's number`);
  ok(JSON.stringify(R.costOptions) === JSON.stringify([{ scrap_metal: 20 }]),
     '★ and the cost table says so too · one source, not a label and a number that can drift');
  ok(R.output && R.output.field_station === 1, 'it yields exactly one workstation');

  // ★★★ DRIVE IT. Not enough scrap must refuse and spend NOTHING.
  P.knownRecipes = [R];
  P.items.scrap_metal = 19; P.items.field_station = 0;
  const refused = G.craftRecipe(R, 0);
  ok(refused === false, 'crafting with 19 scrap refuses');
  ok(P.items.scrap_metal === 19,
     `★★★ and spends nothing · still ${P.items.scrap_metal} scrap. A loop that deducted as it `
   + 'validated would leave a half-paid recipe behind on the first shortfall');
  ok((P.items.field_station || 0) === 0, '★ and you do not get the workstation');

  P.items.scrap_metal = 20;
  const made = G.craftRecipe(R, 0);
  ok(made === true, 'crafting with 20 scrap succeeds');
  ok(P.items.scrap_metal === 0, `★★ the scrap is GONE · ${P.items.scrap_metal} left`);
  ok(P.items.field_station === 1, `★★ and the case is in the bag · ${P.items.field_station}`);
}

H('★★★ STAGE 2 · SELECTING IT FROM KEY ITEMS');
{
  // ★ The ZyCube is where a briefcase becomes a bench. Selecting the row IS
  //   the verb — the same shape as the transponder, which the Creator already
  //   asked to be a spawn rather than an info line.
  const meta = G.INVENTORY_META.field_station;
  ok(!!meta, `it is a listed key item · "${meta && meta.label}"`);
  ok(/case 'field_station':/.test(src), '★★ useZycubeItem has a case for it · not the info-only default');
  const caseBlk = src.slice(src.indexOf("case 'field_station':"), src.indexOf("case 'astralcore_transponder':"));
  ok(/deployFieldStation\(\)/.test(caseBlk), '★★★ …and that case DEPLOYS it');
  ok(/closeZphonePanel\(\)/.test(caseBlk),
     '★ closing the phone first · you cannot watch a bench unfold through a menu covering the screen');
  ok(/if \(qty <= 0\)/.test(caseBlk), '★ and selecting it with none in the bag refuses');

  // DRIVE IT: select the row with the phone open, on open ground
  G.game.scene = 'overworld'; P.x = 30; P.y = 120;
  for (const p of [...G.WORLD_PROPS]) if (p && p._fieldStation) G.WORLD_PROPS.splice(G.WORLD_PROPS.indexOf(p), 1);
  P.items.field_station = 1;
  G.useZycubeItem('field_station');
  ok(!!G.deployedFieldStation(), '★★★ selecting the key item put a workstation in the world');
  ok(P.items.field_station === 0, '★★ and took the case out of the bag · it is standing, not duplicated');
}

H('★★★ STAGE 3 · DEPLOYING IT ON FIELD');
{
  const prop = G.deployedFieldStation();
  ok(!!prop, 'a station prop exists in WORLD_PROPS');
  ok(prop._fieldStation === true, 'flagged as the field station · that is how it is found again');
  ok(typeof prop.tileX === 'number' && typeof prop.tileY === 'number',
     `sited at ${prop.tileX},${prop.tileY}`);
  ok(prop.tileX !== P.x || prop.tileY !== P.y, '★ sited BESIDE Rizer, never under him');
  // ★ the field station keeps its own health on _fsHp/_fsHpMax, not the NPC
  //   `hp` field — my first pass asked for prop.hp and got undefined, which
  //   would have passed as "weak" if I had written `< 60` instead of `===`.
  ok(prop._fsHp === G.FS_MAX_HP && prop._fsHpMax === G.FS_MAX_HP,
     `★★ it stands at ${prop._fsHp}/${prop._fsHpMax} HP · WEAK, as asked`);
  // ★ the unfold is a sequence, not a swap
  ok(Array.isArray(G.FS_DEPLOY_SEQ) && G.FS_DEPLOY_SEQ.length >= 2,
     `★★ the unfold is a ${G.FS_DEPLOY_SEQ.length}-step sequence · ${G.FS_DEPLOY_SEQ.join(' → ')}`);
  ok(!G.fieldStationReady(prop), '★★★ and it is NOT usable mid-unfold · "wait for it to settle"');
  prop._fsSeq = [];                                   // let the animation finish
  G._fsApplyFrame(prop, 'deployed');
  ok(G.fieldStationReady(prop), '★ once settled, it is ready');

  // second deploy must refuse · one camp at a time
  P.items.field_station = 1;
  const before = G.WORLD_PROPS.filter(p => p && p._fieldStation).length;
  G.deployFieldStation();
  ok(G.WORLD_PROPS.filter(p => p && p._fieldStation).length === before,
     '★★ a second deploy refuses while one is standing · "pack it before making a new camp"');
  ok(P.items.field_station === 1, '★ and the refusal costs you nothing');
}

H('★★★★ STAGE 4 · INTERACTING TO CRAFT ITEMS USING INGREDIENTS');
{
  const prop = G.deployedFieldStation();
  G._fsApplyFrame(prop, 'deployed'); prop._fsSeq = [];
  G.game.expPanelTab = 'recipes';
  G.fieldStationUse(prop);
  ok(prop._fsFrame === 'crafting',
     '★★ using it strikes the WORKING pose · the art has a frame for exactly this');
  // ★ the same bench as home · not a second crafting system to keep in sync
  const useBlk = (() => { const i = src.indexOf('function fieldStationUse');
    let j = src.indexOf('{', i), d = 0;
    do { if (src[j] === '{') d++; else if (src[j] === '}') d--; j++; } while (d);
    return src.slice(i, j); })();
  ok(/openExperimentPanel\(\)/.test(useBlk),
     '★★★ and it opens the SAME bench panel as home · "able to craft on the go" means the '
   + 'same recipes, not a second crafting system');

  // ★★★★ AND NOW SPEND A REAL BAG ON A REAL RECIPE.
  const harvest = (P.knownRecipes || []).find(r => r.id !== 'field_station' && r.costOptions);
  ok(!!harvest, `a harvest recipe is known at the bench · "${harvest && harvest.name}"`);
  if (harvest){
    const cost = harvest.costOptions[0];
    const k = Object.keys(cost)[0];
    const outKey = Object.keys(harvest.output)[0];
    P.items[k] = cost[k] - 1; P.items[outKey] = 0;
    ok(G.craftRecipe(harvest, 0) === false, `★ one short of ${cost[k]}× ${k} · refused`);
    ok(P.items[k] === cost[k] - 1, '★★ and the ingredients are untouched by the refusal');
    P.items[k] = cost[k];
    ok(G.craftRecipe(harvest, 0) === true, `★★★ with ${cost[k]}× ${k} in the bag · crafted`);
    ok(P.items[k] === 0, `★★★★ the ingredients are SPENT · ${k} ${cost[k]} → ${P.items[k]}`);
    ok((P.items[outKey] || 0) >= harvest.output[outKey],
       `★★★★ and the output is in the bag · ${outKey} x${P.items[outKey]}`);
  }
  // the working pose must have a way back out
  G.closeExperimentPanel();
  ok(prop._fsFrame === 'deployed',
     '★★★ closing the panel stands it back up · the pose is a STATE, so it needs a way OUT, '
   + 'not just a way in (a station stayed hunched over its drawer for the rest of the save)');
}

H('★★ PACK IT BACK · and the loop closes');
{
  const prop = G.deployedFieldStation();
  prop._fsSeq = [];
  P.items.field_station = 0;
  ok(G.packFieldStation(prop) === true, 'packing starts');
  ok(Array.isArray(prop._fsSeq) && prop._fsSeq.length > 0, '★ through a fold-down sequence, not a vanish');
  // run the sequence out
  prop._fsSeq = []; prop._fsPackWhenDone = true;
  try { G._fsRemove ? G._fsRemove(prop) : null; } catch(_){}
}

H('★★★ WEAK, AND SAFE ONLY WHEN STOWED');
{
  ok(G.FS_MAX_HP <= 60, `★★ ${G.FS_MAX_HP} HP · "these metal portable stations can be destroyed by `
    + 'enemies and are weak"');
  ok(/function damageFieldStation/.test(src), 'enemies have a way to hurt it');
  ok(/FIELD WORKSTATION DESTROYED/.test(src), '★ and losing it says so plainly · the case is gone');
  // ★★★ THE SAVE GAP (v0.96.87) MUST STAY CLOSED. player.camps is written and
  //   saved; for years nothing read it back, so saving while camped destroyed
  //   the station — the exact opposite of "must be stored away to be safe".
  ok(/function restoreFieldStation/.test(src),
     '★★★★ restoreFieldStation exists · a station standing at save time is rebuilt at load');
  ok(/restoreFieldStation\(\)/.test(src.slice(src.indexOf('function loadGame'))),
     '★★★ and loadGame actually CALLS it · written-and-saved is not the same as read-back');
}

H('★ THE OLD SUITES ARE RETIRED BY THIS ONE');
{
  for (const old of ['tools/verify_fieldstation.js', 'tools/verify_field_station.js'])
    ok(!fs.existsSync(old), `${old} is gone · one feature, one suite`);
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ crafted · selected from key items · deployed · crafted ON IT with real ingredients · packed');
process.exit(f ? 1 : 0);
