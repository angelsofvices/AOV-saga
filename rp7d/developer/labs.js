// RP7D · LABS › RIZER: the player-character hub. Builds, skins and animations are edited ON the player (Rizer's
// real body), and the look he wears can be frozen into a named template: saved here, downloaded as JSON (drop the
// file on the game to wear it again), spawned into the world as a live clone, or swapped into (play as the clone).
//
//   look      { character, colors, hair, build? } · what a body wears (the Skin Lab presets + hairstyle)
//   template  { format:'rp7d-template', version:1, name, character, colors, hair, build, savedAt }
//   clone     a separate Actor in the world wearing a snapshot look; it idles, facing where it was set down
import * as THREE from 'three';
import { Actor, loadGLB } from './actor.js';
import { preloadBuild, applyBuildToActor, removeBuildAssets } from './build-library.js';
import { unregisterActor } from './anim-lib.js';

const TEMPLATES_KEY = 'rp7d.labs.templates.v1', MAX_CLONES = 6, MAX_TEMPLATES = 40;
export const TEMPLATE_FORMAT = 'rp7d-template';
const slug = s => (String(s || 'template').trim() || 'template').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'template';

export function createLabs({ scene, getRizer, characters, skinLab, setCharacter, savePlayable, toast, fx }) {
  let templates = [];
  try { const t = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]'); if (Array.isArray(t)) templates = t.filter(x => x && x.character); } catch {}
  const saveTemplates = () => { try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates)); } catch {} };
  const clones = [];
  let resetArmed = 0;

  // ── looks ──
  function snapshot() {
    const r = getRizer(), key = r.charKey, C = characters[key] || {};
    return { character: key, ...skinLab.lookOf(key), build: C.build || null };
  }
  async function wear(look, name) { // the player puts a look on: body first, then colours and hair
    let key = look.character;
    if (!characters[key] && look.build && savePlayable) key = (await savePlayable(name || look.name || 'Template', look.build)).key; // a build from another save
    if (!characters[key]) { toast?.(`Unknown character · ${look.character}`); return false; }
    await setCharacter(key);
    skinLab.setLook(key, look);
    return true;
  }

  // ── clones ──
  async function makeActor(look) {
    const C = characters[look.character]; if (!C) throw new Error('unknown character ' + look.character);
    const a = new Actor(await loadGLB(C.url), C.scale, C.animProfile || look.character);
    if (C.build) { await preloadBuild(C.build); applyBuildToActor(a, C.build); }
    await a.ready?.catch?.(() => {});
    skinLab.paintLook(a, look);
    return a;
  }
  function disposeClone(c) {
    unregisterActor(c.actor); c.actor.mixer.stopAllAction(); removeBuildAssets(c.actor); c.actor.pivot.removeFromParent();
    const i = clones.indexOf(c); if (i >= 0) clones.splice(i, 1);
  }
  async function spawnClone(look = snapshot(), at = null, name = '') {
    const r = getRizer();
    // beside him (to his right, a little forward), facing the way he faces: in view in the Labs, never in front of the camera
    const n = clones.length % 3, f = r.facing, side = 1.5 + n * 1.1, fwd = 0.4;
    const p = at || { x: r.position.x - Math.cos(f) * side + Math.sin(f) * fwd, y: r.position.y, z: r.position.z + Math.sin(f) * side + Math.cos(f) * fwd, facing: f };
    let actor; try { actor = await makeActor(look); } catch (e) { console.warn('[rp7d] Labs clone failed', e); toast?.('Could not build the clone'); return null; }
    actor.pivot.position.set(p.x, p.y, p.z); actor.pivot.rotation.y = p.facing; scene.add(actor.pivot);
    const c = { actor, look: JSON.parse(JSON.stringify(look)), name: name || look.name || characters[look.character]?.name || 'Clone' };
    clones.push(c); while (clones.length > MAX_CLONES) disposeClone(clones[0]);
    fx?.emit(p.x, p.y + 1.1, p.z, 22, { color: '#5ef2ff', speed: 1.8, up: 1.6, size: 0.25, life: 0.6, g: -1 });
    toast?.(`LIVE CLONE · ${c.name} · ${clones.length} in the world`);
    return c;
  }
  // Play as the clone: trade places and bodies. The player takes the clone's look and spot; a clone of who he was
  // stands where he stood.
  async function playAsClone() {
    const c = clones[clones.length - 1];
    if (!c) { toast?.('Spawn a live clone first'); return false; }
    const r = getRizer(), mine = snapshot(), here = { x: r.position.x, y: r.position.y, z: r.position.z, facing: r.facing };
    const there = c.actor.pivot.position.clone(), face = c.actor.pivot.rotation.y;
    if (!(await wear(c.look, c.name))) return false;
    disposeClone(c);
    r.position.set(there.x, there.y, there.z); r.vel?.set(0, 0, 0); r.facing = face;
    await spawnClone(mine, here, 'You, before');
    toast?.(`PLAYING AS · ${c.name}`);
    return true;
  }
  function clearClones() { const n = clones.length; while (clones.length) disposeClone(clones[0]); toast?.(n ? `${n} clone${n === 1 ? '' : 's'} cleared` : 'No clones in the world'); }

  // ── templates ──
  function download(t) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `rp7d-${slug(t.name)}-template.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function saveTemplate(name) {
    name = String(name || '').trim(); if (!name) { toast?.('Name the template first'); return null; }
    const t = { format: TEMPLATE_FORMAT, version: 1, name, ...snapshot(), savedAt: new Date().toISOString() };
    const i = templates.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
    if (i >= 0) templates[i] = t; else templates.unshift(t);
    templates.length = Math.min(templates.length, MAX_TEMPLATES); saveTemplates();
    download(t);
    toast?.(`TEMPLATE SAVED · ${name} · JSON downloaded (drop it on the game to wear it)`, 4200);
    return t;
  }
  function isTemplate(data) { return data?.format === TEMPLATE_FORMAT && typeof data.character === 'string'; }
  async function applyTemplate(data, { keep = true } = {}) { // a dropped file, or a saved row
    if (!isTemplate(data)) return { ok: false, reason: 'not an RP7D template' };
    if (!(await wear(data, data.name))) return { ok: false, reason: 'its character is not available' };
    if (keep && !templates.some(x => x.name === data.name && x.savedAt === data.savedAt)) { templates.unshift(data); templates.length = Math.min(templates.length, MAX_TEMPLATES); saveTemplates(); }
    toast?.(`WEARING · ${data.name}`);
    return { ok: true };
  }
  function deleteTemplate(i) { const t = templates.splice(i, 1)[0]; saveTemplates(); if (t) toast?.(`Template deleted · ${t.name}`); }

  // ── reset ──
  async function resetRizer() {
    if (performance.now() - resetArmed > 4000) { resetArmed = performance.now(); toast?.('RESET RIZER · press again to confirm (body, colours and hair back to default)'); return false; }
    resetArmed = 0;
    await setCharacter('rizer'); // queued behind any body change still loading
    skinLab.resetLook('rizer');
    const p = getRizer().position; fx?.emit(p.x, p.y + 1.1, p.z, 22, { color: '#ff3b4f', speed: 1.8, up: 1.6, size: 0.25, life: 0.6, g: -1 });
    toast?.('RIZER RESET · default body, colours and hair');
    return true;
  }

  function update(dt) { for (const c of clones) c.actor.update(dt, 0, true, 0); }
  return {
    snapshot, wear, spawnClone, playAsClone, clearClones, saveTemplate, applyTemplate, deleteTemplate, resetRizer, isTemplate, update, download,
    get templates() { return templates; }, get clones() { return clones; }, get resetArmed() { return performance.now() - resetArmed < 4000; }
  };
}
