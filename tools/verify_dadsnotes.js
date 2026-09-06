// v0.95.969 · Dad's notes · purple page, gold text, and it must be READABLE.
const fs = require('fs');
const H = fs.readFileSync('rp7b.html', 'utf8');
let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + ' · ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const hex = h => [1,3,5].map(i => parseInt(h.slice(i, i+2), 16));
const lin = c => { c /= 255; return c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4; };
const lum = ([r,g,b]) => 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
const ratio = (a, b) => { const [x,y] = [lum(a), lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };

const blk = H.slice(H.indexOf('if (SCROLL_NATIVE_PAGE)'), H.indexOf('img.style.display = \'\';'));
const grab = re => (re.exec(blk) || [])[1];

console.log('\n1 · the page is purple and the text is gold');
t('the background is a purple gradient, not near-black', () => {
  const bg = grab(/stageN\.style\.background\s*=\s*'([^']+)'/);
  ok(bg, 'no background set');
  const stops = [...bg.matchAll(/#([0-9a-f]{6})/gi)].map(m => hex('#' + m[1]));
  ok(stops.length >= 2, 'not a gradient');
  stops.forEach(([r,g,b]) => {
    ok(b > r && r > g, `#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')} is not purple (needs blue > red > green)`);
    ok(lum([r,g,b]) > 0.015, 'a stop is still essentially black');
  });
});
t('body and title are gold', () => {
  const body = grab(/txt\.style\.color\s*=\s*'(#[0-9a-f]{6})'/i);
  const ttl  = grab(/ttl\.style\.color\s*=\s*'(#[0-9a-f]{6})'/i);
  [['body', body], ['title', ttl]].forEach(([n, c]) => {
    ok(c, `${n} colour never set · it inherits the parchment brown`);
    const [r,g,b] = hex(c);
    ok(r > 200 && g > 150 && b < 170, `${n} ${c} is not gold`);
  });
});

console.log('\n2 · it is actually readable · the complaint was legibility');
t('every text/background pair clears WCAG AA, and the body clears AAA', () => {
  const bg = grab(/stageN\.style\.background\s*=\s*'([^']+)'/);
  const stops = [...bg.matchAll(/#([0-9a-f]{6})/gi)].map(m => hex('#' + m[1]));
  const body = hex(grab(/txt\.style\.color\s*=\s*'(#[0-9a-f]{6})'/i));
  const ttl  = hex(grab(/ttl\.style\.color\s*=\s*'(#[0-9a-f]{6})'/i));
  stops.forEach(s => {
    const rb = ratio(body, s), rt = ratio(ttl, s);
    ok(rb >= 7, `body contrast ${rb.toFixed(2)} against a gradient stop · AAA needs 7`);
    ok(rt >= 4.5, `title contrast ${rt.toFixed(2)} · AA needs 4.5`);
  });
});
t('it stays readable at the smallest size the fit pass can reach', () => {
  // the auto-shrink can go to 9px on a long entry; AAA at 7:1 covers small text
  const m = /while \(size > (\d+) && txt\.scrollHeight/.exec(H);
  ok(m, 'the fit loop is gone');
  ok(Number(m[1]) >= 9, `the fit floor is ${m[1]}px · too small to read at any contrast`);
});

console.log('\n3 · the parchment skin is not collaterally damaged');
t('the browns are restored on the art path', () => {
  // both skins share ONE text element, so gold has to be undone or flipping
  // SCROLL_NATIVE_PAGE back leaves gold on light paper
  const art = H.slice(H.indexOf("img.style.display = '';"), H.indexOf("img.style.display = '';") + 900);
  ok(/txt\.style\.color = '#2e2410'/.test(art), 'the parchment body colour is never restored');
  ok(/ttl\.style\.color = '#3a2a12'/.test(art), 'the parchment title colour is never restored');
  ok(/textShadow = 'none'/.test(art), 'the gold text-shadow survives onto parchment');
});
t('the stylesheet defaults are still the parchment browns', () => {
  const css = H.slice(H.indexOf('id="scrollViewTitle"'), H.indexOf('id="scrollViewText"') + 400);
  ok(/color:#3a2a12/.test(css) && /color:#2e2410/.test(css),
     'the base CSS was edited instead of the native branch · the art path loses its colours');
});

console.log(`\n${fail ? '✗' : '★'} ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
