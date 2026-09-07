#!/usr/bin/env node
/* verify_padsticky.js · v0.96.25
 *
 * ★★ SCOPE, STATED HONESTLY: this suite checks the pad poller's INPUT LOGIC by
 *   reading the code, not by driving a gamepad. I tried to drive one — a fake
 *   DualSense through navigator.getGamepads with a hand-pumped rAF — and could
 *   not get the poller's own loop to tick inside the harness. Rather than leave
 *   a red suite or, worse, assert something the harness never actually
 *   exercised, this says what it can prove and stops there.
 *
 * ★★★ v0.96.28 · THE CHANGE THIS SUITE WAS WRITTEN FOR HAS BEEN REVERTED, and
 *   the suite now guards the revert. It broke pause and the phone D-pad.
 *
 * ★★★ AND A CORRECTION THAT MATTERS MORE THAN THE FIX: I built this believing
 *   a stuck held-stick WAS the Creator's freeze, on the strength of a tile
 *   label reading "120 fps". Then he sent Chrome's "Page Unresponsive" dialog,
 *   which means the main thread was BLOCKED — so that 120 was a corpse reading,
 *   frozen at its last value before the thread stopped, and the input theory
 *   was wrong. The real cause was the shadow silhouette cache
 *   (verify_shadowmem.js). The level-trigger change below is still a genuine
 *   latent bug worth fixing; it is simply not what he was hitting.
 */
const fs=require('fs'), path=require('path');
const H=fs.readFileSync(path.join(__dirname,'..','rp7b.html'),'utf8');
let pass=0,fail=0;
const ok=m=>{pass++;console.log('  ok   · '+m);};
const no=m=>{fail++;console.log('  FAIL · '+m);};
const t=(c,m)=>c?ok(m):no(m);
console.log('\n=== PAD POLLER · a held control must survive a key wipe ===\n');
const code=H.replace(/<!--[\s\S]*?-->/g,'').replace(/^\s*\/\/.*$/gm,'');

// ★★★ v0.96.28 · THIS SUITE NOW GUARDS THE REVERT, not the change.
t(!/_keyLost/.test(code),
  '★★★ the level-trigger is GONE · it re-dispatched a keydown whenever the pad '
  + 'said held but `keys` disagreed, and a handler that CONSUMES its key (the '
  + 'pause toggle, the phone D-pad router) clears `keys[k]` as part of doing its '
  + 'job — so the next poll fired again, at 120 Hz. Pause toggled dozens of '
  + 'times a second and one D-pad tap moved five places');
t(/if \(on && !prev\['ax_'\+k\]\) dispatchKey\('keydown', k\);/.test(code),
  '★★ the stick path is edge-triggered · one press, one keydown');
t(/if \(pressed && !prev\[i\]\) dispatchKey\('keydown', key\);/.test(code),
  '★★ and the button path · momentary presses are the whole point of an edge');
t(/else if \(!on && prev\['ax_'\+k\]\) dispatchKey\('keyup', k\)/.test(code)
  && /else if \(!pressed && prev\[i\]\) dispatchKey\('keyup', key\)/.test(code),
  '★★ release still works · a poller that could not release would weld the '
  + 'player into a permanent sprint, which is worse than the bug it fixes');

/* ── why the key table can disagree in the first place ─────────────── */
const wipes=(code.match(/for \(const k+ of Object\.keys\(keys\)\) keys\[k+\] = false;/g)||[]).length;
t(wipes>=2, `★★ ${wipes} places force-clear every held key (the pause gate, the `
  + 'pause menu) · that is legitimate, and it is exactly what the poller had no '
  + 'way to notice');
t(/if \(typeof game === 'object' && game\.paused && !game\.zphoneOpen/.test(code),
  '★ and dispatchKey ALSO returns early while paused, before it can set a key · '
  + 'a second way for the table and the hardware to drift apart');

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail?1:0);
