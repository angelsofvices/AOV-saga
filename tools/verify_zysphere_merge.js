#!/usr/bin/env node
/* verify_zysphere_merge.js · v0.95.972
 *
 *   Creator: "basic zysphere in the dev menu should just be zysphere"
 *
 * It reads as a naming note.  Chasing the name found a live bug, and this suite
 * is about the bug rather than the label.
 *
 * There were TWO inventory keys for one object:
 *   · `zysphere`        ITEM_LABELS 'Zysphere', order 9, sold in the shop at 150
 *   · `zysphere_basic`  ITEM_LABELS 'Basic Zysphere', order 40, filed with the
 *                       Void/Silver/Ultra tiers as though it were a rung
 *
 * ★ It was not a rung, it was a duplicate — and the wrong one.  The bond
 *   attempt reads `player.items.zysphere` and only that.  So every source that
 *   granted `zysphere_basic` handed the player spheres they could not throw:
 *   the dev GRANTS button, GIVE ALL, and Dad's starter quest, whose five
 *   spheres are the first the player ever owns.
 *
 * ★ THE STANDING INVARIANT this suite exists to hold:
 *      every grant of a throwable sphere must land on the key the throw spends.
 *   That is a property, not a spelling, so the tests below check the wiring in
 *   both directions rather than grepping for a dead identifier.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== ZYSPHERE · one key, not two (v0.95.972) ===\n');

/* ── which key does the BOND actually spend?  Ask the code, don't assume. ── */
const spendM = HTML.match(/player\.items\.(zysphere\w*)\s*=\s*_held\s*-\s*1/);
t(!!spendM, 'located the line that spends a sphere on a bond attempt');
const SPEND = spendM ? spendM[1] : null;
console.log(`\n       the throw spends · player.items.${SPEND}\n`);
t(SPEND === 'zysphere', 'the spent key is `zysphere`');

/* ── 1 · no grant may land anywhere else ────────────────────────────────── */
// Strip comments first: this patch documents the old key by name, and a suite
// that fails on its own explanation is a suite that gets ignored.
const CODE = HTML
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/[^\n]*$/gm, '')
  .replace(/\/\/[^\n]*$/gm, '');

// ...and cut out the migration itself, which must name the old keys — it is the
// one place whose whole job is to know about them.  The cut starts at the
// LEGACY_KEYS const, not the function: the names live in the table, and slicing
// from `function` would leave them behind and fail on the fix's own bookkeeping.
const migAt = CODE.indexOf('const ZYSPHERE_LEGACY_KEYS');
const migEnd = CODE.indexOf('\n}', CODE.indexOf('function migrateZyspheres')) + 2;
const LIVE = migAt < 0 ? CODE : CODE.slice(0, migAt) + CODE.slice(migEnd);
const stray = [...LIVE.matchAll(/zysphere_basic/g)].length;
t(stray === 0,
  `no live code references zysphere_basic outside the migration (${stray} found)`);

/* ── 2 · every grant site names the spendable key ───────────────────────── */
const grants = [
  [/data-give="(zysphere[\w]*),\s*10"/,               'dev GRANTS button'],
  [/inv\.(zysphere\w*)\s*=\s*\(inv\.\w+\s*\|\|\s*0\)\s*\+\s*5;/, 'Dad\'s starter-quest reward'],
  [/^\s*(zysphere\w*):\s*30,/m,                       'dev GIVE ALL bulk grant'],
  [/player\.items\.(zysphere\w*)\s*=\s*\(player\.items\.\w+\s*\|\|\s*0\)\s*\+\s*16/, 'Elarion graduation ×16'],
];
for (const [re, who] of grants){
  const m = CODE.match(re);
  t(!!m && m[1] === SPEND, `${who} grants \`${m ? m[1] : '??'}\` — the key the throw spends`);
}

/* ── 3 · the label is just 'Zysphere' ───────────────────────────────────── */
const lblAt = CODE.indexOf("zysphere:         { label:");
const lbl = CODE.slice(lblAt, lblAt + 120);
t(/label:\s*'Zysphere'/.test(lbl), "ITEM_LABELS.zysphere reads 'Zysphere' · no adjective");
t(!/'Basic Zysphere'/.test(CODE), "no 'Basic Zysphere' label survives anywhere");
t(!/Basic Zyspheres/.test(CODE),  "the wallet panel no longer says 'Basic Zyspheres'");
t(/\['◈ Zyspheres',\s*String\(items\.zysphere\s*\|\|\s*0\)\]/.test(CODE),
  'the wallet counts the spendable key');

/* ── 4 · v0.95.973 · THERE IS ONLY ONE KIND ─────────────────────────────
 * Creator: "there is only one type of zysphere now. no extra version."
 * v0.95.972 removed a duplicate; this removes the ladder itself.
 */
{
  const migAt2 = CODE.indexOf('const ZYSPHERE_LEGACY_KEYS');
  const LIVE2 = migAt2 < 0 ? CODE
    : CODE.slice(0, migAt2) + CODE.slice(CODE.indexOf('\n}', CODE.indexOf('function migrateZyspheres')) + 2);
  for (const k of ['zysphere_void', 'zysphere_silver', 'zysphere_ultra']){
    t(!LIVE2.includes(k), `${k} is gone from live code — one kind, no versions`);
  }
  for (const lbl of ['Void Zysphere', 'Silver Zysphere', 'Ultra Zysphere']){
    t(!CODE.includes(lbl), `no '${lbl}' label survives`);
  }
}
const catAt = CODE.indexOf("zysphere:'sphere'");
const cat = CODE.slice(catAt, catAt + 160);
t(/zysphere:'sphere'/.test(cat) && !/zysphere_(basic|void|silver|ultra)/.test(cat),
  'the ZyCube category map lists exactly one sphere');
