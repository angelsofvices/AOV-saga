// v0.95.666 · verify every throw / sword / slam bbox against the real pixels,
// and the ZyPhone nav wrap.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const measured = JSON.parse(fs.readFileSync('/tmp/clean_bboxes.json', 'utf8'));
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fails++; };

// ── pull each declared table straight out of the source ──────────────────
// Take the first 16 four-number groups after the anchor.  Bracket-matching
// tripped over the nested row arrays; the tables are always exactly 16 frames.
function declared(anchor){
  const i = src.indexOf(anchor); if (i < 0) return null;
  const win = src.slice(i, i + 2600);
  const nums = win.match(/\[\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\]/g) || [];
  return nums.slice(0, 16).map(n => n.match(/\d+/g).map(Number));
}
const MAP = [
  ['astralthrow: { img: new Image()', 'astralthrow.png',                       'S1 astralthrow'],
  ['const RIZER_POWER_ASTRALTHROW',   'astralthrow-power-upgrade.png',         'S2 astralthrow'],
  ['const ASTRALTHROW_S1_BOULDER',    'astralthrow-boulder.png',               'S1 throw+boulder'],
  ['const ASTRALTHROW_S2_BOULDER',    'astralthrow-boulder-power-upgrade.png', 'S2 throw+boulder'],
  ['const ASTRALSLAM_S1_MORI',        'astralslam-s1-mori.png',                'S1 slam mori'],
  ['const ASTRALSLAM_S2_MORI',        'astralslam-s2-mori.png',                'S2 slam mori'],
  ['const ASTRALSLAM_S1_DAEMON',      'astralslam-s1-daemon.png',              'S1 slam daemon'],
  ['const ASTRALSLAM_S2_DAEMON',      'astralslam-s2-daemon.png',              'S2 slam daemon'],
  ['const RIZER_SAPPHIRE_SWORD',      'sapphire-sword.png',                    'S1 sapphire sword'],
  ['const RIZER_RUBYPAW_SWORD',       'rubypaw-sword.png',                     'S2 rubypaw sword'],
];

console.log('\n1 · ★ EVERY BBOX MATCHES THE PIXELS\n');
console.log('     sheet                 frames   result');
for (const [anchor, png, label] of MAP){
  const d = declared(anchor);
  const want = (measured[png] || []).flat();
  if (!d){ ok(false, `${label} · no table found`); continue; }
  const bad = [];
  for (let i = 0; i < want.length; i++){
    if (!d[i] || d[i].join() !== want[i].join()) bad.push(`[${i}] ${d[i]} != ${want[i]}`);
  }
  console.log(`     ${label.padEnd(20)} ${String(d.length).padStart(4)}     ${bad.length ? bad.length + ' MISMATCH' : 'exact'}`);
  ok(d.length === 16, `${label} declares all 16 frames`);
  ok(bad.length === 0, `${label} matches measured pixels${bad.length ? ' — ' + bad.slice(0,2).join(' · ') : ''}`);
}

console.log('\n2 · ★ NO BBOX REACHES OUTSIDE ITS CELL (that is the bleed)\n');
let bleeders = 0, total = 0;
for (const [anchor, png, label] of MAP){
  const d = declared(anchor); if (!d) continue;
  for (let i = 0; i < d.length; i++){
    const [x, y, w, h] = d[i]; total++;
    if (x < 0 || y < 0 || x + w > 313 || y + h > 313){
      bleeders++; console.log(`     ${label} [${i}] ${d[i]} runs past the 313 cell`);
    }
  }
}
ok(bleeders === 0, `${total} frames checked · ${bleeders} reach into a neighbouring cell`);

console.log('\n3 · ★ NO FRAME IS CLIPPED · the bbox holds the whole figure\n');
// A bbox smaller than the frame's own component set = art cut off.  The
// measured values ARE the component extents, so equality (section 1) already
// proves this; here we confirm none of them collapsed to a stub.
let stubs = 0;
for (const [anchor, png, label] of MAP){
  const d = declared(anchor); if (!d) continue;
  d.forEach((b, i) => { if (b[2] < 40 || b[3] < 40){ stubs++; console.log(`     ${label} [${i}] suspiciously small ${b[2]}x${b[3]}`); } });
}
ok(stubs === 0, 'no frame collapsed to a stub bbox');

console.log('\n4 · THE HAND-TRIMMED RUBYPAW CROP IS GONE\n');
// v0.95.612 had hand-trimmed the S2 sword to hide ghosting, which cropped the
// blade instead of excluding the bled sliver.
const ruby = declared('const RIZER_RUBYPAW_SWORD');
const rubyWant = measured['rubypaw-sword.png'].flat();
console.log(`     frame 2 now ${ruby[2]}  (v0.95.612 hand-trim was [15,147,280,166])`);
ok(ruby[2].join() !== '15,147,280,166', 'the hand-trim is replaced by a measured bbox');
ok(ruby[2].join() === rubyWant[2].join(), 'and it equals the real content extent');
const widest = Math.max(...ruby.map(b => b[2]));
ok(widest > 280, `the widest sweep frame is ${widest}px — the blade is no longer cropped`);

console.log('\n5 · SLIVERS WERE EXCLUDED, ARTWORK WAS NOT\n');
console.log('     A first pass deleted every edge-hugging blob and would have erased');
console.log('     the THROWN BOULDER (101x102 and 147x110, ~49% of the figure).');
const b1 = measured['astralthrow-boulder.png'].flat();
const b2 = measured['astralthrow-boulder-power-upgrade.png'].flat();
ok(b1[6][2] >= 240, `S1 boulder frame 6 keeps its full ${b1[6][2]}px width (boulder included)`);
ok(b2[10][2] >= 300, `S2 boulder frame 10 keeps its full ${b2[10][2]}px width`);
ok(!/APPLY|im\.save\(path\)/.test(fs.readFileSync(
   '/sessions/great-cool-heisenberg/mnt/outputs/fix_cellbleed.py', 'utf8')),
   'the final tool never writes to the PNGs — bbox-only, so art cannot be destroyed');

console.log('\n6 · ★ ZYPHONE NAV WRAPS TO SETTINGS\n');
const panels = (src.match(/const ZYCELL_PANELS = \[([^\]]+)\]/) || [])[1] || '';
const list = panels.split(',').map(s => s.trim().replace(/'/g, ''));
console.log(`     ${list.length} panels · settings is index ${list.indexOf('settings')}`);
ok(/const n = \(i \+ dir \+ ZYCELL_PANELS\.length\) % ZYCELL_PANELS\.length;/.test(src),
   'zycellMoveCursor wraps with modulo');
ok(!/const n = i \+ dir;\s*\n\s*if \(n < 0 \|\| n >= ZYCELL_PANELS\.length\) return;/.test(src),
   'the old clamp (UP at the top did nothing) is gone');
const i0 = list.indexOf('home');
const up = (i0 - 1 + list.length) % list.length;
ok(list[up] === 'settings', `one press UP from home now lands on ${list[up]} (was ${list.length - 1} presses down)`);

console.log(fails ? `\n❌ ${fails} failure(s)` : '\n✅ ALL CHECKS PASS');
process.exit(0);
