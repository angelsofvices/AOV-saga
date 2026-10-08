// Build Lab: isolated 3D character construction and portable named templates, on the Rizer 1:1 standard:
//   RIZER BASE SKELETON → BODY SLIDERS → HEAD / FEATURES → MODULAR ASSETS → MATERIAL / COLOR → SAVED BUILD
// The preview is its own character, made by the character factory (the same path the game uses to
// spawn a build) — Rizer, Zoryn and every other live character are never touched. Proportions ride
// over the animation every frame (build-library.js), so the preview can walk, run and fight in them.
import * as THREE from 'three';
import { BODY_PRESETS } from './morphology.js';
import { BUILD_PARTS, buildBase, BUILD_STANDARD, BUILD_CONTROLS, BUILD_RIG, BUILD_SLOTS, BUILD_ASSETS, assetsFor, normalizeBuild, readBuildTemplates, writeBuildTemplates } from './build-library.js';
import { createCharacter } from './character-factory.js';
import { debugMesh } from './hitbox.js';
const MOTIONS = [['idle', 'Idle'], ['walk', 'Walk'], ['run', 'Run'], ['punch', 'Punch'], ['kick', 'Kick']];
const MAX_PLACED = 6;

const DRAFT_KEY = 'rp7d.buildLab.draft.v1';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const freshId = () => globalThis.crypto?.randomUUID?.() || `build-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const download = (name, data) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type:'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export function createBuildLab({ toast, onOpen, onClose, getAnchor, onPlayable } = {}) {
  const root = document.createElement('aside');
  root.className = 'lab build-lab'; root.hidden = true; root.setAttribute('aria-label', 'Build Lab');
  root.innerHTML = `<header class="lab-head"><div><b>BUILD LAB</b><small>CONSTRUCT · PREVIEW · SAVE</small></div><button class="lab-x" data-build-close title="Close Build Lab">✕</button></header>
    <div class="build-stage" data-build-stage><div class="build-preview" data-build-preview></div><span class="build-stage-hint">DRAG TO ROTATE · SCROLL TO ZOOM</span></div>
    <div class="build-readout" data-build-readout></div>
    <div class="lab-body" data-build-body></div>
    <footer class="lab-foot"><span class="k">↑↓ CHOOSE · ←→ ADJUST · ENTER SELECT · [ ] TURN · ESC CLOSE</span><span class="p">D-PAD CHOOSE · ←→ ADJUST · ✕ SELECT · R-STICK TURN · △ MOTION · ○ CLOSE</span></footer>
    <input type="file" accept=".json,application/json" data-build-file hidden>`;
  document.querySelector('#game').appendChild(root);
  const body = root.querySelector('[data-build-body]');
  const stage = root.querySelector('[data-build-stage]');
  const file = root.querySelector('[data-build-file]');
  let templates = readBuildTemplates(), selectedId = null, name = 'New character', isOpen = false, focus = 0;
  let build = normalizeBuild(null), preview = null, renderer = null, scene = null, camera = null, hitG = null, lastTime = 0, turn = 0, zoom = 4.8, loadSerial = 0;
  let motion = 0, showHits = false, readoutT = 0;
  const placed = []; // builds stood in the world (Place in world) · not saved
  try { const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); if (draft?.build) { build = normalizeBuild(draft.build); name = String(draft.name || name).slice(0,80); } } catch {}
  const persistDraft = () => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, build })); } catch {} };
  const controls = () => [...body.querySelectorAll('[data-build-focus]')];
  function ensureStage() {
    if (renderer) return;
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    root.querySelector('[data-build-preview]').appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xd9e9ff, 0x483b2b, 2.2));
    const key = new THREE.DirectionalLight(0xffe6b0, 2.4); key.position.set(-2, 5, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x6bbcff, 1.4); rim.position.set(3, 3, -3); scene.add(rim);
    const disk = new THREE.Mesh(new THREE.CircleGeometry(1.2, 40), new THREE.MeshBasicMaterial({ color:0xdeb86e, transparent:true, opacity:0.15, depthWrite:false }));
    disk.rotation.x = -Math.PI / 2; disk.position.y = -0.04; scene.add(disk);
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    hitG = debugMesh(); hitG.visible = false; scene.add(hitG);
  }
  async function loadPreview() {
    ensureStage();
    const serial = ++loadSerial;
    stage.classList.add('loading');
    try {
      const ch = await createCharacter(build);
      if (serial !== loadSerial || !isOpen) { ch.dispose(); return; } // superseded, or the lab closed while it loaded
      preview?.dispose(); preview = ch;
      preview.pivot.rotation.y = turn;
      scene.add(preview.pivot);
      lastTime = performance.now(); readout();
      if (JSON.stringify(preview.build) !== JSON.stringify(normalizeBuild(build))) preview.apply(build).then(() => readout()); // edited while it loaded
    } catch (error) { console.warn('[rp7d] Build Lab preview failed', error); toast?.('Build preview could not load'); }
    finally { if (serial === loadSerial) stage.classList.remove('loading'); }
  }
  function apply() {
    build = normalizeBuild(build); persistDraft();
    if (preview?.body.id === build.foundation) {
      // A pending base swap must not replace a newer edit on the current body.
      loadSerial++; stage.classList.remove('loading');
      preview.apply(build).then(() => readout());
    }
    else loadPreview();
  }
  // Status under the preview: what this build is, and proof it still works as a character.
  function readout() {
    const el = root.querySelector('[data-build-readout]'); if (!el) return;
    if (!preview) { el.textContent = ''; return; }
    const A = preview.actor, rig = preview.hitRig(), p = preview.proportions;
    const top = A.model.getObjectByName('mixamorigHeadTop_End'); preview.pivot.updateWorldMatrix(true, true);
    const stands = top ? top.getWorldPosition(new THREE.Vector3()).y - preview.pivot.getWorldPosition(new THREE.Vector3()).y : 0;
    const issues = preview.issues;
    el.innerHTML = `${issues.length ? `<span class="build-issue" style="color:#ff9f8f">${issues.map(esc).join(' · ')}</span>` : ''}<span>${esc(preview.body.name)} · ${Math.round(p.height * 100)}% · stands ${stands.toFixed(2)} · ${Object.keys(rig.parts).length} hitboxes · radius ${preview.radius.toFixed(2)}</span><span>${['idle', 'walk', 'run', 'punch', 'kick', 'jump'].map(k => `${k} ${A.has(k) ? '✓' : '·'}`).join(' · ')}</span>`;
  }
  async function place() {
    const at = getAnchor?.(); if (!at) return toast?.('Nowhere to place a build right now');
    let ch; try { ch = await createCharacter(build); } catch (e) { console.warn('[rp7d] Build Lab place failed', e); return toast?.('Could not build that body'); }
    ch.pivot.position.set(at.x, at.y, at.z); ch.pivot.rotation.y = at.facing; at.scene.add(ch.pivot);
    placed.push(ch); while (placed.length > MAX_PLACED) placed.shift().dispose();
    if (isOpen) render(); toast?.(`${name.trim() || 'Build'} placed in the world`);
  }
  function clearPlaced() { for (const ch of placed) ch.dispose(); placed.length = 0; if (isOpen) render(); }
  function paintFocus(scroll = false) {
    const all = controls(); focus = Math.max(0, Math.min(focus, all.length - 1));
    all.forEach((el, i) => el.classList.toggle('focus', i === focus));
    if (scroll) all[focus]?.scrollIntoView({ block:'nearest' });
  }
  function render() {
    const preset = BODY_PRESETS[build.body.preset];
    const slotHtml = slot => {
      const list = assetsFor(slot.key), cur = build.parts[slot.key];
      const on = id => slot.multi ? cur.includes(id) : cur === id;
      const none = slot.multi || slot.required ? '' : `<button class="lab-row${!cur ? ' selected' : ''}" data-build-focus data-build-asset="" data-build-slot="${slot.key}"><span>None</span><b>${!cur ? 'ACTIVE' : 'CHOOSE'}</b></button>`;
      return `<small class="lab-h">${esc(slot.name.toUpperCase())}</small><div class="build-parts">${none}${list.map(a => `<button class="lab-row${on(a.id) ? ' selected' : ''}" data-build-focus data-build-asset="${a.id}" data-build-slot="${slot.key}" title="${esc(a.note || '')}"><span>${esc(a.name)}</span><b>${on(a.id) ? (slot.multi ? 'ON' : 'ACTIVE') : (slot.multi ? 'ADD' : 'CHOOSE')}</b></button>`).join('')}</div>`;
    };
    const foundation = buildBase(build);
    const headSlots = BUILD_SLOTS.filter(sl => sl.stage === 'head' && !foundation.nativeHead), assetSlots = BUILD_SLOTS.filter(sl => sl.stage !== 'head');
    const filled = assetSlots.filter(sl => assetsFor(sl.key).length), open = assetSlots.filter(sl => !assetsFor(sl.key).length);
    body.innerHTML = `<section><small class="lab-h">1 · CHARACTER BASE</small><div class="build-parts">${Object.values(BUILD_PARTS).map(b => `<button class="lab-row${b.id === build.foundation ? ' selected' : ''}" data-build-focus data-build-base="${b.id}"><span>${esc(b.name)}</span><b>${b.id === build.foundation ? 'ACTIVE' : 'CHOOSE'}</b></button>`).join('')}</div>
        <p class="lab-note">${foundation.nativeHead ? 'Mori keeps its undead face, claws, torn trousers and native animations. Shape it into a new enemy, then save a named template.' : 'A generic humanoid on Rizer’s skeleton. Shape the body and choose matching head and hair assets.'}</p></section>
      <section><small class="lab-h">2 · BODY SLIDERS</small><div class="build-presets">${Object.keys(BODY_PRESETS).map(key => `<button class="lab-row${key === build.body.preset ? ' selected' : ''}" data-build-focus data-build-preset="${key}"><span>${key[0].toUpperCase() + key.slice(1)}</span><b>${key === build.body.preset ? 'ACTIVE' : ''}</b></button>`).join('')}</div>
      <p class="lab-note">Height changes overall size. Weight changes body fullness. Fine tune individual body parts below; animations follow the shape.</p>${Object.entries(BUILD_CONTROLS).map(([key, spec]) => { const value = build.body.proportions[key] ?? preset[key] ?? 1; return `<label class="build-slider"><span>${spec.name}<b data-build-value="${key}">${Math.round(value * 100)}%</b></span><input data-build-focus data-build-range="${key}" type="range" min="${spec.min}" max="${spec.max}" step="0.01" value="${value}"></label>`; }).join('')}</section>
      <section><small class="lab-h">3 · HEAD / FEATURES</small>${headSlots.map(slotHtml).join('')}<p class="lab-note">${foundation.nativeHead ? 'Mori’s original head and face are preserved. Use the Head slider to change their size.' : 'Choose a head shape and adjust its size with the Head slider.'}</p></section>
      <section><small class="lab-h">4 · MODULAR ASSETS</small>${filled.map(slotHtml).join('')}
        <small class="lab-h">OPEN SLOTS · READY FOR RIZER 1:1 ASSETS</small><div class="build-status">${open.map(sl => `<span>${esc(sl.name)}</span><b>empty</b>`).join('')}</div>
        <p class="lab-note">Each slot takes one asset (Accessories take several), swapped independently. Every asset is a skinned mesh on the Rizer skeleton, so it rides every animation and slider.</p></section>
      <section><small class="lab-h">5 · MATERIAL / COLOR</small><p class="lab-note">Save to playable characters, select your named variant in Skin Lab, and recolor its mesh parts with the AOV palette or hex colors. Export both its build and colors to keep the full character.</p></section>
      <section><small class="lab-h">6 · SAVED BUILD</small>
      <label class="build-label" for="build-name">CHARACTER NAME</label><input id="build-name" class="build-text" data-build-focus data-build-name maxlength="80" value="${esc(name)}" autocomplete="off">
      <div class="build-templates">${templates.length ? templates.map(t => `<button class="lab-row${t.id === selectedId ? ' selected' : ''}" data-build-focus data-build-load="${esc(t.id)}"><span>${esc(t.name)}</span><b>${t.id === selectedId ? 'LOADED' : 'LOAD'}</b></button>`).join('') : '<p class="lab-empty">No saved characters yet.</p>'}</div>
      <div class="lab-btns"><button class="lab-btn gold" data-build-focus data-build-action="save">Save</button><button class="lab-btn" data-build-focus data-build-action="duplicate">Duplicate</button><button class="lab-btn" data-build-focus data-build-action="new">New</button></div>
      <div class="lab-btns"><button class="lab-btn" data-build-focus data-build-action="rename">Rename</button><button class="lab-btn" data-build-focus data-build-action="delete">Delete</button><button class="lab-btn" data-build-focus data-build-action="reset">Reset</button></div>
      <div class="lab-btns"><button class="lab-btn" data-build-focus data-build-action="export">Export</button><button class="lab-btn" data-build-focus data-build-action="import">Import</button></div>
      <div class="lab-btns"><button class="lab-btn gold" data-build-focus data-build-action="playable">Save to playable characters</button></div>
      <p class="lab-note">Templates preserve the selected base, height, weight and body parts. Saved characters appear in Zyphone → Characters, Skin Lab and Anim Lab, using their base’s animations.</p></section>
      <section><small class="lab-h">PREVIEW</small><div class="build-parts">${MOTIONS.map(([k, label], i) => `<button class="lab-row${i === motion ? ' selected' : ''}" data-build-focus data-build-motion="${i}"><span>${label}</span><b>${i === motion ? 'PLAYING' : 'PLAY'}</b></button>`).join('')}
        <button class="lab-row${showHits ? ' selected' : ''}" data-build-focus data-build-action="hits"><span>Hitboxes</span><b>${showHits ? 'SHOWN' : 'HIDDEN'}</b></button></div>
        <p class="lab-note">The preview animates with its body's Anim Lab clips, so proportions can be checked in motion.</p></section>
      <section><small class="lab-h">WORLD</small><div class="lab-btns"><button class="lab-btn gold" data-build-focus data-build-action="place">Place in world</button><button class="lab-btn" data-build-focus data-build-action="clearPlaced">Clear placed (${placed.length})</button></div>
        <p class="lab-note">Builds this template with the character factory and stands it in front of Rizer, idling (up to ${MAX_PLACED}; not saved).</p></section>
      <section><small class="lab-h">ASSET LIBRARY · STATUS</small><div class="build-status"><span>Fit standard</span><b>${BUILD_STANDARD} · Rizer bind pose</b><span>Rig</span><b>1 · Mixamo humanoid (33 bones)</b><span>Slots</span><b>${BUILD_SLOTS.length}</b><span>Assets</span><b>${Object.keys(BUILD_ASSETS).length} · hair</b><span>Old NPC parts</span><b>Retired</b></div></section>`;
    paintFocus();
  }
  function saveRows() { try { writeBuildTemplates(templates); return true; } catch { toast?.('Browser storage is full; export your build'); return false; } }
  function action(which) {
    if (which === 'import') return file.click();
    if (which === 'hits') { showHits = !showHits; render(); return; }
    if (which === 'place') return place();
    if (which === 'clearPlaced') return clearPlaced();
    if (which === 'new') { selectedId = null; name = 'New character'; build = normalizeBuild(null); turn = 0; apply(); render(); return; }
    if (which === 'reset') { build = normalizeBuild({ foundation:build.foundation }); apply(); render(); toast?.('Build reset'); return; }
    if (which === 'export') { download(`rp7d-${(name.trim() || 'character').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}-build.json`, { format:'rp7d-build', version:2, standard:BUILD_STANDARD, name:name.trim() || 'Character', rig:BUILD_RIG, build }); toast?.('Build exported'); return; }
    if (which === 'duplicate') { selectedId = null; name = `${name.trim() || 'Character'} Copy`; render(); toast?.('Copy ready · Save to keep it'); return; }
    if (which === 'delete') { if (!selectedId) return toast?.('Load a saved template first'); templates = templates.filter(t => t.id !== selectedId); selectedId = null; saveRows(); render(); toast?.('Template deleted'); return; }
    if (!name.trim()) return toast?.('Name this character first');
    if (which === 'playable') {
      if (!onPlayable) return toast?.('Playable characters are not available here');
      const who = name.trim();
      Promise.resolve(onPlayable(who, normalizeBuild(build))).then(row => toast?.(`${who} ${row?.isNew === false ? 'updated in' : 'saved to'} playable characters · Zyphone → Characters to play as them`)).catch(e => { console.warn('[rp7d] save playable failed', e); toast?.('Could not save as a playable character'); });
      return;
    }
    if (which === 'rename') { if (!selectedId) return toast?.('Load a saved template first'); const row = templates.find(t => t.id === selectedId); if (row) row.name = name.trim(); saveRows(); render(); toast?.('Template renamed'); return; }
    if (which === 'save') { let row = templates.find(t => t.id === selectedId); if (!row) { row = { id:freshId(), name:'', build:null }; templates.push(row); selectedId = row.id; } row.name = name.trim(); row.build = normalizeBuild(build); saveRows(); persistDraft(); render(); toast?.(`${row.name} saved`); }
  }
  function load(id) { const row = templates.find(t => t.id === id); if (!row) return; selectedId = id; name = row.name; build = normalizeBuild(row.build); apply(); render(); toast?.(`${name} loaded`); }
  async function importFile(input) {
    try {
      const data = JSON.parse(await input.text());
      if (data?.format !== 'rp7d-build' || ![1, 2].includes(data.version) || data.rig !== BUILD_RIG || !data.build) throw new Error('Unsupported build file');
      selectedId = null; name = String(data.name || 'Imported character').slice(0,80); build = normalizeBuild(data.build); apply(); render(); // a v1 file keeps its body shape; retired bases and parts drop
      toast?.(data.version === 1 ? 'Old build imported on the Rizer standard · Save to keep it' : 'Build imported · Save to keep it');
    } catch (error) { toast?.(`Import failed: ${error.message}`); }
  }
  body.addEventListener('click', e => {
    const el = e.target.closest('[data-build-focus]'); if (!el) return;
    focus = controls().indexOf(el);
    if (el.dataset.buildBase) return setBase(el.dataset.buildBase);
    if (el.dataset.buildLoad) return load(el.dataset.buildLoad);
    if (el.dataset.buildPreset) { build.body.preset = el.dataset.buildPreset; build.body.proportions = {}; apply(); render(); return; }
    if (el.dataset.buildSlot) return toggleAsset(el.dataset.buildSlot, el.dataset.buildAsset);
    if (el.dataset.buildMotion) return setMotion(+el.dataset.buildMotion);
    if (el.dataset.buildAction) action(el.dataset.buildAction);
  });
  function setBase(id) {
    if (!BUILD_PARTS[id] || id === build.foundation) return;
    build.foundation = id; selectedId = null;
    if (name === 'New character' || name === 'New Mori') name = id === 'mori' ? 'New Mori' : 'New character';
    apply(); render();
  }
  function toggleAsset(slot, id) {
    const def = BUILD_SLOTS.find(s => s.key === slot); if (!def || (id && BUILD_ASSETS[id]?.slot !== slot)) return;
    if (!def.multi) build.parts[slot] = id || null;
    else { const list = build.parts[slot]; build.parts[slot] = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; }
    apply(); render();
  }
  function setMotion(i) { motion = (i + MOTIONS.length) % MOTIONS.length; preview?.actor.release(); render(); }
  body.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.buildName != null) { name = el.value.slice(0,80); persistDraft(); return; }
    if (el.dataset.buildRange) { build.body.proportions[el.dataset.buildRange] = Number(el.value); apply(); body.querySelector(`[data-build-value="${el.dataset.buildRange}"]`).textContent = `${Math.round(Number(el.value) * 100)}%`; }
  });
  file.addEventListener('change', () => { if (file.files[0]) importFile(file.files[0]); file.value = ''; });
  root.querySelector('[data-build-close]').addEventListener('click', () => close());
  root.addEventListener('mousedown', e => e.stopPropagation());
  root.addEventListener('wheel', e => e.stopPropagation(), { passive:true });
  let dragX = null;
  stage.addEventListener('pointerdown', e => { dragX = e.clientX; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => { if (dragX == null) return; turn += (e.clientX - dragX) * 0.012; dragX = e.clientX; if (preview) preview.pivot.rotation.y = turn; });
  stage.addEventListener('pointerup', () => { dragX = null; });
  stage.addEventListener('pointercancel', () => { dragX = null; });
  stage.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.max(3.1, Math.min(7, zoom + Math.sign(e.deltaY) * 0.3)); }, { passive:false });
  function move(n) { focus += n; paintFocus(true); }
  function activate() { const el = controls()[focus]; if (!el) return; if (el.dataset.buildBase) return setBase(el.dataset.buildBase); if (el.dataset.buildSlot) return toggleAsset(el.dataset.buildSlot, el.dataset.buildAsset); if (el.dataset.buildMotion) return setMotion(+el.dataset.buildMotion); if (el.dataset.buildAction) action(el.dataset.buildAction); else if (el.dataset.buildLoad) load(el.dataset.buildLoad); else if (el.dataset.buildPreset) { build.body.preset = el.dataset.buildPreset; build.body.proportions = {}; apply(); render(); } else el.focus(); }
  function adjust(n) { const el = controls()[focus]; if (!el?.dataset.buildRange) return; el.value = Math.max(Number(el.min), Math.min(Number(el.max), Number(el.value) + n * Number(el.step || 0.01))); el.dispatchEvent(new Event('input', { bubbles:true })); }
  function key(code, target) {
    if (!isOpen) return false;
    if (code === 'Escape') { close(); return true; }
    if (target?.matches?.('[data-build-name]')) return code !== 'Tab';
    if (code === 'ArrowUp') move(-1);
    else if (code === 'ArrowDown') move(1);
    else if (code === 'ArrowLeft') adjust(-1);
    else if (code === 'ArrowRight') adjust(1);
    else if (code === 'Enter' || code === 'Space') activate();
    else if (code === 'BracketLeft' || code === 'BracketRight') { turn += code === 'BracketLeft' ? -0.26 : 0.26; if (preview) preview.pivot.rotation.y = turn; }
    return true;
  }
  function pad(p) {
    if (!isOpen) return; if (p.edge(1)) return close(); if (p.edge(12)) move(-1); if (p.edge(13)) move(1); if (p.edge(14)) adjust(-1); if (p.edge(15)) adjust(1); if (p.edge(0)) activate();
    if (p.edge(3)) setMotion(motion + 1);
    if (Math.abs(p.lx || 0) > 0.15) { turn += p.lx * 0.05; if (preview) preview.pivot.rotation.y = turn; }
  }
  function tick() {
    const now = performance.now(), dt = Math.min(0.05, (now - (lastTime || now)) / 1000); lastTime = now;
    for (const ch of placed) ch.update(dt, 0); // placed builds idle even with the lab closed
    if (!isOpen || !renderer) return;
    if (preview) {
      const kind = MOTIONS[motion][0], A = preview.actor;
      if ((kind === 'punch' || kind === 'kick') && !A.shot && A.has(kind)) A.play(kind);
      preview.update(dt, kind === 'walk' && A.has('walk') ? A.naturalSpeed('walk') : kind === 'run' && A.has('run') ? A.naturalSpeed('run') : 0);
      if (showHits) { const rig = preview.hitRig(); rig.update(dt); hitG.draw(Object.values(rig.parts)); }
      if ((readoutT += dt) > 0.5) { readoutT = 0; readout(); }
    }
    hitG.visible = showHits && !!preview;
    const box = root.querySelector('[data-build-preview]');
    const w = Math.max(1, box.clientWidth), h = Math.max(1, box.clientHeight);
    if (renderer.domElement.width !== Math.round(w * renderer.getPixelRatio()) || renderer.domElement.height !== Math.round(h * renderer.getPixelRatio())) renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.position.set(0, 1.35, zoom); camera.lookAt(0, 1.35, 0); camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  function open() { if (isOpen) return; isOpen = true; root.hidden = false; ensureStage(); render(); loadPreview(); onOpen?.(); }
  function close() { if (!isOpen) return; isOpen = false; root.hidden = true; loadSerial++; preview?.dispose(); preview = null; onClose?.(); } // the preview only exists while the lab is open
  return { open, close, key, pad, tick, get isOpen() { return isOpen; }, getBuild: () => normalizeBuild(build), getTemplates: () => templates.map(t => ({ ...t, build:normalizeBuild(t.build) })),
    // for tools / tests
    get preview() { return preview; }, get placed() { return placed; }, get selectedId() { return selectedId; }, get name() { return name; } };
}
