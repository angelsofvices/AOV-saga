// ★★★ v0.99.18 · THE DROP-ART HANDOFF MUST MATCH THE GAME, NOT A SNAPSHOT.
//   A prompt table is only useful while its item list is the real item list.
//   This checks the doc against the booted build, so the day an item is added
//   or its art lands, the table is known to be stale instead of quietly wrong.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['INVENTORY_META','zycubeCategoryOf','PICKUP_KINDS','WEAPON_DROP_ART'] });
console.log = _L;

const DOC = fs.readFileSync(path.join(ROOT, 'data/ASSET_NEEDS_OVERWORLD_ITEM_DROPS.md'), 'utf8');
// ★★★★ v0.99.19 · THE FIRST CUT OF THIS CHECK ASKED THE WRONG QUESTION.
//   It built HAVE from the two WIRING tables only — WEAPON_DROP_ART and
//   PICKUP_KINDS — and concluded that anything absent from them had no art.
//   Seventeen of the 72 rows it green-lit already had PNGs sitting in assets/,
//   unwired: all eight coloured gems, the skateboard, the portalkey, the
//   broken raygun, life-seed, life-stone, the elzebub egg, the rubypaw fang,
//   zysphere, and `fae` — which is a 4-frame strip already loaded as FAE_IMG
//   and was never a drop sprite at all.
//   ★ "Not wired" and "does not exist" are different claims and only the first
//   was being tested. The handoff asked the Creator to generate art they had
//   already made. Now the filesystem is consulted too.
const DECOR = path.join(ROOT, 'assets');
const onDisk = new Set();
(function walk(d){
  for (const e of fs.readdirSync(d, { withFileTypes: true })){
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full);
    else if (/\.png$/i.test(e.name)) onDisk.add(e.name.replace(/\.png$/i, '').toLowerCase());
  }
})(DECOR);
const hasArtOnDisk = k => {
  const dashed = k.replace(/_/g, '-');
  return onDisk.has(dashed) || onDisk.has(dashed + '-icon') || onDisk.has(dashed + '-drop');
};
const HAVE = new Set([...Object.values(G.PICKUP_KINDS).map(k => k.item),
  ...Object.keys(G.WEAPON_DROP_ART), 'astralcore', 'shardshare_broken']);
const skip = k => /^astralite_\d+_\d+$/.test(k) || /^compound_/.test(k);
const need = Object.keys(G.INVENTORY_META)
  .filter(k => !skip(k) && !HAVE.has(k) && !hasArtOnDisk(k));
const listed = new Set([...DOC.matchAll(/^\| \d+ \| `([a-z0-9_]+)`/gm)].map(m => m[1]));

console.log('\n★★★ THE TABLE IS THE GAME\'S OWN ITEM LIST');
ok(listed.size === need.length,
   `${listed.size} rows in the doc, ${need.length} items need art`);
const missing = need.filter(k => !listed.has(k));
ok(!missing.length, `every item needing art has a row${missing.length ? ' · MISSING: ' + missing.join(', ') : ''}`);
const extra = [...listed].filter(k => !need.includes(k));
ok(!extra.length,
   `★★ and no row describes art that already exists or an item that does not${extra.length ? ' · EXTRA: ' + extra.join(', ') : ''}`);

console.log('\n★★ EVERY ROW IS ACTIONABLE');
{
  const rows = [...DOC.matchAll(/^\| (\d+) \| `([a-z0-9_]+)` \| ([^|]+) \| `([^`]+)` \| ([\d.]+) \| (.+) \|$/gm)];
  ok(rows.length === listed.size, `${rows.length} rows parse with all six columns`);
  ok(rows.every(r => /\.png$/.test(r[4])), 'every row names a .png');
  ok(new Set(rows.map(r => r[4])).size === rows.length, '★★★ no two items share a filename · one would overwrite the other');
  ok(rows.every(r => r[6].length > 40), '★ every description is substantive, not a stub');
  ok(rows.every(r => +r[5] >= 0.7 && +r[5] <= 1.6),
     '★ every tileW sits inside the shipped range (portal chip 0.8 - sapphire sword 1.6)');
}

console.log('\n★★★ THE ROOT AND THE ALREADY-COVERED LIST ARE TRUE');
{
  ok(/assets\/2D sprites\/decor\//.test(DOC), 'the root is the folder the drop tables already read');
  for (const k of HAVE)
    ok(DOC.includes('`' + k + '`') && !listed.has(k),
       `  ${k.padEnd(18)} named as already-covered, and NOT given a row`);
  // ★★ bbox is [x,y,w,h] and the handoff has to say so, because reading it as
  //   corners draws every one of these at the wrong aspect and nothing errors.
  ok(/\[x, y, WIDTH, HEIGHT\]/.test(DOC), '★★★ the doc states bbox is [x,y,WIDTH,HEIGHT], not two corners');
  ok(/Measure after keying/.test(DOC), '★★ and that the bbox is measured AFTER the key, or it is the whole canvas');
}
console.log('\n★★★★ AND NO ROW ASKS FOR ART THAT IS ALREADY ON DISK');
{
  const asked = [...listed].filter(k => hasArtOnDisk(k));
  ok(!asked.length,
     `★★★★ 0 of ${listed.size} rows duplicate an existing PNG`
   + (asked.length ? ` · ALREADY DRAWN: ${asked.join(', ')}` : ''));
  ok(/ALREADY ON DISK/.test(DOC),
     '★★★ and the doc carries the already-on-disk table, so the Creator is not asked twice');
  for (const k of ['zysphere', 'fae'])
    ok(new RegExp('`' + k + '`').test(DOC) && !listed.has(k),
       `  ${k.padEnd(10)} is listed as on-disk with its caveat, not as a generation row`);
}
console.log(f ? `\n❌ ${f} failed` : `\n✅ the handoff matches the booted game AND the filesystem · ${listed.size} rows, unique files, real root`);
process.exit(f ? 1 : 0);
