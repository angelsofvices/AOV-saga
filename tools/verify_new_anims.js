#!/usr/bin/env node
/* verify_new_anims.js · v0.95.988
 *
 *   Creator: "make sure u have everyone new animations lock and c that."
 *
 * ★★ EVERY ANIMATION SHIPPED THIS SESSION, CHECKED THE SAME WAY: the bank
 *   exists, its PNG is on disk, its bbox table is a full 4x4, and its
 *   reference height is THE RIGHT ONE.
 *
 * ★★★ That last check is the point of the suite. refBh / runRefBh must be the
 *   COL-0 MAX OF THEIR OWN SHEET — never the idle's. The draw computes
 *   _idleRefBh / refBh, so pinning the idle's number in both places cancels to
 *   1 and the bank renders at whatever size its own art happens to be. I made
 *   that exact mistake on FOUR traversal banks in one session and the Creator
 *   caught it by eye ("make voltarun sprint size the same size as his idle
 *   scale") — on Voltaryn it was a 16% shrink.
 *
 * ★ It is a mistake worth a permanent test because the file has now warned
 *   about it three separate times — v0.95.890 (Key of Mealux float), v0.95.908
 *   (traversal banks), v0.95.985 (Voltigrax attack) — and I still made it. A
 *   comment that has to be read at the right moment is not a guard.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log('  ok   · ' + m); };
const no = (m) => { fail++; console.log('  FAIL · ' + m); };
const t  = (c, m) => c ? ok(m) : no(m);

console.log('\n=== NEW ANIMATIONS · locked? (v0.95.988) ===\n');

const table = (code, label) => {
  const i = code.indexOf(label);
  if (i < 0) return null;
  const rows = code.slice(i).split('\n').filter(l => /^\s*\[\[/.test(l)).slice(0, 4)
    .map(l => [...l.matchAll(/\[\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g)]
                .map(x => x.slice(1, 5).map(Number)));
  return rows.length === 4 && rows.every(r => r.length === 4) ? rows : null;
};
const grab = (start, id) => {
  const m = HTML.slice(start).match(new RegExp('\\n  ' + id + ': \\{'));
  if (!m) return null;
  const at = start + m.index;
  return HTML.slice(at, HTML.indexOf('\n  },', at)).replace(/\/\/[^\n]*/g, '');
};
const SPR = HTML.search(/const\s+SUMMONABLE_SPRITES\s*=/);
const ATK = HTML.indexOf('const ZYREX_ATTACK_BANKS');

/* ── 1 · TRAVERSAL banks added this session ─────────────────────────────── */
console.log('  ── traversal (runSrc) ──');
for (const id of ['rustbyte', 'voltaryn', 'talenko', 'veridrax']){
  const code = grab(SPR, id);
  if (!code){ no(`${id} · no sprite bank`); continue; }
  const src = (code.match(/runSrc:\s*'([^']+)'/) || [])[1];
  const tbl = table(code, 'runBboxes:');
  const ref = +(code.match(/runRefBh:\s*(\d+)/) || [])[1];
  const file = src && decodeURIComponent(src);
  const onDisk = file && fs.existsSync(path.join(ROOT, file));
  const col0 = tbl && Math.max(...tbl.map(r => r[0][3]));
  t(!!src && onDisk && !!tbl && ref === col0,
    `${id.padEnd(9)} runRefBh ${ref} · own col-0 max ${col0}`
    + (onDisk ? '' : ' · ★ PNG MISSING')
    + (tbl ? '' : ' · ★ table not 4x4')
    + (ref === col0 ? '' : ` · ★★★ WRONG YARDSTICK (would draw at ${(col0/ref*100).toFixed(0)}% of idle)`));
}

/* ── 2 · ATTACK banks added this session ────────────────────────────────── */
console.log('\n  ── attack ──');
for (const id of ['vengrizz', 'veridrax', 'smogrin', 'voltaryn', 'talenko', 'vampella']){
  const code = grab(ATK, id);
  if (!code){ no(`${id} · no attack bank`); continue; }
  const src = decodeURIComponent((code.match(/src:\s*'([^']+)'/) || [])[1] || '');
  const tbl = table(code, 'bboxes:');
  const ref = +(code.match(/refBh:\s*(\d+)/) || [])[1];
  const onDisk = src && fs.existsSync(path.join(ROOT, src));
  const col0 = tbl && Math.max(...tbl.map(r => r[0][3]));
  const move = (code.match(/move:\s*'([^']+)'/) || [])[1];
  t(onDisk && !!tbl && ref === col0 && !!move,
    `${id.padEnd(9)} refBh ${ref} · own col-0 max ${col0} · ${move || '★ NO MOVE'}`
    + (onDisk ? '' : ' · ★ PNG MISSING')
    + (ref === col0 ? '' : ' · ★★★ WRONG YARDSTICK'));
  // ★ the move a bank names must be one the species can actually cast
  if (move){
    const sp = HTML.match(new RegExp("id:'" + id + "',[\\s\\S]{0,400}?moves:\\[([^\\]]*)\\]"));
    t(!!sp && sp[1].includes("'" + move + "'"),
      `  · "${move}" is in ${id}'s own move list`);
  }
}

/* ── 3 · one full body per frame ────────────────────────────────────────── */
console.log('\n  ── one full body per frame ──');
{
  // ★ A re-celled sheet must not leave a cell EMPTY. A zero-area box is the
  // signature of the failure that hit Voltaryn: a frame whose only content was
  // impact dust, eaten by the shadow stripper.
  const empties = [];
  for (const [start, ids, label] of [[ATK, ['vengrizz','veridrax','smogrin','voltaryn','talenko','vampella'], 'bboxes:'],
                                     [SPR, ['rustbyte','voltaryn','talenko','veridrax'], 'runBboxes:']]){
    for (const id of ids){
      const code = grab(start, id); if (!code) continue;
      const tbl = table(code, label); if (!tbl) continue;
      tbl.forEach((r, ri) => r.forEach((c, ci) => {
        if (c[2] <= 0 || c[3] <= 0) empties.push(`${id}.${label.slice(0,-1)} r${ri}f${ci}`);
      }));
    }
  }
  t(empties.length === 0,
    '★★ no frame is empty · an all-zero box means a cell lost its art'
    + (empties.length ? ' · ' + empties.join(', ') : ''));
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
