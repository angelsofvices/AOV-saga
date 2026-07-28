/*
 * AOV™ Saga — Shared UI / Menu Controller Navigation (v2 · 2026-07-27)
 * --------------------------------------------------------------------
 * Full DualSense support across every menu / loading / selection /
 * dialog screen in the AOV Saga.  Was card-game-only; now every game
 * loads this and it works on:
 *   - Title screens
 *   - New-game / mode select
 *   - Character / starter / planet pickers
 *   - Rules / codex / settings modals
 *   - Loading screens ("Start" to skip)
 *   - Any menu with focusable buttons / links / role-buttons / cards
 *
 * Controls:
 *   D-pad / Left stick  → move highlight spatially
 *   Cross (×) / A       → click the highlighted control
 *   Circle (○) / B      → back / Escape (or click a "Back/Cancel" btn)
 *   Options / Start (9) → dispatch Enter (skip loading · advance dialog · confirm)
 *   Share / Create (8)  → dispatch Escape (open a pause menu if wired)
 *
 * Default highlight: rightmost enabled control in the topmost visible row.
 *
 * SAFE ALONGSIDE IN-GAME POLLERS:
 *   Games with their own in-game gamepad handlers (rp7, rp8, arborynth,
 *   realms, expedition) can set `window.aovNavRequireOverlay = true`
 *   BEFORE loading this script.  When set, the nav helper only fires
 *   when a menu / modal / overlay is actually visible — otherwise it
 *   defers to the game's own poller so Cross doesn't double-fire an
 *   attack AND a menu click.
 */
