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
  drawMinimap, STUCK_WARN_MS, showDialog, advanceDialog, clearDialogQueue };`)();
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
    // ★★ v0.96.8 · Cmd+Esc, not F10. Creator: "the force unstick is now cmd+esc
    //    or hold L2 and touchpad for 5 seconds"
    const esc = H.indexOf("if (k === 'escape' && (e.metaKey || e.ctrlKey)){");
    const disp = H.indexOf('if (homeBuyConfirm){', esc);
    t(esc > 0 && disp > esc && disp - esc < 700,
      '★★ the unstick is dispatched ABOVE every other branch in the real keydown '
      + 'handler · the point of an escape hatch is that it works when something '
      + 'below has taken input hostage');
    const before = H.slice(0, esc);
    const reg = before.lastIndexOf("addEventListener('keydown'");
    t(reg > 0 && /addEventListener\('keydown', e => \{\s*\n\s*const k = e\.key\.toLowerCase\(\);/
        .test(H.slice(reg, reg + 120)),
      '  · on the main game keydown listener, right after the key is read');
    // ★★★ THE MODIFIER IS LOad-BEARING
    t(/handleHomeBuyConfirmKey[\s\S]{0,2000}?k === 'b' \|\| k === 'escape'/.test(H)
      || /k === 'b' \|\| k === 'escape'/.test(H),
      '★★★ a BARE Escape is consumed by the modals themselves · so an unstick bound '
      + 'to Escape alone would be eaten by the very panel it exists to clear. The '
      + 'Cmd/Ctrl modifier is what lets it reach the floor');
    t(!/'f10'/.test(H), '★ and F10 is gone · one binding, not two that drift');
    // ── the controller half ──
    t(/const UNSTICK_HOLD_MS = 5000;/.test(H)
      && /if \(l2Held && tpPressed\)\{/.test(H)
      && /prev\._unstickFired = true;/.test(H),
      '★★ L2 + touchpad held five seconds also fires it · a DualSense has no F10 '
      + 'and no Cmd, so a controller-only player had NO escape hatch at all and a '
      + 'frozen game meant reloading the save');
    t(/prev\._unstickSince = 0; prev\._unstickFired = false;/.test(H),
      '  · latched once per hold · without it the toast would fire sixty times a second');
    // ★ and it must not steal the existing tap chord
    const tapIdx = H.indexOf('if (tpPressed && !prev[17]){');
    const holdIdx = H.indexOf('if (l2Held && tpPressed){');
    t(holdIdx > 0 && tapIdx > holdIdx,
      '★★ the five-second hold is evaluated BEFORE the tap chord and does not '
      + 'consume it · the tap is decided at the press (dev panel / send home), the '
      + 'hold only exists after five continuous seconds, which no tap survives');
  }
  const again = C.forceUnstick();
  t(again.length === 0, '  · and it is a no-op when nothing is stuck');
  t(/homeBuyConfirm'\)/.test(H) || /freezeReasons\.push\('homeBuyConfirm'\)/.test(H),
    '★ the purchase confirm is itself a declared freeze reason now · a modal that '
    + 'owns input and is not on that list is a freeze the watchdog cannot name');
}

/* ── 5 · ★★★ THE DOUBLE-JUMP FREEZE ─────────────────────────────────────── */
{
  //   Creator: "look for bug that is freezing game after exiting dialogue or
  //   prompt text UI and running in overworld after."
  C.dialogState = null;
  C.game.scene = 'overworld';
  C.player.x = 42; C.player.y = 49;
  C.keys['arrowdown'] = true;
  C.tryMove._lastReason = '';

  // strand the flag exactly as a lost timer would
  C.player._doubleJump = { t0: T - 10, dur: 300, fromX: 42, fromY: 49, toX: 42, toY: 51 };
  C.tryMove(16);
  t(C.tryMove._lastReason === 'doubleJump',
    '★ mid-flight the double jump legitimately holds the player still');

  T += 2000;                                  // the jump is long over
  C.tryMove(16);
  t(!C.player._doubleJump,
    '★★★ a double-jump flag that OUTLIVED its jump is cleared by the frame · its '
    + 'only clear path was a setTimeout scheduled at take-off and guarded by '
    + '`_doubleJump.t0 !== now`, so anything that reassigns the flag mid-flight '
    + 'makes that timer return early — and menus do exactly that. Miss the clear '
    + 'once and the flag outlives the jump FOREVER: the player lands, looks '
    + 'normal, and simply cannot walk again');
  t(C.player.jumpUntil === 0 && !C.player.jumpSheet,
    '  · and the jump animation clocks are cleared with it, not left running');

  // ★★ the OTHER shape this field takes
  C.player._doubleJump = true;                // three call sites assign booleans
  C.tryMove(16);
  t(!C.player._doubleJump,
    '★★ a BOOLEAN double-jump flag is cleared too · three call sites set this '
    + 'field to `false` rather than null, so a stale `true` from any future edit '
    + 'would be a freeze with no timestamp that could ever expire');

  C.keys['arrowdown'] = false;
}

/* ── 6 · ★★ THE DOM ROUTER CANNOT TAKE THE PAD HOSTAGE ──────────────────── */
{
  t(/function uiPanelModalOpen\(\)/.test(H)
    && /if \(!uiPanelModalOpen\(\)\) \{ _uiNavIdx = 0; return false; \}/.test(H),
    '★★★ the panel router now needs the GAME\'S OWN modal flags, not just a '
    + 'visible element · one condition deciding whether the D-pad walks Rizer or '
    + 'moves a cursor means any panel left visible while the game thinks it is '
    + 'closed eats the arrows forever, which is indistinguishable from a freeze');
  t(/freezeReasons\.push\('uiPanelNav'\)/.test(H),
    '★★ and if it ever DOES swallow, the watchdog can name it · a blocker the '
    + 'watchdog cannot name is the one that costs an afternoon');
  t(/drop\('uiPanels'/.test(H),
    '★ the unstick hides stray panel elements too · clearing a flag without '
    + 'hiding the div leaves a picture of a menu you cannot use');
}

/* ── 7 · ★★★ DIALOGUE QUEUES INSTEAD OF CLOBBERING ──────────────────────── */
{
  const C2 = globalThis.__C;
  C2.dialogState = null;
  try { C2.clearDialogQueue(); } catch(_){}
  C2.showDialog({ speaker: 'CORVAN', lines: ['one', 'two'] });
  C2.showDialog({ speaker: 'THE LOST BOY', lines: ['three'] });
  t(C2.dialogState && C2.dialogState.speaker === 'CORVAN',
    `★★★ the FIRST speaker still holds the box (${C2.dialogState && C2.dialogState.speaker}) · a second `
    + 'showDialog used to overwrite dialogState wholesale. At the Lost Boy '
    + "reunion — where the Creator froze — grantVengrizz() fires showDialog on "
    + "the very next statement, so Corvan's entire reunion speech was discarded "
    + 'before a line of it ever drew');
  C2.advanceDialog(); C2.advanceDialog();
  t(C2.dialogState && C2.dialogState.speaker === 'THE LOST BOY',
    '★★ and finishing the first hands over to the queued second, rather than '
    + 'closing the box on a conversation that was only half said');
  C2.advanceDialog();
  t(!C2.dialogState, '★ then it closes normally');

  // ★ bounded
  C2.dialogState = null; C2.clearDialogQueue();
  for (let i = 0; i < 40; i++) C2.showDialog({ speaker: 'X', lines: ['l'] });
  let depth = 0;
  while (C2.dialogState && depth < 50){ C2.advanceDialog(); depth++; }
  t(depth <= 12,
    `★★ the queue is BOUNDED (${depth} boxes drained of 40 queued) · an unbounded `
    + 'queue turns one runaway loop into a conversation the player cannot escape, '
    + 'which is the exact failure this was meant to prevent');

  // ★★ a throwing onDone cannot strand the box
  C2.dialogState = null; C2.clearDialogQueue();
  C2.showDialog({ speaker: 'X', lines: ['l'], onDone(){ throw new Error('SYNTHETIC onDone'); } });
  let threw = false;
  try { C2.advanceDialog(); } catch (_) { threw = true; }
  t(!threw && !C2.dialogState,
    '★★★ a throwing onDone is caught and the box still closes · it used to take '
    + 'the keypress down with it, and everything it had not yet done stayed '
    + 'undone forever');
}

/* ── 8 · ★★ THE WATCHDOG HEARS ANY KEY ──────────────────────────────────── */
{
  const C2 = globalThis.__C;
  t(/const STUCK_KEY_WINDOW_MS = 2000;/.test(H) && /game\._lastKeyAt = performance\.now\(\)/.test(H),
    '★★★ every keypress is stamped, and the watchdog counts ANY key as "I am '
    + 'trying to play" · it used to listen only for a held DIRECTION, but a player '
    + 'facing a box that will not close mashes X. The one moment he most needed '
    + 'to be told "blocked by: dialog" was the one moment nothing was listening');
  C2.dialogState = { lines: ['x'], idx: 0 };
  C2.keys['arrowdown'] = false;                 // NOT holding a direction
  C2.game._lastKeyAt = T;                       // but just pressed something
  C2.tryMove._stuckSince = null; C2.tryMove._stuckTold = 0; C2.tryMove._lastReason = '';
  C2.game._stuckBanner = null;
  C2.tryMove(16);
  T += C2.STUCK_WARN_MS + 200;
  C2.game._lastKeyAt = T;
  C2.tryMove(16);
  t(!!C2.game._stuckBanner && /dialog/.test(C2.game._stuckBanner.why),
    `★★ mashing X at a stuck box now names the blocker ("${C2.game._stuckBanner && C2.game._stuckBanner.why}")`);
  C2.dialogState = null;
}

console.log(`\n★ ${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
