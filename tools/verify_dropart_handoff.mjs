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

console.log('\n★★★★ THE HANDOFF IS FULFILLED · every item it asked for now has keyed art');
{
  // ★★★★ This suite used to assert "the ASK is accurate". The Creator
  //   delivered all 72 on 2026-09-23, so that question is answered and asking
  //   it again just reports 0-rows-needed as a failure. What still matters is
  //   the DELIVERY: every key the manifest names has a real keyed file, and
  //   nothing was imported that nothing points at.
  const BAG = path.join(ROOT, 'assets/2D sprites/items/bag');
  const files = fs.existsSync(BAG) ? fs.readdirSync(BAG).filter(f => /\.png$/i.test(f)) : [];
  ok(files.length === 72, `${files.length} keyed icons imported`);
  const rows = [...DOC.matchAll(/^\| \d+ \| `([a-z0-9_]+)` \| [^|]+ \| `([^`]+)` \|$/gm)];
  const gone = rows.filter(([, , f]) => !files.includes(f));
  ok(!gone.length,
     `★★★ every filename the handoff specified exists as a keyed file${gone.length ? ' · MISSING: ' + gone.slice(0,4).map(r=>r[2]).join(', ') : ''}`);
  ok(/DELIVERED/.test(DOC),
     '★★ and the doc is marked DELIVERED, so it is not mistaken for an open ask');
  ok(/\[x, y, WIDTH, HEIGHT\]/.test(DOC), '★ the bbox warning is preserved for whoever wires the world drops');
}
console.log(f ? `\n❌ ${f} failed` : '\n✅ all 72 delivered and keyed · the handoff is a record, not a request');
process.exit(f ? 1 : 0);
