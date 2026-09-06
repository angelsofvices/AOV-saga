// v0.95.968 · Elzoran flies at the same scale he perches at.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const S = H.indexOf('const SUMMONABLE_SPRITES');
const B = H.slice(S, H.indexOf('const ZYREX_ATTACK_BANKS', S));
const at = /\n  elzoran: \{/.exec(B).index;
const blk = B.slice(at, at + 10 + /\n  [a-z_0-9]+: \{/.exec(B.slice(at + 10)).index);
const rows = (from) => {
  const re = /\[(\[[-\d,\s]+\](?:\s*,\s*\[[-\d,\s]+\]){3})\]/g; re.lastIndex = from;
  const out = [];
  for (let k = 0; k < 4; k++){
    const m = re.exec(blk);
    out.push([...m[1].matchAll(/\[\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g)]
               .map(x => x.slice(1).map(Number)));
  }
  return out;
};
const IDLE = rows(blk.indexOf('bboxes: ['));
const FLY  = rows(blk.indexOf('bboxes: [', blk.indexOf('flyAll')));
const TILE = 48, MUL = 1.15;
const refBh = Number(/scaleRefBh: (\d+)/.exec(blk.slice(blk.indexOf('flyAll')))[1]);

console.log('\n1 · the fly bank is pinned to the idle');
t('flyAll declares a scaleRefBh', () => {
  ok(refBh, 'no scaleRefBh · the bank falls back to its own col-0 max and he shrinks');
});
t('and it is the IDLE sheet\'s own reference', () => {
  const idleMax = Math.max(...IDLE.map(r => r[0][3]));
  ok(refBh === idleMax, `scaleRefBh ${refBh} but the idle bank divides by ${idleMax}`);
});
t('the follower actually passes it through', () => {
  const f = H.slice(H.indexOf('if (spriteDef.flyAll){'), H.indexOf('if (spriteDef.flyAll){') + 700);
  ok(/spriteDef\.flyAll\.scaleRefBh/.test(f), 'the bank declares a reference the builder ignores');
  ok(/base\.scaleRefBh = spriteDef\.flyAll\.scaleRefBh/.test(f), 'never assigned to the follower');
});
t('drawNPC honours scaleRefBh over the col-0 max', () => {
  const d = H.slice(H.indexOf('let maxBh = n.scaleRefBh || 216;'), H.indexOf('let maxBh = n.scaleRefBh || 216;') + 400);
  ok(/if \(n\.bboxes && !n\.scaleRefBh\)/.test(d), 'the col-0 scan overwrites a declared reference');
});

console.log('\n2 · he is the same animal, measured');
t('WIDTH carries across both banks within 10%', () => {
  // height is the wrong invariant — a rearing dragon is tall and narrow, a
  // flying one is low and long.  What must not change is how WIDE he reads.
  const sc = (TILE * 2) / refBh * MUL;
  ['DOWN','LEFT','RIGHT','UP'].forEach((nm, r) => {
    const iw = IDLE[r][0][2] * sc, fw = FLY[r][0][2] * sc;
    const drift = Math.abs(fw / iw - 1);
    ok(drift < 0.12, `${nm}: idle ${iw.toFixed(0)}px vs fly ${fw.toFixed(0)}px · ${(drift*100).toFixed(0)}% off`);
  });
});
t('the two sheets were drawn at one pixel scale', () => {
  // if they were not, a single divisor would be an approximation rather than
  // the artist's intent
  const iw = IDLE.map(r => r[0][2]), fw = FLY.map(r => r[0][2]);
  const ratio = fw.reduce((a, v, i) => a + v / iw[i], 0) / 4;
  ok(Math.abs(ratio - 1) < 0.10, `source widths differ by ${((ratio-1)*100).toFixed(0)}% on average`);
});
t('the old squashed geometry is gone', () => {
  // the previous bank drew him a THIRD wider and a quarter shorter in profile
  ok(!/\[\[40,65,229,244\]/.test(blk), 'the v0.95.831 fly bboxes are still here');
  ok(fs.existsSync('assets/2D sprites/zyrex/_orig/elzoran-fly-v831.png'), 'the old sheet was not archived');
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
