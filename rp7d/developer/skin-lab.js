// Skin Lab: live, local color presets for the named materials on Rizer's rig.
// Each actor gets private material clones so a preview cannot recolor NPCs or
// another character that happens to share the same source GLB.
import * as THREE from 'three';

const STORAGE = 'rp7d.skinLab.v1';
// Sampled from the centre of each cell in the supplied canonical AOV 6×6 palette.
export const AOV_PALETTE = [
  '#8EA701','#3C365C','#D70024','#F81142','#87C4DA','#FFD402',
  '#030002','#606060','#1743AA','#3A65CC','#99DA7C','#536DDA',
  '#FE7AC9','#565099','#C9B32B','#44037D','#DA6403','#A4FE36',
  '#C2508C','#FFFFFF','#BA1144','#FBA7B6','#4CDA33','#BEFA2C',
  '#583522','#527031','#B19C75','#1F7941','#0C7EE1','#FFAB3B',
  '#99FABC','#00345D','#FBED37','#7D1C7A','#E27BB6','#F47301'
];
const LABELS = {
  R_skin:'Skin', R_hair:'Hair', R_cloth:'Main clothing', R_navy:'Blue clothing',
  R_gold:'Metal trim', R_leather:'Leather', R_boot:'Boots', R_gem:'Astral gems',
  R_eye:'Eyes', R_lip:'Lips', R_bone:'Bone accents',
  M_skin:'Mori skin', M_shade:'Skin shadows / ribs', M_cloth:'Torn trousers', M_rag:'Waist rags',
  M_socket:'Eye sockets', M_eye:'Eyes / glow', M_mouth:'Mouth', M_wound:'Wounds', M_nail:'Claws',
  N_skin:'Skin', N_cloth:'Trousers', N_skull:'Head', N_eye:'Eyes', N_brow:'Brows', N_mouth:'Mouth'
};
const editable = name => /^(R|M|N)_\w+$/.test(name || '');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hex = s => {
  const v = String(s || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(v)) return '#' + [...v].map(c => c + c).join('').toUpperCase();
  return /^[0-9a-f]{6}$/i.test(v) ? '#' + v.toUpperCase() : null;
};

