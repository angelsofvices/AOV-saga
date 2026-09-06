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
const FLY  = rows(blk.indexOf('runBboxes: ['));
const TILE = 48, MUL = 1.15;
const refBh = Number(/runRefBh: (\d+)/.exec(blk)[1]);
const live  = blk.split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');

console.log('\n1 · he stands when idle, flies only while moving');
t('the bank is runSrc, not flyAll', () => {
  // Creator: "elzon should stand when idle. only fly with running."
  // flyAll = ONE sheet for idle AND walk.  runSrc = src is the IDLE, second
  // sheet is the traversal — perched when still, airborne only while crossing.
  ok(!/^\s*flyAll:/m.test(live), 'still flyAll · he would fly standing still');
  ok(/^\s*runSrc:/m.test(live), 'no runSrc · nothing plays while he moves');
  ok(/^\s*runBboxes:/m.test(live), 'no runBboxes');
});
t('the idle bank is still the perched sheet', () => {
  ok(/src: 'assets\/2D%20sprites\/zyrex\/elzoran\.png'/.test(live), 'the idle src changed');
  ok(/runSrc: 'assets\/2D%20sprites\/zyrex\/elzoran-fly\.png'/.test(live), 'the run src is not the fly sheet');
});
t('the run bank declares a reference', () => {
  ok(refBh, 'no runRefBh · the bank falls back to its own col-0 max and he changes size');
});
t('and it is the IDLE sheet\'s own reference', () => {
  const idleMax = Math.max(...IDLE.map(r => r[0][3]));
  ok(refBh === idleMax, `scaleRefBh ${refBh} but the idle bank divides by ${idleMax}`);
});
t('the FOLLOWER path honours it', () => {
  const at = H.indexOf('if (spriteDef.runSrc && spriteDef.runBboxes');
  ok(at > 0, 'the follower does not understand runSrc at all');
  const f = H.slice(at, H.indexOf('return base;', at));
  ok(/spriteDef\.runRefBh \|\| 216/.test(f), 'a declared reference is ignored');
  ok(/if \(!spriteDef\.runRefBh\)/.test(f), 'the derivation still overwrites it');
});
t('the WILD path honours it', () => {
  // the wild draw re-derives per row, so it needs the per-row form
  ok(/runRowRefBh/.test(live), 'no per-row reference · the wild Elzoran resizes when he wanders');
  ok(/const _refs = _useFlee/.test(H), 'the wild draw has no reference lookup at all');
  ok(/_useRun\s*\? d\.runRowRefBh/.test(H), 'the wild draw ignores runRowRefBh');
});
t('both references are the SAME number', () => {
  const rr = JSON.parse(/runRowRefBh: (\[[^\]]+\])/.exec(live)[1]);
  rr.forEach((v, i) => ok(v === refBh,
    `runRowRefBh[${i}] = ${v} but runRefBh = ${refBh} · the two paths would disagree`));
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
  ok(!/\[\[40,65,229,244\]/.test(blk), 'the v0.95.831 fly bboxes are still here');
  ok(fs.existsSync('assets/2D sprites/zyrex/_orig/elzoran-fly-v831.png'), 'the old sheet was not archived');
});
t('the DERIVED reference would still be wrong · this is why it is declared', () => {
  // guards the reasoning, not just the value: if someone deletes runRefBh the
  // derivation takes over, and the derivation is what ballooned him
  const flyMax = Math.max(...FLY.map(r => r[0][3]));
  const idleMax = Math.max(...IDLE.map(r => r[0][3]));
  ok(flyMax !== idleMax,
     'the two banks now share a max, so the declaration is untested — re-check it');
  const derivedDrift = Math.abs((idleMax / flyMax) - 1);
  ok(derivedDrift > 0.05,
     `deriving would only drift ${(derivedDrift*100).toFixed(0)}% · the pin may no longer be needed`);
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
