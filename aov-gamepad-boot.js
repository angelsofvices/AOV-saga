/*
 * AOV™ Saga · Shared Gamepad Bootstrapper (2026-07-27 · v2)
 * ---------------------------------------------------------
 * Fixes "my controller doesn't work on any of the games", with a specific
 * emphasis on desktop browsers (macOS Safari / Chrome / Edge) that are
 * stricter about when they'll enumerate connected gamepads.
 *
 * ROOT CAUSES (multiple, per browser):
 *
 *   1. USER-GESTURE REQUIREMENT (Chrome / Safari / Edge):
 *        navigator.getGamepads() returns [null, null, null, null] until
 *        the page has received a real user gesture (click / keydown /
 *        pointer event).  A background page or a page the user hasn't
 *        touched yet gets an empty pad list.
 *
 *   2. GAMEPAD-INPUT REQUIREMENT:
 *        Even after a user gesture, some browsers hide the pad until it
 *        has sent at least one HID event (button press / stick motion)
 *        that the browser can attribute to this tab.
 *
 *   3. TAB FOCUS REQUIREMENT (Chrome desktop):
 *        Background tabs stop receiving gamepad state.  We watch focus
 *        and re-poll aggressively on regain.
 *
 *   4. macOS BLUETOOTH SINGLE-HOST RULE:
 *        A Bluetooth controller (DualSense, Xbox) can only be paired
 *        with ONE host at a time.  If it's connected to an iPhone, the
 *        MacBook physically cannot see it until the iPhone releases
 *        (or the user re-pairs).  We can't fix that from the browser,
 *        but we surface it clearly in the status text.
 *
 * WHAT THIS VERSION DOES DIFFERENTLY vs v1:
 *   - Distinguishes THREE states in the banner: NO PAD ENUMERATED,
 *     PAD SEEN BUT NO INPUT YET, and READY.  User knows whether the
 *     browser has even noticed the controller.
 *   - Aggressively re-polls on click, keydown, pointer, and window focus
 *     (each of those counts as a user gesture, so `getGamepads()` will
 *     start returning real data immediately after any of them).
 *   - Force-touches `navigator.getGamepads()` inside the click handler
 *     (Chrome sometimes needs the call to happen synchronously in a
 *     gesture callback).
 *   - Logs each state transition to `console.info('[AOV gamepad] ...')`
 *     so the user can open DevTools and see exactly what the browser
 *     thinks is happening.
 *   - macOS-specific hint appears after 6s if still no pad enumerated:
 *     "Not detected — controller may still be paired with another
 *     device.  Re-pair with this MacBook via Bluetooth Settings."
 *
 * PUBLIC SURFACE:
 *   - `window.aovGamepadReady`  → boolean, flips true on first input.
 *   - Event `aov-gamepad-ready` fires on `window` with detail.gamepad.
 *   - Event `aov-gamepad-lost`  fires on disconnect (window).
 *
 * NO INTERFERENCE:
 *   - Idempotent (guarded by `window.__aovGamepadBoot`).
 *   - Per-game pollPad() loops continue independently.
 */