t(/'zysphere',\n/.test(CODE) || /'zysphere',/.test(CODE),
  'the item-gain jingle fires for the sphere the player actually receives');

/* ── 4b · the Scrapjaw board still climbs ───────────────────────────────
 * Two of its three rungs WERE tiers.  Collapsing them 1:1 would make 10 scrap
 * and 50 scrap buy the identical thing — every piece past the tenth worthless,
 * which is the exact problem this sink exists to solve.  So the ladder has to
 * still go somewhere, in count rather than rarity.
 */
{
  const sAt = CODE.indexOf('const SCRAP_SHOP');
  const shop = CODE.slice(sAt, CODE.indexOf('];', sAt));
  const rungs = [...shop.matchAll(/cost:\s*(\d+),\s*key:\s*'(\w+)',\s*qty:\s*(\d+)/g)]
    .map(m => ({ cost: +m[1], key: m[2], qty: +m[3] }));
  t(rungs.length === 3, `the board still has three rungs (got ${rungs.length})`);
  t(rungs.every(r => r.key === 'zysphere' || r.key === 'potion'),
    'every rung pays out an item that still exists');
  const spheres = rungs.filter(r => r.key === 'zysphere');
  t(spheres.length === 2, 'two of them are spheres, as before');
  t(spheres[0].cost > spheres[1].cost && spheres[0].qty > spheres[1].qty,
    '★ the dearer sphere rung pays MORE spheres — the ladder climbs in count');
  // cost-descending is load-bearing: scrapShopBest() takes the first affordable
  const costs = rungs.map(r => r.cost);
  t(costs.every((c, i) => i === 0 || costs[i-1] > c),
    'the list is still cost-descending · scrapShopBest() takes the first match');
  t(/addItems\(\{\s*\[t\.key\]:\s*\(t\.qty\s*\|\|\s*1\)\s*\}\)/.test(CODE),
    'and the buy actually honours qty rather than always granting 1');
}

/* ── 5 · the migration gives stranded spheres back ──────────────────────── */
{
  const kAt = HTML.indexOf('const ZYSPHERE_LEGACY_KEYS');
  const mAt = HTML.indexOf('function migrateZyspheres()');
  t(mAt > 0, 'migrateZyspheres() exists');
  const src = HTML.slice(kAt, HTML.indexOf('\n}', mAt) + 2);
  const box = { console };
  vm.createContext(box);
  vm.runInContext(src, box);

  box.player = { items: { zysphere_basic: 7, zysphere: 2 } };
  const moved = vm.runInContext('migrateZyspheres()', box);
  t(moved === 7, 'a save holding 7 stranded spheres reports 7 migrated');
  t(box.player.items.zysphere === 9,
    '★ they are FOLDED IN, not dropped (2 + 7 = 9) — a quest reward is not deleted');
  t(!('zysphere_basic' in box.player.items), '  · and the ghost key is gone');

  // ★ v0.95.973 · all four legacy keys, one fold, 1:1
  box.player = { items: { zysphere: 1, zysphere_basic: 2, zysphere_void: 3,
                          zysphere_silver: 4, zysphere_ultra: 5, ale: 9 } };
  const moved2 = vm.runInContext('migrateZyspheres()', box);
  t(moved2 === 14, `every legacy tier folds too (2+3+4+5 = 14, got ${moved2})`);
  t(box.player.items.zysphere === 15,
    '★ 1:1 · the player keeps all 15 spheres, and loses only a distinction that never did anything');
  t(['zysphere_basic','zysphere_void','zysphere_silver','zysphere_ultra']
      .every(k => !(k in box.player.items)), '  · all four ghost keys swept');
  t(box.player.items.ale === 9, '  · nothing else in the bag is touched');

  box.player = { items: { zysphere: 3 } };
  vm.runInContext('migrateZyspheres()', box);
  t(box.player.items.zysphere === 3, 'a clean save is untouched');

  box.player = { items: { zysphere_ultra: 0 } };
  vm.runInContext('migrateZyspheres()', box);
  t(!('zysphere_ultra' in box.player.items), 'a zero-count ghost key is still swept');
  t(box.player.items.zysphere === undefined,
    '  · and sweeping an empty key does not conjure a zysphere entry');

  box.player = {};
  t(vm.runInContext('migrateZyspheres()', box) === 0, 'no inventory · no crash');
}

/* ── 6 · it is wired into the load path ─────────────────────────────────── */
t(/migrateZyspheres === 'function'\) migrateZyspheres\(\)/.test(HTML),
  'the migration runs on load, next to the species-id migration');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