export function createSkinLab({ getActor, getCharKey, characters, setCharacter, toast, onOpen, onClose }) {
  const root = document.createElement('aside');
  root.className = 'lab skin-lab'; root.hidden = true; root.setAttribute('aria-label', 'Skin Lab');
  root.innerHTML = `<header class="lab-head"><div><b>SKIN LAB</b><small>COLOR · TEST · SAVE</small></div><button class="lab-x" data-skin-close title="Close Skin Lab">✕</button></header>
    <div class="skin-intro">Colors update the selected character immediately. Each named variant keeps its own colors.</div>
    <div class="lab-body" data-skin-body></div>
    <footer class="lab-foot"><span class="k">↑↓ CHOOSE · ←→ COLORS · ENTER SELECT · ESC CLOSE</span><span class="p">D-PAD CHOOSE · ✕ SELECT · ○ CLOSE</span></footer>`;
  document.querySelector('#game').appendChild(root);
  const body = root.querySelector('[data-skin-body]');
  const actorMaterials = new WeakMap();
  let presets = {}, selected = 'R_hair', isOpen = false, focus = 0, currentActor = null;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) presets = saved;
  } catch {}
  const save = () => { try { localStorage.setItem(STORAGE, JSON.stringify(presets)); } catch {} };
  const items = () => [...body.querySelectorAll('[data-skin-focus]')];
  function prepare(actor) {
    if (!actor) return null;
    if (actorMaterials.has(actor)) return actorMaterials.get(actor);
    const sources = new Map(), parts = new Map();
    actor.model.traverse(o => {
      if (!o.isMesh || !o.material) return;
      const clone = m => {
        if (!editable(m?.name) || !m.color) return m;
        if (!sources.has(m)) sources.set(m, m.clone());
        const own = sources.get(m);
        if (!parts.has(own.name)) parts.set(own.name, { material: own, original: '#' + m.color.getHexString().toUpperCase(), emission: m.emissive?.clone() });
        return own;
      };
      o.material = Array.isArray(o.material) ? o.material.map(clone) : clone(o.material);
    });
    actorMaterials.set(actor, parts);
    return parts;
  }
  function apply(actor = getActor()) {
    if (!actor) return;
    const parts = prepare(actor), colors = presets[getCharKey()] || {};
    for (const [name, part] of parts) {
      const value = hex(colors[name]) || part.original;
      part.material.color.set(value);
      if ((name === 'R_gem' || name === 'M_eye') && part.material.emissive) part.material.emissive.set(hex(colors[name]) || part.emission || value);
      else if (part.emission && part.material.emissive) part.material.emissive.copy(part.emission);
    }
    currentActor = actor;
  }
  function paintFocus(scroll = true) {
    const list = items(); focus = Math.max(0, Math.min(focus, list.length - 1));
    list.forEach((el, i) => el.classList.toggle('focus', i === focus));
    if (scroll) list[focus]?.scrollIntoView({ block:'nearest' });
  }
  function render() {
    const actor = getActor(), key = getCharKey(), parts = prepare(actor) || new Map();
    if (!parts.has(selected)) selected = parts.keys().next().value || '';
    const colors = presets[key] || {}, active = parts.get(selected);
    const value = hex(colors[selected]) || active?.original || '#FFFFFF';
    body.innerHTML = `<section><small class="lab-h">PREVIEW ON</small>
      <button class="lab-row skin-character" data-skin-focus data-skin-character><span>Character</span><b>‹ ${esc(characters[key]?.name || key)} ›</b></button>
      <p class="lab-note">Choose Mori or a named Build Lab character here. Save a build to playable characters to give each enemy variant its own color set.</p></section>
      <section><small class="lab-h">MESH PARTS</small><div class="skin-parts">${[...parts].map(([name, part]) => {
        const color = hex(colors[name]) || part.original;
        return `<button class="lab-row skin-part${name === selected ? ' selected' : ''}" data-skin-focus data-skin-part="${esc(name)}"><span><i style="background:${color}"></i>${esc(LABELS[name] || name)}</span><b>${color}</b></button>`;
      }).join('')}</div></section>
      <section><small class="lab-h">AOV™ COLOR PALETTE · 6 × 6</small>
      <div class="skin-palette">${AOV_PALETTE.map((color, i) => `<button data-skin-focus data-skin-color="${color}" class="skin-swatch${color === value ? ' selected' : ''}" style="--swatch:${color}" title="${color} · cell ${i + 1}" aria-label="Apply ${color}"></button>`).join('')}</div>
      <label class="skin-hex-label" for="skin-hex">EXACT HEX COLOR</label>
      <div class="skin-hex-row"><span data-skin-preview style="background:${value}"></span><input id="skin-hex" data-skin-hex type="text" value="${value}" maxlength="7" spellcheck="false" autocomplete="off" inputmode="text" aria-label="Hex color for ${esc(LABELS[selected] || selected)}"><button class="lab-btn" data-skin-apply>APPLY</button></div>
      <p class="lab-note" data-skin-error>Choose a swatch or type #RRGGBB. The selected mesh part changes live.</p></section>
      <section><small class="lab-h">SAVE & RESTORE</small><div class="lab-btns">
        <button class="lab-btn" data-skin-focus data-skin-reset-part>Reset part</button>
        <button class="lab-btn" data-skin-focus data-skin-reset-all>Reset character</button>
        <button class="lab-btn" data-skin-focus data-skin-export>Export colors</button>
      </div><p class="lab-note">Presets are saved in this browser. Export a JSON file to share a look for a future NPC.</p></section>`;
    paintFocus(false);
  }
  function setColor(value) {
    const color = hex(value), key = getCharKey(), parts = prepare(getActor());
    if (!color || !parts?.has(selected)) return false;
    (presets[key] ||= {})[selected] = color;
    save(); apply(); render(); return true;
  }
  async function changeCharacter(dir) {
    const keys = Object.keys(characters), i = keys.indexOf(getCharKey());
    await setCharacter(keys[(i + dir + keys.length) % keys.length]);
    apply(); render();
  }
  function reset(partOnly) {
    const key = getCharKey();
    if (partOnly) { if (presets[key]) delete presets[key][selected]; }
    else delete presets[key];
    save(); apply(); render(); toast?.(partOnly ? 'Mesh part restored' : 'Character colors restored');
  }
  function exportColors() {
    const key = getCharKey(), data = JSON.stringify({ character:key, colors:presets[key] || {} }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type:'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `rp7d-${key}-skin.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast?.('Skin Lab colors exported');
  }
  // Load an exported skin ({ character, colors }) as that character's preset — what dragging a saved skin
  // file onto the game does (game.js). It replaces the preset, so parts it doesn't list go back to the original.
  function load(data, fallbackKey = getCharKey()) {
    const key = typeof data?.character === 'string' && data.character ? data.character : fallbackKey;
    if (!characters[key]) return { ok:false, reason:`it is for an unknown character (${key})` };
    const colors = {};
    for (const [part, value] of Object.entries(data?.colors && typeof data.colors === 'object' ? data.colors : {})) { const c = hex(value); if (editable(part) && c) colors[part] = c; }
    if (!Object.keys(colors).length) return { ok:false, reason:'it has no colors' };
    presets[key] = colors; save(); apply(); if (isOpen) render();
    return { ok:true, key, parts:Object.keys(colors).length };
  }
  function activate(el) {
    if (!el) return;
    if (el.dataset.skinCharacter != null) return changeCharacter(1);
    if (el.dataset.skinPart) { selected = el.dataset.skinPart; render(); return; }
    if (el.dataset.skinColor) return setColor(el.dataset.skinColor);
    if (el.dataset.skinResetPart != null) return reset(true);
    if (el.dataset.skinResetAll != null) return reset(false);
    if (el.dataset.skinExport != null) return exportColors();
  }
  body.addEventListener('click', e => {
    if (e.target.closest('[data-skin-apply]')) {
      const input = body.querySelector('[data-skin-hex]');
      if (!setColor(input.value)) body.querySelector('[data-skin-error]').textContent = 'Enter a valid #RRGGBB color.';
      return;
    }
    const el = e.target.closest('[data-skin-focus]'); if (!el) return;
    focus = items().indexOf(el);
    if (el.dataset.skinCharacter != null) return changeCharacter(e.clientX < el.getBoundingClientRect().left + el.clientWidth * 0.5 ? -1 : 1);
    activate(el);
  });
  body.addEventListener('input', e => {
    if (!e.target.matches('[data-skin-hex]')) return;
    const color = hex(e.target.value), preview = body.querySelector('[data-skin-preview]');
    e.target.classList.toggle('invalid', !color);
    if (color) { preview.style.background = color; (presets[getCharKey()] ||= {})[selected] = color; save(); apply(); }
  });
  body.addEventListener('change', e => { if (e.target.matches('[data-skin-hex]')) render(); });
  root.querySelector('[data-skin-close]').addEventListener('click', () => close());
  root.addEventListener('mousedown', e => e.stopPropagation());
  root.addEventListener('wheel', e => e.stopPropagation(), { passive:true });
  function move(delta) { focus += delta; paintFocus(); }
  function key(code, target) {
    if (!isOpen) return false;
    if (target?.matches?.('[data-skin-hex]')) {
      if (code === 'Escape') { target.blur(); close(); }
      else if (code === 'Enter') { setColor(target.value); target.blur(); }
      return true;
    }
    if (code === 'Escape') close();
    else if (code === 'ArrowUp') move(items()[focus]?.dataset.skinColor ? -6 : -1);
    else if (code === 'ArrowDown') move(items()[focus]?.dataset.skinColor ? 6 : 1);
    else if (code === 'ArrowLeft' || code === 'ArrowRight') {
      if (items()[focus]?.dataset.skinCharacter != null) changeCharacter(code === 'ArrowLeft' ? -1 : 1);
      else move(code === 'ArrowLeft' ? -1 : 1);
    } else if (code === 'Enter' || code === 'Space') activate(items()[focus]);
    else return false;
    return true;
  }
  function pad(p) {
    if (!isOpen) return;
    if (p.edge(1)) return close();
    if (p.edge(12)) move(items()[focus]?.dataset.skinColor ? -6 : -1);
    if (p.edge(13)) move(items()[focus]?.dataset.skinColor ? 6 : 1);
    if (p.edge(14) || p.edge(15)) {
      if (items()[focus]?.dataset.skinCharacter != null) changeCharacter(p.edge(14) ? -1 : 1);
      else move(p.edge(14) ? -1 : 1);
    }
    if (p.edge(0)) activate(items()[focus]);
  }
  function tick() { if (getActor() !== currentActor) { apply(); if (isOpen) render(); } }
  function open() { if (isOpen) return; isOpen = true; root.hidden = false; apply(); render(); onOpen?.(); }
  function close() { if (!isOpen) return; isOpen = false; root.hidden = true; onClose?.(); }
  return { open, close, key, pad, tick, apply, load, get isOpen() { return isOpen; } };
}
