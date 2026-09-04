// ★★★ Which coordinate system is each SUMMONABLE_SPRITES table written in?
//
// The wild draw does:  drawImage(img, col*C + bb[0], row*C + bb[1], ...)
// so EVERY table must be CELL-RELATIVE.  A table written in absolute sheet
// coordinates gets col*C added to a number that already contains it, and the
// source rect walks off the sheet -- drawImage silently draws NOTHING when the
// rect is fully outside, which is exactly what "turning invisible" looks like.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
const start = H.indexOf('const SUMMONABLE_SPRITES');
const end   = H.indexOf('const ZYREX_ATTACK_BANKS', start);
const B = H.slice(start, end);

// split into per-species blocks
const names = [...B.matchAll(/\n  ([a-z_0-9]+): \{/g)];
let bad = 0, tables = 0;
for (let i = 0; i < names.length; i++){
  const id = names[i][1];
  const blk = B.slice(names[i].index, i + 1 < names.length ? names[i+1].index : B.length);
  const cellW = Number((blk.match(/cellW:\s*(\d+)/) || [])[1] || 313);
  const cellH = Number((blk.match(/cellH:\s*(\d+)/) || [])[1] || cellW);
  // ★★★ NESTED TABLES COUNT.  The first version scanned only the four
  // top-level field names and missed skybeam.flyAll.bboxes entirely -- which
  // was absolute, and which is the bank a COMPANIONIZED Skybeam flies on.  An
  // audit that reports "0 wrong" while a broken table sits one nesting level
  // down is worse than no audit, because it buys confidence it has not earned.
  // So every `bboxes:` in the species block is checked, wherever it lives, and
  // each is reported with the path it was found at.
  const fields = [];
  for (const m of blk.matchAll(/(\w+)?Bboxes:|\bbboxes:/g)) fields.push(m.index);
  for (const at of fields){
    const label = blk.slice(blk.lastIndexOf('\n', at), at + 20).trim().split(':')[0].trim();
    // name it by the nearest enclosing sub-object, so flyAll.bboxes is not
    // confused with the species' own bboxes
    const before = blk.slice(0, at);
    const sub = [...before.matchAll(/\n    (\w+): \{/g)].pop();
    const field = (sub ? sub[1] + '.' : '') + label;
    // ★ take the FOUR row-lines after the field, each `[[a,b,c,d],[..],[..],[..]]`.
    // (An earlier version tried to slice to the table's closing bracket and
    // stopped at the first `]]`, which is the end of ROW ZERO -- it read 4
    // boxes instead of 16 and every table silently failed the 16 check, so the
    // audit reported a clean sweep while the bug it was written to find was
    // sitting in the first file it opened.  A check that cannot fail is not a
    // check.)
    const rowRe = /\[(\[[-\d,\s]+\](?:\s*,\s*\[[-\d,\s]+\]){3})\]/g;
    rowRe.lastIndex = at;
    const rows = [];
    for (let k = 0; k < 4; k++){
      const m = rowRe.exec(blk);
      if (!m) break;
      for (const b of m[1].matchAll(/\[\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g))
        rows.push(b.slice(1).map(Number));
    }
    if (rows.length !== 16){ console.log(`  ?  ${id}.${field} · parsed ${rows.length}/16 boxes · SKIPPED`); continue; }
    tables++;
    // absolute tables put column c near c*cellW and row r near r*cellH
    let absX = 0, absY = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
      const [x, y] = rows[r*4 + c];
      if (c > 0 && x >= c * cellW - 40) absX++;
      if (r > 0 && y >= r * cellH - 40) absY++;
    }
    // ★ PARTIAL overflow is not a bug.  A bbox may legitimately extend past
    // the last cell -- owned overflow is the house rule, and drawImage simply
    // clips the rect against the sheet and draws the part that exists.  Only a
    // rect lying ENTIRELY outside draws nothing, and that is the invisibility
    // this audit is looking for.  (First version failed both apart: it flagged
    // 1px and 14px of honest overflow as INVISIBLE, which would have had me
    // "fixing" two correct tables.)
    let gone = 0, clipped = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
      const [x, y, w, h] = rows[r*4 + c];
      const sx = c * cellW + x, sy = r * cellH + y;
      if (sx >= 4 * cellW || sy >= 4 * cellH) gone++;
      else if (sx + w > 4 * cellW || sy + h > 4 * cellH) clipped++;
    }
    const flag = (absX >= 3 || absY >= 3) || gone > 0;
    if (flag){
      bad++;
      console.log(`  ✗ ${id}.${field}  · absolute-looking cols ${absX}/12 rows ${absY}/12` +
                  (gone ? ` · ${gone}/16 frames read ENTIRELY off the sheet -> INVISIBLE` : ''));
    } else if (clipped){
      console.log(`  ·  ${id}.${field}  · ${clipped}/16 frames clip the sheet edge · owned overflow, fine`);
    }
  }
}
console.log(`\n${bad ? '✗' : '★'} ${tables} tables checked · ${bad} written in the wrong coordinate system\n`);
process.exit(bad ? 1 : 0);
