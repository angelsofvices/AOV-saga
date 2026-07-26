/*
 * AOV card-game controller navigation
 * D-pad / left stick: move highlight spatially
 * DualSense Cross: activate
 * DualSense Circle: back
 * Default selection: rightmost enabled control in the top visible row
 */
(function cardGameControllerNavigation() {
  'use strict';
  if (window.__aovCardGameNavigation) return;
  window.__aovCardGameNavigation = true;

  const SELECTOR = [
    'button:not(:disabled)', 'a.btn', '.action-btn:not(:disabled)',
    '.attack-btn:not(:disabled)', '[role="button"]:not([aria-disabled="true"])',
    '.faction-card', '.card-cell-pick', '.slot.clickable', '[tabindex="0"]'
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

  function visibleCandidates() {
    let candidates = Array.from(document.querySelectorAll(SELECTOR)).filter(el => {
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 2 && rect.height > 2 &&
        style.visibility !== 'hidden' && style.display !== 'none' &&
        Number(style.opacity || 1) > 0.08;
    });
    const overlayCandidates = candidates.filter(el => el.closest(
      '.active, .open, .modal-backdrop:not(.hidden), [role="dialog"], .intro:not(.dismissed)'
    ));
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
      /^(back|cancel|close|return|done|no)\b/i.test((el.textContent || el.getAttribute('aria-label') || '').trim())
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
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = padIndex !== null ? pads[padIndex] : Array.from(pads).find(Boolean);
    if (pad) {
      padIndex = pad.index;
      const x = (pad.axes[0] || 0) < -0.55 ? -1 : (pad.axes[0] || 0) > 0.55 ? 1 : 0;
      const y = (pad.axes[1] || 0) < -0.55 ? -1 : (pad.axes[1] || 0) > 0.55 ? 1 : 0;
      if ((pad.buttons[14]?.pressed && !previousButtons[14]) || (x === -1 && previousAxisX !== -1)) move('left');
      if ((pad.buttons[15]?.pressed && !previousButtons[15]) || (x === 1 && previousAxisX !== 1)) move('right');
      if ((pad.buttons[12]?.pressed && !previousButtons[12]) || (y === -1 && previousAxisY !== -1)) move('up');
      if ((pad.buttons[13]?.pressed && !previousButtons[13]) || (y === 1 && previousAxisY !== 1)) move('down');
      if (pad.buttons[0]?.pressed && !previousButtons[0]) activate();
      if (pad.buttons[1]?.pressed && !previousButtons[1]) goBack();
      previousAxisX = x;
      previousAxisY = y;
      previousButtons = pad.buttons.map(button => button.pressed);
    }
    requestAnimationFrame(poll);
  }

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
