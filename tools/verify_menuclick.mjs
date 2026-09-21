// ★★★ v0.99.2 · THE ZYPHONE CONFIRM CLICK · on X, and only on X.
//
//   Creator, 2026-09-18: "play this sfx when we confirm a button press in the
//   zyphone. only when we click X. keep all other menu button sounds the same."
//
// ★★ THE WHOLE RISK IS SCOPE CREEP. A sound wired one branch too high fires on
//   every cursor move; one branch too low never fires at all; and a sound added
//   to playSFX without joining _UI_SFX is gated off by worldFrozen() — which is
//   ALWAYS true while the phone is open, so it would be silently dropped every
//   single time and look like a broken file.
import fs from 'fs';
import { createRequire } from 'module';
const _allSrc = createRequire(import.meta.url)('./lib/all_src.cjs');
import { bootGame } from './lib/boot_game.mjs';
let f = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) f++; return !!c; };
const H  = t => console.log('\n' + t);
const src = _allSrc();

H('★★ THE FILE IS THERE AND REGISTERED');
{
  ok(fs.existsSync('audio/sfx-menu-click.mp3'), 'audio/sfx-menu-click.mp3 exists on disk');
  ok(/menuClick:\s*new Audio\('audio\/sfx-menu-click\.mp3'\)/.test(src), 'registered in AUDIO.sfx as menuClick');
  ok(/AUDIO\.sfx\.menuClick\.volume = 0\.38/.test(src),
     '★ and mixed under the default 0.55 · it layers beneath whatever the pressed control plays');
}

H('★★★★ IT MUST BE IN _UI_SFX OR IT NEVER PLAYS');
{
  // playSFX: `if (worldFrozen() && !_UI_SFX.has(name)) return;`
  // The phone freezes the world. A UI sound missing from that set is dropped
  // every time and looks exactly like a missing file.
  const set = /const _UI_SFX = new Set\(\[([\s\S]*?)\]\);/.exec(src);
  ok(!!set, 'the _UI_SFX whitelist was found');
  ok(/'menuClick'/.test(set[1]), "★★★ 'menuClick' is whitelisted · the phone opens over a frozen world");
  ok(/worldFrozen\(\) && !_UI_SFX\.has\(name\)/.test(src), '★ and that gate is still the reason it has to be');
}

H('★★★★ EXACTLY ONE CALL SITE, AND IT IS THE X THAT ACTIVATES A CONTROL');
{
  const calls = [...src.matchAll(/playSFX\('menuClick'\)/g)];
  ok(calls.length === 1, `${calls.length} call site · "only when we click X" means one`);
  // the line before it must be the content-focus X branch
  const i = src.indexOf("playSFX('menuClick')");
  // ★ 700 was too short once the call site grew a comment explaining itself —
  //   my own assertion went red on correct code because I sized the window to
  //   the code I had just written rather than to the block it lives in.
  const ctx = src.slice(Math.max(0, i - 1600), i + 200);
  ok(/k === 'a' \|\| k === 'z' \|\| k === 'x' \|\| k === 'enter' \|\| k === ' '/.test(ctx),
     '★★★ it sits inside the X / A / Enter / Space branch');
  ok(/items\[game\._zycellItemIdx\]/.test(ctx),
     '★★★ …the one that takes the FOCUSED CONTROL · i.e. confirming a button press');
  ok(/playSFX\('menuClick'\); \} catch\(_\)\{\} el\.click\(\)/.test(src),
     '★★ and it fires BEFORE el.click() · the press is the cause, not an echo');
  ok(/if \(el\)\{ try \{ playSFX\('menuClick'\)/.test(src),
     '★ guarded on there being something focused · no click sound into an empty panel');
}

H('★★★ THE OTHER X PATH IS NAVIGATION AND KEEPS ITS OLD SOUND');
{
  // On the nav rail, X enters the content pane. That is movement, not a
  // confirmation of a control, and zycellEnterContent already beeps 'cursor'.
  const j = src.indexOf('function zycellEnterContent');
  const fn = src.slice(j, src.indexOf('\n}', j));
  ok(/playSFX\('cursor'\)/.test(fn), "zycellEnterContent still plays 'cursor'");
  ok(!/menuClick/.test(fn), '★★ and NOT the click · entering a panel is not pressing a button');
}

H('★★★ NOTHING ELSE CHANGED · "keep all other menu button sounds the same"');
{
  const G = (() => { const L = console.log; console.log = () => {};
    const g = bootGame({ extra: ['AUDIO','_UI_SFX','playSFX'] }); console.log = L; return g; })();
  ok(!!G.AUDIO.sfx.menuClick, 'menuClick is live in the booted AUDIO table');
  for (const k of ['cursor','confirm','menuOpen','menuClose','doorLock','cancel'])
    ok(!!G.AUDIO.sfx[k], `  ${k} still present and untouched`);
  // ★★★ A FINDING, NOT A FAILURE, AND IT PREDATES THIS CHANGE.
  //   Six names are whitelisted as UI sounds and have no audio behind them.
  //   playSFX warns once per key and returns, so every call is a silent no-op —
  //   which means a REFUSED press (rizerSpend calling 'deny' when the pool is
  //   empty) makes no sound at all. That is the acoustic half of the very
  //   complaint that produced the pending band two versions ago.
  //   ★ Named here rather than fixed here: adding sounds is the Creator's call,
  //     and a suite that quietly grows its scope is a suite nobody trusts.
  const dead = [...G._UI_SFX].filter(k => !G.AUDIO.sfx[k]);
  ok(!dead.includes('menuClick'), `★ menuClick is NOT among the silent keys`);
  console.log(`  ·  note · ${dead.length} whitelisted UI names still have no audio: ${dead.join(', ')}`);
  // the cursor beep must still be the sound of MOVING
  const moves = (src.match(/_zycellPaintFocus\(\); _zycellScrollFocusIntoView\(\); playSFX\('cursor'\)/g) || []).length;
  ok(moves >= 2, `★★ arrow movement still plays 'cursor' at ${moves} sites · unchanged`);
  ok(!/playSFX\('menuClick'\)[\s\S]{0,80}?arrow/.test(src), '★ and no arrow path reaches the click');
}

console.log(f ? `\n❌ ${f} failed` : '\n✅ one click, on the X that confirms a control, audible through the frozen world');
process.exit(f ? 1 : 0);
