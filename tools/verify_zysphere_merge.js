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

// ...and cut out migrateZysphereBasic itself, which must name the old key —
// it is the one function whose whole job is to know about it.
const migAt = CODE.indexOf('function migrateZysphereBasic()');
const LIVE = migAt < 0 ? CODE
  : CODE.slice(0, migAt) + CODE.slice(CODE.indexOf('\n}', migAt) + 2);
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

/* ── 4 · the tier ladder is intact, minus the phantom bottom rung ───────── */
for (const k of ['zysphere_void', 'zysphere_silver', 'zysphere_ultra']){
  t(CODE.includes(k), `${k} still exists — this patch removed a duplicate, not a tier`);
}
const catAt = CODE.indexOf("zysphere:'sphere'");
const cat = CODE.slice(catAt, catAt + 160);
t(/zysphere:'sphere'/.test(cat) && !/zysphere_basic/.test(cat),
  'the ZyCube category map lists the real key and not the ghost');
t(/'zysphere','zysphere_silver','zysphere_ultra'/.test(CODE),
  'the item-gain jingle fires for the sphere the player actually receives');

/* ── 5 · the migration gives stranded spheres back ──────────────────────── */
{
  const mAt = HTML.indexOf('function migrateZysphereBasic()');
  t(mAt > 0, 'migrateZysphereBasic() exists');
  const src = HTML.slice(mAt, HTML.indexOf('\n}', mAt) + 2);
  const box = { console };
  vm.createContext(box);
  vm.runInContext(src, box);

  box.player = { items: { zysphere_basic: 7, zysphere: 2 } };
  const moved = vm.runInContext('migrateZysphereBasic()', box);
  t(moved === 7, 'a save holding 7 stranded spheres reports 7 migrated');
  t(box.player.items.zysphere === 9,
    '★ they are FOLDED IN, not dropped (2 + 7 = 9) — a quest reward is not deleted');
  t(!('zysphere_basic' in box.player.items), '  · and the ghost key is gone');

  box.player = { items: { zysphere: 3 } };
  vm.runInContext('migrateZysphereBasic()', box);
  t(box.player.items.zysphere === 3, 'a clean save is untouched');

  box.player = { items: { zysphere_basic: 0 } };
  vm.runInContext('migrateZysphereBasic()', box);
  t(!('zysphere_basic' in box.player.items), 'a zero-count ghost key is still swept');

  box.player = {};
  t(vm.runInContext('migrateZysphereBasic()', box) === 0, 'no inventory · no crash');
}

/* ── 6 · it is wired into the load path ─────────────────────────────────── */
t(/migrateZysphereBasic === 'function'\) migrateZysphereBasic\(\)/.test(HTML),
  'the migration runs on load, next to the species-id migration');

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
