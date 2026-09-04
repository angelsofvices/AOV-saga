// v0.95.954 · Skybeam's three banks · sizes, coordinates, and no dead art.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const S = H.indexOf('const SUMMONABLE_SPRITES');
const B = H.slice(S, H.indexOf('const ZYREX_ATTACK_BANKS', S));
const m = /\n  skybeam: \{/.exec(B);
const n = /\n  [a-z_0-9]+: \{/.exec(B.slice(m.index + 10));
const blk = B.slice(m.index, m.index + 10 + n.index);
const table = (field, from = 0) => {
  const at = blk.indexOf(field, from);
  const rr = /\[\[[-\d,\s]+\](?:\s*,\s*\[[-\d,\s]+\]){3}\]/g;
  rr.lastIndex = at;
  const out = [];
  for (let k = 0; k < 4; k++) out.push(JSON.parse(rr.exec(blk)[0]));
  return out;
};
const arr = f => JSON.parse(new RegExp(f + ':\\s*(\\[[^\\]]+\\])').exec(blk)[1]);

console.log('\n1 · three banks, all present and all on disk');
t('idle / graze / fly all resolve to real files', () => {
  ['skybeam.png', 'skybeam-graze.png', 'skybeam-fly.png'].forEach(f => {
    ok(blk.includes(f.replace('.png', '')), `${f} not referenced`);
    ok(fs.existsSync('assets/2D sprites/zyrex/' + f), `${f} missing from disk`);
  });
});

console.log('\n2 · every frame is reachable (this is what "invisible" was)');
t('no source rect resolves off the sheet', () => {
  const banks = { bboxes: table('bboxes:'), runBboxes: table('runBboxes:'),
                  flyAll: table('bboxes:', blk.indexOf('flyAll')) };
  for (const [name, BB] of Object.entries(banks)){
    ok(BB.length === 4 && BB.every(r => r.length === 4), `${name} is not 4x4`);
    BB.forEach((row, r) => row.forEach((b, c) => {
      const sx = c * 313 + b[0], sy = r * 313 + b[1];
      ok(sx < 1254 && sy < 1254,
         `${name} r${r}c${c} reads (${sx},${sy}) on a 1254px sheet · INVISIBLE`);
      ok(b[2] > 100 && b[3] > 100, `${name} r${r}c${c} degenerate ${b}`);
    }));
  }
});

console.log('\n3 · he is the same size turning, and starting to move');
t('rowRefBh holds every facing at one height, in both banks', () => {
  const TILE = 48, MUL = 1.20;
  const idle = table('bboxes:'), graze = table('runBboxes:');
  const ri = arr('rowRefBh'), rg = arr('runRowRefBh');
  ok(ri.length === 4 && rg.length === 4, 'a reference array is not per-row');
  const draw = (BB, R) => BB.map((row, r) => Math.round(row[0][3] * (TILE * 2) / R[r] * MUL));
  const a = draw(idle, ri), b = draw(graze, rg);
  // ★ turning must not resize him
  ok(Math.max(...a) - Math.min(...a) <= 1, `idle varies ${Math.max(...a)-Math.min(...a)}px across facings: ${a}`);
  ok(Math.max(...b) - Math.min(...b) <= 1, `graze varies ${Math.max(...b)-Math.min(...b)}px across facings: ${b}`);
  // ★ and neither must starting to move
  a.forEach((v, i) => ok(Math.abs(b[i] / v - 1) < 0.02,
    `facing ${i}: idle ${v}px vs graze ${b[i]}px · ${((b[i]/v-1)*100).toFixed(0)}% jump on start-moving`));
});
t('each bank references ITS OWN measured bodies', () => {
  // the mistake this catches: handing one bank the other bank's row heights,
  // which reads as "make them share a divisor" and is not what normalising means
  const idle = table('bboxes:'), graze = table('runBboxes:');
  arr('rowRefBh').forEach((v, r) => ok(v === idle[r][0][3],
    `rowRefBh[${r}] = ${v} but the idle sheet's row-${r} body is ${idle[r][0][3]}`));
  arr('runRowRefBh').forEach((v, r) => ok(v === graze[r][0][3],
    `runRowRefBh[${r}] = ${v} but the graze sheet's row-${r} body is ${graze[r][0][3]}`));
});

console.log('\n4 · the opt-in cannot move anything else');
t('rowRefBh is absent everywhere else, and falls back cleanly', () => {
  const uses = [...B.matchAll(/rowRefBh/g)].length;
  ok(uses <= 4, `rowRefBh appears ${uses} times · only skybeam should declare it`);
  const draw = H.slice(H.indexOf('const _refs = _useFlee'), H.indexOf('const _refs = _useFlee') + 1200);
  ok(/_refs && _refs\[row\]/.test(H), 'the draw does not guard a missing reference');
  ok(/: maxBh;/.test(H), 'no fallback to the v0.95.890 single divisor');
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
