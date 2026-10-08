const KEY = 'rp7d.uiLayout.v2'; // v2: the four-panel HUD (ZHUD · RHUD · WHUD · MHUD)
const SELECTOR = [
  '.topbar', '.zhud', '.rhud', '.mission', '.dev-strip',
  '.hud-bottom', '.mhud', '.whud', '.av-badge', '#banner', '#prompt', '#card', '#toast',
  '#zyphone', '.lab', '.devstats'
].join(',');

export function createUILayout(root, button) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch {}
  let active = false, topZ = 30, drag = null, moveFrame = 0, pendingPoint = null;
  const bound = new WeakSet();
  const items = () => [...root.querySelectorAll(SELECTOR)];
  const idFor = el => el.dataset.layoutId ||= (el.id || el.classList[0] || 'panel');
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {} };

  function pin(el, x, y, rect = el.getBoundingClientRect(), saveNow = true) {
    const bounds = root.getBoundingClientRect(), id = el.dataset.layoutId;
    x = clamp(x, 0, bounds.width - rect.width); y = clamp(y, 0, bounds.height - rect.height);
    el.classList.add('layout-pinned');
    Object.assign(el.style, {
      position: 'fixed', left: `${bounds.left + x}px`, top: `${bounds.top + y}px`,
      right: 'auto', bottom: 'auto', transform: 'none', margin: '0',
      width: `${rect.width}px`, height: `${rect.height}px`, zIndex: String(Number(el.style.zIndex) || ++topZ)
    });
    saved[id] = { x, y, w: rect.width, h: rect.height, z: Number(el.style.zIndex) || topZ };
    if (saveNow) persist();
  }

  function apply(el, index) {
    const id = idFor(el, index), item = saved[id];
    if (!item || el.hidden) return;
    const bounds = root.getBoundingClientRect();
    el.classList.add('layout-pinned');
    Object.assign(el.style, {
      position: 'fixed', left: `${bounds.left + item.x}px`, top: `${bounds.top + item.y}px`,
      right: 'auto', bottom: 'auto', transform: 'none', margin: '0',
      width: `${item.w}px`, height: `${item.h}px`, zIndex: String(item.z || 30)
    });
    topZ = Math.max(topZ, item.z || 30);
  }

  function refresh() {
    items().forEach((el, i) => {
      idFor(el); apply(el, i); el.classList.toggle('layout-edit-target', active);
      if (bound.has(el)) return;
      bound.add(el);
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  }
  function down(e) {
    if (!active || e.button !== 0 || e.target.closest('[data-layout-ignore]')) return;
    e.preventDefault(); e.stopPropagation();
    const el = e.currentTarget, rect = el.getBoundingClientRect(), bounds = root.getBoundingClientRect();
    const id = idFor(el);
    drag = { el, id, dx: e.clientX - rect.left, dy: e.clientY - rect.top, rect, bounds };
    el.setPointerCapture?.(e.pointerId);
    el.style.zIndex = String(++topZ);
    el.classList.add('layout-dragging');
  }
  function move(e) {
    if (!drag) return;
    // HUD panels can be nested inside other draggable panels. Stop bubbling so
    // one pointer event only schedules one layout update.
    e.stopPropagation();
    pendingPoint = { x: e.clientX, y: e.clientY };
    if (moveFrame) return;
    moveFrame = requestAnimationFrame(() => {
      moveFrame = 0;
      if (!drag || !pendingPoint) return;
      const { el, dx, dy, rect, bounds } = drag;
      const point = pendingPoint; pendingPoint = null;
      pin(el, point.x - bounds.left - dx, point.y - bounds.top - dy, rect, false);
    });
  }
  function up(e) {
    if (!drag) return;
    e.stopPropagation();
    if (moveFrame) { cancelAnimationFrame(moveFrame); moveFrame = 0; }
    if (pendingPoint) {
      const { el, dx, dy, rect, bounds } = drag;
      pin(el, pendingPoint.x - bounds.left - dx, pendingPoint.y - bounds.top - dy, rect, false);
      pendingPoint = null;
    }
    drag.el.classList.remove('layout-dragging');
    persist();
    drag.el.releasePointerCapture?.(e.pointerId); drag = null;
  }
  function toggle(force = !active) {
    active = !!force;
    if (active && document.pointerLockElement) document.exitPointerLock?.();
    root.classList.toggle('layout-editing', active);
    items().forEach(el => el.classList.toggle('layout-edit-target', active));
    button?.classList.toggle('active', active);
    button?.setAttribute('aria-pressed', String(active));
    if (button) button.textContent = active ? 'DONE' : 'MOVE UI';
    refresh();
  }

  refresh();
  const observer = new MutationObserver(refresh);
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  addEventListener('resize', () => {
    for (const el of items()) {
      const item = saved[el.dataset.layoutId];
      if (!item) continue;
      const bounds = root.getBoundingClientRect();
      const x = clamp(item.x, 0, bounds.width - item.w), y = clamp(item.y, 0, bounds.height - item.h);
      el.style.left = `${bounds.left + x}px`; el.style.top = `${bounds.top + y}px`;
      item.x = x; item.y = y;
    }
    persist();
  });
  addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.code === 'KeyL') { e.preventDefault(); toggle(); } });
  return { toggle, get active() { return active; } };
}
