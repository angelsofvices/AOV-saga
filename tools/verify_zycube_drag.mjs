// ★★★★ v0.99.52 · THE ZYCUBE DRAG · stuck ghosts, and a ghost that left the box.
//
//   Creator, 2026-09-25: "the drag and drop items to sort them is buggy. items
//   stay stuck fixed on screen even when u release them. they should stay
//   contained in the zycube panel."
//
// ★★★★ THE 1-SECOND TICK WAS EATING THE DRAG. paintZycellNav() runs on a
//   1000ms interval while the phone is open and ends in paintZycellContent(),
//   which replaces #zycellContent's innerHTML — destroying #zyBagList and every
//   listener bound to it. So once a second, mid-drag, the element holding the
//   pointerup handler stopped existing:
//     · endDrag never ran
//     · the ghost, which was appended to document.body, was never removed
//     · setPointerCapture's target was gone, so capture lapsed silently
//   "Items stay stuck fixed on screen even when u release them" is exactly
//   that — the release had nowhere left to land. And because nothing else ever
//   removes a ghost, it stayed for the rest of the session.
//
// ★★★★ THREE FIXES, AND THEY ARE NOT REDUNDANT:
//     1 · the repaint FREEZES while a drag is live      — the cause
//     2 · release is caught on WINDOW, not on the list  — the symptom, for any
//         future repaint path this guard does not cover
//     3 · every paint SWEEPS orphan ghosts              — self-healing, because
//         a ghost that outlives its drag has no second release coming
//   A drag that survives a repaint is worth having even if the freeze holds.
//
// ★★★ AND THE GHOST IS PARENTED TO THE PANEL AND CLAMPED TO IT, which is the
//   second half of the report: it was position:fixed on document.body and
//   followed the cursor across the phone frame, over the canvas and off the
//   edge of the screen.
//
// ★★ This is DOM behaviour, so the suite reads the wiring rather than driving
//   a pointer — there is no layout in the harness. Every assertion is written
//   against the specific failure mode it guards, and the probes below prove
//   each one goes red when its fix is removed.
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';

let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['zycubeDragLive','zycubeSweepGhosts','paintZycellContent',
  'zycubeMoveItem','player','game','renderZycellZycube'] });
console.log = _L;

const SRC  = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
// ★★★ COMMENTS STRIPPED FIRST. My own rule, broken twice this month: an
//   absence check that reads prose will happily find the thing it is looking
//   for inside a comment explaining why the thing is not there.
const CODE = SRC.replace(/^\s*\/\/.*$/gm, '');
const i0   = CODE.indexOf("let drag = null;");
const DRAG = CODE.slice(i0, CODE.indexOf("list.addEventListener('click'", i0));

H('★★★★ THE REPAINT FREEZES WHILE A DRAG IS LIVE · the cause');
{
  ok(typeof G.zycubeDragLive === 'function', 'zycubeDragLive() exists');
  const pi = CODE.indexOf('function paintZycellContent()');
  const head = CODE.slice(pi, pi + 420);
  ok(/if \(zycubeDragLive\(\)\) return;/.test(head),
     '★★★★ paintZycellContent bails out early while a drag is live · it is the function that replaces the innerHTML the drag is bound to');
  ok(/game\._zyDragLive = true/.test(DRAG),
     '★★★ the flag is raised when the drag goes live · not on pointerdown, which would freeze the panel on every tap');
  ok(/game\._zyDragLive = false/.test(DRAG),
     '★★★★ and lowered when it ends · a flag that only ever goes up freezes the phone for the rest of the session');
  // driven: the guard really does stop a paint
  G.game._zyDragLive = true;
  let threw = false;
  try { G.paintZycellContent(); } catch(_){ threw = true; }
  ok(!threw, '★★ and calling it while live is a safe no-op rather than a throw');
  G.game._zyDragLive = false;
  ok(G.zycubeDragLive() === false, '★★ the predicate reads the flag back');
}

