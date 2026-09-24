// ★★★★ v0.99.36 · HOLD-TO-RESUME on any pre-game screen.
//   Creator, 2026-09-24: "holding mouse on splash screen or intro movie or
//   start screen auto loads recent game. for quick playtest on keyboard and
//   mouse (no dualsense rn remote coding)."
import { bootGame } from './lib/boot_game.mjs';
import fs from 'fs';
import path from 'path';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; };
const H  = t => console.log('\n' + t);
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const src = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
const _L = console.log; console.log = () => {};
const G = bootGame({ extra: ['QUICKLOAD_HOLD_MS','hasSave','loadSavedGame','game','introState'] });
console.log = _L;
const i = src.indexOf('(function wireQuickLoadHold()');
const fn = src.slice(i, src.indexOf('\n})();', i));

H('★★★ IT EXISTS AND IT RESUMES');
{
  ok(i > 0, 'the hold handler is wired');
  ok(/loadSavedGame\(\)/.test(fn),
     '★★★ it calls loadSavedGame() · the same path the LOAD GAME button uses, so it kills the intro video, '
   + 'hides the title buttons and starts the home BGM rather than leaving a half-loaded screen');
  ok(typeof G.QUICKLOAD_HOLD_MS === 'number' && G.QUICKLOAD_HOLD_MS >= 400 && G.QUICKLOAD_HOLD_MS <= 1200,
     `★★ the threshold is ${G.QUICKLOAD_HOLD_MS}ms · long enough that NEW GAME / LOAD GAME still take a normal tap`);
}

H('★★★★ ONE GATE COVERS ALL THREE SCREENS THE CREATOR NAMED');
{
  // ★★★★ Splash, intro video and title buttons are three STATES of
  //   game.scene === 'title' (introState tells them apart), so testing the
  //   scene catches every one without enumerating them — and cannot miss a
  //   fourth if one is added.
  ok(/game\.scene === 'title'/.test(fn),
     "★★★★ it gates on the SCENE, not on introState · enumerating 'idle'/'playing'/'showButtons' would have "
   + 'missed whichever state nobody listed');
  ok(/hasSave\(\)/.test(fn),
     '★★★ and on hasSave() · with no save the hold does nothing rather than offering a resume that cannot happen');
  ok(!/introState/.test(fn), '★★ it does not special-case any single screen');
}

H('★★★★ IT LISTENS WHERE THE CLICK ACTUALLY LANDS');
{
  // ★★★★ The intro <video> and the title's DOM buttons sit ON TOP of the
  //   canvas. A canvas-bound listener would work on the splash and go dead the
  //   moment the movie or the buttons appeared — two of the three screens.
  // ★★ MY FIRST CUT OF THIS MATCHED `canvas.addEventListener(...)` TOO, so it
  //   passed while bound to the one element that cannot see two of the three
  //   screens — the exact defect it exists to catch. Require a BARE call: no
  //   dot before it, i.e. on the global.
  ok(/(?<![.\w])addEventListener\('pointerdown', start, true\)/.test(fn),
     '★★★★ pointerdown on the WINDOW in CAPTURE · the video and the buttons overlay the canvas, so a canvas-bound listener would cover one screen of three');
  ok(/addEventListener\('pointerup', stop, true\)/.test(fn) && /pointercancel/.test(fn),
     '★★★ release and cancel both abort · a hold you cannot back out of is a trap');
  ok(/'blur'/.test(fn),
     '★★ and losing the window aborts · otherwise alt-tabbing mid-hold loads the game behind your back');
  ok(/ev\.button !== 0/.test(fn), '★ right-click does not arm it');
}

H('★★★ A HOLD WITH NO FEEDBACK FEELS LIKE A BROKEN CLICK');
{
  ok(/quickLoadPill/.test(fn) && /quickLoadBar/.test(fn),
     '★★★ it draws a labelled progress bar while held');
  ok(/pointer-events:none/.test(fn),
     '★★ the pill cannot eat the click it is reporting on');
  ok(/requestAnimationFrame/.test(fn) && /cancelAnimationFrame/.test(fn),
     '★ and the frame loop is cancelled on release, not left spinning');
  ok(/if \(!eligible\(\)\)\{ stop\(\); return; \}/.test(fn),
     '★★★ it re-checks eligibility every frame · if the scene changes mid-hold it stands down instead of loading into whatever came next');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ hold anywhere on splash / intro / title with a save present · release, cancel or blur aborts');
process.exit(f ? 1 : 0);
