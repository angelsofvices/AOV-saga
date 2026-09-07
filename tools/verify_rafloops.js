#!/usr/bin/env node
/* verify_rafloops.js · v0.96.20
 *
 *   Creator: "just froze in console"
 *
 * ★★★ EVERY SELF-PERPETUATING rAF LOOP MUST RE-ARM FROM A `finally`.
 *   v0.96.4 fixed this in the game's frame loop and I never asked whether the
 *   file had others. It had four, and the gamepad poll — the one loop a console
 *   player depends on for ALL input — was still bare six builds later.
 */
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const H=fs.readFileSync(path.join(ROOT,'rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== rAF LOOPS · none of them may die ===\n');

const code = H.replace(/<!--[\s\S]*?-->/g,'').replace(/^\s*\/\/.*$/gm,'');

/* ── 1 · enumerate the SELF-PERPETUATING loops ─────────────────────── */
// a self-perpetuating loop is one that re-requests ITSELF by name
const selfArm = [...code.matchAll(/requestAnimationFrame\((\w+)\)/g)]
  .map(m => m[1]).filter(n => n !== 'now');
const uniq = [...new Set(selfArm)];
t(uniq.length >= 3,
  `★ ${uniq.length} named rAF loops in the file: ${uniq.join(', ')} · they are not `
  + 'one loop, and a fix to one is not a fix to the others');

/* ── 2 · ★★★ the game frame loop ───────────────────────────────────── */
t(/finally \{ requestAnimationFrame\(frame\); \}/.test(code),
  '★★★ the game loop re-arms in a `finally` (v0.96.4)');

/* ── 3 · ★★★ the GAMEPAD POLL · the console player\'s only input ────── */
t(/finally \{ requestAnimationFrame\(poll\); \}/.test(code),
  '★★★ the gamepad poll re-arms in a `finally` · it was the LAST STATEMENT of '
  + 'poll() with no guard, so one throw killed the controller PERMANENTLY. On a '
  + 'desktop you reach for the keyboard and never file it; on a console the pad '
  + 'is the only input in the room');
t(/function poll\(\)\{?\s*\n?\s*try \{ _pollBody\(\); \}/.test(code)
  || /try \{ _pollBody\(\); \}/.test(code),
  '★★ the body is split out so the guard cannot be stepped past');
t(/function _pollBody\(\)/.test(code),
  '★ _pollBody carries the work');
// the old shape must be GONE
const bareInPoll = /\n    requestAnimationFrame\(poll\);\n  \}\n  requestAnimationFrame\(poll\);/.test(code);
t(!bareInPoll, '★★ the old bare tail-call shape is gone, not merely wrapped');

/* ── 4 · why this loop is unusually exposed ────────────────────────── */
t(/dispatchKey\('keydown'/.test(code),
  '★★★ the pad loop SYNTHESISES key events · so every one of the game\'s own key '
  + 'handlers runs inside this try. A throw in a menu, a dialogue advance or an '
  + 'interact used to kill the pad loop and nothing else — world still animating, '
  + 'HUD still updating, controller simply dead');
t(/recordFlight\(performance\.now\(\), 'padthrow'/.test(code),
  '★★ a pad throw is recorded to the flight recorder');
t(/poll\._hits/.test(code) && /poll\._hits % 300 === 0/.test(code),
  '★ and it is logged once, then every 300 · a per-frame console spam would be '
  + 'its own performance problem');

/* ── 5 · the other recurring loops already guard their bodies ──────── */
// the fountain audio tick
const tickAt = code.indexOf('function tick(){');
if (tickAt > 0){
  const body = code.slice(tickAt, tickAt + 1400);
  t(/try \{/.test(body) && /catch\(_\)\{\}/.test(body),
    '★ the fountain-audio tick wraps its body · its rAF is outside the try, so '
    + 'it re-arms regardless');
}

/* ── 6 · the separate gamepad BOOT file is its own surface ─────────── */
const boot = fs.readFileSync(path.join(ROOT,'aov-gamepad-boot.js'),'utf8');
t(/requestAnimationFrame\(poll\);/.test(boot),
  '★★ aov-gamepad-boot.js runs a SECOND rAF loop, in a separate file none of '
  + 'rp7b.html\'s guards cover · noted so the next audit does not miss it again');
t(/try \{ list = navigator\.getGamepads\(\) \|\| \[\]; \} catch \(_\) \{ return \[\]; \}/.test(boot),
  '★ its pad snapshot is guarded · that loop only paints a banner, so a death '
  + 'there costs a status pill rather than the controller');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
