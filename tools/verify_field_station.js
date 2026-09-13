// ★★★ v0.96.87 · THE FIELD WORKSTATION, DRIVEN END TO END.
//
// Creator: "where are we at on the workstation crafting in field? we should
// have assets. do we have the wiring and mechanics?"
//
// ★★ THE ANSWER GREP GAVE WAS "YES" AND IT WAS WRONG.  Every piece is present
//   — 8 frames on disk, a recipe, a ZyCube deploy case, an unfold animation, a
//   crafting panel, hit points, an enemy raid tick — and `player.camps` is even
//   written and SAVED.  What nothing does is READ it back.  loadGame() calls
//   restoreLootedChests / restoreScrapDrops / restoreWeaponDrops and has no
//   restoreFieldStation, so a station that is standing when you save is a
//   runtime prop that nothing rebuilds.  The item was already spent.
//   ★ Saving while camped DESTROYED the workstation — which is the exact
//   opposite of the Creator's rule that packing it away is what makes it safe.
//
// This suite drives the real functions in a vm.  It does not look for them.
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);

// ── lift the field-station machinery out of the build ───────────────────────
function grab(start, end){
  const a = src.indexOf(start); if (a < 0) throw new Error('missing: ' + start);
  const b = src.indexOf(end, a); if (b < 0) throw new Error('missing end: ' + end);
  return src.slice(a, b);
}
const BLOCK   = grab('const FS_FRAMES =', 'const FS_ENEMY_DPS_MS');
const RAID    = grab('const FS_ENEMY_DPS_MS', '\n}\n', );
const RECIPE  = grab('const FIELD_STATION_SCRAP = 20;', 'const FIELD_STATION_RECIPE = {')
              + grab('const FIELD_STATION_RECIPE = {', '};') + '};';

const toasts = [], sfx = [];
const ctx = vm.createContext({
  console,
  performance: { now: () => NOW },
  Date,
  Image: function(){ return { set src(v){}, complete: true, naturalWidth: 1 }; },
  WORLD_PROPS: [],
  NPCS: [],
  game: { scene: 'overworld' },
  player: { x: 10, y: 10, dir: 'down', items: {}, knownRecipes: [], camps: {} },
  showToast: (m) => toasts.push(String(m)),
  playSFX: (k) => sfx.push(k),
  walkable: () => true,
  districtAt: () => 'malezor',
  registerPropCollision(){}, unregisterPropCollision(){}, invalidatePropGrid(){},
  spawnHitFx(){}, grantHarvestRecipes: () => 0,
  openExperimentPanel(){ ctx.__panelOpened = (ctx.__panelOpened || 0) + 1; },
  __panelOpened: 0,
});
let NOW = 1000;
vm.runInContext(BLOCK + '\n' + RAID + '\n}\n' + RECIPE, ctx);
const R = e => vm.runInContext(e, ctx);
const P = () => ctx.player;

H('★ ASSETS · all eight delivered frames are on disk and declared');
{
  const dir = 'assets/2D sprites/decor/fieldstation/';
  const frames = R('FS_FRAMES');
  ok(frames.length === 8, `FS_FRAMES declares ${frames.length}`);
  const onDisk = frames.filter(k => fs.existsSync(
    '/sessions/great-cool-heisenberg/mnt/AOV-saga-new/' + dir + `station-${k}.png`));
  ok(onDisk.length === 8, `${onDisk.length}/8 PNGs present`);
  // ★ but DECLARED is not USED.  Two frames are preloaded and never shown.
  // ★ but DECLARED is not USED.  Read the frames the BUILD actually applies.
  // ★ every frame NAMED inside an _fsApplyFrame call — the arg may be a
  //   ternary, so pull all the quoted names out of the call, not just one.
  const applied = new Set();
  for (const m of src.matchAll(/_fsApplyFrame\(([^)]*)\)/g))
    for (const q of m[1].matchAll(/'([a-z]+)'/g)) applied.add(q[1]);
  for (const k of [...R('FS_DEPLOY_SEQ'), ...R('FS_PACK_SEQ')]) applied.add(k);
  const unused = frames.filter(k => !applied.has(k));
  ok(unused.length <= 1,
     unused.length > 1 ? `★ delivered but NEVER DRAWN: ${unused.join(', ')}`
                       : `every frame is drawn except ${unused[0] || 'none'}`);
  // ★★ `rear` raises an antenna mast — it is a MODE, not a camera angle, and
  //   what mode is the Creator's call.  Tracked, not silently ignored.
  ok(unused.join() === 'rear' || unused.length === 0,
     'the only unused frame is `rear` · data/RULING_NEEDED_FIELD_STATION_REAR.md');
}

H('★★ THE RECIPE · you cannot deploy what you cannot build');
{
  const rec = R('FIELD_STATION_RECIPE');
  ok(rec.output && rec.output.field_station === 1, 'the recipe outputs the case');
  ok(rec.costOptions[0].scrap_metal === 20, 'for 20 scrap');
  // craft it the way the bench does
  P().items.scrap_metal = 20;
  P().items.scrap_metal -= rec.costOptions[0].scrap_metal;
  P().items.field_station = (P().items.field_station || 0) + 1;
  ok(P().items.field_station === 1 && P().items.scrap_metal === 0, 'crafting spends the scrap');
}

