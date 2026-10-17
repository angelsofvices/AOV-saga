import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { loadGLB } from './actor.js';

const SAVE_KEY = 'rp7d.andre.save.v1';
const DREAMLAND_CSS = `
#game.viridia-active{background:#fff;color:#171717}#game.viridia-active>#world{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:0}
#game.viridia-active>:not(#world):not(#viridia-ui){display:none!important}
#viridia-ui{position:absolute;inset:0;z-index:4;pointer-events:none;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#27251f}
#viridia-ui[hidden],#viridia-ui [hidden]{display:none!important}#viridia-ui header{position:absolute;left:clamp(20px,4vw,64px);top:clamp(18px,4vh,48px);display:grid;grid-template-columns:auto 1fr;column-gap:12px;align-items:center;color:#756443;letter-spacing:.2em;font-size:12px}
#viridia-ui header>span{grid-row:span 2;color:#c1a25d;font-size:24px}#viridia-ui header b{font-weight:700}#viridia-ui header small{font-size:9px;letter-spacing:.22em;color:#888176}
#viridia-ui .viridia-help{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);white-space:nowrap;color:#77736b;font-size:10px;letter-spacing:.16em}
#viridia-ui kbd{display:inline-block;border:1px solid #b7ad98;border-radius:4px;padding:4px 7px;background:#fff;color:#49463f;font:inherit;letter-spacing:.06em}#viridia-ui .viridia-help i{margin:0 9px;color:#c0a561;font-style:normal}
#viridia-ui .viridia-prompt{position:absolute;left:50%;bottom:clamp(62px,10vh,112px);transform:translateX(-50%);display:flex;align-items:center;gap:12px;padding:13px 18px;border:1px solid #c7b477;border-radius:5px;background:#fffffff0;box-shadow:0 8px 32px #5147251f;color:#39362e;font-size:12px;letter-spacing:.12em;white-space:nowrap}
#viridia-ui .viridia-chapters{pointer-events:auto;position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5vh 5vw;background:#fffffff0;backdrop-filter:blur(10px)}
#viridia-ui .viridia-chapter-head{text-align:center;margin-bottom:24px}#viridia-ui .viridia-chapter-head small{color:#9a7e3e;letter-spacing:.24em;font-size:10px}#viridia-ui .viridia-chapter-head h1{margin:8px 0;color:#24221e;font:500 clamp(27px,4vw,48px) Georgia,serif;letter-spacing:.13em}#viridia-ui .viridia-chapter-head p{margin:0;color:#77736b;font-size:13px}
#viridia-ui .viridia-chapter-list{width:min(820px,90vw);max-height:65vh;overflow:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:4px}
#viridia-ui .viridia-chapter{display:grid;grid-template-columns:40px 1fr;grid-template-rows:auto auto;align-items:center;text-align:left;gap:3px 12px;padding:12px 14px;border:1px solid #d8d2c4;border-radius:4px;background:#fff;color:#333;cursor:pointer}
#viridia-ui .viridia-chapter.selected,#viridia-ui .viridia-chapter:focus-visible{outline:2px solid #b89b58;border-color:#b89b58;background:#fbf8ef}#viridia-ui .viridia-chapter>span{grid-row:span 2;color:#b2985d;font:22px Georgia,serif}#viridia-ui .viridia-chapter>b{font-size:11px;letter-spacing:.12em}#viridia-ui .viridia-chapter>small{color:#777;font-size:10px}
#viridia-ui .viridia-chapters footer{display:flex;gap:24px;margin-top:18px;color:#777;font-size:9px;letter-spacing:.12em}#viridia-ui .viridia-notice{position:absolute;left:50%;bottom:10vh;transform:translateX(-50%);padding:10px 15px;background:#29271feF;color:#f4e8c5;border:1px solid #b89b58;font-size:11px;letter-spacing:.08em}
@media(max-width:620px){#viridia-ui .viridia-chapter-list{grid-template-columns:1fr;max-height:58vh}#viridia-ui .viridia-help{font-size:8px;letter-spacing:.04em}#viridia-ui .viridia-chapters footer{gap:9px;font-size:8px}}
`;
const CHAPTERS = [
  ['I', 'DARKENFELL', 'Lucienis'], ['II', 'FLESH & BLOOD', 'Malrec'], ['III', 'THE KINGS', 'Solion Highreach'],
  ['IV', 'THE BLOOD WAR', 'Audrelius Veridae X'], ['V', 'THE SECOND HEDONISTIC', 'Audrelius / King Amyros'],
  ['VI', 'THE IMMORTAL WAR', 'Amyra Silverstone'], ['VII', 'THE SUPERNOVA ERA', 'Valstorm / The Mech'],
  ['VIII', 'THE EQUINOX WAR', 'Andre Hart'], ['IX', 'THE AETHRYX EXPEDITION', 'Auraxion'],
  ['X', 'SKYFALL · MUTAGENESIS', 'Aurellyn / Auraxion']
];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createViridiaDreamland(host) {
  const style = document.createElement('style'); style.id = 'viridia-dreamland-style'; style.textContent = DREAMLAND_CSS; document.head.appendChild(style);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffffff');
  scene.fog = new THREE.Fog('#ffffff', 45, 180);
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 500);
  const hemi = new THREE.HemisphereLight('#ffffff', '#e8e8e8', 2.15); scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff7e7', 2.5); key.position.set(-8, 18, 10); key.castShadow = true; scene.add(key);
  const fill = new THREE.DirectionalLight('#e2edff', 0.8); fill.position.set(12, 8, -12); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.025; floor.receiveShadow = true; floor.name = 'Viridia_Dreamland_Infinite_White_Floor'; scene.add(floor);

  const player = new THREE.Group(); player.name = 'Andre_Hart'; scene.add(player);
  let model = null, bones = {}, mixer = null, modelActions = {}, activeAction = null;
  const avatar = new THREE.Group(); player.add(avatar);
  const book = buildBook(); book.position.set(2.2, 0.02, -1.1); scene.add(book);
  const focusLight = new THREE.PointLight('#fff0c8', 2.8, 7); focusLight.position.set(2.2, 1.5, -1.1); scene.add(focusLight);
  const focusRing = new THREE.Mesh(new THREE.RingGeometry(0.52, 0.57, 48), new THREE.MeshBasicMaterial({ color: '#d5b66e', transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  focusRing.rotation.x = -Math.PI / 2; focusRing.position.set(2.2, 0.015, -1.1); scene.add(focusRing);

  const ui = document.createElement('section'); ui.id = 'viridia-ui'; ui.className = 'viridia-ui'; ui.innerHTML = `
    <header><span>✦</span><b>BOOK OF VIRIDIA</b><small>ANDRE HART · DREAMLAND</small></header>
    <div class="viridia-prompt" id="viridia-prompt" hidden><kbd>E</kbd><span>OPEN THE BOOK OF VIRIDIA</span><kbd class="pad">○</kbd></div>
    <div class="viridia-help"><kbd>W A S D</kbd> MOVE <i>·</i> <kbd>SHIFT</kbd> RUN <i>·</i> <kbd>SPACE</kbd> JUMP <i>·</i> <kbd>E</kbd> INTERACT</div>
    <div class="viridia-chapters" id="viridia-chapters" hidden role="dialog" aria-modal="true" aria-label="Book of Viridia chapters">
      <div class="viridia-chapter-head"><small>THE BLOODLINE ECHOES</small><h1>BOOK OF VIRIDIA</h1><p>Ten chapters. One unbroken history.</p></div>
      <div class="viridia-chapter-list" id="viridia-chapter-list"></div>
      <footer><span>↑ ↓ SELECT</span><span>ENTER / ✕ OPEN</span><span>ESC / ○ CLOSE</span></footer>
    </div>
    <div class="viridia-notice" id="viridia-notice" hidden></div>`;
  host.appendChild(ui);
  const prompt = ui.querySelector('#viridia-prompt'), chapterPanel = ui.querySelector('#viridia-chapters'), chapterList = ui.querySelector('#viridia-chapter-list'), notice = ui.querySelector('#viridia-notice');
  let active = false, panelOpen = false, selected = 0, bookFound = false, chapter = null, clock = 0, noticeTimer = 0;
  const pos = new THREE.Vector3(), velocity = new THREE.Vector3(), camPos = new THREE.Vector3(), lookAt = new THREE.Vector3(0, 1, 0);
  let yaw = 0.45, pitch = 0.22, lastPad = [], lastMoveX = 0, lastMoveY = 0, interactWasDown = false, jumpWasDown = false, saveTimer = 0;

  function buildBook() {
    const root = new THREE.Group(); root.name = 'Physical_Book_of_Viridia';
    const gold = new THREE.MeshStandardMaterial({ color: '#c5a75d', metalness: 0.72, roughness: 0.28 });
    const cover = new THREE.MeshStandardMaterial({ color: '#163d2b', roughness: 0.48 });
    const pages = new THREE.MeshStandardMaterial({ color: '#f1e7cc', roughness: 0.9 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.94), gold); base.position.y = 0.075; root.add(base);
    const page = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.115, 0.87), pages); page.position.set(0.02, 0.115, 0); root.add(page);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.73, 0.055, 0.96), cover); lid.position.set(0, 0.17, 0); root.add(lid);
    const inset = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.009, 0.76), new THREE.MeshStandardMaterial({ color: '#20543a', roughness: 0.62 })); inset.position.set(0, 0.201, 0); root.add(inset);
    const sigil = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshStandardMaterial({ color: '#e8cc78', emissive: '#8c6d24', emissiveIntensity: 0.55, metalness: 0.45, roughness: 0.28 })); sigil.position.set(0, 0.28, 0); root.add(sigil);
    for (const z of [-0.32, 0.32]) { const band = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.16), gold); band.position.set(0, 0.211, z); root.add(band); }
    root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    root.userData.sigil = sigil; return root;
  }
  function buildFallbackAndre() {
    const skin = new THREE.MeshStandardMaterial({ color: '#754b36', roughness: 0.82 });
    const dark = new THREE.MeshStandardMaterial({ color: '#1a1b20', roughness: 0.76 });
    const cloth = new THREE.MeshStandardMaterial({ color: '#ddd8c9', roughness: 0.9 });
    const blue = new THREE.MeshStandardMaterial({ color: '#243b53', roughness: 0.82 });
    const gold = new THREE.MeshStandardMaterial({ color: '#b6934e', metalness: 0.32, roughness: 0.56 });
    const part = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
    const torso = part(new THREE.CapsuleGeometry(0.29, 0.42, 3, 7), cloth, avatar, 0, 1.04, 0);
    const head = part(new THREE.SphereGeometry(0.22, 9, 7), skin, avatar, 0, 1.62, 0);
    part(new THREE.SphereGeometry(0.23, 8, 5), dark, avatar, 0, 1.78, -0.02);
    part(new THREE.BoxGeometry(0.36, 0.16, 0.24), blue, avatar, 0, 0.7, 0);
    const arms = [], legs = [];
    for (const s of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(s * 0.34, 1.31, 0); avatar.add(arm);
      part(new THREE.CapsuleGeometry(0.085, 0.32, 2, 5), cloth, arm, 0, -0.2, 0); part(new THREE.SphereGeometry(0.075, 7, 5), skin, arm, 0, -0.4, 0); arms.push(arm);
      const leg = new THREE.Group(); leg.position.set(s * 0.13, 0.64, 0); avatar.add(leg);
      part(new THREE.CapsuleGeometry(0.11, 0.39, 2, 5), blue, leg, 0, -0.28, 0); part(new THREE.BoxGeometry(0.18, 0.1, 0.32), dark, leg, 0, -0.53, 0.065); legs.push(leg);
    }
    const mantle = part(new THREE.ConeGeometry(0.36, 0.8, 5, 1, true), cloth, avatar, 0, 1.05, -0.19); mantle.rotation.x = Math.PI;
    const sash = part(new THREE.BoxGeometry(0.12, 0.8, 0.035), gold, avatar, 0.12, 1.05, 0.275); sash.rotation.z = -0.35;
    return { torso, head, arms, legs };
  }
  function recolorAndre(root) {
    root.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const changed = mats.map(m => {
        const c = m.clone(); const n = `${o.name} ${m.name}`.toLowerCase();
        if (/skin|body/.test(n)) c.color.set('#80543b');
        else if (/pant|cloth|shirt|torso/.test(n)) c.color.set('#d9d3c1');
        else if (/band|belt|gold|trim/.test(n)) c.color.set('#ad8b4c');
        else if (/eye|mouth/.test(n)) c.color.set('#19191c');
        return c;
      });
      o.material = Array.isArray(o.material) ? changed : changed[0];
    });
  }
  async function loadAndre() {
    try {
      // Use the shared asset loader so this works both from the source project and
      // from the self-contained playtest, where models are embedded in the page.
      const gltf = await loadGLB('./assets/npc/npc_base.glb');
      model = cloneSkinned(gltf.scene); model.scale.setScalar(1.25); recolorAndre(model); avatar.add(model);
      bones = Object.fromEntries(['mixamorigLeftArm','mixamorigRightArm','mixamorigLeftUpLeg','mixamorigRightUpLeg','mixamorigHips'].map(n => [n, model.getObjectByName(n)]));
      mixer = new THREE.AnimationMixer(model);
      for (const clip of gltf.animations || []) modelActions[clip.name.toLowerCase()] = mixer.clipAction(clip);
    } catch (error) { console.warn('[viridia] Andre base model unavailable; using native low-poly stand-in', error); bones = buildFallbackAndre(); }
  }
  let readyState = 'loading';
  const ready = loadAndre().then(() => { saveTimer = 0; readyState = 'ready'; window.dispatchEvent(new Event('rp7d:viridia-ready')); });

  function renderChapters() {
    chapterList.innerHTML = CHAPTERS.map(([roman, name, perspective], i) => `<button class="viridia-chapter${i === selected ? ' selected' : ''}" data-index="${i}" type="button"><span>${roman}</span><b>${name}</b><small>${perspective}</small></button>`).join('');
    chapterList.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { selected = Number(b.dataset.index); renderChapters(); announce(`${CHAPTERS[selected][1]} · BLOODLINE ECHO NOT BUILT YET`); }));
  }
  function announce(text) { notice.textContent = text; notice.hidden = false; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => notice.hidden = true, 2600); }
  function openBook() { panelOpen = true; bookFound = true; chapterPanel.hidden = false; prompt.hidden = true; selected = chapter ? Math.max(0, CHAPTERS.findIndex(q => q[0] === chapter)) : 0; renderChapters(); save(); }
  function closeBook() { panelOpen = false; chapterPanel.hidden = true; }
  function save() {
    try { const data = { version: 1, campaign: 'viridia', character: 'andre', x: player.position.x, z: player.position.z, yaw, bookFound, chapter, updatedAt: Date.now() }; localStorage.setItem(SAVE_KEY, JSON.stringify(data)); return data; }
    catch (e) { return null; }
  }
  function enter(data = null) {
    active = true; panelOpen = false; bookFound = !!data?.bookFound; chapter = data?.chapter || null;
    player.position.set(Number.isFinite(data?.x) ? data.x : 0, 0, Number.isFinite(data?.z) ? data.z : 3.2); yaw = Number.isFinite(data?.yaw) ? data.yaw : 0.45;
    host.classList.add('viridia-active'); ui.hidden = false; chapterPanel.hidden = true; prompt.hidden = true;
    scene.updateMatrixWorld(true); followCamera(1); return true;
  }
  function exit() { active = false; closeBook(); ui.hidden = true; host.classList.remove('viridia-active'); }
  function followCamera(dt) {
    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    camPos.set(player.position.x - forward.x * 6.8, 4.0 + pitch * 2.2, player.position.z - forward.z * 6.8);
    camera.position.lerp(camPos, 1 - Math.exp(-dt * 5)); lookAt.set(player.position.x, 1.05, player.position.z); camera.lookAt(lookAt);
  }
  function update(dt, keys, pressed) {
    if (!active) return;
    clock += dt; dt = Math.min(dt, 0.05);
    const pad = [...(navigator.getGamepads?.() || [])].find(g => g?.connected);
    const b = i => !!pad?.buttons?.[i]?.pressed, edge = i => b(i) && !lastPad[i];
    const axisX = pad?.axes?.[0] || 0, axisY = pad?.axes?.[1] || 0;
    if (panelOpen) {
      if (pressed.has('ArrowUp') || pressed.has('KeyW') || edge(12)) { selected = (selected + CHAPTERS.length - 1) % CHAPTERS.length; renderChapters(); }
      if (pressed.has('ArrowDown') || pressed.has('KeyS') || edge(13)) { selected = (selected + 1) % CHAPTERS.length; renderChapters(); }
      if (pressed.has('Escape') || pressed.has('KeyX') || edge(1) || edge(2)) closeBook();
      if (pressed.has('Enter') || pressed.has('Space') || edge(0)) announce(`${CHAPTERS[selected][1]} · BLOODLINE ECHO NOT BUILT YET`);
      lastPad = pad?.buttons.map(q => q.pressed) || []; pressed.clear(); return;
    }
    const forward = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')) - axisY;
    const side = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) + axisX;
    const moving = Math.hypot(forward, side) > 0.12, running = keys.has('ShiftLeft') || keys.has('ShiftRight') || b(7);
    const speed = running ? 6.1 : 3.5, fx = Math.sin(yaw), fz = Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    const wish = new THREE.Vector3(fx * forward + rx * side, 0, fz * forward + rz * side); if (wish.lengthSq() > 1) wish.normalize();
    const jump = pressed.has('Space') || pressed.has('KeyX') || edge(0), interact = pressed.has('KeyE') || edge(1) || edge(2);
    velocity.x = THREE.MathUtils.damp(velocity.x, wish.x * speed, moving ? 10 : 14, dt); velocity.z = THREE.MathUtils.damp(velocity.z, wish.z * speed, moving ? 10 : 14, dt);
    player.position.x += velocity.x * dt; player.position.z += velocity.z * dt;
    player.position.y += velocity.y * dt; if (player.position.y > 0 || velocity.y > 0) velocity.y -= 18 * dt;
    if (player.position.y < 0) { player.position.y = 0; velocity.y = 0; }
    if (jump && player.position.y <= 0.001) velocity.y = 7.1;
    const angle = Math.atan2(wish.x, wish.z); if (moving) player.rotation.y += Math.atan2(Math.sin(angle - player.rotation.y), Math.cos(angle - player.rotation.y)) * Math.min(1, dt * 10);
    if (mixer && Object.keys(modelActions).length) {
      const wanted = moving ? running ? 'run' : 'walk' : 'idle';
      const next = Object.entries(modelActions).find(([name]) => name.includes(wanted))?.[1] || Object.values(modelActions)[0];
      if (next && next !== activeAction) { activeAction?.fadeOut(0.18); next.reset().fadeIn(0.18).play(); activeAction = next; }
      mixer.update(dt);
    } else if (model && bones.mixamorigHips) {
      const stride = moving ? Math.sin(clock * (running ? 10 : 7)) : 0;
      bones.mixamorigLeftUpLeg.rotation.x = stride * 0.38; bones.mixamorigRightUpLeg.rotation.x = -stride * 0.38;
      bones.mixamorigLeftArm.rotation.x = -stride * 0.28 - (moving ? 0.08 : 0); bones.mixamorigRightArm.rotation.x = stride * 0.28;
      bones.mixamorigHips.position.y = Math.abs(stride) * 0.025;
    } else if (bones.legs) {
      const stride = moving ? Math.sin(clock * (running ? 10 : 7)) : 0;
      bones.legs[0].rotation.x = stride * 0.42; bones.legs[1].rotation.x = -stride * 0.42;
      bones.arms[0].rotation.x = -stride * 0.3; bones.arms[1].rotation.x = stride * 0.3;
      bones.torso.position.y = 1.04 + Math.abs(stride) * 0.025;
    }
    book.rotation.y = 0.08 * Math.sin(clock * 0.55); if (book.userData.sigil) book.userData.sigil.rotation.y += dt * 0.7;
    const distance = Math.hypot(player.position.x - book.position.x, player.position.z - book.position.z);
    prompt.hidden = bookFound || distance > 2.3;
    if (interact && distance <= 2.3) openBook();
    if (pad && Math.abs(pad.axes?.[2] || 0) > 0.1) yaw += (pad.axes[2] || 0) * dt * 1.6;
    if (moving) saveTimer += dt; else saveTimer += dt * 0.2;
    if (saveTimer >= 5) { saveTimer = 0; save(); }
    followCamera(dt); lastPad = pad?.buttons.map(q => q.pressed) || []; pressed.clear();
  }
  renderChapters();
  return { scene, camera, ready, enter, exit, update, save, get active() { return active; }, get panelOpen() { return panelOpen; }, get readyState() { return readyState; }, hasSave() { try { const v = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return v?.campaign === 'viridia' && v?.character === 'andre'; } catch { return false; } }, getSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { return null; } } };
}