(function aovGamepadBoot() {
  'use strict';
  if (window.__aovGamepadBoot) return;
  window.__aovGamepadBoot = true;
  if (typeof navigator === 'undefined' || !navigator.getGamepads) {
    console.warn('[AOV gamepad] navigator.getGamepads not available — no boot.');
    return;
  }
  // ★ 2026-07-31 · Skip on touch-first devices (phones/tablets).  Users
  // there see the in-game touch controller instead — the "Press any button
  // on your controller" banner just covers content and wastes portrait
  // viewport space.  Bluetooth pads on tablets still work; the per-game
  // pollers keep running, they just have no visible affordance.
  const _touchOnly = typeof window !== 'undefined' && window.matchMedia &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (_touchOnly) { window.aovGamepadReady = true; return; }

  window.aovGamepadReady = false;
  let banner = null;
  let confirmed = false;
  let bannerVisible = false;
  let bannerDismissed = false;   // v0.95.265 · user pressed a key → banner is gone for good
  let bootTime = Date.now();
  let macBTHintShown = false;
  const AXIS_DEAD = 0.35;

  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || '')
             || /Mac OS X/.test(navigator.userAgent || '');

  function log(msg, arg) {
    try { arg !== undefined ? console.info('[AOV gamepad] ' + msg, arg) : console.info('[AOV gamepad] ' + msg); } catch (_) {}
  }

  // --------------------------------------------------------------------
  // Banner
  // --------------------------------------------------------------------
  function ensureBanner() {
    if (banner) return banner;
    banner = document.createElement('div');
    banner.id = 'aov-gamepad-banner';
    banner.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:14px',
      'transform:translateX(-50%)',
      'z-index:99999',
      'padding:8px 14px',
      'background:rgba(10,6,20,0.85)',
      'border:0.5px solid rgba(232,200,120,0.55)',
      'border-radius:999px',
      'color:#f5dc9c',
      'font: 500 11px/1.3 -apple-system, BlinkMacSystemFont, "Segoe UI", "Cinzel", serif',
      'letter-spacing:0.14em',
      'text-transform:uppercase',
      'pointer-events:none',
      'box-shadow:0 4px 24px rgba(0,0,0,0.55)',
      'opacity:0',
      'transition:opacity 260ms ease-out',
      'max-width:90vw',
      'text-align:center',
    ].join(';');
    banner.textContent = '◈ Press any button on your controller';
    document.body.appendChild(banner);
    return banner;
  }
  function setBanner(text, color) {
    const el = ensureBanner();
    el.textContent = text;
    if (color) {
      el.style.color = color;
      el.style.borderColor = color === '#7bed9f'
        ? 'rgba(123,237,159,0.65)'
        : (color === '#ff9c66'
            ? 'rgba(255,156,102,0.60)'
            : 'rgba(232,200,120,0.55)');
    }
  }
  function showBanner() {
    if (bannerVisible || bannerDismissed) return;   // v0.95.265 · respect user dismiss
    const el = ensureBanner();
    bannerVisible = true;
    el.getBoundingClientRect();
    el.style.opacity = '1';
  }
  function hideBanner() {
    if (!banner) return;
    bannerVisible = false;
    banner.style.opacity = '0';
  }
  // v0.95.265 · User pressed a key / clicked → dismiss the "no controller"
  // banner and stop it from re-appearing.  Only applies while no controller
  // has been confirmed — once confirmed the "connected" chip auto-hides
  // via its own timer.  Playtesters on keyboard shouldn't see the pill at all.
  function dismissBanner() {
    if (confirmed) return;
    bannerDismissed = true;
    hideBanner();
    if (banner) { try { banner.remove(); } catch(_) {} banner = null; }
  }
  window.aovGamepadDismissBanner = dismissBanner;   // export for external callers

  // --------------------------------------------------------------------
  // State machine
  // --------------------------------------------------------------------
  function padsSnapshot() {
    // Some browsers return array-like (NodeList / GamepadList), some
    // return plain arrays.  Normalize.
    let list = [];
    try { list = navigator.getGamepads() || []; } catch (_) { return []; }
    const arr = [];
    for (let i = 0; i < list.length; i++) arr.push(list[i]);
    return arr;
  }
  function firstEnumeratedPad() {
    const pads = padsSnapshot();
    for (const p of pads) if (p) return p;
    return null;
  }
  function padHasInput(pad) {
    if (!pad) return false;
    if (pad.buttons) for (const b of pad.buttons) if (b && b.pressed) return true;
    if (pad.axes) for (const a of pad.axes) if (Math.abs(a) > AXIS_DEAD) return true;
    return false;
  }
  function markReady(pad) {
    if (confirmed) return;
    confirmed = true;
    window.aovGamepadReady = true;
    log('READY', pad && pad.id);
    const isDS = /dualsense|wireless controller|054c/i.test((pad && pad.id) || '');
    setBanner('◈ ' + (isDS ? 'DualSense' : 'Controller') + ' connected · ready', '#7bed9f');
    const el = ensureBanner();
    el.getBoundingClientRect();
    el.style.opacity = '1';
    bannerVisible = true;
    setTimeout(() => { hideBanner(); }, 2400);
    try {
      window.dispatchEvent(new CustomEvent('aov-gamepad-ready', {
        bubbles: true,
        detail: { gamepad: pad },
      }));
    } catch (_) {}
  }

  // --------------------------------------------------------------------
  // Poll loop
  // --------------------------------------------------------------------
  function poll() {
    if (!confirmed) {
      const pads = padsSnapshot();
      let anyEnumerated = false;
      for (const pad of pads) {
        if (!pad) continue;
        anyEnumerated = true;
        if (padHasInput(pad)) { markReady(pad); break; }
      }
      // Status text update (only when banner is visible and not yet confirmed).
      if (bannerVisible && !confirmed && !bannerDismissed) {
        if (anyEnumerated) {
          setBanner('◈ Controller detected · press any button');
        } else {
          const waited = Date.now() - bootTime;
          if (isMac && waited > 6000 && !macBTHintShown) {
            macBTHintShown = true;
            setBanner('◇ No controller detected — if using Bluetooth on Mac, controllers can only pair with one device at a time. Re-pair via ▸ Bluetooth Settings.', '#ff9c66');
          } else if (!macBTHintShown) {
            setBanner('◈ Press any button on your controller');
          }
        }
      }
    }
    requestAnimationFrame(poll);
  }

  // --------------------------------------------------------------------
  // User-gesture triggers (Chrome/Safari need these to expose pads)
  // --------------------------------------------------------------------
  function nudge() {
    // Just calling getGamepads() inside a user gesture is often what
    // Chrome needs to start enumerating.
    try { navigator.getGamepads(); } catch (_) {}
    // Also snapshot immediately — if the browser now returns a real pad
    // with input already pressed, we can mark ready synchronously.
    if (!confirmed) {
      const pad = firstEnumeratedPad();
      if (pad && padHasInput(pad)) markReady(pad);
    }
  }
  function attachGestureListeners() {
    ['click', 'pointerdown', 'keydown', 'focus'].forEach((evt) => {
      window.addEventListener(evt, nudge, { capture: true, passive: true });
    });
    // v0.95.265 · Dismiss the "no controller" banner on ANY real user press.
    // Give the nudge() a beat to enumerate a pad first (Chrome may return one
    // synchronously) — if still no pad after 120ms, kill the banner for good.
    // Playtesters on keyboard shouldn't be pestered.
    const dismissOnce = () => {
      setTimeout(() => {
        if (!confirmed) dismissBanner();
      }, 120);
      ['click', 'pointerdown', 'keydown'].forEach((evt) => {
        window.removeEventListener(evt, dismissOnce, { capture: true });
      });
    };
    ['click', 'pointerdown', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, dismissOnce, { capture: true, passive: true, once: false });
    });
  }

  // --------------------------------------------------------------------
  // Boot
  // --------------------------------------------------------------------
  function boot() {
    log('boot · platform=' + (navigator.platform || '?') + ' isMac=' + isMac);
    window.addEventListener('gamepadconnected', (e) => {
      log('gamepadconnected', e.gamepad && e.gamepad.id);
      // Some browsers fire connected before any button press; if input is
      // already present in the pad snapshot, mark ready immediately.
      const pad = e && e.gamepad;
      if (pad) {
        if (bannerVisible && !confirmed) {
          setBanner('◈ Controller detected · press any button');
        }
        if (padHasInput(pad)) markReady(pad);
      }
    });
    window.addEventListener('gamepaddisconnected', (e) => {
      log('gamepaddisconnected', e.gamepad && e.gamepad.id);
      confirmed = false;
      window.aovGamepadReady = false;
      try { window.dispatchEvent(new CustomEvent('aov-gamepad-lost', { bubbles: true })); } catch (_) {}
      setBanner('◈ Press any button on your controller', '#f5dc9c');
      setTimeout(() => { if (!confirmed) showBanner(); }, 800);
    });
    attachGestureListeners();
    requestAnimationFrame(poll);
    setTimeout(() => { if (!confirmed) showBanner(); }, 1200);
    // First-second snapshot in case the browser exposes a pad immediately
    // (Firefox often does).  If input is already held, we mark ready and
    // the banner never fires.
    setTimeout(() => {
      if (confirmed) return;
      const pad = firstEnumeratedPad();
      if (pad && padHasInput(pad)) markReady(pad);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