H('★★★★ RELEASE IS CAUGHT ON THE WINDOW · the symptom, belt and braces');
{
  // ★★★★ A listener bound to #zyBagList dies with it. That is not a
  //   hypothetical: the 1s repaint replaced that element once a second.
  ok(/window\.addEventListener\('pointerup', endDrag\)/.test(DRAG),
     '★★★★ pointerup is bound to WINDOW · release has to be caught somewhere that outlives the panel');
  ok(/window\.addEventListener\('pointercancel'/.test(DRAG),
     '★★★ pointercancel too · a cancelled touch is a release that never arrives');
  ok(/window\.addEventListener\('blur'/.test(DRAG),
     '★★★ and blur · alt-tabbing mid-drag has no release coming either');
  ok(!/list\.addEventListener\('pointerup'/.test(DRAG),
     '★★★★ and NOTHING is still bound to the list for the end of a drag · leaving one there is the bug, back again');
  ok(/list\.addEventListener\('pointerdown'/.test(DRAG),
     '★★ the START stays on the list · it must only begin on a slot, and the list is the thing that has slots');
}

H('★★★★ A GHOST CANNOT SURVIVE · every paint sweeps');
{
  ok(typeof G.zycubeSweepGhosts === 'function', 'zycubeSweepGhosts() exists');
  ok(/data-zyghost/.test(DRAG),
     '★★★★ the ghost is TAGGED · a sweep can only remove what it can find, and a bare clone looks like a real slot');
  ok(/zycubeSweepGhosts\(\)/.test(DRAG),
     '★★★ endDrag sweeps as well as removing its own · the stuck one is always somebody else\'s');
  const si = CODE.indexOf('function zycubeSweepGhosts');
  const sweep = CODE.slice(si, CODE.indexOf('\n}', si));
  ok(/querySelectorAll\('\[data-zyghost="1"\]'\)/.test(sweep) && /\.remove\(\)/.test(sweep),
     '★★★★ and it removes every tagged node in the document, not just one');
  ok(/try \{/.test(sweep),
     '★★ guarded · a sweep that throws on a headless boot would take the paint with it');
  let threw = false;
  try { G.zycubeSweepGhosts(); } catch(_){ threw = true; }
  ok(!threw, '★★ calling it with no document and no ghosts is a no-op');
}

H('★★★★ THE GHOST STAYS IN THE PANEL · "they should stay contained"');
{
  ok(!/document\.body\.appendChild\(gh\)/.test(DRAG),
     '★★★★ the ghost is NOT appended to document.body any more · that is what let it wander over the canvas');
  ok(/panel\(\)\.appendChild\(gh\)/.test(DRAG),
     '★★★★ it is parented to the ZyCube panel instead');
  ok(/const panel = \(\) => document\.getElementById\('zycellContent'\)/.test(DRAG),
     '★★★ and `panel` resolves live rather than being captured once · the element it names is replaced on every repaint');
  ok(/clampToPanel/.test(DRAG),
     '★★★★ the position is CLAMPED to that panel · parenting alone does not contain a position:fixed node');
  const ci = DRAG.indexOf('const clampToPanel');
  const clamp = DRAG.slice(ci, DRAG.indexOf('};', ci));
  ok(/getBoundingClientRect/.test(clamp),
     '★★★ against the panel\'s live rect · the phone is fullscreen and resizes with the window');
  ok(/p\.right\s*-\s*w/.test(clamp) && /p\.bottom\s*-\s*h/.test(clamp),
     '★★★★ and it accounts for the ghost\'s own WIDTH and HEIGHT · clamping the top-left alone lets the far edge hang out of the box');
  ok(/Math\.max\(p\.left/.test(clamp) && /Math\.max\(p\.top/.test(clamp),
     '★★★ both near edges are clamped too · a drag upward off the top is as broken as one off the bottom');
  ok(/drag\.ghost\.style\.left = cl/.test(DRAG) && /drag\.ghost\.style\.top  = ct/.test(DRAG),
     '★★★★ and pointermove writes the CLAMPED values · computing them and then using the raw ones is the bug with extra steps');
}

H('★★★ THE FEATURE STILL WORKS · the fix did not eat the verb');
{
  // ★★★ THE 6px THRESHOLD IS WHAT KEEPS X/CLICK ALIVE. Without it every press
  //   becomes a zero-distance drag and USING an item stops working.
  ok(/const DEAD = 6;/.test(DRAG), '★★★★ the 6px dead zone is intact · without it every tap becomes a drag and USE dies');
  ok(/if \(!d\.live\) return;/.test(DRAG), '★★★ a sub-threshold press still falls through to click');
  ok(/list\._zySwallow = Date\.now\(\)/.test(DRAG),
     '★★★ and the post-drag click is still swallowed · otherwise the drop also USES the item you just moved');
  ok(/zycubeMoveItem\(d\.key, dst\)/.test(DRAG), '★★★ the drop still reorders through zycubeMoveItem');
  // and the reorder itself is untouched
  G.player.items = { potion: 3, ale: 2, berry: 5, gem_red: 1 };
  G.player.bagOrder = null;
  G.renderZycellZycube();
  const moved = G.zycubeMoveItem('potion', 'berry');
  ok(moved === true, '★★★★ driven: moving potion onto berry returns true');
  const order = (G.player.bagOrder || []);
  ok(order.indexOf('potion') > -1 && order.indexOf('berry') > -1,
     `★★★ and both keys are in the saved order (${order.slice(0, 5).join(', ')}) · the sort survives the session`);
  ok(G.zycubeMoveItem('potion', 'potion') === false,
     '★★ dropping an item on itself is refused · it is not a move, and it would write a pointless order');
  ok(G.zycubeMoveItem('nope_not_real', 'berry') === false,
     '★★ and an unknown key is refused rather than corrupting the order');
}

console.log(f ? `\n❌ ${f} failed`
  : '\n✅ the repaint freezes mid-drag · release caught on window · ghosts tagged and swept · clamped inside the panel');
process.exit(f ? 1 : 0);
