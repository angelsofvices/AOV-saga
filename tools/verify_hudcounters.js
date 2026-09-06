// v0.95.961 · the coin/gem counters fit inside their panel art.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const css = H.slice(H.indexOf('#coinHud .coinNum, #gemHud .gemNum{'),
                    H.indexOf('#coinHud .coinNum{ color:'));
const num = k => Number((new RegExp(k + ':\\s*(-?[\\d.]+)px').exec(css) || [])[1]);
const L = num('left'), W = num('width'), T = num('top'), Hh = num('height');
const FS = Number(/font:\s*bold\s+([\d.]+)px/.exec(css)[1]);
// ★ `.06em` is a leading-dot decimal.  The first version's `\.?([\d.]+)`
// swallowed the dot and captured "06", so LS came out as 6 em -- the maths
// then said an 86px plate holds ZERO characters and every fit test failed on
// arithmetic rather than on the CSS.  Capture the dot as part of the number.
const LS = parseFloat(/letter-spacing:\s*(\.?[\d.]+)em/.exec(css)[1]);

console.log('\n1 · the box matches the art, not the element');
t('the digits stay inside the gold frame', () => {
  // panel art is 1752x898 rendered at 218.5x112 under background-size:contain;
  // the gold frame measures 35 -> 185 in CSS px
  ok(L >= 35, `left ${L} starts on or before the frame at 35`);
  ok(L + W <= 185, `right edge ${L + W} runs past the frame at 185`);
  ok(T >= 29 && T + Hh <= 82, `vertical ${T}..${T + Hh} leaves the plate (29..82)`);
});
t('the digits start clear of the icon', () => {
  ok(L >= 86, `left ${L} overlaps the icon, which ends at ~85`);
});
t('it is positioned, not padded', () => {
  // the old rule padded a full-width box and centred in 78..220 -- 18px right
  // of the plate and free to overflow the frame
  ok(/position:\s*absolute/.test(css), 'still laid out by padding');
  ok(!/padding:\s*\d+px\s+0\s+0\s+7[0-9]px/.test(css), 'the old 78px pad survives');
  ok(/white-space:\s*nowrap/.test(css), 'the number could wrap to two lines');
});

console.log('\n2 · every value a player can reach fits');
// Courier New is monospace: a glyph advance is exactly 0.6em, and CSS
// letter-spacing adds after every character.  So the width is arithmetic.
const widthAt = (text, size) => text.length * (0.6 + LS) * size;
const fitted = (text) => { let f = FS; while (f > 9 && widthAt(text, f) > W) f -= 1; return f; };
t('the base size holds a seven-digit total unshrunk', () => {
  // 999,999 coins and 102,573 -- the value in the Creator's screenshot
  ['102,573', '999,999', '4,880'].forEach(v => {
    ok(fitted(v) === FS, `${v} had to shrink at the base size ${FS}px`);
    ok(widthAt(v, FS) <= W, `${v} is ${widthAt(v, FS).toFixed(0)}px in a ${W}px plate`);
  });
});
t('longer totals shrink instead of overflowing', () => {
  ['1,234,567', '12,345,678', '999,999,999'].forEach(v => {
    const f = fitted(v);
    ok(widthAt(v, f) <= W, `${v} still ${widthAt(v, f).toFixed(0)}px wide at ${f}px`);
    ok(f >= 10, `${v} shrank to ${f}px · too small to read`);
  });
});
t('the shrink floor is never reached by a real value', () => {
  // a billion coins is 13 chars with separators · past that the clamp bites
  ok(fitted('999,999,999') > 9, 'the largest plausible total hits the 9px floor');
});

console.log('\n3 · it does not cost frames');
t('re-fitting only happens when the number changes', () => {
  const f = H.slice(H.indexOf('const _fitCounter'), H.indexOf('const _fitCounter') + 1200);
  ok(/_fitFor === text/.test(f),
     'no memo · scrollWidth forces layout, and this runs in the per-frame HUD paint');
  ok(/el\.style\.fontSize = ''/.test(f), 'never resets before measuring · it could only ever shrink');
  ok(/size > 9/.test(f), 'the shrink loop has no floor');
});
t('both counters go through it', () => {
  ok(/_fitCounter\(coinEl\.querySelector\('\.coinNum'\)/.test(H), 'the coin counter bypasses the fit');
  ok(/_fitCounter\(gemEl\.querySelector\('\.gemNum'\)/.test(H), 'the gem counter bypasses the fit');
});
t('portrait does not undo it', () => {
  // ★ there are SEVERAL portrait media blocks; the first is about the canvas.
  // Find the counter override itself rather than assuming which block holds it.
  const i = H.lastIndexOf('#coinHud .coinNum, #gemHud .gemNum{');
  const j = H.indexOf('#coinHud .coinNum, #gemHud .gemNum{');
  ok(i > j, 'no portrait override for the counters · mobile keeps the desktop size');
  const blk = H.slice(i, i + 220);
  ok(!/padding:/.test(blk.slice(0, 160)), 'portrait re-pads the box off-centre again');
  const pf = /font-size:\s*(\d+)px/.exec(blk);
  ok(pf && Number(pf[1]) <= FS, `portrait re-inflates the font to ${pf && pf[1]}px`);
});

console.log(`\n   plate ${W}px · base ${FS}px · holds ${Math.floor(W / ((0.6 + LS) * FS))} characters unshrunk`);
console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
