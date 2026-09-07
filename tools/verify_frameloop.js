#!/usr/bin/env node
/* verify_frameloop.js · v0.96.4
 *
 *   Creator: "game freeze here. I talked to auraxion and walked away. I see a
 *   pattern. freezing after npc dialogue and walking"
 *
 * ★★★ `requestAnimationFrame(frame)` was the LAST STATEMENT of the frame body
 *   with no try/finally. A throw anywhere above it did not skip a frame — it
 *   never asked for the next one. The loop stopped forever, the canvas kept
 *   showing the last painted frame, and the game looked hung while actually
 *   being dead. This suite proves the loop now survives its own bugs.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync('/tmp/all.js', 'utf8');
const H = fs.readFileSync(path.join(ROOT, 'rp7b.html'), 'utf8');
let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   · ' + m); };
const no = m => { fail++; console.log('  FAIL · ' + m); };
const t = (c, m) => c ? ok(m) : no(m);

console.log('\n=== FRAME LOOP SURVIVAL + STUCK WATCHDOG · v0.96.4 ===\n');

/* ── the headless shell ─────────────────────────────────────────────────── */
const noop = () => {};
const _Q = [], KEYDOWN = [];
let RAF = 0;
global.setInterval = () => 0;
global.setTimeout = fn => { _Q.push(fn); return 0; };
global.clearInterval = noop; global.clearTimeout = noop;
const CTX = new Proxy({}, { get: (_, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop: noop });
  if (k === 'getImageData') return () => ({ data: [], width: 0, height: 0 });
  if (k === 'canvas') return { width: 960, height: 540 };
  return () => {};
} });
const _els = new Map();
const mk = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  width: 960, height: 540, value: '', textContent: '', innerHTML: '', children: [], childNodes: [],
  getContext: () => CTX, appendChild: noop, removeChild: noop, addEventListener: noop, removeEventListener: noop,
  setAttribute: noop, getAttribute: () => null, focus: noop, remove: noop, replaceChildren: noop,
  insertBefore: noop, contains: () => false, closest: () => null, cloneNode(){ return mk(); },
  play: () => Promise.resolve(), pause: noop, querySelector: () => mk(), querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540 }) });
const elFor = id => { if (!_els.has(id)) _els.set(id, mk()); return _els.get(id); };
global.addEventListener = (ty, fn) => { if (ty === 'keydown' && typeof fn === 'function') KEYDOWN.push(fn); };
global.removeEventListener = noop;
global.document = { getElementById: elFor, querySelector: () => mk(), querySelectorAll: () => [],
  createElement: () => mk(), addEventListener: noop, body: mk(), documentElement: mk(), head: mk(),
  hidden: false, visibilityState: 'visible', hasFocus: () => true };
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.Audio = function () { return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, volume: 1, currentTime: 0, cloneNode(){ return Object.assign({}, this); } }; };
global.Image = function () { return { addEventListener: noop, complete: true, naturalWidth: 1254, src: '' }; };
// ★ COUNT the re-requests · that number is the whole question
global.requestAnimationFrame = () => { RAF++; return 1; };
global.cancelAnimationFrame = noop;
global.matchMedia = () => ({ matches: false, addEventListener: noop, addListener: noop });
global.navigator = { userAgent: 'node', getGamepads: () => [], maxTouchPoints: 0 };
let T = 1000;
global.performance = { now: () => T };
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

const LOG = console.log;
const ERRS = [];
console.log = () => {};
console.warn = noop;
console.error = (...a) => ERRS.push(a.join(' '));
new Function(src + `;globalThis.__C={ frame, game, player, NPCS, keys, tryMove, forceUnstick,
  get dialogState(){return dialogState}, set dialogState(v){dialogState=v},
  get homeBuyConfirm(){return homeBuyConfirm}, set homeBuyConfirm(v){homeBuyConfirm=v},
  get settingsMenuOpen(){return settingsMenuOpen},
  drawMinimap, STUCK_WARN_MS };`)();
let n = 0;
while (_Q.length && n < 80) { const f = _Q.shift(); n++; try { f(); } catch (_) {} }
console.log = LOG;
const C = globalThis.__C;
C.game.scene = 'overworld';
C.player.x = 42; C.player.y = 49;

/* ── 1 · the shape of the fix ───────────────────────────────────────────── */
t(/finally \{ requestAnimationFrame\(frame\); \}/.test(H),
  '★★★ the rAF re-request lives in a `finally` · it is now the one statement that '
  + 'runs no matter what the frame did');
t((H.match(/requestAnimationFrame\(frame\)/g) || []).length === 2,
  '  · and there is exactly ONE re-request site (plus the comment naming it) · two '
  + 'would double the frame rate and halve every dt in the game');

