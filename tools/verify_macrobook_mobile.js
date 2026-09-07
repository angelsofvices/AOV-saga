#!/usr/bin/env node
/* verify_macrobook_mobile.js · v0.96.18
 *
 *   Creator: "make sure that the guidebook is full screen on mobile... all
 *   graphs and image container should have full images previewable. no scroll
 *   needed in containers. optimize for both mobile and console. also, make sure
 *   the navigate header UI is always there so we can jump to different
 *   guidebook chapters. hides when scrolling down but comes back if scroll up."
 */
const fs = require('fs'), path = require('path');
const H = fs.readFileSync(path.join(__dirname, '..', 'macrobook.html'), 'utf8');
let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);
console.log('\n=== MACROBOOK · MOBILE + CONSOLE ===\n');

/* the ≤900px block is the mobile contract · read IT, not the whole file */
const mq = H.slice(H.indexOf('@media (max-width:900px){\n  .chapbar{'));
const mobile = mq.slice(0, mq.indexOf('\n}\n') + 3);

/* ── 1 · nothing scrolls inside itself ─────────────────────────────── */
t(/\.tablewrap\{\s*overflow-x:visible/.test(mobile),
  '★★ tables no longer scroll inside themselves · a keyhole you drag sideways '
  + 'gives no hint there is more to the right, so half the type chart was '
  + 'invisible on a phone and looked complete');
t(/\.figscroll\{\s*overflow-x:visible/.test(mobile),
  '★★ diagrams no longer scroll inside themselves');
t(/table-layout:fixed; width:100%/.test(mobile),
  '  · and the tables REFLOW to fit rather than being clipped · fixed layout + '
  + 'word-break is what makes overflow:visible safe instead of just spilling');
t(/img, svg, canvas\{ max-width:100%; height:auto; \}/.test(mobile),
  '★ every image caps at the viewport and keeps its aspect · [[image-never-stretch-console-fullscreen]]');

/* ── 2 · full-bleed reading ────────────────────────────────────────── */
t(/\.col\{padding:0 16px; max-width:none\}/.test(mobile),
  '★★ the 74ch desktop measure is lifted on mobile · it left the text in a '
  + 'narrow strip with the panel borders off-screen');
t(/viewport-fit=cover/.test(H) && /env\(safe-area-inset-top\)/.test(H),
  '★ safe-area aware · the fixed bar clears a notch instead of hiding under it');
t(/scroll-margin-top:calc\(64px \+ env\(safe-area-inset-top\)\)/.test(mobile),
  '★★ anchor jumps clear the fixed bar · without this every chapter link lands '
  + 'with its own heading hidden behind the thing you tapped');

/* ── 3 · the chapter bar exists, hides down, returns up ────────────── */
t(/\.chapbar\{ display:none; \}/.test(H) && /\.chapbar\{\s*\n\s*display:block; position:fixed/.test(H),
  '★ the bar is mobile-only · desktop already has the pinned rail');
t(/\.chapbar\.hid\{ transform:translateY\(-115%\); \}/.test(H),
  '★★ hidden by TRANSFORM, not display · it animates, and it never reflows the page');
t(/dy >  THRESH\)  bar\.classList\.add\('hid'\)/.test(H)
  && /dy < -THRESH\)  bar\.classList\.remove\('hid'\)/.test(H),
  '★★★ down hides · up reveals · exactly what was asked for');
t(/if \(y <= TOP_ZONE\)      bar\.classList\.remove\('hid'\)/.test(H),
  '★★ and it is ALWAYS shown near the top · otherwise a rubber-band bounce at '
  + 'the top of the page reads as "scrolling down" and hides the bar on a page '
  + 'that has not moved');
t(/if \(y < 0\) y = 0;/.test(H),
  '★ iOS overscroll clamped · negative pageYOffset is real on Safari and would '
  + 'flap the bar');
t(/requestAnimationFrame/.test(H) && /ticking/.test(H) && /passive: true/.test(H),
  '★ rAF-throttled, passive listener · scroll handlers are the classic way to '
  + 'make a long document feel broken on a phone');

/* ── 4 · ONE chapter list ──────────────────────────────────────────── */
t(/nav\.querySelectorAll\('a'\)/.test(H),
  '★★★ the bar is BUILT FROM #nav · nine chapters written twice is nine chances '
  + 'for the rail and the bar to disagree, and the stale one is always the one '
  + 'you are not looking at');
const hardcoded = (H.match(/class="chapbar"/g) || []).length;
t(hardcoded === 0,
  `★ no hand-authored .chapbar markup in the document (${hardcoded}) · it is '
  + 'generated, so it cannot drift`);

/* ── 5 · the highlight follows in BOTH renderings ──────────────────── */
t(/querySelectorAll\('#nav a, \.chapbar a'\)/.test(H),
  '★★ one IntersectionObserver drives the rail and the bar');
t(/\(map\[id\] = map\[id\] \|\| \[\]\)\.push\(a\)/.test(H),
  '★★ the map holds an ARRAY per chapter · it used to hold one link, and '
  + 'assigning the second rendering over the first would have silently left '
  + 'the rail dead on mobile');
t(/inline: 'center'/.test(H),
  '★ the active chip scrolls itself into view · a highlight off the end of the '
  + 'strip tells you nothing');

/* ── 6 · the bar must not sit under the hamburger ──────────────────── */
t(/padding:9px 62px 9px 12px/.test(mobile),
  '★★ right padding reserves the corner the menu button occupies (top:14px '
  + 'right:14px) · measured against that rule, not guessed');
const zBar = (H.match(/\.chapbar\{[\s\S]{0,400}?z-index:(\d+)/) || [])[1];
t(zBar && +zBar < 150,
  `★★ the bar (z-index ${zBar}) sits UNDER the drawer backdrop (150) and drawer `
  + '(180) · a nav bar floating above the open menu would be unreachable junk');

/* ── 7 · the rail still clears the fixed bar ───────────────────────── */
t(/\.rail\{position:static;[\s\S]{0,160}padding:calc\(20px \+ 46px \+ env\(safe-area-inset-top\)\)/.test(mobile),
  '★★ the rail masthead is pushed down by the bar height · otherwise the very '
  + 'first thing on the page is printed underneath it');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