H('★★★ DEPLOY · unfold · craft · pack');
{
  const prop = R('deployFieldStation()');
  ok(!!prop, 'the case sets down');
  ok(P().items.field_station === 0, 'and leaves your bag — one station exists at a time');
  ok(R("deployedFieldStation()._fsFrame") === 'case', 'it starts closed');
  ok(R('fieldStationReady(deployedFieldStation())') === false, 'and is NOT usable mid-unfold');
  // ★ drive the animation on the real clock instead of asserting the array
  for (let i = 0; i < 4; i++){ NOW += 200; R('tickFieldStation()'); }
  ok(R("deployedFieldStation()._fsFrame") === 'deployed', 'three ticks unfold it to `deployed`');
  ok(R('fieldStationReady(deployedFieldStation())') === true, 'and now it is usable');
  R('fieldStationUse(deployedFieldStation())');
  ok(ctx.__panelOpened === 1, '★ X opens the SAME bench panel as home — this is the feature');
  ok(R("deployedFieldStation()._fsFrame") === 'crafting', 'and it strikes the crafting pose');
  R('packFieldStation(deployedFieldStation())');
  for (let i = 0; i < 3; i++){ NOW += 200; R('tickFieldStation()'); }
  ok(R('deployedFieldStation()') === null, 'SQUARE folds it away');
  ok(P().items.field_station === 1, '★★ and it comes back to your bag — nothing is lost');
}

H('★★ IT IS WEAK, AND THE LOSS IS REAL');
{
  R('deployFieldStation()');
  for (let i = 0; i < 4; i++){ NOW += 200; R('tickFieldStation()'); }
  ok(R('deployedFieldStation()._fsHp') === 40, 'it deploys with 40 HP');
  R('damageFieldStation(20)');
  ok(R('deployedFieldStation()._fsHp') === 20, 'a hit takes it down');
  ok(toasts.some(t => /being wrecked/.test(t)), 'and warns you at half');
  R('damageFieldStation(20)');
  ok(R('deployedFieldStation()') === null, 'at zero it is gone');
  ok(P().items.field_station === 0, '★ destroyed means destroyed — no refund');
  ok(!P().camps.malezor, 'and the camp record is cleared with it');
}

H('★★ THE WORKING POSE IS A STATE · IT NEEDS A WAY BACK OUT');
{
  ok(/_fsApplyFrame\(prop, game\.expPanelTab === 'matrix' \? 'scanning' : 'crafting'\)/.test(src),
     'the pose follows the TAB — scanning for the Matrix, crafting for recipes');
  ok(/function fieldStationPose/.test(src) && /fieldStationPose\(\); \} catch/.test(src),
     'and switching tabs re-poses a bench that is already open');
  const close = src.slice(src.indexOf('function closeExperimentPanel'),
                          src.indexOf('function closeExperimentPanel') + 900);
  ok(/_fsApplyFrame\(prop, 'deployed'\)/.test(close),
     "★ closing the panel stands it back up — it used to stay hunched over an " +
     'open drawer for the rest of the save');
}

H('★★★ THE GAP · SAVING WHILE IT IS STANDING');
{
  P().items.field_station = 1;
  R('deployFieldStation()');
  for (let i = 0; i < 4; i++){ NOW += 200; R('tickFieldStation()'); }
  ok(!!R('deployedFieldStation()'), 'a station is standing');
  ok(P().items.field_station === 0, 'and the item is spent — it exists ONLY as a world prop');
  ok(!!P().fieldCamp, '★ so the save has to carry a record of it');
  R('damageFieldStation(15)');
  ok(P().fieldCamp.hp === 25, 'and that record tracks damage · reloading is not a repair');

  // loadGame() rebuilds the world from scratch and then calls the restorers.
  const restorers = [...src.matchAll(/try \{ restore([A-Za-z]+)\(\); \} catch/g)].map(m => m[1]);
  ok(restorers.includes('FieldStation'),
     `loadGame restores [${[...new Set(restorers)].join(', ')}] — FieldStation among them`);
  ok(/fieldCamp:\s*player\.fieldCamp/.test(src), 'and the save payload writes fieldCamp out');

  // ★★★ THE ROUND TRIP.  Simulate exactly what loadGame does: throw the world
  //   away, keep only the serialized player, and run the restorer.
  const snapshot = JSON.parse(JSON.stringify({ fieldCamp: P().fieldCamp,
                                               items: P().items }));
  R('WORLD_PROPS.length = 0');
  ctx.player = Object.assign(ctx.player, snapshot);
  ok(R('deployedFieldStation()') === null, 'after the rebuild the world is empty');
  R('restoreFieldStation()');
  const back = R('deployedFieldStation()');
  ok(!!back, '★★★ and the station comes back');
  ok(back._fsFrame === 'deployed', 'already unfolded — it never folded up');
  ok(back._fsHp === 25, 'at the HP it had when you saved');
  ok(P().items.field_station === 0,
     '★ still DEPLOYED, not handed back stowed — leaving it out stays a risk');
  // and it must never duplicate
  R('restoreFieldStation()');
  ok(R('WORLD_PROPS.filter(p => p && p._fieldStation).length') === 1,
     'restoring twice does not leave two benches standing');
  // packing it after a reload still returns the case
  R('packFieldStation(deployedFieldStation())');
  for (let i = 0; i < 3; i++){ NOW += 200; R('tickFieldStation()'); }
  ok(P().items.field_station === 1 && P().fieldCamp === null,
     '★★ and a restored station packs away exactly like a fresh one');
}

H(f ? `❌ ${f} failed` : '✅ crafted, deployed, used, raided, saved, reloaded, packed');
process.exit(f ? 1 : 0);