(function aovUiControllerNavigation() {
  'use strict';
  if (window.__aovCardGameNavigation) return;
  window.__aovCardGameNavigation = true;

  const SELECTOR = [
    'button:not(:disabled)', 'a[href]', 'a.btn',
    '.action-btn:not(:disabled)', '.attack-btn:not(:disabled)',
    '[role="button"]:not([aria-disabled="true"])',
    '.faction-card', '.card-cell-pick', '.slot.clickable',
    '.mode-btn', '.vs-btn', '.starter-card',
    '.game-card', '.planet[data-num]', '.tourn-grid > *',
    '.mainmenu-btn', '.action-btn.primed',
    '[tabindex="0"]', '[tabindex="-1"][data-nav]'
  ].join(',');

  const style = document.createElement('style');
  style.textContent = `
    .controller-selected {
      outline: 3px solid #f5dc9c !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 2px rgba(184,124,255,.72), 0 0 24px rgba(232,200,120,.58) !important;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(style);

  let selected = null;
  let padIndex = null;
  let previousButtons = [];
  let previousAxisX = 0;
  let previousAxisY = 0;
  let resetTimer = null;
  let sendingBack = false;

  const OVERLAY_SELECTOR =
    '.active, .open, .modal-backdrop:not(.hidden), [role="dialog"], ' +
    '.intro:not(.dismissed), .mainmenu-overlay.active, .modal.active, ' +
    '.screen:not([hidden])';

  function anyOverlayVisible() {
    // "Overlay" here means anything that looks like a menu/modal/dialog/
    // screen container the user is meant to click through.  Used to gate
    // whether the nav helper should react in games that have their own
    // in-game poller (aovNavRequireOverlay=true).
    return !!document.querySelector(OVERLAY_SELECTOR);
  }

  function visibleCandidates() {
    let candidates = Array.from(document.querySelectorAll(SELECTOR)).filter(el => {
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
      const rect = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return rect.width > 2 && rect.height > 2 &&
        s.visibility !== 'hidden' && s.display !== 'none' &&
        Number(s.opacity || 1) > 0.08;
    });
    const overlayCandidates = candidates.filter(el => el.closest(OVERLAY_SELECTOR));
    if (overlayCandidates.length) candidates = overlayCandidates;
    return candidates;
  }

  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top };
  }

  function select(el) {
    if (!el) return;
    selected?.classList.remove('controller-selected');
    selected = el;
    selected.classList.add('controller-selected');
    if (!selected.hasAttribute('tabindex')) selected.tabIndex = -1;
    selected.focus({ preventScroll: true });
    selected.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  function selectTopRight(force) {
    const candidates = visibleCandidates();
    if (!candidates.length) return;
    if (!force && selected && candidates.includes(selected)) return;
    const points = candidates.map(el => ({ el, ...center(el) }));
    const top = Math.min(...points.map(p => p.top));
    const firstRow = points.filter(p => p.top <= top + 30);
    firstRow.sort((a, b) => b.x - a.x);
    select(firstRow[0].el);
  }

  function move(direction) {
    const candidates = visibleCandidates();
    if (!candidates.length) return false;
    if (!selected || !candidates.includes(selected)) {
      selectTopRight(true);
      return true;
    }
    const from = center(selected);
    const scored = candidates.filter(el => el !== selected).map(el => {
      const to = center(el);
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const valid = direction === 'left' ? dx < -4 :
        direction === 'right' ? dx > 4 :
        direction === 'up' ? dy < -4 : dy > 4;
      if (!valid) return null;
      const primary = direction === 'left' || direction === 'right' ? Math.abs(dx) : Math.abs(dy);
      const cross = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
      return { el, score: primary + cross * 2.25 };
    }).filter(Boolean).sort((a, b) => a.score - b.score);
    if (scored[0]) select(scored[0].el);
    return true;
  }

  function activate() {
    if (!selected || !visibleCandidates().includes(selected)) selectTopRight(true);
    selected?.click();
  }

  function goBack() {
    const candidates = visibleCandidates();
    const back = candidates.find(el =>
      /^(back|cancel|close|return|done|no|×|✕)\b/i.test((el.textContent || el.getAttribute('aria-label') || '').trim())
    );
    if (back) back.click();
    else {
      sendingBack = true;
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape', code: 'Escape', bubbles: true, cancelable: true
      }));
      sendingBack = false;
    }
  }

  // ★ 2026-07-27 · Start / Options button (idx 9) — dispatches Enter to
  // advance dialogs, skip splash screens, submit forms, or activate any
  // "Skip / Continue / Start" button.  Also fires a click on the first
  // visible "Skip" or "Continue" button if one exists (nicer UX for
  // loading screens that don't wire Enter).
  //
  // ★ 2026-07-27 (fix) · Only auto-click a Skip/Start button if it's
  // ACTUALLY VISIBLE (not inside a hidden ancestor, <template>, or
  // display:none block).  RP6 hit a bug where the deprecated "Start
  // Adventure" button lived in a hidden <section> and got auto-clicked
  // by Options, launching a dead codepath.
  function elIsTrulyVisible(el) {
    if (!el || !el.getClientRects().length) return false;
    // Any ancestor with `hidden`, `display:none`, or inside a <template> disqualifies.
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      if (node.hidden) return false;
      if (node.tagName === 'TEMPLATE') return false;
      const cs = getComputedStyle(node);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity || 1) < 0.05) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  }
  function pressStart() {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', bubbles: true, cancelable: true
    }));
    const skipButton = Array.from(document.querySelectorAll(SELECTOR)).find(el => {
      if (!elIsTrulyVisible(el)) return false;
      const t = ((el.textContent || el.getAttribute('aria-label') || '').trim()).toLowerCase();
      return /^(skip|continue|start|begin|play|next|proceed|enter)/i.test(t);
    });
    if (skipButton) skipButton.click();
  }

  document.addEventListener('keydown', event => {
    if (sendingBack) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = {
      ArrowLeft: 'left', ArrowRight: 'right',
      ArrowUp: 'up', ArrowDown: 'down'
    }[event.key];
    if (direction && visibleCandidates().length) {
      move(direction);
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if ((event.key === 'Enter' || event.key === ' ') && selected) {
      activate();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (event.key === 'Escape' && selected) {
      goBack();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  function poll() {
    // ★ 2026-07-27 · If the host game requires an overlay to be visible
    // (aovNavRequireOverlay=true), skip nav polling while the player is
    // actively in gameplay.  This prevents Cross-double-fires when the
    // game has its own in-game gamepad handler.
    const requireOverlay = !!window.aovNavRequireOverlay;
    let overlayGate = requireOverlay ? anyOverlayVisible() : true;
    // ★ 2026-07-27 · Games can veto nav entirely via aovNavIsInGameplay().
    // RP6 uses this so Circle stays a heavy attack during a match — the
    // pause overlay is the only exit path.
    if (typeof window.aovNavIsInGameplay === 'function' && window.aovNavIsInGameplay()) {
      overlayGate = false;
    }

    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = padIndex !== null ? pads[padIndex] : Array.from(pads).find(Boolean);
    if (pad && overlayGate) {
      padIndex = pad.index;
      const x = (pad.axes[0] || 0) < -0.55 ? -1 : (pad.axes[0] || 0) > 0.55 ? 1 : 0;
      const y = (pad.axes[1] || 0) < -0.55 ? -1 : (pad.axes[1] || 0) > 0.55 ? 1 : 0;
      if ((pad.buttons[14]?.pressed && !previousButtons[14]) || (x === -1 && previousAxisX !== -1)) move('left');
      if ((pad.buttons[15]?.pressed && !previousButtons[15]) || (x === 1 && previousAxisX !== 1)) move('right');
      if ((pad.buttons[12]?.pressed && !previousButtons[12]) || (y === -1 && previousAxisY !== -1)) move('up');
      if ((pad.buttons[13]?.pressed && !previousButtons[13]) || (y === 1 && previousAxisY !== 1)) move('down');
      if (pad.buttons[0]?.pressed && !previousButtons[0]) activate();
      if (pad.buttons[1]?.pressed && !previousButtons[1]) goBack();
      // ★ 2026-07-27 · System buttons (Create idx 8 · Options idx 9 ·
      // Touchpad idx 17) are RESERVED FOR THE HOST GAME — the shared
      // nav helper never intercepts them.  Root cause of a nasty bug:
      // pressStart() auto-clicked any button whose text started with
      // "Start/Play/Continue/etc.", which could launch a hidden mode
      // OR click a nav-back link, exiting the player out of the game
      // entirely.  Each game wires its own pause / menu overlay to
      // these buttons (see rp6/rp7/rp8/expedition for examples).
      //
      // Games that WANT the old skip-advance-splash behavior for a
      // specific screen can call the shared helper directly, e.g.:
      //     window.aovNavPressStart && window.aovNavPressStart();
      // The idle default is: do nothing.
      previousAxisX = x;
      previousAxisY = y;
      previousButtons = pad.buttons.map(button => button.pressed);
    } else if (pad && !overlayGate) {
      // We CAN see the pad but the game is gating us — still update
      // previousButtons so we edge-detect correctly when overlay reopens.
      previousButtons = pad.buttons.map(button => button.pressed);
    }
    requestAnimationFrame(poll);
  }

  // ★ 2026-07-27 · Expose the helpers so a game can opt-in explicitly
  // for a specific screen (e.g. a splash that legitimately wants Options
  // to skip forward).  Default polling never fires these — they're
  // reserved for the host game.
  window.aovNavPressStart = pressStart;
  window.aovNavGoBack     = goBack;

  new MutationObserver(() => {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      if (!(document.activeElement instanceof HTMLInputElement) &&
          !(document.activeElement instanceof HTMLTextAreaElement)) {
        selectTopRight(false);
      }
    }, 40);
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'hidden'] });

  selectTopRight(true);
  requestAnimationFrame(poll);
})();