/* ── 2 · ★★★ DRIVEN · a frame that throws must not end the game ─────────── */
{
  RAF = 0;
  for (let i = 0; i < 5; i++) { T += 16; C.frame(T); }
  const clean = RAF;
  t(clean === 5, `a clean frame re-requests exactly once each (${clean}/5)`);

  // Break something the frame body genuinely touches, mid-run.
  const victim = C.NPCS.find(x => x && x.scene === 'overworld');
  const realTileX = Object.getOwnPropertyDescriptor(victim, 'tileX');
  Object.defineProperty(victim, 'tileX', {
    configurable: true,
    get(){ throw new Error('SYNTHETIC · exploding NPC field'); },
  });
  RAF = 0; ERRS.length = 0;
  for (let i = 0; i < 10; i++) { T += 16; C.frame(T); }
  // ★ >= not ==: some in-frame animations own their own rAF, so the count can
  //   exceed one per frame. The question is only whether it ever reaches ZERO.
  t(RAF >= 10,
    `★★★ ten frames threw and every one of them still requested the next (${RAF} re-requests) · `
    + 'before v0.96.4 the FIRST throw was terminal: rAF was the last statement of '
    + 'the body, so it never ran, the loop stopped forever, and the canvas kept '
    + 'showing the last painted frame. Every "game froze" screenshot this session '
    + 'is a complete, correct world that had been dead since one exception');
  t(ERRS.length >= 1 && /FRAME THREW/.test(ERRS[0]),
    '★ and the first occurrence is reported loudly, with the message');
  t(ERRS.filter(e => /FRAME THREW ·/.test(e)).length === 1,
    '★★ but only ONCE · a fault that throws at 60fps would bury its own first '
    + 'occurrence under a thousand identical lines within twenty seconds');
  t(!!C.game._lastFrameError && C.game._lastFrameError.hits === 10,
    `  · while game._lastFrameError still counts every hit (${C.game._lastFrameError && C.game._lastFrameError.hits})`);

  if (realTileX) Object.defineProperty(victim, 'tileX', realTileX);
  else { delete victim.tileX; victim.tileX = 42; }
  RAF = 0;
  for (let i = 0; i < 3; i++) { T += 16; C.frame(T); }
  t(RAF === 3, '★ and it keeps running normally once the fault is gone · no latched failure state');
}

/* ── 3 · the stuck watchdog names the reason ────────────────────────────── */
{
  const press = (key) => { const ev = { key, repeat: false, preventDefault: noop, stopPropagation: noop };
    for (const f of KEYDOWN) { try { f(ev); } catch (_) {} } };
  C.dialogState = { lines: ['hello'], i: 0 };
  C.keys['arrowdown'] = true;
  C.tryMove._stuckSince = null; C.tryMove._stuckTold = 0; C.tryMove._lastReason = '';
  C.tryMove(16);
  t(C.tryMove._stuckSince != null,
    '★ holding a direction while blocked starts the stuck clock');
  T += C.STUCK_WARN_MS + 200;
  C.tryMove(16);
  t(!!C.game._stuckBanner && /dialog/.test(C.game._stuckBanner.why),
    `★★★ after ${C.STUCK_WARN_MS}ms it NAMES the blocker on screen ("${C.game._stuckBanner && C.game._stuckBanner.why}") · `
    + 'this list has always been complete and always been right, it just said so '
    + 'to a console nobody was watching while three freezes went out as screenshots');
  // ★ and it stays quiet when you are simply reading
  C.keys['arrowdown'] = false;
  C.game._stuckBanner = null; C.tryMove._stuckSince = null; C.tryMove._stuckTold = 0;
  T += 9000; C.tryMove(16);
  t(!C.game._stuckBanner,
    '★★ silent when no direction is held · a dialogue you are READING blocks '
    + 'movement too, and shouting about that is noise. The signal is "I am '
    + 'pressing a direction and nothing happens"');

  /* ── 4 · F10 unsticks ─────────────────────────────────────────────────── */
  C.dialogState = { lines: ['x'], i: 0 };
  C.game.zphoneOpen = true;
  C.game.bagPanelOpen = true;
  const cleared = C.forceUnstick();
  t(!C.dialogState && !C.game.zphoneOpen && !C.game.bagPanelOpen,
    `★★★ forceUnstick() clears every input-owning state (${cleared.join(', ')}) · any `
    + 'one of them left set is an unrecoverable freeze whose only exit is a reload, '
    + 'which costs the player everything since the last save');
  t(cleared.includes('dialog') && cleared.includes('zphoneOpen'),
    '  · and it REPORTS what it cleared, so the freeze still gets diagnosed');
  // ★ SCOPE IT. A bare indexOf for `if (homeBuyConfirm){` finds the MOUSE handler
  //   1,300 lines earlier and reports the order backwards — the same
  //   occurs-more-than-once trap that has now bitten four suites in this repo.
  {
    const f10 = H.indexOf("if (k === 'f10')");
    const disp = H.indexOf('if (homeBuyConfirm){', f10);   // ★ search FROM f10
    t(f10 > 0 && disp > f10 && disp - f10 < 400,
      '★★ F10 is dispatched ABOVE every other branch in the real keydown handler · '
      + 'the point of an escape hatch is that it works when something below has '
      + 'taken input hostage');
    // ★ and it is inside the MAIN handler, not some sub-menu's
    // ★ walk back to the nearest listener registration and confirm it is the
    //   top-level game handler, not a sub-menu's own temporary one.
    const before = H.slice(0, f10);
    const reg = before.lastIndexOf("addEventListener('keydown'");
    t(reg > 0 && /addEventListener\('keydown', e => \{\s*\n\s*const k = e\.key\.toLowerCase\(\);/
        .test(H.slice(reg, reg + 120)),
      '  · registered on the main game keydown listener, right after the key is read');
  }
  const again = C.forceUnstick();
  t(again.length === 0, '  · and it is a no-op when nothing is stuck');
  t(/homeBuyConfirm'\)/.test(H) || /freezeReasons\.push\('homeBuyConfirm'\)/.test(H),
    '★ the purchase confirm is itself a declared freeze reason now · a modal that '
    + 'owns input and is not on that list is a freeze the watchdog cannot name');
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
