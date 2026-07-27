/*
 * AOV™ Saga · Shared Gamepad Bootstrapper (2026-07-27)
 * ----------------------------------------------------
 * Fixes the "my controller isn't working on any game" problem.
 *
 * ROOT CAUSE:
 *   Modern browsers (Chrome / Safari / Edge) will NOT expose a gamepad
 *   to navigator.getGamepads() until BOTH:
 *     (a) the page has received a user gesture (click / keypress), AND
 *     (b) the controller has sent at least one button/axis event that
 *         the browser can attribute to this tab.
 *   Firefox is more permissive but still respects the user-gesture rule.
 *   This means every game's polling loop can be running perfectly and
 *   still see [null, null, null, null] indefinitely — until the user
 *   both interacts with the page AND wiggles the stick / taps a button
 *   on the controller.  The games looked broken; they were just waiting.
 *
 * WHAT THIS HELPER DOES:
 *   1. Shows a small, unobtrusive banner at boot: "Press any button on
 *      your controller to activate."  Non-blocking — keyboard + mouse
 *      still work.
 *   2. Runs a lightweight requestAnimationFrame poll that watches every
 *      gamepad slot for the first pressed button / meaningful axis
 *      deflection.
 *   3. On first detection:
 *        - dispatches a `aov-gamepad-ready` CustomEvent (bubbles) with
 *          the gamepad object attached (event.detail.gamepad),
 *        - sets window.aovGamepadReady = true,
 *        - hides the banner and shows a 2-second confirmation flash
 *          ("DualSense ✓" / "Controller ✓").
 *   4. If the browser fires `gamepadconnected` BEFORE any polling — the
 *      helper trusts that, hides the prompt, and marks the pad ready.
 *   5. If the controller disconnects, resets state so a reconnect
 *      re-triggers activation.
 *
 * HOW GAMES USE IT:
 *   - Include this script once, before any game logic:
 *       <script src="/aov-gamepad-boot.js"></script>
 *   - Existing per-game pollPad() loops continue to work — this boot
 *     helper doesn't interfere with them; it just guarantees the browser
 *     has seen a pad event before those loops start returning data.
 *   - Games that want to react to activation can listen:
 *       window.addEventListener('aov-gamepad-ready', (e) => { ... });
 *
 * SAFETY:
 *   - No-op if navigator.getGamepads is missing (very old browsers).
 *   - No-op if run twice (idempotent via window.__aovGamepadBoot flag).
 *   - Respects prefers-reduced-motion for the confirmation flash.
 */
(function aovGamepadBoot() {
  'use strict';
  if (window.__aovGamepadBoot) return;
  window.__aovGamepadBoot = true;
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return;

  window.aovGamepadReady = false;
  let banner = null;
  let confirmed = false;
  let bannerVisible = false;
  const AXIS_DEAD = 0.35;

  function ensureBanner() {
    if (banner) return banner;
    banner = document.createElement('div');
    banner.id = 'aov-gamepad-banner';
    banner.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:14px',
      'transform:translateX(-50%)',
      'z-index:99999',
      'padding:8px 14px',
      'background:rgba(10,6,20,0.82)',
      'border:0.5px solid rgba(232,200,120,0.55)',
      'border-radius:999px',
      'color:#f5dc9c',
      'font: 500 11px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", "Cinzel", serif',
      'letter-spacing:0.14em',
      'text-transform:uppercase',
      'pointer-events:none',
      'box-shadow:0 4px 24px rgba(0,0,0,0.55)',
      'opacity:0',
      'transition:opacity 260ms ease-out',
    ].join(';');
    banner.textContent = '◈ Press any button on your controller to activate';
    document.body.appendChild(banner);
    return banner;
  }

  function showBanner() {
    if (bannerVisible || confirmed) return;
    const el = ensureBanner();
    bannerVisible = true;
    // Force a paint before opacity transition
    el.getBoundingClientRect();
    el.style.opacity = '1';
  }

  function hideBanner() {
    if (!banner) return;
    bannerVisible = false;
    banner.style.opacity = '0';
  }

  function flashConfirmed(pad) {
    const isDS = /dualsense|wireless controller|054c/i.test(pad.id || '');
    const el = ensureBanner();
    el.textContent = (isDS ? '◈ DualSense' : '◈ Controller') + ' connected · ready';
    el.style.color = '#7bed9f';
    el.style.borderColor = 'rgba(123,237,159,0.65)';
    el.getBoundingClientRect();
    el.style.opacity = '1';
    setTimeout(() => {
      el.style.opacity = '0';
      // Restore prompt-mode colors so a later reconnect looks right.
      setTimeout(() => {
        if (!confirmed) return;
        el.style.color = '#f5dc9c';
        el.style.borderColor = 'rgba(232,200,120,0.55)';
        el.textContent = '◈ Press any button on your controller to activate';
      }, 320);
    }, 2400);
  }

  function markReady(pad) {
    if (confirmed) return;
    confirmed = true;
    window.aovGamepadReady = true;
    hideBanner();
    flashConfirmed(pad);
    try {
      window.dispatchEvent(new CustomEvent('aov-gamepad-ready', {
        bubbles: true,
        detail: { gamepad: pad },
      }));
    } catch (_) {}
  }

  function padHasInput(pad) {
    if (!pad) return false;
    if (Array.isArray(pad.buttons)) {
      for (const b of pad.buttons) {
        if (b && b.pressed) return true;
      }
    }
    if (Array.isArray(pad.axes)) {
      for (const a of pad.axes) {
        if (Math.abs(a) > AXIS_DEAD) return true;
      }
    }
    return false;
  }

  function poll() {
    if (!confirmed) {
      const pads = navigator.getGamepads() || [];
      for (let i = 0; i < pads.length; i++) {
        const pad = pads[i];
        if (padHasInput(pad)) { markReady(pad); break; }
      }
    }
    requestAnimationFrame(poll);
  }

  // Show the banner as soon as the DOM is ready.  Delay slightly so we
  // don't race with page-boot animations.
  function boot() {
    // If the browser fires gamepadconnected before the user interacts
    // (some Firefox / Edge builds do), trust it.
    window.addEventListener('gamepadconnected', (e) => {
      if (!confirmed && e && e.gamepad) markReady(e.gamepad);
    });
    window.addEventListener('gamepaddisconnected', () => {
      // Reset so a reconnect can re-trigger activation.
      confirmed = false;
      window.aovGamepadReady = false;
      if (banner) {
        banner.style.color = '#f5dc9c';
        banner.style.borderColor = 'rgba(232,200,120,0.55)';
        banner.textContent = '◈ Press any button on your controller to activate';
      }
      // Show banner again after a beat so a transient disconnect isn't loud.
      setTimeout(() => { if (!confirmed) showBanner(); }, 800);
    });
    // Start polling immediately; show the banner shortly after so it
    // doesn't flicker if the pad is already active.
    requestAnimationFrame(poll);
    setTimeout(() => { if (!confirmed) showBanner(); }, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
