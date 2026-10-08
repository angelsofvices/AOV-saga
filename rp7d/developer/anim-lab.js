// Anim Lab — play any clip on the current character, then assign clips to
// actor slots. Opens with L (keyboard) or from the Zyphone's Rizer tab.
// The world keeps running: stop the preview and walk around to feel the
// assigned clips in play.
//   keyboard: ↑ ↓ choose · ← → change · Enter select · P play/stop · Delete clear slot · L / Esc close
//   controller: d-pad ↑ ↓ choose · ← → change · ✕ select · △ play/stop · □ clear slot · ○ close
import * as lib from './anim-lib.js';

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SRC_LABEL = { library: 'LIBRARY', dropped: 'THIS BROWSER', builtin: 'BUILT-IN' };

export function createAnimLab({ getActor, getCharKey, setCharacter, playableCharacters = lib.ACTORS, toast, onOpen, onClose }) {
  const root = document.createElement('aside');
  root.className = 'lab'; root.hidden = true; root.setAttribute('aria-label', 'Anim Lab');
  root.innerHTML = `
    <header class="lab-head"><div><b>ANIM LAB</b><small>PLAY · TEST · ASSIGN</small></div><button class="lab-x" data-act="close" title="Close (L)">✕</button></header>
    <div class="lab-now"><span id="lab-now-name">No clip playing</span><i class="lab-bar"><span id="lab-now-bar"></span></i><small id="lab-now-time"></small></div>
    <div class="lab-body" id="lab-body"></div>
    <footer class="lab-foot"><span class="k">↑↓ CHOOSE · ←→ CHANGE · ENTER SELECT · V ADD VARIANT · P PLAY/STOP · DEL CLEAR · L CLOSE</span><span class="p">↑↓ CHOOSE · ←→ CHANGE · ✕ SELECT · R1 ADD VARIANT · △ PLAY/STOP · □ CLEAR · ○ CLOSE</span></footer>
    <input type="file" id="lab-file" accept=".fbx,.glb,.gltf" multiple hidden>`;
  document.querySelector('#game').appendChild(root);
  const body = root.querySelector('#lab-body'), fileIn = root.querySelector('#lab-file');

  let isOpen = false, focus = 0, selected = null, playing = false;
  let loop = true, inPlace = true, speed = 3, target = null, busyMsg = '';
  const items = () => [...body.querySelectorAll('[data-f]')];

  function render() {
    const char = getCharKey(), assign = lib.assignments();
    if (!target || !lib.ACTORS[target]) target = lib.ACTORS[char] ? char : Object.keys(lib.ACTORS)[0];
    const mine = assign[target] || {};
    const clips = lib.clips(), groups = ['library', 'dropped', 'builtin'];
    const clipRow = c => `<button class="lab-clip${c.id === selected ? ' sel' : ''}" data-f data-clip="${esc(c.id)}"><span>${esc(c.name)}</span><small>${c.duration ? c.duration.toFixed(2) + 's' : ''}</small>${c.source === 'dropped' ? `<i class="lab-rm" data-rm="${esc(c.id)}" title="Remove from this browser">✕</i>` : ''}</button>`;
    const sel = clips.find(c => c.id === selected);
    body.innerHTML = `
      <section><small class="lab-h">PREVIEW ON</small>
        <div class="lab-row lab-opt" data-f data-opt="char"><span>Character</span><b>‹ ${esc(lib.ACTORS[char]?.name || char)} ›</b></div></section>
      <section><small class="lab-h">CLIPS</small>
        ${groups.map(g => { const list = clips.filter(c => c.source === g); if (g === 'builtin') list.sort((a, b) => (a.actor === char ? -1 : 0) - (b.actor === char ? -1 : 0));
          return list.length ? `<div class="lab-group"><small>${SRC_LABEL[g]}${g === 'dropped' ? ' · ONLY YOU SEE THESE' : ''}</small>${list.map(clipRow).join('')}</div>` : (g === 'dropped' ? `<div class="lab-empty">Drop Mixamo FBX files anywhere on the page, or use Add files.</div>` : ''); }).join('')}
        <div class="lab-btns"><button class="lab-btn" data-f data-act="add">+ Add FBX / GLB files</button></div></section>
      <section><small class="lab-h">PLAYBACK</small>
        <div class="lab-row lab-opt" data-f data-opt="loop"><span>Loop</span><b>${loop ? 'On' : 'Off'}</b></div>
        <div class="lab-row lab-opt" data-f data-opt="inplace"><span>Root motion</span><b>${inPlace ? 'In place' : 'Keep travel'}</b></div>
        <div class="lab-row lab-opt" data-f data-opt="speed"><span>Speed</span><b>‹ ${SPEEDS[speed]}× ›</b></div>
        <div class="lab-btns"><button class="lab-btn gold" data-f data-act="play">${playing ? '■ Stop preview' : '▶ Play selected'}</button></div>
        <p class="lab-note">Stop the preview to walk, run, jump and fight with whatever is assigned.</p></section>
      <section><small class="lab-h">ASSIGN ${sel ? '<em>' + esc(sel.name) + '</em>' : 'A CLIP'} TO</small>
        <div class="lab-row lab-opt" data-f data-opt="target"><span>Actor</span><b>‹ ${esc(lib.ACTORS[target]?.name || target)} ›</b></div>
        <div class="lab-slots">${lib.SLOTS.map(s => { const a = mine[s.key], c = a && lib.clipById(a.clip);
          const fallback = lib.BUILTIN_SLOTS[s.key] ? `GLB ${lib.BUILTIN_SLOTS[s.key]}` : s.key === 'sprint' ? 'uses Run' : s.key.startsWith('punch') ? 'chain ends here' : 'code pose';
          return `<div class="lab-slot${a ? ' set' : ''}" data-f data-slot="${s.key}"><span>${s.label}</span><b>${a ? esc(c ? c.name : a.clip + ' (missing)') + (a.more?.length ? ` <em>+${a.more.length} variant${a.more.length > 1 ? 's' : ''}</em>` : '') : `<i>${fallback}</i>`}</b>${a ? `<i class="lab-rm" data-clear="${s.key}" title="Clear">✕</i>` : ''}</div>`; }).join('')}</div>
        <p class="lab-note">Choose a clip, then select a slot to put it there. Shift-click (V · R1) adds it as a variant, picked at random. Clear returns the slot to its default.</p></section>
      <section><small class="lab-h">SAVE</small>
        <div class="lab-btns"><button class="lab-btn" data-f data-act="export">Export assignments</button><button class="lab-btn" data-f data-act="reset">Reset all</button></div>
        <textarea id="lab-export" readonly hidden></textarea>
        <p class="lab-note">Assignments are kept in this browser. Export them and send them over to make them the game's defaults.</p></section>`;
    paintFocus(false);
  }
  function paintFocus(scroll = true) {
    const list = items(); focus = Math.max(0, Math.min(focus, list.length - 1));
    list.forEach((el, i) => el.classList.toggle('focus', i === focus));
    if (scroll) list[focus]?.scrollIntoView({ block: 'nearest' });
  }

  async function play(id = selected) {
    const actor = getActor(); if (!actor || !id) return;
    selected = id; busyMsg = 'Loading…'; render();
    try {
      const { clip } = await lib.clipFor(id, actor, { inPlace });
      actor.startPreview(clip, { loop, speed: SPEEDS[speed] }); playing = true; busyMsg = '';
    } catch (e) { console.warn('[anim-lab]', e); busyMsg = ''; toast?.('Could not play that clip · see console'); }
    render();
  }
  function stop() { getActor()?.stopPreview(); playing = false; render(); }
  function restartIfPlaying() { if (playing) play(); }

  function change(opt, dir) {
    if (opt === 'char') {
      const keys = Object.keys(playableCharacters), i = keys.indexOf(getCharKey());
      const next = keys[(i + dir + keys.length) % keys.length]; busyMsg = 'Loading…';
      Promise.resolve(setCharacter(next)).then(() => { busyMsg = ''; target = next; if (playing) play(); else render(); });
    }
    if (opt === 'loop') { loop = !loop; restartIfPlaying(); }
    if (opt === 'inplace') { inPlace = !inPlace; restartIfPlaying(); }
    if (opt === 'speed') { speed = Math.max(0, Math.min(SPEEDS.length - 1, speed + dir)); const p = getActor()?.preview; if (p) p.speed = SPEEDS[speed]; }
    if (opt === 'target') { const keys = Object.keys(lib.ACTORS); target = keys[(keys.indexOf(target) + dir + keys.length) % keys.length]; }
    render();
  }
  function assignSlot(slot) {
    if (!selected) { toast?.('Choose a clip first'); return; }
    lib.setAssignment(target, slot, selected, { inPlace });
    toast?.(`${lib.clipById(selected)?.name} → ${lib.ACTORS[target].name} · ${slot}`);
  }
  function clearSlot(slot) { lib.setAssignment(target, slot, null); }
  function variantSlot(slot) { if (!selected) return toast?.('Choose a clip first'); lib.addVariant(target, slot, selected); toast?.(`${lib.clipById(selected)?.name} added as a ${slot} variant`); }
  function doExport() {
    const text = lib.exportAssignments(), ta = body.querySelector('#lab-export');
    ta.value = text; ta.hidden = false; ta.select();
    let copied = false;
    try { navigator.clipboard?.writeText(text).then(() => toast?.('Assignments copied to the clipboard')).catch(() => {}); copied = true; } catch (e) {}
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript' })); a.download = 'anim-assignments.js'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); } catch (e) {}
    if (!copied) toast?.('Copy the text below');
  }
  function activate(el = items()[focus]) {
    if (!el) return;
    if (el.dataset.clip) { if (selected === el.dataset.clip && playing) stop(); else play(el.dataset.clip); return; }
    if (el.dataset.opt) return change(el.dataset.opt, 1);
    if (el.dataset.slot) return assignSlot(el.dataset.slot);
    const act = el.dataset.act;
    if (act === 'play') return playing ? stop() : play();
    if (act === 'add') return fileIn.click();
    if (act === 'export') return doExport();
    if (act === 'reset') { lib.resetAssignments(); toast?.('Assignments reset to the defaults'); }
    if (act === 'close') close();
  }
  async function addFiles(files) {
    busyMsg = 'Reading files…'; tick();
    const ids = await lib.addFiles(files); busyMsg = '';
    if (ids.length) { if (!isOpen) open(); toast?.(`Added ${ids.length} clip${ids.length > 1 ? 's' : ''}`); play(ids[0]); }
    else toast?.('No animation found in those files');
  }

  // mouse
  body.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]'); if (rm) { e.stopPropagation(); if (selected === rm.dataset.rm) stop(); lib.removeClip(rm.dataset.rm); return; }
    const cl = e.target.closest('[data-clear]'); if (cl) { e.stopPropagation(); clearSlot(cl.dataset.clear); return; }
    const el = e.target.closest('[data-f]'); if (!el) return;
    focus = items().indexOf(el); paintFocus(false);
    if (e.shiftKey && el.dataset.slot) return variantSlot(el.dataset.slot);
    if (el.dataset.opt) { const r = el.getBoundingClientRect(); return change(el.dataset.opt, e.clientX < r.left + r.width * 0.55 && el.dataset.opt !== 'loop' && el.dataset.opt !== 'inplace' ? -1 : 1); }
    activate(el);
  });
  body.addEventListener('contextmenu', e => { const s = e.target.closest('[data-slot]'); if (s) { e.preventDefault(); clearSlot(s.dataset.slot); } });
  root.querySelector('[data-act=close]').addEventListener('click', () => close());
  root.addEventListener('mousedown', e => e.stopPropagation());
  root.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
  fileIn.addEventListener('change', () => { if (fileIn.files.length) addFiles([...fileIn.files]); fileIn.value = ''; });
  // drag and drop anywhere on the page
  addEventListener('dragover', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); document.body.classList.add('lab-drop'); } });
  addEventListener('dragleave', e => { if (!e.relatedTarget) document.body.classList.remove('lab-drop'); });
  addEventListener('drop', e => { document.body.classList.remove('lab-drop'); if (e.dataTransfer?.files?.length) { e.preventDefault(); addFiles([...e.dataTransfer.files]); } });
  lib.onLibraryChange(() => { if (isOpen) render(); });

  function key(code) {
    if (!isOpen) return false;
    const el = items()[focus];
    if (code === 'KeyL' || code === 'Escape') close();
    else if (code === 'ArrowUp') { focus--; paintFocus(); }
    else if (code === 'ArrowDown') { focus++; paintFocus(); }
    else if (code === 'ArrowLeft' || code === 'ArrowRight') { if (el?.dataset.opt) change(el.dataset.opt, code === 'ArrowLeft' ? -1 : 1); }
    else if (code === 'Enter') activate();
    else if (code === 'KeyP') playing ? stop() : play();
    else if (code === 'KeyV') { if (el?.dataset.slot) variantSlot(el.dataset.slot); }
    else if (code === 'Delete' || code === 'Backspace') { if (el?.dataset.slot) clearSlot(el.dataset.slot); }
    else return false;
    return true;
  }
  function pad(p) {
    if (!isOpen) return;
    const el = items()[focus];
    if (p.edge(1)) return close();
    if (p.edge(12)) { focus--; paintFocus(); }
    if (p.edge(13)) { focus++; paintFocus(); }
    if ((p.edge(14) || p.edge(15)) && el?.dataset.opt) change(el.dataset.opt, p.edge(14) ? -1 : 1);
    if (p.edge(0)) activate();
    if (p.edge(3)) playing ? stop() : play();
    if (p.edge(2) && el?.dataset.slot) clearSlot(el.dataset.slot);
    if (p.edge(5) && el?.dataset.slot) variantSlot(el.dataset.slot);
  }
  // per-frame status line
  function tick() {
    if (!isOpen) return;
    const a = getActor(), pv = a?.preview, c = selected && lib.clipById(selected);
    root.querySelector('#lab-now-name').textContent = busyMsg || (pv && c ? `▶ ${c.name}` : c ? `${c.name} · stopped` : 'Choose a clip');
    root.querySelector('#lab-now-time').textContent = pv ? `${pv.t.toFixed(2)} / ${pv.dur.toFixed(2)}s` : '';
    root.querySelector('#lab-now-bar').style.width = pv ? `${Math.min(100, (pv.t / pv.dur) * 100)}%` : '0%';
    if (playing && !pv) { playing = false; render(); }
  }
  function open() { if (isOpen) return; isOpen = true; root.hidden = false; target = getCharKey(); render(); onOpen?.(); lib.ready.then(() => isOpen && render()); }
  function close() { if (!isOpen) return; isOpen = false; root.hidden = true; stop(); onClose?.(); }
  return { open, close, toggle: () => (isOpen ? close() : open()), key, pad, tick, addFiles, get isOpen() { return isOpen; }, get previewing() { return playing; }, play, stop };
}
